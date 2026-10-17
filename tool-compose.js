// Atelier de composition (V4) : construire ensemble un morceau de huit mesures dans un style (élégie à la russe,
// romance de Liszt, nocturne de Chopin). L'appli joue la main gauche du style ; tu enregistres la mélodie, mesure
// par mesure ou d'un trait ; elle est notée (croches), vérifiée (notes de l'accord, question, sommet, cadence),
// jouée, enregistrée dans tes compositions et exportable (texte ABC, fichier MIDI).
import { h, esc, pc, noteNameFr, CHORDS } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { corrected } from './latency.js';
import { keyboard } from './diagrams.js';
import { scheduleCountIn, countInPosition } from './countin.js';
import { IMPROV_PRESETS, buildTimeline, voicing, PATTERNS } from './tool-improv.js';
import { mountScore } from './score-widget.js';

/* ------------------------------------------------------------------ */
/* Les styles                                                          */
/* ------------------------------------------------------------------ */
// orthographe des douze notes dans chaque tonalité (lettre, altération), et armure
const SPELL = {
  Dm: [['C', 0], ['C', 1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['B', -1], ['B', 0]],
  Em: [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]],
  Fm: [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]],
};
const KEYSIG = { Dm: { B: -1 }, Em: { F: 1 }, Fm: { B: -1, E: -1, A: -1, D: -1 } };
export const STYLES = [
  { id: 'elegie', label: 'Élégie (arpèges à la russe, ré mineur)', preset: 'elegie-re', key: 'Dm',
    lead: 'De grandes vagues d’arpèges, une mélodie lente qui monte vers un sommet et retombe. Pense à Rachmaninov : peu de notes, longues, et une montée préparée.' },
  { id: 'romance', label: 'Romance (Liszt, mi mineur)', preset: 'romance-mi', key: 'Em',
    lead: 'Une main gauche qui déroule l’accord jusqu’à la dixième, une mélodie chantée en valeurs longues, qui soupire (appoggiatures) et se suspend avant de conclure.' },
  { id: 'nocturne', label: 'Nocturne (harmonies de ton op. 55, fa mineur)', preset: 'nocturne-op55', key: 'Fm',
    lead: 'Basse et accord, deux harmonies par mesure : la mélodie de Chopin s’appuie sur les temps 1 et 3 et s’orne entre eux (broderies, chromatismes).' },
];
const ROLE = ['motif (question)', 'suite', 'suite', 'suspension (pas sur la tonique)', 'le motif revient (réponse)', 'montée', 'sommet', 'cadence : la tonique'];
const TIPS = [
  'Commence par un motif simple : deux ou trois notes de l’accord, un rythme reconnaissable.',
  'Valeurs longues, notes de l’accord sur les temps forts ; les autres notes passent entre eux.',
  'Un soupir (une appoggiature : une note étrangère sur le temps, qui retombe d’un degré) par phrase suffit.',
  'Mesure 4 : arrête-toi sur une note qui appelle la suite (pas la tonique).',
  'Mesures 5-6 : reprends le rythme du début, c’est la réponse.',
  'Le sommet (la note la plus aiguë) arrive tard, mesure 6 ou 7, juste avant la cadence.',
];

/* ------------------------------------------------------------------ */
/* Écriture ABC                                                        */
/* ------------------------------------------------------------------ */
function abcPitch(letter, oct) { return oct >= 5 ? letter.toLowerCase() + "'".repeat(oct - 5) : letter + ','.repeat(4 - oct); }
/** Une note épelée dans la tonalité, avec les altérations de la mesure (état mutable acc). */
function noteAbc(m, key, acc) {
  const [letter, alt] = SPELL[key][pc(m)];
  const oct = Math.floor((m - alt) / 12) - 1;
  const k = letter + oct;
  const cur = acc[k] ?? (KEYSIG[key][letter] || 0);
  let pre = '';
  if (cur !== alt) { pre = alt === 1 ? '^' : alt === -1 ? '_' : '='; acc[k] = alt; }
  return pre + abcPitch(letter, oct);
}
const durTok = d => (d === 1 ? '' : d === 0.5 ? '/' : Number.isInteger(d) ? String(d) : `${d * 2}/2`);

