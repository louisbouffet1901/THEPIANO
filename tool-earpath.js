// Onglet « Oreille » (V4.3) : deux parcours pas à pas au lieu d'une liste de séries.
// « Chanter juste » (de la voix stable aux intervalles et aux motifs de la pièce) et « Reconnaître à l'oreille »
// (de la hauteur aux accords de septième). Chaque étape : pourquoi, une à trois séries, le cours qui l'explique ;
// elle est réussie quand ses séries le sont (80 % ou plus, deux jours différents). L'étape en cours est ouverte.
import { h, esc, fmtPct } from './util.js';
import { store } from './store.js';
import { EAR_PRESETS, mountQuiz } from './tool-ear.js';
import { lessonById } from './content-index.js';

/* ------------------------------------------------------------------ */
/* Les séries                                                          */
/* ------------------------------------------------------------------ */
// séries des leçons (mêmes identifiants : les progrès sont communs) et nouvelles séries de chant
const EXTRA = {
  'deg-123r': { kind: 'degree', degrees: [1, 2, 3], key: 'random', title: 'Degrés 1, 2, 3 (toutes tonalités)', count: 12 },
  'deg-15r': { kind: 'degree', degrees: [1, 2, 3, 4, 5], key: 'random', title: 'Degrés 1 à 5 (toutes tonalités)', count: 12 },
  'sing-tonic': { kind: 'sing', task: 'degree', degrees: [1], key: 'random', title: 'Chanter la tonique après la cadence', count: 8 },
  'sing-123': { kind: 'sing', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [1, 3, 1], [1, 2, 1]], title: 'Chanter 1-2-3 et 3-2-1', count: 8 },
  'sing-135': { kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5]], title: 'Chanter 1-3-5 et 5-4-3-2-1', count: 8 },
  'sc-mm': { kind: 'scales', set: ['maj', 'harmMin'], title: 'Gamme majeure ou mineure ?', count: 10 },
  'echo-min4': { kind: 'echo', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 4, maxStep: 2, title: 'Rejouer 4 notes en mineur', count: 8 },
  'sing-iv2': { kind: 'sing', task: 'interval', set: ['2M', '3M', '4J', '5J', '8ve'], title: 'Chanter un intervalle au-dessus d’une note', count: 8 },
  'sing-hold': { kind: 'sing', task: 'hold', span: 3, holdMs: 3000, tol: 40, title: 'Tenir une note 3 secondes', count: 5 },
  'sing-glide': { kind: 'sing', task: 'glide', title: 'Glisser d’une note à l’autre', count: 6 },
  'sing-match-p': { kind: 'sing', task: 'match', span: 5, tol: 25, title: 'Une note à 25 cents près', count: 8 },
  'sing-hold-p': { kind: 'sing', task: 'hold', span: 5, holdMs: 4000, tol: 25, title: 'Tenir 4 secondes à 25 cents près', count: 5 },
};
const series = id => {
  const c = EXTRA[id] || EAR_PRESETS.find(p => p.id === id);
  if (!c) throw new Error('Série inconnue : ' + id);
  const { group, ...rest } = c;
  return { ...rest, id };
};

