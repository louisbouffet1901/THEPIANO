// Moteur audio : piano échantillonné (Salamander Grand Piano, CC BY 3.0) et clics de métronome.
import { store } from './store.js';

const SAMPLE_MIDIS = [];
for (let m = 21; m <= 108; m += 3) SAMPLE_MIDIS.push(m);
const SAMPLE_NAMES = { 9: 'A', 0: 'C', 3: 'Ds', 6: 'Fs' };
const sampleFile = m => `piano-${SAMPLE_NAMES[m % 12]}${Math.floor(m / 12) - 1}.mp3`;

let ctx = null;
let masterGain, pianoBus, compressor, limiter, metroGain;
let claimant = null; // lecture en cours (partition, exercice, accompagnement) : une seule à la fois
const buffers = new Map();
let loadPromise = null;
const voices = []; // {midi, src, gain, filt, start, released}
const MAX_VOICES = 96;
const listeners = new Set();

function createContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: 'interactive' });
  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.knee.value = 12;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.2;
  pianoBus = ctx.createGain();
  pianoBus.gain.value = 1.3; // échantillons égalisés (≈ −5 dB au médium) : on compense, le limiteur protège
  masterGain = ctx.createGain();
  masterGain.gain.value = store.get('settings.volume') ?? 0.85;
  // limiteur final : évite la saturation (craquements) quand beaucoup de notes sonnent ensemble
  limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.12;
  metroGain = ctx.createGain();
  metroGain.gain.value = store.get('settings.metroVolume') ?? 0.7;
  pianoBus.connect(compressor).connect(masterGain).connect(limiter).connect(ctx.destination);
  metroGain.connect(ctx.destination);
  return ctx;
}

store.subscribe((path) => {
  if (!ctx) return;
  if (path === 'settings.volume' || path === '*') masterGain.gain.value = store.get('settings.volume');
  if (path === 'settings.metroVolume' || path === '*') metroGain.gain.value = store.get('settings.metroVolume');
});

