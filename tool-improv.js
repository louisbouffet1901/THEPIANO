// Accompagnateur d'improvisation : grille harmonique jouée en boucle + retour visuel sur les notes jouées.
import { h, esc, fmtPct, noteNameFr, pc, CHORDS, SCALES } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard, COLORS } from './diagrams.js';

const PC_NAMES_FLAT = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];
const PC_NAMES_SHARP = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
/** Noms avec dièses dans les tonalités à dièses (fa♯ majeur, la mineur avec sol♯…), bémols sinon. */
const SHARP_TONICS = { maj: [7, 2, 9, 4, 11, 6], min: [4, 11, 6, 1, 8, 9] };
function PC_NAMES_SHARP_OR_FLAT(p, ch) {
  const sharp = (SHARP_TONICS[ch.mode] || []).includes(ch.tonic % 12) || (ch.mode === 'min' && p === (ch.tonic + 11) % 12 && [9, 4, 2, 7].includes(ch.tonic % 12));
  return (sharp ? PC_NAMES_SHARP : PC_NAMES_FLAT)[p];
}
const isBlackKey = m => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);

/** Chiffrages romains -> {offset, qualité} */
const ROMAN = {
  maj: { I: [0, 'M'], ii: [2, 'm'], iii: [4, 'm'], IV: [5, 'M'], V: [7, 'M'], V7: [7, '7'], vi: [9, 'm'], 'vii°': [11, 'dim'], 'V7/IV': [0, '7'], 'V7/V': [2, '7'], 'V7/vi': [4, '7'], 'V7/ii': [9, '7'] },
  min: { i: [0, 'm'], 'ii°': [2, 'dim'], III: [3, 'M'], iv: [5, 'm'], V: [7, 'M'], V7: [7, '7'], VI: [8, 'M'], VII: [10, 'M'], N6: [1, 'M'], 'V7/iv': [0, '7'], 'V7/III': [10, '7'] },
};

/* Grilles écrites accord par accord (basse imposée : bassM = note MIDI de la basse). */
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

