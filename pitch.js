// Détection de la hauteur chantée au micro (algorithme YIN), pour les exercices de chant.
// La comparaison avec la note visée se fait à l'octave près : on peut chanter une octave plus bas que le piano.
import { audio } from './audio.js';
import { noteNameFr } from './util.js';

let stream = null, source = null, analyser = null, buf = null, timer = null;
let state = 'off'; // off | asking | on | denied | unsupported | error
const subs = new Set();
const stateSubs = new Set();
let users = 0;

const GATE = 0.008;     // niveau RMS minimal (silence en dessous)
const FMIN = 60, FMAX = 1100;

function setState(s) { state = s; stateSubs.forEach(fn => { try { fn(s); } catch (e) { /* */ } }); }

/** YIN : renvoie { freq, conf } (conf entre 0 et 1). */
export function yin(x, sr, thr = 0.15) {
  const tauMin = Math.max(2, Math.floor(sr / FMAX));
  const tauMax = Math.min(Math.floor(sr / FMIN), (x.length >> 1) - 1);
  const W = x.length - tauMax - 1;
  const d = new Float32Array(tauMax + 2);
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let s = 0;
    for (let j = 0; j < W; j++) { const df = x[j] - x[j + tau]; s += df * df; }
    d[tau] = s;
  }
  const dp = new Float32Array(tauMax + 2);
  dp[0] = 1;
  let run = 0;
  for (let tau = 1; tau <= tauMax + 1; tau++) { run += d[tau]; dp[tau] = run > 0 ? d[tau] * tau / run : 1; }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (dp[t] < thr) { while (t + 1 <= tauMax && dp[t + 1] < dp[t]) t++; tau = t; break; }
  }
  if (tau < 0) {
    let best = tauMin;
    for (let t = tauMin; t <= tauMax; t++) if (dp[t] < dp[best]) best = t;
    tau = best;
  }
  const conf = Math.max(0, 1 - dp[tau]);
  let better = tau;
  if (tau > 1 && tau <= tauMax) {
    const a = dp[tau - 1], b = dp[tau], c = dp[tau + 1];
    const den = a - 2 * b + c;
    if (Math.abs(den) > 1e-9) better = tau + (a - c) / (2 * den);
  }
  return { freq: sr / better, conf };
}

export const freqToMidi = f => 69 + 12 * Math.log2(f / 440);

/** Écart en demi-tons entre une hauteur chantée et une note visée, ramené dans ]-6, 6] (équivalence d'octave). */
export function octaveDiff(sungMidi, targetMidi) {
  let d = (sungMidi - targetMidi) % 12;
  if (d > 6) d -= 12;
  if (d <= -6) d += 12;
  return d;
}

function tick() {
  if (!analyser) return;
  analyser.getFloatTimeDomainData(buf);
  let s = 0;
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
  const rms = Math.sqrt(s / buf.length);
  let ev;
  if (rms < GATE) ev = { rms, voiced: false, t: performance.now() };
  else {
    const { freq, conf } = yin(buf, audio.ctx.sampleRate);
    const voiced = conf > 0.8 && freq >= FMIN && freq <= FMAX;
    ev = { rms, voiced, freq, conf, midi: voiced ? freqToMidi(freq) : null, t: performance.now() };
  }
  subs.forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });
}

export const pitch = {
  get state() { return state; },
  get supported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !!(window.AudioContext || window.webkitAudioContext); },

  /** Ouvre le micro (demande l'autorisation la première fois). Renvoie true si l'écoute a démarré. */
  async start() {
    users++;
    if (state === 'on') return true;
    if (!this.supported) { setState('unsupported'); return false; }
    setState('asking');
    try {
      audio.unlock();
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
      const ctx = audio.ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      source = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      buf = new Float32Array(analyser.fftSize);
      source.connect(analyser);
      timer = setInterval(tick, 40);
      setState('on');
      return true;
    } catch (err) {
      users = Math.max(0, users - 1);
      setState(err && (err.name === 'NotAllowedError' || err.name === 'SecurityError') ? 'denied' : 'error');
      return false;
    }
  },

  /** Ferme le micro quand plus aucun exercice ne l'utilise (force = fermeture immédiate). */
  stop(force = false) {
    users = force ? 0 : Math.max(0, users - 1);
    if (users > 0) return;
    clearInterval(timer); timer = null;
    try { source?.disconnect(); } catch (e) { /* */ }
    stream?.getTracks().forEach(t => t.stop());
    stream = source = analyser = null;
    if (state === 'on') setState('off');
  },

  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  onState(fn) { stateSubs.add(fn); return () => stateSubs.delete(fn); },
};

/** Nom français arrondi d'une hauteur chantée. */
export const sungName = m => noteNameFr(Math.round(m));

// Accès de test : window.__pitch.feed(midi) simule une hauteur chantée stable (tests automatiques).
window.__pitch = {
  feed(midi, rms = 0.1) {
    const ev = midi == null ? { rms: 0, voiced: false, t: performance.now() } : { rms, voiced: true, freq: 440 * 2 ** ((midi - 69) / 12), conf: 0.95, midi, t: performance.now() };
    subs.forEach(fn => fn(ev));
  },
};
