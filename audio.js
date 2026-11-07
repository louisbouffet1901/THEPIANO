// Moteur audio : piano échantillonné (Salamander Grand Piano V3, Alexander Holm, CC BY 3.0) et clics de métronome.
//
// V8.3 (« le son ») :
// - trois couches de vélocité (p, mf, f) au lieu d'une : le timbre change avec la nuance, comme sur un vrai piano
//   (p et f de do1 à la5, MIDI 36 à 93 ; mf sur tout le clavier) ; fondu entre deux couches voisines ;
// - échantillons refaits depuis les originaux 48 kHz / 24 bits : Opus 56 kbit/s (au lieu de MP3 64 kbit/s, qui
//   abîmait les attaques), accord retouché (version de Markus Fiedler : l'aigu était trop haut de 25 à 40 cents),
//   attaques calées au même instant (les petites valeurs et les trilles tombent juste), deux micros alignés puis
//   mélangés, chaque note placée dans l'espace (graves à gauche, aigus à droite, comme au clavier) ;
// - une réverbération de salle (réglable dans Réglages › Son) ; plus de compresseur sur le piano (il écrasait les
//   nuances et « pompait »), un simple limiteur en sortie ;
// - les notes déjà programmées ne sont plus coupées par la limite de polyphonie (le début d'un long extrait sautait).
// Repli : l'ancienne série (MP3, une couche) si le navigateur ne décode pas l'Opus.
import { store } from './store.js';

const SAMPLE_MIDIS = [];
for (let m = 21; m <= 108; m += 3) SAMPLE_MIDIS.push(m);
const NAMES = { 9: 'A', 0: 'C', 3: 'Ds', 6: 'Fs' };
const noteName = m => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
const opusFile = (layer, m) => `piano-${layer}-${noteName(m)}.ogg`;
const legacyFile = m => `piano-${noteName(m)}.mp3`;

// Couches : écart de niveau mesuré par rapport à mf (dB, loudness) ; p et f seulement de MIDI 36 à 93
const LAYERS = { p: { db: -4.9 }, mf: { db: 0 }, f: { db: 4.9 } };
const PF_LO = 36, PF_HI = 93;
const XF_PM = [52, 60]; // fondu p → mf (vélocités)
const XF_MF = [88, 96]; // fondu mf → f
// Nuance → niveau (dB par rapport à la couche mf jouée à 74) : de vélocité 28 (≈ −17 dB) à 118 (≈ +8 dB)
const velDb = v => 40 * Math.log10(Math.max(1, v) / 74);
const K_OPUS = 1.0;    // calage du niveau d’ensemble : à mf, à peu près la sonie (LUFS) de l’ancien moteur
const K_LEGACY = 0.92; // ancienne série : même sonie
const MAX_ACTIVE = 64; // voix qui sonnent en même temps (jeu en direct)

let ctx = null;
let masterGain, pianoBus, limiter, metroGain, wetGain, convolver;
let claimant = null; // lecture en cours (partition, exercice, accompagnement) : une seule à la fois
const buffers = new Map(); // 'mf:60' -> AudioBuffer
let mode = null;           // 'opus' | 'legacy'
let loadPromise = null;
let extraPromise = null;   // couches p et f, chargées après mf
let mfReady = false;
const voices = []; // { midi, parts: [{ src, gain }], start, released, ownerId }
const listeners = new Set();

const roomLevel = () => { const r = store.get('settings.room'); return 0.44 * (r == null ? 0.5 : r); };

function createContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: 'interactive' });
  buildGraph(ctx);
  return ctx;
}

function buildGraph(c) {
  pianoBus = c.createGain();
  pianoBus.gain.value = 1;
  masterGain = c.createGain();
  masterGain.gain.value = store.get('settings.volume') ?? 0.85;
  // limiteur de sortie : seulement les crêtes (beaucoup de notes avec la pédale), pas de compression du jeu
  limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -4;
  limiter.knee.value = 4;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.2;
  // salle : réponse impulsionnelle calculée (pas de fichier), aigus amortis plus vite que les graves
  const hp = c.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 160; hp.Q.value = 0.5;
  convolver = c.createConvolver();
  convolver.normalize = false;
  try { convolver.buffer = makeRoom(c); } catch (e) { convolver = null; }
  wetGain = c.createGain();
  wetGain.gain.value = roomLevel();
  pianoBus.connect(masterGain);
  if (convolver) pianoBus.connect(hp).connect(convolver).connect(wetGain).connect(masterGain);
  masterGain.connect(limiter).connect(c.destination);
  metroGain = c.createGain();
  metroGain.gain.value = store.get('settings.metroVolume') ?? 0.7;
  metroGain.connect(c.destination);
}

