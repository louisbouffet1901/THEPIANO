// Widgets insérables dans les leçons (partitions, claviers, schémas, exercices…)
import { h, esc, clamp, fmtPct, fmtNum, noteNameFr, ytSearch, INFORMANCE } from './util.js';
import { Score, Player, Follower, TempoReader } from './score.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard, mountDiagram, circleOfFifths } from './diagrams.js';
import { mountQuiz } from './tool-ear.js';
import { mountAnalyzer } from './tool-analyzer.js';
import { mountSight } from './tool-sight.js';
import { mountImprov } from './tool-improv.js';
import { mountMetronome } from './tool-metronome-ui.js';
import { toast } from './toast.js';
import { ANALYSES } from './content-analyses.js';

const registry = {};
export function defineWidget(type, fn) { registry[type] = fn; }

/* ------------------------------------------------------------------ */
/* Fabrique utilisée par les leçons : W.score({...}) renvoie du HTML   */
/* ------------------------------------------------------------------ */
export function makeW() {
  const cfgs = new Map();
  let n = 0;
  const ph = (type, cfg = {}) => {
    const id = 'w' + (++n);
    cfgs.set(id, { type, cfg });
    return `<div class="w w-${type}" data-wid="${id}"></div>`;
  };
  const callout = (kind, title, html, icon) => `<div class="callout ${kind}"><div class="c-title">${icon || ''}${esc(title)}</div>${html}</div>`;
  const W = {
    score: cfg => ph('score', cfg),
    kbd: cfg => ph('kbd', cfg),
    diagram: (name, opts = {}, caption) => ph('diagram', { name, opts, caption }),
    cof: cfg => ph('cof', cfg || {}),
    quiz: cfg => ph('quiz', cfg),
    analyzer: cfg => ph('analyzer', cfg),
    sight: cfg => ph('sight', cfg),
    improv: cfg => ph('improv', cfg),
    metronome: cfg => ph('metronome', cfg || {}),
    checklist: cfg => ph('checklist', cfg),
    links: (items, title) => ph('links', { items, title }),
    listen: (items, title) => ph('links', { items: items.map(it => ({ ...it, kind: 'video' })), title }),
    tip: (title, html) => callout('tip', title, html, ICONS.bulb),
    warn: (title, html) => callout('warn', title, html, ICONS.alert),
    exo: (title, html) => callout('exo', title, html, ICONS.target),
    key: (title, html) => callout('key', title, html, ICONS.star),
    frac: (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`,
    informance: (path, title, note) => ({ title, url: INFORMANCE + path, note: note || 'Informance — Online Academy (en anglais)', kind: 'informance' }),
    yt: (q, title, note) => ({ title, url: ytSearch(q), note: note || 'Recherche YouTube', kind: 'video' }),
  };
  return { W, cfgs };
}

export function mountWidgets(root, cfgs) {
  const cleanups = [];
  root.querySelectorAll('[data-wid]').forEach(el => {
    const item = cfgs.get(el.dataset.wid);
    if (!item) return;
    const fn = registry[item.type];
    if (!fn) { el.textContent = 'Widget inconnu : ' + item.type; return; }
    try {
      const c = fn(el, item.cfg);
      if (typeof c === 'function') cleanups.push(c);
    } catch (e) {
      console.error(e);
      el.innerHTML = `<div class="callout warn"><div class="c-title">Affichage impossible</div><p>${esc(e.message)}</p></div>`;
    }
  });
  return () => cleanups.forEach(fn => { try { fn(); } catch (e) { /* */ } });
}

export const ICONS = {
  bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 3l9.5 17h-19L12 3z"/><path d="M12 10v4M12 17.5v.5"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor" stroke="none"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/></svg>',
  video: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>',
  score: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/><circle cx="9" cy="14" r="2" fill="currentColor"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  keys: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v9M12 5v14M16 5v9"/></svg>',
};

/* ------------------------------------------------------------------ */
/* Partition avec lecture et entraînement                              */
/* ------------------------------------------------------------------ */
defineWidget('score', (el, cfg) => {
  const frame = h('div', { class: 'w-frame' });
  el.append(frame);
  if (cfg.title || cfg.sub) {
    frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || ''), cfg.sub ? h('span', { class: 'w-sub' }, cfg.sub) : null));
  }
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  const scoreHost = h('div');
  body.append(scoreHost);
  let score;
  try {
    score = new Score(scoreHost, cfg.abc, { tracks: cfg.tracks, staffwidth: cfg.staffwidth, scale: cfg.scale });
  } catch (e) {
    scoreHost.textContent = 'Partition indisponible (' + e.message + ')';
    return;
  }
  const beatLabel = score.beatQ === 1.5 ? '♩.' : score.beatQ === 0.5 ? '♪' : score.beatQ === 2 ? '𝅗𝅥' : '♩';
  const baseBpm = cfg.bpm || 60;
  let bpm = cfg.startBpm || baseBpm;
  let hands = 'both';
  const player = new Player(score, {});
  const foot = h('div', { class: 'w-foot' });
  const ctrl = h('div', { class: 'score-ctrl' });
  foot.append(ctrl);
  frame.append(foot);
  const status = h('div', { class: 'score-status' });
  const results = h('div', { class: 'result-strip' });
  const statusRow = h('div', { style: { width: '100%' } }, status, results);
  foot.append(statusRow);

  const playOpts = (extra = {}) => ({
    qpm: bpm * score.beatQ, hands, loop: loopOn, click: clickOn,
    countIn: !!cfg.countIn, pedal: cfg.pedal, pedalEnd: cfg.pedalEnd, dyn: cfg.dyn, tempoMap: cfg.tempoMap,
    rhShift: cfg.rhShift, balance: cfg.balance, legato: cfg.legato, flat: cfg.flat, trackGain: cfg.trackGain, ...extra,
  });

  // Boutons lecture (une version ou plusieurs variantes à comparer)
  const variants = cfg.variants && cfg.variants.length ? cfg.variants : [{ label: 'Écouter' }];
  const playBtns = [];
  let activeVariant = null;
  const setBtns = () => playBtns.forEach((b, i) => {
    const on = player.playing && activeVariant === i;
    b.innerHTML = (on ? ICONS.stop : ICONS.play) + esc(on ? 'Arrêter' : variants[i].label);
    b.classList.toggle('on', on);
  });
  variants.forEach((v, i) => {
    const b = h('button', { class: 'btn primary play-btn' + (variants.length > 1 ? ' sm' : ''), type: 'button' });
    if (variants.length > 1 && i > 0) b.classList.remove('primary');
    b.addEventListener('click', async () => {
      stopModes();
      if (player.playing && activeVariant === i) { player.stop(); return; }
      activeVariant = i;
      if (audio.loading || !audio.ready) status.textContent = 'Chargement du piano…';
      const { label, ...opts } = v;
      player.set(playOpts(opts));
      try { await player.play(); status.textContent = v.note || ''; }
      catch (e) { status.textContent = 'Audio indisponible : ' + e.message; }
      setBtns();
    });
    playBtns.push(b);
    ctrl.append(b);
  });
  player.on(t => { if (t === 'stop' || t === 'play') setBtns(); });
  setBtns();

  // Tempo
  if (cfg.tempo !== false) {
    const out = h('output', {}, `${beatLabel} = ${bpm}`);
    const rng = h('input', { type: 'range', min: Math.max(20, Math.round(baseBpm * 0.3)), max: Math.round(baseBpm * 1.3), value: bpm, step: 1, 'aria-label': 'Tempo' });
    rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = `${beatLabel} = ${bpm}`; });
    rng.addEventListener('change', () => { if (player.playing) { player.set(playOpts(variants[activeVariant] || {})); player.play(); } });
    ctrl.append(h('label', { class: 'range' }, 'Tempo', rng, out));
  }
  // Mains
  if (cfg.hands !== false && score.handsPresent.has('rh') && score.handsPresent.has('lh')) {
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Mains' });
    [['rh', 'MD'], ['both', '2 mains'], ['lh', 'MG']].forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: v === hands ? 'on' : '' }, l);
      b.addEventListener('click', () => {
        hands = v;
        seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        if (player.playing) { player.set(playOpts(variants[activeVariant] || {})); player.play(); }
      });
      seg.append(b);
    });
    ctrl.append(seg);
  }
  // Options
  let loopOn = !!cfg.loop, clickOn = !!cfg.click;
  const loopBtn = h('button', { class: 'btn sm' + (loopOn ? ' on' : ''), type: 'button', title: 'Lecture en boucle' }, 'Boucle');
  loopBtn.addEventListener('click', () => { loopOn = !loopOn; loopBtn.classList.toggle('on', loopOn); player.set({ loop: loopOn }); });
  const clickBtn = h('button', { class: 'btn sm' + (clickOn ? ' on' : ''), type: 'button', title: 'Métronome pendant la lecture' }, 'Clic');
  clickBtn.addEventListener('click', () => { clickOn = !clickOn; clickBtn.classList.toggle('on', clickOn); });
  ctrl.append(loopBtn, clickBtn);

  // Entraînement
  let follower = null, reader = null, vk = null;
  const stopModes = () => { follower?.stop(); reader?.stop(); follower = reader = null; modeBtns.forEach(b => b.classList.remove('on')); };
  const modeBtns = [];
  if (cfg.practice !== false) {
    const sep = h('span', { class: 'spacer' });
    const waitBtn = h('button', { class: 'btn sm', type: 'button', title: 'Le curseur attend que tu joues la bonne note' }, 'Mode attente');
    const tempoBtn = h('button', { class: 'btn sm', type: 'button', title: 'Décompte, puis joue en rythme : évaluation à la fin' }, 'En rythme');
    const kbBtn = h('button', { class: 'btn sm ghost', type: 'button', title: 'Afficher un clavier à l’écran' }, h('span', { html: ICONS.keys }), 'Clavier');
    modeBtns.push(waitBtn, tempoBtn);
    ctrl.append(sep, waitBtn, tempoBtn, kbBtn);
    const needInput = () => {
      if (midi.status !== 'ready' && !vk) {
        status.innerHTML = 'Branche le piano (pastille « Connecter le piano » en haut) ou affiche le clavier à l’écran.';
        return false;
      }
      return true;
    };
    waitBtn.addEventListener('click', () => {
      player.stop();
      if (follower) { stopModes(); status.textContent = ''; return; }
      if (!needInput()) return;
      stopModes(); score.clear();
      results.innerHTML = '';
      waitBtn.classList.add('on');
      follower = new Follower(score, {
        hands,
        onStep: (i, n) => { status.textContent = `Note ${i + 1} / ${n} — joue la ou les notes en bleu.`; },
        onDone: res => {
          waitBtn.classList.remove('on'); follower = null;
          status.textContent = 'Terminé.';
          results.innerHTML = `<span><b>${res.clean}</b> / ${res.steps} sans faute</span><span><b>${res.errors}</b> fausse${res.errors > 1 ? 's' : ''} note${res.errors > 1 ? 's' : ''}</span><span><b>${fmtNum(res.seconds, 0)}</b> s</span>`;
          if (cfg.stat) store.push('stats.sight', { id: cfg.stat, mode: 'wait', at: Date.now(), ...res });
        },
      });
      follower.start();
    });
    tempoBtn.addEventListener('click', async () => {
      player.stop();
      if (reader) { stopModes(); status.textContent = ''; return; }
      if (!needInput()) return;
      stopModes(); score.clear();
      results.innerHTML = '';
      tempoBtn.classList.add('on');
      status.textContent = 'Décompte d’une mesure, puis joue en suivant le curseur.';
      reader = new TempoReader(score, {
        hands, qpm: bpm * score.beatQ,
        onDone: res => {
          tempoBtn.classList.remove('on'); reader = null;
          status.textContent = 'Vert : juste et dans le temps · orange : juste mais décalé · rouge : manquée.';
          results.innerHTML = `<span>Notes justes <b>${fmtPct(res.accuracy)}</b></span><span>Dans le temps <b>${fmtPct(res.precision)}</b></span><span>Écart moyen <b>${fmtNum(res.meanAbsMs)} ms</b></span><span>Notes en trop <b>${res.extra}</b></span>`;
          if (cfg.stat) store.push('stats.sight', { id: cfg.stat, mode: 'tempo', bpm, at: Date.now(), ...res });
        },
      });
      await reader.start();
    });
    kbBtn.addEventListener('click', () => {
      if (vk) { vk.remove(); vk = null; kbBtn.classList.remove('on'); return; }
      const pitches = score.events.map(e => e.pitch);
      let lo = Math.min(...pitches) - 2, hi = Math.max(...pitches) + 2;
      while ([1, 3, 6, 8, 10].includes(lo % 12)) lo--;
      while ([1, 3, 6, 8, 10].includes(hi % 12)) hi++;
      if (hi - lo < 24) hi = lo + 24;
      vk = h('div', { class: 'vkbd' });
      vk.append(keyboard({ from: lo, to: hi, interactive: true, names: 'c', height: 110, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) }));
      body.append(vk);
      kbBtn.classList.add('on');
    });
  }
  // Panneau d'analyse (extraits de pièces) : accords mesure par mesure, à écouter en blocs
  const an = cfg.analysis === false ? null : (cfg.analysis || ANALYSES.get(cfg.abc));
  let stopAnalysis = () => {};
  if (an) {
    const panel = analysisPanel(score, an, cfg.abc, () => bpm, () => { player.stop(); stopModes(); });
    frame.append(panel.el);
    stopAnalysis = panel.stop;
  }
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
  return () => { player.stop(); stopModes(); stopAnalysis(); };
});

/* Panneau « Analyse » : tonalité, accords par mesure (chiffrage, fonction), points à remarquer. */
const FN_LABEL = { T: 'tonique', SD: 'sous-dominante', D: 'dominante' };
function analysisPanel(score, an, abc, getBpm, stopOthers) {
  const box = h('div', { class: 'w-analysis' });
  const first = +((abc.match(/%%setbarnb\s+(\d+)/) || [])[1] ?? 1);
  const barStart = m => (score.pickupQ > 0 ? (m === first ? 0 : score.pickupQ + (m - first - 1) * score.barQ) : (m - first) * score.barQ);
  // segments : [début, fin) en noires depuis le début de l'extrait
  const segs = [];
  an.bars.forEach(b => b.ch.forEach(([name, rn, fn, beat], i) => {
    const t0 = barStart(b.m) + (beat - 1) * score.beatQ;
    const nextBeat = b.ch[i + 1] ? b.ch[i + 1][3] : null;
    const t1 = nextBeat ? barStart(b.m) + (nextBeat - 1) * score.beatQ : barStart(b.m) + (b.m === first && score.pickupQ > 0 ? score.pickupQ : score.barQ);
    segs.push({ m: b.m, name, rn, fn, t0, t1 });
  }));
  const notesOf = sg => {
    const evs = score.events.filter(e => e.t < sg.t1 - 0.01 && e.t + e.dur > sg.t0 + 0.01);
    const lh = evs.filter(e => e.hand === 'lh');
    const rh = evs.filter(e => e.hand === 'rh' && e.t <= sg.t0 + 0.05 && e.t + e.dur > sg.t0 + 0.02);
    return { pitches: [...new Set([...lh, ...rh].map(e => e.pitch))].sort((x, y) => x - y), chars: [...new Set(evs.map(e => e.char).filter(c => c != null))] };
  };
  let timers = [], marked = [];
  const clearMarks = () => { marked.forEach(c => score.unmark(c, 'n-on')); marked = []; box.querySelectorAll('.wa-ch.on').forEach(x => x.classList.remove('on')); };
  const stop = () => { timers.forEach(clearTimeout); timers = []; audio.stopAll('analysis'); clearMarks(); playAll.classList.remove('on'); playAll.innerHTML = ICONS.play + 'Accords en blocs'; };
  const sound = async (list) => {
    stopOthers(); stop();
    audio.claim('analysis', stop);
    try { await audio.ensure(); } catch (e) { return; }
    const t0 = audio.now() + 0.08;
    let at = 0;
    list.forEach(({ sg, chip, dur }) => {
      const { pitches, chars } = notesOf(sg);
      pitches.forEach(p => { const v = audio.noteOn(p, p < 60 ? 56 : 62, t0 + at, { owner: 'analysis' }); if (v) audio.noteOff(v, t0 + at + dur * 0.97); });
      const start = at;
      timers.push(setTimeout(() => { clearMarks(); chip.classList.add('on'); chars.forEach(c => { score.mark(c, 'n-on'); marked.push(c); }); }, start * 1000 + 80));
      at += dur;
    });
    timers.push(setTimeout(() => stop(), at * 1000 + 300));
  };
  const head = h('div', { class: 'wa-head' }, h('span', { class: 'wa-title' }, 'Analyse'), h('span', { class: 'wa-key' }, an.key));
  const playAll = h('button', { class: 'btn sm', type: 'button', html: ICONS.play + 'Accords en blocs' });
  head.append(playAll);
  const strip = h('div', { class: 'wa-strip' });
  const chips = [];
  for (const b of an.bars) {
    const cell = h('div', { class: 'wa-bar' }, h('div', { class: 'wa-m' }, `m. ${b.m}`));
    for (const sg of segs.filter(x => x.m === b.m)) {
      const chip = h('button', { class: `wa-ch f-${sg.fn || 'x'}`, type: 'button', title: `${sg.name}${sg.rn ? ' — ' + sg.rn : ''}${sg.fn ? ' (' + FN_LABEL[sg.fn] + ')' : ''}` }, sg.rn ? h('b', {}, sg.rn) : null, h('span', {}, sg.name));
      chip.addEventListener('click', () => sound([{ sg, chip, dur: 1.4 }]));
      chips.push({ sg, chip });
      cell.append(chip);
    }
    strip.append(cell);
  }
  playAll.addEventListener('click', () => {
    if (playAll.classList.contains('on')) { stop(); return; }
    const spq = 60 / Math.max(30, getBpm() * score.beatQ) ;
    sound(chips.map(({ sg, chip }) => ({ sg, chip, dur: Math.max(0.7, Math.min(2.4, (sg.t1 - sg.t0) * spq * 1.25)) })));
    playAll.classList.add('on'); playAll.innerHTML = ICONS.stop + 'Arrêter';
  });
  const legend = h('div', { class: 'wa-legend' }, h('span', { class: 'f-T' }, 'T tonique'), h('span', { class: 'f-SD' }, 'SD sous-dominante'), h('span', { class: 'f-D' }, 'D dominante'), h('span', { class: 'f-x' }, 'passage, couleur'));
  box.append(head, strip, legend);
  if (an.notes && an.notes.length) box.append(h('ul', { class: 'wa-notes' }, ...an.notes.map(n => h('li', { html: n }))));
  return { el: box, stop };
}

/* ------------------------------------------------------------------ */
/* Clavier (schéma) avec écoute éventuelle                             */
/* ------------------------------------------------------------------ */
defineWidget('kbd', (el, cfg) => {
  const wrap = h('div', { class: 'w-frame' });
  const body = h('div', { class: 'w-body' });
  if (cfg.title) wrap.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title), cfg.sub ? h('span', { class: 'w-sub' }, cfg.sub) : null));
  const kb = keyboard({ ...cfg, label: cfg.title || 'Clavier' });
  body.append(kb);
  wrap.append(body);
  if (cfg.play) {
    const foot = h('div', { class: 'w-foot' });
    const seq = cfg.seq || (cfg.marks || []).map(m => m.m).sort((a, b) => a - b);
    const mk = (label, mode) => {
      const b = h('button', { class: 'btn sm', type: 'button', html: ICONS.play + esc(label) });
      b.addEventListener('click', async () => {
        await audio.ensure();
        const t0 = audio.now() + 0.05;
        if (mode === 'chord') seq.forEach(m => { const v = audio.noteOn(m, 70, t0); audio.noteOff(v, t0 + 1.6); kbFlash(kb, m, 0, 1600); });
        else seq.forEach((m, i) => { const st = t0 + i * (cfg.step || 0.32); const v = audio.noteOn(m, 72, st); audio.noteOff(v, st + (cfg.step || 0.32) * (mode === 'arp' ? 3 : 0.95)); kbFlash(kb, m, i * (cfg.step || 0.32) * 1000, (cfg.step || 0.32) * 900); });
      });
      return b;
    };
    const modes = Array.isArray(cfg.play) ? cfg.play : [cfg.play];
    for (const m of modes) foot.append(mk(m === 'chord' ? 'Accord' : m === 'arp' ? 'Arpège' : 'Écouter', m));
    wrap.append(foot);
  }
  el.append(wrap);
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
});
function kbFlash(kb, m, delay, dur) {
  setTimeout(() => { kb.press(m, true); setTimeout(() => kb.press(m, false), dur); }, delay);
}

/* Schéma nommé */
defineWidget('diagram', (el, cfg) => {
  const d = h('div');
  mountDiagram(d, cfg.name, cfg.opts || {});
  const frame = h('div', { class: 'w-frame' }, h('div', { class: 'w-body' }, d));
  el.append(frame);
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
});

/* Cycle des quintes */
defineWidget('cof', (el, cfg) => {
  const body = h('div', { class: 'w-body' });
  el.append(h('div', { class: 'w-frame' }, h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Cycle des quintes'), h('span', { class: 'w-sub' }, 'touche une tonalité')), body));
  circleOfFifths(body, cfg);
});

/* Exercices (quiz) */
defineWidget('quiz', (el, cfg) => mountQuiz(el, cfg));
defineWidget('analyzer', (el, cfg) => mountAnalyzer(el, cfg));
defineWidget('sight', (el, cfg) => mountSight(el, cfg));
defineWidget('improv', (el, cfg) => mountImprov(el, cfg));
defineWidget('metronome', (el, cfg) => mountMetronome(el, cfg));

/* Liste à cocher persistante */
defineWidget('checklist', (el, cfg) => {
  const frame = h('div', { class: 'w-frame' });
  if (cfg.title) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title)));
  const body = h('div', { class: 'w-body' });
  cfg.items.forEach((it, i) => {
    const key = `${cfg.id}:${i}`;
    const cb = h('input', { type: 'checkbox' });
    cb.checked = !!store.get('checks')?.[key];
    cb.addEventListener('change', () => { const c = { ...(store.get('checks') || {}) }; c[key] = cb.checked; store.set('checks', c); });
    body.append(h('label', { class: 'check', style: { display: 'flex', padding: '6px 0', alignItems: 'flex-start' } }, cb, h('span', { html: it })));
  });
  frame.append(body);
  el.append(frame);
});

/* Liens (Informance, écoutes, partitions) */
defineWidget('links', (el, cfg) => {
  if (cfg.title) el.append(h('div', { class: 'w-caption', style: { marginTop: 0, fontWeight: 650, color: 'var(--text-2)' } }, cfg.title));
  const ul = h('ul', { class: 'links' });
  for (const it of cfg.items) {
    const icon = it.kind === 'informance' ? ICONS.book : it.kind === 'score' ? ICONS.score : ICONS.video;
    ul.append(h('li', {}, h('a', { href: it.url, target: '_blank', rel: 'noopener' },
      h('span', { class: 'ico', html: icon }),
      h('span', { class: 'lk-t' }, it.title, it.note ? h('small', {}, it.note) : null),
      h('span', { class: 'ext', html: '↗' }))));
  }
  el.append(ul);
});
