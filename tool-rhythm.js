// Onglet Rythme : lire le rythme (compter, subdiviser, placer chaque attaque).
// V4 :
// - des phrases construites avec une logique musicale : un motif (a), sa répétition variée (a′) ou une question,
//   un contraste fait de fragments du motif (b), une conclusion qui reprend le début du motif et se pose sur une
//   valeur longue ; les valeurs de deux temps tombent sur les temps forts ;
// - un décompte commun (countin.js) : au moins quatre temps, premier clic à l'heure, chiffres calés sur le son ;
// - le mode « Temps et contretemps » : la grille des temps et de leurs subdivisions sous la partition, les syllabes
//   à dire (1 et 2 et…, 1 e et a…, 1 et a…) sous chaque note, un curseur qui avance avec les clics, les
//   subdivisions audibles si on le souhaite, et après la passe, l'endroit exact de chaque frappe.
import { h, esc, pick, shuffle, fmtPct, fmtNum, clamp, mean, median } from './util.js';
import { Score, Player } from './score.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { inputLatency } from './latency.js';
import { scheduleCountIn, countInPosition, countInBeats, LEAD } from './countin.js';

/* ------------------------------------------------------------------ */
/* Cellules rythmiques (en doubles croches ; « r » = silence)           */
/* ------------------------------------------------------------------ */
// Chaque cellule remplit un temps (4 doubles croches en mesure simple, 6 en mesure composée), sauf mention.
const CELLS = {
  q: [4], qr: ['r4'], ee: [2, 2], er_e: ['r2', 2], ssss: [1, 1, 1, 1], e_ss: [2, 1, 1], ss_e: [1, 1, 2],
  s_e_s: [1, 2, 1], ds: [3, 1], sd: [1, 3], sr_sss: ['r1', 1, 1, 1], trip: ['t', 2, 2, 2],
  // deux temps et plus
  h: [8], hd: [12], w: [16], qd_e: [6, 2], e_q_e: [2, 4, 2], q_tie: ['tie'],
  // mesure composée (temps = noire pointée = 6 doubles croches)
  eee: [2, 2, 2], qe: [4, 2], eq: [2, 4], qdot: [6], qdr: ['r6'], e_ss_e: [2, 1, 1, 2], ssss_e: [1, 1, 1, 1, 2], er_ee: ['r2', 2, 2],
  hdot: [12],
};
/** Longueur d'une cellule en doubles croches. */
function cellLen(c) {
  const v = CELLS[c];
  if (c === 'q_tie') return 8;
  if (v[0] === 't') return 4;
  return v.reduce((a, x) => a + (typeof x === 'string' ? +x.slice(1) : x), 0);
}
const isRestCell = c => CELLS[c].every(x => typeof x === 'string' && x[0] === 'r');
const startsWithRest = c => typeof CELLS[c][0] === 'string' && CELLS[c][0][0] === 'r';

/* Niveaux : de la noire aux polyrythmies. */
export const LEVELS = [
  { id: 1, title: 'Noires, blanches, rondes', meters: ['4/4', '3/4', '2/4'], cells: { q: 5, h: 3, qr: 2 }, focus: ['h', 'qr'],
    intro: '<p>Compte les temps à voix basse (« 1, 2, 3, 4 ») et garde-les pendant les notes longues : une blanche dure deux temps, une ronde quatre. Un soupir est un temps compté en silence.</p>' },
  { id: 2, title: 'Les croches', meters: ['4/4', '3/4', '2/4'], cells: { q: 4, ee: 5, h: 2, qr: 1 }, focus: ['ee'], weakHalf: true,
    intro: '<p>Deux croches dans un temps : compte « 1 et 2 et ». La deuxième croche tombe sur le « et », exactement au milieu du temps : c’est le <b>contretemps</b>.</p>' },
  { id: 3, title: 'Noire pointée, contretemps, syncope', meters: ['4/4', '3/4'], cells: { q: 3, ee: 3, qd_e: 4, er_e: 3, e_q_e: 2 }, focus: ['qd_e', 'er_e', 'e_q_e'], weakHalf: true,
    intro: '<p>La noire pointée dure un temps et demi : la croche qui suit tombe sur le « et » du temps suivant. Un demi-soupir suivi d’une croche : le temps est muet, la note arrive sur le « et ». Dans la syncope croche – noire – croche, la noire commence sur un « et » et dure jusqu’au « et » suivant.</p>' },
  { id: 4, title: 'Les liaisons', meters: ['4/4', '3/4'], cells: { q: 3, ee: 3, q_tie: 3, h: 2 }, focus: ['q_tie'], weakHalf: true,
    intro: '<p>Une liaison prolonge la première note : on ne rejoue pas la seconde. Compte toujours les temps, la liaison ne fait que « cacher » une attaque.</p>' },
  { id: 5, title: 'Les doubles croches', meters: ['4/4', '2/4', '3/4'], cells: { q: 2, ee: 3, ssss: 4, e_ss: 3, ss_e: 3 }, focus: ['ssss', 'e_ss', 'ss_e'], weakHalf: true,
    intro: '<p>Quatre doubles croches par temps : compte « 1 e et a ». Croche + deux doubles : « 1 — et a » ; deux doubles + croche : « 1 e et — ».</p>' },
  { id: 6, title: 'Rythmes pointés serrés', meters: ['4/4', '2/4'], cells: { q: 2, ee: 2, ds: 5, sd: 2, ssss: 1 }, focus: ['ds', 'sd'], weakHalf: true,
    intro: '<p>Croche pointée – double croche : la longue dure trois doubles croches, la brève une seule, juste avant le temps suivant (« 1 — — a »). C’est le rythme de marche de Montaigus et Capulets : trop mou, il devient un triolet. Double – croche pointée (rythme lombard) : la brève sur le temps, la longue après.</p>' },
  { id: 7, title: 'Les triolets', meters: ['4/4', '3/4', '2/4'], cells: { q: 3, ee: 2, trip: 5 }, focus: ['trip'], weakHalf: true,
    intro: '<p>Trois croches dans un temps au lieu de deux : compte « 1 et a » (ou dis « tri-o-let »). Les trois notes sont égales ; seule la première tombe sur le temps. Alterner croches et triolets demande de changer de subdivision sans changer de pulsation.</p>' },
  { id: 8, title: 'Mesures composées : 6/8, 9/8, 12/8', meters: ['6/8', '9/8', '12/8'], cells: { eee: 4, qe: 4, qdot: 2, eq: 2, e_ss_e: 1 }, focus: ['qe', 'eee'], compound: true,
    intro: '<p>Le temps est une noire pointée, partagée en trois croches : compte « 1 et a, 2 et a ». Noire – croche se dit « 1 — a ». Le 9/8 de Clair de lune a trois temps de ce genre.</p>' },
  { id: 9, title: 'Contretemps et syncopes avancés', meters: ['4/4', '2/4'], cells: { er_e: 3, e_q_e: 3, sr_sss: 3, s_e_s: 3, ds: 1, q: 1 }, focus: ['sr_sss', 's_e_s', 'e_q_e'], syncope: true, weakHalf: true,
    intro: '<p>Les attaques tombent entre les temps. Garde la pulsation dans le corps (le pied, la tête) : chaque note se place par rapport à elle, pas par rapport à la note précédente.</p>' },
  { id: 10, title: 'Deux mains : 2 contre 3, 3 contre 4', meters: ['2/4', '3/4'], twoHands: true,
    intro: '<p>Une main fait deux notes par temps, l’autre trois. Ensemble sur le temps ; entre les deux, l’ordre est : 2e note du triolet, 2e note du duolet, 3e note du triolet (« nice cup of tea »). Commence très lentement, une main sur une touche grave, l’autre sur une touche aiguë.</p>' },
];
const levelById = id => LEVELS.find(l => l.id === id) || LEVELS[0];

/* ------------------------------------------------------------------ */
/* Génération : une phrase avec une logique (motif, variante ou question, contraste, conclusion) */
/* ------------------------------------------------------------------ */
function meterInfo(meter) {
  const [num, den] = meter.split('/').map(Number);
  const compound = den === 8 && num % 3 === 0;
  return { num, den, compound, beats: compound ? num / 3 : num * 4 / den, beatUnits: compound ? 6 : (4 * 4 / den), barUnits: num * 16 / den };
}

function weightedPick(weights, exclude = null) {
  const entries = Object.entries(weights).filter(([k]) => !exclude || !exclude(k));
  if (!entries.length) return null;
  let r = Math.random() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
  return entries[0][0];
}

/** Nombre de temps d'une cellule dans cette mesure. */
const beatsOf = (c, mi) => cellLen(c) / mi.beatUnits;

/** Une valeur de deux temps ou plus commence-t-elle à un endroit logique (temps fort) ? */
function placeable(c, beat, mi, L) {
  const span = beatsOf(c, mi);
  if (beat + span > mi.beats + 1e-9) return false;
  if (span < 2 - 1e-9) return true;
  if (L.syncope) return true;
  if (span >= 3) return beat === 0;
  if (mi.beats === 4) return beat === 0 || beat === 2;                 // 4/4 et 12/8 : temps 1 ou 3
  if (mi.beats === 3) return beat === 0 || (L.weakHalf && beat === 1); // 3/4 : noire-blanche permise après le niveau 1
  return beat === 0;
}

/** Une mesure : suite de cellules qui remplit exactement les temps, avec quelques garde-fous. */
function genBar(L, mi, { mustHave = null, avoidStartRest = false, avoid = null } = {}) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const cells = [];
    let beat = 0, guard = 0;
    while (beat < mi.beats - 1e-9 && guard++ < 40) {
      const c = weightedPick(L.cells);
      if (!placeable(c, beat, mi, L)) continue;
      if (beat === 0 && avoidStartRest && startsWithRest(c)) continue;
      cells.push(c);
      beat += beatsOf(c, mi);
    }
    if (Math.abs(beat - mi.beats) > 1e-9) continue;
    if (cells.every(isRestCell)) continue;
    if (cells.filter(isRestCell).length > (L.id <= 2 ? 1 : 2)) continue;
    if (mustHave && !cells.some(c => mustHave.includes(c))) continue;
    if (avoid && [].concat(avoid.length && Array.isArray(avoid[0]) ? avoid : [avoid]).some(x => x.join() === cells.join())) continue;
    return cells;
  }
  return Array(mi.beats).fill(L.compound ? 'qdot' : 'q');
}

