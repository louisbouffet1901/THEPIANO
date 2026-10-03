// Niveau 1 — Théorie : un cours complet en partant des bases.
// Chaque chapitre s'appuie sur le passage du Nocturne op. 55 n° 1 travaillé la même semaine (voir le plan).
import { OP55 } from './content-excerpts.js';

/* ---------- Partitions des chapitres ---------- */
const STAFF_LANDMARKS = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^do3"C "^sol3"G "^do4"c "^sol4"g |]
[V:LH] "_do2"C, "_fa2"F, "_do3"C "_fa1"F,, |]`;

const OP55_NAMES = `X:1
M:4/4
L:1/16
K:Fmin
%%score {RH | LH}
%%barnumbers 1
%%setbarnb 0
V:RH clef=treble
V:LH clef=bass
[V:RH] ("^do"c4- | c4 "^fa"f4 "^mi♭"e4 "^ré♭"d4 | "^do"c3"^si♮"=B c3"^ré♭"d c8- | c4) (f4 e4 d4 | c3=B c3d c8) |]
[V:LH] z4 | "_fa1".F,,4 .[A,CF]4 "_sol1".G,,4 .[E,B,E]4 | "_la♭1".A,,4 .[CA]4 "_mi1".=E,,4 .[B,CG]4 | "_fa1".F,,4 .[A,CF]4 "_sol1".G,,4 .[E,B,E]4 | "_la♭1".A,,4 .[CA]4 "_mi1".=E,,4 .[B,CG]4 |]`;

const VALUES = `X:1
M:4/4
L:1/8
K:C clef=perc
"^ronde"B8 | "^blanches"B4 B4 | "^noires"B2 B2 B2 B2 | "^croches"BB BB BB BB | "^doubles croches"B/B/B/B/ B/B/B/B/ B/B/B/B/ B/B/B/B/ |]`;

const RESTS = `X:1
M:4/4
L:1/8
K:C clef=perc
"^pause"z8 | "^demi-pause"B4 z4 | "^soupir"B2 z2 B2 z2 | "^demi-soupir"zB zB zB zB |]`;

const DOTS = `X:1
M:4/4
L:1/8
K:C clef=perc
"^blanche pointée"B6 B2 | "^noire pointée + croche"B3B B3B | "^liaison"B4- B2 B2 | B8 |]`;

const METERS = `X:1
M:2/4
L:1/8
K:C clef=perc
"^2/4"!>!B2 B2 | !>!B2 B2 |[M:3/4] "^3/4"!>!B2 B2 B2 | !>!B2 B2 B2 |[M:4/4] "^4/4"!>!B2 B2 B2 B2 | !>!B2 B2 B2 B2 |[M:6/8] "^6/8"!>!BBB BBB | !>!BBB BBB |]`;

const SCALE_C = `X:1
M:4/4
L:1/4
K:C
"^1"C "^2"D "^3"E "^4"F | "^5"G "^6"A "^7"B "^8"c |]`;

const SCALE_AB = `X:1
M:4/4
L:1/4
K:Ab
"^1"A, "^2"B, "^3"C "^4"D | "^5"E "^6"F "^7"G "^8"A |]`;

const MINOR_SCALES = `X:1
M:4/4
L:1/8
K:Am
"^naturelle"A B c d e f g a | "^harmonique"A B c d e f ^g a | "^mélodique (montée)"A B c d e ^f ^g a | "^mélodique (descente)"a =g =f e d c B A |]`;

const INTERVALS_ABC = `X:1
M:4/4
L:1/2
K:C
"^2de M"[CD] "^3ce m"[C_E] | "^3ce M"[CE] "^4te J"[CF] | "^5te J"[CG] "^6te M"[CA] | "^7e m"[C_B] "^8ve"[Cc] |]`;
const TRIADS = `X:1
M:4/4
L:1/4
K:C
"^majeur"[CEG]2 "^mineur"[C_EG]2 | "^diminué"[C_E_G]2 "^augmenté"[CE^G]2 |]`;
const INVERSIONS = `X:1
M:4/4
L:1/4
K:C
"^état fondamental (5)""_do"[CEG]4 | "^1er renversement (6)""_do/mi"[EGc]4 | "^2e renversement (6/4)""_do/sol"[Gce]4 |]`;
const FUNCTIONS = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^T"[FAc]4 "^SD"[FBd]4 | "^D"[=EGB]4 "^T"[FAc]4 |]
[V:LH] "_i"F,,4 "_iv"B,,4 | "_V7"C,4 "_i"F,,4 |]`;
const CADENCES = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^parfaite"[FAc] [DFB] [EGc]2 || "^demi-cadence"[EGc] [FAc] [DGB]2 || "^plagale"[EGc] [FAc] [EGc]2 || "^rompue"[FAc] [DFB] [EAc]2 |]
[V:LH] "_IV"F, "_V7"G,, "_I"C,2 || "_I"C, "_IV"F, "_V"G,,2 || "_I"C, "_IV"F, "_I"C,2 || "_IV"F, "_V7"G,, "_vi"A,,2 |]`;
const NONCHORD = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] E2 "^passage"F2 G4 | G2 "^broderie"A2 G4 | "^appoggiature"c4 B4 | "^préparation"c8- | "^retard"c4 B4 | c8 |]
[V:LH] "_I"[C,E,G,]8 | [C,E,G,]8 | "_V"[G,,B,,D,]8 | "_I"[C,E,G,]8 | "_V"[G,,B,,D,]8 | "_I"[C,E,G,]8 |]`;

const E7_INTERVALS = `X:1
M:4/4
L:1/16
K:Fmin
%%score (V1 V2)
V:V1 clef=treble stem=up
V:V2 clef=treble stem=down
[V:V1] "^2de M"c4 "^6te M"f4 "^7e m"f4 "^8ve"f4 |]
[V:V2] B4 A4 G4 F4 |]`;

const REDUCTION_65_72 = `X:1
M:4/4
L:1/4
K:Fmin
%%score {RH | LH}
%%barnumbers 1
%%setbarnb 65
V:RH clef=treble
V:LH clef=bass
[V:RH] [_GBd]4 | [_GBd]4 | [=EGBd]4 | [=EGBd]4 | [FA_c]4 | [FA_c]4 | [=EGc]4 | H[=EGBc]4 |]
[V:LH] D,4 | D,4 | D,4 | D,4 | D,4 | D,4 | C,4 | HC,,4 |]`;

const AN_RED = {
  key: 'fa mineur (fin du Più mosso)',
  bars: [
    { m: 65, ch: [['sol♭/ré♭', '♭II6/4', 'SD', 1]] },
    { m: 66, ch: [['sol♭/ré♭', '♭II6/4', 'SD', 1]] },
    { m: 67, ch: [['mi °7/ré♭', 'vii°4/2', 'D', 1]] },
    { m: 68, ch: [['mi °7/ré♭', 'vii°4/2', 'D', 1]] },
    { m: 69, ch: [['ré♭ fa la♭ do♭', 'sixte augm.', 'SD', 1]] },
    { m: 70, ch: [['(même accord)', '', 'SD', 1]] },
    { m: 71, ch: [['do', 'V', 'D', 1]] },
    { m: 72, ch: [['do 7', 'V7', 'D', 1]] },
  ],
  notes: [
    'Sol♭ majeur est l’accord de la sixte napolitaine (♭II), ici avec ré♭ à la basse.',
    'Mi – sol – si♭ – ré♭ : une septième diminuée, avec sa septième (ré♭) à la basse.',
    'La sixte augmentée (ré♭ – fa – la♭ – do♭) s’ouvre sur do : do majeur, puis do 7 au point d’orgue.',
  ],
};

