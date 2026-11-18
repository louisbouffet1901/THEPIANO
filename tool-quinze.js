// « Tes 15 minutes » (V9) : la page et la carte d'accueil.
// Un seul bouton, trois blocs de 5 minutes qui s'enchaînent, sur le matériel du cycle (quinze.js) :
// A. rythme à deux mains (tool-rhythm.js, mountRhythmHands) ; B. réflexes de théorie, accords dans la tonalité, puis un
// extrait de même armure (tool-reflexes.js, tool-sight.js) ; C. l'échelle de coordination (tool-echelle.js).
// Une consigne d'une ligne ; les explications sont repliées sous « Pourquoi ? ». Le minuteur compte le temps de travail :
// page visible, et une touche jouée ou un toucher dans la dernière minute. À 5 minutes, il invite au bloc suivant sans
// couper la prise en cours ; le lendemain, chaque outil reprend là où tu en étais (palier, niveau, étape).
import { h } from './util.js';
import { store } from './store.js';
import { midi } from './midi.js';
import { ensureAbcjs } from './lazy.js';
import * as Q from './quinze.js';

const IDLE_MS = 60 * 1000;
const SAVE_MS = 10 * 1000;
const PIECE = { title: 'Satie, Gymnopédie n° 1', url: 'https://imslp.org/wiki/3_Gymnop%C3%A9dies_(Satie,_Erik)' };

const TODO = {
  A: cyc => `La main gauche tient le temps sur une touche grave, puis joue sa formule (${cyc.formulaText}) ; la main droite tape le rythme écrit sur une touche aiguë. Aux premiers passages, dis « 1 e et a ».`,
  B: () => 'Une minute de réflexes, une minute d’accords dans la tonalité du jour, puis un extrait de même armure : nomme les accords de la main gauche, puis joue sans t’arrêter.',
  C: cyc => `Improvise à deux mains sur ta formule (${cyc.formulaText}), une difficulté à la fois : on monte après deux tours propres, on redescend après deux échecs.`,
};
const WHY = {
  A: [
    'Quand une main lit un rythme difficile, l’autre se cale sur elle : la main dominante prend le rythme, et la gauche suit la droite (Ibbotson et Morton, 1981). C’est ce qui t’arrive en improvisation, et cela s’entraîne.',
    'Ici, la main gauche tient le temps pendant que la droite lit. Le même exercice entraîne la lecture du rythme et l’indépendance des mains ; l’appli vérifie chaque main à part. Le clic s’allège par étapes (chaque temps, le premier temps seul, plus rien) : la pulsation passe dans le corps, pas dans l’attention.',
    'Au-delà des doubles croches : lis temps par temps (une cellule par temps, reconnue d’un coup), et construis par couches (« Par couches » : les notes sur les temps, puis celles du « et », puis toutes).',
  ],
  B: [
    'Tu comprends la théorie ; il reste à l’avoir sous les doigts. Relire donne l’impression de savoir ; ce qui installe une notion, c’est de devoir la retrouver, vite (Karpicke, Butler et Roediger, 2009). D’où des réponses chronométrées, au clavier.',
    'Chez les pianistes, reconnaître les accords d’un coup d’œil est la mesure la plus liée à la lecture à vue (Waters, Townsend et Underwood, 1998). On les lit dans une tonalité, avec l’armure, pour anticiper ce qui vient ; leur degré s’affiche après chaque réponse.',
    'L’extrait, de même armure, met les deux en pratique. Un jour sur trois, ta pièce de lecture remplace l’extrait : une pièce plus facile que tes morceaux, apprise sur la partition.',
  ],
  C: [
    'Travailler chaque main seule, puis les réunir d’un coup, prépare mal au jeu à deux mains. Ce qui marche : la tâche entière, simplifiée, dont la difficulté monte selon tes réussites (Wenderoth et al., 2003 ; Wickens et al., 2013).',
    'L’échelle n’augmente qu’une chose à la fois : le rythme de la main droite (les paliers) ou la liberté des notes (une note, les notes de l’accord, libre). Elle vérifie que ta main gauche garde sa formule, mesure par mesure : entraînée par la droite, arrêtée pendant une note tenue, ou décalée.',
  ],
};
const fmtClock = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const fmtMin = ms => { const m = Math.round(ms / 60000); return m < 1 ? 'moins d’une minute' : `${m} min`; };
const fmtSec = ms => (ms == null ? '—' : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);
const blockStatus = (p, id) => (p.done[id] ? '✓ 5 min' : p.t.ms[id] >= 30000 ? `encore ${Math.ceil((Q.BLOCK_MS - p.t.ms[id]) / 60000)} min` : '5 min');

