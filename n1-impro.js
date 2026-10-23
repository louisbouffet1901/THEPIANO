// Niveau 1 — Improvisation (V5.1, V7.4) : une idée nouvelle par leçon, travaillée en exercices progressifs (W.paliers).
// 1. le motif  2. question et réponse  3. les notes de l'accord  4. ta main gauche (V7.4)  5. passages et broderies
// 6. l'appoggiature (le soupir)  7. une mélodie connue : l'harmoniser, la varier (V7.4)  8. style : la romance en arpèges
// mineurs (Liszt)  9. style : le nocturne, sur les harmonies de l'op. 55  10. la période.
// V7.4 : à deux mains (l'accompagnateur s'efface par étapes : hands), notes en or de mémoire (gold: 'memo').
// Chaque leçon : l'essentiel en tête, la boîte à outils, « pourquoi ça marche » (avec une écoute comparée), un modèle
// phrasé, puis les exercices (W.paliers : une seule nouveauté par exercice, vérifiée au piano), les erreurs fréquentes.
// Les exemples sont écrits par tools/impro_examples.py : chaque note des temps forts y est vérifiée contre l'accord.
import { OP55 } from './content-excerpts.js';

const EX_MOTIF = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^motif"^c2 c2 ^d4 | "^répété"^c2 c2 ^d4 | "^déplacé"^f2 f2 ^g4 | "^réponse"^g2 ^f2 ^d4 | "^motif"^c2 c2 ^d4 | "^varié"^c c c2 ^d4 | "^sommet"^g2 ^a2 g2 ^d2 | "^fin"^c2 ^d2 ^f4 |]
[V:LH] ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 |]`;
const EX_QR_PENTA = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^question"A2 c2 d4 | e2 d2 e4 | "^réponse"A2 c2 d4 | d2 c2 A4 | "^question"e3 d c4 | d3 e g4 | "^réponse"e3 d c4 | d3 c A4 |]
[V:LH] A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 |]`;
const EX_ACCORDS = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^squelette : une note de l’accord par mesure"e8 | f8 | d8 | c8 | "^habillé : le squelette reste au 1er temps"e4 g2 e2 | f4 a2 f2 | d2 f2 B4 | c8 |]
[V:LH] "_I"C,2 [G,CE]2 G,,2 [G,CE]2 | "_IV"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_V7"G,,2 [F,G,B,D]2 D,,2 [F,G,B,D]2 | "_I"C,2 [G,CE]2 G,,2 [G,CE]2 | "_I"C,2 [G,CE]2 G,,2 [G,CE]2 | "_IV"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_V7"G,,2 [F,G,B,D]2 D,,2 [F,G,B,D]2 | "_I"C,2 [G,CE]2 G,,2 [G,CE]2 |]`;
const EX_SQUELETTE = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^mi"e8 | "^fa"f8 | "^si"B8 | "^do"c8 | "^do"c8 | "^ré"d8 | "^si"B8 | "^la"A8 |]
[V:LH] "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_VI"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 |]`;
const EX_PASSAGES = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^notes de passage (2e et 4e temps)"e2 d2 c2 d2 | f2 e2 d2 c2 | B2 c2 d2 B2 | c2 B2 A4 |]
[V:LH] "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 |]`;
const EX_BRODERIES = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^broderies et passages en croches"e f e d c B c d | f g f e d e d c | B c B A ^G A B d | c B A ^G A4 |]
[V:LH] "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 |]`;
const EX_SOUPIRS = `X:1
M:4/4
L:1/8
K:Em
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^app."c4 B2 A2 | "^app."d4 c2 B2 | "^app."B4 A2 c2 | "^app."e4 ^d4 | "^app."f4 e2 B2 | "^app."d4 c2 A2 | "^app."c4 B2 A2 | "^app."F2 E6 |]
[V:LH] "_i"(3E,,B,,E, (3G,E,B,, (3E,,B,,E, (3G,E,B,, | "_VI"(3C,,G,,C, (3E,C,G,, (3C,,G,,C, (3E,C,G,, | "_iv"(3A,,E,A, (3CA,E, (3A,,E,A, (3CA,E, | "_V7"(3B,,,F,,A,, (3^D,A,,F,, (3B,,,F,,A,, (3D,A,,F,, | "_i"(3E,,B,,E, (3G,E,B,, (3E,,B,,E, (3G,E,B,, | "_iv"(3A,,E,A, (3CA,E, (3A,,E,A, (3CA,E, | "_V7"(3B,,,F,,A,, (3^D,A,,F,, (3B,,,F,,A,, (3D,A,,F,, | "_i"(3E,,B,,E, (3G,E,B,, (3E,,B,,E, (3G,E,B,, |]`;
const EX_ROMANCE = `X:1
M:3/4
L:1/8
K:Em
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] B4 G2 | c3 B A2 | G2 B2 e2 | "^suspension"f4 ^d2 | g3 f e2 | "^soupir"d2 c2 A2 | B3 A F2 | "^conclusion"E6 |]
[V:LH] "_i"E,, B,, E, G, B, G, | "_iv"A,, E, A, C E C | "_i"E,, B,, E, G, B, G, | "_V"B,,, F,, B,, ^D, F, D, | "_VI"C,, G,, C, E, G, E, | "_iv"A,,, E,, A,, C, E, C, | "_V7"B,,, F,, A,, ^D, F, D, | "_i"E,, B,, E, G, B, G, |]`;
const EX_ROMANCE_MG = `X:1
M:3/4
L:1/8
K:Em
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] z6 | z6 | z6 | z6 | z6 | z6 | z6 | z6 |]
[V:LH] "_i"E,, B,, E, G, B, G, | "_iv"A,, E, A, C E C | "_i"E,, B,, E, G, B, G, | "_V"B,,, F,, B,, ^D, F, D, | "_VI"C,, G,, C, E, G, E, | "_iv"A,,, E,, A,, C, E, C, | "_V7"B,,, F,, A,, ^D, F, D, | "_i"E,, B,, E, G, B, G, |]`;
const EX_NOCT_SQ = `X:1
M:4/4
L:1/8
K:Fm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^un autre squelette"A4 B4 | c4 B4 | A4 G4 | A4 G4 |]
[V:LH] "_i  VII6"F,,2 [A,CF]2 G,,2 [E,B,E]2 | "_III  V6/5"A,,2 [CA]2 =E,,2 [B,CG]2 | "_i  VII6"F,,2 [A,CF]2 G,,2 [E,B,E]2 | "_III  V6/5"A,,2 [CA]2 =E,,2 [B,CG]2 |]`;
const EX_NOCT_HAB = `X:1
M:4/4
L:1/8
K:Fm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^habillé : broderies (sol, si♮), passages"A2 G2 B2 A2 | c2 =B c _B4 | A2 F2 G4 | A3 B G2 =E2 |]
[V:LH] F,,2 [A,CF]2 G,,2 [E,B,E]2 | A,,2 [CA]2 =E,,2 [B,CG]2 | F,,2 [A,CF]2 G,,2 [E,B,E]2 | A,,2 [CA]2 =E,,2 [B,CG]2 |]`;
const EX_PERIODE = `X:1
M:4/4
L:1/8
K:Fm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^question (antécédent)"c4 f2 e2 | d3 c B4 | A2 c2 f2 e2 | "^demi-cadence"c6 z2 | "^réponse (conséquent)"c4 f2 e2 | d3 c B2 f2 | "^sommet"g3 f =e4 | "^cadence parfaite"f6 z2 |]
[V:LH] "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_iv"B,,2 [F,B,D]2 F,,2 [F,B,D]2 | "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_V"C,,2 [G,C=E]2 C,,2 [G,CE]2 | "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_iv"B,,2 [F,B,D]2 F,,2 [F,B,D]2 | "_V7"C,,2 [G,B,C=E]2 C,,2 [G,B,CE]2 | "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 |]`;

// V7.4 : ta main gauche (accords au plus près, quatre formules) ; une mélodie connue variée trois fois
const EX_MG_PRES = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^à l’état fondamental : la main saute"z4 | z4 | z4 | z4 | "^au plus près : la main reste en place"z4 | z4 | z4 | z4 |]
[V:LH] "_I"[C,E,G,]4 | "_IV"[F,A,C]4 | "_V7"[G,B,DF]4 | "_I"[C,E,G,]4 | "_I"[C,E,G,]4 | "_IV"[C,F,A,]4 | "_V7"[B,,F,G,]4 | "_I"[C,E,G,]4 |]`;
const EX_MG_FORMULES = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^basse et accord"z8 | z8 | z8 | z8 | "^arpège"z8 | z8 | z8 | z8 | "^Alberti"z8 | z8 | z8 | z8 |]
[V:LH] "_I"C,,2 [C,E,G,]2 C,,2 [C,E,G,]2 | "_IV"F,,2 [C,F,A,]2 F,,2 [C,F,A,]2 | "_V7"G,,2 [B,,F,G,]2 G,,2 [B,,F,G,]2 | "_I"C,,2 [C,E,G,]2 C,,2 [C,E,G,]2 | "_I"C,, C, E, G, C,, C, E, G, | "_IV"F,, C, F, A, F,, C, F, A, | "_V7"G,, B,, F, G, G,, B,, F, G, | "_I"C,, C, E, G, C,, C, E, G, | "_I"C, G, E, G, C, G, E, G, | "_IV"C, A, F, A, C, A, F, A, | "_V7"B,, G, F, G, B,, G, F, G, | "_I"C, G, E, G, [C,E,G,]4 |]`;
const EX_MG_VALSE = `X:1
M:3/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^la valse"z3 | z3 | z3 | z3 |]
[V:LH] "_I"C,, [C,E,G,] [C,E,G,] | "_IV"F,, [C,F,A,] [C,F,A,] | "_V7"G,, [B,,F,G,] [B,,F,G,] | "_I"C,, [C,E,G,] [C,E,G,] |]`;
const EX_AHVOUS_VAR = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^1. le rythme"C3 C G3 G | A3 A G4 | F3 F E3 E | D3 D C4 | "^2. les ornements"C D C B, C E G A | A B A G G F E G | F G F E E F E D | D E D B, C4 | "^3. le mineur"C2 C2 G2 G2 | _A2 A2 G4 | F2 F2 _E2 E2 | D2 D2 C4 |]
[V:LH] "_I"C,,2 [C,E,G,]2 C,,2 [C,E,G,]2 | "_IV  I"F,,2 [C,F,A,]2 C,,2 [C,E,G,]2 | "_IV  I"F,,2 [C,F,A,]2 C,,2 [C,E,G,]2 | "_V  I"G,,2 [B,,D,G,]2 C,,2 [C,E,G,]2 | "_I"C,,2 [C,E,G,]2 C,,2 [C,E,G,]2 | "_IV  I"F,,2 [C,F,A,]2 C,,2 [C,E,G,]2 | "_IV  I"F,,2 [C,F,A,]2 C,,2 [C,E,G,]2 | "_V  I"G,,2 [B,,D,G,]2 C,,2 [C,E,G,]2 | "_i"C,,2 [C,_E,G,]2 C,,2 [C,E,G,]2 | "_iv  i"F,,2 [C,F,_A,]2 C,,2 [C,_E,G,]2 | "_iv  i"F,,2 [C,F,_A,]2 C,,2 [C,_E,G,]2 | "_V  i"G,,2 [B,,D,G,]2 C,,2 [C,_E,G,]2 |]`;

// Phrasé des exemples : nuances (main droite) et respiration (carte de tempo), en noires depuis le début
const PH_ROMANCE = {
  dyn: { rh: [[0, 0.8], [6, 1.0], [9, 1.14], [11.5, 0.95], [12, 0.82], [13, 1.16], [15, 1.02], [18, 0.88], [21, 0.8], [24, 0.7]], lh: [[0, 0.72], [24, 0.62]] },
  tempoMap: [[0, 1], [9, 1.03], [11.2, 0.86], [12, 1], [13, 0.97], [20, 1], [22.5, 0.86], [24, 0.72]],
};
const PH_PERIODE = {
  dyn: { rh: [[0, 0.82], [4, 1.02], [6, 0.96], [12, 0.86], [16, 0.8], [20, 0.95], [24, 1.18], [26, 1.04], [28, 0.86], [32, 0.76]], lh: [[0, 0.75], [32, 0.65]] },
  tempoMap: [[0, 1], [13, 1], [15.5, 0.86], [16, 1], [24, 0.98], [28, 0.95], [31, 0.8], [32, 0.7]],
};

// Main gauche des micro-écoutes (notation française : do3 = do central)
const OST_FA = 'fa♯1 | do♯2 | fa♯2 | do♯2 | fa♯1 | do♯2 | fa♯2 | do♯2 | fa♯1 | do♯2 | fa♯2 | do♯2 | fa♯1 | do♯2 | fa♯2 | do♯2';
const OST_LA = 'la1 | mi2 | la2 | mi2 | la1 | mi2 | la2 | mi2';
const GRILLE_DO = 'do2 sol2 mi3:4 | fa1 do2 la2:4 | sol1 fa2 si2:4 | do2 sol2 mi3:4';

export default [
  /* ================================================================ 1 */
  {
    id: 'n1-im-lancer', minutes: 15,
    title: 'Le motif : improviser avec trois notes',
    summary: 'Une pulsation qui ne s’arrête pas, une petite idée rythmique, des silences, et des touches noires où aucune note n’est fausse.',
    essentials: [
      'Improviser, c’est inventer <b>sans t’arrêter</b> : la pulsation passe avant la beauté des notes.',
      'Un <b>motif</b> (3 ou 4 notes, un rythme reconnaissable) suffit pour faire de la musique : on le <b>répète</b>, on le <b>déplace</b>, on le <b>varie</b>.',
      'Les <b>silences</b> font partie de la phrase : ils la rendent lisible.',
    ],
    goals: ['Tenir deux minutes sans t’arrêter.', 'Construire huit mesures avec un seul motif, et faire respirer tes phrases.', 'Tenir l’ostinato toi-même, à la main gauche.'],
    goal: 'le dernier exercice (ta main gauche tient l’ostinato, ta main droite improvise) est validé.',
    body: W => `
