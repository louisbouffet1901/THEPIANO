// Onglet « Exercices » (V4.2) : indépendance des mains, polyrythmes, lié contre détaché, une main qui chante,
// mouvements et notes tenues. Chaque exercice est une courte partition à deux mains : « En rythme » (décompte, clic),
// puis un retour main par main (justesse, mise en place, tendance, tenue des notes, force), une progression de tempo
// jusqu'au tempo visé, et l'exercice du jour.
import { h, esc, mean, median, fmtPct } from './util.js';
import { store } from './store.js';
import { mountScore } from './score-widget.js';

/* ------------------------------------------------------------------ */
/* Les exercices                                                       */
/* ------------------------------------------------------------------ */
const abc2 = (rh, lh, { L = '1/8', rhVoices = null } = {}) => {
  const head = `X:1\nM:4/4\nL:${L}\nK:C\n`;
  if (rhVoices) return head + `%%score {(RH1 RH2) | LH}\nV:RH1 clef=treble stem=up\nV:RH2 clef=treble stem=down\nV:LH clef=bass\n[V:RH1] ${rhVoices[0]}\n[V:RH2] ${rhVoices[1]}\n[V:LH] ${lh}`;
  return head + `%%score {RH | LH}\nV:RH clef=treble\nV:LH clef=bass\n[V:RH] ${rh}\n[V:LH] ${lh}`;
};

export const FAMILIES = {
  rythme: { label: 'Deux rythmes à la fois', intro: 'Chaque main garde son propre rythme : l’une tient la pulsation, l’autre se pose dessus.' },
  poly: { label: 'Polyrythmes', intro: 'Deux divisions du temps en même temps : trois contre deux, deux contre trois, quatre contre trois (celui de la Fantaisie-Impromptu).' },
  artic: { label: 'Lié contre détaché', intro: 'Une main lie, l’autre détache : la texture du nocturne (mélodie liée, main gauche staccato).' },
  nuance: { label: 'Une main chante, l’autre accompagne', intro: 'Deux nuances à la fois : la mélodie devant, l’accompagnement derrière. L’appli mesure la force de chaque main.' },
  mvt: { label: 'Mouvements et notes tenues', intro: 'Les mains en miroir, une main qui tient pendant que l’autre bouge, un doigt qui tient pendant que les autres jouent.' },
};

