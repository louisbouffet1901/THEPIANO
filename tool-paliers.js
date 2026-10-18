// Les paliers d'une leçon d'improvisation (V5) : une échelle d'exercices, une seule nouveauté à chacun
// (une contrainte, une figure, une variante de question – réponse…). L'accompagnateur joue la grille, la prise
// est vérifiée au piano à l'arrêt (impro-check.js). Un palier est réussi quand ses critères sont atteints deux
// jours différents, la dernière fois comprise (même règle que l'Oreille).
import { h } from './util.js';
import { store } from './store.js';
import { toast } from './toast.js';
import { mountImprov } from './tool-improv.js';
import { describeCheck } from './impro-check.js';
import { lessonById } from './content-index.js';

/* ------------------------------------------------------------------ */
/* L'échelle d'ornementation : huit niveaux, travaillés dans les leçons */
/* ------------------------------------------------------------------ */
export const ECHELLE = [
  { n: 1, title: 'Le squelette', what: 'des notes de l’accord en valeurs longues, une ou deux par mesure', where: [['n1-im-5notes', 'longues'], ['n1-im-accords', 'or'], ['n1-im3', 'chopin']] },
  { n: 2, title: 'L’arpège', what: 'des notes de l’accord en noires', where: [['n1-im-5notes', 'noires']] },
  { n: 3, title: 'Les broderies', what: 'quitter une note de l’accord pour sa voisine, et revenir', where: [['n1-im-accords', 'broderie'], ['n2-im1', 'broderie']] },
  { n: 4, title: 'Les notes de passage', what: 'relier deux notes de l’accord par la gamme, puis par demi-tons', where: [['n1-im-accords', 'passage'], ['n1-im3', 'chromatique']] },
  { n: 5, title: 'Les figures d’approche', what: 'double broderie, gruppetto, deux notes qui glissent vers la note visée', where: [['n2-im1', 'double']] },
  { n: 6, title: 'Appoggiatures et retards', what: 'la note étrangère sur le temps, qui se résout d’un degré', where: [['n1-im-gammes', 'soupir'], ['n2-im1', 'appoggiature']] },
  { n: 7, title: 'Le rythme', what: 'rythme pointé, silences, phrases qui respirent', where: [['n1-im-lancer', 'silences'], ['n1-im3', 'pointe']] },
  { n: 8, title: 'Les fioritures', what: 'un groupe rapide et souple, à la manière de Chopin, sur une mélodie qui revient', where: [['n2-im1', 'fioriture'], ['n2-im1', 'reprise']] },
];

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */
const dayOf = t => new Date(t).toDateString();
const keyOf = (lesson, id) => `${lesson}:${id}`;
const recOf = (lesson, id) => (store.get('improv.p') || {})[keyOf(lesson, id)] || null;

/** Statut d'un palier : réussi (deux jours, la dernière fois comprise, et chaque tonalité demandée), commencé… */
export function palierStatus(lesson, s) {
  const rec = recOf(lesson, s.id);
  const okDays = rec?.okDays || [];
  const need = s.keys ? s.keys.length : 0;
  const keysDone = rec?.keys || [];
  const keysOk = !need || s.keys.every(k => keysDone.includes(k.label));
  const mastered = !!rec && !!rec.last?.ok && okDays.length >= 2 && keysOk;
  let label = 'pas encore fait';
  if (mastered) label = 'réussi';
  else if (rec) {
    const today = okDays.includes(dayOf(Date.now()));
    if (!keysOk && okDays.length) label = `encore ${need - s.keys.filter(k => keysDone.includes(k.label)).length} tonalité${need > 1 ? 's' : ''}`;
    else if (rec.last?.ok && okDays.length === 1) label = today ? 'réussi aujourd’hui · à refaire un autre jour' : 'réussi une fois · à refaire aujourd’hui';
    else if (okDays.length >= 2 && !rec.last?.ok) label = 'à réussir encore une fois';
    else label = 'commencé';
  }
  return { mastered, label, rec, keysDone };
}

