// Niveau 1 — Interprétation
import { OP55 } from './content-excerpts.js';
import { AN } from './content-analyses.js';

// Mesures 1 à 8 avec analyse harmonique sous la basse
const OP55_ANALYSE = `X:1
M:4/4
L:1/16
K:Fmin
%%score {RH | LH}
%%barnumbers 1
%%setbarnb 0
V:RH clef=treble
V:LH clef=bass
[V:RH] (c4- | c4 f4 e4 d4 | c3=B c3d c8- | c4) (f4 e4 d4 | c3=B c3{/e}d c8- |
[V:LH] z4 | "_i".F,,4 .[A,CF]4 "_VII6".G,,4 .[E,B,E]4 | "_III".A,,4 .[CA]4 "_V6/5".=E,,4 .[B,CG]4 | "_i".F,,4 .[A,CF]4 "_VII6".G,,4 .[E,B,E]4 | "_III".A,,4 .[CA]4 "_V6/5".=E,,4 .[B,CG]4 |
[V:RH] c4) (f4 e4 d4 | c8 TB4 {=AB}c3d | A8 !arpeggio![B,=EA]4 G3F | {/A,}F8) (c4 c4) |]
[V:LH] "_i".F,,4 .[A,CF]4 "_VII6".G,,4 .[E,B,E]4 | "_III".A,,4 .[CA]4 "_N6".B,,4 .[_G,D_G]4 | "_i6/4".C,4 .[A,CF]4 "_V".C,,4 .[C,C]4 | "_i".F,,4 .[A,C]4 .F,,4 .[G,=E]4 |]`;

