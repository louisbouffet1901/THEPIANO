// Sauvegarde locale de la progression et des réglages (localStorage, avec repli en mémoire).
// Les prises jouées et les résultats d'analyse, plus volumineux, sont dans IndexedDB (db.js).

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
  mastery: {},         // « En cours de maîtrise » : boîte et date de chaque carte, nouvelles cartes du jour
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

let mem = null;
let state = load();
const subs = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = migrate(JSON.parse(raw));
      return merge(DEFAULTS(), parsed);
    }
  } catch (e) { /* stockage indisponible */ }
  if (mem) return mem;
  return DEFAULTS();
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
    persist();
    subs.forEach(fn => fn('*'));
  },
  reset() {
    state = DEFAULTS();
    persist();
    subs.forEach(fn => fn('*'));
  },
};
