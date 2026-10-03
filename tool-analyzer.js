// Analyseur de jeu (MIDI) : régularité, legato, pédale, équilibre des mains, nuances.
import { h, esc, mean, median, stdev, fmtNum, fmtPct, noteNameFr, clamp } from './util.js';
import { midi } from './midi.js';
import { audio } from './audio.js';
import { store } from './store.js';
import { Metronome } from './metronome.js';
import { deviationBars, lineChart, dotSeries, pedalTimeline, SERIES } from './charts.js';

export const ANALYZER_MODES = {
  evenness: { label: 'Régularité', help: 'Joue une gamme, un arpège ou un trait (une note à la fois). L’analyse mesure l’égalité des durées entre les notes et l’égalité des nuances.' },
  legato: { label: 'Legato', help: 'Joue une ligne mélodique legato, <b>sans pédale</b>. L’analyse mesure, à chaque changement de note, le chevauchement ou le trou entre deux notes.' },
  pedal: { label: 'Pédale', help: 'Joue une suite d’accords (par exemple i – iv – V7 – i) en changeant la pédale à chaque accord. L’analyse vérifie que chaque changement est « syncopé ».' },
  balance: { label: 'Équilibre', help: 'Joue mélodie et accompagnement. L’analyse compare la force de la main droite (au-dessus du point de séparation) et de la main gauche.' },
  voicing: { label: 'Voix supérieure', help: 'Joue des accords dans une main en faisant ressortir la note du haut. L’analyse mesure l’écart entre la note supérieure et les autres.' },
  dynamics: { label: 'Nuances', help: 'Contrôle des nuances : joue des notes répétées en visant successivement les niveaux indiqués (pp, p, mf, f).' },
};

const SILENCE_STOP_MS = 2600;