/** Cellules d'un temps du niveau (pour remplir ou varier). */
const oneBeatCells = (L, mi) => Object.keys(L.cells).filter(c => Math.abs(beatsOf(c, mi) - 1) < 1e-9 && !isRestCell(c));

/** Variante du motif : le début reste, la fin change (souvent pour se poser). */
function varyEnd(A, L, mi) {
  const half = Math.ceil(mi.beats / 2);
  const keep = [];
  let beat = 0;
  for (const c of A) { if (beat >= half - 1e-9) break; keep.push(c); beat += beatsOf(c, mi); }
  if (beat >= mi.beats - 1e-9) return genBar(L, mi, { avoid: A, avoidStartRest: true });
  for (let attempt = 0; attempt < 40; attempt++) {
    const out = keep.slice();
    let b = beat;
    while (b < mi.beats - 1e-9) {
      const c = weightedPick(L.cells);
      if (!placeable(c, b, mi, L) || isRestCell(c)) continue;
      out.push(c); b += beatsOf(c, mi);
      if (out.length > 8) break;
    }
    if (Math.abs(b - mi.beats) < 1e-9 && out.join() !== A.join()) return out;
  }
  return A.slice();
}

/** Contraste fait de fragments du motif : le premier temps du motif répété, puis du nouveau. */
function fragmentBar(A, L, mi, avoid = []) {
  const f = A[0];
  const bad = x => [A, ...avoid].some(y => y.join() === x.join());
  if (beatsOf(f, mi) !== 1 || isRestCell(f) || mi.beats < 3) return genBar(L, mi, { avoid: [A, ...avoid], avoidStartRest: true });
  for (let attempt = 0; attempt < 40; attempt++) {
    const out = [f, f];
    let b = 2;
    while (b < mi.beats - 1e-9) {
      const c = weightedPick(L.cells);
      if (!placeable(c, b, mi, L)) continue;
      out.push(c); b += beatsOf(c, mi);
    }
    if (Math.abs(b - mi.beats) < 1e-9 && !bad(out)) return out;
  }
  return genBar(L, mi, { avoid: [A, ...avoid] });
}

/**
 * Mesure qui se pose. Conclusion : le début du motif, puis la valeur la plus longue possible (noire – blanche
 * pointée à 4/4, blanche à 3/4…). Question : une autre cellule, puis une valeur plus courte ou un silence :
 * la phrase reste en suspens.
 */
function cadenceBar(A, L, mi, { question = false } = {}) {
  const pool = oneBeatCells(L, mi);
  const unit = L.compound ? 'qdot' : 'q';
  const restUnit = L.compound ? 'qdr' : 'qr';
  const long2 = L.compound ? 'hdot' : 'h';
  const oneBeat = c => c && Math.abs(beatsOf(c, mi) - 1) < 1e-9 && !isRestCell(c);
  const a0 = oneBeat(A[0]) ? A[0] : (pool[0] || unit);
  const a1 = oneBeat(A[1]) ? A[1] : unit;
  const q0 = pick(pool.filter(c => c !== a0)) || a0;
  const B = Math.round(mi.beats);
  if (question) {
    if (B === 4) return [q0, a1, long2];
    if (B === 3) return [q0, unit, restUnit];
    return [q0, unit];
  }
  if (B === 4) return L.compound ? [a0, a1, long2] : [a0, 'hd'];
  if (B === 3) return [a0, long2];
  return [long2];
}

const FORMS = {
  phrase: { labels: ['a', 'a′', 'b', 'fin'], explain: 'motif (a), répété avec une fin différente (a′), contraste fait de fragments du motif (b), puis conclusion' },
  periode: { labels: ['a', 'b', 'a', 'fin'], explain: 'motif (a) et question qui se pose (b), puis le motif revient et conclut' },
  reprise: { labels: ['a', 'a', 'b', 'fin'], explain: 'motif (a) répété, contraste (b), puis conclusion' },
};

/** Phrase de 4 mesures (ou 2) construite selon une forme. */
export function genPhrase(levelId, { bars = 4, meter = null, form = null } = {}) {
  const L = levelById(levelId);
  meter = meter || pick(L.meters);
  const mi = meterInfo(meter);
  if (L.twoHands) return genPoly(meter, bars);
  const A = genBar(L, mi, { mustHave: L.focus, avoidStartRest: L.id <= 2 });
  let list, labels, formId;
  if (bars === 2) {
    list = [A, cadenceBar(A, L, mi)];
    labels = ['a', 'fin']; formId = 'courte';
  } else {
    formId = form || pick(Object.keys(FORMS));
    if (formId === 'phrase') { const A2 = varyEnd(A, L, mi); list = [A, A2, fragmentBar(A, L, mi, [A2]), cadenceBar(A, L, mi)]; }
    else if (formId === 'periode') list = [A, cadenceBar(A, L, mi, { question: true }), A.slice(), cadenceBar(A, L, mi)];
    else list = [A, A.slice(), genBar(L, mi, { avoid: A, mustHave: A.filter(c => !isRestCell(c)) }), cadenceBar(A, L, mi)];
    labels = FORMS[formId].labels;
  }
  list = list.slice(0, bars);
  return { meter, mi, bars: list, labels: labels.slice(0, bars), form: formId, explain: FORMS[formId]?.explain || 'motif (a), puis conclusion', level: L.id, abc: toAbc(list, meter, mi, { labels }) };
}

/* ------------------------------------------------------------------ */
/* Écriture ABC (portée d'une ligne), étiquettes de forme et syllables  */
/* ------------------------------------------------------------------ */
// Syllabes : 1 e et a (quatre doubles croches), 1 et (croches), 1 et a (triolets, mesures composées).
function syllable(beatIdx, off, units, sub) {
  if (Math.abs(off) < 1e-6) return String(beatIdx + 1);
  const f = off / units;
  if (sub === 3 || sub === 6) { // ternaire
    if (Math.abs(f - 1 / 3) < 0.02) return 'et';
    if (Math.abs(f - 2 / 3) < 0.02) return 'a';
    return '·';
  }
  if (Math.abs(f - 0.5) < 0.02) return 'et';
  if (Math.abs(f - 0.25) < 0.02) return 'e';
  if (Math.abs(f - 0.75) < 0.02) return 'a';
  return '·';
}

/** Événements (attaques, durées) d'une suite de cellules, en noires depuis le début de la phrase. */
export function phraseEvents(bars, mi) {
  const evs = []; // { t, dur, tieCont? }
  let t16 = 0;
  for (const cells of bars) {
    for (const c of cells) {
      const v = CELLS[c];
      if (c === 'q_tie') { evs.push({ t: t16, d: 2 }, { t: t16 + 2, d: 4 }, { t: t16 + 6, d: 2 }); t16 += 8; continue; }
      if (v[0] === 't') { for (let k = 0; k < 3; k++) evs.push({ t: t16 + k * 4 / 3, d: 4 / 3 }); t16 += 4; continue; }
      for (const x of v) {
        if (typeof x === 'string') { t16 += +x.slice(1); continue; }
        evs.push({ t: t16, d: x }); t16 += x;
      }
    }
  }
  return evs.map(e => ({ t: e.t / 4, dur: e.d / 4 }));
}

function cellAbc(c, note = 'B') {
  const v = CELLS[c];
  // deux temps : croche, croche liée à la croche suivante, croche (attaques sur 1, « et », « et » du 2e temps)
  if (c === 'q_tie') return `${note}2${note}2- ${note}2${note}2`;
  if (v[0] === 't') return `(3${note}2${note}2${note}2`;
  return v.map(x => (typeof x === 'string' ? `z${x.slice(1)}` : `${note}${x === 1 ? '' : x}`)).join('');
}
/** Syllabes de chaque note d'une mesure (pour la ligne w:). */
function barSyllables(cells, mi) {
  const out = [];
  let u = 0;
  // subdivision de chaque temps : 4 s'il y a une double croche, 3 pour un triolet ou en composé, sinon 2
  const subOf = beatIdx => {
    if (mi.compound) return 3;
    let b = 0, sub = 2;
    for (const c of cells) {
      const len = cellLen(c);
      const from = b / mi.beatUnits, to = (b + len) / mi.beatUnits;
      if (beatIdx >= from - 1e-9 && beatIdx < to - 1e-9) {
        if (CELLS[c][0] === 't') sub = 3;
        else if (CELLS[c].some(x => x === 1 || x === 3 || x === 'r1')) sub = 4;
      }
      b += len;
    }
    return sub;
  };
  for (const c of cells) {
    const v = CELLS[c];
    if (c === 'q_tie') {
      const b0 = Math.floor(u / mi.beatUnits);
      out.push(String(b0 + 1), 'et', '*', 'et');
      u += 8; continue;
    }
    if (v[0] === 't') {
      const b0 = Math.floor(u / mi.beatUnits);
      out.push(String(b0 + 1), 'et', 'a');
      u += 4; continue;
    }
    for (const x of v) {
      if (typeof x === 'string') { u += +x.slice(1); continue; }
      const bi = Math.floor((u + 1e-9) / mi.beatUnits);
      out.push(syllable(bi, u - bi * mi.beatUnits, mi.beatUnits, subOf(bi)));
      u += x;
    }
  }
  return out;
}
function toAbc(bars, meter, mi, { labels = null, lyrics = false } = {}) {
  const body = bars.map((cells, i) => (labels && labels[i] ? `"^${labels[i]}"` : '') + cells.map(c => cellAbc(c)).join(' ')).join(' | ');
  let abc = `X:1\nM:${meter}\nL:1/16\nK:C clef=perc stafflines=1\n${body} |]`;
  if (lyrics) abc += '\nw: ' + bars.map(cells => barSyllables(cells, mi).join(' ')).join(' | ');
  return abc + '\n';
}

