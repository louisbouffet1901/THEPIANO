// Widgets insérables dans les leçons (partitions, claviers, schémas, exercices…)
// Les widgets lourds (partition, exercices, analyseur…) se chargent à la demande.
import { h, esc, ytSearch, INFORMANCE } from './util.js';
import { audio } from './audio.js';
import { store } from './store.js';
import { keyboard, mountDiagram, circleOfFifths } from './diagrams.js';
import { ICONS } from './icons.js';
import { ensureAbcjs, mountLazy } from './lazy.js';

export { ICONS };

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
    rhythm: cfg => ph('rhythm', cfg),
    localScore: cfg => ph('localscore', cfg),
    analyzer: cfg => ph('analyzer', cfg),
    sight: cfg => ph('sight', cfg),
    improv: cfg => ph('improv', cfg),
    /** Les paliers d'une leçon d'improvisation (V5) : { lesson, steps }. */
    paliers: cfg => ph('paliers', cfg),
    metronome: cfg => ph('metronome', cfg || {}),
    checklist: cfg => ph('checklist', cfg),
    links: (items, title) => ph('links', { items, title }),
    listen: (items, title) => ph('links', { items: items.map(it => ({ ...it, kind: 'video' })), title }),
    tip: (title, html) => callout('tip', title, html, ICONS.bulb),
    warn: (title, html) => callout('warn', title, html, ICONS.alert),
    exo: (title, html) => callout('exo', title, html, ICONS.target),
    // « À retenir » : remonté en tête de la leçon, dans l'encadré « L'essentiel » (voir app.js, pageLesson)
    key: (title, html) => { if (/^À retenir/i.test(title)) { W._core.push(html); return ''; } return callout('key', title, html, ICONS.star); },
    /** Contenu secondaire, replié : « Pour aller plus loin ». */
    more: (title, html) => `<details class="more"><summary><span class="more-tag">Pour aller plus loin</span> ${esc(title)}</summary><div class="more-body">${html}</div></details>`,
    /** Écoute comparée : plusieurs versions d'un même passage (voir le widget score, option variants). */
    compare: cfg => ph('score', { practice: false, hands: false, ...cfg }),
    /** Micro-écoutes : de courtes séquences à comparer (« avec / sans »), sur un petit clavier. Voir defineWidget('ecoute'). */
    ecoute: cfg => ph('ecoute', cfg),
    /** « Trouver ma voix » : sirène au micro et tessiture mesurée (voice.js). */
    voix: cfg => ph('voice', cfg || {}),
    /** Glossaire en ligne : un terme, sa définition au toucher. */
    term: (word, def) => `<span class="term" tabindex="0" role="button" aria-label="${esc(word)} : ${esc(def.replace(/<[^>]+>/g, ''))}">${word}<span class="term-def" role="tooltip">${def}</span></span>`,
    _core: [],
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

/* Cycle des quintes : touche une tonalité pour voir son armure et entendre sa gamme ; un pas sur le cycle ne change
   qu'une seule note de la gamme, montrée en or sur le clavier. */
