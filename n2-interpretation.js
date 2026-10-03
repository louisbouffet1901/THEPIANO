// Niveau 2 — Interprétation
import { OP15, CLAIR } from './content-excerpts.js';
import { AN } from './content-analyses.js';

// Op. 15 n° 1, mesures 1 à 8, avec l'analyse harmonique (vérifiée note à note comme OP15.e1)
const OP15_ANALYSE = `X:1
M:3/4
L:1/16
K:F
%%barnumbers 1
%%setbarnb 0
%%score {RH | (LH1 LH2 LH3)}
V:RH clef=treble
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=up
V:LH3 clef=bass stem=down
[V:RH] (c4 | f8 e4 | d4 e4 c4) |
[V:LH1] z4 | F4 F4 E4 | D4 E4 C4 |
[V:LH2] x4 | (3A,2C2C2 (3A,2C2C2 (3A,2C2C2 | (3A,2B,2B,2 (3G,2B,2B,2 (3G,2B,2B,2 |
[V:LH3] x4 | "_I"F,12 | "_IV – V7"F,12 |
[V:RH] (d3e f4 g4 | a12) | (g4 a3g (3g2f2e2 |
[V:LH1] D4 E4 C4 | C4 ^C4 D4 | =B,4 _B,4 _B,4 |
[V:LH2] (3G,2B,2B,2 (3G,2B,2B,2 (3G,2B,2B,2 | (3F,2A,2A,2 (3G,2A,2A,2 (3F,2A,2A,2 | (3F,2G,2G,2 (3F,2G,2G,2 (3E,2G,2G,2 |
[V:LH3] "_ii7 – V7"F,12 | "_I"F,4 "_V7/vi"E,4 "_vi"D,4 | "_V7/V"D,4 "_iiø7"_D,4 "_V7"C,4 |
[V:RH] f6 e2 (3d2e2f2) | (e8 (3e2d2A2 | =B8) !p!(3:2:3(c2d3c) |]
[V:LH1] A,4 A,4 A,4 | ^G,4 A,4 x4 | x4 E4 E4 |]
[V:LH2] (3E,2F,2F,2 (3D,2F,2F,2 (3D,2F,2F,2 | (3D,2E,2E,2 (3C,2E,2E,2 (3[F,,=B,,A,]2D,2D,2 | (3[E,,=B,,^G,]2=B,2B,2 (3^G,2B,2B,2 (3_B,2C2C2 |]
[V:LH3] "_I"C,4 "_iiø7/iii"=B,,8 | "_V7/iii"=B,,4 "_iii"A,,4 "_iiø7/iii"x4 | "_V/iii"x8 "_V7"G,4 |]`;

// Phrasé guidé par l'harmonie (mesures 0 à 8 ; temps en noires, mesure 1 = temps 1)
const HARM_DYN = {
  rh: [[0, 0.88], [7, 1.0], [10, 1.12], [13, 1.15], [14, 0.97], [15, 1.02], [16, 0.95], [18, 1.0], [19, 0.98], [22, 1.08], [23.8, 1.0], [24, 0.76], [25, 0.76]],
  lh: [[0, 0.9], [7, 1.0], [10, 1.08], [13, 1.1], [14, 0.95], [15, 1.0], [16, 0.94], [19, 0.96], [22, 1.04], [24, 0.8], [25, 0.8]],
};
const HARM_TEMPO = [[0, 1], [7, 1.02], [10, 1.04], [13.5, 1.0], [14, 0.93], [15, 1.0], [19, 1.0], [22, 0.92], [24, 0.86], [25, 0.95]];

