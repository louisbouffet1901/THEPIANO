// « Tes 15 minutes » (V9) : la méthode du bilan du 17 novembre 2026 (claude/bilan-efficacite.md).
// Trois blocs de 5 minutes, avant les morceaux, sur le matériel d'un cycle : mêmes tonalités, même formule de main
// gauche, mêmes accords dans les trois blocs. Un cycle = 18 jours de pratique (environ trois semaines) ; un jour où l'on
// ne joue pas ne compte pas. Ce module garde l'état (cycle, jour, temps de chaque bloc, mesures du cycle) ; il ne touche
// pas au DOM. L'interface est dans tool-quinze.js.
import { store } from './store.js';
import { dayKey, logActivity } from './activity.js';

export const BLOCK_MS = 5 * 60 * 1000;
export const CYCLE_DAYS = 18;
/** Un jour compte dans le cycle à partir d'une minute de travail dans les 15 minutes. */
export const DAY_MIN_MS = 60 * 1000;
export const BLOCKS = [
  { id: 'A', title: 'Rythme à deux mains', short: 'Rythme', cat: 'lecture' },
  { id: 'B', title: 'Réflexes et accords', short: 'Accords', cat: 'lecture' },
  { id: 'C', title: 'Improviser à deux mains', short: 'Improvisation', cat: 'impro' },
];
export const blockById = id => BLOCKS.find(b => b.id === id);

const K = (tonic, pc, mode) => ({ tonic, pc, mode });
const FORMULA_TEXT = { 'basse-accord': 'basse et accord', valse: 'valse', arpege: 'arpège' };
/**
 * Les cycles. tonic : nom français (théorie, lecture) ; pc : hauteur 0-11 (accompagnateur, échelle).
 * notion : la question de la semaine (« Où as-tu retrouvé … cette semaine ? »).
 */
export const CYCLES = [
  { n: 1, title: 'Les accords et la main gauche', formula: 'basse-accord', meter: 4, keys: [K('do', 0, 'maj'), K('la', 9, 'min')],
    theory: 'les accords de trois sons et leurs renversements ; I, IV, V7, vi, ii joués au plus près', notion: 'le V7' },
  { n: 2, title: 'La valse', formula: 'valse', meter: 3, keys: [K('fa', 5, 'maj'), K('ré', 2, 'min')],
    theory: 'le V7 et ses renversements ; la cadence rompue', notion: 'un V7 renversé' },
  { n: 3, title: 'L’arpège', formula: 'arpege', meter: 4, keys: [K('mi', 4, 'min'), K('fa', 5, 'min')],
    theory: 'le mineur harmonique : la sensible dans V et V7, le ii° ; les cadences', notion: 'une cadence parfaite' },
  { n: 4, title: 'Basse et accord, un dièse', formula: 'basse-accord', meter: 4, keys: [K('sol', 7, 'maj'), K('mi', 4, 'min')],
    theory: 'les mêmes réflexes avec un dièse à l’armure', notion: 'le ii' },
  { n: 5, title: 'La valse, deux dièses', formula: 'valse', meter: 3, keys: [K('ré', 2, 'maj'), K('si', 11, 'min')],
    theory: 'les mêmes réflexes avec deux dièses à l’armure', notion: 'le vi' },
  { n: 6, title: 'L’arpège, deux bémols', formula: 'arpege', meter: 4, keys: [K('si♭', 10, 'maj'), K('sol', 7, 'min')],
    theory: 'les mêmes réflexes avec deux bémols à l’armure', notion: 'le IV' },
].map(c => ({ ...c, formulaText: FORMULA_TEXT[c.formula] }));
/** Le cycle n (après le sixième, on reprend au premier : mêmes tonalités, niveaux plus hauts). */
export const cycleDef = n => CYCLES[(Math.max(1, n) - 1) % CYCLES.length];

/** Le nom d'une tonalité : « do majeur », « la mineur ». */
export const keyLabel = k => `${k.tonic} ${k.mode === 'maj' ? 'majeur' : 'mineur'}`;
/** La tonalité d'un jour du cycle : jours 1 à 6 la première, 7 à 12 la seconde, ensuite en alternance. */
export function keyOfDay(cyc, idx) {
  if (idx <= 6) return cyc.keys[0];
  if (idx <= 12) return cyc.keys[1];
  return cyc.keys[idx % 2 ? 0 : 1];
}
/** La clé de l'échelle (tool-echelle) et de l'accompagnateur pour une tonalité du cycle. */
export const echelleKey = (cyc, k) => ({ tonic: k.pc, mode: k.mode, meter: cyc.meter, formula: cyc.formula, name: keyLabel(k) });