<p>Pour commencer, on supprime le risque : la main gauche (l’appli) joue un ${W.term('ostinato', 'un court motif d’accompagnement répété en boucle, ici la quinte fa♯ – do♯ bercée')}, et ta main droite n’utilise que les <b>cinq touches noires</b> (fa♯, sol♯, la♯, do♯, ré♯). Elles forment une gamme ${W.term('pentatonique', 'gamme de cinq notes sans demi-ton : aucune note ne « frotte » avec une autre')}. Aucune note n’est fausse : toute ton attention va au rythme.</p>

<h2>Ce qu’est un motif</h2>
<p>Un ${W.term('motif', 'une petite idée de trois ou quatre notes, surtout un rythme, qu’on reconnaît quand elle revient')} est une cellule qu’on reconnaît quand elle revient. Ce n’est pas une mélodie entière : c’est sa brique. Dans le modèle ci-dessous, le motif est « noire – noire – blanche ». Tout le reste en découle.</p>
${W.score({ abc: EX_MOTIF, title: 'Huit mesures avec un seul motif', bpm: 76, practice: false, caption: 'Répété (mesure 2), déplacé plus haut (3), retourné en réponse (4), varié en croches (6), poussé vers un sommet (7), conclu sur fa♯, la note « maison » (8).' })}

<h2>Pourquoi ça marche</h2>
<p>L’oreille cherche des repères. Un rythme qui revient en est un : dès la deuxième fois, on l’attend, et on suit ce qui change. Le silence en est un autre : il découpe le flot en phrases, comme la ponctuation découpe un texte. Écoute la même idée jouée sans respirer, puis avec deux mesures de silence.</p>
${W.ecoute({ title: 'La même idée, avec ou sans silence', bpm: 76, items: [
  { label: 'Sans respirer', seq: ['do♯4 | do♯4 | ré♯4 | fa♯4 | sol♯4 | fa♯4 | ré♯4 | do♯4 | do♯4 | ré♯4 | fa♯4 | la♯4 | sol♯4 | fa♯4 | ré♯4 | do♯4', OST_FA], note: 'Un flot continu : on n’entend plus de motif, seulement des notes.' },
  { label: 'Avec des silences', seq: ['do♯4 | do♯4 | ré♯4:2 | z:4 | fa♯4 | fa♯4 | sol♯4:2 | z:4', OST_FA], note: 'Le motif, un silence, le motif déplacé : chaque phrase se détache, et l’oreille attend la suivante.' },
] })}

