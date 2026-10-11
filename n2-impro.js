// Niveau 2 — Improvisation (V4) : le langage, puis les styles de Chopin et des romantiques.
// 1. la cadence  2. la règle de l'octave  3. Romanesca et Prinner  4. Meyer, Monte, Fonte (complément)
// 5. orner comme Chopin (ses propres variantes, op. 55 et op. 15)  6. style : l'élégie et la marche par quintes
// 7. style : le prélude de Chopin (op. 28 n° 4)  8. la forme ABA, comme l'op. 15.
// Chaque leçon : l'essentiel en tête, les accords redonnés, un modèle, trois étapes chronométrées, le jeu guidé
// (notes en or : soprano, squelette du modèle ou squelette de Chopin), un critère de réussite.
// Extraits de Chopin : tirés des sources vérifiées note à note (tools/chopin_cmp.py) ; exemples : tools/impro_examples.py.
import { OP28 } from './content-excerpts.js';

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

const LH8 = `[V:LH] "_i".F,,2 .[A,CF]2 .C,2 .[A,CF]2 | "_iv".B,,2 .[B,DF]2 .F,,2 .[B,DF]2 | "_V7".C,,2 .[B,=EG]2 .G,,2 .[B,EG]2 | "_i".F,,2 .[A,CF]2 F,,4 |]`;
const LH16 = `[V:LH] "_i".F,,4 .[A,CF]4 .C,4 .[A,CF]4 | "_iv".B,,4 .[B,DF]4 .F,,4 .[B,DF]4 | "_V7".C,,4 .[B,=EG]4 .G,,4 .[B,EG]4 | "_i".F,,4 .[A,CF]4 F,,8 |]`;
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
[V:RH] "^la♭ majeur : I"[Ace]8 | "^fa mineur : V"[Gc=e]4 "^V7"[GBe]4 | "^i"[FAf]8 |]
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

const EX_ELEGIE = `X:1
M:4/4
L:1/8
K:Dm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] f6 e2 | d4 A4 | B6 A2 | "^suspension"A2 ^c2 e4 | "^montée"B2 d2 g4 | "^sommet"a6 g2 | g3 f e4 | "^retombée"e2 ^c2 A4 |]
[V:LH] "_i"(3D,,A,,D, (3F,DF, (3D,A,,D, (3F,D,A,, | "_i/do"(3C,,A,,D, (3F,DF, (3D,A,,D, (3F,D,A,, | "_VI"(3B,,,F,,B,, (3D,B,D, (3B,,F,,B,, (3D,B,,F,, | "_V"(3A,,,E,,A,, (3^C,A,C, (3A,,E,,A,, (3C,A,,E,, | "_iv"(3G,,D,G, (3B,GB, (3G,D,G, (3B,G,D, | "_i6"(3F,,D,F, (3A,FA, (3F,D,F, (3A,F,D, | "_iiø7"(3E,,B,,D, (3G,DG, (3D,B,,D, (3G,D,B,, | "_V7"(3A,,,E,,G,, (3^C,G,C, (3G,,E,,G,, (3C,G,,E,, |]`;

const EX_MARCHE_ELEGIE = `X:1
M:4/4
L:1/8
K:Dm
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^modèle"d2 f2 a4 | g4 d4 | "^un degré plus bas"c2 e2 g4 | f4 c4 | "^encore plus bas"B2 d2 f4 | e4 B4 | "^cadence"A2 ^c2 e2 g2 | f2 e2 d4 |]
[V:LH] "_i"(3D,,A,,D, (3F,DF, (3D,A,,D, (3F,D,A,, | "_iv"(3G,,D,G, (3B,GB, (3G,D,G, (3B,G,D, | "_VII"(3C,,G,,C, (3E,CE, (3C,G,,C, (3E,C,G,, | "_III"(3F,,C,F, (3A,FA, (3F,C,F, (3A,F,C, | "_VI"(3B,,,F,,B,, (3D,B,D, (3B,,F,,B,, (3D,B,,F,, | "_ii°"(3E,,B,,E, (3G,EG, (3E,B,,E, (3G,E,B,, | "_V7"(3A,,,E,,G,, (3^C,G,C, (3G,,E,,G,, (3C,G,,E,, | "_i"(3D,,A,,D, (3F,DF, (3D,A,,D, (3F,D,A,, |]`;

const EX_OP55_VAR = `X:1
M:4/4
L:1/16
K:Fmin
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^thème (m. 3-4)"c4 f4 e4 d4 | c3 =B c3 {/e}d c8 ||
[V:LH] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 ||
[V:RH] "^reprise variée (m. 75-76)"c4 (3:2:3=e2 g2 f2 (3:2:3_e2 E2 B2 (3:2:3c2 e2 d2 | (3:2:3c2 C2 E2 (3:2:3A2 =B2 d2 c8 |]
[V:LH] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,A,C]4 .=E,,4 .[B,CG]4 |]`;
const EX_OP15_VAR = `X:1
M:3/4
L:1/16
K:F
%%score {RH | (LH1 LH2 LH3)}
V:RH clef=treble
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=up
V:LH3 clef=bass stem=down
[V:RH] "^m. 5-7"g4 a3g (3g2f2e2 | f6 e2 (3d2e2f2 | e8 (3e2d2A2 ||
[V:LH1] =B,4 _B,4 B,4 | A,4 A,4 A,4 | ^G,4 A,4 x4 ||
[V:LH2] (3F,2G,2G,2 (3F,2G,2G,2 (3E,2G,2G,2 | (3E,2F,2F,2 (3D,2F,2F,2 (3D,2F,2F,2 | (3D,2E,2E,2 (3C,2E,2E,2 (3[F,,=B,,A,]2D,2D,2 ||
[V:LH3] D,4 _D,4 C,4 | C,4 =B,,8 | =B,,4 A,,4 x4 ||
[V:RH] "^reprise ornée (m. 53-55)"g4 a3g (3g2f2e2 | f6 e2 (7:4:7ded^cdef | e6 !>!e2- (3e2d2A2 |]
[V:LH1] =B,4 _B,4 B,4 | A,4 A,4 A,4 | ^G,4 A,4 x4 |]
[V:LH2] (3F,2G,2G,2 (3F,2G,2G,2 (3E,2G,2G,2 | (3E,2F,2F,2 (3D,2F,2F,2 (3D,2F,2F,2 | (3D,2E,2E,2 (3C,2E,2E,2 (3[F,,=B,,A,]2D,2D,2 |]
[V:LH3] D,4 _D,4 C,4 | C,4 =B,,8 | =B,,4 A,,4 x4 |]`;

