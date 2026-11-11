// « Trouve la note » (V8.4) : l'exercice central de l'oreille. Entendre une note et trouver sa touche sans tâtonner.
// Une tonalité par séance ; une cadence installe la tonique ; une note sonne ; tu la cherches au clavier (piano ou écran),
// librement : tes essais sont comptés, sans pénalité, et l'appli t'aide (plus haut ou plus bas, deux touches possibles,
// la touche). Puis la note « rentre à la maison » (résolution vers la tonique, méthode fonctionnelle de Benbassat).
// La difficulté s'ajuste seule (earfind-engine.js) ; le chant est facultatif mais toujours là : un bouton ouvre le micro,
// qui dit si tu chantes la bonne note sans jamais la nommer.
import { h, esc, fmtPct, pc } from './util.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { keyboard } from './diagrams.js';
import { pitch, octaveDiff } from './pitch.js';
import { VoiceTrace, coachLine } from './voice.js';
import { logActivity } from './activity.js';
import * as E from './earfind-engine.js';

const OWNER = 'earfind', DRONE = 'earfind-drone';
const fmt1 = x => (x == null ? '—' : x.toFixed(1).replace('.', ','));
const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor"/></svg>';
const MIC = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const BULB = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */
const load = () => E.normalize(store.get('earfind'));
const saveState = S => store.set('earfind', S);

