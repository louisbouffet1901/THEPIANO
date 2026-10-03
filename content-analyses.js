// Analyses des extraits de pièces : affichées automatiquement sous chaque partition (panneau « Analyse »).
// Chaque accord : [nom, chiffrage, fonction (T, SD, D ou '' pour passage / couleur), temps où il commence].
// Établies d'après les éditions LilyPond (Snortum), le MIDI et la partition, mesure par mesure.
import { OP55, OP15, CLAIR } from './content-excerpts.js';

const A_OP55_1_4 = [
  { m: 1, ch: [['fa m', 'i', 'T', 1], ['mi♭/sol', 'VII6', '', 3]] },
  { m: 2, ch: [['la♭', 'III', 'T', 1], ['do 7/mi', 'V6/5', 'D', 3]] },
  { m: 3, ch: [['fa m', 'i', 'T', 1], ['mi♭/sol', 'VII6', '', 3]] },
  { m: 4, ch: [['la♭', 'III', 'T', 1], ['do 7/mi', 'V6/5', 'D', 3]] },
];
const A_OP55_5_8 = [
  { m: 5, ch: [['fa m', 'i', 'T', 1], ['mi♭/sol', 'VII6', '', 3]] },
  { m: 6, ch: [['la♭', 'III', 'T', 1], ['sol♭/si♭', 'N6', 'SD', 3]] },
  { m: 7, ch: [['fa m/do', 'i6/4', 'D', 1], ['do 7', 'V7', 'D', 3]] },
  { m: 8, ch: [['fa m', 'i', 'T', 1], ['do/fa', 'V sur pédale', 'D', 3]] },
];

export const AN = {
  op55_1_4: {
    key: 'fa mineur (4 bémols)',
    bars: A_OP55_1_4,
    notes: [
      'Une harmonie par demi-mesure : la basse sur les temps 1 et 3, l’accord sur les temps 2 et 4.',
      'Mesure 2 : si♮ et ré♭ brodent le do de la mélodie (broderies inférieure et supérieure), au-dessus de l’accord de la♭.',
      'Do 7 avec mi♮ à la basse ramène vers fa mineur : la sensible mi♮ monte vers fa.',
    ],
  },
  op55_5_8: {
    key: 'fa mineur',
    bars: A_OP55_5_8,
    notes: [
      'Mesure 6 : trille sur si♭ au-dessus de la sixte napolitaine (sol♭ majeur avec si♭ à la basse), l’accord le plus sombre de la phrase.',
      'Mesure 7 : i6/4 puis V7, le « 6/4 de cadence » ; le la♭ de l’accord arpégé est une appoggiature de sol.',
      'Mesures 7-8 : cadence parfaite en fa mineur. Au 3e temps de la mesure 8, do majeur au-dessus du fa tenu relance le thème.',
    ],
  },
  op55_1_8: {
    key: 'fa mineur (4 bémols)',
    bars: [...A_OP55_1_4, ...A_OP55_5_8],
    notes: [
      'Mesures 1 à 4 : une boucle i – VII6 – III – V6/5, jouée deux fois.',
      'Mesure 6 : la sixte napolitaine (N6), sous-dominante colorée, sous la trille.',
      'Mesures 7-8 : 6/4 de cadence, V7, i : cadence parfaite.',
    ],
  },
  op15_1_8: {
    key: 'fa majeur (1 bémol)',
    bars: [
      { m: 1, ch: [['fa', 'I', 'T', 1]] },
      { m: 2, ch: [['si♭/fa', 'IV', 'SD', 1], ['do 7/fa', 'V7', 'D', 2]] },
      { m: 3, ch: [['sol m7/fa', 'ii7', 'SD', 1], ['do 7', 'V7', 'D', 2]] },
      { m: 4, ch: [['fa', 'I', 'T', 1], ['la 7/mi', 'V7/vi', 'D', 2], ['ré m', 'vi', 'T', 3]] },
      { m: 5, ch: [['sol 7/ré', 'V7/V', 'D', 1], ['sol ø7/ré♭', 'iiø7', 'SD', 2], ['do 7', 'V7', 'D', 3]] },
      { m: 6, ch: [['fa/do', 'I', 'T', 1], ['si ø7', 'iiø7/iii', 'SD', 2]] },
      { m: 7, ch: [['mi 7/si', 'V7/iii', 'D', 1], ['la m', 'iii', 'T', 2], ['si ø7', 'iiø7/iii', 'SD', 3]] },
      { m: 8, ch: [['mi', 'V/iii', 'D', 1], ['do 7/sol', 'V7', 'D', 3]] },
    ],
    notes: [
      'Mesures 1 à 3 : pédale de tonique (fa tenu à la basse) ; au-dessus, les accords changent sans quitter fa.',
      'Mesures 4 à 8 : la basse descend pas à pas, et presque chaque étape est préparée par sa propre dominante (V7/vi, V7/V, V7/iii) : des dominantes secondaires.',
      'Mesure 5 : le ré♭ (iiø7) est emprunté à fa mineur, première ombre de la pièce.',
    ],
  },
};