<h2>Les exercices</h2>
<p>Une seule nouveauté à chaque exercice : d’abord imiter, puis tenir un motif, le varier, faire respirer les phrases, jouer longtemps sans t’arrêter, et enfin tenir toi-même la main gauche.</p>
${W.paliers({ lesson: 'n1-im-lancer', steps: [
  { id: 'imiter', title: 'Écouter, chanter, rejouer', preset: 'n1-noires', mode: 'echo', echo: { rhythms: [[1, 1, 2], [2, 1, 1]], end: 'close', count: 4 },
    what: 'L’appli joue une phrase de deux mesures sur les touches noires. Pendant les deux mesures suivantes, <b>chante-la</b> (à voix haute ou dans ta tête) ; puis <b>rejoue-la</b> au piano. Quatre phrases.',
    why: 'On imite avant d’inventer : l’oreille apprend un motif avant les doigts. Chanter oblige à garder la phrase en tête au lieu de la chercher sur le clavier.',
    checks: [{ k: 'echo', min: 3 }] },
  { id: 'motif', title: 'Un motif, huit fois', preset: 'n1-noires', mode: 'libre', loops: 2,
    what: 'Invente un motif d’une mesure (trois ou quatre notes, un rythme simple) et joue-le <b>à chaque mesure</b>, huit fois de suite, en ne changeant que les notes.',
    why: 'Un seul rythme répété suffit à faire de la musique : c’est lui qu’on reconnaît. Ici, une seule chose bouge, les notes.',
    checks: [{ k: 'scale', min: 0.9 }, { k: 'motif', min: 6 }, { k: 'nonstop', bars: 8 }] },
  { id: 'varier', title: 'Répéter, déplacer, varier', preset: 'n1-noires', mode: 'libre', loops: 2,
    what: 'Ton motif, mais plus libre : répète-le, déplace-le plus haut, change une note ou un rythme, comme dans le modèle. Il doit revenir au moins trois fois en huit mesures.',
    why: 'Varier sans perdre le fil : l’auditeur reconnaît l’idée, et elle avance.',
    checks: [{ k: 'scale', min: 0.9 }, { k: 'motif', min: 3 }, { k: 'nonstop', bars: 8 }] },
  { id: 'silences', title: 'Respirer : deux mesures jouées, deux de silence', preset: 'n1-noires', mode: 'libre', loops: 4,
    what: 'Joue deux mesures, puis laisse deux mesures de silence, et ainsi de suite : le bandeau au-dessus de la grille indique « Joue » ou « Écoute ». Finis chaque phrase sur <b>fa♯</b>.',
    why: 'Savoir <i>quand</i> jouer est une compétence à part entière (Hal Crook) : le silence rend la phrase lisible, et il te laisse le temps de préparer la suivante.',
    checks: [{ k: 'rests', play: 2, rest: 2 }, { k: 'phraseEnd', on: 'tonic', min: 0.6 }] },
  { id: 'deux-minutes', title: 'Deux minutes sans t’arrêter', preset: 'n1-noires', mode: 'libre', loops: 10,
    what: 'Une seule règle : ne jamais t’arrêter, pendant deux minutes. Si tu hésites, rejoue ton motif ou tiens une note. Laisse des silences si tu veux, mais pas d’arrêt.',
    why: 'La pulsation passe avant la beauté des notes : c’est ce qui distingue une improvisation d’une recherche au clavier.',
    checks: [{ k: 'nonstop', bars: 36 }, { k: 'motif', min: 3 }] },
  { id: 'ostinato-mg', title: 'Ta main gauche tient l’ostinato', preset: 'n1-noires', mode: 'libre', loops: 4, lh: 'moi', formula: 'ostinato',
    what: 'L’appli ne joue plus que le clic : ta main gauche joue l’ostinato (fa♯ – do♯ – fa♯ – do♯, une note par temps, les touches brunes), ta main droite improvise sur les touches noires. Écoute d’abord la main gauche (bouton « Écouter la main gauche »), joue-la seule pendant le décompte, puis ajoute une note par mesure à droite, puis ton motif.',
    why: 'Chez Kinney, on apprend d’abord l’accompagnement par cœur, puis on improvise par-dessus : l’ostinato devient automatique, et l’attention va à la main droite. C’est le premier pas vers une improvisation à deux mains.',
    checks: [{ k: 'bass', min: 0.75, per: 3 }, { k: 'scale', min: 0.9 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>S’arrêter pour chercher une « belle » note.</b> Garde la pulsation : rejoue ton motif, ou tiens la note où tu es.</li>
<li><b>Changer de rythme à chaque mesure.</b> On ne reconnaît plus rien : garde un rythme, change les notes.</li>
<li><b>Jouer sans silence.</b> Un flot continu fatigue l’oreille : deux mesures jouées, deux d’écoute.</li>
</ul>`)}
${W.more('D’où vient cette méthode', `<p>Commencer par un ostinato et une gamme sans demi-tons, c’est la méthode du pédagogue américain Forrest Kinney (<i>Pattern Play</i>, <i>Create First!</i>) : on improvise dès la première minute, l’accompagnement tenu par un partenaire, et on construit ensuite. Imiter avant d’inventer vient d’Edwin Gordon ; les silences imposés, de Hal Crook (<i>How to Improvise</i>).</p>`)}
${W.links([W.informance('/content/pages/5-anyone-can-improvise', 'Anyone Can Improvise!'), W.informance('/content/pages/189-how-to-improvise', 'How to Improvise')], 'Pour aller plus loin')}
`,
  },

  /* ================================================================ 2 */
  {
    id: 'n1-im-rythme', minutes: 15,
    title: 'Question et réponse',
    summary: 'Une phrase se dit en deux temps : une question qui reste en suspens, une réponse qui reprend son rythme et conclut.',
    essentials: [
      'La <b>question</b> finit sur une note qui n’est pas la tonique : on attend la suite.',
      'La <b>réponse</b> commence avec le même rythme que la question et finit sur la <b>tonique</b>, en valeur longue.',
      'La <b>tonique</b> est la note « maison » de la tonalité : ici <b>la</b>.',
    ],
    goals: ['Entendre la différence entre une fin ouverte et une fin fermée.', 'Répondre à une question en reprenant son rythme, puis son dessin.'],
    goal: 'l’exercice « changement imprévu » est validé : tu réponds à l’appli, quel que soit le registre de sa question.',
    body: W => `
<p>Tu sais tenir un motif. On lui donne maintenant une direction. Deux phrases de deux mesures se répondent, comme une question et sa réponse. La ${W.term('tonique', 'la note de repos de la tonalité, celle où la musique se sent « à la maison » : la en la mineur')} décide de tout : finir ailleurs, c’est interroger ; finir dessus, c’est conclure.</p>
<p>On passe à la pentatonique de <b>la mineur</b> (la, do, ré, mi, sol), plus mélancolique, sur un ostinato la – mi.</p>

${W.score({ abc: EX_QR_PENTA, title: 'Deux questions, deux réponses (la mineur pentatonique)', bpm: 72, practice: false, caption: 'Questions : elles finissent sur mi (mesure 2) ou sol (6), on reste en l’air. Réponses : même début, même rythme, et la longue note finale est la. Écoute surtout les mesures 2 et 4.' })}

<h2>Pourquoi ça marche</h2>
<p>Après quelques mesures sur l’ostinato la – mi, l’oreille a compris que <b>la</b> est la maison. Une phrase qui s’arrête ailleurs laisse une attente ; une phrase qui revient sur la la comble. La réponse reprend le rythme de la question pour qu’on entende le lien : même geste, autre conclusion.</p>
${W.ecoute({ title: 'Fin ouverte, fin fermée', bpm: 72, items: [
  { label: 'La question : fin sur mi', seq: ['la3 | do4 | ré4:2 | mi4 | ré4 | mi4:2', OST_LA], note: 'On reste en l’air : la phrase demande une suite.' },
  { label: 'La réponse : fin sur la', seq: ['la3 | do4 | ré4:2 | ré4 | do4 | la3:2', OST_LA], note: 'Même début, même rythme ; la longue note finale est la tonique : la porte se ferme.' },
] })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im-rythme', steps: [
  { id: 'imiter', title: 'Rejouer des phrases qui concluent', preset: 'n1-penta-la', mode: 'echo', echo: { rhythms: [[1, 1, 2], [1.5, 0.5, 2]], end: 'close', count: 4 },
    what: 'L’appli joue une phrase qui finit sur la ; chante-la, puis rejoue-la. Écoute bien la dernière note : longue, et sur la tonique.',
    why: 'Avant de fabriquer des réponses, tu en entends et tu en joues : la fin fermée s’installe dans l’oreille.',
    checks: [{ k: 'echo', min: 3 }] },
  { id: 'reponse', title: 'Répondre avec le même rythme', preset: 'n1-penta-la', mode: 'qr',
    what: 'L’appli joue une question de deux mesures ; réponds en <b>reprenant son rythme</b> au début, et finis sur une note stable (la tonique à la fin de la grille).',
    why: 'Le rythme repris fait entendre que ta phrase répond à la sienne ; la fin sur la tonique la conclut.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'deux-roles', title: 'Les deux rôles', preset: 'n1-penta-la', mode: 'libre', loops: 4,
    what: 'Seize mesures en paires de quatre : deux mesures de question (fin sur mi, sol ou do), deux mesures de réponse (même rythme au départ, fin sur la).',
    why: 'Tu fais toi-même ce que faisait l’appli : tu décides où la phrase s’ouvre et où elle se ferme.',
    checks: [{ k: 'qa', min: 0.75 }, { k: 'nonstop', bars: 14 }] },
  { id: 'dessin', title: 'Suivre le dessin', preset: 'n1-penta-la', mode: 'qr', qr: { variant: 'contour' },
    what: 'Nouvelle consigne pour la réponse : garde le <b>dessin</b> de la question (elle monte, tu montes ; elle descend, tu descends), avec d’autres notes.',
    why: 'Imiter le contour plutôt que le rythme : une deuxième façon de répondre, très utilisée dans les marches et les développements.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'imprevu', title: 'Changement imprévu', preset: 'n1-penta-la', mode: 'qr', qr: { variant: 'registre' },
    what: 'L’appli pose ses questions tantôt dans l’aigu, tantôt dans le médium, sans prévenir. Réponds dans le <b>même registre</b> qu’elle.',
    why: 'Improviser, c’est aussi réagir : écouter l’autre pendant qu’on joue et s’adapter tout de suite.',
    checks: [{ k: 'answers', min: 3 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Une réponse qui ne « répond » pas.</b> C’est presque toujours le rythme : garde exactement celui de la première mesure de la question, change seulement les notes de la fin.</li>
<li><b>Une question qui finit sur la.</b> Elle est déjà close : finis-la sur mi, sol ou do.</li>
<li><b>Une réponse qui déborde.</b> Deux mesures, pas plus : la question suivante arrive.</li>
</ul>`)}
`,
  },

  /* ================================================================ 3 */
  {
    id: 'n1-im-5notes', minutes: 20,
    title: 'Les notes de l’accord',
    summary: 'Première harmonie : sur chaque temps fort, une note de l’accord. C’est ce qui fait « tenir » une mélodie.',
    essentials: [
      'Un <b>accord</b>, c’est trois ou quatre notes qui sonnent ensemble ; la <b>grille</b> dit quel accord dure chaque mesure.',
      'Sur les <b>temps forts</b> (1 et 3 à quatre temps), joue une note de l’accord : la mélodie tient debout.',
      'Au changement d’accord, va vers la note du nouvel accord <b>la plus proche</b> : la ligne devient chantante.',
    ],
    goals: ['Connaître les notes de I, IV et V7 en do majeur.', 'Poser une note de l’accord sur chaque temps fort, dans trois tonalités.', 'Jouer toi-même les accords à la main gauche.'],
    goal: 'le dernier exercice (à deux mains : tu joues les accords) est validé.',
    body: W => `
<p>Jusqu’ici, toutes les notes allaient bien. Avec une vraie harmonie, certaines notes « frottent ». On n’apprend pas à les éviter : on apprend où <b>s’appuyer</b>. Les ${W.term('temps forts', 'les temps qui portent l’accent de la mesure : le 1er (et le 3e à quatre temps)')} sont les moments où l’oreille vérifie l’harmonie ; c’est là qu’on place une note de l’accord.</p>

<h2>La boîte à outils (do majeur)</h2>
<table>
<thead><tr><th>Accord</th><th>Notes</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td><b>I</b> (do)</td><td>do – mi – sol</td><td>repos</td></tr>
<tr><td><b>IV</b> (fa)</td><td>fa – la – do</td><td>éloignement</td></tr>
<tr><td><b>V7</b> (sol 7)</td><td>sol – si – ré – fa</td><td>tension, qui ramène vers I</td></tr>
</tbody></table>
<p class="small">La théorie de ces accords : <a href="#/lecon/n1-th-accords">les accords de trois sons</a> et <a href="#/lecon/n1-th-fonctions">degrés et fonctions</a>.</p>

<h2>Pourquoi ça marche</h2>
<p>Ce ne sont pas les notes qui sont justes ou fausses, c’est leur <b>place</b>. La même note de la gamme sonne stable sur un temps fort si elle appartient à l’accord, et dure si elle n’y appartient pas. Écoute deux mélodies faites des mêmes touches blanches, sur la même grille.</p>
${W.ecoute({ title: 'Les mêmes touches, deux places', bpm: 66, items: [
  { label: 'Appuis sur l’accord', seq: ['mi4:2 | sol4:2 | fa4:2 | la4:2 | ré4:2 | si3:2 | do4:4', GRILLE_DO], note: 'Chaque temps fort tombe sur une note de l’accord : la mélodie tient debout.' },
  { label: 'Appuis à côté', seq: ['ré4:2 | fa4:2 | sol4:2 | si3:2 | do4:2 | la3:2 | ré4:4', GRILLE_DO], note: 'Les temps forts tombent à côté, et rien ne se résout : on croit entendre des fausses notes, alors que tout est dans la gamme.' },
] })}

<h2>Le modèle : un squelette, puis le même squelette habillé</h2>
${W.score({ abc: EX_ACCORDS, title: 'Do majeur : I – IV – V7 – I, deux fois', bpm: 72, startBpm: 60, caption: 'Mesures 1 à 4 : le <b>squelette</b>, une note de l’accord par mesure (mi, fa, ré, do), chacune voisine de la précédente. Mesures 5 à 8 : le même squelette au premier temps, d’autres notes de l’accord sur les autres temps.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im-5notes', steps: [
  { id: 'longues', title: 'Le squelette : une note par mesure', preset: 'n1-IIVVI', mode: 'libre', loops: 2,
    what: 'Une seule note par mesure (une ronde, ou deux blanches), une note de l’accord, la plus proche de la précédente. Écoute comme elle se fond dans l’accord.',
    why: 'Le squelette donne la direction ; c’est lui que l’oreille suit sous les ornements. On le pose d’abord seul.',
    checks: [{ k: 'rhythm', v: 'longues' }, { k: 'strong', min: 0.8 }, { k: 'stepwise', max: 4, min: 0.6 }] },
  { id: 'noires', title: 'Une note par temps', preset: 'n1-IIVVI', mode: 'libre', loops: 2,
    what: 'Garde ton squelette au premier temps ; sur les autres temps, d’autres notes du même accord (un arpège), en noires.',
    why: 'Uniquement des notes de l’accord : rien ne peut sonner faux. C’est le terrain sûr d’où partiront les ornements.',
    checks: [{ k: 'rhythm', v: 'noires' }, { k: 'strong', min: 0.7 }] },
  { id: 'reponse', title: 'Question – réponse sur la grille', preset: 'n1-IIVVI', mode: 'qr',
    what: 'L’appli pose la question sur I – IV, tu réponds sur V7 – I : même rythme au départ, notes de l’accord aux temps forts, fin sur do.',
    why: 'La question – réponse de la leçon précédente, mais sur une harmonie qui change : la fin sur do devient une vraie cadence.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'huit', title: 'Huit mesures, avec un accord de plus', preset: 'n1-IIVVI8', mode: 'libre', loops: 1,
    what: 'Une grille de huit mesures, avec un accord nouveau : <b>vi</b> (la mineur : la – do – mi). Vise toujours une note de l’accord aux temps forts, sans t’arrêter.',
    why: 'Plus d’accords à suivre : il faut lire la grille un accord à l’avance (la case « Suivant »).',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 7 }] },
  { id: 'tonalites', title: 'Dans deux autres tonalités', preset: 'n1-IIVVI', mode: 'libre', loops: 2, keys: [{ tr: -5, label: 'sol majeur' }, { tr: 5, label: 'fa majeur' }],
    what: 'La même grille I – IV – V7 – I en sol majeur, puis en fa majeur : les accords changent de nom, le travail reste le même. Une note par temps, les notes de l’accord aux temps forts.',
    why: 'Transposer prouve que tu penses en fonctions (I, IV, V), pas en touches : c’est ce qui rend l’improvisation possible dans n’importe quelle pièce.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'rhythm', v: 'noires' }] },
  { id: 'deux-mains', title: 'À deux mains : tu joues les accords', preset: 'n1-IIVVI', mode: 'libre', loops: 2, hands: true, formula: 'basse-accord', bpm: 60,
    what: 'Trois étapes, de plus en plus seul. D’abord l’appli joue la main gauche que tu joueras : la basse au 1er et au 3e temps, l’accord au 2e et au 4e. Puis elle ne joue plus que la basse : ta main gauche joue l’accord. Enfin il ne reste que le clic. Main droite : le squelette, une note de l’accord par mesure.',
    why: 'Un pianiste qui improvise fait lui-même l’harmonie. Les accords sont joués serrés, au plus près les uns des autres (do – mi – sol, do – fa – la, si – fa – sol) : la main bouge à peine. La leçon suivante, « Ta main gauche », en fait le tour.',
    tip: 'Main gauche seule d’abord, au clic, jusqu’à ce qu’elle tourne sans y penser ; puis ajoute la main droite, très simple.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'rhythm', v: 'longues' }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Sauter loin pour attraper une note de l’accord.</b> Prends la plus proche : un pas ou une tierce suffit presque toujours.</li>
<li><b>Une note étrangère tombée sur le temps fort par hasard.</b> Glisse d’un degré vers une note de l’accord : elle devient une note de passage.</li>
<li><b>Presser en jouant des noires.</b> Ralentis le tempo (curseur) et écoute la basse : c’est elle qui donne le temps.</li>
</ul>`)}
${W.more('La note la plus proche : pourquoi ça marche', '<p>Quand l’accord change, plusieurs notes de la mélodie peuvent convenir. Celle qui est voisine de la note précédente (un ton, un demi-ton, ou la même) donne une ligne conjointe, facile à chanter : c’est le principe de la <a href="#/lecon/n2-th-voix">conduite des voix</a>. Dans V7 → I, deux notes ont même une direction obligée : la <b>sensible</b> si monte vers do, la <b>septième</b> fa descend vers mi.</p>')}
`,
  },

  /* ================================================================ 4 (V7.4) */
  {
    id: 'n1-im-mg', minutes: 20,
    title: 'Ta main gauche : quatre formules',
    summary: 'Un pianiste qui improvise fait lui-même l’harmonie : des accords serrés enchaînés au plus près, quatre formules pour les faire vivre, trois tonalités, puis une mélodie par-dessus.',
    essentials: [
      'À la main gauche, l’accord se joue <b>serré</b>, sous le do central : trois notes voisines, saisies d’un seul geste.',
      'D’un accord au suivant, prends la position <b>la plus proche</b> (un renversement) : do – mi – sol, do – fa – la, si – fa – sol. Les notes communes restent, les autres bougent d’un pas.',
      'Quatre formules suffisent pour presque tout : <b>basse et accord</b>, <b>valse</b>, <b>arpège</b>, <b>Alberti</b>.',
    ],
    goals: ['Enchaîner I, IV et V7 au plus près, dans trois tonalités.', 'Jouer les quatre formules en mesure, puis une mélodie simple par-dessus.'],
    goal: 'le dernier exercice est validé : ta main gauche tient sa formule, ta main droite chante au-dessus, sans l’appli.',
    body: W => `
<p>Jusqu’ici, l’appli tenait ta main gauche. Or un pianiste qui improvise fait lui-même l’harmonie. Bradley Sowash le demande dès la première leçon de sa méthode (I, IV et V à la main gauche, une gamme lente à la main droite) ; Forrest Kinney y prépare par le duo : le professeur accompagne, puis l’élève reprend l’accompagnement. Ici, l’appli joue le rôle du partenaire, puis s’efface. Cette leçon te donne les outils : des accords serrés qui s’enchaînent sans sauter, et quatre formules pour les faire vivre.</p>

<h2>Des accords au plus près</h2>
<p>Joués à l’état fondamental, les accords obligent la main à sauter : do – mi – sol, puis fa – la – do, puis sol – si – ré – fa. Avec les ${W.term('renversements', 'le même accord avec une autre de ses notes en bas : do – mi – sol, mi – sol – do, sol – do – mi')}, on garde les notes communes et on bouge les autres d’un pas.</p>
<table>
<thead><tr><th>Accord</th><th>Position</th><th>Ce qui bouge</th></tr></thead>
<tbody>
<tr><td><b>I</b> (do majeur)</td><td>do – mi – sol</td><td>le point de départ</td></tr>
<tr><td><b>IV</b> (fa majeur)</td><td>do – fa – la</td><td>do reste ; mi monte à fa, sol monte à la</td></tr>
<tr><td><b>V7</b> (sol 7)</td><td>si – fa – sol</td><td>do descend à si, fa reste, la descend à sol (le ré, la quinte, est omis)</td></tr>
<tr><td><b>I</b></td><td>do – mi – sol</td><td>si monte à do (la sensible), fa descend à mi (la septième)</td></tr>
</tbody></table>
${W.score({ abc: EX_MG_PRES, title: 'Les mêmes accords, sautés puis au plus près', bpm: 60, practice: false, hands: false, caption: 'Mesures 1 à 4 : chaque accord à l’état fondamental, la main saute d’une position à l’autre. Mesures 5 à 8 : la position la plus proche, la main reste en place et les voix bougent d’un pas. À l’oreille aussi, la seconde version est plus liée.' })}
<p class="small">La théorie : <a href="#/lecon/n1-th-renv">renversements et chiffrage</a>, <a href="#/lecon/n1-th-fonctions">degrés et fonctions</a>.</p>

<h2>Les quatre formules</h2>
<p>Une ${W.term('formule', 'un dessin de main gauche répété à chaque accord : il donne le rythme et le caractère de l’accompagnement')} fait vivre les accords en rythme. Elle tourne seule une fois dans la main, et l’attention va à la mélodie. Toutes partent des mêmes positions serrées ; la basse, quand il y en a une, est la note qui donne son nom à l’accord, plus bas.</p>
${W.score({ abc: EX_MG_FORMULES, title: 'Basse et accord, arpège, Alberti (do majeur, I – IV – V7 – I)', bpm: 72, startBpm: 60, practice: false, hands: false, caption: '<b>Basse et accord</b> (mesures 1-4) : la basse au 1er et au 3e temps, l’accord au 2e et au 4e, c’est la main gauche de ton nocturne op. 55. <b>Arpège</b> (5-8) : la basse, puis l’accord égrené, deux fois par mesure. <b>Alberti</b> (9-12) : grave, aigu, milieu, aigu, la formule de Mozart et de Haydn.' })}
${W.score({ abc: EX_MG_VALSE, title: 'La valse (do majeur, I – IV – V7 – I)', bpm: 96, startBpm: 80, practice: false, hands: false, caption: 'La basse au premier temps, l’accord au deuxième et au troisième, plus léger : la formule de toutes les valses.' })}

<h2>Pourquoi ça marche</h2>
<p>La formule fait le travail rythmique et harmonique : une fois dans la main, elle tourne seule, et toute l’attention va à la mélodie. C’est pour cela qu’on l’apprend d’abord par cœur, sans main droite, comme un accompagnateur apprend sa partie avant la répétition. Et la position la plus proche ne sert pas qu’aux doigts : les voix qui bougent d’un pas s’entendent comme des lignes, au lieu de blocs qui sautent.</p>
${W.ecoute({ title: 'Sautés ou au plus près', bpm: 66, items: [
  { label: 'À l’état fondamental', seq: ['do2 mi2 sol2:2 | fa2 la2 do3:2 | sol2 si2 ré3 fa3:2 | do2 mi2 sol2:4'], note: 'Chaque accord saute : on entend des blocs séparés.' },
  { label: 'Au plus près', seq: ['do2 mi2 sol2:2 | do2 fa2 la2:2 | si1 fa2 sol2:2 | do2 mi2 sol2:4'], note: 'Do reste, mi monte à fa, puis si et fa vont vers do et mi : on entend des voix qui chantent.' },
] })}

<h2>Les exercices</h2>
<p>D’abord la main gauche seule, au clic : les accords plaqués, puis chaque formule. Les notes à jouer sont en brun sur le clavier, et « Écouter la main gauche » te la fait entendre avant de jouer. Ensuite, trois tonalités, puis une mélodie par-dessus.</p>
${W.paliers({ lesson: 'n1-im-mg', steps: [
  { id: 'plaque', title: 'Les accords plaqués, au plus près', preset: 'n1-IIVVI', mode: 'libre', loops: 2, lh: 'moi', formula: 'plaque', bpm: 60,
    what: 'Main gauche seule : un accord par mesure, plaqué au premier temps et tenu, dans la position la plus proche (do – mi – sol, do – fa – la, si – fa – sol, do – mi – sol). Regarde la case « Suivant » et prépare l’accord pendant le dernier temps.',
    why: 'Le chemin le plus court entre les accords : les doigts gardent les notes communes et ne bougent que d’un pas. C’est ce qui rend une main gauche sûre, et rapide plus tard.',
    checks: [{ k: 'lhChord', min: 0.75 }, { k: 'lhLead', max: 5 }] },
  { id: 'basse-accord', title: 'Basse et accord', preset: 'n1-IIVVI', mode: 'libre', loops: 2, lh: 'moi', formula: 'basse-accord', bpm: 60,
    what: 'La basse au 1er et au 3e temps (do, fa, sol, do : plus bas que l’accord), l’accord au 2e et au 4e, plus léger. Main gauche seule, au clic.',
    why: 'C’est la main gauche de ton nocturne op. 55, en simple : la basse porte l’harmonie, l’accord remplit le temps sans l’alourdir.',
    tip: 'Le saut de la basse à l’accord se prépare : pendant que tu joues la basse, regarde déjà la place de l’accord.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.75 }] },
  { id: 'valse', title: 'La valse', preset: 'n1-IIVVI-3', mode: 'libre', loops: 2, lh: 'moi', formula: 'valse', bpm: 92,
    what: 'À trois temps : la basse au premier, l’accord au deuxième et au troisième, plus léger. Main gauche seule, au clic.',
    why: 'La formule de toutes les valses, de Chopin à Satie : le premier temps porte, les deux autres rebondissent. Ta valse en la mineur (B. 150) repose sur elle.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.75 }] },
  { id: 'arpege', title: 'L’arpège', preset: 'n1-IIVVI', mode: 'libre', loops: 2, lh: 'moi', formula: 'arpege', bpm: 60,
    what: 'La basse, puis l’accord égrené en croches, deux fois par mesure (do – do – mi – sol, do – do – mi – sol). Régulier, lié, la main qui suit le dessin.',
    why: 'L’arpège remplit l’espace et lie les harmonies entre elles : c’est la main gauche des romances et des nocturnes.',
    checks: [{ k: 'bass', min: 0.75, per: 6 }, { k: 'lhChord', min: 0.75 }] },
  { id: 'alberti', title: 'La basse d’Alberti', preset: 'n1-IIVVI', mode: 'libre', loops: 2, lh: 'moi', formula: 'alberti', bpm: 60,
    what: 'Grave, aigu, milieu, aigu, en croches régulières : do – sol – mi – sol, puis do – la – fa – la, si – sol – fa – sol, do – sol – mi – sol.',
    why: 'Quatre croches qui font entendre l’accord entier et donnent un mouvement continu : Mozart et Haydn en ont fait la main gauche du style classique. Le poignet tourne un peu, comme une bascule (<a href="#/lecon/n2-t2">la rotation</a>).',
    checks: [{ k: 'lhChord', min: 0.75, per: 6 }] },
  { id: 'tonalites', title: 'I – IV – V7 dans trois tonalités', preset: 'n1-IIVVI', mode: 'libre', loops: 2, lh: 'moi', formula: 'basse-accord', bpm: 60,
    keys: [{ tr: -5, label: 'sol majeur' }, { tr: 5, label: 'fa majeur' }, { tr: 2, label: 'ré majeur' }],
    what: 'Basse et accord, en sol, en fa, puis en ré majeur. Les accords changent de nom ; la méthode reste la même : la position la plus proche, la note commune gardée.',
    why: 'Transposer oblige à penser en fonctions (I, IV, V7) et en mouvements de voix, pas en touches apprises : c’est ce qui te permettra d’accompagner dans la tonalité de n’importe quelle pièce.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.75 }, { k: 'lhLead', max: 6 }] },
  { id: 'melodie', title: 'Une mélodie par-dessus', preset: 'n1-IIVVI', mode: 'libre', loops: 2, hands: true, formula: 'basse-accord', bpm: 60,
    what: 'Ta main droite chante au-dessus, en valeurs longues : une note de l’accord par temps fort, la plus proche de la précédente. Trois étapes : l’appli joue d’abord ta main gauche, puis seulement la basse, enfin seulement le clic.',
    why: 'Deux mains indépendantes : une formule régulière en bas, une ligne libre en haut. C’est le geste de base de tout accompagnement, et de toute improvisation au piano.',
    tip: 'Si les deux mains se gênent, ralentis (curseur du tempo) et simplifie la main droite : une ronde par mesure suffit.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'rhythm', v: 'longues' }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Chaque accord à l’état fondamental.</b> La main saute et le temps se perd : garde les notes communes, prends la position la plus proche.</li>
<li><b>Une basse trop forte, un accord trop lourd.</b> La basse porte, l’accord murmure : deux nuances dans la même main.</li>
<li><b>Regarder ses mains à chaque changement.</b> Lis la case « Suivant » et prépare l’accord pendant le temps d’avant.</li>
<li><b>Ajouter la main droite trop tôt.</b> La formule doit tourner seule, sans y penser ; sinon, c’est elle qui s’arrête dès que la mélodie demande de l’attention.</li>
</ul>`)}
${W.more('Les septièmes à la main gauche', '<p>Un accord de septième a quatre notes : à la main gauche, on omet souvent la <b>quinte</b>, la moins utile (sol 7 = sol – si – fa, sans ré). Restent la fondamentale, qui dit l’accord, la tierce (la sensible, qui monte) et la septième (qui descend) : les deux notes qui font avancer l’harmonie. C’est aussi la position des « shells » des pianistes de jazz.</p>')}
`,
  },

  /* ================================================================ 4 */
  {
    id: 'n1-im-accords', minutes: 20,
    title: 'Entre les notes de l’accord : passages et broderies',
    summary: 'Relier les notes d’appui par la gamme : notes de passage et broderies, toujours entre les temps forts.',
    essentials: [
      '<b>Note de passage</b> : elle relie deux notes de l’accord par degrés conjoints (mi – <i>ré</i> – do).',
      '<b>Broderie</b> : on quitte une note de l’accord pour sa voisine, et on revient (mi – <i>fa</i> – mi).',
      'Elles se placent <b>entre</b> les temps forts ; le squelette, lui, reste sur les temps forts.',
    ],
    goals: ['Remplir un squelette donné par des notes de passage et des broderies, de mémoire.', 'Inventer ton propre squelette et l’habiller, à deux mains.'],
    goal: 'le dernier exercice (ton squelette habillé, à deux mains) est validé.',
    body: W => `
<p>Le squelette donne la direction ; la gamme sert de chemin entre ses notes. Deux outils suffisent, qui viennent de la <a href="#/lecon/n1-th-etrangeres">théorie des notes étrangères</a>. On travaille en <b>la mineur</b> : n’oublie pas le <b>sol♯</b> (la sensible) sur l’accord de V7 (mi – sol♯ – si – ré).</p>

<h2>Pourquoi ça marche</h2>
<p>Une note étrangère à l’accord n’est pas une faute : c’est une tension. Elle sonne bien si elle <b>mène quelque part</b>, d’un pas, vers une note de l’accord. La note de passage va d’un appui à un autre ; la broderie quitte un appui et y revient. Celle qui reste en l’air, elle, sonne faux.</p>
${W.ecoute({ title: 'La note étrangère : elle mène quelque part, ou non', bpm: 66, items: [
  { label: 'Note de passage (mi – ré – do)', seq: ['mi4 | ré4 | do4:2', 'la1 mi2 do3:4'], note: 'Le ré relie mi et do, deux notes de l’accord : on l’entend à peine, il fait avancer la ligne.' },
  { label: 'Broderie (mi – fa – mi)', seq: ['mi4 | fa4 | mi4:2', 'la1 mi2 do3:4'], note: 'Le fa frotte un instant, puis revient sur mi : un ornement.' },
  { label: 'La même note, qui reste en l’air', seq: ['mi4 | ré4:3', 'la1 mi2 do3:4'], note: 'Le ré tenu sur l’accord de la mineur ne se résout pas : c’est lui qui sonne « faux ».' },
] })}

<h2>Le modèle, en trois étages</h2>
${W.score({ abc: EX_SQUELETTE, title: '1. Le squelette : les notes en or des exercices', bpm: 66, practice: false, caption: 'Une note de chaque accord par mesure : mi – fa – si – do, puis do – ré – si – la. Ce sont exactement les notes en or des exercices ci-dessous. Les étages 2 et 3 habillent les quatre premières mesures.' })}
${W.score({ abc: EX_PASSAGES, title: '2. Notes de passage, aux 2e et 4e temps', bpm: 66, practice: false, caption: 'Aux 1er et 3e temps, des notes de l’accord ; entre elles, la note de la gamme qui les relie (mi – ré – do, fa – mi – ré…).' })}
${W.score({ abc: EX_BRODERIES, title: '3. En croches : broderies et passages', bpm: 66, startBpm: 54, practice: false, caption: 'Chaque note d’appui est brodée (mi – fa – mi, fa – sol – fa, si – do – si), puis reliée à la suivante. Les temps forts n’ont pas bougé : c’est toujours le squelette.' })}

<h2>Les notes en or : pourquoi celles-là</h2>
<p>Sur un temps fort, n’importe quelle note de l’accord sonne juste : la note en or n’est pas « la seule bonne note ». C’est la note de la <b>ligne</b> choisie pour les exercices, la mélodie du modèle réduite à une note par mesure. Trois règles l’ont fixée : une note de l’accord ; proche de la précédente, ou reliée à elle par la gamme ; une fin en suspens à la mesure 4 (la question), puis sur la tonique à la mesure 8 (la réponse).</p>
<table>
<thead><tr><th>Mesure</th><th>Note en or</th><th>Pourquoi celle-là</th></tr></thead>
<tbody>
<tr><td><b>1 · i</b><br><span class="small">la do mi</span></td><td><b>mi</b></td><td>On part de la quinte de l’accord, assez haut pour que la ligne puisse redescendre jusqu’à la, à la fin.</td></tr>
<tr><td><b>2 · iv</b><br><span class="small">ré fa la</span></td><td><b>fa</b></td><td>La note de l’accord la plus proche de mi : un demi-ton au-dessus.</td></tr>
<tr><td><b>3 · V7</b><br><span class="small">mi sol♯ si ré</span></td><td><b>si</b></td><td>La ligne redescend par la gamme : fa – mi – ré – do – si. Ce chemin, c’est la place des notes de passage (étage 2).</td></tr>
<tr><td><b>4 · i</b><br><span class="small">la do mi</span></td><td><b>do</b></td><td>La plus proche de si : un demi-ton au-dessus. Fin sur do et non sur la : la phrase reste en suspens, c’est la question.</td></tr>
<tr><td><b>5 · VI</b><br><span class="small">fa la do</span></td><td><b>do</b></td><td>Note commune : do appartient aussi à l’accord de fa majeur, on la garde.</td></tr>
<tr><td><b>6 · iv</b><br><span class="small">ré fa la</span></td><td><b>ré</b></td><td>La plus proche de do : un ton au-dessus.</td></tr>
<tr><td><b>7 · V7</b><br><span class="small">mi sol♯ si ré</span></td><td><b>si</b></td><td>La descente finale commence : ré – do – si, puis la.</td></tr>
<tr><td><b>8 · i</b><br><span class="small">la do mi</span></td><td><b>la</b></td><td>La tonique : la réponse conclut.</td></tr>
</tbody></table>
<p class="small">Au premier exercice, la grille affiche toutes les notes en or avant le départ, sous chaque accord ; pendant une mesure, la suivante est déjà marquée en or pâle sur le clavier. Ensuite, tu travailles <b>de mémoire</b> : « Écouter le squelette » te le fait entendre (chante-le avec l’appli), puis tu le joues sans affichage. L’or revient si tu bloques, ou après un échec. Au dernier exercice, plus de notes en or : tu choisis ta propre ligne, avec les mêmes règles.</p>

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im-accords', steps: [
  { id: 'or', title: 'Le squelette en or', preset: 'n1-am-squelette', mode: 'squelette', loops: 1,
    what: 'Les notes en or sont écrites dans la grille, sous chaque accord : mi, fa, si, do, puis do, ré, si, la (le squelette ci-dessus). Pose chacune au premier temps et tiens-la, rien d’autre. Pendant que tu la tiens, regarde la suivante : elle est déjà en or pâle sur le clavier.',
    why: 'D’abord les appuis seuls : on entend la ligne que les ornements vont habiller.',
    tip: 'Avant de commencer, écoute le squelette (partition 1) et chante-le deux fois : quand tu connais la ligne par cœur, tu n’as plus besoin de la lire.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'rhythm', v: 'longues' }] },
  { id: 'passage', title: 'Relier par des notes de passage', preset: 'n1-am-squelette', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'Pose la note en or au premier temps, puis va vers la suivante <b>par la gamme</b>, en noires (mi – ré – do…).',
    why: 'La note de passage est l’ornement le plus naturel : elle remplit le trajet entre deux appuis.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'figure', f: 'passage', min: 3 }] },
  { id: 'broderie', title: 'Une broderie par mesure', preset: 'n1-am-squelette', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'Autour de chaque note en or, une broderie : la note, sa voisine (au-dessus ou au-dessous), la note. Puis va vers la suivante.',
    why: 'La broderie fait vivre une note sans la quitter : le squelette reste audible.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'figure', f: 'broderie', min: 4 }] },
  { id: 'croches', title: 'En croches', preset: 'n1-am-squelette', mode: 'squelette', gold: 'memo', loops: 2,
    what: 'Même travail en croches : broderies et passages, deux notes par temps ; les notes en or restent au premier temps.',
    why: 'Plus de notes, même architecture : c’est l’habillage de Chopin, en plus simple.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'rhythm', v: 'croches' }, { k: 'strong', min: 0.7 }] },
  { id: 'libre', title: 'Ton squelette, habillé', preset: 'n1-am', mode: 'libre', loops: 2,
    what: 'Sans notes en or : invente ton propre squelette (une note de l’accord par mesure, voisine de la précédente) et habille-le de passages et de broderies.',
    why: 'Tu fais toi-même les deux étages : le chemin, puis l’ornement.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'figure', f: 'passage', min: 2 }, { k: 'figure', f: 'broderie', min: 2 }, { k: 'nonstop', bars: 14 }] },
  { id: 'deux-mains', title: 'À deux mains', preset: 'n1-am', mode: 'libre', loops: 2, hands: true, formula: 'basse-accord', bpm: 54,
    what: 'Ton squelette habillé, sur ta propre main gauche, en trois étapes : l’appli joue tout, puis la basse seule (tu joues l’accord), puis le clic seul (tu joues la basse et l’accord). En la mineur, l’accord de mi 7 se joue ré – mi – sol♯ : n’oublie pas le sol♯.',
    why: 'La main droite orne, la main gauche tient l’harmonie : c’est ainsi qu’on improvise seul au piano. Ralentis autant qu’il faut (curseur du tempo) : la régularité d’abord.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'figure', f: 'ornement', min: 3 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>L’ornement prend la place de l’appui.</b> Il va <i>entre</i> les notes en or, jamais à leur place.</li>
<li><b>Une broderie trop loin.</b> La voisine, à un ton ou un demi-ton ; une tierce, c’est déjà un saut.</li>
<li><b>Un passage qui change de sens.</b> Une note de passage va dans une seule direction, d’un appui à l’autre.</li>
<li><b>Le sol naturel sur V7.</b> En la mineur, l’accord de mi 7 contient sol♯ : c’est la sensible.</li>
</ul>`)}
`,
  },

  /* ================================================================ 5 */
  {
    id: 'n1-im-gammes', minutes: 20,
    title: 'Le soupir : l’appoggiature',
    summary: 'La note étrangère posée sur le temps, qui retombe d’un degré : le geste expressif de toute la musique romantique.',
    essentials: [
      'L’<b>appoggiature</b> est une note étrangère <b>sur le temps</b>, qui se résout d’un degré (souvent en descendant) sur une note de l’accord.',
      'C’est un <b>soupir</b> : on appuie la dissonance, on allège la résolution.',
      'Une ou deux par phrase : trop d’appoggiatures, et plus rien n’est expressif.',
    ],
    goals: ['Placer une appoggiature au premier temps et la résoudre.', 'Doser son poids : appui, puis détente.'],
    goal: 'l’exercice « appuyer, puis alléger » et les suivants sont validés : l’appoggiature plus forte que sa résolution, jusqu’à deux mains.',
    body: W => `
<p>Jusqu’ici, les temps forts étaient sur l’accord. L’${W.term('appoggiature', 'note étrangère à l’accord, placée sur le temps fort, qui se résout ensuite par degré sur une note de l’accord')} renverse la règle, exprès : une note qui n’appartient pas à l’accord tombe sur le temps, crée une tension, puis glisse sur la note voisine. Chopin, Liszt, Rachmaninov en remplissent leurs mélodies. Tu en entends une dans ton nocturne : le ré♭ qui retombe sur do.</p>

<h2>Pourquoi ça marche</h2>
<p>Sur le temps fort, l’oreille attend une note de l’accord. L’appoggiature la fait attendre : la dissonance crée l’expression, la résolution d’un degré la rend supportable. C’est pour cela qu’elle se joue avec du poids, puis qu’on relâche.</p>
${W.ecoute({ title: 'Avec ou sans soupir', bpm: 56, items: [
  { label: 'La note de l’accord, directement', seq: ['si3:2 | sol3:2', 'mi1 si1 mi2 sol2:4'], note: 'Si, puis sol, sur l’accord de mi mineur : juste, mais neutre.' },
  { label: 'L’appoggiature, puis la résolution', seq: ['do4:2 | si3:2', 'mi1 si1 mi2 sol2:4'], note: 'Do frotte contre si (dans l’accord), puis y retombe : c’est le soupir.' },
] })}

${W.score({ abc: EX_SOUPIRS, title: 'Mi mineur : une appoggiature par mesure', bpm: 56, startBpm: 48, practice: false, pedal: [0, 4, 8, 12, 16, 20, 24, 28], pedalEnd: 32, caption: 'Chaque mesure commence par une note étrangère (marquée « app. ») : do sur l’accord de mi mineur, ré sur do majeur… Elle descend d’un degré au 3e temps, sur une note de l’accord. La mesure 4 s’arrête sur ré♯ (la sensible) : c’est la question ; la mesure 8 conclut sur mi.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im-gammes', steps: [
  { id: 'soupir', title: 'Le soupir en or', preset: 'n1-soupirs', mode: 'squelette', loops: 1,
    what: 'La note en or est l’appoggiature de la mesure : pose-la au premier temps, puis descends d’un degré (un ton ou un demi-ton) sur une note de l’accord.',
    why: 'Le geste d’abord, guidé : la note étrangère sur le temps, la résolution juste après.',
    checks: [{ k: 'appog', min: 0.75 }] },
  { id: 'poids', title: 'Appuyer, puis alléger', preset: 'n1-soupirs', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'Même chose, mais joue l’appoggiature <b>plus fort</b> que sa résolution : un appui, puis une détente.',
    why: 'Le soupir se joue avec le poids du bras. Sans différence de nuance, l’appoggiature n’est qu’une note de plus.',
    checks: [{ k: 'appog', min: 0.75 }, { k: 'weight', min: 0.7 }] },
  { id: 'une-sur-deux', title: 'Sans aide, une mesure sur deux', preset: 'n1-soupirs', mode: 'libre', loops: 2,
    what: 'Plus de notes en or : une appoggiature dans une mesure sur deux, des notes de l’accord ailleurs. C’est toi qui choisis où soupirer.',
    why: 'Le geste devient le tien. Une ou deux appoggiatures par phrase : au-delà, plus rien n’est expressif.',
    checks: [{ k: 'figure', f: 'appoggiature', min: 4 }, { k: 'nonstop', bars: 14 }] },
  { id: 'reponse', title: 'Question – réponse : finir par un soupir', preset: 'n1-soupirs', mode: 'qr', qr: { variant: 'figure', figure: 'appoggiature' },
    what: 'L’appli pose la question ; ta réponse contient une appoggiature, idéalement à la fin (fa♯ → mi sur l’accord final).',
    why: 'Le soupir à la fin d’une phrase : la conclusion la plus expressive du romantisme.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'tonalites', title: 'Dans deux autres tonalités', preset: 'n1-soupirs', mode: 'squelette', gold: 'memo', loops: 1, keys: [{ tr: -2, label: 'ré mineur' }, { tr: 5, label: 'la mineur' }],
    what: 'Les mêmes soupirs en ré mineur, puis en la mineur, de mémoire : écoute le squelette dans la nouvelle tonalité, chante-le, puis joue-le.',
    why: 'Transposer fixe le geste dans la main et dans l’oreille, quelle que soit la tonalité.',
    checks: [{ k: 'appog', min: 0.75 }] },
  { id: 'deux-mains', title: 'À deux mains : basse et accord', preset: 'n1-soupirs', mode: 'libre', loops: 2, hands: true, formula: 'basse-accord', bpm: 52,
    what: 'Tes soupirs sur ta propre main gauche : la basse au 1er et au 3e temps, l’accord au 2e et au 4e (en brun). Trois étapes : l’appli joue tout, puis la basse seule, puis le clic seul. Une appoggiature par mesure, ou une sur deux.',
    why: 'Le soupir demande du poids à droite et de la légèreté à gauche : deux nuances à la fois, le cœur du jeu romantique.',
    checks: [{ k: 'figure', f: 'appoggiature', min: 3 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Résoudre en sautant.</b> La résolution se fait d’un degré, presque toujours vers le bas.</li>
<li><b>Une appoggiature aussi douce que sa résolution.</b> Mets le poids sur la dissonance, pas sur la note qui suit.</li>
<li><b>En mettre partout.</b> Une ou deux par phrase : le soupir doit rester un événement.</li>
</ul>`)}
`,
  },

  /* ================================================================ 7 (V7.4) */
  {
    id: 'n1-im-melodie', minutes: 25,
    title: 'Une mélodie connue : l’harmoniser, la varier',
    summary: 'Rejouer « Ah ! vous dirai-je, maman » d’oreille, trouver ses accords avec I, IV et V, puis en faire trois variations : le rythme, les ornements, le mineur. Comme Mozart.',
    essentials: [
      'Harmoniser, c’est choisir sous chaque note un accord qui la <b>contient</b> : avec I, IV et V, on harmonise la plupart des chansons.',
      'On écoute d’abord la <b>basse</b> : do, fa ou sol ? L’oreille le sait souvent avant les yeux.',
      'Varier, c’est garder les <b>notes d’appui</b> et changer le reste : le rythme, les ornements, le mode.',
    ],
    goals: ['Rejouer l’air d’oreille et trouver ses accords.', 'En jouer trois variations : un autre rythme, des ornements, le mineur.'],
    goal: 'la troisième variation (en mineur) est validée.',
    body: W => `
<p>Mozart a écrit douze variations sur cet air (K. 265) : le thème reste reconnaissable d’un bout à l’autre, et tout le reste change. C’est le principe des variations que Czerny apprenait à improviser à ses élèves (op. 200) : garder la charpente, changer l’habit. Tu vas le faire en trois temps : apprendre l’air d’oreille, trouver ses accords, puis le varier.</p>

<h2>1. L’air, d’oreille</h2>
<p>Si tu ne le sais pas encore, apprends-le dans l’atelier ci-dessous, phrase par phrase, jusqu’à la preuve « sans aide ». Il a trois phrases de quatre mesures ; la troisième est la même que la première.</p>
${W.earsong({ id: 'ah-vous-dirai-je' })}

<h2>2. Trouver les accords</h2>
<p>Sous chaque demi-mesure, un accord qui contient la note de l’air. Trois candidats en do majeur :</p>
<table>
<thead><tr><th>Note de l’air</th><th>Accords qui la contiennent</th></tr></thead>
<tbody>
<tr><td>do</td><td><b>I</b> (do – mi – sol) ou <b>IV</b> (fa – la – do)</td></tr>
<tr><td>ré</td><td><b>V</b> (sol – si – ré)</td></tr>
<tr><td>mi</td><td><b>I</b></td></tr>
<tr><td>fa</td><td><b>IV</b>, ou <b>V7</b> (sol – si – ré – fa)</td></tr>
<tr><td>sol</td><td><b>I</b> ou <b>V</b></td></tr>
<tr><td>la</td><td><b>IV</b></td></tr>
<tr><td>si</td><td><b>V</b></td></tr>
</tbody></table>
<p>Quand deux accords conviennent, l’oreille choisit : à la fin d’une phrase, V puis I (la cadence) ; ailleurs, ce qui sonne le plus naturel. L’appli accepte tout accord de I, IV ou V qui contient la note de l’air : il n’y a pas une seule bonne harmonisation.</p>
${W.ecoute({ title: 'Sous « la – la », deux accords', bpm: 76, items: [
  { label: 'IV (fa – la – do)', seq: ['do3 | do3 | sol3 | sol3 | la3 | la3 | sol3:2', 'do1 do2 mi2 sol2:4 | fa1 do2 fa2 la2:2 | do1 do2 mi2 sol2:2'], note: 'La note la appartient à l’accord de fa : elle s’y fond.' },
  { label: 'V (sol – si – ré)', seq: ['do3 | do3 | sol3 | sol3 | la3 | la3 | sol3:2', 'do1 do2 mi2 sol2:4 | sol1 si1 ré2 sol2:2 | do1 do2 mi2 sol2:2'], note: 'La n’est pas dans l’accord de sol : il frotte, et rien ne le résout.' },
] })}

<h2>3. Varier</h2>
<p>Les notes d’appui de l’air sont celles du premier temps de chaque mesure : do, la, fa, ré | sol, mi, sol, mi | do, la, fa, ré. Elles restent ; tout le reste peut changer. Mozart change d’abord le rythme et remplit l’espace de notes rapides (sa première variation file en doubles croches), plus loin il passe en mineur (la huitième).</p>
${W.score({ abc: EX_AHVOUS_VAR, title: 'La première phrase, variée trois fois', bpm: 72, startBpm: 60, practice: false, caption: '<b>Le rythme</b> (mesures 1-4) : pointé, les notes de l’air au même endroit. <b>Les ornements</b> (5-8) : en croches, des broderies (do – ré – do) et des notes de passage autour des mêmes appuis. <b>Le mineur</b> (9-12) : mi devient mi♭, la devient la♭ ; sous la note, i, iv et V.' })}

<h2>Les exercices</h2>
<p>D’abord l’harmonisation, l’appli jouant l’air ; les accords sont cachés, à toi de les trouver d’oreille. Puis l’air et ses accords à deux mains. Enfin les trois variations, sur l’accompagnement de l’appli.</p>
${W.paliers({ lesson: 'n1-im-melodie', steps: [
  { id: 'basses', title: 'Trouver les basses', preset: 'ah-vous', mode: 'libre', loops: 1, lh: 'moi', formula: 'basse', guide: 'melody', hideGrid: true, bpm: 66,
    what: 'L’appli joue l’air ; ta main gauche joue la basse au début de chaque case de la grille (deux par mesure, souvent) : do, fa ou sol, sous le do central. Écoute laquelle va sous la note de l’air. Les accords sont cachés : « Voir les accords » les montre si tu bloques.',
    why: 'La basse décide de l’accord. Trouver d’oreille do, fa ou sol, c’est déjà harmoniser, comme les accompagnateurs qui jouent sans partition.',
    checks: [{ k: 'harmony', need: 'bass', min: 0.75 }] },
  { id: 'accords', title: 'Les accords sous l’air', preset: 'ah-vous', mode: 'libre', loops: 1, lh: 'moi', formula: 'plaque', guide: 'melody', hideGrid: true, bpm: 66,
    what: 'L’appli joue l’air ; ta main gauche plaque l’accord au début de chaque case : I, IV ou V, dans la position la plus proche (do – mi – sol, do – fa – la, si – ré – sol). Les accords restent cachés.',
    why: 'Avec la basse, tu as trouvé la fonction ; avec l’accord entier, tu entends si la note de l’air y est.',
    checks: [{ k: 'harmony', need: 'chord', min: 0.75 }] },
  { id: 'deux-mains', title: 'L’air et ses accords, à deux mains', preset: 'ah-vous', mode: 'libre', loops: 1, lh: 'moi', formula: 'plaque', bpm: 60,
    what: 'Seul, au clic : l’air à la main droite, tes accords plaqués à la main gauche, tenus jusqu’au suivant. Lentement.',
    why: 'Tu joues la chanson comme un pianiste qui accompagne un chanteur : la mélodie et l’harmonie viennent de toi.',
    checks: [{ k: 'tune', min: 0.8 }, { k: 'harmony', need: 'chord', min: 0.75 }] },
  { id: 'rythme', title: 'Variation 1 : un autre rythme', preset: 'ah-vous', mode: 'squelette', gold: 'memo', loops: 1, bpm: 72,
    what: 'L’appli joue l’accompagnement. Joue l’air avec un autre rythme : pointé, en croches, des notes répétées… Les notes d’appui (le premier temps de chaque mesure) restent celles de l’air.',
    why: 'Le rythme change tout le caractère : la même mélodie devient une marche, une danse, une berceuse. C’est la variation la plus simple, et la plus parlante.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'varied', min: 0.6 }] },
  { id: 'ornements', title: 'Variation 2 : orner', preset: 'ah-vous', mode: 'squelette', gold: 'memo', loops: 1, bpm: 66,
    what: 'Garde les notes d’appui de l’air et remplis l’espace en croches : des broderies (do – ré – do), des notes de passage (sol – fa – mi), comme la première variation de Mozart, en plus lent.',
    why: 'Tout ce que tu as appris (passages, broderies) sur une mélodie que tout le monde connaît : on entend l’air sous les ornements, c’est ce qui rend la variation lisible.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'figure', f: 'ornement', min: 5 }, { k: 'rhythm', v: 'croches' }] },
  { id: 'mineur', title: 'Variation 3 : en mineur', preset: 'ah-vous-min', mode: 'squelette', gold: 'memo', loops: 1, bpm: 66,
    what: 'L’accompagnement passe en do mineur : joue l’air en mineur. Mi devient mi♭, la devient la♭ ; le reste ne change pas. Écoute d’abord le squelette.',
    why: 'Changer de mode garde le dessin et renverse le caractère : la chanson devient plainte. C’est la huitième variation de Mozart.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'strong', min: 0.7 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Chercher l’accord avec les doigts.</b> Chante la note de l’air, puis essaie do, fa ou sol à la basse : l’oreille entend tout de suite celle qui frotte.</li>
<li><b>Changer d’accord à chaque note.</b> Souvent, un accord dure une demi-mesure, ou une mesure entière : la mélodie passe, l’accord reste.</li>
<li><b>Perdre l’air sous les ornements.</b> Les notes d’appui restent au premier temps : c’est elles qu’on doit entendre.</li>
</ul>`)}
${W.listen([W.yt('Mozart 12 variations Ah vous dirai-je maman K 265', 'Mozart, douze variations K. 265', 'Le thème, puis douze manières de le varier')], 'Écouter')}
`,
  },

  /* ================================================================ 6 */
  {
    id: 'n1-im2', minutes: 25,
    title: 'Style 1 : la romance en arpèges mineurs',
    summary: 'Une main gauche qui déroule l’accord jusqu’à la dixième, une mélodie lente qui chante et soupire : le style de la Romance de Liszt.',
    essentials: [
      'Main gauche : l’accord <b>déroulé</b> de la basse jusqu’à la dixième, puis retour ; une seule position de main et <b>une pédale par accord</b>.',
      'Main droite : des <b>valeurs longues</b>, des notes de l’accord sur les temps, un <b>soupir</b> par phrase et un <b>sommet</b>.',
      'Le caractère vient du phrasé : la question monte et se suspend, la réponse retombe et se pose.',
    ],
    goals: ['Jouer la main gauche en arpèges sur la grille de mi mineur.', 'Improviser huit mesures dans ce style, avec une question et une réponse.'],
    goal: 'l’exercice « huit mesures » est validé : une question qui se suspend en mesure 4, une réponse qui finit sur mi.',
    body: W => `
<p>C’est le style des romances sans paroles, de la <a href="#/piece/liszt-s169">Romance de Liszt</a> à l’Élégie de Rachmaninov : une tonalité mineure, une main gauche qui ondule en arpèges larges, une mélodie qui chante par-dessus. Tout ce que tu as appris s’y retrouve : notes de l’accord sur les temps, passages, soupirs.</p>

<h2>La boîte à outils (mi mineur, à trois temps)</h2>
<table>
<thead><tr><th class="num">Mesure</th><th>Accord</th><th>Notes</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>i : mi mineur</td><td>mi – sol – si</td></tr>
<tr><td class="num">2</td><td>iv : la mineur</td><td>la – do – mi</td></tr>
<tr><td class="num">3</td><td>i : mi mineur</td><td>mi – sol – si</td></tr>
<tr><td class="num">4</td><td>V : si majeur</td><td>si – ré♯ – fa♯ (ré♯ : la sensible)</td></tr>
<tr><td class="num">5</td><td>VI : do majeur</td><td>do – mi – sol</td></tr>
<tr><td class="num">6</td><td>iv : la mineur</td><td>la – do – mi</td></tr>
<tr><td class="num">7</td><td>V7 : si 7</td><td>si – ré♯ – fa♯ – la</td></tr>
<tr><td class="num">8</td><td>i : mi mineur</td><td>mi – sol – si</td></tr>
</tbody></table>

<h2>Pourquoi ce style chante</h2>
<p>La main gauche fait tout le mouvement : six croches par mesure, qui remplissent l’harmonie sur deux octaves. La main droite peut donc se permettre des <b>valeurs longues</b>, comme une voix. Plus la mélodie est lente, plus chaque appui compte : c’est là que le soupir (l’appoggiature) prend tout son sens.</p>

<h2>D’abord la main gauche</h2>
${W.score({ abc: EX_ROMANCE_MG, title: 'La main gauche de la romance', bpm: 63, startBpm: 50, hands: false, pedal: [0, 3, 6, 9, 12, 15, 18, 21], pedalEnd: 24, caption: 'Six croches par mesure : basse, quinte, octave, dixième… puis retour. La main reste ouverte sur l’accord ; le poignet suit la vague, sans à-coup. Pédale changée juste après chaque basse (<a href="#/lecon/n1-t5">pédale syncopée</a>).' })}

<h2>Le modèle : huit mesures phrasées</h2>
${W.score({ abc: EX_ROMANCE, title: 'Romance en mi mineur', bpm: 63, startBpm: 54, pedal: [0, 3, 6, 9, 12, 15, 18, 21], pedalEnd: 24, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_ROMANCE }], caption: 'Compare les deux écoutes. Phrasé : la première phrase monte vers le fa♯ de la mesure 4 et s’y suspend (une respiration) ; la seconde part du sol aigu, soupire en mesure 6 (ré → do) et se pose sur mi en ralentissant.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im2', steps: [
  { id: 'main-gauche', title: 'La main gauche seule', preset: 'romance-mi', mode: 'libre', loops: 1, lh: 'moi',
    what: 'Joue toi-même la main gauche (les notes en brun) : la basse au premier temps, puis l’accord déroulé jusqu’à la dixième et retour. Le clic garde le temps.',
    why: 'Dans la romance, c’est la main gauche qui crée le climat. Elle doit couler seule avant qu’on chante au-dessus.',
    checks: [{ k: 'bass', min: 0.75, per: 4 }] },
  { id: 'squelette', title: 'Le squelette du modèle', preset: 'romance-mi', mode: 'squelette', loops: 1,
    what: 'Main gauche par l’appli. Les notes en or sont celles du modèle : pose-les au premier temps, en valeurs longues (une par mesure).',
    why: 'Tu chantes d’abord la ligne nue du modèle : elle te montre où monter et où te poser.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'rhythm', v: 'longues' }] },
  { id: 'soupir', title: 'Habiller : un passage et un soupir', preset: 'romance-mi', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'Sur le même squelette, ajoute au moins une note de passage et un soupir (une appoggiature qui retombe d’un degré).',
    why: 'Les outils des leçons précédentes, dans un style : c’est ainsi qu’un vocabulaire devient une langue.',
    checks: [{ k: 'targets', min: 0.6 }, { k: 'figure', f: 'passage', min: 1 }, { k: 'figure', f: 'appoggiature', min: 1 }] },
  { id: 'qr', title: 'Question – réponse en valeurs longues', preset: 'romance-mi', mode: 'qr',
    what: 'L’appli pose la question (deux mesures) ; réponds en valeurs longues, notes de l’accord sur les temps, fin sur une note stable.',
    why: 'Le dialogue, dans le style : une voix qui chante, pas une suite de notes rapides.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'huit', title: 'Huit mesures à deux mains : une question, une réponse', preset: 'romance-mi', mode: 'libre', loops: 1, hands: true, formula: 'arpege', bpm: 52,
    what: 'Une question (mesures 1 à 4, qui monte et se suspend sur ré♯ ou fa♯), une réponse (mesures 5 à 8, qui finit sur mi), lentement, sur ta main gauche en arpège (la basse, puis l’accord égrené, en montant et en redescendant). Trois étapes : l’appli joue tout, puis la basse seule, puis le clic seul. Puis « Réécouter ».',
    why: 'La forme à l’échelle de la phrase, et tout le style à toi seul : la main gauche crée le climat, la droite chante. Lentement d’abord : la vague doit rester régulière.',
    checks: [{ k: 'cadences', half: 4, full: 8 }, { k: 'nonstop', bars: 7 }] },
  { id: 'lamento', title: 'Une autre grille : la basse qui descend', preset: 'romance-la', mode: 'libre', loops: 2,
    what: 'En la mineur, la basse descend pas à pas (la – sol – fa – mi) : la <b>basse de lamento</b>. Même travail, autre couleur.',
    why: 'Une basse qui descend rend tout plus sombre, plus fatal : les romantiques russes l’adoraient.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Une main gauche qui accélère en montant.</b> La vague est régulière : le poignet suit, les doigts ne pressent pas.</li>
<li><b>Une pédale gardée sur deux accords.</b> Change-la juste après chaque basse.</li>
<li><b>Une mélodie trop chargée.</b> Des valeurs longues : la main gauche fait déjà le mouvement.</li>
</ul>`)}
${W.tip('Garder ce que tu as trouvé', '<p>Une improvisation qui te plaît mérite d’être fixée : l’onglet <a href="#/outils/composition">Composition</a> reprend cette grille (romance en mi mineur). Tu y enregistres ta mélodie mesure par mesure ; elle est notée en partition, vérifiée (question en mesure 4, sommet, cadence) et gardée dans tes compositions.</p>')}
${W.listen([W.yt('Liszt Romance S.169 O pourquoi donc', 'Liszt, Romance S. 169', 'La pièce qui a inspiré ce style'), W.yt('Rachmaninoff Elegie op 3 no 1', 'Rachmaninov, Élégie op. 3 n° 1', 'Le même principe, en plus large (niveau 4)')], 'Écouter le style')}
`,
  },

  /* ================================================================ 7 */
  {
    id: 'n1-im3', minutes: 25,
    title: 'Style 2 : le nocturne, sur les harmonies de ton op. 55',
    summary: 'Improviser sur la boucle d’accords qui porte le thème de ton nocturne, avec la main gauche de Chopin, puis comparer avec sa mélodie.',
    essentials: [
      'Le thème de l’op. 55 n° 1 repose sur une boucle de quatre harmonies : <b>i – VII6 – III – V6/5</b> (fa m, mi♭/sol, la♭, do 7/mi), deux par mesure.',
      'La mélodie de Chopin y suit les règles que tu connais : notes de l’accord sur les temps 1 et 3, des <b>broderies chromatiques</b> (si♮ – do – ré♭) et des <b>rythmes pointés</b>.',
      'Improviser sur la même boucle, c’est comprendre de l’intérieur ce que fait sa mélodie.',
    ],
    goals: ['Préluder en fa mineur avant de jouer ta pièce.', 'Improviser un autre thème sur les harmonies de l’op. 55, puis à deux mains.', 'Orner son squelette avec des broderies chromatiques et des rythmes pointés.'],
    goal: 'l’exercice « question – réponse sur les harmonies de Chopin » est validé.',
    body: W => `
<p>Cette fois, la grille n’est pas inventée pour l’exercice : ce sont les accords des mesures 1 à 8 de ton nocturne, avec les voicings de Chopin à la main gauche (basse au 1er et au 3e temps, accord au 2e et au 4e). Un accord <b>par demi-mesure</b> : les temps forts sont le 1 et le 3.</p>

<h2>Ce que fait Chopin</h2>
${W.score({ abc: OP55.e1, title: 'Op. 55 n° 1, mesures 1 à 4', bpm: 56, startBpm: 46, pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17, practice: false, caption: 'Son squelette : <b>do</b> au 1er temps (fa mineur), <b>mi♭</b> au 3e (mi♭/sol), <b>do</b> au 1er temps de la mesure 2 (la♭), <b>do</b> au 3e (do 7). Entre eux : fa, ré♭ (notes de l’accord ou de passage), la broderie si♮ – do – ré♭ autour de do, et le rythme pointé do – si♮.' })}

<h2>Pourquoi la broderie chromatique</h2>
<p>En fa mineur, la voisine du dessous de do est si♭, dans la gamme. Chopin choisit <b>si♮</b>, un demi-ton plus haut : la note est plus proche, elle « tire » vers do comme une sensible. La broderie devient plus tendue, plus vocale.</p>
${W.ecoute({ title: 'La voisine du dessous : si♭ ou si♮', bpm: 56, items: [
  { label: 'Broderie dans la gamme (do – si♭ – do)', seq: ['do4:1.5 | si♭3:0.5 | do4:2', 'fa1 do2 la♭2 fa3:4'], note: 'Un ton entier : la broderie est douce, sans direction.' },
  { label: 'Broderie chromatique (do – si♮ – do)', seq: ['do4:1.5 | si3:0.5 | do4:2', 'fa1 do2 la♭2 fa3:4'], note: 'Un demi-ton, hors de la gamme : la note tire vers do. C’est celle de Chopin.' },
] })}

<h2>Un autre thème sur les mêmes accords</h2>
${W.score({ abc: EX_NOCT_SQ, title: '1. Un autre squelette', bpm: 56, practice: false, caption: 'La♭ – si♭ | do – si♭ | la♭ – sol | la♭ – sol : deux notes de l’accord par mesure, voisines les unes des autres.' })}
${W.score({ abc: EX_NOCT_HAB, title: '2. Le même, habillé', bpm: 56, startBpm: 46, practice: false, caption: 'Broderie sol autour de la♭ (mesure 1), broderie chromatique si♮ autour de do (mesure 2, comme Chopin), passage la♭ – fa – sol (mesure 3), et mi♮ (la sensible) à la fin, qui appelle fa.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im3', steps: [
  { id: 'prelude', title: 'Préluder en fa mineur', preset: 'n1-nocturne', mode: 'libre', loops: 1, lh: 'moi', formula: 'arpege', bpm: 60,
    what: 'Avant ton nocturne, trente secondes pour installer la tonalité : la cadence i – iv – V7 – i en fa mineur, la main gauche en arpège (la basse, puis l’accord égrené), la main droite qui pose une note longue par accord et finit sur fa. Écoute d’abord la main gauche.',
    why: 'Les pianistes du XIXe siècle préludaient avant de jouer une pièce (Czerny en a fait une méthode, l’op. 200) : l’oreille et les mains entrent dans la tonalité, et le trac retombe. Tu le feras au début de chaque étape Pièce.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.75 }, { k: 'final' }] },
  { id: 'chopin', title: 'Le squelette de Chopin', preset: 'nocturne-op55', mode: 'squelette', loops: 1,
    what: 'Les notes en or sont celles de Chopin aux temps 1 et 3 : joue-les seules, en blanches. C’est sa mélodie, sans ses ornements.',
    why: 'Sous les ornements, une ligne très simple : do, mi♭, do, do… La voir nue explique tout le reste.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'rhythm', v: 'longues' }] },
  { id: 'ton-squelette', title: 'Ton squelette', preset: 'nocturne-op55', mode: 'libre', loops: 1,
    what: 'Un autre squelette : deux notes de l’accord par mesure (temps 1 et 3), chacune voisine de la précédente, comme le modèle (la♭ – si♭ | do – si♭…).',
    why: 'Tu choisis ta propre ligne dans les mêmes accords : c’est déjà composer.',
    checks: [{ k: 'rhythm', v: 'longues' }, { k: 'strong', min: 0.8 }, { k: 'stepwise', max: 4, min: 0.7 }] },
  { id: 'chromatique', title: 'La broderie chromatique', preset: 'nocturne-op55', mode: 'libre', loops: 1,
    what: 'Habille ton squelette d’au moins deux broderies chromatiques, comme Chopin : la note, le demi-ton en dessous (hors de la gamme), la note.',
    why: 'La couleur du nocturne tient en partie à ces demi-tons qui tirent vers la note.',
    checks: [{ k: 'figure', f: 'chromatique', min: 2 }, { k: 'strong', min: 0.7 }] },
  { id: 'pointe', title: 'Le rythme pointé de Chopin', preset: 'nocturne-op55', mode: 'libre', loops: 1,
    what: 'Le thème de l’op. 55 avance en rythmes pointés (une longue, puis une brève qui lance la note suivante). Glisses-en au moins deux dans ton thème.',
    why: 'Le rythme pointé donne à la mélodie son élan de marche lente, presque funèbre.',
    checks: [{ k: 'rhythm', v: 'pointe', min: 2 }, { k: 'strong', min: 0.7 }] },
  { id: 'qr', title: 'Question – réponse sur les harmonies de Chopin', preset: 'nocturne-op55', mode: 'qr',
    what: 'L’appli joue deux mesures, tu réponds : notes de l’accord aux temps 1 et 3, même rythme au départ, fin sur une note stable.',
    why: 'Tout le vocabulaire de la leçon, dans un dialogue en temps réel.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'deux-mains', title: 'À deux mains, main gauche simplifiée', preset: 'nocturne-op55', mode: 'libre', loops: 1, hands: true, formula: 'basse-accord', bpm: 48,
    what: 'Les harmonies de Chopin à ta main gauche, simplifiées : pour chaque accord (deux par mesure), la basse puis l’accord serré sous le do central (en brun). Main droite : ton squelette, en blanches. Trois étapes : l’appli joue tout, puis la basse seule, puis le clic seul.',
    why: 'Chopin écrit sa main gauche plus large (l’accord monte au-dessus du do central), mais l’harmonie est la même. La jouer toi-même, c’est sentir sous les doigts ce que ta mélodie habille.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'rhythm', v: 'longues' }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Perdre le temps sur les ornements.</b> La main gauche de Chopin ne ralentit pas : l’ornement doit tenir dans le temps.</li>
<li><b>Oublier que l’accord change à la demi-mesure.</b> Regarde la grille : deux accords par mesure, deux appuis.</li>
<li><b>Une broderie chromatique au-dessus qui sonne faux.</b> En mineur, la plus naturelle est celle du dessous (si♮ sous do).</li>
</ul>`)}
${W.tip('Pourquoi c’est utile pour jouer la pièce', '<p>Une fois que tu as improvisé sur ces accords, la mélodie de Chopin n’est plus une suite de notes à retenir : c’est un choix parmi d’autres, que tu comprends. Tu la mémorises mieux, et tu sais quelles notes appuyer (les notes de l’accord aux temps forts) et lesquelles alléger (les broderies).</p>')}
`,
  },

  /* ================================================================ 8 */
  {
    id: 'n1-im4', minutes: 25,
    title: 'Huit mesures : la période',
    summary: 'Tout réunir dans une forme : une question de quatre mesures qui s’arrête sur V, une réponse de quatre mesures qui conclut sur i.',
    essentials: [
      'La <b>période</b> : un <b>antécédent</b> de quatre mesures qui finit sur la dominante (demi-cadence), puis un <b>conséquent</b> qui commence pareil et finit sur la tonique (cadence parfaite).',
      'Le motif de la mesure 1 revient à la mesure 5 ; le <b>sommet</b> est dans la réponse, juste avant la cadence.',
      'La même forme dans tous les styles : romance, nocturne.',
    ],
    goals: ['Construire une période de huit mesures, et connaître une autre forme (2 + 2 + 4).', 'L’improviser sans t’arrêter, avec un sommet et deux cadences claires, dans plusieurs tonalités, puis à deux mains.'],
    goal: 'huit mesures sans t’arrêter : une demi-cadence tenue en mesure 4, le motif de retour en mesure 5, un sommet, une cadence parfaite en mesure 8.',
    body: W => `
<p>Les leçons précédentes t’ont donné des briques : motif, question et réponse, notes de l’accord, passages, soupirs, un style. La ${W.term('période', 'phrase de huit mesures en deux moitiés : un antécédent qui s’arrête sur la dominante, un conséquent qui commence pareil et conclut sur la tonique')} les assemble. C’est la forme de milliers de thèmes classiques et romantiques : celui de ton nocturne en est un, en deux fois quatre mesures.</p>

${W.score({ abc: EX_PERIODE, title: 'Une période en fa mineur', bpm: 60, startBpm: 52, pedal: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28], pedalEnd: 32, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_PERIODE }], caption: 'Grille : i – iv – i – V | i – iv – V7 – i. Les mesures 5-6 reprennent les mesures 1-2 ; la mesure 6 monte vers le sommet (sol, mesure 7), puis la sensible mi♮ mène à fa. Dans la version phrasée, écoute la respiration après la demi-cadence et le ralenti final.' })}

<h2>Pourquoi ça marche</h2>
<p>La période joue sur l’attente. La demi-cadence (sur V, en mesure 4) pose une question : on attend la suite. Le conséquent commence comme l’antécédent, pour qu’on reconnaisse la phrase, puis il prend un autre chemin et conclut sur la tonique. Le sommet placé juste avant la cadence donne l’élan final ; placé trop tôt, il n’y a plus rien à attendre.</p>

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n1-im4', steps: [
  { id: 'cadences', title: 'Une question, une réponse', preset: 'n1-qr', mode: 'libre', loops: 2,
    what: 'Huit mesures : la question (mesures 1 à 4) s’arrête sur une note de do majeur (do, mi ou sol), <b>tenue</b> ; la réponse (mesures 5 à 8) finit sur fa.',
    why: 'La ponctuation d’abord : une virgule en mesure 4, un point en mesure 8. Sans elles, huit mesures ne font pas une phrase.',
    checks: [{ k: 'cadences', half: 4, full: 8 }] },
  { id: 'retour', title: 'Le motif revient en mesure 5', preset: 'n1-qr', mode: 'libre', loops: 2,
    what: 'Même chose, et la mesure 5 reprend le rythme (et si possible les premières notes) de la mesure 1.',
    why: 'Le retour du début fait entendre que la réponse répond à la question : c’est la signature de la période.',
    checks: [{ k: 'cadences', half: 4, full: 8 }, { k: 'repeatStart', a: 1, b: 5 }] },
  { id: 'sommet', title: 'Le sommet dans la réponse', preset: 'n1-qr', mode: 'libre', loops: 2,
    what: 'Garde ta note la plus aiguë pour les mesures 6 ou 7, juste avant la cadence.',
    why: 'Le sommet donne l’élan final ; placé avant, il ne reste plus rien à attendre.',
    checks: [{ k: 'cadences', half: 4, full: 8 }, { k: 'repeatStart', a: 1, b: 5 }, { k: 'peak', from: 6, to: 7 }] },
  { id: 'style', title: 'Dans un style', preset: 'romance-mi', presets: ['romance-mi', 'nocturne-op55'], mode: 'libre', loops: 1,
    what: 'La même forme sur la grille de la romance (mi mineur, à trois temps) ou sur les harmonies de ton nocturne (menu de l’accompagnateur).',
    why: 'Une forme n’appartient à aucun style : elle organise n’importe quel vocabulaire.',
    checks: [{ k: 'cadences', half: 4, full: 8 }, { k: 'nonstop', bars: 7 }] },
  { id: 'tonalites', title: 'Dans deux autres tonalités', preset: 'n1-qr', mode: 'libre', loops: 2, keys: [{ tr: -5, label: 'do mineur' }, { tr: 4, label: 'la mineur' }],
    what: 'La période en do mineur, puis en la mineur : demi-cadence, retour du motif, cadence parfaite.',
    why: 'Quand la forme tient dans trois tonalités, elle est vraiment à toi.',
    checks: [{ k: 'cadences', half: 4, full: 8 }, { k: 'repeatStart', a: 1, b: 5 }] },
  { id: 'phrase', title: 'Une autre forme : présenter, répéter, conclure', preset: 'n1-qr', mode: 'libre', loops: 2,
    what: 'Une idée de deux mesures (mesures 1-2), répétée sur les accords suivants (mesures 3-4, mêmes rythmes, autres notes si besoin), puis quatre mesures qui vont droit à la cadence, sans retour du début. Fin sur fa.',
    why: 'Deux idées de forme existent à l’échelle de huit mesures : la période (question, réponse qui reprend le début) et la « phrase » : présenter, répéter, puis accélérer vers la fin (Beethoven ouvre ainsi sa sonate op. 2 n° 1). Connaître les deux, c’est choisir.',
    checks: [{ k: 'repeatStart', a: 1, b: 3 }, { k: 'final' }, { k: 'nonstop', bars: 7 }] },
  { id: 'deux-mains', title: 'La période à deux mains', preset: 'n1-qr', mode: 'libre', loops: 1, hands: true, formula: 'basse-accord', bpm: 54,
    what: 'La période entière sur ta propre main gauche (basse et accord), en trois étapes : l’appli joue tout, puis la basse seule, puis le clic seul. Une demi-cadence tenue en mesure 4, une cadence parfaite en mesure 8.',
    why: 'C’est l’épreuve d’improvisation du niveau, telle qu’un pianiste la joue : seul, les deux mains, une forme claire.',
    checks: [{ k: 'cadences', half: 4, full: 8 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Une demi-cadence sur la tonique.</b> La question s’arrête sur do, mi ou sol (l’accord de do), pas sur fa.</li>
<li><b>Une demi-cadence trop courte.</b> Tiens la note au moins un temps, et respire : on doit entendre la question.</li>
<li><b>Un sommet trop tôt.</b> Garde la note la plus aiguë pour les mesures 6-7.</li>
</ul>`)}
<p class="small">C’est le critère d’improvisation de l’<a href="#/validation/n1">évaluation de fin de niveau</a>.</p>
`,
  },
];
