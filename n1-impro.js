// Niveau 1 — Improvisation (V4) : une idée nouvelle par leçon, jamais répétée ensuite.
// 1. le motif  2. question et réponse  3. les notes de l'accord  4. passages et broderies  5. l'appoggiature (le soupir)
// 6. style : la romance en arpèges mineurs (Liszt)  7. style : le nocturne, sur les harmonies de l'op. 55  8. la période.
// Chaque leçon : l'essentiel en tête, la boîte à outils (gamme, accords, main gauche écrite), un modèle phrasé,
// trois étapes chronométrées, le jeu guidé de l'accompagnateur (question – réponse ou squelette), un critère de réussite.
// Les exemples sont écrits par tools/impro_examples.py : chaque note des temps forts y est vérifiée contre l'accord.
import { OP55 } from './content-excerpts.js';

const EX_MOTIF = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^motif"^c2 c2 ^d4 | "^répété"^c2 c2 ^d4 | "^déplacé"^f2 f2 ^g4 | "^réponse"^g2 ^f2 ^d4 | "^motif"^c2 c2 ^d4 | "^varié"^c c c2 ^d4 | "^sommet"^g2 ^a2 g2 ^d2 | "^fin"^c2 ^d2 ^f4 |]
[V:LH] ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 | ^F,,2 ^C,2 ^F,2 C,2 |]`;
const EX_QR_PENTA = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^question"A2 c2 d4 | e2 d2 e4 | "^réponse"A2 c2 d4 | d2 c2 A4 | "^question"e3 d c4 | d3 e g4 | "^réponse"e3 d c4 | d3 c A4 |]
[V:LH] A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 | A,,2 E,2 A,2 E,2 |]`;
const EX_ACCORDS = `X:1
M:4/4
L:1/8
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^squelette : une note de l’accord par mesure"e8 | f8 | d8 | c8 | "^habillé : le squelette reste au 1er temps"e4 g2 e2 | f4 a2 f2 | d2 f2 B4 | c8 |]
[V:LH] "_I"C,2 [G,CE]2 G,,2 [G,CE]2 | "_IV"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_V7"G,,2 [F,G,B,D]2 D,,2 [F,G,B,D]2 | "_I"C,2 [G,CE]2 G,,2 [G,CE]2 | "_I"C,2 [G,CE]2 G,,2 [G,CE]2 | "_IV"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_V7"G,,2 [F,G,B,D]2 D,,2 [F,G,B,D]2 | "_I"C,2 [G,CE]2 G,,2 [G,CE]2 |]`;
const EX_SQUELETTE = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^squelette"e8 | f8 | B8 | c8 |]
[V:LH] "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 |]`;
const EX_PASSAGES = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^notes de passage (2e et 4e temps)"e2 d2 c2 d2 | f2 e2 d2 c2 | B2 c2 d2 B2 | c2 B2 A4 |]
[V:LH] "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 |]`;
const EX_BRODERIES = `X:1
M:4/4
L:1/8
K:Am
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^broderies et passages en croches"e f e d c B c d | f g f e d e d c | B c B A ^G A B d | c B A ^G A4 |]
[V:LH] "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 | "_iv"D,,2 [F,A,D]2 D,,2 [F,A,D]2 | "_V7"E,,2 [^G,B,DE]2 E,,2 [G,B,DE]2 | "_i"A,,2 [A,CE]2 E,,2 [A,CE]2 |]`;
const EX_SOUPIRS = `X:1
M:4/4
L:1/8
K:Em
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^app."c4 B2 A2 | "^app."d4 c2 B2 | "^app."B4 A2 c2 | "^app."e4 ^d4 | "^app."f4 e2 B2 | "^app."d4 c2 A2 | "^app."c4 B2 A2 | "^app."F2 E6 |]
[V:LH] "_i"(3E,,B,,E, (3G,E,B,, (3E,,B,,E, (3G,E,B,, | "_VI"(3C,,G,,C, (3E,C,G,, (3C,,G,,C, (3E,C,G,, | "_iv"(3A,,E,A, (3CA,E, (3A,,E,A, (3CA,E, | "_V7"(3B,,,F,,A,, (3^D,A,,F,, (3B,,,F,,A,, (3D,A,,F,, | "_i"(3E,,B,,E, (3G,E,B,, (3E,,B,,E, (3G,E,B,, | "_iv"(3A,,E,A, (3CA,E, (3A,,E,A, (3CA,E, | "_V7"(3B,,,F,,A,, (3^D,A,,F,, (3B,,,F,,A,, (3D,A,,F,, | "_i"(3E,,B,,E, (3G,E,B,, (3E,,B,,E, (3G,E,B,, |]`;
const EX_ROMANCE = `X:1
M:3/4
L:1/8
K:Em
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] B4 G2 | c3 B A2 | G2 B2 e2 | "^suspension"f4 ^d2 | g3 f e2 | "^soupir"d2 c2 A2 | B3 A F2 | "^conclusion"E6 |]
[V:LH] "_i"E,, B,, E, G, B, G, | "_iv"A,, E, A, C E C | "_i"E,, B,, E, G, B, G, | "_V"B,,, F,, B,, ^D, F, D, | "_VI"C,, G,, C, E, G, E, | "_iv"A,,, E,, A,, C, E, C, | "_V7"B,,, F,, A,, ^D, F, D, | "_i"E,, B,, E, G, B, G, |]`;
const EX_ROMANCE_MG = `X:1
M:3/4
L:1/8
K:Em
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] z6 | z6 | z6 | z6 | z6 | z6 | z6 | z6 |]
[V:LH] "_i"E,, B,, E, G, B, G, | "_iv"A,, E, A, C E C | "_i"E,, B,, E, G, B, G, | "_V"B,,, F,, B,, ^D, F, D, | "_VI"C,, G,, C, E, G, E, | "_iv"A,,, E,, A,, C, E, C, | "_V7"B,,, F,, A,, ^D, F, D, | "_i"E,, B,, E, G, B, G, |]`;
const EX_NOCT_SQ = `X:1
M:4/4
L:1/8
K:Fm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^un autre squelette"A4 B4 | c4 B4 | A4 G4 | A4 G4 |]
[V:LH] "_i  VII6"F,,2 [A,CF]2 G,,2 [E,B,E]2 | "_III  V6/5"A,,2 [CA]2 =E,,2 [B,CG]2 | "_i  VII6"F,,2 [A,CF]2 G,,2 [E,B,E]2 | "_III  V6/5"A,,2 [CA]2 =E,,2 [B,CG]2 |]`;
const EX_NOCT_HAB = `X:1
M:4/4
L:1/8
K:Fm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^habillé : broderies (sol, si♮), passages"A2 G2 B2 A2 | c2 =B c _B4 | A2 F2 G4 | A3 B G2 =E2 |]
[V:LH] F,,2 [A,CF]2 G,,2 [E,B,E]2 | A,,2 [CA]2 =E,,2 [B,CG]2 | F,,2 [A,CF]2 G,,2 [E,B,E]2 | A,,2 [CA]2 =E,,2 [B,CG]2 |]`;
const EX_PERIODE = `X:1
M:4/4
L:1/8
K:Fm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^question (antécédent)"c4 f2 e2 | d3 c B4 | A2 c2 f2 e2 | "^demi-cadence"c6 z2 | "^réponse (conséquent)"c4 f2 e2 | d3 c B2 f2 | "^sommet"g3 f =e4 | "^cadence parfaite"f6 z2 |]
[V:LH] "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_iv"B,,2 [F,B,D]2 F,,2 [F,B,D]2 | "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_V"C,,2 [G,C=E]2 C,,2 [G,CE]2 | "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 | "_iv"B,,2 [F,B,D]2 F,,2 [F,B,D]2 | "_V7"C,,2 [G,B,C=E]2 C,,2 [G,B,CE]2 | "_i"F,,2 [F,A,C]2 C,,2 [F,A,C]2 |]`;