export const EXERCISES = [
  { id: 'rythme-blanches', fam: 'rythme', title: 'Noires contre blanches', start: 60, target: 92,
    goal: 'La main gauche tient des blanches pendant que la droite avance en noires.',
    how: ['Compte « 1, 2, 3, 4 » à voix haute : la main gauche ne joue que sur 1 et 3.', 'Tiens les blanches jusqu’au bout : le doigt reste enfoncé pendant que la droite continue.', 'Mains séparées d’abord (MD, puis MG) avec le clic, puis ensemble.'],
    abc: abc2('C2 D2 E2 F2 | G2 F2 E2 D2 | C2 E2 G2 E2 | C8 |]', 'C,4 G,,4 | C,4 G,,4 | C,4 G,,4 | C,8 |]') },
  { id: 'rythme-croches', fam: 'rythme', title: 'Croches contre noires', start: 60, target: 100,
    goal: 'Deux croches à droite pour chaque noire à gauche : la gauche marque le temps, la droite le divise.',
    how: ['Compte « 1 et 2 et » : la gauche joue sur les chiffres, la droite sur tout.', 'Garde la gauche légère et régulière, comme un métronome.', 'Si ça accroche, joue la droite seule en disant les chiffres de la gauche.'],
    abc: abc2('CDEF GFED | CEGE FAGF | EGFE DCB,D | C8 |]', 'C,2 G,,2 C,2 G,,2 | C,2 G,,2 F,,2 F,,2 | C,2 C,2 G,,2 G,,2 | C,8 |]') },
  { id: 'rythme-alberti', fam: 'rythme', title: 'Une basse d’Alberti sous la mélodie', start: 60, target: 104,
    goal: 'La gauche déroule des croches régulières (basse d’Alberti) sous une mélodie lente à droite.',
    how: ['La basse d’Alberti : basse, quinte, tierce, quinte (do – sol – mi – sol), sans accent.', 'La mélodie tient ses valeurs longues pendant que la gauche continue.', 'Lentement d’abord : la régularité de la gauche passe avant la vitesse.'],
    abc: abc2('E2 F2 G4 | A2 G2 F4 | D2 E2 F2 D2 | E2 D2 C4 |]', 'C,G,E,G, C,G,E,G, | C,A,F,A, C,A,F,A, | B,,G,D,G, B,,G,D,G, | C,G,E,G, C,4 |]') },
  { id: 'rythme-pointe', fam: 'rythme', title: 'Le rythme pointé', start: 56, target: 96,
    goal: 'Noire pointée et croche à droite, sur des noires régulières à gauche.',
    how: ['Compte « 1, 2 et, 3, 4 et » : la croche de la droite tombe sur le « et » du 2e et du 4e temps.', 'Sur le 2e temps, la gauche joue seule : la noire pointée de la droite continue de sonner.', 'Ne raccourcis pas la noire pointée : elle dure un temps et demi.'],
    abc: abc2('C3 D E3 F | G3 A G3 F | E3 F D3 E | C8 |]', 'C,2 G,2 C,2 G,2 | C,2 G,2 B,,2 G,2 | C,2 G,2 G,,2 G,2 | C,8 |]') },
  { id: 'rythme-contretemps', fam: 'rythme', title: 'Le contretemps', start: 52, target: 92,
    goal: 'La gauche joue sur les temps, la droite seulement entre les temps (sur les « et »).',
    how: ['Compte « 1 et 2 et » : la droite sur les « et », la gauche sur les chiffres. Les mains ne jouent jamais ensemble.', 'Pense la droite comme un écho de la gauche, au milieu exact du temps.', 'Le clic t’aide : la droite tombe pile entre deux clics.'],
    abc: abc2('zC zD zE zF | zG zF zE zD | zC zE zG zE | C8 |]', 'C,2 C,2 C,2 C,2 | G,,2 G,,2 G,,2 G,,2 | C,2 C,2 C,2 C,2 | C,8 |]') },
  { id: 'rythme-syncope', fam: 'rythme', title: 'La syncope', start: 52, target: 88,
    goal: 'Croche, noire, croche à droite : la noire enjambe le temps pendant que la gauche le marque.',
    how: ['La noire de la droite commence sur un « et » et dure jusqu’au « et » suivant : ne la rejoue pas sur le temps.', 'La gauche joue bien chaque temps : c’est elle qui fait sentir la syncope.', 'Tape d’abord le rythme de la droite sur tes genoux en disant « 1 et 2 et ».'],
    abc: abc2('C D2 D E F2 F | G A2 A G F2 F | E F2 F E D2 D | C8 |]', 'C,2 G,,2 C,2 G,,2 | C,2 F,,2 C,2 F,,2 | C,2 G,,2 G,,2 G,,2 | C,8 |]') },
  { id: 'poly-3contre1', fam: 'poly', title: 'Trois contre un', start: 54, target: 92,
    goal: 'Des triolets à droite sur des noires à gauche.',
    how: ['Trois notes égales par temps à droite ; la gauche ne joue qu’avec la première.', 'Dis « tri-o-let » en jouant : la gauche tombe sur « tri ».', 'Garde les triolets égaux : pas de « croche, croche, noire ».'],
    abc: abc2('(3CEG (3cGE (3CEG (3cGE | (3B,DF (3GFD (3B,DF (3GFD | (3CEG (3cGE (3CFA (3cAF | (3B,DG (3dBG c4 |]', 'C,2 C,2 C,2 C,2 | G,,2 G,,2 G,,2 G,,2 | C,2 C,2 F,,2 F,,2 | G,,2 G,,2 C,4 |]') },
  { id: 'poly-3contre2', fam: 'poly', title: 'Trois contre deux', start: 46, target: 80,
    goal: 'Trois notes à droite pendant deux à gauche, dans chaque temps.',
    how: ['Le moyen de s’en souvenir : « pas-se le beurre ». « Pas » : les deux mains ; « se » : la droite ; « le » : la gauche ; « beurre » : la droite.', 'Travaille d’abord un seul temps en boucle, très lentement.', 'Les deux mains ne se rejoignent que sur le temps.'],
    abc: abc2('(3CEG (3cGE (3CEG (3cGE | (3B,DF (3GFD (3B,DF (3GFD | (3CEG (3cGE (3CFA (3cAF | (3B,DG (3dBG c4 |]', 'C,G, C,G, C,G, C,G, | G,,D, G,,D, G,,D, G,,D, | C,G, C,G, F,,C, F,,C, | G,,D, G,,D, C,4 |]') },
  { id: 'poly-2contre3', fam: 'poly', title: 'Deux contre trois', start: 46, target: 80,
    goal: 'L’inverse : des triolets à gauche, deux croches à droite.',
    how: ['Même « pas-se le beurre », mains échangées : la gauche a trois notes, la droite deux.', 'La gauche reste en arrière-plan, la mélodie de la droite chante.', 'Si la droite se met en triolets, ralentis et compte « 1 et ».'],
    abc: abc2('EDEF GFED | FEFG AGFE | DEFG FEDB, | C8 |]', '(3C,G,E, (3C,G,E, (3C,G,E, (3C,G,E, | (3F,,C,A, (3F,,C,A, (3F,,C,A, (3F,,C,A, | (3G,,D,B, (3G,,D,B, (3G,,D,F, (3G,,D,F, | C,8 |]') },
  { id: 'poly-4contre3', fam: 'poly', title: 'Quatre contre trois', start: 40, target: 72,
    goal: 'Quatre doubles croches à droite contre trois croches de triolet à gauche, comme dans la Fantaisie-Impromptu de Chopin.',
    how: ['Chaque main seule d’abord, au clic, jusqu’à ce qu’elle soit parfaitement régulière.', 'Puis mains ensemble très lentement : seules les premières notes de chaque temps coïncident.', 'Ne compte pas toutes les notes : sens deux mouvements réguliers qui se croisent.'],
    abc: abc2('cBcd edcB AGAB cdec | dcde fedc BABc dcBG | cBcd edcB AGFE DEFD | C16 |]',
      '(3C,2G,2E,2 (3C,2G,2E,2 (3C,2G,2E,2 (3C,2G,2E,2 | (3G,,2D,2B,2 (3G,,2D,2B,2 (3G,,2D,2B,2 (3G,,2D,2B,2 | (3C,2G,2E,2 (3C,2G,2E,2 (3F,,2C,2A,2 (3G,,2D,2B,2 | C,16 |]', { L: '1/16' }) },
  { id: 'artic-lie-detache', fam: 'artic', title: 'Droite liée, gauche détachée', start: 60, target: 92,
    goal: 'La mélodie liée à droite, la main gauche staccato : la texture du début de l’op. 55.',
    how: ['Droite : relâche chaque note au moment où la suivante s’enfonce, sans trou.', 'Gauche : rebondis, la note dure à peine la moitié de sa valeur, poignet souple.', 'Écoute-toi : un chant continu au-dessus, des points légers en dessous.'],
    focus: { type: 'artic', legato: 'rh', staccato: 'lh' },
    abc: abc2('(E2 F2 G2 A2 | G4 F2 E2 | D2 E2 F2 D2 | C8) |]', '.C,2 .[E,G,]2 .C,2 .[E,G,]2 | .C,2 .[E,G,]2 .C,2 .[E,G,]2 | .G,,2 .[F,B,]2 .G,,2 .[F,B,]2 | .C,2 .[E,G,]2 C,4 |]') },
  { id: 'artic-detache-lie', fam: 'artic', title: 'Droite détachée, gauche liée', start: 60, target: 96,
    goal: 'L’inverse : une basse liée qui descend, des notes détachées à droite.',
    how: ['Gauche : garde chaque blanche jusqu’à la suivante, sans trou.', 'Droite : notes courtes et légères, sans accent.', 'Le piège : la droite qui entraîne la gauche (tout devient détaché).'],
    focus: { type: 'artic', legato: 'lh', staccato: 'rh' },
    abc: abc2('.c2 .B2 .A2 .G2 | .F2 .E2 .D2 .C2 | .E2 .G2 .F2 .D2 | .E2 .D2 .C2 z2 |]', '(C,4 B,,4 | A,,4 G,,4 | C,4 G,,4 | C,6) z2 |]') },
  { id: 'nuance-chant-droite', fam: 'nuance', title: 'Le chant à droite', start: 60, target: 92,
    goal: 'Mélodie mezzo forte à droite, accompagnement piano à gauche.',
    how: ['Droite : le poids du bras dans chaque note, le son porte.', 'Gauche : du bout des doigts, près des touches.', 'Vise un écart net : on doit entendre la mélodie sans effort.'],
    focus: { type: 'dyn', loud: 'rh', soft: 'lh', diff: 12 },
    abc: abc2('!mf!E4 G4 | A4 F4 | E2 F2 G2 F2 | E8 |]', '!p!C,G,E,G, C,G,E,G, | C,A,F,A, C,A,F,A, | C,G,E,G, B,,G,D,G, | C,G,E,G, C,4 |]') },
  { id: 'nuance-chant-gauche', fam: 'nuance', title: 'Le chant à gauche', start: 60, target: 92,
    goal: 'La mélodie passe à la main gauche ; la droite accompagne en accords doux.',
    how: ['Gauche : chante chaque note, legato, avec le poids du bras.', 'Droite : accords légers, tous les doigts ensemble, sans attaque.', 'Comme dans la partie centrale de beaucoup de nocturnes : la mélodie au ténor.'],
    focus: { type: 'dyn', loud: 'lh', soft: 'rh', diff: 12 },
    abc: abc2('!p![EG]2 [EG]2 [EG]2 [EG]2 | [FA]2 [FA]2 [FA]2 [FA]2 | [DG]2 [DG]2 [DF]2 [DF]2 | [EG]2 [EG]2 [EG]4 |]', '!f!C,4 E,4 | F,4 A,4 | B,,4 G,,4 | C,8 |]') },
  { id: 'mvt-contraire', fam: 'mvt', title: 'Mouvement contraire', start: 60, target: 100,
    goal: 'Les deux mains s’écartent puis se rapprochent, note contre note.',
    how: ['Les mêmes doigts aux deux mains (1, 2, 3, pouce qui passe, 1, 2, 3, 4, 5) : les mains travaillent en miroir.', 'Les deux notes doivent tomber exactement ensemble.', 'Regarde loin devant : les mains se déplacent en même temps.'],
    focus: { type: 'sync', max: 45 },
    abc: abc2('C2 D2 E2 F2 | G2 A2 B2 c2 | c2 B2 A2 G2 | F2 E2 D2 C2 | C8 |]', 'C,2 B,,2 A,,2 G,,2 | F,,2 E,,2 D,,2 C,,2 | C,,2 D,,2 E,,2 F,,2 | G,,2 A,,2 B,,2 C,2 | C,8 |]') },
  { id: 'mvt-tenir-gauche', fam: 'mvt', title: 'La gauche tient, la droite bouge', start: 60, target: 100,
    goal: 'La main gauche tient un accord toute la mesure pendant que la droite joue des croches.',
    how: ['Enfonce l’accord et garde-le jusqu’à la barre de mesure, sans pédale.', 'La droite reste légère et égale ; la gauche ne bouge pas.', 'Relâche l’accord pile au moment de jouer le suivant.'],
    focus: { type: 'hold', hand: 'lh' },
    abc: abc2('CDEF GFED | EFGA GFED | DEFG FEDB, | C8 |]', '[C,G,]8 | [C,G,]8 | [B,,G,]8 | [C,G,]8 |]') },
  { id: 'mvt-tenir-doigt', fam: 'mvt', title: 'Tenir une note avec le pouce', start: 60, target: 92,
    goal: 'À droite, le pouce tient le do pendant que les autres doigts jouent la mélodie au-dessus.',
    how: ['Pouce sur do, enfoncé toute la mesure ; les doigts 2, 3, 4 jouent mi, fa, sol.', 'La main reste souple : seul le pouce est immobile.', 'C’est la base des voix intérieures tenues chez Chopin.'],
    focus: { type: 'hold', pitch: 60 },
    abc: abc2(null, 'C,8 | C,8 | G,,8 | C,8 |]', { rhVoices: ['E2 F2 G2 F2 | E2 F2 G2 A2 | G2 F2 E2 D2 | E8 |]', 'C8 | C8 | C8 | C8 |]'] }) },
];
// ordre conseillé (l'exercice du jour suit cet ordre)
export const ORDER = ['rythme-blanches', 'rythme-croches', 'artic-lie-detache', 'mvt-contraire', 'rythme-alberti', 'nuance-chant-droite', 'poly-3contre1', 'rythme-pointe',
  'mvt-tenir-gauche', 'artic-detache-lie', 'rythme-contretemps', 'poly-3contre2', 'nuance-chant-gauche', 'rythme-syncope', 'mvt-tenir-doigt', 'poly-2contre3', 'poly-4contre3'];
