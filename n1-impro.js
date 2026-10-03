// Niveau 1 — Improvisation : une méthode progressive.
// 1. Se lancer sans risque (ostinato, touches noires, pentatonique : méthode inspirée de Forrest Kinney, « Pattern Play »).
// 2. Le rythme d'abord, puis l'harmonie : notes de l'accord sur les temps forts, arpèges, gammes et broderies.
// 3. Le style du nocturne : accompagnements, mélodie ornée, question-réponse.

const LH_BASSE_ACCORD = `[V:LH] .F,,2 .[A,CF]2 .C,2 .[A,CF]2 | .D,,2 .[A,DF]2 .A,,2 .[A,DF]2 | .B,,2 .[B,DF]2 .F,,2 .[B,DF]2 | .C,,2 .[B,=EG]2 .G,,2 .[B,=EG]2 | .F,,2 .[A,CF]2 F,,4 |]`;
const HEAD = () => `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass`;

const ACC_A = `X:1
M:4/4
L:1/8
K:Fmin
"^i".F,,2 .[A,CF]2 .C,2 .[A,CF]2 | "^VI".D,,2 .[A,DF]2 .A,,2 .[A,DF]2 | "^iv".B,,2 .[B,DF]2 .F,,2 .[B,DF]2 | "^V7".C,,2 .[B,=EG]2 .G,,2 .[B,=EG]2 | "^i".F,,2 .[A,CF]2 F,,4 |]`.replace('K:Fmin', 'K:Fmin clef=bass');

const ACC_B = `X:1
M:4/4
L:1/8
K:Fmin clef=bass
"^i"(3F,,C,A, (3CA,C, (3F,,C,A, (3CA,C, | "^VI"(3D,,A,,F, (3A,F,A,, (3D,,A,,F, (3A,F,A,, | "^iv"(3B,,,F,,D, (3F,D,F,, (3B,,,F,,D, (3F,D,F,, | "^V7"(3C,,G,,=E, (3B,=E,G,, (3C,,G,,=E, (3B,=E,G,, | "^i"[F,,C,A,]8 |]`;

const ACC_C = `X:1
M:4/4
L:1/8
K:Fmin clef=bass
"^i"[F,,C,A,]8 | "^VI"[D,,A,,F,]8 | "^iv"[B,,,F,,D,]8 | "^V7"[C,,B,,=E,]8 | "^i"[F,,C,A,]8 |]`;

const melodyScore = (rh) => `${HEAD()}
[V:RH] ${rh}
${LH_BASSE_ACCORD}`;

const STEP1 = melodyScore(`"^1. squelette"A8 | A8 | F8 | =E8 | F8 |]`);
const STEP2 = melodyScore(`"^2. un temps sur deux"A2 B2 c2 B2 | F2 A2 d2 c2 | B2 A2 F2 G2 | c2 B2 G2 =E2 | F8 |]`);
const STEP3 = melodyScore(`"^3. broderies et passages"AG AB c2 B2 | FA dc d2 c2 | Bc BA F2 G2 | cB G=E F2 =E2 | F8 |]`);
const STEP4 = `X:1
M:4/4
L:1/16
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^4. appoggiatures"B8 A4 =B2 c2 | e8 d4 c4 | c8 B4 A2 G2 | A8 G4 F2 =E2 | F16 |]
[V:LH] .F,,4 .[A,CF]4 .C,4 .[A,CF]4 | .D,,4 .[A,DF]4 .A,,4 .[A,DF]4 | .B,,4 .[B,DF]4 .F,,4 .[B,DF]4 | .C,,4 .[B,=EG]4 .G,,4 .[B,=EG]4 | .F,,4 .[A,CF]4 F,,8 |]`;

