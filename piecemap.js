// La carte de la pièce (V7) : état de chaque section, section du jour, objectif de date, plan simplifié, exercices du
// plan (« Pars de là », « Quelle section ? », « Ce qui change au retour ») et filage enregistré.
// Les données des pièces sont dans content-piecemap.js ; l'état est gardé dans store « pieces.<id> ».
import { h, esc, shuffle } from './util.js';
import { store } from './store.js';
import { ICONS } from './icons.js';
import { toast } from './toast.js';
import { PIECE_MAPS, SECTION_STATES } from './content-piecemap.js';
import { PIECES_META } from './content-meta.js';
import { LESSONS } from './content-meta.js';
import { logActivity, daysBetween, dayKey } from './activity.js';

export const mapOf = piece => PIECE_MAPS[piece] || null;
export const hasMap = piece => !!PIECE_MAPS[piece];
const titleOf = piece => (PIECES_META[piece] || {}).title || piece;
const lessonMeta = id => LESSONS.find(l => l.id === id) || null;
const bars = s => (s.from === s.to ? `m. ${s.from}` : `m. ${s.from}-${s.to}`);
const PRACTICE_DAYS = 6; // jours de pratique par semaine visés pour la pièce phare

/* ------------------------------------------------------------------ */
/* État des sections                                                   */
/* ------------------------------------------------------------------ */
export function sectionState(piece, sid) {
  const s = (store.get(`pieces.${piece}.sections`) || {})[sid] || {};
  return { st: Number.isInteger(s.st) ? s.st : 0, at: s.at || null };
}
function saveSection(piece, sid, patch) {
  const all = { ...(store.get(`pieces.${piece}.sections`) || {}) };
  all[sid] = { ...(all[sid] || {}), ...patch };
  store.set(`pieces.${piece}.sections`, all);
}
export function setSectionState(piece, sid, st) {
  saveSection(piece, sid, { st, at: Date.now() });
  logActivity('piece');
}
/** La section a été travaillée (séance, bouton « Travaillée aujourd'hui »). */
export function touchSection(piece, sid, min = 0) {
  saveSection(piece, sid, { at: Date.now() });
  logActivity('piece', min);
}
/** Une prise analysée sur un extrait (mesures m0 à m1) : les sections touchées sont « travaillées aujourd'hui ». */
export function touchRange(piece, m0, m1, cat = 'piece') {
  const M = mapOf(piece);
  if (M) for (const s of M.sections) if (s.from <= m1 && s.to >= m0) saveSection(piece, s.id, { at: Date.now() });
  store.set(`pieces.${piece}.at`, Date.now());
  logActivity(cat);
}
/** Les états ont-ils été indiqués au moins une fois ? */
export const statesSet = piece => Object.keys(store.get(`pieces.${piece}.sections`) || {}).length > 0;

/* ------------------------------------------------------------------ */
/* Avancement et objectif de date                                      */
/* ------------------------------------------------------------------ */
/** Avancement vers l'objectif (toutes les sections au tempo), pondéré par le travail de chaque section. */
export function pieceProgress(piece) {
  const M = mapOf(piece);
  if (!M) return null;
  let tot = 0, got = 0, atTempo = 0, heart = 0;
  for (const s of M.sections) {
    const { st } = sectionState(piece, s.id);
    tot += s.effort;
    got += s.effort * Math.min(st, 2) / 2;
    if (st >= 2) atTempo++;
    if (st >= 3) heart++;
  }
  return { pct: tot ? got / tot : 0, atTempo, heart, total: M.sections.length, effort: tot, remaining: tot - got };
}
/** Date proposée : le travail restant, à 6 jours de pratique par semaine, un peu resserré (objectif ambitieux). */
export function suggestGoal(piece, now = Date.now()) {
  const p = pieceProgress(piece);
  if (!p) return null;
  const days = Math.ceil(p.remaining * 7 / PRACTICE_DAYS * 0.9) + (p.remaining > 0 ? 2 : 0);
  return dayKey(now + days * 864e5);
}
export const goalOf = piece => store.get(`pieces.${piece}.goal`) || null;
export function setGoal(piece, date) {
  const p = pieceProgress(piece);
  store.set(`pieces.${piece}.goal`, { date, set: Date.now(), startPct: p ? p.pct : 0 });
}
const parseDay = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12).getTime(); };
export const dateLabel = s => new Date(parseDay(s)).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
/** Où en est-on par rapport à l'objectif : en avance, dans les temps, en retard (en jours de travail). */
export function goalStatus(piece, now = Date.now()) {
  const g = goalOf(piece);
  const p = pieceProgress(piece);
  if (!g || !p) return null;
  const end = parseDay(g.date);
  const left = daysBetween(now, end);
  if (p.pct >= 0.999) return { g, p, left, kind: 'done', text: 'objectif atteint : toutes les sections sont au tempo' };
  const span = Math.max(1, end - g.set);
  const expected = Math.min(1, (g.startPct || 0) + (1 - (g.startPct || 0)) * Math.max(0, now - g.set) / span);
  const diffDays = Math.round((p.pct - expected) * p.effort);
  let kind = 'ok', text = 'dans les temps';
  if (left < 0) { kind = 'late'; text = `date dépassée de ${-left} jour${left < -1 ? 's' : ''}`; }
  else if (diffDays >= 2) { kind = 'ahead'; text = `en avance d’environ ${diffDays} jours de travail`; }
  else if (diffDays <= -3) { kind = 'late'; text = `en retard d’environ ${-diffDays} jours de travail`; }
  return { g, p, left, expected, diffDays, kind, text };
}

