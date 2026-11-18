// Réflexes de théorie et accords dans la tonalité (V9, « Tes 15 minutes », bloc B).
// Louis comprend la théorie en la lisant ; elle n'est pas encore disponible en jouant. Ici, on ne relit pas : on
// répond, vite, avec les mains ou d'un toucher, dans la tonalité du cycle. Deux minutes :
// - Réflexes (60 s, mélangés) : une armure → la tonalité et sa relative ; un degré → l'accord joué ; une cadence
//   entendue → parfaite ou demi-cadence. Chaque réponse est chronométrée : on vise moins de 2 ou 3 secondes.
// - Accords (60 s) : les accords des degrés de la tonalité, écrits avec l'armure, renversés, à une main ou à l'autre ;
//   on les joue à la bonne octave, puis leur degré s'affiche (I, IV, V7…) : la lecture s'appuie sur l'harmonie.
// Recherche : Karpicke, Butler et Roediger 2009 (se tester plutôt que relire) ; Waters, Townsend et Underwood 1998
// (la reconnaissance des accords est la mesure la plus liée à la lecture à vue).
import { h, esc, fmtPct, noteNameFr } from './util.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { keyboard } from './diagrams.js';
import { ensureAbcjs } from './lazy.js';
import { parseNote, noteName, midiOf, triadOn, keySignature, relative, keyName, scale } from './theory.js';

const ST = 'reflexes';
const LETTERS_ABC = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACC_ABC = { '-2': '__', '-1': '_', 0: '=', 1: '^', 2: '^^' };
const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const INV_NAMES = ['état fondamental', '1er renversement', '2e renversement', '3e renversement'];
const QUAL_FR = { M: 'majeur', m: 'mineur', dim: 'diminué', aug: 'augmenté', '7': 'septième de dominante' };
// cibles : réponse en moins de… (millisecondes)
export const TARGETS = { armure: 2000, degre: 3000, cadence: 2000, accord: 3000, oreille: 3000 };
export const TYPE_LABEL = { armure: 'armure → tonalité', degre: 'degré → accord joué', cadence: 'cadence entendue', accord: 'accord lu et joué', oreille: 'note entendue → jouée' };
// V9.1 : chaque réflexe renvoie à son chapitre, à relire seulement après une erreur (bilan, § 4.6)
export const CHAPTER = {
  armure: { id: 'n1-th-armures', title: 'Armures et tonalités' },
  degre: { id: 'n1-th-fonctions', title: 'Degrés et fonctions' },
  cadence: { id: 'n1-th-cadences', title: 'Les cadences' },
  accord: { id: 'n1-th-renv', title: 'Renversements et chiffrage' },
  oreille: { id: 'trouve-la-note', href: '#/outils/oreille', title: 'Trouve la note' },
};

/* ------------------------------------------------------------------ */
/* Tonalités, armures et notes en ABC                                   */
/* ------------------------------------------------------------------ */
/** Une tonalité : { tonic: 'do' | 'si♭'…, mode: 'maj' | 'min' } → objets utiles. */
export function keyInfo(k) {
  const t = { ...parseNote(k.tonic), o: 3 };
  const sig = keySignature(t, k.mode);
  const alt = [0, 0, 0, 0, 0, 0, 0];
  for (const x of sig.list) { const n = parseNote(x); alt[n.l] = n.a; }
  const abcKey = LETTERS_ABC[t.l] + (t.a === 1 ? '#' : t.a === -1 ? 'b' : '') + (k.mode === 'min' ? 'm' : '');
  return { tonic: t, mode: k.mode, sig, alt, abcKey, name: keyName(t, k.mode), fifths: sig.count };
}
/** Une note écrite en ABC, avec une altération seulement si elle diffère de l'armure. */
export function abcNote(n, alt) {
  const acc = n.a !== alt[n.l] ? ACC_ABC[n.a] : '';
  const o = n.o ?? 3;
  const letter = o >= 4 ? LETTERS_ABC[n.l].toLowerCase() + "'".repeat(o - 4) : LETTERS_ABC[n.l] + ','.repeat(Math.max(0, 3 - o));
  return acc + letter;
}
const up = n => ({ ...n, o: (n.o ?? 3) + 1 });
const shift = (n, d) => ({ ...n, o: (n.o ?? 3) + d });