const byId = id => EXERCISES.find(e => e.id === id);

/* ------------------------------------------------------------------ */
/* Évaluation d'une prise « En rythme »                                */
/* ------------------------------------------------------------------ */
const HAND = { rh: 'main droite', lh: 'main gauche' };
const BASE = { acc: 0.9, prec: 0.75 };
const ART = { legato: 0.85, staccato: 0.6, hold: 0.9 };

function handStats(items, hand, spqMs) {
  const it = items.filter(i => i.hand === hand);
  if (!it.length) return null;
  const hit = it.filter(i => i.status !== 'miss' && i.dt != null);
  const ratio = list => list.filter(i => i.durMs != null && i.dur > 0).map(i => i.durMs / (i.dur * spqMs));
  const arts = ratio(hit);
  const vels = hit.map(i => i.vel).filter(v => v != null);
  return {
    n: it.length, acc: hit.length / it.length, prec: it.filter(i => i.status === 'ok').length / it.length,
    bias: hit.length ? median(hit.map(i => i.dt)) : 0, art: arts.length ? median(arts) : null, vel: vels.length ? mean(vels) : null,
  };
}
/** Écart moyen (ms) entre les deux mains sur les attaques communes. */
function asyncMs(items) {
  const at = new Map();
  for (const i of items) { if (i.dt == null) continue; const k = Math.round(i.t * 48); const o = at.get(k) || { rh: [], lh: [] }; o[i.hand]?.push(i.dt); at.set(k, o); }
  const d = [...at.values()].filter(o => o.rh.length && o.lh.length).map(o => Math.abs(median(o.rh) - median(o.lh)));
  return d.length ? mean(d) : null;
}

