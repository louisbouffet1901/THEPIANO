// Partitions importées : lecture des fichiers MusicXML (MuseScore, Finale, Sibelius, Dorico…) et conversion en ABC.
// La pièce est lue une seule fois du début à la fin : les reprises ne sont pas rejouées et, pour les fins
// alternatives (1re fois, 2e fois), seule la dernière est gardée. Chaque portée et chaque voix MusicXML devient
// une voix ABC : RH1, RH2… pour la portée du haut (main droite), LH1, LH2… pour celle du bas (main gauche).

/** Version du convertisseur : une partition importée avec une version plus ancienne est reconvertie depuis son fichier. */
export const CONVERTER_VERSION = 2;

/* ------------------------------------------------------------------ */
/* Fractions exactes (durées et positions en noires)                   */
/* ------------------------------------------------------------------ */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const fadd = (a, b) => F(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const fsub = (a, b) => F(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const fmul = (a, b) => F(a[0] * b[0], a[1] * b[1]);
const fcmp = (a, b) => a[0] * b[1] - b[0] * a[1];
const fval = a => a[0] / a[1];
const fmax = (a, b) => (fcmp(a, b) >= 0 ? a : b);
const ZERO = [0, 1];
const GRID = 3360; // 1/3360 de noire : divisible par 2^5, 3, 5 et 7
const snapGrid = x => F(Math.round(x * GRID), GRID);
const isPow2 = n => n > 0 && (n & (n - 1)) === 0;
const binary = q => isPow2(q[1]);
/** Une seule figure (éventuellement pointée) peut-elle porter cette durée ? */
function representable(q) {
  if (q[0] <= 0 || !binary(q)) return false;
  let n = q[0];
  while (n % 2 === 0) n /= 2;
  return n === 1 || n === 3 || n === 7 || n === 15;
}
/** Découpe une durée binaire en figures simples (de la plus longue à la plus courte, ronde au plus). */
function binChunks(q) {
  const out = [];
  let r = q;
  while (r[0] > 0 && out.length < 64) {
    const v = fval(r);
    const k = Math.min(2, Math.floor(Math.log2(v) + 1e-9));
    let c = k >= 0 ? F(2 ** k) : F(1, 2 ** -k);
    if (fcmp(c, r) > 0) c = fmul(c, F(1, 2));
    out.push(c);
    r = fsub(r, c);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Aides DOM                                                           */
/* ------------------------------------------------------------------ */
const kids = (el, name) => { const out = []; if (el) for (const c of el.children) if (c.localName === name) out.push(c); return out; };
const kid = (el, name) => { if (el) for (const c of el.children) if (c.localName === name) return c; return null; };
const txt = (el, name) => { const k = kid(el, name); return k ? k.textContent.trim() : ''; };
const num = (el, name, d = 0) => { const v = parseFloat(txt(el, name)); return Number.isFinite(v) ? v : d; };

/* ------------------------------------------------------------------ */
/* Notation                                                            */
/* ------------------------------------------------------------------ */
const TYPE_Q = { maxima: [32, 1], long: [16, 1], breve: [8, 1], whole: [4, 1], half: [2, 1], quarter: [1, 1], eighth: [1, 2], '16th': [1, 4], '32nd': [1, 8], '64th': [1, 16], '128th': [1, 32], '256th': [1, 64] };
const MAJ = ['Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const MIN = ['Abm', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];
const keyName = (fifths, mode) => (mode === 'minor' ? MIN : MAJ)[Math.max(-7, Math.min(7, fifths)) + 7];
const SHARPS = 'FCGDAEB';
function keyAlters(fifths) {
  const a = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  for (let i = 0; i < Math.min(7, Math.abs(fifths)); i++) {
    if (fifths > 0) a[SHARPS[i]] = 1; else a[SHARPS[6 - i]] = -1;
  }
  return a;
}
// clé de sol octaviée : affichée comme une clé de sol (abcjs transposerait la lecture d'une octave)
const clefName = c => { const sign = txt(c, 'sign'); if (sign === 'F') return 'bass'; if (sign === 'C') return num(c, 'line', 3) === 4 ? 'tenor' : 'alto'; return 'treble'; };
const ORN = { 'trill-mark': 'T', turn: '!turn!', mordent: '!mordent!', 'inverted-mordent': '!uppermordent!' };
const ART = { staccato: '.', staccatissimo: '!wedge!', accent: '!>!', tenuto: '!tenuto!' };
const DYN = { pppp: 'ppp', ppp: 'ppp', pp: 'pp', p: 'p', mp: 'mp', mf: 'mf', f: 'f', ff: 'ff', fff: 'fff', ffff: 'fff', sf: 'sfz', sfz: 'sfz', sffz: 'sfz', fz: 'sfz', rf: 'sfz', rfz: 'sfz', sfp: 'sfz', fp: 'f' };
const ACC = { '-2': '__', '-1': '_', 0: '=', 1: '^', 2: '^^' };
const STEP_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midiOf = p => 12 * (p.oct + 1) + STEP_PC[p.step] + p.alter;
const abcPitch = p => (p.oct >= 5 ? p.step.toLowerCase() + "'".repeat(p.oct - 5) : p.step + ','.repeat(Math.max(0, 4 - p.oct)));
/** Durée en noires → longueur ABC (L:1/16). */
function lenStr(q) {
  const [n, d] = F(q[0] * 4, q[1]);
  if (d === 1) return n === 1 ? '' : String(n);
  if (n === 1) return d === 2 ? '/' : '/' + d;
  return n + '/' + d;
}
const sumBeats = s => String(s).split('+').reduce((a, x) => a + (parseInt(x, 10) || 0), 0) || 4;
const beatQOf = ([b, bt]) => ((bt === 8 && b % 3 === 0) ? 1.5 : 4 / bt);

/** Durée réelle, durée écrite (sans le rapport de n-olet) et n-olet d'une note. */
function durInfo(el, divisions) {
  const dv = parseInt(txt(el, 'duration'), 10) || 0;
  const approx = F(dv, divisions || 1);
  const type = txt(el, 'type');
  const tmEl = kid(el, 'time-modification');
  const tm = tmEl ? [parseInt(txt(tmEl, 'actual-notes'), 10) || 1, parseInt(txt(tmEl, 'normal-notes'), 10) || 1] : null;
  const tuplet = tm && tm[0] !== tm[1] ? tm : null;
  if (TYPE_Q[type]) {
    let nominal = F(...TYPE_Q[type]);
    const dots = kids(el, 'dot').length;
    if (dots) nominal = fmul(nominal, F(2 ** (dots + 1) - 1, 2 ** dots));
    const actual = tuplet ? fmul(nominal, F(tuplet[1], tuplet[0])) : nominal;
    // la durée écrite fait foi, sauf si elle contredit nettement la durée MusicXML (silence d'une mesure entière…)
    if (!dv || Math.abs(fval(actual) - fval(approx)) <= Math.max(0.03 * fval(approx), 1 / 128)) return { dur: actual, nominal, tm: tuplet };
  }
  return { dur: approx, nominal: tuplet ? fmul(approx, F(tuplet[0], tuplet[1])) : approx, tm: tuplet };
}

/** Mesures des fins alternatives à sauter (toutes sauf la dernière de chaque série). */
function droppedEndings(measures) {
  const brackets = [];
  let cur = null;
  measures.forEach((m, i) => {
    for (const bl of kids(m, 'barline')) {
      const e = kid(bl, 'ending');
      if (!e) continue;
      const type = e.getAttribute('type');
      if (type === 'start') { if (cur) brackets.push({ ...cur, to: i - 1 }); cur = { from: i, to: i }; }
      else if ((type === 'stop' || type === 'discontinue') && cur) { cur.to = i; brackets.push(cur); cur = null; }
    }
  });
  if (cur) { cur.to = measures.length - 1; brackets.push(cur); }
  const drop = new Set();
  for (let i = 0; i < brackets.length - 1; i++) {
    if (brackets[i + 1].from === brackets[i].to + 1) for (let k = brackets[i].from; k <= brackets[i].to; k++) drop.add(k);
  }
  return drop;
}

/* ------------------------------------------------------------------ */
/* Conversion                                                          */
/* ------------------------------------------------------------------ */
/**
 * MusicXML (texte) → { abc, title, qpm, bars, pedal, pedalEnd, warnings, stats }.
 * bars : [{ n, q, len, nominal, beatQ }] numéros de mesure de la partition et début de chaque mesure (en noires).
 */
export function musicXmlToAbc(xmlText, opts = {}) {
  return emitAbc(parseMusicXml(xmlText, opts), opts);
}

/** Lecture du MusicXML : mesures, voix et événements (sans écriture ABC). */
export function parseMusicXml(xmlText, { title: fallbackTitle = '' } = {}) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('fichier MusicXML illisible');
  const root = doc.documentElement;
  if (root.localName === 'score-timewise') throw new Error('format MusicXML « timewise » non pris en charge : réexporte la partition depuis ton logiciel');
  if (root.localName !== 'score-partwise') throw new Error('ce fichier n’est pas une partition MusicXML');
  const parts = kids(root, 'part');
  if (!parts.length) throw new Error('la partition ne contient aucune portée');
  const warnings = new Set();
  const title = (txt(kid(root, 'work'), 'work-title') || txt(root, 'movement-title') || fallbackTitle || 'Partition').replace(/[\r\n%\\]+/g, ' ').trim().slice(0, 80);

  // Lecture unique : mesures gardées, d'après la première partie
  const m0 = kids(parts[0], 'measure');
  if (!m0.length) throw new Error('la partition ne contient aucune mesure');
  const drop = droppedEndings(m0);
  if (drop.size) warnings.add('Fins alternatives : seule la dernière est gardée (la pièce est lue une fois, sans reprise).');
  const keep = m0.map((_, i) => i).filter(i => !drop.has(i));
  const keptIndex = new Map(keep.map((xi, k) => [xi, k]));
  const minfo = keep.map(xi => ({ xi, number: m0[xi].getAttribute('number') || '', implicit: m0[xi].getAttribute('implicit') === 'yes', sectionEnd: barlineAt(m0[xi], 'right'), sectionStart: barlineAt(m0[xi], 'left'), end: ZERO, meter: [4, 4], fifths: 0, mode: 'major' }));

  // Portées : numérotation globale (parties successives)
  const staffBase = [];
  let nStaves = 0;
  for (const p of parts) {
    let s = 1;
    for (const st of p.getElementsByTagName('staves')) s = Math.max(s, parseInt(st.textContent, 10) || 1);
    staffBase.push(nStaves);
    nStaves += s;
  }

  const streams = new Map(); // `${portée}|${voix}` → { g, voice, ms: Map(mesure → événements) }
  const getStream = (g, voice) => {
    const key = g + '|' + voice;
    let s = streams.get(key);
    if (!s) { s = { key, g, voice, first: streams.size, ms: new Map() }; streams.set(key, s); }
    return s;
  };
  const clefs = []; // { g, k, pos, clef }
  const dirs = []; // { g, k, pos, deco }
  const pedals = []; // { k, pos, down }
  let tempo = 0;
  let notes = 0;

  parts.forEach((part, pi) => {
    let divisions = 1, fifths = 0, mode = 'major', meter = [4, 4];
    let divKnown = false;
    const clefNow = {};
    const graces = new Map(); // petites notes en attente, par voix (une petite note avant la barre vaut pour la note qui suit)
    kids(part, 'measure').forEach((meas, xi) => {
      const k = keptIndex.has(xi) ? keptIndex.get(xi) : null;
      if (k != null && pi === 0) Object.assign(minfo[k], { meter: meter.slice(), fifths, mode });
      if (k != null) for (const [g, c] of Object.entries(clefNow)) clefs.push({ g: +g, k, pos: ZERO, clef: c });
      let pos = ZERO, maxPos = ZERO, lastStart = ZERO, lastInfo = { dur: ZERO, nominal: ZERO, tm: null };
      const known = [ZERO];
      const snap = x => {
        let best = null, bd = Infinity;
        for (const p of known) { const d = Math.abs(fval(p) - x); if (d < bd) { bd = d; best = p; } }
        return bd < 1 / 48 ? best : snapGrid(Math.max(0, x));
      };
      for (const el of meas.children) {
        switch (el.localName) {
          case 'attributes': {
            const dv = parseInt(txt(el, 'divisions'), 10);
            if (dv > 0) { divisions = dv; divKnown = true; }
            const key = kid(el, 'key');
            if (key && kid(key, 'fifths')) {
              fifths = num(key, 'fifths', 0); mode = txt(key, 'mode') || 'major';
              if (k != null && pi === 0) { if (fval(pos) > 0) warnings.add('Changement d’armure en cours de mesure : appliqué au début de la mesure.'); Object.assign(minfo[k], { fifths, mode }); }
            }
            const time = kid(el, 'time');
            if (time && kid(time, 'beats')) {
              meter = [sumBeats(txt(time, 'beats')), num(time, 'beat-type', 4)];
              if (k != null && pi === 0) minfo[k].meter = meter.slice();
            }
            for (const c of kids(el, 'clef')) {
              const g = staffBase[pi] + (parseInt(c.getAttribute('number') || '1', 10) || 1) - 1;
              clefNow[g] = clefName(c);
              if (k != null) clefs.push({ g, k, pos, clef: clefNow[g] });
            }
            break;
          }
          case 'note': {
            const isChord = !!kid(el, 'chord');
            const st = parseInt(txt(el, 'staff') || '1', 10) || 1;
            const g = staffBase[pi] + st - 1;
            const voice = txt(el, 'voice') || '1';
            const pitchEl = kid(el, 'pitch');
            const hidden = el.getAttribute('print-object') === 'no';
            if (kid(el, 'grace')) {
              if (k == null || !pitchEl || hidden || kid(el, 'cue')) break;
              const s = getStream(g, voice);
              const list = graces.get(s.key) || [];
              const p = notePitch(el, pitchEl);
              if (isChord && list.length) { if (midiOf(p) > midiOf(list[list.length - 1])) list[list.length - 1] = { ...p, slash: list[list.length - 1].slash }; }
              else list.push({ ...p, slash: kid(el, 'grace').getAttribute('slash') === 'yes' });
              graces.set(s.key, list);
              break;
            }
            if (!divKnown) {
              const guess = guessDivisions(el);
              if (guess) { divisions = guess; divKnown = true; warnings.add('Le fichier ne précise pas la subdivision des durées : elle a été déduite des notes.'); }
            }
            const di = durInfo(el, divisions);
            const start = isChord ? lastStart : pos;
            if (!isChord) {
              lastStart = pos; lastInfo = di;
              pos = fadd(pos, di.dur);
              known.push(start, pos);
              maxPos = fmax(maxPos, pos);
            }
            if (k == null || hidden || kid(el, 'cue')) break;
            const restEl = kid(el, 'rest');
            if (!pitchEl && !restEl) break; // percussion : ignorée
            const s = getStream(g, voice);
            if (!s.ms.has(k)) s.ms.set(k, []);
            const list = s.ms.get(k);
            if (isChord && pitchEl) {
              const last = list[list.length - 1];
              if (last && last.kind === 'note' && fcmp(last.start, start) === 0) {
                const p = notePitch(el, pitchEl);
                if (!last.pitches.some(x => x.step === p.step && x.oct === p.oct)) { last.pitches.push(p); notes++; }
                collectNotations(el, last);
                break;
              }
            }
            const ev = {
              kind: pitchEl ? 'note' : 'rest', start, ...(isChord ? { dur: lastInfo.dur, nominal: lastInfo.nominal, tm: lastInfo.tm } : { dur: di.dur, nominal: di.nominal, tm: di.tm }),
              pitches: pitchEl ? [notePitch(el, pitchEl)] : [], deco: [], beam: beamOf(el), tupStart: false, tupStop: false,
              graces: graces.get(s.key) || null,
            };
            if (pitchEl) notes++;
            graces.delete(s.key);
            collectNotations(el, ev);
            list.push(ev);
            break;
          }
          case 'backup':
            pos = snap(fval(pos) - num(el, 'duration', 0) / divisions);
            break;
          case 'forward':
            pos = snap(fval(pos) + num(el, 'duration', 0) / divisions);
            known.push(pos);
            maxPos = fmax(maxPos, pos);
            break;
          case 'direction': {
            const g = staffBase[pi] + (parseInt(txt(el, 'staff') || '1', 10) || 1) - 1;
            const off = num(el, 'offset', 0) / divisions;
            const at = off ? snapGrid(Math.max(0, fval(pos) + off)) : pos;
            for (const dt of kids(el, 'direction-type')) {
              for (const c of dt.children) {
                if (c.localName === 'dynamics') {
                  const d = c.children[0] && DYN[c.children[0].localName];
                  if (d && k != null) dirs.push({ g, k, pos: at, deco: `!${d}!` });
                } else if (c.localName === 'words') {
                  const w = c.textContent.replace(/["%\\\r\n]+/g, ' ').trim();
                  if (w && w.length <= 40 && k != null) dirs.push({ g, k, pos: at, deco: `"^${w}"` });
                } else if (c.localName === 'pedal') {
                  const ty = c.getAttribute('type');
                  if (k != null && ty !== 'continue') pedals.push({ k, pos: at, down: ty === 'start' || ty === 'change' || ty === 'resume' });
                } else if (c.localName === 'metronome' && !tempo) {
                  const unit = txt(c, 'beat-unit');
                  const pm = num(c, 'per-minute', 0);
                  if (pm > 0 && TYPE_Q[unit]) tempo = pm * fval(F(...TYPE_Q[unit])) * (kid(c, 'beat-unit-dot') ? 1.5 : 1);
                }
              }
            }
            const snd = kid(el, 'sound');
            if (snd && !tempo && parseFloat(snd.getAttribute('tempo')) > 0) tempo = parseFloat(snd.getAttribute('tempo'));
            break;
          }
          case 'sound':
            if (!tempo && parseFloat(el.getAttribute('tempo')) > 0) tempo = parseFloat(el.getAttribute('tempo'));
            break;
        }
      }
      if (k != null) minfo[k].end = fmax(minfo[k].end, maxPos);
    });
  });
  if (!notes) throw new Error('aucune note dans la partition');

  // Longueur et début de chaque mesure ; numéros de la partition (mesures scindées fusionnées)
  const bars = [];
  let q = ZERO, meterChanges = false;
  minfo.forEach((m, k) => {
    m.nominal = F(m.meter[0] * 4, m.meter[1]);
    const short = fcmp(m.end, ZERO) > 0 && fcmp(m.end, m.nominal) < 0;
    const nx = minfo[k + 1];
    const boundary = m.sectionEnd || (nx && (nx.implicit || nx.sectionStart)) || k === minfo.length - 1;
    m.len = (m.implicit || (short && boundary)) ? (fcmp(m.end, ZERO) > 0 ? m.end : m.nominal) : fmax(m.nominal, m.end);
    if (k && (m.meter[0] !== minfo[k - 1].meter[0] || m.meter[1] !== minfo[k - 1].meter[1])) meterChanges = true;
    m.q = q;
    const last = bars[bars.length - 1];
    let n = parseInt(m.number, 10);
    if (!Number.isFinite(n)) n = last ? last.n : 1;
    if (last && n === last.n) last.len += fval(m.len);
    else {
      if (last && n < last.n) n = last.n + 1;
      bars.push({ n, q: fval(q), len: fval(m.len), nominal: fval(m.nominal), beatQ: beatQOf(m.meter) });
    }
    m.n = n;
    q = fadd(q, m.len);
  });
  if (meterChanges) warnings.add('Changements de mesure : le métronome et le comptage des temps suivent la première mesure.');
  const totalQ = fval(q);

  // Voix ABC : ordre des portées puis des voix ; main d'après la portée
  const firstClef = g => { const c = clefs.find(x => x.g === g && x.k === 0 && fval(x.pos) === 0); return c ? clefs.filter(x => x.g === g && x.k === 0 && fval(x.pos) === 0).pop().clef : null; };
  const handOf = g => (nStaves === 1 ? 'rh' : g === nStaves - 1 ? 'lh' : g === 0 ? 'rh' : (firstClef(g) === 'bass' ? 'lh' : 'rh'));
  const list = [...streams.values()].filter(s => [...s.ms.values()].some(evs => evs.some(e => e.kind === 'note')))
    .sort((a, b) => a.g - b.g || (parseInt(a.voice, 10) || 0) - (parseInt(b.voice, 10) || 0) || a.first - b.first);
  const counter = { rh: 0, lh: 0 };
  for (const s of list) { const hand = handOf(s.g); s.hand = hand; s.name = (hand === 'lh' ? 'LH' : 'RH') + (++counter[hand]); }
  const dirOwner = new Map(); // portée → voix qui y a le plus de notes (porte nuances et indications)
  const sizeOf = st => [...st.ms.values()].reduce((a, evs) => a + evs.length, 0);
  for (const st of list) { const cur = dirOwner.get(st.g); if (!cur || sizeOf(st) > sizeOf(cur)) dirOwner.set(st.g, st); }

  return { title, minfo, bars, list, clefs, dirs, pedals, tempo, warnings, nStaves, notes, dirOwner, firstClef };
}

/**
 * Écriture ABC d'un modèle lu par parseMusicXml : toute la pièce, ou les mesures k0 à k1 (indices des mesures gardées),
 * éventuellement une seule main (hand: 'rh' | 'lh'). Les liaisons vers une note hors de l'extrait sont retirées.
 * Pour les extraits de lecture à vue : reduce (accords allégés : note du haut à la main droite, du bas à la main
 * gauche), shift (transposition d'octave par main, ex. { rh: -1 } pour un passage écrit très haut) et perLine
 * (nombre de mesures par ligne, sinon selon la densité).
 */
export function emitAbc(model, { k0 = 0, k1 = null, hand = null, reduce = false, shift = null, perLine = 0 } = {}) {
  const { title, minfo, list: allStreams, clefs, dirs, pedals, tempo, warnings, nStaves, notes, dirOwner, firstClef } = model;
  if (k1 == null || k1 > minfo.length - 1) k1 = minfo.length - 1;
  const ks = [];
  for (let k = k0; k <= k1; k++) ks.push(k);
  const list = allStreams.filter(s => !hand || s.hand === hand)
    .filter(s => ks.some(k => (s.ms.get(k) || []).some(e => e.kind === 'note')) || (hand && allStreams.filter(x => x.hand === hand)[0] === s));
  if (!list.length) throw new Error('aucune note dans ces mesures');
  const q0 = minfo[k0].q;
  const out = new Map(); // voix → mesures écrites
  const headerClef = new Map();
  for (const s of list) {
    const myClefs = clefs.filter(c => c.g === s.g);
    // clé en vigueur au début de l'extrait
    let clefCur = firstClef(s.g) || (s.hand === 'lh' ? 'bass' : 'treble');
    for (const c of myClefs) if (c.k < k0 || (c.k === k0 && fval(c.pos) === 0)) clefCur = c.clef;
    headerClef.set(s, clefCur);
    const myDirs = dirOwner.get(s.g) === s ? dirs.filter(d => d.g === s.g && d.k >= k0 && d.k <= k1).sort((a, b) => a.k - b.k || fcmp(a.pos, b.pos)) : [];
    let di = 0;
    let prevTies = new Set(); // hauteurs liées vers la note suivante de cette voix
    // copie des événements : une écriture ne doit pas laisser de marques (n-olets, liaisons) pour la suivante
    const sh = (shift && shift[s.hand]) || 0;
    const red = reduce ? (s.hand === 'lh' ? -1 : 1) : 0;
    const copy = e => ({ ...e, pitches: e.pitches.map(p => ({ ...p, oct: p.oct + sh })), graces: e.graces && sh ? e.graces.map(g => ({ ...g, oct: g.oct + sh })) : e.graces });
    const byK = ks.map(k => normalize((s.ms.get(k) || []).map(copy).sort((a, b) => fcmp(a.start, b.start)), warnings));
    if (red) for (const evs of byK) for (const e of evs) if (e.pitches.length > 1) e.pitches = [e.pitches.reduce((a, b) => ((midiOf(b) - midiOf(a)) * red > 0 ? b : a))];
    const flatEvs = byK.flat();
    flatEvs.forEach((e, n) => { e.next = flatEvs[n + 1] || null; });
    // une liaison n'est écrite que si la note suivante la termine bien (même hauteur, fin de liaison)
    const tieOk = (ev, p) => p.tieStart && ev.next && ev.next.kind === 'note' && ev.next.pitches.some(q => q.tieStop && midiOf(q) === midiOf(p));
    for (const e of flatEvs) if (e.kind === 'note') for (const p of e.pitches) p.tie = tieOk(e, p);
    out.set(s, ks.map((k, ki) => {
      const m = minfo[k];
      const evs = byK[ki];
      const keyAlt = keyAlters(m.fifths);
      const state = new Map(), force = new Set();
      const accFor = (p, grace) => {
        const id = p.step + p.oct;
        const cur = state.has(id) ? state.get(id) : keyAlt[p.step];
        if (p.alter !== cur || force.has(id)) {
          if (grace) force.add(id); else { state.set(id, p.alter); force.delete(id); }
          return ACC[p.alter] ?? '';
        }
        return '';
      };
      const toks = [];
      // en tête de mesure : changements d'armure, de chiffrage et de clé (placés à l'assemblage des lignes)
      const lead = { key: null, meter: null, clef: null, keyName: keyName(m.fifths, m.mode) };
      if (k > k0) {
        const pm = minfo[k - 1];
        if (m.fifths !== pm.fifths || m.mode !== pm.mode) lead.key = lead.keyName;
        if (m.meter[0] !== pm.meter[0] || m.meter[1] !== pm.meter[1]) lead.meter = `${m.meter[0]}/${m.meter[1]}`;
        let want = clefCur;
        for (const c of myClefs) if (c.k < k || (c.k === k && fval(c.pos) === 0)) want = c.clef;
        if (want !== clefCur) { lead.clef = want; clefCur = want; }
      }
      // changement de clé en cours de mesure
      const clefAt = pos => {
        let want = clefCur;
        for (const c of myClefs) if (c.k < k || (c.k === k && fcmp(c.pos, pos) <= 0)) want = c.clef;
        if (want !== clefCur && !(k === k0 && fval(pos) === 0)) { clefCur = want; return `[K:clef=${want}]`; }
        clefCur = want;
        return '';
      };
      let cur = ZERO, sep = ' ';
      // jeton suivant collé au précédent quand la ligature continue (notes liées par une barre)
      const push = (tok, after = ' ', glue = true) => { if (toks.length && sep === '' && glue) toks[toks.length - 1] += tok; else toks.push(tok); sep = after; };
      for (let i = 0; i < evs.length; i++) {
        const ev = evs[i];
        if (fcmp(ev.start, cur) > 0) { push(spacer(fsub(ev.start, cur), 'x'), ' ', false); cur = ev.start; }
        // n-olet : groupe de notes consécutives au même rapport. abcjs dérègle la suite si un groupe n'a qu'une note
        // ou plus de 9 (il ne lit qu'un chiffre) : on coupe en groupes de 2 à 9, sinon on écrit les durées exactes.
        if (ev.tm && !ev.inTup) {
          const grp = [];
          for (let j = i; j < evs.length; j++) {
            const e = evs[j];
            if (!e.tm || e.tm[0] !== ev.tm[0] || e.tm[1] !== ev.tm[1]) break;
            if (j > i && fcmp(e.start, fadd(evs[j - 1].start, evs[j - 1].dur)) !== 0) break;
            if (j > i && e.tupStart) break;
            grp.push(e); e.inTup = true;
            const sum = grp.reduce((a, x) => fadd(a, x.dur), ZERO);
            if (e.tupStop || (!ev.tupStart && binary(sum))) break;
          }
          const [p, q] = ev.tm;
          if (p > 9 || q > 9 || grp.length < 2 || grp.some(e => !representable(e.nominal))) grp.forEach(e => { e.exact = true; });
          else {
            const parts = Math.ceil(grp.length / 9), base = Math.floor(grp.length / parts), extra = grp.length % parts;
            for (let x = 0, g = 0; g < parts; g++) { const r = base + (g < extra ? 1 : 0); grp[x].tupPrefix = `(${p}:${q}:${r}`; x += r; }
          }
        }
        const tup = ev.tupPrefix || '';
        // changement de clé : jamais à l'intérieur d'un n-olet (abcjs compterait mal les notes)
        if (!(ev.inTup && !ev.exact && !ev.tupPrefix)) {
          const cl = clefAt(ev.start);
          if (cl) push(cl, ' ', false);
        }
        // nuances et indications de la portée, attachées à la note suivante
        let pre = '';
        while (di < myDirs.length && (myDirs[di].k < k || (myDirs[di].k === k && fcmp(myDirs[di].pos, fadd(ev.start, F(1, 64))) <= 0))) pre += myDirs[di++].deco;
        const gr = ev.graces && ev.kind === 'note' ? `{${ev.graces[0].slash ? '/' : ''}${ev.graces.map(p => accFor(p, true) + abcPitch(p)).join('')}}` : '';
        const deco = pre + gr + [...new Set(ev.deco)].join('');
        let chunks = ev.exact ? [ev.dur] : representable(ev.nominal) ? [ev.nominal] : (binary(ev.nominal) ? binChunks(ev.nominal) : null);
        if (!chunks) { // durée sans figure possible (fichier incohérent) : jouée exactement, affichée au mieux
          chunks = [ev.dur]; ev.exact = true;
          warnings.add('Certaines durées ne correspondent à aucune figure : elles sont jouées exactement mais affichées approximativement.');
        }
        let tok;
        if (ev.kind === 'rest') tok = deco + chunks.map(c => 'z' + lenStr(c)).join(' ');
        else {
          // note prolongée par une liaison : abcjs reprend la hauteur de la note de départ et n'en tient pas compte
          // pour les altérations de la mesure ; on n'écrit donc pas son altération (comme sur une partition gravée)
          const isCont = p => p.tieStop && prevTies.has(midiOf(p));
          // dans un accord, abcjs relie les liaisons note à note par leur rang : notes liées en premier, dans le même ordre
          const ps = ev.pitches.slice().sort((a, b) => (isCont(b) - isCont(a)) || (b.tie - a.tie) || (midiOf(a) - midiOf(b)));
          const accs = ps.map(p => (isCont(p) ? '' : accFor(p, false)));
          const allTie = ps.every(p => p.tie);
          tok = deco + chunks.map((c, ci) => {
            const last = ci === chunks.length - 1;
            const acc = n => (ci === 0 ? accs[n] : '');
            if (ps.length === 1) return acc(0) + abcPitch(ps[0]) + lenStr(c) + (!last || ps[0].tie ? '-' : '');
            // tout l'accord lié : liaison d'accord (suivie voix par voix par abcjs, plus fiable)
            const whole = !last || allTie;
            return '[' + ps.map((p, n) => acc(n) + abcPitch(p) + (!whole && p.tie ? '-' : '')).join('') + ']' + lenStr(c) + (whole ? '-' : '');
          }).join(' ');
        }
        prevTies = new Set(ev.kind === 'note' ? ev.pitches.filter(p => p.tie).map(midiOf) : []);
        const beamed = ev.beam === 'begin' || ev.beam === 'continue';
        push(tup + tok, beamed && chunks && chunks.length === 1 ? '' : ' ');
        cur = fadd(ev.start, ev.dur);
      }
      if (fcmp(m.len, cur) > 0) push(spacer(fsub(m.len, cur), 'x'), ' ', false);
      else if (fcmp(cur, m.len) > 0) warnings.add('Mesure trop pleine dans le fichier (m. ' + (m.number || k + 1) + ') : vérifie l’affichage.');
      return { lead, body: toks.join(' ').replace(/\s+/g, ' ').trim() };
    }));
  }

  // Mesures de l'extrait : numéros de la partition, début (en noires depuis le début de l'extrait)
  const bars = [];
  for (const k of ks) {
    const m = minfo[k], last = bars[bars.length - 1];
    if (last && m.n === last.n) last.len += fval(m.len);
    else bars.push({ n: m.n, q: fval(fsub(m.q, q0)), len: fval(m.len), nominal: fval(m.nominal), beatQ: beatQOf(m.meter) });
  }
  const totalQ = ks.reduce((a, k) => a + fval(minfo[k].len), 0);

  // Lignes de partition : quelques mesures par système selon la densité
  const weight = ks.map(k => {
    const per = new Map();
    for (const s of list) per.set(s.g, (per.get(s.g) || 0) + (s.ms.get(k) || []).length);
    return Math.max(1, ...per.values());
  });
  const systems = [];
  let curSys = [], w = 0;
  ks.forEach((k, ki) => {
    const full = perLine ? curSys.length >= perLine : (w + weight[ki] > 30 || curSys.length >= 5);
    if (curSys.length && full) { systems.push(curSys); curSys = []; w = 0; }
    curSys.push(ki); w += weight[ki];
  });
  if (curSys.length) systems.push(curSys);

  const staffGroups = [];
  for (const s of list) {
    const gi = staffGroups.findIndex(x => x.g === s.g);
    if (gi < 0) staffGroups.push({ g: s.g, names: [s.name] }); else staffGroups[gi].names.push(s.name);
  }
  const scoreLine = staffGroups.map(x => (x.names.length > 1 ? `(${x.names.join(' ')})` : x.names[0])).join(' | ');
  const m0i = minfo[k0];
  // (pas de titre dans l'ABC : il s'affiche au-dessus de la partition, dans le cadre de l'appli)
  const head = [
    'X:1', `M:${m0i.meter[0]}/${m0i.meter[1]}`, 'L:1/16', `K:${keyName(m0i.fifths, m0i.mode)}`,
    staffGroups.length > 1 ? `%%score {${scoreLine}}` : `%%score ${scoreLine}`,
    '%%barnumbers 1', `%%setbarnb ${m0i.n}`,
  ];
  // deux voix sur une portée : hampes vers le haut pour la première, vers le bas pour la seconde (comme sur une partition gravée)
  const stemOf = s => { const g = staffGroups.find(x => x.g === s.g); if (!g || g.names.length < 2) return ''; const i = g.names.indexOf(s.name); return i === 0 ? ' stem=up' : i === 1 ? ' stem=down' : ''; };
  for (const s of list) head.push(`V:${s.name} clef=${headerClef.get(s)}${stemOf(s)}`);
  // Champs en tête de mesure. abcjs plante si un champ K: ouvre une ligne dans la 2e voix d'une portée :
  // en début de ligne, l'armure et le chiffrage vont à la fin de la ligne précédente (où ils s'annoncent, comme
  // sur une partition gravée) et la clé passe dans l'en-tête de voix de la ligne ([V:… clef=…]).
  const fieldsMid = ({ lead }) => (lead.key ? `[K:${lead.key}${lead.clef ? ' clef=' + lead.clef : ''}]` : lead.clef ? `[K:clef=${lead.clef}]` : '') + (lead.meter ? `[M:${lead.meter}]` : '');
  // numéros de mesure de la partition : abcjs compte les mesures une à une ; on recale son compteur où il le faut
  const barFix = new Map();
  let abcBar = m0i.n;
  ks.forEach((k, ki) => {
    if (ki > 0) abcBar++;
    if (minfo[k].n !== abcBar && !(ki > 0 && minfo[k].n === minfo[k - 1].n)) { barFix.set(ki, `[I:setbarnb ${minfo[k].n}]`); abcBar = minfo[k].n; }
  });
  const body = [];
  const lastLine = new Map();
  systems.forEach((sys, si) => {
    const end = si === systems.length - 1 ? ' |]' : ' |';
    for (const s of list) {
      const sb = out.get(s);
      const parts = sys.map((ki, i) => {
        const b = sb[ki];
        const f = (s === list[0] && barFix.has(ki) ? barFix.get(ki) : '') + (i === 0 ? '' : fieldsMid(b));
        return f ? f + ' ' + b.body : b.body;
      });
      const first = sb[sys[0]];
      let prefix = `[V:${s.name}]`;
      if (si > 0) {
        const tail = (first.lead.key ? `[K:${first.lead.key}]` : '') + (first.lead.meter ? `[M:${first.lead.meter}]` : '');
        if (tail && lastLine.has(s.name)) body[lastLine.get(s.name)] += ' ' + tail;
        if (first.lead.clef) prefix = `[V:${s.name} clef=${first.lead.clef}]`;
      }
      lastLine.set(s.name, body.length);
      body.push(`${prefix} ` + parts.join(' | ') + end);
    }
  });

  // Pédale écrite : appuis (en noires) et relâchements, dans l'extrait
  const inRange = p => p.k >= k0 && p.k <= k1;
  const pq = p => fval(fsub(minfo[p.k].q, q0)) + fval(p.pos);
  const presses = [...new Set(pedals.filter(p => p.down && inRange(p)).map(p => Math.round(pq(p) * 1000) / 1000))].sort((a, b) => a - b);
  const releases = [...new Set(pedals.filter(p => !p.down && inRange(p)).map(p => Math.round(pq(p) * 1000) / 1000))].sort((a, b) => a - b);
  return {
    abc: head.concat(body).join('\n') + '\n',
    title,
    qpm: tempo ? Math.round(tempo) : null,
    bars,
    measures: ks.map(k => ({ n: minfo[k].n, q: fval(fsub(minfo[k].q, q0)), len: fval(minfo[k].len), fifths: minfo[k].fifths, mode: minfo[k].mode, meter: minfo[k].meter.slice() })),
    pedal: presses.length ? presses : null,
    pedalEnd: presses.length ? (releases.length ? Math.max(...releases) : totalQ) : null,
    pedalUp: presses.length && releases.length ? releases : null,
    warnings: [...warnings],
    stats: { measures: bars.length, notes, voices: list.length, staves: nStaves },
  };
}

/** Subdivision des durées déduite d'une note (figure et durée connues), quand <divisions> manque. */
function guessDivisions(el) {
  const dv = parseInt(txt(el, 'duration'), 10);
  const type = txt(el, 'type');
  if (!dv || !TYPE_Q[type]) return 0;
  let q = F(...TYPE_Q[type]);
  const dots = kids(el, 'dot').length;
  if (dots) q = fmul(q, F(2 ** (dots + 1) - 1, 2 ** dots));
  const tm = kid(el, 'time-modification');
  if (tm) q = fmul(q, F(parseInt(txt(tm, 'normal-notes'), 10) || 1, parseInt(txt(tm, 'actual-notes'), 10) || 1));
  const d = dv / fval(q);
  return d > 0 && Math.abs(d - Math.round(d)) < 0.01 ? Math.round(d) : 0;
}
/** Barres de fin de section (reprise, fin alternative, double barre) : à droite de la mesure, ou à gauche pour un début. */
function barlineAt(meas, side) {
  return kids(meas, 'barline').some(bl => {
    const loc = bl.getAttribute('location') || 'right';
    if (loc !== side) return false;
    return !!(kid(bl, 'repeat') || kid(bl, 'ending') || /light-light|light-heavy|heavy-light|heavy-heavy/.test(txt(bl, 'bar-style')));
  });
}

/** Une seule voix ne peut pas jouer deux choses à la fois : fusionne les attaques simultanées, coupe les chevauchements. */
function normalize(evs, warnings) {
  const out = [];
  for (const e of evs) {
    const prev = out[out.length - 1];
    if (prev && fcmp(e.start, prev.start) === 0) {
      if (e.kind === 'note' && prev.kind === 'note') { for (const p of e.pitches) if (!prev.pitches.some(x => x.step === p.step && x.oct === p.oct)) prev.pitches.push(p); continue; }
      if (e.kind === 'rest') continue;
      if (prev.kind === 'rest') { out[out.length - 1] = e; continue; }
    }
    if (prev && fcmp(e.start, fadd(prev.start, prev.dur)) < 0) { warnings.add('Notes qui se chevauchent dans une même voix : certaines ont été ignorées.'); continue; }
    out.push(e);
  }
  return out;
}

function notePitch(el, pitchEl) {
  const ties = kids(el, 'tie').map(t => t.getAttribute('type'));
  return {
    step: (txt(pitchEl, 'step') || 'C').toUpperCase(),
    alter: Math.round(num(pitchEl, 'alter', 0)),
    oct: parseInt(txt(pitchEl, 'octave'), 10) || 4,
    tieStart: ties.includes('start'),
    tieStop: ties.includes('stop'),
  };
}
function beamOf(el) {
  const b = kids(el, 'beam').find(x => (x.getAttribute('number') || '1') === '1');
  return b ? b.textContent.trim() : '';
}
function collectNotations(el, ev) {
  for (const n of kids(el, 'notations')) {
    for (const c of n.children) {
      const name = c.localName;
      if (name === 'tuplet') { const t = c.getAttribute('type'); if (t === 'start') ev.tupStart = true; else if (t === 'stop') ev.tupStop = true; }
      else if (name === 'arpeggiate') ev.deco.push('!arpeggio!');
      else if (name === 'fermata') ev.deco.push('!fermata!');
      else if (name === 'ornaments') { for (const o of c.children) if (ORN[o.localName]) ev.deco.push(ORN[o.localName]); }
      else if (name === 'articulations') { for (const a of c.children) if (ART[a.localName]) ev.deco.push(ART[a.localName]); }
    }
  }
}
/** Silence (z) ou espace invisible (x) d'une durée quelconque. abcjs ne sait pas mettre d'espace invisible dans un n-olet. */
function spacer(q, sym) {
  if (q[0] <= 0) return '';
  let o = q[1];
  while (o % 2 === 0) o /= 2;
  if (o === 1) return binChunks(q).map(c => sym + lenStr(c)).join(' ');
  if (o > 9) return 'z' + lenStr(q); // durée exacte, sans figure exacte (abcjs ne lit pas les n-olets de plus de 9 notes)
  const p = o, r = 2 ** Math.floor(Math.log2(o));
  let chunks = binChunks(fmul(q, F(p, r)));
  if (chunks.length === 1) { const half = fmul(chunks[0], F(1, 2)); chunks = [half, half]; }
  if (chunks.length > 9) return 'z' + lenStr(q);
  return `(${p}:${r}:${chunks.length}` + chunks.map(c => 'z' + lenStr(c)).join('');
}

/* ------------------------------------------------------------------ */
/* Fichiers                                                            */
/* ------------------------------------------------------------------ */
function decodeText(u8) {
  if (u8[0] === 0xff && u8[1] === 0xfe) return new TextDecoder('utf-16le').decode(u8);
  if (u8[0] === 0xfe && u8[1] === 0xff) return new TextDecoder('utf-16be').decode(u8);
  return new TextDecoder('utf-8').decode(u8);
}
async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('fichier compressé (.mxl) non pris en charge ici : exporte la partition en MusicXML non compressé (.musicxml)');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
/** Extrait la partition d'une archive MusicXML compressée (.mxl). */
async function unzipMusicXml(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('archive .mxl illisible');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const entries = [];
  const utf8 = new TextDecoder();
  for (let i = 0; i < count && p + 46 <= u8.length; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    entries.push({ method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), off: dv.getUint32(p + 42, true), name: utf8.decode(u8.subarray(p + 46, p + 46 + nlen)) });
    p += 46 + nlen + xlen + clen;
  }
  const read = async e => {
    const start = e.off + 30 + dv.getUint16(e.off + 26, true) + dv.getUint16(e.off + 28, true);
    const data = u8.subarray(start, start + e.csize);
    if (e.method === 0) return decodeText(data);
    if (e.method === 8) return decodeText(await inflateRaw(data));
    throw new Error('compression de l’archive non prise en charge');
  };
  let target = null;
  const container = entries.find(e => e.name === 'META-INF/container.xml');
  if (container) {
    const m = (await read(container)).match(/full-path\s*=\s*"([^"]+)"/);
    if (m) target = entries.find(e => e.name === m[1]);
  }
  if (!target) target = entries.find(e => /\.(xml|musicxml)$/i.test(e.name) && !e.name.startsWith('META-INF'));
  if (!target) throw new Error('aucune partition dans l’archive');
  return read(target);
}

/** Lit un fichier choisi par l'utilisateur : { kind: 'musicxml' | 'abc', text }. */
export async function readScoreFile(file) {
  const buf = await file.arrayBuffer();
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0x50 && u8[1] === 0x4b) return { kind: 'musicxml', text: await unzipMusicXml(buf) }; // « PK » : archive .mxl
  const text = decodeText(u8);
  if (/<score-(partwise|timewise)[\s>]/.test(text.slice(0, 4000))) return { kind: 'musicxml', text };
  if (/^\s*K:/m.test(text) && /^\s*X:/m.test(text)) return { kind: 'abc', text };
  if (/\.mscz?$/i.test(file.name)) throw new Error('fichier MuseScore : dans MuseScore, fais Fichier → Exporter → MusicXML');
  if (/\.pdf$/i.test(file.name)) throw new Error('un PDF n’est pas lisible note à note : il faut un fichier MusicXML (export de MuseScore, par exemple)');
  throw new Error('format non reconnu : il faut un fichier MusicXML (.musicxml, .mxl) ou ABC');
}

/** Titre et tempo d'une partition ABC. */
export function abcInfo(abc) {
  const title = ((abc.match(/^T:\s*(.+)$/m) || [])[1] || '').trim();
  let qpm = null;
  const q = abc.match(/^Q:\s*(?:"[^"]*"\s*)?(?:(\d+)\/(\d+)\s*=\s*)?(\d+)/m);
  if (q) qpm = Math.round((+q[3]) * (q[1] ? (4 * q[1]) / q[2] : 1));
  return { title, qpm };
}

/** Accès pour les tests automatiques. */
export const _test = { representable, binChunks, spacer, lenStr, droppedEndings };
