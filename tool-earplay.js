// Jouer d'oreille (V7.3) : apprendre des mélodies sans partition, à la manière des musiciens de tradition orale
// (Hildebrandt, 2016). L'appli joue une phrase avec son accompagnement ; tu la chantes, puis tu la rejoues : d'abord
// avec elle, puis seul sur l'accompagnement. Les phrases s'allongent (une mesure, deux, la phrase, la mélodie entière).
// Entre deux phrases, une question d'analyse. Pour prouver que tu la sais : sans aide, dans une autre tonalité, chantée.
import { h, esc, shuffle, noteNameFr, fmtPct } from './util.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { keyboard } from './diagrams.js';
import { inputLatency } from './latency.js';
import { scheduleCountIn, countInPosition } from './countin.js';
import { MELODIES, MELODY_LEVELS } from './content-melodies.js';
import { logActivity } from './activity.js';

const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
const OWNER = 'earplay';

/* ------------------------------------------------------------------ */
/* Lecture des mélodies                                                 */
/* ------------------------------------------------------------------ */
export function parseMeter(s) {
  const [n, d] = s.split('/').map(Number);
  const compound = d === 8 && n % 3 === 0;
  return { num: n, den: d, beatsPerBar: compound ? n / 3 : n, beatQ: compound ? 1.5 : 4 / d, barQ: (n * 4) / d };
}
/** Jetons → notes { s (demi-tons depuis la tonique), t, d } (noires depuis le début), et la durée de chaque mesure. */
export function parseNotes(str, mode) {
  const scale = mode === 'min' ? MIN : MAJ;
  const bars = str.split('|').map(b => b.trim()).filter(Boolean);
  const notes = [], barSums = [];
  let t = 0, tie = false;
  for (const b of bars) {
    let sum = 0;
    for (const tok of b.split(/\s+/)) {
      const m = tok.match(/^(r|([#b]?)([1-7])([',]*))(?::([\d.]+))?(~?)$/);
      if (!m) throw new Error(`jeton illisible : ${tok}`);
      const d = m[5] ? parseFloat(m[5]) : 1;
      if (m[1] !== 'r') {
        let s = scale[+m[3] - 1] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
        for (const c of m[4]) s += c === "'" ? 12 : -12;
        const last = notes[notes.length - 1];
        if (tie && last && last.s === s) last.d += d; // liaison : une seule note
        else notes.push({ s, t, d });
      }
      tie = m[6] === '~';
      t += d; sum += d;
    }
    barSums.push(Math.round(sum * 1000) / 1000);
  }
  return { notes, barSums, total: t };
}
/** Vérifie les mesures d'une mélodie écrite : [] si tout va bien, sinon la liste des problèmes. */
export function checkDef(def) {
  if (def.excerpt) return [];
  const problems = [];
  const meter = parseMeter(def.meter);
  const { barSums } = parseNotes(def.notes, def.mode);
  const pickup = barSums[0] < meter.barQ - 1e-6 ? barSums[0] : 0;
  const body = pickup ? barSums.slice(1) : barSums;
  body.forEach((s, i) => {
    const last = i === body.length - 1;
    if (Math.abs(s - meter.barQ) > 1e-6 && !(last && pickup && Math.abs(s - (meter.barQ - pickup)) < 1e-6)) problems.push(`mesure ${i + 1} : ${s} noires au lieu de ${meter.barQ}`);
  });
  const chords = (def.chords || '').split(/[\s|]+/).filter(Boolean);
  if (chords.length !== body.length) problems.push(`${chords.length} accords pour ${body.length} mesures`);
  const sum = (def.phrases || []).reduce((a, b) => a + b, 0);
  if (sum !== body.length) problems.push(`phrases : ${sum} mesures pour ${body.length}`);
  for (const c of chords) for (const sym of c.split('-')) if (sym !== '-' && sym && !CHORDS[def.mode === 'min' ? 'min' : 'maj'][sym]) problems.push(`accord inconnu : ${sym}`);
  return problems;
}

/* ------------------------------------------------------------------ */
/* Accords et accompagnement                                            */
/* ------------------------------------------------------------------ */
const CHORDS = {
  maj: { I: [0, [0, 4, 7]], ii: [2, [0, 3, 7]], iii: [4, [0, 3, 7]], IV: [5, [0, 4, 7]], V: [7, [0, 4, 7]], V7: [7, [0, 4, 7, 10]], vi: [9, [0, 3, 7]], viio: [11, [0, 3, 6]], II7: [2, [0, 4, 7, 10]] },
  min: { i: [0, [0, 3, 7]], iv: [5, [0, 3, 7]], V: [7, [0, 4, 7]], V7: [7, [0, 4, 7, 10]], VI: [8, [0, 4, 7]], III: [3, [0, 4, 7]], VII: [10, [0, 4, 7]], iio: [2, [0, 3, 6]] },
};
const inRange = (pcv, lo) => { let m = lo; while (((m % 12) + 12) % 12 !== ((pcv % 12) + 12) % 12) m++; return m; };
/** Les notes d'un accord : basse (do1 – si1) et accord serré (do2 – si2), au-dessus d'une tonique donnée. */
function chordNotes(sym, tonic, mode) {
  const c = CHORDS[mode === 'min' ? 'min' : 'maj'][sym];
  if (!c) return null;
  const root = tonic + c[0];
  return { bass: inRange(root, 36), tones: c[1].map(iv => inRange(root + iv, 48)).sort((a, b) => a - b), fifth: inRange(root + 7, 36) };
}
/** Les accords d'une mélodie : [{ t, d, sym }] (noires, depuis le premier temps de la mesure 1). */
function chordList(def, meter, nBars, pickupQ) {
  const out = [];
  if (def.pickupChord && pickupQ) out.push({ t: -pickupQ, d: pickupQ, sym: def.pickupChord });
  const toks = (def.chords || '').split(/[\s|]+/).filter(Boolean);
  toks.slice(0, nBars).forEach((tok, i) => {
    const parts = tok.split('-').filter(Boolean);
    parts.forEach((sym, j) => out.push({ t: i * meter.barQ + (j * meter.barQ) / parts.length, d: meter.barQ / parts.length, sym }));
  });
  return out;
}
/** Accompagnement simple : la basse sur le temps, l'accord sur les autres temps (valse à 3/4, balancement à 6/8). */
function accompany(chords, tonic, mode, meter) {
  const acc = [];
  for (const c of chords) {
    const n = chordNotes(c.sym, tonic, mode);
    if (!n) continue;
    const beats = Math.max(1, Math.round(c.d / meter.beatQ));
    const bq = c.d / beats;
    for (let k = 0; k < beats; k++) {
      const t = c.t + k * bq;
      const bassAt = k === 0 || (beats === 4 && k === 2);
      if (bassAt) acc.push({ m: k === 0 ? n.bass : n.fifth, t, d: bq * 0.95, v: 54 });
      if (!bassAt || beats === 1) n.tones.forEach(m => acc.push({ m, t, d: bq * 0.9, v: 42 }));
    }
  }
  return acc;
}

/* ------------------------------------------------------------------ */
/* Une mélodie prête à jouer                                            */
/* ------------------------------------------------------------------ */
/** Mélodie écrite → { mel [{m,t,d}], acc, chords, meter, pickupQ, nBars, tonic } ; t = 0 au 1er temps de la mesure 1. */
export function songFromDef(def, shift = 0) {
  const meter = parseMeter(def.meter);
  const { notes, barSums } = parseNotes(def.notes, def.mode);
  const pickupQ = barSums[0] < meter.barQ - 1e-6 ? barSums[0] : 0;
  const nBars = barSums.length - (pickupQ ? 1 : 0);
  const tonic = def.tonic + shift;
  const mel = notes.map(n => ({ m: tonic + n.s, t: n.t - pickupQ, d: n.d }));
  const chords = chordList(def, meter, nBars, pickupQ);
  return { def, meter, pickupQ, nBars, mel, chords, acc: accompany(chords, tonic, def.mode, meter), tonic, mode: def.mode, shift };
}
/** Thème d'une pièce : mélodie (note la plus haute de la main droite) et main gauche, relevées sur la partition vérifiée. */
async function songFromExcerpt(def, shift = 0) {
  const [ex, { ensureAbcjs }, { Score }] = await Promise.all([import('./content-excerpts.js'), import('./lazy.js'), import('./score.js')]);
  await ensureAbcjs();
  const host = h('div', { class: 'pm-hidden-score', 'aria-hidden': 'true' });
  document.body.append(host);
  try {
    const score = new Score(host, ex[def.excerpt.set][def.excerpt.key], {});
    const meter = parseMeter(def.meter);
    const pickupQ = score.pickupQ || 0;
    const endQ = pickupQ + def.excerpt.bars * meter.barQ;
    const evs = score.events.filter(e => !e.grace && e.t < endQ - 1e-6);
    const top = new Map();
    for (const e of evs) if (e.hand === 'rh') { const k = Math.round(e.t * 96); const cur = top.get(k); if (!cur || e.pitch > cur.pitch) top.set(k, e); }
    const mel = [...top.values()].sort((a, b) => a.t - b.t).map(e => ({ m: e.pitch + shift, t: e.t - pickupQ, d: Math.min(e.dur, endQ - e.t) }));
    const acc = evs.filter(e => e.hand === 'lh').map(e => ({ m: e.pitch + shift, t: e.t - pickupQ, d: Math.min(e.dur, endQ - e.t), v: 44 }));
    return { def, meter, pickupQ, nBars: def.excerpt.bars, mel, chords: [], acc, tonic: def.tonic + shift, mode: def.mode, shift };
  } finally { host.remove(); }
}
export const buildSong = (def, shift = 0) => (def.excerpt ? songFromExcerpt(def, shift) : Promise.resolve(songFromDef(def, shift)));

/** Les morceaux à apprendre pour une taille (1 ou 2 mesures, 'phrase', 'all') : [{ i, b0, b1, a, z, notes, key }]. */
export function chunksOf(song, size) {
  const { barQ } = song.meter;
  const cut = song.def.cut || 0;
  const bounds = [0];
  for (const n of song.def.phrases || [song.nBars]) bounds.push(bounds[bounds.length - 1] + n);
  const segs = [];
  if (size === 'all') segs.push([0, song.nBars]);
  else if (size === 'phrase') for (let i = 0; i + 1 < bounds.length; i++) segs.push([bounds[i], bounds[i + 1]]);
  else for (let i = 0; i + 1 < bounds.length; i++) for (let b = bounds[i]; b < bounds[i + 1]; b += size) segs.push([b, Math.min(b + size, bounds[i + 1])]);
  const edge = b => (bounds.includes(b) && b > 0 ? b * barQ - cut : b * barQ); // une phrase commence par sa levée
  return segs.map(([b0, b1], i) => {
    const first = i === 0, last = i === segs.length - 1;
    const a = first ? -song.pickupQ : edge(b0), z = last ? song.nBars * barQ + 1 : edge(b1);
    const notes = song.mel.filter(n => n.t >= a - 1e-6 && n.t < z - 1e-6);
    return { i, b0, b1, a, z: last ? song.nBars * barQ : z, notes, key: `${size}:${i}` };
  }).filter(c => c.notes.length);
}

/* ------------------------------------------------------------------ */
/* Sons                                                                 */
/* ------------------------------------------------------------------ */
const spqOf = (song, tempo) => 60 / (song.def.bpm * tempo) / song.meter.beatQ; // secondes par noire
/** Programme une partie de la mélodie : clic de décompte (facultatif), accompagnement, mélodie. Renvoie les repères. */
async function schedule(song, { from, to, downbeat, tempo = 1, melody = true, melVel = 80, accomp = true, countIn = false }) {
  audio.claim(OWNER, () => audio.stopAll(OWNER));
  await audio.ensure();
  const spq = spqOf(song, tempo);
  const beatSec = spq * song.meter.beatQ;
  let T0; // temps du contexte audio au premier temps de la mesure « downbeat »
  let ci = null;
  if (countIn) { ci = scheduleCountIn({ beatsPerBar: song.meter.beatsPerBar, beatSec }); T0 = ci.end; }
  else T0 = audio.now() + 0.15 + Math.max(0, downbeat - from) * spq;
  const at = q => T0 + (q - downbeat) * spq;
  if (accomp) for (const n of song.acc) if (n.t >= Math.max(from, downbeat - 1e-6) - 1e-6 && n.t < to - 1e-6) { const v = audio.noteOn(n.m, n.v, at(n.t), { owner: OWNER }); if (v) audio.noteOff(v, at(n.t) + n.d * spq); }
  if (melody) for (const n of song.mel) if (n.t >= from - 1e-6 && n.t < to - 1e-6) { const v = audio.noteOn(n.m, melVel, at(n.t), { owner: OWNER }); if (v) audio.noteOff(v, at(n.t) + Math.min(n.d, to - n.t) * spq * 0.97); }
  return { T0, spq, ci, P0: audio.ctxToPerf(T0), endPerf: audio.ctxToPerf(at(to)), at };
}
const stopSound = () => audio.stopAll(OWNER);
/** Cadence I – IV – V7 – I dans la tonalité d'une mélodie (pour la changer de tonalité). */
function cadence(tonic, mode) {
  const seq = mode === 'min' ? ['i', 'iv', 'V7', 'i'] : ['I', 'IV', 'V7', 'I'];
  const out = [];
  seq.forEach((sym, i) => { const n = chordNotes(sym, tonic, mode); [n.bass, ...n.tones].forEach(m => out.push({ m, t: i * 0.7, d: i === 3 ? 1.2 : 0.65 })); });
  return out;
}
async function playList(list) {
  audio.claim(OWNER, () => audio.stopAll(OWNER));
  await audio.ensure();
  const t0 = audio.now() + 0.08;
  let end = 0;
  for (const n of list) { const v = audio.noteOn(n.m, n.v || 66, t0 + n.t, { owner: OWNER }); if (v) audio.noteOff(v, t0 + n.t + n.d); end = Math.max(end, n.t + n.d); }
  return end * 1000 + 80;
}

/* ------------------------------------------------------------------ */
/* Vérifier ce qui est joué                                             */
/* ------------------------------------------------------------------ */
const NAMES_FLAT = new Set([1, 3, 5, 8, 10]); // tonalités à bémols (tonique en demi-tons depuis do)
const nameIn = (m, tonic) => noteNameFr(m, { octave: false, flats: NAMES_FLAT.has(((tonic % 12) + 12) % 12) });
/**
 * Compare les notes jouées aux notes attendues. Hauteurs : la même suite, à une octave près (décalage constant).
 * Rythme (si timed) : chaque attaque à 0,3 noire près de sa place, pour les trois quarts des notes au moins.
 */
export function judge(expected, played, { timed = false, P0 = 0, downbeat = 0, spqMs = 600, tonic = 60 } = {}) {
  const n = expected.length;
  if (!played.length) return { ok: false, pitches: false, msg: 'Je n’ai rien entendu : joue après le décompte.' };
  const shift = played[0].m - expected[0].m;
  const octave = shift % 12 === 0 ? shift : 0;
  let wrong = -1;
  for (let i = 0; i < Math.min(n, played.length); i++) if (played[i].m - expected[i].m !== octave) { wrong = i; break; }
  if (wrong >= 0) return { ok: false, pitches: false, wrong, msg: `La note ${wrong + 1} : tu as joué ${nameIn(played[wrong].m, tonic)}, c’était ${nameIn(expected[wrong].m, tonic)}.` };
  if (played.length < n) return { ok: false, pitches: false, msg: `Juste jusque-là, mais il manque la fin : ${played.length} notes sur ${n}.` };
  if (played.length > n) return { ok: false, pitches: false, msg: `Les ${n} notes sont justes, puis ${played.length - n} de trop : arrête-toi sur la dernière note de la phrase.` };
  if (!timed) return { ok: true, pitches: true, msg: 'Toutes les notes sont justes.' };
  const tol = 0.3;
  const errs = expected.map((e, i) => (played[i].time - P0) / spqMs + downbeat - e.t);
  const good = errs.filter(e => Math.abs(e) <= tol).length;
  const lateIdx = errs.map((e, i) => (Math.abs(e) > tol ? i + 1 : 0)).filter(Boolean).slice(0, 3);
  if (good >= 0.75 * n) return { ok: true, pitches: true, rhythm: good / n, msg: good === n ? 'Juste, et en rythme.' : `Juste ; le rythme est presque là (${lateIdx.map(x => `note ${x}`).join(', ')} un peu à côté).` };
  const mean = errs.reduce((a, b) => a + b, 0) / n;
  return { ok: false, pitches: true, rhythm: good / n, msg: `Les notes sont justes, mais le rythme flotte${Math.abs(mean) > 0.25 ? ` (tu es ${mean > 0 ? 'en retard' : 'en avance'})` : ''} : écoute encore la phrase en comptant, puis rejoue.` };
}
/** Écoute le piano (ou le clavier à l'écran) : onDone(notes) à la fin de la fenêtre, ou quand assez de notes ont été jouées. */
function listen({ untilPerf = null, expect = null, silenceMs = 3500, onDone }) {
  const notes = [];
  let timer = null, done = false;
  const finish = () => { if (done) return; done = true; off(); clearTimeout(timer); clearTimeout(endT); onDone(notes); };
  const off = midi.on('noteon', ev => {
    notes.push({ m: ev.note, time: (ev.time ?? performance.now()) - inputLatency(ev.source) });
    clearTimeout(timer);
    if (expect && notes.length >= expect + 2) finish(); // beaucoup trop de notes : on arrête
    else if (!untilPerf) timer = setTimeout(finish, expect && notes.length >= expect ? 900 : silenceMs);
  });
  const endT = untilPerf ? setTimeout(finish, Math.max(0, untilPerf - performance.now())) : null;
  return { stop: finish, cancel: () => { if (done) return; done = true; off(); clearTimeout(timer); clearTimeout(endT); } };
}

/* ------------------------------------------------------------------ */
/* Questions d'analyse (entre deux phrases)                             */
/* ------------------------------------------------------------------ */
const degreeOf = (m, tonic, mode) => { const s = (((m - tonic) % 12) + 12) % 12; const i = (mode === 'min' ? MIN : MAJ).indexOf(s); return i >= 0 ? i + 1 : null; };
const same = (a, b) => a.length === b.length && a.every((n, i) => n.m - a[0].m === b[i].m - b[0].m && Math.abs(n.d - b[i].d) < 1e-6);
/** Une question sur le morceau qu'on vient de jouer (k tourne entre les quatre sortes ; certaines ne s'appliquent pas). */
export function questionFor(song, chunks, c, k = 0) {
  const kinds = ['end', 'high', 'repeat', 'chord'];
  for (let j = 0; j < kinds.length; j++) {
    const kind = kinds[(k + j) % kinds.length];
    if (kind === 'end') {
      const d = degreeOf(c.notes[c.notes.length - 1].m, song.tonic, song.mode);
      if (!d) continue;
      const opts = shuffle([1, 2, 3, 4, 5, 6, 7].filter(x => x !== d)).slice(0, 3).concat(d).sort((a, b) => a - b);
      return { kind, q: 'Sur quel degré finit ce que tu viens de jouer ?', answers: opts.map(String), correct: String(d), why: d === 1 ? 'Sur la tonique : la phrase se repose.' : d === 5 ? 'Sur la dominante : la phrase reste en suspens, elle appelle la suite.' : `Sur le degré ${d} : la phrase ne se repose pas encore.` };
    }
    if (kind === 'high') {
      const max = Math.max(...c.notes.map(n => n.m));
      const top = c.notes.find(n => n.m === max);
      if (c.notes.filter(n => n.m === max).length > 2) continue;
      const { barQ, beatQ, beatsPerBar } = song.meter;
      const beat = Math.floor((((top.t % barQ) + barQ) % barQ) / beatQ + 1e-6) + 1;
      return { kind, q: 'La note la plus haute : sur quel temps de la mesure tombe-t-elle ?', answers: Array.from({ length: beatsPerBar }, (_, i) => `temps ${i + 1}`), correct: `temps ${beat}`, why: beat === 1 ? 'Sur le premier temps, le plus fort : le sommet est appuyé.' : 'Hors du premier temps : le sommet arrive en douceur.' };
    }
    if (kind === 'repeat') {
      if (c.i === 0) continue;
      const prev = chunks.slice(0, c.i);
      const twin = prev.find(p => same(p.notes, c.notes));
      const near = !twin && prev.find(p => p.notes.length === c.notes.length && same(p.notes.slice(0, -1), c.notes.slice(0, -1)));
      const correct = twin ? 'La même qu’avant' : near ? 'Presque : seule la fin change' : 'Une nouvelle';
      return { kind, q: 'Ce que tu viens de jouer, l’avais-tu déjà entendu plus tôt dans la mélodie ?', answers: ['La même qu’avant', 'Presque : seule la fin change', 'Une nouvelle'], correct,
        why: twin ? `Oui : elle reprend la partie ${twin.i + 1}. Ce qui revient se retient deux fois plus vite.` : near ? `La partie ${near.i + 1} commençait pareil, mais finissait autrement : c’est souvent la différence entre une question et une réponse.` : 'Elle est nouvelle : repère d’où elle part et où elle arrive.' };
    }
    if (kind === 'chord') {
      if (!song.chords.length) continue;
      const long = c.notes.reduce((a, n) => (n.d > a.d ? n : a), c.notes[0]);
      const ch = song.chords.find(x => long.t >= x.t - 1e-6 && long.t < x.t + x.d - 1e-6);
      if (!ch) continue;
      const pool = [...new Set(song.chords.map(x => x.sym))];
      if (pool.length < 2) continue;
      const opts = shuffle(pool.filter(x => x !== ch.sym)).slice(0, 2).concat(ch.sym);
      return { kind, q: 'Sous la note la plus longue, quel accord entends-tu ?', answers: shuffle(opts), correct: ch.sym, why: `C’était ${ch.sym}. Écoute la basse : ${ch.sym.startsWith('V') ? 'elle est sur la dominante, la musique attend le retour.' : ch.sym.startsWith('I') || ch.sym.startsWith('i') ? 'elle est sur la tonique, la musique repose.' : 'elle s’éloigne de la tonique.'}` };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* État                                                                 */
/* ------------------------------------------------------------------ */
const stateOf = id => ({ done: {}, proof: {}, q: 0, ...(store.get(`earsongs.${id}`) || {}) });
const saveState = (id, st) => { store.set(`earsongs.${id}`, { ...st, at: Date.now() }); };
export const sizesFor = def => (def.level <= 2 ? [1, 2, 'phrase', 'all'] : [2, 'phrase', 'all']);
const SIZE_LABEL = { 1: '1 mesure', 2: '2 mesures', phrase: 'Les phrases', all: 'En entier' };
/** Où en est une mélodie : 'neuve', 'en cours', 'sue' (sans aide), avec les preuves faites. */
export function songStatus(def) {
  const st = stateOf(def.id);
  const n = Object.values(st.done).filter(v => v >= 2).length;
  const proofs = ['solo', 'transp', 'sing'].filter(p => st.proof[p]);
  return { st, n, proofs, known: !!st.proof.solo, full: proofs.length === 3, label: st.proof.solo ? `sue${proofs.length === 3 ? ', transposée et chantée' : st.proof.transp ? ', transposée' : ''}` : n ? 'en cours' : 'à découvrir' };
}
/** Une mélodie travaillée ces 7 derniers jours ? (règle : une mélodie d'oreille par semaine) */
export const earplayRecent = (now = Date.now()) => Object.values(store.get('earsongs') || {}).some(x => x && x.at && now - x.at < 7 * 864e5);
/** La mélodie à apprendre maintenant : la première, dans l'ordre, qui n'est pas encore sue. */
export function nextMelody() { return MELODIES.find(d => !songStatus(d).known) || null; }

/* ------------------------------------------------------------------ */
/* Affichage                                                            */
/* ------------------------------------------------------------------ */
export function mountEarPlay(el, opts = {}) {
  const intro = h('div', { class: 'card ep-intro' },
    h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'La méthode'), h('span', { class: 'small muted' }, 'une mélodie par semaine')),
    h('ol', { class: 'ep-method small' },
      h('li', { html: '<b>Écoute</b> la phrase avec son accompagnement, puis <b>chante-la</b>.' }),
      h('li', { html: '<b>Rejoue-la avec l’appli</b>, qui la joue avec toi, puis <b>seul</b> sur l’accompagnement.' }),
      h('li', { html: 'Les phrases <b>s’allongent</b> : une mesure, deux, la phrase, puis la mélodie entière. Entre deux, une question : où va la phrase, qu’est-ce qui revient ?' }),
      h('li', { html: '<b>Preuve</b> que tu la sais : sans aide, puis dans une autre tonalité, puis chantée.' })),
    h('p', { class: 'small muted mb-0' }, 'C’est ainsi que les musiciens de tradition orale apprennent : imiter des phrases courtes puis plus longues, avec un partenaire qui joue avec eux. Jouer d’oreille nourrit l’improvisation, la mémoire et la lecture.'));
  const list = h('div', { class: 'ep-list' });
  const trainer = h('div', { class: 'ep-trainer' });
  el.append(intro, list, trainer);
  let cleanup = null;
  const open = def => {
    try { cleanup?.(); } catch (e) { /* */ }
    trainer.innerHTML = '';
    store.set('ui.earSong', def.id);
    cleanup = mountTrainer(trainer, def, renderList);
    trainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  function renderList() {
    list.innerHTML = '';
    const nx = nextMelody();
    for (const L of MELODY_LEVELS) {
      const defs = MELODIES.filter(d => d.level === L.id);
      if (!defs.length) continue;
      const box = h('div', { class: 'ep-level' }, h('div', { class: 'ep-lhead' }, h('b', {}, `${L.id}. ${L.title}`), h('span', { class: 'small muted' }, ` · ${L.intro}`)));
      const grid = h('div', { class: 'ep-grid' });
      for (const d of defs) {
        const s = songStatus(d);
        const b = h('button', { type: 'button', class: 'ep-song' + (s.known ? ' known' : '') + (nx === d ? ' next' : '') },
          h('b', {}, d.title), h('span', { class: 'small muted' }, d.src), h('span', { class: 'ep-st small' }, s.known ? `✓ ${s.label}` : nx === d ? 'à apprendre maintenant' : s.label));
        b.addEventListener('click', () => open(d));
        grid.append(b);
      }
      box.append(grid);
      list.append(box);
    }
  }
  renderList();
  const want = opts.open || store.get('ui.earSong');
  const d0 = want && MELODIES.find(d => d.id === want);
  if (d0 && opts.autoOpen !== false) { trainer.innerHTML = ''; cleanup = mountTrainer(trainer, d0, renderList); }
  return () => { try { cleanup?.(); } catch (e) { /* */ } stopSound(); };
}

/** L'atelier d'une mélodie : écouter, phrase par phrase, questions, preuves. */
function mountTrainer(host, def, onChange) {
  const frame = h('div', { class: 'w-frame ep-frame' });
  const sub = h('span', { class: 'w-sub' }, def.src);
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, def.title), sub));
  const body = h('div', { class: 'w-body' }, h('p', { class: 'small muted' }, 'Préparation…'));
  frame.append(body);
  host.append(frame);
  let alive = true, take = null, song = null, chunks = [], size = null, idx = 0, kbd = null, tempo = def.level >= 3 ? 0.8 : 0.85;
  let flash = null; // message d'une preuve réussie, gardé après le nouvel affichage
  const st = stateOf(def.id);
  const save = () => { saveState(def.id, st); onChange?.(); };
  const status = h('div', { class: 'rhythm-phase ep-phase', 'aria-live': 'polite' });
  const fb = h('div', { class: 'quiz-feedback' });
  const qBox = h('div', { class: 'ep-q' });
  const stopAll = () => { take?.cancel(); take = null; stopSound(); status.innerHTML = ''; };

  buildSong(def).then(s => {
    if (!alive) return;
    song = s;
    size = st.size && sizesFor(def).includes(st.size) ? st.size : recommendedSize();
    render();
  }).catch(e => { body.innerHTML = ''; body.append(h('p', { class: 'small' }, 'Mélodie indisponible : ' + e.message)); });

  function recommendedSize() {
    for (const sz of sizesFor(def)) {
      const cs = chunksOf(song, sz);
      if (cs.some(c => (st.done[c.key] || 0) < 2)) return sz;
    }
    return 'all';
  }
  const sizeDone = sz => chunksOf(song, sz).every(c => (st.done[c.key] || 0) >= 2);

  function render() {
    stopAll();
    body.innerHTML = '';
    chunks = chunksOf(song, size);
    if (idx >= chunks.length || idx < 0) idx = Math.max(0, chunks.findIndex(c => (st.done[c.key] || 0) < 2));
    // écouter toute la mélodie, tempo
    const all = h('button', { class: 'btn', type: 'button', html: '▶ Écouter toute la mélodie' });
    all.addEventListener('click', () => listenAll());
    const tLbl = h('span', { class: 'small' });
    const showTempo = () => { tLbl.textContent = `Tempo ${Math.round(tempo * 100)} %`; };
    const slower = h('button', { class: 'btn sm ghost', type: 'button', 'aria-label': 'Plus lent' }, '−');
    const faster = h('button', { class: 'btn sm ghost', type: 'button', 'aria-label': 'Plus vite' }, '+');
    slower.addEventListener('click', () => { tempo = Math.max(0.55, Math.round((tempo - 0.05) * 100) / 100); showTempo(); });
    faster.addEventListener('click', () => { tempo = Math.min(1.15, Math.round((tempo + 0.05) * 100) / 100); showTempo(); });
    showTempo();
    body.append(h('div', { class: 'btn-row' }, all, h('span', { class: 'ep-tempo' }, slower, tLbl, faster)));
    // tailles de morceaux
    const seg = h('div', { class: 'seg ep-sizes', role: 'group', 'aria-label': 'Longueur des phrases' });
    for (const sz of sizesFor(def)) {
      const b = h('button', { type: 'button', class: sz === size ? 'on' : '' }, (sizeDone(sz) ? '✓ ' : '') + SIZE_LABEL[sz]);
      b.addEventListener('click', () => { size = sz; st.size = sz; idx = -1; save(); render(); });
      seg.append(b);
    }
    body.append(h('div', { class: 'ep-sizerow' }, h('span', { class: 'small' }, 'Apprendre par :'), seg));
    // le morceau en cours
    const c = chunks[idx];
    const dots = h('div', { class: 'ep-dots', 'aria-hidden': 'true' }, ...chunks.map((x, i) => h('i', { class: ((st.done[x.key] || 0) >= 2 ? 'ok' : (st.done[x.key] || 0) >= 1 ? 'half' : '') + (i === idx ? ' on' : '') })));
    const where = size === 'all' ? 'La mélodie entière' : `${size === 'phrase' ? 'Phrase' : 'Partie'} ${idx + 1} sur ${chunks.length} · mesure${c.b1 - c.b0 > 1 ? 's' : ''} ${c.b0 + 1}${c.b1 - c.b0 > 1 ? `-${c.b1}` : ''}`;
    const listenB = h('button', { class: 'btn', type: 'button', html: '▶ Écouter' });
    const withB = h('button', { class: 'btn', type: 'button' }, 'Avec moi');
    const soloB = h('button', { class: 'btn primary', type: 'button' }, 'Seul, sur l’accompagnement');
    const prevB = h('button', { class: 'btn sm ghost', type: 'button', disabled: idx === 0 }, '‹ Précédente');
    const nextB = h('button', { class: 'btn sm ghost', type: 'button', disabled: idx >= chunks.length - 1 }, 'Suivante ›');
    listenB.addEventListener('click', () => playChunk(c, { melody: true }));
    withB.addEventListener('click', () => runTake(c, 'with'));
    soloB.addEventListener('click', () => runTake(c, 'solo'));
    prevB.addEventListener('click', () => { idx--; render(); });
    nextB.addEventListener('click', () => { idx++; render(); });
    const lvl = st.done[c.key] || 0;
    body.append(h('div', { class: 'ep-chunk' },
      h('div', { class: 'ep-chead' }, h('b', {}, where), dots),
      h('p', { class: 'small mt-0' }, lvl >= 2 ? 'Réussie seul ✓ : passe à la suivante, ou rejoue-la pour le plaisir.' : lvl === 1 ? 'Réussie avec l’appli : maintenant seul, sur l’accompagnement.' : 'Écoute, chante-la à mi-voix, puis rejoue-la : d’abord avec l’appli, puis seul.'),
      h('div', { class: 'btn-row' }, listenB, withB, soloB),
      status, fb, qBox,
      h('div', { class: 'btn-row ep-nav' }, prevB, nextB)));
    // clavier à l'écran sans piano
    if (midi.status !== 'ready') {
      const lo = Math.min(...song.mel.map(n => n.m)) - 2, hi = Math.max(...song.mel.map(n => n.m)) + 2;
      kbd = h('div', { class: 'quiz-kbd' }, keyboard({ from: lo, to: Math.max(hi, lo + 14), interactive: true, names: 'c', height: 96, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) }));
      body.append(h('p', { class: 'small muted' }, 'Piano non connecté : joue sur le clavier à l’écran.'), kbd);
    }
    // les preuves
    body.append(proofs());
    if (st.done[c.key] === undefined && !take) setTimeout(() => { if (alive && chunks[idx] === c) playChunk(c, { melody: true }); }, 400);
  }

  async function listenAll() {
    stopAll();
    const end = song.nBars * song.meter.barQ;
    const s = await schedule(song, { from: -song.pickupQ, to: end, downbeat: 0, tempo: 1, melody: true });
    status.innerHTML = '<span class="ph-label">Écoute</span>';
    setTimeout(() => { if (alive && !take) status.innerHTML = ''; }, Math.max(0, s.endPerf - performance.now()));
  }
  async function playChunk(c, { melody = true } = {}) {
    stopAll();
    const s = await schedule(song, { from: c.a, to: c.z, downbeat: c.b0 * song.meter.barQ, tempo, melody });
    status.innerHTML = '<span class="ph-label">Écoute</span>';
    setTimeout(() => { if (alive && !take) status.innerHTML = '<span class="small">Chante-la à mi-voix, puis rejoue-la.</span>'; }, Math.max(0, s.endPerf - performance.now()));
  }
  /** Une prise : décompte, accompagnement (et mélodie si « avec moi »), puis vérification. */
  async function runTake(c, mode) {
    stopAll();
    fb.className = 'quiz-feedback'; fb.textContent = '';
    qBox.innerHTML = '';
    const downbeat = c.b0 * song.meter.barQ;
    const s = await schedule(song, { from: c.a, to: c.z, downbeat, tempo, melody: mode === 'with', melVel: 62, countIn: true });
    const spqMs = s.spq * 1000;
    frame.__take = { P0: s.P0, spqMs, downbeat, notes: c.notes, listening: false }; // accès de test
    const startListen = s.P0 + (c.a - downbeat) * spqMs - 0.45 * spqMs * song.meter.beatQ;
    const until = s.endPerf + 0.9 * spqMs * song.meter.beatQ;
    // affichage du décompte, puis « à toi »
    const tick = () => {
      if (!take || !alive) return;
      const now = performance.now();
      const p = countInPosition(s.ci, now);
      status.innerHTML = !p.done ? `<span class="ph-label count">${p.waiting ? 'Prépare-toi' : 'Décompte'}</span><span class="ph-beat">${p.waiting ? '…' : p.inBar}</span>` : `<span class="ph-label play">${mode === 'with' ? 'Ensemble !' : 'À toi !'}</span>`;
      if (now < until) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const wait = setTimeout(() => {
      frame.__take.listening = true;
      take = listen({ untilPerf: until, expect: c.notes.length, onDone: played => {
        take = null;
        const notes = played.filter(p => p.time >= startListen);
        const r = judge(c.notes, notes, { timed: mode === 'solo', P0: s.P0, downbeat, spqMs, tonic: song.tonic });
        stopSound();
        status.innerHTML = '';
        fb.className = 'quiz-feedback ' + (r.ok ? 'ok' : 'bad');
        fb.textContent = r.msg;
        if (r.ok) {
          st.done[c.key] = Math.max(st.done[c.key] || 0, mode === 'solo' ? 2 : 1);
          save();
          logActivity('oreille');
          afterSuccess(c, mode);
        }
      } });
    }, Math.max(0, startListen - performance.now() - 40));
    take = { cancel: () => clearTimeout(wait) };
  }
  function afterSuccess(c, mode) {
    // rafraîchir les points et le message sans couper la réponse
    const dots = body.querySelectorAll('.ep-dots i');
    chunks.forEach((x, i) => dots[i]?.classList.toggle('ok', (st.done[x.key] || 0) >= 2));
    if (mode !== 'solo') { fb.textContent += ' Maintenant seul, sur l’accompagnement.'; return; }
    // une question d'analyse entre deux phrases (morceaux de deux mesures ou plus)
    const q = (c.b1 - c.b0 >= 2 || size === 'phrase' || size === 'all') ? questionFor(song, chunks, c, st.q || 0) : null;
    // la suite : la partie suivante, la longueur suivante, ou les preuves
    const goOn = () => {
      const nav = h('div', { class: 'btn-row mt-1' });
      const next = chunks.findIndex((x, i) => i > idx && (st.done[x.key] || 0) < 2);
      if (next >= 0) { const b = h('button', { class: 'btn primary sm', type: 'button' }, 'Partie suivante'); b.addEventListener('click', () => { idx = next; render(); }); nav.append(b); }
      else {
        const sizes = sizesFor(def);
        const nsz = sizes[sizes.indexOf(size) + 1];
        if (nsz) { const b = h('button', { class: 'btn primary sm', type: 'button' }, `Tout est réussi : passer à « ${SIZE_LABEL[nsz]} »`); b.addEventListener('click', () => { size = nsz; st.size = nsz; idx = 0; save(); render(); }); nav.append(b); }
        else nav.append(h('p', { class: 'small mb-0' }, 'La mélodie entière est réussie. Reste à le prouver, plus bas : sans aide, dans une autre tonalité, chantée.'));
      }
      qBox.append(nav);
    };
    if (!q) { qBox.innerHTML = ''; goOn(); return; }
    st.q = (st.q || 0) + 1; save();
    const box = h('div', { class: 'ep-question' }, h('div', { class: 'quiz-q' }, q.q));
    const ans = h('div', { class: 'quiz-answers' });
    const qfb = h('div', { class: 'quiz-feedback' });
    for (const a of q.answers) {
      const b = h('button', { class: 'btn', type: 'button' }, a);
      b.addEventListener('click', () => {
        if (ans.dataset.done) return;
        ans.dataset.done = '1';
        const ok = a === q.correct;
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) [...ans.children].find(x => x.textContent === q.correct)?.classList.add('right');
        qfb.className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
        qfb.textContent = (ok ? 'Oui. ' : `Non : ${q.correct}. `) + q.why;
        goOn();
      });
      ans.append(b);
    }
    box.append(ans, qfb);
    qBox.innerHTML = '';
    qBox.append(box);
  }

  /* --- les preuves : sans aide, dans une autre tonalité, chantée --- */
  function proofs() {
    const box = h('div', { class: 'ep-proofs' }, h('div', { class: 'ep-chead' }, h('b', {}, 'La preuve que tu la sais')));
    const pfb = h('div', { class: 'quiz-feedback' });
    const row = (key, title, what, run) => {
      const go = h('button', { class: 'btn sm' + (st.proof[key] ? '' : ''), type: 'button' }, st.proof[key] ? 'Refaire' : 'Commencer');
      go.addEventListener('click', () => run(go));
      return h('div', { class: 'es-row' + (st.proof[key] ? ' ok' : '') }, go, h('span', { class: 'es-st' }, h('b', {}, (st.proof[key] ? '✓ ' : '') + title), h('span', { class: 'small' }, what)));
    };
    const allNotes = () => song.mel;
    // 1. sans aide
    box.append(row('solo', 'Sans aide', 'Joue la mélodie en entier, sans l’écouter avant, sans accompagnement.', go => {
      stopAll(); pfb.className = 'quiz-feedback'; pfb.textContent = 'Joue la mélodie entière quand tu veux. Je t’écoute.';
      go.disabled = true;
      take = listen({ expect: allNotes().length, silenceMs: 4000, onDone: played => {
        take = null; go.disabled = false;
        const r = judge(allNotes(), played, { tonic: song.tonic });
        pfb.className = 'quiz-feedback ' + (r.ok ? 'ok' : 'bad');
        pfb.textContent = r.ok ? 'Sue ! Tu l’as jouée sans aide.' : r.msg;
        if (r.ok) { st.proof.solo = Date.now(); save(); logActivity('oreille'); flash = pfb.textContent; render(); }
      } });
    }));
    // 2. dans une autre tonalité
    box.append(row('transp', 'Dans une autre tonalité', 'L’appli joue une cadence dans une nouvelle tonalité et te donne la première note.', async go => {
      stopAll(); go.disabled = true;
      const shifts = [5, -5, 2, -2, 7, -3, 3].filter(x => song.tonic + x >= 55 && song.tonic + x <= 70);
      const shift = shifts[Math.floor(Math.random() * shifts.length)];
      const moved = await buildSong(def, shift);
      const ms = await playList(cadence(moved.tonic, moved.mode));
      const first = moved.mel[0];
      const keyName = `${nameIn(moved.tonic, moved.tonic)} ${moved.mode === 'min' ? 'mineur' : 'majeur'}`;
      pfb.className = 'quiz-feedback';
      pfb.innerHTML = `En <b>${esc(keyName)}</b> : la mélodie commence sur <b>${esc(nameIn(first.m, moved.tonic))}</b>. Joue-la en entier.`;
      frame.__moved = moved; // accès de test
      setTimeout(() => {
        frame.__transpListening = true;
        take = listen({ expect: moved.mel.length, silenceMs: 4500, onDone: played => {
          take = null; go.disabled = false;
          const r = judge(moved.mel, played, { tonic: moved.tonic });
          pfb.className = 'quiz-feedback ' + (r.ok ? 'ok' : 'bad');
          pfb.textContent = r.ok ? `Transposée en ${keyName} : tu la sais vraiment, pas seulement sous les doigts.` : r.msg;
          if (r.ok) { st.proof.transp = Date.now(); save(); flash = pfb.textContent; render(); }
        } });
      }, ms);
    }));
    // 3. chantée
    box.append(row('sing', 'Chantée', 'Chante-la en entier, sans aide, puis écoute-la pour comparer.', go => {
      stopAll();
      pfb.className = 'quiz-feedback'; pfb.textContent = '';
      const hear = h('button', { class: 'btn sm', type: 'button', html: '▶ Écouter pour comparer' });
      const yes = h('button', { class: 'btn sm', type: 'button', disabled: true }, 'Je l’ai chantée juste');
      const no = h('button', { class: 'btn sm ghost', type: 'button', disabled: true }, 'Pas encore');
      hear.addEventListener('click', () => { listenAll(); yes.disabled = false; no.disabled = false; });
      yes.addEventListener('click', () => { st.proof.sing = Date.now(); save(); flash = 'Chantée : la mélodie est dans ta tête, pas seulement dans tes doigts.'; render(); });
      no.addEventListener('click', () => { pfb.className = 'quiz-feedback bad'; pfb.textContent = 'Reprends phrase par phrase en chantant avant de jouer, puis réessaie.'; });
      pfb.replaceChildren(h('p', { class: 'small mb-0' }, 'Chante-la d’abord en entier, à voix haute (sur « la »), sans rien écouter. Ensuite seulement, compare.'), h('div', { class: 'btn-row mt-1' }, hear, yes, no));
    }));
    if (flash) { pfb.className = 'quiz-feedback ok'; pfb.textContent = flash; flash = null; }
    box.append(pfb);
    return box;
  }

  return () => { alive = false; stopAll(); };
}
