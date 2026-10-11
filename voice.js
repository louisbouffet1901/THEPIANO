// La voix en direct : tracé de la hauteur chantée, conseils pendant l'essai, tessiture mesurée.
// Utilisé par les exercices de chant (tool-ear.js) et par l'outil « Trouver ma voix ».
import { h, noteNameFr } from './util.js';
import { store } from './store.js';
import { pitch, octaveDiff } from './pitch.js';

const NAT = [0, 2, 4, 5, 7, 9, 11];
const pcOf = m => ((Math.round(m) % 12) + 12) % 12;

/** Tessiture de travail : celle mesurée (outil « Trouver ma voix »), sinon voix grave / aiguë. */
export function voiceRange() {
  const r = store.get('settings.voiceRange');
  if (store.get('settings.voiceMode') !== 'preset' && Array.isArray(r) && r.length === 2 && r[1] - r[0] >= 7) return [r[0], r[1]];
  return store.get('settings.voice') === 'aigue' ? [57, 74] : [45, 62];
}
export const voiceRangeLabel = () => {
  const r = store.get('settings.voiceRange');
  return Array.isArray(r) ? `${noteNameFr(r[0])} – ${noteNameFr(r[1])}` : null;
};

/* ------------------------------------------------------------------ */
/* Tracé de la voix                                                    */
/* ------------------------------------------------------------------ */
/**
 * new VoiceTrace({ height, span, tol }) ; .el à insérer ; .setTarget(midi | null) ; .setRange(lo, hi) (mode libre) ;
 * .push(ev) (événements de pitch.js) ; .start() / .stop().
 * En mode cible, l'axe est centré sur la note visée, transposée dans l'octave où tu chantes (à l'octave près).
 */