export function evaluate(ex, res, ctx) {
  const items = res.items || [];
  const spq = res.spqMs || 1000;
  const S = { rh: handStats(items, 'rh', spq), lh: handStats(items, 'lh', spq) };
  const both = !!(S.rh && S.lh);
  const issues = [];
  for (const k of ['rh', 'lh']) {
    const s = S[k]; if (!s) continue;
    if (s.acc < BASE.acc) issues.push({ w: 3, txt: `${HAND[k]} : des notes manquées ou fausses (${fmtPct(s.acc)} justes). Joue-la seule (bouton ${k === 'rh' ? 'MD' : 'MG'}) en « Mode attente », puis reviens aux deux mains.` });
    else if (s.prec < BASE.prec) issues.push({ w: 2, txt: `${HAND[k]} : notes justes mais pas toujours au bon moment (${fmtPct(s.prec)} dans le temps). Ralentis de 10 % et compte à voix haute.` });
    if (Math.abs(s.bias) > 45 && s.acc >= 0.7) issues.push({ w: 1, txt: `La ${HAND[k]} est en ${s.bias > 0 ? 'retard' : 'avance'} d’environ ${Math.round(Math.abs(s.bias))} ms : elle ${s.bias > 0 ? 'attend l’autre main au lieu de suivre le clic' : 'se précipite'}.` });
  }
  const f = ex.focus || {};
  let sync = null;
  if (both) sync = asyncMs(items);
  if (f.type === 'artic') {
    const L = S[f.legato], St = S[f.staccato];
    if (L && L.art != null && L.art < ART.legato) issues.push({ w: 2, txt: `La ${HAND[f.legato]} doit être liée : enchaîne les notes sans trou, relâche une touche quand la suivante s’enfonce (tenue mesurée : ${fmtPct(L.art)} de la valeur).` });
    if (St && St.art != null && St.art > ART.staccato) issues.push({ w: 2, txt: `La ${HAND[f.staccato]} doit être détachée : relâche chaque note à mi-valeur, poignet souple (tenue mesurée : ${fmtPct(St.art)}).` });
  }
  if (f.type === 'dyn' && S[f.loud]?.vel != null && S[f.soft]?.vel != null) {
    const d = S[f.loud].vel - S[f.soft].vel;
    if (d < f.diff) issues.push({ w: 2, txt: `La ${HAND[f.loud]} doit dominer : écart de force mesuré ${Math.round(d)} (vise au moins ${f.diff}). ${HAND[f.soft][0].toUpperCase() + HAND[f.soft].slice(1)} du bout des doigts, ${HAND[f.loud]} avec le poids du bras.` });
  }
  if (f.type === 'sync' && sync != null && sync > f.max) issues.push({ w: 2, txt: `Les deux mains ne tombent pas ensemble (écart moyen ${Math.round(sync)} ms). Ralentis et vise des attaques parfaitement simultanées.` });
  let hold = null;
  if (f.type === 'hold') {
    const list = items.filter(i => i.dt != null && i.durMs != null && i.dur > 0 && (f.hand ? i.hand === f.hand : i.pitch === f.pitch));
    hold = list.length ? median(list.map(i => i.durMs / (i.dur * spq))) : null;
    if (hold != null && hold < ART.hold) issues.push({ w: 2, txt: `La note tenue est relâchée trop tôt (${fmtPct(hold)} de sa valeur) : garde le doigt enfoncé jusqu’à la fin de la mesure.` });
  }
  issues.sort((a, b) => b.w - a.w);
  const baseOk = ['rh', 'lh'].every(k => !S[k] || (S[k].acc >= BASE.acc && S[k].prec >= BASE.prec));
  const ok = both && !ctx?.range && baseOk && !issues.some(i => i.w >= 2);
  const accMin = Math.min(...['rh', 'lh'].filter(k => S[k]).map(k => S[k].acc));
  return { ok, both, S, sync, hold, issues, accMin };
}

