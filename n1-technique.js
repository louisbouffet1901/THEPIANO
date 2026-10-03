// Niveau 1 — Technique
import { OP55 } from './content-excerpts.js';

const EX_FIVE = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] (!1!F2 !2!G2 !3!A2 !4!B2 | !5!c2 !4!B2 !3!A2 !2!G2 | !1!F8) | z8 | z8 | z8 |]
[V:LH] z8 | z8 | z8 | (!5!F,2 !4!G,2 !3!A,2 !2!B,2 | !1!C2 !2!B,2 !3!A,2 !4!G,2 | !5!F,8) |]`;

const EX_VOICING = `X:1
M:4/4
L:1/8
K:Fmin
"^i"[Acf]4 "^VII6"[GBe]4 | "^iv"[FBd]4 "^V6"[=EGc]4 | "^i"[Acf]8 |]`;

const EX_PEDAL = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^i"[FAc]4 "^iv"[FBd]4 | "^V7"[=EGB]4 "^i"[FAc]4 |]
[V:LH] F,,4 B,,4 | C,4 F,,4 |]`;

const EX_SCALE_FM = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] !1!F !2!G !3!A !4!B !1!c !2!d !3!=e !4!f | !3!=e !2!d !1!c !4!B !3!A !2!G !1!F2 |]
[V:LH] !5!F, !4!G, !3!A, !2!B, !1!C !3!D !2!=E !1!F | !2!=E !3!D !1!C !2!B, !3!A, !4!G, !5!F,2 |]`;

const EX_ARP = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] (3!1!C!2!E!3!G (3!1!c!2!e!3!g !5!c'4 | (3!3!g!2!e!1!c (3!3!G!2!E!1!C z4 |]
[V:LH] (3!5!C,!4!E,!2!G, (3!1!C!4!E!2!G !1!c4 | (3!2!G!4!E!1!C (3!2!G,!4!E,!5!C, z4 |]`;

