// Point d'entrée : navigation, pages, barre du haut.
import { h, esc, $, $$, fmtPct, noteNameFr, INFORMANCE } from './util.js';
import { store } from './store.js';
import { midi } from './midi.js';
import { audio } from './audio.js';
import { sharedMetronome } from './metronome.js';
import { makeW, mountWidgets, ICONS } from './widgets.js';
import { keyboard } from './diagrams.js';
import { toast } from './toast.js';
import { ensureAbcjs, mountLazy } from './lazy.js';
import { initUpdates, checkForUpdate, applyUpdate, hasUpdate, version } from './updates.js';
import { exportProgress, importProgress, resetAll, needsBackupReminder, postponeReminder, lastBackupLabel, requestPersistence } from './backup.js';
import { LEVELS, MODULES, PIECES, lessonById, levelById, allLessons, lessonsOf, loadLesson, loadPiece } from './content-index.js';

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
  [/^#\/piece\/([\w-]+)$/, pagePiece],
  [/^#\/plan\/(n\d)$/, pagePlan],
  [/^#\/validation\/(n\d)$/, pageValidation],
  [/^#\/outils$/, pageTools],
  [/^#\/outils\/metronome$/, () => toolPage('Métronome', 'Mesures muettes, accélération progressive, tempo tapé.', () => import('./tool-metronome-ui.js').then(m => el => m.mountMetronome(el, { title: false })))],
  [/^#\/outils\/lecture$/, () => toolPage('Lecture à vue', 'De vrais extraits du répertoire (Bach, Diabelli, Burgmüller, Schumann…), du plus simple au plus avancé. Prépare-toi 30 secondes, puis joue sans t’arrêter : la difficulté s’ajuste à tes résultats.', () => Promise.all([import('./tool-sight.js'), ensureAbcjs()]).then(([m]) => el => m.mountSight(el, { level: store.get('sight.level') || (currentLevel().id === 'n2' ? '2' : '1rh') })))],
  [/^#\/maitrise$/, () => toolPage('En cours de maîtrise', 'Cinq minutes par jour : les notions des leçons de théorie terminées et l’analyse de tes pièces, revues juste avant de les oublier.', () => import('./tool-mastery.js').then(m => el => m.mountMastery(el)))],
  [/^#\/outils\/rythme$/, () => toolPage('Rythme', 'Lire le rythme : compter, subdiviser, placer chaque attaque. Dix niveaux, des noires aux polyrythmies, et les rythmes de tes pièces.', () => Promise.all([import('./tool-rhythm.js'), ensureAbcjs()]).then(([m]) => el => m.mountRhythmPage(el)))],
  [/^#\/outils\/oreille$/, () => pagePresets('oreille')],
  [/^#\/outils\/theorie$/, () => pagePresets('theorie')],
  [/^#\/outils\/analyseur$/, () => toolPage('Analyse technique', 'Pour les gammes, arpèges et exercices joués sans partition : régularité, legato, pédale, équilibre des mains. Pour un passage de tes pièces, utilise plutôt « Analyser » sous l’extrait : l’analyse compare alors ton jeu à la partition.', () => import('./tool-analyzer.js').then(m => el => m.mountAnalyzer(el, { modes: ['evenness', 'legato', 'pedal', 'balance', 'voicing', 'dynamics'] })))],
  [/^#\/outils\/impro$/, pageImproTool],
  [/^#\/outils\/composition$/, pageCompose],
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
    html += `<div class="nav-level">${link(`#/niveau/${L.id}`, `Niveau ${L.num} — ${L.short}`, 'level', { meta: `${done}/${ls.length}` })}`;
    html += `<div class="nav-progress"><i style="width:${ls.length ? done / ls.length * 100 : 0}%"></i></div>`;
    if (open) {
      html += `<div class="nav-sub">`;
      html += link(`#/piece/${L.piece}`, 'Pièce phare', 'piece');
      html += link(`#/plan/${L.id}`, 'Plan hebdomadaire', 'plan');
      for (const M of MODULES) {
        const lm = lessonsOf(L.id, M.id);
        const d = lm.filter(x => store.isDone(x.id)).length;
        html += link(`#/niveau/${L.id}/${M.id}`, M.label, M.id, { meta: `${d}/${lm.length}`, prefix: `#/niveau/${L.id}/${M.id}` });
      }
      html += link(`#/validation/${L.id}`, 'Valider le niveau', 'check');
      html += `</div>`;
    }
    html += `</div>`;
  }
  html += `</div><div class="nav-section"><div class="nav-title">Outils</div>`;
  html += link('#/outils/rythme', 'Rythme', 'rythme');
  html += link('#/outils/lecture', 'Lecture à vue', 'lecture');
  html += link('#/outils/oreille', 'Oreille', 'ear');
  html += link('#/outils/theorie', 'Théorie', 'theorie');
  html += link('#/outils/impro', 'Improvisation', 'impro');
  html += link('#/outils/composition', 'Composition', 'compose');
  html += link('#/outils/analyseur', 'Analyse technique', 'chart');
  html += link('#/outils/metronome', 'Métronome', 'metro');
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
/** Encadré de tête d'une leçon : l'essentiel (à retenir), l'objectif mesurable et les objectifs. */
function essentialsCard(l, core) {
  const ess = l.essentials && l.essentials.length ? `<ul>${l.essentials.map(x => `<li>${x}</li>`).join('')}</ul>` : core.join('');
  const goals = l.goals && l.goals.length ? `<ul class="goals">${l.goals.map(g => `<li>${g}</li>`).join('')}</ul>` : '';
  if (!ess && !goals && !l.goal) return null;
  const card = h('div', { class: 'card essentials' + (ess && goals ? ' two' : '') });
  card.innerHTML = (ess ? `<div class="ess-col"><div class="ess-title">${ICONS.star}L’essentiel</div>${ess}</div>` : '') +
    (goals || l.goal ? `<div class="ess-col"><div class="ess-title muted-title">À la fin de cette leçon</div>${goals}${l.goal ? `<p class="ess-goal"><b>Réussi quand :</b> ${l.goal}</p>` : ''}</div>` : '');
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
function lessonListHTML(lessons) {
  return `<ul class="lesson-list">${lessons.map((l, i) => `<li class="${store.isDone(l.id) ? 'done' : ''}${l.prio === 2 ? ' opt' : ''}"><a href="#/lecon/${l.id}"><span class="num">${store.isDone(l.id) ? '✓' : i + 1}</span><span class="t"><b>${esc(l.title)}</b>${l.prio === 2 ? '<em class="tag opt-tag">complément</em>' : ''}<span>${esc(l.summary || '')}</span></span><span class="dur">${l.minutes ? l.minutes + ' min' : ''}</span></a></li>`).join('')}</ul>`;
}
/** Priorité d'une tâche du plan : 2 = « si tu as le temps » (indiquée dans le plan, ou leçon de complément). */
function taskPrio(t) {
  if (t.prio) return t.prio;
  const l = t.lesson ? lessonById(t.lesson) : null;
  return l && l.prio === 2 ? 2 : 1;
}
function nextUndone(L) {
  // ordre du plan hebdomadaire
  for (const wk of L.plan) for (const t of wk.tasks) {
    if (t.lesson && !store.isDone(t.lesson)) return lessonById(t.lesson);
  }
  return allLessons().find(x => x.level === L.id && !store.isDone(x.id));
}

/* ================================================================== */
/* Pages                                                               */
/* ================================================================== */
function pageHome() {
  const L = currentLevel();
  const p = levelProgress(L);
  const next = nextUndone(L);
  const piece = PIECES[L.piece];
  const week = store.get(`plan.week_${L.id}`) || 1;
  const wk = L.plan[week - 1];
  const page = h('div', { class: 'page' });
  page.innerHTML = `
    <div class="page-head"><h1>Bonjour Louis</h1><p class="lead">Ton parcours de piano classique : chaque semaine, la pièce phare et les six modules avancent ensemble.</p></div>
    <div class="hero">
      <div class="card">
        <div class="card-top"><span class="eyebrow">Niveau ${L.num} — en cours</span><span class="tag accent">${p.done}/${p.total} leçons</span></div>
        <h2>${esc(L.title)}</h2>
        <p class="small">${esc(L.subtitle)}</p>
        <div class="progress mt-1"><i style="width:${p.total ? p.done / p.total * 100 : 0}%"></i></div>
        ${next ? `<p class="small mt-2 mb-0">Prochaine leçon : <b>${esc(next.title)}</b></p>` : ''}
        <div class="btn-row mt-2">
          ${next ? `<a class="btn primary" href="#/lecon/${next.id}">Continuer</a>` : `<a class="btn primary" href="#/validation/${L.id}">Valider le niveau</a>`}
          <a class="btn" href="#/niveau/${L.id}">Voir le niveau</a>
        </div>
      </div>
      <a class="card piece" href="#/piece/${piece.id}">
        <div class="card-top"><span class="eyebrow">Pièce phare</span></div>
        <h2 style="font-size:21px">${esc(piece.title)}</h2>
        <p class="small">${esc(piece.composer)} · ${esc(piece.short || '')}</p>
        <p class="small mt-1">Plan de travail, extraits jouables, analyse et écoutes.</p>
      </a>
    </div>
    <div class="section-title"><h2>Cette semaine</h2><span class="small"><a href="#/plan/${L.id}">Semaine ${week} sur ${L.plan.length} — tout le plan</a></span></div>
    <div id="weekBox"></div>
    <div class="section-title"><h2>Outils du quotidien</h2></div>
    <div class="grid cols-2">
      ${toolCard('#/outils/rythme', 'Rythme', 'Lire et taper des rythmes, dix niveaux, et ceux de tes pièces.')}
      ${toolCard('#/outils/lecture', 'Lecture à vue', '10 minutes par jour, de vrais extraits à ton niveau, jamais deux fois le même.')}
      ${toolCard('#/outils/oreille', 'Oreille', '10 minutes chaque jour : chanter, reconnaître les degrés, rejouer des mélodies.')}
      ${toolCard('#/outils/theorie', 'Théorie', 'Tous les cours, et des exercices : notes, gammes, intervalles, accords.')}
      ${toolCard('#/outils/composition', 'Composition', 'Écrire ta pièce de 8 mesures : élégie, romance ou nocturne, notée et vérifiée.')}
      <a class="card" href="#/maitrise" id="masteryCard"><h3>En cours de maîtrise</h3><p>5 minutes par jour : la théorie des leçons terminées et l’analyse de tes pièces, revues au bon moment.</p></a>
    </div>
    <div id="midiHelp"></div>`;
  main.append(page);
  if (needsBackupReminder()) {
    const later = h('button', { class: 'btn ghost sm', type: 'button' }, 'Plus tard');
    const go = h('button', { class: 'btn sm', type: 'button' }, 'Exporter maintenant');
    const box = h('div', { class: 'callout tip mt-2' }, h('div', { class: 'c-title', html: ICONS.bulb + 'Sauvegarde ta progression' }),
      h('p', {}, `Dernière sauvegarde : ${lastBackupLabel()}. Un fichier d’export te protège si les données de Chrome sont effacées.`), h('div', { class: 'btn-row' }, go, later));
    go.addEventListener('click', async () => { await exportProgress(); box.remove(); toast('Fichier de sauvegarde téléchargé', 'ok'); });
    later.addEventListener('click', () => { postponeReminder(7); box.remove(); });
    $('.page-head', page).after(box);
  }
  // cartes du jour (calculées à part, sans retarder l'accueil)
  import('./tool-mastery.js').then(m => m.dueToday()).then(r => {
    const c = $('#masteryCard', page);
    if (c && r && r.total) c.querySelector('p').textContent = r.n ? `${r.n} carte${r.n > 1 ? 's' : ''} à revoir aujourd’hui (≈ ${r.minutes} min).` : 'C’est fait pour aujourd’hui. Prochaines cartes demain.';
  }).catch(() => {});
  const weekBox = $('#weekBox', page);
  if (wk) weekBox.append(weekCard(L, wk, week, true));
  if (midi.status !== 'ready') {
    $('#midiHelp', page).innerHTML = `<div class="callout tip mt-3"><div class="c-title">${ICONS.bulb}Brancher le piano</div>
      <ol><li>Relie le piano à la tablette. <b>Kawai ES110</b> : en Bluetooth MIDI (connecte d’abord le piano avec l’appli gratuite « MIDI BLE Connect »), ou avec une interface USB-MIDI branchée sur la prise ronde <b>MIDI OUT</b>. Piano avec prise <b>USB TO HOST</b> : câble USB-C ↔ USB-B.</li>
      <li>Ouvre l’appli dans <b>Chrome</b>, puis touche <b>Connecter le piano</b> en haut à droite et accepte l’accès MIDI.</li>
      <li>Vérifie dans <a href="#/outils/clavier">Test du clavier</a> : les touches jouées s’allument.</li></ol></div>`;
  }
}
function toolCard(href, title, txt) {
  return `<a class="card" href="${href}"><h3>${esc(title)}</h3><p>${esc(txt)}</p></a>`;
}

function weekCard(L, wk, week, compact) {
  const card = h('div', { class: 'card week', style: { padding: 0 } });
  const done = wk.tasks.filter((t, i) => store.get('plan')?.[`${L.id}:s${week}:${i}`]).length;
  const head = h('div', { class: 'week-head' }, h('h3', {}, `Semaine ${week} — ${wk.title}`), h('span', { class: 'small' }, `${done}/${wk.tasks.length}`));
  const body = h('div', { class: 'week-body' });
  if (wk.focus && !compact) body.append(h('p', { class: 'small mt-0' }, wk.focus));
  const mkRow = (t, i) => {
    const key = `${L.id}:s${week}:${i}`;
    const cb = h('input', { type: 'checkbox', 'aria-label': 'Fait' });
    cb.checked = !!store.get('plan')?.[key];
    const row = h('div', { class: 'task' + (cb.checked ? ' done' : '') + (taskPrio(t) === 2 ? ' opt' : '') }, cb, h('span', { class: 'mod' }, t.mod), h('span', { class: 'txt', html: taskHTML(t) }));
    cb.addEventListener('change', () => {
      const pl = { ...(store.get('plan') || {}) };
      pl[key] = cb.checked; store.set('plan', pl);
      row.classList.toggle('done', cb.checked);
      if (t.lesson && cb.checked && !store.isDone(t.lesson)) store.setDone(t.lesson, true);
      const d = wk.tasks.filter((_, j) => store.get('plan')?.[`${L.id}:s${week}:${j}`]).length;
      head.lastChild.textContent = `${d}/${wk.tasks.length}`;
    });
    return row;
  };
  // d'abord l'incontournable, puis ce qui se fait « si tu as le temps »
  const main1 = wk.tasks.map((t, i) => [t, i]).filter(([t]) => taskPrio(t) === 1);
  const opt = wk.tasks.map((t, i) => [t, i]).filter(([t]) => taskPrio(t) === 2);
  body.append(h('div', { class: 'task-group-title' }, 'Incontournable'));
  main1.forEach(([t, i]) => body.append(mkRow(t, i)));
  if (opt.length) {
    if (compact) body.append(h('p', { class: 'small task-more' }, h('a', { href: `#/plan/${L.id}` }, `+ ${opt.length} tâche${opt.length > 1 ? 's' : ''} si tu as le temps`)));
    else {
      body.append(h('div', { class: 'task-group-title opt' }, 'Si tu as le temps'));
      opt.forEach(([t, i]) => body.append(mkRow(t, i)));
    }
  }
  card.append(head, body);
  return card;
}
function taskHTML(t) {
  let s = t.text;
  if (t.lesson) { const l = lessonById(t.lesson); s = s.replace('{l}', l ? `<a href="#/lecon/${l.id}">${esc(l.title)}</a>` : '<span class="muted">leçon à venir</span>'); }
  if (t.piece) s = s.replace('{p}', `<a href="#/piece/${t.piece}">${esc(PIECES[t.piece]?.title || '')}</a>`);
  if (t.tool) s = s.replace('{t}', `<a href="${t.tool[0]}">${esc(t.tool[1])}</a>`);
  return s;
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
    <div class="tags"><span class="tag accent">${p.done}/${p.total} leçons</span><span class="tag">${L.plan.length} semaines</span><span class="tag">≈ 1 h 15 par jour</span>${isLevelValidated(L) ? '<span class="tag ok">niveau validé</span>' : ''}</div></div>`;
  html += `<div class="grid cols-2">
    <a class="card piece" href="#/piece/${L.piece}"><div class="card-top"><span class="eyebrow">Pièce phare</span></div><h3>${esc(PIECES[L.piece].title)}</h3><p>${esc(PIECES[L.piece].short || '')}</p></a>
    <div class="card"><div class="card-top"><span class="eyebrow">Pièces complémentaires</span></div>${L.complements.map(cid => `<p class="mb-0"><a href="#/piece/${cid}">${esc(PIECES[cid].title)}</a> <span class="small">${esc(PIECES[cid].status || '')}</span></p>`).join('')}</div>
  </div>`;
  html += `<div class="section-title"><h2>Objectifs du niveau</h2></div><div class="card"><ul class="goals">${L.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>`;
  html += `<div class="btn-row mt-2"><a class="btn primary" href="#/plan/${L.id}">Plan hebdomadaire</a><a class="btn" href="#/validation/${L.id}">Grille de validation</a></div>`;
  for (const M of MODULES) {
    const lm = lessonsOf(L.id, M.id);
    html += `<div class="section-title"><h2>${esc(M.label)}</h2><span class="small">${lm.filter(x => store.isDone(x.id)).length}/${lm.length}</span></div>${lessonListHTML(lm)}`;
  }
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
  const unmount = renderRich(body, l.body);
  const top = essentialsCard(l, body._core || []);
  if (top) { body.before(top); frenchSpacing(top); }
  const foot = h('div', { class: 'lesson-foot' });
  const doneBtn = h('button', { class: 'btn ' + (store.isDone(l.id) ? 'ok' : 'primary'), type: 'button' }, store.isDone(l.id) ? '✓ Leçon terminée' : 'Marquer comme terminée');
  doneBtn.addEventListener('click', () => {
    const v = !store.isDone(l.id);
    store.setDone(l.id, v);
    doneBtn.className = 'btn ' + (v ? 'ok' : 'primary');
    doneBtn.textContent = v ? '✓ Leçon terminée' : 'Marquer comme terminée';
    renderNav(location.hash);
    if (v) toast('Leçon terminée', 'ok');
  });
  foot.append(doneBtn, h('a', { class: 'small', href: `#/plan/${L.id}` }, 'Retour au plan de la semaine'));
  page.append(foot);
  const nav = h('div', { class: 'lesson-nav' });
  if (prev) nav.append(h('a', { href: `#/lecon/${prev.id}` }, h('small', {}, '← Précédente'), prev.title));
  if (next) nav.append(h('a', { class: 'next', href: `#/lecon/${next.id}` }, h('small', {}, 'Suivante →'), next.title));
  page.append(nav);
  return unmount;
}

async function pagePiece(id) {
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
      toast(cb.checked ? 'Questions « Qu’est-ce qui vient après ? » ajoutées à En cours de maîtrise' : 'Pièce retirée du par cœur', 'ok', 3500);
    });
    page.append(h('label', { class: 'check heart-toggle' }, cb, 'Je l’apprends par cœur', h('span', { class: 'small muted' }, ' — le plan et les enchaînements d’accords s’ajoutent à ', h('a', { href: '#/maitrise' }, 'En cours de maîtrise'), '.')));
  }
  const body = h('div', { class: 'prose' });
  page.append(body);
  main.append(page);
  const unmount = renderRich(body, P.body);
  const top = essentialsCard({ essentials: P.essentials }, body._core || []);
  if (top) { body.before(top); frenchSpacing(top); }
  if (['op55-1', 'op15-1', 'clair-de-lune'].includes(id)) {
    import('./analysis-panel.js').then(m => m.weekTakesSection(id)).then(sec => { if (stillHere(tok)) { page.append(sec); frenchSpacing(sec); } }).catch(e => console.warn(e));
  }
  return unmount;
}

function pagePlan(id) {
  const L = levelById(id);
  if (!L) { location.hash = '#/'; return; }
  const page = h('div', { class: 'page' });
  const cur = store.get(`plan.week_${L.id}`) || 1;
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` }, { label: 'Plan hebdomadaire' }]) +
    `<div class="page-head"><h1>Plan hebdomadaire</h1><p class="lead">${esc(L.planIntro || 'Chaque semaine : des objectifs par module. Répartis-les toi-même sur tes séances ; coche au fur et à mesure.')}</p></div>`;
  const sel = h('div', { class: 'row mb-0', style: { marginBottom: '14px' } }, h('span', { class: 'small' }, 'Semaine en cours :'));
  const seg = h('div', { class: 'seg' });
  L.plan.forEach((_, i) => {
    const b = h('button', { type: 'button', class: i + 1 === cur ? 'on' : '' }, String(i + 1));
    b.addEventListener('click', () => { store.set(`plan.week_${L.id}`, i + 1); router(); });
    seg.append(b);
  });
  sel.append(seg);
  page.append(sel);
  if (L.weekRoutine) page.append(h('div', { class: 'callout tip', html: `<div class="c-title">${ICONS.bulb}Une séance type (≈ 1 h 15)</div>${L.weekRoutine}` }));
  L.plan.forEach((wk, i) => {
    const c = weekCard(L, wk, i + 1, false);
    if (i + 1 === cur) c.style.borderColor = 'var(--accent)';
    page.append(c);
  });
  main.append(page);
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
  list.append(h('div', { class: 'section-title' }, h('h2', {}, 'Exercices')));
  for (const g of groups) {
    list.append(h('h3', { style: { margin: '18px 0 8px', fontSize: '16px' } }, g));
    const grid = h('div', { class: 'grid cols-3' });
    for (const q of presets.filter(x => x.group === g)) {
      const hist = (store.get('stats.ear') || []).filter(st => st.id === q.id).slice(-1)[0];
      const vr = store.get('settings.voiceRange');
      const sub = q.kind === 'voicefinder' ? (Array.isArray(vr) ? 'Tessiture mesurée' : 'À faire en premier : tes notes de chant seront à ta mesure') : hist ? `Dernier score : ${fmtPct(hist.pct)}` : 'Pas encore fait';
      const c = h('button', { class: 'card', type: 'button', style: { textAlign: 'left', cursor: 'pointer', font: 'inherit' } }, h('h3', {}, q.title), h('p', {}, sub));
      c.addEventListener('click', async () => {
        cleanupQuiz?.();
        host.innerHTML = '';
        if (q.kind === 'voicefinder') { const vm = await import('./voice.js'); cleanupQuiz = vm.mountVoiceFinder(host, {}); }
        else cleanupQuiz = mountQuiz(host, { ...q, stat: q.id });
        host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      grid.append(c);
    }
    list.append(grid);
  }
  const index = h('div', { html: `<div class="section-title mt-3"><h2>${esc(cfg.lessonsTitle)}</h2></div>` + moduleIndexHTML(kind) });
  page.append(host, list, index);
  main.append(page);
  return () => cleanupQuiz?.();
}

function pageImproTool() {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Improvisation' }]) +
    `<div class="page-head"><h1>Improvisation</h1><p class="lead">L’accompagnateur joue la main gauche (ou la basse seule) ; improvise à la main droite. Les notes jouées s’allument selon leur rôle dans l’harmonie. Les leçons du parcours expliquent chaque grille, du premier ostinato aux schémas classiques.</p></div>`;
  const host = h('div', { class: 'w' });
  page.append(host);
  page.insertAdjacentHTML('beforeend', `<div class="section-title mt-3"><h2>La méthode, leçon par leçon</h2></div>` + moduleIndexHTML('impro'));
  main.append(page);
  return mountLazy(host, () => import('./tool-improv.js').then(m => el => m.mountImprov(el, {})));
}

function pageCompose() {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Composition' }]) +
    `<div class="page-head"><h1>Composition</h1><p class="lead">Écris ta propre pièce de 8 mesures (élégie, romance ou nocturne) : l’accompagnement est fourni, tu inventes la mélodie mesure par mesure, l’application la note en partition et vérifie la construction. Tes projets sont gardés sur cet appareil.</p></div>`;
  const host = h('div', { class: 'w' });
  page.append(host);
  page.insertAdjacentHTML('beforeend', `<div class="callout tip mt-3"><div class="c-title">${ICONS.bulb}Avant de commencer</div><p>Fais d’abord les leçons <a href="#/lecon/n1-im2">Romance : la phrase qui respire</a> et <a href="#/lecon/n2-im2">Élégie</a> : ce sont les mêmes grilles. Ici, on fixe ce que l’improvisation laisse filer.</p></div>`);
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
  renderMidi(midi.status, midi.deviceName);
  midi.autoInit();
  if (!location.hash && store.get('lastRoute') && store.get('lastRoute') !== '#/') location.hash = store.get('lastRoute');
  else router();
}
store.subscribe((path) => { if (path === 'done' || path === '*') renderNav(location.hash || '#/'); });
boot();

initUpdates();
requestPersistence();
