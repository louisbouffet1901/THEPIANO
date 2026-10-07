// Analyse d'une prise MIDI par rapport à la partition.
// Sans DOM : s'exécute dans un Web Worker (analysis/worker.js) et dans Node pour les tests.
//
// 1. Alignement : chaque groupe de notes simultanées de la partition « consomme » une suite de notes jouées
//    (programmation dynamique, tolérante au rubato, aux fausses notes, aux oublis et aux notes en trop).
//    Deux passes : la première avec une estimation grossière du tempo, la seconde avec la courbe de tempo
//    déduite de la première.
// 2. Mesures : justesse par note et par mesure, tempo et hésitations, précision rythmique (rapports de
//    durées, contretemps, pointés), mains ensemble, équilibre mélodie / accompagnement, pédale.
// 3. Diagnostic : les 2 ou 3 problèmes les plus importants, chacun avec sa cause probable et un exercice.
import { noteNameFr, median, mean, stdev } from './util.js';

/* ------------------------------------------------------------------ */
/* Partition : groupes de notes simultanées, mesures et temps          */
/* ------------------------------------------------------------------ */
export function barTools(meta) {
  if (meta.bars && meta.bars.length) return explicitBars(meta);
  const { barQ, pickupQ = 0, firstBar = 1, beatQ } = meta;
  const barOf = t => {
    if (pickupQ > 0) return t < pickupQ - 1e-6 ? firstBar : firstBar + 1 + Math.floor((t - pickupQ + 1e-6) / barQ);
    return firstBar + Math.floor((t + 1e-6) / barQ);
  };
  const barStart = m => (pickupQ > 0 ? (m === firstBar ? 0 : pickupQ + (m - firstBar - 1) * barQ) : (m - firstBar) * barQ);
  const beatOf = t => {
    const m = barOf(t);
    // levée : on compte les temps comme s'ils finissaient la mesure
    const start = pickupQ > 0 && m === firstBar ? pickupQ - barQ : barStart(m);
    return (t - start) / beatQ + 1;
  };
  return { barOf, barStart, beatOf };
}

/** Mesures données une à une (partition importée : numéros de la partition, changements de mesure). */
function explicitBars(meta) {
  const bars = meta.bars;
  const idxAt = t => {
    let lo = 0, hi = bars.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (bars[mid].q <= t + 1e-6) lo = mid; else hi = mid - 1; }
    return lo;
  };
  const barOf = t => bars[idxAt(t)].n;
  const barStart = m => { const b = bars.find(x => x.n >= m); const last = bars[bars.length - 1]; return b ? b.q : last.q + last.len; };
  const beatOf = t => {
    const i = idxAt(t), b = bars[i];
    const nominal = b.nominal || b.len;
    // levée : on compte les temps comme s'ils finissaient la mesure
    const start = i === 0 && b.len < nominal - 1e-6 ? b.q + b.len - nominal : b.q;
    return (t - start) / (b.beatQ || meta.beatQ || 1) + 1;
  };
  return { barOf, barStart, beatOf };
}

export function buildGroups(expected, meta) {
  const { barOf, beatOf } = barTools(meta);
  const evs = expected.map((e, idx) => ({ ...e, idx })).sort((a, b) => a.t - b.t || a.pitch - b.pitch);
  const groups = [];
  for (const e of evs) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(g.t - e.t) < 0.02) g.notes.push(e);
    else groups.push({ t: e.t, notes: [e] });
  }
  for (const g of groups) {
    g.pitches = g.notes.map(n => n.pitch);
    g.m = barOf(g.t);
    g.beat = beatOf(g.t);
    g.grace = g.notes.every(n => n.grace);
    // note jouée juste après des petites notes : son attaque est retardée exprès, on l'écarte des mesures de rythme
    g.afterGrace = g.notes.some(n => n.ag > 0 && !n.gterm);
    g.arp = g.notes.some(n => n.arp);
    g.orn = g.notes.some(n => n.orn);
    g.ornPitches = new Set();
    for (const n of g.notes) if (n.orn) { g.ornPitches.add(n.pitch); if (n.orn.upper) g.ornPitches.add(n.orn.upper); if (n.orn.lower) g.ornPitches.add(n.orn.lower); }
    g.hands = new Set(g.notes.map(n => n.hand));
    g.dur = Math.max(...g.notes.map(n => n.dur));
  }
  groups.forEach((g, i) => { g.i = i; });
  // notes d'ornement encore en cours (trille longue) : admises à bas coût dans les groupes suivants
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    g.ornOk = new Set(g.ornPitches);
    for (let k = i - 1; k >= 0 && k >= i - 24; k--) {
      const o = groups[k];
      if (!o.orn) continue;
      const end = Math.max(...o.notes.filter(n => n.orn).map(n => n.t + n.dur));
      if (end > g.t + 1e-6) for (const p of o.ornPitches) g.ornOk.add(p);
    }
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/* Alignement                                                          */
/* ------------------------------------------------------------------ */
const C = {
  miss: 1.0, missGrace: 0.35, extra: 0.8, extraOrn: 0.05, lead: 0.15, trail: 0.15,
  spreadFree: 90, spreadArp: 450, spreadW: 0.5,
};

/** Associe les notes d'une suite jouée aux hauteurs d'un groupe. */
function matchRun(g, run) {
  const used = new Array(run.length).fill(false);
  const pairs = []; // [indice note attendue dans g.notes, indice dans run]
  g.notes.forEach((n, k) => {
    let best = -1;
    for (let r = 0; r < run.length; r++) if (!used[r] && run[r].pitch === n.pitch) { best = r; break; }
    if (best >= 0) { used[best] = true; pairs.push([k, best]); }
  });
  const extras = [];
  for (let r = 0; r < run.length; r++) if (!used[r]) extras.push(r);
  return { pairs, extras };
}

