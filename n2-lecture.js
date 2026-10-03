// Niveau 2 — Lecture à vue

const PATTERNS = `X:1
M:4/4
L:1/8
K:C
"^gamme"cdef gabc' | "^arpège"cegc' gec2 | "^marche"cdec defd | efge fgaf |
"^notes répétées"gggg gggg | "^broderies"gagf efed | c8 |]`;

const M68 = `X:1
M:6/8
L:1/8
K:C
"^6/8 : deux temps, chacun divisé en trois"c3 c3 | cde fga | g3 e3 | c6 |]`;

const M34 = `X:1
M:3/4
L:1/8
K:C
"^3/4 : trois temps, chacun divisé en deux"c2 c2 c2 | cd ef ga | g2 e2 c2 | c6 |]`;

const POLY32 = `X:1
M:2/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] (3cde (3fga | (3gfe (3dcB | c4 |]
[V:LH] C,E, G,C | B,,D, G,,B,, | C,4 |]`;

const POLY43 = `X:1
M:2/4
L:1/16
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] cdef gfed | cdef g4 |]
[V:LH] (3C,2E,2G,2 (3C2G,2E,2 | (3C,2E,2G,2 C,4 |]`;

export default [
  {
    id: 'n2-l1', minutes: 15,
    title: 'Lire en motifs',
    summary: 'Les bons lecteurs ne lisent pas des notes, mais des formes : gammes, arpèges, marches, formules.',
    goals: ['Reconnaître d’un coup d’œil les motifs courants.', 'Repérer les répétitions et les marches avant de jouer.', 'Lire une formule de main gauche comme un tout.'],
    body: W => `
<p>Un lecteur débutant déchiffre note après note ; un lecteur expérimenté reconnaît des <b>formes</b>, comme on lit des mots entiers plutôt que des lettres. C’est la clé de la vitesse en lecture à vue : moins de choses à décoder, donc plus de temps pour regarder devant.</p>
${W.score({ abc: PATTERNS, title: 'Les motifs les plus courants', bpm: 80, startBpm: 66, caption: 'Chaque motif a un aspect visuel immédiat : une gamme « marche » de ligne en interligne, un arpège saute de ligne en ligne (ou d’interligne en interligne), une marche reproduit le même dessin un cran plus haut.' })}
<h2>Ce qu’il faut reconnaître</h2>
<ul>
<li><b>Les gammes et fragments de gamme</b> : des notes conjointes. On lit la première note et la direction, et on « déroule ».</li>
<li><b>Les arpèges</b> : des tierces superposées. On reconnaît l’accord (et son doigté) en bloc.</li>
<li><b>Les marches</b> : le même motif décalé. Une fois le modèle lu, la suite se devine (voir <a href="#/lecon/n2-th4">les marches harmoniques</a>).</li>
<li><b>Les répétitions</b> : une mesure identique à une précédente se lit en une fraction de seconde — à condition de l’avoir remarquée.</li>
<li><b>Les formules de main gauche</b> : basse et accord, basse d’Alberti, accords brisés. Reconnues, elles se jouent presque seules.</li>
</ul>
${W.exo('Avant chaque extrait (30 secondes)', `<ol>
<li>Combien de fois le motif de la mesure 1 revient-il ? Tel quel, transposé, varié ?</li>
<li>Y a-t-il une marche ? Dans quel sens ?</li>
<li>Quelle formule joue la main gauche ?</li>
<li>Où est le passage qui ne ressemble à rien d’autre ? C’est là que tu devras être le plus attentif.</li>
</ol>`)}
${W.sight({ preset: 'n2-md', presets: ['n2-md', 'n2-alb', 'n1-acc'] })}
${W.links([W.informance('/content/pages/136-advanced-sight-reading-curriculum', 'Advanced Sight-Reading Curriculum')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-l2', minutes: 15,
    title: 'Tonalités à trois et quatre altérations',
    summary: 'Penser dans la tonalité, plutôt que corriger chaque note de l’armure.',
    goals: ['Connaître la géographie des tonalités jusqu’à quatre altérations.', 'Se préparer en jouant gamme et cadence.', 'Repérer les altérations accidentelles qui comptent.'],
    body: W => `
<p>Avec trois ou quatre altérations, lire chaque note puis « ajouter le dièse » devient trop lent et source d’erreurs. Il faut <b>penser dans la tonalité</b> : la main sait d’avance quelles touches noires appartiennent au paysage.</p>

<h2>La géographie des tonalités</h2>
${W.kbd({ from: 64, to: 76, title: 'Mi majeur (4 dièses)', marks: [64, 66, 68, 69, 71, 73, 75, 76].map(m => ({ m })), names: 'marks', play: 'seq', caption: 'Fa♯, do♯, sol♯, ré♯ : la main reste haute sur le clavier, près des touches noires.' })}
${W.kbd({ from: 63, to: 75, title: 'Mi♭ majeur (3 bémols)', marks: [63, 65, 67, 68, 70, 72, 74, 75].map(m => ({ m })), names: 'marks', flats: true, play: 'seq', caption: 'Si♭, mi♭, la♭. Relatif : do mineur (avec si♮, la sensible).' })}
${W.kbd({ from: 61, to: 73, title: 'Do♯ mineur harmonique (4 dièses)', marks: [61, 63, 64, 66, 68, 69, 72, 73].map(m => ({ m, color: m === 72 ? '#f2d9a8' : null })), names: 'marks', play: 'seq', caption: 'La sensible est si♯, qui se joue sur la touche de do : une note qui surprend souvent en lecture.' })}
<table>
<thead><tr><th>Armure</th><th>Majeur</th><th>Mineur (sensible)</th></tr></thead>
<tbody>
<tr><td>3 dièses</td><td>la majeur</td><td>fa♯ mineur (mi♯)</td></tr>
<tr><td>4 dièses</td><td>mi majeur</td><td>do♯ mineur (si♯)</td></tr>
<tr><td>3 bémols</td><td>mi♭ majeur</td><td>do mineur (si♮)</td></tr>
<tr><td>4 bémols</td><td>la♭ majeur</td><td>fa mineur (mi♮)</td></tr>
</tbody></table>

<h2>Se préparer en vingt secondes</h2>
<ol>
<li>Lis l’armure et décide : majeur ou mineur ? (dernière note de la basse, altérations accidentelles qui ressemblent à une sensible).</li>
<li>Joue la gamme sur une octave et la cadence I – IV – V7 – I : la main s’accorde au paysage.</li>
<li>Repère les altérations accidentelles : elles valent pour toute la mesure, et seulement pour elle.</li>
</ol>
${W.warn('Les pièges classiques', '<ul><li>La sensible des tonalités mineures : mi♮ en fa mineur, si♮ en do mineur, mi♯ en fa♯ mineur, si♯ en do♯ mineur.</li><li>Une altération qui revient à la mesure suivante sans être réécrite : elle ne vaut plus (sauf liaison).</li><li>Un bécarre qui annule l’armure : il crée souvent une dominante secondaire.</li></ul>')}
${W.quiz({ kind: 'keysig', keys: ['D', 'A', 'E', 'Bb', 'Eb', 'Ab'], title: 'Armures jusqu’à quatre altérations (majeur)', count: 10, stat: 'ks-maj' })}
${W.quiz({ kind: 'keysig', minor: true, keys: ['D', 'A', 'E', 'Bb', 'Eb', 'Ab'], title: 'Armures jusqu’à quatre altérations (mineur)', count: 10, stat: 'ks-min' })}
${W.sight({ preset: 'n2-md', presets: ['n2-md', 'n2-alb'] })}
`,
  },

  {
    id: 'n2-l3', minutes: 20,
    title: 'Rythmes : 6/8, polyrythmies, irrégularités',
    summary: 'Mesures composées, trois contre deux, quatre contre trois : les comprendre avant de les lire.',
    goals: ['Distinguer mesures simples et composées (3/4 et 6/8).', 'Jouer trois contre deux et quatre contre trois.', 'Lire les groupes irréguliers sans perdre la pulsation.'],
    body: W => `
<h2>3/4 et 6/8 : même nombre de croches, autre pulsation</h2>
<p>Les deux mesures contiennent six croches. Mais 3/4 compte <b>trois temps</b> divisés en deux, et 6/8 <b>deux temps</b> divisés en trois (une noire pointée par temps). L’op. 15 n° 1 passe deux fois de l’un à l’autre (mesures 36 et 48) : la pulsation change, la croche reste la même.</p>
${W.score({ abc: M34, title: '3/4', bpm: 80, click: true, practice: false, hands: false })}
${W.score({ abc: M68, title: '6/8', bpm: 54, click: true, practice: false, hands: false, caption: 'Écoute le clic : trois noires en 3/4, deux noires pointées en 6/8.' })}
${W.tip('L’hémiole', '<p>Dans une mesure à 3/4, deux mesures regroupées en trois blanches font entendre une grande mesure à 3/2 : c’est l’<b>hémiole</b>, fréquente dans les valses et avant les cadences. Repère-la aux liaisons et aux accents qui contredisent la barre de mesure.</p>')}

<h2>Trois contre deux</h2>
<p>Divise le temps en six. La main qui joue trois notes frappe sur 1, 3 et 5 ; celle qui en joue deux, sur 1 et 4. Ensemble, on entend 1 – 3 – 4 – 5 : un rythme <b>long – bref – bref – long</b>. Dis-le, tape-le sur tes genoux (une main par rythme), puis joue.</p>
${W.score({ abc: POLY32, title: 'Trois contre deux', bpm: 50, startBpm: 40, click: true, caption: 'Triolets à la main droite, croches à la main gauche. Commence très lentement, en pensant au rythme combiné plutôt qu’à chaque main.' })}

<h2>Quatre contre trois</h2>
<p>Divise le temps en douze. Le groupe de quatre tombe sur 1, 4, 7 et 10 ; le groupe de trois sur 1, 5 et 9. Ensemble : 1 – 4 – 5 – 7 – 9 – 10. Plus difficile : apprends-le d’abord très lentement, puis laisse chaque main suivre sa propre pulsation régulière.</p>
${W.score({ abc: POLY43, title: 'Quatre contre trois', bpm: 40, startBpm: 32, click: true })}

<h2>Les groupes irréguliers</h2>
<ul>
<li><b>Le duolet</b> (Clair de lune) : deux notes dans le temps de trois croches, chacune vaut une croche et demie.</li>
<li><b>Quintolets, septolets</b> (Chopin) : on aligne le départ et l’arrivée sur la main gauche, on répartit les notes entre les deux (voir <a href="#/lecon/n2-i3">les ornements</a>). En lecture à vue, garde la pulsation et place le groupe au mieux : mieux vaut un septolet approximatif qu’un temps perdu.</li>
</ul>
${W.sight({ preset: 'n2-md', presets: ['n2-md', 'n2-8'] })}
`,
  },

  {
    id: 'n2-l4', minutes: 15,
    title: 'Lire en avance',
    summary: 'Les yeux devant les mains : entraîner l’empan de lecture.',
    goals: ['Comprendre l’écart entre les yeux et les mains.', 'Lire la mesure suivante pendant qu’on joue.', 'Garder les yeux sur la partition.'],
    body: W => `
<p>Chez les bons lecteurs, les yeux sont toujours en avance sur les mains : d’un ou deux temps chez le débutant, d’une mesure ou plus chez l’expert. Cet écart, c’est ce qui laisse le temps de préparer les gestes. Il s’entraîne.</p>

<h2>Trois exercices</h2>
<ol>
<li><b>Regard en avant</b> : dans l’outil de lecture, la mesure que tu joues s’efface. Tu es forcé de lire la suivante pendant que tu joues celle-ci. Commence lentement.</li>
<li><b>Photographier une mesure</b> : regarde une mesure deux secondes, quitte la partition des yeux, joue-la de mémoire. Puis deux mesures.</li>
<li><b>Profiter des notes longues</b> : chaque note tenue est un moment pour regarder devant. Repère-les avant de commencer.</li>
</ol>

<h2>Les yeux restent sur la partition</h2>
<p>Chaque regard vers le clavier fait perdre sa place sur la page. Pour les sauts, repère la distance (une octave, une dixième) et sens-la sous la main ; utilise les groupes de deux et trois touches noires comme repères tactiles. Si tu dois regarder, fais-le d’un coup d’œil, en gardant un point de repère sur la page.</p>
${W.tip('Lire en rythme', '<p>Le mode « En rythme » (ou « Préparer 30 s puis jouer ») ne s’arrête pas pour toi : c’est l’entraînement le plus proche d’une vraie lecture à vue, comme jouer avec un autre musicien. Vise 80 % de notes justes avec « Regard en avant » coché.</p>')}
${W.sight({ preset: 'n2-8', presets: ['n2-8', 'n2-alb', 'n2-md'] })}
${W.links([W.informance('/content/pages/198-music-at-sight', 'Music at Sight')], 'Pour aller plus loin')}
`,
  },
];
