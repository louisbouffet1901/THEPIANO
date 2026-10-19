// Exercices des leçons de théorie (V6) :
//  - « À toi » (mountCheck) : quelques questions, corrigées à l'instant, avec la raison de la réponse ;
//  - « Construis au clavier » (mountBuild) : une gamme, un accord ou un intervalle, note par note, au piano ou sur
//    le clavier de l'écran ; chaque note est vérifiée et l'écart est compté sur les touches (1, 2, 3…) ;
//  - « Sur la partition » (mountSpot) : toucher la note demandée dans un extrait de la pièce.
// Chaque exercice terminé envoie l'événement « exo-done » : l'étape de la leçon qui le contient est alors cochée.
import { h, esc, shuffle } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { keyboard } from './diagrams.js';
import { parseSeq } from './widgets.js';
import * as T from './theory.js';

const PLAY = '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor"/></svg>';
const signalDone = (el, detail) => el.dispatchEvent(new CustomEvent('exo-done', { bubbles: true, detail }));
// couleurs des touches : claires sur les touches blanches, foncées sur les noires (le nom y reste lisible, en blanc)
const COLORS = { ok: ['#cfe6d7', '#2e7d4f'], given: ['#f2d9a8', '#a8741f'], hint: ['#f6e3b8', '#c99a3e'], bad: ['#f3c9c4', '#b3261e'] };
const isBlackKey = m => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
const col = (kind, m) => COLORS[kind][isBlackKey(m) ? 1 : 0];

/* ------------------------------------------------------------------ */
/* Son                                                                 */
/* ------------------------------------------------------------------ */
let timers = [];
function stopSound() { timers.forEach(clearTimeout); timers = []; audio.stopAll('lesson'); }
/** Joue [{ m, t, d, v }] (secondes) ; kb : clavier à animer. */
async function playList(list, kb) {
  stopSound();
  audio.claim('lesson', stopSound);
  try { await audio.ensure(); } catch (e) { return; }
  const t0 = audio.now() + 0.05;
  for (const n of list) {
    const v = audio.noteOn(n.m, n.v || 74, t0 + n.t, { owner: 'lesson' });
    if (v) audio.noteOff(v, t0 + n.t + n.d);
    if (kb) {
      timers.push(setTimeout(() => kb.press(n.m, true), Math.max(0, audio.ctxToPerf(t0 + n.t) - performance.now())));
      timers.push(setTimeout(() => kb.press(n.m, false), Math.max(0, audio.ctxToPerf(t0 + n.t + n.d * 0.9) - performance.now())));
    }
  }
}
function playSeqString(seq, bpm = 72, kb = null) {
  const { events } = parseSeq(seq);
  const spb = 60 / bpm;
  const list = [];
  for (const e of events) e.notes.forEach((m, k) => list.push({ m, t: e.t * spb + (e.arp ? k * 0.07 : 0), d: Math.max(0.15, e.d * spb * 0.95), v: e.notes.length > 1 ? 60 : 74 }));
  return playList(list, kb);
}

/* ------------------------------------------------------------------ */
/* Clavier : étiquettes et comptage des demi-tons                      */
/* ------------------------------------------------------------------ */
const SVGNS = 'http://www.w3.org/2000/svg';
function keyGeom(kb, m) {
  const k = kb.querySelector(`[data-m="${m}"]`);
  if (!k) return null;
  const x = +k.getAttribute('x'), y = +k.getAttribute('y'), w = +k.getAttribute('width'), hh = +k.getAttribute('height');
  return { x, y, w, h: hh, black: k.classList.contains('bk') };
}
/** Étiquettes sur les touches : [{ m, text, pos: 'bottom' | 'top', color }] (le groupe cls est remplacé). */
function labelKeys(kb, items, cls) {
  kb.querySelectorAll(`text.${cls}`).forEach(t => t.remove());
  for (const it of items) {
    const g = keyGeom(kb, it.m);
    if (!g) continue;
    const t = document.createElementNS(SVGNS, 'text');
    t.setAttribute('class', cls);
    t.setAttribute('x', g.x + g.w / 2);
    const top = it.pos === 'top';
    t.setAttribute('y', top ? g.y + (g.black ? 12 : 14) : g.y + g.h - (g.black ? 8 : 9));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', top ? (g.black ? 9 : 10.5) : (g.black ? 9 : 11));
    t.setAttribute('font-weight', top ? '700' : '600');
    t.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    t.setAttribute('fill', it.color || (g.black ? '#fff' : '#2c3138'));
    t.textContent = it.text;
    kb.append(t);
  }
}
/** Numérote les demi-tons de a (exclu) à b (inclus) : 1, 2, 3… */
function countKeys(kb, a, b, color) {
  const dir = b >= a ? 1 : -1;
  const items = [];
  for (let m = a + dir, k = 1; dir > 0 ? m <= b : m >= b; m += dir, k++) items.push({ m, text: String(k), pos: 'top', color });
  labelKeys(kb, items, 'cnt');
}
/** Étendue de clavier lisible autour de notes MIDI. */
function rangeFor(ms, minWhites = 15) {
  let lo = Math.min(...ms) - 2, hi = Math.max(...ms) + 2;
  while ([1, 3, 6, 8, 10].includes(((lo % 12) + 12) % 12)) lo--;
  while ([1, 3, 6, 8, 10].includes(((hi % 12) + 12) % 12)) hi++;
  const whites = () => { let n = 0; for (let m = lo; m <= hi; m++) if (![1, 3, 6, 8, 10].includes(m % 12)) n++; return n; };
  let side = 0;
  while (whites() < minWhites && hi - lo < 40) { if (side++ % 2) { lo--; while ([1, 3, 6, 8, 10].includes(lo % 12)) lo--; } else { hi++; while ([1, 3, 6, 8, 10].includes(hi % 12)) hi++; } }
  return [Math.max(21, lo), Math.min(108, hi)];
}