/* ------------------------------------------------------------------ */
/* Les deux parcours                                                   */
/* ------------------------------------------------------------------ */
const st = (id, title, why, ids, lesson = null) => ({ id, title, why, series: ids, lesson });
export const TRACKS = {
  chant: {
    label: 'Chanter juste', short: 'Chanter juste',
    intro: 'Chanter juste s’apprend comme un geste : d’abord une voix stable, puis une note entendue, puis des notes qui s’enchaînent. Chaque étape se valide à 80 %, deux jours différents.',
    method: ['Écoute, puis <b>entends la note dans ta tête</b> une seconde avant de chanter.', 'Chante <b>doucement</b>, sur « mmm » ou « la », sans forcer : une voix légère se règle mieux.', 'Regarde l’<b>aiguille</b> : à gauche, monte ; à droite, descends ; au milieu, tiens.', 'Respire avant la note et garde un <b>souffle régulier</b> pendant qu’elle dure.', 'Une note trop haute ou trop basse pour toi ? Chante-la <b>une octave plus bas ou plus haut</b> : elle compte aussi.'],
    steps: [
      st('voix', 'Trouver ta voix', 'La sirène mesure ta tessiture : tous les exercices de chant choisiront ensuite des notes faites pour ta voix.', ['voice-finder'], 'n1-or2'),
      st('tenir', 'Tenir une note', 'D’abord une voix stable : une note tenue trois secondes, l’aiguille au milieu. C’est la base de tout le reste.', ['sing-hold']),
      st('reproduire', 'Reproduire une note', 'Entendre, garder la note en tête une seconde, la chanter : au milieu de ta voix d’abord, puis partout.', ['sing-match-a', 'sing-match'], 'n1-or2'),
      st('glisser', 'Glisser jusqu’à la note', 'Corriger en direct : partir d’une note et glisser vers l’autre en suivant la ligne. Tu apprends à sentir « plus haut » et « plus bas » dans ta voix.', ['sing-glide']),
      st('tonique', 'La tonique', 'Après une cadence, chanter la note de repos : ton oreille commence à penser en tonalité.', ['sing-tonic'], 'n1-or4'),
      st('voisines', 'Notes voisines : 1-2-3', 'Des pas d’un ton : les intervalles les plus faciles à chanter juste.', ['sing-123'], 'n1-or5'),
      st('accord', 'L’accord : 1-3-5', 'Les notes de l’accord, en montant et en descendant : des sauts, mais vers des notes stables.', ['sing-135', 'sing-arp'], 'n1-or6'),
      st('degres', 'Chanter un degré', 'Après la cadence, n’importe quel degré : tu trouves la note dans la tonalité, et plus seulement en imitant.', ['sing-deg'], 'n1-or7'),
      st('mineur', 'En mineur', 'Les mêmes repères en mineur : la tierce plus basse, la sensible qui monte.', ['sing-min'], 'n2-or1'),
      st('intervalles', 'Les intervalles', 'Une note donnée, l’intervalle au-dessus : tierce, quinte et octave, puis seconde et quarte.', ['sing-iv', 'sing-iv2'], 'n2-or2'),
      st('melodie', 'Rechanter une mélodie', 'Écouter une courte mélodie et la rechanter : la mémoire et la justesse ensemble.', ['sing-echo']),
      st('piece', 'Les motifs de ta pièce', 'Chanter les motifs de l’op. 55 : tu les entendras ensuite en les jouant.', ['sing-op55']),
      st('precision', 'Plus précis', 'À 25 cents près, un quart de demi-ton : la justesse d’un chanteur exercé.', ['sing-match-p', 'sing-hold-p']),
    ],
  },
  ecoute: {
    label: 'Reconnaître à l’oreille', short: 'Reconnaître',
    intro: 'Du plus simple au plus fin : la hauteur, la tonique, les degrés, puis les intervalles et les accords. Chaque étape se valide à 80 %, deux jours différents.',
    steps: [
      st('hauteur', 'Grave ou aigu', 'Distinguer deux hauteurs, même très proches.', ['hl'], 'n1-or1'),
      st('dessin', 'Le dessin d’une mélodie', 'Monte, descend, reste : le contour avant les notes.', ['contour', 'contour4'], 'n1-or1'),
      st('tonique', 'La tonique', 'Sentir la note de repos après une cadence.', ['deg-1'], 'n1-or4'),
      st('deg123', 'Degrés 1, 2, 3', 'Les trois premières notes de la gamme, chacune avec sa couleur.', ['deg-123', 'deg-123r'], 'n1-or5'),
      st('deg15', 'Degrés 1 à 5', 'La sous-dominante et la dominante s’ajoutent.', ['deg-15', 'deg-15r'], 'n1-or6'),
      st('gamme', 'Toute la gamme', 'Les sept degrés, et la sensible qui appelle la tonique.', ['deg-18', 'deg-18r'], 'n1-or7'),
      st('rejouer', 'Rejouer une mélodie', 'Écouter, retenir, rejouer au piano : trois, puis quatre, puis cinq notes.', ['echo-3', 'echo-5', 'echo-8']),
      st('piece', 'Les motifs de ta pièce', 'Rejouer à l’oreille les motifs de l’op. 55.', ['echo-op55']),
      st('majmin', 'Majeur ou mineur, fin ou suspension', 'Les deux couleurs, et les deux ponctuations de la musique.', ['ch-mm', 'cad-2', 'sc-mm'], 'n1-or8'),
      st('mineur', 'Les degrés en mineur', 'La gamme mineure harmonique, degré par degré.', ['deg-min15', 'deg-min', 'echo-min4'], 'n2-or1'),
      st('iv1', 'Intervalles : de la seconde à la quinte', 'Mesurer la distance entre deux notes, en montant puis en descendant.', ['iv-b', 'iv-n1', 'iv-n1-down'], 'n2-or2'),
      st('iv2', 'Intervalles : sixtes, septièmes, triton', 'Les grands intervalles, et les notes jouées ensemble.', ['iv-c', 'iv-harm'], 'n2-or3'),
      st('accords', 'Les accords et la basse', 'Quatre couleurs d’accords, et ce qui suit l’accord de tonique.', ['ch-n1', 'func', 'echo-bass'], 'n2-or4'),
      st('cadences', 'Cadences et fonctions', 'Les quatre cadences, en majeur puis en mineur.', ['cad-maj', 'cad', 'func2'], 'n2-or6'),
      st('septiemes', 'Les accords de septième', 'Cinq couleurs de septième.', ['ch7-a', 'ch7-b', 'ch-n2'], 'n2-or8'),
      st('bilan', 'Tout mélanger', 'Tous les intervalles, des mélodies dans toutes les tonalités, les motifs de Chopin.', ['iv-all', 'echo-8r', 'echo-min', 'echo-chopin'], 'n2-or7'),
    ],
  },
};

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */
const dayOf = t => new Date(t).toDateString();
/** Réussie : 80 % ou plus deux jours différents, et la dernière fois aussi. */
export function seriesStatus(id) {
  if (id === 'voice-finder') { const ok = Array.isArray(store.get('settings.voiceRange')); return { done: ok, mastered: ok, label: ok ? 'Tessiture mesurée ✓' : 'À faire une fois' }; }
  const hist = (store.get('stats.ear') || []).filter(x => x.id === id);
  const last = hist[hist.length - 1] || null;
  const goodDays = new Set(hist.filter(x => x.pct >= 0.8).map(x => dayOf(x.at))).size;
  const mastered = !!last && last.pct >= 0.8 && goodDays >= 2;
  const label = !last ? 'Pas encore faite' : mastered ? `Réussie ✓ · ${fmtPct(last.pct)}` : `Dernier score ${fmtPct(last.pct)}${last.pct >= 0.8 ? ' · encore un jour à 80 %' : ' · objectif 80 %'}`;
  return { done: !!last, mastered, label, last };
}
const stepDone = s => s.series.every(id => seriesStatus(id).mastered);
const currentStep = T => T.steps.find(s => !stepDone(s)) || null;
export function trackProgress(tid) {
  const T = TRACKS[tid];
  const done = T.steps.filter(stepDone).length;
  const cur = currentStep(T);
  return { done, total: T.steps.length, cur, index: cur ? T.steps.indexOf(cur) + 1 : T.steps.length };
}