export class VoiceTrace {
  constructor({ height = 150, span = 7, tol = 0.45, win = 6000 } = {}) {
    this.height = height; this.span = span; this.tol = tol; this.win = win;
    this.cv = h('canvas', { class: 'vt-cv', role: 'img', 'aria-label': 'Ta voix en direct : la ligne montre la hauteur que tu chantes, la bande verte la note visée.' });
    this.el = h('div', { class: 'vt' }, this.cv);
    this.pts = [];
    this.target = null; this.center = null; this.range = null;
    this.raf = null;
  }
  setTarget(m) {
    this.target = m; this.center = null;
    // la nouvelle note visée se place dans l'octave où tu chantes en ce moment
    const last = [...this.pts].reverse().find(p => p.m != null && performance.now() - p.t < 2500);
    if (m != null && last) this.center = m + 12 * Math.round((last.m - m) / 12);
  }
  setRange(lo, hi) { this.range = [lo, hi]; }
  clear() { this.pts = []; }
  push(ev) {
    const now = ev.t || performance.now();
    this.pts.push({ t: now, m: ev.voiced ? ev.midi : null });
    while (this.pts.length && now - this.pts[0].t > this.win + 500) this.pts.shift();
    if (ev.voiced && this.target != null) {
      if (this.center == null) this.center = this.target + 12 * Math.round((ev.midi - this.target) / 12);
      // si tu changes d'octave et y restes, l'axe te suit
      const recent = this.pts.filter(p => p.m != null && now - p.t < 900);
      if (recent.length >= 6 && recent.every(p => Math.abs(p.m - this.center) > this.span + 0.5)) {
        const med = recent.map(p => p.m).sort((a, b) => a - b)[recent.length >> 1];
        this.center = this.target + 12 * Math.round((med - this.target) / 12);
      }
    }
  }
  start() { if (!this.raf) { const loop = () => { this.draw(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop); } }
  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; }
  draw() {
    const cv = this.cv;
    const W = cv.clientWidth || 300, H = this.height;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px'; }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const L = 44, R = 10, T = 8, B = 8;
    let lo, hi;
    const mode = this.target != null ? 'target' : 'free';
    if (mode === 'target') {
      const c = this.center ?? this.target;
      lo = c - this.span; hi = c + this.span;
    } else {
      [lo, hi] = this.range || [45, 74];
    }
    const yOf = m => T + (hi - m) / (hi - lo) * (H - T - B);
    // lignes des notes
    g.font = '10.5px Inter, system-ui, sans-serif';
    g.textBaseline = 'middle';
    const pxPerSemi = (H - T - B) / (hi - lo);
    const ctr = mode === 'target' ? (this.center ?? this.target) : null;
    let lastLabelY = -99;
    for (let m = Math.floor(hi); m >= Math.ceil(lo); m--) {
      const y = yOf(m);
      const nat = NAT.includes(pcOf(m));
      const isC = pcOf(m) === 0;
      g.strokeStyle = isC ? '#cfcabd' : nat ? '#e6e2d8' : '#f1efe9';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke();
      // étiquettes : notes naturelles, espacées d'au moins 12 px (en mode libre serré : do et sol seulement)
      const wanted = pxPerSemi * 2 >= 12 ? nat : [0, 7].includes(pcOf(m));
      const isCtr = ctr != null && Math.abs(m - ctr) < 0.01;
      if ((wanted && y - lastLabelY >= 12 && (ctr == null || Math.abs(y - yOf(ctr)) >= 11)) || isCtr) {
        if (!isCtr) {
          g.fillStyle = '#767c86';
          g.textAlign = 'right';
          g.fillText(mode === 'free' ? noteNameFr(m) : noteNameFr(m, { octave: false }), L - 6, y);
        }
        lastLabelY = y;
      }
    }
    // la note visée : bande verte ± tolérance
    if (mode === 'target') {
      const c = this.center ?? this.target;
      const y0 = yOf(c + this.tol), y1 = yOf(c - this.tol);
      g.fillStyle = 'rgba(46,122,76,0.16)';
      g.fillRect(L, y0, W - R - L, y1 - y0);
      g.strokeStyle = '#2e7a4c'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(L, yOf(c)); g.lineTo(W - R, yOf(c)); g.stroke();
      g.fillStyle = '#2e7a4c'; g.textAlign = 'right'; g.font = '600 11px Inter, system-ui, sans-serif';
      g.fillText(noteNameFr(c, { octave: false }), L - 6, yOf(c));
    }
    // le tracé
    const now = performance.now();
    const xOf = t => W - R - (now - t) / this.win * (W - R - L);
    let prev = null;
    for (const p of this.pts) {
      if (p.m == null) continue; // une trame muette isolée ne coupe pas la ligne (l'écart de temps décide)
      const x = xOf(p.t);
      if (x < L) { prev = p; continue; }
      const mm = Math.max(lo, Math.min(hi, p.m));
      const y = yOf(mm);
      let col = '#2b4c7e';
      if (mode === 'target') {
        const d = Math.abs(octaveDiff(p.m, this.target));
        col = d <= this.tol ? '#2e7a4c' : d <= 1 ? '#c99a2e' : '#2b4c7e';
      }
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3; g.lineCap = 'round';
      if (prev && prev.m != null && p.t - prev.t < 160) {
        const px = Math.max(L, xOf(prev.t)), py = yOf(Math.max(lo, Math.min(hi, prev.m)));
        g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke();
      } else { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
      prev = p;
    }
    // flèche si la voix sort du cadre
    const last = this.pts.length ? this.pts[this.pts.length - 1] : null;
    if (last && last.m != null && now - last.t < 300 && (last.m > hi || last.m < lo)) {
      const up = last.m > hi;
      g.fillStyle = '#b0291f';
      const x = W - R - 8, y = up ? T + 2 : H - B - 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + (up ? 9 : -9)); g.lineTo(x + 6, y + (up ? 9 : -9)); g.closePath(); g.fill();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Conseils en direct                                                  */
/* ------------------------------------------------------------------ */
/**
 * Message d'accompagnement d'après les 1,5 dernière seconde : rien entendu, loin, note voisine, voix instable, tout près.
 * recent : [{ t, d }] (écarts en demi-tons à l'octave près) ; listenedMs : temps depuis le début de l'écoute.
 */
export function coachLine(recent, tol, listenedMs, sinceVoicedMs) {
  if (listenedMs > 2500 && sinceVoicedMs > 2000) return { kind: 'silence', html: 'Je ne t’entends pas encore : chante un peu plus fort, sur « la » ou « mmm », la tablette à 30–50 cm de toi.' };
  if (recent.length < 5) return null;
  const ds = recent.map(r => r.d);
  const mean = ds.reduce((a, b) => a + b, 0) / ds.length;
  const sd = Math.sqrt(ds.reduce((a, b) => a + (b - mean) ** 2, 0) / ds.length);
  const dir = mean < 0 ? 'monte' : 'descends';
  const where = mean < 0 ? 'trop bas' : 'trop haut';
  const n = Math.abs(mean);
  if (sd > 0.6 && n < 2) return { kind: 'unstable', html: 'Ta voix bouge beaucoup : chante plus doucement, sur un « mmm » tenu, sans pousser. Laisse la ligne se poser.' };
  if (n <= tol) return { kind: 'ok', html: '<span class="ok">C’est la bonne note.</span> Tiens-la calmement…' };
  if (n <= 1) return { kind: 'close', html: `Tout près, un peu ${where} : ${dir} d’un cheveu, sans à-coup.` };
  if (n <= 2.5) return { kind: 'neighbour', html: `Tu chantes une note voisine (${Math.round(n) === 1 ? 'un demi-ton' : 'un ton'} ${where}) : ${dir} lentement, en glissant, jusqu’à la bande verte.` };
  return { kind: 'far', html: `Tu es loin (environ ${Math.round(n)} demi-tons ${where}). Réécoute la note, fredonne-la bouche fermée, puis glisse vers la bande verte.` };
}

/** Conseil après un essai manqué, selon l'erreur dominante. */
export function adviceFor(kind) {
  return {
    silence: 'Le micro ne t’a pas entendu. Rapproche la tablette (30–50 cm), chante un peu plus fort, sur une voyelle ouverte (« la », « ou »). Évite le bruit de fond (ventilateur, autre son).',
    far: 'Tu étais loin de la note : ce n’est pas grave, c’est le début. Rejoue-la sur ton piano et chante <b>en même temps</b> que le son, en glissant jusqu’à ce que les deux se fondent ; puis rejoue-la et chante seul.',
    neighbour: 'Tu étais sur une note voisine. Glisse lentement, comme une sirène, en regardant la ligne : arrête-toi dès qu’elle entre dans la bande verte. Les yeux aident l’oreille au début.',
    close: 'Tu étais tout près. Garde la même note et corrige d’un cheveu : pense la note « un peu plus haut » (on chante plus souvent trop bas que trop haut).',
    unstable: 'Ta voix bougeait. Chante plus doucement, bouche fermée (« mmm »), avec de l’air, comme un soupir tenu : une voix détendue est plus stable, donc plus juste.',
    ok: 'Tu as trouvé la note mais pas assez longtemps : tiens-la une demi-seconde, calmement, sans la lâcher.',
  }[kind] || 'Écoute, fredonne la note dans ta tête, puis chante doucement en regardant la ligne.';
}

/** Bilan d'une série de chant : l'erreur la plus fréquente, et ce qu'il faut faire. */
export function seriesAdvice(stats) {
  if (!stats || !stats.n) return null;
  const flat = stats.flat || 0, sharp = stats.sharp || 0;
  const lines = [];
  if (stats.silence >= 2) lines.push('Le micro t’a souvent manqué : rapproche la tablette et chante plus fort.');
  if (flat >= 2 && flat > sharp * 1.5) lines.push('Tu chantes souvent <b>trop bas</b> : c’est le cas le plus fréquent. Pense la note plus haut, souris légèrement, respire avant de chanter.');
  if (sharp >= 2 && sharp > flat * 1.5) lines.push('Tu chantes souvent <b>trop haut</b> : tu forces un peu. Chante plus doucement, plus bas dans le corps.');
  if (stats.unstable >= 2) lines.push('Ta voix bouge : fredonne bouche fermée, avec de l’air, avant d’ouvrir sur « la ».');
  if (stats.far >= 2) lines.push('Plusieurs notes étaient loin : commence par l’outil « Trouver ma voix » (sirène), puis la série « zone resserrée ».');
  return lines.length ? lines : null;
}

/* ------------------------------------------------------------------ */
/* Outil « Trouver ma voix » : sirène libre et tessiture               */
/* ------------------------------------------------------------------ */
export function mountVoiceFinder(el, cfg = {}) {
  const frame = h('div', { class: 'w-frame voicef' });
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Trouver ma voix'), h('span', { class: 'w-sub' }, 'au micro')));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  const [r0, r1] = voiceRange();
  const trace = new VoiceTrace({ height: 190, win: 8000 });
  trace.setRange(Math.min(r0, 43) - 2, Math.max(r1, 74) + 2);
  const now = h('div', { class: 'vf-now' }, '—');
  const info = h('p', { class: 'small vf-info' });
  const rangeOut = h('div', { class: 'vf-range' });
  const startBtn = h('button', { class: 'btn primary', type: 'button' }, 'Ouvrir le micro');
  const saveBtn = h('button', { class: 'btn', type: 'button', disabled: true }, 'Garder cette tessiture');
  const resetBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Recommencer');
  const msg = h('p', { class: 'small' });
  body.append(
    h('ol', { class: 'small vf-steps' },
      h('li', {}, h('b', {}, 'Sirène'), ' : glisse ta voix du grave à l’aigu et retour, bouche fermée (« mmm »), sans forcer. La ligne te montre où tu es.'),
      h('li', {}, h('b', {}, 'Le grave'), ' : descends jusqu’à ta note la plus grave confortable, et tiens-la une seconde.'),
      h('li', {}, h('b', {}, 'L’aigu'), ' : monte jusqu’à ta note la plus aiguë confortable (sans crier), et tiens-la une seconde.')),
    trace.el, h('div', { class: 'vf-row' }, now, rangeOut), info, h('div', { class: 'btn-row' }, startBtn, saveBtn, resetBtn), msg);
  requestAnimationFrame(() => trace.draw()); // la grille des notes dès l'ouverture
  const saved = voiceRangeLabel();
  info.innerHTML = saved ? `Tessiture enregistrée : <b>${saved}</b>. Les exercices de chant choisissent leurs notes au milieu de cette zone.` : 'Les notes tenues une seconde sont retenues : la plus grave et la plus aiguë donnent ta tessiture.';
  let off = null, hist = [], held = null, lo = null, hi = null, on = false, lastVoiced = 0;
  const showRange = () => {
    rangeOut.innerHTML = lo != null ? `Tenu : de <b>${noteNameFr(lo)}</b> à <b>${noteNameFr(hi)}</b>` : '';
    saveBtn.disabled = !(lo != null && hi - lo >= 7);
  };
  const listen = ev => {
    trace.push(ev);
    // une courte coupure (respiration, détection manquée) n'interrompt pas la note tenue
    if (!ev.voiced) { if (ev.t - lastVoiced > 250) { now.textContent = '—'; held = null; hist = []; } return; }
    lastVoiced = ev.t;
    hist.push(ev.midi); if (hist.length > 4) hist.shift();
    const m = hist.slice().sort((a, b) => a - b)[hist.length >> 1];
    const r = Math.round(m);
    const cents = Math.round((m - r) * 100);
    now.innerHTML = `<b>${noteNameFr(r)}</b> <span class="small">${cents > 0 ? '+' : ''}${cents} c</span>`;
    // une note est « tenue » si elle reste à ±40 cents pendant 900 ms
    if (held && Math.abs(m - held.m) <= 0.4) {
      if (!held.done && ev.t - held.t >= 900) {
        held.done = true;
        if (lo == null || r < lo) lo = r;
        if (hi == null || r > hi) hi = r;
        showRange();
      }
    } else held = { m, t: ev.t, done: false };
  };
  startBtn.addEventListener('click', async () => {
    if (on) { stop(); return; }
    msg.textContent = 'Autorise l’accès au micro…';
    const ok = await pitch.start();
    if (!ok) { msg.textContent = pitch.state === 'denied' ? 'Accès au micro refusé : réautorise-le dans les réglages du site.' : 'Micro indisponible sur cet appareil.'; return; }
    msg.textContent = '';
    on = true; startBtn.textContent = 'Fermer le micro';
    off = pitch.on(listen);
    trace.start();
  });
  const stop = () => { off?.(); off = null; trace.stop(); if (on) pitch.stop(); on = false; startBtn.textContent = 'Ouvrir le micro'; };
  resetBtn.addEventListener('click', () => { lo = hi = null; trace.clear(); showRange(); });
  saveBtn.addEventListener('click', () => {
    if (lo == null) return;
    // zone de travail : un peu à l'intérieur des extrêmes tenus
    const a = lo + 1, b = Math.max(lo + 8, hi - 1);
    store.set('settings.voiceRange', [a, b]);
    store.set('settings.voiceMode', 'measured');
    store.set('settings.voice', (a + b) / 2 < 57 ? 'grave' : 'aigue');
    info.innerHTML = `Tessiture enregistrée : <b>${noteNameFr(a)} – ${noteNameFr(b)}</b>. Les exercices de chant choisiront leurs notes au milieu de cette zone.`;
  });
  return stop;
}
