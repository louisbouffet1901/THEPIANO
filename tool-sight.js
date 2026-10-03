// Lecture à vue : générateur d'extraits par niveau + entraînement (attente / en rythme).
import { h, esc, pick, randInt, shuffle, fmtPct, fmtNum, clamp, KEYS } from './util.js';
import { Score, Player, Follower, TempoReader } from './score.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard } from './diagrams.js';

/* ================================================================== */
/* Théorie minimale pour générer des extraits corrects                 */
/* ================================================================== */
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

function keyInfo(name) {
  const k = KEYS[name];
  const alts = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  if (k.sig > 0) SHARP_ORDER.slice(0, k.sig).forEach(l => { alts[l] = 1; });
  if (k.sig < 0) FLAT_ORDER.slice(0, -k.sig).forEach(l => { alts[l] = -1; });
  const tonicLetter = name.charAt(0);
  return { name, minor: k.mode === 'min', alts, tonicIdx: LETTERS.indexOf(tonicLetter), abc: k.abc, fr: k.fr };
}

// Une hauteur = indice diatonique absolu (octave*7 + lettre) + altération
const midiOf = (d, alt) => 12 * (Math.floor(d / 7) + 1) + LETTER_PC[((d % 7) + 7) % 7] + alt;
function degreePitch(key, degree, refD) {
  // renvoie l'indice diatonique de ce degré le plus proche de refD
  const letter = (key.tonicIdx + degree) % 7;
  let best = null;
  for (let oct = 1; oct <= 7; oct++) {
    const d = oct * 7 + letter;
    if (best == null || Math.abs(d - refD) < Math.abs(best - refD)) best = d;
  }
  return best;
}
function altFor(key, d, ctx = {}) {
  const letter = LETTERS[((d % 7) + 7) % 7];
  let alt = key.alts[letter];
  if (key.minor && ctx.leading) {
    const deg = ((d % 7) - key.tonicIdx + 7) % 7;
    if (deg === 6) alt += 1; // sensible
  }
  return alt;
}
const degOf = (key, d) => (((d % 7) - key.tonicIdx) % 7 + 7) % 7;

const CHORD_DEG = { I: 0, ii: 1, iii: 2, IV: 3, V: 4, vi: 5, i: 0, iv: 3, VI: 5, 'ii°': 1, V7: 4 };
const PLANS = {
  maj4: [['I', 'IV', 'V', 'I'], ['I', 'vi', 'V', 'I'], ['I', 'ii', 'V', 'I'], ['I', 'V', 'V', 'I'], ['I', 'IV', 'I', 'V']],
  min4: [['i', 'iv', 'V', 'i'], ['i', 'VI', 'V', 'i'], ['i', 'iv', 'i', 'V'], ['i', 'V', 'V', 'i']],
  maj8: [['I', 'IV', 'V', 'I', 'vi', 'ii', 'V', 'I'], ['I', 'V', 'vi', 'IV', 'I', 'IV', 'V', 'I']],
  min8: [['i', 'iv', 'V', 'i', 'VI', 'iv', 'V', 'i'], ['i', 'VI', 'iv', 'V', 'i', 'iv', 'V', 'i']],
};

/* Rythmes en doubles croches */
const RHY = {
  n1: { '4/4': [[8, 8], [4, 4, 4, 4], [4, 4, 8], [8, 4, 4], [4, 2, 2, 4, 4], [2, 2, 4, 4, 4], [12, 4], [4, 4, 2, 2, 4]], '3/4': [[4, 4, 4], [8, 4], [4, 2, 2, 4], [2, 2, 4, 4], [4, 8]] },
  n2: { '4/4': [[6, 2, 4, 4], [4, 6, 2, 4], [2, 2, 2, 2, 4, 4], [4, 4, 2, 2, 2, 2], [3, 1, 4, 4, 4], [4, 2, 2, 6, 2], [8, 4, 4], [4, 4, 4, 2, 2]], '3/4': [[6, 2, 4], [4, 2, 2, 2, 2], [2, 2, 2, 2, 4], [3, 1, 4, 4], [8, 2, 2]], '6/8': [[6, 6], [4, 2, 4, 2], [2, 2, 2, 6], [6, 2, 2, 2], [4, 2, 6]] },
};
const FINAL = { '4/4': [[16], [8, 8]], '3/4': [[12]], '6/8': [[12], [6, 6]] };
const BARLEN = { '4/4': 16, '3/4': 12, '6/8': 12 };
const STRONG = { '4/4': [0, 8], '3/4': [0], '6/8': [0, 6] };

