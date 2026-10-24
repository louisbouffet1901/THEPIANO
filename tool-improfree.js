// Improvisation (V7.5) : le carnet de formules (E2.9) et l'improvisation libre enregistrée (E2.10).
// - Carnet : une trouvaille de 1 à 4 mesures, gardée depuis l'accompagnateur (« Garder une formule »), nommée, réécoutée,
//   puis retrouvée au piano (même suite de notes, même rythme). État : improv.notebook = [{ id, name, preset, title, bpm,
//   meter, notes: [{ m, b, d }] (en temps depuis la première note), at, found }].
// - Improvisation libre : deux minutes enregistrées en MIDI (base IndexedDB, comme le filage), conseillées après dix jours
//   sans, réécoutées le lendemain avec trois questions : une idée ? une forme ? un sommet ? État : improv.free.last.
import { h } from './util.js';
import { store } from './store.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { logActivity } from './activity.js';
import { judgeEcho } from './impro-check.js';

const DAY = 864e5;
const fmtDur = s => `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')} s`;
const dateFr = t => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

/* ------------------------------------------------------------------ */
/* Carnet de formules                                                  */
/* ------------------------------------------------------------------ */
export const notebook = () => store.get('improv.notebook') || [];
/** Garde une formule (appelé par l'accompagnateur). notes : [{ m, b, d }] en temps ; le début est ramené à 0. */
export function saveFormula({ name, preset, title, bpm, meter, notes }) {
  if (!notes?.length) return null;
  const b0 = notes[0].b;
  const f = { id: 'f' + Date.now().toString(36), name: name || 'Sans nom', preset, title, bpm, meter, notes: notes.map(n => ({ m: n.m, b: Math.round((n.b - b0) * 100) / 100, d: Math.round(n.d * 100) / 100 })), at: Date.now() };
  store.set('improv.notebook', [f, ...notebook()].slice(0, 60));
  return f;
}
function playFormula(f) {
  audio.stopAll('notebook');
  const spb = 60 / (f.bpm || 72), t0 = audio.now() + 0.15;
  let end = 0;
  for (const n of f.notes) {
    const vo = audio.noteOn(n.m, 74, t0 + n.b * spb, { owner: 'notebook' });
    if (vo) audio.noteOff(vo, t0 + (n.b + Math.max(0.2, n.d)) * spb);
    end = Math.max(end, n.b + n.d);
  }
  return end * spb;
}

export function mountNotebook(el) {
  const card = h('div', { class: 'card nb-card' });
  el.append(card);
  let off = null, timer = null;
  const stopListen = () => { off?.(); off = null; clearTimeout(timer); };
  const render = () => {
    stopListen();
    const list = notebook();
    card.innerHTML = '';
    card.append(h('div', { class: 'card-top' }, h('span', { class: 'eyebrow' }, 'Ton carnet de formules'), h('span', { class: 'small muted' }, list.length ? `${list.length} formule${list.length > 1 ? 's' : ''}` : '')));
    if (!list.length) {
      card.append(h('p', { class: 'small mb-0' }, 'Quand une improvisation te plaît, touche « Garder une formule » sous l’accompagnateur : choisis une à quatre mesures, donne-leur un nom. Tu pourras la réécouter, puis la retrouver au piano : c’est ainsi qu’on se constitue un vocabulaire.'));
      return;
    }
    for (const f of list.slice(0, 20)) {
      const res = h('div', { class: 'small nb-res', 'aria-live': 'polite' });
      const listen = h('button', { class: 'btn sm ghost', type: 'button' }, 'Écouter');
      const find = h('button', { class: 'btn sm', type: 'button' }, 'La retrouver');
      const del = h('button', { class: 'btn sm ghost', type: 'button', title: 'Retirer du carnet' }, 'Retirer');
      listen.addEventListener('click', async () => { await audio.ensure(); playFormula(f); });
      find.addEventListener('click', () => {
        stopListen();
        if (midi.status !== 'ready') { res.textContent = 'Connecte d’abord le piano (en haut à droite).'; return; }
        res.textContent = `Joue-la de mémoire (${f.notes.length} notes) ; l’appli écoute.`;
        const played = [];
        let t0 = null;
        off = midi.on('noteon', ev => {
          if (t0 == null) t0 = ev.time;
          played.push({ m: ev.note, beat: (ev.time - t0) / (60000 / (f.bpm || 72)) });
          clearTimeout(timer);
          timer = setTimeout(() => {
            stopListen();
            const r = judgeEcho(played, { notes: f.notes.map(n => ({ m: n.m, t: n.b })) });
            res.innerHTML = (r.ok ? '<b>Retrouvée.</b> ' : '<b>Pas encore.</b> ') + r.lines.join(' ');
            if (r.ok) { const all = notebook().map(x => (x.id === f.id ? { ...x, found: Date.now() } : x)); store.set('improv.notebook', all); }
          }, played.length >= f.notes.length ? 900 : 2500);
        });
      });
      del.addEventListener('click', () => { store.set('improv.notebook', notebook().filter(x => x.id !== f.id)); render(); });
      card.append(h('div', { class: 'nb-row' },
        h('div', { class: 'nb-main' }, h('b', {}, f.name), h('div', { class: 'small muted' }, `${f.title || ''} · ${dateFr(f.at)}${f.found ? ' · retrouvée ✓' : ''}`)),
        h('div', { class: 'btn-row' }, listen, find, del), res));
    }
  };
  render();
  return () => { stopListen(); audio.stopAll('notebook'); };
}

