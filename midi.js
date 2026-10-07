// Connexion Web MIDI au piano numérique (Bluetooth MIDI ou interface MIDI) + clavier virtuel à l'écran.
// Robustesse : relâchements perdus réparés, notes bloquées relâchées, déconnexions détectées, journal.
import { store } from './store.js';
import { audio } from './audio.js';

const listeners = { noteon: new Set(), noteoff: new Set(), pedal: new Set(), status: new Set(), any: new Set(), link: new Set() };
let access = null;
let status = 'off'; // off | waiting | ready | nodevice | denied | unsupported
let deviceName = '';
let output = null;
const active = new Map(); // note -> {velocity, time}
let pedalDown = false;

/* Journal et compteurs (Réglages → Connexion) */
const LOG_MAX = 300;
const log = [];
const counters = { notes: 0, repairedOffs: 0, stuckReleased: 0, disconnects: 0, sensingLost: 0 };
function journal(kind, text) {
  log.push({ t: Date.now(), kind, text });
  if (log.length > LOG_MAX) log.shift();
}

/* Sans aucune activité pendant ce délai, une note encore « enfoncée » est considérée bloquée (relâchement perdu). */
const STUCK_MS = 12000;
let lastActivity = 0;
let watchdog = null;
/* Active Sensing (0xFE) : beaucoup de pianos l'envoient toutes les 300 ms ; s'il s'arrête, la liaison est coupée. */
let lastSensing = 0;
let sensingSeen = false;

function setStatus(s, name = deviceName) {
  const prev = status;
  status = s; deviceName = name;
  listeners.status.forEach(fn => fn(status, deviceName));
  if (prev === 'ready' && s !== 'ready') { journal('link', 'Piano déconnecté'); counters.disconnects++; sensingSeen = false; releaseAll('déconnexion'); listeners.link.forEach(fn => fn('lost')); }
  if (prev !== 'ready' && s === 'ready' && prev !== 'off' && prev !== 'waiting') { journal('link', 'Piano reconnecté : ' + name); listeners.link.forEach(fn => fn('back')); }
  if (s === 'ready') startWatchdog(); else stopWatchdog();
}

/** Relâche toutes les notes encore enfoncées et la pédale (événements marqués « synthetic »). */
function releaseAll(reason) {
  const now = performance.now();
  for (const note of [...active.keys()]) noteOff(note, now, 'repair', true);
  if (pedalDown) pedal(false, 0, now, 'repair');
  if (reason) journal('repair', `Notes relâchées (${reason})`);
}

function startWatchdog() {
  if (watchdog) return;
  watchdog = setInterval(() => {
    const now = performance.now();
    if (active.size && now - lastActivity > STUCK_MS) {
      counters.stuckReleased += active.size;
      releaseAll(`${active.size} note(s) bloquée(s)`);
    }
    if (sensingSeen && now - lastSensing > 1200) {
      sensingSeen = false;
      counters.sensingLost++;
      journal('link', 'Signal du piano interrompu (Active Sensing)');
      releaseAll('signal interrompu');
      listeners.link.forEach(fn => fn('silent'));
    }
  }, 1000);
}
function stopWatchdog() { clearInterval(watchdog); watchdog = null; }

function emit(type, ev) {
  listeners[type]?.forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });
  listeners.any.forEach(fn => { try { fn(type, ev); } catch (e) { console.error(e); } });
}

function handleMessage(e) {
  const d = e.data;
  if (!d || !d.length) return;
  const time = e.timeStamp && e.timeStamp > 0 ? e.timeStamp : performance.now();
  if (d[0] === 0xfe) { // Active Sensing
    if (!sensingSeen) journal('link', 'Signal de présence du piano reçu (Active Sensing)');
    sensingSeen = true; lastSensing = time; return;
  }
  if (d.length < 2) return;
  lastActivity = time;
  if (sensingSeen) lastSensing = time;
  const cmd = d[0] & 0xf0;
  if (cmd === 0x90 && d[2] > 0) noteOn(d[1], d[2], time, 'midi');
  else if (cmd === 0x80 || (cmd === 0x90 && d[2] === 0)) noteOff(d[1], time, 'midi');
  else if (cmd === 0xb0 && d[1] === 64) pedal(d[2] >= 64, d[2], time, 'midi');
}

function noteOn(note, velocity, time, source) {
  if (active.has(note)) {
    // relâchement perdu : on le répare avant la nouvelle attaque
    counters.repairedOffs++;
    journal('repair', `Relâchement manquant réparé (note ${note})`);
    noteOff(note, time, 'repair', true);
  }
  if (source === 'midi') counters.notes++;
  active.set(note, { velocity, time });
  emit('noteon', { note, velocity, time, source });
}
function noteOff(note, time, source, synthetic = false) {
  const a = active.get(note);
  if (!a && !synthetic && source === 'midi') return; // relâchement sans attaque (attaque perdue) : ignoré
  active.delete(note);
  emit('noteoff', { note, time, source, onTime: a?.time, velocity: a?.velocity, synthetic });
}
function pedal(down, value, time, source) {
  if (down === pedalDown) return;
  pedalDown = down;
  emit('pedal', { down, value, time, source });
}