export const SIGHT_PRESETS = {
  'n1-md': { level: 1, title: 'Niveau 1 · main droite', hands: 'rh', keys: ['C', 'G', 'F', 'Am', 'Dm'], meters: ['4/4', '3/4'], bars: 4, range: [60, 79], leap: 2, bpm: 66 },
  'n1-mg': { level: 1, title: 'Niveau 1 · main gauche', hands: 'lh', keys: ['C', 'G', 'F', 'Am', 'Dm'], meters: ['4/4', '3/4'], bars: 4, range: [43, 60], leap: 2, bpm: 66 },
  'n1-2m': { level: 1, title: 'Niveau 1 · deux mains (mélodie + basses)', hands: 'both', lh: ['bass-whole', 'bass-half'], keys: ['C', 'G', 'F', 'D', 'Am', 'Em', 'Dm'], meters: ['4/4', '3/4'], bars: 4, range: [60, 77], leap: 2, bpm: 60 },
  'n1-acc': { level: 1, title: 'Niveau 1 · deux mains (mélodie + accords)', hands: 'both', lh: ['chords-half', 'waltz'], keys: ['C', 'G', 'F', 'Am', 'Dm'], meters: ['4/4', '3/4'], bars: 4, range: [62, 79], leap: 2, bpm: 56 },
  'n2-md': { level: 2, title: 'Niveau 2 · une main, tonalités à 3–4 altérations', hands: 'rh', keys: ['A', 'E', 'Eb', 'Ab', 'F#m', 'C#m', 'Cm', 'Fm'], meters: ['4/4', '3/4', '6/8'], bars: 4, range: [60, 81], leap: 3, bpm: 72 },
  'n2-alb': { level: 2, title: 'Niveau 2 · deux mains (basse brisée)', hands: 'both', lh: ['alberti', 'broken'], keys: ['D', 'A', 'Bb', 'Eb', 'Em', 'Gm', 'Cm', 'Fm'], meters: ['4/4', '3/4'], bars: 4, range: [62, 81], leap: 3, bpm: 60 },
  'n2-8': { level: 2, title: 'Niveau 2 · deux mains, 8 mesures', hands: 'both', lh: ['bass-half', 'chords-half', 'waltz', 'alberti'], keys: ['G', 'D', 'A', 'F', 'Bb', 'Eb', 'Em', 'Dm', 'Gm', 'Cm'], meters: ['4/4', '3/4'], bars: 8, range: [60, 81], leap: 3, bpm: 60 },
};