/** Mélodie (croches) → ABC de la main droite, mesure par mesure, avec liaisons au-dessus des barres. */
function melodyAbc(mel, key, per, bars) {
  const out = [];
  for (let b = 0; b < bars; b++) {
    const acc = {};
    const toks = [];
    let t = b * per;
    const end = (b + 1) * per;
    const inBar = mel.filter(n => n.s < end && n.s + n.d > b * per).sort((a, c) => a.s - c.s);
    for (const n of inBar) {
      const s = Math.max(n.s, b * per);
      if (s > t) { toks.push('z' + durTok(s - t)); t = s; }
      const e = Math.min(n.s + n.d, end);
      if (e <= t) continue;
      toks.push(noteAbc(n.m, key, acc) + durTok(e - t) + (n.s + n.d > end ? '-' : ''));
      t = e;
    }
    if (t < end) toks.push('z' + durTok(end - t));
    out.push(toks.join(' '));
  }
  return out;
}

/** Main gauche : événements { at (temps), m } d'une mesure → ABC (triolets si l'écart vaut un tiers de temps). */
function lhBarAbc(evs, barStart, beats, key, label) {
  const acc = {};
  const onsets = [...new Set(evs.map(e => Math.round(e.at * 120) / 120))].sort((a, b) => a - b);
  const toks = [];
  let i = 0;
  while (i < onsets.length) {
    const t = onsets[i];
    const next = onsets[i + 1] ?? barStart + beats;
    const dur = next - t; // en temps
    const chord = evs.filter(e => Math.abs(e.at - t) < 0.005).map(e => e.m).sort((a, b) => a - b);
    const notes = [...new Set(chord)].map(m => noteAbc(m, key, acc));
    const body = notes.length > 1 ? `[${notes.join('')}]` : notes[0];
    if (Math.abs(dur - 1 / 3) < 0.02 && i + 2 < onsets.length + 1) {
      // triolet de croches : trois attaques d'un tiers de temps
      const grp = [body];
      for (let k = 1; k < 3 && i + k < onsets.length; k++) {
        const tt = onsets[i + k];
        const ch = [...new Set(evs.filter(e => Math.abs(e.at - tt) < 0.005).map(e => e.m))].sort((a, b) => a - b).map(m => noteAbc(m, key, acc));
        grp.push(ch.length > 1 ? `[${ch.join('')}]` : ch[0]);
      }
      toks.push('(3' + grp.join(''));
      i += grp.length;
      continue;
    }
    toks.push(body + durTok(dur * 2));
    i++;
  }
  if (label) toks[0] = `"_${label}"` + toks[0];
  return toks.join(' ');
}

