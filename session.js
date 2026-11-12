// Nouvelle séance (V7) : tu coches ce que tu veux travailler (pratique du piano seulement), l'appli propose pour chaque
// case l'action suivante et sa durée, et conseille ce que tu délaisses (fréquences cibles, point faible).
// Remplace la séance tirée du plan hebdomadaire.
// V8 : les fréquences cibles suivent ton rythme (séances par semaine, minutes par séance) ; séances de 10 et 15 min ;
// avec peu de cases, les domaines tournent d'une séance à l'autre (le plus en retard sur son rythme d'abord) ; les
// pauses ne comptent pas comme du temps délaissé.
import { h, esc } from './util.js';
import { store } from './store.js';
import { CATS, TARGETS, catLabel, daysSince, activeDaysSince, sinceLabel, logActivity, dayKey, daysBetween, recentStats, awayStats, pianoDays, journalStart } from './activity.js';
import { LEVELS, PIECES, lessonById, lessonsOf } from './content-index.js';
import { getPace, paceTargets, casesFor, allocate as allocatePace, PACE_MINUTES, currentPause, everyDays, freqLabel, paceLabel, dayLabel, isPausedDay, pausedDays } from './pace.js';

const DURATIONS = PACE_MINUTES; // 10, 15, 20, 30, 45, 60, 75
const ORDER = ['technique', 'piece', 'impro', 'lecture', 'oreille', 'autres'];
// séance courte (20 min ou moins) : le domaine qui tourne d'abord (il chauffe les mains, et l'improvisation prélude
// dans la tonalité), la pièce pour finir : ce qu'on rejoue en dernier se consolide mieux (Allen, 2013).
const ORDER_SHORT = ['technique', 'lecture', 'oreille', 'impro', 'autres', 'piece'];
const orderFor = minutes => (minutes <= 20 ? ORDER_SHORT : ORDER);
const KEY = 'sess7';

/* ------------------------------------------------------------------ */
/* Conseils                                                            */
/* ------------------------------------------------------------------ */
/** Seuil du conseil (jours sans pratique, hors pauses) selon ton rythme : un jour plus tôt pour le point faible déclaré. */
const threshold = (cat, T) => Math.max(1, T[cat].after - (TARGETS[cat].weak ? 1 : 0));
export function adviceFor(cat, now = Date.now()) {
  const T = paceTargets();
  const d = activeDaysSince(cat, now);
  const t = threshold(cat, T);
  const paused = !!currentPause(now);
  const overdue = !paused && d >= t;
  let reason = '';
  if (paused) reason = '';
  else if (d === Infinity) reason = 'pas encore travaillé';
  else if (overdue) reason = cat === 'piece' ? `${d} jour${d > 1 ? 's' : ''} sans` : `c’est son tour (${d} jour${d > 1 ? 's' : ''} sans)`;
  if (!paused && TARGETS[cat].weak && (overdue || d === Infinity)) reason += reason ? ' · ton point faible (le rythme)' : 'ton point faible (le rythme)';
  // jamais travaillé : il attend depuis le début du journal (un domaine rare ne passe pas devant un domaine fréquent)
  const st = journalStart();
  const waited = st ? Math.max(0, daysBetween(st, now) - pausedDays(st, now)) : 0;
  return { d, overdue, reason, urgency: d === Infinity ? waited / t : d / t };
}
/**
 * La séance conseillée pour une durée : la pièce phare toujours, l'improvisation (pierre angulaire du parcours) dès
 * 30 minutes, puis les domaines les plus en retard sur leur fréquence, à ton rythme. « Autres pièces » demande au moins
 * 15 minutes de séance (la jouer en entier).
 */
export function advisedCats(minutes, now = Date.now()) {
  const n = casesFor(minutes);
  const core = minutes >= 30 ? ['piece', 'impro'] : ['piece'];
  const others = ORDER.filter(c => !core.includes(c) && (c !== 'autres' || minutes >= 15))
    .map(c => ({ c, u: adviceFor(c, now).urgency + (c === 'impro' ? 0.15 : 0) })) // à égalité, l'improvisation passe devant
    .sort((a, b) => b.u - a.u);
  const ord = orderFor(minutes);
  return [...core, ...others.slice(0, Math.max(0, n - core.length)).map(x => x.c)].sort((a, b) => ord.indexOf(a) - ord.indexOf(b));
}
/** Répartition de la durée (pace.js) : parts du tableau de 60 min, 5 min au moins par case (3 min dans une séance courte). */
export const allocate = allocatePace;

