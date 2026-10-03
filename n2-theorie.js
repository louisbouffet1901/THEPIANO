// Niveau 2 — Théorie : des cours complets, chacun ancré sur le passage travaillé la même semaine
// (op. 15 n° 1, puis Clair de lune). Format : explication, « À retenir », « Erreurs fréquentes »,
// « Dans ta pièce cette semaine » (extraits avec panneau d'analyse), exercices corrigés, quiz.
import { OP15, OP55, CLAIR } from './content-excerpts.js';

/* ---------- Exemples ---------- */
const SEVENTHS = `X:1
M:4/4
L:1/4
K:C
"^7e de dominante"[CEG_B]4 | "^7e majeure"[CEGB]4 | "^7e mineure"[C_EG_B]4 | "^7e demi-diminuée"[C_E_G_B]4 | "^7e diminuée"[C_E_G__B]4 |]`;

const DEGREES7 = `X:1
M:4/4
L:1/4
K:F
"^I maj7"[FAce]4 | "^ii7"[GBdf]4 | "^iii7"[Aceg]4 | "^IV maj7"[Bdfa]4 | "^V7"[cegb]4 | "^vi7"[dfac']4 | "^viiø7"[egbd']4 |]`;

const V7_RES = `X:1
M:4/4
L:1/4
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^V7"[=EBc]2 "^i"[FAc]2 |]
[V:LH] C,2 F,,2 |]`;

const CHAIN_ii_V_I = `X:1
M:4/4
L:1/4
K:F
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^ii7"[FBd]2 "^V7"[EBc]2 | "^I"[FAc]4 |]
[V:LH] G,,2 C,2 | F,,4 |]`;

const DIM7_RES = `X:1
M:4/4
L:1/4
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^vii°7"[GBd]2 "^i"[FAc]2 |]
[V:LH] =E,2 F,2 |]`;

const VOICES_GOOD = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^I"[EGc]2 "^IV"[FAc]2 | "^V7"[FGB]2 "^I"[EGc]2 |]
[V:LH] C,2 F,,2 | G,,2 C,2 |]`;

const VOICES_BAD = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^à éviter"[EGc]2 [FAd]2 | "^mieux"[EGc]2 [DFA]2 |]
[V:LH] C,2 D,2 | C,2 D,2 |]`;

// Op. 15 n° 1, mesures 1 à 8 : la mélodie, la voix en noires et la basse (sans les triolets).
const OP15_VOICES = `X:1
M:3/4
L:1/16
K:F
%%barnumbers 1
%%setbarnb 0
%%score {RH | (T B)}
V:RH clef=treble
V:T clef=bass stem=up
V:B clef=bass stem=down
[V:RH] (c4 | f8 e4 | d4 e4 c4) | (d3e f4 g4 | a12) | (g4 a3g (3g2f2e2 | f6 e2 (3d2e2f2) | (e8 (3e2d2A2 | =B8) (3:2:3(c2d3c) |]
[V:T] z4 | F4 F4 E4 | D4 E4 C4 | D4 E4 C4 | C4 ^C4 D4 | =B,4 _B,4 _B,4 | A,4 A,4 A,4 | ^G,4 A,8 | ^G,4 E4 E4 |]
[V:B] x4 | F,12 | F,12 | F,12 | F,4 E,4 D,4 | D,4 _D,4 C,4 | C,4 =B,,8 | =B,,4 A,,4 F,,4 | E,,8 G,4 |]`;

const SECDOM = `X:1
M:4/4
L:1/4
K:F
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^I"[FAc]2 "^V7/vi"[GA^c]2 | "^vi"[FAd]2 "^V7/V"[F=Bd]2 | "^V7"[E_Bc]2 "^I"[FAc]2 |]
[V:LH] F,2 A,,2 | D,2 G,,2 | C,2 F,,2 |]`;

const MODUL = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^do majeur : I"[Gce]4 | "^IV"[Acf]4 | "^vi"[Ace]4 | [Ac^f]4 | [GBg]4 |]
[V:LH] C,4 | F,4 | "_= sol majeur : ii"A,,4 | "_V7"D,4 | "_I"G,,4 |]`;

/* ---------- Chapitres (première partie) ---------- */
const PART1 = [
  {
    id: 'n2-th1', minutes: 25,
    title: 'Les accords de septième',
    summary: 'Cinq accords de quatre sons : les construire, savoir où ils se trouvent dans une tonalité, les résoudre. L’Andante de l’op. 15 n° 1 en emploie presque à chaque temps.',
    goals: ['Construire les cinq accords de septième.', 'Connaître les septièmes d’une tonalité majeure et mineure.', 'Résoudre une septième : la septième descend, la sensible monte.', 'Nommer les septièmes des mesures 1 à 8 de l’op. 15 n° 1.'],
    body: W => `
<p>Au niveau 1, tu as rencontré la septième de dominante (do 7 en fa mineur) et ses renversements. Ce chapitre élargit : il existe <b>cinq accords de septième</b> courants, et Chopin les emploie presque à chaque temps dans l’Andante que tu commences cette semaine.</p>

<h2>Construire un accord de septième</h2>
<p>On empile <b>trois tierces</b> au-dessus de la fondamentale : fondamentale, tierce, quinte, septième. Le nom de l’accord dit deux choses : la nature de l’accord de trois sons de départ, et la septième ajoutée.</p>
${W.score({ abc: SEVENTHS, title: 'Les cinq accords de septième, sur do', bpm: 60, hands: false, practice: false })}
<table>
<thead><tr><th>Accord</th><th>Construction</th><th>Sur do</th><th>Couleur</th></tr></thead>
<tbody>
<tr><td>7e de dominante</td><td>majeur + 7e mineure</td><td>do – mi – sol – si♭</td><td>tendue, veut avancer</td></tr>
<tr><td>7e majeure</td><td>majeur + 7e majeure</td><td>do – mi – sol – si</td><td>douce, rêveuse</td></tr>
<tr><td>7e mineure</td><td>mineur + 7e mineure</td><td>do – mi♭ – sol – si♭</td><td>souple, peu tendue</td></tr>
<tr><td>7e demi-diminuée</td><td>diminué + 7e mineure</td><td>do – mi♭ – sol♭ – si♭</td><td>sombre, instable</td></tr>
<tr><td>7e diminuée</td><td>diminué + 7e diminuée</td><td>do – mi♭ – sol♭ – si𝄫 (= la)</td><td>dramatique, en suspens</td></tr>
</tbody></table>
${W.kbd({ from: 60, to: 72, title: 'Do 7 (septième de dominante)', marks: [60, 64, 67, 70].map(m => ({ m })), names: 'marks', flats: true, play: ['chord', 'arp'], caption: 'Le triton mi – si♭, au cœur de l’accord, lui donne son besoin de se résoudre.' })}

<h2>Les septièmes d’une tonalité</h2>
<p>Ajoute une septième (prise dans la gamme) à chaque accord de la tonalité :</p>
${W.score({ abc: DEGREES7, title: 'Les accords de septième de fa majeur', bpm: 56, hands: false, practice: false })}
<table>
<thead><tr><th></th><th>7e de dominante</th><th>7e majeure</th><th>7e mineure</th><th>demi-diminuée</th><th>diminuée</th></tr></thead>
<tbody>
<tr><td>en majeur</td><td>V7</td><td>I, IV</td><td>ii, iii, vi</td><td>vii</td><td>—</td></tr>
<tr><td>en mineur (harmonique)</td><td>V7</td><td>VI</td><td>iv</td><td>ii</td><td>vii</td></tr>
</tbody></table>
<p>En fa mineur : iiø7 = sol – si♭ – ré♭ – fa ; iv7 = si♭ – ré♭ – fa – la♭ ; V7 = do – mi♮ – sol – si♭ ; VI maj7 = ré♭ – fa – la♭ – do ; vii°7 = mi♮ – sol – si♭ – ré♭. Une seule septième de dominante par tonalité, sur le 5e degré : en mineur, il faut la sensible (mi♮).</p>

<h2>Résoudre une septième</h2>
<p>La septième est une <b>dissonance</b> : elle ne reste pas en place, elle <b>descend d’un degré</b>. Dans la septième de dominante, une seconde note a une direction : la <b>tierce</b>, qui est la sensible, <b>monte</b> vers la tonique. Le triton se resserre ainsi sur une tierce.</p>
${W.score({ abc: V7_RES, title: 'V7 → i en fa mineur', bpm: 50, caption: 'Mi♮ monte vers fa, si♭ descend vers la♭, do reste en place ; à la basse, do va à fa.' })}
<p>Dans la formule <b>ii7 – V7 – I</b>, la plus courante des cadences, chaque septième descend sur la tierce de l’accord suivant :</p>
${W.score({ abc: CHAIN_ii_V_I, title: 'ii7 – V7 – I en fa majeur', bpm: 50, caption: 'Fa, septième de sol m7, descend sur mi, tierce de do 7 ; si♭, septième de do 7, descend sur la, tierce de fa. Les notes communes restent en place : si♭ (de sol m7 à do 7), do (de do 7 à fa).' })}

<h2>La septième diminuée</h2>
<p>Trois tierces mineures superposées : elle partage l’octave en quatre parts égales. Conséquences : il n’en existe que <b>trois</b> différentes au clavier, et chacune peut se résoudre vers plusieurs tonalités selon la façon dont on l’écrit. On la trouve sur le 7e degré du mineur harmonique (vii°7), où elle joue le rôle d’une dominante sans fondamentale.</p>
${W.score({ abc: DIM7_RES, title: 'vii°7 → i en fa mineur', bpm: 50, caption: 'Toutes les voix bougent d’un degré : mi♮ monte vers fa ; sol, si♭ et ré♭ descendent.' })}

<h2>La septième demi-diminuée</h2>
<p>Accord diminué + septième mineure. En majeur, c’est le viiø7 (si – ré – fa – la en do) ; en mineur, c’est le <b>iiø7</b>, qui prépare la dominante (sol – si♭ – ré♭ – fa → do 7 en fa mineur). Chopin l’emprunte volontiers au mode mineur en plein majeur : c’est l’ombre de la mesure 5 de l’op. 15.</p>

