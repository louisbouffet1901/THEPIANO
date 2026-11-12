// V8.5 — Partition complète du Nocturne op. 55 n° 1 (101 mesures), chargée à la demande.
// Texte : premières éditions (Leipzig, Breitkopf & Härtel, et Paris, M. Schlesinger, 1844), d'après les encodages
// Humdrum de l'Institut Fryderyk Chopin (chopinscores.org, CC BY 4.0), corrigés d'après l'autographe (édition de
// K. Snortum, CC BY-SA 4.0) et les commentaires de l'Édition nationale (voir NOTES). Vérifiée note à note : écarts
// restants = choix listés dans NOTES.
// V8.6 — Pédale (écoute et marques dessinées) : celle de Chopin dans la première édition de Leipzig (mesure 40 d'après
// Paris), lue dans les encodages MEI de chopinscores.org. Une étoile placée sous un accord d'un temps se lève 1/3 de
// temps après lui (dans les mesures en triolets, l'édition la place après la première croche) ; ailleurs (septolet,
// croches, doubles croches), sur la note qu'elle marque. Une prise sans étoile avant elle est un changement. pedalHalf : demi-pédale conseillée pour un piano
// moderne (mesures 16-17 et 32-33, pédale longue sous une ligne chromatique) : une suggestion, pas une indication.
// Mêmes conventions que les extraits (content-excerpts.js) : petites notes sur le temps, fioritures dans le 4e temps,
// octaves du Più mosso à la portée inférieure ; mesures 93 à 96 dans la voix RH8 (clé de sol 8va : écrite une octave
// plus bas, jouée à sa hauteur).
export const OP55_FULL = {
  abc: `X:1
M:4/4
L:1/16
K:Fmin
%%score {(RH1 RH2 RH8) | (LH1 LH2)}
%%barnumbers 1
%%setbarnb 0
V:RH1 clef=treble
V:RH2 clef=treble
V:RH8 clef=treble
V:LH1 clef=bass
V:LH2 clef=bass
[V:RH1] ("^Andante"c4- | !p!c4 f4 e4 d4 | c3=Bc3d) (c8- | c4 f4 e4 d4 | c3=Bc3{/e}d) (c8- |
[V:RH2] x4 | x16 | x16 | x16 | x16 |
[V:RH8] x2 [K:clef=treble+8] x2 | x16 | x16 | x16 | x16 |
[V:LH1] z4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 |
[V:LH2] x4 | x16 | x16 | x16 | x16 |
[V:RH1] c4 f4 e4 d4 | c8 TB4 {=AB}c3d | A8 !arpeggio!A4 G3F | {/A,}F8) (c4 c4- |
[V:RH2] x16 | x16 | x8 !arpeggio![B,=E]6 z2 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .B,,4 .[_G,D_G]4 | .C,4 .[A,CF]4 .C,,4 .[C,C]4 | .F,,4 .[A,C]4 .F,,4 .[G,=E]4 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] c4 f4 e4 d4 | c3=Bc3d c8- | c4) (f4 e4 d4 | c3=Bc3{/e}d c8- |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] (c4) f4 e4 d4 | c8 {=AB}TB4 (5:4:5.A.B.c.e.d | A8) (A4 G3F | {/A,}F8) (A4 A4 |
[V:RH2] x16 | x16 | x8 {/B,}[B,=E]6 z2 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .B,,4 .[_G,D_G]4 | .C,4 .[A,CF]4 .C,,4 .[C,C]4 | z4 ([A,C]8 [A,=D]4) |
[V:LH2] x16 | x16 | x16 | .F,,4 z4 F,4 _F,4 |
[V:RH1] B4 !<(!=D2E2 F2E2A2B2 | !<)!c8) (c4 c4 | =d4 !<(!^F2G2 A2G2c2!<)!d2 | !>(!=e8 f4 _e3d |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] z4 [A,D]4 .E,,4 .[G,D]4 | .A,,4 .[E,A,C]4 .A,,4 .[=D,F,C]4 | .G,,4 .[=D,F,C]4 .G,,4 .[F,=B,]4 | .C,,4 .[B,CG]4 .C,4 .[A,CA]4 |
[V:LH2] E,8 x8 | x16 | x16 | x16 |
[V:RH1] d4 c4 d4 c3B | B4 A4 G4 {/B}A3!>)!G | G4 G4 G4 {/B}A3G | G4 c4 c4) c4- |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | "_ritenuto."x16 |
[V:LH1] .C,4 .[G,E]4 .C,4 .[F,A,F]4 | z4 [E,C]4 z4 [D,F,=B,]4 | z4 [=E,C]4 z4 [D,F,-=B,-]4 | [F,=B,]4 [=E,B,]8 z4 |
[V:LH2] x16 | C,8 C,8 | C,8 C,8 | C,12 x4 |
[V:RH1] !>(!c4 (!>)!f4 e4 d4 | c3=Bc3d) c8- | c4 (3(=e2g2f2 (3_e2E2B2 (3c2e2d2 | (3c2C2E2 (3A2=B2d2 c8-) |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] "_in tempo."x16 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[C,A,]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,A,E]4 .=E,,4 .[B,CG]4 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] !f!c4 (f4 e4 d4 | c8 {=AB}TB4 .A.B.c.d) | (A8 A4 G3!>!F | {/A,}F8) (A4 A4 |
[V:RH2] x16 | x16 | x8 {/B,}[B,=E]6 x2 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,A,CE]4 .B,,4 [_G,D_G]4 | .C,4 .[A,CF]4 C,,4 [C,C]4 | z4 ([A,C]8 [A,=D]4) |
[V:LH2] x16 | x16 | x16 | F,,4 z4 F,4 _F,4 |
[V:RH1] B4) (=D2!<(!E2 F2E2A2!<)!B2 | c8 c4 c4 | !<(!=d4) (^F2G2 A2G2c2!<)!d2 | =e8 !>(!f4 _e3)(d |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] z4 [A,D]4 E,,4 [G,D]4 | .A,,4 .[E,A,C]4 .A,,4 .[=D,F,C]4 | .G,,4 .[=D,F,C]4 .G,,4 .[D,F,=B,]4 | .C,,4 .[B,CG]4 .C,4 .[A,CA]4 |
[V:LH2] E,8 x8 | x16 | x16 | x16 |
[V:RH1] d4 c4 d4 c3B | B4 A4 !>)!G4 {/B}A3G | G4) (G4 G4 {/B}A3G | G4 c4 c4) c4- |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | x4 "_riten."x12 |
[V:LH1] .C,4 .[G,E]4 .C,4 .[F,A,F]4 | z4 ([E,C]4 z4 [D,F,=B,]4 | z4 [=E,C]4 z4 [D,F,-=B,-]4 | [F,=B,]4 [=E,B,]8) z4 |
[V:LH2] x16 | C,8 C,8 | C,8 C,8 | C,12 x4 |
[V:RH1] c4 (f4 e4 d4 | c3=Bc3{/e}d) c8- | c4 (3(=e2g2f2 (3_e2E2B2 (3c2e2d2 | (7:4:7(c2C2E2A2=B2c2{/e}d2)) c8- |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x4 "_in tempo."x12 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[C,A,]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,C]4 .=E,,4 .[B,CG]4 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] !f!c4 (f4 e4 d4 | c8 {=AB}TB4 (6:4:6.A.B.=B.c.e.d | A8) (A4 G3F | [A,F]4) !f!z4 z8 |
[V:RH2] x16 | x16 | x8 {/B,}[B,=E]6 z2 | x16 |
[V:RH8] x16 | x16 | x16 | x4 "^più mosso"x12 |
[V:LH1] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CEA]4 .B,,4 .[_G,D_G]4 | .C,4 .[A,CF]4 .C,,4 .[C,C]4 | [F,C]4 (3([=B,,=B,]2[C,C]2[D,D]2 (3[C,C]2[G,,G,]2[_B,,_B,]2 (3[A,,A,]2[=E,,=E,]2[G,,G,]2) |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] !>(!z4 ([Af]8 !>)![GBf]4 | [Acf]4) z4 z8 | !>(!z4 (!>)![EGe]8 [FG=d]4 | {/=d}!<(![EGc]3!<)![FG=B] [EGc]4) z8 |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] [F,,F,]4 [F,CF]8 [F,DF]4 | [F,CF]4 (3[=B,,=B,]2[C,C]2[D,D]2 (3[C,C]2[G,,G,]2[_B,,_B,]2 (3[A,,A,]2[=E,,=E,]2[F,,F,]2 | [G,,G,]4 [G,C]8 [G,=B,]4 | [C,G,C]3[C,G,=D] [C,G,C]4 (3[^F,,^F,]2[G,,G,]2[A,,A,]2 (3[G,,G,]2[=D,,=D,]2[E,,E,]2 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] z4 (!>(![Ec]8 !>)![=DFc]4 | [EGc]4) z4 z8 | z4 [B,=DB]8 [CD=A]4 | {/=A}!<(![B,=DG]3[CD^F] !<)![B,DG]4 (!p!G4 G4 |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] [C,,C,]4 [C,G,C]8 [C,A,C]4 | [C,G,C]4 (3[^F,,^F,]2[G,,G,]2[A,,A,]2 (3[G,,G,]2[=D,,=D,]2[=F,,=F,]2 (3[E,,E,]2[=B,,,=B,,]2[C,,C,]2 | [=D,,=D,]4 [D,G,]8 [D,^F,]4 | [G,,=D,G,]3[G,,D,=A,] [G,,D,B,]4 z8 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] d8 (3c2d2c2 (3d2e2d2 | !>(!c4 f4 !>)!f8) | (d8 (3c2d2c2 (3d2e2d2 | c4 f4 f8) |
[V:RH2] x16 | B4 A4 G4 F4 | F8 =E8 | G8 F8 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] (3(=E,,2D,2B,,2 G,4) (3(E,,2D,2B,,2 G,4) | (3(F,,2C,2A,,2 A,4) (3(A,,2F,2C,2 C4) | (3(G,,2F,2D,2 B,4) (3(G,,2=E,2D,2 B,4) | (3(A,,2G,2C,2 C4) (3(A,,2F,2C,2 C4) |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] (_g8 (3f2g2f2 (3g2a2g2 | !>(!f4 b4 !>)!b8) | (!<(!_g8 (3f2g2f2 (3g2a2!<)!g2 | f4 b4 b8) |
[V:RH2] e16- | e4 d4 c4 B4 | B8 =A8 | c8 B8 |
[V:RH8] x16 | x16 | x16 | x16 |
[V:LH1] (3(=A,,2_G,2E,2 C4) (3(A,,2G,2E,2 C4) | (3(B,,2F,2D,2 D4) (3(D,2B,2F,2 F4) | (3(C,2B,2_G,2 E4) (3(C,2=A,2F,2 E4) | (3(D,2C2F,2 F4) (3(D,2B,2F,2 F4) |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] (!>(!!f!b8 a6 _g2 | [_G_g]8 [Ff]8 | [Ff]8 !>)![=E=e]8- | [=E=e]8 !<(![=E=e]6 !<)![Ff]2 |
[V:RH2] [Bd]16 | B16 | B16 | B8 B8 |
[V:RH8] x16 | x12 "_dim."x4 | x16 | x16 |
[V:LH1] (3(D,,2B,2_G,2 _G4) (3(D,2B,2G,2 G4) | (3(D,2B,2_G,2 D4) (3(D,2B,2G,2 D4) | (3(D,2B,2G,2 D4) (3(D,2B,2G,2 D4) | (3(D,2B,2G,2 D4) (3(D,2B,2G,2 D4) |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] [FAf]4) (!f!f'e'd'c' _c'agf =ef_ed | c_cAG BAGF =EF_ED CDA,B,) |
[V:RH2] x16 | x16 |
[V:RH8] x4 "_rallent."x12 | x16 |
[V:LH1] [D,A,_C]4 z4 z8 | z16 |
[V:LH2] x16 | x16 |
[V:RH1] (!<(!C4 D4 F4 !<)!=E4 | =E4 F4 A4 HG3 c) |
[V:RH2] x16 | x16 |
[V:RH8] "^stretto"x16 | x2 "^ritenuto"x14 |
[V:LH1] z2 [=E,G,]4 [F,A,]4 [A,=D]4 [^G,D]2- | [^G,=D]2 [G,^C]4 [F,=C]4 [=B,F]4 H[_B,=E] z |
[V:LH2] z2 (C,4 _C,4 B,,4 =E,,2- | =E,,2 =A,,4 _A,,4 G,,4 HC,,) z |
[V:RH1] (!p!c4 f4 e4 d4 | c3=Bc3d c8- | c4) (3(=e2g2f2 (3_e2E2B2 (3c2e2d2 | (3c2C2E2 (3A2=B2d2) c8- |
[V:RH2] x16 | x16 | x16 | x16 |
[V:RH8] "^tempo I"x16 | x16 | x16 | x16 |
[V:LH1] .F,,4 .[A,F]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,A,C]4 .=E,,4 .[B,CG]4 |
[V:LH2] x16 | x16 | x16 | x16 |
[V:RH1] c4 (3(f2f'2f2 (3=e'2g2e'2 (3a2_e'2=a2 | (3=d'2b2d'2 (3_d'2d2d'2 (3c'2=d2c'2 (3e2b2=e2 |
[V:RH2] x16 | x16 |
[V:RH8] x4 "^molto legato e stretto"x12 | x16 |
[V:LH1] .F,,4 .[CA]4 .F,4 .[CFc]4 | B,,4 .[DFB]4 .C,4 .[CGB]4 |
[V:LH2] x16 | x16 |
[V:RH1] (3__b2f2b2 (3a2A2a2 (3__a2d2a2 (3_g2_G2g2 | (3f2F2A2 (3c2e2d2 (3c2=E2G2 (3=B2c2_B2 |
[V:RH2] x16 | x16 |
[V:RH8] x16 | x16 |
[V:LH1] .D,4 .[A,DF]4 .B,,4 .[B,D]4 | .C,4 .[A,C]4 .C,,4 [G,C]4 |
[V:LH2] x16 | x16 |
[V:RH1] (3=A2_A2F2 (3f2F2f2 (3G2=e2A2 (3_e2=A2e2 | (3=d2B2d2 (3_d2D2d2 (3=D2c2E2 (3B2=E2B2) |
[V:RH2] x16 | x16 |
[V:RH8] x16 | x16 |
[V:LH1] .F,,4 .[C,A,C]4 .F,,4 .[F,CF]4 | .B,,4 .[F,B,F]4 .C,4 .[G,C]4 |
[V:LH2] x16 | x16 |
[V:RH1] (3(__B2F2B2 (3A2D2A2 (3_G2D2G2 (3F2D2F2 | (3_G2D2G2 (3F2D2F2 (3c2C2F2 (3=E2B,2C2 |
[V:RH2] x16 | x16 |
[V:RH8] x16 | x16 |
[V:LH1] .D,,4 ([D,A,]4 [B,,B,]4 [_C,A,]4 | [B,,B,]4 [_C,A,]4 [=C,A,]4 [C,-G,]4) |
[V:LH2] x16 | x16 |
[V:RH1] (3F2A,2C2 (3!<(!=A,2C2E2 (3_G2=A2c2 (3e2!<)!_g2=a2 | (3_g'2!>(!c'2e'2 (3=a2_g2c2 (3e2=A2!>)!_G2 (3C2E2=A,2) |
[V:RH2] x16 | x16 |
[V:RH8] x16 | x16 |
[V:LH1] !>(!C,4 (_G,4 F,4 !>)!E,4 | E,8 F,4 E,4 |
[V:LH2] F,,16- | F,,16- |
[V:RH1] (3B,2F,2G,2 (3!<(!B,2D2F2 (3G2B2d2 (3f2!<)!g2b2 | (3!>(!d'2g2b2 (3=e2d2G2 (3B2!>)!=E2D2 (3G,2B,2=E,2 |
[V:RH2] x16 | x16 |
[V:RH8] x16 | x16 |
[V:LH1] D,8 C,6 B,,2 | B,,8 D,8) |
[V:LH2] F,,16- | F,,16 |
[V:RH1] (3F,2=A,2C2 (3F2B,2C2 (3A,2C2F2 (3!<(!=A2=D2F2 | (3C2F2=A2 (3c2G2A2 (3F2A2!<)!c2 (3f2B2c2 |
[V:RH2] x16 | x16 |
[V:RH8] x12 "_cresc."x4 | x12 "_dim."x4 |
[V:LH1] [F,,C,]8- [F,,C,=A,]8- | [F,,C,=A,]16- |
[V:LH2] x16 | x16 |
[V:RH1] (3=A2c2f2 (3=a2=d2f2 (3c2f2a2 (3c'2g2a2 | (3f2=a2c'2 (3f'2b2c'2 (3a2c'2f'2 (3=a'2=d'2f'2 |
[V:RH2] x16 | x16 |
[V:RH8] "_ed accel."x16 | x16 |
[V:LH1] [F,,C,=A,]16- | [F,,C,=A,]16- |
[V:LH2] x16 | x16 |
[V:RH1] x16 | x16 |
[V:RH2] x16 | x16 |
[V:RH8] (3"^8va"c2f2=a2 (3c'2g2a2 (3f2a2c'2 (3f'2g2a2 | (3"^(8va)"f2=a2c'2 (3f'2g2a2 (3f2a2c'2 (3f'2g2a2 |
[V:LH1] [F,,C,=A,]16- | [F,,C,=A,]16- |
[V:LH2] x16 | x16 |
[V:RH1] x16 | x16 |
[V:RH2] x16 | x16 |
[V:RH8] (3"^(8va)"f2=a2c'2 (3f'2g2a2 (3f2a2c'2 (3f'2g2a2 | (3"^(8va)"f2=a2c'2 (3f'2g2a2 (3f2a2c'2 (3f'2g2a2 |
[V:LH1] [F,,C,=A,]16- | [F,,C,=A,]16- |
[V:LH2] x16 | x16 |
[V:RH1] "^loco"f'4 z4 z8 | (!>(![DFd]8 !>)![B,=Ec]8 | !arpeggio![=A,CF=A]16 | !arpeggio!!f![=A,CF=A]8 !arpeggio![A,CFA]8) | !arpeggio!H[=A,CF=A]16 |]
[V:RH2] x16 | G16 | x16 | x16 | x16 |]
[V:RH8] x8 "_in tempo"x8 | x16 | x16 | x16 | x16 |]
[V:LH1] [F,,C,=A,]4 z4 z8 | ([B,,,B,,]8 [C,,C,]8) | !arpeggio![F,,C,F,]16 | !arpeggio![F,,C,F,]8 !arpeggio![F,,C,F,]8 | !arpeggio!H[F,,C,F,]16 |]
[V:LH2] x16 | x16 | x16 | x16 | x16 |]`,
  // en noires depuis le début de la levée (mesure n : 1 + 4 (n − 1))
  pedal: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 67, 69, 71, 73, 75, 77, 79, 81, 83, 94, 97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 131, 133, 135, 137, 139, 141, 143, 145, 147, 158, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179, 181, 183, 185, 187, 193, 201, 209, 217, 225, 227, 229, 231, 233, 235, 237, 239, 241, 243, 245, 247, 249, 251, 253, 255, 257, 259, 261, 263, 265, 267, 269, 289, 291, 293, 295, 297, 299, 301, 303, 305, 307, 309, 311, 313, 315, 317, 319, 321, 323, 325, 327, 329, 341, 345, 349, 365],
  pedalUp: [2.3333, 6.3333, 10.3333, 14.3333, 16.3333, 18.3333, 22.3333, 24.75, 26.3333, 28.75, 30.3333, 34.3333, 38.3333, 42.3333, 46.3333, 50.3333, 54.3333, 58.3333, 60.5, 70.3333, 74.3333, 76.5, 78.3333, 80.75, 82.3333, 84.75, 96.3333, 98.3333, 102.3333, 106.3333, 108.3333, 110.3333, 114.3333, 118.3333, 124.75, 132.5, 134.3333, 138.5, 140.5, 142.3333, 144.75, 146.3333, 148.75, 160.3333, 162.3333, 166.3333, 170.3333, 172.3333, 174.1429, 178.3333, 186.3333, 188.75, 196.3333, 205.3333, 213.3333, 221.3333, 226.3333, 228.6667, 230.3333, 234.3333, 236.3333, 238.3333, 242.3333, 244.6667, 246.3333, 250.3333, 252.3333, 254.3333, 258.3333, 260.3333, 262.3333, 266.3333, 268.3333, 271.6667, 290.3333, 294.3333, 298.3333, 300.6667, 302.3333, 306.3333, 308.3333, 310.3333, 312.3333, 314.3333, 316.3333, 318.3333, 320.3333, 322.3333, 324.3333, 326.3333, 328.3333, 330.3333, 343.3333, 347.3333, 352.6667, 385.3333],
  pedalHalf: [[63, 67], [127, 131]],
  pedalEnd: 405,
  // tempo de l'écoute, en proportion du tempo choisi : ritenuto (m. 24, 40), Più mosso (m. 48), rallent. puis stretto et
  // ritenuto (m. 69-72), molto legato e stretto (m. 77), accelerando (m. 90-96), fin élargie
  tempoMap: [[0, 1], [93, 1], [96.9, 0.82], [97, 1], [158, 1], [161.9, 0.82], [162, 1], [189.9, 1], [190, 1.25], [274, 1.25], [280.9, 0.95], [281, 1.1], [285, 1.05], [288.5, 0.65], [288.75, 0.35], [288.99, 0.35], [289, 1], [305.9, 1], [306, 1.12], [360, 1.12], [384.9, 1.55], [385, 1], [397, 1], [405, 0.7]],
};

