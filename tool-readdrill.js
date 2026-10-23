// Lecture d'intervalles et d'accords chronométrée (V7.1) : une minute pour lire, puis jouer d'un geste, le plus
// d'intervalles (ou d'accords) justes. On ne les nomme pas : on lit la forme sur la portée et on joue les touches.
// Ceux qui ralentissent ou qui sont ratés reviennent plus souvent (statistiques par catégorie, gardées sur l'appareil).
// Même présentation que la lecture de notes chronométrée (tool-notespeed.js), dont les styles sont repris.
import { h, esc, fmtPct } from './util.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { keyboard } from './diagrams.js';
import { lineChart } from './charts.js';

const DURATION = 60; // secondes
const dur = () => (typeof window !== 'undefined' && window.__nsDuration) || DURATION; // durée réduite pour les tests automatiques

/* ------------------------------------------------------------------ */
/* Notes écrites : lettre (0 = do … 6 = si), altération (−1, 0, 1), octave scientifique (do central = 4) */
/* ------------------------------------------------------------------ */
const STEP_ST = [0, 2, 4, 5, 7, 9, 11];
const NAMES = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'];
const dia = n => n.oct * 7 + n.l; // position sur la portée
const fromDia = (d, a = 0) => ({ l: ((d % 7) + 7) % 7, oct: Math.floor(d / 7), a });
export const midiOf = n => (n.oct + 1) * 12 + STEP_ST[n.l] + n.a;
const up = (n, k) => ({ ...fromDia(dia(n) + k), a: 0 });
function abcOf(n) {
  const acc = n.a === 1 ? '^' : n.a === -1 ? '_' : '';
  const L = 'CDEFGAB'[n.l];
  return acc + (n.oct >= 5 ? L.toLowerCase() + "'".repeat(n.oct - 5) : L + ','.repeat(4 - n.oct));
}
/** Nom français, octave comprise (do3 = do central). */
export const nameOf = n => `${NAMES[n.l]}${n.a === 1 ? '♯' : n.a === -1 ? '♭' : ''}${n.oct - 1}`;
// altérations retenues (les plus courantes) : do♯, ré♭, mi♭, fa♯, sol♯, la♭, si♭
const ACC_OK = [1, -1, -1, 1, 1, -1, -1];
// portée et une ligne supplémentaire : clé de sol do3 – la4 ; clé de fa mi1 – do3
const RANGE = { treble: [28, 40], bass: [16, 28] };

/* ------------------------------------------------------------------ */
/* Intervalles                                                          */
/* ------------------------------------------------------------------ */
const IV_NAMES = { 2: 'secondes', 3: 'tierces', 4: 'quartes', 5: 'quintes', 6: 'sixtes', 7: 'septièmes', 8: 'octaves' };
const IV_ST = { 2: [1, 2], 3: [3, 4], 4: [5, 6], 5: [6, 7], 6: [8, 9], 7: [10, 11], 8: [12] }; // écarts admis (demi-tons)

/** Un intervalle d'une catégorie { size, harm } : deux notes écrites, dans la clé tirée. */
export function genInterval(conf, cat, rnd = Math.random) {
  const clef = conf.clef === 'both' ? (rnd() < 0.5 ? 'treble' : 'bass') : conf.clef;
  const [lo, hi] = RANGE[clef];
  for (let k = 0; k < 60; k++) {
    const d0 = lo + Math.floor(rnd() * (hi - (cat.size - 1) - lo + 1));
    const a = fromDia(d0), b = fromDia(d0 + cat.size - 1);
    if (conf.acc) {
      if (rnd() < 0.35) a.a = ACC_OK[a.l];
      b.a = cat.size === 8 ? a.a : rnd() < 0.35 ? ACC_OK[b.l] : 0;
    }
    if (!IV_ST[cat.size].includes(midiOf(b) - midiOf(a))) continue;
    const down = !cat.harm && rnd() < 0.4;
    return { kind: 'intervals', clef, notes: [a, b], order: down ? [b, a] : [a, b], harm: cat.harm, size: cat.size, cat: ivKey(cat) };
  }
  return null;
}
const ivKey = c => `i${c.size}${c.harm ? 'h' : 'm'}`;
const ivLabel = key => { const m = key.match(/^i(\d)([hm])$/); return m ? `${IV_NAMES[m[1]]} ${m[2] === 'h' ? 'ensemble' : 'l’une après l’autre'}` : key; };

