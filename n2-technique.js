// Niveau 2 — Technique
import { OP15, CLAIR } from './content-excerpts.js';

// Trait de la main gauche, mesure 25 du Con fuoco : impulsions (groupe rapide + arrêt)
const EX_BURST = `X:1
M:3/4
L:1/16
K:Fmin clef=bass
%%barnumbers 1
"^groupe 1, puis arrêt"(6:4:6C,=B,,C,D,C,=B,, C,8 | "^groupe 2, puis arrêt"(6:4:6C,_B,,A,,G,,F,,=E,, F,,8 | "^groupe 3, puis arrêt"(6:4:6F,,_E,,D,,C,,B,,,A,,, F,,,8 |]`;

// Le même trait en rythmes pointés, puis inversés
const EX_RHY = `X:1
M:3/4
L:1/16
K:Fmin clef=bass
%%barnumbers 1
"^long – bref"C,3=B,, C,3D, C,3=B,, | C,3_B,, A,,3G,, F,,3=E,, | F,,3_E,, D,,3C,, B,,,3A,,, | F,,,12 |
"^bref – long"C,=B,,3 C,D,3 C,=B,,3 | C,_B,,3 A,,G,,3 F,,=E,,3 | F,,_E,,3 D,,C,,3 B,,,A,,,3 | F,,,12 |]`;

// Rotation : trémolo d'octave brisée
const EX_TREM = `X:1
M:3/4
L:1/16
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] (6:4:6!1!C!5!cCcCc (6:4:6CcCcCc (6:4:6CcCcCc | (6:4:6DdDdDd (6:4:6DdDdDd (6:4:6DdDdDd |
[V:LH] (6:4:6!5!C,,!1!C,C,,C,C,,C, (6:4:6C,,C,C,,C,C,,C, (6:4:6C,,C,C,,C,C,,C, | (6:4:6D,,D,D,,D,D,,D, (6:4:6D,,D,D,,D,D,,D, (6:4:6D,,D,D,,D,D,,D, |
[V:RH] (6:4:6EeEeEe (6:4:6EeEeEe (6:4:6EeEeEe | (6:4:6FfFfFf (6:4:6FfFfFf (6:4:6FfFfFf | [Cc]12 |]
[V:LH] (6:4:6E,,E,E,,E,E,,E, (6:4:6E,,E,E,,E,E,,E, (6:4:6E,,E,E,,E,E,,E, | (6:4:6F,,F,F,,F,F,,F, (6:4:6F,,F,F,,F,F,,F, (6:4:6F,,F,F,,F,F,,F, | [C,,C,]12 |]`;

// Rotation : basse d'Alberti
const EX_ALBERTI = `X:1
M:4/4
L:1/16
K:C clef=bass
"^I"!5!C,!1!G,!3!E,!1!G, C,G,E,G, C,G,E,G, C,G,E,G, | "^IV"C,A,F,A, C,A,F,A, "^V"B,,G,D,G, B,,G,D,G, | "^I"C,G,E,G, C,G,E,G, C,8 |]`;

// Rotation : les doubles notes du Con fuoco, en quatre étapes
const EX_ROT_CF = `X:1
M:3/4
L:1/16
K:Fmin
"^1"[A,CFA]12 | "^2"[A,F]2[CA]2 [A,F]2[CA]2 [A,F]2[CA]2 | "^3"(3[A,F]2[CA]2[A,F]2 (3[CA]2[A,F]2[CA]2 (3[A,F]2[CA]2[A,F]2 | "^4"(6:4:6[A,F][CA][A,F][CA][A,F][CA] (6:4:6[A,F][CA][A,F][CA][A,F][CA] (6:4:6[A,F][CA][A,F][CA][A,F][CA] | [A,F]12 |]`;

// Polyphonie de la main gauche : la basse et la voix en noires seules (op. 15 n° 1, mesures 1 à 4)
const EX_LAYERS = `X:1
M:3/4
L:1/16
K:F
%%barnumbers 1
%%setbarnb 0
%%score (LH1 LH2)
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=down
[V:LH1] z4 | F4 F4 E4 | D4 E4 C4 | D4 E4 C4 | C4 ^C4 D4 |]
[V:LH2] x4 | F,12 | F,12 | F,12 | F,4 E,4 D,4 |]`;

