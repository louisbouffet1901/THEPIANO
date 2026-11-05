// Ton rythme (V8) : le temps que tu as pour le piano en ce moment (séances par semaine, minutes par séance, minutes
// loin du piano) et tes pauses (DS, concours blancs, vacances sans piano).
// La séance conseillée, le bilan de la semaine et l'objectif de date de la pièce s'y règlent. Rien n'est retiré du
// parcours : avec moins de temps, les domaines tournent d'une séance à l'autre au lieu d'être tous travaillés chaque
// jour, et ce qui n'a pas besoin du clavier (oreille, théorie, la pièce de tête) se fait loin du piano.
import { store } from './store.js';

export const PACE_DAYS = [2, 3, 4, 5, 6, 7];
export const PACE_MINUTES = [10, 15, 20, 30, 45, 60, 75];
export const AWAY_MINUTES = [0, 5, 10, 15];
const DEFAULT = { days: 4, minutes: 20, away: 10 };

export function getPace() {
  const p = { ...DEFAULT, ...(store.get('settings.pace') || {}) };
  if (!PACE_DAYS.includes(p.days)) p.days = DEFAULT.days;
  if (!PACE_MINUTES.includes(p.minutes)) p.minutes = DEFAULT.minutes;
  if (!AWAY_MINUTES.includes(p.away)) p.away = DEFAULT.away;
  return p;
}
/** Le rythme a-t-il été indiqué ? (sinon l'accueil le demande) */
export const paceIsSet = () => !!(store.get('settings.pace') || {}).at;
export function setPace(patch) {
  const p = { ...getPace(), ...patch, at: Date.now() };
  store.set('settings.pace', p);
  store.set('ui.sessMin', p.minutes); // la prochaine séance part de la durée habituelle
  return p;
}
const plural = (n, s, p = s + 's') => (n > 1 ? p : s);
export const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}` : `${m} min`);
/** « 4 séances de 20 min par semaine » */
export const paceLabel = (p = getPace()) => `${p.days} ${plural(p.days, 'séance')} de ${fmtMin(p.minutes)} par semaine`;
export const awayLabel = (p = getPace()) => (p.away ? `${p.away} min par jour loin du piano` : 'rien loin du piano');

/* ------------------------------------------------------------------ */
/* Séance : cases et répartition                                       */
/* ------------------------------------------------------------------ */
/** Cases d'une séance de m minutes : la pièce phare, plus les domaines qui tournent. */
export const casesFor = m => (m <= 20 ? 2 : m <= 30 ? 3 : m <= 45 ? 4 : m <= 60 ? 5 : 6);
/** Parts d'une séance de 60 min (le tableau de la V7) : la répartition de toute durée en découle. */
export const WEIGHTS = { piece: 25, impro: 12, technique: 8, lecture: 8, oreille: 7, autres: 10 };
/** Répartition de la durée : au prorata des parts, 5 min au moins par case (3 min dans une séance de 15 min ou moins). */
export function allocate(cats, total) {
  if (!cats.length) return {};
  const ws = cats.map(c => WEIGHTS[c] || 8);
  const W = ws.reduce((a, b) => a + b, 0);
  const want = total <= 15 ? 3 : 5;
  const floor = total >= cats.length * want ? want : Math.max(1, Math.floor(total / cats.length));
  const mins = ws.map(w => Math.max(floor, Math.round(total * w / W)));
  let diff = total - mins.reduce((a, b) => a + b, 0);
  const order = cats.map((c, i) => i).sort((a, b) => ws[b] - ws[a]);
  let k = 0, guard = 400;
  while (diff !== 0 && guard-- > 0) {
    const i = order[k % order.length];
    if (diff > 0) { mins[i]++; diff--; } else if (mins[i] > floor) { mins[i]--; diff++; }
    k++;
  }
  return Object.fromEntries(cats.map((c, i) => [c, mins[i]]));
}
/** Minutes de la pièce phare dans une séance de m minutes (la pièce, l'improvisation dès 30 min, et les plus lourds des
 *  domaines qui tournent) : sert à l'objectif de date. */
export function pieceMinutes(m) {
  const n = casesFor(m);
  const cats = ['piece', ...(m >= 30 ? ['impro'] : []), 'technique', 'lecture', 'oreille', 'autres'].slice(0, n);
  return allocate(cats, m).piece;
}

/** Parts des domaines qui tournent : l'improvisation (pierre angulaire du parcours) en a le plus ; la lecture ensuite
 *  (le point faible : le rythme). L'oreille compte moitié moins au piano quand elle se travaille aussi loin du piano. */
export const SHARES = { impro: 3, lecture: 2.5, technique: 2, oreille: 1.5, autres: 1 };
/**
 * Fréquences de ton rythme : fois par semaine visées (fractionnaire : 0,5 = toutes les deux semaines) et seuil du
 * conseil (jours sans pratique, hors pauses). La pièce phare : à chaque séance.
 */
export function paceTargets(p = getPace()) {
  const D = p.days;
  const slots = D * (casesFor(p.minutes) - 1);
  const shares = { ...SHARES, oreille: p.away > 0 ? SHARES.oreille / 2 : SHARES.oreille };
  const W = Object.values(shares).reduce((a, b) => a + b, 0);
  const out = { piece: { perWeek: D, after: Math.max(2, Math.ceil(7 / D)) } };
  for (const [c, s] of Object.entries(shares)) {
    const perWeek = Math.min(D, slots * s / W);
    out[c] = { perWeek, after: Math.min(28, Math.max(2, Math.ceil(7 / Math.max(perWeek, 0.25)))) };
  }
  return out;
}
/** « 2 fois par semaine », « 1 fois par semaine », « toutes les 2 semaines »… */
export function freqLabel(perWeek) {
  if (perWeek >= 1.5) return `${Math.round(perWeek)} fois par semaine`;
  if (perWeek >= 0.75) return '1 fois par semaine';
  const w = Math.max(2, Math.round(1 / perWeek));
  return `toutes les ${w} semaines`;
}
/** Ce qui revient « une fois par semaine » à 6 jours de pratique (filage, mélodie d'oreille, improvisation libre)
 *  s'espace avec moins de séances : base × 6 / jours (jusqu'à trois fois plus espacé). */
export const everyDays = (base, p = getPace()) => Math.round(base * Math.min(3, Math.max(1, 6 / p.days)));

/* ------------------------------------------------------------------ */
/* Pauses : DS, concours blanc, vacances sans piano                     */
/* ------------------------------------------------------------------ */
// pause = { from: 'AAAA-MM-JJ', to: 'AAAA-MM-JJ' (prévue, incluse), why, ended: 'AAAA-MM-JJ' | null (reprise), settled }
// Les jours de pause ne comptent pas comme « délaissés » ; l'objectif de date est décalé d'autant à la reprise.
export const WHY = { ds: 'DS', concours: 'concours blanc', vacances: 'vacances sans piano', autre: 'pause' };
const pad = n => String(n).padStart(2, '0');
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const parseDay = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d, 12).getTime(); };
const addDays = (s, n) => dayKey(parseDay(s) + n * 864e5);
export const dayLabel = s => new Date(parseDay(s)).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export const pauses = () => (Array.isArray(store.get('pauses')) ? store.get('pauses') : []);
/** Dernier jour réellement en pause : la veille de la reprise si elle a eu lieu avant la date prévue. */
const lastDay = p => (p.ended && p.ended <= p.to ? addDays(p.ended, -1) : p.to);
/** La pause en cours aujourd'hui (ou null). */
export function currentPause(now = Date.now()) {
  const today = dayKey(now);
  return pauses().find(p => !p.ended && p.from <= today && today <= p.to) || null;
}
export function startPause(to, why = 'autre', now = Date.now()) {
  const from = dayKey(now);
  if (!to || to < from) return null;
  const list = pauses().filter(p => !(p.from === from && !p.ended)).slice(-19);
  const p = { from, to, why: WHY[why] ? why : 'autre', ended: null, settled: false };
  store.set('pauses', [...list, p]);
  return p;
}
/** Reprendre avant la date prévue (ou à la date prévue) : la pause s'arrête, l'objectif est décalé. */
export function endPause(now = Date.now()) {
  const today = dayKey(now);
  const list = pauses().map(p => (!p.ended && p.from <= today && today <= p.to ? { ...p, ended: today } : p));
  store.set('pauses', list);
  return settlePauses(now);
}
/** Jours de pause dans l'intervalle ]a, b] (jours calendaires). `unsettled` : seulement les pauses dont l'objectif de
 *  date n'a pas encore été décalé (pause en cours). */
export function pausedDays(a, b, { unsettled = false } = {}) {
  const list = pauses().filter(p => !unsettled || !p.settled);
  if (!list.length || !(a < b)) return 0;
  const from = dayKey(a), to = dayKey(b);
  let n = 0;
  for (const p of list) {
    const s = p.from > from ? p.from : addDays(from, 1);
    const e = lastDay(p) < to ? lastDay(p) : to;
    if (s <= e) n += Math.round((parseDay(e) - parseDay(s)) / 864e5) + 1;
  }
  return n;
}
/** Ce jour (AAAA-MM-JJ) était-il en pause ? */
export const isPausedDay = k => pauses().some(p => p.from <= k && k <= lastDay(p));
/** Jours d'une pause (effectifs). */
export const pauseLength = p => Math.max(0, Math.round((parseDay(lastDay(p)) - parseDay(p.from)) / 864e5) + 1);
/**
 * Pauses finies et pas encore réglées : l'objectif de date de chaque pièce est décalé du nombre de jours de pause
 * (et son point de départ aussi, pour que l'avance attendue ne compte pas ces jours). Renvoie le total décalé.
 */
export function settlePauses(now = Date.now()) {
  const today = dayKey(now);
  let shifted = 0;
  const list = pauses().map(p => {
    if (p.settled) return p;
    const over = p.ended ? true : p.to < today;
    if (!over) return p;
    const n = pauseLength(p);
    if (n > 0) {
      const pieces = store.get('pieces') || {};
      for (const [id, x] of Object.entries(pieces)) {
        const g = x && x.goal;
        if (!g || !g.date || g.date < p.from) continue;
        store.set(`pieces.${id}.goal`, { ...g, date: addDays(g.date, n), set: (g.set || now) + n * 864e5, shiftedBy: (g.shiftedBy || 0) + n });
      }
      shifted += n;
    }
    return { ...p, settled: true };
  });
  if (list.some((p, i) => p !== pauses()[i])) store.set('pauses', list);
  return shifted;
}
