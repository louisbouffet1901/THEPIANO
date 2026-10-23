// Répertoire « Jouer d'oreille » (V7.3) : des mélodies du domaine public, de la plus simple à la plus difficile, et les
// thèmes de tes pièces (relevés sur les partitions vérifiées de content-excerpts.js).
// Écriture des mélodies, en degrés de la tonalité : « 5 » = 5e degré à l'octave de la tonique, « 5, » une octave plus
// bas, « 1' » une octave plus haut ; « #4 » / « b7 » = degré haussé / abaissé ; « :2 » = durée en noires (1 par
// défaut) ; « r » = silence ; « ~ » = liée à la note suivante ; « | » = barre de mesure (chaque mesure est vérifiée).
// En mineur, les degrés suivent la gamme mineure naturelle (la sensible s'écrit « #7 »).
// Accords : un par mesure (« I-V » = deux accords dans la mesure, « - » = rien) ; pickupChord pour la levée.
// cut : la phrase commence autant de noires avant la barre (levée), phrases : longueur des phrases en mesures.

export const MELODY_LEVELS = [
  { id: 1, title: 'Notes voisines', intro: 'Des mélodies qui avancent surtout par degrés voisins, sur cinq ou six notes.' },
  { id: 2, title: 'Des sauts dans l’accord', intro: 'Des sauts de tierce, de quinte, d’octave : l’oreille les rattache aux notes de l’accord.' },
  { id: 3, title: 'Des thèmes plus longs', intro: 'Seize mesures, des croches, des rythmes pointés : la mémoire travaille autant que l’oreille.' },
  { id: 4, title: 'Les thèmes de tes pièces', intro: 'Le début de tes nocturnes, d’oreille : tu les joueras ensuite en les entendant d’avance.' },
];

