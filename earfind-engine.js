// « Trouve la note » (V8.4) : le moteur, sans affichage (testable sous Node).
// Une tonalité par séance. Une cadence installe la tonique, une note sonne, tu la cherches au clavier : les essais sont
// comptés, sans pénalité. La difficulté s'ajuste seule pour rester vers 80-85 % de réussite du premier coup
// (Wilson et al., 2019) : une note s'ajoute quand tu réussis, la dernière ajoutée se retire quand c'est trop dur.
// Ordre des notes inspiré de Kodály : les notes stables de l'accord (1, 5, 3), puis la et ré (gamme pentatonique,
// sans demi-ton), la tonique aiguë et les notes graves, enfin fa et si (les demi-tons, qui « tirent » vers mi et do).
// Puis des formules de deux à cinq notes (Gordon : formules de tonique, de dominante, de sous-dominante).

export const MAJ = [0, 2, 4, 5, 7, 9, 11];
export const HMIN = [0, 2, 3, 5, 7, 8, 11]; // mineur harmonique : la sensible monte vers la tonique

/** L'ordre d'arrivée des notes. Degrés : 1 à 7, 8 = la tonique aiguë ; -5, -6, -7 = 5, 6, 7 sous la tonique. */
export const ORDER = {
  maj: [1, 5, 3, 6, 2, 8, -6, -5, 4, 7, -7],
  min: [1, 5, 3, 4, 2, 8, 7, -7, 6, -5, -6],
};
export const START = 3;   // notes au départ (1, 5, 3)
/** Seuils de l'adaptation (réglés par simulation, voir les notes de construction V8.4). */
export const TUNE = { add: 0.9, run: 14, drop: 0.6, drop10: 0.3, graceN: 30, grace: 0.45, every: 10 };
export const FLOOR = 2;   // jamais moins de deux notes (1 et 5)

/** Les tonalités, dans l'ordre où elles s'ouvrent : do, puis sol et fa, puis les voisines ; le mineur ensuite. */
export const KEY_PATH = ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'Am', 'Em', 'Dm', 'Fm', 'Cm', 'Gm'];
const KEY_INFO = {
  C: [0, 'maj', 'do majeur', 'do'], G: [7, 'maj', 'sol majeur', 'sol'], F: [5, 'maj', 'fa majeur', 'fa'], D: [2, 'maj', 'ré majeur', 'ré'],
  Bb: [10, 'maj', 'si♭ majeur', 'si♭'], A: [9, 'maj', 'la majeur', 'la'], Eb: [3, 'maj', 'mi♭ majeur', 'mi♭'],
  Am: [9, 'min', 'la mineur', 'la'], Em: [4, 'min', 'mi mineur', 'mi'], Dm: [2, 'min', 'ré mineur', 'ré'], Fm: [5, 'min', 'fa mineur', 'fa'],
  Cm: [0, 'min', 'do mineur', 'do'], Gm: [7, 'min', 'sol mineur', 'sol'],
};
const LETTERS = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

/** { id, pc, mode, name, tonic (MIDI), names (les 7 notes de la gamme, bien orthographiées) } */
export function keyInfo(k) {
  const [pc, mode, name, root] = KEY_INFO[k] || KEY_INFO.C;
  // tonique la plus proche du do central (entre sol2 et fa♯3) : tout l'ambitus (5 grave à 8) reste au milieu du clavier
  const a = 48 + pc, b = 60 + pc;
  const tonic = Math.abs(a - 60) < Math.abs(b - 60) ? a : b;
  const sc = mode === 'min' ? HMIN : MAJ;
  const li = LETTERS.indexOf(root.replace(/[♭♯]/g, ''));
  const names = sc.map((iv, i) => {
    const L = (li + i) % 7;
    let acc = ((pc + iv) - LETTER_PC[L]) % 12;
    if (acc > 6) acc -= 12;
    if (acc < -6) acc += 12;
    return LETTERS[L] + (acc === 1 ? '♯' : acc === -1 ? '♭' : acc === 2 ? '𝄪' : acc === -2 ? '𝄫' : '');
  });
  return { id: k, pc, mode, name, tonic, names };
}
export const isKey = k => !!KEY_INFO[k];