/* ------------------------------------------------------------------ */
/* La section du jour                                                  */
/* ------------------------------------------------------------------ */
const dayIndex = (now = Date.now()) => Math.floor((now - new Date(new Date(now).getFullYear(), 0, 1).getTime()) / 864e5);
/** Intention du jour pour une section, selon son état (une seule chose à la fois). */
export function intentionFor(s, st, now = Date.now()) {
  const r = s.recipe || [];
  const d = dayIndex(now);
  if (st <= 0) return r.length ? r[d % Math.min(2, r.length)] : s.play;
  if (st === 1) return r.length > 2 ? r[2 + d % (r.length - 2)] : (r[r.length - 1] || s.play);
  if (st === 2) return `Par cœur : repars de chaque point de départ (${s.starts.map(m => 'm. ' + m).join(', ')}), sans regarder la partition.`;
  return 'Entretien : joue la section d’une traite, puis enchaîne avec celle d’avant et celle d’après.';
}
/**
 * La section à travailler : une nouvelle section quand moins de deux sont en cours, sinon celle en cours travaillée il y
 * a le plus longtemps. Quand tout est au tempo : le par cœur, puis l'entretien de la plus ancienne.
 */
export function nextSection(piece, now = Date.now()) {
  const M = mapOf(piece);
  if (!M) return null;
  const rows = M.sections.map(s => ({ s, ...sectionState(piece, s.id) }));
  const oldest = list => list.slice().sort((a, b) => (a.at || 0) - (b.at || 0))[0];
  const doing = rows.filter(r => r.st === 1);
  const fresh = rows.find(r => r.st === 0);
  let pick, why;
  if (fresh && doing.length < 2) { pick = fresh; why = doing.length ? 'nouvelle section, pendant que l’autre mûrit' : 'nouvelle section'; }
  else if (doing.length) { pick = oldest(doing); why = 'en place lentement : vers le tempo'; }
  else if (rows.some(r => r.st === 2)) { pick = oldest(rows.filter(r => r.st === 2)); why = 'au tempo : vers le par cœur'; }
  else { pick = oldest(rows); why = 'entretien'; }
  return { section: pick.s, st: pick.st, at: pick.at, why, intention: intentionFor(pick.s, pick.st, now) };
}

/* ------------------------------------------------------------------ */
/* Filage                                                              */
/* ------------------------------------------------------------------ */
export const lastFilage = piece => store.get(`pieces.${piece}.filage.last`) || null;
/** Un filage par semaine dès qu'une partie de la pièce tient au tempo. */
export function filageDue(piece, now = Date.now()) {
  const p = pieceProgress(piece);
  if (!p || p.atTempo < 1) return false;
  const last = lastFilage(piece);
  return !last || daysBetween(last, now) >= 7;
}

