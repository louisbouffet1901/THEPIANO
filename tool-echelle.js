// L'échelle de coordination (V9, « Tes 15 minutes », bloc C). Toujours à deux mains, mais simplifié : la main gauche
// tient la formule du cycle (basse et accord, valse, arpège) ; la main droite monte d'un palier rythmique à la fois
// (une note par mesure, avec la basse, tous les temps, deux par temps, à contretemps, libre), et à chaque palier,
// d'une seule note à des notes libres. Une seule difficulté nouvelle à la fois ; on monte après deux tours réussis
// de suite, on redescend après deux échecs. La main gauche est vérifiée attaque par attaque (impro-check.js : lhGrid) :
// entraînée par la droite, arrêtée pendant une note tenue, décalée.
// Recherche (claude/bilan-efficacite.md) : Wenderoth et al. 2003 (l'entraînement à deux mains réduit l'interférence,
// celui de chaque main seule non) ; Wickens et al. 2013 (la tâche entière, simplifiée, difficulté selon les réussites) ;
// Ibbotson et Morton 1981 (quand la coordination lâche, la main dominante prend le rythme).
import { h, esc, CHORDS, pc } from './util.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { ensureAbcjs } from './lazy.js';
import { mountImprov, IMPROV_PRESETS, buildTimeline, lhPlan, PATTERNS, ensureCadencePreset } from './tool-improv.js';
import { lhGridDetail } from './impro-check.js';

export const BPM_START = 52, BPM_MIN = 44, BPM_MAX = 72;
const ST = 'quinze.echelle';

/* ------------------------------------------------------------------ */
/* Les paliers                                                          */
/* ------------------------------------------------------------------ */
export const PALIERS = [
  { id: 'auto', name: 'Automatique', short: 'main gauche seule' },
  { id: 'ronde', name: 'Une par mesure', short: 'une note par mesure', rh: 'ronde' },
  { id: 'basse', name: 'Avec la basse', short: 'avec chaque basse', rh: 'avecBasse' },
  { id: 'temps', name: 'Tous les temps', short: 'une note par temps', rh: 'noires' },
  { id: 'deux', name: 'Deux par temps', short: 'des croches', rh: 'croches' },
  { id: 'contre', name: 'À contretemps', short: 'départs sur le « et »', rh: 'contretemps' },
  { id: 'libre', name: 'Libre', short: 'rythme libre' },
];
export const FREEDOM = [
  { id: 'une', name: 'Une seule note', what: 'une seule note, toujours la même : seul le rythme compte.' },
  { id: 'accord', name: 'Les notes de l’accord', what: 'les notes de l’accord en cours (son nom s’affiche au-dessus du clavier).' },
  { id: 'libre', name: 'Notes libres', what: 'libres : notes de passage et broderies permises, une note de l’accord sur les temps forts.' },
];
const arp = k => k.formula === 'arpege' || k.formula === 'alberti';
/** Le palier 5 contre une main gauche en croches : le rythme pointé (une attaque hors de sa grille). */
const paletteName = (p, k) => (p === 5 && arp(k) ? 'Pointé' : PALIERS[p].name);
export const rhKind = (p, k) => (p === 5 && arp(k) ? 'pointe' : PALIERS[p].rh || null);

