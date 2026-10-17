// Lecture de notes chronométrée (V4.2) : une minute pour lire le plus de notes possible, au piano (la bonne touche)
// ou par leur nom. Score en notes justes par minute, notes lentes et notes ratées, record et courbe sur 30 jours.
// Les notes lentes ou ratées reviennent plus souvent (statistiques par note, gardées sur l'appareil).
import { h, esc, pick, pc, noteNameFr, midiToAbc, fmtPct } from './util.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { keyboard } from './diagrams.js';
import { lineChart } from './charts.js';

const DURATION = 60; // secondes
const dur = () => (typeof window !== 'undefined' && window.__nsDuration) || DURATION; // durée réduite pour les tests automatiques
const CLEFS = { treble: 'clé de sol', bass: 'clé de fa', both: 'les deux clés' };
const RANGES = { staff: 'dans la portée', ledger: 'jusqu’à 2 lignes supplémentaires', far: 'jusqu’à 4 lignes supplémentaires' };
// notes naturelles (MIDI) par clé : dans la portée (et juste autour), puis jusqu'à deux lignes supplémentaires
const POOLS = {
  treble: { staff: [62, 79], ledger: [57, 84], far: [50, 91] }, // ± 4 lignes : ré2 (sous la 4e ligne) à sol5
  bass: { staff: [41, 59], ledger: [36, 64], far: [29, 71] },   // fa0 à si3
};
// repères (notes justes par minute) : une lecture déjà fluide
const TARGET = { staff: 40, ledger: 30, far: 24 }; // 5 de moins avec les altérations
const targetOf = c => TARGET[c.range] - (c.acc ? 5 : 0);
const NAMES7 = [['do', 0], ['ré', 2], ['mi', 4], ['fa', 5], ['sol', 7], ['la', 9], ['si', 11]];
const NAMES12 = [['do', 0], ['do♯ ré♭', 1], ['ré', 2], ['ré♯ mi♭', 3], ['mi', 4], ['fa', 5], ['fa♯ sol♭', 6], ['sol', 7], ['sol♯ la♭', 8], ['la', 9], ['la♯ si♭', 10], ['si', 11]];
const isNatural = m => [0, 2, 4, 5, 7, 9, 11].includes(pc(m));

/** Les notes possibles pour un réglage : { m (MIDI), clef, flat (orthographe en bémol) }. */
function poolOf(conf) {
  const clefs = conf.clef === 'both' ? ['treble', 'bass'] : [conf.clef];
  const out = [];
  for (const clef of clefs) {
    const [lo, hi] = POOLS[clef][conf.range] || POOLS[clef].ledger;
    for (let m = lo; m <= hi; m++) {
      if (isNatural(m)) out.push({ m, clef, flat: false, w0: 1 });
      // touches noires : mi♭, la♭, si♭ en bémols ; do♯, fa♯ en dièses (les orthographes les plus courantes)
      else if (conf.acc) out.push({ m, clef, flat: [3, 8, 10].includes(pc(m)), w0: 0.7 });
    }
  }
  return out;
}
const confKey = c => `${c.clef}:${c.range}${c.acc ? '+acc' : ''}:${c.input}${c.input === 'piano' && !c.exact ? ':oct' : ''}`;
const noteKey = n => `${n.clef}:${n.m}${n.flat ? 'b' : ''}`;
const nameOf = n => noteNameFr(n.m, { octave: true, flats: n.flat });
const dayOf = t => new Date(t).toDateString();

