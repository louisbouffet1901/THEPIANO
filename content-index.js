// Index du parcours : niveaux, modules, pièces, grilles de validation. (Les plans hebdomadaires ont disparu en V7 :
// la séance se choisit, et la carte de chaque pièce relie ses passages aux leçons ; voir session.js et piecemap.js.)
import { LESSONS, PIECES_META } from './content-meta.js';

export const MODULES = [
  { id: 'technique', label: 'Technique', intro: 'Le geste au service du son : posture, poids, legato, pédale, gammes — et surtout une méthode de travail efficace.' },
  { id: 'interpretation', label: 'Interprétation', intro: 'Phrasé, chant, rubato, couleurs : comprendre ce que dit la musique et le faire entendre.' },
  { id: 'theorie', label: 'Théorie', intro: 'Des cours complets, en partant des bases : notes, rythme, gammes, intervalles, accords, fonctions, cadences… Chaque chapitre s’appuie sur un passage de ta pièce.' },
  { id: 'oreille', label: 'Oreille', intro: 'Reprendre l’oreille à zéro : grave et aigu, chanter juste, sentir la tonique, reconnaître les degrés, puis les intervalles, les accords et les cadences. Dix minutes chaque jour, avec beaucoup de conseils.' },
  { id: 'lecture', label: 'Lecture à vue', intro: 'Une méthode et un entraînement quotidien court, sur de vrais extraits du répertoire classés en cinq niveaux, jamais deux fois les mêmes.' },
  { id: 'impro', label: 'Improvisation', intro: 'Improviser pas à pas : un motif, la question et la réponse, les notes de l’accord et leurs ornements, puis des styles (romance de Liszt, nocturne, élégie russe, prélude de Chopin), le langage classique (cadences, règle de l’octave, schémas) et les formes. Chaque leçon explique pourquoi ça marche, puis se travaille en 4 à 7 exercices progressifs : une seule nouveauté à chacun (imiter, squelette, rythme, ornement, question – réponse, silences, transposition), vérifiée au piano. Dix minutes par jour, à l’exercice en cours.' },
];

const ALL = LESSONS;

/** Métadonnées des pièces (titre, compositeur…) ; la page complète se charge avec loadPiece(). */
export const PIECES = PIECES_META;

/* Contenu chargé à la demande : un module par niveau et par matière. */
const LOADERS = {
  'n1:technique': () => import('./n1-technique.js'),
  'n1:interpretation': () => import('./n1-interpretation.js'),
  'n1:theorie': () => import('./n1-theorie.js'),
  'n1:oreille': () => import('./n1-oreille.js'),
  'n1:lecture': () => import('./n1-lecture.js'),
  'n1:impro': () => import('./n1-impro.js'),
  'n2:technique': () => import('./n2-technique.js'),
  'n2:interpretation': () => import('./n2-interpretation.js'),
  'n2:theorie': () => import('./n2-theorie.js'),
  'n2:oreille': () => import('./n2-oreille.js'),
  'n2:lecture': () => import('./n2-lecture.js'),
  'n2:impro': () => import('./n2-impro.js'),
};

/** Leçon complète (avec son texte et ses objectifs). */
export async function loadLesson(id) {
  const meta = ALL.find(l => l.id === id);
  if (!meta) return null;
  const load = LOADERS[`${meta.level}:${meta.module}`];
  if (!load) return null;
  const mod = await load();
  const full = mod.default.find(l => l.id === id);
  return full ? { ...full, level: meta.level, module: meta.module } : null;
}

/** Page complète d'une pièce (texte, extraits, analyse). */
export async function loadPiece(id) {
  const mod = await import('./content-pieces.js');
  return mod.PIECE_PAGES[id] || null;
}


