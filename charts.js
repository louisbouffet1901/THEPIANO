// Petits graphiques SVG (traits fins, grille discrète, info-bulle au toucher).
import { h, esc, fmtNum } from './util.js';

export const SERIES = { rh: '#3b6bb5', lh: '#c27a2c', one: '#3b6bb5' };
export const STATUS = { ok: '#2e7a4c', warn: '#9c6200', bad: '#b0291f' };
const GRID = '#e8e5dd', AXIS = '#cdc8ba', TEXT3 = '#767c86', SURFACE = '#ffffff';

function frame(width, height, inner, label) {
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">${inner}</svg>`;
}

function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= count + 0.5) || mag * 10;
  const start = Math.floor(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 0.01; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
}

/** Ajoute une info-bulle : les éléments [data-tip] l'affichent au survol / toucher. */
function withTooltip(host) {
  const tip = h('div', { style: { position: 'absolute', pointerEvents: 'none', background: '#23262c', color: '#fff', fontSize: '12.5px', padding: '5px 8px', borderRadius: '6px', whiteSpace: 'nowrap', transform: 'translate(-50%, -120%)', display: 'none', zIndex: 5 } });
  host.style.position = 'relative';
  host.append(tip);
  const show = e => {
    const t = e.target.closest('[data-tip]');
    if (!t) { tip.style.display = 'none'; return; }
    const r = host.getBoundingClientRect();
    tip.textContent = t.dataset.tip;
    tip.style.left = (e.clientX - r.left) + 'px';
    tip.style.top = (e.clientY - r.top) + 'px';
    tip.style.display = 'block';
  };
  host.addEventListener('pointermove', show);
  host.addEventListener('pointerdown', show);
  host.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
}

/**
 * Barres autour d'un zéro (écarts), avec bande de tolérance.
 * values: nombres ; labels: textes info-bulle ; band: [bas, haut]
 */
export function deviationBars({ values, tips = [], band = null, unit = '', height = 190, title = '', yLabel = '' }) {
  const W = 680, H = height, L = 46, R = 12, T = 16, B = 26;
  const vmax = Math.max(Math.abs(Math.min(0, ...values, band ? band[0] : 0)), Math.abs(Math.max(0, ...values, band ? band[1] : 0)), 1) * 1.1;
  const y = v => T + (H - T - B) * (1 - (v + vmax) / (2 * vmax));
  const n = values.length;
  const slot = (W - L - R) / Math.max(1, n);
  const bw = Math.min(24, Math.max(3, slot - 2));
  let s = '';
  for (const tv of niceTicks(-vmax, vmax, 4)) {
    if (tv < -vmax || tv > vmax) continue;
    s += `<line x1="${L}" x2="${W - R}" y1="${y(tv)}" y2="${y(tv)}" stroke="${tv === 0 ? AXIS : GRID}" stroke-width="1"/>`;
    s += `<text x="${L - 6}" y="${y(tv) + 4}" font-size="11" fill="${TEXT3}" text-anchor="end">${fmtNum(tv, Math.abs(tv) < 10 && tv % 1 ? 1 : 0)}</text>`;
  }
  if (band) {
    s += `<rect x="${L}" y="${y(band[1])}" width="${W - L - R}" height="${Math.max(1, y(band[0]) - y(band[1]))}" fill="${STATUS.ok}" opacity="0.08"/>`;
  }
  values.forEach((v, i) => {
    const x = L + i * slot + (slot - bw) / 2;
    const y0 = y(0), y1 = y(v);
    const inBand = !band || (v >= band[0] && v <= band[1]);
    const col = inBand ? SERIES.one : STATUS.warn;
    const top = Math.min(y0, y1), hh = Math.max(1, Math.abs(y1 - y0));
    const r = Math.min(4, hh / 2, bw / 2);
    // extrémité arrondie côté donnée, carrée à la ligne de base
    const path = v >= 0
      ? `M${x} ${y0} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + bw - r} Q${x + bw} ${top} ${x + bw} ${top + r} V${y0} Z`
      : `M${x} ${y0} V${top + hh - r} Q${x} ${top + hh} ${x + r} ${top + hh} H${x + bw - r} Q${x + bw} ${top + hh} ${x + bw} ${top + hh - r} V${y0} Z`;
    s += `<path d="${path}" fill="${col}" data-tip="${esc(tips[i] || (fmtNum(v, 0) + unit))}"/>`;
    s += `<rect x="${L + i * slot}" y="${T}" width="${slot}" height="${H - T - B}" fill="transparent" data-tip="${esc(tips[i] || (fmtNum(v, 0) + unit))}"/>`;
  });
  if (yLabel) s += `<text x="${L}" y="${H - 6}" font-size="11" fill="${TEXT3}">${esc(yLabel)}</text>`;
  const host = h('div', { class: 'chart', html: frame(W, H, s, title || 'Graphique') });
  withTooltip(host);
  return host;
}

