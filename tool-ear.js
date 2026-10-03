// Exercices d'oreille et de théorie : écoute, chant au micro, jeu au piano, rythme, lecture.
import { h, esc, pick, shuffle, randInt, fmtPct, noteNameFr, capitalize, median, isBlack, INTERVALS, CHORDS, SCALES, KEYS, midiToAbc, pc } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard } from './diagrams.js';
import { pitch, octaveDiff, sungName } from './pitch.js';

const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor"/></svg>';

/* ================================================================== */
/* Audio                                                               */
/* ================================================================== */
/** Joue une liste de notes {m, t, d, v} (secondes). Renvoie la durée totale en ms. */
async function playNotes(list) {
  audio.claim('quiz', () => audio.stopAll('quiz'));
  await audio.ensure();
  const t0 = audio.now() + 0.06;
  let end = 0;
  for (const n of list) {
    const v = audio.noteOn(n.m, n.v || 72, t0 + n.t, { owner: 'quiz' });
    if (v) audio.noteOff(v, t0 + n.t + n.d);
    end = Math.max(end, n.t + n.d);
  }
  return (0.06 + end) * 1000;
}
const stopAudio = () => audio.stopAll('quiz');

/* ================================================================== */
/* Données musicales                                                   */
/* ================================================================== */
const IV_LABEL = { 1: '2de m', 2: '2de M', 3: '3ce m', 4: '3ce M', 5: '4te J', 6: 'Triton', 7: '5te J', 8: '6te m', 9: '6te M', 10: '7e m', 11: '7e M', 12: '8ve' };
const IV_SHORT_TO_ST = { '2m': 1, '2M': 2, '3m': 3, '3M': 4, '4J': 5, 'Triton': 6, '5J': 7, '6m': 8, '6M': 9, '7m': 10, '7M': 11, '8ve': 12 };
/** Repères pour l'oreille (intervalles montants, sauf mention). */
const IV_REF = {
  1: '« Les Dents de la mer » (deux notes qui se frôlent)',
  2: '« Frère Jacques » (frè-re), « Au clair de la lune » (do-do-do-ré)',
  3: '« Smoke on the Water » ; en descendant : l’appel « cou-cou » (sol – mi)',
  4: '« Le Beau Danube bleu » (les trois premières notes) ; en descendant : la 5e symphonie de Beethoven',
  5: '« La Marseillaise » (Allons en-fants : en → fants) ; « Joyeux anniversaire » (« -ni-ver »)',
  6: '« Maria » (West Side Story) : instable, il veut bouger',
  7: '« Ah ! vous dirai-je, maman » (do-do-sol) ; le thème de Star Wars',
  8: '« The Entertainer » (le saut mi → do du début)',
  9: 'Nocturne op. 9 n° 2 de Chopin (si♭ → sol) ; « My Bonnie »',
  10: 'Le générique de « Star Trek » (série originale) ; « Somewhere » (West Side Story)',
  11: 'une octave moins un demi-ton : très tendue',
  12: '« Over the Rainbow » (Some-where)',
};
/* Orthographe des accords : chaque note prend la lettre attendue (tierces superposées). */
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], LETTER_PC = [0, 2, 4, 5, 7, 9, 11], LETTER_FR = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'];
const ROOT_LETTER = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6]; // do, ré♭, ré, mi♭, mi, fa, fa♯, sol, la♭, la, si♭, si
const IV_STEPS = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 4, 8: 4, 9: 6, 10: 6, 11: 6 };
const ACC_SIGN = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' }, ACC_ABC = { '-2': '__', '-1': '_', 0: '', 1: '^', 2: '^^' };
const ROOT_LETTER_OF = x => LETTER_FR.indexOf(x.fr.replace(/[♭♯𝄫𝄪]/g, ''));
/** Épelle un accord : [{ m, letter, acc, fr, abc }] (abc avec altération explicite). */
function spellChord(rootM, ivs, rootLetter = ROOT_LETTER[pc(rootM)]) {
  return ivs.map(iv => {
    const m = rootM + iv;
    const L = (rootLetter + IV_STEPS[iv % 12]) % 7;
    let acc = ((pc(m) - LETTER_PC[L]) % 12 + 12) % 12;
    if (acc > 6) acc -= 12;
    const nat = m - acc, oct = Math.floor(nat / 12) - 1;
    const body = oct >= 5 ? LETTERS[L].toLowerCase() + "'".repeat(oct - 5) : LETTERS[L] + ','.repeat(4 - oct);
    return { m, acc, fr: LETTER_FR[L] + ACC_SIGN[acc], abc: ACC_ABC[acc] + body };
  });
}
const CH_LABEL = { M: 'Majeur', m: 'Mineur', dim: 'Diminué', aug: 'Augmenté', '7': '7e de dominante', maj7: '7e majeure', m7: '7e mineure', hdim7: 'Demi-diminué (7e de sensible)', dim7: '7e diminuée' };
const SC_LABEL = { maj: 'Majeure', natMin: 'Mineure naturelle', harmMin: 'Mineure harmonique', melMin: 'Mineure mélodique' };
const CAD_LABEL = { parfaite: 'Parfaite', demi: 'Demi-cadence', plagale: 'Plagale', rompue: 'Rompue' };
const NOTE_BTNS = [['do', 0], ['ré', 2], ['mi', 4], ['fa', 5], ['sol', 7], ['la', 9], ['si', 11]];
export const DEG_NAMES = ['', 'tonique', 'sus-tonique', 'médiante', 'sous-dominante', 'dominante', 'sus-dominante', 'sensible', 'tonique'];
const DEG_FEEL = {
  maj: ['', 'le repos, la « maison » : tout peut s’arrêter ici.', 'une tension légère, qui retombe volontiers sur 1.', 'stable et lumineux : c’est elle qui rend la gamme majeure.',
    'penche vers 3, juste en dessous : une tension douce.', 'stable mais ouvert, comme une porte : on peut s’arrêter, on attend pourtant la suite.',
    'doux, un peu mélancolique ; il aime redescendre vers 5.', 'la sensible : très tendue, elle veut monter vers 8.', 'la tonique, une octave plus haut.'],
  min: ['', 'le repos, la « maison ».', 'une tension légère, qui retombe sur 1.', 'stable mais sombre : la tierce mineure fait le mode mineur.',
    'penche vers 3.', 'stable et ouvert.', 'sombre et pesant, attiré par 5, un demi-ton plus bas.', 'la sensible : un demi-ton sous la tonique, elle veut monter.', 'la tonique, une octave plus haut.'],
};

/* Cadences : voicings en do majeur / la mineur */
const VOICE_MAJ = { I: [48, 64, 67, 72], ii: [50, 65, 69, 74], IV: [53, 65, 69, 72], V: [43, 62, 67, 71], V7: [43, 62, 65, 71], vi: [45, 64, 69, 72] };
const VOICE_MIN = { i: [45, 60, 64, 69], iv: [50, 62, 65, 69], V: [40, 59, 64, 68], V7: [40, 59, 62, 68], VI: [41, 60, 65, 69] };
const CAD_TEMPLATES = {
  maj: { parfaite: ['I', 'IV', 'V7', 'I'], demi: ['I', 'vi', 'IV', 'V'], plagale: ['I', 'vi', 'IV', 'I'], rompue: ['I', 'IV', 'V7', 'vi'] },
  min: { parfaite: ['i', 'iv', 'V7', 'i'], demi: ['i', 'VI', 'iv', 'V'], plagale: ['i', 'VI', 'iv', 'i'], rompue: ['i', 'iv', 'V7', 'VI'] },
};
/** Cadence I – IV – V7 – I (ou i – iv – V7 – i) transposée de tr demi-tons ; t0 et durée par accord en s. */
function cadenceNotes(tr, mode = 'maj', t0 = 0, dur = 0.6) {
  const V = mode === 'maj' ? VOICE_MAJ : VOICE_MIN;
  const seq = mode === 'maj' ? ['I', 'IV', 'V7', 'I'] : ['i', 'iv', 'V7', 'i'];
  const out = [];
  seq.forEach((c, i) => V[c].forEach(m => out.push({ m: m + tr, t: t0 + i * dur, d: i === 3 ? dur * 1.5 : dur * 0.95, v: 62 })));
  return { notes: out, end: t0 + 3 * dur + dur * 1.5 };
}
const scaleOf = mode => (mode === 'min' ? SCALES.harmMin : SCALES.maj);
const degOffset = (d, mode) => (d === 8 ? 12 : scaleOf(mode)[d - 1]);

