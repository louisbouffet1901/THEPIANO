// Niveau 1 — Théorie : un cours complet en partant des bases.
// Chaque chapitre s'appuie sur un passage du Nocturne op. 55 n° 1 (voir la carte de la pièce).
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

// Réduction des mesures 65 à 72, analysée en accords de trois sons (leçon « Les accords de trois sons »).
const AN_RED_TRIADS = {
  key: 'fa mineur (fin du Più mosso)',
  bars: [
    { m: 65, ch: [['sol♭ – si♭ – ré♭', 'sol♭ majeur', 'SD', 1]] },
    { m: 66, ch: [['(le même accord)', '', 'SD', 1]] },
    { m: 67, ch: [['mi – sol – si♭ (+ ré♭)', 'mi diminué', 'D', 1]] },
    { m: 68, ch: [['(le même accord)', '', 'D', 1]] },
    { m: 69, ch: [['ré♭ – fa – la♭ (+ do♭)', 'ré♭ majeur', 'SD', 1]] },
    { m: 70, ch: [['(le même accord)', '', 'SD', 1]] },
    { m: 71, ch: [['do – mi – sol', 'do majeur', 'D', 1]] },
    { m: 72, ch: [['do – mi – sol – si♭', 'do 7', 'D', 1]] },
  ],
  notes: [
    'Sol♭ majeur, avec ré♭ à la basse : il prépare la dominante (au niveau 2, on l’appellera « sixte napolitaine »).',
    'Mi – sol – si♭ : deux tierces mineures, un accord diminué ; il contient mi♮, la sensible de fa.',
    'Ré♭ majeur avec do♭ en plus : l’accord des grands traits, qui s’ouvre sur do (la dominante), puis do 7 au point d’orgue.',
  ],
};


/* ---------- Aides de rédaction (V6 : une idée, un exemple résolu, un exercice) ---------- */
const idea = t => `<p class="idea"><b>L’idée.</b> ${t}</p>`;
const worked = (title, body, res) => `<div class="worked"><div class="wk-title">${title}</div>${body}${res ? `<p class="res">${res}</p>` : ''}</div>`;
const trap = t => `<p class="trap"><b>Piège.</b> ${t}</p>`;
const method = items => `<ol class="method">${items.map(x => `<li>${x}</li>`).join('')}</ol>`;
const steps7 = (pairs, row2) => `<table class="grid-notes"><thead><tr>${pairs.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody><tr>${row2.map(x => `<td>${x}</td>`).join('')}</tr></tbody></table>`;

