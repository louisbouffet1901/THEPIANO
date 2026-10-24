// « Au clavier » (V7.6, M3) : jouer la notion au piano, dans plusieurs tonalités, vérifié en MIDI (ou sur le clavier de
// l'écran). Exemples dégressifs (E3.6) : le premier exercice montre les touches, le deuxième seulement les noms, le
// troisième rien (« Montrer » si tu bloques).
// cfg : { id, title, keys: ['C', 'G', 'F'], tasks: [task], impro: { href, label } }
// task :
//   { kind: 'chords', text, chords: ['I', 'IV6/4', 'V6', 'I'], lead: true | 'upper', rules: ['sensible', 'septieme'], hand: 'mg', minor }
//     lead true : une main, chaque note bouge d'un ton au plus ; 'upper' : la basse à la main gauche, les voix du dessus au plus près
//   { kind: 'line', text, over: 'I' | ['I', 'V'], fig: 'broderie' | 'passage' | 'appoggiature' | 'retard', deg }
//   { kind: 'degrees', text, seq: [1, 3, 5] }
import { h, KEYS, CHORDS, pc, noteNameFr } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { keyboard } from './diagrams.js';
import { store } from './store.js';

const LET = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'];
const NAT = [0, 2, 4, 5, 7, 9, 11];
const MAJ = [0, 2, 4, 5, 7, 9, 11], NMIN = [0, 2, 3, 5, 7, 8, 10];
const ACC = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
const KC = { ok: ['#cfe6d7', '#2e7d4f'], show: ['#f2d9a8', '#a8741f'], bad: ['#f3c9c4', '#b3261e'], sel: ['#d6e0ef', '#476aa3'] };
const kc = (k, m) => KC[k][[1, 3, 6, 8, 10].includes(pc(m)) ? 1 : 0];
const signalDone = el => el.dispatchEvent(new CustomEvent('exo-done', { bubbles: true }));

/* ------------------------------------------------------------------ */
/* Tonalités, degrés, chiffrages                                        */
/* ------------------------------------------------------------------ */
export function keyOf(id) {
  const K = KEYS[id];
  return { id, ...K, tpc: K.tonic % 12, letter: LET.indexOf(K.fr.split(' ')[0].replace(/[♯♭]/g, '')), minor: K.mode === 'min' };
}
const relMinor = key => keyOf(Object.keys(KEYS).find(k => KEYS[k].mode === 'min' && KEYS[k].sig === key.sig));
const spellL = (letter, p) => { const L = ((letter % 7) + 7) % 7; let d = (((p - NAT[L]) % 12) + 12) % 12; if (d > 6) d -= 12; return LET[L] + (ACC[d] ?? '?'); };
/** Hauteur (classe) d'un degré ; en mineur, le 7e degré est la sensible si `raised`. */
function degPc(key, d, raised = true) {
  const sc = key.minor ? NMIN : MAJ;
  let p = key.tpc + sc[(d - 1) % 7];
  if (key.minor && d === 7 && raised) p += 1;
  return p % 12;
}
export const degName = (key, d) => spellL(key.letter + d - 1, degPc(key, d));

const RN = /^([b♭])?(vii|vi|iv|v|iii|ii|i|VII|VI|IV|V|III|II|I|N)(°|ø|\+)?(7|6\/5|4\/3|4\/2|6\/4|6)?(?:\/(vii|vi|iv|v|iii|ii|i|VII|VI|IV|V|III|II|I))?$/;
const DEG = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
const INV = { '': 0, 7: 0, 6: 1, '6/5': 1, '6/4': 2, '4/3': 2, '4/2': 3 };
const POS = ['état fondamental', '1er renversement', '2e renversement', '3e renversement'];
const PART = ['la fondamentale', 'la tierce', 'la quinte', 'la septième'];

