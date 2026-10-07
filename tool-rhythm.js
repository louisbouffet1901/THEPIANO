// Onglet Rythme : lire le rythme (compter, subdiviser, placer chaque attaque).
// Une progression en dix niveaux, des rythmes construits comme des phrases (motif, variante, réponse, cadence),
// la lecture tapée (piano, écran ou barre d'espace), l'écho, la dictée, les deux mains et les rythmes des pièces.
import { h, esc, pick, shuffle, fmtPct, fmtNum, clamp, mean, median } from './util.js';
import { Score, Player } from './score.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { inputLatency } from './latency.js';

/* ------------------------------------------------------------------ */
/* Cellules rythmiques (en doubles croches ; « r » = silence)           */
/* ------------------------------------------------------------------ */
// Chaque cellule remplit un temps (4 doubles croches en mesure simple, 6 en mesure composée), sauf mention.
const CELLS = {
  q: [4], qr: ['r4'], ee: [2, 2], er_e: ['r2', 2], ssss: [1, 1, 1, 1], e_ss: [2, 1, 1], ss_e: [1, 1, 2],
  s_e_s: [1, 2, 1], ds: [3, 1], sd: [1, 3], sr_sss: ['r1', 1, 1, 1], trip: ['t', 2, 2, 2],
  // deux temps
  h: [8], hd: [12], w: [16], qd_e: [6, 2], e_q_e: [2, 4, 2], q_tie: ['tie'],
  // mesure composée (temps = noire pointée = 6 doubles croches)
  eee: [2, 2, 2], qe: [4, 2], eq: [2, 4], qdot: [6], qdr: ['r6'], e_ss_e: [2, 1, 1, 2], ssss_e: [1, 1, 1, 1, 2], er_ee: ['r2', 2, 2],
};
const TWO_BEAT = new Set(['h', 'qd_e', 'e_q_e']);

