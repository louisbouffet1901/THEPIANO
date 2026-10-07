// Compensation de latence par entrée : piano (MIDI), écran tactile, clavier de l'ordinateur.
// Chaque entrée a son propre retard (Bluetooth, écran, système) : on le mesure une fois (Réglages → Son)
// et on le retire des instants de jeu avant de les comparer aux clics entendus.
import { store } from './store.js';

const KIND = { midi: 'midi', test: 'midi', repair: 'midi', virtual: 'touch', touch: 'touch', key: 'key' };

/** Retard (ms) de l'entrée qui a produit l'événement. */
export function inputLatency(source = 'midi') {
  const by = store.get('settings.latencyBy') || {};
  return Number(by[KIND[source] || source]) || 0;
}
/** Instant corrigé (ms, horloge performance.now()) d'un événement { time, source }. */
export const corrected = ev => ev.time - inputLatency(ev.source);
export const kindOf = source => KIND[source] || source;
