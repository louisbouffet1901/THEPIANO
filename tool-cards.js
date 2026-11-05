// Cartes du jour (V8.1) : la mémoire espacée, façon Anki. Une question ; tu cherches la réponse de tête ; tu la
// découvres ; tu dis si c'était facile. Une carte sue revient de plus en plus tard ; une carte qui résiste revient vite.
// Les cartes viennent des notions des leçons de théorie (niveau 1) et des questions « À retenir » (niveau 2), pour les
// leçons faites, commencées ou cochées « à apprendre par cœur ». Rien à gérer : ni boîtes, ni planning.
// (La V6.1 avait retiré les boîtes de Leitner de la V3 : ici, pas de séries imposées, des cartes d'une question.)
import { h, esc, shuffle } from './util.js';
import { store } from './store.js';
import { LEVELS, lessonsOf } from './content-index.js';

const KEY = 'cards';
export const PER_DAY = [5, 8, 12, 20];
/** Numéro du jour (local). */
export const dayNum = (t = Date.now()) => { const d = new Date(t); d.setHours(12, 0, 0, 0); return Math.round(d.getTime() / 864e5); };
const read = () => { const x = store.get(KEY) || {}; return { s: {}, day: null, conf: { perDay: 8, mode: 'tete' }, hist: [], ...x, conf: { perDay: 8, mode: 'tete', ...(x.conf || {}) } }; };
const save = x => store.set(KEY, { ...x });

/* ------------------------------------------------------------------ */
/* Le paquet : les leçons de théorie faites, commencées ou par cœur      */
/* ------------------------------------------------------------------ */
const theoryLessons = () => LEVELS.filter(l => !l.locked).flatMap(l => lessonsOf(l.id, 'theorie'));
const started = id => ((store.get(`lessonSteps.${id}`) || {}).done || []).length > 0;
const byHeart = id => !!(store.get(`mastery.lessons.${id}`) || {}).on;
export const deckLessons = () => theoryLessons().filter(l => store.isDone(l.id) || byHeart(l.id) || started(l.id));
let cache = null;
/** Les cartes du paquet : { id, q, a, why, options, lesson, lessonTitle }. */
export async function deck() {
  const ls = deckLessons();
  const key = ls.map(l => l.id).join(',');
  if (cache && cache.key === key) return cache.cards;
  const ms = await import('./tool-mastery.js');
  const seen = new Set();
  const out = [];
  for (const l of ls) {
    let d = null;
    try { d = await ms.lessonData(l.id); } catch (e) { d = null; }
    if (!d) continue;
    for (const it of d.items) {
      if (it.type !== 'fact' || !it.q || !it.answer || seen.has(it.id)) continue;
      seen.add(it.id);
      out.push({ id: it.id, q: it.q, a: it.answer, why: it.why || '', options: Array.isArray(it.options) ? it.options : null, lesson: l.id, lessonTitle: l.title, src: it.src || '' });
    }
  }
  cache = { key, cards: out };
  return out;
}
/** Ce qui attend aujourd'hui : cartes à revoir, nouvelles possibles, total. Garde le compte pour le menu. */
export async function deckSummary(now = Date.now()) {
  const cards = await deck();
  const st = read();
  const today = dayNum(now);
  const due = cards.filter(c => st.s[c.id] && st.s[c.id].due <= today).length;
  const newToday = st.day && st.day.d === today ? st.day.new : 0;
  const unseen = cards.filter(c => !st.s[c.id]).length;
  const fresh = Math.min(unseen, Math.max(0, st.conf.perDay - newToday));
  const badge = store.get('cards.badge');
  const day = new Date(now).toDateString();
  if (!badge || badge.day !== day || badge.n !== due) store.set('cards.badge', { day, n: due });
  return { total: cards.length, due, fresh, unseen, known: cards.filter(c => st.s[c.id] && st.s[c.id].ivl >= 21).length, lessons: deckLessons().length };
}