/** Ce que fait la main droite au palier p, et pourquoi (selon la mesure et la formule). */
export function palierText(p, k) {
  const m3 = k.meter === 3;
  const T = [
    { what: `Ta formule seule. Premier tour : compte les temps à voix haute (« 1, 2, 3${m3 ? '' : ', 4'} »). Deuxième tour : dis les accords à la place (« un, quatre, cinq-sept, un »).`,
      why: 'Si la formule tourne pendant que tu parles, elle ne demande plus d’attention : ta main droite pourra la prendre. C’est le test d’automatisme.' },
    { what: m3 ? 'Une blanche pointée au premier temps, avec la basse ; tiens-la pendant que ta main gauche continue.' : 'Une ronde au premier temps, avec la basse ; tiens-la pendant que ta main gauche continue.',
      why: 'La main gauche apprend à continuer quand la droite ne bouge plus : c’est là qu’elle a tendance à s’arrêter.' },
    { what: m3 ? 'Une blanche puis une noire, aux 1er et 3e temps : la droite attaque avec la basse et sur le dernier temps.' : 'Deux blanches, aux 1er et 3e temps : la droite attaque avec chaque basse.',
      why: 'Les deux mains attaquent ensemble : le rythme des deux mains reste celui de la main gauche.' },
    { what: `Une noire par temps : la droite avec chaque attaque de la gauche (${k.formula === 'valse' ? 'la basse, puis les accords' : 'la basse, puis l’accord'}).`,
      why: 'Un contre un : les mains ensemble à chaque temps, sans attaque en plus.' },
    { what: arp(k) ? 'Des croches avec les croches de la main gauche : deux notes par temps, ensemble.' : 'Des croches : deux notes par temps. La droite a maintenant des attaques que la gauche n’a pas.',
      why: arp(k) ? 'Les deux mains en croches : même grille, mais deux lignes indépendantes.' : 'C’est ici que la gauche commence à se laisser entraîner : elle garde un temps pendant que la droite en fait deux.' },
    arp(k)
      ? { what: 'Croche pointée et double croche : la double croche tombe juste avant le temps suivant, entre deux croches de la gauche.',
        why: 'Contre les croches régulières de la gauche, la droite place une attaque qui n’est pas sur sa grille : la gauche ne doit pas la suivre.' }
      : { what: 'À contretemps : pars sur le « et », tiens par-dessus le temps, laisse des silences sur le temps.',
        why: 'Le plus difficile : la droite attaque quand la gauche se tait. Si la gauche suit la droite, c’est ici que tu le verras.' },
    { what: 'Libre : mêle les valeurs comme tu veux, puis ajoute les ornements des leçons (broderie, passage, appoggiature).',
      why: 'L’improvisation : ta gauche tourne seule, ta droite invente.' },
  ];
  return T[p];
}

/** Les vérifications d'une prise au palier p, liberté f. */
export function checksFor(p, f, k) {
  const out = [{ k: 'lhGrid', formula: k.formula, min: 0.85 }];
  if (p === 0) return out;
  const rh = rhKind(p, k);
  if (rh) out.push({ k: 'rhGrid', v: rh });
  out.push(f === 0 ? { k: 'oneNote', min: 0.85 } : f === 1 ? { k: 'chordTones', min: 0.8 } : { k: 'strong', min: 0.6 });
  out.push({ k: 'nonstop', bars: 6 });
  return out;
}

/* ------------------------------------------------------------------ */
/* L'état : un par formule et par tonalité                              */
/* ------------------------------------------------------------------ */
export const keyIdOf = k => `${k.formula}:${k.tonic}${k.mode}${k.meter}`;
const all = () => store.get(ST) || {};
/** État de l'échelle dans une tonalité ; une tonalité nouvelle part deux paliers sous la meilleure de la même formule. */
export function echelleState(k) {
  const s = all()[keyIdOf(k)];
  if (s) return { p: 0, f: 0, bpm: BPM_START, streak: 0, fails: 0, hist: [], ...s };
  const same = Object.entries(all()).filter(([id]) => id.startsWith(k.formula + ':')).map(([, x]) => x.p || 0);
  const p = same.length ? Math.max(0, Math.max(...same) - 2) : 0;
  return { p, f: 0, bpm: BPM_START, streak: 0, fails: 0, hist: [], fresh: true };
}
function saveState(k, s) {
  const { fresh, ...rest } = s;
  store.set(ST, { ...all(), [keyIdOf(k)]: rest });
}
/**
 * Une prise réussie ou non : deux réussites de suite → liberté suivante, puis palier suivant (tempo −8) ;
 * deux échecs de suite → un cran en arrière. Le tempo monte de 4 à chaque réussite (72 au plus), descend de 4 à chaque échec.
 */
