// Sauvegarde de la progression : export / import d'un fichier, rappel régulier, stockage persistant.
import { store } from './store.js';
import { db } from './db.js';
import { h } from './util.js';

const DAY = 864e5;

/** Télécharge un fichier JSON avec la progression, les réglages, les prises et les analyses. */
export async function exportProgress() {
  const data = { app: 'parcours-piano', format: 2, exportedAt: new Date().toISOString(), store: store.state, db: await db.exportAll() };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: `parcours-piano-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  store.set('backup', { ...(store.get('backup') || {}), exportedAt: Date.now() });
}

/** Importe un fichier de sauvegarde (format V3, ou ancien format V1/V2 : progression seule). */
export async function importProgress(text) {
  const data = JSON.parse(text);
  if (data && data.app === 'parcours-piano' && data.format >= 2) {
    store.importJSON(data.store);
    await db.importAll(data.db || {});
  } else {
    store.importJSON(data);
  }
}

/** Efface tout : progression, réglages, prises et analyses. */
export async function resetAll() {
  store.reset();
  for (const s of ['takes', 'scores', 'kv']) { try { await db.clear(s); } catch (e) { /* */ } }
}

/** Faut-il rappeler de sauvegarder ? (progression réelle, pas de sauvegarde depuis longtemps) */
export function needsBackupReminder() {
  const b = store.get('backup') || {};
  const now = Date.now();
  if (b.remindAfter && now < b.remindAfter) return false;
  if (Object.keys(store.get('done') || {}).length < 3) return false;
  if (!b.since) { store.set('backup', { ...b, since: now }); return false; }
  if (!b.exportedAt) return now - b.since > 7 * DAY;
  return now - b.exportedAt > 30 * DAY;
}

export function postponeReminder(days = 7) {
  store.set('backup', { ...(store.get('backup') || {}), remindAfter: Date.now() + days * DAY });
}

export function lastBackupLabel() {
  const t = (store.get('backup') || {}).exportedAt;
  if (!t) return 'jamais';
  const d = Math.floor((Date.now() - t) / DAY);
  return d === 0 ? 'aujourd’hui' : d === 1 ? 'hier' : `il y a ${d} jours`;
}

/** Demande au navigateur de ne pas effacer les données de l'appli quand l'espace manque. */
export function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(p => { if (!p && navigator.storage.persist) return navigator.storage.persist(); }).catch(() => {});
    }
  } catch (e) { /* non pris en charge */ }
}