/* ------------------------------------------------------------------ */
/* Accords                                                              */
/* ------------------------------------------------------------------ */
const QUAL = { M: [4, 7], m: [3, 7], d: [3, 6], 7: [4, 7, 10] };
const TYPE_NAMES = { M: 'majeurs', m: 'mineurs', d: 'diminués', 7: 'septièmes de dominante' };
const TYPE_ONE = { M: 'majeur', m: 'mineur', d: 'diminué', 7: 'septième de dominante' };
const INV_NAMES = ['état fondamental', '1er renversement', '2e renversement', '3e renversement'];
// fondamentales : do majeur sans altération ; avec altérations, les accords les plus courants des tonalités voisines
const R = (l, a = 0) => ({ l, a });
const ROOTS = {
  nat: { M: [R(0), R(3), R(4)], m: [R(1), R(2), R(5)], d: [R(6)], 7: [R(4)] },
  acc: { M: [R(1), R(2), R(5), R(6, -1), R(2, -1), R(5, -1), R(1, -1)], m: [R(0), R(3), R(4), R(6), R(3, 1), R(0, 1)], d: [R(4, 1), R(0, 1)], 7: [R(1), R(5), R(2), R(0), R(3), R(6, -1)] },
};
/** Notes de l'accord à l'état fondamental, en position serrée, à partir d'une fondamentale à l'octave 4. */
function spell(root, type) {
  const r = { ...root, oct: 4 };
  const out = [r];
  for (let k = 0; k < QUAL[type].length; k++) {
    const n = up(r, 2 * (k + 1));
    n.a = QUAL[type][k] - (midiOf(n) - midiOf(r));
    if (Math.abs(n.a) > 1) return null;
    out.push(n);
  }
  return out;
}
/** Un accord d'une catégorie { type, inv } : notes écrites (du grave à l'aigu), dans la clé de la main tirée. */
export function genChord(conf, cat, rnd = Math.random) {
  const hand = conf.hand === 'both' ? (rnd() < 0.5 ? 'rh' : 'lh') : conf.hand;
  const clef = hand === 'lh' ? 'bass' : 'treble';
  const [lo, hi] = RANGE[clef];
  const pool = [...ROOTS.nat[cat.type], ...(conf.acc ? ROOTS.acc[cat.type] : [])];
  for (let k = 0; k < 40; k++) {
    const root = pool[Math.floor(rnd() * pool.length)];
    const base = spell(root, cat.type);
    if (!base) continue;
    // renversement : les premières notes montent d'une octave
    const notes = base.map((n, i) => (i < cat.inv ? { ...n, oct: n.oct + 1 } : n)).sort((a, b) => dia(a) - dia(b));
    const span = dia(notes[notes.length - 1]) - dia(notes[0]);
    const shifts = [];
    for (let s = -3; s <= 2; s++) { const d0 = dia(notes[0]) + 7 * s; if (d0 >= lo && d0 + span <= hi) shifts.push(s); }
    if (!shifts.length) continue;
    const s = shifts[Math.floor(rnd() * shifts.length)];
    const placed = notes.map(n => ({ ...n, oct: n.oct + s }));
    return { kind: 'chords', clef, hand, notes: placed, order: placed, harm: true, type: cat.type, inv: cat.inv, root, cat: chKey(cat) };
  }
  return null;
}
const chKey = c => `c${c.type}${c.inv}`;
const chLabel = key => { const m = key.match(/^c([Mmd7])(\d)$/); return m ? `${TYPE_NAMES[m[1]]}, ${INV_NAMES[+m[2]]}` : key; };
const chordName = it => `${NAMES[it.root.l]}${it.root.a === 1 ? '♯' : it.root.a === -1 ? '♭' : ''}${it.type === '7' ? '7' : ' ' + TYPE_ONE[it.type]}, ${INV_NAMES[it.inv]}`;

