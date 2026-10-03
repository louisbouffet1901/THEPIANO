// Connexion Web MIDI au piano numérique (câble USB) + clavier virtuel à l'écran.
import { store } from './store.js';
import { audio } from './audio.js';

const listeners = { noteon: new Set(), noteoff: new Set(), pedal: new Set(), status: new Set(), any: new Set() };
let access = null;
let status = 'off'; // off | waiting | ready | nodevice | denied | unsupported
let deviceName = '';
let output = null;
const active = new Map(); // note -> {velocity, time}
let pedalDown = false;

function setStatus(s, name = deviceName) {
  status = s; deviceName = name;
  listeners.status.forEach(fn => fn(status, deviceName));
}

function emit(type, ev) {
  listeners[type]?.forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });
  listeners.any.forEach(fn => { try { fn(type, ev); } catch (e) { console.error(e); } });
}

function handleMessage(e) {
  const d = e.data;
  if (!d || d.length < 2) return;
  const cmd = d[0] & 0xf0;
  const time = e.timeStamp && e.timeStamp > 0 ? e.timeStamp : performance.now();
  if (cmd === 0x90 && d[2] > 0) noteOn(d[1], d[2], time, 'midi');
  else if (cmd === 0x80 || (cmd === 0x90 && d[2] === 0)) noteOff(d[1], time, 'midi');
  else if (cmd === 0xb0 && d[1] === 64) pedal(d[2] >= 64, d[2], time, 'midi');
}

function noteOn(note, velocity, time, source) {
  active.set(note, { velocity, time });
  emit('noteon', { note, velocity, time, source });
}
function noteOff(note, time, source) {
  const a = active.get(note);
  active.delete(note);
  emit('noteoff', { note, time, source, onTime: a?.time, velocity: a?.velocity });
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
      access.onstatechange = () => bindInputs();
      bindInputs();
      return status === 'ready';
    } catch (err) {
      setStatus(err && err.name === 'NotAllowedError' ? 'denied' : 'unsupported');
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
};