const COF_TONIC = i => (i * 7) % 12;                 // do, sol, ré, la, mi, si, fa♯, ré♭, la♭, mi♭, si♭, fa
const COF_SIGN = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
const NAMES_SH = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
const NAMES_FL = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];
function cofScale(i, minor) {
  const t = COF_TONIC(i);
  const tonic = minor ? (t + 9) % 12 : t;
  const steps = minor ? [0, 2, 3, 5, 7, 8, 10, 12] : [0, 2, 4, 5, 7, 9, 11, 12];
  let base = 60 + tonic; if (base > 66) base -= 12;  // tonique entre fa♯2 et fa♯3 (français) : la gamme tient sur le clavier
  return steps.map(s => base + s);
}
defineWidget('cof', (el, cfg) => {
  const body = h('div', { class: 'w-body' });
  const frame = h('div', { class: 'w-frame' }, h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Cycle des quintes'), h('span', { class: 'w-sub' }, 'touche une tonalité')), body);
  el.append(frame);
  if (cfg.sound === false) { circleOfFifths(body, cfg); return; }
  const kb = keyboard({ from: 53, to: 84, names: 'none', height: 86, label: 'La gamme de la tonalité choisie' });
  const kbWrap = h('div', { class: 'cof-kbd' }, kb);
  const msg = h('p', { class: 'small cof-msg' });
  const btn = (label, fn, cls = 'btn sm') => { const b = h('button', { class: cls, type: 'button', html: ICONS.play + esc(label) }); b.addEventListener('click', fn); return b; };
  let cur = { i: cfg.start ?? 8, minor: cfg.minor ?? true }, timers = [];
  const names = i => (COF_SIGN[i] < 0 ? NAMES_FL : NAMES_SH);
  const showScale = (i, minor, changed = null) => {
    const sc = cofScale(i, minor);
    const sig = COF_SIGN[i];
    const nm = names(i);
    kb.setMarks(sc.map(m => ({ m, color: m === changed ? '#e7c46a' : ([1, 3, 6, 8, 10].includes(m % 12) ? '#476aa3' : '#d6e0ef') })));
    kb.querySelectorAll('text.cofl').forEach(t => t.remove());
    for (const m of sc) {
      const k = kb.querySelector(`[data-m="${m}"]`); if (!k) continue;
      const black = k.classList.contains('bk');
      const x = +k.getAttribute('x') + (black ? 7 : 11.5), y = black ? 44 : 78;
      const tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('class', 'cofl'); tx.setAttribute('x', x); tx.setAttribute('y', y); tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('font-size', black ? '8.5' : '10'); tx.setAttribute('fill', black ? '#fff' : '#2c3138');
      tx.setAttribute('font-family', 'Inter, system-ui, sans-serif'); tx.textContent = nm[m % 12];
      kb.append(tx);
    }
    return { sc, sig };
  };
  const stop = () => { timers.forEach(clearTimeout); timers = []; audio.stopAll('cof'); kb.clearPress(); };
  const playNotes = async (groups, step = 0.34) => {
    stop();
    audio.claim('cof', stop);
    await audio.ensure();
    const t0 = audio.now() + 0.06;
    groups.forEach((g, k) => {
      const at = t0 + k * step;
      for (const m of g.notes) {
        const v = audio.noteOn(m, g.vel || 66, at, { owner: 'cof' });
        if (v) audio.noteOff(v, at + (g.len || step * 0.95));
        timers.push(setTimeout(() => kb.press(m, true), Math.max(0, audio.ctxToPerf(at) - performance.now())));
        timers.push(setTimeout(() => kb.press(m, false), Math.max(0, audio.ctxToPerf(at + (g.len || step) * 0.9) - performance.now())));
      }
    });
    return t0 + groups.length * step;
  };
  const scaleGroups = (i, minor) => cofScale(i, minor).map(m => ({ notes: [m] }));
  const cadenceGroups = (i, minor) => {
    const sc = cofScale(i, minor);
    const t = sc[0];
    // I – IV – V7 – I (en mineur : i – iv – V7 – i, avec la sensible)
    const third = minor ? 3 : 4, sixth = minor ? 8 : 9;
    return [
      { notes: [t - 12, t + third, t + 7, t + 12], len: 0.62 },
      { notes: [t - 7, t + 5, t + sixth, t + 12], len: 0.62 },
      { notes: [t - 5, t + 5, t + 7, t + 11], len: 0.62 },
      { notes: [t - 12, t + third, t + 7, t + 12], len: 1.3 },
    ];
  };
  const nameOf = (i, minor) => {
    const t = (COF_TONIC(i) + (minor ? 9 : 0)) % 12;
    const nm = (COF_SIGN[i] < 0 ? NAMES_FL : NAMES_SH)[t];
    return `${nm} ${minor ? 'mineur' : 'majeur'}`;
  };
  const neighbour = async dir => {
    const from = cur;
    const to = { i: (cur.i + (dir > 0 ? 1 : 11)) % 12, minor: cur.minor };
    const a = new Set(cofScale(from.i, from.minor).map(m => m % 12));
    const scB = cofScale(to.i, to.minor);
    const changedPc = scB.map(m => m % 12).find(p => !a.has(p));
    const changed = scB.find(m => m % 12 === changedPc);
    ring.select(to.i, to.minor);
    cur = to;
    showScale(to.i, to.minor, changed);
    const oldName = (COF_SIGN[from.i] < 0 ? NAMES_FL : NAMES_SH)[(changedPc + (dir > 0 ? 11 : 1)) % 12];
    const newName = names(to.i)[changedPc];
    msg.innerHTML = `<b>${nameOf(from.i, from.minor)} → ${nameOf(to.i, to.minor)}</b> : une quinte ${dir > 0 ? 'plus haut' : 'plus bas'}, et <b>une seule note change</b> : ${oldName} devient <b>${newName}</b> (en or). ${dir > 0 ? 'C’est la nouvelle sensible : un dièse de plus (ou un bémol de moins).' : 'Un bémol de plus (ou un dièse de moins).'} Écoute les deux gammes : presque les mêmes notes, d’où la facilité d’aller d’une tonalité à sa voisine.`;
    const end = await playNotes(scaleGroups(from.i, from.minor).concat([{ notes: [], len: 0.2 }], scaleGroups(to.i, to.minor)), 0.3);
    void end;
  };
  const ring = circleOfFifths(body, { ...cfg, onSelect: (i, minor) => { cur = { i, minor }; showScale(i, minor); msg.textContent = `Gamme de ${nameOf(i, minor)} : les touches colorées. Les altérations de l’armure sont les touches noires (ou les notes altérées) de cette gamme.`; } });
  body.append(kbWrap, h('div', { class: 'score-ctrl' },
    btn('Gamme', () => playNotes(scaleGroups(cur.i, cur.minor))),
    btn('Cadence', () => playNotes(cadenceGroups(cur.i, cur.minor), 0.66)),
    btn('Une quinte plus bas', () => neighbour(-1), 'btn sm ghost'),
    btn('Une quinte plus haut', () => neighbour(1), 'btn sm ghost')), msg);
  showScale(cur.i, cur.minor);
  msg.textContent = 'Touche une tonalité sur le cycle, puis écoute sa gamme et sa cadence. « Une quinte plus haut » : un pas dans le sens des aiguilles d’une montre.';
  return stop;
});

/* ------------------------------------------------------------------ */
/* Micro-écoutes : comparer de courtes séquences                       */
/* ------------------------------------------------------------------ */
// seq : « do3 mi3 sol3 | si2 ré3 fa3 sol3 : 2 | do3 mi3 sol3 : 4 » — accords séparés par « | », notes par des espaces,
// « : n » = durée en temps (1 par défaut), « z » = silence, « ~ » = accord arpégé. do3 = do central (notation française).
// Plusieurs couches (mélodie + accords) : seq est alors un tableau de chaînes, jouées en même temps.
const NOTE_RE = /^(do|ré|re|mi|fa|sol|la|si)(♯|#|♭|b)?(-?\d)$/i;
const NOTE_PC = { do: 0, ré: 2, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11 };
export function parseNote(tok) {
  const m = tok.trim().match(NOTE_RE);
  if (!m) return null;
  const alt = m[2] === '♯' || m[2] === '#' ? 1 : m[2] === '♭' || m[2] === 'b' ? -1 : 0;
  return 12 * (+m[3] + 2) + NOTE_PC[m[1].toLowerCase()] + alt;
}
export function parseSeq(seq) {
  const layers = Array.isArray(seq) ? seq : [seq];
  const events = [];
  let total = 0;
  for (const layer of layers) {
    let t = 0;
    for (const seg of layer.split('|')) {
      let s = seg.trim();
      if (!s) continue;
      let d = 1;
      const dm = s.match(/:\s*([\d.]+(?:\/\d+)?)\s*$/);
      if (dm) { d = dm[1].includes('/') ? dm[1].split('/').reduce((a, b) => a / b) : +dm[1]; s = s.slice(0, dm.index).trim(); }
      const arp = s.includes('~');
      s = s.replace(/~/g, ' ').trim();
      const notes = s.split(/\s+/).filter(x => x && x !== 'z').map(parseNote).filter(x => x != null);
      events.push({ t, d, notes, arp });
      t += d;
    }
    total = Math.max(total, t);
  }
  return { events, total };
}
defineWidget('ecoute', (el, cfg) => {
  const items = (cfg.items || []).map(it => ({ ...it, parsed: parseSeq(it.seq) }));
  const all = items.flatMap(it => it.parsed.events.flatMap(e => e.notes));
  let lo = Math.min(...all), hi = Math.max(...all);
  if (!isFinite(lo)) { lo = 60; hi = 72; }
  lo = Math.max(21, lo - 2); hi = Math.min(108, hi + 2);
  while ([1, 3, 6, 8, 10].includes(lo % 12)) lo--;
  while ([1, 3, 6, 8, 10].includes(hi % 12)) hi++;
  if (hi - lo < 14) { lo = Math.max(21, lo - 3); hi = hi + 4; while ([1, 3, 6, 8, 10].includes(hi % 12)) hi++; while ([1, 3, 6, 8, 10].includes(lo % 12)) lo--; }
  const kb = keyboard({ from: lo, to: hi, names: 'c', height: 78, label: 'Notes jouées' });
  const frame = h('div', { class: 'w-frame ecoute' });
  if (cfg.title) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title), cfg.sub ? h('span', { class: 'w-sub' }, cfg.sub) : null));
  const body = h('div', { class: 'w-body' });
  const list = h('div', { class: 'ec-list' });
  body.append(h('div', { class: 'ec-kbd' }, kb), list);
  frame.append(body);
  el.append(frame);
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
  let timers = [], active = null;
  const btns = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; audio.stopAll('ecoute'); kb.clearPress(); btns.forEach(b => b.classList.remove('on')); active = null; };
  const schedule = (it, t0) => {
    const spb = 60 / (it.bpm || cfg.bpm || 66);
    for (const e of it.parsed.events) {
      e.notes.forEach((m, k) => {
        const at = t0 + e.t * spb + (e.arp ? k * 0.07 : 0);
        const len = Math.max(0.12, e.d * spb * 0.96 - (e.arp ? k * 0.07 : 0));
        const v = audio.noteOn(m, e.notes.length > 1 ? 58 : 70, at, { owner: 'ecoute' });
        if (v) audio.noteOff(v, at + len);
        timers.push(setTimeout(() => kb.press(m, true), Math.max(0, audio.ctxToPerf(at) - performance.now())));
        timers.push(setTimeout(() => kb.press(m, false), Math.max(0, audio.ctxToPerf(at + len * 0.92) - performance.now())));
      });
    }
    return t0 + it.parsed.total * spb;
  };
  const play = async (idxs, btn) => {
    if (active === btn) { stop(); return; }
    stop();
    audio.claim('ecoute', stop);
    try { await audio.ensure(); } catch (e) { return; }
    active = btn; btn.classList.add('on');
    let t = audio.now() + 0.08;
    for (const i of idxs) { const tEnd = schedule(items[i], t); t = tEnd + 0.7; }
    timers.push(setTimeout(() => { if (active === btn) { btn.classList.remove('on'); active = null; } }, Math.max(0, audio.ctxToPerf(t) - performance.now())));
  };
  items.forEach((it, i) => {
    const b = h('button', { class: 'btn sm ec-btn', type: 'button', html: ICONS.play + esc(it.label) });
    b.addEventListener('click', () => play([i], b));
    btns.push(b);
    list.append(h('div', { class: 'ec-row' }, b, it.note ? h('span', { class: 'small ec-note', html: it.note }) : null));
  });
  if (items.length > 1 && cfg.chain !== false) {
    const b = h('button', { class: 'btn sm ghost ec-btn', type: 'button', html: ICONS.play + esc(cfg.chainLabel || 'Tout à la suite') });
    b.addEventListener('click', () => play(items.map((_, i) => i), b));
    btns.push(b);
    list.append(h('div', { class: 'ec-row ec-chain' }, b));
  }
  return stop;
});