/* ------------------------------------------------------------------ */
/* ABC d'une suite de notes écrites                                    */
/* ------------------------------------------------------------------ */
const ACC_ABC = { '-2': '__', '-1': '_', 0: '', 1: '^', 2: '^^' };
export function abcNote(n, explicitNatural = false) {
  const L = 'CDEFGAB'[n.l];
  const sci = (n.o ?? 3) + 1;
  return (n.a === 0 && explicitNatural ? '=' : ACC_ABC[n.a]) + (sci >= 5 ? L.toLowerCase() + "'".repeat(sci - 5) : L + ','.repeat(Math.max(0, 4 - sci)));
}
function staffAbc(notes, { chord = false, clef } = {}) {
  const avg = notes.reduce((s, n) => s + T.midiOf(n), 0) / notes.length;
  const c = clef || (avg < 57 ? 'bass' : 'treble');
  const seen = new Map();
  const body = chord ? `[${notes.map(n => abcNote(n)).join('')}]4` : notes.map(n => {
    const key = `${n.l}:${n.o}`;
    const nat = n.a === 0 && seen.has(key) && seen.get(key) !== 0;
    seen.set(key, n.a);
    return abcNote(n, nat);
  }).join(' ');
  return `X:1\nL:1/4\nK:C clef=${c}\n${body} |]`;
}
function renderStaff(host, abc, width = 300) {
  if (!window.ABCJS) return;
  host.innerHTML = '';
  window.ABCJS.renderAbc(host, abc, { responsive: 'resize', staffwidth: width, scale: 1.25, paddingtop: 0, paddingbottom: 0, paddingleft: 4, paddingright: 4 });
}

/* ------------------------------------------------------------------ */
/* Le piano : un seul exercice à l'écoute à la fois (le dernier touché) */
/* ------------------------------------------------------------------ */
let focus = null;
const focusWatchers = new Set();
function setFocus(w) { focus = w; focusWatchers.forEach(fn => { try { fn(); } catch (e) { /* */ } }); }