/** Les degrés travaillés (cycle 1 : I, IV, V7, vi, ii ; en mineur : i, iv, V7, VI, ii°). */
export const DEGREES = {
  maj: [{ d: 1 }, { d: 4 }, { d: 5, seventh: true }, { d: 6 }, { d: 2 }, { d: 5 }],
  min: [{ d: 1 }, { d: 4 }, { d: 5, seventh: true }, { d: 6 }, { d: 2 }, { d: 5 }],
};
/** Empile des notes vers le haut (triadOn ne donne l'octave que de la fondamentale). */
export function stackUp(notes, o0 = 3) {
  const out = [];
  for (const n of notes) {
    let x = { ...n, o: out.length ? out[out.length - 1].o : (n.o ?? o0) };
    while (out.length && midiOf(x) <= midiOf(out[out.length - 1])) x = { ...x, o: x.o + 1 };
    out.push(x);
  }
  return out;
}
// zones de lecture : en clé de sol, do3 – la4 (une ligne supplémentaire au plus) ; en clé de fa, mi1 – do3
const ZONE = { rh: [60, 81, 70], lh: [40, 60, 50] };
/** L'accord d'un degré, en position serrée, renversé, placé au milieu de la portée de la main. */
export function degreeChord(K, deg, inv = 0, hand = 'rh') {
  const ch = triadOn(K.tonic, K.mode, deg.d, { seventh: !!deg.seventh });
  let notes = stackUp(ch.notes);
  notes = notes.map((n, i) => (i < inv ? up(n) : n)).sort((a, b) => midiOf(a) - midiOf(b));
  const [lo, hi, mid] = ZONE[hand];
  const span = d => { const ms = notes.map(n => midiOf(shift(n, d))); return [Math.min(...ms), Math.max(...ms)]; };
  let best = 0, bestD = Infinity;
  for (let d = -4; d <= 3; d++) {
    const [a, b] = span(d);
    const out = Math.max(0, lo - a) + Math.max(0, b - hi);
    const score = out * 100 + Math.abs((a + b) / 2 - mid);
    if (score < bestD) { bestD = score; best = d; }
  }
  notes = notes.map(n => shift(n, best));
  return { notes, midis: notes.map(midiOf), roman: ch.roman, q: ch.q, root: ch.root, inv, hand };
}
/** Les noms des notes d'un accord, de la fondamentale vers le haut : « sol – si – ré – fa ». */
export const chordSpelling = (K, deg) => triadOn(K.tonic, K.mode, deg.d, { seventh: !!deg.seventh }).notes.map(n => noteName(n)).join(' – ');
export const chordLabel = c => `${c.roman} : ${noteName(c.root)} ${QUAL_FR[c.q] || ''}${c.inv ? `, ${INV_NAMES[c.inv]}` : ''}`.trim();
export function chordAbc(K, c) {
  const clef = c.hand === 'lh' ? 'bass' : 'treble';
  return `X:1\nL:1/4\nK:${K.abcKey} clef=${clef}\n[${c.notes.map(n => abcNote(n, K.alt)).join('')}]4|]`;
}
const signatureAbc = (K, clef = 'treble') => `X:1\nL:1/4\nK:${K.abcKey} clef=${clef}\nx4|]`;