/* Deux mains : 2 contre 3 ou 3 contre 4 (chaque main sur sa portée d'une ligne) */
function genPoly(meter, bars) {
  const mi = meterInfo(meter);
  const kind = pick(['2:3', '3:2', '3:4']);
  const pat = { '2:3': ['(3B2B2B2', 'B2B2'], '3:2': ['B2B2', '(3B2B2B2'], '3:4': ['(3B2B2B2', 'BBBB'] }[kind];
  const bar = p => Array(mi.beats).fill(p).join(' ');
  const last = p => Array(mi.beats - 1).fill(p).concat(['B4']).join(' ');
  const line = p => Array(bars - 1).fill(bar(p)).concat([last(p)]).join(' | ');
  const abc = `X:1\nM:${meter}\nL:1/16\n%%score RH LH\nV:RH clef=perc stafflines=1\nV:LH clef=perc stafflines=1\nK:C\n[V:RH] ${line(pat[0])} |]\n[V:LH] ${line(pat[1])} |]\n`;
  return { meter, mi, bars: [], labels: null, level: 10, abc, kind, explain: kind === '3:4' ? 'trois contre quatre' : 'deux contre trois' };
}

/* ------------------------------------------------------------------ */
/* Grille des temps et des contretemps                                  */
/* ------------------------------------------------------------------ */
/**
 * Modèle de la grille d'après les sons de la partition (une ligne par main) : pour chaque temps, la subdivision
 * nécessaire (2, 3, 4 ou 6), et pour chaque case : attaque, note tenue ou silence, avec sa syllabe.
 */
export function gridModel(score, { hands = null } = {}) {
  const beatQ = score.beatQ, barQ = score.barQ;
  const pick0 = score.pickupQ || 0;
  const total = Math.max(score.totalQ, pick0 + barQ * 0.5);
  const rowsHands = hands || (score.handsPresent.size > 1 ? ['rh', 'lh'] : [[...score.handsPresent][0] || 'rh']);
  const compound = Math.abs(beatQ - 1.5) < 1e-6;
  const nBeats = Math.ceil((total - 1e-6) / beatQ);
  const rows = rowsHands.map(hand => {
    const evs = score.events.filter(e => !e.grace && ((rowsHands.length === 1 && !hands) || e.hand === hand));
    const attacks = [...new Set(evs.map(e => Math.round(e.t * 960) / 960))].sort((a, b) => a - b);
    const beats = [];
    for (let b = 0; b < nBeats; b++) {
      const q0 = b * beatQ, q1 = q0 + beatQ;
      const inBeat = attacks.filter(t => t >= q0 - 1e-6 && t < q1 - 1e-6).map(t => (t - q0) / beatQ);
      const fits = k => inBeat.every(f => Math.abs(f * k - Math.round(f * k)) < 0.03);
      const sub = compound ? (fits(3) ? 3 : fits(2) ? 2 : 6) : (fits(2) ? 2 : fits(3) ? 3 : fits(4) ? 4 : fits(6) ? 6 : 4);
      const cells = [];
      for (let k = 0; k < sub; k++) {
        const cq0 = q0 + (k * beatQ) / sub, cq1 = q0 + ((k + 1) * beatQ) / sub;
        const att = attacks.some(t => t >= cq0 - 1e-3 && t < cq1 - 1e-3);
        const held = !att && evs.some(e => e.t < cq0 - 1e-3 && e.t + e.dur > cq0 + 1e-3);
        const barIdx = Math.floor((q0 - pick0 + 1e-6) / barQ);
        const beatInBar = Math.round(((q0 - pick0) - barIdx * barQ) / beatQ);
        cells.push({ q: cq0, kind: att ? 'att' : held ? 'hold' : 'rest', syl: k === 0 ? String((((beatInBar % Math.round(barQ / beatQ)) + Math.round(barQ / beatQ)) % Math.round(barQ / beatQ)) + 1) : syllableOf(k, sub) });
      }
      beats.push({ q: q0, sub, cells, barStart: Math.abs(((q0 - pick0) / barQ) - Math.round((q0 - pick0) / barQ)) < 1e-6 });
    }
    return { hand, beats };
  });
  return { rows, beatQ, barQ, nBeats, total: nBeats * beatQ };
}
function syllableOf(k, sub) {
  if (sub === 2) return 'et';
  if (sub === 3) return k === 1 ? 'et' : 'a';
  if (sub === 4) return ['', 'e', 'et', 'a'][k];
  if (sub === 6) return ['', '·', 'et', '·', 'a', '·'][k];
  return '·';
}

/** Grille SVG : une ligne par main ; curseur et frappes ajoutés pendant et après la passe. */
function renderGrid(host, model) {
  host.innerHTML = '';
  const beatGap = 4, rowH = 34, labelH = 18, padL = model.rows.length > 1 ? 34 : 6;
  // largeur : chaque temps a la même largeur, quelle que soit sa subdivision (les temps restent égaux) ; la grille
  // tient dans la largeur disponible quand c'est lisible, sinon elle défile
  const maxSub = Math.max(2, ...model.rows.flatMap(r => r.beats.map(b => b.sub)));
  const avail = (host.clientWidth || 800) - padL - 14;
  const beatW = Math.max(24 + 12 * maxSub, Math.min(96, Math.floor(avail / model.nBeats) - beatGap));
  const W = padL + model.nBeats * (beatW + beatGap) + 6;
  const H = model.rows.length * (rowH + labelH) + 6;
  // centre de la case qui contient l'instant q (en noires), et décalage horizontal d'une durée (en noires)
  const xOfQ = q => {
    const bi = Math.max(0, Math.min(model.nBeats - 1, Math.floor(q / model.beatQ + 1e-6)));
    const b = model.rows[0].beats[bi];
    const sub = b ? b.sub : 2;
    const k = Math.max(0, Math.min(sub - 1, Math.round(((q - bi * model.beatQ) / model.beatQ) * sub - 1e-6)));
    return padL + bi * (beatW + beatGap) + ((k + 0.5) * beatW) / sub;
  };
  const dxOfQ = dq => (dq / model.beatQ) * beatW;
  let svg = `<svg class="rgrid-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Grille des temps et des subdivisions">`;
  model.rows.forEach((row, ri) => {
    const y0 = 3 + ri * (rowH + labelH);
    if (model.rows.length > 1) svg += `<text x="4" y="${y0 + rowH / 2 + 4}" class="rg-hand">${row.hand === 'lh' ? 'MG' : 'MD'}</text>`;
    row.beats.forEach((b, bi) => {
      const x0 = padL + bi * (beatW + beatGap);
      if (b.barStart && bi > 0) svg += `<line x1="${x0 - beatGap / 2}" x2="${x0 - beatGap / 2}" y1="${y0 - 2}" y2="${y0 + rowH + labelH - 4}" class="rg-bar"/>`;
      const w = beatW / b.sub;
      b.cells.forEach((c, k) => {
        const x = x0 + k * w;
        const cls = k === 0 ? 'rg-beat' : (b.sub % 2 === 0 && k === b.sub / 2) || (b.sub === 3 && k > 0) ? 'rg-off' : 'rg-sub';
        svg += `<rect x="${x + 0.5}" y="${y0}" width="${w - 1}" height="${rowH}" rx="3" class="rg-cell ${cls}" data-q="${c.q}"/>`;
        if (c.kind === 'att') svg += `<circle cx="${x + w / 2}" cy="${y0 + rowH / 2}" r="${Math.min(8, w / 2 - 3)}" class="rg-att" data-q="${c.q}"/>`;
        else if (c.kind === 'hold') svg += `<line x1="${x + 2}" x2="${x + w - 2}" y1="${y0 + rowH / 2}" y2="${y0 + rowH / 2}" class="rg-hold"/>`;
        else svg += `<circle cx="${x + w / 2}" cy="${y0 + rowH / 2}" r="2" class="rg-rest"/>`;
        if (c.syl) svg += `<text x="${x + w / 2}" y="${y0 + rowH + 13}" class="rg-syl ${k === 0 ? 'b' : ''}">${c.syl}</text>`;
      });
    });
  });
  svg += `<rect class="rg-cursor" x="0" y="0" width="0" height="${H}" rx="3"/>`;
  svg += `<g class="rg-taps"></g></svg>`;
  const wrap = h('div', { class: 'rgrid', html: svg });
  host.append(wrap);
  const cursor = wrap.querySelector('.rg-cursor');
  const taps = wrap.querySelector('.rg-taps');
  return {
    /** Curseur sur la subdivision en cours (q en noires depuis le début, null pour cacher). */
    cursor(q) {
      if (q == null) { cursor.setAttribute('width', '0'); wrap.scrollLeft = 0; return; }
      if (q < 0 || q >= model.total) { cursor.setAttribute('width', '0'); return; }
      const bi = Math.floor(q / model.beatQ + 1e-9);
      const b = model.rows[0].beats[bi];
      if (!b) { cursor.setAttribute('width', '0'); return; }
      const k = Math.min(b.sub - 1, Math.floor(((q - b.q) / model.beatQ) * b.sub + 1e-9));
      const x = padL + bi * (beatW + beatGap) + (k * beatW) / b.sub;
      cursor.setAttribute('x', String(x)); cursor.setAttribute('width', String(beatW / b.sub));
      // le curseur reste visible quand la grille défile
      const r = wrap.getBoundingClientRect();
      const sx = (x / W) * wrap.scrollWidth;
      if (sx - wrap.scrollLeft > r.width - 60 || sx < wrap.scrollLeft) wrap.scrollLeft = Math.max(0, sx - 40);
    },
    /** Frappes après la passe : cercle coloré sur l'attaque attendue, trait à l'endroit réellement tapé. */
    showTaps(items, spqMs, extraQ = []) {
      let s = '';
      const rowY = hand => { const ri = Math.max(0, model.rows.findIndex(r => r.hand === hand)); return 3 + ri * (rowH + labelH); };
      for (const it of items) {
        const y0 = rowY(it.hand);
        const xe = xOfQ(it.t);
        const col = it.status === 'ok' ? 'ok' : it.status === 'near' ? 'near' : 'bad';
        s += `<circle cx="${xe}" cy="${y0 + rowH / 2}" r="10" class="rg-res ${col}"/>`;
        if (it.dt != null) {
          const xt = xe + dxOfQ(it.dt / spqMs);
          s += `<line x1="${xt}" x2="${xt}" y1="${y0 + 2}" y2="${y0 + rowH - 2}" class="rg-tap ${col}"/>`;
        }
      }
      for (const q of extraQ) { const x = xOfQ(q); s += `<line x1="${x}" x2="${x}" y1="5" y2="${rowH}" class="rg-tap extra"/>`; }
      taps.innerHTML = s;
    },
    clearTaps() { taps.innerHTML = ''; },
  };
}

