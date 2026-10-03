// Schémas et illustrations (SVG générés).
import { h, noteNameFr, isBlack, pc, esc } from './util.js';

const C = {
  text: '#1d1f24', text2: '#4c525c', text3: '#767c86', line: '#cdc8ba', soft: '#e3e0d7',
  accent: '#2b4c7e', tint: '#e9eef6', tint2: '#d6e0ef', gold: '#9a6b1f', goldTint: '#f6eedd',
  ok: '#2e7a4c', okTint: '#e5f1e9', err: '#b0291f', errTint: '#fbe8e6', warn: '#9c6200', rh: '#2b4c7e', lh: '#8c5a26', hl: '#2f66c9',
};
export const COLORS = C;

function svg(w, hgt, inner, label) {
  return `<svg viewBox="0 0 ${w} ${hgt}" role="img" aria-label="${esc(label || 'Schéma')}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 13}" fill="${o.fill || C.text}" text-anchor="${o.anchor || 'start'}" ${o.weight ? `font-weight="${o.weight}"` : ''} ${o.italic ? 'font-style="italic"' : ''} font-family="Inter, system-ui, sans-serif">${esc(s)}</text>`;
const line = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || C.text}" stroke-width="${o.w || 1.5}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;
const rect = (x, y, w, hh, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${o.r ?? 4}" fill="${o.fill || 'none'}" stroke="${o.stroke || 'none'}" stroke-width="${o.w || 1}"/>`;
const arrowDefs = (id, color) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker></defs>`;

/* ================================================================== */
/* Clavier                                                             */
/* ================================================================== */
/**
 * keyboard({from, to, marks: [{m, color, label, finger, hand}], names: 'c'|'all'|'marks'|'none', interactive, onDown, onUp})
 * Renvoie un élément SVG avec .press(m, bool) pour l'affichage en direct.
 */
export function keyboard(opts = {}) {
  const from = opts.from ?? 48, to = opts.to ?? 72;
  const WW = 24, WH = opts.height ?? 120, BW = 14, BH = Math.round(WH * 0.62);
  const whites = [];
  for (let m = from; m <= to; m++) if (!isBlack(m)) whites.push(m);
  const width = whites.length * WW;
  const xOf = {};
  whites.forEach((m, i) => { xOf[m] = i * WW; });
  for (let m = from; m <= to; m++) if (isBlack(m)) xOf[m] = (xOf[m - 1] ?? -WW) + WW - BW / 2;
  const marks = new Map((opts.marks || []).map(k => [k.m, k]));
  const names = opts.names || 'c';
  const extra = (opts.marks || []).some(k => k.finger) ? 18 : 0;
  const top = extra;
  let inner = '';
  // touches blanches
  for (const m of whites) {
    const mk = marks.get(m);
    const fill = mk ? (mk.color || C.tint2) : '#fff';
    inner += `<rect class="wk" data-m="${m}" x="${xOf[m] + 0.5}" y="${top + 0.5}" width="${WW - 1}" height="${WH}" rx="3" fill="${fill}" stroke="#a9a49a"/>`;
  }
  // touches noires
  for (let m = from; m <= to; m++) {
    if (!isBlack(m)) continue;
    const mk = marks.get(m);
    const fill = mk ? (mk.color || '#476aa3') : '#2a2a2e';
    inner += `<rect class="bk" data-m="${m}" x="${xOf[m]}" y="${top}" width="${BW}" height="${BH}" rx="2" fill="${fill}" stroke="#1b1b1d"/>`;
  }
  // étiquettes
  for (let m = from; m <= to; m++) {
    const mk = marks.get(m);
    const black = isBlack(m);
    const cx = xOf[m] + (black ? BW / 2 : WW / 2);
    let label = null;
    if (mk && mk.label != null) label = mk.label;
    else if (names === 'all' && !black) label = noteNameFr(m, { octave: false });
    else if (names === 'c' && pc(m) === 0) label = noteNameFr(m);
    else if (names === 'marks' && mk) label = noteNameFr(m, { octave: false, flats: opts.flats ?? null });
    if (label != null) {
      const y = black ? top + BH - 8 : top + WH - 9;
      inner += `<text class="lbl ${black ? 'b' : 'w'}" x="${cx}" y="${y}" font-size="${black ? 9.5 : 11}" text-anchor="middle" fill="${black ? '#fff' : '#3c414a'}" font-family="Inter, system-ui, sans-serif">${esc(label)}</text>`;
    }
    if (mk && mk.finger) {
      const col = mk.hand === 'lh' ? C.lh : C.rh;
      inner += `<text class="fing" x="${cx}" y="13" font-size="12.5" font-weight="700" text-anchor="middle" fill="${col}" font-family="Inter, system-ui, sans-serif">${esc(mk.finger)}</text>`;
    }
    if (mk && mk.dot) {
      const y = black ? top + BH - 22 : top + WH - 28;
      inner += `<circle class="dotm" cx="${cx}" cy="${y}" r="5" fill="${mk.dot}"/>`;
    }
  }
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('viewBox', `0 0 ${width} ${WH + top + 1}`);
  el.setAttribute('class', 'kbd-svg');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', opts.label || 'Clavier');
  el.innerHTML = inner;
  if (opts.maxWidth) el.style.maxWidth = opts.maxWidth + 'px';
  el.press = (m, on) => {
    const k = el.querySelector(`[data-m="${m}"]`);
    if (k) k.classList.toggle('press', !!on);
  };
  el.clearPress = () => el.querySelectorAll('.press').forEach(k => k.classList.remove('press'));
  el.setMarks = (list) => {
    el.querySelectorAll('.wk').forEach(k => k.setAttribute('fill', '#fff'));
    el.querySelectorAll('.bk').forEach(k => k.setAttribute('fill', '#2a2a2e'));
    for (const mk of list) {
      const k = el.querySelector(`[data-m="${mk.m}"]`);
      if (k) k.setAttribute('fill', mk.color || (isBlack(mk.m) ? '#476aa3' : C.tint2));
    }
  };
  if (opts.interactive) {
    const down = new Map();
    const keyAt = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      return target && target.dataset && target.dataset.m ? +target.dataset.m : null;
    };
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      const m = keyAt(e);
      if (m == null) return;
      down.set(e.pointerId, m);
      el.press(m, true);
      opts.onDown?.(m, 90);
    });
    el.addEventListener('pointermove', e => {
      if (!down.has(e.pointerId)) return;
      const m = keyAt(e);
      const prev = down.get(e.pointerId);
      if (m != null && m !== prev) {
        el.press(prev, false); opts.onUp?.(prev);
        down.set(e.pointerId, m); el.press(m, true); opts.onDown?.(m, 90);
      }
    });
    const end = e => {
      if (!down.has(e.pointerId)) return;
      const m = down.get(e.pointerId);
      down.delete(e.pointerId);
      el.press(m, false);
      opts.onUp?.(m);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
  return el;
}

/* ================================================================== */
/* Cycle des quintes (interactif)                                      */
/* ================================================================== */
const COF_MAJ = ['Do', 'Sol', 'Ré', 'La', 'Mi', 'Si', 'Fa♯ / Sol♭', 'Ré♭', 'La♭', 'Mi♭', 'Si♭', 'Fa'];
const COF_MIN = ['la', 'mi', 'si', 'fa♯', 'do♯', 'sol♯', 'ré♯ / mi♭', 'si♭', 'fa', 'do', 'sol', 'ré'];
const COF_SIG = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
const SHARPS = ['fa♯', 'do♯', 'sol♯', 'ré♯', 'la♯', 'mi♯'];
const FLATS = ['si♭', 'mi♭', 'la♭', 'ré♭', 'sol♭', 'do♭'];

export function circleOfFifths(container, opts = {}) {
  const R1 = 190, R2 = 130, R3 = 80, cx = 200, cy = 200;
  let inner = '';
  const seg = (i, r1, r2, cls) => {
    const a0 = (i - 0.5) * Math.PI / 6 - Math.PI / 2, a1 = (i + 0.5) * Math.PI / 6 - Math.PI / 2;
    const p = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    return `<path class="${cls}" data-i="${i}" d="M${p(r1, a0)} A${r1},${r1} 0 0 1 ${p(r1, a1)} L${p(r2, a1)} A${r2},${r2} 0 0 0 ${p(r2, a0)} Z"/>`;
  };
  for (let i = 0; i < 12; i++) inner += seg(i, R1, R2, 'seg-maj') + seg(i, R2, R3, 'seg-min');
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 - Math.PI / 2;
    const rm = (R1 + R2) / 2, rn = (R2 + R3) / 2;
    const maj = COF_MAJ[i].includes('/') ? COF_MAJ[i].split(' / ') : [COF_MAJ[i]];
    if (maj.length === 2) {
      inner += `<text class="t-maj" x="${cx + rm * Math.cos(a)}" y="${cy + rm * Math.sin(a) - 8}" style="font-size:12.5px">${maj[0]}</text>`;
      inner += `<text class="t-maj" x="${cx + rm * Math.cos(a)}" y="${cy + rm * Math.sin(a) + 8}" style="font-size:12.5px">${maj[1]}</text>`;
    } else inner += `<text class="t-maj" x="${cx + rm * Math.cos(a)}" y="${cy + rm * Math.sin(a)}">${maj[0]}</text>`;
    const mn = COF_MIN[i].includes('/') ? COF_MIN[i].split(' / ') : [COF_MIN[i]];
    if (mn.length === 2) {
      inner += `<text class="t-min" x="${cx + rn * Math.cos(a)}" y="${cy + rn * Math.sin(a) - 7}" style="font-size:11px">${mn[0]}</text>`;
      inner += `<text class="t-min" x="${cx + rn * Math.cos(a)}" y="${cy + rn * Math.sin(a) + 7}" style="font-size:11px">${mn[1]}</text>`;
    } else inner += `<text class="t-min" x="${cx + rn * Math.cos(a)}" y="${cy + rn * Math.sin(a)}">${mn[0]}</text>`;
  }
  inner += `<text x="${cx}" y="${cy - 10}" style="font-size:11px;fill:${C.text3}">majeur : extérieur</text>`;
  inner += `<text x="${cx}" y="${cy + 8}" style="font-size:11px;fill:${C.text3}">mineur : intérieur</text>`;
  const wrap = h('div', { class: 'cof-wrap' });
  const left = h('div', { class: 'cof', html: `<svg viewBox="0 0 400 400" role="img" aria-label="Cycle des quintes">${inner}</svg>` });
  const info = h('div', { class: 'cof-info' });
  wrap.append(left, info);
  container.append(wrap);
  const show = (i, minor) => {
    left.querySelectorAll('.sel').forEach(e => e.classList.remove('sel'));
    left.querySelector(`.${minor ? 'seg-min' : 'seg-maj'}[data-i="${i}"]`)?.classList.add('sel');
    const sig = COF_SIG[i];
    const acc = sig > 0 ? SHARPS.slice(0, sig) : sig < 0 ? FLATS.slice(0, -sig) : [];
    const maj = COF_MAJ[i].split(' / ')[0], mn = COF_MIN[i].split(' / ')[0];
    const name = minor ? `${mn} mineur` : `${maj} majeur`;
    const rel = minor ? `${maj} majeur` : `${mn} mineur`;
    const l = (i + 11) % 12, r = (i + 1) % 12;
    const vois = minor
      ? [`${COF_MIN[l].split(' / ')[0]} mineur`, `${COF_MIN[r].split(' / ')[0]} mineur`, `${COF_MAJ[i].split(' / ')[0]} majeur`, `${COF_MAJ[l].split(' / ')[0]} majeur`, `${COF_MAJ[r].split(' / ')[0]} majeur`]
      : [`${COF_MAJ[l].split(' / ')[0]} majeur`, `${COF_MAJ[r].split(' / ')[0]} majeur`, `${COF_MIN[i].split(' / ')[0]} mineur`, `${COF_MIN[l].split(' / ')[0]} mineur`, `${COF_MIN[r].split(' / ')[0]} mineur`];
    info.innerHTML = `<h4>${name.charAt(0).toUpperCase() + name.slice(1)}</h4>
      <p><b>Armure :</b> ${acc.length ? acc.length + ' ' + (sig > 0 ? 'dièse' : 'bémol') + (acc.length > 1 ? 's' : '') + ' — ' + acc.join(', ') : 'aucune altération'}</p>
      <p><b>Relatif :</b> ${rel} (même armure)</p>
      <p><b>Tons voisins :</b> ${vois.join(' · ')}</p>
      <p class="small">Un pas dans le sens des aiguilles d’une montre = une quinte au-dessus = un dièse de plus (ou un bémol de moins).</p>`;
  };
  left.addEventListener('click', e => {
    const p = e.target.closest('path');
    if (!p) return;
    show(+p.dataset.i, p.classList.contains('seg-min'));
  });
  show(opts.start ?? 8, opts.minor ?? true);
  return wrap;
}

/* ================================================================== */
/* Schémas statiques                                                   */
/* ================================================================== */
export const DIAGRAMS = {
  /** Posture vue de profil */
  posture() {
    let s = arrowDefs('arP', C.accent);
    // sol et banc
    s += line(20, 300, 660, 300, { stroke: C.line, w: 1.2 });
    s += rect(90, 214, 150, 14, { fill: '#d9d3c4', r: 3 });
    s += line(110, 228, 110, 300, { stroke: '#b9b2a0', w: 5 });
    s += line(220, 228, 220, 300, { stroke: '#b9b2a0', w: 5 });
    // piano
    s += rect(400, 190, 230, 36, { fill: '#2a2a2e', r: 4 });
    s += rect(400, 186, 120, 10, { fill: '#f4f2ec', stroke: '#a9a49a', r: 2 });
    s += line(430, 226, 430, 300, { stroke: '#2a2a2e', w: 6 });
    s += line(600, 226, 600, 300, { stroke: '#2a2a2e', w: 6 });
    // personnage (traits simples)
    s += `<circle cx="168" cy="88" r="22" fill="none" stroke="${C.text}" stroke-width="2.2"/>`;
    s += line(168, 110, 160, 210, { w: 2.6 }); // dos
    s += line(160, 210, 255, 214, { w: 2.6 }); // cuisse
    s += line(255, 214, 268, 296, { w: 2.6 }); // jambe
    s += line(268, 296, 296, 296, { w: 2.6 }); // pied
    s += line(165, 128, 205, 186, { w: 2.6 }); // bras
    s += line(205, 186, 400, 188, { w: 2.6, stroke: C.accent }); // avant-bras
    s += `<path d="M400 188 q10 -4 18 4" fill="none" stroke="${C.accent}" stroke-width="2.6" stroke-linecap="round"/>`;
    // annotations
    s += line(205, 160, 400, 160, { stroke: C.accent, w: 1.2, dash: '4 4' });
    s += t(300, 152, 'avant-bras ≈ horizontal, au niveau des touches', { size: 12.5, fill: C.accent, anchor: 'middle' });
    s += t(30, 60, 'Épaules basses,', { size: 12.5, fill: C.text2 });
    s += t(30, 76, 'dos droit mais souple', { size: 12.5, fill: C.text2 });
    s += t(250, 250, 's’asseoir sur la moitié avant du banc', { size: 12.5, fill: C.text2 });
    s += t(420, 140, 'coudes un peu en avant du buste,', { size: 12.5, fill: C.text2 });
    s += t(420, 156, 'libres de bouger', { size: 12.5, fill: C.text2 });
    s += t(300, 290, 'pieds à plat, droit devant la pédale', { size: 12.5, fill: C.text2, anchor: 'start' });
    return svg(680, 310, s, 'Posture au piano vue de profil');
  },

  /** Force sur la touche : jeu avec poids puis relâchement vs jeu crispé */
  forceCurve() {
    let s = '';
    const X0 = 60, Y0 = 210, W = 560, H = 150;
    s += line(X0, Y0, X0 + W, Y0, { stroke: C.line });
    s += line(X0, Y0, X0, Y0 - H - 10, { stroke: C.line });
    s += t(X0 + W, Y0 + 20, 'temps', { size: 12, fill: C.text3, anchor: 'end' });
    s += t(X0 - 8, Y0 - H - 14, 'force', { size: 12, fill: C.text3, anchor: 'start' });
    // crispé
    s += `<path d="M${X0} ${Y0} L${X0 + 30} ${Y0 - 135} L${X0 + W - 40} ${Y0 - 128} L${X0 + W - 20} ${Y0}" fill="none" stroke="${C.err}" stroke-width="2.2" stroke-dasharray="6 5"/>`;
    s += t(X0 + 260, Y0 - 140, 'crispé : on continue d’appuyer → fatigue, son dur', { size: 12.5, fill: C.err, anchor: 'middle' });
    // poids puis relâche
    s += `<path d="M${X0} ${Y0} L${X0 + 26} ${Y0 - 120} Q${X0 + 50} ${Y0 - 40} ${X0 + 90} ${Y0 - 28} L${X0 + W - 40} ${Y0 - 26} L${X0 + W - 20} ${Y0}" fill="none" stroke="${C.ok}" stroke-width="2.6"/>`;
    s += t(X0 + 34, Y0 - 122, 'attaque : le poids du bras', { size: 12.5, fill: C.ok });
    s += t(X0 + 300, Y0 - 38, 'maintien : juste assez pour garder la touche enfoncée', { size: 12.5, fill: C.ok, anchor: 'middle' });
    return svg(680, 240, s, 'Courbe de force sur la touche');
  },

  /** Trois manières d'enchaîner deux notes */
  legato() {
    let s = '';
    const rows = [
      { y: 40, label: 'Détaché', gap: 22, col: C.text3, note: 'un silence entre les notes' },
      { y: 110, label: 'Legato', gap: -10, col: C.ok, note: 'la note suivante arrive au moment où la précédente se lève' },
      { y: 180, label: 'Legato « sale »', gap: -90, col: C.err, note: 'les notes se superposent : le son se brouille' },
    ];
    for (const r of rows) {
      const x1 = 170, w1 = 200;
      const x2 = x1 + w1 + r.gap;
      s += t(20, r.y + 18, r.label, { weight: 650, size: 14 });
      s += rect(x1, r.y, w1, 16, { fill: C.tint2, r: 3 });
      s += rect(x2, r.y + 20, 200, 16, { fill: C.accent, r: 3 });
      s += t(x1 + 6, r.y + 12, 'note 1 (doigt 2)', { size: 11, fill: C.accent });
      s += t(x2 + 6, r.y + 32, 'note 2 (doigt 3)', { size: 11, fill: '#fff' });
      s += t(660, r.y + 22, r.note, { size: 12, fill: r.col, anchor: 'end' });
    }
    return svg(680, 230, s, 'Détaché, legato et legato brouillé');
  },

  /** Pédale syncopée : quand appuyer et relâcher */
  pedal(opts = {}) {
    const mode = opts.mode || 'sync';
    let s = '';
    const X0 = 120, U = 120;
    const chords = [0, 1, 2, 3];
    s += t(20, 50, 'Accords', { weight: 650, size: 13.5 });
    s += t(20, 125, 'Pédale', { weight: 650, size: 13.5 });
    chords.forEach((c, i) => {
      s += rect(X0 + i * U, 34, U - 8, 22, { fill: C.tint2, r: 3 });
      s += t(X0 + i * U + 8, 50, ['i', 'iv', 'V7', 'i'][i], { size: 13, fill: C.accent, weight: 650 });
      s += line(X0 + i * U, 26, X0 + i * U, 150, { stroke: C.soft, w: 1, dash: '3 4' });
    });
    const up = 130, down = 104;
    let d;
    if (mode === 'sync') {
      d = `M${X0 - 10} ${up} L${X0 + 18} ${up} L${X0 + 26} ${down}`;
      for (let i = 1; i < 4; i++) d += ` L${X0 + i * U - 2} ${down} L${X0 + i * U + 4} ${up} L${X0 + i * U + 18} ${up} L${X0 + i * U + 26} ${down}`;
      d += ` L${X0 + 4 * U - 10} ${down}`;
      s += `<path d="${d}" fill="none" stroke="${C.ok}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += t(X0 + U + 4, up + 22, 'je relève la pédale au moment où je joue l’accord…', { size: 12, fill: C.ok });
      s += t(X0 + U + 30, down - 10, '…et je la reprends juste après', { size: 12, fill: C.ok });
    } else {
      d = `M${X0 - 10} ${up}`;
      for (let i = 0; i < 4; i++) d += ` L${X0 + i * U} ${up} L${X0 + i * U + 2} ${down} L${X0 + (i + 1) * U - 14} ${down} L${X0 + (i + 1) * U - 10} ${up}`;
      s += `<path d="${d}" fill="none" stroke="${C.err}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += t(X0 + 6, up + 22, 'pédale enfoncée en même temps que l’accord : un trou entre les harmonies, ou un mélange si on relève trop tard', { size: 12, fill: C.err });
    }
    s += t(X0 - 30, down + 4, 'bas', { size: 11, fill: C.text3, anchor: 'end' });
    s += t(X0 - 30, up + 4, 'haut', { size: 11, fill: C.text3, anchor: 'end' });
    return svg(680, 170, s, 'Chronologie de la pédale');
  },

  /** Arche de phrase : départ, sommet, arrivée */
  phrase(opts = {}) {
    const labels = opts.labels || ['départ', '', '', 'sommet', '', '', 'arrivée'];
    const n = labels.length;
    const peak = opts.peak ?? Math.floor(n / 2);
    let s = '';
    const X0 = 50, W = 580, Yb = 170;
    const xs = Array.from({ length: n }, (_, i) => X0 + i * W / (n - 1));
    const amp = i => {
      const x = i <= peak ? i / peak : (n - 1 - i) / (n - 1 - peak);
      return 30 + 90 * Math.sin(x * Math.PI / 2);
    };
    let d = `M${xs[0]} ${Yb - amp(0)}`;
    for (let i = 1; i < n; i++) {
      const xm = (xs[i - 1] + xs[i]) / 2;
      d += ` Q${xm} ${Yb - (amp(i - 1) + amp(i)) / 2 - 6} ${xs[i]} ${Yb - amp(i)}`;
    }
    s += `<path d="${d}" fill="none" stroke="${C.accent}" stroke-width="2.4"/>`;
    xs.forEach((x, i) => {
      const r = 5 + amp(i) / 18;
      s += `<circle cx="${x}" cy="${Yb - amp(i)}" r="${r}" fill="${i === peak ? C.gold : C.accent}"/>`;
      if (labels[i]) s += t(x, Yb + 24, labels[i], { size: 12.5, anchor: 'middle', fill: i === peak ? C.gold : C.text2, weight: i === peak ? 650 : null });
    });
    s += line(X0 - 20, Yb, X0 + W + 20, Yb, { stroke: C.soft, w: 1 });
    s += t(X0 - 20, 24, opts.title || 'Intensité (taille des points) le long de la phrase', { size: 12, fill: C.text3 });
    return svg(680, 210, s, 'Arche de phrase');
  },

  /** Décroissance d'une note longue */
  decay() {
    let s = '';
    const X0 = 60, Y0 = 200;
    s += line(X0, Y0, 640, Y0, { stroke: C.line });
    s += line(X0, Y0, X0, 30, { stroke: C.line });
    s += t(X0 - 6, 26, 'volume', { size: 12, fill: C.text3 });
    s += `<path d="M${X0} ${Y0} L${X0 + 8} 50 C ${X0 + 80} 110, ${X0 + 200} 150, 400 160" fill="none" stroke="${C.accent}" stroke-width="2.6"/>`;
    s += t(X0 + 14, 46, 'note longue (ronde ou blanche liée)', { size: 12.5, fill: C.accent });
    s += line(400, 160, 400, Y0, { stroke: C.soft, w: 1, dash: '3 4' });
    s += `<circle cx="400" cy="160" r="5" fill="${C.ok}"/>`;
    s += `<path d="M400 160 L${408} 152 C 450 160, 520 172, 620 178" fill="none" stroke="${C.ok}" stroke-width="2.6"/>`;
    s += t(410, 140, 'la note suivante part du niveau atteint', { size: 12.5, fill: C.ok });
    s += `<path d="M400 160 L404 64 C 460 110, 540 150, 620 160" fill="none" stroke="${C.err}" stroke-width="2" stroke-dasharray="5 5"/>`;
    s += t(408, 60, 'trop forte : la ligne se casse', { size: 12.5, fill: C.err });
    return svg(680, 220, s, 'Décroissance du son d’une note longue');
  },

  /** Rubato : main gauche stable, main droite libre */
  rubato() {
    let s = '';
    const X0 = 120, U = 120;
    s += t(20, 54, 'Main droite', { weight: 650, size: 13, fill: C.rh });
    s += t(20, 124, 'Main gauche', { weight: 650, size: 13, fill: C.lh });
    for (let i = 0; i <= 4; i++) {
      s += line(X0 + i * U, 30, X0 + i * U, 140, { stroke: C.soft, w: 1, dash: '3 4' });
      if (i < 4) s += `<circle cx="${X0 + i * U}" cy="120" r="7" fill="${C.lh}"/>`;
      s += t(X0 + i * U, 160, `temps ${i + 1}`, { size: 11, fill: C.text3, anchor: 'middle' });
    }
    const rh = [0, 0.75, 1.32, 1.9, 2.25, 2.6, 3.0, 3.6];
    rh.forEach((b, i) => { s += `<circle cx="${X0 + b * U}" cy="50" r="6" fill="${C.rh}"/>`; });
    s += t(X0 + 1.7 * U, 30, 'la main droite s’attarde puis rattrape…', { size: 12, fill: C.rh, anchor: 'middle' });
    s += t(X0 + 3.1 * U, 30, '…et retombe avec la gauche', { size: 12, fill: C.rh, anchor: 'start' });
    s += t(X0 + 2 * U, 186, 'la main gauche reste le chef d’orchestre : sa pulsation ne bouge pas', { size: 12.5, fill: C.lh, anchor: 'middle' });
    return svg(680, 200, s, 'Le rubato chopinien');
  },

  /** Courbe de tempo (rubato de phrase) */
  tempoCurve() {
    let s = '';
    const X0 = 60, W = 580, Y = 110;
    s += line(X0, Y, X0 + W, Y, { stroke: C.text3, w: 1.2, dash: '5 5' });
    s += t(X0 + W, Y - 8, 'métronome', { size: 11.5, fill: C.text3, anchor: 'end' });
    s += `<path d="M${X0} ${Y} C ${X0 + 120} ${Y - 30}, ${X0 + 220} ${Y - 40}, ${X0 + 300} ${Y - 10} S ${X0 + 470} ${Y + 50}, ${X0 + W} ${Y + 20}" fill="none" stroke="${C.accent}" stroke-width="2.6"/>`;
    s += t(X0 + 150, Y - 44, 'on avance vers le sommet', { size: 12.5, fill: C.accent, anchor: 'middle' });
    s += t(X0 + 470, Y + 66, 'on retient vers la cadence', { size: 12.5, fill: C.accent, anchor: 'middle' });
    s += t(20, 30, 'plus vite ↑', { size: 11.5, fill: C.text3 });
    s += t(20, 196, 'plus lent ↓', { size: 11.5, fill: C.text3 });
    return svg(680, 205, s, 'Courbe de tempo d’une phrase');
  },

  /** Plan d'une pièce : sections proportionnelles */
  form(opts = {}) {
    const secs = opts.sections || [];
    const total = opts.total || secs.reduce((m, x) => Math.max(m, x.to), 0);
    const X0 = 10, W = 660;
    let s = '';
    const palette = { A: C.tint2, B: '#efe3cc', C: '#e3ecdf', D: '#ece3ef', coda: '#e9e6dd', intro: '#e9e6dd' };
    secs.forEach(sec => {
      const x = X0 + (sec.from - 1) / total * W;
      const w = (sec.to - sec.from + 1) / total * W;
      const fill = sec.color || palette[sec.kind] || C.tint2;
      s += rect(x + 1, 40, Math.max(2, w - 2), 46, { fill, r: 5 });
      s += t(x + w / 2, 68, sec.label, { size: w < 50 ? 11.5 : 14, weight: 700, anchor: 'middle' });
      if (w >= 36 && !opts.noBars) s += t(x + 3, 102, `m. ${sec.from}`, { size: 10.5, fill: C.text3 });
      if (sec.key) s += t(x + w / 2, 30, sec.key, { size: w < 70 ? 10 : 11.5, fill: C.text2, anchor: 'middle' });
      if (sec.note) s += t(x + w / 2, 122, sec.note, { size: w < 90 ? 10 : 11.5, fill: C.text2, anchor: 'middle', italic: true });
    });
    if (!opts.noBars) s += t(X0 + W, 102, `${total}`, { size: 10.5, fill: C.text3, anchor: 'end' });
    return svg(680, 134, s, 'Plan de la pièce');
  },

  /** Fonctions tonales */
  functions(opts = {}) {
    const k = opts.key || 'fa mineur';
    const ch = opts.chords || { T: 'i : fa – la♭ – do', SD: 'iv : si♭ – ré♭ – fa', D: 'V(7) : do – mi♮ – sol (– si♭)' };
    let s = arrowDefs('arF', C.accent);
    const boxes = [
      { x: 30, label: 'Tonique (T)', sub: 'repos, stabilité', c: ch.T },
      { x: 250, label: 'Sous-dominante (SD)', sub: 'éloignement, préparation', c: ch.SD },
      { x: 470, label: 'Dominante (D)', sub: 'tension, appel vers T', c: ch.D },
    ];
    for (const b of boxes) {
      s += rect(b.x, 40, 180, 92, { fill: '#fff', stroke: C.line, r: 8, w: 1.2 });
      s += t(b.x + 90, 66, b.label, { size: 14, weight: 700, anchor: 'middle' });
      s += t(b.x + 90, 86, b.sub, { size: 12, fill: C.text2, anchor: 'middle' });
      s += t(b.x + 90, 112, b.c, { size: 12, fill: C.accent, anchor: 'middle' });
    }
    s += `<path d="M212 86 L246 86" stroke="${C.accent}" stroke-width="2" marker-end="url(#arF)"/>`;
    s += `<path d="M432 86 L466 86" stroke="${C.accent}" stroke-width="2" marker-end="url(#arF)"/>`;
    s += `<path d="M560 136 C 520 196, 160 196, 120 138" fill="none" stroke="${C.accent}" stroke-width="2" marker-end="url(#arF)"/>`;
    s += t(340, 192, 'résolution : D → T (cadence parfaite)', { size: 12.5, fill: C.accent, anchor: 'middle' });
    s += t(340, 24, `Exemple en ${k}`, { size: 12, fill: C.text3, anchor: 'middle' });
    return svg(680, 205, s, 'Les trois fonctions tonales');
  },

  /** Découpage en sections qui se chevauchent */
  chunks(opts = {}) {
    const bars = opts.bars || 8;
    const chunks = opts.chunks || [[1, 2], [2, 3], [3, 4], [1, 4], [5, 6], [6, 7], [7, 8], [5, 8], [1, 8]];
    const X0 = 40, W = 600, bw = W / bars;
    let s = '';
    for (let i = 0; i < bars; i++) {
      s += rect(X0 + i * bw + 2, 20, bw - 4, 30, { fill: C.tint, stroke: C.tint2, r: 4 });
      s += t(X0 + i * bw + bw / 2, 40, `m. ${(opts.start || 1) + i}`, { size: 12, anchor: 'middle', fill: C.accent });
    }
    chunks.forEach((c, j) => {
      const y = 70 + j * 18;
      const x1 = X0 + (c[0] - 1) * bw + 6, x2 = X0 + c[1] * bw + (c[1] < bars ? 14 : -6);
      s += line(x1, y, x2, y, { stroke: c[1] - c[0] >= 3 ? C.gold : C.accent, w: 4 });
      if (c[1] < bars && c[1] - c[0] < 3) s += `<circle cx="${x2}" cy="${y}" r="4" fill="${C.ok}"/>`;
    });
    const y = 70 + chunks.length * 18 + 14;
    s += `<circle cx="${X0 + 6}" cy="${y - 4}" r="4" fill="${C.ok}"/>` + t(X0 + 16, y, 'pont : on s’arrête sur la 1re note de la mesure suivante', { size: 12, fill: C.text2 });
    s += line(X0 + 340, y - 4, X0 + 370, y - 4, { stroke: C.gold, w: 4 }) + t(X0 + 378, y, 'on assemble les morceaux', { size: 12, fill: C.text2 });
    return svg(680, y + 14, s, 'Découpage en sections avec ponts');
  },

  /** Rotation de l'avant-bras vue de face */
  rotation() {
    let s = arrowDefs('arR', C.accent);
    const cx = 340, cy = 120;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="150" ry="34" fill="${C.tint}" stroke="${C.accent}" stroke-width="1.6"/>`;
    s += t(cx, cy + 5, 'avant-bras (vu de face)', { size: 12.5, anchor: 'middle', fill: C.accent });
    s += line(cx, cy - 70, cx, cy + 70, { stroke: C.text3, w: 1, dash: '4 4' });
    s += t(cx + 6, cy - 74, 'axe de rotation', { size: 11.5, fill: C.text3 });
    s += `<path d="M ${cx - 120} ${cy - 50} A 140 70 0 0 1 ${cx - 20} ${cy - 66}" fill="none" stroke="${C.accent}" stroke-width="2.4" marker-end="url(#arR)"/>`;
    s += `<path d="M ${cx + 120} ${cy - 50} A 140 70 0 0 0 ${cx + 20} ${cy - 66}" fill="none" stroke="${C.accent}" stroke-width="2.4" marker-end="url(#arR)"/>`;
    s += t(cx - 190, cy + 4, 'côté pouce', { size: 13, weight: 650, anchor: 'middle' });
    s += t(cx + 190, cy + 4, 'côté 5e doigt', { size: 13, weight: 650, anchor: 'middle' });
    s += t(cx, 222, 'Le mouvement part de l’avant-bras qui pivote (comme tourner une clé) : les doigts suivent, ils ne frappent pas.', { size: 12.5, fill: C.text2, anchor: 'middle' });
    return svg(680, 236, s, 'Rotation de l’avant-bras');
  },

  /** Plans sonores : mélodie au-dessus de l'accompagnement */
  voicing() {
    let s = '';
    const X0 = 80, U = 70;
    const mel = [70, 76, 72, 82, 74, 70, 66, 62];
    const acc = [38, 34, 36, 34, 38, 34, 36, 34];
    s += line(X0 - 10, 200, X0 + U * 8, 200, { stroke: C.line });
    mel.forEach((v, i) => { s += rect(X0 + i * U + 8, 200 - v * 1.8, 22, v * 1.8, { fill: C.rh, r: 3 }); });
    acc.forEach((v, i) => { s += rect(X0 + i * U + 34, 200 - v * 1.8, 22, v * 1.8, { fill: '#c9b59a', r: 3 }); });
    s += rect(X0, 20, 12, 12, { fill: C.rh, r: 2 }) + t(X0 + 18, 30, 'mélodie (main droite, doigts 4–5)', { size: 12.5 });
    s += rect(X0 + 300, 20, 12, 12, { fill: '#c9b59a', r: 2 }) + t(X0 + 318, 30, 'accompagnement', { size: 12.5 });
    s += t(X0 - 14, 64, 'vélocité', { size: 11, fill: C.text3, anchor: 'end' });
    s += t(X0 + 4 * U, 224, 'écart visé : la mélodie nettement au-dessus, sans que l’accompagnement disparaisse', { size: 12, fill: C.text2, anchor: 'middle' });
    return svg(680, 236, s, 'Plans sonores');
  },

  /** Points de rencontre d'un groupe irrégulier */
  meeting(opts = {}) {
    const n = opts.n || 7, beats = opts.beats || 4, lhPer = opts.lhPer || 1;
    const X0 = 70, W = 560;
    let s = '';
    s += t(16, 44, 'MD', { weight: 700, fill: C.rh });
    s += t(16, 114, 'MG', { weight: 700, fill: C.lh });
    for (let i = 0; i < n; i++) {
      const x = X0 + i * W / n;
      s += `<circle cx="${x}" cy="40" r="7" fill="${C.rh}"/>`;
      s += t(x, 22, String(i + 1), { size: 11, anchor: 'middle', fill: C.text3 });
    }
    for (let j = 0; j < beats * lhPer; j++) {
      const x = X0 + j * W / (beats * lhPer);
      s += `<circle cx="${x}" cy="110" r="7" fill="${C.lh}"/>`;
    }
    s += line(X0, 50, X0, 100, { stroke: C.ok, w: 2 });
    s += line(X0 + W, 30, X0 + W, 120, { stroke: C.ok, w: 2 });
    s += `<circle cx="${X0 + W}" cy="40" r="7" fill="none" stroke="${C.rh}" stroke-width="2" stroke-dasharray="3 3"/>`;
    s += t(X0 + W + 10, 44, 'note suivante', { size: 11.5, fill: C.text3 });
    const cap = opts.caption || `On aligne seulement le départ et l’arrivée ; entre les deux, les ${n} notes se répartissent avec souplesse.`;
    // légende sur une ou deux lignes (≈ 95 caractères par ligne)
    const lines = [];
    let curL = '';
    for (const w of cap.split(' ')) { if ((curL + ' ' + w).trim().length > 95) { lines.push(curL.trim()); curL = w; } else curL += ' ' + w; }
    if (curL.trim()) lines.push(curL.trim());
    lines.forEach((ln, k) => { s += t(X0 + W / 2, 150 + k * 17, ln, { size: 12.5, fill: C.text2, anchor: 'middle' }); });
    return svg(720, 162 + (lines.length - 1) * 17, s, 'Points de rencontre');
  },

  /** Boucle de travail (écouter – jouer – évaluer – ajuster) */
  loop() {
    let s = arrowDefs('arL', C.accent);
    const cx = 340, cy = 120, r = 82;
    const steps = ['Imaginer le son voulu', 'Jouer (lentement)', 'Écouter / évaluer', 'Ajuster une seule chose'];
    steps.forEach((st, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 2;
      const x = cx + Math.cos(a) * r * 1.9, y = cy + Math.sin(a) * r * 1.1;
      s += rect(x - 92, y - 18, 184, 36, { fill: i === 0 ? C.goldTint : '#fff', stroke: C.line, r: 18, w: 1.2 });
      s += t(x, y + 5, st, { size: 13, anchor: 'middle', weight: 600 });
    });
    s += `<path d="M ${cx + 96} ${cy - 92} Q ${cx + 168} ${cy - 80} ${cx + 160} ${cy - 22}" fill="none" stroke="${C.accent}" stroke-width="2" marker-end="url(#arL)"/>`;
    s += `<path d="M ${cx + 160} ${cy + 22} Q ${cx + 168} ${cy + 80} ${cx + 96} ${cy + 92}" fill="none" stroke="${C.accent}" stroke-width="2" marker-end="url(#arL)"/>`;
    s += `<path d="M ${cx - 96} ${cy + 92} Q ${cx - 168} ${cy + 80} ${cx - 160} ${cy + 22}" fill="none" stroke="${C.accent}" stroke-width="2" marker-end="url(#arL)"/>`;
    s += `<path d="M ${cx - 160} ${cy - 22} Q ${cx - 168} ${cy - 80} ${cx - 96} ${cy - 92}" fill="none" stroke="${C.accent}" stroke-width="2" marker-end="url(#arL)"/>`;
    return svg(680, 244, s, 'La boucle de travail');
  },

  /** Main avec numéros de doigts */
  hand(opts = {}) {
    const left = opts.hand === 'lh';
    let s = '';
    const draw = (ox, mirror, label) => {
      const fingers = [
        { n: 1, x: 18, y: 120, w: 30, h: 62, rot: -38 },
        { n: 2, x: 60, y: 46, w: 26, h: 92, rot: -6 },
        { n: 3, x: 92, y: 34, w: 26, h: 102, rot: 0 },
        { n: 4, x: 124, y: 44, w: 25, h: 94, rot: 5 },
        { n: 5, x: 154, y: 72, w: 22, h: 72, rot: 12 },
      ];
      let g = '';
      g += `<rect x="52" y="128" width="128" height="96" rx="34" fill="#f3ece2" stroke="#b9a68c" stroke-width="1.5"/>`;
      for (const f of fingers) {
        g += `<g transform="rotate(${f.rot} ${f.x + f.w / 2} ${f.y + f.h})"><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h + 20}" rx="${f.w / 2}" fill="#f3ece2" stroke="#b9a68c" stroke-width="1.5"/>
          <text x="${f.x + f.w / 2}" y="${f.y + 24}" font-size="16" font-weight="700" text-anchor="middle" fill="${mirror ? C.lh : C.rh}" ${mirror ? `transform="translate(${2 * (f.x + f.w / 2)} 0) scale(-1 1)"` : ''} font-family="Inter, system-ui, sans-serif">${f.n}</text></g>`;
      }
      const tr = mirror ? `translate(${ox + 200} 0) scale(-1 1)` : `translate(${ox} 0)`;
      return `<g transform="${tr}">${g}</g>` + t(ox + 100, 248, label, { size: 13, weight: 650, anchor: 'middle', fill: mirror ? C.lh : C.rh });
    };
    s += draw(110, true, 'Main gauche');
    s += draw(370, false, 'Main droite');
    return svg(680, 262, s, 'Numérotation des doigts');
  },

  /** Tension harmonique le long d'une progression */
  tension(opts = {}) {
    const chords = opts.chords || ['i', 'iv', 'ii°', 'V7', 'VI', 'iv', 'V7', 'i'];
    const values = opts.values || [1, 2.2, 3, 4.4, 2.6, 3, 4.6, 1];
    const X0 = 60, W = 560, Y0 = 180;
    let s = line(X0 - 10, Y0, X0 + W + 10, Y0, { stroke: C.line });
    const xs = chords.map((_, i) => X0 + i * W / (chords.length - 1));
    let d = '';
    xs.forEach((x, i) => { const y = Y0 - values[i] * 28; d += (i ? ' L' : 'M') + x + ' ' + y; });
    s += `<path d="${d}" fill="none" stroke="${C.accent}" stroke-width="2.4" stroke-linejoin="round"/>`;
    const vmax = Math.max(...values);
    const imax = values.indexOf(vmax);
    xs.forEach((x, i) => {
      const y = Y0 - values[i] * 28;
      const top = i === imax;
      s += `<circle cx="${x}" cy="${y}" r="${top ? 7 : 6}" fill="${top ? C.gold : C.accent}" stroke="#fff" stroke-width="2"/>`;
      s += t(x, Y0 + 22, chords[i], { size: chords.length > 9 ? 12 : 13.5, anchor: 'middle', weight: 650 });
      if (top) s += t(x, y - 14, opts.peakLabel || 'tension maximale', { size: 11.5, anchor: 'middle', fill: C.text2 });
      else if (values[i] <= 1.2 && (i === 0 || i === chords.length - 1)) s += t(i === 0 ? x - 12 : x + 12, y + 4, 'repos', { size: 11.5, anchor: i === 0 ? 'end' : 'start', fill: C.text3 });
    });
    s += t(X0 - 10, 26, opts.title || 'Tension harmonique (schéma qualitatif)', { size: 12, fill: C.text3 });
    return svg(680, 214, s, 'Tension harmonique');
  },
};

/** Monte un schéma nommé dans un conteneur. */
export function mountDiagram(el, name, opts = {}) {
  const fn = DIAGRAMS[name];
  if (!fn) { el.textContent = 'Schéma inconnu : ' + name; return; }
  el.classList.add('diagram');
  el.innerHTML = fn(opts);
}