/** À savoir sur cette partition : les choix faits là où les sources diffèrent. */
export const OP55_FULL_NOTES = [
  'Texte des deux premières éditions (Leipzig et Paris, 1844), vérifié note à note contre l’autographe (édition de K. Snortum) et les commentaires de l’Édition nationale polonaise.',
  'Mesure 44 : la 5e note du septolet est un si♮ (Paris, autographe). L’édition de Leipzig a oublié le bécarre.',
  'Mesures 30 et 46 : la trille est sur si♭, comme à la mesure 14 et dans les deux premières éditions. Certaines éditions la placent sur do.',
  'Mesure 56 : le si♭ du 2e temps est écrit aux deux mains. Joue-le une seule fois, à la main droite.',
  'Mesures 72-73 : le do est rejoué sur le 1er temps de la mesure 73, comme dans les premières éditions. Certaines éditions le lient.',
  'Mesures 89 à 97 : fa, do et la restent tenus sous les arpèges, jusqu’à la mesure 97. Chopin avait oublié une liaison (Édition nationale).',
  'Petites notes jouées sur le temps, avec la basse, comme le voulait Chopin. Les fioritures (mesures 14, 30 et 46) occupent le 4e temps.',
  'Più mosso : les octaves des deux mains sont écrites à la portée du bas, comme dans les extraits. Mesures 93 à 96 : 8va, une octave plus haut que l’écrit.',
  'Pédale : celle de la première édition de Leipzig (mesure 40 d’après Paris). La levée notée sous l’accord du 2e temps se fait juste après lui : dans les mesures en triolets, Chopin la place après la première croche. Les éditions de Leipzig et de Paris diffèrent surtout aux mesures 65 à 68.',
];

