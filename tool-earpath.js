// Onglet « Oreille » (V7.2) : un seul parcours « Entendre, chanter, jouer » au lieu de deux (V4.3).
// Chaque étape présente la même matière sous trois formes : la reconnaître, la chanter, la retrouver au piano. Elle est
// réussie quand deux formes sur trois le sont (chaque série à 80 % ou plus, deux jours différents). La tonalité change
// dès le début et les réponses sont des chiffres, pas des noms de notes : on entend chaque degré par rapport à la
// tonique (méthode fonctionnelle), au lieu d'apprendre des hauteurs fixes en do majeur. Une question sur cinq révise
// une étape passée ; les confusions fréquentes ont leur série ciblée.
import { h, esc, fmtPct } from './util.js';
import { store } from './store.js';
import { EAR_PRESETS, mountQuiz, topConfusions } from './tool-ear.js';
import { lessonById } from './content-index.js';

/* ------------------------------------------------------------------ */
/* Les séries                                                          */
/* ------------------------------------------------------------------ */
// séries des leçons (mêmes identifiants : les progrès sont communs) et séries du parcours
const DEG18 = [1, 2, 3, 4, 5, 6, 7, 8];
const EXTRA = {
  'find-note': { kind: 'earnote', title: 'Retrouver au piano une note entendue', count: 8 },
  'echo-3c': { kind: 'echo', degrees: [1, 2, 3, 4, 5], length: 3, maxStep: 2, key: 'random', startTonic: false, title: 'Rejouer 3 notes (la première est donnée)', count: 8 },
  'deg-1r': { kind: 'degree', binary: true, degrees: [1, 2, 3, 4, 5, 6, 7], key: 'random', title: 'La tonique ou pas ? (la tonalité change)', count: 12 },
  'play-tonic': { kind: 'playtonic', title: 'Jouer la tonique après la cadence', count: 8 },
  'deg-123r': { kind: 'degree', degrees: [1, 2, 3], key: 'random', keyEvery: 3, title: 'Degrés 1, 2, 3 (la tonalité change)', count: 12 },
  'sing-123r': { kind: 'sing', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [1, 3, 1], [1, 2, 1]], key: 'random', title: 'Chanter 1-2-3 et 3-2-1 (la tonalité change)', count: 8 },
  'echo-3r': { kind: 'echo', degrees: [1, 2, 3], length: 3, key: 'random', title: 'Rejouer 3 notes, degrés 1 à 3', count: 8 },
  'deg-15r': { kind: 'degree', degrees: [1, 2, 3, 4, 5], key: 'random', keyEvery: 2, title: 'Degrés 1 à 5 (la tonalité change)', count: 12 },
  'sing-135r': { kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5]], key: 'random', title: 'Chanter 1-3-5 et 5-4-3-2-1 (la tonalité change)', count: 8 },
  'echo-5r': { kind: 'echo', degrees: [1, 2, 3, 4, 5], length: 4, key: 'random', title: 'Rejouer 4 notes, degrés 1 à 5', count: 8 },
  'sing-degr': { kind: 'sing', task: 'degree', degrees: DEG18, key: 'random', title: 'Chanter un degré après la cadence', count: 8 },
  'sing-minr': { kind: 'sing', mode: 'min', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [5, 6, 5], [7, 8], [1, 3, 5]], key: 'random', title: 'Chanter en mineur (la tonalité change)', count: 8 },
  'sing-arp-r': { kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [1, 3, 5, 8]], key: 'random', title: 'Chanter l’arpège (la tonalité change)', count: 6 },
  'play-mm': { kind: 'chordecho', set: ['M', 'm'], title: 'Rejouer un accord majeur ou mineur', count: 8 },
  'echo-iv': { kind: 'echo', degrees: DEG18, length: 2, maxStep: 4, key: 'random', startTonic: false, cadence: false, title: 'Rejouer deux notes (la première est donnée)', count: 10 },
  'sing-iv3': { kind: 'sing', task: 'interval', set: ['5J', '6m', '6M', '7m', '8ve'], title: 'Chanter un grand intervalle au-dessus d’une note', count: 8 },
  'echo-ivbig': { kind: 'echo', degrees: DEG18, length: 2, maxStep: 7, minStep: 4, key: 'random', startTonic: false, cadence: false, title: 'Rejouer deux notes éloignées', count: 10 },
  'sing-bass': { kind: 'sing', task: 'bass', key: 'random', title: 'Chanter la basse des accords', count: 6 },
  'echo-bassr': { kind: 'echo', degrees: [1, 4, 5, 6, 8], length: 4, maxStep: 3, key: 'random', title: 'Rejouer une basse (1, 4, 5, 6)', count: 8 },
  'read-match': { kind: 'readmatch', title: 'Ce que je lis, est-ce ce que j’entends ?', count: 10 },
  'read-sing': { kind: 'sing', task: 'read', keys: [0, -5, 2, -3, 5, -2, 3], title: 'Chanter une mélodie lue, avant de l’entendre', count: 6 },
  'echo-8r6': { kind: 'echo', degrees: DEG18, length: 6, maxStep: 3, key: 'random', title: 'Rejouer 6 notes (la tonalité change)', count: 8 },
  // séries de la V4.3 (gardées : entraînement libre et leçons)
  'sing-tonic': { kind: 'sing', task: 'degree', degrees: [1], key: 'random', title: 'Chanter la tonique après la cadence', count: 8 },
  'sing-123': { kind: 'sing', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [1, 3, 1], [1, 2, 1]], title: 'Chanter 1-2-3 et 3-2-1', count: 8 },
  'sing-135': { kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5]], title: 'Chanter 1-3-5 et 5-4-3-2-1', count: 8 },
  'sc-mm': { kind: 'scales', set: ['maj', 'harmMin'], title: 'Gamme majeure ou mineure ?', count: 10 },
  'echo-min4': { kind: 'echo', mode: 'min', degrees: DEG18, length: 4, maxStep: 2, title: 'Rejouer 4 notes en mineur', count: 8 },
  'sing-iv2': { kind: 'sing', task: 'interval', set: ['2M', '3M', '4J', '5J', '8ve'], title: 'Chanter un intervalle au-dessus d’une note', count: 8 },
  'sing-hold': { kind: 'sing', task: 'hold', span: 3, holdMs: 3000, tol: 40, title: 'Tenir une note 3 secondes', count: 5 },
  'sing-glide': { kind: 'sing', task: 'glide', title: 'Glisser d’une note à l’autre', count: 6 },
  'sing-match-p': { kind: 'sing', task: 'match', span: 5, tol: 25, title: 'Une note à 25 cents près', count: 8 },
  'sing-hold-p': { kind: 'sing', task: 'hold', span: 5, holdMs: 4000, tol: 25, title: 'Tenir 4 secondes à 25 cents près', count: 5 },
};
export const seriesOf = id => {
  const c = EXTRA[id] || EAR_PRESETS.find(p => p.id === id);
  if (!c) throw new Error('Série inconnue : ' + id);
  const { group, ...rest } = c;
  return { ...rest, id };
};

