// Point d'entrée : navigation, pages, barre du haut.
import { h, esc, $, $$, fmtPct, noteNameFr, INFORMANCE } from './util.js';
import { store } from './store.js';
import { midi } from './midi.js';
import { audio } from './audio.js';
import { sharedMetronome } from './metronome.js';
import { makeW, mountWidgets, ICONS, lessonToggle } from './widgets.js';
import { keyboard } from './diagrams.js';
import { toast } from './toast.js';
import { ensureAbcjs, mountLazy } from './lazy.js';
import { initUpdates, checkForUpdate, applyUpdate, hasUpdate, version } from './updates.js';
import { exportProgress, importProgress, resetAll, needsBackupReminder, postponeReminder, lastBackupLabel, requestPersistence } from './backup.js';
import { LEVELS, MODULES, PIECES, lessonById, levelById, allLessons, lessonsOf, loadLesson, loadPiece } from './content-index.js';
import { mountSessionBox, weekCard, updateSessionBar, improNext, improSummary, nextTechLesson, scalesOfWeek } from './session.js';
import { backfillActivity } from './activity.js';

const main = $('#main');
const sidebar = $('#sidebar');
let cleanup = null;

/* ================================================================== */
/* Icônes de navigation                                                */
/* ================================================================== */
const NI = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  level: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  piece: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  plan: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  check: '<path d="M5 12l4 4 10-10"/>',
  mastery: '<rect x="4" y="7" width="13" height="13" rx="2"/><path d="M8 4h11a1 1 0 0 1 1 1v11"/><path d="M8 13l2.5 2.5L14 11"/>',
  technique: '<path d="M7 20v-6l-3-3 4-7h3l1 4 4-2 3 3-6 5v6"/>',
  interpretation: '<path d="M4 15c3-8 6 4 9-4s5 2 7-1"/><path d="M4 20h16"/>',
  theorie: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/><circle cx="10" cy="14" r="2"/>',
  lecture: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  impro: '<path d="M12 3v12"/><path d="M12 15a3 3 0 1 1-3-3"/><path d="M15 6c2 1 3 3 3 5"/>',
  compose: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>',
  hands: '<path d="M7 11V5a1.5 1.5 0 0 1 3 0v6M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6 7s-5-2-6.5-5L3 12a1.5 1.5 0 0 1 2.5-1.5L7 13"/>',
  metro: '<path d="M9 3h6l4 18H5L9 3z"/><path d="M12 15l5-8"/>',
  ear: '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5 2"/>',
  oreille: '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5 2"/><path d="M11 10a1 1 0 1 1 2 0"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  rythme: '<path d="M6 17V6l12-2v11"/><circle cx="5" cy="17" r="2"/><circle cx="17" cy="15" r="2"/><path d="M6 10l12-2"/>',
  keys: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v9M12 5v14M16 5v9"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};