/* ---------- Chapitres ---------- */
export default [
  {
    id: 'n1-th-notes', minutes: 15, steps: true,
    title: 'Les notes et le clavier',
    summary: 'Sept noms de notes, des touches noires groupées par deux et par trois, des octaves numérotées, et trois signes pour hausser, baisser ou rétablir une note : le vocabulaire de base, avec des repères pour ne plus hésiter.',
    goals: ['Nommer n’importe quelle touche du clavier.', 'Situer les octaves (do3 = do central).', 'Comprendre demi-ton, ton, dièse, bémol, bécarre, et les deux noms d’une touche noire.'],
    goal: 'tu nommes au moins 9 touches sur 10 (blanches et noires) et tu trouves une note au piano sans hésiter.',
    body: W => `
<p>Avant de parler d’harmonie, il faut un vocabulaire sûr. Tu le connais sans doute en partie : fais quand même les exercices, ils installent des réflexes qui serviront toute ta vie de pianiste.</p>

<h2>Sept noms, et deux repères sur le clavier</h2>
${idea('Sept noms reviennent en boucle : <b>do ré mi fa sol la si</b>, puis de nouveau do. Pour les trouver, regarde les touches noires : <b>do</b> est juste à gauche du groupe de <b>deux</b>, <b>fa</b> juste à gauche du groupe de <b>trois</b>.')}
${W.kbd({ from: 48, to: 72, names: 'all', title: 'Les touches blanches, de do2 à do4', play: 'seq', seq: [48, 50, 52, 53, 55, 57, 59, 60], caption: 'Do, à gauche des deux touches noires ; ré entre elles ; mi à leur droite. Fa, à gauche des trois ; sol et la entre elles ; si à leur droite.' })}
<p>Les pays anglophones et germaniques emploient des lettres, que l’on retrouve dans les noms d’accords (« C7 », « Fm ») :</p>
<table class="grid-notes">
<thead><tr><th>do</th><th>ré</th><th>mi</th><th>fa</th><th>sol</th><th>la</th><th>si</th></tr></thead>
<tbody><tr><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>A</td><td>B</td></tr></tbody>
</table>
${W.notion({ id: 'notes-reperes', title: 'Trouver les notes sur le clavier', short: 'do à gauche des deux touches noires, fa à gauche des trois', text: '<p><b>Do</b> : juste à gauche du groupe de deux touches noires. <b>Fa</b> : juste à gauche du groupe de trois. Les autres suivent dans l’ordre : do ré mi · fa sol la si.</p><p>En lettres : C D E F G A B (la = A).</p>', cards: [
  ['Où se trouve do sur le clavier ?', ['juste à gauche du groupe de deux touches noires', 'juste à gauche du groupe de trois touches noires', 'entre les deux touches noires', 'juste à droite des trois touches noires'], 'Fa, lui, est juste à gauche du groupe de trois.'],
  ['Où se trouve fa sur le clavier ?', ['juste à gauche du groupe de trois touches noires', 'juste à gauche du groupe de deux touches noires', 'entre les trois touches noires', 'juste à droite des deux touches noires'], 'Do est à gauche du groupe de deux.'],
  ['Quelle note s’écrit « A » ?', ['la', 'do', 'ré', 'si'], 'C D E F G A B = do ré mi fa sol la si.'],
  { id: 'quiz:n1-th-notes:kname', quiz: { kind: 'keyname', title: 'Nommer les touches blanches' } },
] })}
${W.quiz({ kind: 'keyname', title: 'À toi : nommer les touches blanches', count: 10, stat: 'kname' })}

<h2>Les octaves : quel do ?</h2>
${idea('De do au do suivant, il y a une <b>octave</b> : huit touches blanches. Pour savoir de quel do on parle, on ajoute un numéro : en France, le do du milieu du clavier s’appelle <b>do3</b>.')}
<p>Les notes suivantes sont ré3, mi3… jusqu’à si3 ; puis vient do4. Le piano couvre un peu plus de sept octaves : 88 touches, de la la plus grave (la-1) au do le plus aigu (do7).</p>
${W.tip('Deux conventions', '<p>Les ouvrages anglophones appellent le do central <b>C4</b>, un numéro de plus qu’en France. Dans cette application, on utilise la convention française : do3 = do central.</p>')}
${W.check({ questions: [
  { q: 'Le do juste au-dessus de do3 s’appelle…', options: ['do4', 'do2', 'do3 aussi'], why: 'Le numéro change à chaque do : do3, ré3… si3, puis do4.' },
  { q: 'Et la note juste en dessous de do3 ?', options: ['si2', 'si3', 'do2'], why: 'Si2 : on est encore dans l’octave du dessous.' },
] })}
${W.notion({ id: 'octaves', title: 'Les octaves', short: 'do3 = do central (C4 en anglais) ; le numéro change à chaque do', text: '<p>Le <b>do central</b> s’appelle <b>do3</b> en France (C4 en anglais). Le numéro change à chaque do : si2, do3, ré3… si3, do4.</p>', cards: [
  { id: 'fact:n1-th-notes:1', q: 'Comment s’appelle le do central, en France ?', a: ['do3', 'do4', 'do2', 'do1'], why: 'Do3 en France ; les ouvrages anglophones disent C4.' },
  ['La note juste sous do3 s’appelle…', ['si2', 'si3', 'do2', 'la3'], 'Le numéro change à chaque do : si2, puis do3.'],
] })}
${W.quiz({ kind: 'findnote', title: 'Au piano : trouver une note', count: 10, stat: 'findnote' })}

<h2>Demi-ton et ton</h2>
${idea('Le <b>demi-ton</b> est l’écart entre deux touches voisines, blanche ou noire. Deux demi-tons font un <b>ton</b>. Entre <b>mi et fa</b>, et entre <b>si et do</b>, il n’y a pas de touche noire : ce sont des demi-tons.')}
${W.kbd({ from: 60, to: 72, title: 'Les deux demi-tons « blancs »', marks: [{ m: 64, label: 'mi', color: '#f2d9a8' }, { m: 65, label: 'fa', color: '#f2d9a8' }, { m: 71, label: 'si', color: '#f2d9a8' }, { m: 72, label: 'do', color: '#f2d9a8' }], names: 'none', caption: 'Mi – fa et si – do : deux touches blanches voisines, à un demi-ton.' })}
${W.build({ title: 'À toi : compte sur le clavier', tasks: [
  { kind: 'interval', from: 'mi3', iv: '2m', talk: 'tons', prompt: 'Joue la note à <b>un demi-ton</b> au-dessus de <b>mi</b>.' },
  { kind: 'interval', from: 'do3', iv: '2M', talk: 'tons', prompt: 'Joue la note à <b>un ton</b> au-dessus de <b>do</b>.' },
  { kind: 'interval', from: 'si3', iv: '2m', talk: 'tons', prompt: 'Joue la note à <b>un demi-ton</b> au-dessus de <b>si</b>.' },
] })}
${W.notion({ id: 'demi-tons-blancs', title: 'Demi-ton, ton', short: 'deux touches voisines = un demi-ton ; mi – fa et si – do sont des demi-tons', text: '<p><b>Demi-ton</b> : deux touches voisines, blanches ou noires. <b>Ton</b> : deux demi-tons. Pas de touche noire entre <b>mi et fa</b>, ni entre <b>si et do</b> : ce sont des demi-tons.</p>', cards: [
  { id: 'fact:n1-th-notes:0', q: 'Entre quelles touches blanches n’y a-t-il pas de touche noire ?', a: ['mi–fa et si–do', 'do–ré et fa–sol', 'sol–la et la–si', 'ré–mi et la–si'], why: 'Mi–fa et si–do ne sont qu’à un demi-ton : pas de touche noire entre elles.' },
  ['Combien de demi-tons de do à mi ?', ['4', '2', '3', '5'], 'Do♯, ré, ré♯, mi.'],
] })}

<h2>Dièse, bémol, bécarre : une touche, deux noms</h2>
${idea('Le <b>dièse</b> (♯) hausse une note d’un demi-ton, le <b>bémol</b> (♭) l’abaisse d’un demi-ton, le <b>bécarre</b> (♮) annule l’un ou l’autre. Une touche noire porte donc deux noms : do♯ = ré♭.')}
${W.kbd({ from: 60, to: 72, title: 'Une touche, deux noms', marks: [{ m: 61, label: 'do♯' }, { m: 63, label: 'mi♭' }, { m: 66, label: 'fa♯' }, { m: 68, label: 'la♭' }, { m: 70, label: 'si♭' }], names: 'none', caption: 'Do♯ = ré♭ ; mi♭ = ré♯ ; fa♯ = sol♭ ; la♭ = sol♯ ; si♭ = la♯.' })}
<p>Ces notes sont <b>enharmoniques</b> : même son, nom différent. Le nom employé dépend de la tonalité (tu verras pourquoi avec les gammes).</p>
${trap('un dièse n’est pas toujours une touche noire : <b>mi♯</b> est la touche blanche fa, <b>si♯</b> la touche do ; de même, do♭ = si, fa♭ = mi.')}
${W.notion({ id: 'alterations', title: 'Dièse, bémol, bécarre', short: '♯ hausse, ♭ abaisse, ♮ annule ; do♯ = ré♭ (enharmoniques)', text: '<p><b>♯</b> hausse d’un demi-ton, <b>♭</b> abaisse d’un demi-ton, <b>♮</b> annule. Une touche noire a deux noms (do♯ = ré♭) : ce sont des notes <b>enharmoniques</b>. Mi♯ = fa, si♯ = do.</p>', cards: [
  { id: 'fact:n1-th-notes:2', q: 'Sur quelle touche se joue mi♯ ?', a: ['la touche blanche fa', 'la touche noire entre mi et fa', 'la touche fa♯', 'la touche ré♯'], why: 'Un dièse n’est pas toujours une touche noire : mi♯ = fa.' },
  { id: 'fact:n1-th-notes:3', q: 'Do♯ et ré♭ sont…', a: ['enharmoniques : même touche, nom différent', 'à un demi-ton l’un de l’autre', 'à un ton l’un de l’autre', 'deux touches différentes'], why: 'Une touche noire porte deux noms ; le nom dépend de la tonalité.' },
  ['Que fait un bécarre ?', ['il annule un dièse ou un bémol', 'il hausse la note d’un demi-ton', 'il abaisse la note d’un ton', 'il répète la note'], 'La note redevient « naturelle ».'],
  { id: 'quiz:n1-th-notes:kname-b', quiz: { kind: 'keyname', black: 'only', title: 'Nommer les touches noires' } },
] })}
${W.quiz({ kind: 'keyname', black: 'only', title: 'À toi : nommer les touches noires', count: 8, stat: 'kname-b' })}

<h2>Dans ta pièce : mesures 1 à 8</h2>
${idea('La mélodie de ton nocturne commence par <b>do – fa – mi♭ – ré♭ – do</b>. Retrouve-la sur le clavier : deux touches noires, mi♭ et ré♭.')}
${W.build({ title: 'À toi : la mélodie du début', tasks: [
  { kind: 'notes', notes: ['do4', 'fa4', 'mi♭4', 'ré♭4', 'do4'], givenFirst: true, labels: ['do', 'fa', 'mi♭', 'ré♭', 'do'], prompt: 'Joue la mélodie du début : <b>do</b> (déjà là), puis <b>fa, mi♭, ré♭, do</b>.', doneText: 'Do – fa – mi♭ – ré♭ – do : le thème de ton nocturne.' },
  { kind: 'notes', notes: ['do4', 'si3', 'do4', 'ré♭4', 'do4'], givenFirst: true, labels: ['do', 'si♮', 'do', 'ré♭', 'do'], prompt: 'Mesure 2 : <b>do</b> (déjà là), puis <b>si♮, do, ré♭, do</b> : les deux voisines de do.', doneText: 'Si♮ et ré♭ sont les deux voisines de do, à un demi-ton de chaque côté.' },
] })}
<p>La main gauche joue bien plus grave : ses basses sont <b>fa1, sol1, la♭1</b> et <b>mi1</b> (avec un bécarre : mi♮), plus de deux octaves sous la mélodie.</p>
${W.score({ abc: OP55_NAMES, title: 'Mesures 1 à 4, avec le nom des notes', bpm: 56, startBpm: 50, analysis: false })}
`,
  },

  {
    id: 'n1-th-portee', minutes: 20, steps: true,
    title: 'Lire les notes : la portée, les clés de sol et de fa',
    summary: 'Cinq lignes, deux clés, et six notes-repères : on lit les autres par voisinage, sans compter depuis le bas. C’est la méthode des lecteurs rapides.',
    goals: ['Lire les notes en clé de sol et en clé de fa.', 'Lire vite grâce à six notes-repères, puis par voisinage.', 'Appliquer l’armure et les altérations accidentelles.'],
    goal: '90 % ou plus aux séries « Notes en clé de sol » et « Notes en clé de fa ».',
    body: W => `
<p>Lire une note, ce n’est pas compter les lignes depuis le bas : c’est trop lent. Cette leçon te donne six repères et une façon de lire par voisinage. Avec un peu d’entraînement chaque jour, la lecture devient un réflexe.</p>

<h2>La portée et les deux clés</h2>
${idea('Les notes s’écrivent sur une <b>portée</b> de cinq lignes ; plus une note est haute, plus elle est aiguë. La <b>clé</b> donne le nom d’une ligne : en <b>clé de sol</b>, la 2<sup>e</sup> ligne porte <b>sol3</b> ; en <b>clé de fa</b>, la 4<sup>e</sup> ligne porte <b>fa2</b>.')}
${W.staff({ abc: `X:1\nL:1/2\nK:C clef=treble\n"^sol3 : 2e ligne"G2 |]`, title: 'Clé de sol (en général la main droite)', width: 260, caption: 'La clé s’enroule autour de la 2<sup>e</sup> ligne (en comptant depuis le bas) : c’est la ligne de sol3.' })}
${W.staff({ abc: `X:1\nL:1/2\nK:C clef=bass\n"^fa2 : 4e ligne"F,2 |]`, title: 'Clé de fa (en général la main gauche)', width: 260, caption: 'Les deux points de la clé encadrent la 4<sup>e</sup> ligne : c’est la ligne de fa2.' })}
${trap('ne lis pas la clé de fa comme une clé de sol : sur la 2<sup>e</sup> ligne, la clé de sol donne sol, la clé de fa donne <b>si</b>.')}
${W.check({ questions: [
  { q: 'En clé de sol, quelle ligne porte sol3 ?', options: ['la 2e ligne', 'la 1re ligne', 'la 3e ligne', 'la 4e ligne'], why: 'La clé de sol s’enroule autour de la 2<sup>e</sup> ligne.' },
  { q: 'En clé de fa, quelle ligne porte fa2 ?', options: ['la 4e ligne', 'la 2e ligne', 'la 3e ligne', 'la 5e ligne'], why: 'Les deux points de la clé encadrent la 4<sup>e</sup> ligne.' },
] })}
${W.notion({ id: 'cles', title: 'Les deux clés', short: 'clé de sol : sol3 sur la 2e ligne ; clé de fa : fa2 sur la 4e ligne', text: '<p><b>Clé de sol</b> : sol3 sur la 2<sup>e</sup> ligne. <b>Clé de fa</b> : fa2 sur la 4<sup>e</sup> ligne. Les lignes se comptent depuis le bas.</p>', cards: [
  { id: 'fact:n1-th-portee:1', q: 'En clé de sol, sur quelle ligne est sol3 ?', a: ['la 2e ligne', 'la 1re ligne', 'la 3e ligne', 'la 4e ligne'], why: 'La clé de sol s’enroule autour de la 2e ligne.' },
  { id: 'fact:n1-th-portee:0', q: 'En clé de fa, quelle note est sur la 4e ligne ?', a: ['fa2', 'sol3', 'ré3', 'la2'], why: 'Les deux points de la clé de fa encadrent la 4e ligne : fa2.' },
  { id: 'fact:n1-th-portee:3', q: 'En clé de fa, quelle note est sur la 2e ligne ?', a: ['si', 'sol', 'ré', 'la'], why: 'Piège classique : lue comme en clé de sol, on dirait sol ; en clé de fa, c’est si.' },
] })}

<h2>Six notes-repères</h2>
${idea('Plutôt que de compter les lignes, apprends <b>six repères</b>. Clé de sol : <b>do3</b> (ligne sous la portée), <b>sol3</b> (2<sup>e</sup> ligne), <b>do4</b> (3<sup>e</sup> interligne). Clé de fa : <b>do2</b> (2<sup>e</sup> interligne), <b>fa2</b> (4<sup>e</sup> ligne), <b>do3</b> (ligne au-dessus de la portée).')}
${W.score({ abc: STAFF_LANDMARKS, title: 'Les notes-repères', bpm: 50, practice: false, hands: false, caption: 'Clé de sol : do3, sol3, do4, sol4. Clé de fa : do2, fa2, do3, fa1. Le do central (do3) est sur une petite ligne entre les deux portées : en clé de sol juste en dessous, en clé de fa juste au-dessus. C’est la même touche.' })}
${W.notion({ id: 'reperes-lecture', title: 'Les notes-repères', short: 'clé de sol : do3, sol3, do4 ; clé de fa : do2, fa2, do3', text: '<ul><li><b>Clé de sol</b> : do3 (1<sup>re</sup> ligne en dessous), sol3 (2<sup>e</sup> ligne), do4 (3<sup>e</sup> interligne).</li><li><b>Clé de fa</b> : do2 (2<sup>e</sup> interligne), fa2 (4<sup>e</sup> ligne), do3 (1<sup>re</sup> ligne au-dessus).</li></ul>', cards: [
  ['En clé de sol, où s’écrit do4 ?', ['dans le 3e interligne', 'sur la 3e ligne', 'sur la 4e ligne', 'dans le 2e interligne'], 'Un des trois repères de la clé de sol.'],
  ['Où s’écrit le do central (do3) ?', ['sur une petite ligne entre les deux portées', 'sur la 1re ligne de la clé de sol', 'dans le 3e interligne de la clé de fa', 'sur la 5e ligne de la clé de fa'], 'Juste sous la portée de sol, ou juste au-dessus de celle de fa : la même touche.'],
  ['En clé de fa, où s’écrit do2 ?', ['dans le 2e interligne', 'sur la 2e ligne', 'sur la 3e ligne', 'dans le 3e interligne'], 'Un des repères de la clé de fa.'],
  { id: 'quiz:n1-th-portee:notes-t', quiz: { kind: 'notes', clefs: ['treble'], title: 'Notes en clé de sol' } },
  { id: 'quiz:n1-th-portee:notes-b', quiz: { kind: 'notes', clefs: ['bass'], title: 'Notes en clé de fa' } },
] })}

<h2>Lire par voisinage</h2>
${idea('Depuis un repère : d’une ligne à l’interligne juste au-dessus, c’est la <b>note suivante</b> (sol → la) ; d’une ligne à la ligne suivante, on <b>saute une note</b> (sol → si).')}
${worked('Exemple résolu : la note sur la 3e ligne, en clé de sol', method(['Repère le plus proche : sol3, sur la 2<sup>e</sup> ligne.', 'L’interligne juste au-dessus : la3.', 'La ligne suivante, la 3<sup>e</sup> : <b>si3</b>.']), 'La 3e ligne de la clé de sol porte si3. Ligne à ligne, on saute une note : sol → si.')}
${W.quiz({ kind: 'notes', clefs: ['treble'], title: 'À toi : notes en clé de sol', count: 12, stat: 'notes-t' })}
${W.quiz({ kind: 'notes', clefs: ['bass'], title: 'À toi : notes en clé de fa', count: 12, stat: 'notes-b' })}

<h2>L’armure et les altérations accidentelles</h2>
${idea('Après la clé, l’<b>armure</b> : ses altérations valent pour <b>toute la pièce</b>, à toutes les octaves. Une altération écrite devant une note (<b>accidentelle</b>) vaut jusqu’à la <b>fin de la mesure</b>, pour cette note à cette hauteur.')}
${W.check({ questions: [
  { q: 'Ton nocturne a quatre bémols à l’armure (si♭, mi♭, la♭, ré♭). Tu lis un la sans altération. Tu joues…', options: ['la♭', 'la'], why: 'L’armure vaut pour toute la pièce : tous les la sont la♭, sauf indication contraire.' },
  { q: 'Mesure 2, un bécarre devant si : si♮. Plus loin dans la même mesure, un autre si, sans signe :', options: ['si♮ : l’accidentelle vaut jusqu’à la barre de mesure', 'si♭ : il faudrait répéter le bécarre'], why: 'L’altération accidentelle vaut jusqu’à la fin de la mesure.' },
  { q: 'Et dans la mesure suivante ?', options: ['si♭ : l’armure reprend ses droits', 'si♮ : le bécarre continue'], why: 'Après la barre de mesure, on revient à l’armure.' },
] })}
${W.notion({ id: 'accidentelles', title: 'Armure et altérations accidentelles', short: 'armure : toute la pièce ; accidentelle : jusqu’à la barre de mesure', text: '<p>L’<b>armure</b> vaut pour toute la pièce, à toutes les octaves. Une <b>altération accidentelle</b> vaut jusqu’à la fin de la mesure, pour cette note à cette hauteur.</p>', cards: [
  { id: 'fact:n1-th-portee:2', q: 'Jusqu’où vaut une altération accidentelle ?', a: ['jusqu’à la barre de mesure, pour cette note à cette hauteur', 'jusqu’à la fin de la pièce', 'pour une seule note', 'jusqu’à la fin de la ligne, à toutes les octaves'], why: 'L’armure vaut pour toute la pièce ; l’altération accidentelle, jusqu’à la barre de mesure.' },
  ['Une armure de quatre bémols : comment joue-t-on un mi écrit sans altération ?', ['mi♭', 'mi', 'mi♯', 'cela dépend de l’octave'], 'L’armure vaut pour tous les mi, à toutes les octaves.'],
] })}

<h2>Dans ta pièce : mesures 1 à 8</h2>
${idea('Lis ta partition avec les repères : do4 dans le 3<sup>e</sup> interligne, sol3 sur la 2<sup>e</sup> ligne, fa2 sur la 4<sup>e</sup> ligne de la clé de fa. Les autres notes se lisent par voisinage.')}
${W.spot({ abc: OP55.e1, title: 'Sur la partition : retrouve les notes', tasks: [
  { q: 'Touche le <b>do4</b> de la levée (3<sup>e</sup> interligne de la clé de sol).', targets: [{ bar: 0, note: 'do4', hand: 'rh' }], why: 'Le repère do4, dans le 3<sup>e</sup> interligne.' },
  { q: 'Mesure 1 : touche le <b>fa4</b>, sur la 5<sup>e</sup> ligne, tout en haut.', targets: [{ bar: 1, beat: 2, note: 'fa4', hand: 'rh' }], why: 'Depuis do4 (3<sup>e</sup> interligne) : ré (4<sup>e</sup> ligne), mi (4<sup>e</sup> interligne), fa (5<sup>e</sup> ligne).' },
  { q: 'Mesure 1 : touche la basse <b>sol1</b>, sur la 1<sup>re</sup> ligne de la clé de fa.', targets: [{ bar: 1, beat: 3, note: 'sol1', hand: 'lh' }], why: 'Les lignes de la clé de fa, de bas en haut : sol1, si1, ré2, fa2, la2. Depuis fa2 (4<sup>e</sup> ligne), on descend de ligne en ligne en sautant une note : ré2, si1, sol1.' },
  { q: 'Mesure 2 : touche le <b>si♮3</b>, sur la 3<sup>e</sup> ligne, avec un bécarre.', targets: [{ bar: 2, beat: 1, note: 'si3', hand: 'rh' }], why: 'Sol3 sur la 2<sup>e</sup> ligne, la3 dans l’interligne, si3 sur la 3<sup>e</sup> ligne. Le bécarre annule le si♭ de l’armure.' },
] })}
${W.score({ abc: OP55_NAMES, title: 'Mesures 1 à 4, avec le nom des notes (pour vérifier)', bpm: 56, startBpm: 50, analysis: false })}
${W.score({ abc: OP55.e2, title: 'Mesures 5 à 8', bpm: 56, startBpm: 50 })}
${W.check({ questions: [
  { q: 'Mesures 5 à 8 : la main gauche joue ses basses aux temps 1 et 3. Mesure 5, quelles sont-elles ?', options: ['fa1 puis sol1', 'la♭1 puis si♭1', 'do2 puis do1', 'fa1 puis fa1'], why: 'Comme au début : fa1, puis sol1. Les mesures suivantes : la♭1 – si♭1, do2 – do1, fa1 – fa1.' },
] })}
<h3>Pour t’entraîner</h3>
${W.quiz({ kind: 'notes', mode: 'play', title: 'Au piano : joue la note écrite, à la bonne hauteur', count: 10, stat: 'notes-play' })}
`,
  },

  {
    id: 'n1-th-rythme', minutes: 20, steps: true,
    title: 'Le rythme : durées, silences, points et liaisons',
    summary: 'Chaque figure vaut la moitié de la précédente : ronde, blanche, noire, croche, double croche. Un point ajoute la moitié, une liaison additionne. Et l’on compte à voix haute pour placer chaque note.',
    goals: ['Connaître la durée de chaque figure et de chaque silence.', 'Lire le point et la liaison.', 'Compter un rythme à voix haute, croches et doubles croches comprises.'],
    goal: 'tu complètes 8 mesures sur 10 et tu comptes à voix haute le rythme des mesures 1 à 4 de ton nocturne.',
    body: W => `
<p>La hauteur dit <i>quelle</i> note jouer ; le rythme dit <i>quand</i>, et <i>combien de temps</i>. Les durées se mesurent en <b>temps</b> : la pulsation régulière que l’on bat du pied. Ici, un temps = une noire.</p>

<h2>Les figures : chacune vaut la moitié de la précédente</h2>
${idea('<b>Ronde 4 temps, blanche 2, noire 1, croche ½, double croche ¼.</b> Chaque figure vaut la moitié de la précédente : une ronde = 2 blanches = 4 noires = 8 croches = 16 doubles croches.')}
<table>
<thead><tr><th>Figure</th><th class="num">Durée (en noires)</th><th>Pour la dire</th></tr></thead>
<tbody>
<tr><td>ronde</td><td class="num">4</td><td>ta-a-a-a</td></tr>
<tr><td>blanche</td><td class="num">2</td><td>ta-a</td></tr>
<tr><td>noire</td><td class="num">1</td><td>ta</td></tr>
<tr><td>croche</td><td class="num">½</td><td>deux croches : ti-ti</td></tr>
<tr><td>double croche</td><td class="num">¼</td><td>quatre doubles : ti-ri-ti-ri</td></tr>
</tbody></table>
${W.score({ abc: VALUES, title: 'De la ronde à la double croche', bpm: 66, practice: false, hands: false, click: true, caption: 'Les croches et doubles croches sont reliées par des barres (des ligatures), groupées par temps : on voit d’un coup d’œil où commence chaque temps.' })}
${W.check({ questions: [
  { q: 'Combien de croches dans une blanche ?', options: ['4', '2', '8'], why: 'Une blanche = 2 noires = 4 croches.' },
  { q: 'Combien de doubles croches dans une noire ?', options: ['4', '2', '8'], why: 'Une noire = 2 croches = 4 doubles croches.' },
] })}
${W.notion({ id: 'figures', title: 'Les figures de notes', short: 'ronde 4, blanche 2, noire 1, croche ½, double croche ¼', text: '<p><b>Ronde 4 · blanche 2 · noire 1 · croche ½ · double croche ¼</b> (en temps de noire). Chaque figure vaut la moitié de la précédente.</p>', cards: [
  ['Combien de temps (de noire) dure une blanche ?', ['2', '1', '4', '3'], 'Ronde 4, blanche 2, noire 1.'],
  ['Combien vaut une croche ?', ['½ temps', '1 temps', '¼ de temps', '2 temps'], 'La moitié d’une noire.'],
  ['Combien de doubles croches dans une noire ?', ['4', '2', '8', '3'], 'Ti-ri-ti-ri.'],
] })}

<h2>Les silences : ils se comptent aussi</h2>
${idea('Chaque figure a son silence : <b>pause</b> (4), <b>demi-pause</b> (2), <b>soupir</b> (1), <b>demi-soupir</b> (½), <b>quart de soupir</b> (¼). Un silence se compte exactement comme une note : il fait partie du rythme.')}
${W.score({ abc: RESTS, title: 'Les silences', bpm: 66, practice: false, hands: false, click: true })}
${trap('la pause et la demi-pause se ressemblent. La <b>pause</b> pend sous la 4<sup>e</sup> ligne (la plus longue, la plus « lourde »), la <b>demi-pause</b> est posée sur la 3<sup>e</sup> ligne.')}
${W.notion({ id: 'silences', title: 'Les silences', short: 'pause 4, demi-pause 2, soupir 1, demi-soupir ½, quart de soupir ¼', text: '<p><b>Pause</b> 4 (ou une mesure entière) · <b>demi-pause</b> 2 · <b>soupir</b> 1 · <b>demi-soupir</b> ½ · <b>quart de soupir</b> ¼. La pause pend sous la 4<sup>e</sup> ligne, la demi-pause est posée sur la 3<sup>e</sup>.</p>', cards: [
  ['Combien de temps dure un soupir ?', ['1 temps (comme une noire)', '½ temps', '2 temps', '4 temps'], 'Soupir = noire ; demi-soupir = croche.'],
  ['Quel silence vaut une croche ?', ['le demi-soupir', 'le soupir', 'la demi-pause', 'le quart de soupir'], 'Demi-soupir = ½ temps.'],
  ['Comment distinguer pause et demi-pause ?', ['la pause pend sous la 4e ligne, la demi-pause est posée sur la 3e', 'la pause est noire, la demi-pause blanche', 'la demi-pause porte un point', 'elles se distinguent par leur taille'], 'La plus longue pend : elle est « lourde ».'],
] })}

<h2>Le point et la liaison</h2>
${idea('Le <b>point</b> ajoute la moitié de la valeur : blanche pointée = 2 + 1 = <b>3 temps</b>. La <b>liaison</b> relie deux notes de même hauteur : on joue la première et on <b>tient</b> pendant les deux.')}
${worked('Exemple résolu : trois notes pointées', `<ul><li>Blanche pointée : 2 + 1 = <b>3 temps</b>.</li><li>Noire pointée : 1 + ½ = <b>1 temps ½</b>.</li><li>Croche pointée : ½ + ¼ = <b>¾ de temps</b> ; il reste ¼ pour la double croche qui la suit souvent.</li></ul>`)}
${W.score({ abc: DOTS, title: 'Le point et la liaison', bpm: 66, practice: false, hands: false, click: true })}
${trap('ne confonds pas deux liaisons qui se ressemblent. La <b>liaison de prolongation</b> relie deux notes de <b>même hauteur</b> : on ne rejoue pas. La <b>liaison d’expression</b> relie des notes <b>différentes</b> : on les joue toutes, liées (legato).')}
${W.notion({ id: 'point-liaison', title: 'Le point et la liaison', short: 'le point ajoute la moitié ; la liaison (même note) additionne sans rejouer', text: '<p>Le <b>point</b> ajoute la moitié de la valeur : blanche pointée 3, noire pointée 1 ½, croche pointée ¾. La <b>liaison de prolongation</b> (même hauteur) additionne les durées, sans rejouer.</p>', cards: [
  { id: 'fact:n1-th-rythme:0', q: 'Combien de temps (de noire) dure une blanche pointée ?', a: ['3', '2', '2 ½', '4'], why: 'Le point ajoute la moitié de la valeur : 2 + 1 = 3.' },
  { id: 'fact:n1-th-rythme:1', q: 'Combien vaut une croche pointée ?', a: ['¾ de temps', '½ temps', '1 temps ½', '1 temps'], why: '½ + ¼ = ¾ de temps : la double croche qui suit est très courte.' },
  { id: 'fact:n1-th-rythme:2', q: 'Que signifie une liaison entre deux notes de même hauteur ?', a: ['on joue la première et on tient, sans rejouer', 'on joue les deux notes legato', 'on rejoue la note plus doucement', 'on raccourcit la première note'], why: 'C’est la liaison de prolongation ; entre notes différentes, c’est une liaison d’expression (legato).' },
  { id: 'quiz:n1-th-rythme:mfill', quiz: { kind: 'measurefill', values: ['w', 'hd', 'h', 'q', 'e'], meters: ['4/4', '3/4'], title: 'Compléter la mesure' } },
] })}
${W.quiz({ kind: 'measurefill', values: ['w', 'hd', 'h', 'q', 'e'], meters: ['4/4', '3/4'], title: 'À toi : compléter la mesure', count: 10, stat: 'mfill' })}

<h2>Compter à voix haute</h2>
${idea('Pour lire un rythme, compte les temps et place les notes dessus : « <b>1, 2, 3, 4</b> » pour les noires ; « <b>1 et 2 et</b> » pour les croches (la 2<sup>e</sup> croche tombe sur le « et ») ; « <b>1 e et a</b> » pour quatre doubles croches (comme dans l’onglet Rythme).')}
${worked('Exemple résolu : croche pointée + double croche', method(['Divise le temps en quatre doubles croches : « 1 – e – et – a ».', 'La croche pointée en dure trois : elle commence sur « 1 » et tient pendant « e » et « et ».', 'La double croche tombe sur le dernier quart : « a », juste avant le temps suivant.']), 'Dis « 1 — — a 2 » : la double croche est courte, collée au temps suivant.')}
${W.tip('Taper avant de jouer', '<p>Tape le rythme dans les mains (ou sur le couvercle du piano) en comptant, avant de jouer le passage : tu sépares la difficulté du rythme de celle des notes.</p>')}
${W.rhythm({ level: 2, title: 'À toi : lire et taper un rythme', stat: 'rread-1' })}

<h2>Les groupes irréguliers : le triolet</h2>
${idea('Un <b>triolet</b>, ce sont trois notes égales à la place de deux, marquées d’un 3. On trouve aussi chez Chopin des groupes de cinq ou sept notes, sur un temps ou deux (le septolet de la mesure 44 : sept croches sur deux temps) : ils se répartissent régulièrement, la première avec le temps, la dernière juste avant l’appui suivant.')}
${W.notion({ id: 'triolet', title: 'Le triolet', short: 'trois notes égales à la place de deux', text: '<p><b>Triolet</b> : trois notes égales dans le temps de deux (trois croches pour une noire), marquées d’un 3. Quintolet, septolet : cinq ou sept notes réparties régulièrement, sur un temps ou deux.</p>', cards: [
  { id: 'fact:n1-th-rythme:3', q: 'Un triolet de croches, c’est…', a: ['trois croches dans le temps de deux', 'trois croches accentuées', 'trois notes dans un demi-temps', 'trois croches dans le temps de quatre'], why: 'Trois notes égales à la place de deux : un temps de noire divisé en trois.' },
  ['Comment placer un quintolet (cinq notes dans un temps) ?', ['la première avec le temps, les autres régulièrement jusqu’au temps suivant', 'les cinq très vite, puis attendre', 'deux puis trois', 'la dernière sur le temps suivant'], 'Une division régulière du temps en cinq.'],
] })}

<h2>Dans ta pièce : mesures 1 à 16</h2>
${idea('Compte les premières mesures à voix haute avant de les jouer. Deux pièges : la croche pointée de la mesure 2, et le do tenu par-dessus la barre de mesure.')}
${W.spot({ abc: OP55.e1, title: 'Sur la partition : où tombent les notes ?', tasks: [
  { q: 'Mesure 1 : touche la note de la mélodie qui commence sur le <b>2<sup>e</sup> temps</b>.', targets: [{ bar: 1, beat: 2, hand: 'rh' }], why: 'Fa : le do de la levée occupe le 1<sup>er</sup> temps (il est lié), fa arrive sur « 2 ».' },
  { q: 'Mesure 2 : touche la <b>double croche</b> du 1<sup>er</sup> temps.', targets: [{ bar: 2, beat: 1, note: 'si3', hand: 'rh' }], why: 'Si♮ : la croche pointée do dure trois quarts du temps, si♮ tombe sur le « a », juste avant le 2<sup>e</sup> temps.' },
  { q: 'Mesure 2 : touche la note <b>longue</b> qui continue sur la mesure suivante.', targets: [{ bar: 2, beat: 3, note: 'do4', hand: 'rh' }], why: 'Ce do (une blanche) est lié à la noire du début de la mesure 3 : il dure trois temps.' },
] })}
${W.check({ questions: [
  { q: 'Mesure 2 : do (croche pointée) – si♮ (double croche) – do (croche pointée) – ré♭ (double croche), puis do (blanche). Combien de temps dure ce dernier do, avec sa liaison sur la noire de la mesure 3 ?', options: ['3 temps', '2 temps', '4 temps'], why: 'Blanche 2 + noire 1 = 3 temps, sans rejouer.' },
] })}
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4, avec le clic', bpm: 56, startBpm: 46, click: true })}
${W.score({ abc: OP55.e3, title: 'Mesures 13 et 14 : la trille et le quintolet', bpm: 56, startBpm: 40, caption: 'Mesure 14 : cinq doubles croches dans le temps de quatre (un quintolet), juste après la trille.' })}
${W.exo('Au piano', '<p>Tape le rythme de la main droite des mesures 1 à 4 en comptant à voix haute, puis joue-le sur une seule touche, avec le clic de la partition ci-dessus. Seulement ensuite, joue les vraies notes.</p>')}
`,
  },

  {
    id: 'n1-th-mesure', minutes: 15, steps: true,
    title: 'La mesure : temps forts, levée, mesures simples et composées',
    summary: 'Les temps se regroupent par deux, trois ou quatre : c’est la mesure. Le chiffre du haut dit combien de temps, celui du bas lequel. Et un seul vrai appui porte chaque mesure : le temps fort.',
    goals: ['Lire un chiffre de mesure (2/4, 3/4, 4/4, 6/8).', 'Situer les temps forts et les temps faibles.', 'Reconnaître une levée et une syncope.'],
    goal: 'tu complètes 8 mesures sur 10 (2/4, 3/4, 4/4) et tu dis où tombent les temps forts de ton nocturne.',
    body: W => `
<p>Leçon précédente : la durée de chaque figure. Celle-ci dit comment les temps s’organisent, et où sont les appuis : c’est ce qui fait qu’une valse ne sonne pas comme une marche.</p>

<h2>Pulsation, temps et mesure</h2>
${idea('La <b>pulsation</b> est le battement régulier de la musique. Les temps se regroupent par deux, trois ou quatre : chaque groupe est une <b>mesure</b>, entre deux barres. Le premier temps de chaque mesure est un appui naturel : le <b>temps fort</b>.')}
${W.score({ abc: METERS, title: '2/4, 3/4, 4/4 et 6/8 : écoute où tombent les appuis', bpm: 72, practice: false, hands: false, click: true, caption: 'Le temps fort est marqué d’un accent. À 6/8, la mesure se bat en deux temps, chacun divisé en trois croches.' })}

<h2>Le chiffre de mesure</h2>
${idea('Au début de la partition, deux chiffres superposés. En <b>haut</b> : le <b>nombre de temps</b>. En <b>bas</b> : la <b>figure qui vaut un temps</b> (4 = la noire, 2 = la blanche, 8 = la croche).')}
<table>
<thead><tr><th>Mesure</th><th>Temps</th><th>Appuis</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td>2/4</td><td>2 noires</td><td>fort – faible</td><td>une marche</td></tr>
<tr><td>3/4</td><td>3 noires</td><td>fort – faible – faible</td><td>une valse ; l’op. 15 n° 1</td></tr>
<tr><td>4/4 (ou C)</td><td>4 noires</td><td>fort – faible – mi-fort – faible</td><td>l’op. 55 n° 1</td></tr>
</tbody></table>
${W.check({ questions: [
  { q: 'Une mesure contient une <b>blanche pointée</b>. Quel chiffre de mesure ?', options: ['3/4', '2/4', '4/4', '6/8'], why: 'Blanche pointée = 3 temps de noire : 3/4.' },
  { q: 'Une mesure contient <b>une blanche et deux noires</b>. Quel chiffre ?', options: ['4/4', '3/4', '2/4'], why: '2 + 1 + 1 = 4 temps : 4/4.' },
  { q: 'À 3/4, que dit le <b>4</b> ?', options: ['que le temps est une noire', 'qu’il y a quatre temps', 'le tempo'], why: 'Chiffre du bas : la figure qui vaut un temps.' },
] })}
${W.notion({ id: 'chiffre-mesure', title: 'Le chiffre de mesure', short: 'en haut : combien de temps ; en bas : quelle figure vaut un temps', text: '<p><b>En haut</b> : le nombre de temps. <b>En bas</b> : la figure d’un temps (4 = noire, 2 = blanche, 8 = croche). 3/4 : trois noires par mesure.</p>', cards: [
  { id: 'fact:n1-th-mesure:1', q: 'Dans 3/4, que dit le chiffre du bas ?', a: ['que le temps est une noire', 'qu’il y a quatre temps', 'le tempo', 'le nombre de mesures de la phrase'], why: 'Chiffre du haut : nombre de temps ; chiffre du bas : figure d’un temps (4 = noire).' },
  ['Combien de temps dans une mesure à 4/4 ?', ['4 temps de noire', '4 temps de blanche', '2 temps', '8 temps de croche'], 'Le C au début de ton nocturne signifie aussi 4/4.'],
  { id: 'quiz:n1-th-mesure:mfill-2', quiz: { kind: 'measurefill', values: ['hd', 'h', 'q', 'e'], meters: ['2/4', '3/4', '4/4'], title: 'Compléter des mesures à 2/4, 3/4, 4/4' } },
] })}
${W.quiz({ kind: 'measurefill', values: ['hd', 'h', 'q', 'e'], meters: ['2/4', '3/4', '4/4'], title: 'À toi : compléter des mesures à 2/4, 3/4, 4/4', count: 10, stat: 'mfill-2' })}

<h2>Temps forts et temps faibles</h2>
${idea('Dans chaque mesure, un seul vrai appui : le <b>premier temps</b>. À 4/4 : <b>fort</b> – faible – mi-fort – faible. À 3/4 : <b>fort</b> – faible – faible. Les autres temps sont plus légers.')}
${trap('accentuer chaque temps rend la musique raide, comme une marche au pas. Seul le temps fort est un appui ; les autres s’allègent.')}
${W.notion({ id: 'temps-forts', title: 'Temps forts et faibles', short: '4/4 : fort – faible – mi-fort – faible ; 3/4 : fort – faible – faible', text: '<p>À 4/4 : <b>fort – faible – mi-fort – faible</b>. À 3/4 : <b>fort – faible – faible</b>. Un seul vrai appui par mesure.</p>', cards: [
  { id: 'fact:n1-th-mesure:2', q: 'Où sont les appuis dans une mesure à 4/4 ?', a: ['fort – faible – mi-fort – faible', 'fort – fort – faible – faible', 'faible – fort – faible – fort', 'quatre temps égaux'], why: 'Seul le premier temps est un vrai appui ; le troisième est mi-fort.' },
  ['Où sont les appuis dans une mesure à 3/4 ?', ['fort – faible – faible', 'fort – faible – fort', 'faible – fort – faible', 'trois temps égaux'], 'La valse : un appui, deux temps légers.'],
] })}
${W.rhythm({ level: 2, meter: '3/4', title: 'À toi : lire et taper un rythme à 3/4', stat: 'rread-3' })}

<h2>Mesures composées : le temps divisé en trois</h2>
${idea('Dans une mesure <b>composée</b>, chaque temps se divise en <b>trois</b> croches : il vaut une noire pointée. On la reconnaît au 8 en bas et à un chiffre du haut multiple de 3 : <b>6/8 = 2 temps</b>, 9/8 = 3 temps, 12/8 = 4 temps.')}
<p><i>Clair de lune</i>, au niveau 2, est à 9/8 : trois temps, chacun en trois croches. Compte « <b>1 et a, 2 et a, 3 et a</b> ».</p>
${trap('compter une mesure à 6/8 en six temps égaux et lents : elle se sent en <b>deux</b> temps, chacun en trois croches.')}
${W.notion({ id: 'mesure-composee', title: 'Les mesures composées', short: '6/8, 9/8, 12/8 : temps de noire pointée, divisé en trois', text: '<p>Le temps vaut une <b>noire pointée</b>, divisée en <b>trois croches</b>. 6/8 = 2 temps, 9/8 = 3, 12/8 = 4.</p>', cards: [
  { id: 'fact:n1-th-mesure:0', q: 'Combien de temps dans une mesure à 6/8 ?', a: ['2 temps, à la noire pointée', '6 temps, à la croche', '3 temps, à la noire', '4 temps'], why: 'Mesure composée : deux temps, chacun divisé en trois croches.' },
  ['À 9/8, combien de temps, et lesquels ?', ['3 temps de noire pointée', '9 temps de croche', '3 temps de noire', '4 temps et demi'], 'Comme Clair de lune : « 1 et a, 2 et a, 3 et a ».'],
] })}

<h2>La levée et la syncope</h2>
${idea('La <b>levée</b> : une ou plusieurs notes <b>avant la première barre</b>, qui lancent la phrase vers le temps fort ; la première mesure complète porte alors le numéro 1. La <b>syncope</b> : une note attaquée sur un temps faible (ou entre deux temps) et <b>tenue par-dessus le temps fort</b> suivant : l’appui se déplace.')}
${trap('ne raccourcis pas une note syncopée : elle doit traverser le temps fort. C’est cette tenue qui crée la tension.')}
${W.notion({ id: 'levee-syncope', title: 'Levée et syncope', short: 'levée : avant la 1re barre ; syncope : attaquée faible, tenue sur le temps fort', text: '<ul><li><b>Levée</b> : notes avant la première barre de mesure, qui lancent la phrase.</li><li><b>Syncope</b> : note attaquée sur une partie faible et tenue par-dessus le temps fort : l’appui est déplacé.</li></ul>', cards: [
  { id: 'fact:n1-th-mesure:4', q: 'Qu’est-ce qu’une levée ?', a: ['une ou plusieurs notes avant la première barre de mesure', 'la dernière note d’une phrase', 'un signe de reprise', 'une note répétée'], why: 'Comme le do qui ouvre l’op. 55 n° 1, avant la première barre.' },
  { id: 'fact:n1-th-mesure:3', q: 'Qu’est-ce qu’une syncope ?', a: ['une note attaquée sur une partie faible et tenue par-dessus le temps fort', 'une note accentuée sur le temps fort', 'un silence sur le premier temps', 'une note plus courte que prévu'], why: 'L’appui est déplacé : la note doit traverser le temps fort, sans être raccourcie.' },
] })}

<h2>Dans ta pièce : mesures 1 à 16</h2>
${idea('Ton nocturne est à <b>4/4</b> (noté C), avec une <b>levée</b> d’un temps. La main gauche pose sa basse sur les temps 1 et 3, ses accords sur 2 et 4 : sens la mesure en deux grands temps, la basse comme repère.')}
${W.spot({ abc: OP55.e1, title: 'Sur la partition : les appuis', tasks: [
  { q: 'Touche la note de la <b>levée</b>.', targets: [{ bar: 0, hand: 'rh' }], why: 'Le do, avant la première barre : il lance la phrase vers la mesure 1.' },
  { q: 'Mesure 1 : touche la basse du <b>temps fort</b>.', targets: [{ bar: 1, beat: 1, hand: 'lh' }], why: 'Fa, sur le 1<sup>er</sup> temps : l’appui de la mesure.' },
  { q: 'Mesure 1 : touche la basse du temps <b>mi-fort</b>.', targets: [{ bar: 1, beat: 3, hand: 'lh' }], why: 'Sol, sur le 3<sup>e</sup> temps : le second appui, plus léger.' },
  { q: 'Mesure 2 : touche la note de la mélodie <b>attaquée au 3<sup>e</sup> temps et tenue par-dessus la barre</b>.', targets: [{ bar: 2, beat: 3, hand: 'rh' }], why: 'Ce do traverse le temps fort de la mesure 3 : une syncope. La mélodie repart au 2<sup>e</sup> temps de la mesure 3.' },
] })}
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4, avec le clic', bpm: 56, startBpm: 50, click: true })}
${W.exo('Au piano', '<p>Joue les mesures 1 à 4, main gauche seule, en comptant « 1, 2, 3, 4 » à voix haute avec le clic : basse plus présente sur 1 et 3, accords plus légers sur 2 et 4. Puis ajoute la main droite en gardant ce balancement.</p>')}
${W.more('Le tempo', '<p>Le <b>tempo</b> est la vitesse de la pulsation. ♩ = 60 signifie 60 noires par minute, une par seconde. Les termes italiens le décrivent : <i>Largo, Lento</i> (lent), <i>Andante</i> (allant, au pas), <i>Moderato</i>, <i>Allegro</i> (rapide) ; <i>Più mosso</i> : plus animé ; <i>a tempo</i> : retour au tempo.</p>')}
`,
  },

  {
    id: 'n1-th-gamme', minutes: 25, steps: true,
    title: 'La gamme majeure et ses degrés',
    summary: 'Toutes les gammes majeures ont le même escalier : deux tons, un demi-ton, trois tons, un demi-ton. Tu apprends à le construire sur n’importe quelle note, puis à nommer ses marches.',
    goals: ['Compter tons et demi-tons sur le clavier, sans te faire piéger par mi – fa et si – do.', 'Construire une gamme majeure sur n’importe quelle note, avec les bonnes altérations.', 'Nommer les degrés, surtout la tonique, la dominante et la sensible.'],
    goal: 'tu construis au clavier, sans faute, les gammes de ré, si♭ et la majeur, et tu réussis 8 questions sur 10 sur les degrés.',
    body: W => `
<p>Tu connais déjà la gamme de do majeur : les touches blanches, de do à do. Cette leçon montre pourquoi elle sonne « majeur », et comment retrouver exactement le même son à partir de n’importe quelle note. Une seule règle, appliquée pas à pas.</p>

<h2>Ton et demi-ton : compter sur le clavier</h2>
${idea('Le <b>demi-ton</b> est le plus petit pas du piano : d’une touche à sa voisine immédiate, blanche ou noire. Un <b>ton</b>, c’est deux demi-tons : on saute une touche.')}
${W.kbd({ from: 60, to: 72, title: 'Demi-tons et tons', marks: [{ m: 60, label: 'do', color: '#d6e0ef' }, { m: 61, label: '½', color: '#476aa3' }, { m: 62, label: 'T', color: '#d6e0ef' }, { m: 64, label: 'mi', color: '#f2d9a8' }, { m: 65, label: 'fa', color: '#f2d9a8' }, { m: 71, label: 'si', color: '#f2d9a8' }, { m: 72, label: 'do', color: '#f2d9a8' }], names: 'none', caption: 'Do → do♯ : un demi-ton. Do → ré : un ton (on passe par do♯). En or : mi – fa et si – do, deux touches blanches voisines, donc un demi-ton seulement.' })}
${worked('Exemple résolu : un ton au-dessus de mi', method(['Pars de <b>mi</b>.', 'Avance d’une touche : <b>fa</b> (1 demi-ton).', 'Avance encore d’une touche : <b>fa♯</b> (2 demi-tons).']), 'Un ton au-dessus de mi, c’est fa♯ — et non fa, qui n’est qu’à un demi-ton.')}
${trap('entre <b>mi et fa</b>, et entre <b>si et do</b>, il n’y a pas de touche noire. Ces deux paires de touches blanches sont à un demi-ton, pas à un ton. Presque toutes les erreurs de gamme viennent de là.')}
${W.build({ title: 'À toi : compte sur le clavier', tasks: [
  { kind: 'interval', from: 'mi3', iv: '2M', talk: 'tons', prompt: 'Joue la note à <b>un ton</b> au-dessus de <b>mi</b>.' },
  { kind: 'interval', from: 'si3', iv: '2m', talk: 'tons', prompt: 'Joue la note à <b>un demi-ton</b> au-dessus de <b>si</b>.' },
  { kind: 'interval', from: 'la3', iv: '2M', talk: 'tons', prompt: 'Joue la note à <b>un ton</b> au-dessus de <b>la</b>.' },
  { kind: 'interval', from: 'si3', iv: '2M', talk: 'tons', prompt: 'Joue la note à <b>un ton</b> au-dessus de <b>si</b>.' },
] })}

<h2>Le modèle : l’escalier de do majeur</h2>
${idea('Une gamme majeure, ce sont huit notes qui montent avec toujours les mêmes écarts, ceux de do majeur : <b>ton, ton, demi-ton, ton, ton, ton, demi-ton</b>.')}
${steps7(['do → ré', 'ré → mi', 'mi → fa', 'fa → sol', 'sol → la', 'la → si', 'si → do'], ['T', 'T', '<b>½</b>', 'T', 'T', 'T', '<b>½</b>'])}
${W.score({ abc: SCALE_C, title: 'Do majeur : les sept degrés', bpm: 80, practice: false, hands: false, caption: 'Les deux demi-tons tombent entre les degrés 3 et 4 (mi – fa) et 7 et 8 (si – do).' })}
<p>Pour le retenir : <b>deux tons, un demi ; trois tons, un demi</b>. Ce n’est pas un choix arbitraire : c’est cet escalier précis que l’oreille reconnaît comme « majeur ». La preuve à l’écoute : les mêmes touches blanches, en partant de ré, ne sonnent plus majeur, parce que les demi-tons tombent ailleurs.</p>
${W.ecoute({ title: 'Le même escalier, ou pas', bpm: 132, items: [
  { label: 'Do majeur (le modèle)', seq: 'do3 | ré3 | mi3 | fa3 | sol3 | la3 | si3 | do4:2', note: 'T T ½ T T T ½ : le son majeur.' },
  { label: 'Touches blanches depuis ré', seq: 'ré3 | mi3 | fa3 | sol3 | la3 | si3 | do4 | ré4:2', note: 'Demi-tons entre 2–3 et 6–7 : un autre escalier, un autre son, plus sombre.' },
  { label: 'Ré majeur (avec fa♯ et do♯)', seq: 'ré3 | mi3 | fa#3 | sol3 | la3 | si3 | do#4 | ré4:2', note: 'Deux dièses remettent les demi-tons à leur place : le son majeur revient.' },
] })}
${W.notion({ id: 'gamme-modele', title: 'Le modèle de la gamme majeure', short: 'T – T – ½ – T – T – T – ½', text: '<p><b>Ton – ton – demi-ton – ton – ton – ton – demi-ton.</b> Deux tons, un demi ; trois tons, un demi.</p><p>Les deux demi-tons sont entre les degrés <b>3 et 4</b> et entre <b>7 et 8</b> (en do : mi – fa, si – do).</p>', cards: [
  { id: 'fact:n1-th-gamme:0', q: 'Quel est le modèle de la gamme majeure ?', a: ['T – T – ½ – T – T – T – ½', 'T – ½ – T – T – ½ – T – T', 'T – T – T – ½ – T – T – ½', '½ – T – T – T – ½ – T – T'], why: 'Deux tons, un demi-ton ; trois tons, un demi-ton.' },
  ['Entre quels degrés d’une gamme majeure se trouvent les deux demi-tons ?', ['3–4 et 7–8', '2–3 et 6–7', '4–5 et 7–8', '1–2 et 5–6'], 'En do majeur : mi – fa (3–4) et si – do (7–8).'],
  ['Combien de tons et de demi-tons dans une gamme majeure ?', ['5 tons et 2 demi-tons', '6 tons et 1 demi-ton', '4 tons et 3 demi-tons', '7 tons'], 'T T ½ T T T ½ : cinq tons, deux demi-tons.'],
] })}
${W.check({ questions: [
  { q: 'Les touches blanches de ré à ré (ré mi fa sol la si do ré) forment-elles une gamme majeure ?', options: ['Non : les demi-tons tombent entre 2–3 et 6–7', 'Oui : ce sont les mêmes touches que do majeur'], why: 'Ce qui fait la gamme majeure, ce n’est pas les touches, c’est l’escalier T T ½ T T T ½. Depuis ré, mi – fa tombe entre les degrés 2 et 3.' },
  { q: 'Dans une gamme majeure, l’écart entre les degrés 6 et 7 est…', options: ['un ton', 'un demi-ton'], why: 'T T ½ T T <b>T</b> ½ : le sixième pas est un ton (en do : la → si).' },
  { q: 'Et entre les degrés 7 et 8 ?', options: ['un demi-ton', 'un ton'], why: 'Le dernier pas est toujours un demi-ton (en do : si → do).' },
] })}

<h2>Construire une gamme sur n’importe quelle note</h2>
${idea('On garde l’escalier et on change de point de départ. Les altérations (♯, ♭) servent seulement à respecter les écarts du modèle.')}
${method(['Écris les <b>sept noms</b> à partir de la tonique, sans en sauter ni en répéter : sol, la, si, do, ré, mi, fa, (sol).', 'Vérifie chaque écart <b>sur le clavier</b>, dans l’ordre du modèle : T, T, ½, T, T, T, ½.', 'Quand un écart ne va pas, <b>garde le nom</b> et ajoute un ♯ (pour monter la note) ou un ♭ (pour la baisser).'])}
${worked('Exemple résolu : sol majeur', `<ul><li>sol → la : un ton ✓ ; la → si : un ton ✓ ; si → do : un demi-ton ✓</li><li>do → ré : un ton ✓ ; ré → mi : un ton ✓</li><li>mi → fa : un demi-ton ✗ — le modèle demande <b>un ton</b>. On garde le nom fa et on le monte : <b>fa♯</b>.</li><li>fa♯ → sol : un demi-ton ✓ (le dernier pas).</li></ul>`, 'Sol majeur : sol – la – si – do – ré – mi – fa♯ – sol. Une altération : fa♯.')}
${worked('Exemple résolu : fa majeur', `<ul><li>fa → sol : un ton ✓ ; sol → la : un ton ✓</li><li>la → si : un ton ✗ — le modèle demande <b>un demi-ton</b>. On garde le nom si et on le baisse : <b>si♭</b>.</li><li>si♭ → do : un ton ✓ ; do → ré, ré → mi : un ton ✓ ; mi → fa : un demi-ton ✓.</li></ul>`, 'Fa majeur : fa – sol – la – si♭ – do – ré – mi – fa. Une altération : si♭.')}
${trap('pourquoi « fa♯ » et pas « sol♭ » (c’est la même touche) ? Parce qu’une gamme prend <b>chaque nom de note une fois</b>. Après mi vient le nom fa ; écrire sol♭ donnerait deux sol (sol♭ et sol) et aucun fa.')}
${W.notion({ id: 'gamme-construire', title: 'Construire une gamme majeure', short: 'sept noms, chacun une fois, puis ♯ ou ♭ pour suivre le modèle', text: '<ol><li>Les sept noms de notes depuis la tonique, chacun une fois.</li><li>Vérifier chaque écart avec le modèle T T ½ T T T ½.</li><li>Corriger avec ♯ ou ♭, sans changer le nom.</li></ol><p>Sol majeur : fa♯. Ré majeur : fa♯, do♯. Fa majeur : si♭. Si♭ majeur : si♭, mi♭.</p>', cards: [
  ['Dans la gamme de sol majeur, quelle note est altérée ?', ['fa♯', 'do♯', 'si♭', 'aucune'], 'Mi → fa ne fait qu’un demi-ton ; le modèle demande un ton à cet endroit : fa♯.'],
  ['Dans la gamme de fa majeur, quelle note est altérée ?', ['si♭', 'mi♭', 'fa♯', 'do♯'], 'La → si ferait un ton ; le modèle demande un demi-ton (degrés 3–4) : si♭.'],
  ['Pourquoi écrit-on fa♯ (et non sol♭) dans la gamme de sol majeur ?', ['parce que chaque nom de note apparaît une fois : après mi vient fa', 'parce qu’on préfère toujours les dièses', 'parce que fa♯ est plus aigu que sol♭', 'parce que sol♭ n’existe pas'], 'Sol♭ donnerait deux sol et aucun fa.'],
  ['Quelles sont les notes de ré majeur ?', ['ré mi fa♯ sol la si do♯ ré', 'ré mi fa sol la si do ré', 'ré mi fa♯ sol♯ la si do♯ ré', 'ré mi♭ fa sol la si♭ do ré'], 'Deux altérations : fa♯ (après mi, il faut un ton) et do♯ (la sensible, un demi-ton sous ré).'],
] })}
${W.build({ title: 'À toi : construis au clavier', tasks: [
  { kind: 'scale', tonic: 'ré3', mode: 'maj', guide: 'full' },
  { kind: 'scale', tonic: 'si♭2', mode: 'maj', guide: 'half' },
  { kind: 'scale', tonic: 'la2', mode: 'maj', guide: 'none' },
] })}
<p class="small">Avec « Note suivante », l’appli te donne le pas à faire ; ensuite, seulement le nom ; à la fin, rien : tu appliques la méthode seul. Une erreur ? Les touches comptées s’affichent en rouge, et après deux essais la bonne touche est marquée d’un « ? ».</p>

<h2>Les degrés : un numéro, un nom</h2>
${idea('Chaque note de la gamme a un <b>numéro</b>, son degré (1 à 7), et un <b>nom</b> qui dit son rôle. Quatre noms suffisent à retrouver tous les autres.')}
<table>
<thead><tr><th class="num">Degré</th><th>Nom</th><th>En do</th><th>Pour t’en souvenir</th></tr></thead>
<tbody>
<tr><td class="num"><b>1</b></td><td><b>tonique</b></td><td>do</td><td>la note « maison », qui donne son nom à la gamme</td></tr>
<tr><td class="num">2</td><td>sus-tonique</td><td>ré</td><td><i>sus</i> = au-dessus : juste au-dessus de la tonique</td></tr>
<tr><td class="num"><b>3</b></td><td><b>médiante</b></td><td>mi</td><td>au milieu, entre la tonique et la dominante</td></tr>
<tr><td class="num">4</td><td>sous-dominante</td><td>fa</td><td><i>sous</i> : juste sous la dominante</td></tr>
<tr><td class="num"><b>5</b></td><td><b>dominante</b></td><td>sol</td><td>le second pilier : elle « domine » et appelle le retour à la tonique</td></tr>
<tr><td class="num">6</td><td>sus-dominante</td><td>la</td><td>juste au-dessus de la dominante</td></tr>
<tr><td class="num"><b>7</b></td><td><b>sensible</b></td><td>si</td><td>un demi-ton sous la tonique : « sensible » à son attraction</td></tr>
</tbody></table>
<p>Retiens <b>tonique (1), médiante (3), dominante (5), sensible (7)</b>. Les trois autres se déduisent : <i>sus-</i> veut dire « juste au-dessus », <i>sous-</i> « juste au-dessous ».</p>
${worked('Exemple résolu : la dominante de ré majeur', method(['Écris la gamme : ré, mi, fa♯, sol, la, si, do♯.', 'Compte jusqu’au degré demandé : la dominante est le 5<sup>e</sup>, donc ré (1), mi (2), fa♯ (3), sol (4), <b>la (5)</b>.']), 'La dominante de ré majeur est la. Sa sensible (7<sup>e</sup>) est do♯.')}
${W.notion({ id: 'degres-noms', title: 'Le nom des degrés', short: '1 tonique, 3 médiante, 5 dominante, 7 sensible ; 4 sous-dominante, 2 et 6 « sus- »', text: '<p><b>1 tonique · 2 sus-tonique · 3 médiante · 4 sous-dominante · 5 dominante · 6 sus-dominante · 7 sensible.</b></p><p><i>Sus-</i> = juste au-dessus ; <i>sous-</i> = juste au-dessous.</p>', cards: [
  { id: 'fact:n1-th-gamme:1', q: 'Comment s’appelle le 5e degré ?', a: ['la dominante', 'la sous-dominante', 'la sus-dominante', 'la médiante'], why: 'Tonique, sus-tonique, médiante, sous-dominante, dominante, sus-dominante, sensible.' },
  { id: 'fact:n1-th-gamme:3', q: 'Comment s’appelle le 4e degré ?', a: ['la sous-dominante', 'la dominante', 'la médiante', 'la sus-tonique'], why: '« Sous-dominante » : juste sous la dominante.' },
  ['Comment s’appelle le 3e degré ?', ['la médiante', 'la sus-tonique', 'la sous-dominante', 'la sensible'], 'Au milieu, entre la tonique (1) et la dominante (5).'],
  ['Comment s’appelle le 6e degré ?', ['la sus-dominante', 'la sous-dominante', 'la médiante', 'la sensible'], '« Sus- » : juste au-dessus de la dominante.'],
  ['Comment s’appelle le 2e degré ?', ['la sus-tonique', 'la sous-dominante', 'la médiante', 'la sus-dominante'], 'Juste au-dessus de la tonique.'],
  { id: 'quiz:n1-th-gamme:kdeg', quiz: { kind: 'keydegree', keys: ['C', 'G', 'F', 'D', 'Bb'], degrees: [3, 4, 5, 7], title: 'Les degrés d’une gamme majeure' } },
] })}
${W.check({ questions: [
  { q: 'Quelle est la <b>dominante</b> de sol majeur ?', options: ['ré', 'do', 'si', 'fa♯'], why: 'Sol (1), la (2), si (3), do (4), <b>ré (5)</b>.' },
  { q: 'Quelle est la <b>sous-dominante</b> de fa majeur ?', options: ['si♭', 'do', 'la', 'si'], why: 'Fa (1), sol (2), la (3), <b>si♭ (4)</b> : n’oublie pas le bémol de la gamme.' },
  { q: 'Quelle est la <b>médiante</b> de ré majeur ?', options: ['fa♯', 'fa', 'mi', 'sol'], why: 'Ré (1), mi (2), <b>fa♯ (3)</b>.' },
] })}
${W.quiz({ kind: 'keydegree', keys: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'], title: 'Entraînement : les degrés d’une gamme majeure', count: 10, stat: 'kdeg' })}

<h2>La sensible : le demi-ton qui appelle la tonique</h2>
${idea('La <b>sensible</b> est un demi-ton sous la tonique. Ce demi-ton crée une attente : on veut entendre la tonique juste après. C’est pour le garder que la gamme majeure finit par un demi-ton.')}
${W.ecoute({ title: 'La sensible : écoute ce qu’elle fait', bpm: 84, items: [
  { label: 'Avec la sensible (si → do)', seq: 'sol3 | la3 | si3 | do4:3', note: 'Si, à un demi-ton de do, « tire » vers lui : l’arrivée paraît inévitable.' },
  { label: 'Sans sensible (si♭ → do)', seq: 'sol3 | la3 | sib3 | do4:3', note: 'Un ton entier : l’arrivée perd sa force. On attend moins do.' },
  { label: 'Sensible seule, sans résolution', seq: 'do4 | si3 | la3 | si3:3', note: 'Arrêté sur si : l’oreille réclame do. Chante-le !' },
] })}
${W.notion({ id: 'sensible', title: 'La sensible', short: '7e degré, un demi-ton sous la tonique ; elle monte vers elle', text: '<p>Le <b>7<sup>e</sup> degré</b>, à <b>un demi-ton sous la tonique</b>. Elle attire vers la tonique : dans une mélodie comme dans les accords, elle monte d’un demi-ton pour s’y résoudre.</p><p>À un ton de la tonique, le 7<sup>e</sup> degré n’est plus une sensible (on le retrouvera en mineur).</p>', cards: [
  { id: 'fact:n1-th-gamme:2', q: 'Comment s’appelle le 7e degré, à un demi-ton de la tonique ?', a: ['la sensible', 'la sus-tonique', 'la sous-dominante', 'la médiante'], why: 'À un ton de la tonique, ce n’est plus une sensible.' },
  ['Quelle est la sensible de ré majeur ?', ['do♯', 'do', 'si', 'ré♭'], 'Un demi-ton sous ré : do♯ (le nom do, pas ré♭ : chaque nom une fois).'],
  ['Quelle est la sensible de fa majeur ?', ['mi', 'mi♭', 'fa♯', 'sol'], 'Mi est déjà à un demi-ton sous fa : pas d’altération.'],
  ['Où va naturellement la sensible ?', ['elle monte d’un demi-ton vers la tonique', 'elle descend vers la dominante', 'elle reste en place', 'elle saute à la tierce'], 'C’est son attraction vers la tonique qui rend les fins de phrase si nettes.'],
] })}
${W.check({ questions: [
  { q: 'Quelle est la sensible de sol majeur ?', options: ['fa♯', 'fa', 'sol♭', 'mi'], why: 'Un demi-ton sous sol, sur le nom fa : fa♯. C’est l’altération de la gamme.' },
  { q: 'Quelle est la sensible de la♭ majeur ?', options: ['sol', 'sol♭', 'la', 'fa'], why: 'Un demi-ton sous la♭ : sol (sans altération).' },
] })}

<h2>Dans ta pièce : la♭ majeur (mesures 17 à 20)</h2>
${idea('La phrase b quitte un moment fa mineur pour <b>la♭ majeur</b>. Construis sa gamme, puis retrouve ses degrés dans la mélodie : ils expliquent où elle se pose.')}
${W.build({ title: 'Construis la gamme de la♭ majeur', tasks: [{ kind: 'scale', tonic: 'la♭2', mode: 'maj', guide: 'half' }] })}
<p>Quatre bémols : si♭, mi♭, la♭, ré♭ — exactement l’armure de ton nocturne (leçon suivante). L’accord de mi♭ 7 (mesure 17) est la dominante de la♭ ; la mélodie monte vers <b>do, la médiante</b>, qui se pose au début de la mesure 18.</p>
${W.spot({ abc: OP55.e4, title: 'Sur la partition : les degrés de la♭ majeur', tasks: [
  { q: 'Mesure 17 : touche la <b>tonique</b> de la♭ majeur dans la mélodie.', targets: [{ bar: 17, beat: 4, note: 'la♭3', hand: 'rh' }], why: 'Le la♭ du 4<sup>e</sup> temps : la tonique, juste avant si♭ et l’arrivée sur do.' },
  { q: 'Mesure 18 : touche la <b>médiante</b> (3<sup>e</sup> degré) sur laquelle la mélodie arrive.', targets: [{ bar: 18, beat: 1, note: 'do4', hand: 'rh' }], why: 'Do, la médiante de la♭ majeur, posée sur l’accord de la♭ : une arrivée lumineuse.' },
  { q: 'Mesure 17 : touche la note de la mélodie qui <b>n’appartient pas</b> à la gamme de la♭ majeur.', targets: [{ bar: 17, beat: 2, note: 'ré3', hand: 'rh' }], why: 'Ré♮ : la gamme de la♭ a ré♭. Ce ré♮ frôle mi♭ par en dessous, un demi-ton plus bas : une broderie (leçon « Les notes étrangères »).' },
] })}
${W.score({ abc: OP55.e4, title: 'Mesures 17 à 20, à écouter', bpm: 56, startBpm: 46 })}
<h3>Pour t’entraîner</h3>
${W.quiz({ kind: 'playscale', keys: ['C', 'G', 'F', 'D', 'Ab'], title: 'Au piano : jouer la gamme demandée, sans aide', count: 5, stat: 'pscale' })}
`,
  },

  {
    id: 'n1-th-armures', minutes: 25, steps: true,
    title: 'Armures et tonalités',
    summary: 'L’armure, au début de chaque ligne, rassemble les altérations de la gamme. Deux règles pour la lire, une pour l’écrire, et la relative mineure qui la partage ; le cycle des quintes range le tout.',
    goals: ['Réciter l’ordre des dièses et l’ordre des bémols.', 'Trouver la tonalité majeure d’une armure, et l’armure d’une tonalité.', 'Trouver la relative mineure, qui a la même armure.'],
    goal: 'tu donnes l’armure d’une tonalité jusqu’à quatre altérations en moins de cinq secondes, et tu réussis 8 questions sur 10 à « Armures : tonalités majeures ».',
    body: W => `
<p>Leçon précédente : sol majeur a toujours un fa♯, ré majeur un fa♯ et un do♯. Plutôt que d’écrire ces altérations devant chaque note, on les écrit une fois, au début de chaque ligne : c’est l’<b>armure</b>. Cette leçon t’apprend à la lire d’un coup d’œil, puis à l’écrire.</p>

<h2>L’armure : les altérations de la gamme, une fois pour toutes</h2>
${idea('L’armure, ce sont les altérations de la gamme, écrites juste après la clé. Elles valent pour <b>toutes les notes de ce nom</b>, à toutes les octaves, pendant toute la pièce.')}
${W.staff({ abc: `X:1\nL:1/4\nK:C\n"^sans armure : un ♯ devant chaque fa"G A B c d e ^f g |]`, title: 'Sol majeur, deux écritures', width: 460 })}
${W.staff({ abc: `X:1\nL:1/4\nK:G\n"^avec armure : le ♯ sur la ligne du fa, une fois"G A B c d e f g |]`, width: 460, caption: 'Même musique : le dièse de l’armure (sur la 5<sup>e</sup> ligne, celle du fa) transforme tous les fa en fa♯, à toutes les octaves.' })}
${W.check({ questions: [
  { q: 'L’armure a un fa♯. Tu lis un fa sans altération, deux octaves plus bas que la ligne du dièse. Tu joues…', options: ['fa♯ : l’armure vaut à toutes les octaves', 'fa : le dièse ne vaut que sur sa ligne'], why: 'L’armure vaut pour toutes les notes de ce nom, quelle que soit l’octave.' },
  { q: 'Et une altération écrite devant une note, au milieu d’un morceau (accidentelle) ?', options: ['elle vaut jusqu’à la fin de la mesure', 'elle vaut jusqu’à la fin de la ligne', 'elle vaut pour toute la pièce'], why: 'L’armure : toute la pièce. L’accidentelle : jusqu’à la barre de mesure suivante.' },
] })}

<h2>L’ordre des dièses et des bémols</h2>
${idea('Les altérations entrent toujours dans le même ordre. <b>Dièses : fa, do, sol, ré, la, mi, si.</b> <b>Bémols : le même ordre, à l’envers</b> : si, mi, la, ré, sol, do, fa.')}
${W.staff({ abc: `X:1\nL:1/4\nK:C\n"_1"^f "_2"^c "_3"^g "_4"^d "_5"^A "_6"^e "_7"^B |]`, title: 'Les dièses, dans l’ordre où ils entrent dans l’armure', width: 460, caption: 'Fa♯, do♯, sol♯, ré♯, la♯, mi♯, si♯ : chaque nouveau dièse est une quinte au-dessus du précédent (fa → do → sol…).' })}
${W.staff({ abc: `X:1\nL:1/4\nK:C\n"_1"_B "_2"_e "_3"_A "_4"_d "_5"_G "_6"_c "_7"_F |]`, title: 'Les bémols, dans l’ordre', width: 460, caption: 'Si♭, mi♭, la♭, ré♭, sol♭, do♭, fa♭ : l’ordre des dièses lu à l’envers.' })}
<p>Pour les retenir, coupe-les en deux, comme un numéro de téléphone : <b>« fa do sol ré · la mi si »</b>. Les bémols se lisent à l’envers : <b>« si mi la ré · sol do fa »</b>. Dis-les à voix haute trois fois : en une minute, c’est fait pour toujours.</p>
${W.notion({ id: 'ordre-alterations', title: 'L’ordre des dièses et des bémols', short: 'fa do sol ré la mi si ; à l’envers pour les bémols', text: '<p><b>Dièses : fa, do, sol, ré · la, mi, si.</b><br><b>Bémols : si, mi, la, ré · sol, do, fa.</b></p><p>Une armure de trois dièses contient toujours les trois premiers : fa♯, do♯, sol♯.</p>', cards: [
  { id: 'fact:n1-th-armures:0', q: 'Dans quel ordre s’écrivent les dièses ?', a: ['fa do sol ré la mi si', 'si mi la ré sol do fa', 'do sol ré la mi si fa', 'fa sol la si do ré mi'], why: 'Chaque dièse est une quinte au-dessus du précédent.' },
  { id: 'fact:n1-th-armures:1', q: 'Dans quel ordre s’écrivent les bémols ?', a: ['si mi la ré sol do fa', 'fa do sol ré la mi si', 'si la sol fa mi ré do', 'mi la ré sol do fa si'], why: 'L’ordre des dièses lu à l’envers.' },
  ['Quel est le 3e dièse ?', ['sol♯', 'ré♯', 'do♯', 'la♯'], 'Fa♯, do♯, sol♯.'],
  ['Quel est le 4e bémol ?', ['ré♭', 'la♭', 'sol♭', 'do♭'], 'Si♭, mi♭, la♭, ré♭.'],
  ['Une armure de trois bémols contient…', ['si♭, mi♭, la♭', 'si♭, mi♭, ré♭', 'mi♭, la♭, ré♭', 'la♭, ré♭, sol♭'], 'Toujours les premiers de l’ordre : si♭, mi♭, la♭.'],
] })}
${W.check({ questions: [
  { q: 'Quel est le <b>2<sup>e</sup> dièse</b> ?', options: ['do♯', 'sol♯', 'ré♯', 'la♯'], why: 'Fa♯, <b>do♯</b>, sol♯…' },
  { q: 'Quel est le <b>3<sup>e</sup> bémol</b> ?', options: ['la♭', 'mi♭', 'ré♭', 'sol♭'], why: 'Si♭, mi♭, <b>la♭</b>, ré♭…' },
  { q: 'Une armure de <b>quatre dièses</b> contient…', options: ['fa♯, do♯, sol♯, ré♯', 'fa♯, do♯, ré♯, la♯', 'do♯, sol♯, ré♯, la♯', 'fa♯, sol♯, la♯, si♯'], why: 'Toujours les quatre premiers de l’ordre : fa, do, sol, ré.' },
] })}

<h2>Lire une armure : quelle tonalité majeure ?</h2>
${idea('Deux règles. <b>Avec des dièses</b> : le dernier dièse est la sensible ; la tonique est juste au-dessus, un demi-ton plus haut. <b>Avec des bémols</b> : l’avant-dernier bémol est la tonique.')}
${worked('Exemple résolu : trois dièses', method(['Les dièses, dans l’ordre : fa♯, do♯, <b>sol♯</b>. Le dernier est sol♯.', 'Un demi-ton au-dessus de sol♯ (sur le clavier, la touche juste à droite) : <b>la</b>.']), 'Trois dièses : la majeur. Vérifie : la gamme de la majeur a bien fa♯, do♯ et sol♯.')}
${worked('Exemple résolu : quatre bémols', method(['Les bémols, dans l’ordre : si♭, mi♭, <b>la♭</b>, ré♭.', 'L’avant-dernier est la♭.']), 'Quatre bémols : la♭ majeur — l’armure de ton nocturne (on verra plus bas pourquoi c’est aussi fa mineur).')}
<p>Deux cas à apprendre par cœur, car les règles ne s’y appliquent pas : <b>aucune altération = do majeur</b> ; <b>un seul bémol = fa majeur</b> (il n’y a pas d’avant-dernier).</p>
${trap('la tonique est un demi-ton <b>au-dessus</b> du dernier dièse, pas le dernier dièse lui-même. Deux dièses (fa♯, do♯) : ré majeur, pas do♯ majeur.')}
${W.notion({ id: 'lire-armure', title: 'Lire une armure', short: 'dernier dièse + ½ ton ; avant-dernier bémol ; 0 = do, 1 ♭ = fa', text: '<ul><li><b>Dièses</b> : le dernier dièse est la sensible ; la tonique majeure est un demi-ton au-dessus.</li><li><b>Bémols</b> : l’avant-dernier bémol est la tonique majeure.</li><li>Aucune altération : do majeur. Un bémol : fa majeur.</li></ul>', cards: [
  ['Avec des dièses à l’armure, où est la tonique majeure ?', ['un demi-ton au-dessus du dernier dièse', 'sur le dernier dièse', 'sur l’avant-dernier dièse', 'un ton au-dessus du dernier dièse'], 'Le dernier dièse est la sensible : la tonique est juste au-dessus.'],
  ['Avec des bémols à l’armure, où est la tonique majeure ?', ['sur l’avant-dernier bémol', 'sur le dernier bémol', 'un demi-ton au-dessus du dernier bémol', 'sur le premier bémol'], 'Si♭ mi♭ la♭ : l’avant-dernier, mi♭ → mi♭ majeur.'],
  ['Deux dièses à l’armure : quelle tonalité majeure ?', ['ré majeur', 'do♯ majeur', 'sol majeur', 'la majeur'], 'Fa♯, do♯ : un demi-ton au-dessus de do♯ → ré.'],
  ['Un bémol à l’armure : quelle tonalité majeure ?', ['fa majeur', 'si♭ majeur', 'do majeur', 'mi♭ majeur'], 'Le cas à connaître par cœur : un bémol (si♭), fa majeur.'],
  { id: 'quiz:n1-th-armures:ks-maj', quiz: { kind: 'keysig', keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'], title: 'Armures : tonalités majeures' } },
] })}
${W.check({ questions: [
  { q: 'Armure : fa♯, do♯. Le dernier dièse est…', options: ['do♯', 'fa♯'], why: 'L’ordre est fa, puis do : le dernier est do♯.' },
  { q: '… donc la tonalité majeure est…', options: ['ré majeur', 'do♯ majeur', 'do majeur', 'mi majeur'], why: 'Un demi-ton au-dessus de do♯ : ré.' },
  { q: 'Armure : si♭, mi♭, la♭. La tonalité majeure est…', options: ['mi♭ majeur', 'la♭ majeur', 'si♭ majeur', 'ré♭ majeur'], why: 'L’avant-dernier bémol : mi♭.' },
  { q: 'Armure : un seul bémol. La tonalité majeure est…', options: ['fa majeur', 'si♭ majeur', 'mi♭ majeur'], why: 'Le cas à connaître par cœur : fa majeur.' },
] })}
${W.quiz({ kind: 'keysig', keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'], title: 'Entraînement : armures des tonalités majeures', count: 10, stat: 'ks-maj' })}

<h2>L’inverse : écrire l’armure d’une tonalité</h2>
${idea('D’abord, dièses ou bémols ? Les tonalités dont le nom porte un bémol (si♭, mi♭, la♭, ré♭) ont des bémols, et fa majeur aussi. Les autres ont des dièses (sauf do). Ensuite, on avance dans l’ordre jusqu’au bon endroit.')}
${worked('Exemple résolu : ré majeur (dièses)', method(['La sensible de ré est <b>do♯</b> (un demi-ton sous ré).', 'Avance dans l’ordre des dièses jusqu’à elle : fa♯, <b>do♯</b>.']), 'Ré majeur : deux dièses, fa♯ et do♯.')}
${worked('Exemple résolu : mi♭ majeur (bémols)', method(['Avance dans l’ordre des bémols jusqu’au nom de la tonique : si♭, <b>mi♭</b>.', 'Ajoute <b>un bémol de plus</b> : la♭ (la tonique doit être l’avant-dernier).']), 'Mi♭ majeur : trois bémols, si♭, mi♭ et la♭.')}
${W.notion({ id: 'ecrire-armure', title: 'Écrire l’armure d’une tonalité', short: 'dièses : jusqu’à la sensible ; bémols : jusqu’à la tonique, plus un', text: '<ul><li><b>Dièses</b> : avance dans l’ordre jusqu’à la sensible (un demi-ton sous la tonique). La majeur → sol♯ → fa♯, do♯, sol♯.</li><li><b>Bémols</b> : avance jusqu’à la tonique, puis ajoute un bémol. La♭ majeur → si♭, mi♭, la♭ + ré♭.</li><li>Un nom avec ♭, ou fa : des bémols. Sinon (sauf do) : des dièses.</li></ul>', cards: [
  ['Quelle est l’armure de la majeur ?', ['3 dièses : fa♯, do♯, sol♯', '2 dièses : fa♯, do♯', '4 dièses : fa♯, do♯, sol♯, ré♯', '3 bémols : si♭, mi♭, la♭'], 'La sensible de la est sol♯ : on avance jusqu’à elle.'],
  ['Quelle est l’armure de si♭ majeur ?', ['2 bémols : si♭, mi♭', '1 bémol : si♭', '3 bémols : si♭, mi♭, la♭', '2 dièses : fa♯, do♯'], 'Jusqu’à si♭, plus un : si♭, mi♭.'],
  ['Quelle est l’armure de mi majeur ?', ['4 dièses', '3 dièses', '5 dièses', '4 bémols'], 'Sensible ré♯ : fa♯, do♯, sol♯, ré♯.'],
  { quiz: { kind: 'sigcount', keys: ['G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'], title: 'Combien d’altérations à l’armure ?' } },
] })}
${W.check({ questions: [
  { q: 'Quelle est l’armure de <b>sol majeur</b> ?', options: ['1 dièse : fa♯', '1 bémol : si♭', '2 dièses : fa♯, do♯'], why: 'Sensible de sol : fa♯ — le premier dièse.' },
  { q: 'Quelle est l’armure de <b>la♭ majeur</b> ?', options: ['4 bémols : si♭, mi♭, la♭, ré♭', '3 bémols : si♭, mi♭, la♭', '5 bémols : si♭, mi♭, la♭, ré♭, sol♭'], why: 'Jusqu’à la♭ (si♭, mi♭, la♭), plus un : ré♭.' },
  { q: 'Quelle est l’armure de <b>mi majeur</b> ?', options: ['4 dièses', '4 bémols', '3 dièses', '5 dièses'], why: 'Sensible ré♯ : fa♯, do♯, sol♯, ré♯.' },
] })}
${W.quiz({ kind: 'sigcount', keys: ['G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'], title: 'Entraînement : combien d’altérations ?', count: 8, stat: 'sigc' })}

<h2>La relative mineure : même armure, autre tonique</h2>
${idea('Chaque armure sert à <b>deux tonalités</b> : une majeure, et sa <b>relative mineure</b>, trois demi-tons plus bas. Mêmes notes, autre note de repos.')}
${worked('Exemple résolu : la relative de do majeur', method(['Pars de do, et descends de <b>trois demi-tons</b> sur le clavier : si (1), si♭ (2), <b>la (3)</b>.', 'Sa relative est donc la mineur, avec la même armure (aucune altération).']), 'Do majeur et la mineur : les mêmes touches blanches, mais la musique se pose sur la au lieu de do.')}
${worked('Exemple résolu : la relative de la♭ majeur', method(['De la♭, trois demi-tons vers le bas : sol (1), sol♭ (2), <b>fa (3)</b>.', 'La relative de la♭ majeur est fa mineur : quatre bémols elle aussi.']), 'C’est la tonalité de ton nocturne : fa mineur.')}
${W.build({ title: 'À toi : trouve la relative mineure', tasks: [
  { kind: 'interval', from: 'fa3', iv: '3m', dir: 'down', talk: 'semis', prompt: 'Trouve la relative mineure de <b>fa majeur</b> : trois demi-tons sous fa.', doneText: 'Fa majeur → <b>ré mineur</b> : un bémol pour les deux.' },
  { kind: 'interval', from: 'sol3', iv: '3m', dir: 'down', talk: 'semis', prompt: 'La relative mineure de <b>sol majeur</b> ?', doneText: 'Sol majeur → <b>mi mineur</b> : un dièse (fa♯) pour les deux.' },
  { kind: 'interval', from: 'ré3', iv: '3m', dir: 'down', talk: 'semis', prompt: 'La relative mineure de <b>ré majeur</b> ?', doneText: 'Ré majeur → <b>si mineur</b> : deux dièses pour les deux.' },
] })}
${W.notion({ id: 'relative', title: 'La relative mineure', short: 'trois demi-tons sous la tonique majeure, même armure', text: '<p>La <b>relative mineure</b> d’une tonalité majeure est <b>trois demi-tons (une tierce mineure) plus bas</b>. Elles ont la même armure.</p><p>Do majeur – la mineur · sol – mi · fa – ré · la♭ – fa. Pour savoir laquelle des deux est la bonne : regarde la dernière note de la basse et les altérations (la sensible du mineur).</p>', cards: [
  { id: 'fact:n1-th-armures:4', q: 'Où se trouve la relative mineure d’une tonalité majeure ?', a: ['une tierce mineure (3 demi-tons) sous la tonique majeure', 'une quinte au-dessus', 'sur la même tonique', 'un ton au-dessus'], why: 'Do majeur → la mineur : do, si, si♭, la.' },
  { id: 'fact:n1-th-armures:2', q: 'Quatre bémols à l’armure : quelle tonalité ?', a: ['la♭ majeur ou fa mineur', 'mi♭ majeur ou do mineur', 'ré♭ majeur ou si♭ mineur', 'fa majeur ou ré mineur'], why: 'Bémols : la tonique majeure est l’avant-dernier (la♭) ; sa relative mineure est trois demi-tons plus bas (fa).' },
  { id: 'fact:n1-th-armures:3', q: 'Trois dièses à l’armure : quelle tonalité ?', a: ['la majeur ou fa♯ mineur', 'mi majeur ou do♯ mineur', 'ré majeur ou si mineur', 'sol majeur ou mi mineur'], why: 'Dernier dièse sol♯ → la majeur ; trois demi-tons plus bas : fa♯ mineur.' },
  ['Quelle est la relative mineure de fa majeur ?', ['ré mineur', 'fa mineur', 'la mineur', 'do mineur'], 'Trois demi-tons sous fa : ré.'],
  { quiz: { kind: 'relative', keys: ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb', 'Ab'], title: 'Relatives' } },
  { id: 'quiz:n1-th-armures:ks-min', quiz: { kind: 'keysig', minor: true, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'], title: 'Armures : tonalités mineures' } },
] })}
${W.quiz({ kind: 'keysig', minor: true, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'], title: 'Entraînement : armures des tonalités mineures', count: 10, stat: 'ks-min' })}

<h2>Le cycle des quintes : la carte des tonalités</h2>
${idea('Range les tonalités de quinte en quinte : à chaque pas vers la droite, <b>un dièse de plus</b> ; vers la gauche, <b>un bémol de plus</b>. Entre deux voisines, <b>une seule note change</b>.')}
<p>De do majeur à sol majeur (une quinte plus haut), une seule note change : fa devient fa♯, la nouvelle sensible. De sol à ré : do devient do♯. C’est pour cela que les dièses entrent dans l’ordre fa, do, sol, ré… : chacun est la sensible de la tonalité suivante sur le cycle. Essaie : touche une tonalité, puis « Une quinte plus haut » ; la note qui change s’allume en or.</p>
${W.cof({ start: 0, minor: false })}
<p>Deux tonalités voisines ont donc six notes sur sept en commun : la musique passe facilement de l’une à l’autre (on dit qu’elle <b>module</b>). Un saut à l’autre bout du cycle change presque tout, et l’oreille le sent :</p>
${W.ecoute({ title: 'Une cadence en do, puis…', bpm: 92, items: [
  { label: '… en sol majeur (voisine)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | do2 mi3 sol3 do4:2 | z | sol1 si2 ré3 sol3 | do2 do3 mi3 sol3 | ré2 do3 fa#3 la3 | sol1 si2 ré3 sol3:2', note: 'Un pas sur le cycle : une seule note nouvelle (fa♯). Le changement est doux.' },
  { label: '… en la mineur (relative)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | do2 mi3 sol3 do4:2 | z | la1 do3 mi3 la3 | ré2 ré3 fa3 la3 | mi2 ré3 sol#3 si3 | la1 do3 mi3 la3:2', note: 'La même armure, une autre note de repos : la couleur s’assombrit.' },
  { label: '… en fa♯ majeur (à l’opposé)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | do2 mi3 sol3 do4:2 | z | fa#2 la#3 do#4 fa#4 | si2 si3 ré#4 fa#4 | do#2 si3 mi#4 sol#4 | fa#2 la#3 do#4 fa#4:2', note: 'Six pas plus loin : presque toutes les notes changent. L’oreille est projetée ailleurs.' },
] })}
${W.notion({ id: 'cycle-quintes', title: 'Le cycle des quintes', short: 'une quinte plus haut = un dièse de plus ; une seule note change', text: '<p>Do → sol → ré → la → mi… : <b>un dièse de plus</b> à chaque quinte vers le haut (la nouvelle sensible). Do → fa → si♭ → mi♭ → la♭… : <b>un bémol de plus</b> à chaque quinte vers le bas.</p><p>Deux tonalités voisines ne diffèrent que d’<b>une note</b> : c’est vers elles que la musique module le plus naturellement.</p>', cards: [
  ['Combien de notes changent entre deux tonalités voisines sur le cycle des quintes ?', ['une seule', 'deux', 'trois', 'toutes'], 'Do → sol majeur : seul fa devient fa♯.'],
  ['De do majeur à sol majeur, quelle note change ?', ['fa devient fa♯', 'si devient si♭', 'do devient do♯', 'sol devient sol♯'], 'Fa♯, la sensible de sol : le premier dièse.'],
  ['De do majeur à fa majeur, quelle note change ?', ['si devient si♭', 'fa devient fa♯', 'mi devient mi♭', 'la devient la♭'], 'Une quinte plus bas : un bémol de plus, si♭.'],
] })}
${W.more('Chopin et le cycle : les 24 Préludes', `<p>Chopin a rangé ses <b>24 Préludes op. 28</b> en suivant le cycle des quintes, chaque majeur suivi de sa relative mineure : do majeur, la mineur, sol majeur, <b>mi mineur (le n° 4, celui que tu étudies en improvisation)</b>, ré majeur, si mineur… Écouter le recueil dans l’ordre, c’est faire le tour du cycle.</p>`)}
${W.listen([W.yt('Chopin 24 Preludes op 28 complete', 'Les 24 Préludes op. 28, dans l’ordre', 'Suis le cycle : do, la m, sol, mi m, ré, si m…')], 'Écouter')}

<h2>Dans ta pièce : fa mineur et ses voisines (mesures 17 à 24)</h2>
${idea('Ton nocturne a <b>quatre bémols</b> : la♭ majeur ou fa mineur ? Les indices tranchent : la pièce finit sur fa, et le <b>mi♮</b> (la sensible de fa) revient sans cesse. C’est fa mineur. La phrase b visite deux voisines, et chaque visite s’annonce par une altération.')}
${W.check({ questions: [
  { q: 'Quatre bémols à l’armure, une pièce qui finit sur un accord de fa, des mi♮ partout : quelle tonalité ?', options: ['fa mineur', 'la♭ majeur', 'mi♭ majeur', 'fa majeur'], why: 'Même armure que la♭ majeur, mais la note de repos est fa, et mi♮ est la sensible de fa (leçon suivante).' },
] })}
${W.spot({ abc: OP55.e4, title: 'Sur la partition : les panneaux indicateurs', tasks: [
  { q: 'Mesure 20 : touche le <b>mi♮</b> de la mélodie, la sensible de fa.', targets: [{ bar: 20, beat: 1, note: 'mi4', hand: 'rh' }], why: 'Ce mi♮ annule le mi♭ de l’armure : la sensible de fa, qui ramène vers fa mineur.' },
  { q: 'Mesure 18 : touche le <b>ré♮</b> de la main gauche.', targets: [{ bar: 18, beat: 4, note: 'ré2', hand: 'lh' }], why: 'Un bémol de moins (ré♭ → ré♮) : on passe vers do mineur, trois bémols, la tonalité voisine de fa mineur.' },
  { q: 'Mesure 19 : touche le <b>si♮</b> de la main gauche (dernier temps).', targets: [{ bar: 19, beat: 4, note: 'si2', hand: 'lh' }], why: 'Si♮ est la sensible de do : la phrase se tourne un instant vers do mineur.' },
] })}
<table>
<thead><tr><th>Pièce</th><th>Tonalité</th><th>Armure</th></tr></thead>
<tbody>
<tr><td>Nocturne op. 55 n° 1</td><td>fa mineur (coda en fa majeur)</td><td>4 bémols</td></tr>
<tr><td>Valse en la mineur B. 150</td><td>la mineur</td><td>aucune</td></tr>
<tr><td>Romance S. 169</td><td>mi mineur</td><td>1 dièse</td></tr>
<tr><td>Nocturne op. 15 n° 1 (niveau 2)</td><td>fa majeur, partie centrale en fa mineur</td><td>1 bémol, puis 4</td></tr>
<tr><td>Clair de lune (niveau 2)</td><td>ré♭ majeur</td><td>5 bémols</td></tr>
</tbody></table>
${W.links([W.informance('/content/pages/20-a-crash-course-in-music-theory', 'A Crash Course in Music Theory')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-th-mineur', minutes: 25, steps: true,
    title: 'Les gammes mineures',
    summary: 'Une gamme mineure part de l’armure de sa relative majeure. Puis on hausse la 7e note pour retrouver une sensible : c’est la forme harmonique, celle qu’on entend presque partout.',
    goals: ['Construire la mineure naturelle à partir de la relative majeure.', 'Construire la mineure harmonique (7e degré haussé) sur n’importe quelle note.', 'Reconnaître une sensible accidentelle dans une partition, et la tonalité qu’elle annonce.'],
    goal: 'tu construis sans faute les gammes de ré, do et sol mineur harmonique, et tu nommes la tonalité annoncée par un fa♯, un si♮ ou un mi♮.',
    body: W => `