/** Un accord en chiffres romains : { label, root, q, pcs, names, inv } (pcs et names dans l'ordre fondamentale, tierce…). */
export function chordOf(key, s) {
  const m = RN.exec(s);
  if (!m) throw new Error('Chiffrage inconnu : ' + s);
  const [, flat, rn, sym = '', fig = '', of] = m;
  let letter, root, q;
  if (rn === 'N') { letter = key.letter + 1; root = (key.tpc + 1) % 12; q = 'M'; } // sixte napolitaine : II abaissé
  else {
    const d = DEG[rn.toLowerCase()];
    const upper = rn === rn.toUpperCase();
    const seventh = ['7', '6/5', '4/3', '4/2'].includes(fig);
    if (of) { // accord appliqué (V7/V, vii°7/ii…) : compté depuis la fondamentale du degré visé
      const t = DEG[of.toLowerCase()];
      letter = key.letter + t - 1 + d - 1;
      root = (degPc(key, t) + MAJ[d - 1]) % 12;
    } else {
      letter = key.letter + d - 1;
      root = degPc(key, d, sym === '°' || sym === 'ø');
    }
    if (flat) root = (root + 11) % 12;
    q = seventh ? (sym === 'ø' ? 'hdim7' : sym === '°' ? 'dim7' : upper ? (d === 5 || of ? '7' : 'maj7') : 'm7')
      : sym === '°' ? 'dim' : sym === '+' ? 'aug' : upper ? 'M' : 'm';
  }
  const iv = CHORDS[q].iv;
  const pcs = iv.map(x => (root + x) % 12);
  return { label: s, root, q, pcs, names: pcs.map((p, i) => spellL(letter + 2 * i, p)), inv: rn === 'N' && !fig ? 1 : INV[fig] };
}
const bassPc = ch => ch.pcs[ch.inv || 0];
const chordText = ch => `${ch.names.join(' – ')}${ch.inv ? `, ${ch.names[ch.inv]} à la basse` : ''}`;

/** Disposition serrée la plus proche de `prev` (ou centrée sur `center`) ; `bass` : une basse à part, plus grave. */
export function voicing(ch, prev, { bass = false, center = 62, ok = null } = {}) {
  const near = (p, target) => { let best = null; for (let m = p; m < 108; m += 12) if (m >= 24 && (best == null || Math.abs(m - target) < Math.abs(best - target))) best = m; return best; };
  const closeSets = (pcs, lo, hi) => {
    const out = [];
    for (let r = 0; r < pcs.length; r++) {
      const ord = pcs.slice(r).concat(pcs.slice(0, r));
      for (let b = lo; b <= hi; b++) {
        if (pc(b) !== ord[0]) continue;
        const v = [b];
        for (const p of ord.slice(1)) { let m = v[v.length - 1] + 1; while (pc(m) !== p) m++; v.push(m); }
        out.push(v);
      }
    }
    return out;
  };
  const dist = (a, b) => (a.length === b.length ? a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0) : b.reduce((s, x) => s + Math.min(...a.map(y => Math.abs(y - x))), 0));
  if (bass) {
    // la basse reste grave (mi1 à sol2) ; la plus proche de la précédente
    let bp = null;
    for (let m = 40; m <= 55; m++) if (pc(m) === bassPc(ch) && (bp == null || Math.abs(m - (prev ? prev[0] : 48)) < Math.abs(bp - (prev ? prev[0] : 48)))) bp = m;
    // au-dessus de la basse : les autres notes ; dans une septième à l'état fondamental, aussi fondamentale – tierce – septième
    const ups = ch.pcs.length === 4 ? [ch.pcs.filter(p => p !== bassPc(ch))].concat(ch.inv ? [] : [[ch.pcs[0], ch.pcs[1], ch.pcs[3]]]) : [ch.pcs];
    const cands = ups.flatMap(up => closeSets(up, Math.max(bp + 3, 55), 72));
    const pu = prev ? prev.slice(1) : null;
    const sorted = cands.sort((a, b) => (pu ? dist(pu, a) - dist(pu, b) : Math.abs(a[0] - center) - Math.abs(b[0] - center))).map(v => [bp, ...v]);
    return (ok && sorted.find(ok)) || sorted[0];
  }
  const cands = closeSets(ch.pcs, center - 14, center + 12).filter(v => ch.inv == null || pc(v[0]) === bassPc(ch));
  const sorted = cands.sort((a, b) => (prev ? dist(prev, a) - dist(prev, b) : Math.abs(a[0] - center) - Math.abs(b[0] - center)));
  return (ok && sorted.find(ok)) || sorted[0];
}

