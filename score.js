// Partitions (abcjs) : rendu, lecture synchronisée, mode « attente » et mode « en rythme ».
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { h, clamp, mean, median } from './util.js';
import { corrected } from './latency.js';
import { scheduleCountIn, countInPosition } from './countin.js';

/** Plage [q0, q1[ (en noires) ou null : filtre d'événements. */
const inRange = (range, t) => !range || (t >= range[0] - 1e-6 && t < range[1] - 1e-6);

let uid = 0;


/**
 * Petites notes. abcjs leur donne la moitié de la valeur de la note principale (trop long chez Chopin).
 * - Cas général : jouées vite sur le temps, la note principale juste après (la durée réelle, en secondes,
 *   est fixée à la lecture : Player.prepare).
 * - Petites notes qui suivent une trille : c'est sa terminaison ; elles se jouent à la fin de la trille,
 *   avant le temps, et la note suivante tombe sur le temps.
 * Chaque petite note garde son rang dans le groupe (gInfo) ; la note principale garde l'origine du groupe (agInfo).
 */
/**
 * Liaisons : l'analyseur d'abcjs suit les liaisons note par note dans un accord par leur rang dans l'accord, sans
 * distinguer les voix ; une liaison peut alors rester sans note d'arrivée (la note liée est rejouée, parfois avec
 * une fausse altération) et laisser une liaison « en attente » qui absorberait une note plus loin.
 * On relie chaque départ de liaison à la note suivante de la même voix (même position sur la portée) avant le calcul
 * des sons ; un départ sans note d'arrivée est ignoré.
 */
function repairTies(visual) {
  const voices = new Map();
  for (const line of visual.lines || []) {
    (line.staff || []).forEach((st, si) => (st.voices || []).forEach((voice, vi) => {
      const key = si + ':' + vi;
      if (!voices.has(key)) voices.set(key, []);
      const list = voices.get(key);
      for (const el of voice) {
        if (el.el_type !== 'note') continue;
        if (el.rest && (el.rest.type === 'spacer' || el.rest.type === 'invisible')) continue; // silence invisible (y, x) : la liaison passe par-dessus
        list.push(el);
      }
    }));
  }
  for (const els of voices.values()) {
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!el.pitches) continue;
      const nx = els[i + 1];
      for (const p of el.pitches) {
        if (!p || !p.startTie) continue;
        const q = nx && nx.pitches ? nx.pitches.find(x => x && x.pitch === p.pitch) : null;
        if (q) q.endTie = true;
        else delete p.startTie;
      }
    }
  }
}

function fixGraces(track) {
  const notes = track.filter(e => e.cmd === 'note');
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].style !== 'grace') continue;
    const chain = [];
    let j = i;
    while (j < notes.length && notes[j].style === 'grace') { chain.push(notes[j]); j++; }
    const S = chain[0].start;
    const oldEnd = chain.reduce((m, g) => Math.max(m, g.start + g.duration), S);
    let prev = null;
    for (let q = i - 1; q >= 0; q--) if (notes[q].style !== 'grace') { prev = notes[q]; break; }
    const termination = !!(prev && prev.orn && /trill/.test(prev.orn.type) && Math.abs(prev.start + prev.duration - S) < 1e-6);
    const n = chain.length;
    const each = Math.min(0.025, (oldEnd - S) / n);
    chain.forEach((g, k) => {
      g.start = termination ? S - (n - k) * each : S + k * each;
      g.duration = each * 1.6;
      g.gInfo = { S, k, n, termination };
    });
    const newEnd = termination ? S : S + n * each;
    for (let k = j; k < notes.length && Math.abs(notes[k].start - oldEnd) < 1e-6; k++) {
      notes[k].duration += notes[k].start - newEnd;
      notes[k].start = newEnd;
      notes[k].agInfo = { S, n, termination };
      if (notes[k].orn) { notes[k].orn.prefixed = true; notes[k].orn.prefixLast = chain[n - 1].pitch; }
    }
    if (termination && prev) prev.orn.termination = n;
    i = j - 1;
  }
}

/* Ornements : abcjs les joue avec des intervalles fixes (trille toujours à un ton, gruppetto
   +2/−1…), sans tenir compte de la tonalité, et remplace la note écrite par ces notes. On remet la
   note écrite, avec ses voisines diatoniques exactes, et la lecture réalise l'ornement selon le tempo. */