export function mountNoteSpeed(el, opts = {}) {
  const saved = store.get('notespeed') || {};
  const conf = { clef: 'treble', range: 'staff', acc: false, input: midi.status === 'ready' ? 'piano' : 'names', exact: true, ...(saved.conf || {}) };
  if (conf.range === 'acc') { conf.range = 'ledger'; conf.acc = true; } // réglage de la V4.2
  const frame = h('div', { class: 'w-frame notespeed' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Lecture de notes chronométrée'), h('span', { class: 'w-sub' }, 'une minute, le plus de notes justes possible'));
  const body = h('div', { class: 'w-body' });
  frame.append(head, body);
  el.append(frame);

  /* ---------- réglages ---------- */
  const seg = (label, key, items) => {
    const box = h('div', { class: 'seg', role: 'group', 'aria-label': label });
    for (const [v, l] of items) {
      const b = h('button', { type: 'button', class: conf[key] === v ? 'on' : '' }, l);
      b.addEventListener('click', () => { if (running) return; conf[key] = v; box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); saveConf(); renderIdle(); });
      box.append(b);
    }
    return h('label', { class: 'field inline' }, label, box);
  };
  const exactCb = h('input', { type: 'checkbox', checked: conf.exact });
  exactCb.addEventListener('change', () => { conf.exact = exactCb.checked; saveConf(); renderIdle(); });
  const exactLbl = h('label', { class: 'check small' }, exactCb, 'À la bonne octave');
  const accCb = h('input', { type: 'checkbox', checked: conf.acc });
  accCb.addEventListener('change', () => { if (running) { accCb.checked = conf.acc; return; } conf.acc = accCb.checked; saveConf(); renderIdle(); });
  const accLbl = h('label', { class: 'check small' }, accCb, 'Altérations');
  const settings = h('div', { class: 'score-ctrl ns-settings' },
    seg('Clé', 'clef', [['treble', 'Sol'], ['bass', 'Fa'], ['both', 'Les deux']]),
    seg('Notes', 'range', [['staff', 'Portée'], ['ledger', '± 2 lignes'], ['far', '± 4 lignes']]),
    accLbl,
    seg('Réponse', 'input', [['piano', 'Au piano'], ['names', 'Par le nom']]),
    exactLbl);
  const info = h('p', { class: 'small ns-info' });
  const startBtn = h('button', { class: 'btn primary', type: 'button' }, 'Commencer (1 minute)');
  // résultats sous les réglages : on change de réglage ou on recommence sans quitter la page
  const idle = h('div', { class: 'ns-idle' }, settings, info, h('div', { class: 'btn-row' }, startBtn));

  /* ---------- pendant la minute ---------- */
  const timeBar = h('div', { class: 'progress ns-time' }, h('i'));
  const counter = h('div', { class: 'ns-count' });
  const staff = h('div', { class: 'ns-staff', 'aria-live': 'polite' });
  const fb = h('div', { class: 'ns-fb' });
  const inputHost = h('div', { class: 'ns-input' });
  const stopBtn = h('button', { class: 'btn ghost sm', type: 'button' }, 'Arrêter');
  const stage = h('div', { class: 'ns-stage', hidden: true }, h('div', { class: 'ns-top' }, counter, stopBtn), timeBar, staff, fb, inputHost);
  const results = h('div', { class: 'ns-results', hidden: true });
  body.append(idle, stage, results);

  const saveConf = () => store.set('notespeed', { ...(store.get('notespeed') || {}), conf: { ...conf } });
  const history = () => (store.get('notespeed') || {}).history || [];
  const best = () => history().filter(x => x.key === confKey(conf)).reduce((a, x) => Math.max(a, x.npm), 0);

  const renderIdle = () => {
    exactLbl.hidden = conf.input !== 'piano';
    const b = best();
    const target = targetOf(conf);
    info.innerHTML = `${esc(CLEFS[conf.clef])}, ${esc(RANGES[conf.range])}${conf.acc ? ', avec altérations' : ''}, ${conf.input === 'piano' ? (conf.exact ? 'au piano, à la bonne octave' : 'au piano, n’importe quelle octave') : 'par le nom'}. `
      + (b ? `Ton record : <b>${b} notes justes par minute</b> · repère : ${target}.` : `Repère d’une lecture déjà fluide : ${target} notes justes par minute.`)
      + (conf.input === 'piano' && midi.status !== 'ready' ? ' Piano non connecté : un clavier s’affiche à l’écran.' : '');
  };

  /* ---------- choix des notes : les lentes et les ratées reviennent plus souvent ---------- */
  const stats = () => (store.get('notespeed') || {}).notes || {};
  const chooseNext = (pool, last) => {
    const S = stats();
    const seen = Object.values(S).filter(x => x.n);
    const avg = seen.length ? seen.reduce((a, x) => a + x.rt / Math.max(1, x.n - x.err), 0) / seen.length : 1500;
    const w = pool.map(n => {
      if (last && n.m === last.m && n.clef === last.clef) return 0;
      const s = S[noteKey(n)];
      if (!s || !s.n) return 1.4 * n.w0;
      const errRate = s.err / s.n;
      const rt = s.rt / Math.max(1, s.n - s.err);
      return n.w0 * (1 + 3 * errRate + Math.max(0, rt / avg - 1) * 1.5);
    });
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  };
  const recordNote = (n, ok, rt) => {
    const all = store.get('notespeed') || {};
    const S = { ...(all.notes || {}) };
    const k = noteKey(n);
    const s = { ...(S[k] || { n: 0, rt: 0, err: 0 }) };
    s.n++; if (ok) s.rt += rt; else s.err++;
    if (s.n > 40) { s.n /= 2; s.rt /= 2; s.err /= 2; } // garder surtout les essais récents
    S[k] = s;
    store.set('notespeed', { ...all, notes: S });
  };

  /* ---------- la minute ---------- */
  let running = false, cur = null, shownAt = 0, locked = false, t0 = 0, raf = 0, timers = [], offMidi = null, session = null;
  const drawNote = n => {
    staff.innerHTML = '';
    const div = h('div');
    staff.append(div);
    const abc = `X:1\nL:1/4\nK:C clef=${n.clef}\n${midiToAbc(n.m, { flats: n.flat })}4`;
    try { window.ABCJS.renderAbc(div, abc, { staffwidth: 150, scale: 2, paddingtop: 0, paddingbottom: 0, paddingleft: 0, paddingright: 0, add_classes: true }); }
    catch (e) { div.textContent = nameOf(n); }
  };
  const next = () => {
    cur = chooseNext(session.pool, cur);
    drawNote(cur);
    shownAt = performance.now();
    locked = false;
    fb.textContent = ''; fb.className = 'ns-fb';
  };
  const answer = (ok, given = null) => {
    if (!running || locked || !cur) return;
    const rt = performance.now() - shownAt;
    recordNote(cur, ok, rt);
    session.items.push({ key: noteKey(cur), name: nameOf(cur), ok, rt });
    if (ok) { session.ok++; fb.textContent = '✓'; fb.className = 'ns-fb ok'; locked = true; timers.push(setTimeout(next, 120)); }
    else {
      session.err++; locked = true;
      fb.innerHTML = `C’était <b>${esc(nameOf(cur))}</b>${given ? ` (tu as joué ${esc(given)})` : ''}`; fb.className = 'ns-fb bad';
      timers.push(setTimeout(next, 900));
    }
    counter.innerHTML = `<b>${session.ok}</b> juste${session.ok > 1 ? 's' : ''} · ${session.err} erreur${session.err > 1 ? 's' : ''}`;
  };
  const buildInput = () => {
    inputHost.innerHTML = '';
    if (conf.input === 'names') {
      const grid = h('div', { class: 'ns-names' + (conf.acc ? ' twelve' : '') });
      for (const [label, p] of (conf.acc ? NAMES12 : NAMES7)) {
        const b = h('button', { class: 'btn', type: 'button' }, label);
        b.addEventListener('pointerdown', e => { e.preventDefault(); if (!cur) return; answer(pc(cur.m) === p, label.split(' ')[0]); });
        grid.append(b);
      }
      inputHost.append(grid);
    } else if (midi.status !== 'ready') {
      const lo = Math.min(...session.pool.map(n => n.m)), hi = Math.max(...session.pool.map(n => n.m));
      let from = lo - 2, to = hi + 2;
      while ([1, 3, 6, 8, 10].includes(pc(from))) from--;
      while ([1, 3, 6, 8, 10].includes(pc(to))) to++;
      inputHost.append(h('div', { class: 'quiz-kbd' }, keyboard({ from, to, interactive: true, names: 'c', height: 96, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) })));
    }
  };
  const start = async () => {
    if (running) return;
    try { await audio.ensure(); } catch (e) { /* le son n'est pas indispensable */ }
    session = { pool: poolOf(conf), ok: 0, err: 0, items: [], key: confKey(conf) };
    running = true;
    idle.hidden = true; results.hidden = true; stage.hidden = false;
    buildInput();
    counter.textContent = 'Prêt…';
    if (conf.input === 'piano') {
      offMidi = midi.on('noteon', ev => {
        if (!running || !cur || locked) return;
        const ok = conf.exact ? ev.note === cur.m : pc(ev.note) === pc(cur.m);
        answer(ok, ok ? null : noteNameFr(ev.note, { octave: conf.exact, flats: cur.flat }));
      });
    }
    // 3, 2, 1 puis la minute
    let k = 3;
    staff.innerHTML = `<div class="ns-go">${k}</div>`;
    const tick = () => {
      k--;
      if (k > 0) { staff.innerHTML = `<div class="ns-go">${k}</div>`; timers.push(setTimeout(tick, 700)); return; }
      t0 = performance.now();
      counter.innerHTML = '<b>0</b> juste · 0 erreur';
      next();
      const frameFn = () => {
        if (!running) return;
        const left = Math.max(0, dur() - (performance.now() - t0) / 1000);
        timeBar.firstChild.style.width = `${left / dur() * 100}%`;
        timeBar.classList.toggle('low', left < 10);
        if (left <= 0) { finish(true); return; }
        raf = requestAnimationFrame(frameFn);
      };
      raf = requestAnimationFrame(frameFn);
    };
    timers.push(setTimeout(tick, 700));
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout); timers = [];
    offMidi?.(); offMidi = null;
    cur = null;
  };
  const finish = complete => {
    const elapsed = Math.min(dur(), (performance.now() - t0) / 1000);
    stop();
    stage.hidden = true; idle.hidden = false;
    if (!complete || !session || elapsed < Math.min(20, dur())) { results.hidden = true; renderIdle(); return; }
    const npm = Math.round(session.ok * 60 / dur());
    const okItems = session.items.filter(x => x.ok);
    const avgMs = okItems.length ? okItems.reduce((a, x) => a + x.rt, 0) / okItems.length : null;
    const prevBest = best();
    const all = store.get('notespeed') || {};
    const hist = (all.history || []).concat({ at: Date.now(), key: session.key, ok: session.ok, err: session.err, npm, avgMs: avgMs ? Math.round(avgMs) : null }).slice(-300);
    store.set('notespeed', { ...all, history: hist });
    // notes lentes et notes ratées de cette minute
    const by = new Map();
    for (const x of session.items) { const o = by.get(x.key) || { name: x.name, n: 0, err: 0, rt: 0, ok: 0 }; o.n++; if (x.ok) { o.ok++; o.rt += x.rt; } else o.err++; by.set(x.key, o); }
    const slow = [...by.values()].filter(o => o.ok).sort((a, b) => b.rt / b.ok - a.rt / a.ok).slice(0, 3);
    const missed = [...by.values()].filter(o => o.err).sort((a, b) => b.err - a.err).slice(0, 4);
    const acc = session.ok + session.err ? session.ok / (session.ok + session.err) : 0;
    const target = targetOf(conf);
    results.innerHTML = '';
    const tiles = h('div', { class: 'an-grid' },
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Notes justes par minute'), h('div', { class: 'v' }, String(npm))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Justesse'), h('div', { class: 'v' }, fmtPct(acc))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Temps moyen par note'), h('div', { class: 'v' }, avgMs ? `${(avgMs / 1000).toFixed(1).replace('.', ',')} s` : '—')));
    const verdict = npm > prevBest && prevBest > 0 ? `Nouveau record (ancien : ${prevBest}).` : !prevBest ? 'Premier score enregistré pour ce réglage.' : `Record : ${prevBest}.`;
    const advice = acc < 0.85 ? 'Trop d’erreurs : ralentis un peu, la justesse d’abord (vise 90 %), la vitesse vient ensuite.'
      : npm >= target ? `Au-dessus du repère (${target}) : passe au réglage suivant (${conf.range === 'staff' ? '« ± 2 lignes »' : conf.range === 'ledger' ? '« ± 4 lignes »' : !conf.acc ? 'les altérations' : 'l’autre clé, ou les deux clés'}).`
      : `Repère : ${target} notes justes par minute. Une minute par jour suffit : la vitesse monte en quelques semaines.`;
    results.append(h('h4', { class: 'an-sub' }, 'Résultat'), tiles,
      h('p', { class: 'small' }, `${verdict} ${advice}`));
    if (slow.length || missed.length) {
      results.append(h('ul', { class: 'ns-weak small' },
        slow.length ? h('li', {}, 'Les plus lentes : ', h('b', {}, slow.map(o => `${o.name} (${(o.rt / o.ok / 1000).toFixed(1).replace('.', ',')} s)`).join(', '))) : null,
        missed.length ? h('li', {}, 'Ratées : ', h('b', {}, missed.map(o => o.name).join(', ')), ' : elles reviendront plus souvent.') : null));
    }
    // courbe : meilleur score par jour sur 30 jours, pour ce réglage
    const since = Date.now() - 30 * 864e5;
    const days = new Map();
    for (const x of hist) if (x.key === session.key && x.at >= since) { const d = dayOf(x.at); days.set(d, Math.max(days.get(d) || 0, x.npm)); }
    if (days.size >= 2) {
      const entries = [...days.entries()];
      results.append(lineChart({ values: entries.map(e => e[1]), tips: entries.map(e => `${new Date(e[0]).toLocaleDateString('fr-FR')} : ${e[1]} notes/min`), title: 'Meilleur score par jour (30 jours)', yMin: 0, band: [target, Math.max(target + 1, ...entries.map(e => e[1]))] }));
    }
    results.hidden = false;
    renderIdle();
    opts.onFinish?.({ npm, acc });
  };
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', () => finish(false));
  renderIdle();
  window.__noteSpeed = { get cur() { return cur; }, get running() { return running; }, answerName: p => cur && answer(pc(cur.m) === p) }; // accès de test
  return () => stop();
}
