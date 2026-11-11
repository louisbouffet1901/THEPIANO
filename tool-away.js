// Loin du piano (V8) : 5 à 15 minutes utiles sans clavier — dans les transports, entre deux cours, en vacances.
// Quatre blocs qui tournent : ta pièce de tête (pratique mentale de la section du jour), l'oreille (« Trouve la note »
// sur le clavier de l'écran, V8.4), le rythme et les notes (sur l'écran), la théorie (fiches à revoir ou chapitre
// en cours). Rien ne remplace le piano : ce travail prépare la séance suivante, qui commence par rejouer de mémoire ce
// qui a été travaillé de tête.
import { h, esc } from './util.js';
import { store } from './store.js';
import { ICONS } from './icons.js';
import { toast } from './toast.js';
import { LEVELS, lessonsOf } from './content-index.js';
import { logAway, awayLast, awayCtx, lastAt, dayKey, daysBetween } from './activity.js';
import { getPace } from './pace.js';

export const BLOCKS = {
  tete: { label: 'Ta pièce, de tête', min: 5, w: 1.5 },
  oreille: { label: 'Oreille', min: 5, w: 1.2 },
  lecture: { label: 'Rythme et notes', min: 3, w: 1.0 },
  theorie: { label: 'Théorie', min: 5, w: 0.9 },
};
const ORDER = ['tete', 'oreille', 'lecture', 'theorie'];
export const AWAY_DURATIONS = [5, 10, 15];

/* ------------------------------------------------------------------ */
/* Ce que propose chaque bloc                                           */
/* ------------------------------------------------------------------ */
const currentLevel = () => {
  const val = store.get('validation') || {};
  return LEVELS.find(l => !l.locked && !(l.validation.length && l.validation.every(c => (val[`${l.id}:${c.id}`] ?? 0) >= 2))) || LEVELS.find(l => !l.locked);
};
/** Le prochain chapitre de théorie pas encore fait, niveau par niveau jusqu'au niveau en cours. */
function nextTheory(L) {
  for (const lv of LEVELS) {
    if (lv.locked) continue;
    const l = lessonsOf(lv.id, 'theorie').find(x => !store.isDone(x.id) && x.prio !== 2);
    if (l) return l;
    if (lv.id === L.id) break;
  }
  return null;
}
/** L'oreille loin du piano (V8.4) : « Trouve la note » sur le clavier de l'écran, dans la tonalité de la prochaine séance. */
async function earChoice() {
  const ef = await import('./tool-earfind.js');
  const info = ef.nextSessionInfo();
  return { info, title: `Trouve la note, ${info.name}` };
}
/** Pour chaque bloc : { title, sub } (une ligne), et la section de la pièce pour le bloc « de tête ». */
export async function awayProposals(L = currentLevel(), now = Date.now()) {
  const [pm, ear, ms] = await Promise.all([import('./piecemap.js'), earChoice(), import('./tool-mastery.js')]);
  const out = {};
  const nx = pm.nextSection(L.piece, now);
  if (nx) out.tete = { section: nx.section, piece: L.piece, sub: `${nx.section.name} (m. ${nx.section.from}-${nx.section.to}) : l’écouter en suivant, la lire en l’entendant, la jouer dans ta tête, puis de mémoire.` };
  out.oreille = { ...ear, sub: `Trouve la note en ${ear.info.name} : la note sonne, tu la trouves sur le clavier de l’écran, avec des écouteurs. Chanter est facultatif.` };
  out.lecture = { sub: 'Une minute de rythme à taper sur l’écran en comptant, une minute de notes à nommer : ton point faible, sans clavier.' };
  let due = null;
  try { due = await ms.dueSummary(now); } catch (e) { due = null; }
  const th = nextTheory(L);
  let cards = null;
  try { cards = await (await import('./tool-cards.js')).deckSummary(now); } catch (e) { cards = null; }
  out.theorie = { due, lesson: th, cards, sub: cards && (cards.due || cards.fresh) ? `Tes cartes du jour (${cards.due} à revoir, ${cards.fresh} nouvelle${cards.fresh > 1 ? 's' : ''}), façon Anki, ou un défi éclair d’une minute.` : 'Un défi éclair d’une minute (armures, intervalles, accords…), ou une étape du chapitre en cours.' };
  return out;
}
/** Les blocs du jour pour une durée : ceux faits il y a le plus longtemps (la pièce de tête compte davantage). */
export function awayPlan(minutes, props = null, now = Date.now()) {
  const since = b => {
    let t = awayLast(b);
    if (b === 'oreille') t = Math.max(t || 0, lastAt('oreille') || 0) || null; // l'oreille faite au piano compte aussi
    return t ? Math.max(0, daysBetween(t, now)) + 0.5 : 30;
  };
  const ranked = ORDER.filter(b => !props || props[b]).map(b => ({ b, s: since(b) * BLOCKS[b].w })).sort((x, y) => y.s - x.s);
  const out = [];
  let total = 0;
  for (const { b } of ranked) {
    if (out.length && total + BLOCKS[b].min > minutes + 1) continue;
    out.push(b);
    total += BLOCKS[b].min;
    if (total >= minutes - 1) break;
  }
  return out.sort((x, y) => ORDER.indexOf(x) - ORDER.indexOf(y));
}