const PED4 = [0, 4, 8, 12];
const PED8 = [0, 4, 8, 12, 16, 20, 24, 28];
// Phrasé (nuances de la main droite, carte de tempo), en noires depuis le début
const PH_ELEGIE = {
  dyn: { rh: [[0, 0.8], [8, 0.9], [12, 0.96], [16, 0.86], [17, 0.9], [20, 1.05], [21, 1.18], [24, 1.05], [28, 0.85], [32, 0.72]], lh: [[0, 0.7], [20, 0.8], [32, 0.62]] },
  tempoMap: [[0, 1], [14, 1], [15.5, 0.85], [16, 1], [20, 1.02], [21, 0.92], [22, 1], [29, 0.95], [31, 0.8], [32, 0.7]],
};
const PH_MARCHE = {
  dyn: { rh: [[0, 0.95], [4, 1.08], [8, 0.92], [12, 1.0], [16, 0.86], [20, 0.94], [24, 0.84], [27, 1.06], [28, 0.95], [32, 0.72]], lh: [[0, 0.75], [16, 0.68], [27, 0.78], [32, 0.6]] },
  tempoMap: [[0, 1], [7.5, 0.94], [8, 1], [15.5, 0.94], [16, 1], [23.5, 0.94], [24, 1], [27, 0.97], [30, 0.85], [32, 0.7]],
};
// Prélude op. 28 n° 4 : une pédale à chaque changement d'accord (levée d'une noire)
const PED_PRELUDE = [1, 5, 7, 9, 11, 12, 13, 15, 16, 17, 19, 21, 23, 25, 29, 31, 33, 34, 37, 38, 39, 41, 43, 45];

export default [
  /* ================================================================ 1 */
  {
    id: 'n2-im-cadences', minutes: 20,
    title: 'La cadence : la formule qui conclut',
    summary: 'Comme les apprentis compositeurs de Naples : une cadence apprise par cœur, dans plusieurs tonalités, puis ornée en improvisant.',
    essentials: [
      'La <b>cadence complète</b> : basse <b>mi – fa – sol – do</b> (degrés 3 – 4 – 5 – 1), accords <b>I6 – IV – V7 – I</b>.',
      'Deux notes ont une direction obligée : la <b>sensible</b> (si) monte vers do, la <b>septième</b> de l’accord de dominante (fa) descend vers mi.',
      'On l’apprend <b>par cœur</b>, dans plusieurs tonalités : elle devient un réflexe, qu’on orne ensuite.',
    ],
    goals: ['Jouer la cadence en do avec deux sopranos différents, sans regarder.', 'La transposer en sol, en fa, en la mineur et en ré mineur.'],
    goal: 'tu joues la cadence dans cinq tonalités sans t’arrêter, et en mode « Soprano » l’appli compte 4 notes en or sur 4.',
    body: W => `
<p>Au XVIIIe siècle, à Naples, les futurs compositeurs apprenaient à improviser avec des ${W.term('partimenti', 'exercices où l’on reçoit une ligne de basse et où l’on invente les voix du dessus au clavier')} : on leur donnait une basse, ils inventaient les voix au-dessus. Tout commençait par la cadence, jouée dans toutes les tonalités jusqu’à devenir un réflexe. On apprend le langage par ses formules, comme une langue par ses expressions.</p>

<h2>Les accords (do majeur)</h2>
<table>
<thead><tr><th>Basse</th><th>Accord</th><th>Notes</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td>mi (3)</td><td><b>I6</b> : do majeur, mi à la basse</td><td>do – mi – sol</td><td>départ, encore ouvert</td></tr>
<tr><td>fa (4)</td><td><b>IV</b> : fa majeur</td><td>fa – la – do</td><td>éloignement</td></tr>
<tr><td>sol (5)</td><td><b>V7</b> : sol 7</td><td>sol – si – ré – fa</td><td>tension : si monte, fa descend</td></tr>
<tr><td>do (1)</td><td><b>I</b> : do majeur</td><td>do – mi – sol</td><td>conclusion</td></tr>
</tbody></table>
<p class="small">Rappel : <a href="#/lecon/n1-th-fonctions">degrés et fonctions</a>, <a href="#/lecon/n1-th-cadences">les cadences</a>.</p>

<h2>Deux sopranos</h2>
${W.score({ abc: CAD_A, title: 'Soprano do – do – si – do', bpm: 56, practice: false, caption: 'La voix du bas de la main droite descend sur fa (la septième de sol 7), qui se résout sur mi. Le soprano reste sur do, sauf la sensible si, qui y revient.' })}
${W.score({ abc: CAD_B, title: 'Soprano sol – fa – fa – mi', bpm: 56, practice: false, caption: 'Le fa du soprano devient la septième de sol 7 et descend sur mi ; la voix du milieu fait do – la – si – do.' })}
${W.score({ abc: CAD_MIN, title: 'En la mineur : i6 – iv – V7 – i', bpm: 56, practice: false, caption: 'La sensible sol♯ monte vers la ; ré (septième de mi 7) descend vers do.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Par cœur (5 min).</b> Les deux versions en do, mains ensemble, en disant la basse à voix haute (3 – 4 – 5 – 1). Puis les yeux fermés.</li>
<li><b>Le soprano en or (7 min).</b> Accompagnateur ci-dessous (il ne joue que la basse), mode « Soprano » : joue la note en or sur chaque accord, avec la voix du milieu si tu peux. Puis la même chose en la mineur.</li>
<li><b>Transposer, puis orner (8 min).</b> Sol majeur, fa majeur, ré mineur (menu de l’accompagnateur). Enfin, mode « Libre » : garde le soprano au premier temps et relie ses notes par des notes de passage et des broderies.</li>
</ol>`)}
${W.improv({ preset: 'n2-cadence', presets: ['n2-cadence', 'n2-cadence-min', 'n2-cadence-sol', 'n2-cadence-fa', 'n2-cadence-re'] })}
${W.tip('Les notes qui tirent', '<p>Si la sensible monte et la septième descend, la cadence sonne juste, même improvisée, même ornée. Vérifie-les d’abord, dans chaque tonalité : si – do et fa – mi en do ; fa♯ – sol et do – si en sol ; sol♯ – la et ré – do en la mineur.</p>')}
${W.more('Dans ta pièce', '<p>Les cadences de l’op. 15 n° 1 sont des modèles : mesures 21-22, do 7 → fa (cadence parfaite, la basse va de do à fa) ; mesure 24, arrêt sur do 7 au-dessus de la basse fa (effet de demi-cadence) avant le Con fuoco. Joue la cadence du cours en fa majeur (basse la – si♭ – do – fa), puis écoute ces deux moments.</p>')}
${W.checklist({ id: 'n2-im-cad-check', title: 'Je vérifie', items: ['Je joue les deux versions en do sans hésiter.', 'Je les transpose dans au moins quatre tonalités.', 'La sensible monte, la septième descend.', 'J’improvise quatre mesures sur la cadence en boucle sans m’arrêter.'] })}
`,
  },

  /* ================================================================ 2 */
  {
    id: 'n2-im-octave', minutes: 20,
    title: 'La règle de l’octave : un accord pour chaque note de la basse',
    summary: 'Harmoniser une gamme à la basse, en montant et en descendant : la clé de tous les accompagnements.',
    essentials: [
      'Quand la basse monte ou descend la gamme, chaque degré a <b>son accord type</b> : c’est la règle de l’octave (Campion, 1716).',
      'Les degrés <b>1 et 5</b> portent un accord stable (I, V), le <b>3</b> porte I6 ; les autres portent un <b>accord de passage</b> (le plus souvent une septième de dominante renversée) qui mène au degré suivant.',
      'La main droite bouge le moins possible : <b>notes communes gardées</b>, sensible qui monte, septième qui descend.',
    ],
    goals: ['Jouer la règle de l’octave en do, montée et descente, par cœur.', 'La transposer en sol et en fa majeur.'],
    goal: 'en mode « Soprano », tu poses au moins 12 notes en or sur 16 en do, puis en sol, sans t’arrêter.',
    body: W => `