export const IMPROV_PRESETS = {
  'n1-noires': { title: 'Touches noires sur un ostinato (fa♯)', tonic: 6, mode: 'maj', meter: 4, scale: [0, 2, 4, 7, 9], showScale: true,
    custom: REP(4, C('fa♯ – do♯', 6, '5', 42, { name: 'quinte à vide' })), pattern: 'ostinato', bpm: 76 },
  'n1-penta': { title: 'Pentatonique de do sur un bourdon (do – sol)', tonic: 0, mode: 'maj', meter: 4, scale: [0, 2, 4, 7, 9], showScale: true,
    custom: REP(4, C('do – sol', 0, '5', 48, { name: 'quinte à vide' })), pattern: 'bourdon', bpm: 72 },
  'n1-penta-la': { title: 'Pentatonique de la mineur sur un ostinato (la – mi)', tonic: 9, mode: 'min', meter: 4, scale: [0, 3, 5, 7, 10], showScale: true,
    custom: REP(4, C('la – mi', 9, '5', 45, { name: 'quinte à vide' })), pattern: 'ostinato', bpm: 80 },
  'n1-5notes': { title: 'Cinq notes (do à sol) sur I et V7', tonic: 0, mode: 'maj', meter: 4, scale: [0, 2, 4, 5, 7], showScale: true,
    bars: ['I', 'I', 'V7', 'V7', 'I', 'I', 'V7', 'I'], pattern: 'basse-accord', bpm: 72 },
  'n1-IIVVI': { title: 'Do majeur : I – IV – V7 – I', tonic: 0, mode: 'maj', meter: 4, bars: ['I', 'IV', 'V7', 'I'], pattern: 'basse-accord', bpm: 66 },
  'n1-IIVVI8': { title: 'Do majeur, 8 mesures : I – vi – IV – V7, I – IV – V7 – I', tonic: 0, mode: 'maj', meter: 4, bars: ['I', 'vi', 'IV', 'V7', 'I', 'IV', 'V7', 'I'], pattern: 'alberti', bpm: 72 },
  'n1-am': { title: 'La mineur : i – iv – V7 – i', tonic: 9, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i', 'i', 'iv', 'V7', 'i'], pattern: 'arpege', bpm: 60 },
  'n1-nocturne': { title: 'Nocturne en fa mineur : i – iv – V7 – i', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'V7', 'i'], pattern: 'basse-accord', bpm: 60 },
  'n1-nocturne8': { title: 'Nocturne en fa mineur, 8 mesures', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'VI', 'iv', 'V7', 'i', 'iv', 'V7', 'i'], pattern: 'basse-accord', bpm: 60 },
  'n1-qr': { title: 'Question–réponse (demi-cadence, puis cadence parfaite)', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'i', 'V', 'i', 'iv', 'V7', 'i'], pattern: 'arpege', bpm: 56 },
  'n1-arpege': { title: 'Arpèges élargis : i – VI – iv – V7', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'VI', 'iv', 'V7'], pattern: 'arpege', bpm: 54 },
  'n1-valse': { title: 'Valse en la mineur : i – iv – V7 – i', tonic: 9, mode: 'min', meter: 3, bars: ['i', 'iv', 'V7', 'i', 'VI', 'iv', 'V7', 'i'], pattern: 'valse', bpm: 120 },
  'n2-cadence': { title: 'Cadence en do majeur : I6 – IV – V7 – I (basse seule)', tonic: 0, mode: 'maj', meter: 4,
    custom: [C('I6', 0, 'M', 52, { name: 'do majeur / mi' }), C('IV', 5, 'M', 53, { name: 'fa majeur' }), C('V7', 7, '7', 55, { name: 'sol 7' }), C('I', 0, 'M', 48, { name: 'do majeur' })], pattern: 'basse', bpm: 56 },
  'n2-cadence-min': { title: 'Cadence en la mineur : i6 – iv – V7 – i (basse seule)', tonic: 9, mode: 'min', meter: 4,
    custom: [C('i6', 9, 'm', 48, { name: 'la mineur / do' }), C('iv', 2, 'm', 50, { name: 'ré mineur' }), C('V7', 4, '7', 52, { name: 'mi 7' }), C('i', 9, 'm', 45, { name: 'la mineur' })], pattern: 'basse', bpm: 56 },
  'n2-octave': { title: 'Règle de l’octave en do majeur (montée et descente)', tonic: 0, mode: 'maj', meter: 2, custom: OCTAVE_MAJ, pattern: 'basse', bpm: 60 },
  'n2-octave-sol': { title: 'Règle de l’octave en sol majeur', tonic: 0, mode: 'maj', meter: 2, custom: OCTAVE_MAJ, tr: -5, pattern: 'basse', bpm: 60 },
  'n2-octave-fa': { title: 'Règle de l’octave en fa majeur', tonic: 0, mode: 'maj', meter: 2, custom: OCTAVE_MAJ, tr: -7, pattern: 'basse', bpm: 60 },
  'n2-romanesca': { title: 'Romanesca, Prinner et cadence (do majeur)', tonic: 0, mode: 'maj', meter: 4, custom: [
    C('I', 0, 'M', 48, { name: 'do majeur', section: 'Romanesca' }), C('V6', 7, 'M', 47, { name: 'sol majeur / si' }), C('vi', 9, 'm', 45, { name: 'la mineur' }), C('iii6', 4, 'm', 43, { name: 'mi mineur / sol' }),
    C('IV', 5, 'M', 41, { name: 'fa majeur', section: 'Prinner' }), C('I6', 0, 'M', 40, { name: 'do majeur / mi' }), C('V4/3', 7, '7', 38, { name: 'sol 7 / ré' }), C('I', 0, 'M', 36, { name: 'do majeur' }),
    C('I6', 0, 'M', 40, { name: 'do majeur / mi', section: 'Cadence' }), C('ii6', 2, 'm', 41, { name: 'ré mineur / fa' }), C('V7', 7, '7', 43, { name: 'sol 7' }), C('I', 0, 'M', 36, { name: 'do majeur' })], pattern: 'accords', bpm: 60 },
  'n2-meyer': { title: 'Meyer, Prinner et cadence (do majeur)', tonic: 0, mode: 'maj', meter: 4, custom: [
    C('I', 0, 'M', 48, { name: 'do majeur', section: 'Meyer' }), C('V4/3', 7, '7', 50, { name: 'sol 7 / ré' }), C('V6/5', 7, '7', 47, { name: 'sol 7 / si' }), C('I', 0, 'M', 48, { name: 'do majeur' }),
    C('IV', 5, 'M', 41, { name: 'fa majeur', section: 'Prinner' }), C('I6', 0, 'M', 40, { name: 'do majeur / mi' }), C('V4/3', 7, '7', 38, { name: 'sol 7 / ré' }), C('I', 0, 'M', 36, { name: 'do majeur' }),
    C('I6', 0, 'M', 40, { name: 'do majeur / mi', section: 'Cadence' }), C('ii6', 2, 'm', 41, { name: 'ré mineur / fa' }), C('V7', 7, '7', 43, { name: 'sol 7' }), C('I', 0, 'M', 36, { name: 'do majeur' })], pattern: 'accords', bpm: 60 },
  'n2-monte-fonte': { title: 'Monte puis Fonte (do majeur)', tonic: 0, mode: 'maj', meter: 4, custom: [
    C('V6/5 de IV', 0, '7', 52, { name: 'do 7 / mi', section: 'Monte' }), C('IV', 5, 'M', 53, { name: 'fa majeur' }), C('V6/5 de V', 2, '7', 54, { name: 'ré 7 / fa♯' }), C('V', 7, 'M', 55, { name: 'sol majeur' }),
    C('V6/5 de ii', 9, '7', 49, { name: 'la 7 / do♯', section: 'Fonte' }), C('ii', 2, 'm', 50, { name: 'ré mineur' }), C('V6/5', 7, '7', 47, { name: 'sol 7 / si' }), C('I', 0, 'M', 48, { name: 'do majeur' })], pattern: 'accords', bpm: 60 },
  'n2-marche': { title: 'Marche par quintes en la mineur', tonic: 9, mode: 'min', meter: 4, bars: ['i', 'iv', 'VII', 'III', 'VI', 'ii°', 'V7', 'i'], pattern: 'arpege', bpm: 60 },
  'n2-aba': { title: 'Forme ABA : fa mineur / la♭ majeur / fa mineur', tonic: 5, mode: 'min', meter: 4, sections: [
    { label: 'A (fa mineur)', bars: ['i', 'iv', 'V7', 'i', 'i', 'iv', 'V7', 'i'] },
    { label: 'B (la♭ majeur)', tonic: 8, mode: 'maj', bars: ['I', 'IV', 'V7', 'I', 'vi', 'ii', 'V7', 'I'] },
    { label: 'retour : V7 de fa', bars: ['V7'], tonic: 5, mode: 'min' },
    { label: 'A', tonic: 5, mode: 'min', bars: ['i', 'iv', 'V7', 'i'] }], pattern: 'basse-accord', bpm: 60 },
  'n2-lamento': { title: 'Prélude sur basse chromatique descendante (fa majeur)', tonic: 5, mode: 'maj', meter: 4, custom: [
    { label: 'F', name: 'fa majeur', root: 5, q: 'M' },
    { label: 'C/E', name: 'do majeur / mi', root: 0, q: 'M', bass: 4 },
    { label: 'F7/E♭', name: 'fa 7 / mi♭', root: 5, q: '7', bass: 3 },
    { label: 'B♭/D', name: 'si♭ majeur / ré', root: 10, q: 'M', bass: 2 },
    { label: 'B♭m/D♭', name: 'si♭ mineur / ré♭', root: 10, q: 'm', bass: 1 },
    { label: 'F/C', name: 'fa majeur / do', root: 5, q: 'M', bass: 0 },
    { label: 'C7', name: 'do 7', root: 0, q: '7' },
    { label: 'F', name: 'fa majeur', root: 5, q: 'M' }], pattern: 'arpege', bpm: 56 },
  'n2-napolitaine': { title: 'Cadence avec sixte napolitaine (fa mineur)', tonic: 5, mode: 'min', meter: 4, bars: ['i', 'iv', 'N6', 'V7', 'i', 'VI', 'N6', 'V7'], pattern: 'accords', bpm: 60 },
};

