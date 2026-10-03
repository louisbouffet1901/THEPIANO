// Extraits vérifiés note à note contre les sources (voir Réglages > Sources et licences).
// Chopin : d'après les éditions LilyPond de Knute Snortum (CC BY-SA 4.0) ; Debussy : Mutopia Project (domaine public).

export const OP55 = {
  e1: `X:1
M:4/4
L:1/16
K:Fmin
%%score {RH | LH}
%%barnumbers 1
%%setbarnb 0
V:RH clef=treble
V:LH clef=bass
[V:RH] !>(!(c4-!>)! | !p!c4 f4 e4 d4 | c3=B c3d c8- | c4) (f4 e4 d4 | c3=B c3{/e}d c8) |]
[V:LH] z4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 | .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .=E,,4 .[B,CG]4 |]`,
  e2: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 5
%%score {(RH1 RH2) | LH}
V:RH1 clef=treble
V:RH2 clef=treble
V:LH clef=bass
[V:RH1] (c4 f4 e4 d4 | c8 TB4 {=AB}c3d | A8 !arpeggio!A4 G3F | {/A,}F8) (c4 c4) |]
[V:RH2] x16 | x16 | x8 !arpeggio![B,=E]6 z2 | x16 |]
[V:LH] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .B,,4 .[_G,D_G]4 | .C,4 .[A,CF]4 .C,,4 .[C,C]4 | .F,,4 .[A,C]4 .F,,4 .[G,=E]4 |]`,
  e3: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 13
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] (c4 f4 e4 d4 | c8 {=AB}TB4 (5:4:5.=A.B.c.e.d) |]
[V:LH] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[CA]4 .B,,4 .[_G,D_G]4 |]`,
  e4: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 17
