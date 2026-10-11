// Accompagnateur d'improvisation (V4).
// - Des grilles par style : ostinato et pentatonique, harmonie simple, romance en arpèges (Liszt), élégie
//   (arpèges larges à la russe), nocturne (les harmonies de l'op. 55 n° 1), valse, prélude et choral (Chopin),
//   et le langage classique (cadences, règle de l'octave, schémas).
// - La grille entière est affichée : on voit l'accord en cours ET les suivants, avec leurs notes.
// - La main gauche est jouée par l'appli, ou par toi (l'appli montre alors la basse et l'accord à jouer).
// - Jeu guidé « question – réponse » : l'appli pose une question (une ou deux mesures), tu réponds ; chaque réponse
//   est évaluée (notes de l'accord sur les temps forts, fin stable, reprise du rythme de la question).
// - Mode « squelette » : la note d'appui de chaque mesure est indiquée en or ; tu la poses au premier temps et tu
//   remplis entre elles.
// - Réécoute : ta main droite rejouée avec l'accompagnement.
import { h, esc, fmtPct, noteNameFr, pc, pick, CHORDS, SCALES } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard, COLORS } from './diagrams.js';

const PC_NAMES_FLAT = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];
const PC_NAMES_SHARP = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
/** Noms avec dièses dans les tonalités à dièses (fa♯ majeur, la mineur avec sol♯…), bémols sinon. */
const SHARP_TONICS = { maj: [7, 2, 9, 4, 11, 6], min: [4, 11, 6, 1, 8, 9] };
function pcName(p, ch) {
  const sharp = (SHARP_TONICS[ch.mode] || []).includes(ch.tonic % 12) || (ch.mode === 'min' && p === (ch.tonic + 11) % 12 && [9, 4, 2, 7].includes(ch.tonic % 12));
  return (sharp ? PC_NAMES_SHARP : PC_NAMES_FLAT)[p];
}
const isBlackKey = m => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);

/** Chiffrages romains -> [décalage, qualité] */
const ROMAN = {
  maj: { I: [0, 'M'], ii: [2, 'm'], iii: [4, 'm'], IV: [5, 'M'], V: [7, 'M'], V7: [7, '7'], vi: [9, 'm'], 'vii°': [11, 'dim'], 'V7/IV': [0, '7'], 'V7/V': [2, '7'], 'V7/vi': [4, '7'], 'V7/ii': [9, '7'], ii7: [2, 'm7'], IVmaj7: [5, 'maj7'] },
  min: { i: [0, 'm'], 'ii°': [2, 'dim'], 'iiø7': [2, 'hdim7'], III: [3, 'M'], iv: [5, 'm'], V: [7, 'M'], V7: [7, '7'], VI: [8, 'M'], VII: [10, 'M'], N6: [1, 'M'], 'V7/iv': [0, '7'], 'V7/III': [10, '7'], 'vii°7': [11, 'dim7'] },
};

/* Grilles écrites accord par accord (basse imposée : bassM = note MIDI de la basse ; notes = voicing exact ;
   beats = durée en temps si l'accord ne dure pas toute la mesure). */
const C = (label, root, q, bassM, extra = {}) => ({ label, root, q, bassM, ...extra });
const REP = (n, ch) => Array.from({ length: n }, () => ({ ...ch }));
const OCTAVE_MAJ = [
  C('I', 0, 'M', 48, { name: 'do majeur', section: 'montée' }), C('V4/3', 7, '7', 50, { name: 'sol 7 / ré' }), C('I6', 0, 'M', 52, { name: 'do majeur / mi' }),
  C('ii6/5', 2, 'm7', 53, { name: 'ré mineur 7 / fa' }), C('V', 7, 'M', 55, { name: 'sol majeur' }), C('IV6', 5, 'M', 57, { name: 'fa majeur / la' }),
  C('V6/5', 7, '7', 59, { name: 'sol 7 / si' }), C('I', 0, 'M', 60, { name: 'do majeur' }),
  C('I', 0, 'M', 60, { name: 'do majeur', section: 'descente' }), C('V6', 7, 'M', 59, { name: 'sol majeur / si' }), C('V4/3 de V', 2, '7', 57, { name: 'ré 7 / la' }),
  C('V', 7, 'M', 55, { name: 'sol majeur' }), C('V4/2', 7, '7', 53, { name: 'sol 7 / fa' }), C('I6', 0, 'M', 52, { name: 'do majeur / mi' }),
  C('V4/3', 7, '7', 50, { name: 'sol 7 / ré' }), C('I', 0, 'M', 48, { name: 'do majeur' }),
];

const OCTAVE_TG = [72, 71, 72, 72, 71, 72, 67, 67, 72, 74, 72, 71, 71, 72, 67, 67];
const SOPRANO = { targetName: 'Soprano', targetHelp: 'La note en or est le soprano de l’accord : joue-la au premier temps (avec les voix du milieu si tu peux), puis relie-la à la suivante.' };
const CHOPIN = { targetName: 'Squelette de Chopin' };

/* Les harmonies des mesures 1 à 8 du Nocturne op. 55 n° 1 (une harmonie par demi-mesure), avec les voicings
   de Chopin à la main gauche (basse au 1er et au 3e temps, accord au 2e et au 4e). */
const OP55_GRID = [
  C('i', 5, 'm', 41, { name: 'fa mineur', notes: [56, 60, 65], beats: 2, section: 'm. 1' }), C('VII6', 3, 'M', 43, { name: 'mi♭ majeur / sol', notes: [51, 58, 63], beats: 2 }),
  C('III', 8, 'M', 44, { name: 'la♭ majeur', notes: [60, 68], beats: 2 }), C('V6/5', 0, '7', 40, { name: 'do 7 / mi', notes: [58, 60, 67], beats: 2 }),
  C('i', 5, 'm', 41, { name: 'fa mineur', notes: [56, 60, 65], beats: 2, section: 'm. 3' }), C('VII6', 3, 'M', 43, { name: 'mi♭ majeur / sol', notes: [51, 58, 63], beats: 2 }),
  C('III', 8, 'M', 44, { name: 'la♭ majeur', notes: [60, 68], beats: 2 }), C('V6/5', 0, '7', 40, { name: 'do 7 / mi', notes: [58, 60, 67], beats: 2 }),
  C('i', 5, 'm', 41, { name: 'fa mineur', notes: [56, 60, 65], beats: 2, section: 'm. 5' }), C('VII6', 3, 'M', 43, { name: 'mi♭ majeur / sol', notes: [51, 58, 63], beats: 2 }),
  C('III', 8, 'M', 44, { name: 'la♭ majeur', notes: [60, 68], beats: 2 }), C('N6', 6, 'M', 46, { name: 'sol♭ majeur / si♭', notes: [54, 61, 66], beats: 2 }),
  C('i6/4', 5, 'm', 48, { name: 'fa mineur / do', notes: [56, 60, 65], beats: 2, section: 'cadence' }), C('V7', 0, '7', 36, { name: 'do 7', notes: [48, 58, 64], beats: 2 }),
  C('i', 5, 'm', 41, { name: 'fa mineur', notes: [56, 60, 65], beats: 4 }),
];

