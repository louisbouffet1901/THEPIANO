// Lecture à vue sur de vrais extraits : corpus vérifié (Mutopia, domaine public ou Creative Commons), cinq niveaux,
// analyse guidée de 30 secondes, jeu évalué en rythme, progression adaptative sans répétition avant la fin du niveau.
import { h, fmtPct, fmtNum, clamp, shuffle, capitalize } from './util.js';
import { Score, Player, Follower, TempoReader } from './score.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard } from './diagrams.js';

/* ------------------------------------------------------------------ */
/* Niveaux et données                                                  */
/* ------------------------------------------------------------------ */
export const LEVELS = {
  '1rh': { file: 1, hand: 'rh', title: 'Niveau 1 · main droite', short: 'Une main (droite)', desc: 'Une seule ligne, clé de sol, valeurs simples (jusqu’à la croche), peu d’altérations.' },
  '1lh': { file: 1, hand: 'lh', title: 'Niveau 1 · main gauche', short: 'Une main (gauche)', desc: 'La même chose en clé de fa : la clé la plus souvent négligée.' },
  2: { file: 2, title: 'Niveau 2 · deux mains, une note par main', short: 'Deux mains simples', desc: 'Une mélodie et une basse, une note à la fois dans chaque main.' },
  3: { file: 3, title: 'Niveau 3 · pièces faciles', short: 'Pièces faciles', desc: 'Accords de deux ou trois sons, doubles croches occasionnelles, jusqu’à trois altérations à l’armure.' },
  4: { file: 4, title: 'Niveau 4 · sonatines et pièces moyennes', short: 'Sonatines', desc: 'Basses d’Alberti, deux voix dans une main, triolets, jusqu’à quatre altérations.' },
  5: { file: 5, title: 'Niveau 5 · au-delà', short: 'Au-delà', desc: 'Textures denses, contrepoint, tonalités éloignées : le répertoire de niveau avancé.' },
};
/** Ordre d'affichage (les clés numériques d'un objet passent sinon avant « 1rh » et « 1lh »). */
export const LEVEL_ORDER = ['1rh', '1lh', '2', '3', '4', '5'];
const LOADERS = {
  1: () => import('./data-sight-1.js'),
  2: () => import('./data-sight-2.js'),
  3: () => import('./data-sight-3.js'),
  4: () => import('./data-sight-4.js'),
  5: () => import('./data-sight-5.js'),
};
const cache = new Map();
let sourcesP = null;
export async function loadLevel(lv) {
  const L = LEVELS[lv];
  if (!L) throw new Error('niveau inconnu');
  if (!cache.has(L.file)) cache.set(L.file, LOADERS[L.file]().then(m => m.default));
  const all = await cache.get(L.file);
  return L.hand ? all.filter(x => x.h === L.hand) : all;
}
export function loadSources() {
  if (!sourcesP) sourcesP = import('./data-sight-sources.js').then(m => m.default);
  return sourcesP;
}

/** Anciens réglages des leçons (générateur V2) → niveaux du corpus. */
const LEGACY = { 'n1-md': '1rh', 'n1-mg': '1lh', 'n1-2m': '2', 'n1-acc': '3', 'n2-md': '3', 'n2-alb': '4', 'n2-8': '4' };
const levelId = x => (x == null ? null : LEVELS[x] ? String(x) : LEGACY[x] || null);

/* ------------------------------------------------------------------ */
/* Progression adaptative                                              */
/* ------------------------------------------------------------------ */
const START_T = 0.12;
/** État d'un niveau : difficulté visée (0–1), extraits déjà lus, essais en rythme. */
export function levelState(lv) {
  const s = store.get('sight.levels.' + lv) || {};
  return { t: typeof s.t === 'number' ? s.t : START_T, seen: Array.isArray(s.seen) ? s.seen : [], hist: Array.isArray(s.hist) ? s.hist : [], rounds: s.rounds || 0 };
}
function saveLevel(lv, st) { store.set('sight.levels.' + lv, st); }

/** Filtre d'une leçon : armure minimale, mesure composée. */
function applyFilter(items, f = {}) {
  return items.filter(x => (!f.minFifths || Math.abs(x.f) >= f.minFifths) && (!f.compound || (x.m[1] === 8 && x.m[0] % 3 === 0 && x.m[0] > 3)));
}

