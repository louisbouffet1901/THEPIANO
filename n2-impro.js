// Niveau 2 — Improvisation (V5.1) : le langage, puis les styles de Chopin et des romantiques, en exercices progressifs.
// 1. la cadence (et la Quiescenza)  2. la règle de l'octave  3. ouvrir et répondre (Romanesca, Do-Ré-Mi, Meyer, Prinner)
// 4. la marche : Monte et Fonte  5. orner comme Chopin (du plus simple au plus orné)  6. style : l'élégie et la marche par quintes
// 7. style : le prélude de Chopin (op. 28 n° 4)  8. la forme ABA, comme l'op. 15.
// V7.5 : « Préluder » (après la cadence) ; dialogue ou imitation dans chaque leçon (qr schema / sequence, echo orné) ;
// schémas en trois tonalités ; fin de leçon dans la tonalité d'une pièce ; les vraies harmonies de l'op. 15 (m. 1 à 8).
// Chaque leçon : l'essentiel en tête, les accords redonnés, « pourquoi ça marche » (écoute comparée), un modèle, les
// exercices (W.paliers), les erreurs fréquentes.
// Extraits de Chopin : tirés des sources vérifiées note à note (tools/chopin_cmp.py) ; exemples : tools/impro_examples.py.
import { OP28 } from './content-excerpts.js';

// V7.5 : un prélude en fa majeur (cadence, figuration, cadence)
const EX_PRELUDE_FA = `X:1
M:4/4
L:1/8
K:F
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^cadence"[FAc]4 [FBd]4 | [EGB]4 [FAc]4 | "^figuration"z4 C F A c | z4 A, D F A | z4 F B d f | z4 G B c e | "^cadence"[FAc]2 [FBd]2 [EGB]2 [FAc]2 | !fermata![FAcf]8 |]
[V:LH] "_I"F,,4 "_IV"B,,4 | "_V7"C,4 "_I"F,,4 | "_I"F,, C, F, A, z4 | "_vi"D,, A,, D, F, z4 | "_IV"B,,, F,, B,, D, z4 | "_V7"C,, G,, C, E, z4 | "_I"F,,2 "_IV"B,,2 "_V7"C,2 "_I"F,,2 | !fermata![F,,C,F,]8 |]`;

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

// V5 : exemples ajoutés (mêmes conventions que ROMANESCA_EX : blanches, accords de la main droite)
const DOREMI_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^Do-Ré-Mi"[Ec]2 [Gd]2 | [Ge]2 "^demi-cadence"[Bd]2 | "^Prinner"[CA]2 [CG]2 | [B,F]2 [CE]2 |]
[V:LH] "_I"C2 "_V6"B,2 | "_I"C2 "_V"G,2 | "_IV"F,2 "_I6"E,2 | "_V4/3"D,2 "_I"C,2 |]`;

const MEYER_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^Meyer"[EGc]2 [FGB]2 | [DGf]2 [CGe]2 |]
[V:LH] "_I"C,2 "_V4/3"D,2 | "_V6/5"B,,2 "_I"C,2 |]`;

const MONTE_FONTE_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^Monte"[C_B]2 [CA]2 | [Dc]2 [DB]2 | "^Fonte"[A,G]2 [A,F]2 | [G,F]2 [G,E]2 |]
[V:LH] "_V6/5 de IV"E,2 "_IV"F,2 | "_V6/5 de V"^F,2 "_V"G,2 | "_V6/5 de ii"^C,2 "_ii"D,2 | "_V6/5"B,,2 "_I"C,2 |]`;

const QUIESCENZA_EX = `X:1
M:4/4
L:1/4
K:C
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^cadence"[Gc]2 [Ac]2 | [FB]2 [Ec]2 | "^Quiescenza"[E_B]2 [FA]2 | [F=B]2 [Ec]2 |]
[V:LH] "_I6"E,2 "_IV"F,2 | "_V7"G,2 "_I"C,2 | "_I7"C,2 "_IV6/4"C,2 | "_V7"C,2 "_I"C,2 |]`;

export default [
  /* ================================================================ 1 */
  {
    id: 'n2-im-cadences', minutes: 20,
    title: 'La cadence : la formule qui conclut',
    summary: 'Comme les apprentis compositeurs de Naples : une cadence apprise par cœur, dans plusieurs tonalités, ornée, puis prolongée par la Quiescenza.',
    essentials: [
      'La <b>cadence complète</b> : basse <b>mi – fa – sol – do</b> (degrés 3 – 4 – 5 – 1), accords <b>I6 – IV – V7 – I</b>.',
      'Deux notes ont une direction obligée : la <b>sensible</b> (si) monte vers do, la <b>septième</b> de l’accord de dominante (fa) descend vers mi.',
      'On l’apprend <b>par cœur</b>, dans plusieurs tonalités : elle devient un réflexe, qu’on orne ensuite. Après elle, la <b>Quiescenza</b> éteint la pièce.',
    ],
    goals: ['Jouer la cadence en do et en la mineur, sans regarder.', 'La transposer, l’orner, et finir une pièce par une Quiescenza.'],
    goal: 'le dernier exercice (seize mesures improvisées sur la cadence, en fa majeur) est validé.',
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

<h2>Pourquoi la sensible doit monter</h2>
<p>La sensible est à un demi-ton de la tonique : l’oreille l’entend comme une note « attirée ». Si elle monte, la cadence se ferme ; si elle part ailleurs au soprano, la conclusion perd sa force, même avec les bons accords.</p>
${W.ecoute({ title: 'Sol 7, puis do : la sensible au soprano', bpm: 60, items: [
  { label: 'Elle monte (si → do)', seq: 'sol1 ré3 fa3 si3:2 | do2 do3 mi3 do4:3', note: 'Si va vers do, fa descend vers mi : la phrase se ferme.' },
  { label: 'Elle saute (si → sol)', seq: 'sol1 ré3 fa3 si3:2 | do2 do3 mi3 sol3:3', note: 'Mêmes accords, mais le soprano quitte la sensible : la fin est molle, l’oreille attendait do.' },
] })}

<h2>Après la cadence : la Quiescenza</h2>
<p>Une pièce ne s’arrête pas net sur l’accord final. Les compositeurs ajoutaient souvent une ${W.term('Quiescenza', 'formule de repos après la cadence : sur la basse do tenue, le soprano fait si♭ – la – si – do')} : la basse reste sur la tonique, et le soprano descend au si♭, passe par la, remonte par si et se pose sur do. Comme une lumière qu’on éteint doucement.</p>
${W.score({ abc: QUIESCENZA_EX, title: 'La cadence, puis la Quiescenza', bpm: 56, practice: false, caption: 'Mesures 3-4 : la basse do ne bouge plus. Au-dessus, do 7 (le si♭ frotte), fa/do, sol 7/do, puis do : le soprano si♭ – la – si – do.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im-cadences', steps: [
  { id: 'soprano-do', title: 'Le soprano en or (do majeur)', preset: 'n2-cadence', mode: 'squelette', loops: 4,
    what: 'L’appli joue la basse ; à la main droite, l’accord avec la note en or au-dessus (do – do – si – do). Si c’est trop, joue seulement la note en or.',
    why: 'Par cœur et à temps : la cadence doit devenir un réflexe, comme une expression qu’on n’a plus besoin de chercher.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'mineur', title: 'En la mineur', preset: 'n2-cadence-min', mode: 'squelette', loops: 4,
    what: 'La même cadence en la mineur : i6 – iv – V7 – i, soprano la – la – sol♯ – la.',
    why: 'En mineur, la sensible est altérée (sol♯) : c’est elle qui fait la cadence.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'tonalites', title: 'Dans trois autres tonalités', preset: 'n2-cadence', mode: 'squelette', gold: 'memo', loops: 4, keys: [{ tr: -5, label: 'sol majeur' }, { tr: -7, label: 'fa majeur' }, { tr: 2, label: 'ré majeur' }],
    what: 'En sol majeur (sensible fa♯), en fa majeur (septième si♭), puis en ré majeur (sensible do♯) : même dessin de main, autres touches.',
    why: 'Mortensen fait tout transposer : c’est ce qui transforme une formule apprise en langage.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'orner', title: 'Orner le soprano', preset: 'n2-cadence', mode: 'squelette', gold: 'memo', loops: 4,
    what: 'Garde la note en or au premier temps ; entre elles, des notes de passage et des broderies (au moins quatre ornements en tout).',
    why: 'La cadence nue est le squelette ; ornée, elle devient une fin de phrase vivante.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'figure', f: 'ornement', min: 4 }] },
  { id: 'dialogue', title: 'Dialogue : l’appli commence, tu conclus', preset: 'n2-cadence', mode: 'qr', qr: { variant: 'figure', figure: 'ornement' },
    what: 'L’appli joue les deux premières mesures de la cadence (I6 – IV) en mélodie ; tu réponds sur les deux suivantes (V7 – I) et tu conclus sur do, avec au moins un ornement (broderie, passage, appoggiature). Quatre fois.',
    why: 'Finir la phrase de quelqu’un d’autre : c’est le dialogue des partimenti, et le geste de l’accompagnateur qui conclut.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'quiescenza', title: 'Après la cadence : la Quiescenza', preset: 'n2-cadence-q', mode: 'squelette', loops: 2,
    what: 'La cadence, puis la Quiescenza sur la basse do tenue : les notes en or donnent le soprano (do – do – si – do, puis si♭ – la – si – do).',
    why: 'Une fin ne s’improvise pas au dernier moment : c’est une formule apprise, comme la cadence elle-même.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'boucle', title: 'Seize mesures sur la cadence, en fa majeur', preset: 'n2-cadence-fa', mode: 'libre', loops: 4,
    what: 'La cadence en fa majeur (la tonalité de ton op. 15), en boucle, quatre fois : improvise une mélodie au-dessus, notes de l’accord aux temps forts, sans t’arrêter.',
    why: 'La formule devient un terrain de jeu : tu la connais assez pour penser à autre chose qu’à elle.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>La sensible qui ne monte pas.</b> Au soprano, si va vers do, toujours.</li>
<li><b>La septième qui monte.</b> Fa (dans sol 7) descend vers mi.</li>
<li><b>Regarder ses doigts au lieu d’entendre la basse.</b> Chante 3 – 4 – 5 – 1 en jouant : la basse guide la main.</li>
</ul>`)}
${W.tip('La suite : préluder', '<p>La cadence est la charpente du prélude : une cadence, quelques accords arpégés, une cadence. C’est la leçon suivante, <a href="#/lecon/n2-im-preluder">Préluder</a>, à faire ensuite avant chaque pièce.</p>')}
${W.more('Dans ta pièce', '<p>Les cadences de l’op. 15 n° 1 sont des modèles : mesures 21-22, do 7 → fa (cadence parfaite, la basse va de do à fa) ; mesure 24, arrêt sur do 7 au-dessus de la basse fa (effet de demi-cadence) avant le Con fuoco. Joue la cadence du cours en fa majeur (basse la – si♭ – do – fa), puis écoute ces deux moments.</p>')}
`,
  },

  /* ================================================================ 1 bis (V7.5) */
  {
    id: 'n2-im-preluder', minutes: 20,
    title: 'Préluder : entrer dans la tonalité',
    summary: 'Trente secondes avant de jouer une pièce : une cadence, des accords en figuration, une cadence. Comme les pianistes du XIXe siècle, dans la tonalité de tes pièces.',
    essentials: [
      'Préluder, c’est <b>installer la tonalité</b> avant de jouer : l’oreille, les mains et l’attention entrent dans la pièce.',
      'La recette de Czerny (op. 200) : une <b>cadence</b>, quelques <b>accords en figuration</b> (arpégés d’une main à l’autre), une <b>cadence</b>, puis un accord tenu.',
      'Trente secondes à une minute suffisent, <b>avant chaque pièce</b>, dans sa tonalité.',
    ],
    goals: ['Préluder en fa majeur et en fa mineur, sans t’arrêter.', 'En faire un rituel au début de l’étape Pièce.'],
    goal: 'le dernier exercice (le rituel avant ta pièce) est validé deux jours différents.',
    body: W => `