/* ------------------------------------------------------------------ */
/* Affichage : petits éléments                                         */
/* ------------------------------------------------------------------ */
const ST_CLASS = ['s0', 's1', 's2', 's3'];
/** Bande d'avancement : un segment par section, largeur selon le nombre de mesures, couleur selon l'état. */
export function progressStrip(piece, { onPick, labels = false } = {}) {
  const M = mapOf(piece);
  const strip = h('div', { class: 'pm-strip', role: 'img', 'aria-label': 'Avancement par section' });
  for (const s of M.sections) {
    const { st } = sectionState(piece, s.id);
    const seg = h(onPick ? 'button' : 'span', { class: `pm-seg ${ST_CLASS[st]}`, style: { flexGrow: String(s.to - s.from + 1) }, title: `${s.name} (${bars(s)}) : ${SECTION_STATES[st].short}`, type: onPick ? 'button' : null },
      labels ? h('span', {}, s.name) : null);
    if (onPick) seg.addEventListener('click', () => onPick(s));
    strip.append(seg);
  }
  return strip;
}
const legend = () => h('div', { class: 'pm-legend small' }, ...SECTION_STATES.map(x => h('span', {}, h('i', { class: `pm-dot ${ST_CLASS[x.id]}` }), x.label)));

/** Lien vers une leçon, un exercice ou une leçon de théorie (en option). */
function needLink(n) {
  if (n.l || n.th) {
    const id = n.l || n.th;
    const l = lessonMeta(id);
    if (!l) return null;
    const lvl = l.level === 'n2' ? ' (niveau 2)' : '';
    return h('li', { class: n.th ? 'pm-need opt' : 'pm-need' },
      h('a', { href: `#/lecon/${id}` }, l.title), lvl ? h('span', { class: 'small muted' }, lvl) : null,
      n.why ? h('span', { class: 'small muted' }, ` : ${n.why}`) : null,
      n.th ? h('em', { class: 'tag opt-tag' }, 'théorie') : null,
      h('span', { class: 'pm-done' }, store.isDone(id) ? ' ✓' : ''));
  }
  if (n.x) return h('li', { class: 'pm-need' }, h('a', { href: `#/outils/exercices/${n.x}` }, n.t || n.x), h('span', { class: 'small muted' }, ' : exercice des deux mains'));
  return null;
}

/* ------------------------------------------------------------------ */
/* Le plan (frise) : W.plan({ piece })                                  */
/* ------------------------------------------------------------------ */
/** Première phrase d'un texte (sans couper sur « m. 27 » ni « op. 55 »). */
const firstSentence = t => String(t).split(/(?<=[.!?…])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ«])/)[0];
export function mountPlan(el, cfg) {
  const piece = cfg.piece;
  const M = mapOf(piece);
  if (!M) return;
  const frame = h('div', { class: 'w-frame pm-plan' });
  if (cfg.title !== false) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Le plan, section par section'), h('span', { class: 'w-sub' }, `${M.total} mesures`)));
  const body = h('div', { class: 'w-body' });
  // la frise : largeur selon le nombre de mesures, même couleur pour ce qui revient
  const frise = h('div', { class: 'pm-frise', 'aria-hidden': 'true' });
  for (const s of M.sections) frise.append(h('span', { class: `pm-blk g-${s.group}`, style: { flexGrow: String(s.to - s.from + 1) } }, h('b', {}, s.letter)));
  body.append(frise);
  const list = h('ol', { class: 'pm-list' });
  M.sections.forEach((s, i) => {
    const { st } = sectionState(piece, s.id);
    const go = cfg.link === false ? h('span', { class: 'pm-name' }, s.name) : h('a', { class: 'pm-name', href: `#/piece/${piece}/${s.id}` }, s.name);
    list.append(h('li', { class: `pm-item g-${s.group}` },
      h('span', { class: 'pm-num' }, String(i + 1)),
      h('span', { class: 'pm-main' }, go, h('span', { class: 'pm-bars' }, bars(s)), h('span', { class: 'pm-what small' }, firstSentence(s.what))),
      cfg.states === false ? null : h('span', { class: `pm-state ${ST_CLASS[st]}`, title: SECTION_STATES[st].label }, SECTION_STATES[st].short)));
  });
  body.append(list);
  if (M.form) body.append(h('p', { class: 'small mt-1 mb-0' }, M.form));
  frame.append(body);
  el.append(frame);
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
}

