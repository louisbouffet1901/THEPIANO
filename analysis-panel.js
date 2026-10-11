// Analyse d'une prise sous un extrait : enregistrement MIDI, résultats (2-3 priorités avec exercice),
// comparaison avec la prise précédente et avec une référence, carte des erreurs par mesure.
import { h, esc, fmtNum, mean, median, noteNameFr } from './util.js';
import { midi } from './midi.js';
import { audio } from './audio.js';
import { db } from './db.js';
import { corrected } from './latency.js';
import { multiLine, measureStrip, SERIES, ERR_RAMP } from './charts.js';
import { OP55, OP15, CLAIR } from './content-excerpts.js';

/* ------------------------------------------------------------------ */
/* Identité d'un passage                                               */
/* ------------------------------------------------------------------ */
/** Empreinte stable d'un extrait (FNV-1a sur le texte ABC). */
export function passageId(abc) {
  let x = 0x811c9dc5;
  for (let i = 0; i < abc.length; i++) { x ^= abc.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; }
  return 'p' + x.toString(16);
}
const EXCERPTS = [[OP55, 'op55-1'], [OP15, 'op15-1'], [CLAIR, 'clair-de-lune']];
const PIECE_OF = new Map(EXCERPTS.flatMap(([set, piece]) => Object.values(set).map(a => [a, piece])));
// identifiant stable d'un extrait (pièce et numéro) : une correction de la partition ne fait pas perdre les prises
const EXCERPT_ID = new Map(EXCERPTS.flatMap(([set, piece]) => Object.entries(set).map(([k, a]) => [a, `${piece}:${k}`])));
export const pieceOf = abc => PIECE_OF.get(abc) || null;
/** Identifiant des prises d'un passage : l'extrait (pièce et numéro) s'il est connu, sinon l'empreinte de la partition. */
export const passageKey = abc => EXCERPT_ID.get(abc) || passageId(abc);

/* Interprétations de référence disponibles (données MAESTRO, tempo et force par mesure) */
const REFS = {
  'op15-1': () => import('./data-ref-op15-1.js'),
  'clair-de-lune': () => import('./data-ref-clair-de-lune.js'),
};
export async function loadRef(piece) {
  if (!piece || !REFS[piece]) return null;
  try { return (await REFS[piece]()).default; } catch (e) { return null; }
}

/* ------------------------------------------------------------------ */
/* Enregistrement d'une prise                                          */
/* ------------------------------------------------------------------ */
export class Recorder {
  constructor({ onFirstNote, onAutoStop, silenceMs = 3000, minNotes = 4 } = {}) {
    Object.assign(this, { onFirstNote, onAutoStop, silenceMs, minNotes });
    this.active = false;
  }
  start() {
    this.notes = []; this.pedal = []; this.open = new Map(); this.started = false; this.active = true;
    const arm = () => { clearTimeout(this.timer); this.timer = setTimeout(() => this._check(), this.silenceMs); };
    this.offs = [
      midi.on('noteon', ev => {
        if (!this.active) return;
        const t = corrected(ev);
        if (!this.started) { this.started = true; this.onFirstNote?.(); }
        const n = { pitch: ev.note, on: t, off: null, vel: ev.velocity };
        this.notes.push(n); this.open.set(ev.note, n); arm();
      }),
      midi.on('noteoff', ev => {
        if (!this.active) return;
        const n = this.open.get(ev.note);
        if (n) { n.off = corrected(ev); this.open.delete(ev.note); }
        arm();
      }),
      midi.on('pedal', ev => { if (this.active && this.started) { this.pedal.push({ t: corrected(ev), down: ev.down }); arm(); } }),
    ];
  }
  _check() {
    if (!this.active) return;
    if (this.open.size === 0 && this.notes.length >= this.minNotes) { const take = this.stop(); this.onAutoStop?.(take); }
    else this.timer = setTimeout(() => this._check(), 800);
  }
  stop() {
    this.active = false;
    clearTimeout(this.timer);
    this.offs?.forEach(f => f());
    const now = performance.now();
    for (const n of this.notes) if (n.off == null) n.off = Math.max(n.on + 120, now);
    return { notes: this.notes || [], pedal: this.pedal || [] };
  }
}