/* ------------------------------------------------------------------ */
/* État et progression                                                 */
/* ------------------------------------------------------------------ */
const stateOf = id => ({ tries: 0, best: 0, mastered: false, lastAt: 0, lastBpm: null, hist: [], ...(store.get(`exercises.${id}`) || {}) });
const saveState = (id, s) => store.set(`exercises.${id}`, s);
export function statusLabel(ex) {
  const s = stateOf(ex.id);
  if (s.mastered) return `Réussi ✓ · ♩ = ${s.best}`;
  if (s.best) return `Réussi à ♩ = ${s.best} · objectif ${ex.target}`;
  if (s.tries) return `${s.tries} essai${s.tries > 1 ? 's' : ''} · pas encore réussi`;
  return 'Pas encore fait';
}
/** L'exercice du jour : celui en cours, sinon le suivant dans l'ordre conseillé, sinon la révision la plus ancienne. */
export function recommendExercise() {
  const st = ORDER.map(id => [id, stateOf(id)]);
  const doing = st.filter(([, s]) => s.tries && !s.mastered).sort((a, b) => b[1].lastAt - a[1].lastAt);
  if (doing.length) return { ex: byId(doing[0][0]), why: `En cours : ${statusLabel(byId(doing[0][0])).toLowerCase()}.` };
  const fresh = st.find(([, s]) => !s.tries);
  if (fresh) return { ex: byId(fresh[0]), why: 'Nouvel exercice, dans l’ordre conseillé.' };
  const old = st.sort((a, b) => a[1].lastAt - b[1].lastAt)[0];
  return { ex: byId(old[0]), why: 'Révision : tous les exercices sont réussis ; celui-ci attend depuis le plus longtemps.' };
}

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
function criteriaText(ex) {
  const f = ex.focus || {};
  let t = `notes justes ${Math.round(BASE.acc * 100)} % et dans le temps ${Math.round(BASE.prec * 100)} % à chaque main, mains ensemble, au tempo visé (♩ = ${ex.target})`;
  if (f.type === 'artic') t += ` ; ${HAND[f.legato]} liée (notes tenues au moins ${Math.round(ART.legato * 100)} % de leur valeur), ${HAND[f.staccato]} détachée (au plus ${Math.round(ART.staccato * 100)} %)`;
  if (f.type === 'dyn') t += ` ; ${HAND[f.loud]} plus forte d’au moins ${f.diff} (force des notes, sur 127)`;
  if (f.type === 'sync') t += ` ; attaques des deux mains à moins de ${f.max} ms l’une de l’autre`;
  if (f.type === 'hold') t += ` ; note tenue jusqu’au bout (au moins ${Math.round(ART.hold * 100)} % de sa valeur)`;
  return t.charAt(0).toUpperCase() + t.slice(1) + '.';
}
const trend = b => (Math.abs(b) < 25 ? 'à l’heure' : b > 0 ? `en retard de ${Math.round(b)} ms` : `en avance de ${Math.round(-b)} ms`);