/* ------------------------------------------------------------------ */
/* L'action suivante de chaque catégorie                               */
/* ------------------------------------------------------------------ */
const link = (href, text) => `<a href="${href}">${esc(text)}</a>`;
const lowerFirst = t => (t && /^[A-ZÀÂÉÈÊÎÔÛÇ][a-zà-ÿ’' ]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
/** Résumé d'une leçon d'improvisation, à jour même si la leçon a reçu de nouveaux exercices depuis (V7.4 : deux mains). */
export function improSummary(l) {
  const s = (store.get('improv.lessons') || {})[l.id];
  if (!s) return null;
  const total = Math.max(s.total || 0, l.steps || 0);
  if (total <= s.total) return s;
  // de nouveaux exercices à la fin de la leçon : le premier d'entre eux est en cours si les anciens sont validés
  return { ...s, total, cur: s.cur ?? s.total, curTitle: s.cur != null ? s.curTitle : 'un nouvel exercice', added: total - s.total };
}
/** Leçon d'improvisation en cours : dans l'ordre du module, niveau par niveau jusqu'au niveau en cours. Une leçon
 *  cochée « terminée » (à la main, ou parce que tous ses exercices sont validés) ne revient plus. */
export function improNext(L) {
  for (const lv of LEVELS) {
    if (lv.locked) continue;
    for (const l of lessonsOf(lv.id, 'impro')) {
      if (store.isDone(l.id)) continue;
      const s = improSummary(l);
      if (!s) return { l, text: 'le premier exercice' };
      if (s.mastered < s.total) return { l, sum: s, text: s.cur != null ? `exercice ${s.cur + 1} sur ${s.total} (${s.curTitle})` : 'à reprendre' };
    }
    if (lv.id === L.id) break;
  }
  return null;
}
/* « Déjà fait » (V7.4) : ce qui a été fait en dehors de la séance ne doit plus y être proposé. Une leçon se coche
   « terminée » (comme sur sa page) ; un exercice de technique ou une étape d'oreille se range dans `skips`, à part des
   résultats des outils (qui comptent comme du travail fait aujourd'hui). */
export const skipped = (kind, id) => !!(store.get('skips') || {})[kind]?.[id];
/** Coche (ou décoche) l'élément proposé par une case : { kind: 'lesson' | 'exercises' | 'ear', id }. */
export function setSkip(skip, on = true) {
  if (!skip) return;
  if (skip.kind === 'lesson') { store.setDone(skip.id, on); return; }
  const all = { ...(store.get('skips') || {}) };
  const m = { ...(all[skip.kind] || {}) };
  if (on) m[skip.id] = Date.now(); else delete m[skip.id];
  all[skip.kind] = m;
  store.set('skips', all);
}
const SKIP_LABEL = { lesson: 'Déjà faite', exercises: 'Déjà acquis', ear: 'Déjà acquise' };

/** Technique (V7.4.3) : la prochaine leçon de technique pas encore cochée, dans l'ordre du module, niveau par niveau. */
export function nextTechLesson(L) {
  for (const lv of LEVELS) {
    if (lv.locked) continue;
    const l = lessonsOf(lv.id, 'technique').find(x => !store.isDone(x.id));
    if (l) return l;
    if (lv.id === L.id) break;
  }
  return null;
}
/* Gammes et arpèges de la semaine : deux tonalités voisines, qui changent chaque lundi (programme de chaque niveau). */
const SCALES_WEEK = {
  n1: [['do majeur', 'la mineur'], ['sol majeur', 'mi mineur'], ['fa majeur', 'ré mineur'], ['ré majeur', 'do mineur'], ['fa mineur', 'la♭ majeur']],
  n2: [['si♭ majeur', 'sol mineur'], ['mi♭ majeur', 'do mineur'], ['la majeur', 'fa♯ mineur'], ['mi majeur', 'do♯ mineur'], ['la♭ majeur', 'fa mineur']],
};
export function scalesOfWeek(L, now = Date.now()) {
  const list = SCALES_WEEK[L.id] || SCALES_WEEK.n1;
  const week = Math.floor((now / 864e5 + 3) / 7); // les semaines commencent le lundi
  const pair = list[week % list.length];
  return { pair, text: `${pair[0]} et ${pair[1]} (harmonique) : deux octaves mains ensemble, puis les arpèges${L.id === 'n2' ? ', la gamme chromatique et un arpège de septième' : ''}` };
}

/** Pièces « autres » : les compléments du niveau et les pièces phares déjà travaillées, la moins récente d'abord. */
function otherPieces(L) {
  const ids = [...L.complements];
  for (const lv of LEVELS) { if (lv.id === L.id) break; if (!lv.locked && lv.piece) ids.push(lv.piece, ...(lv.complements || [])); }
  return [...new Set(ids)].filter(id => PIECES[id]).sort((a, b) => (store.get(`pieces.${a}.at`) || 0) - (store.get(`pieces.${b}.at`) || 0));
}

/** Pour chaque catégorie : { title, html, href, meta }. Asynchrone : quelques outils se chargent à la demande. */
export async function proposals(L, now = Date.now()) {
  const [pm, ex, ef, wu, ep] = await Promise.all([import('./piecemap.js'), import('./tool-exercises.js'), import('./tool-earfind.js'), import('./tool-warmup.js'), import('./tool-earplay.js')]);
  const out = {};
  // pièce phare : la section du jour
  const nx = pm.nextSection(L.piece, now);
  const M = pm.mapOf(L.piece);
  if (nx) {
    const s = nx.section;
    const fil = pm.filageDue(L.piece, now);
    // V8 : après une longue interruption, on remet la pièce en route ; une section travaillée de tête (loin du piano)
    // se rejoue d'abord de mémoire ; et la séance finit en rejouant la section une fois en entier
    const gap = daysSince('piece', now);
    const restart = Number.isFinite(gap) && gap >= 7 ? `<b>Remise en route</b> après ${gap} jours : rejoue d’abord lentement ce qui était en place (deux minutes). ` : '';
    const mt = pm.mentalOf(L.piece, now);
    const mental = mt ? `${mt.section.id === s.id ? '' : `Tu as travaillé de tête « ${esc(mt.section.name)} » : rejoue-la d’abord de mémoire. `}${mt.note ? `Ta note : « ${esc(mt.note)} ». ` : ''}` : '';
    const lead = restart || mental ? `<span class="sx-sub">${restart}${mental}</span>` : '';
    out.piece = {
      title: `${s.name} (m. ${s.from}-${s.to})`,
      html: `${link(`#/piece/${L.piece}/${s.id}`, `${s.name} (m. ${s.from}-${s.to})`)}${pm.hasFullScore(L.piece) ? ` (${link(pm.fullScoreHref(L.piece, s.from, s.to), 'dans la partition complète')})` : ''} : ${esc(lowerFirst(nx.intention))}${lead}<span class="sx-sub">Commence par 30 secondes de prélude en ${esc(M.key.name)} : la cadence, quelques accords arpégés, la cadence (${link('#/lecon/n2-im-preluder', 'Préluder')}). Pour finir, rejoue la section une fois en entier, sans t’arrêter.${fil ? ' Aujourd’hui aussi : le <b>filage enregistré</b> (en bas de la page de la pièce).' : ''}</span>`,
      href: `#/piece/${L.piece}/${s.id}`, meta: { piece: L.piece, section: s.id },
    };
  } else out.piece = { title: PIECES[L.piece].title, html: link(`#/piece/${L.piece}`, PIECES[L.piece].title), href: `#/piece/${L.piece}`, meta: { piece: L.piece } };
  // technique : d'abord ce que demande la section du jour, puis l'exercice des deux mains en cours
  let tech = null;
  if (nx) {
    for (const n of nx.section.needs || []) {
      if (n.l) { const l = lessonById(n.l); if (l && l.module === 'technique' && !store.isDone(l.id)) { tech = { title: l.title, html: `${link(`#/lecon/${l.id}`, l.title)} <span class="sx-sub">Ce que demande ta section du jour (${esc(nx.section.name)}).</span>`, href: `#/lecon/${l.id}`, skip: { kind: 'lesson', id: l.id, label: l.title } }; break; } }
      if (n.x) { const e = ex.EXERCISES.find(x => x.id === n.x); const s = (store.get(`exercises.${n.x}`) || {}); if (e && !s.mastered && !skipped('exercises', e.id)) { tech = { title: e.title, html: `${link(`#/outils/exercices/${e.id}`, e.title)} <span class="sx-sub">Exercice des deux mains lié à ta section du jour (${esc(nx.section.name)}).</span>`, href: `#/outils/exercices/${e.id}`, skip: { kind: 'exercises', id: e.id, label: e.title } }; break; } }
    }
  }
  // sinon la prochaine leçon de technique pas encore cochée (pédale, posture, gammes…), dans l'ordre du module
  if (!tech) {
    const nl = nextTechLesson(L);
    if (nl) tech = { title: nl.title, html: `${link(`#/lecon/${nl.id}`, nl.title)} <span class="sx-sub">La prochaine leçon de technique de ton parcours. Déjà faite ? Coche-la.</span>`, href: `#/lecon/${nl.id}`, skip: { kind: 'lesson', id: nl.id, label: nl.title } };
  }
  // toutes faites : un jour les gammes et arpèges de la semaine, un jour l'exercice des deux mains
  if (!tech && Math.floor(now / 864e5) % 2 === 0) {
    const sc = scalesOfWeek(L, now);
    tech = { title: 'Gammes et arpèges', html: `${link('#/outils/technique', 'Gammes et arpèges de la semaine')} : ${esc(sc.text)}.`, href: '#/outils/technique' };
  }
  if (!tech) {
    const r = ex.recommendExercise();
    tech = { title: r.ex.title, html: `${link(`#/outils/exercices/${r.ex.id}`, r.ex.title)} <span class="sx-sub">${esc(r.why)}</span>`, href: `#/outils/exercices/${r.ex.id}`, skip: r.review ? null : { kind: 'exercises', id: r.ex.id, label: r.ex.title } };
  }
  out.technique = tech;
  // improvisation
  const im = improNext(L);
  // V7.5 : l'improvisation libre enregistrée, conseillée après dix jours sans (une fois l'improvisation commencée) ;
  // V8 : espacée selon ton rythme (dix jours à six séances par semaine)
  const lastFree = store.get('improv.free.last');
  const freeDue = lastFree ? now - lastFree >= everyDays(10) * 864e5 : Number.isFinite(daysSince('impro', now));
  const freeTip = freeDue ? ` <span class="sx-sub">Aujourd’hui aussi : deux minutes d’${link('#/outils/impro', 'improvisation libre enregistrée')}, à réécouter demain.</span>` : '';
  out.impro = im ? { title: im.l.title, html: `${link(`#/lecon/${im.l.id}`, im.l.title)} : ${esc(im.text)}, puis une minute de jeu libre.${freeTip}`, href: `#/lecon/${im.l.id}`, skip: { kind: 'lesson', id: im.l.id, label: im.l.title },
    // séance courte : l'exercice seul (la minute de jeu libre et la prise libre attendront une séance plus longue)
    short: 6, shortHtml: `${link(`#/lecon/${im.l.id}`, im.l.title)} : ${esc(im.text)}, sans viser plus loin aujourd’hui.` }
    : { title: 'Jeu libre', html: `${link('#/outils/impro', 'Improvisation')} : ${freeDue ? 'deux minutes d’improvisation libre enregistrée, à réécouter demain.' : 'jeu libre sur une grille de ton choix, sans t’arrêter.'}`, href: '#/outils/impro' };
  // lecture à vue
  const lv = store.get('sight.level') || (L.id === 'n2' ? '2' : '1rh');
  const LVN = { '1rh': 'niveau 1, main droite', '1lh': 'niveau 1, main gauche', 2: 'niveau 2', 3: 'niveau 3', 4: 'niveau 4', 5: 'niveau 5' };
  const ws = wu.warmupStatus(now);
  const warm = ws.done >= ws.total ? 'échauffement déjà fait aujourd’hui ; ' : 'l’échauffement de 3 minutes (le rythme, puis deux exercices parmi notes, intervalles et accords), puis ';
  out.lecture = { title: 'Échauffement et extraits', html: `${link('#/outils/lecture', 'Lecture à vue')} : ${warm}des extraits nouveaux, ${esc(LVN[lv] || 'à ton niveau')}, sans t’arrêter.`, href: '#/outils/lecture',
    // séance courte : l'échauffement de trois minutes, ou un extrait s'il est déjà fait
    short: 5, shortHtml: `${link('#/outils/lecture', 'Lecture à vue')} : ${ws.done >= ws.total ? `un ou deux extraits nouveaux, ${esc(LVN[lv] || 'à ton niveau')}, sans t’arrêter` : `l’échauffement de 3 minutes (le rythme, puis deux exercices d’une minute), puis un extrait nouveau s’il reste du temps (${esc(LVN[lv] || 'à ton niveau')})`}.` };
  // oreille (V8.4) : « Trouve la note », dans la tonalité de la prochaine séance (une par séance) ; une mélodie d'oreille
  // de temps en temps. Plus d'étapes à valider : rien à cocher « déjà faite ».
  const nf = ef.nextSessionInfo(now);
  const nm = ep.nextMelody();
  const melodyDays = everyDays(7);
  const weekly = !ep.earplayRecent(now, melodyDays) && nm ? ` <span class="sx-sub">${melodyDays > 7 ? 'De temps en temps' : 'Cette semaine'} aussi, une mélodie d’oreille : ${link('#/outils/oreille/jouer', nm.title)}.</span>` : '';
  const triesTxt = nf.tries != null ? `, ${nf.tries.toFixed(1).replace('.', ',')} essai${nf.tries >= 1.95 ? 's' : ''} par note la dernière fois` : '';
  out.oreille = { title: `Trouve la note, ${nf.name}`, html: `${link('#/outils/oreille', 'Trouve la note')} en <b>${esc(nf.name)}</b> : ${nf.n} notes en jeu${triesTxt}. Chante la note avant de la chercher, si tu veux.${weekly}`, href: '#/outils/oreille' };
  // autres pièces
  const others = otherPieces(L);
  const op = others[0];
  const played = op && store.get(`pieces.${op}.at`);
  out.autres = op ? { title: PIECES[op].title, html: `${link(`#/piece/${op}`, PIECES[op].title)} : ${played ? 'joue-la en entier, puis travaille son passage le plus fragile.' : 'pas encore jouée dans l’appli : si tu la connais, joue-la en entier ; sinon, lis lentement sa première page, mains séparées s’il le faut.'}`, href: `#/piece/${op}`, meta: { other: op } } : null;
  return out;
}

/* ------------------------------------------------------------------ */
/* La séance                                                           */
/* ------------------------------------------------------------------ */
export function currentSession(now = Date.now()) {
  const s = store.get(KEY);
  return s && s.day === dayKey(now) ? s : null;
}
/** Le texte d'une case : sa version courte quand le temps alloué est petit (séance courte). */
export const htmlFor = (p, min) => (p.shortHtml && min <= p.short ? p.shortHtml : p.html);
export function buildSession(cats, minutes, props, now = Date.now()) {
  const alloc = allocate(cats, minutes);
  const ord = orderFor(minutes);
  const steps = cats.filter(c => props[c]).sort((a, b) => ord.indexOf(a) - ord.indexOf(b))
    .map(c => ({ id: c, cat: c, min: alloc[c], title: props[c].title, html: htmlFor(props[c], alloc[c]), href: props[c].href, meta: props[c].meta || null, done: false, started: null, doneAt: null }));
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
  let keep = null; // l'état du choix (durée, cases) gardé quand on coche « Déjà faite »
  const render = async (forceBuilder = false, state = null) => {
    if (!alive) return;
    const sess = currentSession();
    if (sess && !forceBuilder) { host.innerHTML = ''; host.append(activeCard(sess, () => render(true))); }
    else {
      if (!state) { host.innerHTML = ''; host.append(h('div', { class: 'card session', role: 'status' }, h('p', { class: 'small muted mb-0' }, 'Préparation de ta séance…'))); }
      let props;
      try { props = await proposals(L); } catch (e) { console.error(e); props = {}; }
      if (!alive) return;
      host.innerHTML = '';
      host.append(builderCard(L, props, () => render(false), {
        state,
        // « Déjà faite » : on coche, et la case propose aussitôt la suite (avec « Annuler »)
        skip: (cat, sk, st) => { setSkip(sk, true); keep = { ...st, undo: { cat, skip: sk } }; render(true, keep); },
        undo: (u, st) => { setSkip(u.skip, false); render(true, { ...st, undo: null }); },
      }));
    }
    onChange?.();
  };
  render();
  return () => { alive = false; };
}

function builderCard(L, props, started, { state = null, skip = null, undo = null } = {}) {
  const pace = getPace();
  let minutes = state?.minutes || store.get('ui.sessMin') || pace.minutes;
  if (!DURATIONS.includes(minutes)) minutes = pace.minutes;
  let chosen = state?.chosen ? new Set(state.chosen) : new Set(advisedCats(minutes));
  let touched = !!state?.touched;
  const snap = () => ({ minutes, chosen: [...chosen], touched });
  const card = h('div', { class: 'card session sx-builder' });
  // V8 : sept durées, de 10 à 75 minutes, en chiffres (l'unité est dite une fois)
  const seg = h('div', { class: 'seg sx-durs', role: 'group', 'aria-label': 'Durée de la séance, en minutes' });
  DURATIONS.forEach(m => {
    const b = h('button', { type: 'button', class: m === minutes ? 'on' : '', 'aria-label': fmtMin(m) }, String(m));
    b.addEventListener('click', () => {
      minutes = m;
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      if (!touched) { chosen = new Set(advisedCats(minutes)); place(); }
      refresh();
    });
    seg.append(b);
  });
  const rows = h('div', { class: 'sx-rows' });
  // les domaines qui ne sont pas dans la séance conseillée : repliés (on les ajoute d'un toucher)
  const moreRows = h('div', { class: 'sx-rows' });
  const moreSum = h('summary', {});
  const more = h('details', { class: 'sx-more' }, moreSum, moreRows);
  const hint = h('p', { class: 'small sx-hint', 'aria-live': 'polite' });
  const go = h('button', { class: 'btn primary lg', type: 'button' });
  const reset = h('button', { class: 'btn ghost sm', type: 'button', hidden: true }, 'Revenir à la séance conseillée');
  reset.addEventListener('click', () => { touched = false; chosen = new Set(advisedCats(minutes)); place(); refresh(); });
  go.addEventListener('click', () => {
    const cats = ORDER.filter(c => chosen.has(c) && props[c]);
    if (!cats.length) return;
    const sess = buildSession(cats, minutes, props);
    const first = sess.steps[0];
    startStep(sess, first);
    started();
    location.hash = first.href;
  });
  const pause = currentPause();
  const intro = pause
    ? h('p', { class: 'small mt-0 sx-intro' }, `En pause jusqu’au ${dayLabel(pause.to)} : rien ne compte comme délaissé. Si tu trouves un moment, voici quand même une séance.`)
    : h('p', { class: 'small mt-0 sx-intro' }, 'Cochée d’avance : ta pièce, puis les domaines qui attendent depuis le plus longtemps, d’après ', h('a', { href: '#/temps' }, 'ton temps de piano'), ` (${paceLabel(pace)}). Coche ou décoche à ton gré.`);
  card.append(
    h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Nouvelle séance'), h('span', { class: 'sx-durwrap' }, h('span', { class: 'small muted' }, 'min'), seg)),
    intro, rows, more, hint, h('div', { class: 'btn-row mt-1' }, go, reset));
  const advices = Object.fromEntries(CATS.map(c => [c.id, adviceFor(c.id)]));
  const rowEls = {};
  for (const c of CATS) {
    const p = props[c.id];
    const a = advices[c.id];
    const cb = h('input', { type: 'checkbox', 'aria-label': c.label, disabled: !p });
    cb.addEventListener('change', () => { touched = true; if (cb.checked) chosen.add(c.id); else chosen.delete(c.id); refresh(); });
    const minEl = h('span', { class: 'sx-min' });
    // « Déjà faite » : ce qui a été fait en dehors de la séance n'y revient plus ; « Annuler » juste après
    let skipBtn = null;
    const u = state?.undo && state.undo.cat === c.id ? state.undo : null;
    if (u && undo) {
      skipBtn = h('button', { type: 'button', class: 'sx-skip undo', title: 'Remettre dans la séance' }, `↩ Annuler (${u.skip.label})`);
      skipBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); undo(u, snap()); });
    } else if (p?.skip && skip) {
      skipBtn = h('button', { type: 'button', class: 'sx-skip', title: `Tu l’as déjà fait${p.skip.kind === 'lesson' ? 'e' : ''} : ne plus le proposer` }, SKIP_LABEL[p.skip.kind]);
      skipBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); skip(c.id, p.skip, snap()); });
    }
    // V7.7 : une seule ligne d'état (ce qui pousse à le faire, sinon la dernière fois), « Déjà faite » à sa suite
    const status = a.reason ? h('span', { class: 'sx-why' }, a.reason) : h('span', { class: 'sx-last' }, `dernière fois : ${sinceLabel(c.id)}`);
    const act = h('span', { class: 'sx-act small', html: p ? p.html : 'Rien à proposer ici pour l’instant.' });
    const row = h('label', { class: 'sx-row' + (p ? '' : ' off') },
      cb,
      h('span', { class: 'sx-main' },
        h('span', { class: 'sx-head' }, h('b', {}, c.label), minEl),
        act,
        h('span', { class: 'sx-meta' }, status, skipBtn)));
    rowEls[c.id] = { row, cb, minEl, act };
  }
  /** Range les cases : celles de la séance en haut (dans leur ordre), les autres repliées. Pas à chaque toucher : une
   *  case cochée ou décochée reste où elle est, jusqu'au prochain changement de durée. */
  function place() {
    const ord = orderFor(minutes);
    const ids = CATS.map(c => c.id).sort((a, b) => ord.indexOf(a) - ord.indexOf(b));
    for (const id of ids) (chosen.has(id) && props[id] ? rows : moreRows).append(rowEls[id].row);
    const n = moreRows.childElementCount;
    more.hidden = !n;
    moreSum.textContent = `Ajouter un domaine (${n})`;
  }
  function refresh() {
    const cats = ORDER.filter(c => chosen.has(c) && props[c]);
    const alloc = allocate(cats, minutes);
    for (const c of CATS) {
      const r = rowEls[c.id];
      const p = props[c.id];
      r.cb.checked = chosen.has(c.id) && !!p;
      r.minEl.textContent = alloc[c.id] ? `${alloc[c.id]} min` : '';
      r.row.classList.toggle('on', r.cb.checked);
      if (p) r.act.innerHTML = alloc[c.id] ? htmlFor(p, alloc[c.id]) : p.html;
    }
    go.textContent = cats.length ? `Commencer la séance · ${fmtMin(minutes)}` : 'Coche au moins une case';
    go.disabled = !cats.length;
    reset.hidden = !touched;
    const max = casesFor(minutes);
    hint.textContent = cats.length > max ? `Pour ${fmtMin(minutes)}, garde plutôt ${max} cases au plus : mieux vaut peu de choses bien faites, et les autres reviendront à leur tour.` : '';
  }
  place();
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
export function weekCard(now = Date.now()) {
  // V8 : face à ton temps de piano. La pièce : combien de séances sur celles que tu prévois ; les domaines qui tournent :
  // à jour, ou c'est leur tour ; le travail loin du piano à part.
  const pace = getPace();
  const T = paceTargets(pace);
  const st = recentStats(7, now);
  const days = pianoDays(7, now);
  const nPiano = days.filter(d => d.piano).length;
  const minPiano = Object.values(st).reduce((a, x) => a + x.min, 0);
  const aw = awayStats(7, now);
  const paused = !!currentPause(now);
  const card = h('div', { class: 'card sx-week' });
  card.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Tes 7 derniers jours'),
    h('span', { class: 'small muted' }, `${nPiano} séance${nPiano > 1 ? 's' : ''} sur ${pace.days}${minPiano ? ` · ${fmtMin(minPiano)}` : ''}`)));
  const INIT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  card.append(h('div', { class: 'sx-days', title: 'Plein : au piano · cerclé : loin du piano · gris : pause' },
    ...days.map(d => h('span', { class: 'sx-day' + (d.piano ? ' p' : d.any ? ' a' : '') + (isPausedDay(dayKey(d.t)) ? ' z' : '') }, h('i'), h('small', {}, INIT[new Date(d.t).getDay()])))));
  const grid = h('div', { class: 'sx-wgrid' });
  for (const c of CATS) {
    if (c.id === 'piece') {
      const t = pace.days, d = Math.min(st.piece.days, 7);
      grid.append(h('div', { class: 'sx-wrow' }, h('span', { class: 'sx-wl' }, c.label),
        h('span', { class: 'sx-wbar', title: `${d} jour${d > 1 ? 's' : ''} sur ${t} prévus` }, h('i', { style: { width: `${Math.min(100, d / t * 100)}%` }, class: d >= t ? 'ok' : '' })),
        h('span', { class: 'sx-wv small' }, `${d}/${t} j`)));
      continue;
    }
    const a = adviceFor(c.id, now);
    const never = a.d === Infinity;
    const fresh = !paused && !never && !a.overdue;
    // V8.2 : l'état sur une ligne, « quand · à quelle fréquence » dessous : plus rien de tronqué
    const state = never ? 'pas encore' : paused ? 'en pause' : fresh ? '✓ à jour' : 'c’est son tour';
    const sub = [never ? '' : sinceLabel(c.id, now), freqLabel(T[c.id].perWeek)].filter(Boolean).join(' · ');
    grid.append(h('div', { class: 'sx-wrow rot' }, h('span', { class: 'sx-wl' }, c.label),
      h('span', { class: 'sx-wcell' },
        h('span', { class: 'sx-wst ' + (fresh ? 'ok' : never || paused ? '' : 'due') }, state),
        h('span', { class: 'sx-wsub' }, sub))));
  }
  card.append(grid);
  card.append(h('p', { class: 'small muted mb-0 mt-1' }, aw.min ? `Loin du piano : ${fmtMin(aw.min)} sur ${aw.days} jour${aw.days > 1 ? 's' : ''}.` : pace.away ? 'Loin du piano : rien cette semaine.' : '',
    ' ', h('a', { href: '#/temps' }, 'Ton temps de piano')));
  return card;
}

/* ------------------------------------------------------------------ */
/* Barre de séance sur la page d'une étape                              */
/* ------------------------------------------------------------------ */
let bar = null;
let barTimer = null;
export function updateSessionBar(hash) {
  if (!bar) { bar = h('div', { class: 'session-bar', hidden: true, role: 'region', 'aria-label': 'Séance' }); document.body.append(bar); }
  clearInterval(barTimer);
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
  // V8 : le temps qui reste pour cette étape (une séance courte se tient dans son temps)
  const left = h('span', { class: 'sb-left' });
  const tickLeft = () => {
    if (st.done || !st.started) { left.textContent = ` · ${st.min} min`; left.classList.remove('over'); return; }
    const r = Math.ceil(st.min - (Date.now() - st.started) / 60000);
    left.textContent = r > 0 ? ` · reste ${r} min` : st.cat === 'piece' ? ' · temps écoulé : rejoue-la une fois en entier' : ' · temps écoulé';
    left.classList.toggle('over', r <= 0);
  };
  const label = h('div', { class: 'sb-txt' }, h('b', {}, `Séance · ${i + 1}/${sess.steps.length}`), h('span', { class: 'sb-cat' }, ` ${catLabel(st.cat)}`), left);
  tickLeft();
  barTimer = setInterval(() => { if (!bar.isConnected || bar.hidden) { clearInterval(barTimer); return; } tickLeft(); }, 20000);
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