/**
 * Extrait suivant : jamais lu dans ce niveau, de difficulté proche de la cible, pas de la même pièce que le précédent.
 * Quand tout le niveau a été lu, la liste repart (rounds + 1).
 */
export function pickNext(items, st, { avoid = null, rnd = Math.random } = {}) {
  if (!items.length) return { item: null, st };
  const seen = new Set(st.seen);
  let pool = items.filter(x => !seen.has(x.i));
  let reset = false;
  if (!pool.length) {
    const ids = new Set(items.map(x => x.i));
    pool = items.slice();
    st = { ...st, seen: st.seen.filter(id => !ids.has(id)), rounds: (st.rounds || 0) + 1 };
    reset = true;
  }
  const near = pool.slice().sort((a, b) => Math.abs(a.p - st.t) - Math.abs(b.p - st.t));
  let cands = near.slice(0, 8);
  const other = avoid ? cands.filter(x => !avoid(x)) : cands;
  if (other.length) cands = other;
  return { item: cands[Math.floor(rnd() * cands.length)], st, reset };
}

/** Note d'un essai en rythme (0–1) : notes trouvées, notes à temps, notes en trop. */
export function attemptScore(res) {
  const extra = res.total ? Math.min(1, (res.extra || 0) / res.total) : 0;
  return clamp(0.55 * res.accuracy + 0.45 * res.precision - 0.25 * extra, 0, 1);
}

/** Mise à jour de la cible après un essai en rythme ; renvoie le verdict à afficher. */
export function adapt(st, score) {
  let dt = 0, verdict;
  if (score >= 0.9) { dt = 0.08; verdict = 'up2'; }
  else if (score >= 0.8) { dt = 0.04; verdict = 'up'; }
  else if (score >= 0.65) { dt = 0; verdict = 'same'; }
  else { dt = -0.06; verdict = 'down'; }
  const t = clamp(st.t + dt, 0, 1);
  return { st: { ...st, t }, verdict };
}

/** Conseil de changement de niveau d'après les cinq derniers essais. */
export function levelAdvice(st) {
  const last = st.hist.slice(-5);
  if (last.length < 5) return null;
  const avg = last.reduce((a, x) => a + x.s, 0) / last.length;
  if (st.t >= 0.85 && avg >= 0.85) return 'up';
  if (st.t <= 0.04 && avg < 0.6) return 'down';
  return null;
}

/* ------------------------------------------------------------------ */
/* Analyse guidée                                                      */
/* ------------------------------------------------------------------ */
const VALUES = ['ronde', 'blanche pointée', 'blanche', 'noire pointée', 'noire', 'croche pointée', 'croche', 'croche de triolet', 'double croche', 'double croche de triolet', 'triple croche'];
const BEATS = { 2: '2 temps', 3: '3 temps', 4: '4 temps', 6: '6 temps' };