/* ------------------------------------------------------------------ */
/* Carte des erreurs (prises récentes, les plus récentes comptent plus) */
/* ------------------------------------------------------------------ */
const errKey = (pid, hands) => `err:${pid}:${hands}`;
export async function loadErrMap(pid, hands) { return (await db.getKV(errKey(pid, hands))) || {}; }
/** measures : [{ m, errors, total }] d'une prise ou d'un passage en rythme. */
export async function addToErrMap(pid, hands, measures) {
  const map = await loadErrMap(pid, hands);
  for (const r of measures) {
    const o = map[r.m] || { e: 0, n: 0 };
    o.e = o.e * 0.6 + r.errors; o.n = o.n * 0.6 + r.total; o.at = Date.now();
    map[r.m] = o;
  }
  await db.setKV(errKey(pid, hands), map);
  return map;
}
export function errMapStrip(map, measures, { onPick, selected } = {}) {
  const cells = measures.map(m => {
    const o = map[m];
    const rate = o && o.n > 0.5 ? o.e / o.n : null;
    return { m, rate, tip: rate == null ? `m. ${m} : pas encore jouée` : `m. ${m} : ${Math.round(rate * 100)} % d’erreurs (prises récentes)` };
  });
  const wrap = h('div', { class: 'mstrip-wrap' });
  const legend = h('div', { class: 'mstrip-legend' }, 'Carte des erreurs, prises récentes : ',
    ...[0, 2, 4].map(k => h('i', { style: { background: ERR_RAMP[k] } })), ' peu → beaucoup · touche une mesure pour la travailler');
  wrap.append(legend, measureStrip({ cells, onPick, selected }));
  return wrap;
}

/* ------------------------------------------------------------------ */
/* Réécouter une prise                                                 */
/* ------------------------------------------------------------------ */
export async function replayTake(take, owner = 'replay') {
  audio.claim(owner, () => audio.stopAll(owner));
  await audio.ensure();
  const notes = take.notes;
  if (!notes.length) return 0;
  const t0 = audio.now() + 0.15, base = notes[0].on;
  const pedal = take.pedal || [];
  const downAt = ms => { let d = false; for (const p of pedal) { if (p.t > ms) break; d = p.down; } return d; };
  const nextUp = ms => (pedal.find(p => !p.down && p.t > ms) || { t: ms }).t;
  let end = 0;
  notes.forEach((n, i) => { // même touche rejouée : le son précédent s'arrête
    for (let j = i + 1; j < notes.length; j++) if (notes[j].pitch === n.pitch) { n._next = notes[j].on; break; }
  });
  for (const n of notes) {
    let off = downAt(n.off) ? Math.max(n.off, nextUp(n.off)) : n.off;
    if (n._next != null) off = Math.min(off, n._next - 4);
    const v = audio.noteOn(n.pitch, n.vel, t0 + (n.on - base) / 1000, { owner });
    if (v) audio.noteOff(v, t0 + (off - base) / 1000);
    end = Math.max(end, (off - base) / 1000);
  }
  return end + 0.4;
}

/* ------------------------------------------------------------------ */
/* Résultats                                                           */
/* ------------------------------------------------------------------ */
const pct = x => `${Math.round(x * 100)} %`;
const tile = (label, value, unit, sub) => h('div', { class: 'stat' }, h('div', { class: 'l' }, label), h('div', { class: 'v' }, value, unit ? h('small', {}, unit) : null), sub ? h('div', { class: 'small', style: { marginTop: '2px' } }, sub) : null);
const daysAgo = at => { const d = Math.floor((Date.now() - at) / 864e5); return d <= 0 ? 'aujourd’hui' : d === 1 ? 'hier' : `il y a ${d} jours`; };

/**
 * Affiche le résultat d'une analyse.
 * ctx : { res, beatLabel, range: [m0, m1], hands, prev (prise précédente), ref (référence MAESTRO), demoCurve (pct par mesure),
 *         onAction(action), onReplay(), onWeek() }
 */