<p>Une basse qui avance par degrés appelle, sur chaque note, un accord typique. Les claviéristes du XVIIIe siècle le savaient par cœur : avec cette ${W.term('règle de l’octave', 'un accord type pour chaque degré de la gamme à la basse, en montant et en descendant (François Campion, 1716)')}, on harmonise presque n’importe quelle basse conjointe, et on accompagne une mélodie sans partition.</p>
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
<p class="small">Les chiffres (6, 6/5, 4/3, 4/2) disent quel renversement : <a href="#/lecon/n1-th-renv">renversements et chiffrage</a>.</p>
${W.score({ abc: OCTAVE_EX, title: 'La règle de l’octave en do majeur', bpm: 60, startBpm: 50, practice: false, caption: 'Les voix de la main droite gardent leurs notes communes : sensible qui monte, septième qui descend. En descendant, le fa♯ (sur la, 6e degré) annonce sol : une dominante secondaire.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Lire la basse (4 min).</b> Joue la basse seule, en montant puis en descendant, en disant à chaque note le degré et l’accord (1 : I, 2 : V4/3, 3 : I6…).</li>
<li><b>Le soprano en or (8 min).</b> Accompagnateur, mode « Soprano » : l’appli joue la basse, tu joues les accords à la main droite, le soprano en or au-dessus.</li>
<li><b>Transposer (8 min).</b> En sol, puis en fa majeur (menu de l’accompagnateur) : même dessin de main droite, autres touches. Termine en mode « Libre » : une mélodie en noires, une note de l’accord par temps.</li>
</ol>`)}
${W.improv({ preset: 'n2-octave', presets: ['n2-octave', 'n2-octave-sol', 'n2-octave-fa'] })}
${W.tip('Basse d’abord', '<p>Chante la basse en jouant les accords : c’est elle qui guide. Quand tu improviseras un accompagnement, pense d’abord la ligne de basse, puis remplis.</p>')}
${W.more('Dans ta pièce', '<p>Dans la descente, la règle place déjà une dominante secondaire sur le 6e degré (ré 7 sur la, avec fa♯, qui mène à sol). Aux mesures 4 à 8 de l’op. 15, Chopin généralise ce principe : la basse descend fa – mi – ré – ré♭ – do – si – la, et presque chaque étape est préparée par la dominante de l’accord suivant. La règle de l’octave, en plus coloré.</p>')}
`,
  },

  /* ================================================================ 3 */
  {
    id: 'n2-im-romanesca', minutes: 20,
    title: 'Les schémas : Romanesca et Prinner',
    summary: 'Des phrases toutes faites que les compositeurs combinaient comme des mots : une basse et une mélodie typiques, à varier à l’infini.',
    essentials: [
      'Un <b>schéma</b> est une petite phrase toute faite : une basse, une mélodie, quelques accords, que tous les compositeurs connaissaient.',
      '<b>Romanesca</b> : basse do – si – la – sol, mélodie mi – ré – do – si, à la <b>dixième</b> : une ouverture.',
      '<b>Prinner</b> : basse fa – mi – ré – do, mélodie la – sol – fa – mi : la réponse, qui redescend vers la tonique.',
    ],
    goals: ['Enchaîner Romanesca, Prinner et cadence par cœur en do.', 'Improviser une mélodie en dixièmes avec la basse, puis l’orner.'],
    goal: 'tu enchaînes les douze mesures sans t’arrêter, avec au moins 9 notes en or sur 12 en mode « Soprano ».',
    body: W => `
<p>Le musicologue Robert Gjerdingen a montré que la musique du XVIIIe siècle est faite de ${W.term('schémas', 'enchaînements de quelques accords, avec une basse et une mélodie caractéristiques, que les compositeurs combinaient comme des mots')} : des enchaînements que tous connaissaient et combinaient. En apprendre quelques-uns, c’est se faire un vocabulaire ; improviser, c’est les enchaîner et les orner.</p>

<h2>Les accords</h2>
<table>
<thead><tr><th>Schéma</th><th>Basse</th><th>Accords</th><th>Soprano</th></tr></thead>
<tbody>
<tr><td><b>Romanesca</b></td><td>do – si – la – sol</td><td>I – V6 – vi – iii6</td><td>mi – ré – do – si</td></tr>
<tr><td><b>Prinner</b></td><td>fa – mi – ré – do</td><td>IV – I6 – V4/3 – I</td><td>la – sol – fa – mi</td></tr>
<tr><td><b>Cadence</b></td><td>mi – fa – sol – do</td><td>I6 – ii6 – V7 – I</td><td>sol – fa – fa – mi</td></tr>
</tbody></table>
${W.score({ abc: ROMANESCA_EX, title: 'Romanesca, Prinner, cadence (do majeur)', bpm: 60, startBpm: 50, practice: false, caption: 'La basse descend une octave entière, de do à do. Le soprano suit la basse à la ' + W.term('dixième', 'une tierce plus une octave : mi au-dessus de do, mais une octave plus haut') + ' (mi sur do, ré sur si…) : le moyen le plus sûr d’improviser une mélodie qui sonne.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Le duo (5 min).</b> Basse et soprano seuls, sans les voix du milieu : les deux mains descendent ensemble, à la dixième.</li>
<li><b>Le soprano en or (7 min).</b> Accompagnateur, mode « Soprano » : l’appli joue les accords, tu poses le soprano au premier temps, puis une deuxième note par mesure.</li>
<li><b>Orner (8 min).</b> Mode « Libre » : garde la note du soprano au premier temps et remplis avec les outils du niveau 1 (passages, broderies, une appoggiature par schéma).</li>
</ol>`)}
${W.improv({ preset: 'n2-romanesca', presets: ['n2-romanesca'] })}
${W.more('Où on les entend', '<p>Le Canon de Pachelbel repose sur une variante de la Romanesca à basse sautante (1 – 5 – 6 – 3). Le Prinner est partout chez Mozart et Haydn, à la fin des premières phrases. Dans l’op. 15 de Chopin, mesures 4 à 8, une basse descend aussi pas à pas sous la mélodie, mais Chopin la remplit de couleurs chromatiques là où la Romanesca et le Prinner restent dans la gamme.</p>')}
`,
  },

  /* ================================================================ 4 */
  {
    id: 'n2-im-schemas', minutes: 20, prio: 2,
    title: 'Les schémas (2) : Meyer, Monte, Fonte',
    summary: 'Trois schémas de plus : une ouverture en dialogue, une montée et une descente en marche. De quoi improviser seize mesures entières.',
    essentials: [
      '<b>Meyer</b> : une ouverture en deux gestes, soprano do – si… fa – mi, sur I – V4/3… V6/5 – I.',
      '<b>Monte</b> (la montée) : « dominante → accord », repris un degré plus haut (do 7 → fa, puis ré 7 → sol). <b>Fonte</b> (la fontaine) : l’inverse, un degré plus bas (la 7 → ré mineur, puis sol 7 → do).',
      'Une phrase classique : une <b>ouverture</b> (Romanesca, Meyer), une <b>continuation</b> (Monte, Fonte, Prinner), une <b>cadence</b>.',
    ],
    goals: ['Jouer le Meyer, le Monte et la Fonte.', 'Enchaîner seize mesures de schémas en improvisant la mélodie.'],
    goal: 'tu enchaînes seize mesures (Meyer – Prinner – cadence, puis Monte – Fonte – cadence) sans t’arrêter.',
    body: W => `
${W.score({ abc: SCHEMAS_EX, title: 'Meyer, Monte, Fonte (do majeur)', bpm: 60, startBpm: 50, practice: false, caption: 'Dans le Monte et la Fonte, chaque septième (si♭, do, sol, fa) descend d’un degré et chaque sensible (mi, fa♯, do♯, si) monte : la règle des septièmes de dominante, appliquée en marche.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Chaque schéma (6 min).</b> Joue l’exemple en do, puis en sol majeur.</li>
<li><b>Le soprano en or (7 min).</b> Accompagnateur « Meyer, Prinner et cadence », puis « Monte puis Fonte », mode « Soprano ».</li>
<li><b>Seize mesures (7 min).</b> Mode « Libre » : Meyer – Prinner – cadence, puis Monte – Fonte – cadence, sans t’arrêter.</li>
</ol>`)}
${W.improv({ preset: 'n2-meyer', presets: ['n2-meyer', 'n2-monte-fonte', 'n2-romanesca'] })}
${W.more('Dans ta pièce', '<p>Mesures 41 à 44 de l’op. 15 : la♭ 7, puis si♭ 7, un ton plus haut, chacun dominante d’une tonalité nouvelle (ré♭, puis mi♭ mineur). Cela rappelle le Monte : une dominante reprise plus haut, qui fait monter la tension avant la redescente des mesures 45 à 48.</p>')}
${W.checklist({ id: 'n2-im-schemas-check', title: 'Je vérifie', items: ['Je joue les cinq schémas (Romanesca, Prinner, Meyer, Monte, Fonte) par cœur en do.', 'Je reconnais le Monte et la Fonte à l’oreille.', 'J’enchaîne seize mesures de schémas en improvisant la mélodie.'] })}
`,
  },

  /* ================================================================ 5 */
  {
    id: 'n2-im1', minutes: 25,
    title: 'Orner comme Chopin',
    summary: 'Chopin varie ses propres thèmes quand ils reviennent : mêmes harmonies, mêmes notes d’appui, autre chemin entre elles. On l’observe, puis on fait pareil.',
    essentials: [
      'Quand un thème revient, Chopin le <b>varie</b> : mêmes harmonies, mêmes <b>notes d’appui</b>, mais le chemin entre elles change.',
      'Ses outils : <b>broderie</b> (simple, double ou chromatique), <b>appoggiature</b>, <b>déplacement d’octave</b>, <b>fioriture</b> (groupe rapide de 5, 7, 11 notes…).',
      'Les ornements sont <b>plus légers</b> que les notes qu’ils ornent, et la <b>main gauche ne ralentit pas</b> : c’est elle qui garde le temps.',
    ],
    goals: ['Reconnaître les ornements de Chopin dans tes deux nocturnes.', 'Orner une mélodie sans perdre ses notes d’appui ni la pulsation.'],
    goal: 'sur le squelette de Chopin (op. 55), tu poses au moins 11 notes en or sur 15 en ornant entre elles, sans que la pulsation bouge.',
    body: W => `
<p>Les ornements de Chopin viennent de l’improvisation et du chant : quand un thème revient, il le chante autrement, comme une cantatrice qui varie sa reprise. La méthode se lit dans ses partitions : il garde les notes d’appui et l’harmonie, et ne change que le chemin.</p>

<h2>Chopin se varie lui-même</h2>
${W.score({ abc: EX_OP55_VAR, title: 'Op. 55 n° 1 : le thème (m. 3-4), puis sa reprise (m. 75-76)', bpm: 56, startBpm: 46, practice: false, pedal: [0, 2, 4, 6, 8, 10, 12, 14], pedalEnd: 16, caption: 'Mêmes accords, mêmes notes d’appui : do, fa, mi♭, ré♭, puis do. À la reprise, chaque temps devient un triolet : ' + W.term('double broderie', 'on encadre la note par ses deux voisines (celle du dessous, puis celle du dessus, ou l’inverse) avant de la jouer') + ' autour de fa (mi♮ – sol – fa) et de ré♭ (do – mi♭ – ré♭), sauts d’octave (mi♭5 – mi♭4, do5 – do4), puis si♮ et ré♭ qui encadrent le do final.' })}
${W.score({ abc: EX_OP15_VAR, title: 'Op. 15 n° 1 : mesures 5 à 7, puis leur reprise (m. 53-55)', bpm: 69, startBpm: 50, practice: false, caption: 'Tout est identique, sauf la mesure 54 : le petit triolet ré – mi – fa de la mesure 6 devient un ' + W.term('septolet', 'sept notes égales dans la durée d’un temps : une fioriture, à jouer souplement, comme une vocalise') + ' qui brode autour de ré (ré – mi – ré – do♯ – ré) avant de monter vers fa.' })}

<h2>La boîte à outils</h2>
<table>
<thead><tr><th>Ornement</th><th>Ce que c’est</th><th>Chez Chopin</th></tr></thead>
<tbody>
<tr><td><b>Broderie</b></td><td>on quitte une note pour sa voisine et on revient</td><td>op. 55, m. 2 : do – si♮ – do</td></tr>
<tr><td><b>Broderie chromatique</b></td><td>la voisine à un demi-ton, même hors de la gamme</td><td>op. 55, m. 2 : le si♮ sous do</td></tr>
<tr><td><b>Double broderie</b></td><td>les deux voisines, puis la note</td><td>op. 55, m. 75 : mi♮ – sol – fa</td></tr>
<tr><td><b>Appoggiature</b></td><td>note étrangère sur le temps, résolue d’un degré</td><td>op. 55, m. 7 : la♭ sur do 7, qui descend sur sol</td></tr>
<tr><td><b>Déplacement d’octave</b></td><td>la même note, une octave plus bas ou plus haut</td><td>op. 55, m. 75-76 : mi♭5 – mi♭4</td></tr>
<tr><td><b>Fioriture</b></td><td>groupe rapide, en nombre irrégulier, qui remplit un temps</td><td>op. 15, m. 54 : le septolet</td></tr>
</tbody></table>

<h2>Le même travail sur une mélodie simple</h2>
${W.score({ abc: PLAIN, title: 'La mélodie simple (i – iv – V7 – i)', bpm: 60, practice: false, pedal: PED4, pedalEnd: 16 })}
${W.score({ abc: ORNATE, title: 'La même mélodie, ornée', bpm: 60, startBpm: 52, practice: false, pedal: PED4, pedalEnd: 16, caption: 'Mêmes notes d’appui aux mêmes endroits. Mesures 1 à 3 : un groupe autour de la note (ré♭ – do – si♮ – do) ; mesure 1 : l’appoggiature sol retarde le fa d’un temps ; mesure 4 : une fioriture de six notes avant le fa final.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Le squelette de Chopin (5 min).</b> Accompagnateur « harmonies de ton nocturne », mode « Squelette de Chopin » : les notes en or sont les siennes, aux temps 1 et 3. Pose-les seules, en valeurs longues.</li>
<li><b>Un ornement par mesure (8 min).</b> Même mode : entre deux notes en or, un seul ornement de la boîte à outils, différent à chaque mesure. La main gauche (l’appli) ne t’attend pas : l’ornement doit tenir dans le temps.</li>
<li><b>La reprise ornée (7 min).</b> Grille « la mélodie simple à orner » : joue la mélodie simple une fois, puis orne-la à la reprise, comme Chopin à la mesure 75.</li>
</ol>`)}
${W.improv({ preset: 'nocturne-op55', presets: ['nocturne-op55', 'n2-orner'] })}
${W.tip('Peu, mais bien', '<p>Une ou deux idées par phrase. Un thème orné partout perd son chant : chez Chopin, l’ornement arrive à la reprise, quand on connaît déjà la mélodie.</p>')}
${W.checklist({ id: 'n2-im1-check', title: 'Je vérifie', items: ['Les notes d’appui restent aux mêmes endroits.', 'Mes ornements sont plus légers que les notes d’appui.', 'La pulsation ne bouge pas pendant les ornements.', 'Je n’orne pas tout : une ou deux idées par phrase.'] })}
${W.links([W.informance('/content/pages/5-anyone-can-improvise', 'Anyone Can Improvise!'), W.informance('/content/pages/189-how-to-improvise', 'How to Improvise')], 'Pour aller plus loin')}
`,
  },

  /* ================================================================ 6 */
  {
    id: 'n2-im2', minutes: 25,
    title: 'Style 3 : l’élégie et la marche par quintes',
    summary: 'De grandes vagues d’arpèges sur deux octaves, une mélodie lente qui monte vers un sommet, et la marche : un modèle recopié un degré plus bas.',
    essentials: [
      'Main gauche de l’élégie : des <b>vagues d’arpèges en triolets</b>, de la basse jusqu’à deux octaves plus haut ; une pédale par accord.',
      'La <b>marche</b> : un modèle de deux mesures, <b>recopié un degré plus bas</b>, deux fois, sur les accords de la marche par quintes.',
      'C’est la répétition qui fait la marche : on ne varie qu’ensuite, et on en sort par une <b>cadence</b>.',
    ],
    goals: ['Jouer la main gauche de l’élégie sur la marche par quintes.', 'Improviser un modèle, ses deux reprises et la cadence.'],
    goal: 'en mode « Squelette », tu poses au moins 6 notes en or sur 8, et ton modèle se reconnaît à chaque reprise.',
    body: W => `
<p>C’est le style des élégies russes, de Tchaïkovski à l’Élégie op. 3 n° 1 de Rachmaninov : une tonalité mineure, une main gauche qui roule en grandes vagues, une mélodie lente qui monte vers un sommet et retombe. Ici, on lui ajoute la ${W.term('marche', 'un motif repris plusieurs fois à des hauteurs différentes, sur des accords qui s’enchaînent de la même façon')} par quintes : la basse descend de quinte en quinte (ou monte de quarte), et un même motif suit le mouvement.</p>

<h2>Les accords (ré mineur)</h2>
<table>
<thead><tr><th class="num">Mesure</th><th>Accord</th><th>Notes</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>i : ré mineur</td><td>ré – fa – la</td><td rowspan="2">modèle</td></tr>
<tr><td class="num">2</td><td>iv : sol mineur</td><td>sol – si♭ – ré</td></tr>
<tr><td class="num">3</td><td>VII : do majeur</td><td>do – mi – sol</td><td rowspan="2">un degré plus bas</td></tr>
<tr><td class="num">4</td><td>III : fa majeur</td><td>fa – la – do</td></tr>
<tr><td class="num">5</td><td>VI : si♭ majeur</td><td>si♭ – ré – fa</td><td rowspan="2">encore plus bas</td></tr>
<tr><td class="num">6</td><td>ii° : mi diminué</td><td>mi – sol – si♭</td></tr>
<tr><td class="num">7</td><td>V7 : la 7</td><td>la – do♯ – mi – sol</td><td rowspan="2">cadence</td></tr>
<tr><td class="num">8</td><td>i : ré mineur</td><td>ré – fa – la</td></tr>
</tbody></table>
<p class="small">La théorie : <a href="#/lecon/n2-th4">les marches harmoniques</a>.</p>

<h2>Le modèle et ses reprises</h2>
${W.score({ abc: EX_MARCHE_ELEGIE, title: 'Marche par quintes en élégie (ré mineur)', bpm: 54, startBpm: 46, pedal: PED8, pedalEnd: 32, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_MARCHE }], caption: 'Le modèle (mesures 1-2) : un arpège qui monte (ré – fa – la), puis un soupir (la → sol). Il est recopié un degré plus bas (do – mi – sol, fa), puis encore (si♭ – ré – fa, mi). En mesure 7, on quitte le modèle : la septième sol descend sur fa, la sensible do♯ mène à ré. Version phrasée : chaque reprise un peu plus douce, puis un élan vers la cadence.' })}