/* ================================================================== */
/* Générateur                                                          */
/* ================================================================== */
export function generateExcerpt(presetId, opts = {}) {
  const P = SIGHT_PRESETS[presetId];
  const keyName = opts.key || pick(P.keys);
  const key = keyInfo(keyName);
  const meter = opts.meter || pick(P.meters.filter(m => P.level >= 2 || m !== '6/8'));
  const barLen = BARLEN[meter];
  const plans = PLANS[(key.minor ? 'min' : 'maj') + (P.bars === 8 ? 8 : 4)];
  const plan = pick(plans);
  const rhyPool = (RHY['n' + P.level][meter]) || RHY.n1[meter];
  // --- mélodie (ou ligne de basse si main gauche seule)
  const isLH = P.hands === 'lh';
  const [lo, hi] = P.range;
  const center = Math.round((lo + hi) / 2);
  let refD = Math.round((center - 12) / 12 * 7) + 1;
  const melody = [];
  let prevD = null;
  plan.forEach((ch, bi) => {
    const last = bi === plan.length - 1;
    const rh = last ? pick(FINAL[meter]) : pick(rhyPool);
    let pos = 0;
    const root = CHORD_DEG[ch];
    const leading = key.minor && (ch === 'V' || ch === 'V7');
    rh.forEach((dur, ni) => {
      let d;
      const strong = STRONG[meter].includes(pos);
      const chordTones = [root, (root + 2) % 7, (root + 4) % 7];
      if (prevD == null) {
        d = degreePitch(key, pick([0, 2, 4]), refD);
      } else if (last && ni === 0) {
        d = degreePitch(key, 0, prevD); // finit sur la tonique
      } else if (!last && bi === plan.length - 2 && ni === rh.length - 1) {
        // note avant la fin : sensible ou 2e degré
        d = degreePitch(key, pick([1, 6]), prevD);
      } else if (strong) {
        const cands = chordTones.map(dg => degreePitch(key, dg, prevD)).filter(x => Math.abs(x - prevD) <= P.leap + 1);
        d = cands.length ? pick(cands) : degreePitch(key, root, prevD);
      } else {
        const step = pick([1, -1, 1, -1, P.leap >= 2 ? 2 : 1, P.leap >= 2 ? -2 : -1]);
        d = prevD + step;
      }
      // tenir dans la tessiture
      let m = midiOf(d, altFor(key, d, { leading }));
      let guard = 0;
      while ((m < lo || m > hi) && guard++ < 6) { d += m < lo ? 2 : -2; m = midiOf(d, altFor(key, d, { leading })); }
      // éviter la seconde augmentée en mineur (6e degré ↔ sensible)
      if (key.minor && prevD != null) {
        const a = degOf(key, d), b = degOf(key, prevD);
        if ((a === 5 && b === 6) || (a === 6 && b === 5)) { d = prevD + (d > prevD ? 2 : -2); }
      }
      melody.push({ d, dur, bar: bi, pos, leading });
      prevD = d;
      pos += dur;
    });
  });
  // --- main gauche
  const lhNotes = [];
  if (P.hands === 'both') {
    const pattern = opts.lh || pick(P.lh.filter(p => meter === '3/4' || p !== 'waltz'));
    let prevChord = null;
    plan.forEach((ch, bi) => {
      const root = CHORD_DEG[ch];
      const leading = key.minor && (ch === 'V' || ch === 'V7');
      const rootD = degreePitch(key, root, 3 * 7 + 0); // vers do2-sol2
      let bassD = rootD;
      while (midiOf(bassD, 0) > 52) bassD -= 7;
      while (midiOf(bassD, 0) < 41) bassD += 7;
      const third = bassD + 2, fifth = bassD + 4;
      const close = (() => { // accord serré proche du précédent, entre sol2 et mi3
        const opts3 = [[bassD + 7, bassD + 9, bassD + 11], [bassD + 9, bassD + 11, bassD + 14], [bassD + 4, bassD + 7, bassD + 9]];
        const cand = opts3.filter(c => midiOf(c[0], 0) >= 48 && midiOf(c[2], 0) <= 64);
        const pool = cand.length ? cand : [opts3[0]];
        if (!prevChord) return pool[0];
        return pool.sort((a, b) => Math.abs(a[0] - prevChord[0]) - Math.abs(b[0] - prevChord[0]))[0];
      })();
      prevChord = close;
      const n = (ds, dur) => lhNotes.push({ ds, dur, bar: bi, leading });
      if (pattern === 'bass-whole' || bi === plan.length - 1 && pattern !== 'waltz') n([bassD], barLen);
      else if (pattern === 'bass-half') {
        if (meter === '3/4') n([bassD], 12);
        else { n([bassD], 8); n([pick([bassD, fifth - 7 >= bassD - 3 ? fifth - 7 : bassD])], 8); }
      } else if (pattern === 'chords-half') {
        if (meter === '3/4') n(close, 12); else { n(close, 8); n(close, 8); }
      } else if (pattern === 'waltz') {
        n([bassD], 4); n(close, 4); n(close, 4);
      } else if (pattern === 'alberti') {
        const [a, b, c] = close;
        const seq = meter === '3/4' ? [a, c, b, c, b, c] : [a, c, b, c, a, c, b, c];
        seq.forEach(x => n([x], 2));
      } else if (pattern === 'broken') {
        const seq = meter === '3/4' ? [bassD, fifth, bassD + 7, fifth, bassD + 7, fifth] : [bassD, fifth, bassD + 7, bassD + 9, bassD + 7, fifth, bassD + 7, fifth];
        seq.forEach(x => n([x], 2));
      }
    });
  }
  // --- écriture ABC
  const rhAbc = isLH ? null : toAbc(melody.map(x => ({ ds: [x.d], dur: x.dur, bar: x.bar, leading: x.leading })), key, barLen, P.bars);
  const lhAbc = isLH ? toAbc(melody.map(x => ({ ds: [x.d], dur: x.dur, bar: x.bar, leading: x.leading })), key, barLen, P.bars)
    : (P.hands === 'both' ? toAbc(lhNotes, key, barLen, P.bars) : null);
  let abc = `X:1\nM:${meter}\nL:1/16\nK:${key.abc}\n`;
  if (rhAbc && lhAbc) {
    abc = `X:1\nM:${meter}\nL:1/16\n%%score {RH | LH}\nV:RH clef=treble\nV:LH clef=bass\nK:${key.abc}\n[V:RH] ${rhAbc}\n[V:LH] ${lhAbc}\n`;
  } else if (lhAbc) {
    abc = `X:1\nM:${meter}\nL:1/16\nK:${key.abc} clef=bass\n${lhAbc}\n`;
  } else {
    abc += rhAbc + '\n';
  }
  return { abc, key: key.fr, meter, bpm: P.bpm, tracks: rhAbc && lhAbc ? ['rh', 'lh'] : [isLH ? 'lh' : 'rh'], hands: P.hands };
}

