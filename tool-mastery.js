// « En cours de maîtrise » : cinq minutes par jour pour revoir, au bon moment, les notions des cours de théorie
// terminés et l'analyse des pièces (accords, fonctions), plus « Qu'est-ce qui vient après ? » pour les pièces
// apprises par cœur. Répétition espacée en boîtes de Leitner : une carte réussie revient de plus en plus tard.
import { h, shuffle, clamp } from './util.js';
import { store } from './store.js';
import { LESSONS, PIECES_META } from './content-meta.js';
import { FACTS, QUIZ_KINDS } from './content-mastery-facts.js';
import { ensureAbcjs } from './lazy.js';

/* ------------------------------------------------------------------ */
/* Dates et boîtes                                                     */
/* ------------------------------------------------------------------ */
const pad = n => String(n).padStart(2, '0');
export const isoDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return isoDay(new Date(y, m - 1, d + n));
}
/** Intervalle (jours) de chaque boîte ; la boîte 6 = carte maîtrisée, revue de loin en loin. */
export const INTERVALS = [0, 1, 2, 4, 8, 16, 32];
export const BOX_LABELS = ['', 'chaque jour', 'tous les 2 jours', 'tous les 4 jours', 'chaque semaine', 'toutes les 2 semaines', 'maîtrisées'];
const MAX_NEW = 3;     // nouvelles cartes par jour
const BUDGET = 20;     // ≈ 5 minutes (une question simple ≈ 15 s)

/** Nouvelle position d'une carte après une révision (score de 0 à 1). */
export function grade(prev, score, day = isoDay()) {
  const b = prev ? prev.b : 0;
  let nb;
  if (score >= 0.999) nb = b ? Math.min(6, b + 1) : 2;
  else if (score >= 0.6) nb = Math.max(1, b);
  else nb = 1;
  const wait = score >= 0.999 || score < 0.6 ? INTERVALS[nb] : Math.max(1, Math.round(INTERVALS[nb] / 2));
  return { b: nb, d: addDays(day, wait), n: (prev ? prev.n : 0) + 1, ok: (prev ? prev.ok : 0) + (score >= 0.999 ? 1 : 0), last: day };
}

/* ------------------------------------------------------------------ */
/* Cartes                                                              */
/* ------------------------------------------------------------------ */
const capture = (body, names) => {
  const got = [];
  const W = new Proxy({}, { get: (t, k) => (...args) => { if (names.includes(k)) got.push([k, ...args]); return k === 'informance' || k === 'yt' ? { title: '', url: '' } : ''; } });
  try { body(W); } catch (e) { console.warn('capture', e); }
  return got;
};
const chordLabel = c => (c[1] ? `${c[0]} (${c[1]})` : c[0]);
const FUNC = { T: 'tonique (T)', SD: 'sous-dominante (SD)', D: 'dominante (D)' };

/** Toutes les cartes disponibles : leçons de théorie terminées, analyses des pièces, pièces apprises par cœur. */
export async function collectCards({ isDone = id => store.isDone(id), byHeart = null } = {}) {
  const list = [];
  // identifiants sans point : ils servent de clés dans la sauvegarde (store.set découpe les chemins aux points)
  const cards = { push: c => list.push({ ...c, id: c.id.replace(/\./g, '_') }) };
  const theory = LESSONS.filter(l => l.module === 'theorie' && isDone(l.id));
  const { loadLesson, loadPiece } = await import('./content-index.js');
  for (const [i, l] of theory.entries()) {
    (FACTS[l.id] || []).forEach((f, k) => cards.push({ id: `fact:${l.id}:${k}`, type: 'fact', src: l.title, rank: i * 10 + k, w: 1, q: f[0], answer: f[1][0], options: f[1], why: f[2] }));
    const full = await loadLesson(l.id);
    if (!full) continue;
    capture(full.body, ['quiz']).forEach(([, cfg], k) => {
      if (!cfg || !QUIZ_KINDS.has(cfg.kind) || cfg.mode === 'play') return;
      cards.push({ id: `quiz:${l.id}:${cfg.stat || cfg.kind + k}`, type: 'quiz', src: l.title, rank: i * 10 + 5 + k, w: 4, cfg });
    });
  }
  const [{ ANALYSES }, ex] = await Promise.all([import('./content-analyses.js'), import('./content-excerpts.js')]);
  const sets = [[ex.OP55, 'op55-1'], [ex.OP15, 'op15-1'], [ex.CLAIR, 'clair-de-lune']];
  const heart = byHeart || Object.entries(store.get('pieces') || {}).filter(([, v]) => v && v.byHeart).map(([k]) => k);
  let ai = 0;
  for (const [set, piece] of sets) {
    const title = (PIECES_META[piece] || {}).title || piece;
    for (const [k, abc] of Object.entries(set)) {
      const an = ANALYSES.get(abc);
      if (!an || !an.bars || an.bars.reduce((n, b) => n + b.ch.length, 0) < 3) continue;
      const m0 = an.bars[0].m, m1 = an.bars[an.bars.length - 1].m;
      const src = `${title} · mes. ${m0}${m1 > m0 ? '–' + m1 : ''}`;
      cards.push({ id: `an:${piece}:${k}`, type: 'analysis', src, rank: 1000 + ai++, w: 4, piece, abc, an });
      if (heart.includes(piece)) cards.push({ id: `next:${piece}:${k}`, type: 'next', src, rank: 500 + ai, w: 3, piece, abc, an });
    }
  }
  for (const piece of heart) {
    const P = await loadPiece(piece);
    if (!P) continue;
    capture(P.body, ['diagram']).filter(([, name]) => name === 'form').forEach(([, , opts], k) => {
      const secs = (opts && opts.sections) || [];
      if (secs.length >= 3) cards.push({ id: `form:${piece}:${k}`, type: 'form', src: `${P.title} · plan${k ? ' (détail)' : ''}`, rank: 400 + k, w: 2, piece, sections: secs });
    });
  }
  return list;
}

