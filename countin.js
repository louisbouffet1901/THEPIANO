// Décompte commun à tous les exercices en rythme (onglet Rythme, « En rythme » sous les partitions, lecture à vue,
// écoute avec décompte) :
// - au moins quatre temps entendus : une mesure à 4/4 ou 12/8, deux mesures à 2/4, 3/4, 6/8 ou 9/8 ;
// - un départ laissé à une demi-seconde, pour que la tablette joue le premier clic à l'heure (le son d'Android
//   peut mettre un instant à démarrer) ;
// - l'affichage des temps suit le moment où le clic SORT du haut-parleur (latence de sortie comprise), pas le
//   moment où il est programmé : le chiffre affiché et le clic entendu coïncident.
import { audio } from './audio.js';

export const LEAD = 0.5;

/** Nombre de mesures et de temps du décompte. */
export function countInBeats(beatsPerBar, minBeats = 4) {
  const bpb = Math.max(1, Math.round(beatsPerBar));
  const bars = bpb >= minBeats ? 1 : Math.ceil(minBeats / bpb);
  return { bars, beats: bars * bpb, beatsPerBar: bpb };
}

/**
 * Programme le décompte. sub : subdivisions audibles par temps (0 = aucune).
 * Renvoie { nodes, t0, end, beats, bars, beatSec, perf0 } (t0, end : temps du contexte audio ;
 * perf0 : instant performance.now() où le premier clic sort du haut-parleur).
 */
export function scheduleCountIn({ beatsPerBar, beatSec, start = null, sub = 0, minBeats = 4 }) {
  const { bars, beats, beatsPerBar: bpb } = countInBeats(beatsPerBar, minBeats);
  audio.prime?.();
  const t0 = start ?? audio.now() + LEAD;
  const nodes = [];
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * beatSec;
    nodes.push(audio.click(t, i % bpb === 0 ? 'accent' : 'beat'));
    for (let s = 1; s < sub; s++) nodes.push(audio.click(t + (s * beatSec) / sub, 'sub'));
  }
  return { nodes, t0, end: t0 + beats * beatSec, beats, bars, beatSec, beatsPerBar: bpb, perf0: audio.ctxToPerf(t0) };
}

/** Position dans le décompte d'après l'horloge de l'écran : { beat (0…), inBar (1…), bar (1…), done }. */
export function countInPosition(plan, nowMs = performance.now()) {
  const x = (nowMs - plan.perf0) / (plan.beatSec * 1000);
  if (x < 0) return { beat: -1, inBar: 0, bar: 0, done: false, waiting: true };
  const beat = Math.floor(x);
  return { beat, inBar: (beat % plan.beatsPerBar) + 1, bar: Math.floor(beat / plan.beatsPerBar) + 1, done: beat >= plan.beats, waiting: false };
}