/** La partition d'un intervalle ou d'un accord (ABC) : deux noires l'une après l'autre, ou une ronde. */
export function itemAbc(it) {
  const body = it.harm ? `[${it.notes.map(abcOf).join('')}]4` : `${abcOf(it.order[0])}2 ${abcOf(it.order[1])}2`;
  return `X:1\nL:1/4\nK:C clef=${it.clef}\n${body}|]`;
}

/* ------------------------------------------------------------------ */
/* Réglages, catégories, repères                                        */
/* ------------------------------------------------------------------ */
const KINDS = {
  intervals: {
    title: 'Lecture d’intervalles chronométrée', sub: 'une minute, le plus d’intervalles justes possible', unit: ['intervalle', 'intervalles'],
    defaults: () => ({ clef: 'treble', sizes: '2-5', mode: 'mel', acc: false }),
    cats: c => {
      const sizes = c.sizes === '2-8' ? [2, 3, 4, 5, 6, 7, 8] : [2, 3, 4, 5];
      const modes = c.mode === 'both' ? [false, true] : [c.mode === 'harm'];
      return sizes.flatMap(size => modes.map(harm => ({ size, harm })));
    },
    gen: genInterval, label: ivLabel,
    target: c => (c.sizes === '2-8' ? 24 : 30) - (c.acc ? 5 : 0),
    key: c => `${c.clef}:${c.sizes}:${c.mode}${c.acc ? '+acc' : ''}`,
    describe: c => `${{ treble: 'clé de sol', bass: 'clé de fa', both: 'les deux clés' }[c.clef]}, de la seconde à ${c.sizes === '2-8' ? 'l’octave' : 'la quinte'}, ${{ mel: 'l’une après l’autre', harm: 'ensemble', both: 'l’une après l’autre ou ensemble' }[c.mode]}${c.acc ? ', avec altérations' : ''}`,
    tip: 'Lis l’écart, pas les noms. Tierce, quinte, septième : de ligne à ligne, ou d’interligne à interligne (une, deux ou trois lignes plus haut). Seconde, quarte, sixte, octave : d’une ligne à un interligne. Sous la main, la forme reste la même dans toutes les tonalités ; joue les deux notes d’un geste.',
    next: c => (c.mode === 'mel' ? 'les intervalles « ensemble »' : c.sizes === '2-5' ? 'les intervalles jusqu’à l’octave' : !c.acc ? 'les altérations' : c.clef !== 'both' ? 'les deux clés' : null),
  },
  chords: {
    title: 'Lecture d’accords chronométrée', sub: 'une minute, le plus d’accords justes possible', unit: ['accord', 'accords'],
    defaults: lvl => ({ hand: 'rh', inv: 'root', acc: false, sev: lvl === 'n2' }),
    cats: c => {
      const invs = c.inv === 'all' ? [0, 1, 2] : [0];
      const out = ['M', 'm'].flatMap(type => invs.map(inv => ({ type, inv })));
      out.push({ type: 'd', inv: 0 });
      if (c.sev) for (const inv of (c.inv === 'all' ? [0, 1, 2, 3] : [0])) out.push({ type: '7', inv });
      return out;
    },
    gen: genChord, label: chLabel,
    target: c => (c.inv === 'all' ? 15 : 20) - (c.acc ? 3 : 0) - (c.sev ? 2 : 0),
    key: c => `${c.hand}:${c.inv}${c.acc ? '+acc' : ''}${c.sev ? '+7' : ''}`,
    describe: c => `${{ rh: 'main droite (clé de sol)', lh: 'main gauche (clé de fa)', both: 'les deux mains' }[c.hand]}, ${c.inv === 'all' ? 'état fondamental et renversements' : 'état fondamental'}${c.sev ? ', avec la septième de dominante' : ''}${c.acc ? ', avec altérations' : ''}`,
    tip: 'Lis la forme, d’un coup d’œil. Trois notes sur trois lignes, ou sur trois interlignes, de suite : état fondamental. Un trou dans la pile (une quarte) : un renversement, et la note juste au-dessus du trou est la fondamentale. Dans la septième de dominante renversée, deux notes collées (une seconde) : celle du haut est la fondamentale. Pose les trois doigts ensemble.',
    next: c => (c.inv === 'root' ? 'les renversements' : c.hand === 'rh' ? 'la main gauche' : !c.acc ? 'les altérations' : !c.sev ? 'la septième de dominante' : c.hand !== 'both' ? 'les deux mains' : null),
  },
};