/* ------------------------------------------------------------------ */
/* Vérifications                                                        */
/* ------------------------------------------------------------------ */
export function judgeChord(notes, ch, nm) {
  const ps = [...new Set(notes)].sort((a, b) => a - b);
  const got = new Set(ps.map(pc));
  const extra = [...got].filter(x => !ch.pcs.includes(x));
  const req = ch.pcs.length === 4 ? ch.pcs.filter((x, i) => i !== 2) : ch.pcs; // dans une septième, la quinte peut manquer
  const missing = req.filter(x => !got.has(x));
  const bassOk = ch.inv == null || pc(ps[0]) === bassPc(ch);
  const lines = [];
  if (extra.length) lines.push(`En trop : ${extra.map(p => nm(ps.find(m => pc(m) === p))).join(', ')} (pas dans l’accord ${ch.names.join(' – ')}).`);
  if (missing.length) lines.push(`Il manque : ${missing.map(p => ch.names[ch.pcs.indexOf(p)]).join(', ')}.`);
  if (!extra.length && !missing.length && !bassOk) lines.push(`Les notes y sont, mais à la basse il faut ${ch.names[ch.inv]} (${PART[ch.inv]} : ${POS[ch.inv]}), pas ${nm(ps[0])}.`);
  return { ok: !extra.length && !missing.length && bassOk, lines, ps };
}
/** Enchaînement : au plus près (un ton au plus par voix), sensible qui monte, septième qui descend. */
export function judgeMove(prev, cur, chPrev, chCur, key, { lead, rules = [] }, nm) {
  const lines = [];
  let ok = true;
  const up = lead === 'upper';
  const a = up ? prev.slice(1) : prev, b = up ? cur.slice(1) : cur;
  if (lead) {
    const far = b.filter(n => !a.some(p => Math.abs(p - n) <= 2));
    if (far.length) { ok = false; lines.push(`${far.map(nm).join(', ')} : trop loin de l’accord précédent. Au plus près : chaque note bouge d’un ton au plus${up ? ' (la basse, elle, peut sauter)' : ''}.`); }
    const kept = a.filter(p => chCur.pcs.includes(pc(p)) && !b.includes(p));
    if (ok && kept.length) lines.push(`Astuce : garde ${kept.map(nm).join(', ')} à la même place, c’est la note commune.`);
  }
  if (rules.includes('sensible') && chCur.root === key.tpc && chPrev.root === degPc(key, 5) && ['M', '7'].includes(chPrev.q)) {
    const lt = a.filter(p => pc(p) === (key.tpc + 11) % 12);
    if (lt.length && !lt.every(p => b.includes(p + 1))) { ok = false; lines.push(`La sensible (${spellL(key.letter + 6, (key.tpc + 11) % 12)}) doit monter d’un demi-ton sur la tonique.`); }
  }
  if (rules.includes('septieme') && chPrev.pcs.length === 4) {
    const sv = a.filter(p => pc(p) === chPrev.pcs[3]);
    if (sv.length && !sv.every(p => b.includes(p - 1) || b.includes(p - 2))) { ok = false; lines.push(`La septième (${chPrev.names[3]}) doit descendre d’un degré.`); }
  }
  return { ok, lines };
}
/** Une figure mélodique sur un accord tenu ; notes : [{ m, on, off }] de la main droite. */
export function judgeLine(fig, mel, ch, { ch2, change } = {}) {
  const isC = (m, c = ch) => c.pcs.includes(pc(m));
  const st = x => Math.abs(x) >= 1 && Math.abs(x) <= 2;
  const n = mel.length;
  if (fig === 'broderie' && n >= 3) {
    const [a, b, c] = mel.slice(-3).map(x => x.m);
    if (c === a && isC(a) && !isC(b) && st(b - a)) return { ok: true, lines: ['Broderie : tu quittes la note de l’accord d’un degré et tu y reviens.'] };
    return { ok: false, lines: [!isC(a) ? 'Pars d’une note de l’accord.' : c !== a ? 'Reviens sur la note de départ.' : isC(b) ? 'La note du milieu est dans l’accord : ce n’est pas une note étrangère. Prends la note voisine (un degré au-dessus ou au-dessous).' : 'La note du milieu doit être voisine : un ton ou un demi-ton.'] };
  }
  if (fig === 'passage' && n >= 3) {
    const [a, b, c] = mel.slice(-3).map(x => x.m);
    if (isC(a) && isC(c) && !isC(b) && st(b - a) && st(c - b) && (b - a) * (c - b) > 0) return { ok: true, lines: ['Note de passage : elle relie deux notes de l’accord, par degrés, dans le même sens.'] };
    return { ok: false, lines: [!isC(a) || !isC(c) ? 'Pars d’une note de l’accord et arrive sur une autre.' : (b - a) * (c - b) <= 0 ? 'Continue dans le même sens : c’est un passage, pas un aller-retour.' : 'Entre les deux, une seule note voisine, hors de l’accord.'] };
  }
  if (fig === 'appoggiature' && n >= 2) {
    const [a, b] = mel.slice(-2).map(x => x.m);
    if (!isC(a) && isC(b) && st(a - b)) return { ok: true, lines: [a > b ? 'Appoggiature : la note étrangère sur le temps, puis la résolution d’un degré vers le bas.' : 'Appoggiature par en dessous : juste. Essaie aussi par le haut, la plus fréquente.'] };
    return { ok: false, lines: [isC(a) ? 'Commence sur une note étrangère à l’accord (celle qui frotte), pas sur une note de l’accord.' : 'Résous d’un degré, sur une note de l’accord.'] };
  }
  if (fig === 'retard' && n >= 2 && ch2 && change) {
    const x = mel[n - 2], y = mel[n - 1];
    const held = x.on < change && (x.off == null || x.off > change - 30) && y.on > change;
    if (held && isC(x.m, ch) && !isC(x.m, ch2) && isC(y.m, ch2) && st(x.m - y.m) && x.m > y.m) return { ok: true, lines: ['Retard : la note préparée dans le premier accord, tenue sur le second où elle frotte, puis résolue en descendant.'] };
    return { ok: false, lines: [x.on >= change ? 'Joue la note avant le changement d’accord, et tiens-la.' : !held ? 'Tiens la note pendant le changement d’accord, puis résous.' : 'Résous en descendant d’un degré, sur une note du nouvel accord.'] };
  }
  return null;
}