${W.key('À retenir', '<ul><li>Septième = accord de trois sons + une tierce. Cinq types : de dominante, majeure, mineure, demi-diminuée, diminuée.</li><li>Une seule septième de dominante par tonalité : V7 (en mineur, avec la sensible).</li><li>La septième descend ; la sensible monte.</li><li>ii7 – V7 – I (en mineur iiø7 – V7 – i) : la cadence la plus courante.</li><li>La septième diminuée divise l’octave en tierces mineures : trois accords seulement.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Confondre 7e de dominante et 7e majeure : écoute l’écart entre la septième et l’octave, un ton (7e mineure) ou un demi-ton (7e majeure).</li><li>Appeler « diminué » un accord demi-diminué : regarde la septième, mineure (demi-diminué) ou diminuée (diminué).</li><li>Oublier l’armure : en fa majeur, sol – si – ré – fa s’écrit avec si♭ (sol m7, un ii7), pas si♮ (sol 7).</li></ul>')}

<h2>Dans ta pièce cette semaine : op. 15 n° 1, mesures 1 à 8</h2>
<p>Ouvre le panneau « Analyse » sous la partition et joue les accords en blocs. En huit mesures, on trouve :</p>
<ul>
<li><b>des septièmes de dominante</b> : do 7 (mesures 2, 3, 5 et 8), mais aussi la 7 (mesure 4), sol 7 (mesure 5) et mi 7 (mesure 7), qui sont les dominantes d’autres degrés (chapitre suivant) ;</li>
<li><b>une septième mineure</b> : sol – si♭ – ré – fa (mesure 3), le ii7 de fa majeur, au-dessus de la pédale de fa ;</li>
<li><b>des septièmes demi-diminuées</b> : sol – si♭ – ré♭ – fa (mesure 5), empruntée à fa mineur, et si – ré – fa – la (mesures 6 et 7), le iiø7 de la mineur.</li>
</ul>
${W.score({ abc: OP15.e1, title: 'Op. 15 n° 1, mesures 1 à 8', bpm: 66, startBpm: 56 })}
<p>Aux mesures 3 et 4, tu entends exactement la formule ii7 – V7 – I : sol m7, do 7, fa. Dans les triolets de la main gauche, le si♭ (septième de do 7) descend sur la (tierce de fa) au début de la mesure 4, pendant que la mélodie monte vers son sommet.</p>

