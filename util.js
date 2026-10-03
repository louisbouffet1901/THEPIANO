// Utilitaires généraux : DOM, musique, divers.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Création d'élément : h('div', {class: 'x', onclick: fn}, 'texte', autreElement) */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  for (const c of children.flat(Infinity)) {
    if (c === undefined || c === null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sum = arr => arr.reduce((a, b) => a + b, 0);
export const mean = arr => (arr.length ? sum(arr) / arr.length : 0);
export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function stdev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(sum(arr.map(x => (x - m) ** 2)) / (arr.length - 1));
}
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- Musique ---------------- */

export const NOTE_FR = ['do', 'do♯', 'ré', 'mi♭', 'mi', 'fa', 'fa♯', 'sol', 'la♭', 'la', 'si♭', 'si'];
export const NOTE_FR_SHARP = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
export const NOTE_FR_FLAT = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];

/** Octave à la française : le do central (MIDI 60) est do3. */
export const frOctave = m => Math.floor(m / 12) - 2;

export function noteNameFr(m, { octave = true, flats = null } = {}) {
  const pc = ((m % 12) + 12) % 12;
  const table = flats === true ? NOTE_FR_FLAT : flats === false ? NOTE_FR_SHARP : NOTE_FR;
  return table[pc] + (octave ? frOctave(m) : '');
}
export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
export const isBlack = m => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
export const pc = m => ((m % 12) + 12) % 12;

/** Noms d'intervalles (en demi-tons, jusqu'à l'octave). */
export const INTERVALS = [
  { st: 0, short: 'U', name: 'unisson' },
  { st: 1, short: '2m', name: 'seconde mineure' },
  { st: 2, short: '2M', name: 'seconde majeure' },
  { st: 3, short: '3m', name: 'tierce mineure' },
  { st: 4, short: '3M', name: 'tierce majeure' },
  { st: 5, short: '4J', name: 'quarte juste' },
  { st: 6, short: 'Triton', name: 'triton (quarte augmentée / quinte diminuée)' },
  { st: 7, short: '5J', name: 'quinte juste' },
  { st: 8, short: '6m', name: 'sixte mineure' },
  { st: 9, short: '6M', name: 'sixte majeure' },
  { st: 10, short: '7m', name: 'septième mineure' },
  { st: 11, short: '7M', name: 'septième majeure' },
  { st: 12, short: '8ve', name: 'octave' },
];

/* Tonalités : armure (nombre d'altérations, + dièses / - bémols). */
export const KEYS = {
  'C': { sig: 0, fr: 'do majeur', mode: 'maj', tonic: 60, abc: 'C' },
  'G': { sig: 1, fr: 'sol majeur', mode: 'maj', tonic: 67, abc: 'G' },
  'D': { sig: 2, fr: 'ré majeur', mode: 'maj', tonic: 62, abc: 'D' },
  'A': { sig: 3, fr: 'la majeur', mode: 'maj', tonic: 69, abc: 'A' },
  'E': { sig: 4, fr: 'mi majeur', mode: 'maj', tonic: 64, abc: 'E' },
  'B': { sig: 5, fr: 'si majeur', mode: 'maj', tonic: 71, abc: 'B' },
  'F#': { sig: 6, fr: 'fa♯ majeur', mode: 'maj', tonic: 66, abc: 'F#' },
  'F': { sig: -1, fr: 'fa majeur', mode: 'maj', tonic: 65, abc: 'F' },
  'Bb': { sig: -2, fr: 'si♭ majeur', mode: 'maj', tonic: 70, abc: 'Bb' },
  'Eb': { sig: -3, fr: 'mi♭ majeur', mode: 'maj', tonic: 63, abc: 'Eb' },
  'Ab': { sig: -4, fr: 'la♭ majeur', mode: 'maj', tonic: 68, abc: 'Ab' },
  'Db': { sig: -5, fr: 'ré♭ majeur', mode: 'maj', tonic: 61, abc: 'Db' },
  'Gb': { sig: -6, fr: 'sol♭ majeur', mode: 'maj', tonic: 66, abc: 'Gb' },
  'Am': { sig: 0, fr: 'la mineur', mode: 'min', tonic: 69, abc: 'Am' },
  'Em': { sig: 1, fr: 'mi mineur', mode: 'min', tonic: 64, abc: 'Em' },
  'Bm': { sig: 2, fr: 'si mineur', mode: 'min', tonic: 71, abc: 'Bm' },
  'F#m': { sig: 3, fr: 'fa♯ mineur', mode: 'min', tonic: 66, abc: 'F#m' },
  'C#m': { sig: 4, fr: 'do♯ mineur', mode: 'min', tonic: 61, abc: 'C#m' },
  'G#m': { sig: 5, fr: 'sol♯ mineur', mode: 'min', tonic: 68, abc: 'G#m' },
  'Dm': { sig: -1, fr: 'ré mineur', mode: 'min', tonic: 62, abc: 'Dm' },
  'Gm': { sig: -2, fr: 'sol mineur', mode: 'min', tonic: 67, abc: 'Gm' },
  'Cm': { sig: -3, fr: 'do mineur', mode: 'min', tonic: 60, abc: 'Cm' },
  'Fm': { sig: -4, fr: 'fa mineur', mode: 'min', tonic: 65, abc: 'Fm' },
  'Bbm': { sig: -5, fr: 'si♭ mineur', mode: 'min', tonic: 70, abc: 'Bbm' },
  'Ebm': { sig: -6, fr: 'mi♭ mineur', mode: 'min', tonic: 63, abc: 'Ebm' },
};

