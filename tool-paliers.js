// Les exercices d'une leçon d'improvisation (V5.1 ; « paliers » dans le code et dans les données) : 4 à 7 exercices,
// une seule nouveauté à chacun (une contrainte, une figure, une variante de question – réponse…). L'accompagnateur
// joue la grille, la prise est vérifiée au piano à l'arrêt (impro-check.js). Un exercice est validé quand il est
// réussi deux jours différents, la dernière fois comprise (même règle que l'Oreille).
import { h } from './util.js';
import { store } from './store.js';
import { toast } from './toast.js';
import { mountImprov } from './tool-improv.js';
import { describeCheck } from './impro-check.js';
import { lessonById } from './content-index.js';

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */
const dayOf = t => new Date(t).toDateString();
const keyOf = (lesson, id) => `${lesson}:${id}`;
const recOf = (lesson, id) => (store.get('improv.p') || {})[keyOf(lesson, id)] || null;

/** Statut d'un exercice : validé (réussi deux jours, la dernière fois comprise, et dans chaque tonalité demandée), commencé… */
export function palierStatus(lesson, s) {
  const rec = recOf(lesson, s.id);
  const okDays = rec?.okDays || [];
  const need = s.keys ? s.keys.length : 0;
  const keysDone = rec?.keys || [];
  const keysOk = !need || s.keys.every(k => keysDone.includes(k.label));
  const mastered = !!rec && !!rec.last?.ok && okDays.length >= 2 && keysOk;
  let label = 'pas encore fait';
  if (mastered) label = 'validé';
  else if (rec) {
    const today = okDays.includes(dayOf(Date.now()));
    if (!keysOk && okDays.length) label = `encore ${need - s.keys.filter(k => keysDone.includes(k.label)).length} tonalité${need > 1 ? 's' : ''}`;
    else if (rec.last?.ok && okDays.length === 1) label = today ? 'réussi aujourd’hui · à refaire un autre jour' : 'réussi une fois · à refaire pour le valider';
    else if (okDays.length >= 2 && !rec.last?.ok) label = 'à réussir une fois de plus';
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

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
// cfg : { lesson, steps: [{ id, title, what, why, tip?, keys?, ...config de l'accompagnateur }] }
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
      h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, cur >= 0 ? `Exercice ${cur + 1} sur ${steps.length} : ${steps[cur].title}` : 'Tous les exercices sont validés'), h('span', { class: 'small' }, `${done}/${steps.length} validé${done > 1 ? 's' : ''}`)),
      h('div', { class: 'progress' }, h('i', { style: { width: `${done / steps.length * 100}%` } })),
      h('p', { class: 'small mb-0' }, 'Chaque exercice ajoute une seule difficulté. Joue, puis arrête : l’appli vérifie ta prise. Un exercice est validé quand tu le réussis deux jours différents.'));
    const sum = saveSummary(lesson, title, steps);
    if (!sum.cur && sum.cur !== 0 && sum.mastered === steps.length && !store.isDone(lesson)) {
      store.setDone(lesson, true);
      toast('Leçon terminée : tous les exercices sont validés', 'ok', 4000);
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
    // transposition : une tonalité à choisir ; l'exercice est validé quand chacune a été réussie
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
        const b2 = h('button', { class: 'btn primary sm', type: 'button' }, `Exercice suivant : ${next.title}`);
        b2.addEventListener('click', () => openStep(i + 1, true));
        nextBox.append(h('span', { class: 'small ok-txt' }, st.mastered ? 'Exercice validé. ' : 'Réussi aujourd’hui : refais-le un autre jour pour le valider. '), b2);
      }
    });
    li.append(btn, body);
    list.append(li);
  });

  const refresh = () => { refreshers.forEach(f => f()); renderHead(); };
  refresh();
  // l'exercice ouvert la dernière fois s'il reste à valider, sinon l'exercice en cours
  const want = store.get(`ui.palOpen.${lesson}`);
  let open = steps.findIndex(s => s.id === want);
  if (open < 0 || palierStatus(lesson, steps[open]).mastered) open = Math.max(0, steps.findIndex(s => !palierStatus(lesson, s).mastered));
  openStep(open);
  return () => stopRun();
}