<p>Au XIXe siècle, un pianiste ne commençait pas une pièce à froid : il <b>préludait</b>, quelques accords et arpèges improvisés dans la tonalité, pour accorder l’oreille du public et la sienne. Czerny en a fait une méthode (<i>Systematische Anleitung zum Fantasieren</i>, op. 200, 1829) ; Clementi et Hummel publiaient des préludes dans toutes les tonalités. C’est aussi la porte d’entrée de l’improvisation chez John Mortensen : des accords en figuration, transposés partout.</p>

<h2>La recette</h2>
<table>
<thead><tr><th>Étape</th><th>Ce qu’on joue</th><th>À quoi ça sert</th></tr></thead>
<tbody>
<tr><td><b>1. Cadence</b></td><td>I – IV – V7 – I, en accords (leçon <a href="#/lecon/n2-im-cadences">La cadence</a>)</td><td>dire la tonalité</td></tr>
<tr><td><b>2. Figuration</b></td><td>quatre accords (I – vi – IV – V7), chacun arpégé : la main gauche commence, la droite continue vers l’aigu</td><td>faire sonner le piano, chauffer les mains</td></tr>
<tr><td><b>3. Cadence</b></td><td>I – IV – V7 – I, puis l’accord final tenu</td><td>conclure, et lancer la pièce</td></tr>
</tbody></table>
${W.score({ abc: EX_PRELUDE_FA, title: 'Un prélude en fa majeur', bpm: 60, startBpm: 50, practice: false, caption: 'Mesures 1-2 : la cadence en accords. Mesures 3 à 6 : chaque accord arpégé d’une main à l’autre (fa, ré mineur, si♭, do 7). Mesures 7-8 : la cadence plus rapide, puis l’accord de fa tenu. Ensuite, sans long silence, la pièce.' })}