/** Réponse impulsionnelle d'une petite salle (≈ 1,8 s), stéréo décorrélée, déterministe. */
function makeRoom(c) {
  const sr = c.sampleRate, len = Math.floor(sr * 2.4), pre = Math.floor(sr * 0.014);
  const buf = c.createBuffer(2, len, sr);
  let seed = 0x2f6b9a1d;
  const rnd = () => { // mulberry32
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
  const rt = 1.8;
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let y = 0, energy = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      const k = Math.min(0.95, 0.42 + 0.26 * t); // le filtre se ferme : la queue s'assombrit
      y += (1 - k) * (rnd() - y);
      const v = y * Math.exp(-6.91 * t / rt) * Math.min(1, t / 0.008);
      d[i] = v;
      energy += v * v;
    }
    const norm = 1 / Math.sqrt(energy || 1);
    for (let i = 0; i < len; i++) d[i] *= norm;
  }
  return buf;
}

store.subscribe((path) => {
  if (!ctx) return;
  if (path === 'settings.volume' || path === '*') masterGain.gain.value = store.get('settings.volume');
  if (path === 'settings.metroVolume' || path === '*') metroGain.gain.value = store.get('settings.metroVolume');
  if ((path === 'settings.room' || path === '*') && wetGain) wetGain.gain.setTargetAtTime(roomLevel(), ctx.currentTime, 0.05);
});

async function decode(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Échantillon manquant : ' + url);
  const arr = await res.arrayBuffer();
  return new Promise((resolve, reject) => {
    const p = ctx.decodeAudioData(arr, resolve, reject);
    if (p && p.then) p.then(resolve, reject);
  });
}

async function loadSet() {
  // Opus d'abord ; si le navigateur ne le décode pas, l'ancienne série MP3
  try {
    buffers.set('mf:60', await decode(opusFile('mf', 60)));
    mode = 'opus';
  } catch (e) {
    mode = 'legacy';
  }
  if (mode === 'opus') {
    await Promise.all(SAMPLE_MIDIS.filter(m => m !== 60).map(async m => buffers.set('mf:' + m, await decode(opusFile('mf', m)))));
  } else {
    await Promise.all(SAMPLE_MIDIS.map(async m => buffers.set('mf:' + m, await decode(legacyFile(m)))));
  }
  mfReady = true;
}

function loadExtraLayers() {
  if (extraPromise || mode !== 'opus') return extraPromise;
  const list = [];
  for (const layer of ['p', 'f']) for (const m of SAMPLE_MIDIS) if (m >= PF_LO && m <= PF_HI) list.push([layer, m]);
  // une à la fois, en arrière-plan : la première écoute n'attend pas ces fichiers
  extraPromise = (async () => {
    for (const [layer, m] of list) {
      try { buffers.set(layer + ':' + m, await decode(opusFile(layer, m))); } catch (e) { /* la couche mf remplace */ }
    }
  })();
  return extraPromise;
}

