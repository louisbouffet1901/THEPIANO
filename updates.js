// Mises à jour de l'appli : bandeau « Nouvelle version disponible », numéro de version, vérification manuelle.
// Le service worker installe la nouvelle version en arrière-plan puis attend ; l'appli propose de recharger.
import { h } from './util.js';
import { toast } from './toast.js';
import { APP_VERSION, BUILD, BUILT } from './version.js';

export const version = { app: APP_VERSION, build: BUILD, built: BUILT };

let registration = null;
let waitingWorker = null;
let wantReload = false;
let banner = null;
const listeners = new Set();

const BUILD_KEY = 'parcours-piano-build';

export function initUpdates() {
  // Confirmation visible après une mise à jour
  try {
    const prev = localStorage.getItem(BUILD_KEY);
    if (prev && prev !== BUILD) setTimeout(() => toast(`Appli mise à jour (version ${APP_VERSION}).`, 'ok', 3500), 700);
    localStorage.setItem(BUILD_KEY, BUILD);
  } catch (e) { /* stockage indisponible */ }

  if (!('serviceWorker' in navigator)) return;
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (location.protocol !== 'https:' && !local) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => { if (wantReload) location.reload(); });
  navigator.serviceWorker.register('sw.js').then(reg => {
    registration = reg;
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) offer(nw);
      });
    });
    // Recherche d'une nouvelle version à chaque retour dans l'appli, et toutes les heures
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => { /* hors connexion ou non pris en charge */ });
}

function offer(worker) {
  waitingWorker = worker;
  listeners.forEach(fn => { try { fn('available'); } catch (e) { /* */ } });
  showBanner();
}

function showBanner() {
  if (banner) return;
  const reload = h('button', { class: 'btn primary sm', type: 'button' }, 'Recharger');
  const later = h('button', { class: 'btn ghost sm', type: 'button' }, 'Plus tard');
  banner = h('div', { class: 'update-banner', role: 'status' }, h('span', {}, 'Nouvelle version disponible.'), reload, later);
  reload.addEventListener('click', applyUpdate);
  later.addEventListener('click', () => { banner.remove(); banner = null; });
  document.body.append(banner);
}

/** Active la version en attente puis recharge la page. */
export function applyUpdate() {
  if (!waitingWorker) return false;
  wantReload = true;
  waitingWorker.postMessage({ type: 'skip-waiting' });
  setTimeout(() => location.reload(), 4000); // filet de sécurité
  return true;
}

/** Vérification manuelle (Réglages) : 'available' | 'uptodate' | 'installing' | 'offline' | 'unsupported'. */
export async function checkForUpdate() {
  if (!registration) return 'unsupported';
  try { await registration.update(); } catch (e) { return 'offline'; }
  if (registration.waiting) { offer(registration.waiting); return 'available'; }
  if (registration.installing) return 'installing';
  return 'uptodate';
}

export const hasUpdate = () => !!waitingWorker;
export function onUpdate(fn) { listeners.add(fn); return () => listeners.delete(fn); }