function bindInputs() {
  if (!access) return;
  const wanted = store.get('settings.midiInput') || 'auto';
  let names = [];
  access.inputs.forEach(input => {
    const use = wanted === 'auto' || wanted === input.id || wanted === input.name;
    input.onmidimessage = use ? handleMessage : null;
    if (use) names.push(input.name || 'Piano MIDI');
  });
  output = null;
  const wantedOut = store.get('settings.midiOutput');
  access.outputs.forEach(o => {
    if (!output && (!wantedOut || wantedOut === o.id || wantedOut === o.name)) output = o;
  });
  if (names.length) setStatus('ready', names.join(', '));
  else setStatus('nodevice', '');
}

export const midi = {
  lastError: '',
  get supported() { return typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess; },
  get status() { return status; },
  get deviceName() { return deviceName; },
  get active() { return active; },
  get pedalDown() { return pedalDown; },
  get hasOutput() { return !!output; },
  get inputs() { const a = []; access?.inputs.forEach(i => a.push({ id: i.id, name: i.name })); return a; },
  get outputs() { const a = []; access?.outputs.forEach(o => a.push({ id: o.id, name: o.name })); return a; },

  async init() {
    if (!this.supported) { setStatus('unsupported'); return false; }
    if (access) { bindInputs(); return status === 'ready'; }
    setStatus('waiting');
    try {
      access = await navigator.requestMIDIAccess({ sysex: false });
      access.onstatechange = (e) => {
        const p = e && e.port;
        if (p) journal('port', `${p.type === 'input' ? 'Entrée' : 'Sortie'} « ${p.name || '?'} » : ${p.state === 'connected' ? 'connectée' : 'déconnectée'}`);
        bindInputs();
      };
      journal('link', 'Accès MIDI accordé');
      bindInputs();
      return status === 'ready';
    } catch (err) {
      // Chrome renvoie SecurityError (ou NotAllowedError) quand l'autorisation MIDI est refusée.
      this.lastError = err ? `${err.name}${err.message ? ' : ' + err.message : ''}` : 'inconnue';
      setStatus(err && ['NotAllowedError', 'SecurityError'].includes(err.name) ? 'denied' : 'unsupported');
      return false;
    }
  },

  /** Si l'autorisation a déjà été donnée, se connecte sans rien demander. */
  async autoInit() {
    if (!this.supported) { setStatus('unsupported'); return; }
    try {
      const p = await navigator.permissions?.query({ name: 'midi' });
      if (p && p.state === 'granted') await this.init();
    } catch (e) { /* API permissions absente : on attend un clic */ }
  },

  rebind() { bindInputs(); },

  /** Journal de connexion et compteurs (diagnostic). */
  get log() { return log.slice(); },
  get counters() { return { ...counters }; },
  get sensing() { return sensingSeen; },
  /** Relâche tout (bouton « Débloquer » du diagnostic). */
  releaseAll() { releaseAll('demande manuelle'); },

  on(type, fn) { listeners[type].add(fn); return () => listeners[type].delete(fn); },

  /** Clavier virtuel ou tests : simule une note jouée. */
  virtualOn(note, velocity = 80) {
    if (store.get('settings.echoVirtual') !== false) { audio.ensure().then(() => audio.noteOn(note, velocity)); }
    noteOn(note, velocity, performance.now(), 'virtual');
  },
  virtualOff(note) {
    if (store.get('settings.echoVirtual') !== false) audio.noteOff(note);
    noteOff(note, performance.now(), 'virtual');
  },
  virtualPedal(down) { pedal(down, down ? 127 : 0, performance.now(), 'virtual'); },

  /** Envoi vers le piano (démos jouées par le son du piano). timeMs = performance.now() */
  send(data, timeMs) { try { output?.send(data, timeMs); } catch (e) { /* */ } },
  outNoteOn(note, vel, timeMs) { this.send([0x90, note, Math.max(1, Math.min(127, Math.round(vel)))], timeMs); },
  outNoteOff(note, timeMs) { this.send([0x80, note, 0], timeMs); },
  outPedal(down, timeMs) { this.send([0xb0, 64, down ? 127 : 0], timeMs); },
  panic() {
    if (!output) return;
    try { output.clear?.(); } catch (e) { /* */ }
    for (let n = 21; n <= 108; n++) this.send([0x80, n, 0]);
    this.send([0xb0, 64, 0]);
    this.send([0xb0, 123, 0]);
  },
};

// Accès de test (automatisation) : window.__midi.inject('on', 60, 90)
window.__midi = {
  inject(type, note, vel = 80, time = performance.now()) {
    if (type === 'on') noteOn(note, vel, time, 'test');
    else if (type === 'off') noteOff(note, time, 'test');
    else if (type === 'pedal') pedal(!!note, note ? 127 : 0, time, 'test');
  },
  /** Simule un message brut du piano (tableau d'octets), comme s'il arrivait par MIDI. */
  raw(bytes, time = performance.now()) { handleMessage({ data: Uint8Array.from(bytes), timeStamp: time }); },
  status: s => setStatus(s, s === 'ready' ? 'Piano de test' : ''),
};