/* ------------------------------------------------------------------ */
/* Exécution : décompte, clics, frappes, évaluation                     */
/* ------------------------------------------------------------------ */
/**
 * Une passe de lecture tapée. Les clics sont planifiés sur l'horloge audio ; l'affichage suit l'instant où le son
 * sort du haut-parleur (performance.now() + latence de sortie), sans minuteries qui dérivent.
 * opts : { qpm, echo, clicks, subClicks: [q…] (subdivisions audibles), countSub, handFilter, hands, onTap, onFrame, onDone }
 */
class RhythmRun {
  constructor(score, opts) { this.score = score; this.o = opts; this.active = false; }
  async start() {
    const sc = this.score, o = this.o;
    await audio.ensure();
    const spq = 60 / o.qpm; // secondes par noire
    const beatSec = sc.beatQ * spq;
    const beatsPerBar = Math.round(sc.barQ / sc.beatQ);
    const echo = !!o.echo;
    const phraseQ = sc.totalQ;
    const pick0 = (sc.pickupQ || 0) * spq; // levée : elle termine le décompte
    this.clickNodes = [];
    // 1. décompte (au moins quatre temps), 2. en écho : le rythme entendu, puis un second décompte, 3. la réponse
    const first = scheduleCountIn({ beatsPerBar, beatSec, sub: o.countSub || 0 });
    this.clickNodes.push(...first.nodes);
    let listenStart = null, answerCount = first, answerStart;
    if (echo) {
      listenStart = first.end - pick0;
      const listenBars = Math.ceil((phraseQ + (sc.pickupQ ? sc.barQ - sc.pickupQ : 0)) / sc.barQ - 1e-6);
      const second = listenStart + pick0 + listenBars * sc.barQ * spq;
      answerCount = scheduleCountIn({ beatsPerBar, beatSec, start: second, sub: o.countSub || 0 });
      this.clickNodes.push(...answerCount.nodes);
      answerStart = answerCount.end - pick0;
      for (const e of sc.events) {
        const v = audio.noteOn(e.hand === 'lh' ? 59 : 76, 78, listenStart + e.t * spq, { owner: 'rhythm' });
        if (v) audio.noteOff(v, listenStart + e.t * spq + Math.min(0.2, e.dur * spq * 0.8));
      }
      // clics pendant l'écoute
      for (let t = listenStart + pick0, k = 0; t < second - 1e-6; t += beatSec, k++) this.clickNodes.push(audio.click(t, k % beatsPerBar === 0 ? 'accent' : 'beat'));
    } else answerStart = first.end - pick0;
    const endAt = answerStart + (phraseQ + sc.beatQ) * spq;
    // clics pendant la réponse (ou rien : le décompte seul)
    if (o.clicks !== false) {
      for (let t = answerStart + pick0, k = 0; t < endAt - beatSec * 0.5; t += beatSec, k++) this.clickNodes.push(audio.click(t, k % beatsPerBar === 0 ? 'accent' : 'beat'));
    }
    for (const q of o.subClicks || []) this.clickNodes.push(audio.click(answerStart + q * spq, 'sub'));
    if (echo) for (const q of o.subClicks || []) this.clickNodes.push(audio.click(listenStart + q * spq, 'sub'));
    this.zeroPerf = audio.ctxToPerf(answerStart);
    this.listenPerf = listenStart != null ? audio.ctxToPerf(listenStart) : null;
    this.spqMs = spq * 1000;
    this.beatMs = beatSec * 1000;
    this.endPerf = audio.ctxToPerf(endAt);
    this.taps = [];
    this.active = true;
    window.__rhythmRun = this; // accès de test (automatisation)
    // frappes : piano (MIDI), écran, clavier ; deux mains : grave / aigu, ou zones gauche / droite, touches F / J
    const split = store.get('settings.split') || 60;
    this.offMidi = midi.on('noteon', ev => { if (this.active) this.tap(ev.time - inputLatency(ev.source), ev.note < split ? 'lh' : 'rh'); });
    this.keyFn = e => {
      if (!this.active) return;
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.tap(performance.now() - inputLatency('key'), 'rh'); }
      else if (e.code === 'KeyF') this.tap(performance.now() - inputLatency('key'), 'lh');
      else if (e.code === 'KeyJ') this.tap(performance.now() - inputLatency('key'), 'rh');
    };
    window.addEventListener('keydown', this.keyFn);
    // affichage : sur l'horloge de l'écran, calée sur la sortie du son
    const frame = () => {
      if (!this.active) return;
      const now = performance.now();
      const c1 = countInPosition(first, now);
      const c2 = echo ? countInPosition(answerCount, now) : null;
      let phase, info;
      if (!c1.done) { phase = 'count'; info = { ...c1, total: first.beats, bars: first.bars }; }
      else if (echo && now < answerCount.perf0) { phase = 'listen'; info = { q: (now - this.listenPerf) / this.spqMs }; }
      else if (echo && !c2.done) { phase = 'count'; info = { ...c2, total: answerCount.beats, bars: answerCount.bars, second: true }; }
      else { phase = 'play'; info = { q: (now - this.zeroPerf) / this.spqMs }; }
      if (info.q != null) info.inBar = Math.floor(((info.q - (sc.pickupQ || 0)) / sc.beatQ) % beatsPerBar + beatsPerBar) % beatsPerBar + 1;
      o.onFrame?.(phase, info, beatsPerBar);
      if (now > this.endPerf + 120) { this.finish(); return; }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }
  tap(time, hand) {
    if (!this.active) return;
    this.taps.push({ time, hand });
    this.o.onTap?.(hand);
  }
  finish() {
    this.clickNodes = []; // passe terminée : les clics sont déjà joués
    this.stop();
    this.o.onDone?.(evaluate(this));
  }
  stop() {
    this.active = false;
    cancelAnimationFrame(this.raf);
    this.offMidi?.();
    if (this.keyFn) window.removeEventListener('keydown', this.keyFn);
    audio.stopAll('rhythm');
    audio.cancelClicks(this.clickNodes); this.clickNodes = [];
  }
}

/** Compare les frappes aux attaques attendues (par main). */
function evaluate(run) {
  const sc = run.score, o = run.o;
  const hands = o.hands || [...sc.handsPresent];
  const okMs = clamp(0.1 * run.beatMs, 40, 70);
  const items = [];
  let extra = 0;
  const extraQ = [];
  for (const hand of hands) {
    // attaques attendues (accords et notes simultanées comptent une fois ; ornements et petites notes exclus)
    const exp = [];
    for (const e of sc.events) {
      if (o.handFilter && e.hand !== o.handFilter) continue;
      if (hands.length > 1 && e.hand !== hand) continue;
      if (e.grace) continue;
      const last = exp[exp.length - 1];
      if (last && Math.abs(last.t - e.t) < 0.02) { if (e.char != null) last.chars.push(e.char); continue; }
      exp.push({ t: e.t, chars: e.char != null ? [e.char] : [], hand });
    }
    const taps = run.taps.filter(t => hands.length === 1 || t.hand === hand).map(t => ({ ...t, used: false }));
    exp.forEach((x, i) => {
      const target = run.zeroPerf + x.t * run.spqMs;
      const prevGap = i > 0 ? (x.t - exp[i - 1].t) * run.spqMs : Infinity;
      const nextGap = i + 1 < exp.length ? (exp[i + 1].t - x.t) * run.spqMs : Infinity;
      const win = Math.min(260, 0.48 * Math.min(prevGap, nextGap));
      let best = -1, bd = Infinity;
      taps.forEach((tp, k) => { if (tp.used) return; const d = tp.time - target; if (Math.abs(d) <= win && Math.abs(d) < Math.abs(bd)) { bd = d; best = k; } });
      if (best >= 0) { taps[best].used = true; items.push({ ...x, dt: bd, status: Math.abs(bd) <= okMs ? 'ok' : Math.abs(bd) <= 2 * okMs ? 'near' : 'late' }); }
      else items.push({ ...x, dt: null, status: 'miss' });
    });
    const unused = taps.filter(t => !t.used);
    extra += unused.length;
    for (const t of unused) extraQ.push((t.time - run.zeroPerf) / run.spqMs);
  }
  items.sort((a, b) => a.t - b.t);
  const hit = items.filter(i => i.dt != null);
  const res = {
    total: items.length, ok: items.filter(i => i.status === 'ok').length, near: items.filter(i => i.status === 'near').length,
    miss: items.filter(i => i.status === 'miss').length, extra, extraQ, items, okMs, spqMs: run.spqMs,
    meanAbs: hit.length ? mean(hit.map(i => Math.abs(i.dt))) : 0, bias: hit.length ? median(hit.map(i => i.dt)) : 0,
  };
  res.score = res.total ? (res.ok + 0.5 * res.near) / res.total : 0;
  return res;
}

