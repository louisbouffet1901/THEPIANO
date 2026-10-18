// Vérifications des paliers d'improvisation (V5) : fonctions pures, sans dépendance au piano ni au son.
// Une prise = les notes jouées (hauteur, début et durée en temps depuis le début de la grille, force) et la grille.
// analyzeTake() place chaque note sur la grille (accord, mesure, temps fort, rôle dans l'harmonie) et en tire
// la mélodie (la note la plus aiguë de chaque attaque) ; chaque vérification renvoie { ok, line }.
import { CHORDS, SCALES, pc, noteNameFr } from './util.js';

export const TOL = 0.2; // tolérance rythmique, en temps (± 160 à 200 ms aux tempos des leçons)
const PC_FLAT = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];
const PC_SHARP = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
const SHARP_KEYS = { maj: [7, 2, 9, 4, 11, 6], min: [4, 11, 6, 1, 8, 9, 2, 7] };
/** Nom d'une classe de hauteur dans la tonalité de l'accord (dièses dans les tonalités à dièses). */
export function pcNameIn(p, ch) {
  const sharp = ch && (SHARP_KEYS[ch.mode] || []).includes(ch.tonic % 12);
  return (sharp ? PC_SHARP : PC_FLAT)[pc(p)];
}
const nm = (m, ch) => pcNameIn(m, ch);
const pct = x => `${Math.round(x * 100)}\u202F%`;
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

export const chordPcs = ch => CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
export const scalePcsOf = (scale, ch) => (scale || (ch.mode === 'maj' ? SCALES.maj : SCALES.harmMin)).map(x => (ch.tonic + x) % 12);

/* ------------------------------------------------------------------ */
/* Placement des notes sur la grille                                   */
/* ------------------------------------------------------------------ */
/**
 * take : { meter, timeline (accords : at, beats, root, q, tonic, mode, bass?, bassM?, silent?), scale?, split,
 *          notes: [{ m, b, d, v }] (toutes les notes, deux mains ; b et d en temps), end (temps écoulés à l'arrêt),
 *          targetAt?(i) (note d'appui de l'accord n° i, toutes boucles comprises), chordTargets? }
 */
export function analyzeTake(take) {
  const { meter, timeline } = take;
  const total = timeline.totalBeats ?? timeline.reduce((a, c) => a + c.beats, 0);
  const split = take.split ?? 60;
  const len = timeline.length;
  const place = n => {
    const near = Math.abs(n.b - Math.round(n.b)) < TOL;
    const bq = near ? Math.round(n.b) : n.b;            // une note un peu en avance appartient au temps suivant
    const x = Math.max(0, bq);
    const loop = Math.floor(x / total);
    const g = x - loop * total;
    let k = timeline.findIndex(c => g >= c.at - 1e-6 && g < c.at + c.beats - 1e-6);
    if (k < 0) k = len - 1;
    const ch = timeline[k];
    const bar = Math.floor(x / meter + 1e-6);
    const pos = x - bar * meter;
    const bi = Math.round(pos) % meter;
    const strong = near && (bi === 0 || (meter === 4 && bi === 2));
    const pcs = chordPcs(ch);
    const kind = pcs.includes(pc(n.m)) ? 'chord' : scalePcsOf(take.scale, ch).includes(pc(n.m)) ? 'scale' : 'chrom';
    return { ...n, bq, near, loop, g, k, i: loop * len + k, ch, bar, pos, strong, kind, half: Math.abs(pos - Math.floor(pos) - 0.5) < TOL };
  };
  const all = (take.notes || []).filter(n => n.b >= -0.4).map(place).sort((a, b) => a.b - b.b);
  const rh = all.filter(n => n.m >= split);
  const lh = all.filter(n => n.m < split);
  // mélodie : une attaque = les notes commencées à moins de 0,12 temps l'une de l'autre ; on garde la plus aiguë
  const mel = [];
  for (const n of rh) {
    const last = mel[mel.length - 1];
    if (last && n.b - last.b0 < 0.12) {
      last.size++;
      if (n.m > last.m) Object.assign(last, { ...n, b0: last.b0, b: last.b, bq: last.bq, near: last.near, strong: last.strong, bar: last.bar, pos: last.pos, size: last.size });
      last.v = Math.max(last.v || 0, n.v || 0);
    } else mel.push({ ...n, b0: n.b, size: 1 });
  }
  const firstB = mel.length ? mel[0].b : 0;
  const lastB = mel.length ? mel[mel.length - 1].b : 0;
  const end = Math.max(take.end ?? 0, lastB + 1);
  return { take, meter, total, len, timeline, all, rh, lh, mel, firstB, lastB, end, barsGrid: Math.round(total / meter) };
}