/* ------------------------------------------------------------------ */
/* Une section : W.section({ piece, id })                               */
/* ------------------------------------------------------------------ */
export function mountSection(el, cfg) {
  const { piece, id } = cfg;
  const M = mapOf(piece);
  const s = M && M.sections.find(x => x.id === id);
  if (!s) return;
  const card = h('div', { class: 'pm-sec' });
  const seg = h('div', { class: 'seg pm-states', role: 'group', 'aria-label': 'Où en es-tu dans cette section ?' });
  const when = h('span', { class: 'small muted' });
  const refresh = () => {
    const { st, at } = sectionState(piece, id);
    seg.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === st));
    when.textContent = at ? `Travaillée ${(() => { const d = daysBetween(at, Date.now()); return d <= 0 ? 'aujourd’hui' : d === 1 ? 'hier' : `il y a ${d} jours`; })()}` : 'Pas encore travaillée';
  };
  SECTION_STATES.forEach(x => {
    const b = h('button', { type: 'button' }, x.label);
    b.addEventListener('click', () => { setSectionState(piece, id, x.id); refresh(); toast(`${s.name} : ${x.label.toLowerCase()}`, 'ok'); });
    seg.append(b);
  });
  const worked = h('button', { class: 'btn sm ghost', type: 'button' }, 'Travaillée aujourd’hui');
  worked.addEventListener('click', () => { touchSection(piece, id); refresh(); toast('Noté : section travaillée aujourd’hui', 'ok'); });
  card.append(h('div', { class: 'pm-sec-top' }, h('span', { class: 'small pm-sec-q' }, 'Où en es-tu ?'), seg, h('div', { class: 'row' }, when, worked)));
  card.append(h('div', { class: 'pm-sec-grid' },
    h('div', {}, h('div', { class: 'pm-h' }, 'Ce qui s’y passe'), h('p', {}, s.what)),
    h('div', {}, h('div', { class: 'pm-h' }, 'Ce que ça change à ton jeu'), h('p', {}, s.play))));
  const needs = (s.needs || []).map(needLink).filter(Boolean);
  if (needs.length) card.append(h('div', { class: 'pm-h' }, 'Ce qu’elle demande'), h('ul', { class: 'pm-needs' }, needs));
  card.append(h('div', { class: 'pm-h' }, 'Comment la travailler'), h('ol', { class: 'pm-recipe' }, (s.recipe || []).map(r => h('li', {}, r))),
    h('p', { class: 'pm-goal small' }, h('b', {}, 'Au tempo quand : '), s.goal));
  if (s.ear && s.ear.length) card.append(h('div', { class: 'pm-ear' }, h('div', { class: 'pm-h' }, 'Entendre avant de jouer'), h('ul', {}, s.ear.map(x => h('li', {}, x)))));
  card.append(h('p', { class: 'small muted mb-0' }, `Points de départ : ${s.starts.map(m => 'mesure ' + m).join(', ')}.`));
  el.append(card);
  refresh();
  const un = store.subscribe(p => { if (p === `pieces.${piece}.sections` || p === '*') refresh(); });
  return un;
}