/* ------------------------------------------------------------------ */
/* La séance loin du piano (état du jour)                               */
/* ------------------------------------------------------------------ */
// away.sess = { day, minutes, blocks, done: { bloc: minutes }, opened: { bloc: ms }, section?, piece? }
const readSess = (now = Date.now()) => { const s = (store.get('away') || {}).sess; return s && s.day === dayKey(now) ? s : null; };
const saveSess = s => store.set('away', { ...(store.get('away') || {}), sess: s });

/* ------------------------------------------------------------------ */
/* Ta pièce, de tête : pratique mentale d'une section                   */
/* ------------------------------------------------------------------ */
const MENTAL = [
  { t: 'Écoute en suivant', min: '1 min', d: s => `Écoute la section en suivant la partition des yeux, de la mesure ${s.from} à la mesure ${s.to}. Repère où la mélodie respire et où se trouvent les points de départ (${s.starts.map(m => 'm. ' + m).join(', ')}).` },
  { t: 'Lis-la sans le son', min: '1 min', d: s => `Relis la partition sans rien écouter : entends la mélodie dans ta tête, à ton tempo de travail, en comptant la pulsation. Si tu peux, chante-la doucement.${s.ear && s.ear[0] ? ' ' + s.ear[0] : ''}` },
  { t: 'Joue-la dans ta tête', min: '2 min', d: s => `Imagine tes mains sur le clavier, note après note : les doigtés, les déplacements, la pédale, la nuance. Lentement : là où tu ne sais pas quel doigt joue, regarde la partition. Ce qui compte ici : ${s.play.charAt(0).toLowerCase()}${s.play.slice(1)}` },
  { t: 'De mémoire', min: '1 min', d: s => `Cache la partition. Pars de la mesure ${s.starts[0]} et déroule la section dans ta tête jusqu’au bout. Là où ça se brouille, regarde la partition, puis repars du point de départ le plus proche.` },
  { t: 'Une note pour le piano', min: '', d: () => 'Qu’est-ce que tu veux vérifier au clavier ? À ta prochaine séance au piano, cette section se jouera d’abord de mémoire, avec ta note.' },
];
export function mountMental(el, { piece, section, onDone } = {}) {
  let alive = true;
  const cleanups = [];
  const frame = h('div', { class: 'w-frame aw-mental' });
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, `De tête : ${section.name}`), h('span', { class: 'w-sub' }, `m. ${section.from}-${section.to} · 5 minutes`)));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);
  const scores = h('div', { class: 'aw-scores' });
  const hideBtn = h('button', { class: 'btn sm', type: 'button' }, 'Cacher la partition');
  hideBtn.addEventListener('click', () => { scores.hidden = !scores.hidden; hideBtn.textContent = scores.hidden ? 'Montrer la partition' : 'Cacher la partition'; });
  // les étapes d'abord (la consigne du moment se lit sans défiler), les partitions en dessous
  const list = h('ol', { class: 'aw-steps' });
  body.append(list, scores);
  // les extraits de la section (partitions vérifiées), sinon ta partition papier
  (async () => {
    const [pm, ex, { ensureAbcjs }, sw] = await Promise.all([import('./piecemap.js'), import('./content-excerpts.js'), import('./lazy.js'), import('./score-widget.js')]);
    const set = { 'op55-1': ex.OP55, 'op15-1': ex.OP15, 'clair-de-lune': ex.CLAIR }[piece] || {};
    const keys = (section.ex || []).filter(k => set[k]).slice(0, 3);
    const M = pm.mapOf(piece);
    const bpm = +((M && M.tempo || '').match(/\d+/) || [60])[0];
    if (!keys.length) { scores.append(h('p', { class: 'small muted' }, 'Pas de partition de cette section dans l’appli : prends ta partition papier.')); return; }
    await ensureAbcjs();
    for (const k of keys) {
      if (!alive) return;
      const host = h('div', { class: 'mt-1' });
      scores.append(host);
      try { const c = sw.mountScore(host, { abc: set[k], practice: false, hands: false, analysis: false, bpm, piece }); if (typeof c === 'function') cleanups.push(c); }
      catch (e) { host.textContent = 'Partition indisponible.'; }
    }
  })().catch(e => { scores.append(h('p', { class: 'small muted' }, 'Partition indisponible : ' + e.message)); });
  const note = h('textarea', { rows: 2, maxlength: 240, placeholder: 'Par exemple : le doigté de la m. 13, la fioriture sans ralentir la main gauche…', 'aria-label': 'Ta note pour le piano' });
  const doneBtn = h('button', { class: 'btn primary', type: 'button' }, 'C’est fait');
  let cur = 0;
  const items = MENTAL.map((m, i) => {
    const next = h('button', { class: 'btn sm', type: 'button' }, 'Étape suivante');
    next.addEventListener('click', () => open(i + 1));
    const extra = i === 3 ? h('div', { class: 'btn-row' }, hideBtn, next) : i === 4 ? h('div', { class: 'aw-note' }, note, h('div', { class: 'btn-row' }, doneBtn)) : h('div', { class: 'btn-row' }, next);
    const li = h('li', { class: 'aw-step' },
      h('div', { class: 'aw-st-head' }, h('span', { class: 'aw-n' }, String(i + 1)), h('b', {}, m.t), m.min ? h('span', { class: 'small muted' }, m.min) : null),
      h('div', { class: 'aw-st-body' }, h('p', { class: 'small' }, m.d(section)), extra));
    li.querySelector('.aw-st-head').addEventListener('click', () => open(i));
    list.append(li);
    return li;
  });
  const open = i => {
    cur = Math.min(i, items.length - 1);
    items.forEach((li, j) => { li.classList.toggle('on', j === cur); li.classList.toggle('past', j < cur); });
    if (cur === 3 && !scores.hidden) hideBtn.click(); // de mémoire : la partition se cache
    if (cur < 3 && scores.hidden) hideBtn.click();
  };
  doneBtn.addEventListener('click', async () => {
    const pm = await import('./piecemap.js');
    pm.setMental(piece, section.id, note.value);
    toast('Noté : ta prochaine séance au piano commencera par cette section, de mémoire.', 'ok', 3200);
    onDone?.();
  });
  open(0);
  return () => { alive = false; cleanups.forEach(f => { try { f(); } catch (e) { /* */ } }); };
}