export default [
  {
    id: 'n1-t1', minutes: 20,
    title: 'Méthode de travail : la boucle et les trois S',
    summary: 'Ce qui compte, ce n’est pas le temps passé, c’est ce qui change pendant la séance.',
    goals: ['Travailler par boucles courtes : imaginer, jouer, écouter, ajuster.', 'Appliquer les trois S : lentement, séparément, par sections.', 'Corriger une erreur pour de bon, au lieu de la répéter.'],
    body: W => `
<p>Une séance utile se mesure à une seule question : <b>qu’est-ce qui joue mieux à la fin qu’au début ?</b> Répéter une pièce du début à la fin en espérant qu’elle s’améliore, c’est surtout répéter ses fautes. Les pianistes qui progressent vite travaillent autrement : par petites unités, avec un objectif précis à chaque essai.</p>

<h2>La boucle de travail</h2>
${W.diagram('loop', {}, 'Chaque boucle dure quelques secondes. L’étape oubliée le plus souvent est la première : <b>entendre intérieurement</b> le résultat voulu avant de jouer.')}
<p>Avant de poser les mains, demande-toi ce que tu veux entendre : la note du haut plus présente, un legato sans trou, un crescendo vers le troisième temps. Joue, puis compare ce que tu as entendu à ce que tu voulais. Change <b>une seule chose</b> à la fois : si tu corriges le doigté, le rythme et la nuance en même temps, tu ne sauras pas ce qui a fonctionné.</p>

<h2>Les trois S</h2>
<h3>1. Lentement (<i>slowly</i>)</h3>
<p>Assez lent pour ne faire <b>aucune faute</b> et tout contrôler : la note, le doigt, le son, la nuance. Le bon tempo de travail est celui où tu pourrais parler en jouant. On accélère seulement quand le passage est juste trois fois de suite.</p>
<h3>2. Séparément (<i>separately</i>)</h3>
<p>Mains séparées, bien sûr, mais aussi <b>par couches</b> : la basse seule, la mélodie seule, le rythme seul en tapant sur le couvercle. Chaque couche doit être juste et musicale avant d’être superposée aux autres.</p>
<h3>3. Par sections (<i>sections</i>)</h3>
<p>Une ou deux mesures, pas plus. Chaque section se termine par un <b>pont</b> : on s’arrête sur la première note de la mesure suivante. C’est ce pont qui permettra ensuite d’enchaîner les sections sans couture.</p>
${W.diagram('chunks', { bars: 8, start: 1 }, 'Découpage des mesures 1 à 8 : sections de deux mesures avec pont, puis regroupements de plus en plus longs.')}

<h2>Corriger une erreur pour de bon</h2>
<ol>
<li><b>Localiser</b> : quelle note exactement, quel temps, quelle main ?</li>
<li><b>Comprendre</b> : faute de lecture, de doigté, de geste (un saut mal préparé), d’attention ?</li>
<li><b>Réparer lentement</b> : trois fois juste d’affilée, au ralenti. Si la faute revient, ralentis encore.</li>
<li><b>Replacer dans le contexte</b> : la mesure d’avant, la mesure d’après, puis la phrase.</li>
<li><b>Vérifier le lendemain.</b> La mémoire se consolide pendant le sommeil : c’est le lendemain qu’on sait si la correction a tenu.</li>
</ol>
${W.warn('Ne laisse jamais une faute se répéter', '<p>Chaque répétition grave le geste un peu plus, qu’il soit juste ou faux. Trois essais ratés de suite : arrête-toi, ralentis, réduis la section.</p>')}

<h2>Quatre outils à garder sous la main</h2>
<ul>
<li><b>Les arrêts</b> : joue jusqu’à la note difficile, arrête-toi, prépare le geste (main déjà en place), puis joue. On supprime ensuite l’arrêt peu à peu.</li>
<li><b>Le chaînage arrière</b> : apprends la dernière mesure en premier, puis ajoute celle d’avant, et ainsi de suite. La fin devient la partie la plus sûre, au lieu d’être la moins travaillée.</li>
<li><b>Les rythmes</b> : un trait en croches égales se travaille aussi en rythme pointé (long-court), puis inversé (court-long). Chaque note devient tour à tour une note d’arrivée.</li>
<li><b>Les groupes</b> : joue le trait par groupes de quatre notes rapides suivis d’un arrêt sur la note d’arrivée. Puis groupes de six, de huit… jusqu’au trait entier.</li>
</ul>

<h2>Organiser la séance</h2>
<p>Mets le travail le plus exigeant (la pièce phare) au moment où tu es le plus frais. Ne commence pas toujours au début : choisis chaque jour un point de départ différent, sinon le début est très sûr et la fin fragile. Et termine par quelque chose que tu aimes jouer.</p>

${W.exo('À faire maintenant : les mesures 1 à 4 du nocturne', `<ol>
<li>Écoute l’extrait une fois, puis main droite seule (bouton « MD »).</li>
<li>Main droite seule, très lentement, en <b>mode attente</b> : le curseur avance quand tu joues la bonne note. Puis sans aide.</li>
<li>Main gauche seule : basse au 1er et au 3e temps, accord léger au 2e et au 4e.</li>
<li>Mesure 1 avec pont sur le premier temps de la mesure 2, mains ensemble, à ♩ = 40.</li>
<li>Mesure 2 + pont, puis mesures 1-2, puis 3-4, puis 1-4.</li>
</ol>`)}
${W.score({ abc: OP55.e1, title: 'Nocturne op. 55 n° 1 — mesures 1 à 4', bpm: 60, startBpm: 40, caption: 'Démonstration au piano échantillonné. Baisse le tempo et choisis la main à écouter ; « Mode attente » et « En rythme » fonctionnent avec le piano branché.' })}
${W.links([
  W.informance('/content/pages/471-the-practice-tools', 'The Practice Tools', 'Graham Fitch — vidéos sur les outils de travail (en anglais)'),
  W.informance('/content/pages/471-the-practice-tools/2191-the-three-s-s-introduction', 'The Three S’s — Introduction'),
  W.informance('/content/pages/471-the-practice-tools/2190-the-feedback-loop', 'The Feedback Loop'),
  W.informance('/content/pages/172-how-to-learn-a-new-piece', 'How to Learn a New Piece'),
], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-t2', minutes: 20,
    title: 'Posture et poids du bras',
    summary: 'Un réglage du banc, une main naturelle, et un son qui vient du poids plutôt que de la force.',
    goals: ['Régler la hauteur et la distance du banc.', 'Jouer avec le poids du bras puis relâcher.', 'Repérer les tensions inutiles (épaules, poignet, mâchoire).'],
    body: W => `
<h2>Le réglage du banc</h2>
${W.diagram('posture', {}, 'Repères de posture. Le plus important : un avant-bras à peu près horizontal et des bras libres de bouger.')}
<ul>
<li><b>Hauteur</b> : coude au niveau des touches ou très légèrement au-dessus. Trop bas, le poignet casse et les doigts « tirent » ; trop haut, on écrase le clavier par les épaules.</li>
<li><b>Distance</b> : assez loin pour que les coudes soient un peu en avant du buste et puissent bouger latéralement. Si tes coudes touchent ton corps, recule.</li>
<li><b>Assise</b> : sur la moitié avant du banc, dos droit sans raideur, le poids du corps sur les ischions et un peu sur les pieds.</li>
<li><b>Pieds</b> : à plat ; le pied droit devant la pédale, talon au sol (la cheville fait le mouvement).</li>
</ul>

<h2>La main</h2>
<p>Laisse pendre ton bras le long du corps : la main prend d’elle-même une forme arrondie. C’est cette forme qu’on garde au clavier. Les doigts ne sont ni crispés en griffe ni à plat ; le poignet prolonge l’avant-bras et reste mobile.</p>
${W.diagram('hand', {}, 'Numérotation des doigts, utilisée dans tous les doigtés : 1 = pouce, 5 = auriculaire, pour chaque main.')}

<h2>Le poids, puis le relâchement</h2>
<p>Le son du piano dépend de la <b>vitesse</b> à laquelle le marteau frappe la corde, donc de la vitesse de la touche. Une fois la touche au fond, le son est parti : appuyer plus fort ne change plus rien, sinon la fatigue. Le bon geste transmet le poids du bras au moment de l’attaque, puis <b>relâche</b>, en gardant juste assez de pression pour que la touche reste enfoncée.</p>
${W.diagram('forceCurve', {}, 'En vert : attaque avec le poids, puis maintien léger. En rouge : on continue d’appuyer, le son durcit et la main se fatigue.')}

${W.exo('Exercice 1 — La chute', `<p>Avant-bras levé d’une dizaine de centimètres, laisse-le tomber sur le <b>3e doigt</b> (do3) : le doigt reste ferme, le poignet amortit comme un ressort, puis tout se relâche aussitôt, touche toujours enfoncée. Cinq fois par main, puis avec les doigts 2 et 4. Écoute : le son doit être rond, jamais cogné.</p>`)}
${W.exo('Exercice 2 — Le test du relâchement', `<p>Enfonce une touche. Diminue la pression très progressivement jusqu’à ce que la touche commence à remonter, puis reviens juste au-dessus de ce seuil. C’est la pression de maintien : bien moins que ce qu’on imagine. Refais-le sur un accord de trois notes.</p>`)}
${W.exo('Exercice 3 — Marcher sur les touches', `<p>Do-ré-mi-fa-sol main droite (1-2-3-4-5), lentement : le poids passe d’un doigt au suivant comme on passe d’un pied à l’autre en marchant. Un seul doigt « porte » à la fois. C’est la base du legato (leçon suivante).</p>`)}

<h2>Repérer les tensions</h2>
<ul>
<li><b>Épaules</b> : laisse-les retomber, surtout dans les forte. Un son qui durcit vient souvent d’une épaule qui monte.</li>
<li><b>Poignet</b> : il doit pouvoir bouger à tout moment. Teste-le pendant que tu joues une note tenue : peux-tu le bouger un peu de haut en bas sans que le son change ?</li>
<li><b>Pouce</b> : il reste détendu, légèrement arrondi, jamais collé sous la main.</li>
<li><b>Respiration et mâchoire</b> : on bloque souvent les deux dans un passage difficile. Respire avec les phrases.</li>
</ul>
${W.tip('Hygiène de travail', '<p>Fais une pause de quelques minutes toutes les vingt-cinq minutes. Une douleur n’est jamais normale : arrête-toi et cherche la tension qui la cause.</p>')}
${W.links([
  W.informance('/content/pages/13-healthy-piano-playing', 'Healthy Piano Playing', 'Penelope Roskell — jouer sans se blesser'),
  W.informance('/content/pages/129-foundations-of-good-technique', 'Foundations of Good Technique'),
], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-t3', minutes: 25,
    title: 'Le legato chanté',
    summary: 'Lier les notes avec les doigts, sans compter sur la pédale : la condition d’une mélodie qui chante.',
    goals: ['Comprendre le legato comme un transfert de poids.', 'Mesurer et régler le chevauchement entre deux notes.', 'Jouer la mélodie du nocturne liée, sans pédale.'],
    body: W => `
<p>Chopin demandait à ses élèves de lier une mélodie <b>avec les doigts seuls</b>. La pédale enrichit le son, elle ne doit pas cacher un legato imparfait. C’est d’autant plus vrai dans l’op. 55 n° 1, dont la mélodie se déroule en notes longues au-dessus d’une main gauche détachée.</p>

<h2>Le principe</h2>
${W.diagram('legato', {}, 'Le legato juste : la note suivante est enfoncée au moment où la précédente se relève. Un léger chevauchement (quelques centièmes de seconde) est naturel ; un chevauchement long brouille le son.')}
<p>Pense à la marche : on ne lève pas un pied avant que l’autre soit posé. Le poids passe d’un doigt au suivant ; le doigt qui vient de jouer se relève <b>au moment</b> où l’autre prend le relais, ni avant (trou), ni bien après (bavure).</p>

${W.exo('Exercice 1 — Cinq notes en fa mineur', `<p>Main droite puis main gauche, sans pédale, à ♩ = 50. Écoute uniquement les <b>jonctions</b> entre les notes : aucun silence, aucune superposition. Puis mesure-toi avec l’analyseur ci-dessous.</p>`)}
${W.score({ abc: EX_FIVE, title: 'Cinq notes liées (fa – sol – la♭ – si♭ – do)', bpm: 60, startBpm: 50, caption: 'Doigtés au-dessus des notes. Main droite en haut (mesures 1 à 3), main gauche ensuite (mesures 4 à 6).' })}
${W.analyzer({ mode: 'legato', title: 'Analyseur — legato', help: 'Appuie sur « Enregistrer », joue les cinq notes montantes et descendantes <b>sans pédale</b>, puis attends : l’analyse s’affiche après un court silence.' })}

<h2>La substitution de doigts</h2>
<p>Quand une note longue est jouée avec un doigt qui ne convient pas pour la suite, on change de doigt <b>sans relever la touche</b> : par exemple, enfoncer une note avec le 4, puis glisser le 5 à sa place pour libérer le 4. Chopin l’utilise sans cesse pour lier des mélodies et des voix intérieures. Exerce-toi sur une note tenue : 3 → 1, 4 → 5, 5 → 4, sans que la note se répète ni s’éteigne.</p>

<h2>La mélodie du nocturne, sans pédale</h2>
<p>Doigté possible pour les mesures 1 à 2 : levée do (2) ; fa (5), mi♭ (4), ré♭ (3) ; do (2), si♮ (1), do (2), ré♭ (3), do (2). Le si♮ et le ré♭ ne sont que des broderies autour de do : joue-les plus légèrement que les notes d’appui.</p>
${W.score({ abc: OP55.e1, title: 'Nocturne op. 55 n° 1 — mesures 1 à 4', bpm: 60, startBpm: 46, caption: 'Choisis « MD » pour écouter la mélodie seule, puis joue-la sans pédale et mesure-la avec l’analyseur de legato.' })}
${W.analyzer({ mode: 'legato', title: 'Analyseur — mélodie des mesures 1 à 4' })}
${W.tip('Quand un saut empêche de lier', '<p>Si deux notes sont trop éloignées pour être liées au doigt, on garde l’illusion du legato : la seconde note arrive exactement à temps, avec une nuance qui prolonge la première. La pédale aidera — plus tard, et seulement là.</p>')}
${W.links([W.informance('/content/pages/6-the-art-of-piano-fingering', 'The Art of Piano Fingering', 'Penelope Roskell — doigtés et substitution')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-t4', minutes: 25,
    title: 'Faire chanter la mélodie : les plans sonores',
    summary: 'Le piano comme un petit orchestre : un soliste, une basse et un accompagnement discret.',
    goals: ['Jouer les deux mains à des nuances différentes.', 'Faire ressortir la note supérieure d’un accord dans une même main.', 'Mesurer l’équilibre entre mélodie et accompagnement.'],
    body: W => `
<p>Dans l’op. 55 n° 1, trois plans se superposent : la <b>mélodie</b> (main droite), la <b>basse</b> (main gauche, 1er et 3e temps) et les <b>accords</b> (main gauche, 2e et 4e temps). Le soliste doit dominer, la basse soutenir, les accords se fondre. Jouer tout au même niveau, c’est perdre la mélodie.</p>
${W.diagram('voicing', {}, 'Ce qu’on vise : la mélodie nettement au-dessus, la basse présente, les accords les plus doux.')}

<h2>Écoute la différence</h2>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4 : deux équilibres', bpm: 56, variants: [{ label: 'Tout au même niveau', balance: { rh: 1, lh: 1.05 } }, { label: 'Mélodie en avant', balance: { rh: 1.12, lh: 0.58 } }], caption: 'Même texte, deux équilibres : dans le second, la main gauche est nettement allégée et la mélodie flotte au-dessus.' })}

<h2>Dissocier les deux mains</h2>
${W.exo('Exercice 1', `<ol>
<li>Main gauche seule des mesures 1 à 4 : basse <i>mp</i>, accords <i>pp</i>, très légers (les points de staccato signifient la légèreté, pas la sécheresse).</li>
<li>Mains ensemble : main droite <i>mf</i>, main gauche telle quelle. Écoute la note longue de la mélodie au-dessus des accords.</li>
<li>Inverse une fois (main gauche plus forte) : c’est en contrôlant aussi l’inverse qu’on contrôle vraiment.</li>
</ol>`)}
${W.analyzer({ mode: 'balance', title: 'Analyseur — équilibre des mains', target: 12, help: 'Joue les mesures 1 à 4 mains ensemble. L’analyseur compare la force moyenne au-dessus et au-dessous du point de séparation (do3 par défaut). Objectif : au moins +12.' })}

<h2>Faire chanter le haut d’un accord</h2>
<p>Dans une même main, la note la plus aiguë doit souvent dominer. Le geste : le poids s’incline vers le côté du 5e doigt, qui est actif et ferme ; les autres doigts sont « passifs », presque à fleur de touche, et enfoncent leur touche plus lentement.</p>
${W.score({ abc: EX_VOICING, title: 'Accords : la voix du haut chante (fa – mi♭ – ré♭ – do – fa)', bpm: 50, hands: false, caption: 'Les chiffrages (i, VII6, iv, V6) sont expliqués en théorie. D’abord la note du haut seule, chantée ; puis les accords en gardant la même ligne au-dessus.' })}
${W.analyzer({ mode: 'voicing', title: 'Analyseur — voix supérieure', target: 10, help: 'Joue la suite d’accords. Objectif : la note du haut au moins 10 points de vélocité au-dessus des autres, dans 80 % des accords.' })}
${W.tip('Alléger plutôt que forcer', '<p>Pour que la mélodie ressorte, il est presque toujours plus efficace d’alléger l’accompagnement que de forcer la mélodie. Un chant forcé devient dur ; un accompagnement très doux laisse le chant respirer.</p>')}
`,
  },

  {
    id: 'n1-t5', minutes: 25,
    title: 'La pédale syncopée',
    summary: 'Changer la pédale juste après l’accord : des harmonies liées, jamais mélangées.',
    goals: ['Comprendre pourquoi la pédale se change après l’attaque.', 'Réaliser une pédale syncopée propre sur i – iv – V7 – i.', 'Appliquer une pédale par demi-mesure dans l’op. 55 n° 1.'],
    body: W => `
<p>La pédale de droite soulève tous les étouffoirs : les cordes continuent de vibrer, et les autres cordes entrent en résonance. Le son s’enrichit, mais deux harmonies successives se mélangent si on garde la pédale. La solution est la <b>pédale syncopée</b> (ou pédale de legato) : on la relève au moment où l’on joue le nouvel accord, et on la reprend juste après.</p>
${W.diagram('pedal', { mode: 'sync' }, 'Pédale syncopée : les doigts jouent, puis le pied relève et rabaisse aussitôt. Les doigts tiennent l’accord pendant le changement : aucun trou, aucun mélange.')}
${W.diagram('pedal', { mode: 'direct' }, 'L’erreur fréquente : enfoncer la pédale en même temps que l’accord. Si on la relevait juste avant, il y a un trou ; si on la relève trop tard, les harmonies se mélangent.')}

<h2>Le geste du pied</h2>
<ul>
<li>Talon au sol, l’avant du pied sur la pédale ; le mouvement vient de la cheville.</li>
<li>Le changement est rapide : « haut-bas », comme un battement.</li>
<li>Dis-le à voix haute : « <b>un</b> » (je joue l’accord) – « <b>et</b> » (mon pied change). Le pied arrive toujours après les doigts.</li>
</ul>

${W.exo('Exercice 1 — i – iv – V7 – i en fa mineur', `<p>Une blanche par accord, ♩ = 60. Joue l’accord, change la pédale juste après, tiens l’accord jusqu’au suivant. Puis vérifie avec l’analyseur.</p>`)}
${W.score({ abc: EX_PEDAL, title: 'i – iv – V7 – i (fa mineur)', bpm: 60, caption: 'Les accords sont tenus par les doigts : la pédale ajoute la résonance et rend le changement inaudible. C’est cette suite que l’analyseur va vérifier.' })}
${W.analyzer({ mode: 'pedal', title: 'Analyseur — pédale', help: 'Joue la suite i – iv – V7 – i deux fois en changeant la pédale à chaque accord. Chaque point de la frise indique si le changement est syncopé (vert), à surveiller (orange) ou brouillé (rouge).' })}

<h2>Dans le nocturne : une pédale par basse</h2>
<p>La main gauche de l’op. 55 n° 1 alterne basse et accord, notés <i>staccato</i>. C’est la pédale qui relie la basse à son accord : on la change sur chaque basse (1er et 3e temps), après l’attaque. Les points de staccato indiquent une attaque légère et une main qui quitte vite le clavier, pas un son sec.</p>
${W.score({ abc: OP55.e1, title: 'Mesures 1 à 4 : avec et sans pédale', bpm: 56, variants: [{ label: 'Sans pédale' }, { label: 'Une pédale par demi-mesure', pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17 }], caption: 'La pédale est reprise sur chaque basse. Remarque comme la main gauche cesse de sonner « piquée ».' })}
${W.tip('L’oreille décide', '<p>Les indications de pédale des éditions sont des suggestions. Le piano, la salle, le tempo changent tout : écoute toujours si la basse précédente traîne dans l’harmonie suivante.</p>')}
${W.links([W.informance('/content/pages/8-the-art-of-pedalling', 'The Art of Pedalling', 'Graham Fitch — traité complet de la pédale (en anglais)')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n1-t6', minutes: 20,
    title: 'Gammes et arpèges du niveau 1',
    summary: 'Dix gammes, leurs arpèges, des doigtés sûrs et une régularité mesurée.',
    goals: ['Connaître les doigtés du programme.', 'Préparer le passage du pouce.', 'Monter en tempo avec une régularité mesurée.'],
    body: W => `
<p>Les gammes ne sont pas une fin en soi : elles entraînent la régularité, le passage du pouce et la géographie du clavier, utiles dans chaque trait de Chopin. Dix minutes par jour suffisent, à condition d’écouter chaque note.</p>

<h2>Le programme</h2>
<table>
<thead><tr><th>Gamme</th><th>Main droite</th><th>Main gauche</th></tr></thead>
<tbody>
<tr><td>Do, sol, ré majeur ; la, mi, ré, do mineur harmonique</td><td>1 2 3 · 1 2 3 4 (5 en haut)</td><td>5 4 3 2 1 · 3 2 1</td></tr>
<tr><td>Fa majeur</td><td>1 2 3 4 · 1 2 3 4 (4 sur si♭)</td><td>5 4 3 2 1 · 3 2 1</td></tr>
<tr><td>Fa mineur harmonique</td><td>1 2 3 4 · 1 2 3 4</td><td>5 4 3 2 1 · 3 2 1</td></tr>
<tr><td>La♭ majeur</td><td>3 4 · 1 2 3 · 1 2 3 (pouces sur do et fa)</td><td>3 2 1 · 4 3 2 1 · 3</td></tr>
</tbody></table>
<p>Deux octaves, mains ensemble (à l’octave), en montant et en descendant. Arpèges des accords parfaits de do, fa, sol majeur et la, ré, mi, do, fa mineur : main droite 1 2 3 · 1 2 3 5, main gauche 5 4 2 1 · 4 2 1.</p>
${W.score({ abc: EX_SCALE_FM, title: 'Fa mineur harmonique (une octave, mains ensemble)', bpm: 72, startBpm: 60, caption: 'Le mi bécarre est la sensible. Pour deux octaves, on reprend le même doigté ; la main droite finit sur le 4, la main gauche passe sur le 1.' })}
${W.score({ abc: EX_ARP, title: 'Arpège de do majeur', bpm: 60, caption: 'Triolets de croches : le pouce glisse sous la main pendant les notes 2 et 3, sans mouvement du coude.' })}

<h2>Le passage du pouce</h2>
<p>Le pouce se prépare <b>tôt</b> : dès qu’il a joué, il glisse sous la main vers sa prochaine note, pendant que les autres doigts jouent. Le coude suit le mouvement latéral sans saccade, le poignet reste à la même hauteur. Le « trou » qu’on entend souvent au passage du pouce vient d’un pouce qui part trop tard.</p>

<h2>Monter en tempo</h2>
<ol>
<li>Croches à ♩ = 60, puis doubles croches à ♩ = 60, très égales.</li>
<li>Rythmes pointés et inversés, puis groupes de quatre avec arrêt sur la note d’arrivée.</li>
<li>Accentue une note sur trois : cela casse les habitudes et révèle les doigts faibles.</li>
<li>Avec le métronome en <b>accélération progressive</b> (+2 toutes les 4 mesures), jusqu’à l’objectif : ♩ = 80 en doubles croches.</li>
</ol>
${W.analyzer({ mode: 'evenness', title: 'Analyseur — régularité', bpm: 72, sub: 4, help: 'Joue une gamme sur deux octaves (montée et descente). L’analyse montre l’écart de chaque intervalle de temps par rapport à la médiane et l’égalité des nuances. Avec « Avec métronome », elle indique aussi si tu as tendance à jouer en avance ou en retard.' })}
${W.metronome({ bpm: 60, beats: 4 })}
${W.links([
  W.informance('/content/pages/40-intermediate-scales-arpeggios', 'Intermediate Scales & Arpeggios'),
  W.informance('/content/pages/207-finding-effortless-speed/1464-deconstructing-the-scale', 'Finding Effortless Speed'),
], 'Pour aller plus loin')}
`,
  },
];