export const IMPROV_PRESETS = {
  /* ---- Niveau 1 : le motif, la question et la réponse ---- */
  'n1-noires': { title: 'Touches noires sur un ostinato (fa♯)', tonic: 6, mode: 'maj', meter: 4, scale: [0, 2, 4, 7, 9], showScale: true,
    custom: REP(4, C('fa♯ – do♯', 6, '5', 42, { name: 'quinte à vide' })), pattern: 'ostinato', bpm: 76 },
  'n1-penta': { title: 'Pentatonique de do sur un bourdon (do – sol)', tonic: 0, mode: 'maj', meter: 4, scale: [0, 2, 4, 7, 9], showScale: true,
    custom: REP(4, C('do – sol', 0, '5', 48, { name: 'quinte à vide' })), pattern: 'bourdon', bpm: 72 },
  'n1-penta-la': { title: 'Pentatonique de la mineur sur un ostinato (la – mi)', tonic: 9, mode: 'min', meter: 4, scale: [0, 3, 5, 7, 10], showScale: true,
    custom: REP(4, C('la – mi', 9, '5', 45, { name: 'quinte à vide' })), pattern: 'ostinato', bpm: 76 },
  /* ---- Niveau 1 : l'harmonie ---- */
  'n1-5notes': { title: 'Cinq notes (do à sol) sur I et V7', tonic: 0, mode: 'maj', meter: 4, scale: [0, 2, 4, 5, 7], showScale: true,
    bars: ['I', 'I', 'V7', 'V7', 'I', 'I', 'V7', 'I'], pattern: 'basse-accord', bpm: 72 },
  'n1-IIVVI': { title: 'Do majeur : I – IV – V7 – I', tonic: 0, mode: 'maj', meter: 4, bars: ['I', 'IV', 'V7', 'I'], pattern: 'basse-accord', bpm: 66 },
  'n1-IIVVI8': { title: 'Do majeur, 8 mesures : I – vi – IV – V7, I – IV – V7 – I', tonic: 0, mode: 'maj', meter: 4, bars: ['I', 'vi', 'IV', 'V7', 'I', 'IV', 'V7', 'I'], pattern: 'alberti', bpm: 72 },
  'n1-am': { title: 'La mineur : i – iv – V7 – i', tonic: 9, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i', 'i', 'iv', 'V7', 'i'], pattern: 'arpege', bpm: 60 },
  'n1-am-squelette': { title: 'La mineur, avec le squelette à poser (notes d’appui en or)', tonic: 9, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i', 'VI', 'iv', 'V7', 'i'],
    targets: [76, 77, 71, 72, 72, 74, 71, 69], pattern: 'basse-accord', bpm: 60 },
  'n1-soupirs': { title: 'Mi mineur : des soupirs (une appoggiature par mesure)', tonic: 4, mode: 'min', meter: 4, bars: ['i', 'VI', 'iv', 'V7', 'i', 'iv', 'V7', 'i'],
    targets: [72, 74, 71, 76, 78, 74, 72, 66], targetLabel: 'appoggiature', pattern: 'arpege', bpm: 56 },
  'n1-nocturne': { title: 'Nocturne en fa mineur : i – iv – V7 – i', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i'], pattern: 'basse-accord', bpm: 60 },
  'n1-nocturne8': { title: 'Nocturne en fa mineur, 8 mesures', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'VI', 'iv', 'V7', 'i', 'iv', 'V7', 'i'], pattern: 'basse-accord', bpm: 60 },
  'n1-qr': { title: 'Question–réponse (demi-cadence, puis cadence parfaite)', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'i', 'V', 'i', 'iv', 'V7', 'i'], pattern: 'arpege', bpm: 56 },
  'n1-arpege': { title: 'Arpèges élargis : i – VI – iv – V7', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'VI', 'iv', 'V7'], pattern: 'arpege', bpm: 54 },
  'n1-valse': { title: 'Valse en la mineur : i – iv – V7 – i', tonic: 9, mode: 'min', meter: 3, bars: ['i', 'iv', 'V7', 'i', 'VI', 'iv', 'V7', 'i'], pattern: 'valse', bpm: 120 },
  /* ---- Styles ---- */
  'romance-mi': { title: 'Romance en mi mineur (arpèges, à la Liszt)', style: 'romance', tonic: 4, mode: 'min', meter: 3, custom: [
    C('i', 4, 'm', 40, { name: 'mi mineur', section: 'question' }), C('iv', 9, 'm', 45, { name: 'la mineur' }), C('i', 4, 'm', 40, { name: 'mi mineur' }), C('V', 11, 'M', 35, { name: 'si majeur' }),
    C('VI', 0, 'M', 36, { name: 'do majeur', section: 'réponse' }), C('iv', 9, 'm', 33, { name: 'la mineur' }), C('V7', 11, '7', 35, { name: 'si 7' }), C('i', 4, 'm', 40, { name: 'mi mineur' })], pattern: 'romance', bpm: 63,
    targets: [71, 72, 67, 78, 79, 74, 71, 64], targetName: 'Squelette du modèle' },
  'romance-la': { title: 'Romance en la mineur : la descente de basse (lamento)', style: 'romance', tonic: 9, mode: 'min', meter: 3, custom: [
    C('i', 9, 'm', 45, { name: 'la mineur' }), C('v6', 4, 'm', 43, { name: 'mi mineur / sol' }), C('iv6', 2, 'm', 41, { name: 'ré mineur / fa' }), C('V', 4, 'M', 40, { name: 'mi majeur' }),
    C('VI', 5, 'M', 41, { name: 'fa majeur' }), C('iv', 2, 'm', 38, { name: 'ré mineur' }), C('V7', 4, '7', 40, { name: 'mi 7' }), C('i', 9, 'm', 45, { name: 'la mineur' })], pattern: 'romance', bpm: 63 },
  'elegie-re': { title: 'Élégie en ré mineur (arpèges larges, à la russe)', style: 'elegie', tonic: 2, mode: 'min', meter: 4, custom: [
    C('i', 2, 'm', 38, { name: 'ré mineur', section: 'A' }), C('i/♭7', 2, 'm', 36, { name: 'ré mineur / do' }), C('VI', 10, 'M', 34, { name: 'si♭ majeur' }), C('V', 9, 'M', 33, { name: 'la majeur' }),
    C('iv', 7, 'm', 43, { name: 'sol mineur' }), C('i6', 2, 'm', 41, { name: 'ré mineur / fa' }), C('iiø7', 4, 'hdim7', 40, { name: 'mi ø7' }), C('V7', 9, '7', 33, { name: 'la 7' })], pattern: 'elegie', bpm: 54,
    targets: [77, 74, 70, 69, 70, 81, 79, 76], targetName: 'Squelette du modèle' },
  'nocturne-op55': { title: 'Les harmonies de ton nocturne (op. 55 n° 1, m. 1 à 8)', style: 'nocturne', tonic: 5, mode: 'min', meter: 4, custom: OP55_GRID, pattern: 'basse-accord', bpm: 56,
    // les notes de Chopin aux temps 1 et 3 (m. 1 à 8 : do mi♭ | do do | do mi♭ | do do | do mi♭ | do si♭ | la♭ la♭ | fa)
    chordTargets: [72, 75, 72, 72, 72, 75, 72, 72, 72, 75, 72, 70, 68, 68, 65], ...CHOPIN,
    targetHelp: 'Les notes en or sont celles de Chopin aux temps 1 et 3 : pose-les, puis invente ce qui se passe entre elles.' },
  /* ---- Niveau 2 : le langage classique ---- */
  'n2-cadence': { title: 'Cadence en do majeur : I6 – IV – V7 – I (basse seule)', tonic: 0, mode: 'maj', meter: 4,
    custom: [C('I6', 0, 'M', 52, { name: 'do majeur / mi' }), C('IV', 5, 'M', 53, { name: 'fa majeur' }), C('V7', 7, '7', 55, { name: 'sol 7' }), C('I', 0, 'M', 48, { name: 'do majeur' })], pattern: 'basse', bpm: 56,
    targets: [72, 72, 71, 72], ...SOPRANO },
  'n2-cadence-min': { title: 'Cadence en la mineur : i6 – iv – V7 – i (basse seule)', tonic: 9, mode: 'min', meter: 4,
    custom: [C('i6', 9, 'm', 48, { name: 'la mineur / do' }), C('iv', 2, 'm', 50, { name: 'ré mineur' }), C('V7', 4, '7', 52, { name: 'mi 7' }), C('i', 9, 'm', 45, { name: 'la mineur' })], pattern: 'basse', bpm: 56,
    targets: [69, 69, 68, 69], ...SOPRANO },
  'n2-cadence-sol': { title: 'Cadence en sol majeur (basse seule)', tonic: 0, mode: 'maj', meter: 4, custom: null, from: 'n2-cadence', tr: -5, pattern: 'basse', bpm: 56 },
  'n2-cadence-fa': { title: 'Cadence en fa majeur (basse seule)', tonic: 0, mode: 'maj', meter: 4, custom: null, from: 'n2-cadence', tr: -7, pattern: 'basse', bpm: 56 },
  'n2-cadence-re': { title: 'Cadence en ré mineur (basse seule)', tonic: 9, mode: 'min', meter: 4, custom: null, from: 'n2-cadence-min', tr: -7, pattern: 'basse', bpm: 56 },
  'n2-octave': { title: 'Règle de l’octave en do majeur (montée et descente)', tonic: 0, mode: 'maj', meter: 2, custom: OCTAVE_MAJ, pattern: 'basse', bpm: 60, targets: OCTAVE_TG, ...SOPRANO },
  'n2-octave-sol': { title: 'Règle de l’octave en sol majeur', tonic: 0, mode: 'maj', meter: 2, custom: OCTAVE_MAJ, tr: -5, pattern: 'basse', bpm: 60, targets: OCTAVE_TG, ...SOPRANO },
  'n2-octave-fa': { title: 'Règle de l’octave en fa majeur', tonic: 0, mode: 'maj', meter: 2, custom: OCTAVE_MAJ, tr: -7, pattern: 'basse', bpm: 60, targets: OCTAVE_TG, ...SOPRANO },
  'n2-romanesca': { title: 'Romanesca, Prinner et cadence (do majeur)', tonic: 0, mode: 'maj', meter: 4, custom: [
    C('I', 0, 'M', 48, { name: 'do majeur', section: 'Romanesca' }), C('V6', 7, 'M', 47, { name: 'sol majeur / si' }), C('vi', 9, 'm', 45, { name: 'la mineur' }), C('iii6', 4, 'm', 43, { name: 'mi mineur / sol' }),
    C('IV', 5, 'M', 41, { name: 'fa majeur', section: 'Prinner' }), C('I6', 0, 'M', 40, { name: 'do majeur / mi' }), C('V4/3', 7, '7', 38, { name: 'sol 7 / ré' }), C('I', 0, 'M', 36, { name: 'do majeur' }),
    C('I6', 0, 'M', 40, { name: 'do majeur / mi', section: 'Cadence' }), C('ii6', 2, 'm', 41, { name: 'ré mineur / fa' }), C('V7', 7, '7', 43, { name: 'sol 7' }), C('I', 0, 'M', 36, { name: 'do majeur' })], pattern: 'accords', bpm: 60,
    targets: [76, 74, 72, 71, 69, 67, 65, 64, 67, 65, 65, 64], ...SOPRANO },
  'n2-meyer': { title: 'Meyer, Prinner et cadence (do majeur)', tonic: 0, mode: 'maj', meter: 4, custom: [
    C('I', 0, 'M', 48, { name: 'do majeur', section: 'Meyer' }), C('V4/3', 7, '7', 50, { name: 'sol 7 / ré' }), C('V6/5', 7, '7', 47, { name: 'sol 7 / si' }), C('I', 0, 'M', 48, { name: 'do majeur' }),
    C('IV', 5, 'M', 41, { name: 'fa majeur', section: 'Prinner' }), C('I6', 0, 'M', 40, { name: 'do majeur / mi' }), C('V4/3', 7, '7', 38, { name: 'sol 7 / ré' }), C('I', 0, 'M', 36, { name: 'do majeur' }),
    C('I6', 0, 'M', 40, { name: 'do majeur / mi', section: 'Cadence' }), C('ii6', 2, 'm', 41, { name: 'ré mineur / fa' }), C('V7', 7, '7', 43, { name: 'sol 7' }), C('I', 0, 'M', 36, { name: 'do majeur' })], pattern: 'accords', bpm: 60,
    targets: [72, 71, 77, 76, 81, 79, 77, 76, 76, 74, 74, 72], ...SOPRANO },
  'n2-monte-fonte': { title: 'Monte puis Fonte (do majeur)', tonic: 0, mode: 'maj', meter: 4, custom: [
    C('V6/5 de IV', 0, '7', 52, { name: 'do 7 / mi', section: 'Monte' }), C('IV', 5, 'M', 53, { name: 'fa majeur' }), C('V6/5 de V', 2, '7', 54, { name: 'ré 7 / fa♯' }), C('V', 7, 'M', 55, { name: 'sol majeur' }),
    C('V6/5 de ii', 9, '7', 49, { name: 'la 7 / do♯', section: 'Fonte' }), C('ii', 2, 'm', 50, { name: 'ré mineur' }), C('V6/5', 7, '7', 47, { name: 'sol 7 / si' }), C('I', 0, 'M', 48, { name: 'do majeur' })], pattern: 'accords', bpm: 60,
    targets: [70, 69, 72, 71, 67, 65, 65, 64], ...SOPRANO },
  'n2-marche': { title: 'Marche par quintes en la mineur', tonic: 9, mode: 'min', meter: 4, bars: ['i', 'iv', 'VII', 'III', 'VI', 'ii°', 'V7', 'i'], pattern: 'arpege', bpm: 60,
    targets: [76, 77, 74, 76, 72, 74, 71, 69], targetName: 'Squelette du modèle' },
  'n2-marche-elegie': { title: 'Élégie : la marche par quintes en ré mineur (arpèges larges)', style: 'elegie', tonic: 2, mode: 'min', meter: 4, custom: [
    C('i', 2, 'm', 38, { name: 'ré mineur', section: 'modèle' }), C('iv', 7, 'm', 43, { name: 'sol mineur' }),
    C('VII', 0, 'M', 36, { name: 'do majeur', section: 'un degré plus bas' }), C('III', 5, 'M', 41, { name: 'fa majeur' }),
    C('VI', 10, 'M', 34, { name: 'si♭ majeur', section: 'encore plus bas' }), C('ii°', 4, 'dim', 40, { name: 'mi diminué' }),
    C('V7', 9, '7', 33, { name: 'la 7', section: 'cadence' }), C('i', 2, 'm', 38, { name: 'ré mineur' })], pattern: 'elegie', bpm: 54,
    targets: [74, 79, 72, 77, 70, 76, 69, 77], targetName: 'Squelette du modèle',
    targetHelp: 'Les notes en or : le modèle (ré – sol), puis ses reprises un degré plus bas (do – fa, si♭ – mi), puis la cadence. Garde le même rythme à chaque reprise.' },
  'n2-aba': { title: 'Forme ABA : fa mineur / la♭ majeur / fa mineur', tonic: 5, mode: 'min', meter: 4, sections: [
    { label: 'A (fa mineur)', bars: ['i', 'iv', 'V7', 'i', 'i', 'iv', 'V7', 'i'] },
    { label: 'B (la♭ majeur)', tonic: 8, mode: 'maj', bars: ['I', 'IV', 'V7', 'I', 'vi', 'ii', 'V7', 'I'] },
    { label: 'retour : V7 de fa', bars: ['V7'], tonic: 5, mode: 'min' },
    { label: 'A', tonic: 5, mode: 'min', bars: ['i', 'iv', 'V7', 'i'] }], pattern: 'basse-accord', bpm: 60 },
  'n2-aba-op15': { title: 'Forme ABA comme l’op. 15 : fa majeur (cantabile) / fa mineur (con fuoco) / fa majeur', tonic: 5, mode: 'maj', meter: 3, sections: [
    { label: 'A : cantabile (fa majeur)', bars: ['I', 'IV', 'V7', 'I', 'vi', 'ii', 'V7', 'I'], pattern: 'arpege' },
    { label: 'B : con fuoco (fa mineur)', tonic: 5, mode: 'min', bars: ['i', 'iv', 'V7', 'i', 'VI', 'iv', 'V7', 'i'], pattern: 'agite' },
    { label: 'retour : do 7', tonic: 5, mode: 'maj', bars: ['V7'], pattern: 'accords' },
    { label: 'A′ (orné)', tonic: 5, mode: 'maj', bars: ['I', 'IV', 'V7', 'I'], pattern: 'arpege' }], pattern: 'arpege', bpm: 66 },
  'n2-orner': { title: 'Fa mineur : la mélodie simple à orner (i – iv – V7 – i)', style: 'nocturne', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i'], pattern: 'basse-accord', bpm: 60,
    targets: [72, 77, 72, 68], targetName: 'Squelette', targetHelp: 'Les notes en or sont celles de la mélodie simple (do, fa, do, la♭) : garde-les au premier temps et orne entre elles.' },
  'n2-lamento': { title: 'Prélude sur basse chromatique descendante (fa majeur)', style: 'prelude', tonic: 5, mode: 'maj', meter: 4, custom: [
    { label: 'F', name: 'fa majeur', root: 5, q: 'M' },
    { label: 'C/E', name: 'do majeur / mi', root: 0, q: 'M', bass: 4 },
    { label: 'F7/E♭', name: 'fa 7 / mi♭', root: 5, q: '7', bass: 3 },
    { label: 'B♭/D', name: 'si♭ majeur / ré', root: 10, q: 'M', bass: 2 },
    { label: 'B♭m/D♭', name: 'si♭ mineur / ré♭', root: 10, q: 'm', bass: 1 },
    { label: 'F/C', name: 'fa majeur / do', root: 5, q: 'M', bass: 0 },
    { label: 'C7', name: 'do 7', root: 0, q: '7' },
    { label: 'F', name: 'fa majeur', root: 5, q: 'M' }], pattern: 'arpege', bpm: 56 },
  // Les accords de la main gauche du Prélude op. 28 n° 4, mesures 1 à 12, exactement (Chopin, d'après l'édition
  // LilyPond de K. Snortum) : à chaque changement, une seule voix descend d'un demi-ton.
  'prelude-mi': { title: 'Les accords du Prélude op. 28 n° 4 (m. 1 à 12) : improviser au-dessus', style: 'prelude', tonic: 4, mode: 'min', meter: 4, custom: [
    C('i6', 4, 'm', 55, { name: 'mi mineur / sol', notes: [55, 59, 64], section: 'm. 1' }),
    C('iiø7', 6, 'hdim7', 54, { name: 'fa♯ ø7 (sans do)', notes: [54, 57, 64], beats: 2 }), C('V7', 11, '7', 54, { name: 'si 7 (sans si)', notes: [54, 57, 63], beats: 2 }),
    C('6te aug.', 5, '7', 53, { name: 'fa – la – mi♭ (sixte augmentée)', notes: [53, 57, 63], beats: 2 }), C('', 2, 'm', 53, { name: 'ré mineur / fa', notes: [53, 57, 62], beats: 1 }), C('', 8, 'dim7', 53, { name: 'sol♯ °7 (sans si)', notes: [53, 56, 62], beats: 1 }),
    C('V7/iv', 4, '7', 52, { name: 'mi 7 (sans si)', notes: [52, 56, 62], beats: 2, section: 'm. 4' }), C('', 4, 'm7', 52, { name: 'mi m7 (sans si)', notes: [52, 55, 62], beats: 1 }), C('', 1, 'hdim7', 52, { name: 'do♯ ø7 (sans si)', notes: [52, 55, 61], beats: 1 }),
    C('VI6', 0, 'M', 52, { name: 'do majeur / mi', notes: [52, 55, 60], beats: 2 }), C('', 6, 'hdim7', 52, { name: 'fa♯ ø7 / mi (sans la)', notes: [52, 54, 60], beats: 2 }),
    C('', 6, 'hdim7', 52, { name: 'fa♯ ø7 / mi (sans la)', notes: [52, 54, 60], beats: 2 }), C('vii°7', 3, 'dim7', 51, { name: 'ré♯ °7 (sans la)', notes: [51, 54, 60], beats: 2 }),
    C('V7/III', 2, '7', 50, { name: 'ré 7 (sans la)', notes: [50, 54, 60], section: 'm. 7' }),
    C('', 2, 'm7', 50, { name: 'ré m7 (sans la)', notes: [50, 53, 60], beats: 2 }), C('', 11, 'dim', 50, { name: 'si ° / ré', notes: [50, 53, 59], beats: 2 }),
    C('', 0, 'maj7', 48, { name: 'do maj7 (sans sol)', notes: [48, 52, 59], beats: 1 }), C('iv6', 9, 'm', 48, { name: 'la mineur / do', notes: [48, 52, 57], beats: 3 }),
    C('V7', 11, '7', 47, { name: 'si (quarte, puis septième)', notes: [47, 52, 57], beats: 1, section: 'm. 10' }), C('V7', 11, '7', 47, { name: 'si 7 (sans fa♯)', notes: [47, 51, 57], beats: 1 }), C('iv6', 9, 'm', 48, { name: 'la mineur / do', notes: [48, 52, 57], beats: 2 }),
    C('V7', 11, '7', 47, { name: 'si 7 (sans fa♯)', notes: [47, 51, 57], beats: 2 }), C('iv6', 9, 'm', 48, { name: 'la mineur / do', notes: [48, 52, 57], beats: 2 }),
    C('V7', 11, '7', 47, { name: 'si 7 : demi-cadence', notes: [47, 51, 57], beats: 2, hold: true }), C('—', 11, '7', 47, { name: 'silence', notes: [], beats: 2, silent: true })], pattern: 'repeated', bpm: 50,
    // la mélodie de Chopin au premier temps de chaque mesure (si ×4, la ×4, sol♯, fa♯, fa♯, sol)
    targets: [71, 71, 71, 71, 69, 69, 69, 69, 68, 66, 66, 67], ...CHOPIN,
    targetHelp: 'La note en or est celle de Chopin au premier temps : tiens-la tant qu’elle sonne ; ajoute au plus une broderie.' },
  'n2-napolitaine': { title: 'Cadence avec sixte napolitaine (fa mineur)', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'N6', 'V7', 'i', 'VI', 'N6', 'V7'], pattern: 'accords', bpm: 60 },
  'choral-ut': { title: 'Choral en do mineur (à la manière du Prélude op. 28 n° 20)', style: 'choral', tonic: 0, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i', 'VI', 'iv', 'V7', 'i'], pattern: 'choral', bpm: 50 },
};