<p>Leçon précédente : chaque armure sert à deux tonalités, une majeure et sa relative mineure. Ici, tu construis la gamme de cette relative mineure. Une seule nouveauté vraiment importante : la 7<sup>e</sup> note, qu’on hausse pour retrouver une sensible.</p>

<h2>Le mineur naturel : les notes de la relative</h2>
${idea('La mineur, c’est do majeur qui commence sur la : <b>mêmes notes, même armure</b>, mais la tonique est la. L’escalier n’est plus le même : <b>ton, demi-ton, ton, ton, demi-ton, ton, ton</b>.')}
${W.kbd({ from: 57, to: 69, title: 'La mineur naturelle : les touches blanches, de la à la', marks: [57, 59, 60, 62, 64, 65, 67, 69].map(m => ({ m })), names: 'marks', play: 'seq', caption: 'Les demi-tons (si – do, mi – fa) tombent maintenant entre les degrés 2–3 et 5–6.' })}
${steps7(['la → si', 'si → do', 'do → ré', 'ré → mi', 'mi → fa', 'fa → sol', 'sol → la'], ['T', '<b>½</b>', 'T', 'T', '<b>½</b>', 'T', 'T'])}
${W.ecoute({ title: 'Les mêmes notes, deux tonalités', bpm: 132, items: [
  { label: 'Do majeur', seq: 'do3 | ré3 | mi3 | fa3 | sol3 | la3 | si3 | do4:2', note: 'Le repos sur do : clair.' },
  { label: 'La mineur naturelle', seq: 'la2 | si2 | do3 | ré3 | mi3 | fa3 | sol3 | la3:2', note: 'Mêmes touches, repos sur la : plus sombre. La tierce la – do (trois demi-tons) fait le mineur.' },
] })}
${W.notion({ id: 'mineur-naturel', title: 'La gamme mineure naturelle', short: 'les notes de la relative majeure, depuis la tonique mineure : T ½ T T ½ T T', text: '<p>Les notes de l’armure, depuis la tonique mineure : <b>T – ½ – T – T – ½ – T – T</b>.</p><p>La mineur = les touches blanches de la à la. Sa tierce (la – do, trois demi-tons) lui donne sa couleur mineure.</p>', cards: [
  ['Quel est le modèle de la gamme mineure naturelle ?', ['T – ½ – T – T – ½ – T – T', 'T – T – ½ – T – T – T – ½', 'T – ½ – T – T – ½ – T½ – ½', '½ – T – T – ½ – T – T – T'], 'En la : la si (T) do (½) ré (T) mi (T) fa (½) sol (T) la (T).'],
  ['Quelles notes a la mineur naturelle ?', ['les touches blanches, de la à la', 'la si do♯ ré mi fa♯ sol♯ la', 'la si do ré mi fa sol♯ la', 'la si♭ do ré mi fa sol la'], 'Les notes de do majeur, sa relative, depuis la.'],
] })}
${W.build({ title: 'À toi : construis', tasks: [{ kind: 'scale', tonic: 'la2', mode: 'natMin', guide: 'full' }] })}