// Phrasé des exemples : nuances (main droite) et respiration (carte de tempo), en noires depuis le début
const PH_ROMANCE = {
  dyn: { rh: [[0, 0.8], [6, 1.0], [9, 1.14], [11.5, 0.95], [12, 0.82], [13, 1.16], [15, 1.02], [18, 0.88], [21, 0.8], [24, 0.7]], lh: [[0, 0.72], [24, 0.62]] },
  tempoMap: [[0, 1], [9, 1.03], [11.2, 0.86], [12, 1], [13, 0.97], [20, 1], [22.5, 0.86], [24, 0.72]],
};
const PH_PERIODE = {
  dyn: { rh: [[0, 0.82], [4, 1.02], [6, 0.96], [12, 0.86], [16, 0.8], [20, 0.95], [24, 1.18], [26, 1.04], [28, 0.86], [32, 0.76]], lh: [[0, 0.75], [32, 0.65]] },
  tempoMap: [[0, 1], [13, 1], [15.5, 0.86], [16, 1], [24, 0.98], [28, 0.95], [31, 0.8], [32, 0.7]],
};

export default [
  /* ================================================================ 1 */
  {
    id: 'n1-im-lancer', minutes: 15,
    title: 'Le motif : improviser avec trois notes',
    summary: 'Une pulsation qui ne s’arrête pas, une petite idée rythmique, et des touches noires où aucune note n’est fausse.',
    essentials: [
      'Improviser, c’est inventer <b>sans t’arrêter</b> : la pulsation passe avant la beauté des notes.',
      'Un <b>motif</b> (3 ou 4 notes, un rythme reconnaissable) suffit pour faire de la musique : on le <b>répète</b>, on le <b>déplace</b>, on le <b>varie</b>.',
      'Les <b>silences</b> font partie de la phrase : ils la rendent lisible.',
    ],
    goals: ['Tenir deux minutes sans t’arrêter.', 'Construire huit mesures avec un seul motif.'],
    goal: 'on reconnaît ton motif au moins trois fois en huit mesures, et tu ne t’es pas arrêté.',
    body: W => `
<p>Pour commencer, on supprime le risque : la main gauche (l’appli) joue un ${W.term('ostinato', 'un court motif d’accompagnement répété en boucle, ici la quinte fa♯ – do♯ bercée')}, et ta main droite n’utilise que les <b>cinq touches noires</b> (fa♯, sol♯, la♯, do♯, ré♯). Elles forment une gamme ${W.term('pentatonique', 'gamme de cinq notes sans demi-ton : aucune note ne « frotte » avec une autre')}. Aucune note n’est fausse : toute ton attention va au rythme.</p>

<h2>Ce qu’est un motif</h2>
<p>Un ${W.term('motif', 'une petite idée de trois ou quatre notes, surtout un rythme, qu’on reconnaît quand elle revient')} est une cellule qu’on reconnaît quand elle revient. Ce n’est pas une mélodie entière : c’est sa brique. Dans le modèle ci-dessous, le motif est « noire – noire – blanche ». Tout le reste en découle.</p>
${W.score({ abc: EX_MOTIF, title: 'Huit mesures avec un seul motif', bpm: 76, practice: false, caption: 'Répété (mesure 2), déplacé plus haut (3), retourné en réponse (4), varié en croches (6), poussé vers un sommet (7), conclu sur fa♯, la note « maison » (8).' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Dix minutes', `<ol>
<li><b>Copie (3 min).</b> Lance l’accompagnateur en mode « Question – réponse » : l’appli joue deux mesures sur les touches noires, tu réponds en <b>gardant son rythme</b> (les notes peuvent changer).</li>
<li><b>Ton motif (4 min).</b> Mode « Libre » : invente un motif d’une mesure et joue-le huit fois de suite, en changeant seulement les notes. Puis répète-le, déplace-le, varie-le, comme dans le modèle.</li>
<li><b>Deux minutes sans arrêt (3 min).</b> Une seule règle : ne jamais t’arrêter. Si tu hésites, rejoue ton motif.</li>
</ol>`)}
${W.improv({ preset: 'n1-noires', presets: ['n1-noires', 'n1-penta'] })}
${W.checklist({ id: 'n1-im-lancer-check', title: 'Je vérifie', items: ['Je ne me suis pas arrêté.', 'On reconnaît mon motif à chaque retour.', 'J’ai laissé des silences.', 'Mes phrases finissent sur fa♯.'] })}
${W.more('D’où vient cette méthode', `<p>Commencer par un ostinato et une gamme sans demi-tons, c’est la méthode du pédagogue américain Forrest Kinney (<i>Pattern Play</i>) : on improvise dès la première minute, et on construit ensuite. Graham Fitch la recommande aussi.</p>`)}
${W.links([W.informance('/content/pages/5-anyone-can-improvise', 'Anyone Can Improvise!'), W.informance('/content/pages/189-how-to-improvise', 'How to Improvise')], 'Pour aller plus loin')}
`,
  },

  /* ================================================================ 2 */
  {
    id: 'n1-im-rythme', minutes: 15,
    title: 'Question et réponse',
    summary: 'Une phrase se dit en deux temps : une question qui reste en suspens, une réponse qui reprend son rythme et conclut.',
    essentials: [
      'La <b>question</b> finit sur une note qui n’est pas la tonique : on attend la suite.',
      'La <b>réponse</b> commence avec le même rythme que la question et finit sur la <b>tonique</b>, en valeur longue.',
      'La <b>tonique</b> est la note « maison » de la tonalité : ici <b>la</b>.',
    ],
    goals: ['Entendre la différence entre une fin ouverte et une fin fermée.', 'Répondre à une question en reprenant son rythme.'],
    goal: 'trois réponses sur quatre ont « ✓ fin » et « ✓ rythme » dans le jeu guidé.',
    body: W => `
<p>Tu sais tenir un motif. On lui donne maintenant une direction. Deux phrases de deux mesures se répondent, comme une question et sa réponse. La ${W.term('tonique', 'la note de repos de la tonalité, celle où la musique se sent « à la maison » : la en la mineur')} décide de tout : finir ailleurs, c’est interroger ; finir dessus, c’est conclure.</p>
<p>On passe à la pentatonique de <b>la mineur</b> (la, do, ré, mi, sol), plus mélancolique, sur un ostinato la – mi.</p>

${W.score({ abc: EX_QR_PENTA, title: 'Deux questions, deux réponses (la mineur pentatonique)', bpm: 72, practice: false, caption: 'Questions : elles finissent sur mi (mesure 2) ou sol (6), on reste en l’air. Réponses : même début, même rythme, et la longue note finale est la. Écoute surtout les mesures 2 et 4.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Dix minutes', `<ol>
<li><b>Chante (2 min).</b> Écoute le modèle et chante la réponse de la mesure 4 : sens comme le la final « ferme la porte ».</li>
<li><b>Jeu guidé (5 min).</b> Accompagnateur, mode « Question – réponse » : quatre questions, quatre réponses. Après chaque réponse, l’appli te dit si tu as fini sur une note stable et repris le rythme.</li>
<li><b>Les deux rôles (3 min).</b> Mode « Libre » : fais toi-même la question <i>et</i> la réponse, quatre fois de suite.</li>
</ol>`)}
${W.improv({ preset: 'n1-penta-la', presets: ['n1-penta-la', 'n1-penta'] })}
${W.tip('Si ta réponse ne « répond » pas', '<p>C’est presque toujours le rythme : garde exactement le rythme de la première mesure de la question, et change seulement les notes de la fin.</p>')}
${W.checklist({ id: 'n1-im-rythme-check', title: 'Je vérifie', items: ['Mes questions finissent ailleurs que sur la.', 'Mes réponses reprennent le rythme de la question.', 'Mes réponses finissent sur la, en valeur longue.'] })}
`,
  },

  /* ================================================================ 3 */
  {
    id: 'n1-im-5notes', minutes: 20,
    title: 'Les notes de l’accord',
    summary: 'Première harmonie : sur chaque temps fort, une note de l’accord. C’est ce qui fait « tenir » une mélodie.',
    essentials: [
      'Un <b>accord</b>, c’est trois ou quatre notes qui sonnent ensemble ; la <b>grille</b> dit quel accord dure chaque mesure.',
      'Sur les <b>temps forts</b> (1 et 3 à quatre temps), joue une note de l’accord : la mélodie tient debout.',
      'Au changement d’accord, va vers la note du nouvel accord <b>la plus proche</b> : la ligne devient chantante.',
    ],
    goals: ['Connaître les notes de I, IV et V7 en do majeur.', 'Poser une note de l’accord sur chaque temps fort.'],
    goal: 'l’accompagnateur affiche 70 % ou plus de temps forts sur une note de l’accord.',
    body: W => `
<p>Jusqu’ici, toutes les notes allaient bien. Avec une vraie harmonie, certaines notes « frottent ». On n’apprend pas à les éviter : on apprend où <b>s’appuyer</b>. Les ${W.term('temps forts', 'les temps qui portent l’accent de la mesure : le 1er (et le 3e à quatre temps)')} sont les moments où l’oreille vérifie l’harmonie ; c’est là qu’on place une note de l’accord.</p>

<h2>La boîte à outils (do majeur)</h2>
<table>
<thead><tr><th>Accord</th><th>Notes</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td><b>I</b> (do)</td><td>do – mi – sol</td><td>repos</td></tr>
<tr><td><b>IV</b> (fa)</td><td>fa – la – do</td><td>éloignement</td></tr>
<tr><td><b>V7</b> (sol 7)</td><td>sol – si – ré – fa</td><td>tension, qui ramène vers I</td></tr>
</tbody></table>
<p class="small">La théorie de ces accords : <a href="#/lecon/n1-th-accords">les accords de trois sons</a> et <a href="#/lecon/n1-th-fonctions">degrés et fonctions</a>.</p>

<h2>Le modèle : un squelette, puis le même squelette habillé</h2>
${W.score({ abc: EX_ACCORDS, title: 'Do majeur : I – IV – V7 – I, deux fois', bpm: 72, startBpm: 60, caption: 'Mesures 1 à 4 : le <b>squelette</b>, une note de l’accord par mesure (mi, fa, ré, do), chacune voisine de la précédente. Mesures 5 à 8 : le même squelette au premier temps, d’autres notes de l’accord sur les autres temps.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Quinze minutes', `<ol>
<li><b>Le squelette (4 min).</b> Accompagnateur « I – IV – V7 – I » : une seule note par mesure, une note de l’accord, la plus proche de la précédente. Écoute comme elle se fond dans l’accord.</li>
<li><b>Une note par temps (5 min).</b> Garde le squelette au 1er temps ; sur les autres temps, d’autres notes de l’accord (arpèges). Vise 70 % de temps forts justes : l’appli l’affiche à l’arrêt.</li>
<li><b>Question – réponse (6 min).</b> Même grille en mode « Question – réponse » : tes réponses finissent sur do.</li>
</ol>`)}
${W.improv({ preset: 'n1-IIVVI', presets: ['n1-IIVVI', 'n1-5notes', 'n1-IIVVI8'] })}
${W.more('La note la plus proche : pourquoi ça marche', '<p>Quand l’accord change, plusieurs notes de la mélodie peuvent convenir. Celle qui est voisine de la note précédente (un ton, un demi-ton, ou la même) donne une ligne conjointe, facile à chanter : c’est le principe de la <a href="#/lecon/n2-th-voix">conduite des voix</a>. Dans V7 → I, deux notes ont même une direction obligée : la <b>sensible</b> si monte vers do, la <b>septième</b> fa descend vers mi.</p>')}
`,
  },

  /* ================================================================ 4 */
  {
    id: 'n1-im-accords', minutes: 20,
    title: 'Entre les notes de l’accord : passages et broderies',
    summary: 'Relier les notes d’appui par la gamme : notes de passage et broderies, toujours entre les temps forts.',
    essentials: [
      '<b>Note de passage</b> : elle relie deux notes de l’accord par degrés conjoints (mi – <i>ré</i> – do).',
      '<b>Broderie</b> : on quitte une note de l’accord pour sa voisine, et on revient (mi – <i>fa</i> – mi).',
      'Elles se placent <b>entre</b> les temps forts ; le squelette, lui, reste sur les temps forts.',
    ],
    goals: ['Remplir un squelette donné par des notes de passage.', 'Ajouter des broderies sans perdre le squelette.'],
    goal: 'en mode « Squelette », tu poses au moins 6 notes d’appui sur 8 au premier temps, et tu remplis entre elles en croches.',
    body: W => `
<p>Le squelette donne la direction ; la gamme sert de chemin entre ses notes. Deux outils suffisent, qui viennent de la <a href="#/lecon/n1-th-etrangeres">théorie des notes étrangères</a>. On travaille en <b>la mineur</b> : n’oublie pas le <b>sol♯</b> (la sensible) sur l’accord de V7 (mi – sol♯ – si – ré).</p>

<h2>Le modèle, en trois étages</h2>
${W.score({ abc: EX_SQUELETTE, title: '1. Le squelette (une note d’appui par mesure)', bpm: 66, practice: false, caption: 'Mi, fa, si, do : une note de chaque accord (i, iv, V7, i).' })}
${W.score({ abc: EX_PASSAGES, title: '2. Notes de passage, aux 2e et 4e temps', bpm: 66, practice: false, caption: 'Aux 1er et 3e temps, des notes de l’accord ; entre elles, la note de la gamme qui les relie (mi – ré – do, fa – mi – ré…).' })}
${W.score({ abc: EX_BRODERIES, title: '3. En croches : broderies et passages', bpm: 66, startBpm: 54, practice: false, caption: 'Chaque note d’appui est brodée (mi – fa – mi, fa – sol – fa, si – do – si), puis reliée à la suivante. Les temps forts n’ont pas bougé : c’est toujours le squelette.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Quinze minutes', `<ol>
<li><b>Le squelette en or (5 min).</b> Accompagnateur, mode « Squelette » : la note d’appui de chaque mesure s’allume en or. Pose-la au 1er temps, puis relie-la à la suivante en noires.</li>
<li><b>En croches (5 min).</b> Même squelette, rempli en croches, avec une broderie par mesure.</li>
<li><b>Ton squelette (5 min).</b> Mode « Libre » : invente ton propre squelette (une note de l’accord par mesure, voisine de la précédente), puis habille-le.</li>
</ol>`)}
${W.improv({ preset: 'n1-am-squelette', presets: ['n1-am-squelette', 'n1-am'] })}
${W.tip('Une « fausse » note se rattrape', '<p>Une note hors de l’accord n’est fausse que si elle reste en l’air. Glisse d’un degré vers une note de l’accord : elle devient une note de passage ou une broderie.</p>')}
`,
  },

  /* ================================================================ 5 */
  {
    id: 'n1-im-gammes', minutes: 20,
    title: 'Le soupir : l’appoggiature',
    summary: 'La note étrangère posée sur le temps, qui retombe d’un degré : le geste expressif de toute la musique romantique.',
    essentials: [
      'L’<b>appoggiature</b> est une note étrangère <b>sur le temps</b>, qui se résout d’un degré (souvent en descendant) sur une note de l’accord.',
      'C’est un <b>soupir</b> : on appuie la dissonance, on allège la résolution.',
      'Une ou deux par phrase : trop d’appoggiatures, et plus rien n’est expressif.',
    ],
    goals: ['Placer une appoggiature au premier temps et la résoudre.', 'Doser son poids : appui, puis détente.'],
    goal: 'en mode « Appoggiatures », tu commences au moins 6 mesures sur 8 par la note en or, et tu la résous d’un degré vers le bas.',
    body: W => `
<p>Jusqu’ici, les temps forts étaient sur l’accord. L’${W.term('appoggiature', 'note étrangère à l’accord, placée sur le temps fort, qui se résout ensuite par degré sur une note de l’accord')} renverse la règle, exprès : une note qui n’appartient pas à l’accord tombe sur le temps, crée une tension, puis glisse sur la note voisine. Chopin, Liszt, Rachmaninov en remplissent leurs mélodies. Tu en entends une dans ton nocturne : le ré♭ qui retombe sur do.</p>

${W.score({ abc: EX_SOUPIRS, title: 'Mi mineur : une appoggiature par mesure', bpm: 56, startBpm: 48, practice: false, pedal: [0, 4, 8, 12, 16, 20, 24, 28], pedalEnd: 32, caption: 'Chaque mesure commence par une note étrangère (marquée « app. ») : do sur l’accord de mi mineur, ré sur do majeur… Elle descend d’un degré au 3e temps, sur une note de l’accord. La mesure 4 s’arrête sur ré♯ (la sensible) : c’est la question ; la mesure 8 conclut sur mi.' })}

<h2>Le geste</h2>
<ul>
<li>L’appoggiature : un peu plus de poids, et un soupçon de temps.</li>
<li>La résolution : plus douce, comme une expiration. Jamais l’inverse.</li>
</ul>

<h2>À toi, en trois étapes</h2>
${W.exo('Quinze minutes', `<ol>
<li><b>Les soupirs en or (5 min).</b> Accompagnateur, mode « Appoggiatures » : la note en or est l’appoggiature de la mesure. Pose-la au 1er temps, appuie, et descends d’un degré.</li>
<li><b>Libre (5 min).</b> Même grille : une appoggiature dans une mesure sur deux seulement, des notes de l’accord ailleurs.</li>
<li><b>Question – réponse (5 min).</b> Termine chaque réponse par un soupir sur la tonique (fa♯ → mi).</li>
</ol>`)}
${W.improv({ preset: 'n1-soupirs', presets: ['n1-soupirs'] })}
`,
  },

  /* ================================================================ 6 */
  {
    id: 'n1-im2', minutes: 25,
    title: 'Style 1 : la romance en arpèges mineurs',
    summary: 'Une main gauche qui déroule l’accord jusqu’à la dixième, une mélodie lente qui chante et soupire : le style de la Romance de Liszt.',
    essentials: [
      'Main gauche : l’accord <b>déroulé</b> de la basse jusqu’à la dixième, puis retour ; une seule position de main et <b>une pédale par accord</b>.',
      'Main droite : des <b>valeurs longues</b>, des notes de l’accord sur les temps, un <b>soupir</b> par phrase et un <b>sommet</b>.',
      'Le caractère vient du phrasé : la question monte et se suspend, la réponse retombe et se pose.',
    ],
    goals: ['Jouer la main gauche en arpèges sur la grille de mi mineur.', 'Improviser huit mesures dans ce style, avec un sommet et une fin.'],
    goal: 'tu joues les deux mains (ou la main droite sur l’accompagnateur) huit mesures sans t’arrêter, avec une question qui se suspend et une réponse qui finit sur mi.',
    body: W => `
<p>C’est le style des romances sans paroles, de la <a href="#/piece/liszt-s169">Romance de Liszt</a> à l’Élégie de Rachmaninov : une tonalité mineure, une main gauche qui ondule en arpèges larges, une mélodie qui chante par-dessus. Tout ce que tu as appris s’y retrouve : notes de l’accord sur les temps, passages, soupirs.</p>

<h2>La boîte à outils (mi mineur, à trois temps)</h2>
<table>
<thead><tr><th class="num">Mesure</th><th>Accord</th><th>Notes</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>i : mi mineur</td><td>mi – sol – si</td></tr>
<tr><td class="num">2</td><td>iv : la mineur</td><td>la – do – mi</td></tr>
<tr><td class="num">3</td><td>i : mi mineur</td><td>mi – sol – si</td></tr>
<tr><td class="num">4</td><td>V : si majeur</td><td>si – ré♯ – fa♯ (ré♯ : la sensible)</td></tr>
<tr><td class="num">5</td><td>VI : do majeur</td><td>do – mi – sol</td></tr>
<tr><td class="num">6</td><td>iv : la mineur</td><td>la – do – mi</td></tr>
<tr><td class="num">7</td><td>V7 : si 7</td><td>si – ré♯ – fa♯ – la</td></tr>
<tr><td class="num">8</td><td>i : mi mineur</td><td>mi – sol – si</td></tr>
</tbody></table>

<h2>D’abord la main gauche</h2>
${W.score({ abc: EX_ROMANCE_MG, title: 'La main gauche de la romance', bpm: 63, startBpm: 50, hands: false, pedal: [0, 3, 6, 9, 12, 15, 18, 21], pedalEnd: 24, caption: 'Six croches par mesure : basse, quinte, octave, dixième… puis retour. La main reste ouverte sur l’accord ; le poignet suit la vague, sans à-coup. Pédale changée juste après chaque basse (<a href="#/lecon/n1-t5">pédale syncopée</a>).' })}

<h2>Le modèle : huit mesures phrasées</h2>
${W.score({ abc: EX_ROMANCE, title: 'Romance en mi mineur', bpm: 63, startBpm: 54, pedal: [0, 3, 6, 9, 12, 15, 18, 21], pedalEnd: 24, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_ROMANCE }], caption: 'Compare les deux écoutes. Phrasé : la première phrase monte vers le fa♯ de la mesure 4 et s’y suspend (une respiration) ; la seconde part du sol aigu, soupire en mesure 6 (ré → do) et se pose sur mi en ralentissant.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>La main gauche seule (5 min).</b> Accompagnateur « Romance », main gauche jouée par l’appli : écoute la vague. Puis « Main gauche jouée par : moi » (le clic garde le temps, les notes à jouer s’affichent en brun) : joue-la toi-même.</li>
<li><b>Question – réponse (7 min).</b> L’appli pose la question (mesures 1-2, 5-6…), tu réponds. Valeurs longues ; un soupir dans au moins une réponse.</li>
<li><b>Huit mesures à toi (8 min).</b> Mode « Libre » : une question (mesures 1-4, sommet en 4, fin sur ré♯ ou fa♯), une réponse (mesures 5-8, fin sur mi). Puis « Réécouter ». Si tu bloques, passe en mode « Squelette du modèle » : les notes en or sont celles du modèle, à habiller à ta façon.</li>
</ol>`)}
${W.improv({ preset: 'romance-mi', presets: ['romance-mi', 'romance-la'] })}
${W.tip('Garder ce que tu as trouvé', '<p>Une improvisation qui te plaît mérite d’être fixée : l’onglet <a href="#/outils/composition">Composition</a> reprend cette grille (romance en mi mineur). Tu y enregistres ta mélodie mesure par mesure ; elle est notée en partition, vérifiée (question en mesure 4, sommet, cadence) et gardée dans tes compositions.</p>')}
${W.more('Une autre grille : la basse qui descend', '<p>La seconde grille de l’accompagnateur, en la mineur, fait descendre la basse pas à pas (la – sol – fa – mi) : c’est la <b>basse de lamento</b>, chère aux romantiques russes. Même travail, autre couleur : plus sombre, plus fatale.</p>')}
${W.listen([W.yt('Liszt Romance S.169 O pourquoi donc', 'Liszt, Romance S. 169', 'La pièce qui a inspiré ce style'), W.yt('Rachmaninoff Elegie op 3 no 1', 'Rachmaninov, Élégie op. 3 n° 1', 'Le même principe, en plus large (niveau 4)')], 'Écouter le style')}
`,
  },

  /* ================================================================ 7 */
  {
    id: 'n1-im3', minutes: 25,
    title: 'Style 2 : le nocturne, sur les harmonies de ton op. 55',
    summary: 'Improviser sur la boucle d’accords qui porte le thème de ton nocturne, avec la main gauche de Chopin, puis comparer avec sa mélodie.',
    essentials: [
      'Le thème de l’op. 55 n° 1 repose sur une boucle de quatre harmonies : <b>i – VII6 – III – V6/5</b> (fa m, mi♭/sol, la♭, do 7/mi), deux par mesure.',
      'La mélodie de Chopin y suit les règles que tu connais : notes de l’accord sur les temps 1 et 3, et des <b>broderies chromatiques</b> (si♮ – do – ré♭) qui l’ornent.',
      'Improviser sur la même boucle, c’est comprendre de l’intérieur ce que fait sa mélodie.',
    ],
    goals: ['Improviser un autre thème sur les harmonies de l’op. 55.', 'Orner son squelette avec des broderies chromatiques.'],
    goal: 'tu improvises quatre mesures sur la boucle avec 70 % de temps forts sur l’accord et au moins une broderie chromatique.',
    body: W => `