/* ------------------------------------------------------------------ */
/* V9.2 : une note à retrouver d'oreille                                */
/* ------------------------------------------------------------------ */
// Le point sur l'oreille (18 novembre) : aucune séance de « Trouve la note » en une semaine, faute de motivation pour une
// catégorie à part. Une petite dose entre donc dans la minute de réflexes : l'accord de la tonique du jour, puis une
// note de la tonalité à rejouer (n'importe quelle octave). Ordre d'arrivée de « Trouve la note » (earfind-engine.js),
// sans les octaves : majeur 1, 5, 3, 6, 2, 4, 7 ; mineur (harmonique) 1, 5, 3, 4, 2, 7, 6. Départ : 1, 5, 3, les notes
// de l'accord. Une note de plus quand 8 des 10 dernières réponses sont justes ; une de moins à 5 sur 10 ou moins.
export const EAR_ORDER = { maj: [1, 5, 3, 6, 2, 4, 7], min: [1, 5, 3, 4, 2, 7, 6] };
export const EAR_START = 3;
export function earState() {
  const e = store.get(ST + '.ear') || {};
  return { n: EAR_START, hist: [], added: null, ...e };
}
/** Après une réponse : garde les 10 dernières, ajoute ou retire un degré. Renvoie { n, change: 'up' | 'down' | null }. */
export function earUpdate(ok, e = earState()) {
  const hist = (e.hist || []).concat(ok ? 1 : 0).slice(-10);
  let n = e.n, change = null, added = e.added;
  const good = hist.reduce((a, x) => a + x, 0);
  if (hist.length >= 10 && good >= 8 && n < 7) { n++; change = 'up'; added = { k: n, left: 5 }; }
  else if (hist.length >= 10 && good <= 5 && n > EAR_START) { n--; change = 'down'; added = null; }
  else if (added) added = added.left > 1 ? { ...added, left: added.left - 1 } : null;
  const out = { n, hist: change ? [] : hist, added };
  store.set(ST + '.ear', out);
  return { ...out, change };
}
/** La note d'un degré (orthographiée) et sa hauteur dans l'octave qui part de la tonique (tonique entre sol2 et fa♯3). */
export function earNote(K, d) {
  const sc = scale(K.tonic, K.mode === 'min' ? 'harmMin' : 'maj');
  const n = sc[d - 1];
  let t0 = midiOf({ ...K.tonic, o: 3 });
  while (t0 > 66) t0 -= 12;
  while (t0 < 55) t0 += 12;
  const iv = ((midiOf({ ...n, o: 3 }) - midiOf({ ...K.tonic, o: 3 })) % 12 + 12) % 12;
  return { d, note: n, name: noteName(n), midi: t0 + iv, pc: (t0 + iv) % 12, t0 };
}