function toAbc(notes, key, barLen, bars) {
  let out = '';
  let bar = -1;
  let state = {};
  for (const n of notes) {
    if (n.bar !== bar) {
      if (bar >= 0) out += ' | ';
      bar = n.bar; state = {};
    }
    const parts = n.ds.map(d => {
      const alt = altFor(key, d, { leading: n.leading });
      const letter = LETTERS[((d % 7) + 7) % 7];
      const oct = Math.floor(d / 7);
      const sigAlt = key.alts[letter];
      const k = letter + oct;
      let acc = '';
      const cur = state[k] ?? sigAlt;
      if (alt !== cur) { acc = alt === 1 ? '^' : alt === -1 ? '_' : '='; state[k] = alt; }
      const name = oct >= 5 ? letter.toLowerCase() + "'".repeat(oct - 5) : letter + ','.repeat(4 - oct);
      return acc + name;
    });
    const durStr = n.dur === 1 ? '' : String(n.dur);
    out += (parts.length > 1 ? `[${parts.join('')}]` : parts[0]) + durStr + ' ';
  }
  return out.trim() + ' |]';
}

/* ================================================================== */
/* Interface d'entraînement                                            */
/* ================================================================== */
export function mountSight(el, cfg = {}) {
  let preset = cfg.preset || 'n1-md';
  const presets = cfg.presets || Object.keys(SIGHT_PRESETS);
  const frame = h('div', { class: 'w-frame' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Lecture à vue'));
  const sel = h('select', { 'aria-label': 'Niveau de lecture', style: { marginLeft: 'auto', minHeight: '34px', borderRadius: '8px', border: '1px solid var(--line-strong)', padding: '0 8px', background: '#fff' } },
    ...presets.map(p => h('option', { value: p, selected: p === preset }, SIGHT_PRESETS[p].title)));
  if (presets.length > 1) head.append(sel);
  const body = h('div', { class: 'w-body' });
  const scoreHost = h('div');
  const foot = h('div', { class: 'w-foot' });
  const status = h('div', { class: 'score-status' });
  const results = h('div', { class: 'result-strip' });
  frame.append(head, body, foot);
  body.append(scoreHost);
  el.append(frame);

  let ex, score, player, follower, reader, vk = null, prepTimer = null;
  let bpm = SIGHT_PRESETS[preset].bpm;
  let mask = false;

  const newExcerpt = () => {
    stopAll();
    ex = generateExcerpt(preset);
    score = new Score(scoreHost, ex.abc, { tracks: ex.tracks, staffwidth: 700 });
    player = new Player(score, {});
    results.innerHTML = '';
    status.textContent = `${capitalizeFirst(ex.key)} · ${ex.meter}. Regarde d’abord : armure, mesure, motifs, notes difficiles.`;
  };
  const stopAll = () => {
    clearInterval(prepTimer); prepTimer = null;
    player?.stop(); follower?.stop(); reader?.stop();
    follower = reader = null;
    [waitBtn, tempoBtn, prepBtn].forEach(b => b.classList.remove('on'));
  };
  const needInput = () => {
    if (midi.status !== 'ready' && !vk) { status.textContent = 'Branche le piano (pastille en haut) ou affiche le clavier à l’écran.'; return false; }
    return true;
  };

  const newBtn = h('button', { class: 'btn primary', type: 'button' }, 'Nouvel extrait');
  const prepBtn = h('button', { class: 'btn', type: 'button', title: '30 secondes pour lire avant de jouer, puis départ en rythme' }, 'Préparer 30 s puis jouer');
  const waitBtn = h('button', { class: 'btn', type: 'button' }, 'Mode attente');
  const tempoBtn = h('button', { class: 'btn', type: 'button' }, 'En rythme');
  const listenBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Écouter');
  const kbBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Clavier');
  const out = h('output', {}, `♩ = ${bpm}`);
  const rng = h('input', { type: 'range', min: 30, max: 140, value: bpm });
  rng.addEventListener('input', () => { bpm = +rng.value; out.textContent = (score?.beatQ === 1.5 ? '♩. = ' : '♩ = ') + bpm; });
  const maskBox = h('input', { type: 'checkbox' });
  maskBox.addEventListener('change', () => { mask = maskBox.checked; });
  const ctrl = h('div', { class: 'score-ctrl' }, newBtn, prepBtn, tempoBtn, waitBtn, listenBtn, kbBtn,
    h('label', { class: 'range' }, 'Tempo', rng, out),
    h('label', { class: 'check', title: 'La mesure que tu joues s’efface : oblige à lire en avance' }, maskBox, 'Regard en avant'));
  foot.append(ctrl, h('div', { style: { width: '100%' } }, status, results));

  newBtn.addEventListener('click', newExcerpt);
  sel.addEventListener('change', () => { preset = sel.value; bpm = SIGHT_PRESETS[preset].bpm; rng.value = bpm; out.textContent = '♩ = ' + bpm; newExcerpt(); });
  listenBtn.addEventListener('click', async () => {
    if (player.playing) { player.stop(); return; }
    stopAll();
    player.set({ qpm: bpm * score.beatQ, hands: 'both' });
    await player.play();
  });
  const runTempo = async () => {
    if (!needInput()) return;
    stopAll(); score.clear(); results.innerHTML = '';
    tempoBtn.classList.add('on');
    status.textContent = 'Une mesure de décompte, puis joue sans t’arrêter, même si tu te trompes.';
    let curBar = -1;
    reader = new TempoReader(score, {
      qpm: bpm * score.beatQ,
      onTime: (q) => {
        if (!mask) return;
        const bar = Math.floor((q + 0.25 * score.beatQ) / score.barQ);
        if (bar !== curBar) {
          score.clear('masked');
          curBar = bar;
          for (const e of score.events) if (Math.floor(e.t / score.barQ) === bar && e.char != null) score.mark(e.char, 'masked');
          score.svgHost.classList.add('mask-current');
        }
      },
      onDone: res => {
        score.clear('masked'); score.svgHost.classList.remove('mask-current');
        tempoBtn.classList.remove('on'); reader = null;
        status.textContent = 'Vert : juste et dans le temps · orange : juste mais décalé · rouge : manquée.';
        results.innerHTML = `<span>Notes justes <b>${fmtPct(res.accuracy)}</b></span><span>Dans le temps <b>${fmtPct(res.precision)}</b></span><span>Écart moyen <b>${fmtNum(res.meanAbsMs)} ms</b></span>`;
        store.push('stats.sight', { id: preset, mode: 'tempo', bpm, at: Date.now(), ...res });
        renderHistory();
      },
    });
    await reader.start();
  };
  tempoBtn.addEventListener('click', () => { if (reader) { stopAll(); status.textContent = ''; return; } runTempo(); });
  prepBtn.addEventListener('click', () => {
    if (prepTimer) { stopAll(); status.textContent = ''; return; }
    if (!needInput()) return;
    stopAll();
    prepBtn.classList.add('on');
    let left = cfg.prepSeconds || 30;
    status.textContent = `Lecture silencieuse : ${left} s. Repère l’armure, la mesure, les motifs, les sauts.`;
    prepTimer = setInterval(() => {
      left--;
      status.textContent = `Lecture silencieuse : ${left} s. Repère l’armure, la mesure, les motifs, les sauts.`;
      if (left <= 0) { clearInterval(prepTimer); prepTimer = null; prepBtn.classList.remove('on'); runTempo(); }
    }, 1000);
  });
  waitBtn.addEventListener('click', () => {
    if (follower) { stopAll(); status.textContent = ''; return; }
    if (!needInput()) return;
    stopAll(); score.clear(); results.innerHTML = '';
    waitBtn.classList.add('on');
    follower = new Follower(score, {
      hands: 'both',
      onStep: (i, n) => { status.textContent = `Note ${i + 1} / ${n}`; },
      onDone: res => {
        waitBtn.classList.remove('on'); follower = null;
        status.textContent = 'Terminé.';
        results.innerHTML = `<span><b>${res.clean}</b> / ${res.steps} sans faute</span><span><b>${res.errors}</b> erreur${res.errors > 1 ? 's' : ''}</span><span><b>${fmtNum(res.seconds)}</b> s</span>`;
        store.push('stats.sight', { id: preset, mode: 'wait', at: Date.now(), ...res });
        renderHistory();
      },
    });
    follower.start();
  });
  kbBtn.addEventListener('click', () => {
    if (vk) { vk.remove(); vk = null; kbBtn.classList.remove('on'); return; }
    const isLH = SIGHT_PRESETS[preset].hands === 'lh', both = SIGHT_PRESETS[preset].hands === 'both';
    vk = h('div', { class: 'vkbd' });
    vk.append(keyboard({ from: both || isLH ? 36 : 55, to: both ? 84 : isLH ? 64 : 84, interactive: true, names: 'c', height: 110, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) }));
    body.append(vk);
    kbBtn.classList.add('on');
  });

  const hist = h('div', { class: 'small', style: { padding: '0 14px 12px' } });
  frame.append(hist);
  const renderHistory = () => {
    const list = (store.get('stats.sight') || []).filter(s => s.id === preset && s.mode === 'tempo').slice(-6);
    hist.innerHTML = list.length ? 'Derniers essais en rythme : ' + list.map(s => `<b>${fmtPct(s.accuracy)}</b> à ${s.bpm}`).join(' · ') : '';
  };

  newExcerpt();
  renderHistory();
  return () => stopAll();
}

const capitalizeFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