<p>Cette fois, la grille n’est pas inventée pour l’exercice : ce sont les accords des mesures 1 à 8 de ton nocturne, avec les voicings de Chopin à la main gauche (basse au 1er et au 3e temps, accord au 2e et au 4e). Un accord <b>par demi-mesure</b> : les temps forts sont le 1 et le 3.</p>

<h2>Ce que fait Chopin</h2>
${W.score({ abc: OP55.e1, title: 'Op. 55 n° 1, mesures 1 à 4', bpm: 56, startBpm: 46, pedal: [1, 3, 5, 7, 9, 11, 13, 15], pedalEnd: 17, practice: false, caption: 'Son squelette : <b>do</b> au 1er temps (fa mineur), <b>mi♭</b> au 3e (mi♭/sol), <b>do</b> au 1er temps de la mesure 2 (la♭), <b>do</b> au 3e (do 7). Entre eux : fa, ré♭ (notes de l’accord ou de passage) et la broderie si♮ – do – ré♭ autour de do.' })}

<h2>Un autre thème sur les mêmes accords</h2>
${W.score({ abc: EX_NOCT_SQ, title: '1. Un autre squelette', bpm: 56, practice: false, caption: 'La♭ – si♭ | do – si♭ | la♭ – sol | la♭ – sol : deux notes de l’accord par mesure, voisines les unes des autres.' })}
${W.score({ abc: EX_NOCT_HAB, title: '2. Le même, habillé', bpm: 56, startBpm: 46, practice: false, caption: 'Broderie sol autour de la♭ (mesure 1), broderie chromatique si♮ autour de do (mesure 2, comme Chopin), passage la♭ – fa – sol (mesure 3), et mi♮ (la sensible) à la fin, qui appelle fa.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Le squelette de Chopin (6 min).</b> Accompagnateur « harmonies de ton nocturne », mode « Squelette de Chopin » : les notes en or sont celles de sa mélodie aux temps 1 et 3. Joue-les seules, en blanches : c’est sa mélodie dépouillée de ses ornements.</li>
<li><b>Ton squelette, habillé (7 min).</b> Mode « Libre » : un autre squelette, deux notes de l’accord par mesure (comme le modèle : la♭ – si♭ | do – si♭…), puis habille-le avec une broderie chromatique (la note un demi-ton en dessous, puis retour) dans chaque mesure paire.</li>
<li><b>Question – réponse (7 min).</b> L’appli joue deux mesures, tu réponds ; puis joue la vraie mélodie de Chopin, et improvise la réponse suivante.</li>
</ol>`)}
${W.improv({ preset: 'nocturne-op55', presets: ['nocturne-op55', 'n1-nocturne8'] })}
${W.tip('Pourquoi c’est utile pour jouer la pièce', '<p>Une fois que tu as improvisé sur ces accords, la mélodie de Chopin n’est plus une suite de notes à retenir : c’est un choix parmi d’autres, que tu comprends. Tu la mémorises mieux, et tu sais quelles notes appuyer (les notes de l’accord aux temps forts) et lesquelles alléger (les broderies).</p>')}
`,
  },

  /* ================================================================ 8 */
  {
    id: 'n1-im4', minutes: 25,
    title: 'Huit mesures : la période',
    summary: 'Tout réunir dans une forme : une question de quatre mesures qui s’arrête sur V, une réponse de quatre mesures qui conclut sur i.',
    essentials: [
      'La <b>période</b> : un <b>antécédent</b> de quatre mesures qui finit sur la dominante (demi-cadence), puis un <b>conséquent</b> qui commence pareil et finit sur la tonique (cadence parfaite).',
      'Le motif de la mesure 1 revient à la mesure 5 ; le <b>sommet</b> est dans la réponse, juste avant la cadence.',
      'Au choix : en style romance ou nocturne.',
    ],
    goals: ['Construire une période de huit mesures.', 'L’improviser sans t’arrêter, avec un sommet et deux cadences claires.'],
    goal: 'huit mesures sans t’arrêter : une demi-cadence nette en mesure 4, le motif de retour en mesure 5, un sommet, une cadence parfaite en mesure 8.',
    body: W => `
<p>Les leçons précédentes t’ont donné des briques : motif, question et réponse, notes de l’accord, passages, soupirs, un style. La ${W.term('période', 'phrase de huit mesures en deux moitiés : un antécédent qui s’arrête sur la dominante, un conséquent qui commence pareil et conclut sur la tonique')} les assemble. C’est la forme de milliers de thèmes classiques et romantiques : celui de ton nocturne en est un, en deux fois quatre mesures.</p>

${W.score({ abc: EX_PERIODE, title: 'Une période en fa mineur', bpm: 60, startBpm: 52, pedal: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28], pedalEnd: 32, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_PERIODE }], caption: 'Grille : i – iv – i – V | i – iv – V7 – i. Les mesures 5-6 reprennent les mesures 1-2 ; la mesure 6 monte vers le sommet (sol, mesure 7), puis la sensible mi♮ mène à fa. Dans la version phrasée, écoute la respiration après la demi-cadence et le ralenti final.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Le conséquent (6 min).</b> Accompagnateur « Question – réponse (demi-cadence, puis cadence parfaite) » : joue l’antécédent du modèle (mesures 1-4), puis improvise les mesures 5-8.</li>
<li><b>Tout improviser (8 min).</b> Mode « Libre » : ta période entière, en gardant le même motif aux mesures 1 et 5. Réécoute-toi : entend-on la question et la réponse ?</li>
<li><b>Dans un style (6 min).</b> Même travail sur la grille de la romance (mi mineur) ou des harmonies de ton nocturne.</li>
</ol>`)}
${W.improv({ preset: 'n1-qr', presets: ['n1-qr', 'romance-mi', 'nocturne-op55'] })}
${W.checklist({ id: 'n1-im4-check', title: 'Je vérifie', items: ['Je ne m’arrête pas, même après une erreur.', 'On entend une question (mesure 4) et une réponse (mesure 8).', 'Le motif de la mesure 1 revient à la mesure 5.', 'Les temps forts reposent sur les notes de l’accord, sauf mes soupirs voulus.'] })}
<p class="small">C’est le critère d’improvisation de l’<a href="#/validation/n1">évaluation de fin de niveau</a>.</p>
`,
  },
];