export default [
  {
    id: 'n1-i1', minutes: 20,
    title: 'La phrase : départ, sommet, arrivée',
    summary: 'Une phrase musicale se construit comme une phrase parlée : elle part, va quelque part, et conclut.',
    goals: ['Repérer le sommet d’une phrase et ce qui le désigne.', 'Donner une direction à chaque note au lieu de les juxtaposer.', 'Respirer entre les phrases.'],
    body: W => `
<p>Une suite de notes justes, de même force et de même durée, ne fait pas encore une phrase. Comme une phrase parlée, une phrase musicale a un <b>départ</b>, une <b>direction</b>, un <b>sommet</b> (le mot important) et une <b>arrivée</b>, suivie d’une respiration.</p>
${W.diagram('phrase', { labels: ['do (levée)', 'fa', 'mi♭', 'ré♭', 'do', 'si♮ – do – ré♭', 'do'], peak: 1, title: 'La première phrase du nocturne (mesures 1-2) : intensité de chaque note' })}

<h2>Où est le sommet ?</h2>
<p>Plusieurs indices le désignent, et ils se combinent :</p>
<ul>
<li><b>la note la plus aiguë</b> (souvent, pas toujours) ;</li>
<li><b>la note la plus longue</b>, ou la plus accentuée par le rythme ;</li>
<li><b>la dissonance</b> la plus forte : une appoggiature, un accord chromatique ;</li>
<li><b>le moment juste avant la cadence</b>, quand la tension est la plus grande.</li>
</ul>
<p>Dans les mesures 1-2, le fa est à la fois la note la plus aiguë et le premier temps fort après la levée : c’est le sommet. La descente mi♭ – ré♭ – do se détend. Puis do est « brodé » par si♮ et ré♭ : ces notes sont des ornements de do, plus légères que lui.</p>

<h2>Écoute la différence</h2>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4 : plat ou phrasé', bpm: 56, pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17, variants: [
  { label: 'Plat', flat: true, dyn: null },
  { label: 'Phrasé', dyn: { rh: [[0, 0.8], [2, 1.16], [3, 1.05], [4, 0.95], [5, 0.86], [6, 0.78], [8, 0.8], [10, 1.08], [11, 1.0], [13, 0.84], [16, 0.72]], lh: [[0, 0.9], [8, 0.82], [9, 0.9], [16, 0.75]] } },
], caption: 'Même tempo, mêmes notes. Dans la version phrasée, chaque note a un rôle : la levée prépare, le fa culmine, la descente se détend, la deuxième phrase reprend un peu moins fort.' })}

<h2>Quelques règles utiles</h2>
<ul>
<li><b>Une note longue décroît</b> toujours (le piano ne tient pas le son) : la note suivante doit en tenir compte. C’est l’objet de la <a href="#/lecon/n1-i2">leçon suivante</a>.</li>
<li><b>Deux notes répétées ne sont jamais identiques</b> : la seconde va vers la suivante ou se retire.</li>
<li><b>Une dissonance s’appuie, sa résolution se pose.</b></li>
<li><b>On ne finit pas une phrase en frappant la dernière note</b> : la note d’arrivée est plus douce que celle qui la précède.</li>
<li><b>On respire</b> entre deux phrases : un très léger allongement, ou un soupçon de silence, comme un chanteur qui reprend son souffle.</li>
<li><b>Une répétition n’est pas une copie</b> : la deuxième fois, change quelque chose (nuance, couleur, intensité).</li>
</ul>

${W.exo('Exercice', `<ol>
<li><b>Chante</b> la mélodie des mesures 1 à 8, à voix haute ou dans ta tête. Où respires-tu ?</li>
<li>Au crayon, marque le sommet de chaque phrase sur ta partition, mesures 1 à 24.</li>
<li>Joue la main droite seule en exagérant : sommets très forts, arrivées très douces. Puis garde la même forme avec des écarts plus petits.</li>
<li>Ajoute la main gauche en gardant la forme de la mélodie.</li>
</ol>`)}
${W.checklist({ id: 'n1-i1-check', title: 'Je vérifie', items: ['Chaque phrase a un sommet que je peux montrer sur la partition.', 'Les notes d’arrivée sont plus douces que celles qui les précèdent.', 'Les broderies (si♮, ré♭ autour de do) sont plus légères que do.', 'La reprise de la mesure 3 n’est pas une copie de la mesure 1.'] })}
`,
  },

  {
    id: 'n1-i2', minutes: 20,
    title: 'Chanter au piano : le bel canto chopinien',
    summary: 'Le piano ne tient pas les notes : il faut écouter chaque son jusqu’au bout et en tenir compte.',
    goals: ['Comprendre ce que Chopin cherchait chez les chanteurs.', 'Enchaîner une note longue et la suivante sans casser la ligne.', 'Placer les respirations.'],
    body: W => `
<p>Chopin admirait l’opéra italien, en particulier Bellini, et les grands chanteurs de son temps. Ses élèves rapportent qu’il leur conseillait d’aller les écouter, et qu’il voulait entendre chanter sa mélodie au piano. La difficulté est évidente : une chanteuse soutient sa note et peut même l’enfler ; au piano, chaque note <b>décroît</b> dès qu’elle est jouée.</p>

<h2>Écouter la note jusqu’au bout</h2>
${W.diagram('decay', {}, 'Après une note longue, la note suivante doit partir du niveau sonore atteint. Trop forte, elle crée un « trou » dans la ligne.')}
<p>Le geste est d’abord un geste d’écoute : pendant une note longue, suis sa décroissance, puis attaque la note suivante <b>au niveau</b> où la précédente est arrivée. La ligne paraît alors continue, comme chantée.</p>
${W.score({ abc: OP55.e1, title: 'Mesures 2-3 : la longue note do et la reprise sur fa', bpm: 56, pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17, variants: [
  { label: 'Reprise trop forte', dyn: { rh: [[0, 0.9], [9.9, 0.9], [10, 1.4], [11, 1.15], [16, 0.9]] } },
  { label: 'Reprise au niveau du son', dyn: { rh: [[0, 0.9], [2, 1.12], [5, 0.86], [9.9, 0.8], [10, 0.8], [11, 0.92], [12, 0.88], [16, 0.75]] } },
], caption: 'Écoute surtout le passage entre le do tenu (fin de la mesure 2) et le fa de la mesure 3.' })}

${W.exo('Exercice 1 — La note tenue', `<p>Joue une blanche pointée <i>mf</i> et écoute-la décroître. Au moment où tu ne l’entends plus beaucoup, joue la note voisine <b>exactement à ce niveau</b>. Recommence en montant, puis en descendant. Puis deux blanches liées : la ligne doit sembler ne faire qu’un son.</p>`)}

<h2>L’illusion du chant</h2>
<ul>
<li><b>Le portamento</b> : un chanteur glisse d’une note à l’autre lors d’un saut. Le pianiste en donne l’illusion en arrivant sur la note aiguë un soupçon plus tard et plus doucement.</li>
<li><b>Les ornements</b> (trilles, fioritures) sont des vocalises : légers, souples, jamais mécaniques. Ils décorent la note principale, ils ne la remplacent pas.</li>
<li><b>La respiration</b> : une chanteuse respire entre les phrases. Dans l’op. 55 n° 1, les respirations naturelles se trouvent après le do de la mesure 4 et après la cadence de la mesure 8.</li>
</ul>
${W.exo('Exercice 2 — Penser comme une chanteuse', `<p>Main droite seule, mesures 1 à 8 : chante-la d’abord (même faux, peu importe), en marquant tes respirations. Puis joue-la en imaginant ta voix. Enregistre-toi et vérifie qu’aucune note ne « sort » de la ligne.</p>`)}
${W.listen([
  W.yt('Bellini Casta diva', 'Bellini, « Casta diva » (Norma)', 'Le modèle du chant que Chopin aimait — plusieurs cantatrices à comparer'),
  W.yt('Bellini Norma Casta diva Callas', 'Maria Callas'),
], 'Écouter le bel canto')}
${W.links([W.informance('/content/pages/34-nocturne-in-c-sharp-minor', 'Nocturne in C-sharp Minor (Chopin)', 'Graham Fitch — un autre nocturne travaillé pas à pas (en anglais)')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-i3', minutes: 20,
    title: 'Le rubato : la main gauche garde le temps',
    summary: 'Le rubato « vole » du temps pour le rendre : une main droite libre sur une main gauche qui ne bronche pas.',
    goals: ['Distinguer le rubato de la mélodie et celui de la phrase.', 'Laisser la main droite libre sans déstabiliser la main gauche.', 'Éviter les maniérismes.'],
    body: W => `
<p><i>Tempo rubato</i> signifie « temps volé » : une note prend un peu plus de temps, et ce temps est rendu ailleurs. Les témoignages des élèves de Chopin s’accordent sur un point : chez lui, <b>la main gauche reste régulière, comme un chef d’orchestre</b>, pendant que la main droite chante librement.</p>

<h2>Deux sortes de rubato</h2>
<h3>Le rubato de la mélodie</h3>
${W.diagram('rubato', {}, 'La main droite s’attarde, anticipe, rattrape ; la main gauche garde la pulsation. Les deux mains se retrouvent aux points d’appui.')}
<h3>Le rubato de la phrase</h3>
${W.diagram('tempoCurve', {}, 'Ici, tout le tissu musical s’anime vers le sommet et se retient vers la cadence. C’est le rubato le plus courant aujourd’hui ; chez Chopin, il reste discret.')}

<h2>Trois versions à comparer</h2>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4', bpm: 56, pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17, variants: [
  { label: 'Strict', tempoMap: null, rhShift: null },
  { label: 'Rubato de la mélodie', rhShift: [[0, 0], [1.9, 0], [2, 70], [3, 35], [4, 0], [5, 25], [5.75, 85], [6, 30], [7, 0], [9.9, 0], [10, 80], [11, 40], [12, 0], [13, 25], [13.75, 85], [14, 30], [15, 0]] },
  { label: 'Rubato de la phrase', tempoMap: [[0, 1], [2, 1.05], [5, 1], [7, 0.86], [8.6, 0.9], [9, 1], [10, 1.05], [13, 1], [15, 0.84], [17, 0.78]] },
], caption: 'Dans la deuxième version, seule la main droite bouge (le fa arrive un peu tard, le si♮ s’attarde) ; la main gauche est identique à la version stricte.' })}