export const MELODIES = [
  {
    id: 'clair-lune', title: 'Au clair de la lune', src: 'chanson traditionnelle française', level: 1,
    key: 'C', tonic: 60, mode: 'maj', meter: '4/4', bpm: 96, cut: 0, phrases: [4, 4, 4, 4],
    notes: '1 1 1 2 | 3:2 2:2 | 1 3 2 2 | 1:4 | 1 1 1 2 | 3:2 2:2 | 1 3 2 2 | 1:4 | 2 2 2 2 | 6,:2 6,:2 | 2 1 7, 6, | 5,:4 | 1 1 1 2 | 3:2 2:2 | 1 3 2 2 | 1:4',
    chords: 'I I-V I-V I | I I-V I-V I | V ii V V | I I-V I-V I',
  },
  {
    id: 'frere-jacques', title: 'Frère Jacques', src: 'canon traditionnel', level: 1,
    key: 'C', tonic: 60, mode: 'maj', meter: '4/4', bpm: 100, cut: 0, phrases: [2, 2, 2, 2],
    notes: '1 2 3 1 | 1 2 3 1 | 3 4 5:2 | 3 4 5:2 | 5:0.5 6:0.5 5:0.5 4:0.5 3 1 | 5:0.5 6:0.5 5:0.5 4:0.5 3 1 | 1 5, 1:2 | 1 5, 1:2',
    chords: 'I I I I I I I I',
  },
  {
    id: 'agneau', title: 'Marie avait un agneau', src: 'comptine anglaise (Mary Had a Little Lamb, vers 1830)', level: 1,
    key: 'C', tonic: 60, mode: 'maj', meter: '4/4', bpm: 100, cut: 0, phrases: [4, 4],
    notes: '3 2 1 2 | 3 3 3:2 | 2 2 2:2 | 3 5 5:2 | 3 2 1 2 | 3 3 3 3 | 2 2 3 2 | 1:4',
    chords: 'I I V I I I V I',
  },
  {
    id: 'ode-joie', title: 'L’Ode à la joie', src: 'Beethoven, Neuvième symphonie (1824), version simplifiée', level: 1,
    key: 'D', tonic: 62, mode: 'maj', meter: '4/4', bpm: 100, cut: 0, phrases: [4, 4, 4, 4],
    notes: '3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3:1.5 2:0.5 2:2 | 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 2:1.5 1:0.5 1:2 | 2 2 3 1 | 2 3:0.5 4:0.5 3 1 | 2 3:0.5 4:0.5 3 2 | 1 2 5,:2 | 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 2:1.5 1:0.5 1:2',
    chords: 'I V I V | I V I V-I | V-I V-I V7 I-V | I V I V-I',
  },
  {
    id: 'vive-le-vent', title: 'Vive le vent (le refrain)', src: 'J. Pierpont, Jingle Bells (1857)', level: 1,
    key: 'G', tonic: 67, mode: 'maj', meter: '4/4', bpm: 112, cut: 0, phrases: [4, 4, 4, 4],
    notes: '3 3 3:2 | 3 3 3:2 | 3 5 1:1.5 2:0.5 | 3:4 | 4 4 4:1.5 4:0.5 | 4 3 3 3:0.5 3:0.5 | 3 2 2 3 | 2:2 5:2 | 3 3 3:2 | 3 3 3:2 | 3 5 1:1.5 2:0.5 | 3:4 | 4 4 4 4 | 4 3 3 3:0.5 3:0.5 | 5 5 4 2 | 1:4',
    chords: 'I I I I | IV I II7 V7 | I I I I | IV I V7 I',
  },
  {
    id: 'canon', title: 'Le Canon de Pachelbel (le thème)', src: 'J. Pachelbel, Canon en ré (vers 1680)', level: 1,
    key: 'D', tonic: 62, mode: 'maj', meter: '4/4', bpm: 56, cut: 0, phrases: [2, 2, 2, 2],
    notes: "3':2 2':2 | 1':2 7:2 | 6:2 5:2 | 6:2 7:2 | 1':2 7:2 | 6:2 5:2 | 4:2 3:2 | 4:2 2:2",
    chords: 'I-V vi-iii IV-I IV-V I-V vi-iii IV-I IV-V',
  },
  {
    id: 'ah-vous-dirai-je', title: 'Ah ! vous dirai-je, maman', src: 'air populaire, varié par Mozart (K. 265)', level: 2,
    key: 'C', tonic: 60, mode: 'maj', meter: '4/4', bpm: 96, cut: 0, phrases: [4, 4, 4],
    notes: '1 1 5 5 | 6 6 5:2 | 4 4 3 3 | 2 2 1:2 | 5 5 4 4 | 3 3 2:2 | 5 5 4 4 | 3 3 2:2 | 1 1 5 5 | 6 6 5:2 | 4 4 3 3 | 2 2 1:2',
    chords: 'I IV-I IV-I V-I | I-V7 I-V I-V7 I-V | I IV-I IV-I V-I',
  },
  {
    id: 'anniversaire', title: 'Joyeux anniversaire', src: 'M. et P. Hill, Good Morning to All (1893)', level: 2,
    key: 'C', tonic: 60, mode: 'maj', meter: '3/4', bpm: 104, cut: 1, phrases: [2, 2, 2, 2],
    notes: '5,:0.75 5,:0.25 | 6, 5, 1 | 7,:2 5,:0.75 5,:0.25 | 6, 5, 2 | 1:2 5,:0.75 5,:0.25 | 5 3 1 | 7, 6, 4:0.75 4:0.25 | 3 1 2 | 1:2',
    chords: 'I V V I I IV I-V I', pickupChord: 'V',
  },
  {
    id: 'rame', title: 'Rame, rame, rame doucement', src: 'canon anglais (Row, Row, Row Your Boat, 1852)', level: 2,
    key: 'C', tonic: 60, mode: 'maj', meter: '6/8', bpm: 60, cut: 0, phrases: [2, 2, 2, 2],
    notes: "1:1.5 1:1.5 | 1 2:0.5 3:1.5 | 3 2:0.5 3 4:0.5 | 5:3 | 1':0.5 1':0.5 1':0.5 5:0.5 5:0.5 5:0.5 | 3:0.5 3:0.5 3:0.5 1:0.5 1:0.5 1:0.5 | 5 4:0.5 3 2:0.5 | 1:3",
    chords: 'I I I I I I V7 I',
  },
  {
    id: 'largo', title: 'Le Largo du Nouveau Monde', src: 'Dvořák, Neuvième symphonie (1893)', level: 2,
    key: 'Db', tonic: 61, mode: 'maj', meter: '4/4', bpm: 54, cut: 0, phrases: [4, 4],
    notes: '3:1.5 5:0.5 5:2 | 3:1.5 2:0.5 1:2 | 2 3 5 3 | 2:4 | 3:1.5 5:0.5 5:2 | 3:1.5 2:0.5 1:2 | 2 3 2 1 | 1:4',
    chords: 'I I V V I I V I',
  },
  {
    id: 'petite-musique', title: 'Une petite musique de nuit (le début)', src: 'Mozart, Sérénade K. 525 (1787)', level: 2,
    key: 'G', tonic: 67, mode: 'maj', meter: '4/4', bpm: 108, cut: 0, phrases: [2, 2],
    notes: '1 r:0.5 5,:0.5 1 r:0.5 5,:0.5 | 1:0.5 5,:0.5 1:0.5 3:0.5 5:2 | 4 r:0.5 2:0.5 4 r:0.5 2:0.5 | 4:0.5 2:0.5 7,:0.5 2:0.5 5,:2',
    chords: 'I I V7 V7',
  },
  {
    id: 'menuet-sol', title: 'Le Menuet en sol', src: 'C. Petzold, Petit Livre d’Anna Magdalena Bach (1725)', level: 3,
    key: 'G', tonic: 67, mode: 'maj', meter: '3/4', bpm: 100, cut: 0, phrases: [4, 4, 4, 4],
    notes: "5 1:0.5 2:0.5 3:0.5 4:0.5 | 5 1 1 | 6 4:0.5 5:0.5 6:0.5 7:0.5 | 1' 1 1 | 4 5:0.5 4:0.5 3:0.5 2:0.5 | 3 4:0.5 3:0.5 2:0.5 1:0.5 | 7, 1:0.5 2:0.5 3:0.5 1:0.5 | 2:3 | 5 1:0.5 2:0.5 3:0.5 4:0.5 | 5 1 1 | 6 4:0.5 5:0.5 6:0.5 7:0.5 | 1' 1 1 | 4 5:0.5 4:0.5 3:0.5 2:0.5 | 3 4:0.5 3:0.5 2:0.5 1:0.5 | 2 3:0.5 2:0.5 1:0.5 7,:0.5 | 1:3",
    chords: 'I I IV I | IV I V V | I I IV I | IV I V7 I',
  },
  {
    id: 'douce-nuit', title: 'Douce nuit', src: 'F. Gruber, Stille Nacht (1818)', level: 3,
    key: 'C', tonic: 60, mode: 'maj', meter: '6/8', bpm: 50, cut: 0, phrases: [2, 2, 2, 2, 2, 2],
    notes: "5:0.75 6:0.25 5:0.5 3:1.5 | 5:0.75 6:0.25 5:0.5 3:1.5 | 2':1 2':0.5 7:1.5 | 1':1 1':0.5 5:1.5 | 6:1 6:0.5 1':0.75 7:0.25 6:0.5 | 5:0.75 6:0.25 5:0.5 3:1.5 | 6:1 6:0.5 1':0.75 7:0.25 6:0.5 | 5:0.75 6:0.25 5:0.5 3:1.5 | 2':1 2':0.5 4':0.75 2':0.25 7:0.5 | 1':1.5 3':1.5 | 1':0.75 5:0.25 3:0.5 5:0.75 4:0.25 2:0.5 | 1:3",
    chords: 'I I V7 I IV I IV I V7 I I-V7 I',
  },
  {
    id: 'op55-theme', title: 'Nocturne op. 55 n° 1, le thème', src: 'Chopin, mesures 0 à 4 (ta pièce du niveau 1)', level: 4,
    key: 'Fm', tonic: 65, mode: 'min', meter: '4/4', bpm: 54, cut: 1, phrases: [2, 2],
    excerpt: { set: 'OP55', key: 'e1', bars: 4 },
  },
  {
    id: 'op15-theme', title: 'Nocturne op. 15 n° 1, le début', src: 'Chopin, mesures 0 à 4 (ta pièce du niveau 2)', level: 4,
    key: 'F', tonic: 65, mode: 'maj', meter: '3/4', bpm: 58, cut: 1, phrases: [2, 2],
    excerpt: { set: 'OP15', key: 'e1', bars: 4 },
  },
];
