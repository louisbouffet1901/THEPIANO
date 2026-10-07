// Chargement à la demande : abcjs (rendu des partitions) et code des outils.
// Le démarrage ne charge que l'essentiel ; le reste arrive quand une page en a besoin
// (depuis le cache hors connexion, donc sans réseau une fois l'appli installée).
import { h } from './util.js';

const ABCJS_SRC = 'abcjs-basic-min.js';
let abcPromise = null;

/** Charge abcjs une seule fois ; renvoie window.ABCJS. */
export function ensureAbcjs() {
  if (window.ABCJS && window.ABCJS.renderAbc) return Promise.resolve(window.ABCJS);
  if (!abcPromise) {
    abcPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = ABCJS_SRC;
      s.async = true;
      s.onload = () => (window.ABCJS && window.ABCJS.renderAbc ? resolve(window.ABCJS) : reject(new Error('Rendu des partitions indisponible.')));
      s.onerror = () => { abcPromise = null; s.remove(); reject(new Error('Impossible de charger le rendu des partitions.')); };
      document.head.append(s);
    });
  }
  return abcPromise;
}

/**
 * Monte un widget dont le code se charge à la demande.
 * `load` renvoie une promesse de fonction (el) => nettoyage ; la fonction de nettoyage renvoyée ici
 * est valable tout de suite, même si le chargement n'est pas terminé.
 */
export function mountLazy(el, load, label = 'Chargement…') {
  let dead = false;
  let dispose = null;
  const ph = h('div', { class: 'w-loading', role: 'status' }, label);
  el.append(ph);
  Promise.resolve().then(load).then(mount => {
    if (dead) return;
    ph.remove();
    const c = mount(el);
    if (typeof c === 'function') dispose = c;
  }).catch(e => {
    if (dead) return;
    console.error(e);
    ph.remove();
    el.append(h('div', { class: 'callout warn' },
      h('div', { class: 'c-title' }, 'Affichage impossible'),
      h('p', {}, (e && e.message) || 'Erreur de chargement. Recharge la page.')));
  });
  return () => { dead = true; try { dispose?.(); } catch (e) { /* */ } };
}