${W.exo('Exercice — Le chef d’orchestre', `<ol>
<li>Main gauche seule avec le <a href="#/outils/metronome">métronome</a> à ♩ = 56, mesures 1 à 8.</li>
<li>Ajoute la main droite, métronome toujours en marche : la main gauche reste avec le clic, la main droite peut s’attarder sur le fa ou sur le si♮, puis rattraper avant le temps suivant.</li>
<li>Coupe le métronome et garde la même sensation. Enregistre-toi : la main gauche doit rester stable.</li>
</ol>`)}
${W.metronome({ bpm: 56, beats: 4 })}
${W.warn('Ce que le rubato n’est pas', '<ul><li>Ce n’est pas jouer plus lentement : le temps volé est rendu.</li><li>Ce n’est pas ralentir à chaque fin de mesure : un tic qui devient vite pénible.</li><li>Ce n’est pas une liberté de la main gauche : si la basse flotte, tout flotte.</li></ul>')}
`,
  },

  {
    id: 'n1-i4', minutes: 25,
    title: 'Analyse du Nocturne op. 55 n° 1',
    summary: 'Forme, harmonie, nuances : ce que la partition dit, et ce que l’interprète en fait.',
    goals: ['Connaître la forme et les tonalités de la pièce.', 'Suivre l’harmonie des mesures 1 à 8.', 'En tirer des décisions d’interprétation.'],
    body: W => `