export function applyResult(s0, ok, now = Date.now()) {
  const s = { ...s0, hist: [...(s0.hist || []), { at: now, p: s0.p, f: s0.f, bpm: s0.bpm, ok: !!ok }].slice(-80) };
  let moved = null;
  if (ok) {
    s.streak = (s.streak || 0) + 1; s.fails = 0;
    s.bpm = Math.min(BPM_MAX, s.bpm + 4);
    if (s.streak >= 2) {
      s.streak = 0;
      if (s.p === 0) { s.p = 1; s.f = 0; s.bpm = Math.max(48, s.bpm - 8); moved = 'up'; }
      else if (s.f < 2) { s.f++; moved = 'free'; }
      else if (s.p < PALIERS.length - 1) { s.p++; s.f = 0; s.bpm = Math.max(48, s.bpm - 8); moved = 'up'; }
      else moved = 'top';
    }
  } else {
    s.fails = (s.fails || 0) + 1; s.streak = 0;
    s.bpm = Math.max(BPM_MIN, s.bpm - 4);
    if (s.fails >= 2) {
      s.fails = 0;
      if (s.f > 0) { s.f--; moved = 'down'; }
      else if (s.p > 0) { s.p--; s.f = s.p === 0 ? 0 : 2; moved = 'down'; }
    }
  }
  const b = s.best || { p: -1, f: -1 };
  if (s.p > b.p || (s.p === b.p && s.f > b.f)) s.best = { p: s.p, f: s.f };
  return { s, moved };
}
/** Résumé d'une tonalité : « palier 3 · une note par temps ». */
export function echelleSummary(k) {
  const s = echelleState(k);
  return { p: s.p, f: s.f, bpm: s.bpm, text: s.p === 0 ? 'palier 0 · main gauche seule' : `palier ${s.p} · ${PALIERS[s.p].short} · ${FREEDOM[s.f].name.toLowerCase()}` };
}

/* ------------------------------------------------------------------ */
/* L'exemple : la formule de la main gauche et le rythme de la droite   */
/* ------------------------------------------------------------------ */
// positions de la main droite (en temps) et durées, par palier et par mesure
const RH_POS = {
  4: [null, [[0, 4]], [[0, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [3, 1]], [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(x => [x, 0.5]),
    [[0.5, 1], [1.5, 1], [2.5, 1], [3.5, 0.5]], [[0, 1.5], [1.5, 0.5], [2, 0.5], [2.5, 0.5], [3, 1]]],
  3: [null, [[0, 3]], [[0, 2], [2, 1]], [[0, 1], [1, 1], [2, 1]], [0, 0.5, 1, 1.5, 2, 2.5].map(x => [x, 0.5]),
    [[0.5, 1], [1.5, 1], [2.5, 0.5]], [[0, 1.5], [1.5, 0.5], [2, 1]]],
};
const DOTTED = m => Array.from({ length: m }, (_, b) => [[b, 0.75], [b + 0.75, 0.25]]).flat();
const rhPositions = (p, k) => (p === 5 && arp(k) ? DOTTED(k.meter) : (RH_POS[k.meter] || RH_POS[4])[p]);
// la même chose en ABC (L:1/8), pour la voir
const RH_ABC = {
  4: [null, 'B8', 'B4 B4', 'B2 B2 B2 B2', 'BB BB BB BB', 'z B2 B2 B2 B', 'B3 B B B B2'],
  3: [null, 'B6', 'B4 B2', 'B2 B2 B2', 'BB BB BB', 'z B2 B2 B', 'B3 B B2'],
};
const rhAbc = (p, k) => (p === 5 && arp(k) ? Array(k.meter).fill('B3/2B/2').join(' ') : (RH_ABC[k.meter] || RH_ABC[4])[p]);
const lhAbc = k => (arp(k) ? Array(k.meter).fill('BB').join(' ') : Array(k.meter).fill('B2').join(' '));
/** La partition du rythme des deux mains (une mesure, deux portées d'une ligne). */
export function comboAbc(p, k) {
  const rh = rhAbc(p, k);
  return `X:1\nM:${k.meter}/4\nL:1/8\n%%score RH LH\nV:RH clef=perc stafflines=1 name="MD"\nV:LH clef=perc stafflines=1 name="MG"\nK:C\n[V:RH] ${rh ? `${rh} | ${rh} |]` : `z${k.meter * 2} | z${k.meter * 2} |]`}\n[V:LH] ${lhAbc(k)} | ${lhAbc(k)} |]\n`;
}
/** La note de l'exemple « une seule note » : la quinte de la tonalité, au-dessus du do central. */
const oneNoteOf = k => { let m = 60 + ((k.tonic + 7) % 12); if (m < 64) m += 12; return m; };
const nearestChordTone = (ch, prev) => {
  const pcs = CHORDS[ch.q].iv.map(x => (ch.root + x) % 12);
  let best = null;
  for (let m = 64; m <= 79; m++) if (pcs.includes(pc(m)) && (best == null || Math.abs(m - prev) < Math.abs(best - prev))) best = m;
  return best ?? prev;
};
export function presetFor(k) { return ensureCadencePreset(k.tonic, k.mode, k.meter); }