export const audio = {
  get ctx() { return ctx; },
  get ready() { return mfReady; },
  get loading() { return !!loadPromise && !this.ready; },
  /** 'opus' (trois couches) ou 'legacy' (ancienne série) ; null avant le chargement. */
  get sampleSet() { return mode; },

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
      loadPromise = loadSet().then(() => { emit('ready'); loadExtraLayers(); })
        .catch(err => { loadPromise = null; mfReady = false; emit('error', err); throw err; });
    }
    return loadPromise;
  },
  /** Attend aussi les couches p et f (tests, rendu hors ligne). */
  async ensureAll() { await this.ensure(); await loadExtraLayers(); },

  now() { return ctx ? ctx.currentTime : 0; },

  /** Joue une note. when = temps du contexte audio (0 = maintenant). opts : { gain, owner } */
  noteOn(midi, velocity = 80, when = 0, opts = {}) {
    if (!ctx || !this.ready) return null;
    midi = Math.round(midi);
    if (midi < 21 || midi > 108) return null;
    const now = ctx.currentTime;
    const t = Math.max(when || 0, now);
    let base = SAMPLE_MIDIS[0];
    for (const s of SAMPLE_MIDIS) if (Math.abs(s - midi) < Math.abs(base - midi)) base = s;
    const rate = Math.pow(2, (midi - base) / 12);
    const vel = Math.max(1, Math.min(127, velocity));
    const dB = velDb(vel);
    const mix = mode === 'opus' ? layerMix(vel, base) : [['mf', 1]];
    const K = (mode === 'opus' ? K_OPUS : K_LEGACY) * (opts.gain ?? 1);
    // place dans l'espace : graves à gauche, aigus à droite (vu du pianiste)
    let out = pianoBus;
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.max(-1, Math.min(1, (midi - 66) / 42)) * 0.5;
      pan.connect(pianoBus);
      out = pan;
    }
    const parts = [];
    for (const [layer, w] of mix) {
      if (w <= 0.001) continue;
      const buf = buffers.get(layer + ':' + base) || buffers.get('mf:' + base);
      if (!buf) continue;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = rate;
      const gDb = dB - (LAYERS[layer] || LAYERS.mf).db;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setValueAtTime(K * w * Math.pow(10, gDb / 20), t);
      // plus doux que la couche : un peu moins de brillance (sans filtre au-dessus, pour ne rien ternir)
      let head = gain;
      if (gDb < -1.5 || mode === 'legacy') {
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.Q.value = 0.5;
        filt.frequency.value = mode === 'legacy'
          ? 900 * Math.pow(2, (vel / 127) * 4.1) + midi * 18
          : Math.max(2800, Math.min(18000, 18000 * Math.pow(2, gDb / 4)));
        src.connect(filt).connect(gain);
      } else src.connect(gain);
      head.connect(out);
      src.start(t);
      parts.push({ src, gain });
    }
    if (!parts.length) return null;
    const voice = { midi, parts, start: t, released: false, ownerId: opts.owner, out };
    voices.push(voice);
    let alive = parts.length;
    for (const p of parts) {
      p.src.onended = () => {
        try { p.gain.disconnect(); } catch (e) { /* déjà déconnecté */ }
        if (--alive > 0) return;
        const i = voices.indexOf(voice);
        if (i >= 0) voices.splice(i, 1);
        if (out !== pianoBus) { try { out.disconnect(); } catch (e) { /* */ } }
      };
    }
    // Polyphonie : seulement pour une note jouée maintenant (une lecture programmée a déjà ses fins de notes).
    if (t <= now + 0.05) {
      const active = voices.filter(v => !v.released && v.start <= now + 0.05);
      if (active.length > MAX_ACTIVE) release(active[0], now, 0.03);
    }
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
      if (owner === undefined || v.ownerId === owner) release(v, t, 0.04, true);
    }
  },

  /**
   * Son tenu de synthèse (V7.2) : note de référence à chanter, ou bourdon de tonique. Une voix comme celles du piano :
   * noteOff(voix) ou stopAll(propriétaire) l'arrêtent. dur = durée (s) ; sans durée, le son tient jusqu'à l'arrêt.
   */
  tone(midi, when = 0, { dur = null, gain = 0.16, owner = null } = {}) {
    if (!ctx) return null;
    const t = Math.max(when || 0, ctx.currentTime);
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.08);
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.2;
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = Math.min(5000, f * 6); filt.Q.value = 0.3;
    o1.connect(g); o2.connect(g2).connect(g);
    g.connect(filt).connect(masterGain);
    o1.start(t); o2.start(t);
    const src = { stop: w => { try { o1.stop(w); o2.stop(w); } catch (e) { /* déjà arrêté */ } } };
    const voice = { midi, parts: [{ src, gain: g }], start: t, released: false, ownerId: owner };
    voices.push(voice);
    o1.onended = () => { const i = voices.indexOf(voice); if (i >= 0) voices.splice(i, 1); try { filt.disconnect(); } catch (e) { /* */ } };
    if (dur != null) release(voice, t + dur, 0.15);
    return voice;
  },

  /** Joue un enregistrement (ta voix, V7.2) à la vitesse rate (rate = 2^(demi-tons/12)) ; s'arrête comme une note. */
  playBuffer(buffer, when = 0, { rate = 1, dur = null, gain = 1, owner = null } = {}) {
    if (!ctx || !buffer) return null;
    const t = Math.max(when || 0, ctx.currentTime);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.04);
    src.connect(g).connect(masterGain);
    src.start(t);
    const voice = { midi: -1, parts: [{ src, gain: g }], start: t, released: false, ownerId: owner };
    voices.push(voice);
    src.onended = () => { const i = voices.indexOf(voice); if (i >= 0) voices.splice(i, 1); try { g.disconnect(); } catch (e) { /* */ } };
    if (dur != null) release(voice, t + dur, 0.12);
    return voice;
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
    return osc;
  },
  /** Réveille la sortie son (un échantillon silencieux) : le premier vrai son part ensuite à l'heure. */
  prime() {
    if (!ctx) return;
    try {
      const b = ctx.createBuffer(1, 1, ctx.sampleRate);
      const s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); s.start(0);
    } catch (e) { /* */ }
  },
  /** Annule des clics planifiés (arrêt d'un exercice avant la fin). */
  cancelClicks(list) { for (const o of list || []) { try { o.stop(); } catch (e) { /* déjà joué */ } } },

  /** Convertit un temps du contexte audio en instant performance.now() (ms) où le son sort des haut-parleurs.
   *  La latence propre à chaque entrée (piano, écran…) est retirée côté jeu (latency.js). */
  ctxToPerf(t) {
    if (!ctx) return performance.now();
    if (ctx.getOutputTimestamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.performanceTime) return ts.performanceTime + (t - ts.contextTime) * 1000;
    }
    const outLat = (ctx.outputLatency || ctx.baseLatency || 0);
    return performance.now() + (t - ctx.currentTime + outLat) * 1000;
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

