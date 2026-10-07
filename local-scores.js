// Partitions importées par l'élève : gardées seulement sur cette tablette (IndexedDB), jamais publiées.
// Pour les pièces dont l'appli ne publie pas la partition. Une fois importée, la partition a les mêmes outils
// que les extraits des nocturnes : écoute, mode attente, en rythme, montée de tempo, analyse contre la partition.
import { h } from './util.js';
import { db } from './db.js';
import { ensureAbcjs } from './lazy.js';
import { ICONS } from './icons.js';
import { toast } from './toast.js';

const fmtDate = t => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
// identifiant des prises : la pièce et le titre (une partition réimportée retrouve ses prises)
const passageOf = rec => rec.passage || `local:${rec.piece}:${rec.title}`;

/** Résultat de conversion → champs à enregistrer. */
const fromConversion = (r, conv) => ({ abc: r.abc, title: r.title, qpm: r.qpm, bars: r.bars, pedal: r.pedal, pedalEnd: r.pedalEnd, pedalUp: r.pedalUp, warnings: r.warnings, conv });

/** Lit, convertit et vérifie un fichier ; renvoie l'enregistrement prêt à stocker. */
async function importFile(file, piece) {
  const { readScoreFile, musicXmlToAbc, abcInfo, CONVERTER_VERSION } = await import('./musicxml.js');
  const read = await readScoreFile(file);
  const base = file.name.replace(/\.[^.]+$/, '');
  let rec;
  if (read.kind === 'musicxml') {
    rec = { ...fromConversion(musicXmlToAbc(read.text, { title: base }), CONVERTER_VERSION), xml: read.text };
  } else {
    const i = abcInfo(read.text);
    rec = { abc: read.text, title: i.title || base, qpm: i.qpm, bars: null, warnings: [] };
  }
  await checkRenders(rec.abc);
  const id = `local-${piece}-${Date.now()}`;
  return { id, piece, source: read.kind, fileName: file.name, at: Date.now(), ...rec, passage: `local:${piece}:${rec.title}` };
}

/** Essai d'affichage et de lecture avant d'enregistrer (ou après reconversion). */
async function checkRenders(abc) {
  await ensureAbcjs();
  const { Score } = await import('./score.js');
  const test = h('div', { style: { position: 'absolute', left: '-10000px', top: '0', width: '800px' } });
  document.body.append(test);
  let sc;
  try { sc = new Score(test, abc, {}); } finally { test.remove(); }
  if (!sc.events.length) throw new Error('aucune note lue dans ce fichier');
  return sc.events.length;
}

/** Partition importée avec un convertisseur plus ancien : reconvertie depuis le fichier gardé. */
async function upgrade(rec) {
  if (rec.source !== 'musicxml' || !rec.xml) return rec;
  const { musicXmlToAbc, CONVERTER_VERSION } = await import('./musicxml.js');
  if ((rec.conv || 1) >= CONVERTER_VERSION) return rec;
  try {
    const next = { ...rec, ...fromConversion(musicXmlToAbc(rec.xml, { title: rec.title }), CONVERTER_VERSION), title: rec.title, passage: passageOf(rec) };
    await checkRenders(next.abc);
    await db.put('scores', next);
    return next;
  } catch (e) { console.warn('reconversion impossible', e); return rec; }
}