<h2>Le problème : pas de sensible</h2>
${idea('En mineur naturel, la 7<sup>e</sup> note est à <b>un ton</b> de la tonique (sol → la). La fin des phrases manque de force. La solution : hausser cette 7<sup>e</sup> note d’un demi-ton. Elle devient une <b>sensible</b>, comme en majeur.')}
${W.ecoute({ title: 'Pourquoi hausser le 7e degré ?', bpm: 72, items: [
  { label: 'Cadence avec sol (mineur naturel)', seq: 'mi2 si2 mi3 sol3:2 | la1 do3 mi3 la3:3', note: 'Mi mineur → la mineur : pas de sensible, la fin est molle, presque une suspension.' },
  { label: 'Cadence avec sol♯ (7e degré haussé)', seq: 'mi2 si2 mi3 sol#3:2 | la1 do3 mi3 la3:3', note: 'Mi majeur → la mineur : sol♯ monte vers la, la fin est nette.' },
] })}
${worked('Exemple résolu : la mineur', method(['Le 7<sup>e</sup> degré de la mineur est <b>sol</b>, un ton sous la.', 'On le hausse d’un demi-ton : <b>sol♯</b>, à un demi-ton de la.', 'Sol♯ s’écrit devant la note, pas à l’armure : l’armure reste celle de do majeur.']), 'La mineur avec sa sensible : la – si – do – ré – mi – fa – sol♯ – la.')}

<h2>La mineure harmonique, sur n’importe quelle note</h2>
${idea('<b>Mineure harmonique = mineure naturelle + 7<sup>e</sup> degré haussé d’un demi-ton.</b> C’est la forme des accords et des cadences : celle que tu entendras presque partout.')}
${method(['Trouve la <b>relative majeure</b>, trois demi-tons au-dessus de la tonique mineure : son armure est la tienne.', 'Écris les sept notes depuis la tonique mineure, avec cette armure.', '<b>Hausse le 7<sup>e</sup> degré</b> d’un demi-ton : un ♭ devient ♮, une note naturelle prend un ♯.'])}
${worked('Exemple résolu : fa mineur (ta pièce)', method(['Trois demi-tons au-dessus de fa : la♭. La relative est la♭ majeur, quatre bémols (si♭, mi♭, la♭, ré♭).', 'Fa, sol, la♭, si♭, do, ré♭, mi♭.', 'Le 7<sup>e</sup> degré est mi♭ : on le hausse, il devient <b>mi♮</b>.']), 'Fa mineur harmonique : fa – sol – la♭ – si♭ – do – ré♭ – mi♮ – fa. Le mi♮ de ton nocturne, c’est elle.')}
${worked('Exemple résolu : ré mineur', method(['Relative : fa majeur, un bémol (si♭).', 'Ré, mi, fa, sol, la, si♭, do.', 'Le 7<sup>e</sup> degré, do, devient <b>do♯</b>.']), 'Ré mineur harmonique : ré – mi – fa – sol – la – si♭ – do♯ – ré.')}
${trap('« hausser » ne veut pas toujours dire « mettre un dièse ». Si le 7<sup>e</sup> degré a un bémol à l’armure, on le hausse avec un <b>bécarre</b> : mi♭ → mi♮ en fa mineur, si♭ → si♮ en do mineur. Et la sensible ne va <b>jamais à l’armure</b> : elle s’écrit devant la note, à chaque fois.')}
${W.kbd({ from: 65, to: 77, title: 'Fa mineur harmonique', marks: [65, 67, 68, 70, 72, 73, 76, 77].map(m => ({ m, color: m === 76 ? '#f2d9a8' : null })), names: 'marks', flats: true, play: 'seq', caption: 'En couleur, la sensible mi♮.' })}
${W.notion({ id: 'mineur-harmonique', title: 'La gamme mineure harmonique', short: 'mineure naturelle + 7e degré haussé (la sensible), en altération accidentelle', text: '<p><b>7<sup>e</sup> degré haussé d’un demi-ton</b> : il devient la sensible. Toujours écrit en altération accidentelle, jamais à l’armure.</p><p>La mineur : sol♯. Ré mineur : do♯. Do mineur : si♮. Fa mineur : mi♮. Sol mineur : fa♯.</p>', cards: [
  { id: 'fact:n1-th-mineur:0', q: 'Qu’est-ce qui distingue la gamme mineure harmonique ?', a: ['son 7e degré est haussé', 'son 6e degré est haussé', 'ses 6e et 7e degrés sont abaissés', 'elle n’a pas de tierce mineure'], why: 'Le 7e degré haussé devient une sensible, à un demi-ton de la tonique.' },
  { id: 'fact:n1-th-mineur:3', q: 'Où s’écrit la sensible d’une tonalité mineure ?', a: ['en altération accidentelle, devant la note', 'à l’armure', 'nulle part : elle est sous-entendue', 'seulement à la fin de la pièce'], why: 'L’armure est celle de la relative majeure ; la sensible s’ajoute à chaque fois.' },
  { id: 'fact:n1-th-mineur:2', q: 'Quelle est la sensible de fa mineur ?', a: ['mi♮', 'mi♭', 'fa♯', 'ré♭'], why: 'Le 7e degré, mi♭ à l’armure, haussé d’un demi-ton : mi♮.' },
  { id: 'fact:n1-th-mineur:4', q: 'Quelle est la sensible de do mineur ?', a: ['si♮', 'si♭', 'do♯', 'la♭'], why: 'Si♭ à l’armure (trois bémols), haussé : si♮.' },
  ['Quelle est la sensible de ré mineur ?', ['do♯', 'do', 'ré♭', 'si♭'], 'Le 7e degré, do, haussé : do♯.'],
  ['Quelle est la sensible de la mineur ?', ['sol♯', 'sol', 'la♭', 'fa♯'], 'Le 7e degré, sol, haussé : sol♯.'],
] })}
${W.build({ title: 'À toi : construis la mineure harmonique', tasks: [
  { kind: 'scale', tonic: 'ré3', mode: 'harmMin', guide: 'half' },
  { kind: 'scale', tonic: 'do3', mode: 'harmMin', guide: 'half' },
  { kind: 'scale', tonic: 'sol2', mode: 'harmMin', guide: 'none' },
] })}

<h2>La seconde augmentée, et la forme mélodique</h2>
${idea('En haussant le 7<sup>e</sup> degré, on crée un grand pas entre le 6<sup>e</sup> et le 7<sup>e</sup> : <b>un ton et demi</b> (une seconde augmentée), très reconnaissable. Pour chanter plus facilement, la forme <b>mélodique</b> hausse aussi le 6<sup>e</sup> degré en montant, et redevient naturelle en descendant.')}
${W.ecoute({ title: 'Le haut de la gamme, en la mineur', bpm: 80, items: [
  { label: 'Harmonique : fa → sol♯', seq: 'mi3 | fa3 | sol#3 | la3:2', note: 'Un ton et demi entre fa et sol♯ : la couleur « orientale » de la mineure harmonique.' },
  { label: 'Mélodique, en montant : fa♯ → sol♯', seq: 'mi3 | fa#3 | sol#3 | la3:2', note: 'Le 6e degré haussé aussi : la mélodie monte sans à-coup vers la tonique.' },
  { label: 'Mélodique, en descendant : sol → fa', seq: 'la3 | sol3 | fa3 | mi3:2', note: 'En descendant, plus besoin de sensible : la forme naturelle revient.' },
] })}
${W.score({ abc: MINOR_SCALES, title: 'La mineur : les trois formes', bpm: 96, hands: false, practice: false })}
${W.notion({ id: 'mineur-melodique', title: 'Seconde augmentée et mineure mélodique', short: 'harmonique : 6–7 = un ton et demi ; mélodique : 6e et 7e haussés en montant, naturelle en descendant', text: '<ul><li><b>Harmonique</b> : entre les degrés 6 et 7, un ton et demi (seconde augmentée) : fa – sol♯ en la mineur.</li><li><b>Mélodique</b> : en montant, 6<sup>e</sup> et 7<sup>e</sup> degrés haussés (fa♯, sol♯) ; en descendant, forme naturelle (sol, fa).</li></ul>', cards: [
  { id: 'fact:n1-th-mineur:1', q: 'La gamme mineure mélodique, en montant :', a: ['6e et 7e degrés haussés', '7e degré haussé seulement', '6e degré abaissé', 'identique à la naturelle'], why: 'En descendant, elle redevient naturelle.' },
  ['Dans la gamme mineure harmonique, quel écart entre les degrés 6 et 7 ?', ['un ton et demi (seconde augmentée)', 'un demi-ton', 'un ton', 'deux tons'], 'En la mineur : fa → sol♯, trois demi-tons.'],
  ['La mineure mélodique, en descendant :', ['reprend la forme naturelle', 'garde les 6e et 7e haussés', 'hausse seulement le 7e degré', 'abaisse la tonique'], 'En descendant, la sensible n’a plus de rôle : sol et fa naturels en la mineur.'],
] })}
${W.check({ questions: [
  { q: 'La mineur harmonique : quelles notes en haut de la gamme ?', options: ['fa – sol♯ – la', 'fa♯ – sol♯ – la', 'fa – sol – la'], why: 'Seul le 7<sup>e</sup> degré est haussé dans la forme harmonique.' },
  { q: 'Do mineur mélodique, en montant : quelles notes pour les degrés 6 et 7 ?', options: ['la♮ et si♮', 'la♭ et si♮', 'la♭ et si♭'], why: 'Do mineur a la♭ et si♭ à l’armure ; la mélodique en montant hausse les deux : la♮, si♮.' },
] })}

<h2>Lire une sensible dans une partition</h2>
${idea('Une altération qui <b>hausse</b> une note (♯, ou ♮ après un ♭) est souvent une sensible. La tonalité qu’elle annonce est <b>un demi-ton au-dessus</b> : fa♯ annonce sol, si♮ annonce do, mi♮ annonce fa.')}
${worked('Exemple résolu : un fa♯ dans un passage en bémols', method(['Fa♯ hausse fa : c’est probablement une sensible.', 'Un demi-ton au-dessus : <b>sol</b>.', 'Vérifie avec l’accord suivant : sol mineur (ou sol majeur) confirme.']), 'Le fa♯ annonce sol mineur.')}
${W.notion({ id: 'sensible-accidentelle', title: 'Une sensible annonce sa tonalité', short: 'altération qui hausse = sensible ; la tonique est un demi-ton au-dessus', text: '<p>Une altération accidentelle qui hausse une note est souvent une <b>sensible</b> : la tonalité visée est <b>un demi-ton au-dessus</b>.</p><p>Fa♯ → sol mineur · si♮ → do mineur · mi♮ → fa mineur · la♮ → si♭ mineur · do♯ → ré mineur.</p>', cards: [
  ['Dans un passage en bémols, un si♮ apparaît. Quelle tonalité annonce-t-il ?', ['do mineur', 'si mineur', 'mi♭ majeur', 'sol mineur'], 'Si♮ est la sensible de do : un demi-ton au-dessus.'],
  ['Un la♮ apparaît dans une pièce à cinq bémols. Il annonce…', ['si♭ mineur', 'la mineur', 'ré♭ majeur', 'fa mineur'], 'La♮ : sensible de si♭.'],
  ['Un do♯ dans une pièce à un bémol annonce…', ['ré mineur', 'do mineur', 'fa majeur', 'la mineur'], 'Do♯ : sensible de ré. Ré mineur, la relative de fa majeur.'],
] })}
${W.check({ questions: [
  { q: 'Passage en fa mineur ; un <b>fa♯</b> apparaît. Tonalité probable ?', options: ['sol mineur', 'fa♯ mineur', 'mi♭ majeur', 'do mineur'], why: 'Fa♯ hausse fa : la sensible de sol.' },
  { q: 'Et un <b>la♮</b> ?', options: ['si♭ mineur', 'la mineur', 'la♭ majeur', 'mi♭ majeur'], why: 'La♮ hausse la♭ : la sensible de si♭.' },
  { q: 'Et un <b>si♮</b> ?', options: ['do mineur', 'si mineur', 'mi♭ majeur'], why: 'Si♮ hausse si♭ : la sensible de do.' },
] })}

<h2>Dans ta pièce : le Più mosso (mesures 48 à 64)</h2>
${idea('Le Più mosso est une <b>marche</b> : la même formule passe par plusieurs tonalités mineures. À chaque étape, la nouvelle sensible apparaît en altération : c’est elle qui te dit où tu es.')}
<ul>
<li><b>Mesures 48-50 : fa mineur</b>, sensible <b>mi♮</b> (dans les triolets d’octaves de la main gauche).</li>
<li><b>Mesures 51-54 : do mineur</b>, sensible <b>si♮</b>.</li>
<li><b>Mesures 55-56 : sol mineur</b>, sensible <b>fa♯</b>.</li>
<li>Puis retour en fa mineur (mesures 57-60, avec mi♮), et <b>si♭ mineur</b> (mesures 61-64), annoncé par le <b>la♮</b>.</li>
</ul>
${W.spot({ abc: OP55.e6, title: 'Sur la partition : les sensibles du Più mosso', tasks: [
  { q: 'Mesure 48 : touche le <b>mi♮</b> des triolets de la main gauche.', targets: [{ bar: 48, beat: 4, note: 'mi', hand: 'lh' }], why: 'Mi♮, la sensible de fa : on est en fa mineur.' },
  { q: 'Mesure 51 : touche la note qui annonce <b>do mineur</b>, à la main gauche.', targets: [{ bar: 51, beat: 4, note: 'si', hand: 'lh' }], why: 'Si♮ : la sensible de do. La formule est passée en do mineur.' },
  { q: 'Mesure 52 : une nouvelle sensible apparaît dans les triolets de la main gauche. Touche-la.', targets: [{ bar: 52, beat: 3, note: 'fa♯', hand: 'lh' }], why: 'Fa♯ : la sensible de sol. La marche se dirige vers sol mineur, qui arrive à la mesure 55.' },
] })}
${W.score({ abc: OP55.e6, title: 'Mesures 48 à 52, à écouter', bpm: 72, startBpm: 52 })}
<h3>Pour t’entraîner</h3>
${W.quiz({ kind: 'playscale', keys: ['Am', 'Dm', 'Cm', 'Fm', 'Gm'], title: 'Au piano : jouer une gamme mineure harmonique', count: 5, stat: 'pscale-min' })}
${W.quiz({ kind: 'scales', title: 'À l’oreille : majeure, naturelle, harmonique ou mélodique ?', count: 10, stat: 'sc' })}
`,
  },

  {
    id: 'n1-th-intervalles', minutes: 25, steps: true,
    title: 'Les intervalles',
    summary: 'Un intervalle, c’est la distance entre deux notes. On le nomme en deux temps : combien de noms de notes (la quantité), puis combien de demi-tons (la qualité). Le clavier fait le calcul pour toi.',
    goals: ['Trouver la quantité d’un intervalle en comptant les noms de notes, ou d’un coup d’œil sur la portée.', 'Trouver sa qualité (majeure, mineure, juste) en comptant les demi-tons.', 'Écrire la note d’arrivée avec le bon nom (fa♯ et non sol♭).'],
    goal: '80 % ou plus à « Sur la portée : quantité et qualité », et tu construis au clavier tierces, quartes et quintes sans erreur.',
    body: W => `