// Octaves : gamme de fa mineur harmonique
const EX_OCT = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] [Ff][Gg] [Aa][Bb] [cc'][dd'] [=e=e'][ff'] | [=e=e'][dd'] [cc'][Bb] [Aa][Gg] [Ff]2 |]
[V:LH] [F,,F,][G,,G,] [A,,A,][B,,B,] [C,C][D,D] [=E,=E][F,F] | [=E,=E][D,D] [C,C][B,,B,] [A,,A,][G,,G,] [F,,F,]2 |]`;

// Accords : i – iv – V7 – i en accords pleins
const EX_CHORDS = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^i"[FAcf]4 "^iv"[FBdf]4 | "^V7"[=EGB=e]4 "^i"[FAcf]4 |]
[V:LH] [F,,F,]4 [B,,,B,,]4 | [C,,C,]4 [F,,F,]4 |]`;

// Gamme chromatique
const EX_CHROM = `X:1
M:4/4
L:1/16
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] !1!C!3!^C!1!D!3!^D !1!E!2!F!3!^F!1!G !3!^G!1!A!3!^A!1!B !2!c4 | !2!c!1!B!3!_B!1!A !3!_A!1!G!3!_G!2!F !1!E!3!_E!1!D!3!_D !1!C4 |]
[V:LH] !1!C,!3!^C,!1!D,!3!^D, !2!E,!1!F,!3!^F,!1!G, !3!^G,!1!A,!3!^A,!2!B, !1!C4 | !1!C!2!B,!3!_B,!1!A, !3!_A,!1!G,!3!_G,!1!F, !2!E,!3!_E,!1!D,!3!_D, !1!C,4 |]`;

// Arpèges de septième de dominante (sol 7) et de septième diminuée (si – ré – fa – la♭)
const EX_ARP7 = `X:1
M:4/4
L:1/16
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^sol 7"!1!G!2!B!3!d!4!f !1!g!2!b!3!d'!4!f' !5!g'f'd'b gfdB | G4 z4 z8 | "^7e diminuée"!1!B!2!d!3!f!4!_a !1!b!2!d'!3!f'!4!_a' !5!b'_a'f'd' b_afd | B4 z4 z8 |]
[V:LH] !5!G,,!4!B,,!3!D,!2!F, !1!G,!4!B,!3!D!2!F !1!GFDB, G,F,D,B,, | G,,4 z4 z8 | !5!B,,!4!D,!3!F,!2!_A, !1!B,!4!D!3!F!2!_A !1!B_AFD B,_A,F,D, | B,,4 z4 z8 |]`;