/* ------------------------------------------------------------------ */
/* Le parcours                                                          */
/* ------------------------------------------------------------------ */
export const FORMS = {
  R: { label: 'Reconnaître', what: 'tu écoutes et tu réponds' },
  C: { label: 'Chanter', what: 'tu chantes, le micro vérifie' },
  J: { label: 'Jouer', what: 'tu retrouves au piano ce que tu as entendu' },
};
const S = (id, title, why, forms, lesson, advice, extra = {}) => ({ id, title, why, forms, lesson, advice, ...extra });
export const PATH = [
  S('voix', 'Grave et aigu, ta voix', 'Distinguer deux hauteurs, même proches, puis en reproduire une : à la voix et au piano.',
    { R: ['hl'], C: ['sing-match-a', 'sing-hold'], J: ['find-note'] }, 'n1-or2',
    ['Compare les deux notes sans les nommer : la deuxième monte-t-elle ou descend-elle ?', 'Avant de chanter, entends la note une seconde dans ta tête ; chante doucement, sur « mmm ».', 'Glisse comme une sirène jusqu’à la bande verte ; au piano, pars d’une touche voisine et compare.'],
    { pre: 'voice-finder' }),
  S('dessin', 'Le dessin d’une mélodie', 'Monte, descend, en arche, en creux : le contour avant les notes.',
    { R: ['contour', 'contour4'], C: ['sing-glide'], J: ['echo-3c'] }, 'n1-or1',
    ['Dessine le chemin avec la main pendant l’écoute.', 'Fredonne la mélodie avant de répondre : ta voix sait déjà où elle va.', 'Concentre-toi sur la note la plus haute : où arrive-t-elle ?']),
  S('tonique', 'La tonique', 'Sentir la note de repos après une cadence, dans n’importe quelle tonalité : le point de départ de tout le reste.',
    { R: ['deg-1r'], C: ['sing-tonic'], J: ['play-tonic'] }, 'n1-or4',
    ['Garde le dernier accord de la cadence en tête : sa note de repos est la tonique.', 'Chante la tonique dès la fin de la cadence, avant même la question.', 'Réécoute la cadence et chante sa note la plus grave à la fin : c’est la tonique.']),
  S('deg123', 'Degrés 1, 2, 3', 'Les trois premiers degrés, chacun avec sa couleur. La tonalité change toutes les trois questions.',
    { R: ['deg-123r'], C: ['sing-123r'], J: ['echo-3r'] }, 'n1-or5',
    ['1 repose ; 2 hésite et retombe sur 1 ; 3 est stable et lumineux.', 'Après chaque réponse, chante la résolution avec le piano : 3 – 2 – 1.', 'Fais la série ciblée sur ta confusion (en haut de la page), puis reviens.']),
  S('deg15', 'Degrés 1 à 5', 'La sous-dominante et la dominante s’ajoutent. La tonalité change toutes les deux questions.',
    { R: ['deg-15r'], C: ['sing-135r'], J: ['echo-5r'] }, 'n1-or6',
    ['4 penche vers 3, juste en dessous ; 5 est stable mais ouvert, il attend la suite.', 'Dans chaque nouvelle tonalité, chante 1-3-5-3-1 avant de répondre.', '4 ou 5 ? Le 4 veut descendre d’un demi-ton ; le 5 peut rester où il est.']),
  S('gamme', 'Toute la gamme', 'Les sept degrés, et la sensible qui appelle la tonique. La tonalité change à chaque question.',
    { R: ['deg-18r'], C: ['sing-degr'], J: ['echo-8r'] }, 'n1-or7',
    ['6 est doux et retombe sur 5 ; 7, la sensible, veut monter vers 8.', 'Réponds à l’impression, sans compter les marches depuis 1 : la vitesse vient avec l’habitude.', 'Chante depuis 1 en montant jusqu’à retrouver la note, puis réécoute la question.']),
  S('mineur', 'En mineur', 'Les mêmes repères en mineur : la tierce plus sombre, la sensible qui monte.',
    { R: ['deg-min'], C: ['sing-minr'], J: ['echo-min'] }, 'n2-or1',
    ['3 est sombre ; 6 pèse vers 5 ; 7 est à un demi-ton sous la tonique.', 'Dans chaque tonalité, chante 1-2-3-2-1, puis 5-6-5.', 'Compare avec le majeur : seuls 3 et 6 changent (et 7, monté d’un demi-ton).']),
  S('couleurs', 'Majeur ou mineur, fin ou suspension', 'Les deux couleurs d’accord, et les deux ponctuations de la musique.',
    { R: ['ch-mm', 'cad-2'], C: ['sing-arp-r'], J: ['play-mm'] }, 'n1-or8',
    ['Majeur clair, mineur sombre ; une fin repose, une suspension attend la suite.', 'Chante l’arpège 1-3-5 : c’est la tierce, au milieu, qui décide.', 'Joue toi-même do majeur puis do mineur, plusieurs fois, en écoutant la tierce bouger.']),
  S('iv1', 'Intervalles : de la seconde à la quinte', 'Mesurer l’écart entre deux notes, sans tonalité de référence.',
    { R: ['iv-n1'], C: ['sing-iv2'], J: ['echo-iv'] }, 'n2-or2',
    ['Écoute la couleur et la distance ; un début de chanson connu sert de repère.', 'Chante les deux notes, puis remplis l’espace entre elles (do-ré-mi pour une tierce).', 'Fais la série ciblée sur la paire que tu confonds le plus.']),
  S('iv2', 'Grands intervalles', 'Sixtes, septièmes, octave : les sauts que la voix a tendance à rétrécir.',
    { R: ['iv-c'], C: ['sing-iv3'], J: ['echo-ivbig'] }, 'n2-or3',
    ['La sixte s’ouvre, la septième est tendue, l’octave est la même note plus haut.', 'Les grands intervalles se chantent souvent trop petits : vise un peu plus loin que tu ne crois.', 'Chante d’abord l’octave, puis la septième juste en dessous et la sixte encore un ton plus bas.']),
  S('basse', 'La basse et les accords', 'Entendre la basse sous les accords : là où se décide l’harmonie.',
    { R: ['func'], C: ['sing-bass'], J: ['echo-bassr'] }, 'n2-or4',
    ['Écoute en bas, pas la mélodie : de 1 à 4 la basse monte d’une quarte, de 1 à 5 d’une quinte.', 'Chante la basse pendant que les accords sonnent.', 'Joue I, IV et V toi-même en chantant leur basse, puis réécoute.']),
  S('cadences', 'Cadences et fonctions', 'Les quatre cadences, et l’accord qui suit la tonique.',
    { R: ['cad', 'func2'] }, 'n2-or6',
    ['Concentre-toi sur la fin : repos, suspension, « amen » ou surprise ?', 'Chante la tonique pendant l’écoute : le dernier accord la contient-il ?', 'Fais la série ciblée sur les deux cadences que tu confonds.']),
  S('septiemes', 'Les accords de septième', 'Cinq couleurs de septième, de la plus tendue à la plus douce.',
    { R: ['ch7-a', 'ch7-b'] }, 'n2-or8',
    ['Repère d’abord l’accord de base (majeur ou mineur), puis la septième en haut de l’arpège.', 'Chante l’arpège jusqu’à la septième : un demi-ton sous l’octave (majeure) ou un ton (mineure) ?', 'Réécoute en arpège : la septième est la note du haut.']),
  S('interieur', 'Entendre dans sa tête', 'Lire une mélodie et l’entendre avant qu’elle sonne : la lecture intérieure (Kodály), utile aussi pour lire à vue.',
    { R: ['read-match'], C: ['read-sing'] }, null,
    ['Avant le son, entends la tonique, puis chaque pas de la mélodie.', 'Chante la tonique, puis la mélodie lentement en suivant la portée du doigt.', 'Repère les notes de l’accord (1, 3, 5) : les autres sont leurs voisines.']),
  S('piece', 'Les motifs de tes pièces', 'Chanter et rejouer d’oreille les motifs de tes nocturnes : tu les entendras ensuite en les jouant.',
    { C: ['sing-op55'], J: ['echo-op55', 'echo-chopin'] }, null,
    ['Écoute le motif comme une phrase : où va-t-il, où se pose-t-il ?', 'Chante-le, joue-le, puis retrouve-le dans ta partition.', 'Le bouton « Le motif, lentement » le joue deux fois moins vite.']),
  S('bilan', 'Tout mélanger', 'Tous les intervalles, des mélodies plus longues, une voix plus précise.',
    { R: ['iv-all'], C: ['sing-match-p', 'sing-hold-p'], J: ['echo-8r6'] }, 'n2-or7',
    ['Laisse venir la réponse sans chercher : la première impression est souvent la bonne.', 'Une série par jour, la plus faible d’abord.', 'Reviens à l’étape où la confusion est née, pour une série.']),
];

