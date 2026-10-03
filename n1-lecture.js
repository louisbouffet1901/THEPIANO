// Niveau 1 — Lecture à vue

const LANDMARKS = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^do3"C "^sol3"G "^do4"c "^do5"c' |]
[V:LH] "_do3"C "_fa2"F, "_do2"C, "_do1"C,, |]`;

const RHYTHMS = `X:1
M:4/4
L:1/8
K:C
"^noires"c2 c2 c2 c2 | "^croches"cc cc cc cc | "^croche pointée – double"c3/2c/ c3/2c/ c2 c2 |
"^triolets"(3ccc (3ccc c2 c2 | "^syncope"c c2 c c4 | "^blanche pointée"c6 c2 |]`;

export default [
  {
    id: 'n1-l1', minutes: 15,
    title: 'Méthode : avant, pendant, après',
    summary: 'La lecture à vue est une compétence à part : elle se travaille un peu chaque jour, avec des textes nouveaux.',
    goals: ['Préparer une lecture en trente secondes.', 'Jouer sans s’arrêter, en gardant la pulsation.', 'Tirer parti de chaque essai.'],
    body: W => `
<p>On ne progresse pas en lecture à vue en rejouant des pièces connues : il faut lire du <b>neuf</b>, un peu plus facile que ton répertoire, <b>chaque jour</b>, dix minutes. C’est exactement ce que fait l’outil de lecture : un extrait nouveau à chaque fois, à ton niveau.</p>

<h2>Avant de jouer (30 secondes)</h2>
<ol>
<li><b>Armure</b> : quelle tonalité ? Majeur ou relatif mineur (regarde la dernière note de la basse et les altérations accidentelles : un sol♯ dans une pièce sans armure signale la mineur).</li>
<li><b>Mesure</b> et plus petite valeur : choisis un tempo où les notes les plus rapides restent possibles.</li>
<li><b>Structure</b> : des mesures qui se répètent ? Un motif qui revient ? Des marches ?</li>
<li><b>Difficultés</b> : sauts, altérations, changements de position. Repère-les.</li>
<li><b>Position des mains</b> : première note de chaque main, doigté de départ.</li>
<li><b>Entends</b> intérieurement le début et le rythme.</li>
</ol>

<h2>Pendant</h2>
<ul>
<li><b>Ne t’arrête jamais.</b> Une fausse note passe ; un arrêt casse tout. Si tu es perdu, retombe sur le temps suivant.</li>
<li><b>Garde la pulsation</b>, au besoin en comptant à mi-voix.</li>
<li><b>Regarde devant</b> : les yeux lisent la mesure suivante pendant que les mains jouent celle-ci.</li>
<li><b>Ne regarde pas tes mains</b> : sens les groupes de deux et trois touches noires sous tes doigts.</li>
<li><b>Simplifie</b> si c’est trop dense : garde la basse et la mélodie, laisse tomber les notes intérieures.</li>
</ul>

<h2>Après</h2>
<p>Rejoue une seule fois, puis demande-toi ce qui a coincé : la lecture des notes, le rythme, l’anticipation ? L’outil garde la trace de tes derniers essais en rythme.</p>

${W.tip('Les deux modes de l’outil', '<p><b>Mode attente</b> : le curseur attend la bonne note. Utile pour une nouvelle tonalité ou une nouvelle clé, mais ce n’est pas encore de la lecture à vue. <b>En rythme</b> (ou « Préparer 30 s puis jouer ») : décompte, métronome, et on ne s’arrête pas. C’est l’entraînement réel.</p>')}
${W.sight({ preset: 'n1-md', presets: ['n1-md', 'n1-mg'] })}
${W.links([W.informance('/content/pages/198-music-at-sight', 'Music at Sight'), W.informance('/content/pages/136-advanced-sight-reading-curriculum', 'Advanced Sight-Reading Curriculum')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-l2', minutes: 20,
    title: 'Repères et lecture par intervalles',
    summary: 'Quelques notes repères, puis lire la distance plutôt que le nom de chaque note.',
    goals: ['Connaître les notes repères des deux clés.', 'Lire par intervalles à partir d’un repère.', 'Trouver une note au clavier sans hésiter.'],
    body: W => `
<p>Lire note après note (« si… do… ré… ») est trop lent. Les bons lecteurs s’appuient sur quelques <b>repères</b> fixes, puis lisent la <b>distance</b> d’une note à l’autre.</p>
${W.score({ abc: LANDMARKS, title: 'Les notes repères', bpm: 50, practice: false, caption: 'Notation française : le do central est do3. Clé de sol : le sol3 est sur la 2e ligne. Clé de fa : le fa2 est sur la 4e ligne.' })}
<ul>
<li><b>do3</b> (do central) : ligne supplémentaire entre les deux portées.</li>
<li><b>sol3</b> : 2e ligne de la clé de sol (la clé s’enroule autour) ; <b>do4</b> : 3e interligne.</li>
<li><b>fa2</b> : 4e ligne de la clé de fa (entre les deux points) ; <b>do2</b> : 2e interligne.</li>
<li><b>do5</b> et <b>do1</b> : deux lignes supplémentaires au-dessus de la clé de sol et au-dessous de la clé de fa.</li>
</ul>

<h2>Lire par intervalles</h2>
<p>D’un repère, une note voisine est une seconde (ligne → interligne), puis une tierce (ligne → ligne), etc. Dans une mélodie, on lit le <b>mouvement</b> : ça monte d’une seconde, saute d’une tierce, redescend… Le module de théorie détaille la lecture des intervalles sur la portée.</p>

${W.quiz({ kind: 'notes', clefs: ['treble'], title: 'Notes en clé de sol', count: 12, stat: 'notes-t' })}
${W.quiz({ kind: 'notes', clefs: ['bass'], title: 'Notes en clé de fa', count: 12, stat: 'notes-b' })}
${W.quiz({ kind: 'notes', mode: 'play', title: 'Trouver la note au piano (bonne octave)', count: 12, stat: 'notes-play' })}
${W.exo('Puis', '<p>Lecture à vue « niveau 1 · main gauche » en mode attente, puis en rythme. La clé de fa est souvent la plus faible : donne-lui autant de temps que la clé de sol.</p>')}
${W.sight({ preset: 'n1-mg', presets: ['n1-mg', 'n1-md'] })}
`,
  },

  {
    id: 'n1-l3', minutes: 15,
    title: 'Lire le rythme en pulsation',
    summary: 'Le rythme se lit par cellules, comme des mots, sur une pulsation qui ne s’arrête pas.',
    goals: ['Reconnaître les cellules rythmiques courantes.', 'Compter et subdiviser.', 'Garder la pulsation en lisant.'],
    body: W => `
<p>En lecture à vue, une note fausse dans le bon rythme passe presque inaperçue ; une note juste au mauvais moment s’entend tout de suite. Le rythme d’abord.</p>
<h2>Compter et subdiviser</h2>
<p>Compte à voix haute : « 1 et 2 et 3 et 4 et ». La subdivision (les « et ») place les croches et rend les rythmes pointés précis. Dans les passages lents, subdivise même en doubles croches.</p>
<h2>Les cellules</h2>
<p>On reconnaît un rythme comme on reconnaît un mot, d’un coup d’œil, sans épeler :</p>
${W.score({ abc: RHYTHMS, title: 'Cellules rythmiques', bpm: 72, startBpm: 60, hands: false, click: true, caption: 'Joue un do4 sur chaque note, en rythme (« En rythme »), le métronome marque la noire.' })}
<ul>
<li><b>Croche pointée – double</b> : la double est courte et appartient au temps suivant.</li>
<li><b>Triolet</b> : trois notes égales dans un temps ; pense « tri-o-let ».</li>
<li><b>Syncope</b> : une note attaquée sur une partie faible et tenue sur le temps fort ; le temps fort se sent sans être joué.</li>
</ul>
${W.exo('Exercice', '<p>Tape le rythme d’un extrait de lecture à vue sur le couvercle avant de le jouer. Puis joue-le en rythme, sans t’arrêter.</p>')}
${W.sight({ preset: 'n1-md', presets: ['n1-md', 'n1-mg', 'n1-2m'] })}
`,
  },

  {
    id: 'n1-l4', minutes: 20,
    title: 'Lire à deux mains',
    summary: 'Lire en accords et en formules, et savoir quoi sacrifier quand c’est trop dense.',
    goals: ['Lire verticalement ce qui sonne ensemble.', 'Reconnaître les formules de main gauche.', 'Garder la continuité à deux mains.'],
    body: W => `
<h2>Lire verticalement</h2>
<p>À deux mains, on lit d’abord <b>ce qui sonne ensemble</b> (une colonne), puis on avance de colonne en colonne. Les accords se lisent par leur forme : trois notes sur trois lignes (ou trois interlignes) consécutives forment un accord à l’état fondamental ; une forme « une ligne, un interligne, une ligne » signale un renversement.</p>
<h2>Reconnaître les formules</h2>
<p>La main gauche répète souvent une <b>formule</b> : notes tenues, basse et accord (comme dans le nocturne ou la valse), basse d’Alberti (do-sol-mi-sol). Une fois la formule reconnue, la main gauche suit presque seule et les yeux restent sur la main droite.</p>
<h2>Les priorités</h2>
<ol>
<li>La pulsation, toujours.</li>
<li>La basse (elle porte l’harmonie) et la mélodie (elle porte le sens).</li>
<li>Le reste, si possible.</li>
</ol>
${W.tip('Regard en avant', '<p>Coche « Regard en avant » dans l’outil : la mesure que tu joues s’efface, ce qui t’oblige à lire la suivante pendant que tu joues. Déroutant au début, très efficace.</p>')}
${W.sight({ preset: 'n1-2m', presets: ['n1-2m', 'n1-acc'] })}
`,
  },
];
