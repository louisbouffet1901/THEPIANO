// « En cours de maîtrise » (V6.1) : les leçons de théorie que tu choisis d'apprendre par cœur. Pour chacune, une fiche
// qui rassemble l'essentiel (les notions clés au niveau 1, « À retenir » et les pièges au niveau 2) et de petits
// exercices corrigés tirés de la leçon ; les questions manquées reviennent en tête de la série suivante.
// Les boîtes de Leitner et les dates de révision (V3.1 à V6.0) sont retirées. Les pièces gardent leurs exercices
// d'analyse : accords et fonctions, et pour une pièce apprise par cœur, la section et l'accord qui suivent.
import { h, esc, shuffle } from './util.js';
import { store } from './store.js';
import { LESSONS, PIECES_META } from './content-meta.js';
import { ensureAbcjs } from './lazy.js';
import { lessonOn, setLessonOn } from './widgets.js';

/** Séries d'exercices utilisables ici (sans piano ni oreille). */
export const QUIZ_KINDS = new Set(['keysig', 'keydegree', 'intervalsight', 'chordsight', 'measurefill', 'keyname', 'notes', 'relative', 'sigcount', 'triadkey', 'funckey', 'ivfind', 'chordspell', 'secdom']);
const SERIES = 6;      // éléments d'une série sur une leçon (≈ 2 min)
const MIX = 8;         // « Tout réviser »
const MAX_QUIZ = 2;    // séries de trois exercices par série (plus longues qu'une question)
const QUIZ_COUNT = 3;
const PIECES = ['op55-1', 'op15-1', 'clair-de-lune'];