/** Conseil ciblé d'après les erreurs de la passe. */
function advice(res, score, helpOn) {
  if (!res.total) return '';
  if (res.miss === res.total) return 'Je n’ai reçu aucune frappe : tape sur une touche du piano, sur la zone, ou sur la barre d’espace, dès « À toi ».';
  const parts = [];
  if (Math.abs(res.bias) > 45 && res.items.filter(i => i.dt != null && Math.sign(i.dt) === Math.sign(res.bias)).length > 0.7 * (res.total - res.miss)) {
    parts.push(res.bias < 0 ? `Tu anticipes presque toutes les notes (${Math.round(-res.bias)} ms en moyenne) : laisse les notes longues durer jusqu’au bout.` : `Tes frappes arrivent régulièrement après le clic (${Math.round(res.bias)} ms) : si le rythme te semblait juste, calibre l’entrée (Réglage du décalage, en bas de page).`);
  }
  const bad = res.items.filter(i => i.status === 'miss' || i.status === 'late');
  if (bad.length) {
    const b = bad[0];
    const offBeat = Math.abs((b.t / score.beatQ) % 1) > 0.02;
    const prev = res.items[res.items.indexOf(b) - 1];
    const gap = prev ? b.t - prev.t : 0;
    if (prev && gap > score.beatQ * 1.01) parts.push('La note qui suit une valeur longue ou un silence arrive mal placée : compte les temps du silence à voix basse.');
    else if (offBeat) parts.push(helpOn ? 'Les notes entre les temps sont les moins sûres : regarde sur la grille sur quelle syllabe elles tombent, et dis-la en tapant.' : 'Les notes entre les temps sont les moins sûres : active « Temps et contretemps » pour voir sur quelle syllabe elles tombent.');
  }
  if (!parts.length) parts.push(res.score >= 0.85 ? 'Très bien : passe au rythme suivant.' : 'Recommence ce rythme plus lentement, en comptant à voix haute.');
  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/* Widget : un exercice de lecture (ou d'écho) tapée                    */
/* ------------------------------------------------------------------ */
export function mountRhythm(el, cfg = {}) {
  const frame = h('div', { class: 'w-frame rhythm' });
  el.append(frame);
  if (cfg.title) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title)));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  let levelId = cfg.level || 1;
  let echo = cfg.mode === 'echo';
  let bpm = cfg.bpm || 66;
  let clicks = cfg.clicks !== false;
  let help = cfg.help ?? !!store.get('rhythm.help');
  let subAudible = !!store.get('rhythm.subAudible');
  let phrase = null, score = null, run = null, player = null, grid = null, model = null;
  const formHost = h('div', { class: 'rhythm-form small' });
  const scoreHost = h('div', { class: 'rhythm-score' });
  const gridHost = h('div', { class: 'rgrid-host' });
  const phaseBox = h('div', { class: 'rhythm-phase', 'aria-live': 'polite' });
  const result = h('div', { class: 'rhythm-result' });
  const pads = h('div', { class: 'rhythm-pads' });
  const ctrl = h('div', { class: 'score-ctrl' });
  const ctrl2 = h('div', { class: 'score-ctrl score-ctrl-2' });
  body.append(formHost, scoreHost, gridHost, phaseBox, pads, result);
  frame.append(h('div', { class: 'w-foot' }, ctrl, ctrl2));

  const idleText = () => (echo ? 'Écoute le rythme, puis rejoue-le après le second décompte.' : 'Lis le rythme en silence (compte les temps), puis touche « Jouer ».');
  const renderScore = () => {
    scoreHost.innerHTML = '';
    const abc = cfg.abc ? cfg.abc : (help && phrase.bars.length ? toAbc(phrase.bars, phrase.meter, phrase.mi, { labels: phrase.labels, lyrics: true }) : phrase.abc);
    score = new Score(scoreHost, abc, { staffwidth: 640 });
    player = new Player(score, {});
    player.on((t, d) => {
      if (t === 'count') showCount(d);
      if (t === 'time' && grid) grid.cursor(d / (60 / (bpm * score.beatQ)) + 0);
      if (t === 'stop') { grid?.cursor(null); setIdle(); listenBtn.textContent = 'Écouter'; }
    });
    model = gridModel(score, { hands: cfg.handFilter ? [cfg.handFilter] : null });
    renderHelp();
  };
  const renderHelp = () => {
    gridHost.innerHTML = '';
    grid = null;
    gridHost.hidden = !help;
    subBtn.hidden = !help;
    if (!help) return;
    grid = renderGrid(gridHost, model);
    gridHost.append(h('p', { class: 'small rgrid-legend' },
      h('i', { class: 'lg beat' }), ' temps', h('i', { class: 'lg off' }), ' contretemps (« et »)', h('i', { class: 'lg sub' }), ' autres subdivisions · ',
      h('b', {}, '●'), ' attaque, ', h('b', {}, '—'), ' note tenue, ', h('b', {}, '·'), ' silence. Dis les syllabes en tapant.'));
  };
  const newPhrase = () => {
    stop();
    if (cfg.abc) phrase = { abc: cfg.abc, level: null, bars: [], labels: null };
    else phrase = genPhrase(levelId, { bars: cfg.bars || (levelId >= 9 ? 2 : 4), meter: cfg.meter });
    formHost.innerHTML = phrase.explain && !cfg.abc ? `<b>La logique de ce rythme</b> : ${esc(phrase.explain)}.` : '';
    renderScore();
    result.innerHTML = '';
    setIdle();
    renderPads();
  };
  const setIdle = () => { phaseBox.innerHTML = ''; phaseBox.dataset.k = ''; phaseBox.append(h('span', { class: 'small' }, idleText())); };
  const renderPads = () => {
    pads.innerHTML = '';
    const two = score && score.handsPresent.size > 1 && !cfg.handFilter;
    const mk = (hand, label) => {
      const p = h('button', { class: 'tap-pad', type: 'button', 'data-hand': hand }, label);
      p.addEventListener('pointerdown', e => { e.preventDefault(); if (run) run.tap((e.timeStamp > 0 ? e.timeStamp : performance.now()) - inputLatency('touch'), hand); });
      return p;
    };
    if (two) pads.append(mk('lh', 'Main gauche (ou touche grave / F)'), mk('rh', 'Main droite (ou touche aiguë / J)'));
    else pads.append(mk('rh', 'Taper ici — ou une touche du piano, ou la barre d’espace'));
  };
  const flash = hand => { const p = pads.querySelector(`[data-hand="${pads.children.length > 1 ? hand : 'rh'}"]`); if (p) { p.classList.add('hit'); setTimeout(() => p.classList.remove('hit'), 90); } };

  /** Décompte : « Décompte », le temps en cours en grand, et un point par temps (deux mesures : deux groupes). */
  const showCount = (pos, label = 'Décompte') => {
    if (!pos) return;
    const key = `c${pos.second ? 2 : 1}:${pos.beat}`;
    if (phaseBox.dataset.k === key) return;
    phaseBox.dataset.k = key;
    phaseBox.innerHTML = '';
    const total = pos.total || 4;
    const per = Math.round(total / (pos.bars || 1));
    const dots = h('span', { class: 'ph-dots', 'aria-hidden': 'true' });
    for (let i = 0; i < total; i++) {
      if (i && i % per === 0) dots.append(h('span', { class: 'ph-sep' }));
      dots.append(h('i', { class: (i < pos.beat ? 'past' : i === pos.beat ? 'now' : '') + (i % per === 0 ? ' strong' : '') }));
    }
    phaseBox.append(h('span', { class: 'ph-label count' }, pos.waiting ? 'Prépare-toi' : pos.second ? 'Décompte, puis à toi' : label),
      h('span', { class: 'ph-beat' }, pos.waiting ? '…' : String(pos.inBar)), dots);
  };

  const stop = () => {
    run?.stop(); run = null;
    player?.stop();
    grid?.cursor(null);
    goBtn.textContent = 'Jouer'; goBtn.classList.remove('on');
  };
  /** Subdivisions audibles (aide) : une petite note à chaque case de la grille qui n'est pas un temps. */
  const subQs = () => {
    if (!help || !subAudible || !model) return [];
    const qs = [];
    for (const b of model.rows[0].beats) for (let k = 1; k < b.sub; k++) qs.push(b.q + (k * model.beatQ) / b.sub);
    return qs;
  };
  const countSub = () => (help && subAudible && model ? (model.rows[0].beats[0]?.sub || 2) : 0);

  const goBtn = h('button', { class: 'btn primary', type: 'button' }, 'Jouer');
  goBtn.addEventListener('click', async () => {
    if (run) { stop(); setIdle(); return; }
    player?.stop();
    score.clear();
    grid?.clearTaps();
    result.innerHTML = '';
    goBtn.textContent = 'Arrêter'; goBtn.classList.add('on');
    run = new RhythmRun(score, {
      qpm: bpm * score.beatQ, echo, clicks, handFilter: cfg.handFilter,
      hands: cfg.handFilter ? [cfg.handFilter] : null,
      subClicks: subQs(), countSub: countSub(),
      onTap: flash,
      onFrame: (phase, info) => {
        if (phase === 'count') { showCount(info); grid?.cursor(null); return; }
        if (phase === 'listen') grid?.cursor(info.q);
        if (phase === 'play') grid?.cursor(info.q);
        const label = phase === 'listen' ? 'Écoute' : 'À toi !';
        const key = phase + info.inBar;
        if (phaseBox.dataset.k !== key) {
          phaseBox.dataset.k = key;
          phaseBox.innerHTML = '';
          phaseBox.append(h('span', { class: 'ph-label ' + phase }, label), h('span', { class: 'ph-beat' }, String(Math.max(1, info.inBar || 1))));
        }
      },
      onDone: res => {
        run = null;
        goBtn.textContent = 'Jouer'; goBtn.classList.remove('on');
        grid?.cursor(null);
        setIdle();
        for (const it of res.items) for (const c of it.chars) score.mark(c, it.status === 'ok' ? 'n-ok' : it.status === 'near' ? 'n-late' : 'n-bad');
        grid?.showTaps(res.items, res.spqMs, res.extraQ);
        result.innerHTML = '';
        const strip = h('div', { class: 'result-strip' },
          h('span', {}, 'À l’heure ', h('b', {}, `${res.ok}/${res.total}`)),
          res.near ? h('span', {}, 'Presque ', h('b', {}, String(res.near))) : null,
          h('span', {}, 'Écart moyen ', h('b', {}, `${Math.round(res.meanAbs)} ms`)),
          res.extra ? h('span', {}, 'Frappes en trop ', h('b', {}, String(res.extra))) : null);
        result.append(strip, h('p', { class: 'small mb-0' }, help ? 'Sur la partition et sur la grille : vert à l’heure, orange un peu décalé, rouge manqué ou très décalé. Sur la grille, le trait montre où tu as tapé.' : 'Vert : à l’heure · orange : un peu décalé · rouge : manqué ou très décalé. « Temps et contretemps » montre où tombait chaque frappe.'), h('div', { class: 'verdict mt-1' }, advice(res, score, help)));
        if (cfg.stat || phrase.level) {
          const st = store.get('rhythm') || {};
          const key = cfg.stat || `lvl${phrase.level}`;
          const arr = (st[key] || []).concat([{ at: Date.now(), s: Math.round(res.score * 100) / 100, bpm }]).slice(-20);
          store.set('rhythm', { ...st, [key]: arr });
          cfg.onResult?.(res, key);
        }
      },
    });
    await run.start();
  });
  const listenBtn = h('button', { class: 'btn', type: 'button' }, 'Écouter');
  listenBtn.addEventListener('click', async () => {
    if (player.playing) { player.stop(); return; }
    stop();
    player.set({ qpm: bpm * score.beatQ, click: true, countIn: true, countSub: countSub(), hands: cfg.handFilter || 'both' });
    try { await player.play(); listenBtn.textContent = 'Arrêter'; } catch (e) { phaseBox.textContent = 'Audio indisponible : ' + e.message; }
  });
  const nextBtn = h('button', { class: 'btn', type: 'button' }, 'Autre rythme');
  nextBtn.addEventListener('click', newPhrase);
  const out = h('output', {}, `♩ = ${bpm}`);
  const rng = h('input', { type: 'range', min: 40, max: 140, value: bpm, step: 2, 'aria-label': 'Tempo' });
  rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = `${score && score.beatQ === 1.5 ? '♩.' : '♩'} = ${bpm}`; });
  const echoBtn = h('button', { class: 'btn sm' + (echo ? ' on' : ''), type: 'button', title: 'Écouter d’abord, puis rejouer de mémoire' }, 'Écouter d’abord');
  echoBtn.addEventListener('click', () => { echo = !echo; echoBtn.classList.toggle('on', echo); setIdle(); });
  const clickBtn = h('button', { class: 'btn sm' + (clicks ? ' on' : ''), type: 'button', title: 'Clics pendant la lecture (sinon : décompte seulement)' }, 'Clic');
  clickBtn.addEventListener('click', () => { clicks = !clicks; clickBtn.classList.toggle('on', clicks); });
  const helpBtn = h('button', { class: 'btn sm' + (help ? ' on' : ''), type: 'button', title: 'Afficher les temps, les contretemps et les syllabes à dire' }, 'Temps et contretemps');
  helpBtn.addEventListener('click', () => { help = !help; helpBtn.classList.toggle('on', help); store.set('rhythm.help', help); stop(); renderScore(); setIdle(); });
  const subBtn = h('button', { class: 'btn sm' + (subAudible ? ' on' : ''), type: 'button', title: 'Faire entendre les subdivisions (petits clics entre les temps)' }, 'Subdivisions audibles');
  subBtn.addEventListener('click', () => { subAudible = !subAudible; subBtn.classList.toggle('on', subAudible); store.set('rhythm.subAudible', subAudible); });
  ctrl.append(...[goBtn, listenBtn, cfg.abc ? null : nextBtn, h('label', { class: 'range' }, 'Tempo', rng, out)].filter(Boolean));
  ctrl2.append(helpBtn, subBtn, echoBtn, clickBtn);
  newPhrase();
  if (score && score.beatQ === 1.5) out.textContent = `♩. = ${bpm}`;
  const api = { setLevel: id => { levelId = id; newPhrase(); }, destroy: () => stop() };
  el._rhythm = api;
  return () => stop();
}