/* ------------------------------------------------------------------ */
/* Les autres blocs                                                     */
/* ------------------------------------------------------------------ */
function mountEar(el, prop, { onFinish } = {}) {
  let un = null, dead = false;
  const host = h('div');
  el.append(h('p', { class: 'small mt-0' }, 'Avec des écouteurs : la note sonne, tu la trouves sur le clavier de l’écran. Tes résultats comptent comme au piano.'), host);
  import('./tool-earfind.js').then(m => { if (!dead) un = m.mountEarFind(host, { away: true, minutes: 5, key: prop?.info?.key, onFinish }); }).catch(e => { host.append(h('p', { class: 'small' }, 'Indisponible : ' + e.message)); });
  return () => { dead = true; try { un?.(); } catch (e) { /* */ } };
}
function mountReading(el, { onFinish } = {}) {
  let un = null, gen = 0;
  const done = {};
  const tabs = h('div', { class: 'wu-steps aw-two' });
  const host = h('div');
  el.append(h('p', { class: 'small mt-0' }, 'Le rythme d’abord : tape sur la zone prévue, au clic, en comptant à voix haute (ou dans ta tête si tu n’es pas seul). Puis les notes : réponds par leur nom.'), tabs, host);
  const STEPS = [['rhythm', 'Rythme'], ['notes', 'Notes']];
  const render = cur => {
    tabs.innerHTML = '';
    STEPS.forEach(([k, label], i) => {
      const b = h('button', { type: 'button', class: 'wu-step' + (k === cur ? ' on' : '') + (done[k] ? ' done' : '') }, h('span', { class: 'wu-n' }, done[k] ? '✓' : String(i + 1)), h('span', {}, h('b', {}, label), h('small', {}, done[k] || '1 min')));
      b.addEventListener('click', () => open(k));
      tabs.append(b);
    });
  };
  const open = async k => {
    const my = ++gen;
    try { un?.(); } catch (e) { /* */ }
    host.innerHTML = '';
    render(k);
    const fin = r => {
      done[k] = k === 'rhythm' ? `${r.good}/${r.n} réussis` : `${r.npm} par minute`;
      render(k);
      const nxt = STEPS.find(([x]) => !done[x]);
      if (nxt) { const b = h('button', { class: 'btn primary', type: 'button' }, `Suite : ${nxt[1]} (1 min)`); b.addEventListener('click', () => open(nxt[0])); host.append(h('div', { class: 'btn-row mt-1' }, b)); }
      else onFinish?.(done);
    };
    if (k === 'rhythm') { const m = await import('./tool-rhythm.js'); if (my !== gen) return; un = m.mountRhythmMinute(host, { bare: true, onFinish: fin }); }
    else { const m = await import('./tool-notespeed.js'); if (my !== gen) return; un = m.mountNoteSpeed(host, { bare: true, onFinish: fin, force: { input: 'names' } }); }
  };
  open('rhythm');
  return () => { gen++; try { un?.(); } catch (e) { /* */ } };
}
/** Théorie loin du piano (V8.1) : les cartes du jour (façon Anki) ou un défi éclair, sur place ; le chapitre en cours
 *  et les fiches restent à un toucher. */
