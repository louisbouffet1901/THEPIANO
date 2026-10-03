// Niveau 2 — Improvisation : le langage classique, appris comme une langue (méthode des partimenti napolitains,
// redécouverte par R. Gjerdingen et J. Mortensen) : cadences, règle de l'octave, schémas, puis ornements,
// marches, prélude sur basse descendante et forme ABA.
import { OP15 } from './content-excerpts.js';

const CAD_A = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^soprano 1 – 1 – 7 – 1"[Gc]2 [Ac]2 | [FB]2 [Ec]2 |]
[V:LH] "_I6"E,2 "_IV"F,2 | "_V7"G,2 "_I"C,2 |]`;

const CAD_B = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^soprano 5 – 4 – 4 – 3"[cg]2 [Af]2 | [Bf]2 [ce]2 |]
[V:LH] "_I6"E,2 "_IV"F,2 | "_V7"G,2 "_I"C,2 |]`;

const CAD_MIN = `X:1
M:4/4
L:1/4
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] [EA]2 [FA]2 | [D^G]2 [CA]2 |]
[V:LH] "_i6"C,2 "_iv"D,2 | "_V7"E,2 "_i"A,,2 |]`;

const OCTAVE_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^montée"[EGc]2 [FGB]2 | [EGc]2 [DAc]2 | [DGB]2 [CFc]2 | [DFG]2 [CEG]2 | "^descente"[EGc]2 [DGd]2 | [D^Fc]2 [DGB]2 | [DGB]2 [CGc]2 | [B,FG]2 [CEG]2 |]
[V:LH] "_I"C,,2 "_V4/3"D,,2 | "_I6"E,,2 "_ii6/5"F,,2 | "_V"G,,2 "_IV6"A,,2 | "_V6/5"B,,2 "_I"C,2 | "_I"C,2 "_V6"B,,2 | "_V4/3 de V"A,,2 "_V"G,,2 | "_V4/2"F,,2 "_I6"E,,2 | "_V4/3"D,,2 "_I"C,,2 |]`;

const ROMANESCA_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^Romanesca"[Ge]2 [Gd]2 | [Ec]2 [EB]2 | "^Prinner"[CA]2 [CG]2 | [B,F]2 [CE]2 | "^cadence"[CG]2 [DF]2 | [B,F]2 [CE]2 |]
[V:LH] "_I"C2 "_V6"B,2 | "_vi"A,2 "_iii6"G,2 | "_IV"F,2 "_I6"E,2 | "_V4/3"D,2 "_I"C,2 | "_I6"E,2 "_ii6"F,2 | "_V7"G,2 "_I"C,2 |]`;

const SCHEMAS_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^Meyer"[EGc]2 [FGB]2 | [DGf]2 [CGe]2 | "^Monte"[C_B]2 [CA]2 | [Dc]2 [DB]2 | "^Fonte"[A,G]2 [A,F]2 | [G,F]2 [G,E]2 |]
[V:LH] "_I"C,2 "_V4/3"D,2 | "_V6/5"B,,2 "_I"C,2 | "_V6/5 de IV"E,2 "_IV"F,2 | "_V6/5 de V"^F,2 "_V"G,2 | "_V6/5 de ii"^C,2 "_ii"D,2 | "_V6/5"B,,2 "_I"C,2 |]`;


const LH8 = `[V:LH] "_i".F,,2 .[A,CF]2 .C,2 .[A,CF]2 | "_iv".B,,2 .[B,DF]2 .F,,2 .[B,DF]2 | "_V7".C,,2 .[B,=EG]2 .G,,2 .[B,=EG]2 | "_i".F,,2 .[A,CF]2 F,,4 |]`;
const LH16 = `[V:LH] "_i".F,,4 .[A,CF]4 .C,4 .[A,CF]4 | "_iv".B,,4 .[B,DF]4 .F,,4 .[B,DF]4 | "_V7".C,,4 .[B,=EG]4 .G,,4 .[B,=EG]4 | "_i".F,,4 .[A,CF]4 F,,8 |]`;
const head = (L) => `X:1
M:4/4
L:${L}
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass`;

const PLAIN = `${head('1/8')}
[V:RH] "^mélodie simple"c4 f4 | f4 e2 d2 | c4 G2 =E2 | A2 G2 F4 |]
${LH8}`;

const ORNATE = `${head('1/16')}
[V:RH] "^mélodie ornée"c4 dc=Bc g4 f4 | f4 gf=ef _e4 d4 | c4 dcBc G4 =E4 | A4 (6:4:6GAGF=EG F8 |]
${LH16}`;

const MARCHE = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^modèle"e3d c2e2 | f3e d2f2 | "^un degré plus bas"d3c B2d2 | e3d c2e2 | "^encore un degré plus bas"c3B A2c2 | d3c B2d2 | "^cadence"B3A ^G2B2 | A8 |]
[V:LH] "_i"A,,4 [E,A,C]4 | "_iv"D,,4 [D,F,A,]4 | "_VII"G,,4 [D,G,B,]4 | "_III"C,4 [E,G,C]4 | "_VI"F,,4 [C,F,A,]4 | "_ii°"B,,4 [D,F,B,]4 | "_V7"E,,4 [D,^G,B,]4 | "_i"A,,8 |]`;