/* ------------------------------------------------------------------ */
/* Le bilan du cycle : premier jour face à aujourd'hui                  */
/* ------------------------------------------------------------------ */
function cycleReport(snap) {
  const f = snap.first || {}, l = snap.last || {};
  const row = (label, a, b, fmt, better) => {
    const d = a != null && b != null && a !== b ? (better(b, a) ? ' up' : ' down') : '';
    return h('tr', { class: 'qz-m' + d }, h('th', {}, label), h('td', {}, fmt(a)), h('td', {}, fmt(b)));
  };
  return h('table', { class: 'qz-report' },
    h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, `1er jour`), h('th', {}, 'aujourd’hui'))),
    h('tbody', {},
      row('Échelle (impro à deux mains)', f.ech, l.ech, Q.echText, (x, y) => x > y),
      row('Rythme à deux mains', f.rhythm, l.rhythm, Q.rhythmText, (x, y) => x > y),
      row('Accords lus et joués', f.npm, l.npm, v => (v == null ? '—' : `${v} par minute`), (x, y) => x > y),
      row('Réflexes : temps de réponse', f.refMs, l.refMs, fmtSec, (x, y) => x < y)));
}

/* ------------------------------------------------------------------ */
/* La page                                                              */
/* ------------------------------------------------------------------ */
export function mountQuinze(el) {
  let p = Q.plan();
  Q.snapshot();
  const root = h('div', { class: 'quinze' });
  el.append(root);

  // en-tête : le cycle et le jour
  const head = h('div', { class: 'card qz-head' });
  const steps = h('div', { class: 'wu-steps qz-steps', role: 'tablist', 'aria-label': 'Les trois blocs' });
  const timer = h('div', { class: 'qz-timer', role: 'timer', 'aria-live': 'off' });
  const todo = h('p', { class: 'qz-todo' });
  const why = h('details', { class: 'more qz-why' });
  const host = h('div', { class: 'qz-host' });
  const after = h('div', { class: 'qz-after', 'aria-live': 'polite' });
  root.append(head, steps, timer, todo, why, host, after);

  let cur = null, cleanup = null, gen = 0, alive = true;
  let base = 0, acc = 0, lastAct = performance.now(), idle = false;

  const renderHead = () => {
    p = Q.plan();
    const { cyc, idx, key, c } = p;
    const k2 = cyc.keys[1], k1 = cyc.keys[0];
    head.replaceChildren(
      h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, `Cycle ${c.n} · jour ${Math.min(idx, Q.CYCLE_DAYS)} sur ${Q.CYCLE_DAYS}`),
        h('span', { class: 'small qz-total' }, p.allDone ? '✓ fait aujourd’hui' : `${fmtMin(p.total)} sur 15 aujourd’hui`)),
      h('h2', { class: 'qz-title' }, cyc.title),
      h('p', { class: 'small qz-key' }, h('b', {}, `Aujourd’hui : ${Q.keyLabel(key)}`), ` · main gauche : ${cyc.formulaText} · ${cyc.meter} temps`),
    );
    const det = h('details', { class: 'qz-cycle' }, h('summary', {}, 'Le cycle, en chiffres'),
      h('p', { class: 'small' }, `Jours 1 à 6 : ${Q.keyLabel(k1)} ; 7 à 12 : ${Q.keyLabel(k2)} ; ensuite les deux, en alternance. Théorie du cycle : ${cyc.theory}. Un jour compte dès une minute de travail.`),
      cycleReport(Q.snapshot()),
      h('p', { class: 'small muted' }, 'Chaque mesure : sa première valeur dans le cycle, face à la dernière. L’échelle compte le palier et la liberté des notes ; les accords et les réflexes, ta dernière minute dans les tonalités du cycle.'));
    // tes réponses à la question de la semaine, pour ce cycle
    const where = (store.get('quinze.where') || []).filter(w => w.cycle === c.n && !w.skipped && ((w.where || []).length || w.text));
    if (where.length) det.append(h('p', { class: 'small mb-0' }, h('b', {}, `Où tu as retrouvé ${cyc.notion} :`)),
      h('ul', { class: 'small qz-where-list' }, ...where.map(w => h('li', {}, new Date(w.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' : ' + [(w.where || []).join(', '), w.text].filter(Boolean).join(' ; ')))));
    det.open = p.finished;
    head.append(det);
    if (p.finished) {
      const next = Q.cycleDef(c.n + 1);
      const go = h('button', { class: 'btn primary sm', type: 'button' }, `Passer au cycle ${c.n + 1} : ${next.title.toLowerCase()}`);
      go.addEventListener('click', () => { flush(); Q.nextCycle(); Q.snapshot(); renderHead(); renderSteps(); open(Q.nextBlock(Q.plan())); });
      head.append(h('div', { class: 'callout key qz-end' }, h('div', { class: 'c-title' }, `Cycle ${c.n} terminé : ${Q.CYCLE_DAYS} jours de pratique`),
        h('p', { class: 'small' }, `Compare ton premier jour et aujourd’hui, dans « Le cycle, en chiffres ». Le cycle suivant : ${next.keys.map(Q.keyLabel).join(' et ')}, main gauche en ${next.formulaText}. Tu peux aussi rester sur celui-ci quelques jours.`), go));
    }
  };
  const renderSteps = () => {
    p = Q.plan();
    steps.replaceChildren(...Q.BLOCKS.map((b, i) => {
      const done = p.done[b.id];
      const btn = h('button', { type: 'button', role: 'tab', class: 'wu-step' + (b.id === cur ? ' on' : '') + (done ? ' done' : ''), 'aria-selected': String(b.id === cur) },
        h('span', { class: 'wu-n' }, done ? '✓' : b.id), h('span', {}, h('b', {}, b.short), h('small', {}, blockStatus(p, b.id))));
      btn.addEventListener('click', () => { if (b.id !== cur) open(b.id); });
      return btn;
    }));
  };
  // le minuteur : construit à l'ouverture d'un bloc, mis à jour sur place chaque seconde (un bouton recréé chaque seconde
  // perdrait des touchers)
  let tEls = null;
  const nextUndone = () => { const pp = Q.plan(); const i = Q.BLOCKS.findIndex(b => b.id === cur); return Q.BLOCKS.slice(i + 1).concat(Q.BLOCKS.slice(0, i)).find(b => !pp.done[b.id]) || null; };
  const buildTimer = () => {
    const b = Q.blockById(cur);
    const fill = h('i');
    const bar = h('span', { class: 'progress' }, fill);
    const clock = h('span', { class: 'qz-clock' });
    const go = h('button', { class: 'btn primary sm qz-go-next', type: 'button', hidden: true });
    go.addEventListener('click', () => { const nb = nextUndone(); if (nb) { open(nb.id); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    timer.replaceChildren(h('span', { class: 'qz-blk' }, `${b.id}. ${b.title}`), bar, clock, go);
    tEls = { fill, bar, clock, go };
    renderTimer();
  };
  const renderTimer = () => {
    if (!tEls) return;
    const ms = base + acc;
    const left = Q.BLOCK_MS - ms;
    tEls.fill.style.width = `${Math.min(100, (ms / Q.BLOCK_MS) * 100)}%`;
    tEls.bar.classList.toggle('ok', left <= 0);
    tEls.clock.className = 'qz-clock' + (idle ? ' idle' : '');
    tEls.clock.textContent = (left > 0 ? fmtClock(left) : '✓ 5 min') + (idle ? ' · en attente' : '');
    timer.title = idle ? 'Le minuteur attend : joue une note ou touche l’écran pour le relancer.' : 'Temps de travail du bloc (il s’arrête quand tu ne joues plus).';
    const nb = left <= 0 ? nextUndone() : null;
    tEls.go.hidden = !nb;
    if (nb) tEls.go.textContent = `Bloc ${nb.id} →`;
  };
  const flush = () => {
    if (!cur || acc <= 0) return;
    const { t, crossed } = Q.addTime(cur, acc);
    acc = 0;
    base = t.ms[cur];
    if (crossed) onBlockTime(); else renderSteps();
    Q.flushLog();
  };
  const onBlockTime = () => {
    Q.snapshot();
    renderSteps(); renderHead(); renderAfter();
  };
  const tick = () => {
    if (!alive || !cur || document.visibilityState !== 'visible') return;
    const wasIdle = idle;
    idle = performance.now() - lastAct > IDLE_MS;
    if (idle) { if (!wasIdle) renderTimer(); return; }
    const before = base + acc;
    acc += 1000;
    if (acc >= SAVE_MS || (before < Q.BLOCK_MS && before + 1000 >= Q.BLOCK_MS)) flush();
    renderTimer();
  };
  const activity = () => { lastAct = performance.now(); if (idle) { idle = false; renderTimer(); } };
  const offNote = midi.on('noteon', activity);
  root.addEventListener('pointerdown', activity, true);
  root.addEventListener('keydown', activity, true);
  const onVis = () => { if (document.visibilityState !== 'visible') { flush(); Q.flushLog(true); } else activity(); };
  document.addEventListener('visibilitychange', onVis);
  const iv = setInterval(tick, 1000);

  const renderAfter = () => {
    after.replaceChildren();
    p = Q.plan();
    const i = Q.BLOCKS.findIndex(b => b.id === cur);
    const nextB = Q.BLOCKS.slice(i + 1).concat(Q.BLOCKS.slice(0, i)).find(b => !p.done[b.id]);
    if (p.done[cur] && nextB) {
      const go = h('button', { class: 'btn primary', type: 'button' }, `Bloc suivant : ${nextB.id}. ${nextB.title}`);
      go.addEventListener('click', () => { open(nextB.id); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      after.append(h('div', { class: 'callout tip qz-next' }, h('div', { class: 'c-title' }, `5 minutes : bloc ${cur} fait`),
        h('p', { class: 'small' }, 'Finis ta prise si tu es au milieu, puis passe au bloc suivant. Ce bloc reprendra demain là où tu en es.'), go));
    } else if (p.allDone) {
      const box = h('div', { class: 'callout key qz-fin' }, h('div', { class: 'c-title' }, 'Tes 15 minutes sont faites'),
        h('p', { class: 'small' }, `Rythme, accords et improvisation, en ${Q.keyLabel(p.key)}. Le reste du temps est à toi : place à tes morceaux.`),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn primary', href: '#/pieces' }, 'Tes pièces'), h('a', { class: 'btn', href: '#/' }, 'Accueil')));
      after.append(box);
      if (Q.whereDue()) after.append(whereCard(p.cyc));
    }
  };

  async function open(id) {
    const my = ++gen;
    flush();
    cur = id;
    p = Q.plan();
    base = p.t.ms[id] || 0; acc = 0; idle = false; lastAct = performance.now();
    Q.setCurrent(id);
    try { cleanup?.(); } catch (e) { /* */ }
    cleanup = null;
    host.replaceChildren(h('p', { class: 'small muted' }, 'Chargement…'));
    todo.textContent = TODO[id](p.cyc);
    why.replaceChildren(h('summary', {}, 'Pourquoi ?'), h('div', { class: 'more-body' }, ...WHY[id].map(t => h('p', { class: 'small' }, t))));
    why.open = false;
    renderSteps(); buildTimer(); renderAfter();
    try {
      if (id === 'A') {
        const [m] = await Promise.all([import('./tool-rhythm.js'), ensureAbcjs()]);
        if (my !== gen || !alive) return;
        host.replaceChildren();
        cleanup = m.mountRhythmHands(host, { formula: p.cyc.formula, formulaText: p.cyc.formulaText,
          onPass: (good) => { Q.setResult('A', { good, at: Date.now() }); Q.snapshot(); } });
      } else if (id === 'B') {
        host.replaceChildren();
        cleanup = mountBlockB(host, p, () => my === gen && alive);
      } else {
        const [m] = await Promise.all([import('./tool-echelle.js'), ensureAbcjs()]);
        if (my !== gen || !alive) return;
        host.replaceChildren();
        const un1 = m.mountEchelle(host, { key: Q.echelleKey(p.cyc, p.key), onTake: (ok) => { Q.setResult('C', { ok, at: Date.now() }); Q.snapshot(); } });
        const un2 = mountBridge(host);
        cleanup = () => { un1?.(); un2?.(); };
      }
    } catch (e) {
      console.error(e);
      if (my === gen) host.replaceChildren(h('p', { class: 'callout warn' }, 'Ce bloc n’a pas pu s’ouvrir : ' + (e.message || e)));
    }
  }

  renderHead();
  open(Q.nextBlock(p));
  return () => {
    alive = false; gen++;
    clearInterval(iv);
    flush(); Q.flushLog(true); Q.snapshot();
    offNote?.();
    document.removeEventListener('visibilitychange', onVis);
    try { cleanup?.(); } catch (e) { /* */ }
  };
}

/* ------------------------------------------------------------------ */
/* Bloc B : réflexes, accords, puis un extrait (ou la pièce de lecture) */
/* ------------------------------------------------------------------ */
function mountBlockB(el, p, still) {
  const key = p.key;
  const pieceDay = p.idx % 3 === 0;
  const SUB = [
    { id: 'reflexes', label: 'Réflexes', sub: '1 min' },
    { id: 'accords', label: 'Accords', sub: '1 min' },
    { id: 'lire', label: pieceDay ? 'Ta pièce' : 'Un extrait', sub: '3 min' },
  ];
  let step = Math.min(2, p.t.bStep || 0), un = null, g = 0;
  const bar = h('div', { class: 'qz-sub', role: 'group', 'aria-label': 'Les trois temps du bloc B' });
  const box = h('div', { class: 'qz-subhost' });
  const next = h('div', { class: 'qz-subnext' });
  el.append(bar, box, next);
  const res = () => Q.todayState().res.B || {};
  const renderBar = () => {
    const r = res();
    bar.replaceChildren(...SUB.map((s, i) => {
      const done = r[s.id];
      const b = h('button', { type: 'button', class: (i === step ? 'on' : '') + (done ? ' done' : '') }, h('b', {}, `${i + 1}. ${s.label}`), h('small', {}, done ? done : s.sub));
      b.addEventListener('click', () => go(i));
      return b;
    }));
  };
  const mark = (id, text) => {
    const r = res();
    Q.setResult('B', { ...r, [id]: text });
    renderBar();
  };
  const offerNext = i => {
    next.replaceChildren();
    if (i >= SUB.length - 1) return;
    const s = SUB[i + 1];
    const b = h('button', { class: 'btn primary', type: 'button' }, `Ensuite : ${s.label.toLowerCase()} (${s.sub})`);
    b.addEventListener('click', () => go(i + 1));
    next.append(b);
  };
  async function go(i) {
    const my = ++g;
    step = i;
    Q.setCurrent('B', { bStep: i });
    try { un?.(); } catch (e) { /* */ }
    un = null;
    box.replaceChildren(); next.replaceChildren();
    renderBar();
    const s = SUB[i];
    if (s.id === 'reflexes' || s.id === 'accords') {
      const [m] = await Promise.all([import('./tool-reflexes.js'), ensureAbcjs()]);
      if (my !== g || !still()) return;
      un = m.mountReflexes(box, { mode: s.id, key, cycleN: p.c.n, maxAcc: Math.min(7, 3 + p.c.n), bare: false,
        onFinish: r => {
          mark(s.id, s.id === 'accords' ? `${r.npm} par minute` : `${r.ok} justes, ${fmtSec(r.avgMs)}`);
          Q.snapshot();
          offerNext(i);
        } });
      offerNext(-1);
    } else if (pieceDay && s.id === 'lire') {
      box.append(pieceCard(key, () => mark('lire', 'pièce lue')));
      const alt = h('button', { class: 'btn ghost sm', type: 'button' }, 'Plutôt un extrait aujourd’hui');
      alt.addEventListener('click', () => { box.replaceChildren(); mountExtract(); alt.remove(); });
      next.append(alt);
    } else mountExtract();
    async function mountExtract() {
      const [m, r] = await Promise.all([import('./tool-sight.js'), import('./tool-reflexes.js'), ensureAbcjs()]);
      if (my !== g || !still()) return;
      const K = r.keyInfo(key);
      const stored = String(store.get('sight.level') || '');
      un = m.mountSight(box, { levels: ['2', '3'], level: ['2', '3'].includes(stored) ? stored : '3', fifths: [K.fifths], prepSeconds: 20,
        title: `Un extrait avec l’armure de ${Q.keyLabel(key)}`,
        onResult: x => mark('lire', `${Math.round(x.accuracy * 100)} % justes`) });
    }
  }
  go(step);
  return () => { g++; try { un?.(); } catch (e) { /* */ } };
}
/** La pièce de lecture (un jour sur trois) : le protocole de déchiffrage, la partition sur IMSLP. */
function pieceCard(key, onDone) {
  const done = h('button', { class: 'btn primary sm', type: 'button' }, 'J’ai lu ma pièce aujourd’hui');
  done.addEventListener('click', () => { onDone(); done.disabled = true; done.textContent = '✓ Notée pour aujourd’hui'; });
  return h('div', { class: 'card qz-piece' },
    h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Ta pièce de lecture'), h('span', { class: 'small' }, 'un jour sur trois')),
    h('h3', {}, PIECE.title),
    h('p', { class: 'small' }, 'Plus facile que tes morceaux, apprise sur la partition, sans chercher à la savoir par cœur. Partition libre de droits : ',
      h('a', { href: PIECE.url, target: '_blank', rel: 'noopener' }, 'IMSLP'), '.'),
    h('p', { class: 'small mb-0' }, h('b', {}, 'Avant chaque nouvelle section (2 minutes) :')),
    h('ol', { class: 'small qz-proto' },
      h('li', {}, 'la tonalité : l’armure, le premier et le dernier accord ;'),
      h('li', {}, 'les accords de la main gauche, nommés sur quatre mesures (leur degré : I, IV, V7…) ;'),
      h('li', {}, 'ce qui se répète, et ce qui change ;'),
      h('li', {}, 'puis joue lentement, mains ensemble, sans t’arrêter.')),
    h('div', { class: 'btn-row' }, done));
}

/* ------------------------------------------------------------------ */
/* Bloc C : le pont avec tes morceaux (facultatif, replié)              */
/* ------------------------------------------------------------------ */
function mountBridge(el) {
  const det = h('details', { class: 'more qz-bridge' }, h('summary', {}, 'Pendant ton temps libre : improvise sur ta main gauche'));
  const body = h('div', { class: 'more-body' },
    h('p', { class: 'small' }, 'Joue de mémoire la main gauche d’une pièce que tu connais (ton nocturne op. 55, m. 1 à 8 ; ou la romance en mi mineur), déjà automatique, et invente une autre mélodie dessus. C’est le palier 6 sans effort de main gauche.'));
  det.append(body);
  el.append(det);
  let un = null;
  det.addEventListener('toggle', async () => {
    if (!det.open || un) return;
    const [m] = await Promise.all([import('./tool-improv.js'), ensureAbcjs()]);
    if (un || !det.isConnected) return;
    const host = h('div');
    body.append(host);
    un = m.mountImprov(host, { presets: ['nocturne-op55', 'romance-mi'], preset: 'nocturne-op55', lh: 'moi', title: 'Improvise sur ta main gauche' }) || (() => {});
  });
  return () => { try { un?.(); } catch (e) { /* */ } };
}

/* ------------------------------------------------------------------ */
/* La question de la semaine (facultative)                              */
/* ------------------------------------------------------------------ */
function whereCard(cyc) {
  const PLACES = ['ta pièce', 'la lecture', 'l’improvisation', 'ailleurs'];
  const picked = new Set();
  const txt = h('input', { type: 'text', class: 'qz-where-txt', placeholder: 'Une ligne, si tu veux (où, dans quelle mesure…)', 'aria-label': 'Où, en une ligne' });
  const save = h('button', { class: 'btn sm', type: 'button' }, 'Noter');
  const skip = h('button', { class: 'btn ghost sm', type: 'button' }, 'Pas cette semaine');
  const chips = h('div', { class: 'lvl-chips qz-where-chips' }, ...PLACES.map(pl => {
    const b = h('button', { type: 'button', class: 'lvl-chip' }, pl);
    b.addEventListener('click', () => { if (picked.has(pl)) picked.delete(pl); else picked.add(pl); b.classList.toggle('on', picked.has(pl)); });
    return b;
  }));
  const box = h('div', { class: 'card qz-where' }, h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Question de la semaine'), h('span', { class: 'small' }, 'facultative')),
    h('p', {}, `Où as-tu retrouvé ${cyc.notion} cette semaine ?`), chips, txt, h('div', { class: 'btn-row' }, save, skip));
  const close = msg => { box.replaceChildren(h('p', { class: 'small mb-0' }, msg)); };
  save.addEventListener('click', () => { Q.saveWhere({ notion: cyc.notion, where: [...picked], text: txt.value.trim() }); close('C’est noté : tes réponses sont dans « Le cycle, en chiffres », en haut de la page.'); });
  skip.addEventListener('click', () => { Q.saveWhere({ notion: cyc.notion, where: [], text: '', skipped: true }); close('D’accord : la question reviendra la semaine prochaine.'); });
  return box;
}

/* ------------------------------------------------------------------ */
/* La carte d'accueil                                                   */
/* ------------------------------------------------------------------ */
export function mountQuinzeCard(el) {
  const p = Q.plan();
  const label = p.allDone ? '✓ Fait aujourd’hui : place à tes morceaux' : p.total > 0 ? `Continuer : bloc ${Q.nextBlock(p)}` : 'Commencer';
  const card = h('a', { class: 'card qz-card' + (p.allDone ? ' done' : ''), href: '#/quinze' },
    h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Tes 15 minutes'), h('span', { class: 'small' }, `Cycle ${p.c.n} · jour ${Math.min(p.idx, Q.CYCLE_DAYS)} sur ${Q.CYCLE_DAYS}`)),
    h('h3', {}, `${p.cyc.title} · ${Q.keyLabel(p.key)}`),
    h('p', { class: 'small qz-card-sub' }, 'Avant tes morceaux : rythme à deux mains, accords, improvisation à deux mains. Cinq minutes chacun.'),
    h('div', { class: 'qz-mini' }, ...Q.BLOCKS.map(b => h('span', { class: 'qz-pill' + (p.done[b.id] ? ' done' : p.t.ms[b.id] > 0 ? ' part' : '') },
      h('b', {}, p.done[b.id] ? '✓' : b.id), ` ${b.short}`))),
    h('span', { class: 'btn ' + (p.allDone ? 'ghost' : 'primary') + ' qz-go' }, label));
  if (p.finished && !p.allDone) card.querySelector('.qz-card-sub').textContent = `Cycle ${p.c.n} terminé : regarde son bilan, puis passe au suivant (ou reste quelques jours).`;
  el.append(card);
  return () => card.remove();
}