/** Gammes en demi-tons depuis la tonique. */
export const SCALES = {
  maj: [0, 2, 4, 5, 7, 9, 11],
  natMin: [0, 2, 3, 5, 7, 8, 10],
  harmMin: [0, 2, 3, 5, 7, 8, 11],
  melMin: [0, 2, 3, 5, 7, 9, 11],
};

/** Accords en demi-tons depuis la fondamentale. */
export const CHORDS = {
  '5': { iv: [0, 7], fr: 'quinte à vide' },
  M: { iv: [0, 4, 7], fr: 'majeur' },
  m: { iv: [0, 3, 7], fr: 'mineur' },
  dim: { iv: [0, 3, 6], fr: 'diminué' },
  aug: { iv: [0, 4, 8], fr: 'augmenté' },
  '7': { iv: [0, 4, 7, 10], fr: 'septième de dominante' },
  maj7: { iv: [0, 4, 7, 11], fr: 'septième majeure' },
  m7: { iv: [0, 3, 7, 10], fr: 'septième mineure' },
  hdim7: { iv: [0, 3, 6, 10], fr: 'septième de sensible (demi-diminuée)' },
  dim7: { iv: [0, 3, 6, 9], fr: 'septième diminuée' },
};

/** Conversion MIDI -> nom ABC (avec altération explicite : ^ dièse, _ bémol, = bécarre). */
export function midiToAbc(m, { flats = false, accidental = null } = {}) {
  const sharpNames = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  const flatNames = ['C', '_D', 'D', '_E', 'E', 'F', '_G', 'G', '_A', 'A', '_B', 'B'];
  let p = pc(m);
  let name = (flats ? flatNames : sharpNames)[p];
  let octShift = 0;
  if (accidental === 'natural' && !name.startsWith('^') && !name.startsWith('_')) name = '=' + name;
  // Gestion des cas Cb / B# / Fb / E# non nécessaires ici.
  const letter = name.replace(/[\^_=]/g, '');
  const acc = name.slice(0, name.length - letter.length);
  const oct = Math.floor(m / 12) - 1 + octShift; // octave scientifique
  // En ABC : C = do3 français (C4 scientifique), c = C5, C, = C3
  let s;
  if (oct >= 5) s = letter.toLowerCase() + "'".repeat(oct - 5);
  else s = letter + ','.repeat(4 - oct);
  return acc + s;
}

export function fmtPct(x, digits = 0) {
  return (x * 100).toFixed(digits).replace('.', ',') + ' %';
}
export function fmtNum(x, digits = 0) {
  return Number(x).toFixed(digits).replace('.', ',');
}

/** Lien de recherche YouTube (toujours valide). */
export const ytSearch = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
export const INFORMANCE = 'https://www.online-academy.informance.biz';