/* Coût d'une suite notes[from..to[ pour le groupe g (sans allocation : appelé des millions de fois). */
const _used = new Uint8Array(512);
const _miss = new Int32Array(64);
const _ons = new Float64Array(64);
function runCost(g, notes, from, to, expectT, tol, wT) {
  const len = to - from;
  if (len > 512) return Infinity;
  _used.fill(0, 0, len);
  let matched = 0, nMiss = 0, onN = 0, onMin = Infinity, onMax = -Infinity;
  const gn = g.notes;
  for (let k = 0; k < gn.length; k++) {
    const p = gn[k].pitch;
    let r = 0;
    for (; r < len; r++) if (!_used[r] && notes[from + r].pitch === p) break;
    if (r < len) {
      _used[r] = 1; matched++;
      const on = notes[from + r].on;
      if (onN < 64) _ons[onN++] = on;
      if (on < onMin) onMin = on; if (on > onMax) onMax = on;
    } else if (nMiss < 64) _miss[nMiss++] = p;
  }
  let c = (gn.length - matched) * (g.grace ? C.missGrace : C.miss);
  // notes en trop ; fausse note voisine d'une note manquante : substitution (un peu moins chère)
  for (let r = 0; r < len; r++) {
    if (_used[r]) continue;
    const p = notes[from + r].pitch;
    if (g.ornOk.has(p)) { c += C.extraOrn; continue; }
    let near = -1;
    for (let k = 0; k < nMiss; k++) if (_miss[k] !== -999 && Math.abs(_miss[k] - p) <= 2) { near = k; break; }
    if (near >= 0) { c += C.extra - 0.4; _miss[near] = -999; } else c += C.extra;
  }
  if (matched) {
    const spread = onMax - onMin;
    const free = g.arp || g.orn ? C.spreadArp : C.spreadFree;
    if (spread > free) c += C.spreadW * Math.min(3, (spread - free) / 100);
    if (expectT != null && wT > 0) {
      // médiane des attaques
      const a = Array.prototype.slice.call(_ons, 0, onN).sort((x, y) => x - y);
      const tOn = onN % 2 ? a[(onN - 1) >> 1] : (a[onN / 2 - 1] + a[onN / 2]) / 2;
      c += wT * Math.min(2, Math.abs(tOn - expectT) / tol);
    }
  }
  return c;
}

/**
 * Programmation dynamique : D[i][j] = coût minimal pour aligner les i premiers groupes sur les j premières notes.
 * timeOf(g) donne l'instant attendu (ms) du groupe g. Bande : la j-ième note jouée correspond, à quelques erreurs
 * près, au même rang dans la partition — indépendant du tempo.
 */
function dpAlign(groups, notes, timeOf, tolOf, wT) {
  const I = groups.length, J = notes.length;
  const W = J + 1;
  const D = new Float64Array((I + 1) * W).fill(Infinity);
  const back = new Int16Array((I + 1) * W);
  const totalExp = groups.reduce((a, g) => a + g.notes.length, 0);
  const banded = J <= 1.6 * totalExp + 40;
  const cum = new Int32Array(I + 1);
  for (let i = 0; i < I; i++) cum[i + 1] = cum[i] + groups[i].notes.length;
  const lo = i => (banded ? Math.max(0, Math.floor(cum[i] - 40 - 0.25 * cum[i])) : 0);
  const hi = i => (banded ? Math.min(J, Math.ceil(cum[i] + 60 + 0.35 * cum[i])) : J);
  for (let j = 0; j <= J; j++) D[j] = j * C.lead; // notes jouées avant le début (échauffement, essai)
  for (let i = 1; i <= I; i++) {
    const g = groups[i - 1];
    const kmax = Math.min(J, g.notes.length + 4 + (g.orn ? 28 : 0) + (g.arp ? 2 : 0));
    const expectT = timeOf ? timeOf(g) : null;
    const tol = tolOf ? tolOf(g) : 1;
    const row = i * W, prev = (i - 1) * W;
    const emptyCost = g.notes.length * (g.grace ? C.missGrace : C.miss);
    const j0 = lo(i), j1 = hi(i);
    for (let j = j0; j <= j1; j++) {
      let best = D[prev + j] + emptyCost, bk = 0;
      for (let k = 1; k <= kmax && k <= j; k++) {
        const p = D[prev + j - k];
        if (p === Infinity || p >= best) continue;
        const c = p + runCost(g, notes, j - k, j, expectT, tol, wT);
        if (c < best) { best = c; bk = k; }
      }
      D[row + j] = best; back[row + j] = bk;
    }
  }
  // fin : notes jouées après la dernière note de la partition (peu coûteuses)
  let jEnd = 0, bestEnd = Infinity;
  for (let j = 0; j <= J; j++) {
    const c = D[I * W + j] + (J - j) * C.trail;
    if (c < bestEnd) { bestEnd = c; jEnd = j; }
  }
  const runs = new Array(I);
  let j = jEnd;
  for (let i = I; i >= 1; i--) {
    const k = back[i * W + j];
    runs[i - 1] = { from: j - k, to: j };
    j -= k;
  }
  return { runs, leadEnd: j, trailStart: jEnd, cost: bestEnd };
}

/** Courbe de tempo (ms en fonction du temps-partition) par interpolation linéaire robuste. */
function timeMapFrom(points) {
  // points : [{ t, ms }] triés ; on écarte les points aberrants par rapport à une médiane glissante
  const pts = points.filter(p => Number.isFinite(p.ms)).sort((a, b) => a.t - b.t);
  if (pts.length < 2) return null;
  const clean = [];
  for (let i = 0; i < pts.length; i++) {
    const lo = Math.max(0, i - 3), hi = Math.min(pts.length, i + 4);
    const win = pts.slice(lo, hi);
    if (win.length >= 3) {
      // pente locale médiane
      const slopes = [];
      for (let a = 0; a < win.length; a++) for (let b = a + 1; b < win.length; b++) if (win[b].t - win[a].t > 1e-6) slopes.push((win[b].ms - win[a].ms) / (win[b].t - win[a].t));
      const s = median(slopes);
      const preds = win.filter(p => p !== pts[i]).map(p => p.ms + (pts[i].t - p.t) * s);
      if (Math.abs(pts[i].ms - median(preds)) > Math.max(250, 0.6 * Math.abs(s))) continue;
    }
    clean.push(pts[i]);
  }
  const P = clean.length >= 2 ? clean : pts;
  const slope0 = (P[P.length - 1].ms - P[0].ms) / Math.max(1e-6, P[P.length - 1].t - P[0].t);
  return t => {
    if (t <= P[0].t) return P[0].ms + (t - P[0].t) * slope0;
    if (t >= P[P.length - 1].t) return P[P.length - 1].ms + (t - P[P.length - 1].t) * slope0;
    let a = 0, b = P.length - 1;
    while (b - a > 1) { const mid = (a + b) >> 1; if (P[mid].t <= t) a = mid; else b = mid; }
    const f = (t - P[a].t) / Math.max(1e-6, P[b].t - P[a].t);
    return P[a].ms + f * (P[b].ms - P[a].ms);
  };
}