/** Courbe simple (une série), points marqués. */
export function lineChart({ values, tips = [], height = 150, title = '', yMin = null, yMax = null, yLabel = '', band = null }) {
  const W = 680, H = height, L = 46, R = 12, T = 14, B = 24;
  const lo = yMin ?? Math.min(...values) - 5, hi = yMax ?? Math.max(...values) + 5;
  const x = i => L + (values.length <= 1 ? 0 : i * (W - L - R) / (values.length - 1));
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo || 1));
  let s = '';
  for (const tv of niceTicks(lo, hi, 3)) {
    if (tv < lo || tv > hi) continue;
    s += `<line x1="${L}" x2="${W - R}" y1="${y(tv)}" y2="${y(tv)}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${L - 6}" y="${y(tv) + 4}" font-size="11" fill="${TEXT3}" text-anchor="end">${fmtNum(tv)}</text>`;
  }
  if (band) s += `<rect x="${L}" y="${y(band[1])}" width="${W - L - R}" height="${Math.max(1, y(band[0]) - y(band[1]))}" fill="${STATUS.ok}" opacity="0.08"/>`;
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ');
  s += `<path d="${d}" fill="none" stroke="${SERIES.one}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  values.forEach((v, i) => {
    s += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${SERIES.one}" stroke="${SURFACE}" stroke-width="2" data-tip="${esc(tips[i] || fmtNum(v))}"/>`;
    s += `<circle cx="${x(i)}" cy="${y(v)}" r="11" fill="transparent" data-tip="${esc(tips[i] || fmtNum(v))}"/>`;
  });
  if (yLabel) s += `<text x="${L}" y="${H - 5}" font-size="11" fill="${TEXT3}">${esc(yLabel)}</text>`;
  const host = h('div', { class: 'chart', html: frame(W, H, s, title || 'Courbe') });
  withTooltip(host);
  return host;
}

/** Nuage de points à plusieurs séries (ex. vélocités MD / MG dans le temps), avec légende. */
export function dotSeries({ series, height = 190, title = '', yMin = 0, yMax = 127, xLabel = '', yLabel = '' }) {
  const W = 680, H = height, L = 46, R = 12, T = 30, B = 26;
  const allX = series.flatMap(s => s.points.map(p => p.x));
  const x0 = Math.min(...allX, 0), x1 = Math.max(...allX, 1);
  const x = v => L + (v - x0) / (x1 - x0 || 1) * (W - L - R);
  const y = v => T + (H - T - B) * (1 - (v - yMin) / (yMax - yMin));
  let s = '';
  for (const tv of niceTicks(yMin, yMax, 4)) {
    if (tv < yMin || tv > yMax) continue;
    s += `<line x1="${L}" x2="${W - R}" y1="${y(tv)}" y2="${y(tv)}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${L - 6}" y="${y(tv) + 4}" font-size="11" fill="${TEXT3}" text-anchor="end">${fmtNum(tv)}</text>`;
  }
  let lx = L;
  for (const se of series) {
    s += `<circle cx="${lx + 5}" cy="12" r="5" fill="${se.color}"/>`;
    s += `<text x="${lx + 15}" y="16" font-size="12" fill="#4c525c">${esc(se.name)}</text>`;
    lx += 26 + se.name.length * 7;
    for (const p of se.points) {
      s += `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="4.5" fill="${se.color}" stroke="${SURFACE}" stroke-width="2" data-tip="${esc(p.tip || `${se.name} : ${p.y}`)}"/>`;
    }
    if (se.mean != null) {
      s += `<line x1="${L}" x2="${W - R}" y1="${y(se.mean)}" y2="${y(se.mean)}" stroke="${se.color}" stroke-width="2" opacity=".55"/>`;
    }
  }
  if (xLabel) s += `<text x="${W - R}" y="${H - 6}" font-size="11" fill="${TEXT3}" text-anchor="end">${esc(xLabel)}</text>`;
  if (yLabel) s += `<text x="${L}" y="${H - 6}" font-size="11" fill="${TEXT3}">${esc(yLabel)}</text>`;
  const host = h('div', { class: 'chart', html: frame(W, H, s, title || 'Nuage de points') });
  withTooltip(host);
  return host;
}

