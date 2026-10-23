// Nouvelle séance (V7) : tu coches ce que tu veux travailler (pratique du piano seulement), l'appli propose pour chaque
// case l'action suivante et sa durée, et conseille ce que tu délaisses (fréquences cibles, point faible).
// Remplace la séance tirée du plan hebdomadaire.
import { h, esc } from './util.js';
import { store } from './store.js';
import { CATS, TARGETS, catLabel, daysSince, sinceLabel, logActivity, dayKey, recentStats } from './activity.js';
import { LEVELS, PIECES, lessonById, lessonsOf } from './content-index.js';

const DURATIONS = [20, 30, 45, 60, 75];
const MAX_CATS = { 20: 2, 30: 3, 45: 4, 60: 5, 75: 6 };
const ORDER = ['technique', 'piece', 'impro', 'lecture', 'oreille', 'autres'];
const KEY = 'sess7';

/* ------------------------------------------------------------------ */
/* Conseils                                                            */
/* ------------------------------------------------------------------ */
/** Seuil du conseil (jours sans pratique) : un jour plus tôt pour le point faible déclaré. */
const threshold = cat => TARGETS[cat].after - (TARGETS[cat].weak ? 1 : 0);
export function adviceFor(cat, now = Date.now()) {
  const d = daysSince(cat, now);
  const t = threshold(cat);
  const overdue = d >= t;
  let reason = '';
  if (d === Infinity) reason = 'pas encore travaillé';
  else if (overdue) reason = `${d} jour${d > 1 ? 's' : ''} sans`;
  if (TARGETS[cat].weak && (overdue || d === Infinity)) reason += reason ? ' · ton point faible (le rythme)' : 'ton point faible (le rythme)';
  return { d, overdue, reason, urgency: d === Infinity ? 99 : d / t };
}
/**
 * La séance conseillée pour une durée : la pièce phare et l'improvisation (pierre angulaire du parcours) dès 30 minutes,
 * puis les catégories les plus en retard sur leur fréquence cible.
 */
export function advisedCats(minutes, now = Date.now()) {
  const n = MAX_CATS[minutes] || Math.max(2, Math.min(6, Math.round(minutes / 13)));
  const core = minutes >= 30 ? ['piece', 'impro'] : ['piece'];
  const others = ORDER.filter(c => !core.includes(c) && (c !== 'autres' || minutes >= 60 || adviceFor('autres', now).overdue))
    .map(c => ({ c, u: adviceFor(c, now).urgency + (c === 'impro' ? 0.15 : 0) })) // à 20 min, l'improvisation passe devant à égalité
    .sort((a, b) => b.u - a.u);
  return [...core, ...others.slice(0, Math.max(0, n - core.length)).map(x => x.c)].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}
/** Répartition de la durée : parts du tableau (60 min), 5 min au moins par case. */
export function allocate(cats, total) {
  if (!cats.length) return {};
  const ws = cats.map(c => TARGETS[c].weight);
  const W = ws.reduce((a, b) => a + b, 0);
  const floor = total >= cats.length * 5 ? 5 : Math.max(2, Math.floor(total / cats.length));
  const mins = ws.map(w => Math.max(floor, Math.round(total * w / W)));
  let diff = total - mins.reduce((a, b) => a + b, 0);
  const order = cats.map((c, i) => i).sort((a, b) => ws[b] - ws[a]);
  let k = 0, guard = 200;
  while (diff !== 0 && guard-- > 0) {
    const i = order[k % order.length];
    if (diff > 0) { mins[i]++; diff--; } else if (mins[i] > floor) { mins[i]--; diff++; }
    k++;
  }
  return Object.fromEntries(cats.map((c, i) => [c, mins[i]]));
}