function groupOnsets(groups, notes, runs) {
  return groups.map((g, i) => {
    const run = notes.slice(runs[i].from, runs[i].to);
    const { pairs } = matchRun(g, run);
    return pairs.length ? median(pairs.map(([, r]) => run[r].on)) : null;
  });
}

export function align(groups, notes, meta) {
  const J = notes.length;
  if (!groups.length) return null;
  // Passe 1 : tempo moyen estimé sur la durée jouée
  const span = J > 1 ? notes[J - 1].on - notes[0].on : 0;
  const tSpan = Math.max(1e-6, groups[groups.length - 1].t - groups[0].t);
  const msPerQ0 = span > 0 ? span / tSpan : 60000 / (meta.qpm || 60);
  const t0 = groups[0].t, on0 = J ? notes[0].on : 0;
  const pass1 = dpAlign(groups, notes, g => on0 + (g.t - t0) * msPerQ0, () => Math.max(1500, 0.25 * span), 0.4);
  // Passe 2 : courbe de tempo issue de la passe 1
  const ons1 = groupOnsets(groups, notes, pass1.runs);
  const map1 = timeMapFrom(groups.map((g, i) => ({ t: g.t, ms: g.grace || g.orn || g.afterGrace ? NaN : ons1[i] })).filter(p => p.ms != null));
  if (!map1) return { ...pass1, timeMap: null };
  const msPerQ = q => Math.max(80, Math.abs(map1(q + 0.5) - map1(q - 0.5)));
  const pass2 = dpAlign(groups, notes, g => map1(g.t), g => Math.max(140, 0.35 * msPerQ(g.t) * (meta.beatQ || 1)), 0.6);
  const ons2 = groupOnsets(groups, notes, pass2.runs);
  const map2 = timeMapFrom(groups.map((g, i) => ({ t: g.t, ms: g.grace || g.orn || g.afterGrace ? NaN : ons2[i] })).filter(p => p.ms != null)) || map1;
  return { ...pass2, timeMap: map2 };
}

/* ------------------------------------------------------------------ */
/* Mesures                                                             */
/* ------------------------------------------------------------------ */
const NAME = m => noteNameFr(m);

function linreg(xs, ys) {
  const n = xs.length;
  if (n < 2) return { a: 0, b: 0, r2: 0 };
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  const b = sxx ? sxy / sxx : 0;
  return { a: my - b * mx, b, r2: sxx && syy ? (sxy * sxy) / (sxx * syy) : 0 };
}

const fmtBeat = (m, beat) => {
  const b = Math.round(beat * 4) / 4;
  return Number.isInteger(b) ? `m. ${m}, temps ${b}` : `m. ${m}`;
};
const measuresLabel = ms => {
  const u = [...new Set(ms)].sort((a, b) => a - b);
  if (!u.length) return '';
  const parts = [];
  let s = u[0], p = u[0];
  for (let i = 1; i <= u.length; i++) {
    if (i < u.length && u[i] === p + 1) { p = u[i]; continue; }
    parts.push(s === p ? `${s}` : `${s}-${p}`);
    if (i < u.length) { s = p = u[i]; }
  }
  return (u.length > 1 ? 'mesures ' : 'mesure ') + parts.join(', ');
};