/** La prochaine séance : sa tonalité et où tu en es (séance du jour, accueil, loin du piano). */
export function nextSessionInfo(now = Date.now()) {
  const S = load();
  const k = E.pickKey(S, now);
  const sum = E.keySummary(S, k);
  return { key: k, name: sum.info.name, n: sum.n, total: sum.total, set: sum.set, ok: sum.ok, tries: sum.tries, full: sum.full, minutes: S.opts.minutes || 5, started: S.items.length > 0 };
}
/** Une ligne pour l'accueil. */
export function earFindLine() {
  const x = nextSessionInfo();
  if (!x.started) return 'Trouve la note : commence en do majeur, avec trois notes';
  return `Trouve la note : ${x.name}, ${x.n} note${x.n > 1 ? 's' : ''}${x.tries != null ? ` · ${fmt1(x.tries)} essai${x.tries >= 1.95 ? 's' : ''} par note` : ''}`;
}
/** Les degrés que tu entends déjà (toutes tonalités du mode) : pour proposer les mélodies d'oreille. */
export function acquiredDegrees(mode = 'maj') {
  const S = load();
  const out = new Set();
  for (const [k, ks] of Object.entries(S.keys)) {
    if (!E.isKey(k) || E.keyInfo(k).mode !== mode || !ks || !Array.isArray(ks.set)) continue;
    for (const d of ks.set) out.add(d);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Sons                                                                */
/* ------------------------------------------------------------------ */
const VOICE_MAJ = { I: [48, 64, 67, 72], IV: [53, 65, 69, 72], V7: [43, 62, 65, 71] };
const VOICE_MIN = { i: [45, 60, 64, 69], iv: [50, 62, 65, 69], V7: [40, 59, 62, 68] };
function cadenceList(info, t0 = 0, dur = 0.55) {
  const tr = info.tonic - (info.mode === 'min' ? 57 : 60);
  const V = info.mode === 'min' ? VOICE_MIN : VOICE_MAJ;
  const seq = info.mode === 'min' ? ['i', 'iv', 'V7', 'i'] : ['I', 'IV', 'V7', 'I'];
  const out = [];
  seq.forEach((c, i) => V[c].forEach(m => out.push({ m: m + tr, t: t0 + i * dur, d: i === 3 ? dur * 1.6 : dur * 0.95, v: 60 })));
  return { notes: out, end: t0 + 3 * dur + dur * 1.6 };
}
async function play(list) {
  audio.claim(OWNER, () => audio.stopAll(OWNER));
  await audio.ensure();
  const t0 = audio.now() + 0.06;
  let end = 0;
  for (const n of list) {
    const v = audio.noteOn(n.m, n.v || 76, t0 + n.t, { owner: OWNER });
    if (v) audio.noteOff(v, t0 + n.t + n.d);
    end = Math.max(end, n.t + n.d);
  }
  return Math.round((0.06 + end) * 1000);
}
const stopSound = () => audio.stopAll(OWNER);

/* ------------------------------------------------------------------ */
/* Textes d'aide                                                       */
/* ------------------------------------------------------------------ */
// La couleur de chaque degré (méthode fonctionnelle ; descriptions d'auditeurs réunies par Huron, 2006) et où il « tire »
// (les signes de main de Kodály : fa vers mi, si vers do, ré vers do, la vers sol).
const FEEL = {
  maj: {
    1: 'le repos, la « maison » : rien ne bouge.', 2: 'une petite tension, qui retombe sur 1.', 3: 'stable et lumineuse : le cœur de l’accord majeur.',
    4: 'tendue vers le bas : elle veut descendre sur 3, juste en dessous.', 5: 'stable mais ouverte, comme une porte : elle attend la suite.',
    6: 'douce, un peu mélancolique : elle aime redescendre vers 5.', 7: 'la sensible : très tendue, elle veut monter vers 8, juste au-dessus.',
    8: 'le repos, une octave plus haut : la maison, en clair.', '-7': 'la sensible sous la tonique : elle veut remonter sur 1.',
    '-6': 'douce, sous la tonique : elle penche vers 5 grave.', '-5': 'la dominante, sous la tonique : stable, ouverte, elle appelle 1.',
  },
  min: {
    1: 'le repos, la « maison ».', 2: 'une petite tension, qui retombe sur 1.', 3: 'stable mais sombre : la tierce mineure fait le mode mineur.',
    4: 'elle penche vers 3, juste en dessous.', 5: 'stable et ouverte : elle attend la suite.', 6: 'sombre et pesante : elle retombe sur 5, un demi-ton plus bas.',
    7: 'la sensible : un demi-ton sous 8, elle veut monter.', 8: 'le repos, une octave plus haut.', '-7': 'la sensible sous la tonique : elle remonte sur 1.',
    '-6': 'sombre, sous la tonique : elle retombe sur 5 grave.', '-5': 'la dominante, sous la tonique : elle appelle 1.',
  },
};
const feelOf = (info, d) => FEEL[info.mode][d] || '';
function placeText(info, d) {
  if (d === 1) return 'C’est la note où la cadence se repose.';
  const off = E.degOffset(d, info.mode);
  const dir = off > 0 ? 'au-dessus de la tonique' : 'en dessous de la tonique';
  const a = Math.abs(off);
  const dist = a <= 4 ? 'tout près' : a <= 7 ? 'à mi-distance' : 'loin, presque à l’octave';
  return `Elle est ${dir}, ${dist}.`;
}
function moveText(diff) {
  const a = Math.abs(diff);
  const dir = diff > 0 ? '<b>Plus haut</b> ↑' : '<b>Plus bas</b> ↓';
  return `${dir}${a <= 2 ? ', tout près' : a <= 5 ? ', un peu plus loin' : ', bien plus loin'}.`;
}
export const STRATEGIES = [
  '<b>Garde la tonique dans l’oreille</b> : fredonne-la doucement entre deux notes.',
  '<b>Situe la note avant de toucher le clavier</b> : au-dessus ou en dessous de la tonique ? Tout près ou loin ?',
  '<b>Écoute sa couleur</b> : 1 repose, 3 est lumineux, 5 est ouvert, 7 tire vers le haut.',
  '<b>Écoute où elle veut aller</b> : 2 et 4 veulent descendre, 6 retombe sur 5, 7 monte vers 8.',
  '<b>Si tu hésites, chante depuis la tonique</b> en montant (1, 2, 3…) jusqu’à retrouver la note.',
  '<b>Fais confiance à ta première impression</b> : ne compte pas les touches une à une.',
];
export const METHODS = [
  '<b>Méthode fonctionnelle</b> (Alain Benbassat) : une cadence, une note, puis la résolution vers la tonique ; peu de notes au début, la tonalité installée avant chaque question.',
  '<b>Kodály</b> : chanter d’abord ; les notes stables de l’accord (1, 5, 3), puis la et ré, et seulement ensuite fa et si, les demi-tons.',
  '<b>Gordon</b> : de courtes formules de deux à cinq notes (tonique, dominante, sous-dominante), répétées d’oreille avant de lire.',
  '<b>Lucy Green</b> : retrouver de vraies mélodies d’oreille, par essais, avec un peu d’aide (la première note, la boucle).',
  '<b>Une difficulté à ta mesure</b> : une note s’ajoute quand tu en réussis 9 sur 10 du premier coup, la dernière arrivée se retire si c’est trop dur (règle des 85 %, Wilson et al., 2019).',
];
export function howItWorksHTML() {
  return `<ol class="tn-how">
    <li><b>La tonalité s’installe.</b> Une cadence, puis la tonique (1) : la note de repos, la « maison ». Garde-la en tête.</li>
    <li><b>Une note sonne.</b> Retiens-la. Chante-la si tu veux : le micro te dit si c’est juste, sans la nommer.</li>
    <li><b>Trouve-la au clavier.</b> Les touches marquées sont les notes possibles. Cherche librement : tes essais sont comptés, sans pénalité. Après une erreur, l’appli t’aide : plus haut ou plus bas, puis deux touches possibles.</li>
    <li><b>Elle rentre à la maison.</b> L’appli la ramène vers la tonique (6 → 7 → 8). Écoute ce chemin : c’est lui que ton oreille apprend.</li>
  </ol>
  <p class="small mb-0">Une tonalité par séance. Ton progrès se lit en <b>essais par note</b> : de 3 vers 1.</p>`;
}

/* ------------------------------------------------------------------ */
/* Le chant, facultatif (micro)                                        */
/* ------------------------------------------------------------------ */
/**
 * Un petit panneau de chant : ta voix en direct face à la note visée (bande verte), sans nom de note. Le son de
 * l'appli et celui du piano ne sont pas pris pour ta voix (fenêtres muettes). onMatch() : chantée juste une demi-seconde.
 */
export function singPanel({ height = 84, tol = 0.5, onMatch = null } = {}) {
  const trace = new VoiceTrace({ height, span: 6, tol, labels: false });
  const coach = h('div', { class: 'small tn-coach', 'aria-live': 'polite' }, 'Chante la note (« mmm » ou « la ») : la ligne devient verte sur la bonne note.');
  const badge = h('span', { class: 'tn-sung', hidden: true }, '✓ Chantée juste');
  const el = h('div', { class: 'tn-sing' }, h('div', { class: 'tn-sing-top' }, h('b', { class: 'small' }, 'Ta voix'), badge), trace.el, coach);
  let target = null, mute = 0, off = null, startAt = 0, lastVoiced = 0, lastT = 0, okMs = 0, matched = false, recent = [], on = false;
  const handle = ev => {
    const now = ev.t || performance.now();
    if (now < mute) { trace.push({ t: now, voiced: false }); lastT = now; return; }
    trace.push(ev);
    if (ev.voiced && target != null) {
      lastVoiced = now;
      const d = octaveDiff(ev.midi, target);
      recent.push({ t: now, d });
      while (recent.length && now - recent[0].t > 1500) recent.shift();
      if (Math.abs(d) <= tol) okMs += Math.min(120, now - (lastT || now)); else okMs = Math.max(0, okMs - 40);
      if (!matched && okMs >= 450) { matched = true; badge.hidden = false; onMatch?.(); }
    }
    lastT = now;
    const c = coachLine(recent, tol, now - startAt, now - (lastVoiced || startAt));
    if (c && !matched) coach.innerHTML = c.html; // ces messages ne nomment jamais la note
    else if (matched) coach.textContent = 'C’est la bonne note. Maintenant, trouve-la au clavier.';
  };
  return {
    el,
    get on() { return on; },
    get matched() { return matched; },
    async start() {
      if (on) return true;
      on = true;
      const ok = await pitch.start();
      if (!ok) {
        on = false;
        coach.textContent = pitch.state === 'denied' ? 'Micro refusé : autorise-le dans Chrome (cadenas de la barre d’adresse), ou chante sans vérification.' : 'Micro indisponible ici : chante quand même, sans vérification.';
        return false;
      }
      off = pitch.on(handle);
      startAt = performance.now();
      trace.start();
      return true;
    },
    stop() { if (!on) return; on = false; off?.(); off = null; trace.stop(); pitch.stop(); },
    setTarget(m) { target = m; matched = false; okMs = 0; recent = []; badge.hidden = true; trace.setTarget(m); trace.clear(); startAt = performance.now(); lastVoiced = 0; coach.textContent = 'Chante la note (« mmm » ou « la ») : la ligne devient verte sur la bonne note.'; },
    muteFor(ms) { mute = Math.max(mute, performance.now() + ms); },
  };
}

/* ------------------------------------------------------------------ */
/* L'échelle des degrés (inspirée du « modulateur » de Curwen)          */
/* ------------------------------------------------------------------ */
function ladder(info) {
  const all = E.byPitch(E.ORDER[info.mode], info.mode); // du grave à l'aigu
  const el = h('div', { class: 'tn-ladder', role: 'img', 'aria-label': 'L’échelle des degrés : la tonique en or, les notes en jeu en couleur' });
  const rungs = new Map();
  all.forEach((d, i) => {
    const prev = all[i - 1];
    const step = prev == null ? 2 : E.degOffset(d, info.mode) - E.degOffset(prev, info.mode);
    const r = h('div', { class: 'tn-rung' + (step === 1 ? ' half' : '') + (d === 1 || d === 8 ? ' tonic' : '') + (d < 0 ? ' low' : ''), 'data-d': String(d) },
      h('b', {}, E.degNum(d)), h('span', {}, E.degName(info, d)));
    rungs.set(d, r);
    el.append(r);
  });
  return {
    el,
    setActive(set, fresh = null) { for (const [d, r] of rungs) { r.classList.toggle('on', set.includes(d)); r.classList.toggle('fresh', d === fresh); } },
    hit(d, cls = 'hit') { for (const r of rungs.values()) r.classList.remove('hit', 'path'); if (d != null) rungs.get(d)?.classList.add(cls); },
    clear() { for (const r of rungs.values()) r.classList.remove('hit', 'path'); },
    async path(list, stepMs = 360) {
      for (const [i, d] of list.entries()) {
        for (const r of rungs.values()) r.classList.remove('path');
        rungs.get(d)?.classList.add(i === list.length - 1 ? 'hit' : 'path');
        await new Promise(r => setTimeout(r, stepMs));
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* L'exercice                                                          */
/* ------------------------------------------------------------------ */
/**
 * mountEarFind(el, { away, minutes, onFinish, compact }) : la carte « Trouve la note » (accueil de l'exercice), puis la
 * séance. away : loin du piano (clavier de l'écran, écouteurs). onFinish(bilan) : appelé à la fin d'une séance.
 */
export function mountEarFind(el, opts = {}) {
  let S = load();
  let alive = true;
  const root = h('div', { class: 'tn' });
  el.append(root);
  let cleanupRun = null;

  /* ---------- l'accueil de l'exercice ---------- */
  function renderHome(flash = null) {
    root.innerHTML = '';
    S = load();
    const U = E.unlockedKeys(S);
    let key = opts.key && U.includes(opts.key) ? opts.key : (store.get('ui.tnKey') && U.includes(store.get('ui.tnKey')) ? store.get('ui.tnKey') : E.pickKey(S));
    const card = h('div', { class: 'card tn-card' });
    const head = h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, opts.away ? 'Trouve la note, loin du piano' : 'Trouve la note'), h('span', { class: 'small muted' }, 'une tonalité par séance'));
    const keyLine = h('div', { class: 'tn-keyline' });
    const chips = h('div', { class: 'tn-chips', 'aria-label': 'Les notes de la tonalité' });
    const sumLine = h('p', { class: 'small tn-sum' });
    const paint = () => {
      const sum = E.keySummary(S, key);
      keyLine.innerHTML = '';
      const sel = h('select', { class: 'tn-keysel', 'aria-label': 'Choisir la tonalité' }, ...U.map(k => h('option', { value: k, selected: k === key }, E.keyInfo(k).name)));
      sel.addEventListener('change', () => { key = sel.value; store.set('ui.tnKey', key); paint(); });
      keyLine.append(h('span', {}, 'Prochaine séance : '), h('b', {}, sum.info.name));
      if (U.length > 1) keyLine.append(h('label', { class: 'tn-change small' }, 'changer ', sel));
      chips.innerHTML = '';
      for (const x of E.degreeMap(S, key).slice().sort((a, b) => E.degOffset(a.d, sum.info.mode) - E.degOffset(b.d, sum.info.mode))) {
        chips.append(h('span', { class: `tn-chip ${x.state}${x.d === 1 || x.d === 8 ? ' tonic' : ''}${x.d < 0 ? ' low' : ''}`, title: `${E.degLabel(x.d)} (${x.name}) : ${{ sure: 'sûre', learning: 'en cours', new: 'nouvelle', later: 'à venir' }[x.state]}` }, E.degShort(x.d)));
      }
      const started = S.items.some(x => x.k === key);
      sumLine.innerHTML = !S.items.length ? 'Tu commences avec trois notes (1, 3, 5). Une note s’ajoute quand tu en réussis 9 sur 10 du premier coup.'
        : !started ? `Nouvelle tonalité : tu y reprends ${sum.n} notes, celles que tu entends déjà ailleurs, moins une.`
        : `En ${esc(sum.info.name)} : <b>${sum.n} note${sum.n > 1 ? 's' : ''}</b> sur ${sum.total}${sum.full ? ' (gamme complète)' : ''} · ${sum.ok != null ? `${fmtPct(sum.ok)} du premier coup · ` : ''}${sum.tries != null ? `${fmt1(sum.tries)} essai${sum.tries >= 1.95 ? 's' : ''} par note` : ''}.`;
    };
    paint();
    // réglages de la séance
    const mins = [3, 5, 10];
    let minutes = opts.minutes || (mins.includes(S.opts.minutes) ? S.opts.minutes : 5);
    const seg = h('div', { class: 'seg tn-dur', role: 'group', 'aria-label': 'Durée' });
    for (const m of mins) {
      const b = h('button', { type: 'button', class: m === minutes ? 'on' : '' }, `${m} min`);
      b.addEventListener('click', () => { minutes = m; S.opts.minutes = m; saveState(S); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
      seg.append(b);
    }
    const singCb = h('input', { type: 'checkbox', checked: !!S.opts.sing });
    singCb.addEventListener('change', () => { S.opts.sing = singCb.checked; saveState(S); });
    const droneCb = h('input', { type: 'checkbox', checked: !!S.opts.drone });
    droneCb.addEventListener('change', () => { S.opts.drone = droneCb.checked; saveState(S); });
    const marksSel = h('select', { 'aria-label': 'Numéros sur les touches' },
      h('option', { value: 'auto', selected: S.opts.marks === 'auto' }, 'selon ta réussite'),
      h('option', { value: 'always', selected: S.opts.marks === 'always' }, 'toujours'),
      h('option', { value: 'never', selected: S.opts.marks === 'never' }, 'jamais (couleurs seules)'));
    marksSel.addEventListener('change', () => { S.opts.marks = marksSel.value; saveState(S); });
    const go = h('button', { class: 'btn primary', type: 'button' }, 'Commencer');
    go.addEventListener('click', () => { audio.unlock(); startRun(key, minutes); });
    const settings = h('div', { class: 'tn-settings' },
      h('div', { class: 'tn-set-row' }, h('span', { class: 'small' }, 'Durée'), seg),
      h('label', { class: 'check small', title: 'Avant de chercher au clavier, chante la note : le micro te dit si c’est juste. Facultatif : le bouton « Chanter » reste là à chaque note.' }, singCb, 'Chanter avant de chercher (micro)'),
      h('label', { class: 'check small', title: 'La tonique tenue pendant toute la séance : un repère constant (avec des écouteurs, il ne gêne pas le micro).' }, droneCb, 'Bourdon de tonique'),
      h('label', { class: 'small tn-marks' }, 'Numéros sur les touches : ', marksSel));
    card.append(head, keyLine, chips, sumLine, settings, h('div', { class: 'btn-row' }, go));
    if (flash) card.prepend(h('div', { class: 'callout tip tn-flash' }, h('div', { html: flash })));
    // comment ça marche, les stratégies, d'où vient la méthode
    const how = h('details', { class: 'more tn-more', open: !S.intro }, h('summary', {}, 'Comment ça marche'), h('div', { class: 'more-body', html: howItWorksHTML() }));
    how.addEventListener('toggle', () => { if (!how.open && !S.intro) { S.intro = true; saveState(S); } });
    const strat = h('details', { class: 'more tn-more' }, h('summary', {}, 'Trouver une note sans tâtonner'), h('div', { class: 'more-body' }, h('ul', { class: 'tn-list' }, ...STRATEGIES.map(x => h('li', { html: x })))));
    const meth = h('details', { class: 'more tn-more' }, h('summary', {}, 'D’où vient la méthode'), h('div', { class: 'more-body' }, h('ul', { class: 'tn-list' }, ...METHODS.map(x => h('li', { html: x })))));
    card.append(how, strat, meth);
    if (!opts.away) card.append(progressBox());
    root.append(card);
  }

  /** Ta progression : essais par note et part du premier coup, jour par jour ; les tonalités ouvertes. */
  function progressBox() {
    const det = h('details', { class: 'more tn-more' }, h('summary', {}, 'Ta progression'));
    const body = h('div', { class: 'more-body' });
    det.append(body);
    det.addEventListener('toggle', () => {
      if (!det.open || body.firstChild) return;
      const days = E.daily(S, 30);
      if (days.length < 2) body.append(h('p', { class: 'small mb-0' }, days.length ? 'Une première séance : la courbe apparaîtra dès la deuxième journée.' : 'Pas encore de séance.'));
      else {
        import('./charts.js').then(ch => {
          body.append(h('p', { class: 'small mb-1' }, 'Essais par note, jour par jour (moins, c’est mieux : 1 = du premier coup).'),
            ch.lineChart({ values: days.map(x => Math.round(x.tries * 100) / 100), tips: days.map(x => `${x.day.slice(8)}/${x.day.slice(5, 7)} : ${fmt1(x.tries)} essai par note, ${fmtPct(x.ok)} du premier coup (${x.n} notes)`), height: 150, yMin: 1, title: 'Essais par note' }));
        }).catch(() => {});
      }
      const U = E.unlockedKeys(S);
      const list = h('ul', { class: 'tn-keys small' });
      for (const k of U) {
        const sum = E.keySummary(S, k);
        list.append(h('li', {}, h('b', {}, sum.info.name), ` : ${sum.n} note${sum.n > 1 ? 's' : ''} sur ${sum.total}${sum.ok != null ? `, ${fmtPct(sum.ok)} du premier coup` : ''}${sum.full ? ' · gamme complète' : ''}`));
      }
      const nextLocked = E.KEY_PATH.find(k => !U.includes(k));
      body.append(list, nextLocked ? h('p', { class: 'small muted mb-0' }, `Prochaine tonalité : ${E.keyInfo(nextLocked).name}, quand les tonalités ouvertes auront six notes à 80 % ou plus.`) : null);
    });
    return det;
  }

  /* ---------- la séance ---------- */
  function startRun(key, minutes) {
    S = load();
    const info = E.keyInfo(key);
    const ks = E.keyState(S, key);
    saveState(S);
    root.innerHTML = '';
    const run = { key, info, minutes, start: Date.now(), active: 0, tick: performance.now(), paused: false, intro: true, q: 0, prev: [], fresh: ks.added && Date.now() - ks.added.at < 864e5 ? { d: ks.added.d, left: 6 } : null, items: [], events: [], boostNum: 0, over: false };
    const wrap = h('div', { class: 'card tn-run' });
    root.append(wrap);
    // en-tête : tonalité, temps, compte
    const timer = h('span', { class: 'tn-timer' });
    const count = h('span', { class: 'small tn-count' });
    const pauseB = h('button', { class: 'btn sm ghost', type: 'button' }, 'Pause');
    const top = h('div', { class: 'tn-top' }, h('span', { class: 'tn-keybadge' }, info.name), timer, count, pauseB);
    const bar = h('div', { class: 'progress tn-bar' }, h('i'));
    const prompt = h('div', { class: 'tn-prompt', 'aria-live': 'polite' });
    const slots = h('div', { class: 'tn-slots', hidden: true });
    // commandes
    const againB = h('button', { class: 'btn', type: 'button', html: `${PLAY} Réécouter` });
    const tonicB = h('button', { class: 'btn ghost sm', type: 'button' }, 'La tonique');
    const cadB = h('button', { class: 'btn ghost sm', type: 'button' }, 'La cadence');
    const hintB = h('button', { class: 'btn ghost sm', type: 'button', html: `${BULB} Indice` });
    const singB = h('button', { class: 'btn ghost sm tn-singb', type: 'button', 'aria-pressed': 'false', html: `${MIC} Chanter` });
    const ctrl = h('div', { class: 'btn-row tn-ctrl' }, againB, tonicB, cadB, hintB, singB);
    const fb = h('div', { class: 'tn-fb', 'aria-live': 'polite' });
    const help = h('div', { class: 'tn-help', hidden: true });
    const sing = singPanel({ onMatch: () => { if (Q) Q.sung = true; } });
    sing.el.hidden = true;
    // le clavier et l'échelle
    const lo0 = E.degMidi(info, -5) - 2, hi0 = E.degMidi(info, 8) + 2;
    const kb = keyboard({ from: lo0, to: hi0, interactive: true, names: 'none', height: 112, label: 'Clavier : joue la note entendue', onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) });
    const lad = ladder(info);
    const board = h('div', { class: 'tn-board' }, lad.el, h('div', { class: 'tn-kbd' }, kb));
    const nextB = h('button', { class: 'btn primary', type: 'button', hidden: true }, 'Note suivante');
    const stopB = h('button', { class: 'btn sm ghost', type: 'button' }, 'Terminer la séance');
    wrap.append(top, bar, prompt, slots, ctrl, sing.el, fb, help, board, h('div', { class: 'btn-row tn-foot' }, nextB, stopB));
    if (midi.status !== 'ready') wrap.insertBefore(h('p', { class: 'small muted tn-nopiano' }, opts.away ? 'Avec des écouteurs, sur le clavier de l’écran.' : 'Piano non connecté : réponds sur le clavier de l’écran.'), board);

    let Q = null;              // la question en cours
    let busy = false;          // un son de l'appli se joue (cue, résolution)
    let autoT = null;
    const offs = [];
    const clock = setInterval(() => updateTime(), 500);

    const marksLevel = () => {
      if (S.opts.marks === 'always') return 'num';
      if (S.opts.marks === 'never') return 'col';
      if (run.boostNum > 0) return 'num';
      const acc = E.recentAcc(S, key);
      const k2 = S.keys[key];
      if (run.fresh && run.fresh.left > 0) return 'num';
      if (acc != null && acc >= 0.9 && k2.set.length >= 4) return k2.full ? 'none' : 'col';
      return 'num';
    };
    const baseMarks = () => {
      const k2 = S.keys[key];
      const lvl = marksLevel();
      const out = [];
      for (const d of k2.set) {
        const m = E.degMidi(info, d);
        const black = [1, 3, 6, 8, 10].includes(pc(m));
        if (d === 1 || d === 8) { out.push({ m, color: '#c99a2e', label: lvl === 'num' || d === 1 ? E.degNum(d) : '', labelColor: '#241a05' }); continue; }
        if (lvl === 'none') continue;
        const fresh = run.fresh && run.fresh.left > 0 && run.fresh.d === d;
        out.push({ m, color: fresh ? (black ? '#2e7a4c' : '#cfe8d6') : black ? (d < 0 ? '#6b84ad' : '#476aa3') : (d < 0 ? '#e3e9f3' : '#d2def0'), label: lvl === 'num' ? E.degNum(d) : '', labelColor: black ? '#fff' : '#1d3a66' });
      }
      return out;
    };
    let extraMarks = [];
    const paintKeys = () => kb.setMarks([...baseMarks().filter(b => !extraMarks.some(x => x.m === b.m)), ...extraMarks]);
    const flashKey = (m, color, ms = 520) => {
      const mark = { m, color, label: '' };
      extraMarks = [...extraMarks.filter(x => x.m !== m), mark];
      paintKeys();
      setTimeout(() => { extraMarks = extraMarks.filter(x => x !== mark); paintKeys(); }, ms);
    };

    function updateTime() {
      const now = performance.now();
      if (!run.paused && !run.over && !run.intro) run.active += now - run.tick;
      run.tick = now;
      const left = Math.max(0, run.minutes * 60000 - run.active);
      const s = Math.ceil(left / 1000);
      timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      bar.firstChild.style.width = `${Math.min(100, run.active / (run.minutes * 600))}%`;
      const r = E.rate(run.items);
      count.textContent = run.items.length ? `${run.items.length} note${run.items.length > 1 ? 's' : ''} · ${r.ok != null ? fmtPct(r.ok) : '—'} du premier coup` : '';
    }

    /* l'introduction : la tonalité s'installe */
    async function intro() {
      busy = true;
      lad.setActive(S.keys[key].set, run.fresh?.d);
      paintKeys();
      prompt.innerHTML = `<b>${esc(info.name)}.</b> Écoute la cadence : elle installe la tonique (1), la note de repos. Puis 1 – 3 – 5 – 3 – 1 : chante-les avec le piano si tu veux.`;
      ctrl.hidden = true;
      fb.textContent = '';
      const cad = cadenceList(info);
      const arp = [1, 3, 5, 3, 1].map((d, i) => ({ m: E.degMidi(info, d), t: cad.end + 0.5 + i * 0.5, d: i === 4 ? 1.0 : 0.48, v: 74 }));
      const ms = await play([...cad.notes, ...arp]);
      sing.muteFor(ms + 200);
      setTimeout(() => { if (alive && run.intro) lad.path([1, 3, 5, 3, 1], 500); }, Math.round((cad.end + 0.5) * 1000));
      setTimeout(() => { if (!alive) return; busy = false; }, ms);
      const goB = h('button', { class: 'btn primary', type: 'button' }, 'C’est parti');
      const reB = h('button', { class: 'btn', type: 'button', html: `${PLAY} Réécouter` });
      reB.addEventListener('click', async () => { const m2 = await play([...cad.notes, ...arp]); sing.muteFor(m2 + 200); });
      goB.addEventListener('click', () => { run.intro = false; help.hidden = true; help.innerHTML = ''; ctrl.hidden = false; run.tick = performance.now(); nextQuestion(); });
      help.hidden = false;
      help.innerHTML = '';
      help.append(h('p', { class: 'small mb-1' }, run.fresh ? `Note nouvelle cette fois : ${E.degLabel(run.fresh.d)} (${E.degName(info, run.fresh.d)}), en vert sur le clavier. ` : '', 'Les touches marquées sont les notes possibles ; la tonique est en or.'), h('div', { class: 'btn-row' }, goB, reB));
      if (S.opts.sing) toggleSing(true);
    }

    /* une question : une note seule, ou une formule de plusieurs notes */
    function nextQuestion() {
      clearTimeout(autoT);
      if (!alive) return;
      if (run.active >= run.minutes * 60000) return finish();
      run.q++;
      extraMarks = [];
      const ks2 = S.keys[key];
      const motif = E.motifDue(S, key, run.q - 1);
      let degs;
      if (motif) degs = E.pickMotif(S, key, ks2.motif || 2, Math.random, run.lastMotif);
      else degs = [E.pickDegree(S, key, { prev: run.prev, fresh: run.fresh })];
      if (motif) run.lastMotif = degs;
      Q = { degs, midis: degs.map(d => E.degMidi(info, d)), i: 0, tries: 0, help: 0, per: [], t0: performance.now(), first: null, sung: false, wrongDeg: null, lastWrong: null, done: false, motif };
      if (run.boostNum > 0) run.boostNum--;
      lad.setActive(ks2.set, run.fresh && run.fresh.left > 0 ? run.fresh.d : null);
      lad.clear();
      paintKeys();
      help.hidden = true; help.innerHTML = '';
      fb.className = 'tn-fb'; fb.innerHTML = '';
      nextB.hidden = true;
      hintB.disabled = false;
      slots.innerHTML = '';
      slots.hidden = !motif;
      if (motif) for (let i = 0; i < degs.length; i++) slots.append(h('span', { class: 'tn-slot' }, '○'));
      prompt.innerHTML = motif ? `<b>${degs.length} notes</b> : retrouve-les dans l’ordre.` : 'Écoute, puis <b>trouve la note</b> au clavier.';
      if (sing.on) sing.setTarget(Q.midis[0]);
      cue(run.q > 1 && run.q % 8 === 1); // la cadence revient toutes les huit questions (l'introduction vient de la jouer)
    }
    /** La question se fait entendre : la cadence (une question sur huit) ou la tonique, puis la note ou la formule. */
    async function cue(withCadence = false) {
      if (!Q) return;
      busy = true;
      const list = [];
      let t = 0;
      if (withCadence) { const c = cadenceList(info); list.push(...c.notes); t = c.end + 0.45; }
      else { list.push({ m: info.tonic, t: 0, d: 0.5, v: 64 }); t = 0.8; }
      Q.midis.forEach((m, i) => { list.push({ m, t: t + i * 0.62, d: i === Q.midis.length - 1 ? 1.3 : 0.58, v: 84 }); });
      const ms = await play(list);
      sing.muteFor(ms + 150);
      clearTimeout(Q._busyT);
      Q._busyT = setTimeout(() => { busy = false; }, Math.max(0, ms - 300));
      if (S.opts.drone) startDrone();
    }
    function startDrone() {
      audio.stopAll(DRONE);
      audio.tone(info.tonic - 12, 0, { gain: 0.06, owner: DRONE });
      audio.tone(info.tonic - 17, 0, { gain: 0.045, owner: DRONE });
    }

    /* une touche jouée (piano ou écran) */
    function onKey(m) {
      if (!Q || Q.done || run.paused) return;
      sing.muteFor(1400);
      const target = Q.midis[Q.i];
      if (Q.first == null) Q.first = performance.now() - Q.t0;
      Q.tries++;
      if (pc(m) === pc(target)) return rightNote(m);
      wrongNote(m, target);
    }
    function rightNote(m) {
      flashKey(m, '#2e7a4c', 700);
      Q.per.push({ d: Q.degs[Q.i], tries: Q.tries, help: Q.help, w: Q.wrongDeg });
      if (Q.motif) {
        const sl = slots.children[Q.i];
        if (sl) { sl.textContent = E.degShort(Q.degs[Q.i]); sl.classList.add(Q.tries === 1 && Q.help < 2 ? 'ok' : 'found'); }
        lad.hit(Q.degs[Q.i]);
      }
      Q.i++;
      Q.tries = 0; Q.help = 0; Q.hintStep = 1; Q.wrongDeg = null; Q.lastWrong = null;
      hintB.disabled = false;
      extraMarks = [];
      help.hidden = true;
      if (Q.i < Q.midis.length) {
        fb.className = 'tn-fb ok';
        fb.textContent = `Oui. Note suivante (${Q.i + 1} sur ${Q.midis.length}).`;
        if (sing.on) sing.setTarget(Q.midis[Q.i]);
        paintKeys();
        return;
      }
      complete();
    }
    function wrongNote(m, target) {
      const dd = degreeOfMidi(m);
      if (Q.tries === 1) Q.wrongDeg = dd;
      Q.lastWrong = m;
      flashKey(m, '#d9534f', 480);
      const n = Q.tries; // erreurs sur cette note (la bonne n'a pas encore été jouée)
      fb.className = 'tn-fb bad';
      if (n === 1) {
        fb.innerHTML = '';
        const cmp = h('button', { class: 'btn sm ghost', type: 'button', html: `${PLAY} Ta note, puis la bonne` });
        cmp.addEventListener('click', async () => { const ms = await play([{ m: Q.lastWrong ?? m, t: 0, d: 0.6, v: 76 }, { m: target, t: 0.75, d: 1.0, v: 84 }]); sing.muteFor(ms + 150); });
        fb.append(h('span', {}, 'Pas celle-ci. Écoute les deux : la bonne est-elle plus haute ou plus basse ? '), cmp);
      } else if (n === 2) {
        fb.innerHTML = moveText(target - m) + ' <span class="small">Réécoute-la si besoin.</span>';
        Q.help = Math.max(Q.help, 2);
      } else if (n === 3) {
        showCandidates(target);
        fb.innerHTML = 'C’est l’une de ces deux touches (en orange).';
        Q.help = Math.max(Q.help, 4);
      } else {
        showKey(target);
        fb.innerHTML = 'La voici (en vert) : joue-la, et écoute-la bien.';
        Q.help = Math.max(Q.help, 5);
        run.boostNum = 3;
      }
    }
    const degreeOfMidi = m => { const k2 = S.keys[key]; const d = k2.set.find(x => pc(E.degMidi(info, x)) === pc(m)); return d ?? null; };
    function showCandidates(target) {
      const d = Q.degs[Q.i];
      const k2 = S.keys[key];
      // l'autre touche : celle que tu confonds le plus avec cette note, sinon la plus proche des notes en jeu
      const conf = {};
      for (const x of S.items) if (x.k === key && x.d === d && x.w != null && x.w !== d) conf[x.w] = (conf[x.w] || 0) + 1;
      let other = Object.entries(conf).sort((a, b) => b[1] - a[1]).map(([x]) => +x).find(x => k2.set.includes(x));
      if (other == null) other = k2.set.filter(x => x !== d).sort((a, b) => Math.abs(E.degOffset(a, info.mode) - E.degOffset(d, info.mode)) - Math.abs(E.degOffset(b, info.mode) - E.degOffset(d, info.mode)))[0];
      const pair = [target, other != null ? E.degMidi(info, other) : null].filter(x => x != null).sort(() => Math.random() - 0.5);
      extraMarks = pair.map(m => ({ m, color: '#f0b54a', label: '?', labelColor: '#3a2800' }));
      paintKeys();
    }
    function showKey(target) { extraMarks = [{ m: target, color: '#2e7a4c', label: 'ici', labelColor: '#fff' }]; paintKeys(); }

    /* l'indice demandé, par paliers : où elle est, sa couleur, deux touches, la touche */
    hintB.addEventListener('click', () => {
      if (!Q || Q.done) return;
      const d = Q.degs[Q.i];
      const target = Q.midis[Q.i];
      const lvl = Math.max(2, (Q.hintStep || 1) + 1);
      Q.hintStep = lvl;
      help.hidden = false;
      if (lvl === 2) { help.innerHTML = `<b>Où est-elle ?</b> ${placeText(info, d)}`; Q.help = Math.max(Q.help, 2); }
      else if (lvl === 3) { help.innerHTML = `<b>Sa couleur.</b> ${feelOf(info, d).replace(/^./, c => c.toUpperCase())}`; Q.help = Math.max(Q.help, 3); }
      else if (lvl === 4) { help.innerHTML = '<b>Deux touches possibles</b> : en orange sur le clavier.'; showCandidates(target); Q.help = Math.max(Q.help, 4); }
      else { help.innerHTML = '<b>La voici</b>, en vert : joue-la.'; showKey(target); Q.help = Math.max(Q.help, 5); hintB.disabled = true; }
    });
    againB.addEventListener('click', () => { if (Q && !Q.done) cue(false); });
    tonicB.addEventListener('click', async () => { const ms = await play([{ m: info.tonic, t: 0, d: 1.0, v: 70 }]); sing.muteFor(ms + 150); lad.hit(1, 'path'); setTimeout(() => lad.clear(), 900); });
    cadB.addEventListener('click', async () => { const c = cadenceList(info); const ms = await play(c.notes); sing.muteFor(ms + 150); });
    singB.addEventListener('click', () => toggleSing(!sing.on));
    async function toggleSing(on) {
      if (on) {
        sing.el.hidden = false;
        singB.setAttribute('aria-pressed', 'true'); singB.classList.add('on');
        if (Q && !Q.done) sing.setTarget(Q.midis[Q.i]);
        else sing.setTarget(info.tonic);
        const ok = await sing.start();
        if (!ok) { singB.setAttribute('aria-pressed', 'false'); singB.classList.remove('on'); }
      } else {
        sing.stop(); sing.el.hidden = true;
        singB.setAttribute('aria-pressed', 'false'); singB.classList.remove('on');
      }
    }

    /* la note trouvée : bilan de la question, résolution, adaptation, suite */
    async function complete() {
      Q.done = true;
      const ms = Math.round(Q.first ?? 0);
      const now = Date.now();
      let allFirst = true;
      for (const [j, p] of Q.per.entries()) {
        const o = p.tries === 1 && p.help < 2 ? 1 : 0;
        if (!o) allFirst = false;
        const it = { k: key, d: p.d, o, t: p.tries, h: p.help, ms: j === 0 ? ms : 0, at: now + j, ...(Q.sung && j === 0 ? { s: 1 } : {}), ...(p.w != null ? { w: p.w } : {}), ...(Q.motif ? { m: 1 } : {}) };
        E.record(S, it);
        run.items.push(it);
      }
      if (!Q.motif) { run.prev.push(Q.degs[0]); if (run.fresh) run.fresh.left--; }
      if (Q.per.some(p => p.tries >= 3)) run.boostNum = Math.max(run.boostNum, 3);
      // adaptation (notes seules) ; longueur des formules
      let event = null;
      if (!Q.motif) {
        const r = E.adapt(S, key);
        if (r) {
          E.applyAdapt(S, key, r, now);
          if (r.action === 'add') { run.fresh = { d: r.d, left: 10 }; event = r; run.events.push(r); }
          else if (r.action === 'remove') { if (run.fresh && run.fresh.d === r.d) run.fresh = null; event = r; run.events.push(r); }
          else if (r.action === 'full') { event = r; run.events.push(r); }
        }
      } else {
        const ch = E.motifResult(S, key, allFirst);
        if (ch) { event = { action: ch > 0 ? 'longer' : 'shorter', n: S.keys[key].motif }; run.events.push(event); }
      }
      saveState(S);
      updateTime();
      // ce qu'on dit
      const d = Q.degs[0];
      const tries = Q.per.reduce((a, p) => a + p.tries, 0);
      fb.className = 'tn-fb ok';
      if (Q.motif) {
        fb.innerHTML = `${allFirst ? '<b>Du premier coup !</b>' : '<b>Trouvée.</b>'} ${Q.degs.map(E.degShort).join(' – ')} <span class="small">(${Q.degs.map(x => E.degName(info, x)).join(', ')})</span>`;
      } else {
        const first = Q.per[0].tries === 1 && Q.per[0].help < 2;
        fb.innerHTML = `${first ? '<b>Du premier coup !</b>' : `<b>Trouvée</b> en ${tries} essai${tries > 1 ? 's' : ''}.`} C’est le <b>${esc(E.degLabel(d))}</b> (${esc(E.degName(info, d))}) : ${esc(feelOf(info, d))}${Q.sung ? ' <span class="small">Chantée juste avant de la jouer.</span>' : ''}`;
      }
      if (event) {
        const msg = event.action === 'add' ? `<b>Nouvelle note : ${esc(E.degLabel(event.d))}</b> (${esc(E.degName(info, event.d))}), en vert sur le clavier. Tu réussissais 9 notes sur 10 : on élargit.`
          : event.action === 'remove' ? `On met le <b>${esc(E.degLabel(event.d))}</b> de côté pour l’instant : il reviendra quand les autres seront sûres.`
          : event.action === 'full' ? '<b>Gamme complète</b> dans cette tonalité : les formules de plusieurs notes deviennent plus fréquentes.'
          : event.action === 'longer' ? `<b>Formules de ${event.n} notes</b> à partir de maintenant.` : `Formules de ${event.n} notes : un pas en arrière, le temps de les asseoir.`;
        help.hidden = false;
        help.innerHTML = msg;
        lad.setActive(S.keys[key].set, run.fresh && run.fresh.left > 0 ? run.fresh.d : null);
      }
      paintKeys();
      // la résolution (note seule) ou la formule rejouée, l'échelle suit
      busy = true;
      let wait;
      if (Q.motif) {
        const list = Q.midis.map((m, i) => ({ m, t: i * 0.5, d: i === Q.midis.length - 1 ? 0.9 : 0.46, v: 80 }));
        wait = await play(list);
        lad.path(Q.degs, 500);
      } else {
        const path = E.resolutionPath(d);
        const list = path.map((x, i) => ({ m: E.degMidi(info, x), t: 0.15 + i * 0.36, d: i === path.length - 1 ? 0.9 : 0.34, v: 78 }));
        wait = await play(list);
        lad.path(path, 360);
        if (path.length > 1) fb.insertAdjacentHTML('beforeend', ` <span class="small tn-res">${path.map(E.degShort).join(' → ')}</span>`);
      }
      sing.muteFor(wait + 200);
      setTimeout(() => { busy = false; }, wait);
      if (event && event.action === 'add') {
        // faire entendre la note nouvelle : la tonique, puis elle, puis son chemin vers la tonique
        setTimeout(async () => {
          if (!alive || run.paused) return;
          const path = E.resolutionPath(event.d);
          const list = [{ m: info.tonic, t: 0, d: 0.5, v: 66 }, { m: E.degMidi(info, event.d), t: 0.7, d: 0.9, v: 84 }, ...path.slice(1).map((x, i) => ({ m: E.degMidi(info, x), t: 1.7 + i * 0.36, d: 0.34, v: 76 }))];
          const w2 = await play(list);
          sing.muteFor(w2 + 200);
          lad.path([event.d, ...path.slice(1)], 360);
          schedule(w2 + 900);
        }, wait + 300);
      } else schedule(wait + (event ? 1800 : 650));
    }
    function schedule(ms) {
      clearTimeout(autoT);
      if (run.paused) { nextB.hidden = false; return; }
      autoT = setTimeout(() => { if (alive && !run.paused) nextQuestion(); }, ms);
    }
    nextB.addEventListener('click', () => { nextB.hidden = true; if (run.paused) setPaused(false); nextQuestion(); });
    function setPaused(p) {
      run.paused = p;
      run.tick = performance.now();
      pauseB.textContent = p ? 'Reprendre' : 'Pause';
      wrap.classList.toggle('paused', p);
      if (p) { clearTimeout(autoT); audio.stopAll(DRONE); if (Q && Q.done) nextB.hidden = false; prompt.innerHTML = '<b>En pause.</b> Le temps ne compte plus.'; }
      else {
        prompt.innerHTML = Q && Q.motif ? `<b>${Q.degs.length} notes</b> : retrouve-les dans l’ordre.` : 'Écoute, puis <b>trouve la note</b> au clavier.';
        if (S.opts.drone) startDrone();
        if (Q && Q.done) { nextB.hidden = true; nextQuestion(); }
      }
    }
    pauseB.addEventListener('click', () => setPaused(!run.paused));
    stopB.addEventListener('click', () => finish(true));

    /* fin de séance : le bilan */
    function finish(early = false) {
      if (run.over) return;
      run.over = true;
      clearTimeout(autoT);
      clearInterval(clock);
      stopSound(); audio.stopAll(DRONE);
      sing.stop();
      offs.forEach(f => f());
      const r = E.rate(run.items);
      const singlesRun = run.items.filter(x => !x.m);
      const min = Math.max(1, Math.round(run.active / 60000));
      const ks2 = S.keys[key];
      if (run.items.length) {
        const prevSess = [...S.sessions].reverse().find(x => x.k === key);
        E.recordSession(S, { at: run.start, end: Date.now(), k: key, n: run.items.length, ok: r.ok, tries: r.tries, min, ev: run.events.map(e => `${e.action}${e.d != null ? ':' + e.d : ''}`) });
        if (run.items.length >= 8) ks2.sessions = (ks2.sessions || 0) + 1;
        ks2.last = Date.now();
        S.lastKey = key;
        saveState(S);
        if (!opts.away) logActivity('oreille', min);
        store.set('ui.tnKey', null);
        renderEnd(r, prevSess, singlesRun, min, early);
      } else { saveState(S); renderHome(); }
      opts.onFinish?.({ n: run.items.length, ok: r.ok, tries: r.tries, min, key });
    }
    function renderEnd(r, prevSess, singlesRun, min, early) {
      root.innerHTML = '';
      const sum = E.keySummary(S, key);
      const card = h('div', { class: 'card tn-end' });
      card.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, `Séance faite · ${info.name}`), h('span', { class: 'small muted' }, `${min} min${early ? ', arrêtée avant la fin' : ''}`)));
      const stats = h('div', { class: 'tn-stats' },
        h('div', {}, h('b', {}, String(run.items.length)), h('small', {}, `note${run.items.length > 1 ? 's' : ''}`)),
        h('div', {}, h('b', {}, r.ok != null ? fmtPct(r.ok) : '—'), h('small', {}, 'du premier coup')),
        h('div', {}, h('b', {}, fmt1(r.tries)), h('small', {}, 'essais par note')));
      card.append(stats);
      const lines = [];
      if (prevSess) lines.push(`La fois d’avant en ${info.name} : ${prevSess.ok != null ? fmtPct(prevSess.ok) : '—'} du premier coup, ${fmt1(prevSess.tries)} essai${prevSess.tries >= 1.95 ? 's' : ''} par note.`);
      for (const e of run.events) {
        if (e.action === 'add') lines.push(`Nouvelle note : <b>${esc(E.degLabel(e.d))}</b> (${esc(E.degName(info, e.d))}).`);
        else if (e.action === 'remove') lines.push(`Mise de côté pour l’instant : ${esc(E.degLabel(e.d))}.`);
        else if (e.action === 'full') lines.push('<b>Gamme complète</b> dans cette tonalité.');
        else if (e.action === 'longer') lines.push(`Formules de ${e.n} notes.`);
      }
      const sung = run.items.filter(x => x.s).length;
      if (sung) lines.push(`Chantées juste avant de les jouer : ${sung}.`);
      // ce qui reste fragile
      const weak = sum.set.map(d => ({ d, a: E.degAcc(S, key, d, 6) })).filter(x => x.a != null && x.a < 0.7).sort((a, b) => a.a - b.a)[0];
      if (weak) lines.push(`Le plus fragile : le <b>${esc(E.degLabel(weak.d))}</b> (${esc(E.degName(info, weak.d))}), ${fmtPct(weak.a)} du premier coup. ${esc(feelOf(info, weak.d)).replace(/^./, c => c.toUpperCase())}`);
      card.append(h('ul', { class: 'tn-list small' }, ...lines.map(x => h('li', { html: x }))));
      const chips = h('div', { class: 'tn-chips' });
      for (const x of E.degreeMap(S, key).slice().sort((a, b) => E.degOffset(a.d, info.mode) - E.degOffset(b.d, info.mode))) chips.append(h('span', { class: `tn-chip ${x.state}${x.d === 1 || x.d === 8 ? ' tonic' : ''}${x.d < 0 ? ' low' : ''}`, title: `${E.degLabel(x.d)} (${x.name})` }, E.degShort(x.d)));
      card.append(chips, h('p', { class: 'small muted' }, 'Prochaine séance : une autre tonalité, choisie pour toi (tu peux la changer).'));
      const more = h('button', { class: 'btn', type: 'button' }, 'Encore 3 minutes, même tonalité');
      more.addEventListener('click', () => startRun(key, 3));
      const done = h('button', { class: 'btn primary', type: 'button' }, opts.away ? 'Fait' : 'Terminer');
      done.addEventListener('click', () => renderHome());
      card.append(h('div', { class: 'btn-row' }, done, opts.away ? null : more));
      root.append(card);
      card.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }

    offs.push(midi.on('noteon', ev => { kb.press(ev.note, true); onKey(ev.note); }));
    offs.push(midi.on('noteoff', ev => kb.press(ev.note, false)));
    // accès de test : la question en cours
    wrap.__tn = { get Q() { return Q; }, get run() { return run; }, get busy() { return busy; }, finish };
    root.__tn = wrap.__tn;
    cleanupRun = () => { clearTimeout(autoT); clearInterval(clock); offs.forEach(f => f()); stopSound(); audio.stopAll(DRONE); sing.stop(); if (!run.over && run.items.length && !opts.away) logActivity('oreille', Math.max(1, Math.round(run.active / 60000))); };
    intro();
    wrap.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  renderHome();
  return () => { alive = false; try { cleanupRun?.(); } catch (e) { /* */ } stopSound(); audio.stopAll(DRONE); };
}
