// Base locale IndexedDB : prises jouées (MIDI), résultats d'analyse, partitions importées.
// Asynchrone, elle ne bloque pas l'écran ; repli en mémoire si IndexedDB est indisponible.

const NAME = 'parcours-piano';
const VERSION = 1;
const STORES = {
  takes: { keyPath: 'id', autoIncrement: true, indexes: [['passage', 'passage'], ['at', 'at']] },
  scores: { keyPath: 'id' },
  kv: { keyPath: 'key' },
};
/** Prises gardées par passage (les prises « semaine » sont toujours gardées). */
const KEEP_PER_PASSAGE = 30;

let dbp = null;
const mem = { takes: new Map(), scores: new Map(), kv: new Map(), seq: 1 };
let useMem = false;

function open() {
  if (useMem) return Promise.resolve(null);
  if (dbp) return dbp;
  dbp = new Promise(resolve => {
    let req;
    try { req = indexedDB.open(NAME, VERSION); }
    catch (e) { useMem = true; resolve(null); return; }
    req.onupgradeneeded = () => {
      const d = req.result;
      for (const [name, o] of Object.entries(STORES)) {
        if (d.objectStoreNames.contains(name)) continue;
        const st = d.createObjectStore(name, { keyPath: o.keyPath, autoIncrement: !!o.autoIncrement });
        for (const [iname, path] of o.indexes || []) st.createIndex(iname, path);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { useMem = true; resolve(null); };
    req.onblocked = () => { /* une autre page garde l'ancienne version ouverte */ };
  });
  return dbp;
}

const done = req => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });

async function tx(store, mode, fn) {
  const d = await open();
  if (!d) return fn(null);
  const t = d.transaction(store, mode);
  const finished = new Promise((resolve, reject) => { t.oncomplete = resolve; t.onerror = () => reject(t.error); t.onabort = () => reject(t.error); });
  const res = await fn(t.objectStore(store));
  await finished;
  return res;
}

export const db = {
  async put(store, value) {
    return tx(store, 'readwrite', async st => {
      if (!st) {
        const o = STORES[store];
        if (o.autoIncrement && value[o.keyPath] == null) value = { ...value, [o.keyPath]: mem.seq++ };
        mem[store].set(value[o.keyPath], value);
        return value[o.keyPath];
      }
      return done(st.put(value));
    });
  },
  async get(store, key) {
    return tx(store, 'readonly', st => (st ? done(st.get(key)) : mem[store].get(key)));
  },
  async del(store, key) {
    return tx(store, 'readwrite', st => (st ? done(st.delete(key)) : mem[store].delete(key)));
  },
  async all(store, index = null, value = undefined) {
    return tx(store, 'readonly', st => {
      if (!st) {
        const list = [...mem[store].values()];
        return index ? list.filter(x => x[index] === value) : list;
      }
      const src = index ? st.index(index) : st;
      return done(index && value !== undefined ? src.getAll(IDBKeyRange.only(value)) : src.getAll());
    });
  },
  async clear(store) {
    return tx(store, 'readwrite', st => (st ? done(st.clear()) : mem[store].clear()));
  },

  /* ---------- Prises ---------- */
  /** Enregistre une prise et supprime les plus anciennes du même passage (sauf les prises « semaine »). */
  async addTake(take) {
    const id = await this.put('takes', { ...take, at: take.at || Date.now() });
    const list = (await this.all('takes', 'passage', take.passage)).sort((a, b) => b.at - a.at);
    const extra = list.filter(t => !t.week).slice(KEEP_PER_PASSAGE);
    for (const t of extra) await this.del('takes', t.id);
    return id;
  },
  /** Prises d'un passage, de la plus récente à la plus ancienne. */
  async takesOf(passage) {
    return (await this.all('takes', 'passage', passage)).sort((a, b) => b.at - a.at);
  },

  /* ---------- Clé / valeur ---------- */
  async getKV(key, dflt = null) { const r = await this.get('kv', key); return r ? r.value : dflt; },
  async setKV(key, value) { return this.put('kv', { key, value }); },

  /* ---------- Sauvegarde ---------- */
  async exportAll() {
    const out = {};
    for (const s of Object.keys(STORES)) out[s] = await this.all(s);
    return out;
  },
  async importAll(data) {
    if (!data || typeof data !== 'object') return;
    for (const s of Object.keys(STORES)) {
      if (!Array.isArray(data[s])) continue;
      await this.clear(s);
      for (const v of data[s]) await this.put(s, v);
    }
  },
};