<p>Les intervalles servent partout : lire vite (on lit la distance d’une note à l’autre), construire les accords (des tierces empilées), reconnaître une mélodie à l’oreille. On les nomme toujours en deux temps : d’abord la <b>quantité</b>, puis la <b>qualité</b>.</p>

<h2>La quantité : compter les noms de notes</h2>
${idea('Pour la quantité, on compte les <b>noms de notes</b>, les deux extrémités comprises. Do → mi : do (1), ré (2), mi (3) : <b>une tierce</b>.')}
<table class="grid-notes">
<thead><tr><th>2 noms</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr></thead>
<tbody><tr><td>seconde</td><td>tierce</td><td>quarte</td><td>quinte</td><td>sixte</td><td>septième</td><td>octave</td></tr></tbody>
</table>
${worked('Exemple résolu', `<ul><li>Ré → la : ré, mi, fa, sol, la = 5 noms → <b>quinte</b>.</li><li>Sol → fa (en montant) : sol, la, si, do, ré, mi, fa = 7 noms → <b>septième</b>.</li><li>Mi → fa : mi, fa = 2 noms → <b>seconde</b>.</li></ul>`)}
${trap('on compte les <b>noms</b>, pas les pas entre eux. Do – mi, ce sont trois noms (do, ré, mi) : une tierce, pas une « seconde ». Et les altérations ne changent pas la quantité : do – mi♭ est aussi une tierce.')}
${W.check({ questions: [
  { q: 'Do → sol : quelle quantité ?', options: ['quinte', 'quarte', 'sixte', 'tierce'], why: 'Do, ré, mi, fa, sol : 5 noms.' },
  { q: 'Mi → la : quelle quantité ?', options: ['quarte', 'quinte', 'tierce', 'seconde'], why: 'Mi, fa, sol, la : 4 noms.' },
  { q: 'Fa → ré (en montant) : quelle quantité ?', options: ['sixte', 'tierce', 'septième', 'quinte'], why: 'Fa, sol, la, si, do, ré : 6 noms.' },
  { q: 'Si → do♯ : quelle quantité ?', options: ['seconde', 'tierce', 'unisson'], why: 'Si, do : 2 noms. Le dièse ne change pas la quantité.' },
] })}
${W.notion({ id: 'iv-quantite', title: 'La quantité d’un intervalle', short: 'on compte les noms de notes, les deux extrémités comprises', text: '<p>On compte les <b>noms de notes</b>, extrémités comprises : 2 seconde, 3 tierce, 4 quarte, 5 quinte, 6 sixte, 7 septième, 8 octave.</p><p>Les altérations ne changent pas la quantité.</p>', cards: [
  { id: 'fact:n1-th-intervalles:0', q: 'do – mi, quel intervalle ?', a: ['une tierce', 'une seconde', 'une quarte', 'une quinte'], why: 'On compte les noms de notes : do, ré, mi = 3.' },
  ['ré – la, quelle quantité ?', ['une quinte', 'une quarte', 'une sixte', 'une tierce'], 'Ré, mi, fa, sol, la : 5 noms.'],
  ['sol – fa (en montant), quelle quantité ?', ['une septième', 'une seconde', 'une sixte', 'une octave'], 'Sol, la, si, do, ré, mi, fa : 7 noms.'],
] })}

<h2>Sur la portée : ligne ou interligne ?</h2>
${idea('Sur la portée, regarde seulement la <b>position</b> des deux notes. Deux lignes (ou deux interlignes) : 3, 5 ou 7. Une ligne et un interligne : 2, 4, 6 ou 8.')}
${W.staff({ abc: `X:1\nL:1/2\nK:C\n"^tierce"[EG] "^quinte"[EB] "^septième"[Ed] | "^seconde"[EF] "^quarte"[EA] "^sixte"[Ec] |]`, title: 'Même type de position, ou pas', width: 480, caption: 'À gauche, deux notes sur des lignes : tierce (lignes voisines), quinte (une ligne sautée), septième (deux lignes sautées). À droite, une ligne et un interligne : seconde, quarte, sixte.' })}
<p>Les intervalles les plus fréquents se reconnaissent vite : la <b>tierce</b> (deux lignes ou deux interlignes voisins, comme les notes d’un accord) et la <b>quinte</b> (on saute une ligne). C’est la clé de la lecture à vue rapide : on lit la distance plutôt que le nom de chaque note.</p>
${W.notion({ id: 'iv-portee', title: 'Lire un intervalle sur la portée', short: 'deux lignes ou deux interlignes : 3, 5, 7 ; ligne + interligne : 2, 4, 6, 8', text: '<ul><li>Même type de position (ligne – ligne, interligne – interligne) : <b>tierce, quinte, septième</b>.</li><li>Une ligne et un interligne : <b>seconde, quarte, sixte, octave</b>.</li></ul>', cards: [
  ['Deux notes sur deux lignes voisines : quel intervalle ?', ['une tierce', 'une seconde', 'une quarte', 'une quinte'], 'Lignes voisines : on saute un interligne, donc trois noms.'],
  ['Une note sur une ligne, l’autre dans l’interligne juste au-dessus :', ['une seconde', 'une tierce', 'une quarte', 'un unisson'], 'Deux positions voisines : deux noms.'],
  { id: 'quiz:n1-th-intervalles:ivs-q', quiz: { kind: 'intervalsight', quality: false, set: ['2M', '3M', '4J', '5J', '6M', '7m', '8ve'], title: 'Sur la portée : la quantité' } },
] })}
${W.quiz({ kind: 'intervalsight', quality: false, set: ['2M', '3M', '4J', '5J', '6M', '7m', '8ve'], title: 'À toi : la quantité, sur la portée', count: 10, stat: 'ivs-q' })}

<h2>La qualité : compter les demi-tons</h2>
${idea('Deux tierces n’ont pas toujours la même taille : do → mi fait <b>4 demi-tons</b> (tierce <b>majeure</b>), do → mi♭ en fait <b>3</b> (tierce <b>mineure</b>). Pour la qualité, on compte les demi-tons sur le clavier.')}
<table>
<thead><tr><th>Intervalle</th><th class="num">Demi-tons</th><th>Depuis do</th></tr></thead>
<tbody>
<tr><td>seconde mineure / majeure</td><td class="num">1 / 2</td><td>ré♭ / ré</td></tr>
<tr><td><b>tierce mineure / majeure</b></td><td class="num"><b>3 / 4</b></td><td>mi♭ / mi</td></tr>
<tr><td><b>quarte juste</b></td><td class="num"><b>5</b></td><td>fa</td></tr>
<tr><td>triton (quarte augmentée)</td><td class="num">6</td><td>fa♯</td></tr>
<tr><td><b>quinte juste</b></td><td class="num"><b>7</b></td><td>sol</td></tr>
<tr><td>sixte mineure / majeure</td><td class="num">8 / 9</td><td>la♭ / la</td></tr>
<tr><td>septième mineure / majeure</td><td class="num">10 / 11</td><td>si♭ / si</td></tr>
<tr><td>octave</td><td class="num">12</td><td>do</td></tr>
</tbody></table>
<p>Ne retiens d’abord que les <b>quatre en gras</b> : tierce mineure 3, tierce majeure 4, quarte juste 5, quinte juste 7. Le reste se déduit : la seconde fait 1 ou 2 ; la sixte, une quinte plus 1 ou 2 ; la septième, une octave moins 2 ou moins 1.</p>
${W.ecoute({ title: 'Tierce majeure ou mineure', bpm: 66, items: [
  { label: 'Do – mi : 4 demi-tons', seq: 'do3 | mi3 | do3 mi3:2', note: 'Tierce majeure : claire.' },
  { label: 'Do – mi♭ : 3 demi-tons', seq: 'do3 | mib3 | do3 mib3:2', note: 'Tierce mineure : plus sombre. Un seul demi-ton de différence.' },
] })}
${worked('Exemple résolu : ré → fa', method(['Quantité : ré, mi, fa = 3 noms → <b>tierce</b>.', 'Qualité : compte les touches à partir de ré : ré♯ (1), mi (2), fa (3) → 3 demi-tons → <b>mineure</b>.']), 'Ré → fa : tierce mineure. Et ré → fa♯ (4 demi-tons) : tierce majeure.')}
${W.build({ title: 'À toi : construis l’intervalle au clavier', tasks: [
  { kind: 'interval', from: 'ré3', iv: '3M' },
  { kind: 'interval', from: 'mi3', iv: '3m' },
  { kind: 'interval', from: 'la2', iv: '5J' },
  { kind: 'interval', from: 'fa3', iv: '4J' },
] })}
<p class="small">La dernière est un piège classique : la quarte juste au-dessus de fa est si♭ (5 demi-tons), pas si (6 demi-tons : le triton).</p>
${W.notion({ id: 'iv-qualite', title: 'Les demi-tons des intervalles', short: '3ce m 3, 3ce M 4, 4te J 5, 5te J 7 (2de 1-2, 6te 8-9, 7e 10-11, 8ve 12)', text: '<p><b>Tierce mineure 3 · tierce majeure 4 · quarte juste 5 · quinte juste 7.</b></p><p>Seconde mineure 1, majeure 2 · triton 6 · sixte mineure 8, majeure 9 · septième mineure 10, majeure 11 · octave 12.</p><p>Sur une partition, lis d’abord l’armure : en fa mineur, la – do est la♭ – do, 4 demi-tons.</p>', cards: [
  ['Combien de demi-tons dans une tierce majeure ?', ['4', '3', '5', '2'], 'Do → mi : do♯, ré, ré♯, mi.'],
  ['Combien de demi-tons dans une tierce mineure ?', ['3', '4', '2', '5'], 'Do → mi♭ : do♯, ré, mi♭.'],
  ['Combien de demi-tons dans une quarte juste ?', ['5', '4', '6', '7'], 'Do → fa.'],
  { id: 'fact:n1-th-intervalles:1', q: 'Combien de demi-tons dans une quinte juste ?', a: ['7', '5', '6', '8'], why: 'Do → sol : sept demi-tons.' },
  { id: 'fact:n1-th-intervalles:3', q: 'Combien de demi-tons dans une sixte majeure et une septième mineure ?', a: ['9 et 10', '8 et 10', '9 et 11', '10 et 11'], why: 'Do → la : 9 ; do → si♭ : 10. On les confond souvent.' },
  { id: 'fact:n1-th-intervalles:4', q: 'En fa mineur, que vaut la – do (avec l’armure) ?', a: ['une tierce majeure (la♭ – do)', 'une tierce mineure', 'une quarte', 'une seconde augmentée'], why: 'L’armure change le la en la♭ : la♭ → do, 4 demi-tons.' },
  { id: 'quiz:n1-th-intervalles:ivs', quiz: { kind: 'intervalsight', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '7M', '8ve'], title: 'Sur la portée : quantité et qualité' } },
] })}