/** Le modèle d'un exercice dans une tonalité : accords et dispositions, accords tenus, figure, toutes les notes. */
export function taskModel(tk, key) {
  let plan = [];
  if (tk.kind === 'chords') {
    let prev = null, prevCh = null;
    plan = tk.chords.map(s => {
      const ch = chordOf(key, s);
      if (tk.anyPos) ch.inv = null;
      const pv = prev, pch = prevCh; // la disposition modèle respecte les règles de l'exercice
      const ok = v => judgeChord(v, ch, String).ok && (!pv || judgeMove(pv, v, pch, ch, key, tk, String).ok);
      const v = voicing(ch, pv, { bass: tk.lead === 'upper', center: tk.hand === 'mg' ? 52 : 64, ok });
      prev = v; prevCh = ch;
      return { ch, v };
    });
  }
  const over = tk.kind === 'line' ? [].concat(tk.over).map(s => chordOf(key, s)) : [];
  let fig = [];
  if (tk.kind === 'line') {
    const d = tk.deg || 1, p = x => 60 + degPc(key, ((x - 1) % 7) + 1);
    const base = p(d);
    const up = x => (x > base ? x : x + 12);
    if (tk.fig === 'broderie') fig = [base, up(p(d + 1)), base];
    else if (tk.fig === 'passage') { const b = up(p(d + 1)); fig = [base, b, p(d + 2) > b ? p(d + 2) : p(d + 2) + 12]; }
    else { const below = p(d === 1 ? 7 : d - 1); fig = [base, below < base ? below : below - 12]; } // appoggiature, retard : le degré, puis celui du dessous
    if (Math.min(...fig) < 62) fig = fig.map(m => m + 12);
  }
  const allNotes = tk.kind === 'chords' ? plan.flatMap(x => x.v) : tk.kind === 'line' ? [...voicing(over[0], null, { center: 50 }), ...fig, ...(over[1] ? voicing(over[1], null, { center: 50 }) : [])] : tk.seq.map(d => 60 + degPc(key, d));
  return { plan, over, fig, allNotes };
}
export const keyFor = (tk, key) => (tk.minor ? relMinor(key) : key);