<h2>Une élégie sur une basse qui descend</h2>
${W.score({ abc: EX_ELEGIE, title: 'Élégie en ré mineur', bpm: 54, startBpm: 46, pedal: PED8, pedalEnd: 32, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_ELEGIE }], caption: 'Autre grille du même style : la basse descend (ré – do – si♭ – la). La phrase se suspend sur la (mesure 4), monte vers le sommet (la aigu, mesure 6) et retombe sur la dominante : la grille recommence.' })}

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>La vague (5 min).</b> Accompagnateur « Élégie : la marche par quintes », « Main gauche jouée par : moi » : joue les arpèges (les notes en brun s’allument), une pédale à chaque basse.</li>
<li><b>Le modèle et ses reprises (8 min).</b> Main gauche par l’appli, mode « Squelette » : les notes en or donnent le modèle (ré – sol) puis ses reprises (do – fa, si♭ – mi). Garde le même rythme à chaque reprise.</li>
<li><b>Ton modèle (7 min).</b> Mode « Libre » : invente un autre modèle sur les mesures 1-2, recopie-le deux fois un degré plus bas, puis la cadence (do♯ – ré).</li>
</ol>`)}
${W.improv({ preset: 'n2-marche-elegie', presets: ['n2-marche-elegie', 'elegie-re', 'n2-marche'] })}
${W.tip('Écrire ton élégie', '<p>Dans l’onglet <a href="#/outils/composition">Composition</a>, choisis « Élégie » : l’appli joue les vagues en ré mineur, tu enregistres ta mélodie, elle devient une partition de huit mesures que tu peux reprendre mesure par mesure, garder et exporter (MIDI, pour MuseScore). Le style « Nocturne » fait de même sur les harmonies de l’op. 55.</p>')}
${W.more('La même marche, plus simple, en la mineur', `${W.score({ abc: MARCHE, title: 'Un modèle et ses reprises (la mineur)', bpm: 66, startBpm: 56, practice: false, caption: 'Le modèle (mesures 1-2) : mi – ré – do – mi, puis fa – mi – ré – fa. Il est repris un degré plus bas (mesures 3-4), puis encore (mesures 5-6), avant la cadence.' })}<p>Dans ta pièce : le Con fuoco de l’op. 15 contient deux marches (mesures 41 à 48), la♭ 7 → si♭ 7 un ton plus haut, puis si♭ – mi♭ – la♭ – ré♭ à la basse, des quintes descendantes, comme ici.</p>`)}
${W.listen([W.yt('Rachmaninoff Elegie op 3 no 1', 'Rachmaninov, Élégie op. 3 n° 1', 'Le modèle du style'), W.yt('Tchaikovsky Romance op 5', 'Tchaïkovski, Romance op. 5', 'Une romance russe en arpèges')], 'Écouter le style')}
`,
  },

  /* ================================================================ 7 */
  {
    id: 'n2-im4', minutes: 25,
    title: 'Style 4 : le prélude de Chopin',
    summary: 'Le Prélude op. 28 n° 4 : une mélodie presque immobile, des accords qui glissent par demi-tons. Improviser en tenant une note pendant que l’harmonie change sous elle.',
    essentials: [
      'À chaque changement d’accord, <b>une seule voix</b> de la main gauche descend, le plus souvent d’un <b>demi-ton</b> : l’harmonie glisse, sans saut.',
      'La mélodie reste presque <b>immobile</b> : la même note change de couleur avec chaque accord, tantôt calme, tantôt tendue.',
      'Pour improviser dans ce style : <b>tenir</b> une note tant qu’elle sonne, et ne bouger que d’un degré quand l’accord la rend dure.',
    ],
    goals: ['Comprendre la conduite des voix du Prélude op. 28 n° 4.', 'Improviser une mélodie presque immobile sur ses accords.'],
    goal: 'sur les accords du Prélude, ta mélodie bouge au plus d’une note par mesure, presque toujours d’un degré, et tu t’arrêtes avec Chopin sur si 7, mesure 12.',
    body: W => `
<p>Dans le Prélude en mi mineur, Chopin fait presque tout avec l’harmonie. La main droite chante si – do – si pendant quatre mesures, puis la – si – la ; la main gauche répète ses accords en croches et, à chaque changement, une seule de ses trois voix descend d’un demi-ton. C’est la ${W.term('conduite des voix', 'la manière dont chaque note d’un accord rejoint une note de l’accord suivant ; ici, par demi-tons, sans saut')} poussée à l’extrême.</p>
${W.score({ abc: OP28.n4a, title: 'Prélude op. 28 n° 4, mesures 1 à 12', qpm: 54, startBpm: 22, pedal: PED_PRELUDE, pedalEnd: 49, caption: 'Suis une voix de la main gauche : le mi du haut descend (mi – mi♭ – ré – do♯ – do – si…), puis celle du milieu, puis la basse. La mélodie, elle, tient son si, qui change de rôle à chaque accord : quinte de mi mineur, calme (mesure 1) ; partie d’une sixte augmentée fa – la – si – mi♭, très tendue (mesure 3) ; fondamentale de si – ré – fa – la deux temps plus tard. Mesure 12 : la demi-cadence sur si 7, puis le silence.' })}

<h2>Les accords (simplifiés)</h2>
<table>
<thead><tr><th class="num">Mesure</th><th>Main gauche</th><th>Mélodie</th></tr></thead>
<tbody>
<tr><td class="num">1</td><td>mi mineur (sol – si – mi)</td><td>si, broderie do</td></tr>
<tr><td class="num">2</td><td>fa♯ – la – mi, puis fa♯ – la – mi♭ (si 7)</td><td>si</td></tr>
<tr><td class="num">3</td><td>fa – la – mi♭, fa – la – ré, fa – sol♯ – ré</td><td>si</td></tr>
<tr><td class="num">4</td><td>mi 7, mi – sol – ré, mi – sol – do♯</td><td>si, puis si♭</td></tr>
<tr><td class="num">5-6</td><td>do/mi, puis fa♯ ø/mi, ré♯ °7</td><td>la, broderie si</td></tr>
<tr><td class="num">7-8</td><td>ré 7, ré – fa – do, ré – fa – si</td><td>la, puis sol♯</td></tr>
<tr><td class="num">9-11</td><td>do – mi – si, la mineur/do, si 7 en alternance</td><td>sol♯ – la – si…, fa♯</td></tr>
<tr><td class="num">12</td><td>si 7 : demi-cadence</td><td>la fioriture, puis silence</td></tr>
</tbody></table>

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Entendre les voix (5 min).</b> Dans la partition ci-dessus, choisis « MG » et écoute les mesures 1 à 4 ; puis joue la main gauche seule en chantant la voix qui bouge à chaque changement.</li>
<li><b>Le squelette de Chopin (7 min).</b> Accompagnateur « Les accords du Prélude », mode « Squelette de Chopin » : une note en or par mesure (si, si, si, si, la…). Tiens-la ; ajoute au plus une broderie (do au-dessus de si, si au-dessus de la).</li>
<li><b>Ta mélodie (8 min).</b> Mode « Libre » : commence sur une autre note (mi aigu ou sol), tiens-la tant qu’elle sonne, descends d’un degré quand l’accord la rend dure. Arrête-toi sur si 7, mesure 12.</li>
</ol>`)}
${W.improv({ preset: 'prelude-mi', presets: ['prelude-mi', 'n2-lamento', 'choral-ut'] })}
${W.more('La basse de lamento et le choral', `<p>Une basse qui descend lentement de la tonique à la dominante, par demi-tons, est une formule très ancienne : la <b>basse de lamento</b> (la lamentation de Didon chez Purcell). La grille « Prélude sur basse chromatique descendante » de l’accompagnateur la met en fa majeur ; la grille « Choral en do mineur » rappelle le Prélude op. 28 n° 20, en accords pleins.</p>${W.score({ abc: LAMENTO, title: 'Prélude sur la basse fa – mi – mi♭ – ré – ré♭ – do', bpm: 60, startBpm: 50, practice: false, pedal: PED8, pedalEnd: 32, caption: 'Une figuration en accords brisés. Chaque accord garde le plus de notes possible du précédent ; les autres bougent d’un degré.' })}<p>Dans ta pièce : aux mesures 16 à 19 de l’op. 15 (et 64 à 67), la basse descend fa – mi – mi♭ – ré – do, presque la même basse.</p>`)}
${W.checklist({ id: 'n2-im4-check', title: 'Je vérifie', items: ['Ma mélodie tient ses notes ; elle bouge peu, et par degrés.', 'J’entends quand l’accord rend ma note tendue, et je la résous.', 'Je m’arrête sur si 7 (mesure 12), sans conclure.'] })}
${W.listen([W.yt('Chopin Prelude op 28 no 4', 'Chopin, Prélude op. 28 n° 4', 'Écoute la main gauche autant que la mélodie'), W.yt('Chopin Prelude op 28 no 20', 'Chopin, Prélude op. 28 n° 20', 'Le choral')], 'Écouter')}
`,
  },

  /* ================================================================ 8 */
  {
    id: 'n2-im3', minutes: 25,
    title: 'La forme ABA, comme ton nocturne',
    summary: 'Deux caractères, un retour : la forme de l’op. 15 n° 1 (cantabile en fa majeur, con fuoco en fa mineur, retour du chant), improvisée.',
    essentials: [
      'La forme ABA : un <b>thème</b> (A), un <b>contraste</b> (B), le <b>retour</b> du thème (A′), souvent orné.',
      'Le contraste change <b>plusieurs choses à la fois</b> : le mode, le registre, le rythme, le toucher (op. 15 : chant calme en fa majeur, puis tempête en fa mineur).',
      'Fa majeur et fa mineur ont la <b>même dominante</b> (do 7) : le retour se fait par elle, sensible mi♮ qui monte vers fa.',
    ],
    goals: ['Improviser deux sections de caractère opposé.', 'Préparer le retour et rejouer A, orné.'],
    goal: 'tu improvises les 21 mesures sans t’arrêter ; B se distingue de A par au moins deux paramètres, et A′ rappelle le thème du début.',
    body: W => `