/* ================================================================== */
/* « À toi » : questions corrigées à l'instant                         */
/* ================================================================== */
export function mountCheck(el, cfg) {
  const qs0 = (cfg.questions || []).filter(Boolean);
  const frame = h('div', { class: 'w-frame lx lx-check' });
  const count = h('span', { class: 'w-sub' });
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'À toi'), count));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  let qs = [], i = 0, firstOk = 0, cleanup = [];
  const start = () => {
    qs = qs0.slice(); // l'ordre des questions suit la progression voulue
    i = 0; firstOk = 0;
    show();
  };
  const show = () => {
    cleanup.forEach(f => f()); cleanup = [];
    stopSound();
    body.innerHTML = '';
    if (i >= qs.length) return finish();
    const q = qs[i];
    count.textContent = qs.length > 1 ? `${i + 1} / ${qs.length}` : '';
    body.append(h('div', { class: 'lx-q', html: q.q }));
    if (q.abc) {
      const st = h('div', { class: 'lx-staff' });
      body.append(st);
      try { renderStaff(st, q.abc, q.abcWidth || 300); } catch (e) { console.warn(e); }
    }
    let kb = null;
    if (q.kbd) { kb = keyboard({ names: 'none', height: 92, ...q.kbd }); body.append(h('div', { class: 'lx-kbd' }, kb)); }
    if (q.seq) {
      const b = h('button', { class: 'btn sm', type: 'button', html: PLAY + ' ' + esc(q.seqLabel || 'Écouter') });
      b.addEventListener('click', () => playSeqString(q.seq, q.bpm || 72, kb));
      body.append(h('div', { class: 'btn-row lx-row' }, b));
      if (q.autoplay) { const t = setTimeout(() => playSeqString(q.seq, q.bpm || 72, kb), 300); cleanup.push(() => clearTimeout(t)); }
    }
    const right = typeof q.answer === 'number' ? q.options[q.answer] : (q.answer ?? q.options[0]);
    const opts = q.keepOrder ? q.options.slice() : shuffle(q.options.slice());
    const grid = h('div', { class: 'quiz-answers lx-answers' + (opts.some(o => String(o).length > 22) ? ' wide' : '') });
    const fb = h('div', { class: 'quiz-feedback' });
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true }, i + 1 < qs.length ? 'Question suivante' : 'Terminer');
    next.addEventListener('click', () => { i++; show(); });
    let tries = 0, over = false;
    for (const o of opts) {
      const b = h('button', { class: 'btn', type: 'button', html: String(o) });
      b.addEventListener('click', () => {
        if (over || b.classList.contains('wrong')) return;
        tries++;
        if (o === right) {
          b.classList.add('right');
          over = true;
          if (tries === 1) firstOk++;
          fb.className = 'quiz-feedback ok';
          fb.innerHTML = (tries === 1 ? '<b>Exact.</b> ' : '<b>Oui.</b> ') + (q.why || '');
          next.hidden = false;
          if (q.after) playSeqString(q.after, q.bpm || 72, kb);
        } else {
          b.classList.add('wrong');
          const last = tries >= 2 || opts.length <= 2;
          fb.className = 'quiz-feedback bad';
          if (last) {
            over = true;
            [...grid.children].forEach(x => { if (x.dataset.v === '1') x.classList.add('right'); });
            fb.innerHTML = `<b>La réponse : ${right}.</b> ${q.why || ''}`;
            next.hidden = false;
          } else {
            fb.innerHTML = `<b>Pas tout à fait.</b> ${q.hint || 'Relis l’exemple juste au-dessus, puis réessaie.'}`;
          }
        }
      });
      if (o === right) b.dataset.v = '1';
      grid.append(b);
    }
    body.append(grid, fb, next);
  };
  const finish = () => {
    count.textContent = '';
    const again = h('button', { class: 'btn sm', type: 'button' }, 'Recommencer');
    again.addEventListener('click', start);
    const all = firstOk === qs.length;
    body.append(h('div', { class: 'lx-done' + (all ? ' ok' : '') },
      h('b', {}, all ? (qs.length > 1 ? `${qs.length} sur ${qs.length} du premier coup.` : 'Réussi du premier coup.') : `${firstOk} sur ${qs.length} du premier coup.`),
      h('span', { class: 'small' }, all ? ' C’est acquis : passe à la suite.' : ' Relis l’explication des questions manquées, puis recommence : c’est en se trompant qu’on retient.'),
      again));
    signalDone(el, { ok: firstOk, n: qs.length });
  };
  start();
  return () => { cleanup.forEach(f => f()); stopSound(); };
}