/* Niveaux : de la noire aux polyrythmies. */
export const LEVELS = [
  { id: 1, title: 'Noires, blanches, rondes', meters: ['4/4', '3/4', '2/4'], cells: { q: 5, h: 3, qr: 2 }, focus: ['h', 'qr'], end: 'h',
    intro: '<p>Compte les temps à voix basse (« 1, 2, 3, 4 ») et garde-les pendant les notes longues : une blanche dure deux temps, une ronde quatre. Un soupir est un temps compté en silence.</p>' },
  { id: 2, title: 'Les croches', meters: ['4/4', '3/4', '2/4'], cells: { q: 4, ee: 5, h: 2, qr: 1 }, focus: ['ee'], end: 'h',
    intro: '<p>Deux croches dans un temps : compte « 1 et 2 et ». La deuxième croche tombe sur le « et », exactement au milieu du temps.</p>' },
  { id: 3, title: 'Noire pointée, contretemps, syncope', meters: ['4/4', '3/4'], cells: { q: 3, ee: 3, qd_e: 4, er_e: 3, e_q_e: 2 }, focus: ['qd_e', 'er_e', 'e_q_e'], end: 'h',
    intro: '<p>La noire pointée dure un temps et demi : la croche qui suit tombe sur le « et » du temps suivant. Un demi-soupir suivi d’une croche : le temps est muet, la note arrive sur le « et ». Dans la syncope croche – noire – croche, la noire commence sur un « et » et dure jusqu’au « et » suivant.</p>' },
  { id: 4, title: 'Les liaisons', meters: ['4/4', '3/4'], cells: { q: 3, ee: 3, q_tie: 3, h: 2 }, focus: ['q_tie'], end: 'h',
    intro: '<p>Une liaison prolonge la première note : on ne rejoue pas la seconde. Compte toujours les temps, la liaison ne fait que « cacher » une attaque.</p>' },
  { id: 5, title: 'Les doubles croches', meters: ['4/4', '2/4', '3/4'], cells: { q: 2, ee: 3, ssss: 4, e_ss: 3, ss_e: 3 }, focus: ['ssss', 'e_ss', 'ss_e'], end: 'h',
    intro: '<p>Quatre doubles croches par temps : compte « 1-e-et-a ». Croche + deux doubles : « 1 — et-a » ; deux doubles + croche : « 1-e-et — ».</p>' },
  { id: 6, title: 'Rythmes pointés serrés', meters: ['4/4', '2/4'], cells: { q: 2, ee: 2, ds: 5, sd: 2, ssss: 1 }, focus: ['ds', 'sd'], end: 'h',
    intro: '<p>Croche pointée – double croche : la longue dure trois doubles croches, la brève une seule, juste avant le temps suivant (« 1 — — a »). C’est le rythme de marche de Montaigus et Capulets : trop mou, il devient un triolet. Double – croche pointée (rythme lombard) : la brève sur le temps, la longue après.</p>' },
  { id: 7, title: 'Les triolets', meters: ['4/4', '3/4', '2/4'], cells: { q: 3, ee: 2, trip: 5 }, focus: ['trip'], end: 'h',
    intro: '<p>Trois croches dans un temps au lieu de deux : dis « tri-o-let » ou « ana-nas » à chaque temps. Les trois notes sont égales ; seule la première tombe sur le temps. Alterner croches et triolets demande de changer de subdivision sans changer de pulsation.</p>' },
  { id: 8, title: 'Mesures composées : 6/8, 9/8, 12/8', meters: ['6/8', '9/8', '12/8'], cells: { eee: 4, qe: 4, qdot: 2, eq: 2, e_ss_e: 1 }, focus: ['qe', 'eee'], end: 'qdot', compound: true,
    intro: '<p>Le temps est une noire pointée, partagée en trois croches : compte « 1-et-a, 2-et-a ». Noire – croche se dit « 1 — a ». Le 9/8 de Clair de lune a trois temps de ce genre.</p>' },
  { id: 9, title: 'Contretemps et syncopes avancés', meters: ['4/4', '2/4'], cells: { er_e: 3, e_q_e: 3, sr_sss: 3, s_e_s: 3, ds: 1, q: 1 }, focus: ['sr_sss', 's_e_s', 'e_q_e'], end: 'h',
    intro: '<p>Les attaques tombent entre les temps. Garde la pulsation dans le corps (le pied, la tête) : chaque note se place par rapport à elle, pas par rapport à la note précédente.</p>' },
  { id: 10, title: 'Deux mains : 2 contre 3, 3 contre 4', meters: ['2/4', '3/4'], twoHands: true, end: 'q',
    intro: '<p>Une main fait deux notes par temps, l’autre trois. Ensemble sur le temps ; entre les deux, l’ordre est : 2e note du triolet, 2e note du duolet, 3e note du triolet (« nice cup of tea »). Commence très lentement, une main sur une touche grave, l’autre sur une touche aiguë.</p>' },
];
const levelById = id => LEVELS.find(l => l.id === id) || LEVELS[0];

/* ------------------------------------------------------------------ */
/* Génération : une phrase rythmique (motif, variante, réponse, cadence) */
/* ------------------------------------------------------------------ */
function meterInfo(meter) {
  const [num, den] = meter.split('/').map(Number);
  const compound = den === 8 && num % 3 === 0;
  return { num, den, compound, beats: compound ? num / 3 : num * 4 / den, beatUnits: compound ? 6 : (4 * 4 / den), barUnits: num * 16 / den };
}

function weightedPick(weights) {
  const entries = Object.entries(weights);
  let r = Math.random() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
  return entries[0][0];
}

/** Une mesure : suite de cellules qui remplit exactement les temps. */
function genBar(L, mi, mustHave = null) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const cells = [];
    let beat = 0;
    while (beat < mi.beats) {
      const left = mi.beats - beat;
      let c = weightedPick(L.cells);
      if (TWO_BEAT.has(c) && left < 2) continue;
      if (c === 'q_tie' && left < 2) continue;
      cells.push(c);
      beat += TWO_BEAT.has(c) || c === 'q_tie' ? 2 : 1;
    }
    if (!mustHave || cells.some(c => mustHave.includes(c))) return cells;
  }
  return Array(mi.beats).fill(L.compound ? 'qdot' : 'q');
}