/** Séries ajoutées aux leçons du niveau 2, qui n'ont pas encore de notions (réécriture à venir). */
const EXTRA_SERIES = {
  'n2-th1': [
    { kind: 'chordspell', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'], title: 'Les notes d’un accord de septième' },
    { kind: 'triadkey', seventh: true, keys: ['C', 'G', 'F', 'D', 'Bb', 'Am', 'Fm'], title: 'Les septièmes d’une tonalité' },
  ],
  'n2-th2': [{ kind: 'secdom', title: 'Dominantes secondaires' }],
  'n2-th3': [{ kind: 'relative', keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Am', 'Em', 'Dm', 'Gm', 'Cm', 'Fm'], title: 'Relatives : majeur et mineur' }],
};

/* Tableaux ajoutés à certaines fiches : ce qui s'apprend le mieux d'un coup d'œil. */
const SIG_ROWS = (sign, alts, maj, min) => alts.map((a, i) => `<tr><td>${i + 1} ${sign}</td><td>${a}</td><td>${maj[i]}</td><td>${min[i]}</td></tr>`).join('');
const FICHE_TABLES = {
  'n1-th-armures': `<div class="fiche-t">Les armures en un tableau</div>
<div class="fiche-tables">
<table class="fiche-table"><thead><tr><th>Armure</th><th>Dernier</th><th>Majeur</th><th>Mineur</th></tr></thead><tbody>
<tr><td>0</td><td>—</td><td>do</td><td>la</td></tr>
${SIG_ROWS('♯', ['fa♯', 'do♯', 'sol♯', 'ré♯', 'la♯', 'mi♯', 'si♯'], ['sol', 'ré', 'la', 'mi', 'si', 'fa♯', 'do♯'], ['mi', 'si', 'fa♯', 'do♯', 'sol♯', 'ré♯', 'la♯'])}
</tbody></table>
<table class="fiche-table"><thead><tr><th>Armure</th><th>Dernier</th><th>Majeur</th><th>Mineur</th></tr></thead><tbody>
${SIG_ROWS('♭', ['si♭', 'mi♭', 'la♭', 'ré♭', 'sol♭', 'do♭', 'fa♭'], ['fa', 'si♭', 'mi♭', 'la♭', 'ré♭', 'sol♭', 'do♭'], ['ré', 'sol', 'do', 'fa', 'si♭', 'mi♭', 'la♭'])}
</tbody></table>
</div>
<p class="small muted">Chaque ligne ajoute une altération au bout de l’ordre ; le mineur est la relative, trois demi-tons sous le majeur.</p>`,
  'n1-th-mineur': `<div class="fiche-t">Les trois formes, sur deux toniques</div>
<table class="fiche-table wide"><thead><tr><th>Forme</th><th>La mineur</th><th>Fa mineur (ta pièce)</th></tr></thead><tbody>
<tr><td>Naturelle</td><td>la si do ré mi fa sol</td><td>fa sol la♭ si♭ do ré♭ mi♭</td></tr>
<tr><td>Harmonique</td><td>la si do ré mi fa <b>sol♯</b></td><td>fa sol la♭ si♭ do ré♭ <b>mi♮</b></td></tr>
<tr><td>Mélodique, en montant</td><td>la si do ré mi <b>fa♯ sol♯</b></td><td>fa sol la♭ si♭ do <b>ré♮ mi♮</b></td></tr>
</tbody></table>
<p class="small muted">En descendant, la mélodique reprend la forme naturelle.</p>`,
};

/* ------------------------------------------------------------------ */
/* Dates et état                                                       */
/* ------------------------------------------------------------------ */
const pad = n => String(n).padStart(2, '0');
export const isoDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const theory = () => LESSONS.filter(l => l.module === 'theorie');
const rec = id => store.get(`mastery.lessons.${id}`) || {};
/** Leçons cochées « À apprendre par cœur », dans l'ordre du cours. */
export const chosenLessons = () => theory().filter(l => lessonOn(l.id));

const capture = (body, names) => {
  const got = [];
  const W = new Proxy({}, { get: (t, k) => (...args) => { if (names.includes(k)) got.push([k, ...args]); return k === 'informance' || k === 'yt' ? { title: '', url: '' } : ''; } });
  try { body(W); } catch (e) { console.warn('capture', e); }
  return got;
};

/**
 * Reprise de l'ancien état (cartes et boîtes, V3.1 à V6.0), une fois : une leçon est cochée si l'une de ses notions
 * l'était, ou si elle était terminée sans être passée par la reprise de la V6.0 (avant la V6.0, toutes les leçons de
 * théorie terminées étaient dans les cartes ; le niveau 2 l'était encore en V6.0). Les boîtes et les dates sont effacées.
 */
let migrating = null;
export function migrateMastery() {
  if ((store.get('mastery') || {}).v >= 2) return Promise.resolve();
  if (!migrating) migrating = (async () => {
    const m = store.get('mastery') || {};
    if (m.v >= 2) return;
    const lessons = {};
    const ticked = m.notions || {};
    const migrated = m.migrated || {};
    if (Object.keys(ticked).length) {
      const { loadLesson } = await import('./content-index.js');
      for (const l of theory()) {
        const full = await loadLesson(l.id);
        if (full && capture(full.body, ['notion']).some(([, c]) => c && ticked[c.id])) lessons[l.id] = { on: isoDay() };
      }
    }
    for (const l of theory()) if (!lessons[l.id] && store.isDone(l.id) && !migrated[l.id]) lessons[l.id] = { on: isoDay() };
    store.set('mastery', { v: 2, lessons, pieces: {} });
  })().finally(() => { migrating = null; });
  return migrating;
}

/* ------------------------------------------------------------------ */
/* Fiche et exercices d'une leçon                                      */
/* ------------------------------------------------------------------ */
/** Exercices d'une notion : questions à choix [q, [bonne, …autres], explication] ou { q, a, why, id }, et séries { quiz }. */
function notionItems(n, lesson) {
  return (n.cards || []).map((c, k) => {
    const base = { id: String(c.id || `n:${n.id}:${k}`).replace(/\./g, '_'), lesson, src: n.title };
    if (Array.isArray(c)) return { ...base, type: 'fact', q: c[0], answer: c[1][0], options: c[1], why: c[2] };
    if (c.quiz) return QUIZ_KINDS.has(c.quiz.kind) && c.quiz.mode !== 'play' ? { ...base, type: 'quiz', cfg: c.quiz } : null;
    return { ...base, type: 'fact', q: c.q, answer: c.a[0], options: c.a, why: c.why };
  }).filter(Boolean);
}

const dataCache = new Map();
/** { id, title, level, notions, essentials, core, traps, items } d'une leçon de théorie. */
export function lessonData(id) {
  if (!dataCache.has(id)) dataCache.set(id, (async () => {
    const meta = LESSONS.find(l => l.id === id);
    const { loadLesson } = await import('./content-index.js');
    const full = meta && await loadLesson(id);
    if (!full) return null;
    const got = capture(full.body, ['notion', 'key', 'warn', 'quiz']);
    const notions = got.filter(g => g[0] === 'notion' && g[1] && g[1].id).map(g => g[1]);
    const core = got.filter(g => g[0] === 'key' && /^À retenir/i.test(g[1] || '')).map(g => g[2]);
    const traps = got.filter(g => g[0] === 'warn' && /^Erreurs/i.test(g[1] || '')).map(g => g[2]);
    const items = [];
    if (notions.length) notions.forEach(n => items.push(...notionItems(n, id)));
    else {
      // niveau 2, en attendant ses notions : questions rédigées d'après « À retenir » et séries de la leçon
      const { FACTS } = await import('./content-mastery-facts.js');
      (FACTS[id] || []).forEach((f, k) => items.push({ id: `fact:${id}:${k}`, lesson: id, src: meta.title, type: 'fact', q: f[0], answer: f[1][0], options: f[1], why: f[2] }));
      got.filter(g => g[0] === 'quiz').forEach(([, cfg], k) => {
        if (cfg && QUIZ_KINDS.has(cfg.kind) && cfg.mode !== 'play') items.push({ id: `quiz:${id}:${cfg.stat || cfg.kind + k}`, lesson: id, src: meta.title, type: 'quiz', cfg });
      });
      (EXTRA_SERIES[id] || []).forEach((cfg, k) => items.push({ id: `x:${id}:${k}`, lesson: id, src: meta.title, type: 'quiz', cfg }));
    }
    items.forEach(it => { it.lessonTitle = meta.title; });
    return { id, title: meta.title, level: meta.level, notions, essentials: full.essentials || [], core, traps, items };
  })());
  return dataCache.get(id);
}

/** Tirage d'une série : d'abord les questions manquées la dernière fois (la moitié au plus), puis au hasard ; deux séries d'exercices au plus, de genres différents. */
export function pickItems(pool, n, miss = new Set()) {
  const out = [];
  const kinds = new Set();
  const take = it => {
    if (out.includes(it)) return;
    if (it.type === 'quiz') { if (kinds.size >= MAX_QUIZ || kinds.has(it.cfg.kind)) return; kinds.add(it.cfg.kind); }
    out.push(it);
  };
  for (const it of shuffle(pool.filter(x => miss.has(x.id)))) { if (out.length >= Math.ceil(n / 2)) break; take(it); }
  for (const it of shuffle(pool)) { if (out.length >= n) break; take(it); }
  return shuffle(out);
}

function ficheEl(d) {
  const wrap = h('div', { class: 'fiche' });
  const grid = h('div', { class: 'fiche-grid' });
  if (d.notions.length) {
    for (const n of d.notions) grid.append(h('div', { class: 'fiche-n' }, h('div', { class: 'fiche-t' }, n.title), h('div', { class: 'fiche-x', html: n.text || (n.short ? `<p>${n.short}</p>` : '') })));
  } else {
    const ess = d.essentials.length ? `<ul>${d.essentials.map(x => `<li>${x}</li>`).join('')}</ul>` : d.core.join('');
    if (ess) grid.append(h('div', { class: 'fiche-n wide' }, h('div', { class: 'fiche-t' }, 'L’essentiel'), h('div', { class: 'fiche-x', html: ess })));
    if (d.traps.length) grid.append(h('div', { class: 'fiche-n wide trap' }, h('div', { class: 'fiche-t' }, 'Les pièges'), h('div', { class: 'fiche-x', html: d.traps.join('') })));
  }
  wrap.append(grid);
  if (FICHE_TABLES[d.id]) wrap.append(h('div', { class: 'fiche-extra', html: FICHE_TABLES[d.id] }));
  return wrap;
}

/* ------------------------------------------------------------------ */
/* Pièces : questions sur l'analyse des extraits                       */
/* ------------------------------------------------------------------ */
const chordLabel = c => (c[1] ? `${c[0]} (${c[1]})` : c[0]);
const FUNC = { T: 'tonique (T)', SD: 'sous-dominante (SD)', D: 'dominante (D)' };

async function pieceItems(piece) {
  const [{ ANALYSES }, ex, { loadPiece }] = await Promise.all([import('./content-analyses.js'), import('./content-excerpts.js'), import('./content-index.js')]);
  const set = { 'op55-1': ex.OP55, 'op15-1': ex.OP15, 'clair-de-lune': ex.CLAIR }[piece] || {};
  const title = (PIECES_META[piece] || {}).title || piece;
  const an = [], nx = [];
  for (const [k, abc] of Object.entries(set)) {
    const a = ANALYSES.get(abc);
    if (!a || !a.bars || a.bars.reduce((n, b) => n + b.ch.length, 0) < 3) continue;
    const m0 = a.bars[0].m, m1 = a.bars[a.bars.length - 1].m;
    const src = `mes. ${m0}${m1 > m0 ? '–' + m1 : ''}`;
    an.push({ id: `an:${piece}:${k}`, type: 'analysis', src, abc, an: a });
    nx.push({ id: `next:${piece}:${k}`, type: 'next', src, abc, an: a });
  }
  const out = shuffle(an).slice(0, 2);
  if (store.get(`pieces.${piece}.byHeart`)) {
    const n = shuffle(nx).find(x => !out.some(o => o.abc === x.abc)) || nx[0];
    if (n) out.push(n);
    const P = await loadPiece(piece);
    const forms = P ? capture(P.body, ['diagram']).filter(([, name]) => name === 'form').map(([, , o]) => (o && o.sections) || []).filter(s => s.length >= 3) : [];
    if (forms.length) out.push({ id: `form:${piece}`, type: 'form', src: 'le plan', sections: forms[0] });
  }
  return out;
}

/** Questions sur l'analyse : accords (et fonctions) de mesures tirées au hasard. */
export function analysisQuestions(card, n = 3) {
  const all = [];
  for (const b of card.an.bars) b.ch.forEach((c, i) => all.push({ m: b.m, c, i, bar: b }));
  const labels = [...new Set(all.map(x => chordLabel(x.c)))];
  const qs = [];
  for (const x of shuffle(all)) {
    if (qs.length >= n) break;
    const right = chordLabel(x.c);
    const wrong = shuffle(labels.filter(l => l !== right)).slice(0, 3);
    if (wrong.length < 2) continue;
    const beat = x.c[3];
    const when = `Mesure ${x.m}${x.bar.ch.length > 1 ? `, ${beat === 1 ? '1er' : beat + 'e'} temps` : ''}`;
    if (x.c[2] && FUNC[x.c[2]] && qs.length && Math.random() < 0.4) {
      qs.push({ m: x.m, text: `${when} : ${right}. Quelle fonction ?`, options: Object.values(FUNC), answer: FUNC[x.c[2]], why: `${right} : ${FUNC[x.c[2]]} — ${card.an.key}.` });
    } else {
      qs.push({ m: x.m, text: `${when} : quel accord ?`, options: shuffle([right, ...wrong]), answer: right, why: `${right}${x.c[2] && FUNC[x.c[2]] ? ', ' + FUNC[x.c[2]] : ''} — ${card.an.key}.` });
    }
  }
  return qs;
}

/** « Qu'est-ce qui vient après ? » dans l'enchaînement des accords. */
export function nextQuestions(card, n = 2) {
  const seq = [];
  for (const b of card.an.bars) b.ch.forEach(c => seq.push({ m: b.m, c }));
  const labels = [...new Set(seq.map(x => chordLabel(x.c)))];
  const pairs = [];
  for (let i = 0; i + 1 < seq.length; i++) if (chordLabel(seq[i].c) !== chordLabel(seq[i + 1].c)) pairs.push([seq[i], seq[i + 1]]);
  return shuffle(pairs).slice(0, n).map(([a, b]) => {
    const right = chordLabel(b.c);
    const wrong = shuffle(labels.filter(l => l !== right && l !== chordLabel(a.c))).slice(0, 3);
    return { m: a.m, text: `Mesure ${a.m} : après ${chordLabel(a.c)}, quel accord vient ensuite${b.m !== a.m ? ` (mesure ${b.m})` : ''} ?`, options: shuffle([right, ...wrong]), answer: right, why: `${chordLabel(a.c)} → ${right}.` };
  }).filter(q => q.options.length >= 3);
}

const secLabel = s => `${s.label} (mes. ${s.from}${s.to > s.from ? '–' + s.to : ''}${s.key ? ', ' + s.key : ''}${s.note ? ', ' + s.note : ''})`;
/** Plan d'une pièce : quelle section vient après celle-ci ? */
export function formQuestions(card, n = 2) {
  const secs = card.sections;
  const idx = shuffle(secs.slice(0, -1).map((_, i) => i)).slice(0, n);
  return idx.map(i => {
    const right = secLabel(secs[i + 1]);
    const wrong = shuffle(secs.filter((s, k) => k !== i + 1 && k !== i).map(secLabel)).slice(0, 3);
    return { text: `Après ${secLabel(secs[i])}, qu’est-ce qui vient ?`, options: shuffle([right, ...wrong]), answer: right, why: `Puis ${right}.` };
  }).filter(q => q.options.length >= 2);
}

/* ------------------------------------------------------------------ */
/* Interface                                                           */
/* ------------------------------------------------------------------ */
/** Typographie française (espaces fines), sans dépendre de app.js. */
function typo(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    if (n.parentElement && n.parentElement.closest('svg, script, style')) continue;
    const t = n.nodeValue;
    const r = t.replace(/ ([?!;:»])/g, ' $1').replace(/« /g, '« ').replace(/(op\.|n°|m\.|mes\.) (\d)/g, '$1 $2');
    if (r !== t) n.nodeValue = r;
  }
}

function fmtDay(at) {
  const d = new Date(at), t = isoDay(), iso = isoDay(d);
  if (iso === t) return 'aujourd’hui';
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (iso === isoDay(y)) return 'hier';
  return 'le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
const lastLabel = last => (last ? `dernière série : ${last.ok}/${last.n}, ${fmtDay(last.at)}` : 'pas encore d’exercice');

function askBlock(q, onAnswer) {
  const fb = h('div', { class: 'quiz-feedback' });
  const opts = h('div', { class: 'quiz-answers mastery-answers' });
  for (const o of q.options) {
    const b = h('button', { class: 'btn', type: 'button' }, o);
    b.addEventListener('click', () => {
      if (opts.dataset.done) return;
      opts.dataset.done = '1';
      const ok = o === q.answer;
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) [...opts.children].find(x => x.textContent === q.answer)?.classList.add('right');
      fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
      fb.textContent = (ok ? 'Juste. ' : `Réponse : ${q.answer}. `) + (q.why || '');
      typo(fb);
      onAnswer(ok);
    });
    opts.append(b);
  }
  return h('div', { class: 'mastery-q' }, h('div', { class: 'quiz-q' }, q.text), opts, fb);
}

/** Enregistre une série : questions manquées par leçon (elles reviendront d'abord), dernier résultat. */
function record(ctx, results, ok, n) {
  const at = Date.now();
  const by = new Map();
  for (const r of results) if (r.it.lesson) { if (!by.has(r.it.lesson)) by.set(r.it.lesson, []); by.get(r.it.lesson).push(r); }
  for (const [id, rs] of by) {
    const cur = rec(id);
    const miss = new Set(cur.miss || []);
    for (const r of rs) { if (r.ok >= r.total) miss.delete(r.it.id); else miss.add(r.it.id); }
    const next = { ...cur, miss: [...miss].slice(-30) };
    if (ctx.kind === 'lesson') next.last = { at, ok, n };
    store.set(`mastery.lessons.${id}`, next);
  }
  if (ctx.kind === 'mix') store.set('mastery.mix', { last: { at, ok, n } });
  if (ctx.kind === 'piece') store.set(`mastery.pieces.${ctx.id}`, { last: { at, ok, n } });
}

export function mountMastery(el) {
  const box = h('div', { class: 'mastery' });
  el.append(box);
  let alive = true, cleanup = null, pickOpen = null, listHost = null;

  async function dashboard(focus = null) {
    cleanup?.(); cleanup = null;
    box.replaceChildren(h('p', { class: 'w-loading' }, 'Préparation…'));
    try { await migrateMastery(); } catch (e) { console.warn(e); }
    if (!alive) return;
    listHost = h('div', { class: 'mastery-list' });
    box.replaceChildren(picker(), listHost, piecesBlock());
    typo(box);
    await renderList(focus);
  }

  /** Les leçons de théorie, à cocher ; replié dès qu'une leçon est cochée. */
  function picker() {
    const det = h('details', { class: 'card mastery-pick' });
    const sum = h('summary');
    const upd = () => {
      const n = chosenLessons().length;
      sum.replaceChildren(h('span', { class: 'mp-title' }, 'Choisir les leçons à apprendre par cœur'), h('span', { class: 'tag' + (n ? ' gold' : '') }, n ? `${n} cochée${n > 1 ? 's' : ''}` : 'aucune'));
    };
    upd();
    det.append(sum);
    det.open = pickOpen ?? !chosenLessons().length;
    det.addEventListener('toggle', () => { pickOpen = det.open; });
    for (const lv of ['n1', 'n2']) {
      const ls = theory().filter(l => l.level === lv);
      if (!ls.length) continue;
      det.append(h('div', { class: 'mp-level' }, `Niveau ${lv.slice(1)}`));
      const ul = h('ul', { class: 'mp-list' });
      for (const l of ls) {
        const cb = h('input', { type: 'checkbox', 'data-heart-lesson': l.id, checked: lessonOn(l.id) });
        cb.addEventListener('change', () => { setLessonOn(l.id, cb.checked); upd(); renderList(); });
        ul.append(h('li', {}, h('label', { class: 'check' }, cb, h('span', {}, l.title)), store.isDone(l.id) ? h('span', { class: 'tag ok' }, 'terminée') : null));
      }
      det.append(ul);
    }
    return det;
  }

  let listTok = 0;
  async function renderList(focus = null) {
    const tok = ++listTok;
    const chosen = chosenLessons();
    const host = listHost;
    if (!chosen.length) {
      host.replaceChildren(h('div', { class: 'callout tip mt-2' }, h('div', { class: 'c-title' }, 'Rien à apprendre pour l’instant'),
        h('p', {}, 'Coche ci-dessus les leçons que tu veux savoir par cœur (par exemple « Armures et tonalités » ou « Les gammes mineures ») ; la case existe aussi en tête de chaque leçon de théorie. Pour chacune, tu trouveras ici une fiche qui résume l’essentiel et de petits exercices corrigés.')));
      typo(host);
      return;
    }
    const data = await Promise.all(chosen.map(l => lessonData(l.id)));
    if (!alive || tok !== listTok) return;
    const open = focus || store.get('ui.masteryOpen');
    const parts = [];
    const ds = data.filter(Boolean);
    if (ds.length >= 2) {
      const go = h('button', { class: 'btn primary', type: 'button' }, 'Tout réviser');
      go.addEventListener('click', () => startMix());
      const last = (store.get('mastery.mix') || {}).last;
      parts.push(h('div', { class: 'card mastery-mix mt-2' },
        h('div', { class: 'mm-text' }, h('h3', {}, `Un peu de tout : ${MIX} questions sur tes ${ds.length} leçons`),
          h('p', { class: 'small' }, `Les questions manquées reviennent d’abord. ≈ 3 min · ${lastLabel(last)}.`)), go));
    }
    parts.push(h('div', { class: 'section-title' }, h('h2', {}, 'Tes fiches'), h('span', { class: 'small' }, `${ds.length} leçon${ds.length > 1 ? 's' : ''}`)));
    const cards = ds.map(d => lessonCard(d, d.id === open));
    parts.push(...cards);
    host.replaceChildren(...parts);
    typo(host);
    if (focus) cards.find(c => c.dataset.lesson === focus)?.scrollIntoView({ block: 'start' });
  }

  /** Une leçon : sa fiche, repliée, et ses exercices. Une seule ouverte à la fois. */
  function lessonCard(d, open) {
    const det = h('details', { class: 'card mlesson', dataset: { lesson: d.id } });
    const last = rec(d.id).last;
    det.append(h('summary', {},
      h('span', { class: 'ml-title' }, d.title),
      h('span', { class: 'ml-meta small muted' }, `Niveau ${d.level.slice(1)} · ${d.notions.length ? `${d.notions.length} notions` : 'l’essentiel'} · ${lastLabel(last)}`)));
    const body = h('div', { class: 'ml-body' });
    det.append(body);
    const fill = () => {
      if (body.childElementCount) return;
      const go = h('button', { class: 'btn primary', type: 'button', disabled: !d.items.length }, 'S’exercer');
      go.addEventListener('click', () => startLesson(d.id));
      body.append(ficheEl(d), h('div', { class: 'btn-row mt-2' }, go,
        h('a', { class: 'btn ghost', href: `#/lecon/${d.id}` }, 'Ouvrir la leçon'),
        h('span', { class: 'small muted' }, d.items.length ? `${Math.min(SERIES, d.items.length)} questions ou séries, ≈ 2 min` : 'Pas encore d’exercice pour cette leçon : relis la fiche.')));
      typo(body);
    };
    det.addEventListener('toggle', () => {
      if (!det.open) { if (store.get('ui.masteryOpen') === d.id) store.set('ui.masteryOpen', null); return; }
      fill();
      store.set('ui.masteryOpen', d.id);
      det.parentElement?.querySelectorAll('details.mlesson[open]').forEach(o => { if (o !== det) o.open = false; });
    });
    if (open) { det.open = true; fill(); }
    return det;
  }

  function piecesBlock() {
    const wrap = h('div', { class: 'card mastery-pieces mt-3' },
      h('h3', {}, 'Tes pièces : accords et fonctions'),
      h('p', { class: 'small' }, 'Des questions sur l’analyse de tes extraits, la mesure surlignée sur la partition. Pour une pièce que tu apprends par cœur s’ajoutent le plan (quelle section vient ensuite ?) et l’accord suivant : les repères pour repartir après un trou de mémoire.'));
    for (const id of PIECES) {
      const P = PIECES_META[id];
      if (!P) continue;
      const cb = h('input', { type: 'checkbox', checked: !!store.get(`pieces.${id}.byHeart`) });
      cb.addEventListener('change', () => store.set(`pieces.${id}.byHeart`, cb.checked));
      const go = h('button', { class: 'btn sm', type: 'button' }, 'S’exercer');
      go.addEventListener('click', () => startPiece(id));
      const last = (store.get(`mastery.pieces.${id}`) || {}).last;
      wrap.append(h('div', { class: 'mp-piece' },
        h('div', { class: 'mp-pt' }, h('b', {}, P.title), h('span', { class: 'small muted' }, ` · ${lastLabel(last)}`)),
        h('label', { class: 'check' }, cb, 'par cœur'), go));
    }
    return wrap;
  }

  async function startLesson(id) {
    const d = await lessonData(id);
    if (!alive || !d || !d.items.length) return;
    run(d.title, pickItems(d.items, SERIES, new Set(rec(id).miss || [])), { kind: 'lesson', lesson: id });
  }
  async function startMix() {
    const chosen = chosenLessons();
    const ds = (await Promise.all(chosen.map(l => lessonData(l.id)))).filter(Boolean);
    if (!alive) return;
    const miss = new Set(chosen.flatMap(l => rec(l.id).miss || []));
    run('Tout réviser', pickItems(ds.flatMap(d => d.items), MIX, miss), { kind: 'mix' });
  }
  async function startPiece(id) {
    let items = [];
    try { items = await pieceItems(id); } catch (e) { console.warn(e); }
    if (!alive) return;
    run((PIECES_META[id] || {}).title || id, items, { kind: 'piece', id });
  }

  /** Une série : une question (ou une petite série, ou un extrait) à la fois, corrigée tout de suite. */
  function run(title, items, ctx) {
    cleanup?.(); cleanup = null;
    let i = 0;
    const results = [];
    const head = h('div', { class: 'w-head' });
    const body = h('div', { class: 'w-body' });
    const foot = h('div', { class: 'w-foot' });
    box.replaceChildren(h('div', { class: 'w-frame mastery-run' }, head, body, foot));
    window.scrollTo(0, 0);
    const stop = h('button', { class: 'btn ghost sm', type: 'button' }, 'Arrêter');
    stop.addEventListener('click', () => (results.length ? end() : dashboard(ctx.lesson)));
    if (!items.length) {
      head.replaceChildren(h('span', { class: 'w-title' }, title));
      body.replaceChildren(h('p', {}, 'Rien à travailler ici pour l’instant.'));
      const back = h('button', { class: 'btn', type: 'button' }, 'Retour');
      back.addEventListener('click', () => dashboard());
      foot.replaceChildren(back);
      return;
    }
    const step = () => {
      cleanup?.(); cleanup = null;
      if (!alive) return;
      if (i >= items.length) { end(); return; }
      const it = items[i];
      const where = ctx.kind === 'mix' ? it.lessonTitle : it.src;
      head.replaceChildren(h('span', { class: 'w-title' }, title), h('span', { class: 'w-sub' }, `${i + 1} / ${items.length}${where ? ' · ' + where : ''}`), stop);
      body.replaceChildren();
      const nextBtn = h('button', { class: 'btn primary', type: 'button', disabled: true }, i + 1 < items.length ? 'Suivante' : 'Voir le résultat');
      nextBtn.addEventListener('click', () => { i++; step(); });
      foot.replaceChildren(nextBtn);
      const finish = (ok, total) => { results.push({ it, ok, total }); nextBtn.disabled = false; };
      mountItem(body, it, finish);
      typo(head);
      typo(body);
    };
    const end = () => {
      cleanup?.(); cleanup = null;
      const ok = results.reduce((a, r) => a + r.ok, 0), n = results.reduce((a, r) => a + r.total, 0);
      record(ctx, results, ok, n);
      const missed = results.filter(r => r.ok < r.total);
      const again = h('button', { class: 'btn primary', type: 'button' }, 'Une autre série');
      again.addEventListener('click', () => (ctx.kind === 'lesson' ? startLesson(ctx.lesson) : ctx.kind === 'mix' ? startMix() : startPiece(ctx.id)));
      const back = h('button', { class: 'btn', type: 'button' }, ctx.kind === 'lesson' ? 'Revoir la fiche' : 'Retour');
      back.addEventListener('click', () => dashboard(ctx.lesson || null));
      const pct = n ? ok / n : 0;
      const card = h('div', { class: 'card mastery-end' },
        h('div', { class: 'eyebrow' }, title),
        h('h2', {}, `${ok} sur ${n}`),
        h('p', {}, pct >= 0.999 ? 'Tout juste.' : pct >= 0.8 ? 'Presque : ce que tu as manqué reviendra en tête de la prochaine série.' : ctx.kind === 'lesson' ? 'Relis la fiche, puis refais une série : ce que tu as manqué reviendra en premier.' : 'Ce que tu as manqué reviendra en premier la prochaine fois.'));
      if (missed.length) {
        const ul = h('ul', { class: 'mastery-missed' });
        for (const r of missed) {
          const it = r.it;
          if (it.type === 'fact') ul.append(h('li', { html: `<b>${esc(it.q)}</b> → ${esc(it.answer)}.${it.why ? ` <span class="muted">${esc(it.why)}</span>` : ''}` }));
          else if (it.type === 'quiz') ul.append(h('li', {}, `Série « ${it.cfg.title || 'exercices'} » : ${r.ok}/${r.total}`));
          else ul.append(h('li', {}, `${it.src} : ${r.ok}/${r.total}`));
        }
        card.append(h('div', { class: 'callout warn mt-1' }, h('div', { class: 'c-title' }, 'À revoir'), ul));
      }
      card.append(h('div', { class: 'btn-row mt-2' }, again, back));
      box.replaceChildren(card);
      typo(card);
    };
    step();
  }

  function mountItem(body, it, finish) {
    if (it.type === 'fact') {
      body.append(askBlock({ text: it.q, options: shuffle(it.options), answer: it.answer, why: it.why }, ok => finish(ok ? 1 : 0, 1)));
      return;
    }
    if (it.type === 'quiz') {
      const host = h('div');
      body.append(host);
      ensureAbcjs().then(() => import('./tool-ear.js')).then(m => {
        if (!alive || !host.isConnected) return;
        const un = m.mountQuiz(host, { ...it.cfg, count: QUIZ_COUNT, autostart: true, stat: null, onFinish: r => finish(r.ok, r.total) });
        cleanup = typeof un === 'function' ? un : null;
      });
      return;
    }
    // pièces : partition de l'extrait, mesure surlignée, deux ou trois questions
    const qs = it.type === 'analysis' ? analysisQuestions(it) : it.type === 'next' ? nextQuestions(it) : formQuestions(it);
    if (!qs.length) { body.append(h('p', { class: 'small muted' }, 'Pas de question pour cet extrait.')); finish(0, 0); return; }
    let score = null;
    const marks = new Set();
    const m0 = it.an ? it.an.bars[0].m : 1;
    const hint = q => {
      if (!score || q == null || q.m == null) return;
      for (const c of marks) score.unmark(c, 'n-hint');
      marks.clear();
      const k = q.m - m0, a = score.pickupQ + k * score.barQ, b = a + score.barQ;
      for (const e of score.events) if (e.t >= a - 1e-6 && e.t < b - 1e-6 && e.char != null) { score.mark(e.char, 'n-hint'); marks.add(e.char); }
    };
    let cur = qs[0];
    if (it.abc) {
      const sh = h('div', { class: 'mastery-score' });
      body.append(sh);
      ensureAbcjs().then(() => import('./score.js')).then(({ Score }) => {
        if (!alive || !sh.isConnected) return;
        score = new Score(sh, it.abc, { staffwidth: 700 });
        hint(cur);
      });
    }
    let right = 0;
    const ask = j => {
      if (j >= qs.length) { finish(right, qs.length); return; }
      cur = qs[j];
      hint(cur);
      const blk = askBlock(qs[j], ok => { if (ok) right++; ask(j + 1); });
      body.append(blk);
      typo(blk);
    };
    ask(0);
  }

  dashboard();
  return () => { alive = false; cleanup?.(); };
}

/** Carte de l'accueil : nombre de leçons à apprendre par cœur. */
export async function homeSummary() {
  await migrateMastery();
  return { n: chosenLessons().length };
}