function chordFromRoman(sym, tonic, mode) {
  const [off, q] = ROMAN[mode][sym];
  const root = (tonic + off) % 12;
  const bass = sym === 'N6' ? (root + 4) % 12 : undefined; // sixte napolitaine : tierce à la basse
  return { label: sym, name: `${PC_NAMES_SHARP_OR_FLAT(root, { tonic, mode })} ${CHORDS[q].fr}`, root, q, bass, tonic, mode };
}

const PC_NAMES_FLAT_FR = PC_NAMES_FLAT;
function buildTimeline(P) {
  const list = [];
  const tr = P.tr || 0;
  if (P.custom) P.custom.forEach(c => {
    if (!tr) { list.push({ ...c, tonic: P.tonic, mode: P.mode }); return; }
    const root = (c.root + tr + 120) % 12;
    list.push({ ...c, root, bass: c.bass != null ? (c.bass + tr + 120) % 12 : undefined, bassM: c.bassM != null ? c.bassM + tr : undefined,
      name: `${PC_NAMES_FLAT_FR[root]} ${CHORDS[c.q].fr}${c.bassM != null && pc(c.bassM) !== pc(c.root) ? ' / ' + PC_NAMES_FLAT_FR[pc(c.bassM + tr)] : ''}`,
      tonic: (P.tonic + tr + 120) % 12, mode: P.mode });
  });
  else if (P.sections) P.sections.forEach(s => s.bars.forEach((b, i) => list.push({ ...chordFromRoman(b, s.tonic ?? P.tonic, s.mode ?? P.mode), section: i === 0 ? s.label : null })));
  else P.bars.forEach(b => list.push(chordFromRoman(b, P.tonic, P.mode)));
  return list;
}