<h2>La forme</h2>
${W.diagram('form', { total: 101, sections: [
  { label: 'A', kind: 'A', from: 1, to: 47, key: 'fa mineur', note: 'thème chanté trois fois' },
  { label: 'B', kind: 'B', from: 48, to: 72, key: 'modulant', note: 'Più mosso' },
  { label: 'A′', kind: 'A', from: 73, to: 76 },
  { label: 'Coda', kind: 'coda', from: 77, to: 101, key: 'fa mineur → fa majeur', note: 'triolets, choral' },
] })}
<p>Une forme ternaire (A – B – A′) dont le retour est très court : quatre mesures seulement, puis la coda. Dans la section A, le thème (8 mesures) revient trois fois, à chaque fois varié, en alternance avec une phrase b qui monte par marches.</p>

<h2>L’harmonie des mesures 1 à 8</h2>
${W.score({ abc: OP55_ANALYSE, analysis: AN.op55_1_8, title: 'Mesures 1 à 8, avec l’analyse', bpm: 56, pedal: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31], pedalEnd: 33, caption: 'Les chiffrages sont expliqués dans le module de théorie (degrés et fonctions). N6 : sixte napolitaine.' })}
<ul>
<li><b>Mesures 1 à 4</b> : la basse fait fa – sol – la♭, puis mi♮ – fa. Les accords : i (fa mineur), VII<sup>6</sup> (mi♭ majeur avec sol à la basse), III (la♭ majeur), V<sup>6/5</sup> (do 7 avec mi à la basse). Une boucle qui tourne autour de fa.</li>
<li><b>Mesures 5 à 8</b> : même départ, mais à la mesure 6 apparaît un accord de <b>sol♭ majeur avec si♭ à la basse</b> : la <b>sixte napolitaine</b>, une couleur sombre et intense, juste avant la cadence (i<sup>6/4</sup> – V – i). C’est le moment le plus expressif de la phrase : le trille sur si♭ et les petites notes l’ornent.</li>
</ul>

<h2>La phrase b et la pédale de dominante</h2>
<p>Juste avant la mesure 17, un accord chromatique fait basculer la musique vers <b>la♭ majeur</b>, le relatif majeur : la lumière change. Puis la phrase monte par marches, quitte la♭ et se fixe sur une longue <b>pédale de do</b> à la basse (mesures 22-24) : do est la dominante de fa mineur, et cette tenue crée l’attente du retour du thème. Musicalement : intensité qui monte, puis suspension.</p>

<h2>Le Più mosso</h2>
<p>Un dialogue entre un motif en triolets (octaves graves) et des accords. La musique traverse plusieurs tonalités (do mineur, si♭ mineur, la région de sol♭) par des marches harmoniques, puis s’effondre en traits chromatiques et s’arrête sur la dominante, au point d’orgue de la mesure 72.</p>

<h2>La coda</h2>
<p>La basse se fixe sur fa (pédale de tonique) : après l’agitation, la stabilité. À la mesure 89, le mode bascule en <b>fa majeur</b>. Le choral final fait encore entendre un ré♭, souvenir du mode mineur (sous-dominante mineure), avant l’accord parfait de fa majeur.</p>

<h2>Les nuances</h2>
<ul>
<li>Le thème commence <i>p</i>. Aux deuxième et troisième passages, Chopin écrit <i>f</i> pour la deuxième moitié du thème (mesures 29 et 45) : la mélodie s’intensifie à chaque retour.</li>
<li>La phrase b est faite de crescendos et decrescendos courts : des vagues, pas une montée continue.</li>
<li>Le retour de la mesure 73 est <i>p</i> : après la tempête, la confidence.</li>
</ul>