export function renderAnalysis(ctx) {
  const { res, beatLabel } = ctx;
  const box = h('div', { class: 'w-analysis an-take' });
  const s = res.summary;
  const handsFr = { both: 'deux mains', rh: 'main droite', lh: 'main gauche' }[ctx.hands] || '';
  box.append(h('div', { class: 'wa-head' }, h('span', { class: 'wa-title' }, 'Analyse de ta prise'),
    h('span', { class: 'wa-key' }, `m. ${ctx.range[0]}–${ctx.range[1]} · ${handsFr}`)));

  // Chiffres clés
  const grid = h('div', { class: 'an-grid' });
  grid.append(tile('Notes justes', pct(s.accuracy), '', `${s.wrong} fausse${s.wrong > 1 ? 's' : ''}, ${s.missed} oubliée${s.missed > 1 ? 's' : ''}${s.extra ? `, ${s.extra} en trop` : ''}`));
  grid.append(tile('Tempo', `${beatLabel} = ${Math.round(s.bpm)}`, '', `${Math.round(s.tempoRatio * 100)} % du tempo visé (${Math.round(s.targetBpm)})`));
  if (res.rhythmPts.length >= 3) grid.append(tile('Précision du rythme', `± ${Math.round(s.rhythmDev * 100)}`, '%', 'écart moyen des notes hors temps'));
  if (res.asyncs.length >= 3) grid.append(tile('Mains ensemble', `${Math.abs(Math.round(s.asyncMs))}`, 'ms', s.asyncMs > 0 ? 'main droite après la gauche' : s.asyncMs < 0 ? 'main gauche après la droite' : ''));
  box.append(grid);
  if (s.before || s.after) box.append(h('p', { class: 'small mt-1 mb-0' }, `${s.before ? s.before + ' note(s) jouée(s) avant le passage' : ''}${s.before && s.after ? ' et ' : ''}${s.after ? s.after + ' après' : ''} : ignorées.`));

  // Rubato (leçons de rubato, ou dès que les deux mains jouent) : la main gauche tient-elle le temps ?
  const rb = res.rubato;
  if (rb && ctx.hands !== 'rh' && (ctx.focus === 'rubato' || (res.asyncs.length >= 4 && rb.n >= 6))) {
    const lhPct = Math.round(rb.lhVar * 100);
    const rg = h('div', { class: 'an-grid' });
    rg.append(tile('Main gauche', `± ${lhPct}`, '%', lhPct <= 6 ? 'stable : elle garde le temps' : 'elle flotte : c’est elle qui doit tenir le temps'));
    if (rb.rhAbs != null) rg.append(tile('Main droite', `${Math.round(rb.rhAbs)}`, 'ms', 'décalage moyen avec la gauche, quand elles jouent ensemble'));
    if (rb.together != null && rb.nDown >= 2) rg.append(tile('Retrouvailles', pct(rb.together), '', 'premiers temps où les mains sont ensemble'));
    let verdict;
    if (lhPct > 6) verdict = `La main gauche varie de ± ${lhPct} %${rb.unsteady.length ? ` (surtout m. ${rb.unsteady.slice(0, 3).join(', ')})` : ''} : c’est elle qui doit tenir le temps. Joue-la seule avec le clic, puis ajoute la main droite sans la laisser ralentir.`;
    else if (rb.rhAbs != null && rb.rhAbs < 18) verdict = 'Main gauche stable, et les mains toujours ensemble : c’est propre, mais un peu droit. Laisse la main droite s’attarder sur une note longue ou un sommet, et rattrape avant le temps fort suivant.';
    else if (rb.together != null && rb.nDown >= 2 && rb.together < 0.6) verdict = 'La main droite est libre, mais elle retrouve rarement la gauche au premier temps : après chaque liberté, rejoins-la sur le temps fort.';
    else verdict = 'Bon rubato : la main gauche garde le temps, la main droite respire et retrouve la gauche aux temps forts.';
    box.append(h('h4', { class: 'an-sub' }, 'Rubato'), rg, h('p', { class: 'verdict small' }, verdict));
  }

  // Priorités
  const issues = res.issues.slice(0, 3);
  box.append(h('h4', { class: 'an-sub' }, issues.length ? 'À travailler en priorité' : 'Verdict'));
  if (!issues.length) {
    const next = s.tempoRatio < 0.95 ? `Monte le tempo de 4 à 6 battements (vise ${beatLabel} = ${Math.round(Math.min(s.targetBpm, s.bpm * 1.06))}) et refais une prise.` : 'Tu peux passer au passage suivant, ou enregistrer la pièce en entier.';
    box.append(h('div', { class: 'verdict' }, h('b', {}, 'Rien de net à corriger. '), next));
  }
  issues.forEach((it, k) => {
    const card = h('div', { class: 'an-issue' });
    card.append(h('div', { class: 'an-issue-t' }, h('span', { class: 'an-n' }, String(k + 1)), it.title));
    card.append(h('p', { class: 'mb-0' }, it.detail));
    if (it.cause) card.append(h('p', { class: 'small mb-0' }, h('b', {}, 'Cause probable : '), it.cause));
    if (it.exercise) card.append(h('p', { class: 'small mb-0' }, h('b', {}, 'Exercice : '), it.exercise));
    if (it.action && it.action.type === 'loop' && it.action.from != null) {
      const b = h('button', { class: 'btn sm mt-1', type: 'button' }, `Travailler m. ${it.action.from}${it.action.to !== it.action.from ? '–' + it.action.to : ''} en boucle${it.action.tempoPct ? ` à ${it.action.tempoPct} %` : ''}`);
      b.addEventListener('click', () => ctx.onAction?.(it.action));
      card.append(b);
    }
    box.append(card);
  });
  if (res.notes.some(n => n && n.status !== 'ok')) box.append(h('p', { class: 'small' }, 'Sur la partition : rouge = fausse note, orange = note oubliée.'));

  // Comparaison avec la prise précédente
  if (ctx.prev && ctx.prev.summary) {
    const p = ctx.prev.summary;
    const delta = (a, b, fmt, better) => {
      const d = Math.round(a - b);
      if (d === 0) return h('span', { class: 'delta' }, '=');
      const good = better === 'up' ? d > 0 : d < 0;
      return h('span', { class: 'delta ' + (good ? 'up' : 'down') }, (d > 0 ? '+' : '−') + fmt(Math.abs(d)));
    };
    const rows = h('div', { class: 'an-grid' });
    rows.append(tile('Notes justes', pct(s.accuracy), '', h('span', {}, `avant ${pct(p.accuracy)} `, delta(s.accuracy * 100, p.accuracy * 100, x => Math.round(x) + ' pts', 'up'))));
    rows.append(tile('Tempo', `${Math.round(s.bpm)}`, '', h('span', {}, `avant ${Math.round(p.bpm)} `, delta(s.bpm, p.bpm, x => String(Math.round(x)), 'up'))));
    if (p.rhythmDev != null && res.rhythmPts.length >= 3) rows.append(tile('Rythme', `± ${Math.round(s.rhythmDev * 100)} %`, '', h('span', {}, `avant ± ${Math.round(p.rhythmDev * 100)} % `, delta(s.rhythmDev * 100, p.rhythmDev * 100, x => Math.round(x) + ' pts', 'down'))));
    if (p.hesitations != null) rows.append(tile('Hésitations', String(res.hesitations.length), '', h('span', {}, `avant ${p.hesitations} `, delta(res.hesitations.length, p.hesitations, x => String(x), 'down'))));
    box.append(h('h4', { class: 'an-sub' }, `Par rapport à ta prise précédente (${daysAgo(ctx.prev.at)})`), rows);
  }

  // Tempo mesure par mesure : toi / référence
  const ms = res.measures.filter(m => m.m >= ctx.range[0] && m.m <= ctx.range[1]);
  const mine = ms.map(m => m.bpm);
  const valid = mine.filter(v => v != null);
  if (valid.length >= 3) {
    const myMean = mean(valid);
    const minePct = mine.map(v => (v == null ? null : Math.round(v / myMean * 100)));
    let refPct = null, refName = null;
    if (ctx.ref) {
      const rv = ms.map(m => (ctx.ref.bars[m.m] ? ctx.ref.bars[m.m].bpm : null));
      const rvalid = rv.filter(v => v != null);
      if (rvalid.length >= 3) { const rm = mean(rvalid); refPct = rv.map(v => (v == null ? null : Math.round(v / rm * 100))); refName = 'Pianiste de référence'; }
    }
    if (!refPct && ctx.demoCurve) { refPct = ms.map(m => ctx.demoCurve[m.m] ?? 100); refName = 'Démo de l’appli'; }
    const series = [{ name: 'Toi', color: SERIES.rh, values: minePct }];
    if (refPct) series.push({ name: refName, color: SERIES.lh, values: refPct, dashed: refName.startsWith('Démo') });
    box.append(h('h4', { class: 'an-sub' }, 'Ton tempo, mesure par mesure'));
    box.append(h('p', { class: 'small mt-0' }, 'En % de ton tempo moyen : au-dessus de 100, tu presses ; en dessous, tu élargis.'));
    box.append(multiLine({ series, labels: ms.map(m => `m. ${m.m}`), unit: ' %', baseline: 100, title: 'Tempo par mesure' }));
    if (refPct && ctx.ref) {
      const notes = [];
      ms.forEach((m, i) => {
        if (minePct[i] == null || refPct[i] == null) return;
        const d = minePct[i] - refPct[i];
        if (Math.abs(d) >= 10) notes.push({ m: m.m, d, me: minePct[i], ref: refPct[i] });
      });
      notes.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
      if (notes.length) {
        box.append(h('ul', { class: 'wa-notes' }, ...notes.slice(0, 2).map(n => h('li', {},
          n.ref < n.me ? `m. ${n.m} : le pianiste élargit (${n.ref - 100} %), toi tu restes à ${n.me - 100 >= 0 ? '+' : ''}${n.me - 100} %.`
            : `m. ${n.m} : tu élargis (${n.me - 100} %) là où le pianiste avance (${n.ref - 100 >= 0 ? '+' : ''}${n.ref - 100} %).`))));
      }
      box.append(h('p', { class: 'small' }, `Référence : ${ctx.ref.source} (données MAESTRO, CC BY-NC-SA 4.0). Une seule interprétation : un repère, pas un modèle.`));
    }
  }

  // Actions
  const row = h('div', { class: 'btn-row mt-2' });
  const replay = h('button', { class: 'btn sm', type: 'button' }, 'Réécouter ma prise');
  replay.addEventListener('click', () => ctx.onReplay?.(replay));
  const week = h('button', { class: 'btn sm ghost', type: 'button' }, ctx.isWeek ? '✓ Prise de la semaine' : 'Garder comme prise de la semaine');
  week.addEventListener('click', async () => { await ctx.onWeek?.(); week.textContent = '✓ Prise de la semaine'; week.disabled = true; });
  if (ctx.isWeek) week.disabled = true;
  row.append(replay, week);
  box.append(row);
  return box;
}