<p>Tu as tout ce qu’il faut : un chant appuyé sur l’harmonie, des ornements, un style. Il reste à l’organiser en une forme. Celle de ton nocturne est la plus simple et la plus forte : A, un contraste B, puis le retour de A, transformé par le voyage.</p>
${W.diagram('form', { total: 21, sections: [
  { label: 'A', kind: 'A', from: 1, to: 8, key: 'fa majeur', note: 'cantabile, arpèges' },
  { label: 'B', kind: 'B', from: 9, to: 16, key: 'fa mineur', note: 'con fuoco, accords battus' },
  { label: '', kind: 'C', from: 17, to: 17, note: 'do 7' },
  { label: 'A′', kind: 'A', from: 18, to: 21, key: 'fa majeur', note: 'retour, orné' },
] }, 'Le plan de l’accompagnateur « Forme ABA comme l’op. 15 » : huit mesures en fa majeur, huit en fa mineur (la main gauche s’agite), une mesure de dominante (do 7), quatre mesures de retour.')}

<h2>Les accords</h2>
<table>
<thead><tr><th>Section</th><th>Grille</th><th>Caractère</th></tr></thead>
<tbody>
<tr><td><b>A</b> (fa majeur)</td><td>I – IV – V7 – I | vi – ii – V7 – I</td><td>chant legato, mezzo piano, registre médium</td></tr>
<tr><td><b>B</b> (fa mineur)</td><td>i – iv – V7 – i | VI – iv – V7 – i</td><td>forte, accents, notes répétées, registre grave ou très aigu</td></tr>
<tr><td>retour</td><td>V7 (do – mi – sol – si♭)</td><td>suspendu : mi♮ prépare fa</td></tr>
<tr><td><b>A′</b></td><td>I – IV – V7 – I</td><td>le thème, orné</td></tr>
</tbody></table>

