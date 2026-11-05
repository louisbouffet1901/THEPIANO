// Défi éclair (V8.1) : une minute pour répondre juste au plus de questions de théorie, tirées au hasard et vérifiées
// par le moteur de théorie (theory.js) : armures, relatives, intervalles, accords, degrés, cycle des quintes. Un record
// par thème, un défi du jour, et à la fin ce qui t'a trompé.
import { h, esc, shuffle, pick } from './util.js';
import { store } from './store.js';
import { noteName, transpose, interval, chord, scale, keySignature, relative, keyName, ivName, parseNote, CHORD_NAME, FLAT_ORDER, SHARP_ORDER } from './theory.js';

export const THEMES = [
  { id: 'armures', label: 'Armures', sub: 'combien d’altérations, quelle tonalité' },
  { id: 'relatives', label: 'Relatives', sub: 'le relatif mineur ou majeur' },
  { id: 'intervalles', label: 'Intervalles', sub: 'nommer un intervalle, ou le construire' },
  { id: 'accords', label: 'Accords', sub: 'les notes d’un accord, ou son nom' },
  { id: 'degres', label: 'Degrés', sub: 'dominante, sous-dominante, sensible…' },
  { id: 'quintes', label: 'Cycle des quintes', sub: 'une quinte au-dessus, au-dessous' },
  { id: 'tout', label: 'Tout mélangé', sub: 'un peu de tout' },
];
const DURATION = 60;
const MEDALS = [[20, 'or'], [14, 'argent'], [8, 'bronze']];

/* ------------------------------------------------------------------ */
/* Les questions                                                       */
/* ------------------------------------------------------------------ */
const MAJ = ['do', 'sol', 'ré', 'la', 'mi', 'si', 'fa♯', 'fa', 'si♭', 'mi♭', 'la♭', 'ré♭', 'sol♭'];
const MIN = ['la', 'mi', 'si', 'fa♯', 'do♯', 'sol♯', 'ré', 'sol', 'do', 'fa', 'si♭', 'mi♭'];
const NOTES = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si', 'do♯', 'ré♭', 'mi♭', 'fa♯', 'sol♭', 'la♭', 'si♭', 'ré♯', 'sol♯', 'la♯'];
const nm = n => noteName(n);
const countLabel = c => (c === 0 ? 'aucune altération' : c > 0 ? `${c} dièse${c > 1 ? 's' : ''}` : `${-c} bémol${c < -1 ? 's' : ''}`);
const okNote = n => Math.abs(n.a) <= 1;
/** Quatre réponses différentes, la bonne comprise, dans le désordre. */
function four(answer, pool) {
  const out = [answer];
  for (const x of shuffle(pool.filter(Boolean))) { if (out.length >= 4) break; if (!out.includes(x)) out.push(x); }
  return out.length >= 4 ? shuffle(out) : null;
}
const keyCount = (t, mode) => keySignature(t, mode).count;