function mountTheory(el, prop, { onFinish } = {}) {
  let un = null;
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Théorie' });
  const host = h('div', { class: 'mt-1' });
  const links = h('p', { class: 'small muted mt-1 mb-0' });
  if (prop.lesson) links.append('Ou une étape du chapitre en cours : ', h('a', { href: `#/lecon/${prop.lesson.id}` }, prop.lesson.title), '. ');
  if (prop.due && prop.due.due) links.append(h('a', { href: '#/maitrise' }, `${prop.due.due} fiche${prop.due.due > 1 ? 's' : ''} à revoir`), '.');
  const pickMode = async m => {
    try { un?.(); } catch (e) { /* */ }
    host.innerHTML = '';
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
    if (m === 'cartes') un = (await import('./tool-cards.js')).mountCards(host, { compact: true, onFinish });
    else un = (await import('./tool-defis.js')).mountDefis(host, { compact: true, onFinish });
  };
  [['cartes', 'Cartes du jour'], ['defi', 'Défi éclair']].forEach(([m, label]) => {
    const b = h('button', { type: 'button', 'data-m': m }, label);
    b.addEventListener('click', () => pickMode(m));
    seg.append(b);
  });
  el.append(seg, host, links);
  import('./tool-cards.js').then(m => m.deckSummary()).then(r => pickMode(r && (r.due || r.fresh) ? 'cartes' : 'defi')).catch(() => pickMode('defi'));
  return () => { try { un?.(); } catch (e) { /* */ } };
}