/* ------------------------------------------------------------------ */
/* Les questions                                                        */
/* ------------------------------------------------------------------ */
// armures connues (nombre d'altérations, dièses positifs) : majeures et relatives
const MAJ_BY_FIFTHS = { 0: 'do', 1: 'sol', 2: 'ré', 3: 'la', 4: 'mi', 5: 'si', 6: 'fa♯', 7: 'do♯', '-1': 'fa', '-2': 'si♭', '-3': 'mi♭', '-4': 'la♭', '-5': 'ré♭', '-6': 'sol♭', '-7': 'do♭' };
const pairOf = f => { const M = parseNote(MAJ_BY_FIFTHS[f]); return `${noteName(M)} majeur / ${noteName(relative(M, 'maj'))} mineur`; };
const pickR = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
function shuffleR(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** Une question de réflexe : { type, prompt, abc?, choices?, answer, chord? }. maxAcc : altérations des armures. */
export function genReflex(K, { maxAcc = 4, cycleN = 1, last = null, rnd = Math.random, review = [], ear = null, lastDeg = null } = {}) {
  const types = ['armure', 'degre', 'degre', 'cadence', ...(ear ? ['oreille'] : [])].filter(t => t !== last || rnd() < 0.3);
  const type = pickR(types, rnd);
  if (type === 'armure') {
    const f = Math.round(rnd() * 2 * maxAcc) - maxAcc;
    const near = [f - 1, f + 1, -f, f + 2, f - 2].filter(x => x !== f && Math.abs(x) <= 7);
    const choices = shuffleR([f, ...shuffleR([...new Set(near)], rnd).slice(0, 3)], rnd).map(pairOf);
    const KK = keyInfo({ tonic: MAJ_BY_FIFTHS[f], mode: 'maj' });
    return { type, prompt: 'Quelle tonalité ?', abc: signatureAbc(KK, rnd() < 0.5 ? 'treble' : 'bass'), choices, answer: pairOf(f), info: `${Math.abs(f)} ${f >= 0 ? 'dièse' : 'bémol'}${Math.abs(f) > 1 ? 's' : ''}` };
  }
  if (type === 'oreille') {
    // les degrés en jeu ; le dernier arrivé revient plus souvent pendant cinq questions ; jamais deux fois de suite
    const set = EAR_ORDER[K.mode].slice(0, Math.max(EAR_START, Math.min(7, ear.n || EAR_START)));
    const fresh = ear.added && set.includes(EAR_ORDER[K.mode][ear.added.k - 1]) ? EAR_ORDER[K.mode][ear.added.k - 1] : null;
    let d;
    for (let k = 0; k < 10; k++) { d = fresh && rnd() < 0.4 ? fresh : pickR(set, rnd); if (d !== lastDeg) break; }
    const e = earNote(K, d);
    const tri = triadOn(K.tonic, K.mode, 1).notes.map(x => (((midiOf({ ...x, o: 3 }) - midiOf({ ...K.tonic, o: 3 })) % 12) + 12) % 12);
    return { type, prompt: `L’accord de ${K.name}, puis une note : joue-la`, deg: d, pc: e.pc, midi: e.midi, chordMidis: [e.t0 - 12, ...tri.map(iv => e.t0 + iv)], answer: `le ${d} (${e.name})`, set };
  }
  if (type === 'degre') {
    // V9.1 : une fois sur trois, une tonalité d'un cycle passé (révision)
    const KK = review.length && rnd() < 0.33 ? keyInfo(pickR(review, rnd)) : K;
    const deg = pickR(DEGREES[KK.mode], rnd);
    const c = degreeChord(KK, deg, 0, 'rh');
    const pcs = [...new Set(c.midis.map(m => ((m % 12) + 12) % 12))];
    return { type, prompt: `En ${KK.name}${KK !== K ? ' (révision)' : ''}, joue l’accord`, big: c.roman, pcs, chord: c, answer: `${c.roman} = ${chordSpelling(KK, deg)}`, review: KK !== K };
  }
  // cadence : parfaite (IV – V7 – I) ou demi-cadence (I – IV – V) ; à partir du cycle 2, rompue (V7 – vi)
  const kinds = cycleN >= 2 ? ['parfaite', 'demi', 'rompue'] : ['parfaite', 'demi'];
  const kind = pickR(kinds, rnd);
  const prog = { parfaite: [1, 4, [5, true], 1], demi: [1, 6, 4, 5], rompue: [1, 4, [5, true], 6] }[kind];
  const label = { parfaite: 'Parfaite (finit sur I)', demi: 'Demi-cadence (s’arrête sur V)', rompue: 'Rompue (V, puis vi)' };
  return { type, prompt: 'Quelle cadence ?', prog: prog.map(x => (Array.isArray(x) ? { d: x[0], seventh: x[1] } : { d: x })), choices: kinds.map(k => label[k]), answer: label[kind] };
}
/** Un accord de la tonalité à lire et à jouer (mode « Accords »). */
export function genChordItem(K, { last = null, rnd = Math.random, hand = null } = {}) {
  const hd = hand || (last ? (last.hand === 'rh' ? 'lh' : 'rh') : 'rh');
  for (let k = 0; k < 20; k++) {
    const deg = pickR(DEGREES[K.mode], rnd);
    const inv = Math.floor(rnd() * (deg.seventh ? 4 : 3));
    const c = degreeChord(K, deg, inv, hd);
    if (last && c.roman === last.roman && c.inv === last.inv) continue;
    return { type: 'accord', chord: c, abc: chordAbc(K, c), answer: chordLabel(c), spelling: chordSpelling(K, deg) };
  }
  return null;
}

/** Joue une progression dans la tonalité (cadence) ; renvoie la fin (secondes, horloge audio). */
function playProg(K, prog) {
  const spb = 0.5;
  const t0 = audio.now() + 0.15;
  let prevTop = 67;
  prog.forEach((deg, i) => {
    const c = triadOn(K.tonic, K.mode, deg.d, { seventh: !!deg.seventh });
    const pcs = c.notes.map(n => ((midiOf({ ...n, o: 3 }) % 12) + 12) % 12);
    // basse entre mi1 et ré♯2, accord serré au-dessus de mi2, au plus près du précédent (voix conduites)
    const bass = 40 + ((pcs[0] - 4 + 12) % 12);
    const opts = [];
    for (let base = 52; base <= 64; base++) { const ch = pcs.map(p => { let m = base; while (((m % 12) + 12) % 12 !== p) m++; return m; }).sort((a, b) => a - b); if (ch[ch.length - 1] - ch[0] <= 12) opts.push(ch); }
    const ch = opts.length ? opts.reduce((a, b) => (Math.abs(b[b.length - 1] - prevTop) < Math.abs(a[a.length - 1] - prevTop) ? b : a)) : pcs.map(p => 60 + p);
    prevTop = ch[ch.length - 1];
    const t = t0 + i * spb * 2;
    const last = i === prog.length - 1;
    [bass, ...ch].forEach(m => { const v = audio.noteOn(m, 62, t, { owner: 'reflexes' }); if (v) audio.noteOff(v, t + spb * (last ? 3 : 1.9)); });
  });
  return t0 + (prog.length - 1) * spb * 2 + spb;
}

/* ------------------------------------------------------------------ */
/* État et résumés                                                      */
/* ------------------------------------------------------------------ */
const saved = () => store.get(ST) || {};
function record(type, ok, rt) {
  const S = { ...(saved().stats || {}) };
  const s = { n: 0, ok: 0, rt: 0, fast: 0, ...(S[type] || {}) };
  s.n++; if (ok) { s.ok++; s.rt += rt; if (rt <= TARGETS[type]) s.fast++; }
  if (s.n > 40) { s.n /= 2; s.ok /= 2; s.rt /= 2; s.fast /= 2; }
  S[type] = s;
  store.set(ST + '.stats', S);
}
/** Où en est chaque réflexe : justesse, temps moyen, part des réponses sous la cible. */
export function reflexSummary() {
  const S = saved().stats || {};
  return Object.fromEntries(Object.entries(S).map(([k, s]) => [k, { acc: s.n ? s.ok / s.n : 0, avgMs: s.ok ? s.rt / s.ok : null, fastRate: s.ok ? s.fast / s.ok : 0, sure: s.n >= 10 && s.ok / s.n >= 0.9 && s.fast / Math.max(1, s.ok) >= 0.7 }]));
}
/** Le dernier score d'un mode (« accords » : accords justes par minute) pour le bilan du cycle. */
export function lastScore(mode, kName = null) {
  const hist = (saved().hist || []).filter(x => x.mode === mode && (!kName || x.key === kName));
  return hist.length ? hist[hist.length - 1] : null;
}

/* ------------------------------------------------------------------ */
/* Le widget                                                            */
/* ------------------------------------------------------------------ */
/**
 * mode : 'reflexes' ou 'accords' ; key : { tonic, mode } ; cycleN ; maxAcc ; onFinish({ mode, npm, acc, avgMs }).
 * Renvoie la fonction de nettoyage.
 */
export function mountReflexes(el, { mode = 'reflexes', key, cycleN = 1, maxAcc = 4, seconds = 60, bare = false, review = [], onFinish } = {}) {
  const K = keyInfo(key);
  const isChords = mode === 'accords';
  const frame = h('div', { class: 'w-frame notespeed reflexes' + (bare ? ' ns-bare' : '') });
  if (!bare) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, isChords ? `Accords de ${K.name}` : 'Réflexes de théorie'), h('span', { class: 'w-sub' }, `${seconds} s · ${K.name}`)));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  const info = h('p', { class: 'small ns-info' });
  const startBtn = h('button', { class: 'btn primary', type: 'button' }, `Commencer (${seconds === 60 ? '1 minute' : `${seconds} s`})`);
  const idle = h('div', { class: 'ns-idle' }, info, h('div', { class: 'btn-row' }, startBtn));
  const timeBar = h('div', { class: 'progress ns-time' }, h('i'));
  const counter = h('div', { class: 'ns-count' });
  const prompt = h('div', { class: 'rf-prompt' });
  const staff = h('div', { class: 'ns-staff', 'aria-live': 'polite' });
  const choicesBox = h('div', { class: 'rf-choices' });
  const fb = h('div', { class: 'ns-fb' });
  const inputHost = h('div', { class: 'ns-input' });
  const stopBtn = h('button', { class: 'btn ghost sm', type: 'button' }, 'Arrêter');
  const stage = h('div', { class: 'ns-stage', hidden: true }, h('div', { class: 'ns-top' }, counter, stopBtn), timeBar, prompt, staff, choicesBox, fb, inputHost);
  const results = h('div', { class: 'ns-results', hidden: true });
  body.append(idle, stage, results);

  info.innerHTML = isChords
    ? `Les accords de <b>${esc(K.name)}</b> (I, IV, V7, vi, ii), écrits avec l’armure, renversés, à une main ou à l’autre. Joue-les à la bonne octave : leur degré s’affiche après chaque réponse. Lis la forme avant les notes : toutes sur des lignes, ou toutes dans des interlignes, c’est l’état fondamental (la note du bas est la fondamentale) ; sinon l’accord est renversé, et la fondamentale est la note du haut de la quarte (dans un accord de septième, la note du haut de la seconde).`
    : `Une minute de questions mêlées, en <b>${esc(K.name)}</b> : une armure à reconnaître, un degré à jouer, une cadence à entendre, une note à retrouver d’oreille. Chaque réponse est chronométrée : vise moins de 2 à 3 secondes. Une erreur montre la réponse, puis on enchaîne.`;

  let running = false, cur = null, shownAt = 0, locked = false, t0 = 0, raf = 0, timers = [], offMidi = null, played = null, session = null, lastType = null, audioEnd = 0, earReadyAt = 0;
  const draw = abc => {
    staff.innerHTML = '';
    if (!abc) return;
    const div = h('div');
    staff.append(div);
    try { window.ABCJS.renderAbc(div, abc, { staffwidth: 170, scale: 2, paddingtop: 0, paddingbottom: 0, paddingleft: 0, paddingright: 0, add_classes: true }); }
    catch (e) { div.textContent = '…'; }
  };
  const next = () => {
    choicesBox.innerHTML = ''; fb.textContent = ''; fb.className = 'ns-fb';
    played = new Set(); locked = false;
    cur = isChords ? genChordItem(K, { last: cur?.chord }) : genReflex(K, { maxAcc, cycleN, last: lastType, review, ear: earState(), lastDeg: cur?.deg ?? null });
    if (!cur) { finish(false); return; }
    lastType = cur.type;
    prompt.textContent = isChords ? '' : cur.prompt;
    if (cur.abc) draw(cur.abc);
    else staff.innerHTML = cur.big ? `<div class="rf-big">${esc(cur.big)}</div>` : '';
    if (cur.choices) {
      for (const c of cur.choices) {
        const b = h('button', { type: 'button', class: 'btn rf-choice' }, c);
        b.addEventListener('click', () => answer(c === cur.answer, c));
        choicesBox.append(b);
      }
    }
    shownAt = performance.now();
    if (cur.type === 'oreille') {
      const q = cur;
      const replay = h('button', { class: 'btn sm', type: 'button' }, 'Réécouter');
      const listen = () => {
        if (cur !== q || locked) return;
        audio.stopAll('reflexes');
        const t0 = audio.now() + 0.12;
        q.chordMidis.forEach(m => { const v = audio.noteOn(m, 58, t0, { owner: 'reflexes' }); if (v) audio.noteOff(v, t0 + 0.85); });
        const tn = t0 + 1.15;
        const v = audio.noteOn(q.midi, 72, tn, { owner: 'reflexes' }); if (v) audio.noteOff(v, tn + 1.1);
        earReadyAt = audio.ctxToPerf ? audio.ctxToPerf(tn) : performance.now() + 1300;
        replay.disabled = true;
        timers.push(setTimeout(() => { if (cur !== q) return; replay.disabled = false; shownAt = performance.now(); }, Math.max(0, earReadyAt - performance.now())));
      };
      replay.addEventListener('click', listen);
      staff.replaceChildren(h('div', { class: 'rf-ear' }, h('span', { class: 'muted' }, 'Écoute la note après l’accord, chante-la si tu veux, puis trouve-la (n’importe quelle octave).'), replay));
      listen();
    }
    if (cur.type === 'cadence') {
      const q = cur;
      const replay = h('button', { class: 'btn sm', type: 'button' }, 'Réécouter');
      const listen = () => {
        if (cur !== q || locked) return;
        audio.stopAll('reflexes');
        const end = playProg(K, q.prog);
        audioEnd = audio.ctxToPerf ? audio.ctxToPerf(end) : performance.now() + 3000;
        replay.disabled = true;
        choicesBox.querySelectorAll('button').forEach(b => { b.disabled = true; });
        timers.push(setTimeout(() => {
          if (cur !== q || locked) return;
          choicesBox.querySelectorAll('button').forEach(b => { b.disabled = false; });
          replay.disabled = false;
          shownAt = performance.now();
        }, Math.max(0, audioEnd - performance.now())));
      };
      replay.addEventListener('click', listen);
      staff.replaceChildren(h('div', { class: 'rf-ear' }, h('span', { class: 'muted' }, 'Écoute la fin : sur quel accord s’arrête-t-elle ?'), replay));
      listen();
    }
  };
  const answer = (ok, given = null) => {
    if (!running || locked || !cur) return;
    const rt = performance.now() - shownAt;
    locked = true;
    record(cur.type, ok, rt);
    session.items.push({ type: cur.type, ok, rt });
    let earMsg = '';
    if (cur.type === 'oreille') {
      const r = earUpdate(ok);
      if (r.change === 'up') earMsg = ` · <b>Nouvelle note : le ${EAR_ORDER[K.mode][r.n - 1]}</b>`;
      if (r.change === 'down') earMsg = ' · une note de moins pour l’instant';
      if (!ok) { const m0 = cur.midi; timers.push(setTimeout(() => { const v = audio.noteOn(m0, 72, audio.now() + 0.05, { owner: 'reflexes' }); if (v) audio.noteOff(v, audio.now() + 1); }, 250)); }
    }
    if (ok) {
      session.ok++;
      const fast = rt <= TARGETS[cur.type];
      fb.innerHTML = `✓ ${(rt / 1000).toFixed(1).replace('.', ',')} s${fast ? '' : ' <span class="muted">(vise moins de ' + TARGETS[cur.type] / 1000 + ' s)</span>'}${cur.type === 'accord' || cur.type === 'oreille' ? ` · <b>${esc(cur.answer)}</b>` : ''}${earMsg}`;
      fb.className = 'ns-fb ok';
      timers.push(setTimeout(next, cur.type === 'accord' ? 900 : 450));
    } else {
      session.err++;
      const sp = cur.type === 'accord' ? ` (${esc(cur.spelling)})` : '';
      fb.innerHTML = `C’était <b>${esc(cur.answer)}</b>${sp}${given ? ` ; ${esc(given)}` : ''}.${earMsg}`;
      session.missed.add(cur.type);
      fb.className = 'ns-fb bad';
      choicesBox.querySelectorAll('button').forEach(b => { if (b.textContent === cur.answer) b.classList.add('right'); b.disabled = true; });
      timers.push(setTimeout(next, 1600));
    }
    counter.innerHTML = `<b>${session.ok}</b> juste${session.ok > 1 ? 's' : ''} · ${session.err} erreur${session.err > 1 ? 's' : ''}`;
  };
  const onNote = m => {
    if (!running || !cur || locked) return;
    if (cur.type === 'accord') {
      const want = new Set(cur.chord.midis);
      if (!want.has(m)) { answer(false, `tu as joué ${noteNameFr(m)}`); return; }
      played.add(m);
      if (played.size === want.size) answer(true);
    } else if (cur.type === 'oreille') {
      if (performance.now() < earReadyAt - 30) return; // la note n'a pas encore sonné
      const p = ((m % 12) + 12) % 12;
      if (p === cur.pc) answer(true);
      else answer(false, `tu as joué ${noteNameFr(m, { octave: false })}`);
    } else if (cur.type === 'degre') {
      const p = ((m % 12) + 12) % 12;
      if (!cur.pcs.includes(p)) { answer(false, `${noteNameFr(m, { octave: false })} n’est pas dans l’accord`); return; }
      played.add(p);
      if (cur.pcs.every(x => played.has(x))) answer(true);
    }
  };
  const buildInput = () => {
    inputHost.innerHTML = '';
    if (midi.status === 'ready') return;
    const [lo, hi] = isChords ? [40, 84] : [48, 77];
    inputHost.append(h('div', { class: 'quiz-kbd' }, keyboard({ from: lo, to: hi, interactive: true, names: 'c', height: 96, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) })));
  };
  const start = async () => {
    if (running) return;
    try { await audio.ensure(); } catch (e) { /* */ }
    await ensureAbcjs().catch(() => null);
    session = { ok: 0, err: 0, items: [], missed: new Set() };
    running = true;
    idle.hidden = true; results.hidden = true; stage.hidden = false;
    buildInput();
    offMidi = midi.on('noteon', ev => onNote(ev.note));
    counter.textContent = 'Prêt…';
    let k = 3;
    staff.innerHTML = `<div class="ns-go">${k}</div>`;
    const tick = () => {
      k--;
      if (!running) return;
      if (k > 0) { staff.innerHTML = `<div class="ns-go">${k}</div>`; timers.push(setTimeout(tick, 600)); return; }
      t0 = performance.now();
      counter.innerHTML = '<b>0</b> juste · 0 erreur';
      next();
      const frameFn = () => {
        if (!running) return;
        const left = Math.max(0, seconds - (performance.now() - t0) / 1000);
        timeBar.firstChild.style.width = `${(left / seconds) * 100}%`;
        timeBar.classList.toggle('low', left < 10);
        if (left <= 0) { finish(true); return; }
        raf = requestAnimationFrame(frameFn);
      };
      raf = requestAnimationFrame(frameFn);
    };
    timers.push(setTimeout(tick, 600));
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout); timers = [];
    offMidi?.(); offMidi = null;
    audio.stopAll('reflexes');
    cur = null;
  };
  const finish = complete => {
    const elapsed = (performance.now() - t0) / 1000;
    stop();
    stage.hidden = true; idle.hidden = false;
    if (!complete || !session || elapsed < Math.min(20, seconds)) { results.hidden = true; return; }
    const npm = Math.round((session.ok * 60) / seconds);
    const okItems = session.items.filter(x => x.ok);
    const avgMs = okItems.length ? Math.round(okItems.reduce((a, x) => a + x.rt, 0) / okItems.length) : null;
    const acc = session.ok + session.err ? session.ok / (session.ok + session.err) : 0;
    const byType = {};
    for (const x of session.items) { const o = byType[x.type] || (byType[x.type] = { n: 0, ok: 0, rt: 0 }); o.n++; if (x.ok) { o.ok++; o.rt += x.rt; } }
    const hist = (saved().hist || []).concat({ at: Date.now(), mode, key: K.name, ok: session.ok, err: session.err, npm, avgMs }).slice(-200);
    store.set(ST + '.hist', hist);
    const prev = hist.filter(x => x.mode === mode && x.key === K.name).slice(-2, -1)[0];
    results.innerHTML = '';
    results.append(h('h4', { class: 'an-sub' }, 'Résultat'), h('div', { class: 'an-grid' },
      h('div', { class: 'stat' }, h('div', { class: 'l' }, isChords ? 'Accords justes par minute' : 'Réponses justes'), h('div', { class: 'v' }, String(isChords ? npm : session.ok))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Justesse'), h('div', { class: 'v' }, fmtPct(acc))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Temps moyen'), h('div', { class: 'v' }, avgMs ? `${(avgMs / 1000).toFixed(1).replace('.', ',')} s` : '—'))));
    const lines = Object.entries(byType).map(([t, o]) => `${TYPE_LABEL[t]} : ${o.ok}/${o.n}${o.ok ? `, ${(o.rt / o.ok / 1000).toFixed(1).replace('.', ',')} s` : ''}`);
    if (!isChords && lines.length) results.append(h('ul', { class: 'small ns-weak' }, ...lines.map(l => h('li', {}, l))));
    if (prev) results.append(h('p', { class: 'small' }, isChords ? `La fois d’avant : ${prev.npm} par minute.` : `La fois d’avant : ${prev.ok} justes, ${prev.avgMs ? (prev.avgMs / 1000).toFixed(1).replace('.', ',') + ' s en moyenne' : ''}.`));
    // après une erreur seulement : le chapitre à relire (plus tard, pas maintenant)
    const ch = [...session.missed].map(t => CHAPTER[t]).filter(Boolean).filter((c, i, a) => a.findIndex(x => x.id === c.id) === i);
    if (ch.length) results.append(h('p', { class: 'small rf-chap' }, 'À revoir plus tard, pour ce qui t’a trompé : ', ...ch.flatMap((c, i) => [i ? ' ; ' : '', h('a', { href: c.href || `#/lecon/${c.id}` }, c.title)]), '.'));
    results.hidden = false;
    onFinish?.({ mode, npm, acc, avgMs, ok: session.ok });
  };
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', () => finish(false));
  // accès de test
  frame.__reflexes = { get cur() { return cur; }, get running() { return running; }, get earReadyAt() { return earReadyAt; }, answer: c => answer(c === cur?.answer, c) };
  return () => stop();
}
