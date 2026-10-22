// Journal d'activité (V7) : quand chaque catégorie de la séance a été travaillée pour la dernière fois, et combien de
// minutes. Les outils notent ce qu'on y fait (logActivity) ; la séance note le temps réel de chaque étape.
// Sert aux conseils de « Nouvelle séance » (fréquences cibles) et au bilan de la semaine.
import { store } from './store.js';

/** Les six cases de la séance (pratique du piano seulement : la théorie n'en fait pas partie). */
export const CATS = [
  { id: 'technique', label: 'Technique', icon: 'technique' },
  { id: 'piece', label: 'Pièce phare', icon: 'piece' },
  { id: 'impro', label: 'Improvisation', icon: 'impro' },
  { id: 'lecture', label: 'Lecture à vue', icon: 'lecture' },
  { id: 'oreille', label: 'Oreille', icon: 'ear' },
  { id: 'autres', label: 'Autres pièces', icon: 'piece' },
];
export const catLabel = id => (CATS.find(c => c.id === id) || {}).label || id;

/**
 * Fréquences cibles (jours sur 7), seuil du conseil (jours sans pratique) et part d'une séance de 60 min.
 * « Autres pièces » prend son temps sur la pièce phare. Le point faible déclaré (la lecture du rythme) avance le conseil
 * d'un jour pour la lecture.
 */
export const TARGETS = {
  piece: { days: 6, after: 2, weight: 25 },
  impro: { days: 5, after: 3, weight: 12 },
  technique: { days: 5, after: 3, weight: 8 },
  lecture: { days: 5, after: 3, weight: 8, weak: true },
  oreille: { days: 4, after: 3, weight: 7 },
  autres: { days: 2, after: 5, weight: 10 },
};