const ORN = ['trill', 'trillh', 'lowermordent', 'uppermordent', 'mordent', 'pralltriller', 'turn', 'roll'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const ACC_OFF = { flat: -1, sharp: 1, natural: 0, dblflat: -2, dblsharp: 2, quarterflat: 0, quartersharp: 0 };
const pcOf = m => ((m % 12) + 12) % 12;

function keyOffsets(key) {
  const off = [0, 0, 0, 0, 0, 0, 0];
  for (const a of (key && key.accidentals) || []) {
    const li = 'cdefgab'.indexOf(String(a.note).toLowerCase());
    if (li >= 0) off[li] = ACC_OFF[a.acc] ?? 0;
  }
  return off;
}
function neighbours(main, el, key) {
  const pos = el && el.pitches && el.pitches[0] ? el.pitches[0].pitch : null;
  if (pos == null) return { upper: main + 2, lower: main - 2 };
  const L = ((pos % 7) + 7) % 7;
  const off = keyOffsets(key);
  const upPc = (LETTER_PC[(L + 1) % 7] + off[(L + 1) % 7] + 12) % 12;
  const loPc = (LETTER_PC[(L + 6) % 7] + off[(L + 6) % 7] + 12) % 12;
  let up = (upPc - pcOf(main) + 12) % 12, lo = (pcOf(main) - loPc + 12) % 12;
  if (up < 1 || up > 2) up = 2;
  if (lo < 1 || lo > 2) lo = 2;
  return { upper: main + up, lower: main - lo };
}

/** Remplace dans une piste les notes « decoration » d'abcjs par la note écrite, marquée de son ornement. */
function rebuildOrnaments(track, ornEls) {
  const out = [];
  let k = 0;
  for (let i = 0; i < track.length; i++) {
    const e = track[i];
    if (e.cmd !== 'note' || e.style !== 'decoration') { out.push(e); continue; }
    const info = ornEls[k++] || null;
    const isDeco = x => x && x.cmd === 'note' && x.style === 'decoration';
    let type = info ? info.el.decoration.find(d => ORN.includes(d)) : null;
    if (!type) type = isDeco(track[i + 2]) && track[i + 2].pitch === e.pitch ? 'trill' : 'mordent';
    // nombre de notes produites par abcjs selon l'ornement (pour ne pas déborder sur l'ornement suivant)
    const run = [];
    let j = i;
    if (type === 'turn') { while (j < track.length && isDeco(track[j]) && run.length < 4) run.push(track[j++]); }
    else if (['mordent', 'lowermordent', 'uppermordent', 'pralltriller'].includes(type)) { while (j < track.length && isDeco(track[j]) && run.length < 2) run.push(track[j++]); }
    else if (type === 'roll') { while (j < track.length && isDeco(track[j]) && track[j].pitch === e.pitch) run.push(track[j++]); }
    else {
      const pair = new Set([e.pitch, isDeco(track[i + 1]) ? track[i + 1].pitch : e.pitch]);
      while (j < track.length && isDeco(track[j]) && pair.has(track[j].pitch)) run.push(track[j++]);
    }
    let main;
    if (type === 'turn') main = run[1] ? run[1].pitch : run[0].pitch;
    else if (type === 'roll') main = run[0].pitch;
    else if (type === 'trill' || type === 'trillh') main = Math.min(run[0].pitch, run[1] ? run[1].pitch : run[0].pitch);
    else main = run[0].pitch; // mordants : la 1re note est la note écrite
    let start = run[0].start;
    let end = run.reduce((m, r) => Math.max(m, r.start + r.duration), start);
    // mordants : abcjs ajoute ensuite la note principale (sans repère) ; on la fusionne
    const nxt = track[j];
    if (nxt && nxt.cmd === 'note' && nxt.style !== 'decoration' && nxt.pitch === main && Math.abs(nxt.start - end) < 1e-6 && nxt.startChar == null) { end = nxt.start + nxt.duration; j++; }
    const nb = neighbours(main, info && info.el, info && info.key);
    out.push({ ...run[0], pitch: main, start, duration: end - start, style: '', startChar: info ? info.el.startChar : null, orn: { type, upper: nb.upper, lower: nb.lower } });
    i = j - 1;
  }
  return out;
}

/**
 * Trille réalisée en valeurs mesurées, comme la joue un pianiste dans un nocturne :
 * - les notes tombent sur une subdivision régulière du temps (4, 6, 8, 12 ou 16 par noire, ≈ 9 notes par seconde),
 *   et non à une vitesse fixe qui ne correspond à aucun rythme ;
 * - départ sur la note supérieure, sauf si la note précédente est déjà la note supérieure (on part alors de la note
 *   principale, pour ne pas la répéter) ; avec des petites notes avant la trille (préfixe la♮ – si♭), elles prennent
 *   les premières subdivisions et la trille continue sans répéter la note principale ;
 * - la terminaison écrite (petites notes après la trille) est jouée à la même vitesse, juste avant la note suivante,
 *   et la trille finit sur la note principale (au besoin la première note dure deux subdivisions) ;
 * - sans terminaison : la trille va jusqu'au bout si la note suivante est voisine (elle sert de résolution) ou si une
 *   fioriture enchaîne, sinon
 *   la note principale est tenue sur la ou les dernières subdivisions.
 * Renvoie { notes, used } (used : petites notes absorbées par la réalisation) ou null.
 */
export function realizeTrill(e, evs, toSec) {
  const q0 = e.ag && e.g0 != null ? e.g0 : e.t;  // début écrit de la trille (avant son préfixe)
  const qEnd = e.t + e.dur;                         // fin écrite (début de la note suivante)
  const T0 = toSec(q0), T1 = toSec(qEnd);
  const sec = T1 - T0, qLen = qEnd - q0;
  if (!(sec > 0.05) || !(qLen > 0)) return null;
  const near = (a, b) => a != null && Math.abs(a - b) < 1e-3;
  const pre = evs.filter(x => x.grace && x.track === e.track && !x.gterm && near(x.g0, q0)).sort((a, b) => a.gk - b.gk);
  const post = evs.filter(x => x.grace && x.track === e.track && x.gterm && near(x.g0, qEnd)).sort((a, b) => a.gk - b.gk);
  // note précédente de la même voix (la plus proche en hauteur si c'est un accord)
  let prevT = -Infinity, prevPitch = null;
  for (const x of evs) {
    if (x.grace || x.track !== e.track || x === e || x.t >= q0 - 1e-6) continue;
    if (x.t > prevT + 1e-6) { prevT = x.t; prevPitch = x.pitch; }
    else if (Math.abs(x.t - prevT) <= 1e-6 && Math.abs(x.pitch - e.pitch) < Math.abs(prevPitch - e.pitch)) prevPitch = x.pitch;
  }
  const spq = sec / qLen;
  let k = [4, 6, 8, 12, 16].reduce((b, c) => (Math.abs(spq / c - 0.11) < Math.abs(spq / b - 0.11) ? c : b), 8);
  let N = Math.max(4, Math.round(qLen * k));
  while (N < pre.length + post.length + 4 && k < 32) { k *= 2; N = Math.round(qLen * k); }
  const slot = sec / N;
  const up = e.orn.upper, main = e.pitch;
  const other = p => (p === up ? main : up);
  const pairs = []; // [hauteur, nombre de subdivisions, rôle]
  pre.forEach(g => pairs.push([g.pitch, 1, 'pre']));
  // sans terminaison : la trille continue jusqu'au bout si la note suivante est voisine (elle sert de résolution),
  // sinon la note principale est tenue sur la dernière subdivision
  const nextEv = evs.find(x => !x.grace && x.track === e.track && x !== e && near(x.ag && x.g0 != null ? x.g0 : x.t, qEnd));
  const flowsOn = nextEv && (Math.abs(nextEv.pitch - main) <= 2 || nextEv.dur <= 0.26); // note voisine, ou fioriture qui suit
  const hold = post.length || flowsOn ? 0 : (N >= 8 ? 2 : 1);
  let n = N - pre.length - post.length - hold;
  let first = pre.length ? (pre[pre.length - 1].pitch === main ? up : main) : (prevPitch === up ? main : up);
  if (n >= 2) {
    const endsOnMain = n % 2 === 1 ? first === main : first === up;
    if (!endsOnMain) { pairs.push([first, 2, 'alt']); n -= 2; first = other(first); }
    for (let i = 0; i < n; i++) pairs.push([i % 2 === 0 ? first : other(first), 1, 'alt']);
  } else {
    pairs.push([main, Math.max(1, n), 'alt']);
  }
  if (hold) { const last = pairs[pairs.length - 1]; if (last[0] === main) last[1] += hold; else pairs.push([main, hold, 'alt']); }
  post.forEach(g => pairs.push([g.pitch, 1, 'post']));
  const notes = [];
  let t = T0;
  pairs.forEach(([pitch, slots, role], i) => {
    const vel = i === 0 ? e.vel : role === 'post' ? e.vel * 0.88 : (pitch === main ? e.vel * 0.86 : e.vel * 0.8);
    notes.push({ ...e, pitch, ts: t, te: t + slots * slot * 0.97, vel, orn: null, grace: false, trill: true, ag: 0 });
    t += slots * slot;
  });
  return { notes, used: [...pre, ...post] };
}

/** Réalise un ornement (secondes) : gruppetto, mordants, puis la note tenue (les trilles : realizeTrill). */
function expandOrnament(e) {
  const { type, upper, lower } = e.orn;
  const len = Math.max(0.05, e.te - e.ts);
  const res = [];
  const add = (pitch, ts, te, k) => res.push({ ...e, pitch, ts, te, vel: k ? e.vel * 0.86 : e.vel, orn: null });
  if (type === 'trill' || type === 'trillh') {
    // trille isolée (sans contexte) : quatre subdivisions puis la note
    const q = Math.min(0.1, len / 5);
    add(upper, e.ts, e.ts + q, 0); add(e.pitch, e.ts + q, e.ts + 2 * q, 1); add(upper, e.ts + 2 * q, e.ts + 3 * q, 2); add(e.pitch, e.ts + 3 * q, e.te, 3);
  } else if (type === 'turn') {
    const q = Math.min(0.09, len / 5);
    add(upper, e.ts, e.ts + q, 0); add(e.pitch, e.ts + q, e.ts + 2 * q, 1); add(lower, e.ts + 2 * q, e.ts + 3 * q, 2); add(e.pitch, e.ts + 3 * q, e.te, 3);
  } else if (type === 'mordent' || type === 'lowermordent') {
    const q = Math.min(0.07, len / 4);
    add(e.pitch, e.ts, e.ts + q, 0); add(lower, e.ts + q, e.ts + 2 * q, 1); add(e.pitch, e.ts + 2 * q, e.te, 2);
  } else if (type === 'pralltriller' || type === 'uppermordent') {
    const q = Math.min(0.07, len / 4);
    add(e.pitch, e.ts, e.ts + q, 0); add(upper, e.ts + q, e.ts + 2 * q, 1); add(e.pitch, e.ts + 2 * q, e.te, 2);
  } else add(e.pitch, e.ts, e.te, 0);
  return res;
}

/* ------------------------------------------------------------------ */
/* Score : rendu + extraction des événements                           */
/* ------------------------------------------------------------------ */
export class Score {
  constructor(container, abc, opts = {}) {
    this.container = container;
    this.abc = abc;
    this.opts = opts;
    this.id = 'score' + (++uid);
    this.marks = new Map(); // cls -> Set(char)
    this.render();
  }

  render() {
    if (!window.ABCJS) throw new Error('abcjs non chargé');
    this.container.innerHTML = '';
    this.svgHost = h('div', { class: 'score-svg' });
    this.container.append(this.svgHost);
    const params = {
      add_classes: true,
      responsive: 'resize',
      staffwidth: this.opts.staffwidth || 760,
      scale: this.opts.scale || 1,
      paddingtop: 4, paddingbottom: 4, paddingleft: 6, paddingright: 10,
      foregroundColor: '#1d1f24',
      selectionColor: '#2f66c9',
      format: { annotationfont: 'Inter 12', vocalfont: 'Inter 12', measurefont: 'Inter 11 italic', tempofont: 'Inter 13 bold', infofont: 'Inter 12', partsfont: 'Inter 12', voicefont: 'Inter 12 bold' },
      clickListener: this.opts.onClick ? (abcElem) => this.opts.onClick(abcElem) : undefined,
    };
    // Écran étroit (téléphone) : on laisse abcjs redistribuer les mesures sur des lignes plus courtes.
    const cw = this.container.clientWidth || 0;
    if (cw && cw < 560) {
      params.staffwidth = Math.max(300, Math.round(cw * 1.35));
      params.wrap = { minSpacing: 1.6, maxSpacing: 2.6, preferredMeasuresPerLine: 2 };
      // abcjs renumérote les mesures quand il redistribue les lignes : on masque les numéros plutôt que d’en afficher de faux.
      this.svgHost.classList.add('wrapped');
    }
    this.visual = window.ABCJS.renderAbc(this.svgHost, this.abc, params)[0];
    this._extract();
  }

  _extract() {
    repairTies(this.visual);
    const flat = this.visual.setUpAudio({});
    // main de chaque voix : d'après le nom de la voix (LH / MG = main gauche), sinon ordre RH puis LH
    const voiceIds = [...this.abc.matchAll(/^V:\s*([^\s\]]+)/gm)].map(m => m[1]);
    const auto = voiceIds.length ? voiceIds.map(v => (/^(LH|MG|L)/i.test(v) ? 'lh' : 'rh')) : null;
    const tracksMap = this.opts.tracks || auto || ['rh', 'lh', 'lh', 'lh'];
    // éléments ornés (et arpégés) de chaque voix, dans l'ordre : même ordre que les pistes audio
    const ornEls = [], arpChars = new Set();
    for (const line of this.visual.lines || []) {
      if (!line.staff) continue;
      let vi = 0;
      for (const st of line.staff) {
        for (const voice of st.voices || []) {
          const list = ornEls[vi] || (ornEls[vi] = []);
          for (const el of voice) {
            if (el.el_type !== 'note' || !el.decoration) continue;
            if (el.decoration.some(d => ORN.includes(d))) list.push({ el, key: st.key });
            if (el.decoration.includes('arpeggio')) arpChars.add(el.startChar);
          }
          vi++;
        }
      }
    }
    const evs = [];
    flat.tracks.forEach((tr0, ti) => {
      const tr = rebuildOrnaments(tr0, ornEls[ti] || []);
      fixGraces(tr);
      for (const ev of tr) {
        if (ev.cmd !== 'note' || !(ev.duration > 0)) continue;
        evs.push({
          pitch: ev.pitch, t: ev.start * 4, dur: ev.duration * 4, vol: ev.volume,
          track: ti, hand: tracksMap[ti] || 'rh', char: ev.startChar ?? null,
          orn: ev.orn || null, arp: ev.startChar != null && arpChars.has(ev.startChar),
          grace: ev.style === 'grace',
          // petites notes : rang dans le groupe, taille du groupe, début du groupe (noires), terminaison de trille
          gk: ev.gInfo ? ev.gInfo.k : null, gn: ev.gInfo ? ev.gInfo.n : null,
          g0: ev.gInfo ? ev.gInfo.S * 4 : ev.agInfo ? ev.agInfo.S * 4 : null,
          gterm: !!((ev.gInfo && ev.gInfo.termination) || (ev.agInfo && ev.agInfo.termination)),
          ag: ev.agInfo ? ev.agInfo.n : 0,
        });
      }
    });
    evs.sort((a, b) => a.t - b.t || a.pitch - b.pitch);
    // une même hauteur attaquée deux fois au même instant (unissons entre voix) : on garde la plus longue
    const dedup = [];
    for (const e of evs) {
      const twin = dedup.find(d => d.pitch === e.pitch && Math.abs(d.t - e.t) < 0.01);
      if (twin) { if (e.dur > twin.dur) { twin.dur = e.dur; if (e.char != null) twin.char = e.char; } }
      else dedup.push(e);
    }
    this.events = dedup;
    this.totalQ = evs.reduce((m, e) => Math.max(m, e.t + e.dur), 0);
    const mf = this.visual.getMeterFraction ? this.visual.getMeterFraction() : { num: 4, den: 4 };
    this.meter = mf;
    this.barQ = mf.num * 4 / mf.den;
    this.beatQ = (mf.den === 8 && mf.num % 3 === 0) ? 1.5 : 4 / mf.den;
    this.pickupQ = (this.visual.getPickupLength ? this.visual.getPickupLength() : 0) * 4;
    this.handsPresent = new Set(evs.map(e => e.hand));
  }

  elementsFor(char) {
    if (char == null) return [];
    const el = this.visual.getElementFromChar(char);
    const abs = el && el.abselem;
    if (!abs || !abs.elemset) return [];
    return abs.elemset.filter(Boolean);
  }
  mark(char, cls) {
    for (const e of this.elementsFor(char)) e.classList.add(cls);
    if (!this.marks.has(cls)) this.marks.set(cls, new Set());
    this.marks.get(cls).add(char);
  }
  unmark(char, cls) {
    for (const e of this.elementsFor(char)) e.classList.remove(cls);
    this.marks.get(cls)?.delete(char);
  }
  clear(cls) {
    const classes = cls ? [cls] : [...this.marks.keys()];
    for (const c of classes) {
      for (const ch of this.marks.get(c) || []) for (const e of this.elementsFor(ch)) e.classList.remove(c);
      this.marks.delete(c);
    }
  }
  filtered(hands = 'both', { noOrnaments = false } = {}) {
    return this.events.filter(e => (hands === 'both' || e.hand === hands) && (!noOrnaments || e.char != null));
  }
}