const PERIOD = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^antécédent"(c2 f2 ed c2 | B2 d2 cB A2 | A2 c2 FG A2 | "^demi-cadence"G6) z2 | "^conséquent"(c2 f2 ed c2 | B2 d2 f2 ed | c2 B2 G2 =E2 | "^cadence parfaite"F6) z2 |]
[V:LH] "_i".F,,2 .[A,CF]2 .C,2 .[A,CF]2 | "_iv".B,,2 .[B,DF]2 .F,,2 .[B,DF]2 | "_i".F,,2 .[A,CF]2 .C,2 .[A,CF]2 | "_V".C,,2 .[G,C=E]2 .G,,2 .[G,C=E]2 | "_i".F,,2 .[A,CF]2 .C,2 .[A,CF]2 | "_iv".B,,2 .[B,DF]2 .F,,2 .[B,DF]2 | "_V7".C,,2 .[B,=EG]2 .G,,2 .[B,=EG]2 | "_i".F,,2 .[A,CF]2 F,,4 |]`;

const PEDAL5 = [0, 4, 8, 12, 16];

const RHYTHM_MOTIFS = `X:1
M:4/4
L:1/8
K:C clef=perc
"^1"B2 B2 B4 | "^2"BB B2 B4 | "^3"B3B B4 | "^4"z2 B2 BB B2 |]`;

const PENTA_EX = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^motif"c2 c2 d4 | "^répété"c2 c2 d4 | "^déplacé"e2 e2 g4 | "^réponse"a2 g2 e2 c2 | "^motif"c2 c2 d4 | "^varié"cc c2 d4 | "^sommet"g2 a2 g2 e2 | "^fin"d2 e2 c4 |]
[V:LH] [C,G,]8 | [C,G,]8 | [C,G,]8 | [C,G,]8 | [C,G,]8 | [C,G,]8 | [C,G,]8 | [C,G,]8 |]`;

const FIVE_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^squelette"E4 | E4 | D4 | D4 | "^habillé"E D E G | E2 C2 | D E F D | C4 |]
[V:LH] "_I"[C,E,G,]4 | [C,E,G,]4 | "_V7"[B,,F,G,]4 | [B,,F,G,]4 | "_I"[C,E,G,]4 | [C,E,G,]4 | "_V7"[B,,F,G,]4 | "_I"[C,E,G,]4 |]`;

const CHORD_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^arpèges"C E G E | F A c A | G B d F | E4 | "^une note par temps, au plus près"E G E G | A F A c | B G F D | C4 |]
[V:LH] "_I"C,4 | "_IV"F,,4 | "_V7"G,,4 | "_I"C,4 | "_I"C,4 | "_IV"F,,4 | "_V7"G,,4 | "_I"C,4 |]`;

const SCALE_EX = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^squelette"c4 e4 | c4 A4 | F4 D4 | C8 | "^notes de passage"c2 d2 e2 d2 | c2 B2 A2 G2 | F2 E2 D2 B,2 | C8 | "^en croches : passages et broderies"cBcd efed | cdcB ABAG | FEFE DCDB, | C8 |]
[V:LH] "_I"[C,E,G,]8 | "_IV"[C,F,A,]8 | "_V7"[G,,F,]8 | "_I"[C,E,G,]8 | "_I"[C,E,G,]8 | "_IV"[C,F,A,]8 | "_V7"[G,,F,]8 | "_I"[C,E,G,]8 | "_I"[C,E,G,]8 | "_IV"[C,F,A,]8 | "_V7"[G,,F,]8 | "_I"[C,E,G,]8 |]`;

export default [
  {
    id: 'n1-im-lancer', minutes: 15,
    title: 'Se lancer : la pulsation et les touches noires',
    summary: 'Improviser dès aujourd’hui, sans fausse note possible : un ostinato à la main gauche, les touches noires à la main droite.',
    goals: ['Improviser deux minutes sans t’arrêter.', 'Construire avec très peu de notes.', 'Faire une question et une réponse.'],
    body: W => `
<p>Improviser, c’est jouer des choses qu’on invente sur le moment, comme on parle sans texte écrit. Et comme pour une langue, on commence avec peu de mots, dans une situation où l’on ne peut pas se tromper. Cette première leçon s’inspire de la méthode de Forrest Kinney (<i>Pattern Play</i>) : un accompagnement simple et une poignée de notes qui sonnent toutes bien ensemble. Tu improvises dès la première minute.</p>