export function mountAnalyzer(el, cfg = {}) {
  const modes = cfg.modes || [cfg.mode || 'evenness'];
  let mode = modes[0];
  const frame = h('div', { class: 'w-frame' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Analyseur de jeu'));
  if (modes.length > 1) {
    const seg = h('div', { class: 'seg', style: { marginLeft: 'auto' } });
    modes.forEach(m => {
      const b = h('button', { type: 'button', class: m === mode ? 'on' : '' }, ANALYZER_MODES[m].label);
      b.addEventListener('click', () => { if (rec) stopRec(false); mode = m; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); renderIdle(); });
      seg.append(b);
    });
    head.append(seg);
  } else head.append(h('span', { class: 'w-sub' }, ANALYZER_MODES[mode].label));
  const body = h('div', { class: 'w-body' });
  const results = h('div', { class: 'w-body', style: { borderTop: '1px solid var(--line)' }, hidden: true });
  frame.append(head, body, results);
  el.append(frame);

  let rec = null;   // {events: [], start, offs: []}
  let silenceTimer = null;
  let metro = null;
  let lastTake = null;

  const renderIdle = () => {
    body.innerHTML = '';
    results.hidden = true;
    body.append(h('p', { class: 'small mt-0', html: (cfg.help || ANALYZER_MODES[mode].help) }));
    if (mode === 'dynamics') { renderDynamics(); return; }
    const row = h('div', { class: 'btn-row' });
    const recBtn = h('button', { class: 'btn primary', type: 'button' }, 'Enregistrer');
    recBtn.addEventListener('click', () => (rec ? stopRec(true) : startRec(recBtn)));
    row.append(recBtn);
    // métronome facultatif (régularité)
    if (mode === 'evenness') {
      const mBtn = h('button', { class: 'btn sm', type: 'button' }, 'Avec métronome');
      const bpmIn = h('input', { type: 'number', min: 30, max: 220, value: cfg.bpm || 72, style: { width: '76px' } });
      const subSel = h('select', {}, ...[[1, '♩'], [2, '♫ (2)'], [3, '3'], [4, '♬ (4)'], [6, '6']].map(([v, l]) => h('option', { value: v, selected: (cfg.sub || 4) === v }, l)));
      let useM = !!cfg.withMetronome;
      mBtn.classList.toggle('on', useM);
      mBtn.addEventListener('click', () => { useM = !useM; mBtn.classList.toggle('on', useM); });
      row.append(mBtn, h('label', { class: 'field', style: { flexDirection: 'row', alignItems: 'center', gap: '6px' } }, '♩ =', bpmIn), h('label', { class: 'field', style: { flexDirection: 'row', alignItems: 'center', gap: '6px' } }, 'notes par temps', subSel));
      row.dataset.metro = '1';
      row.getMetro = () => (useM ? { bpm: +bpmIn.value || 72, sub: +subSel.value || 4 } : null);
    }
    if (mode === 'balance') {
      const split = h('input', { type: 'number', min: 36, max: 84, value: store.get('settings.split') || 60, style: { width: '76px' } });
      split.addEventListener('change', () => store.set('settings.split', +split.value));
      row.append(h('label', { class: 'field', style: { flexDirection: 'row', alignItems: 'center', gap: '6px' } }, 'séparation MIDI', split, h('span', { class: 'small' }, '(60 = do3)')));
    }
    body.append(row);
    body.append(h('div', { class: 'score-status', id: '' }, midi.status === 'ready' ? `Piano connecté : ${midi.deviceName}` : 'Piano non connecté : touche la pastille « Connecter le piano » en haut de l’écran.'));
    body._row = row;
  };

  const startRec = (btn) => {
    results.hidden = true;
    rec = { events: [], start: null };
    btn.textContent = 'Arrêter';
    const stat = body.querySelector('.score-status');
    const m = body._row?.getMetro?.();
    if (m) {
      metro = new Metronome({ bpm: m.bpm, beats: 4, sub: 1 });
      metro.start();
      rec.metro = m;
    }
    stat.innerHTML = '<span class="rec-dot"></span> Enregistrement… joue maintenant (arrêt automatique après un silence).';
    const push = (type) => ev => {
      if (!rec) return;
      if (rec.start == null) rec.start = ev.time;
      rec.events.push({ type, note: ev.note, vel: ev.velocity, down: ev.down, time: ev.time });
      clearTimeout(silenceTimer);
      if (!m) silenceTimer = setTimeout(() => { if (rec && midi.active.size === 0) stopRec(true); }, SILENCE_STOP_MS);
    };
    rec.offs = [midi.on('noteon', push('on')), midi.on('noteoff', push('off')), midi.on('pedal', push('pedal'))];
  };

  const stopRec = (analyze) => {
    if (!rec) return;
    clearTimeout(silenceTimer);
    rec.offs.forEach(f => f());
    const take = rec;
    if (metro) { take.beats = metro.beatLog.map(b => b.perf); metro.stop(); metro = null; }
    rec = null;
    renderIdle();
    if (analyze) analyzeTake(take);
  };

  /* -------------------- Analyse -------------------- */
  const analyzeTake = (take) => {
    const ons = take.events.filter(e => e.type === 'on');
    if (ons.length < 3) { showMsg('Pas assez de notes enregistrées (au moins 3).'); return; }
    lastTake = take;
    results.innerHTML = '';
    results.hidden = false;
    let summary = null;
    if (mode === 'evenness') summary = anEvenness(take);
    else if (mode === 'legato') summary = anLegato(take);
    else if (mode === 'pedal') summary = anPedal(take);
    else if (mode === 'balance') summary = anBalance(take);
    else if (mode === 'voicing') summary = anVoicing(take);
    const row = h('div', { class: 'btn-row mt-2' });
    const replay = h('button', { class: 'btn sm', type: 'button' }, 'Réécouter la prise');
    replay.addEventListener('click', () => replayTake(take));
    row.append(replay);
    results.append(row);
    if (summary) store.push('stats.analyzer', { mode, at: Date.now(), ...summary, id: cfg.stat || null });
  };

  const showMsg = (msg) => { results.hidden = false; results.innerHTML = ''; results.append(h('p', { class: 'small mt-0' }, msg)); };

  const tile = (label, value, unit, level) => h('div', { class: 'stat ' + (level || '') }, h('div', { class: 'l' }, label), h('div', { class: 'v' }, value, unit ? h('small', {}, unit) : null));
  const verdict = (html) => h('div', { class: 'verdict mt-2', html });

  function groupOnsets(ons, tol = 30) {
    const groups = [];
    for (const e of ons) {
      const g = groups[groups.length - 1];
      if (g && e.time - g.time <= tol) g.notes.push(e);
      else groups.push({ time: e.time, notes: [e] });
    }
    return groups;
  }

  function anEvenness(take) {
    const ons = take.events.filter(e => e.type === 'on');
    const groups = groupOnsets(ons, 25);
    const times = groups.map(g => g.time);
    const iois = times.slice(1).map((t, i) => t - times[i]);
    const med = median(iois);
    const cv = stdev(iois) / (mean(iois) || 1);
    const dev = iois.map(x => (x - med) / med * 100);
    const vels = groups.map(g => Math.max(...g.notes.map(n => n.vel)));
    const vsd = stdev(vels);
    const tol = cfg.tolerance || 10;
    const out = iois.length ? dev.filter(d => Math.abs(d) > tol).length : 0;
    const level = cv < 0.06 ? 'good' : cv < 0.10 ? 'mid' : 'bad';
    const vLevel = vsd < 8 ? 'good' : vsd < 14 ? 'mid' : 'bad';
    const tiles = h('div', { class: 'an-grid' },
      tile('Irrégularité (CV)', fmtNum(cv * 100, 1), '%', level),
      tile('Notes hors tolérance', String(out), `/ ${iois.length}`, out === 0 ? 'good' : out <= 2 ? 'mid' : 'bad'),
      tile('Écart de nuance', fmtNum(vsd, 1), 'vélocité', vLevel),
      tile('Vitesse moyenne', fmtNum(1000 / med, 1), 'notes/s'));
    results.append(tiles);
    // métronome
    let metroInfo = '';
    if (take.beats && take.beats.length > 1 && take.metro) {
      const step = (60000 / take.metro.bpm) / take.metro.sub;
      const t0 = take.beats[0];
      const offs = times.map(t => { const k = Math.round((t - t0) / step); return t - (t0 + k * step); });
      const meanOff = mean(offs);
      metroInfo = ` Par rapport au métronome, tu joues en moyenne <b>${Math.abs(meanOff) < 12 ? 'pile dans le temps' : meanOff < 0 ? `${fmtNum(-meanOff)} ms en avance` : `${fmtNum(meanOff)} ms en retard`}</b> (écart typique ${fmtNum(stdev(offs))} ms).`;
    }
    results.append(h('div', { class: 'w-caption mt-2' }, h('b', {}, 'Écart de chaque intervalle par rapport à la médiane'), ` — bande verte : ± ${tol} %`));
    results.append(deviationBars({ values: dev, band: [-tol, tol], unit: ' %', tips: dev.map((d, i) => `${noteNameFr(groups[i].notes[0].note)} → ${noteNameFr(groups[i + 1].notes[0].note)} : ${d > 0 ? '+' : ''}${fmtNum(d)} %`), title: 'Écarts de durée', yLabel: '% d’écart' }));
    results.append(h('div', { class: 'w-caption mt-2' }, h('b', {}, 'Vélocité de chaque note'), ' — une ligne plate = des notes égales'));
    results.append(lineChart({ values: vels, yMin: 0, yMax: 127, tips: vels.map((v, i) => `${noteNameFr(groups[i].notes[0].note)} : ${v}`), title: 'Vélocités' }));
    const worst = dev.map((d, i) => ({ d, i })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
    let txt = level === 'good' ? '<b>Très régulier.</b> Tu peux monter le tempo de 4 à 6 battements.' : level === 'mid' ? '<b>Correct, mais perfectible.</b> Travaille en rythmes (pointé, inversé) puis en groupes, et reviens mesurer.' : '<b>Irrégulier.</b> Ralentis nettement : la régularité vient avant la vitesse.';
    if (worst && Math.abs(worst.d) > tol) txt += ` Le plus gros écart est entre <b>${noteNameFr(groups[worst.i].notes[0].note)}</b> et <b>${noteNameFr(groups[worst.i + 1].notes[0].note)}</b> (${worst.d > 0 ? 'trop long' : 'trop court'}) : souvent un passage du pouce ou un changement de position à préparer.`;
    if (vLevel !== 'good') txt += ' Les nuances varient beaucoup d’une note à l’autre : écoute l’égalité du son, pas seulement celle du rythme.';
    results.append(verdict(txt + metroInfo));
    return { cv, vsd };
  }

  function anLegato(take) {
    const ons = take.events.filter(e => e.type === 'on').sort((a, b) => a.time - b.time);
    const offs = take.events.filter(e => e.type === 'off');
    const pedalUsed = take.events.some(e => e.type === 'pedal' && e.down);
    const notes = ons.map(on => {
      const off = offs.find(o => o.note === on.note && o.time >= on.time);
      return { note: on.note, on: on.time, off: off ? off.time : on.time + 300 };
    });
    const trans = [];
    for (let i = 1; i < notes.length; i++) trans.push({ ov: notes[i - 1].off - notes[i].on, a: notes[i - 1].note, b: notes[i].note });
    const lo = -15, hi = 80;
    const good = trans.filter(t => t.ov >= lo && t.ov <= hi).length;
    const gaps = trans.filter(t => t.ov < lo).length;
    const overl = trans.filter(t => t.ov > hi).length;
    const pct = good / (trans.length || 1);
    results.append(h('div', { class: 'an-grid' },
      tile('Transitions legato', fmtPct(pct), '', pct >= 0.8 ? 'good' : pct >= 0.6 ? 'mid' : 'bad'),
      tile('Trous (détaché)', String(gaps), '', gaps === 0 ? 'good' : gaps <= 2 ? 'mid' : 'bad'),
      tile('Superpositions', String(overl), '', overl === 0 ? 'good' : overl <= 2 ? 'mid' : 'bad'),
      tile('Chevauchement médian', fmtNum(median(trans.map(t => t.ov))), 'ms')));
    results.append(h('div', { class: 'w-caption mt-2' }, h('b', {}, 'Chevauchement à chaque changement de note'), ' — au-dessus de 0 : les notes se chevauchent ; en dessous : un trou. Bande verte : legato propre.'));
    results.append(deviationBars({ values: trans.map(t => t.ov), band: [lo, hi], unit: ' ms', tips: trans.map(t => `${noteNameFr(t.a)} → ${noteNameFr(t.b)} : ${t.ov >= 0 ? 'chevauchement ' + fmtNum(t.ov) : 'trou ' + fmtNum(-t.ov)} ms`), title: 'Legato', yLabel: 'ms' }));
    let txt = pct >= 0.8 ? '<b>Legato maîtrisé.</b>' : gaps > overl ? '<b>Des trous entre les notes.</b> Le doigt suivant doit enfoncer sa touche avant que le précédent ne la relâche : pense « transfert de poids » d’un doigt à l’autre.' : '<b>Les notes se superposent trop.</b> Relève le doigt précédent au moment où le suivant enfonce sa touche, sinon le son se brouille comme avec trop de pédale.';
    if (pedalUsed) txt += ' Attention : la pédale a été utilisée pendant l’enregistrement ; refais l’essai sans pédale pour juger le legato des doigts.';
    results.append(verdict(txt));
    return { pct };
  }

  function anPedal(take) {
    const ons = take.events.filter(e => e.type === 'on');
    const peds = take.events.filter(e => e.type === 'pedal');
    const groups = groupOnsets(ons, 70);
    if (!peds.length) { results.append(verdict('Aucun mouvement de pédale reçu. Vérifie que la pédale est branchée sur le piano (prise SUSTAIN).')); return null; }
    const t0 = Math.min(groups[0].time, peds[0].time);
    const changes = [];
    for (let i = 1; i < groups.length; i++) {
      const g = groups[i], prev = groups[i - 1];
      const next = groups[i + 1];
      const upBetween = peds.find(p => !p.down && p.time > prev.time + 40 && p.time <= g.time + 120);
      const downAfter = peds.find(p => p.down && p.time > g.time - 30 && (!next || p.time < next.time));
      const wasDownBefore = (() => { let st = false; for (const p of peds) { if (p.time > prev.time + 40) break; st = p.down; } return st; })();
      let status, label;
      if (!upBetween && wasDownBefore) { status = 'bad'; label = 'brouillé : la pédale n’a pas été relevée entre les deux accords'; }
      else if (!downAfter) { status = 'warn'; label = 'pédale non reprise après l’accord'; }
      else {
        const delay = downAfter.time - g.time;
        if (delay < 25) { status = 'warn'; label = `pédale reprise en même temps que l’accord (${fmtNum(delay)} ms) : risque de trou de son`; }
        else if (delay > 450) { status = 'warn'; label = `pédale reprise tard (${fmtNum(delay)} ms après l’accord)`; }
        else { status = 'ok'; label = `syncopée : reprise ${fmtNum(delay)} ms après l’accord`; }
      }
      changes.push({ t: (g.time - t0) / 1000, status, tip: `Accord ${i + 1} : ${label}`, delay: downAfter ? downAfter.time - g.time : null });
    }
    const ok = changes.filter(c => c.status === 'ok').length;
    const blur = changes.filter(c => c.status === 'bad').length;
    const pct = ok / (changes.length || 1);
    const delays = changes.filter(c => c.delay != null && c.status === 'ok').map(c => c.delay);
    results.append(h('div', { class: 'an-grid' },
      tile('Changements syncopés', fmtPct(pct), '', pct >= 0.8 ? 'good' : pct >= 0.5 ? 'mid' : 'bad'),
      tile('Changements brouillés', String(blur), '', blur === 0 ? 'good' : 'bad'),
      tile('Délai de reprise médian', delays.length ? fmtNum(median(delays)) : '—', 'ms')));
    const dur = (Math.max(...take.events.map(e => e.time)) - t0) / 1000 + 0.3;
    results.append(h('div', { class: 'w-caption mt-2' }, h('b', {}, 'Frise'), ' — traits bleus : accords ; ligne : pédale (en bas = enfoncée). Points : vert = syncopé, orange = à surveiller, rouge = brouillé. Touche un point pour le détail.'));
    results.append(pedalTimeline({ onsets: groups.map((g, i) => ({ t: (g.time - t0) / 1000, tip: `Accord ${i + 1} : ${g.notes.map(n => noteNameFr(n.note, { octave: false })).join(' ')}` })), pedal: peds.map(p => ({ t: (p.time - t0) / 1000, down: p.down })), changes, duration: dur }));
    let txt = pct >= 0.8 ? '<b>Pédale propre.</b> Les harmonies s’enchaînent sans trou ni mélange.' : blur ? '<b>Des harmonies se mélangent.</b> Relève franchement la pédale <i>au moment</i> où tu joues le nouvel accord.' : '<b>Le geste est presque là.</b> Joue l’accord, <i>puis</i> reprends la pédale : le pied arrive juste après les doigts.';
    results.append(verdict(txt));
    return { pct };
  }

  function anBalance(take) {
    const split = store.get('settings.split') || 60;
    const ons = take.events.filter(e => e.type === 'on');
    const t0 = ons[0].time;
    const rh = ons.filter(e => e.note >= split), lh = ons.filter(e => e.note < split);
    if (!rh.length || !lh.length) { results.append(verdict(`Il faut des notes des deux côtés du point de séparation (${noteNameFr(split)}).`)); return null; }
    const mr = mean(rh.map(e => e.vel)), ml = mean(lh.map(e => e.vel));
    const diff = mr - ml;
    const target = cfg.target ?? 12;
    results.append(h('div', { class: 'an-grid' },
      tile('Main droite (moyenne)', fmtNum(mr), 'vélocité'),
      tile('Main gauche (moyenne)', fmtNum(ml), 'vélocité'),
      tile('Écart MD − MG', (diff > 0 ? '+' : '') + fmtNum(diff), '', diff >= target ? 'good' : diff >= target / 2 ? 'mid' : 'bad')));
    results.append(dotSeries({
      series: [
        { name: 'Main droite', color: SERIES.rh, mean: mr, points: rh.map(e => ({ x: (e.time - t0) / 1000, y: e.vel, tip: `MD ${noteNameFr(e.note)} : ${e.vel}` })) },
        { name: 'Main gauche', color: SERIES.lh, mean: ml, points: lh.map(e => ({ x: (e.time - t0) / 1000, y: e.vel, tip: `MG ${noteNameFr(e.note)} : ${e.vel}` })) },
      ], xLabel: 'temps (s)', yLabel: 'vélocité', title: 'Vélocités par main',
    }));
    results.append(verdict(diff >= target ? `<b>La mélodie domine nettement</b> (+${fmtNum(diff)}). Vérifie à la réécoute que l’accompagnement reste présent.` : diff >= target / 2 ? `<b>La mélodie ressort un peu</b> (+${fmtNum(diff)}). Vise au moins +${target} : allège la main gauche plutôt que de forcer la droite.` : `<b>La main gauche couvre la mélodie</b> (${diff > 0 ? '+' : ''}${fmtNum(diff)}). Joue la main gauche seule très légèrement, puis rajoute la droite « au-dessus ».`));
    return { diff };
  }

  function anVoicing(take) {
    const ons = take.events.filter(e => e.type === 'on');
    const groups = groupOnsets(ons, 45).filter(g => g.notes.length >= 2);
    if (!groups.length) { results.append(verdict('Aucun accord détecté (au moins 2 notes jouées ensemble).')); return null; }
    const diffs = groups.map(g => {
      const sorted = [...g.notes].sort((a, b) => b.note - a.note);
      return sorted[0].vel - mean(sorted.slice(1).map(n => n.vel));
    });
    const target = cfg.target ?? 10;
    const good = diffs.filter(d => d >= target).length;
    results.append(h('div', { class: 'an-grid' },
      tile('Accords avec voix supérieure dominante', fmtPct(good / diffs.length), '', good / diffs.length >= 0.8 ? 'good' : good / diffs.length >= 0.5 ? 'mid' : 'bad'),
      tile('Écart moyen', (mean(diffs) > 0 ? '+' : '') + fmtNum(mean(diffs)), 'vélocité')));
    results.append(h('div', { class: 'w-caption mt-2' }, h('b', {}, 'Écart note supérieure − autres notes, accord par accord'), ` — bande verte : au moins +${target}`));
    results.append(deviationBars({ values: diffs, band: [target, Math.max(target + 1, ...diffs, target + 20)], tips: diffs.map((d, i) => `Accord ${i + 1} : ${d > 0 ? '+' : ''}${fmtNum(d)}`), title: 'Voix supérieure' }));
    results.append(verdict(good / diffs.length >= 0.8 ? '<b>La voix du haut chante.</b>' : '<b>La voix du haut ne ressort pas assez.</b> Mets le poids côté 5e doigt, laisse les autres doigts « passifs », presque à fleur de touche.'));
    return { pct: good / diffs.length };
  }

  /* -------------------- Nuances (exercice guidé) -------------------- */
  function renderDynamics() {
    const levels = cfg.levels || [{ n: 'pp', v: 28 }, { n: 'p', v: 45 }, { n: 'mf', v: 64 }, { n: 'f', v: 86 }];
    const per = cfg.per || 4;
    const tol = cfg.tol || 8;
    let li = 0, count = 0, hits = [];
    const target = h('div', { class: 'big-score' });
    const meter = h('div', { style: { position: 'relative', height: '34px', background: 'var(--surface-2)', borderRadius: '8px', margin: '12px 0', overflow: 'hidden' } });
    const band = h('div', { style: { position: 'absolute', top: 0, bottom: 0, background: 'rgba(46,122,76,.18)' } });
    const needle = h('div', { style: { position: 'absolute', top: '3px', bottom: '3px', width: '4px', borderRadius: '2px', background: SERIES.one, left: '0%', transition: 'left .08s' } });
    meter.append(band, needle);
    const info = h('div', { class: 'small' });
    const startBtn = h('button', { class: 'btn primary', type: 'button' }, 'Commencer');
    body.append(target, meter, info, startBtn);
    let off = null;
    const show = () => {
      const L = levels[li];
      target.innerHTML = '';
      target.append(h('div', {}, h('div', { class: 'v' }, L.n), h('div', { class: 'l' }, `cible : vélocité ${L.v - tol} à ${L.v + tol}`)), h('div', {}, h('div', { class: 'v' }, `${count}/${per}`), h('div', { class: 'l' }, 'notes réussies')));
      band.style.left = ((L.v - tol) / 127 * 100) + '%';
      band.style.width = (2 * tol / 127 * 100) + '%';
    };
    startBtn.addEventListener('click', () => {
      li = 0; count = 0; hits = [];
      startBtn.hidden = true;
      show();
      info.textContent = 'Joue une même note plusieurs fois (do3 par exemple).';
      off?.();
      off = midi.on('noteon', ev => {
        const L = levels[li];
        needle.style.left = (ev.velocity / 127 * 100) + '%';
        const okHit = Math.abs(ev.velocity - L.v) <= tol;
        hits.push({ level: L.n, v: ev.velocity, ok: okHit });
        if (okHit) count++;
        info.innerHTML = okHit ? `Oui : ${ev.velocity}.` : `${ev.velocity} — ${ev.velocity > L.v ? 'trop fort' : 'trop doux'}.`;
        if (count >= per) {
          li++; count = 0;
          if (li >= levels.length) {
            off(); off = null;
            const tries = hits.length, ok = hits.filter(x => x.ok).length;
            info.innerHTML = `<b>Terminé.</b> ${ok} notes dans la cible sur ${tries} essais (${fmtPct(ok / tries)}). ${ok / tries >= 0.7 ? 'Belle maîtrise.' : 'Le pp est souvent le plus difficile : joue près de la touche, avec une vitesse d’enfoncement lente.'}`;
            store.push('stats.analyzer', { mode: 'dynamics', at: Date.now(), pct: ok / tries, id: cfg.stat || null });
            startBtn.hidden = false; startBtn.textContent = 'Recommencer';
            return;
          }
        }
        show();
      });
    });
    return () => off?.();
  }

  /* -------------------- Réécoute -------------------- */
  async function replayTake(take) {
    audio.claim('replay', () => audio.stopAll('replay'));
    await audio.ensure();
    audio.stopAll('replay');
    const t0 = audio.now() + 0.1;
    const base = take.events[0].time;
    let pedal = false;
    const pending = new Map();
    const sustained = new Set();
    let tEnd = t0;
    for (const e of take.events) {
      const t = t0 + (e.time - base) / 1000;
      tEnd = Math.max(tEnd, t);
      if (e.type === 'on') {
        // même touche rejouée : l'ancienne note s'arrête (sinon elle resterait suspendue)
        const old = pending.get(e.note);
        if (old) { audio.noteOff(old, t); sustained.delete(old); }
        for (const sv of sustained) if (sv && sv.midi === e.note) { audio.noteOff(sv, t); sustained.delete(sv); }
        const v = audio.noteOn(e.note, e.vel, t, { owner: 'replay' });
        pending.set(e.note, v);
      } else if (e.type === 'off') {
        const v = pending.get(e.note);
        if (!v) continue;
        if (pedal) sustained.add(v); else audio.noteOff(v, t);
        pending.delete(e.note);
      } else if (e.type === 'pedal') {
        pedal = e.down;
        if (!pedal) { for (const v of sustained) audio.noteOff(v, t); sustained.clear(); }
      }
    }
    // fin de la prise : on relâche ce qui sonne encore
    for (const v of [...pending.values(), ...sustained]) if (v) audio.noteOff(v, tEnd + 1.5);
  }

  renderIdle();
  return () => { if (rec) stopRec(false); metro?.stop(); };
}