/** Grille des temps (en noires depuis la première note), avec repérage des premiers temps. */
export function beatGrid(score) {
  const out = [];
  const first = score.pickupQ ? score.pickupQ % score.beatQ : 0;
  for (let q = first; q <= score.totalQ + 1e-6; q += score.beatQ) {
    const r = (((q - score.pickupQ) % score.barQ) + score.barQ) % score.barQ;
    out.push({ q, isBar: r < 1e-6 || Math.abs(r - score.barQ) < 1e-6 });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Fonctions d'interprétation (dynamique, rubato, pédale)              */
/* ------------------------------------------------------------------ */
function piecewise(points, x, dflt = 1) {
  if (!points || !points.length) return dflt;
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    if (x <= x1) return y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1));
  }
  return points[points.length - 1][1];
}

/** Construit la fonction beats -> secondes, avec une carte de tempo éventuelle. */
function makeTimeMap(qpm, tempoMap) {
  const spq = 60 / qpm;
  if (!tempoMap || !tempoMap.length) return b => b * spq;
  const step = 0.02;
  const cache = [0];
  return b => {
    const n = Math.ceil(b / step);
    while (cache.length <= n) {
      const i = cache.length;
      const x = (i - 0.5) * step;
      cache.push(cache[i - 1] + step * spq / Math.max(0.2, piecewise(tempoMap, x)));
    }
    const i = Math.floor(b / step);
    const frac = (b - i * step) / step;
    const a = cache[i] ?? 0;
    const c = cache[Math.min(i + 1, cache.length - 1)] ?? a;
    return a + (c - a) * frac;
  };
}