let exampleTimer = null;
function stopExample() { audio.stopAll('echelle'); audio.release('echelle'); clearTimeout(exampleTimer); exampleTimer = null; }
/** Joue deux mesures : la formule de main gauche et le rythme du palier à la main droite. */
export async function playExample(k, p, f, bpm, { bars = 2 } = {}) {
  await audio.ensure();
  stopExample();
  audio.claim('echelle', stopExample);
  const P = IMPROV_PRESETS[presetFor(k)];
  const tl = buildTimeline(P);
  const plan = lhPlan(tl);
  const spb = 60 / bpm;
  const t0 = audio.now() + 0.2;
  const note = (m, at, d, vel = 50) => { const vo = audio.noteOn(m, vel, at, { owner: 'echelle' }); if (vo) audio.noteOff(vo, at + d); };
  const pat = PATTERNS['mg-' + k.formula] || PATTERNS['mg-basse-accord'];
  let prev = 72;
  for (let i = 0; i < bars; i++) {
    const ch = tl[i % tl.length];
    const t = t0 + i * P.meter * spb;
    pat({ v: { lh: plan[i % tl.length] }, t, beats: ch.beats, spb, dur: ch.beats * spb, note, meter: P.meter, part: null });
    for (const [pos, d] of rhPositions(p, k) || []) {
      const m = f === 0 ? oneNoteOf(k) : (prev = nearestChordTone(ch, prev));
      note(m, t + pos * spb, d * spb * 0.95, 66);
    }
  }
  exampleTimer = setTimeout(() => audio.release('echelle'), (bars * P.meter * spb + 1) * 1000);
}

/* ------------------------------------------------------------------ */
/* Le widget                                                            */
/* ------------------------------------------------------------------ */
/**
 * key : { tonic, mode, meter, formula, name } ; onTake(ok, moved) après chaque prise jugée.
 * Renvoie la fonction de nettoyage.
 */