/* ------------------------------------------------------------------ */
/* Dictée : écouter, puis reconnaître la bonne écriture                 */
/* ------------------------------------------------------------------ */
export function mountDictation(el, cfg = {}) {
  const frame = h('div', { class: 'w-frame' });
  el.append(frame);
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Dictée rythmique'), h('span', { class: 'w-sub' }, 'écoute, puis choisis l’écriture')));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  let levelId = cfg.level || 2;
  let correct = 0, total = 0;
  const players = [];
  const render = () => {
    players.forEach(p => p.stop());
    players.length = 0;
    body.innerHTML = '';
    const base = genPhrase(levelId, { bars: 2 });
    // deux variantes qui diffèrent d'une cellule de même durée
    const L = levelById(levelId);
    const variants = [base];
    for (let k = 0; k < 12 && variants.length < 3; k++) {
      const bars = base.bars.map(b => b.slice());
      const bi = Math.floor(Math.random() * bars.length);
      const ci = Math.floor(Math.random() * bars[bi].length);
      const alt = weightedPick(L.cells);
      if (!alt || alt === bars[bi][ci] || Math.abs(cellLen(alt) - cellLen(bars[bi][ci])) > 1e-9) continue;
      bars[bi][ci] = alt;
      const abc = toAbc(bars, base.meter, base.mi);
      if (!variants.some(v => v.abc === abc)) variants.push({ ...base, bars, abc });
    }
    const order = shuffle(variants.map((v, i) => ({ v, i })));
    const hidden = h('div', { style: { display: 'none' } });
    body.append(hidden);
    const ref = new Score(hidden, base.abc, {});
    const pl = new Player(ref, {}); players.push(pl);
    const play = h('button', { class: 'btn primary', type: 'button' }, 'Écouter le rythme');
    play.addEventListener('click', async () => { pl.set({ qpm: (cfg.bpm || 72) * ref.beatQ, click: true, countIn: true }); try { await pl.play(); } catch (e) { /* */ } });
    const fb = h('div', { class: 'quiz-feedback' });
    const grid = h('div', { class: 'grid cols-3' });
    order.forEach(({ v, i }, k) => {
      const card = h('button', { class: 'card dict-choice', type: 'button', 'aria-label': `Choix ${'ABC'[k]}` }, h('div', { class: 'eyebrow' }, 'ABC'[k]));
      const host = h('div');
      card.append(host);
      grid.append(card);
      requestAnimationFrame(() => { try { window.ABCJS.renderAbc(host, v.abc, { responsive: 'resize', staffwidth: 300, scale: 0.9, paddingtop: 0, paddingbottom: 0 }); } catch (e) { /* */ } });
      card.addEventListener('click', () => {
        if (fb.dataset.done) return;
        fb.dataset.done = '1'; total++;
        const ok = i === 0;
        if (ok) correct++;
        card.classList.add(ok ? 'right' : 'wrong');
        if (!ok) grid.children[order.findIndex(o => o.i === 0)].classList.add('right');
        fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
        fb.textContent = (ok ? 'Oui. ' : 'Non : la bonne écriture est encadrée en vert. ') + `Score : ${correct}/${total}.`;
        next.hidden = false;
      });
    });
    const next = h('button', { class: 'btn', type: 'button', hidden: true }, 'Rythme suivant');
    next.addEventListener('click', render);
    body.append(h('div', { class: 'btn-row' }, play), grid, fb, next);
  };
  render();
  return () => players.forEach(p => p.stop());
}

/* ------------------------------------------------------------------ */
/* Calibration d'une entrée (piano, écran, clavier)                     */
/* ------------------------------------------------------------------ */
export function mountCalibration(el, { onDone } = {}) {
  const box = h('div', { class: 'calib' });
  const info = h('p', { class: 'small mb-0' });
  const by = () => store.get('settings.latencyBy') || {};
  const label = () => `Décalages mesurés : piano ${by().midi ?? 0} ms · écran ${by().touch ?? 0} ms · clavier ${by().key ?? 0} ms.`;
  const cur = h('p', { class: 'small mt-0' }, label());
  const pad = h('button', { class: 'tap-pad', type: 'button', hidden: true }, 'Tape ici avec chaque clic');
  const mk = (src, txt) => {
    const b = h('button', { class: 'btn sm', type: 'button' }, txt);
    b.addEventListener('click', () => run(src));
    return b;
  };
  const run = async (src) => {
    await audio.ensure();
    const bpm = 80, n = 8, beat = 60 / bpm;
    const t0 = audio.now() + 0.6;
    const clicks = [];
    for (let i = 0; i < n; i++) { audio.click(t0 + i * beat, i === 0 ? 'accent' : 'beat'); clicks.push(audio.ctxToPerf(t0 + i * beat)); }
    const offs = [];
    const add = t => { const near = clicks.reduce((b, c) => (Math.abs(c - t) < Math.abs(b - t) ? c : b), clicks[0]); if (Math.abs(near - t) < 300) offs.push(t - near); };
    let offMidi = null, keyFn = null, padFn = null;
    if (src === 'midi') offMidi = midi.on('noteon', ev => add(ev.time));
    if (src === 'key') { keyFn = e => { if (e.code === 'Space') { e.preventDefault(); add(performance.now()); } }; window.addEventListener('keydown', keyFn); }
    if (src === 'touch') { pad.hidden = false; padFn = e => { e.preventDefault(); add(e.timeStamp > 0 ? e.timeStamp : performance.now()); }; pad.addEventListener('pointerdown', padFn); }
    info.textContent = { midi: 'Joue une même note du piano en même temps que chacun des 8 clics…', touch: 'Tape la zone en même temps que chacun des 8 clics…', key: 'Appuie sur la barre d’espace avec chacun des 8 clics…' }[src];
    setTimeout(() => {
      offMidi?.(); if (keyFn) window.removeEventListener('keydown', keyFn); if (padFn) { pad.removeEventListener('pointerdown', padFn); pad.hidden = true; }
      if (offs.length < 5) { info.textContent = 'Pas assez de frappes captées : recommence.'; return; }
      offs.sort((a, b) => a - b);
      const med = Math.round(offs[Math.floor(offs.length / 2)] / 5) * 5;
      const spread = Math.round(offs[offs.length - 2] - offs[1]);
      store.set('settings.latencyBy', { ...by(), [src]: med });
      info.textContent = `Décalage réglé à ${med} ms${spread > 80 ? ` (frappes assez dispersées : ${spread} ms ; recommence pour confirmer)` : ''}.`;
      cur.textContent = label();
      onDone?.(src, med);
    }, 600 + n * beat * 1000 + 700);
  };
  box.append(cur, h('div', { class: 'btn-row' }, mk('midi', 'Calibrer le piano'), mk('touch', 'Calibrer l’écran'), mk('key', 'Calibrer le clavier')), pad, info);
  el.append(box);
  return () => {};
}