/* ------------------------------------------------------------------ */
/* Player : lecture audio synchronisée avec surlignage                 */
/* ------------------------------------------------------------------ */
let currentPlayer = null; // une seule lecture de partition à la fois

export class Player {
  constructor(score, opts = {}) {
    this.score = score;
    this.opts = opts;
    this.id = 'player' + (++uid);
    this.playing = false;
    this.listeners = new Set();
    this._tok = 0;
  }

  set(opts) { Object.assign(this.opts, opts); }

  prepare() {
    const o = this.opts;
    const qpm = o.qpm || 60;
    const tmap = makeTimeMap(qpm, o.tempoMap);
    const hands = o.hands || 'both';
    const shift = o.range ? tmap(o.range[0]) : 0; // la lecture commence au début de la plage
    const bal = Object.assign({ rh: 1, lh: 0.8 }, o.balance || {});
    const range = o.range || null;
    let evs = this.score.filtered(hands).filter(e => inRange(range, e.t)).map(e => {
      // volume abcjs (pp ≈ 45, p ≈ 60, mf ≈ 90, f ≈ 105) → vélocité 50 à 90 : audible sur une tablette, jamais saturé
      let vel = o.flat ? (e.hand === 'rh' ? 72 : 58) : 24 + (e.vol ?? 90) * 0.62;
      vel *= bal[e.hand] ?? 1;
      if (o.trackGain && o.trackGain[e.track] != null) vel *= 0.45 + 0.55 * o.trackGain[e.track];
      if (o.dyn && o.dyn[e.hand]) vel *= piecewise(o.dyn[e.hand], e.t, 1);
      let ts = tmap(e.t) - shift;
      let te = tmap(e.t + e.dur) - shift;
      if (o.rhShift && e.hand === 'rh') {
        const sh = piecewise(o.rhShift, e.t, 0) / 1000;
        ts += sh; te += sh;
      }
      if (o.legato === false) te = ts + (te - ts) * 0.55;
      return { ...e, vel: clamp(vel, 28, 118), ts, te };
    });
    // Petites notes : vives quel que soit le tempo (≈ 35 à 60 ms chacune), au lieu d'une fraction de temps.
    const spqAt = q => Math.max(0.15, tmap(q + 0.5) - tmap(q - 0.5));
    const graceSec = (q, n) => clamp(0.22 * spqAt(q) / n, 0.035, 0.06);
    const termGaps = [];
    for (const e of evs) {
      if (e.g0 == null) continue;
      const base = tmap(e.g0) - shift;
      if (e.grace && e.gn) {
        const gs = graceSec(e.g0, e.gn);
        e.ts = e.gterm ? base - (e.gn - e.gk) * gs : base + e.gk * gs;
        e.te = e.ts + gs * 1.3;
        if (e.gterm && e.gk === 0) termGaps.push({ track: e.track, at: base, gap: e.gn * gs });
      } else if (e.ag) {
        const gs = graceSec(e.g0, e.ag);
        e.ts = e.gterm ? base : base + e.ag * gs;
      }
    }
    // la trille s'arrête juste avant ses notes de terminaison
    for (const tg of termGaps) {
      const tr = evs.find(e => e.orn && e.track === tg.track && Math.abs(e.te - tg.at) < 0.03);
      if (tr) tr.orn = { ...tr.orn, termGap: tg.gap };
    }
    // Trilles : réalisées en valeurs mesurées sur la pulsation, préfixe et terminaison compris (voir realizeTrill)
    const trills = evs.filter(e => e.orn && (e.orn.type === 'trill' || e.orn.type === 'trillh'));
    if (trills.length) {
      const drop = new Set();
      const added = [];
      for (const e of trills) {
        const r = realizeTrill(e, evs, q => tmap(q) - shift);
        if (!r) continue;
        drop.add(e);
        r.used.forEach(x => drop.add(x));
        added.push(...r.notes);
      }
      evs = evs.filter(e => !drop.has(e)).concat(added);
    }
    // Pédale simulée : chaque note sonne jusqu'au prochain changement de pédale (ou au relâchement écrit).
    if (o.pedal && o.pedal.length && !(this._useMidiOut())) {
      const changes = o.pedal.filter(b => !range || (b >= range[0] - 1e-6 && b <= range[1] + 1e-6)).map(b => tmap(b) - shift);
      const ups = (o.pedalUp || []).map(b => tmap(b) - shift);
      const pedalEnd = o.pedalEnd != null ? tmap(o.pedalEnd) - shift : Infinity;
      if (!changes.length) changes.push(0);
      const lastBefore = (list, t) => { let v = -Infinity; for (const x of list) if (x <= t + 0.005 && x > v) v = x; return v; };
      for (const e of evs) {
        if (e.orn || e.trill) continue; // une trille s'arrête à sa valeur écrite
        if (e.ts + 1e-6 < changes[0] || e.ts >= pedalEnd) continue;
        if (lastBefore(ups, e.ts) > lastBefore(changes, e.ts)) continue; // pédale relevée à ce moment
        const nextUp = ups.find(c => c > e.ts + 0.01) ?? Infinity;
        const next = Math.min(changes.find(c => c > e.ts + 0.01) ?? pedalEnd, nextUp, pedalEnd);
        if (next !== Infinity && next > e.te) e.te = next + 0.01;
        else if (next === Infinity) e.te = Math.max(e.te, tmap(range ? range[1] : this.score.totalQ) - shift + 0.6);
      }
    }
    // Ornements réalisés selon le tempo ; accords arpégés égrenés du grave à l'aigu.
    evs = evs.flatMap(e => (e.orn ? expandOrnament(e) : [e]));
    const arps = evs.filter(e => e.arp);
    const groups = new Map();
    for (const e of arps) { const key = Math.round(e.t * 50); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(e); }
    for (const g of groups.values()) { g.sort((a, b) => a.pitch - b.pitch); const step = Math.min(0.03, 0.22 / g.length); g.forEach((e, i) => { e.ts += i * step; }); }
    // Une touche ne peut pas sonner deux fois à la fois : la note précédente s'arrête quand la même touche est rejouée.
    evs.sort((a, b) => a.ts - b.ts || a.pitch - b.pitch);
    const last = new Map();
    for (const e of evs) {
      const prev = last.get(e.pitch);
      if (prev && prev.te > e.ts - 0.004) prev.te = Math.max(prev.ts + 0.03, e.ts - 0.004);
      last.set(e.pitch, e);
    }
    this.qpm = qpm;
    this.tmap = q => tmap(q) - shift;
    this.prepared = evs;
    this.endTime = evs.reduce((m, e) => Math.max(m, e.te), 0);
    return evs;
  }