/** Cartes du jour : celles dont la date est passée (les plus fragiles d'abord), puis quelques nouvelles. */
export function buildSession(cards, state, day = isoDay(), { budget = BUDGET, maxNew = MAX_NEW, freshToday = 0 } = {}) {
  const due = cards.filter(c => state[c.id] && state[c.id].d <= day)
    .sort((a, b) => (state[a.id].b - state[b.id].b) || state[a.id].d.localeCompare(state[b.id].d) || a.rank - b.rank);
  // nouvelles cartes : par cœur d'abord, puis théorie et analyse en alternance
  const fresh = cards.filter(c => !state[c.id]);
  const heart = fresh.filter(c => c.type === 'form' || c.type === 'next').sort((a, b) => a.rank - b.rank);
  const th = fresh.filter(c => c.type === 'fact' || c.type === 'quiz').sort((a, b) => a.rank - b.rank);
  const an = fresh.filter(c => c.type === 'analysis').sort((a, b) => a.rank - b.rank);
  const order = [...heart];
  for (let i = 0; i < Math.max(th.length, an.length); i++) { if (th[i]) order.push(th[i]); if (i % 2 === 1 && an[(i - 1) / 2]) order.push(an[(i - 1) / 2]); }
  for (const c of an) if (!order.includes(c)) order.push(c);
  const out = [];
  let w = 0;
  for (const c of due) { if (w + c.w > budget && out.length) break; out.push(c); w += c.w; }
  // les premiers jours (rien à réviser), un peu plus de nouvelles cartes ; ensuite trois par jour
  let n = Math.max(0, (due.length ? maxNew : maxNew + 2) - freshToday);
  for (const c of order) { if (!n || (w + c.w > budget && out.length)) break; out.push(c); w += c.w; n--; }
  return { cards: out, due: due.length, fresh: fresh.length };
}

/** Résumé : cartes par boîte, cartes dues aujourd'hui. */
export function summary(cards, state, day = isoDay()) {
  const boxes = [0, 0, 0, 0, 0, 0, 0];
  let due = 0;
  for (const c of cards) {
    const s = state[c.id];
    if (!s) { boxes[0]++; continue; }
    boxes[s.b]++;
    if (s.d <= day) due++;
  }
  return { boxes, due, total: cards.length };
}

/* ------------------------------------------------------------------ */
/* Questions des cartes                                                */
/* ------------------------------------------------------------------ */
/** Questions d'une carte d'analyse : accords (et fonctions) de mesures tirées au hasard. */
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
      onAnswer(ok);
    });
    opts.append(b);
  }
  return h('div', { class: 'mastery-q' }, h('div', { class: 'quiz-q' }, q.text), opts, fb);
}

