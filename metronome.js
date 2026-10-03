// Métronome précis (planification anticipée sur l'horloge audio).
import { audio } from './audio.js';

export class Metronome {
  constructor(opts = {}) {
    this.bpm = opts.bpm ?? 60;
    this.beats = opts.beats ?? 4;       // temps par mesure
    this.sub = opts.sub ?? 1;           // subdivisions par temps (1, 2, 3, 4)
    this.accent = opts.accent ?? true;
    this.mute = opts.mute ?? null;      // {play: 2, silent: 1} mesures jouées / muettes
    this.ladder = opts.ladder ?? null;  // {step: 4, bars: 4, max: 120}
    this.onTick = opts.onTick || null;  // (info) appelé à l'heure exacte du clic
    this.running = false;
    this._timer = null;
    this.listeners = new Set();
  }

  get secondsPerBeat() { return 60 / this.bpm; }

  async start(atTime) {
    await audio.ensure().catch(() => {});
    audio.unlock();
    if (this.running) this.stop();
    this.running = true;
    this.bar = 0; this.beat = 0; this.subIdx = 0;
    this.nextTime = atTime ?? (audio.now() + 0.12);
    this.startTime = this.nextTime;
    this.beatLog = [];
    this._schedule();
    this._timer = setInterval(() => this._schedule(), 25);
    this._emit('start');
  }

  stop() {
    this.running = false;
    clearInterval(this._timer);
    this._timer = null;
    this._emit('stop');
  }

  toggle() { if (this.running) this.stop(); else this.start(); }

  setBpm(bpm) { this.bpm = Math.max(20, Math.min(300, Math.round(bpm))); this._emit('bpm'); }

  _isMutedBar(bar) {
    if (!this.mute) return false;
    const cycle = this.mute.play + this.mute.silent;
    return (bar % cycle) >= this.mute.play;
  }

  _schedule() {
    if (!this.running || !audio.ctx) return;
    const horizon = audio.now() + 0.12;
    while (this.nextTime < horizon) {
      const t = this.nextTime;
      const isBeat = this.subIdx === 0;
      const isDownbeat = isBeat && this.beat === 0;
      const muted = this._isMutedBar(this.bar);
      const kind = isDownbeat && this.accent ? 'accent' : isBeat ? 'beat' : 'sub';
      if (!muted) audio.click(t, kind);
      const info = { bar: this.bar, beat: this.beat, sub: this.subIdx, time: t, perf: audio.ctxToPerf(t), muted, isBeat, isDownbeat, bpm: this.bpm };
      if (isBeat) this.beatLog.push(info);
      const delay = Math.max(0, (t - audio.now()) * 1000);
      setTimeout(() => { if (this.running) { this.onTick?.(info); this._emit('tick', info); } }, delay);
      // avance
      this.nextTime += this.secondsPerBeat / this.sub;
      this.subIdx++;
      if (this.subIdx >= this.sub) {
        this.subIdx = 0; this.beat++;
        if (this.beat >= this.beats) {
          this.beat = 0; this.bar++;
          if (this.ladder && this.bar > 0 && this.bar % this.ladder.bars === 0 && this.bpm < this.ladder.max) {
            this.setBpm(Math.min(this.ladder.max, this.bpm + this.ladder.step));
          }
        }
      }
    }
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(type, data) { this.listeners.forEach(fn => fn(type, data)); }
}

/** Métronome partagé (pastille de la barre du haut + page Métronome). */
export const sharedMetronome = new Metronome({ bpm: 60, beats: 4 });