function feedbackPanel(ex, ev, ctx, onChange) {
  const s = stateOf(ex.id);
  s.tries++; s.lastAt = Date.now(); s.lastBpm = ctx.bpm;
  let msg;
  if (ev.ok) {
    s.best = Math.max(s.best || 0, ctx.bpm);
    if (ctx.bpm >= ex.target) { s.mastered = true; msg = `Réussi au tempo visé (♩ = ${ex.target}) : exercice acquis ✓.`; }
    else { const nb = Math.min(ex.target, Math.round(ctx.bpm * 1.06)); ctx.setBpm(nb); s.lastBpm = nb; msg = `Réussi à ♩ = ${ctx.bpm}. Tempo suivant : ♩ = ${nb} (déjà réglé).`; }
  } else if (!ev.both) msg = 'Une seule main jouée : bien pour travailler, mais l’exercice se valide mains ensemble (bouton « 2 mains »).';
  else if (ctx.range) msg = 'Plage de mesures choisie : retour donné, mais l’exercice se valide en entier (bouton « Tout »).';
  else if (ev.accMin < 0.8) { const nb = Math.max(Math.round(ex.start * 0.8), Math.round(ctx.bpm * 0.9)); ctx.setBpm(nb); s.lastBpm = nb; msg = `Pas encore. On redescend à ♩ = ${nb} (déjà réglé) : la mise en place d’abord.`; }
  else msg = `Presque : refais-le au même tempo (♩ = ${ctx.bpm}).`;
  s.hist = [...(s.hist || []), { at: s.lastAt, bpm: ctx.bpm, ok: ev.ok }].slice(-20);
  saveState(ex.id, s);
  onChange?.();

  const box = h('div', { class: 'ex-feedback' + (ev.ok ? ' ok' : '') });
  box.append(h('p', { class: 'ex-verdict' }, msg));
  const f = ex.focus || {};
  const hands = ['rh', 'lh'].filter(k => ev.S[k]);
  const row = (label, fn) => h('tr', {}, h('th', {}, label), ...hands.map(k => h('td', {}, fn(ev.S[k], k))));
  const table = h('table', { class: 'ex-table' }, h('thead', {}, h('tr', {}, h('th', {}), ...hands.map(k => h('th', {}, HAND[k][0].toUpperCase() + HAND[k].slice(1))))),
    h('tbody', {},
      row('Notes justes', s0 => fmtPct(s0.acc)),
      row('Dans le temps', s0 => fmtPct(s0.prec)),
      row('Tendance', s0 => trend(s0.bias)),
      f.type === 'artic' ? row('Tenue des notes', (s0, k) => (s0.art == null ? '—' : `${fmtPct(s0.art)} ${k === f.legato ? (s0.art >= ART.legato ? '(lié ✓)' : '(à lier)') : (s0.art <= ART.staccato ? '(détaché ✓)' : '(à détacher)')}`)) : null,
      f.type === 'dyn' ? row('Force moyenne', s0 => (s0.vel == null ? '—' : String(Math.round(s0.vel)))) : null));
  box.append(table);
  const extra = [];
  if (ev.sync != null) extra.push(`Mains ensemble : écart moyen ${Math.round(ev.sync)} ms${f.type === 'sync' ? (ev.sync <= f.max ? ' ✓' : ` (vise moins de ${f.max})`) : ''}.`);
  if (ev.hold != null) extra.push(`Note tenue : ${fmtPct(ev.hold)} de sa valeur${ev.hold >= ART.hold ? ' ✓' : ''}.`);
  if (extra.length) box.append(h('p', { class: 'small' }, extra.join(' ')));
  if (ev.issues.length) box.append(h('ul', { class: 'ex-tips' }, ...ev.issues.slice(0, 2).map(i => h('li', {}, i.txt))));
  return box;
}