function endBar(L, mi) {
  // cadence : une ou deux cellules simples puis une valeur longue jusqu'à la barre
  const cells = [];
  let beat = 0;
  const pool = Object.keys(L.cells).filter(c => !TWO_BEAT.has(c) && c !== 'q_tie' && !CELLS[c].includes?.('t'));
  while (mi.beats - beat > 2) { cells.push(pick(pool.length ? pool : ['q'])); beat++; }
  const left = mi.beats - beat;
  if (L.compound) { while (beat < mi.beats) { cells.push('qdot'); beat++; } }
  else if (left === 2) cells.push('h');
  else if (left === 1) cells.push('q');
  return cells;
}

/** Phrase de n mesures : A A′ B cadence (4 mesures) ou A cadence (2 mesures). */
export function genPhrase(levelId, { bars = 4, meter = null } = {}) {
  const L = levelById(levelId);
  meter = meter || pick(L.meters);
  const mi = meterInfo(meter);
  if (L.twoHands) return genPoly(meter, bars);
  const A = genBar(L, mi, L.focus);
  const vary = cells => { const c = cells.slice(); const i = Math.floor(Math.random() * c.length); const alt = genBar(L, mi); if (!TWO_BEAT.has(c[i]) && !TWO_BEAT.has(alt[0]) && alt[0] !== 'q_tie' && c[i] !== 'q_tie') c[i] = alt[0]; return c; };
  const list = bars === 2 ? [A, endBar(L, mi)] : [A, vary(A), genBar(L, mi, L.focus), endBar(L, mi)];
  return { meter, mi, bars: list.slice(0, bars), level: L.id, abc: toAbc(list.slice(0, bars), meter, mi) };
}

/* ABC sur une portée d'une ligne (clé de percussion), notes sur la ligne */
function cellAbc(c, mi, note = 'B') {
  const v = CELLS[c];
  // deux temps : croche, croche liée à la croche suivante, croche (attaques sur 1, « et », « et » du 2e temps)
  if (c === 'q_tie') return `${note}2${note}2- ${note}2${note}2`;
  if (v[0] === 't') return `(3${note}2${note}2${note}2`;
  return v.map(x => (typeof x === 'string' ? `z${x.slice(1)}` : `${note}${x === 1 ? '' : x}`)).join('');
}
function toAbc(bars, meter, mi) {
  const body = bars.map(cells => cells.map(c => cellAbc(c, mi)).join(' ')).join(' | ');
  return `X:1\nM:${meter}\nL:1/16\nK:C clef=perc stafflines=1\n${body} |]`;
}

/* Deux mains : 2 contre 3 ou 3 contre 4 (chaque main sur sa portée d'une ligne) */
function genPoly(meter, bars) {
  const mi = meterInfo(meter);
  const kind = pick(['2:3', '3:2', '3:4']);
  const pat = { '2:3': ['(3B2B2B2', 'B2B2'], '3:2': ['B2B2', '(3B2B2B2'], '3:4': ['(3B2B2B2', 'BBBB'] }[kind];
  const bar = p => Array(mi.beats).fill(p).join(' ');
  const last = p => Array(mi.beats - 1).fill(p).concat(['B4']).join(' ');
  const line = p => Array(bars - 1).fill(bar(p)).concat([last(p)]).join(' | ');
  const abc = `X:1\nM:${meter}\nL:1/16\n%%score RH LH\nV:RH clef=perc stafflines=1\nV:LH clef=perc stafflines=1\nK:C\n[V:RH] ${line(pat[0])} |]\n[V:LH] ${line(pat[1])} |]`;
  return { meter, mi, bars: [], level: 10, abc, kind };
}