/** Tendance des derniers essais de chant manqués (trop bas, trop haut, voix qui bouge, rien entendu). */
function singTendency() {
  const list = (store.get('stats.sing') || []).slice(-20);
  if (list.length < 4) return null;
  const n = list.length;
  const flat = list.filter(x => x.dir < 0 && x.kind !== 'silence').length, sharp = list.filter(x => x.dir > 0 && x.kind !== 'silence').length;
  const unstable = list.filter(x => x.kind === 'unstable').length, silence = list.filter(x => x.kind === 'silence').length;
  if (silence / n >= 0.4) return `Souvent, le micro ne t’entend pas (${silence} fois sur ${n}) : rapproche la tablette, chante un peu plus fort, dans une pièce calme.`;
  if (flat >= 2 * sharp && flat / n >= 0.4) return `Tes notes manquées sont surtout <b>trop basses</b> (${flat} sur ${n}) : pense la note « au-dessus », garde le souffle jusqu’au bout, et souris légèrement en chantant.`;
  if (sharp >= 2 * flat && sharp / n >= 0.4) return `Tes notes manquées sont surtout <b>trop hautes</b> (${sharp} sur ${n}) : relâche la gorge et chante plus doucement ; ne vise pas en poussant.`;
  if (unstable / n >= 0.3) return `Ta voix <b>bouge</b> autour de la note (${unstable} sur ${n}) : reviens à l’étape « Tenir une note », souffle régulier, son léger.`;
  return null;
}

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
export function mountEarPath(el) {
  let tid = TRACKS[store.get('ui.earTrack')] ? store.get('ui.earTrack') : 'chant';
  const tabs = h('div', { class: 'seg ear-tabs', role: 'tablist' });
  const head = h('div');
  const list = h('ol', { class: 'ear-steps' });
  const free = h('details', { class: 'more ear-free' });
  el.append(tabs, head, list, free);
  let quizCleanup = null, quizHostEl = null;
  // un seul exercice ouvert à la fois : l'ancien est arrêté et retiré de la page
  const stopQuiz = () => { try { quizCleanup?.(); } catch (e) { /* */ } quizCleanup = null; if (quizHostEl) quizHostEl.innerHTML = ''; quizHostEl = null; };
  const refreshers = [];

  const renderTabs = () => {
    tabs.innerHTML = '';
    for (const [id, T] of Object.entries(TRACKS)) {
      const p = trackProgress(id);
      const b = h('button', { type: 'button', role: 'tab', class: id === tid ? 'on' : '', 'aria-selected': String(id === tid) }, `${T.short} · ${p.done}/${p.total}`);
      b.addEventListener('click', () => { if (id === tid) return; stopQuiz(); tid = id; store.set('ui.earTrack', id); render(); });
      tabs.append(b);
    }
  };

  const openSeries = async (host, id) => {
    stopQuiz();
    host.innerHTML = '';
    quizHostEl = host;
    const q = series(id);
    if (q.kind === 'voicefinder') { const vm = await import('./voice.js'); quizCleanup = vm.mountVoiceFinder(host, {}); }
    else quizCleanup = mountQuiz(host, { ...q, stat: id });
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const render = () => {
    stopQuiz();
    refreshers.length = 0;
    renderTabs();
    const T = TRACKS[tid];
    const p = trackProgress(tid);
    head.innerHTML = '';
    const card = h('div', { class: 'card ear-head' },
      h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, p.cur ? `Étape ${p.index} sur ${p.total} : ${p.cur.title}` : 'Parcours terminé'), h('span', { class: 'small' }, `${p.done}/${p.total} réussies`)),
      h('div', { class: 'progress' }, h('i', { style: { width: `${p.done / p.total * 100}%` } })),
      h('p', { class: 'small mb-0' }, T.intro));
    if (T.method) {
      card.append(h('details', { class: 'ear-method' }, h('summary', {}, 'La méthode, en cinq points'), h('ol', {}, ...T.method.map(m => h('li', { html: m })))));
      const tend = singTendency();
      if (tend) card.append(h('p', { class: 'small ear-tend', html: `<b>Ta tendance.</b> ${tend}` }));
    }
    head.append(card);

    list.innerHTML = '';
    const want = store.get(`ui.earOpen.${tid}`);
    T.steps.forEach((s, i) => {
      const li = h('li', { class: 'ear-step' });
      const num = h('span', { class: 'es-num' }, String(i + 1));
      const stat = h('span', { class: 'es-stat small' });
      const btn = h('button', { type: 'button', class: 'es-head', 'aria-expanded': 'false' }, num, h('span', { class: 'es-title' }, s.title), stat);
      const body = h('div', { class: 'es-body', hidden: true });
      body.append(h('p', { class: 'es-why' }, s.why));
      const rows = h('div', { class: 'es-series' });
      const quizHost = h('div', { class: 'es-quiz' });
      const nextBox = h('div', { class: 'es-next', hidden: true });
      for (const id of s.series) {
        const q = series(id);
        const go = h('button', { class: 'btn sm', type: 'button' }, 'Commencer');
        const lbl = h('span', { class: 'small' });
        const row = h('div', { class: 'es-row' }, go, h('span', { class: 'es-st' }, h('b', {}, q.title), lbl));
        go.addEventListener('click', () => openSeries(quizHost, id));
        rows.append(row);
        refreshers.push(() => { const ss = seriesStatus(id); lbl.textContent = ss.label; row.classList.toggle('ok', ss.mastered); });
      }
      body.append(rows);
      if (s.lesson) { const l = lessonById(s.lesson); if (l) body.append(h('p', { class: 'small es-lesson' }, 'Le cours qui explique cette étape : ', h('a', { href: `#/lecon/${l.id}` }, l.title), '.')); }
      body.append(nextBox, quizHost);
      const setOpen = o => { body.hidden = !o; li.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); if (o) store.set(`ui.earOpen.${tid}`, s.id); };
      btn.addEventListener('click', () => { const o = body.hidden; if (!o && quizHost.firstChild) stopQuiz(); setOpen(o); });
      refreshers.push(() => {
        const done = stepDone(s), cur = currentStep(T) === s;
        li.classList.toggle('done', done); li.classList.toggle('current', cur);
        num.textContent = done ? '✓' : String(i + 1);
        stat.textContent = done ? 'réussie' : cur ? 'en cours' : s.series.some(id => seriesStatus(id).done) ? 'commencée' : '';
        const next = T.steps[i + 1];
        nextBox.hidden = !(done && next);
        if (done && next && !nextBox.firstChild) {
          const b2 = h('button', { class: 'btn primary sm', type: 'button' }, `Étape suivante : ${next.title}`);
          b2.addEventListener('click', () => { stopQuiz(); const nli = list.children[i + 1]; setOpen(false); nli.querySelector('.es-head').click(); nli.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
          nextBox.append(h('span', { class: 'small ok-txt' }, 'Étape réussie. '), b2);
        }
      });
      li.append(btn, body);
      list.append(li);
      const openIt = want ? want === s.id : currentStep(T) === s;
      if (openIt) setOpen(true);
    });
    refresh();
    renderFree();
  };
  const refresh = () => { refreshers.forEach(f => f()); renderTabs(); };

  // entraînement libre : toutes les séries, rangées comme avant, repliées
  const renderFree = () => {
    free.innerHTML = '';
    free.append(h('summary', {}, 'Entraînement libre : toutes les séries'));
    const host = h('div', { class: 'es-quiz' });
    const groups = [...new Set(EAR_PRESETS.map(q => q.group))];
    for (const g of groups) {
      const box = h('div', { class: 'free-group' }, h('div', { class: 'small free-title' }, g));
      for (const q of EAR_PRESETS.filter(x => x.group === g)) {
        const b = h('button', { class: 'btn sm' + (seriesStatus(q.id).mastered ? ' ok' : ''), type: 'button' }, q.title);
        b.addEventListener('click', () => openSeries(host, q.id));
        box.append(b);
      }
      free.append(box);
    }
    free.append(host);
  };

  // les scores des séries mettent à jour les étapes sans refermer l'exercice en cours
  const unsub = store.subscribe(path => { if (path === 'stats.ear' || path === 'settings.voiceRange' || path === 'settings' || path === '*') refresh(); });
  render();
  return () => { stopQuiz(); unsub(); };
}
