// Niveau 1 — Oreille : repartir de zéro. Chanter d'abord, puis reconnaître ; les degrés avant les noms.
// Inspiré des méthodes Kodály et Willems (chanter avant de nommer) et de l'entraînement « fonctionnel »
// (Functional Ear Trainer, Improvise for Real : chaque note entendue par rapport à la tonique).
import { OP55 } from './content-excerpts.js';

const ROUTINE = (items) => `<div class="callout exo"><div class="c-title">Ta routine de la semaine (10 minutes par jour)</div><ol>${items.map(i => `<li>${i}</li>`).join('')}</ol></div>`;

export default [
  {
    id: 'n1-or1', minutes: 10,
    title: 'Grave ou aigu, monter ou descendre',
    summary: 'Le point de départ de toute oreille musicale : comparer deux hauteurs, puis suivre le dessin d’une mélodie.',
    goals: ['Dire si une note est plus aiguë ou plus grave qu’une autre, même proche.', 'Reconnaître le dessin d’une courte mélodie.', 'Prendre l’habitude d’un entraînement court et quotidien.'],
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
${W.quiz({ kind: 'highlow', minSt: 1, maxSt: 12, title: 'Plus grave ou plus aigu ?', count: 12, stat: 'hl', intro: 'Douze questions. L’écart diminue quand tu réponds juste ; vise un écart d’un ou deux demi-tons d’ici la fin de la semaine.' })}
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
    goals: ['Connaître ta tessiture confortable.', 'Reproduire une note entendue, à l’octave qui te convient.', 'Utiliser le micro pour vérifier ta justesse.'],
    body: W => `
<p>Toutes les grandes méthodes d’éducation de l’oreille (Kodály, Willems…) commencent par le chant : une note que tu peux chanter juste, tu finiras par la reconnaître. Il ne s’agit pas de devenir chanteur, mais de faire de ta voix un instrument de vérification. Personne ne t’entend : ose.</p>

<h2>Ta tessiture</h2>
<ol>
<li>Joue do3 (le do central) et chante-le sur « la ».</li>
<li>Descends note par note (si2, la2…) jusqu’à ce que ce soit inconfortable ; puis remonte au-dessus de do3 jusqu’à la limite confortable.</li>
<li>Ta zone confortable, c’est là où tu travailleras. Une voix d’homme est souvent à l’aise entre la1 et mi3, une voix de femme entre la2 et mi4.</li>
</ol>
<p>Dans les exercices, choisis « Voix grave » ou « Voix aiguë » : l’appli joue les notes dans ta zone. Et si une note entendue est trop aiguë ou trop grave, chante-la à l’octave : seule la hauteur relative compte, le micro le sait.</p>

<h2>Comment chanter juste</h2>
<ul>
<li><b>Écouter d’abord</b> : laisse la note sonner, entends-la dans ta tête pendant une seconde de silence, puis chante.</li>
<li><b>Bouche fermée</b> : commence par « mmm » ; c’est plus facile de trouver la hauteur, puis ouvre sur « la ».</li>
<li><b>Glisser</b> : si tu es trop bas ou trop haut, ne t’arrête pas ; glisse lentement, comme une sirène, jusqu’à la note.</li>
<li><b>Tenir sans pousser</b> : un son tenu calmement, avec de l’air, est plus juste qu’un son forcé.</li>
</ul>

<h2>Le micro</h2>
<p>Dans les exercices de chant, la tablette écoute ta voix et affiche une aiguille : <b>au centre, c’est juste</b> ; à gauche, trop bas ; à droite, trop haut. La note est validée quand tu la tiens juste un peu moins d’une demi-seconde. Place la tablette à 30–50 cm, dans une pièce calme. Sans micro, tu peux répondre au piano (« je joue la note que je chanterais ») ou t’évaluer toi-même après avoir entendu la réponse.</p>

${ROUTINE([
  'Deux minutes d’échauffement : sirènes (glissés du grave à l’aigu et retour) bouche fermée, puis sur « ou ».',
  'Cinq minutes : série « Chanter une note entendue ».',
  'Trois minutes : joue la mélodie des mesures 1 et 2 du nocturne (do – fa – mi♭ – ré♭ – do) et chante-la en même temps, puis seul, puis vérifie au piano.',
])}
${W.quiz({ kind: 'sing', task: 'match', span: 5, title: 'Chanter une note entendue (zone resserrée)', count: 8, stat: 'sing-match-a', intro: 'Huit notes, dans le milieu de ta voix.' })}
${W.tip('Trop bas : le cas le plus fréquent', '<p>Au début, presque tout le monde chante un peu trop bas, par timidité. Pense « haut et léger », souris légèrement, et glisse vers le haut jusqu’à ce que l’aiguille se centre.</p>')}
${W.quiz({ kind: 'sing', task: 'match', title: 'Chanter une note entendue', count: 8, stat: 'sing-match' })}
${W.tip('Piano d’abord, puis voix', '<p>Si une note résiste : joue-la au piano et chante <b>en même temps</b> que le son, puis rejoue-la et chante seul. C’est l’ordre naturel de l’apprentissage.</p>')}

<h2>Dans ta pièce</h2>
<p>Chante la mélodie des mesures 1 à 4 en jouant la main gauche seule. Puis l’inverse : joue la mélodie et chante les basses (fa, sol, la♭, mi). Chanter une voix pendant que tu en joues une autre est l’un des meilleurs exercices d’écoute qui soient.</p>

${W.warn('« Je chante faux »', '<p>Chanter faux est presque toujours un manque d’habitude, pas un défaut d’oreille. Les causes habituelles : chanter dans une zone trop grave ou trop aiguë, ne pas prendre le temps d’écouter avant, ou chanter trop fort. Corrige ces trois points et l’aiguille se centrera.</p>')}
`,
  },

  {
    id: 'n1-or3', minutes: 10,
    title: 'La pulsation et le rythme',
    summary: 'Sentir le temps dans le corps, puis retenir et retaper un rythme entendu.',
    goals: ['Garder une pulsation stable.', 'Retaper un rythme d’une mesure entendu une fois.', 'Distinguer noires, blanches, croches à l’oreille.'],
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
${W.quiz({ kind: 'rhythm', cells: ['q', 'h', 'w', 'qr'], bpm: 72, title: 'Écho rythmique : noires, blanches, rondes', count: 8, stat: 'ry-1' })}
${W.tip('Compte pendant l’écoute', '<p>Compte « 1, 2, 3, 4 » à voix basse pendant que le rythme est joué : tu sauras sur quels temps tombent les notes, et tu n’auras plus qu’à les retaper.</p>')}
${W.quiz({ kind: 'rhythm', cells: ['q', 'h', 'ee', 'qr'], bpm: 72, title: 'Écho rythmique : avec des croches', count: 8, stat: 'ry-2' })}
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