/* ================================================================== */
/* « Construis au clavier »                                            */
/* ================================================================== */
const STEP_SHORT = { 1: '½', 2: 'T', 3: 'T½' };
const MODE_LABEL = { maj: 'majeur', natMin: 'mineur (forme naturelle)', harmMin: 'mineur (forme harmonique)', melMin: 'mineur (forme mélodique, en montant)' };
const scaleLabel = (tonic, mode) => `${T.noteName(tonic)} ${MODE_LABEL[mode]}`;
const CHORD_LABEL = { M: 'majeur', m: 'mineur', dim: 'diminué', aug: 'augmenté', '7': '7 (septième de dominante)', maj7: 'maj7 (septième majeure)', m7: 'm7 (septième mineure)', hdim7: 'ø7 (demi-diminué)', dim7: '°7 (septième diminuée)' };
const PART = ['fondamentale', 'tierce', 'quinte', 'septième'];
/** Nom d'une note dans une tonalité : un bécarre explicite quand il annule l'armure (mi♮ en fa mineur). */
function namer(sig) {
  if (!sig || !sig.list.length) return n => T.noteName(n);
  const alt = new Map(sig.list.map(x => { const p = T.parseNote(x); return [p.l, p.a]; }));
  return n => T.noteName(n) + (n.a === 0 && alt.has(n.l) ? '♮' : '');
}
/** Prépare une tâche : notes données d'emblée, puis les étapes à jouer, chacune avec sa note de référence. */
function prepare(task) {
  const P = T.parseNote;
  const tk = { ...task };
  tk.nm = n => T.noteName(n);
  if (tk.kind === 'scale') {
    const tonic = P(tk.tonic.match(/\d/) ? tk.tonic : tk.tonic + '3');
    const sc = T.scale(tonic, tk.mode || 'maj');
    // en mineur, l'armure est connue (celle de la relative) : la sensible s'écrit avec son bécarre (mi♮ en fa mineur)
    if (tk.mode && tk.mode !== 'maj') tk.nm = namer(T.keySignature(tonic, 'min'));
    tk.notes = sc;
    tk.given = [0];
    tk.steps = sc.slice(1).map((n, k) => {
      const semis = T.midiOf(n) - T.midiOf(sc[k]);
      return { idx: k + 1, note: n, ref: sc[k], semis, label: T.stepName(semis), short: STEP_SHORT[semis] || semis };
    });
    const kname = scaleLabel(tonic, tk.mode || 'maj');
    tk.title = tk.prompt || `Construis la gamme de <b>${kname}</b>, en montant : la tonique est déjà là.`;
    tk.done = `${kname[0].toUpperCase()}${kname.slice(1)} : ${sc.map(n => tk.nm(n)).join(' – ')}.`;
    const alt = sc.slice(0, 7).filter(n => n.a !== 0).map(n => T.noteName(n));
    if (!tk.mode || tk.mode === 'maj') tk.done += alt.length ? ` ${alt.length} altération${alt.length > 1 ? 's' : ''} : ${alt.join(', ')}.` : ' Aucune altération.';
    return tk;
  }
  if (tk.kind === 'chord') {
    let root, q, roman = null;
    if (tk.degree) {
      const tonic = P(tk.key.match(/\d/) ? tk.key : tk.key + '3');
      const tri = T.triadOn(tonic, tk.mode || 'maj', tk.degree, { seventh: !!tk.seventh });
      root = tri.root; q = tri.q; roman = tri.roman;
      tk.keyLabel = T.keyName(tonic, tk.mode || 'maj');
      if (tk.mode === 'min') tk.nm = namer(T.keySignature(tonic, 'min'));
    } else { root = P(tk.root.match(/\d/) ? tk.root : tk.root + '3'); q = tk.q || 'M'; }
    const notes = T.chord(root, q);
    tk.notes = notes;
    tk.given = [0];
    tk.steps = notes.slice(1).map((n, k) => {
      const iv = T.interval(root, n);
      return { idx: k + 1, note: n, ref: root, semis: iv.semis, label: iv.name, part: PART[k + 1] };
    });
    const nm = `${T.noteName(root)} ${CHORD_LABEL[q]}`;
    tk.title = tk.prompt || (tk.degree ? `Joue l’accord du <b>${tk.degree}<sup>e</sup> degré</b> de ${tk.keyLabel} : sa fondamentale est déjà là.` : `Construis l’accord de <b>${nm}</b> : la fondamentale est déjà là.`);
    tk.done = tk.doneText || `${tk.degree ? `Degré ${tk.degree} de ${tk.keyLabel} : ${roman}, ` : `${nm[0].toUpperCase()}${nm.slice(1)}`}${tk.degree ? nm : ''} : ${notes.map(n => tk.nm(n)).join(' – ')}.`;
    tk.isChord = true;
    return tk;
  }
  if (tk.kind === 'interval') {
    const from = P(tk.from.match(/\d/) ? tk.from : tk.from + '3');
    const dir = tk.dir || 'up';
    const to = T.transpose(from, tk.iv, dir);
    const iv = T.parseIv(tk.iv);
    tk.notes = [from, to];
    tk.given = [0];
    const tons = tk.talk === 'tons' || tk.talk === 'semis';
    const label = tk.talk === 'semis' ? `${iv.semis} demi-ton${iv.semis > 1 ? 's' : ''}` : tons ? T.stepName(iv.semis) : T.ivName(iv.number, iv.q);
    tk.steps = [{ idx: 1, note: to, ref: from, semis: dir === 'up' ? iv.semis : -iv.semis, label }];
    tk.title = tk.prompt || `Joue la note ${tons ? `à <b>${label}</b>` : `à la <b>${label}</b>`} ${dir === 'up' ? 'au-dessus' : 'au-dessous'} de <b>${T.noteName(from)}</b>.`;
    tk.done = tk.doneText || (tons ? `${T.noteName(from)} → ${T.noteName(to)} : ${label}.` : `${T.noteName(from)} → ${T.noteName(to)} : ${label} (${iv.semis} demi-tons).`);
    return tk;
  }
  // kind 'notes' : une suite libre de notes à trouver
  const notes = tk.notes.map(x => P(x.match(/\d/) ? x : x + '3'));
  tk.notes = notes;
  tk.given = tk.givenFirst ? [0] : [];
  const start = tk.givenFirst ? 1 : 0;
  tk.steps = notes.slice(start).map((n, k) => ({ idx: k + start, note: n, ref: start + k > 0 ? notes[start + k - 1] : null, semis: start + k > 0 ? T.midiOf(n) - T.midiOf(notes[start + k - 1]) : 0, label: (tk.labels || [])[k + start] || '' }));
  tk.title = tk.prompt;
  tk.done = tk.doneText || notes.map(n => T.noteName(n)).join(' – ');
  return tk;
}