/* ------------------------------------------------------------------ */
/* En-tête « Ta pièce » : avancement, objectif de date, section du jour */
/* ------------------------------------------------------------------ */
export function mountPieceHead(el, cfg) {
  const piece = cfg.piece;
  const M = mapOf(piece);
  if (!M) return;
  const card = h('div', { class: 'card pm-head' + (cfg.compact ? ' compact' : '') });
  el.append(card);
  const render = () => {
    card.innerHTML = '';
    const p = pieceProgress(piece);
    const top = h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, cfg.compact ? 'Ta pièce' : 'Où tu en es'), h('span', { class: 'small' }, `${p.atTempo}/${p.total} sections au tempo${p.heart ? ` · ${p.heart} par cœur` : ''}`));
    card.append(top);
    if (cfg.compact) card.append(h('h3', {}, h('a', { href: `#/piece/${piece}` }, titleOf(piece))));
    card.append(progressStrip(piece, { onPick: s => { location.hash = `#/piece/${piece}/${s.id}`; } }), legend());
    if (!statesSet(piece)) {
      card.append(h('p', { class: 'small pm-first' }, cfg.compact
        ? h('span', {}, 'Indique où tu en es, section par section, dans ', h('a', { href: `#/piece/${piece}` }, 'la carte de la pièce'), ' : la section du jour et l’objectif de date en dépendent.')
        : 'Indique d’abord où tu en es dans chaque section (« Où en es-tu ? », dans chaque section ci-dessous) : la section du jour et l’objectif de date en dépendent.'));
    }
    // objectif de date
    const gs = goalStatus(piece);
    const goalBox = h('div', { class: 'pm-goalbox' });
    if (gs) {
      goalBox.append(h('p', { class: 'mb-0' }, h('b', {}, 'Objectif : '), `toute la pièce au tempo (${M.tempo}) pour le ${dateLabel(gs.g.date)}. `, h('span', { class: `pm-gs ${gs.kind}` }, gs.text), '.'));
      if (!cfg.compact) {
        const adj = h('button', { class: 'btn sm ghost', type: 'button' }, 'Changer la date');
        adj.addEventListener('click', () => { goalBox.replaceWith(goalEditor()); });
        goalBox.append(h('div', { class: 'btn-row' }, adj));
      }
    } else {
      const sug = suggestGoal(piece);
      const weeks = Math.max(1, Math.round(daysBetween(Date.now(), parseDay(sug)) / 7));
      goalBox.append(h('p', { class: 'mb-1' }, h('b', {}, 'Objectif proposé : '), `toute la pièce au tempo pour le ${dateLabel(sug)}, dans ${weeks} semaine${weeks > 1 ? 's' : ''} environ.`));
      if (!cfg.compact) goalBox.append(h('p', { class: 'small muted mt-0' }, 'Calcul : le travail qui reste dans chaque section, à six jours de pratique par semaine, un peu resserré pour rester ambitieux.'));
      const ok = h('button', { class: 'btn sm primary', type: 'button' }, 'Fixer cet objectif');
      ok.addEventListener('click', () => { setGoal(piece, sug); toast('Objectif fixé', 'ok'); render(); });
      const other = h('button', { class: 'btn sm', type: 'button' }, 'Choisir une autre date');
      other.addEventListener('click', () => goalBox.replaceWith(goalEditor()));
      goalBox.append(h('div', { class: 'btn-row' }, ok, cfg.compact ? null : other));
    }
    card.append(goalBox);
    // la section du jour
    const nx = nextSection(piece);
    if (nx) {
      card.append(h('div', { class: 'pm-next' },
        h('div', { class: 'small muted' }, 'Section du jour'),
        h('p', { class: 'mb-0' }, h('a', { href: `#/piece/${piece}/${nx.section.id}` }, `${nx.section.name} (${bars(nx.section)})`), ` : ${nx.why}.`),
        h('p', { class: 'small mb-0' }, nx.intention)));
    }
    if (filageDue(piece)) {
      card.append(h('p', { class: 'small pm-filage-due' }, ICONS.target ? h('span', { class: 'ic', html: ICONS.target }) : null,
        h('span', {}, 'C’est le moment d’un ', h('a', { href: `#/piece/${piece}/filage` }, 'filage enregistré'), ' : joue d’une traite ce qui est en place.')));
    }
  };
  function goalEditor() {
    const box = h('div', { class: 'pm-goalbox' });
    const g = goalOf(piece);
    const inp = h('input', { type: 'date', value: (g && g.date) || suggestGoal(piece), min: dayKey(Date.now() + 864e5) });
    const ok = h('button', { class: 'btn sm primary', type: 'button' }, 'Enregistrer');
    const cancel = h('button', { class: 'btn sm ghost', type: 'button' }, 'Annuler');
    const sug = h('button', { class: 'btn sm ghost', type: 'button' }, 'Date proposée');
    ok.addEventListener('click', () => { if (inp.value) { setGoal(piece, inp.value); toast('Objectif enregistré', 'ok'); } render(); });
    cancel.addEventListener('click', render);
    sug.addEventListener('click', () => { inp.value = suggestGoal(piece); });
    box.append(h('label', { class: 'field' }, 'Toute la pièce au tempo pour le', inp), h('div', { class: 'btn-row mt-1' }, ok, sug, cancel));
    return box;
  }
  render();
  const watched = new RegExp(`^pieces\\.${piece.replace(/[-]/g, '\\-')}\\.(sections|goal|filage)`);
  const un = store.subscribe(p => { if (watched.test(p) || p === '*') render(); });
  return un;
}

/* ------------------------------------------------------------------ */
/* Exercices du plan                                                   */
/* ------------------------------------------------------------------ */
async function excerptsOf(piece) {
  const ex = await import('./content-excerpts.js');
  return { 'op55-1': ex.OP55, 'op15-1': ex.OP15, 'clair-de-lune': ex.CLAIR }[piece] || {};
}
const barOfAbc = abc => +((abc.match(/%%setbarnb\s+(\d+)/) || [])[1] ?? 1);

