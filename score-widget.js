// Partition interactive (écoute, mode attente, en rythme, analyse) — chargée à la demande avec abcjs.
import { h, esc, fmtPct, fmtNum } from './util.js';
import { Score, Player, Follower, TempoReader } from './score.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard } from './diagrams.js';
import { ICONS } from './icons.js';
import { ANALYSES } from './content-analyses.js';
import { barTools } from './analysis-engine.js';
import { analyze } from './analysis-client.js';
import { db } from './db.js';
import { passageKey, pieceOf, loadRef, Recorder, loadErrMap, addToErrMap, errMapStrip, replayTake, renderAnalysis } from './analysis-panel.js';

/* ------------------------------------------------------------------ */
/* Partition avec lecture et entraînement                              */
/* ------------------------------------------------------------------ */
export function mountScore(el, cfg) {
  const frame = h('div', { class: 'w-frame' });
  el.append(frame);
  if (cfg.title || cfg.sub) {
    frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || ''), cfg.sub ? h('span', { class: 'w-sub' }, cfg.sub) : null));
  }
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  const mapHost = h('div');
  const scoreHost = h('div');
  body.append(mapHost, scoreHost);
  let score;
  try {
    score = new Score(scoreHost, cfg.abc, { tracks: cfg.tracks, staffwidth: cfg.staffwidth, scale: cfg.scale });
  } catch (e) {
    scoreHost.textContent = 'Partition indisponible (' + e.message + ')';
    return;
  }
  const beatLabel = score.beatQ === 1.5 ? '♩.' : score.beatQ === 0.5 ? '♪' : score.beatQ === 2 ? '𝅗𝅥' : '♩';
  const baseBpm = cfg.bpm || (cfg.qpm ? Math.max(20, Math.round(cfg.qpm / score.beatQ)) : 60);
  let bpm = cfg.startBpm || (cfg.startPct ? Math.max(20, Math.round(baseBpm * cfg.startPct / 100)) : baseBpm);
  let hands = 'both';
  const player = new Player(score, {});

  // Mesures de l'extrait (numéros de la partition)
  const firstBar = cfg.bars && cfg.bars.length ? cfg.bars[0].n : +((cfg.abc.match(/%%setbarnb\s+(\d+)/) || [])[1] ?? 1);
  const meta = { barQ: score.barQ, beatQ: score.beatQ, pickupQ: score.pickupQ, firstBar, bars: cfg.bars || null };
  const bars = barTools(meta);
  const measures = [...new Set(score.events.map(e => bars.barOf(e.t)))].sort((a, b) => a - b);
  let range = null; // [m0, m1] ou null (tout)
  const rangeQ = () => (range ? [bars.barStart(range[0]), range[1] >= measures[measures.length - 1] ? score.totalQ + 1 : bars.barStart(range[1] + 1)] : null);
  const pid = cfg.passage || passageKey(cfg.abc);
  const piece = cfg.piece || pieceOf(cfg.abc);
  // V7 : travail sur une pièce → les sections de la carte touchées sont « travaillées aujourd'hui », et le journal
  // d'activité note la pièce phare du niveau en cours (ou « Autres pièces » pour les autres).
  const notePiece = () => {
    if (!piece) return;
    const m0 = range ? range[0] : measures[0], m1 = range ? range[1] : measures[measures.length - 1];
    Promise.all([import('./piecemap.js'), import('./content-index.js')]).then(([pm, ci]) => {
      const val = store.get('validation') || {};
      const L = ci.LEVELS.find(l => !l.locked && !(l.validation.length && l.validation.every(c => (val[`${l.id}:${c.id}`] ?? 0) >= 2)));
      pm.touchRange(piece, m0, m1, L && L.piece !== piece ? 'autres' : 'piece');
    }).catch(() => {});
  };

  const foot = h('div', { class: 'w-foot' });
  const ctrl = h('div', { class: 'score-ctrl' });
  const ctrl2 = h('div', { class: 'score-ctrl score-ctrl-2' });
  foot.append(ctrl);
  frame.append(foot);
  const status = h('div', { class: 'score-status' });
  const results = h('div', { class: 'result-strip' });
  const statusRow = h('div', { style: { width: '100%' } }, status, results);
  const takeHost = h('div');

  const playOpts = (extra = {}) => ({
    qpm: bpm * score.beatQ, hands, loop: loopOn, click: clickOn, range: rangeQ(),
    countIn: !!cfg.countIn, pedal: cfg.pedal, pedalEnd: cfg.pedalEnd, pedalUp: cfg.pedalUp, dyn: cfg.dyn, tempoMap: cfg.tempoMap,
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
  let tempoOut = null, tempoRng = null;
  const setBpm = v => { bpm = Math.round(v); if (tempoRng) { tempoRng.value = bpm; tempoOut.textContent = `${beatLabel} = ${bpm}`; } };
  if (cfg.tempo !== false) {
    tempoOut = h('output', {}, `${beatLabel} = ${bpm}`);
    tempoRng = h('input', { type: 'range', min: Math.max(20, Math.round(baseBpm * 0.3)), max: Math.round(baseBpm * 1.3), value: bpm, step: 1, 'aria-label': 'Tempo' });
    tempoRng.addEventListener('input', () => { bpm = +tempoRng.value; tempoOut.textContent = `${beatLabel} = ${bpm}`; });
    tempoRng.addEventListener('change', () => { if (player.playing) { player.set(playOpts(variants[activeVariant] || {})); player.play(); } });
    ctrl.append(h('label', { class: 'range' }, 'Tempo', tempoRng, tempoOut));
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
        refreshMap();
      });
      seg.append(b);
    });
    ctrl.append(seg);
  }
  // Options d'écoute
  let loopOn = !!cfg.loop, clickOn = !!cfg.click;
  const loopBtn = h('button', { class: 'btn sm' + (loopOn ? ' on' : ''), type: 'button', title: 'Lecture en boucle' }, 'Boucle');
  loopBtn.addEventListener('click', () => { loopOn = !loopOn; loopBtn.classList.toggle('on', loopOn); player.set({ loop: loopOn }); });
  const clickBtn = h('button', { class: 'btn sm' + (clickOn ? ' on' : ''), type: 'button', title: 'Métronome pendant la lecture et en rythme' }, 'Clic');
  clickBtn.addEventListener('click', () => { clickOn = !clickOn; clickBtn.classList.toggle('on', clickOn); });
  ctrl.append(clickBtn);
  // Options rarement utiles (boucle, montée de tempo, clavier à l'écran) : une seule touche « Options » les montre,
  // et ce choix vaut pour toutes les partitions. Partition d'illustration (sans entraînement) : la boucle reste visible.
  const ctrlOpt = h('div', { class: 'score-ctrl score-ctrl-opt' });
  if (cfg.practice === false) ctrl.append(loopBtn); else ctrlOpt.append(loopBtn);
  const optOpen = () => store.get('ui.scoreOpts') === true || loopOn;
  ctrlOpt.hidden = !optOpen();
  const moreBtn = h('button', { class: 'btn sm ghost more-btn' + (ctrlOpt.hidden ? '' : ' on'), type: 'button', 'aria-expanded': String(!ctrlOpt.hidden), title: 'Boucle, montée de tempo, clavier à l’écran' }, 'Options');
  moreBtn.addEventListener('click', () => {
    ctrlOpt.hidden = !ctrlOpt.hidden;
    moreBtn.classList.toggle('on', !ctrlOpt.hidden);
    moreBtn.setAttribute('aria-expanded', String(!ctrlOpt.hidden));
    store.set('ui.scoreOpts', !ctrlOpt.hidden);
  });

  /* ---------------- Plage de mesures ---------------- */
  const dimAll = () => {
    score.clear('n-dim');
    if (!range) return;
    for (const e of score.events) { const m = bars.barOf(e.t); if ((m < range[0] || m > range[1]) && e.char != null) score.mark(e.char, 'n-dim'); }
  };
  let selFrom = null, selTo = null, allBtn = null;
  const setRange = (r, quiet) => {
    range = r && !(r[0] === measures[0] && r[1] === measures[measures.length - 1]) ? [Math.min(r[0], r[1]), Math.max(r[0], r[1])] : null;
    if (selFrom) { selFrom.value = String(range ? range[0] : measures[0]); selTo.value = String(range ? range[1] : measures[measures.length - 1]); }
    if (allBtn) allBtn.hidden = !range;
    dimAll();
    if (player.playing) { player.set(playOpts(variants[activeVariant] || {})); player.play(); }
    if (!quiet) refreshMap();
  };
  if (measures.length > 1 && cfg.practice !== false) {
    const mLabel = m => (m === 0 ? 'levée' : String(m));
    selFrom = h('select', { 'aria-label': 'Première mesure' }, ...measures.map(m => h('option', { value: m }, mLabel(m))));
    selTo = h('select', { 'aria-label': 'Dernière mesure' }, ...measures.map(m => h('option', { value: m }, mLabel(m))));
    selTo.value = String(measures[measures.length - 1]);
    const onSel = () => setRange([+selFrom.value, +selTo.value]);
    selFrom.addEventListener('change', onSel); selTo.addEventListener('change', onSel);
    allBtn = h('button', { class: 'btn sm ghost', type: 'button', title: 'Revenir à toutes les mesures', hidden: true }, 'Tout');
    allBtn.addEventListener('click', () => setRange(null));
    ctrl2.append(h('label', { class: 'field range-m' }, 'Mesures', selFrom, h('span', { class: 'small' }, 'à'), selTo), allBtn);
  }

  /* ---------------- Carte des erreurs ---------------- */
  let mapAlive = true;
  const refreshMap = async () => {
    if (cfg.practice === false) return;
    const map = await loadErrMap(pid, hands);
    if (!mapAlive) return;
    mapHost.innerHTML = '';
    if (Object.keys(map).length) mapHost.append(errMapStrip(map, measures, { selected: range, onPick: m => setRange([m, m]) }));
  };
  refreshMap();

  /* ---------------- Entraînement ---------------- */
  let follower = null, reader = null, vk = null, recorder = null, ladder = null;
  const stopModes = () => {
    follower?.stop(); reader?.stop(); follower = reader = null;
    if (recorder) { recorder.stop(); recorder = null; }
    if (ladder) ladder.running = false;
    modeBtns.forEach(b => b.classList.remove('on'));
    if (anaBtn) anaBtn.textContent = 'Analyser';
  };
  const modeBtns = [];
  let anaBtn = null;
  if (cfg.practice !== false) {
    const waitBtn = h('button', { class: 'btn sm', type: 'button', title: 'Le curseur attend que tu joues la bonne note' }, 'Mode attente');
    const tempoBtn = h('button', { class: 'btn sm' + (cfg.drill ? ' primary' : ''), type: 'button', title: 'Décompte, puis joue en rythme : évaluation à la fin' }, 'En rythme');
    anaBtn = h('button', { class: 'btn sm', type: 'button', title: 'Joue le passage à ton tempo : analyse détaillée et exercices' }, 'Analyser');
    const ladderBtn = h('button', { class: 'btn sm ghost', type: 'button', title: 'En rythme : après 3 passages propres, le tempo monte de 5 % ; après un passage raté, il baisse' }, 'Montée de tempo');
    const kbBtn = h('button', { class: 'btn sm ghost', type: 'button', title: 'Afficher un clavier à l’écran' }, h('span', { html: ICONS.keys }), 'Clavier');
    modeBtns.push(waitBtn, tempoBtn, anaBtn);
    let ladderOn = false;
    ladderBtn.addEventListener('click', () => { ladderOn = !ladderOn; ladderBtn.classList.toggle('on', ladderOn); });
    ctrl2.append(waitBtn, tempoBtn, anaBtn);
    ctrlOpt.append(ladderBtn, kbBtn);
    foot.append(ctrl2);
    const needInput = () => {
      if (midi.status !== 'ready' && !vk) {
        const show = h('button', { class: 'linklike', type: 'button' }, 'affiche le clavier à l’écran');
        show.addEventListener('click', () => { if (!vk) kbBtn.click(); status.textContent = 'Clavier à l’écran affiché : relance le mode choisi.'; });
        status.innerHTML = '';
        status.append('Branche le piano (pastille « Connecter le piano » en haut) ou ', show, '.');
        return false;
      }
      return true;
    };
    const rangeLabel = () => (range ? `m. ${range[0]}${range[1] !== range[0] ? '–' + range[1] : ''}` : `m. ${measures[0]}–${measures[measures.length - 1]}`);
    waitBtn.addEventListener('click', () => {
      player.stop();
      if (follower) { stopModes(); status.textContent = ''; return; }
      if (!needInput()) return;
      stopModes(); score.clear(); dimAll();
      results.innerHTML = '';
      waitBtn.classList.add('on');
      follower = new Follower(score, {
        hands, range: rangeQ(),
        onStep: (i, n) => { status.textContent = `${rangeLabel()} · note ${i + 1} / ${n} — joue la ou les notes en bleu.`; },
        onDone: res => {
          waitBtn.classList.remove('on'); follower = null;
          status.textContent = 'Terminé.';
          results.innerHTML = `<span><b>${res.clean}</b> / ${res.steps} sans faute</span><span><b>${res.errors}</b> fausse${res.errors > 1 ? 's' : ''} note${res.errors > 1 ? 's' : ''}</span><span><b>${fmtNum(res.seconds, 0)}</b> s</span>`;
          if (cfg.stat) store.push('stats.sight', { id: cfg.stat, mode: 'wait', at: Date.now(), ...res });
          notePiece();
        },
      });
      follower.start();
    });
    // En rythme, avec montée de tempo facultative
    const runTempo = async () => {
      score.clear(); dimAll();
      results.innerHTML = '';
      tempoBtn.classList.add('on');
      const intro = ladder && ladder.running ? `Montée de tempo · ${beatLabel} = ${bpm} · ${ladder.clean}/3 passages propres — décompte, puis joue.` : `${rangeLabel()} · décompte, puis joue en suivant le curseur.`;
      status.textContent = intro;
      reader = new TempoReader(score, {
        hands, qpm: bpm * score.beatQ, range: rangeQ(), click: clickOn || (ladder && ladder.running),
        onCount: pos => { status.textContent = pos ? `Décompte : ${pos.waiting ? '…' : pos.inBar}${pos.bars > 1 ? ` (mesure ${pos.bar} sur ${pos.bars})` : ''} — puis joue.` : intro.replace(/décompte, puis /, ''); },
        onDone: res => {
          reader = null;
          results.innerHTML = `<span>Notes justes <b>${fmtPct(res.accuracy)}</b></span><span>Dans le temps <b>${fmtPct(res.precision)}</b></span><span>Écart moyen <b>${fmtNum(res.meanAbsMs)} ms</b></span><span>Notes en trop <b>${res.extra}</b></span>`;
          if (cfg.stat) store.push('stats.sight', { id: cfg.stat, mode: 'tempo', bpm, at: Date.now(), ...res });
          notePiece();
          // retour propre à l'exercice (onglet Exercices : main par main, articulation, nuances…)
          if (cfg.onTempo) {
            const extra = cfg.onTempo(res, { bpm, baseBpm, hands, setBpm, range: range ? range.slice() : null });
            takeHost.innerHTML = '';
            if (extra) takeHost.append(extra);
          }
          // carte des erreurs : notes manquées ou fausses par mesure
          const perBar = new Map();
          for (const r of res.items || []) { const m = bars.barOf(r.t); const o = perBar.get(m) || { m, errors: 0, total: 0 }; o.total++; if (r.status === 'miss') o.errors++; perBar.set(m, o); }
          if (perBar.size) addToErrMap(pid, hands, [...perBar.values()]).then(refreshMap);
          if (ladder && ladder.running) {
            const clean = res.accuracy >= 0.95 && res.precision >= 0.85;
            const failed = res.accuracy < 0.85;
            const step = Math.max(2, Math.round(baseBpm * 0.05));
            let msg;
            if (clean) {
              ladder.clean++;
              if (ladder.clean >= 3) {
                ladder.clean = 0;
                if (bpm < baseBpm) { setBpm(Math.min(baseBpm, bpm + step)); msg = `3 passages propres : le tempo monte à ${beatLabel} = ${bpm}.`; }
                else { msg = `Objectif atteint : 3 passages propres au tempo visé (${beatLabel} = ${baseBpm}).`; ladder.running = false; }
              } else msg = `Passage propre (${ladder.clean}/3).`;
            } else if (failed) {
              ladder.clean = 0;
              const floor = Math.max(20, Math.round(baseBpm * 0.4));
              setBpm(Math.max(floor, bpm - step)); msg = `Passage pas encore sûr : on redescend à ${beatLabel} = ${bpm}.`;
            } else { ladder.clean = 0; msg = 'Presque : on reste au même tempo.'; }
            status.textContent = msg + (ladder.running ? ' Suivant dans 2 s… (touche « En rythme » pour arrêter)' : '');
            if (ladder.running) { ladder.timer = setTimeout(() => { if (ladder && ladder.running) runTempo(); }, 2000); return; }
          } else status.textContent = 'Vert : juste et dans le temps · orange : juste mais décalé · rouge : manquée.';
          tempoBtn.classList.remove('on');
        },
      });
      await reader.start();
    };
    tempoBtn.addEventListener('click', async () => {
      player.stop();
      if (reader || (ladder && ladder.running)) { clearTimeout(ladder?.timer); stopModes(); ladder = null; status.textContent = ''; return; }
      if (!needInput()) return;
      stopModes();
      ladder = ladderOn ? { running: true, clean: 0 } : null;
      await runTempo();
    });

    // Analyser : prise libre, à ton tempo, puis analyse complète
    anaBtn.addEventListener('click', () => {
      player.stop();
      if (recorder) { const take = recorder.stop(); recorder = null; anaBtn.classList.remove('on'); anaBtn.textContent = 'Analyser'; finishTake(take); return; }
      if (!needInput()) return;
      stopModes(); score.clear(); dimAll();
      results.innerHTML = ''; takeHost.innerHTML = '';
      anaBtn.classList.add('on'); anaBtn.textContent = 'Terminer';
      status.textContent = `${rangeLabel()} : joue le passage quand tu veux, à ton tempo, sans t’arrêter. L’analyse démarre après 3 s de silence (ou touche « Terminer »).`;
      recorder = new Recorder({
        onFirstNote: () => { status.textContent = 'Enregistrement… joue jusqu’au bout du passage.'; },
        onAutoStop: take => { recorder = null; anaBtn.classList.remove('on'); anaBtn.textContent = 'Analyser'; finishTake(take); },
      });
      recorder.start();
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
  if (cfg.practice !== false) { ctrl2.append(moreBtn); foot.append(ctrlOpt); }
  foot.append(statusRow);
  frame.append(takeHost);

  /* ---------------- Analyse d'une prise ---------------- */
  let lastTake = null;
  const finishTake = async (take) => {
    if (take.notes.length < 3) { status.textContent = 'Pas assez de notes enregistrées : rejoue le passage.'; return; }
    status.textContent = 'Analyse en cours…';
    const rq = rangeQ();
    const expectedFull = score.filtered(hands).filter(e => !rq || (e.t >= rq[0] - 1e-6 && e.t < rq[1] - 1e-6));
    const expected = expectedFull.map(e => ({ pitch: e.pitch, t: e.t, dur: e.dur, hand: e.hand, vol: e.vol, orn: e.orn, grace: e.grace, arp: e.arp, ag: e.ag, gterm: e.gterm }));
    // changements d'harmonie (contrôle de la pédale) : indications de pédale de l'extrait, sinon analyse harmonique
    let harmony = cfg.pedal ? cfg.pedal.slice() : null;
    if (!harmony && an) harmony = harmonyStarts(score, an, cfg.abc);
    const input = { expected, notes: take.notes.map(n => ({ pitch: n.pitch, on: n.on, off: n.off, vel: n.vel })), pedal: take.pedal, harmony: harmony || [], meta: { ...meta, qpm: baseBpm * score.beatQ } };
    let res;
    try { res = await analyze(input); } catch (e) { status.textContent = 'Analyse impossible : ' + e.message; return; }
    if (!res.ok) { status.textContent = res.reason || 'Analyse impossible.'; return; }
    status.textContent = '';
    // partition : fausses notes en rouge, oubliées en orange
    score.clear(); dimAll();
    res.notes.forEach((r, i) => {
      if (!r || r.status === 'ok') return;
      const ch = expectedFull[i].char;
      if (ch != null) score.mark(ch, r.status === 'wrong' ? 'n-bad' : 'n-late');
    });
    const m0 = range ? range[0] : measures[0], m1 = range ? range[1] : measures[measures.length - 1];
    const takeRec = { passage: pid, piece, hands, range: [m0, m1], at: Date.now(), bpm: res.summary.bpm, target: res.summary.targetBpm, summary: res.takeSummary, notes: take.notes.map(n => [n.pitch, Math.round(n.on), Math.round(n.off), n.vel]), pedal: take.pedal.map(p => [Math.round(p.t), p.down ? 1 : 0]) };
    const prevAll = await db.takesOf(pid);
    const prev = prevAll.find(t => t.hands === hands && t.range && t.range[0] === m0 && t.range[1] === m1);
    const id = await db.addTake(takeRec);
    notePiece();
    await addToErrMap(pid, hands, res.measures.map(m => ({ m: m.m, errors: m.errors + m.extra, total: m.total })));
    refreshMap();
    lastTake = { ...take, id };
    const ref = await loadRef(piece);
    const demoCurve = cfg.tempoMap ? demoTempoCurve(cfg.tempoMap, bars, measures) : null;
    takeHost.innerHTML = '';
    takeHost.append(renderAnalysis({
      res, beatLabel, range: [m0, m1], hands, prev, ref, demoCurve, focus: cfg.focus,
      onAction: (a) => {
        if (a.type === 'loop' && a.from != null) {
          setRange([a.from, a.to]);
          // tempo de travail : un pourcentage du tempo auquel la prise a été jouée
          if (a.tempoPct) setBpm(Math.max(20, Math.min(baseBpm, Math.round(res.summary.bpm * a.tempoPct / 100))));
          status.textContent = `Plage m. ${a.from}${a.to !== a.from ? '–' + a.to : ''} à ${beatLabel} = ${bpm} : commence par « Mode attente », puis « En rythme » avec « Montée de tempo ».`;
          frame.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      onReplay: async (btn) => {
        if (btn.dataset.playing) { audio.stopAll('replay'); delete btn.dataset.playing; btn.textContent = 'Réécouter ma prise'; return; }
        player.stop();
        btn.dataset.playing = '1'; btn.textContent = 'Arrêter';
        const dur = await replayTake(lastTake, 'replay');
        setTimeout(() => { delete btn.dataset.playing; btn.textContent = 'Réécouter ma prise'; }, dur * 1000);
      },
      onWeek: async () => { const t = await db.get('takes', id); if (t) await db.put('takes', { ...t, week: true }); },
    }));
    frenchSpacingSafe(takeHost);
  };

  // Panneau d'analyse harmonique (extraits de pièces) : accords mesure par mesure, à écouter en blocs
  const an = cfg.analysis === false ? null : (cfg.analysis || ANALYSES.get(cfg.abc));
  let stopAnalysis = () => {};
  if (an) {
    const panel = analysisPanel(score, an, cfg.abc, () => bpm, () => { player.stop(); stopModes(); });
    frame.append(panel.el);
    stopAnalysis = panel.stop;
  }
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
  return () => { mapAlive = false; player.stop(); stopModes(); clearTimeout(ladder?.timer); stopAnalysis(); audio.stopAll('replay'); };
}

/* Typographie française dans le panneau de résultats (espaces fines), sans dépendre de app.js */
function frenchSpacingSafe(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (n.parentElement && n.parentElement.closest('svg')) continue;
    const t = n.nodeValue;
    const r = t.replace(/ ([?!;:»])/g, ' $1').replace(/« /g, '« ').replace(/(m\.) (\d)/g, '$1 $2').replace(/(\d) %/g, '$1 %');
    if (r !== t) n.nodeValue = r;
  }
}

/** Débuts des accords de l'analyse harmonique (en noires depuis le début de l'extrait). */
function harmonyStarts(score, an, abc) {
  const first = +((abc.match(/%%setbarnb\s+(\d+)/) || [])[1] ?? 1);
  const barStart = m => (score.pickupQ > 0 ? (m === first ? 0 : score.pickupQ + (m - first - 1) * score.barQ) : (m - first) * score.barQ);
  const out = [];
  for (const b of an.bars) for (const [, , , beat] of b.ch) out.push(barStart(b.m) + (beat - 1) * score.beatQ);
  return [...new Set(out.map(x => Math.round(x * 1000) / 1000))].sort((a, b) => a - b);
}

/** Courbe de tempo de la démo (rubato écrit dans tempoMap), en % de sa moyenne, par mesure. */
function demoTempoCurve(tempoMap, bars, measures) {
  const f = q => {
    if (q <= tempoMap[0][0]) return tempoMap[0][1];
    for (let i = 1; i < tempoMap.length; i++) { const [x1, y1] = tempoMap[i], [x0, y0] = tempoMap[i - 1]; if (q <= x1) return y0 + (y1 - y0) * (q - x0) / (x1 - x0 || 1); }
    return tempoMap[tempoMap.length - 1][1];
  };
  const vals = measures.map(m => { const a = bars.barStart(m), b = bars.barStart(m + 1); let s = 0, n = 0; for (let q = a; q < b; q += 0.25) { s += f(q); n++; } return s / Math.max(1, n); });
  const avg = vals.reduce((x, y) => x + y, 0) / vals.length;
  return Object.fromEntries(measures.map((m, i) => [m, Math.round(vals[i] / avg * 100)]));
}

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
  // repliée par défaut : un toucher l'ouvre (et ce choix vaut pour les analyses suivantes)
  const open0 = store.get('ui.harmonyOpen') === true;
  const toggle = h('button', { class: 'wa-toggle', type: 'button', 'aria-expanded': String(open0) },
    h('span', { class: 'wa-chev', 'aria-hidden': 'true' }), h('span', { class: 'wa-title' }, 'Analyse harmonique'), h('span', { class: 'wa-key' }, an.key));
  const head = h('div', { class: 'wa-head' }, toggle);
  const playAll = h('button', { class: 'btn sm', type: 'button', html: ICONS.play + 'Accords en blocs', hidden: !open0 });
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
  const inner = h('div', { class: 'wa-body', hidden: !open0 }, strip, legend);
  if (an.notes && an.notes.length) inner.append(h('ul', { class: 'wa-notes' }, ...an.notes.map(n => h('li', { html: n }))));
  box.classList.toggle('open', open0);
  toggle.addEventListener('click', () => {
    const o = inner.hidden;
    inner.hidden = !o; playAll.hidden = !o;
    box.classList.toggle('open', o);
    toggle.setAttribute('aria-expanded', String(o));
    store.set('ui.harmonyOpen', o);
    if (!o) stop();
  });
  box.append(head, inner);
  return { el: box, stop };
}