<h2>À toi, en trois étapes</h2>
${W.exo('Vingt minutes', `<ol>
<li><b>Deux caractères (7 min).</b> Improvise huit mesures de A (chante, lie, sans hâte), puis huit de B (forte, accents, rythme serré). Change au moins deux choses à la fois : mode, registre, rythme, toucher.</li>
<li><b>Le retour (5 min).</b> Sur la mesure de do 7, monte vers fa par la sensible mi♮, et reprends le début de ton thème de A, orné (leçon « Orner comme Chopin »).</li>
<li><b>Toute la forme (8 min).</b> Les 21 mesures sans t’arrêter, puis « Réécouter » : entend-on trois parties, et le retour ?</li>
</ol>`)}
${W.improv({ preset: 'n2-aba-op15', presets: ['n2-aba-op15', 'n2-aba'] })}
${W.more('Une autre forme ABA : vers le relatif majeur', `<p>Beaucoup de nocturnes contrastent plutôt un mineur et son relatif majeur (fa mineur / la♭ majeur, même armure). Le retour demande alors une vraie modulation : depuis la♭ majeur, la♭ descend vers sol, mi♭ monte vers mi♮, do reste : voici l’accord de do, puis do 7, puis fa mineur. Grille « Forme ABA : fa mineur / la♭ majeur / fa mineur » de l’accompagnateur.</p>${W.score({ abc: RETOUR, title: 'De la♭ majeur vers fa mineur', bpm: 56, practice: false, pedal: [0, 4, 6, 8], pedalEnd: 12 })}`)}
${W.checklist({ id: 'n2-im3-check', title: 'Je vérifie', items: ['Je ne m’arrête pas, même aux changements de section.', 'B a un vrai contraste de caractère, pas seulement d’accords.', 'La mesure de do 7 prépare le retour (mi♮ monte vers fa).', 'Le retour de A rappelle le thème du début, varié ou orné.'] })}
`,
  },
];