/** Frise : attaques des notes + état de la pédale, avec marqueurs de changements. */
export function pedalTimeline({ onsets, pedal, changes, duration, height = 150 }) {
  const W = 680, H = height, L = 70, R = 12;
  const x = t => L + t / (duration || 1) * (W - L - R);
  const yNotes = 46, yUp = 118, yDown = 92;
  let s = '';
  s += `<text x="8" y="${yNotes + 4}" font-size="12" fill="#4c525c">Accords</text>`;
  s += `<text x="8" y="${(yUp + yDown) / 2 + 4}" font-size="12" fill="#4c525c">Pédale</text>`;
  s += `<line x1="${L}" x2="${W - R}" y1="${yUp}" y2="${yUp}" stroke="${GRID}"/>`;
  for (const o of onsets) s += `<rect x="${x(o.t) - 1.5}" y="${yNotes - 14}" width="3" height="28" rx="1.5" fill="${SERIES.one}" data-tip="${esc(o.tip || '')}"/>`;
  let d = `M${L} ${yUp}`;
  let state = false;
  for (const p of pedal) { d += ` L${x(p.t)} ${state ? yDown : yUp} L${x(p.t)} ${p.down ? yDown : yUp}`; state = p.down; }
  d += ` L${W - R} ${state ? yDown : yUp}`;
  s += `<path d="${d}" fill="none" stroke="#4c525c" stroke-width="2" stroke-linejoin="round"/>`;
  for (const c of changes) {
    const col = STATUS[c.status] || TEXT3;
    s += `<circle cx="${x(c.t)}" cy="${yNotes - 24}" r="5" fill="${col}" stroke="${SURFACE}" stroke-width="2" data-tip="${esc(c.tip)}"/>`;
    s += `<circle cx="${x(c.t)}" cy="${yNotes - 24}" r="12" fill="transparent" data-tip="${esc(c.tip)}"/>`;
  }
  s += `<text x="${W - R}" y="${H - 6}" font-size="11" fill="${TEXT3}" text-anchor="end">temps (s)</text>`;
  const host = h('div', { class: 'chart', html: frame(W, H, s, 'Frise de la pédale') });
  withTooltip(host);
  return host;
}

/**
 * Plusieurs courbes sur un même axe (ex. ton tempo et celui de la référence, mesure par mesure).
 * series : [{ name, color, values (null = pas de donnée), dashed }] ; labels : étiquettes de l'axe horizontal.
 */