export function dayKey(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const midnight = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
/** Jours calendaires entre deux instants (0 = même jour). */
export const daysBetween = (a, b) => Math.round((midnight(b) - midnight(a)) / 864e5);

const KEEP_DAYS = 120;
const blank = () => ({ v: 1, last: {}, days: {} });
const read = () => ({ ...blank(), ...(store.get('activity') || {}) });

/** Note une activité : la catégorie, et les minutes réelles quand on les connaît (étapes de la séance). */
export function logActivity(cat, min = 0, at = Date.now()) {
  if (!cat) return;
  const a = read();
  const last = { ...a.last };
  if (!last[cat] || last[cat] < at) last[cat] = at;
  const days = { ...a.days };
  const k = dayKey(at);
  const d = { ...(days[k] || {}) };
  d[cat] = Math.round(((d[cat] || 0) + Math.max(0, min)) * 10) / 10;
  days[k] = d;
  // on ne garde que les KEEP_DAYS derniers jours
  const keys = Object.keys(days).sort();
  while (keys.length > KEEP_DAYS) delete days[keys.shift()];
  store.set('activity', { ...a, last, days });
}

export const lastAt = cat => read().last[cat] || null;
/** Jours depuis la dernière pratique (Infinity si jamais). */
export function daysSince(cat, now = Date.now()) {
  const t = lastAt(cat);
  return t ? daysBetween(t, now) : Infinity;
}
export function sinceLabel(cat, now = Date.now()) {
  const d = daysSince(cat, now);
  if (d === Infinity) return 'jamais';
  if (d <= 0) return 'aujourd’hui';
  if (d === 1) return 'hier';
  return `il y a ${d} jours`;
}

/** Bilan des n derniers jours : jours pratiqués et minutes (étapes de séance) par catégorie. */
export function recentStats(n = 7, now = Date.now()) {
  const a = read();
  const out = {};
  for (const c of CATS) out[c.id] = { days: 0, min: 0 };
  for (let i = 0; i < n; i++) {
    const d = a.days[dayKey(now - i * 864e5)];
    if (!d) continue;
    for (const [cat, min] of Object.entries(d)) {
      if (!out[cat]) continue;
      out[cat].days += 1;
      out[cat].min += min;
    }
  }
  for (const c of Object.keys(out)) out[c].min = Math.round(out[c].min);
  return out;
}

/* ------------------------------------------------------------------ */
/* Reprise des données d'avant la V7 : les journaux des outils          */
/* ------------------------------------------------------------------ */
// séries d'oreille (identifiants des séries de l'onglet Oreille et des leçons d'oreille)
const EAR_ID = /^(hl|contour\d?|voice-finder|sing-|deg-|echo-|iv-(a|b|c|n1|n1-down|harm|all)$|ch-|ch7-|func2?$|cad|sc$|sc-mm$)/;
const toMs = v => (typeof v === 'number' ? v : v ? Date.parse(v) : NaN);

/** Une fois : reconstitue « la dernière fois » et les jours pratiqués d'après les journaux existants. */
export function backfillActivity() {
  const a = read();
  if (a.backfilled) return false;
  const ev = [];
  const add = (cat, t) => { const ms = toMs(t); if (Number.isFinite(ms) && ms > 0 && ms <= Date.now() + 6e4) ev.push([cat, ms]); };
  for (const x of store.get('stats.ear') || []) add(EAR_ID.test(String(x.id)) ? 'oreille' : null, x.at);
  for (const x of store.get('stats.sight') || []) add(String(x.id || '').startsWith('corpus:') ? 'lecture' : 'piece', x.at);
  for (const x of (store.get('notespeed') || {}).history || []) add('lecture', x.at);
  const rh = store.get('rhythm') || {};
  for (const v of Object.values(rh)) if (Array.isArray(v)) for (const x of v) add('lecture', x && x.at);
  for (const r of Object.values(store.get('improv.p') || {})) add('impro', r && r.last && r.last.at);
  for (const s of Object.values(store.get('exercises') || {})) for (const x of (s && s.hist) || []) add('technique', x.at);
  for (const x of store.get('stats.analyzer') || []) add(String(x.mode || '').startsWith('improv') ? 'impro' : 'technique', x.at);
  const last = { ...a.last };
  const days = { ...a.days };
  for (const [cat, t] of ev) {
    if (!cat) continue;
    if (!last[cat] || last[cat] < t) last[cat] = t;
    const k = dayKey(t);
    days[k] = { ...(days[k] || {}) };
    if (days[k][cat] == null) days[k][cat] = 0;
  }
  store.set('activity', { ...a, last, days, backfilled: true });
  return true;
}

/* ------------------------------------------------------------------ */
/* Ce que font les outils : noté au passage (abonnement au stockage)    */
/* ------------------------------------------------------------------ */
// Chaque outil enregistre déjà ses résultats ; on en déduit la catégorie travaillée, sans toucher aux outils.
const fresh = (t, ms = 15000) => { const x = toMs(t); return Number.isFinite(x) && Math.abs(Date.now() - x) < ms; };
const lastOf = arr => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null);
let guard = false;
store.subscribe((path, value) => {
  if (guard || !path || path === 'activity' || path === '*') return;
  let cat = null;
  try {
    if (path === 'stats.ear') { const x = lastOf(value); if (x && fresh(x.at) && EAR_ID.test(String(x.id))) cat = 'oreille'; }
    else if (path === 'stats.sing' || path === 'settings.voiceRange') cat = 'oreille';
    else if (path === 'stats.sight') { const x = lastOf(value); if (x && fresh(x.at) && String(x.id || '').startsWith('corpus:')) cat = 'lecture'; }
    else if (path === 'notespeed') { const x = lastOf(value && value.history); if (x && fresh(x.at)) cat = 'lecture'; }
    else if (path === 'rhythm') { if (value && Object.values(value).some(v => Array.isArray(v) && lastOf(v) && fresh(lastOf(v).at))) cat = 'lecture'; }
    else if (path === 'improv.p') cat = 'impro';
    else if (path === 'compose.projects') { if (Array.isArray(value) && value.some(x => x && fresh(x.at))) cat = 'impro'; }
    else if (path === 'stats.sightQuiz') { const x = lastOf(value); if (x && fresh(x.at)) cat = 'lecture'; }
    else if (path.startsWith('exercises.')) cat = 'technique';
    else if (path === 'stats.analyzer') { const x = lastOf(value); if (x && fresh(x.at)) cat = String(x.mode || '').startsWith('improv') ? 'impro' : 'technique'; }
  } catch (e) { cat = null; }
  if (!cat) return;
  guard = true;
  try { logActivity(cat); } finally { guard = false; }
});