/* ------------------------------------------------------------------ */
/* Test des clics au micro : la tablette joue-t-elle les clics à l'heure ? */
/* ------------------------------------------------------------------ */
export function mountClickTest(el) {
  const out = h('p', { class: 'small mb-0' });
  const btn = h('button', { class: 'btn sm', type: 'button' }, 'Tester la régularité des clics (micro)');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      await audio.ensure();
      const ctx = audio.ctx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(1024, 1, 1);
      const onsets = [];
      let last = -1, armed = true, noise = 0.002;
      proc.onaudioprocess = e => {
        const d = e.inputBuffer.getChannelData(0);
        const tBlock = e.playbackTime ?? ctx.currentTime;
        for (let i = 0; i < d.length; i++) {
          const a = Math.abs(d[i]);
          noise = noise * 0.9995 + a * 0.0005;
          const t = tBlock + i / ctx.sampleRate;
          if (armed && a > Math.max(0.05, noise * 12) && t - last > 0.25) { onsets.push(t); last = t; armed = false; }
          if (!armed && t - last > 0.1) armed = true;
        }
      };
      src.connect(proc); proc.connect(ctx.destination);
      const n = 16, step = 0.5;
      const t0 = ctx.currentTime + 0.5;
      for (let i = 0; i < n; i++) audio.click(t0 + i * step, 'accent');
      out.textContent = 'Écoute en cours : laisse la tablette jouer les 16 clics, sans bruit autour…';
      await new Promise(r => setTimeout(r, (0.5 + n * step + 0.6) * 1000));
      proc.disconnect(); src.disconnect(); stream.getTracks().forEach(t => t.stop());
      const iois = [];
      for (let i = 1; i < onsets.length; i++) iois.push((onsets[i] - onsets[i - 1]) * 1000);
      const good = iois.filter(x => Math.abs(x - step * 1000) < 120);
      if (good.length < 8) { out.textContent = `Seulement ${onsets.length} clics entendus par le micro : monte le volume du métronome et recommence.`; return; }
      const sd = Math.sqrt(mean(good.map(x => (x - mean(good)) ** 2)));
      out.innerHTML = `${good.length + 1} clics entendus · écart-type des intervalles <b>${fmtNum(sd, 1)} ms</b> — ${sd < 5 ? 'les clics sont réguliers : si le rythme te semble inégal, le problème vient d’ailleurs (affichage, calibration).' : sd < 12 ? 'légère irrégularité (charge de la tablette ?) : ferme les autres applis et recommence.' : 'clics irréguliers : la tablette n’arrive pas à jouer le son à temps. Ferme les autres applis, désactive l’économie d’énergie, puis recommence.'}`;
    } catch (e) {
      out.textContent = 'Test impossible : ' + (e.message || 'accès au micro refusé');
    } finally { btn.disabled = false; }
  });
  el.append(h('div', {}, btn, out));
  return () => {};
}

/* ------------------------------------------------------------------ */
/* Page « Rythme » : progression, dictée, rythmes des pièces, compter   */
/* ------------------------------------------------------------------ */
// Rythmes tirés des extraits de tes pièces : on tape le rythme d'une main, les hauteurs ne comptent pas.
const PIECE_RHYTHMS = [
  { piece: 'OP55', key: 'e5', hand: 'rh', bpm: 44, label: 'Op. 55 n° 1, m. 27-28 — main droite : triolets' },
  { piece: 'OP55', key: 'e9', hand: 'rh', bpm: 44, label: 'Op. 55 n° 1, m. 77-80 — main droite : triolets « molto legato »' },
  { piece: 'OP55', key: 'e7', hand: 'lh', bpm: 56, label: 'Op. 55 n° 1, m. 57-60 — main gauche : arpèges en triolets' },
  { piece: 'OP15', key: 'e1', hand: 'lh', bpm: 56, label: 'Op. 15 n° 1, m. 1-8 — main gauche : triolets d’accompagnement' },
  { piece: 'OP15', key: 'e1', hand: 'rh', bpm: 56, label: 'Op. 15 n° 1, m. 1-8 — main droite : la mélodie' },
  { piece: 'CLAIR', key: 'e1', hand: 'rh', bpm: 32, label: 'Clair de lune, m. 1-4 — main droite : 9/8, liaisons et duolets' },
];

export const RHYTHM_PROGRESS_KEY = 'rhythm';

/** Niveau réussi : au moins 3 rythmes à ≥ 85 % parmi les 5 derniers. */
export function levelStatus(id) {
  const st = store.get('rhythm') || {};
  const arr = (st[`lvl${id}`] || []).slice(-5);
  const good = arr.filter(r => r.s >= 0.85).length;
  return { done: !!(st.validated && st.validated[id]), tries: (st[`lvl${id}`] || []).length, good };
}

export function mountRhythmPage(el) {
  const st0 = store.get('rhythm') || {};
  let current = st0.level || 1;
  let cleanup = [];
  const tabs = h('div', { class: 'seg', role: 'tablist', 'aria-label': 'Exercices de rythme' });
  const pane = h('div');
  const chips = h('div', { class: 'lvl-chips', role: 'group', 'aria-label': 'Niveaux' });
  const intro = h('div', { class: 'callout tip lvl-intro' });
  const banner = h('div');
  el.append(chips, intro, banner, h('div', { class: 'section-title' }, tabs), pane);

  const renderChips = () => {
    chips.innerHTML = '';
    for (const L of LEVELS) {
      const s = levelStatus(L.id);
      const b = h('button', { type: 'button', class: 'lvl-chip' + (L.id === current ? ' on' : '') + (s.done ? ' done' : ''), title: L.title }, s.done ? `✓ ${L.id}` : String(L.id));
      b.addEventListener('click', () => { current = L.id; store.set('rhythm', { ...(store.get('rhythm') || {}), level: current }); renderChips(); renderIntro(); show(activeTab); });
      chips.append(b);
    }
  };
  const renderIntro = () => {
    const L = levelById(current);
    intro.innerHTML = `<div class="c-title">Niveau ${L.id} — ${esc(L.title)}</div>${L.intro}`;
    banner.innerHTML = '';
  };
  const onResult = (res, key) => {
    const L = levelById(current);
    const s = levelStatus(L.id);
    if (!s.done && s.good >= 3) {
      const st = store.get('rhythm') || {};
      store.set('rhythm', { ...st, validated: { ...(st.validated || {}), [L.id]: new Date().toISOString() } });
      renderChips();
      const next = LEVELS.find(x => x.id === L.id + 1);
      banner.innerHTML = '';
      const box = h('div', { class: 'callout key' }, h('div', { class: 'c-title' }, `Niveau ${L.id} réussi`), h('p', {}, '3 rythmes à 85 % ou plus sur les 5 derniers.'));
      if (next) { const go = h('button', { class: 'btn primary sm', type: 'button' }, `Passer au niveau ${next.id} : ${next.title}`); go.addEventListener('click', () => { current = next.id; store.set('rhythm', { ...(store.get('rhythm') || {}), level: current }); renderChips(); renderIntro(); show('read'); }); box.append(go); }
      banner.append(box);
    }
  };

  const TABS = [['read', 'Lire et taper'], ['dict', 'Dictée'], ['pieces', 'Tes pièces'], ['count', 'Compter']];
  let activeTab = 'read';
  const show = (id) => {
    activeTab = id;
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === id));
    cleanup.forEach(f => { try { f(); } catch (e) { /* */ } }); cleanup = [];
    pane.innerHTML = '';
    const host = h('div', { class: 'w' });
    pane.append(host);
    if (id === 'read') {
      cleanup.push(mountRhythm(host, { level: current, title: `Niveau ${current} : lire puis taper`, onResult }));
      pane.append(h('p', { class: 'small' }, 'Tape sur une touche du piano (le plus précis), sur la zone à l’écran ou sur la barre d’espace. Quand un rythme résiste : « Temps et contretemps » affiche la grille des temps, les syllabes à dire sous chaque note et, après la passe, l’endroit exact de chaque frappe ; « Subdivisions audibles » fait entendre les « et ». « Écouter d’abord » transforme l’exercice en écho : utile pour entendre un rythme nouveau, mais la lecture reste l’objectif.'));
    } else if (id === 'dict') {
      cleanup.push(mountDictation(host, { level: Math.min(current, 9), title: `Dictée — niveau ${Math.min(current, 9)}` }));
    } else if (id === 'pieces') {
      const list = h('div', { class: 'grid cols-2' });
      const exHost = h('div', { class: 'w mt-2' });
      for (const it of PIECE_RHYTHMS) {
        const c = h('button', { class: 'card', type: 'button', style: { textAlign: 'left', cursor: 'pointer', font: 'inherit' } }, h('h3', {}, it.label.split(' — ')[0]), h('p', {}, it.label.split(' — ')[1]));
        c.addEventListener('click', async () => {
          cleanup.forEach(f => { try { f(); } catch (e) { /* */ } }); cleanup = [];
          const ex = await import('./content-excerpts.js');
          exHost.innerHTML = '';
          cleanup.push(mountRhythm(exHost, { abc: ex[it.piece][it.key], handFilter: it.hand, bpm: it.bpm, title: it.label, stat: `piece:${it.piece}.${it.key}.${it.hand}` }));
          exHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        list.append(c);
      }
      host.append(h('p', { class: 'small mt-0' }, 'Tape le rythme d’une seule main sur une touche : les hauteurs ne comptent pas. Les petites notes et les trilles ne se tapent pas.'), list, exHost);
    } else if (id === 'count') {
      import('./tool-ear.js').then(m => {
        if (activeTab !== 'count') return;
        cleanup.push(m.mountQuiz(host, { kind: 'measurefill', values: ['w', 'hd', 'h', 'q', 'e'], meters: ['2/4', '3/4', '4/4'], title: 'Compléter la mesure', count: 10, stat: 'mfill' }));
      });
    }
  };
  for (const [id, label] of TABS) {
    const b = h('button', { type: 'button', role: 'tab', 'data-t': id }, label);
    b.addEventListener('click', () => show(id));
    tabs.append(b);
  }
  // Réglage du décalage (repliable)
  const det = h('details', { class: 'card mt-3' }, h('summary', {}, h('b', {}, 'Réglage du décalage (latence)')));
  det.append(h('p', { class: 'small' }, 'Chaque entrée a son propre retard : piano en Bluetooth, écran tactile, clavier. Si tes frappes sont jugées en retard alors que tu es en rythme, calibre l’entrée que tu utilises.'));
  mountCalibration(det);
  el.append(det);

  renderChips(); renderIntro(); show('read');
  return () => cleanup.forEach(f => { try { f(); } catch (e) { /* */ } });
}

