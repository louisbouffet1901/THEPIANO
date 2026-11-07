// Sauvegarde locale de la progression et des réglages (localStorage, avec repli en mémoire).
// Les prises jouées et les résultats d'analyse, plus volumineux, sont dans IndexedDB (db.js).
// V8 : au premier lancement d'une nouvelle version, une copie de la progression telle qu'elle était est gardée à part
// (`parcours-piano-v1:avant-maj`) ; Réglages permet d'y revenir.
import { APP_VERSION } from './version.js';

const KEY = 'parcours-piano-v1';
/** Version du format des données : chaque changement de format a sa migration (MIGRATIONS). */
export const DATA_VERSION = 2;

const DEFAULTS = () => ({
  version: DATA_VERSION,
  done: {},            // id de leçon -> date ISO
  plan: {},            // 'n1:s3:3' -> true
  validation: {},      // 'n1:c4' -> 0..3
  checks: {},          // listes à cocher dans les leçons
  stats: { sight: [], ear: [], analyzer: [] },
  settings: {
    midiInput: 'auto',
    midiOutput: '',
    demoOutput: 'sampler', // 'sampler' | 'midi'
    volume: 0.85,
    metroVolume: 0.7,
    room: 0.5,           // résonance de la salle (réverbération du piano échantillonné), 0 à 1 (V8.3)
    latency: 0,          // ms, ancienne compensation unique (V2) — remplacée par latencyBy
    latencyBy: { midi: 0, touch: 0, key: 0 }, // ms, compensation par entrée : piano, écran, clavier
    split: 60,           // séparation main gauche / main droite (MIDI)
    labels: 'fr',        // noms des touches sur le clavier : 'fr' | 'none'
    echoVirtual: true,   // son pour le clavier à l'écran
    voice: 'grave',      // tessiture pour les exercices de chant : 'grave' | 'aigue'
    voiceRange: null,    // tessiture mesurée [grave, aigu] en MIDI (outil « Trouver ma voix »)
    voiceMode: 'measured', // 'measured' : tessiture mesurée si elle existe ; 'preset' : voix grave / aiguë
  },
  pieces: {},          // options par pièce (ex. { byHeart: true })
  sight: {},           // lecture à vue : niveau choisi, progression par niveau (cible, extraits lus, essais), tempo
  mastery: {},         // « En cours de maîtrise » (V6.1) : leçons cochées (lessons.<id>.on), questions manquées, derniers résultats
  rhythm: {},          // progression de l'onglet Rythme
  improv: {},          // improvisation (V5) : paliers réussis (p), résumé par leçon (lessons)
  backup: { exportedAt: null, remindAfter: 0 }, // rappel de sauvegarde
  lastRoute: '#/',
});

/* Migrations : MIGRATIONS[n] transforme des données de version n − 1 en version n. */
const MIGRATIONS = {
  2: s => {
    const lat = Number(s.settings?.latency) || 0;
    s.settings = s.settings || {};
    // la V2 ne calibrait qu'avec le piano : on reprend la valeur pour le piano, et pour l'écran en attendant une calibration
    s.settings.latencyBy = { midi: lat, touch: lat, key: 0, ...(s.settings.latencyBy || {}) };
    return s;
  },
};

function migrate(s) {
  let v = Number(s.version) || 1;
  while (v < DATA_VERSION) {
    v += 1;
    if (MIGRATIONS[v]) s = MIGRATIONS[v](s);
    s.version = v;
  }
  return s;
}

/* Copie d'avant la mise à jour : la progression brute, telle que l'ancienne version l'a laissée. (Déclarée avant le
   chargement des données, qui s'en sert.) */
const SNAP = KEY + ':avant-maj';
let mem = null;
let snapNeeded = false;
let state = load();
const subs = new Set();

function snapshot(raw, parsed) {
  const meta = { from: parsed.appVersion || parsed.seenVersion || null, to: APP_VERSION, at: Date.now() };
  try { localStorage.setItem(SNAP, JSON.stringify({ ...meta, raw })); }
  catch (e) { // stockage plein : dans IndexedDB
    import('./db.js').then(m => m.db.setKV('avant-maj', { ...meta, raw })).catch(() => {});
  }
}
/** La copie d'avant la dernière mise à jour : { from, to, at } (sans le contenu), ou null. */
export async function snapshotInfo() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SNAP) || 'null'); } catch (e) { s = null; }
  if (!s) { try { s = await (await import('./db.js')).db.getKV('avant-maj'); } catch (e) { s = null; } }
  return s && s.raw ? { from: s.from, to: s.to, at: s.at, raw: s.raw } : null;
}
/** Revenir à la copie : la progression d'avant la mise à jour remplace l'actuelle (rechargement ensuite). */
export async function restoreSnapshot() {
  const s = await snapshotInfo();
  if (!s) return false;
  clearTimeout(saveTimer);
  localStorage.setItem(KEY, s.raw);
  return true;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed0 = JSON.parse(raw);
      if (parsed0.appVersion !== APP_VERSION) { snapshot(raw, parsed0); snapNeeded = true; }
      const parsed = migrate(parsed0);
      const st = merge(DEFAULTS(), parsed);
      st.appVersion = APP_VERSION;
      return st;
    }
  } catch (e) { /* stockage indisponible */ }
  if (mem) return mem;
  return { ...DEFAULTS(), appVersion: APP_VERSION };
}

function merge(base, extra) {
  for (const k of Object.keys(extra || {})) {
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof extra[k] === 'object' && !Array.isArray(extra[k])) {
      base[k] = merge(base[k], extra[k]);
    } else {
      base[k] = extra[k];
    }
  }
  return base;
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { mem = state; }
  }, 250);
}

// la version notée dans les données dès le premier lancement (la copie est faite une seule fois par version)
if (snapNeeded) persist();

export const store = {
  get state() { return state; },
  get(path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), state);
  },
  set(path, value) {
    const keys = path.split('.');
    let o = state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (o[keys[i]] == null || typeof o[keys[i]] !== 'object') o[keys[i]] = {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
    persist();
    subs.forEach(fn => fn(path, value));
  },
  push(path, item, max = 200) {
    const arr = this.get(path) || [];
    arr.push(item);
    while (arr.length > max) arr.shift();
    this.set(path, arr);
  },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  isDone(id) { return !!state.done[id]; },
  setDone(id, v = true) {
    if (v) state.done[id] = new Date().toISOString();
    else delete state.done[id];
    persist();
    subs.forEach(fn => fn('done', id));
  },
  exportJSON() { return JSON.stringify(state, null, 2); },
  importJSON(text) {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;
    if (!parsed || typeof parsed !== 'object' || !parsed.done) throw new Error('Fichier non reconnu');
    state = merge(DEFAULTS(), migrate(parsed));
    state.appVersion = APP_VERSION;
    persist();
    subs.forEach(fn => fn('*'));
  },
  reset() {
    state = { ...DEFAULTS(), appVersion: APP_VERSION };
    persist();
    subs.forEach(fn => fn('*'));
  },
};
