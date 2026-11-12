// V8.6 — Pédale dessinée sous la partition, d'après les mêmes données que l'écoute (score.js) : pedal = prises et
// reprises, pedalUp = levées, pedalHalf = plages de demi-pédale, pedalEnd = fin, en noires depuis le début de la
// partition. Notation moderne, sous la portée du bas : un trait vertical pour enfoncer, un trait plein tant que la
// pédale est enfoncée, une encoche pour la changer, un trait vertical pour la lever. Demi-pédale : trait relevé à
// mi-hauteur, en pointillés, marqué « ½ ».

const LINE_OFF = 11;  // ligne de base des marques : sous l'élément le plus bas du système
const ZONE = 18;      // place réservée sous chaque système : le suivant commence au moins ZONE plus bas
const H = 8;          // hauteur des traits verticaux
const NOTCH = 6;      // profondeur de l'encoche d'un changement
const SVGNS = 'http://www.w3.org/2000/svg';
const key = t => Math.round(t * 1000);

/** Segments de pédale : { t0, t1, changes: [t], halves: [[a, b]] }. Une prise et une levée au même instant forment
 *  un changement (comme à l'écoute). */
export function pedalSegments(p) {
  if (!p || !p.pedal || !p.pedal.length) return [];
  const end = p.pedalEnd != null ? p.pedalEnd : Infinity;
  const at = new Map();
  for (const t of p.pedal) at.set(key(t), { t, take: true });
  for (const t of p.pedalUp || []) { const k = key(t); if (!at.has(k)) at.set(k, { t, take: false }); }
  const evs = [...at.values()].filter(e => e.t < end - 1e-6).sort((a, b) => a.t - b.t);
  const segs = [];
  let cur = null;
  for (const e of evs) {
    if (e.take) { if (cur) cur.changes.push(e.t); else cur = { t0: e.t, changes: [] }; }
    else if (cur) { cur.t1 = e.t; segs.push(cur); cur = null; }
  }
  if (cur) { cur.t1 = Number.isFinite(end) ? end : cur.t0 + 1; segs.push(cur); }
  for (const s of segs) {
    s.halves = (p.pedalHalf || []).map(([a, b]) => [Math.max(a, s.t0), Math.min(b, s.t1)]).filter(([a, b]) => b - a > 1e-6);
  }
  return segs;
}

const lineOf = el => { const m = (el.getAttribute('class') || '').match(/\babcjs-l(\d+)\b/); return m ? +m[1] : null; };

/** Fait de la place sous chaque système : les systèmes suivants descendent juste ce qu'il faut (une seule fois par
 *  rendu), puis la zone visible du dessin s'agrandit. Renvoie le décalage vertical de chaque système. */
function makeRoom(svg, k) {
  if (svg.__pedRoom) return svg.__pedRoom;
  const wraps = [...svg.querySelectorAll('g.abcjs-staff-wrapper')].map(w => ({ w, n: lineOf(w), bb: w.getBBox() }))
    .filter(x => x.n != null && x.bb.height).sort((a, b) => a.n - b.n);
  const shift = new Map();
  let acc = 0, prevBottom = null;
  for (const { w, n, bb } of wraps) {
    if (prevBottom != null) acc += Math.max(0, prevBottom + ZONE * k - (bb.y + acc));
    if (acc) w.setAttribute('transform', `translate(0 ${acc.toFixed(2)})`);
    shift.set(n, acc);
    prevBottom = bb.y + bb.height + acc;
  }
  const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  if (prevBottom != null && vb.length === 4 && prevBottom + ZONE * k > vb[3]) {
    vb[3] = prevBottom + ZONE * k;
    svg.setAttribute('viewBox', vb.join(' '));
    const wrap = svg.parentElement; // conteneur abcjs « responsive » : ses proportions suivent la zone visible
    if (wrap && /padding-bottom/.test(wrap.getAttribute('style') || '')) wrap.style.paddingBottom = (vb[3] / vb[2] * 100) + '%';
  }
  svg.__pedRoom = { shift, k };
  return svg.__pedRoom;
}