/* ------------------------------------------------------------------ */
/* La page                                                              */
/* ------------------------------------------------------------------ */
const WHY_HTML = `<p><b>Ta pièce de tête.</b> Imaginer qu’on joue un passage améliore réellement le jeu, mais moins que le piano lui-même : chez 16 pianistes experts, la pratique mentale a réduit les fausses notes, moins que la pratique au clavier (Bernardi et al., 2013). Elle complète donc le piano : ta séance suivante commence par rejouer de mémoire ce que tu as travaillé de tête, puis vérifie au clavier.</p>
<p><b>Finir par ce qui compte.</b> Chez 60 étudiants en musique, une mélodie apprise le soir était mieux jouée le lendemain ; en apprendre une deuxième juste après effaçait ce progrès, sauf si l’on rejouait la première avant de dormir (Allen, 2013). D’où, au piano, la section rejouée une fois en entier à la fin de la séance.</p>
<p><b>Le clavier pour ce qui en a besoin.</b> L’oreille, le rythme lu et la théorie se travaillent sans piano : faits ici, ils laissent le temps du piano à la pièce, à l’improvisation et à la lecture.</p>
<p class="small muted">Sources : Bernardi, De Buglio, Trimarchi et al., « Mental practice promotes motor anticipation: evidence from skilled music performance », <i>Frontiers in Human Neuroscience</i>, 2013 (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3747442" target="_blank" rel="noopener">article</a>) ; S. E. Allen, « Memory stabilization and enhancement following music practice », <i>Psychology of Music</i>, 2013.</p>`;