/** Demi-tons depuis la tonique. */
export function degOffset(d, mode = 'maj') {
  const sc = mode === 'min' ? HMIN : MAJ;
  if (d > 0) return sc[(d - 1) % 7] + 12 * Math.floor((d - 1) / 7);
  return sc[-d - 1] - 12;
}
export const degMidi = (info, d) => info.tonic + degOffset(d, info.mode);
/** Le chiffre affiché (les notes graves gardent leur chiffre : « 5 », dit « 5 grave »). */
export const degNum = d => String(Math.abs(d) === 8 ? 8 : Math.abs(d));
export const degLabel = d => (d < 0 ? `${-d} grave` : d === 8 ? '8 (1 aigu)' : String(d));
/** Dans une suite de degrés écrite en ligne : les notes graves prennent une virgule, comme en solfège de Kodály (« 5, »). */
export const degShort = d => (d < 0 ? `${-d},` : String(d));
/** Le nom de la note d'un degré dans une tonalité. */
export const degName = (info, d) => info.names[(Math.abs(d) - 1) % 7];
/** Range les degrés du grave à l'aigu. */
export const byPitch = (degs, mode = 'maj') => [...degs].sort((a, b) => degOffset(a, mode) - degOffset(b, mode));

/** Le chemin le plus court vers la tonique (méthode fonctionnelle) : 2, 3, 4 descendent vers 1 ; 5, 6, 7 montent vers 8 ;
 *  sous la tonique, 7 grave monte vers 1, 6 et 5 graves descendent vers 5 grave puis remontent : ici, ils montent vers 1. */
export function resolutionPath(d) {
  if (d === 1 || d === 8) return [d];
  if (d > 1 && d <= 4) { const p = []; for (let k = d; k >= 1; k--) p.push(k); return p; }
  if (d >= 5 && d <= 7) { const p = []; for (let k = d; k <= 8; k++) p.push(k); return p; }
  // graves : -7 → 1 ; -6 → -7 → 1 ; -5 → -6 → -7 → 1
  if (d === -7) return [-7, 1];
  if (d === -6) return [-6, -7, 1];
  if (d === -5) return [-5, -6, -7, 1];
  return [d, 1];
}

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */
export const ITEMS_MAX = 500, SESSIONS_MAX = 120;
export function freshState() {
  return { v: 1, keys: {}, items: [], sessions: [], lastKey: null, opts: { minutes: 5, sing: false, drone: false, marks: 'auto' }, intro: false };
}
/** Complète un état lu dans le stockage (ancien ou partiel). */
export function normalize(S) {
  const f = freshState();
  if (!S || typeof S !== 'object') return f;
  return { ...f, ...S, keys: { ...(S.keys || {}) }, items: Array.isArray(S.items) ? S.items : [], sessions: Array.isArray(S.sessions) ? S.sessions : [], opts: { ...f.opts, ...(S.opts || {}) } };
}
/** Les notes de départ d'une tonalité nouvelle : celles déjà sûres ailleurs (même mode), moins la dernière. */
export function initialSet(S, k) {
  const mode = keyInfo(k).mode;
  const order = ORDER[mode];
  let n = START;
  for (const [k2, ks] of Object.entries(S.keys || {})) {
    if (k2 === k || !isKey(k2) || keyInfo(k2).mode !== mode || !ks || !Array.isArray(ks.set)) continue;
    n = Math.max(n, ks.set.length - 1);
  }
  return order.slice(0, Math.min(n, order.length));
}
export function keyState(S, k) {
  if (!S.keys[k]) S.keys[k] = { set: initialSet(S, k), changedAt: 0, added: null, full: false, motif: 2, mhist: [], sessions: 0, last: 0 };
  return S.keys[k];
}