export function mountBuild(el, cfg) {
  const tasks = (cfg.tasks || []).map(prepare);
  const me = { el };
  const frame = h('div', { class: 'w-frame lx lx-build' });
  const count = h('span', { class: 'w-sub' });
  const pianoTag = h('span', { class: 'tag accent lx-piano', hidden: true }, 'piano à l’écoute');
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Construis au clavier'), count, pianoTag));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  let ti = 0, clean = 0, cur = null;
  const refreshTag = () => { pianoTag.hidden = !(focus === me && midi.status === 'ready'); };
  focusWatchers.add(refreshTag);
  frame.addEventListener('pointerdown', () => { if (focus !== me) setFocus(me); }, true);
  if (!focus || !document.body.contains(focus.el)) setFocus(me);

  const runTask = () => {
    stopSound();
    body.innerHTML = '';
    if (ti >= tasks.length) return finish();
    const tk = tasks[ti];
    count.textContent = tasks.length > 1 ? `${ti + 1} / ${tasks.length}` : '';
    const guide = tk.guide || cfg.guide || 'full';
    const ms = tk.notes.map(n => T.midiOf(n));
    // touches assez larges pour le doigt : environ 32 px par touche blanche sur un écran étroit
    const fit = Math.max(9, Math.min(15, Math.floor((frame.clientWidth || 700) / 32)));
    const [lo, hi] = rangeFor(ms, Math.min(fit, tk.isChord ? 13 : 15));
    const kb = keyboard({ from: lo, to: hi, names: 'c', height: 104, interactive: true, label: 'Clavier : touche les notes',
      onDown: m => { audio.ensure().then(() => audio.noteOn(m, 84, 0, { owner: 'lesson-key' })).catch(() => {}); handle(m); },
      onUp: m => audio.noteOff(m) });
    const prompt = h('div', { class: 'lx-q', html: tk.title });
    const strip = h('div', { class: 'lx-strip' });
    const nextHint = h('div', { class: 'lx-next small' });
    const fb = h('div', { class: 'quiz-feedback lx-fb' });
    const staff = h('div', { class: 'lx-staff', hidden: true });
    const row = h('div', { class: 'btn-row lx-row' });
    const listen = h('button', { class: 'btn sm', type: 'button', html: PLAY + ' Écouter le résultat', hidden: true });
    const redo = h('button', { class: 'btn sm ghost', type: 'button' }, 'Recommencer');
    const nextBtn = h('button', { class: 'btn primary', type: 'button', hidden: true }, ti + 1 < tasks.length ? 'Suivant' : 'Terminer');
    row.append(nextBtn, listen, redo);
    body.append(prompt, strip, h('div', { class: 'lx-kbd' }, kb), nextHint, fb, staff, row);
    if (midi.status === 'ready') body.append(h('p', { class: 'small muted lx-src' }, 'Joue sur ton piano, ou touche les notes à l’écran.'));
    let k = 0, errs = 0, errsHere = 0, finished = false;
    const placed = new Map(); // midi -> nom
    tk.given.forEach(g => placed.set(ms[g], tk.nm(tk.notes[g])));
    const steps = tk.steps;
    const drawStrip = () => {
      strip.innerHTML = '';
      if (tk.kind === 'scale') {
        if (guide === 'none' && !finished) { strip.hidden = true; return; }
        strip.hidden = false;
        steps.forEach((s, j) => strip.append(h('span', { class: 'lx-chip' + (j < k ? ' ok' : j === k && !finished ? ' cur' : ''), title: s.label }, String(s.short))));
      } else if (tk.isChord) {
        strip.hidden = false;
        strip.append(h('span', { class: 'lx-chip ok' }, `${tk.nm(tk.notes[0])} · fondamentale`));
        steps.forEach((s, j) => strip.append(h('span', { class: 'lx-chip' + (j < k ? ' ok' : j === k && !finished ? ' cur' : '') }, j < k || guide !== 'none' ? `${s.part} : ${s.label}${guide === 'full' || j < k ? ` (${s.semis})` : ''}` : s.part)));
      } else strip.hidden = true;
    };
    const drawKeys = (extra = []) => {
      const marks = [...placed.keys()].map(m => ({ m, color: col(tk.given.some(g => ms[g] === m) ? 'given' : 'ok', m) }));
      kb.setMarks([...marks, ...extra]);
      labelKeys(kb, [...placed.entries()].map(([m, t]) => ({ m, text: t })), 'nm');
    };
    const sayNext = () => {
      if (finished || k >= steps.length) { nextHint.textContent = ''; return; }
      const s = steps[k];
      if (tk.kind === 'scale') nextHint.innerHTML = guide === 'full' ? `Note suivante : <b>${s.label}</b> au-dessus de ${tk.nm(s.ref)}, sur le nom <b>${T.LETTERS_FR[s.note.l]}</b>.` : guide === 'half' ? `Note suivante : le nom <b>${T.LETTERS_FR[s.note.l]}</b> (avec ou sans altération ?).` : 'Note suivante ?';
      else if (tk.isChord) nextHint.innerHTML = guide === 'none' ? `Joue la <b>${s.part}</b>.` : `Joue la <b>${s.part}</b> : ${s.label}, soit <b>${s.semis} demi-tons</b> au-dessus de ${tk.nm(s.ref)}.`;
      else if (tk.kind === 'interval' && (tk.talk === 'tons' || tk.talk === 'semis')) nextHint.innerHTML = guide === 'none' ? '' : `Compte les touches à partir de ${tk.nm(s.ref)} : une touche voisine (blanche ou noire) = un demi-ton.`;
      else if (tk.kind === 'interval') nextHint.innerHTML = guide === 'none' ? '' : `Compte : ${T.parseIv(tk.iv).number} noms de notes et <b>${Math.abs(s.semis)} demi-tons</b> à partir de ${tk.nm(s.ref)}.`;
      else nextHint.innerHTML = s.label ? `À trouver : <b>${s.label}</b>.` : '';
    };
    drawStrip(); drawKeys(); sayNext();
    const showHint = s => {
      drawKeys([{ m: T.midiOf(s.note), color: col('hint', T.midiOf(s.note)) }]);
      labelKeys(kb, [...placed.entries()].map(([m, t]) => ({ m, text: t })).concat([{ m: T.midiOf(s.note), text: '?' }]), 'nm');
    };
    const handle = m => {
      if (finished) return;
      const s = steps[k];
      if (!s) return;
      const want = T.midiOf(s.note);
      const ok = ((m - want) % 12 + 12) % 12 === 0;
      const refM = s.ref ? T.midiOf(s.ref) : null;
      if (ok) {
        placed.set(want, tk.nm(s.note));
        if (refM != null) countKeys(kb, refM, want, '#2e7d4f');
        let msg = '';
        if (tk.kind === 'scale') {
          msg = `${tk.nm(s.ref)} → <b>${tk.nm(s.note)}</b> : ${s.label} ✓`;
          const black = [1, 3, 6, 8, 10].includes(want % 12);
          if (s.note.a !== 0) {
            const enh = T.spellNear(want, { l: (s.note.l + (s.note.a > 0 ? 1 : 6)) % 7, a: 0, o: s.note.o });
            const other = tk.nm(enh);
            msg += black && other !== tk.nm(s.note) ? ` On l’écrit <b>${tk.nm(s.note)}</b>, pas ${other} : la gamme prend chaque nom de note une fois (${T.LETTERS_FR[s.ref.l]}, puis ${T.LETTERS_FR[s.note.l]}).` : ` C’est le nom <b>${T.LETTERS_FR[s.note.l]}</b>, altéré pour respecter l’écart.`;
          }
        } else if (tk.talk === 'tons' || tk.talk === 'semis') {
          msg = `${tk.nm(s.ref)} → <b>${tk.nm(s.note)}</b> : ${s.label} ✓`;
          if (s.note.a !== 0 && s.note.l !== s.ref.l) msg += ` Le nom suivant est ${T.LETTERS_FR[s.note.l]} ; il faut l’altérer pour avoir ${s.label} : <b>${tk.nm(s.note)}</b>.`;
        } else if (tk.isChord || tk.kind === 'interval') {
          msg = `${tk.nm(s.ref)} → <b>${tk.nm(s.note)}</b> : ${Math.abs(s.semis)} demi-tons, ${s.label} ✓`;
        } else msg = `<b>${tk.nm(s.note)}</b> ✓`;
        fb.className = 'quiz-feedback ok lx-fb';
        fb.innerHTML = msg;
        k++; errsHere = 0;
        drawKeys();
        if (k >= steps.length) return complete();
        drawStrip(); sayNext();
      } else {
        errs++; errsHere++;
        let msg;
        let shown = m;
        if (tk.kind === 'scale') {
          const d = ((m - refM) % 12 + 12) % 12;
          shown = refM + (d || 12);
          const played = T.spellNear(shown, s.note);
          if (d === 0) msg = `Tu as rejoué ${tk.nm(s.ref)}. La gamme avance : la note suivante porte le nom <b>${T.LETTERS_FR[s.note.l]}</b>.`;
          else msg = `${tk.nm(s.ref)} → ${tk.nm(played)} : ${T.stepName(d)}. Ici, il faut <b>${s.label}</b>.`;
          countKeys(kb, refM, shown, '#b3261e');
        } else if (tk.isChord || tk.kind === 'interval') {
          const up = s.semis >= 0;
          const dist = up ? ((m - refM) % 12 + 12) % 12 : ((refM - m) % 12 + 12) % 12;
          shown = up ? refM + dist : refM - dist;
          const played = T.spellNear(shown, s.note);
          if (!dist) msg = `Tu as rejoué ${tk.nm(s.ref)}, la note de départ. Il faut <b>${Math.abs(s.semis)} demi-tons</b> ${up ? 'au-dessus' : 'au-dessous'} (${s.label}).`;
          else if (tk.talk === 'tons') msg = `${tk.nm(s.ref)} → ${tk.nm(played)} : ${T.stepName(dist)}. Il faut <b>${s.label}</b>.`;
          else if (tk.talk === 'semis') msg = `${tk.nm(s.ref)} → ${tk.nm(played)} : ${dist} demi-ton${dist > 1 ? 's' : ''}. Il en faut <b>${Math.abs(s.semis)}</b>, ${up ? 'vers la droite' : 'vers la gauche'}.`;
          else {
            const iv = up ? T.interval(s.ref, played) : T.interval(played, s.ref);
            msg = `${tk.nm(s.ref)} → ${tk.nm(played)} : ${dist} demi-ton${dist > 1 ? 's' : ''}${iv && iv.number <= 8 ? `, ${iv.name}` : ''}. Il en faut <b>${Math.abs(s.semis)}</b> (${s.label}).`;
          }
          countKeys(kb, refM, shown, '#b3261e');
        } else {
          const played = T.spellNear(m, s.note);
          const d = ((want - m) % 12 + 12) % 12;
          if (played.l === s.note.l) msg = `Presque : c’est ${tk.nm(played)}. Il faut <b>${s.label || tk.nm(s.note)}</b>, la touche juste ${d <= 6 ? 'à droite' : 'à gauche'}.`;
          else msg = `C’est ${tk.nm(played)}. La note cherchée (<b>${s.label || tk.nm(s.note)}</b>) est plus ${d <= 6 ? 'aiguë, à droite' : 'grave, à gauche'}.`;
        }
        drawKeys([{ m: shown, color: col('bad', shown) }]);
        fb.className = 'quiz-feedback bad lx-fb';
        fb.innerHTML = msg + (errsHere >= 2 ? ` <span class="lx-help">Indice : la touche marquée « ? ».</span>` : '');
        if (errsHere >= 2) showHint(s);
        setTimeout(() => { if (!finished && steps[k] === s) { drawKeys(errsHere >= 2 ? [{ m: T.midiOf(s.note), color: col('hint', T.midiOf(s.note)) }] : []); if (errsHere >= 2) showHint(s); } }, 900);
      }
    };
    cur = { handle, want: () => (!finished && steps[k] ? T.midiOf(steps[k].note) : null) };
    const result = () => {
      if (tk.kind === 'scale') return ms.map((m, j) => ({ m, t: j * 0.32, d: j === ms.length - 1 ? 0.9 : 0.3 }));
      if (tk.isChord) return ms.map((m, j) => ({ m, t: j * 0.3, d: 0.45 })).concat(ms.map(m => ({ m, t: ms.length * 0.3 + 0.15, d: 1.5, v: 66 })));
      return ms.map((m, j) => ({ m, t: j * 0.55, d: 0.8 }));
    };
    const complete = () => {
      finished = true;
      if (!errs) clean++;
      drawStrip(); sayNext();
      fb.className = 'quiz-feedback ok lx-fb';
      fb.innerHTML = `<b>${errs ? 'Construit.' : 'Sans faute.'}</b> ${tk.done}`;
      labelKeys(kb, [], 'cnt');
      staff.hidden = false;
      try { renderStaff(staff, staffAbc(tk.notes, { chord: tk.isChord }), tk.isChord ? 160 : 320); } catch (e) { staff.hidden = true; }
      listen.hidden = false;
      nextBtn.hidden = false;
      playList(result(), kb);
    };
    listen.addEventListener('click', () => playList(result(), kb));
    redo.addEventListener('click', () => { runTask(); });
    nextBtn.addEventListener('click', () => { ti++; runTask(); });
    // la tonique (ou la fondamentale) d'abord, pour situer — seulement si le son est déjà actif (après un geste)
    if (audio.ctx && audio.ctx.state === 'running' && audio.ready) setTimeout(() => { if (!finished && tk.given.length && document.body.contains(frame)) playList(tk.given.map((g, j) => ({ m: ms[g], t: j * 0.3, d: 0.7 })), kb); }, 200);
  };
  const finish = () => {
    count.textContent = '';
    body.innerHTML = '';
    const again = h('button', { class: 'btn sm', type: 'button' }, 'Recommencer');
    again.addEventListener('click', () => { ti = 0; clean = 0; runTask(); });
    const all = clean === tasks.length;
    body.append(h('div', { class: 'lx-done' + (all ? ' ok' : '') },
      h('b', {}, all ? 'Tout construit sans faute.' : `${clean} sur ${tasks.length} sans faute.`),
      h('span', { class: 'small' }, all ? ' Tu sais le faire : passe à la suite.' : ' Recommence plus tard sans regarder les indices : l’écart se compte sur les touches.'),
      again));
    signalDone(el, { ok: clean, n: tasks.length });
  };
  const offMidi = midi.on('noteon', ev => {
    if (focus !== me || ev.source === 'virtual' || !cur) return;
    if (!document.body.contains(frame)) return;
    cur.handle(ev.note);
  });
  // accès pour les tests automatiques : la note attendue, et jouer une note comme au clavier
  frame.__build = { want: () => (cur ? cur.want() : null), play: m => cur && cur.handle(m) };
  runTask();
  return () => { offMidi(); stopSound(); focusWatchers.delete(refreshTag); if (focus === me) focus = null; };
}