/* ------------------------------------------------------------------ */
/* L'espacement (SM-2 simplifié, au jour près)                          */
/* ------------------------------------------------------------------ */
export const GRADES = [
  { g: 0, label: 'À revoir', cls: 'again' },
  { g: 1, label: 'Difficile', cls: 'hard' },
  { g: 2, label: 'Bien', cls: 'good' },
  { g: 3, label: 'Facile', cls: 'easy' },
];
/** Nouvel état d'une carte après une note : { ivl (jours), ease, reps, lapses }. « À revoir » : elle revient dans la séance. */
export function nextState(s0, g) {
  const s = s0 ? { ...s0 } : { ivl: 0, ease: 2.5, reps: 0, lapses: 0 };
  if (g === 0) {
    if (s.reps > 0) s.lapses += 1;
    s.reps = 0; s.ivl = 0; s.ease = Math.max(1.3, s.ease - 0.2);
    return s;
  }
  if (s.reps === 0) s.ivl = g === 3 ? 4 : 1;
  else if (s.reps === 1) s.ivl = g === 1 ? 2 : g === 2 ? 3 : 6;
  else s.ivl = Math.round(g === 1 ? Math.max(s.ivl + 1, s.ivl * 1.2) : g === 2 ? s.ivl * s.ease : s.ivl * s.ease * 1.3);
  if (g === 1) s.ease = Math.max(1.3, s.ease - 0.15);
  if (g === 3) s.ease = Math.min(3.2, s.ease + 0.15);
  s.ivl = Math.min(365, Math.max(1, s.ivl));
  s.reps += 1;
  return s;
}
export const ivlLabel = d => (d <= 0 ? 'tout de suite' : d === 1 ? 'demain' : d < 14 ? `${d} j` : d < 60 ? `${Math.round(d / 7)} sem.` : d < 365 ? `${Math.round(d / 30)} mois` : '1 an');
/** La file du jour : les cartes à revoir (les plus en retard d'abord), une nouvelle toutes les trois. */
export function buildQueue(cards, st, today, newMax) {
  const due = cards.filter(c => st.s[c.id] && st.s[c.id].due <= today).sort((a, b) => st.s[a.id].due - st.s[b.id].due).slice(0, 60);
  const fresh = cards.filter(c => !st.s[c.id]).slice(0, Math.max(0, newMax));
  const q = [];
  let i = 0, j = 0;
  while (i < due.length || j < fresh.length) {
    for (let k = 0; k < 3 && i < due.length; k++) q.push(due[i++]);
    if (j < fresh.length) q.push(fresh[j++]);
  }
  return q;
}

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
/** La séance de cartes. `compact` : intégrée (loin du piano) ; `onFinish` à la fin. */
export function mountCards(el, { compact = false, onFinish = null } = {}) {
  let alive = true, keyOff = null;
  const frame = h('div', { class: 'w-frame fc-frame' + (compact ? ' ns-bare' : '') });
  const sub = h('span', { class: 'w-sub' });
  if (!compact) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Cartes du jour'), sub));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  const setKeys = fn => { if (keyOff) document.removeEventListener('keydown', keyOff); keyOff = fn; if (fn) document.addEventListener('keydown', fn); };

  async function idle(extraNew = 0) {
    setKeys(null);
    body.innerHTML = '';
    const cards = await deck();
    if (!alive) return;
    const st = read();
    const today = dayNum();
    const sum = await deckSummary();
    sub.textContent = sum.total ? `${sum.total} cartes · ${sum.known} bien sues` : '';
    if (!sum.total) {
      body.append(h('p', { class: 'small mt-0' }, 'Tes cartes viennent des leçons de théorie que tu as faites, commencées ou cochées « à apprendre par cœur ». Commence un chapitre : ses cartes arrivent ici.'),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn primary', href: '#/outils/theorie' }, 'Les chapitres de théorie')));
      return;
    }
    const stats = h('div', { class: 'fc-stats' },
      h('div', {}, h('b', {}, String(sum.due)), h('small', {}, 'à revoir')),
      h('div', {}, h('b', {}, String(sum.fresh + extraNew > sum.unseen ? sum.unseen : sum.fresh + extraNew)), h('small', {}, 'nouvelles')),
      h('div', {}, h('b', {}, String(sum.known)), h('small', {}, 'bien sues')));
    // la façon de répondre : de tête (Anki), ou en choisissant (dans le bruit, sans réfléchir à voix haute)
    const mode = h('div', { class: 'seg', role: 'group', 'aria-label': 'Façon de répondre' });
    [['tete', 'De tête'], ['choix', 'Avec les choix']].forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: st.conf.mode === v ? 'on' : '' }, l);
      b.addEventListener('click', () => { const x = read(); x.conf.mode = v; save(x); mode.querySelectorAll('button').forEach(y => y.classList.toggle('on', y === b)); });
      mode.append(b);
    });
    const per = h('div', { class: 'seg', role: 'group', 'aria-label': 'Nouvelles cartes par jour' });
    PER_DAY.forEach(v => {
      const b = h('button', { type: 'button', class: st.conf.perDay === v ? 'on' : '' }, String(v));
      b.addEventListener('click', () => { const x = read(); x.conf.perDay = v; save(x); idle(); });
      per.append(b);
    });
    const queue = buildQueue(cards, st, today, Math.min(sum.unseen, sum.fresh + extraNew));
    const go = h('button', { class: 'btn primary lg', type: 'button', disabled: !queue.length }, queue.length ? `Commencer · ${queue.length} carte${queue.length > 1 ? 's' : ''} (≈ ${Math.max(1, Math.round(queue.length * 9 / 60))} min)` : 'Rien à revoir aujourd’hui');
    go.addEventListener('click', () => run(queue));
    body.append(stats,
      compact ? null : h('p', { class: 'small fc-how' }, 'Lis la question et cherche la réponse ', h('b', {}, 'de tête'), ', vraiment, avant de la découvrir. Puis dis honnêtement comment ça s’est passé : c’est ce qui règle le moment où la carte reviendra.'),
      h('div', { class: 'fc-opts' }, h('label', { class: 'field inline small' }, 'Répondre', mode), compact ? null : h('label', { class: 'field inline small' }, 'Nouvelles par jour', per)),
      h('div', { class: 'btn-row mt-1' }, go));
    if (!queue.length && sum.unseen) {
      const more = h('button', { class: 'btn', type: 'button' }, `Apprendre 5 cartes de plus (${sum.unseen} pas encore vues)`);
      more.addEventListener('click', () => idle(extraNew + 5));
      body.append(h('div', { class: 'btn-row mt-1' }, more));
    }
    if (!queue.length && !compact) body.append(h('p', { class: 'small muted mt-1 mb-0' }, 'Envie de jouer ? ', h('a', { href: '#/theorie/defis' }, 'Un défi éclair'), '.'));
  }

  function run(queue) {
    const total = queue.length;
    let done = 0, firstOk = 0;
    const again = new Map(); // id -> nombre de retours dans la séance
    const seenFirst = new Set();
    const prog = h('div', { class: 'progress fc-prog' }, h('i'));
    const count = h('span', { class: 'small muted' });
    const top = h('div', { class: 'fc-top' }, count, h('button', { class: 'btn ghost sm', type: 'button', onclick: () => idle() }, 'Arrêter'));
    const box = h('div', { class: 'fc-card', 'aria-live': 'polite' });
    const act = h('div', { class: 'fc-act' });
    body.innerHTML = '';
    body.append(top, prog, box, act);
    const show = () => {
      const c = queue[0];
      if (!c) { end(); return; }
      const st = read();
      const s0 = st.s[c.id] || null;
      count.textContent = `${done} / ${total}${s0 ? '' : ' · nouvelle carte'}`;
      prog.firstChild.style.width = `${total ? done / total * 100 : 0}%`;
      box.className = 'fc-card';
      box.innerHTML = '';
      box.append(h('div', { class: 'fc-src' }, c.lessonTitle), h('div', { class: 'fc-q', html: c.q }));
      act.innerHTML = '';
      const grade = g => {
        const x = read();
        const today = dayNum();
        const ns = nextState(x.s[c.id] || null, g);
        x.s[c.id] = { ...ns, due: g === 0 ? today : today + ns.ivl, last: Date.now() };
        if (!seenFirst.has(c.id)) {
          seenFirst.add(c.id);
          if (g >= 2) firstOk++;
          if (!s0) x.day = { d: today, new: (x.day && x.day.d === today ? x.day.new : 0) + 1, rev: x.day && x.day.d === today ? x.day.rev || 0 : 0 };
          else x.day = { d: today, new: x.day && x.day.d === today ? x.day.new : 0, rev: (x.day && x.day.d === today ? x.day.rev || 0 : 0) + 1 };
        }
        save(x);
        queue.shift();
        if (g === 0 && (again.get(c.id) || 0) < 3) { again.set(c.id, (again.get(c.id) || 0) + 1); queue.splice(Math.min(3, queue.length), 0, c); }
        else done++;
        show();
      };
      const reveal = () => {
        box.classList.add('back');
        box.append(h('div', { class: 'fc-a', html: c.a }), c.why ? h('div', { class: 'fc-why small', html: c.why }) : null);
        act.innerHTML = '';
        const row = h('div', { class: 'fc-grades' });
        const cur = read().s[c.id] || null;
        GRADES.forEach(G => {
          const ns = nextState(cur, G.g);
          const b = h('button', { type: 'button', class: `fc-g ${G.cls}` }, h('b', {}, G.label), h('small', {}, G.g === 0 ? 'tout de suite' : ivlLabel(ns.ivl)));
          b.addEventListener('click', () => grade(G.g));
          row.append(b);
        });
        act.append(row);
        setKeys(e => { const k = +e.key; if (k >= 1 && k <= 4) { e.preventDefault(); grade(k - 1); } });
      };
      if (read().conf.mode === 'choix' && c.options && c.options.length >= 2) {
        const opts = h('div', { class: 'fc-choices' });
        shuffle(c.options.slice()).forEach(o => {
          const b = h('button', { type: 'button', class: 'fc-choice', html: o });
          b.addEventListener('click', () => {
            const ok = o === c.a;
            opts.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.innerHTML === b.innerHTML && !ok) x.classList.add('bad'); });
            [...opts.querySelectorAll('button')].find(x => x.textContent === h('span', { html: c.a }).textContent)?.classList.add('ok');
            if (c.why) box.append(h('div', { class: 'fc-why small', html: c.why }));
            const next = h('button', { class: 'btn primary', type: 'button' }, ok ? 'Suivante' : 'Compris, suivante');
            next.addEventListener('click', () => grade(ok ? 2 : 0));
            act.innerHTML = '';
            act.append(h('div', { class: 'btn-row' }, next));
            setKeys(e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); grade(ok ? 2 : 0); } });
            next.focus();
          });
          opts.append(b);
        });
        box.append(opts);
        setKeys(null);
      } else {
        const rv = h('button', { class: 'btn primary lg fc-reveal', type: 'button' }, 'Voir la réponse');
        rv.addEventListener('click', reveal);
        act.append(rv);
        box.addEventListener('click', () => { if (!box.classList.contains('back')) reveal(); }, { once: true });
        setKeys(e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!box.classList.contains('back')) reveal(); } });
      }
    };
    async function end() {
      setKeys(null);
      const x = read();
      x.hist = [...(x.hist || []), { at: Date.now(), n: total, ok: firstOk }].slice(-60);
      save(x);
      const cards = await deck();
      const tomorrow = cards.filter(c => x.s[c.id] && x.s[c.id].due <= dayNum() + 1).length;
      if (!alive) return;
      body.innerHTML = '';
      body.append(h('div', { class: 'fc-end' },
        h('div', { class: 'big-score' },
          h('div', {}, h('div', { class: 'v' }, String(total)), h('div', { class: 'l' }, 'cartes')),
          h('div', {}, h('div', { class: 'v' }, total ? `${Math.round(firstOk / total * 100)} %` : '—'), h('div', { class: 'l' }, 'sues du premier coup')),
          h('div', {}, h('div', { class: 'v' }, String(tomorrow)), h('div', { class: 'l' }, 'à revoir demain'))),
        h('p', { class: 'small' }, firstOk === total && total ? 'Tout juste du premier coup : ces cartes reviendront plus tard.' : 'Les cartes qui ont résisté reviendront demain ; les autres, plus tard.')));
      const row = h('div', { class: 'btn-row' });
      const again2 = h('button', { class: 'btn', type: 'button' }, 'Encore');
      again2.addEventListener('click', () => idle());
      row.append(again2);
      if (!compact) row.append(h('a', { class: 'btn ghost', href: '#/theorie/defis' }, 'Un défi éclair'));
      body.append(row);
      onFinish?.({ n: total, ok: firstOk });
    }
    show();
  }

  idle();
  return () => { alive = false; setKeys(null); };
}