/** Géométrie de chaque système : temps de début et de fin, position x d'un instant, ligne de base des marques. */
function lineGeometry(score, svg, room) {
  const barStart = k => (score.pickupQ > 0 ? (k === 0 ? 0 : score.pickupQ + (k - 1) * score.barQ) : k * score.barQ);
  const lines = new Map();
  const L = n => { if (!lines.has(n)) lines.set(n, { n, notes: [], bars: [], mms: new Set() }); return lines.get(n); };
  const clsNum = (el, re) => { const m = (el.getAttribute('class') || '').match(re); return m ? +m[1] : null; };
  const mmTimes = new Map(); // mesure -> [min t, max t] des notes
  for (const e of score.events) {
    if (e.grace || e.char == null) continue;
    for (const node of score.elementsFor(e.char)) {
      const g = node.classList && node.classList.contains('abcjs-note') ? node : node.closest && node.closest('.abcjs-note');
      if (!g) continue;
      const n = clsNum(g, /\babcjs-l(\d+)\b/), mm = clsNum(g, /\babcjs-mm(\d+)\b/);
      if (n == null) continue;
      let x = Infinity;
      for (const head of g.querySelectorAll('.abcjs-notehead')) { const bb = head.getBBox(); if (bb.width) x = Math.min(x, bb.x + bb.width / 2); }
      if (!Number.isFinite(x)) continue;
      L(n).notes.push({ t: e.t, x });
      if (mm != null) {
        L(n).mms.add(mm);
        const r = mmTimes.get(mm) || [Infinity, -Infinity];
        mmTimes.set(mm, [Math.min(r[0], e.t), Math.max(r[1], e.t)]);
      }
      break;
    }
  }
  for (const bar of svg.querySelectorAll('.abcjs-bar')) {
    const n = clsNum(bar, /\babcjs-l(\d+)\b/), mm = clsNum(bar, /\babcjs-mm(\d+)\b/);
    if (n == null || !lines.has(n)) continue;
    const bb = bar.getBBox();
    L(n).bars.push({ mm, x: bb.x + bb.width / 2 });
  }
  // une mesure n'a de temps fiable que si ses notes tombent dans [début, fin) calculés (mesures régulières)
  const okMeasure = mm => { const r = mmTimes.get(mm); return !r || (r[0] >= barStart(mm) - 1e-6 && r[1] < barStart(mm + 1) - 1e-6); };
  const out = [];
  for (const line of [...lines.values()].sort((a, b) => a.n - b.n)) {
    if (!line.notes.length) continue;
    const wrap = svg.querySelector(`.abcjs-staff-wrapper.abcjs-l${line.n}`);
    const wb = wrap ? wrap.getBBox() : null;
    line.notes.sort((a, b) => a.t - b.t || a.x - b.x);
    const anchors = [];
    for (const nt of line.notes) if (!anchors.length || nt.t - anchors[anchors.length - 1].t > 1e-6) anchors.push({ t: nt.t, x: nt.x });
    const mms = [...line.mms].sort((a, b) => a - b);
    const regular = mms.length && mms.every(okMeasure);
    let tStart = anchors[0].t, tEnd = anchors[anchors.length - 1].t + 0.5;
    const xLast = line.bars.length ? Math.max(...line.bars.map(b => b.x)) : anchors[anchors.length - 1].x + 12;
    if (regular) {
      tStart = Math.min(tStart, barStart(mms[0]));
      tEnd = barStart(mms[mms.length - 1] + 1);
      for (const b of line.bars) if (b.mm != null && b.x < xLast - 0.5) anchors.push({ t: barStart(b.mm + 1), x: b.x });
    }
    anchors.push({ t: tEnd, x: xLast });
    anchors.sort((a, b) => a.t - b.t);
    // x croissant avec le temps (une barre mal placée est écartée)
    const mono = [];
    for (const a of anchors) if (!mono.length || (a.t > mono[mono.length - 1].t + 1e-6 && a.x >= mono[mono.length - 1].x - 0.01)) mono.push(a);
    const xAt = t => {
      if (t <= mono[0].t) return mono[0].x;
      for (let i = 1; i < mono.length; i++) {
        const a = mono[i - 1], b = mono[i];
        if (t <= b.t) return a.x + (b.x - a.x) * (t - a.t) / (b.t - a.t);
      }
      return mono[mono.length - 1].x;
    };
    const bottom = wb ? wb.y + wb.height : 0;
    out.push({ n: line.n, tStart, tEnd, xAt, xCont: Math.max(0, mono[0].x - 12 * room.k), xEnd: xLast, y: bottom + LINE_OFF * room.k + (room.shift.get(line.n) || 0) });
  }
  // un système commence où finit le précédent (pas de trou entre les temps)
  for (let i = 1; i < out.length; i++) if (out[i].tStart > out[i - 1].tEnd + 1e-6 || out[i].tStart < out[i - 1].tEnd - 1e-6) out[i].tStart = out[i - 1].tEnd;
  return out;
}

function el(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.append(e);
  return e;
}