export default [
  {
    id: 'n2-i1', minutes: 20,
    title: 'Le contraste : deux mondes dans une pièce',
    summary: 'Quand tout change d’une section à l’autre : construire deux caractères opposés, et les relier.',
    goals: ['Identifier les paramètres d’un contraste.', 'Construire les deux caractères de l’op. 15 n° 1.', 'Préparer les deux transitions.'],
    body: W => `
<p>Le Nocturne op. 15 n° 1 met face à face deux mondes : un chant tranquille en fa majeur et un orage en fa mineur. Un contraste réussi ne se limite pas à « plus vite et plus fort » : presque tous les paramètres changent en même temps. Pour l’interprète, il s’agit de devenir deux personnages différents… et de passer de l’un à l’autre.</p>

<h2>Ce qui change</h2>
<table>
<thead><tr><th></th><th>Andante cantabile (mesures 1 à 24)</th><th>Con fuoco (mesures 25 à 48)</th></tr></thead>
<tbody>
<tr><td>Mode</td><td>fa majeur</td><td>fa mineur : même tonique, autre mode (tonalité homonyme)</td></tr>
<tr><td>Tempo</td><td>calme : ♩ = 69</td><td>plus animé : ♩ = 84 (indications de la partition)</td></tr>
<tr><td>Nuances</td><td><i>semplice e tranquillo</i>, <i>p</i>, <i>dolcissimo</i>, <i>delicatissimo</i></td><td><i>f</i>, <i>fz</i>, des crescendos jusqu’au <i>ff</i></td></tr>
<tr><td>Registre</td><td>le médium, les deux mains proches</td><td>tout le clavier, des traits qui plongent dans le grave</td></tr>
<tr><td>Texture</td><td>mélodie accompagnée, main gauche à trois voix</td><td>doubles notes agitées, traits, octaves</td></tr>
<tr><td>Toucher</td><td>legato, poids léger, son rond</td><td>rotation, attaques nettes, poids du bras</td></tr>
<tr><td>Caractère</td><td>un chant intime</td><td><i>con fuoco</i> : « avec feu », tourmenté</td></tr>
</tbody></table>

<h2>Les deux transitions</h2>
<h3>Mesures 24 → 25 : la rupture</h3>
<p>L’Andante s’éteint (<i>smorzando</i>) et s’interrompt au milieu du retour du thème, sur une harmonie de dominante (do 7 au-dessus de la basse fa), et s’arrête sur un <b>silence avec point d’orgue</b>. Puis le Con fuoco éclate. Ce silence fait partie de la musique : tiens-le assez longtemps pour que la rupture soit entendue, sans casser la tension. Pendant le silence, la main droite prend déjà sa position (la♭ – do – fa – la♭) pour attaquer <i>f</i>.</p>
${W.score({ abc: OP15.e2, title: 'La fin de l’Andante (mesures 17 à 24)', bpm: 69, startBpm: 60, caption: 'Le thème revient à la mesure 22… et s’arrête net sur le point d’orgue.' })}
${W.score({ abc: OP15.e3, title: 'L’entrée du Con fuoco (mesures 25 à 28)', bpm: 84, startBpm: 60 })}

<h3>Mesures 45 → 49 : la dissolution</h3>
<p>Le retour est préparé : la mélodie descend par degrés (mesures 45 à 47), Chopin écrit <i>rall. e calando</i>, fa 7 conduit à si♭ mineur et la mesure 48, regroupée à 6/8, s’attarde sur cet accord pendant que la mélodie glisse si♭ – la – sol. Fa majeur revient alors sans passer par la dominante, comme une cadence plagale. Ici, rien de brutal : ralentis peu à peu, diminue, et change de toucher avant même la première note de l’Andante (<i>sotto voce</i>). Le retour doit sonner comme un souvenir, plus intime encore que le début.</p>

${W.warn('Le piège des tempos extrêmes', '<p>Un Andante qui traîne perd son chant ; un Con fuoco trop rapide rend les sextolets confus. Le contraste vient du caractère — toucher, nuance, registre — bien plus que de l’écart de tempo.</p>')}
${W.exo('Exercice', `<ol>
<li>Joue les mesures 21 à 24, compte le silence, attaque la mesure 25. Recommence en variant la durée du silence : laquelle te semble la plus juste ?</li>
<li>Joue la mesure 24, puis la 25 en <i>p</i> : entends-tu ce qui manque ? Puis normalement.</li>
<li>Enregistre-toi des mesures 17 à 32 : le changement de monde s’entend-il dès la première note du Con fuoco ?</li>
</ol>`)}
${W.checklist({ id: 'n2-i1-check', title: 'Je vérifie', items: ['Les deux sections ont chacune leur toucher, pas seulement leur tempo.', 'Le silence de la mesure 24 est tenu et préparé.', 'La transition des mesures 45 à 48 ralentit et diminue progressivement.', 'La reprise (mesure 49) est plus intime que le début.'] })}
`,
  },

  {
    id: 'n2-i2', minutes: 20,
    title: 'L’harmonie guide l’expression',
    summary: 'Les bonnes nuances ne se décident pas au hasard : la plupart se lisent dans l’harmonie.',
    goals: ['Relier tension harmonique, nuance et tempo.', 'Repérer dissonances, résolutions et accords de couleur.', 'Construire le phrasé des mesures 1 à 8 de l’op. 15 n° 1 à partir de l’harmonie.'],
    body: W => `
<p>Les grands interprètes semblent improviser leurs nuances ; en réalité, la plupart découlent de l’harmonie. Comprendre où la musique se tend et où elle se détend donne un phrasé naturel, que l’auditeur ressent sans pouvoir l’expliquer.</p>

<h2>Trois règles</h2>
<ol>
<li><b>La dissonance appuie, la résolution s’efface.</b> Une appoggiature, un retard, une septième reçoivent un peu plus de poids ; la note de résolution, plus douce, prolonge le geste.</li>
<li><b>Plus l’harmonie s’éloigne de la tonique, plus la tension monte.</b> Dominantes secondaires, accords altérés, basse qui bouge : le son s’intensifie, le tempo avance à peine. Le retour à la tonique détend.</li>
<li><b>Un accord inattendu se colore.</b> Un emprunt au mode mineur, une cadence rompue, une modulation lointaine : souvent plus doux, comme une ombre qui passe, avec un léger temps de plus.</li>
</ol>

<h2>L’exemple des mesures 1 à 8</h2>
${W.diagram('tension', { chords: ['I', 'V7', 'V7/vi', 'vi', 'V7/V', 'iiø7', 'V7', 'V7/iii', 'iii', 'V7', 'I'], values: [1, 2.4, 3.2, 2.4, 3.5, 3.8, 4.3, 3.4, 2.6, 3.8, 1], title: 'Tension harmonique, mesures 1 à 9 (schéma qualitatif)' }, 'Les trois premières mesures restent sur la basse fa (pédale de tonique) : calme. Dès la mesure 4, la basse descend et des dominantes secondaires colorent chaque étape : la tension monte jusqu’à la mesure 5. L’<a href="#/lecon/n2-i4">analyse complète</a> détaille chaque accord.')}
<ul>
<li><b>Mesures 1 à 3</b> : tout repose sur la basse fa. Pas de poussée ; un chant simple.</li>
<li><b>Mesures 4 et 5</b> : la mélodie atteint son sommet (la, mesure 4) et la basse se met à descendre. Les dominantes secondaires (V7 de vi, V7 de V) poussent vers l’avant : léger crescendo.</li>
<li><b>Mesure 5, 2e temps</b> : le ré♭ de la basse est emprunté à fa mineur (accord iiø7). C’est la première ombre de la pièce — et l’annonce discrète du Con fuoco. Adoucis, prends un instant.</li>
<li><b>Mesures 7 et 8</b> : un détour par la mineur ; Chopin demande <i>poco cresc. e ritenuto</i> : la phrase s’élargit vers le si♮ de la mesure 8, puis do 7 ramène vers fa et le thème repart <i>p dolcissimo</i>.</li>
</ul>
<p>Ce n’est pas une coïncidence : les nuances écrites par Chopin suivent exactement cette lecture harmonique — crescendo vers la mesure 4, diminuendo dans la mesure 5, élargissement aux mesures 7 et 8.</p>

${W.score({ abc: OP15.e1, title: 'Mesures 1 à 8 : deux interprétations', bpm: 66, startBpm: 60, variants: [{ label: 'Nuances plates', flat: true }, { label: 'Phrasé guidé par l’harmonie', dyn: HARM_DYN, tempoMap: HARM_TEMPO }], caption: 'La seconde version suit les trois règles : montée vers la mesure 5, ombre sur le ré♭, détente à la fin. Les écarts sont petits ; c’est leur cohérence qui compte.' })}

${W.exo('À faire', `<ol>
<li>Joue la basse seule des mesures 1 à 9 et chante la mélodie : où la basse bouge-t-elle ? Où se repose-t-elle ?</li>
<li>Joue les accords en blocs (une harmonie par temps) en exagérant les trois règles.</li>
<li>Reviens au texte complet en gardant l’intention, mais à moitié moins marquée.</li>
</ol>`)}
${W.tip('Ne pas tout souligner', '<p>Si chaque accord reçoit une intention, plus rien ne ressort. Choisis par phrase un ou deux moments harmoniques forts — ici le ré♭ de la mesure 5 — et laisse le reste couler.</p>')}
${W.links([W.informance('/content/pages/206-harmony-history-style', 'Harmony, History & Style')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-i3', minutes: 20,
    title: 'Les ornements chopiniens',
    summary: 'Des vocalises écrites : les jouer comme une voix qui chante, sur le temps et sans raideur.',
    goals: ['Comprendre l’origine vocale des ornements de Chopin.', 'Placer les petites notes sur le temps, avec la basse.', 'Jouer une fioriture souplement, la main gauche restant stable.'],
    body: W => `
<p>Chopin adorait l’opéra italien de son temps, Bellini et les grands chanteurs qu’il entendait à Paris. Ses ornements sont des <b>vocalises écrites</b> : ils doivent sonner chantés, souples, presque improvisés — jamais comme des exercices de vélocité. On les entend, on ne les remarque pas.</p>

<h2>Les petites notes : sur le temps</h2>
<p>Selon les témoignages de ses élèves, Chopin faisait commencer les petites notes (appoggiatures, groupes, mordants) <b>sur le temps, avec la basse</b>, et non avant. La note principale arrive donc un peu après le temps. C’est le cas du groupe la – sol – fa♯ – sol de la mesure 18 de l’op. 15 n° 1 : il part avec le 2e temps de la main gauche.</p>
${W.score({ abc: OP15.e2, title: 'Op. 15 n° 1, mesures 17 à 24', bpm: 66, startBpm: 50, caption: 'Mesure 18 : le groupe de petites notes, sur le temps. Mesure 20 : la fioriture de huit notes, <i>dolcissimo</i>.' })}

<h2>Les fioritures : des points de rencontre</h2>
${W.diagram('meeting', { n: 8, beats: 1, lhPer: 3, caption: 'Mesure 20 : huit notes contre un temps de triolets. Départ et arrivée avec la main gauche ; entre les deux, la main droite est libre.' })}
<ol>
<li><b>Le squelette</b> : joue la mélodie sans l’ornement (le ré aigu, puis le do de la mesure suivante) pour savoir d’où il part et où il arrive.</li>
<li><b>Le rythme exact</b>, lentement : les huit notes régulières contre les trois notes du triolet, sans chercher à les aligner au milieu.</li>
<li><b>Les points de rencontre</b> : seuls le départ et l’arrivée tombent avec la main gauche, qui ne ralentit pas.</li>
<li><b>La liberté</b> : commence la vocalise un peu en retenant, accélère au milieu, ralentis vers l’arrivée — comme une chanteuse qui respire.</li>
</ol>
${W.score({ abc: OP15.e5, title: 'Op. 15 n° 1, mesures 53 à 55 : le septolet', bpm: 66, startBpm: 46, caption: 'Sept notes dans un temps de la reprise : même méthode. Jouées en douceur, elles semblent une variation improvisée sur le thème du début.' })}

<h2>Règles de goût</h2>
<ul>
<li>L’ornement est <b>plus doux</b> que la note qu’il orne ; il n’en a pas l’importance.</li>
<li>Il reste <b>legato</b> et lié à la phrase : pas de respiration avant lui.</li>
<li>La <b>main gauche ne s’arrête pas</b> pour l’attendre : c’est elle qui garantit la pulsation.</li>
<li>Pense <b>vocal</b> : chante-le d’abord. Si tu ne peux pas le chanter avec souplesse, ralentis.</li>
</ul>
${W.tip('Dans l’op. 55 n° 1', '<p>Tu as déjà rencontré ces ornements au niveau 1 : le quintolet de la mesure 14 et le septolet de la mesure 44. Reprends-les avec cette méthode (<a href="#/piece/op55-1">page de la pièce</a>).</p>')}
${W.links([W.informance('/content/browse/technique/ornaments', 'Ornaments', 'Online Academy — leçons sur les ornements (en anglais)')], 'Pour aller plus loin')}
`,
  },

  {
    id: 'n2-i4', minutes: 25,
    title: 'Analyse de l’op. 15 n° 1',
    summary: 'Le plan, l’harmonie des huit premières mesures, et ce qu’ils changent au jeu.',
    goals: ['Connaître le plan de la pièce, phrase par phrase.', 'Lire l’harmonie des mesures 1 à 8.', 'En tirer des décisions d’interprétation.'],
    body: W => `
<h2>Le plan, phrase par phrase</h2>
${W.diagram('form', { total: 74, sections: [
  { label: 'a', kind: 'A', from: 1, to: 8, key: 'fa majeur' },
  { label: 'a′', kind: 'A', from: 9, to: 16 },
  { label: 'b', kind: 'A', from: 17, to: 24 },
  { label: 'x', kind: 'B', from: 25, to: 28, key: 'fa mineur' },
  { label: 'y', kind: 'B', from: 29, to: 36 },
  { label: 'x', kind: 'B', from: 37, to: 40 },
  { label: 'y′', kind: 'B', from: 41, to: 48 },
  { label: 'a', kind: 'A', from: 49, to: 56, key: 'fa majeur' },
  { label: 'a′', kind: 'A', from: 57, to: 64 },
  { label: 'b', kind: 'A', from: 65, to: 72 },
  { label: '', kind: 'coda', from: 73, to: 74 },
] }, 'A (Andante cantabile) : a 1-8, a′ 9-16, b 17-24. B (Con fuoco) : x 25-28, y 29-36, x 37-40, y′ 41-48. A′ (a Tempo primo) : a 49-56, a′ 57-64, b 65-72, deux accords arpégés 73-74.')}
<ul>
<li><b>A</b> (mesures 1 à 24) : deux phrases presque identiques (a et a′), puis une phrase b plus chromatique, qui culmine sur le ré aigu accentué de la mesure 20 — la note la plus haute de l’Andante — suivie de la fioriture <i>dolcissimo</i>. Le thème revient (mesure 22) et s’interrompt sur un silence.</li>
<li><b>B</b> (mesures 25 à 48) : deux grandes vagues. Chaque fois, quatre mesures d’orage (x : doubles notes et traits), puis huit mesures où la mélodie passe d’abord à la main gauche avant de revenir à la main droite (y : à la main gauche aux mesures 29-30, au-dessus d’une longue pédale de ré♭ ; y′ : dans le grave, en partie en octaves, mesures 41 à 44). Les mesures à 6/8 (36 et 48) regroupent leurs six croches en deux temps : la fin de chaque vague s’élargit, sans que la mesure dure plus longtemps.</li>
<li><b>A′</b> (mesures 49 à 74) : la reprise, ornée (septolet mesure 54, petites notes mesure 56), qui conclut sur deux accords arpégés depuis la basse : do 7 au-dessus de fa, puis fa majeur.</li>
</ul>

<h2>L’harmonie des mesures 1 à 8</h2>
${W.score({ abc: OP15_ANALYSE, analysis: AN.op15_1_8, title: 'Mesures 1 à 8 analysées', bpm: 66, startBpm: 56, practice: false, caption: 'Chiffrage sous la basse. « V7/vi » se lit « septième de dominante du 6e degré » : voir <a href="#/lecon/n2-th2">les dominantes secondaires</a>.' })}
<table>
<thead><tr><th>Mesures</th><th>Basse</th><th>Ce qui se passe</th></tr></thead>
<tbody>
<tr><td>1 à 3</td><td>fa, tenu</td><td>Pédale de tonique : au-dessus, I – IV – V7 – ii7 – V7. Rien ne bouge vraiment ; la voix en noires double la mélodie (mesures 1-2).</td></tr>
<tr><td>4</td><td>fa – mi – ré</td><td>I, puis V7 de vi (do♯ !), puis vi : premier mouvement de la basse, sous le la tenu, sommet de la mélodie.</td></tr>
<tr><td>5</td><td>ré – ré♭ – do</td><td>V7 de V (si♮), puis iiø7 avec ré♭ emprunté au mode mineur, puis V7.</td></tr>
<tr><td>6</td><td>do – si</td><td>I (sur la basse do), puis si – ré – fa – la : iiø7 de la mineur (iiø7/iii), qui prépare la suite.</td></tr>
<tr><td>7 et 8</td><td>si – la – fa – mi, puis sol</td><td>V7 de iii, iii (la mineur), de nouveau iiø7/iii, mi majeur (V/iii), puis do 7 qui ramène à fa (mesure 9).</td></tr>
</tbody></table>
<p>Retiens l’essentiel : une <b>basse qui descend pas à pas</b> (fa → la, mesures 4 à 7) pendant que des <b>dominantes secondaires</b> colorent chaque étape. Et le ré♭ de la mesure 5 : une ombre de fa mineur, qui annonce le Con fuoco.</p>

<h2>Ce que l’analyse change au jeu</h2>
<ul>
<li><b>Mesures 1 à 3</b> : la pédale de tonique impose le calme ; ne pousse pas.</li>
<li><b>Mesures 4 et 5</b> : la basse se met en marche ; fais-la entendre, c’est elle qui conduit la tension.</li>
<li><b>Le ré♭ de la mesure 5</b> : l’accord le plus coloré de la phrase ; un léger retenu, un son plus doux.</li>
<li><b>Mesures 7 et 8</b> : la musique s’éloigne vers la mineur ; Chopin écrit <i>poco cresc. e ritenuto</i> : élargis vers la mesure 8, puis repars <i>p dolcissimo</i>.</li>
<li><b>À grande échelle</b> : garde ton sommet pour la mesure 20 dans A, et pour les vagues de B ; la reprise reste plus intime que le début.</li>
</ul>
${W.exo('À faire', `<ol>
<li>Note sur ta partition le plan (a, a′, b, x, y…) et les numéros de mesure.</li>
<li>Recopie le chiffrage des mesures 1 à 8 sous la basse.</li>
<li>Joue la basse seule des mesures 1 à 9 en chantant la mélodie ; puis les accords en blocs.</li>
<li>Repère dans la phrase a′ (mesures 9 à 16) ce qui change par rapport à a.</li>
</ol>`)}
`,
  },

  {
    id: 'n2-i5', minutes: 20,
    title: 'Debussy : le son avant la note',
    summary: 'Après Chopin, une autre façon de faire sonner le piano : couleur, résonance, nuances extrêmes.',
    goals: ['Comprendre ce qui distingue l’écriture de Debussy de celle de Chopin.', 'Travailler un toucher de couleur.', 'Utiliser la pédale comme une résonance.'],
    body: W => `
<p>« Il faut faire oublier que le piano a des marteaux » : la phrase est attribuée à Debussy par ses interprètes. Chez lui, la note isolée compte moins que le <b>son d’ensemble</b> — une couleur, une résonance qui se prolonge et se transforme. <i>Clair de lune</i> est une excellente porte d’entrée dans ce monde.</p>

<h2>Deux manières de faire sonner le piano</h2>
<table>
<thead><tr><th></th><th>Chopin (op. 15 n° 1)</th><th>Debussy (Clair de lune)</th></tr></thead>
<tbody>
<tr><td>Le chant</td><td>une mélodie soliste, comme une voix</td><td>souvent une ligne fondue dans des accords (mesures 15 à 18)</td></tr>
<tr><td>L’harmonie</td><td>des tensions qui se résolvent</td><td>des accords choisis pour leur couleur, parfois enchaînés en parallèle</td></tr>
<tr><td>La pédale</td><td>changée avec l’harmonie et la basse</td><td>plus longue, pour laisser vibrer ; changements partiels</td></tr>
<tr><td>Le rubato</td><td>la main droite s’étire, la gauche reste stable</td><td>le plus souvent, toute la texture respire ensemble</td></tr>
<tr><td>Les nuances</td><td>du <i>pp</i> au <i>ff</i>, le chant au-dessus</td><td>surtout <i>pp</i> et <i>ppp</i>, des crescendos longs et rares</td></tr>
<tr><td>Le rythme</td><td>la pulsation guide</td><td>duolets et notes liées : la barre de mesure s’efface</td></tr>
</tbody></table>

<h2>Le toucher</h2>
<ul>
<li><b>Appuyer plutôt que frapper</b> : le doigt part de la touche et l’enfonce lentement (voir <a href="#/lecon/n2-t4">le pianissimo</a>).</li>
<li><b>La pulpe du doigt</b>, un doigt un peu plus à plat, donne un son plus velouté pour les accords doux.</li>
<li><b>Accords égaux, puis voix supérieure</b> : d’abord tous les sons au même niveau, fondus ; ensuite seulement, la note du haut légèrement en dehors.</li>
</ul>
${W.score({ abc: CLAIR.e2, title: 'Tempo rubato : accords parallèles (mesures 15 à 18)', bpm: 40, startBpm: 34, caption: 'Les deux mains jouent des accords qui se déplacent ensemble ; dans la partition, chacun est marqué d’un tiret (<i>tenuto</i>) : appuyé, lié, sans dureté. La basse grave est prolongée par la pédale.' })}

<h2>La pédale de résonance</h2>
<p>Debussy note peu la pédale, mais sa musique en a besoin presque tout le temps. On la change avec l’harmonie, en écoutant ce qui reste : parfois un changement partiel (relever à moitié, puis rabaisser) suffit à éclaircir le son tout en gardant la basse. Si ta pédale ne permet pas la demi-pédale, des changements rapides et fréquents donnent un résultat proche.</p>
${W.score({ abc: CLAIR.e1, title: 'Mesures 1 à 4 : avec et sans pédale', bpm: 40, startBpm: 36, variants: [{ label: 'Sans pédale', balance: { rh: 0.62, lh: 0.5 } }, { label: 'Une pédale par mesure', balance: { rh: 0.62, lh: 0.5 }, pedal: [0, 4.5, 9, 13.5], pedalEnd: 18 }], caption: 'Avec la pédale, les tierces se prolongent en un halo. Écoute si la mesure précédente « traîne » encore dans la suivante.' })}

<h2>Les duolets</h2>
<p>Dans une mesure à 9/8, le duolet place deux notes dans le temps de trois croches : chaque note vaut une croche et demie. Compte d’abord en croches et place-les exactement ; puis oublie le comptage et laisse la ligne flotter au-dessus de la barre de mesure.</p>

${W.checklist({ id: 'n2-i5-check', title: 'Je vérifie, dans Clair de lune', items: ['Le pianissimo du début est égal et timbré.', 'Les accords des mesures 15 à 18 sont fondus, la voix du haut légèrement en dehors.', 'La pédale prolonge sans brouiller : j’écoute chaque changement.', 'Les duolets flottent sans perdre la pulsation d’ensemble.'] })}
${W.listen([
  W.yt('Debussy Clair de lune Gieseking', 'Walter Gieseking', 'Son velouté, pédale très fine'),
  W.yt('Debussy Clair de lune Samson François', 'Samson François', 'Rubato plus libre'),
], 'Écouter')}
`,
  },
];