export function analyzeTake(input) {
  const meta = { barQ: 4, beatQ: 1, pickupQ: 0, firstBar: 1, qpm: 60, ...input.meta };
  const notes = (input.notes || []).filter(n => n.pitch > 0).slice().sort((a, b) => a.on - b.on || a.pitch - b.pitch);
  const pedalEv = (input.pedal || []).slice().sort((a, b) => a.t - b.t);
  const groups = buildGroups(input.expected || [], meta);
  if (!groups.length) return { ok: false, reason: 'Partition vide.' };
  if (notes.length < 3) return { ok: false, reason: 'Pas assez de notes jouées (au moins 3).' };
  const al = align(groups, notes, meta);
  const { runs, timeMap } = al;
  const { barStart } = barTools(meta);

  /* --- notes : justes, fausses, oubliées ; notes en trop --- */
  const noteRes = new Array((input.expected || []).length).fill(null);
  const extras = [];
  const perGroup = groups.map((g, i) => {
    const run = notes.slice(runs[i].from, runs[i].to);
    const { pairs, extras: ex } = matchRun(g, run);
    const matched = pairs.map(([k, r]) => ({ e: g.notes[k], p: run[r] }));
    const missed = g.notes.filter((_, k) => !pairs.some(([kk]) => kk === k));
    const exNotes = ex.map(r => run[r]).filter(p => !g.ornOk.has(p.pitch));
    // fausses notes : une note en trop proche (≤ 2 demi-tons) d'une note oubliée du même groupe
    const wrong = [];
    const missLeft = missed.slice();
    const exLeft = [];
    for (const p of exNotes) {
      let bi = -1, bd = 9;
      missLeft.forEach((e, k) => { const d = Math.abs(e.pitch - p.pitch); if (d <= 2 && d < bd) { bd = d; bi = k; } });
      if (bi >= 0) { wrong.push({ e: missLeft[bi], p }); missLeft.splice(bi, 1); } else exLeft.push(p);
    }
    const ons = matched.map(x => x.p.on);
    return { g, matched, wrong, missed: missLeft, extra: exLeft, onset: ons.length ? median(ons) : null };
  });
  // Une fausse note peut avoir été rangée dans le groupe voisin : on apparie les oublis et les notes en trop
  // proches dans le temps (≤ 0,3 temps) et en hauteur (≤ 2 demi-tons).
  if (timeMap) {
    const pool = [];
    perGroup.forEach((x, gi) => x.extra.forEach(p => pool.push({ p, gi })));
    for (const x of perGroup) {
      if (!x.missed.length) continue;
      const expMs = timeMap(x.g.t);
      const winMs = Math.max(150, 0.3 * Math.abs(timeMap(x.g.t + meta.beatQ) - expMs));
      for (const e of x.missed.slice()) {
        let best = -1, bd = Infinity;
        pool.forEach((c, k) => {
          if (c.used) return;
          const dp = Math.abs(c.p.pitch - e.pitch), dt = Math.abs(c.p.on - expMs);
          if (dp <= 2 && dt <= winMs && dp * 1000 + dt < bd) { bd = dp * 1000 + dt; best = k; }
        });
        if (best >= 0) {
          const c = pool[best]; c.used = true;
          x.wrong.push({ e, p: c.p });
          x.missed.splice(x.missed.indexOf(e), 1);
          const owner = perGroup[c.gi];
          owner.extra.splice(owner.extra.indexOf(c.p), 1);
        }
      }
    }
  }
  for (const x of perGroup) {
    const g = x.g;
    for (const { e, p } of x.matched) noteRes[e.idx] = { status: 'ok', m: g.m, on: p.on, vel: p.vel, off: p.off };
    for (const { e, p } of x.wrong) noteRes[e.idx] = { status: 'wrong', m: g.m, expected: e.pitch, played: p.pitch, on: p.on, vel: p.vel };
    for (const e of x.missed) noteRes[e.idx] = { status: 'miss', m: g.m, expected: e.pitch };
    for (const p of x.extra) extras.push({ pitch: p.pitch, on: p.on, m: g.m });
  }
  // notes jouées avant le début ou après la fin : signalées à part, sans compter comme erreurs
  const before = notes.slice(0, al.leadEnd).length;
  const after = notes.slice(al.trailStart).length;

  const total = noteRes.filter(Boolean).length;
  const okN = noteRes.filter(r => r && r.status === 'ok').length;
  const wrongN = noteRes.filter(r => r && r.status === 'wrong').length;
  const missN = noteRes.filter(r => r && r.status === 'miss').length;
  const graceIdx = new Set((input.expected || []).map((e, i) => (e.grace ? i : -1)).filter(i => i >= 0));
  const totalMain = noteRes.filter((r, i) => r && !graceIdx.has(i)).length;
  const okMain = noteRes.filter((r, i) => r && r.status === 'ok' && !graceIdx.has(i)).length;

  /* --- tempo : instants des temps, courbe, hésitations --- */
  const beatQ = meta.beatQ;
  const anchors = perGroup.filter(x => x.onset != null && !x.g.grace && !x.g.orn && !x.g.afterGrace).map(x => ({ t: x.g.t, ms: x.onset }));
  const tFirst = groups[0].t, tLast = groups[groups.length - 1].t;
  const beats = [];
  if (timeMap && anchors.length >= 2) {
    const firstBeat = Math.ceil((anchors[0].t - (meta.pickupQ % beatQ)) / beatQ - 1e-6) * beatQ + (meta.pickupQ % beatQ);
    for (let q = firstBeat; q <= anchors[anchors.length - 1].t + 1e-6; q += beatQ) beats.push({ q, ms: timeMap(q) });
  }
  const ibis = [];
  for (let k = 1; k < beats.length; k++) ibis.push({ q: beats[k - 1].q, ms: beats[k].ms - beats[k - 1].ms });
  const ibiMed = ibis.length ? median(ibis.map(x => x.ms)) : (60000 / meta.qpm) * beatQ;
  const bpm = 60000 / ibiMed;
  const targetBpm = (meta.qpm || 60) / beatQ;
  const tempoCurve = ibis.map(x => ({ q: x.q, m: barTools(meta).barOf(x.q + 1e-6), bpm: 60000 / x.ms }));
  // hésitations : un temps nettement plus long que ses voisins
  const hesitations = [];
  for (let k = 0; k < ibis.length; k++) {
    const lo = Math.max(0, k - 4), hi = Math.min(ibis.length, k + 5);
    const neigh = ibis.slice(lo, hi).filter((_, idx) => lo + idx !== k).map(x => x.ms);
    if (neigh.length < 3) continue;
    const ref = median(neigh);
    if (ibis[k].ms > 1.38 * ref && ibis[k].ms - ref > 120) {
      const m = barTools(meta).barOf(ibis[k].q + 1e-6);
      hesitations.push({ q: ibis[k].q, m, beat: barTools(meta).beatOf(ibis[k].q + beatQ - 1e-6), ratio: ibis[k].ms / ref });
    }
  }
  // dérive : accélération ou ralentissement d'ensemble (hors hésitations)
  let drift = 0, driftR2 = 0;
  if (ibis.length >= 6) {
    const hq = new Set(hesitations.map(x => x.q));
    const pts = ibis.filter(x => !hq.has(x.q));
    const lr = linreg(pts.map((_, k) => k), pts.map(x => Math.log(x.ms)));
    drift = Math.exp(-lr.b * (pts.length - 1)) - 1; // > 0 : accélère
    driftR2 = lr.r2;
  }

  /* --- rythme : chaque attaque hors temps, placée entre les deux temps qui l'encadrent --- */
  const rhythmPts = [];
  const seq = perGroup.filter(x => x.onset != null && !x.g.grace && !x.g.orn && !x.g.afterGrace);
  const off0 = (meta.pickupQ || 0) % beatQ;
  const onBeat = t => Math.abs((((t - off0) / beatQ) % 1 + 1) % 1) < 0.02 || Math.abs((((t - off0) / beatQ) % 1 + 1) % 1 - 1) < 0.02;
  const atBeat = new Map(); // temps-partition du temps -> instant joué (groupe présent sur le temps)
  for (const x of seq) if (onBeat(x.g.t)) atBeat.set(Math.round(x.g.t * 1000), x.onset);
  const beatTime = q => atBeat.get(Math.round(q * 1000)) ?? null;
  const handNotesAt = (hand, t) => perGroup.some(y => Math.abs(y.g.t - t) < 0.02 && y.g.notes.some(n => n.hand === hand));
  for (const x of seq) {
    const t = x.g.t;
    if (onBeat(t)) continue;
    const tb0 = Math.floor((t - off0) / beatQ + 1e-6) * beatQ + off0, tb1 = tb0 + beatQ;
    let b0 = beatTime(tb0), b1 = beatTime(tb1);
    if ((b0 == null || b1 == null) && timeMap) { b0 = b0 ?? timeMap(tb0); b1 = b1 ?? timeMap(tb1); }
    if (b0 == null || b1 == null || b1 <= b0) continue;
    const phase = (t - tb0) / beatQ;
    const played = (x.onset - b0) / (b1 - b0);
    const dev = played - phase;
    const hand = x.g.notes[0].hand;
    const sameHandAtBeat = handNotesAt(hand, tb0);
    // valeur de la note précédente dans la même main (pour reconnaître le pointé)
    const prevSame = perGroup.filter(y => y.g.t < t - 1e-6 && y.g.notes.some(n => n.hand === hand)).pop();
    const prevDur = prevSame ? t - prevSame.g.t : 0;
    let kind = 'autre';
    if (beatQ === 1.5 && (Math.abs(phase - 1 / 3) < 0.02 || Math.abs(phase - 2 / 3) < 0.02)) kind = 'egales';
    else if (Math.abs(phase - 0.75) < 0.02 && prevSame && Math.abs(prevDur - 0.75 * beatQ) < 0.02 && Math.abs(prevSame.g.t - tb0) < 0.02) kind = 'pointe';
    else if (Math.abs(phase - 0.5) < 0.02) kind = sameHandAtBeat ? 'egales' : 'contretemps';
    else if (Math.abs(phase - 1 / 3) < 0.02 || Math.abs(phase - 2 / 3) < 0.02) kind = 'triolet';
    else if (Math.abs(phase - 0.25) < 0.02 || Math.abs(phase - 0.75) < 0.02) kind = 'doubles';
    rhythmPts.push({ m: x.g.m, beat: x.g.beat, kind, phase, played, dev, devMs: dev * (b1 - b0), hand });
  }
  const rhythmKinds = {};
  for (const p of rhythmPts) (rhythmKinds[p.kind] = rhythmKinds[p.kind] || []).push(p);
  const rhythm = Object.entries(rhythmKinds).map(([kind, arr]) => ({
    kind, n: arr.length, meanDev: mean(arr.map(p => p.dev)), meanDevMs: mean(arr.map(p => p.devMs)),
    sdDev: stdev(arr.map(p => p.dev)), measures: arr.filter(p => Math.abs(p.dev) > 0.08).map(p => p.m),
  }));
  const rhythmDev = rhythmPts.length ? mean(rhythmPts.map(p => Math.abs(p.dev))) : 0;

  /* --- mains ensemble --- */
  const asyncs = [];
  for (const x of perGroup) {
    if (!(x.g.hands.has('rh') && x.g.hands.has('lh')) || x.g.arp || x.g.orn || x.g.grace) continue;
    const rh = x.matched.filter(m => m.e.hand === 'rh').map(m => m.p.on);
    const lh = x.matched.filter(m => m.e.hand === 'lh').map(m => m.p.on);
    if (rh.length && lh.length) asyncs.push({ m: x.g.m, beat: x.g.beat, ms: median(rh) - median(lh) });
  }
  const asyncMean = asyncs.length ? mean(asyncs.map(a => a.ms)) : 0;
  const asyncBad = asyncs.filter(a => Math.abs(a.ms) > 60);

  /* --- équilibre : mélodie (note supérieure de la main droite) / accompagnement --- */
  const melody = [], acc = [], voicing = [];
  for (const x of perGroup) {
    const rh = x.matched.filter(m => m.e.hand === 'rh').sort((a, b) => b.e.pitch - a.e.pitch);
    const lh = x.matched.filter(m => m.e.hand === 'lh');
    if (rh.length) melody.push(rh[0].p.vel);
    if (rh.length >= 2) voicing.push({ m: x.g.m, top: rh[0].e.pitch, diff: rh[0].p.vel - mean(rh.slice(1).map(r => r.p.vel)) });
    for (const l of lh) acc.push(l.p.vel);
  }
  const rhPerBeat = groups.filter(g => g.hands.has('rh')).length, lhPerBeat = groups.filter(g => g.hands.has('lh')).length;
  const melodyTexture = melody.length >= 4 && acc.length >= 4 && lhPerBeat >= rhPerBeat * 0.9;
  const balance = melody.length && acc.length ? mean(melody) - mean(acc) : null;
  // accords répétés (accompagnement) : pas de ligne supérieure à faire chanter
  let moving = 0;
  for (let k = 1; k < voicing.length; k++) if (voicing[k].top !== voicing[k - 1].top) moving++;
  const melodicTop = voicing.length >= 4 && moving / (voicing.length - 1) > 0.5;
  const voicingMean = melodicTop ? mean(voicing.map(v => v.diff)) : null;

  /* --- nuances : la prise suit-elle les nuances écrites ? --- */
  const byBarVol = new Map();
  for (const x of perGroup) for (const m of x.matched) {
    if (m.e.vol == null) continue;
    const a = byBarVol.get(x.g.m) || { s: [], p: [] };
    a.s.push(m.e.vol); a.p.push(m.p.vel); byBarVol.set(x.g.m, a);
  }
  const barsV = [...byBarVol.values()].filter(a => a.s.length >= 2);
  const sV = barsV.map(a => mean(a.s)), pV = barsV.map(a => mean(a.p));
  const scoreRange = sV.length ? Math.max(...sV) - Math.min(...sV) : 0;
  const playRange = pV.length ? Math.max(...pV) - Math.min(...pV) : 0;
  const dynCorr = sV.length >= 3 ? Math.sqrt(linreg(sV, pV).r2) * Math.sign(linreg(sV, pV).b || 1) : null;

  /* --- régularité des traits (suites de valeurs égales à une main) --- */
  const runsEven = [];
  {
    let cur = [];
    const flush = () => {
      if (cur.length >= 6) {
        const iois = [];
        for (let k = 1; k < cur.length; k++) iois.push(cur[k].onset - cur[k - 1].onset);
        const cv = stdev(iois) / (mean(iois) || 1);
        runsEven.push({ m0: cur[0].g.m, m1: cur[cur.length - 1].g.m, n: cur.length, cv });
      }
      cur = [];
    };
    for (let k = 0; k < perGroup.length; k++) {
      const x = perGroup[k];
      if (x.onset == null || x.g.notes.length !== 1 || x.g.grace || x.g.orn) { flush(); continue; }
      const prev = cur[cur.length - 1];
      if (prev) {
        const d1 = x.g.t - prev.g.t;
        const d0 = cur.length >= 2 ? prev.g.t - cur[cur.length - 2].g.t : d1;
        if (Math.abs(d1 - d0) > 1e-6 || d1 > 0.5 + 1e-6) { flush(); }
      }
      cur.push(x);
    }
    flush();
  }

  /* --- pédale : changements attendus (début des harmonies) --- */
  const pedal = { used: pedalEv.some(p => p.down), checked: 0, early: [], missing: [], late: [] };
  const changes = (input.harmony || []).filter(q => q > tFirst + 1e-6 && q <= tLast + 1e-6);
  if (pedal.used && changes.length && timeMap) {
    const isDownAt = ms => { let d = false; for (const p of pedalEv) { if (p.t > ms) break; d = p.down; } return d; };
    for (const q of changes) {
      const at = timeMap(q);
      const m = barTools(meta).barOf(q + 1e-6);
      // relâchement le plus proche autour du changement
      const ups = pedalEv.filter(p => !p.down && p.t > at - 700 && p.t < at + 600);
      if (!isDownAt(at - 120) && !isDownAt(at + 300)) continue; // pédale non utilisée à cet endroit
      pedal.checked++;
      if (!ups.length) { pedal.missing.push({ m, q }); continue; }
      const up = ups.reduce((b, p) => (Math.abs(p.t - at) < Math.abs(b.t - at) ? p : b));
      const downAfter = pedalEv.find(p => p.down && p.t > up.t);
      if (up.t < at - 90 && (!downAfter || downAfter.t > at - 20)) pedal.early.push({ m, q, ms: Math.round(at - up.t) });
      else if (up.t > at + 350) pedal.late.push({ m, q, ms: Math.round(up.t - at) });
    }
  }

  /* --- par mesure --- */
  const measures = new Map();
  for (const x of perGroup) {
    const r = measures.get(x.g.m) || { m: x.g.m, total: 0, wrong: 0, miss: 0, extra: 0 };
    r.total += x.g.notes.length; r.wrong += x.wrong.length; r.miss += x.missed.length; r.extra += x.extra.length;
    measures.set(x.g.m, r);
  }
  for (const h of hesitations) { const r = measures.get(h.m); if (r) r.hesitation = true; }
  for (const c of tempoCurve) { const r = measures.get(c.m); if (r) (r._bpm = r._bpm || []).push(c.bpm); }
  const measureList = [...measures.values()].sort((a, b) => a.m - b.m).map(r => ({ ...r, errors: r.wrong + r.miss, bpm: r._bpm ? median(r._bpm) : null, _bpm: undefined }));

  const summary = {
    accuracy: totalMain ? okMain / totalMain : 0, total, ok: okN, wrong: wrongN, missed: missN, extra: extras.length,
    before, after, bpm, targetBpm, tempoRatio: bpm / targetBpm, rhythmDev,
    asyncMs: asyncMean, balance, voicing: voicingMean, drift, durationSec: notes.length ? (notes[notes.length - 1].on - notes[0].on) / 1000 : 0,
    pedalIssues: pedal.early.length + pedal.missing.length + pedal.late.length,
  };
  const res = {
    ok: true, summary, notes: noteRes, extras, measures: measureList, tempoCurve, hesitations, rhythm, rhythmPts,
    asyncs, pedal, runsEven, dyn: { scoreRange, playRange, corr: dynCorr, melodyTexture, balance, voicing: voicingMean },
    meta: { beatQ, firstBar: meta.firstBar, lastBar: groups[groups.length - 1].m, barQ: meta.barQ },
  };
  res.issues = diagnose(res, meta);
  return res;
}