function voicing(ch) {
  const pcs = CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
  const bassPc = ch.bass ?? ch.root;
  let bass = ch.bassM;
  if (bass == null) { bass = 40; while (pc(bass) !== bassPc) bass++; }   // mi1–ré♯2 (français) : E2–D#3
  const upper = [];
  let m = Math.max(53, bass + 3); // à partir de fa2 (F3), au-dessus de la basse
  while (upper.length < pcs.length && m < 76) { if (pcs.includes(pc(m)) && !upper.some(u => pc(u) === pc(m))) upper.push(m); m++; }
  // arpège élargi : basse, quinte (ou note suivante), octave, dixième
  const arp = [bass];
  let x = bass + 5;
  while (arp.length < 4 && x < bass + 20) { if (pcs.includes(pc(x)) && x - arp[arp.length - 1] >= 3) arp.push(x); x++; }
  return { pcs, bass, upper, arp };
}

export function mountImprov(el, cfg = {}) {
  let presetId = cfg.preset || 'n1-nocturne';
  const presetIds = cfg.presets || Object.keys(IMPROV_PRESETS);
  const frame = h('div', { class: 'w-frame' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Accompagnateur d’improvisation'));
  const sel = h('select', { style: { marginLeft: 'auto', minHeight: '34px', borderRadius: '8px', border: '1px solid var(--line-strong)', padding: '0 8px', background: '#fff' } }, ...presetIds.map(p => h('option', { value: p, selected: p === presetId }, IMPROV_PRESETS[p].title)));
  if (presetIds.length > 1) head.append(sel);
  const body = h('div', { class: 'w-body' });
  const chordBox = h('div', { class: 'row', style: { gap: '16px', alignItems: 'baseline', marginBottom: '8px' } });
  const kbHost = h('div');
  const legend = h('div', { class: 'form-legend' },
    h('span', {}, h('i', { style: { display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: COLORS.ok, marginRight: '6px', verticalAlign: '-1px' } }), 'note de l’accord'),
    h('span', {}, h('i', { style: { display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#3b6bb5', marginRight: '6px', verticalAlign: '-1px' } }), 'note de la gamme (passage, broderie)'),
    h('span', {}, h('i', { style: { display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: COLORS.warn, marginRight: '6px', verticalAlign: '-1px' } }), 'note chromatique (à résoudre)'));
  const foot = h('div', { class: 'w-foot' });
  const status = h('div', { class: 'score-status' });
  frame.append(head, body, foot);
  body.append(chordBox, kbHost, legend);
  el.append(frame);

  let P, timeline, kb, playing = false, timer = null, nextBarTime, barIdx, chordLog = [], played = [], offNote = null, bpm;
  const playBtn = h('button', { class: 'btn primary play-btn', type: 'button' }, 'Lancer l’accompagnement');
  const out = h('output');
  const rng = h('input', { type: 'range', min: 30, max: 180 });
  const loops = h('select', {}, h('option', { value: 0 }, 'en boucle'), h('option', { value: 1 }, '1 fois'), h('option', { value: 2 }, '2 fois'), h('option', { value: 4 }, '4 fois'));
  const patSel = h('select', {}, ...[['basse-accord', 'basse + accord'], ['arpege', 'arpège élargi'], ['accords', 'accords tenus'], ['valse', 'valse (3 temps)'], ['alberti', 'basse d’Alberti'], ['ostinato', 'ostinato (quinte bercée)'], ['bourdon', 'bourdon (quinte tenue)'], ['basse', 'basse seule']].map(([v, l]) => h('option', { value: v }, l)));
  foot.append(h('div', { class: 'score-ctrl' }, playBtn, h('label', { class: 'range' }, 'Tempo', rng, out), h('label', { class: 'field', style: { flexDirection: 'row', alignItems: 'center', gap: '6px' } }, 'Main gauche', patSel), h('label', { class: 'field', style: { flexDirection: 'row', alignItems: 'center', gap: '6px' } }, 'Répétition', loops)), h('div', { style: { width: '100%' } }, status));
  rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = `♩ = ${bpm}`; });

  const load = () => {
    stop();
    P = IMPROV_PRESETS[presetId];
    timeline = buildTimeline(P);
    bpm = P.bpm; rng.value = bpm; out.textContent = `♩ = ${bpm}`;
    patSel.value = P.pattern;
    kbHost.innerHTML = '';
    kb = keyboard({ from: 41, to: 89, names: 'c', height: 104 });
    kbHost.append(kb);
    showChord(0, false);
    status.textContent = `${timeline.length} mesures · ${P.meter} temps par mesure. Improvise à la main droite (au-dessus du do3).`;
  };

  const scalePcs = ch => {
    const sc = P.scale || (ch.mode === 'maj' ? SCALES.maj : SCALES.harmMin);
    return sc.map(x => (ch.tonic + x) % 12);
  };

  const showChord = (i, live = true) => {
    const ch = timeline[i % timeline.length];
    const nxt = timeline[(i + 1) % timeline.length];
    chordBox.innerHTML = '';
    chordBox.append(...[
      h('div', {}, h('div', { class: 'small' }, live ? 'Accord actuel' : 'Premier accord'), h('div', { style: { fontSize: '30px', fontWeight: 700, letterSpacing: '-.01em' } }, ch.label), h('div', { class: 'small' }, ch.name)),
      h('div', { style: { opacity: 0.6 } }, h('div', { class: 'small' }, 'Suivant'), h('div', { style: { fontSize: '20px', fontWeight: 650 } }, nxt.label)),
      ch.section ? h('span', { class: 'tag gold' }, ch.section) : null,
      h('div', { class: 'small', style: { marginLeft: 'auto', textAlign: 'right' } },
        P.showScale ? h('div', {}, 'Notes à jouer : ', h('b', {}, scalePcs(ch).map(x => PC_NAMES_SHARP_OR_FLAT(x, ch)).join(' '))) : null,
        h('div', {}, P.showScale ? 'Notes d’appui : ' : 'Notes de l’accord : ', h('b', {}, CHORDS[ch.q].iv.map(x => PC_NAMES_SHARP_OR_FLAT((ch.root + x) % 12, ch)).join(' – '))))].filter(Boolean));
    const pcs = CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
    const sc = P.showScale ? scalePcs(ch) : [];
    const marks = [];
    for (let m = 60; m <= 89; m++) {
      if (pcs.includes(pc(m))) marks.push({ m, color: isBlackKey(m) ? '#3f8a5c' : '#cfe6d7' });
      else if (sc.includes(pc(m))) marks.push({ m, color: isBlackKey(m) ? '#476aa3' : '#dbe5f3' });
    }
    kb.setMarks(marks);
  };

  const schedule = () => {
    if (!playing) return;
    const spb = 60 / bpm;
    const barDur = spb * P.meter;
    const maxLoops = +loops.value;
    while (nextBarTime < audio.now() + 0.25) {
      if (maxLoops && barIdx >= timeline.length * maxLoops) { const end = nextBarTime; setTimeout(() => stop(true), Math.max(0, (end - audio.now()) * 1000) + 300); playing = false; return; }
      const ch = timeline[barIdx % timeline.length];
      const v = voicing(ch);
      const t = nextBarTime;
      const pat = patSel.value;
      const note = (m, at, dur, vel = 52) => { const vo = audio.noteOn(m, vel, at, { owner: 'improv' }); if (vo) audio.noteOff(vo, at + dur); };
      if (pat === 'basse-accord') {
        const beats = P.meter;
        for (let b = 0; b < beats; b++) {
          const at = t + b * spb;
          if (b % 2 === 0) note(b === 0 ? v.bass : (v.arp[1] - 12 >= 36 ? v.arp[1] - 12 : v.bass), at, spb * 1.9, b === 0 ? 60 : 50);
          else v.upper.forEach(m => note(m, at, spb * 0.9, 40));
        }
      } else if (pat === 'arpege') {
        const per = P.meter === 3 ? 6 : 12; // croches de triolet
        const seq = [v.arp[0], v.arp[1], v.arp[2], v.arp[3] ?? v.arp[2] + 4, v.arp[2], v.arp[1]];
        for (let k = 0; k < per; k++) note(seq[k % 6], t + k * barDur / per, barDur * 0.6, k === 0 ? 58 : 42);
      } else if (pat === 'accords') {
        note(v.bass, t, barDur, 56);
        v.upper.forEach(m => note(m, t, barDur * 0.98, 42));
      } else if (pat === 'valse') {
        note(v.bass, t, spb * 0.95, 60);
        for (let b = 1; b < P.meter; b++) v.upper.forEach(m => note(m, t + b * spb, spb * 0.7, 40));
      } else if (pat === 'alberti') {
        const u = v.upper.length >= 3 ? v.upper : [v.bass + 12, v.bass + 19, v.bass + 24];
        const lo = Math.max(u[0] - 12 >= 43 ? u[0] - 12 : u[0], 43);
        const cyc = [lo, u[2] - (u[2] - lo > 12 ? 12 : 0), u[1] - (u[1] - lo > 12 ? 12 : 0), u[2] - (u[2] - lo > 12 ? 12 : 0)];
        const per = P.meter * 2;
        for (let k = 0; k < per; k++) note(cyc[k % 4], t + k * spb / 2, spb * 0.45, k % 4 === 0 ? 50 : 38);
      } else if (pat === 'ostinato') {
        const cyc = [v.bass, v.bass + 7, v.bass + 12, v.bass + 7];
        for (let b = 0; b < P.meter; b++) note(cyc[b % 4], t + b * spb, spb * 0.95, b === 0 ? 58 : 46);
      } else if (pat === 'bourdon') {
        note(v.bass, t, barDur * 0.98, 54);
        note(v.bass + 7, t, barDur * 0.98, 44);
      } else if (pat === 'basse') {
        note(v.bass, t, barDur * 0.98, 58);
      }
      chordLog.push({ start: audio.ctxToPerf(t), end: audio.ctxToPerf(t + barDur), ch, beatMs: spb * 1000, meter: P.meter });
      const delay = Math.max(0, (t - audio.now()) * 1000);
      const idx = barIdx;
      setTimeout(() => { if (playing || idx < barIdx) showChord(idx); }, delay);
      nextBarTime += barDur;
      barIdx++;
    }
  };

  const start = async () => {
    audio.claim('improv', () => stop());
    await audio.ensure();
    playing = true; barIdx = 0; chordLog = []; played = [];
    nextBarTime = audio.now() + 0.15;
    playBtn.textContent = 'Arrêter';
    playBtn.classList.add('on');
    timer = setInterval(schedule, 30);
    schedule();
    offNote = midi.on('noteon', ev => {
      if (ev.note < 60) return; // main gauche ignorée
      const seg = chordLog.find(c => ev.time >= c.start - 60 && ev.time < c.end - 60) || chordLog[chordLog.length - 1];
      if (!seg) return;
      const chPcs = CHORDS[seg.ch.q].iv.map(x => (seg.ch.root + x) % 12);
      const kind = chPcs.includes(pc(ev.note)) ? 'chord' : scalePcs(seg.ch).includes(pc(ev.note)) ? 'scale' : 'chrom';
      const posInBar = (ev.time - seg.start) / seg.beatMs;
      const nearBeat = Math.abs(posInBar - Math.round(posInBar)) < 0.18;
      const strong = nearBeat && (Math.round(posInBar) % seg.meter === 0 || (seg.meter === 4 && Math.round(posInBar) === 2));
      played.push({ note: ev.note, kind, strong });
      const k = kb.querySelector(`[data-m="${ev.note}"]`);
      if (k) {
        const col = kind === 'chord' ? COLORS.ok : kind === 'scale' ? '#3b6bb5' : COLORS.warn;
        k.setAttribute('data-prev', k.getAttribute('fill'));
        k.setAttribute('fill', col);
        setTimeout(() => k.setAttribute('fill', k.getAttribute('data-prev') || '#fff'), 260);
      }
    });
  };

  const stop = (natural = false) => {
    const wasPlaying = playing || timer;
    playing = false;
    clearInterval(timer); timer = null;
    audio.stopAll('improv');
    audio.release('improv');
    offNote?.(); offNote = null;
    playBtn.textContent = 'Lancer l’accompagnement';
    playBtn.classList.remove('on');
    if (wasPlaying && played.length >= 4) {
      const strong = played.filter(p => p.strong);
      const chordStrong = strong.filter(p => p.kind === 'chord').length;
      const chrom = played.filter(p => p.kind === 'chrom').length;
      const pctStrong = strong.length ? chordStrong / strong.length : 0;
      status.innerHTML = `<b>${played.length}</b> notes jouées · temps forts sur une note de l’accord : <b>${fmtPct(pctStrong)}</b> · notes chromatiques : <b>${chrom}</b>. ` +
        (pctStrong >= 0.7 ? 'La mélodie s’appuie bien sur l’harmonie.' : 'Vise une note de l’accord sur chaque temps fort ; les notes de passage vont entre les temps.');
      store.push('stats.analyzer', { mode: 'improv', at: Date.now(), pct: pctStrong, id: presetId });
    }
  };

  playBtn.addEventListener('click', () => (playing ? stop() : start()));
  sel.addEventListener('change', () => { presetId = sel.value; load(); });
  load();
  return () => stop();
}