const RETOUR = `X:1
M:4/4
L:1/8
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^la♭ majeur : I"[Ace]8 | "^fa mineur : V"[Gc=e]4 "^V7"[GB=e]4 | "^i"[FAf]8 |]
[V:LH] A,,8 | C,8 | F,,8 |]`;

const LAMENTO = `X:1
M:4/4
L:1/8
K:F
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^F"Acfc Acfc | "^C/E"Gcec Gcec | "^F7/E♭"Acfc Acfc | "^B♭/D"Bdfd Bdfd | "^B♭m/D♭"B_dfd Bdfd | "^F/C"Acfc Acfc | "^C7"GBeB GBeB | "^F"[FAc]8 |]
[V:LH] F,8 | E,8 | _E,8 | D,8 | _D,8 | C,8 | C,8 | F,,8 |]`;

const PED4 = [0, 4, 8, 12];
const PED8 = [0, 4, 8, 12, 16, 20, 24, 28];

export default [
  {
    id: 'n2-im-cadences', minutes: 20,
    title: 'Les cadences au clavier',
    summary: 'Comme les apprentis compositeurs du XVIIIe siècle : apprendre la cadence par cœur, dans toutes les tonalités, puis improviser dessus.',
    goals: ['Jouer la cadence I6 – IV – V7 – I avec deux mélodies différentes.', 'La transposer dans plusieurs tonalités, en majeur et en mineur.', 'Improviser une mélodie sur la cadence en boucle.'],
    body: W => `
<p>Au XVIIIe siècle, dans les conservatoires de Naples, les futurs compositeurs apprenaient à improviser au clavier avec des <b>partimenti</b> : on leur donnait une basse, ils inventaient les voix supérieures. Tout commençait par les <b>cadences</b>, jouées dans toutes les tonalités jusqu’à devenir des réflexes. C’est la méthode que redécouvrent aujourd’hui musicologues et improvisateurs (le musicologue Robert Gjerdingen, le pianiste John Mortensen) : apprendre le langage par ses formules, comme on apprend une langue par ses expressions.</p>

<h2>La cadence complète</h2>
<p>Gjerdingen l’appelle « cadence complète » : la basse monte <b>mi – fa – sol</b>, puis tombe sur <b>do</b> (degrés 3 – 4 – 5 – 1). Au-dessus : I6 – IV – V7 – I. Deux mélodies (sopranos) très fréquentes :</p>
${W.score({ abc: CAD_A, title: 'Cadence en do majeur : soprano do – do – si – do', bpm: 56, caption: 'Au-dessus de la basse, deux voix à la main droite. La voix du bas descend sur fa (la septième de sol 7), qui se résout sur mi.' })}
${W.score({ abc: CAD_B, title: 'La même cadence : soprano sol – fa – fa – mi', bpm: 56, caption: 'Le fa du soprano devient la septième de sol 7 et descend sur mi ; la voix du milieu fait do – la – si – do.' })}
${W.score({ abc: CAD_MIN, title: 'En la mineur : i6 – iv – V7 – i', bpm: 56, caption: 'La sensible sol♯ monte vers la ; ré (septième de mi 7) descend vers do.' })}

<h2>Méthode</h2>
<ol>
<li><b>Par cœur</b>, en do, les yeux fermés : la main droite ne bouge presque pas.</li>
<li><b>Transpose</b> : sol, fa, ré, si♭ majeur ; puis la, ré, mi, sol mineur. Une tonalité nouvelle par jour, en disant les degrés (3 – 4 – 5 – 1).</li>
<li><b>Avec l’accompagnateur</b>, qui ne joue que la basse : joue les voix supérieures en rythme.</li>
<li><b>Improvise</b> : garde les notes du soprano sur les temps forts, et relie-les par des notes de passage et des broderies.</li>
</ol>
${W.improv({ preset: 'n2-cadence', presets: ['n2-cadence', 'n2-cadence-min'] })}
${W.tip('Les notes qui tirent', '<p>Dans chaque version, deux notes ont une direction obligée : la sensible (si en do, sol♯ en la mineur) monte, la septième (fa, ou ré en la mineur) descend. Si elles sont à leur place, la cadence sonne juste, même improvisée.</p>')}

<h2>Dans ta pièce</h2>
<p>Les cadences de l’op. 15 n° 1 sont des modèles : mesures 21-22, do 7 → fa (parfaite, la basse va de do à fa) ; mesure 24, arrêt sur do 7 au-dessus de la basse fa (effet de demi-cadence) avant le Con fuoco ; mesures 72-74, la conclusion sur la pédale de fa. Joue la cadence du cours en fa majeur (basse la – si♭ – do – fa), puis écoute ces trois moments.</p>
${W.checklist({ id: 'n2-im-cad-check', title: 'Je vérifie', items: ['Je joue les deux versions en do sans hésiter.', 'Je les transpose dans au moins quatre tonalités.', 'La sensible monte, la septième descend.', 'J’improvise quatre mesures sur la cadence en boucle sans m’arrêter.'] })}
`,
  },

  {
    id: 'n2-im-octave', minutes: 20,
    title: 'La règle de l’octave',
    summary: 'Harmoniser une gamme à la basse : un accord typique pour chaque degré, en montant et en descendant. La clé de tous les accompagnements.',
    goals: ['Connaître l’accord de chaque degré de la règle de l’octave.', 'La jouer en do, sol et fa majeur.', 'Improviser une mélodie sur une basse qui monte et descend.'],
    body: W => `
<p>Quand la basse avance par degrés, chaque note appelle un accord typique : c’est la <b>règle de l’octave</b>, formulée par François Campion en 1716 et enseignée à tous les claviéristes du XVIIIe siècle. Elle permet d’harmoniser presque n’importe quelle basse en mouvement conjoint.</p>
<table>
<thead><tr><th class="num">Degré</th><th>En montant</th><th>En descendant</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>I</td><td>I</td></tr>
<tr><td class="num">2</td><td>V4/3</td><td>V4/3</td></tr>
<tr><td class="num">3</td><td>I6</td><td>I6</td></tr>
<tr><td class="num">4</td><td>ii6/5</td><td>V4/2</td></tr>
<tr><td class="num">5</td><td>V</td><td>V</td></tr>
<tr><td class="num">6</td><td>IV6</td><td>V4/3 de V (fa♯ en do)</td></tr>
<tr><td class="num">7</td><td>V6/5</td><td>V6</td></tr>
<tr><td class="num">8</td><td>I</td><td>I</td></tr>
</tbody></table>
<p>Retiens le principe plutôt que le tableau : <b>1, 3 et 5 portent l’accord de tonique ou de dominante dans sa forme stable</b> ; les autres degrés portent un accord de passage, le plus souvent une septième de dominante renversée, qui mène au degré suivant.</p>
${W.score({ abc: OCTAVE_EX, title: 'La règle de l’octave en do majeur', bpm: 60, startBpm: 50, caption: 'Les voix de la main droite bougent le moins possible : notes communes gardées, sensible qui monte, septième qui descend. En descendant, le fa♯ (sur la, 6e degré) annonce sol : une dominante secondaire.' })}

<h2>Méthode</h2>
<ol>
<li>Joue la montée et la descente en do, lentement, jusqu’à la savoir par cœur.</li>
<li>Avec l’accompagnateur (basse seule), joue les accords à la main droite, en rythme.</li>
<li>Transpose en sol majeur, puis en fa majeur (même doigté de main droite, autres touches).</li>
<li>Improvise une mélodie : une note de l’accord par temps, puis des notes de passage entre elles.</li>
</ol>
${W.improv({ preset: 'n2-octave', presets: ['n2-octave', 'n2-octave-sol', 'n2-octave-fa'] })}

<h2>Dans ta pièce</h2>
<p>Dans la descente, la règle place déjà une dominante secondaire sur le 6e degré (ré 7 sur la, avec fa♯, qui mène à sol). Aux mesures 4 à 8 de l’op. 15, Chopin généralise ce principe : la basse descend fa – mi – ré – ré♭ – do – si – la, et presque chaque étape est préparée par la dominante de l’accord suivant. La règle de l’octave, en plus coloré.</p>
${W.tip('Basse d’abord', '<p>Chante la basse en jouant les accords : c’est elle qui guide. Quand tu improviseras un accompagnement, pense d’abord la ligne de basse, puis remplis.</p>')}
`,
  },

  {
    id: 'n2-im-romanesca', minutes: 20,
    title: 'Les schémas (1) : Romanesca et Prinner',
    summary: 'Des phrases toutes faites, que les compositeurs combinaient comme des mots : une basse et une mélodie typiques, à varier à l’infini.',
    goals: ['Jouer la Romanesca, le Prinner et la cadence enchaînés.', 'Improviser une mélodie en tierces ou dixièmes avec la basse.', 'Reconnaître ces schémas à l’écoute.'],
    body: W => `
<p>Robert Gjerdingen a montré que la musique du XVIIIe siècle est faite de <b>schémas</b> : des enchaînements de quelques accords, avec une basse et une mélodie caractéristiques, que tous les compositeurs connaissaient et combinaient. Apprendre quelques schémas, c’est se constituer un vocabulaire ; improviser, c’est les enchaîner et les orner.</p>

<h2>Trois schémas</h2>
<ul>
<li><b>La Romanesca</b> : une basse qui descend do – si – la – sol (I – V6 – vi – iii6), une mélodie qui descend avec elle, souvent à la dixième (mi – ré – do – si). Une ouverture de phrase, noble et calme. Le Canon de Pachelbel en utilise une variante à basse sautante (1 – 5 – 6 – 3).</li>
<li><b>Le Prinner</b> : la réponse. Basse fa – mi – ré – do (4 – 3 – 2 – 1), mélodie la – sol – fa – mi (6 – 5 – 4 – 3), en dixièmes. IV – I6 – V4/3 – I : la phrase redescend vers la tonique.</li>
<li><b>La cadence</b> (leçon 1) : elle ferme.</li>
</ul>
${W.score({ abc: ROMANESCA_EX, title: 'Romanesca, Prinner, cadence (do majeur)', bpm: 60, startBpm: 50, caption: 'Romanesca et Prinner enchaînés : la basse descend une octave entière, de do à do. Le soprano suit la basse à la dixième (mi sur do, ré sur si…) : le moyen le plus sûr d’écrire, ou d’improviser, une mélodie qui sonne.' })}

<h2>Improviser sur les schémas</h2>
<ol>
<li>Joue l’exemple, puis avec l’accompagnateur, qui joue les accords.</li>
<li>Soprano en <b>dixièmes</b> avec la basse : une note par accord, puis deux, puis des croches.</li>
<li>Même grille, autre soprano : en <b>sixtes</b> avec la basse (sol – sol – fa – mi… cherche).</li>
<li>Orne le soprano avec les outils du niveau 1 (broderies, notes de passage, appoggiatures).</li>
</ol>
${W.improv({ preset: 'n2-romanesca', presets: ['n2-romanesca'] })}

<h2>Dans ta pièce</h2>
<p>Une basse qui descend pas à pas sous une mélodie : c’est aussi le dessin des mesures 4 à 8 de l’op. 15 (fa – mi – ré – ré♭ – do – si – la). Chopin remplit cette basse de couleurs chromatiques là où la Romanesca et le Prinner restent dans la gamme.</p>
${W.tip('Dixièmes', '<p>Une dixième, c’est une tierce plus une octave. Garde la main droite une dixième au-dessus de la main gauche, et fais descendre les deux mains ensemble : la mélodie et la basse deviennent un duo.</p>')}
`,
  },

  {
    id: 'n2-im-schemas', minutes: 20,
    title: 'Les schémas (2) : Meyer, Monte, Fonte',
    summary: 'Trois schémas de plus : une ouverture en dialogue, une montée et une descente en marche. De quoi improviser seize mesures entières.',
    goals: ['Jouer le Meyer, le Monte et la Fonte.', 'Reconnaître le Monte dans le Con fuoco.', 'Enchaîner cinq schémas en une pièce de seize mesures.'],
    body: W => `
<ul>
<li><b>Le Meyer</b> : une ouverture en deux gestes, mélodie do – si… fa – mi (1 – 7… 4 – 3), basse do – ré… si – do. I – V4/3… V6/5 – I : une question, une réponse, sur deux accords seulement.</li>
<li><b>Le Monte</b> (« la montée ») : un petit modèle « dominante → accord », repris un degré plus haut : do 7 → fa, puis ré 7 → sol. La tension monte.</li>
<li><b>La Fonte</b> (« la fontaine ») : l’inverse : la 7 → ré mineur, puis sol 7 → do, un degré plus bas. La tension retombe, du mineur au majeur.</li>
</ul>
${W.score({ abc: SCHEMAS_EX, title: 'Meyer, Monte, Fonte (do majeur)', bpm: 60, startBpm: 50, caption: 'Dans le Monte et la Fonte, chaque septième (si♭, do, sol, fa) descend d’un degré et chaque sensible (mi, fa♯, do♯, si) monte : la règle des septièmes de dominante, appliquée en marche.' })}

<h2>Seize mesures avec des schémas</h2>
<p>Une phrase de musique classique se construit souvent ainsi : une <b>ouverture</b> (Romanesca ou Meyer), une <b>continuation</b> qui avance (Monte, Fonte, Prinner), une <b>cadence</b>. Enchaîne par exemple : Meyer – Prinner – cadence (huit mesures), puis Monte – Fonte – cadence (huit mesures).</p>
${W.improv({ preset: 'n2-meyer', presets: ['n2-meyer', 'n2-monte-fonte', 'n2-romanesca'] })}

<h2>Dans ta pièce</h2>
<p>Mesures 41 à 44 de l’op. 15 : la♭ 7, puis si♭ 7, un ton plus haut, chacun dominante d’une tonalité nouvelle (ré♭, puis mi♭ mineur). Cela rappelle le Monte : une dominante reprise plus haut, qui fait monter la tension avant la redescente des mesures 45 à 48.</p>
${W.exo('Exercice', `<ol>
<li>Joue chaque schéma en do, puis en sol majeur.</li>
<li>Avec l’accompagnateur, improvise une mélodie sur « Meyer, Prinner et cadence », puis sur « Monte puis Fonte ».</li>
<li>Enchaîne seize mesures sans t’arrêter : Meyer – Prinner – cadence, Monte – Fonte – cadence.</li>
</ol>`)}
${W.checklist({ id: 'n2-im-schemas-check', title: 'Je vérifie', items: ['Je joue les cinq schémas (Romanesca, Prinner, Meyer, Monte, Fonte) par cœur en do.', 'Je reconnais le Monte et la Fonte à l’oreille.', 'J’enchaîne seize mesures de schémas en improvisant la mélodie.'] })}
`,
  },

  {
    id: 'n2-im1', minutes: 20,
    title: 'Orner une mélodie',
    summary: 'Transformer une mélodie simple en mélodie chopinienne : broderies, appoggiatures, chromatismes, fioritures.',
    goals: ['Connaître les ornements de base du style romantique.', 'Garder le squelette de la mélodie sous les ornements.', 'Orner une mélodie en improvisant, sans perdre la pulsation.'],
    body: W => `
<p>Les ornements de Chopin sont nés de l’improvisation : quand un thème revient, il le chante autrement, comme un chanteur d’opéra qui varie sa reprise. On peut apprendre à faire de même, à partir d’une mélodie très simple.</p>
${W.score({ abc: PLAIN, title: 'La mélodie simple (i – iv – V7 – i)', bpm: 60, pedal: PED4, pedalEnd: 16 })}
${W.score({ abc: ORNATE, title: 'La même mélodie, ornée', bpm: 60, startBpm: 52, pedal: PED4, pedalEnd: 16, caption: 'Mêmes notes d’appui aux mêmes endroits (à la mesure 1, l’appoggiature sol retarde le fa d’un temps) ; seuls les espaces entre elles sont remplis. Compare les deux versions mesure par mesure.' })}

<h2>La boîte à outils</h2>
<ul>
<li><b>La broderie</b> : on quitte une note pour sa voisine et on revient (do – ré♭ – do). Doublée, elle devient un <b>groupe</b> autour de la note : ré♭ – do – si♮ – do (mesure 1).</li>
<li><b>L’appoggiature</b> : une note étrangère sur le temps, qui se résout par degré (sol → fa, mesure 1). C’est le moment expressif fort : un peu plus de poids, puis une résolution douce.</li>
<li><b>Le chromatisme</b> : une broderie ou un passage par demi-ton, même hors de la gamme (le mi♮ sous fa, mesure 2).</li>
<li><b>La fioriture</b> : un petit groupe rapide qui remplit un temps avant une note d’arrivée (le sextolet de la mesure 4).</li>
</ul>

<h2>Les règles du jeu</h2>
<ol>
<li><b>Le squelette d’abord</b> : les notes d’appui restent sur les temps forts (ou arrivent juste après, avec une appoggiature).</li>
<li><b>Ornements plus légers</b> que les notes qu’ils ornent.</li>
<li><b>La main gauche ne bouge pas</b> : c’est elle qui garde le temps pendant que la main droite se libère.</li>
<li><b>Peu, mais bien</b> : une ou deux idées par phrase. Un thème orné partout perd son chant.</li>
</ol>
${W.exo('Exercice', `<ol>
<li>Joue la mélodie simple avec l’accompagnateur ci-dessous.</li>
<li>Rejoue-la en ajoutant un seul ornement par mesure, différent à chaque fois.</li>
<li>Invente ta propre mélodie simple (des blanches et des noires), puis orne-la à la reprise : ABA′, où A′ est la version ornée.</li>
</ol>`)}
${W.improv({ preset: 'n1-nocturne', presets: ['n1-nocturne', 'n1-nocturne8'] })}
<h2>Dans ta pièce</h2>
<p>Dans la reprise de l’op. 15 (mesures 49 à 74), Chopin fait exactement cela : même harmonie qu’au début, mélodie ornée. Mesure 54, le septolet brode autour de ré avant de rejoindre mi : compare avec la mesure 6, plus simple. C’est une improvisation écrite.</p>
${W.score({ abc: OP15.e5, title: 'Op. 15, mesures 53 à 55 : la reprise ornée', bpm: 66, startBpm: 46, practice: false })}
${W.links([W.informance('/content/pages/5-anyone-can-improvise', 'Anyone Can Improvise!'), W.informance('/content/pages/189-how-to-improvise', 'How to Improvise')], 'Pour aller plus loin')}
`,
  },
  {
    id: 'n2-im2', minutes: 20,
    title: 'Improviser sur une marche',
    summary: 'Un modèle de deux mesures, répété un degré plus bas : la marche improvise presque à ta place.',
    goals: ['Inventer un modèle mélodique sur deux accords.', 'Le transposer en suivant la marche harmonique.', 'Conclure par une cadence.'],
    body: W => `
<p>La marche par quintes (voir <a href="#/lecon/n2-th4">la théorie</a>) est un cadeau pour l’improvisateur : il suffit d’inventer un motif sur les deux premiers accords, puis de le recopier un degré plus bas, et encore un degré plus bas. L’oreille suit la logique et la musique avance toute seule.</p>
${W.score({ abc: MARCHE, title: 'Un modèle et ses reprises (la mineur)', bpm: 66, startBpm: 56, caption: 'Le modèle (mesures 1-2) : mi – ré – do – mi, puis fa – mi – ré – fa. Il est repris un degré plus bas (mesures 3-4), puis encore (mesures 5-6), avant la cadence.' })}
<h2>Méthode</h2>
<ol>
<li><b>Le modèle</b> : deux mesures, notes de l’accord sur les temps forts, une note de passage entre elles. Simple et reconnaissable.</li>
<li><b>Les reprises</b> : même rythme, même dessin, un degré plus bas. Ne cherche pas à varier : c’est la répétition qui fait la marche.</li>
<li><b>La sortie</b> : sur V7 – i, abandonne le modèle pour une vraie cadence (sol♯ – la).</li>
<li><b>Puis seulement, varier</b> : même modèle, autre rythme ; ou un ornement à chaque reprise.</li>
</ol>
${W.exo('Exercice', `<ol>
<li>Joue l’exemple avec l’accompagnateur (« Marche par quintes en la mineur »).</li>
<li>Invente ton propre modèle sur i – iv et transpose-le en improvisant.</li>
<li>Essaie un modèle en croches, puis un modèle avec une appoggiature sur chaque premier temps.</li>
</ol>`)}
${W.improv({ preset: 'n2-marche', presets: ['n2-marche'] })}
<h2>Dans ta pièce</h2>
<p>Le Con fuoco de l’op. 15 contient deux marches (mesures 41 à 48) : la♭ 7 → si♭ 7, un ton plus haut ; puis si♭ – mi♭ – la♭ – ré♭ à la basse, des quintes descendantes, comme la marche de cette leçon. Rejoue la réduction des mesures 45 à 48 (chapitre de théorie sur les marches) et improvise ton propre motif dessus.</p>

`,
  },
  {
    id: 'n2-im4', minutes: 20,
    title: 'Un prélude sur une basse descendante',
    summary: 'La basse de lamento, des voix qui avancent par demi-tons, une figuration de prélude.',
    goals: ['Connaître la basse de lamento.', 'Conduire les voix supérieures par notes communes et degrés conjoints.', 'Improviser une figuration et une mélodie sur cette basse.'],
    body: W => `
<p>Une basse qui descend lentement, par demi-tons, de la tonique à la dominante : c’est la <b>basse de lamento</b>, une formule très répandue depuis le XVIIe siècle. On l’entend dans la lamentation de Didon de Purcell (<i>Didon et Énée</i>) ; et chez Chopin, dans le Prélude op. 28 n° 4 en mi mineur, où les accords de la main gauche glissent par demi-tons sous une mélodie presque immobile.</p>
${W.score({ abc: LAMENTO, title: 'Prélude sur la basse fa – mi – mi♭ – ré – ré♭ – do', bpm: 60, startBpm: 50, pedal: PED8, pedalEnd: 32, caption: 'Une figuration en accords brisés, comme dans les préludes de Bach. Chaque accord garde le plus de notes possible du précédent ; les autres bougent d’un degré.' })}

<h2>La conduite des voix</h2>
<ul>
<li><b>Garder les notes communes</b> : do reste en place pendant les trois premiers accords ; la et fa descendent d’un degré, puis remontent.</li>
<li><b>Bouger par degrés</b> : de fa 7 à si♭, la septième mi♭ de la basse descend vers ré ; de si♭ majeur à si♭ mineur, seul ré devient ré♭.</li>
<li><b>Laisser la basse conduire</b> : c’est elle la mélodie principale de ce prélude ; fais-la entendre, chaque nouveau demi-ton est un événement.</li>
</ul>

<h2>Improviser dessus</h2>
<ol>
<li><b>Une autre figuration</b> : arpège montant et descendant, accords répétés, basse et accord… La même harmonie, un autre caractère.</li>
<li><b>Une mélodie</b> en valeurs longues au-dessus des accords. Un squelette possible : do – do – do – si♭ – si♭ – la – sol – fa, une note par mesure. Puis orne-le (leçon 1).</li>
<li><b>Une forme</b> : joue la grille deux fois, la seconde plus intense ou plus ornée, et termine sur un long accord de fa.</li>
</ol>
<h2>Dans ta pièce</h2>
<p>Aux mesures 16 à 19 de l’op. 15 (et 64 à 67 dans la reprise), la basse descend fa – mi – mi♭ – ré – do : presque la basse de ce prélude. Chopin y place une sixte augmentée (mesure 18) et des septièmes ; ton prélude, lui, garde des accords simples. Joue les deux à la suite.</p>
${W.improv({ preset: 'n2-lamento', presets: ['n2-lamento'] })}
${W.checklist({ id: 'n2-im4-check', title: 'Je vérifie', items: ['La basse descend sans interruption, un demi-ton par mesure.', 'Les voix supérieures avancent par notes communes et degrés conjoints, sans sauts inutiles.', 'Ma mélodie repose sur les notes de l’accord aux temps forts.', 'La fin se pose clairement sur do 7 puis fa.'] })}
`,
  },
  {
    id: 'n2-im3', minutes: 25,
    title: 'Improviser une forme ABA',
    summary: 'Deux caractères, une modulation, un retour : la forme du nocturne, improvisée.',
    goals: ['Improviser deux sections de caractère opposé.', 'Moduler vers le relatif majeur et revenir.', 'Tenir une forme complète sans s’arrêter.'],
    body: W => `
<p>Tu as tous les éléments : un accompagnement de nocturne, des mélodies construites sur l’harmonie, des ornements, des marches. Il reste à les organiser en une <b>forme</b>, comme l’op. 15 n° 1 : A, un contraste B, puis le retour de A.</p>
${W.diagram('form', { total: 21, sections: [
  { label: 'A', kind: 'A', from: 1, to: 8, key: 'fa mineur', note: 'chant, basse + accord' },
  { label: 'B', kind: 'B', from: 9, to: 16, key: 'la♭ majeur', note: 'autre caractère' },
  { label: '', kind: 'C', from: 17, to: 17, note: 'V7' },
  { label: 'A', kind: 'A', from: 18, to: 21, key: 'fa mineur', note: 'retour, orné' },
] }, 'Le plan de l’accompagnateur « Forme ABA » : huit mesures en fa mineur, huit en la♭ majeur, une mesure de dominante (do 7), et quatre mesures de retour.')}

<h2>Construire le contraste</h2>
<p>Comme dans le nocturne, change plusieurs paramètres à la fois en passant à B :</p>
<ul>
<li><b>Le mode</b> : fa mineur → la♭ majeur (le relatif, même armure : aucune note nouvelle).</li>
<li><b>Le registre</b> : plus aigu (ou plus grave), une autre couleur.</li>
<li><b>Le rythme</b> : des valeurs plus courtes, des notes répétées, ou au contraire un choral en accords.</li>
<li><b>La nuance et le toucher</b> : plus clair, plus léger ou plus intense.</li>
</ul>

<h2>Le retour</h2>
<p>La mesure de transition est la dominante de fa mineur : do 7. Depuis l’accord de la♭ majeur, deux notes suffisent pour obtenir l’accord de do : la♭ descend vers sol, mi♭ monte vers mi♮, do reste en place. Puis do descend vers si♭ : voici do 7.</p>
${W.score({ abc: RETOUR, title: 'De la♭ majeur vers fa mineur', bpm: 56, pedal: [0, 4, 6, 8], pedalEnd: 12, caption: 'La♭ – do – mi♭ devient sol – do – mi♮, puis do 7, puis fa mineur. Au retour de A, reprends ton thème, mais orne-le : le voyage l’a changé.' })}
${W.improv({ preset: 'n2-aba', presets: ['n2-aba'] })}
${W.checklist({ id: 'n2-im3-check', title: 'Je vérifie', items: ['Je ne m’arrête pas, même aux changements de section.', 'B a un vrai contraste de caractère, pas seulement d’accords.', 'La mesure de do 7 prépare le retour (la sensible mi♮ monte vers fa).', 'Le retour de A rappelle le thème du début, varié ou orné.'] })}
`,
  },
];