export const ANALYSES = new Map([
  [OP55.e1, AN.op55_1_4],
  [OP55.e2, AN.op55_5_8],
  [OP55.e3, {
    key: 'fa mineur',
    bars: [
      { m: 13, ch: [['fa m', 'i', 'T', 1], ['mi♭/sol', 'VII6', '', 3]] },
      { m: 14, ch: [['la♭', 'III', 'T', 1], ['sol♭/si♭', 'N6', 'SD', 3]] },
    ],
    notes: [
      'Même harmonie qu’aux mesures 5-6 : seule l’ornementation change.',
      'Mesure 14 : la trille, préparée par deux petites notes (la♮ – si♭), puis un quintolet (cinq doubles croches dans un temps) qui mène au do de la mesure 15.',
    ],
  }],
  [OP55.e4, {
    key: 'la♭ majeur, do mineur, puis retour vers fa mineur',
    bars: [
      { m: 17, ch: [['mi♭ 7', 'V7 de la♭', 'D', 1]] },
      { m: 18, ch: [['la♭', 'I de la♭', 'T', 1], ['ré ø7/la♭', 'iiø7 de do m', 'SD', 3]] },
      { m: 19, ch: [['sol 7', 'V7 de do m', 'D', 1]] },
      { m: 20, ch: [['do 7', 'V7 de fa m', 'D', 1], ['fa m/do', 'i6/4', 'D', 3]] },
    ],
    notes: [
      'Mesure 17 : le la♭ de la main gauche, tenu sur l’accord de mi♭ 7, est un retard : il descend vers sol au 4e temps.',
      'Les altérations guident l’oreille : ré♮ (mesure 18) et si♮ (mesure 19) annoncent do mineur ; mi♮ (mesure 20) ramène vers fa mineur.',
      'Basse mi♭ → la♭, puis sol → do : deux enchaînements de quinte descendante, dominante → tonique.',
    ],
  }],
  [OP55.e5, {
    key: 'fa mineur',
    bars: [
      { m: 27, ch: [['fa m', 'i', 'T', 1], ['mi♭/sol', 'VII6', '', 3]] },
      { m: 28, ch: [['la♭', 'III', 'T', 1], ['do 7/mi', 'V6/5', 'D', 3]] },
    ],
    notes: [
      'Même harmonie qu’aux mesures 1-2 : seule la mélodie change, variée en triolets (trois croches par temps).',
      'Mesure 27 : mi♮ – sol – fa entourent le fa (broderies) ; mesure 28 : si♮, broderie de do.',
    ],
  }],
  [OP55.e5b, {
    key: 'fa mineur',
    bars: [
      { m: 43, ch: [['fa m', 'i', 'T', 1], ['mi♭/sol', 'VII6', '', 3]] },
      { m: 44, ch: [['la♭', 'III', 'T', 1], ['do 7/mi', 'V6/5', 'D', 3]] },
    ],
    notes: [
      'Mesure 44 : le septolet (sept notes dans un temps) orne l’accord de la♭ ; l’harmonie reste celle des mesures 27-28.',
      'La main gauche ne bouge pas pendant l’ornement : c’est elle qui garde le temps.',
    ],
  }],
  [OP55.e6, {
    key: 'fa mineur → do mineur (Più mosso)',
    bars: [
      { m: 48, ch: [['fa m', 'i', 'T', 1], ['do 7 orné', 'V7', 'D', 2]] },
      { m: 49, ch: [['fa m', 'i', 'T', 1], ['sol ø7/fa', 'iiø7', 'SD', 4]] },
      { m: 50, ch: [['fa m', 'i', 'T', 1], ['do 7 orné', 'V7', 'D', 2]] },
      { m: 51, ch: [['do m/sol', 'i6/4 de do m', 'D', 1], ['sol 7', 'V7 de do m', 'D', 4]] },
      { m: 52, ch: [['do m', 'i de do m', 'T', 1], ['sol orné', 'V de do m', 'D', 3]] },
    ],
    notes: [
      'Le Più mosso est une marche modulante : la même formule en fa mineur (mesures 49-50), puis en do mineur (51-52), puis en sol mineur (55-56).',
      'Les triolets d’octaves de la main gauche dessinent la dominante (do 7, puis sol), avec des broderies chromatiques.',
      'Chaque tonalité a sa sensible : mi♮ en fa mineur, si♮ en do mineur, fa♯ en sol mineur.',
    ],
  }],
  [OP55.e7, {
    key: 'fa mineur',
    bars: [
      { m: 57, ch: [['mi °7', 'vii°7', 'D', 1]] },
      { m: 58, ch: [['fa m', 'i', 'T', 1]] },
      { m: 59, ch: [['sol ø7', 'iiø7', 'SD', 1], ['mi °7/sol', 'vii°7', 'D', 3]] },
      { m: 60, ch: [['fa m/la♭', 'i6', 'T', 1]] },
    ],
    notes: [
      'Mesures 57 et 59 : la septième diminuée (mi – sol – si♭ – ré♭), la dominante la plus tendue de fa mineur.',
      'Le chant est à deux voix : la voix inférieure descend si♭ – la♭ – sol – fa (mesure 58).',
      'Ré♭ – do – ré♭, ré♭ – mi♭ – ré♭ : des broderies qui ornent la mélodie comme une vocalise.',
    ],
  }],
  [OP55.e8, {
    key: 'fa mineur',
    bars: [
      { m: 69, ch: [['ré♭ fa la♭ do♭', 'sixte augm.', 'SD', 1]] },
      { m: 70, ch: [['(même accord)', '', 'SD', 1]] },
    ],
    notes: [
      'Ré♭ – fa – la♭ – do♭ s’écrit comme une septième de dominante, mais il se résout sur do (mesure 71) : c’est une sixte augmentée (allemande), notée autrement.',
      'Les traits descendent par degrés, avec des notes chromatiques (do♭, mi♮, si♮) : travaille-les par groupes de quatre notes.',
    ],
  }],
  [OP55.e9, {
    key: 'fa mineur (coda)',
    bars: [
      { m: 77, ch: [['fa m', 'i', 'T', 1], ['fa 7', 'V7/iv', 'D', 4]] },
      { m: 78, ch: [['si♭ m', 'iv', 'SD', 1], ['do 7', 'V7', 'D', 3]] },
      { m: 79, ch: [['ré♭', 'VI', 'T', 1], ['si♭ m', 'iv', 'SD', 3]] },
      { m: 80, ch: [['fa m/do', 'i6/4', 'D', 1], ['do', 'V', 'D', 3]] },
    ],
    notes: [
      'Un enchaînement complet : tonique, sous-dominante, dominante, puis ré♭ (VI) qui remplace la tonique, sous-dominante, 6/4 de cadence et dominante.',
      'Mesure 79 : la mélodie descend par demi-tons (si𝄫 – la♭ – la𝄫 – sol♭ – fa). Chopin écrit si𝄫 et la𝄫 plutôt que la♮ et sol♮ : c’est l’orthographe d’une ligne chromatique descendante.',
    ],
  }],
  [OP55.e10, {
    key: 'fa majeur (fin)',
    bars: [
      { m: 97, ch: [['fa', 'I', 'T', 1]] },
      { m: 98, ch: [['sol ø7/si♭', 'iiø6/5', 'SD', 1], ['do 7', 'V7', 'D', 3]] },
      { m: 99, ch: [['fa', 'I', 'T', 1]] },
      { m: 100, ch: [['fa', 'I', 'T', 1]] },
      { m: 101, ch: [['fa', 'I', 'T', 1]] },
    ],
    notes: [
      'Cadence finale : iiø6/5 – V7 – I. L’accord de la mesure 98 (si♭ – ré♭ – fa – sol) vient de fa mineur : une dernière ombre avant fa majeur.',
      'Tierce picarde : la pièce, en mineur, s’achève sur l’accord majeur (la♮).',
      'Les accords arpégés s’égrènent du grave à l’aigu, la basse avec le temps.',
    ],
  }],
  [OP15.e1, AN.op15_1_8],
  [OP15.e2, {
    key: 'fa majeur',
    bars: [
      { m: 17, ch: [['mi♭ 7', '♭VII7', '', 1]] },
      { m: 18, ch: [['mi♭ sol la do♯', 'sixte augm.', 'SD', 1], ['ré 7', 'V7/ii', 'D', 2], ['sol 7/ré', 'V7/V', 'D', 3]] },
      { m: 19, ch: [['do (4-3)', 'V7', 'D', 1]] },
      { m: 20, ch: [['fa', 'I', 'T', 1], ['si °7', 'vii°7/V', 'D', 2]] },
      { m: 21, ch: [['do (4-3)', 'V7', 'D', 1]] },
      { m: 22, ch: [['fa', 'I', 'T', 1]] },
      { m: 23, ch: [['si♭/fa', 'IV', 'SD', 1], ['do 7/fa', 'V7', 'D', 2]] },
      { m: 24, ch: [['sol m7/fa', 'ii7', 'SD', 1], ['do 7', 'V7', 'D', 2]] },
    ],
    notes: [
      'Mesure 18 : mi♭ – sol – la – do♯, une sixte augmentée (française) qui s’ouvre sur ré 7, puis sol 7 : une chaîne de dominantes qui mène à do.',
      'Mesure 20 : le sommet (ré aigu) sur une septième diminuée (si – ré – fa – la♭), puis la fioriture dolcissimo.',
      'Mesures 22-24 : le thème revient et s’arrête sur V7, suivi d’un silence : la suspension avant le Con fuoco.',
    ],
  }],
  [OP15.e3, {
    key: 'fa mineur (Con fuoco)',
    bars: [
      { m: 25, ch: [['fa m', 'i', 'T', 1]] },
      { m: 26, ch: [['si♭ m7', 'iv7', 'SD', 1]] },
      { m: 27, ch: [['sol ø7', 'iiø7', 'SD', 1]] },
      { m: 28, ch: [['do ø7', 'iiø7 de si♭ m', 'SD', 1], ['la °7', 'vii°7 de si♭ m', 'D', 3]] },
    ],
    notes: [
      'Fa mineur, tonalité homonyme de fa majeur (même tonique, autre mode), attaquée sans transition après le silence de la mesure 24.',
      'Une harmonie par mesure, que la main droite répète en doubles notes (rotation) pendant que la main gauche file en gammes.',
      'Mesure 28 : do ø7 et la °7 préparent si♭ mineur et ré♭ (mesure 29).',
    ],
  }],
  [OP15.e4, {
    key: 'vers ré♭ majeur, sur une pédale de ré♭',
    bars: [
      { m: 29, ch: [['fa/ré♭', 'V de si♭ m', '', 1], ['si♭ m/ré♭', 'iv6', 'SD', 2], ['ré♭ 7', 'V7 de sol♭', 'D', 3]] },
      { m: 30, ch: [['ré♭ 7', 'V7 de sol♭', 'D', 1], ['sol♭ (sus4)/ré♭', '', '', 2], ['ré♭ 7', 'V7 de sol♭', 'D', 3]] },
      { m: 31, ch: [['sol♭', 'IV de ré♭', 'SD', 1]] },
      { m: 32, ch: [['mi♭ m7/ré♭', 'ii7 de ré♭', 'SD', 1], ['ré♭', 'I de ré♭', 'T', 2]] },
    ],
    notes: [
      'La mélodie passe à la main gauche, au ténor (do – ré♭ – si♭ – la♭), au-dessus d’une longue pédale de ré♭ : c’est elle qui doit chanter.',
      'Mesure 29 : fa majeur (avec la♮), puis si♭ mineur, puis ré♭ 7, écrit avec do♭.',
      'On arrive en ré♭ majeur, la tonalité bâtie sur le 6e degré de fa mineur.',
    ],
  }],
  [OP15.e5, {
    key: 'fa majeur (reprise)',
    bars: [
      { m: 53, ch: [['sol 7/ré', 'V7/V', 'D', 1], ['sol ø7/ré♭', 'iiø7', 'SD', 2], ['do 7', 'V7', 'D', 3]] },
      { m: 54, ch: [['fa/do', 'I', 'T', 1], ['si ø7', 'iiø7/iii', 'SD', 2]] },
      { m: 55, ch: [['mi 7/si', 'V7/iii', 'D', 1], ['la m', 'iii', 'T', 2], ['si ø7', 'iiø7/iii', 'SD', 3]] },
    ],
    notes: [
      'Même harmonie qu’aux mesures 5 à 7 : la reprise garde l’harmonie et orne la mélodie.',
      'Mesure 54 : le septolet (sept notes dans un temps) brode autour de ré, comme une vocalise improvisée.',
    ],
  }],
  [OP15.e6, {
    key: 'fa mineur, vers ré♭ et mi♭ mineur',
    bars: [
      { m: 41, ch: [['la♭ 7', 'V7 de ré♭', 'D', 1]] },
      { m: 42, ch: [['la♭ 7', 'V7 de ré♭', 'D', 1]] },
      { m: 43, ch: [['si♭ 7', 'V7 de mi♭ m', 'D', 1]] },
      { m: 44, ch: [['si♭ 7', 'V7 de mi♭ m', 'D', 1]] },
    ],
    notes: [
      'La mélodie est au grave, en partie en octaves : la main gauche chante, la main droite accompagne en doubles notes.',
      'Deux dominantes successives, un ton plus haut chaque fois : la♭ 7 (vers ré♭), puis si♭ 7 (vers mi♭ mineur).',
      'Mesures 42 et 44 : la basse brode (si♮ – do – la♭ ; do♯ – ré – si♭) avant de se poser.',
    ],
  }],
  [CLAIR.e1, {
    key: 'ré♭ majeur (5 bémols)',
    bars: [
      { m: 1, ch: [['ré♭ (sans basse)', 'I', 'T', 1]] },
      { m: 2, ch: [['do °7 (si𝄫)', 'vii°7', 'D', 1]] },
      { m: 3, ch: [['si♭ m7', 'vi7', 'T', 1]] },
      { m: 4, ch: [['la♭ 7/mi♭', 'V4/3', 'D', 1]] },
    ],
    notes: [
      'Pas de basse au début : des tierces qui flottent, aux deux mains. La tonique ré♭ n’arrive à la basse qu’à la mesure 9.',
      'Mesure 2 : sol♭ – si𝄫 à la main gauche, do – mi♭ à la main droite : une septième diminuée (do – mi♭ – sol♭ – si𝄫), avec le si𝄫 emprunté au mode mineur. Les ré♭ – fa de la 1re et de la 3e croche sont des appoggiatures.',
      'Mesure 4 : mi♭ – sol♭ sous la♭ – do : la♭ 7, la dominante, avec mi♭ à la basse ; mi♭ m7 ne fait que passer (1re et 3e croches).',
      'Les tierces de la main gauche descendent lentement (fa–la♭, sol♭–si𝄫, fa–la♭, mi♭–sol♭).',
    ],
  }],
  [CLAIR.e2, {
    key: 'ré♭ majeur, sur une pédale de mi♭',
    bars: [
      { m: 15, ch: [['mi♭ m (+ fa)', 'ii', 'SD', 1], ['sol♭/ré♭', 'IV6/4', 'SD', 3]] },
      { m: 16, ch: [['sol♭/ré♭', 'IV6/4', 'SD', 1], ['do – sol♭ – si♭', 'passage', '', 2], ['sol♭/si♭', 'IV6', 'SD', 3]] },
      { m: 17, ch: [['mi♭ m (+ fa)', 'ii', 'SD', 1]] },
      { m: 18, ch: [['sol♭/ré♭', 'IV6/4', 'SD', 1], ['do – sol♭ – si♭', 'passage', '', 2], ['mi♭ m/si♭', 'ii6/4', 'SD', 3]] },
    ],
    notes: [
      'Une pédale de mi♭ au grave ; au-dessus, les accords glissent en parallèle : les deux mains se déplacent ensemble, comme un seul bloc.',
      'Mi♭ mineur (ii) et sol♭ majeur (IV) alternent : deux couleurs de sous-dominante, sans vraie tension.',
      'Duolets : deux valeurs égales dans le temps de trois croches (1er temps des mesures 15 et 17 : un silence puis un accord ; 2e temps des mesures 16 et 18 : deux accords).',
    ],
  }],
]);
