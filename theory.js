// Théorie musicale écrite, à la française : notes avec leur nom exact (fa♯ et non sol♭), intervalles, gammes,
// accords, armures, accords d'une tonalité. Sert aux exercices « Construis au clavier » et aux vérifications.
// Une note écrite : { l: 0..6 (do..si), a: altération -2..2, o: octave française (do3 = do central) ou null }.

export const LETTERS_FR = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const ACC_OF = { '𝄫': -2, '♭♭': -2, bb: -2, '♭': -1, b: -1, '': 0, '♮': 0, '♯': 1, '#': 1, '𝄪': 2, '##': 2, x: 2 };
const ACC_SIGN = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
const NOTE_RE = /^(do|ré|re|mi|fa|sol|la|si)(𝄫|𝄪|♭♭|##|bb|♯|♭|♮|#|b|x)?(-?\d+)?$/i;

/** 'fa♯3', 'si♭', 'reb4', 'mi𝄫2' → note écrite (null si illisible). */
export function parseNote(s) {
  if (s && typeof s === 'object') return s;
  const m = String(s).trim().match(NOTE_RE);
  if (!m) return null;
  const l = LETTERS_FR.indexOf(m[1].toLowerCase().replace(/^re$/, 'ré'));
  return { l, a: ACC_OF[m[2] || ''] ?? 0, o: m[3] != null ? +m[3] : null };
}
const N = x => (typeof x === 'string' ? parseNote(x) : x);

/** Nom français : « fa♯ », ou « fa♯3 » avec l'octave. */
export function noteName(n, { octave = false } = {}) {
  n = N(n);
  return LETTERS_FR[n.l] + ACC_SIGN[n.a] + (octave && n.o != null ? n.o : '');
}
/** Hauteur MIDI (octave 3 par défaut). */
export function midiOf(n, defOct = 3) {
  n = N(n);
  const o = n.o ?? defOct;
  return 12 * (o + 2) + LETTER_PC[n.l] + n.a;
}
export const pcOf = n => ((midiOf(n) % 12) + 12) % 12;
const withOct = (n, o) => ({ ...n, o });

/** Nom d'un nombre de demi-tons, pour un pas de gamme. */
export function stepName(semis) {
  return { 0: 'aucun écart', 1: 'un demi-ton', 2: 'un ton', 3: 'un ton et demi', 4: 'deux tons' }[Math.abs(semis)] || `${Math.abs(semis)} demi-tons`;
}

/* ------------------------------------------------------------------ */
/* Intervalles                                                         */
/* ------------------------------------------------------------------ */
const SIMPLE_REF = [0, 2, 4, 5, 7, 9, 11];      // unisson, 2de M, 3ce M, 4te J, 5te J, 6te M, 7e M
const PERFECT = new Set([0, 3, 4]);              // unisson, quarte, quinte (et octave)
export const NUM_NAME = { 1: 'unisson', 2: 'seconde', 3: 'tierce', 4: 'quarte', 5: 'quinte', 6: 'sixte', 7: 'septième', 8: 'octave', 9: 'neuvième', 10: 'dixième', 11: 'onzième', 12: 'douzième', 13: 'treizième' };
export const QUAL_NAME = { M: 'majeure', m: 'mineure', J: 'juste', A: 'augmentée', d: 'diminuée' };

/** Intervalle de a (grave) à b (aigu). Sans octaves : b est pris au-dessus de a, dans l'octave. */
export function interval(a, b) {
  a = N(a); b = N(b);
  if (a.o == null || b.o == null) {
    a = withOct(a, 3);
    b = withOct(b, b.l > a.l || (b.l === a.l && b.a >= a.a) ? 3 : 4);
  }
  const steps = (b.l + 7 * b.o) - (a.l + 7 * a.o);
  const number = Math.abs(steps) + 1;
  const semis = Math.abs(midiOf(b) - midiOf(a));
  const idx = (number - 1) % 7;
  const ref = SIMPLE_REF[idx] + 12 * Math.floor((number - 1) / 7);
  const diff = semis - ref;
  let q;
  if (PERFECT.has(idx)) q = diff === 0 ? 'J' : diff === 1 ? 'A' : diff === -1 ? 'd' : diff > 0 ? 'A' : 'd';
  else q = diff === 0 ? 'M' : diff === -1 ? 'm' : diff === 1 ? 'A' : diff === -2 ? 'd' : diff > 0 ? 'A' : 'd';
  return { number, semis, q, short: number === 8 && q === 'J' ? '8ve' : `${number}${q}`, name: ivName(number, q) };
}
export function ivName(number, q) {
  if (number === 1) return q === 'J' ? 'unisson' : `unisson ${QUAL_NAME[q]}`;
  if (number === 8 && q === 'J') return 'octave';
  return `${NUM_NAME[number] || number + 'e'} ${QUAL_NAME[q]}`;
}
/** '3M' → { number: 3, q: 'M', semis: 4 } ; accepte '8ve', 'U', 'Triton' (= 4A). */
export function parseIv(s) {
  if (s === '8ve') return { number: 8, q: 'J', semis: 12 };
  if (s === 'U') return { number: 1, q: 'J', semis: 0 };
  if (s === 'Triton') return { number: 4, q: 'A', semis: 6 };
  const m = String(s).match(/^(\d+)([MmJAd])$/);
  if (!m) throw new Error('Intervalle illisible : ' + s);
  const number = +m[1], q = m[2];
  const idx = (number - 1) % 7;
  const ref = SIMPLE_REF[idx] + 12 * Math.floor((number - 1) / 7);
  const off = PERFECT.has(idx) ? { J: 0, A: 1, d: -1 }[q] : { M: 0, m: -1, A: 1, d: -2 }[q];
  if (off == null) throw new Error('Qualité impossible : ' + s);
  return { number, q, semis: ref + off };
}
/** Note à un intervalle donné au-dessus (ou au-dessous) d'une note, avec le nom exact. */
export function transpose(n, iv, dir = 'up') {
  n = N(n);
  const noOct = n.o == null;
  const base = noOct ? withOct(n, 3) : n;
  const { number, semis } = typeof iv === 'string' ? parseIv(iv) : iv;
  const L = base.l + 7 * base.o + (dir === 'up' ? 1 : -1) * (number - 1);
  const l = ((L % 7) + 7) % 7, o = Math.floor(L / 7);
  const target = midiOf(base) + (dir === 'up' ? semis : -semis);
  const a = target - (12 * (o + 2) + LETTER_PC[l]);
  return { l, a, o: noOct ? null : o };
}

/* ------------------------------------------------------------------ */
/* Gammes et accords                                                   */
/* ------------------------------------------------------------------ */
export const SCALE_IVS = {
  maj: ['U', '2M', '3M', '4J', '5J', '6M', '7M', '8ve'],
  natMin: ['U', '2M', '3m', '4J', '5J', '6m', '7m', '8ve'],
  harmMin: ['U', '2M', '3m', '4J', '5J', '6m', '7M', '8ve'],
  melMin: ['U', '2M', '3m', '4J', '5J', '6M', '7M', '8ve'],
};
export const SCALE_NAME = { maj: 'majeure', natMin: 'mineure naturelle', harmMin: 'mineure harmonique', melMin: 'mineure mélodique' };
/** Les huit notes de la gamme (tonique comprise deux fois). */
export function scale(tonic, mode = 'maj') {
  return SCALE_IVS[mode].map(iv => transpose(tonic, iv));
}
export const CHORD_IVS = {
  M: ['U', '3M', '5J'], m: ['U', '3m', '5J'], dim: ['U', '3m', '5d'], aug: ['U', '3M', '5A'],
  '7': ['U', '3M', '5J', '7m'], maj7: ['U', '3M', '5J', '7M'], m7: ['U', '3m', '5J', '7m'], hdim7: ['U', '3m', '5d', '7m'], dim7: ['U', '3m', '5d', '7d'],
};
export const CHORD_NAME = { M: 'majeur', m: 'mineur', dim: 'diminué', aug: 'augmenté', '7': 'septième de dominante', maj7: 'septième majeure', m7: 'septième mineure', hdim7: 'demi-diminué', dim7: 'septième diminuée' };
/** Notes d'un accord (fondamentale, tierce, quinte, septième). */
export function chord(root, q = 'M') {
  return CHORD_IVS[q].map(iv => transpose(root, iv));
}
/** Nature d'un accord de trois ou quatre sons rangé en tierces (fondamentale d'abord). */
export function chordQuality(notes) {
  const ns = notes.map(N);
  const ivs = ns.slice(1).map(x => interval(ns[0], x).short).join(',');
  for (const [q, list] of Object.entries(CHORD_IVS)) if (list.slice(1).join(',') === ivs) return q;
  return null;
}
/** Range des notes en tierces superposées : renvoie { root, notes (rangées), q } ou null. */
export function stackThirds(notes) {
  const ns = notes.map(N);
  for (const r of ns) {
    const rest = ns.filter(x => x !== r);
    const byStep = rest.map(x => ({ x, st: ((x.l - r.l) % 7 + 7) % 7 }));
    const order = [2, 4, 6];
    const sorted = [r];
    let ok = true;
    for (const st of order.slice(0, rest.length)) {
      const f = byStep.find(y => y.st === st);
      if (!f) { ok = false; break; }
      sorted.push(f.x);
    }
    if (!ok || sorted.length !== ns.length) continue;
    const q = chordQuality(sorted.map(x => withOct(x, null)));
    if (q) return { root: r, notes: sorted, q };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Tonalités et armures                                                */
/* ------------------------------------------------------------------ */
export const SHARP_ORDER = ['fa', 'do', 'sol', 'ré', 'la', 'mi', 'si'];
export const FLAT_ORDER = ['si', 'mi', 'la', 'ré', 'sol', 'do', 'fa'];
/** Armure d'une tonalité : nombre (positif : dièses, négatif : bémols) et liste des notes altérées. */
export function keySignature(tonic, mode = 'maj') {
  const t = N(tonic);
  const major = mode === 'maj' ? t : transpose(t, '3m', 'up');
  const notes = scale(major, 'maj').slice(0, 7);
  const sharps = notes.filter(x => x.a > 0).length, flats = notes.filter(x => x.a < 0).length;
  const count = sharps ? sharps : -flats;
  const list = count > 0 ? SHARP_ORDER.slice(0, count).map(x => x + '♯') : FLAT_ORDER.slice(0, -count).map(x => x + '♭');
  return { count, list, relMajor: major };
}
/** Relative : la mineure est une tierce mineure sous la majeure. */
export function relative(tonic, mode = 'maj') {
  return mode === 'maj' ? transpose(tonic, '3m', 'down') : transpose(tonic, '3m', 'up');
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
/** Accord de trois sons (ou de septième) sur un degré : en mineur, forme harmonique par défaut. */
export function triadOn(tonic, mode, degree, { seventh = false, form = 'harmMin' } = {}) {
  const t = N(tonic);
  const full = scale(t, mode === 'maj' ? 'maj' : form).slice(0, 7);         // avec l'octave de la tonique
  const sc = full.map(n => withOct(n, null));                                 // sans octave : empilement vers le haut
  const pick = k => sc[(degree - 1 + k) % 7];
  const notes = [full[degree - 1], pick(2), pick(4)].concat(seventh ? [pick(6)] : []);
  const q = chordQuality([pick(0), pick(2), pick(4)].concat(seventh ? [pick(6)] : []));
  let r = ROMAN[degree - 1];
  if (q === 'm' || q === 'dim' || q === 'm7' || q === 'hdim7' || q === 'dim7') r = r.toLowerCase();
  const suffix = { dim: '°', aug: '+', '7': '7', maj7: 'maj7', m7: '7', hdim7: 'ø7', dim7: '°7' }[q] || '';
  return { root: notes[0], notes, q, roman: r + suffix };
}

/** Nom lisible d'une tonalité : « fa♯ majeur », « do mineur ». */
export const keyName = (tonic, mode = 'maj') => `${noteName(tonic)} ${mode === 'maj' ? 'majeur' : 'mineur'}`;

/** Écrit une hauteur MIDI avec le nom le plus proche d'une note attendue (même lettre si possible). */
export function spellNear(m, near) {
  const n = near ? N(near) : null;
  const o = Math.floor(m / 12) - 2;
  const tryLetter = l => {
    for (const oo of [o, o - 1, o + 1]) {
      const a = m - (12 * (oo + 2) + LETTER_PC[l]);
      if (Math.abs(a) <= 1) return { l, a, o: oo };
    }
    return null;
  };
  if (n) {
    for (const d of [0, -1, 1]) {
      const r = tryLetter(((n.l + d) % 7 + 7) % 7);
      if (r && (d === 0 || r.a === 0)) return r;
    }
  }
  for (let l = 0; l < 7; l++) { const r = tryLetter(l); if (r && r.a === 0) return r; }
  // touche noire sans indice : les noms usuels (do♯, mi♭, fa♯, la♭, si♭), sinon d'après l'altération attendue
  const p = ((m % 12) + 12) % 12;
  const usual = { 1: [0, 1], 3: [2, -1], 6: [3, 1], 8: [5, -1], 10: [6, -1] }[p];
  if (n && n.a !== 0) { const want = n.a < 0 ? -1 : 1; for (let l = 0; l < 7; l++) { const r = tryLetter(l); if (r && r.a === want) return r; } }
  if (usual) { const r = tryLetter(usual[0]); if (r && r.a === usual[1]) return r; }
  return tryLetter(0) || { l: 0, a: 0, o };
}