export function mountPlanExercises(el, cfg) {
  const piece = cfg.piece;
  const M = mapOf(piece);
  if (!M) return;
  const cleanups = [];
  const wrap = h('div', { class: 'pm-exos' });
  el.append(wrap);

  // 1. Pars de là : trois points de départ au hasard
  const starts = M.sections.flatMap(s => s.starts.map(m => ({ m, s })));
  const out = h('ol', { class: 'draw-out', 'aria-live': 'polite' });
  const draw = h('button', { class: 'btn primary sm', type: 'button' }, 'Tirer trois départs');
  draw.addEventListener('click', () => {
    out.replaceChildren(...shuffle(starts).slice(0, 3).map(x => h('li', {}, h('b', {}, `Mesure ${x.m}`), ` (${x.s.name})`)));
    draw.textContent = 'Tirer à nouveau';
  });
  wrap.append(h('div', { class: 'w-frame' }, h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Pars de là')),
    h('div', { class: 'w-body' }, h('p', { class: 'small mt-0' }, 'Démarre de chaque mesure tirée et joue au moins quatre mesures : d’abord avec la partition, puis sans. Un départ qui hésite, c’est lui qu’il faut travailler. Les pianistes qui mémorisent le mieux repartent des débuts de section.'), draw, out)));

  // 2. Quelle section ? : un extrait entendu, à situer
  const whereBody = h('div', { class: 'w-body' });
  wrap.append(h('div', { class: 'w-frame' }, h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Quelle section ?')), whereBody));
  const hidden = h('div', { class: 'pm-hidden-score', 'aria-hidden': 'true' });
  let player = null, score = null, round = null, alive = true;
  const stopPlay = () => { try { player?.stop(); } catch (e) { /* */ } };
  cleanups.push(() => { alive = false; stopPlay(); hidden.remove(); });
  const startWhere = async () => {
    whereBody.innerHTML = '';
    whereBody.append(h('p', { class: 'small mt-0' }, 'Écoute un extrait de la pièce, sans la partition : dans quelle section est-il ? Savoir où l’on est, c’est ce qui permet de repartir après un trou de mémoire.'));
    const set = await excerptsOf(piece);
    const pool = [];
    for (const s of M.sections) for (const k of s.ex || []) if (set[k]) pool.push({ k, abc: set[k], s });
    if (pool.length < 2 || !alive) { whereBody.append(h('p', { class: 'small muted' }, 'Pas assez d’extraits pour cette pièce.')); return; }
    const [{ ensureAbcjs }, { Score, Player }] = await Promise.all([import('./lazy.js'), import('./score.js')]);
    await ensureAbcjs();
    if (!alive) return;
    document.body.append(hidden);
    const status = h('p', { class: 'small', 'aria-live': 'polite' });
    const opts = h('div', { class: 'btn-row' });
    const playBtn = h('button', { class: 'btn primary sm', type: 'button', html: ICONS.play + 'Écouter' });
    const nextBtn = h('button', { class: 'btn sm', type: 'button' }, 'Autre extrait');
    let score1 = 0, n = 0;
    const newRound = () => {
      stopPlay();
      const it = pool[Math.floor(Math.random() * pool.length)];
      hidden.innerHTML = '';
      score = new Score(hidden, it.abc, {});
      player = new Player(score, { qpm: 64 * score.beatQ });
      round = { it, answered: false };
      status.textContent = 'Écoute, puis choisis la section.';
      const others = shuffle(M.sections.filter(s => s.id !== it.s.id)).slice(0, 3);
      opts.replaceChildren(...shuffle([it.s, ...others]).map(s => {
        const b = h('button', { class: 'btn sm', type: 'button' }, s.name);
        b.addEventListener('click', () => {
          if (round.answered) return;
          round.answered = true; n++;
          const ok = s.id === it.s.id;
          if (ok) score1++;
          b.classList.add(ok ? 'ok' : 'bad');
          status.innerHTML = `${ok ? '<b>Oui.</b>' : `<b>Non :</b> c’était ${esc(it.s.name)}.`} Mesures ${barOfAbc(it.abc) || 1} et suivantes. ${score1}/${n} juste${score1 > 1 ? 's' : ''}.`;
        });
        return b;
      }));
    };
    playBtn.addEventListener('click', async () => { if (!player) newRound(); if (player.playing) { stopPlay(); return; } try { await player.play(); } catch (e) { status.textContent = 'Audio indisponible.'; } });
    nextBtn.addEventListener('click', () => { newRound(); player.play().catch(() => {}); });
    whereBody.append(h('div', { class: 'btn-row' }, playBtn, nextBtn), status, opts);
    newRound();
  };
  const startBtn = h('button', { class: 'btn sm', type: 'button' }, 'Commencer');
  startBtn.addEventListener('click', () => startWhere().catch(e => { whereBody.append(h('p', { class: 'small' }, 'Indisponible : ' + e.message)); }));
  whereBody.append(h('p', { class: 'small mt-0' }, 'Un extrait entendu, sans la partition : à toi de dire de quelle section il vient.'), startBtn);

  // 3. Ce qui change au retour : écoute comparée
  if (M.returns) {
    const body = h('div', { class: 'w-body' });
    const box = h('div', { class: 'w-frame' }, h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, `Ce qui change au retour : ${M.returns.title.toLowerCase()}`)), body);
    wrap.append(box);
    const show = h('button', { class: 'btn sm', type: 'button' }, 'Écouter et comparer');
    body.append(h('p', { class: 'small mt-0' }, 'Écoute le thème, puis son retour. Qu’est-ce qui reste ? Qu’est-ce qui change ? Réponds pour toi avant d’ouvrir la réponse.'), show);
    show.addEventListener('click', async () => {
      show.remove();
      const [set, { ensureAbcjs }, sw] = await Promise.all([excerptsOf(piece), import('./lazy.js'), import('./score-widget.js')]);
      await ensureAbcjs();
      if (!alive) return;
      for (const [k, label] of M.returns.items) {
        if (!set[k]) continue;
        const host = h('div', { class: 'mt-1' });
        body.append(host);
        try { const c = sw.mountScore(host, { abc: set[k], title: label, practice: false, hands: false, analysis: false, bpm: 60 }); if (typeof c === 'function') cleanups.push(c); }
        catch (e) { host.textContent = 'Partition indisponible.'; }
      }
      body.append(h('details', { class: 'more' }, h('summary', {}, 'La réponse'), h('div', { class: 'more-body' }, h('p', {}, M.returns.answer))));
    });
  }
  return () => cleanups.forEach(f => { try { f(); } catch (e) { /* */ } });
}