const ico = name => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${NI[name] || ''}</svg>`;

/* ================================================================== */
/* Routeur                                                             */
/* ================================================================== */
const routes = [
  [/^#?\/?$/, pageHome],
  [/^#\/parcours$/, pageParcours],
  [/^#\/niveau\/(n\d)$/, pageLevel],
  [/^#\/niveau\/(n\d)\/(technique|interpretation|theorie|oreille|lecture|impro)$/, pageModule],
  [/^#\/lecon\/([\w-]+)$/, pageLesson],
  [/^#\/piece\/([\w-]+)(?:\/([\w-]+))?$/, pagePiece],
  // le plan hebdomadaire (V2 à V6) est remplacé par la carte de la pièce
  [/^#\/plan\/(n\d)$/, id => { location.hash = `#/piece/${levelById(id)?.piece || ''}`; }],
  [/^#\/validation\/(n\d)$/, pageValidation],
  [/^#\/outils$/, pageTools],
  [/^#\/outils\/metronome$/, () => toolPage('Métronome', 'Mesures muettes, accélération progressive, tempo tapé.', () => import('./tool-metronome-ui.js').then(m => el => m.mountMetronome(el, { title: false })))],
  [/^#\/outils\/lecture$/, () => toolPage('Lecture à vue', 'Trois minutes d’échauffement (le rythme, puis deux exercices d’une minute), puis de vrais extraits du répertoire (Bach, Diabelli, Burgmüller, Schumann…) : prépare-toi 30 secondes, puis joue sans t’arrêter. La difficulté s’ajuste à tes résultats.', () => Promise.all([import('./tool-sight.js'), import('./tool-warmup.js'), ensureAbcjs()]).then(([m, wu]) => el => {
    const wuHost = h('div');
    const sightHost = h('div');
    const sightTitle = h('div', { class: 'section-title mt-3' }, h('h2', {}, 'Les extraits'));
    el.append(wuHost, sightTitle, sightHost);
    const b = wu.mountWarmup(wuHost, { level: currentLevel().id, onDone: () => sightTitle.scrollIntoView({ behavior: 'smooth', block: 'start' }) });
    const a = m.mountSight(sightHost, { level: store.get('sight.level') || (currentLevel().id === 'n2' ? '2' : '1rh') });
    return () => { try { a?.(); } catch (e) { /* */ } try { b?.(); } catch (e) { /* */ } };
  }))],
  [/^#\/maitrise$/, () => toolPage('En cours de maîtrise', 'Les leçons que tu apprends par cœur : une fiche pour relire l’essentiel, de petits exercices corrigés pour vérifier que tu le sais.', () => import('./tool-mastery.js').then(m => el => m.mountMastery(el)))],
  [/^#\/outils\/rythme$/, () => toolPage('Rythme', 'Lire le rythme : compter, subdiviser, placer chaque attaque. Dix niveaux, des noires aux polyrythmies, et les rythmes de tes pièces.', () => Promise.all([import('./tool-rhythm.js'), ensureAbcjs()]).then(([m]) => el => m.mountRhythmPage(el)))],
  [/^#\/outils\/oreille(?:\/(jouer|parcours))?$/, pageEar],
  [/^#\/outils\/theorie$/, () => pagePresets('theorie')],
  [/^#\/outils\/analyseur$/, () => toolPage('Analyse technique', 'Pour les gammes, arpèges et exercices joués sans partition : régularité, legato, pédale, équilibre des mains. Pour un passage de tes pièces, utilise plutôt « Analyser » sous l’extrait : l’analyse compare alors ton jeu à la partition.', () => import('./tool-analyzer.js').then(m => el => m.mountAnalyzer(el, { modes: ['evenness', 'legato', 'pedal', 'balance', 'voicing', 'dynamics'] })))],
  [/^#\/outils\/impro$/, pageImproTool],
  [/^#\/outils\/technique$/, pageTechnique],
  [/^#\/outils\/composition$/, pageCompose],
  [/^#\/outils\/exercices(?:\/([\w-]+))?$/, pageExercises],
  [/^#\/outils\/clavier$/, pageKeyboardTest],
  [/^#\/reglages$/, pageSettings],
];

/** Jeton de navigation : une page asynchrone vérifie qu'elle est toujours affichée avant d'écrire. */
let navToken = 0;
const stillHere = tok => tok === navToken;
const showError = e => { console.error(e); main.innerHTML = `<div class="page"><h1>Erreur</h1><p>${esc(e.message || String(e))}</p></div>`; };

function router() {
  const hash = location.hash || '#/';
  cleanup?.();
  cleanup = null;
  const tok = ++navToken;
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) {
      main.innerHTML = '';
      try {
        const res = fn(...m.slice(1));
        if (res && typeof res.then === 'function') {
          // page asynchrone : le nettoyage arrive quand la page est prête
          let inner = null, gone = false;
          cleanup = () => { gone = true; try { inner?.(); } catch (e) { /* */ } };
          res.then(c => { if (gone || !stillHere(tok)) { try { c?.(); } catch (e) { /* */ } } else { inner = c || null; frenchSpacing(main); } })
            .catch(e => { if (stillHere(tok)) showError(e); });
        } else cleanup = res || null;
      } catch (e) { showError(e); }
      renderNav(hash);
      updateSessionBar(hash);
      frenchSpacing(main);
      closeNav();
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
      if (!hash.startsWith('#/reglages')) store.set('lastRoute', hash);
      return;
    }
  }
  location.hash = '#/';
}

/* ================================================================== */
/* Navigation latérale                                                 */
/* ================================================================== */
function renderNav(hash) {
  const link = (href, label, icon, extra = {}) => {
    const active = hash === href || (extra.prefix && hash.startsWith(extra.prefix));
    return `<a class="nav-link${active ? ' active' : ''}${extra.locked ? ' locked' : ''}" href="${href}">${ico(icon)}<span>${esc(label)}</span>${extra.meta ? `<span class="meta">${esc(extra.meta)}</span>` : ''}</a>`;
  };
  let html = `<div class="nav-section">${link('#/', 'Accueil', 'home')}${link('#/parcours', 'Le parcours', 'map')}${link('#/maitrise', 'En cours de maîtrise', 'mastery')}</div>`;
  html += `<div class="nav-section"><div class="nav-title">Niveaux</div>`;
  for (const L of LEVELS) {
    if (L.locked) continue;
    const ls = allLessons().filter(x => x.level === L.id);
    const done = ls.filter(x => store.isDone(x.id)).length;
    const open = hash.includes(`/${L.id}`) || (hash.startsWith('#/lecon/') && hash.includes(L.id + '-')) || (hash.startsWith('#/piece/') && L.pieceIds.some(p => hash.endsWith(p)));
    html += `<div class="nav-level">${link(`#/niveau/${L.id}`, `Niveau ${L.num} — ${L.short}`, 'level', { meta: `${done}/${ls.length}`, prefix: `#/niveau/${L.id}/` })}`;
    html += `<div class="nav-progress"><i style="width:${ls.length ? done / ls.length * 100 : 0}%"></i></div>`;
    if (open) {
      html += `<div class="nav-sub">`;
      html += link(`#/piece/${L.piece}`, 'Pièce phare', 'piece', { prefix: `#/piece/${L.piece}/` });
      html += link(`#/validation/${L.id}`, 'Valider le niveau', 'check');
      html += `</div>`;
    }
    html += `</div>`;
  }
  html += `</div><div class="nav-section"><div class="nav-title">Outils</div>`;
  html += link('#/outils/technique', 'Technique', 'technique');
  html += link('#/outils/rythme', 'Rythme', 'rythme');
  html += link('#/outils/lecture', 'Lecture à vue', 'lecture');
  html += link('#/outils/exercices', 'Exercices', 'hands');
  html += link('#/outils/oreille', 'Oreille', 'ear');
  html += link('#/outils/theorie', 'Théorie', 'theorie');
  html += link('#/outils/impro', 'Improvisation', 'impro');
  html += link('#/outils/composition', 'Composition', 'compose');
  html += link('#/outils/analyseur', 'Analyse technique', 'chart');
  html += `</div><div class="nav-section">${link('#/reglages', 'Réglages', 'gear')}</div>`;
  sidebar.innerHTML = html;
}

const app = $('#app');
const navToggle = $('#navToggle');
const scrim = $('#scrim');
function closeNav() { app.classList.remove('nav-open'); navToggle.setAttribute('aria-expanded', 'false'); scrim.hidden = true; }
navToggle.addEventListener('click', () => {
  const open = !app.classList.contains('nav-open');
  app.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  scrim.hidden = !open;
});
scrim.addEventListener('click', closeNav);

/* ================================================================== */
/* Barre du haut : MIDI et métronome rapide                            */
/* ================================================================== */
const midiPill = $('#midiPill'), midiLabel = $('#midiLabel');
function renderMidi(status, name) {
  midiPill.classList.remove('ready', 'waiting', 'error');
  const map = {
    off: ['Connecter le piano', ''],
    waiting: ['Connexion…', 'waiting'],
    ready: [name ? shortName(name) : 'Piano connecté', 'ready'],
    nodevice: ['Aucun piano détecté', 'waiting'],
    denied: ['Accès MIDI refusé', 'error'],
    unsupported: ['MIDI indisponible', 'error'],
  };
  const [label, cls] = map[status] || map.off;
  midiLabel.textContent = label;
  if (cls) midiPill.classList.add(cls);
}
const shortName = n => n.length > 22 ? n.slice(0, 20) + '…' : n;
midi.on('status', renderMidi);
midi.on('link', kind => {
  if (kind === 'lost') toast('Piano déconnecté. Vérifie la liaison (Bluetooth : MIDI BLE Connect), puis touche « Connecter le piano ».', 'err', 6000);
  else if (kind === 'back') toast('Piano reconnecté', 'ok');
  else if (kind === 'silent') toast('Le piano ne répond plus : la liaison semble interrompue.', 'err', 5000);
});
midiPill.addEventListener('click', async () => {
  audio.unlock();
  if (midi.status === 'ready') { location.hash = '#/outils/clavier'; return; }
  if (!midi.supported) { toast('Ce navigateur ne gère pas le MIDI. Utilise Chrome sur Android.', 'err', 4200); return; }
  const ok = await midi.init();
  if (ok) toast(`Piano connecté : ${midi.deviceName}`, 'ok');
  else if (midi.status === 'nodevice') toast('Aucun appareil MIDI : vérifie la connexion (câble ou Bluetooth) et que le piano est allumé.', 'err', 4200);
  else if (midi.status === 'denied') toast('Accès MIDI refusé par le navigateur. Dans Chrome : ⋮ → Paramètres → Paramètres des sites → appareils MIDI : autorise les demandes, puis retouche « Connecter le piano ».', 'err', 8000);
  else if (midi.status === 'unsupported') toast(`Le navigateur n’a pas pu ouvrir le MIDI (${midi.lastError || 'erreur inconnue'}). Utilise Chrome à jour.`, 'err', 8000);
});

const metroPill = $('#metroPill'), metroLabel = $('#metroPillLabel');
let pop = null;
metroPill.addEventListener('click', (e) => {
  e.stopPropagation();
  if (pop) { pop.remove(); pop = null; return; }
  pop = h('div', { class: 'card', style: { position: 'fixed', top: '60px', right: '14px', zIndex: 40, width: '260px', padding: '14px' } });
  const bpm = h('div', { style: { fontSize: '34px', fontWeight: 700, textAlign: 'center' } });
  const go = h('button', { class: 'btn primary', type: 'button', style: { flex: 1 } });
  const minus = h('button', { class: 'btn', type: 'button' }, '−'), plus = h('button', { class: 'btn', type: 'button' }, '+');
  const more = h('a', { href: '#/outils/metronome', class: 'small', style: { display: 'block', textAlign: 'center', marginTop: '10px' } }, 'Toutes les options');
  const upd = () => { bpm.textContent = `♩ = ${sharedMetronome.bpm}`; go.textContent = sharedMetronome.running ? 'Arrêter' : 'Démarrer'; };
  go.addEventListener('click', () => { sharedMetronome.toggle(); setTimeout(upd, 50); });
  minus.addEventListener('click', () => { sharedMetronome.setBpm(sharedMetronome.bpm - 2); upd(); });
  plus.addEventListener('click', () => { sharedMetronome.setBpm(sharedMetronome.bpm + 2); upd(); });
  more.addEventListener('click', () => { pop?.remove(); pop = null; });
  pop.append(bpm, h('div', { class: 'btn-row', style: { marginTop: '10px' } }, minus, go, plus), more);
  document.body.append(pop);
  upd();
});
document.addEventListener('click', e => { if (pop && !pop.contains(e.target) && e.target !== metroPill) { pop.remove(); pop = null; } });
sharedMetronome.on(type => {
  if (type === 'start' || type === 'stop' || type === 'bpm') {
    metroPill.classList.toggle('on', sharedMetronome.running);
    metroLabel.textContent = sharedMetronome.running ? `♩ = ${sharedMetronome.bpm}` : 'Métronome';
  }
});

/* ================================================================== */
/* Aides                                                               */
/* ================================================================== */
function currentLevel() {
  for (const L of LEVELS) {
    if (L.locked) continue;
    if (!isLevelValidated(L)) return L;
  }
  return LEVELS.filter(l => !l.locked).slice(-1)[0];
}
function isLevelValidated(L) {
  return L.validation.length > 0 && L.validation.every(c => (store.get('validation')?.[`${L.id}:${c.id}`] ?? 0) >= 2);
}
function levelProgress(L) {
  const ls = allLessons().filter(x => x.level === L.id);
  return { done: ls.filter(x => store.isDone(x.id)).length, total: ls.length };
}
function crumbs(items) {
  return `<nav class="crumbs" aria-label="Fil d’Ariane">${items.map((it, i) => (it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`) + (i < items.length - 1 ? '<span aria-hidden="true">›</span>' : '')).join('')}</nav>`;
}
function renderRich(container, bodyFn) {
  const { W, cfgs } = makeW();
  container.innerHTML = bodyFn(W);
  container._core = W._core.slice(); // encadrés « À retenir » : affichés en tête (L'essentiel)
  const unmount = mountWidgets(container, cfgs);
  frenchSpacing(container);
  return unmount;
}
/**
 * Leçon en étapes (V6, leçons avec steps: true) : chaque titre h2 ouvre une étape repliable, une seule ouverte à la
 * fois. Une étape est cochée quand ses exercices sont faits (ou, sans exercice, quand on passe à la suivante).
 * Les widgets d'une étape fermée ne sont montés qu'à son ouverture. Ce qui précède le premier h2 reste visible.
 */
function renderSteps(container, l) {
  const { W, cfgs } = makeW();
  container.innerHTML = l.body(W);
  container._core = W._core.slice();
  container._notions = W._notions.slice();
  const heads = [...container.children].filter(x => x.tagName === 'H2');
  if (!heads.length) { const un = mountWidgets(container, cfgs); frenchSpacing(container); return un; }
  const key = `lessonSteps.${l.id}`;
  const saved = store.get(key) || {};
  const doneSet = new Set(saved.done || []);
  const save = patch => store.set(key, { ...(store.get(key) || {}), ...patch });
  const cleanups = [];
  // exercices qui cochent l'étape : « À toi », construction, partition ; les séries d'entraînement restent facultatives
  const counts = x => /\bw-(check|build|spot)\b/.test(x.className) || (/\bw-quiz\b/.test(x.className) && /^À toi/.test(((cfgs.get(x.dataset.wid || x.dataset.widLazy) || {}).cfg || {}).title || ''));
  const steps = heads.map((hd, i) => {
    const nodes = [];
    let n = hd.nextElementSibling;
    while (n && n.tagName !== 'H2') { nodes.push(n); n = n.nextElementSibling; }
    const det = h('details', { class: 'step' });
    const tick = h('span', { class: 'step-tick', title: 'Étape faite', hidden: !doneSet.has(i) }, '✓');
    const sum = h('summary', {}, h('span', { class: 'step-num' }, `Étape ${i + 1}`), h('span', { class: 'step-title', html: hd.innerHTML }), tick);
    const body = h('div', { class: 'step-body' });
    hd.replaceWith(det);
    det.append(sum, body);
    nodes.forEach(x => body.append(x));
    const exos = [...body.querySelectorAll('[data-wid]')].filter(counts).length;
    body.querySelectorAll('[data-wid]').forEach(x => { x.dataset.widLazy = x.dataset.wid; delete x.dataset.wid; });
    return { det, body, tick, title: hd.textContent.trim(), exos, got: new Set(), mounted: false };
  });
  const markDone = i => {
    if (doneSet.has(i)) return;
    doneSet.add(i);
    steps[i].tick.hidden = false;
    save({ done: [...doneSet] });
  };
  const mount = st => {
    if (st.mounted) return;
    st.mounted = true;
    st.body.querySelectorAll('[data-wid-lazy]').forEach(x => { x.dataset.wid = x.dataset.widLazy; delete x.dataset.widLazy; });
    cleanups.push(mountWidgets(st.body, cfgs));
    frenchSpacing(st.body);
  };
  let all = false;
  steps.forEach((st, i) => {
    st.det.addEventListener('toggle', () => {
      if (!st.det.open) return;
      mount(st);
      save({ open: i });
      if (!all) steps.forEach((o, j) => { if (j !== i && o.det.open) o.det.open = false; });
    });
    // exercices de l'étape : coche quand tous ont été faits une fois
    st.body.addEventListener('exo-done', e => {
      const w = e.target.closest('[data-wid]');
      if (w && !counts(w)) return;
      st.got.add(w ? w.dataset.wid : String(st.got.size));
      if (st.got.size >= st.exos) markDone(i);
    });
    const foot = h('div', { class: 'step-foot' });
    if (i < steps.length - 1) {
      const nx = steps[i + 1];
      const b = h('button', { class: 'btn primary step-next', type: 'button', html: `Étape suivante : <span class="step-next-t">${esc(nx.title)}</span> →` });
      b.addEventListener('click', () => {
        if (!st.exos) markDone(i);
        nx.det.open = true;
        requestAnimationFrame(() => nx.det.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      });
      foot.append(b);
      if (st.exos) foot.append(h('span', { class: 'small muted' }, 'L’étape se coche quand ses exercices sont faits.'));
    } else {
      foot.append(h('span', { class: 'small muted' }, 'Dernière étape. Quand tout est fait, marque la leçon comme terminée, en bas de la page.'));
      if (!st.exos) st.det.addEventListener('toggle', () => { if (st.det.open) markDone(i); });
    }
    st.body.append(foot);
  });
  // en tête : nombre d'étapes, tout ouvrir
  const allBtn = h('button', { class: 'btn sm ghost', type: 'button' }, 'Tout ouvrir');
  allBtn.addEventListener('click', () => {
    all = !all;
    allBtn.textContent = all ? 'Une étape à la fois' : 'Tout ouvrir';
    if (all) steps.forEach(st => { st.det.open = true; });
    else steps.forEach((st, j) => { st.det.open = j === (store.get(key)?.open ?? 0); });
  });
  const intro = h('div', { class: 'steps-head' }, h('span', { class: 'small' }, `${steps.length} étapes, une à la fois : une idée, un exemple, un exercice.`), allBtn);
  steps[0].det.before(intro);
  // d'abord ce qui est hors des étapes (les étapes fermées gardent leurs widgets en attente), puis l'étape ouverte
  cleanups.push(mountWidgets(container, cfgs));
  frenchSpacing(container);
  const openIdx = Number.isInteger(saved.open) && saved.open < steps.length ? saved.open : 0;
  steps[openIdx].det.open = true;
  mount(steps[openIdx]);
  return () => cleanups.forEach(fn => { try { fn(); } catch (e) { /* */ } });
}
/**
 * Page de pièce : comme renderRich, mais les passages (les h3 qui suivent « Les passages, un par un ») deviennent des
 * sections repliables. Une seule ouverte d'emblée (la dernière consultée, sinon la première) ; les partitions d'un
 * passage fermé ne sont dessinées qu'à son ouverture.
 */
function renderPieceBody(container, bodyFn, pieceId, want = null) {
  const { W, cfgs } = makeW();
  container.innerHTML = bodyFn(W);
  container._core = W._core.slice();
  const h2 = [...container.querySelectorAll('h2')].find(x => /^Les (passages|sections)/.test(x.textContent.trim()));
  const groups = [];
  if (h2) {
    let n = h2.nextElementSibling;
    while (n && n.tagName !== 'H2') {
      const next = n.nextElementSibling;
      if (n.tagName === 'H3') groups.push({ h: n, nodes: [] });
      else if (groups.length) groups[groups.length - 1].nodes.push(n);
      n = next;
    }
  }
  const key = `pieces.${pieceId}.openPassage`;
  const saved = store.get(key);
  const asked = want ? groups.findIndex(g => g.h.dataset.sec === want) : -1;
  const openIdx = asked >= 0 ? asked : Number.isInteger(saved) && saved < groups.length ? saved : 0;
  const cleanups = [];
  const lazy = new Map(); // details → monté ?
  groups.forEach((g, i) => {
    const det = h('details', { class: 'passage' });
    if (g.h.dataset.sec) { det.dataset.sec = g.h.dataset.sec; det.id = `sec-${g.h.dataset.sec}`; }
    const m = g.h.textContent.match(/\(([^)]*)\)\s*$/);
    const sum = h('summary', {}, h('span', { class: 'ps-title' }, m ? g.h.textContent.slice(0, m.index).trim() : g.h.textContent.trim()), m ? h('span', { class: 'ps-bars' }, m[1]) : null);
    const bodyEl = h('div', { class: 'passage-body' });
    g.h.replaceWith(det);
    det.append(sum, bodyEl);
    g.nodes.forEach(x => bodyEl.append(x));
    // partitions différées : on masque leurs marqueurs jusqu'à l'ouverture
    bodyEl.querySelectorAll('[data-wid]').forEach(x => { x.dataset.widLazy = x.dataset.wid; delete x.dataset.wid; });
    lazy.set(det, false);
    det.addEventListener('toggle', () => {
      if (!det.open) return;
      store.set(key, i);
      if (lazy.get(det)) return;
      lazy.set(det, true);
      bodyEl.querySelectorAll('[data-wid-lazy]').forEach(x => { x.dataset.wid = x.dataset.widLazy; delete x.dataset.widLazy; });
      cleanups.push(mountWidgets(bodyEl, cfgs));
      frenchSpacing(bodyEl);
    });
    if (i === openIdx) det.open = true;
  });
  // V7 : l'état de chaque section (carte de la pièce) dans son titre
  if (groups.some(g => g.h.dataset.sec)) {
    const dets = [...container.querySelectorAll('details.passage[data-sec]')];
    Promise.all([import('./piecemap.js'), import('./content-piecemap.js')]).then(([pm, cpm]) => {
      const paint = () => dets.forEach(det => {
        const { st } = pm.sectionState(pieceId, det.dataset.sec);
        const sum = det.querySelector(':scope > summary');
        let tag = sum.querySelector('.pm-state');
        if (!tag) { tag = h('span', { class: 'pm-state' }); sum.append(tag); }
        tag.className = `pm-state s${st}`;
        tag.textContent = cpm.SECTION_STATES[st].short;
      });
      paint();
      cleanups.push(store.subscribe(p => { if (p === `pieces.${pieceId}.sections`) paint(); }));
    }).catch(() => {});
  }
  if (groups.length > 1 && !groups.some(g => g.h.dataset.sec)) {
    const nav = h('p', { class: 'small ps-hint' }, `${groups.length} passages : touche un titre pour l’ouvrir ou le fermer.`);
    h2.after(nav);
  }
  container._openIdx = openIdx;
  container._groups = groups.length;
  cleanups.push(mountWidgets(container, cfgs));
  frenchSpacing(container);
  return () => cleanups.forEach(fn => { try { fn(); } catch (e) { /* */ } });
}
/** Encadré de tête d'une leçon : l'essentiel (à retenir), l'objectif mesurable et les objectifs ; pour une leçon de
 *  théorie, la case « À apprendre par cœur » (sa fiche et ses exercices vont dans « En cours de maîtrise »). */
function essentialsCard(l, core, notions = []) {
  const ess = notions.length ? '<ul class="ess-notions"></ul>' : l.essentials && l.essentials.length ? `<ul>${l.essentials.map(x => `<li>${x}</li>`).join('')}</ul>` : core.join('');
  const goals = l.goals && l.goals.length ? `<ul class="goals">${l.goals.map(g => `<li>${g}</li>`).join('')}</ul>` : '';
  const heart = l.module === 'theorie' && l.id;
  if (!ess && !goals && !l.goal && !heart) return null;
  const card = h('div', { class: 'card essentials' + (ess && goals ? ' two' : '') });
  card.innerHTML = (ess ? `<div class="ess-col"><div class="ess-title">${ICONS.star}${notions.length ? 'Les notions clés' : 'L’essentiel'}</div>${ess}</div>` : '') +
    (goals || l.goal ? `<div class="ess-col"><div class="ess-title muted-title">À la fin de cette leçon</div>${goals}${l.goal ? `<p class="ess-goal"><b>Réussi quand :</b> ${l.goal}</p>` : ''}</div>` : '');
  if (notions.length) {
    const ul = card.querySelector('.ess-notions');
    for (const n of notions) ul.append(h('li', { html: `<b>${esc(n.title)}</b>${n.short ? ` : ${n.short}` : ''}` }));
  }
  if (heart) card.append(h('div', { class: 'ess-heart' }, lessonToggle(l), h('span', { class: 'small muted' }, 'Sa fiche et ses exercices t’attendent dans ', h('a', { href: '#/maitrise' }, 'En cours de maîtrise'), '.')));
  return card;
}
/** Typographie française : espace fine insécable avant ? ! ; : et à l'intérieur des guillemets. */
export function frenchSpacing(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement && n.parentElement.closest('svg, script, style, code')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const t = n.nodeValue;
    const r = t.replace(/ ([?!;:»])/g, '\u202F$1').replace(/« /g, '«\u202F').replace(/(op\.|n°|m\.) (\d)/g, '$1\u00A0$2').replace(/(\d) n°/g, '$1\u00A0n°').replace(/(♩\.?|♪) = (\d)/g, '$1\u00A0=\u00A0$2');
    if (r !== t) n.nodeValue = r;
  }
}
function lessonListHTML(lessons, { levelTag = false } = {}) {
  // V7.4 : une case par leçon, pour cocher celles déjà faites (elles ne sont plus proposées dans la séance)
  return `<ul class="lesson-list">${lessons.map((l, i) => { const d = store.isDone(l.id); return `<li class="${d ? 'done' : ''}${l.prio === 2 ? ' opt' : ''}"><a href="#/lecon/${l.id}"><span class="num" data-n="${i + 1}">${d ? '✓' : i + 1}</span><span class="t"><b>${esc(l.title)}</b>${l.prio === 2 ? '<em class="tag opt-tag">complément</em>' : ''}${levelTag ? `<em class="tag opt-tag">niveau ${l.level.slice(1)}</em>` : ''}<span>${esc(l.summary || '')}</span></span><span class="dur">${l.minutes ? l.minutes + ' min' : ''}</span></a><button type="button" class="ll-done" data-done="${l.id}" aria-pressed="${d}" aria-label="Leçon déjà faite : ${esc(l.title)}" title="${d ? 'Décocher' : 'Cocher : déjà faite (elle ne sera plus proposée dans la séance)'}"><span class="ll-box"></span></button></li>`; }).join('')}</ul>`;
}
/* ================================================================== */
/* Pages                                                               */
/* ================================================================== */
function pageHome() {
  const L = currentLevel();
  const p = levelProgress(L);
  const page = h('div', { class: 'page' });
  page.innerHTML = `
    <div class="page-head"><h1>Bonjour Louis</h1><p class="lead">Choisis ce que tu travailles aujourd’hui. L’appli te propose la suite de chaque domaine et te signale ce que tu laisses de côté depuis trop longtemps.</p></div>
    <div id="sessionBox"></div>
    <div class="grid cols-2 home-row">
      <div id="pieceBox"></div>
      <div id="weekBox"></div>
    </div>
    <p class="small home-theory" id="theoryLine" hidden></p>
    <div class="section-title"><h2>Niveau ${L.num} — ${esc(L.title)}</h2><span class="small"><a href="#/niveau/${L.id}">Voir le niveau</a></span></div>
    <div class="card level-mini">
      <div class="card-top"><span class="small">${esc(L.subtitle)}</span><span class="tag accent">${p.done}/${p.total} leçons</span></div>
      <div class="progress"><i style="width:${p.total ? p.done / p.total * 100 : 0}%"></i></div>
      <div class="btn-row mt-2"><a class="btn sm" href="#/niveau/${L.id}">Les six modules</a><a class="btn sm ghost" href="#/validation/${L.id}">Valider le niveau</a></div>
    </div>
    <div class="section-title"><h2>Outils</h2></div>
    <div class="grid cols-3 tools-grid">
      ${toolCard('#/outils/lecture', 'Lecture à vue', 'De vrais extraits à ton niveau, jamais deux fois le même.')}
      ${toolCard('#/outils/rythme', 'Rythme', 'Lire et taper des rythmes : dix niveaux, et ceux de tes pièces.')}
      ${toolCard('#/outils/oreille', 'Oreille', 'Entendre, chanter, jouer : un seul parcours, dans toutes les tonalités.')}
      ${toolCard('#/outils/impro', 'Improvisation', 'L’exercice où tu en es, et l’accompagnateur pour jouer librement.')}
      ${toolCard('#/outils/exercices', 'Exercices', 'Indépendance des mains, polyrythmes, lié contre détaché.')}
      ${toolCard('#/outils/theorie', 'Théorie', 'Tous les cours, et des exercices pour réviser.')}
      ${toolCard('#/outils/composition', 'Composition', 'Écrire ta pièce de 8 mesures, notée et vérifiée.')}
      <a class="card" href="#/maitrise" id="masteryCard"><h3>En cours de maîtrise</h3><p>Les leçons que tu apprends par cœur : leurs fiches et de petits exercices.</p></a>
    </div>
    <div id="midiHelp"></div>`;
  main.append(page);
  const offs = [];
  if (needsBackupReminder()) {
    const later = h('button', { class: 'btn ghost sm', type: 'button' }, 'Plus tard');
    const go = h('button', { class: 'btn sm', type: 'button' }, 'Exporter maintenant');
    const box = h('div', { class: 'callout tip mt-2' }, h('div', { class: 'c-title', html: ICONS.bulb + 'Sauvegarde ta progression' }),
      h('p', {}, `Dernière sauvegarde : ${lastBackupLabel()}. Un fichier d’export te protège si les données de Chrome sont effacées.`), h('div', { class: 'btn-row' }, go, later));
    go.addEventListener('click', async () => { await exportProgress(); box.remove(); toast('Fichier de sauvegarde téléchargé', 'ok'); });
    later.addEventListener('click', () => { postponeReminder(7); box.remove(); });
    $('.page-head', page).after(box);
  }
  // la séance : nouvelle séance (cases à cocher) ou séance en cours
  offs.push(mountSessionBox($('#sessionBox', page), L));
  // ta pièce : avancement par section, objectif de date, section du jour
  import('./piecemap.js').then(pm => {
    if (!page.isConnected) return;
    const box = $('#pieceBox', page);
    if (pm.hasMap(L.piece)) { const un = pm.mountPieceHead(box, { piece: L.piece, compact: true }); if (un) offs.push(un); }
    else box.innerHTML = `<a class="card piece" href="#/piece/${L.piece}"><div class="card-top"><span class="eyebrow">Pièce phare</span></div><h3>${esc(PIECES[L.piece].title)}</h3></a>`;
    frenchSpacing(box);
  }).catch(e => console.warn(e));
  $('#weekBox', page).append(weekCard());
  // théorie : une ligne discrète quand des fiches sont à revoir
  import('./tool-mastery.js').then(m => m.dueSummary()).then(r => {
    const c = $('#masteryCard', page);
    if (c && r) c.querySelector('p').textContent = r.n ? `${r.n} leçon${r.n > 1 ? 's' : ''} à apprendre par cœur${r.due ? `, dont ${r.due} à revoir` : ''}.` : 'Coche les leçons à apprendre par cœur : pour chacune, une fiche et de petits exercices.';
    const line = $('#theoryLine', page);
    if (line && r && r.due) { line.innerHTML = `Théorie : ${r.due} fiche${r.due > 1 ? 's' : ''} à revoir dans <a href="#/maitrise">En cours de maîtrise</a>.`; line.hidden = false; frenchSpacing(line); }
  }).catch(() => {});
  // nouveautés de la version, montrées une fois
  const NEWS = {
    '7.4.3': '<ul><li><b>Nouvel onglet Technique</b> (menu Outils) : la leçon où tu en es, les gammes et arpèges de la semaine (deux tonalités qui changent chaque lundi), toutes les leçons rangées par thème (méthode et posture, le son, la pédale, gammes et arpèges, agilité, plusieurs voix), les exercices des deux mains et l’analyse de ton jeu.</li><li><b>Séance, case Technique</b> : d’abord ce que demande la section du jour de ta pièce ; sinon la prochaine leçon de technique pas encore cochée (« Déjà faite » pour la passer) ; une fois toutes cochées, un jour les gammes de la semaine, un jour un exercice des deux mains.</li></ul>',
    '7.4.2': '<ul><li><b>Oreille, rejouer une mélodie</b> : à l’étape « Le dessin d’une mélodie », tout se passe en do majeur. Ensuite, la tonalité reste la même quatre questions de suite, d’abord parmi do, sol et fa, et chaque changement est annoncé.</li><li><b>La gamme numérotée</b> sur le clavier à l’écran dans les premières étapes (1 = la tonique, en or) : tu entends « 3 », tu vois où est 3.</li><li><b>Chercher librement</b> : tes essais ne comptent plus ; la réponse est reconnue dès que tes dernières notes sont justes. « Valider ma réponse » dit ce qui ne va pas, par exemple « 2e note : il fallait la note voisine au-dessus ; tu as joué un grand saut ».</li></ul>',
    '7.4.1': '<ul><li><b>Cocher ce que tu as déjà fait</b> : dans la séance, un bouton « Déjà faite » sous la leçon d’improvisation, l’étape d’oreille ou l’exercice de technique proposés. La case propose aussitôt la suite (avec « Annuler »).</li><li>Dans les listes de leçons, une case à droite de chaque leçon pour la cocher sans l’ouvrir. Une leçon cochée n’est plus proposée dans la séance ; les nouveaux exercices à deux mains des leçons cochées restent listés dans l’outil Improvisation.</li><li>Parcours d’oreille : « Je la maîtrise déjà » sur chaque étape ; exercices de technique : « Déjà acquis ».</li></ul>',
    '7.4': '<ul><li><b>À deux mains</b> : dans les leçons d’improvisation du niveau 1, un exercice où l’accompagnateur s’efface en trois étapes. L’appli joue tout, puis seulement la basse (ta main gauche joue l’accord), puis seulement le clic (tu joues tout). Chaque main est vérifiée.</li><li>Deux leçons nouvelles. <b>Ta main gauche</b> : des accords serrés enchaînés au plus près, quatre formules (basse et accord, valse, arpège, Alberti), trois tonalités. <b>Une mélodie connue</b> : « Ah ! vous dirai-je, maman » apprise d’oreille, ses accords trouvés sans les voir, puis trois variations comme Mozart.</li><li><b>Les notes en or de mémoire</b> : affichées au premier exercice d’une grille, puis cachées. « Écouter le squelette » te le fait chanter ; l’or revient après un échec.</li><li>Aussi : un prélude en fa mineur avant ton nocturne, et une autre forme de huit mesures (présenter, répéter, conclure).</li></ul>',
    '7.3': '<ul><li><b>Jouer d’oreille</b> (onglet Oreille) : quinze mélodies apprises sans partition, des comptines au Menuet en sol et aux thèmes de tes nocturnes. L’appli joue une phrase avec son accompagnement ; tu la chantes, tu la rejoues avec elle, puis seul sur l’accompagnement. Les phrases s’allongent : une mesure, deux, la phrase, la mélodie entière.</li><li>Entre deux phrases, une <b>question d’analyse</b> : sur quel degré finit-elle, où tombe le sommet, qu’est-ce qui revient, quel accord ?</li><li><b>La preuve</b> que tu la sais : sans aide, dans une autre tonalité, puis chantée. La séance te rappelle une mélodie par semaine.</li></ul>',
    '7.2': '<ul><li><b>Oreille, un seul parcours</b> « entendre, chanter, jouer » : seize étapes, chacune sous trois formes (la reconnaître, la chanter, la retrouver au piano). Une étape est réussie avec deux formes sur trois. Tes progrès sont repris.</li><li><b>La tonalité change dès le début</b>, et tu réponds par des chiffres, sans noms de notes : réussir en do et échouer ailleurs vient de là (l’oreille apprend des hauteurs fixes au lieu de la relation à la tonique). Les étapes réussies en do seulement sont à confirmer dans toutes les tonalités.</li><li><b>Ce qui te trompe</b> : l’appli relève tes confusions (par exemple 4 et 6) et propose une série ciblée sur la paire. Sous 60 % trois fois de suite, elle te la propose d’elle-même.</li><li>Après chaque degré, <b>chante la résolution</b> ; une question sur cinq révise une étape passée ; au chant, modèle « son tenu » et <b>bourdon de tonique</b> au choix ; nouvelle étape <b>« Entendre dans sa tête »</b> (lire une mélodie et l’entendre avant qu’elle sonne).</li></ul>',
    '7.1': '<ul><li><b>Échauffement de lecture</b> (Lecture à vue) : trois minutes avant les extraits. D’abord une minute de rythme à taper au clic, au niveau choisi dans l’onglet Rythme. Puis deux exercices d’une minute, qui tournent d’un jour à l’autre entre les notes, les <b>intervalles</b> et les <b>accords</b> : tu lis la forme et tu la joues d’un geste, sans la nommer. Ce qui te ralentit revient plus souvent.</li><li><b>Entends le début</b> : pendant les 30 secondes de préparation, chante la première mesure, puis vérifie en l’écoutant.</li><li>La lecture de notes chronométrée quitte la page Exercices : elle fait partie de l’échauffement.</li></ul>',
    '7.0': '<ul><li><b>Nouvelle séance</b> : coche ce que tu veux travailler (pièce, technique, improvisation, lecture, oreille, autres pièces) et choisis une durée. L’appli propose l’étape suivante de chaque case et coche d’avance ce que tu laisses de côté depuis trop longtemps. Le plan en 8 semaines disparaît.</li><li><b>La carte de ta pièce</b> : section par section, ce qui s’y passe, ce que ça change à ton jeu, les leçons et les exercices qu’elle demande (rubato, triolets, octaves…) et comment la travailler. Indique où tu en es dans chaque section : la section du jour et un objectif de date en dépendent.</li><li><b>Le plan de la pièce</b>, simplifié : à quoi il sert, et trois exercices (repartir d’un point de départ, situer un extrait, entendre ce qui change au retour). Et un <b>filage enregistré</b> environ une fois par semaine.</li><li><b>Tes 7 derniers jours</b> : les jours de pratique de chaque case, face à l’objectif.</li></ul>',
    '6.2': '<ul><li><b>Improvisation, notes en or</b> : toutes les notes en or sont écrites dans la grille, sous chaque accord, avant même le départ. Pendant une mesure, la suivante est annoncée (« puis … ») et marquée en or pâle sur le clavier, avec son nom : tu as le temps de la préparer.</li><li>Leçon « Entre les notes de l’accord » : le squelette complet des exercices en partition, et un tableau qui explique pourquoi chaque note en or a été choisie.</li></ul>',
    '6.1':'<ul><li><b>En cours de maîtrise, refait</b> : coche les leçons de théorie que tu veux savoir par cœur (dans l’onglet, ou en tête de chaque leçon). Pour chacune, une <b>fiche</b> qui résume l’essentiel et de <b>petits exercices</b> corrigés ; les questions manquées reviennent en premier à la série suivante. « Tout réviser » mêle tes leçons.</li><li>Les boîtes et les dates de révision sont retirées. Les leçons qui étaient dans tes cartes restent cochées : décoche celles que tu ne veux pas.</li></ul>',
    '6.0': '<ul><li><b>Théorie du niveau 1, refaite</b> : chaque leçon avance par étapes, une à la fois. Chaque étape donne l’idée en une phrase, un exemple résolu, le piège à éviter, puis un exercice tout de suite : questions corrigées, construction au clavier, notes à toucher sur la partition de ton nocturne.</li><li><b>À apprendre par cœur</b> : chaque notion importante a sa case. Coche-la pour la mettre dans tes cartes (En cours de maîtrise). Seules les notions cochées y entrent. Celles des leçons que tu avais déjà terminées sont cochées pour toi, avec leur progression.</li><li>Le niveau 2 passera au même format dans une prochaine version.</li></ul>',
    '4.3': '<ul><li><b>Oreille</b> refaite en deux parcours, une étape après l’autre : <b>Chanter juste</b> (13 étapes, de la voix stable aux intervalles et aux motifs de ta pièce) et <b>Reconnaître à l’oreille</b> (16 étapes). L’étape en cours est ouverte ; toutes les séries restent dans « Entraînement libre ».</li><li><b>Chanter juste</b> : nouveaux exercices « Tenir une note » et « Glisser jusqu’à la note », une aiguille qui montre l’écart à la note, ta tendance (trop bas, trop haut…) et la méthode en cinq points.</li><li><b>Lecture de notes chronométrée</b> : jusqu’à 4 lignes supplémentaires ; les altérations se cochent à part.</li></ul>',
    '5.1': '<ul><li><b>Improvisation, plus simple</b> : chaque leçon se travaille en <b>exercices</b> (« Exercice 2 sur 5 »), du plus simple au plus difficile. Un exercice est <b>validé</b> quand tu le réussis deux jours différents. L’« échelle d’ornementation », qui recomptait les mêmes exercices, est retirée.</li></ul>',
    '5.0': '<ul><li><b>Improvisation en paliers</b> : chaque leçon se travaille en 4 à 7 paliers, une seule nouveauté à chacun (imiter, squelette, rythme, ornement, question – réponse, silences, transposition). L’appli vérifie ta prise au piano à l’arrêt ; un palier est réussi deux jours différents.</li><li><b>Nouveaux exercices</b> : l’imitation (écouter, chanter, rejouer), la question – réponse qui suit le dessin ou le registre, les phrases et silences, le rythme pointé, la marche, le contraste ABA. Un décompte avant chaque départ.</li><li><b>Explications</b> : « pourquoi ça marche », avec des écoutes comparées, et les erreurs fréquentes de chaque leçon. Nouveaux schémas : Do-Ré-Mi et Quiescenza ; la leçon Monte et Fonte réécrite.</li><li><b>Séance du jour</b> : 10 min d’improvisation chaque jour, au palier en cours. L’<b>échelle d’ornementation</b> est dans l’outil Improvisation.</li></ul>',
    '4.2': '<ul><li><b>Exercices</b> (menu Outils) : indépendance des mains en 17 exercices (deux rythmes à la fois, polyrythmes, lié contre détaché, une main qui chante, notes tenues). Après « En rythme », un retour main par main, et le tempo monte à chaque réussite.</li><li><b>Lecture de notes chronométrée</b> : une minute, au piano ou par le nom ; notes par minute, notes lentes, record et courbe sur 30 jours. Dans Exercices et sous la Lecture à vue.</li></ul>',
    '4.1': '<ul><li><b>Ta séance d’aujourd’hui</b> : environ 1 h 15 tirée de la semaine, étape par étape. Sur chaque page, la barre du bas mène à l’étape suivante.</li><li><b>Pièce</b> : un passage ouvert à la fois ; l’analyse harmonique sous les extraits s’ouvre d’un toucher.</li><li><b>Partitions</b> : Boucle, Montée de tempo et Clavier sont rangés dans « Options ».</li><li><b>Oreille et Théorie</b> : la prochaine série est proposée en haut ; les séries sont rangées par groupe.</li><li><b>Plan</b> : seule la semaine en cours est dépliée. <b>Niveau</b> : les six modules en cartes.</li></ul>',
  };
  // nouveautés de toutes les versions publiées depuis la dernière lue (trois au plus), la plus récente d'abord
  const vnum = v => String(v || '0').split('.').map(Number).reduce((a, x, i) => a + x / 100 ** i, 0); // 7.4.1 < 7.5
  const seen = store.get('seenVersion');
  const unseen = Object.keys(NEWS).filter(v => vnum(v) <= vnum(version.app) && (seen ? vnum(v) > vnum(seen) : v === version.app)).sort((a, b) => vnum(b) - vnum(a)).slice(0, 3);
  if (unseen.length) {
    const ok = h('button', { class: 'btn sm', type: 'button' }, 'Compris');
    const box = h('div', { class: 'callout tip mt-2 news' }, h('div', { class: 'c-title', html: `${ICONS.bulb}${unseen.length > 1 ? `Nouveautés des versions ${unseen.join(', ').replace(/, ([^,]*)$/, ' et $1')}` : `Nouveau dans la version ${unseen[0]}`}` }),
      ...unseen.map(v => h('div', { html: (unseen.length > 1 ? `<p class="small mb-0"><b>Version ${v}</b></p>` : '') + NEWS[v] })), ok);
    ok.addEventListener('click', () => { store.set('seenVersion', version.app); box.remove(); });
    $('.page-head', page).after(box);
  }
  if (midi.status !== 'ready') {
    $('#midiHelp', page).innerHTML = `<div class="callout tip mt-3"><div class="c-title">${ICONS.bulb}Brancher le piano</div>
      <ol><li>Relie le piano à la tablette. <b>Kawai ES110</b> : en Bluetooth MIDI (connecte d’abord le piano avec l’appli gratuite « MIDI BLE Connect »), ou avec une interface USB-MIDI branchée sur la prise ronde <b>MIDI OUT</b>. Piano avec prise <b>USB TO HOST</b> : câble USB-C ↔ USB-B.</li>
      <li>Ouvre l’appli dans <b>Chrome</b>, puis touche <b>Connecter le piano</b> en haut à droite et accepte l’accès MIDI.</li>
      <li>Vérifie dans <a href="#/outils/clavier">Test du clavier</a> : les touches jouées s’allument.</li></ol></div>`;
  }
  return () => offs.forEach(f => { try { f(); } catch (e) { /* */ } });
}
function toolCard(href, title, txt) {
  return `<a class="card" href="${href}"><h3>${esc(title)}</h3><p>${esc(txt)}</p></a>`;
}


function pageParcours() {
  const page = h('div', { class: 'page' });
  let html = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Le parcours' }]);
  html += `<div class="page-head"><h1>Le parcours</h1><p class="lead">Six niveaux, de ton niveau actuel jusqu’à la Ballade n° 3. Chaque niveau s’organise autour d’une pièce phare : technique, interprétation, théorie, oreille, lecture et improvisation y mènent.</p></div>`;
  html += `<div class="grid cols-2">`;
  for (const L of LEVELS) {
    const p = L.locked ? null : levelProgress(L);
    const pieces = L.pieceIds.map(id => PIECES[id]?.title || id);
    html += `<${L.locked ? 'div' : 'a'} class="card${L.locked ? '' : ''}" ${L.locked ? '' : `href="#/niveau/${L.id}"`} style="${L.locked ? 'opacity:.72' : ''}">
      <div class="card-top"><span class="eyebrow">Niveau ${L.num}</span>${L.locked ? '<span class="tag">à venir</span>' : isLevelValidated(L) ? '<span class="tag ok">validé</span>' : `<span class="tag accent">${p.done}/${p.total} leçons</span>`}</div>
      <h3>${esc(L.title)}</h3>
      <p><b>Pièce phare :</b> ${esc(L.pieceTitle || pieces[0])}</p>
      ${L.complementsText ? `<p class="small">${esc(L.complementsText)}</p>` : ''}
    </${L.locked ? 'div' : 'a'}>`;
  }
  html += `</div><p class="small mt-3">Au-delà du niveau 6 : Ballade n° 1, Étude op. 25 n° 11, Sonate n° 2, Scriabine op. 8 n° 12 et op. 42 n° 5, Concerto n° 2 de Rachmaninov.</p>`;
  page.innerHTML = html;
  main.append(page);
}

function pageLevel(id) {
  const L = levelById(id);
  if (!L || L.locked) { location.hash = '#/parcours'; return; }
  const p = levelProgress(L);
  const page = h('div', { class: 'page' });
  let html = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Le parcours', href: '#/parcours' }, { label: `Niveau ${L.num}` }]);
  html += `<div class="page-head"><h1>Niveau ${L.num} — ${esc(L.title)}</h1><p class="lead">${esc(L.subtitle)}</p>
    <div class="tags"><span class="tag accent">${p.done}/${p.total} leçons</span>${isLevelValidated(L) ? '<span class="tag ok">niveau validé</span>' : ''}</div></div>`;
  html += `<div class="grid cols-2">
    <a class="card piece" href="#/piece/${L.piece}"><div class="card-top"><span class="eyebrow">Pièce phare</span></div><h3>${esc(PIECES[L.piece].title)}</h3><p>${esc(PIECES[L.piece].short || '')}</p></a>
    <div class="card"><div class="card-top"><span class="eyebrow">Pièces complémentaires</span></div>${L.complements.map(cid => `<p class="mb-0"><a href="#/piece/${cid}">${esc(PIECES[cid].title)}</a> <span class="small">${esc(PIECES[cid].status || '')}</span></p>`).join('')}</div>
  </div>`;
  html += `<div class="section-title"><h2>Objectifs du niveau</h2></div><div class="card"><ul class="goals">${L.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>`;
  html += `<div class="btn-row mt-2"><a class="btn primary" href="#/piece/${L.piece}">La carte de la pièce</a><a class="btn" href="#/validation/${L.id}">Grille de validation</a></div>`;
  // les six modules en un coup d'œil : avancement et prochaine leçon ; la liste complète est sur la page du module
  html += `<div class="section-title"><h2>Les six modules</h2></div><div class="grid cols-3 module-grid">`;
  for (const M of MODULES) {
    const lm = lessonsOf(L.id, M.id);
    const d = lm.filter(x => store.isDone(x.id)).length;
    const nx = lm.find(x => !store.isDone(x.id) && x.prio !== 2) || lm.find(x => !store.isDone(x.id));
    html += `<a class="card module-card" href="#/niveau/${L.id}/${M.id}"><div class="card-top"><h3>${esc(M.label)}</h3><span class="small">${d}/${lm.length}</span></div>
      <div class="progress"><i style="width:${lm.length ? d / lm.length * 100 : 0}%"></i></div>
      <p class="small mb-0">${nx ? `Prochaine : <b>${esc(nx.title)}</b>` : 'Module terminé.'}</p></a>`;
  }
  html += `</div>`;
  page.innerHTML = html;
  main.append(page);
}

function pageModule(id, mod) {
  const L = levelById(id);
  const M = MODULES.find(m => m.id === mod);
  if (!L || !M) { location.hash = '#/'; return; }
  const lm = lessonsOf(L.id, M.id);
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` }, { label: M.label }]) +
    `<div class="page-head"><h1>${esc(M.label)}</h1><p class="lead">${esc((L.moduleIntro && L.moduleIntro[M.id]) || M.intro)}</p></div>` + lessonListHTML(lm);
  main.append(page);
}

async function pageLesson(id) {
  const tok = navToken;
  const meta = lessonById(id);
  if (!meta) { location.hash = '#/'; return; }
  main.append(h('div', { class: 'page' }, h('p', { class: 'w-loading' }, 'Chargement de la leçon…')));
  const l = await loadLesson(id);
  if (!stillHere(tok)) return;
  main.innerHTML = '';
  if (!l) { location.hash = '#/'; return; }
  const L = levelById(l.level);
  const M = MODULES.find(m => m.id === l.module);
  const siblings = lessonsOf(l.level, l.module);
  const idx = siblings.findIndex(x => x.id === l.id);
  const prev = siblings[idx - 1], next = siblings[idx + 1];
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` }, { label: M.label, href: `#/niveau/${L.id}/${M.id}` }, { label: `Leçon ${idx + 1}` }]) +
    `<div class="page-head"><h1>${esc(l.title)}</h1>${l.summary ? `<p class="lead">${esc(l.summary)}</p>` : ''}
     <div class="lesson-meta"><span>${esc(M.label)} · niveau ${L.num}</span>${l.minutes ? `<span>≈ ${l.minutes} min</span>` : ''}${store.isDone(l.id) ? '<span class="tag ok">terminée</span>' : ''}</div></div>`;
  const body = h('div', { class: 'prose mt-2' });
  page.append(body);
  main.append(page);
  if (l.module === 'theorie') { try { await (await import('./tool-mastery.js')).migrateMastery(); } catch (e) { console.warn(e); } if (!stillHere(tok)) return; }
  const unmount = l.steps ? renderSteps(body, l) : renderRich(body, l.body);
  const top = essentialsCard(l, body._core || [], body._notions || []);
  if (top) { body.before(top); frenchSpacing(top); }
  const foot = h('div', { class: 'lesson-foot' });
  const doneBtn = h('button', { class: 'btn ' + (store.isDone(l.id) ? 'ok' : 'primary'), type: 'button' }, store.isDone(l.id) ? '✓ Leçon terminée' : 'Marquer comme terminée');
  doneBtn.addEventListener('click', () => {
    const v = !store.isDone(l.id);
    store.setDone(l.id, v);
    doneBtn.className = 'btn ' + (v ? 'ok' : 'primary');
    doneBtn.textContent = v ? '✓ Leçon terminée' : 'Marquer comme terminée';
    renderNav(location.hash);
    updateSessionBar(location.hash);
    if (v) toast('Leçon terminée : elle ne sera plus proposée dans la séance', 'ok');
  });
  foot.append(doneBtn, h('a', { class: 'small', href: `#/niveau/${L.id}/${M.id}` }, `Retour au module ${M.label}`));
  page.append(foot);
  const nav = h('div', { class: 'lesson-nav' });
  if (prev) nav.append(h('a', { href: `#/lecon/${prev.id}` }, h('small', {}, '← Précédente'), prev.title));
  if (next) nav.append(h('a', { class: 'next', href: `#/lecon/${next.id}` }, h('small', {}, 'Suivante →'), next.title));
  page.append(nav);
  return unmount;
}

async function pagePiece(id, sec = null) {
  const tok = navToken;
  if (!PIECES[id]) { location.hash = '#/'; return; }
  main.append(h('div', { class: 'page' }, h('p', { class: 'w-loading' }, 'Chargement…')));
  const P = await loadPiece(id);
  if (!stillHere(tok)) return;
  main.innerHTML = '';
  if (!P) { location.hash = '#/'; return; }
  const L = LEVELS.find(x => x.pieceIds.includes(id));
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, L ? { label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` } : { label: 'Pièces' }, { label: P.title }]) +
    `<div class="page-head"><h1>${esc(P.title)}</h1><p class="lead">${esc(P.composer)}${P.short ? ' · ' + esc(P.short) : ''}</p><div class="tags">${(P.tags || []).map(t => `<span class="tag ${t.cls || ''}">${esc(t.label)}</span>`).join('')}</div></div>`;
  if (['op55-1', 'op15-1', 'clair-de-lune'].includes(id)) {
    const cb = h('input', { type: 'checkbox', checked: !!store.get(`pieces.${id}.byHeart`) });
    cb.addEventListener('change', () => {
      store.set(`pieces.${id}.byHeart`, cb.checked);
      toast(cb.checked ? 'Le plan et l’accord suivant s’ajoutent aux exercices de la pièce (En cours de maîtrise)' : 'Pièce retirée du par cœur', 'ok', 3500);
    });
    page.append(h('label', { class: 'check heart-toggle' }, cb, 'Je l’apprends par cœur', h('span', { class: 'small muted' }, ' — le plan et les enchaînements d’accords s’ajoutent à ses exercices, dans ', h('a', { href: '#/maitrise' }, 'En cours de maîtrise'), '.')));
  }
  const body = h('div', { class: 'prose' });
  page.append(body);
  main.append(page);
  const unmount = renderPieceBody(body, P.body, id, sec && sec !== 'filage' ? sec : null);
  const top = essentialsCard({ essentials: P.essentials }, body._core || []);
  if (top) { body.before(top); frenchSpacing(top); }
  if (['op55-1', 'op15-1', 'clair-de-lune'].includes(id)) {
    import('./analysis-panel.js').then(m => m.weekTakesSection(id)).then(box => { if (stillHere(tok)) { page.append(box); frenchSpacing(box); } }).catch(e => console.warn(e));
  }
  // section demandée par la séance ou la carte : ouverte et amenée à l'écran
  if (sec) {
    requestAnimationFrame(() => {
      const target = sec === 'filage' ? $('.w-filage', page) : $(`#sec-${CSS.escape(sec)}`, page);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  return unmount;
}

function pageValidation(id) {
  const L = levelById(id);
  if (!L) { location.hash = '#/'; return; }
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` }, { label: 'Validation' }]) +
    `<div class="page-head"><h1>Valider le niveau ${L.num}</h1><p class="lead">Auto-évaluation guidée. Enregistre-toi (téléphone, ou « Réécouter la prise » dans l’analyseur), réécoute le lendemain, puis note chaque critère honnêtement. Le niveau est validé quand tout est au moins « acquis ».</p></div>`;
  const card = h('div', { class: 'card' });
  const summary = h('div', { class: 'verdict', style: { marginBottom: '8px' } });
  const vals = () => store.get('validation') || {};
  const upd = () => {
    const v = vals();
    const scores = L.validation.map(c => v[`${L.id}:${c.id}`] ?? 0);
    const ok = scores.filter(s => s >= 2).length;
    summary.innerHTML = ok === L.validation.length ? `<b>Niveau ${L.num} validé.</b> Bravo — le niveau suivant t’attend.` : `<b>${ok} / ${L.validation.length}</b> critères au moins « acquis ».`;
  };
  let group = null;
  for (const c of L.validation) {
    if (c.group !== group) { group = c.group; card.append(h('h3', { style: { margin: '18px 0 2px', fontSize: '15px' } }, group)); }
    const key = `${L.id}:${c.id}`;
    const lv = h('div', { class: 'levels4', role: 'group', 'aria-label': 'Niveau atteint' });
    ['Pas encore', 'En cours', 'Acquis', 'Solide'].forEach((lab, i) => {
      const b = h('button', { type: 'button', 'data-v': i, class: (vals()[key] ?? 0) === i ? 'on' : '' }, lab);
      b.addEventListener('click', () => {
        const v = { ...vals() }; v[key] = i; store.set('validation', v);
        lv.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        upd(); renderNav(location.hash);
      });
      lv.append(b);
    });
    card.append(h('div', { class: 'crit' }, h('div', { class: 'ct', html: c.text + (c.how ? `<small>${c.how}</small>` : '') }), lv));
  }
  page.append(summary, card);
  main.append(page);
  upd();
}

function pageTools() { location.hash = '#/outils/lecture'; }

function toolPage(title, lead, load) {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: title }]) + `<div class="page-head"><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></div>`;
  const host = h('div', { class: 'w' });
  page.append(host);
  main.append(page);
  return mountLazy(host, load);
}

/** Index des leçons d'un module, niveau par niveau (pour retrouver les cours en dehors du plan). */
function moduleIndexHTML(mod) {
  let html = '';
  for (const L of LEVELS) {
    if (L.locked) continue;
    const lm = lessonsOf(L.id, mod);
    if (!lm.length) continue;
    html += `<div class="course-level"><div class="section-title"><h2>Niveau ${L.num} — ${esc(L.short)}</h2><span class="small">${lm.filter(x => store.isDone(x.id)).length}/${lm.length}</span></div>${lessonListHTML(lm)}</div>`;
  }
  return html;
}

/**
 * État des séries d'exercices (statistiques « stats.ear », communes aux leçons et aux onglets Oreille et Théorie).
 * Réussie : 80 % ou plus deux jours différents, et la dernière fois aussi (l'objectif annoncé aux élèves).
 */
function presetStatus(presets) {
  const all = store.get('stats.ear') || [];
  const vr = store.get('settings.voiceRange');
  const day = t => new Date(t).toDateString();
  const out = new Map();
  for (const q of presets) {
    if (q.kind === 'voicefinder') { const done = Array.isArray(vr); out.set(q.id, { done, mastered: done, last: null, label: done ? 'Tessiture mesurée' : 'À faire en premier : tes notes de chant seront à ta mesure' }); continue; }
    const hist = all.filter(x => x.id === q.id);
    const last = hist[hist.length - 1] || null;
    const goodDays = new Set(hist.filter(x => x.pct >= 0.8).map(x => day(x.at))).size;
    const mastered = !!last && last.pct >= 0.8 && goodDays >= 2;
    const label = !last ? 'Pas encore fait' : mastered ? `Réussie · dernier score ${fmtPct(last.pct)}` : `Dernier score : ${fmtPct(last.pct)}${last.pct >= 0.8 ? ' · encore un jour à 80 %' : ' · objectif 80 %'}`;
    out.set(q.id, { done: !!last, mastered, last, label });
  }
  return out;
}
/** La série à faire maintenant : celle en cours, sinon la première jamais faite, sinon la révision la plus ancienne. */
function recommendPreset(presets, st) {
  const doing = presets.filter(q => st.get(q.id).done && !st.get(q.id).mastered && st.get(q.id).last);
  if (doing.length) {
    const q = doing.sort((a, b) => st.get(b.id).last.at - st.get(a.id).last.at)[0];
    return { q, why: `En cours : ${st.get(q.id).label.toLowerCase()}. Refais-la jusqu’à 80 %, deux jours différents.` };
  }
  const fresh = presets.find(q => !st.get(q.id).done);
  if (fresh) return { q: fresh, why: fresh.kind === 'voicefinder' ? 'À faire une fois : les exercices de chant se règlent ensuite sur ta voix.' : 'Nouvelle série, dans l’ordre du cours.' };
  const old = presets.filter(q => st.get(q.id).last).sort((a, b) => st.get(a.id).last.at - st.get(b.id).last.at)[0];
  return old ? { q: old, why: `Révision : la série que tu n’as pas faite depuis le plus longtemps (${new Date(st.get(old.id).last.at).toLocaleDateString('fr-FR')}).` } : null;
}

const PRESET_PAGES = {
  oreille: {
    title: 'Oreille', presets: m => m.EAR_PRESETS, lessonsTitle: 'Le cours d’oreille, leçon par leçon',
    lead: 'Dix minutes chaque jour valent mieux qu’une longue séance par semaine. Les leçons du parcours expliquent chaque étape ; ici, tu retrouves toutes les séries pour t’entraîner librement. Objectif : 80 % du premier coup, deux jours de suite, avant de passer à la série suivante.',
  },
  theorie: {
    title: 'Théorie', presets: m => m.THEORY_PRESETS, lessonsTitle: 'Les cours de théorie, chapitre par chapitre',
    lead: 'Tous les chapitres de théorie des niveaux, dans l’ordre, et des exercices pour réviser : lecture des notes, gammes, intervalles, accords. Le rythme a son propre onglet.',
  },
};

async function pagePresets(kind) {
  const tok = navToken;
  const cfg = PRESET_PAGES[kind];
  const [ear] = await Promise.all([import('./tool-ear.js'), ensureAbcjs()]);
  if (!stillHere(tok)) return;
  const mountQuiz = ear.mountQuiz;
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: cfg.title }]) +
    `<div class="page-head"><h1>${esc(cfg.title)}</h1><p class="lead">${esc(cfg.lead)}</p></div>`;
  const presets = cfg.presets(ear);
  const groups = [...new Set(presets.map(q => q.group))];
  const host = h('div', { class: 'w' });
  const list = h('div');
  let cleanupQuiz = null;
  const open = async q => {
    cleanupQuiz?.();
    host.innerHTML = '';
    if (q.kind === 'voicefinder') { const vm = await import('./voice.js'); cleanupQuiz = vm.mountVoiceFinder(host, {}); }
    else cleanupQuiz = mountQuiz(host, { ...q, stat: q.id });
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const st = presetStatus(presets);
  const reco = recommendPreset(presets, st);
  if (reco) {
    const go = h('button', { class: 'btn primary', type: 'button' }, 'Commencer');
    go.addEventListener('click', () => open(reco.q));
    list.append(h('div', { class: 'card reco' }, h('div', { class: 'eyebrow' }, 'Ta prochaine série'), h('h3', {}, reco.q.title), h('p', { class: 'small' }, reco.why), go));
  }
  list.append(h('div', { class: 'section-title' }, h('h2', {}, 'Toutes les séries')));
  for (const g of groups) {
    const qs = presets.filter(x => x.group === g);
    const ok = qs.filter(q => st.get(q.id).mastered).length;
    const det = h('details', { class: 'preset-group' }, h('summary', {}, h('span', {}, g), h('span', { class: 'small' }, `réussies : ${ok}/${qs.length}`)));
    if (groups.length === 1 || (reco && reco.q.group === g)) det.open = true;
    const grid = h('div', { class: 'grid cols-3' });
    for (const q of qs) {
      const s0 = st.get(q.id);
      const c = h('button', { class: 'card preset' + (s0.mastered ? ' ok' : ''), type: 'button' }, h('h3', {}, q.title), h('p', {}, s0.label));
      c.addEventListener('click', () => open(q));
      grid.append(c);
    }
    det.append(grid);
    list.append(det);
  }
  const index = h('div', { html: `<div class="section-title mt-3"><h2>${esc(cfg.lessonsTitle)}</h2></div>` + moduleIndexHTML(kind) });
  page.append(host, list, index);
  main.append(page);
  return () => cleanupQuiz?.();
}

function pageEar(view = null) {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Oreille' }]) +
    `<div class="page-head"><h1>Oreille</h1><p class="lead">Le parcours : une étape après l’autre, chacune se <b>reconnaît</b>, se <b>chante</b> et se <b>joue</b> au piano. Jouer d’oreille : des mélodies apprises sans partition, phrase par phrase. Huit à dix minutes, quatre ou cinq jours par semaine.</p></div>`;
  const host = h('div');
  page.append(host);
  page.insertAdjacentHTML('beforeend', `<p class="small muted mt-3">Les leçons d’oreille, dans l’ordre du parcours : <a href="#/niveau/n1/oreille">niveau 1</a> · <a href="#/niveau/n2/oreille">niveau 2</a>.</p>`);
  main.append(page);
  return mountLazy(host, () => Promise.all([import('./tool-earpath.js'), ensureAbcjs()]).then(([m]) => el => m.mountEarPath(el, { view: view === 'jouer' ? 'play' : view === 'parcours' ? 'path' : null })));
}

/* L'onglet Technique (V7.4.3) : les leçons rangées par thème, la leçon en cours, les gammes de la semaine, les outils. */
const TECH_GROUPS = [
  { title: 'Méthode et posture', ids: ['n1-t1', 'n1-t2'] },
  { title: 'Le son : legato, plans sonores, nuances', ids: ['n1-t3', 'n1-t4', 'n2-t4'] },
  { title: 'La pédale', ids: ['n1-t5'] },
  { title: 'Gammes et arpèges', ids: ['n1-t6', 'n2-t6'] },
  { title: 'Agilité : traits, rotation, octaves, poignet', ids: ['n2-t1', 'n2-t2', 'n2-t5', 'n2-t7'] },
  { title: 'Plusieurs voix dans une main', ids: ['n2-t3'] },
];
function pageTechnique() {
  const page = h('div', { class: 'page' });
  const L = currentLevel();
  const nl = nextTechLesson(L);
  const sc = scalesOfWeek(L);
  const all = allLessons().filter(l => l.module === 'technique');
  const grouped = new Set(TECH_GROUPS.flatMap(g => g.ids));
  const groups = [...TECH_GROUPS, { title: 'Autres', ids: all.map(l => l.id).filter(id => !grouped.has(id)) }].filter(g => g.ids.length);
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Technique' }]) +
    `<div class="page-head"><h1>Technique</h1><p class="lead">Le geste au service du son : la leçon où tu en es, les gammes de la semaine, toutes les leçons rangées par thème, et les outils pour mesurer ton jeu. Coche à droite les leçons déjà faites : la séance ne les proposera plus.</p></div>` +
    `<div class="grid cols-2"><div class="card"><div class="card-top"><span class="eyebrow">Où tu en es</span></div>${nl ? `<h3>${esc(nl.title)}</h3><p class="small">${esc(nl.summary || '')}</p><a class="btn primary sm" href="#/lecon/${nl.id}">Continuer</a>` : '<p class="small">Toutes les leçons de technique de ton niveau sont cochées : place aux gammes de la semaine et aux exercices des deux mains.</p>'}</div>` +
    `<div class="card"><div class="card-top"><span class="eyebrow">Gammes et arpèges de la semaine</span></div><h3>${esc(sc.pair[0])} et ${esc(sc.pair[1])}</h3><p class="small">${esc(sc.text.replace(/^[^:]*: /, ''))}. Trois à cinq minutes, lentement d’abord, chaque note écoutée ; puis mesure ta régularité.</p><div class="btn-row"><a class="btn sm" href="#/lecon/${L.id === 'n2' ? 'n2-t6' : 'n1-t6'}">Doigtés</a><a class="btn sm ghost" href="#/outils/analyseur">Mesurer la régularité</a></div></div></div>` +
    groups.map(g => `<div class="section-title mt-3"><h2>${esc(g.title)}</h2></div>${lessonListHTML(g.ids.map(id => all.find(l => l.id === id)).filter(Boolean), { levelTag: true })}`).join('') +
    `<div class="section-title mt-3"><h2>Les outils</h2></div><div class="grid cols-2">${toolCard('#/outils/exercices', 'Exercices des deux mains', 'Deux rythmes à la fois, polyrythmes, lié contre détaché, une main qui chante, notes tenues : l’appli mesure chaque main.')}${toolCard('#/outils/analyseur', 'Analyse technique', 'Gammes, arpèges et exercices joués sans partition : régularité, legato, pédale, équilibre des mains.')}</div>`;
  main.append(page);
}

function pageImproTool() {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Improvisation' }]) +
    `<div class="page-head"><h1>Improvisation</h1><p class="lead">Chaque leçon d’improvisation se travaille en exercices progressifs, vérifiés au piano. Ici : l’exercice où tu en es, et l’accompagnateur pour jouer librement.</p></div>`;
  // l'exercice en cours : la première leçon d'improvisation pas encore validée, dans l'ordre du module
  const L = currentLevel();
  const nx = improNext(L);
  const l = nx ? nx.l : null;
  const sm = l ? nx.sum || null : null;
  const cur = h('div', { class: 'card impro-top' }, h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Où tu en es'), h('span', { class: 'small' }, l ? `Niveau ${l.level.slice(1)}` : '')));
  if (l) {
    cur.append(h('h3', {}, l.title),
      h('p', { class: 'small' }, sm ? (sm.cur != null ? `Exercice ${sm.cur + 1} sur ${sm.total} : ${sm.curTitle}. ${sm.mastered} validé${sm.mastered > 1 ? 's' : ''} sur ${sm.total}.` : `Les ${sm.total} exercices sont validés.`) : 'Pas encore commencée : le premier exercice t’attend.'),
      h('a', { class: 'btn primary sm', href: `#/lecon/${l.id}` }, !sm ? 'Commencer' : sm.cur == null ? 'Revoir la leçon' : 'Continuer'));
  } else cur.append(h('p', { class: 'small' }, 'Toutes les leçons sont validées : joue librement ci-dessous, ou reprends une leçon pour la transposer.'));
  // leçons cochées « terminées » qui ont reçu de nouveaux exercices (V7.4 : à deux mains) : la séance ne les propose plus
  const extra = LEVELS.filter(lv => !lv.locked).flatMap(lv => lessonsOf(lv.id, 'impro')).filter(x => store.isDone(x.id) && improSummary(x)?.added);
  if (extra.length) {
    const p2 = h('p', { class: 'small muted mb-0' }, 'Nouveaux exercices dans des leçons que tu as cochées terminées : ');
    extra.forEach((x, i) => p2.append(i ? ', ' : '', h('a', { href: `#/lecon/${x.id}` }, x.title), ` (${improSummary(x).added})`));
    p2.append('.');
    cur.append(p2);
  }
  const host = h('div', { class: 'w' });
  page.append(cur, h('div', { class: 'section-title mt-3' }, h('h2', {}, 'Jouer librement')), h('p', { class: 'small' }, 'L’accompagnateur joue la main gauche (ou la basse seule) ; improvise à la main droite. Les notes jouées s’allument selon leur rôle dans l’harmonie. Modes : libre, question – réponse, imitation, squelette.'), host);
  page.insertAdjacentHTML('beforeend', `<div class="section-title mt-3"><h2>La méthode, leçon par leçon</h2></div>` + moduleIndexHTML('impro'));
  main.append(page);
  return mountLazy(host, () => import('./tool-improv.js').then(m => el => m.mountImprov(el, {})));
}

function pageExercises(exId = null) {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Exercices' }]) +
    `<div class="page-head"><h1>Exercices</h1><p class="lead">L’indépendance des mains : deux rythmes à la fois, polyrythmes, lié contre détaché, une main qui chante, notes tenues. Joue « En rythme » : l’appli mesure chaque main et monte le tempo à chaque réussite.</p></div>`;
  const host = h('div');
  page.append(host);
  main.append(page);
  return mountLazy(host, () => Promise.all([import('./tool-exercises.js'), ensureAbcjs()]).then(([m]) => el => m.mountExercisesPage(el, { open: exId })));
}

function pageCompose() {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Composition' }]) +
    `<div class="page-head"><h1>Composition</h1><p class="lead">Écris ta propre pièce de 8 mesures (élégie, romance ou nocturne) : l’accompagnement est fourni, tu inventes la mélodie, l’application la note en partition et vérifie la construction. Mêmes grilles que les leçons <a href="#/lecon/n1-im2">${esc(lessonById('n1-im2')?.title || 'Romance')}</a> et <a href="#/lecon/n2-im2">${esc(lessonById('n2-im2')?.title || 'Élégie')}</a>.</p></div>`;
  const host = h('div', { class: 'w' });
  page.append(host);
  main.append(page);
  return mountLazy(host, () => Promise.all([import('./tool-compose.js'), ensureAbcjs()]).then(([m]) => el => m.mountCompose(el)));
}

function pageKeyboardTest() {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Réglages', href: '#/reglages' }, { label: 'Test du clavier' }]) +
    `<div class="page-head"><h1>Test du clavier</h1><p class="lead">Vérifie la connexion : chaque touche jouée doit s’allumer, avec sa force (vélocité) ; la pédale aussi.</p></div>`;
  const frame = h('div', { class: 'w-frame' });
  const body = h('div', { class: 'w-body' });
  const kb = keyboard({ from: 21, to: 108, names: 'c', height: 120 });
  const info = h('div', { class: 'an-grid mt-2' });
  const last = h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Dernière note'), h('div', { class: 'v' }, '—'));
  const vel = h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Vélocité'), h('div', { class: 'v' }, '—'));
  const ped = h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Pédale'), h('div', { class: 'v' }, midi.pedalDown ? 'enfoncée' : 'relevée'));
  const dev = h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Appareil'), h('div', { class: 'v', style: { fontSize: '15px' } }, midi.status === 'ready' ? midi.deviceName : 'non connecté'));
  info.append(last, vel, ped, dev);
  body.append(kb, info);
  frame.append(body);
  page.append(frame);
  if (midi.status !== 'ready') {
    const b = h('button', { class: 'btn primary mt-2', type: 'button' }, 'Connecter le piano');
    b.addEventListener('click', () => midiPill.click());
    page.append(b);
  }
  main.append(page);
  const offs = [
    midi.on('noteon', e => { kb.press(e.note, true); last.lastChild.textContent = noteNameFr(e.note); vel.lastChild.textContent = String(e.velocity); }),
    midi.on('noteoff', e => kb.press(e.note, false)),
    midi.on('pedal', e => { ped.lastChild.textContent = e.down ? 'enfoncée' : 'relevée'; }),
    midi.on('status', (s, n) => { dev.lastChild.textContent = s === 'ready' ? n : 'non connecté'; }),
  ];
  return () => offs.forEach(f => f());
}

function pageSettings() {
  const s = store.get('settings');
  const offs = [];
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Réglages' }]) + `<div class="page-head"><h1>Réglages</h1></div>`;
  const card = (title, ...kids) => h('div', { class: 'card', style: { marginBottom: '14px' } }, h('h3', {}, title), ...kids);

  // MIDI
  const inSel = h('select', {}, h('option', { value: 'auto' }, 'Automatique (tous)'), ...midi.inputs.map(i => h('option', { value: i.id, selected: s.midiInput === i.id }, i.name)));
  inSel.addEventListener('change', () => { store.set('settings.midiInput', inSel.value); midi.rebind(); });
  const outSel = h('select', {}, h('option', { value: '' }, 'Premier disponible'), ...midi.outputs.map(o => h('option', { value: o.id, selected: s.midiOutput === o.id }, o.name)));
  outSel.addEventListener('change', () => { store.set('settings.midiOutput', outSel.value); midi.rebind(); });
  const demoSel = h('select', {}, h('option', { value: 'sampler', selected: s.demoOutput !== 'midi' }, 'La tablette (piano échantillonné)'), h('option', { value: 'midi', selected: s.demoOutput === 'midi' }, 'Le piano lui-même (via MIDI)'));
  demoSel.addEventListener('change', () => store.set('settings.demoOutput', demoSel.value));
  const split = h('input', { type: 'number', min: 36, max: 84, value: s.split });
  split.addEventListener('change', () => store.set('settings.split', +split.value));
  const conn = h('p', { class: 'small' });
  // Diagnostic de connexion : compteurs et journal (utile si des notes se perdent ou restent bloquées)
  const diagStats = h('div', { class: 'diag-stats' });
  const diagLog = h('ol', { class: 'diag-log' });
  const renderDiag = () => {
    conn.textContent = midi.status === 'ready' ? `Connecté : ${midi.deviceName}` : 'Non connecté — touche « Connecter le piano » en haut.';
    const c = midi.counters;
    const stat = (v, l) => h('div', { class: 'stat' }, h('div', { class: 'l' }, l), h('div', { class: 'v' }, String(v)));
    diagStats.replaceChildren(
      stat(c.notes, 'Notes reçues'),
      stat(c.repairedOffs, 'Relâchements réparés'),
      stat(c.stuckReleased, 'Notes débloquées'),
      stat(c.disconnects + c.sensingLost, 'Coupures'));
    const lines = midi.log.slice(-8).reverse();
    diagLog.replaceChildren(...(lines.length ? lines.map(l => h('li', {}, h('time', {}, new Date(l.t).toLocaleTimeString('fr-FR')), ' ', l.text))
      : [h('li', { class: 'muted' }, 'Rien à signaler depuis l’ouverture de l’appli.')]));
  };
  renderDiag();
  const tick = setInterval(renderDiag, 2000);
  offs.push(() => clearInterval(tick), midi.on('status', renderDiag));
  const unstick = h('button', { class: 'btn sm', type: 'button' }, 'Débloquer les notes');
  unstick.addEventListener('click', () => { midi.releaseAll(); renderDiag(); toast('Notes et pédale relâchées', 'ok'); });
  const diag = h('details', { class: 'mt-2' }, h('summary', {}, 'Diagnostic de la connexion'),
    h('p', { class: 'small' }, 'Si une note reste bloquée ou si des notes semblent se perdre en Bluetooth, regarde ici ce que l’appli a reçu et réparé. ',
      midi.sensing ? 'Le piano envoie un signal de présence : une coupure est détectée en une seconde.' : 'Signal de présence du piano : non reçu (normal sur certains pianos ; la coupure est alors détectée à la reconnexion).'),
    diagStats, diagLog,
    h('div', { class: 'btn-row' }, unstick, h('a', { class: 'btn sm', href: '#/outils/clavier' }, 'Test du clavier')));
  page.append(card('Piano (MIDI)', conn,
    h('div', { class: 'grid cols-2' },
      h('label', { class: 'field' }, 'Entrée MIDI', inSel),
      h('label', { class: 'field' }, 'Sortie MIDI', outSel),
      h('label', { class: 'field' }, 'Les démonstrations sont jouées par', demoSel),
      h('label', { class: 'field' }, 'Séparation main gauche / main droite (n° MIDI, 60 = do3)', split)),
    diag));

  // Audio
  const vol = h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: s.volume });
  vol.addEventListener('input', () => store.set('settings.volume', +vol.value));
  const mvol = h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: s.metroVolume });
  mvol.addEventListener('input', () => store.set('settings.metroVolume', +mvol.value));
  const echo = h('input', { type: 'checkbox' }); echo.checked = s.echoVirtual !== false;
  echo.addEventListener('change', () => store.set('settings.echoVirtual', echo.checked));
  const calibHost = h('div');
  const sync = h('details', { class: 'mt-2' }, h('summary', {}, 'Synchronisation avec les clics'),
    h('p', { class: 'small' }, 'Entre le clic entendu et la note reçue, il y a un petit décalage (Bluetooth, écran, haut-parleurs). Mesure-le une fois pour chaque façon de jouer : le rythme, le mode « en rythme » et l’analyse en tiennent compte.'),
    calibHost);
  let calibMounted = false;
  sync.addEventListener('toggle', () => {
    if (!sync.open || calibMounted) return;
    calibMounted = true;
    offs.push(mountLazy(calibHost, () => import('./tool-rhythm.js').then(m => el => {
      const a = m.mountCalibration(el);
      const b = m.mountClickTest(el);
      return () => { a?.(); b?.(); };
    })));
  });
  page.append(card('Son',
    h('label', { class: 'range' }, 'Volume du piano', vol),
    h('label', { class: 'range' }, 'Volume du métronome', mvol),
    h('label', { class: 'check mt-1' }, echo, 'Faire sonner le clavier à l’écran'),
    sync));

  // Données
  const exp = h('button', { class: 'btn', type: 'button' }, 'Exporter ma progression');
  const backupInfo = h('p', { class: 'small mt-1 mb-0' }, `Dernière sauvegarde : ${lastBackupLabel()}.`);
  exp.addEventListener('click', async () => {
    try { await exportProgress(); backupInfo.textContent = `Dernière sauvegarde : ${lastBackupLabel()}.`; toast('Fichier de sauvegarde téléchargé', 'ok'); }
    catch (e) { toast('Export impossible : ' + e.message, 'err', 5000); }
  });
  const imp = h('input', { type: 'file', accept: 'application/json', hidden: true });
  const impBtn = h('button', { class: 'btn', type: 'button' }, 'Importer');
  impBtn.addEventListener('click', () => imp.click());
  imp.addEventListener('change', async () => {
    try { await importProgress(await imp.files[0].text()); toast('Progression importée', 'ok'); router(); }
    catch (e) { toast('Fichier non reconnu', 'err'); }
  });
  const reset = h('button', { class: 'btn ghost', type: 'button' }, 'Tout effacer');
  reset.addEventListener('click', async () => { if (confirm('Effacer toute la progression, les réglages, les prises et les partitions importées ?')) { await resetAll(); router(); } });
  page.append(card('Progression', h('p', { class: 'small' }, 'Ta progression, tes prises, tes analyses et les partitions que tu as importées sont enregistrées sur cette tablette, dans le navigateur. Exporte-les de temps en temps : vider les données de Chrome les effacerait.'), h('div', { class: 'btn-row' }, exp, impBtn, imp, reset), backupInfo));

  // Version et mises à jour
  const verInfo = h('p', { class: 'small mt-0' }, `Version ${version.app} · ${version.build} · construite le ${new Date(version.built + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  const verStatus = h('span', { class: 'small' });
  const verBtn = h('button', { class: 'btn sm', type: 'button' }, hasUpdate() ? 'Installer la nouvelle version' : 'Rechercher une mise à jour');
  verBtn.addEventListener('click', async () => {
    if (hasUpdate()) { applyUpdate(); verStatus.textContent = 'Redémarrage…'; return; }
    verStatus.textContent = 'Recherche…';
    const r = await checkForUpdate();
    verStatus.textContent = { available: 'Nouvelle version prête.', uptodate: 'L’appli est à jour.', installing: 'Téléchargement de la nouvelle version…', offline: 'Pas de connexion : réessaie plus tard.', unsupported: 'Mises à jour automatiques indisponibles ici.' }[r] || '';
    if (r === 'available') verBtn.textContent = 'Installer la nouvelle version';
  });
  page.append(card('Version', verInfo, h('div', { class: 'row' }, verBtn, verStatus)));

  page.append(card('Sources et licences', h('div', {
    class: 'small', html: `<p>Piano : <b>Salamander Grand Piano</b> d’Alexander Holm (CC BY 3.0), via Tone.js. Partitions : <b>abcjs</b> (MIT). Polices : <b>Inter</b> et <b>Literata</b> (SIL OFL).</p>
    <p>Extraits de Chopin transcrits d’après les éditions LilyPond de <b>Knute Snortum</b> (op. 15 et op. 55, CC BY-SA 4.0) et vérifiés sur l’édition Breitkopf &amp; Härtel ; extraits de Debussy d’après l’édition du Mutopia Project (domaine public). Les extraits sont partagés sous la même licence CC BY-SA 4.0.</p>
    <p>Courbes de tempo des pianistes de référence : jeu de données <b>MAESTRO v3</b> (Hawthorne et al., Google Magenta, 2019), d’après les enregistrements de l’International Piano-e-Competition, CC BY-NC-SA 4.0. Usage non commercial.</p>
    <p>Liens « Informance » : <a href="${INFORMANCE}" target="_blank" rel="noopener">Practising the Piano Online Academy</a> (abonnement).</p>`,
  }), sightSources()));
  main.append(page);
  return () => offs.forEach(f => { try { f(); } catch (e) { /* */ } });
}

/** Sources des extraits de lecture à vue (attribution des éditions Mutopia), chargées à l'ouverture. */
function sightSources() {
  const list = h('div', { class: 'small src-list' });
  const det = h('details', { class: 'small' }, h('summary', {}, 'Lecture à vue : les sources des extraits'),
    h('p', {}, 'Les extraits de lecture à vue viennent des éditions LilyPond du Mutopia Project (mutopiaproject.org), dans le domaine public ou sous licence Creative Commons (CC BY, CC BY-SA). Ils ont été convertis et vérifiés note à note par l’appli ; certains sont allégés (accords réduits à la mélodie et à la basse) ou transposés d’une octave, ce qui est indiqué sous l’extrait. Les extraits tirés d’éditions CC BY-SA sont partagés sous la même licence.'), list);
  det.addEventListener('toggle', async () => {
    if (!det.open || list.childElementCount) return;
    const src = (await import('./data-sight-sources.js')).default;
    const ul = h('ul', {});
    for (const s of src.slice().sort((a, b) => (a.c + a.t).localeCompare(b.c + b.t, 'fr'))) {
      ul.append(h('li', {}, `${s.c} · ${s.t}${s.o && !s.t.includes(s.o) ? ' (' + s.o + ')' : ''}${s.pt ? ' · partie ' + s.pt : ''} — `,
        h('a', { href: `https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=${s.id}`, target: '_blank', rel: 'noopener' }, `Mutopia n° ${s.id}`),
        `${s.mt ? ', gravure : ' + s.mt : ''}${s.l ? ', ' + s.l : ''}.`));
    }
    list.append(ul);
  });
  return det;
}

/* ================================================================== */
/* Démarrage                                                           */
/* ================================================================== */
window.addEventListener('hashchange', router);
// Appli mise en arrière-plan (écran éteint, autre appli) : on arrête proprement la lecture en cours.
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stopCurrent(); });
function boot() {
  try { backfillActivity(); } catch (e) { console.warn(e); }
  renderMidi(midi.status, midi.deviceName);
  midi.autoInit();
  if (!location.hash && store.get('lastRoute') && store.get('lastRoute') !== '#/') location.hash = store.get('lastRoute');
  else router();
}
store.subscribe((path) => { if (path === 'done' || path === '*') renderNav(location.hash || '#/'); });
// Listes de leçons : cocher (ou décocher) une leçon déjà faite, sans l'ouvrir (V7.4)
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.ll-done');
  if (!b) return;
  e.preventDefault();
  const id = b.dataset.done;
  const v = !store.isDone(id);
  store.setDone(id, v);
  const li = b.closest('li');
  li.classList.toggle('done', v);
  b.setAttribute('aria-pressed', String(v));
  b.title = v ? 'Décocher' : 'Cocher : déjà faite (elle ne sera plus proposée dans la séance)';
  const num = li.querySelector('.num');
  if (num) num.textContent = v ? '✓' : num.dataset.n;
  toast(v ? 'Cochée : cette leçon ne sera plus proposée dans la séance.' : 'Décochée : elle peut de nouveau être proposée.', 'ok', 2600);
});
boot();

initUpdates();
requestPersistence();