export function mountAway(el, { piece = null, section = null } = {}) {
  let alive = true, blockUn = null;
  awayCtx.on = true;
  const L = currentLevel();
  const wrap = h('div');
  el.append(wrap, h('details', { class: 'more mt-3' }, h('summary', {}, 'Pourquoi ça marche'), h('div', { class: 'more-body small', html: WHY_HTML })));
  let props = null;
  const stopBlock = () => { try { blockUn?.(); } catch (e) { /* */ } blockUn = null; };

  const start = (minutes, blocks, extra = {}) => {
    const s = { day: dayKey(), minutes, blocks, done: {}, opened: {}, ...extra };
    saveSess(s);
    runner(s);
  };
  // le constructeur : durée et blocs
  function builder() {
    stopBlock();
    wrap.innerHTML = '';
    let minutes = store.get('ui.awayMin') || getPace().away || 10;
    if (!AWAY_DURATIONS.includes(minutes)) minutes = 10;
    let chosen = new Set(awayPlan(minutes, props));
    let touched = false;
    const card = h('div', { class: 'card session sx-builder aw-builder' });
    const seg = h('div', { class: 'seg sx-durs', role: 'group', 'aria-label': 'Durée, en minutes' });
    AWAY_DURATIONS.forEach(m => {
      const b = h('button', { type: 'button', class: m === minutes ? 'on' : '' }, String(m));
      b.addEventListener('click', () => { minutes = m; store.set('ui.awayMin', m); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); if (!touched) chosen = new Set(awayPlan(minutes, props)); refresh(); });
      seg.append(b);
    });
    const rows = h('div', { class: 'sx-rows' });
    const go = h('button', { class: 'btn primary lg', type: 'button' });
    go.addEventListener('click', () => { const bl = ORDER.filter(b => chosen.has(b) && props[b]); if (bl.length) start(minutes, bl); });
    const rowEls = {};
    for (const b of ORDER) {
      const p = props[b];
      const cb = h('input', { type: 'checkbox', 'aria-label': BLOCKS[b].label, disabled: !p });
      cb.addEventListener('change', () => { touched = true; if (cb.checked) chosen.add(b); else chosen.delete(b); refresh(); });
      const last = awayLast(b);
      const row = h('label', { class: 'sx-row' + (p ? '' : ' off') }, cb,
        h('span', { class: 'sx-main' }, h('span', { class: 'sx-head' }, h('b', {}, BLOCKS[b].label), h('span', { class: 'sx-min' }, `${BLOCKS[b].min} min`)),
          h('span', { class: 'sx-act small' }, p ? p.sub : 'Rien à proposer ici pour l’instant.'),
          h('span', { class: 'sx-meta' }, h('span', { class: 'sx-last' }, last ? `dernière fois loin du piano : ${(d => (d <= 0 ? 'aujourd’hui' : d === 1 ? 'hier' : `il y a ${d} jours`))(daysBetween(last, Date.now()))}` : 'pas encore fait loin du piano'))));
      rowEls[b] = { row, cb };
      rows.append(row);
    }
    function refresh() {
      const bl = ORDER.filter(b => chosen.has(b) && props[b]);
      const tot = bl.reduce((a, b) => a + BLOCKS[b].min, 0);
      for (const b of ORDER) { rowEls[b].cb.checked = chosen.has(b) && !!props[b]; rowEls[b].row.classList.toggle('on', rowEls[b].cb.checked); }
      go.textContent = bl.length ? `Commencer · ${tot} min` : 'Coche au moins un bloc';
      go.disabled = !bl.length;
    }
    card.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Loin du piano'), h('span', { class: 'sx-durwrap' }, h('span', { class: 'small muted' }, 'min'), seg)),
      h('p', { class: 'small mt-0 sx-intro' }, 'Cochés d’avance : les blocs faits il y a le plus longtemps. Avec des écouteurs, tout se fait dans les transports, sauf le chant.'),
      rows, h('div', { class: 'btn-row mt-1' }, go));
    wrap.append(card);
    refresh();
  }
  // la séance en cours : un bloc à la fois
  function runner(s, openId = null) {
    stopBlock();
    wrap.innerHTML = '';
    const frame = h('div', { class: 'w-frame warmup aw-run' });
    const sub = h('span', { class: 'w-sub' });
    frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, `Loin du piano · ${s.minutes} min`), sub));
    const tabs = h('div', { class: 'wu-steps', role: 'tablist', 'aria-label': 'Blocs' });
    tabs.style.gridTemplateColumns = `repeat(${s.blocks.length}, 1fr)`;
    const host = h('div', { class: 'wu-host' });
    const after = h('div', { class: 'wu-after' });
    frame.append(h('div', { class: 'w-body' }, tabs, host, after));
    const again = h('button', { class: 'btn ghost sm', type: 'button' }, 'Une autre séance loin du piano');
    again.addEventListener('click', () => { saveSess(null); builder(); });
    wrap.append(frame, h('div', { class: 'btn-row mt-1' }, again));
    let cur = null;
    const allDone = () => s.blocks.every(b => s.done[b]);
    const renderTabs = () => {
      tabs.innerHTML = '';
      s.blocks.forEach((b, i) => {
        const done = s.done[b];
        const t = h('button', { type: 'button', role: 'tab', class: 'wu-step' + (b === cur ? ' on' : '') + (done ? ' done' : ''), 'aria-selected': String(b === cur) },
          h('span', { class: 'wu-n' }, done ? '✓' : String(i + 1)), h('span', {}, h('b', {}, BLOCKS[b].label), h('small', {}, done ? 'fait' : `${BLOCKS[b].min} min`)));
        t.addEventListener('click', () => open(b));
        tabs.append(t);
      });
      const n = s.blocks.filter(b => s.done[b]).length;
      sub.textContent = allDone() ? 'faite' : `${n} sur ${s.blocks.length} fait${n > 1 ? 's' : ''}`;
    };
    const markDone = b => {
      if (s.done[b]) return;
      const t0 = s.opened[b] || Date.now();
      const min = Math.max(1, Math.min(BLOCKS[b].min * 3, Math.round((Date.now() - t0) / 60000) || BLOCKS[b].min));
      s.done[b] = min;
      saveSess(s);
      logAway(b, min);
      renderTabs();
      renderAfter();
      after.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    };
    const renderAfter = () => {
      after.innerHTML = '';
      const nxt = s.blocks.find(b => !s.done[b] && b !== cur) || s.blocks.find(b => !s.done[b]);
      if (cur === 'tete' && !s.done.tete) {
        // la pièce de tête se termine par « C’est fait » (avec la note pour le piano) ; les onglets permettent de passer
      } else if (cur && !s.done[cur]) {
        const fait = h('button', { class: 'btn', type: 'button' }, 'Fait');
        fait.addEventListener('click', () => markDone(cur));
        after.append(h('div', { class: 'btn-row' }, fait));
      } else if (!allDone() && nxt) {
        const go = h('button', { class: 'btn primary', type: 'button' }, `Bloc suivant : ${BLOCKS[nxt].label} (${BLOCKS[nxt].min} min)`);
        go.addEventListener('click', () => open(nxt));
        after.append(h('div', { class: 'btn-row' }, go));
      } else if (allDone()) {
        const tot = Object.values(s.done).reduce((a, x) => a + x, 0);
        after.append(h('div', { class: 'callout key wu-fin' }, h('div', { class: 'c-title' }, 'Séance loin du piano faite'),
          h('p', { class: 'small mb-0' }, `${tot} min. ${s.blocks.includes('tete') ? 'Au piano, la séance commencera par rejouer de mémoire la section travaillée de tête.' : 'Au piano, la séance reprendra où tu en es.'}`)));
      }
    };
    async function open(b) {
      stopBlock();
      cur = b;
      host.innerHTML = '';
      if (!s.opened[b]) { s.opened[b] = Date.now(); saveSess(s); }
      renderTabs();
      renderAfter();
      if (b === 'tete') {
        const p = props.tete;
        const pm = await import('./piecemap.js');
        const sec = (s.section && s.piece && pm.mapOf(s.piece)?.sections.find(x => x.id === s.section)) || p?.section;
        const pc = s.piece || p?.piece;
        if (!sec || !alive) { host.append(h('p', { class: 'small' }, 'Pas de section à travailler.')); return; }
        blockUn = mountMental(host, { piece: pc, section: sec, onDone: () => markDone('tete') });
      } else if (b === 'oreille') blockUn = mountEar(host, props.oreille, { onFinish: () => markDone('oreille') });
      else if (b === 'lecture') blockUn = mountReading(host, { onFinish: () => markDone('lecture') });
      else blockUn = mountTheory(host, props.theorie, { onFinish: () => markDone('theorie') });
    }
    open(openId || s.blocks.find(b => !s.done[b]) || s.blocks[0]);
  }

  (async () => {
    props = await awayProposals(L);
    if (!alive) return;
    // une section demandée depuis la page de la pièce : un bloc « de tête » sur cette section
    if (piece && section) {
      start(5, ['tete'], { piece, section });
      return;
    }
    const s = readSess();
    if (s && !s.blocks.every(b => s.done[b])) runner(s);
    else builder();
  })().catch(e => { wrap.append(h('p', { class: 'small' }, 'Indisponible : ' + e.message)); console.error(e); });
  return () => { alive = false; awayCtx.on = false; stopBlock(); };
}