/** V8.6 — La pédale de Chopin, section par section (page de la partition complète). */
export const OP55_PEDAL_GUIDE = [
  { from: 1, to: 16, title: 'Le thème', text: 'Une pédale par basse. Prends-la sur la basse du 1er temps et lève-la juste après l’accord du 2e temps ; reprends-la sur la basse du 3e temps et garde-la jusqu’à la basse suivante, où tu la changes. En fin de phrase (m. 4, 6, 7 et 15), lève-la aussi au 4e temps. Mesure 16 : une seule pédale jusqu’au 3e temps de la mesure 17. Le ténor y descend par demi-tons (fa, mi, mi♭) : à partir du 3e temps, passe en demi-pédale.' },
  { from: 17, to: 24, title: 'La montée', text: 'Même geste jusqu’à la mesure 21. Mesures 22-23 : sans pédale ; la basse do est tenue par les doigts et les accords changent à chaque temps. Mesure 24 (ritenuto) : une pédale du 2e temps jusqu’après le 4e.' },
  { from: 25, to: 40, title: 'Le thème en triolets', text: 'Même geste. Mesures 32-33 : comme 16-17, une seule pédale, en demi-pédale à partir du 3e temps de la mesure 32. Mesures 38 à 40 : comme 22 à 24.' },
  { from: 41, to: 47, title: 'Le thème le plus orné', text: 'Même geste. Mesure 44 : la pédale se lève sur le si♮, 5e note du septolet. Mesure 46 : elle n’est pas levée au 2e temps, seulement changée au 3e.' },
  { from: 48, to: 72, title: 'Più mosso', text: 'Les mesures en triolets (48, 50, 52, 54 et 56) restent sans pédale. Une pédale dans chaque réponse : mesure 49, du 1er temps jusqu’après le 4e ; mesures 51, 53 et 55, jusqu’après le 1er temps de la mesure suivante. Puis (m. 57 à 68) une pédale par demi-mesure, comme dans le thème. Mesures 69 à 72 (rallentando, stretto) : sans pédale. L’édition de Paris tient la pédale deux mesures de suite (m. 65-66, puis 67-68), sur une seule harmonie au-dessus de la basse do♯ : les deux lectures se défendent, la partition suit Leipzig.' },
  { from: 73, to: 76, title: 'Le retour', text: 'Une pédale par demi-mesure, comme dans le thème.' },
  { from: 77, to: 101, title: 'La coda', text: 'Mesures 77 à 83 : une pédale par demi-mesure, levée aussi après le 4e temps. Mesures 84-85 : sans pédale. Mesures 86 à 88 : une pédale par mesure, pour les arpèges. Mesures 89 à 91 : sans pédale, les doigts tiennent fa, do et la. Mesure 92 : une seule pédale jusqu’au 1er temps de la mesure 97, pendant que les arpèges montent dans l’aigu. Mesures 98 à 101 : sans pédale, le choral se tient aux doigts.' },
];