%%score {RH | (LH1 LH2)}
V:RH clef=treble
V:LH1 clef=bass
V:LH2 clef=bass
[V:RH] (B4 =D2E2 F2E2 A2B2 | c8) (c4 c4 | =d4 ^F2G2 A2G2 c2d2 | =e8 f4 _e3d) |]
[V:LH1] z4 [A,D]4 x8 | x16 | x16 | x16 |]
[V:LH2] E,8 .E,,4 .[G,D]4 | .A,,4 .[E,A,C]4 .A,,4 .[=D,F,C]4 | .G,,4 .[=D,F,C]4 .G,,4 .[F,=B,]4 | .C,,4 .[B,CG]4 .C,4 .[A,CA]4 |]`,
  e5: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 27
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] c4 (3(=e2g2f2 (3_e2E2B2 (3c2e2d2 | (3c2C2E2 (3A2=B2d2 c8) |]
[V:LH] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,A,E]4 .=E,,4 .[B,CG]4 |]`,
  e5b: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 43
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] c4 (3(=e2g2f2 (3_e2E2B2 (3c2e2d2 | (7:4:7c2C2E2A2=B2c2{/e}d2 c8) |]
[V:LH] .F,,4 .[A,CF]4 .G,,4 .[E,B,E]4 | .A,,4 .[E,C]4 .=E,,4 .[B,CG]4 |]`,
  e6: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 48
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] "^Più mosso"[A,F]4 z4 z8 | z4 ([Af]8 [GBf]4 | [Acf]4) z4 z8 |
[V:LH] [F,C]4 (3([=B,,=B,]2[C,C]2[D,D]2 (3[C,C]2[G,,G,]2[_B,,_B,]2 (3[A,,A,]2[=E,,=E,]2[G,,G,]2 | .[F,,F,]4) [F,CF]8 [F,DF]4 | [F,CF]4 (3([=B,,=B,]2[C,C]2[D,D]2 (3[C,C]2[G,,G,]2[_B,,_B,]2 (3[A,,A,]2[=E,,=E,]2[F,,F,]2 |
[V:RH] z4 ([EGe]8 [FG=d]4 | {/=d}[EGc]3[FG=B] [EGc]4) z8 |]
[V:LH] .[G,,G,]4) [G,C]8 [G,=B,]4 | [C,G,C]3[C,G,=D] [C,G,C]4 (3([^F,,^F,]2[G,,G,]2[A,,A,]2 (3[G,,G,]2[=D,,=D,]2[E,,E,]2) |]`,
  e7: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 57
%%score {(RH1 RH2) | LH}
V:RH1 clef=treble
V:RH2 clef=treble
V:LH clef=bass
[V:RH1] (d8 (3c2d2c2 (3d2e2d2 | c4 f4 f8) | (d8 (3c2d2c2 (3d2_e2d2 | c4 f4 f8) |]
[V:RH2] x16 | B4 A4 G4 F4 | F8 =E8 | G8 F8 |]
[V:LH] (3(=E,,2D,2B,,2 G,4) (3(=E,,2D,2B,,2 G,4) | (3(F,,2C,2A,,2 A,4) (3(A,,2F,2C,2 C4) | (3(G,,2F,2D,2 B,4) (3(G,,2=E,2D,2 B,4) | (3(A,,2G,2C,2 C4) (3(A,,2F,2C,2 C4) |]`,
  e8: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 69
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] [FAf]4 (f'e'd'c' _c'agf =ef_ed | c_cAG BAGF =EF_ED CDA,B,) |]
[V:LH] [D,A,_C]4 z4 z8 | z16 |]`,
  e9: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 77
%%score {RH | LH}
V:RH clef=treble
V:LH clef=bass
[V:RH] c4 "^molto legato"(3(f2f'2f2 (3=e'2g2e'2 (3a2_e'2=a2 | (3=d'2b2d'2 (3_d'2d2d'2 (3c'2=d2c'2 (3e2b2=e2 |
[V:LH] .F,,4 .[CA]4 .F,4 .[CFc]4 | .B,,4 .[DFB]4 .C,4 .[CGB]4 |
[V:RH] (3__b2f2__b2 (3a2A2a2 (3__a2d2__a2 (3_g2_G2_g2 | (3f2F2A2 (3c2e2d2 (3c2=E2G2 (3=B2c2_B2) |]
[V:LH] .D,4 .[A,DF]4 .B,,4 .[B,D]4 | .C,4 .[A,C]4 .C,,4 .[G,C]4 |]`,
  e10: `X:1
M:4/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 97
%%score {(RH1 RH2) | LH}
V:RH1 clef=treble
V:RH2 clef=treble
V:LH clef=bass
[V:RH1] f'4 z4 z8 | "^in tempo"([DFd]8 [B,=Ec]8 | !arpeggio![=A,CF=A]16) | (!arpeggio!.[=A,CF=A]8 !arpeggio!.[=A,CF=A]8 | !arpeggio!H[=A,CF=A]16) |]
[V:RH2] x16 | G16 | x16 | x16 | x16 |]
[V:LH] [F,,C,=A,]4 z4 z8 | [B,,,B,,]8 [C,,C,]8 | !arpeggio![F,,C,F,]16 | !arpeggio![F,,C,F,]8 !arpeggio![F,,C,F,]8 | !arpeggio!H[F,,C,F,]16 |]`,
};

export const OP15 = {
  e1: `X:1
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
[V:LH3] x4 | F,12 | F,12 |
[V:RH] (d3e f4 g4 | a12) | (g4 a3g (3g2f2e2 |
[V:LH1] D4 E4 C4 | C4 ^C4 D4 | =B,4 _B,4 _B,4 |
[V:LH2] (3G,2B,2B,2 (3G,2B,2B,2 (3G,2B,2B,2 | (3F,2A,2A,2 (3G,2A,2A,2 (3F,2A,2A,2 | (3F,2G,2G,2 (3F,2G,2G,2 (3E,2G,2G,2 |
[V:LH3] F,12 | F,4 E,4 D,4 | D,4 _D,4 C,4 |
[V:RH] f6 e2 (3d2e2f2) | (e8 (3e2d2A2 | =B8) !p!(3:2:3(c2d3c) |]
[V:LH1] A,4 A,4 A,4 | ^G,4 A,4 x4 | x4 E4 E4 |]
[V:LH2] (3E,2F,2F,2 (3D,2F,2F,2 (3D,2F,2F,2 | (3D,2E,2E,2 (3C,2E,2E,2 (3[F,,=B,,A,]2D,2D,2 | (3[E,,=B,,^G,]2=B,2B,2 (3^G,2B,2B,2 (3_B,2C2C2 |]
[V:LH3] C,4 =B,,8 | =B,,4 A,,4 x4 | x8 G,4 |]`,
  e2: `X:1
M:3/4
L:1/16
K:F
%%barnumbers 1
%%setbarnb 17
%%score {RH | (LH1 LH2 LH3)}
V:RH clef=treble
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=up
V:LH3 clef=bass stem=down
[V:RH] (b8 a4 | g4 {ag^fg}a4 =f4 | c4) (g4- g3f | f4) (!>!d'4 (8:2:8"^dolciss."e2f2e2d2e2g2f2d2 |
[V:LH1] _D4 x4 _D4 | ^C4 =C4 =B,4 | x4 F4 E4 | F4 x4 D4 |
[V:LH2] (3G,2B,2B,2 (3G,2B,2B,2 (3_G,2A,2A,2 | (3G,2A,2A,2 (3^F,2A,2A,2 (3=F,2G,2G,2 | (3C,2C2C2 (3B,2C2C2 (3B,2C2C2 | (3A,2C2C2 (3=B,,2_A,2A,2 (3F,2A,2A,2 |
[V:LH3] _E,8 _E,4 | _E,4 D,4 D,4 | x4 G,4 x4 | F,4 x8 |
[V:RH] c4) (g4- g3f | f8 e4 | d4 e4 c4 | d4 e4) Hz4 |]
[V:LH1] x4 F4 E4 | F4 F4 E4 | D4 E4 C4 | D4 E4 Hz4 |]
[V:LH2] (3C,,2.C2.C2 (3B,2C2C2 (3B,2C2C2 | (3A,2C2C2 (3A,2C2C2 (3A,2C2C2 | (3A,2B,2B,2 (3G,2B,2B,2 (3G,2B,2B,2 | G,2B,2 G,2B,2 x4 |]
[V:LH3] x4 G,4 x4 | F,12- | F,12 | F,4 F,4 x4 |]`,
  e3: `X:1
M:3/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 25
%%score {RH | (LH1 LH2)}
V:RH clef=treble
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=down
[V:RH] "^Con fuoco"!f!(6:4:6([A,F][CA][A,F][CA][A,F][CA] (6:4:6[A,F][CA][A,F][CA][A,F][CA] (6:4:6[A,F][CA][A,F][CA][A,F][CA] | (6:4:6[B,F][DA][B,F][DA][B,F][DA] (6:4:6[B,F][DA][B,F][DA][B,F][DA] (6:4:6[B,F][DA][B,F][DA][B,F][DA]) |
[V:LH1] (6:4:6(C,=B,,C,D,C,=B,, (6:4:6C,_B,,A,,G,,F,,=E,, (6:4:6F,,_E,,D,,C,,B,,,A,,, | (6:4:7F,,,D,,F,,B,,D, z/!>!F,/) !>!F,4 z4 |
[V:LH2] F,,4 x8 | x12 |
[V:RH] (6:4:6([B,G][FB][B,G][FB][B,G][FB] (6:4:6[B,G][FB][B,G][FB][B,G][FB] (6:4:6[B,G][FB][B,G][FB][B,G][FB] | (6:4:6[B,_G][EB][B,G][EB][B,G][EB] (6:4:6[B,G][EB][B,G][EB][B,G][EB] (6:4:6[=A,G][E=A][A,G][EA][A,G][EA]) |]
[V:LH1] (6:4:6(D,C,D,E,D,C, (6:4:6D,C,B,,=A,,B,,_A,, (6:4:6G,,F,,E,,D,,C,,B,,, | (6:4:7F,,,_G,,C,E,_G, z/!>!C/) !>!C4 z4 |]
[V:LH2] F,,4 x8 | x12 |]`,
  e4: `X:1
M:3/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 29
%%score {(RH1 RH2) | (LH1 LH2)}
V:RH1 clef=treble stem=up
V:RH2 clef=treble stem=down
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=down
[V:RH1] x12 | x12 |
[V:RH2] (6:4:6[F=c][=Af][Fc][Af][Fc][Af] (6:4:6[Fd][Bf][Fd][Bf][Fd][Bf] (6:4:6[Fd][_cf][Fd][cf][Fd][cf] | (6:4:6[Fd][_cf][Fd][cf][Fd][cf] (6:4:6[_Gd][c_g][Gd][cg][Gd][cg] (6:4:6[Ad][ca][Ad][ca][Ad][ca] |
[V:LH1] (C3D B,4 A,4) | (A,3B, _G,4 F,4- |
[V:LH2] D,12- | D,12 |
[V:RH1] (a3b _g4 f4 | e4 f8) |]
[V:RH2] (6:4:6_cdcdcd (6:4:6BdBdBd (6:4:6AdAdAd | (6:4:6_GdGdGd (6:4:6FdFdFd (6:4:6FdFdFd |]
[V:LH1] F,4) (_G,4 A,4 | B,4 A,4 D4) |]
[V:LH2] [_G,,D,]12- | D,12 |]`,
  e5: `X:1
M:3/4
L:1/16
K:F
%%barnumbers 1
%%setbarnb 53
%%score {RH | (LH1 LH2 LH3)}
V:RH clef=treble
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=up
V:LH3 clef=bass stem=down
[V:RH] (g4 a3g (3g2f2e2 | f6 e2 (7:4:7ded^cdef | e6) !>!(e2- (3e2d2A2) |]
[V:LH1] =B,4 _B,4 _B,4 | A,4 A,4 A,4 | ^G,4 A,4 x4 |]
[V:LH2] (3F,2G,2G,2 (3F,2G,2G,2 (3E,2G,2G,2 | (3E,2F,2F,2 (3D,2F,2F,2 (3D,2F,2F,2 | (3D,2E,2E,2 (3C,2E,2E,2 (3[F,,=B,,A,]2D,2D,2 |]
[V:LH3] D,4 _D,4 C,4 | C,4 =B,,8 | =B,,4 A,,4 x4 |]`,
  e6: `X:1
M:3/4
L:1/16
K:Fmin
%%barnumbers 1
%%setbarnb 41
%%score {RH | (LH1 LH2)}
V:RH clef=treble
V:LH1 clef=bass stem=up
V:LH2 clef=bass stem=down
[V:RH] (6:4:6([CA][_Gc][CA][Gc][CA][Gc] (6:4:6[DA][Gd][DA][Gd][DA][Gd] (6:4:6[EA][Ge][EA][Ge][EA][Ge] | (6:4:6[EA][_Ge][EA][Ge][EA][Ge] (6:4:6[EA][Ge][EA][Ge][EA][Ge] (6:4:6[EA][Ge][EA][Ge][EA][Ge]) |
[V:LH1] E,3(F, D,4) C,4 | [=B,,,=B,,]3([C,,C,] [A,,,A,,]8) |
[V:LH2] [A,,A,]12 | x12 |
[V:RH] (6:4:6z([A=d][=DB][Ad][DB][Ad] (6:4:6[EB][Ae][EB][Ae][EB][Ae] (6:4:6[FB][Af][FB][Af][FB][Af] | (6:4:6[FB][Af][FB][Af][FB][Af] (6:4:6[FB][Af][FB][Af][FB][Af] (6:4:6[FB][Af][FB][Af][FB][Af]) |]
[V:LH1] F,3(_G, E,4) =D,4 | [^C,,^C,]3([=D,,=D,] [B,,,B,,]8) |]
[V:LH2] [B,,B,]12 | x12 |]`,
};

export const CLAIR = {
  e1: `X:1
M:9/8
L:1/8
K:Db
%%barnumbers 1
%%setbarnb 1
%%score {(RH1 RH2) | LH}
V:RH1 clef=treble stem=up
V:RH2 clef=treble stem=down
V:LH clef=treble
[V:RH1] "^Andante très expressif"z2 ([fa]-[fa]3 [df]3- | [df] [ce] [df] [ce]6- | [ce] [Bd] [ce] (2d f- (2f d- | d [Ac] [Bd] [Ac]6) |]
[V:RH2] x9 | x9 | x3 B6- | B x8 |]
[V:LH] !pp!z [FA]2-"_con sordina"[FA]6 | [G__B]6-[G__B]3 | [FA]6-[FA]3 | [EG]6-[EG]3 |]`,
  e2: `X:1
M:9/8
L:1/8
K:Db
%%barnumbers 1
%%setbarnb 15
%%score {RH | LH1 | LH2}
V:RH clef=treble
V:LH1 clef=treble
V:LH2 clef=bass
[V:RH] "^Tempo rubato"(2z ([fbf']- [fbf'] [ebe'] [ebe'] [ebe'] [dbd'] [dbd'] | [dbd'] [cgbc'] [cgbc'] (2[cgbc'] [dbd'] [Bgb]3) | (2z ([fbf']- [fbf'] [gbg'] [fbf'] [ebe'] [fbf'] [ebe'] | [dbd'] [ebe'] [dbd'] (2[bc'] {e'}[dbd'] [Bgb]3) |]
[V:LH1] !pp!(2z [FGB]- [FGB] [EGB] [EGB] [EGB] [DGB] [DGB] | [DGB] [CGB] [CGB] (2[CGB] [DGB] [B,DG]3 | (2z [FGB]- [FGB] [GBe] [FGB] [EGB] [FGB] [EGB] | [DGB] [EGB] [DGB] (2[CGB] [DGB] [B,EG]3 |]
[V:LH2] [E,,,E,,]6 x3 | x9 | [E,,,E,,B,,]6 x3 | x9 |]`,
};