/* ------------------------------------------------------------------ */
/* Figures de diminution (sur la mélodie)                              */
/* ------------------------------------------------------------------ */
const step12 = d => Math.abs(d) >= 1 && Math.abs(d) <= 2;
const sgn = x => (x > 0 ? 1 : x < 0 ? -1 : 0);
/** Repère les figures dans une suite de notes { m, b, kind, strong, near } (triée). Renvoie { type: [indices] }. */
export function findFigures(mel) {
  const out = { broderie: [], chromatique: [], passage: [], appoggiature: [], retard: [], double: [], schleifer: [], fioriture: [], pointe: [] };
  const n = mel.length;
  for (let i = 0; i + 2 < n; i++) {
    const a = mel[i], b = mel[i + 1], c = mel[i + 2];
    if (c.b - a.b > 3.01) continue;
    // broderie : on quitte la note pour sa voisine, et on revient
    if (a.m === c.m && step12(b.m - a.m) && a.kind === 'chord') {
      out.broderie.push(i);
      if (Math.abs(b.m - a.m) === 1 && b.kind === 'chrom') out.chromatique.push(i);
    }
    // double broderie : les deux voisines (au-dessus et au-dessous), puis la note visée (une note de l'accord)
    const da = a.m - c.m, db = b.m - c.m;
    if (c.kind === 'chord' && step12(da) && step12(db) && sgn(da) === -sgn(db)) out.double.push(i);
    // gruppetto : voisine du dessus, la note, voisine du dessous, la note
    if (i + 3 < n) {
      const d = mel[i + 3];
      if (b.m === d.m && step12(a.m - b.m) && step12(c.m - b.m) && sgn(a.m - b.m) === -sgn(c.m - b.m) && d.b - a.b <= 3.01 && d.kind === 'chord') out.double.push(i);
    }
    // deux notes conjointes qui mènent à une note de l'accord sur un temps fort (Schleifer)
    if (c.strong && c.kind === 'chord' && step12(b.m - a.m) && step12(c.m - b.m) && sgn(b.m - a.m) === sgn(c.m - b.m) && b.kind !== 'chord') out.schleifer.push(i);
  }
  // notes de passage : d'une note de l'accord à une autre par degrés conjoints, dans le même sens
  for (let i = 0; i + 2 < n; i++) {
    const a = mel[i];
    if (a.kind !== 'chord') continue;
    let j = i + 1, dir = 0, ok = false;
    while (j < n && j - i <= 4) {
      const d = mel[j].m - mel[j - 1].m;
      if (!step12(d) || (dir && sgn(d) !== dir)) break;
      dir = sgn(d);
      if (mel[j].kind === 'chord') { ok = j - i >= 2; break; }
      j++;
    }
    if (ok && mel[j].b - a.b <= 4.01) { out.passage.push(i); i = j - 1; }
  }
  // appoggiature : note étrangère sur un temps (fort ou non), résolue d'un degré sur une note de l'accord ; retard si préparée
  for (let i = 0; i + 1 < n; i++) {
    const a = mel[i], b = mel[i + 1];
    if (a.near && a.kind !== 'chord' && step12(b.m - a.m) && b.kind === 'chord' && b.b - a.b <= 2.01 && b.b - a.b > 0.2) {
      out.appoggiature.push(i);
      const p = mel[i - 1];
      if (p && p.m === a.m && p.kind === 'chord') out.retard.push(i);
    }
  }
  // fioriture : au moins cinq notes rapides dans un même temps (ou un peu plus), d'un seul geste
  for (let i = 0; i + 4 < n; i++) {
    let j = i + 4;
    if (mel[j].b - mel[i].b > 1.3) continue;
    while (j + 1 < n && mel[j + 1].b - mel[i].b <= 1.3) j++;
    out.fioriture.push(i);
    i = j;
  }
  // rythme pointé : longue – brève, la longue valant trois fois la brève (croche pointée – double, noire pointée – croche)
  for (let i = 0; i + 2 < n; i++) {
    const d1 = mel[i + 1].b - mel[i].b, d2 = mel[i + 2].b - mel[i + 1].b;
    const sumOk = [1, 2].some(s => Math.abs(d1 + d2 - s) < 0.2);
    if (sumOk && Math.abs(d1 - 3 * d2) < 0.3 * (d1 + d2) && d2 > 0.1) { out.pointe.push(i); i++; }
  }
  return out;
}
export const FIG_LABEL = {
  // [singulier, pluriel, définition, féminin]
  broderie: ['broderie', 'broderies', 'on quitte une note de l’accord pour sa voisine, et on revient (mi – fa – mi)', true],
  chromatique: ['broderie chromatique', 'broderies chromatiques', 'la voisine à un demi-ton, hors de la gamme (do – si♮ – do en fa mineur)', true],
  passage: ['note de passage', 'notes de passage', 'de une note de l’accord à une autre, par degrés conjoints (mi – ré – do)', true],
  appoggiature: ['appoggiature', 'appoggiatures', 'une note étrangère sur le temps, qui retombe d’un degré sur une note de l’accord', true],
  retard: ['retard', 'retards', 'une note de l’accord gardée (ou rejouée) sur l’accord suivant, où elle frotte, puis qui descend d’un degré', false],
  double: ['double broderie', 'doubles broderies', 'les deux voisines de la note, puis la note (mi♮ – sol – fa), ou le gruppetto (sol – fa – mi – fa)', true],
  schleifer: ['approche par deux notes', 'approches par deux notes', 'deux notes conjointes qui glissent vers une note de l’accord sur le temps fort', true],
  fioriture: ['fioriture', 'fioritures', 'au moins cinq notes rapides dans un temps, d’un seul geste, qui retombent sur la note suivante', true],
  pointe: ['rythme pointé', 'rythmes pointés', 'une longue et une brève, la longue valant trois fois la brève', false],
  approche: ['figure d’approche', 'figures d’approche', 'deux notes conjointes, une double broderie ou un gruppetto, qui mènent à une note de l’accord', true],
  ornement: ['ornement', 'ornements', 'broderie, passage, double broderie, appoggiature ou fioriture', false],
};
const un = f => (FIG_LABEL[f]?.[3] ? 'une' : 'un');

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */
/** Attaques d'une mesure (positions arrondies à la croche), pour comparer des rythmes. */
const barOnsets = (mel, bar, meter) => new Set(mel.filter(n => n.bar === bar).map(n => Math.round(n.pos * 2) / 2 % meter));
const jacc = (a, b) => { if (!a.size && !b.size) return 1; const inter = [...a].filter(x => b.has(x)).length; return inter / (a.size + b.size - inter); };
const notesInBars = (mel, from, to) => mel.filter(n => n.bar >= from && n.bar < to);
const median = arr => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const mean = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
/** Mesures couvertes par la prise (de la première à la dernière attaque). */
const span = A => (A.mel.length ? { from: A.mel[0].bar, to: A.mel[A.mel.length - 1].bar, n: A.mel[A.mel.length - 1].bar - A.mel[0].bar + 1 } : { from: 0, to: -1, n: 0 });
/** Cycles complets de la grille joués (au moins les trois quarts des mesures avec des notes). */
function cycles(A) {
  const out = [];
  const nb = A.barsGrid;
  const maxLoop = Math.floor(A.end / A.total + 1e-6);
  for (let L = 0; L <= maxLoop; L++) {
    const from = L * nb, to = from + nb;
    const bars = new Set(notesInBars(A.mel, from, to).map(n => n.bar));
    if (bars.size >= Math.max(2, nb * 0.6)) out.push({ L, from, to });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Les vérifications                                                   */
/* ------------------------------------------------------------------ */
// Chaque entrée : (A, params, ctx) => { ok, line }. ctx : { segResults, targetAt, chordTargets, figures }.
export const CHECKS = {
  /** Sans t'arrêter : au moins `bars` mesures, et jamais plus d'une mesure et demie sans nouvelle note. */
  nonstop(A, { bars = 8, rests = false }) {
    const mel = A.mel;
    if (mel.length < 3) return { ok: false, line: `Joue au moins ${bars} mesures sans t’arrêter (presque rien reçu cette fois).` };
    const nBars = Math.floor((mel[mel.length - 1].b - mel[0].b) / A.meter + 1e-6) + 1;
    let stop = null;
    const maxGap = A.meter * (rests ? 2 : 1) + A.meter * 0.5 + 0.01;
    for (let i = 1; i < mel.length; i++) if (mel[i].b - mel[i - 1].b > maxGap) { stop = mel[i - 1].bar + 1; break; }
    if (stop != null) return { ok: false, line: `Un arrêt de plus d’une mesure, vers la mesure ${stop + 1} : si tu hésites, tiens une note ou rejoue ton motif, mais garde la pulsation.` };
    if (nBars < bars) return { ok: false, line: `Joue au moins ${bars} mesures d’affilée (${nBars} cette fois).` };
    return { ok: true, line: `Tu n’as pas arrêté : ${nBars} mesures d’affilée.` };
  },
  /** Rester dans la gamme donnée (pentatonique…). */
  scale(A, { min = 0.9 }) {
    const n = A.rh.length;
    if (n < 4) return { ok: false, line: 'Joue au moins quelques notes à la main droite.' };
    const inSc = A.rh.filter(x => x.kind !== 'chrom').length;
    const r = inSc / n;
    return r >= min ? { ok: true, line: `Tu restes sur les notes de la gamme (${pct(r)}).` } : { ok: false, line: `${plural(n - inSc, 'note est sortie', 'notes sont sorties')} de la gamme : reste sur les touches colorées du clavier.` };
  },
  /** Notes de l'accord sur les temps forts. */
  strong(A, { min = 0.7 }) {
    const s = A.mel.filter(x => x.strong);
    if (s.length < 4) return { ok: false, line: 'Joue une note sur chaque temps fort (le 1er temps, et le 3e à quatre temps) : il n’y en a presque pas.' };
    const ok = s.filter(x => x.kind === 'chord').length;
    const r = ok / s.length;
    return r >= min ? { ok: true, line: `Temps forts sur une note de l’accord : ${ok}/${s.length}.` } : { ok: false, line: `Temps forts sur une note de l’accord : ${ok}/${s.length} (objectif ${pct(min)}). Sur le temps fort, une note verte ; les autres notes vont entre les temps.` };
  },
  /** Un rythme imposé : valeurs longues, noires, croches, ou un rythme pointé. */
  rhythm(A, { v, min = 2 }) {
    const mel = A.mel;
    const sp = span(A);
    if (mel.length < 3 || !sp.n) return { ok: false, line: 'Joue au moins quelques mesures.' };
    const per = mel.length / sp.n;
    const onBeat = mel.filter(x => x.near).length / mel.length;
    const m = A.meter;
    if (v === 'longues') {
      const max = m === 2 ? 1.3 : 2.3;
      if (per > max) return { ok: false, line: `Trop de notes (${per.toFixed(1)} par mesure) : une ou deux par mesure, en valeurs longues, posées sur les temps forts.` };
      if (onBeat < 0.8) return { ok: false, line: 'Pose chaque note sur un temps (le premier surtout), pas entre les temps.' };
      return { ok: true, line: `Valeurs longues sur les temps (${per.toFixed(1)} note par mesure) : le squelette s’entend.` };
    }
    if (v === 'noires') {
      if (per < 0.6 * m) return { ok: false, line: `Une note par temps : il en manque (${per.toFixed(1)} par mesure de ${m} temps).` };
      if (per > 1.35 * m) return { ok: false, line: `Une note par temps, pas plus (${per.toFixed(1)} par mesure) : les croches viendront dans un exercice suivant.` };
      if (onBeat < 0.8) return { ok: false, line: `Joue sur les temps : ${pct(onBeat)} de tes notes y sont.` };
      return { ok: true, line: `Une note par temps, bien en place (${pct(onBeat)} sur les temps).` };
    }
    if (v === 'croches') {
      const off = mel.filter(x => x.half).length / mel.length;
      if (per < 1.4 * m) return { ok: false, line: `En croches : deux notes par temps (${per.toFixed(1)} par mesure cette fois).` };
      if (off < 0.25) return { ok: false, line: 'Joue aussi entre les temps (sur le « et ») : c’est là que vont les notes de passage.' };
      return { ok: true, line: `En croches, régulières (${per.toFixed(1)} notes par mesure).` };
    }
    if (v === 'pointe') {
      const k = findFigures(mel).pointe.length;
      return k >= min ? { ok: true, line: `${plural(k, 'rythme pointé', 'rythmes pointés')} : la longue appuie, la brève lance la suivante.` } : { ok: false, line: `Rythmes pointés : ${k}/${min}. Une longue, puis une brève qui lance la note suivante (comme do – si♮ – do dans ton nocturne).` };
    }
    return { ok: true, line: '' };
  },
  /** Notes d'appui (squelette) posées à temps, au début de chaque mesure ou de chaque accord. */
  targets(A, { min = 0.75 }, ctx) {
    const units = targetUnits(A, ctx);
    if (!units.length) return { ok: false, line: 'Pose la note en or au début de chaque mesure.' };
    const hit = units.filter(u => u.hit).length;
    const r = hit / units.length;
    const miss = units.find(u => !u.hit);
    const where = ctx.chordTargets ? 'au début de chaque accord' : 'au premier temps';
    return r >= min ? { ok: true, line: `Notes d’appui posées à temps : ${hit}/${units.length}.` }
      : { ok: false, line: `Notes d’appui : ${hit}/${units.length} (objectif ${pct(min)}). Pose la note en or ${where}${miss ? ` (manquée : mesure ${miss.bar + 1}, ${nm(miss.target, miss.ch)})` : ''} ; entre elles, c’est libre.` };
  },
  /** Appoggiatures : la note en or au premier temps, puis un degré plus bas sur une note de l'accord. */
  appog(A, { min = 0.75 }, ctx) {
    const units = targetUnits(A, ctx);
    if (!units.length) return { ok: false, line: 'Pose l’appoggiature (la note en or) au premier temps de chaque mesure.' };
    const hits = units.filter(u => u.hit);
    const res = hits.filter(u => { const k = A.mel.findIndex(x => x.b > u.at + 0.15); const nx = A.mel[k]; return nx && nx.b - u.at <= 2.2 && u.hitNote - nx.m >= 1 && u.hitNote - nx.m <= 2 && nx.kind === 'chord'; });
    const ok = hits.length / units.length >= min && res.length >= Math.ceil(hits.length * 0.75);
    return ok ? { ok: true, line: `Appoggiatures posées : ${hits.length}/${units.length}, résolues d’un degré vers le bas : ${res.length}/${hits.length}.` }
      : { ok: false, line: `Appoggiatures posées : ${hits.length}/${units.length}, résolues : ${res.length}/${Math.max(1, hits.length)}. Après la note en or, descends d’un degré (un ton ou un demi-ton) sur une note de l’accord.` };
  },
  /** Phrases et silences : `play` mesures jouées, `rest` mesures d'écoute, en alternance. */
  rests(A, { play = 2, rest = 2 }) {
    const cyc = play + rest;
    const sp = span(A);
    const lastBar = Math.max(sp.to, Math.floor(A.end / A.meter + 1e-6) - 1);
    if (lastBar + 1 < cyc * 2) return { ok: false, line: `Joue au moins deux fois « ${play} mesures jouées, ${rest} d’écoute » (${cyc * 2} mesures).` };
    let restOk = 0, restN = 0, playOk = 0, playN = 0;
    const bad = [];
    for (let bar = 0; bar <= lastBar; bar++) {
      const inRest = bar % cyc >= play;
      // une levée dans la dernière demi-mesure d'écoute est permise
      const ons = A.mel.filter(n => n.bar === bar && !(inRest && bar % cyc === cyc - 1 && n.pos >= A.meter - 1.01));
      if (inRest) { restN++; if (ons.length === 0) restOk++; else if (bad.length < 3) bad.push(bar + 1); } else { playN++; if (ons.length >= 1) playOk++; }
    }
    const ok = restOk >= restN * 0.8 && playOk >= playN * 0.75;
    return ok ? { ok: true, line: `Tes phrases respirent : ${play} mesures jouées, ${rest} d’écoute (${restOk}/${restN} silences tenus).` }
      : { ok: false, line: restOk < restN * 0.8 ? `Pendant les mesures d’écoute (${bad.join(', ')}…), ne joue pas : laisse sonner l’accompagnement, et reprends au début de la mesure suivante.` : `Pendant les mesures jouées, joue ta phrase (${playOk}/${playN} mesures jouées).` };
  },
  /** Fins de phrase sur une note stable (une note de l'accord, ou la tonique). */
  phraseEnd(A, { on = 'chord', min = 0.75 }) {
    const ph = phrases(A);
    if (ph.length < 2) return { ok: false, line: 'Fais des phrases : laisse au moins un temps de silence entre elles.' };
    const good = ph.filter(p => { const l = p[p.length - 1]; return on === 'tonic' ? pc(l.m) === l.ch.tonic % 12 : l.kind === 'chord'; });
    const r = good.length / ph.length;
    const what = on === 'tonic' ? 'la tonique' : 'une note de l’accord';
    return r >= min ? { ok: true, line: `Tes phrases se posent sur ${what} : ${good.length}/${ph.length}.` } : { ok: false, line: `Fins de phrase sur ${what} : ${good.length}/${ph.length}. Termine chaque phrase sur une note stable, en valeur longue.` };
  },
  /** Le motif : le rythme de la première mesure revient. */
  motif(A, { min = 3 }) {
    const bars = [...new Set(A.mel.map(n => n.bar))];
    const ref = bars.find(b => barOnsets(A.mel, b, A.meter).size >= 2);
    if (ref == null) return { ok: false, line: 'Un motif, c’est au moins deux ou trois notes avec un rythme : commence par une mesure bien dessinée.' };
    const R = barOnsets(A.mel, ref, A.meter);
    const k = bars.filter(b => b >= ref && jacc(barOnsets(A.mel, b, A.meter), R) >= 0.6).length;
    return k >= min ? { ok: true, line: `On reconnaît ton motif ${k} fois.` } : { ok: false, line: `Ton motif (le rythme de ta première mesure) ne revient que ${k} fois sur ${min} : rejoue-le, quitte à changer les notes.` };
  },
  /** Une figure de diminution, au moins `min` fois. */
  figure(A, { f, min = 1 }, ctx) {
    const figs = ctx.figures || (ctx.figures = findFigures(A.mel));
    const list = f === 'approche' ? [...figs.double, ...figs.schleifer] : f === 'ornement' ? [...figs.broderie, ...figs.passage, ...figs.double, ...figs.appoggiature, ...figs.fioriture, ...figs.schleifer] : figs[f] || [];
    const k = new Set(list).size;
    const [one, many, def, fem] = FIG_LABEL[f];
    const e = fem ? 'e' : '';
    return k >= min ? { ok: true, line: `${plural(k, one, many)} entendu${e}${k > 1 ? 's' : ''}.` }
      : { ok: false, line: `${k ? plural(k, one, many) : (fem ? 'Aucune ' : 'Aucun ') + one} sur ${min} demandé${e}${min > 1 ? 's' : ''} : ${def}.` };
  },
  /** Mouvement conjoint : la plupart des intervalles d'un ton au plus (ou d'une tierce au plus avec max: 4), note tenue comprise. */
  stepwise(A, { min = 0.7, max = 2 }) {
    const mel = A.mel;
    if (mel.length < 4) return { ok: false, line: 'Joue au moins quelques notes.' };
    let k = 0;
    for (let i = 1; i < mel.length; i++) if (Math.abs(mel[i].m - mel[i - 1].m) <= max) k++;
    const r = k / (mel.length - 1);
    const what = max <= 2 ? 'd’un ton au plus' : 'd’une tierce au plus';
    return r >= min ? { ok: true, line: `La ligne avance par petits pas (${pct(r)} des intervalles ${what}).` } : { ok: false, line: `Trop de sauts : ${pct(r)} seulement des intervalles ${what}. Va vers la note de l’accord la plus proche.` };
  },
  /** Peu de notes (ou assez de notes) par mesure. */
  density(A, { max = Infinity, min = 0 }) {
    const sp = span(A);
    if (!sp.n) return { ok: false, line: 'Joue au moins quelques mesures.' };
    const per = A.mel.length / sp.n;
    if (per > max) return { ok: false, line: `${per.toFixed(1)} notes par mesure : moins, et plus longues (au plus ${max} en moyenne).` };
    if (per < min) return { ok: false, line: `${per.toFixed(1)} note par mesure : il en faut davantage (au moins ${min}).` };
    return { ok: true, line: `${per.toFixed(1)} note${per >= 2 ? 's' : ''} par mesure en moyenne : ${max < Infinity ? 'la mélodie respire' : 'le mouvement est là'}.` };
  },
  /** Le sommet (la note la plus aiguë) dans les mesures `from` à `to` de la grille. */
  peak(A, { from = 5, to = 7 }) {
    const cs = cycles(A);
    if (!cs.length) return { ok: false, line: 'Joue la grille entière une fois.' };
    let good = 0, last = null;
    for (const c of cs) {
      const ns = notesInBars(A.mel, c.from, c.to);
      const top = ns.reduce((a, b) => (b.m > a.m ? b : a), ns[0]);
      const bar = top.bar - c.from + 1;
      last = { top, bar };
      if (bar >= from && bar <= to) good++;
    }
    return good >= Math.ceil(cs.length / 2) ? { ok: true, line: `Le sommet (${nm(last.top.m, last.top.ch)}) arrive en mesure ${last.bar}, avant la fin.` }
      : { ok: false, line: `Ta note la plus aiguë est en mesure ${last.bar} : garde-la pour les mesures ${from} à ${to}, juste avant la cadence.` };
  },
  /** Période : demi-cadence à la mesure `half` (pas la tonique, une note de l'accord, tenue), cadence parfaite à `full`. */
  cadences(A, { half = 4, full = 8 }) {
    const cs = cycles(A);
    if (!cs.length) return { ok: false, line: 'Joue les huit mesures en entier.' };
    let good = 0;
    let why = '';
    for (const c of cs) {
      const ant = A.mel.filter(n => n.bar >= c.from && n.bar < c.from + half);
      const con = A.mel.filter(n => n.bar >= c.from + half && n.bar < c.from + full);
      const a = ant[ant.length - 1], b = con[con.length - 1];
      if (!a || !b) { why = 'Joue les deux moitiés, question et réponse.'; continue; }
      const t = a.ch.tonic % 12;
      const aOk = pc(a.m) !== t && a.kind === 'chord';
      const held = (c.from + half) * A.meter - a.b >= 0.9;
      const bOk = pc(b.m) === b.ch.tonic % 12;
      if (aOk && held && bOk) good++;
      else why = !aOk ? `Mesure ${half} : arrête la question sur une note de l’accord qui n’est pas la tonique (${pcNameIn(a.ch.tonic, a.ch)}), pour qu’on attende la suite.`
        : !held ? `Mesure ${half} : tiens la note de la demi-cadence au moins un temps : on doit entendre la question.`
          : `Mesure ${full} : finis sur la tonique (${pcNameIn(b.ch.tonic, b.ch)}).`;
    }
    return good >= Math.ceil(cs.length / 2) ? { ok: true, line: `Une question qui s’arrête en mesure ${half}, une réponse qui conclut sur la tonique en mesure ${full}.` } : { ok: false, line: why };
  },
  /** Le début revient : la mesure `b` reprend le rythme (ou les premières notes) de la mesure `a`. */
  repeatStart(A, { a = 1, b = 5 }) {
    const cs = cycles(A);
    if (!cs.length) return { ok: false, line: 'Joue les huit mesures en entier.' };
    let good = 0;
    for (const c of cs) {
      const ra = barOnsets(A.mel, c.from + a - 1, A.meter), rb = barOnsets(A.mel, c.from + b - 1, A.meter);
      const pa = A.mel.filter(n => n.bar === c.from + a - 1).slice(0, 3).map(n => pc(n.m)), pb = A.mel.filter(n => n.bar === c.from + b - 1).slice(0, 3).map(n => pc(n.m));
      const same = pa.filter((x, i) => pb[i] === x).length;
      if (jacc(ra, rb) >= 0.6 || (pa.length >= 2 && same >= 2)) good++;
    }
    return good >= Math.ceil(cs.length / 2) ? { ok: true, line: `La mesure ${b} reprend le début de la mesure ${a} : on reconnaît le retour.` } : { ok: false, line: `Mesure ${b} : reprends le rythme (et si possible les premières notes) de la mesure ${a}.` };
  },
  /** Marche : le modèle (mesures from…from+len) recopié `reps` fois, un degré plus haut (dir +1) ou plus bas (−1). */
  sequence(A, { from = 1, len = 2, reps = 2, dir = -1 }) {
    // chaque tour de la grille où le modèle a été joué (pas besoin de jouer la grille entière)
    const nLoops = Math.floor(A.end / A.total + 1e-6) + 1;
    const cs = Array.from({ length: nLoops }, (_, L) => ({ from: L * A.barsGrid }));
    let best = null;
    for (const c of cs) {
      const m0 = c.from + from - 1;
      const model = notesInBars(A.mel, m0, m0 + len);
      if (model.length < 2) { best = best || { ok: false, line: 'Joue un modèle d’au moins deux ou trois notes.' }; continue; }
      const res = [];
      for (let r = 1; r <= reps; r++) {
        const s = m0 + r * len;
        const copy = notesInBars(A.mel, s, s + len);
        let rs = 0;
        for (let k = 0; k < len; k++) rs += jacc(barOnsets(A.mel, m0 + k, A.meter), barOnsets(A.mel, s + k, A.meter));
        rs /= len;
        const sg = arr => arr.slice(1).map((x, i) => sgn(x.m - arr[i].m));
        const s1 = sg(model), s2 = sg(copy);
        const nI = Math.min(s1.length, s2.length);
        const cs2 = nI ? s1.slice(0, nI).filter((x, i) => x === s2[i]).length / nI : 0;
        const shift = copy.length ? copy[0].m - model[0].m : 0;
        const want = dir * r;
        const shiftOk = copy.length && sgn(shift) === sgn(want) && Math.abs(shift) >= Math.abs(want) * 0.5 && Math.abs(shift) <= Math.abs(want) * 2.5 + 0.5;
        res.push({ r, ok: rs >= 0.6 && cs2 >= 0.6 && shiftOk, rs, cs2, shiftOk });
      }
      if (!res.length) continue;
      const bad = res.find(x => !x.ok);
      if (!bad) return { ok: true, line: `Ton modèle revient ${reps} fois, chaque fois un degré plus ${dir < 0 ? 'bas' : 'haut'} : c’est une marche.` };
      best = { ok: false, line: `Reprise ${bad.r} : ${bad.rs < 0.6 ? 'garde le même rythme que le modèle' : bad.cs2 < 0.6 ? 'garde le même dessin (les mêmes montées et descentes)' : `pars un degré plus ${dir < 0 ? 'bas' : 'haut'} que la reprise précédente`}.` };
    }
    return best || { ok: false, line: 'Joue un modèle d’au moins deux ou trois notes, puis ses reprises.' };
  },
  /** ABA : B se distingue de A par au moins deux choses (registre, nombre de notes, nuance, toucher). */
  contrast(A, { a = [1, 8], b = [9, 16] }) {
    const na = notesInBars(A.mel, a[0] - 1, a[1]), nb = notesInBars(A.mel, b[0] - 1, b[1]);
    if (na.length < 4 || nb.length < 4) return { ok: false, line: 'Joue les deux sections, A puis B.' };
    const diff = [];
    if (Math.abs(median(na.map(n => n.m)) - median(nb.map(n => n.m))) >= 5) diff.push('le registre');
    const da = na.length / (a[1] - a[0] + 1), db = nb.length / (b[1] - b[0] + 1);
    if (Math.max(da, db) / Math.max(0.1, Math.min(da, db)) >= 1.5) diff.push('le nombre de notes');
    if (Math.abs(mean(na.map(n => n.v || 64)) - mean(nb.map(n => n.v || 64))) >= 12) diff.push('la nuance');
    const la = mean(na.map(n => n.d || 0.5)), lb = mean(nb.map(n => n.d || 0.5));
    if (Math.max(la, lb) / Math.max(0.05, Math.min(la, lb)) >= 1.6) diff.push('le toucher (lié ou détaché)');
    return diff.length >= 2 ? { ok: true, line: `B se distingue de A par ${diff.join(' et ')}.` } : { ok: false, line: `B ne change ${diff.length ? 'que ' + diff[0] : 'presque rien'} : change au moins deux choses à la fois (registre, nombre de notes, nuance, toucher).` };
  },
  /** Le retour de A : il rappelle le début ; avec `lead`, la sensible monte vers la tonique juste avant. */
  ret(A, { a = 1, r = 18, lead = false }) {
    const ra = barOnsets(A.mel, a - 1, A.meter), rr = barOnsets(A.mel, r - 1, A.meter);
    const pa = A.mel.filter(n => n.bar === a - 1).slice(0, 3).map(n => pc(n.m)), pr = A.mel.filter(n => n.bar === r - 1).slice(0, 3).map(n => pc(n.m));
    if (!pr.length) return { ok: false, line: `Joue le retour (mesure ${r}).` };
    const like = jacc(ra, rr) >= 0.5 || pa.filter((x, i) => pr[i] === x).length >= 2;
    if (!like) return { ok: false, line: `Le retour (mesure ${r}) ne rappelle pas assez le début : reprends le rythme ou les premières notes de la mesure ${a}.` };
    if (lead) {
      const first = A.mel.find(n => n.bar === r - 1);
      const t = first.ch.tonic % 12;
      // la sensible qui monte d'un demi-ton vers la tonique, dans la mesure qui précède le retour (ou en y entrant)
      const okLead = A.mel.some((a, i) => { const b = A.mel[i + 1]; return b && (a.bar === r - 2 || b.bar === r - 1) && a.bar >= r - 2 && b.bar <= r - 1 && pc(a.m) === (t + 11) % 12 && b.m - a.m === 1; });
      if (!okLead) return { ok: false, line: `Juste avant le retour (mesure ${r - 1}), fais monter la sensible ${pcNameIn(t + 11, first.ch)} vers ${pcNameIn(t, first.ch)}, d’un demi-ton.` };
    }
    return { ok: true, line: lead ? 'La sensible monte vers la tonique, et le thème revient : on l’attendait.' : 'Le retour rappelle le début.' };
  },
  /** Main gauche : la basse de chaque accord au début de l'accord (et, avec `per`, assez de notes par mesure). */
  bass(A, { min = 0.75, per = 0 }) {
    const lh = A.lh;
    if (lh.length < 3) return { ok: false, line: 'Joue la main gauche (sous le do central) : les notes à jouer sont en brun sur le clavier.' };
    const units = [];
    const endB = lh[lh.length - 1].b;
    for (let x = 0, i = 0; x <= endB + 0.01; i++) {
      const ch = A.timeline[i % A.len];
      const at = Math.floor(i / A.len) * A.total + ch.at;
      if (at > endB + 0.01) break;
      if (!ch.silent) {
        const bp = pc(ch.bassM ?? ch.bass ?? ch.root);
        units.push(lh.some(n => n.b >= at - TOL && n.b <= at + 0.5 && pc(n.m) === bp));
      }
      x = at + ch.beats;
    }
    const k = units.filter(Boolean).length;
    const r = units.length ? k / units.length : 0;
    if (r < min) return { ok: false, line: `Basses posées : ${k}/${units.length}. Joue la basse au début de chaque accord (la note en brun la plus grave).` };
    if (per) {
      const sp = { n: Math.floor((endB - lh[0].b) / A.meter) + 1 };
      const d = lh.length / sp.n;
      if (d < per) return { ok: false, line: `Déroule l’accord : au moins ${per} notes par mesure à la main gauche (${d.toFixed(1)} cette fois).` };
    }
    return { ok: true, line: `Ta main gauche pose la basse de chaque accord (${k}/${units.length}).` };
  },
  /** Chant lié : chaque note gardée jusqu'à la suivante. */
  legato(A, { min = 0.7 }) {
    const mel = A.mel;
    let n = 0, k = 0;
    for (let i = 0; i + 1 < mel.length; i++) { const ioi = mel[i + 1].b - mel[i].b; if (ioi > 2.01 || ioi < 0.15) continue; n++; if ((mel[i].d || 0) >= ioi * 0.85) k++; }
    if (n < 4) return { ok: false, line: 'Joue une phrase d’au moins quelques notes.' };
    const r = k / n;
    return r >= min ? { ok: true, line: `Ton chant est lié (${pct(r)} des notes tenues jusqu’à la suivante).` } : { ok: false, line: `Lie les notes : garde chaque note jusqu’à la suivante (${pct(r)} liées).` };
  },
  /** L'appoggiature plus appuyée que sa résolution. */
  weight(A, { min = 0.7 }, ctx) {
    const figs = ctx.figures || (ctx.figures = findFigures(A.mel));
    const pairs = figs.appoggiature.map(i => [A.mel[i], A.mel[i + 1]]);
    if (pairs.length < 2) return { ok: false, line: 'Joue au moins deux appoggiatures (note étrangère sur le temps, résolue d’un degré).' };
    const k = pairs.filter(([a, b]) => (a.v || 0) >= (b.v || 0) + 4).length;
    return k / pairs.length >= min ? { ok: true, line: `L’appoggiature est plus appuyée que sa résolution (${k}/${pairs.length}) : c’est le soupir.` } : { ok: false, line: `Appuie l’appoggiature, allège la résolution : ${k}/${pairs.length} seulement.` };
  },
  /** La reprise ornée : la deuxième fois, plus de notes autour des mêmes appuis. */
  reprise(A, { ratio = 1.5 }) {
    const nb = A.barsGrid;
    const d1 = notesInBars(A.mel, 0, nb).length, d2 = notesInBars(A.mel, nb, 2 * nb).length;
    if (d1 < 3 || d2 < 3) return { ok: false, line: 'Joue la grille deux fois : simple, puis ornée.' };
    return d2 >= d1 * ratio ? { ok: true, line: `La reprise est ornée : ${d2} notes contre ${d1} la première fois.` } : { ok: false, line: `La première fois, la mélodie simple ; à la reprise, orne-la (${d2} notes contre ${d1} : il en faut nettement plus).` };
  },
  /** Les deux rôles : par unités de quatre mesures, une question (2 mesures, fin ailleurs que sur la tonique) et
   *  une réponse (2 mesures, même rythme au départ, fin sur la tonique). */
  qa(A, { min = 0.75 }) {
    const units = [];
    const lastBar = A.mel.length ? A.mel[A.mel.length - 1].bar : -1;
    for (let u = 0; u * 4 + 3 <= lastBar + 1; u++) {
      const q = notesInBars(A.mel, u * 4, u * 4 + 2), a = notesInBars(A.mel, u * 4 + 2, u * 4 + 4);
      if (q.length < 2 || a.length < 2) { units.push({ ok: false, why: 'joue la question et la réponse' }); continue; }
      const t = q[0].ch.tonic % 12;
      const qOpen = pc(q[q.length - 1].m) !== t, aClosed = pc(a[a.length - 1].m) === t;
      const rhy = jacc(barOnsets(A.mel, u * 4, A.meter), barOnsets(A.mel, u * 4 + 2, A.meter)) >= 0.5;
      units.push({ ok: qOpen && aClosed && rhy, why: !qOpen ? 'la question finit sur la tonique : elle est déjà close' : !aClosed ? 'la réponse ne finit pas sur la tonique' : 'la réponse ne reprend pas le rythme de la question' });
    }
    if (units.length < 2) return { ok: false, line: 'Joue au moins deux fois « question, réponse » (huit mesures).' };
    const k = units.filter(x => x.ok).length;
    const bad = units.find(x => !x.ok);
    return k / units.length >= min ? { ok: true, line: `${plural(k, 'paire', 'paires')} question – réponse réussie${k > 1 ? 's' : ''} sur ${units.length} : on entend qui demande et qui répond.` } : { ok: false, line: `${plural(k, 'paire réussie', 'paires réussies')} sur ${units.length} : ${bad.why}.` };
  },
  /** La fin : la dernière note de chaque tour de la grille est la tonique. */
  final(A) {
    const cs = cycles(A);
    if (!cs.length) return { ok: false, line: 'Joue la grille en entier.' };
    let good = 0, ch = null;
    for (const c of cs) { const ns = notesInBars(A.mel, c.from, c.to); const l = ns[ns.length - 1]; ch = l.ch; if (pc(l.m) === l.ch.tonic % 12) good++; }
    return good >= Math.ceil(cs.length / 2) ? { ok: true, line: 'Chaque tour finit sur la tonique : la phrase est close.' } : { ok: false, line: `Finis sur la tonique (${pcNameIn(ch.tonic, ch)}), en valeur longue.` };
  },
  /** Question – réponse et imitation : résultats des segments. */
  answers(A, { min = 3 }, ctx) {
    const rs = ctx.segResults || [];
    const k = rs.filter(r => r.ok).length;
    if (rs.length < min) return { ok: false, line: `Va jusqu’au bout : ${min} réponses réussies sur ${Math.max(min + 1, 4)} sont demandées (${rs.length} jouées).` };
    return k >= min ? { ok: true, line: `${k} réponses réussies sur ${rs.length}.` } : { ok: false, line: `${k} réponse${k > 1 ? 's' : ''} réussie${k > 1 ? 's' : ''} sur ${rs.length} (il en faut ${min}) : relis les remarques sous chaque réponse.` };
  },
  echo(A, { min = 3 }, ctx) {
    const rs = ctx.segResults || [];
    const k = rs.filter(r => r.ok).length;
    if (rs.length < min) return { ok: false, line: `Va jusqu’au bout : ${min} imitations réussies sont demandées (${rs.length} jouées).` };
    return k >= min ? { ok: true, line: `${k} imitations justes sur ${rs.length} : l’oreille et les doigts suivent.` } : { ok: false, line: `${k} imitation${k > 1 ? 's' : ''} juste${k > 1 ? 's' : ''} sur ${rs.length} (il en faut ${min}) : chante bien la phrase avant de la rejouer.` };
  },
};

/** Unités du squelette (une par mesure, ou une par accord) jusqu'à la dernière note jouée. */
function targetUnits(A, ctx) {
  if (!ctx.targetAt) return [];
  const units = [];
  const endB = A.mel.length ? A.mel[A.mel.length - 1].b + 0.25 : 0;
  for (let i = 0; ; i++) {
    const ch = A.timeline[i % A.len];
    const at = Math.floor(i / A.len) * A.total + ch.at;
    if (at > endB) break;
    if (ch.silent) continue;
    if (!ctx.chordTargets && ch.at % A.meter !== 0) continue;
    const target = ctx.targetAt(i);
    if (target == null) continue;
    const hitN = A.rh.find(n => n.b >= at - TOL && n.b <= at + TOL && pc(n.m) === pc(target));
    units.push({ i, at, ch, bar: Math.floor(at / A.meter), target, hit: !!hitN, hitNote: hitN ? hitN.m : null });
  }
  return units;
}

/** Phrases : groupes de notes séparés par au moins un temps de silence (ou par l'écart de deux temps entre attaques). */
export function phrases(A) {
  const out = [];
  let cur = [];
  A.mel.forEach((n, i) => {
    const p = A.mel[i - 1];
    if (p) {
      const gap = n.b - p.b;
      const silence = n.b - (p.b + (p.d ?? 0.5));
      if (silence >= 0.9 || gap >= 2.5) { if (cur.length >= 2) out.push(cur); cur = []; }
    }
    cur.push(n);
  });
  if (cur.length >= 2) out.push(cur);
  return out;
}

/** Évalue une prise : chaque vérification du palier, dans l'ordre. */
export function evaluate(A, checks, ctx = {}) {
  const lines = [];
  let okAll = true;
  for (const c of checks) {
    const fn = CHECKS[c.k];
    if (!fn) continue;
    const r = fn(A, c, ctx);
    if (!r.line) continue;
    lines.push({ ok: r.ok, text: r.line });
    if (!r.ok) okAll = false;
  }
  const ok = okAll && lines.length > 0;
  return { ok, lines, score: lines.length ? lines.filter(l => l.ok).length / lines.length : 0 };
}

/** Le critère d'une vérification, en clair (affiché avant de jouer). */
export function describeCheck(c) {
  switch (c.k) {
    case 'nonstop': return `${c.bars} mesures au moins, sans t’arrêter`;
    case 'scale': return 'rester sur les notes de la gamme';
    case 'strong': return `une note de l’accord sur ${pct(c.min ?? 0.7)} des temps forts`;
    case 'rhythm': return { longues: 'une ou deux notes par mesure, posées sur les temps', noires: 'une note par temps, sur les temps', croches: 'des croches : deux notes par temps', pointe: `au moins ${c.min ?? 2} rythmes pointés` }[c.v];
    case 'targets': return `la note en or posée à temps (${pct(c.min ?? 0.75)} des mesures)`;
    case 'appog': return 'l’appoggiature en or au premier temps, puis un degré plus bas';
    case 'rests': return `${c.play ?? 2} mesures jouées, ${c.rest ?? 2} d’écoute, en alternance`;
    case 'phraseEnd': return `chaque phrase finie sur ${c.on === 'tonic' ? 'la tonique' : 'une note de l’accord'}`;
    case 'motif': return `ton motif reconnaissable au moins ${c.min ?? 3} fois`;
    case 'figure': { const L = FIG_LABEL[c.f]; return `au moins ${plural(c.min ?? 1, L[0], L[1])}`; }
    case 'stepwise': return (c.max ?? 2) <= 2 ? 'une ligne qui avance par degrés (peu de sauts)' : 'chaque note voisine de la précédente (au plus une tierce)';
    case 'density': return c.max < Infinity ? `au plus ${c.max} notes par mesure en moyenne` : `au moins ${c.min} notes par mesure`;
    case 'peak': return `le sommet entre les mesures ${c.from ?? 5} et ${c.to ?? 7}`;
    case 'cadences': return `une demi-cadence tenue en mesure ${c.half ?? 4}, la tonique en mesure ${c.full ?? 8}`;
    case 'repeatStart': return `la mesure ${c.b ?? 5} reprend le début de la mesure ${c.a ?? 1}`;
    case 'sequence': return `le modèle recopié ${c.reps ?? 2} fois, un degré plus ${(c.dir ?? -1) < 0 ? 'bas' : 'haut'} à chaque fois`;
    case 'contrast': return 'B change au moins deux choses par rapport à A';
    case 'ret': return c.lead ? 'la sensible qui monte, puis le retour du début' : 'le retour qui rappelle le début';
    case 'bass': return c.per ? `la basse de chaque accord, et ${c.per} notes par mesure à la main gauche` : 'la basse de chaque accord à la main gauche';
    case 'legato': return 'un chant lié (chaque note tenue jusqu’à la suivante)';
    case 'weight': return 'l’appoggiature plus appuyée que sa résolution';
    case 'reprise': return 'la mélodie simple, puis ornée à la reprise';
    case 'qa': return 'des paires question – réponse : la question finit ailleurs que sur la tonique, la réponse reprend son rythme et finit sur la tonique';
    case 'final': return 'la dernière note sur la tonique';
    case 'answers': return `${c.min ?? 3} réponses réussies sur 4`;
    case 'echo': return `${c.min ?? 3} imitations justes sur 4`;
    default: return '';
  }
}

/* ------------------------------------------------------------------ */
/* Jugement d'une réponse (question – réponse) et d'une imitation       */
/* ------------------------------------------------------------------ */
/**
 * played : [{ m, beat (depuis le début de la réponse), kind, strong }] ; question : { notes: [{ m, t, d }] }.
 * variant : 'rythme' (par défaut), 'contour', 'inverse', 'registre', 'figure' (avec figure).
 */
export function judgeAnswer(played, seg, question, { isEnd = false, variant = 'rythme', figure = null } = {}) {
  const lines = [];
  if (played.length < 2) return { ok: false, score: 0, lines: ['Je n’ai presque rien reçu : réponds avec au moins trois ou quatre notes, à la main droite.'] };
  const strong = played.filter(p => p.strong);
  const okStrong = strong.filter(p => p.kind === 'chord').length;
  const pctStrong = strong.length ? okStrong / strong.length : 0;
  lines.push(pctStrong >= 0.7 ? `✓ Temps forts sur une note de l’accord (${okStrong}/${strong.length}).` : `→ Temps forts : ${okStrong}/${strong.length} sur une note de l’accord. Vise une note de l’accord à chaque temps fort.`);
  const last = played[played.length - 1];
  const lastCh = seg.chords[seg.chords.length - 1];
  const tonicPc = lastCh.tonic % 12;
  const stable = isEnd ? pc(last.m) === tonicPc : chordPcs(lastCh).includes(pc(last.m));
  lines.push(stable ? (isEnd ? '✓ Fin sur la tonique : la phrase est close.' : '✓ Fin sur une note de l’accord : la réponse se pose.') : (isEnd ? `→ Finis sur la tonique (${pcNameIn(tonicPc, lastCh)}).` : '→ Finis sur une note de l’accord, en valeur longue.'));
  const meter = seg.meter || 4;
  let third = 0, thirdOk = true;
  if (variant === 'rythme') {
    const q8 = new Set(question.notes.filter(n => n.t < meter).map(n => Math.round(n.t * 2)));
    const a8 = new Set(played.filter(p => p.beat < meter).map(p => Math.round(p.beat * 2)));
    const inter = [...q8].filter(x => a8.has(x)).length;
    third = q8.size ? inter / Math.max(q8.size, a8.size) : 0;
    thirdOk = third >= 0.5;
    lines.push(thirdOk ? '✓ Tu reprends le rythme de la question : on entend que c’est une réponse.' : '→ Reprends le rythme de la question au début de ta réponse (même rythme, autres notes).');
  } else if (variant === 'contour' || variant === 'inverse') {
    const sg = arr => arr.slice(1).map((x, i) => sgn(x - arr[i]));
    const qs = sg(question.notes.map(n => n.m)), as = sg(played.map(p => p.m));
    const n = Math.min(qs.length, as.length, 6);
    const want = variant === 'inverse' ? -1 : 1;
    third = n ? qs.slice(0, n).filter((x, i) => x === want * as[i] || (x === 0 && as[i] === 0)).length / n : 0;
    thirdOk = third >= 0.6;
    lines.push(thirdOk ? (variant === 'inverse' ? '✓ Ta réponse renverse le dessin de la question : elle descend où la question montait.' : '✓ Ta réponse suit le dessin de la question : mêmes montées, mêmes descentes.')
      : (variant === 'inverse' ? '→ Renverse le dessin : là où la question monte, descends ; là où elle descend, monte.' : '→ Suis le dessin de la question : monte quand elle monte, descends quand elle descend (les notes peuvent changer).'));
  } else if (variant === 'registre') {
    const mq = median(question.notes.map(n => n.m)), ma = median(played.map(p => p.m));
    third = Math.abs(mq - ma);
    thirdOk = third <= 7;
    lines.push(thirdOk ? `✓ Tu as suivi le registre de la question (${mq >= 74 ? 'dans l’aigu' : 'dans le médium'}).` : `→ La question était ${mq > ma ? 'plus aiguë' : 'plus grave'} : réponds dans le même registre.`);
  } else if (variant === 'figure' && figure) {
    const figs = findFigures(played.map(p => ({ m: p.m, b: p.beat, kind: p.kind, strong: p.strong, near: Math.abs(p.beat - Math.round(p.beat)) < TOL })));
    const k = (figure === 'approche' ? [...figs.double, ...figs.schleifer] : figs[figure] || []).length;
    thirdOk = k >= 1;
    lines.push(thirdOk ? `✓ Ta réponse contient ${un(figure)} ${FIG_LABEL[figure][0]}.` : `→ Glisse ${un(figure)} ${FIG_LABEL[figure][0]} dans ta réponse : ${FIG_LABEL[figure][2]}.`);
  }
  const score = (pctStrong >= 0.7 ? 1 : pctStrong) * 0.4 + (stable ? 0.35 : 0) + (thirdOk ? 0.25 : 0);
  return { ok: score >= 0.75, score, lines, pctStrong, stable };
}

/** Imitation : les notes rejouées (hauteur, à l'octave près) et leur rythme, comparés au modèle. */
export function judgeEcho(played, model) {
  if (played.length < 2) return { ok: false, score: 0, lines: ['→ Je n’ai presque rien reçu : rejoue la phrase entendue, à la main droite.'] };
  const a = model.notes.map(n => pc(n.m)), b = played.map(p => pc(p.m));
  // plus longue sous-suite commune
  const L = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
  const pr = L[a.length][b.length] / Math.max(a.length, b.length);
  const q = new Set(model.notes.map(n => Math.round(n.t * 2))), r = new Set(played.map(p => Math.round(p.beat * 2)));
  const inter = [...q].filter(x => r.has(x)).length;
  const rs = inter / (q.size + r.size - inter);
  const lines = [
    pr >= 0.75 ? `✓ Les notes y sont (${Math.round(pr * 100)}\u202F%).` : `→ Notes : ${Math.round(pr * 100)}\u202F% justes. Chante la phrase dans ta tête, puis cherche la première note.`,
    rs >= 0.5 ? '✓ Le rythme est repris.' : '→ Le rythme n’est pas encore le même : écoute où tombent les notes longues.',
  ];
  return { ok: pr >= 0.75 && rs >= 0.5, score: pr * 0.7 + Math.min(1, rs / 0.5) * 0.3, lines, pr, rs };
}

/** Pour l'affichage : le nom d'une note jouée. */
export const noteLabel = m => noteNameFr(m, { octave: false });