export const LEVELS = [
  {
    id: 'n1', num: 1, short: 'Chanter au piano', title: 'Chanter au piano',
    subtitle: 'Une mélodie qui chante au-dessus d’une main gauche légère : legato, plans sonores, pédale, rubato. Pièce phare : le Nocturne en fa mineur op. 55 n° 1.',
    piece: 'op55-1', complements: ['valse-b150', 'prokofiev-75-6', 'liszt-s169'],
    pieceIds: ['op55-1', 'valse-b150', 'prokofiev-75-6', 'liszt-s169'],
    goals: [
      'Jouer le <b>Nocturne op. 55 n° 1</b> en entier, sans arrêt, mélodie chantante et main gauche légère, pédale propre.',
      'Maîtriser le <b>legato de doigts</b>, la <b>hiérarchie des plans sonores</b> et la <b>pédale syncopée</b> (vérifiés à l’analyseur).',
      'Gammes majeures et mineures harmoniques du programme à ♩ = 80 en doubles croches, régulières.',
      'Comprendre et entendre <b>tonalités, intervalles, accords, fonctions, cadences et notes étrangères</b>.',
      'Lire à vue des pièces simples à deux mains (jusqu’à deux altérations) <b>sans s’arrêter</b>.',
      'Improviser <b>huit mesures</b> dans le style du nocturne sur une grille donnée.',
    ],
    validation: [
      { id: 'p1', group: 'Pièce phare', text: 'Je joue le Nocturne op. 55 n° 1 en entier, sans arrêt, au tempo de ♩ = 60 au moins.' },
      { id: 'p2', group: 'Pièce phare', text: 'La mélodie chante nettement au-dessus de la main gauche.', how: 'Réécoute d’un enregistrement, ou analyseur « Équilibre » : au moins +12 de vélocité.' },
      { id: 'p3', group: 'Pièce phare', text: 'La main gauche (basse + accord) est légère et régulière ; les basses sont tenues par la pédale sans mélanger les harmonies.' },
      { id: 'p4', group: 'Pièce phare', text: 'Les fioritures et groupes irréguliers (m. 14, 30, 44, 46) sont souples, sans précipitation ni retard de la main gauche.' },
      { id: 'p5', group: 'Pièce phare', text: 'Le Più mosso est agité sans dureté ; les traits des mesures 69-70 sont égaux.' },
      { id: 'p6', group: 'Pièce phare', text: 'La coda est molto legato, le crescendo dosé ; le choral final sonne plein et calme.' },
      { id: 't1', group: 'Technique', text: 'Gammes du niveau 1 à ♩ = 80 en doubles croches, mains ensemble.', how: 'Analyseur « Régularité » : irrégularité inférieure à 8 %.' },
      { id: 't2', group: 'Technique', text: 'Legato de doigts maîtrisé sur une mélodie lente.', how: 'Analyseur « Legato » : au moins 80 % de transitions legato.' },
      { id: 't3', group: 'Technique', text: 'Pédale syncopée propre sur i – iv – V7 – i.', how: 'Analyseur « Pédale » : au moins 80 % de changements syncopés, aucun brouillé.' },
      { id: 'or1', group: 'Oreille', text: 'Je reconnais les degrés de la gamme majeure après une cadence, dans toutes les tonalités.', how: 'Série « Toute la gamme (toutes tonalités) » : 70 % ou plus.' },
      { id: 'or2', group: 'Oreille', text: 'Je chante juste une note entendue, et les degrés 1, 3 et 5 après une cadence.', how: 'Séries de chant au micro : 80 % de notes validées.' },
      { id: 'or3', group: 'Oreille', text: 'Je distingue majeur et mineur, fin et suspension, et je retape un rythme d’une mesure.', how: 'Séries « Majeur ou mineur ? », « Fin ou suspension ? » et écho rythmique : 80 % ou plus.' },
      { id: 'th1', group: 'Théorie', text: 'Je lis les notes dans les deux clés et je compte les rythmes du nocturne.', how: 'Outil Théorie, séries « Notes en clé de sol » et « Notes en clé de fa » : 90 % ou plus.' },
      { id: 'th2', group: 'Théorie', text: 'Je construis gammes, intervalles et accords, et je connais les armures jusqu’à quatre altérations.', how: 'Outil Théorie, séries « Intervalles écrits » et « Armures » : 80 % ou plus.' },
      { id: 'th3', group: 'Théorie', text: 'Je nomme les accords et les fonctions (T, SD, D) des mesures 1 à 8 de l’op. 55 n° 1, et je repère les cadences de la pièce.' },
      { id: 'l1', group: 'Lecture à vue', text: 'Lecture à deux mains (niveau 1) en rythme sans m’arrêter.', how: 'Outil Lecture à vue, niveau 2 (deux mains), en rythme : 85 % de notes justes sur cinq extraits de suite.' },
      { id: 'i0', group: 'Improvisation', text: 'J’improvise deux minutes sur un ostinato ou une grille sans m’arrêter, avec un motif rythmique reconnaissable.' },
      { id: 'i1', group: 'Improvisation', text: 'J’improvise huit mesures question–réponse dans le style du nocturne, sans m’arrêter, en m’appuyant sur les notes de l’accord aux temps forts.', how: 'Accompagnateur : au moins 70 % de temps forts sur une note de l’accord.' },
      { id: 'r1', group: 'Interprétation', text: 'Rubato : ma main gauche reste stable quand la main droite s’étire.', how: 'Joue les mesures 1 à 8 avec le métronome à la main gauche seule, puis compare.' },
      { id: 'c1', group: 'Pièces complémentaires', text: 'Valse en la mineur et Montaigus et Capulets jouées en entier, avec leur caractère.' },
      { id: 'c2', group: 'Pièces complémentaires', text: 'Romance S.169 : la mélodie chante au-dessus de l’accompagnement arpégé (au moins la première page).' },
    ],
  },
  {
    id: 'n2', num: 2, short: 'Contrastes et couleurs', title: 'Contrastes et couleurs',
    subtitle: 'Deux mondes dans une même pièce : le cantabile et le con fuoco. Rotation, polyphonie de la main gauche, pianissimo, ornements. Pièce phare : le Nocturne en fa majeur op. 15 n° 1 ; complément : Clair de lune.',
    piece: 'op15-1', complements: ['clair-de-lune'],
    pieceIds: ['op15-1', 'clair-de-lune'],
    goals: [
      'Jouer le <b>Nocturne op. 15 n° 1</b> en entier : un Andante cantabile intime et un Con fuoco agité, avec des transitions maîtrisées.',
      'Acquérir la <b>rotation de l’avant-bras</b> (doubles notes du Con fuoco) et la <b>polyphonie de la main gauche</b>.',
      'Contrôler le <b>pianissimo</b> et la palette des nuances (exercice des nuances à l’analyseur).',
      'Comprendre les <b>accords de septième, dominantes secondaires, modulations, marches, sixte napolitaine et sixte augmentée</b>.',
      'Lire à vue en <b>motifs</b>, dans les tonalités jusqu’à quatre altérations, en <b>regardant en avance</b>.',
      'Improviser une <b>forme ABA</b> avec modulation, et un <b>prélude</b> sur une basse descendante.',
      'Jouer <b>Clair de lune</b> avec une pédale et des couleurs propres à Debussy.',
    ],
    validation: [
      { id: 'p1', group: 'Pièce phare', text: 'Je joue le Nocturne op. 15 n° 1 en entier sans arrêt ; Andante ♩ ≈ 60–69.' },
      { id: 'p2', group: 'Pièce phare', text: 'Andante : la mélodie chante, la main gauche à trois voix reste legato et transparente (basse tenue, triolets discrets).' },
      { id: 'p3', group: 'Pièce phare', text: 'Con fuoco : les doubles notes de la main droite sont régulières grâce à la rotation, sans crispation.' },
      { id: 'p4', group: 'Pièce phare', text: 'La mélodie de la main gauche (m. 29-30 et 41-44) domine l’agitation de la main droite.' },
      { id: 'p5', group: 'Pièce phare', text: 'Les deux transitions (m. 24-25, 48-49) sont préparées ; la reprise est ornée et plus intime.' },
      { id: 't1', group: 'Technique', text: 'Rotation : trémolo d’octave brisée / doubles notes alternées, régulier à ♩ = 80 en sextolets.', how: 'Analyseur « Régularité » : irrégularité inférieure à 8 %.' },
      { id: 't2', group: 'Technique', text: 'Contrôle des nuances : pp, p, mf, f atteints à la demande.', how: 'Analyseur « Nuances » : 70 % de notes dans la cible.' },
      { id: 't3', group: 'Technique', text: 'Gammes et arpèges du niveau 2 (dont 7e de dominante et 7e diminuée) à ♩ = 88 en doubles croches.' },
      { id: 'or1', group: 'Oreille', text: 'Je reconnais les intervalles de la seconde à l’octave, montants, descendants et harmoniques.', how: 'Série « Tous les intervalles » : 70 % ou plus.' },
      { id: 'or2', group: 'Oreille', text: 'Je reconnais les cinq accords de septième et les quatre cadences, en majeur et en mineur.', how: 'Séries « Les cinq septièmes » et « Les quatre cadences (majeur et mineur) » : 70 % ou plus.' },
      { id: 'or3', group: 'Oreille', text: 'Je rejoue au piano une mélodie de cinq notes entendue, en majeur et en mineur.', how: 'Séries « Rejouer 5 notes » : 70 % ou plus.' },
      { id: 'th1', group: 'Théorie', text: 'Je repère dans une partition une dominante secondaire, une modulation, une marche, une sixte napolitaine ou augmentée.' },
      { id: 'th2', group: 'Théorie', text: 'Je donne de mémoire le plan de l’op. 15 n° 1 (sections, tonalités, cadences) et je l’explique en jouant.' },
      { id: 'th3', group: 'Théorie', text: 'J’explique les procédés de Clair de lune : accords parallèles, pédales, mode mineur emprunté, passage en do♯ mineur.' },
      { id: 'l1', group: 'Lecture à vue', text: 'Lecture à vue niveau 4 (sonatines) en rythme, avec l’option « Regard en avant ».', how: 'Outil Lecture à vue : 80 % de notes justes sur cinq extraits de suite.' },
      { id: 'i0', group: 'Improvisation', text: 'Je joue la cadence et la règle de l’octave dans trois tonalités, et j’enchaîne seize mesures de schémas en improvisant la mélodie.' },
      { id: 'i1', group: 'Improvisation', text: 'J’improvise une forme ABA (fa mineur / la♭ majeur / fa mineur) sans m’arrêter, avec un vrai contraste de caractère.' },
      { id: 'i2', group: 'Improvisation', text: 'J’improvise un prélude sur la basse chromatique descendante, en conduisant les voix par mouvement conjoint.' },
      { id: 'c1', group: 'Pièce complémentaire', text: 'Clair de lune en entier : pianissimo maîtrisé, pédale de résonance sans brouillage, sommet de l’« En animant » construit.' },
    ],
  },
  { id: 'n3', num: 3, locked: true, short: 'Fioritures', title: 'Fioritures et rubato', pieceTitle: 'Nocturne op. 9 n° 1 (Chopin)', complementsText: 'Complément : Glass, Étude n° 6', pieceIds: [] },
  { id: 'n4', num: 4, locked: true, short: 'Le son russe', title: 'Le son russe', pieceTitle: 'Élégie op. 3 n° 1 (Rachmaninov)', complementsText: 'Complément : Scriabine, Prélude op. 11 n° 14', pieceIds: [] },
  { id: 'n5', num: 5, locked: true, short: 'Grandeur', title: 'Grandeur et puissance', pieceTitle: 'Prélude op. 3 n° 2 (Rachmaninov)', complementsText: 'Complément : Nocturne op. 48 n° 1 (Chopin)', pieceIds: [] },
  { id: 'n6', num: 6, locked: true, short: 'La ballade', title: 'Raconter une ballade', pieceTitle: 'Ballade n° 3 op. 47 (Chopin)', complementsText: '', pieceIds: [] },
];

export const levelById = id => LEVELS.find(l => l.id === id);
export const allLessons = () => ALL;
export const lessonById = id => ALL.find(l => l.id === id);
export const lessonsOf = (level, module) => ALL.filter(l => l.level === level && l.module === module);