/* ------------------------------------------------------------------ */
/* Les prises « de la semaine » d'une pièce                            */
/* ------------------------------------------------------------------ */
/** Une prise de référence par semaine (bouton « Garder comme prise de la semaine ») : la liste, comparée à la précédente du même passage. */
export async function weekTakesSection(piece) {
  const box = h('div', { class: 'week-takes' });
  box.append(h('div', { class: 'section-title mt-3' }, h('h2', {}, 'Mes prises de la semaine')));
  let all = [];
  try { all = (await db.all('takes')).filter(t => t.piece === piece && t.week).sort((a, b) => a.at - b.at); } catch (e) { /* base indisponible */ }
  if (!all.length) {
    box.append(h('p', { class: 'small' }, 'Une fois par semaine, après « Analyser » sous un extrait, touche « Garder comme prise de la semaine ». Tes prises s’alignent ici : tu entends et tu mesures le chemin parcouru (justesse, tempo), passage par passage.'));
    return box;
  }
  const HANDS = { both: '2 mains', right: 'main droite', left: 'main gauche', rh: 'main droite', lh: 'main gauche' };
  const last = new Map();
  const rows = all.map(t => {
    const key = `${t.passage}|${t.hands}|${(t.range || []).join('-')}`;
    const prev = last.get(key);
    last.set(key, t);
    const acc = t.summary?.accuracy != null ? Math.round(t.summary.accuracy * 100) : null;
    const pAcc = prev?.summary?.accuracy != null ? Math.round(prev.summary.accuracy * 100) : null;
    const d = (a, b, unit) => (a != null && b != null && a !== b ? ` (${a > b ? '+' : ''}${a - b}${unit})` : '');
    return { t, text: `${t.range ? `m. ${t.range[0]}${t.range[1] !== t.range[0] ? '–' + t.range[1] : ''}` : ''} · ${HANDS[t.hands] || t.hands || ''}`,
      stats: `${t.bpm ? `tempo ${Math.round(t.bpm)}${t.target ? ' / ' + Math.round(t.target) : ''}${d(Math.round(t.bpm), prev?.bpm != null ? Math.round(prev.bpm) : null, '')}` : ''}${acc != null ? ` · ${acc} % de notes justes${d(acc, pAcc, ' %')}` : ''}${t.summary?.hesitations ? ` · ${t.summary.hesitations} hésitation${t.summary.hesitations > 1 ? 's' : ''}` : ''}` };
  }).reverse();
  const list = h('div', { class: 'wt-list' });
  for (const r of rows) {
    const btn = h('button', { class: 'btn sm ghost', type: 'button' }, 'Réécouter');
    btn.addEventListener('click', async () => {
      if (btn.dataset.playing) { audio.stopAll('weektake'); delete btn.dataset.playing; btn.textContent = 'Réécouter'; return; }
      btn.dataset.playing = '1'; btn.textContent = 'Arrêter';
      const take = { notes: (r.t.notes || []).map(([pitch, on, off, vel]) => ({ pitch, on, off, vel })), pedal: (r.t.pedal || []).map(([t, down]) => ({ t, down: !!down })) };
      const dur = await replayTake(take, 'weektake');
      setTimeout(() => { delete btn.dataset.playing; btn.textContent = 'Réécouter'; }, dur * 1000);
    });
    list.append(h('div', { class: 'wt-row' },
      h('div', { class: 'wt-date' }, new Date(r.t.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
      h('div', { class: 'wt-main' }, h('b', {}, r.text), h('div', { class: 'small' }, r.stats)), btn));
  }
  box.append(list, h('p', { class: 'small muted mt-1' }, 'Entre parenthèses : l’écart avec la prise précédente du même passage.'));
  return box;
}