<h2>Des décisions d’interprétation</h2>
${W.key('À retenir', `<ul>
<li>Les trois passages du thème ne se jouent pas de la même manière : du plus intime au plus intense.</li>
<li>La sixte napolitaine (mesure 6) mérite un temps et une couleur : c’est un sommet expressif, même dans le <i>p</i>.</li>
<li>La pédale de dominante (mesures 22-24) est une attente : ne te presse pas d’en sortir.</li>
<li>Le Più mosso doit être plus animé, mais il reste un nocturne : ne joue pas un autre morceau.</li>
<li>La coda en fa majeur est un apaisement, pas une victoire : <i>molto legato</i>, sonorité ronde.</li>
</ul>`)}
`,
  },

  {
    id: 'n1-i5', minutes: 20,
    title: 'Écouter les grands interprètes',
    summary: 'L’écoute comparée, un outil de travail : mesurer, comparer, choisir.',
    goals: ['Écouter activement, partition en main.', 'Comparer plusieurs versions sur des critères précis.', 'Construire ta propre interprétation.'],
    body: W => `
<p>Écouter un enregistrement pour le copier n’a pas beaucoup d’intérêt. Écouter <b>plusieurs</b> versions, partition en main, avec des questions précises, apprend énormément : on découvre ce qui est possible, et on choisit.</p>

<h2>La méthode</h2>
<ol>
<li>Choisis deux versions très différentes.</li>
<li>Écoute un passage précis (le thème, la phrase b, le Più mosso, la coda), partition en main.</li>
<li>Note trois observations concrètes par version : tempo, équilibre, pédale, rubato, caractère.</li>
<li>Essaie au piano ce qui t’a convaincu.</li>
</ol>
${W.tip('Mesurer le tempo', '<p>Ouvre le <a href="#/outils/metronome">métronome</a> et utilise « Taper le tempo » sur les noires du thème pendant l’écoute : tu obtiens le tempo de chaque version. Les écarts sont souvent étonnants.</p>')}

<h2>Les questions à se poser</h2>
${W.checklist({ id: 'n1-i5-q', title: 'Pour chaque version', items: [
  '<b>Tempo du thème</b> : combien à la noire ? Le tempo est-il stable ?',
  '<b>Main gauche</b> : détachée, ou liée par la pédale ? Basses appuyées ou discrètes ?',
  '<b>Rubato</b> : dans la mélodie seulement, ou dans toute la phrase ? Où s’attarde l’interprète ?',
  '<b>La sixte napolitaine</b> (mesure 6) : est-elle soulignée ?',
  '<b>Le Più mosso</b> : combien plus vite ? Plutôt dramatique ou plutôt fluide ?',
  '<b>La coda</b> : tempo des triolets, accélération vers l’aigu (mesures 89-96), sonorité du choral.',
] })}

<h2>Les versions</h2>
${W.listen([
  W.yt('Chopin Nocturne op 55 no 1 Rubinstein', 'Arthur Rubinstein', 'RCA, 1965 — la référence classique, chant naturel et rubato sobre'),
  W.yt('Chopin Nocturne op 55 no 1 Pires', 'Maria João Pires', 'DG, 1996'),
  W.yt('Chopin Nocturne op 55 no 1 Pollini', 'Maurizio Pollini', 'DG, 2005'),
  W.yt('Chopin Nocturne op 55 no 1 Moravec', 'Ivan Moravec'),
  W.yt('Chopin Nocturne op 55 no 1 Samson François', 'Samson François'),
])}
${W.exo('Exercice', '<p>Compare Rubinstein et une autre version sur le thème (mesures 1 à 8) et sur la coda. Écris trois différences. Puis enregistre ta propre version et situe-la : de quoi est-elle la plus proche ? Qu’aimerais-tu changer ?</p>')}

<h2>Élargir l’oreille</h2>
<p>Pour sentir le style des nocturnes, écoute aussi d’autres nocturnes de Chopin : op. 9 n° 2, op. 27 n° 2, et ceux qui viennent dans le parcours, op. 15 n° 1 et op. 9 n° 1.</p>
${W.listen([
  W.yt('Chopin Nocturne op 9 no 2 Rubinstein', 'Nocturne op. 9 n° 2'),
  W.yt('Chopin Nocturne op 27 no 2 Rubinstein', 'Nocturne op. 27 n° 2'),
  W.yt('Chopin Nocturne op 15 no 1 Rubinstein', 'Nocturne op. 15 n° 1 (niveau 2)'),
], 'Autres nocturnes')}
`,
  },
];