/* ------------------------------------------------------------------ */
/* Mesures                                                             */
/* ------------------------------------------------------------------ */
/** Notes seules (pas les notes des formules) d'une tonalité, les plus récentes à la fin. */
export const singles = (S, k) => S.items.filter(x => x.k === k && !x.m);
/** Part du premier coup et essais par note sur une liste d'essais. */
export function rate(list) {
  if (!list.length) return { n: 0, ok: null, tries: null };
  const ok = list.filter(x => x.o).length / list.length;
  const tries = list.reduce((a, x) => a + Math.max(1, x.t || 1), 0) / list.length;
  return { n: list.length, ok, tries };
}
/** Réussite récente dans une tonalité (20 dernières notes seules), null s'il y en a moins de 5. */
export function recentAcc(S, k, n = 20) {
  const xs = singles(S, k).slice(-n);
  return xs.length >= 5 ? rate(xs).ok : null;
}
/** Réussite d'un degré sur ses derniers essais (null : pas assez d'essais). */
export function degAcc(S, k, d, n = 6) {
  const xs = singles(S, k).filter(x => x.d === d).slice(-n);
  return xs.length >= 2 ? xs.filter(x => x.o).length / xs.length : null;
}
/** La carte d'une tonalité : chaque note de l'ordre, et où tu en es (sure, en cours, nouvelle, à venir). */
export function degreeMap(S, k) {
  const info = keyInfo(k);
  const ks = S.keys[k] || { set: initialSet(S, k) };
  return ORDER[info.mode].map(d => {
    const inSet = ks.set.includes(d);
    const acc = degAcc(S, k, d, 8);
    const state = !inSet ? 'later' : acc == null ? 'new' : acc >= 0.85 ? 'sure' : 'learning';
    return { d, state, acc, name: degName(info, d) };
  });
}
/** Par jour (30 derniers jours) : { day, n, ok, tries } ; jours sans essai omis. */
export function daily(S, days = 30, now = Date.now()) {
  const out = new Map();
  const from = now - days * 864e5;
  for (const x of S.items) {
    if (x.at < from) continue;
    const d = new Date(x.at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(x);
  }
  return [...out.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([day, xs]) => ({ day, ...rate(xs) }));
}

/* ------------------------------------------------------------------ */
/* Tonalités : lesquelles sont ouvertes, laquelle aujourd'hui           */
/* ------------------------------------------------------------------ */
/** Ouvertes : do ; sol et fa après deux séances en do (ou cinq notes) ; puis une de plus quand toutes celles ouvertes
 *  ont au moins six notes à 80 % ; le mineur quand do, sol et fa ont la gamme complète. */
export function unlockedKeys(S) {
  const out = ['C'];
  const c = S.keys.C;
  if (!c || ((c.sessions || 0) < 2 && (c.set || []).length < 5)) return out;
  out.push('G', 'F');
  for (const k of KEY_PATH.slice(3)) {
    const ready = out.every(x => { const ks = S.keys[x]; const acc = recentAcc(S, x); return ks && ks.set.length >= 6 && acc != null && acc >= 0.8; });
    if (!ready) break;
    if (keyInfo(k).mode === 'min' && !['C', 'G', 'F'].every(x => S.keys[x] && S.keys[x].full)) break;
    out.push(k);
  }
  return out;
}
/** La tonalité de la prochaine séance : une par séance, jamais deux fois de suite la même s'il y a le choix ; la plus
 *  ancienne et la moins sûre d'abord (une tonalité jamais travaillée passe devant). */
export function pickKey(S, now = Date.now()) {
  const U = unlockedKeys(S);
  if (U.length === 1) return U[0];
  const score = k => {
    const ks = S.keys[k];
    const days = ks && ks.last ? (now - ks.last) / 864e5 : 30;
    const acc = recentAcc(S, k);
    return Math.min(days, 14) + (1 - (acc == null ? 0.5 : acc)) * 3 - (k === S.lastKey ? 100 : 0) - KEY_PATH.indexOf(k) * 0.01;
  };
  return U.slice().sort((a, b) => score(b) - score(a))[0];
}

/* ------------------------------------------------------------------ */
/* Choisir la question                                                  */
/* ------------------------------------------------------------------ */
/**
 * Le degré à faire entendre. ctx = { prev: [degrés déjà posés], fresh: { d, left } (la note nouvelle) }.
 * Les notes ratées récemment reviennent plus souvent ; la note nouvelle sort environ 30 % du temps pendant 10 questions ;
 * jamais trois fois de suite la même, et la même deux fois de suite moins souvent.
 */
export function pickDegree(S, k, ctx = {}, rnd = Math.random) {
  const set = keyState(S, k).set;
  const prev = ctx.prev || [];
  let w = set.map(d => { const a = degAcc(S, k, d); return 1 + 3 * (1 - (a == null ? 0.6 : a)); });
  const fr = ctx.fresh;
  if (fr && fr.left > 0 && set.includes(fr.d) && set.length > 1) {
    const i = set.indexOf(fr.d);
    const others = w.reduce((a, x, j) => a + (j === i ? 0 : x), 0);
    w[i] = others * 0.43; // ≈ 30 %
  }
  const p1 = prev[prev.length - 1], p2 = prev[prev.length - 2];
  w = w.map((x, j) => (set[j] === p1 ? (p1 === p2 ? 0 : x * 0.4) : x));
  if (!w.some(x => x > 0)) w = set.map(d => (d === p1 ? 0 : 1));
  if (!w.some(x => x > 0)) return set[0];
  const tot = w.reduce((a, b) => a + b, 0);
  let r = rnd() * tot;
  for (let j = 0; j < set.length; j++) { r -= w[j]; if (r <= 0 && w[j] > 0) return set[j]; }
  return set[w.findLastIndex ? w.findLastIndex(x => x > 0) : w.length - 1];
}

/** Formules de Gordon (tonique, dominante, sous-dominante) et petits chemins par degrés conjoints. */
const PATTERNS = {
  maj: [
    [1, 3], [3, 1], [1, 5], [5, 1], [5, 3], [3, 5], [8, 5], [5, 8], [1, 8], [-5, 1], [1, -5], [5, 6], [6, 5], [2, 1], [1, 2],
    [1, 3, 5], [5, 3, 1], [1, 5, 3], [3, 5, 1], [8, 5, 3], [3, 5, 8], [5, 6, 5], [3, 2, 1], [1, 2, 3], [6, 5, 3], [2, 3, 1],
    [5, 7, 2], [2, 7, 5], [7, 2, 5], [2, 7, 1], [4, 2, 7], [5, 4, 2], [4, 6, 8], [8, 6, 4], [1, 4, 6], [6, 4, 1], [5, 4, 3],
    [3, 4, 5], [8, 7, 8], [1, -7, 1], [-6, -5, 1], [1, -6, -5], [5, 6, 8], [8, 6, 5], [-5, -6, 1],
    [6, 5, 4, 3], [3, 2, 1, -7], [1, 2, 3, 1], [5, 3, 2, 1], [1, 3, 2, 1], [5, 6, 5, 3], [3, 5, 6, 5], [8, 7, 6, 5], [5, 4, 3, 2],
    [1, -7, -6, -5], [-5, 1, 3, 5], [5, 3, 1, -5], [3, 2, 1, 2], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [8, 7, 6, 5, 3], [1, 3, 5, 3, 1], [3, 5, 6, 5, 3],
  ],
  min: [
    [1, 3], [3, 1], [1, 5], [5, 1], [5, 3], [3, 5], [8, 5], [5, 8], [2, 1], [1, 2], [7, 8], [8, 7], [-7, 1], [4, 3],
    [1, 3, 5], [5, 3, 1], [1, 5, 3], [3, 5, 1], [3, 2, 1], [1, 2, 3], [5, 4, 3], [3, 4, 5], [8, 7, 8], [1, -7, 1], [5, 7, 2],
    [2, 7, 5], [7, 2, 1], [5, 6, 5], [6, 5, 4], [4, 3, 2], [5, 8, 7], [1, 7, 8],
    [4, 3, 2, 1], [5, 4, 3, 2], [1, 2, 3, 1], [5, 3, 2, 1], [8, 7, 6, 5], [1, -7, 1, 5], [3, 2, 1, -7], [5, 6, 5, 3],
    [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [1, 3, 5, 3, 1], [8, 7, 6, 5, 4],
  ],
};
/** Une formule de L notes, toutes dans les notes en jeu ; sinon une petite marche par degrés voisins dans ces notes. */
export function pickMotif(S, k, L, rnd = Math.random, avoid = null) {
  const info = keyInfo(k);
  const set = keyState(S, k).set;
  const fits = PATTERNS[info.mode].filter(p => p.length === L && p.every(d => set.includes(d)) && (!avoid || p.join() !== avoid.join()));
  if (fits.length && rnd() < 0.75) return fits[Math.floor(rnd() * fits.length)].slice();
  const sorted = byPitch(set, info.mode);
  for (let g = 0; g < 60; g++) {
    let i = Math.floor(rnd() * sorted.length);
    const seq = [sorted[i]];
    while (seq.length < L) {
      let step = 0, h = 0;
      do { step = Math.floor(rnd() * 5) - 2; h++; } while (h < 30 && (step === 0 || i + step < 0 || i + step >= sorted.length));
      if (step === 0 || i + step < 0 || i + step >= sorted.length) break;
      i += step;
      seq.push(sorted[i]);
    }
    if (seq.length === L && (!avoid || seq.join() !== avoid.join())) return seq;
  }
  return fits.length ? fits[0].slice() : sorted.slice(0, L);
}
/** Faut-il une formule à cette question ? À partir de cinq notes, une question sur quatre ; gamme complète : une sur deux. */
export function motifDue(S, k, qIndex) {
  const ks = keyState(S, k);
  if (ks.set.length < 5) return false;
  return ks.full ? qIndex % 2 === 1 : qIndex % 4 === 3;
}
/** Longueur des formules : +1 après quatre réussies de suite du premier coup ; −1 après trois ratées sur quatre. */
export function motifResult(S, k, allFirst) {
  const ks = keyState(S, k);
  ks.mhist = [...(ks.mhist || []), allFirst ? 1 : 0].slice(-8);
  const last4 = ks.mhist.slice(-4);
  let change = 0;
  if (last4.length === 4 && last4.every(x => x === 1) && ks.motif < 5) { ks.motif++; ks.mhist = []; change = 1; }
  else if (last4.length === 4 && last4.filter(x => x === 0).length >= 3 && ks.motif > 2) { ks.motif--; ks.mhist = []; change = -1; }
  return change;
}

/* ------------------------------------------------------------------ */
/* Adapter la difficulté                                               */
/* ------------------------------------------------------------------ */
/**
 * Après chaque note seule : { action: 'add' | 'remove' | 'full', d } ou null. Bilans par blocs de 10 notes.
 * Ajout : 90 % du premier coup sur les 20 dernières notes depuis le dernier changement (18 sur 20), ou 14 réussies de
 * suite, et aucune note en jeu sous 70 % (sur ses 5 derniers essais, si elle en a au moins 3).
 * Retrait de la dernière note ajoutée : sous 60 % sur 20 notes, ou 3 réussies sur 10 ; dans les 30 notes qui suivent un
 * ajout, seulement sous 45 % sur 15 (la note nouvelle a droit à quelques erreurs).
 * Simulation (joueurs fictifs de 45 à 97 % de réussite, 900 notes) : le niveau se stabilise autour de 75 à 80 % de
 * réussite du premier coup, avec deux fois plus d'ajouts que de retraits chez un joueur qui progresse.
 */
export function adapt(S, k) {
  const ks = keyState(S, k);
  const order = ORDER[keyInfo(k).mode];
  const since = singles(S, k).filter(x => x.at > (ks.changedAt || 0));
  // les bilans se font par blocs de 10 notes (et non à chaque note : une fenêtre qui glisse finit toujours par passer
  // le seuil par hasard) ; seules les séries nettes (14 réussies de suite, 3 sur 10) jouent à tout moment
  const atBlock = since.length > 0 && since.length % TUNE.every === 0;
  const acc20 = atBlock && since.length >= 20 ? rate(since.slice(-20)).ok : null;
  const run = since.length >= TUNE.run && since.slice(-TUNE.run).every(x => x.o);
  if ((acc20 != null && acc20 >= TUNE.add) || run) {
    const all = singles(S, k).slice(-60);
    const weak = ks.set.find(d => { const xs = all.filter(x => x.d === d).slice(-5); return xs.length >= 3 && xs.filter(x => x.o).length / xs.length < 0.7; });
    if (weak != null) return null;
    const nd = order.find(d => !ks.set.includes(d));
    if (nd == null) return ks.full ? null : { action: 'full' };
    return { action: 'add', d: nd };
  }
  // retrait : sous 55 % sur 20 notes, ou 3 réussies sur 10 ; juste après un ajout (30 notes), seulement sous 40 % sur 15
  const grace = ks.added && since.length < TUNE.graceN;
  const acc = n => (since.length >= n ? rate(since.slice(-n)).ok : null);
  const tooHard = grace ? (atBlock && acc(15) != null && acc(15) < TUNE.grace) : ((atBlock && acc(20) != null && acc(20) < TUNE.drop) || (acc(10) != null && acc(10) <= TUNE.drop10));
  if (tooHard && ks.set.length > FLOOR) {
    const last = [...ks.set].sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
    return { action: 'remove', d: last };
  }
  return null;
}
export function applyAdapt(S, k, r, now = Date.now()) {
  if (!r) return;
  const ks = keyState(S, k);
  const order = ORDER[keyInfo(k).mode];
  if (r.action === 'add' && !ks.set.includes(r.d)) { ks.set = [...ks.set, r.d].sort((a, b) => order.indexOf(a) - order.indexOf(b)); ks.added = { d: r.d, at: now }; }
  else if (r.action === 'remove') { ks.set = ks.set.filter(d => d !== r.d); ks.full = false; ks.added = null; }
  else if (r.action === 'full') ks.full = true;
  ks.changedAt = now;
}

/* ------------------------------------------------------------------ */
/* Enregistrer                                                         */
/* ------------------------------------------------------------------ */
/** Un essai : k (tonalité), d (degré), o (1 du premier coup), t (touches jouées jusqu'à la bonne), h (aide utilisée,
 *  0 à 5), ms (temps avant la première touche), s (1 : chantée juste au micro), m (1 : note d'une formule). */
export function record(S, item) {
  S.items.push(item);
  while (S.items.length > ITEMS_MAX) S.items.shift();
}
export function recordSession(S, sess) {
  S.sessions.push(sess);
  while (S.sessions.length > SESSIONS_MAX) S.sessions.shift();
}
/** Où en est une tonalité, en une ligne de chiffres. */
export function keySummary(S, k) {
  const info = keyInfo(k);
  const ks = S.keys[k] || { set: initialSet(S, k), full: false };
  const r = rate(singles(S, k).slice(-20));
  return { info, set: byPitch(ks.set, info.mode), n: ks.set.length, total: ORDER[info.mode].length, full: !!ks.full, ok: r.ok, tries: r.tries, count: r.n, motif: ks.motif || 2 };
}