export function mountMastery(el, cfg = {}) {
  const box = h('div', { class: 'mastery' });
  el.append(box);
  let alive = true, cleanup = null, cards = [];
  const state = () => store.get('mastery.cards') || {};
  const freshToday = () => { const d = store.get('mastery.day') || {}; return d.date === isoDay() ? d.fresh || 0 : 0; };

  async function dashboard() {
    cleanup?.(); cleanup = null;
    box.replaceChildren(h('p', { class: 'w-loading' }, 'Préparation des cartes…'));
    try { cards = await collectCards(); } catch (e) { console.error(e); box.textContent = 'Cartes indisponibles : ' + e.message; return; }
    if (!alive) return;
    const st = state();
    const sum = summary(cards, st);
    const sess = buildSession(cards, st, isoDay(), { freshToday: freshToday() });
    const nNew = sess.cards.filter(c => !st[c.id]).length;
    const head = h('div', { class: 'card mastery-today' });
    if (!cards.length) {
      head.append(h('h2', {}, 'Rien à revoir pour l’instant'), h('p', {}, 'Les cartes viennent des leçons de théorie terminées (bouton « Marquer comme terminée » en bas de chaque leçon) et de l’analyse de tes pièces.'));
    } else if (!sess.cards.length) {
      const next = Object.values(st).map(s => s.d).filter(d => d > isoDay()).sort()[0];
      head.append(h('h2', {}, 'C’est fait pour aujourd’hui'), h('p', {}, next ? `Prochaine révision : ${fmtDay(next)}.` : 'Reviens demain.'));
    } else {
      const minutes = Math.max(1, Math.round(sess.cards.reduce((a, c) => a + c.w, 0) * 15 / 60));
      const start = h('button', { class: 'btn primary lg', type: 'button' }, 'Commencer');
      start.addEventListener('click', () => run(sess.cards));
      head.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Aujourd’hui'), h('span', { class: 'tag accent' }, `≈ ${minutes} min`)),
        h('h2', {}, `${sess.cards.length} carte${sess.cards.length > 1 ? 's' : ''} à revoir`),
        h('p', { class: 'small' }, `${sess.cards.length - nNew} à réviser, ${nNew} nouvelle${nNew > 1 ? 's' : ''}.${sess.due > sess.cards.length - nNew ? ` Les ${sess.due - (sess.cards.length - nNew)} autres attendront demain : cinq minutes suffisent.` : ''}`),
        h('div', { class: 'btn-row' }, start));
    }
    const boxes = h('div', { class: 'mastery-boxes' });
    for (let b = 1; b <= 6; b++) boxes.append(h('div', { class: 'mastery-box' + (b === 6 ? ' done' : '') }, h('b', {}, String(sum.boxes[b])), h('span', {}, b === 6 ? 'maîtrisées' : `boîte ${b}`), h('small', {}, b === 6 ? 'tous les mois' : BOX_LABELS[b])));
    const counts = { fact: 0, quiz: 0, analysis: 0, next: 0, form: 0 };
    for (const c of cards) counts[c.type]++;
    const src = h('div', { class: 'small muted' },
      `${counts.fact + counts.quiz} cartes de théorie (leçons terminées) · ${counts.analysis} d’analyse de tes pièces` + (counts.next + counts.form ? ` · ${counts.next + counts.form} « par cœur »` : '') + ` · ${sum.boxes[0]} pas encore vues.`);
    box.replaceChildren(head, h('div', { class: 'section-title' }, h('h2', {}, 'Tes cartes')), boxes, src, heartBlock());
  }

  function heartBlock() {
    const wrap = h('div', { class: 'callout tip mt-2' }, h('div', { class: 'c-title' }, 'Pièces apprises par cœur'),
      h('p', { class: 'small' }, 'Pour ces pièces s’ajoutent des questions « Qu’est-ce qui vient après ? » : la section suivante du plan, l’accord suivant. Ce sont les repères qui permettent de repartir en cas de trou de mémoire.'));
    const row = h('div', { class: 'btn-row' });
    for (const id of ['op55-1', 'op15-1', 'clair-de-lune']) {
      const P = PIECES_META[id];
      if (!P) continue;
      const on = !!store.get(`pieces.${id}.byHeart`);
      const cb = h('input', { type: 'checkbox', checked: on });
      cb.addEventListener('change', () => { store.set(`pieces.${id}.byHeart`, cb.checked); dashboard(); });
      row.append(h('label', { class: 'check' }, cb, P.title));
    }
    wrap.append(row);
    return wrap;
  }

  function run(list) {
    let i = 0, okCount = 0;
    const results = [];
    const next = () => {
      cleanup?.(); cleanup = null;
      if (!alive) return;
      if (i >= list.length) return done();
      const card = list[i];
      const st0 = state()[card.id];
      const frame = h('div', { class: 'w-frame mastery-card' });
      const top = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, `Carte ${i + 1} / ${list.length}`), h('span', { class: 'w-sub' }, card.src), st0 ? h('span', { class: 'tag' }, st0.b === 6 ? 'maîtrisée' : `boîte ${st0.b}`) : h('span', { class: 'tag gold' }, 'nouvelle'));
      const body = h('div', { class: 'w-body' });
      const foot = h('div', { class: 'w-foot' });
      const nextBtn = h('button', { class: 'btn primary', type: 'button', disabled: true }, i + 1 < list.length ? 'Carte suivante' : 'Terminer');
      nextBtn.addEventListener('click', () => { i++; next(); });
      foot.append(nextBtn);
      frame.append(top, body, foot);
      box.replaceChildren(frame);
      const finish = score => {
        const prev = state()[card.id];
        const g = grade(prev, score);
        store.set(`mastery.cards.${card.id}`, g);
        if (!prev) { const d = store.get('mastery.day') || {}; store.set('mastery.day', { date: isoDay(), fresh: (d.date === isoDay() ? d.fresh || 0 : 0) + 1 }); }
        results.push({ card, score, g });
        if (score >= 0.999) okCount++;
        nextBtn.disabled = false;
        foot.append(h('span', { class: 'small muted' }, g.b === 6 ? 'Carte maîtrisée : elle reviendra dans un mois.' : `Prochaine fois : ${fmtDay(g.d)}.`));
      };
      if (card.type === 'fact') {
        body.append(askBlock({ text: card.q, options: shuffle(card.options), answer: card.answer, why: card.why }, ok => finish(ok ? 1 : 0)));
      } else if (card.type === 'quiz') {
        const host = h('div');
        body.append(host);
        ensureAbcjs().then(() => import('./tool-ear.js')).then(m => {
          if (!alive) return;
          const un = m.mountQuiz(host, { ...card.cfg, count: 3, autostart: true, stat: null, onFinish: r => finish(r.ok / r.total) });
          cleanup = typeof un === 'function' ? un : null;
        });
      } else {
        const qs = card.type === 'analysis' ? analysisQuestions(card) : card.type === 'next' ? nextQuestions(card) : formQuestions(card);
        if (!qs.length) { finish(1); return; }
        let score = null;
        const marks = new Set();
        if (card.abc) {
          const sh = h('div', { class: 'mastery-score' });
          body.append(sh);
          ensureAbcjs().then(() => import('./score.js')).then(({ Score }) => {
            if (!alive) return;
            score = new Score(sh, card.abc, { staffwidth: 700 });
            hint(qs[0]);
          });
        }
        const m0 = card.an ? card.an.bars[0].m : 1;
        const hint = q => {
          if (!score || q == null || q.m == null) return;
          for (const c of marks) score.unmark(c, 'n-hint');
          marks.clear();
          const k = q.m - m0, a = score.pickupQ + k * score.barQ, b = a + score.barQ;
          for (const e of score.events) if (e.t >= a - 1e-6 && e.t < b - 1e-6 && e.char != null) { score.mark(e.char, 'n-hint'); marks.add(e.char); }
        };
        let answered = 0, right = 0;
        const step = j => {
          if (j >= qs.length) { finish(right / qs.length); return; }
          hint(qs[j]);
          body.append(askBlock(qs[j], ok => { answered++; if (ok) right++; step(j + 1); }));
        };
        step(0);
      }
    };
    const done = () => {
      const failed = results.filter(r => r.score < 0.6).length;
      const again = h('button', { class: 'btn', type: 'button' }, 'Retour');
      again.addEventListener('click', dashboard);
      box.replaceChildren(h('div', { class: 'card mastery-today' },
        h('h2', {}, 'Révision terminée'),
        h('p', {}, `${results.length} carte${results.length > 1 ? 's' : ''} revue${results.length > 1 ? 's' : ''} : ${okCount} sans faute${failed ? `, ${failed} à revoir dès demain` : ''}.`),
        h('p', { class: 'small' }, 'Une carte réussie revient de plus en plus tard (2, 4, 8, 16 jours, puis un mois) ; une carte ratée revient le lendemain. C’est cet espacement qui fixe la mémoire.'),
        h('div', { class: 'btn-row' }, again)));
      store.push('stats.mastery', { at: Date.now(), n: results.length, ok: okCount }, 200);
    };
    next();
  }

  dashboard();
  return () => { alive = false; cleanup?.(); };
}

function fmtDay(iso) {
  const t = isoDay(), tm = addDays(t, 1);
  if (iso <= t) return 'aujourd’hui';
  if (iso === tm) return 'demain';
  const [y, m, d] = iso.split('-').map(Number);
  return 'le ' + new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Nombre de cartes dues aujourd'hui (carte de l'accueil). */
export async function dueToday() {
  const cards = await collectCards();
  const st = store.get('mastery.cards') || {};
  const sess = buildSession(cards, st, isoDay(), { freshToday: (() => { const d = store.get('mastery.day') || {}; return d.date === isoDay() ? d.fresh || 0 : 0; })() });
  return { n: sess.cards.length, total: cards.length, minutes: Math.max(1, Math.round(sess.cards.reduce((a, c) => a + c.w, 0) * 15 / 60)) };
}