/* ------------------------------------------------------------------ */
/* État                                                                 */
/* ------------------------------------------------------------------ */
// quinze.cycle : { n, days: [jours du cycle où l'on a travaillé], started }
// quinze.today : { day, ms: { A, B, C }, logged: { A, B, C }, cur, bStep, res: { … } }
// quinze.snaps : { [n]: { first: {…}, last: {…} } } (mesures du cycle) ; quinze.where : réponses à la question de la semaine
// quinze.echelle : l'échelle de coordination (tool-echelle.js)
export function cycleState() {
  return { n: 1, days: [], started: null, ...(store.get('quinze.cycle') || {}) };
}
function blankDay(day) { return { day, ms: { A: 0, B: 0, C: 0 }, logged: { A: 0, B: 0, C: 0 }, cur: null, bStep: 0, res: {} }; }
export function todayState(now = Date.now()) {
  const t = store.get('quinze.today');
  const day = dayKey(now);
  if (!t || t.day !== day) return blankDay(day);
  return { ...blankDay(day), ...t, ms: { A: 0, B: 0, C: 0, ...(t.ms || {}) }, logged: { A: 0, B: 0, C: 0, ...(t.logged || {}) }, res: { ...(t.res || {}) } };
}
export function saveToday(t) { store.set('quinze.today', t); }

/** Le numéro du jour dans le cycle (1 = premier jour), aujourd'hui compris même s'il ne compte pas encore. */
export function dayIndex(now = Date.now(), c = cycleState()) {
  const day = dayKey(now);
  const i = c.days.indexOf(day);
  return i >= 0 ? i + 1 : c.days.length + 1;
}
/** Tout ce qu'il faut pour la journée : cycle, jour, tonalité, état des blocs. */
export function plan(now = Date.now()) {
  const c = cycleState();
  const cyc = cycleDef(c.n);
  const idx = dayIndex(now, c);
  const key = keyOfDay(cyc, idx);
  const t = todayState(now);
  const done = Object.fromEntries(BLOCKS.map(b => [b.id, t.ms[b.id] >= BLOCK_MS]));
  const total = BLOCKS.reduce((a, b) => a + Math.min(BLOCK_MS, t.ms[b.id]), 0);
  return { c, cyc, idx, key, t, done, total, allDone: BLOCKS.every(b => done[b.id]), finished: c.days.length >= CYCLE_DAYS };
}
/** Le bloc à ouvrir : celui en cours s'il n'est pas fini, sinon le premier pas encore fait. */
export function nextBlock(p) {
  if (p.t.cur && !p.done[p.t.cur]) return p.t.cur;
  return (BLOCKS.find(b => !p.done[b.id]) || BLOCKS[0]).id;
}

/**
 * Ajoute du temps de travail à un bloc. Le jour entre dans le cycle à la première minute. Les minutes vont au journal
 * d'activité par tranches d'une demi-minute (blocs A et B : lecture ; bloc C : improvisation).
 * Renvoie { t, crossed } : crossed = le bloc vient d'atteindre ses 5 minutes.
 */