/** Questions de l'analyse guidée pour un extrait (au plus trois), selon les cours déjà faits. */
export function buildQuestions(item, { done = id => store.isDone(id), rnd = Math.random } = {}) {
  const q = item.q || {};
  const out = [];
  if (q.key) {
    const opts = shuffle([q.key.major, q.key.minor]);
    out.push({ kind: 'key', text: 'Quelle est la tonalité ?', options: opts, answer: q.key.answer === 'minor' ? q.key.minor : q.key.major, why: q.key.why });
  }
  const chord = q.lastChord && done('n1-th-fonctions') ? q.lastChord : null;
  if (chord) {
    const names = { I: 'I (tonique)', IV: 'IV (sous-dominante)', V: 'V (dominante)' };
    const why = { I: 'L’extrait finit sur la tonique (I) : la phrase conclut.', V: 'L’extrait finit sur la dominante (V' + (chord.seventh ? '7' : '') + ') : la phrase reste en suspens (demi-cadence) et appelle la suite.', IV: 'L’extrait finit sur la sous-dominante (IV) : un arrêt sans conclusion.' };
    out.push({ kind: 'chord', text: 'Sur quel accord l’extrait se termine-t-il ?', options: Object.values(names), answer: names[chord.answer], why: why[chord.answer] });
  }
  const extra = [];
  if (q.motif) {
    const m = q.motif;
    const c = Math.min(3, m.count);
    const options = ['Non', 'Oui, 1 fois', 'Oui, 2 fois', 'Oui, 3 fois ou plus'];
    let why;
    if (m.count) {
      const parts = [];
      if (m.same.length) parts.push(`tel quel mesure${m.same.length > 1 ? 's' : ''} ${m.same.join(', ')}`);
      if (m.trans.length) parts.push(`transposé (marche) mesure${m.trans.length > 1 ? 's' : ''} ${m.trans.join(', ')}`);
      why = 'Il revient ' + parts.join(' et ') + '. Une mesure reconnue se lit d’un coup d’œil.';
    } else {
      why = m.rhythm.length ? `Seul son rythme revient (mesure${m.rhythm.length > 1 ? 's' : ''} ${m.rhythm.join(', ')}).` : 'Chaque mesure est différente : lis-les une à une, sans te précipiter.';
    }
    extra.push({ kind: 'motif', text: 'Le dessin de la mesure 1 (même rythme, mêmes intervalles) revient-il plus loin ?', options, answer: options[c], why });
  }
  if (q.meter && !(item.m[0] === 3 && item.m[1] === 8)) {
    const b = q.meter.beats;
    const opts = [2, 3, 4, 6].filter(x => x !== b).slice(0, 3).concat(b).sort((x, y) => x - y).map(x => BEATS[x]);
    const why = q.meter.compound
      ? `${item.m[0]}/${item.m[1]} : ${b} temps à la noire pointée, chacun divisé en trois croches.`
      : `${item.m[0]}/${item.m[1]} : ${b} temps à la ${q.meter.unit}.`;
    extra.push({ kind: 'meter', text: 'Combien de temps dans chaque mesure ?', options: opts, answer: BEATS[b], why });
  }
  if (q.shortest) {
    const i = VALUES.indexOf(q.shortest);
    const near = VALUES.filter((v, k) => v !== q.shortest && Math.abs(k - i) <= 3 && !/pointée|triolet/.test(v));
    const opts = shuffle(near).slice(0, 3).concat(q.shortest).sort((a, b) => VALUES.indexOf(a) - VALUES.indexOf(b));
    extra.push({ kind: 'shortest', text: 'Quelle est la valeur la plus courte ?', options: opts, answer: q.shortest, why: `La plus courte : la ${q.shortest}. Le tempo se choisit pour qu’elles restent faciles.` });
  }
  const rest = shuffle(extra, rnd);
  while (out.length < 3 && rest.length) out.push(rest.shift());
  return out.slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Interface                                                           */
/* ------------------------------------------------------------------ */
const VERDICT = {
  up2: 'Très bien : le prochain extrait sera plus difficile.',
  up: 'Bien : le prochain sera un peu plus difficile.',
  same: 'Correct : on reste à cette difficulté.',
  down: 'Trop difficile pour l’instant : le prochain sera plus simple. Baisse aussi le tempo si besoin.',
};

export function mountSight(el, cfg = {}) {
  const allowed = (cfg.levels || cfg.presets || LEVEL_ORDER).map(levelId).filter(Boolean);
  const choices = LEVEL_ORDER.filter(id => allowed.includes(id));
  if (!choices.length) choices.push(...LEVEL_ORDER);
  const stored = levelId(store.get('sight.level'));
  let lv = levelId(cfg.level) || levelId(cfg.preset) || (stored && choices.includes(stored) ? stored : choices[0]);
  if (!choices.includes(lv)) lv = choices[0];
  const filter = { minFifths: cfg.minFifths || 0, compound: !!cfg.compound };

  const frame = h('div', { class: 'w-frame sight' });
  const sel = h('select', { class: 'sight-level', 'aria-label': 'Niveau de lecture' }, ...choices.map(id => h('option', { value: id, selected: id === lv }, LEVELS[id].title)));
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Lecture à vue'));
  if (choices.length > 1) head.append(sel);
  const info = h('div', { class: 'sight-info small' });
  const scoreHost = h('div', { class: 'sight-score' });
  const caption = h('div', { class: 'sight-src small muted' });
  const prep = h('div', { class: 'sight-prep', hidden: true });
  const body = h('div', { class: 'w-body' }, info, scoreHost, caption, prep);
  const status = h('div', { class: 'score-status', role: 'status' });
  const results = h('div', { class: 'result-strip' });
  const advice = h('div', { class: 'sight-advice' });
  const foot = h('div', { class: 'w-foot' });
  const hist = h('div', { class: 'small sight-hist' });
  frame.append(head, body, foot, hist);
  el.append(frame);

  let items = [], sources = [], item = null, score = null, player = null, follower = null, reader = null, vk = null;
  let prepTimer = null, mask = false, attempted = false, alive = true, loadGen = 0;
  let st = levelState(lv);
  let bpm = 60;

  const btn = (label, cls = '', title) => h('button', { class: 'btn ' + cls, type: 'button', title }, label);
  const prepBtn = btn('Préparer 30 s puis jouer', 'primary', 'Analyse guidée de l’extrait, puis départ en rythme');
  const playBtn = btn('Jouer en rythme', '', 'Un décompte, puis on ne s’arrête plus');
  const waitBtn = btn('Mode attente', '', 'Le curseur attend la bonne note : pour une nouvelle clé ou tonalité, ce n’est pas encore de la lecture à vue');
  const nextBtn = btn('Extrait suivant', '');
  const listenBtn = btn('Écouter', 'ghost', 'Écoute après avoir joué : compare avec ce que tu as lu');
  const kbBtn = btn('Clavier', 'ghost');
  const out = h('output', {}, '');
  const rng = h('input', { type: 'range', min: 30, max: 160, value: 60, 'aria-label': 'Tempo' });
  const maskBox = h('input', { type: 'checkbox' });
  const ctrl = h('div', { class: 'score-ctrl' }, prepBtn, playBtn, waitBtn, nextBtn, listenBtn, kbBtn,
    h('label', { class: 'range' }, 'Tempo', rng, out),
    h('label', { class: 'check', title: 'La mesure que tu joues s’efface : oblige à lire en avance' }, maskBox, 'Regard en avant'));
  foot.append(ctrl, h('div', { style: { width: '100%' } }, status, results, advice));
  listenBtn.hidden = true;

  const unit = () => (score && score.beatQ === 1.5 ? '♩. = ' : score && score.beatQ === 2 ? 'blanche = ' : '♩ = ');
  const showTempo = () => { out.textContent = unit() + bpm; };
  rng.addEventListener('input', () => {
    bpm = +rng.value; showTempo();
    if (item) store.set('sight.speed.' + lv, Math.round((bpm / item.b) * 100) / 100);
  });
  maskBox.addEventListener('change', () => { mask = maskBox.checked; });

  const stopAll = () => {
    clearInterval(prepTimer); prepTimer = null;
    player?.stop(); follower?.stop(); reader?.stop();
    follower = reader = null;
    [waitBtn, playBtn, prepBtn].forEach(b => b.classList.remove('on'));
    if (score) { score.clear('masked'); score.svgHost.classList.remove('mask-current'); }
  };
  const needInput = () => {
    if (midi.status !== 'ready' && !vk) { status.textContent = 'Branche le piano (pastille en haut) ou affiche le clavier à l’écran.'; return false; }
    return true;
  };

  function renderInfo() {
    const pool = applyFilter(items, filter);
    const seen = new Set(st.seen);
    const read = pool.filter(x => seen.has(x.i)).length;
    const bar = h('span', { class: 'progress sight-target', title: 'Difficulté visée dans ce niveau' }, h('i', { style: { width: Math.round(st.t * 100) + '%' } }));
    info.replaceChildren(
      h('span', {}, `${LEVELS[lv].short} · ${read} extrait${read > 1 ? 's' : ''} lu${read > 1 ? 's' : ''} sur ${pool.length}${st.rounds ? ` (${st.rounds + 1}e tour)` : ''}`),
      h('span', { class: 'sight-target-wrap' }, 'difficulté visée ', bar));
  }

  function renderHistory() {
    const last = st.hist.slice(-6);
    hist.textContent = last.length ? 'Derniers essais en rythme : ' + last.map(x => `${fmtPct(x.a)} justes`).join(' · ') : '';
  }

  function srcText(x) {
    const s = sources[x.s] || {};
    const bits = [];
    const title = s.t ? `${s.t}${s.o && !s.t.includes(s.o) ? ` (${s.o})` : ''}` : '';
    bits.push(`${s.c || ''}${title ? ' · ' + title : ''}`);
    bits.push(x.n[1] == null ? `à partir de la mes. ${x.n[0]}` : `mes. ${x.n[0]}–${x.n[1]}`);
    const notes = [];
    if (s.pt === 'primo') notes.push('partie primo d’un quatre-mains');
    if (x.r) notes.push('accords allégés');
    if (x.o) notes.push('transposé à l’octave inférieure');
    if (notes.length) bits.push(notes.join(', '));
    return bits.join(' · ');
  }

  async function load() {
    const my = ++loadGen;
    stopAll();
    status.textContent = 'Chargement des extraits…';
    try {
      const [its, srcs] = await Promise.all([loadLevel(lv), loadSources()]);
      if (!alive || my !== loadGen) return;
      items = its; sources = srcs;
      st = levelState(lv);
      status.textContent = '';
      next();
    } catch (e) {
      console.error(e);
      status.textContent = 'Extraits indisponibles : ' + (e.message || e);
    }
  }

  function next() {
    stopAll();
    const pool = applyFilter(items, filter);
    // pas deux fois de suite le même compositeur (ni la même pièce)
    const prev = item ? (sources[item.s] || {}).c : null;
    const r = pickNext(pool, st, { avoid: item ? (x => x.s === item.s || (sources[x.s] || {}).c === prev) : null });
    if (!r.item) { status.textContent = 'Aucun extrait pour ce réglage.'; return; }
    st = r.st;
    item = r.item;
    attempted = false;
    listenBtn.hidden = true;
    results.replaceChildren(); advice.replaceChildren(); prep.hidden = true; prep.replaceChildren();
    // ligne étirée sur toute la largeur : un extrait court reste lisible sur la tablette
    score = new Score(scoreHost, item.a.replace('%%barnumbers 1', '%%stretchlast true\n%%barnumbers 1'), { staffwidth: 740 });
    player = new Player(score, {});
    const speed = Number(store.get('sight.speed.' + lv)) || 1;
    bpm = Math.round(clamp(item.b * speed, 30, 160));
    rng.value = bpm; showTempo();
    caption.textContent = srcText(item);
    status.textContent = r.reset ? 'Tu as lu tous les extraits de ce niveau : ils reviennent, dans un autre ordre.' : 'Commence par « Préparer » : 30 secondes pour lire avant de jouer.';
    renderInfo();
    renderHistory();
  }

  function markSeen() {
    if (!item || st.seen.includes(item.i)) return;
    st = { ...st, seen: st.seen.concat(item.i) };
    saveLevel(lv, st);
    renderInfo();
  }

  /** Mesure difficile : surlignée pendant la préparation. */
  function hintBar(bar) {
    if (!score || !bar) return;
    const b0 = (bar - 1) * score.barQ, b1 = bar * score.barQ;
    for (const e of score.events) if (e.t >= b0 - 1e-6 && e.t < b1 - 1e-6 && e.char != null) score.mark(e.char, 'n-hint');
  }

  function startPrep() {
    if (prepTimer) { stopAll(); prep.hidden = true; status.textContent = ''; score.clear('n-hint'); return; }
    if (!needInput()) return;
    stopAll(); score.clear(); results.replaceChildren(); advice.replaceChildren();
    prepBtn.classList.add('on');
    const qs = buildQuestions(item);
    let left = cfg.prepSeconds || 30;
    let answered = 0;
    const clock = h('div', { class: 'sight-clock' });
    const goBtn = btn('Je suis prêt : jouer', 'primary sm');
    const list = h('div', { class: 'sight-qs' });
    prep.replaceChildren(h('div', { class: 'sight-prep-head' }, clock, goBtn), list);
    prep.hidden = false;
    for (const q of qs) {
      const fb = h('div', { class: 'quiz-feedback' });
      const opts = h('div', { class: 'quiz-answers' });
      for (const o of q.options) {
        const b = btn(o, 'sm');
        b.addEventListener('click', () => {
          if (opts.dataset.done) return;
          opts.dataset.done = '1';
          const ok = o === q.answer;
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) [...opts.children].find(x => x.textContent === q.answer)?.classList.add('right');
          fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
          fb.textContent = (ok ? 'Juste. ' : `Réponse : ${q.answer}. `) + q.why;
          store.push('stats.sightQuiz', { kind: q.kind, ok, at: Date.now() }, 300);
          answered++;
        });
        opts.append(b);
      }
      list.append(h('div', { class: 'sight-q' }, h('div', { class: 'quiz-q' }, q.text), opts, fb));
    }
    const hard = item.q && item.q.hard;
    if (hard) {
      list.append(h('div', { class: 'callout warn sight-hard' }, h('b', {}, `Mesure ${hard.bar} : `), capitalize(hard.reasons.join(', ')) + '. C’est là qu’il faudra être le plus attentif.'));
      hintBar(hard.bar);
    }
    list.append(h('p', { class: 'small muted mb-0' }, 'Pendant ce temps, repère aussi la première note de chaque main et entends le début dans ta tête.'));
    const tick = () => {
      clock.textContent = `Lecture silencieuse : ${left} s`;
      if (left <= 0) { go(); return; }
      left--;
    };
    const go = () => {
      clearInterval(prepTimer); prepTimer = null;
      prepBtn.classList.remove('on');
      score.clear('n-hint');
      if (answered < qs.length) for (const q of list.querySelectorAll('.quiz-answers:not([data-done])')) q.dataset.done = '1';
      runTempo();
    };
    goBtn.addEventListener('click', go);
    tick();
    prepTimer = setInterval(tick, 1000);
    status.textContent = 'Réponds en lisant la partition, sans jouer. Le départ se fait seul au bout de 30 s.';
  }

  async function runTempo() {
    if (!needInput()) return;
    stopAll(); score.clear(); results.replaceChildren(); advice.replaceChildren();
    playBtn.classList.add('on');
    const intro = 'Décompte, puis joue sans t’arrêter, même si tu te trompes.';
    status.textContent = intro;
    let curBar = -1;
    reader = new TempoReader(score, {
      qpm: bpm * score.beatQ,
      onCount: pos => { status.textContent = pos ? `Décompte : ${pos.waiting ? '…' : pos.inBar}${pos.bars > 1 ? ` (mesure ${pos.bar} sur ${pos.bars})` : ''}` : 'Joue sans t’arrêter, même si tu te trompes.'; },
      onTime: q => {
        if (!mask) return;
        const bar = Math.floor((q + 0.25 * score.beatQ) / score.barQ);
        if (bar !== curBar) {
          score.clear('masked');
          curBar = bar;
          for (const e of score.events) if (Math.floor(e.t / score.barQ) === bar && e.char != null) score.mark(e.char, 'masked');
          score.svgHost.classList.add('mask-current');
        }
      },
      onDone: res => {
        score.clear('masked'); score.svgHost.classList.remove('mask-current');
        playBtn.classList.remove('on'); reader = null;
        finishTempo(res);
      },
    });
    await reader.start();
  }

  function worstBar(res) {
    const misses = new Map();
    for (const it of res.items || []) if (it.status !== 'ok') { const b = Math.floor(it.t / score.barQ) + 1; misses.set(b, (misses.get(b) || 0) + 1); }
    let best = null;
    for (const [b, n] of misses) if (!best || n > best[1]) best = [b, n];
    return best && best[1] >= 2 ? best[0] : null;
  }

  function finishTempo(res) {
    attempted = true;
    listenBtn.hidden = false;
    const s = attemptScore(res);
    results.replaceChildren(
      h('span', {}, 'Notes justes ', h('b', {}, fmtPct(res.accuracy))),
      h('span', {}, 'Dans le temps ', h('b', {}, fmtPct(res.precision))),
      h('span', {}, 'Notes en trop ', h('b', {}, String(res.extra || 0))),
      h('span', {}, 'Écart moyen ', h('b', {}, fmtNum(res.meanAbsMs) + ' ms')));
    const first = !st.hist.some(x => x.i === item.i);
    let verdict = null;
    if (first) {
      const r = adapt(st, s);
      verdict = r.verdict;
      st = { ...r.st, hist: st.hist.concat({ i: item.i, a: Math.round(res.accuracy * 100) / 100, p: Math.round(res.precision * 100) / 100, s: Math.round(s * 100) / 100, b: bpm, at: Date.now() }).slice(-60) };
    }
    markSeen();
    saveLevel(lv, st);
    store.push('stats.sight', { id: 'corpus:' + lv, ex: item.i, mode: 'tempo', bpm, at: Date.now(), accuracy: res.accuracy, precision: res.precision, extra: res.extra, meanAbsMs: res.meanAbsMs });
    const wb = worstBar(res);
    const lines = [];
    lines.push(verdict ? VERDICT[verdict] : 'Deuxième lecture : elle ne compte pas pour la progression (ce n’est plus de la lecture à vue).');
    if (wb) lines.push(`C’est la mesure ${wb} qui a le plus coincé.`);
    lines.push('Vert : juste et à temps · orange : juste mais décalé · rouge : manquée.');
    status.textContent = lines.join(' ');
    const adv = levelAdvice(st);
    const ids = LEVEL_ORDER;
    const i = ids.indexOf(lv);
    const target = adv === 'up' ? ids[i + 1] : adv === 'down' ? ids[i - 1] : null;
    if (target && choices.includes(target) && !(lv === '1rh' && target === '1lh')) {
      const go = btn(adv === 'up' ? `Passer au ${LEVELS[target].title.toLowerCase()}` : `Revenir au ${LEVELS[target].title.toLowerCase()}`, 'sm');
      go.addEventListener('click', () => switchLevel(target));
      advice.replaceChildren(h('div', { class: 'callout tip' }, h('p', {}, adv === 'up' ? 'Tu lis ce niveau sans difficulté depuis plusieurs extraits.' : 'Ce niveau est encore trop difficile : le niveau précédent te fera progresser plus vite.'), go));
    } else if (lv === '1rh' && adv === 'up') {
      advice.replaceChildren(h('div', { class: 'callout tip' }, h('p', {}, 'Main droite acquise à ce niveau : travaille aussi la main gauche (clé de fa), puis passe au niveau 2.')));
    }
    renderHistory();
  }

  function runWait() {
    if (follower) { stopAll(); status.textContent = ''; return; }
    if (!needInput()) return;
    stopAll(); score.clear(); results.replaceChildren(); advice.replaceChildren();
    waitBtn.classList.add('on');
    follower = new Follower(score, {
      hands: 'both',
      onStep: (i, n) => { status.textContent = `Note ${i + 1} / ${n}`; },
      onDone: res => {
        waitBtn.classList.remove('on'); follower = null;
        attempted = true; listenBtn.hidden = false;
        markSeen();
        status.textContent = 'Terminé. Le mode attente aide à déchiffrer, mais seule la lecture en rythme fait progresser le niveau.';
        results.replaceChildren(h('span', {}, h('b', {}, String(res.clean)), ` / ${res.steps} sans faute`), h('span', {}, h('b', {}, String(res.errors)), ` erreur${res.errors > 1 ? 's' : ''}`), h('span', {}, h('b', {}, fmtNum(res.seconds)), ' s'));
        store.push('stats.sight', { id: 'corpus:' + lv, ex: item.i, mode: 'wait', at: Date.now(), ...res });
      },
    });
    follower.start();
  }

  function switchLevel(id) {
    lv = id;
    sel.value = id;
    store.set('sight.level', id);
    item = null;
    load();
  }

  prepBtn.addEventListener('click', startPrep);
  playBtn.addEventListener('click', () => { if (reader) { stopAll(); status.textContent = ''; return; } runTempo(); });
  waitBtn.addEventListener('click', runWait);
  nextBtn.addEventListener('click', () => { if (!attempted && item) markSeen(); next(); });
  listenBtn.addEventListener('click', async () => {
    if (player.playing) { player.stop(); return; }
    stopAll();
    player.set({ qpm: bpm * score.beatQ, hands: 'both' });
    await player.play();
  });
  kbBtn.addEventListener('click', () => {
    if (vk) { vk.remove(); vk = null; kbBtn.classList.remove('on'); return; }
    const hand = LEVELS[lv].hand;
    vk = h('div', { class: 'vkbd' });
    vk.append(keyboard({ from: hand === 'rh' ? 55 : 36, to: hand === 'lh' ? 67 : 84, interactive: true, names: 'c', height: 110, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) }));
    body.append(vk);
    kbBtn.classList.add('on');
  });
  sel.addEventListener('change', () => switchLevel(sel.value));

  load();
  return () => { alive = false; stopAll(); };
}