<h2>Le dispositif</h2>
<ul>
<li>L’accompagnateur joue un <b>ostinato</b> (un motif répété) : la quinte fa♯ – do♯, balancée à la basse.</li>
<li>Ta main droite n’utilise que les <b>cinq touches noires</b> : fa♯, sol♯, la♯, do♯, ré♯. Elles forment une gamme <b>pentatonique</b> (cinq notes sans demi-ton) : aucune ne frotte avec une autre.</li>
<li>Fa♯ est la note d’appui, la « maison » : c’est sur elle que l’on conclut.</li>
</ul>

<h2>Cinq règles</h2>
<ol>
<li><b>La pulsation ne s’arrête jamais.</b> Mieux vaut une note simple à temps qu’une belle idée en retard.</li>
<li><b>Peu de notes.</b> Une, deux, trois notes suffisent pour faire de la musique.</li>
<li><b>Répéter.</b> Une idée répétée devient un motif ; un motif, c’est déjà une composition.</li>
<li><b>Respirer.</b> Laisse des silences : une phrase qui respire est plus expressive.</li>
<li><b>Conclure.</b> Finis tes phrases sur fa♯, en douceur.</li>
</ol>

${W.exo('Exercice en cinq étapes (deux minutes chacune)', `<ol>
<li><b>Une seule note</b> (fa♯) : invente des rythmes différents, toujours avec la pulsation.</li>
<li><b>Deux notes voisines</b> (fa♯ – sol♯) : petit dialogue entre elles.</li>
<li><b>Trois notes</b> (fa♯ – sol♯ – la♯) : un motif de trois ou quatre notes, que tu répètes.</li>
<li><b>Toutes les touches noires</b>, sur deux octaves : promène ton motif, monte vers un sommet, redescends.</li>
<li><b>Question – réponse</b> : deux mesures qui finissent « en l’air » (sur une autre note que fa♯), puis deux mesures qui répondent et concluent sur fa♯.</li>
</ol>`)}
${W.improv({ preset: 'n1-noires', presets: ['n1-noires', 'n1-penta'] })}
${W.tip('Ne cherche pas la belle mélodie', '<p>Cherche seulement à ne jamais t’arrêter. Les bonnes idées viennent en jouant, pas en réfléchissant avant de jouer.</p>')}
${W.tip('Écoute l’accompagnement', '<p>Joue doucement, au niveau de l’ostinato : tu dois l’entendre en permanence. C’est lui qui te porte.</p>')}
${W.checklist({ id: 'n1-im-lancer-check', title: 'Je vérifie', items: ['J’ai improvisé deux minutes sans m’arrêter.', 'J’ai répété au moins un motif.', 'J’ai laissé des silences.', 'Mes phrases finissent sur fa♯.'] })}
${W.links([W.informance('/content/pages/5-anyone-can-improvise', 'Anyone Can Improvise!'), W.informance('/content/pages/189-how-to-improvise', 'How to Improvise')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-im-rythme', minutes: 15,
    title: 'Le rythme d’abord : motifs et variations',
    summary: 'Un bon rythme fait tenir une improvisation, même avec deux notes. Inventer un motif, le répéter, le varier, y répondre.',
    goals: ['Inventer un motif rythmique et le garder.', 'Le varier de trois façons.', 'Construire huit mesures avec un seul motif.'],
    body: W => `
<p>Ce qui rend une improvisation convaincante, ce n’est pas le choix des notes : c’est le <b>rythme</b>. Une mélodie dont le rythme est clair, répété et varié se retient ; une suite de notes égales s’oublie. On travaille donc le rythme avant tout, sur une gamme qui ne pose aucun problème : la <b>pentatonique de do</b> (do, ré, mi, sol, la — les touches blanches sans fa ni si), sur un bourdon do – sol.</p>

<h2>Des motifs rythmiques</h2>
${W.score({ abc: RHYTHM_MOTIFS, title: 'Quatre motifs d’une mesure', bpm: 76, practice: false, hands: false, click: true, caption: '1 : noire, noire, blanche. 2 : deux croches, noire, blanche. 3 : noire pointée, croche, blanche. 4 : soupir, puis le motif commence en retard.' })}

<h2>Quatre façons de faire vivre un motif</h2>
<ul>
<li><b>Répéter</b> : tel quel, sur les mêmes notes. L’auditeur le reconnaît.</li>
<li><b>Déplacer</b> : même rythme, autres notes (plus haut, plus bas).</li>
<li><b>Varier</b> : même début, fin différente ; ou une note ajoutée.</li>
<li><b>Répondre</b> : une phrase qui finit en suspens (question), une phrase qui finit sur do (réponse).</li>
</ul>
${W.score({ abc: PENTA_EX, title: 'Huit mesures avec un seul motif (pentatonique de do)', bpm: 76, startBpm: 66, caption: 'Le motif « noire, noire, blanche » est répété, déplacé, varié, puis la phrase monte vers un sommet et conclut sur do.' })}

${W.exo('Exercice', `<ol>
<li>Choisis un des quatre motifs. Joue-le huit fois de suite sur l’accompagnateur, en changeant seulement les notes (pentatonique de do).</li>
<li>Même chose avec les quatre façons : répéter, déplacer, varier, répondre.</li>
<li>Invente ton propre motif, et construis huit mesures avec lui ; finis sur do.</li>
<li>Passe à la pentatonique de la mineur (la, do, ré, mi, sol) sur l’ostinato la – mi : même travail, couleur plus sombre.</li>
</ol>`)}
${W.improv({ preset: 'n1-penta', presets: ['n1-penta', 'n1-penta-la', 'n1-noires'] })}
${W.tip('Chante ton motif', '<p>Avant de jouer, chante ton motif sur « ta-ta-taa » : si tu peux le chanter, tu le garderas même quand tu changes les notes.</p>')}
${W.tip('Le silence est un rythme', '<p>Commence certaines phrases par un soupir, comme le motif 4 : l’attente rend l’entrée plus vivante.</p>')}
${W.checklist({ id: 'n1-im-rythme-check', title: 'Je vérifie', items: ['On reconnaît mon motif à chaque retour.', 'J’ai utilisé au moins deux façons de le varier.', 'Il y a une question et une réponse.', 'Je ne me suis pas arrêté.'] })}
`,
  },

  {
    id: 'n1-im-5notes', minutes: 15,
    title: 'Cinq notes et une main gauche',
    summary: 'Do – ré – mi – fa – sol sous les doigts de la main droite, deux accords à la main gauche : la première vraie harmonie.',
    goals: ['Improviser avec les cinq notes de do à sol.', 'Jouer toi-même les accords I et V7 à la main gauche.', 'Poser une note de l’accord au début de chaque mesure.'],
    body: W => `
<p>On quitte la pentatonique pour une gamme complète, mais réduite : <b>cinq notes, une par doigt</b> (do, ré, mi, fa, sol). La main gauche joue deux accords : <b>I</b> (do – mi – sol), le repos, et <b>V7</b> (sol – si – ré – fa), la tension qui ramène vers I.</p>

<h2>Les notes d’appui</h2>
<p>Certaines notes appartiennent à l’accord du moment : ce sont les <b>notes d’appui</b>. Sur I : do, mi, sol. Sur V7 : ré, fa, sol (si en fait aussi partie, mais il est hors de tes cinq notes). Commence chaque mesure sur une note d’appui ; entre elles, circule librement.</p>
${W.score({ abc: FIVE_EX, title: 'Un squelette, puis le même squelette habillé', bpm: 72, startBpm: 60, caption: 'Squelette : une note d’appui par mesure (mi, mi, ré, ré). Habillé (mesures 5 à 8) : la note d’appui reste au premier temps, d’autres notes remplissent les autres temps, et la dernière mesure conclut : ré → do, V7 → I.' })}

<h2>La main gauche</h2>
<p>Joue I et V7 en position serrée, sans déplacer la main : I = do – mi – sol (doigts 5-3-1) ; V7 = si – fa – sol (doigts 5-2-1). Seuls deux doigts bougent, chacun d’un demi-ton : c’est la <b>conduite des voix</b> la plus simple.</p>
${W.kbd({ from: 47, to: 60, title: 'I puis V7 à la main gauche', marks: [{ m: 48, label: 'do', color: '#d6e0ef' }, { m: 52, label: 'mi', color: '#d6e0ef' }, { m: 55, label: 'sol' }, { m: 47, label: 'si', color: '#f2d9a8' }, { m: 53, label: 'fa', color: '#f2d9a8' }], names: 'none', caption: 'Do descend vers si, mi monte vers fa, sol reste : I devient V7.' })}

${W.exo('Exercice en quatre étapes', `<ol>
<li>Avec l’accompagnateur (« Cinq notes… ») : une seule note par mesure, une note d’appui. Écoute comme elle se fond dans l’accord.</li>
<li>Deux notes par mesure, puis des rythmes plus variés, en partant toujours d’une note d’appui.</li>
<li>Fais finir chaque phrase par <b>ré → do</b> ou <b>fa → mi</b> sur V7 → I : c’est la cadence.</li>
<li>Coupe l’accompagnateur et joue toi-même la main gauche (I et V7, deux mesures chacun).</li>
</ol>`)}
${W.improv({ preset: 'n1-5notes', presets: ['n1-5notes', 'n1-IIVVI'] })}
${W.tip('Le retour de l’accompagnateur', '<p>Les notes que tu joues s’allument : vert pour une note de l’accord, bleu pour une autre note de la gamme, orange pour une note hors gamme. À l’arrêt, tu vois la part de premiers temps posés sur une note de l’accord. Vise au moins 70 %.</p>')}
${W.tip('Garde la main en place', '<p>Une note par doigt : ta main droite ne bouge pas. Toute ton attention peut aller à l’écoute et au rythme.</p>')}
`,
  },

  {
    id: 'n1-im-accords', minutes: 20,
    title: 'Les notes de l’accord sur les temps forts',
    summary: 'I – IV – V7 – I : la grille la plus courante. Arpèges et notes de l’accord sur les temps forts, la base de toute mélodie tonale.',
    goals: ['Connaître les notes des accords I, IV et V7 en do majeur.', 'Improviser des arpèges sur la grille.', 'Placer une note de l’accord sur chaque temps fort.'],
    body: W => `
<p>Une mélodie tonale « tient debout » quand ses <b>temps forts</b> reposent sur l’harmonie. C’est le secret le plus utile de l’improvisation classique. On le travaille sur la grille la plus courante : <b>I – IV – V7 – I</b> en do majeur (do, fa, sol 7, do).</p>
<table>
<thead><tr><th>Accord</th><th>Notes</th><th>Fonction</th></tr></thead>
<tbody>
<tr><td>I (do)</td><td>do – mi – sol</td><td>repos</td></tr>
<tr><td>IV (fa)</td><td>fa – la – do</td><td>éloignement</td></tr>
<tr><td>V7 (sol 7)</td><td>sol – si – ré – fa</td><td>tension</td></tr>
</tbody></table>

<h2>D’abord les arpèges</h2>
<p>Joue les notes de chaque accord, en montant et en descendant, dans tous les ordres : c’est déjà une mélodie. Puis ne garde qu’une note de l’accord par temps et, à chaque changement d’accord, va vers la note du nouvel accord <b>la plus proche</b> (souvent la note voisine) : la mélodie devient chantante.</p>
${W.score({ abc: CHORD_EX, title: 'Arpèges, puis une note de l’accord par temps', bpm: 72, startBpm: 60, caption: 'Mesures 5 à 8 : aux changements d’accord, sol → la, do → si, ré → do, toujours par degré voisin.' })}

<h2>Les notes qui comptent le plus</h2>
<p>Dans chaque accord, la <b>tierce</b> et, s’il y en a une, la <b>septième</b> sont les notes qui le caractérisent (mi pour I, la pour IV, si et fa pour V7). Les placer sur les temps forts fait entendre l’harmonie même sans main gauche. Et la sensible si veut monter vers do, la septième fa veut descendre vers mi : laisse-les faire.</p>

${W.exo('Exercice', `<ol>
<li>Avec l’accompagnateur « I – IV – V7 – I » : uniquement des notes de l’accord, en arpèges.</li>
<li>Une note de l’accord sur chaque temps, en bougeant le moins possible d’un accord au suivant.</li>
<li>Des notes de l’accord sur les temps 1 et 3, et ce que tu veux entre eux.</li>
<li>Même travail sur la grille de huit mesures (accompagnement en basse d’Alberti), puis en la mineur (i – iv – V7 – i).</li>
</ol>`)}
${W.improv({ preset: 'n1-IIVVI', presets: ['n1-IIVVI', 'n1-IIVVI8', 'n1-am'] })}
${W.tip('Pense une mesure en avance', '<p>Pendant la dernière note d’une mesure, regarde l’accord suivant (affiché par l’accompagnateur) et vise la note de cet accord la plus proche : la mélodie s’enchaîne sans à-coups.</p>')}
${W.tip('Sens la tension', '<p>Sur V7, attarde-toi un peu sur si ou fa : ce sont les notes qui créent l’attente. Leur résolution (si → do, fa → mi) donne la sensation de conclure.</p>')}
`,
  },

  {
    id: 'n1-im-gammes', minutes: 20,
    title: 'Gammes, passages et broderies',
    summary: 'Relier les notes de l’accord par la gamme : notes de passage et broderies, sur les temps faibles.',
    goals: ['Remplir l’espace entre deux notes de l’accord par des notes de passage.', 'Utiliser les broderies.', 'Improviser une phrase complète en croches.'],
    body: W => `
<p>Tu sais poser les notes de l’accord sur les temps forts. Entre elles, la <b>gamme</b> sert de chemin. Deux outils suffisent, qui viennent de la théorie des notes étrangères :</p>
<ul>
<li>la <b>note de passage</b> relie deux notes de l’accord par degrés conjoints (mi – fa – sol sur l’accord de do : fa est de passage) ;</li>
<li>la <b>broderie</b> quitte une note de l’accord vers sa voisine et y revient (mi – ré – mi).</li>
</ul>
<p>Règle d’or : les notes de l’accord sur les temps (ou au moins sur les temps forts), les notes de passage et les broderies <b>entre</b> les temps.</p>
${W.score({ abc: SCALE_EX, title: 'Un squelette, puis ses notes de passage, puis passages et broderies en croches', bpm: 72, startBpm: 56, caption: 'Mesures 1 à 4 : le squelette, une note de l’accord tous les deux temps (blanches). Mesures 5 à 8 : les mêmes notes restent sur les temps 1 et 3, et une note de passage les relie sur les temps 2 et 4 (do – ré – mi, mi – ré – do…) ; seul le si de la mesure 7 est une note de l’accord (la sensible). Mesures 9 à 12 : en croches, chaque note du squelette est brodée (do – si – do, mi – fa – mi) puis reliée à la suivante par une note de passage.' })}

<h2>Deux formules de fin</h2>
<ul>
<li><b>2 → 1</b> : ré → do sur V7 → I (la formule la plus simple).</li>
<li><b>7 → 1</b> : si → do, la sensible qui monte. Souvent combinées : ré – si – do, comme à la fin de l’exemple.</li>
</ul>

${W.exo('Exercice', `<ol>
<li>Joue ton squelette (une note de l’accord tous les deux temps), puis remplis par des notes de passage en noires, puis en croches.</li>
<li>Rejoue-le avec des broderies, puis mélange les deux.</li>
<li>Improvise directement huit mesures en croches, en finissant par une des deux formules de fin.</li>
<li>En la mineur, n’oublie pas la sensible sol♯ sur V7.</li>
</ol>`)}
${W.improv({ preset: 'n1-IIVVI8', presets: ['n1-IIVVI8', 'n1-IIVVI', 'n1-am'] })}
${W.tip('Une fausse note se rattrape', '<p>Une note « fausse » (orange) n’est qu’une note mal placée : glisse d’un demi-ton ou d’un ton vers une note de l’accord, et elle devient une note de passage. Le public n’entendra qu’un ornement.</p>')}
${W.tip('Varie la direction', '<p>Après trois ou quatre notes dans le même sens, change de direction : une mélodie qui monte longtemps a besoin de redescendre.</p>')}
`,
  },

  {
    id: 'n1-im2', minutes: 20,
    title: 'L’accompagnement du nocturne',
    summary: 'Trois formules de main gauche, sur une grille de quatre accords en fa mineur.',
    goals: ['Jouer trois formules d’accompagnement.', 'Enchaîner i – VI – iv – V7 – i dans chaque formule.', 'Placer la pédale sur chaque changement d’harmonie.'],
    body: W => `
<p>La main gauche du nocturne porte l’harmonie et le mouvement. Avant d’improviser une mélodie, il faut qu’elle soit automatique. Voici trois formules, sur la grille <b>i – VI – iv – V7 – i</b> en fa mineur (fa mineur, ré♭ majeur, si♭ mineur, do 7, fa mineur).</p>

<h2>1. Basse et accord</h2>
<p>Celle de l’op. 55 : basse au 1er et au 3e temps (la fondamentale, puis la quinte en dessous ou au-dessus), accord léger au 2e et au 4e. Une pédale par accord.</p>
${W.score({ abc: ACC_A, title: 'Basse et accord', bpm: 60, pedal: PEDAL5, pedalEnd: 20, hands: false })}

<h2>2. L’arpège élargi</h2>
<p>Celle de l’op. 9 n° 2, de l’op. 72 n° 1, de la Romance de Liszt : une basse grave, puis la quinte et la dixième, en arpège qui monte et redescend. La main s’ouvre sur plus d’une octave ; le poignet et le coude accompagnent le déplacement. La pédale tient la basse.</p>
${W.score({ abc: ACC_B, title: 'Arpège élargi (triolets)', bpm: 50, pedal: PEDAL5, pedalEnd: 20, hands: false })}

<h2>3. Les accords tenus</h2>
<p>La plus simple : un accord par mesure, en position large. Idéale pour se concentrer sur la mélodie.</p>
${W.score({ abc: ACC_C, title: 'Accords tenus', bpm: 60, hands: false })}

${W.exo('Exercice', '<ol><li>Chaque formule, main gauche seule, jusqu’à pouvoir la jouer sans regarder.</li><li>Puis en boucle, en fredonnant une mélodie par-dessus.</li><li>Enfin, mains ensemble : la main droite tient une note de l’accord par mesure (fa, fa, fa, mi, fa par exemple).</li></ol>')}
${W.tip('L’accompagnateur', '<p>Dans l’outil ci-dessous, choisis la formule de main gauche (« basse + accord », « arpège élargi », « accords tenus ») : tu peux écouter la grille, puis improviser à la main droite pendant que l’appli joue la main gauche.</p>')}
${W.improv({ preset: 'n1-arpege', presets: ['n1-arpege', 'n1-nocturne8'] })}
`,
  },
  {
    id: 'n1-im3', minutes: 20,
    title: 'La mélodie : notes de l’accord, puis ornements',
    summary: 'Construire une mélodie en quatre étapes : squelette, passages, broderies, appoggiatures.',
    goals: ['Construire un squelette sur les notes de l’accord.', 'Ajouter notes de passage et broderies.', 'Utiliser l’appoggiature, signature du style chopinien.'],
    body: W => `
<p>Une mélodie improvisée tient debout si ses <b>temps forts</b> reposent sur l’harmonie. Les notes étrangères (vues en théorie) viennent ensuite l’animer. Voici la même grille, i – VI – iv – V7 – i, en quatre étapes.</p>
${W.score({ abc: STEP1, title: 'Étape 1 — le squelette', bpm: 60, pedal: PEDAL5, pedalEnd: 20, caption: 'Une note de l’accord par mesure, en mouvement conjoint quand c’est possible : la♭, la♭, fa, mi♮, fa. Le mi♮ (sensible) monte vers fa.' })}
${W.score({ abc: STEP2, title: 'Étape 2 — notes de l’accord aux temps 1 et 3, passages entre', bpm: 60, pedal: PEDAL5, pedalEnd: 20 })}
${W.score({ abc: STEP3, title: 'Étape 3 — broderies et croches de passage', bpm: 60, pedal: PEDAL5, pedalEnd: 20 })}
${W.score({ abc: STEP4, title: 'Étape 4 — appoggiatures', bpm: 56, pedal: PEDAL5, pedalEnd: 20, caption: 'Chaque mesure commence par une appoggiature (si♭, mi♭, do, la♭) qui descend se résoudre sur une note de l’accord. Le si♮ de la mesure 1 est une broderie chromatique, comme dans le nocturne.' })}
${W.exo('Exercice', `<ol><li>Joue l’étape 1 avec l’accompagnateur, puis invente ton propre squelette.</li><li>Garde ton squelette et habille-le : étape 2, puis 3.</li><li>Ajoute une ou deux appoggiatures par phrase, pas plus : ce sont des moments forts.</li></ol>`)}
${W.improv({ preset: 'n1-nocturne8', presets: ['n1-nocturne8', 'n1-nocturne'] })}
${W.tip('Le retour de l’accompagnateur', '<p>Les notes que tu joues s’allument : vert pour une note de l’accord, bleu pour une note de la gamme, orange pour une note chromatique. À l’arrêt, tu vois la part de temps forts posés sur une note de l’accord. Vise au moins 70 %.</p>')}
`,
  },
  {
    id: 'n1-im4', minutes: 20,
    title: 'Question–réponse : construire huit mesures',
    summary: 'La période classique : une phrase qui interroge, une phrase qui répond.',
    goals: ['Construire un antécédent qui finit sur la dominante.', 'Construire un conséquent qui reprend le motif et conclut.', 'Improviser huit mesures sans s’arrêter.'],
    body: W => `
<p>La forme la plus naturelle de huit mesures est la <b>période</b> : un <b>antécédent</b> de quatre mesures qui s’arrête sur la dominante (demi-cadence, une question), puis un <b>conséquent</b> qui commence comme l’antécédent et conclut sur la tonique (cadence parfaite, la réponse).</p>
${W.score({ abc: PERIOD, title: 'Une période en fa mineur', bpm: 60, pedal: [0, 4, 8, 12, 16, 20, 24, 28], pedalEnd: 32, caption: 'Grille : i – iv – i – V | i – iv – V7 – i. Les mesures 5-6 reprennent les mesures 1-2, la fin change.' })}
<h2>Les ingrédients</h2>
<ul>
<li><b>Un motif</b> clair dans la mesure 1, repris à la mesure 5.</li>
<li><b>Une demi-cadence</b> à la mesure 4 : une note longue de l’accord de V (sol, mi♮ ou do).</li>
<li><b>Une cadence parfaite</b> à la mesure 8 : la sensible mi♮ ou le 2e degré sol mènent à fa.</li>
<li><b>Un sommet</b>, souvent dans le conséquent (mesure 6 ici, sur fa).</li>
</ul>
${W.exo('Exercice en quatre temps', `<ol>
<li>Joue l’exemple tel quel.</li>
<li>Garde les mesures 1-2 et 5-6, improvise les mesures 3-4 et 7-8.</li>
<li>Improvise tout, en gardant un motif à la mesure 1 et à la mesure 5.</li>
<li>Avec l’accompagnateur « Question–réponse » (main gauche jouée pour toi), puis en jouant toi-même la main gauche.</li>
</ol>`)}
${W.improv({ preset: 'n1-qr', presets: ['n1-qr', 'n1-nocturne8'] })}
${W.checklist({ id: 'n1-im4-check', title: 'Je vérifie', items: ['Je ne m’arrête pas, même après une erreur.', 'On entend une question (mesure 4) et une réponse (mesure 8).', 'Le motif de la mesure 1 revient à la mesure 5.', 'Les temps forts reposent sur les notes de l’accord.'] })}
`,
  },
];