/* ------------------------------------------------------------------ */
/* Exécution : décompte, clics, frappes, évaluation                     */
/* ------------------------------------------------------------------ */
/**
 * Une passe de lecture tapée. Les clics sont planifiés sur l'horloge audio ; l'affichage des temps suit
 * la même horloge (requestAnimationFrame), sans minuteries qui dérivent.
 */
class RhythmRun {
  constructor(score, opts) { this.score = score; this.o = opts; this.active = false; }
  async start() {
    const sc = this.score, o = this.o;
    await audio.ensure();
    const spq = 60 / o.qpm; // secondes par noire
    const beatSec = sc.beatQ * spq;
    const beatsIn = Math.round(sc.barQ / sc.beatQ);
    const echo = !!o.echo;
    const lead = 0.3;
    const t0 = audio.now() + lead;
    // Écho : on écoute d'abord le rythme (avec les clics), puis une mesure de décompte, puis on répond
    const phraseQ = sc.totalQ;
    const pick0 = (sc.pickupQ || 0) * spq; // levée : elle termine la mesure de décompte
    const listenStart = t0 + beatsIn * beatSec - pick0;
    const answerStart = echo ? listenStart + Math.ceil((phraseQ + (sc.pickupQ ? sc.barQ - sc.pickupQ : 0)) / sc.barQ) * sc.barQ * spq + beatsIn * beatSec : t0 + beatsIn * beatSec - pick0;
    const endAt = answerStart + (phraseQ + sc.beatQ) * spq;
    // clics : premier temps de la mesure accentué, les autres identiques
    this.clickNodes = [];
    if (o.clicks !== false) {
      for (let t = t0, k = 0; t < endAt - beatSec * 0.5; t += beatSec, k++) this.clickNodes.push(audio.click(t, k % beatsIn === 0 ? 'accent' : 'beat'));
    } else {
      const c0 = answerStart + pick0 - beatsIn * beatSec;
      for (let k = 0; k < beatsIn; k++) this.clickNodes.push(audio.click(c0 + k * beatSec, k === 0 ? 'accent' : 'beat'));
    }
    if (echo) {
      for (const e of sc.events) {
        const v = audio.noteOn(e.hand === 'lh' ? 59 : 76, 78, listenStart + e.t * spq, { owner: 'rhythm' });
        if (v) audio.noteOff(v, listenStart + e.t * spq + Math.min(0.2, e.dur * spq * 0.8));
      }
    }
    this.zeroPerf = audio.ctxToPerf(answerStart);
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
    // affichage synchronisé sur l'horloge audio
    const frame = () => {
      if (!this.active) return;
      const now = audio.now();
      let phase, beat = null;
      if (now < (echo ? listenStart : answerStart)) { phase = echo ? 'count0' : 'count'; beat = Math.floor((now - t0) / beatSec); }
      else if (echo && now < answerStart - beatsIn * beatSec) { phase = 'listen'; beat = Math.floor((now - listenStart) / beatSec); }
      else if (now < answerStart) { phase = 'count'; beat = Math.floor((now - (answerStart - beatsIn * beatSec)) / beatSec); }
      else { phase = 'play'; beat = Math.floor((now - answerStart) / beatSec); }
      o.onFrame?.(phase, beat, beatsIn, now >= answerStart ? (now - answerStart) / spq : null);
      if (performance.now() > this.endPerf + 120) { this.finish(); return; }
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
    extra += taps.filter(t => !t.used).length;
  }
  items.sort((a, b) => a.t - b.t);
  const hit = items.filter(i => i.dt != null);
  const res = {
    total: items.length, ok: items.filter(i => i.status === 'ok').length, near: items.filter(i => i.status === 'near').length,
    miss: items.filter(i => i.status === 'miss').length, extra, items, okMs,
    meanAbs: hit.length ? mean(hit.map(i => Math.abs(i.dt))) : 0, bias: hit.length ? median(hit.map(i => i.dt)) : 0,
  };
  res.score = res.total ? (res.ok + 0.5 * res.near) / res.total : 0;
  return res;
}

/** Conseil ciblé d'après les erreurs de la passe. */
function advice(res, score) {
  if (!res.total) return '';
  if (res.miss === res.total) return 'Je n’ai reçu aucune frappe : tape sur une touche du piano, sur la zone, ou sur la barre d’espace, dès « À toi ».';
  const parts = [];
  if (Math.abs(res.bias) > 45 && res.items.filter(i => i.dt != null && Math.sign(i.dt) === Math.sign(res.bias)).length > 0.7 * (res.total - res.miss)) {
    parts.push(res.bias < 0 ? `Tu anticipes presque toutes les notes (${Math.round(-res.bias)} ms en moyenne) : laisse les notes longues durer jusqu’au bout.` : `Tes frappes arrivent régulièrement après le clic (${Math.round(res.bias)} ms) : si le rythme te semblait juste, calibre l’entrée dans Réglages.`);
  }
  const bad = res.items.filter(i => i.status === 'miss' || i.status === 'late');
  if (bad.length) {
    // contexte de la première erreur : après un silence ? note brève ? hors temps ?
    const b = bad[0];
    const offBeat = Math.abs((b.t / score.beatQ) % 1) > 0.02;
    const prev = res.items[res.items.indexOf(b) - 1];
    const gap = prev ? b.t - prev.t : 0;
    if (prev && gap > score.beatQ * 1.01) parts.push('La note qui suit une valeur longue ou un silence arrive mal placée : compte les temps du silence à voix basse.');
    else if (offBeat) parts.push('Les notes entre les temps sont les moins sûres : dis la subdivision (« et », « e-et-a », « tri-o-let ») en tapant.');
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
  let phrase = null, score = null, run = null, player = null;
  const scoreHost = h('div', { class: 'rhythm-score' });
  const phaseBox = h('div', { class: 'rhythm-phase', 'aria-live': 'polite' });
  const result = h('div', { class: 'rhythm-result' });
  const pads = h('div', { class: 'rhythm-pads' });
  const ctrl = h('div', { class: 'score-ctrl' });
  body.append(scoreHost, phaseBox, pads, result);
  frame.append(h('div', { class: 'w-foot' }, ctrl));

  const newPhrase = () => {
    stop();
    if (cfg.abc) phrase = { abc: cfg.abc, level: null };
    else phrase = genPhrase(levelId, { bars: cfg.bars || (levelId >= 9 ? 2 : 4), meter: cfg.meter });
    scoreHost.innerHTML = '';
    score = new Score(scoreHost, phrase.abc, { staffwidth: 640 });
    player = new Player(score, {});
    result.innerHTML = '';
    phaseBox.innerHTML = '';
    phaseBox.append(h('span', { class: 'small' }, echo ? 'Écoute le rythme, puis rejoue-le après le décompte.' : 'Lis le rythme en silence (compte les temps), puis touche « Jouer ».'));
    renderPads();
  };
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

  const stop = () => {
    run?.stop(); run = null;
    player?.stop();
    goBtn.textContent = 'Jouer'; goBtn.classList.remove('on');
  };

  const goBtn = h('button', { class: 'btn primary', type: 'button' }, 'Jouer');
  goBtn.addEventListener('click', async () => {
    if (run) { stop(); phaseBox.textContent = ''; return; }
    player?.stop();
    score.clear();
    result.innerHTML = '';
    goBtn.textContent = 'Arrêter'; goBtn.classList.add('on');
    run = new RhythmRun(score, {
      qpm: bpm * score.beatQ, echo, clicks, handFilter: cfg.handFilter,
      hands: cfg.handFilter ? [cfg.handFilter] : null,
      onTap: flash,
      onFrame: (phase, beat, beatsIn) => {
        const label = { count0: 'Prépare-toi', listen: 'Écoute', count: 'Prépare-toi', play: 'À toi !' }[phase];
        const num = phase === 'play' || phase === 'listen' ? (beat % beatsIn) + 1 : beat + 1;
        if (phaseBox.dataset.k !== phase + num) {
          phaseBox.dataset.k = phase + num;
          phaseBox.innerHTML = '';
          phaseBox.append(h('span', { class: 'ph-label ' + phase }, label), h('span', { class: 'ph-beat' }, String(Math.max(1, num))));
        }
      },
      onDone: res => {
        run = null;
        goBtn.textContent = 'Jouer'; goBtn.classList.remove('on');
        phaseBox.textContent = '';
        for (const it of res.items) for (const c of it.chars) score.mark(c, it.status === 'ok' ? 'n-ok' : it.status === 'near' ? 'n-late' : 'n-bad');
        result.innerHTML = '';
        const strip = h('div', { class: 'result-strip' },
          h('span', {}, 'À l’heure ', h('b', {}, `${res.ok}/${res.total}`)),
          res.near ? h('span', {}, 'Presque ', h('b', {}, String(res.near))) : null,
          h('span', {}, 'Écart moyen ', h('b', {}, `${Math.round(res.meanAbs)} ms`)),
          res.extra ? h('span', {}, 'Frappes en trop ', h('b', {}, String(res.extra))) : null);
        result.append(strip, h('p', { class: 'small mb-0' }, 'Vert : à l’heure · orange : un peu décalé · rouge : manqué ou très décalé.'), h('div', { class: 'verdict mt-1' }, advice(res, score)));
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
    stop();
    player.set({ qpm: bpm * score.beatQ, click: true, countIn: true });
    try { await player.play(); } catch (e) { phaseBox.textContent = 'Audio indisponible : ' + e.message; }
  });
  const nextBtn = h('button', { class: 'btn', type: 'button' }, 'Autre rythme');
  nextBtn.addEventListener('click', newPhrase);
  const out = h('output', {}, `♩ = ${bpm}`);
  const rng = h('input', { type: 'range', min: 40, max: 140, value: bpm, step: 2, 'aria-label': 'Tempo' });
  rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = `${score && score.beatQ === 1.5 ? '♩.' : '♩'} = ${bpm}`; });
  const echoBtn = h('button', { class: 'btn sm' + (echo ? ' on' : ''), type: 'button', title: 'Écouter d’abord, puis rejouer de mémoire' }, 'Écouter d’abord');
  echoBtn.addEventListener('click', () => { echo = !echo; echoBtn.classList.toggle('on', echo); });
  const clickBtn = h('button', { class: 'btn sm' + (clicks ? ' on' : ''), type: 'button', title: 'Clics pendant la lecture (sinon : décompte seulement)' }, 'Clic');
  clickBtn.addEventListener('click', () => { clicks = !clicks; clickBtn.classList.toggle('on', clicks); });
  ctrl.append(goBtn, listenBtn, cfg.abc ? null : nextBtn, h('label', { class: 'range' }, 'Tempo', rng, out), echoBtn, clickBtn);
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
    // deux variantes qui diffèrent d'une cellule
    const L = levelById(levelId);
    const variants = [base];
    for (let k = 0; k < 8 && variants.length < 3; k++) {
      const bars = base.bars.map(b => b.slice());
      const bi = Math.floor(Math.random() * bars.length);
      const ci = Math.floor(Math.random() * bars[bi].length);
      const alt = genBar(L, base.mi)[0];
      if (alt === bars[bi][ci] || TWO_BEAT.has(alt) !== TWO_BEAT.has(bars[bi][ci]) || alt === 'q_tie' || bars[bi][ci] === 'q_tie') continue;
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
      pane.append(h('p', { class: 'small' }, 'Tape sur une touche du piano (le plus précis), sur la zone à l’écran ou sur la barre d’espace. « Écouter d’abord » transforme l’exercice en écho : utile pour entendre un rythme nouveau, mais la lecture reste l’objectif.'));
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