function record(lesson, s, res, keyLabel) {
  const all = { ...(store.get('improv.p') || {}) };
  const k = keyOf(lesson, s.id);
  const rec = all[k] ? { ...all[k] } : { n: 0, okDays: [], keys: [] };
  rec.n = (rec.n || 0) + 1;
  rec.last = { at: Date.now(), ok: !!res.ok, sc: Math.round((res.score || 0) * 100) / 100 };
  if (res.ok) {
    const d = dayOf(Date.now());
    if (!(rec.okDays || []).includes(d)) rec.okDays = [...(rec.okDays || []), d].slice(-8);
    if (keyLabel && !(rec.keys || []).includes(keyLabel)) rec.keys = [...(rec.keys || []), keyLabel];
  }
  if (s.keys) rec.needKeys = s.keys.length;
  if (s.dim) rec.dim = s.dim;
  all[k] = rec;
  store.set('improv.p', all);
}

/** Résumé d'une leçon (pour la séance du jour et la page de l'improvisation). */
export function lessonSummary(lesson) {
  return (store.get('improv.lessons') || {})[lesson] || null;
}
function saveSummary(lesson, title, steps) {
  const st = steps.map(s => palierStatus(lesson, s));
  const cur = steps.findIndex((s, i) => !st[i].mastered);
  const sum = { title, total: steps.length, mastered: st.filter(x => x.mastered).length, cur: cur < 0 ? null : cur, curTitle: cur < 0 ? null : steps[cur].title, at: Date.now() };
  const all = { ...(store.get('improv.lessons') || {}) };
  const old = all[lesson];
  if (old && old.total === sum.total && old.mastered === sum.mastered && old.cur === sum.cur && old.title === sum.title) return sum;
  all[lesson] = sum;
  store.set('improv.lessons', all);
  return sum;
}