/* ------------------------------------------------------------------ */
/* Le widget                                                            */
/* ------------------------------------------------------------------ */
export function mountReadDrill(el, opts = {}) {
  const kind = opts.kind === 'chords' ? 'chords' : 'intervals';
  const K = KINDS[kind];
  const path = `readdrill.${kind}`;
  const saved = () => store.get(path) || {};
  const conf = { ...K.defaults(opts.level), ...(saved().conf || {}) };
  const frame = h('div', { class: 'w-frame notespeed readdrill' + (opts.bare ? ' ns-bare' : '') });
  const body = h('div', { class: 'w-body' });
  if (!opts.bare) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, K.title), h('span', { class: 'w-sub' }, K.sub)));
  frame.append(body);
  el.append(frame);
  const save = patch => store.set(path, { ...saved(), ...patch });

  /* ---------- réglages ---------- */
  let running = false;
  const seg = (label, key, items) => {
    const box = h('div', { class: 'seg', role: 'group', 'aria-label': label });
    for (const [v, l] of items) {
      const b = h('button', { type: 'button', class: conf[key] === v ? 'on' : '' }, l);
      b.addEventListener('click', () => { if (running) return; conf[key] = v; box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); save({ conf: { ...conf } }); renderIdle(); });
      box.append(b);
    }
    return h('label', { class: 'field inline' }, label, box);
  };
  const check = (label, key) => {
    const cb = h('input', { type: 'checkbox', checked: !!conf[key] });
    cb.addEventListener('change', () => { if (running) { cb.checked = !!conf[key]; return; } conf[key] = cb.checked; save({ conf: { ...conf } }); renderIdle(); });
    return h('label', { class: 'check small' }, cb, label);
  };
  const settings = h('div', { class: 'score-ctrl ns-settings' }, ...(kind === 'intervals'
    ? [seg('Clé', 'clef', [['treble', 'Sol'], ['bass', 'Fa'], ['both', 'Les deux']]),
      seg('Intervalles', 'sizes', [['2-5', '2 à 5'], ['2-8', '2 à 8']]),
      seg('Notes', 'mode', [['mel', 'L’une après l’autre'], ['harm', 'Ensemble'], ['both', 'Les deux']]),
      check('Altérations', 'acc')]
    : [seg('Main', 'hand', [['rh', 'Droite'], ['lh', 'Gauche'], ['both', 'Les deux']]),
      seg('Accords', 'inv', [['root', 'Fondamental'], ['all', '+ renversements']]),
      check('Septième de dominante', 'sev'),
      check('Altérations', 'acc')]));
  const info = h('p', { class: 'small ns-info' });
  const tip = h('p', { class: 'small muted ns-tip' }, K.tip);
  const startBtn = h('button', { class: 'btn primary', type: 'button' }, 'Commencer (1 minute)');
  const idle = h('div', { class: 'ns-idle' }, settings, info, tip, h('div', { class: 'btn-row' }, startBtn));

  /* ---------- pendant la minute ---------- */
  const timeBar = h('div', { class: 'progress ns-time' }, h('i'));
  const counter = h('div', { class: 'ns-count' });
  const staff = h('div', { class: 'ns-staff', 'aria-live': 'polite' });
  const fb = h('div', { class: 'ns-fb' });
  const inputHost = h('div', { class: 'ns-input' });
  const stopBtn = h('button', { class: 'btn ghost sm', type: 'button' }, 'Arrêter');
  const stage = h('div', { class: 'ns-stage', hidden: true }, h('div', { class: 'ns-top' }, counter, stopBtn), timeBar, staff, fb, inputHost);
  const results = h('div', { class: 'ns-results', hidden: true });
  body.append(idle, stage, results);

  const history = () => saved().history || [];
  const best = () => history().filter(x => x.key === K.key(conf)).reduce((a, x) => Math.max(a, x.npm), 0);
  const renderIdle = () => {
    const b = best();
    const target = K.target(conf);
    info.innerHTML = `${esc(K.describe(conf))}. `
      + (b ? `Ton record : <b>${b} ${K.unit[1]} justes par minute</b> · repère : ${target}.` : `Repère d’une lecture déjà fluide : ${target} ${K.unit[1]} justes par minute.`)
      + (midi.status !== 'ready' ? ' Piano non connecté : un clavier s’affiche à l’écran.' : '');
  };

  /* ---------- choix : les catégories lentes et ratées reviennent plus souvent ---------- */
  const stats = () => saved().stats || {};
  const chooseCat = (cats, lastKey) => {
    const S = stats();
    const seen = Object.values(S).filter(x => x.n > x.err);
    const avg = seen.length ? seen.reduce((a, x) => a + x.rt / (x.n - x.err), 0) / seen.length : 2500;
    const w = cats.map(c => {
      const key = kind === 'intervals' ? ivKey(c) : chKey(c);
      const s = S[key];
      const base = key === lastKey && cats.length > 2 ? 0.35 : 1; // pas trop souvent deux fois la même catégorie
      if (!s || !s.n) return 1.4 * base;
      const rt = s.n > s.err ? s.rt / (s.n - s.err) : avg * 1.5;
      return base * (1 + 3 * (s.err / s.n) + Math.max(0, rt / avg - 1) * 1.5);
    });
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < cats.length; i++) { r -= w[i]; if (r <= 0) return cats[i]; }
    return cats[cats.length - 1];
  };
  const record = (key, ok, rt) => {
    const S = { ...stats() };
    const s = { ...(S[key] || { n: 0, rt: 0, err: 0 }) };
    s.n++; if (ok) s.rt += rt; else s.err++;
    if (s.n > 40) { s.n /= 2; s.rt /= 2; s.err /= 2; } // garder surtout les essais récents
    S[key] = s;
    save({ stats: S });
  };

  /* ---------- la minute ---------- */
  let cur = null, shownAt = 0, locked = false, t0 = 0, raf = 0, timers = [], offMidi = null, session = null, played = null, firstOn = 0;
  const draw = it => {
    staff.innerHTML = '';
    const div = h('div');
    staff.append(div);
    try { window.ABCJS.renderAbc(div, itemAbc(it), { staffwidth: 170, scale: 2, paddingtop: 0, paddingbottom: 0, paddingleft: 0, paddingright: 0, add_classes: true }); }
    catch (e) { div.textContent = it.order.map(nameOf).join(' – '); }
  };
  const next = () => {
    let it = null;
    for (let k = 0; k < 8 && !it; k++) it = K.gen(conf, chooseCat(session.cats, cur && cur.cat));
    cur = it;
    if (!cur) { finish(false); return; }
    draw(cur);
    shownAt = performance.now();
    locked = false; played = new Set(); firstOn = 0;
    fb.textContent = ''; fb.className = 'ns-fb';
  };
  const answer = (ok, given = null) => {
    if (!running || locked || !cur) return;
    const rt = performance.now() - shownAt;
    record(cur.cat, ok, rt);
    session.items.push({ cat: cur.cat, ok, rt });
    locked = true;
    if (ok) {
      session.ok++;
      fb.textContent = '✓'; fb.className = 'ns-fb ok';
      timers.push(setTimeout(next, 150));
    } else {
      session.err++;
      const what = cur.order.map(nameOf).join(' – ');
      fb.innerHTML = `C’était <b>${esc(what)}</b>${kind === 'chords' ? ` (${esc(chordName(cur))})` : ''}${given ? ` : tu as joué ${esc(given)}` : ''}`;
      fb.className = 'ns-fb bad';
      timers.push(setTimeout(next, 1300));
    }
    counter.innerHTML = `<b>${session.ok}</b> juste${session.ok > 1 ? 's' : ''} · ${session.err} erreur${session.err > 1 ? 's' : ''}`;
  };
  // une note jouée : fausse → erreur ; toutes les notes de l'intervalle ou de l'accord → réussi
  const onNote = m => {
    if (!running || !cur || locked) return;
    const want = new Set(cur.notes.map(midiOf));
    if (!want.has(m)) {
      const flats = cur.notes.some(n => n.a === -1);
      const names = [...played].concat(m).map(x => noteFr(x, flats)).join(', ');
      answer(false, names);
      return;
    }
    if (!played.size) firstOn = performance.now();
    played.add(m);
    if (played.size === want.size) answer(true);
  };
  const buildInput = () => {
    inputHost.innerHTML = '';
    if (midi.status === 'ready') return;
    const [lo, hi] = conf.clef === 'bass' || conf.hand === 'lh' ? [40, 62] : conf.clef === 'both' || conf.hand === 'both' ? [40, 84] : [59, 84];
    inputHost.append(h('div', { class: 'quiz-kbd' }, keyboard({ from: lo, to: hi, interactive: true, names: 'c', height: 96, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) })));
  };
  const start = async () => {
    if (running) return;
    try { await audio.ensure(); } catch (e) { /* le son n'est pas indispensable */ }
    session = { cats: K.cats(conf), ok: 0, err: 0, items: [], key: K.key(conf) };
    running = true;
    idle.hidden = true; results.hidden = true; stage.hidden = false;
    buildInput();
    counter.textContent = 'Prêt…';
    offMidi = midi.on('noteon', ev => onNote(ev.note));
    let k = 3;
    staff.innerHTML = `<div class="ns-go">${k}</div>`;
    const tick = () => {
      k--;
      if (!running) return;
      if (k > 0) { staff.innerHTML = `<div class="ns-go">${k}</div>`; timers.push(setTimeout(tick, 700)); return; }
      t0 = performance.now();
      counter.innerHTML = '<b>0</b> juste · 0 erreur';
      next();
      const frameFn = () => {
        if (!running) return;
        const left = Math.max(0, dur() - (performance.now() - t0) / 1000);
        timeBar.firstChild.style.width = `${left / dur() * 100}%`;
        timeBar.classList.toggle('low', left < 10);
        if (left <= 0) { finish(true); return; }
        raf = requestAnimationFrame(frameFn);
      };
      raf = requestAnimationFrame(frameFn);
    };
    timers.push(setTimeout(tick, 700));
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout); timers = [];
    offMidi?.(); offMidi = null;
    cur = null;
  };
  const finish = complete => {
    const elapsed = Math.min(dur(), (performance.now() - t0) / 1000);
    stop();
    stage.hidden = true; idle.hidden = false;
    if (!complete || !session || elapsed < Math.min(20, dur())) { results.hidden = true; renderIdle(); return; }
    const npm = Math.round(session.ok * 60 / dur());
    const okItems = session.items.filter(x => x.ok);
    const avgMs = okItems.length ? okItems.reduce((a, x) => a + x.rt, 0) / okItems.length : null;
    const prevBest = best();
    const hist = history().concat({ at: Date.now(), key: session.key, ok: session.ok, err: session.err, npm, avgMs: avgMs ? Math.round(avgMs) : null }).slice(-300);
    save({ history: hist });
    const by = new Map();
    for (const x of session.items) { const o = by.get(x.cat) || { name: K.label(x.cat), n: 0, err: 0, rt: 0, ok: 0 }; o.n++; if (x.ok) { o.ok++; o.rt += x.rt; } else o.err++; by.set(x.cat, o); }
    const slow = [...by.values()].filter(o => o.ok).sort((a, b) => b.rt / b.ok - a.rt / a.ok).slice(0, 2);
    const missed = [...by.values()].filter(o => o.err).sort((a, b) => b.err - a.err).slice(0, 3);
    const acc = session.ok + session.err ? session.ok / (session.ok + session.err) : 0;
    const target = K.target(conf);
    const nextStep = K.next(conf);
    results.innerHTML = '';
    results.append(h('h4', { class: 'an-sub' }, 'Résultat'), h('div', { class: 'an-grid' },
      h('div', { class: 'stat' }, h('div', { class: 'l' }, `${K.unit[1][0].toUpperCase()}${K.unit[1].slice(1)} justes par minute`), h('div', { class: 'v' }, String(npm))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Justesse'), h('div', { class: 'v' }, fmtPct(acc))),
      h('div', { class: 'stat' }, h('div', { class: 'l' }, `Temps moyen par ${K.unit[0]}`), h('div', { class: 'v' }, avgMs ? `${(avgMs / 1000).toFixed(1).replace('.', ',')} s` : '—'))));
    const verdict = npm > prevBest && prevBest > 0 ? `Nouveau record (ancien : ${prevBest}).` : !prevBest ? 'Premier score enregistré pour ce réglage.' : `Record : ${prevBest}.`;
    const advice = acc < 0.85 ? 'Trop d’erreurs : prends le temps de lire la forme avant de jouer (vise 90 % de justes), la vitesse viendra ensuite.'
      : npm >= target ? `Au-dessus du repère (${target}) : ${nextStep ? `ajoute ${nextStep}.` : 'garde ce réglage, une minute par jour.'}`
      : `Repère : ${target} ${K.unit[1]} justes par minute. Une minute par jour suffit : la vitesse monte en quelques semaines.`;
    results.append(h('p', { class: 'small' }, `${verdict} ${advice}`));
    if (slow.length || missed.length) {
      results.append(h('ul', { class: 'ns-weak small' },
        slow.length ? h('li', {}, 'Les plus lents : ', h('b', {}, slow.map(o => `${o.name} (${(o.rt / o.ok / 1000).toFixed(1).replace('.', ',')} s)`).join(' ; '))) : null,
        missed.length ? h('li', {}, 'Ratés : ', h('b', {}, missed.map(o => o.name).join(' ; ')), ' : ils reviendront plus souvent.') : null));
    }
    const since = Date.now() - 30 * 864e5;
    const days = new Map();
    for (const x of hist) if (x.key === session.key && x.at >= since) { const d = new Date(x.at).toDateString(); days.set(d, Math.max(days.get(d) || 0, x.npm)); }
    if (days.size >= 2) {
      const entries = [...days.entries()];
      results.append(lineChart({ values: entries.map(e => e[1]), tips: entries.map(e => `${new Date(e[0]).toLocaleDateString('fr-FR')} : ${e[1]} par minute`), title: 'Meilleur score par jour (30 jours)', yMin: 0, band: [target, Math.max(target + 1, ...entries.map(e => e[1]))] }));
    }
    results.hidden = false;
    renderIdle();
    opts.onFinish?.({ npm, acc, kind });
  };
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', () => finish(false));
  renderIdle();
  // accès de test (automatisation)
  window.__readDrill = { get cur() { return cur; }, get running() { return running; }, midis: () => (cur ? cur.notes.map(midiOf) : []) };
  return () => stop();
}

const NOTE_SHARP = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
const NOTE_FLAT = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];
const noteFr = (m, flats) => `${(flats ? NOTE_FLAT : NOTE_SHARP)[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 2}`;