/* ------------------------------------------------------------------ */
/* Improvisation libre enregistrée                                      */
/* ------------------------------------------------------------------ */
/** Conseillée après dix jours sans. */
export function freeDue(now = Date.now()) {
  const last = store.get('improv.free.last');
  return !last || now - last >= 10 * DAY;
}
const QUESTIONS = [['idee', 'Y a-t-il une idée (un motif qu’on reconnaît) ?'], ['forme', 'Y a-t-il une forme (un début, un retour, une fin) ?'], ['sommet', 'Y a-t-il un sommet, préparé, puis une détente ?']];

export function mountFreeImpro(el) {
  const card = h('div', { class: 'w-frame pm-filage nb-free' });
  card.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, 'Improvisation libre enregistrée'), h('span', { class: 'w-sub' }, 'deux minutes, tous les dix jours environ')));
  const body = h('div', { class: 'w-body' });
  card.append(body);
  el.append(card);
  let rec = null, timer = null, alive = true;
  const status = h('p', { class: 'small', 'aria-live': 'polite' });
  const go = h('button', { class: 'btn primary', type: 'button' }, 'Commencer');
  const list = h('div', { class: 'pm-filages' });
  body.append(h('p', { class: 'small mt-0' }, 'Deux minutes, sans t’arrêter et sans consigne : seul, ou sur une grille de l’accompagnateur ci-dessous. C’est le moment de tout réunir. Demain, réécoute-toi avec trois questions.'),
    h('div', { class: 'btn-row' }, go), status, list);
  const stopRec = async (save = true) => {
    clearInterval(timer);
    if (!rec) return;
    const take = rec.stop();
    rec = null;
    go.textContent = 'Commencer';
    go.classList.add('primary');
    if (!save || take.notes.length < 12) { status.textContent = take.notes.length ? 'Trop court : rien n’est gardé.' : ''; return; }
    const base = take.notes[0].on;
    const end = Math.max(...take.notes.map(n => n.off ?? n.on));
    const dur = (end - base) / 1000;
    const { db } = await import('./db.js');
    await db.put('takes', { improFree: true, at: Date.now(), notes: take.notes.map(n => [n.pitch, Math.round(n.on - base), Math.round((n.off ?? n.on) - base), n.vel]), pedal: take.pedal.map(p => [Math.round(p.t - base), p.down ? 1 : 0]), dur, n: take.notes.length });
    store.set('improv.free.last', Date.now());
    logActivity('impro', Math.max(1, Math.round(dur / 60)));
    status.textContent = `Gardée : ${fmtDur(dur)}. Réécoute-la demain.`;
    renderList();
  };
  go.addEventListener('click', async () => {
    if (rec) { await stopRec(true); return; }
    const { Recorder } = await import('./analysis-panel.js');
    if (midi.status !== 'ready') { status.textContent = 'Connecte d’abord le piano (en haut à droite) : l’improvisation s’enregistre en MIDI.'; return; }
    rec = new Recorder({ silenceMs: 20000, minNotes: 12, onAutoStop: () => stopRec(true), onFirstNote: () => { status.textContent = 'Enregistrement… deux minutes, puis « Terminer ».'; } });
    rec.start();
    go.textContent = 'Terminer et garder';
    go.classList.remove('primary');
    status.textContent = 'Prêt : commence quand tu veux. L’enregistrement s’arrête aussi après 20 secondes de silence.';
    const t0 = Date.now();
    timer = setInterval(() => { if (rec && rec.started) status.textContent = `Enregistrement… ${fmtDur((Date.now() - t0) / 1000)}${Date.now() - t0 >= 120000 ? ' : les deux minutes sont faites, termine ta phrase.' : ''}`; }, 1000);
  });
  async function renderList() {
    if (!alive) return;
    const { db } = await import('./db.js');
    let all = [];
    try { all = (await db.all('takes')).filter(t => t.improFree).sort((a, b) => b.at - a.at); } catch (e) { /* */ }
    list.innerHTML = '';
    if (!all.length) { list.append(h('p', { class: 'small muted' }, 'Pas encore d’improvisation libre.')); return; }
    // le lendemain : réécouter, trois questions
    const prev = all.find(t => !t.review && Date.now() - t.at >= DAY * 0.5 && new Date(t.at).toDateString() !== new Date().toDateString());
    if (prev) {
      const answers = {};
      const rows = QUESTIONS.map(([k, q]) => {
        const seg = h('div', { class: 'seg', role: 'group', 'aria-label': q });
        for (const [v, l] of [['oui', 'oui'], ['peu', 'un peu'], ['non', 'non']]) {
          const b = h('button', { type: 'button' }, l);
          b.addEventListener('click', () => { answers[k] = v; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
          seg.append(b);
        }
        return h('div', { class: 'nb-q' }, h('span', { class: 'small' }, q), seg);
      });
      const ta = h('textarea', { rows: 2, placeholder: 'Ce que tu gardes pour la prochaine fois (une idée à reprendre, une habitude à casser…)' });
      const save = h('button', { class: 'btn sm primary', type: 'button' }, 'Garder mes réponses');
      save.addEventListener('click', async () => { prev.review = { ...answers, note: ta.value.trim() }; await db.put('takes', prev); renderList(); });
      list.append(h('div', { class: 'callout tip' }, h('div', { class: 'c-title' }, `Réécoute ton improvisation du ${dateFr(prev.at)}`),
        h('p', { class: 'small' }, 'Avec un jour de recul, écoute-la comme celle de quelqu’un d’autre, puis réponds.'), ...rows, ta, h('div', { class: 'btn-row mt-1' }, replayBtn(prev), save)));
    }
    all.slice(0, 6).forEach(t => {
      const r = t.review;
      const sum = r ? QUESTIONS.map(([k]) => ({ idee: 'idée', forme: 'forme', sommet: 'sommet' }[k] + ' : ' + ({ oui: 'oui', peu: 'un peu', non: 'non' }[r[k]] || '—'))).join(' · ') : 'à réécouter';
      list.append(h('div', { class: 'wt-row' },
        h('div', { class: 'wt-date' }, new Date(t.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
        h('div', { class: 'wt-main' }, h('b', {}, fmtDur(t.dur || 0)), h('div', { class: 'small' }, sum), r?.note ? h('div', { class: 'small muted' }, `« ${r.note} »`) : null),
        replayBtn(t)));
    });
  }
  function replayBtn(t) {
    const btn = h('button', { class: 'btn sm ghost', type: 'button' }, 'Réécouter');
    btn.addEventListener('click', async () => {
      const { replayTake } = await import('./analysis-panel.js');
      if (btn.dataset.playing) { audio.stopAll('improfree'); delete btn.dataset.playing; btn.textContent = 'Réécouter'; return; }
      btn.dataset.playing = '1'; btn.textContent = 'Arrêter';
      const take = { notes: t.notes.map(([pitch, on, off, vel]) => ({ pitch, on, off, vel })), pedal: (t.pedal || []).map(([at, down]) => ({ t: at, down: !!down })) };
      const dur = await replayTake(take, 'improfree');
      setTimeout(() => { delete btn.dataset.playing; btn.textContent = 'Réécouter'; }, dur * 1000);
    });
    return btn;
  }
  renderList();
  return () => { alive = false; clearInterval(timer); if (rec) { try { rec.stop(); } catch (e) { /* */ } } };
}