/** Niveaux de l'échelle d'ornementation atteints (un palier de ce niveau réussi). */
export function echelleStatus() {
  const all = store.get('improv.p') || {};
  return ECHELLE.map(r => {
    const hits = r.where.filter(([l, id]) => { const rec = all[keyOf(l, id)]; return rec && rec.last?.ok && (rec.okDays || []).length >= 2 && (!rec.needKeys || (rec.keys || []).length >= rec.needKeys); });
    const started = r.where.some(([l, id]) => all[keyOf(l, id)]);
    return { ...r, reached: hits.length > 0, started };
  });
}

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
// cfg : { lesson, steps: [{ id, title, what, why, tip?, dim?, keys?, ...config de l'accompagnateur }] }
export function mountPaliers(el, cfg) {
  const { lesson, steps } = cfg;
  const title = lessonById(lesson)?.title || '';
  const head = h('div', { class: 'card ear-head paliers-head' });
  const list = h('ol', { class: 'ear-steps paliers' });
  el.append(head, list);
  let cleanup = null, hostEl = null;
  const stopRun = () => { try { cleanup?.(); } catch (e) { /* */ } cleanup = null; if (hostEl) hostEl.innerHTML = ''; hostEl = null; };
  const refreshers = [];
  const items = [];

  const renderHead = () => {
    const st = steps.map(s => palierStatus(lesson, s));
    const done = st.filter(x => x.mastered).length;
    const cur = steps.findIndex((s, i) => !st[i].mastered);
    head.innerHTML = '';
    head.append(
      h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, cur >= 0 ? `Palier ${cur + 1} sur ${steps.length} : ${steps[cur].title}` : 'Tous les paliers sont réussis'), h('span', { class: 'small' }, `${done}/${steps.length} réussis`)),
      h('div', { class: 'progress' }, h('i', { style: { width: `${done / steps.length * 100}%` } })),
      h('p', { class: 'small mb-0' }, 'Une seule nouveauté à chaque palier. L’appli joue la grille et vérifie ta prise au piano à l’arrêt ; un palier est réussi quand ses critères sont atteints deux jours différents.'));
    const sum = saveSummary(lesson, title, steps);
    if (!sum.cur && sum.cur !== 0 && sum.mastered === steps.length && !store.isDone(lesson)) {
      store.setDone(lesson, true);
      toast('Leçon terminée : tous les paliers sont réussis', 'ok', 4000);
    }
  };

  const openStep = (i, scroll = false) => {
    items.forEach((it, k) => it.setOpen(k === i));
    if (scroll) items[i].li.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  steps.forEach((s, i) => {
    const li = h('li', { class: 'ear-step palier' });
    const num = h('span', { class: 'es-num' }, String(i + 1));
    const stat = h('span', { class: 'es-stat small' });
    const btn = h('button', { type: 'button', class: 'es-head', 'aria-expanded': 'false' }, num, h('span', { class: 'es-title' }, s.title), stat);
    const body = h('div', { class: 'es-body', hidden: true });
    body.append(h('p', { class: 'pal-what', html: s.what }));
    if (s.why) body.append(h('p', { class: 'es-why small', html: `<b>Pourquoi.</b> ${s.why}` }));
    if (s.tip) body.append(h('p', { class: 'small pal-tip', html: `<b>Astuce.</b> ${s.tip}` }));
    const crit = (s.checks || []).map(describeCheck).filter(Boolean);
    if (crit.length) body.append(h('div', { class: 'pal-crit small' }, h('b', {}, 'Réussi si : '), crit.join(' ; ') + '.'));
    if (s.dim) { const r = ECHELLE[s.dim - 1]; body.append(h('p', { class: 'small pal-dim' }, 'Échelle d’ornementation : ', h('a', { href: '#/outils/impro' }, `niveau ${r.n}, ${r.title.toLowerCase()}`), '.')); }
    // transposition : une tonalité à choisir ; le palier est réussi quand chacune l'a été
    let key = s.keys ? s.keys[0] : null;
    const keySeg = s.keys ? h('div', { class: 'seg pal-keys', role: 'group', 'aria-label': 'Tonalité' }) : null;
    const host = h('div', { class: 'es-quiz pal-host' });
    const nextBox = h('div', { class: 'es-next', hidden: true });
    const mount = () => {
      stopRun();
      hostEl = host;
      host.innerHTML = '';
      const stepCfg = { ...s, tr: (s.tr || 0) + (key ? key.tr : 0) };
      cleanup = mountImprov(host, {
        step: stepCfg,
        title: key ? `Accompagnateur · ${key.label}` : 'Accompagnateur',
        onResult: res => { record(lesson, s, res, key ? key.label : null); refresh(); },
      });
    };
    const renderKeys = () => {
      if (!keySeg) return;
      keySeg.innerHTML = '';
      const done = palierStatus(lesson, s).keysDone;
      for (const k of s.keys) {
        const b = h('button', { type: 'button', class: k === key ? 'on' : '' }, k.label + (done.includes(k.label) ? ' ✓' : ''));
        b.addEventListener('click', () => { if (k === key) return; key = k; renderKeys(); mount(); });
        keySeg.append(b);
      }
    };
    if (keySeg) body.append(h('div', { class: 'pal-keyrow' }, h('span', { class: 'small' }, 'Tonalité : '), keySeg));
    body.append(host, nextBox);
    const setOpen = o => {
      const was = !body.hidden;
      body.hidden = !o; li.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o));
      if (o && !was) { store.set(`ui.palOpen.${lesson}`, s.id); renderKeys(); mount(); }
      if (!o && was && hostEl === host) stopRun();
    };
    btn.addEventListener('click', () => { if (body.hidden) openStep(i); else setOpen(false); });
    items.push({ li, setOpen });
    refreshers.push(() => {
      const st = palierStatus(lesson, s);
      const cur = steps.findIndex(x => !palierStatus(lesson, x).mastered) === i;
      li.classList.toggle('done', st.mastered); li.classList.toggle('current', cur);
      num.textContent = st.mastered ? '✓' : String(i + 1);
      stat.textContent = cur && !st.rec ? 'en cours' : st.label === 'pas encore fait' ? '' : st.label;
      renderKeys();
      const next = steps[i + 1];
      const okToday = st.rec?.last?.ok;
      nextBox.hidden = !(okToday && next);
      nextBox.innerHTML = '';
      if (okToday && next) {
        const b2 = h('button', { class: 'btn primary sm', type: 'button' }, `Palier suivant : ${next.title}`);
        b2.addEventListener('click', () => openStep(i + 1, true));
        nextBox.append(h('span', { class: 'small ok-txt' }, st.mastered ? 'Palier réussi. ' : 'Réussi aujourd’hui : refais-le un autre jour pour le valider. '), b2);
      }
    });
    li.append(btn, body);
    list.append(li);
  });

  const refresh = () => { refreshers.forEach(f => f()); renderHead(); };
  refresh();
  // le palier ouvert la dernière fois s'il reste à réussir, sinon le palier en cours
  const want = store.get(`ui.palOpen.${lesson}`);
  let open = steps.findIndex(s => s.id === want);
  if (open < 0 || palierStatus(lesson, steps[open]).mastered) open = Math.max(0, steps.findIndex(s => !palierStatus(lesson, s).mastered));
  openStep(open);
  return () => stopRun();
}