export function multiLine({ series, labels, height = 190, title = '', yMin = null, yMax = null, unit = '', yLabel = '', xLabel = '', baseline = null }) {
  const W = 680, H = height, L = 46, R = 14, T = 30, B = 30;
  const all = series.flatMap(s => s.values.filter(v => v != null));
  if (!all.length) return h('div');
  const lo = yMin ?? Math.min(...all, baseline ?? Infinity) - 4, hi = yMax ?? Math.max(...all, baseline ?? -Infinity) + 4;
  const n = labels.length;
  const x = i => L + (n <= 1 ? (W - L - R) / 2 : i * (W - L - R) / (n - 1));
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo || 1));
  let s = '';
  for (const tv of niceTicks(lo, hi, 4)) {
    if (tv < lo || tv > hi) continue;
    s += `<line x1="${L}" x2="${W - R}" y1="${y(tv)}" y2="${y(tv)}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${L - 6}" y="${y(tv) + 4}" font-size="11" fill="${TEXT3}" text-anchor="end">${fmtNum(tv)}</text>`;
  }
  if (baseline != null && baseline >= lo && baseline <= hi) s += `<line x1="${L}" x2="${W - R}" y1="${y(baseline)}" y2="${y(baseline)}" stroke="${AXIS}" stroke-width="1.5"/>`;
  const step = Math.max(1, Math.ceil(n / 14));
  labels.forEach((lb, i) => { if (i % step === 0 || i === n - 1) s += `<text x="${x(i)}" y="${H - 12}" font-size="11" fill="${TEXT3}" text-anchor="middle">${esc(String(lb))}</text>`; });
  // légende (toujours présente dès deux séries)
  let lx = L;
  for (const se of series) {
    s += `<line x1="${lx}" x2="${lx + 18}" y1="12" y2="12" stroke="${se.color}" stroke-width="2"${se.dashed ? ' stroke-dasharray="5 4"' : ''}/>`;
    s += `<text x="${lx + 24}" y="16" font-size="12" fill="#4c525c">${esc(se.name)}</text>`;
    lx += 40 + se.name.length * 6.6;
  }
  for (const se of series) {
    let d = '', pen = false;
    se.values.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i)} ${y(v)} `; pen = true; });
    s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${se.dashed ? ' stroke-dasharray="5 4"' : ''}/>`;
    se.values.forEach((v, i) => {
      if (v == null) return;
      const tip = `${se.name} — ${labels[i]} : ${fmtNum(v)}${unit}`;
      s += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${se.color}" stroke="${SURFACE}" stroke-width="2" data-tip="${esc(tip)}"/>`;
      s += `<circle cx="${x(i)}" cy="${y(v)}" r="11" fill="transparent" data-tip="${esc(tip)}"/>`;
    });
  }
  if (yLabel) s += `<text x="${L}" y="${T - 8 + 22}" font-size="11" fill="${TEXT3}"></text>`;
  if (xLabel) s += `<text x="${W - R}" y="${H - 1}" font-size="11" fill="${TEXT3}" text-anchor="end">${esc(xLabel)}</text>`;
  const host = h('div', { class: 'chart', html: frame(W, H, s, title || 'Courbes') });
  withTooltip(host);
  return host;
}

/* Rampe séquentielle (une teinte, du clair au foncé) pour la carte des erreurs. */
const ERR_RAMP = ['#f3efe6', '#f2d6c2', '#e6ac87', '#cf7a4f', '#a8492a'];

/**
 * Carte des mesures : une case par mesure, d'autant plus foncée qu'il y a eu d'erreurs.
 * cells : [{ m, rate (0..1) | null, tip }] ; onPick(m) au toucher.
 */
export function measureStrip({ cells, onPick = null, selected = null }) {
  const host = h('div', { class: 'mstrip', role: 'group', 'aria-label': 'Carte des erreurs par mesure' });
  for (const c of cells) {
    const k = c.rate == null ? -1 : c.rate <= 0.001 ? 0 : c.rate < 0.06 ? 1 : c.rate < 0.15 ? 2 : c.rate < 0.3 ? 3 : 4;
    const b = h('button', { type: 'button', class: 'mcell' + (selected && c.m >= selected[0] && c.m <= selected[1] ? ' sel' : ''), title: c.tip || `m. ${c.m}`, 'aria-label': c.tip || `Mesure ${c.m}` },
      h('span', { class: 'sw', style: { background: k < 0 ? 'transparent' : ERR_RAMP[k], borderStyle: k < 0 ? 'dashed' : 'solid' } }),
      h('span', { class: 'mn' }, String(c.m)));
    if (onPick) b.addEventListener('click', () => onPick(c.m));
    host.append(b);
  }
  return host;
}
export { ERR_RAMP };