  _useMidiOut() { return store.get('settings.demoOutput') === 'midi' && midi.hasOutput; }

  async play() {
    const tok = ++this._tok;
    if (currentPlayer && currentPlayer !== this) currentPlayer.stop();
    currentPlayer = this;
    audio.claim(this.id, () => this.stop());
    if (this.playing) this._halt();
    try { await audio.ensure(); }
    catch (e) { if (currentPlayer === this) currentPlayer = null; throw e; }
    // un autre « Écouter » a été touché pendant le chargement : seule la dernière demande joue
    if (tok !== this._tok || currentPlayer !== this) return;
    this.prepare();
    this.playing = true;
    const lead = 0.12;
    const o = this.opts;
    const spq = 60 / this.qpm;
    this.clickNodes = [];
    this.countPlan = null;
    if (o.countIn) {
      // décompte commun (countin.js) : au moins quatre temps, premier clic à l'heure
      const beatSec = this.score.beatQ * spq;
      const pickupBeats = (o.range && o.range[0] > 1e-6) ? 0 : this.score.pickupQ / this.score.beatQ;
      const plan = scheduleCountIn({ beatsPerBar: this.score.barQ / this.score.beatQ, beatSec, sub: o.countSub || 0 });
      this.countPlan = plan;
      this.clickNodes.push(...plan.nodes);
      this.t0 = plan.end - pickupBeats * beatSec;
    } else this.t0 = audio.now() + lead;
    const useMidi = this._useMidiOut();
    for (const e of this.prepared) {
      if (useMidi) {
        midi.outNoteOn(e.pitch, e.vel, audio.ctxToPerf(this.t0 + e.ts));
        midi.outNoteOff(e.pitch, audio.ctxToPerf(this.t0 + e.te));
      } else {
        const v = audio.noteOn(e.pitch, e.vel, this.t0 + e.ts, { owner: this.id });
        if (v) audio.noteOff(v, this.t0 + e.te);
      }
    }
    if (useMidi && o.pedal) {
      for (const b of o.pedal.filter(x => inRange(o.range, x))) {
        const t = this.t0 + this.tmap(b);
        midi.outPedal(false, audio.ctxToPerf(t));
        midi.outPedal(true, audio.ctxToPerf(t + 0.08));
      }
      for (const b of (o.pedalUp || []).filter(x => inRange(o.range, x))) midi.outPedal(false, audio.ctxToPerf(this.t0 + this.tmap(b)));
      midi.outPedal(false, audio.ctxToPerf(this.t0 + this.endTime));
    }
    if (o.click) {
      for (const g of beatGrid(this.score)) if (inRange(o.range, g.q)) this.clickNodes.push(audio.click(this.t0 + this.tmap(g.q), g.isBar ? 'accent' : 'beat'));
    }
    this._emit('play');
    this._loop();
  }