// Grilles dérivées (transpositions) : la grille et le soprano viennent de la grille d'origine.
for (const P of Object.values(IMPROV_PRESETS)) {
  if (!P.from) continue;
  const S = IMPROV_PRESETS[P.from];
  Object.assign(P, { custom: S.custom, targets: S.targets, targetName: S.targetName, targetHelp: S.targetHelp });
}

/** Les styles : texture de la main gauche et caractère, pour l'aide affichée. */
export const STYLE_NOTES = {
  romance: 'Romance : la main gauche déroule l’accord en croches, de la basse jusqu’à la dixième, et redescend (une seule pédale par accord). La main droite chante en valeurs longues, avec des soupirs (appoggiatures qui retombent).',
  elegie: 'Élégie : de grandes vagues d’arpèges sur deux octaves, une basse qui descend pas à pas. La mélodie, au-dessus, avance lentement : longues notes, sommet préparé, retombée.',
  nocturne: 'Nocturne : basse au 1er et au 3e temps, accord léger au 2e et au 4e (l’accompagnement de ton op. 55). La mélodie est ornée : broderies, notes chromatiques, petites fioritures.',
  prelude: 'Prélude : les accords de la main gauche glissent par demi-tons pendant que la mélodie reste presque immobile. C’est l’harmonie qui raconte : une ou deux notes par mesure suffisent.',
  choral: 'Choral : des accords pleins, un par temps, comme un chœur. La mélodie est la voix du dessus : peu de notes, bien liées.',
};