export function mountLocalScores(el, cfg = {}) {
  const piece = cfg.piece;
  const box = h('div', { class: 'local-scores' });
  el.append(box);
  let cleanups = [];
  let alive = true;
  let gen = 0; // dernier affichage demandé (un affichage plus ancien qui finit après est abandonné)
  const clear = () => { cleanups.forEach(f => { try { f(); } catch (e) { /* */ } }); cleanups = []; };

  const picker = (label, primary) => {
    // pas de filtre de type : sur Android, .musicxml et .mxl ne sont pas des types connus et seraient grisés
    const input = h('input', { type: 'file', hidden: true });
    const btn = h('button', { class: 'btn' + (primary ? ' primary' : ''), type: 'button' }, label);
    const status = h('p', { class: 'small mt-1 mb-0', role: 'status' });
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const f = input.files && input.files[0];
      input.value = '';
      if (!f) return;
      btn.disabled = true;
      status.textContent = 'Lecture de la partition…';
      try {
        const rec = await importFile(f, piece);
        await db.put('scores', rec);
        const nb = rec.bars ? `${rec.bars.length} mesures` : 'partition lue';
        toast(`Partition importée : ${nb}`, 'ok', 4000);
        if (alive) render();
      } catch (e) {
        console.warn(e);
        status.textContent = 'Import impossible : ' + (e.message || e);
        btn.disabled = false;
      }
    });
    return { btn, input, status };
  };

  async function render() {
    const my = ++gen;
    const stale = () => !alive || my !== gen;
    let list = (await db.all('scores')).filter(s => s.piece === piece).sort((a, b) => a.at - b.at);
    if (stale()) return;
    list = await Promise.all(list.map(upgrade));
    if (stale()) return;
    if (!list.length) {
      clear();
      box.replaceChildren();
      const p = picker('Importer ma partition', true);
      box.append(h('div', { class: 'callout tip' },
        h('div', { class: 'c-title', html: ICONS.bulb + 'Travailler sur ta partition dans l’appli' }),
        h('p', {}, cfg.intro || 'Importe la partition de la pièce : tu pourras l’écouter, la travailler par passages et faire analyser ton jeu note à note, comme pour les extraits du nocturne.'),
        h('p', { class: 'small' }, 'Format : MusicXML (.musicxml ou .mxl), le format d’échange de MuseScore, Finale, Sibelius et Dorico (dans MuseScore : Fichier → Exporter → MusicXML), ou ABC. Un PDF ou une photo ne suffisent pas : il faut la partition note à note. Le fichier reste sur cette tablette ; il n’est jamais publié.'),
        h('div', { class: 'btn-row' }, p.btn, p.input), p.status));
      return;
    }
    const [{ mountScore }] = await Promise.all([import('./score-widget.js'), ensureAbcjs()]);
    if (stale()) return;
    clear();
    box.replaceChildren();
    for (const s of list) {
      const host = h('div', { class: 'w' });
      box.append(host);
      if (s.warnings && s.warnings.length) host.append(h('div', { class: 'callout warn' }, h('div', { class: 'c-title', html: ICONS.alert + 'À savoir sur cette partition' }), h('ul', {}, s.warnings.map(w => h('li', {}, w)))));
      const sub = `${s.bars ? s.bars.length + ' mesures · ' : ''}importée le ${fmtDate(s.at)}`;
      const c = mountScore(host, { abc: s.abc, title: s.title, sub, qpm: s.qpm, startPct: 70, piece, passage: passageOf(s), bars: s.bars, pedal: s.pedal || undefined, pedalEnd: s.pedalEnd || undefined, pedalUp: s.pedalUp || undefined, analysis: false });
      if (typeof c === 'function') cleanups.push(c);
      const del = h('button', { class: 'btn ghost sm', type: 'button' }, 'Retirer cette partition');
      del.addEventListener('click', async () => {
        if (!confirm(`Retirer « ${s.title} » de la tablette ? Tes prises restent enregistrées : elles reviendront si tu réimportes la même partition.`)) return;
        try { await db.del('scores', s.id); } catch (e) { toast('Impossible de retirer la partition : ' + (e.message || e), 'err', 5000); return; }
        if (alive) render();
      });
      box.append(h('div', { class: 'btn-row mt-1 mb-2' }, del, h('span', { class: 'small muted' }, s.fileName || '')));
    }
    const p = picker('Importer une autre partition', false);
    box.append(h('div', { class: 'btn-row' }, p.btn, p.input), p.status);
  }

  render().catch(e => { console.error(e); box.textContent = 'Partitions importées indisponibles : ' + e.message; });
  return () => { alive = false; clear(); };
}