/** Couches à jouer pour une vélocité : [[couche, poids]], fondu à puissance constante entre deux couches voisines. */
function layerMix(vel, base) {
  const has = l => buffers.has(l + ':' + base);
  if (base < PF_LO || base > PF_HI) return [['mf', 1]];
  const fade = (a, b, [lo, hi]) => {
    const x = (vel - lo) / (hi - lo);
    if (!has(a)) return [[b, 1]];
    if (!has(b)) return [[a, 1]];
    return [[a, Math.cos(x * Math.PI / 2)], [b, Math.sin(x * Math.PI / 2)]];
  };
  if (vel <= XF_PM[0]) return [[has('p') ? 'p' : 'mf', 1]];
  if (vel < XF_PM[1]) return fade('p', 'mf', XF_PM);
  if (vel <= XF_MF[0]) return [['mf', 1]];
  if (vel < XF_MF[1]) return fade('mf', 'f', XF_MF);
  return [[has('f') ? 'f' : 'mf', 1]];
}

/** Étouffoir : la note s'éteint vite dans le grave et le médium ; tout en haut (pas d'étouffoirs), elle meurt lentement. */
function release(v, t, time, hard) {
  if (v.released && !hard) return;
  v.released = true;
  const m = v.midi;
  const tau = time != null ? time / 3 : m >= 90 ? 0.45 : m < 48 ? 0.14 : m < 72 ? 0.09 : 0.06;
  for (const p of v.parts || []) {
    try {
      p.gain.gain.cancelScheduledValues(t);
      p.gain.gain.setTargetAtTime(0, t, tau);
      p.src.stop(t + tau * 7);
    } catch (e) { /* source déjà arrêtée */ }
  }
}

function emit(type, data) { listeners.forEach(fn => fn(type, data)); }

// Débloque l'audio au premier contact (Android/Chrome l'exige).
const firstGesture = () => { audio.unlock(); window.removeEventListener('pointerdown', firstGesture, true); };
window.addEventListener('pointerdown', firstGesture, true);