/* ------------------------------------------------------------------ */
/* Filage enregistré                                                   */
/* ------------------------------------------------------------------ */
const fmtDur = s => `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')} s`;
/** Durée jouée et arrêts (plus de 2,5 s sans aucune note tenue). */
export function filageStats(notes) {
  if (!notes.length) return { dur: 0, stops: 0, n: 0 };
  const evs = notes.map(n => [n.on, n.off ?? n.on + 200]).sort((a, b) => a[0] - b[0]);
  let stops = 0, end = evs[0][1];
  for (const [on, off] of evs) {
    if (on - end > 2500) stops++;
    end = Math.max(end, off);
  }
  return { dur: (end - evs[0][0]) / 1000, stops, n: notes.length };
}
export function mountFilage(el, cfg) {
  const piece = cfg.piece;
  const card = h('div', { class: 'w-frame pm-filage' });
  card.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Filage enregistré'), h('span', { class: 'w-sub' }, 'environ une fois par semaine')));
  const body = h('div', { class: 'w-body' });
  card.append(body);
  el.append(card);
  let rec = null, timer = null, alive = true;
  const status = h('p', { class: 'small', 'aria-live': 'polite' });
  const go = h('button', { class: 'btn primary', type: 'button' }, 'Commencer le filage');
  const list = h('div', { class: 'pm-filages' });
  body.append(h('p', { class: 'small mt-0' }, 'Joue la pièce, ou tout ce qui est en place, d’une traite et sans t’arrêter, comme devant quelqu’un. Travailler et jouer sont deux choses différentes : le filage met à l’épreuve la continuité. Réécoute-le le lendemain.'),
    h('div', { class: 'btn-row' }, go), status, list);
  const stopRec = async (save = true) => {
    clearInterval(timer);
    if (!rec) return;
    const take = rec.stop();
    rec = null;
    go.textContent = 'Commencer le filage';
    go.classList.add('primary');
    if (!save || take.notes.length < 8) { status.textContent = take.notes.length ? 'Trop court pour un filage : rien n’est gardé.' : ''; return; }
    const st = filageStats(take.notes);
    const base = take.notes[0].on;
    const { db } = await import('./db.js');
    await db.put('takes', { piece, filage: true, at: Date.now(), notes: take.notes.map(n => [n.pitch, Math.round(n.on - base), Math.round((n.off ?? n.on) - base), n.vel]), pedal: take.pedal.map(p => [Math.round(p.t - base), p.down ? 1 : 0]), dur: st.dur, stops: st.stops, n: st.n });
    store.set(`pieces.${piece}.filage.last`, Date.now());
    logActivity('piece', Math.round(st.dur / 60));
    status.textContent = `Filage gardé : ${fmtDur(st.dur)}, ${st.stops} arrêt${st.stops > 1 ? 's' : ''}. Réécoute-le demain.`;
    renderList();
  };
  go.addEventListener('click', async () => {
    if (rec) { await stopRec(true); return; }
    const [{ midi }, { Recorder }] = await Promise.all([import('./midi.js'), import('./analysis-panel.js')]);
    if (midi.status !== 'ready') { status.textContent = 'Connecte d’abord le piano (en haut à droite) : le filage s’enregistre en MIDI.'; return; }
    rec = new Recorder({ silenceMs: 30000, minNotes: 8, onAutoStop: () => stopRec(true), onFirstNote: () => { status.textContent = 'Enregistrement… joue jusqu’au bout, puis touche « Terminer ».'; } });
    rec.start();
    go.textContent = 'Terminer et garder';
    go.classList.remove('primary');
    status.textContent = 'Prêt : commence quand tu veux. L’enregistrement s’arrête aussi après 30 secondes de silence.';
    const t0 = Date.now();
    timer = setInterval(() => { if (rec && rec.started) status.textContent = `Enregistrement… ${fmtDur((Date.now() - t0) / 1000)}`; }, 1000);
  });
  async function renderList() {
    if (!alive) return;
    const { db } = await import('./db.js');
    let all = [];
    try { all = (await db.all('takes')).filter(t => t.piece === piece && t.filage).sort((a, b) => b.at - a.at); } catch (e) { /* */ }
    list.innerHTML = '';
    if (!all.length) { list.append(h('p', { class: 'small muted' }, 'Pas encore de filage.')); return; }
    // le lendemain : réécouter et noter ce qu'on retient
    const prev = all.find(t => !t.note && daysBetween(t.at, Date.now()) >= 1);
    if (prev) {
      const ta = h('textarea', { rows: 3, placeholder: 'Où as-tu hésité ? La mélodie chante-t-elle au-dessus ? Chaque section a-t-elle son caractère ?' });
      const save = h('button', { class: 'btn sm primary', type: 'button' }, 'Garder ma note');
      save.addEventListener('click', async () => { prev.note = ta.value.trim() || '—'; await db.put('takes', prev); renderList(); });
      list.append(h('div', { class: 'callout tip' }, h('div', { class: 'c-title' }, `Réécoute ton filage du ${new Date(prev.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`),
        h('p', { class: 'small' }, 'Avec un jour de recul, on entend ce qu’on n’entendait pas en jouant. Trois questions, puis note ce que tu retiens : ce sera l’intention de tes prochaines séances.'), ta, h('div', { class: 'btn-row mt-1' }, replayBtn(prev), save)));
    }
    all.slice(0, 6).forEach((t, i) => {
      const older = all[i + 1];
      const delta = older ? ` (${t.stops - older.stops >= 0 ? '+' : ''}${t.stops - older.stops} par rapport au précédent)` : '';
      list.append(h('div', { class: 'wt-row' },
        h('div', { class: 'wt-date' }, new Date(t.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
        h('div', { class: 'wt-main' }, h('b', {}, fmtDur(t.dur || 0)), h('div', { class: 'small' }, `${t.stops} arrêt${t.stops > 1 ? 's' : ''}${delta} · ${t.n} notes`), t.note && t.note !== '—' ? h('div', { class: 'small muted' }, `« ${t.note} »`) : null),
        replayBtn(t)));
    });
  }
  function replayBtn(t) {
    const btn = h('button', { class: 'btn sm ghost', type: 'button' }, 'Réécouter');
    btn.addEventListener('click', async () => {
      const [{ audio }, { replayTake }] = await Promise.all([import('./audio.js'), import('./analysis-panel.js')]);
      if (btn.dataset.playing) { audio.stopAll('filage'); delete btn.dataset.playing; btn.textContent = 'Réécouter'; return; }
      btn.dataset.playing = '1'; btn.textContent = 'Arrêter';
      const take = { notes: t.notes.map(([pitch, on, off, vel]) => ({ pitch, on, off, vel })), pedal: (t.pedal || []).map(([at, down]) => ({ t: at, down: !!down })) };
      const dur = await replayTake(take, 'filage');
      setTimeout(() => { delete btn.dataset.playing; btn.textContent = 'Réécouter'; }, dur * 1000);
    });
    return btn;
  }
  renderList();
  return () => { alive = false; clearInterval(timer); if (rec) { try { rec.stop(); } catch (e) { /* */ } } };
}