  _loop() {
    const on = new Set();
    const frame = () => {
      if (!this.playing) return;
      if (this.countPlan) {
        const pos = countInPosition(this.countPlan);
        this._emit('count', pos.done ? null : { ...pos, total: this.countPlan.beats, bars: this.countPlan.bars });
        if (pos.done) this.countPlan = null;
      }
      const now = audio.now() - this.t0;
      const cur = new Set();
      for (const e of this.prepared) {
        if (e.char == null) continue;
        const end = Math.min(e.te, e.ts + Math.max(0.12, (this.tmap(e.t + e.dur) - this.tmap(e.t))));
        if (now >= e.ts && now < end) cur.add(e.char);
      }
      for (const c of on) if (!cur.has(c)) { this.score.unmark(c, 'n-on'); on.delete(c); }
      for (const c of cur) if (!on.has(c)) { this.score.mark(c, 'n-on'); on.add(c); }
      this._emit('time', now);
      if (now > this.endTime + 0.1) {
        this.score.clear('n-on');
        if (this.opts.loop) { this.playing = false; this.play(); return; }
        this.stop(true);
        return;
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  _halt(natural = false) {
    const was = this.playing;
    this.playing = false;
    cancelAnimationFrame(this.raf);
    audio.stopAll(this.id);
    if (!natural) audio.cancelClicks(this.clickNodes);
    this.clickNodes = [];
    if (this._useMidiOut() && was && !natural) midi.panic();
    this.score.clear('n-on');
    if (was) this._emit('stop');
  }

  stop(natural = false) {
    this._tok++;
    this._halt(natural);
    if (currentPlayer === this) currentPlayer = null;
    audio.release(this.id);
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(t, d) { this.listeners.forEach(fn => fn(t, d)); }
}

/* ------------------------------------------------------------------ */
/* Étapes communes aux modes d'entraînement                            */
/* ------------------------------------------------------------------ */
function buildSteps(score, hands, range = null) {
  const evs = score.filtered(hands, { noOrnaments: true }).filter(e => (e.dur >= 0.12 || e.char != null) && inRange(range, e.t));
  const steps = [];
  for (const e of evs) {
    const last = steps[steps.length - 1];
    if (last && Math.abs(last.t - e.t) < 0.02) {
      last.notes.push(e);
    } else {
      steps.push({ t: e.t, notes: [e] });
    }
  }
  for (const s of steps) {
    s.pitches = new Set(s.notes.map(n => n.pitch));
    s.chars = [...new Set(s.notes.map(n => n.char).filter(c => c != null))];
  }
  return steps;
}

/* ------------------------------------------------------------------ */
/* Mode attente : le curseur attend la bonne note                      */
/* ------------------------------------------------------------------ */
export class Follower {
  constructor(score, opts = {}) {
    this.score = score;
    this.opts = opts;
    this.active = false;
  }
  start() {
    this.stop();
    this.steps = buildSteps(this.score, this.opts.hands || 'both', this.opts.range);
    this.i = 0;
    this.errors = 0;
    this.wrongNotes = [];
    this.startTime = null;
    this.active = true;
    this.score.clear();
    this._showStep();
    this.offOn = midi.on('noteon', ev => this._onNote(ev));
    window.__follower = this; // accès de test (automatisation)
  }
  _showStep() {
    const s = this.steps[this.i];
    if (!s) return;
    s.remaining = new Set(s.pitches);
    s.hadError = false;
    for (const c of s.chars) this.score.mark(c, 'n-next');
    this.opts.onStep?.(this.i, this.steps.length, s);
    // fait défiler la note visible
    const el = this.score.elementsFor(s.chars[0])[0];
    if (el && this.opts.scroll !== false) {
      const host = this.score.svgHost;
      const r = el.getBoundingClientRect(), hr = host.getBoundingClientRect();
      if (r.left > hr.right - 60 || r.left < hr.left) host.scrollLeft += r.left - hr.left - 60;
    }
  }
  _onNote(ev) {
    if (!this.active) return;
    const s = this.steps[this.i];
    if (!s) return;
    if (this.startTime == null) this.startTime = ev.time;
    if (s.remaining.has(ev.note)) {
      s.remaining.delete(ev.note);
      if (s.remaining.size === 0) {
        for (const c of s.chars) { this.score.unmark(c, 'n-next'); this.score.mark(c, s.hadError ? 'n-late' : 'n-ok'); }
        this.i++;
        if (this.i >= this.steps.length) this._finish(ev.time);
        else this._showStep();
      }
    } else if (!s.pitches.has(ev.note)) {
      this.errors++;
      s.hadError = true;
      this.wrongNotes.push(ev.note);
      for (const c of s.chars) this.score.mark(c, 'n-bad');
      setTimeout(() => { for (const c of s.chars) this.score.unmark(c, 'n-bad'); }, 260);
      this.opts.onError?.(ev.note, s);
    }
  }
  _finish(t) {
    const clean = this.steps.filter(s => !s.hadError).length;
    const res = { steps: this.steps.length, clean, errors: this.errors, seconds: this.startTime != null ? (t - this.startTime) / 1000 : 0 };
    this.stop(false);
    this.opts.onDone?.(res);
  }
  stop(clear = true) {
    this.active = false;
    this.offOn?.();
    this.offOn = null;
    if (clear) this.score.clear('n-next');
  }
}

/* ------------------------------------------------------------------ */
/* Mode en rythme : décompte, métronome, puis évaluation               */
/* ------------------------------------------------------------------ */
export class TempoReader {
  constructor(score, opts = {}) {
    this.score = score;
    this.opts = opts;
    this.active = false;
  }
  async start() {
    this.stop();
    await audio.ensure();
    const o = this.opts;
    const qpm = o.qpm || 60;
    const spq = 60 / qpm;
    const sc = this.score;
    this.steps = buildSteps(sc, o.hands || 'both', o.range);
    const q0 = o.range ? o.range[0] : 0, q1 = o.range ? o.range[1] : sc.totalQ;
    this.q0 = q0;
    const expected = [];
    for (const s of this.steps) for (const n of s.notes) expected.push({ pitch: n.pitch, t: s.t, char: n.char });
    this.expected = expected;
    this.played = [];
    this.active = true;
    sc.clear();
    const beatSec = sc.beatQ * spq;
    // décompte commun (countin.js) : au moins quatre temps, premier clic à l'heure, affichage calé sur le son
    const plan = scheduleCountIn({ beatsPerBar: sc.barQ / sc.beatQ, beatSec, sub: o.countSub || 0 });
    this.countPlan = plan;
    this.clickNodes = plan.nodes.slice();
    const startMusic = plan.end - (q0 > 1e-6 ? 0 : sc.pickupQ * spq);
    // clics pendant le morceau
    if (o.click !== false) {
      for (const g of beatGrid(sc)) if (inRange(o.range, g.q)) this.clickNodes.push(audio.click(startMusic + (g.q - q0) * spq, g.isBar ? 'accent' : 'beat'));
    }
    this.zeroPerf = audio.ctxToPerf(startMusic);
    this.spqMs = spq * 1000;
    this.endPerf = this.zeroPerf + (q1 - q0 + sc.beatQ) * this.spqMs;
    // instants de jeu corrigés de la latence de l'entrée (piano, écran…)
    this.offOn = midi.on('noteon', ev => { if (this.active) this.played.push({ pitch: ev.note, time: corrected(ev) }); });
    window.__tempoReader = this; // accès de test (automatisation)
    // curseur
    const on = new Set();
    let counting = true;
    const frame = () => {
      if (!this.active) return;
      if (counting) {
        const pos = countInPosition(plan);
        o.onCount?.(pos.done || performance.now() >= this.zeroPerf ? null : { ...pos, total: plan.beats, bars: plan.bars });
        if (pos.done || performance.now() >= this.zeroPerf) counting = false;
      }
      const nowQ = (performance.now() - this.zeroPerf) / this.spqMs + this.q0;
      const cur = new Set();
      for (const s of this.steps) {
        if (nowQ >= s.t && nowQ < s.t + Math.max(0.25, Math.min(1, s.notes[0].dur))) s.chars.forEach(c => cur.add(c));
      }
      for (const c of on) if (!cur.has(c)) { sc.unmark(c, 'n-on'); on.delete(c); }
      for (const c of cur) if (!on.has(c)) { sc.mark(c, 'n-on'); on.add(c); }
      o.onTime?.(nowQ);
      if (performance.now() > this.endPerf) { sc.clear('n-on'); this._evaluate(); return; }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }
  _evaluate() {
    const sc = this.score;
    const winMs = Math.min(380, 0.45 * this.spqMs * Math.max(1, sc.beatQ));
    const okMs = Math.max(90, Math.min(160, 0.2 * this.spqMs));
    const used = new Set();
    const results = [];
    for (const ex of this.expected) {
      const target = this.zeroPerf + (ex.t - this.q0) * this.spqMs;
      let best = -1, bestDt = Infinity;
      this.played.forEach((p, i) => {
        if (used.has(i) || p.pitch !== ex.pitch) return;
        const dt = p.time - target;
        if (Math.abs(dt) < Math.abs(bestDt) && Math.abs(dt) <= winMs) { best = i; bestDt = dt; }
      });
      if (best >= 0) { used.add(best); results.push({ ...ex, dt: bestDt, status: Math.abs(bestDt) <= okMs ? 'ok' : 'late' }); }
      else results.push({ ...ex, dt: null, status: 'miss' });
    }
    // marquage par élément (une note fausse dans l'accord colore l'accord)
    const byChar = new Map();
    for (const r of results) {
      if (r.char == null) continue;
      const prev = byChar.get(r.char);
      const rank = { ok: 0, late: 1, miss: 2 };
      if (!prev || rank[r.status] > rank[prev]) byChar.set(r.char, r.status);
    }
    for (const [c, st] of byChar) sc.mark(c, st === 'ok' ? 'n-ok' : st === 'late' ? 'n-late' : 'n-bad');
    const matched = results.filter(r => r.dt != null);
    const res = {
      total: results.length,
      ok: results.filter(r => r.status === 'ok').length,
      late: results.filter(r => r.status === 'late').length,
      miss: results.filter(r => r.status === 'miss').length,
      extra: this.played.length - used.size,
      meanAbsMs: matched.length ? mean(matched.map(r => Math.abs(r.dt))) : 0,
      medianMs: matched.length ? median(matched.map(r => r.dt)) : 0,
    };
    res.accuracy = res.total ? (res.ok + res.late) / res.total : 0;
    res.precision = res.total ? res.ok / res.total : 0;
    res.items = results.map(r => ({ t: r.t, status: r.status }));
    this.stop(false);
    this.opts.onDone?.(res);
  }
  stop(clear = true) {
    if (this.active && clear) audio.cancelClicks(this.clickNodes); // arrêt avant la fin : on coupe les clics restants
    this.clickNodes = [];
    this.active = false;
    cancelAnimationFrame(this.raf);
    this.offOn?.();
    this.offOn = null;
    if (clear) this.score.clear('n-on');
  }
}