/* ================================================================== */
/* « Sur la partition » : toucher la note demandée                     */
/* ================================================================== */
export function mountSpot(el, cfg, Score) {
  const frame = h('div', { class: 'w-frame lx lx-spot' });
  const count = h('span', { class: 'w-sub' });
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Sur la partition'), count));
  const body = h('div', { class: 'w-body' });
  const q = h('div', { class: 'lx-q' });
  const host = h('div', { class: 'lx-score' });
  const fb = h('div', { class: 'quiz-feedback' });
  const nextBtn = h('button', { class: 'btn primary', type: 'button', hidden: true }, 'Suivant');
  body.append(q, host, fb, nextBtn);
  frame.append(body);
  el.append(frame);
  if (cfg.caption) el.append(h('div', { class: 'w-caption', html: cfg.caption }));
  const tasks = cfg.tasks || [];
  let ti = 0, tries = 0, over = false, firstOk = 0, score = null, cands = new Set();
  const firstBar = +((cfg.abc.match(/%%setbarnb\s+(\d+)/) || [])[1] ?? 1);
  const barOf = t => {
    if (score.pickupQ > 0) return t < score.pickupQ - 1e-6 ? firstBar : firstBar + 1 + Math.floor((t - score.pickupQ) / score.barQ + 1e-6);
    return firstBar + Math.floor(t / score.barQ + 1e-6);
  };
  const beatOf = t => {
    const b0 = score.pickupQ > 0 ? (t < score.pickupQ ? 0 : score.pickupQ + (barOf(t) - firstBar - 1) * score.barQ) : (barOf(t) - firstBar) * score.barQ;
    return 1 + Math.floor((t - b0) / score.beatQ + 1e-6);
  };
  const matches = (e, tg) => {
    if (tg.bar != null && barOf(e.t) !== tg.bar) return false;
    if (tg.beat != null && beatOf(e.t) !== tg.beat) return false;
    if (tg.note) {
      const n = T.parseNote(tg.note);
      if (n.o != null ? e.pitch !== T.midiOf(n) : ((e.pitch - T.midiOf(n)) % 12 + 12) % 12 !== 0) return false;
    }
    if (tg.hand && e.hand !== tg.hand) return false;
    return true;
  };
  const show = () => {
    if (!score) return;
    score.clear();
    fb.className = 'quiz-feedback'; fb.innerHTML = '';
    nextBtn.hidden = true; tries = 0; over = false;
    if (ti >= tasks.length) return finish();
    const tk = tasks[ti];
    count.textContent = tasks.length > 1 ? `${ti + 1} / ${tasks.length}` : '';
    q.innerHTML = tk.q;
    cands = new Set(score.events.filter(e => e.char != null && (tk.targets || []).some(tg => matches(e, tg))).map(e => e.char));
    if (!cands.size) console.warn('Sur la partition : aucune cible pour', tk.q);
  };
  const onClick = abcElem => {
    if (over || !abcElem || abcElem.startChar == null) return;
    const ch = abcElem.startChar;
    const pitches = (abcElem.midiPitches || []).map(p => p.pitch);
    if (pitches.length) playList(pitches.map(m => ({ m, t: 0, d: 0.9, v: 70 })));
    const tk = tasks[ti];
    tries++;
    if (cands.has(ch)) {
      over = true;
      if (tries === 1) firstOk++;
      for (const c of cands) score.mark(c, 'n-ok');
      fb.className = 'quiz-feedback ok';
      fb.innerHTML = `<b>${tries === 1 ? 'Exact.' : 'Oui.'}</b> ${tk.why || ''}`;
      nextBtn.hidden = false;
    } else {
      score.mark(ch, 'n-bad');
      setTimeout(() => score.unmark(ch, 'n-bad'), 900);
      fb.className = 'quiz-feedback bad';
      if (tries >= 2) {
        over = true;
        for (const c of cands) score.mark(c, 'n-hint');
        fb.innerHTML = `<b>C’est la note en or.</b> ${tk.why || ''}`;
        nextBtn.hidden = false;
      } else fb.innerHTML = `<b>Pas celle-ci.</b> ${tk.hint || 'Regarde de nouveau la mesure indiquée.'}`;
    }
  };
  nextBtn.addEventListener('click', () => { ti++; show(); });
  const finish = () => {
    count.textContent = '';
    q.innerHTML = '';
    const again = h('button', { class: 'btn sm', type: 'button' }, 'Recommencer');
    again.addEventListener('click', () => { ti = 0; firstOk = 0; show(); });
    fb.className = 'quiz-feedback';
    fb.innerHTML = '';
    const all = firstOk === tasks.length;
    fb.append(h('div', { class: 'lx-done' + (all ? ' ok' : '') }, h('b', {}, `${firstOk} sur ${tasks.length} du premier coup.`), h('span', { class: 'small' }, all ? ' Tu sais le repérer dans ta partition.' : ' Recommence : l’œil apprend vite à reconnaître ces notes.'), again));
    signalDone(el, { ok: firstOk, n: tasks.length });
  };
  try {
    score = new Score(host, cfg.abc, { staffwidth: cfg.staffwidth || 640, onClick });
    frame.__score = score;
    // accès pour les tests automatiques : cibles de la question en cours, position d'une note à l'écran
    frame.__spot = {
      get cands() { return [...cands]; },
      rect: ch => { const el = score.elementsFor(ch).find(e => e.getBoundingClientRect().width > 0); const r = el && el.getBoundingClientRect(); return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null; },
      events: () => score.events.map(e => ({ pitch: e.pitch, t: e.t, char: e.char, hand: e.hand, bar: barOf(e.t), beat: beatOf(e.t) })),
    };
    show();
  } catch (e) {
    console.error(e);
    host.textContent = 'Partition indisponible.';
  }
  return () => stopSound();
}