/* ------------------------------------------------------------------ */
/* Une minute de rythme : l'échauffement de la lecture à vue (V7.1)      */
/* ------------------------------------------------------------------ */
const minuteDur = () => (typeof window !== 'undefined' && window.__nsDuration) || 60; // durée réduite pour les tests
/**
 * Des rythmes d'une mesure, puis de deux, au niveau choisi dans l'onglet Rythme : décompte, puis on tape chaque note
 * au clic en comptant à voix haute. Deux réussites de suite : deux mesures, puis le tempo monte ; un échec net : retour
 * à une mesure, tempo plus lent.
 */
export function mountRhythmMinute(el, opts = {}) {
  const st0 = store.get('rhythm') || {};
  const L = levelById(Math.min(9, st0.level || 1)); // le niveau 10 (deux mains) se travaille dans l'onglet
  let bpm = clamp(st0.warmBpm || 60, 44, 100);
  const frame = h('div', { class: 'w-frame rhythm rminute' + (opts.bare ? ' ns-bare' : '') });
  if (!opts.bare) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Une minute de rythme'), h('span', { class: 'w-sub' }, `niveau ${L.id}`)));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  const info = h('p', { class: 'small ns-info' });
  const startBtn = h('button', { class: 'btn primary', type: 'button' }, 'Commencer (1 minute)');
  const idle = h('div', {}, info, h('div', { class: 'btn-row' }, startBtn));
  const counter = h('div', { class: 'ns-count' });
  const stopBtn = h('button', { class: 'btn ghost sm', type: 'button' }, 'Arrêter');
  const timeBar = h('div', { class: 'progress ns-time' }, h('i'));
  const scoreHost = h('div', { class: 'rhythm-score rm-score' });
  const phaseBox = h('div', { class: 'rhythm-phase', 'aria-live': 'polite' });
  const itemFb = h('div', { class: 'ns-fb rm-fb' });
  const pad = h('button', { class: 'tap-pad', type: 'button', 'data-hand': 'rh' }, 'Taper ici — ou une touche du piano, ou la barre d’espace');
  const stage = h('div', { hidden: true }, h('div', { class: 'ns-top' }, counter, stopBtn), timeBar, scoreHost, phaseBox, h('div', { class: 'rhythm-pads' }, pad), itemFb);
  const results = h('div', { class: 'ns-results', hidden: true });
  body.append(idle, stage, results);

  const unit = () => (L.compound ? '♩.' : '♩');
  const renderIdle = () => {
    info.innerHTML = `Niveau ${L.id} de l’onglet Rythme (${esc(L.title.toLowerCase())}), ${unit()} = ${bpm}. Des rythmes d’une mesure, puis de deux : après le décompte, tape chaque note au clic en <b>comptant à voix haute</b> (« 1 et 2 et… »). Deux réussites de suite : le rythme s’allonge, puis le tempo monte.`;
  };
  let running = false, run = null, score = null, t0 = 0, raf = 0, timers = [], session = null, bars = 1, streak = 0;
  pad.addEventListener('pointerdown', e => { e.preventDefault(); run?.tap((e.timeStamp > 0 ? e.timeStamp : performance.now()) - inputLatency('touch'), 'rh'); });
  const flash = () => { pad.classList.add('hit'); setTimeout(() => pad.classList.remove('hit'), 90); };
  const showPhase = (phase, inf) => {
    const key = `${phase}:${inf.waiting ? 'w' : inf.inBar}`;
    if (phaseBox.dataset.k === key) return;
    phaseBox.dataset.k = key;
    phaseBox.innerHTML = '';
    if (phase === 'count') phaseBox.append(h('span', { class: 'ph-label count' }, inf.waiting ? 'Prépare-toi' : 'Décompte'), h('span', { class: 'ph-beat' }, inf.waiting ? '…' : String(inf.inBar)));
    else phaseBox.append(h('span', { class: 'ph-label play' }, 'À toi !'), h('span', { class: 'ph-beat' }, String(Math.max(1, inf.inBar || 1))));
  };
  const showCounter = () => { counter.innerHTML = `<b>${session.good}</b> réussi${session.good > 1 ? 's' : ''} · ${session.items.length} rythme${session.items.length > 1 ? 's' : ''}`; };
  const tick = () => {
    if (!running) return;
    const left = Math.max(0, minuteDur() - (performance.now() - t0) / 1000);
    timeBar.firstChild.style.width = `${left / minuteDur() * 100}%`;
    timeBar.classList.toggle('low', left < 10);
    raf = requestAnimationFrame(tick);
  };
  const nextItem = async () => {
    if (!running) return;
    if ((performance.now() - t0) / 1000 >= minuteDur()) { finish(true); return; }
    const phrase = genPhrase(L.id, { bars });
    scoreHost.innerHTML = '';
    score = new Score(scoreHost, phrase.abc, { staffwidth: bars === 1 ? 300 : 520 });
    itemFb.textContent = ''; itemFb.className = 'ns-fb rm-fb';
    phaseBox.dataset.k = '';
    const sc = score;
    const r = new RhythmRun(sc, { qpm: bpm * sc.beatQ, clicks: true, onTap: flash, onFrame: showPhase, onDone: res => done(res, sc) });
    run = r;
    await r.start();
    if (!running) r.stop(); // arrêté pendant la mise en route du son
  };
  const done = (res, sc) => {
    run = null;
    if (!running) return;
    for (const it of res.items) for (const c of it.chars) sc.mark(c, it.status === 'ok' ? 'n-ok' : it.status === 'near' ? 'n-late' : 'n-bad');
    const good = res.score >= 0.85 && res.extra <= 1;
    session.items.push({ res, sc, good, bars, bpm });
    if (good) { session.good++; streak++; } else streak = 0;
    if (good && streak >= 2) { if (bars === 1) bars = 2; else bpm = Math.min(100, bpm + 4); streak = 0; }
    if (res.score < 0.6) { bpm = Math.max(44, bpm - 4); bars = 1; streak = 0; }
    itemFb.className = 'ns-fb rm-fb ' + (good ? 'ok' : 'bad');
    itemFb.textContent = good ? `✓ ${res.ok}/${res.total} à l’heure` : `${res.ok}/${res.total} à l’heure${res.extra ? ` · ${res.extra} frappe${res.extra > 1 ? 's' : ''} en trop` : ''}`;
    showCounter();
    phaseBox.innerHTML = ''; phaseBox.dataset.k = '';
    timers.push(setTimeout(nextItem, 1400));
  };
  const start = async () => {
    if (running) return;
    try { await audio.ensure(); } catch (e) { /* */ }
    session = { items: [], good: 0 };
    bars = 1; streak = 0;
    running = true;
    idle.hidden = true; results.hidden = true; stage.hidden = false;
    showCounter();
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
    nextItem();
  };
  const stop = () => {
    running = false;
    run?.stop(); run = null;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout); timers = [];
  };
  const finish = complete => {
    const elapsed = (performance.now() - t0) / 1000;
    stop();
    stage.hidden = true; idle.hidden = false;
    if (!complete || !session || !session.items.length || elapsed < Math.min(20, minuteDur())) { results.hidden = true; renderIdle(); return; }
    const its = session.items;
    const ok = its.reduce((a, x) => a + x.res.ok, 0), total = its.reduce((a, x) => a + x.res.total, 0);
    const hit = its.filter(x => x.res.meanAbs > 0);
    const meanAbs = hit.length ? hit.reduce((a, x) => a + x.res.meanAbs, 0) / hit.length : 0;
    const st = store.get('rhythm') || {};
    store.set('rhythm', { ...st, warmBpm: bpm, warm: (st.warm || []).concat({ at: Date.now(), level: L.id, n: its.length, good: session.good, ok, total, bpm }).slice(-60) });
    const worst = its.slice().sort((a, b) => a.res.score - b.res.score)[0];
    results.innerHTML = '';
    results.append(h('h4', { class: 'an-sub' }, 'Résultat'), h('div', { class: 'an-grid' },
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Rythmes réussis'), h('div', { class: 'v' }, `${session.good}/${its.length}`)),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Attaques à l’heure'), h('div', { class: 'v' }, fmtPct(total ? ok / total : 0))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Écart moyen'), h('div', { class: 'v' }, `${Math.round(meanAbs)} ms`))));
    const tip = worst && !worst.good ? advice(worst.res, worst.sc, false).replace('active « Temps et contretemps »', 'dans l’onglet Rythme, active « Temps et contretemps »') : 'Très bien. Demain, le tempo repart de là où tu l’as laissé.';
    results.append(h('p', { class: 'small' }, `${tip} Tempo de départ la prochaine fois : ${unit()} = ${bpm}.`));
    results.hidden = false;
    renderIdle();
    opts.onFinish?.({ good: session.good, n: its.length, acc: total ? ok / total : 0 });
  };
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', () => finish(false));
  renderIdle();
  return () => stop();
}
