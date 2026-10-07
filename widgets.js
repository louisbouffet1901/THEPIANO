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

/* Partition et outils : code chargé à l'ouverture de la page qui les contient */
const withAbc = p => Promise.all([p, ensureAbcjs()]).then(([m]) => m);
defineWidget('score', (el, cfg) => mountLazy(el, () => withAbc(import('./score-widget.js')).then(m => e => m.mountScore(e, cfg)), 'Chargement de la partition…'));
defineWidget('quiz', (el, cfg) => mountLazy(el, () => withAbc(import('./tool-ear.js')).then(m => e => m.mountQuiz(e, cfg))));
defineWidget('analyzer', (el, cfg) => mountLazy(el, () => import('./tool-analyzer.js').then(m => e => m.mountAnalyzer(e, cfg))));
defineWidget('sight', (el, cfg) => mountLazy(el, () => withAbc(import('./tool-sight.js')).then(m => e => m.mountSight(e, cfg))));
defineWidget('improv', (el, cfg) => mountLazy(el, () => import('./tool-improv.js').then(m => e => m.mountImprov(e, cfg))));
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
