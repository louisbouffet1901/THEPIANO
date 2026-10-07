// Web Worker : l'analyse d'une prise tourne en arrière-plan, sans figer l'écran.
import { analyzeTake, takeSummary } from './analysis-engine.js';

self.onmessage = e => {
  const { id, input } = e.data || {};
  try {
    const res = analyzeTake(input);
    if (res.ok) res.takeSummary = takeSummary(res);
    self.postMessage({ id, res });
  } catch (err) {
    self.postMessage({ id, error: String((err && err.message) || err) });
  }
};