<h2>Justes, majeures, mineures — et le nom exact</h2>
${idea('Les <b>secondes, tierces, sixtes et septièmes</b> sont majeures ou mineures. Les <b>quartes, quintes et octaves</b> sont justes. Et la note d’arrivée garde le nom donné par la quantité : une tierce au-dessus de ré est toujours une sorte de <b>fa</b> (fa ou fa♯), jamais un sol♭.')}
${worked('Exemple résolu : la tierce majeure au-dessus de mi', method(['Quantité : une tierce, donc trois noms : mi, fa, <b>sol</b>. La note s’appelle « sol quelque chose ».', 'Qualité : il faut 4 demi-tons. Mi → sol n’en fait que 3 ; on hausse : <b>sol♯</b>.']), 'Tierce majeure au-dessus de mi : sol♯ — et non la♭, même si c’est la même touche.')}
<p>Agrandie d’un demi-ton, une quarte ou une quinte juste devient <b>augmentée</b> ; réduite, <b>diminuée</b>. Le triton (6 demi-tons) est à la fois une quarte augmentée (fa – si) et une quinte diminuée (si – fa).</p>
${W.notion({ id: 'iv-justes', title: 'Justes, majeures ou mineures', short: '4te, 5te, 8ve : justes ; 2de, 3ce, 6te, 7e : majeures ou mineures ; le nom suit la quantité', text: '<ul><li><b>Justes</b> : quarte, quinte, octave (et unisson).</li><li><b>Majeures ou mineures</b> : seconde, tierce, sixte, septième.</li><li>Le nom de la note d’arrivée est fixé par la quantité : une tierce au-dessus de ré est un fa (fa ou fa♯).</li></ul>', cards: [
  ['Quels intervalles sont dits « justes » ?', ['quarte, quinte et octave', 'tierce, sixte et octave', 'seconde, quarte et septième', 'tous les intervalles consonants'], 'Les autres (2, 3, 6, 7) sont majeurs ou mineurs.'],
  ['Une quinte peut-elle être « majeure » ?', ['non : elle est juste (ou augmentée, diminuée)', 'oui, si elle a 7 demi-tons', 'oui, en mode majeur', 'seulement à la basse'], 'Quartes, quintes et octaves : justes.'],
  ['Quelle note est une tierce majeure au-dessus de ré ?', ['fa♯', 'sol♭', 'fa', 'mi♯'], 'Trois noms (ré, mi, fa) et 4 demi-tons : fa♯. Sol♭ a le bon son mais le mauvais nom.'],
  ['fa – si, quel intervalle ?', ['une quarte augmentée (triton)', 'une quarte juste', 'une quinte juste', 'une quinte diminuée'], 'Quatre noms, 6 demi-tons : la quarte juste (fa – si♭) agrandie.'],
  { quiz: { kind: 'ivfind', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6M', '7m'], title: 'Trouver la note à un intervalle donné' } },
] })}
${W.check({ questions: [
  { q: 'Quelle note est à la <b>tierce mineure</b> au-dessus de <b>la</b> ?', options: ['do', 'do♯', 'si♯', 'si'], why: 'La, si, do : trois noms ; la → do : 3 demi-tons. Mineure : do.' },
  { q: 'Quelle note est à la <b>quinte juste</b> au-dessus de <b>si</b> ?', options: ['fa♯', 'fa', 'sol♭', 'sol'], why: 'Si, do, ré, mi, fa : cinq noms ; il faut 7 demi-tons, si → fa n’en fait que 6 (le triton) : fa♯.' },
  { q: 'Quelle note est à la <b>sixte majeure</b> au-dessus de <b>fa</b> ?', options: ['ré', 'ré♭', 'mi♭', 'do♯'], why: 'Fa, sol, la, si, do, ré : six noms ; fa → ré : 9 demi-tons, majeure.' },
] })}
${W.quiz({ kind: 'ivfind', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '8ve'], title: 'Entraînement : trouver la note', count: 8, stat: 'ivf' })}
${W.more('Le renversement d’un intervalle', `<p>Renverser un intervalle, c’est passer la note du bas à l’octave supérieure : do – mi (tierce) devient mi – do (sixte). Les deux quantités font toujours 9 (3 + 6, 2 + 7, 4 + 5), et la qualité s’inverse : majeur ↔ mineur, juste ↔ juste. Une tierce majeure renversée donne une sixte mineure. C’est utile pour les sixtes et les septièmes : une sixte majeure est une tierce mineure renversée.</p>${W.notion({ id: 'iv-renversement', title: 'Le renversement d’un intervalle', short: 'les quantités font 9 ; majeur ↔ mineur, juste reste juste', text: '<p>Renversé, un intervalle change de quantité (3 ↔ 6, 2 ↔ 7, 4 ↔ 5 : la somme fait 9) et de qualité (majeur ↔ mineur ; juste reste juste).</p>', cards: [
  { id: 'fact:n1-th-intervalles:2', q: 'Que devient une tierce majeure renversée ?', a: ['une sixte mineure', 'une sixte majeure', 'une quinte juste', 'une tierce mineure'], why: 'Renversement : 9 moins la quantité (3 → 6), et majeur devient mineur.' },
  ['Que devient une quarte juste renversée ?', ['une quinte juste', 'une quinte diminuée', 'une quarte juste', 'une sixte mineure'], '9 − 4 = 5, et juste reste juste : do – fa devient fa – do.'],
] })}`)}

<h2>Consonances et dissonances : ce que l’oreille entend</h2>
${idea('Octaves, quintes, tierces et sixtes sonnent <b>stables</b> : ce sont des consonances. Secondes, septièmes et triton <b>frottent</b> et veulent bouger : ce sont des dissonances, qui se résolvent en général sur une consonance voisine.')}
${W.ecoute({ title: 'Consonance ou dissonance ?', bpm: 60, items: [
  { label: 'Tierce majeure (do – mi)', seq: 'do3 mi3:2', note: 'Douce et stable : une consonance.' },
  { label: 'Seconde majeure (do – ré)', seq: 'do3 ré3:2', note: 'Les deux notes frottent : une dissonance.' },
  { label: 'Quinte juste (do – sol)', seq: 'do3 sol3:2', note: 'Vide et stable.' },
  { label: 'Triton (do – fa♯)', seq: 'do3 fa#3:2', note: 'Instable : il veut bouger.' },
  { label: 'Le triton se résout (fa – si → mi – do)', seq: 'fa3 si3:2 | mi3 do4:3', note: 'Les deux notes bougent d’un demi-ton chacune : la tension se dénoue. C’est le cœur de la cadence V7 → I (leçon « Fonctions »).' },
] })}
${W.notion({ id: 'consonances', title: 'Consonances et dissonances', short: 'stables : 8ve, 5te, 3ce, 6te ; tendues : 2de, 7e, triton', text: '<p><b>Consonances</b> (stables) : octave, quinte, tierces, sixtes. <b>Dissonances</b> (tendues) : secondes, septièmes, triton. Une dissonance se résout en général par un petit pas vers une consonance.</p>', cards: [
  ['Lequel de ces intervalles est une dissonance ?', ['la septième', 'la tierce', 'la sixte', 'la quinte'], 'Secondes, septièmes et triton frottent.'],
  ['Le triton, c’est…', ['6 demi-tons : quarte augmentée ou quinte diminuée', '7 demi-tons : une quinte juste', '5 demi-tons : une quarte juste', 'une octave moins un demi-ton'], 'Fa – si : instable, il veut se résoudre.'],
] })}
${W.quiz({ kind: 'intervals', set: ['3M', '4J', '5J', '8ve'], title: 'À l’oreille : tierce, quarte, quinte ou octave ?', count: 8, stat: 'iv-a' })}

<h2>Dans ta pièce : deux voix à la main droite (mesures 57 à 60)</h2>
${idea('À la mesure 58, la main droite joue deux voix : la voix du haut tient do puis fa, la voix du bas descend si♭ – la♭ – sol – fa. Entre elles, un éventail d’intervalles qui s’ouvre.')}
${W.score({ abc: E7_INTERVALS, title: 'Mesure 58 (réduction) : les intervalles entre les deux voix', bpm: 56, practice: false, hands: false, analysis: false, caption: 'Do – si♭ : seconde majeure ; fa – la♭ : sixte majeure ; fa – sol : septième mineure ; fa – fa : octave. L’écart grandit à chaque temps.' })}
${W.spot({ abc: OP55.e7, title: 'Sur la partition : les deux voix', tasks: [
  { q: 'Mesure 58, 1<sup>er</sup> temps : sous le do, la voix du bas est à une <b>seconde majeure</b>. Touche-la.', targets: [{ bar: 58, beat: 1, note: 'si♭3', hand: 'rh' }], why: 'Si♭ – do : deux noms, deux demi-tons. Deux notes voisines qui frottent, à faire chanter doucement.' },
  { q: 'Mesure 58, 2<sup>e</sup> temps : sous le fa, la voix du bas est à une <b>sixte majeure</b>. Touche-la.', targets: [{ bar: 58, beat: 2, note: 'la♭3', hand: 'rh' }], why: 'La♭ – fa : six noms (la, si, do, ré, mi, fa), 9 demi-tons.' },
  { q: 'Mesure 58 : touche la note du bas qui forme une <b>octave</b> avec le fa du haut.', targets: [{ bar: 58, beat: 4, note: 'fa3', hand: 'rh' }], why: 'Fa – fa : l’octave, au 4<sup>e</sup> temps. Les deux voix se rejoignent sur la tonique.' },
] })}
${W.score({ abc: OP55.e7, title: 'Mesures 57 à 60, à écouter', bpm: 66, startBpm: 50 })}
<h3>Pour t’entraîner</h3>
${W.quiz({ kind: 'intervalsight', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '7M', '8ve'], title: 'Sur la portée : quantité et qualité', count: 10, stat: 'ivs' })}
${W.quiz({ kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', '5J', '8ve'], mode: 'play', title: 'Au piano : jouer l’intervalle demandé', count: 8, stat: 'iv-n1-play' })}
`,
  },

  {
    id: 'n1-th-accords', minutes: 25, steps: true,
    title: 'Les accords de trois sons',
    summary: 'Un accord de trois sons, ce sont deux tierces empilées. Selon la taille de ces tierces, il est majeur, mineur, diminué ou augmenté. Sur chaque note d’une gamme, on en construit un : les accords de la tonalité.',
    goals: ['Construire un accord majeur, mineur, diminué ou augmenté sur n’importe quelle note.', 'Trouver les accords d’une tonalité majeure, et ceux de fa mineur.', 'Nommer les accords de ton nocturne, mesures 65 à 76.'],
    goal: 'tu construis au clavier, sans faute, ré majeur, sol mineur et si diminué, et tu nommes les accords des mesures 65 à 72.',
    body: W => `
<p>Leçon précédente : la tierce majeure fait 4 demi-tons, la tierce mineure 3, la quinte juste 7. Avec ces trois nombres, tu sais construire tous les accords de cette leçon.</p>

<h2>Un accord : deux tierces empilées</h2>
${idea('Un accord de trois sons empile deux tierces : la <b>fondamentale</b>, sa <b>tierce</b>, sa <b>quinte</b>. Sur les touches blanches, c’est « une note sur deux » : do (ré) mi (fa) sol.')}
${W.kbd({ from: 60, to: 67, title: 'L’accord de do : une touche sur deux', marks: [{ m: 60, label: 'do' }, { m: 64, label: 'mi' }, { m: 67, label: 'sol' }], names: 'none', play: ['chord', 'arp'], caption: 'Do (fondamentale), mi (tierce), sol (quinte).' })}
${W.staff({ abc: `X:1\nL:1/2\nK:C\n"^do"[CEG] "^fa"[FAc] "^sol"[GBd] "^la"[Ace] |]`, width: 380, caption: 'Sur la portée, les trois notes s’empilent ligne – ligne – ligne, ou interligne – interligne – interligne : on reconnaît un accord d’un coup d’œil.' })}
${W.check({ questions: [
  { q: 'Sur les touches blanches, quel accord empile-t-on sur <b>fa</b> ?', options: ['fa – la – do', 'fa – sol – la', 'fa – si – ré', 'fa – la – si'], why: 'Une note sur deux : fa (sol) la (si) do.' },
  { q: 'Et sur <b>sol</b> ?', options: ['sol – si – ré', 'sol – la – si', 'sol – do – mi', 'sol – si – do'], why: 'Sol (la) si (do) ré.' },
] })}

<h2>Majeur ou mineur : c’est la tierce du bas</h2>
${idea('Ce qui fait la couleur, c’est la tierce du bas. <b>Majeur : 4 demi-tons, puis 3.</b> <b>Mineur : 3, puis 4.</b> La quinte, elle, fait toujours 7 demi-tons au-dessus de la fondamentale.')}
${W.ecoute({ title: 'Une seule note change', bpm: 66, items: [
  { label: 'Do majeur (do – mi – sol)', seq: 'do3 mi3 sol3 ~:1 | do3 mi3 sol3:2', note: 'Clair, stable.' },
  { label: 'Do mineur (do – mi♭ – sol)', seq: 'do3 mib3 sol3 ~:1 | do3 mib3 sol3:2', note: 'Seule la tierce baisse d’un demi-ton : tout s’assombrit.' },
] })}
${method(['Pose la <b>fondamentale</b>.', 'Ajoute la <b>tierce</b> : 4 demi-tons au-dessus pour un accord majeur, 3 pour un mineur (sur le nom « une note plus loin » : ré → fa).', 'Ajoute la <b>quinte</b> : 7 demi-tons au-dessus de la fondamentale.'])}
${worked('Exemple résolu : ré majeur et ré mineur', `<ul><li>Ré → <b>fa♯</b> : 4 demi-tons (tierce majeure) ; ré → <b>la</b> : 7 demi-tons (quinte juste). <b>Ré majeur : ré – fa♯ – la.</b></li><li>Ré → <b>fa</b> : 3 demi-tons (tierce mineure) ; la quinte ne change pas. <b>Ré mineur : ré – fa – la.</b></li></ul>`)}
${W.build({ title: 'À toi : construis l’accord', tasks: [
  { kind: 'chord', root: 'ré3', q: 'M', guide: 'full' },
  { kind: 'chord', root: 'sol3', q: 'm', guide: 'full' },
  { kind: 'chord', root: 'mi3', q: 'M', guide: 'half' },
  { kind: 'chord', root: 'fa3', q: 'm', guide: 'none' },
] })}
${W.notion({ id: 'accord-maj-min', title: 'Accord majeur, accord mineur', short: 'majeur 4 + 3 ; mineur 3 + 4 ; quinte juste 7', text: '<ul><li><b>Majeur</b> : tierce majeure (4 demi-tons) + tierce mineure (3). Do – mi – sol.</li><li><b>Mineur</b> : tierce mineure (3) + tierce majeure (4). Do – mi♭ – sol.</li><li>Dans les deux, la quinte est juste : 7 demi-tons.</li></ul>', cards: [
  { id: 'fact:n1-th-accords:0', q: 'Comment est construit un accord majeur ?', a: ['tierce majeure, puis tierce mineure', 'tierce mineure, puis tierce majeure', 'deux tierces majeures', 'deux tierces mineures'], why: 'Do – mi (4 demi-tons), mi – sol (3).' },
  ['Comment est construit un accord mineur ?', ['tierce mineure, puis tierce majeure', 'tierce majeure, puis tierce mineure', 'deux tierces mineures', 'une quarte et une tierce'], 'Do – mi♭ (3 demi-tons), mi♭ – sol (4).'],
  ['Quelles notes forment l’accord de ré majeur ?', ['ré – fa♯ – la', 'ré – fa – la', 'ré – sol♭ – la', 'ré – fa♯ – la♯'], 'Ré → fa♯ : 4 demi-tons ; ré → la : 7.'],
  ['Quelles notes forment l’accord de sol mineur ?', ['sol – si♭ – ré', 'sol – si – ré', 'sol – la♯ – ré', 'sol – si♭ – ré♭'], 'Sol → si♭ : 3 demi-tons ; sol → ré : 7.'],
  { quiz: { kind: 'chordspell', set: ['M', 'm'], title: 'Les notes d’un accord' } },
] })}

<h2>Diminué et augmenté</h2>
${idea('Deux tierces mineures (3 + 3) : accord <b>diminué</b>, serré, instable. Deux tierces majeures (4 + 4) : accord <b>augmenté</b>, flottant. On les rencontre moins, mais toujours à un moment de tension.')}
<table>
<thead><tr><th>Accord</th><th>Tierces (bas → haut)</th><th>Quinte</th><th>Sur do</th><th>Couleur</th></tr></thead>
<tbody>
<tr><td>majeur</td><td>4 + 3</td><td>juste (7)</td><td>do – mi – sol</td><td>clair, stable</td></tr>
<tr><td>mineur</td><td>3 + 4</td><td>juste (7)</td><td>do – mi♭ – sol</td><td>sombre, stable</td></tr>
<tr><td>diminué</td><td>3 + 3</td><td>diminuée (6)</td><td>do – mi♭ – sol♭</td><td>serré, instable</td></tr>
<tr><td>augmenté</td><td>4 + 4</td><td>augmentée (8)</td><td>do – mi – sol♯</td><td>flottant, instable</td></tr>
</tbody></table>
${W.ecoute({ title: 'Les quatre couleurs', bpm: 66, items: [
  { label: 'Majeur', seq: 'do3 mi3 sol3 ~:1 | do3 mi3 sol3:2', note: 'Clair, stable.' },
  { label: 'Mineur', seq: 'do3 mib3 sol3 ~:1 | do3 mib3 sol3:2', note: 'Plus sombre, stable.' },
  { label: 'Diminué', seq: 'do3 mib3 solb3 ~:1 | do3 mib3 solb3:2', note: 'La quinte se resserre : inquiet.' },
  { label: 'Augmenté', seq: 'do3 mi3 sol#3 ~:1 | do3 mi3 sol#3:2', note: 'La quinte s’élargit : sans repos.' },
] })}
${W.build({ title: 'À toi : un accord diminué', tasks: [{ kind: 'chord', root: 'si2', q: 'dim', guide: 'half' }] })}
${W.notion({ id: 'accord-dim-aug', title: 'Accord diminué, accord augmenté', short: 'diminué 3 + 3 ; augmenté 4 + 4', text: '<p><b>Diminué</b> : deux tierces mineures (si – ré – fa). <b>Augmenté</b> : deux tierces majeures (do – mi – sol♯). Les deux sont instables.</p>', cards: [
  { id: 'fact:n1-th-accords:1', q: 'Comment est construit un accord diminué ?', a: ['deux tierces mineures', 'deux tierces majeures', 'tierce majeure, puis tierce mineure', 'tierce mineure, puis quarte'], why: 'Si – ré – fa : 3 + 3 demi-tons.' },
  ['Comment est construit un accord augmenté ?', ['deux tierces majeures', 'deux tierces mineures', 'tierce mineure, puis tierce majeure', 'une quinte juste et une tierce'], 'Do – mi – sol♯ : 4 + 4 demi-tons.'],
  ['si – ré – fa est un accord…', ['diminué', 'mineur', 'majeur', 'augmenté'], 'Si → ré : 3 demi-tons ; ré → fa : 3.'],
] })}
${W.quiz({ kind: 'chords', set: ['M', 'm', 'dim', 'aug'], title: 'À l’oreille : majeur, mineur, diminué ou augmenté ?', count: 10, stat: 'ch-n1' })}

<h2>Les accords d’une gamme majeure</h2>
${idea('Sur chaque degré de la gamme, empile une note sur deux <b>en restant dans la gamme</b> : sept accords. En majeur, toujours le même schéma : <b>majeur sur 1, 4, 5 ; mineur sur 2, 3, 6 ; diminué sur 7</b>.')}
<table class="grid-notes">
<thead><tr><th>Degré</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr></thead>
<tbody>
<tr><td>Do majeur</td><td>do</td><td>ré m</td><td>mi m</td><td>fa</td><td>sol</td><td>la m</td><td>si dim.</td></tr>
<tr><td>Chiffre</td><td><b>I</b></td><td>ii</td><td>iii</td><td><b>IV</b></td><td><b>V</b></td><td>vi</td><td>vii°</td></tr>
</tbody></table>
<p>On les numérote en <b>chiffres romains</b> : majuscule pour un accord majeur (I, IV, V), minuscule pour un mineur (ii, iii, vi), ° pour un diminué (vii°). Le schéma ne dépend pas de la tonalité : en sol majeur aussi, le 6<sup>e</sup> degré porte un accord mineur.</p>
${worked('Exemple résolu : en sol majeur, l’accord du 6e degré', method(['La gamme : sol, la, si, do, ré, <b>mi</b>, fa♯.', 'Depuis le 6<sup>e</sup> degré, une note sur deux : <b>mi, sol, si</b>.', 'Mi → sol : 3 demi-tons, mi → si : 7 : <b>mi mineur</b> (vi), comme prévu par le schéma.']), 'En sol majeur, le vi est mi mineur.')}
${W.build({ title: 'À toi : joue l’accord du degré demandé', tasks: [
  { kind: 'chord', key: 'ré3', mode: 'maj', degree: 5, guide: 'half' },
  { kind: 'chord', key: 'fa3', mode: 'maj', degree: 2, guide: 'half' },
  { kind: 'chord', key: 'sol3', mode: 'maj', degree: 4, guide: 'none' },
] })}
${W.notion({ id: 'accords-majeur', title: 'Les accords d’une tonalité majeure', short: 'I, IV, V majeurs ; ii, iii, vi mineurs ; vii° diminué', text: '<p><b>I IV V</b> : majeurs · <b>ii iii vi</b> : mineurs · <b>vii°</b> : diminué. Le même schéma dans toutes les tonalités majeures.</p>', cards: [
  { id: 'fact:n1-th-accords:2', q: 'En majeur, quels degrés portent un accord mineur ?', a: ['ii, iii et vi', 'I, IV et V', 'ii, IV et vii', 'iii, V et vi'], why: 'I IV V majeurs, ii iii vi mineurs, vii° diminué.' },
  ['En majeur, quel degré porte un accord diminué ?', ['le 7e (vii°)', 'le 2e', 'le 4e', 'le 6e'], 'En do : si – ré – fa.'],
  ['En sol majeur, quel accord porte le 5e degré ?', ['ré majeur', 'ré mineur', 'do majeur', 'mi mineur'], 'Ré – fa♯ – la : le V, majeur.'],
  { quiz: { kind: 'triadkey', keys: ['C', 'G', 'F', 'D', 'Bb'], title: 'Les accords d’une tonalité' } },
] })}

<h2>Les accords de fa mineur</h2>
${idea('En mineur, l’accord de dominante prend la <b>sensible</b> (gamme harmonique) : i et iv sont mineurs, mais <b>V est majeur</b>, grâce au mi♮. Les accords sur les 3<sup>e</sup> et 6<sup>e</sup> degrés (la♭, ré♭) sont majeurs.')}
<table class="grid-notes">
<thead><tr><th>Degré</th><th>1</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr></thead>
<tbody>
<tr><td>Fa mineur</td><td>fa m</td><td>la♭</td><td>si♭ m</td><td>do (mi♮)</td><td>ré♭</td><td>mi♭, ou mi dim. (mi♮)</td></tr>
<tr><td>Chiffre</td><td><b>i</b></td><td>III</td><td><b>iv</b></td><td><b>V</b></td><td>VI</td><td>VII ou vii°</td></tr>
</tbody></table>
<p>Le 7<sup>e</sup> degré a deux versions : avec mi♭ (l’accord de mi♭ majeur, VII, qu’on entend dès la mesure 1 de ton nocturne) ou avec la sensible mi♮ (mi diminué, vii°, qui sonne comme une dominante).</p>
${worked('Exemple résolu : la dominante de fa mineur', method(['5<sup>e</sup> degré de fa mineur : <b>do</b>.', 'Une note sur deux dans la gamme harmonique : do, <b>mi♮</b>, sol (le mi est la sensible).', 'Do → mi♮ : 4 demi-tons : <b>do majeur</b>.']), 'En fa mineur, V = do majeur (do – mi♮ – sol). Sans le mi♮, ce serait do mineur, et la cadence perdrait sa force.')}
${W.check({ questions: [
  { q: 'En fa mineur, l’accord de <b>sous-dominante</b> (iv) est…', options: ['si♭ mineur', 'si♭ majeur', 'si mineur', 'la♭ majeur'], why: 'Si♭ – ré♭ – fa : 3 + 4 demi-tons, mineur.' },
  { q: 'En fa mineur, l’accord du <b>6<sup>e</sup> degré</b> (VI) est…', options: ['ré♭ majeur', 'ré mineur', 'ré♭ mineur', 'do majeur'], why: 'Ré♭ – fa – la♭ : majeur.' },
  { q: 'Pourquoi l’accord de do est-il majeur en fa mineur ?', options: ['grâce à la sensible mi♮', 'parce que fa mineur a quatre bémols', 'parce que do est la tonique', 'il est toujours mineur'], why: 'Le 7<sup>e</sup> degré haussé (mi♮) fait la tierce majeure de do.' },
] })}
${W.notion({ id: 'accords-mineur', title: 'Les accords de fa mineur (et du mineur)', short: 'i et iv mineurs, V majeur (sensible), III et VI majeurs', text: '<p>En mineur : <b>i</b> et <b>iv</b> mineurs ; <b>V majeur</b> grâce à la sensible ; <b>III</b> et <b>VI</b> majeurs ; VII majeur (sans sensible) ou vii° diminué (avec).</p><p>Fa mineur : fa m · la♭ · si♭ m · do · ré♭ · mi♭ / mi dim.</p>', cards: [
  { id: 'fact:n1-th-accords:3', q: 'En fa mineur, quelle est la nature de la♭ – do – mi♭ ?', a: ['majeur (III)', 'mineur (iii)', 'diminué', 'augmenté'], why: 'La♭ → do : 4 demi-tons. Regarde toujours l’armure avant de juger.' },
  ['En fa mineur, quel est l’accord de dominante ?', ['do majeur (do – mi♮ – sol)', 'do mineur (do – mi♭ – sol)', 'mi♭ majeur', 'si♭ mineur'], 'Avec la sensible mi♮ : majeur.'],
  ['En mineur, quelle est la nature de l’accord V ?', ['majeur, grâce à la sensible', 'mineur, comme la tonique', 'diminué', 'augmenté'], 'Le 7e degré haussé donne une tierce majeure à l’accord de dominante.'],
  { quiz: { kind: 'triadkey', keys: ['Fm', 'Am', 'Dm', 'Cm'], degrees: [1, 4, 5, 6], title: 'Les accords d’une tonalité mineure' } },
] })}

<h2>Dans ta pièce : nommer les accords (mesures 65 à 76)</h2>
${idea('La fin du Più mosso fait se succéder des accords très contrastés. Pour les nommer, range leurs notes en tierces, puis mesure la tierce du bas et la quinte.')}
${W.score({ abc: REDUCTION_65_72, title: 'Mesures 65 à 72 (réduction en accords)', bpm: 50, practice: false, analysis: AN_RED_TRIADS, caption: 'Réduction : une harmonie par groupe de mesures, dans une disposition simplifiée. Ouvre « Analyse harmonique » et joue les accords un par un.' })}
${W.check({ questions: [
  { q: 'Mesures 65-66 : <b>sol♭ – si♭ – ré♭</b>. Quel accord ?', options: ['sol♭ majeur', 'sol♭ mineur', 'si♭ mineur', 'ré♭ majeur'], why: 'Sol♭ → si♭ : 4 demi-tons ; sol♭ → ré♭ : 7. Majeur (ici avec ré♭ à la basse).' },
  { q: 'Mesures 67-68 : <b>mi – sol – si♭</b> (Chopin y ajoute ré♭). Quel accord de trois sons ?', options: ['mi diminué', 'mi mineur', 'sol mineur', 'mi majeur'], why: 'Mi → sol : 3 ; sol → si♭ : 3. Deux tierces mineures : diminué. Avec mi♮, la sensible de fa : une couleur de dominante.' },
  { q: 'Mesure 71 : <b>do – mi – sol</b>. Quel accord, et quel degré en fa mineur ?', options: ['do majeur, le V', 'do mineur, le v', 'do majeur, le I', 'mi mineur, le iii'], why: 'Do majeur, la dominante (avec mi♮). Elle devient do 7 au point d’orgue : le thème peut revenir.' },
] })}
${W.spot({ abc: OP55.e1, title: 'Sur la partition : le thème (mesures 1 à 4, comme 73 à 76)', tasks: [
  { q: 'Mesure 1 : touche l’accord de la main gauche qui, avec la basse fa, forme <b>fa mineur</b>.', targets: [{ bar: 1, beat: 2, hand: 'lh' }], why: 'La♭ – do – fa, sur la basse fa : fa mineur, la tonique (i).' },
  { q: 'Mesure 2 : touche la <b>fondamentale</b> de l’accord de la♭ majeur, à la basse.', targets: [{ bar: 2, beat: 1, note: 'la♭1', hand: 'lh' }], why: 'La♭ à la basse, puis do – la♭ au-dessus : la♭ majeur (III).' },
] })}
`,
  },

  {
    id: 'n1-th-renv', minutes: 20, steps: true,
    title: 'Renversements et chiffrage',
    summary: 'Le même accord peut avoir une autre note à la basse : on dit qu’il est renversé. Pour le reconnaître, on range ses notes en tierces ; pour l’écrire en abrégé, un petit chiffre : 6 ou 6/4.',
    goals: ['Retrouver la fondamentale d’un accord renversé.', 'Nommer sa position (état fondamental, 1er ou 2e renversement) et son chiffrage (5, 6, 6/4).', 'Analyser les accords renversés du thème de ton nocturne.'],
    goal: 'tu trouves la fondamentale et la position de 8 accords sur 10 sur la portée (série « Sur la portée : nature et position »).',
    body: W => `
<p>Dans les vraies partitions, la fondamentale n’est pas toujours en bas. Do – mi – sol peut s’écrire mi – sol – do, ou sol – do – mi : c’est toujours l’accord de do, mais il ne sonne pas tout à fait pareil. Cette leçon t’apprend à le reconnaître sous toutes ses formes.</p>

<h2>Même accord, autre basse</h2>
${idea('Un accord garde son nom quel que soit l’ordre de ses notes. Ce qui change, c’est la note la plus grave, la <b>basse</b> : fondamentale à la basse = <b>état fondamental</b> ; tierce à la basse = <b>1<sup>er</sup> renversement</b> ; quinte à la basse = <b>2<sup>e</sup> renversement</b>.')}
${W.score({ abc: INVERSIONS, title: 'Do majeur dans ses trois positions', bpm: 50, hands: false, practice: false, caption: 'En notation anglo-saxonne, on écrit la basse après une barre : do/mi, do/sol.' })}
${W.ecoute({ title: 'Le même accord, trois basses', bpm: 60, items: [
  { label: 'Do / do (état fondamental)', seq: 'do2 sol3 do4 mi4:3', note: 'Stable, assis.' },
  { label: 'Do / mi (1er renversement)', seq: 'mi2 sol3 do4 mi4:3', note: 'Plus léger : il avance, idéal au milieu d’une phrase.' },
  { label: 'Do / sol (2e renversement)', seq: 'sol1 sol3 do4 mi4:3', note: 'Suspendu : il attend la suite.' },
] })}
${W.check({ questions: [
  { q: 'Accord de do, avec <b>sol</b> à la basse : quelle position ?', options: ['2e renversement', '1er renversement', 'état fondamental'], why: 'Sol est la quinte de do : quinte à la basse, 2<sup>e</sup> renversement.' },
  { q: 'Accord de fa majeur (fa – la – do), avec <b>la</b> à la basse ?', options: ['1er renversement', '2e renversement', 'état fondamental'], why: 'La est la tierce de fa : 1<sup>er</sup> renversement.' },
] })}

<h2>Trouver la fondamentale : ranger en tierces</h2>
${idea('Pour nommer un accord renversé, range ses notes pour qu’elles s’empilent en <b>tierces</b> (une note sur deux). La note du bas de cette pile est la fondamentale ; la nature se lit sur les tierces.')}
${worked('Exemple résolu : mi – sol – do', method(['Essaie dans l’ordre écrit : mi → sol (tierce), sol → do (quarte) : ce n’est pas une pile de tierces.', 'Fais tourner : <b>do</b> → mi (tierce), mi → sol (tierce) : ça marche.', 'Fondamentale <b>do</b>, tierce majeure (do → mi : 4 demi-tons) : do majeur. La basse est mi, sa tierce : <b>1<sup>er</sup> renversement</b>.']), 'Mi – sol – do : do majeur au premier renversement (do/mi).')}
${worked('Exemple résolu : ré – sol – si', method(['Range en tierces : <b>sol</b> – si – ré.', 'Sol → si : 4 demi-tons : sol majeur.', 'La basse, ré, est la quinte : <b>2<sup>e</sup> renversement</b>.']), 'Ré – sol – si : sol majeur au deuxième renversement (sol/ré).')}
${trap('ne nomme pas un accord d’après sa basse : mi – sol – do est un accord de <b>do</b>, pas de mi. Et dans une partition, ne range que les notes qui durent : une note de passage de la mélodie n’appartient pas à l’accord.')}
${W.check({ questions: [
  { q: '<b>la – do – fa</b> : quelle fondamentale ?', options: ['fa', 'la', 'do'], why: 'Fa – la – do s’empile en tierces : fa est la fondamentale. Avec la à la basse : 1<sup>er</sup> renversement.' },
  { q: '<b>sol – do – mi</b> : quel accord, quelle position ?', options: ['do majeur, 2e renversement', 'sol majeur, état fondamental', 'mi mineur, 1er renversement', 'do majeur, 1er renversement'], why: 'Do – mi – sol ; la basse sol est la quinte : 2<sup>e</sup> renversement.' },
  { q: '<b>fa – si♭ – ré</b> (fa à la basse) : quel accord ?', options: ['si♭ majeur, 2e renversement', 'fa majeur, état fondamental', 'ré mineur, 1er renversement'], why: 'Si♭ – ré – fa : si♭ majeur ; fa, la quinte, est à la basse.' },
] })}
${W.notion({ id: 'trouver-fondamentale', title: 'Trouver la fondamentale', short: 'ranger les notes en tierces : la note du bas de la pile', text: '<p>Range les notes en <b>tierces superposées</b> (une note sur deux). La note du bas de la pile est la <b>fondamentale</b>. Puis regarde la vraie basse : fondamentale, tierce ou quinte ?</p>', cards: [
  { id: 'fact:n1-th-renv:4', q: 'Comment trouver la fondamentale d’un accord renversé ?', a: ['ranger ses notes en tierces superposées', 'prendre la note la plus grave', 'prendre la note la plus aiguë', 'chercher la note répétée'], why: 'La note du bas de la pile de tierces est la fondamentale.' },
  { id: 'fact:n1-th-renv:2', q: 'mi – sol – do est un accord de…', a: ['do, au premier renversement', 'mi mineur', 'sol, au deuxième renversement', 'do, au deuxième renversement'], why: 'Rangé en tierces : do – mi – sol. La basse mi est la tierce.' },
  ['la – do – fa est un accord de…', ['fa majeur, au premier renversement', 'la mineur', 'do majeur, au deuxième renversement', 'fa majeur, à l’état fondamental'], 'Fa – la – do ; la basse la est la tierce.'],
] })}

<h2>Le chiffrage : 5, 6, 6/4</h2>
${idea('Sous la basse, un petit chiffre dit la position : rien (ou 5) à l’état fondamental, <b>6</b> au premier renversement, <b>6/4</b> au deuxième. On l’écrit aussi après le chiffre romain : I6, V6/4.')}
<p>D’où viennent ces chiffres ? Ce sont des intervalles au-dessus de la basse. Mi – sol – do : la fondamentale do est une <b>sixte</b> au-dessus de mi → « 6 ». Sol – do – mi : do est une <b>quarte</b> et mi une <b>sixte</b> au-dessus de sol → « 6/4 ». Pas besoin de refaire ce calcul à chaque fois : retiens <b>6 = tierce à la basse</b>, <b>6/4 = quinte à la basse</b>.</p>
<table>
<thead><tr><th>Basse</th><th>Position</th><th>Chiffrage</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td>fondamentale</td><td>état fondamental</td><td>5 (souvent omis)</td><td>do – mi – sol</td></tr>
<tr><td>tierce</td><td>1<sup>er</sup> renversement</td><td><b>6</b></td><td>mi – sol – do</td></tr>
<tr><td>quinte</td><td>2<sup>e</sup> renversement</td><td><b>6/4</b></td><td>sol – do – mi</td></tr>
</tbody></table>
${W.notion({ id: 'renversements', title: 'Positions et chiffrage', short: 'fondamentale à la basse : 5 ; tierce : 6 ; quinte : 6/4', text: '<p>Fondamentale à la basse : <b>état fondamental</b> (5). Tierce à la basse : <b>1<sup>er</sup> renversement</b> (6). Quinte à la basse : <b>2<sup>e</sup> renversement</b> (6/4).</p>', cards: [
  { id: 'fact:n1-th-renv:0', q: 'Accord avec la tierce à la basse : quel chiffrage ?', a: ['6 (premier renversement)', '6/4 (deuxième renversement)', '5 (état fondamental)', '7'], why: 'Mi – sol – do : la fondamentale est une sixte au-dessus de la basse.' },
  { id: 'fact:n1-th-renv:1', q: 'Accord avec la quinte à la basse : quel chiffrage ?', a: ['6/4 (deuxième renversement)', '6 (premier renversement)', '5 (état fondamental)', '4/3'], why: 'Sol – do – mi : quarte et sixte au-dessus de la basse.' },
  ['Que signifie « do/mi » ?', ['l’accord de do avec mi à la basse', 'deux accords : do puis mi', 'do et mi joués ensemble', 'do mineur'], 'Notation anglo-saxonne : accord / basse.'],
  { id: 'quiz:n1-th-renv:chs', quiz: { kind: 'chordsight', set: ['M', 'm'], inversions: [0, 1, 2], title: 'Sur la portée : nature et position' } },
] })}
${W.quiz({ kind: 'chordsight', set: ['M', 'm'], inversions: [0, 1, 2], title: 'À toi : sur la portée, nature et position', count: 10, stat: 'chs' })}

<h2>La septième de dominante et ses quatre positions</h2>
${idea('Ajoute une tierce au-dessus de l’accord de V : tu obtiens la <b>septième de dominante</b> (en fa mineur : do – mi♮ – sol – si♭). Quatre notes, donc quatre positions, et quatre chiffrages.')}
<table>
<thead><tr><th>Basse</th><th>Chiffrage</th><th>En fa mineur</th></tr></thead>
<tbody>
<tr><td>fondamentale</td><td>V7</td><td>do à la basse</td></tr>
<tr><td>tierce (la sensible)</td><td>V6/5</td><td>mi♮ à la basse</td></tr>
<tr><td>quinte</td><td>V4/3</td><td>sol à la basse</td></tr>
<tr><td>septième</td><td>V4/2</td><td>si♭ à la basse</td></tr>
</tbody></table>
<p>Pour t’en souvenir : les chiffres <b>diminuent</b> à mesure que la basse monte dans l’accord : 7, puis 6/5, puis 4/3, puis 4/2.</p>
${W.notion({ id: 'v7-positions', title: 'Les positions de la septième de dominante', short: 'V7, V6/5 (tierce), V4/3 (quinte), V4/2 (septième)', text: '<p>Fondamentale à la basse : <b>V7</b> · tierce : <b>V6/5</b> · quinte : <b>V4/3</b> · septième : <b>V4/2</b>.</p>', cards: [
  { id: 'fact:n1-th-renv:3', q: 'Septième de dominante avec la quinte à la basse : quel chiffrage ?', a: ['4/3', '6/5', '4/2', '6/4'], why: 'V7, V6/5, V4/3, V4/2 : tierce, quinte, septième à la basse.' },
  ['Septième de dominante avec la tierce (la sensible) à la basse : quel chiffrage ?', ['6/5', '4/3', '4/2', '6'], 'En fa mineur : do 7 avec mi♮ à la basse, comme à la mesure 2 de ton nocturne.'],
  ['Septième de dominante avec la septième à la basse : quel chiffrage ?', ['4/2', '4/3', '6/5', '7'], 'La septième à la basse veut descendre : V4/2 va souvent vers I6.'],
] })}

<h2>Dans ta pièce : mesures 73 à 76 (comme 1 à 4)</h2>
${idea('Le thème revient avec ses accords du début : fa mineur, mi♭ majeur, la♭ majeur, do 7. Deux d’entre eux sont renversés : leur basse n’est pas leur fondamentale.')}
${W.spot({ abc: OP55.e1, title: 'Sur la partition : les basses du thème', tasks: [
  { q: 'Mesure 1, 3<sup>e</sup> temps : touche la basse. Au-dessus, la main gauche joue mi♭ – si♭ – mi♭.', targets: [{ bar: 1, beat: 3, note: 'sol1', hand: 'lh' }], why: 'Sol est la tierce de mi♭ majeur (mi♭ – sol – si♭) : premier renversement, VII6 en fa mineur.' },
  { q: 'Mesure 2 : touche la basse de l’accord de <b>do 7</b>.', targets: [{ bar: 2, beat: 3, note: 'mi1', hand: 'lh' }], why: 'Mi♮, la tierce de do 7 (et la sensible de fa) : V6/5. Elle monte vers fa, au début de la mesure suivante.' },
] })}
${W.check({ questions: [
  { q: 'Mesure 1, 1<sup>er</sup> temps : fa à la basse, la♭ – do – fa au-dessus. Quelle position ?', options: ['état fondamental', '1er renversement', '2e renversement'], why: 'Fa – la♭ – do avec fa à la basse : fa mineur à l’état fondamental (i).' },
  { q: 'Mesure 2, 3<sup>e</sup> et 4<sup>e</sup> temps : mi♮ à la basse, si♭ – do – sol au-dessus. Rangé en tierces ?', options: ['do – mi – sol – si♭ : do 7, tierce à la basse', 'mi – sol – si♭ – do : mi diminué', 'sol – si♭ – do – mi : sol mineur'], why: 'Do – mi – sol – si♭ : la septième de dominante de fa mineur, avec sa tierce (mi♮) à la basse : V6/5.' },
] })}
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4, à écouter', bpm: 56, startBpm: 46 })}
`,
  },

  {
    id: 'n1-th-fonctions', minutes: 25, steps: true,
    title: 'Degrés et fonctions : tonique, sous-dominante, dominante',
    summary: 'Chaque accord joue un rôle : le repos (tonique), l’éloignement (sous-dominante) ou la tension (dominante). Reconnaître ces trois rôles, c’est savoir où va la musique, donc comment la phraser.',
    goals: ['Classer un accord en tonique, sous-dominante ou dominante.', 'Expliquer pourquoi V7 appelle si fort la tonique : la sensible monte, la septième descend.', 'Analyser en fonctions le début de la coda de ton nocturne.'],
    goal: 'tu classes en T, SD ou D les accords de la coda (mesures 77 à 80) et tu réussis 8 questions sur 10 à « Fonctions ».',
    body: W => `
<p>Leçon précédente, tu as appris à <i>nommer</i> les accords. Celle-ci dit ce qu’ils <i>font</i>. Bonne nouvelle : il n’y a que trois rôles, et on les entend très bien.</p>

<h2>Trois rôles : la maison, le départ, la tension</h2>
${idea('Dans une tonalité, chaque accord a un rôle. La <b>tonique</b> (I) est la maison : on peut s’y arrêter. La <b>sous-dominante</b> (IV) éloigne de la maison. La <b>dominante</b> (V) crée une tension qui réclame le retour.')}
${W.diagram('functions', { key: 'fa mineur' })}
${W.ecoute({ title: 'Tension et détente', bpm: 72, items: [
  { label: 'I – IV – V7 – I', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | do2 mi3 sol3 do4:3', note: 'Repos, éloignement, tension, retour.' },
  { label: 'I – IV – V7… et rien', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4:3', note: 'Arrêté sur la dominante : l’oreille attend la suite. Chante l’accord qui manque.' },
] })}
${W.notion({ id: 'fonctions-trois', title: 'Les trois fonctions', short: 'tonique = repos ; sous-dominante = éloignement ; dominante = tension', text: '<ul><li><b>Tonique (T)</b> : I, le repos, la maison.</li><li><b>Sous-dominante (SD)</b> : IV, on s’éloigne, on prépare.</li><li><b>Dominante (D)</b> : V (et V7), la tension, qui appelle le retour à I.</li></ul>', cards: [
  ['Quel accord crée la tension qui appelle la tonique ?', ['la dominante (V)', 'la sous-dominante (IV)', 'la tonique (I)', 'le vi'], 'V, surtout avec sa septième : il réclame I.'],
  ['En do majeur, quelle est la fonction de fa majeur ?', ['sous-dominante', 'dominante', 'tonique', 'aucune'], 'Fa majeur est le IV de do.'],
  ['En do majeur, quelle est la fonction de sol 7 ?', ['dominante', 'sous-dominante', 'tonique', 'aucune'], 'Sol 7 est le V7 de do.'],
] })}

<h2>Le chemin type : T – SD – D – T</h2>
${idea('Le trajet le plus courant de la musique tonale : <b>partir (T), s’éloigner (SD), se tendre (D), revenir (T)</b>. Une phrase sur deux suit ce chemin, et l’oreille le connaît par cœur.')}
${W.score({ abc: FUNCTIONS, title: 'T – SD – D – T en fa mineur', bpm: 60, caption: 'Fa mineur (i), si♭ mineur (iv), do 7 (V7), fa mineur (i). Écoute la tension du do 7 et le soulagement de l’accord final.' })}
${W.build({ title: 'À toi : joue le chemin en fa mineur', tasks: [
  { kind: 'chord', key: 'fa3', mode: 'min', degree: 1, guide: 'half', prompt: 'La <b>tonique</b> de fa mineur (i) : sa fondamentale est déjà là.' },
  { kind: 'chord', key: 'fa3', mode: 'min', degree: 4, guide: 'half', prompt: 'La <b>sous-dominante</b> (iv) : sa fondamentale est déjà là.' },
  { kind: 'chord', key: 'fa3', mode: 'min', degree: 5, guide: 'half', prompt: 'La <b>dominante</b> (V) : n’oublie pas la sensible.' },
] })}
${W.notion({ id: 'chemin-tsdt', title: 'Le chemin T – SD – D – T', short: 'repos, éloignement, tension, retour', text: '<p>Le mouvement de base de la musique tonale : <b>T – SD – D – T</b>. En fa mineur : fa m – si♭ m – do 7 – fa m. En do majeur : do – fa – sol 7 – do.</p>', cards: [
  { id: 'fact:n1-th-fonctions:1', q: 'Quel est le mouvement de base de la musique tonale ?', a: ['T – SD – D – T', 'T – D – SD – T', 'SD – T – D – SD', 'D – T – SD – D'], why: 'Repos, éloignement, tension, retour.' },
  ['En fa mineur, quel enchaînement suit le chemin T – SD – D – T ?', ['fa m – si♭ m – do 7 – fa m', 'fa m – do 7 – si♭ m – fa m', 'si♭ m – fa m – do 7 – si♭ m', 'fa m – mi♭ – ré♭ – do'], 'i – iv – V7 – i.'],
] })}

<h2>Les remplaçants : ii, vi et vii°</h2>
${idea('Un accord peut jouer le rôle d’un autre s’il partage <b>deux notes</b> avec lui. <b>ii</b> remplace IV (sous-dominante), <b>vi</b> remplace I (tonique), <b>vii°</b> fait office de dominante.')}
<table>
<thead><tr><th>Fonction</th><th>Accords</th><th>En do majeur</th><th>En fa mineur</th></tr></thead>
<tbody>
<tr><td><b>Tonique</b></td><td>I (vi)</td><td>do (la m)</td><td>fa m (ré♭)</td></tr>
<tr><td><b>Sous-dominante</b></td><td>IV, ii</td><td>fa, ré m</td><td>si♭ m, sol dim.</td></tr>
<tr><td><b>Dominante</b></td><td>V, V7, vii°</td><td>sol, sol 7, si dim.</td><td>do, do 7, mi dim.</td></tr>
</tbody></table>
${worked('Exemple résolu : pourquoi ré mineur remplace fa majeur (en do)', method(['Ré mineur : ré – <b>fa – la</b>. Fa majeur : <b>fa – la</b> – do.', 'Deux notes communes : fa et la. Les deux accords sonnent « de la même famille ».', 'Dans une cadence, ré mineur (ii) prépare la dominante exactement comme fa (IV) : ii – V – I.']), 'ii a une fonction de sous-dominante.')}
${W.notion({ id: 'fonctions-accords', title: 'Quels accords pour quelle fonction', short: 'T : I (vi) ; SD : IV, ii ; D : V, V7, vii°', text: '<p><b>T</b> : I, et vi qui le remplace · <b>SD</b> : IV et ii · <b>D</b> : V, V7, vii°. Un remplaçant partage deux notes avec l’accord qu’il remplace.</p>', cards: [
  { id: 'fact:n1-th-fonctions:0', q: 'Quelle est la fonction de l’accord ii ?', a: ['sous-dominante', 'dominante', 'tonique', 'aucune'], why: 'ii partage deux notes avec IV : il prépare la dominante.' },
  { id: 'fact:n1-th-fonctions:4', q: 'Quels accords ont une fonction de dominante ?', a: ['V, V7 et vii°', 'IV et ii', 'I et vi', 'iii et vi'], why: 'Tous contiennent la sensible.' },
  ['Quel accord remplace souvent la tonique ?', ['vi', 'ii', 'IV', 'vii°'], 'vi partage deux notes avec I (en do : la m et do ont do et mi).'],
  { quiz: { kind: 'funckey', keys: ['C', 'G', 'F', 'D', 'Fm'], title: 'Fonctions : tonique, sous-dominante, dominante' } },
] })}
${W.quiz({ kind: 'funckey', keys: ['C', 'G', 'F', 'D', 'Fm'], title: 'À toi : quelle fonction ?', count: 10, stat: 'fnk' })}

<h2>Pourquoi la dominante attire : sensible et septième</h2>
${idea('Dans V7, deux notes ont une direction obligée : la <b>sensible monte</b> vers la tonique, la <b>septième descend</b> d’un degré. Ensemble, elles forment un triton qui se resserre : c’est toute la force de la cadence.')}
${W.kbd({ from: 60, to: 72, title: 'Do 7 → fa mineur : deux notes qui bougent', marks: [{ m: 64, label: 'mi♮', color: '#f2d9a8' }, { m: 70, label: 'si♭', color: '#f2d9a8' }, { m: 65, label: 'fa', color: '#cfe6d7' }, { m: 68, label: 'la♭', color: '#cfe6d7' }], names: 'none', caption: 'En or, le triton de do 7 : mi♮ (la sensible) et si♭ (la septième). En vert, leurs arrivées : mi♮ monte vers fa, si♭ descend vers la♭.' })}
${W.ecoute({ title: 'Avec ou sans septième', bpm: 72, items: [
  { label: 'V → I', seq: 'sol2 ré3 sol3 si3:2 | do2 mi3 sol3 do4:2', note: 'La sensible si monte sur do : déjà une conclusion.' },
  { label: 'V7 → I', seq: 'sol2 fa3 si3 ré4:2 | do2 mi3 sol3 do4:3', note: 'Avec la septième (fa), la tension est plus forte et la détente plus nette : fa descend sur mi, si monte sur do.' },
] })}
${W.check({ questions: [
  { q: 'Dans sol 7 → do, que fait le <b>si</b> ?', options: ['il monte vers do', 'il descend vers la', 'il reste en place'], why: 'Si est la sensible de do : il monte d’un demi-ton.' },
  { q: 'Et le <b>fa</b> (la septième) ?', options: ['il descend vers mi', 'il monte vers sol', 'il reste en place'], why: 'La septième descend d’un degré : fa → mi.' },
  { q: 'Dans do 7 → fa mineur, que devient le <b>si♭</b> ?', options: ['il descend vers la♭', 'il monte vers si♮', 'il monte vers do'], why: 'Si♭ est la septième de do 7 : il descend vers la♭, la tierce de fa mineur.' },
] })}
${W.notion({ id: 'v7-resolution', title: 'La résolution de V7', short: 'la sensible monte, la septième descend', text: '<p>Dans V7 → I : la <b>sensible monte</b> d’un demi-ton vers la tonique ; la <b>septième descend</b> d’un degré. En fa mineur : mi♮ → fa, si♭ → la♭.</p>', cards: [
  { id: 'fact:n1-th-fonctions:2', q: 'Dans V7, que fait la septième ?', a: ['elle descend', 'elle monte', 'elle reste en place', 'elle saute à l’octave'], why: 'Fa → mi dans sol 7 → do ; si♭ → la♭ dans do 7 → fa mineur.' },
  ['Dans V7 → I, que fait la sensible ?', ['elle monte vers la tonique', 'elle descend vers la dominante', 'elle reste en place', 'elle disparaît'], 'Si → do dans sol 7 → do.'],
  ['Quel triton contient do 7 (en fa mineur) ?', ['mi♮ – si♭', 'do – sol', 'do – mi', 'sol – si♭'], 'La sensible et la septième : six demi-tons, qui se resserrent sur fa – la♭.'],
] })}

<h2>Le 6/4 de cadence : une dominante déguisée</h2>
${idea('Juste avant V, on trouve souvent l’accord de tonique au 2<sup>e</sup> renversement (I6/4, ou i6/4) : la basse est <b>déjà la dominante</b>, et les voix du haut retardent l’accord de V. Il a une fonction de dominante, pas de tonique.')}
${W.ecoute({ title: 'Le 6/4 de cadence', bpm: 60, items: [
  { label: 'do/sol → sol 7 → do', seq: 'sol1 sol3 do4 mi4:2 | sol1 fa3 si3 ré4:2 | do2 mi3 sol3 do4:3', note: 'La basse sol ne bouge pas : l’accord de do « posé sur sol » glisse vers sol 7, puis tout se résout.' },
] })}
${W.notion({ id: '64-cadence', title: 'Le 6/4 de cadence', short: 'I6/4 juste avant V : basse sur la dominante, fonction de dominante', text: '<p>I6/4 (ou i6/4) juste avant V : la basse est la dominante, les voix du haut retardent l’accord de V. C’est une <b>dominante déguisée</b>.</p>', cards: [
  { id: 'fact:n1-th-fonctions:3', q: 'Quelle est la fonction du 6/4 de cadence (i6/4) ?', a: ['dominante : il prépare V', 'tonique : c’est l’accord de I', 'sous-dominante', 'aucune : c’est un accident'], why: 'Sa basse est la dominante ; il se résout sur V.' },
  ['Dans le 6/4 de cadence, quelle note est à la basse ?', ['la dominante', 'la tonique', 'la sous-dominante', 'la sensible'], 'Do/sol en do majeur : sol à la basse.'],
] })}

<h2>Dans ta pièce : la coda (mesures 77 à 80)</h2>
${idea('La coda commence par un enchaînement complet, joué deux fois (mesures 77-80, puis 81-84). Classe chaque accord : tu entendras le chemin T – SD – D – T.')}
${W.check({ questions: [
  { q: 'Mesure 77 : <b>fa mineur</b>. Quelle fonction ?', options: ['T', 'SD', 'D'], why: 'La tonique.' },
  { q: 'Mesure 78 : <b>si♭ mineur</b>, puis <b>do 7</b>. Quelles fonctions ?', options: ['SD puis D', 'D puis T', 'T puis SD'], why: 'Si♭ mineur, le iv : sous-dominante ; do 7, le V7 : dominante.' },
  { q: 'Mesure 79 : <b>ré♭ majeur</b>. Quelle fonction ?', options: ['T (il remplace la tonique)', 'D', 'SD'], why: 'Ré♭ est le VI : il remplace la tonique (deux notes communes avec fa mineur). L’oreille attendait fa mineur : petite surprise, et la phrase repart.' },
  { q: 'Mesure 80 : <b>fa mineur avec do à la basse</b>, puis <b>do</b>. Le premier accord est…', options: ['un 6/4 de cadence (fonction D)', 'une tonique (T)', 'une sous-dominante (SD)'], why: 'Fa mineur au 2<sup>e</sup> renversement juste avant V : une dominante déguisée.' },
] })}
${W.spot({ abc: OP55.e9, title: 'Sur la partition : les basses des trois fonctions', tasks: [
  { q: 'Mesure 77 : touche la basse de l’accord de <b>tonique</b>.', targets: [{ bar: 77, beat: 1, note: 'fa1', hand: 'lh' }], why: 'Fa, la tonique : la maison, au début de la coda.' },
  { q: 'Mesure 78 : touche la basse de l’accord de <b>sous-dominante</b>.', targets: [{ bar: 78, beat: 1, note: 'si♭1', hand: 'lh' }], why: 'Si♭ : si♭ mineur, le iv.' },
  { q: 'Mesure 78 : touche la basse de l’accord de <b>dominante</b>.', targets: [{ bar: 78, beat: 3, note: 'do2', hand: 'lh' }], why: 'Do : do 7, le V7, qui appelle fa.' },
] })}
${W.score({ abc: OP55.e9, title: 'Mesures 77 à 80, à écouter', bpm: 60, startBpm: 44 })}
<h3>Pour t’entraîner</h3>
${W.quiz({ kind: 'playchord', mode: 'play', title: 'Au piano : jouer les fonctions en fa mineur', count: 6, stat: 'play-fm' })}
${W.quiz({ kind: 'chordfunc', set: ['IV', 'V', 'vi'], title: 'À l’oreille : après le I, IV, V ou vi ?', count: 10, stat: 'func' })}
`,
  },

  {
    id: 'n1-th-cadences', minutes: 20, steps: true,
    title: 'Les cadences',
    summary: 'Les cadences sont la ponctuation de la musique : un point final, une virgule, un « amen », une surprise. Quatre enchaînements de deux accords, à reconnaître à l’oreille et sur la partition.',
    goals: ['Reconnaître les quatre cadences : parfaite, demi-cadence, plagale, rompue.', 'Les identifier d’après les degrés des deux derniers accords, et à l’oreille.', 'Repérer les cadences de ton nocturne, et ce qu’elles changent au jeu.'],
    goal: '80 % ou plus à « À l’oreille : fin ou suspension ? », et tu nommes les cadences de ton nocturne listées dans la leçon.',
    body: W => `
<p>Leçon précédente : tonique, sous-dominante, dominante. Les cadences sont ce qui se passe <b>à la fin des phrases</b> : deux accords qui disent si la musique s’arrête, respire ou repart.</p>

<h2>Une cadence, c’est une ponctuation</h2>
${idea('À la fin d’une phrase, deux accords suffisent à dire si la musique <b>s’arrête</b> (un point) ou <b>attend une suite</b> (une virgule). Ces deux accords forment la cadence.')}
${W.ecoute({ title: 'Point ou virgule ?', bpm: 76, items: [
  { label: 'Un point (V7 → I)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | do2 mi3 sol3 do4:3', note: 'La phrase est finie : on pourrait s’arrêter là.' },
  { label: 'Une virgule (arrêt sur V)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | ré2 fa#3 la3 do4 | sol2 ré3 sol3 si3:3', note: 'La phrase s’arrête sur la dominante : une question, la suite doit venir.' },
] })}
${W.quiz({ kind: 'cadences', set: ['parfaite', 'demi'], labels: { parfaite: 'Fin (point)', demi: 'Suspension (virgule)' }, title: 'À toi : fin ou suspension ?', count: 8, stat: 'cad-2' })}

<h2>Le point et la virgule : cadence parfaite, demi-cadence</h2>
${idea('<b>V – I</b> : la <b>cadence parfaite</b>, le point final. <b>Arrêt sur V</b> : la <b>demi-cadence</b>, une virgule ou une question.')}
<ul>
<li><b>Cadence parfaite</b> : V (ou V7) puis I, les deux à l’état fondamental, la tonique tout en haut. Si l’un des accords est renversé, ou si la tonique n’est pas à la voix du haut, la fin est moins définitive : on parle de <b>cadence imparfaite</b>.</li>
<li><b>Demi-cadence</b> : la phrase s’arrête sur V, quel que soit l’accord d’avant (I, IV, ii…). Elle appelle une deuxième phrase qui, souvent, finira par une cadence parfaite : la question et la réponse.</li>
</ul>
${W.score({ abc: CADENCES, title: 'Les quatre cadences en do majeur', bpm: 72, caption: 'Une cadence par mesure : parfaite, demi-cadence, plagale, rompue (les deux dernières à l’étape suivante).' })}

<h2>L’amen et la surprise : plagale et rompue</h2>
${idea('<b>IV – I</b> : la <b>cadence plagale</b>, l’« amen » des cantiques, une fin plus douce. <b>V – vi</b> : la <b>cadence rompue</b> ; on attendait I, on entend vi, et la phrase doit repartir.')}
${W.ecoute({ title: 'Une phrase, quatre fins', bpm: 76, items: [
  { label: 'Parfaite (V7 → I)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | do2 mi3 sol3 do4:3', note: 'Un point final.' },
  { label: 'Demi-cadence (arrêt sur V)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | ré2 fa#3 la3 do4 | sol2 ré3 sol3 si3:3', note: 'Une virgule : la question reste ouverte.' },
  { label: 'Plagale (IV → I)', seq: 'do2 mi3 sol3 do4 | sol2 ré3 sol3 si3 | fa2 fa3 la3 do4 | do2 mi3 sol3 do4:3', note: 'Un « amen », plus doux que la parfaite.' },
  { label: 'Rompue (V7 → vi)', seq: 'do2 mi3 sol3 do4 | fa2 fa3 la3 do4 | sol2 fa3 si3 ré4 | la1 mi3 la3 do4:3', note: 'On attendait do, on entend la mineur : la phrase doit repartir.' },
] })}
${W.notion({ id: 'cadences', title: 'Les quatre cadences', short: 'parfaite V – I ; demi-cadence sur V ; plagale IV – I ; rompue V – vi', text: '<ul><li><b>Parfaite</b> : V – I (état fondamental, tonique en haut) : le point final.</li><li><b>Demi-cadence</b> : arrêt sur V : la virgule, la question.</li><li><b>Plagale</b> : IV – I : l’« amen ».</li><li><b>Rompue</b> : V – vi : la surprise, la phrase repart.</li></ul>', cards: [
  { id: 'fact:n1-th-cadences:0', q: 'V – I, les deux accords à l’état fondamental :', a: ['cadence parfaite', 'demi-cadence', 'cadence plagale', 'cadence rompue'], why: 'Le point final.' },
  { id: 'fact:n1-th-cadences:1', q: 'Une phrase qui s’arrête sur V :', a: ['demi-cadence', 'cadence parfaite', 'cadence rompue', 'cadence plagale'], why: 'Une virgule, une question.' },
  { id: 'fact:n1-th-cadences:2', q: 'V – vi :', a: ['cadence rompue', 'cadence plagale', 'demi-cadence', 'cadence parfaite'], why: 'On attendait I : la surprise relance la phrase.' },
  { id: 'fact:n1-th-cadences:3', q: 'IV – I :', a: ['cadence plagale', 'cadence parfaite', 'demi-cadence', 'cadence rompue'], why: 'L’« amen ».' },
] })}

<h2>Reconnaître une cadence écrite</h2>
${idea('Regarde les <b>deux derniers accords</b> et donne-leur leur degré. Arrive-t-on sur I ? Depuis V : parfaite ; depuis IV : plagale. On s’arrête sur V : demi-cadence. V va sur vi : rompue.')}
${method(['Trouve les deux derniers accords de la phrase.', 'Donne leur degré dans la tonalité (I, IV, V, vi…).', 'Lis la cadence : <b>V → I</b> parfaite · <b>… → V</b> demi-cadence · <b>IV → I</b> plagale · <b>V → vi</b> rompue.'])}
${worked('Exemple résolu : sol 7 → la mineur, en do majeur', method(['Sol 7 est le V7 de do ; la mineur, le vi.', 'V → vi : on attendait I.']), 'Cadence rompue.')}
${W.check({ questions: [
  { q: 'En do majeur, une phrase finit par <b>sol → do</b> (état fondamental, do en haut).', options: ['parfaite', 'plagale', 'demi-cadence', 'rompue'], why: 'V → I : le point final.' },
  { q: 'En do majeur : <b>do → fa → sol</b>, et la phrase s’arrête.', options: ['demi-cadence', 'parfaite', 'plagale', 'rompue'], why: 'Elle s’arrête sur V : une virgule.' },
  { q: 'En do majeur : <b>fa → do</b> à la fin.', options: ['plagale', 'parfaite', 'rompue', 'demi-cadence'], why: 'IV → I : l’« amen ».' },
  { q: 'En fa mineur : <b>do 7 → ré♭ majeur</b>.', options: ['rompue', 'parfaite', 'plagale', 'demi-cadence'], why: 'V7 → VI : on attendait fa mineur. C’est exactement ce que fait ta coda à la mesure 79.' },
] })}
${W.more('Le 6/4 de cadence, juste avant V', '<p>Avant la dominante d’une cadence, on trouve souvent l’accord de tonique au 2<sup>e</sup> renversement (I6/4) : sa basse est déjà la dominante. Il fait partie de la dominante (leçon « Degrés et fonctions ») : i6/4 – V7 – i reste une cadence parfaite. C’est celle des mesures 7-8 de ton nocturne.</p>')}

<h2>Dans ta pièce : la fin (mesures 97 à 101) et toutes les cadences</h2>
${idea('La cadence finale enchaîne une sous-dominante assombrie, la dominante, puis la lumière de <b>fa majeur</b> : une cadence parfaite, mais en majeur, après toute une pièce en mineur.')}
${W.spot({ abc: OP55.e10, title: 'Sur la partition : la cadence finale', tasks: [
  { q: 'Mesure 98 : touche l’accord de <b>dominante</b> de la cadence.', targets: [{ bar: 98, beat: 3 }], why: 'Do 7 (do, mi♮, si♭, à la basse do) : le V7, qui appelle fa.' },
  { q: 'Mesure 99 : touche l’accord d’<b>arrivée</b>.', targets: [{ bar: 99, beat: 1 }], why: 'Fa majeur : V7 → I, une cadence parfaite. La pièce finit en majeur.' },
  { q: 'Mesure 99 : la note qui rend cet accord <b>majeur</b> est écrite avec un bécarre. Touche-la (main droite).', targets: [{ bar: 99, note: 'la', hand: 'rh' }], why: 'La♮ : la tierce majeure de fa. Dans toute la pièce, on avait la♭ ; ce la♮ final s’appelle une « tierce picarde ».' },
] })}
<table>
<thead><tr><th>Mesures</th><th>Cadence</th></tr></thead>
<tbody>
<tr><td>7-8 (et 15-16)</td><td>i6/4 – V7 – i : cadence parfaite, fin du thème</td></tr>
<tr><td>24 (et 40)</td><td>arrêt sur do 7, au-dessus de la pédale de do : demi-cadence</td></tr>
<tr><td>31-32, 47-48</td><td>cadences parfaites, fins des retours du thème</td></tr>
<tr><td>72</td><td>point d’orgue sur do 7 : demi-cadence, suspension avant le retour</td></tr>
<tr><td>79</td><td>do 7 → ré♭ : cadence rompue, la coda repart</td></tr>
<tr><td>80-81, 84-85</td><td>6/4 de cadence – V – i, dans la coda</td></tr>
<tr><td>98-99</td><td>V7 – I : cadence parfaite finale, en fa majeur</td></tr>
</tbody></table>
${W.check({ questions: [
  { q: 'Mesure 24, la phrase b s’arrête sur <b>do 7</b>, puis le thème revient. Quelle cadence ?', options: ['demi-cadence', 'parfaite', 'rompue', 'plagale'], why: 'Arrêt sur V : une question, à laquelle répond le retour du thème.' },
  { q: 'Au piano, comment jouer une demi-cadence comme celle de la mesure 24 ?', options: ['en laissant la phrase en suspens, sans conclure', 'en concluant fort, comme une fin', 'en accélérant vers la suite'], why: 'Une virgule : on respire, on ne referme pas. Le vrai point viendra plus tard.' },
] })}
${W.score({ abc: OP55.e10, title: 'Mesures 97 à 101, à écouter', bpm: 56, startBpm: 46 })}
<h3>Pour t’entraîner</h3>
${W.quiz({ kind: 'cadences', title: 'À l’oreille : les quatre cadences', count: 10, stat: 'cad' })}
`,
  },

  {
    id: 'n1-th-etrangeres', minutes: 25, steps: true,
    title: 'Les notes étrangères',
    summary: 'Une mélodie faite seulement des notes de l’accord serait un arpège. Ce qui la fait chanter, ce sont les notes étrangères : passages, broderies, appoggiatures, retards. Les reconnaître, c’est savoir lesquelles alléger et lesquelles appuyer.',
    goals: ['Distinguer les notes de l’accord des notes étrangères.', 'Reconnaître note de passage, broderie, appoggiature, retard et pédale.', 'En tirer le phrasé : alléger passages et broderies, appuyer appoggiatures et retards.'],
    goal: 'tu nommes les notes étrangères des mesures 1 à 8 de ta pièce, et ton jeu allège les broderies et appuie les appoggiatures.',
    body: W => `
<p>Tu sais nommer les accords et leur rôle. Reste la mélodie : pourquoi certaines de ses notes demandent un appui, et d’autres de la légèreté ? La réponse tient à leur rapport avec l’accord du moment.</p>

<h2>Notes de l’accord, notes étrangères</h2>
${idea('Au-dessus d’un accord, certaines notes de la mélodie lui <b>appartiennent</b> : elles sont stables. Les autres sont <b>étrangères</b> à l’accord : elles frottent un peu, et c’est ce frottement qui donne vie à la mélodie.')}
${W.ecoute({ title: 'Avec ou sans : la note étrangère fait chanter', bpm: 60, items: [
  { label: 'Sans note étrangère', seq: ['do2 sol2 mi3:2 | sol1 sol2 fa3:2 | do2 sol2 mi3:3', 'mi4:2 | si3:2 | do4:3'], note: 'Juste, mais neutre : chaque note appartient à l’accord.' },
  { label: 'Avec une appoggiature (do → si)', seq: ['do2 sol2 mi3:2 | sol1 sol2 fa3:2 | do2 sol2 mi3:3', 'mi4:2 | do4:1 | si3:1 | do4:3'], note: 'Le do frotte sur l’accord de sol 7, puis glisse sur si : un soupir.' },
] })}
${method(['Repère l’accord du moment (à la main gauche, ou en rangeant les notes en tierces).', 'Pour chaque note de la mélodie : est-elle dans l’accord ?', 'Si non, c’est une note étrangère : regarde d’où elle vient, où elle va, et si elle tombe sur un temps.'])}
${W.check({ questions: [
  { q: 'Accord de do majeur (do – mi – sol), mélodie <b>mi – fa – sol</b>. Quelle note est étrangère ?', options: ['fa', 'mi', 'sol'], why: 'Mi et sol sont dans l’accord ; fa n’y est pas.' },
  { q: 'Accord de sol 7 (sol – si – ré – fa), mélodie <b>do – si</b>. Quelle note est étrangère ?', options: ['do', 'si'], why: 'Si est dans l’accord ; do n’y est pas. Il se résout sur si.' },
] })}

<h2>Entre les temps : note de passage et broderie</h2>
${idea('La <b>note de passage</b> relie deux notes de l’accord par un petit pas (mi – <b>fa</b> – sol). La <b>broderie</b> quitte une note de l’accord vers sa voisine et y revient (sol – <b>la</b> – sol). Toutes deux tombent entre les appuis : <b>elles s’allègent</b>.')}
${W.score({ abc: NONCHORD, title: 'Les notes étrangères, en do majeur', bpm: 66, caption: 'Mesure 1 : fa, note de passage entre mi et sol. Mesure 2 : la, broderie de sol. Les mesures suivantes : appoggiature, puis retard (étape suivante).' })}
${W.ecoute({ title: 'Broderie et passage', bpm: 60, items: [
  { label: 'Avec broderie et passage', seq: ['do2 sol2 mi3:2 | sol1 sol2 fa3:2 | do2 sol2 mi3:3', 'mi4:0.5 | fa4:0.5 | mi4:0.5 | ré4:0.5 | si3:0.5 | do4:0.5 | ré4:1 | do4:3'], note: 'Mi – fa – mi : une broderie ; si – do – ré : un passage. Les notes d’appui restent sur les temps.' },
] })}
${W.notion({ id: 'passage-broderie', title: 'Note de passage et broderie', short: 'entre les temps, par petits pas ; on les allège', text: '<ul><li><b>Note de passage</b> : relie deux notes de l’accord par degrés (mi – fa – sol).</li><li><b>Broderie</b> : quitte une note de l’accord vers sa voisine et y revient (sol – la – sol).</li></ul><p>Toutes deux tombent en général entre les temps : <b>plus légères</b> que les notes qu’elles ornent.</p>', cards: [
  { id: 'fact:n1-th-etrangeres:1', q: 'Comment jouer une broderie ?', a: ['plus légère que la note principale qu’elle orne', 'plus fort, pour qu’on l’entende', 'détachée', 'en ralentissant'], why: 'Seule la note principale compte ; la broderie l’habille.' },
  ['Do – ré – mi sur l’accord de do (do – mi – sol) : ré est…', ['une note de passage', 'une broderie', 'une appoggiature', 'un retard'], 'Il relie deux notes de l’accord (do et mi) par degrés.'],
  ['Sol – la – sol sur l’accord de do : la est…', ['une broderie', 'une note de passage', 'un retard', 'une pédale'], 'Il quitte sol et y revient.'],
] })}

<h2>Sur le temps : appoggiature et retard</h2>
${idea('L’<b>appoggiature</b> est une note étrangère posée <b>sur le temps</b>, qui se résout par un petit pas : elle s’appuie, sa résolution se pose. Le <b>retard</b>, c’est une note de l’accord précédent <b>tenue</b> pendant le changement d’accord : elle devient étrangère, puis descend se résoudre.')}
${W.ecoute({ title: 'Appoggiature ou retard', bpm: 60, items: [
  { label: 'Appoggiature (do attaqué sur sol 7)', seq: ['do2 sol2 mi3:2 | sol1 sol2 fa3:2 | do2 sol2 mi3:3', 'mi4:2 | do4:1 | si3:1 | do4:3'], note: 'Le do arrive sur le temps, frotte, puis glisse vers si. On appuie le do, on allège le si.' },
  { label: 'Retard (do tenu depuis l’accord précédent)', seq: ['do2 sol2 mi3:2 | sol1 sol2 fa3:2 | do2 sol2 mi3:3', 'mi4:1 | do4:2 | si3:1 | do4:3'], note: 'Le do vient de l’accord de do, reste quand l’harmonie change, puis se résout : la dissonance est préparée.' },
] })}
${trap('l’appoggiature et la note de passage se ressemblent (un petit pas), mais pas au même endroit : l’appoggiature est <b>sur le temps</b>, la note de passage <b>entre</b> les temps. Cela change tout au jeu : l’une s’appuie, l’autre s’efface.')}
${W.notion({ id: 'appog-retard', title: 'Appoggiature et retard', short: 'sur le temps, résolus par un petit pas ; on les appuie', text: '<ul><li><b>Appoggiature</b> : étrangère, attaquée sur le temps, résolue par degré. On l’appuie, la résolution se pose.</li><li><b>Retard</b> : note de l’accord précédent, tenue sur le nouvel accord, qui se résout en descendant.</li></ul>', cards: [
  { id: 'fact:n1-th-etrangeres:0', q: 'Où se place une appoggiature ?', a: ['sur le temps, puis elle se résout', 'entre les temps', 'à la basse, tenue', 'toujours à la fin d’une phrase'], why: 'Elle s’appuie ; sa résolution se pose.' },
  { id: 'fact:n1-th-etrangeres:2', q: 'Qu’est-ce qu’un retard ?', a: ['une note de l’accord précédent, tenue, qui se résout ensuite', 'une note jouée en retard', 'un ralentissement', 'une note répétée à la basse'], why: 'La dissonance est préparée par l’accord précédent.' },
  ['Une note étrangère attaquée sur le temps et résolue par degré est…', ['une appoggiature', 'une note de passage', 'une broderie', 'une pédale'], 'L’appoggiature est sur le temps ; passage et broderie sont entre les temps.'],
] })}

<h2>La pédale : une basse qui ne bouge pas</h2>
${idea('Une <b>pédale</b>, c’est une note tenue (ou répétée) à la basse pendant que les accords changent au-dessus. Sur la dominante, elle crée l’<b>attente</b> ; sur la tonique, elle installe le <b>repos</b>.')}
${W.ecoute({ title: 'Une pédale de tonique', bpm: 66, items: [
  { label: 'Do tenu à la basse', seq: 'do2 mi3 sol3 do4 | do2 fa3 la3 do4 | do2 fa3 sol3 si3 | do2 mi3 sol3 do4:2', note: 'Au-dessus, do, fa, sol 7, do ; la basse do ne bouge pas : tout reste ancré.' },
] })}
${W.notion({ id: 'pedale', title: 'La pédale', short: 'une basse tenue sous des accords qui changent', text: '<p>Une note tenue ou répétée, souvent à la basse, pendant que les accords changent au-dessus. <b>Pédale de dominante</b> : l’attente (ta pièce, mesures 21 à 24). <b>Pédale de tonique</b> : le repos (mesures 85 à 96).</p>', cards: [
  { id: 'fact:n1-th-etrangeres:3', q: 'Qu’est-ce qu’une pédale (harmonique) ?', a: ['une note tenue, souvent à la basse, sous des accords qui changent', 'la pédale de droite du piano', 'une note répétée dans la mélodie', 'un accord tenu très longtemps'], why: 'Sur la dominante, elle crée l’attente ; sur la tonique, le repos.' },
  ['Une pédale de dominante crée…', ['une attente : on attend le retour de la tonique', 'un repos', 'une modulation', 'un ralentissement'], 'Comme aux mesures 21 à 24 de ta pièce, avant le retour du thème.'],
] })}

<h2>Ce que ça change au jeu</h2>
${idea('Chaque note étrangère dit comment la jouer : <b>alléger</b> ce qui passe (passages, broderies), <b>appuyer</b> ce qui frotte sur le temps (appoggiatures, retards), et <b>soutenir</b> la pédale.')}
${W.check({ questions: [
  { q: 'Une note de passage, au piano :', options: ['plus légère que les notes qu’elle relie', 'accentuée', 'tenue plus longtemps'], why: 'Elle relie deux notes d’appui ; elle ne doit pas les concurrencer.' },
  { q: 'Une appoggiature, au piano :', options: ['un appui, puis une résolution plus douce', 'très légère, comme une broderie', 'détachée de sa résolution'], why: 'Le frottement est le moment expressif ; la résolution est un soupir.' },
  { q: 'Une basse en pédale, sous des accords qui changent :', options: ['tenue jusqu’au bout, sans la laisser s’éteindre trop tôt', 'rejouée à chaque accord, fort', 'jouée très doucement puis lâchée'], why: 'C’est le socle de tout le passage.' },
] })}

<h2>Dans ta pièce : mesures 1 à 8</h2>
${idea('Les premières mesures de ton nocturne contiennent presque toutes les sortes de notes étrangères. Compare chaque note de la mélodie à l’accord de la main gauche.')}
${W.spot({ abc: OP55.e1, title: 'Sur la partition : mesures 1 et 2', tasks: [
  { q: 'Mesure 1 : sur l’accord de mi♭ majeur (3<sup>e</sup> et 4<sup>e</sup> temps), touche la <b>note de passage</b> de la mélodie.', targets: [{ bar: 1, beat: 4, note: 'ré♭4', hand: 'rh' }], why: 'Ré♭ n’appartient pas à mi♭ majeur (mi♭ – sol – si♭) ; il relie mi♭ à do, par degrés, sur un temps faible : une note de passage, à alléger.' },
  { q: 'Mesure 2 : la mélodie tourne autour de do (accord de la♭ majeur). Touche la <b>broderie inférieure</b>.', targets: [{ bar: 2, beat: 1, note: 'si3', hand: 'rh' }], why: 'Si♮ : la voisine juste sous do, entre deux do. Une broderie, très légère.' },
  { q: 'Mesure 2 : touche la <b>broderie supérieure</b>.', targets: [{ bar: 2, beat: 2, note: 'ré♭4', hand: 'rh' }], why: 'Ré♭ : la voisine juste au-dessus de do, qui y revient aussitôt.' },
] })}
${W.spot({ abc: OP55.e2, title: 'Sur la partition : mesure 7', tasks: [
  { q: 'Mesure 7 : sur l’accord de do 7 (3<sup>e</sup> temps), la mélodie attaque une note étrangère, puis descend d’un degré. Touche-la.', targets: [{ bar: 7, beat: 3, note: 'la♭3', hand: 'rh' }], why: 'La♭ sur do 7 : une appoggiature de sol, attaquée sur le temps (avec l’accord arpégé), résolue sur sol. On l’appuie, le sol se pose.' },
] })}
<ul>
<li><b>Mesure 17</b> : à la main gauche, le la♭ tenu sur l’accord de mi♭ 7 est un <b>retard</b>, qui descend vers sol.</li>
<li><b>Mesures 21 à 24</b> : une <b>pédale de dominante</b> (do tenu à la basse) ; <b>mesures 85 à 96</b> : une <b>pédale de tonique</b> (fa).</li>
<li><b>Mesures 57 à 60</b> : la mélodie ornée multiplie les broderies (ré♭ – do – ré♭, ré♭ – mi♭ – ré♭).</li>
</ul>
${W.score({ abc: OP55.e2, title: 'Mesures 5 à 8, à écouter', bpm: 56, startBpm: 46 })}
${W.exo('Au piano', '<p>Joue la main droite des mesures 1 à 8 en allégeant les notes de passage et les broderies, et en appuyant l’appoggiature de la mesure 7. Enregistre-toi : la mélodie doit sembler respirer sur les notes d’appui.</p>')}
`,
  },

  {
    id: 'n1-th-synthese', minutes: 25, steps: true,
    title: 'Synthèse : le plan de l’op. 55 n° 1',
    summary: 'Aucune notion nouvelle : tu assembles tout ce que tu sais pour lire ta pièce entière comme une carte. Où sont les sections, où va la musique, où elle respire : c’est ce qui permet de la jouer avec un plan, et de la retenir.',
    goals: ['Connaître le plan de la pièce : sections, tonalités, cadences.', 'Analyser un passage avec quatre questions.', 'Se servir du plan pour doser le jeu et pour mémoriser.'],
    goal: 'tu racontes de mémoire le plan de la pièce (sections, tonalités, cadences) et tu repars sans hésiter du début de n’importe quelle section.',
    body: W => `
<p>Dernière leçon du niveau, et rien de nouveau à apprendre : tu as déjà tous les outils. Il s’agit de les poser ensemble sur ta pièce entière, pour la voir comme une carte : où sont les sections, où va la musique, où elle respire.</p>

<h2>Le plan : des sections qui reviennent</h2>
${idea('Une pièce se découpe en <b>sections</b>, comme un texte en paragraphes. Deux indices les signalent : le <b>retour du thème</b>, et les <b>cadences</b> qui ferment les phrases. Ton nocturne a quatre parties : A, le Più mosso, un retour très bref du thème, et la coda.')}
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
] }, 'A (mesures 1 à 48) : le thème a, ses retours ornés (a′ en triolets, a″ avec un septolet) et la phrase b. Più mosso (48 à 72). Retour bref du thème (73 à 76). Coda (77 à 101). Le même plan, en mots et section par section, est dans <a href="#/piece/op55-1">la carte de ta pièce</a>.')}
${W.check({ title: 'À toi : lis le plan', questions: [
  { q: 'Entre les mesures 1 et 48, combien de fois entends-tu le thème a, avec ses variantes ?', options: ['4 fois : a, a, a′, a″', '2 fois', '6 fois'], why: 'a (1-8), a (9-16), a′ (25-32), a″ (41-48). Entre eux, deux fois la phrase b.' },
  { q: 'Où commence le Più mosso ?', options: ['mesure 48', 'mesure 25', 'mesure 73'], why: 'La mesure 48 est partagée : son premier accord conclut a″, la suite lance le Più mosso.' },
  { q: 'Après le Più mosso, le thème revient. Pour combien de temps ?', options: ['4 mesures seulement (73 à 76)', 'toute la section A, 48 mesures', 'il ne revient pas'], why: 'Un retour bref : la coda prend aussitôt le relais, mesure 77.' },
] })}
${W.notion({ id: 'plan-op55', title: 'Le plan de ton nocturne', short: 'A (1-48) – Più mosso (48-72) – retour du thème (73-76) – coda (77-101)', text: '<ul><li><b>A</b> (mesures 1 à 48) : a, a, b, a′ (triolets), b, a″ (septolet).</li><li><b>Più mosso</b> (48 à 72) : plus animé ; il module.</li><li><b>Retour du thème</b> (73 à 76), très bref.</li><li><b>Coda</b> (77 à 101) : de fa mineur à fa majeur.</li></ul>', cards: [
  ['Quelles sont les grandes parties de l’op. 55 n° 1 ?', ['A – Più mosso – retour bref du thème – coda', 'A – B – A – B', 'introduction – thème – trois variations', 'A – coda'], 'A (1-48), Più mosso (48-72), retour (73-76), coda (77-101).'],
  ['Dans la section A, dans quel ordre viennent les phrases ?', ['a – a – b – a′ – b – a″', 'a – b – a – b – a – b', 'a – a′ – a″ – b – b', 'a – b – c – a'], 'Le thème a, chaque fois plus orné, alterne avec la phrase b.'],
  ['Où commence la coda ?', ['mesure 77', 'mesure 48', 'mesure 89', 'mesure 97'], 'Juste après le retour bref du thème (73-76).'],
] })}

<h2>Analyser un passage : quatre questions</h2>
${idea('Pour analyser n’importe quel passage, pose toujours les mêmes <b>quatre questions</b>, dans l’ordre. Chacune reprend une leçon du niveau : tu sais déjà y répondre.')}
${method(['<b>Quelle tonalité ?</b> L’armure, puis les altérations qui reviennent : une sensible désigne la tonique.', '<b>Quels accords ?</b> La basse des temps forts, et les notes de la main gauche rangées en tierces.', '<b>Comment finit la phrase ?</b> Les deux derniers accords : la cadence.', '<b>Qu’est-ce qui orne la mélodie ?</b> Les notes étrangères : celles qu’on allège, celles qu’on appuie.'])}
${worked('Exemple résolu : la fin du thème, mesures 5 à 8', method([
  '<b>Tonalité</b> : quatre bémols, et un mi♮ à la mesure 7, la sensible de fa : <b>fa mineur</b>.',
  '<b>Accords</b> : mesures 5-6 comme au début (fa mineur, mi♭, la♭), puis sol♭ majeur ; mesure 7, fa mineur posé sur do, puis do 7 ; mesure 8, fa mineur.',
  '<b>Cadence</b> : i6/4 – V7 – i, une <b>cadence parfaite</b>.',
  '<b>Ornements</b> : une trille (mesure 6) ; une appoggiature, la♭ qui descend sur sol (mesure 7).',
]), 'Une phrase en fa mineur, fermée par un point. Mesure 9, le thème recommence.')}
${W.spot({ abc: OP55.e2, title: 'Sur la partition : les quatre questions, mesures 5 à 8', tasks: [
  { q: '<b>Tonalité</b> : mesure 7, touche l’altération de la main droite qui confirme fa mineur.', targets: [{ bar: 7, note: 'mi3', hand: 'rh' }], why: 'Mi♮, dans l’accord arpégé : la sensible de fa. Avec quatre bémols à l’armure, c’est fa mineur.' },
  { q: '<b>Accords</b> : mesure 7, touche la basse du <b>6/4 de cadence</b>.', targets: [{ bar: 7, beat: 1, hand: 'lh' }], why: 'Do à la basse, fa mineur au-dessus (la♭ – do – fa) : i6/4, une dominante déguisée.' },
  { q: '<b>Cadence</b> : touche la basse de l’accord d’arrivée.', targets: [{ bar: 8, beat: 1, hand: 'lh' }], why: 'Fa : i6/4 – V7 – i, une cadence parfaite. Le thème se ferme.' },
  { q: '<b>Ornements</b> : mesure 6, touche la note ornée d’une <b>trille</b>.', targets: [{ bar: 6, beat: 3, note: 'si♭3', hand: 'rh' }], why: 'Si♭, au-dessus de sol♭ majeur, l’accord le plus sombre de la phrase. La trille orne une note de l’accord : sans presser, terminée par ses deux petites notes (la♮ – si♭).' },
] })}
${W.score({ abc: OP55.e2, title: 'Mesures 5 à 8 : vérifie avec l’analyse', bpm: 56, startBpm: 46 })}
${W.notion({ id: 'analyse-4-questions', title: 'Analyser un passage en quatre questions', short: 'tonalité ? accords ? cadence ? ornements ?', text: '<ol><li><b>Tonalité</b> : l’armure, puis la sensible.</li><li><b>Accords</b> : la basse des temps forts, les notes rangées en tierces.</li><li><b>Cadence</b> : les deux derniers accords de la phrase.</li><li><b>Ornements</b> : les notes étrangères, à alléger ou à appuyer.</li></ol>', cards: [
  ['Quelles sont les quatre questions pour analyser un passage ?', ['tonalité, accords, cadence, ornements', 'tempo, nuances, doigtés, pédale', 'mesure, rythme, notes, clés', 'thème, variation, coda, reprise'], 'Où est-on, avec quels accords, comment finit la phrase, qu’est-ce qui l’orne.'],
  ['Pour trouver la tonalité d’un passage, que regarde-t-on ?', ['l’armure, puis les altérations qui reviennent (la sensible)', 'la première note de la mélodie', 'la dernière note de la main droite', 'le chiffre de mesure'], 'Quatre bémols et des mi♮ : fa mineur.'],
] })}

<h2>Le voyage des tonalités</h2>
${idea('À grande échelle, une pièce fait comme une phrase : elle part de sa tonalité, <b>s’en éloigne</b> vers des tonalités voisines, puis <b>revient</b>. Pour suivre le voyage sans tout analyser, guette les <b>sensibles</b> : une altération étrangère à l’armure, qui revient, annonce une nouvelle tonique.')}
<table>
<thead><tr><th>Section</th><th>Tonalités</th><th>Le panneau indicateur</th></tr></thead>
<tbody>
<tr><td>a (1-16, 25-32, 41-48)</td><td>fa mineur</td><td>mi♮, la sensible de fa</td></tr>
<tr><td>b (17-24, 33-40)</td><td>la♭ majeur, puis do mineur, puis retour</td><td>plus de mi♮ ; puis ré♮ et si♮, la sensible de do</td></tr>
<tr><td>Più mosso (48-72)</td><td>fa mineur → do mineur → sol mineur, puis retour en fa mineur (57)</td><td>mi♮, puis si♮, puis fa♯ : une marche modulante</td></tr>
<tr><td>Coda (77-101)</td><td>fa mineur, puis fa majeur (dès la mesure 89)</td><td>la♮ : la tierce de fa devient majeure</td></tr>
</tbody></table>
${W.check({ title: 'À toi : lis les panneaux', questions: [
  { q: 'Quatre bémols à l’armure, et des <b>si♮</b> qui reviennent. Vers quelle tonalité est-on parti ?', options: ['do mineur', 'sol mineur', 'fa mineur'], why: 'Si♮ est la sensible de do : do mineur, la tonalité de la dominante (mesures 18-19, puis 51-52).' },
  { q: 'Même armure, et des <b>fa♯</b> apparaissent. Et maintenant ?', options: ['sol mineur', 'do mineur', 'fa majeur'], why: 'Fa♯ est la sensible de sol : le Più mosso arrive en sol mineur (mesures 55-56).' },
  { q: 'Même armure, plus aucun mi♮ ; mi♭ 7 se résout sur un accord de la♭. Où est-on ?', options: ['la♭ majeur, le relatif', 'fa mineur', 'do mineur'], why: 'Mi♭ 7 – la♭ : V7 – I de la♭ majeur, le relatif de fa mineur (mesures 17-18).' },
  { q: 'Dans la coda, des <b>la♮</b> remplacent les la♭. Qu’est-ce que cela signifie ?', options: ['on passe en fa majeur', 'on module en la mineur', 'c’est une faute de gravure'], why: 'La tierce de fa devient majeure : fa majeur, jusqu’à la dernière mesure.' },
] })}
${W.notion({ id: 'plan-tonal', title: 'Le voyage des tonalités', short: 'a : fa m ; b : la♭ M puis do m ; Più mosso : fa m → do m → sol m ; coda : fa m → fa M', text: '<ul><li><b>a</b> : fa mineur (sensible mi♮).</li><li><b>b</b> : la♭ majeur, le relatif, puis do mineur (sensible si♮).</li><li><b>Più mosso</b> : une marche modulante, fa mineur → do mineur → sol mineur (sensible fa♯), puis retour.</li><li><b>Coda</b> : fa mineur, puis <b>fa majeur</b> (la♮) jusqu’à la fin.</li></ul>', cards: [
  ['Vers quelles tonalités va la phrase b (mesures 17 à 24) ?', ['la♭ majeur, puis do mineur', 'sol mineur, puis ré mineur', 'fa majeur', 'si♭ mineur, puis mi♭ majeur'], 'Les deux voisines les plus proches de fa mineur : son relatif (la♭ majeur) et la tonalité de sa dominante (do mineur).'],
  ['Comment repère-t-on une modulation sur la partition ?', ['une altération étrangère à l’armure qui revient : la nouvelle sensible', 'un changement de tempo', 'un changement de clé', 'une nuance forte'], 'Si♮ : vers do ; fa♯ : vers sol ; mi♮ : retour vers fa.'],
  { id: 'fact:n1-th-synthese:2', q: 'Comment finit l’op. 55 n° 1 ?', a: ['en fa majeur : tierce picarde dans la coda', 'sur une demi-cadence', 'en la♭ majeur', 'par le retour complet de la section A'], why: 'La coda (mesures 77 à 101) passe de fa mineur à fa majeur.' },
] })}

<h2>Les respirations : où finissent les phrases</h2>
${idea('Les cadences ponctuent la pièce. Les <b>points</b> (cadences parfaites) ferment le thème ; les <b>virgules</b> (demi-cadences) suspendent la musique juste avant un retour. Les repérer, c’est savoir où respirer, et où ne pas conclure.')}
<table>
<thead><tr><th>Mesures</th><th>Cadence</th><th>Au piano</th></tr></thead>
<tbody>
<tr><td>8, 16, 32, 48</td><td>parfaite (i6/4 – V7 – i) : fins du thème</td><td>un point : on conclut, on respire</td></tr>
<tr><td>24, 40</td><td>demi-cadence sur do 7, au-dessus d’une pédale de do</td><td>une virgule : le thème va revenir</td></tr>
<tr><td>72</td><td>demi-cadence : point d’orgue sur do 7</td><td>la grande attente avant le retour du thème</td></tr>
<tr><td>79</td><td>rompue (do 7 → ré♭)</td><td>une surprise : la coda repart</td></tr>
<tr><td>98-99</td><td>parfaite, en fa majeur</td><td>le point final</td></tr>
</tbody></table>
${W.check({ title: 'À toi : point, virgule ou surprise ?', questions: [
  { q: 'Mesures 7-8 : <b>i6/4 – V7 – i</b>.', options: ['un point (cadence parfaite)', 'une virgule (demi-cadence)', 'une surprise (cadence rompue)'], keepOrder: true, why: 'Le thème se ferme sur la tonique : un point.' },
  { q: 'Mesure 72 : point d’orgue sur <b>do 7</b>.', options: ['un point (cadence parfaite)', 'une virgule (demi-cadence)', 'une surprise (cadence rompue)'], answer: 1, keepOrder: true, why: 'Do 7, le V7 de fa, suspendu : l’oreille attend fa mineur, et le thème revient mesure 73.' },
  { q: 'Mesure 79 : <b>do 7 → ré♭ majeur</b>.', options: ['un point (cadence parfaite)', 'une virgule (demi-cadence)', 'une surprise (cadence rompue)'], answer: 2, keepOrder: true, why: 'On attendait fa mineur, on entend ré♭ (VI) : la coda doit repartir.' },
  { q: 'Mesures 98-99 : <b>do 7 → fa majeur</b>.', options: ['un point (cadence parfaite)', 'une virgule (demi-cadence)', 'une surprise (cadence rompue)'], keepOrder: true, why: 'V7 – I : le point final, en majeur.' },
] })}
${W.notion({ id: 'respirations-op55', title: 'Les respirations de ta pièce', short: 'points : 8, 16, 32, 48, 99 ; virgules : 24, 40, 72 ; surprise : 79', text: '<ul><li><b>Points</b> (cadences parfaites) : fins du thème, mesures 8, 16, 32 et 48 ; point final, mesure 99.</li><li><b>Virgules</b> (demi-cadences sur do 7) : mesures 24 et 40, et le point d’orgue de la mesure 72.</li><li><b>Surprise</b> (cadence rompue) : mesure 79, dans la coda.</li></ul>', cards: [
  { id: 'fact:n1-th-synthese:1', q: 'Sur quel accord s’arrête le Più mosso, mesure 72 ?', a: ['do 7, avec un point d’orgue', 'fa mineur', 'la♭ majeur', 'si♭ mineur'], why: 'La dominante de fa, suspendue : une demi-cadence, et le thème peut revenir (mesure 73).' },
  ['Comment se termine chaque passage du thème a (mesures 8, 16, 32, 48) ?', ['par une cadence parfaite', 'par une demi-cadence', 'par une cadence rompue', 'sans cadence'], 'i6/4 – V7 – i : un point, avant la phrase suivante.'],
  ['Comment se termine la phrase b (mesures 24 et 40) ?', ['par une demi-cadence sur do 7', 'par une cadence parfaite en la♭', 'par une cadence plagale', 'par une cadence rompue'], 'Une virgule : la question, à laquelle répond le retour du thème.'],
] })}

<h2>Jouer avec le plan</h2>
${idea('Le plan sert d’abord au jeu. Une pièce a <b>un seul sommet</b>, et tout le reste se dose par rapport à lui : dans ton nocturne, c’est la fin du Più mosso (mesures 61 à 72). Le thème, lui, reste intime à chacun de ses retours, et ne se joue jamais deux fois pareil.')}
${W.check({ questions: [
  { q: 'Où placer le moment le plus intense de la pièce ?', options: ['à la fin du Più mosso (mesures 61 à 72)', 'dès le thème (mesures 1 à 8)', 'au dernier retour du thème, a″'], why: 'Garde l’énergie pour le Più mosso : si le thème est déjà fort, il n’y a plus de sommet.' },
  { q: 'a, a′, a″ : trois fois le même thème. Au piano…', options: ['chaque retour a sa couleur : a′ plus fluide (triolets), a″ plus libre (septolet)', 'ils doivent sonner exactement pareil', 'chaque retour plus fort que le précédent'], why: 'La main gauche ne change pas ; c’est l’ornement qui change, et ton toucher avec lui.' },
  { q: 'Mesure 8 (cadence parfaite) et mesure 24 (demi-cadence) : la différence au jeu ?', options: ['mesure 8 je conclus ; mesure 24 je laisse en suspens', 'aucune : ce sont deux fins de phrase', 'mesure 24 je conclus plus fort'], why: 'Un point, puis une virgule : on referme le thème, mais la phrase b reste ouverte vers son retour.' },
] })}
${W.spot({ abc: OP55.e5, title: 'Sur la partition : a′, le thème varié', tasks: [
  { q: 'Mesure 27 : la main gauche joue la même chose qu’à la mesure 1. Touche sa basse du temps fort.', targets: [{ bar: 27, beat: 1, hand: 'lh' }], why: 'Fa, puis la♭ – do – fa : fa mineur, exactement comme à la mesure 1.' },
  { q: 'Mesure 27 : touche une note du premier <b>triolet</b> de la mélodie.', targets: [{ bar: 27, beat: 2, hand: 'rh' }], why: 'Mi♮ – sol – fa : trois notes dans un temps, qui tournent autour du fa du thème. Le même chemin, orné.' },
  { q: 'Mesure 28 : la mélodie arrive sur la même note longue qu’à la mesure 2. Touche-la.', targets: [{ bar: 28, beat: 3, hand: 'rh' }], why: 'Do, comme à la mesure 2 : les ornements changent, les notes d’arrivée restent.' },
] })}
${W.notion({ id: 'analyse-jeu', title: 'Le plan au service du jeu', short: 'un seul sommet ; des retours variés ; conclure aux points, suspendre aux virgules', text: '<ul><li><b>Un seul sommet</b> : la fin du Più mosso (mesures 61 à 72). Tout le reste se dose par rapport à lui.</li><li><b>Varier les retours</b> : a, a′, a″ n’ont pas le même ornement, ni le même toucher.</li><li><b>Suivre la ponctuation</b> : conclure aux cadences parfaites, laisser en suspens les demi-cadences.</li></ul>', cards: [
  { id: 'fact:n1-th-synthese:0', q: 'Où se trouve le sommet de l’op. 55 n° 1 ?', a: ['dans le Più mosso (mesures 61 à 72)', 'au début (mesures 1 à 8)', 'dans la coda', 'au retour du thème (mesures 73 à 76)'], why: 'Le thème reste intime à chacun de ses retours : l’énergie se garde pour le Più mosso.' },
  ['Qu’est-ce qui distingue a′ (mesures 25 à 32) du thème a ?', ['la mélodie, ornée de triolets, sur la même main gauche', 'une nouvelle tonalité', 'une autre main gauche sous la même mélodie', 'un tempo plus rapide'], 'La main gauche et les accords ne changent pas : seule la mélodie s’orne.'],
  ['Comment jouer une demi-cadence, comme à la mesure 24 ?', ['en laissant la phrase en suspens, sans conclure', 'en concluant nettement', 'en accélérant vers la suite', 'en s’arrêtant longuement'], 'Une virgule : on respire, mais la musique continue.'],
] })}

<h2>Mémoriser avec le plan</h2>
${idea('On retient bien mieux une pièce dont on connaît le plan : au lieu de 101 mesures, <b>quatre parties</b> et une dizaine de <b>points de départ</b>. En cas de trou de mémoire, on ne s’arrête pas : on repart au point de départ suivant.')}
${method(['Récite le plan à voix haute, avec les numéros de mesure : A (a, a, b, a′, b, a″), Più mosso, retour, coda.', 'Retiens tes points de départ : les débuts de section, 1, 9, 17, 25, 33, 41, 48, 73, 77.', 'Entraîne-toi à démarrer de chacun, au hasard, sans regarder la partition.', 'Joue les accords d’une section en blocs, en les nommant : la mémoire de l’harmonie tient quand celle des doigts lâche.'])}
${W.check({ questions: [
  { q: 'En jouant de mémoire, trou au milieu de b (mesure 20). Le mieux :', options: ['repartir sans s’arrêter au point de départ suivant, a′ (mesure 25)', 'recommencer la pièce depuis le début', 's’arrêter et chercher la note'], why: 'Un raccourci passe presque inaperçu ; un arrêt, lui, s’entend.' },
  { q: 'Tu joues les mesures 1 à 16 par cœur, mais seulement en partant du début. Que manque-t-il ?', options: ['savoir repartir de la mesure 9, sans les huit mesures d’avant', 'jouer plus vite', 'rien : c’est suffisant'], why: 'Une mémoire qui ne marche que depuis le début est fragile : au moindre accroc, tout s’arrête.' },
] })}
${W.draw({ title: 'Au piano : trois départs au hasard', items: ['mesure 1', 'mesure 9', 'mesure 17', 'mesure 25', 'mesure 33', 'mesure 41', 'mesure 48', 'mesure 73', 'mesure 77'], n: 3, caption: 'Démarre de chaque départ tiré, de mémoire, et joue au moins quatre mesures. Un départ qui hésite : c’est lui qu’il faut travailler.' })}
${W.notion({ id: 'memoriser-plan', title: 'Mémoriser avec le plan', short: 'quatre parties, des points de départ, repartir sans s’arrêter', text: '<p>On retient le <b>plan</b> (A, Più mosso, retour, coda), puis les <b>points de départ</b> (débuts de section : 1, 9, 17, 25, 33, 41, 48, 73, 77). On s’entraîne à démarrer de chacun ; en cas de trou, on repart au suivant.</p>', cards: [
  ['Trou de mémoire en jouant, au milieu d’une section. Que faire ?', ['repartir au point de départ suivant, sans s’arrêter', 'recommencer la pièce depuis le début', 's’arrêter et chercher la note', 'improviser jusqu’à la fin'], 'Les points de départ sont faits pour ça : on n’entend qu’un raccourci.'],
  ['Pourquoi jouer les accords d’une section en blocs, en les nommant ?', ['pour retenir l’harmonie, pas seulement les gestes des doigts', 'pour travailler la vitesse', 'pour échauffer les mains', 'pour régler la pédale'], 'La mémoire des doigts lâche sous le stress ; celle des accords tient.'],
] })}
${W.checklist({ id: 'n1-th-synthese-v6', title: 'Je sais…', items: ['raconter de mémoire le plan de la pièce, avec les numéros de mesure ;', 'dire la tonalité de chaque section, et le panneau qui l’annonce ;', 'montrer sur la partition les points (cadences parfaites) et les virgules (demi-cadences) ;', 'repartir de mémoire de n’importe quel point de départ.'] })}
`,
  },

];