export function mountEchelle(el, { key, onTake } = {}) {
  const k = key;
  let s = echelleState(k);
  if (s.fresh) saveState(k, s);
  let alive = true, improUn = null, mountedFor = null;
  const frame = h('div', { class: 'w-frame echelle' });
  const sub = h('span', { class: 'w-sub' });
  frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Échelle de coordination'), sub));
  const ladder = h('ol', { class: 'ech-ladder', 'aria-label': 'Les paliers' });
  const card = h('div', { class: 'ech-card' });
  const res = h('div', { class: 'ech-res', 'aria-live': 'polite', hidden: true });
  const host = h('div', { class: 'ech-host' });
  frame.append(h('div', { class: 'w-body' }, ladder, card, res, host));
  el.append(frame);

  const renderLadder = () => {
    ladder.innerHTML = '';
    PALIERS.forEach((P, i) => {
      const done = (s.best?.p ?? -1) > i || (i < s.p);
      ladder.append(h('li', { class: 'ech-step' + (i === s.p ? ' on' : '') + (done ? ' done' : ''), title: `${i}. ${paletteName(i, k)}` },
        h('span', { class: 'ech-n' }, done && i !== s.p ? '✓' : String(i)), h('span', { class: 'ech-l' }, paletteName(i, k))));
    });
    sub.textContent = `${k.name} · ${({ 'basse-accord': 'basse et accord', valse: 'valse', arpege: 'arpège', alberti: 'basse d’Alberti' })[k.formula] || k.formula} · ♩ = ${s.bpm}`;
  };
  const renderCard = () => {
    card.innerHTML = '';
    const T = palierText(s.p, k);
    const prio = s.p === 0 ? (s.streak ? 'Ce tour : dis les accords à voix haute.' : 'Ce tour : compte les temps à voix haute.')
      : (s.hist.length % 2 ? 'Ce tour : écoute surtout ta main droite.' : 'Ce tour : écoute surtout ta main gauche.');
    const need = s.streak ? 'Encore une réussite pour passer au cran suivant.' : 'Deux réussites de suite pour passer au cran suivant.';
    const ex = h('button', { class: 'btn sm', type: 'button' }, 'Écouter l’exemple');
    ex.addEventListener('click', () => playExample(k, s.p, s.f, s.bpm));
    const visual = h('div', { class: 'ech-abc', 'aria-label': 'Le rythme des deux mains' });
    card.append(...[
      h('div', { class: 'ech-title' }, h('b', {}, `Palier ${s.p} : ${paletteName(s.p, k)}`), s.p ? h('span', { class: 'ech-free' }, FREEDOM[s.f].name) : null),
      h('p', { class: 'ech-what' }, h('b', {}, s.p === 0 ? 'Main gauche seule : ' : 'Rythme de la main droite : '), s.p === 0 ? T.what : T.what.charAt(0).toLowerCase() + T.what.slice(1)),
      s.p ? h('p', { class: 'ech-what' }, h('b', {}, 'Notes : '), FREEDOM[s.f].what.charAt(0).toUpperCase() + FREEDOM[s.f].what.slice(1)) : null,
      h('p', { class: 'small ech-prio' }, prio, ' ', h('span', { class: 'muted' }, need)),
      visual,
      h('div', { class: 'btn-row' }, ex)].filter(Boolean));
    if (s.p === 4 || s.p === 5) {
      card.append(h('div', { class: 'callout tip ech-combo' }, h('div', { class: 'c-title' }, 'Le rythme des deux mains'),
        h('p', { class: 'small mb-0' }, 'Avant de jouer, une fois : tape-le sur le couvercle, main gauche et main droite, en le disant (« 1 et 2 et… »). Les deux mains font un seul rythme, à apprendre comme un seul.')));
    }
    card.append(h('details', { class: 'more' }, h('summary', {}, 'Pourquoi ce palier ?'), h('div', { class: 'more-body small' }, T.why,
      ' On ne change qu’une chose à la fois : le rythme de la main droite (les paliers), ou la liberté des notes (une note, les notes de l’accord, libre).')));
    ensureAbcjs().then(A => { if (alive && visual.isConnected) { try { A.renderAbc(visual, comboAbc(s.p, k), { staffwidth: 300, scale: 0.9, paddingtop: 0, paddingbottom: 0, paddingleft: 0, paddingright: 0, add_classes: true }); } catch (e) { visual.remove(); } } }).catch(() => visual.remove());
  };
  const renderResult = (r, A, moved) => {
    res.innerHTML = '';
    res.hidden = false;
    const D = A ? lhGridDetail(A, { formula: k.formula }) : null;
    const strip = D && D.bars.length ? h('div', { class: 'ech-bars', 'aria-label': 'Main gauche, mesure par mesure' }, ...D.bars.map((B, i) => {
      const cls = B.cap ? 'cap' : B.stop ? 'stop' : B.n && B.hit === B.n ? 'ok' : B.n && B.hit / B.n >= 0.75 ? 'mid' : 'miss';
      const tip = B.cap ? 'entraînée par la droite' : B.stop ? 'arrêtée' : `${B.hit}/${B.n} attaques en place`;
      return h('span', { class: 'eb ' + cls, title: `m. ${i + 1} : ${tip}` }, String(i + 1));
    })) : null;
    const MOVE = {
      up: `Palier suivant : ${s.p} · ${paletteName(s.p, k)}, sur une seule note. Le tempo redescend un peu (♩ = ${s.bpm}).`,
      free: `Même rythme, plus de liberté : ${FREEDOM[s.f].name.toLowerCase()}.`,
      down: 'Un cran en arrière, le temps de consolider. Ce n’est pas un recul : c’est la règle.',
      top: 'Dernier palier tenu : continue en montant le tempo, puis passe aux ornements des leçons.',
    };
    res.append(...[
      h('div', { class: 'ir-head ' + (r.ok ? 'ok' : 'todo') }, r.ok ? '✓ Réussi' : 'Pas encore'),
      h('ul', { class: 'cp-checks' }, ...r.lines.map(l => h('li', { class: l.ok ? 'ok' : 'todo' }, (l.ok ? '✓ ' : '→ ') + l.text))),
      strip ? h('div', { class: 'ech-strip' }, h('span', { class: 'small muted' }, 'Main gauche, mesure par mesure : '), strip,
        h('span', { class: 'ech-key small muted' }, h('i', { class: 'eb ok' }), 'en place', h('i', { class: 'eb cap' }), 'entraînée', h('i', { class: 'eb stop' }), 'arrêtée')) : null,
      D && Math.abs(D.bias) > 0.08 && !D.shift ? h('p', { class: 'small' }, `Ta main gauche arrive en moyenne un peu ${D.bias > 0 ? 'après' : 'avant'} le clic : cale ta basse sur lui.`) : null,
      moved ? h('p', { class: 'small ech-moved ' + moved }, MOVE[moved]) : null].filter(Boolean));
  };
  const mountImproFor = () => {
    const sig = `${s.p}:${s.f}`;
    if (mountedFor === sig && improUn) {
      // même palier : seul le tempo change (curseur de l'accompagnateur)
      const rng = host.querySelector('.improv input[type=range]');
      if (rng && +rng.value !== s.bpm) { rng.value = String(s.bpm); rng.dispatchEvent(new Event('input')); }
      return;
    }
    try { improUn?.(); } catch (e) { /* */ }
    host.innerHTML = '';
    mountedFor = sig;
    improUn = mountImprov(host, {
      title: s.p === 0 ? 'Ta main gauche, avec le clic' : 'Les deux mains, avec le clic',
      step: { preset: presetFor(k), mode: 'libre', loops: 2, lh: 'moi', formula: k.formula, bpm: s.bpm, checks: checksFor(s.p, s.f, k), hideResult: true },
      onResult: (r, ctx) => {
        if (!alive) return;
        const out = applyResult(s, r.ok);
        s = out.s;
        saveState(k, s);
        renderLadder();
        renderResult(r, ctx?.A, out.moved);
        // le nouveau palier : on remonte l'accompagnateur après la fin de la prise (pas pendant)
        setTimeout(() => { if (!alive) return; renderCard(); mountImproFor(); }, 60);
        onTake?.(r.ok, out.moved, s);
      },
    });
  };
  renderLadder();
  renderCard();
  mountImproFor();
  return () => { alive = false; stopExample(); try { improUn?.(); } catch (e) { /* */ } };
}