/* Orthographe des gammes (noms de notes justes selon la tonalité) */
const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LET_FR = { C: 'do', D: 'ré', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
const LPC = [0, 2, 4, 5, 7, 9, 11];
const ACC_FR = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
const MAJ_NAME = { 0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F', 6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B' };
const MIN_NAME = { 0: 'Cm', 1: 'C#m', 2: 'Dm', 3: 'Ebm', 4: 'Em', 5: 'Fm', 6: 'F#m', 7: 'Gm', 8: 'G#m', 9: 'Am', 10: 'Bbm', 11: 'Bm' };
/** Noms français des 7 degrés d'une tonalité (clé de KEYS : 'D', 'Bb', 'F#m'…). Mineur : forme harmonique. */
export function spelledScale(key) {
  const minor = key.endsWith('m');
  const base = minor ? key.slice(0, -1) : key;
  const li = LET.indexOf(base[0]);
  const tAcc = base[1] === '#' ? 1 : base[1] === 'b' ? -1 : 0;
  const tpc = (LPC[li] + tAcc + 12) % 12;
  const iv = minor ? SCALES.harmMin : SCALES.maj;
  return iv.map((x, k) => {
    const L = LET[(li + k) % 7];
    let acc = ((tpc + x) - LPC[(li + k) % 7]) % 12;
    if (acc > 6) acc -= 12;
    if (acc < -6) acc += 12;
    return LET_FR[L] + ACC_FR[acc];
  });
}
const keyNameFor = (tonicPc, mode) => (mode === 'min' ? MIN_NAME : MAJ_NAME)[((tonicPc % 12) + 12) % 12];
const keyFr = (tonicPc, mode) => KEYS[keyNameFor(tonicPc, mode)].fr;

/* ================================================================== */
/* Rythme                                                              */
/* ================================================================== */
const RCELLS = {
  w: { d: 4, on: [0], abc: 'B8' }, hd: { d: 3, on: [0], abc: 'B6' }, h: { d: 2, on: [0], abc: 'B4' }, q: { d: 1, on: [0], abc: 'B2' },
  qr: { d: 1, on: [], abc: 'z2', rest: true }, hr: { d: 2, on: [], abc: 'z4', rest: true },
  ee: { d: 1, on: [0, 0.5], abc: 'BB' }, er_e: { d: 1, on: [0.5], abc: 'zB' }, qd_e: { d: 2, on: [0, 1.5], abc: 'B3B' },
  e_q_e: { d: 2, on: [0, 0.5, 1.5], abc: 'BB2B' }, ssss: { d: 1, on: [0, 0.25, 0.5, 0.75], abc: 'B/B/B/B/' },
  e_ss: { d: 1, on: [0, 0.5, 0.75], abc: 'BB/B/' }, ss_e: { d: 1, on: [0, 0.25, 0.5], abc: 'B/B/B' }, ed_s: { d: 1, on: [0, 0.75], abc: 'B3/B/' },
  trip: { d: 1, on: [0, 1 / 3, 2 / 3], abc: '(3BBB' },
};
function genRhythm(meter, bars, cells) {
  for (let tries = 0; tries < 200; tries++) {
    const seq = [];
    let ok = true;
    for (let b = 0; b < bars && ok; b++) {
      let pos = 0;
      while (pos < meter) {
        const fit = cells.filter(c => {
          const C = RCELLS[c];
          if (!C || C.d > meter - pos) return false;
          if (C.d === 2 && meter === 4 && pos % 2) return false;
          if (C.d >= 3 && pos !== 0) return false;
          if (C.rest && b === 0 && pos === 0) return false;
          return true;
        });
        if (!fit.length) { ok = false; break; }
        const c = pick(fit);
        seq.push({ id: c, bar: b, pos, ...RCELLS[c] });
        pos += RCELLS[c].d;
      }
    }
    if (!ok) continue;
    const onsets = seq.flatMap(c => c.on.map(o => c.bar * meter + c.pos + o));
    const distinct = new Set(seq.map(c => c.id)).size;
    if (onsets.length >= 2 && (distinct > 1 || cells.length === 1 || meter * bars < 4)) return { seq, onsets };
  }
  const seq = [];
  for (let b = 0; b < bars; b++) for (let p = 0; p < meter; p++) seq.push({ id: 'q', bar: b, pos: p, ...RCELLS.q });
  return { seq, onsets: seq.map(c => c.bar * meter + c.pos) };
}
function rhythmAbc(seq, meter, bars) {
  let s = '';
  for (let b = 0; b < bars; b++) s += seq.filter(c => c.bar === b).map(c => c.abc).join(' ') + (b === bars - 1 ? ' |]' : ' | ');
  return `X:1\nM:${meter}/4\nL:1/8\nK:C clef=perc\n${s}`;
}

/* ================================================================== */
/* Conseils                                                            */
/* ================================================================== */
const TIPS = {
  highlow: ['Chante (ou fredonne) les deux notes : ta voix sent très bien si elle monte ou si elle descend.', 'Imagine un ascenseur : la deuxième note est-elle un étage au-dessus ou en dessous ?', 'Les petits écarts sont difficiles pour tout le monde au début. Réécoute autant que tu veux : c’est en comparant qu’on progresse.'],
  contour: ['Dessine le chemin avec la main pendant l’écoute : elle monte, elle descend.', 'Fredonne la mélodie à mi-voix : ta voix retrouve le dessin plus vite que ta tête.', 'Concentre-toi d’abord sur la note la plus haute (ou la plus basse) : où se trouve-t-elle ?'],
  sing: ['Avant de chanter, entends la note dans ta tête pendant une seconde de silence.', 'Commence bouche fermée (« mmm ») : c’est plus facile de trouver la hauteur, puis ouvre sur « la ».', 'Trop bas ou trop haut ? Ne force pas : glisse doucement, comme une sirène, jusqu’à ce que l’aiguille se centre.', 'Chante dans ton octave confortable : peu importe que tu sois une octave en dessous du piano.', 'Respire avant de chanter, puis tiens le son calmement, sans pousser : un son tenu et détendu est plus juste.', 'Fais d’abord la note au piano, puis chante-la en même temps, puis seul : c’est l’ordre naturel.'],
  degree: ['Juste après la cadence, chante intérieurement la tonique (1) et garde-la en tête.', 'Après ta réponse, écoute la résolution : la note glisse vers 1 (ou vers 8). C’est ce chemin que ton oreille apprend.', 'N’essaie pas de calculer l’intervalle : écoute l’effet. 1 repos, 3 lumineux, 5 ouvert, 7 tendu vers le haut.', 'Si tu hésites, chante depuis 1 en montant (1, 2, 3…) jusqu’à retrouver la note.', 'Le sens de la résolution est un indice : une note qui veut descendre vers 1 est 2, 3 ou 4 ; une note qui veut monter vers 8 est 7 (ou 6).'],
  echo: ['Chante la mélodie avant de la jouer : si tu peux la chanter, tu peux la retrouver.', 'Repère d’abord la direction (monte, descend), puis la taille des pas : notes voisines ou saut.', 'Écoute la dernière note : très souvent, elle revient sur la tonique.', 'Ne cherche pas au hasard sur le clavier : pense en degrés (1, 2, 3…), puis joue.'],
  rhythm: ['Compte les temps à voix basse (« 1, 2, 3, 4 ») pendant l’écoute.', 'Chante le rythme sur « ta » avant de le taper.', 'Les croches se comptent « 1 et 2 et » : la deuxième croche tombe sur le « et ».', 'Bouge un peu avec la pulsation (le pied, la tête) : le rythme se place tout seul par rapport à elle.', 'Une note longue continue de compter : ne la raccourcis pas, attends le temps suivant.'],
  intervals: ['Associe chaque intervalle à un début de chanson que tu connais bien (voir les repères).', 'Chante les deux notes, puis remplis l’espace entre elles (do-ré-mi pour une tierce) : tu comptes les marches.', 'Écoute aussi la couleur : la quinte est vide et stable, la tierce majeure lumineuse, la tierce mineure plus sombre.'],
  chords: ['Majeur : clair et stable ; mineur : plus sombre, plus doux ; diminué : serré, inquiet ; augmenté : flottant, sans repos.', 'Chante l’arpège de l’accord (1-3-5) : c’est la tierce, au milieu, qui fait la différence entre majeur et mineur.', 'Écoute d’abord l’arpège, puis l’accord : l’arpège te donne les notes, l’accord la couleur.'],
  sevenths: ['La 7e de dominante est tendue et veut avancer ; la 7e majeure est douce et rêveuse ; la 7e mineure est souple ; la 7e diminuée est dramatique, comme un roulement de tonnerre.', 'Repère d’abord si l’accord de base est majeur ou mineur, puis écoute la 7e tout en haut de l’arpège : à un demi-ton (7e majeure) ou à un ton (7e mineure) de l’octave ?'],
  cadences: ['Concentre-toi sur la fin : repos complet (parfaite), suspension (demi-cadence), « amen » doux (plagale) ou surprise (rompue) ?', 'Chante la tonique pendant l’écoute : si le dernier accord la contient et repose, c’est une fin.', 'La rompue trompe l’oreille : on attend le repos, et l’accord final est mineur.'],
  scales: ['Écoute surtout le haut de la gamme : la seconde augmentée de la mineure harmonique (6-7) est très reconnaissable.', 'Majeure : la tierce est majeure (3 lumineux) ; les mineures ont une tierce mineure.'],
  chordfunc: ['Écoute la basse : de 1 à 4 elle monte d’une quarte, de 1 à 5 d’une quinte, de 1 à 6 elle descend d’une tierce.', 'IV sonne ouvert et chaleureux, V tendu (on attend le retour), vi plus sombre (mineur).'],
  notes: ['Apprends trois notes-repères par clé, puis lis les autres par voisinage (ligne → interligne → ligne).', 'Clé de sol : sol sur la 2e ligne ; clé de fa : fa sur la 4e ligne.'],
  keysig: ['Dièses : la tonique majeure est un demi-ton au-dessus du dernier dièse. Bémols : c’est l’avant-dernier bémol.', 'La relative mineure est une tierce mineure plus bas que la tonique majeure.'],
  intervalsight: ['Compte d’abord les noms de notes, les deux extrémités comprises (do-mi : do, ré, mi = tierce).', 'Puis compte les demi-tons pour la qualité, ou compare à la gamme majeure de la note du bas.', 'Ligne-ligne ou interligne-interligne : tierce, quinte ou septième ; ligne-interligne : seconde, quarte, sixte ou octave.'],
  measurefill: ['Compte en croches : une noire = 2, une blanche = 4, une ronde = 8.', 'Le point ajoute la moitié de la valeur : blanche pointée = 3 temps.'],
  keydegree: ['Écris (ou chante) toute la gamme depuis la tonique, puis compte jusqu’au degré demandé.', 'N’oublie pas les altérations de l’armure : en ré majeur, fa et do sont dièses.'],
  playchord: ['Construis l’accord en empilant des tierces depuis la fondamentale.', 'Vérifie la tierce : c’est elle qui fait majeur ou mineur.'],
  chordsight: ['Range les notes en tierces pour trouver la fondamentale, puis regarde quelle note est à la basse.'],
};
const tipFor = (kind, q) => q.tip || pick(TIPS[q.tipKind || kind] || TIPS.degree);

/* ================================================================== */
/* Générateurs de questions                                            */
/* ================================================================== */
const GEN = {
  /** Plus grave ou plus aigu ? (difficulté adaptée : l'écart se resserre quand on réussit) */
  highlow(cfg, st) {
    const lo = cfg.minSt ?? 1, hi = cfg.maxSt ?? 12;
    if (st.hl == null) st.hl = cfg.startSt ?? hi;
    const size = cfg.adaptive === false ? randInt(lo, hi) : Math.max(lo, Math.min(hi, Math.round(st.hl)));
    const same = cfg.same && Math.random() < 0.2;
    const up = Math.random() < 0.5;
    const a = randInt(55, 69);
    const b = same ? a : up ? a + size : a - size;
    const answers = [{ id: 'down', label: '↓ Plus grave' }];
    if (cfg.same) answers.push({ id: 'same', label: '= Pareil' });
    answers.push({ id: 'up', label: '↑ Plus aiguë' });
    return {
      prompt: 'La deuxième note est-elle plus aiguë ou plus grave que la première ?',
      play: () => playNotes([{ m: a, t: 0, d: 0.9 }, { m: b, t: 1.0, d: 1.1 }]),
      answers, correct: same ? 'same' : up ? 'up' : 'down',
      explain: same ? 'Les deux notes étaient identiques.' : `La deuxième note était <b>plus ${up ? 'aiguë' : 'grave'}</b>, de ${size} demi-ton${size > 1 ? 's' : ''} (${noteNameFr(a)} → ${noteNameFr(b)}).`,
      onAnswer: ok => { if (cfg.adaptive !== false) st.hl = ok ? Math.max(lo, st.hl - 1) : Math.min(hi, st.hl + 2); },
      status: cfg.adaptive !== false ? `Écart actuel : ${size} demi-ton${size > 1 ? 's' : ''}` : '',
    };
  },

  /** Dessin d'une courte mélodie : monte, descend, en arche, en creux. */
  contour(cfg) {
    const n = cfg.notes || 3;
    const sc = [];
    for (let m = 55; m <= 81; m++) if (SCALES.maj.includes(pc(m))) sc.push(m);
    const kinds = cfg.set || ['up', 'down', 'arch', 'valley'];
    const maxStep = cfg.maxStep || 3;
    for (let tries = 0; tries < 100; tries++) {
      const kind = pick(kinds);
      let dirs;
      if (n === 3) dirs = { up: [1, 1], down: [-1, -1], arch: [1, -1], valley: [-1, 1] }[kind];
      else dirs = { up: [1, 1, 1], down: [-1, -1, -1], arch: pick([[1, 1, -1], [1, -1, -1]]), valley: pick([[-1, -1, 1], [-1, 1, 1]]) }[kind];
      let i = randInt(4, sc.length - 5);
      const idx = [i];
      let ok = true;
      for (const d of dirs) { i += d * randInt(1, maxStep); if (i < 0 || i >= sc.length) { ok = false; break; } idx.push(i); }
      if (!ok) continue;
      const ms = idx.map(k => sc[k]);
      const label = { up: '↗ Monte', down: '↘ Descend', arch: '↗↘ Monte puis descend', valley: '↘↗ Descend puis monte' };
      return {
        prompt: 'Quel est le dessin de cette mélodie ?',
        play: () => playNotes(ms.map((m, k) => ({ m, t: k * 0.62, d: k === ms.length - 1 ? 1.1 : 0.6 }))),
        answers: kinds.map(k => ({ id: k, label: label[k] })), correct: kind,
        explain: `${label[kind]} : ${ms.map(m => noteNameFr(m, { octave: false })).join(' – ')}.`,
      };
    }
  },

  /** Chanter : une note entendue, un degré après une cadence, une suite de degrés, une mélodie. Réponse au micro. */
  sing(cfg, st) {
    const task = cfg.task || 'match';
    const voice = store.get('settings.voice') || 'grave';
    const [vlo, vhi] = voice === 'aigue' ? [57, 74] : [45, 62];
    const mode = cfg.mode || 'maj';
    if (task === 'match') {
      const span = cfg.span || 7; // ambitus resserré autour du centre de la voix au début
      const mid = Math.round((vlo + vhi) / 2);
      let m;
      do { m = randInt(mid - span, mid + span); } while ((cfg.white !== false && isBlack(m)) || m === st.lastSing);
      st.lastSing = m;
      return {
        type: 'sing', tipKind: 'sing',
        prompt: 'Écoute la note, puis chante-la (bouche fermée « mmm », ou sur « la »).',
        play: () => playNotes([{ m, t: 0, d: 1.6, v: 80 }]),
        targets: [m], labels: [noteNameFr(m, { octave: false })],
        explain: `La note était un <b>${noteNameFr(m, { octave: false })}</b> (${noteNameFr(m)}).`,
        reveal: () => playNotes([{ m, t: 0, d: 1.3, v: 80 }]),
      };
    }
    // tonalité : do majeur (ou la mineur) par défaut, ou au hasard
    const tr = cfg.key === 'random' ? randInt(-5, 6) : 0;
    const tonicPc = ((mode === 'maj' ? 0 : 9) + tr + 12) % 12;
    let T = vlo; while (pc(T) !== tonicPc) T++;          // tonique dans la tessiture du chanteur
    if (T + 7 > vhi + 2) T -= 12;
    const names = spelledScale(keyNameFor(tonicPc, mode));
    const nm = d => (d === 8 ? names[0] : names[d - 1]);
    const cad = cadenceNotes(tr, mode);
    if (task === 'degree') {
      const deg = pick(cfg.degrees || [1, 3, 5]);
      const target = T + degOffset(deg, mode);
      return {
        type: 'sing', tipKind: 'degree',
        prompt: `Écoute la cadence en ${keyFr(tonicPc, mode)}, puis chante le degré <b>${deg}</b>${deg === 1 ? ' (la tonique)' : ''}.`,
        play: () => playNotes(cad.notes), targets: [target], labels: [String(deg)],
        explain: `Le degré ${deg} de ${keyFr(tonicPc, mode)} est <b>${nm(deg)}</b> : ${DEG_FEEL[mode][deg]}`,
        reveal: () => playNotes(resolution(target, deg, mode, 0)),
      };
    }
    if (task === 'seq') {
      const seq = pick(cfg.seqs || [[1, 2, 3]]);
      const targets = seq.map(d => T + degOffset(d, mode));
      const pre = cfg.giveFirst ? [{ m: targets[0], t: cad.end + 0.3, d: 1, v: 78 }] : [];
      return {
        type: 'sing', tipKind: 'degree',
        prompt: `Après la cadence${cfg.giveFirst ? ' et la première note' : ''}, chante : <b>${seq.join(' – ')}</b>${cfg.syllables ? ` (${seq.map(nm).join(' – ')})` : ''}.`,
        play: () => playNotes([...cad.notes, ...pre]), targets, labels: seq.map(String),
        explain: `En ${keyFr(tonicPc, mode)} : ${seq.map(d => `${d} = ${nm(d)}`).join(', ')}.`,
        reveal: () => playNotes(targets.map((m, i) => ({ m, t: i * 0.55, d: 0.55, v: 78 }))),
      };
    }
    if (task === 'echo') {
      const mel = randomMelody(cfg.degrees || [1, 2, 3], cfg.length || 3, cfg.maxStep || 1, cfg.startTonic !== false, cfg.endTonic);
      const targets = mel.map(d => T + degOffset(d, mode));
      const playMs = targets.map(m => m + 12 * Math.round((60 - T) / 12));
      return {
        type: 'sing', tipKind: 'echo',
        prompt: 'Écoute la cadence et la mélodie, puis rechante-la.',
        play: () => playNotes([...cad.notes, ...playMs.map((m, i) => ({ m, t: cad.end + 0.35 + i * 0.6, d: 0.58, v: 80 }))]),
        targets, labels: mel.map(() => '•'),
        explain: `La mélodie : <b>${mel.join(' – ')}</b> (${mel.map(nm).join(' – ')}).`,
        reveal: () => playNotes(playMs.map((m, i) => ({ m, t: i * 0.6, d: 0.58, v: 80 }))),
      };
    }
    if (task === 'interval') {
      const set = (cfg.set || ['3M', '5J', '8ve']).map(s => IV_SHORT_TO_ST[s]);
      const stp = pick(set);
      const a = randInt(vlo, vhi - stp);
      return {
        type: 'sing', tipKind: 'intervals',
        prompt: `Écoute la note, puis chante une <b>${INTERVALS.find(x => x.st === stp).name}</b> au-dessus.`,
        play: () => playNotes([{ m: a, t: 0, d: 1.4, v: 80 }]), targets: [a + stp], labels: [IV_LABEL[stp]],
        explain: `${noteNameFr(a, { octave: false })} → <b>${noteNameFr(a + stp, { octave: false })}</b>. Repère : ${IV_REF[stp]}.`,
        reveal: () => playNotes([{ m: a, t: 0, d: 0.8 }, { m: a + stp, t: 0.85, d: 1.2 }]),
      };
    }
  },

  /** Degrés après une cadence (entraînement fonctionnel), avec résolution vers la tonique. */
  degree(cfg, st) {
    const mode = cfg.mode || 'maj';
    const degs = cfg.degrees || [1, 2, 3];
    if (st.trCount == null || st.trCount <= 0 || st.tr == null) {
      st.tr = cfg.key === 'random' ? randInt(-5, 6) : 0;
      st.trCount = cfg.keyEvery || (cfg.key === 'random' ? 1 : 999);
    }
    st.trCount--;
    const tr = st.tr;
    const tonicPc = ((mode === 'maj' ? 0 : 9) + tr + 12) % 12;
    const names = spelledScale(keyNameFor(tonicPc, mode));
    let d;
    if (cfg.binary) d = Math.random() < 0.45 ? 1 : pick(degs.filter(x => x !== 1));
    else { do { d = pick(degs); } while (degs.length > 2 && d === st.lastDeg && Math.random() < 0.6); }
    st.lastDeg = d;
    const base = (mode === 'maj' ? 60 : 57) + tr;
    const target = base + degOffset(d, mode);
    const cad = cadenceNotes(tr, mode);
    const showNames = cfg.names && (cfg.key !== 'random');
    const answers = cfg.binary
      ? [{ id: 'yes', label: '1 : la tonique' }, { id: 'no', label: 'Autre degré' }]
      : [...degs].sort((a, b) => a - b).map(x => ({ id: x, label: showNames ? `${x} · ${x === 8 ? names[0] : names[x - 1]}` : String(x) }));
    return {
      prompt: cfg.binary ? 'Après la cadence : cette note est-elle la tonique (1) ?' : 'Après la cadence : quel degré entends-tu ?',
      play: () => playNotes([...cad.notes, { m: target, t: cad.end + 0.35, d: 1.4, v: 82 }]),
      extra: { label: 'Note seule', fn: () => playNotes([{ m: target, t: 0, d: 1.3, v: 82 }]) },
      answers, correct: cfg.binary ? (d === 1 ? 'yes' : 'no') : d,
      explain: `C’était le degré <b>${d}</b>${d < 8 ? ` (${DEG_NAMES[d]})` : ''}, ${d === 8 ? names[0] : names[d - 1]} en ${keyFr(tonicPc, mode)} : ${DEG_FEEL[mode][d]}`,
      after: () => playNotes(resolution(target, d, mode, 0.1)),
      status: cfg.key === 'random' ? `Tonalité : ${keyFr(tonicPc, mode)}` : '',
    };
  },

  /** Dictée jouée : écouter une courte mélodie et la rejouer au piano. */
  echo(cfg) {
    const mode = cfg.mode || 'maj';
    const tr = cfg.key === 'random' ? randInt(-5, 6) : 0;
    const tonicPc = ((mode === 'maj' ? 0 : 9) + tr + 12) % 12;
    const names = spelledScale(keyNameFor(tonicPc, mode));
    const nm = d => (d === 8 ? names[0] : names[d - 1]);
    const base = (mode === 'maj' ? 60 : 57) + tr;
    const mel = randomMelody(cfg.degrees || [1, 2, 3], cfg.length || 3, cfg.maxStep || 1, cfg.startTonic !== false, cfg.endTonic);
    const ms = mel.map(d => base + degOffset(d, mode));
    const cad = cfg.cadence === false ? { notes: [], end: 0 } : cadenceNotes(tr, mode);
    const t0 = cad.end + (cfg.cadence === false ? 0 : 0.4);
    const lo = Math.min(...ms) - 7, hi = Math.max(...ms) + 7;
    return {
      type: 'play', tipKind: 'echo',
      playTask: `Écoute, puis rejoue la mélodie (${mel.length} notes). Elle commence sur <b>${nm(mel[0])}</b>${cfg.cadence === false ? '' : ` (${keyFr(tonicPc, mode)})`}.`,
      play: () => playNotes([...cad.notes, ...ms.map((m, i) => ({ m, t: t0 + i * 0.62, d: i === ms.length - 1 ? 1.0 : 0.6, v: 80 }))]),
      extra: { label: 'Mélodie seule', fn: () => playNotes(ms.map((m, i) => ({ m, t: i * 0.62, d: 0.6, v: 80 }))) },
      expect: ms.length,
      check: played => played.length === ms.length && played.every((m, i) => pc(m) === pc(ms[i])),
      diff: played => played.map((m, i) => (pc(m) === pc(ms[i]) ? '✓' : '✗')).join(' '),
      explain: `La mélodie : <b>${mel.join(' – ')}</b> (${mel.map(nm).join(' – ')}).`,
      kbRange: [lo, hi],
    };
  },

  /** Rythme : écouter puis taper (écho), ou lire puis taper. */
  rhythm(cfg) {
    const meter = cfg.meter || 4, bars = cfg.bars || 1;
    const { seq, onsets } = genRhythm(meter, bars, cfg.cells || ['q', 'h', 'ee']);
    return { type: 'rhythm', tipKind: 'rhythm', task: cfg.task || 'echo', meter, bars, bpm: cfg.bpm || 72, onsets, abc: rhythmAbc(seq, meter, bars) };
  },

  /** Intervalles entendus (mélodiques ou harmoniques). */
  intervals(cfg) {
    const set = (cfg.set || ['2m', '2M', '3m', '3M', '4J', '5J', '8ve']).map(s => IV_SHORT_TO_ST[s]);
    const stp = pick(set);
    const dir = cfg.direction || pick(cfg.directions || ['up']);
    const root = randInt(55, 67);
    const a = root, b = dir === 'down' ? root - stp : root + stp;
    const notes = dir === 'harm' ? [{ m: a, t: 0, d: 1.4 }, { m: b, t: 0, d: 1.4 }] : [{ m: a, t: 0, d: 0.8 }, { m: b, t: 0.75, d: 1.1 }];
    const ivObj = INTERVALS.find(x => x.st === stp);
    return {
      prompt: dir === 'harm' ? 'Quel intervalle (notes jouées ensemble) ?' : dir === 'down' ? 'Quel intervalle descendant ?' : 'Quel intervalle ?',
      play: () => playNotes(notes),
      answers: set.map(s => ({ id: s, label: IV_LABEL[s] })),
      correct: stp,
      explain: `C’était une <b>${ivObj.name}</b> (${stp} demi-ton${stp > 1 ? 's' : ''}) : ${noteNameFr(a)} → ${noteNameFr(b)}.${cfg.refs !== false && dir === 'up' ? ` Repère : ${IV_REF[stp]}.` : ''}`,
      playTask: `Joue la note ${noteNameFr(a)} puis une <b>${ivObj.name}</b> ${dir === 'down' ? 'en dessous' : 'au-dessus'}.`,
      check: played => played.length >= 2 && played[0] === a && played[1] === b,
      expect: 2,
      kbRange: [Math.min(a, b) - 5, Math.max(a, b) + 5],
    };
  },

  chords(cfg) {
    const set = cfg.set || ['M', 'm'];
    const q = pick(set);
    const root = randInt(50, 62);
    const ms = CHORDS[q].iv.map(x => root + x);
    const sp = spellChord(root, CHORDS[q].iv);
    const arpFirst = cfg.arpeggiate !== false;
    const notes = [];
    if (arpFirst) ms.forEach((m, i) => notes.push({ m, t: i * 0.28, d: 0.5 }));
    const off = arpFirst ? ms.length * 0.28 + 0.15 : 0;
    ms.forEach(m => notes.push({ m, t: off, d: 1.6 }));
    return {
      tipKind: set.some(s => s.includes('7')) ? 'sevenths' : 'chords',
      prompt: 'Quelle sorte d’accord ?',
      play: () => playNotes(notes),
      answers: set.map(s => ({ id: s, label: CH_LABEL[s] })),
      correct: q,
      explain: `Accord <b>${CHORDS[q].fr}</b> sur ${sp[0].fr} : ${sp.map(x => x.fr).join(' – ')}.`,
      playTask: `Joue un accord <b>${CHORDS[q].fr}</b> sur <b>${sp[0].fr}</b> (n’importe quelle position).`,
      check: played => samePcs(played, ms),
      kbRange: [root - 2, root + 20],
    };
  },

  cadences(cfg) {
    const set = cfg.set || ['parfaite', 'demi', 'plagale', 'rompue'];
    const kind = pick(set);
    const mode = pick(cfg.modes || ['maj', 'min']);
    const tr = randInt(-4, 4);
    const tpl = CAD_TEMPLATES[mode][kind];
    const V = mode === 'maj' ? VOICE_MAJ : VOICE_MIN;
    const notes = [];
    tpl.forEach((deg, i) => V[deg].forEach(m => notes.push({ m: m + tr, t: i * 0.95, d: i === tpl.length - 1 ? 1.8 : 0.9, v: 66 })));
    const labels = cfg.labels || CAD_LABEL;
    return {
      prompt: cfg.prompt || 'Quelle cadence termine ce passage ?',
      play: () => playNotes(notes),
      answers: set.map(s => ({ id: s, label: labels[s] })),
      correct: kind,
      explain: `Enchaînement : <b>${tpl.join(' – ')}</b> → cadence <b>${CAD_LABEL[kind].toLowerCase()}</b>${kind === 'parfaite' ? ' (V → I : conclusion)' : kind === 'demi' ? ' (arrêt sur V : suspension)' : kind === 'plagale' ? ' (IV → I : « amen »)' : ' (V → vi : surprise)'}.`,
    };
  },

  /** Fonction de l'accord qui suit la tonique : IV, V, vi, ii. */
  chordfunc(cfg) {
    const set = cfg.set || ['IV', 'V', 'vi'];
    const x = pick(set);
    const tr = randInt(-5, 6);
    const seq = ['I', x === 'V' ? 'V' : x];
    const notes = [];
    seq.forEach((c, i) => VOICE_MAJ[c].forEach(m => notes.push({ m: m + tr, t: i * 1.0, d: i === 1 ? 1.5 : 0.95, v: 66 })));
    const desc = { IV: 'la basse monte d’une quarte (1 → 4) : un accord majeur ouvert, chaleureux', V: 'la basse descend d’une quarte (1 → 5) : un accord majeur tendu, on attend le retour au I', vi: 'la basse descend d’une tierce (1 → 6) : un accord mineur, plus sombre', ii: 'la basse monte d’un ton (1 → 2) : un accord mineur qui prépare souvent V' };
    return {
      prompt: 'Après l’accord de tonique (I), quel accord entends-tu ?',
      play: () => playNotes(notes),
      answers: set.map(s => ({ id: s, label: s })), correct: x,
      explain: `C’était <b>${x}</b> : ${desc[x]}.`,
    };
  },

  scales(cfg) {
    const set = cfg.set || ['maj', 'natMin', 'harmMin', 'melMin'];
    const s = pick(set);
    const root = randInt(57, 65);
    const ms = [...SCALES[s].map(x => root + x), root + 12];
    return {
      prompt: 'Quelle gamme (montante) ?',
      play: () => playNotes(ms.map((m, i) => ({ m, t: i * 0.3, d: 0.42 }))),
      answers: set.map(x => ({ id: x, label: SC_LABEL[x] })),
      correct: s,
      explain: `Gamme <b>${SC_LABEL[s].toLowerCase()}</b> de ${noteNameFr(root, { octave: false })} : ${ms.map(m => noteNameFr(m, { octave: false })).join(' ')}.`,
    };
  },

  keysig(cfg) {
    const pool = cfg.keys || ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'];
    const k = pick(pool);
    const minor = cfg.minor ? Math.random() < 0.5 || cfg.minor === 'only' : false;
    const key = KEYS[k];
    const relMin = Object.entries(KEYS).find(([n, v]) => v.mode === 'min' && v.sig === key.sig);
    const answerKeys = shuffle(pool).slice(0, Math.min(6, pool.length));
    if (!answerKeys.includes(k)) answerKeys[0] = k;
    const label = kk => minor ? capitalize(Object.values(KEYS).find(v => v.mode === 'min' && v.sig === KEYS[kk].sig).fr) : capitalize(KEYS[kk].fr);
    return {
      prompt: minor ? 'Quelle tonalité <b>mineure</b> a cette armure ?' : 'Quelle tonalité <b>majeure</b> a cette armure ?',
      staff: `X:1\nL:1/4\nK:${k}\nx4|]`,
      answers: shuffle(answerKeys).map(kk => ({ id: kk, label: label(kk) })),
      correct: k,
      explain: `${key.sig === 0 ? 'Aucune altération' : Math.abs(key.sig) + ' ' + (key.sig > 0 ? 'dièse' : 'bémol') + (Math.abs(key.sig) > 1 ? 's' : '')} : <b>${key.fr}</b> ou sa relative <b>${relMin[1].fr}</b>.`,
    };
  },

  notes(cfg) {
    const clef = pick(cfg.clefs || ['treble', 'bass']);
    const range = clef === 'treble' ? (cfg.trebleRange || [57, 84]) : (cfg.bassRange || [36, 64]);
    let m;
    do { m = randInt(range[0], range[1]); } while ([1, 3, 6, 8, 10].includes(m % 12));
    const abcNote = midiToAbc(m);
    return {
      prompt: 'Quelle est cette note ?',
      staff: `X:1\nL:1/4\nK:C clef=${clef}\n${abcNote}4|]`,
      answers: NOTE_BTNS.map(([l, p]) => ({ id: p, label: l })),
      correct: m % 12,
      explain: `C’est un <b>${noteNameFr(m, { octave: false })}</b> (${noteNameFr(m)}, à la française : do3 = do central).`,
      playTask: 'Joue cette note à la bonne hauteur sur le piano.',
      check: played => played[0] === m,
      expect: 1,
      sound: () => playNotes([{ m, t: 0, d: 1 }]),
      kbRange: [m - 9, m + 9],
    };
  },

  /** Nommer une touche marquée sur le clavier. */
  keyname(cfg, st) {
    const lo = cfg.lo || 48, hi = cfg.hi || 71;
    const black = cfg.black === 'only' ? true : cfg.black ? Math.random() < 0.45 : false;
    let m;
    do { m = randInt(lo, hi); } while (isBlack(m) !== black || m === st.lastKey);
    st.lastKey = m;
    const p = pc(m);
    const BL = { 1: 'do♯ / ré♭', 3: 'ré♯ / mi♭', 6: 'fa♯ / sol♭', 8: 'sol♯ / la♭', 10: 'la♯ / si♭' };
    const HINT = { 0: 'do est juste à gauche du groupe de deux touches noires', 2: 'ré est entre les deux touches noires', 4: 'mi est juste à droite des deux touches noires', 5: 'fa est juste à gauche du groupe de trois touches noires', 7: 'sol est entre la 1re et la 2e des trois touches noires', 9: 'la est entre la 2e et la 3e des trois touches noires', 11: 'si est juste à droite des trois touches noires' };
    let from = lo - (pc(lo) === 0 ? 0 : pc(lo)); let to = hi + (11 - pc(hi)) + 1;
    return {
      prompt: 'Comment s’appelle la touche marquée ?',
      kbd: { from, to, marks: [{ m, color: '#f2c14e' }] },
      answers: black ? Object.entries(BL).map(([id, label]) => ({ id: +id, label })) : NOTE_BTNS.map(([l, x]) => ({ id: x, label: l })),
      correct: p,
      explain: black ? `C’est <b>${BL[p]}</b> : une touche noire porte deux noms, le dièse de la touche blanche à sa gauche ou le bémol de celle à sa droite.` : `C’est un <b>${noteNameFr(m, { octave: false })}</b> (${noteNameFr(m)}) : ${HINT[p]}.`,
      sound: () => playNotes([{ m, t: 0, d: 1 }]),
    };
  },

  /** Trouver une note sur le clavier (n'importe quelle octave). */
  findnote(cfg) {
    const pool = cfg.notes || [['do', 0], ['ré', 2], ['mi', 4], ['fa', 5], ['sol', 7], ['la', 9], ['si', 11], ['fa♯', 6], ['si♭', 10], ['mi♭', 3], ['la♭', 8], ['do♯', 1], ['ré♭', 1]];
    const [name, p] = pick(pool);
    return {
      type: 'play', tipKind: 'notes',
      playTask: `Joue un <b>${name}</b> (dans l’octave de ton choix).`,
      expect: 1,
      check: played => pc(played[0]) === p,
      explain: `${capitalize(name)} : ${p === 1 || p === 3 || p === 6 || p === 8 || p === 10 ? 'une touche noire' : 'une touche blanche'}${name.includes('♯') ? ', juste à droite de ' + name.replace('♯', '') : name.includes('♭') ? ', juste à gauche de ' + name.replace('♭', '') : ''}.`,
      kbRange: [48, 71],
    };
  },

  /** Jouer une gamme montante sur une octave. */
  playscale(cfg) {
    const k = pick(cfg.keys || ['C', 'G', 'F', 'D']);
    const minor = k.endsWith('m');
    const names = spelledScale(k);
    let tonic = KEYS[k].tonic; if (tonic > 64) tonic -= 12;
    const iv = minor ? SCALES.harmMin : SCALES.maj;
    const ms = [...iv.map(x => tonic + x), tonic + 12];
    return {
      type: 'play', tipKind: 'keydegree',
      playTask: `Joue la gamme de <b>${KEYS[k].fr}</b>${minor ? ' (forme harmonique)' : ''} en montant, sur une octave : 8 notes.`,
      expect: 8,
      check: played => played.length === 8 && played.every((m, i) => pc(m) === pc(ms[i])) && played.every((m, i) => i === 0 || m > played[i - 1]),
      diff: played => '(' + played.map((m, i) => (pc(m) === pc(ms[i]) ? '✓' : '✗')).join(' ') + ')',
      explain: `Gamme de ${KEYS[k].fr}${minor ? ' harmonique' : ''} : ${names.join(' – ')} – ${names[0]}.`,
      kbRange: [tonic - 2, tonic + 14],
    };
  },

  /** Lire un intervalle écrit sur la portée. */
  intervalsight(cfg) {
    const items = (cfg.set || ['2M', '3m', '3M', '4J', '5J', '6m', '6M', '8ve']).map(s => {
      if (s === '8ve') return { s, n: 8, st: 12 };
      const n = +s[0], q = s.slice(1);
      const natural = { 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 }[n];
      const st = q === 'J' ? natural : q === 'M' ? natural : q === 'm' ? natural - 1 : q === 'A' ? natural + 1 : natural - 1;
      return { s, n, st };
    });
    const clef = cfg.clef || 'treble';
    for (let tries = 0; tries < 200; tries++) {
      const it = pick(items);
      const whites = [];
      const [rlo, rhi] = clef === 'treble' ? [60, 74] : [41, 55];
      for (let m = rlo; m <= rhi; m++) if (!isBlack(m)) whites.push(m);
      const lower = pick(whites);
      const li = LPC.indexOf(pc(lower));
      const ui = li + it.n - 1;
      const naturalUpper = lower - LPC[li] + LPC[ui % 7] + 12 * Math.floor(ui / 7);
      const acc = lower + it.st - naturalUpper;
      if (acc < -1 || acc > 1) continue;
      const upper = lower + it.st;
      const upLetter = LET[ui % 7];
      const sciOct = Math.floor(naturalUpper / 12) - 1;
      const upAbc = (acc === 1 ? '^' : acc === -1 ? '_' : '') + (sciOct >= 5 ? upLetter.toLowerCase() + "'".repeat(sciOct - 5) : upLetter + ','.repeat(4 - sciOct));
      const loAbc = midiToAbc(lower);
      const harm = cfg.harmonic === true || (cfg.harmonic !== false && Math.random() < 0.5);
      const staff = `X:1\nL:1/4\nK:C clef=${clef}\n${harm ? `[${loAbc}${upAbc}]4` : `${loAbc}2 ${upAbc}2`}|]`;
      const QN = { 2: 'seconde', 3: 'tierce', 4: 'quarte', 5: 'quinte', 6: 'sixte', 7: 'septième', 8: 'octave' };
      const QS = { 2: '2de', 3: '3ce', 4: '4te', 5: '5te', 6: '6te', 7: '7e', 8: '8ve' };
      const qualName = it.s === '8ve' ? 'juste' : { m: 'mineure', M: 'majeure', J: 'juste', A: 'augmentée', d: 'diminuée' }[it.s.slice(1)];
      const loName = LET_FR[LET[li]], upName = LET_FR[upLetter] + ACC_FR[acc];
      const letters = []; for (let k = li; k <= ui; k++) letters.push(LET_FR[LET[k % 7]]);
      const quantityOnly = cfg.quality === false;
      const answers = quantityOnly
        ? [...new Set(items.map(x => x.n))].sort((a, b) => a - b).map(n => ({ id: n, label: QS[n] }))
        : items.map(x => ({ id: x.s, label: x.s === '8ve' ? '8ve' : `${QS[x.n]} ${x.s.slice(1)}` }));
      return {
        prompt: quantityOnly ? 'Quel est cet intervalle (sa quantité) ?' : 'Quel est cet intervalle (quantité et qualité) ?',
        staff, answers, correct: quantityOnly ? it.n : it.s,
        explain: `${loName} → ${upName} : ${letters.join(', ')}, soit ${it.n} noms de notes → <b>${QN[it.n]}</b>${quantityOnly ? '' : ` ; ${it.st} demi-tons → <b>${QN[it.n]} ${qualName}</b>`}.`,
        sound: () => playNotes(harm ? [{ m: lower, t: 0, d: 1.3 }, { m: upper, t: 0, d: 1.3 }] : [{ m: lower, t: 0, d: 0.7 }, { m: upper, t: 0.7, d: 1 }]),
      };
    }
  },

  /** Compléter une mesure : quelle valeur manque ? */
  measurefill(cfg) {
    const DUR = { w: { e: 8, fr: 'ronde' }, hd: { e: 6, fr: 'blanche pointée' }, h: { e: 4, fr: 'blanche' }, qd: { e: 3, fr: 'noire pointée' }, q: { e: 2, fr: 'noire' }, e: { e: 1, fr: 'croche' } };
    const vals = cfg.values || ['h', 'q', 'e', 'hd'];
    const meter = pick(cfg.meters || ['4/4', '3/4', '2/4']);
    const [num] = meter.split('/').map(Number);
    const total = num * 2;
    for (let tries = 0; tries < 300; tries++) {
      const seq = [];
      let pos = 0;
      while (pos < total) {
        let fit = vals.filter(v => DUR[v].e <= total - pos);
        if (pos % 2 === 1) fit = fit.filter(v => v === 'e');                       // finir le temps commencé
        if (num === 4) fit = fit.filter(v => !(DUR[v].e === 4 && pos % 4 !== 0));  // blanche sur le 1er ou le 3e temps
        if (!fit.length) break;
        const v = pick(fit);
        seq.push(v); pos += DUR[v].e;
      }
      if (pos !== total || seq.length < 2) continue;
      const hide = randInt(0, seq.length - 1);
      const abcVal = { w: 'B8', hd: 'B6', h: 'B4', qd: 'B3', q: 'B2', e: 'B' };
      const body = seq.map((v, i) => (i === hide ? `"^?"x${DUR[v].e}` : abcVal[v])).join(' ');
      const filled = total - DUR[seq[hide]].e;
      const fmtT = e => { const t = e / 2; return `${String(t).replace('.', ',')} temps`; };
      return {
        prompt: `Mesure à ${meter} : quelle valeur faut-il à la place du « ? » ?`,
        staff: `X:1\nM:${meter}\nL:1/8\nK:C\n${body} |]`,
        answers: [...vals].sort((a, b) => DUR[b].e - DUR[a].e).map(v => ({ id: v, label: DUR[v].fr })),
        correct: seq[hide],
        explain: `Une mesure à ${meter} contient ${num} temps (noires). Les autres valeurs font ${fmtT(filled)} ; il manque ${fmtT(DUR[seq[hide]].e)} : une <b>${DUR[seq[hide]].fr}</b>.`,
      };
    }
  },

  /** Degrés d'une gamme : « quelle est la dominante de ré majeur ? » */
  keydegree(cfg) {
    const pool = cfg.keys || ['C', 'G', 'D', 'F', 'Bb', 'A', 'Eb'];
    const k = pick(pool);
    const names = spelledScale(k);
    const d = pick(cfg.degrees || [2, 3, 4, 5, 6, 7]);
    return {
      prompt: `Quelle est la <b>${DEG_NAMES[d]}</b> (${d}<sup>e</sup> degré) de <b>${KEYS[k].fr}</b> ?`,
      answers: names.map((n, i) => ({ id: i + 1, label: n })),
      correct: d,
      explain: `Gamme de ${KEYS[k].fr} : ${names.join(' – ')}. La ${DEG_NAMES[d]} est <b>${names[d - 1]}</b>.`,
    };
  },

  chordsight(cfg) {
    const roots = [60, 62, 64, 65, 67, 69, 71];
    const r = pick(roots);
    const q = pick(cfg.set || ['M', 'm']);
    const inv = pick(cfg.inversions || [0, 1, 2]);
    let sp = spellChord(r, CHORDS[q].iv);
    for (let i = 0; i < inv; i++) { const lo = sp.shift(); sp.push(spellChord(lo.m + 12, [0], ROOT_LETTER_OF(lo))[0]); }
    while (Math.max(...sp.map(x => x.m)) > 81) sp = sp.map(x => spellChord(x.m - 12, [0], ROOT_LETTER_OF(x))[0]);
    const ms = sp.map(x => x.m);
    const invName = ['état fondamental', '1er renversement', '2e renversement', '3e renversement'][inv];
    const abc = `X:1\nL:1/4\nK:C\n[${sp.map(x => x.abc).join('')}]4|]`;
    const opts = [];
    for (const qq of (cfg.set || ['M', 'm'])) for (const ii of (cfg.inversions || [0, 1, 2])) opts.push({ id: qq + ii, label: `${CH_LABEL[qq]} — ${['fond.', '1er renv.', '2e renv.', '3e renv.'][ii]}` });
    return {
      prompt: cfg.hideRoot ? 'Accord de quelle nature, et dans quel état ?' : `Accord de quelle nature, et dans quel état ? (fondamentale : ${sp.find(x => x.m % 12 === r % 12).fr})`,
      staff: abc,
      answers: opts,
      correct: q + inv,
      explain: `Accord <b>${CHORDS[q].fr}</b> de ${sp.find(x => x.m % 12 === r % 12).fr} (${spellChord(r, CHORDS[q].iv).map(x => x.fr).join(' – ')}), <b>${invName}</b> (basse : ${sp[0].fr}).`,
      sound: () => playNotes(ms.map(m => ({ m, t: 0, d: 1.4 }))),
    };
  },

  /** Jouer un accord de fonction : « joue le V7 de fa mineur » */
  playchord(cfg) {
    const items = cfg.items || [
      { ask: 'l’accord de <b>tonique</b> (i) de fa mineur', pcs: [5, 8, 0] },
      { ask: 'l’accord de <b>sous-dominante</b> (iv) de fa mineur', pcs: [10, 1, 5] },
      { ask: 'l’accord de <b>dominante avec septième</b> (V7) de fa mineur', pcs: [0, 4, 7, 10] },
    ];
    const it = pick(items);
    return {
      type: 'play',
      playTask: `Joue ${it.ask} (n’importe quel renversement), puis relâche les touches.`,
      check: played => samePcs(played, it.pcs),
      explain: `Notes attendues : <b>${it.names || it.pcs.map(p => noteNameFr(p + 60, { octave: false, flats: true })).join(' – ')}</b>.`,
      kbRange: [48, 76],
    };
  },
};

/** Mélodie aléatoire sur des degrés (marche aléatoire, pas de maxStep positions au plus). */
function randomMelody(pool, len, maxStep, startTonic, endTonic) {
  const sorted = [...new Set(pool)].sort((a, b) => a - b);
  for (let tries = 0; tries < 100; tries++) {
    let i = startTonic && sorted.includes(1) ? sorted.indexOf(1) : randInt(0, sorted.length - 1);
    const seq = [sorted[i]];
    while (seq.length < len) {
      let step;
      do { step = randInt(-maxStep, maxStep); } while (step === 0 && Math.random() < 0.85);
      i = Math.max(0, Math.min(sorted.length - 1, i + step));
      seq.push(sorted[i]);
    }
    if (endTonic && sorted.includes(1)) seq[seq.length - 1] = 1;
    if (new Set(seq).size >= Math.min(2, sorted.length)) return seq;
  }
  return sorted.slice(0, len);
}

/** Résolution d'un degré vers la tonique la plus proche (2-3-4 descendent vers 1, 5-6-7 montent vers 8). */
function resolution(target, d, mode, t0 = 0) {
  const tonic = target - degOffset(d, mode);
  const path = [];
  if (d === 1 || d === 8) path.push(d);
  else if (d <= 4) for (let k = d; k >= 1; k--) path.push(k);
  else for (let k = d; k <= 8; k++) path.push(k);
  return path.map((k, i) => ({ m: tonic + degOffset(k, mode), t: t0 + i * 0.42, d: i === path.length - 1 ? 1.1 : 0.42, v: 78 }));
}

function samePcs(played, target) {
  const a = new Set(played.map(pc));
  const b = new Set(target.map(pc));
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/* ================================================================== */
/* Interface                                                           */
/* ================================================================== */
export function mountQuiz(el, cfg) {
  const total = cfg.count || 10;
  const gen = GEN[cfg.kind];
  if (!gen) { el.textContent = 'Exercice inconnu'; return; }
  const frame = h('div', { class: 'w-frame' });
  const head = h('div', { class: 'w-head' }, h('span', { class: 'w-title' }, cfg.title || 'Exercice'), cfg.sub ? h('span', { class: 'w-sub' }, cfg.sub) : null);
  const body = h('div', { class: 'w-body' });
  frame.append(head, body);
  el.append(frame);
  const isSing = cfg.kind === 'sing';
  const isRhythm = cfg.kind === 'rhythm';
  const playMode = cfg.mode === 'play' || ['playchord', 'echo'].includes(cfg.kind);
  const persist = {}; // état conservé d'une question à l'autre (difficulté adaptée, tonalité…)
  let state;
  const cleanups = new Set();
  const addCleanup = fn => { cleanups.add(fn); return () => { cleanups.delete(fn); fn(); }; };
  const clearQuestion = () => { stopAudio(); cleanups.forEach(fn => { try { fn(); } catch (e) { /* */ } }); cleanups.clear(); };

  const start = () => {
    state = { i: 0, ok: 0, solved: 0, startAt: Date.now(), singMode };
    next();
  };

  /* ---------- écoute des notes jouées (piano ou clavier à l'écran) ---------- */
  const listenPlayed = (onDone, expect) => {
    const pressed = [];
    const held = new Set();
    let timer = null;
    const stopAll = () => { offOn(); offOff(); clearTimeout(timer); };
    const finish = () => { stopAll(); remove(); onDone(pressed.slice()); };
    const offOn = midi.on('noteon', ev => {
      pressed.push(ev.note); held.add(ev.note); clearTimeout(timer);
      if (expect && pressed.length >= expect) timer = setTimeout(finish, 280);
    });
    const offOff = midi.on('noteoff', ev => {
      held.delete(ev.note);
      if (!expect && held.size === 0 && pressed.length) { clearTimeout(timer); timer = setTimeout(finish, 350); }
      if (expect && pressed.length && pressed.length < expect && held.size === 0) { clearTimeout(timer); timer = setTimeout(finish, 4000); }
    });
    const remove = addCleanup(stopAll);
  };

  const screenKeyboard = (range) => {
    let [lo, hi] = range || [53, 79];
    while (isBlack(lo)) lo--;
    while (isBlack(hi)) hi++;
    if (hi - lo < 17) hi = lo + 17;
    while (isBlack(hi)) hi++;
    const wrap = h('div', { class: 'quiz-kbd' });
    wrap.append(keyboard({ from: lo, to: hi, interactive: true, names: 'c', height: 96, onDown: (m, v) => midi.virtualOn(m, v), onUp: m => midi.virtualOff(m) }));
    return wrap;
  };

  /* ---------- squelette commun d'une question ---------- */
  const next = () => {
    clearQuestion();
    body.innerHTML = '';
    if (state.i >= total) return finish();
    const q = gen(cfg, persist);
    state.q = q;
    frame.__q = q; // lecture par les tests automatiques
    state.tries = 0;
    const type = q.type || (playMode && q.check ? 'play' : 'buttons');
    const prog = h('div', { class: 'quiz-progress' }, h('span', {}, `${state.i + 1} / ${total}`), h('div', { class: 'progress' }, h('i', { style: { width: `${state.i / total * 100}%` } })), h('span', {}, `${state.ok} du premier coup`));
    body.append(prog);
    if (q.status) body.append(h('div', { class: 'quiz-status' }, q.status));
    const ctx = {
      q, type,
      fb: h('div', { class: 'quiz-feedback' }),
      tipBox: h('div', { class: 'quiz-tip', hidden: true }),
      row: h('div', { class: 'btn-row', style: { marginBottom: '12px' } }),
      nextBtn: h('button', { class: 'btn primary', type: 'button', hidden: true }, state.i + 1 >= total ? 'Voir le résultat' : 'Question suivante'),
    };
    ctx.nextBtn.addEventListener('click', () => { state.i++; next(); });
    ctx.showTip = () => { ctx.tipBox.hidden = false; ctx.tipBox.innerHTML = `<b>Conseil.</b> ${tipFor(cfg.kind, q)}`; };
    ctx.done = (ok, firstTry) => {
      // une question ne compte qu'une fois : « du premier coup » si réussie sans erreur ni nouvel essai
      if (ok && !ctx.solvedOnce) { ctx.solvedOnce = true; state.solved++; if (firstTry && !ctx.failedOnce) state.ok++; }
      if (!ok) ctx.failedOnce = true;
      if (!ctx.answered) { ctx.answered = true; q.onAnswer?.(ok && firstTry); }
      ctx.nextBtn.hidden = false;
      setTimeout(() => ctx.nextBtn.focus({ preventScroll: true }), 50);
    };
    if (type === 'sing') return renderSing(ctx);
    if (type === 'rhythm') return renderRhythm(ctx);
    body.append(h('div', { class: 'quiz-q', html: type === 'play' && q.playTask ? q.playTask : q.prompt }));
    if (q.staff) {
      const st = h('div', { class: 'quiz-staff' });
      body.append(st);
      window.ABCJS.renderAbc(st, q.staff, { responsive: 'resize', staffwidth: 260, scale: 1.4, paddingtop: 0, paddingbottom: 0 });
    }
    if (q.kbd) body.append(h('div', { class: 'quiz-staff', style: { maxWidth: '520px' } }, keyboard({ ...q.kbd, names: q.kbd.names || 'none', height: 96 })));
    if (q.play) {
      const again = h('button', { class: 'btn', type: 'button', html: PLAY + ' Réécouter' });
      again.addEventListener('click', () => { stopAudio(); q.play(); });
      ctx.row.append(again);
      if (q.extra) {
        const ex = h('button', { class: 'btn ghost', type: 'button', html: PLAY + ' ' + esc(q.extra.label) });
        ex.addEventListener('click', () => { stopAudio(); q.extra.fn(); });
        ctx.row.append(ex);
      }
      const t = setTimeout(() => q.play(), 250);
      addCleanup(() => clearTimeout(t));
    }
    if (type === 'play') return renderPlay(ctx);
    return renderButtons(ctx);
  };

  /* ---------- réponses à toucher ---------- */
  const renderButtons = (ctx) => {
    const { q, fb, nextBtn, row, tipBox } = ctx;
    body.append(row);
    const grid = h('div', { class: 'quiz-answers' });
    for (const a of q.answers) {
      const b = h('button', { class: 'btn', type: 'button', 'data-id': String(a.id) }, a.label);
      b.addEventListener('click', () => {
        if (!nextBtn.hidden) return;
        state.tries++;
        if (a.id === q.correct) {
          b.classList.add('right');
          fb.className = 'quiz-feedback ok'; fb.innerHTML = (state.tries === 1 ? 'Exact. ' : 'Oui. ') + q.explain;
          ctx.done(true, state.tries === 1);
          if (q.after) q.after(); else q.sound?.();
        } else {
          b.classList.add('wrong');
          fb.className = 'quiz-feedback bad'; fb.textContent = q.play ? 'Non — réécoute et essaie encore.' : 'Non — essaie encore.';
          ctx.showTip();
          if (state.tries >= 2) {
            grid.querySelector(`[data-id="${CSS.escape(String(q.correct))}"]`)?.classList.add('right');
            fb.innerHTML = q.explain;
            ctx.done(false, false);
            if (q.after) q.after(); else q.sound?.();
          }
        }
      });
      grid.append(b);
    }
    body.append(grid, fb, tipBox, nextBtn);
  };

  /* ---------- réponse jouée au piano ---------- */
  const renderPlay = (ctx) => {
    const { q, fb, nextBtn, row, tipBox } = ctx;
    const skip = h('button', { class: 'btn ghost', type: 'button' }, 'Je passe');
    row.append(skip);
    body.append(row);
    let kb = null;
    const kbBtn = h('button', { class: 'btn sm ghost', type: 'button' }, 'Clavier à l’écran');
    const toggleKb = (on) => {
      if (on && !kb) { kb = screenKeyboard(q.kbRange); body.insertBefore(kb, fb); kbBtn.classList.add('on'); }
      else if (!on && kb) { kb.remove(); kb = null; kbBtn.classList.remove('on'); }
    };
    kbBtn.addEventListener('click', () => toggleKb(!kb));
    row.append(kbBtn);
    body.append(fb, tipBox, nextBtn);
    if (midi.status !== 'ready') { toggleKb(true); fb.innerHTML = '<span class="small">Piano non connecté : réponds sur le clavier à l’écran.</span>'; }
    skip.addEventListener('click', () => { if (!nextBtn.hidden) return; fb.className = 'quiz-feedback bad'; fb.innerHTML = q.explain; ctx.done(false, false); clearQuestion(); });
    const wait = () => listenPlayed(played => {
      state.tries++;
      if (q.check(played)) {
        fb.className = 'quiz-feedback ok'; fb.innerHTML = (state.tries === 1 ? 'Exact. ' : 'Oui. ') + q.explain;
        ctx.done(true, state.tries === 1);
      } else {
        fb.className = 'quiz-feedback bad';
        const detail = q.diff ? ` ${q.diff(played)}` : '';
        if (state.tries >= 3) {
          fb.innerHTML = `Tu as joué : ${played.map(m => noteNameFr(m, { octave: false })).join(', ')}.${detail} ${q.explain}`;
          ctx.done(false, false);
          return;
        }
        fb.innerHTML = `Pas tout à fait (tu as joué : ${played.map(m => noteNameFr(m, { octave: false })).join(', ')}).${detail} Réécoute et réessaie.`;
        ctx.showTip();
        wait();
      }
    }, q.expect);
    wait();
  };

  /* ---------- chant (micro, ou repli piano / auto-évaluation) ---------- */
  const renderSing = (ctx) => {
    const { q, fb, nextBtn, row, tipBox } = ctx;
    const singMode = state.singMode;
    body.append(h('div', { class: 'quiz-q', html: q.prompt }));
    const chips = h('div', { class: 'sing-chips' });
    const chipEls = q.targets.map((_, i) => h('span', { class: 'chip' }, q.labels?.[i] ?? '•'));
    chips.append(...chipEls);
    if (q.targets.length > 1) body.append(chips);
    const again = h('button', { class: 'btn', type: 'button', html: PLAY + ' Réécouter' });
    const skip = h('button', { class: 'btn ghost', type: 'button' }, 'Je passe');
    row.append(again, skip);
    body.append(row);
    let idx = 0, tries = 0, finished = false;
    const succeed = () => {
      if (finished) return;
      finished = true; stopListening();
      fb.className = 'quiz-feedback ok';
      fb.innerHTML = (tries === 0 ? 'Juste ! ' : 'Juste. ') + q.explain;
      ctx.done(true, tries === 0);
      if (q.type === 'sing' && cfg.task !== 'match') setTimeout(() => q.reveal?.(), 300);
    };
    const fail = (msg) => {
      if (finished) return;
      finished = true; stopListening();
      fb.className = 'quiz-feedback bad';
      fb.innerHTML = `${msg || 'Pas encore.'} ${q.explain}`;
      ctx.showTip();
      retry.hidden = false;
      setTimeout(() => q.reveal?.(), 400);
      ctx.done(false, false);
    };
    const retry = h('button', { class: 'btn', type: 'button', hidden: true }, 'Réessayer');
    retry.addEventListener('click', () => {
      tries++; finished = false; idx = 0; chipEls.forEach(c => c.classList.remove('ok'));
      retry.hidden = true; fb.className = 'quiz-feedback'; fb.textContent = '';
      playThenListen();
    });
    skip.addEventListener('click', () => { if (!finished) fail('Passée.'); });

    /* --- mode micro --- */
    let listening = false, offPitch = null, timer = null, hist = [], holdStart = null, recent = [], lastVoiced = 0;
    const tol = (cfg.tol ?? 45) / 100;
    const meter = h('div', { class: 'pm' });
    const needle = h('i', { class: 'pm-needle' });
    const zone = h('i', { class: 'pm-zone', style: { left: `${50 - tol * 25}%`, width: `${tol * 50}%` } });
    const bar = h('div', { class: 'pm-bar' }, zone, needle, h('span', { class: 'pm-lo' }, 'trop bas'), h('span', { class: 'pm-hi' }, 'trop haut'));
    const read = h('div', { class: 'pm-read' }, 'Écoute…');
    const level = h('div', { class: 'pm-level' }, h('i'));
    meter.append(bar, read, level);
    const stopListening = () => { listening = false; clearTimeout(timer); offPitch?.(); offPitch = null; };
    const startListening = () => {
      listening = true; hist = []; holdStart = null; recent = [];
      read.innerHTML = q.targets.length > 1 ? `À toi : chante la note ${idx + 1}.` : 'À toi : chante.';
      offPitch = pitch.on(ev => {
        level.firstChild.style.width = `${Math.min(100, ev.rms * 900)}%`;
        if (!listening) return;
        if (!ev.voiced) {
          // une courte coupure (respiration, consonne, mesure ratée) n'annule pas la tenue
          if (ev.t - lastVoiced > 220) { holdStart = null; hist = []; needle.style.opacity = 0.25; }
          return;
        }
        lastVoiced = ev.t;
        hist.push(ev.midi); if (hist.length > 3) hist.shift();
        const mm = median(hist);
        const target = q.targets[idx];
        const d = octaveDiff(mm, target);
        recent.push({ t: ev.t, d }); while (recent.length && ev.t - recent[0].t > 1500) recent.shift();
        needle.style.opacity = 1;
        needle.style.left = `${50 + Math.max(-2, Math.min(2, d)) * 25}%`;
        needle.classList.toggle('in', Math.abs(d) <= tol);
        const cents = Math.round(d * 100);
        read.innerHTML = `Tu chantes : <b>${sungName(mm)}</b> · ${cents > 0 ? '+' : ''}${cents} cents${Math.abs(d) <= tol ? ' · <span class="ok">juste</span>' : d < 0 ? ' · monte un peu ↑' : ' · descends un peu ↓'}`;
        if (Math.abs(d) <= tol) {
          if (holdStart == null) holdStart = ev.t;
          if (ev.t - holdStart >= (q.targets.length > 1 ? 260 : 380)) {
            chipEls[idx]?.classList.add('ok');
            idx++; holdStart = null; hist = [];
            if (idx >= q.targets.length) succeed();
            else read.innerHTML = `Bien. Note ${idx + 1} maintenant.`;
          }
        } else holdStart = null;
      });
      const limit = 9000 + 2500 * (q.targets.length - 1);
      timer = setTimeout(() => {
        const avg = recent.length ? recent.reduce((s, r) => s + r.d, 0) / recent.length : null;
        let msg = 'Pas encore.';
        if (avg == null) msg = 'Je ne t’ai pas entendu (micro trop loin ? chante un peu plus fort).';
        else if (Math.abs(avg) <= tol) msg = 'Presque : c’était juste, mais pas assez longtemps. Tiens le son calmement.';
        else msg = `Pas encore : tu étais environ ${Math.abs(avg) < 0.75 ? 'un quart de ton' : Math.round(Math.abs(avg)) === 1 ? 'un demi-ton' : Math.round(Math.abs(avg)) + ' demi-tons'} trop ${avg < 0 ? 'bas' : 'haut'}.`;
        fail(msg);
      }, limit);
    };

    /* --- repli : réponse au piano --- */
    const pianoListen = () => {
      listenPlayed(played => {
        if (finished) return;
        const ok = played.length === q.targets.length && played.every((m, i) => pc(m) === pc(q.targets[i]));
        if (ok) { chipEls.forEach(c => c.classList.add('ok')); succeed(); }
        else fail(`Tu as joué : ${played.map(m => noteNameFr(m, { octave: false })).join(', ')}.`);
      }, q.targets.length);
    };

    /* --- repli : auto-évaluation --- */
    const selfRow = h('div', { class: 'btn-row', hidden: true });
    const showAns = h('button', { class: 'btn', type: 'button', html: PLAY + ' Écouter la réponse' });
    const yes = h('button', { class: 'btn', type: 'button' }, 'J’étais juste');
    const no = h('button', { class: 'btn ghost', type: 'button' }, 'Pas encore');
    showAns.addEventListener('click', () => { q.reveal?.(); yes.disabled = false; no.disabled = false; });
    yes.addEventListener('click', () => { if (!finished) { finished = true; fb.className = 'quiz-feedback ok'; fb.innerHTML = 'Bravo. ' + q.explain; ctx.done(true, tries === 0); } });
    no.addEventListener('click', () => { if (!finished) { finished = true; fb.className = 'quiz-feedback bad'; fb.innerHTML = q.explain; ctx.showTip(); ctx.done(false, false); } });
    yes.disabled = true; no.disabled = true;
    selfRow.append(showAns, yes, no);

    const playThenListen = async () => {
      stopListening(); stopAudio();
      read.innerHTML = 'Écoute…';
      let ms = 0;
      try { ms = await q.play(); } catch (e) { fb.textContent = 'Audio indisponible : ' + e.message; }
      if (singMode === 'mic') { const t = setTimeout(startListening, ms + 300); addCleanup(() => clearTimeout(t)); }
      else if (singMode === 'piano') { const t = setTimeout(pianoListen, Math.max(0, ms - 200)); addCleanup(() => clearTimeout(t)); }
      else { selfRow.hidden = false; }
    };
    again.addEventListener('click', () => { if (!finished) playThenListen(); else { stopAudio(); q.play(); } });

    if (singMode === 'mic') body.append(meter);
    if (singMode === 'piano') {
      const kbEl = midi.status !== 'ready' ? screenKeyboard([Math.min(...q.targets.map(m => 48 + pc(m))), Math.max(...q.targets.map(m => 60 + pc(m)))]) : null;
      body.append(h('p', { class: 'small' }, 'Chante intérieurement, puis joue au piano la ou les notes que tu chanterais.'));
      if (kbEl) body.append(kbEl);
    }
    if (singMode === 'self') body.append(h('p', { class: 'small' }, 'Chante à voix haute, puis écoute la réponse et juge honnêtement.'), selfRow);
    body.append(fb, tipBox, h('div', { class: 'btn-row' }, retry, nextBtn));
    addCleanup(stopListening);
    const t = setTimeout(playThenListen, 250);
    addCleanup(() => clearTimeout(t));
  };

  /* ---------- rythme : écho ou lecture ---------- */
  const renderRhythm = (ctx) => {
    const { q, fb, nextBtn, row, tipBox } = ctx;
    const echo = q.task === 'echo';
    body.append(h('div', { class: 'quiz-q', html: echo ? 'Écoute le rythme (après une mesure de décompte), puis tape-le à ton tour dès la fin du second décompte.' : 'Lis ce rythme. Après une mesure de décompte, tape-le en suivant les clics.' }));
    const staff = h('div', { class: 'quiz-staff' });
    const showStaff = () => { staff.innerHTML = ''; window.ABCJS.renderAbc(staff, q.abc, { responsive: 'resize', staffwidth: 300, scale: 1.3, paddingtop: 0, paddingbottom: 0 }); };
    if (!echo) showStaff();
    body.append(staff);
    const goBtn = h('button', { class: 'btn primary', type: 'button', html: PLAY + (echo ? ' Écouter puis taper' : ' Décompte puis taper') });
    const hear = h('button', { class: 'btn ghost', type: 'button', html: PLAY + ' Écouter le rythme' });
    row.append(goBtn);
    if (!echo) row.append(hear);
    body.append(row);
    const pad = h('button', { class: 'tap-pad', type: 'button' }, 'Taper ici (ou n’importe quelle touche du piano, ou la barre d’espace)');
    const beatsBox = h('div', { class: 'beat-dots' });
    for (let b = 0; b < q.meter; b++) beatsBox.append(h('i'));
    body.append(beatsBox, pad, fb, tipBox, nextBtn);
    let taps = null, running = false;
    const onTap = (t) => { if (taps) { taps.push(t); pad.classList.add('hit'); setTimeout(() => pad.classList.remove('hit'), 90); } };
    const offMidi = midi.on('noteon', ev => onTap(ev.time));
    const padDown = e => { e.preventDefault(); onTap(e.timeStamp > 0 ? e.timeStamp : performance.now()); };
    pad.addEventListener('pointerdown', padDown);
    const key = e => { if ((e.code === 'Space' || e.code === 'Enter') && running) { e.preventDefault(); onTap(performance.now()); } };
    window.addEventListener('keydown', key);
    addCleanup(() => { offMidi(); window.removeEventListener('keydown', key); });
    const spb = 60 / q.bpm;

    const flashBeats = (t0ctx, nBeats) => {
      for (let k = 0; k < nBeats; k++) {
        const delay = (t0ctx + k * spb - audio.now()) * 1000;
        const tm = setTimeout(() => {
          [...beatsBox.children].forEach((d, j) => d.classList.toggle('on', j === k % q.meter));
        }, Math.max(0, delay));
        addCleanup(() => clearTimeout(tm));
      }
    };
    const playPattern = (t0) => {
      for (const o of q.onsets) { const v = audio.noteOn(72, 84, t0 + o * spb, { owner: 'quiz' }); if (v) audio.noteOff(v, t0 + o * spb + Math.min(0.22, spb * 0.4)); }
    };
    hear.addEventListener('click', async () => {
      if (running) return;
      audio.claim('quiz', () => audio.stopAll('quiz'));
      await audio.ensure();
      const t0 = audio.now() + 0.1;
      for (let k = 0; k < q.meter * (q.bars + 1); k++) audio.click(t0 + k * spb, k % q.meter === 0 ? 'accent' : 'beat');
      playPattern(t0 + q.meter * spb);
      flashBeats(t0, q.meter * (q.bars + 1));
    });

    goBtn.addEventListener('click', async () => {
      if (running) return;
      running = true; goBtn.disabled = true;
      fb.className = 'quiz-feedback'; fb.textContent = '';
      audio.claim('quiz', () => audio.stopAll('quiz'));
      await audio.ensure();
      const t0 = audio.now() + 0.15;
      const barDur = q.meter * spb;
      let answerStart;
      let nClicks;
      if (echo) {
        // décompte, rythme (avec clics), second décompte, réponse
        playPattern(t0 + barDur);
        answerStart = t0 + barDur * (q.bars + 2);
        nClicks = q.meter * (q.bars * 2 + 2);
      } else {
        answerStart = t0 + barDur;
        nClicks = q.meter * (q.bars + 1);
      }
      for (let k = 0; k < nClicks; k++) {
        const tt = t0 + k * spb;
        const inAnswer = tt >= answerStart - 1e-6;
        const countIn = echo ? (tt >= t0 + barDur * (q.bars + 1) - 1e-6 && !inAnswer) || tt < t0 + barDur : tt < answerStart - 1e-6;
        audio.click(tt, k % q.meter === 0 ? 'accent' : countIn ? 'beat' : 'sub');
      }
      flashBeats(t0, nClicks);
      const msg = (txt, at) => { const tm = setTimeout(() => { fb.className = 'quiz-feedback'; fb.innerHTML = txt; }, Math.max(0, (at - audio.now()) * 1000)); addCleanup(() => clearTimeout(tm)); };
      if (echo) { msg('Écoute…', t0 + barDur * 0.9); msg('Prépare-toi…', t0 + barDur * (q.bars + 1)); }
      else msg('Prépare-toi…', t0);
      msg('<b>À toi !</b>', answerStart - 0.05);
      const startPerf = audio.ctxToPerf(answerStart);
      const tapOpen = setTimeout(() => { taps = []; }, Math.max(0, (answerStart - audio.now()) * 1000 - spb * 400));
      addCleanup(() => clearTimeout(tapOpen));
      const endAt = answerStart + q.bars * barDur + spb * 0.5;
      const tm = setTimeout(() => {
        const got = (taps || []).slice();
        taps = null; running = false; goBtn.disabled = false;
        [...beatsBox.children].forEach(d => d.classList.remove('on'));
        evaluate(got, startPerf);
      }, Math.max(0, (endAt - audio.now()) * 1000) + 150);
      addCleanup(() => clearTimeout(tm));
    });

    const evaluate = (got, startPerf) => {
      const spbMs = spb * 1000;
      const tolMs = Math.max(110, spbMs * 0.2);
      const exp = q.onsets.map(o => startPerf + o * spbMs);
      const used = new Set();
      let hits = 0; const devs = [];
      for (const e of exp) {
        let best = -1, bd = Infinity;
        got.forEach((t, j) => { if (!used.has(j) && Math.abs(t - e) < bd) { bd = Math.abs(t - e); best = j; } });
        if (best >= 0 && bd <= tolMs) { used.add(best); hits++; devs.push(got[best] - e); }
      }
      const extra = got.length - used.size;
      state.tries++;
      const ok = hits === exp.length && extra === 0;
      if (echo) showStaff();
      const avg = devs.length ? Math.round(devs.reduce((a, b) => a + b, 0) / devs.length) : 0;
      if (ok) {
        fb.className = 'quiz-feedback ok';
        fb.innerHTML = `${state.tries === 1 ? 'Exact' : 'Oui'} : ${hits} note${hits > 1 ? 's' : ''} à temps${Math.abs(avg) > 40 ? ` (un peu ${avg > 0 ? 'en retard' : 'en avance'} en moyenne, ${Math.abs(avg)} ms)` : ''}.`;
        ctx.done(true, state.tries === 1);
      } else {
        fb.className = 'quiz-feedback bad';
        // décalage régulier (rythme juste mais en retard ou en avance) ?
        const devAll = got.map(t => { const e = exp.reduce((bb, x) => (Math.abs(t - x) < Math.abs(t - bb) ? x : bb), exp[0]); return t - e; });
        const medDev = median(devAll);
        const shifted = got.length >= exp.length - 1 && got.length <= exp.length + 1 && Math.abs(medDev) > tolMs * 0.8 && devAll.every(d => Math.sign(d) === Math.sign(medDev));
        fb.innerHTML = got.length === 0 ? 'Je n’ai rien reçu : tape sur la zone, sur une touche du piano ou sur la barre d’espace.'
          : shifted ? `Le rythme a l’air juste, mais décalé d’environ ${Math.round(Math.abs(medDev))} ms (${medDev > 0 ? 'en retard' : 'en avance'}). Tape bien avec les clics ; si le décalage persiste, calibre la latence dans les Réglages.`
            : `${hits} note${hits > 1 ? 's' : ''} sur ${exp.length} à temps${extra ? `, ${extra} en trop` : ''}. ${state.tries >= 3 ? '' : 'Réessaie.'}`;
        ctx.showTip();
        if (state.tries >= 3) ctx.done(false, false);
      }
    };
  };

  const finish = () => {
    clearQuestion();
    const pct = state.ok / total;
    body.innerHTML = '';
    body.append(h('div', { class: 'big-score' },
      h('div', {}, h('div', { class: 'v' }, fmtPct(pct)), h('div', { class: 'l' }, 'réussite du premier coup')),
      h('div', {}, h('div', { class: 'v' }, `${state.solved}/${total}`), h('div', { class: 'l' }, 'réussies au total')),
      h('div', {}, h('div', { class: 'v' }, `${Math.round((Date.now() - state.startAt) / 1000)} s`), h('div', { class: 'l' }, 'durée'))));
    const goal = cfg.goal ?? 0.8;
    body.append(h('p', { class: 'small', html: pct >= goal ? `Objectif atteint (${fmtPct(goal)}). Refais une série demain pour confirmer, puis passe à l’étape suivante.` : `Objectif : ${fmtPct(goal)}. Refais une série demain : dix minutes chaque jour valent mieux qu’une heure le dimanche.` }));
    body.append(h('div', { class: 'quiz-tip', html: `<b>Conseil.</b> ${pick(TIPS[cfg.tipKind || cfg.kind] || TIPS.degree)}` }));
    const again = h('button', { class: 'btn primary', type: 'button' }, 'Recommencer');
    again.addEventListener('click', start);
    body.append(again);
    if (cfg.stat) store.push('stats.ear', { id: cfg.stat, at: Date.now(), pct, total });
  };

  /* ---------- écran d'accueil ---------- */
  const intro = h('div');
  const defaultIntro = isSing ? 'Tu réponds en chantant : le micro de la tablette vérifie la hauteur (à l’octave près).'
    : isRhythm ? 'Tu réponds en tapant le rythme : sur une touche du piano, sur la zone prévue, ou sur la barre d’espace.'
      : playMode ? 'Tu réponds en jouant sur le piano (ou sur le clavier à l’écran).' : 'Tu réponds en touchant la bonne réponse.';
  intro.append(h('p', { class: 'small mt-0', html: `${total} questions. ${cfg.intro || defaultIntro}` }));
  if (cfg.tipKind || TIPS[cfg.kind]) intro.append(h('div', { class: 'quiz-tip', html: `<b>Conseil.</b> ${pick(TIPS[cfg.tipKind || cfg.kind] || TIPS.degree)}` }));
  let singMode = 'mic';
  if (isSing) {
    const voice = store.get('settings.voice') || 'grave';
    const vseg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Ta voix' });
    [['grave', 'Voix grave'], ['aigue', 'Voix aiguë']].forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: v === voice ? 'on' : '' }, l);
      b.addEventListener('click', () => { store.set('settings.voice', v); vseg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
      vseg.append(b);
    });
    const mseg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Mode de réponse' });
    const modes = [['mic', 'Au micro'], ['piano', 'Au piano'], ['self', 'Je m’évalue']];
    if (!pitch.supported) singMode = midi.status === 'ready' ? 'piano' : 'self';
    modes.forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: v === singMode ? 'on' : '' }, l);
      if (v === 'mic' && !pitch.supported) b.disabled = true;
      b.addEventListener('click', () => { singMode = v; mseg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
      mseg.append(b);
    });
    intro.append(h('div', { class: 'row mb-0', style: { marginBottom: '10px' } }, h('span', { class: 'small' }, 'Ta voix :'), vseg));
    intro.append(h('div', { class: 'row mb-0', style: { marginBottom: '10px' } }, h('span', { class: 'small' }, 'Réponse :'), mseg));
    intro.append(h('p', { class: 'small' }, 'Au micro, place la tablette à 30–50 cm, dans une pièce calme. Sans micro : chante, puis rejoue la note au piano, ou écoute la réponse et juge toi-même.'));
  }
  const msg = h('p', { class: 'small', style: { color: 'var(--err)' } });
  const go = h('button', { class: 'btn primary', type: 'button' }, 'Commencer');
  go.addEventListener('click', async () => {
    audio.ensure().catch(() => {});
    if (isSing && singMode === 'mic') {
      go.disabled = true; msg.textContent = 'Autorise l’accès au micro…';
      const ok = await pitch.start();
      go.disabled = false;
      if (!ok) {
        msg.textContent = pitch.state === 'denied' ? 'Accès au micro refusé. Réautorise-le dans les réglages du site (cadenas dans la barre d’adresse), ou choisis « Au piano » / « Je m’évalue ».' : 'Micro indisponible sur cet appareil : choisis « Au piano » ou « Je m’évalue ».';
        return;
      }
      micOn = true;
    }
    start();
  });
  let micOn = false;
  intro.append(go, msg);
  body.append(intro);
  return () => { clearQuestion(); if (micOn) pitch.stop(); };
}