function chordFromRoman(sym, tonic, mode) {
  const [off, q] = ROMAN[mode][sym];
  const root = (tonic + off) % 12;
  const bass = sym === 'N6' ? (root + 4) % 12 : undefined; // sixte napolitaine : tierce à la basse
  return { label: sym, name: `${pcName(root, { tonic, mode })} ${CHORDS[q].fr}`, root, q, bass, tonic, mode };
}

export function buildTimeline(P) {
  const list = [];
  const tr = P.tr || 0;
  if (P.custom) P.custom.forEach(c => {
    if (!tr) { list.push({ ...c, tonic: P.tonic, mode: P.mode }); return; }
    const root = (c.root + tr + 120) % 12;
    list.push({ ...c, root, bass: c.bass != null ? (c.bass + tr + 120) % 12 : undefined, bassM: c.bassM != null ? c.bassM + tr : undefined,
      notes: c.notes ? c.notes.map(n => n + tr) : undefined,
      name: `${PC_NAMES_FLAT[root]} ${CHORDS[c.q].fr}${c.bassM != null && pc(c.bassM) !== pc(c.root) ? ' / ' + PC_NAMES_FLAT[pc(c.bassM + tr)] : ''}`,
      tonic: (P.tonic + tr + 120) % 12, mode: P.mode });
  });
  else if (P.sections) P.sections.forEach(s => s.bars.forEach((b, i) => list.push({ ...chordFromRoman(b, s.tonic ?? P.tonic, s.mode ?? P.mode), section: i === 0 ? s.label : null, pattern: s.pattern || null })));
  else P.bars.forEach(b => list.push(chordFromRoman(b, P.tonic, P.mode)));
  // durée de chaque accord (en temps) et numéro de mesure
  let beat = 0;
  for (const c of list) { c.beats = c.beats || P.meter; c.at = beat; c.bar = Math.floor(beat / P.meter); beat += c.beats; }
  list.totalBeats = beat;
  return list;
}

/** Voicing : basse, accord au-dessus (ou les notes exactes de la grille), échelle d'arpège. */
export function voicing(ch) {
  const pcs = CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
  const bassPc = ch.bass ?? ch.root;
  let bass = ch.bassM;
  if (bass == null) { bass = 40; while (pc(bass) !== bassPc) bass++; }   // mi1–ré♯2 (français) : E2–D#3
  let upper = [];
  if (ch.notes) upper = ch.notes.slice();
  else {
    let m = Math.max(53, bass + 3); // à partir de fa2 (F3), au-dessus de la basse
    while (upper.length < pcs.length && m < 76) { if (pcs.includes(pc(m)) && !upper.some(u => pc(u) === pc(m))) upper.push(m); m++; }
  }
  // échelle d'arpège : basse, puis les notes de l'accord au-dessus, en s'élargissant (quinte, octave, dixième…)
  const ladder = [bass];
  let x = bass + 6;
  while (ladder.length < 7 && x < bass + 32) { if (pcs.includes(pc(x)) && x - ladder[ladder.length - 1] >= 3) ladder.push(x); x++; }
  return { pcs, bass, upper, arp: ladder.slice(0, 4), ladder };
}

