// Point d'entrée : navigation, pages, barre du haut.
import { h, esc, $, $$, fmtPct, noteNameFr, INFORMANCE } from './util.js';
import { store } from './store.js';
import { midi } from './midi.js';
import { audio } from './audio.js';
import { sharedMetronome } from './metronome.js';
import { makeW, mountWidgets, ICONS } from './widgets.js';
import { keyboard } from './diagrams.js';
import { toast } from './toast.js';
import { LEVELS, MODULES, PIECES, lessonById, levelById, allLessons, lessonsOf } from './content-index.js';
import { mountSight, SIGHT_PRESETS } from './tool-sight.js';
import { mountQuiz, EAR_PRESETS, THEORY_PRESETS } from './tool-ear.js';
import { dailyTip } from './content-tips.js';
import { mountAnalyzer } from './tool-analyzer.js';
import { mountImprov } from './tool-improv.js';
import { mountMetronome } from './tool-metronome-ui.js';

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
  technique: '<path d="M7 20v-6l-3-3 4-7h3l1 4 4-2 3 3-6 5v6"/>',
  interpretation: '<path d="M4 15c3-8 6 4 9-4s5 2 7-1"/><path d="M4 20h16"/>',
  theorie: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/><circle cx="10" cy="14" r="2"/>',
  lecture: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  impro: '<path d="M12 3v12"/><path d="M12 15a3 3 0 1 1-3-3"/><path d="M15 6c2 1 3 3 3 5"/>',
  metro: '<path d="M9 3h6l4 18H5L9 3z"/><path d="M12 15l5-8"/>',
  ear: '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5 2"/>',
  oreille: '<path d="M8 10a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5 2"/><path d="M11 10a1 1 0 1 1 2 0"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
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
  [/^#\/outils\/metronome$/, () => toolPage('Métronome', 'Mesures muettes, accélération progressive, tempo tapé.', el => mountMetronome(el, { title: false }))],
  [/^#\/outils\/lecture$/, () => toolPage('Lecture à vue', 'Des extraits nouveaux à chaque fois, adaptés à ton niveau. Lis d’abord en silence, puis joue sans t’arrêter.', el => mountSight(el, { preset: currentLevel().id === 'n2' ? 'n2-md' : 'n1-md' }))],
  [/^#\/outils\/oreille$/, () => pagePresets('oreille')],
  [/^#\/outils\/theorie$/, () => pagePresets('theorie')],
  [/^#\/outils\/analyseur$/, () => toolPage('Analyseur de jeu', 'Le piano envoie chaque note jouée, avec sa force et sa durée. L’analyseur mesure ce que l’oreille perçoit mal en jouant.', el => mountAnalyzer(el, { modes: ['evenness', 'legato', 'pedal', 'balance', 'voicing', 'dynamics'] }))],
  [/^#\/outils\/impro$/, pageImproTool],
  [/^#\/outils\/clavier$/, pageKeyboardTest],
  [/^#\/reglages$/, pageSettings],
];

function router() {
  const hash = location.hash || '#/';
  cleanup?.();
  cleanup = null;
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) {
      main.innerHTML = '';
      try { cleanup = fn(...m.slice(1)) || null; }
      catch (e) { console.error(e); main.innerHTML = `<div class="page"><h1>Erreur</h1><p>${esc(e.message)}</p></div>`; }
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
  let html = `<div class="nav-section">${link('#/', 'Accueil', 'home')}${link('#/parcours', 'Le parcours', 'map')}</div>`;
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
  html += link('#/outils/metronome', 'Métronome', 'metro');
  html += link('#/outils/lecture', 'Lecture à vue', 'lecture');
  html += link('#/outils/oreille', 'Oreille', 'ear');
  html += link('#/outils/theorie', 'Théorie', 'theorie');
  html += link('#/outils/analyseur', 'Analyseur de jeu', 'chart');
  html += link('#/outils/impro', 'Improvisation', 'impro');
  html += link('#/outils/clavier', 'Test du clavier', 'keys');
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
midiPill.addEventListener('click', async () => {
  audio.unlock();
  if (midi.status === 'ready') { location.hash = '#/outils/clavier'; return; }
  if (!midi.supported) { toast('Ce navigateur ne gère pas le MIDI. Utilise Chrome sur Android.', 'err', 4200); return; }
  const ok = await midi.init();
  if (ok) toast(`Piano connecté : ${midi.deviceName}`, 'ok');
  else if (midi.status === 'nodevice') toast('Aucun appareil MIDI : vérifie le câble USB et que le piano est allumé.', 'err', 4200);
  else if (midi.status === 'denied') toast('Autorisation MIDI refusée. Réautorise-la dans les réglages du site (cadenas dans la barre d’adresse).', 'err', 5200);
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
  const unmount = mountWidgets(container, cfgs);
  frenchSpacing(container);
  return unmount;
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
  return `<ul class="lesson-list">${lessons.map((l, i) => `<li class="${store.isDone(l.id) ? 'done' : ''}"><a href="#/lecon/${l.id}"><span class="num">${store.isDone(l.id) ? '✓' : i + 1}</span><span class="t"><b>${esc(l.title)}</b><span>${esc(l.summary || '')}</span></span><span class="dur">${l.minutes ? l.minutes + ' min' : ''}</span></a></li>`).join('')}</ul>`;
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
    <div id="tipBox"></div>
    <div class="section-title"><h2>Outils du quotidien</h2></div>
    <div class="grid cols-2">
      ${toolCard('#/outils/oreille', 'Oreille', '10 minutes chaque jour : chanter, reconnaître les degrés, rejouer des mélodies.')}
      ${toolCard('#/outils/lecture', 'Lecture à vue', '10 minutes par jour, un extrait nouveau à chaque fois.')}
      ${toolCard('#/outils/theorie', 'Théorie', 'Tous les cours, et des exercices : notes, rythme, gammes, intervalles, accords.')}
      ${toolCard('#/outils/analyseur', 'Analyseur de jeu', 'Régularité, legato, pédale, équilibre des mains.')}
    </div>
    <div id="midiHelp"></div>`;
  main.append(page);
  const weekBox = $('#weekBox', page);
  if (wk) weekBox.append(weekCard(L, wk, week, true));
  const tip = dailyTip();
  $('#tipBox', page).innerHTML = `<div class="card daily-tip mt-2"><span class="ico-b">${ICONS.bulb}</span><div><div class="eyebrow">Conseil du jour · ${esc(tip.mod)}</div><p class="mt-1">${tip.html}</p></div></div>`;
  if (midi.status !== 'ready') {
    $('#midiHelp', page).innerHTML = `<div class="callout tip mt-3"><div class="c-title">${ICONS.bulb}Brancher le piano</div>
      <ol><li>Relie la tablette à la prise <b>USB TO HOST</b> du P-145 avec un câble <b>USB-C ↔ USB-B</b>.</li>
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
  wk.tasks.forEach((t, i) => {
    const key = `${L.id}:s${week}:${i}`;
    const cb = h('input', { type: 'checkbox', 'aria-label': 'Fait' });
    cb.checked = !!store.get('plan')?.[key];
    const row = h('div', { class: 'task' + (cb.checked ? ' done' : '') }, cb, h('span', { class: 'mod' }, t.mod), h('span', { class: 'txt', html: taskHTML(t) }));
    cb.addEventListener('change', () => {
      const pl = { ...(store.get('plan') || {}) };
      pl[key] = cb.checked; store.set('plan', pl);
      row.classList.toggle('done', cb.checked);
      if (t.lesson && cb.checked && !store.isDone(t.lesson)) store.setDone(t.lesson, true);
      const d = wk.tasks.filter((_, j) => store.get('plan')?.[`${L.id}:s${week}:${j}`]).length;
      head.lastChild.textContent = `${d}/${wk.tasks.length}`;
    });
    body.append(row);
  });
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

function pageLesson(id) {
  const l = lessonById(id);
  if (!l) { location.hash = '#/'; return; }
  const L = levelById(l.level);
  const M = MODULES.find(m => m.id === l.module);
  const siblings = lessonsOf(l.level, l.module);
  const idx = siblings.indexOf(l);
  const prev = siblings[idx - 1], next = siblings[idx + 1];
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` }, { label: M.label, href: `#/niveau/${L.id}/${M.id}` }, { label: `Leçon ${idx + 1}` }]) +
    `<div class="page-head"><h1>${esc(l.title)}</h1>${l.summary ? `<p class="lead">${esc(l.summary)}</p>` : ''}
     <div class="lesson-meta"><span>${esc(M.label)} · niveau ${L.num}</span>${l.minutes ? `<span>≈ ${l.minutes} min</span>` : ''}${store.isDone(l.id) ? '<span class="tag ok">terminée</span>' : ''}</div></div>`;
  if (l.goals && l.goals.length) page.insertAdjacentHTML('beforeend', `<div class="card" style="max-width:var(--prose-w)"><div class="eyebrow" style="font-size:12px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px">À la fin de cette leçon</div><ul class="goals">${l.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>`);
  const body = h('div', { class: 'prose mt-2' });
  page.append(body);
  main.append(page);
  const unmount = renderRich(body, l.body);
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

function pagePiece(id) {
  const P = PIECES[id];
  if (!P) { location.hash = '#/'; return; }
  const L = LEVELS.find(x => x.pieceIds.includes(id));
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, L ? { label: `Niveau ${L.num}`, href: `#/niveau/${L.id}` } : { label: 'Pièces' }, { label: P.title }]) +
    `<div class="page-head"><h1>${esc(P.title)}</h1><p class="lead">${esc(P.composer)}${P.short ? ' · ' + esc(P.short) : ''}</p><div class="tags">${(P.tags || []).map(t => `<span class="tag ${t.cls || ''}">${esc(t.label)}</span>`).join('')}</div></div>`;
  const body = h('div', { class: 'prose' });
  page.append(body);
  main.append(page);
  return renderRich(body, P.body);
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

function toolPage(title, lead, mountFn) {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: title }]) + `<div class="page-head"><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></div>`;
  const host = h('div', { class: 'w' });
  page.append(host);
  main.append(page);
  return mountFn(host);
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
    title: 'Oreille', presets: () => EAR_PRESETS, lessonsTitle: 'Le cours d’oreille, leçon par leçon',
    lead: 'Dix minutes chaque jour valent mieux qu’une longue séance par semaine. Les leçons du parcours expliquent chaque étape ; ici, tu retrouves toutes les séries pour t’entraîner librement. Objectif : 80 % du premier coup, deux jours de suite, avant de passer à la série suivante.',
  },
  theorie: {
    title: 'Théorie', presets: () => THEORY_PRESETS, lessonsTitle: 'Les cours de théorie, chapitre par chapitre',
    lead: 'Tous les chapitres de théorie des niveaux, dans l’ordre, et des exercices pour réviser : lecture des notes, rythme, gammes, intervalles, accords.',
  },
};

function pagePresets(kind) {
  const cfg = PRESET_PAGES[kind];
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: cfg.title }]) +
    `<div class="page-head"><h1>${esc(cfg.title)}</h1><p class="lead">${esc(cfg.lead)}</p></div>`;
  const presets = cfg.presets();
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
      const c = h('button', { class: 'card', type: 'button', style: { textAlign: 'left', cursor: 'pointer', font: 'inherit' } }, h('h3', {}, q.title), h('p', {}, hist ? `Dernier score : ${fmtPct(hist.pct)}` : 'Pas encore fait'));
      c.addEventListener('click', () => {
        cleanupQuiz?.();
        host.innerHTML = '';
        cleanupQuiz = mountQuiz(host, { ...q, stat: q.id });
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
  return mountImprov(host, {});
}

function pageKeyboardTest() {
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Outils' }, { label: 'Test du clavier' }]) +
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
  const page = h('div', { class: 'page' });
  page.innerHTML = crumbs([{ label: 'Accueil', href: '#/' }, { label: 'Réglages' }]) + `<div class="page-head"><h1>Réglages</h1></div>`;
  const card = (title, ...kids) => h('div', { class: 'card', style: { marginBottom: '14px' } }, h('h3', {}, title), ...kids);

  // MIDI
  const inSel = h('select', {}, h('option', { value: 'auto' }, 'Automatique (tous)'), ...midi.inputs.map(i => h('option', { value: i.id, selected: s.midiInput === i.id }, i.name)));
  inSel.addEventListener('change', () => { store.set('settings.midiInput', inSel.value); midi.rebind(); });
  const outSel = h('select', {}, h('option', { value: '' }, 'Premier disponible'), ...midi.outputs.map(o => h('option', { value: o.id, selected: s.midiOutput === o.id }, o.name)));
  outSel.addEventListener('change', () => { store.set('settings.midiOutput', outSel.value); midi.rebind(); });
  const demoSel = h('select', {}, h('option', { value: 'sampler', selected: s.demoOutput !== 'midi' }, 'La tablette (piano échantillonné)'), h('option', { value: 'midi', selected: s.demoOutput === 'midi' }, 'Le piano (son du P-145, via MIDI)'));
  demoSel.addEventListener('change', () => store.set('settings.demoOutput', demoSel.value));
  const split = h('input', { type: 'number', min: 36, max: 84, value: s.split });
  split.addEventListener('change', () => store.set('settings.split', +split.value));
  page.append(card('Piano (MIDI)',
    h('p', { class: 'small' }, midi.status === 'ready' ? `Connecté : ${midi.deviceName}` : 'Non connecté — touche « Connecter le piano » en haut.'),
    h('div', { class: 'grid cols-2' },
      h('label', { class: 'field' }, 'Entrée MIDI', inSel),
      h('label', { class: 'field' }, 'Sortie MIDI', outSel),
      h('label', { class: 'field' }, 'Les démonstrations sont jouées par', demoSel),
      h('label', { class: 'field' }, 'Séparation main gauche / main droite (n° MIDI, 60 = do3)', split))));

  // Audio
  const vol = h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: s.volume });
  vol.addEventListener('input', () => store.set('settings.volume', +vol.value));
  const mvol = h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: s.metroVolume });
  mvol.addEventListener('input', () => store.set('settings.metroVolume', +mvol.value));
  const echo = h('input', { type: 'checkbox' }); echo.checked = s.echoVirtual !== false;
  echo.addEventListener('change', () => store.set('settings.echoVirtual', echo.checked));
  const latOut = h('output', {}, `${s.latency} ms`);
  const lat = h('input', { type: 'range', min: -100, max: 250, step: 5, value: s.latency });
  lat.addEventListener('input', () => { store.set('settings.latency', +lat.value); latOut.textContent = `${lat.value} ms`; });
  const calib = h('button', { class: 'btn sm', type: 'button' }, 'Calibrer (8 clics)');
  const calibInfo = h('span', { class: 'small' });
  calib.addEventListener('click', () => calibrate(calibInfo, lat, latOut));
  page.append(card('Son',
    h('label', { class: 'range' }, 'Volume du piano', vol),
    h('label', { class: 'range' }, 'Volume du métronome', mvol),
    h('label', { class: 'check mt-1' }, echo, 'Faire sonner le clavier à l’écran'),
    h('p', { class: 'small mt-2' }, 'Compensation de latence : décalage entre le clic entendu et la note jouée. Calibre-la une fois (joue une même note en même temps que chacun des 8 clics), elle rend le mode « en rythme » plus juste.'),
    h('div', { class: 'row' }, h('label', { class: 'range', style: { flex: 1 } }, 'Latence', lat, latOut), calib, calibInfo)));

  // Données
  const exp = h('button', { class: 'btn', type: 'button' }, 'Exporter ma progression');
  exp.addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `parcours-piano-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove();
  });
  const imp = h('input', { type: 'file', accept: 'application/json', hidden: true });
  const impBtn = h('button', { class: 'btn', type: 'button' }, 'Importer');
  impBtn.addEventListener('click', () => imp.click());
  imp.addEventListener('change', async () => {
    try { store.importJSON(await imp.files[0].text()); toast('Progression importée', 'ok'); router(); }
    catch (e) { toast('Fichier non reconnu', 'err'); }
  });
  const reset = h('button', { class: 'btn ghost', type: 'button' }, 'Tout effacer');
  reset.addEventListener('click', () => { if (confirm('Effacer toute la progression et les réglages ?')) { store.reset(); router(); } });
  page.append(card('Progression', h('p', { class: 'small' }, 'Ta progression est enregistrée sur cette tablette, dans le navigateur. Exporte-la de temps en temps : vider les données de Chrome l’effacerait.'), h('div', { class: 'btn-row' }, exp, impBtn, imp, reset)));

  page.append(card('Sources et licences', h('div', {
    class: 'small', html: `<p>Piano : <b>Salamander Grand Piano</b> d’Alexander Holm (CC BY 3.0), via Tone.js. Partitions : <b>abcjs</b> (MIT). Polices : <b>Inter</b> et <b>Literata</b> (SIL OFL).</p>
    <p>Extraits de Chopin transcrits d’après les éditions LilyPond de <b>Knute Snortum</b> (op. 15 et op. 55, CC BY-SA 4.0) et vérifiés sur l’édition Breitkopf &amp; Härtel ; extraits de Debussy d’après l’édition du Mutopia Project (domaine public). Les extraits sont partagés sous la même licence CC BY-SA 4.0.</p>
    <p>Liens « Informance » : <a href="${INFORMANCE}" target="_blank" rel="noopener">Practising the Piano Online Academy</a> (abonnement).</p>`,
  })));
  main.append(page);
}

function calibrate(info, lat, latOut) {
  const offsets = [];
  const bpm = 80, n = 8;
  audio.ensure().then(() => {
    const t0 = audio.now() + 0.5;
    const clicks = [];
    for (let i = 0; i < n; i++) { audio.click(t0 + i * 60 / bpm, 'beat'); clicks.push(audio.ctxToPerf(t0 + i * 60 / bpm) - (store.get('settings.latency') || 0)); }
    info.textContent = 'Joue une note avec chaque clic…';
    const off = midi.on('noteon', e => {
      const nearest = clicks.reduce((b, c) => Math.abs(c - e.time) < Math.abs(b - e.time) ? c : b, clicks[0]);
      if (Math.abs(nearest - e.time) < 300) offsets.push(e.time - nearest);
    });
    setTimeout(() => {
      off();
      if (offsets.length < 4) { info.textContent = 'Pas assez de notes captées : réessaie (piano connecté ?).'; return; }
      offsets.sort((a, b) => a - b);
      const med = Math.round(offsets[Math.floor(offsets.length / 2)] / 5) * 5;
      store.set('settings.latency', med);
      lat.value = med; latOut.textContent = `${med} ms`;
      info.textContent = `Latence réglée à ${med} ms.`;
    }, 500 + n * 60000 / bpm + 600);
  });
}

/* ================================================================== */
/* Démarrage                                                           */
/* ================================================================== */
window.addEventListener('hashchange', router);
// Appli mise en arrière-plan (écran éteint, autre appli) : on arrête proprement la lecture en cours.
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stopCurrent(); });
function boot() {
  if (!window.ABCJS) { setTimeout(boot, 30); return; }
  renderMidi(midi.status, midi.deviceName);
  midi.autoInit();
  if (!location.hash && store.get('lastRoute') && store.get('lastRoute') !== '#/') location.hash = store.get('lastRoute');
  else router();
}
store.subscribe((path) => { if (path === 'done' || path === '*') renderNav(location.hash || '#/'); });
boot();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