/* ------------------------------------------------------------------ */
/* L'action suivante de chaque catégorie                               */
/* ------------------------------------------------------------------ */
const link = (href, text) => `<a href="${href}">${esc(text)}</a>`;
const lowerFirst = t => (t && /^[A-ZÀÂÉÈÊÎÔÛÇ][a-zà-ÿ’' ]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
/** Leçon d'improvisation en cours : dans l'ordre du module, niveau par niveau jusqu'au niveau en cours. */
export function improNext(L) {
  const sums = store.get('improv.lessons') || {};
  for (const lv of LEVELS) {
    if (lv.locked) continue;
    for (const l of lessonsOf(lv.id, 'impro')) {
      const s = sums[l.id];
      if (!s) return { l, text: 'le premier exercice' };
      if (s.mastered < s.total) return { l, text: s.cur != null ? `exercice ${s.cur + 1} sur ${s.total} (${s.curTitle})` : 'à reprendre' };
    }
    if (lv.id === L.id) break;
  }
  return null;
}
/** Pièces « autres » : les compléments du niveau et les pièces phares déjà travaillées, la moins récente d'abord. */
function otherPieces(L) {
  const ids = [...L.complements];
  for (const lv of LEVELS) { if (lv.id === L.id) break; if (!lv.locked && lv.piece) ids.push(lv.piece, ...(lv.complements || [])); }
  return [...new Set(ids)].filter(id => PIECES[id]).sort((a, b) => (store.get(`pieces.${a}.at`) || 0) - (store.get(`pieces.${b}.at`) || 0));
}

/** Pour chaque catégorie : { title, html, href, meta }. Asynchrone : quelques outils se chargent à la demande. */
export async function proposals(L, now = Date.now()) {
  const [pm, ex, ear, wu] = await Promise.all([import('./piecemap.js'), import('./tool-exercises.js'), import('./tool-earpath.js'), import('./tool-warmup.js')]);
  const out = {};
  // pièce phare : la section du jour
  const nx = pm.nextSection(L.piece, now);
  const M = pm.mapOf(L.piece);
  if (nx) {
    const s = nx.section;
    const fil = pm.filageDue(L.piece, now);
    out.piece = {
      title: `${s.name} (m. ${s.from}-${s.to})`,
      html: `${link(`#/piece/${L.piece}/${s.id}`, `${s.name} (m. ${s.from}-${s.to})`)} : ${esc(lowerFirst(nx.intention))} <span class="sx-sub">Commence par 30 secondes de prélude en ${esc(M.key.name)} : la cadence, puis quelques accords arpégés.${fil ? ' Aujourd’hui aussi : le <b>filage enregistré</b> (en bas de la page de la pièce).' : ''}</span>`,
      href: `#/piece/${L.piece}/${s.id}`, meta: { piece: L.piece, section: s.id },
    };
  } else out.piece = { title: PIECES[L.piece].title, html: link(`#/piece/${L.piece}`, PIECES[L.piece].title), href: `#/piece/${L.piece}`, meta: { piece: L.piece } };
  // technique : d'abord ce que demande la section du jour, puis l'exercice des deux mains en cours
  let tech = null;
  if (nx) {
    for (const n of nx.section.needs || []) {
      if (n.l) { const l = lessonById(n.l); if (l && l.module === 'technique' && !store.isDone(l.id)) { tech = { title: l.title, html: `${link(`#/lecon/${l.id}`, l.title)} <span class="sx-sub">Ce que demande ta section du jour (${esc(nx.section.name)}).</span>`, href: `#/lecon/${l.id}` }; break; } }
      if (n.x) { const e = ex.EXERCISES.find(x => x.id === n.x); const s = (store.get(`exercises.${n.x}`) || {}); if (e && !s.mastered) { tech = { title: e.title, html: `${link(`#/outils/exercices/${e.id}`, e.title)} <span class="sx-sub">Exercice des deux mains lié à ta section du jour (${esc(nx.section.name)}).</span>`, href: `#/outils/exercices/${e.id}` }; break; } }
    }
  }
  if (!tech) {
    const r = ex.recommendExercise();
    tech = { title: r.ex.title, html: `${link(`#/outils/exercices/${r.ex.id}`, r.ex.title)} <span class="sx-sub">${esc(r.why)}</span>`, href: `#/outils/exercices/${r.ex.id}` };
  }
  out.technique = tech;
  // improvisation
  const im = improNext(L);
  out.impro = im ? { title: im.l.title, html: `${link(`#/lecon/${im.l.id}`, im.l.title)} : ${esc(im.text)}, puis une minute de jeu libre.`, href: `#/lecon/${im.l.id}` }
    : { title: 'Jeu libre', html: `${link('#/outils/impro', 'Improvisation')} : jeu libre sur une grille de ton choix, sans t’arrêter.`, href: '#/outils/impro' };
  // lecture à vue
  const lv = store.get('sight.level') || (L.id === 'n2' ? '2' : '1rh');
  const LVN = { '1rh': 'niveau 1, main droite', '1lh': 'niveau 1, main gauche', 2: 'niveau 2', 3: 'niveau 3', 4: 'niveau 4', 5: 'niveau 5' };
  const ws = wu.warmupStatus(now);
  const warm = ws.done >= ws.total ? 'échauffement déjà fait aujourd’hui ; ' : 'l’échauffement de 3 minutes (le rythme, puis deux exercices parmi notes, intervalles et accords), puis ';
  out.lecture = { title: 'Échauffement et extraits', html: `${link('#/outils/lecture', 'Lecture à vue')} : ${warm}des extraits nouveaux, ${esc(LVN[lv] || 'à ton niveau')}, sans t’arrêter.`, href: '#/outils/lecture' };
  // oreille : l'étape en cours du parcours
  const pr = ear.trackProgress();
  out.oreille = { title: pr.cur ? pr.cur.title : 'Révision', html: `${link('#/outils/oreille', 'Oreille')} : ${pr.cur ? `étape ${pr.index} sur ${pr.total}, ${esc(pr.cur.title)}` : 'révision libre'}.`, href: '#/outils/oreille' };
  // autres pièces
  const others = otherPieces(L);
  const op = others[0];
  out.autres = op ? { title: PIECES[op].title, html: `${link(`#/piece/${op}`, PIECES[op].title)} : joue-la en entier, puis travaille son passage le plus fragile.`, href: `#/piece/${op}`, meta: { other: op } } : null;
  return out;
}

/* ------------------------------------------------------------------ */
/* La séance                                                           */
/* ------------------------------------------------------------------ */
export function currentSession(now = Date.now()) {
  const s = store.get(KEY);
  return s && s.day === dayKey(now) ? s : null;
}
export function buildSession(cats, minutes, props, now = Date.now()) {
  const alloc = allocate(cats, minutes);
  const steps = cats.filter(c => props[c]).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    .map(c => ({ id: c, cat: c, min: alloc[c], title: props[c].title, html: props[c].html, href: props[c].href, meta: props[c].meta || null, done: false, started: null, doneAt: null }));
  const sess = { v: 7, day: dayKey(now), minutes, cats, steps, at: now };
  store.set(KEY, sess);
  store.set('ui.sessMin', minutes);
  return sess;
}
const save = sess => store.set(KEY, { ...sess, steps: sess.steps.map(s => ({ ...s })) });
export function startStep(sess, st) {
  if (st.started || st.done) return;
  st.started = Date.now();
  save(sess);
}
/** Étape faite : minutes réelles (entre l'ouverture et « Fait »), bornées par la durée prévue ; journal d'activité. */
export async function setStepDone(sess, st, v = true) {
  if (st.done === v) return;
  st.done = v;
  if (v) {
    st.doneAt = Date.now();
    const real = st.started ? (st.doneAt - st.started) / 60000 : st.min;
    const min = Math.max(1, Math.min(st.min * 2, Math.round(real)));
    st.real = min;
    if (st.cat === 'piece' && st.meta && st.meta.section) {
      const pm = await import('./piecemap.js');
      pm.touchSection(st.meta.piece, st.meta.section, min);
    } else {
      if (st.meta && st.meta.other) store.set(`pieces.${st.meta.other}.at`, Date.now());
      logActivity(st.cat, min);
    }
  }
  save(sess);
}
export const sessionMinutes = sess => sess.steps.filter(s => s.done).reduce((a, s) => a + (s.real || s.min), 0);
export const nextStep = (sess, after = null) => {
  const i = after ? sess.steps.indexOf(after) : -1;
  return sess.steps.slice(i + 1).find(s => !s.done) || sess.steps.find(s => s !== after && !s.done) || null;
};

/* ------------------------------------------------------------------ */
/* Affichage : la carte de l'accueil                                    */
/* ------------------------------------------------------------------ */
const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}` : `${m} min`);

/** Carte « Nouvelle séance » / « Ta séance » de l'accueil. */
export function mountSessionBox(host, L, { onChange } = {}) {
  let alive = true;
  const render = async (forceBuilder = false) => {
    if (!alive) return;
    const sess = currentSession();
    host.innerHTML = '';
    if (sess && !forceBuilder) host.append(activeCard(sess, () => render(true)));
    else {
      host.append(h('div', { class: 'card session', role: 'status' }, h('p', { class: 'small muted mb-0' }, 'Préparation de ta séance…')));
      let props;
      try { props = await proposals(L); } catch (e) { console.error(e); props = {}; }
      if (!alive) return;
      host.innerHTML = '';
      host.append(builderCard(L, props, () => render(false)));
    }
    onChange?.();
  };
  render();
  return () => { alive = false; };
}

function builderCard(L, props, started) {
  let minutes = store.get('ui.sessMin') || 60;
  if (!DURATIONS.includes(minutes)) minutes = 60;
  let chosen = new Set(advisedCats(minutes));
  let touched = false;
  const card = h('div', { class: 'card session sx-builder' });
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Durée de la séance' });
  DURATIONS.forEach(m => {
    const b = h('button', { type: 'button', class: m === minutes ? 'on' : '' }, fmtMin(m));
    b.addEventListener('click', () => {
      minutes = m;
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      if (!touched) chosen = new Set(advisedCats(minutes));
      refresh();
    });
    seg.append(b);
  });
  const rows = h('div', { class: 'sx-rows' });
  const hint = h('p', { class: 'small sx-hint', 'aria-live': 'polite' });
  const go = h('button', { class: 'btn primary lg', type: 'button' });
  const reset = h('button', { class: 'btn ghost sm', type: 'button', hidden: true }, 'Revenir à la séance conseillée');
  reset.addEventListener('click', () => { touched = false; chosen = new Set(advisedCats(minutes)); refresh(); });
  go.addEventListener('click', () => {
    const cats = ORDER.filter(c => chosen.has(c) && props[c]);
    if (!cats.length) return;
    const sess = buildSession(cats, minutes, props);
    const first = sess.steps[0];
    startStep(sess, first);
    started();
    location.hash = first.href;
  });
  card.append(
    h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Nouvelle séance'), seg),
    h('p', { class: 'small mt-0' }, 'Coche ce que tu veux travailler aujourd’hui. Les cases cochées d’avance sont la séance conseillée : ce que tu as laissé de côté depuis trop longtemps, et ta pièce.'),
    rows, hint, h('div', { class: 'btn-row mt-1' }, go, reset));
  const advices = Object.fromEntries(CATS.map(c => [c.id, adviceFor(c.id)]));
  const rowEls = {};
  for (const c of CATS) {
    const p = props[c.id];
    const a = advices[c.id];
    const cb = h('input', { type: 'checkbox', 'aria-label': c.label, disabled: !p });
    cb.addEventListener('change', () => { touched = true; if (cb.checked) chosen.add(c.id); else chosen.delete(c.id); refresh(); });
    const minEl = h('span', { class: 'sx-min' });
    const badge = a.overdue || a.d === Infinity ? h('span', { class: 'tag gold sx-badge' }, 'conseillé') : null;
    const row = h('label', { class: 'sx-row' + (p ? '' : ' off') },
      cb,
      h('span', { class: 'sx-main' },
        h('span', { class: 'sx-head' }, h('b', {}, c.label), badge, h('span', { class: 'sx-last small muted' }, `dernière fois : ${sinceLabel(c.id)}`)),
        h('span', { class: 'sx-act small', html: p ? p.html : 'Rien à proposer ici pour l’instant.' }),
        a.reason ? h('span', { class: 'sx-why small' }, a.reason) : null),
      minEl);
    rowEls[c.id] = { row, cb, minEl };
    rows.append(row);
  }
  function refresh() {
    const cats = ORDER.filter(c => chosen.has(c) && props[c]);
    const alloc = allocate(cats, minutes);
    for (const c of CATS) {
      const r = rowEls[c.id];
      r.cb.checked = chosen.has(c.id) && !!props[c.id];
      r.minEl.textContent = alloc[c.id] ? `${alloc[c.id]} min` : '';
      r.row.classList.toggle('on', r.cb.checked);
    }
    go.textContent = cats.length ? `Commencer la séance · ${fmtMin(minutes)}` : 'Coche au moins une case';
    go.disabled = !cats.length;
    reset.hidden = !touched;
    const max = MAX_CATS[minutes] || 6;
    hint.textContent = cats.length > max ? `Pour ${fmtMin(minutes)}, garde plutôt ${max} cases au plus : mieux vaut peu de choses bien faites.` : '';
  }
  refresh();
  return card;
}

function activeCard(sess, newSession) {
  const card = h('div', { class: 'card session' });
  const doneN = sess.steps.filter(s => s.done).length;
  const total = sess.steps.reduce((a, s) => a + s.min, 0);
  const finished = doneN === sess.steps.length;
  const prog = h('span', { class: 'tag accent' }, `${doneN}/${sess.steps.length}`);
  card.append(h('div', { class: 'card-top' }, h('span', {}, h('span', { class: 'eyebrow' }, finished ? 'Séance terminée' : 'Ta séance'), h('span', { class: 'small muted' }, ` · ${fmtMin(total)} prévues`)), prog));
  const list = h('ol', { class: 'session-steps' });
  sess.steps.forEach(st => {
    const cb = h('input', { type: 'checkbox', 'aria-label': 'Fait' });
    cb.checked = st.done;
    const li = h('li', { class: 'task' + (st.done ? ' done' : '') }, cb, h('span', { class: 'mod' }, catLabel(st.cat)), h('span', { class: 'txt', html: st.html }), h('span', { class: 'dur' }, st.done && st.real ? `${st.real} min` : `${st.min} min`));
    cb.addEventListener('change', async () => { await setStepDone(sess, st, cb.checked); li.classList.toggle('done', cb.checked); card.replaceWith(activeCard(currentSession() || sess, newSession)); });
    list.append(li);
  });
  card.append(list);
  const row = h('div', { class: 'btn-row mt-1' });
  if (!finished) {
    const nx = nextStep(sess);
    const go = h('a', { class: 'btn primary', href: nx.href }, doneN ? 'Continuer la séance' : 'Commencer la séance');
    go.addEventListener('click', () => startStep(sess, nx));
    row.append(go);
  } else {
    card.append(h('p', { class: 'small session-fin' }, `Bravo : ${fmtMin(sessionMinutes(sess))} de pratique. S’il te reste du temps, joue pour le plaisir une pièce que tu aimes.`));
  }
  const again = h('button', { class: 'btn ghost sm', type: 'button' }, finished ? 'Nouvelle séance' : 'Recommencer une autre séance');
  again.addEventListener('click', newSession);
  row.append(again);
  card.append(row);
  return card;
}

/* ------------------------------------------------------------------ */
/* Le bilan de la semaine                                              */
/* ------------------------------------------------------------------ */
export function weekCard() {
  const st = recentStats(7);
  const card = h('div', { class: 'card sx-week' });
  card.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Tes 7 derniers jours'), h('span', { class: 'small muted' }, `${Object.values(st).reduce((a, x) => a + x.min, 0)} min en séance`)));
  const grid = h('div', { class: 'sx-wgrid' });
  for (const c of CATS) {
    const t = TARGETS[c.id].days;
    const d = Math.min(st[c.id].days, 7);
    grid.append(h('div', { class: 'sx-wrow' }, h('span', { class: 'sx-wl' }, c.label),
      h('span', { class: 'sx-wbar', title: `${d} jour${d > 1 ? 's' : ''} sur ${t} visés` }, h('i', { style: { width: `${Math.min(100, d / t * 100)}%` }, class: d >= t ? 'ok' : '' })),
      h('span', { class: 'sx-wv small' }, `${d}/${t} j${st[c.id].min ? ` · ${st[c.id].min} min` : ''}`)));
  }
  card.append(grid, h('p', { class: 'small muted mb-0 mt-1' }, 'Jours de pratique sur les 7 derniers, face à l’objectif de chaque case. Les minutes sont celles des séances.'));
  return card;
}

/* ------------------------------------------------------------------ */
/* Barre de séance sur la page d'une étape                              */
/* ------------------------------------------------------------------ */
let bar = null;
export function updateSessionBar(hash) {
  if (!bar) { bar = h('div', { class: 'session-bar', hidden: true, role: 'region', 'aria-label': 'Séance' }); document.body.append(bar); }
  bar.hidden = true;
  bar.innerHTML = '';
  const sess = currentSession();
  if (!sess) return;
  // l'étape de cette page : même adresse, sinon même page (une autre section de la pièce, la liste des exercices…)
  const base = x => String(x).split('/').slice(0, 3).join('/');
  let i = sess.steps.findIndex(st => st.href === hash);
  if (i < 0) i = sess.steps.findIndex(st => !st.done && base(st.href) === base(hash));
  if (i < 0) return;
  const st = sess.steps[i];
  startStep(sess, st);
  const nx = nextStep(sess, st);
  const label = h('div', { class: 'sb-txt' }, h('b', {}, `Séance · ${i + 1}/${sess.steps.length}`), h('span', {}, ` ${catLabel(st.cat)} · ${st.min} min`));
  const btn = h('button', { class: 'btn primary sm', type: 'button' }, st.done ? (nx ? 'Étape suivante' : 'Retour à l’accueil') : (nx ? 'Fait, étape suivante' : 'Fait, fin de la séance'));
  btn.addEventListener('click', async () => {
    if (!st.done) await setStepDone(sess, st, true);
    if (nx) startStep(sess, nx);
    location.hash = nx ? nx.href : '#/';
  });
  const close = h('button', { class: 'sb-close', type: 'button', 'aria-label': 'Masquer' }, '×');
  close.addEventListener('click', () => { bar.hidden = true; });
  bar.append(label, btn, close);
  bar.hidden = false;
}