/* Motifs de main gauche : chaque motif programme les notes d'un accord (durée `dur` secondes, `beats` temps). */
export const PATTERNS = {
  'basse-accord': ({ v, t, beats, spb, note }) => {
    for (let b = 0; b < beats; b++) {
      const at = t + b * spb;
      if (b % 2 === 0) note(b === 0 ? v.bass : (v.arp[1] - 12 >= 36 ? v.arp[1] - 12 : v.bass), at, spb * 1.9, b === 0 ? 60 : 50);
      else v.upper.forEach(m => note(m, at, spb * 0.9, 40));
    }
  },
  arpege: ({ v, t, dur, beats, note }) => {
    const per = beats * 3; // croches de triolet
    const seq = [v.arp[0], v.arp[1], v.arp[2], v.arp[3] ?? v.arp[2] + 4, v.arp[2], v.arp[1]];
    for (let k = 0; k < per; k++) note(seq[k % 6], t + k * dur / per, dur * 0.6, k === 0 ? 58 : 42);
  },
  // Romance : croches de la basse à la dixième (ou plus haut) et retour, une vague par mesure
  romance: ({ v, t, beats, spb, note }) => {
    const L = v.ladder;
    const up = [0, 1, 2, 3, 4].filter(i => L[i] != null);
    const wave = up.concat(up.slice(1, -1).reverse());
    const per = beats * 2;
    for (let k = 0; k < per; k++) {
      const m = L[wave[k % wave.length]];
      note(m, t + k * spb / 2, k === 0 ? spb * beats : spb * 1.2, k === 0 ? 58 : 40 + (k === Math.floor(per / 2) ? 4 : 0));
    }
  },
  // Élégie : triolets de croches sur deux octaves, deux vagues par mesure de quatre temps
  elegie: ({ v, t, beats, spb, note }) => {
    const L = v.ladder;
    const top = Math.min(L.length - 1, 5);
    const wave = [0, 1, 2, 3, top, 3, 2, 1, 2, 3, 2, 1].map(i => Math.min(i, L.length - 1));
    const per = beats * 3;
    for (let k = 0; k < per; k++) note(L[wave[k % wave.length]], t + k * spb / 3, k === 0 ? spb * beats : spb * 0.9, k === 0 ? 60 : k % 3 === 0 ? 44 : 38);
  },
  // Prélude (op. 28 n° 4) : l'accord répété en croches, sans basse séparée
  repeated: ({ v, t, beats, spb, note }) => {
    for (let k = 0; k < beats * 2; k++) v.upper.forEach(m => note(m, t + k * spb / 2, spb * 0.45, k % 2 === 0 ? 40 : 34));
  },
  // Choral : un accord plein par temps, la basse comprise
  choral: ({ v, t, beats, spb, note }) => {
    for (let b = 0; b < beats; b++) { note(v.bass, t + b * spb, spb * 0.95, 52); v.upper.forEach(m => note(m, t + b * spb, spb * 0.95, 42)); }
  },
  accords: ({ v, t, dur, note }) => { note(v.bass, t, dur, 56); v.upper.forEach(m => note(m, t, dur * 0.98, 42)); },
  valse: ({ v, t, beats, spb, note }) => {
    note(v.bass, t, spb * 0.95, 60);
    for (let b = 1; b < beats; b++) v.upper.forEach(m => note(m, t + b * spb, spb * 0.7, 40));
  },
  alberti: ({ v, t, beats, spb, note }) => {
    const u = v.upper.length >= 3 ? v.upper : [v.bass + 12, v.bass + 19, v.bass + 24];
    const lo = Math.max(u[0] - 12 >= 43 ? u[0] - 12 : u[0], 43);
    const cyc = [lo, u[2] - (u[2] - lo > 12 ? 12 : 0), u[1] - (u[1] - lo > 12 ? 12 : 0), u[2] - (u[2] - lo > 12 ? 12 : 0)];
    for (let k = 0; k < beats * 2; k++) note(cyc[k % 4], t + k * spb / 2, spb * 0.45, k % 4 === 0 ? 50 : 38);
  },
  ostinato: ({ v, t, beats, spb, note }) => {
    const cyc = [v.bass, v.bass + 7, v.bass + 12, v.bass + 7];
    for (let b = 0; b < beats; b++) note(cyc[b % 4], t + b * spb, spb * 0.95, b === 0 ? 58 : 46);
  },
  // Con fuoco : basse en octave tenue, accords battus en triolets de croches (agitation)
  agite: ({ v, t, beats, spb, note }) => {
    note(v.bass, t, spb * beats * 0.95, 64);
    if (v.bass - 12 >= 28) note(v.bass - 12, t, spb * beats * 0.95, 56);
    for (let k = 1; k < beats * 3; k++) v.upper.forEach(m => note(m, t + k * spb / 3, spb / 3 * 0.55, k % 3 === 0 ? 50 : 41));
  },
  bourdon: ({ v, t, dur, note }) => { note(v.bass, t, dur * 0.98, 54); note(v.bass + 7, t, dur * 0.98, 44); },
  basse: ({ v, t, dur, note }) => note(v.bass, t, dur * 0.98, 58),
};
const PATTERN_LABELS = [['basse-accord', 'basse + accord (nocturne)'], ['arpege', 'arpège élargi'], ['romance', 'romance (croches, jusqu’à la dixième)'], ['elegie', 'élégie (vagues de triolets)'],
  ['repeated', 'accords répétés (prélude)'], ['choral', 'choral'], ['accords', 'accords tenus'], ['valse', 'valse (3 temps)'], ['alberti', 'basse d’Alberti'], ['ostinato', 'ostinato (quinte bercée)'], ['bourdon', 'bourdon (quinte tenue)'], ['agite', 'agité (accords battus)'], ['basse', 'basse seule']];

/* ------------------------------------------------------------------ */
/* Questions et réponses : mélodies générées sur la grille              */
/* ------------------------------------------------------------------ */
// rythmes de motifs (en temps), par chiffrage
const RHY = {
  4: [[1, 1, 2], [1.5, 0.5, 2], [1, 0.5, 0.5, 2], [2, 1, 1], [1.5, 0.5, 1, 1], [0.5, 0.5, 1, 2]],
  3: [[2, 1], [1.5, 0.5, 1], [1, 1, 1], [1, 2], [2.5, 0.5]],
  2: [[1, 1], [1.5, 0.5], [0.5, 0.5, 1]],
};
/** Hauteurs disponibles (gamme) pour l'accord, dans le registre de la main droite. */
function scaleNotes(P, ch, lo = 62, hi = 84) {
  const sc = (P.scale || (ch.mode === 'maj' ? SCALES.maj : SCALES.harmMin)).map(x => (ch.tonic + x) % 12);
  const out = [];
  for (let m = lo; m <= hi; m++) if (sc.includes(pc(m))) out.push(m);
  return out;
}
const chordTones = ch => CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
/**
 * Mélodie sur une suite d'accords (un par mesure ou plus) : notes de l'accord sur les temps, notes de passage
 * entre elles, fin « ouverte » (question : une note de l'accord autre que la tonique) ou « fermée » (tonique).
 */
function genMelody(P, chords, { meter, rhythm = null, end = 'open', start = 72 }) {
  const notes = [];
  let prev = start, t = 0;
  const rh = rhythm || pick(RHY[meter] || RHY[4]);
  chords.forEach((ch, bi) => {
    const sc = scaleNotes(P, ch);
    const ct = chordTones(ch);
    const lastBar = bi === chords.length - 1;
    const r = lastBar ? (meter === 3 ? [1, 2] : meter === 2 ? [1, 1] : [1, 1, 2]) : rh;
    let beat = 0;
    r.forEach((d, k) => {
      const onBeat = Math.abs(beat - Math.round(beat)) < 1e-6;
      const isLast = lastBar && k === r.length - 1;
      let cand;
      if (isLast) {
        const want = end === 'close' ? [ch.tonic % 12] : ct.filter(x => x !== ch.tonic % 12);
        cand = sc.filter(m => want.includes(pc(m)));
      } else if (onBeat) cand = sc.filter(m => ct.includes(pc(m)));
      else cand = sc.filter(m => Math.abs(m - prev) <= 2 && m !== prev);
      if (!cand.length) cand = sc.filter(m => ct.includes(pc(m)));
      // le plus proche de la note précédente, avec parfois un petit saut pour la variété
      cand.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev));
      const choice = onBeat && !isLast && cand.length > 1 && Math.random() < 0.3 ? cand[1] : cand[0];
      notes.push({ m: choice, t: t + beat, d });
      prev = choice;
      beat += d;
    });
    t += ch.beats || meter;
  });
  return { notes, rhythm: rh };
}

/** Jugement d'une réponse : notes de l'accord sur les temps forts, fin stable, rythme repris de la question. */
function judgeAnswer(played, seg, question, isEnd) {
  const lines = [];
  if (played.length < 2) return { score: 0, lines: ['Je n’ai presque rien reçu : réponds avec au moins trois ou quatre notes, à la main droite.'] };
  const strong = played.filter(p => p.strong);
  const okStrong = strong.filter(p => p.kind === 'chord').length;
  const pctStrong = strong.length ? okStrong / strong.length : 0;
  lines.push(pctStrong >= 0.7 ? `✓ Temps forts sur une note de l’accord (${okStrong}/${strong.length}).` : `→ Temps forts : ${okStrong}/${strong.length} sur une note de l’accord. Vise une note de l’accord à chaque temps fort.`);
  const last = played[played.length - 1];
  const lastCh = seg.chords[seg.chords.length - 1];
  const tonicPc = lastCh.tonic % 12;
  const stable = isEnd ? pc(last.note) === tonicPc : chordTones(lastCh).includes(pc(last.note));
  lines.push(stable ? (isEnd ? '✓ Fin sur la tonique : la phrase est close.' : '✓ Fin sur une note de l’accord : la réponse se pose.') : (isEnd ? `→ Finis sur la tonique (${pcName(tonicPc, lastCh)}).` : '→ Finis sur une note de l’accord, en valeur longue.'));
  // rythme : attaques de la première mesure (en croches) comparées à la question
  const q8 = new Set(question.notes.filter(n => n.t < (seg.meter || 4)).map(n => Math.round(n.t * 2)));
  const a8 = new Set(played.filter(p => p.beat < (seg.meter || 4)).map(p => Math.round(p.beat * 2)));
  const inter = [...q8].filter(x => a8.has(x)).length;
  const sim = q8.size ? inter / Math.max(q8.size, a8.size) : 0;
  lines.push(sim >= 0.5 ? '✓ Tu reprends le rythme de la question : on entend que c’est une réponse.' : '→ Reprends le rythme de la question au début de ta réponse (même rythme, autres notes).');
  const score = (pctStrong >= 0.7 ? 1 : pctStrong) * 0.4 + (stable ? 0.35 : 0) + Math.min(1, sim / 0.5) * 0.25;
  return { score, lines, pctStrong, stable, sim };
}