/* ------------------------------------------------------------------ */
/* Diagnostic : problèmes classés, cause probable, exercice            */
/* ------------------------------------------------------------------ */
export const KIND_FR = {
  pointe: 'rythmes pointés', contretemps: 'contretemps', triolet: 'triolets', egales: 'valeurs égales', doubles: 'doubles croches', autre: 'autres rythmes',
};

export function diagnose(res, meta) {
  const s = res.summary;
  const issues = [];
  const firstBar = res.meta.firstBar, lastBar = res.meta.lastBar;
  const loopAround = (ms, pad = 0) => {
    const u = [...new Set(ms)].sort((a, b) => a - b);
    if (!u.length) return null;
    return { type: 'loop', from: Math.max(firstBar, u[0] - pad), to: Math.min(lastBar, u[u.length - 1] + pad) };
  };

  // 1. Notes fausses ou oubliées
  const errBars = res.measures.filter(m => m.errors > 0);
  const errTotal = s.wrong + s.missed;
  if (errTotal > 0 && (1 - s.accuracy) > 0.03) {
    const worst = errBars.slice().sort((a, b) => b.errors - a.errors).slice(0, 3).map(m => m.m);
    const wrongEx = res.notes.map((r, i) => ({ r, i })).filter(x => x.r && x.r.status === 'wrong').slice(0, 2);
    let detail = `${errTotal} note${errTotal > 1 ? 's' : ''} fausse${errTotal > 1 ? 's' : ''} ou oubliée${errTotal > 1 ? 's' : ''} (${Math.round(s.accuracy * 100)} % de notes justes), surtout ${measuresLabel(worst)}.`;
    if (wrongEx.length) detail += ' Par exemple ' + wrongEx.map(x => `${NAME(x.r.played)} au lieu de ${NAME(x.r.expected)} (m. ${x.r.m})`).join(', ') + '.';
    const fast = s.tempoRatio > 0.85;
    issues.push({
      id: 'notes', severity: Math.min(1, (1 - s.accuracy) * 4) + (fast ? 0.15 : 0),
      title: 'Des notes fausses ou oubliées', detail, measures: worst,
      cause: fast ? 'Le tempo est trop proche du tempo final pour un passage pas encore sûr : les doigts devancent la mémoire.' : 'Le passage n’est pas encore assez connu de mémoire (notes, doigtés).',
      exercise: `Boucle ${measuresLabel(worst)} : d’abord mains séparées en mode attente, puis mains ensemble à tempo lent (−30 %). Ne remonte le tempo qu’après 3 passages propres d’affilée.`,
      action: { ...loopAround(worst, 0), tempoPct: 70 },
    });
  }

  // 2. Hésitations
  if (res.hesitations.length) {
    const hm = res.hesitations.map(x => x.m);
    const strong = res.hesitations.filter(x => x.ratio > 1.6).length;
    issues.push({
      id: 'hesitation', severity: Math.min(0.9, 0.25 + 0.15 * res.hesitations.length + 0.1 * strong),
      title: 'Des hésitations', measures: hm,
      detail: `Le tempo se casse ${res.hesitations.length > 1 ? 'à ' + res.hesitations.length + ' endroits' : 'à un endroit'} : ${res.hesitations.slice(0, 3).map(x => fmtBeat(x.m, x.beat)).join(' ; ')}.`,
      cause: 'Souvent un saut, un changement de position ou une note mal sue juste avant : la main arrive en retard.',
      exercise: 'Travaille l’endroit « en arrêt-préparation » : joue jusqu’à la note qui précède, arrête-toi, prépare la main au-dessus des notes suivantes, puis enchaîne. Ensuite, joue le passage avec une mesure avant et une après, en rythme, sans t’arrêter.',
      action: { ...loopAround(hm, 1), tempoPct: 80 },
    });
  }

  // 3. Rythme (pointés, contretemps, triolets)
  for (const k of res.rhythm) {
    if (k.n < 3 || k.kind === 'autre') continue;
    const dev = k.meanDev;
    const thr = k.kind === 'pointe' ? 0.045 : 0.06;
    if (Math.abs(dev) < thr) continue;
    let title, detail, cause, exercise;
    if (k.kind === 'pointe') {
      const played = (0.75 + dev);
      title = dev < 0 ? 'Rythmes pointés trop mous' : 'Rythmes pointés trop serrés';
      detail = `La note brève arrive en moyenne ${Math.abs(Math.round(k.meanDevMs))} ms ${dev < 0 ? 'trop tôt' : 'trop tard'} : tu joues environ ${(played / (1 - played)).toFixed(1).replace('.', ',')} pour 1 au lieu de 3 pour 1${dev < 0 ? ', presque un triolet' : ''}.`;
      cause = dev < 0 ? 'La note longue est raccourcie : la double croche part trop vite.' : 'La note brève est retardée au point de se coller au temps suivant.';
      exercise = 'Compte les doubles croches à voix haute (« 1-e-et-a ») et place la brève sur le « a », juste avant le temps. Puis métronome réglé sur la double croche, lentement.';
    } else if (k.kind === 'contretemps') {
      title = dev < 0 ? 'Contretemps joués trop tôt' : 'Contretemps joués trop tard';
      detail = `Les notes à contretemps arrivent en moyenne ${Math.abs(Math.round(k.meanDevMs))} ms ${dev < 0 ? 'en avance' : 'en retard'} sur le milieu du temps.`;
      cause = 'Le contretemps se cale sur la note précédente au lieu de la pulsation.';
      exercise = 'Joue la main qui marque les temps seule, au métronome, en disant « et » à voix haute entre les temps ; ajoute l’autre main exactement sur le « et ». Puis sans dire « et ».';
    } else if (k.kind === 'triolet') {
      title = 'Triolets inégaux';
      detail = `Les triolets ne sont pas égaux (écart moyen ${Math.abs(Math.round(k.meanDevMs))} ms).`;
      cause = 'Le triolet se transforme en croche + deux doubles, ou l’inverse.';
      exercise = 'Dis « tri-o-let » ou « ana-nas » sur chaque temps, puis joue en accentuant légèrement la première note de chaque groupe.';
    } else {
      title = 'Valeurs égales jouées inégales';
      detail = `Les notes de même valeur ne sont pas égales (écart moyen ${Math.abs(Math.round(k.meanDevMs))} ms).`;
      cause = 'Un doigt plus faible ou un passage du pouce qui retarde une note.';
      exercise = 'Travaille en rythmes (pointé, puis pointé inversé), puis en groupes avec arrêt, avant de revenir aux valeurs égales.';
    }
    const ms = k.measures.length ? k.measures : [];
    issues.push({
      id: 'rhythm-' + k.kind, severity: Math.min(0.85, 0.3 + Math.abs(dev) * 4 + Math.min(0.15, k.n / 60)), title, detail, cause, exercise, measures: ms,
      action: ms.length ? { ...loopAround(ms, 0), tempoPct: 75, metronome: true } : null,
    });
  }

  // 4. Dérive de tempo
  if (Math.abs(s.drift) > 0.12 && (res.tempoCurve.length >= 8)) {
    const acc = s.drift > 0;
    issues.push({
      id: 'drift', severity: Math.min(0.7, 0.25 + Math.abs(s.drift)),
      title: acc ? 'Tu accélères' : 'Tu ralentis peu à peu',
      detail: `Du début à la fin du passage, le tempo ${acc ? 'monte' : 'baisse'} d’environ ${Math.round(Math.abs(s.drift) * 100)} %.`,
      cause: acc ? 'L’excitation ou un passage facile qui entraîne la suite.' : 'La difficulté qui augmente, ou une attention qui faiblit.',
      exercise: 'Joue avec le métronome, puis avec une mesure de métronome sur deux muette : tu dois retomber pile sur le clic.',
      action: { type: 'metronome' },
    });
  }

  // 5. Mains ensemble
  if (res.asyncs.length >= 4) {
    const badShare = res.asyncs.filter(a => Math.abs(a.ms) > 60).length / res.asyncs.length;
    if (Math.abs(s.asyncMs) > 35 || badShare > 0.35) {
      const late = s.asyncMs > 0 ? 'droite' : 'gauche';
      const bm = [...new Set(res.asyncs.filter(a => Math.abs(a.ms) > 60).map(a => a.m))];
      issues.push({
        id: 'hands', severity: Math.min(0.75, 0.25 + Math.abs(s.asyncMs) / 150 + badShare * 0.4),
        title: 'Les mains ne sont pas ensemble', measures: bm,
        detail: `Sur les accords et les notes communes aux deux mains, la main ${late} arrive en moyenne ${Math.abs(Math.round(s.asyncMs))} ms après l’autre${bm.length ? ', surtout ' + measuresLabel(bm.slice(0, 4)) : ''}.`,
        cause: 'Une main attend l’autre (souvent la main qui a un déplacement).',
        exercise: 'Lentement, arrête-toi sur chaque attaque commune et vérifie à l’oreille que les deux mains tombent ensemble ; puis enchaîne par groupes de deux temps.',
        action: bm.length ? { ...loopAround(bm, 0), tempoPct: 70 } : null,
      });
    }
  }

  // 6. Équilibre et voix supérieure
  if (res.dyn.melodyTexture && s.balance != null && s.balance < 6) {
    issues.push({
      id: 'balance', severity: Math.min(0.7, 0.3 + (6 - s.balance) / 30),
      title: 'La mélodie ne ressort pas assez',
      detail: `Main droite (mélodie) ${s.balance >= 0 ? 'seulement ' + Math.round(s.balance) + ' points de vélocité au-dessus' : Math.round(-s.balance) + ' points en dessous'} de l’accompagnement (vise au moins +10).`,
      cause: 'L’accompagnement est joué avec le même poids que le chant.',
      exercise: 'Joue la main gauche seule très doucement (pp), puis ajoute la mélodie « au-dessus » en gardant la gauche aussi légère. Exagère d’abord l’écart.',
      action: null,
    });
  }
  if (s.voicing != null && s.voicing < 4 && res.dyn && res.dyn.voicing != null) {
    issues.push({
      id: 'voicing', severity: 0.3 + Math.min(0.3, (4 - s.voicing) / 20),
      title: 'La note du haut des accords ne chante pas',
      detail: `Dans les accords de la main droite, la note supérieure n’est que ${Math.round(s.voicing)} point(s) au-dessus des autres.`,
      cause: 'Les doigts frappent l’accord d’un seul bloc.',
      exercise: 'Accord par accord : la note du haut forte, les autres effleurées ; puis joue seulement la note du haut, et rajoute les autres pianissimo.',
      action: null,
    });
  }

  // 7. Pédale
  if (res.pedal.checked >= 2) {
    const n = res.pedal.early.length + res.pedal.missing.length + res.pedal.late.length;
    if (n / res.pedal.checked > 0.25) {
      const mm = [...res.pedal.early, ...res.pedal.missing, ...res.pedal.late].map(x => x.m);
      let detail = [];
      if (res.pedal.early.length) detail.push(`relevée avant le nouvel accord (trou de son) : ${measuresLabel(res.pedal.early.map(x => x.m))}`);
      if (res.pedal.missing.length) detail.push(`pas changée au changement d’harmonie (sons mélangés) : ${measuresLabel(res.pedal.missing.map(x => x.m))}`);
      if (res.pedal.late.length) detail.push(`changée trop tard : ${measuresLabel(res.pedal.late.map(x => x.m))}`);
      issues.push({
        id: 'pedal', severity: Math.min(0.7, 0.25 + n / res.pedal.checked / 2),
        title: 'Changements de pédale à revoir', measures: mm, detail: 'Pédale ' + detail.join(' ; ') + '.',
        cause: 'Le pied se relève en même temps que les doigts au lieu de juste après.',
        exercise: 'Pédale syncopée : joue l’accord, relève le pied au moment précis où tu l’enfonces, renfonce juste après. Lentement, accord par accord, en écoutant qu’il n’y ait ni trou ni mélange.',
        action: { ...loopAround(mm, 0), tempoPct: 70 },
      });
    }
  }

  // 8. Traits irréguliers
  const uneven = res.runsEven.filter(r => r.cv > 0.12);
  if (uneven.length) {
    const ms = uneven.flatMap(r => [r.m0, r.m1]);
    issues.push({
      id: 'even', severity: Math.min(0.6, 0.2 + Math.max(...uneven.map(r => r.cv))),
      title: 'Traits irréguliers', measures: ms,
      detail: `Les notes rapides de même valeur sont inégales (${measuresLabel(ms)} ; irrégularité ${Math.round(Math.max(...uneven.map(r => r.cv)) * 100)} %).`,
      cause: 'Un passage du pouce ou un doigt faible qui retarde une note.',
      exercise: 'Rythmes pointés puis inversés, puis groupes de 4 avec arrêt sur la première note, avant de revenir aux valeurs égales au métronome.',
      action: { ...loopAround(ms, 0), tempoPct: 70, metronome: true },
    });
  }

  // 9. Nuances
  if (res.dyn.scoreRange >= 15 && (res.dyn.playRange < 10 || (res.dyn.corr != null && res.dyn.corr < 0.2))) {
    issues.push({
      id: 'dynamics', severity: 0.3,
      title: 'Nuances peu différenciées',
      detail: `La partition change de nuance, mais ta force de jeu varie peu d’une mesure à l’autre (écart de ${Math.round(res.dyn.playRange)} points).`,
      cause: 'L’attention est prise par les notes.',
      exercise: 'Joue le passage trois fois de suite : tout pp, tout f, puis avec les nuances écrites, en exagérant.',
      action: null,
    });
  }

  issues.sort((a, b) => b.severity - a.severity);
  return issues;
}

/** Résumé d'une prise pour l'historique (comparaison avec les prises précédentes). */
export function takeSummary(res) {
  const s = res.summary;
  return {
    accuracy: s.accuracy, bpm: s.bpm, targetBpm: s.targetBpm, rhythmDev: s.rhythmDev, asyncMs: s.asyncMs,
    balance: s.balance, pedalIssues: s.pedalIssues, hesitations: res.hesitations.length,
    errorsByMeasure: Object.fromEntries(res.measures.map(m => [m.m, m.errors + m.extra])),
    bpmByMeasure: Object.fromEntries(res.measures.filter(m => m.bpm).map(m => [m.m, Math.round(m.bpm * 10) / 10])),
    issues: res.issues.slice(0, 3).map(i => i.id),
  };
}