export function addTime(block, ms, now = Date.now()) {
  const t = todayState(now);
  const before = t.ms[block] || 0;
  t.ms[block] = before + ms;
  t.cur = block;
  saveToday(t);
  const tot = BLOCKS.reduce((a, b) => a + (t.ms[b.id] || 0), 0);
  if (tot >= DAY_MIN_MS) {
    const c = cycleState();
    if (!c.days.includes(t.day)) store.set('quinze.cycle', { ...c, days: c.days.concat(t.day), started: c.started || t.day });
  }
  return { t, crossed: before < BLOCK_MS && t.ms[block] >= BLOCK_MS };
}
/** Note au journal d'activité les minutes pas encore notées (force : même moins d'une demi-minute). */
export function flushLog(force = false, now = Date.now()) {
  const t = todayState(now);
  let changed = false;
  for (const b of BLOCKS) {
    const dMin = ((t.ms[b.id] || 0) - (t.logged[b.id] || 0)) / 60000;
    if (dMin >= 0.5 || (force && dMin >= 0.05)) {
      logActivity(b.cat, Math.round(dMin * 10) / 10, now);
      t.logged[b.id] = t.ms[b.id];
      changed = true;
    }
  }
  if (changed) saveToday(t);
}
export function setCurrent(block, extra = {}) {
  const t = todayState();
  saveToday({ ...t, cur: block, ...extra });
}
export function setResult(block, res) {
  const t = todayState();
  saveToday({ ...t, res: { ...t.res, [block]: res } });
}
/** Passe au cycle suivant (le bilan du cycle fini reste dans quinze.snaps). */
export function nextCycle() {
  flushLog(true);
  const c = cycleState();
  store.set('quinze.cycle', { n: c.n + 1, days: [], started: null });
  const t = todayState();
  // les minutes d'aujourd'hui restent au journal ; le jour compte dans le nouveau cycle s'il y a du travail après
  saveToday({ ...t, ms: { A: 0, B: 0, C: 0 }, logged: { A: 0, B: 0, C: 0 }, cur: null, bStep: 0, res: {} });
}

/* ------------------------------------------------------------------ */
/* Les mesures du cycle : premier jour face à aujourd'hui               */
/* ------------------------------------------------------------------ */
const echelleId = ek => `${ek.formula}:${ek.tonic}${ek.mode}${ek.meter}`;
/** Les mesures du moment, lues dans les données des outils (sans les ouvrir). */
export function metrics(cyc = cycleDef(cycleState().n)) {
  const ech = store.get('quinze.echelle') || {};
  const steps = cyc.keys.map(k => { const s = ech[echelleId(echelleKey(cyc, k))]; return s ? (s.p || 0) * 3 + (s.f || 0) : null; }).filter(x => x != null);
  const hands = { level: 5, stage: 0, ...(store.get('rhythm.hands') || {}) };
  const hist = store.get('reflexes.hist') || [];
  const names = cyc.keys.map(keyLabel);
  const lastOf = mode => { const x = hist.filter(e => e.mode === mode && names.includes(e.key)); return x.length ? x[x.length - 1] : null; };
  const acc = lastOf('accords'), ref = lastOf('reflexes');
  return {
    ech: steps.length ? Math.max(...steps) : null,           // palier × 3 + liberté (0 à 20)
    rhythm: hands.level * 10 + (hands.stage || 0),           // niveau × 10 + étape
    npm: acc ? acc.npm : null,                               // accords lus et joués par minute
    refMs: ref && ref.avgMs ? ref.avgMs : null,              // temps moyen d'une réponse juste (réflexes)
    refOk: ref ? ref.ok : null,
    ear: (store.get('reflexes.ear') || {}).n ?? null,       // V9.2 : degrés en jeu dans la note à retrouver d'oreille
  };
}
/** Garde les mesures du premier jour (chaque mesure : sa première valeur dans le cycle) et les dernières. */
export function snapshot(now = Date.now()) {
  const c = cycleState();
  const m = metrics(cycleDef(c.n));
  const all = store.get('quinze.snaps') || {};
  const cur = all[c.n] || {};
  const first = { ...(cur.first || {}) };
  for (const [k, v] of Object.entries(m)) if (first[k] == null && v != null) first[k] = v;
  if (!first.day) first.day = dayKey(now);
  store.set('quinze.snaps', { ...all, [c.n]: { first, last: { ...m, day: dayKey(now) } } });
  return { first, last: m };
}
export const echText = v => (v == null ? '—' : `palier ${Math.floor(v / 3)}${v % 3 ? ` (${['une note', 'notes de l’accord', 'libre'][v % 3].toLowerCase()})` : ''}`);
export const rhythmText = v => (v == null ? '—' : `niveau ${Math.floor(v / 10)}, étape ${(v % 10) + 1}`);

/* ------------------------------------------------------------------ */
/* La question de la semaine (facultative)                              */
/* ------------------------------------------------------------------ */
export function whereDue(now = Date.now()) {
  const w = store.get('quinze.where') || [];
  const last = w.length ? w[w.length - 1].at : 0;
  return now - last > 6.5 * 864e5;
}
export function saveWhere(entry, now = Date.now()) {
  store.push('quinze.where', { at: now, cycle: cycleState().n, ...entry }, 60);
}