/* ------------------------------------------------------------------ */
/* Widget                                                              */
/* ------------------------------------------------------------------ */
export function mountImprov(el, cfg = {}) {
  let presetId = cfg.preset || 'n1-nocturne';
  const presetIds = (cfg.presets || Object.keys(IMPROV_PRESETS)).filter(p => IMPROV_PRESETS[p]);
  const frame = h('div', { class: 'w-frame improv' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Accompagnateur d’improvisation'));
  const sel = h('select', { class: 'improv-sel' }, ...presetIds.map(p => h('option', { value: p, selected: p === presetId }, IMPROV_PRESETS[p].title)));
  if (presetIds.length > 1) head.append(sel);
  const body = h('div', { class: 'w-body' });
  const styleNote = h('p', { class: 'small improv-style', hidden: true });
  const gridBox = h('div', { class: 'improv-grid', role: 'list', 'aria-label': 'La grille' });
  const chordBox = h('div', { class: 'improv-now' });
  const kbHost = h('div');
  const legend = h('div', { class: 'form-legend' },
    h('span', {}, h('i', { class: 'lg-dot', style: { background: COLORS.ok } }), 'note de l’accord'),
    h('span', {}, h('i', { class: 'lg-dot', style: { background: '#3b6bb5' } }), 'note de la gamme (passage, broderie)'),
    h('span', {}, h('i', { class: 'lg-dot', style: { background: COLORS.warn } }), 'note chromatique (à résoudre)'),
    h('span', { class: 'lg-target' }, h('i', { class: 'lg-dot', style: { background: '#c99a2e' } }), 'note d’appui à poser (squelette)'));
  const qrBox = h('div', { class: 'qr-box', hidden: true });
  const foot = h('div', { class: 'w-foot' });
  const status = h('div', { class: 'score-status' });
  frame.append(head, body, foot);
  body.append(styleNote, gridBox, chordBox, kbHost, legend, qrBox);
  el.append(frame);

  let P, timeline, kb, playing = false, timer = null, nextTime, idx, chordLog = [], played = [], offNote = null, offOff = null, bpm;
  let mode = 'libre', lhMode = 'app', clickOn = false, rec = [], recStart = null, lastRec = null, replaying = false;
  let qr = null; // état du jeu question – réponse
  let patOverride = false; // le motif choisi à la main remplace celui des sections
  let tgState = new Map(), lastTarget = null; // squelette : une entrée par mesure (ou par accord) jouée
  let replayTimer = null;
  const playBtn = h('button', { class: 'btn primary play-btn', type: 'button' }, 'Lancer l’accompagnement');
  const out = h('output');
  const rng = h('input', { type: 'range', min: 30, max: 180, 'aria-label': 'Tempo' });
  const loops = h('select', { 'aria-label': 'Répétition' }, h('option', { value: 0 }, 'en boucle'), h('option', { value: 1 }, '1 fois'), h('option', { value: 2 }, '2 fois'), h('option', { value: 4 }, '4 fois'));
  const patSel = h('select', { 'aria-label': 'Main gauche' }, ...PATTERN_LABELS.map(([v, l]) => h('option', { value: v }, l)));
  const modeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Mode' });
  const lhSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Main gauche jouée par' });
  const clickBtn = h('button', { class: 'btn sm', type: 'button', title: 'Clic sur chaque temps' }, 'Clic');
  const replayBtn = h('button', { class: 'btn sm ghost', type: 'button', disabled: true, title: 'Réécouter ta dernière improvisation avec l’accompagnement' }, 'Réécouter');
  const modelBtn = h('button', { class: 'btn sm ghost', type: 'button', hidden: true }, 'Écouter une réponse possible');
  foot.append(
    h('div', { class: 'score-ctrl' }, playBtn, h('label', { class: 'range' }, 'Tempo', rng, out), h('label', { class: 'field inline' }, 'Main gauche', patSel), h('label', { class: 'field inline' }, 'Répétition', loops)),
    h('div', { class: 'score-ctrl score-ctrl-2' }, h('span', { class: 'small' }, 'Mode'), modeSeg, h('span', { class: 'small' }, 'Main gauche jouée par'), lhSeg, clickBtn, replayBtn, modelBtn),
    h('div', { style: { width: '100%' } }, status));
  rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = `♩ = ${bpm}`; });
  clickBtn.addEventListener('click', () => { clickOn = !clickOn; clickBtn.classList.toggle('on', clickOn); });

  const segBtn = (seg, value, label, cur, on) => { const b = h('button', { type: 'button', class: value === cur ? 'on' : '' }, label); b.addEventListener('click', () => { seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); on(value); }); seg.append(b); return b; };
  const renderModes = () => {
    modeSeg.innerHTML = '';
    segBtn(modeSeg, 'libre', 'Libre', mode, v => { stop(); mode = v; updateModeUI(); });
    segBtn(modeSeg, 'qr', 'Question – réponse', mode, v => { stop(); mode = v; updateModeUI(); });
    if (hasTargets()) segBtn(modeSeg, 'squelette', P.targetName || (P.targetLabel === 'appoggiature' ? 'Appoggiatures' : 'Squelette'), mode, v => { stop(); mode = v; updateModeUI(); });
  };
  segBtn(lhSeg, 'app', 'l’appli', lhMode, v => { lhMode = v; showChord(idx || 0, playing); });
  segBtn(lhSeg, 'moi', 'moi', lhMode, v => { lhMode = v; if (!clickOn) clickBtn.click(); showChord(idx || 0, playing); });
  const updateModeUI = () => {
    qrBox.hidden = mode !== 'qr';
    modelBtn.hidden = mode !== 'qr';
    legend.querySelector('.lg-target').hidden = !(mode === 'squelette' && hasTargets());
    qrBox.innerHTML = mode === 'qr' ? '<p class="small mb-0">L’appli joue une question (deux mesures), puis c’est à toi : réponds en reprenant son rythme et finis sur une note stable — la tonique à la fin de la grille. Chaque réponse est commentée ici.</p>' : '';
    status.textContent = statusIdle();
    showChord(0, false);
  };
  const statusIdle = () => !timeline ? '' : mode === 'qr' ? `${timeline.length} accords · question – réponse : écoute, puis réponds à la main droite (au-dessus du do3).`
    : mode === 'squelette' ? (P.targetHelp || (P.targetLabel === 'appoggiature' ? 'Pose la note en or (l’appoggiature) au premier temps de chaque mesure, appuie-la, puis descends d’un degré sur une note de l’accord.'
      : P.chordTargets ? 'Pose la note en or au début de chaque accord, puis relie-la à la suivante.' : 'Pose la note en or au premier temps de chaque mesure, puis relie-la à la suivante.'))
      : `${Math.round(timeline.totalBeats / P.meter)} mesures · ${P.meter} temps par mesure. Improvise à la main droite (au-dessus du do3).`;

  const load = () => {
    stop();
    P = IMPROV_PRESETS[presetId];
    timeline = buildTimeline(P);
    bpm = P.bpm; rng.value = bpm; out.textContent = `♩ = ${bpm}`;
    patSel.value = P.pattern;
    kbHost.innerHTML = '';
    kb = keyboard({ from: 36, to: 89, names: 'c', height: 100 });
    kbHost.append(kb);
    styleNote.hidden = !P.style;
    styleNote.textContent = P.style ? STYLE_NOTES[P.style] : '';
    if (mode === 'squelette' && !hasTargets()) mode = 'libre';
    patOverride = false;
    renderModes();
    renderGrid();
    updateModeUI();
  };

  const scalePcs = ch => (P.scale || (ch.mode === 'maj' ? SCALES.maj : SCALES.harmMin)).map(x => (ch.tonic + x) % 12);
  const hasTargets = () => !!(P && (P.targets || P.chordTargets));
  /** Note d'appui (squelette) de l'accord n° i de la grille : une par accord, ou une par mesure. */
  const targetAt = i => {
    const k = ((i % timeline.length) + timeline.length) % timeline.length;
    const tr = P.tr || 0;
    if (P.chordTargets) return P.chordTargets[k] != null ? P.chordTargets[k] + tr : null;
    if (P.targets) return P.targets[timeline[k].bar % P.targets.length] + tr;
    return null;
  };

  /** La grille entière : chaque accord, ses notes ; l'accord en cours surligné. */
  const renderGrid = () => {
    gridBox.innerHTML = '';
    timeline.forEach((ch, i) => {
      const notesTxt = CHORDS[ch.q].iv.map(x => pcName((ch.root + x) % 12, ch)).join(' ');
      const cell = h('div', { class: 'ig-cell' + (ch.beats < P.meter ? ' half' : ''), role: 'listitem', 'data-i': i, title: `${ch.name} : ${notesTxt}` },
        ch.section ? h('span', { class: 'ig-sec' }, ch.section) : null,
        h('b', {}, ch.label || '·'), h('span', { class: 'ig-name' }, ch.name), h('span', { class: 'ig-notes' }, notesTxt));
      gridBox.append(cell);
    });
  };

  const showChord = (i, live = true) => {
    if (!timeline) return;
    const ch = timeline[i % timeline.length];
    const nxt = timeline[(i + 1) % timeline.length];
    gridBox.querySelectorAll('.ig-cell').forEach((c, k) => c.classList.toggle('on', live && k === i % timeline.length));
    chordBox.innerHTML = '';
    const v = voicing(ch);
    const ct = CHORDS[ch.q].iv.map(x => pcName((ch.root + x) % 12, ch));
    chordBox.append(
      h('div', {}, h('div', { class: 'small' }, live ? 'Accord actuel' : 'Premier accord'), h('div', { class: 'in-label' }, ch.label || ch.name), h('div', { class: 'small' }, ch.label ? ch.name : '')),
      h('div', { class: 'in-next' }, h('div', { class: 'small' }, 'Suivant'), h('div', { class: 'in-label sm' }, nxt.label || nxt.name)),
      h('div', { class: 'small in-notes' },
        P.showScale ? h('div', {}, 'Notes à jouer : ', h('b', {}, scalePcs(ch).map(x => pcName(x, ch)).join(' '))) : null,
        h('div', {}, P.showScale ? 'Notes d’appui : ' : 'Notes de l’accord : ', h('b', {}, ct.join(' – '))),
        lhMode === 'moi' ? h('div', {}, 'Ta main gauche : ', h('b', {}, `${noteNameFr(v.bass)} + ${v.upper.map(m => noteNameFr(m)).join(' ')}`)) : null));
    const pcs = CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
    const sc = P.showScale ? scalePcs(ch) : [];
    const marks = [];
    for (let m = 36; m <= 89; m++) {
      if (m < 60) {
        if (lhMode === 'moi' && (m === v.bass || v.upper.includes(m))) marks.push({ m, color: isBlackKey(m) ? '#8c5a26' : '#efdcc4' });
        continue;
      }
      if (pcs.includes(pc(m))) marks.push({ m, color: isBlackKey(m) ? '#3f8a5c' : '#b9dcc5' });
      else if (sc.includes(pc(m))) marks.push({ m, color: isBlackKey(m) ? '#476aa3' : '#d2def0' });
    }
    const tg = mode === 'squelette' && hasTargets() ? targetAt(i) : null;
    if (tg != null) {
      const k = marks.findIndex(x => x.m === tg);
      const mk = { m: tg, color: '#c99a2e', label: noteNameFr(tg, { octave: false }) };
      if (k >= 0) marks[k] = mk; else marks.push(mk);
    }
    kb.setMarks(marks);
    curMarks = new Map(marks.map(x => [x.m, x.color]));
  };
  let curMarks = new Map();

  const flashKey = (m, col, ms = 260) => {
    const k = kb.querySelector(`[data-m="${m}"]`);
    if (!k) return;
    k.setAttribute('fill', col);
    // retour à la couleur du moment (l'accord a pu changer entre-temps)
    setTimeout(() => k.setAttribute('fill', curMarks.get(m) || (isBlackKey(m) ? '#2a2a2e' : '#fff')), ms);
  };

  /* ---------- programmation de l'accompagnement ---------- */
  const schedule = () => {
    if (!playing) return;
    const spb = 60 / bpm;
    const maxLoops = qr ? 0 : +loops.value;
    while (nextTime < audio.now() + 0.3) {
      if (maxLoops && idx >= timeline.length * maxLoops) { const end = nextTime; setTimeout(() => stop(true), Math.max(0, (end - audio.now()) * 1000) + 300); playing = false; return; }
      if (qr && qr.done) { const end = nextTime; setTimeout(() => stop(true), Math.max(0, (end - audio.now()) * 1000) + 300); playing = false; return; }
      const ch = timeline[idx % timeline.length];
      const v = voicing(ch);
      const t = nextTime;
      const dur = ch.beats * spb;
      const note = (m, at, d, vel = 52) => { const vo = audio.noteOn(m, vel, at, { owner: 'improv' }); if (vo) audio.noteOff(vo, at + d); };
      if (lhMode === 'app' && !ch.silent) {
        if (ch.hold) { (ch.notes ? v.upper : [v.bass, ...v.upper]).forEach(m => note(m, t, dur * 0.98, 46)); }
        else (PATTERNS[(!patOverride && ch.pattern) || patSel.value] || PATTERNS['basse-accord'])({ v, t, dur, beats: ch.beats, spb, note, meter: P.meter });
      }
      const barStart = ch.at % P.meter === 0;
      if (clickOn || lhMode === 'moi') for (let b = 0; b < ch.beats; b++) audio.click(t + b * spb, barStart && b === 0 ? 'accent' : 'beat');
      chordLog.push({ start: audio.ctxToPerf(t), end: audio.ctxToPerf(t + dur), ch, beatMs: spb * 1000, meter: P.meter, i: idx, at0: ch.at });
      qr?.onChord(idx, t, dur);
      const delay = Math.max(0, audio.ctxToPerf(t) - performance.now());
      const i = idx;
      setTimeout(() => { if (playing || i < idx) showChord(i); }, delay);
      nextTime += dur;
      idx++;
    }
  };

  /* ---------- jeu question – réponse ---------- */
  // segments de deux mesures : question (appli), réponse (toi), en alternance, sur deux tours de grille au plus
  const buildQR = (t0) => {
    const barsTotal = Math.round(timeline.totalBeats / P.meter);
    const segBars = barsTotal >= 4 ? 2 : 1;
    const rounds = Math.max(2, Math.min(8, Math.floor((barsTotal * 2) / segBars)));
    const segs = [];
    for (let s = 0; s < rounds; s++) {
      const fromBar = (s * segBars) % barsTotal;
      const chords = timeline.filter(c => c.bar >= fromBar && c.bar < fromBar + segBars);
      segs.push({ kind: s % 2 === 0 ? 'q' : 'a', fromBar, chords, meter: P.meter, absBar: s * segBars, isEnd: (fromBar + segBars) % barsTotal === 0 });
    }
    return {
      segs, cur: -1, segBars, results: [], done: false, question: null,
      onChord(i, t, dur) {
        const absBeat = timeline[i % timeline.length].at + Math.floor(i / timeline.length) * timeline.totalBeats;
        const absBar = Math.floor(absBeat / P.meter);
        const s = Math.floor(absBar / segBars);
        if (s >= segs.length) { this.done = true; return; }
        if (s !== this.cur && absBeat % (P.meter * segBars) === 0) {
          this.cur = s;
          const seg = segs[s];
          seg.startCtx = t; seg.startPerf = audio.ctxToPerf(t);
          if (seg.kind === 'q') {
            const q = genMelody(P, seg.chords, { meter: P.meter, end: 'open', start: this.lastNote || 72 });
            this.question = q; seg.q = q;
            const spb = 60 / bpm;
            for (const n of q.notes) {
              const at = t + n.t * spb;
              const vo = audio.noteOn(n.m, 74, at, { owner: 'improv' }); if (vo) audio.noteOff(vo, at + n.d * spb * 0.92);
              setTimeout(() => flashKey(n.m, '#c99a2e', n.d * spb * 900), Math.max(0, audio.ctxToPerf(at) - performance.now()));
            }
            this.lastNote = q.notes[q.notes.length - 1].m;
            setTimeout(() => setQRStatus(`Question ${Math.floor(s / 2) + 1} : écoute…`), Math.max(0, seg.startPerf - performance.now()));
          } else {
            seg.q = this.question;
            seg.played = [];
            setTimeout(() => setQRStatus(`<b>À toi !</b> Réponse ${Math.floor(s / 2) + 1} : reprends le rythme, finis ${seg.isEnd ? 'sur la tonique' : 'sur une note de l’accord'}.`), Math.max(0, seg.startPerf - performance.now()));
            // jugement à la fin du segment
            const endPerf = seg.startPerf + segBars * P.meter * (60000 / bpm);
            setTimeout(() => this.judge(seg), Math.max(0, endPerf - performance.now()) + 250);
          }
        }
      },
      judge(seg) {
        if (!seg.q) return;
        const r = judgeAnswer(seg.played, seg, seg.q, seg.isEnd);
        this.results.push(r);
        const n = this.results.length;
        qrBox.append(h('div', { class: 'qr-res' + (r.score >= 0.75 ? ' ok' : '') }, h('b', {}, `Réponse ${n}`), h('ul', {}, ...r.lines.map(l => h('li', {}, l)))));
        if (seg === segs[segs.length - 1]) this.done = true;
      },
    };
  };
  const setQRStatus = html => { status.innerHTML = html; };

  const start = async (opts = {}) => {
    audio.claim('improv', () => stop());
    await audio.ensure();
    audio.prime?.();
    playing = true; idx = 0; chordLog = []; played = []; tgState = new Map(); lastTarget = null;
    nextTime = audio.now() + 0.5;
    const t0 = nextTime;
    if (opts.replay) qr = null;
    else if (mode === 'qr') { qrBox.querySelectorAll('.qr-res').forEach(x => x.remove()); qr = buildQR(t0); } else qr = null;
    playBtn.textContent = 'Arrêter';
    playBtn.classList.add('on');
    timer = setInterval(schedule, 30);
    schedule();
    if (opts.replay) {
      // réécoute : la main droite enregistrée, recalée sur le début de l'accompagnement ; arrêt après la dernière note
      let end = 0;
      for (const n of opts.replay.notes) {
        const at = t0 + n.t / 1000;
        const vo = audio.noteOn(n.note, n.vel, at, { owner: 'improv' }); if (vo) audio.noteOff(vo, at + Math.max(0.08, n.d / 1000));
        end = Math.max(end, n.t + n.d);
      }
      replaying = true;
      status.textContent = 'Réécoute de ta dernière improvisation…';
      replayTimer = setTimeout(() => stop(true), end + 1500 + (t0 - audio.now()) * 1000);
      return;
    }
    rec = []; recStart = audio.ctxToPerf(t0);
    const openNotes = new Map();
    offNote = midi.on('noteon', ev => {
      if (ev.note < 60) return; // main gauche ignorée
      const seg = chordLog.find(c => ev.time >= c.start - 60 && ev.time < c.end - 60) || chordLog[chordLog.length - 1];
      if (!seg) return;
      const chPcs = CHORDS[seg.ch.q].iv.map(x => (seg.ch.root + x) % 12);
      const kind = chPcs.includes(pc(ev.note)) ? 'chord' : scalePcs(seg.ch).includes(pc(ev.note)) ? 'scale' : 'chrom';
      const posInChord = (ev.time - seg.start) / seg.beatMs;
      const posInBar = (seg.at0 % seg.meter) + posInChord;
      const nearBeat = Math.abs(posInBar - Math.round(posInBar)) < 0.18;
      const rb = Math.round(posInBar) % seg.meter;
      const strong = nearBeat && (rb === 0 || (seg.meter === 4 && rb === 2));
      const rec1 = { note: ev.note, kind, strong, time: ev.time, bar: seg.ch.bar };
      played.push(rec1);
      // squelette : la note d'appui de la mesure au premier temps
      if (mode === 'squelette' && hasTargets()) {
        // appoggiature : la note qui suit la note en or descend-elle d'un degré sur une note de l'accord ?
        if (lastTarget && lastTarget.resolved == null && lastTarget.at !== ev.time) { const d = lastTarget.note - ev.note; lastTarget.resolved = d >= 1 && d <= 2 && kind === 'chord'; lastTarget = null; }
        const atStart = P.chordTargets ? Math.abs(posInChord) < 0.18 : nearBeat && rb === 0;
        const tgt = targetAt(seg.i);
        if (atStart && tgt != null && !seg.ch.silent) {
          const st = tgState.get(seg.i) || { hit: false, resolved: null, note: tgt, at: 0 };
          if (ev.note === tgt && !st.hit) { st.hit = true; st.at = ev.time; lastTarget = st; }
          tgState.set(seg.i, st);
          rec1.target = ev.note === tgt;
        }
      }
      // question – réponse : note jouée pendant une réponse
      if (qr && qr.cur >= 0) {
        const sg = qr.segs[qr.cur];
        if (sg && sg.kind === 'a' && sg.played) sg.played.push({ ...rec1, beat: (ev.time - sg.startPerf) / (60000 / bpm) });
      }
      const n = { note: ev.note, vel: ev.velocity, t: ev.time - recStart, d: 300 };
      rec.push(n); openNotes.set(ev.note, n);
      flashKey(ev.note, kind === 'chord' ? COLORS.ok : kind === 'scale' ? '#3b6bb5' : COLORS.warn);
    });
    offOff = midi.on('noteoff', ev => { const n = openNotes.get(ev.note); if (n) { n.d = ev.time - recStart - n.t; openNotes.delete(ev.note); } });
  };

  const stop = (natural = false) => {
    const wasPlaying = playing || timer;
    playing = false;
    clearInterval(timer); timer = null;
    audio.stopAll('improv');
    audio.release('improv');
    offNote?.(); offNote = null; offOff?.(); offOff = null;
    playBtn.textContent = 'Lancer l’accompagnement';
    playBtn.classList.remove('on');
    gridBox.querySelectorAll('.ig-cell.on').forEach(c => c.classList.remove('on'));
    clearTimeout(replayTimer); replayTimer = null;
    if (replaying) { replaying = false; status.textContent = statusIdle(); return; }
    if (rec.length >= 3) { lastRec = { notes: rec.slice(), presetId, bpm, pattern: patSel.value }; replayBtn.disabled = false; }
    if (wasPlaying && qr) {
      const rs = qr.results;
      if (rs.length) {
        const avg = rs.reduce((a, r) => a + r.score, 0) / rs.length;
        status.innerHTML = `<b>${rs.length}</b> réponse${rs.length > 1 ? 's' : ''} · réussite moyenne <b>${fmtPct(avg)}</b>. ${avg >= 0.75 ? 'Très bien : tes réponses tiennent debout.' : 'Relis les remarques ci-dessus, puis recommence plus lentement.'}`;
        store.push('stats.analyzer', { mode: 'improv-qr', at: Date.now(), pct: avg, id: presetId });
      } else status.textContent = statusIdle();
      qr = null;
      return;
    }
    qr = null;
    if (wasPlaying && played.length >= 4) {
      const strong = played.filter(p => p.strong);
      const chordStrong = strong.filter(p => p.kind === 'chord').length;
      const chrom = played.filter(p => p.kind === 'chrom').length;
      const pctStrong = strong.length ? chordStrong / strong.length : 0;
      let html = `<b>${played.length}</b> notes jouées · temps forts sur une note de l’accord : <b>${fmtPct(pctStrong)}</b> · notes chromatiques : <b>${chrom}</b>. `;
      const isApp = mode === 'squelette' && P.targetLabel === 'appoggiature';
      if (mode === 'squelette' && hasTargets()) {
        // unités (mesures ou accords) commencées avant la dernière note jouée
        const lastT = played[played.length - 1].time;
        const units = chordLog.filter(c => c.start <= lastT + 40 && !c.ch.silent && targetAt(c.i) != null && (P.chordTargets || c.ch.at % P.meter === 0)).length;
        const tg = [...tgState.values()];
        const okT = tg.filter(x => x.hit).length;
        const tot = Math.max(units, okT, 1);
        if (isApp) {
          const res = tg.filter(x => x.hit && x.resolved).length;
          html = `<b>${played.length}</b> notes jouées · appoggiatures posées au 1er temps : <b>${okT}/${tot}</b> · résolues d’un degré vers le bas : <b>${res}/${Math.max(okT, 1)}</b>. `;
          html += okT && res >= okT * 0.75 ? 'Les soupirs sont là : appui, puis détente.' : 'Après la note en or, descends d’un degré (un ton ou un demi-ton) sur une note de l’accord.';
        } else html += `Notes d’appui posées : <b>${okT}/${tot}</b>${okT / tot >= 0.75 ? ' : le squelette tient.' : '.'} `;
      }
      if (!isApp) html += pctStrong >= 0.7 ? 'La mélodie s’appuie bien sur l’harmonie.' : 'Vise une note de l’accord sur chaque temps fort ; les notes de passage vont entre les temps.';
      status.innerHTML = html;
      store.push('stats.analyzer', { mode: 'improv', at: Date.now(), pct: pctStrong, id: presetId });
    } else if (!natural) status.textContent = statusIdle();
  };

  playBtn.addEventListener('click', () => (playing ? stop() : start()));
  replayBtn.addEventListener('click', () => {
    if (!lastRec) return;
    if (playing) stop();
    if (lastRec.presetId !== presetId) { presetId = lastRec.presetId; sel.value = presetId; load(); }
    bpm = lastRec.bpm; rng.value = bpm; out.textContent = `♩ = ${bpm}`;
    patSel.value = lastRec.pattern;
    start({ replay: lastRec });
  });
  modelBtn.addEventListener('click', async () => {
    // une question et une réponse possible, avec l'accompagnement
    if (playing) stop();
    await audio.ensure();
    const chordsQ = timeline.filter(c => c.bar < 2);
    const chordsA = timeline.filter(c => c.bar >= 2 && c.bar < 4);
    const q = genMelody(P, chordsQ, { meter: P.meter, end: 'open' });
    const a = genMelody(P, chordsA.length ? chordsA : chordsQ, { meter: P.meter, end: 'close', rhythm: q.rhythm, start: q.notes[q.notes.length - 1].m });
    const spb = 60 / bpm, t0 = audio.now() + 0.4;
    const dQ = chordsQ.reduce((x, c) => x + c.beats, 0);
    audio.claim('improv', () => audio.stopAll('improv'));
    [...q.notes.map(n => ({ ...n, t: n.t })), ...a.notes.map(n => ({ ...n, t: n.t + dQ }))].forEach(n => {
      const vo = audio.noteOn(n.m, 74, t0 + n.t * spb, { owner: 'improv' }); if (vo) audio.noteOff(vo, t0 + (n.t + n.d * 0.92) * spb);
    });
    [...chordsQ, ...(chordsA.length ? chordsA : chordsQ)].reduce((tt, ch) => {
      const v = voicing(ch);
      const note = (m, at, d, vel = 46) => { const vo = audio.noteOn(m, vel, at, { owner: 'improv' }); if (vo) audio.noteOff(vo, at + d); };
      (PATTERNS[patSel.value] || PATTERNS['basse-accord'])({ v, t: tt, dur: ch.beats * spb, beats: ch.beats, spb, note, meter: P.meter });
      return tt + ch.beats * spb;
    }, t0);
    status.textContent = 'Une question (deux mesures), puis une réponse possible : même rythme au départ, fin sur la tonique.';
  });
  sel.addEventListener('change', () => { presetId = sel.value; load(); });
  patSel.addEventListener('change', () => { patOverride = true; });
  load();
  return () => stop();
}