export default [
  {
    id: 'n2-t1', minutes: 25,
    title: 'Méthode pour les passages rapides',
    summary: 'La vitesse ne s’obtient pas en jouant vite plus souvent, mais en organisant le trait en groupes.',
    goals: ['Comprendre pourquoi un trait rapide se joue par groupes.', 'Travailler un trait par impulsions, rythmes et accents déplacés.', 'Monter en tempo sans crispation.'],
    body: W => `
<p>À vitesse réelle, le cerveau ne commande plus chaque doigt l’un après l’autre : il enchaîne des <b>groupes</b> de notes, chacun déclenché par une seule intention. Travailler un trait rapide, c’est construire ces groupes, puis les relier. Le terrain d’entraînement de ce niveau : le Con fuoco de l’op. 15 n° 1, où la main gauche dévale le clavier en sextolets (mesure 25).</p>

<h2>Le lent ne suffit pas</h2>
<p>Le travail lent (voir <a href="#/lecon/n1-t1">la méthode du niveau 1</a>) fixe les notes et le doigté. Mais un geste lent n’est pas le geste rapide ralenti : à vitesse, la main se déplace par blocs, le poignet et le bras accompagnent autrement. Il faut donc aussi jouer <b>de très courts fragments à la vitesse finale</b>, détendu. C’est le principe des impulsions.</p>

<h2>1. Les impulsions</h2>
<p>Joue un groupe de notes à la vitesse finale, d’un seul geste, puis <b>arrête-toi</b> sur la première note du groupe suivant. Pendant l’arrêt, vérifie que la main est souple et prépare le groupe suivant, les doigts déjà au-dessus des touches. Allonge ensuite les groupes : un groupe et un arrêt, puis deux groupes et un arrêt, puis le trait entier.</p>
${W.score({ abc: EX_BURST, title: 'Mesure 25, main gauche : par impulsions', bpm: 84, startBpm: 72, hands: false, caption: 'Chaque groupe de six notes part d’un seul geste et s’arrête sur une note longue. Le premier groupe n’est qu’une broderie autour de do ; les deux autres descendent la gamme.' })}

<h2>2. Les rythmes</h2>
<p>En rythme pointé (long – bref), chaque note impaire devient une note d’appui et la note brève s’enchaîne d’un geste rapide ; en rythme inversé (bref – long), c’est l’inverse. Les deux versions entraînent toutes les jonctions du trait.</p>
${W.score({ abc: EX_RHY, title: 'Le même trait en rythmes', bpm: 60, startBpm: 50, hands: false, caption: 'Garde un son égal sur les notes longues et brèves ; la note brève ne doit pas être écrasée.' })}

<h2>3. Les accents déplacés</h2>
<p>Dans un groupe de six, accentue la 1re note, puis la 2e, puis la 3e… Chaque doigt prend tour à tour la responsabilité du temps ; les doigts faibles apparaissent tout de suite. Termine toujours par une version sans accent, égale.</p>

<h2>4. Les blocs</h2>
<p>Plaque en accord les notes d’une même position de main : la main apprend la forme et le déplacement d’une position à l’autre. C’est particulièrement utile pour les arpèges (mesure 26 : fa – ré♭ – fa en une position, si♭ – ré♭ – fa en une autre) et pour les doubles notes (leçon suivante).</p>

<h2>5. Le jeu en surface</h2>
<p>Joue le trait à la surface des touches, sans les enfoncer : on entraîne l’enchaînement des doigts et les déplacements sans fatigue et sans bruit. Très utile en fin de séance, ou pour contrôler la détente.</p>

<h2>Monter en tempo</h2>
<ol>
<li>Trouve ton <b>tempo de travail</b> : le plus rapide auquel le passage est juste <b>et</b> détendu.</li>
<li>Monte de 4 battements par palier, à condition de réussir trois fois de suite.</li>
<li>À la première faute ou crispation, redescends de 8 et repars : on progresse en dents de scie, chaque cycle finissant un peu plus haut.</li>
<li>Termine la séance au tempo de travail, jamais au tempo maximal du jour.</li>
</ol>
${W.metronome({ bpm: 60, beats: 3 })}
${W.warn('Vite et crispé : ce n’est pas encore vite', '<p>Si l’épaule monte ou si l’avant-bras durcit, le tempo est trop rapide pour aujourd’hui. La vitesse durable vient de la détente : un geste juste, répété à un tempo maîtrisé, accélère tout seul d’une séance à l’autre.</p>')}

${W.exo('À faire : les mesures 25 et 26 du Con fuoco', `<ol>
<li>Main gauche seule, lentement : notes et doigté.</li>
<li>Impulsions (premier exercice), à ♩ = 72 puis plus vite.</li>
<li>Rythmes pointés puis inversés (deuxième exercice).</li>
<li>Le trait entier, puis avec l’arpège et les deux notes accentuées de la mesure 26.</li>
<li>Montée en tempo en dents de scie, sur plusieurs jours, vers ♩ = 84.</li>
</ol>`)}
${W.score({ abc: OP15.e3, title: 'Con fuoco, mesures 25 à 28', bpm: 84, startBpm: 46, caption: 'Choisis « MG » pour écouter la main gauche seule.' })}
${W.analyzer({ mode: 'evenness', title: 'Analyseur — régularité du trait', bpm: 60, sub: 6, help: 'Joue le trait de la mesure 25 (main gauche). L’analyse mesure l’égalité des durées et des nuances. Avec « Avec métronome » et « 6 notes par temps », elle indique aussi ton avance ou ton retard.' })}
${W.links([
  W.informance('/content/pages/471-the-practice-tools', 'The Practice Tools', 'Graham Fitch — les outils de travail (en anglais)'),
  W.informance('/content/pages/207-finding-effortless-speed/1464-deconstructing-the-scale', 'Finding Effortless Speed'),
], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-t2', minutes: 25,
    title: 'La rotation de l’avant-bras',
    summary: 'Le geste de base de tous les motifs qui alternent deux côtés de la main : trémolos, basses d’Alberti, doubles notes alternées.',
    goals: ['Comprendre la rotation (pronation et supination).', 'L’appliquer au trémolo, à la basse d’Alberti et aux octaves brisées.', 'Jouer les doubles notes du Con fuoco régulières et sans crispation.'],
    body: W => `
<p>Essaie d’alterner très vite do3 et do4, pouce et 5e doigt, en ne bougeant que les doigts : la main se fatigue en quelques secondes. Fais maintenant pivoter l’avant-bras, comme pour tourner une clé dans une serrure : chaque doigt est porté vers sa touche par ce pivotement, presque sans effort. C’est la <b>rotation</b>.</p>
${W.diagram('rotation', {}, 'Vers le pouce, c’est la pronation ; vers le 5e doigt, la supination. Le mouvement part de l’avant-bras, le coude reste libre.')}

<h2>Le principe</h2>
<ul>
<li>Le mouvement vient de l’<b>avant-bras</b> qui pivote ; le poignet reste souple, le coude libre.</li>
<li>Les doigts sont fermes mais ne frappent pas : ils transmettent le mouvement à la touche.</li>
<li>Plus c’est rapide, plus la rotation est petite. À vitesse réelle, elle devient presque invisible, mais elle reste la source du geste.</li>
<li>On l’exagère au début, lentement, pour bien la sentir ; puis on la réduit progressivement.</li>
</ul>

<h2>Exercice 1 — Le trémolo d’octave brisée</h2>
${W.score({ abc: EX_TREM, title: 'Trémolo d’octave brisée', bpm: 80, startBpm: 50, practice: false, caption: 'Main droite : 1 sur la note grave, 5 sur l’aiguë. Main gauche : 5 en bas, 1 en haut. D’abord en croches avec une rotation ample, puis en triolets, puis en sextolets.' })}
${W.analyzer({ mode: 'evenness', title: 'Analyseur — régularité du trémolo', bpm: 80, sub: 6, help: 'Joue le trémolo d’une main, au moins deux mesures. Objectif du niveau : irrégularité inférieure à 8 % à ♩ = 80 en sextolets (« Avec métronome », 6 notes par temps).' })}

<h2>Exercice 2 — La basse d’Alberti</h2>
<p>La basse d’Alberti (do – sol – mi – sol) est une rotation en trois points : le 5e doigt et le 3e d’un côté, le pouce de l’autre, qui sert de pivot.</p>
${W.score({ abc: EX_ALBERTI, title: 'Basse d’Alberti (main gauche)', bpm: 88, startBpm: 60, caption: 'Le pouce reste léger, presque passif : c’est la rotation qui fait sonner la note du bas.' })}

<h2>Dans le nocturne : les doubles notes du Con fuoco</h2>
<p>La main droite alterne deux sixtes : la♭ – fa et do – la♭. Ensemble, elles forment une position de main (la♭ – do – fa – la♭), avec un doigté naturel : <b>1 et 4</b> pour la♭ – fa, <b>2 et 5</b> pour do – la♭ (vérifie-le dans ton édition). La rotation fait basculer la main d’une sixte à l’autre.</p>
${W.score({ abc: EX_ROT_CF, title: 'Les doubles notes de la mesure 25, en quatre étapes', bpm: 72, startBpm: 46, hands: false, caption: '1 : la position (un seul accord) ; 2 : la rotation en croches, ample ; 3 : en triolets ; 4 : en sextolets. Accélère seulement quand l’étape précédente est souple.' })}
${W.exo('Puis, mesures 25 à 28', `<ol>
<li>Les quatre étapes ci-dessus pour chaque mesure : chaque mesure a sa propre position.</li>
<li>Impulsions : un sextolet rapide, arrêt sur la première double note du temps suivant.</li>
<li>Accent sur la sixte du haut, puis sur celle du bas.</li>
<li>Mains ensemble seulement quand chaque main est régulière seule.</li>
</ol>`)}
${W.score({ abc: OP15.e3, title: 'Con fuoco, mesures 25 à 28', bpm: 84, startBpm: 46, caption: 'Choisis « MD » pour écouter la main droite seule.' })}
${W.tip('Les mesures 45 à 48', '<p>Plus loin dans le Con fuoco, les deux mains alternent des notes deux à deux (si♭ – ré, mi♭ – si♭, la♭ – si♭…) : c’est encore la rotation, sous une mélodie tenue à la main droite. Prépare-les avec le trémolo de l’exercice 1.</p>')}
${W.links([
  W.informance('/content/pages/143-a-practical-guide-to-forearm-rotation', 'A Practical Guide to Forearm Rotation'),
  W.informance('/content/pages/56-playing-double-notes-at-the-advanced-level', 'Playing Double Notes at the Advanced Level'),
], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-t3', minutes: 25,
    title: 'La polyphonie de la main gauche',
    summary: 'Une main, trois voix : faire entendre chacune à sa juste place, toutes liées.',
    goals: ['Identifier les trois voix de la main gauche de l’op. 15 n° 1.', 'Tenir une voix au doigt pendant que les autres bougent.', 'Doser chaque voix : basse et voix en noires présentes, triolets murmurés.'],
    body: W => `
<p>Dans l’Andante de l’op. 15 n° 1, la main gauche ne se contente pas d’accompagner : elle joue <b>trois voix</b> à la fois. Chopin écrit <i>sempre legato</i> ; le défi est de les lier toutes et de les doser comme trois instruments différents.</p>

<h2>Les trois voix</h2>
<ul>
<li><b>La basse</b> : fa2, en blanches pointées pendant trois mesures, puis une descente pas à pas : fa – mi – ré, ré – ré♭ – do, do – si, si – la (mesures 4 à 7).</li>
<li><b>La voix en noires</b> : elle double d’abord la mélodie à l’octave inférieure (mesures 1-2), puis devient une voix intérieure qui monte chromatiquement, do – do♯ – ré, sous la note tenue de la mélodie (mesure 4). C’est un duo avec la main droite.</li>
<li><b>Les triolets</b> du milieu : le tissu harmonique, qui murmure sans jamais couvrir le reste.</li>
</ul>

<h2>Écoute la différence</h2>
${W.score({ abc: OP15.e1, title: 'Mesures 1 à 8 : deux dosages de la main gauche', bpm: 69, startBpm: 58, variants: [{ label: 'Triolets murmurés', trackGain: { 1: 1.12, 2: 0.6, 3: 1.18 } }, { label: 'Triolets trop présents', trackGain: { 1: 0.85, 2: 1.35, 3: 0.85 } }], caption: 'Même texte, deux dosages. Dans le premier, on suit la basse et la voix en noires ; dans le second, les triolets envahissent tout. Choisis « MG » pour écouter la main gauche seule.' })}

<h2>Travailler par couches</h2>
<ol>
<li><b>La basse et la voix en noires seules</b> (ci-dessous), parfaitement liées. Doigté possible pour la mesure 1 : 5 sur fa2, tenu ; 1 sur fa3 – fa3 – mi3.</li>
<li><b>La voix en noires et les triolets</b>, la basse étant enfoncée en silence (touche baissée sans la jouer) : la main prend sa forme complète.</li>
<li><b>Les trois voix</b>, très lentement : triolets <i>pp</i>, voix en noires <i>mp</i>, basse <i>mp</i>, tenue jusqu’au bout de sa valeur.</li>
<li><b>Une voix chantée, les autres jouées</b> : chante la voix en noires pendant que tu joues la basse et les triolets. Si tu peux la chanter, tu peux la faire entendre.</li>
</ol>
${W.score({ abc: EX_LAYERS, title: 'Mesures 1 à 4 : basse et voix en noires', bpm: 69, startBpm: 50, caption: 'La basse est tenue au doigt pendant toute sa durée, même si la pédale la prolongera ensuite.' })}

<h2>Les doigts qui tiennent, les doigts qui jouent</h2>
<p>Tenir une note pendant que d’autres doigts jouent demande d’abord de la <b>détente</b> : le doigt qui tient garde la touche au fond avec un poids minimal (voir <a href="#/lecon/n1-t2">le test du relâchement</a>), sinon toute la main se crispe. La substitution (changer de doigt sur une note tenue, sans la relever) aide souvent à lier la voix en noires.</p>
${W.tip('Et la pédale ?', '<p>Une pédale par harmonie ajoute la résonance et aide les sauts de la basse. Mais travaille d’abord sans pédale : si les voix ne sont pas liées aux doigts, la pédale ne fera que mélanger.</p>')}
${W.checklist({ id: 'n2-t3-check', title: 'Je vérifie, mesures 1 à 8', items: ['La basse est tenue jusqu’au bout de sa valeur.', 'La voix en noires est liée et s’entend en duo avec la mélodie.', 'Les triolets restent plus doux que les deux autres voix.', 'La main reste souple, même avec une note tenue.'] })}
${W.links([W.informance('/content/pages/176-developing-the-left-hand', 'Developing the Left Hand')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-t4', minutes: 20,
    title: 'Le pianissimo et la palette des nuances',
    summary: 'Une nuance est une vitesse de touche. Le pianissimo se contrôle, il ne s’espère pas.',
    goals: ['Comprendre ce qui fait varier le volume au piano.', 'Produire un pianissimo égal et timbré.', 'Atteindre à la demande pp, p, mf et f, et doser un crescendo.'],
    body: W => `
<p>Le volume d’une note dépend de la <b>vitesse</b> de la touche au moment où le marteau part vers la corde. Un <i>pp</i>, c’est une touche qui descend lentement, mais jusqu’au bout ; un <i>f</i>, une touche rapide. La difficulté du pianissimo est là : si la touche descend trop lentement, la note ne sort pas ; à peine trop vite, elle sonne déjà <i>mf</i>.</p>

<h2>Le geste du pianissimo</h2>
<ul>
<li><b>Partir du contact</b> : le doigt est posé sur la touche avant de jouer, jamais lâché d’au-dessus.</li>
<li><b>Une vitesse lente et constante</b>, jusqu’au fond de la touche ; ne pas freiner à mi-course.</li>
<li><b>Un bras porté</b> : le poids n’est pas libéré comme dans un forte, il est retenu par le bras ; le poignet reste souple.</li>
<li><b>Des doigts proches et fermes</b> : un doigt mou ne transmet pas une vitesse régulière.</li>
<li><b>Écouter le timbre</b> : un bon pianissimo reste timbré, il porte au fond de la salle.</li>
</ul>
${W.tip('Ton piano numérique', '<p>Le P-145 mesure la vitesse de chaque touche (de 1 à 127), et l’analyseur la lit. Si ton piano propose plusieurs réglages de sensibilité du toucher, garde toujours le même (par défaut, « Medium ») pour que tes mesures restent comparables. Si tu n’as que la pédale forte (celle fournie avec le P-145), la couleur <i>con sordina</i> de Debussy devra venir entièrement des doigts : c’est un excellent entraînement.</p>')}

<h2>Écoute : Clair de lune, mesures 1 à 4</h2>
${W.score({ abc: CLAIR.e1, title: 'Le pianissimo de Debussy', bpm: 40, startBpm: 36, variants: [{ label: 'pp, comme écrit', balance: { rh: 0.6, lh: 0.48 } }, { label: 'mf : trop fort', balance: { rh: 1.08, lh: 0.98 } }], caption: 'Au piano échantillonné, la différence touche aussi le timbre : plus sombre et plus doux en pp.' })}

<h2>L’échelle des nuances</h2>
${W.exo('Exercice 1 — Quatre niveaux', '<p>Sur une même note, joue quatre fois chaque nuance : <i>pp</i>, <i>p</i>, <i>mf</i>, <i>f</i>. L’analyseur ci-dessous indique la cible et ta vélocité. Puis recommence sur un accord de trois notes : les trois doigts doivent arriver ensemble.</p>')}
${W.analyzer({ mode: 'dynamics', title: 'Analyseur — nuances', help: 'Joue des notes répétées en visant chaque niveau indiqué. Objectif du niveau : 70 % de notes dans la cible.' })}
${W.exo('Exercice 2 — Le crescendo dosé', '<p>Une gamme de deux octaves, de <i>pp</i> à <i>f</i> en montant, puis de <i>f</i> à <i>pp</i> en descendant. Avec l’analyseur ci-dessous, la courbe des vélocités doit monter puis descendre <b>régulièrement</b>, sans paliers ni sauts. La plupart des pianistes arrivent trop tôt au forte : garde de la réserve pour la fin.</p>')}
${W.analyzer({ mode: 'evenness', title: 'Analyseur — courbe des vélocités', bpm: 60, sub: 4, help: 'Joue la gamme en crescendo puis en decrescendo. Regarde surtout la seconde courbe (vélocité de chaque note) : elle doit former une colline régulière. L’« écart de nuance » sera élevé, c’est normal ici.' })}

<h2>Dans tes pièces</h2>
<ul>
<li><b>Op. 15 n° 1</b> : le <i>p dolcissimo</i> de la mesure 8 et la reprise (mesures 49 à 74), plus intime que le début.</li>
<li><b>Clair de lune</b> : <i>pp</i> dès la première mesure, <i>ppp</i> au retour du thème (mesure 51), <i>morendo</i> jusqu’à la fin.</li>
</ul>
${W.links([W.informance('/content/pages/129-foundations-of-good-technique', 'Foundations of Good Technique')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-t5', minutes: 25,
    title: 'Octaves et accords',
    summary: 'Une main en forme d’octave, un poignet souple, des accords préparés avant d’être joués.',
    goals: ['Jouer des octaves sans raideur : cadre de la main, poignet souple.', 'Lier la voix supérieure d’une suite d’octaves.', 'Préparer et doser un accord plein.'],
    body: W => `
<h2>La main d’octave</h2>
<ul>
<li><b>Un cadre</b> : le pouce et le 5e doigt (ou le 4e sur les touches noires) forment l’octave ; les doigts du milieu restent souples, sans toucher les touches.</li>
<li><b>Un poignet souple</b>, un peu plus haut que d’habitude. Pour les octaves rapides et légères, le geste vient du poignet ; pour les octaves lentes et fortes, de l’avant-bras et du bras.</li>
<li><b>Relâcher entre les octaves</b> : la main se referme légèrement dès que l’octave est jouée. Garder la main ouverte en permanence fatigue vite.</li>
<li><b>Le haut d’abord</b> : dans une mélodie en octaves, c’est la note supérieure qui chante ; le pouce reste léger.</li>
</ul>

<h2>Exercices</h2>
${W.exo('Exercice 1 — Octaves sur place', '<p>Do – do répétés, quatre par temps, en laissant le poignet rebondir légèrement : la main reste en forme, seul le poignet travaille. Puis pouce seul, puis 5e doigt seul, sur le même geste.</p>')}
${W.score({ abc: EX_OCT, title: 'Exercice 2 — Gamme de fa mineur harmonique en octaves', bpm: 60, startBpm: 46, caption: 'Doigté : 1 et 5 sur les touches blanches, 1 et 4 sur les noires (la♭, si♭, ré♭). Écoute la ligne supérieure : elle doit rester liée à l’oreille, même si les octaves ne le sont pas aux doigts.' })}
${W.analyzer({ mode: 'evenness', title: 'Analyseur — régularité des octaves', bpm: 60, sub: 2, help: 'Joue la gamme en octaves, une main à la fois. Les deux notes de chaque octave sont regroupées : l’analyse mesure la régularité d’une octave à l’autre.' })}
${W.tip('Les octaves liées de Chopin', '<p>Pour lier la voix du haut, alterne 4 et 5 (le 4 de préférence sur les touches noires ; sur deux touches blanches successives, 4 puis 5, voire 3 – 4 – 5), le pouce glissant d’une touche à l’autre. On ne lie vraiment que la voix supérieure ; la pédale et la nuance font le reste.</p>')}

<h2>Dans le nocturne : les mesures 41 à 44</h2>
<p>Pendant que la main droite poursuit ses doubles notes, la main gauche chante dans le grave. Mesure 41 : elle frappe l’octave la♭ et la tient (pédale, et 5e doigt si possible), tandis que la mélodie mi♭ – fa – ré♭ – do se glisse à l’intérieur. Mesure 42 : la mélodie passe en octaves, si – do – la♭. Même dessin, un degré plus haut, aux mesures 43 et 44.</p>
${W.score({ abc: OP15.e6, title: 'Con fuoco, mesures 41 à 44', bpm: 84, startBpm: 46, caption: 'Choisis « MG » : la mélodie doit dominer la main droite, pourtant pleine de notes. Les deux voix de la main gauche se lisent séparément (hampes vers le haut : la mélodie).' })}

<h2>Les accords pleins</h2>
<ol>
<li><b>Préparer la forme</b> en l’air, avant de toucher le clavier : la main arrive déjà en position.</li>
<li><b>Un seul geste</b> : tous les doigts ensemble, portés par le poids du bras ; puis relâcher aussitôt, touches au fond.</li>
<li><b>Doser</b> : la note du haut chante, la basse soutient, les notes intérieures se fondent (voir <a href="#/lecon/n1-t4">les plans sonores</a>).</li>
</ol>
${W.score({ abc: EX_CHORDS, title: 'i – iv – V7 – i en accords pleins', bpm: 54, pedal: [0, 2, 4, 6], pedalEnd: 8, caption: 'Une pédale par accord, prise juste après l’attaque. La voix supérieure fa – fa – mi – fa doit rester au-dessus.' })}
${W.analyzer({ mode: 'voicing', title: 'Analyseur — note supérieure des accords', target: 10, help: 'Joue les accords de la main droite seule. Objectif : la note du haut au moins 10 points de vélocité au-dessus des autres, dans 80 % des accords.' })}
${W.links([W.informance('/content/pages/193-getting-to-grips-with-octaves', 'Getting to Grips with Octaves')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-t6', minutes: 20,
    title: 'Gammes et arpèges du niveau 2',
    summary: 'Les tonalités jusqu’à quatre altérations, la gamme chromatique, les arpèges de septième.',
    goals: ['Connaître les doigtés des gammes jusqu’à quatre altérations.', 'Jouer la gamme chromatique et les arpèges de septième de dominante et de septième diminuée.', 'Atteindre ♩ = 88 en doubles croches, régulier.'],
    body: W => `
<p>Toujours dix minutes par jour, en écoutant chaque note. Le programme s’élargit aux tonalités jusqu’à quatre altérations, à la gamme chromatique (indispensable chez Chopin) et aux arpèges de septième, que tu rencontres déjà dans tes pièces.</p>

<h2>Les doigtés, par familles</h2>
<table>
<thead><tr><th>Gammes</th><th>Main droite (en montant)</th><th>Main gauche (en montant)</th></tr></thead>
<tbody>
<tr><td>Do, sol, ré, la, mi majeur ; la, mi, ré, sol, do mineur</td><td>1 2 3 · 1 2 3 4 · 5</td><td>5 4 3 2 1 · 3 2 1</td></tr>
<tr><td>Fa majeur, fa mineur</td><td>1 2 3 4 · 1 2 3 · 4</td><td>5 4 3 2 1 · 3 2 1</td></tr>
<tr><td>Si mineur</td><td>1 2 3 · 1 2 3 4 · 5</td><td>4 3 2 1 · 4 3 2 1</td></tr>
<tr><td>Si♭ majeur</td><td>2 · 1 2 3 · 1 2 3 4</td><td>3 2 1 · 4 3 2 1 · 3</td></tr>
<tr><td>Mi♭ majeur</td><td>3 · 1 2 3 4 · 1 2 3</td><td>3 2 1 · 4 3 2 1 · 3</td></tr>
<tr><td>La♭ majeur ; do♯ mineur harmonique</td><td>3 4 · 1 2 3 · 1 2 3</td><td>3 2 1 · 4 3 2 1 · 3</td></tr>
<tr><td>Fa♯ mineur harmonique</td><td>3 4 · 1 2 3 · 1 2 3</td><td>4 3 2 1 · 3 2 1 · 4</td></tr>
</tbody></table>
<p>Doigtés donnés sur une octave, de la tonique à la tonique. Sur plusieurs octaves, la tonique du milieu reprend le doigt qui relance le cycle (le pouce sur do ou sur fa, par exemple). En do♯ et fa♯ mineur <b>mélodique</b> montant, la main droite change pour éviter le pouce sur une touche noire : 2 3 · 1 2 3 4 · 1.</p>
<p>Mineures harmoniques et mélodiques, quatre octaves, mains ensemble. Repère clé : le 4e doigt de la main droite tombe une seule fois par octave, toujours sur la même note — si en do majeur, si♭ dans les gammes majeures à bémols de ce niveau (fa, si♭, mi♭, la♭). Si tu sais où tombe le 4, tu sais toute la gamme.</p>

<h2>La gamme chromatique</h2>
<p>Main droite : 3 sur toutes les touches noires, 1 sur les blanches, sauf <b>2 sur fa et sur do</b>. Main gauche : 3 sur les noires, 1 sur les blanches, sauf <b>2 sur mi et sur si</b>. Le 3 tombe toujours sur une touche noire : c’est ce qui permet la vitesse.</p>
${W.score({ abc: EX_CHROM, title: 'Gamme chromatique (une octave, mains ensemble)', bpm: 72, startBpm: 56 })}

<h2>Les arpèges de septième</h2>
<p>Quatre notes par octave : main droite 1 2 3 4 (5 sur la note finale) ; main gauche 5 4 3 2, puis 1 4 3 2 (le 4 passe par-dessus le pouce). Commence par la septième de dominante (sol 7 : sol – si – ré – fa) et la septième diminuée (si – ré – fa – la♭), les deux accords les plus fréquents chez Chopin.</p>
${W.score({ abc: EX_ARP7, title: 'Arpèges : sol 7 et septième diminuée sur si', bpm: 80, startBpm: 56, caption: 'Pour les arpèges d’accords parfaits commençant sur une touche noire, le pouce prend la première touche blanche : vérifie les doigtés dans ton recueil.' })}

<h2>Méthode</h2>
<ol>
<li>Une tonalité par jour, gamme et arpège, en tournant sur le cycle des quintes.</li>
<li>Rythmes, groupes avec arrêts, accents déplacés (voir <a href="#/lecon/n2-t1">les passages rapides</a>).</li>
<li>Accélération progressive au métronome jusqu’à l’objectif : ♩ = 88 en doubles croches.</li>
</ol>
${W.analyzer({ mode: 'evenness', title: 'Analyseur — régularité', bpm: 88, sub: 4, help: 'Joue une gamme sur quatre octaves, ou un arpège sur deux octaves. Objectif : irrégularité inférieure à 8 %.' })}
${W.metronome({ bpm: 72, beats: 4 })}
${W.links([W.informance('/content/pages/40-intermediate-scales-arpeggios', 'Intermediate Scales & Arpeggios')], 'Pour aller plus loin')}
`,
  },
];