/* ---------- Chapitres ---------- */
export default [
  {
    id: 'n1-th-notes', minutes: 15,
    title: 'Les notes et le clavier',
    summary: 'Les sept noms de notes, le clavier, les octaves, les demi-tons et les altérations : le vocabulaire de base.',
    goals: ['Nommer n’importe quelle touche du clavier.', 'Connaître le système des octaves (do3 = do central).', 'Comprendre demi-ton, ton, dièse, bémol et bécarre.'],
    body: W => `
<p>Avant de parler d’harmonie, il faut un vocabulaire sûr. Ce premier chapitre reprend tout depuis le début : le nom des notes, leur place sur le clavier, la manière de les modifier. Tu le connais sans doute en partie ; prends quand même le temps de faire les exercices, ils fixent des automatismes utiles toute ta vie de pianiste.</p>

<h2>Sept noms pour douze sons</h2>
<p>La musique occidentale utilise sept noms de notes qui reviennent en boucle : <b>do – ré – mi – fa – sol – la – si</b>, puis de nouveau do, plus aigu. Les pays anglophones et germaniques emploient des lettres, que l’on retrouve dans les noms d’accords (« C7 », « Fm ») :</p>
<table>
<thead><tr><th>do</th><th>ré</th><th>mi</th><th>fa</th><th>sol</th><th>la</th><th>si</th></tr></thead>
<tbody><tr><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>A</td><td>B</td></tr></tbody>
</table>
<p>Sur le clavier, les touches noires sont groupées par deux et par trois : ce sont elles qui servent de repères.</p>
${W.kbd({ from: 48, to: 72, names: 'all', title: 'Les touches blanches, de do2 à do4', play: 'seq', seq: [48, 50, 52, 53, 55, 57, 59, 60], caption: 'Do est juste à gauche du groupe de deux touches noires ; fa juste à gauche du groupe de trois.' })}
<ul>
<li><b>do</b> : à gauche des deux touches noires ; <b>ré</b> : entre elles ; <b>mi</b> : à leur droite ;</li>
<li><b>fa</b> : à gauche des trois touches noires ; <b>sol</b> et <b>la</b> : entre elles ; <b>si</b> : à leur droite.</li>
</ul>

<h2>Les octaves</h2>
<p>De do au do suivant, il y a une <b>octave</b> : huit touches blanches (do ré mi fa sol la si do). Le piano en couvre un peu plus de sept : 88 touches, du la-1 (la plus grave) au do7 (la plus aiguë). Pour savoir de quel do on parle, on ajoute un numéro : en France, le <b>do central</b>, au milieu du clavier, s’appelle <b>do3</b>. Les notes suivantes sont ré3, mi3… jusqu’à si3 ; puis vient do4.</p>
${W.tip('Deux conventions', '<p>Les ouvrages anglophones appellent le do central <b>C4</b> : un numéro de plus qu’en France. Dans cette application, on utilise la convention française : do3 = do central.</p>')}

<h2>Demi-tons et tons</h2>
<p>Le plus petit écart entre deux touches voisines, blanche ou noire, est le <b>demi-ton</b>. Deux demi-tons font un <b>ton</b>.</p>
<ul>
<li>do → do♯ : un demi-ton ; do → ré : un ton.</li>
<li>Entre <b>mi et fa</b>, et entre <b>si et do</b>, il n’y a pas de touche noire : ces paires de touches blanches ne sont qu’à un demi-ton.</li>
</ul>
${W.kbd({ from: 60, to: 72, title: 'Les deux demi-tons « blancs »', marks: [{ m: 64, label: 'mi', color: '#f2d9a8' }, { m: 65, label: 'fa', color: '#f2d9a8' }, { m: 71, label: 'si', color: '#f2d9a8' }, { m: 72, label: 'do', color: '#f2d9a8' }], names: 'none', caption: 'Mi–fa et si–do : deux touches blanches voisines, à un demi-ton.' })}

<h2>Les altérations</h2>
<ul>
<li>Le <b>dièse</b> (♯) hausse une note d’un demi-ton : fa♯ est la touche juste à droite de fa.</li>
<li>Le <b>bémol</b> (♭) l’abaisse d’un demi-ton : si♭ est la touche juste à gauche de si.</li>
<li>Le <b>bécarre</b> (♮) annule un dièse ou un bémol : la note redevient « naturelle ».</li>
</ul>
<p>Une touche noire porte donc deux noms : do♯ = ré♭, fa♯ = sol♭… Ces notes sont <b>enharmoniques</b> : même son, nom différent. Le nom employé dépend de la tonalité (chapitre sur les gammes). Une touche blanche peut aussi porter un nom altéré : mi♯ = fa, si♯ = do, do♭ = si, fa♭ = mi.</p>
${W.kbd({ from: 60, to: 72, title: 'Une touche, deux noms', marks: [{ m: 61, label: 'do♯' }, { m: 63, label: 'mi♭' }, { m: 66, label: 'fa♯' }, { m: 68, label: 'la♭' }, { m: 70, label: 'si♭' }], names: 'none', caption: 'do♯ = ré♭ ; mi♭ = ré♯ ; fa♯ = sol♭ ; la♭ = sol♯ ; si♭ = la♯.' })}

${W.key('À retenir', '<ul><li>Sept noms de notes : do ré mi fa sol la si (C D E F G A B).</li><li>Do à gauche des deux touches noires, fa à gauche des trois.</li><li>Do3 = do central (convention française ; C4 en anglais).</li><li>Demi-ton = deux touches voisines ; mi–fa et si–do sont des demi-tons.</li><li>♯ hausse, ♭ abaisse, ♮ annule ; une touche noire a deux noms.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Croire qu’il y a une touche noire entre chaque paire de touches blanches : pas entre mi et fa, ni entre si et do.</li><li>Mélanger les conventions d’octave : C4 (anglais) = do3 (français).</li><li>Penser qu’un dièse est toujours une touche noire : mi♯ est la touche blanche fa.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 1 à 8</h2>
<p>La mélodie du nocturne commence par <b>do – fa – mi♭ – ré♭ – do</b> (do4, fa4, mi♭4, ré♭4, do4). Mi♭ et ré♭ sont des touches noires : ce sont des bémols de l’armure (on y reviendra). À la mesure 2, la mélodie fait <b>do – si♮ – do – ré♭ – do</b> : si♮ et ré♭ sont les deux voisines immédiates de do, à un demi-ton de chaque côté.</p>
${W.kbd({ from: 67, to: 79, title: 'La mélodie des mesures 1 et 2', marks: [{ m: 72, label: 'do' }, { m: 77, label: 'fa' }, { m: 75, label: 'mi♭' }, { m: 73, label: 'ré♭' }, { m: 71, label: 'si♮' }], names: 'none', play: 'seq', seq: [72, 77, 75, 73, 72, 71, 72, 73, 72], step: 0.42, caption: 'Do4, fa4, mi♭4, ré♭4, puis la broderie si♮ – do – ré♭ autour de do.' })}
<p>La main gauche joue bien plus grave : ses basses sont <b>fa1, sol1, la♭1</b> et <b>mi1</b> (avec un bécarre : mi♮), plus de deux octaves sous la mélodie.</p>
${W.score({ abc: OP55_NAMES, title: 'Mesures 1 à 4, avec le nom des notes', bpm: 56, startBpm: 50, analysis: false })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Les repères', '<p>Pose le pouce droit sur chaque do du piano, du plus grave au plus aigu, en disant son numéro. Fais de même avec tous les fa.</p><details><summary>Corrigé</summary><div><p>Il y a huit do sur un piano de 88 touches : do0, do1… jusqu’à do7, la dernière touche. Le do central, do3, est le quatrième en partant du grave.</p></div></details>')}
${W.exo('Exercice 2 — Compter les demi-tons', '<p>Combien de demi-tons de do à mi ? de mi à sol ? de si à ré ? de fa à si ?</p><details><summary>Corrigé</summary><div><p>Do → mi : 4 (do♯, ré, ré♯, mi). Mi → sol : 3 (fa, fa♯, sol). Si → ré : 3 (do, do♯, ré). Fa → si : 6.</p></div></details>')}
${W.quiz({ kind: 'keyname', title: 'Nommer les touches blanches', count: 10, stat: 'kname' })}
${W.quiz({ kind: 'keyname', black: 'only', title: 'Nommer les touches noires', count: 8, stat: 'kname-b' })}
${W.quiz({ kind: 'findnote', title: 'Au piano : trouver une note', count: 10, stat: 'findnote' })}
`,
  },

  {
    id: 'n1-th-portee', minutes: 20,
    title: 'Lire les notes : la portée, les clés de sol et de fa',
    summary: 'La portée, les deux clés du piano, les lignes supplémentaires, et une méthode de lecture par repères.',
    goals: ['Lire les notes en clé de sol et en clé de fa.', 'Utiliser des notes-repères pour lire vite.', 'Situer chaque note de ta partition sur le clavier.'],
    body: W => `
<h2>La portée</h2>
<p>Les notes s’écrivent sur une <b>portée</b> de cinq lignes et quatre interlignes, numérotés de bas en haut. Plus une note est haute sur la portée, plus elle est aiguë. Au-delà de la portée, on ajoute de petites <b>lignes supplémentaires</b>.</p>

<h2>Les deux clés du piano</h2>
<p>La <b>clé</b>, au début de chaque ligne, donne le nom d’une ligne de la portée ; on en déduit toutes les autres.</p>
<ul>
<li><b>Clé de sol</b> (en général la main droite) : elle s’enroule autour de la <b>2e ligne</b>, qui porte <b>sol3</b>.</li>
<li><b>Clé de fa</b> (en général la main gauche) : ses deux points encadrent la <b>4e ligne</b>, qui porte <b>fa2</b>.</li>
</ul>
<p>Les deux portées, réunies par une accolade, forment la <b>double portée</b> du piano. Le do central (do3) s’écrit sur une ligne supplémentaire, juste sous la portée de clé de sol, ou juste au-dessus de celle de clé de fa : c’est la même note, la même touche.</p>
${W.score({ abc: STAFF_LANDMARKS, title: 'Les notes-repères', bpm: 50, practice: false, hands: false, caption: 'Clé de sol : do3 (ligne supplémentaire), sol3 (2e ligne), do4 (3e interligne), sol4 (au-dessus de la portée). Clé de fa : do2 (2e interligne), fa2 (4e ligne), do3 (ligne supplémentaire), fa1 (sous la portée).' })}

<h2>Lire par repères, puis par voisinage</h2>
<p>Inutile de compter les lignes depuis le bas à chaque note. On mémorise quelques <b>notes-repères</b> (celles de l’exemple ci-dessus), puis on lit les autres par voisinage :</p>
<ul>
<li>d’une ligne à l’interligne juste au-dessus : la note suivante (do → ré) ;</li>
<li>d’une ligne à la ligne suivante : on saute une note (do → mi), c’est une <b>tierce</b> ;</li>
<li>les notes d’un accord simple (do – mi – sol) s’empilent ligne-ligne-ligne, ou interligne-interligne-interligne.</li>
</ul>

<h2>Ce qui modifie la note écrite</h2>
<ul>
<li>L’<b>armure</b>, après la clé : les altérations valables pour toute la pièce (dans l’op. 55 : si♭, mi♭, la♭, ré♭).</li>
<li>Les <b>altérations accidentelles</b>, devant une note : elles valent jusqu’à la fin de la mesure, pour cette note à cette hauteur.</li>
</ul>

${W.key('À retenir', '<ul><li>Clé de sol : sol3 sur la 2e ligne. Clé de fa : fa2 sur la 4e ligne.</li><li>Do3, le do central : une ligne supplémentaire entre les deux portées.</li><li>Lire par repères (do3, sol3, do4 ; do2, fa2, fa1), puis par voisinage.</li><li>Armure : toute la pièce. Altération accidentelle : jusqu’à la barre de mesure.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Lire la clé de fa comme une clé de sol : en clé de fa, la note de la 2e ligne est un si, pas un sol.</li><li>Oublier l’armure : dans l’op. 55, tous les si, mi, la et ré sont bémols, sauf indication contraire.</li><li>Prolonger une altération accidentelle au-delà de la mesure.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 1 à 8</h2>
<ul>
<li><b>Main droite (clé de sol)</b> : le do4 de la levée est dans le 3e interligne ; fa4 sur la 5e ligne, tout en haut ; mi♭4 dans le 4e interligne ; ré♭4 sur la 4e ligne. Le si♮3 de la mesure 2 est sur la 3e ligne, avec un bécarre.</li>
<li><b>Main gauche (clé de fa)</b> : fa1 sous la portée, sol1 sur la 1re ligne, la♭1 dans le 1er interligne, mi1 sur la 1re ligne supplémentaire du bas (avec un bécarre). Les accords montent au-dessus de la portée : le do3 est sur la ligne supplémentaire du haut.</li>
<li><b>L’armure</b> : quatre bémols ; d’où les touches noires de la mélodie (mi♭, ré♭).</li>
</ul>
${W.score({ abc: OP55_NAMES, title: 'Mesures 1 à 4 : repère chaque note', bpm: 56, startBpm: 50, analysis: false })}
${W.score({ abc: OP55.e2, title: 'Mesures 5 à 8', bpm: 56, startBpm: 50 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Lire sans jouer', '<p>Sur la partition des mesures 5 à 8, lis à voix haute les basses de la main gauche (temps 1 et 3 de chaque mesure).</p><details><summary>Corrigé</summary><div><p>Mesure 5 : fa1, sol1. Mesure 6 : la♭1, si♭1. Mesure 7 : do2, do1. Mesure 8 : fa1, fa1.</p></div></details>')}
${W.exo('Exercice 2 — La même note dans les deux clés', '<p>Où s’écrit do3 en clé de sol ? en clé de fa ? Et sol2 ?</p><details><summary>Corrigé</summary><div><p>Do3 : sur la 1re ligne supplémentaire sous la portée (clé de sol), ou sur la 1re ligne supplémentaire au-dessus (clé de fa). Sol2 : dans le 4e interligne de la clé de fa (en clé de sol, il faudrait quatre lignes supplémentaires : on ne l’écrit pas ainsi).</p></div></details>')}
${W.quiz({ kind: 'notes', clefs: ['treble'], title: 'Notes en clé de sol', count: 12, stat: 'notes-t' })}
${W.quiz({ kind: 'notes', clefs: ['bass'], title: 'Notes en clé de fa', count: 12, stat: 'notes-b' })}
${W.quiz({ kind: 'notes', mode: 'play', title: 'Au piano : joue la note écrite, à la bonne hauteur', count: 10, stat: 'notes-play' })}
`,
  },

  {
    id: 'n1-th-rythme', minutes: 20,
    title: 'Le rythme : durées, silences, points et liaisons',
    summary: 'Les figures de notes et de silences, le point, la liaison, les groupes irréguliers — et comment les compter.',
    goals: ['Connaître la durée de chaque figure et de chaque silence.', 'Lire le point et la liaison.', 'Compter un rythme à voix haute, croches et triolets compris.'],
    body: W => `
<p>La hauteur dit <i>quelle</i> note jouer ; le rythme dit <i>quand</i>, et <i>combien de temps</i>. Les durées se mesurent en <b>temps</b> : la pulsation régulière que l’on bat du pied.</p>

<h2>Les figures de notes</h2>
<table>
<thead><tr><th>Figure</th><th class="num">Durée (en temps de noire)</th><th>Syllabe pour la lire</th></tr></thead>
<tbody>
<tr><td>ronde</td><td class="num">4</td><td>ta-a-a-a</td></tr>
<tr><td>blanche</td><td class="num">2</td><td>ta-a</td></tr>
<tr><td>noire</td><td class="num">1</td><td>ta</td></tr>
<tr><td>croche</td><td class="num">½</td><td>ti (deux croches : ti-ti)</td></tr>
<tr><td>double croche</td><td class="num">¼</td><td>quatre doubles : ti-ri-ti-ri</td></tr>
</tbody></table>
<p>Chaque figure vaut la moitié de la précédente : une ronde = 2 blanches = 4 noires = 8 croches = 16 doubles croches. Les croches et les doubles croches sont souvent reliées par des <b>ligatures</b> (des barres) qui les regroupent par temps : on voit d’un coup d’œil où commence chaque temps.</p>
${W.score({ abc: VALUES, title: 'De la ronde à la double croche', bpm: 66, practice: false, hands: false, click: true })}

<h2>Les silences</h2>
<table>
<thead><tr><th>Silence</th><th class="num">Durée</th><th>Équivaut à</th></tr></thead>
<tbody>
<tr><td>pause</td><td class="num">4 (ou une mesure entière)</td><td>ronde</td></tr>
<tr><td>demi-pause</td><td class="num">2</td><td>blanche</td></tr>
<tr><td>soupir</td><td class="num">1</td><td>noire</td></tr>
<tr><td>demi-soupir</td><td class="num">½</td><td>croche</td></tr>
<tr><td>quart de soupir</td><td class="num">¼</td><td>double croche</td></tr>
</tbody></table>
<p>Un silence se compte exactement comme une note : il fait partie du rythme. La pause est accrochée sous la 4e ligne, la demi-pause posée sur la 3e.</p>
${W.score({ abc: RESTS, title: 'Les silences', bpm: 66, practice: false, hands: false, click: true })}

<h2>Le point et la liaison</h2>
<ul>
<li>Le <b>point</b>, à droite d’une note, ajoute la moitié de sa valeur : blanche pointée = 2 + 1 = 3 temps ; noire pointée = 1 + ½ = 1 temps ½ ; croche pointée = ½ + ¼ = ¾ de temps.</li>
<li>La <b>liaison de prolongation</b> relie deux notes de même hauteur : on joue la première et on tient pendant la durée des deux. Elle permet de tenir une note par-dessus une barre de mesure.</li>
<li>À ne pas confondre avec la <b>liaison d’expression</b> (le legato), qui relie des notes de hauteurs différentes : on les joue toutes, liées entre elles.</li>
</ul>
${W.score({ abc: DOTS, title: 'Le point et la liaison', bpm: 66, practice: false, hands: false, click: true })}

<h2>Les groupes irréguliers</h2>
<ul>
<li><b>Triolet</b> : trois notes dans le temps de deux (trois croches à la place d’une noire), marqué d’un 3.</li>
<li><b>Quintolet, septolet</b> : cinq ou sept notes dans un temps ; on les trouve dans les ornements de Chopin. On place la première note avec le temps, la dernière juste avant le temps suivant, et les autres régulièrement entre les deux.</li>
</ul>

<h2>Compter à voix haute</h2>
<p>Pour lire un rythme, on compte les temps et on y place les notes : « <b>1</b>, <b>2</b>, <b>3</b>, <b>4</b> » pour les noires ; « <b>1</b> et <b>2</b> et » pour les croches (la deuxième croche tombe sur le « et ») ; pour les doubles croches, les syllabes « ti-ri-ti-ri » sont plus commodes. Avec le temps, compter devient intérieur ; au début, à voix haute, c’est la méthode la plus sûre.</p>
${W.tip('Taper avant de jouer', '<p>Tape le rythme dans les mains (ou sur le couvercle du piano) en comptant, avant de jouer le passage : tu sépares la difficulté du rythme de celle des notes.</p>')}

${W.key('À retenir', '<ul><li>Ronde 4, blanche 2, noire 1, croche ½, double croche ¼ (en temps de noire).</li><li>Le point ajoute la moitié de la valeur.</li><li>Liaison de prolongation : même note, on ne rejoue pas.</li><li>Triolet : trois notes à la place de deux.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Raccourcir les notes longues et les silences : on compte jusqu’au bout.</li><li>Confondre la liaison de prolongation (même note, on tient) et la liaison d’expression (notes différentes, legato).</li><li>Jouer « croche pointée – double croche » comme deux croches égales : la double croche est très courte, juste avant le temps suivant.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 1 à 16</h2>
<ul>
<li><b>La levée</b> : le do du début est une noire, liée à la noire du premier temps.</li>
<li><b>Mesure 1</b> : quatre noires à la main droite (do tenu, fa, mi♭, ré♭) ; à la main gauche, quatre noires piquées (le point au-dessus ou au-dessous de la note signifie <i>staccato</i>, détaché).</li>
<li><b>Mesure 2</b> : do (croche pointée) – si♮ (double croche) – do (croche pointée) – ré♭ (double croche), puis une <b>blanche</b> sur do, liée à la noire de la mesure 3 : une note tenue trois temps.</li>
<li><b>Mesure 14</b> : un <b>quintolet</b> (cinq doubles croches dans le temps de quatre), juste après la trille.</li>
</ul>
<p>Dans la mesure 2, un temps vaut quatre doubles croches : la croche pointée en occupe trois, la double croche la quatrième. Compte « ti-ri-ti-<b>ri</b> » : le si♮ tombe sur le dernier « ri ».</p>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4', bpm: 56, startBpm: 46, click: true })}
${W.score({ abc: OP55.e3, title: 'Mesures 13 et 14 : la trille et le quintolet', bpm: 56, startBpm: 40 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Additionner des durées', '<p>Combien de temps (de noire) durent : une blanche pointée ? une noire pointée suivie d’une croche ? une blanche liée à une noire ? quatre doubles croches ? un triolet de croches ?</p><details><summary>Corrigé</summary><div><p>3 temps ; 1 ½ + ½ = 2 temps ; 2 + 1 = 3 temps ; 1 temps ; 1 temps.</p></div></details>')}
${W.exo('Exercice 2 — Le rythme de la pièce', '<p>Tape le rythme de la main droite des mesures 1 à 4 en comptant les temps à voix haute, puis joue-le sur une seule touche, avec le clic de la partition ci-dessus.</p>')}
${W.quiz({ kind: 'measurefill', values: ['w', 'hd', 'h', 'q', 'e'], meters: ['4/4', '3/4'], title: 'Compléter la mesure', count: 10, stat: 'mfill' })}
${W.quiz({ kind: 'rhythm', task: 'read', cells: ['q', 'h', 'ee', 'qr', 'w'], title: 'Lire et taper un rythme', count: 8, stat: 'rread-1' })}
`,
  },

  {
    id: 'n1-th-mesure', minutes: 15,
    title: 'La mesure : temps forts, levée, mesures simples et composées',
    summary: 'Comment les temps se regroupent, où sont les appuis, et ce que signifient 4/4, 3/4 ou 6/8.',
    goals: ['Lire un chiffre de mesure.', 'Situer les temps forts et les temps faibles.', 'Reconnaître une levée et une syncope.'],
    body: W => `
<h2>Pulsation, temps et mesure</h2>
<p>La <b>pulsation</b> est le battement régulier de la musique. Les temps se regroupent par deux, trois ou quatre : chaque groupe est une <b>mesure</b>, délimitée par des <b>barres de mesure</b>. Le premier temps de chaque mesure est un appui naturel : le <b>temps fort</b>.</p>

<h2>Le chiffre de mesure</h2>
<p>Au début de la partition, deux chiffres superposés : celui du haut donne le <b>nombre de temps</b> ; celui du bas, la <b>figure qui vaut un temps</b> (4 = la noire, 2 = la blanche, 8 = la croche).</p>
<table>
<thead><tr><th>Mesure</th><th>Temps</th><th>Appuis</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td>2/4</td><td>2 noires</td><td>fort – faible</td><td>une marche</td></tr>
<tr><td>3/4</td><td>3 noires</td><td>fort – faible – faible</td><td>une valse ; l’op. 15 n° 1</td></tr>
<tr><td>4/4 (ou C)</td><td>4 noires</td><td>fort – faible – mi-fort – faible</td><td>l’op. 55 n° 1</td></tr>
</tbody></table>

<h2>Mesures composées</h2>
<p>Dans une mesure <b>composée</b>, chaque temps se divise naturellement en <b>trois</b> croches : le temps vaut une noire pointée. On les reconnaît au chiffre 8 en bas et à un chiffre du haut multiple de 3 : <b>6/8</b> = 2 temps de noire pointée ; <b>9/8</b> = 3 temps ; <b>12/8</b> = 4 temps. <i>Clair de lune</i>, au niveau 2, est à 9/8.</p>
${W.score({ abc: METERS, title: '2/4, 3/4, 4/4 et 6/8 : écoute où tombent les appuis', bpm: 72, practice: false, hands: false, click: true, caption: 'À 6/8, la mesure se bat en deux temps, chacun divisé en trois croches.' })}

<h2>La levée et la syncope</h2>
<ul>
<li>La <b>levée</b> (ou anacrouse) : une ou plusieurs notes avant la première barre de mesure, qui lancent la phrase vers le premier temps fort. La première mesure complète porte alors le numéro 1.</li>
<li>La <b>syncope</b> : une note attaquée sur un temps faible (ou sur une partie faible du temps) et prolongée sur le temps fort suivant. L’appui est déplacé, ce qui crée une tension expressive.</li>
</ul>

<h2>Le tempo</h2>
<p>Le <b>tempo</b> est la vitesse de la pulsation. ♩ = 60 signifie 60 noires par minute, une par seconde. Les termes italiens le décrivent : <i>Largo, Lento</i> (lent), <i>Andante</i> (allant, au pas), <i>Moderato</i>, <i>Allegro</i> (rapide) ; <i>Più mosso</i> : plus animé ; <i>a tempo</i> : retour au tempo.</p>

${W.key('À retenir', '<ul><li>Chiffre du haut : nombre de temps ; chiffre du bas : figure d’un temps.</li><li>4/4 : fort – faible – mi-fort – faible.</li><li>Mesure composée (6/8, 9/8, 12/8) : temps de noire pointée, divisé en trois.</li><li>Levée : notes avant la première barre ; syncope : appui déplacé.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Compter une mesure à 6/8 en six temps égaux et lents : elle se sent en deux temps.</li><li>Accentuer chaque temps : seul le temps fort est un appui ; les autres sont plus légers.</li><li>Raccourcir la note syncopée : elle doit traverser le temps fort.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 1 à 16</h2>
<ul>
<li><b>4/4</b>, noté C : quatre noires par mesure.</li>
<li><b>Une levée</b> d’un temps : le do du début. C’est pourquoi la première mesure complète porte le numéro 1.</li>
<li><b>Les appuis</b> : la main gauche place sa basse sur les temps 1 et 3 (fort et mi-fort) et ses accords sur les temps 2 et 4 (faibles). Sens la mesure en deux grands temps, la basse comme repère : c’est le balancement du nocturne.</li>
<li><b>Mesures 2-3</b> : le do tenu, attaqué au 3e temps et prolongé sur le temps fort de la mesure 3, est une <b>syncope</b> ; la mélodie repart au 2e temps, sur fa.</li>
</ul>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4, avec le clic', bpm: 56, startBpm: 50, click: true })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Quel chiffre de mesure ?', '<p>Une mesure contient : (a) une blanche pointée ; (b) deux noires pointées ; (c) une blanche et deux noires. Quel chiffre de mesure convient à chacune : 2/4, 3/4, 4/4 ou 6/8 ?</p><details><summary>Corrigé</summary><div><p>(a) 3 temps de noire : 3/4. (b) Deux temps de noire pointée : 6/8. (c) 2 + 1 + 1 = 4 temps : 4/4.</p></div></details>')}
${W.exo('Exercice 2 — Compter en jouant', '<p>Joue les mesures 1 à 4, main gauche seule, en comptant « 1, 2, 3, 4 » à voix haute, avec le clic. Puis main droite seule : où tombe le fa de la mesure 1 ? et le do tenu de la mesure 2 ?</p><details><summary>Corrigé</summary><div><p>Le fa tombe sur le 2e temps de la mesure 1 (le do de la levée occupe le 1er). Le do tenu commence au 3e temps de la mesure 2 et dure jusqu’à la fin du 1er temps de la mesure 3.</p></div></details>')}
${W.quiz({ kind: 'measurefill', values: ['hd', 'h', 'q', 'e'], meters: ['2/4', '3/4', '4/4'], title: 'Compléter des mesures à 2/4, 3/4, 4/4', count: 10, stat: 'mfill-2' })}
${W.quiz({ kind: 'rhythm', task: 'read', meter: 3, cells: ['q', 'h', 'ee', 'qr', 'hd'], title: 'Lire et taper un rythme à 3/4', count: 8, stat: 'rread-3' })}
`,
  },

  {
    id: 'n1-th-gamme', minutes: 20,
    title: 'La gamme majeure et ses degrés',
    summary: 'Le modèle « ton – ton – demi-ton… », la construction de n’importe quelle gamme majeure, et le nom des degrés.',
    goals: ['Construire une gamme majeure sur n’importe quelle note.', 'Nommer les sept degrés.', 'Reconnaître une gamme majeure dans ta pièce.'],
    body: W => `
<h2>Le modèle</h2>
<p>Une gamme majeure, ce sont sept notes de noms différents, de la tonique à la tonique suivante, avec toujours les mêmes écarts : <b>ton – ton – demi-ton – ton – ton – ton – demi-ton</b>.</p>
${W.score({ abc: SCALE_C, title: 'Do majeur : les sept degrés', bpm: 80, practice: false, hands: false, caption: 'Demi-tons entre les degrés 3–4 (mi–fa) et 7–8 (si–do) : exactement là où le modèle les place. C’est la seule gamme majeure sans altération.' })}
<p>On peut aussi voir la gamme comme deux moitiés identiques (deux <b>tétracordes</b>) : do-ré-mi-fa et sol-la-si-do, chacune « ton – ton – demi-ton », séparées par un ton.</p>

<h2>Construire une gamme majeure</h2>
<ol>
<li>Écris les sept noms de notes à partir de la tonique, sans en sauter ni en répéter (sol : sol la si do ré mi fa sol).</li>
<li>Vérifie chaque écart avec le modèle, et ajoute les altérations nécessaires. En sol : de mi à fa, il n’y a qu’un demi-ton, mais le modèle demande un ton entre le 6e et le 7e degré → <b>fa♯</b> ; et fa♯ – sol fait bien le demi-ton final.</li>
</ol>
${W.kbd({ from: 67, to: 79, title: 'Sol majeur (un dièse)', marks: [67, 69, 71, 72, 74, 76, 78, 79].map(m => ({ m })), names: 'marks', flats: false, play: 'seq' })}
${W.kbd({ from: 56, to: 68, title: 'La♭ majeur (quatre bémols)', marks: [56, 58, 60, 61, 63, 65, 67, 68].map(m => ({ m })), names: 'marks', flats: true, play: 'seq', caption: 'Même modèle à partir de la♭ : si♭, mi♭, la♭ et ré♭ sont nécessaires.' })}

<h2>Les degrés</h2>
<table>
<thead><tr><th class="num">Degré</th><th>Nom</th><th>En do majeur</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>tonique</td><td>do</td><td>le repos, la note « maison »</td></tr>
<tr><td class="num">2</td><td>sus-tonique</td><td>ré</td><td>juste au-dessus de la tonique</td></tr>
<tr><td class="num">3</td><td>médiante</td><td>mi</td><td>au milieu entre tonique et dominante ; fait le mode majeur</td></tr>
<tr><td class="num">4</td><td>sous-dominante</td><td>fa</td><td>juste sous la dominante</td></tr>
<tr><td class="num">5</td><td>dominante</td><td>sol</td><td>le second pilier, après la tonique</td></tr>
<tr><td class="num">6</td><td>sus-dominante</td><td>la</td><td>juste au-dessus de la dominante</td></tr>
<tr><td class="num">7</td><td>sensible</td><td>si</td><td>à un demi-ton de la tonique : elle « tire » vers elle</td></tr>
</tbody></table>
<p>Ces numéros sont exactement ceux que tu entraînes dans le module d’oreille (« entendre le degré 3… ») : la théorie et l’oreille parlent de la même chose.</p>

${W.key('À retenir', '<ul><li>Gamme majeure : T – T – ½ – T – T – T – ½.</li><li>Sept noms de notes, chacun une fois ; les altérations viennent du modèle.</li><li>Degrés : tonique, sus-tonique, médiante, sous-dominante, dominante, sus-dominante, sensible.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Sauter ou répéter un nom de note : une gamme n’a jamais à la fois sol♭ et sol.</li><li>Mettre les demi-tons au mauvais endroit : ils sont entre 3–4 et 7–8.</li><li>Appeler « sensible » un 7e degré à un ton de la tonique : ce n’est plus une sensible (on la retrouvera en mineur).</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 17 à 24</h2>
<p>La phrase b quitte un moment fa mineur pour <b>la♭ majeur</b>. L’accord de mi♭ 7 (mesure 17) est la dominante de la♭ ; il se pose sur l’accord de la♭ à la mesure 18. La mélodie suit les degrés de la♭ majeur : si♭ (2), mi♭ (5), fa (6), la♭ (1), si♭ (2), et monte jusqu’à <b>do, la médiante (3)</b>, au début de la mesure 18. Le ré♮ de la mesure 17 est une note étrangère à la gamme : une broderie chromatique de mi♭.</p>
${W.score({ abc: SCALE_AB, title: 'La♭ majeur et ses degrés', bpm: 80, practice: false, hands: false })}
${W.score({ abc: OP55.e4, title: 'Mesures 17 à 20', bpm: 56, startBpm: 46 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Construire', '<p>Écris les gammes de ré majeur, de fa majeur et de mi♭ majeur.</p><details><summary>Corrigé</summary><div><p>Ré majeur : ré mi fa♯ sol la si do♯ ré. Fa majeur : fa sol la si♭ do ré mi fa. Mi♭ majeur : mi♭ fa sol la♭ si♭ do ré mi♭.</p></div></details>')}
${W.exo('Exercice 2 — Les degrés de la♭ majeur', '<p>En la♭ majeur, quelle est la dominante ? la sensible ? la sous-dominante ? la médiante ?</p><details><summary>Corrigé</summary><div><p>Dominante : mi♭. Sensible : sol. Sous-dominante : ré♭. Médiante : do.</p></div></details>')}
${W.quiz({ kind: 'keydegree', keys: ['C', 'G', 'F', 'D', 'Bb', 'Ab', 'Eb'], title: 'Les degrés d’une gamme majeure', count: 10, stat: 'kdeg' })}
${W.quiz({ kind: 'playscale', keys: ['C', 'G', 'F', 'D', 'Ab'], title: 'Au piano : jouer la gamme demandée', count: 5, stat: 'pscale' })}
`,
  },

  {
    id: 'n1-th-armures', minutes: 20,
    title: 'Tonalités, armures et cycle des quintes',
    summary: 'Pourquoi une armure, comment la lire en une seconde, et comment les tonalités s’organisent entre elles.',
    goals: ['Reconnaître une tonalité majeure ou mineure à son armure.', 'Connaître l’ordre des dièses et des bémols.', 'Situer les tonalités voisines sur le cycle des quintes.'],
    body: W => `
<h2>L’armure</h2>
<p>Construire une gamme majeure sur une autre note que do demande des altérations, toujours les mêmes : plutôt que de les écrire devant chaque note, on les place une fois pour toutes en début de ligne. C’est l’<b>armure</b>. Elle indique la <b>tonalité</b> : la gamme, et donc la tonique, autour de laquelle la pièce est construite.</p>
<ul>
<li><b>Ordre des dièses</b> : fa – do – sol – ré – la – mi – si. <b>Ordre des bémols</b> : l’inverse, si – mi – la – ré – sol – do – fa.</li>
<li><b>Avec des dièses</b> : la tonique majeure est un demi-ton au-dessus du dernier dièse (dernier dièse do♯ → ré majeur).</li>
<li><b>Avec des bémols</b> : la tonique majeure est l’avant-dernier bémol (si♭ mi♭ la♭ ré♭ → la♭ majeur). Un seul bémol : fa majeur.</li>
</ul>

<h2>Relatif et homonyme</h2>
<p>Chaque armure correspond à <b>deux</b> tonalités : une majeure et sa <b>relative mineure</b>, une tierce mineure (trois demi-tons) plus bas. Quatre bémols : la♭ majeur, ou <b>fa mineur</b>, la tonalité de l’op. 55 n° 1. On distingue les deux à l’oreille (la note de repos) et à la partition : la première et la dernière basse, et les altérations accidentelles (en mineur, le 7e degré est souvent haussé : mi♮ en fa mineur).</p>
<p>L’<b>homonyme</b>, lui, a la même tonique et l’autre mode : fa mineur et fa majeur. La coda de l’op. 55 passe justement de fa mineur à fa majeur.</p>

<h2>Le cycle des quintes</h2>
${W.cof({ start: 8, minor: true })}
<p>En tournant dans le sens des aiguilles d’une montre, on monte d’une quinte et on ajoute un dièse (ou on retire un bémol). Les tonalités côte à côte sont les <b>tons voisins</b> : elles ne diffèrent que d’une altération, et c’est vers elles qu’une pièce module le plus naturellement.</p>

${W.key('À retenir', '<ul><li>Dièses : fa do sol ré la mi si ; bémols : si mi la ré sol do fa.</li><li>Dièses : tonique = dernier dièse + un demi-ton. Bémols : tonique = avant-dernier bémol.</li><li>Relative mineure : une tierce mineure sous la tonique majeure.</li><li>Tons voisins : une altération d’écart, côte à côte sur le cycle.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Déduire la tonalité de l’armure seule : quatre bémols, c’est la♭ majeur <i>ou</i> fa mineur. Regarde la basse finale et les altérations.</li><li>Oublier une altération de l’armure au milieu d’un passage difficile : relis l’armure avant de déchiffrer.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 17 à 24</h2>
<p>La phrase b voyage dans les <b>tons voisins</b> de fa mineur, et les altérations accidentelles servent de panneaux indicateurs :</p>
<ul>
<li><b>Mesures 17-18 : la♭ majeur</b>, le relatif (même armure) : mi♭ 7, puis la♭.</li>
<li><b>Mesures 18-19 : do mineur</b>, la tonalité de la dominante (trois bémols) : le <b>ré♮</b> (mesure 18) et le <b>si♮</b> (mesure 19, sensible de do) l’annoncent.</li>
<li><b>Mesures 20-24 : retour vers fa mineur</b> : le <b>mi♮</b> (sensible de fa) apparaît dans do 7, puis la basse reste sur do pendant quatre mesures (une pédale de dominante) avant le retour du thème.</li>
</ul>
${W.score({ abc: OP55.e4, title: 'Mesures 17 à 20', bpm: 56, startBpm: 46 })}
<table>
<thead><tr><th>Pièce</th><th>Tonalité</th><th>Armure</th></tr></thead>
<tbody>
<tr><td>Nocturne op. 55 n° 1</td><td>fa mineur (coda en fa majeur)</td><td>4 bémols</td></tr>
<tr><td>Valse en la mineur B. 150</td><td>la mineur</td><td>aucune</td></tr>
<tr><td>Romance S. 169</td><td>mi mineur</td><td>1 dièse</td></tr>
<tr><td>Nocturne op. 15 n° 1 (niveau 2)</td><td>fa majeur, partie centrale en fa mineur</td><td>1 bémol, puis 4</td></tr>
<tr><td>Clair de lune (niveau 2)</td><td>ré♭ majeur</td><td>5 bémols</td></tr>
</tbody></table>

<h2>Exercices</h2>
${W.exo('Exercice 1 — Lire une armure', '<p>Quelles tonalités (majeure et relative mineure) pour : 2 dièses ? 3 bémols ? 1 dièse ? 5 bémols ?</p><details><summary>Corrigé</summary><div><p>2 dièses : ré majeur / si mineur. 3 bémols : mi♭ majeur / do mineur. 1 dièse : sol majeur / mi mineur. 5 bémols : ré♭ majeur / si♭ mineur.</p></div></details>')}
${W.exo('Exercice 2 — Les indices', '<p>Une pièce a quatre bémols à l’armure ; on y voit souvent des mi♮ et elle finit sur un accord fa – la♭ – do. Quelle est sa tonalité ?</p><details><summary>Corrigé</summary><div><p>Fa mineur : le mi♮ est la sensible de fa (forme harmonique), et la pièce se termine sur la tonique fa.</p></div></details>')}
${W.quiz({ kind: 'keysig', keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'], title: 'Armures : tonalités majeures', count: 10, stat: 'ks-maj' })}
${W.quiz({ kind: 'keysig', minor: true, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'], title: 'Armures : tonalités mineures', count: 10, stat: 'ks-min' })}
${W.links([W.informance('/content/pages/20-a-crash-course-in-music-theory', 'A Crash Course in Music Theory')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-th-mineur', minutes: 20,
    title: 'Les trois gammes mineures',
    summary: 'Naturelle, harmonique, mélodique : trois versions d’une même tonalité, et le rôle décisif de la sensible.',
    goals: ['Construire les trois gammes mineures.', 'Comprendre le rôle de la sensible.', 'Repérer les sensibles dans le Più mosso.'],
    body: W => `
<p>Le mode mineur n’a pas une, mais trois formes de gamme. Toutes partagent le début : une <b>tierce mineure</b> au-dessus de la tonique (la – do en la mineur), qui donne au mineur sa couleur. Elles diffèrent par les degrés 6 et 7.</p>
<ul>
<li><b>Mineure naturelle</b> : les notes de l’armure, sans altération (la mineur : les touches blanches de la à la).</li>
<li><b>Mineure harmonique</b> : on hausse le 7e degré d’un demi-ton. Il devient une <b>sensible</b>, à un demi-ton de la tonique, qui l’appelle. Entre les 6e et 7e degrés apparaît un écart d’un ton et demi (une seconde augmentée), très reconnaissable.</li>
<li><b>Mineure mélodique</b> : en montant, on hausse le 6e et le 7e degré (la seconde augmentée disparaît) ; en descendant, on revient à la forme naturelle.</li>
</ul>
${W.score({ abc: MINOR_SCALES, title: 'La mineur : les trois formes', bpm: 96, hands: false, practice: false })}

<h2>Pourquoi la sensible ?</h2>
<p>Sans elle, l’accord bâti sur le 5e degré serait mineur et perdrait sa force d’attraction vers la tonique. C’est pourquoi, dans une pièce en mineur, le 7e degré est presque toujours haussé dans les accords de dominante : en fa mineur, c’est le <b>mi♮</b> qu’on voit si souvent dans l’op. 55.</p>
${W.kbd({ from: 65, to: 77, title: 'Fa mineur harmonique', marks: [65, 67, 68, 70, 72, 73, 76, 77].map(m => ({ m, color: m === 76 ? '#f2d9a8' : null })), names: 'marks', flats: true, play: 'seq', caption: 'La sensible mi♮ en couleur ; entre ré♭ et mi♮, la seconde augmentée.' })}

${W.key('À retenir', '<ul><li>Naturelle : l’armure seule. Harmonique : 7e degré haussé. Mélodique : 6e et 7e haussés en montant, naturelle en descendant.</li><li>La sensible est un demi-ton sous la tonique.</li><li>Une altération accidentelle qui hausse un 7e degré annonce souvent la tonalité mineure correspondante.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Ajouter la sensible à l’armure : elle s’écrit toujours en altération accidentelle.</li><li>Hausser le 6e degré dans la forme harmonique : seul le 7e est haussé.</li></ul>')}

<h2>Dans ta pièce cette semaine : le Più mosso (mesures 48 à 64)</h2>
<p>Le Più mosso est construit comme une <b>marche</b> à travers trois tonalités mineures. À chaque étape, la nouvelle sensible apparaît en altération accidentelle :</p>
<ul>
<li><b>Mesures 48-50 : fa mineur</b>, sensible <b>mi♮</b> (dans les triolets d’octaves de la main gauche).</li>
<li><b>Mesures 51-54 : do mineur</b>, sensible <b>si♮</b> (accord de sol 7, mesure 51).</li>
<li><b>Mesures 55-56 : sol mineur</b>, sensible <b>fa♯</b> (accord de ré 7, mesure 55).</li>
<li>Puis retour en fa mineur (mesures 57-60, avec mi♮), et passage en <b>si♭ mineur</b> (mesures 61-64), annoncé par le <b>la♮</b>, sa sensible.</li>
</ul>
${W.score({ abc: OP55.e6, title: 'Mesures 48 à 52 : fa mineur, puis do mineur', bpm: 72, startBpm: 52 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Construire', '<p>Écris les gammes mineures harmoniques de do, de sol et de si♭.</p><details><summary>Corrigé</summary><div><p>Do : do ré mi♭ fa sol la♭ si♮ do. Sol : sol la si♭ do ré mi♭ fa♯ sol. Si♭ : si♭ do ré♭ mi♭ fa sol♭ la♮ si♭.</p></div></details>')}
${W.exo('Exercice 2 — Quelle tonalité ?', '<p>Dans un passage en bémols, tu vois apparaître un fa♯. Quelle tonalité mineure est probable ? Et avec un la♮ ?</p><details><summary>Corrigé</summary><div><p>Fa♯ : sensible de <b>sol mineur</b>. La♮ : sensible de <b>si♭ mineur</b>. Dans les deux cas, vérifie que l’accord suivant est bien l’accord de tonique.</p></div></details>')}
${W.quiz({ kind: 'scales', title: 'Reconnaître la gamme à l’oreille', count: 10, stat: 'sc' })}
${W.quiz({ kind: 'playscale', keys: ['Am', 'Dm', 'Cm', 'Fm', 'Gm'], title: 'Au piano : jouer une gamme mineure harmonique', count: 5, stat: 'pscale-min' })}
`,
  },

  {
    id: 'n1-th-intervalles', minutes: 20,
    title: 'Les intervalles',
    summary: 'Nommer, lire et entendre la distance entre deux notes : la base de la lecture rapide, de l’harmonie et de l’oreille.',
    goals: ['Nommer un intervalle (quantité et qualité).', 'Le reconnaître sur la portée.', 'Le retrouver dans ta pièce, à deux voix.'],
    body: W => `
<h2>Le nom d’un intervalle</h2>
<p>Un intervalle a deux composantes. La <b>quantité</b> se compte en noms de notes, les deux extrémités comprises : do – mi = do, ré, mi = <b>tierce</b>. La <b>qualité</b> dépend du nombre exact de demi-tons : do – mi (4 demi-tons) est une tierce <b>majeure</b> ; do – mi♭ (3) une tierce <b>mineure</b>.</p>
<table>
<thead><tr><th>Intervalle</th><th class="num">Demi-tons</th><th>Depuis do</th><th>Repère pour l’oreille</th></tr></thead>
<tbody>
<tr><td>Seconde mineure / majeure</td><td class="num">1 / 2</td><td>ré♭ / ré</td><td>2de M : « Frère Jacques » (frè-re)</td></tr>
<tr><td>Tierce mineure / majeure</td><td class="num">3 / 4</td><td>mi♭ / mi</td><td>3ce M : « Le Beau Danube bleu » ; en descendant, la 5e de Beethoven</td></tr>
<tr><td>Quarte juste</td><td class="num">5</td><td>fa</td><td>« La Marseillaise » (Allons en-fants : en → fants) ; la levée de l’op. 55 (do → fa)</td></tr>
<tr><td>Triton</td><td class="num">6</td><td>fa♯ / sol♭</td><td>instable, il veut se résoudre</td></tr>
<tr><td>Quinte juste</td><td class="num">7</td><td>sol</td><td>« Ah ! vous dirai-je, maman »</td></tr>
<tr><td>Sixte mineure / majeure</td><td class="num">8 / 9</td><td>la♭ / la</td><td>6te M : Nocturne op. 9 n° 2 de Chopin (si♭ → sol)</td></tr>
<tr><td>Septième mineure / majeure</td><td class="num">10 / 11</td><td>si♭ / si</td><td>la 7e de l’accord de dominante (7e m)</td></tr>
<tr><td>Octave</td><td class="num">12</td><td>do</td><td>la même note, plus haut</td></tr>
</tbody></table>
${W.score({ abc: INTERVALS_ABC, title: 'Les intervalles depuis do3', bpm: 60, hands: false, practice: false })}
<p>Les quartes, quintes et octaves sont dites <b>justes</b> : elles n’ont pas de version majeure ou mineure. Agrandies d’un demi-ton, elles deviennent <b>augmentées</b> ; réduites, <b>diminuées</b> (le triton est à la fois une quarte augmentée et une quinte diminuée).</p>

<h2>Lire les intervalles sur la portée</h2>
<ul>
<li><b>Seconde</b> : d’une ligne à l’interligne voisin.</li>
<li><b>Tierce</b> : ligne – ligne voisine, ou interligne – interligne voisin.</li>
<li><b>Quarte</b> : ligne – interligne en sautant deux positions ; <b>quinte</b> : ligne – ligne (ou interligne – interligne) en sautant une ligne.</li>
<li><b>Octave</b> : une ligne et un interligne très éloignés (ou l’inverse).</li>
</ul>
<p>C’est la clé de la lecture à vue rapide : on lit la <b>distance</b> entre les notes plutôt que le nom de chacune.</p>

<h2>Le renversement</h2>
<p>Renverser un intervalle, c’est passer la note grave à l’octave supérieure : do – mi (tierce) devient mi – do (sixte). La quantité devient « 9 moins l’ancienne », et la qualité s’inverse : majeur ↔ mineur, juste ↔ juste, augmenté ↔ diminué. Une tierce majeure renversée donne une sixte mineure.</p>

<h2>Consonances et dissonances</h2>
<p>Les intervalles « reposants » (octave, quinte, tierces et sixtes) sont des <b>consonances</b> ; les intervalles tendus (secondes, septièmes, triton) sont des <b>dissonances</b>, qui demandent en général à se résoudre. La quarte est un cas particulier : consonante entre deux voix supérieures, elle est traitée comme une dissonance au-dessus de la basse.</p>

${W.key('À retenir', '<ul><li>Quantité : on compte les noms de notes, extrémités comprises. Qualité : on compte les demi-tons.</li><li>Justes : quarte (5), quinte (7), octave (12). Majeures / mineures : secondes, tierces, sixtes, septièmes.</li><li>Renversement : 9 moins la quantité ; majeur ↔ mineur.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Compter les écarts au lieu des noms : do – mi, c’est 3 noms (tierce), pas 2.</li><li>Oublier l’armure : en fa mineur, la – do est la♭ – do, une tierce majeure.</li><li>Confondre sixte majeure et septième mineure : 9 et 10 demi-tons.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 57 à 60</h2>
<p>Le chant revient, à deux voix, à la main droite. À la mesure 58, la voix du haut tient do puis fa pendant que la voix du bas descend si♭ – la♭ – sol – fa : les deux voix forment un éventail d’intervalles qui s’ouvre.</p>
${W.score({ abc: E7_INTERVALS, title: 'Mesure 58 (réduction) : les intervalles entre les deux voix', bpm: 56, practice: false, hands: false, analysis: false, caption: 'do – si♭ : seconde majeure ; fa – la♭ : sixte majeure ; fa – sol : septième mineure ; fa – fa : octave.' })}
<ul>
<li>Mélodie de la mesure 57 : ré♭ – do (<b>seconde mineure</b>), ré♭ – mi♭ (<b>seconde majeure</b>).</li>
<li>Mesure 58 : do → fa, un saut de <b>quarte juste</b>, le même intervalle que la levée du nocturne.</li>
<li>À la main gauche du Più mosso (mesures 48 à 56), les triolets sont doublés à l’<b>octave</b>.</li>
</ul>
${W.score({ abc: OP55.e7, title: 'Mesures 57 à 60', bpm: 66, startBpm: 50 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Nommer', '<p>Nomme : ré – fa ; mi – si ; fa – si♭ ; la♭ – mi♭ ; sol – fa.</p><details><summary>Corrigé</summary><div><p>Ré – fa : tierce mineure (3). Mi – si : quinte juste (7). Fa – si♭ : quarte juste (5). La♭ – mi♭ : quinte juste (7). Sol – fa : septième mineure (10).</p></div></details>')}
${W.exo('Exercice 2 — Renverser', '<p>Renverse : tierce mineure, quarte juste, seconde majeure, sixte mineure.</p><details><summary>Corrigé</summary><div><p>Sixte majeure ; quinte juste ; septième mineure ; tierce majeure.</p></div></details>')}
${W.quiz({ kind: 'intervalsight', quality: false, set: ['2M', '3M', '4J', '5J', '6M', '7m', '8ve'], title: 'Sur la portée : la quantité', count: 10, stat: 'ivs-q' })}
${W.quiz({ kind: 'intervalsight', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '7M', '8ve'], title: 'Sur la portée : quantité et qualité', count: 10, stat: 'ivs' })}
${W.quiz({ kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', '5J', '8ve'], mode: 'play', title: 'Au piano : jouer l’intervalle demandé', count: 8, stat: 'iv-n1-play' })}
`,
  },

  {
    id: 'n1-th-accords', minutes: 20,
    title: 'Les accords de trois sons',
    summary: 'Superposer deux tierces : quatre sortes d’accords, et les accords bâtis sur chaque degré d’une tonalité.',
    goals: ['Construire les accords majeur, mineur, diminué et augmenté.', 'Connaître les accords d’une tonalité majeure et mineure.', 'Nommer les accords de ta pièce.'],
    body: W => `
<h2>Superposer des tierces</h2>
<p>Un accord de trois sons (ou <b>triade</b>) superpose deux tierces au-dessus d’une <b>fondamentale</b> : fondamentale, <b>tierce</b>, <b>quinte</b>. Selon les tierces employées, on obtient quatre sortes d’accords :</p>
<table>
<thead><tr><th>Accord</th><th>Tierces (bas → haut)</th><th>Quinte</th><th>Sur do</th><th>Couleur</th></tr></thead>
<tbody>
<tr><td>majeur</td><td>majeure + mineure</td><td>juste</td><td>do – mi – sol</td><td>clair, stable</td></tr>
<tr><td>mineur</td><td>mineure + majeure</td><td>juste</td><td>do – mi♭ – sol</td><td>plus sombre, stable</td></tr>
<tr><td>diminué</td><td>mineure + mineure</td><td>diminuée</td><td>do – mi♭ – sol♭</td><td>serré, instable</td></tr>
<tr><td>augmenté</td><td>majeure + majeure</td><td>augmentée</td><td>do – mi – sol♯</td><td>flottant, instable</td></tr>
</tbody></table>
${W.score({ abc: TRIADS, title: 'Les quatre accords sur do', bpm: 50, hands: false, practice: false })}
<p>Pour nommer un accord, on dit sa fondamentale et sa nature : « fa mineur », « mi♭ majeur ». En notation anglo-saxonne : Fm, E♭.</p>

<h2>Les accords d’une tonalité</h2>
<p>Sur chaque degré de la gamme, on peut empiler deux tierces avec les seules notes de la tonalité. On les numérote en <b>chiffres romains</b> : majuscule pour un accord majeur, minuscule pour un mineur, ° pour un diminué.</p>
<table>
<thead><tr><th>Degré</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr></thead>
<tbody>
<tr><td>Majeur (do)</td><td>I (do)</td><td>ii (ré m)</td><td>iii (mi m)</td><td>IV (fa)</td><td>V (sol)</td><td>vi (la m)</td><td>vii° (si dim.)</td></tr>
<tr><td>Mineur harmonique (fa)</td><td>i (fa m)</td><td>ii° (sol dim.)</td><td>III+ (la♭ aug.)</td><td>iv (si♭ m)</td><td>V (do)</td><td>VI (ré♭)</td><td>vii° (mi dim.)</td></tr>
</tbody></table>
<p>En mineur, on utilise aussi le 7e degré naturel : l’accord de <b>VII</b> (mi♭ majeur en fa mineur) et le <b>III</b> majeur (la♭) sont très fréquents, notamment dans l’op. 55.</p>

${W.key('À retenir', '<ul><li>Triade = fondamentale + tierce + quinte.</li><li>Majeur : 3ce M + 3ce m ; mineur : 3ce m + 3ce M ; diminué : deux 3ces m ; augmenté : deux 3ces M.</li><li>En majeur : I ii iii IV V vi vii°. En mineur : i, iv et V (avec sensible), plus III, VI, VII.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Juger la nature d’un accord sans regarder l’armure : en fa mineur, la♭ – do – mi♭ est majeur.</li><li>Prendre la note du bas pour la fondamentale : ce n’est vrai qu’à l’état fondamental (chapitre suivant).</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 65 à 76</h2>
<p>La fin du Più mosso fait se succéder des accords très contrastés. Voici leur squelette, en accords plaqués :</p>
${W.score({ abc: REDUCTION_65_72, title: 'Mesures 65 à 72 (réduction en accords)', bpm: 50, practice: false, analysis: AN_RED, caption: 'Réduction : une harmonie par groupe de mesures, dans une disposition simplifiée.' })}
<ul>
<li><b>Mesures 65-66 : sol♭ majeur</b> (sol♭ – si♭ – ré♭), avec ré♭ à la basse.</li>
<li><b>Mesures 67-68</b> : mi – sol – si♭ est un accord <b>diminué</b> ; Chopin y ajoute ré♭ (une septième, que tu étudieras au niveau 2).</li>
<li><b>Mesures 69-70</b> : ré♭ – fa – la♭ (majeur), avec do♭ en plus : l’accord des grands traits.</li>
<li><b>Mesures 71-72 : do majeur</b> (do – mi – sol), la dominante, qui devient do 7 au point d’orgue.</li>
<li><b>Mesures 73-76</b> : le thème revient avec ses accords du début : fa mineur, mi♭ majeur, la♭ majeur, do 7.</li>
</ul>

<h2>Exercices</h2>
${W.exo('Exercice 1 — Construire', '<p>Écris les accords : ré majeur, sol mineur, si diminué, mi♭ majeur, do♯ mineur.</p><details><summary>Corrigé</summary><div><p>Ré – fa♯ – la ; sol – si♭ – ré ; si – ré – fa ; mi♭ – sol – si♭ ; do♯ – mi – sol♯.</p></div></details>')}
${W.exo('Exercice 2 — Les accords de fa mineur', '<p>Quelles notes ont les accords i, iv, V et VI de fa mineur (harmonique) ?</p><details><summary>Corrigé</summary><div><p>i : fa – la♭ – do. iv : si♭ – ré♭ – fa. V : do – mi♮ – sol. VI : ré♭ – fa – la♭.</p></div></details>')}
${W.quiz({ kind: 'chords', set: ['M', 'm', 'dim', 'aug'], title: 'À l’oreille : nature de l’accord', count: 10, stat: 'ch-n1' })}
${W.quiz({ kind: 'chords', set: ['M', 'm', 'dim'], mode: 'play', title: 'Au piano : jouer l’accord demandé', count: 6, stat: 'ch-play' })}
`,
  },

  {
    id: 'n1-th-renv', minutes: 20,
    title: 'Renversements et chiffrage',
    summary: 'Quand la fondamentale n’est pas à la basse : les trois positions d’un accord, leur chiffrage, et la septième de dominante.',
    goals: ['Reconnaître un accord renversé et trouver sa fondamentale.', 'Lire les chiffrages 5, 6, 6/4, et 7, 6/5, 4/3, 4/2.', 'Analyser les accords renversés du thème.'],
    body: W => `
<h2>Trois positions</h2>
<p>Quand la fondamentale n’est pas la note la plus grave, l’accord est <b>renversé</b>. On le désigne d’après la note de basse :</p>
<ul>
<li><b>état fondamental</b> : fondamentale à la basse (chiffré 5, souvent sans chiffre) ;</li>
<li><b>1er renversement</b> : tierce à la basse (chiffré <b>6</b>) ;</li>
<li><b>2e renversement</b> : quinte à la basse (chiffré <b>6/4</b>). Il est instable ; on le trouve surtout juste avant une cadence (le « 6/4 de cadence »).</li>
</ul>
${W.score({ abc: INVERSIONS, title: 'Do majeur dans ses trois positions', bpm: 50, hands: false, practice: false, caption: 'En notation anglo-saxonne, on écrit la basse après une barre : do/mi, do/sol.' })}
<p>Le chiffrage indique les intervalles au-dessus de la basse : au 1er renversement, la fondamentale est une <b>sixte</b> au-dessus de la basse ; au 2e, une <b>quarte</b>, et la tierce une <b>sixte</b>.</p>

<h2>Trouver la fondamentale</h2>
<ol>
<li>Range les notes de l’accord en tierces superposées (mi – sol – do → do – mi – sol).</li>
<li>La note du bas de cette pile est la fondamentale ; la nature se lit sur les tierces.</li>
<li>Regarde la basse réelle : tierce à la basse → 6 ; quinte → 6/4.</li>
</ol>

<h2>La septième de dominante et ses renversements</h2>
<p>Ajoute une tierce au-dessus de l’accord de V : tu obtiens la <b>septième de dominante</b> (en fa mineur : do – mi♮ – sol – si♭). Avec quatre notes, il y a quatre positions :</p>
<table>
<thead><tr><th>Basse</th><th>Chiffrage</th><th>En fa mineur</th></tr></thead>
<tbody>
<tr><td>fondamentale</td><td>V7</td><td>do à la basse</td></tr>
<tr><td>tierce (la sensible)</td><td>V6/5</td><td>mi♮ à la basse</td></tr>
<tr><td>quinte</td><td>V4/3</td><td>sol à la basse</td></tr>
<tr><td>septième</td><td>V4/2</td><td>si♭ à la basse</td></tr>
</tbody></table>

${W.key('À retenir', '<ul><li>Fondamentale à la basse : 5 ; tierce : 6 ; quinte : 6/4.</li><li>Pour trouver la fondamentale : ranger les notes en tierces.</li><li>Septième de dominante : 7, 6/5, 4/3, 4/2.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Nommer un accord d’après sa basse : mi – sol – do est un accord de do, pas de mi.</li><li>Oublier que la mélodie peut contenir une note étrangère : range seulement les notes qui durent.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 73 à 76 (= 1 à 4)</h2>
<p>Le thème revient à la mesure 73 avec les accords du début. Deux d’entre eux sont renversés :</p>
<ul>
<li><b>3e temps de la mesure 73</b> : basse sol, accord mi♭ – si♭ – mi♭ → <b>mi♭ majeur au 1er renversement</b> (VII6) : sa tierce, sol, est à la basse.</li>
<li><b>3e temps de la mesure 74</b> : basse mi♮, accord si♭ – do – sol → do – mi – sol – si♭ = <b>do 7</b>, avec sa tierce à la basse : <b>V6/5</b>. La sensible mi♮, à la basse, monte vers fa à la mesure suivante.</li>
<li>Ailleurs dans le Più mosso : <b>sol♭/ré♭</b> (mesures 65-66) est un 2e renversement (6/4) ; à la mesure 60, fa mineur avec la♭ à la basse est un 1er renversement (i6).</li>
</ul>
${W.score({ abc: OP55.e1, title: 'Les mêmes accords qu’aux mesures 73 à 76', bpm: 56, startBpm: 46 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Fondamentale et position', '<p>Analyse : (a) mi – sol – do ; (b) fa – si♭ – ré ; (c) ré – sol – si ; (d) sol – si – ré – fa (sol à la basse) ; (e) si – ré – fa – sol (si à la basse).</p><details><summary>Corrigé</summary><div><p>(a) do majeur, 1er renversement (6). (b) si♭ majeur, 2e renversement (6/4). (c) sol majeur, 2e renversement (6/4). (d) sol 7, état fondamental (7). (e) sol 7, 1er renversement (6/5).</p></div></details>')}
${W.quiz({ kind: 'chordsight', set: ['M', 'm'], inversions: [0, 1, 2], title: 'Sur la portée : nature et position', count: 10, stat: 'chs' })}
`,
  },

  {
    id: 'n1-th-fonctions', minutes: 20,
    title: 'Degrés et fonctions : tonique, sous-dominante, dominante',
    summary: 'Chaque accord joue un rôle : repos, éloignement ou tension. Comprendre ces rôles, c’est comprendre le mouvement de la musique.',
    goals: ['Classer les accords par fonction.', 'Comprendre la résolution de la septième de dominante.', 'Analyser la coda de l’op. 55 en fonctions.'],
    body: W => `
<h2>Trois fonctions</h2>
${W.diagram('functions', { key: 'fa mineur' })}
<ul>
<li><b>Tonique (T)</b> : I, et parfois vi (VI en mineur) ou III, qui la remplacent. Le repos.</li>
<li><b>Sous-dominante (SD)</b> : IV, ii, et la sixte napolitaine. L’éloignement, la préparation.</li>
<li><b>Dominante (D)</b> : V, V7, vii°. La tension, qui appelle la tonique.</li>
</ul>
<p>Le schéma le plus courant de la musique tonale est <b>T – SD – D – T</b>. Quand tu reconnais ces trois fonctions, tu sais où va la musique, donc où elle se tend et où elle se détend : c’est la base d’un phrasé convaincant.</p>
${W.score({ abc: FUNCTIONS, title: 'T – SD – D – T en fa mineur', bpm: 60, caption: 'Écoute la tension du V7 et le soulagement de l’accord final.' })}

<h2>La septième de dominante</h2>
<p>L’accord V7 (en fa mineur : do – mi♮ – sol – si♭) contient un <b>triton</b> entre mi♮ et si♭. Ce triton se résout : la sensible <b>mi♮ monte</b> vers fa ; la septième <b>si♭ descend</b> vers la♭. Cette double attraction rend la cadence si forte.</p>
${W.kbd({ from: 60, to: 72, title: 'Résolution de V7 vers i', marks: [{ m: 64, label: 'mi', color: '#f2d9a8' }, { m: 70, label: 'si♭', color: '#f2d9a8' }, { m: 65, label: 'fa', color: '#cfe6d7' }, { m: 68, label: 'la♭', color: '#cfe6d7' }], names: 'none', caption: 'Orange : le triton du V7 ; vert : ses notes de résolution.' })}

<h2>Pédales de tonique et de dominante</h2>
<p>Une <b>pédale</b> est une note tenue (ou répétée) à la basse pendant que les accords changent au-dessus. Sur la tonique, elle installe le repos ; sur la dominante, elle crée l’attente du retour.</p>

${W.key('À retenir', '<ul><li>T : I (vi, III) ; SD : IV, ii, N6 ; D : V, V7, vii°.</li><li>T – SD – D – T : le mouvement de base de la musique tonale.</li><li>V7 : la sensible monte, la septième descend.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Prendre le 6/4 de cadence (i6/4) pour une tonique : c’est une dominante déguisée, il prépare V.</li><li>Résoudre la septième vers le haut : elle descend.</li></ul>')}

<h2>Dans ta pièce cette semaine : la coda (mesures 77 à 101)</h2>
<p>La coda commence par un enchaînement complet, joué deux fois (mesures 77-80, puis 81-84) :</p>
<ul>
<li><b>fa mineur (T)</b> – fa 7, dominante de la sous-dominante – <b>si♭ mineur (SD)</b> – <b>do 7 (D)</b> – <b>ré♭ (T)</b>, qui remplace la tonique – <b>si♭ mineur (SD)</b> – <b>fa mineur/do (6/4 de cadence)</b> – <b>do (D)</b>.</li>
<li>Mesures 85 à 96 : <b>pédale de tonique</b> (fa tenu à la basse) ; au-dessus, des accords de sous-dominante et de dominante, puis l’arrivée de <b>fa majeur</b> (mesure 89).</li>
</ul>
${W.score({ abc: OP55.e9, title: 'Mesures 77 à 80 : T – SD – D', bpm: 60, startBpm: 44 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Fonctions', '<p>En fa mineur, donne la fonction de : si♭ mineur ; do 7 ; ré♭ majeur ; mi diminué ; fa mineur/do (au 2e renversement, avant do 7).</p><details><summary>Corrigé</summary><div><p>Si♭ m : SD. Do 7 : D. Ré♭ : T (substitut). Mi dim. : D (vii°). Fa m/do avant do 7 : 6/4 de cadence, fonction de dominante.</p></div></details>')}
${W.quiz({ kind: 'playchord', mode: 'play', title: 'Au piano : jouer les fonctions en fa mineur', count: 6, stat: 'play-fm' })}
${W.quiz({ kind: 'chordfunc', set: ['IV', 'V', 'vi'], title: 'À l’oreille : après le I, IV, V ou vi ?', count: 10, stat: 'func' })}
`,
  },

  {
    id: 'n1-th-cadences', minutes: 15,
    title: 'Les cadences',
    summary: 'La ponctuation de la musique : point final, virgule, « amen » et surprise.',
    goals: ['Reconnaître les quatre cadences.', 'Comprendre le 6/4 de cadence.', 'Repérer toutes les cadences de l’op. 55.'],
    body: W => `
<ul>
<li><b>Cadence parfaite</b> (V – I), les deux accords à l’état fondamental, la tonique au soprano : le point final. Si l’un des accords est renversé, ou si la tonique n’est pas à la voix supérieure, on parle de <b>cadence imparfaite</b>.</li>
<li><b>Demi-cadence</b> : arrêt sur V. Une virgule, une question.</li>
<li><b>Cadence plagale</b> (IV – I) : l’« amen » des cantiques, plus doux.</li>
<li><b>Cadence rompue</b> (V – vi) : on attend I, on entend vi. Une surprise qui relance la musique.</li>
</ul>
${W.score({ abc: CADENCES, title: 'Les quatre cadences en do majeur', bpm: 72, caption: 'Une cadence par mesure.' })}

<h2>Le 6/4 de cadence</h2>
<p>Juste avant V, on trouve souvent l’accord de tonique au 2e renversement (I6/4 ou i6/4) : la basse est déjà la dominante, et les voix du haut « retardent » l’accord de V avant de s’y résoudre. On l’analyse comme un ornement de la dominante.</p>

${W.key('À retenir', '<ul><li>Parfaite V – I ; demi-cadence sur V ; plagale IV – I ; rompue V – vi.</li><li>Le 6/4 de cadence prépare V : c’est une fonction de dominante.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Appeler « parfaite » toute cadence V – I : avec un renversement, elle est imparfaite.</li><li>Confondre demi-cadence (on s’arrête sur V) et cadence rompue (V va vers vi).</li></ul>')}

<h2>Dans ta pièce cette semaine : la fin (mesures 97 à 101) et toutes les cadences</h2>
<p>La cadence finale enchaîne <b>iiø6/5 – V7 – I</b> en fa majeur. L’accord de la mesure 98 (si♭ – ré♭ – fa – sol) est une sous-dominante empruntée à fa mineur : une dernière ombre avant la lumière de fa majeur.</p>
${W.score({ abc: OP55.e10, title: 'Mesures 97 à 101 : la cadence finale', bpm: 56, startBpm: 46 })}
<table>
<thead><tr><th>Mesures</th><th>Cadence</th></tr></thead>
<tbody>
<tr><td>7-8 (et 15-16)</td><td>i6/4 – V7 – i : cadence parfaite, fin du thème</td></tr>
<tr><td>24 (et 40)</td><td>arrêt sur do 7, au-dessus de la pédale de do : demi-cadence</td></tr>
<tr><td>31-32, 47-48</td><td>cadences parfaites, fins des retours du thème</td></tr>
<tr><td>72</td><td>point d’orgue sur do 7 : demi-cadence, suspension avant le retour</td></tr>
<tr><td>80-81, 84-85</td><td>6/4 de cadence – V – i, dans la coda</td></tr>
<tr><td>98-99</td><td>iiø6/5 – V7 – I : cadence parfaite finale, en fa majeur</td></tr>
</tbody></table>

<h2>Exercices</h2>
${W.exo('Exercice — Quelle cadence ?', '<p>Nomme : (a) ii – V – I ; (b) I – IV – V (fin de phrase) ; (c) V7 – vi ; (d) IV – I.</p><details><summary>Corrigé</summary><div><p>(a) parfaite (si les accords sont à l’état fondamental) ; (b) demi-cadence ; (c) rompue ; (d) plagale.</p></div></details>')}
${W.quiz({ kind: 'cadences', set: ['parfaite', 'demi'], labels: { parfaite: 'Fin (parfaite)', demi: 'Suspension (demi-cadence)' }, title: 'À l’oreille : fin ou suspension ?', count: 10, stat: 'cad-2' })}
${W.quiz({ kind: 'cadences', title: 'À l’oreille : les quatre cadences', count: 10, stat: 'cad' })}
`,
  },

  {
    id: 'n1-th-etrangeres', minutes: 20,
    title: 'Les notes étrangères',
    summary: 'Les notes qui n’appartiennent pas à l’accord : ce sont elles qui font chanter une mélodie.',
    goals: ['Reconnaître notes de passage, broderies, appoggiatures, retards et pédales.', 'Les repérer dans toute la pièce.', 'En tirer des conséquences pour le phrasé.'],
    body: W => `
<p>Une mélodie faite uniquement de notes de l’accord serait un arpège. Ce qui la rend expressive, ce sont les <b>notes étrangères</b> à l’harmonie.</p>
<ul>
<li><b>Note de passage</b> : relie deux notes de l’accord par mouvement conjoint, sur un temps faible.</li>
<li><b>Broderie</b> : quitte une note de l’accord vers sa voisine (au-dessus ou au-dessous) et y revient, sur un temps faible.</li>
<li><b>Appoggiature</b> : dissonance placée <b>sur le temps</b>, qui se résout par mouvement conjoint. Elle s’appuie ; sa résolution se pose.</li>
<li><b>Retard</b> : une note de l’accord précédent est <b>tenue</b> pendant le changement d’accord, devient dissonante, puis descend se résoudre.</li>
<li><b>Pédale</b> : une note tenue à la basse, sous des accords qui changent.</li>
</ul>
${W.score({ abc: NONCHORD, title: 'Les notes étrangères (do majeur)', bpm: 66, caption: 'Le retard a besoin d’une préparation : do appartient à l’accord de I (mesure 4), il est tenu sur V (mesure 5), puis se résout sur si.' })}

${W.key('Conséquences pour le jeu', '<ul><li>Appoggiature : plus d’appui, puis une résolution plus douce.</li><li>Notes de passage et broderies : plus légères que les notes de l’accord qu’elles ornent.</li><li>Retard : laisse entendre la dissonance tenue, résous en douceur.</li><li>Pédale : la basse tenue porte tout ; ne la laisse pas s’éteindre trop tôt.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Accentuer toutes les notes d’une broderie : seule la note principale compte.</li><li>Prendre une appoggiature pour une note de passage : l’appoggiature est sur le temps.</li></ul>')}

<h2>Dans ta pièce cette semaine : toute la pièce</h2>
<ul>
<li><b>Mesures 1-2</b> : ré♭ (3e temps de la mesure 1) est une note de passage entre mi♭ et do ; si♮ et ré♭ (mesure 2) sont des broderies de do.</li>
<li><b>Mesure 7</b> : le la♭ de l’accord arpégé, sur do 7, est une <b>appoggiature</b> de sol.</li>
<li><b>Mesure 17</b> : à la main gauche, le la♭, tenu sur l’accord de mi♭ 7, est un <b>retard</b> qui descend vers sol au 4e temps ; dans la mélodie, ré♮ est une broderie chromatique de mi♭.</li>
<li><b>Mesures 21 à 24</b> : une <b>pédale de dominante</b> (do tenu à la basse) ; <b>mesures 85 à 96</b> : une <b>pédale de tonique</b> (fa).</li>
<li><b>Mesures 57 à 60</b> : la mélodie ornée multiplie les broderies (ré♭ – do – ré♭, ré♭ – mi♭ – ré♭).</li>
</ul>
${W.score({ abc: OP55.e2, title: 'Mesures 5 à 8 : l’appoggiature de la mesure 7', bpm: 56, startBpm: 46 })}
${W.score({ abc: OP55.e4, title: 'Mesures 17 à 20 : le retard de la mesure 17', bpm: 56, startBpm: 46 })}

<h2>Exercices</h2>
${W.exo('Exercice', '<p>Sur ta partition des mesures 1 à 24, entoure au crayon les notes étrangères de la mélodie et note leur type (P, B, App, R). Puis joue la main droite en allégeant les notes de passage et les broderies, et en appuyant les appoggiatures.</p><details><summary>Corrigé (mesures 1 à 8)</summary><div><p>Mesure 1 : ré♭ (P). Mesure 2 : si♮ (B), ré♭ (B). Mesures 3-4 : comme 1-2. Mesure 6 : la trille sur si♭ orne la note de l’accord. Mesure 7 : la♭ (App) sur do 7, résolu sur sol.</p></div></details>')}
`,
  },

  {
    id: 'n1-th-synthese', minutes: 25,
    title: 'Synthèse : le plan de l’op. 55 n° 1',
    summary: 'Toutes les notions du niveau au service d’une seule chose : comprendre la pièce entière, pour mieux la jouer et la mémoriser.',
    goals: ['Connaître le plan de la pièce : sections, tonalités, cadences.', 'Relier chaque section à son caractère.', 'Utiliser l’analyse pour mémoriser.'],
    body: W => `
<h2>Le plan</h2>
${W.diagram('form', { total: 101, sections: [
  { label: 'a', kind: 'A', from: 1, to: 8, key: 'fa m' },
  { label: 'a', kind: 'A', from: 9, to: 16 },
  { label: 'b', kind: 'B', from: 17, to: 24, key: 'la♭ – do m' },
  { label: 'a′', kind: 'A', from: 25, to: 32 },
  { label: 'b', kind: 'B', from: 33, to: 40 },
  { label: 'a″', kind: 'A', from: 41, to: 48 },
  { label: 'Più mosso', kind: 'C', from: 48, to: 72, key: 'fa m → do m → sol m' },
  { label: 'A′', kind: 'A', from: 73, to: 76 },
  { label: 'Coda', kind: 'coda', from: 77, to: 101, key: 'fa m → fa M' },
] }, 'A (mesures 1 à 48) : le thème a, ses retours variés (a′ en triolets, a″ avec le septolet) et la phrase b. Più mosso (48 à 72). Retour bref du thème (73 à 76). Coda (77 à 101).')}

<h2>Le plan tonal et harmonique</h2>
<table>
<thead><tr><th>Section</th><th>Tonalités</th><th>Ce qu’il faut entendre</th></tr></thead>
<tbody>
<tr><td>a (1-16)</td><td>fa mineur</td><td>la boucle i – VII6 – III – V6/5 ; la sixte napolitaine sous la trille (mesure 6) ; cadence parfaite (7-8)</td></tr>
<tr><td>b (17-24)</td><td>la♭ majeur, do mineur, retour</td><td>tons voisins ; pédale de dominante (21-24) ; demi-cadence (24)</td></tr>
<tr><td>Più mosso (48-72)</td><td>fa m → do m → sol m → fa m → si♭ m</td><td>une marche modulante ; septièmes diminuées ; la grande sixte augmentée (69) ; point d’orgue sur do 7 (72)</td></tr>
<tr><td>Coda (77-101)</td><td>fa mineur, puis fa majeur</td><td>T – SD – D répété ; pédale de tonique ; tierce picarde ; cadence finale (98-99)</td></tr>
</tbody></table>

<h2>À quoi ça sert, au piano</h2>
<ul>
<li><b>Doser l’énergie</b> : le sommet de la pièce est dans le Più mosso (mesures 61 à 72) ; le thème reste intime à chacun de ses retours.</li>
<li><b>Varier les retours</b> : a, a′, a″ ne se jouent pas pareil ; l’ornementation change, et ton toucher avec elle.</li>
<li><b>Mémoriser</b> : on retient beaucoup mieux une pièce dont on connaît le plan et les accords ; en cas de trou de mémoire, on sait repartir au début de la section suivante.</li>
</ul>
${W.tip('Les sixtes augmentées', '<p>Les mesures 22-23 et 69 contiennent un accord très coloré, la <b>sixte augmentée</b>, qui s’ouvre sur la dominante do. Tu l’étudieras en détail au niveau 2 ; pour l’instant, écoute comment il tend vers do.</p>')}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Le plan sur ta partition', '<p>Note au crayon sur ta partition : les lettres des sections (a, b, a′…), les tonalités principales, et un repère à chaque cadence.</p><details><summary>Corrigé</summary><div><p>Compare avec le schéma et le tableau ci-dessus : a 1-8 et 9-16 (cadences mesures 7-8 et 15-16), b 17-24 (demi-cadence 24), a′ 25-32, b 33-40, a″ 41-48, Più mosso 48-72 (point d’orgue 72), A′ 73-76, coda 77-101 (cadence finale 98-99).</p></div></details>')}
${W.checklist({ id: 'n1-th-synthese-check', title: 'Je sais…', items: ['dire de mémoire le plan de la pièce (sections et mesures) ;', 'jouer les accords des mesures 1 à 8 en blocs, en les nommant ;', 'montrer sur la partition les trois tonalités du Più mosso ;', 'repérer les cadences et dire leur type.'] })}
`,
  },
];