<h2>Exercices</h2>
${W.exo('Exercice 1 — Construire', '<p>Écris : sol 7 ; ré m7 ; si♭ maj7 ; fa♯ ø7 (demi-diminué) ; do♯ °7 (diminué).</p><details><summary>Corrigé</summary><div><p>Sol – si – ré – fa ; ré – fa – la – do ; si♭ – ré – fa – la ; fa♯ – la – do – mi ; do♯ – mi – sol – si♭.</p></div></details>')}
${W.exo('Exercice 2 — Reconnaître', '<p>Nomme : (a) mi – sol♯ – si – ré ; (b) la – do – mi – sol ; (c) si – ré – fa – la♭ ; (d) mi♭ – sol – si♭ – ré ; (e) ré – fa – la♭ – do.</p><details><summary>Corrigé</summary><div><p>(a) mi 7, septième de dominante ; (b) la m7 ; (c) si °7, septième diminuée ; (d) mi♭ maj7 ; (e) ré ø7, demi-diminuée.</p></div></details>')}
${W.exo('Exercice 3 — Situer et résoudre', '<p>(a) De quelle(s) tonalité(s) do 7 est-il la dominante ? (b) Joue sol 7 → do majeur : quelle note monte, quelle note descend ?</p><details><summary>Corrigé</summary><div><p>(a) Fa majeur et fa mineur : V7 est le même dans les deux modes. (b) Si (la sensible) monte vers do ; fa (la septième) descend vers mi ; ré va vers do (ou mi), sol reste ou va à do.</p></div></details>')}
${W.quiz({ kind: 'chordsight', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'], inversions: [0], title: 'Sur la portée : quelle septième ?', count: 10, stat: 'chs7' })}
${W.quiz({ kind: 'chords', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'], title: 'À l’oreille : accords de septième', count: 10, stat: 'ch-n2' })}
${W.links([W.informance('/content/pages/20-a-crash-course-in-music-theory', 'A Crash Course in Music Theory'), W.informance('/content/pages/206-harmony-history-style', 'Harmony, History & Style')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-th-voix', minutes: 20,
    title: 'La conduite des voix',
    summary: 'Un enchaînement d’accords, ce sont plusieurs mélodies qui avancent ensemble. Cinq règles pour les conduire, et la main gauche à trois voix de l’op. 15 n° 1.',
    goals: ['Enchaîner des accords en bougeant le moins possible.', 'Respecter les notes à tendance (sensible, septième).', 'Éviter les quintes et octaves parallèles.', 'Entendre les voix de la main gauche de l’Andante.'],
    body: W => `
<p>Une suite d’accords n’est pas une suite de blocs : ce sont plusieurs mélodies, les <b>voix</b>, qui avancent ensemble. Les compositeurs pensent ainsi. Le pianiste qui l’entend phrase mieux, mémorise mieux, et improvise des accompagnements qui sonnent juste.</p>

<h2>Quatre voix</h2>
<p>Le modèle classique est l’écriture à quatre voix : <b>soprano</b>, <b>alto</b>, <b>ténor</b>, <b>basse</b>. Au piano, on joue souvent la basse à la main gauche et les trois autres voix à la main droite, en position serrée.</p>

<h2>Cinq règles pour enchaîner deux accords</h2>
<ol>
<li><b>Garder les notes communes</b> à la même voix.</li>
<li><b>Bouger le moins possible</b> : chaque voix va vers la note la plus proche du nouvel accord.</li>
<li><b>Respecter les notes à tendance</b> : la sensible monte, la septième descend.</li>
<li><b>Éviter les quintes et les octaves parallèles</b> : deux voix qui avancent à la quinte ou à l’octave l’une de l’autre perdent leur indépendance ; on n’entend plus qu’une voix renforcée.</li>
<li><b>Préférer le mouvement contraire</b> entre la basse et le soprano.</li>
</ol>
${W.score({ abc: VOICES_GOOD, title: 'I – IV – V7 – I en do majeur', bpm: 50, caption: 'De I à IV, do reste en place, mi et sol montent d’un degré. De IV à V7, fa reste (il devient la septième), la et do descendent. De V7 à I, si monte vers do, fa descend vers mi, sol reste. La main droite ne bouge presque pas.' })}
${W.score({ abc: VOICES_BAD, title: 'I – ii : deux façons', bpm: 50, caption: 'Mesure 1 : tout le bloc monte avec la basse : quintes (do – sol puis ré – la) et octaves (do – do puis ré – ré) parallèles, l’enchaînement sonne creux. Mesure 2 : les voix supérieures descendent pendant que la basse monte : chaque voix garde son indépendance.' })}

<h2>Doublures et dispositions</h2>
<ul>
<li>À quatre voix, une note de l’accord est doublée : de préférence la <b>fondamentale</b>, jamais la sensible ni la septième. Elles ont une direction obligée : doublées, elles produiraient des octaves parallèles.</li>
<li>Position <b>serrée</b> (les trois voix supérieures dans une octave) ou <b>large</b> (écartées) : la main droite d’un choral est en position serrée, la main gauche d’un nocturne en position large.</li>
</ul>

${W.key('À retenir', '<ul><li>Un enchaînement d’accords = plusieurs mélodies simultanées.</li><li>Notes communes gardées, mouvements courts.</li><li>Sensible ↑, septième ↓.</li><li>Ni quintes ni octaves parallèles.</li><li>Doubler la fondamentale, jamais la sensible.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Déplacer tout l’accord en bloc : c’est là que naissent les quintes et octaves parallèles.</li><li>Faire descendre la sensible dans une cadence : la conclusion perd sa force.</li><li>Croire que ces règles valent pour toute musique : chez Debussy, les accords parallèles sont un choix de couleur (Clair de lune, mesures 15 à 18), pas une maladresse.</li></ul>')}

<h2>Dans ta pièce cette semaine : la main gauche de l’Andante</h2>
<p>La main gauche de l’op. 15 n° 1 est écrite à trois voix : une <b>basse</b> tenue, une voix en <b>noires</b> et des <b>triolets</b> qui remplissent l’harmonie. Voici la mélodie avec la basse et la voix en noires seulement :</p>
${W.score({ abc: OP15_VOICES, title: 'Mesures 1 à 8 : mélodie, voix en noires et basse (sans les triolets)', bpm: 66, startBpm: 56, practice: false, analysis: false, caption: 'Réduction : les triolets de la main gauche sont supprimés pour faire entendre les deux lignes qui portent l’harmonie.' })}
<ul>
<li><b>La basse</b> reste sur fa pendant trois mesures (pédale de tonique), puis descend pas à pas : fa – mi – ré – ré♭ – do – si – la, puis fa et mi (mesures 7-8).</li>
<li><b>La voix en noires</b> avance presque toujours par demi-tons ou par tons : do – do♯ – ré (mesure 4), si – si♭ (mesure 5), la (mesure 6), sol♯ – la (mesure 7).</li>
<li><b>Les notes à tendance</b> : do♯, sensible de ré, monte vers ré (mesure 4) ; sol♯, sensible de la, monte vers la (mesure 7). Mais à la mesure 5, si♮ glisse vers si♭ : dans une ligne chromatique, c’est la direction de la ligne qui l’emporte.</li>
<li><b>Mesures 3 → 4</b> : dans les triolets, le si♭ (septième de do 7) descend sur la (tierce de fa) : la règle « la septième descend », en situation réelle.</li>
</ul>
${W.tip('Au piano', '<p>Joue la basse et la voix en noires seules, en les liant au doigt ; puis ajoute la mélodie. Quand tu remets les triolets, garde ces deux lignes au premier plan : la main gauche devient une petite polyphonie, pas une masse d’accords.</p>')}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Enchaîner', '<p>Joue I – IV – V7 – I en sol majeur, puis en fa majeur, en appliquant les cinq règles (basse à la main gauche, trois voix à la main droite, comme dans l’exemple en do).</p><details><summary>Corrigé</summary><div><p>Sol majeur : main droite si – ré – sol → do – mi – sol → do – ré – fa♯ → si – ré – sol ; basse sol – do – ré – sol.<br>Fa majeur : main droite la – do – fa → si♭ – ré – fa → si♭ – do – mi → la – do – fa ; basse fa – si♭ – do – fa.</p></div></details>')}
${W.exo('Exercice 2 — Trouver la faute', '<p>Basse do → ré ; main droite do – mi – sol → ré – fa – la (do grave à la basse, accords au-dessus). Qu’est-ce qui ne va pas, et comment corriger ?</p><details><summary>Corrigé</summary><div><p>Toutes les voix montent avec la basse : octaves parallèles (do – do → ré – ré) et quintes parallèles (do – sol → ré – la). Correction : garder la basse do → ré et faire descendre la main droite, par exemple sol – do – mi → fa – la – ré (mouvement contraire).</p></div></details>')}
${W.exo('Exercice 3 — Dans la partition', '<p>Op. 15 n° 1, mesure 4 : quelle note de la voix en noires monte vers ré, et pourquoi ?</p><details><summary>Corrigé</summary><div><p>Do♯ : c’est la sensible de ré mineur. L’accord du 2e temps (la 7, dominante de ré mineur) se résout sur ré mineur au 3e temps.</p></div></details>')}
`,
  },

  {
    id: 'n2-th2', minutes: 20,
    title: 'Les dominantes secondaires',
    summary: 'Chaque accord majeur ou mineur peut avoir sa propre dominante : une tonicisation passagère, qui colore sans changer de tonalité. L’Andante de l’op. 15 en est rempli.',
    goals: ['Construire la dominante d’un degré quelconque.', 'Repérer une dominante secondaire grâce à son altération.', 'Analyser les mesures 4 à 8 et 17 à 21 de l’op. 15 n° 1.'],
    body: W => `
<p>Un accord majeur ou mineur peut être précédé de <b>sa propre dominante</b>, comme s’il était une tonique le temps d’un instant. On parle de <b>dominante secondaire</b>, notée V/x ou V7/x (« dominante de x »). La tonalité ne change pas : l’accord visé est simplement mis en valeur. On dit qu’il est <b>tonicisé</b>.</p>

<h2>La construire</h2>
<ol>
<li>Choisis l’accord visé, par exemple vi en fa majeur (ré mineur).</li>
<li>Construis une septième de dominante sur la note située une quinte au-dessus de sa fondamentale : la – do♯ – mi – sol.</li>
<li>Le do♯ est la sensible de ré : c’est lui qui crée l’attraction.</li>
</ol>
<table>
<thead><tr><th>En fa majeur</th><th>Accord visé</th><th>Sa dominante</th><th>Altération caractéristique</th></tr></thead>
<tbody>
<tr><td>V7/ii</td><td>sol mineur</td><td>ré – fa♯ – la – do</td><td>fa♯</td></tr>
<tr><td>V7/iii</td><td>la mineur</td><td>mi – sol♯ – si♮ – ré</td><td>sol♯ (et si♮)</td></tr>
<tr><td>V7/IV</td><td>si♭ majeur</td><td>fa – la – do – mi♭</td><td>mi♭</td></tr>
<tr><td>V7/V</td><td>do majeur</td><td>sol – si♮ – ré – fa</td><td>si♮</td></tr>
<tr><td>V7/vi</td><td>ré mineur</td><td>la – do♯ – mi – sol</td><td>do♯</td></tr>
</tbody></table>
<p>On peut aussi précéder un accord de sa <b>septième diminuée</b> (vii°7/x), bâtie sur sa sensible : si – ré – fa – la♭ mène à do (vii°7/V en fa majeur).</p>

<h2>Une chaîne de dominantes</h2>
${W.score({ abc: SECDOM, title: 'I – V7/vi – vi – V7/V – V7 – I en fa majeur', bpm: 60, caption: 'À la basse, fa – la – ré – sol – do – fa : à partir de la, une chaîne de quintes descendantes. La 7, sol 7 et do 7 sont chacun la dominante de l’accord suivant. Aux voix supérieures, tout se fait par degrés conjoints ou notes communes.' })}

<h2>La repérer</h2>
<p>Une altération accidentelle qui crée une <b>sensible</b> (une note un demi-ton sous la fondamentale de l’accord suivant) signale presque toujours une dominante secondaire. Un bémol accidentel signale souvent la septième d’une dominante secondaire (mi♭ dans V7/IV) ou un emprunt au mode mineur. Vérifie toujours vers quoi va l’accord : c’est la résolution qui confirme.</p>

${W.key('À retenir', '<ul><li>V/x : l’accord majeur (ou V7) bâti une quinte au-dessus de x.</li><li>Son altération est la sensible de x.</li><li>Tonicisation : un instant ; la tonalité ne change pas.</li><li>Les dominantes s’enchaînent souvent en quintes descendantes.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Voir une modulation dans chaque altération : sans cadence dans la nouvelle tonalité, c’est une tonicisation.</li><li>Construire la dominante sous l’accord visé au lieu d’au-dessus : la dominante de ré est la, pas sol.</li><li>Croire que la dominante dépend du mode de l’accord visé : ré majeur et ré mineur ont la même dominante (la 7).</li></ul>')}

<h2>Dans ta pièce cette semaine : l’Andante, mesures 1 à 24</h2>
<p><b>Mesures 4 à 8.</b> La basse descend pas à pas, et presque chaque étape est préparée par sa propre dominante. Cherche les altérations et l’accord qu’elles annoncent :</p>
<ul>
<li>Mesure 4 : do♯ → <b>la 7 = V7/vi</b>, résolu sur ré mineur au 3e temps.</li>
<li>Mesure 5 : si♮ → <b>sol 7 = V7/V</b> ; puis ré♭ → sol – si♭ – ré♭ – fa, emprunté à fa mineur (iiø7), avant do 7.</li>
<li>Mesures 6-7 : si – ré – fa – la, puis sol♯ → <b>mi 7 = V7/iii</b>, résolu sur la mineur. Si – ré – fa – la est le iiø7 de la mineur : le petit ii – V – i de la mineur, à l’intérieur de fa majeur.</li>
<li>Mesure 8 : mi majeur (V/iii), puis do 7 qui ramène vers fa.</li>
</ul>
${W.score({ abc: OP15.e1, title: 'Op. 15 n° 1, mesures 1 à 8', bpm: 66, startBpm: 56 })}
<p><b>Mesures 17 à 21.</b> Après mi♭ 7, l’accord mi♭ – sol – la – do♯ (une sixte augmentée, que tu étudieras à la semaine 5) s’ouvre sur <b>ré 7 = V7/ii</b>, qui va non pas sur sol mineur mais sur <b>sol 7 = V7/V</b>, puis sur do : une chaîne de dominantes, ré – sol – do. Au sommet (mesure 20), si – ré – fa – la♭ est la <b>septième diminuée de do</b> (vii°7/V).</p>
${W.score({ abc: OP15.e2, title: 'Op. 15 n° 1, mesures 17 à 24', bpm: 66, startBpm: 50 })}
${W.tip('À l’oreille', '<p>Une dominante secondaire sonne comme une petite surprise lumineuse (une note qui monte d’un demi-ton), aussitôt expliquée par l’accord suivant. Joue la chaîne de dominantes ci-dessus, puis la même suite sans altérations (fa – la m – ré m – sol m – do 7 – fa) : la différence est frappante.</p>')}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Construire', '<p>En do majeur, écris V7/ii, V7/IV, V7/V et V7/vi.</p><details><summary>Corrigé</summary><div><p>V7/ii = la – do♯ – mi – sol ; V7/IV = do – mi – sol – si♭ ; V7/V = ré – fa♯ – la – do ; V7/vi = mi – sol♯ – si – ré.</p></div></details>')}
${W.exo('Exercice 2 — Lire une altération', '<p>En sol majeur, quel accord annoncent : (a) un do♯ ; (b) un sol♯ ; (c) un fa♮ ?</p><details><summary>Corrigé</summary><div><p>(a) Do♯ est la sensible de ré : la 7 = V7/V. (b) Sol♯ est la sensible de la : mi 7 = V7/ii. (c) Fa♮ est la septième de sol 7 = V7/IV, qui mène à do.</p></div></details>')}
${W.exo('Exercice 3 — Analyser', '<p>Op. 15, mesure 18 : ré 7 devrait aller vers sol mineur. Où va-t-il, et quel nom donner à l’enchaînement ?</p><details><summary>Corrigé</summary><div><p>Vers sol 7 (avec ré à la basse), puis vers do à la mesure 19 : ré 7 – sol 7 – do est une chaîne de dominantes en quintes descendantes (V7/ii – V7/V – V).</p></div></details>')}
`,
  },

  {
    id: 'n2-th3', minutes: 20,
    title: 'Moduler',
    summary: 'Changer de tonalité : par un accord pivot, par une altération, par un changement de mode. Le Con fuoco en offre trois exemples en huit mesures.',
    goals: ['Distinguer tonicisation et modulation.', 'Connaître les tons voisins.', 'Reconnaître les principales façons de moduler.', 'Suivre les tonalités des mesures 24 à 32 de l’op. 15.'],
    body: W => `
<p>Une dominante secondaire éclaire un accord un instant ; une <b>modulation</b> installe durablement une nouvelle tonique, confirmée par une cadence. Toute pièce un peu longue module : c’est ce qui crée le sentiment de voyage et de retour.</p>

<h2>Les tons voisins</h2>
<p>Une tonalité a cinq <b>tons voisins</b> : son relatif, et les tonalités situées une quinte au-dessus et au-dessous, avec leurs relatifs. Ils diffèrent d’une altération au plus ; on y module le plus naturellement.</p>
<table>
<thead><tr><th>Depuis</th><th>Relatif</th><th>Dominante (et son relatif)</th><th>Sous-dominante (et son relatif)</th></tr></thead>
<tbody>
<tr><td>fa majeur</td><td>ré mineur</td><td>do majeur (la mineur)</td><td>si♭ majeur (sol mineur)</td></tr>
<tr><td>fa mineur</td><td>la♭ majeur</td><td>do mineur (mi♭ majeur)</td><td>si♭ mineur (ré♭ majeur)</td></tr>
</tbody></table>
${W.cof({ start: 11, minor: false })}

<h2>1. Par un accord pivot</h2>
<p>Un accord appartient aux deux tonalités : on l’entend dans l’ancienne, on le comprend après coup dans la nouvelle. Ici, la mineur est vi en do majeur et ii en sol majeur ; la dominante de sol (ré 7) confirme ensuite le changement.</p>
${W.score({ abc: MODUL, title: 'De do majeur à sol majeur par un accord pivot', bpm: 60, caption: 'Le la mineur de la mesure 3 est le pivot : vi en do majeur, ii en sol majeur. Le fa♯ de ré 7 fait basculer.' })}

<h2>2. Par une altération</h2>
<p>Une note est altérée pour appartenir à la nouvelle tonalité : depuis do majeur, fa devient fa♯ (la sensible de sol) pour aller vers sol ; si devient si♭ (le 4e degré de fa, qui efface la sensible de do) pour aller vers fa. La dominante de la nouvelle tonalité vient ensuite confirmer.</p>

<h2>3. Par changement de mode</h2>
<p>On garde la même tonique et on change de mode : c’est la <b>tonalité homonyme</b> (fa majeur ↔ fa mineur). Les deux modes ont la même dominante : do 7 peut mener à l’un comme à l’autre.</p>

<h2>4. Les autres moyens</h2>
<ul>
<li><b>La modulation directe</b> : une nouvelle tonalité attaquée sans transition, souvent après une cadence ou un silence.</li>
<li><b>La modulation enharmonique</b> : un accord réécrit autrement change de sens, en particulier la septième diminuée (voir <a href="#/lecon/n2-th1">les accords de septième</a>) et la sixte augmentée (voir <a href="#/lecon/n2-th5">la sixte augmentée</a>). C’est le moyen favori des romantiques pour atteindre des tonalités lointaines.</li>
</ul>

<h2>Tonicisation ou modulation ?</h2>
<p>Pose deux questions : la nouvelle tonique est-elle <b>confirmée par une cadence</b> ? Y <b>reste</b>-t-on plusieurs mesures ? Deux oui : modulation. Sinon : tonicisation. Entre les deux, une suite de tonalités qui ne durent que quelques mesures chacune s’appelle une marche modulante (chapitre suivant).</p>

${W.key('À retenir', '<ul><li>Modulation = nouvelle tonique confirmée par une cadence.</li><li>Tons voisins : relatif, dominante, sous-dominante et leurs relatifs.</li><li>Moyens : accord pivot, altération, changement de mode, modulation directe, enharmonie.</li><li>Homonymes (fa majeur / fa mineur) : même tonique, même dominante.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Confondre relatif (même armure : fa majeur / ré mineur) et homonyme (même tonique : fa majeur / fa mineur).</li><li>Annoncer une modulation à la première altération : attends la cadence.</li><li>Chercher le pivot après le changement : il se trouve juste avant la première note étrangère à l’ancienne tonalité.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 24 à 32</h2>
<ul>
<li><b>Mesures 24-25 : changement de mode.</b> L’Andante s’arrête sur do 7, suivi d’un silence. Do 7 est la dominante de fa majeur… et de fa mineur : c’est le mode mineur qui arrive, sans aucune préparation, <i>con fuoco</i>.</li>
<li><b>Mesures 25 à 28 : fa mineur</b>, une harmonie par mesure : i, iv7, iiø7, puis do ø7 et la °7, qui préparent si♭ mineur.</li>
<li><b>Mesures 29 à 32 : vers ré♭ majeur.</b> Si♭ mineur sert de pivot : iv en fa mineur, vi en ré♭ majeur. Sur une longue pédale de ré♭ (sol♭ passe à la basse à la mesure 31), on entend ré♭ 7, sol♭ (IV), mi♭ m7 (ii7), puis ré♭ (I) : la nouvelle tonalité s’installe, et les mesures 33-34 la confirment. Ré♭ majeur est un ton voisin de fa mineur (le relatif de sa sous-dominante).</li>
</ul>
${W.score({ abc: OP15.e3, title: 'Mesures 25 à 28 : fa mineur', bpm: 84, startBpm: 56 })}
${W.score({ abc: OP15.e4, title: 'Mesures 29 à 32 : vers ré♭ majeur', bpm: 84, startBpm: 56 })}
<p>Plus loin, la♭ 7 puis si♭ 7 (mesures 41 à 44) évoquent ré♭ et mi♭ mineur sans s’y installer, et si♭ mineur ramène vers fa majeur (mesures 47-49).</p>

<h2>Exercices</h2>
${W.exo('Exercice 1 — Tons voisins', '<p>Quels sont les cinq tons voisins de ré♭ majeur ?</p><details><summary>Corrigé</summary><div><p>Si♭ mineur (relatif) ; la♭ majeur et fa mineur (dominante et son relatif) ; sol♭ majeur et mi♭ mineur (sous-dominante et son relatif).</p></div></details>')}
${W.exo('Exercice 2 — Pivots', '<p>Trouve tous les accords parfaits communs à do majeur et sol majeur. Lequel préfère-t-on comme pivot, et pourquoi ?</p><details><summary>Corrigé</summary><div><p>Do majeur (I / IV), mi mineur (iii / vi), sol majeur (V / I), la mineur (vi / ii). On préfère un accord qui a une fonction de sous-dominante dans la nouvelle tonalité (la mineur = ii, ou do = IV), car il peut directement précéder sa dominante (ré 7).</p></div></details>')}
${W.exo('Exercice 3 — Tonicisation ou modulation ?', '<p>Dans le Più mosso de l’op. 55 n° 1 (niveau 1), on passe de fa mineur à do mineur (mesures 51 à 54), puis à sol mineur (mesures 55-56). Modulations ?</p><details><summary>Corrigé</summary><div><p>Des tonicisations enchaînées en marche modulante : chaque tonalité est brièvement affirmée (V – i), mais aucune ne s’installe ni n’est confirmée par une vraie cadence.</p></div></details>')}
${W.quiz({ kind: 'keysig', minor: 'only', keys: ['D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'], title: 'Révision : armures des tonalités mineures', count: 10, stat: 'ks-min-only' })}
`,
  },
];

const SEQUENCE = `X:1
M:4/4
L:1/4
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^i"[EAc]2 "^iv"[FAd]2 | "^VII"[DGB]2 "^III"[EGc]2 | "^VI"[CFA]2 "^ii°"[DFB]2 | "^V7"[DE^G]2 "^i"[CEA]2 |]
[V:LH] "_modèle"A,,2 D,2 | "_un degré plus bas"G,,2 C,2 | "_un degré plus bas"F,,2 B,,2 | "_cadence"E,,2 A,,2 |]`;

// Op. 15 n° 1, mesures 45 à 48 (réduction : mélodie et accords). La mesure 48 est à 6/8 dans l'original.
const OP15_RED_45 = `X:1
M:3/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 45
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] f3_g e4 f3_g | e4 e3f d4- | d4 c3d B4- | B6 =A4 G2 |]
[V:LH] [B,,=D,A,]4 [E,,_G,B,]4 [B,,=D,A,]4 | [E,,_G,B,]4 [A,,C,E,]4 [D,,F,A,]4 | [D,,F,A,]4 [F,,C,E,=A,]4 [B,,D,F,]4 | [B,,D,F,]12 |]`;

const AN_RED_45 = {
  key: 'ré♭ majeur, puis retour vers fa',
  bars: [
    { m: 45, ch: [['si♭ 7', 'V7/ii', 'D', 1], ['mi♭ m', 'ii', 'SD', 2], ['si♭ 7', 'V7/ii', 'D', 3]] },
    { m: 46, ch: [['mi♭ m', 'ii', 'SD', 1], ['la♭', 'V', 'D', 2], ['ré♭', 'I', 'T', 3]] },
    { m: 47, ch: [['ré♭', 'I', 'T', 1], ['fa 7', 'V7/vi', 'D', 2], ['si♭ m', 'vi', 'T', 3]] },
    { m: 48, ch: [['si♭ m', 'iv de fa', 'SD', 1]] },
  ],
  notes: [
    'À la basse : si♭ – mi♭ – la♭ – ré♭, des quintes descendantes : si♭ 7 → mi♭ mineur, puis ii – V – I de ré♭ (mi♭ m – la♭ – ré♭).',
    'Le motif (longue, brève, longue) est repris de plus en plus bas : fa – sol♭ – mi♭, mi♭ – fa – ré♭, do – ré♭ – si♭.',
    'Mesure 48 : si♭ mineur (iv de fa), et la♮ dans la mélodie : fa majeur revient à la mesure 49.',
  ],
};

const NEAPOLITAN = `X:1
M:4/4
L:1/4
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^i"[Acf]4 | "^N6"[Bd_g]4 | "^6/4 de cadence"[Acf]4 | "^V"[Gc=e]4 | "^i"[Acf]4 |]
[V:LH] F,,4 | B,,4 | C,4 | C,4 | F,,4 |]`;

const AUG6 = `X:1
M:4/4
L:1/4
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^i"[FAc]4 | "^6te augm."[FG=B]4 | "^V"[=EGc]4 | "^i"[FAc]4 |]
[V:LH] F,,4 | D,,4 | C,,4 | F,,4 |]`;

const AUG6_TYPES = `X:1
M:4/4
L:1/4
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^italienne"[F=B]2 [=Ec]2 | "^française"[FG=B]2 [=EGc]2 | "^allemande"[FA=B]2 [FAc] [=EGc] |]
[V:LH] D,2 C,2 | D,2 C,2 | D,2 C, C, |]`;

// Op. 15 n° 1, mesures 15 à 19 (identiques aux mesures 63 à 67 de la reprise) : réduction.
const OP15_RED_15 = `X:1
M:3/4
L:1/4
K:F
%%barnumbers 1
%%setbarnb 15
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] c f e | g3 | b2 a | g a f | c g2 |]
[V:LH] [C,C] [A,CF] [G,CE] | [F,G,=B,_D]2 [E,G,_B,_D] | [_E,G,_B,_D]2 [_E,_G,A,_D] | [_E,G,A,^C] [D,^F,A,=C] [D,=F,G,=B,] | [C,C] [G,B,CF] [B,CE] |]`;

const AN_RED_15 = {
  key: 'fa majeur',
  bars: [
    { m: 15, ch: [['do', 'V', 'D', 1], ['fa/do', '6/4 de broderie', '', 2], ['do', 'V', 'D', 3]] },
    { m: 16, ch: [['ré♭ fa sol si', 'passage (son de 6te augm.)', '', 1], ['mi °7', 'vii°7', 'D', 3]] },
    { m: 17, ch: [['mi♭ 7', '♭VII7', '', 1], ['mi♭ sol♭ la ré♭', 'passage', '', 3]] },
    { m: 18, ch: [['mi♭ sol la do♯', 'sixte augm. (française)', 'SD', 1], ['ré 7', 'V7/ii', 'D', 2], ['sol 7/ré', 'V7/V', 'D', 3]] },
    { m: 19, ch: [['do (4-3)', 'V', 'D', 1], ['do 7', 'V7', 'D', 3]] },
  ],
  notes: [
    'La basse descend par demi-tons : fa – mi – mi♭ – ré – do (mesures 16 à 19). Les accords sont portés par cette ligne chromatique.',
    'Mesure 16 : ré♭ – fa – sol – si♮ a le son d’une sixte augmentée française, mais avec fa à la basse et sans s’ouvrir sur do : un accord de passage.',
    'Mesure 18 : mi♭ – sol – la – do♯, mi♭ à la basse : mi♭ descend sur ré et l’accord s’ouvre sur ré 7.',
    'Mesure 19 : do avec une quarte (fa) qui se résout sur mi : un retard 4-3 ; la dominante, enfin.',
  ],
};

// Clair de lune, mesures 27-28 (réduction : la mélodie et les accords arpégés de la main gauche).
const CL_27 = `X:1
M:9/8
L:1/8
K:Db
%%barnumbers 1
%%setbarnb 27
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] [FA]6 [A_c]2 d | [FA]6 [A_c]2 A |]
[V:LH] [D,,A,,F,]3 [F,,C,A,]3 [A,,_F,_C]3 | [D,,A,,F,]3 [F,,C,A,]3 [A,,_F,_C]3 |]`;

const AN_CL27 = {
  key: 'ré♭ majeur (Un poco mosso)',
  bars: [
    { m: 27, ch: [['ré♭', 'I', 'T', 1], ['fa m', 'iii', 'T', 2], ['fa♭/la♭', '♭III6', '', 3]] },
    { m: 28, ch: [['ré♭', 'I', 'T', 1], ['fa m', 'iii', 'T', 2], ['fa♭/la♭', '♭III6', '', 3]] },
  ],
  notes: [
    'À la basse, ré♭ – fa – la♭ : l’arpège de l’accord de tonique, une note par temps.',
    'Fa mineur devient fa♭ majeur : fa et do descendent d’un demi-ton, la♭ reste. Fa♭ est la tierce de ré♭ mineur : une couleur empruntée au mode mineur.',
    'Avec le ré♭ de la mélodie, on entend ré♭ – fa♭ – la♭ – do♭ : ré♭ mineur, la couleur qui annonce le do♯ mineur de l’En animant (do♯ = ré♭).',
  ],
};

// Clair de lune, mesures 37 à 43 (réduction harmonique : un accord par temps, basse une octave plus bas).
const CL_37 = `X:1
M:9/8
L:1/8
K:C#m
%%barnumbers 1
%%setbarnb 37
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] [EGBc]9 | [Ace]3 [Acf]6 | [Acf]6 [Ace]3 | [Adf]3 [cef]3 [Ace]3 | [Acef]9 | [Acef]9 |[K:Db] [EGBd]9 |]
[V:LH] B,,3 C,3 E,3 | G,3 F,3 ^E,3 | E,3 D,3 C,3 | B,,3 A,,3 G,,3 | F,,9 | F,,9 |[K:Db] A,,9 |]`;

const AN_CL37 = {
  key: 'do♯ mineur (En animant), puis ré♭ majeur (Calmato)',
  bars: [
    { m: 37, ch: [['do♯ m7', 'i7', 'T', 1]] },
    { m: 38, ch: [['la maj7/sol♯', 'VI4/2', 'T', 1], ['fa♯ m', 'iv', 'SD', 2], ['fa♯ m/mi♯', 'passage', '', 3]] },
    { m: 39, ch: [['fa♯ m7/mi', 'iv4/2', 'SD', 1], ['ré♯ ø7', 'iiø7', 'SD', 2], ['la/do♯', 'VI6', 'T', 3]] },
    { m: 40, ch: [['si 7', 'V7/III', '', 1], ['fa♯ m7/la', 'iv6/5', 'SD', 2], ['la maj7/sol♯', 'VI4/2', 'T', 3]] },
    { m: 41, ch: [['fa♯ m7', 'iv7', 'SD', 1]] },
    { m: 42, ch: [['fa♯ m7', 'iv7', 'SD', 1]] },
    { m: 43, ch: [['la♭ (mi♭ m au-dessus)', 'V11 de ré♭', 'D', 1]] },
  ],
  notes: [
    'Mesures 38 à 40, à la basse : sol♯ – fa♯ – mi♯ – mi – ré♯ – do♯ – si – la – sol♯, une octave entière, note à note. C’est la basse qui conduit ; les accords la suivent.',
    'Si 7 (mesure 40) ne se résout pas sur mi : la basse continue simplement de descendre.',
    'Mesures 41-42 : le sommet, forte, sur un seul accord (fa♯ m7) ; dans la partition, la main droite descend en tierces sur deux octaves.',
    'Mesure 43 : la♭ (= sol♯, la dominante de do♯ mineur) sert aussi de dominante à ré♭ majeur. Do♯ et ré♭ sont la même touche : seuls le mode et l’orthographe changent.',
  ],
};

/* ---------- Chapitres (seconde partie) ---------- */
const PART2 = [
  {
    id: 'n2-th4', minutes: 20,
    title: 'Les marches harmoniques',
    summary: 'Un modèle répété à des hauteurs successives : le moteur de nombreux développements. Le Con fuoco en contient deux, l’une qui monte, l’autre qui descend.',
    goals: ['Reconnaître une marche, son modèle et ses reprises.', 'Jouer la marche par quintes descendantes.', 'Analyser les mesures 41 à 48 de l’op. 15 n° 1.'],
    body: W => `
<p>Une <b>marche</b> (ou séquence) est un modèle — un motif mélodique et son harmonie — répété plusieurs fois à des hauteurs différentes, le plus souvent par degrés. L’oreille, qui a compris le modèle, anticipe la suite : c’est un formidable moteur, en composition comme en improvisation.</p>

<h2>La marche par quintes descendantes</h2>
<p>La plus fréquente : les fondamentales descendent de quinte en quinte (ou montent de quarte), en passant par tous les degrés de la tonalité. En la mineur : i – iv – VII – III – VI – ii° – V – i.</p>
${W.score({ abc: SEQUENCE, title: 'Marche par quintes en la mineur', bpm: 60, caption: 'Le modèle (deux accords) est repris un degré plus bas, puis encore un degré plus bas, avant la cadence. La basse alterne quarte montante et quinte descendante.' })}
<ul>
<li>Le modèle dure ici deux accords ; chaque reprise descend d’un degré.</li>
<li>À l’intérieur du modèle, les voix gardent les notes communes et bougent par degrés ; d’un modèle au suivant, tout le bloc descend d’un degré.</li>
<li>On sort de la marche par une cadence (ii° – V7 – i).</li>
</ul>

<h2>Les autres marches</h2>
<ul>
<li><b>Marche ascendante</b> : le modèle est repris un degré (ou un ton) plus haut ; la tension monte, souvent avec un crescendo.</li>
<li><b>Marche d’accords de sixte</b> : des accords au premier renversement qui descendent en parallèle, très fréquents dans les traits.</li>
<li><b>Marche modulante</b> : chaque reprise tonicise une nouvelle tonalité (le Più mosso de l’op. 55 n° 1 : fa mineur, do mineur, sol mineur).</li>
<li><b>Marche mélodique</b> : un motif répété à différentes hauteurs, même si l’harmonie varie un peu.</li>
</ul>

${W.key('À retenir', '<ul><li>Marche = modèle + reprises à d’autres hauteurs.</li><li>Par quintes descendantes : chaque accord prépare le suivant.</li><li>Ascendante : la tension monte ; descendante : elle se détend ou ramène.</li><li>On en sort par une cadence.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Prendre une simple répétition (même hauteur) pour une marche.</li><li>Chercher une reproduction exacte : dans une marche tonale, les intervalles s’adaptent à la gamme (seconde majeure ici, mineure là).</li><li>Jouer chaque reprise de la même façon : une marche se dirige, en crescendo ou en diminuendo.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 41 à 48</h2>
<p><b>Mesures 41 à 44 : une marche ascendante.</b> Modèle de deux mesures : la♭ 7, avec la mélodie à la main gauche (mi♭ – fa – ré♭ – do, puis si – do – la♭). Reprise : si♭ 7, le même dessin <b>un ton plus haut</b> (fa – sol♭ – mi♭ – ré, puis do♯ – ré – si♭). La tension monte avant la redescente.</p>
${W.score({ abc: OP15.e6, title: 'Mesures 41 à 44 : la marche ascendante', bpm: 84, startBpm: 56 })}
<p><b>Mesures 45 à 48 : une marche descendante.</b> La basse enchaîne si♭ – mi♭ – la♭ – ré♭ (quintes descendantes, comme dans l’exemple du cours), puis fa – si♭. La mélodie reprend son motif de plus en plus bas, et la♮ annonce le retour de fa majeur.</p>
${W.score({ abc: OP15_RED_45, title: 'Mesures 45 à 48 (réduction : mélodie et accords)', bpm: 66, startBpm: 56, practice: false, analysis: AN_RED_45, caption: 'Réduction : les doubles notes de la main droite et les octaves de la main gauche sont ramenées à des accords. La mesure 48 est à 6/8 dans la partition.' })}
<p>Au niveau 1, tu as joué une marche modulante : le Più mosso de l’op. 55 n° 1, où la même formule passe de fa mineur à do mineur, puis à sol mineur.</p>
${W.score({ abc: OP55.e6, title: 'Op. 55 n° 1, mesures 48 à 52 : la marche modulante', bpm: 66, startBpm: 56 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Transposer', '<p>Joue la marche du cours en mi mineur. Quels sont les accords ?</p><details><summary>Corrigé</summary><div><p>Mi m – la m – ré – sol – do – fa♯ ° – si 7 – mi m.</p></div></details>')}
${W.exo('Exercice 2 — Mesurer', '<p>Mesures 41 à 44 : de combien la reprise est-elle plus haute que le modèle ? Pourquoi la mélodie commence-t-elle par fa – sol♭ (demi-ton) alors que le modèle commençait par mi♭ – fa (ton) ?</p><details><summary>Corrigé</summary><div><p>D’un ton (la♭ 7 → si♭ 7). La marche n’est pas une copie exacte : Chopin garde le dessin mais prend les notes de la nouvelle tonalité. Le modèle est en ré♭ majeur, où la note au-dessus de mi♭ est fa (un ton) ; la reprise vise mi♭ mineur, où la note au-dessus de fa est sol♭ (un demi-ton).</p></div></details>')}
${W.exo('Exercice 3 — Composer', '<p>En do majeur, écris un modèle de deux accords (I – IV) et fais-le descendre d’un degré à chaque reprise, jusqu’à une cadence.</p><details><summary>Corrigé</summary><div><p>Do – fa | si ° – mi m | la m – ré m | sol – do : la marche par quintes en majeur (I – IV – vii° – iii – vi – ii – V – I).</p></div></details>')}
<p>Pour la jouer en improvisant, voir <a href="#/lecon/n2-im2">l’improvisation sur une marche</a>.</p>
`,
  },

  {
    id: 'n2-th5', minutes: 25,
    title: 'La sixte napolitaine et la sixte augmentée',
    summary: 'Deux accords de préparation de la dominante, très chargés en couleur, chers aux romantiques. Tu les trouves dans la reprise de l’op. 15 et dans l’op. 55.',
    goals: ['Construire la sixte napolitaine et la conduire vers la dominante.', 'Construire les trois sixtes augmentées.', 'Les reconnaître dans tes pièces.'],
    body: W => `
<h2>La sixte napolitaine</h2>
<p>C’est un accord majeur construit sur le <b>2e degré abaissé</b> (♭II), le plus souvent au premier renversement : sa tierce est à la basse, d’où le nom de « sixte ». En fa mineur : sol♭ – si♭ – ré♭, avec si♭ à la basse. Elle remplace la sous-dominante pour préparer la dominante, avec une couleur sombre et dramatique.</p>
${W.score({ abc: NEAPOLITAN, title: 'i – N6 – V – i en fa mineur', bpm: 56, caption: 'Le sol♭ descend vers fa (dans l’accord de quarte et sixte de cadence), puis vers mi♮, la sensible. La basse si♭ monte vers do.' })}
<ul>
<li>Exemple célèbre : la mesure 3 du premier mouvement de la Sonate « Clair de lune » de Beethoven (ré majeur en do♯ mineur).</li>
<li>Elle se trouve surtout en mineur, mais aussi en majeur, empruntée au mineur.</li>
</ul>

<h2>La sixte augmentée</h2>
<p>Sa basse est le <b>6e degré du mode mineur</b> (ré♭ en fa mineur ; en majeur, le 6e degré abaissé) ; au-dessus, le <b>4e degré haussé</b> (si♮) forme avec elle une sixte augmentée. Les deux notes s’écartent d’un demi-ton chacune vers l’octave de la dominante (do – do) : c’est le geste le plus fort qui soit pour l’amener.</p>
${W.score({ abc: AUG6, title: 'i – sixte augmentée (française) – V – i en fa mineur', bpm: 56, caption: 'Ré♭ (basse) descend vers do, si♮ monte vers do : la sixte augmentée s’ouvre sur l’octave.' })}
<table>
<thead><tr><th>Type</th><th>En fa mineur</th><th>Particularité</th></tr></thead>
<tbody>
<tr><td>Italienne</td><td>ré♭ – fa – si♮</td><td>trois sons</td></tr>
<tr><td>Française</td><td>ré♭ – fa – sol – si♮</td><td>avec le 2e degré : une couleur plus acide</td></tr>
<tr><td>Allemande</td><td>ré♭ – fa – la♭ – si♮</td><td>sonne exactement comme ré♭ 7 : un pivot enharmonique pour moduler</td></tr>
</tbody></table>
${W.score({ abc: AUG6_TYPES, title: 'Les trois sixtes augmentées et leur résolution (fa mineur)', bpm: 56, caption: 'L’allemande passe d’abord par l’accord de quarte et sixte de cadence : aller directement sur do – sol produirait des quintes parallèles (ré♭ – la♭ → do – sol).' })}
<p>Pour reconnaître l’allemande, l’oreille ne suffit pas : ré♭ – fa – la♭ – si♮ et ré♭ – fa – la♭ – do♭ (ré♭ 7) ont le même son. C’est la <b>résolution</b> qui tranche : vers do (dominante de fa), c’est une sixte augmentée ; vers sol♭, une septième de dominante.</p>

${W.key('À retenir', '<ul><li>N6 = accord majeur sur le 2e degré abaissé, tierce à la basse ; il mène à V (souvent par le 6/4 de cadence).</li><li>Sixte augmentée = 6e degré abaissé (basse) + 4e degré haussé ; les deux s’écartent vers l’octave de la dominante.</li><li>Italienne (3 sons), française (+ 2e degré), allemande (+ 3e degré abaissé, son de septième de dominante).</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Faire monter le ré♭ de la sixte augmentée : il descend vers do.</li><li>Prendre la sixte napolitaine pour une simple sous-dominante : ses notes sol♭ et ré♭ (2e et 6e degrés abaissés) la trahissent.</li><li>Juger l’allemande sur son nom de notes seulement : l’écriture peut varier (Chopin écrit do♭ dans l’op. 55), la résolution décide.</li></ul>')}

<h2>Dans ta pièce cette semaine : la reprise, mesures 63 à 67 (= 15 à 19)</h2>
<p>Dans la reprise, Chopin réutilise presque exactement le passage des mesures 15 à 19. Sous une mélodie aux valeurs longues, la basse descend par demi-tons, et le son de la sixte augmentée française apparaît deux fois :</p>
${W.score({ abc: OP15_RED_15, title: 'Mesures 15 à 19 (et 63 à 67) : réduction', bpm: 60, startBpm: 50, practice: false, analysis: AN_RED_15, caption: 'Réduction : les triolets de la main gauche sont ramenés à des accords, la fioriture de la mesure 18 est supprimée.' })}
<ul>
<li><b>Mesure 16 (64)</b> : ré♭ – fa – sol – si♮ a le son de la sixte augmentée française de fa majeur (6e degré abaissé ré♭, 4e degré haussé si♮). Mais fa est à la basse et l’accord ne s’ouvre pas sur do : si♮ redescend sur si♭, fa sur mi. C’est ici un accord de passage sur la basse chromatique, qui annonce la vraie sixte augmentée de la mesure 18.</li>
<li><b>Mesure 18 (66)</b> : mi♭ – sol – la – do♯ : la même sorte d’accord, construite pour amener ré. La basse mi♭ descend sur ré ; le do♯, au lieu de monter vers ré, glisse vers do♮, la septième de ré 7 : la ligne chromatique continue de descendre.</li>
</ul>
<p><b>Dans l’op. 55 n° 1</b> (niveau 1), les deux accords sont là aussi : la <b>sixte napolitaine</b> à la mesure 6 (sous la trille), et la <b>sixte augmentée allemande</b> aux mesures 22-23 (ré♭ – fa – la♭ – si♮ sur la pédale de do) puis aux mesures 69-70, écrite ré♭ – fa – la♭ – do♭ et résolue sur do.</p>
${W.score({ abc: OP55.e2, title: 'Op. 55 n° 1, mesures 5 à 8 : la sixte napolitaine', bpm: 56, startBpm: 46 })}
${W.score({ abc: OP55.e8, title: 'Op. 55 n° 1, mesures 69-70 : la sixte augmentée écrite comme ré♭ 7', bpm: 66, startBpm: 46 })}

<h2>Exercices</h2>
${W.exo('Exercice 1 — Sixte napolitaine', '<p>Écris la sixte napolitaine (avec sa basse) de do mineur, la mineur et ré mineur.</p><details><summary>Corrigé</summary><div><p>Do mineur : ré♭ – fa – la♭, fa à la basse. La mineur : si♭ – ré – fa, ré à la basse. Ré mineur : mi♭ – sol – si♭, sol à la basse.</p></div></details>')}
${W.exo('Exercice 2 — Sixtes augmentées', '<p>Écris les trois sixtes augmentées de la mineur. Vers quel accord vont-elles ?</p><details><summary>Corrigé</summary><div><p>Italienne : fa – la – ré♯ ; française : fa – la – si – ré♯ ; allemande : fa – la – do – ré♯. Elles vont vers mi (la dominante), fa descendant sur mi et ré♯ montant sur mi.</p></div></details>')}
${W.exo('Exercice 3 — Reconnaître', '<p>En ré mineur, que penses-tu de l’accord si♭ – ré – fa – sol♯ ? Et s’il était écrit si♭ – ré – fa – la♭ ?</p><details><summary>Corrigé</summary><div><p>Si♭ – ré – fa – sol♯ : sixte augmentée allemande de ré mineur (si♭ et sol♯ s’ouvrent sur la – la). Écrit si♭ – ré – fa – la♭, c’est si♭ 7, la dominante de mi♭ : même son, autre fonction.</p></div></details>')}
${W.tip('À l’oreille', '<p>La sixte napolitaine sonne comme un brusque assombrissement juste avant la cadence ; la sixte augmentée, comme un étau qui s’ouvre sur la dominante. Joue les exemples plusieurs fois, puis improvise avec la grille ci-dessous.</p>')}
${W.improv({ preset: 'n2-napolitaine', presets: ['n2-napolitaine'] })}
`,
  },

  {
    id: 'n2-th-debussy', minutes: 25,
    title: 'L’harmonie de Debussy',
    summary: 'Les mêmes accords que Chopin, mais choisis pour leur couleur plus que pour leur tension : septièmes et neuvièmes libres, accords parallèles, pédales, mode mineur emprunté. Tout, dans Clair de lune.',
    goals: ['Reconnaître accords enrichis, accords parallèles et pédales.', 'Repérer les couleurs empruntées au mode mineur.', 'Comprendre le passage de ré♭ majeur à do♯ mineur et le retour.'],
    body: W => `
<p>Clair de lune est encore une pièce <b>tonale</b> : ré♭ majeur, des dominantes, des cadences. Mais là où Chopin construit des tensions qui se résolvent, Debussy choisit souvent un accord pour sa <b>couleur</b>, et l’enchaîne librement au suivant. Cinq procédés suffisent à décrire presque toute la pièce.</p>

<h2>1. Des accords enrichis, qui ne se résolvent pas</h2>
<p>Septièmes, neuvièmes, onzièmes sont traitées comme des couleurs : elles ne descendent pas forcément. Dès le début : à la mesure 2, une septième diminuée (do – mi♭ – sol♭ – si𝄫) glisse vers si♭ m7 (mesure 3) au lieu de se résoudre sur la tonique ; à la mesure 4, la♭ 7, la dominante, ne conclut pas davantage. Au Calmato (mesure 43), la basse tient la♭ (la dominante) et la main droite joue mi♭ – sol♭ – si♭ – ré♭ : l’accord de mi♭ mineur posé sur la dominante. Cette <b>dominante de onzième</b> prolonge l’attente sans brutalité ; la sensible do n’apparaît qu’à la fin de la mesure, dans la mélodie.</p>
${W.score({ abc: CLAIR.e1, title: 'Mesures 1 à 4', bpm: 40, startBpm: 36 })}

<h2>2. Les accords parallèles</h2>
<p>Ce que la conduite des voix classique évite (le bloc qui se déplace en entier), Debussy le recherche : aux mesures 15 à 18, les accords glissent ensemble, comme un seul timbre. On parle d’accords parallèles. Même idée aux mesures 45-46 : sol♭, fa mineur et mi♭ mineur se succèdent au-dessus de la pédale de la♭.</p>
${W.score({ abc: CLAIR.e2, title: 'Mesures 15 à 18 : accords parallèles sur une pédale', bpm: 40, startBpm: 34 })}

<h2>3. Les pédales</h2>
<p>Une note tenue (ou répétée) à la basse pendant que les accords changent au-dessus : mi♭ aux mesures 15 à 18, la♭ aux mesures 43 à 46. La pédale fixe un socle stable ; les accords peuvent alors flotter sans que l’on perde la tonalité.</p>

<h2>4. Le mode mineur emprunté</h2>
<p>Debussy emprunte régulièrement des notes à ré♭ <b>mineur</b> : si𝄫 (le 6e degré abaissé), fa♭ (la tierce mineure), do♭.</p>
<ul>
<li>Mesure 2 : sol♭ – si𝄫 à la main gauche, sous do – mi♭ : une septième diminuée qui contient le si𝄫 du mineur, une ombre très douce.</li>
<li>Mesure 20 : la même septième diminuée, avec cette fois si𝄫 à la basse.</li>
<li>Mesures 27-28 (et 35-36) : fa mineur devient fa♭ majeur, et la mélodie ajoute ré♭ : on entend ré♭ mineur.</li>
<li>Mesure 50 : sol♭ – la♮ – ré♭ (la♮ = si𝄫) : sol♭ mineur, le IV rendu mineur, juste avant le retour du thème.</li>
</ul>
${W.score({ abc: CL_27, title: 'Mesures 27-28 (réduction) : fa mineur, puis fa♭ majeur', bpm: 56, startBpm: 46, practice: false, analysis: AN_CL27, caption: 'Réduction : les arpèges de la main gauche sont ramenés à des accords, un par temps.' })}
<p>Ces couleurs préparent l’<b>En animant</b> (mesure 37) : ré♭ mineur y devient une vraie tonalité. Il s’écrirait avec huit bémols (dont si𝄫) ; Debussy l’écrit <b>do♯ mineur</b>, quatre dièses : le même son, une orthographe lisible.</p>

<h2>5. La basse qui conduit, et le retour</h2>
<p>Dans l’En animant, la basse descend une octave entière, note à note, et les accords la suivent. Le retour vers ré♭ majeur se fait sans transition : fa♯ m7, la sous-dominante de do♯ mineur, mène à sol♯… écrit la♭ : la dominante, commune à do♯ mineur et à ré♭ majeur.</p>
${W.score({ abc: CL_37, title: 'Mesures 37 à 43 (réduction harmonique)', bpm: 56, startBpm: 46, practice: false, analysis: AN_CL37, caption: 'Réduction : un accord par temps ; la basse est écrite une octave plus bas que dans la partition, la mélodie est omise.' })}
<p>Un dernier procédé, plus discret : à la mesure 34, sol♭ – si♭ – ré♮ puis la♭ – do – mi♮ sont deux <b>accords augmentés</b> (deux tierces majeures superposées). Le mi♮ monte vers fa, la tierce de ré♭ : une dominante « augmentée », qui attire vers la mesure 35.</p>

${W.key('À retenir', '<ul><li>Clair de lune reste tonal (ré♭ majeur), mais les accords sont choisis pour leur couleur.</li><li>Septièmes, neuvièmes, onzièmes sans résolution obligée.</li><li>Accords parallèles : le bloc glisse en entier.</li><li>Pédales : une basse fixe sous des accords mobiles.</li><li>Mode mineur emprunté : si𝄫, fa♭, do♭… jusqu’à do♯ mineur (= ré♭ mineur).</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Croire que Debussy « ne respecte pas les règles » : il en choisit d’autres, et l’oreille les suit très bien.</li><li>Chercher partout des cadences : beaucoup de phrases se terminent par un glissement, pas par V – I.</li><li>Jouer les accords parallèles en détachant chaque voix : c’est un seul timbre, à fondre avec la pédale.</li></ul>')}

<h2>Dans ta pièce cette semaine : mesures 27 à 50</h2>
<ul>
<li><b>Un poco mosso (27-36)</b> : des arpèges sur la basse ré♭ – fa – la♭ ; fa♭ et do♭ apportent la couleur de ré♭ mineur ; aux mesures 30-31, mi♭ 9 puis la♭ 9 (dominante de la dominante, puis dominante) ; mesure 34, les deux accords augmentés.</li>
<li><b>En animant (37-42)</b> : do♯ mineur, la basse qui descend, le forte des mesures 41-42 sur fa♯ m7.</li>
<li><b>Calmato (43-50)</b> : la pédale de la♭, la mélodie au milieu du clavier, les accords qui glissent (45-46), sol♭ majeur puis sol♭ mineur (49-50) avant le retour du thème.</li>
</ul>

<h2>Exercices</h2>
${W.exo('Exercice 1 — Les notes empruntées', '<p>Dans les mesures 27 à 36, quelles notes ne font pas partie de ré♭ majeur ? D’où viennent-elles ?</p><details><summary>Corrigé</summary><div><p>Fa♭ et do♭ (mesures 27-28 et 35-36) viennent de ré♭ mineur (tierce et septième mineures). Sol♮ (mesure 30) est la tierce de mi♭ 9, la dominante de la dominante. Ré♮ (mesures 33-34) brode mi♭, puis devient, avec mi♮ (mesure 34), la quinte haussée d’un accord augmenté.</p></div></details>')}
${W.exo('Exercice 2 — L’orthographe', '<p>Pourquoi l’En animant est-il écrit en do♯ mineur plutôt qu’en ré♭ mineur ?</p><details><summary>Corrigé</summary><div><p>Ré♭ mineur demanderait huit bémols à l’armure (dont un double bémol, si𝄫) ; do♯ mineur ne demande que quatre dièses. Même son, lecture bien plus simple : c’est une écriture enharmonique.</p></div></details>')}
${W.exo('Exercice 3 — À l’oreille et au clavier', '<p>Joue les accords des mesures 15 à 18 sans la mélodie, puis enchaîne do majeur → ré mineur en accords parallèles (do – mi – sol → ré – fa – la, mains ensemble). Quelle différence avec l’enchaînement correct du chapitre sur la conduite des voix ?</p><details><summary>Corrigé</summary><div><p>Les accords parallèles sonnent comme un seul timbre qui glisse : c’est l’effet recherché par Debussy. Dans un choral, les quintes et octaves parallèles affaiblissent l’indépendance des voix ; ici, il n’y a pas de voix indépendantes à protéger.</p></div></details>')}
`,
  },

  {
    id: 'n2-th6', minutes: 20,
    title: 'Les formes',
    summary: 'Du plan d’une phrase à celui d’une sonate : savoir où l’on est pour savoir où l’on va. Application : le plan complet de l’op. 15 n° 1 et de Clair de lune.',
    goals: ['Reconnaître les formes binaire, ternaire, rondo, sonate.', 'Distinguer période et phrase en trois temps.', 'Faire le plan de ses pièces et en tirer une stratégie d’interprétation.'],
    body: W => `
<h2>À l’échelle de la phrase</h2>
<ul>
<li><b>La période</b> (vue au niveau 1) : un antécédent qui finit en suspens, un conséquent qui conclut.</li>
<li><b>La phrase en trois temps</b> : une idée de deux mesures, répétée ou variée (présentation), puis une suite qui se fragmente et accélère (continuation), et enfin une cadence. Souvent 2 + 2 + 4 mesures.</li>
</ul>

<h2>Les grandes formes</h2>
<h3>Ternaire (ABA)</h3>
${W.diagram('form', { total: 48, noBars: true, sections: [
  { label: 'A', kind: 'A', from: 1, to: 16, key: 'tonalité principale', note: 'thème' },
  { label: 'B', kind: 'B', from: 17, to: 32, key: 'autre tonalité ou autre mode', note: 'contraste' },
  { label: 'A′', kind: 'A', from: 33, to: 48, key: 'tonalité principale', note: 'retour, souvent varié' },
] }, 'La forme de la plupart des nocturnes, des valses, des mazurkas… et de tes pièces de ces deux niveaux.')}
<h3>Rondo (ABACA)</h3>
${W.diagram('form', { total: 40, noBars: true, sections: [
  { label: 'A', kind: 'A', from: 1, to: 8, note: 'refrain' },
  { label: 'B', kind: 'B', from: 9, to: 16, note: 'couplet' },
  { label: 'A', kind: 'A', from: 17, to: 24, note: 'refrain' },
  { label: 'C', kind: 'C', from: 25, to: 32, note: 'couplet' },
  { label: 'A', kind: 'A', from: 33, to: 40, note: 'refrain' },
] }, 'Un refrain qui revient entre des couplets différents : fréquent dans les finales de sonates classiques.')}
<h3>Forme sonate</h3>
${W.diagram('form', { total: 112, noBars: true, sections: [
  { label: 'T1', kind: 'A', from: 1, to: 14, key: 'I', note: 'exposition' },
  { label: 'trans.', kind: 'C', from: 15, to: 20 },
  { label: 'T2', kind: 'B', from: 21, to: 40, key: 'V ou relatif' },
  { label: 'Développement', kind: 'D', from: 41, to: 64, key: 'tonalités éloignées', note: 'fragments, marches' },
  { label: 'T1', kind: 'A', from: 65, to: 78, key: 'I', note: 'réexposition' },
  { label: 'trans.', kind: 'C', from: 79, to: 84 },
  { label: 'T2', kind: 'B', from: 85, to: 104, key: 'I' },
  { label: 'Coda', kind: 'coda', from: 105, to: 112 },
] }, 'Exposition : deux thèmes dans deux tonalités. Développement : le conflit. Réexposition : les deux thèmes dans la tonalité principale.')}
<ul>
<li><b>Binaire (AB)</b> : deux parties, chacune reprise ; la première module, la seconde revient. La forme des danses baroques.</li>
<li><b>Thème et variations</b> : un thème, puis des transformations successives (ornements, mode, caractère).</li>
<li><b>Ballade</b> : chez Chopin, une forme libre et narrative, qui emprunte à la sonate ses deux thèmes contrastés et ses retours transformés. Ce sera l’objet du niveau 6.</li>
</ul>

${W.key('À retenir', '<ul><li>Ternaire ABA : contraste puis retour ; la forme du nocturne.</li><li>Rondo : un refrain entre des couplets.</li><li>Sonate : exposition (deux thèmes, deux tonalités), développement, réexposition.</li><li>Les limites des sections se repèrent aux cadences, aux changements de tonalité, de tempo et de texture.</li></ul>')}
${W.warn('Erreurs fréquentes', '<ul><li>Découper d’après la mise en page de la partition plutôt que d’après la musique.</li><li>Oublier les transitions : elles sont souvent les moments les plus délicats à jouer.</li><li>Jouer un retour (A′) exactement comme le début : le chemin parcouru l’a changé.</li></ul>')}

<h2>Dans ta pièce cette semaine : les plans complets</h2>
<table>
<thead><tr><th>Section</th><th>Mesures</th><th>Tonalités et repères</th></tr></thead>
<tbody>
<tr><td>A (Andante cantabile)</td><td>1-24</td><td>fa majeur ; trois phrases de 8 mesures ; sommet mesure 20 ; arrêt sur do 7 et silence (24)</td></tr>
<tr><td>B (Con fuoco)</td><td>25-48</td><td>fa mineur (25-28) → ré♭ majeur (29-34) → do 7 (35-36) → fa mineur (37-40) → marche ascendante (41-44) → quintes descendantes et retour (45-48)</td></tr>
<tr><td>A′ (reprise)</td><td>49-74</td><td>fa majeur ; même harmonie, mélodie ornée (septolet m. 54) ; sommet mesure 68 ; cadence finale do 7 → fa sur la pédale de fa</td></tr>
</tbody></table>
<table>
<thead><tr><th>Clair de lune</th><th>Mesures</th><th>Repères</th></tr></thead>
<tbody>
<tr><td>A</td><td>1-26</td><td>thème en tierces sans basse (1-8), la basse ré♭ arrive (9) ; Tempo rubato, accords parallèles (15-18) ; « peu à peu cresc. et animé » (19), sommet (25)</td></tr>
<tr><td>B</td><td>27-50</td><td>Un poco mosso, arpèges (27-36) ; En animant, do♯ mineur (37-42) ; Calmato, pédale de la♭ (43-50)</td></tr>
<tr><td>A′</td><td>51-65</td><td>a Tempo 1°, le thème du début, ppp, sur des arpèges</td></tr>
<tr><td>Coda</td><td>66-72</td><td>morendo jusqu’à la fin : le motif d’arpèges de l’Un poco mosso</td></tr>
</tbody></table>
<p>Et l’op. 55 n° 1 (niveau 1) : A (1-48), Più mosso (48-72), retour abrégé du thème (73-76), coda (77-101).</p>

<h2>Pourquoi c’est utile au piano</h2>
<ul>
<li><b>Doser l’énergie</b> : un seul vrai sommet par section, le plus fort dans la section la plus intense.</li>
<li><b>Varier les retours</b> : un thème qui revient ne se joue pas deux fois pareil.</li>
<li><b>Mémoriser</b> : on retient beaucoup mieux une pièce dont on connaît le plan, et l’on sait repartir après un trou.</li>
</ul>
${W.exo('Exercice — Repérer les frontières', '<p>Dans l’op. 15 n° 1, qu’est-ce qui signale le début de B (mesure 25) et le début de A′ (mesure 49) ? Donne au moins deux indices pour chacun.</p><details><summary>Corrigé</summary><div><p>Mesure 25 : silence et point d’orgue juste avant, changement de mode (fa mineur), de tempo (<i>con fuoco</i>), de nuance (forte) et de texture (doubles notes et gammes). Mesure 49 : retour de fa majeur et du thème, retour de la texture de l’Andante (main gauche à trois voix), après une mesure de transition (48) qui ralentit et prépare.</p></div></details>')}
${W.checklist({ id: 'n2-th6-check', title: 'À faire', items: ['J’ai noté le plan de l’op. 15 n° 1 sur ma partition (A, B, A′ et les phrases).', 'J’ai noté le plan de Clair de lune, avec les indications de tempo de chaque section.', 'Pour chaque section, j’ai choisi où se trouve le sommet.'] })}
`,
  },

  {
    id: 'n2-th-synthese', minutes: 25,
    title: 'Synthèse : analyser une pièce seul',
    summary: 'Une méthode en six étapes, appliquée à toute l’op. 15 n° 1 : ce que tu sais maintenant lire dans une partition, et ce que cela change à ton jeu.',
    goals: ['Appliquer une méthode d’analyse complète.', 'Comparer la reprise et le début de l’op. 15.', 'Relier chaque observation à une décision d’interprétation.'],
    body: W => `
<p>Ce chapitre ne t’apprend rien de nouveau : il rassemble. Prends ta partition et un crayon, et suis les six étapes. Les corrigés sont là pour vérifier, pas pour lire avant d’avoir cherché.</p>

<h2>La méthode en six étapes</h2>
<ol>
<li><b>Le plan</b> : sections, indications de tempo, tonalités principales.</li>
<li><b>Les cadences</b> : où la musique respire-t-elle, où conclut-elle ?</li>
<li><b>Les accords</b> d’une phrase type : nom, chiffrage, fonction.</li>
<li><b>Les altérations</b> : dominantes secondaires, emprunts au mineur, modulations.</li>
<li><b>Les procédés</b> : pédales, marches, sixtes napolitaine et augmentée.</li>
<li><b>Les conséquences pour le jeu</b> : sommets, couleurs, transitions, rubato.</li>
</ol>

<h2>Application : l’op. 15 n° 1</h2>
${W.exo('1. Le plan', '<p>Donne les trois sections, leurs mesures et leurs tonalités.</p><details><summary>Corrigé</summary><div><p>A (1-24) fa majeur ; B (25-48) fa mineur, puis ré♭ majeur, retour par si♭ mineur ; A′ (49-74) fa majeur.</p></div></details>')}
${W.exo('2. Les cadences', '<p>Comment finissent l’Andante (mesure 24), le Con fuoco (mesure 48) et la pièce (mesures 72-74) ?</p><details><summary>Corrigé</summary><div><p>Mesure 24 : arrêt sur do 7, au-dessus de la basse fa (un effet de demi-cadence), suivi d’un silence. Mesure 48 : si♭ mineur (iv), qui ramène à fa majeur. Mesures 72-74 : do 7 sur la pédale de fa, puis fa ; dans la mélodie, sol (quinte de do 7) descend sur fa. La cadence parfaite complète, avec la basse do → fa, se trouve aux mesures 21-22 (et 69-70).</p></div></details>')}
${W.exo('3. Les accords', '<p>Nomme les accords des mesures 3 et 4 et donne leur fonction.</p><details><summary>Corrigé</summary><div><p>Mesure 3 : sol m7 sur fa (ii7, sous-dominante), puis do 7 (V7, dominante). Mesure 4 : fa (I, tonique), la 7 (V7/vi), ré mineur (vi).</p></div></details>')}
${W.exo('4. Les altérations', '<p>Mesures 4 à 8 : à quoi servent do♯, si♮, ré♭ et sol♯ ?</p><details><summary>Corrigé</summary><div><p>Do♯ : sensible de ré (V7/vi). Si♮ : sensible de do (V7/V). Ré♭ : emprunt à fa mineur (iiø7). Sol♯ : sensible de la (V7/iii). Trois dominantes secondaires et un emprunt.</p></div></details>')}
${W.exo('5. Les procédés', '<p>Trouve une pédale, une marche ascendante, une marche descendante et une sixte augmentée.</p><details><summary>Corrigé</summary><div><p>Pédale de fa (mesures 1-3) ; pédale de ré♭ (mesures 29-34, presque continue). Marche ascendante : mesures 41-44 (la♭ 7 → si♭ 7). Marche descendante : 45-47 (si♭ – mi♭ – la♭ – ré♭). Sixte augmentée : mesure 18 (et 66) ; la mesure 16 (et 64) en a le son, comme accord de passage.</p></div></details>')}
${W.exo('6. La reprise', '<p>Compare les mesures 49 à 74 aux mesures 1 à 24 : qu’est-ce qui reste, qu’est-ce qui change ?</p><details><summary>Corrigé</summary><div><p>L’harmonie est presque identique (les mesures 53-55 reprennent 5-7, 63-67 reprennent 15-19, le sommet de la mesure 68 reprend celui de la mesure 20). La mélodie est ornée (septolet de la mesure 54), et la fin conclut sur fa au lieu de s’arrêter sur do 7.</p></div></details>')}
${W.score({ abc: OP15.e5, title: 'La reprise, mesures 53 à 55 (= 5 à 7)', bpm: 66, startBpm: 46 })}

<h2>Ce que l’analyse change au piano</h2>
<ul>
<li><b>Sommets</b> : dans la première phrase, la mélodie culmine à la mesure 4 (la) et la tension harmonique à la mesure 5 ; pour l’Andante entier, mesure 20 ; pour la reprise, mesure 68.</li>
<li><b>Couleurs</b> : le ré♭ de la mesure 5 est une ombre, à jouer plus doux, pas plus fort ; les dominantes secondaires s’éclairent légèrement.</li>
<li><b>Transitions</b> : le silence de la mesure 24 se tient ; la mesure 48 ralentit et prépare le retour.</li>
<li><b>Reprise</b> : plus intime que le début, puisque tout a déjà été dit.</li>
</ul>
${W.checklist({ id: 'n2-th-synthese-check', title: 'Je sais…', items: ['dire de mémoire le plan de l’op. 15 n° 1 et ses tonalités ;', 'nommer les accords des mesures 1 à 8 en les jouant en blocs ;', 'montrer une dominante secondaire, une marche et une sixte augmentée dans la partition ;', 'expliquer en une phrase comment Clair de lune passe de ré♭ majeur à do♯ mineur, et revient.'] })}
`,
  },
];

export default [...PART1, ...PART2];