/* ================================================================== */
/* Séries prêtes à l'emploi (pages Outils)                             */
/* ================================================================== */
export const EAR_PRESETS = [
  { group: '1 · Hauteur et voix', id: 'hl', title: 'Plus grave ou plus aigu ?', kind: 'highlow', minSt: 1, maxSt: 12 },
  { group: '1 · Hauteur et voix', id: 'contour', title: 'Le dessin d’une mélodie', kind: 'contour', notes: 3 },
  { group: '1 · Hauteur et voix', id: 'contour4', title: 'Le dessin d’une mélodie (4 notes)', kind: 'contour', notes: 4 },
  { group: '1 · Hauteur et voix', id: 'sing-match', title: 'Chanter une note entendue', kind: 'sing', task: 'match', count: 8 },
  { group: '2 · Degrés', id: 'deg-1', title: 'La tonique ou pas ?', kind: 'degree', binary: true, degrees: [1, 2, 3, 4, 5, 6, 7] },
  { group: '2 · Degrés', id: 'deg-123', title: 'Degrés 1, 2, 3 (do majeur)', kind: 'degree', degrees: [1, 2, 3], names: true },
  { group: '2 · Degrés', id: 'deg-15', title: 'Degrés 1 à 5 (do majeur)', kind: 'degree', degrees: [1, 2, 3, 4, 5], names: true },
  { group: '2 · Degrés', id: 'deg-18', title: 'Toute la gamme (do majeur)', kind: 'degree', degrees: [1, 2, 3, 4, 5, 6, 7, 8], names: true },
  { group: '2 · Degrés', id: 'deg-18r', title: 'Toute la gamme, toutes tonalités', kind: 'degree', degrees: [1, 2, 3, 4, 5, 6, 7, 8], key: 'random' },
  { group: '2 · Degrés', id: 'deg-min', title: 'Degrés en mineur', kind: 'degree', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7], key: 'random' },
  { group: '2 · Degrés', id: 'deg-min15', title: 'Degrés 1 à 5 en mineur (la mineur)', kind: 'degree', mode: 'min', degrees: [1, 2, 3, 4, 5], names: true },
  { group: '2 · Degrés', id: 'sing-min', title: 'Chanter en mineur', kind: 'sing', mode: 'min', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [5, 6, 5], [7, 8], [1, 3, 5]], count: 8 },
  { group: '2 · Degrés', id: 'sing-deg', title: 'Chanter les degrés 1, 3, 5', kind: 'sing', task: 'degree', degrees: [1, 3, 5], count: 8 },
  { group: '2 · Degrés', id: 'sing-seq', title: 'Chanter 1-2-3, 1-3-5, 5-4-3-2-1', kind: 'sing', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [1, 3, 5], [5, 4, 3, 2, 1]], count: 8 },
  { group: '3 · Mélodies', id: 'echo-3', title: 'Rejouer 3 notes (1 à 3)', kind: 'echo', degrees: [1, 2, 3], length: 3, count: 8 },
  { group: '3 · Mélodies', id: 'echo-5', title: 'Rejouer 4 notes (1 à 5)', kind: 'echo', degrees: [1, 2, 3, 4, 5], length: 4, count: 8 },
  { group: '3 · Mélodies', id: 'echo-8', title: 'Rejouer 5 notes (toute la gamme)', kind: 'echo', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 5, maxStep: 2, count: 8 },
  { group: '3 · Mélodies', id: 'echo-8r', title: 'Rejouer 5 notes (toutes tonalités)', kind: 'echo', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 5, maxStep: 2, count: 8, key: 'random' },
  { group: '3 · Mélodies', id: 'echo-bass', title: 'Rejouer une basse (degrés 1, 4, 5, 6)', kind: 'echo', degrees: [1, 4, 5, 6, 8], length: 4, maxStep: 3, count: 8 },
  { group: '3 · Mélodies', id: 'echo-min', title: 'Rejouer 5 notes en mineur', kind: 'echo', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 5, maxStep: 2, count: 8, key: 'random' },
  { group: '3 · Mélodies', id: 'sing-echo', title: 'Rechanter une mélodie', kind: 'sing', task: 'echo', degrees: [1, 2, 3, 4, 5], length: 3, count: 8 },
  { group: '4 · Rythme', id: 'ry-1', title: 'Noires, blanches, rondes', kind: 'rhythm', cells: ['q', 'h', 'w', 'qr'], count: 8, bpm: 72 },
  { group: '4 · Rythme', id: 'ry-2', title: 'Avec des croches', kind: 'rhythm', cells: ['q', 'h', 'ee', 'qr'], count: 8, bpm: 72 },
  { group: '4 · Rythme', id: 'ry-3', title: 'Pointés et syncopes', kind: 'rhythm', cells: ['q', 'ee', 'qd_e', 'e_q_e', 'h'], count: 8, bpm: 66 },
  { group: '4 · Rythme', id: 'ry-4', title: 'Doubles croches et triolets', kind: 'rhythm', cells: ['q', 'ee', 'ssss', 'e_ss', 'ss_e', 'trip'], count: 8, bpm: 60 },
  { group: '4 · Rythme', id: 'ry-34', title: 'À trois temps', kind: 'rhythm', meter: 3, cells: ['q', 'h', 'ee', 'qd_e', 'trip'], count: 8, bpm: 66 },
  { group: '5 · Intervalles', id: 'iv-a', title: 'Tierce majeure, quarte, quinte, octave', kind: 'intervals', set: ['3M', '4J', '5J', '8ve'] },
  { group: '5 · Intervalles', id: 'iv-b', title: 'Secondes et tierces', kind: 'intervals', set: ['2m', '2M', '3m', '3M'] },
  { group: '5 · Intervalles', id: 'iv-n1', title: 'De la seconde à la quinte, et l’octave', kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', '5J', '8ve'] },
  { group: '5 · Intervalles', id: 'iv-c', title: 'Sixtes, septièmes, triton', kind: 'intervals', set: ['Triton', '6m', '6M', '7m', '7M', '8ve'] },
  { group: '5 · Intervalles', id: 'iv-n1-down', title: 'De la seconde à l’octave, en descendant', kind: 'intervals', set: ['2M', '3m', '3M', '4J', '5J', '8ve'], directions: ['down'] },
  { group: '5 · Intervalles', id: 'iv-harm', title: 'Intervalles harmoniques (notes ensemble)', kind: 'intervals', set: ['3m', '3M', '4J', '5J', '6m', '6M', '8ve'], directions: ['harm'] },
  { group: '5 · Intervalles', id: 'iv-all', title: 'Tous les intervalles (montants, descendants, harmoniques)', kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', 'Triton', '5J', '6m', '6M', '7m', '7M', '8ve'], directions: ['up', 'down', 'harm'] },
  { group: '5 · Intervalles', id: 'sing-iv', title: 'Chanter une tierce, une quinte, une octave', kind: 'sing', task: 'interval', set: ['3M', '5J', '8ve'], count: 8 },
  { group: '6 · Accords et cadences', id: 'ch-mm', title: 'Majeur ou mineur ?', kind: 'chords', set: ['M', 'm'] },
  { group: '6 · Accords et cadences', id: 'ch-n1', title: 'Majeur, mineur, diminué, augmenté', kind: 'chords', set: ['M', 'm', 'dim', 'aug'] },
  { group: '6 · Accords et cadences', id: 'sing-arp', title: 'Chanter l’arpège (majeur)', kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [1, 3, 5, 8]], count: 6 },
  { group: '6 · Accords et cadences', id: 'func2', title: 'Après le I : ii, IV, V ou vi ?', kind: 'chordfunc', set: ['ii', 'IV', 'V', 'vi'] },
  { group: '6 · Accords et cadences', id: 'cad-maj', title: 'Les quatre cadences (majeur)', kind: 'cadences', modes: ['maj'] },
  { group: '6 · Accords et cadences', id: 'cad-2', title: 'Fin ou suspension ?', kind: 'cadences', set: ['parfaite', 'demi'], labels: { parfaite: 'Fin (parfaite)', demi: 'Suspension (demi-cadence)' } },
  { group: '6 · Accords et cadences', id: 'cad', title: 'Les quatre cadences', kind: 'cadences' },
  { group: '6 · Accords et cadences', id: 'func', title: 'Après le I : IV, V ou vi ?', kind: 'chordfunc', set: ['IV', 'V', 'vi'] },
  { group: '6 · Accords et cadences', id: 'ch-n2', title: 'Accords de septième', kind: 'chords', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'] },
  { group: '6 · Accords et cadences', id: 'ch7-a', title: 'Septième de dominante ou septième majeure ?', kind: 'chords', set: ['7', 'maj7'] },
  { group: '6 · Accords et cadences', id: 'ch7-b', title: 'Trois septièmes', kind: 'chords', set: ['7', 'maj7', 'm7'] },
  { group: '6 · Accords et cadences', id: 'sc', title: 'Gammes majeures et mineures', kind: 'scales' },
];

export const THEORY_PRESETS = [
  { group: 'Le clavier', id: 'kname', title: 'Nommer les touches blanches', kind: 'keyname' },
  { group: 'Le clavier', id: 'kname-b', title: 'Nommer les touches noires', kind: 'keyname', black: 'only' },
  { group: 'Le clavier', id: 'findnote', title: 'Trouver une note au piano', kind: 'findnote', count: 10 },
  { group: 'Le clavier', id: 'pscale', title: 'Jouer une gamme majeure', kind: 'playscale', keys: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'], count: 6 },
  { group: 'Lire les notes', id: 'notes-t', title: 'Notes en clé de sol', kind: 'notes', clefs: ['treble'] },
  { group: 'Lire les notes', id: 'notes-b', title: 'Notes en clé de fa', kind: 'notes', clefs: ['bass'] },
  { group: 'Lire les notes', id: 'notes-play', title: 'Notes à jouer au piano (les deux clés)', kind: 'notes', mode: 'play' },
  { group: 'Rythme et mesure', id: 'mfill', title: 'Compléter la mesure', kind: 'measurefill', values: ['w', 'hd', 'h', 'q', 'e'] },
  { group: 'Rythme et mesure', id: 'rread-1', title: 'Lire un rythme (noires, blanches, croches)', kind: 'rhythm', task: 'read', cells: ['q', 'h', 'ee', 'qr'], count: 8 },
  { group: 'Rythme et mesure', id: 'rread-2', title: 'Lire un rythme (pointés, syncopes)', kind: 'rhythm', task: 'read', cells: ['q', 'ee', 'qd_e', 'e_q_e', 'h'], count: 8, bpm: 66 },
  { group: 'Gammes et tonalités', id: 'kdeg', title: 'Les degrés d’une gamme majeure', kind: 'keydegree' },
  { group: 'Gammes et tonalités', id: 'ks-maj', title: 'Armures : tonalités majeures', kind: 'keysig', keys: ['C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db'] },
  { group: 'Gammes et tonalités', id: 'ks-min', title: 'Armures : tonalités mineures', kind: 'keysig', minor: true, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'] },
  { group: 'Intervalles et accords', id: 'ivs-q', title: 'Intervalles écrits : la quantité', kind: 'intervalsight', quality: false, set: ['2M', '3M', '4J', '5J', '6M', '7m', '8ve'] },
  { group: 'Intervalles et accords', id: 'ivs', title: 'Intervalles écrits : quantité et qualité', kind: 'intervalsight', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '7M', '8ve'] },
  { group: 'Intervalles et accords', id: 'chs', title: 'Accords écrits : nature et renversement', kind: 'chordsight', set: ['M', 'm'], inversions: [0, 1, 2] },
  { group: 'Intervalles et accords', id: 'chs4', title: 'Accords écrits : les quatre natures', kind: 'chordsight', set: ['M', 'm', 'dim', 'aug'], inversions: [0] },
  { group: 'Intervalles et accords', id: 'chs7', title: 'Accords de septième écrits : nature', kind: 'chordsight', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'], inversions: [0] },
  { group: 'Intervalles et accords', id: 'chs-v7', title: 'Septième de dominante écrite : quel renversement ?', kind: 'chordsight', set: ['7'], inversions: [0, 1, 2, 3] },
  { group: 'Intervalles et accords', id: 'play-fm', title: 'Jouer les fonctions en fa mineur', kind: 'playchord', mode: 'play' },
];

/** Compatibilité : toutes les séries. */
export const QUIZ_PRESETS = [...EAR_PRESETS, ...THEORY_PRESETS];

/** Accès pour les tests automatiques. */
export { GEN as _GEN, genRhythm as _genRhythm, rhythmAbc as _rhythmAbc };