/** Dessine les marques ; renvoie le groupe SVG (ou null : rien à dessiner, ou partition pas encore affichée). */
export function drawPedal(score, p) {
  const svg = score.svgHost && score.svgHost.querySelector('svg');
  if (!svg) return null;
  svg.querySelectorAll('g.ped-marks').forEach(g => g.remove());
  const segs = pedalSegments(p);
  if (!segs.length) return null;
  // taille des marques à l'écran à peu près constante : sur un téléphone (partition réduite), on les agrandit
  const vbw = +((svg.getAttribute('viewBox') || '').split(/\s+/)[2]) || 0;
  const scale = vbw ? svg.getBoundingClientRect().width / vbw : 1;
  const room = makeRoom(svg, Math.min(1.9, Math.max(1, 0.95 / (scale || 1))));
  const k = room.k, Hk = H * k, NK = NOTCH * k, W = 2.5 * k;
  const geo = lineGeometry(score, svg, room);
  if (!geo.length) return null;
  const g = el('g', { class: 'ped-marks', 'aria-hidden': 'true' }, svg);
  const isHalf = (s, t) => s.halves.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);
  for (const s of segs) {
    const isChange = t => s.changes.some(c => Math.abs(c - t) < 1e-6);
    for (const line of geo) {
      const a = Math.max(s.t0, line.tStart), b = Math.min(s.t1, line.tEnd);
      if (b - a < 1e-6) continue;
      const y = line.y, Y = half => (half ? y - Hk / 2 : y);
      const opened = a > s.t0 + 1e-6; // suite d'une pédale commencée au système précédent
      const closed = b >= s.t1 - 1e-6;
      // instants de rupture : début, changements, débuts et fins de demi-pédale, fin
      const cuts = new Set([key(a), key(b)]);
      const tOf = new Map([[key(a), a], [key(b), b]]);
      const addCut = t => { if (t > a + 1e-6 && t < b - 1e-6) { cuts.add(key(t)); tOf.set(key(t), t); } };
      s.changes.forEach(addCut);
      s.halves.forEach(([h0, h1]) => { addCut(h0); addCut(h1); });
      const ts = [...cuts].sort((u, v) => u - v).map(k => tOf.get(k));
      const xs = ts.map(t => line.xAt(t));
      const lv = i => isHalf(s, ts[i]);                       // niveau après l'instant i
      const lvBefore = i => isHalf(s, ts[i] - 1e-3);          // niveau juste avant l'instant i
      const notchAt = i => (i > 0 && i < ts.length - 1 && isChange(ts[i])) || (i === 0 && opened && isChange(ts[0]));
      // « demi » dans le trait, au début d'une demi-pédale (le pointillé reprend après le mot)
      const LBL = 25 * k;
      const label = (x, yy) => { const t = el('text', { x: x + 2 * k, y: yy + 3.4 * k, 'font-size': (9.5 * k).toFixed(1) }, g); t.textContent = 'demi'; };
      // début : trait vertical (prise) ; ou, pour la suite d'une pédale, un trait venu de la gauche du système
      let contLabel = opened && lvBefore(0); // demi-pédale qui continue : « demi » aussi au début du système
      if (opened) {
        let xc = Math.min(line.xCont, xs[0] - 6 * k);
        const xz = xs[0] - (notchAt(0) ? W : 0);
        if (contLabel && xz - LBL - 6 * k >= 14) xc = Math.min(xc, xz - LBL - 6 * k); // place pour « demi » à gauche
        if (contLabel && xz - xc > LBL + 4 * k) { label(xc, Y(true)); xc += LBL; contLabel = false; }
        el('line', { x1: xc, y1: Y(lvBefore(0)), x2: xz, y2: Y(lvBefore(0)), class: lvBefore(0) ? 'half' : '' }, g);
      } else el('line', { x1: xs[0], y1: y - Hk, x2: xs[0], y2: Y(lv(0)) }, g);
      for (let i = 0; i < ts.length; i++) {
        const x = xs[i];
        // à l'instant i : encoche (changement) ou passage d'un niveau à l'autre
        if (notchAt(i)) el('polyline', { points: `${x - W},${Y(lvBefore(i))} ${x},${y - NK} ${x + W},${Y(lv(i))}` }, g);
        else if ((i > 0 || opened) && i < ts.length - 1 && lvBefore(i) !== lv(i)) el('line', { x1: x, y1: Y(lvBefore(i)), x2: x, y2: Y(lv(i)) }, g);
        if (i === ts.length - 1) break;
        // trait horizontal jusqu'à l'instant suivant
        let xa = x + (notchAt(i) ? W : 0);
        const xb = xs[i + 1] - (notchAt(i + 1) ? W : 0);
        if (lv(i) && xb - xa > LBL + 4 * k && (i === 0 ? !(opened && lvBefore(0)) || notchAt(0) || contLabel : !lvBefore(i) || notchAt(i))) { label(xa, Y(true)); xa += LBL; }
        if (xb - xa > 0.2) el('line', { x1: xa, y1: Y(lv(i)), x2: xb, y2: Y(lv(i)), class: lv(i) ? 'half' : '' }, g);
      }
      // fin : trait vertical (levée) ; sinon la pédale continue au système suivant
      if (closed) el('line', { x1: xs[xs.length - 1], y1: Y(lvBefore(ts.length - 1)), x2: xs[xs.length - 1], y2: y - Hk }, g);
    }
  }
  return g;
}