/* ------------------------------------------------------------------ */
/* Le widget                                                            */
/* ------------------------------------------------------------------ */
export function mountAuClavier(el, cfg) {
  const keys = (cfg.keys || ['C']).map(keyOf);
  const sk = `clavier.${cfg.id || 'x'}`;
  const saved = () => store.get(sk) || {};
  let ki = 0, ti = 0, alive = true, offs = [], timers = [];
  const frame = h('div', { class: 'w-frame lx ac' });
  const sub = h('span', { class: 'w-sub' });
  const pianoTag = h('span', { class: 'tag accent lx-piano', hidden: midi.status !== 'ready' }, 'piano à l’écoute');
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Au clavier'), sub, pianoTag));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  if (cfg.impro) el.append(h('p', { class: 'small ac-impro' }, h('b', {}, 'Pour improviser : '), h('a', { href: cfg.impro.href }, cfg.impro.label), cfg.impro.why ? ` — ${cfg.impro.why}` : '.'));
  const clearT = () => { timers.forEach(clearTimeout); timers = []; audio.stopAll('auclavier'); };
  const stopListen = () => { offs.forEach(f => f()); offs = []; };

  function run() {
    stopListen(); clearT();
    body.innerHTML = '';
    const key0 = keys[ki];
    const tk = cfg.tasks[ti];
    const key = keyFor(tk, key0);
    const nm = m => noteNameFr(m, { octave: false, flats: key.sig < 0 });
    const guide = ti === 0 ? 'full' : ti === 1 ? 'half' : 'none'; // exemples dégressifs
    let shown = guide === 'full';
    sub.textContent = `en ${key.fr} · ${ti + 1} / ${cfg.tasks.length}`;
    const prompt = h('div', { class: 'lx-q', html: tk.text });
    const strip = h('div', { class: 'ac-strip' });
    const fb = h('div', { class: 'quiz-feedback ac-fb', 'aria-live': 'polite' });
    const row = h('div', { class: 'btn-row ac-row' });
    const model = h('button', { class: 'btn sm', type: 'button' }, 'Écouter un modèle');
    const show = h('button', { class: 'btn sm ghost', type: 'button', hidden: shown }, 'Montrer');
    const validate = h('button', { class: 'btn sm', type: 'button', hidden: true }, 'Valider l’accord');
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true });
    row.append(next, model, show, validate);
    // le plan : accords (avec une disposition modèle), ou figure
    const { plan, over, fig: figModel, allNotes } = taskModel(tk, key);
    const lineModel = () => figModel;
    const blk = m => [1, 3, 6, 8, 10].includes(pc(m));
    let from = Math.min(...allNotes) - 3, to = Math.max(...allNotes) + 3;
    while (blk(from)) from--;
    to = Math.max(to, from + 20);
    while (blk(to)) to++;
    const sel = new Set();
    const kb = keyboard({ from, to, names: 'c', height: 96, interactive: true, label: 'Clavier : joue ici ou sur ton piano',
      onDown: m => { audio.ensure().then(() => audio.noteOn(m, 80, 0, { owner: 'auclavier' })).catch(() => {}); input(m, true, performance.now(), 'screen'); },
      onUp: m => { audio.noteOff(m); input(m, false, performance.now(), 'screen'); } });
    body.append(prompt, strip, h('div', { class: 'lx-kbd' }, kb), fb, row);
    if (midi.status === 'ready') body.append(h('p', { class: 'small muted lx-src' }, 'Joue sur ton piano, ou touche les notes à l’écran.'));
    // état
    let j = 0, prevV = null, done = false;
    const mel = [], held = new Map();
    let peak = [], judged = false, stable = null, change = null;
    const marks = (extra = []) => {
      const list = [];
      if (tk.kind === 'chords' && shown && plan[j]) plan[j].v.forEach(m => list.push({ m, color: kc('show', m) }));
      if (tk.kind === 'degrees' && shown) tk.seq.forEach((d, i) => { if (i >= mel.length) { const m = allNotes[i]; list.push({ m, color: kc('show', m) }); } });
      if (tk.kind === 'line' && shown) lineModel().forEach(m => list.push({ m, color: kc('show', m) }));
      sel.forEach(m => list.push({ m, color: kc('sel', m) }));
      kb.setMarks([...list, ...extra]);
    };
    const drawStrip = () => {
      strip.innerHTML = '';
      if (tk.kind === 'chords') plan.forEach((x, i) => strip.append(h('span', { class: 'lx-chip' + (i < j ? ' ok' : i === j && !done ? ' cur' : '') },
        h('b', {}, x.ch.label), guide !== 'none' || i < j || shown ? h('small', {}, ` ${chordText(x.ch)}`) : null)));
      else if (tk.kind === 'degrees') tk.seq.forEach((d, i) => strip.append(h('span', { class: 'lx-chip' + (i < mel.length ? ' ok' : i === mel.length && !done ? ' cur' : '') }, h('b', {}, String(d)), guide !== 'none' || shown ? h('small', {}, ` ${degName(key, d)}`) : null)));
      else strip.append(h('span', { class: 'lx-chip cur' }, h('b', {}, `Accord${over.length > 1 ? 's' : ''} : ${over.map(c => c.label).join(' puis ')}`), h('small', {}, ` ${over.map(chordText).join(' ; ')}`)));
    };
    drawStrip(); marks();
    const success = msg => {
      done = true;
      fb.className = 'quiz-feedback ac-fb ok';
      fb.innerHTML = `<b>Juste.</b> ${msg || ''}`;
      drawStrip();
      const last = ti + 1 >= cfg.tasks.length;
      if (last) {
        const s = saved(); const keysDone = { ...(s.keys || {}), [key0.id]: true };
        store.set(sk, { ...s, keys: keysDone });
        if (Object.keys(keysDone).length === 1 || ki === 0) signalDone(el);
        const nk = keys[(ki + 1) % keys.length];
        next.textContent = keys.length > 1 ? `Encore, en ${nk.fr}` : 'Recommencer';
      } else next.textContent = 'Exercice suivant';
      next.hidden = false;
      validate.hidden = true;
    };
    const fail = lines => { fb.className = 'quiz-feedback ac-fb no'; fb.innerHTML = lines.map(l => `<div>→ ${l}</div>`).join(''); };
    next.addEventListener('click', () => {
      if (ti + 1 >= cfg.tasks.length) { ti = 0; ki = (ki + 1) % keys.length; } else ti++;
      run();
    });
    show.addEventListener('click', () => { shown = true; show.hidden = true; drawStrip(); marks(); });
    model.addEventListener('click', async () => {
      clearT();
      await audio.ensure();
      const t0 = audio.now() + 0.15, o = { owner: 'auclavier' };
      const play = (m, at, dur, vel = 70) => { const v = audio.noteOn(m, vel, t0 + at, o); if (v) audio.noteOff(v, t0 + at + dur); };
      if (tk.kind === 'chords') plan.forEach((x, i) => x.v.forEach(m => play(m, i * 1.3, 1.2)));
      else if (tk.kind === 'degrees') allNotes.forEach((m, i) => play(m, i * 0.6, 0.55));
      else {
        const fig = lineModel();
        voicing(over[0], null, { center: 50 }).forEach(m => play(m, 0, over[1] ? 1.2 : 2.6, 52));
        if (over[1]) voicing(over[1], null, { center: 50 }).forEach(m => play(m, 1.2, 1.6, 52));
        if (tk.fig === 'retard') { play(fig[0], 0.05, 1.75); play(fig[1], 1.8, 1); }
        else fig.forEach((m, i) => play(m, 0.05 + i * (tk.fig === 'appoggiature' ? 0.9 : 0.6), tk.fig === 'appoggiature' && i === 0 ? 0.85 : 0.55));
      }
    });
    // retard : l'appli joue les deux accords ; le changement est daté
    let retardBtn = null;
    if (tk.fig === 'retard') {
      retardBtn = h('button', { class: 'btn sm primary', type: 'button' }, 'Lancer les accords');
      row.prepend(retardBtn);
      retardBtn.addEventListener('click', async () => {
        clearT(); mel.length = 0;
        await audio.ensure();
        const t0 = audio.now() + 0.2;
        voicing(over[0], null, { center: 50 }).forEach(m => { const v = audio.noteOn(m, 55, t0, { owner: 'auclavier' }); if (v) audio.noteOff(v, t0 + 2.4); });
        voicing(over[1], null, { center: 50 }).forEach(m => { const v = audio.noteOn(m, 55, t0 + 2.4, { owner: 'auclavier' }); if (v) audio.noteOff(v, t0 + 5); });
        change = performance.now() + 2600;
        fail(['Joue la note pendant le premier accord, tiens-la au changement, puis résous.']);
        fb.className = 'quiz-feedback ac-fb';
      });
    } else if (tk.kind === 'line') {
      const drone = h('button', { class: 'btn sm', type: 'button' }, 'Faire sonner l’accord');
      row.insertBefore(drone, show);
      drone.addEventListener('click', async () => { clearT(); await audio.ensure(); const t0 = audio.now() + 0.1; voicing(over[0], null, { center: 50 }).forEach(m => { const v = audio.noteOn(m, 52, t0, { owner: 'auclavier' }); if (v) audio.noteOff(v, t0 + 6); }); });
    }
    const judgeNow = notes => {
      if (done || !plan[j]) return;
      const r = judgeChord(notes, plan[j].ch, nm);
      if (!r.ok) { fail(r.lines); kb.setMarks(r.ps.map(m => ({ m, color: kc(plan[j].ch.pcs.includes(pc(m)) ? 'ok' : 'bad', m) }))); return; }
      if (prevV && j > 0) {
        const mv = judgeMove(prevV, r.ps, plan[j - 1].ch, plan[j].ch, key, tk, nm);
        if (!mv.ok) { fail(mv.lines); return; }
        if (mv.lines.length) fb.innerHTML = mv.lines.join(' ');
      }
      prevV = r.ps; j++;
      if (j >= plan.length) return success(tk.lead ? 'L’enchaînement est lié : chaque voix va au plus près.' : '');
      fb.className = 'quiz-feedback ac-fb ok'; fb.innerHTML = `✓ ${plan[j - 1].ch.label}. Suivant : <b>${plan[j].ch.label}</b>.`;
      drawStrip(); marks();
    };
    function input(m, on, t, src) {
      if (done || !alive) return;
      if (tk.kind === 'chords') {
        if (src === 'screen') { if (!on) return; sel.has(m) ? sel.delete(m) : sel.add(m); validate.hidden = sel.size < 2; marks(); return; }
        if (on) {
          held.set(m, t);
          if (held.size >= peak.length) peak = [...held.keys()];
          judged = false; // une note ajoutée : on rejuge (notes communes tenues d'un accord à l'autre)
          clearTimeout(stable);
          const need = new Set(plan[j].ch.pcs.length === 4 ? plan[j].ch.pcs.filter((x, i) => i !== 2) : plan[j].ch.pcs).size;
          stable = setTimeout(() => { if (held.size >= need && !judged) { judged = true; judgeNow([...held.keys()]); } }, 450);
        } else {
          held.delete(m);
          if (!held.size) { clearTimeout(stable); if (!judged && peak.length >= 2) judgeNow(peak); judged = false; peak = []; }
        }
        return;
      }
      if (tk.kind === 'degrees') {
        if (!on) return;
        const want = degPc(key, tk.seq[mel.length]);
        if (pc(m) !== want) { fail([`${nm(m)} n’est pas le degré ${tk.seq[mel.length]} (${degName(key, tk.seq[mel.length])}). Reprends depuis le début.`]); mel.length = 0; drawStrip(); marks(); return; }
        mel.push({ m, on: t });
        fb.className = 'quiz-feedback ac-fb'; fb.textContent = '';
        drawStrip(); marks();
        if (mel.length >= tk.seq.length) success('');
        return;
      }
      // figure sur un accord : la main droite (au-dessus du si2) ; en dessous, ta main gauche peut tenir l'accord
      if (m < 59 && src !== 'screen') return;
      if (on) mel.push({ m, on: t, off: null });
      else { const x = [...mel].reverse().find(y => y.m === m && y.off == null); if (x) x.off = t; return; }
      if (tk.fig === 'retard' && !change) { fail(['Lance d’abord les accords (bouton).']); mel.length = 0; return; }
      const r = judgeLine(tk.fig, mel, over[0], { ch2: over[1], change });
      if (!r) return;
      if (r.ok) success(r.lines[0]);
      else if (tk.fig === 'appoggiature' || tk.fig === 'retard' || mel.length >= 3) { fail(r.lines); if (tk.fig !== 'retard') mel.splice(0, mel.length - 1); }
    }
    validate.addEventListener('click', () => { const notes = [...sel]; sel.clear(); validate.hidden = true; marks(); judgeNow(notes); });
    offs.push(midi.on('noteon', ev => { kb.press?.(ev.note, true); input(ev.note, true, ev.time, 'midi'); }));
    offs.push(midi.on('noteoff', ev => { kb.press?.(ev.note, false); input(ev.note, false, ev.time, 'midi'); }));
  }
  run();
  return () => { alive = false; stopListen(); clearT(); };
}