<h2>Pourquoi ça marche</h2>
<p>La cadence installe la tonique dans l’oreille : après elle, chaque note de la pièce se situe par rapport à fa. La figuration, elle, parcourt le clavier : les mains trouvent leurs distances, le son se règle sur l’instrument du jour. Et le rituel aide la concentration : on entre dans la pièce au lieu de s’y jeter.</p>

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im-preluder', steps: [
  { id: 'cadence', title: 'La cadence, en accords', preset: 'n2-cadence-fa', mode: 'libre', loops: 2, lh: 'moi', formula: 'basse', bpm: 60,
    what: 'La cadence en fa majeur (la – si♭ – do – fa à la basse : I6 – IV – V7 – I). Ta main gauche joue la basse, ta main droite les accords, soprano fa – fa – mi – fa. Finis sur l’accord de fa, tenu.',
    why: 'Le début et la fin de tout prélude : la tonalité dite en quatre accords.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'final' }] },
  { id: 'figuration', title: 'Des accords en figuration', preset: 'prelude-fa', mode: 'libre', loops: 1, lh: 'moi', formula: 'arpege', bpm: 56,
    what: 'Chaque accord arpégé d’une main à l’autre : la main gauche commence (la basse, puis l’accord égrené, en brun), la main droite continue vers l’aigu avec les notes de l’accord, en croches. Suis la grille : fa, ré mineur, si♭, do 7…',
    why: 'La figuration fait sonner tout le clavier sans demander d’invention mélodique : c’est par elle que Mortensen fait commencer l’improvisation.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.75 }, { k: 'strong', min: 0.8 }, { k: 'nonstop', bars: 7 }] },
  { id: 'imiter', title: 'Imiter une figuration', preset: 'n2-cadence-fa', mode: 'echo', echo: { figure: true, count: 4 },
    what: 'L’appli joue deux mesures de figuration à la main droite (l’accord brisé qui monte et redescend) ; chante-les, puis rejoue-les.',
    why: 'Imiter d’abord : le dessin de la figuration entre dans l’oreille et dans la main avant que tu inventes les tiennes.',
    checks: [{ k: 'echo', min: 3 }] },
  { id: 'complet', title: 'Un prélude complet en fa majeur', preset: 'prelude-fa12', mode: 'libre', loops: 1, lh: 'moi', formula: 'arpege', bpm: 56,
    what: 'Douze mesures : la cadence (accords), quatre mesures de figuration, la cadence, et l’accord final tenu. Sans t’arrêter.',
    why: 'Les trois étapes enchaînées : c’est le prélude que tu joueras avant ton op. 15.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.7 }, { k: 'final' }, { k: 'nonstop', bars: 11 }] },
  { id: 'mineur', title: 'En mineur : fa, la et mi mineur', preset: 'prelude-fam12', mode: 'libre', loops: 1, lh: 'moi', formula: 'arpege', bpm: 54,
    keys: [{ tr: 0, label: 'fa mineur' }, { tr: 4, label: 'la mineur' }, { tr: -1, label: 'mi mineur' }],
    what: 'Le même prélude en fa mineur (ton op. 55), en la mineur (ta valse) et en mi mineur (la romance de Liszt) : n’oublie pas la sensible (mi♮, sol♯, ré♯).',
    why: 'Préluder dans la tonalité de chacune de tes pièces : c’est l’usage qui fixe la formule.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'lhChord', min: 0.7 }, { k: 'final' }] },
  { id: 'tonalites', title: 'En ré♭ et en sol majeur', preset: 'prelude-fa12', mode: 'libre', loops: 1, lh: 'moi', formula: 'arpege', bpm: 54,
    keys: [{ tr: -4, label: 'ré♭ majeur' }, { tr: 2, label: 'sol majeur' }],
    what: 'En ré♭ majeur (Clair de lune), puis en sol majeur : même plan, autres touches.',
    why: 'Mortensen fait tout transposer : un prélude qui ne marche qu’en fa n’est pas encore à toi.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'final' }] },
  { id: 'rituel', title: 'Le rituel : préluder avant ta pièce', preset: 'prelude-fa12', presets: ['prelude-fa12', 'prelude-fam12'], mode: 'libre', loops: 1, lh: 'moi', formula: 'arpege', bpm: 60,
    what: 'Avant de jouer ta pièce, trente secondes à une minute : ton prélude, dans sa tonalité (fa majeur pour l’op. 15, fa mineur pour l’op. 55 : menu de l’accompagnateur). Puis, sans long silence, la première phrase de la pièce.',
    why: 'Fait deux jours de suite, il devient un réflexe : la séance te le rappelle au début de chaque étape Pièce.',
    checks: [{ k: 'final' }, { k: 'nonstop', bars: 10 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Un prélude trop long.</b> Trente secondes à une minute : c’est une porte, pas une pièce.</li>
<li><b>S’arrêter entre les étapes.</b> La cadence enchaîne sur la figuration, qui enchaîne sur la cadence : garde la pulsation.</li>
<li><b>Une figuration qui saute.</b> D’une main à l’autre, la ligne monte sans trou : la droite reprend là où la gauche s’arrête.</li>
</ul>`)}
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
    goals: ['Jouer la règle de l’octave en do, montée et descente, par cœur.', 'La transposer en sol et en fa majeur, puis improviser au-dessus.'],
    goal: 'le dernier exercice (la basse et la mélodie à deux mains, en fa majeur) est validé.',
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

<h2>Pourquoi ces accords-là</h2>
<p>Les degrés stables (1, 3, 5) portent l’accord de tonique ou de dominante. Les autres sont des moments de passage : on y place un accord qui <b>tend vers la note suivante</b> de la basse. En montant, le 7e degré (si) porte V6/5 parce qu’il est la sensible : il doit monter vers do. En descendant, le 4e degré (fa) porte V4/2 parce qu’il est la septième de sol 7 : il doit descendre vers mi. La règle n’est pas arbitraire : elle suit la direction naturelle de chaque note.</p>
${W.score({ abc: OCTAVE_EX, title: 'La règle de l’octave en do majeur', bpm: 60, startBpm: 50, practice: false, caption: 'Les voix de la main droite gardent leurs notes communes : sensible qui monte, septième qui descend. En descendant, le fa♯ (sur la, 6e degré) annonce sol : une dominante secondaire.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im-octave', steps: [
  { id: 'basse', title: 'La basse seule, en disant les degrés', preset: 'n2-octave', mode: 'libre', loops: 1, lh: 'moi',
    what: 'Joue la basse de la règle à la main gauche (do – ré – mi … do, puis la descente), au clic, en disant à voix haute le degré et l’accord (1 : I, 2 : V4/3…).',
    why: 'La basse d’abord : c’est elle qui décide de l’accord. Quand tu la penses en degrés, l’harmonie suit toute seule.',
    checks: [{ k: 'bass', min: 0.75 }] },
  { id: 'soprano', title: 'Le soprano en or', preset: 'n2-octave', mode: 'squelette', loops: 1,
    what: 'L’appli joue la basse ; tu joues les accords à la main droite, avec le soprano en or au-dessus.',
    why: 'Les accords dans la main, en gardant les notes communes : le geste du claviériste qui accompagne.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'tonalites', title: 'En sol, puis en fa majeur', preset: 'n2-octave', mode: 'squelette', gold: 'memo', loops: 1, keys: [{ tr: -5, label: 'sol majeur' }, { tr: -7, label: 'fa majeur' }],
    what: 'Même dessin de main droite, autres touches : en sol majeur (fa♯), puis en fa majeur (si♭).',
    why: 'Une règle qui ne marche qu’en do n’est pas une règle : la transposer la rend utilisable partout.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'noires', title: 'Une mélodie en noires', preset: 'n2-octave', mode: 'libre', loops: 1,
    what: 'Sur la basse de l’appli, une mélodie en noires : une note de l’accord par temps.',
    why: 'Tu passes de l’accompagnement à la mélodie, sur la même harmonie.',
    checks: [{ k: 'rhythm', v: 'noires' }, { k: 'strong', min: 0.7 }] },
  { id: 'passages', title: 'Des notes de passage sur la basse', preset: 'n2-octave', mode: 'libre', loops: 2,
    what: 'La même mélodie, reliée par des notes de passage : au moins trois, entre deux notes de l’accord.',
    why: 'La basse conjointe appelle une mélodie conjointe : les deux voix avancent ensemble, comme dans un duo.',
    checks: [{ k: 'figure', f: 'passage', min: 3 }, { k: 'strong', min: 0.7 }] },
  { id: 'dialogue', title: 'Dialogue sur la basse', preset: 'n2-octave', mode: 'qr',
    what: 'L’appli joue deux mesures de mélodie sur la basse, tu réponds sur les deux suivantes : même rythme au départ, notes de l’accord sur les temps. Toute la montée, puis la descente.',
    why: 'Répondre sur une basse qui bouge : tu entends où va la phrase avant de la jouer.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'duo', title: 'À deux mains, en fa majeur', preset: 'n2-octave-fa', mode: 'libre', loops: 1, lh: 'moi', formula: 'basse', bpm: 56,
    what: 'Ta main gauche joue la basse de la règle (fa – sol – la … fa, puis la descente, en brun), ta main droite une mélodie en noires au-dessus : deux voix, comme un duo. En fa majeur, la tonalité de ton op. 15.',
    why: 'La basse et la mélodie dans tes deux mains : c’est la charpente de tout accompagnement, et le premier pas vers la réalisation d’une basse chiffrée.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'strong', min: 0.7 }, { k: 'rhythm', v: 'noires' }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Bouger toutes les voix à chaque accord.</b> Garde les notes communes ; ne bouge que celles qui doivent bouger.</li>
<li><b>Confondre montée et descente.</b> Sur fa : ii6/5 en montant, V4/2 en descendant. Sur la : IV6 en montant, ré 7 (avec fa♯) en descendant.</li>
<li><b>Penser aux accords avant la basse.</b> Chante la basse : elle guide.</li>
</ul>`)}
${W.more('Dans ta pièce', '<p>Dans la descente, la règle place déjà une dominante secondaire sur le 6e degré (ré 7 sur la, avec fa♯, qui mène à sol). Aux mesures 4 à 8 de l’op. 15, Chopin généralise ce principe : la basse descend fa – mi – ré – ré♭ – do – si – la, et presque chaque étape est préparée par la dominante de l’accord suivant. La règle de l’octave, en plus coloré.</p>')}
`,
  },

  /* ================================================================ 3 */
  {
    id: 'n2-im-romanesca', minutes: 20,
    title: 'Les schémas (1) : ouvrir et répondre',
    summary: 'Des phrases toutes faites que les compositeurs combinaient comme des mots : trois ouvertures (Romanesca, Do-Ré-Mi, Meyer) et une réponse (Prinner).',
    essentials: [
      'Un <b>schéma</b> est une petite phrase toute faite : une basse, une mélodie, quelques accords, que tous les compositeurs connaissaient.',
      'Pour <b>ouvrir</b> : la <b>Romanesca</b> (basse do – si – la – sol, mélodie mi – ré – do – si, à la dixième), le <b>Do-Ré-Mi</b> (mélodie do – ré – mi sur la basse do – si – do), le <b>Meyer</b>.',
      'Pour <b>répondre</b> : le <b>Prinner</b>, basse fa – mi – ré – do, mélodie la – sol – fa – mi, qui redescend vers la tonique.',
    ],
    goals: ['Enchaîner une ouverture, un Prinner et une cadence par cœur en do.', 'Improviser une mélodie sur ces schémas, puis l’orner.'],
    goal: 'le dernier exercice (enchaîner librement les schémas, sans t’arrêter) est validé.',
    body: W => `
<p>Le musicologue Robert Gjerdingen a montré que la musique du XVIIIe siècle est faite de ${W.term('schémas', 'enchaînements de quelques accords, avec une basse et une mélodie caractéristiques, que les compositeurs combinaient comme des mots')} : des enchaînements que tous connaissaient et combinaient. Une phrase type : une <b>ouverture</b>, une <b>réponse</b> qui redescend, une <b>cadence</b>. En apprendre quelques-uns, c’est se faire un vocabulaire ; improviser, c’est les enchaîner et les orner.</p>

<h2>Romanesca, Prinner, cadence</h2>
<table>
<thead><tr><th>Schéma</th><th>Basse</th><th>Accords</th><th>Soprano</th></tr></thead>
<tbody>
<tr><td><b>Romanesca</b></td><td>do – si – la – sol</td><td>I – V6 – vi – iii6</td><td>mi – ré – do – si</td></tr>
<tr><td><b>Prinner</b></td><td>fa – mi – ré – do</td><td>IV – I6 – V4/3 – I</td><td>la – sol – fa – mi</td></tr>
<tr><td><b>Cadence</b></td><td>mi – fa – sol – do</td><td>I6 – ii6 – V7 – I</td><td>sol – fa – fa – mi</td></tr>
</tbody></table>
${W.score({ abc: ROMANESCA_EX, title: 'Romanesca, Prinner, cadence (do majeur)', bpm: 60, startBpm: 50, practice: false, caption: 'La basse descend une octave entière, de do à do. Le soprano suit la basse à la ' + W.term('dixième', 'une tierce plus une octave : mi au-dessus de do, mais une octave plus haut') + ' (mi sur do, ré sur si…) : le moyen le plus sûr d’improviser une mélodie qui sonne.' })}

<h2>Pourquoi la dixième</h2>
<p>Deux voix qui avancent en dixièmes restent consonantes à chaque pas, et pourtant différentes : l’une donne la tierce de l’accord, l’autre sa basse. En octaves, au contraire, elles se confondent : on n’entend plus qu’une ligne, creuse.</p>
${W.ecoute({ title: 'La Romanesca : soprano en dixièmes ou en octaves', bpm: 60, items: [
  { label: 'En dixièmes', seq: ['mi4 | ré4 | do4 | si3', 'do2 | si1 | la1 | sol1'], note: 'Deux voix distinctes, toujours consonantes : le duo sonne plein.' },
  { label: 'En octaves', seq: ['do4 | si3 | la3 | sol3', 'do2 | si1 | la1 | sol1'], note: 'La même ligne doublée : vide, comme une seule voix.' },
] })}

<h2>D’autres ouvertures</h2>
<p>Le <b>Do-Ré-Mi</b> fait monter la mélodie pendant que la basse fait un aller-retour (do – si – do) : une ouverture qui « pose une question ». Ici, il s’arrête sur une demi-cadence, puis un Prinner répond. Le <b>Meyer</b> ouvre en deux gestes, comme un dialogue : do – si, puis fa – mi.</p>
${W.score({ abc: DOREMI_EX, title: 'Do-Ré-Mi, demi-cadence, Prinner', bpm: 60, startBpm: 50, practice: false, caption: 'Le soprano monte do – ré – mi pendant que la basse fait do – si – do ; arrêt sur sol (V) avec ré au soprano : la question. Le Prinner répond, en dixièmes avec la basse.' })}
${W.score({ abc: MEYER_EX, title: 'Le Meyer', bpm: 60, practice: false, caption: 'Soprano do – si, puis fa – mi, sur I – V4/3, puis V6/5 – I : deux gestes qui se répondent.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im-romanesca', steps: [
  { id: 'duo', title: 'Le duo à la dixième', preset: 'n2-romanesca', mode: 'squelette', loops: 1, lh: 'moi',
    what: 'Joue la basse (main gauche) et le soprano en or (main droite), sans les voix du milieu : les deux mains descendent ensemble, à la dixième.',
    why: 'Le schéma tient en deux voix : basse et soprano. Le reste n’est que du remplissage.',
    checks: [{ k: 'bass', min: 0.75 }, { k: 'targets', min: 0.75 }] },
  { id: 'soprano', title: 'Le soprano sur les accords', preset: 'n2-romanesca', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'L’appli joue les accords ; pose le soprano en or au premier temps de chaque mesure.',
    why: 'Tu entends maintenant le schéma complet, harmonies comprises, sous ta ligne.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'orner', title: 'Orner les schémas', preset: 'n2-romanesca', mode: 'squelette', gold: 'memo', loops: 2,
    what: 'Garde la note en or au premier temps et remplis avec les outils du niveau 1 : passages, broderies, une appoggiature par schéma.',
    why: 'C’est exactement ce que faisaient les élèves napolitains : un schéma appris, orné chaque fois autrement.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'figure', f: 'ornement', min: 4 }] },
  { id: 'doremi', title: 'Do-Ré-Mi, puis le Prinner', preset: 'n2-doremi', mode: 'squelette', loops: 2,
    what: 'Une autre ouverture : le soprano monte do – ré – mi (basse do – si – do), s’arrête sur ré (demi-cadence), puis le Prinner répond (la – sol – fa – mi).',
    why: 'Un deuxième mot de vocabulaire : on peut maintenant choisir comment ouvrir.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'dialogue', title: 'Dialogue : l’appli ouvre, tu réponds par le Prinner', preset: 'n2-roma-prinner', mode: 'qr', qr: { variant: 'schema', bars: 4, count: 6 },
    what: 'L’appli joue une Romanesca (quatre mesures, son soprano mi – ré – do – si, orné) ; tu réponds sur les quatre suivantes par le Prinner : la – sol – fa – mi au premier temps de chaque mesure, orné si tu veux. Trois fois.',
    why: 'Les schémas sont des mots qu’on échange : l’un ouvre, l’autre répond. Les élèves napolitains dialoguaient ainsi au clavier avec leur maître.',
    checks: [{ k: 'answers', min: 2, of: 3 }] },
  { id: 'tonalites', title: 'Dans trois autres tonalités', preset: 'n2-romanesca', mode: 'squelette', gold: 'memo', loops: 1, keys: [{ tr: -5, label: 'sol majeur' }, { tr: -7, label: 'fa majeur' }, { tr: 2, label: 'ré majeur' }],
    what: 'Le soprano de la Romanesca, du Prinner et de la cadence en sol, en fa, puis en ré majeur, de mémoire : écoute le squelette, chante-le, joue-le.',
    why: 'Un schéma n’est un mot de vocabulaire que s’il se dit dans toutes les tonalités.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'enchainer', title: 'Enchaîner librement', preset: 'n2-romanesca', presets: ['n2-romanesca', 'n2-doremi', 'n2-meyer'], mode: 'libre', loops: 2, keys: [{ tr: 0, label: 'do majeur' }, { tr: -7, label: 'fa majeur' }],
    what: 'Sans notes en or : choisis une ouverture (menu : Romanesca, Do-Ré-Mi ou Meyer), et improvise ta mélodie sur l’enchaînement, deux fois, sans t’arrêter. En do, puis en fa majeur (ton op. 15).',
    why: 'Le vocabulaire devient une langue quand on peut le parler sans y penser.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Une Romanesca en octaves avec la basse.</b> La dixième (mi sur do), jamais l’octave : sinon on n’entend qu’une voix.</li>
<li><b>Orner au point de perdre le soprano.</b> La note en or reste au premier temps ; l’ornement vient après.</li>
<li><b>Un Prinner qui ne descend pas jusqu’à mi.</b> Il finit sur la tierce de l’accord de do, sur la tonique à la basse : c’est sa conclusion.</li>
</ul>`)}
${W.more('Où on les entend', '<p>Le Canon de Pachelbel repose sur une variante de la Romanesca à basse sautante (1 – 5 – 6 – 3). Le Prinner est partout chez Mozart et Haydn, à la fin des premières phrases. Dans l’op. 15 de Chopin, mesures 4 à 8, une basse descend aussi pas à pas sous la mélodie, mais Chopin la remplit de couleurs chromatiques là où la Romanesca et le Prinner restent dans la gamme.</p>')}
`,
  },

  /* ================================================================ 4 */
  {
    id: 'n2-im-schemas', minutes: 20,
    title: 'Les schémas (2) : la marche, Monte et Fonte',
    summary: 'Deux schémas qui font avancer la musique : le Monte monte d’un degré, la Fonte redescend. Avec eux et les ouvertures, une phrase entière de seize mesures.',
    essentials: [
      '<b>Monte</b> (la montée) : « dominante → accord », repris un degré plus haut (do 7 → fa, puis ré 7 → sol).',
      '<b>Fonte</b> (la fontaine) : l’inverse, un degré plus bas (la 7 → ré mineur, puis sol 7 → do).',
      'Dans chaque paire, la <b>septième</b> descend et la <b>sensible</b> monte : c’est ce qui tire la musique vers l’accord suivant. Le même motif, recopié à chaque étage : c’est une <b>marche</b>.',
    ],
    goals: ['Jouer le Monte et la Fonte, et les reconnaître à l’oreille.', 'Improviser un motif et le recopier un degré plus haut, puis plus bas ; enchaîner seize mesures.'],
    goal: 'l’exercice « seize mesures » est validé : ouverture, Monte, Fonte, cadence, sans t’arrêter.',
    body: W => `
<p>Après une ouverture, il faut avancer avant de conclure. Les compositeurs du XVIIIe siècle utilisaient pour cela des ${W.term('marches', 'un motif repris plusieurs fois à des hauteurs différentes, sur des accords qui s’enchaînent de la même façon')} : un petit enchaînement, recopié un degré plus haut (le Monte) ou un degré plus bas (la Fonte). Une phrase type devient : ouverture, Monte ou Fonte, cadence.</p>

<h2>Pourquoi ça avance</h2>
<p>Chaque paire du Monte et de la Fonte est une mini-cadence : un accord de septième de dominante, puis l’accord qu’il annonce. Do 7 n’est pas un accord de do majeur comme les autres : son si♭ (la septième) veut descendre vers la, son mi (la sensible de fa) veut monter vers fa. L’arrivée sur fa sonne comme une petite conclusion, et pourtant on n’est pas en fa majeur. Recopiée un degré plus haut, la paire fait monter la tension ; un degré plus bas, elle la fait retomber.</p>
${W.ecoute({ title: 'Do, puis fa : avec ou sans la septième', bpm: 60, items: [
  { label: 'Do majeur → fa majeur', seq: 'do2 mi3 sol3 do4:2 | fa1 fa3 la3 do4:3', note: 'Deux accords voisins : on passe, sans direction particulière.' },
  { label: 'Do 7 → fa majeur', seq: 'do2 mi3 si♭3 do4:2 | fa1 fa3 la3 do4:3', note: 'Le si♭ descend vers la, le mi monte vers fa : fa arrive comme une conclusion. C’est le moteur du Monte.' },
] })}

${W.score({ abc: MONTE_FONTE_EX, title: 'Monte, puis Fonte (do majeur)', bpm: 60, startBpm: 50, practice: false, caption: 'Monte : do 7/mi → fa, puis ré 7/fa♯ → sol, un ton plus haut. Fonte : la 7/do♯ → ré mineur, puis sol 7/si → do, un ton plus bas. Chaque septième (si♭, do, sol, fa) descend d’un degré et chaque sensible (mi, fa♯, do♯, si) monte.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im-schemas', steps: [
  { id: 'soprano', title: 'Le soprano en or', preset: 'n2-monte-fonte', mode: 'squelette', loops: 2,
    what: 'L’appli joue les accords du Monte puis de la Fonte ; pose le soprano en or au premier temps de chaque mesure.',
    why: 'Les deux schémas dans l’oreille et dans la main, avant d’improviser dessus.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'monte', title: 'Le Monte : le même motif, un degré plus haut', preset: 'n2-monte-fonte', mode: 'libre', loops: 1,
    what: 'Invente un motif sur les deux premières mesures (do 7 → fa), et rejoue-le <b>un ton plus haut</b> sur les deux suivantes (ré 7 → sol) : même rythme, même dessin.',
    why: 'C’est la répétition qui fait la marche : l’oreille reconnaît le motif et suit sa montée.',
    checks: [{ k: 'sequence', from: 1, len: 2, reps: 1, dir: 1 }] },
  { id: 'fonte', title: 'La Fonte : un degré plus bas', preset: 'n2-monte-fonte', mode: 'libre', loops: 1,
    what: 'Sur les mesures 5-6 (la 7 → ré mineur), un motif ; sur les mesures 7-8 (sol 7 → do), le même, <b>un ton plus bas</b>.',
    why: 'La marche descendante détend : elle prépare la cadence.',
    checks: [{ k: 'sequence', from: 5, len: 2, reps: 1, dir: -1 }] },
  { id: 'dialogue', title: 'Dialogue : l’appli joue le modèle, tu fais la marche', preset: 'n2-monte-fonte', mode: 'qr', qr: { variant: 'sequence', dirs: { 2: 1, 6: -1 } },
    what: 'L’appli joue un motif sur les deux premières mesures du Monte ; tu le rejoues un ton plus haut sur les deux suivantes. Puis elle joue un motif sur la Fonte, et tu le rejoues un ton plus bas.',
    why: 'La marche se fait à deux : le modèle, puis sa copie. Recopier un motif entendu à une autre hauteur entraîne l’oreille autant que les doigts.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'tonalites', title: 'En sol, puis en fa majeur', preset: 'n2-monte-fonte', mode: 'squelette', gold: 'memo', loops: 1, keys: [{ tr: -5, label: 'sol majeur' }, { tr: -7, label: 'fa majeur' }],
    what: 'Le soprano du Monte et de la Fonte en sol, puis en fa majeur, de mémoire : écoute le squelette, chante-le, joue-le.',
    why: 'Trois tonalités pour chaque schéma : do, sol et fa. La transposition fixe le geste et l’oreille.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'phrase', title: 'Seize mesures : ouvrir, avancer, conclure', preset: 'n2-phrase16', mode: 'libre', loops: 1, keys: [{ tr: 0, label: 'do majeur' }, { tr: -7, label: 'fa majeur' }],
    what: 'Une phrase complète du XVIIIe siècle : Do-Ré-Mi (ouverture), Monte et Fonte (on avance), cadence (on conclut). Improvise ta mélodie sans t’arrêter, en do, puis en fa majeur.',
    why: 'Avec trois ou quatre schémas, on improvise des phrases entières : c’est ainsi qu’apprenaient Mozart et ses contemporains.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 15 }, { k: 'final' }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>La septième qui ne descend pas.</b> Dans do 7 → fa, si♭ va vers la ; dans sol 7 → do, fa va vers mi.</li>
<li><b>Une reprise qui ne monte (ou ne descend) pas d’un degré.</b> Recopie le motif exactement, un ton plus haut ou plus bas.</li>
<li><b>Varier dès la première reprise.</b> La marche, c’est la répétition ; on varie seulement après l’avoir entendue.</li>
</ul>`)}
${W.more('Dans ta pièce', '<p>Mesures 41 à 44 de l’op. 15 : la♭ 7, puis si♭ 7, un ton plus haut, chacun dominante d’une tonalité nouvelle (ré♭, puis mi♭ mineur). C’est un Monte : une dominante reprise plus haut, qui fait monter la tension avant la redescente des mesures 45 à 48.</p>')}
`,
  },

  /* ================================================================ 5 */
  {
    id: 'n2-im1', minutes: 25,
    title: 'Orner comme Chopin',
    summary: 'Chopin varie ses propres thèmes quand ils reviennent : mêmes harmonies, mêmes notes d’appui, autre chemin entre elles. On l’observe, puis on fait pareil, un ornement à la fois.',
    essentials: [
      'Quand un thème revient, Chopin le <b>varie</b> : mêmes harmonies, mêmes <b>notes d’appui</b>, mais le chemin entre elles change.',
      'Ses outils : <b>broderie</b> (simple, double ou chromatique), <b>appoggiature</b>, <b>déplacement d’octave</b>, <b>fioriture</b> (groupe rapide de 5, 7, 11 notes…).',
      'Les ornements sont <b>plus légers</b> que les notes qu’ils ornent, et la <b>main gauche ne ralentit pas</b> : c’est elle qui garde le temps.',
    ],
    goals: ['Reconnaître les ornements de Chopin dans tes deux nocturnes.', 'Orner une mélodie, un ornement après l’autre, sans perdre ses notes d’appui ni la pulsation.'],
    goal: 'le dernier exercice (simple, puis orné, sur les harmonies de ton op. 15) est validé.',
    body: W => `
<p>Les ornements de Chopin viennent de l’improvisation et du chant : quand un thème revient, il le chante autrement, comme une cantatrice qui varie sa reprise. Ses élèves ont noté dans leurs partitions des variantes qu’il jouait (pour l’op. 9 n° 2, une version différente à chaque retour du thème). La méthode se lit dans ses partitions : il garde les notes d’appui et l’harmonie, et ne change que le chemin.</p>

<h2>Chopin se varie lui-même</h2>
${W.score({ abc: EX_OP55_VAR, title: 'Op. 55 n° 1 : le thème (m. 3-4), puis sa reprise (m. 75-76)', bpm: 56, startBpm: 46, practice: false, pedal: [0, 2, 4, 6, 8, 10, 12, 14], pedalEnd: 16, caption: 'Mêmes accords, mêmes notes d’appui : do, fa, mi♭, ré♭, puis do. À la reprise, chaque temps devient un triolet : ' + W.term('double broderie', 'on encadre la note par ses deux voisines (celle du dessous, puis celle du dessus, ou l’inverse) avant de la jouer') + ' autour de fa (mi♮ – sol – fa) et de ré♭ (do – mi♭ – ré♭), sauts d’octave (mi♭5 – mi♭4, do5 – do4), puis si♮ et ré♭ qui encadrent le do final.' })}
${W.score({ abc: EX_OP15_VAR, title: 'Op. 15 n° 1 : mesures 5 à 7, puis leur reprise (m. 53-55)', bpm: 69, startBpm: 50, practice: false, caption: 'Tout est identique, sauf la mesure 54 : le petit triolet ré – mi – fa de la mesure 6 devient un ' + W.term('septolet', 'sept notes égales dans la durée d’un temps : une fioriture, à jouer souplement, comme une vocalise') + ' qui brode autour de ré (ré – mi – ré – do♯ – ré) avant de monter vers fa.' })}

<h2>La boîte à outils, du plus simple au plus orné</h2>
<p>Chaque ornement est l’un des exercices ci-dessous, du plus simple au plus orné.</p>
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
<p>Toutes ces figures se pensent de la même façon : <b>quelle note je vise, et comment j’y arrive</b>. La broderie la quitte et y revient ; la double broderie l’encercle ; l’appoggiature la fait attendre ; la fioriture y retombe après un détour. La note visée, elle, reste à sa place.</p>

<h2>Le même travail sur une mélodie simple</h2>
${W.score({ abc: PLAIN, title: 'La mélodie simple (i – iv – V7 – i)', bpm: 60, practice: false, pedal: PED4, pedalEnd: 16 })}
${W.score({ abc: ORNATE, title: 'La même mélodie, ornée', bpm: 60, startBpm: 52, practice: false, pedal: PED4, pedalEnd: 16, caption: 'Mêmes notes d’appui aux mêmes endroits. Mesures 1 à 3 : un groupe autour de la note (ré♭ – do – si♮ – do) ; mesure 1 : l’appoggiature sol retarde le fa d’un temps ; mesure 4 : une fioriture de six notes avant le fa final.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im1', steps: [
  { id: 'appuis', title: 'Les notes d’appui seules', preset: 'n2-orner', mode: 'squelette', loops: 2,
    what: 'Les notes en or sont celles de la mélodie simple (do, fa, do, la♭) : joue-les seules, en valeurs longues, deux fois.',
    why: 'On n’orne bien que ce qu’on entend : d’abord la mélodie nue.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'rhythm', v: 'longues' }] },
  { id: 'imiter', title: 'Imiter une version ornée', preset: 'n2-orner', mode: 'echo', echo: { ornate: true, count: 4 },
    what: 'L’appli joue deux mesures ornées (la note d’appui, sa broderie chromatique, une note de passage vers la suivante) ; chante-les, puis rejoue-les. Quatre phrases.',
    why: 'Imiter avant d’inventer : l’ornement entre par l’oreille, comme chez les élèves de Chopin, qui notaient ses variantes en l’écoutant.',
    checks: [{ k: 'echo', min: 3 }] },
  { id: 'broderie', title: 'Une broderie, simple ou chromatique', preset: 'n2-orner', mode: 'squelette', gold: 'memo', loops: 2,
    what: 'Autour des notes en or, des broderies : la note, sa voisine (un demi-ton dessous, comme Chopin), la note.',
    why: 'L’ornement le plus simple : la note vit sans être quittée.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'figure', f: 'broderie', min: 2 }] },
  { id: 'double', title: 'La double broderie', preset: 'n2-orner', mode: 'squelette', gold: 'memo', loops: 2,
    what: 'Juste avant une note en or, ses deux voisines (celle du dessous puis celle du dessus, ou l’inverse), puis la note, à temps — comme Chopin à la reprise de l’op. 55 (mi♮ – sol – fa).',
    why: 'Une figure d’approche : on encercle la note visée avant de s’y poser. Elle se pense à partir de la note d’arrivée.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'figure', f: 'double', min: 2 }] },
  { id: 'appoggiature', title: 'L’appoggiature qui retarde', preset: 'n2-orner', mode: 'squelette', gold: 'memo', loops: 2,
    what: 'Retarde certaines notes en or : joue d’abord la note du dessus sur le temps, puis la note en or (sol → fa, comme à la mesure 1 de la mélodie ornée). Au moins deux fois.',
    why: 'La note visée arrive en retard : l’attente devient expressive.',
    checks: [{ k: 'figure', f: 'appoggiature', min: 2 }, { k: 'nonstop', bars: 7 }] },
  { id: 'fioriture', title: 'La fioriture', preset: 'n2-orner', mode: 'squelette', gold: 'memo', loops: 2,
    what: 'Avant une note en or, une fioriture : cinq à sept notes rapides, d’un seul geste, qui retombent pile sur la note. La main gauche ne t’attend pas.',
    why: 'L’ornement le plus libre de Chopin, et le plus exigeant : il doit tenir dans le temps.',
    checks: [{ k: 'figure', f: 'fioriture', min: 1 }, { k: 'targets', min: 0.6 }] },
  { id: 'op15', title: 'Sur les harmonies de ton op. 15 : simple, puis orné', preset: 'n2-op15-A', mode: 'squelette', loops: 2, bpm: 54,
    what: 'Les vraies harmonies des mesures 1 à 8 de ton nocturne (un accord par temps quand l’harmonie change). Premier tour : les notes d’appui de Chopin seules (fa, ré, mi…, en or). Deuxième tour : la même ligne, ornée avec les figures de la leçon, sans que la pulsation bouge.',
    why: 'Tu refais le travail de Chopin sur sa propre mélodie : la reprise ornée, comme il le fait lui-même à la mesure 54.',
    checks: [{ k: 'reprise', ratio: 1.5 }, { k: 'targets', min: 0.6 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Un ornement plus fort que la note d’appui.</b> L’ornement est léger ; la note visée porte le poids.</li>
<li><b>Ralentir la main gauche pour faire tenir une fioriture.</b> La main gauche garde le temps ; c’est la fioriture qui se resserre.</li>
<li><b>Orner partout.</b> Une ou deux idées par phrase, et plutôt à la reprise.</li>
</ul>`)}
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
    goal: 'l’exercice « ton modèle » est validé : un modèle, deux reprises un degré plus bas, et la fin sur ré.',
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

<h2>Pourquoi la marche par quintes porte si loin</h2>
<p>Une basse qui descend par quintes est le mouvement le plus fort de l’harmonie : chaque accord est la dominante du suivant, ou presque. Le motif recopié sur ces accords donne à l’oreille un repère sûr (elle reconnaît le modèle) pendant que l’harmonie voyage. C’est pour cela qu’on recopie sans varier : la surprise viendra de la sortie, la cadence.</p>

<h2>Le modèle et ses reprises</h2>
${W.score({ abc: EX_MARCHE_ELEGIE, title: 'Marche par quintes en élégie (ré mineur)', bpm: 54, startBpm: 46, pedal: PED8, pedalEnd: 32, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_MARCHE }], caption: 'Le modèle (mesures 1-2) : un arpège qui monte (ré – fa – la), puis un soupir (la → sol). Il est recopié un degré plus bas (do – mi – sol, fa), puis encore (si♭ – ré – fa, mi). En mesure 7, on quitte le modèle : la septième sol descend sur fa, la sensible do♯ mène à ré. Version phrasée : chaque reprise un peu plus douce, puis un élan vers la cadence.' })}

<h2>Une élégie sur une basse qui descend</h2>
${W.score({ abc: EX_ELEGIE, title: 'Élégie en ré mineur', bpm: 54, startBpm: 46, pedal: PED8, pedalEnd: 32, variants: [{ label: 'Écouter' }, { label: 'Phrasé', ...PH_ELEGIE }], caption: 'Autre grille du même style : la basse descend (ré – do – si♭ – la). La phrase se suspend sur la (mesure 4), monte vers le sommet (la aigu, mesure 6) et retombe sur la dominante : la grille recommence.' })}

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im2', steps: [
  { id: 'vague', title: 'La vague à la main gauche', preset: 'n2-marche-elegie', mode: 'libre', loops: 1, lh: 'moi',
    what: 'Joue toi-même les arpèges de la main gauche (les notes en brun s’allument) : la basse au premier temps, puis la vague, une pédale à chaque basse.',
    why: 'La vague fait l’élégie ; elle doit couler sans effort pour que la main droite puisse chanter.',
    checks: [{ k: 'bass', min: 0.75, per: 6 }] },
  { id: 'or', title: 'Le modèle et ses reprises en or', preset: 'n2-marche-elegie', mode: 'squelette', loops: 1,
    what: 'Main gauche par l’appli. Les notes en or donnent le modèle (ré – sol) puis ses reprises (do – fa, si♭ – mi) : pose-les au premier temps.',
    why: 'Le squelette de la marche : deux notes par modèle, qui descendent d’un degré à chaque reprise.',
    checks: [{ k: 'targets', min: 0.75 }] },
  { id: 'meme-rythme', title: 'Même rythme à chaque reprise', preset: 'n2-marche-elegie', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'Habille le modèle (mesures 1-2), puis recopie <b>le même rythme et le même dessin</b> à chaque reprise, un degré plus bas.',
    why: 'C’est la répétition exacte qui fait entendre la marche ; une reprise variée perd le fil.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'sequence', from: 1, len: 2, reps: 2, dir: -1 }] },
  { id: 'dialogue', title: 'Dialogue : l’appli joue le modèle, tu fais la reprise', preset: 'n2-marche-elegie', mode: 'qr', qr: { variant: 'sequence', dirs: { 2: -1 } },
    what: 'L’appli joue un modèle sur les mesures 1-2 ; tu le recopies un degré plus bas sur les mesures 3-4. Puis elle joue la deuxième reprise, et tu conclus sur la cadence (do♯ – ré).',
    why: 'La marche à deux voix : entendre le modèle, puis le reproduire plus bas, c’est exactement ce que l’oreille doit faire dans une élégie.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'ton-modele', title: 'Ton modèle', preset: 'n2-marche-elegie', mode: 'libre', loops: 1,
    what: 'Sans notes en or : invente un autre modèle sur les mesures 1-2, recopie-le deux fois un degré plus bas, puis la cadence (do♯ – ré).',
    why: 'Tu fabriques toi-même la marche, du modèle à la sortie.',
    checks: [{ k: 'sequence', from: 1, len: 2, reps: 2, dir: -1 }, { k: 'final' }] },
  { id: 'elegie', title: 'L’élégie sur la basse qui descend', preset: 'elegie-re', mode: 'libre', loops: 2, keys: [{ tr: 0, label: 'ré mineur' }, { tr: 3, label: 'fa mineur' }],
    what: 'Autre grille : la basse descend (ré – do – si♭ – la). Une mélodie lente qui monte vers un sommet (mesures 5 à 7) et retombe. En ré mineur, puis en fa mineur (la tonalité du Con fuoco).',
    why: 'Le style sans la marche : tout repose sur la courbe de la phrase.',
    checks: [{ k: 'peak', from: 5, to: 7 }, { k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 14 }] },
  { id: 'deux-mains', title: 'L’élégie à deux mains, vague simplifiée', preset: 'elegie-re', mode: 'libre', loops: 1, hands: true, formula: 'arpege', bpm: 50,
    what: 'Ta main gauche fait une vague simplifiée (la basse, puis l’accord égrené sous le do central), ta main droite chante au-dessus une mélodie lente qui monte vers son sommet. Trois étapes : l’appli joue tout, puis la basse seule, puis le clic seul.',
    why: 'La vague complète couvre deux octaves : trop large pour commencer. La version simplifiée garde l’essentiel (la basse, l’harmonie, le mouvement) et te laisse chanter.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'nonstop', bars: 7 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Un modèle trop long ou trop chargé.</b> Deux mesures simples, faciles à recopier.</li>
<li><b>Changer de rythme à la reprise.</b> Même rythme, même dessin : seule la hauteur change.</li>
<li><b>Ne pas sortir de la marche.</b> En mesure 7, quitte le modèle : la septième descend, la sensible do♯ mène à ré.</li>
</ul>`)}
${W.tip('Écrire ton élégie', '<p>Dans l’onglet <a href="#/outils/composition">Composition</a>, choisis « Élégie » : l’appli joue les vagues en ré mineur, tu enregistres ta mélodie, elle devient une partition de huit mesures que tu peux reprendre mesure par mesure, garder et exporter (MIDI, pour MuseScore).</p>')}
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
    goals: ['Comprendre la conduite des voix du Prélude op. 28 n° 4.', 'Improviser une mélodie presque immobile sur ses accords, puis sur une basse qui descend.'],
    goal: 'l’exercice « ta note, qui bouge par degrés » est validé.',
    body: W => `
<p>Dans le Prélude en mi mineur, Chopin fait presque tout avec l’harmonie. La main droite chante si – do – si pendant quatre mesures, puis la – si – la ; la main gauche répète ses accords en croches et, à chaque changement, une seule de ses trois voix descend d’un demi-ton. C’est la ${W.term('conduite des voix', 'la manière dont chaque note d’un accord rejoint une note de l’accord suivant ; ici, par demi-tons, sans saut')} poussée à l’extrême.</p>
${W.score({ abc: OP28.n4a, title: 'Prélude op. 28 n° 4, mesures 1 à 12', qpm: 54, startBpm: 22, pedal: PED_PRELUDE, pedalEnd: 49, caption: 'Suis une voix de la main gauche : le mi du haut descend (mi – mi♭ – ré – do♯ – do – si…), puis celle du milieu, puis la basse. La mélodie, elle, tient son si, qui change de rôle à chaque accord : quinte de mi mineur, calme (mesure 1) ; partie d’une sixte augmentée fa – la – si – mi♭, très tendue (mesure 3) ; fondamentale de si – ré – fa – la deux temps plus tard. Mesure 12 : la demi-cadence sur si 7, puis le silence.' })}

<h2>Pourquoi une note tenue suffit</h2>
<p>Une note ne sonne pas pareil sur tous les accords. Sur l’un, elle est au repos ; sur le suivant, elle frotte ; sur un troisième, elle redevient stable. Quand l’harmonie bouge, la mélodie peut rester immobile : c’est l’accord qui raconte l’histoire.</p>
${W.ecoute({ title: 'Une note, trois couleurs', bpm: 40, items: [
  { label: 'Si tenu sur trois accords', seq: ['si3:2 | si3:2 | si3:2', 'sol2 si2 mi3:2 | fa2 la2 mi♭3:2 | fa♯2 la2 ré♯3:2'], note: 'Calme sur mi mineur, tendu sur fa – la – mi♭, de nouveau stable sur si 7 (sa fondamentale). La mélodie n’a pas bougé.' },
] })}

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

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im4', steps: [
  { id: 'tenir', title: 'Tenir la note de Chopin', preset: 'prelude-mi', mode: 'squelette', loops: 1,
    what: 'Une note en or par mesure (si, si, si, si, la…) : tiens-la toute la mesure. Écoute-la changer de couleur sous les accords.',
    why: 'Avant d’ajouter quoi que ce soit, entendre ce que fait l’harmonie à une note immobile.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'density', max: 2 }] },
  { id: 'broderie', title: 'Une broderie, pas plus', preset: 'prelude-mi', mode: 'squelette', gold: 'memo', loops: 1,
    what: 'Même chose, avec au plus une broderie par mesure (do au-dessus de si, si au-dessus de la), comme Chopin à la mesure 1.',
    why: 'Dans ce style, un seul ornement suffit : il fait remarquer l’immobilité du reste.',
    checks: [{ k: 'targets', min: 0.75 }, { k: 'density', max: 3 }, { k: 'figure', f: 'broderie', min: 1 }] },
  { id: 'main-gauche', title: 'Les accords de Chopin à la main gauche', preset: 'prelude-mi', mode: 'libre', loops: 1, lh: 'moi', formula: 'plaque', bpm: 44,
    what: 'Joue toi-même les accords de la main gauche, plaqués et tenus, une octave plus bas que chez Chopin (en brun). À chaque changement, une seule voix descend d’un demi-ton : cherche laquelle avant de jouer. Chante la mélodie (si…) au-dessus.',
    why: 'Simplifier, c’est garder l’essentiel : trois voix qui glissent, sans les croches répétées. Les jouer toi-même, c’est entendre de l’intérieur ce que fait Chopin.',
    checks: [{ k: 'lhChord', min: 0.75 }, { k: 'lhLead', max: 3 }] },
  { id: 'deux-mains', title: 'La note tenue sur tes accords', preset: 'prelude-mi', mode: 'squelette', gold: 'memo', loops: 1, lh: 'moi', formula: 'plaque', bpm: 44,
    what: 'Les deux mains : tes accords à gauche, la note de Chopin à droite (si, si, si, si, la…), tenue tant qu’elle sonne. De mémoire : écoute d’abord le squelette.',
    why: 'Tenir une note pendant que l’autre main change l’harmonie sous elle : c’est tout le prélude.',
    checks: [{ k: 'targets', min: 0.7 }, { k: 'lhChord', min: 0.75 }] },
  { id: 'ta-note', title: 'Ta note, qui bouge par degrés', preset: 'prelude-mi', mode: 'libre', loops: 1,
    what: 'Sans notes en or : commence sur une autre note (mi aigu ou sol), tiens-la tant qu’elle sonne, descends d’un degré quand l’accord la rend dure. Arrête-toi sur si 7, mesure 12.',
    why: 'Tu écoutes l’harmonie pour décider : c’est l’oreille qui joue, pas les doigts.',
    checks: [{ k: 'stepwise', min: 0.8 }, { k: 'density', max: 2.5 }] },
  { id: 'dialogue', title: 'Dialogue sur la basse qui descend', preset: 'n2-lamento', mode: 'qr', qr: { variant: 'contour' },
    what: 'Sur la basse de lamento (fa majeur), l’appli joue deux mesures ; tu réponds en suivant leur dessin : mêmes montées, mêmes descentes, d’autres notes si tu veux.',
    why: 'Suivre un dessin entendu, sur une harmonie qui glisse : l’oreille guide la main.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'basse', title: 'Sur une basse qui descend', preset: 'n2-lamento', presets: ['n2-lamento', 'choral-ut'], mode: 'libre', loops: 2,
    what: 'La basse de lamento (fa – mi – mi♭ – ré – ré♭ – do) en fa majeur, ou le choral en do mineur (menu) : une mélodie par degrés, notes de l’accord aux temps forts.',
    why: 'Le même principe sur d’autres grilles : la basse descend, la mélodie se tient au-dessus.',
    checks: [{ k: 'strong', min: 0.7 }, { k: 'stepwise', min: 0.6 }, { k: 'nonstop', bars: 14 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Bouger à chaque accord.</b> Tiens la note tant qu’elle sonne ; ne bouge que si elle devient dure.</li>
<li><b>Sauter.</b> Un degré, presque toujours vers le bas.</li>
<li><b>Remplir les silences.</b> Le prélude laisse sonner : la mesure 12 s’arrête sur si 7, sans conclure.</li>
</ul>`)}
${W.more('La basse de lamento et le choral', `<p>Une basse qui descend lentement de la tonique à la dominante, par demi-tons, est une formule très ancienne : la <b>basse de lamento</b> (la lamentation de Didon chez Purcell). La grille « Prélude sur basse chromatique descendante » de l’accompagnateur la met en fa majeur ; la grille « Choral en do mineur » rappelle le Prélude op. 28 n° 20, en accords pleins.</p>${W.score({ abc: LAMENTO, title: 'Prélude sur la basse fa – mi – mi♭ – ré – ré♭ – do', bpm: 60, startBpm: 50, practice: false, pedal: PED8, pedalEnd: 32, caption: 'Une figuration en accords brisés. Chaque accord garde le plus de notes possible du précédent ; les autres bougent d’un degré.' })}<p>Dans ta pièce : aux mesures 16 à 19 de l’op. 15 (et 64 à 67), la basse descend fa – mi – mi♭ – ré – do, presque la même basse.</p>`)}
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
    goal: 'l’exercice « toute la forme » est validé : 21 mesures sans t’arrêter, un vrai contraste, et le retour du thème.',
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
<tr><td><b>A</b> (fa majeur)</td><td>les mesures 1 à 8 de l’op. 15 : I | IV V7 | ii7 V7 | I V7/vi vi | V7/V iiø7 V7 | I iiø7/iii | V7/iii iii iiø7/iii | V/iii V7</td><td>chant legato, mezzo piano, registre médium</td></tr>
<tr><td><b>B</b> (fa mineur)</td><td>i – iv – V7 – i | VI – iv – V7 – i</td><td>forte, accents, notes répétées, registre grave ou très aigu</td></tr>
<tr><td>retour</td><td>V7 (do – mi – sol – si♭)</td><td>suspendu : mi♮ prépare fa</td></tr>
<tr><td><b>A′</b></td><td>les mesures 1 à 3, puis I</td><td>le thème, orné</td></tr>
</tbody></table>

<h2>Pourquoi le contraste doit être franc</h2>
<p>Un contraste qui ne change que les accords passe inaperçu : l’oreille suit d’abord le registre, le nombre de notes, la nuance et le toucher. Changer deux de ces paramètres à la fois rend B évident ; le retour de A n’en est que plus attendu. Le retour, lui, doit être <b>reconnaissable</b> : mêmes premières notes ou même rythme que le début.</p>

<h2>Les exercices</h2>
${W.paliers({ lesson: 'n2-im3', steps: [
  { id: 'chant', title: 'Le chant de A, sur les harmonies de Chopin', preset: 'n2-op15-A', mode: 'libre', loops: 1, bpm: 54,
    what: 'Huit mesures de A sur les vraies harmonies des mesures 1 à 8 de ton op. 15 (un accord par temps quand l’harmonie change) : un chant <b>lié</b>, sans hâte, dans le médium. Chaque note tenue jusqu’à la suivante.',
    why: 'Le caractère de A d’abord, seul : c’est lui que B va contredire, et que le retour va retrouver.',
    checks: [{ k: 'legato', min: 0.7 }, { k: 'strong', min: 0.7 }] },
  { id: 'dialogue', title: 'Dialogue sur les harmonies de l’op. 15', preset: 'n2-op15-A', mode: 'qr', bpm: 54,
    what: 'L’appli chante deux mesures, tu réponds sur les deux suivantes : même rythme au départ, notes de l’accord sur les temps.',
    why: 'Répondre sur des harmonies qui changent à chaque temps : tu écoutes la basse autant que la mélodie.',
    checks: [{ k: 'answers', min: 3 }] },
  { id: 'contraste', title: 'A, puis B : le contraste', preset: 'n2-aba-op15', mode: 'libre', loops: 1,
    what: 'La forme entière : A comme à l’exercice précédent, puis B (fa mineur, la main gauche s’agite) en changeant <b>au moins deux choses</b> : registre, nombre de notes, nuance, toucher.',
    why: 'Deux caractères opposés : c’est le cœur de la forme.',
    checks: [{ k: 'contrast', a: [1, 8], b: [9, 16] }] },
  { id: 'retour', title: 'Le retour', preset: 'n2-aba-op15', mode: 'libre', loops: 1,
    what: 'Sur la mesure de do 7 (mesure 17), fais monter la sensible <b>mi♮ vers fa</b> ; puis reprends le début de ton thème (mesure 18), orné si tu veux.',
    why: 'Le retour se prépare : la sensible annonce la tonique, et le thème revient comme une évidence.',
    checks: [{ k: 'ret', a: 1, r: 18, lead: true }] },
  { id: 'forme', title: 'Toute la forme, sans t’arrêter', preset: 'n2-aba-op15', mode: 'libre', loops: 1,
    what: 'Les 21 mesures d’une traite : A, B, la mesure de do 7, A′. Puis « Réécouter » : entend-on trois parties, et le retour ?',
    why: 'Tout ce que tu as travaillé, dans une seule improvisation construite.',
    checks: [{ k: 'nonstop', bars: 20 }, { k: 'contrast', a: [1, 8], b: [9, 16] }, { k: 'ret', a: 1, r: 18 }] },
  { id: 'relatif', title: 'Vers le relatif majeur', preset: 'n2-aba', mode: 'libre', loops: 1,
    what: 'Une autre forme ABA : fa mineur, puis la♭ majeur (même armure), puis fa mineur. Le contraste est plus doux : soigne-le.',
    why: 'Beaucoup de nocturnes opposent un mineur et son relatif majeur ; le retour demande alors une vraie modulation.',
    checks: [{ k: 'contrast', a: [1, 8], b: [9, 16] }, { k: 'nonstop', bars: 20 }] },
] })}
${W.warn('Erreurs fréquentes', `<ul>
<li><b>Un B qui ne change que les accords.</b> Change au moins deux choses : registre, nombre de notes, nuance, toucher.</li>
<li><b>S’arrêter entre les sections.</b> La mesure de do 7 enchaîne : elle est faite pour ça.</li>
<li><b>Un A′ sans lien avec A.</b> Reprends le début (rythme ou premières notes), puis orne.</li>
</ul>`)}
${W.more('Une autre forme ABA : vers le relatif majeur', `<p>Beaucoup de nocturnes contrastent plutôt un mineur et son relatif majeur (fa mineur / la♭ majeur, même armure). Le retour demande alors une vraie modulation : depuis la♭ majeur, la♭ descend vers sol, mi♭ monte vers mi♮, do reste : voici l’accord de do, puis do 7, puis fa mineur.</p>${W.score({ abc: RETOUR, title: 'De la♭ majeur vers fa mineur', bpm: 56, practice: false, pedal: [0, 4, 6, 8], pedalEnd: 12 })}`)}
`,
  },
];
