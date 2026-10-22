// Niveau 1 — Oreille : repartir de zéro. Chanter d'abord, puis reconnaître ; les degrés avant les noms.
// Inspiré des méthodes Kodály et Willems (chanter avant de nommer) et de l'entraînement « fonctionnel »
// (Functional Ear Trainer, Improvise for Real : chaque note entendue par rapport à la tonique).
import { OP55 } from './content-excerpts.js';

const ROUTINE = (items) => `<div class="callout exo"><div class="c-title">Ta routine (10 minutes par jour)</div><ol>${items.map(i => `<li>${i}</li>`).join('')}</ol></div>`;

export default [
  {
    id: 'n1-or1', minutes: 10, prio: 2,
    title: 'Grave ou aigu, monter ou descendre',
    summary: 'Le point de départ de toute oreille musicale : comparer deux hauteurs, puis suivre le dessin d’une mélodie.',
    goals: ['Dire si une note est plus aiguë ou plus grave qu’une autre, même proche.', 'Reconnaître le dessin d’une courte mélodie.', 'Prendre l’habitude d’un entraînement court et quotidien.'],
    essentials: [
      'Aigu ou grave, c’est la <b>hauteur</b> ; fort ou doux, c’est le volume : ne pas les confondre.',
      'Pour retrouver une mélodie : d’abord la <b>direction</b>, puis la taille des pas.',
      'L’oreille se travaille comme les doigts : <b>dix minutes par jour</b>.',
    ],
    goal: 'tu réussis la série « Plus grave ou plus aigu ? » jusqu’aux écarts d’un demi-ton.',
    body: W => `
<p>Beaucoup de musiciens pensent « ne pas avoir d’oreille ». En réalité, l’oreille se travaille exactement comme les doigts : par un entraînement court, régulier et progressif. Ce module repart de zéro. Les premières étapes te paraîtront peut-être faciles : c’est voulu. On construit des fondations solides, et la difficulté augmente d’elle-même.</p>

<h2>Aigu et grave</h2>
<p>Une note est plus <b>aiguë</b> quand elle vibre plus vite (vers la droite du clavier), plus <b>grave</b> quand elle vibre plus lentement (vers la gauche). Attention à ne pas confondre :</p>
<ul>
<li><b>aigu / grave</b> (la hauteur) avec <b>fort / doux</b> (le volume) : une note grave peut être très forte ;</li>
<li><b>monter / descendre</b> avec <b>s’éclaircir / s’assombrir</b> : seule compte la hauteur.</li>
</ul>
${W.kbd({ from: 48, to: 84, title: 'Deux notes éloignées, puis deux notes proches', marks: [{ m: 50 }, { m: 79 }, { m: 64 }, { m: 65 }], names: 'none', play: 'seq', seq: [50, 79, 64, 65], step: 0.9, caption: 'Un grand écart s’entend tout de suite ; un demi-ton demande plus d’attention.' })}

<h2>Le dessin d’une mélodie</h2>
<p>Une mélodie a une forme : elle monte, descend, fait une arche ou un creux. Reconnaître ce dessin est la première étape pour retrouver une mélodie au piano. Avant de chercher les notes exactes, on cherche toujours la <b>direction</b>, puis la <b>taille des pas</b>.</p>

${ROUTINE([
  'Une minute de jeu libre : joue deux notes au hasard, les yeux fermés, et dis « monte » ou « descend » avant de vérifier.',
  'Cinq minutes : série « Plus grave ou plus aigu ? ». L’écart se resserre quand tu réussis et s’élargit quand tu te trompes : tu travailles toujours à la limite de ce que tu perçois.',
  'Trois minutes : série « Le dessin d’une mélodie », à trois notes puis à quatre.',
])}
${W.quiz({ kind: 'highlow', minSt: 1, maxSt: 12, title: 'Plus grave ou plus aigu ?', count: 12, stat: 'hl', intro: 'Douze questions. L’écart diminue quand tu réponds juste ; vise un écart d’un ou deux demi-tons en quelques jours.' })}
${W.tip('Fredonne', '<p>Fredonne les deux notes à mi-voix après les avoir entendues : ta voix sent très nettement si elle monte ou descend, souvent mieux que ton oreille seule.</p>')}
${W.quiz({ kind: 'contour', notes: 3, title: 'Le dessin d’une mélodie (3 notes)', count: 10, stat: 'contour' })}
${W.tip('Dessine avec la main', '<p>Pendant l’écoute, suis la mélodie avec la main, de bas en haut : le geste fixe l’attention sur la direction.</p>')}
${W.quiz({ kind: 'contour', notes: 4, title: 'Le dessin d’une mélodie (4 notes)', count: 10, stat: 'contour4' })}

<h2>Dans ta pièce</h2>
<p>Écoute les mesures 1 à 4 du nocturne en suivant la mélodie avec la main : do <b>monte</b> vers fa par un saut, puis <b>descend</b> par petits pas (mi♭, ré♭, do) ; à la mesure 2, elle tourne autour de do (si♮ en dessous, ré♭ au-dessus). Chante ce dessin sur « la » avant de le jouer.</p>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4 : suis le dessin de la mélodie', bpm: 56, startBpm: 50, hands: false, practice: false })}

${W.warn('Si c’est difficile', '<p>C’est normal pour les petits écarts (un ou deux demi-tons) : beaucoup de débutants les confondent au début. Réécoute autant que tu veux, fredonne, et reviens-y le lendemain : la perception s’affine en quelques jours.</p>')}
`,
  },

  {
    id: 'n1-or2', minutes: 10,
    title: 'Chanter juste : trouver sa voix',
    summary: 'Chanter relie l’oreille au corps. Trouver sa tessiture, reproduire une note entendue, et vérifier au micro.',
    goals: ['Mesurer ta tessiture confortable avec « Trouver ma voix ».', 'Reproduire une note entendue, à l’octave qui te convient.', 'Lire la ligne de ta voix et corriger en glissant.'],
    essentials: [
      'Chanter relie l’oreille au corps : une note que tu sais chanter, tu finiras par la reconnaître.',
      'Travaille dans ta <b>tessiture confortable</b> ; une note trop haute ou trop basse se chante à l’octave.',
      'Écouter, entendre la note intérieurement, fredonner, puis <b>glisser</b> en regardant la ligne jusqu’à la bande verte.',
    ],
    goal: 'au micro, 6 notes sur 8 validées dans « Chanter une note, au milieu de ta voix », puis 80 % dans « Chanter une note entendue ».',
    body: W => `
<p>Toutes les grandes méthodes d’éducation de l’oreille (Kodály, Willems…) commencent par le chant : une note que tu peux chanter juste, tu finiras par la reconnaître. Il ne s’agit pas de devenir chanteur, mais de faire de ta voix un instrument de vérification. Personne ne t’entend : ose. Et si c’est difficile au début, c’est normal : chanter juste est un geste qui s’apprend, comme le legato.</p>

<h2>1. Trouver ta voix (une fois pour toutes)</h2>
<p>Ouvre le micro et fais la <b>sirène</b> : glisse ta voix du grave à l’aigu et retour, bouche fermée, sans forcer. La ligne te montre où tu es. Puis tiens une seconde ta note la plus grave confortable, et ta note la plus aiguë confortable. Garde cette tessiture : les exercices choisiront ensuite leurs notes <b>au milieu de ta voix</b>.</p>
${W.voix()}
<p class="small">Une voix d’homme est souvent à l’aise entre la1 et mi3, une voix de femme entre la2 et mi4. Si une note entendue est trop aiguë ou trop grave, chante-la à l’octave : seule la hauteur compte, le micro le sait.</p>

<h2>2. Lire la ligne</h2>
<p>Pendant les exercices, une <b>ligne</b> dessine ta voix en direct ; la <b>bande verte</b> est la note à chanter. Sous la bande : tu es trop bas, monte. Au-dessus : trop haut, descends. La ligne devient <b>verte</b> quand c’est juste, <b>dorée</b> quand tu es tout près. Tiens-la une demi-seconde dans la bande : la note est validée. En dessous, une phrase te dit quoi corriger, selon ce que tu chantes.</p>

<h2>3. La méthode, à chaque note</h2>
<ol>
<li><b>Écouter</b>, sans chanter. Laisse la note sonner jusqu’au bout.</li>
<li><b>L’entendre</b> dans ta tête, une seconde de silence.</li>
<li><b>Fredonner</b> « mmm », doucement : c’est plus facile de trouver la hauteur bouche fermée.</li>
<li><b>Glisser</b> si la ligne n’est pas dans la bande : lentement, comme une sirène, en la regardant. Arrête-toi dès qu’elle devient verte.</li>
<li><b>Tenir</b>, calmement, avec de l’air, puis ouvrir sur « la ».</li>
</ol>

<h2>4. Si ça ne marche pas</h2>
<table>
<thead><tr><th>Ce qui se passe</th><th>Pourquoi, souvent</th><th>Quoi faire</th></tr></thead>
<tbody>
<tr><td>« Je ne t’entends pas »</td><td>tablette trop loin, voix trop douce, bruit de fond</td><td>tablette à 30–50 cm, chante sur « la » ou « ou », coupe le ventilateur</td></tr>
<tr><td>La ligne est loin de la bande</td><td>tu as chanté la première note qui venait</td><td>réécoute, fredonne, puis glisse vers la bande ; rejoue la note sur ton piano et chante <b>en même temps</b>, puis seul</td></tr>
<tr><td>Toujours un peu sous la bande</td><td>le cas le plus fréquent : timidité, manque d’air</td><td>respire avant, pense la note « plus haut », souris légèrement</td></tr>
<tr><td>Au-dessus de la bande</td><td>tu forces, tu chantes fort</td><td>chante plus doucement, plus détendu</td></tr>
<tr><td>La ligne tremble</td><td>voix serrée, trop de volume</td><td>« mmm » doux et tenu, épaules basses, comme un soupir</td></tr>
<tr><td>Juste, mais pas validé</td><td>la note n’est pas tenue</td><td>tiens-la une demi-seconde sans bouger</td></tr>
<tr><td>La note est inconfortable</td><td>elle est hors de ta tessiture</td><td>chante-la à l’octave ; mesure ta tessiture (étape 1)</td></tr>
</tbody></table>

${ROUTINE([
  'Deux minutes d’échauffement : la sirène dans « Trouver ma voix », bouche fermée, puis sur « ou ».',
  'Cinq minutes : série « Chanter une note, au milieu de ta voix », puis « Chanter une note entendue » quand tu réussis 6 notes sur 8.',
  'Trois minutes : joue la mélodie des mesures 1 et 2 du nocturne (do – fa – mi♭ – ré♭ – do) et chante-la en même temps, puis seul, puis vérifie au piano.',
])}
${W.quiz({ kind: 'sing', task: 'match', span: 4, title: 'Chanter une note, au milieu de ta voix', count: 8, stat: 'sing-match-a', intro: 'Huit notes, toutes proches du milieu de ta voix. Si tu en manques, les suivantes se resserrent encore et durent plus longtemps.' })}
${W.tip('Les boutons d’aide', '<p><b>Réécouter</b> rejoue la note (le micro se tait pendant le son). <b>Je passe</b> donne la réponse et la fait entendre. Dans les exercices de degrés, <b>Indice</b> fait entendre la tonique ou la première note : la question ne compte plus « du premier coup », mais tu apprends.</p>')}
${W.quiz({ kind: 'sing', task: 'match', title: 'Chanter une note entendue', count: 8, stat: 'sing-match' })}

<h2>Dans ta pièce</h2>
<p>Chante la mélodie des mesures 1 à 4 en jouant la main gauche seule. Puis l’inverse : joue la mélodie et chante les basses (fa, sol, la♭, mi). Chanter une voix pendant que tu en joues une autre est l’un des meilleurs exercices d’écoute qui soient.</p>

${W.warn('« Je chante faux »', '<p>Chanter faux est presque toujours un manque d’habitude, pas un défaut d’oreille. Les trois causes habituelles : une note hors de ta tessiture, pas assez de temps pour écouter avant, une voix trop forte. Corrige-les une par une, avec la ligne sous les yeux : elle entrera dans la bande verte.</p>')}
`,
  },

  {
    id: 'n1-or3', minutes: 10,
    title: 'La pulsation et le rythme',
    summary: 'Sentir le temps dans le corps, puis retenir et retaper un rythme entendu.',
    goals: ['Garder une pulsation stable.', 'Retaper un rythme d’une mesure entendu une fois.', 'Distinguer noires, blanches, croches à l’oreille.'],
    essentials: [
      'La <b>pulsation</b> est le battement régulier qui ne s’arrête jamais ; le <b>rythme</b> est la suite des durées posée dessus.',
      'Un rythme se retient en le rapportant aux temps : « la note longue dure deux temps ».',
      'Compter pendant l’écoute, chanter le rythme, puis le taper.',
    ],
    goal: '80 % ou plus à la série d’écho rythmique.',
    body: W => `
<p>L’oreille rythmique est aussi importante que l’oreille des hauteurs : un rythme juste avec une note fausse se remarque moins qu’une note juste au mauvais moment. Et c’est la base de la lecture à vue et de l’improvisation.</p>

<h2>Pulsation et rythme</h2>
<ul>
<li>La <b>pulsation</b> est le battement régulier, celui que l’on bat du pied. Elle ne s’arrête jamais.</li>
<li>Le <b>rythme</b> est la succession des durées, posée sur la pulsation : des notes longues, courtes, des silences.</li>
</ul>
<p>Pour retenir un rythme, on le rapporte toujours à la pulsation : « la note longue dure deux temps », « deux notes rapides dans le 3e temps ».</p>

${ROUTINE([
  'Une minute : marche dans la pièce sur le métronome (♩ = 72), en comptant « 1, 2, 3, 4 », puis tape dans les mains seulement sur le 1.',
  'Six minutes : série d’écho rythmique. Écoute, compte, puis tape le rythme au moment indiqué.',
  'Trois minutes : sur l’enregistrement des mesures 1 à 4, tape la pulsation, puis le rythme de la mélodie.',
])}
${W.metronome({ bpm: 72 })}
${W.rhythm({ level: 1, mode: 'echo', bpm: 72, title: 'Écho rythmique : noires, blanches, rondes', stat: 'ry-1' })}
${W.tip('Compte pendant l’écoute', '<p>Compte « 1, 2, 3, 4 » à voix basse pendant que le rythme est joué : tu sauras sur quels temps tombent les notes, et tu n’auras plus qu’à les retaper.</p>')}
${W.rhythm({ level: 2, mode: 'echo', bpm: 72, title: 'Écho rythmique : avec des croches', stat: 'ry-2' })}
${W.tip('Chante avant de taper', '<p>Chante le rythme sur « ta » juste après l’avoir entendu, puis tape-le : la voix retient mieux que les mains.</p>')}

<h2>Dans ta pièce</h2>
<p>Écoute les mesures 1 à 4 en tapant la pulsation de la main gauche (une noire par temps), puis en tapant le rythme de la mélodie. Repère la seule note longue (le do tenu, mesures 2-3) et compte bien ses trois temps.</p>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4', bpm: 56, startBpm: 50, click: true, practice: false })}

${W.warn('Si tu tapes en retard', '<p>Si l’appli te dit que ton rythme est juste mais décalé, tape bien <b>avec</b> les clics, sans attendre de les entendre. Si le décalage persiste, calibre la latence dans les Réglages : la tablette met parfois quelques dizaines de millisecondes à faire sortir le son.</p>')}
`,
  },

  {
    id: 'n1-or4', minutes: 10,
    title: 'La tonique : se sentir « à la maison »',
    summary: 'Dans une tonalité, une note sonne comme un repos : la tonique. L’entendre et la chanter est la clé de toute la suite.',
    goals: ['Reconnaître si une note est la tonique, après une cadence.', 'Chanter la tonique d’une tonalité entendue.', 'Comprendre pourquoi on entend les notes « par rapport à la tonique ».'],
    essentials: [
      'On entend une note <b>par rapport à la tonique</b>, la note « maison » de la tonalité.',
      'Une cadence I – IV – V7 – I installe la tonalité ; après elle, chaque degré a sa couleur et sa tendance.',
      'Chanter la tonique d’une tonalité entendue : la base de toute la suite.',
    ],
    goal: '80 % ou plus à la série « La tonique ou pas ? », et tu chantes juste la tonique après une cadence.',
    body: W => `
<p>Voici l’idée qui va transformer ton oreille : on ne reconnaît pas une note isolée (presque personne n’a l’« oreille absolue »), on la reconnaît <b>par rapport à la tonique</b>. Dans une tonalité, chaque degré a une couleur et une tendance propres : 1 repose, 7 tire vers le haut, 4 penche vers 3… C’est le principe des méthodes d’oreille « fonctionnelle » : avant chaque question, une courte cadence installe la tonalité, puis tu situes la note par rapport à elle.</p>

<h2>La cadence qui installe la tonalité</h2>
<p>Les exercices commencent par quatre accords : I – IV – V7 – I. Après eux, ton oreille sait où est la « maison ». Ensuite vient une note : est-ce la tonique ? Si oui, tout s’arrête bien ; sinon, la note donne envie de bouger.</p>
${W.kbd({ from: 48, to: 72, title: 'La cadence en do majeur, puis la tonique', marks: [{ m: 60, label: '1', color: '#cfe6d7' }], names: 'none', play: 'chord', seq: [48, 64, 67, 72], caption: 'L’accord de do majeur : la tonique (1) à la basse et au sommet.' })}

${ROUTINE([
  'Deux minutes : joue la cadence I – IV – V7 – I en do majeur, puis chante do (la tonique). Recommence en sol majeur et en fa majeur.',
  'Cinq minutes : série « La tonique ou pas ? ».',
  'Trois minutes : série « Chanter la tonique » (au micro).',
])}
${W.quiz({ kind: 'degree', binary: true, degrees: [1, 2, 3, 4, 5, 6, 7], title: 'La tonique ou pas ?', count: 12, stat: 'deg-1' })}
${W.tip('La résolution', '<p>Après chaque réponse, écoute la petite descente (ou montée) qui ramène la note vers la tonique. C’est ce chemin que ton oreille apprend : bientôt, tu sentiras d’avance où chaque note veut aller.</p>')}
${W.quiz({ kind: 'sing', task: 'degree', degrees: [1], key: 'random', title: 'Chanter la tonique après la cadence', count: 8, stat: 'sing-tonic' })}
${W.tip('Chante en dedans', '<p>Prends l’habitude, après chaque cadence, de chanter intérieurement la tonique et de la garder en tête pendant toute la question. C’est ton point de repère.</p>')}

<h2>Dans ta pièce</h2>
<p>La tonique de l’op. 55 est <b>fa</b> (fa mineur). Écoute la fin de la mesure 8 et la fin de la pièce : tout se pose sur fa. Pendant que tu joues les mesures 1 à 8, chante intérieurement un fa grave à chaque retour de l’accord de fa mineur : sens comme les autres accords s’en éloignent.</p>

${W.warn('Si tu hésites souvent', '<p>Chante la tonique juste après la cadence, puis chante la note entendue, et glisse de l’une à l’autre : si le chemin est nul, c’était la tonique. Ce petit détour devient vite inutile.</p>')}
`,
  },

  {
    id: 'n1-or5', minutes: 10,
    title: 'Les degrés 1, 2, 3',
    summary: 'Trois notes, trois couleurs : la tonique, la sus-tonique qui retombe, la médiante lumineuse.',
    goals: ['Reconnaître 1, 2 et 3 après une cadence, en do majeur puis dans d’autres tonalités.', 'Chanter 1-2-3 et 3-2-1.', 'Rejouer au piano une mélodie de trois notes.'],
    essentials: [
      '<b>1</b> repose, <b>2</b> est une légère question qui retombe, <b>3</b> est stable et lumineux (il fait le majeur).',
      'On chante les degrés par leurs <b>numéros</b> : ils restent les mêmes dans toutes les tonalités.',
      'Si la note veut tomber tout de suite d’un pas, c’est 2.',
    ],
    goal: '80 % à la série « Degrés 1, 2, 3 » en do majeur, puis dans toutes les tonalités.',
    body: W => `
<h2>Trois couleurs</h2>
<table>
<thead><tr><th class="num">Degré</th><th>En do</th><th>Ce qu’on entend</th><th>Où il veut aller</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>do</td><td>le repos complet</td><td>nulle part</td></tr>
<tr><td class="num">2</td><td>ré</td><td>une tension légère, comme une question</td><td>descendre vers 1</td></tr>
<tr><td class="num">3</td><td>mi</td><td>stable et lumineux (il fait le majeur)</td><td>peut rester, ou descendre 3-2-1</td></tr>
</tbody></table>
<p>On chante les degrés avec leurs <b>numéros</b> (« un, deux, trois ») : ils restent les mêmes dans toutes les tonalités. En do majeur, tu peux aussi chanter do, ré, mi. Certains s’aident des gestes de la main de la méthode Kodály (main fermée pour 1, main inclinée vers le haut pour 2, main à plat pour 3) : essaie, cela fixe la mémoire.</p>
${W.kbd({ from: 60, to: 67, title: '1, 2, 3 en do majeur', marks: [{ m: 60, label: '1' }, { m: 62, label: '2' }, { m: 64, label: '3' }], names: 'none', play: 'seq', seq: [60, 62, 64, 62, 60], step: 0.5 })}

${ROUTINE([
  'Deux minutes : joue la cadence en do, chante 1-2-3-2-1 (« un, deux, trois, deux, un »), puis seulement 1 – 3 – 1.',
  'Cinq minutes : série « Degrés 1, 2, 3 » en do majeur ; quand tu atteins 80 %, passe à la série « toutes tonalités ».',
  'Trois minutes : série « Rejouer 3 notes » au piano.',
])}
${W.quiz({ kind: 'degree', degrees: [1, 2, 3], names: true, title: 'Degrés 1, 2, 3 (do majeur)', count: 12, stat: 'deg-123' })}
${W.tip('Le sens de la résolution', '<p>2 et 3 descendent tous deux vers 1, mais 2 « tombe » tout de suite, alors que 3 pourrait rester. Si la note semble vouloir s’effondrer d’un seul pas, c’est 2.</p>')}
${W.quiz({ kind: 'degree', degrees: [1, 2, 3], key: 'random', title: 'Degrés 1, 2, 3 (toutes tonalités)', count: 12, stat: 'deg-123r' })}
${W.quiz({ kind: 'sing', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [1, 3, 1], [1, 2, 1]], title: 'Chanter 1-2-3 et 3-2-1', count: 8, stat: 'sing-123' })}
${W.tip('Chante avant de jouer', '<p>Pour rejouer une mélodie, chante-la d’abord en numéros (« un, deux, un… »), puis joue : tu ne cherches plus au hasard sur le clavier.</p>')}
${W.quiz({ kind: 'echo', degrees: [1, 2, 3], length: 3, title: 'Rejouer 3 notes (degrés 1 à 3)', count: 8, stat: 'echo-3' })}

<h2>Dans ta pièce</h2>
<p>La coda de l’op. 55 se termine en fa majeur. Joue l’accord final (fa – la – do) et chante fa – sol – la (1 – 2 – 3), puis la – sol – fa (3 – 2 – 1) : c’est la fin de très nombreuses mélodies.</p>

${W.warn('Si 2 et 3 se confondent', '<p>Chante 1 juste après la cadence, puis monte pas à pas : 1, 2… et vérifie si tu as atteint la note. Compter les pas depuis 1 est la méthode de secours, toujours fiable.</p>')}
`,
  },

  {
    id: 'n1-or6', minutes: 10,
    title: 'Les degrés 1 à 5',
    summary: 'Ajouter la sous-dominante qui penche vers 3, et la dominante, stable mais ouverte.',
    goals: ['Reconnaître les degrés 1 à 5, dans toutes les tonalités.', 'Chanter 1-3-5 et 5-4-3-2-1.', 'Rejouer une mélodie de quatre notes.'],
    essentials: [
      '<b>1 – 3 – 5</b> forment l’accord de tonique, les notes stables ; <b>2 et 4</b> sont des notes de passage.',
      '<b>4</b> penche vers 3 (un demi-ton plus bas) ; <b>5</b> est stable mais ouvert, comme une porte.',
      'Dans une mélodie à rejouer, pars de la fin (souvent 1) si tu as perdu le milieu.',
    ],
    goal: '80 % à la série « Degrés 1 à 5 », en do puis dans toutes les tonalités.',
    body: W => `
<h2>Deux nouvelles couleurs</h2>
<table>
<thead><tr><th class="num">Degré</th><th>En do</th><th>Ce qu’on entend</th><th>Où il veut aller</th></tr></thead>
<tbody>
<tr><td class="num">4</td><td>fa</td><td>une tension douce, juste au-dessus de 3</td><td>descendre vers 3</td></tr>
<tr><td class="num">5</td><td>sol</td><td>stable mais ouvert, comme une porte</td><td>peut rester, ou rejoindre 1 (en sautant ou par la gamme)</td></tr>
</tbody></table>
<p>1 – 3 – 5 forment l’accord de tonique : ce sont les trois notes les plus stables. 2 et 4 sont les notes « de passage » entre elles.</p>
${W.kbd({ from: 60, to: 67, title: 'Les cinq premiers degrés en do', marks: [{ m: 60, label: '1' }, { m: 62, label: '2' }, { m: 64, label: '3' }, { m: 65, label: '4' }, { m: 67, label: '5' }], names: 'none', play: 'seq', seq: [60, 62, 64, 65, 67, 65, 64, 62, 60], step: 0.42 })}

${ROUTINE([
  'Deux minutes : cadence, puis chante 1-3-5-3-1 et 5-4-3-2-1 en numéros.',
  'Cinq minutes : série « Degrés 1 à 5 », d’abord en do, puis toutes tonalités.',
  'Trois minutes : série « Rejouer 4 notes ».',
])}
${W.quiz({ kind: 'degree', degrees: [1, 2, 3, 4, 5], names: true, title: 'Degrés 1 à 5 (do majeur)', count: 12, stat: 'deg-15' })}
${W.tip('Le 4 et le 5', '<p>4 penche, il veut descendre d’un demi-ton vers 3. 5, lui, se tient debout : on pourrait presque s’arrêter dessus. Si la note semble suspendue mais stable, c’est 5.</p>')}
${W.quiz({ kind: 'degree', degrees: [1, 2, 3, 4, 5], key: 'random', title: 'Degrés 1 à 5 (toutes tonalités)', count: 12, stat: 'deg-15r' })}
${W.quiz({ kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5]], title: 'Chanter 1-3-5 et 5-4-3-2-1', count: 8, stat: 'sing-135' })}
${W.quiz({ kind: 'echo', degrees: [1, 2, 3, 4, 5], length: 4, title: 'Rejouer 4 notes (degrés 1 à 5)', count: 8, stat: 'echo-5' })}
${W.tip('La dernière note', '<p>Dans les mélodies à rejouer, la dernière note revient souvent sur 1. Si tu as perdu le milieu, pars de la fin et remonte.</p>')}

<h2>Dans ta pièce</h2>
<p>La levée de l’op. 55 fait <b>do → fa</b>. En fa mineur, do est le degré <b>5</b> et fa le degré <b>1</b> : 5 → 1, le plus fort des appels mélodiques. Chante « cinq, un » sur do – fa, puis joue le début : entends-tu la phrase s’ouvrir sur la tonique ?</p>

${W.warn('Si 4 et 5 se confondent', '<p>Chante 3 – 4 – 3 puis 3 – 5 – 3 : 4 est collé à 3 (un demi-ton en majeur), 5 en est séparé par un ton. Ce contraste de distance est le meilleur indice.</p>')}
`,
  },

  {
    id: 'n1-or7', minutes: 10,
    title: 'Toute la gamme : 6, 7 et 8',
    summary: 'La sus-dominante, douce, et la sensible, la note la plus tendue de la gamme.',
    goals: ['Reconnaître tous les degrés de la gamme majeure.', 'Sentir l’attraction de la sensible vers la tonique.', 'Rejouer une mélodie de cinq notes.'],
    essentials: [
      '<b>6</b> est doux et redescend vers 5 ; <b>7</b>, la sensible, est la note la plus tendue : elle veut monter vers la tonique.',
      '2, 3 et 4 se résolvent en descendant vers 1 ; 5, 6 et 7 en montant vers 8.',
      'Dans ton nocturne : la basse mi♮ de la mesure 2, sensible de fa mineur, monte vers fa.',
    ],
    goal: '70 % ou plus à la série « Toute la gamme (toutes tonalités) ».',
    body: W => `
<h2>Les deux derniers degrés</h2>
<table>
<thead><tr><th class="num">Degré</th><th>En do</th><th>Ce qu’on entend</th><th>Où il veut aller</th></tr></thead>
<tbody>
<tr><td class="num">6</td><td>la</td><td>doux, un peu mélancolique</td><td>redescendre vers 5</td></tr>
<tr><td class="num">7</td><td>si</td><td>la <b>sensible</b> : très tendue</td><td>monter vers 8 (la tonique aiguë)</td></tr>
<tr><td class="num">8</td><td>do</td><td>la tonique, une octave plus haut</td><td>le repos</td></tr>
</tbody></table>
<p>Dans les exercices, 2, 3 et 4 se résolvent en descendant vers 1, et 5, 6, 7 en montant vers 8 : écoute attentivement ces chemins.</p>
${W.kbd({ from: 60, to: 72, title: 'Toute la gamme de do', marks: [60, 62, 64, 65, 67, 69, 71, 72].map((m, i) => ({ m, label: String(i + 1) })), names: 'none', play: 'seq', seq: [60, 62, 64, 65, 67, 69, 71, 72], step: 0.38 })}

${ROUTINE([
  'Deux minutes : chante la gamme en numéros, en montant et en descendant ; puis 8-7-8 et 5-6-5.',
  'Cinq minutes : série « Toute la gamme (do majeur) », puis toutes tonalités quand tu atteins 70 %.',
  'Trois minutes : série « Rejouer 5 notes ».',
])}
${W.quiz({ kind: 'degree', degrees: [1, 2, 3, 4, 5, 6, 7, 8], names: true, title: 'Toute la gamme (do majeur)', count: 12, stat: 'deg-18', goal: 0.7 })}
${W.tip('La sensible', '<p>7 est la note la plus facile à reconnaître une fois qu’on l’a sentie : elle donne une envie presque physique de monter d’un demi-ton. Si la note « démange », c’est 7.</p>')}
${W.quiz({ kind: 'degree', degrees: [1, 2, 3, 4, 5, 6, 7, 8], key: 'random', title: 'Toute la gamme (toutes tonalités)', count: 12, stat: 'deg-18r', goal: 0.7 })}
${W.quiz({ kind: 'echo', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 5, maxStep: 2, title: 'Rejouer 5 notes (toute la gamme)', count: 8, stat: 'echo-8', goal: 0.7 })}
<p>Même travail sur ta pièce : les motifs de l’op. 55, en fa mineur. Chante-les avant de les rejouer ; ensuite, tu les entendras dans la partition au lieu de seulement les lire.</p>
${W.quiz({ kind: 'echo', motifs: ['op55-a', 'op55-b', 'op55-c'], title: 'Les motifs de ta pièce (op. 55 n° 1)', count: 6, stat: 'echo-op55', goal: 0.7 })}
${W.quiz({ kind: 'sing', task: 'echo', motifs: ['op55-a', 'op55-b'], title: 'Chanter les motifs de ta pièce', count: 6, stat: 'sing-op55', goal: 0.6 })}
${W.quiz({ kind: 'sing', task: 'degree', degrees: [1, 3, 5, 6, 7], title: 'Chanter un degré après la cadence', count: 8, stat: 'sing-deg', goal: 0.7 })}

<h2>Dans ta pièce</h2>
<p>À la mesure 2 de l’op. 55, la basse <b>mi♮</b> est la <b>sensible</b> de fa mineur (son 7e degré, haussé). Joue les mesures 2 et 3 en écoutant ce mi♮ monter vers fa : c’est exactement le chemin 7 → 8 de tes exercices.</p>

${W.warn('Si 6 et 7 se confondent', '<p>Chante 8 juste avant (la tonique aiguë) et descends : 8 – 7 est un demi-ton, 8 – 6 une tierce. Ou chante 5 – 6 – 5 : 6 retombe naturellement sur 5.</p>')}
`,
  },

  {
    id: 'n1-or8', minutes: 10,
    title: 'Majeur ou mineur, fin ou suspension',
    summary: 'Les deux grandes couleurs de la musique tonale, et les deux grandes ponctuations des phrases.',
    goals: ['Distinguer un accord majeur d’un accord mineur.', 'Distinguer une fin (cadence parfaite) d’une suspension (demi-cadence).', 'Entendre le passage de fa mineur à fa majeur dans la coda.'],
    essentials: [
      'Majeur ou mineur : <b>une seule note</b> décide, la tierce (4 demi-tons, clair ; 3 demi-tons, plus sombre).',
      'Une phrase finit sur la tonique (<b>cadence parfaite</b>, un point) ou s’arrête sur la dominante (<b>demi-cadence</b>, une virgule).',
      'Réagis d’abord à la couleur, puis vérifie en chantant l’arpège ou la tonique.',
    ],
    goal: '80 % ou plus aux séries « Majeur ou mineur ? » et « Fin ou suspension ? ».',
    body: W => `
<h2>Majeur et mineur</h2>
<p>La différence tient à une seule note : la <b>tierce</b>. Majeure (4 demi-tons au-dessus de la fondamentale), elle donne un accord clair ; mineure (3 demi-tons), un accord plus sombre et plus doux. Chante l’arpège 1-3-5 de chaque accord entendu : c’est la note du milieu qui décide.</p>
${W.kbd({ from: 60, to: 72, title: 'Do majeur, puis do mineur', marks: [{ m: 60 }, { m: 64, label: 'mi', color: '#cfe6d7' }, { m: 63, label: 'mi♭', color: '#f2d9a8' }, { m: 67 }], names: 'none', play: 'seq', seq: [60, 64, 67, 60, 63, 67], step: 0.4, caption: 'Seule la tierce change : mi (majeur) ou mi♭ (mineur).' })}

<h2>Fin ou suspension</h2>
<p>Une phrase peut se terminer sur la tonique (<b>cadence parfaite</b> : un point final) ou s’arrêter sur la dominante (<b>demi-cadence</b> : une virgule, une question). Concentre-toi sur la dernière impression : repos complet, ou envie d’entendre la suite ?</p>

${ROUTINE([
  'Trois minutes : série « Majeur ou mineur ? ».',
  'Quatre minutes : série « Fin ou suspension ? ».',
  'Trois minutes : écoute la coda de ta pièce et le passage en fa majeur (mesure 89).',
])}
${W.quiz({ kind: 'chords', set: ['M', 'm'], title: 'Majeur ou mineur ?', count: 12, stat: 'ch-mm' })}
${W.tip('La couleur', '<p>N’analyse pas : réagis. Si l’accord te paraît ouvert et lumineux, majeur ; plus voilé, plus intérieur, mineur. Puis vérifie en chantant l’arpège.</p>')}
${W.quiz({ kind: 'cadences', set: ['parfaite', 'demi'], labels: { parfaite: 'Fin (parfaite)', demi: 'Suspension (demi-cadence)' }, title: 'Fin ou suspension ?', count: 10, stat: 'cad-2' })}
${W.tip('Chante la tonique', '<p>Pendant l’écoute, chante intérieurement la tonique : si le dernier accord la contient et repose, c’est une fin ; s’il la laisse en l’air, c’est une suspension.</p>')}
${W.quiz({ kind: 'scales', set: ['maj', 'harmMin'], title: 'Gamme majeure ou mineure ?', count: 10, stat: 'sc-mm' })}

<h2>Dans ta pièce</h2>
<p>L’op. 55 est en fa mineur, mais la coda passe en <b>fa majeur</b> à partir de la mesure 89 : la♭ devient la♮. Écoute la différence : la même tonique, une lumière nouvelle. C’est ce qu’on appelle la <b>tierce picarde</b> quand une pièce mineure finit en majeur.</p>
${W.score({ abc: OP55.e10, title: 'Mesures 97 à 101 : la fin en fa majeur', bpm: 56, startBpm: 46, practice: false })}

${W.key('Bilan du niveau 1', '<p>Tu sais maintenant distinguer les hauteurs, chanter juste dans ta voix, retaper un rythme, sentir la tonique et situer les degrés de la gamme majeure. Au niveau 2, tu appliqueras ces degrés au mode mineur, puis aux intervalles, aux accords et aux enchaînements, jusqu’à de vraies dictées.</p>')}
`,
  },
];