export const RULES = [
  '<b>Court et fréquent</b> : 8 à 10 minutes, 4 à 5 jours sur 7, valent mieux qu’une heure le dimanche.',
  '<b>Chante avant de répondre</b> : ce que ta voix trouve, ton oreille le reconnaît.',
  '<b>Écoute où la note veut aller</b>, ne compte pas : la réponse vient de l’effet, pas du calcul.',
  '<b>Après une erreur</b>, réécoute, puis chante la bonne réponse avec le piano.',
  '<b>Mélange l’ancien et le nouveau</b> : une question sur cinq révise une étape passée.',
  '<b>Une mélodie entière d’oreille par semaine</b> : une chanson que tu connais, retrouvée au piano.',
];
const SING_METHOD = ['Écoute, puis <b>entends la note dans ta tête</b> une seconde avant de chanter.', 'Chante <b>doucement</b>, sur « mmm » ou « la », sans forcer : une voix légère se règle mieux.', 'Regarde l’<b>aiguille</b> : à gauche, monte ; à droite, descends ; au milieu, tiens.', 'Respire avant la note et garde un <b>souffle régulier</b> pendant qu’elle dure.', 'Une note trop haute ou trop basse pour toi ? Chante-la <b>une octave plus bas ou plus haut</b> : elle compte aussi.'];

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */
const dayOf = t => new Date(t).toDateString();
/** Réussie : 80 % ou plus deux jours différents, et la dernière fois aussi. */
export function seriesStatus(id) {
  if (id === 'voice-finder') { const ok = Array.isArray(store.get('settings.voiceRange')); return { done: ok, mastered: ok, label: ok ? 'Tessiture mesurée ✓' : 'À faire une fois' }; }
  const hist = (store.get('stats.ear') || []).filter(x => x.id === id);
  const last = hist[hist.length - 1] || null;
  const goal = (EXTRA[id] || EAR_PRESETS.find(p => p.id === id) || {}).goal ?? 0.8;
  const goodDays = new Set(hist.filter(x => x.pct >= goal).map(x => dayOf(x.at))).size;
  const mastered = !!last && last.pct >= goal && goodDays >= 2;
  const label = !last ? 'Pas encore faite' : mastered ? `Réussie ✓ · ${fmtPct(last.pct)}` : `Dernier score ${fmtPct(last.pct)}${last.pct >= goal ? ` · encore un jour à ${fmtPct(goal)}` : ` · objectif ${fmtPct(goal)}`}`;
  return { done: !!last, mastered, label, last, hist };
}
const formIds = s => Object.keys(FORMS).filter(f => s.forms[f]);
export const formDone = (s, f) => s.forms[f].every(id => seriesStatus(id).mastered);
/** Une étape : formes réussies, et nombre requis (deux sur trois ; toutes s'il y en a moins de deux). */
export function stepStatus(s) {
  const forms = formIds(s);
  const done = forms.filter(f => formDone(s, f));
  const need = Math.min(2, forms.length);
  return { forms, done, need, ok: done.length >= need, started: forms.some(f => s.forms[f].some(id => seriesStatus(id).done)) };
}
const currentStep = () => PATH.find(s => !stepStatus(s).ok) || null;
/** Avancement du parcours (l'argument est gardé pour la compatibilité avec les deux parcours de la V4.3). */
export function trackProgress() {
  const done = PATH.filter(s => stepStatus(s).ok).length;
  const cur = currentStep();
  return { done, total: PATH.length, cur, index: cur ? PATH.indexOf(cur) + 1 : PATH.length };
}
/** Bloqué : les trois derniers essais d'une série sous 60 %. */
const stuckOn = id => { const h3 = seriesStatus(id).hist?.slice(-3) || []; return h3.length === 3 && h3.every(x => x.pct < 0.6); };
const CONF_OF = { degree: ['deg-maj', 'deg-min'], intervals: ['iv', 'iv-d', 'iv-h'], chords: ['ch'], chordfunc: ['func'], cadences: ['cad'] };

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
  if (unstable / n >= 0.3) return `Ta voix <b>bouge</b> autour de la note (${unstable} sur ${n}) : reviens à « Tenir une note » (première étape), souffle régulier, son léger.`;
  return null;
}

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
export function mountEarPath(el) {
  const head = h('div');
  const confBox = h('div');
  const list = h('ol', { class: 'ear-steps' });
  const free = h('details', { class: 'more ear-free' });
  el.append(head, confBox, list, free);
  let quizCleanup = null, quizHostEl = null;
  // un seul exercice ouvert à la fois : l'ancien est arrêté et retiré de la page
  const stopQuiz = () => { try { quizCleanup?.(); } catch (e) { /* */ } quizCleanup = null; if (quizHostEl) quizHostEl.innerHTML = ''; quizHostEl = null; };
  const refreshers = [];

  /** Les séries des étapes passées, de même forme, déjà faites au moins une fois : la révision mêlée (20 %). */
  const reviewFor = (stepIndex, form) => {
    const out = [];
    for (let j = stepIndex - 1; j >= 0 && out.length < 4; j--) {
      for (const id of PATH[j].forms[form] || []) {
        if (id === 'voice-finder' || !seriesStatus(id).done) continue;
        const c = seriesOf(id);
        if (c.kind === 'voicefinder') continue;
        out.push(c);
      }
    }
    return out;
  };
  const openSeries = async (host, id, opts = {}) => {
    stopQuiz();
    host.innerHTML = '';
    quizHostEl = host;
    const q = opts.cfg || seriesOf(id);
    if (q.kind === 'voicefinder') { const vm = await import('./voice.js'); quizCleanup = vm.mountVoiceFinder(host, {}); }
    else quizCleanup = mountQuiz(host, { ...q, stat: q.id || id, mix: opts.mix || null });
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderHead = () => {
    const p = trackProgress();
    head.innerHTML = '';
    const card = h('div', { class: 'card ear-head' },
      h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, p.cur ? `Étape ${p.index} sur ${p.total} : ${p.cur.title}` : 'Parcours terminé'), h('span', { class: 'small' }, `${p.done}/${p.total} réussies`)),
      h('div', { class: 'progress' }, h('i', { style: { width: `${p.done / p.total * 100}%` } })),
      h('p', { class: 'small mb-0', html: 'Chaque étape présente la même matière sous trois formes : la <b>reconnaître</b>, la <b>chanter</b>, la <b>jouer</b> au piano. Elle est réussie quand deux formes sur trois le sont (chaque série à 80 %, deux jours différents). La tonalité change dès le début et tu réponds par des chiffres : tu entends chaque note par rapport à la tonique, pas comme une hauteur fixe.' }),
      h('details', { class: 'ear-method' }, h('summary', {}, 'Six règles'), h('ol', {}, ...RULES.map(m => h('li', { html: m })))),
      h('details', { class: 'ear-method' }, h('summary', {}, 'Chanter juste : la méthode en cinq points'), h('ol', {}, ...SING_METHOD.map(m => h('li', { html: m })))));
    const tend = singTendency();
    if (tend) card.append(h('p', { class: 'small ear-tend', html: `<b>Ta tendance au chant.</b> ${tend}` }));
    head.append(card);
  };

  // ce que tu confonds le plus, avec une série ciblée sur chaque paire
  const confHost = h('div', { class: 'es-quiz' });
  const renderConf = () => {
    confBox.innerHTML = '';
    const top = topConfusions({ n: 3 });
    if (!top.length) return;
    const rows = h('ul', { class: 'ear-conf' });
    for (const c of top) {
      const go = h('button', { class: 'btn sm', type: 'button' }, 'Série ciblée');
      go.addEventListener('click', () => openSeries(confHost, c.series.id, { cfg: c.series }));
      const st = seriesStatus(c.series.id);
      rows.append(h('li', {}, h('span', {}, h('b', {}, c.label), ` (${c.kindLabel}) : confondus ${c.count} fois`, st.done ? h('span', { class: 'small muted' }, ` · ${st.label}`) : null), go));
    }
    confBox.append(h('div', { class: 'card ear-confcard' }, h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Ce qui te trompe'), h('span', { class: 'small muted' }, 'tes dernières réponses')), rows,
      h('p', { class: 'small muted mb-0' }, 'Une série ciblée ne propose que les deux réponses confondues : l’oreille apprend la différence. Vise 80 %, puis reviens à ton étape.'), confHost));
  };

  const render = () => {
    stopQuiz();
    refreshers.length = 0;
    renderHead();
    renderConf();
    list.innerHTML = '';
    const want = store.get('ui.earOpen.path');
    PATH.forEach((s, i) => {
      const li = h('li', { class: 'ear-step' });
      const num = h('span', { class: 'es-num' }, String(i + 1));
      const stat = h('span', { class: 'es-stat small' });
      const btn = h('button', { type: 'button', class: 'es-head', 'aria-expanded': 'false' }, num, h('span', { class: 'es-title' }, s.title), stat);
      const body = h('div', { class: 'es-body', hidden: true });
      body.append(h('p', { class: 'es-why' }, s.why));
      const quizHost = h('div', { class: 'es-quiz' });
      if (s.pre) {
        const go = h('button', { class: 'btn sm', type: 'button' }, 'Mesurer');
        const lbl = h('span', { class: 'small' });
        go.addEventListener('click', () => openSeries(quizHost, s.pre));
        body.append(h('div', { class: 'es-row es-pre' }, go, h('span', { class: 'es-st' }, h('b', {}, 'D’abord : trouver ta voix'), lbl)));
        refreshers.push(() => { lbl.textContent = seriesStatus(s.pre).label; });
      }
      const stuckBox = h('div', { class: 'es-stuck', hidden: true });
      for (const f of formIds(s)) {
        const box = h('div', { class: 'es-form' });
        const fmark = h('span', { class: 'es-fmark' });
        box.append(h('div', { class: 'es-fhead' }, fmark, h('b', {}, FORMS[f].label), h('span', { class: 'small muted' }, ` · ${FORMS[f].what}`)));
        for (const id of s.forms[f]) {
          const q = seriesOf(id);
          const go = h('button', { class: 'btn sm', type: 'button' }, 'Commencer');
          const lbl = h('span', { class: 'small' });
          const row = h('div', { class: 'es-row' }, go, h('span', { class: 'es-st' }, h('b', {}, q.title), lbl));
          go.addEventListener('click', () => openSeries(quizHost, id, { mix: reviewFor(i, f) }));
          box.append(row);
          refreshers.push(() => { const ss = seriesStatus(id); lbl.textContent = ss.label; row.classList.toggle('ok', ss.mastered); });
        }
        refreshers.push(() => { const d = formDone(s, f); box.classList.toggle('ok', d); fmark.textContent = d ? '✓' : ''; });
        body.append(box);
      }
      body.append(stuckBox);
      body.append(h('div', { class: 'es-advice small' },
        h('div', {}, h('b', {}, 'Écoute. '), s.advice[0]), h('div', {}, h('b', {}, 'Entraîne-toi. '), s.advice[1]), h('div', {}, h('b', {}, 'Si tu bloques. '), s.advice[2])));
      if (s.lesson) { const l = lessonById(s.lesson); if (l) body.append(h('p', { class: 'small es-lesson' }, 'Le cours qui explique cette étape : ', h('a', { href: `#/lecon/${l.id}` }, l.title), '.')); }
      const nextBox = h('div', { class: 'es-next', hidden: true });
      body.append(nextBox, quizHost);
      const setOpen = o => { body.hidden = !o; li.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); if (o) store.set('ui.earOpen.path', s.id); };
      btn.addEventListener('click', () => { const o = body.hidden; if (!o && quizHost.firstChild) stopQuiz(); setOpen(o); });
      refreshers.push(() => {
        const st = stepStatus(s), cur = currentStep() === s;
        li.classList.toggle('done', st.ok); li.classList.toggle('current', cur);
        num.textContent = st.ok ? '✓' : String(i + 1);
        stat.textContent = st.ok ? 'réussie' : `${st.done.length}/${st.need} forme${st.need > 1 ? 's' : ''}${cur ? ' · en cours' : ''}`;
        // bloqué sur une série de reconnaissance : la série ciblée d'abord
        const stuck = (s.forms.R || []).find(stuckOn);
        stuckBox.hidden = true; stuckBox.innerHTML = '';
        if (stuck) {
          const kinds = CONF_OF[seriesOf(stuck).kind] || null;
          const c = kinds && topConfusions({ kinds, min: 2, n: 1 })[0];
          if (c) {
            const go = h('button', { class: 'btn sm primary', type: 'button' }, c.series.title);
            go.addEventListener('click', () => openSeries(quizHost, c.series.id, { cfg: c.series }));
            stuckBox.append(h('p', { class: 'small mb-0' }, h('b', {}, 'Tu bloques sous 60 %. '), `Tu confonds surtout ${c.label} : fais d’abord une série sur ces deux-là seulement, puis reviens.`), go);
            stuckBox.hidden = false;
          }
        }
        const next = PATH[i + 1];
        nextBox.hidden = !(st.ok && next);
        if (st.ok && next && !nextBox.firstChild) {
          const b2 = h('button', { class: 'btn primary sm', type: 'button' }, `Étape suivante : ${next.title}`);
          b2.addEventListener('click', () => { stopQuiz(); const nli = list.children[i + 1]; setOpen(false); nli.querySelector('.es-head').click(); nli.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
          nextBox.append(h('span', { class: 'small ok-txt' }, 'Étape réussie. '), b2);
        }
      });
      li.append(btn, body);
      list.append(li);
      const openIt = want ? want === s.id : currentStep() === s;
      if (openIt) setOpen(true);
    });
    refresh();
    renderFree();
  };
  const refresh = () => { refreshers.forEach(f => f()); renderHead(); };

  // entraînement libre : toutes les séries, rangées par groupe, repliées
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
  const unsub = store.subscribe(path => {
    if (path === 'stats.ear' || path === 'settings.voiceRange' || path === 'settings' || path === '*') refresh();
    if (path === 'stats.ear') { const keep = confHost.firstChild; if (!keep) renderConf(); }
  });
  render();
  return () => { stopQuiz(); unsub(); };
}