function mountTrainer(host, ex, onChange) {
  host.innerHTML = '';
  const fam = FAMILIES[ex.fam];
  const card = h('div', { class: 'card ex-head' });
  card.innerHTML = `<div class="card-top"><span class="eyebrow">${esc(fam.label)}</span><span class="small ex-status">${esc(statusLabel(ex))}</span></div>
    <h3>${esc(ex.title)}</h3><p>${esc(ex.goal)}</p>
    <div class="ex-cols"><div><div class="ess-title muted-title">Comment faire</div><ul>${ex.how.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div><div class="ess-title muted-title">Réussi quand</div><p class="small">${esc(criteriaText(ex))}</p><p class="small">Touche <b>En rythme</b> : décompte, puis joue avec le clic. Le tempo monte après chaque réussite.</p></div></div>`;
  const scoreHost = h('div');
  host.append(card, scoreHost);
  const st = stateOf(ex.id);
  const refreshStatus = () => { const el = card.querySelector('.ex-status'); if (el) el.textContent = statusLabel(ex); onChange?.(); };
  return mountScore(scoreHost, {
    abc: ex.abc, bpm: ex.target, startBpm: st.lastBpm || ex.start, practice: true, drill: true, click: true, analysis: false, passage: `ex:${ex.id}`,
    onTempo: (res, ctx) => feedbackPanel(ex, evaluate(ex, res, ctx), ctx, refreshStatus),
  });
}