/** Carte de l'accueil : ce que donneraient quelques minutes loin du piano, en une ligne. */
export function mountAwayCard(el) {
  let alive = true;
  const card = h('div', { class: 'card aw-card' });
  el.append(card);
  (async () => {
    const props = await awayProposals();
    if (!alive) return;
    const pace = getPace();
    const minutes = AWAY_DURATIONS.includes(store.get('ui.awayMin')) ? store.get('ui.awayMin') : (pace.away || 10);
    const s = readSess();
    const plan = s && !s.blocks.every(b => s.done[b]) ? s.blocks : awayPlan(minutes, props);
    const PHRASE = { tete: 'ta pièce de tête', oreille: 'l’oreille', lecture: 'le rythme et les notes', theorie: 'la théorie' };
    const parts = plan.map(b => (b === 'tete' && props.tete ? `ta pièce de tête (${esc(props.tete.section.name)})` : b === 'oreille' && props.oreille.info ? `l’oreille (trouve la note en ${esc(props.oreille.info.name)})` : PHRASE[b]));
    const txt = parts.length > 1 ? parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1] : parts[0] || '';
    card.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Loin du piano'), h('span', { class: 'small muted' }, s && !s.blocks.every(b => s.done[b]) ? 'en cours' : `${plan.reduce((a, b) => a + BLOCKS[b].min, 0)} min`)),
      h('p', { class: 'small mb-1', html: `${txt.charAt(0).toUpperCase()}${txt.slice(1)}. Dans les transports ou entre deux cours : avec des écouteurs, sans clavier.` }),
      h('div', { class: 'btn-row' }, h('a', { class: 'btn sm', href: '#/loin', html: (ICONS.play || '') + (s && !s.blocks.every(b => s.done[b]) ? 'Reprendre' : 'Commencer') })));
  })().catch(e => { console.warn(e); card.remove(); });
  return () => { alive = false; };
}
