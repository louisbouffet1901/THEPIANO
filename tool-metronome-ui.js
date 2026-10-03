// Interface du métronome (page Outils et encarts dans les leçons).
import { h } from './util.js';
import { sharedMetronome as M } from './metronome.js';

const TEMPO_WORDS = [[40, 'Largo'], [60, 'Larghetto'], [66, 'Adagio'], [76, 'Andante'], [108, 'Moderato'], [120, 'Allegretto'], [168, 'Allegro'], [200, 'Presto'], [999, 'Prestissimo']];
const word = bpm => TEMPO_WORDS.find(([b]) => bpm < b)?.[1] || '';

export function mountMetronome(el, cfg = {}) {
  if (cfg.bpm && !M.running) M.setBpm(cfg.bpm);
  if (cfg.beats && !M.running) M.beats = cfg.beats;
  if (cfg.sub && !M.running) M.sub = cfg.sub;
  const frame = h('div', { class: 'w-frame' });
  if (cfg.title !== false) frame.append(h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Métronome')));
  const body = h('div', { class: 'w-body' });
  frame.append(body);
  el.append(frame);

  const bpmEl = h('div', { class: 'metro-bpm' });
  const beatsEl = h('div', { class: 'beats' });
  const left = h('div', {}, bpmEl, beatsEl);
  const right = h('div', { class: 'grid', style: { gap: '10px' } });
  body.append(h('div', { class: 'metro' }, left, right));

  const playBtn = h('button', { class: 'btn primary lg', type: 'button' });
  const minus = h('button', { class: 'btn', type: 'button', 'aria-label': 'Moins vite' }, '−');
  const plus = h('button', { class: 'btn', type: 'button', 'aria-label': 'Plus vite' }, '+');
  const tap = h('button', { class: 'btn', type: 'button' }, 'Taper le tempo');
  const rng = h('input', { type: 'range', min: 30, max: 220, value: M.bpm, 'aria-label': 'Tempo' });
  right.append(h('div', { class: 'btn-row' }, playBtn, minus, plus, tap), h('label', { class: 'range' }, 'Tempo', rng));

  const beatsSel = h('select', {}, ...[2, 3, 4, 5, 6].map(n => h('option', { value: n, selected: M.beats === n }, `${n} temps`)));
  const subSel = h('select', {}, ...[[1, 'aucune'], [2, 'croches'], [3, 'triolets'], [4, 'doubles croches']].map(([v, l]) => h('option', { value: v, selected: M.sub === v }, l)));
  const muteSel = h('select', {}, h('option', { value: '' }, 'non'), h('option', { value: '2-1' }, '2 jouées, 1 muette'), h('option', { value: '1-1' }, '1 jouée, 1 muette'), h('option', { value: '2-2' }, '2 jouées, 2 muettes'));
  const ladderSel = h('select', {}, h('option', { value: '' }, 'non'), h('option', { value: '2-4' }, '+2 toutes les 4 mesures'), h('option', { value: '4-4' }, '+4 toutes les 4 mesures'), h('option', { value: '4-8' }, '+4 toutes les 8 mesures'));
  const f = (l, c) => h('label', { class: 'field' }, l, c);
  right.append(h('div', { class: 'grid cols-3', style: { gap: '10px' } }, f('Mesure', beatsSel), f('Subdivision', subSel), f('Mesures muettes', muteSel), f('Accélération progressive', ladderSel)));
  right.append(h('p', { class: 'small mb-0' }, 'Mesures muettes : le clic s’arrête par moments, tu dois garder la pulsation seul. Accélération : le tempo monte tout seul jusqu’à 40 au-dessus du départ.'));

  const render = () => {
    bpmEl.innerHTML = '';
    bpmEl.append(String(M.bpm), h('small', {}, word(M.bpm) + ' · battements par minute'));
    playBtn.textContent = M.running ? 'Arrêter' : 'Démarrer';
    playBtn.classList.toggle('on', M.running);
    rng.value = M.bpm;
    beatsEl.innerHTML = '';
    for (let i = 0; i < M.beats; i++) beatsEl.append(h('i', { class: i === 0 ? 'acc' : '' }));
  };
  const off = M.on((type, info) => {
    if (type === 'tick' && info.isBeat) {
      beatsEl.querySelectorAll('i').forEach((d, i) => { d.classList.toggle('on', i === info.beat && !info.muted); d.classList.toggle('mute', info.muted && i === info.beat); });
    } else render();
  });
  playBtn.addEventListener('click', () => { M.toggle(); render(); });
  minus.addEventListener('click', () => { M.setBpm(M.bpm - (M.bpm > 120 ? 4 : 2)); render(); });
  plus.addEventListener('click', () => { M.setBpm(M.bpm + (M.bpm >= 120 ? 4 : 2)); render(); });
  rng.addEventListener('input', () => { M.setBpm(+rng.value); render(); });
  beatsSel.addEventListener('change', () => { M.beats = +beatsSel.value; render(); });
  subSel.addEventListener('change', () => { M.sub = +subSel.value; });
  muteSel.addEventListener('change', () => { const v = muteSel.value; M.mute = v ? { play: +v.split('-')[0], silent: +v.split('-')[1] } : null; });
  ladderSel.addEventListener('change', () => { const v = ladderSel.value; M.ladder = v ? { step: +v.split('-')[0], bars: +v.split('-')[1], max: M.bpm + 40 } : null; });
  let taps = [];
  tap.addEventListener('click', () => {
    const now = performance.now();
    taps = taps.filter(t => now - t < 2500);
    taps.push(now);
    if (taps.length >= 3) {
      const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      M.setBpm(60000 / iv); render();
    }
  });
  render();
  return () => off();
}