/* ------------------------------------------------------------------ */
/* Le widget                                                           */
/* ------------------------------------------------------------------ */
export function mountCompose(el) {
  const frame = h('div', { class: 'w-frame compose' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Atelier de composition'), h('span', { class: 'w-sub' }, 'huit mesures, avec toi'));
  const styleSel = h('select', { class: 'improv-sel', 'aria-label': 'Style' }, ...STYLES.map(s => h('option', { value: s.id }, s.label)));
  head.append(styleSel);
  const body = h('div', { class: 'w-body' });
  frame.append(head, body);
  el.append(frame);

  const lead = h('p', { class: 'small improv-style' });
  const planBox = h('div', { class: 'improv-grid cp-plan' });
  const status = h('div', { class: 'score-status' });
  const checks = h('ul', { class: 'cp-checks' });
  const tipsBox = h('details', { class: 'cp-tips' });
  const rng = h('input', { type: 'range', min: 36, max: 90, 'aria-label': 'Tempo' });
  const out = h('output');
  const playGrid = h('button', { class: 'btn', type: 'button' }, 'Écouter la grille');
  const recAll = h('button', { class: 'btn primary', type: 'button' }, 'Enregistrer les 8 mesures');
  const barSel = h('select', { 'aria-label': 'Mesure' }, ...Array.from({ length: 8 }, (_, i) => h('option', { value: i }, `mesure ${i + 1}`)));
  const recBar = h('button', { class: 'btn sm', type: 'button' }, 'Réenregistrer');
  const clearBar = h('button', { class: 'btn sm ghost', type: 'button' }, 'Effacer');
  const scoreHost = h('div', { class: 'cp-score' });
  const kbHost = h('div');
  const title = h('input', { type: 'text', class: 'cp-title', placeholder: 'Titre de ta pièce', maxlength: 60 });
  const saveBtn = h('button', { class: 'btn', type: 'button' }, 'Garder dans mes compositions');
  const listSel = h('select', { 'aria-label': 'Mes compositions' });
  const openBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Ouvrir');
  const delBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Supprimer');
  const abcBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Copier la partition (ABC)');
  const midiBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Télécharger le MIDI');
  const msg = h('p', { class: 'small' });
  const fixRow = h('div', { class: 'score-ctrl cp-fix' }, h('span', { class: 'small' }, 'Reprendre la'), barSel, recBar, clearBar);
  const mineRow = h('div', { class: 'score-ctrl' }, h('span', { class: 'small' }, 'Mes compositions'), listSel, openBtn, delBtn);
  const exportRow = h('div', { class: 'score-ctrl' }, abcBtn, midiBtn);
  const step = (n, t) => h('h4', { class: 'an-sub cp-step' }, h('span', { class: 'cp-n' }, String(n)), t);
  body.append(
    lead,
    step(1, 'Écoute la grille'), planBox,
    h('div', { class: 'score-ctrl' }, playGrid, h('label', { class: 'range' }, 'Tempo', rng, out)),
    step(2, 'Joue ta mélodie'),
    h('p', { class: 'small mt-0' }, 'Après le décompte, l’appli joue la main gauche : joue la main droite sur le piano (ou le clavier à l’écran). Les notes sont rangées en croches.'),
    h('div', { class: 'score-ctrl' }, recAll), fixRow, kbHost, status, tipsBox,
    step(3, 'Lis et vérifie'), checks, scoreHost,
    step(4, 'Garde ta pièce'),
    h('div', { class: 'score-ctrl' }, title, saveBtn), mineRow, exportRow, msg);

  let S, P, timeline, meter, per, bars, bpm, melody = [], playing = null, scoreCleanup = null;
  const projects = () => store.get('compose.projects') || [];

  const load = (styleId, keepMelody = false) => {
    stopAll();
    S = STYLES.find(s => s.id === styleId) || STYLES[0];
    styleSel.value = S.id;
    P = IMPROV_PRESETS[S.preset];
    timeline = buildTimeline(P);
    meter = P.meter; per = meter * 2; bars = Math.round(timeline.totalBeats / meter);
    bpm = P.bpm; rng.value = bpm; out.textContent = `♩ = ${bpm}`;
    if (!keepMelody) melody = [];
    lead.textContent = S.lead;
    planBox.innerHTML = '';
    for (let b = 0; b < bars; b++) {
      const chs = timeline.filter(c => c.bar === b);
      planBox.append(h('div', { class: 'ig-cell' + (b === 6 ? ' cp-peak' : '') },
        h('span', { class: 'ig-sec' }, `m. ${b + 1}`),
        h('b', {}, chs.map(c => c.label || '·').join(' · ')),
        h('span', { class: 'ig-name' }, chs.map(c => c.name).join(', ')),
        h('span', { class: 'ig-notes' }, ROLE[b] || '')));
    }
    tipsBox.innerHTML = `<summary>Conseils pour inventer la mélodie</summary><ul>${TIPS.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
    render();
  };

  /* --- accompagnement (événements en temps) --- */
  const lhEvents = () => {
    const evs = [];
    for (const ch of timeline) {
      const v = voicing(ch);
      const note = (m, at, d, vel = 50) => evs.push({ m, at, d, vel });
      if (ch.silent) continue;
      if (ch.hold) { (ch.notes ? v.upper : [v.bass, ...v.upper]).forEach(m => note(m, ch.at, ch.beats * 0.98, 46)); continue; }
      (PATTERNS[P.pattern] || PATTERNS['basse-accord'])({ v, t: ch.at, dur: ch.beats, beats: ch.beats, spb: 1, note, meter });
    }
    return evs;
  };

  /* --- partition --- */
  const buildAbc = () => {
    const rh = melodyAbc(melody, S.key, per, bars);
    const lhEv = lhEvents();
    const lh = [];
    for (let b = 0; b < bars; b++) {
      const chs = timeline.filter(c => c.bar === b);
      const evs = lhEv.filter(e => e.at >= b * meter - 1e-6 && e.at < (b + 1) * meter - 1e-6);
      lh.push(lhBarAbc(evs, b * meter, meter, S.key, chs.map(c => c.label).filter(Boolean).join(' ')));
    }
    const name = (title.value || 'Ma composition').replace(/[\n"]/g, ' ');
    const lines = [];
    for (let s = 0; s < bars; s += 4) {
      const end = s + 4 >= bars ? ' |]' : ' |';
      lines.push(`[V:RH] ${rh.slice(s, s + 4).join(' | ')}${end}`);
      lines.push(`[V:LH] ${lh.slice(s, s + 4).join(' | ')}${end}`);
    }
    return `X:1\nT:${name}\nM:${meter}/4\nL:1/8\nQ:1/4=${bpm}\nK:${S.key}\n%%score {RH | LH}\nV:RH clef=treble\nV:LH clef=bass\n${lines.join('\n')}`;
  };
  const render = () => {
    scoreCleanup?.(); scoreCleanup = null;
    // garder la hauteur pendant le nouveau rendu : sans cela la page saute (et un toucher en cours tombe à côté)
    if (scoreHost.offsetHeight) { scoreHost.style.minHeight = scoreHost.offsetHeight + 'px'; requestAnimationFrame(() => requestAnimationFrame(() => { scoreHost.style.minHeight = ''; })); }
    scoreHost.innerHTML = '';
    fixRow.hidden = exportRow.hidden = scoreHost.hidden = !melody.length;
    renderChecks();
    if (!melody.length) return; // la partition apparaît avec la première mélodie (la grille s'écoute au-dessus)
    const abc = buildAbc();
    const pedal = timeline.filter(c => !c.silent).map(c => c.at);
    try { scoreCleanup = mountScore(scoreHost, { abc, bpm, title: title.value || 'Ma composition', pedal, pedalEnd: timeline.totalBeats, practice: true, variants: [{ label: 'Écouter' }] }); }
    catch (e) { scoreHost.textContent = 'Partition indisponible : ' + e.message; }
  };

  /* --- vérifications --- */
  const chordAt = beat => timeline.find(c => beat >= c.at - 1e-6 && beat < c.at + c.beats - 1e-6);
  const renderChecks = () => {
    checks.innerHTML = '';
    if (!melody.length) { checks.append(h('li', {}, 'Pas encore de mélodie : écoute la grille, puis enregistre.')); return; }
    const li = (ok, html) => checks.append(h('li', { class: ok ? 'ok' : 'todo', html: (ok ? '✓ ' : '→ ') + html }));
    const strong = melody.filter(n => { const beat = n.s / 2; const inBar = beat % meter; return Number.isInteger(beat) && (inBar === 0 || (meter === 4 && inBar === 2)); });
    const okStrong = strong.filter(n => { const ch = chordAt(n.s / 2); return ch && CHORDS[ch.q].iv.map(x => (ch.root + x) % 12).includes(pc(n.m)); });
    const pctS = strong.length ? okStrong.length / strong.length : 0;
    li(pctS >= 0.7, `Temps forts sur une note de l’accord : <b>${Math.round(pctS * 100)} %</b>${pctS >= 0.7 ? '' : ' (vise 70 % ; les autres temps forts doivent être des soupirs voulus)'}.`);
    const tonic = timeline[0].tonic % 12;
    const lastIn = b => melody.filter(n => n.s < (b + 1) * per && n.s >= b * per).sort((a, c) => a.s - c.s).pop();
    const n4 = lastIn(3), n8 = lastIn(bars - 1);
    if (n4) li(pc(n4.m) !== tonic, pc(n4.m) !== tonic ? `Mesure 4 : la phrase s’arrête sur ${noteNameFr(n4.m, { octave: false })}, elle reste en suspens : c’est la question.` : 'Mesure 4 : tu finis déjà sur la tonique ; garde-la pour la fin, et arrête-toi plutôt sur une note qui appelle la suite.');
    if (n8) li(pc(n8.m) === tonic, pc(n8.m) === tonic ? 'Mesure 8 : fin sur la tonique, la pièce conclut.' : `Mesure 8 : la dernière note (${noteNameFr(n8.m, { octave: false })}) n’est pas la tonique : finis sur ${noteNameFr(60 + tonic, { octave: false })}.`);
    const top = melody.reduce((a, n) => (n.m > a.m ? n : a), melody[0]);
    const topBar = Math.floor(top.s / per) + 1;
    li(topBar >= 5 && topBar <= 7, `Le sommet (${noteNameFr(top.m, { octave: false })}) est en mesure ${topBar}${topBar >= 5 && topBar <= 7 ? ' : il arrive tard, juste avant la cadence.' : ' ; il porte mieux en mesure 6 ou 7, avant la cadence.'}`);
    const rhy = b => new Set(melody.filter(n => n.s >= b * per && n.s < (b + 1) * per).map(n => n.s - b * per));
    const r1 = rhy(0), r5 = rhy(4);
    const inter = [...r1].filter(x => r5.has(x)).length;
    if (r1.size && r5.size) li(inter / Math.max(r1.size, r5.size) >= 0.6, inter / Math.max(r1.size, r5.size) >= 0.6 ? 'Mesure 5 : le rythme du début revient, on entend la réponse.' : 'Mesure 5 : reprends le rythme de la mesure 1, pour qu’on entende la réponse.');
    const longN = melody.filter(n => n.d >= 2).length / melody.length;
    li(longN >= 0.4, longN >= 0.4 ? 'Des valeurs longues : la mélodie peut chanter.' : 'Beaucoup de notes courtes : dans ce style, la mélodie chante en valeurs longues (noires, blanches).');
  };

  /* --- lecture de la grille et enregistrement --- */
  const stopAll = () => {
    if (playing) { playing.offs?.forEach(f => f()); playing.timers?.forEach(clearTimeout); playing.clicks && audio.cancelClicks(playing.clicks); }
    playing = null;
    audio.stopAll('compose');
    recAll.textContent = 'Enregistrer les 8 mesures'; recBar.textContent = 'Réenregistrer';
    playGrid.textContent = 'Écouter la grille';
  };
  const scheduleLH = (t0, fromBeat, toBeat, spb) => {
    for (const e of lhEvents()) {
      if (e.at < fromBeat - 1e-6 || e.at >= toBeat - 1e-6) continue;
      const at = t0 + (e.at - fromBeat) * spb;
      const v = audio.noteOn(e.m, e.vel || 50, at, { owner: 'compose' });
      if (v) audio.noteOff(v, at + Math.min(e.d, toBeat - e.at) * spb);
    }
  };
  playGrid.addEventListener('click', async () => {
    if (playing) { stopAll(); return; }
    audio.claim('compose', stopAll);
    await audio.ensure();
    const spb = 60 / bpm, t0 = audio.now() + 0.3;
    scheduleLH(t0, 0, timeline.totalBeats, spb);
    playing = { timers: [setTimeout(stopAll, (timeline.totalBeats * spb + 1) * 1000)] };
    playGrid.textContent = 'Arrêter';
  });
  const record = async (fromBar, toBar, btn) => {
    if (playing) { if (playing.finish) playing.finish(true); else stopAll(); return; } // arrêt : on garde ce qui a été joué
    if (midi.status !== 'ready' && !kbHost.firstChild) kbHost.append(screenKb());
    audio.claim('compose', stopAll);
    await audio.ensure();
    const spb = 60 / bpm;
    const plan = scheduleCountIn({ beatsPerBar: meter, beatSec: spb });
    const fromBeat = fromBar * meter, toBeat = (toBar + 1) * meter;
    const t0 = plan.end;
    scheduleLH(t0, fromBeat, toBeat, spb);
    const perf0 = audio.ctxToPerf(t0);
    const got = [];
    const open = new Map();
    const offs = [
      midi.on('noteon', ev => {
        const t = corrected(ev);
        const beat = fromBeat + (t - perf0) / (spb * 1000);
        if (beat < fromBeat - 0.3 || beat >= toBeat) return;
        const n = { m: ev.note, beat, end: null }; got.push(n); open.set(ev.note, n);
      }),
      midi.on('noteoff', ev => { const n = open.get(ev.note); if (n) { n.end = fromBeat + (corrected(ev) - perf0) / (spb * 1000); open.delete(ev.note); } }),
    ];
    const timers = [];
    const tick = () => {
      const pos = countInPosition(plan);
      if (!pos.done) status.textContent = pos.waiting ? 'Prépare-toi…' : `Décompte : ${pos.inBar}${plan.bars > 1 ? ` (mesure ${pos.bar} sur ${plan.bars})` : ''}`;
      else {
        const beat = fromBeat + (performance.now() - perf0) / (spb * 1000);
        status.textContent = beat < toBeat ? `Joue ! Mesure ${Math.floor(beat / meter) + 1} · ${ROLE[Math.floor(beat / meter)] || ''}` : 'Terminé.';
      }
      if (playing) timers.push(setTimeout(tick, 120));
    };
    playing = { offs, timers, clicks: plan.nodes };
    frame.__cp = { perf0, spb, fromBeat }; // accès de test
    btn.textContent = 'Arrêter';
    tick();
    let finished = false;
    /** early : arrêt demandé avant la fin ; on ne remplace que les mesures atteintes (rien si l'arrêt tombe dans le décompte). */
    const finish = (early = false) => {
      if (finished) return;
      finished = true;
      offs.forEach(f => f());
      const nowBeat = fromBeat + (performance.now() - perf0) / (spb * 1000);
      const lastBar = early ? Math.min(toBar, Math.floor((nowBeat - 1e-6) / meter)) : toBar;
      if (lastBar < fromBar) { stopAll(); status.textContent = 'Arrêté avant de commencer : ta mélodie n’a pas changé.'; return; }
      const endS = (lastBar + 1) * per;
      for (const n of open.values()) n.end = Math.min(nowBeat, toBeat); // touches encore enfoncées
      // croches : début arrondi, une seule note par croche (la plus aiguë), durée jusqu'à la note suivante ou au relâchement
      const q = [];
      for (const n of got.sort((a, b) => a.beat - b.beat)) {
        const st = Math.max(fromBar * per, Math.round(n.beat * 2));
        if (st >= endS) continue;
        const prev = q[q.length - 1];
        if (prev && prev.s === st) { if (n.m > prev.m) prev.m = n.m; continue; }
        q.push({ s: st, m: n.m, e: n.end != null ? Math.round(n.end * 2) : null });
      }
      q.forEach((n, i) => {
        const nextS = q[i + 1]?.s ?? endS;
        let e = n.e != null ? Math.max(n.s + 1, n.e) : nextS;
        if (e > nextS || (nextS - e) <= 1) e = nextS; // un petit silence entre deux notes : on lie
        n.d = Math.max(1, e - n.s);
        delete n.e;
      });
      replaceRange(fromBar * per, endS, q);
      stopAll();
      status.textContent = q.length ? `${q.length} note${q.length > 1 ? 's' : ''} enregistrée${q.length > 1 ? 's' : ''}${lastBar < toBar ? ` (mesures ${fromBar + 1} à ${lastBar + 1})` : ''}. Écoute la partition ci-dessous, puis reprends une mesure si besoin.` : 'Je n’ai rien reçu : joue sur le piano connecté (ou le clavier à l’écran) après le décompte.';
      render();
    };
    playing.finish = finish;
    timers.push(setTimeout(finish, Math.max(0, audio.ctxToPerf(t0 + (toBeat - fromBeat) * spb) - performance.now()) + 400));
  };
  /** Remplace les notes qui commencent dans [s0, s1[ par q ; une note commencée avant s0 et qui déborde est raccourcie. */
  const replaceRange = (s0, s1, q = []) => {
    melody = melody.filter(n => n.s < s0 || n.s >= s1).concat(q).sort((a, b) => a.s - b.s);
    melody.forEach(n => { if (n.s < s0 && n.s + n.d > s0) n.d = s0 - n.s; });
  };
  const screenKb = () => {
    const wrap = h('div', { class: 'quiz-kbd' });
    wrap.append(keyboard({ from: 57, to: 88, interactive: true, names: 'c', height: 90, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) }));
    return wrap;
  };
  recAll.addEventListener('click', () => record(0, bars - 1, recAll));
  recBar.addEventListener('click', () => record(+barSel.value, +barSel.value, recBar));
  clearBar.addEventListener('click', () => {
    const b = +barSel.value;
    replaceRange(b * per, (b + 1) * per);
    render();
  });
  rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = `♩ = ${bpm}`; });
  rng.addEventListener('change', render);
  styleSel.addEventListener('change', () => { if (melody.length && !confirmSwitch()) { styleSel.value = S.id; return; } load(styleSel.value); });
  const confirmSwitch = () => { msg.textContent = 'Changement de style : la mélodie en cours est effacée (garde-la d’abord si tu veux la retrouver).'; return true; };

  /* --- mes compositions --- */
  const refreshList = () => {
    listSel.innerHTML = '';
    const ps = projects();
    mineRow.hidden = !ps.length;
    if (!ps.length) listSel.append(h('option', { value: '' }, 'Aucune composition gardée'));
    ps.forEach(p => listSel.append(h('option', { value: p.id }, `${p.title} · ${STYLES.find(s => s.id === p.style)?.label.split(' (')[0] || ''} · ${new Date(p.at).toLocaleDateString('fr-FR')}`)));
  };
  saveBtn.addEventListener('click', () => {
    if (!melody.length) { msg.textContent = 'Enregistre d’abord une mélodie.'; return; }
    const ps = projects().slice();
    const t = (title.value || 'Ma composition').trim();
    const ex = ps.find(p => p.title === t && p.style === S.id);
    const rec = { id: ex?.id || 'c' + Date.now().toString(36), title: t, style: S.id, bpm, melody: melody.map(n => ({ ...n })), at: Date.now() };
    if (ex) Object.assign(ex, rec); else ps.unshift(rec);
    store.set('compose.projects', ps.slice(0, 40));
    refreshList(); listSel.value = rec.id;
    msg.textContent = `« ${t} » est gardée dans tes compositions (sur cet appareil ; elle part aussi dans l’export de sauvegarde).`;
  });
  openBtn.addEventListener('click', () => {
    const p = projects().find(x => x.id === listSel.value);
    if (!p) return;
    title.value = p.title;
    melody = p.melody.map(n => ({ ...n }));
    load(p.style, true);
    bpm = p.bpm; rng.value = bpm; out.textContent = `♩ = ${bpm}`;
    render();
    msg.textContent = `« ${p.title} » ouverte.`;
  });
  delBtn.addEventListener('click', () => {
    const id = listSel.value; if (!id) return;
    store.set('compose.projects', projects().filter(p => p.id !== id));
    refreshList(); msg.textContent = 'Composition supprimée.';
  });
  abcBtn.addEventListener('click', async () => {
    const abc = buildAbc();
    try { await navigator.clipboard.writeText(abc); msg.textContent = 'Partition copiée (format ABC) : colle-la dans un éditeur ABC ou un message.'; }
    catch (e) { msg.innerHTML = `<textarea readonly rows="8" style="width:100%">${esc(abc)}</textarea>`; }
  });
  midiBtn.addEventListener('click', () => {
    try {
      const bin = window.ABCJS.synth.getMidiFile(buildAbc(), { midiOutputType: 'binary', bpm });
      const blob = new Blob([bin[0]], { type: 'audio/midi' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `${(title.value || 'composition').replace(/[^\wÀ-ÿ -]+/g, '').trim() || 'composition'}.mid` });
      document.body.append(a); a.click(); a.remove();
      msg.textContent = 'Fichier MIDI téléchargé : il s’ouvre dans MuseScore et la plupart des logiciels de musique.';
    } catch (e) { msg.textContent = 'Export MIDI indisponible sur cet appareil : copie la partition (ABC) à la place.'; }
  });
  title.addEventListener('change', () => setTimeout(render, 250));

  refreshList();
  load(STYLES[0].id);
  return () => { stopAll(); scoreCleanup?.(); };
}