export const audio = {
  get ctx() { return ctx; },
  get ready() { return buffers.size === SAMPLE_MIDIS.length; },
  get loading() { return !!loadPromise && !this.ready; },

  /** À appeler lors d'un geste utilisateur (contrainte des navigateurs mobiles). */
  unlock() {
    createContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  },

  /** Charge les échantillons (une seule fois) et s'assure que le son n'est pas suspendu. */
  async ensure() {
    this.unlock();
    if (!ctx) throw new Error('Audio non disponible sur ce navigateur');
    if (ctx.state !== 'running') {
      // Android suspend parfois le son (écran éteint, autre appli) : on le relance et on attend
      try { await Promise.race([ctx.resume(), new Promise(r => setTimeout(r, 1200))]); } catch (e) { /* */ }
      if (ctx.state !== 'running') throw new Error('le son de la tablette est suspendu : touche à nouveau le bouton');
    }
    if (this.ready) return;
    if (!loadPromise) {
      emit('loading');
      loadPromise = Promise.all(SAMPLE_MIDIS.map(async m => {
        const res = await fetch(sampleFile(m));
        if (!res.ok) throw new Error('Échantillon manquant : ' + sampleFile(m));
        const arr = await res.arrayBuffer();
        const buf = await new Promise((resolve, reject) => {
          const p = ctx.decodeAudioData(arr, resolve, reject);
          if (p && p.then) p.then(resolve, reject);
        });
        buffers.set(m, buf);
      })).then(() => emit('ready')).catch(err => { loadPromise = null; emit('error', err); throw err; });
    }
    return loadPromise;
  },

  now() { return ctx ? ctx.currentTime : 0; },

  /** Joue une note. when = temps du contexte audio (0 = maintenant). */
  noteOn(midi, velocity = 80, when = 0, opts = {}) {
    if (!ctx || !this.ready) return null;
    midi = Math.round(midi);
    if (midi < 21 || midi > 108) return null;
    const t = Math.max(when || 0, ctx.currentTime);
    let base = SAMPLE_MIDIS[0];
    for (const s of SAMPLE_MIDIS) if (Math.abs(s - midi) < Math.abs(base - midi)) base = s;
    const buf = buffers.get(base);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = Math.pow(2, (midi - base) / 12);
    const v = Math.max(1, Math.min(127, velocity)) / 127;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 900 * Math.pow(2, v * 4.1) + midi * 18;
    filt.Q.value = 0.4;
    const gain = ctx.createGain();
    const g = (0.05 + 0.95 * Math.pow(v, 1.6)) * (opts.gain ?? 1);
    gain.gain.setValueAtTime(g, t);
    src.connect(filt).connect(gain).connect(pianoBus);
    src.start(t);
    const voice = { midi, src, gain, filt, start: t, released: false, ownerId: opts.owner };
    voices.push(voice);
    src.onended = () => {
      const i = voices.indexOf(voice);
      if (i >= 0) voices.splice(i, 1);
      try { gain.disconnect(); } catch (e) { /* déjà déconnecté */ }
    };
    if (voices.length > MAX_VOICES) release(voices[0], ctx.currentTime, 0.05);
    return voice;
  },

  /** Relâche une note (toutes les voix de cette hauteur non relâchées, ou une voix précise). */
  noteOff(midiOrVoice, when = 0) {
    if (!ctx) return;
    const t = Math.max(when || 0, ctx.currentTime);
    if (midiOrVoice && typeof midiOrVoice === 'object') { release(midiOrVoice, t); return; }
    for (const v of voices) if (v.midi === midiOrVoice && !v.released) release(v, t);
  },

  /** Arrête toutes les voix d'un propriétaire (lecture d'une partition par ex.) ou toutes. */
  stopAll(owner) {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const v of [...voices]) {
      if (owner === undefined || v.ownerId === owner) {
        try { v.gain.gain.cancelScheduledValues(t); } catch (e) { /* */ }
        release(v, t, 0.04, true);
      }
    }
  },

  /** Clic de métronome. kind : 'accent' | 'beat' | 'sub' */
  click(when = 0, kind = 'beat') {
    if (!ctx) return;
    const t = Math.max(when || 0, ctx.currentTime);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const freq = kind === 'accent' ? 1760 : kind === 'sub' ? 990 : 1320;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    const peak = kind === 'sub' ? 0.35 : kind === 'accent' ? 0.9 : 0.65;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'sub' ? 0.03 : 0.05));
    osc.connect(g).connect(metroGain);
    osc.start(t);
    osc.stop(t + 0.07);
  },

  /** Convertit un temps du contexte audio en temps performance.now() (ms), latence comprise. */
  ctxToPerf(t) {
    if (!ctx) return performance.now();
    const lat = store.get('settings.latency') || 0;
    if (ctx.getOutputTimestamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.performanceTime) return ts.performanceTime + (t - ts.contextTime) * 1000 + lat;
    }
    const outLat = (ctx.outputLatency || ctx.baseLatency || 0);
    return performance.now() + (t - ctx.currentTime + outLat) * 1000 + lat;
  },
  perfToCtx(ms) {
    if (!ctx) return 0;
    return ctx.currentTime + (ms - this.ctxToPerf(ctx.currentTime)) / 1000;
  },

  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  /** Une seule source sonore à la fois : la nouvelle lecture arrête la précédente (autre partition, exercice…). */
  claim(key, stopFn) {
    if (claimant && claimant.key !== key) { const c = claimant; claimant = null; try { c.stop(); } catch (e) { /* */ } }
    claimant = { key, stop: stopFn };
  },
  release(key) { if (claimant && claimant.key === key) claimant = null; },
  /** Arrête la lecture en cours (changement de page, appli mise en arrière-plan). */
  stopCurrent() { const c = claimant; claimant = null; if (c) { try { c.stop(); } catch (e) { /* */ } } },
};

function release(v, t, time, hard) {
  if (v.released && !hard) return;
  v.released = true;
  const rel = time ?? (v.midi < 48 ? 0.45 : v.midi < 72 ? 0.28 : 0.18);
  try {
    v.gain.gain.cancelScheduledValues(t);
    v.gain.gain.setTargetAtTime(0, t, rel / 3);
    v.src.stop(t + rel * 2.5);
  } catch (e) { /* source déjà arrêtée */ }
}

function emit(type, data) { listeners.forEach(fn => fn(type, data)); }

// Débloque l'audio au premier contact (Android/Chrome l'exige).
const firstGesture = () => { audio.unlock(); window.removeEventListener('pointerdown', firstGesture, true); };
window.addEventListener('pointerdown', firstGesture, true);