const GEN = {
  armures() {
    const r = Math.random();
    if (r < 0.35) { // nombre → tonalité majeure
      const t = pick(MAJ.filter(x => x !== 'do'));
      const c = keyCount(t, 'maj');
      const ans = keyName(t, 'maj');
      const pool = MAJ.filter(x => x !== t && Math.abs(keyCount(x, 'maj') - c) <= 2).map(x => keyName(x, 'maj'));
      return { q: `${countLabel(c).replace(/^./, s => s.toUpperCase())} à l’armure : quelle tonalité majeure ?`, a: ans, options: four(ans, pool), why: c > 0 ? 'Dièses : la tonique majeure est un demi-ton au-dessus du dernier dièse.' : 'Bémols : la tonique majeure est l’avant-dernier bémol (un bémol : fa majeur).' };
    }
    if (r < 0.75) { // tonalité → nombre
      const minor = Math.random() < 0.4;
      const t = pick(minor ? MIN : MAJ);
      const c = keyCount(t, minor ? 'min' : 'maj');
      const ans = countLabel(c);
      const pool = [c + 1, c - 1, -c, c + 2, c - 2].filter(x => Math.abs(x) <= 7 && x !== c).map(countLabel);
      return { q: `Armure de ${keyName(t, minor ? 'min' : 'maj')} ?`, a: ans, options: four(ans, pool), why: minor ? `Même armure que son relatif majeur, ${keyName(relative(t, 'min'), 'maj')}.` : 'Ordre des dièses : fa do sol ré la mi si ; des bémols : si mi la ré sol do fa.' };
    }
    // le dernier dièse ou bémol
    const t = pick(MAJ.filter(x => Math.abs(keyCount(x, 'maj')) >= 2));
    const c = keyCount(t, 'maj');
    const list = c > 0 ? SHARP_ORDER.map(x => x + '♯') : FLAT_ORDER.map(x => x + '♭');
    const ans = list[Math.abs(c) - 1];
    return { q: `Le dernier ${c > 0 ? 'dièse' : 'bémol'} de l’armure de ${keyName(t, 'maj')} ?`, a: ans, options: four(ans, list.filter(x => x !== ans).slice(Math.max(0, Math.abs(c) - 3), Math.abs(c) + 2)), why: `${countLabel(c)} : ${list.slice(0, Math.abs(c)).join(', ')}.` };
  },
  relatives() {
    if (Math.random() < 0.55) {
      const t = pick(MAJ);
      const r = relative(t, 'maj');
      const ans = keyName(r, 'min');
      const pool = [keyName(t, 'min'), keyName(transpose(t, '3m'), 'min'), keyName(transpose(t, '5J'), 'min'), keyName(transpose(t, '2M', 'down'), 'min'), keyName(transpose(r, '5J'), 'min')].filter(x => !/𝄫|𝄪/.test(x));
      return { q: `Le relatif mineur de ${keyName(t, 'maj')} ?`, a: ans, options: four(ans, pool), why: 'Le relatif mineur est une tierce mineure plus bas, avec la même armure.' };
    }
    const t = pick(MIN);
    const r = relative(t, 'min');
    const ans = keyName(r, 'maj');
    const pool = [keyName(t, 'maj'), keyName(transpose(t, '3m', 'down'), 'maj'), keyName(transpose(t, '5J'), 'maj'), keyName(transpose(t, '2M'), 'maj')].filter(x => !/𝄫|𝄪/.test(x));
    return { q: `Le relatif majeur de ${keyName(t, 'min')} ?`, a: ans, options: four(ans, pool), why: 'Le relatif majeur est une tierce mineure plus haut, avec la même armure.' };
  },
  intervalles() {
    const IVS = ['2m', '2M', '3m', '3M', '4J', '4A', '5d', '5J', '6m', '6M', '7m', '7M'];
    for (let k = 0; k < 20; k++) {
      const a = parseNote(pick(NOTES));
      const iv = pick(IVS);
      const b = transpose(a, iv);
      if (!okNote(b)) continue;
      const it = interval(a, b);
      if (Math.random() < 0.55) { // nommer
        const PERF = [1, 4, 5, 8];
        const quals = PERF.includes(it.number) ? ['J', 'A', 'd'] : ['M', 'm', 'A', 'd'];
        // une qualité possible pour le nombre voisin (pas de « quinte majeure » ni de « tierce juste »)
        const qFor = (num, q) => (PERF.includes(num) ? (q === 'M' || q === 'm' ? 'J' : q) : (q === 'J' ? 'M' : q));
        const pool = [...quals.filter(q => q !== it.q).map(q => ivName(it.number, q)), it.number < 7 ? ivName(it.number + 1, qFor(it.number + 1, it.q)) : null, it.number > 2 ? ivName(it.number - 1, qFor(it.number - 1, it.q)) : null];
        return { q: `De ${nm(a)} à ${nm(b)}, en montant ?`, a: it.name, options: four(it.name, pool), why: `${it.semis} demi-tons sur ${it.number} notes (${nm(a)} … ${nm(b)}) : ${it.name}.` };
      }
      // construire
      const cand = IVS.filter(x => x !== iv && Math.abs(parseInt(x, 10) - it.number) <= 1).map(x => transpose(a, x)).filter(okNote).map(nm);
      return { q: `Une ${it.name} au-dessus de ${nm(a)} ?`, a: nm(b), options: four(nm(b), cand), why: `${nm(a)} → ${nm(b)} : ${it.number} notes, ${it.semis} demi-tons.` };
    }
    return GEN.relatives();
  },
  accords() {
    const Q = ['M', 'm', 'dim', 'aug'];
    for (let k = 0; k < 20; k++) {
      const root = parseNote(pick(['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si', 'si♭', 'mi♭', 'la♭', 'fa♯', 'do♯', 'ré♭']));
      const q = Math.random() < 0.7 ? pick(['M', 'm']) : pick(['dim', 'aug']);
      const notes = chord(root, q);
      if (!notes.every(okNote)) continue;
      const spell = ns => ns.map(nm).join(' – ');
      const name = `${nm(root)} ${CHORD_NAME[q]}`;
      if (Math.random() < 0.6) {
        const pool = Q.filter(x => x !== q).map(x => chord(root, x)).filter(ns => ns.every(okNote)).map(spell);
        return { q: `Les notes de l’accord de ${name} ?`, a: spell(notes), options: four(spell(notes), pool), why: { M: 'Majeur : tierce majeure, puis tierce mineure.', m: 'Mineur : tierce mineure, puis tierce majeure.', dim: 'Diminué : deux tierces mineures.', aug: 'Augmenté : deux tierces majeures.' }[q] };
      }
      const pool = Q.filter(x => x !== q).map(x => `${nm(root)} ${CHORD_NAME[x]}`);
      return { q: `${spell(notes)} : quel accord ?`, a: name, options: four(name, pool), why: 'Regarde la tierce (majeure ou mineure), puis la quinte (juste, diminuée ou augmentée).' };
    }
    return GEN.armures();
  },
  degres() {
    const DEG = ['tonique', 'sus-tonique', 'médiante', 'sous-dominante', 'dominante', 'sus-dominante', 'sensible'];
    if (Math.random() < 0.3) { // la sensible en mineur (forme harmonique)
      const t = pick(MIN.filter(x => okNote(scale(x, 'harmMin')[6]))); // pas de double dièse (sol♯ mineur : fa𝄪)
      const harm = scale(t, 'harmMin');
      const nat = scale(t, 'natMin');
      const ans = nm(harm[6]);
      const pool = [nm(nat[6]), nm(harm[5]), nm(transpose(t, '2M')), nm(harm[4])];
      return { q: `La sensible de ${keyName(t, 'min')} ?`, a: ans, options: four(ans, pool), why: 'En mineur, la sensible est le 7e degré haussé (forme harmonique) : un demi-ton sous la tonique.' };
    }
    const t = pick(MAJ);
    const sc = scale(t, 'maj');
    const d = pick([1, 3, 4, 5, 6]);
    const ans = nm(sc[d]);
    const pool = sc.slice(0, 7).map(nm).filter(x => x !== ans);
    return { q: `La ${DEG[d]} de ${keyName(t, 'maj')} ?`, a: ans, options: four(ans, pool), why: `${keyName(t, 'maj')} : ${sc.slice(0, 7).map(nm).join(' ')} ; la ${DEG[d]} est le ${d + 1}e degré.` };
  },
  quintes() {
    const r = Math.random();
    const t = parseNote(pick(['do', 'sol', 'ré', 'la', 'mi', 'si', 'fa', 'si♭', 'mi♭', 'la♭', 'ré♭', 'fa♯']));
    if (r < 0.4) {
      const ans = nm(transpose(t, '5J'));
      const pool = [transpose(t, '4J'), transpose(t, '5d'), transpose(t, '6m'), transpose(t, '5J', 'down'), transpose(t, '5A')].filter(okNote).map(nm);
      return { q: `Une quinte juste au-dessus de ${nm(t)} ?`, a: ans, options: four(ans, pool), why: 'Quinte juste : cinq notes, trois tons et demi. Sur le cycle, un dièse de plus (ou un bémol de moins).' };
    }
    if (r < 0.7) {
      const ans = nm(transpose(t, '5J', 'down'));
      const pool = [transpose(t, '5J'), transpose(t, '4J', 'down'), transpose(t, '4A'), transpose(t, '5d', 'down')].filter(okNote).map(nm);
      return { q: `Une quinte juste en dessous de ${nm(t)} ?`, a: ans, options: four(ans, pool), why: 'Une quinte en dessous = une quarte au-dessus : sur le cycle, un bémol de plus.' };
    }
    const up = Math.random() < 0.5;
    const k = up ? transpose(t, '5J') : transpose(t, '5J', 'down');
    if (!okNote(k)) return GEN.relatives();
    const ans = keyName(k, 'maj');
    const pool = [keyName(up ? transpose(t, '5J', 'down') : transpose(t, '5J'), 'maj'), keyName(relative(t, 'maj'), 'min'), keyName(transpose(t, '2M'), 'maj'), keyName(transpose(t, '3M'), 'maj')].filter(x => !/𝄫|𝄪/.test(x));
    return { q: `La tonalité voisine qui a ${up ? 'un dièse de plus (ou un bémol de moins)' : 'un bémol de plus (ou un dièse de moins)'} que ${keyName(t, 'maj')} ?`, a: ans, options: four(ans, pool), why: up ? 'Une quinte au-dessus : un dièse de plus.' : 'Une quinte en dessous : un bémol de plus.' };
  },
};
/** Une question d'un thème (« tout » : un thème au hasard). Toujours quatre réponses différentes. */
export function question(theme) {
  for (let k = 0; k < 30; k++) {
    const t = theme === 'tout' || !GEN[theme] ? pick(Object.keys(GEN)) : theme;
    const q = GEN[t]();
    if (q && q.options && q.options.length === 4 && q.options.includes(q.a) && new Set(q.options).size === 4) return { ...q, theme: t };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Records et défi du jour                                              */
/* ------------------------------------------------------------------ */
const read = () => ({ best: {}, streak: {}, hist: [], ...(store.get('defis') || {}) });
export const bestOf = id => read().best[id] || 0;
export function dailyTheme(now = Date.now()) {
  const list = THEMES.filter(t => t.id !== 'tout');
  const d = Math.floor((new Date(now).setHours(12, 0, 0, 0)) / 864e5);
  return list[d % list.length];
}
const medalOf = s => (MEDALS.find(([n]) => s >= n) || [0, null])[1];

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */
export function mountDefis(el, { theme = null, compact = false, title = true, onFinish = null } = {}) {
  let alive = true, timer = null, raf = 0, keyOff = null;
  const frame = h('div', { class: 'w-frame df-frame' + (compact ? ' ns-bare' : '') });
  const body = h('div', { class: 'w-body' });
  if (!compact && title) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Défi éclair'), h('span', { class: 'w-sub' }, 'une minute')));
  el.__defi = { current: null }; // pour les tests : la question affichée
  frame.append(body);
  el.append(frame);
  const stop = () => { clearTimeout(timer); cancelAnimationFrame(raf); if (keyOff) document.removeEventListener('keydown', keyOff); keyOff = null; };
  let chosen = THEMES.find(t => t.id === theme) ? theme : dailyTheme().id;

  function menu() {
    stop();
    body.innerHTML = '';
    const st = read();
    const daily = dailyTheme();
    const grid = h('div', { class: 'df-themes' });
    for (const t of THEMES) {
      const b = h('button', { type: 'button', class: 'df-theme' + (t.id === chosen ? ' on' : '') },
        h('b', {}, t.label), h('small', {}, t.sub), h('span', { class: 'df-rec small' }, st.best[t.id] ? `record ${st.best[t.id]}${medalOf(st.best[t.id]) ? ' · ' + medalOf(st.best[t.id]) : ''}` : 'pas encore joué'),
        t.id === daily.id ? h('i', { class: 'df-daily' }, 'défi du jour') : null);
      b.addEventListener('click', () => { chosen = t.id; grid.querySelectorAll('.df-theme').forEach(x => x.classList.toggle('on', x === b)); go.textContent = `C’est parti : ${t.label.toLowerCase()} (1 minute)`; });
      grid.append(b);
    }
    const go = h('button', { class: 'btn primary lg', type: 'button' }, `C’est parti : ${THEMES.find(t => t.id === chosen).label.toLowerCase()} (1 minute)`);
    go.addEventListener('click', play);
    body.append(compact ? null : h('p', { class: 'small mt-0' }, 'Réponds juste au plus de questions en une minute. Une erreur ne coûte que du temps : la bonne réponse s’affiche, puis on continue. Médailles : bronze à 8, argent à 14, or à 20.'), grid, h('div', { class: 'btn-row mt-1' }, go));
  }

  function play() {
    stop();
    body.innerHTML = '';
    let score = 0, n = 0, streak = 0, best = 0, locked = false;
    const misses = [];
    const t0 = performance.now();
    const bar = h('div', { class: 'progress df-time' }, h('i'));
    const sc = h('div', { class: 'df-score' }, h('b', {}, '0'), h('small', {}, 'juste'));
    const stk = h('div', { class: 'df-streak small' });
    const qEl = h('div', { class: 'df-q', 'aria-live': 'polite' });
    const opts = h('div', { class: 'df-opts' });
    body.append(h('div', { class: 'df-top' }, sc, stk), bar, qEl, opts);
    const tick = () => {
      const left = Math.max(0, DURATION - (performance.now() - t0) / 1000);
      bar.firstChild.style.width = `${left / DURATION * 100}%`;
      bar.classList.toggle('low', left < 10);
      if (left <= 0) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    const next = () => {
      if (!alive) return;
      const q = question(chosen);
      if (!q) { finish(); return; }
      el.__defi.current = q;
      locked = false;
      qEl.textContent = q.q;
      opts.innerHTML = '';
      q.options.forEach((o, i) => {
        const b = h('button', { type: 'button', class: 'df-opt' }, h('span', { class: 'df-k' }, String(i + 1)), o);
        b.addEventListener('click', () => answer(q, o, b));
        opts.append(b);
      });
      keyOff && document.removeEventListener('keydown', keyOff);
      keyOff = e => { const k = +e.key; if (k >= 1 && k <= 4) { e.preventDefault(); opts.children[k - 1]?.click(); } };
      document.addEventListener('keydown', keyOff);
    };
    const answer = (q, o, b) => {
      if (locked) return;
      locked = true;
      n++;
      const ok = o === q.a;
      if (ok) { score++; streak++; best = Math.max(best, streak); b.classList.add('ok'); }
      else {
        streak = 0; b.classList.add('bad');
        [...opts.children].find(x => x.lastChild.textContent === q.a)?.classList.add('ok');
        misses.push(q);
      }
      sc.firstChild.textContent = String(score);
      stk.textContent = streak >= 3 ? `série de ${streak}` : '';
      stk.classList.toggle('hot', streak >= 5);
      timer = setTimeout(next, ok ? 260 : 1100);
    };
    raf = requestAnimationFrame(tick);
    next();

    function finish() {
      stop();
      const st = read();
      const prev = st.best[chosen] || 0;
      const record = score > prev;
      const x = { ...st, best: { ...st.best, [chosen]: Math.max(prev, score) }, streak: { ...st.streak, [chosen]: Math.max(st.streak[chosen] || 0, best) }, hist: [...st.hist, { theme: chosen, at: Date.now(), score, n }].slice(-100) };
      store.set('defis', x);
      const medal = medalOf(score);
      body.innerHTML = '';
      body.append(h('div', { class: 'df-end' + (record ? ' record' : '') },
        h('div', { class: 'df-big' }, h('b', {}, String(score)), h('span', {}, `bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} en une minute`)),
        h('p', { class: 'df-verdict' }, record ? (prev ? `Nouveau record ! (avant : ${prev})` : 'Premier record !') : `Ton record : ${prev}.`, medal ? ` Médaille d’${medal}.` : ''),
        h('p', { class: 'small muted' }, `${n ? Math.round(score / n * 100) : 0} % de justes · meilleure série : ${best}`)));
      if (misses.length) {
        body.append(h('div', { class: 'df-miss' }, h('b', { class: 'small' }, 'Ce qui t’a trompé'),
          h('ul', { class: 'small' }, ...misses.slice(0, 6).map(q => h('li', {}, `${q.q} → `, h('b', {}, q.a), q.why ? h('span', { class: 'muted' }, ` (${q.why})`) : null)))));
      }
      const again = h('button', { class: 'btn primary', type: 'button' }, 'Rejouer');
      again.addEventListener('click', play);
      const other = h('button', { class: 'btn', type: 'button' }, 'Autre thème');
      other.addEventListener('click', menu);
      body.append(h('div', { class: 'btn-row mt-1' }, again, other));
      onFinish?.({ score, n, theme: chosen });
    }
  }

  menu();
  return () => { alive = false; stop(); };
}
