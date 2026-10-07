// Côté page : envoie la prise au Web Worker d'analyse (repli dans la page si les workers sont indisponibles).
let worker = null;
let seq = 0;
const pending = new Map();

async function inPage(input) {
  const m = await import('./analysis-engine.js');
  const res = m.analyzeTake(input);
  if (res.ok) res.takeSummary = m.takeSummary(res);
  return res;
}

function getWorker() {
  if (worker === false) return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./analysis-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = e => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      if (e.data.error) p.reject(new Error(e.data.error)); else p.resolve(e.data.res);
    };
    worker.onerror = () => {
      worker = false;
      for (const p of pending.values()) inPage(p.input).then(p.resolve, p.reject);
      pending.clear();
    };
  } catch (e) {
    worker = false;
    return null;
  }
  return worker;
}

/** Analyse une prise ; renvoie le résultat complet (voir engine.js). */
export function analyze(input) {
  const w = getWorker();
  if (!w) return inPage(input);
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject, input });
    w.postMessage({ id, input });
  });
}