/* Partition et outils : code chargé à l'ouverture de la page qui les contient */
const withAbc = p => Promise.all([p, ensureAbcjs()]).then(([m]) => m);
defineWidget('score', (el, cfg) => mountLazy(el, () => withAbc(import('./score-widget.js')).then(m => e => m.mountScore(e, cfg)), 'Chargement de la partition…'));
defineWidget('quiz', (el, cfg) => mountLazy(el, () => withAbc(import('./tool-ear.js')).then(m => e => m.mountQuiz(e, cfg))));
defineWidget('analyzer', (el, cfg) => mountLazy(el, () => import('./tool-analyzer.js').then(m => e => m.mountAnalyzer(e, cfg))));
defineWidget('sight', (el, cfg) => mountLazy(el, () => withAbc(import('./tool-sight.js')).then(m => e => m.mountSight(e, cfg))));
defineWidget('improv', (el, cfg) => mountLazy(el, () => import('./tool-improv.js').then(m => e => m.mountImprov(e, cfg))));
defineWidget('paliers', (el, cfg) => mountLazy(el, () => import('./tool-paliers.js').then(m => e => m.mountPaliers(e, cfg))));
defineWidget('voice', (el, cfg) => mountLazy(el, () => import('./voice.js').then(m => e => m.mountVoiceFinder(e, cfg))));
defineWidget('metronome', (el, cfg) => mountLazy(el, () => import('./tool-metronome-ui.js').then(m => e => m.mountMetronome(e, cfg))));
defineWidget('localscore', (el, cfg) => mountLazy(el, () => import('./local-scores.js').then(m => e => m.mountLocalScores(e, cfg))));
defineWidget('rhythm', (el, cfg) => mountLazy(el, () => withAbc(import('./tool-rhythm.js')).then(m => e => (cfg.mode === 'dictation' ? m.mountDictation(e, cfg) : m.mountRhythm(e, cfg)))));

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
