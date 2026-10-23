// Échauffement de lecture à vue (V7.1) : trois minutes avant les extraits. Une minute de rythme (le point faible
// déclaré, et l'entraînement le mieux étudié), puis deux exercices d'une minute qui tournent entre les notes, les
// intervalles et les accords : lire par motifs plutôt que note à note. Les deux exercices du jour sont ceux faits il y a
// le plus longtemps ; la séance du jour reste la même jusqu'au soir.
import { h, esc } from './util.js';
import { store } from './store.js';
import { dayKey } from './activity.js';

const DRILLS = ['notes', 'intervals', 'chords'];
const LABEL = { rhythm: 'Rythme', notes: 'Notes', intervals: 'Intervalles', chords: 'Accords' };
const WHY = {
  rhythm: 'Ton point faible : le rythme. Une minute chaque jour, en comptant à voix haute.',
  notes: 'Reconnaître chaque note d’un coup d’œil, à la bonne octave.',
  intervals: 'Lire l’écart entre deux notes et le jouer d’un geste, sans les nommer.',
  chords: 'Lire la forme d’un accord (fondamental ou renversé) et le poser d’un geste.',
};

const read = () => store.get('warmup') || {};
/** Le programme du jour : le rythme, puis les deux exercices faits il y a le plus longtemps. */
export function warmupPlan(now = Date.now()) {
  const w = read();
  const day = dayKey(now);
  if (w.plan && w.plan.day === day) return w.plan;
  const last = w.last || {};
  const two = DRILLS.slice().sort((a, b) => (last[a] || 0) - (last[b] || 0)).slice(0, 2).sort((a, b) => DRILLS.indexOf(a) - DRILLS.indexOf(b));
  const plan = { day, steps: ['rhythm', ...two], done: {} };
  store.set('warmup', { ...w, plan });
  return plan;
}
function markDone(step, summary) {
  const w = read();
  const plan = { ...w.plan, done: { ...(w.plan?.done || {}), [step]: summary } };
  store.set('warmup', { ...w, plan, last: { ...(w.last || {}), [step]: Date.now() } });
  return plan;
}
const summaryOf = (step, r) => (step === 'rhythm' ? `${r.good}/${r.n} réussis` : `${r.npm} par minute`);

/** L'encadré d'échauffement, en tête de la page Lecture à vue. */
export function mountWarmup(el, { level = 'n1', onDone } = {}) {
  let plan = warmupPlan();
  const frame = h('div', { class: 'w-frame warmup' });
  const headSub = h('span', { class: 'w-sub' });
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Échauffement · 3 minutes'), headSub));
  const steps = h('div', { class: 'wu-steps', role: 'tablist', 'aria-label': 'Exercices de l’échauffement' });
  const why = h('p', { class: 'small wu-why' });
  const host = h('div', { class: 'wu-host' });
  const after = h('div', { class: 'wu-after' });
  const body = h('div', { class: 'w-body' }, steps, why, host, after);
  frame.append(body);
  el.append(frame);
  let cleanup = null, current = null, gen = 0;

  const allDone = () => plan.steps.every(s => plan.done[s]);
  const renderSteps = () => {
    steps.innerHTML = '';
    plan.steps.forEach((s, i) => {
      const done = plan.done[s];
      const b = h('button', { type: 'button', role: 'tab', class: 'wu-step' + (s === current ? ' on' : '') + (done ? ' done' : ''), 'aria-selected': String(s === current) },
        h('span', { class: 'wu-n' }, done ? '✓' : String(i + 1)), h('span', {}, h('b', {}, LABEL[s]), h('small', {}, done ? done : '1 min')));
      b.addEventListener('click', () => open(s));
      steps.append(b);
    });
    const n = plan.steps.filter(s => plan.done[s]).length;
    headSub.textContent = allDone() ? 'fait aujourd’hui' : n ? `${n} sur 3 faits` : 'le rythme, puis deux exercices d’une minute';
  };
  const renderAfter = () => {
    after.innerHTML = '';
    const i = plan.steps.indexOf(current);
    const nextStep = plan.steps.slice(i + 1).concat(plan.steps.slice(0, i)).find(s => !plan.done[s]);
    if (plan.done[current] && nextStep) {
      const go = h('button', { class: 'btn primary', type: 'button' }, `Exercice suivant : ${LABEL[nextStep]} (1 min)`);
      go.addEventListener('click', () => open(nextStep, true));
      after.append(h('div', { class: 'btn-row' }, go));
    } else if (allDone()) {
      const go = h('button', { class: 'btn primary', type: 'button' }, 'Place aux extraits');
      go.addEventListener('click', () => onDone?.());
      after.append(h('div', { class: 'callout key wu-fin' }, h('div', { class: 'c-title' }, 'Échauffement fait'),
        h('p', { class: 'small' }, plan.steps.map(s => `${LABEL[s]} : ${plan.done[s]}`).join(' · ') + '. Maintenant, de vrais extraits : prépare-toi 30 secondes, puis joue sans t’arrêter.'), go));
    }
  };
  async function open(step, autostart = false) {
    const my = ++gen;
    current = step;
    try { cleanup?.(); } catch (e) { /* */ }
    cleanup = null;
    host.innerHTML = '';
    why.textContent = WHY[step];
    renderSteps(); renderAfter();
    const onFinish = r => {
      plan = markDone(step, summaryOf(step, r));
      renderSteps(); renderAfter();
      after.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    };
    let mount;
    if (step === 'rhythm') mount = (await import('./tool-rhythm.js')).mountRhythmMinute;
    else if (step === 'notes') mount = (await import('./tool-notespeed.js')).mountNoteSpeed;
    else { const m = await import('./tool-readdrill.js'); mount = (e, o) => m.mountReadDrill(e, { ...o, kind: step, level }); }
    if (my !== gen) return;
    cleanup = mount(host, { bare: true, onFinish });
    if (autostart) host.querySelector('.ns-idle .btn.primary, .btn.primary')?.focus();
  }
  // au départ : la première étape pas encore faite ; échauffement déjà fait aujourd'hui : replié (un toucher sur une
  // étape la rouvre)
  if (allDone()) { renderSteps(); renderAfter(); }
  else open(plan.steps.find(s => !plan.done[s]));
  return () => { gen++; try { cleanup?.(); } catch (e) { /* */ } };
}

/** Résumé d'une ligne pour la séance : l'échauffement du jour est-il fait ? */
export function warmupStatus(now = Date.now()) {
  const w = read();
  const p = w.plan && w.plan.day === dayKey(now) ? w.plan : null;
  if (!p) return { done: 0, total: 3 };
  return { done: p.steps.filter(s => p.done[s]).length, total: p.steps.length, steps: p.steps.map(s => esc(LABEL[s])) };
}
