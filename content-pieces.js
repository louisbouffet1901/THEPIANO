// Pages des pièces : pièces phares et pièces complémentaires.
import { OP55, OP15, CLAIR } from './content-excerpts.js';
import { ytSearch } from './util.js';

const imslp = (path, title, note) => ({ title, url: 'https://imslp.org/wiki/' + path, note: note || 'IMSLP — partitions du domaine public', kind: 'score' });

export const PIECE_PAGES = {
  /* ================================================================ */
  'op55-1': {
    id: 'op55-1', title: 'Nocturne en fa mineur, op. 55 n° 1', composer: 'Frédéric Chopin', short: 'Andante · 4/4 · environ 5 minutes',
    tags: [{ label: 'Pièce phare du niveau 1', cls: 'gold' }, { label: 'Composé en 1842-1844' }, { label: 'Dédié à Jane Stirling' }],
    body: W => `
<p>Publié en 1844 avec son jumeau en mi♭ majeur, et dédié à son élève Jane Stirling, ce nocturne est l’un des plus dépouillés de Chopin : une mélodie simple, chantée trois fois, au-dessus d’une main gauche qui marche à pas réguliers. Sa difficulté n’est pas la vitesse, c’est le <b>chant</b> : tenir une ligne en notes longues, la faire dominer, la faire respirer.</p>

<h2>Plan de la pièce</h2>
${W.diagram('form', { total: 101, sections: [
  { label: 'A', kind: 'A', from: 1, to: 47, key: 'fa mineur', note: 'thème chanté trois fois' },
  { label: 'B', kind: 'B', from: 48, to: 72, key: 'modulant', note: 'Più mosso' },
  { label: 'A′', kind: 'A', from: 73, to: 76, key: '', note: '' },
  { label: 'Coda', kind: 'coda', from: 77, to: 101, key: 'fa mineur → fa majeur', note: 'triolets, choral' },
] }, 'Forme ternaire avec coda. Le retour du thème (A′) ne dure que quatre mesures : la coda prend le relais.')}
${W.diagram('form', { total: 48, sections: [
  { label: 'a', kind: 'A', from: 1, to: 8, key: 'fa mineur' }, { label: 'a', kind: 'A', from: 9, to: 16, key: '' },
  { label: 'b', kind: 'B', from: 17, to: 24, key: 'vers la♭, puis do' }, { label: 'a′', kind: 'A', from: 25, to: 32, note: 'triolets' },
  { label: 'b', kind: 'B', from: 33, to: 40 }, { label: 'a″', kind: 'A', from: 41, to: 48, note: 'septolet' },
] }, 'Détail de la section A (mesures 1 à 48) : le thème a alterne avec une phrase b qui monte par marches et s’immobilise sur une pédale de do (la dominante).')}

<h2>Les passages, un par un</h2>
<h3>Le thème (mesures 1 à 8)</h3>
<p>La mélodie tient sur quelques notes : do, puis une descente fa – mi♭ – ré♭ – do, puis do brodé par si♮ et ré♭. Tout l’art est dans la ligne : la levée part de rien, le fa est le sommet, la descente se détend. La main gauche, notée <i>staccato</i>, est légère ; la pédale relie chaque basse à son accord.</p>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4', bpm: 60, startBpm: 50, pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17, caption: 'Démonstration avec une pédale par demi-mesure. Travail : <a href="#/lecon/n1-t3">legato</a>, <a href="#/lecon/n1-t4">plans sonores</a>, <a href="#/lecon/n1-t5">pédale</a>.' })}
${W.score({ abc: OP55.e2, title: 'Mesures 5 à 8 : trille, accord arpégé, cadence', bpm: 60, startBpm: 50, caption: 'Mesure 6 : trille sur si♭ terminé par deux petites notes (la – si♭) ; mesure 7 : accord arpégé de bas en haut, la note du haut (la♭) arrive sur le temps et chante.' })}

<h3>La première fioriture (mesures 13-14)</h3>
<p>Au deuxième passage du thème, Chopin orne la cadence : trille sur si♭, puis cinq petites notes à jouer dans le quatrième temps. Elles ne doivent ni presser ni retarder la main gauche : la première tombe avec l’accord du 4e temps, les autres s’égrènent jusqu’à la mesure suivante.</p>
${W.score({ abc: OP55.e3, title: 'Mesures 13 et 14', bpm: 60, startBpm: 44 })}

<h3>La phrase b (mesures 17 à 24)</h3>
<p>Une phrase qui monte par marches (si♭ – do, puis ré – mi♮) avec des crescendos courts, avant de s’immobiliser sur une longue <b>pédale de dominante</b> (do à la basse, mesures 22 à 24) qui ramène le thème. Le ré♮ et le fa♯ annoncent qu’on quitte fa mineur : laisse-les colorer le son.</p>
${W.score({ abc: OP55.e4, title: 'Mesures 17 à 20', bpm: 60, startBpm: 46 })}

<h3>Les variations du thème (mesures 27-28 et 43-44)</h3>
<p>Aux retours, la mélodie s’orne de triolets, puis d’un septolet (sept croches dans deux temps). Pour ces groupes irréguliers, on aligne seulement le départ et l’arrivée sur la main gauche : entre les deux, les notes se répartissent librement, sans à-coups.</p>
${W.score({ abc: OP55.e5, title: 'Mesures 27 et 28 : triolets', bpm: 60, startBpm: 44 })}
${W.score({ abc: OP55.e5b, title: 'Mesures 43 et 44 : septolet', bpm: 60, startBpm: 40 })}
${W.diagram('meeting', { n: 7, beats: 2, lhPer: 1 }, 'Mesure 44 : sept croches de la main droite pour les deux premiers temps de la main gauche. Seul le premier temps est commun ; le deuxième temps de la main gauche tombe entre la 4e et la 5e note.')}

<h3>Le Più mosso (mesures 48 à 72)</h3>
<p>Changement de climat : un motif en triolets, joué en octaves par les deux mains dans le grave, auquel répondent des accords. C’est un dialogue, presque un récitatif. Les triolets se travaillent par temps (impulsion sur la première note de chaque groupe), poignet souple ; les accords se jouent avec le poids, sans frapper.</p>
${W.score({ abc: OP55.e6, title: 'Mesures 48 à 52', bpm: 72, startBpm: 56 })}
${W.score({ abc: OP55.e7, title: 'Mesures 57 à 60 : le chant revient, orné', bpm: 72, startBpm: 56, caption: 'À la main gauche, l’arpège mi – ré♭ – si♭ – sol forme un accord de septième diminuée qui se résout sur fa mineur.' })}

<h3>Les traits et le point d’orgue (mesures 69 à 72)</h3>
<p>Deux mesures de doubles croches qui descendent sur trois octaves, mêlant chromatisme et degrés conjoints. Travaille-les par temps (quatre notes), en rythmes, puis en groupes avec arrêt sur chaque premier temps. Elles débouchent sur un bref choral (mesures 71-72, <i>stretto</i> puis <i>ritenuto</i>) qui s’arrête sur un point d’orgue, sur la dominante.</p>
${W.score({ abc: OP55.e8, title: 'Mesures 69 et 70', bpm: 72, startBpm: 40 })}

<h3>La coda (mesures 77 à 101)</h3>
<p>Molto legato : des triolets de croches tracent de grands arcs au-dessus d’une main gauche qui reprend son pas. À partir de la mesure 89, tout bascule en <b>fa majeur</b> ; les arpèges montent vers l’aigu en accélérant légèrement, puis le choral final pose l’accord de fa majeur, arpégé, avec un point d’orgue.</p>
${W.score({ abc: OP55.e9, title: 'Mesures 77 à 80', bpm: 60, startBpm: 44, caption: 'Chopin écrit ici des doubles bémols (si𝄫, la𝄫) : ils sonnent comme la et sol.' })}
${W.score({ abc: OP55.e10, title: 'Mesures 97 à 101 : le choral final', bpm: 60, startBpm: 50 })}

<h2>Plan de travail sur huit semaines</h2>
<ol>
<li>Mesures 1 à 8, mains séparées ; écoute de deux versions.</li>
<li>Mesures 1 à 16 mains ensemble ; phrase b mains séparées.</li>
<li>Mesures 17 à 48 ; triolets et septolet à part.</li>
<li>Più mosso, mesures 48 à 64.</li>
<li>Mesures 65 à 76 ; enchaîner A et Più mosso.</li>
<li>Coda.</li>
<li>Toute la pièce, tempo progressif de ♩ = 50 à ♩ = 60.</li>
<li>Interprétation, enregistrements, <a href="#/validation/n1">grille de validation</a>.</li>
</ol>
<p>Le détail, semaine par semaine, avec les autres modules : <a href="#/plan/n1">plan hebdomadaire</a>.</p>

<h2>Écouter</h2>
<p>Écoute au moins deux versions avant de commencer, puis d’autres une fois la pièce en place. Compare le tempo du thème, la façon de traiter la main gauche, la liberté dans la phrase b, la vitesse de la coda. Guide d’écoute détaillé : <a href="#/lecon/n1-i5">Écouter les grands interprètes</a>.</p>
${W.listen([
  W.yt('Chopin Nocturne op 55 no 1 Rubinstein', 'Arthur Rubinstein', 'Intégrale des nocturnes, RCA, 1965'),
  W.yt('Chopin Nocturne op 55 no 1 Pires', 'Maria João Pires', 'Intégrale des nocturnes, DG, 1996'),
  W.yt('Chopin Nocturne op 55 no 1 Pollini', 'Maurizio Pollini', 'Intégrale des nocturnes, DG, 2005'),
  W.yt('Chopin Nocturne op 55 no 1 Moravec', 'Ivan Moravec'),
  W.yt('Chopin Nocturne op 55 no 1 Samson François', 'Samson François'),
])}

<h2>Partition</h2>
${W.links([imslp('Nocturnes,_Op.55_(Chopin,_Fr%C3%A9d%C3%A9ric)', 'Nocturnes op. 55 sur IMSLP', 'Éditions Breitkopf, Mikuli, Paderewski, Cortot (annotée en français)…')])}
`,
  },

  /* ================================================================ */
  'valse-b150': {
    id: 'valse-b150', title: 'Valse en la mineur, B. 150', composer: 'Frédéric Chopin', short: 'Allegretto · 3/4', status: '(en cours)',
    tags: [{ label: 'Complément du niveau 1' }, { label: 'Publication posthume' }],
    body: W => `
<p>Une des valses les plus courtes et les plus simples de Chopin, publiée après sa mort. Sa date de composition est discutée (les estimations vont des années 1830 à la fin des années 1840). La forme est un petit <b>rondo</b> : le thème en la mineur revient entre deux épisodes, dont un en la majeur, plus lumineux.</p>
${W.diagram('form', { total: 5, sections: [
  { label: 'A', kind: 'A', from: 1, to: 1, key: 'la mineur' }, { label: 'B', kind: 'B', from: 2, to: 2, key: 'la majeur' },
  { label: 'A′', kind: 'A', from: 3, to: 3 }, { label: 'C', kind: 'C', from: 4, to: 4 }, { label: 'A″', kind: 'A', from: 5, to: 5 },
] }, 'Schéma de la forme (proportions non respectées) : A – B – A′ – C – A″.')}

<h2>Points de travail</h2>
<ul>
<li><b>La main gauche de valse</b> : basse au 1er temps, plus profonde ; accords des 2e et 3e temps légers et courts. Pédale prise sur la basse, relevée au 2e ou au 3e temps selon l’harmonie. C’est la même idée que la basse et l’accord du nocturne, en trois temps.</li>
<li><b>Le chant</b> : la mélodie de la main droite est legato, avec ses appuis sur les notes longues ; les groupes de croches qui montent (avec les doigtés 1 2 1 5 dans la plupart des éditions) se jouent d’un seul geste, comme une respiration.</li>
<li><b>Les ornements</b> : les petites notes et le trille de la fin se placent souplement sur le temps, sans retarder la basse.</li>
<li><b>La section en la majeur</b> : changement de couleur, plus de son (forte), mais toujours dansant. Le trait orné de la deuxième phrase se travaille à part, en rythmes.</li>
</ul>
${W.tip('Le caractère', '<p>Une valse de salon, mélancolique, pas une valse viennoise de bal : le 1er temps est appuyé mais jamais lourd, et le rubato reste dans la mélodie. Sur l’analyseur « Équilibre », la main droite doit dominer comme dans le nocturne.</p>')}
${W.improv({ preset: 'n1-valse', presets: ['n1-valse'], title: 'Te mettre dans le rythme de la valse' })}
${W.listen([
  W.yt('Chopin Waltz A minor B 150', 'Plusieurs versions à comparer', 'Recherche YouTube'),
])}
${W.links([imslp('Waltz_in_A_minor,_B.150_(Chopin,_Fr%C3%A9d%C3%A9ric)', 'Valse en la mineur B. 150 sur IMSLP')])}
`,
  },

  /* ================================================================ */
  'prokofiev-75-6': {
    id: 'prokofiev-75-6', title: 'Montaigus et Capulets, op. 75 n° 6', composer: 'Sergueï Prokofiev', short: 'extrait des Dix pièces de Roméo et Juliette (1937)', status: '(en cours)',
    tags: [{ label: 'Complément du niveau 1' }],
    body: W => `
<p>Prokofiev a lui-même transcrit pour le piano dix numéros de son ballet <i>Roméo et Juliette</i> (op. 75, 1937). « Montaigus et Capulets » est la célèbre danse des chevaliers : une marche lourde en rythme pointé, avec une partie centrale plus douce. Elle sert de contrepoint au nocturne : <b>poids, rythme, articulation sèche</b>, là où Chopin demande legato et chant.</p>

<h2>Points de travail</h2>
<ul>
<li><b>Le rythme pointé</b> : la double croche est très courte et appartient à la note qui suit ; pense « ta-<b>DAM</b> ». Travaille-le d’abord au métronome lent, en exagérant l’écart, puis garde cette netteté au tempo.</li>
<li><b>Les accords lourds</b> : le son vient du poids du bras et du dos, jamais d’une frappe des doigts. Laisse tomber le bras, doigts fermes, poignet souple, puis relâche immédiatement.</li>
<li><b>L’articulation</b> : staccatos courts, accents marqués ; la pédale, s’il y en a, est très brève (juste sur les basses).</li>
<li><b>La partie centrale</b> : changement complet de toucher, legato, nuance douce, pédale plus présente. Le contraste fait la pièce.</li>
<li><b>La régularité</b> : une marche ne ralentit pas. Mesure-toi avec l’analyseur de régularité en jouant le motif pointé avec le métronome.</li>
</ul>
${W.warn('Droits', '<p>L’œuvre est entrée dans le domaine public en France, mais par prudence l’appli n’en reproduit pas d’extraits : travaille sur ta partition.</p>')}
${W.analyzer({ mode: 'evenness', title: 'Analyseur — régularité de la marche', help: 'Active le métronome (noire), joue quelques mesures de la marche : l’analyse indique si tu presses ou si tu traînes par rapport au clic.', bpm: 88, sub: 1, withMetronome: true })}
${W.listen([
  W.yt('Prokofiev Romeo and Juliet op 75 Montagues and Capulets piano', 'Versions pour piano à comparer', 'Recherche YouTube'),
])}
`,
  },

  /* ================================================================ */
  'liszt-s169': {
    id: 'liszt-s169', title: 'Romance en mi mineur, S. 169', composer: 'Franz Liszt', short: 'Malinconico espressivo · 3/4 · 1848',
    tags: [{ label: 'Complément du niveau 1' }],
    body: W => `
<p>Liszt écrit cette romance en 1848, d’après sa propre mélodie « Ô pourquoi donc » ; il la reprendra plus de trente ans plus tard sous le titre <i>Romance oubliée</i> (S. 527). C’est une mélodie chantée au-dessus de grands arpèges de la main gauche, proche par l’écriture du Nocturne en mi mineur op. posth. 72 de Chopin : une excellente suite à l’op. 55, avec une main gauche plus mobile.</p>

<h2>Comment la travailler</h2>
<ul>
<li><b>Les arpèges de la main gauche</b> couvrent plus d’une octave : la main se déplace latéralement, le coude guide, le pouce passe sans à-coup. Joue-les d’abord en accords bloqués (toutes les notes d’un arpège ensemble) pour connaître la géographie, puis arpégés, en écoutant la basse qui doit durer sous la pédale.</li>
<li><b>La mélodie</b> (<i>malinconico espressivo</i>) demande le même chant que le nocturne : notes longues tenues, légère décroissance, la note suivante qui repart du niveau atteint.</li>
<li><b>La deuxième page</b> (<i>accentato assai e sempre rubato</i>) fait chanter le thème avec plus d’intensité ; le rubato est demandé explicitement — la main gauche garde la pulsation.</li>
<li><b>La partie en triolets</b> et le <i>più agitato</i> : la main gauche passe aux triolets, le thème s’épaissit en accords et en octaves. Travaille les sauts de la main gauche lentement, en regardant le clavier.</li>
<li><b>La fin</b> s’éteint <i>pp</i>, avec des <i>ritenuto</i> successifs : ralentis progressivement, sans arrêter le mouvement.</li>
</ul>
${W.tip('Lien avec le module d’improvisation', '<p>L’accompagnement en arpèges élargis est exactement celui de l’accompagnateur « arpèges élargis » : improviser dessus t’habituera à cette texture.</p>')}
${W.improv({ preset: 'n1-arpege', presets: ['n1-arpege'], title: 'Arpèges élargis' })}
${W.listen([
  W.yt('Liszt Romance S 169 Leslie Howard', 'Leslie Howard', 'Intégrale Liszt, Hyperion'),
  W.yt('Liszt Romance in E minor S169', 'Autres versions', 'Recherche YouTube'),
])}
${W.links([imslp('Romance,_S.169_(Liszt,_Franz)', 'Romance S. 169 sur IMSLP')])}
`,
  },

  /* ================================================================ */
  /* ================================================================ */
  'op15-1': {
    id: 'op15-1', title: 'Nocturne en fa majeur, op. 15 n° 1', composer: 'Frédéric Chopin', short: 'Andante cantabile · 3/4 · environ 4 minutes',
    tags: [{ label: 'Pièce phare du niveau 2', cls: 'gold' }, { label: 'Publié en 1833-1834' }, { label: 'Dédié à Ferdinand Hiller' }],
    body: W => `
<p>Le premier des trois nocturnes de l’op. 15, dédiés au pianiste et compositeur Ferdinand Hiller, ami de Chopin à Paris. Une pièce construite sur un contraste violent : un <b>Andante cantabile</b> en fa majeur, marqué <i>semplice e tranquillo</i>, encadre une partie centrale <b>Con fuoco</b> en fa mineur, sombre et tourmentée. Le défi du niveau 2 est là : deux mondes, deux techniques, deux sonorités, et des transitions qui les relient.</p>

<h2>Plan de la pièce</h2>
${W.diagram('form', { total: 74, sections: [
  { label: 'A', kind: 'A', from: 1, to: 24, key: 'fa majeur', note: 'Andante cantabile' },
  { label: 'B', kind: 'B', from: 25, to: 48, key: 'fa mineur', note: 'Con fuoco' },
  { label: 'A′', kind: 'A', from: 49, to: 74, key: 'fa majeur', note: 'a Tempo primo, orné' },
] }, 'Forme ternaire simple. Les mesures 36 et 48 passent à 6/8 : leurs six croches se regroupent en deux temps, et la fin des phrases du Con fuoco s’élargit.')}

<h2>Les passages, un par un</h2>
<h3>L’Andante : une main gauche à trois voix (mesures 1 à 8)</h3>
<p>La mélodie, d’une grande simplicité, flotte au-dessus d’une main gauche écrite à trois voix : une <b>basse</b> tenue (fa pendant trois mesures, puis une descente pas à pas, fa – mi – ré – ré♭ – do – si – la, à partir de la mesure 4), des <b>notes en noires</b> au-dessus, et des <b>triolets</b> intérieurs qui murmurent. Chopin écrit <i>sempre legato</i> : les trois voix doivent rester liées et transparentes.</p>
${W.score({ abc: OP15.e1, title: 'Mesures 1 à 8', bpm: 69, startBpm: 52, caption: 'Travail : <a href="#/lecon/n2-t3">la polyphonie de la main gauche</a>. Écoute la main gauche seule (MG).' })}

<h3>La fin de l’Andante (mesures 17 à 24)</h3>
<p>Une harmonie plus chromatique (mi♭ à la basse, mesures 17-18), une fioriture de huit notes à la mesure 20 (<i>dolcissimo</i>), puis le retour du début du thème qui s’arrête, suspendu, sur un point d’orgue.</p>
${W.score({ abc: OP15.e2, title: 'Mesures 17 à 24', bpm: 69, startBpm: 50 })}

<h3>Le Con fuoco (mesures 25 à 28)</h3>
<p>La main droite joue des doubles notes alternées en sextolets de doubles croches : c’est le terrain de la <b>rotation de l’avant-bras</b>. La main gauche alterne traits descendants rapides et arpèges ascendants terminés par une note accentuée.</p>
${W.score({ abc: OP15.e3, title: 'Mesures 25 à 28', bpm: 84, startBpm: 40, caption: 'Travail : <a href="#/lecon/n2-t2">la rotation</a> et <a href="#/lecon/n2-t1">la méthode pour les passages rapides</a>.' })}

<h3>La mélodie de la main gauche (mesures 29 à 32)</h3>
<p>Sous l’agitation de la main droite, la mélodie passe à la main gauche, dans le registre du violoncelle, au-dessus d’une longue pédale de ré♭. Elle doit dominer : la main droite, pourtant pleine de notes, reste au second plan. Puis la mélodie remonte à la main droite (mesures 31-32).</p>
${W.score({ abc: OP15.e4, title: 'Mesures 29 à 32', bpm: 84, startBpm: 40 })}

<h3>La reprise ornée (mesures 49 à 74)</h3>
<p>Le thème revient (<i>a Tempo primo</i>), cette fois orné : septolet à la mesure 54, petites notes à la mesure 56. La pièce s’achève sur deux accords arpégés : do 7 au-dessus d’une pédale de fa, puis fa majeur.</p>
${W.score({ abc: OP15.e5, title: 'Mesures 53 à 55', bpm: 69, startBpm: 46, caption: 'Le septolet (sept doubles croches dans le temps de quatre) se joue souplement, comme une vocalise. Voir <a href="#/lecon/n2-i3">les ornements chopiniens</a>.' })}

<h2>Plan de travail sur huit semaines</h2>
<ol>
<li>Écoute ; mesures 1 à 8, main gauche seule (basse, voix en noires, triolets).</li>
<li>Mesures 1 à 24 mains ensemble ; fioriture de la mesure 20.</li>
<li>Con fuoco, mesures 25 à 28 : main droite (rotation), main gauche (traits).</li>
<li>Mesures 29 à 48 (mélodie à la main gauche, mesures à 6/8).</li>
<li>Section B entière à tempo réduit ; reprise mesures 49 à 74.</li>
<li>Enchaînement complet ; les transitions m. 24-25 et 48-49.</li>
<li>Tempo final, analyse, interprétation.</li>
<li>Enregistrements et <a href="#/validation/n2">grille de validation</a>.</li>
</ol>

<h2>Écouter</h2>
<p>Compare surtout le rapport de tempo entre l’Andante et le Con fuoco, et la manière de gérer les deux transitions.</p>
${W.listen([
  W.yt('Chopin Nocturne op 15 no 1 Rubinstein', 'Arthur Rubinstein', 'Intégrale des nocturnes, RCA, 1965'),
  W.yt('Chopin Nocturne op 15 no 1 Pires', 'Maria João Pires', 'Intégrale des nocturnes, DG, 1996'),
  W.yt('Chopin Nocturne op 15 no 1 Pollini', 'Maurizio Pollini', 'Intégrale des nocturnes, DG, 2005'),
  W.yt('Chopin Nocturne op 15 no 1 Moravec', 'Ivan Moravec'),
])}
<h2>Partition</h2>
${W.links([imslp('Nocturnes,_Op.15_(Chopin,_Fr%C3%A9d%C3%A9ric)', 'Nocturnes op. 15 sur IMSLP', 'Éditions Breitkopf, Mikuli, Paderewski, Cortot…')])}
`,
  },

  /* ================================================================ */
  'clair-de-lune': {
    id: 'clair-de-lune', title: 'Clair de lune (Suite bergamasque)', composer: 'Claude Debussy', short: 'Andante très expressif · 9/8 · environ 5 minutes',
    tags: [{ label: 'Complément du niveau 2' }, { label: 'Composé vers 1890, publié en 1905' }],
    body: W => `
<p>Troisième pièce de la <i>Suite bergamasque</i>, esquissée vers 1890 et publiée en 1905. Le titre renvoie au poème de Verlaine (<i>Fêtes galantes</i>). Après Chopin, c’est une autre manière de faire sonner le piano : moins de chant soliste, plus de <b>couleur</b>, de <b>résonance</b> et de nuances extrêmes (de <i>pp</i> à <i>ppp</i>).</p>

<h2>Plan de la pièce</h2>
${W.diagram('form', { total: 72, sections: [
  { label: 'A', kind: 'A', from: 1, to: 14, key: 'ré♭ majeur', note: 'pp, con sordina' },
  { label: 'a2', kind: 'A', from: 15, to: 26, key: '', note: 'Tempo rubato, cresc.' },
  { label: 'B', kind: 'B', from: 27, to: 42, key: '→ do♯ mineur', note: 'Un poco mosso, En animant' },
  { label: 'C', kind: 'C', from: 43, to: 50, key: 'ré♭', note: 'Calmato' },
  { label: 'A′', kind: 'A', from: 51, to: 65, key: 'ré♭', note: 'a Tempo I, ppp' },
  { label: 'Coda', kind: 'coda', from: 66, to: 72, note: 'morendo' },
] }, 'Repères (mesures) : Tempo rubato 15, peu à peu cresc. et animé 19, Un poco mosso 27, En animant 37, Calmato 43, a Tempo I 51, morendo jusqu’à la fin 66.')}

<h2>Les passages, un par un</h2>
<h3>Le début (mesures 1 à 4)</h3>
<p>Les deux mains jouent en clé de sol, <i>pp</i> et <i>con sordina</i> (avec la pédale douce). La mesure à 9/8 est troublée par des <b>duolets</b> (deux notes dans le temps de trois croches) : la musique semble flotter au-dessus de la barre de mesure. La voix supérieure des tierces porte la mélodie.</p>
${W.score({ abc: CLAIR.e1, title: 'Mesures 1 à 4', bpm: 40, startBpm: 36, caption: 'Debussy n’indique pas de métronome ; le curseur de tempo est en noire pointée (♩. ≈ 40 au début est un bon point de départ). Écoute la main droite seule pour entendre la ligne supérieure.' })}

<h3>Tempo rubato (mesures 15 à 18)</h3>
<p>Des accords parallèles aux deux mains, au-dessus d’une basse profonde tenue par la pédale. Chaque accord est marqué d’un tiret (<i>tenuto</i>) : appuyé, lié, sans dureté. La voix du haut chante, les autres notes la colorent.</p>
${W.score({ abc: CLAIR.e2, title: 'Mesures 15 à 18', bpm: 40, startBpm: 34 })}

<h3>Un poco mosso et En animant (mesures 27 à 42)</h3>
<p>La main gauche (relayée par la droite) déroule des arpèges de doubles croches sur plusieurs octaves, sous une mélodie en accords. Tout est dans la fluidité de l’arpège : poignet souple, pouce qui passe sans bruit, pédale qui enveloppe sans brouiller (changements à chaque harmonie, parfois des demi-changements). L’<i>En animant</i> passe en do♯ mineur et culmine (<i>più cresc.</i>) avant de se calmer.</p>

<h3>Le retour (mesures 51 à 72)</h3>
<p>Le thème revient à l’octave supérieure, <i>ppp</i>, porté par les arpèges de la main gauche, puis la coda s’éteint (<i>morendo jusqu’à la fin</i>).</p>

<h2>Points de travail</h2>
<ul>
<li><b>Le pianissimo</b> : toucher près de la touche, vitesse lente, bras léger ; la pédale douce change la couleur, elle ne remplace pas le contrôle (voir <a href="#/lecon/n2-t4">le pianissimo</a>).</li>
<li><b>Les duolets</b> : compte en croches (trois par temps) et place les duolets exactement au milieu ; puis oublie le comptage et laisse-les flotter.</li>
<li><b>La pédale</b> : plus longue que chez Chopin, elle crée une résonance ; écoute que les harmonies successives ne se brouillent pas.</li>
<li><b>Le rubato</b> : une respiration de toute la phrase, pas une main droite libre sur une main gauche stricte (voir <a href="#/lecon/n2-i5">Debussy : le son avant la note</a>).</li>
</ul>

<h2>Écouter</h2>
${W.listen([
  W.yt('Debussy Clair de lune Gieseking', 'Walter Gieseking', 'Intégrale Debussy, EMI'),
  W.yt('Debussy Clair de lune Samson François', 'Samson François'),
  W.yt('Debussy Clair de lune Pascal Rogé', 'Pascal Rogé'),
  W.yt('Debussy Clair de lune Arrau', 'Claudio Arrau'),
])}
<h2>Partition</h2>
${W.links([imslp('Suite_bergamasque_(Debussy,_Claude)', 'Suite bergamasque sur IMSLP', 'Édition originale Fromont (1905) et autres')])}
`,
  },
};