/** La page : l'exercice du jour et tous les exercices par famille (la lecture de notes chronométrée est passée dans
 *  l'échauffement de la Lecture à vue en V7.1). */
export function mountExercisesPage(el, opts = {}) {
  const cleanups = [];
  el.append(h('div', { class: 'section-title mt-0' }, h('h2', {}, 'Indépendance des mains')));
  const recoBox = h('div');
  const trainer = h('div', { class: 'ex-trainer' });
  const list = h('div');
  el.append(recoBox, trainer, list);
  let trainerCleanup = null;
  const open = ex => {
    try { trainerCleanup?.(); } catch (e) { /* */ }
    trainerCleanup = mountTrainer(trainer, ex, renderList);
    trainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const renderReco = () => {
    recoBox.innerHTML = '';
    const r = recommendExercise();
    const go = h('button', { class: 'btn primary', type: 'button' }, 'Commencer');
    go.addEventListener('click', () => open(r.ex));
    recoBox.append(h('div', { class: 'card reco' }, h('div', { class: 'eyebrow' }, 'L’exercice du jour'), h('h3', {}, r.ex.title), h('p', { class: 'small' }, `${r.why} ${r.ex.goal}`), go));
  };
  const openGroups = new Set();
  function renderList() {
    renderReco();
    list.innerHTML = '';
    const reco = recommendExercise().ex;
    for (const [fid, F] of Object.entries(FAMILIES)) {
      const exs = EXERCISES.filter(e => e.fam === fid);
      const ok = exs.filter(e => stateOf(e.id).mastered).length;
      const det = h('details', { class: 'preset-group' }, h('summary', {}, h('span', {}, F.label), h('span', { class: 'small' }, `réussis : ${ok}/${exs.length}`)));
      det.open = openGroups.has(fid) || (!openGroups.size && reco.fam === fid);
      det.addEventListener('toggle', () => { if (det.open) openGroups.add(fid); else openGroups.delete(fid); });
      const grid = h('div', { class: 'grid cols-3' });
      for (const e of exs) {
        const c = h('button', { class: 'card preset' + (stateOf(e.id).mastered ? ' ok' : ''), type: 'button' }, h('h3', {}, e.title), h('p', {}, statusLabel(e)));
        c.addEventListener('click', () => open(e));
        grid.append(c);
      }
      det.append(h('p', { class: 'small muted mt-0' }, F.intro), grid);
      list.append(det);
    }
  }
  renderList();
  // exercice demandé (séance, carte de la pièce) : ouvert d'emblée
  if (opts.open) { const ex = byId(opts.open); if (ex) open(ex); }
  return () => { cleanups.forEach(f => { try { f?.(); } catch (e) { /* */ } }); try { trainerCleanup?.(); } catch (e) { /* */ } };
}
