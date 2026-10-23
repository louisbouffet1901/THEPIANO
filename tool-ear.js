// Exercices d'oreille et de théorie : écoute, chant au micro, jeu au piano, rythme, lecture.
import { scheduleCountIn } from './countin.js';
import { h, esc, pick, shuffle, randInt, fmtPct, noteNameFr, capitalize, median, isBlack, INTERVALS, CHORDS, SCALES, KEYS, midiToAbc, pc } from './util.js';
import { audio } from './audio.js';
import { midi } from './midi.js';
import { store } from './store.js';
import { keyboard } from './diagrams.js';
import { pitch, octaveDiff, sungName } from './pitch.js';
import { VoiceTrace, coachLine, adviceFor, seriesAdvice, voiceRange, voiceRangeLabel } from './voice.js';
import { inputLatency } from './latency.js';
import * as TH from './theory.js';

const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor"/></svg>';

/* ================================================================== */
/* Audio                                                               */
/* ================================================================== */
/** Modèle à imiter dans les exercices de chant (V7.2) : le piano, ou un son tenu (plus facile à imiter pour beaucoup). */
const singModel = () => (store.get('settings.singTarget') === 'tone' ? 'tone' : 'piano');
/** Joue une liste de notes {m, t, d, v} (secondes). Renvoie la durée totale en ms. En chant (opts.sing), les notes à
 *  imiter (v ≥ 76 ; les accords de la cadence sont plus doux) prennent le modèle choisi. */
async function playNotes(list, opts = {}) {
  audio.claim('quiz', () => audio.stopAll('quiz'));
  await audio.ensure();
  const t0 = audio.now() + 0.06;
  const tone = opts.sing && singModel() === 'tone';
  let end = 0;
  for (const n of list) {
    if (tone && (n.v || 72) >= 76) audio.tone(n.m, t0 + n.t, { dur: n.d, owner: 'quiz', gain: 0.2 });
    else {
      const v = audio.noteOn(n.m, n.v || 72, t0 + n.t, { owner: 'quiz' });
      if (v) audio.noteOff(v, t0 + n.t + n.d);
    }
    end = Math.max(end, n.t + n.d);
  }
  return (0.06 + end) * 1000;
}
const playSing = list => playNotes(list, { sing: true });
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
/** Une mélodie en degrés (majeur), écrite avec l'armure : noires, la dernière en blanche ; tonique à l'octave 4. */
function degreesAbc(keyName, degs, { tonicAbcOct = 4 } = {}) {
  const li = LET.indexOf(keyName[0]);
  const oct = tonicAbcOct;
  const note = d => {
    const step = li + d - 1;
    const o = oct + Math.floor(step / 7);
    const L = LET[step % 7];
    return o >= 5 ? L.toLowerCase() + "'".repeat(o - 5) : L + ','.repeat(4 - o);
  };
  const body = degs.map((d, i) => note(d) + (i === degs.length - 1 ? '2' : '')).join(' ');
  return `X:1\nM:none\nL:1/4\nK:${keyName}\n${body} |]`;
}
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
  sing: ['Regarde la ligne pendant que tu chantes : si elle est sous la bande verte, monte doucement ; au-dessus, descends. Tes yeux guident ta voix.', 'Pas de note dans la voix ? Chante d’abord n’importe quelle note, puis glisse lentement jusqu’à la bande verte : c’est plus facile que de viser du premier coup.', 'Avant de chanter, entends la note dans ta tête pendant une seconde de silence.', 'Commence bouche fermée (« mmm ») : c’est plus facile de trouver la hauteur, puis ouvre sur « la ».', 'Trop bas ou trop haut ? Ne force pas : glisse doucement, comme une sirène, jusqu’à ce que la ligne entre dans la bande verte.', 'Chante dans ton octave confortable : peu importe que tu sois une octave en dessous du piano.', 'Respire avant de chanter, puis tiens le son calmement, sans pousser : un son tenu et détendu est plus juste.', 'Fais d’abord la note au piano, puis chante-la en même temps, puis seul : c’est l’ordre naturel.'],
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
  earnote: ['Chante la note avant de chercher : ta voix la garde pendant que tes doigts cherchent.', 'Joue une touche et compare : plus haut ou plus bas ? Puis rapproche-toi, touche par touche.', 'Le bouton « Do, pour repère » joue un do avant la note : écoute l’écart entre les deux.'],
  read: ['Chante d’abord la tonique, puis suis la portée du doigt : une marche, c’est la note voisine ; un saut, une note sautée.', 'Repère les notes de l’accord (1, 3, 5) : ce sont tes points d’appui, les autres notes sont leurs voisines.', 'Entends la mélodie lentement dans ta tête avant de chanter : si tu ne l’entends pas encore, relis-la note par note.'],
  measurefill: ['Compte en croches : une noire = 2, une blanche = 4, une ronde = 8.', 'Le point ajoute la moitié de la valeur : blanche pointée = 3 temps.'],
  keydegree: ['Écris (ou chante) toute la gamme depuis la tonique, puis compte jusqu’au degré demandé.', 'N’oublie pas les altérations de l’armure : en ré majeur, fa et do sont dièses.'],
  playchord: ['Construis l’accord en empilant des tierces depuis la fondamentale.', 'Vérifie la tierce : c’est elle qui fait majeur ou mineur.'],
  chordsight: ['Range les notes en tierces pour trouver la fondamentale, puis regarde quelle note est à la basse.'],
  relative: ['Relative mineure : trois demi-tons (une tierce mineure) sous la tonique majeure. Sur le clavier : compte trois touches vers la gauche.', 'Relative majeure : trois demi-tons au-dessus de la tonique mineure.', 'Une tonalité et sa relative ont la même armure : seule la note de repos change.'],
  sigcount: ['Avec des dièses, le dernier dièse est la sensible : un demi-ton sous la tonique (fa♯ → sol majeur, do♯ → ré majeur).', 'Avec des bémols, l’avant-dernier bémol est la tonique (si♭ mi♭ la♭ → mi♭ majeur). Un seul bémol : fa majeur.', 'Une tonalité mineure a l’armure de sa relative majeure, trois demi-tons plus haut.'],
  triadkey: ['Écris la gamme, puis empile une note sur deux à partir du degré : degré 2 en do → ré, fa, la.', 'En majeur : majeurs sur 1, 4, 5 ; mineurs sur 2, 3, 6 ; diminué sur 7.'],
  funckey: ['Tonique : I (et vi qui la remplace). Sous-dominante : IV et ii. Dominante : V, V7 et vii°.', 'Retrouve d’abord le degré de l’accord dans la tonalité, puis sa fonction.'],
  ivfind: ['Compte d’abord les noms de notes (une tierce = trois noms : ré, mi, fa), puis les demi-tons pour l’altération.', 'Le nom de la note est fixé par la quantité : une tierce au-dessus de ré est toujours une sorte de fa (fa, fa♯…), jamais un sol♭.'],
  chordspell: ['Fondamentale, puis une note sur deux : ré (mi) fa (sol) la. Puis ajuste la tierce : 4 demi-tons pour majeur, 3 pour mineur.', 'La quinte juste fait 7 demi-tons au-dessus de la fondamentale.'],
  secdom: ['La dominante se bâtit une quinte au-dessus de l’accord visé : la dominante de ré est la (la, si, do, ré, mi : cinq noms).', 'Sur cette note, un accord majeur avec septième mineure : la 7 = la – do♯ – mi – sol. Sa tierce (do♯) est la sensible de l’accord visé.'],
};
const tipFor = (kind, q) => q.tip || pick(TIPS[q.tipKind || kind] || TIPS.degree);

/* ================================================================== */
/* Générateurs de questions                                            */
/* ================================================================== */
/* Motifs de tes pièces (V4) : vraies notes (MIDI) et durées (en noires), relevées sur les partitions vérifiées. */
const PIECE_MOTIFS = {
  'op55-a': { src: 'Nocturne op. 55 n° 1, le thème (mesures 0 à 1)', notes: [72, 77, 75, 73, 72], durs: [2, 1, 1, 1, 2], tonic: 5, mode: 'min', names: 'do – fa – mi♭ – ré♭ – do' },
  'op55-b': { src: 'Nocturne op. 55 n° 1, la broderie (mesure 2)', notes: [72, 71, 72, 73, 72], durs: [0.75, 0.25, 0.75, 0.25, 2], tonic: 5, mode: 'min', names: 'do – si♮ – do – ré♭ – do' },
  'op55-c': { src: 'Nocturne op. 55 n° 1, le thème entier (mesures 0 à 2)', notes: [72, 77, 75, 73, 72, 71, 72, 73, 72], durs: [2, 1, 1, 1, 0.75, 0.25, 0.75, 0.25, 2], tonic: 5, mode: 'min', names: 'do – fa – mi♭ – ré♭ – do – si♮ – do – ré♭ – do' },
  'op15-a': { src: 'Nocturne op. 15 n° 1, le début (mesures 0 à 2)', notes: [72, 77, 76, 74, 76, 72], durs: [1, 2, 1, 1, 1, 1], tonic: 5, mode: 'maj', names: 'do – fa – mi – ré – mi – do' },
  'op15-b': { src: 'Nocturne op. 15 n° 1, la montée (mesures 3 à 4)', notes: [74, 76, 77, 79, 81], durs: [0.75, 0.25, 1, 1, 3], tonic: 5, mode: 'maj', names: 'ré – mi – fa – sol – la' },
  'op70-a': { src: 'Valse op. 70 n° 2, le début (mesures 0 à 2)', notes: [72, 73, 72, 70, 68, 67, 65, 65], durs: [2, 0.5, 0.5, 0.5, 0.5, 1.5, 0.5, 1], tonic: 5, mode: 'min', names: 'do – ré♭ – do – si♭ – la♭ – sol – fa – fa' },
};
/** Un motif de pièce, sans répéter le précédent ; cadence dans la tonalité de la pièce. */
function pieceMotif(cfg, st) {
  const keys = cfg.motifs.filter(k => PIECE_MOTIFS[k]);
  let k = pick(keys);
  if (keys.length > 1) { let g = 0; while (k === st?.lastMotif && g++ < 20) k = pick(keys); }
  if (st) st.lastMotif = k;
  const M = PIECE_MOTIFS[k];
  const tr = ((M.tonic - (M.mode === 'maj' ? 0 : 9) + 18) % 12) - 6; // transposition de la cadence (do majeur / la mineur → tonalité de la pièce)
  const cad = cadenceNotes(tr, M.mode);
  const beat = cfg.beat || 0.5;
  const timed = (ms, t0, slow = 1) => { let t = t0; return ms.map((m, i) => { const n = { m, t, d: M.durs[i] * beat * slow * 0.95, v: 80 }; t += M.durs[i] * beat * slow; return n; }); };
  return { M, k, cad, timed, beat, key: keyFr(M.tonic, M.mode) };
}


/* Aides des séries de théorie V6 */
const CH_FR = { M: 'majeur', m: 'mineur', dim: 'diminué', aug: 'augmenté', '7': '7', maj7: 'maj7', m7: 'm7', hdim7: 'ø7', dim7: '°7' };
const uniq = arr => [...new Set(arr)];
const keyLabel = (t, mode) => `${TH.noteName(t)} ${mode === 'maj' ? 'majeur' : 'mineur'}`;
const sigLabel = sig => (sig.count === 0 ? 'aucune altération' : `${Math.abs(sig.count)} ${sig.count > 0 ? 'dièse' : 'bémol'}${Math.abs(sig.count) > 1 ? 's' : ''} (${sig.list.join(', ')})`);
/** Tonalité d'après un code ('Bb', 'Fm') ou un nom français ('si♭', 'fa mineur'). */
function tonicOf(k) {
  if (KEYS[k]) { const [n] = KEYS[k].fr.split(' '); return { t: TH.parseNote(n), mode: KEYS[k].mode }; }
  const m = String(k).match(/^(\S+)(?:\s+(majeur|mineur))?$/);
  return { t: TH.parseNote(m[1]), mode: m[2] === 'mineur' ? 'min' : 'maj' };
}
/** Tirage sans répéter le précédent. */
function pickNew(pool, st, key) {
  let x = pick(pool), g = 0;
  while (pool.length > 1 && x === st[key] && g++ < 20) x = pick(pool);
  st[key] = x;
  return x;
}

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
    const [vlo, vhi] = voiceRange();                     // tessiture mesurée, sinon voix grave / aiguë
    const mode = cfg.mode || 'maj';
    if (task === 'match') {
      // ambitus adapté : il se resserre au milieu de ta voix après un échec, s'élargit après une réussite
      const base = cfg.span || 7;
      if (st.span == null) st.span = base;
      const span = st.span;
      const mid = Math.round((vlo + vhi) / 2);
      let m, guard = 0;
      do { m = randInt(mid - span, mid + span); guard++; } while (guard < 50 && ((cfg.white !== false && isBlack(m)) || m === st.lastSing));
      st.lastSing = m;
      const len = span < base ? 2.3 : 1.7; // note de référence plus longue quand c'est difficile
      return {
        type: 'sing', tipKind: 'sing',
        prompt: 'Écoute la note, puis chante-la (bouche fermée « mmm », ou sur « la »).',
        play: () => playSing([{ m, t: 0, d: len, v: 80 }]),
        targets: [m], labels: [noteNameFr(m, { octave: false })],
        explain: `La note était un <b>${noteNameFr(m, { octave: false })}</b> (${noteNameFr(m)}).`,
        reveal: () => playSing([{ m, t: 0, d: 1.3, v: 80 }]),
        onAnswer: ok => { st.span = ok ? Math.min(base, st.span + 1) : Math.max(3, st.span - 2); },
        status: span < base ? 'Notes resserrées au milieu de ta voix, et plus longues, le temps de trouver tes repères.' : '',
      };
    }
    // tonalité : do majeur (ou la mineur) par défaut, au hasard, ou parmi une liste (transpositions en demi-tons)
    const tr = cfg.keys ? pick(cfg.keys) : cfg.key === 'random' ? randInt(-5, 6) : 0;
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
        type: 'sing', tipKind: 'degree', tonic: T,
        prompt: `Écoute la cadence en ${keyFr(tonicPc, mode)}, puis chante le degré <b>${deg}</b>${deg === 1 ? ' (la tonique)' : ''}.`,
        play: () => playSing(cad.notes), targets: [target], labels: [String(deg)],
        explain: `Le degré ${deg} de ${keyFr(tonicPc, mode)} est <b>${nm(deg)}</b> : ${DEG_FEEL[mode][deg]}`,
        reveal: () => playSing(resolution(target, deg, mode, 0)),
        hint: { label: 'Indice : la tonique', play: () => playSing([{ m: T, t: 0, d: 1.4, v: 80 }]), note: deg === 1 ? 'Chante exactement cette note.' : `Chante la tonique (1), puis monte la gamme en comptant (1, 2, 3…) jusqu’à ${deg}.` },
      };
    }
    if (task === 'hold') {
      // tenir une note, droite, plusieurs secondes : la stabilité avant la justesse des intervalles
      const span = cfg.span || 3;
      const mid = Math.round((vlo + vhi) / 2);
      let m, guard = 0;
      do { m = randInt(mid - span, mid + span); guard++; } while (guard < 50 && (isBlack(m) || m === st.lastSing));
      st.lastSing = m;
      const holdMs = cfg.holdMs || 3000;
      return {
        type: 'sing', tipKind: 'sing', holdMs,
        prompt: `Écoute la note, puis chante-la et <b>tiens-la ${holdMs / 1000} secondes</b>, bien droite : la ligne reste dans la bande verte, l’aiguille au milieu.`,
        play: () => playSing([{ m, t: 0, d: 2.2, v: 80 }]),
        targets: [m], labels: [noteNameFr(m, { octave: false })],
        explain: `La note : <b>${noteNameFr(m, { octave: false })}</b> (${noteNameFr(m)}).`,
        reveal: () => playSing([{ m, t: 0, d: 2, v: 80 }]),
        hint: { label: 'Indice : la note, longue', play: () => playSing([{ m, t: 0, d: 4, v: 78 }]), note: 'Fredonne avec le piano pendant qu’il joue, puis continue seul, sur la même note, sans pousser : le souffle régulier tient la note.' },
      };
    }
    if (task === 'glide') {
      // deux notes : chanter la première, puis glisser jusqu'à la seconde en regardant la ligne
      const mid = Math.round((vlo + vhi) / 2);
      const dist = pick(cfg.dists || [2, 3, 4, 5, -2, -3, -4]);
      let a = randInt(mid - 2, mid + 1);
      if (isBlack(a)) a++;
      const b = a + dist;
      const nm = m => noteNameFr(m, { octave: false });
      const steps = [];
      for (let k = 0, x = a; k <= Math.abs(dist); k++, x += Math.sign(dist)) steps.push(x);
      return {
        type: 'sing', tipKind: 'sing', holdMs: 400,
        prompt: `Deux notes. Chante la première, puis <b>glisse lentement</b> jusqu’à la seconde, comme une sirène : la ligne ${dist > 0 ? 'monte' : 'descend'} vers la nouvelle bande verte, et tu t’y arrêtes.`,
        play: () => playSing([{ m: a, t: 0, d: 1.2, v: 80 }, { m: b, t: 1.35, d: 1.4, v: 80 }]),
        targets: [a, b], labels: ['départ', 'arrivée'],
        explain: `De <b>${nm(a)}</b> à <b>${nm(b)}</b> : ${Math.abs(dist)} demi-tons ${dist > 0 ? 'plus haut' : 'plus bas'}.`,
        reveal: () => playSing([{ m: a, t: 0, d: 0.9, v: 80 }, { m: b, t: 1.0, d: 1.2, v: 80 }]),
        hint: { label: 'Indice : le chemin', play: () => playSing(steps.map((x, i) => ({ m: x, t: i * 0.3, d: i === steps.length - 1 ? 1.2 : 0.28, v: 76 }))), note: 'Le piano joue toutes les notes entre les deux : ta voix passe par le même chemin, mais sans s’arrêter.' },
      };
    }
    if (task === 'seq') {
      const seq = pick(cfg.seqs || [[1, 2, 3]]);
      const targets = seq.map(d => T + degOffset(d, mode));
      const pre = cfg.giveFirst ? [{ m: targets[0], t: cad.end + 0.3, d: 1, v: 78 }] : [];
      return {
        type: 'sing', tipKind: 'degree', tonic: T,
        prompt: `Après la cadence${cfg.giveFirst ? ' et la première note' : ''}, chante : <b>${seq.join(' – ')}</b>${cfg.syllables ? ` (${seq.map(nm).join(' – ')})` : ''}.`,
        play: () => playSing([...cad.notes, ...pre]), targets, labels: seq.map(String),
        explain: `En ${keyFr(tonicPc, mode)} : ${seq.map(d => `${d} = ${nm(d)}`).join(', ')}.`,
        reveal: () => playSing(targets.map((m, i) => ({ m, t: i * 0.55, d: 0.55, v: 78 }))),
        hint: { label: 'Indice : la première note', play: () => playSing([{ m: targets[0], t: 0, d: 1.4, v: 80 }]), note: 'Pars de cette note, puis avance degré par degré, lentement : chaque note doit entrer dans la bande verte.' },
      };
    }
    if (task === 'echo' && cfg.motifs) {
      const { M, cad, timed, key } = pieceMotif(cfg, st);
      const mean = M.notes.reduce((a, b) => a + b, 0) / M.notes.length;
      const shift = 12 * Math.round(((vlo + vhi) / 2 - mean) / 12); // à l'octave de ta voix
      const targets = M.notes.map(m => m + shift);
      return {
        type: 'sing', tipKind: 'echo',
        prompt: `Écoute la cadence et le motif, puis rechante-le (sur « la », ou avec les noms des notes).`,
        play: () => playSing([...cad.notes, ...timed(M.notes, cad.end + 0.4)]),
        targets, labels: M.names.split(' – '),
        explain: `${M.src}, en ${key} : <b>${M.names}</b>.`,
        reveal: () => playSing(timed(M.notes, 0)),
        hint: { label: 'Indice : le motif, lentement', play: () => playSing(timed(M.notes, 0, 1.8)), note: 'Chante-le d’abord dans ta tête en suivant les notes, puis à voix haute, une note à la fois : chaque note doit entrer dans la bande verte.' },
      };
    }
    if (task === 'echo') {
      const mel = randomMelody(cfg.degrees || [1, 2, 3], cfg.length || 3, cfg.maxStep || 1, cfg.startTonic !== false, cfg.endTonic);
      const targets = mel.map(d => T + degOffset(d, mode));
      const playMs = targets.map(m => m + 12 * Math.round((60 - T) / 12));
      return {
        type: 'sing', tipKind: 'echo', tonic: T,
        prompt: 'Écoute la cadence et la mélodie, puis rechante-la.',
        play: () => playSing([...cad.notes, ...playMs.map((m, i) => ({ m, t: cad.end + 0.35 + i * 0.6, d: 0.58, v: 80 }))]),
        targets, labels: mel.map(() => '•'),
        explain: `La mélodie : <b>${mel.join(' – ')}</b> (${mel.map(nm).join(' – ')}).`,
        reveal: () => playSing(playMs.map((m, i) => ({ m, t: i * 0.6, d: 0.58, v: 80 }))),
        hint: { label: 'Indice : la mélodie, lentement', play: () => playSing(playMs.map((m, i) => ({ m, t: i * 1.0, d: 0.95, v: 80 }))), note: 'Chante-la en même temps dans ta tête, puis à voix haute, note par note.' },
      };
    }
    if (task === 'bass') {
      // la basse d'un enchaînement d'accords, chantée : on écoute en bas, pas la mélodie
      const prog = pick(cfg.progs || [['I', 'IV', 'V', 'I'], ['I', 'V', 'vi', 'IV'], ['I', 'vi', 'IV', 'V'], ['I', 'IV', 'I', 'V']]);
      const BASS = { I: 1, ii: 2, IV: 4, V: 5, vi: 6 };
      const degs = prog.map(c => BASS[c]);
      const targets = degs.map(d => T + degOffset(d, 'maj') - (d >= 5 && T + degOffset(d, 'maj') > vhi ? 12 : 0));
      const chords = [];
      prog.forEach((c, i) => VOICE_MAJ[c].forEach(m => chords.push({ m: m + tr, t: cad.end + 0.4 + i * 1.0, d: 0.95, v: 64 })));
      return {
        type: 'sing', tipKind: 'chordfunc', tonic: T,
        prompt: `Après la cadence, quatre accords en ${keyFr(tonicPc, mode)}. Chante leur <b>basse</b>, la note la plus grave de chacun (${degs.length} notes).`,
        play: () => playSing([...cad.notes, ...chords]), targets, labels: prog,
        explain: `La basse : <b>${degs.join(' – ')}</b> (${degs.map(nm).join(' – ')}), sous ${prog.join(' – ')}.`,
        reveal: () => playSing(targets.map((m, i) => ({ m, t: i * 0.6, d: 0.58, v: 80 }))),
        hint: { label: 'Indice : la basse seule', play: () => playSing(targets.map((m, i) => ({ m, t: i * 0.9, d: 0.85, v: 80 }))), note: 'Chante la tonique, puis suis la basse : 4 monte d’une quarte, 5 d’une quinte, 6 d’une sixte (ou descend d’une tierce).' },
      };
    }
    if (task === 'read') {
      // lecture intérieure (Kodály) : la mélodie est écrite ; tu l'entends dans ta tête, tu la chantes, puis elle sonne
      const keyName = keyNameFor(tonicPc, 'maj');
      const mel = randomMelody(cfg.degrees || [1, 2, 3, 4, 5], cfg.length || 5, cfg.maxStep || 1, true, true);
      const targets = mel.map(d => T + degOffset(d, 'maj'));
      const written = degreesAbc(keyName, mel, { tonicAbcOct: 4 });
      return {
        type: 'sing', tipKind: 'read', tonic: T,
        prompt: `Lis la mélodie (${keyFr(tonicPc, 'maj')}). Après la cadence et la tonique, <b>entends-la dans ta tête</b>, puis chante-la. Elle ne sonne qu’après.`,
        staff: written,
        play: () => playSing([...cad.notes, { m: T, t: cad.end + 0.35, d: 1.2, v: 80 }]), targets, labels: mel.map(String),
        explain: `La mélodie : <b>${mel.join(' – ')}</b> (${mel.map(nm).join(' – ')}).`,
        reveal: () => playSing(targets.map((m, i) => ({ m, t: i * 0.6, d: i === targets.length - 1 ? 1 : 0.58, v: 80 }))),
        hint: { label: 'Indice : la première note', play: () => playSing([{ m: targets[0], t: 0, d: 1.4, v: 80 }]), note: 'Chante la tonique, puis avance pas à pas en suivant la portée du doigt : une marche = la note voisine.' },
      };
    }
    if (task === 'interval') {
      const set = (cfg.set || ['3M', '5J', '8ve']).map(s => IV_SHORT_TO_ST[s]);
      const stp = pick(set);
      const a = randInt(vlo, vhi - stp);
      return {
        type: 'sing', tipKind: 'intervals',
        prompt: `Écoute la note, puis chante une <b>${INTERVALS.find(x => x.st === stp).name}</b> au-dessus.`,
        play: () => playSing([{ m: a, t: 0, d: 1.4, v: 80 }]), targets: [a + stp], labels: [IV_LABEL[stp]],
        explain: `${noteNameFr(a, { octave: false })} → <b>${noteNameFr(a + stp, { octave: false })}</b>. Repère : ${IV_REF[stp]}.`,
        reveal: () => playSing([{ m: a, t: 0, d: 0.8 }, { m: a + stp, t: 0.85, d: 1.2 }]),
        hint: { label: 'Indice : les marches', play: () => { const steps = [0, 2, 4, 5, 7, 9, 11, 12].filter(x => x <= stp); if (steps[steps.length - 1] !== stp) steps.push(stp); return playSing(steps.map((x, i) => ({ m: a + x, t: i * 0.45, d: i === steps.length - 1 ? 1.2 : 0.42, v: 78 }))); }, note: `Chante la note de départ, puis monte la gamme jusqu’à l’arrivée (${IV_REF[stp]}).` },
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
      explain: `C’était le degré <b>${d}</b>${d < 8 ? ` (${DEG_NAMES[d]})` : ''}, ${d === 8 ? names[0] : names[d - 1]} en ${keyFr(tonicPc, mode)} : ${DEG_FEEL[mode][d]} <span class="small">Chante la résolution avec le piano : <b>${resolutionPath(d).join(' – ')}</b>.</span>`,
      after: () => playNotes(resolution(target, d, mode, 0.1)),
      conf: cfg.binary ? null : { kind: mode === 'maj' ? 'deg-maj' : 'deg-min', item: String(d) },
      status: cfg.key === 'random' ? `Tonalité : ${keyFr(tonicPc, mode)}` : '',
    };
  },

  /** Dictée jouée : écouter une courte mélodie et la rejouer au piano. */
  echo(cfg, st) {
    if (cfg.motifs) {
      const { M, cad, timed, key } = pieceMotif(cfg, st);
      const ms = M.notes;
      const lo = Math.min(...ms) - 7, hi = Math.max(...ms) + 7;
      return {
        type: 'play', tipKind: 'echo',
        playTask: `Écoute (la cadence, puis le motif), puis rejoue-le (${ms.length} notes). Il commence sur <b>${M.names.split(' – ')[0]}</b> (${key}).`,
        play: () => playNotes([...cad.notes, ...timed(ms, cad.end + 0.4)]),
        extra: { label: 'Le motif, lentement', fn: () => playNotes(timed(ms, 0, 1.8)) },
        expect: ms.length,
        check: played => played.length === ms.length && played.every((m, i) => pc(m) === pc(ms[i])),
        diff: played => played.map((m, i) => (pc(m) === pc(ms[i]) ? '✓' : '✗')).join(' '),
        explain: `${M.src} : <b>${M.names}</b>. Retrouve-le dans ta partition, et joue-le en chantant.`,
        kbRange: [lo, hi],
        status: `Tonalité : ${key}`,
      };
    }
    const mode = cfg.mode || 'maj';
    // V7.4.2 : la tonalité ne change plus à chaque question. Elle reste la même par blocs (keyEvery, 4 par défaut),
    // tirée parmi cfg.keys (tonalités proches au début du parcours) ; le changement est annoncé.
    if (st.tr == null || st.trCount == null || st.trCount <= 0) {
      const prev = st.tr;
      const pool = cfg.keys || (cfg.key === 'random' ? [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6] : [0]);
      let t, g = 0;
      do { t = pick(pool); g++; } while (pool.length > 1 && t === prev && g < 12);
      st.tr = t;
      st.trCount = cfg.keyEvery || (pool.length > 1 ? 4 : 999);
      st.newKey = prev != null && t !== prev;
    } else st.newKey = false;
    st.trCount--;
    const tr = st.tr;
    const tonicPc = ((mode === 'maj' ? 0 : 9) + tr + 12) % 12;
    const names = spelledScale(keyNameFor(tonicPc, mode));
    const nm = d => (d === 8 ? names[0] : names[d - 1]);
    const base = (mode === 'maj' ? 60 : 57) + tr;
    const mel = randomMelody(cfg.degrees || [1, 2, 3], cfg.length || 3, cfg.maxStep || 1, cfg.startTonic !== false, cfg.endTonic, cfg.minStep || 0);
    const ms = mel.map(d => base + degOffset(d, mode));
    const cad = cfg.cadence === false ? { notes: [], end: 0 } : cadenceNotes(tr, mode);
    const t0 = cad.end + (cfg.cadence === false ? 0 : 0.4);
    const lo = Math.min(...ms) - 7, hi = Math.max(...ms) + 7;
    return {
      type: 'play', tipKind: 'echo',
      playTask: `${st.newKey ? `<b>Nouvelle tonalité : ${keyFr(tonicPc, mode)}.</b> Écoute bien la cadence, elle installe la tonique. ` : ''}Écoute, puis rejoue la mélodie (${mel.length} notes). Elle commence sur <b>${nm(mel[0])}</b>${cfg.cadence === false ? '' : ` (${keyFr(tonicPc, mode)})`}.`,
      play: () => playNotes([...cad.notes, ...ms.map((m, i) => ({ m, t: t0 + i * 0.62, d: i === ms.length - 1 ? 1.0 : 0.6, v: 80 }))]),
      extra: { label: 'Mélodie seule', fn: () => playNotes(ms.map((m, i) => ({ m, t: i * 0.62, d: 0.6, v: 80 }))) },
      expect: ms.length,
      check: played => played.length === ms.length && played.every((m, i) => pc(m) === pc(ms[i])),
      diff: played => played.map((m, i) => (pc(m) === pc(ms[i]) ? '✓' : '✗')).join(' '),
      // ce qui ne va pas, précisément : le mouvement attendu depuis la note d'avant, et celui que tu as joué
      why: played => {
        const i = played.findIndex((m, k) => k < ms.length && pc(m) !== pc(ms[k]));
        if (i < 0) return played.length < ms.length ? `Il manque ${ms.length - played.length === 1 ? 'une note' : `${ms.length - played.length} notes`}.` : '';
        if (i === 0) return `La mélodie commence sur ${nm(mel[0])} : pars de cette note.`;
        const mv = d => (d === 0 ? 'la même note' : `${Math.abs(d) <= 2 ? 'la note voisine' : Math.abs(d) <= 4 ? 'un petit saut (une tierce)' : 'un grand saut'} ${d > 0 ? 'au-dessus' : 'en dessous'}`);
        return `${i + 1}e note : il fallait ${mv(ms[i] - ms[i - 1])} (${nm(mel[i])}) ; tu as joué ${mv(played[i] - played[i - 1])}.`;
      },
      explain: `La mélodie : <b>${mel.join(' – ')}</b> (${mel.map(nm).join(' – ')}).`,
      kbRange: [lo, hi],
      // V7.4.2 : chercher librement (les essais ne comptent pas) ; la gamme numérotée sur le clavier (premières étapes)
      search: true,
      scaleMap: cfg.map ? scaleMapOf(tonicPc, mode, ms[0]) : null,
    };
  },

  /** Une note entendue, retrouvée au piano (n'importe quelle octave). */
  earnote(cfg, st) {
    let m, g = 0;
    do { m = randInt(cfg.lo || 55, cfg.hi || 72); g++; } while (g < 30 && (m === st.lastNote || (cfg.white && isBlack(m))));
    st.lastNote = m;
    return {
      type: 'play', tipKind: 'earnote',
      playTask: 'Écoute la note, chante-la, puis retrouve-la au piano (à n’importe quelle octave).',
      play: () => playNotes([{ m, t: 0, d: 1.4, v: 80 }]),
      extra: { label: 'Do, pour repère', fn: () => playNotes([{ m: 60, t: 0, d: 0.8, v: 70 }, { m, t: 1.1, d: 1.2, v: 80 }]) },
      expect: 1,
      check: played => played.length >= 1 && pc(played[played.length - 1]) === pc(m),
      explain: `C’était <b>${noteNameFr(m, { octave: false })}</b> (${noteNameFr(m)}).`,
      kbRange: [m - 9, m + 9],
    };
  },

  /** Après la cadence (tonalité tirée au hasard, jamais nommée avant la réponse), jouer la tonique. */
  playtonic(cfg, st) {
    const mode = cfg.mode || 'maj';
    let tr, g = 0;
    do { tr = randInt(-5, 6); g++; } while (g < 20 && tr === st.lastTr);
    st.lastTr = tr;
    const tonicPc = ((mode === 'maj' ? 0 : 9) + tr + 12) % 12;
    const cad = cadenceNotes(tr, mode);
    const base = (mode === 'maj' ? 60 : 57) + tr;
    return {
      type: 'play', tipKind: 'degree',
      playTask: 'Écoute la cadence, chante sa note de repos, puis joue-la au piano (n’importe quelle octave).',
      play: () => playNotes(cad.notes),
      expect: 1,
      check: played => played.length >= 1 && pc(played[played.length - 1]) === tonicPc,
      explain: `La tonique était <b>${spelledScale(keyNameFor(tonicPc, mode))[0]}</b> : la cadence était en ${keyFr(tonicPc, mode)}.`,
      after: () => playNotes([{ m: base, t: 0, d: 1.2, v: 80 }]),
      kbRange: [53, 74],
    };
  },

  /** Un accord majeur ou mineur entendu, rejoué au piano (sa basse est donnée). */
  chordecho(cfg) {
    const set = cfg.set || ['M', 'm'];
    const q = pick(set);
    const root = randInt(53, 62);
    const ms = CHORDS[q].iv.map(x => root + x);
    const sp = spellChord(root, CHORDS[q].iv);
    const notes = [];
    ms.forEach((m, i) => notes.push({ m, t: i * 0.3, d: 0.5, v: 74 }));
    ms.forEach(m => notes.push({ m, t: ms.length * 0.3 + 0.15, d: 1.5, v: 70 }));
    return {
      type: 'play', tipKind: 'chords',
      playTask: `Écoute l’accord, chante son arpège, puis joue-le. Sa note la plus grave est <b>${sp[0].fr}</b>.`,
      play: () => playNotes(notes),
      expect: ms.length,
      check: played => samePcs(played, ms),
      diff: played => (samePcs(played, ms) ? '' : played.some(m => pc(m) === pc(ms[1])) ? '' : '(la tierce n’y est pas)'),
      explain: `Accord <b>${CHORDS[q].fr}</b> sur ${sp[0].fr} : ${sp.map(x => x.fr).join(' – ')}. C’est la tierce (${sp[1].fr}) qui décide.`,
      kbRange: [root - 3, root + 12],
    };
  },

  /** Lecture intérieure : la mélodie écrite est-elle celle qu'on entend ? (une note peut changer d'un degré) */
  readmatch(cfg, st) {
    const tr = pick(cfg.keys || [0, -5, 2, -3, 5, -2, 3]);
    const tonicPc = (tr + 12) % 12;
    const keyName = keyNameFor(tonicPc, 'maj');
    const mel = randomMelody(cfg.degrees || [1, 2, 3, 4, 5], cfg.length || 5, cfg.maxStep || 1, true, true);
    const same = Math.random() < 0.5;
    const heard = mel.slice();
    let k = -1;
    if (!same) {
      k = randInt(1, mel.length - 2);
      const opts = [heard[k] - 1, heard[k] + 1].filter(d => d >= 1 && d <= 8 && d !== heard[k - 1] && d !== heard[k + 1]);
      heard[k] = opts.length ? pick(opts) : heard[k] + (heard[k] < 5 ? 1 : -1);
    }
    const base = 60 + tonicPc; // à la hauteur écrite (tonique à l'octave du do central)
    const cad = cadenceNotes(tr, 'maj');
    const names = spelledScale(keyName);
    const nm = d => (d === 8 ? names[0] : names[d - 1]);
    const ms = heard.map(d => base + degOffset(d, 'maj'));
    return {
      tipKind: 'read',
      prompt: 'Lis la mélodie et entends-la dans ta tête. Puis écoute : est-ce bien elle ?',
      staff: degreesAbc(keyName, mel, { tonicAbcOct: 4 }),
      play: () => playNotes([...cad.notes, ...ms.map((m, i) => ({ m, t: cad.end + 0.4 + i * 0.62, d: i === ms.length - 1 ? 1 : 0.6, v: 80 }))]),
      answers: [{ id: 'same', label: 'Pareil' }, { id: 'diff', label: 'Une note change' }],
      correct: same ? 'same' : 'diff',
      explain: same ? 'C’était bien la mélodie écrite.' : `La note ${k + 1} était différente : on a joué <b>${nm(heard[k])}</b> (degré ${heard[k]}) au lieu de <b>${nm(mel[k])}</b> (degré ${mel[k]}).`,
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
      conf: { kind: dir === 'harm' ? 'iv-h' : dir === 'down' ? 'iv-d' : 'iv', item: String(stp) },
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
      conf: { kind: 'ch', item: q },
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
      conf: { kind: 'cad', item: kind },
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
      conf: { kind: 'func', item: x },
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


  /* ---------- V6 : tonalités, accords et intervalles par le nom (théorie, sans piano) ---------- */
  /** Relative mineure d'une tonalité majeure (ou l'inverse). */
  relative(cfg, st) {
    const pool = cfg.keys || ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
    const k = pickNew(pool, st, 'lastRel');
    const { t, mode } = tonicOf(k);
    const relMode = mode === 'maj' ? 'min' : 'maj';
    const rel = TH.relative(t, mode);
    const right = keyLabel(rel, relMode);
    const opts = uniq([right, keyLabel(t, relMode), keyLabel(TH.relative(TH.transpose(t, '5J'), mode), relMode), keyLabel(TH.relative(TH.transpose(t, '5J', 'down'), mode), relMode)]);
    const sig = TH.keySignature(t, mode);
    return {
      prompt: mode === 'maj' ? `Quelle est la <b>relative mineure</b> de <b>${keyLabel(t, 'maj')}</b> ?` : `Quelle est la <b>relative majeure</b> de <b>${keyLabel(t, 'min')}</b> ?`,
      answers: shuffle(opts).map(o => ({ id: o, label: o })), correct: right,
      explain: `${mode === 'maj' ? `Trois demi-tons sous ${TH.noteName(t)}` : `Trois demi-tons au-dessus de ${TH.noteName(t)}`} : <b>${right}</b>. Même armure : ${sigLabel(sig)}.`,
    };
  },
  /** Nombre d'altérations à l'armure d'une tonalité. */
  sigcount(cfg, st) {
    const pool = cfg.keys || ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
    const k = pickNew(pool, st, 'lastSig');
    const { t, mode } = tonicOf(k);
    const sig = TH.keySignature(t, mode);
    const c = sig.count;
    const vals = uniq([c, c + 1, c - 1, -c || (c > 0 ? -1 : 1), c + 2].filter(v => v >= -7 && v <= 7)).slice(0, 4);
    const lab = v => (v === 0 ? 'aucune' : v > 0 ? `${v} dièse${v > 1 ? 's' : ''}` : `${-v} bémol${v < -1 ? 's' : ''}`);
    let how = '';
    if (mode === 'min') how = ` C’est l’armure de sa relative, ${keyLabel(sig.relMajor, 'maj')}.`;
    else if (c > 0) how = ` Le dernier dièse, ${sig.list[sig.list.length - 1]}, est la sensible : un demi-ton sous ${TH.noteName(t)}.`;
    else if (c < -1) how = ` L’avant-dernier bémol, ${sig.list[sig.list.length - 2]}, est la tonique.`;
    return {
      prompt: `Combien d’altérations à l’armure de <b>${keyLabel(t, mode)}</b> ?`,
      answers: shuffle(vals).map(v => ({ id: v, label: lab(v) })), correct: c,
      explain: `${capitalize(keyLabel(t, mode))} : <b>${sigLabel(sig)}</b>.${how}`,
    };
  },
  /** L'accord de trois sons d'un degré : « en sol majeur, quel accord sur le 6e degré ? » */
  triadkey(cfg, st) {
    const pool = cfg.keys || ['C', 'G', 'F', 'D', 'Bb'];
    const k = pickNew(pool, st, 'lastTk');
    const { t, mode } = tonicOf(k);
    const sev = !!cfg.seventh;
    // avec septième, en mineur : seulement les degrés dont l'accord a un nom usuel (ii ø7, iv m7, V7, VI maj7, vii °7)
    const degs = cfg.degrees || (mode === 'maj' ? [1, 2, 3, 4, 5, 6, 7] : sev ? [2, 4, 5, 6, 7] : [1, 4, 5, 6]);
    const d = pick(degs);
    const on = x => TH.triadOn(t, mode, x, { seventh: sev });
    const tri = on(d);
    const lab = x => `${TH.noteName(x.root)} ${CH_FR[x.q]}`;
    const right = lab(tri);
    const other = { M: 'm', m: 'M', dim: 'm', aug: 'M', '7': 'maj7', maj7: '7', m7: '7', hdim7: 'dim7', dim7: 'hdim7' }[tri.q];
    // distracteurs : les accords voisins (en mineur avec septième, d'autres degrés de la liste, dont l'accord a un nom)
    const near = sev && mode !== 'maj' ? shuffle(degs.filter(x => x !== d)).slice(0, 2) : [d % 7 + 1, (d + 5) % 7 + 1];
    const opts = uniq([right, `${TH.noteName(tri.root)} ${CH_FR[other]}`, ...near.map(x => lab(on(x)))].filter(o => !/undefined/.test(o)));
    const sc = TH.scale(t, mode === 'maj' ? 'maj' : 'harmMin').slice(0, 7).map(n => TH.noteName(n));
    return {
      prompt: `En <b>${keyLabel(t, mode)}</b>, quel accord${sev ? ' de septième' : ''} est construit sur le <b>${d === 1 ? '1<sup>er</sup>' : d + '<sup>e</sup>'} degré</b> ?`,
      answers: shuffle(opts).map(o => ({ id: o, label: o })), correct: right,
      explain: `Gamme : ${sc.join(' – ')}. Sur le degré ${d}, une note sur deux : ${tri.notes.map(n => TH.noteName(n)).join(' – ')} → <b>${right}</b> (${tri.roman}).`,
    };
  },
  /** Fonction d'un accord dans une tonalité : T, SD ou D. */
  funckey(cfg, st) {
    const pool = cfg.keys || ['C', 'G', 'F', 'D', 'Fm'];
    const k = pickNew(pool, st, 'lastFk');
    const { t, mode } = tonicOf(k);
    const FN = { 1: 'T', 6: 'T', 4: 'SD', 2: 'SD', 5: 'D', 7: 'D' };
    const degs = (cfg.degrees || [1, 2, 4, 5, 6, 7]).filter(x => FN[x]);
    const d = pickNew(degs, st, 'lastFd');
    const tri = TH.triadOn(t, mode, d, { seventh: d === 5 && Math.random() < 0.4 });
    const nm = `${TH.noteName(tri.root)} ${CH_FR[tri.q] || ''}`.trim();
    const why = { 1: 'l’accord de tonique : le repos', 6: 'il remplace la tonique (deux notes communes avec elle)', 4: 'la sous-dominante : on s’éloigne, on prépare', 2: 'il remplace la sous-dominante, et prépare la dominante', 5: 'la dominante : la tension, qui appelle la tonique', 7: 'il contient la sensible : une dominante sans fondamentale' }[d];
    return {
      prompt: `En <b>${keyLabel(t, mode)}</b>, quelle est la fonction de l’accord de <b>${nm}</b> ?`,
      answers: [{ id: 'T', label: 'Tonique (T)' }, { id: 'SD', label: 'Sous-dominante (SD)' }, { id: 'D', label: 'Dominante (D)' }], correct: FN[d],
      explain: `${capitalize(nm)} est le <b>${tri.roman}</b> de ${keyLabel(t, mode)} : ${why}.`,
    };
  },
  /** Trouver la note à un intervalle donné au-dessus d'une note, avec le bon nom. */
  ivfind(cfg, st) {
    const set = cfg.set || ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '8ve'];
    const roots = cfg.roots || ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si', 'si♭', 'mi♭', 'la♭'];
    for (let tries = 0; tries < 50; tries++) {
      const r = TH.parseNote(pick(roots)), ivs = pickNew(set, st, 'lastIvf');
      const tg = TH.transpose(r, ivs);
      if (Math.abs(tg.a) > 1) continue;
      const iv = TH.parseIv(ivs);
      const name = TH.ivName(iv.number, iv.q);
      const right = TH.noteName(tg);
      const sameLetter = TH.noteName({ ...tg, a: tg.a === 0 ? (Math.random() < 0.5 ? -1 : 1) : 0 });
      const enh = TH.noteName(TH.spellNear(TH.midiOf({ ...tg, o: 3 }), { l: (tg.l + (tg.a > 0 ? 1 : 6)) % 7, a: 0 }));
      const near = TH.noteName({ l: (tg.l + (Math.random() < 0.5 ? 1 : 6)) % 7, a: 0, o: null });
      const exotic = x => /mi♯|si♯|fa♭|do♭|𝄫|𝄪/.test(x);
      if (exotic(right)) continue;
      const opts = uniq([right, ...[sameLetter, enh, near].filter(x => x !== TH.noteName(r) && !exotic(x))]).slice(0, 4);
      if (opts.length < 3) continue;
      const letters = []; for (let i = 0; i < iv.number; i++) letters.push(TH.LETTERS_FR[(r.l + i) % 7]);
      const a = /^[aeiouo]/.test(name) ? 'à l’' : 'à la ';
      return {
        prompt: `Quelle note est ${a}<b>${name}</b> au-dessus de <b>${TH.noteName(r)}</b> ?`,
        answers: shuffle(opts).map(o => ({ id: o, label: o })), correct: right,
        explain: `${iv.number === 8 ? 'L’octave porte le même nom' : `${letters.join(', ')} : ${iv.number} noms, donc une ${TH.NUM_NAME[iv.number]}`} ; ${iv.semis} demi-ton${iv.semis > 1 ? 's' : ''} au-dessus de ${TH.noteName(r)} → <b>${right}</b>.${enh !== right && TH.parseNote(enh).l !== tg.l && opts.includes(enh) ? ` ${enh} est la même touche, mais le nom doit être ${TH.LETTERS_FR[tg.l]}.` : ''}`,
      };
    }
  },
  /** Les notes d'un accord, bien écrites. */
  chordspell(cfg, st) {
    const set = cfg.set || ['M', 'm'];
    const roots = cfg.roots || ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si', 'si♭', 'mi♭', 'la♭'];
    for (let tries = 0; tries < 50; tries++) {
      const r = TH.parseNote(pick(roots)), q = pickNew(set, st, 'lastCs');
      const ns = TH.chord(r, q);
      const fmt = arr => arr.map(n => TH.noteName(n)).join(' – ');
      const right = fmt(ns);
      const exotic = x => /mi♯|si♯|fa♭|do♭|𝄫|𝄪/.test(x);
      if (!cfg.exotic && exotic(right)) continue;
      const alt = { M: 'm', m: 'M', dim: 'm', aug: 'M', '7': 'maj7', maj7: '7', m7: '7', hdim7: 'dim7', dim7: 'hdim7' }[q];
      const third = ns[1];
      // l'orthographe : une tierce altérée écrite avec le mauvais nom (fa♯ → sol♭), sinon une « seconde » à la place
      const enhThird = third.a !== 0 ? TH.spellNear(TH.midiOf({ ...third, o: 3 }), { l: (third.l + (third.a > 0 ? 1 : 6)) % 7, a: 0 }) : TH.transpose(r, '2M');
      const wrongFifth = ns.map((n, i) => (i === 2 ? { ...n, a: n.a + (q === 'aug' ? -1 : 1) } : n));
      const opts = uniq([right, ...[fmt(TH.chord(r, alt)), fmt([ns[0], enhThird, ...ns.slice(2)]), fmt(wrongFifth)].filter(o => !exotic(o))]);
      if (opts.length < 3) continue;
      return {
        prompt: `Quelles notes forment l’accord de <b>${TH.noteName(r)} ${CH_FR[q]}</b> ?`,
        answers: shuffle(opts).map(o => ({ id: o, label: o })), correct: right,
        explain: `${TH.noteName(r)}, puis une note sur deux : ${ns.map(n => TH.LETTERS_FR[n.l]).join(', ')}. Tierce ${TH.interval(r, ns[1]).q === 'M' ? 'majeure (4 demi-tons)' : 'mineure (3 demi-tons)'}, quinte ${TH.QUAL_NAME[TH.interval(r, ns[2]).q]} (${TH.interval(r, ns[2]).semis} demi-tons)${ns[3] ? `, septième ${TH.QUAL_NAME[TH.interval(r, ns[3]).q]} (${TH.interval(r, ns[3]).semis} demi-tons)` : ''} : <b>${right}</b>.`,
      };
    }
  },

  /** Dominante secondaire : « en fa majeur, quelle est la dominante de ré mineur (vi) ? » */
  secdom(cfg, st) {
    const pool = cfg.keys || ['C', 'G', 'F', 'D', 'Bb'];
    const exotic = x => /mi♯|si♯|fa♭|do♭|𝄫|𝄪/.test(x);
    let k, t, mode, d, tgt, r, dom, domNotes;
    for (let tries = 0; tries < 30; tries++) {
      k = pickNew(pool, st, 'lastSd');
      ({ t, mode } = tonicOf(k));
      d = pickNew(cfg.degrees || [2, 3, 4, 5, 6], st, 'lastSdd');
      tgt = TH.triadOn(t, mode, d);
      r = { ...tgt.root, o: null };
      dom = TH.transpose(r, '5J');
      domNotes = TH.chord(dom, '7');
      if (!exotic(domNotes.map(n => TH.noteName(n)).join(' '))) break;   // pas de mi♯ ni de si♯ à ce niveau
    }
    const right = `${TH.noteName(dom)} 7`;
    const diat = TH.triadOn(t, mode, ((d + 3) % 7) + 1, { seventh: true });     // l'accord de la gamme sur la même note, sans altération
    const below = TH.transpose(r, '5J', 'down');                                  // l'erreur classique : une quinte en dessous
    const nextDom = TH.transpose({ ...TH.triadOn(t, mode, d % 7 + 1).root, o: null }, '5J');
    const opts = uniq([right, `${TH.noteName(diat.root)} ${CH_FR[diat.q]}`, `${TH.noteName(below)} 7`, `${TH.noteName(nextDom)} 7`].filter(o => o === right || !exotic(o))).slice(0, 4);
    const inKey = TH.scale(t, mode === 'maj' ? 'maj' : 'harmMin').slice(0, 7).map(n => TH.noteName({ ...n, o: null }));
    const alt = domNotes.filter(n => !inKey.includes(TH.noteName(n)));
    const third = TH.noteName(domNotes[1]);
    const how = alt.some(n => TH.noteName(n) === third)
      ? ` Le ${third}, étranger à la gamme, est la sensible de ${TH.noteName(r)} : c’est lui qui attire.`
      : alt.length ? ` Le ${TH.noteName(alt[0])}, étranger à la gamme, signale l’accord ; ${third} est la sensible de ${TH.noteName(r)}.` : '';
    return {
      prompt: `En <b>${keyLabel(t, mode)}</b>, quelle est la dominante (V7) de <b>${TH.noteName(r)} ${CH_FR[tgt.q]}</b> (${tgt.roman}) ?`,
      answers: shuffle(opts).map(o => ({ id: o, label: o })), correct: right,
      explain: `Une quinte au-dessus de ${TH.noteName(r)} : ${TH.noteName(dom)}. ${capitalize(right)} = <b>${domNotes.map(n => TH.noteName(n)).join(' – ')}</b>.${how}`,
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
/** Les touches de la gamme, numérotées en degrés (1 = la tonique, en or), autour de la note `m0`. */
function scaleMapOf(tonicPc, mode, m0) {
  const sc = mode === 'maj' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 11];
  const out = [];
  for (let m = m0 - 16; m <= m0 + 20; m++) {
    const k = sc.indexOf(((m - tonicPc) % 12 + 12) % 12);
    if (k < 0) continue;
    out.push(k === 0 ? { m, color: '#c99a2e', label: '1', labelColor: '#241a05' } : { m, color: isBlack(m) ? '#476aa3' : '#d2def0', label: String(k + 1), labelColor: isBlack(m) ? '#fff' : '#1d3a66' });
  }
  return out;
}
function randomMelody(pool, len, maxStep, startTonic, endTonic, minStep = 0) {
  const sorted = [...new Set(pool)].sort((a, b) => a - b);
  for (let tries = 0; tries < 100; tries++) {
    let i = startTonic && sorted.includes(1) ? sorted.indexOf(1) : randInt(0, sorted.length - 1);
    const seq = [sorted[i]];
    let bad = false;
    while (seq.length < len) {
      let step, g = 0;
      do { step = randInt(-maxStep, maxStep); g++; } while (g < 50 && ((step === 0 && Math.random() < 0.85) || Math.abs(step) < minStep || i + step < 0 || i + step >= sorted.length));
      if (Math.abs(step) < minStep || i + step < 0 || i + step >= sorted.length) { bad = true; break; }
      i += step;
      seq.push(sorted[i]);
    }
    if (bad) continue;
    if (endTonic && sorted.includes(1)) seq[seq.length - 1] = 1;
    if (new Set(seq).size >= Math.min(2, sorted.length)) return seq;
  }
  return sorted.slice(0, len);
}

/** Chemin de résolution d'un degré vers la tonique la plus proche (2-3-4 descendent vers 1, 5-6-7 montent vers 8). */
function resolutionPath(d) {
  const path = [];
  if (d === 1 || d === 8) path.push(d);
  else if (d <= 4) for (let k = d; k >= 1; k--) path.push(k);
  else for (let k = d; k <= 8; k++) path.push(k);
  return path;
}
function resolution(target, d, mode, t0 = 0) {
  const tonic = target - degOffset(d, mode);
  return resolutionPath(d).map((k, i, path) => ({ m: tonic + degOffset(k, mode), t: t0 + i * 0.42, d: i === path.length - 1 ? 1.1 : 0.42, v: 78 }));
}

function samePcs(played, target) {
  const a = new Set(played.map(pc));
  const b = new Set(target.map(pc));
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/* ================================================================== */
/* Confusions (V7.2) : ce que tu confonds, et une série ciblée sur la paire                                        */
/* ================================================================== */
const CONF_KINDS = {
  'deg-maj': { label: 'degrés en majeur', item: x => x, cfg: (a, b) => ({ kind: 'degree', degrees: [+a, +b].sort((x, y) => x - y), key: 'random' }) },
  'deg-min': { label: 'degrés en mineur', item: x => x, cfg: (a, b) => ({ kind: 'degree', mode: 'min', degrees: [+a, +b].sort((x, y) => x - y), key: 'random' }) },
  iv: { label: 'intervalles', item: x => IV_LABEL[x], cfg: (a, b) => ({ kind: 'intervals', set: [ivShort(+a), ivShort(+b)], directions: ['up'] }) },
  'iv-d': { label: 'intervalles descendants', item: x => IV_LABEL[x], cfg: (a, b) => ({ kind: 'intervals', set: [ivShort(+a), ivShort(+b)], directions: ['down'] }) },
  'iv-h': { label: 'intervalles harmoniques', item: x => IV_LABEL[x], cfg: (a, b) => ({ kind: 'intervals', set: [ivShort(+a), ivShort(+b)], directions: ['harm'] }) },
  ch: { label: 'accords', item: x => CH_LABEL[x] || x, cfg: (a, b) => ({ kind: 'chords', set: [a, b] }) },
  func: { label: 'accords après le I', item: x => x, cfg: (a, b) => ({ kind: 'chordfunc', set: [a, b] }) },
  cad: { label: 'cadences', item: x => CAD_LABEL[x] || x, cfg: (a, b) => ({ kind: 'cadences', set: [a, b] }) },
};
const ivShort = st => Object.keys(IV_SHORT_TO_ST).find(k => IV_SHORT_TO_ST[k] === st);
/** Une réponse (premier essai) : given = null si juste, sinon la réponse donnée. Les comptes récents pèsent plus. */
export function recordConfusion(kind, item, given) {
  if (!CONF_KINDS[kind]) return;
  const all = store.get('stats.earConf') || {};
  const K = { items: { ...((all[kind] || {}).items || {}) }, pairs: { ...((all[kind] || {}).pairs || {}) } };
  const it = { n: 0, ok: 0, ...(K.items[item] || {}) };
  it.n++; if (given == null) it.ok++;
  if (it.n > 30) { it.n /= 2; it.ok /= 2; }
  K.items[item] = it;
  if (given != null) {
    K.pairs[`${item}>${given}`] = (K.pairs[`${item}>${given}`] || 0) + 1;
    if (Object.values(K.pairs).reduce((a, b) => a + b, 0) > 60) for (const k of Object.keys(K.pairs)) K.pairs[k] = K.pairs[k] / 2;
  }
  store.set('stats.earConf', { ...all, [kind]: K });
}
/** Les paires confondues le plus souvent (dans les deux sens), avec la série ciblée qui leur correspond. */
export function topConfusions({ kinds = null, min = 3, n = 3 } = {}) {
  const all = store.get('stats.earConf') || {};
  const out = [];
  for (const [kind, K] of Object.entries(all)) {
    if (!CONF_KINDS[kind] || (kinds && !kinds.includes(kind))) continue;
    const sym = new Map();
    for (const [k, c] of Object.entries(K.pairs || {})) {
      const [a, b] = k.split('>');
      const key = [a, b].sort().join('|');
      sym.set(key, (sym.get(key) || 0) + c);
    }
    for (const [key, c] of sym) {
      if (c < min) continue;
      const [a, b] = key.split('|');
      const C = CONF_KINDS[kind];
      const seen = ((K.items[a] || {}).n || 0) + ((K.items[b] || {}).n || 0);
      out.push({ kind, a, b, count: Math.round(c), seen: Math.round(seen), label: `${C.item(a)} et ${C.item(b)}`, kindLabel: C.label,
        series: { ...C.cfg(a, b), id: `pair:${kind}:${a}-${b}`, title: `Série ciblée : ${C.item(a)} ou ${C.item(b)} ?`, count: 10, goal: 0.8 } });
    }
  }
  return out.sort((x, y) => y.count - x.count).slice(0, n);
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
  const playMode = cfg.mode === 'play' || ['playchord', 'echo', 'earnote', 'playtonic', 'chordecho'].includes(cfg.kind);
  const persist = {}; // état conservé d'une question à l'autre (difficulté adaptée, tonalité…)
  const persistMix = {}; // idem pour les questions de révision
  let state;
  const cleanups = new Set();
  const addCleanup = fn => { cleanups.add(fn); return () => { cleanups.delete(fn); fn(); }; };
  const clearQuestion = () => { stopAudio(); cleanups.forEach(fn => { try { fn(); } catch (e) { /* */ } }); cleanups.clear(); };

  const start = () => {
    state = { i: 0, ok: 0, solved: 0, startAt: Date.now(), singMode };
    persist.singStats = null;
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
    // 20 % de révision : une question d'une étape passée (même façon de répondre), mêlée à la série (V7.2)
    let q, review = null;
    if (cfg.mix && cfg.mix.length && state.i > 0 && Math.random() < (cfg.mixRate ?? 0.2)) {
      review = pick(cfg.mix);
      try { q = GEN[review.kind]({ ...review }, persistMix[review.id] || (persistMix[review.id] = {})); } catch (e) { q = null; }
      if (!q) review = null;
    }
    if (!q) q = gen(cfg, persist);
    state.q = q;
    frame.__q = q; // lecture par les tests automatiques
    state.tries = 0;
    const qPlay = review ? (review.mode === 'play' || ['playchord', 'echo', 'earnote', 'playtonic', 'chordecho'].includes(review.kind)) : playMode;
    const type = q.type || (qPlay && q.check ? 'play' : 'buttons');
    const prog = h('div', { class: 'quiz-progress' }, h('span', {}, `${state.i + 1} / ${total}`), h('div', { class: 'progress' }, h('i', { style: { width: `${state.i / total * 100}%` } })), h('span', {}, `${state.ok} du premier coup`));
    body.append(prog);
    if (review) body.append(h('div', { class: 'quiz-review small' }, `Révision : ${review.title}`));
    if (q.status) body.append(h('div', { class: 'quiz-status' }, q.status));
    const ctx = {
      q, type,
      fb: h('div', { class: 'quiz-feedback' }),
      tipBox: h('div', { class: 'quiz-tip', hidden: true }),
      row: h('div', { class: 'btn-row', style: { marginBottom: '12px' } }),
      nextBtn: h('button', { class: 'btn primary', type: 'button', hidden: true }, state.i + 1 >= total ? (cfg.onFinish ? 'Fin de la série' : 'Voir le résultat') : 'Question suivante'),
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
        if (q.conf && state.tries === 1) recordConfusion(q.conf.kind, q.conf.item, a.id === q.correct ? null : String(a.id));
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
  /* V7.4.2 : rejouer une mélodie en cherchant librement. Les notes jouées en cherchant ne comptent pas ; la réponse est
     reconnue dès que les dernières notes jouées sont justes. « Valider » dit ce qui ne va pas (trois fois au plus). */
  const searchPlay = (ctx) => {
    const { q, fb, nextBtn, row } = ctx;
    const pressed = [];
    let over = false;
    const playedBox = h('div', { class: 'small quiz-played', 'aria-live': 'polite' });
    const validate = h('button', { class: 'btn sm', type: 'button' }, 'Valider ma réponse');
    row.append(validate);
    body.insertBefore(playedBox, fb);
    const names = list => list.map(m => noteNameFr(m, { octave: false })).join(', ');
    const end = () => { over = true; off(); validate.hidden = true; };
    const win = () => {
      const first = pressed.length === q.expect && state.tries === 0;
      end();
      fb.className = 'quiz-feedback ok';
      fb.innerHTML = (first ? 'Exact, du premier coup. ' : 'Trouvé. ') + q.explain;
      ctx.done(true, first);
      q.after?.();
    };
    const off = midi.on('noteon', ev => {
      if (over || !nextBtn.hidden) return;
      pressed.push(ev.note);
      playedBox.textContent = `Tes notes : ${names(pressed.slice(-8))}`;
      const last = pressed.slice(-q.expect);
      if (last.length === q.expect && q.check(last)) win();
      else if (pressed.length === q.expect && state.tries === 0) { fb.className = 'quiz-feedback'; fb.innerHTML = 'Pas encore. Cherche librement : tes essais ne comptent pas. Chante la note, puis cherche-la à partir de la tonique (la touche 1).'; }
    });
    addCleanup(off);
    validate.addEventListener('click', () => {
      if (over || !nextBtn.hidden) return;
      const last = pressed.slice(-q.expect);
      if (last.length === q.expect && q.check(last)) return win();
      state.tries++;
      fb.className = 'quiz-feedback bad';
      const why = last.length ? q.why?.(last) || '' : '';
      if (state.tries >= 3) { end(); fb.innerHTML = `${last.length ? `Tes dernières notes : ${names(last)}. ` : ''}${why} ${q.explain}`; ctx.done(false, false); q.after?.(); return; }
      fb.innerHTML = `${last.length < q.expect ? `Joue les ${q.expect} notes de la mélodie, puis valide.` : `Tes ${q.expect} dernières notes : ${names(last)}. ${why}`} Réécoute, chante, et cherche encore.`;
      ctx.showTip();
    });
  };
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
    if (q.scaleMap) { toggleKb(true); kb.firstChild?.setMarks?.(q.scaleMap); }
    if (q.search) return searchPlay(ctx, () => kb);
    const wait = () => listenPlayed(played => {
      state.tries++;
      if (q.check(played)) {
        fb.className = 'quiz-feedback ok'; fb.innerHTML = (state.tries === 1 ? 'Exact. ' : 'Oui. ') + q.explain;
        ctx.done(true, state.tries === 1);
        q.after?.();
      } else {
        fb.className = 'quiz-feedback bad';
        const detail = (q.diff ? ` ${q.diff(played)}` : '') + (q.why ? ` ${q.why(played)}` : '');
        if (state.tries >= 3) {
          fb.innerHTML = `Tu as joué : ${played.map(m => noteNameFr(m, { octave: false })).join(', ')}.${detail} ${q.explain}`;
          ctx.done(false, false);
          q.after?.();
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
  // Au micro : la ligne de ta voix en direct (bande verte = la note visée), un conseil qui change selon ce que tu
  // chantes (rien entendu, loin, note voisine, voix instable, tout près), un indice si besoin, et un diagnostic
  // précis après un essai manqué.
  const renderSing = (ctx) => {
    const { q, fb, nextBtn, row, tipBox } = ctx;
    const singMode = state.singMode;
    body.append(h('div', { class: 'quiz-q', html: q.prompt }));
    if (q.staff) {
      const stf = h('div', { class: 'quiz-staff' });
      body.append(stf);
      try { window.ABCJS.renderAbc(stf, q.staff, { responsive: 'resize', staffwidth: 300, scale: 1.4, paddingtop: 0, paddingbottom: 0 }); } catch (e) { stf.textContent = q.labels?.join(' – ') || ''; }
    }
    if (singMode === 'mic' && state.i < 2) body.append(h('p', { class: 'small sing-how', html: '<b>1.</b> Écoute. <b>2.</b> Entends la note dans ta tête, une seconde. <b>3.</b> Chante doucement sur « mmm » ou « la » et regarde la ligne : amène-la dans la <b>bande verte</b>, puis tiens-la.' }));
    const chips = h('div', { class: 'sing-chips' });
    const chipEls = q.targets.map((_, i) => h('span', { class: 'chip' }, q.labels?.[i] ?? '•'));
    chips.append(...chipEls);
    if (q.targets.length > 1) body.append(chips);
    const again = h('button', { class: 'btn', type: 'button', html: PLAY + ' Réécouter' });
    const hintBtn = q.hint ? h('button', { class: 'btn ghost', type: 'button', html: PLAY + ' ' + esc(q.hint.label) }) : null;
    const skip = h('button', { class: 'btn ghost', type: 'button' }, 'Je passe');
    row.append(again, ...(hintBtn ? [hintBtn] : []), skip);
    body.append(row);
    let idx = 0, tries = 0, finished = false, hinted = false;
    const st = persist.singStats || (persist.singStats = { n: 0, flat: 0, sharp: 0, silence: 0, far: 0, unstable: 0 });
    const succeed = () => {
      if (finished) return;
      finished = true; stopListening();
      fb.className = 'quiz-feedback ok';
      fb.innerHTML = (tries === 0 && !hinted ? 'Juste ! ' : 'Juste. ') + q.explain;
      ctx.done(true, tries === 0 && !hinted);
      if (q.type === 'sing' && cfg.task !== 'match') setTimeout(() => q.reveal?.(), 300);
    };
    const fail = (msg, kind) => {
      if (finished) return;
      finished = true; stopListening();
      fb.className = 'quiz-feedback bad';
      fb.innerHTML = `${msg || 'Pas encore.'} ${q.explain}`;
      if (kind) { tipBox.hidden = false; tipBox.innerHTML = `<b>Conseil.</b> ${adviceFor(kind)}`; } else ctx.showTip();
      retry.hidden = false;
      setTimeout(() => q.reveal?.(), 400);
      ctx.done(false, false);
    };
    const retry = h('button', { class: 'btn', type: 'button', hidden: true }, 'Réessayer');
    retry.addEventListener('click', () => {
      tries++; finished = false; idx = 0; chipEls.forEach(c => c.classList.remove('ok'));
      retry.hidden = true; fb.className = 'quiz-feedback'; fb.textContent = ''; tipBox.hidden = true;
      playThenListen();
    });
    skip.addEventListener('click', () => { if (!finished) fail('Passée.'); });

    /* --- mode micro --- */
    let listening = false, offPitch = null, timer = null, hist = [], holdStart = null, recent = [], lastVoiced = 0, listenStart = 0, lastCoach = 0;
    const all = []; // écarts de tout l'essai (diagnostic)
    const tol = (cfg.tol ?? 45) / 100;
    const trace = new VoiceTrace({ height: 150, tol });
    const read = h('div', { class: 'pm-read' }, 'Écoute…');
    const coach = h('div', { class: 'sing-coach small' });
    const level = h('div', { class: 'pm-level', title: 'Niveau du micro' }, h('i'));
    // aiguille : l'écart à la note, de -100 à +100 cents ; la zone verte = la tolérance
    const needle = h('div', { class: 'tn-needle' });
    const tuner = h('div', { class: 'tuner', 'aria-hidden': 'true' },
      h('div', { class: 'tn-zone', style: { left: `${50 - tol * 50}%`, width: `${tol * 100}%` } }), h('div', { class: 'tn-mid' }), needle,
      h('div', { class: 'tn-lbl' }, h('span', {}, '← trop bas'), h('span', {}, 'juste'), h('span', {}, 'trop haut →')));
    const holdBar = h('div', { class: 'progress hold-bar', hidden: !(q.holdMs > 1000), title: 'Tenue' }, h('i'));
    const meter = h('div', { class: 'pm' }, trace.el, tuner, read, holdBar, coach, level);
    const stopListening = () => { listening = false; clearTimeout(timer); offPitch?.(); offPitch = null; trace.stop(); audio.stopAll('drone'); };
    // bourdon de tonique (facultatif) : la tonique et sa quinte en dessous, très doux, pendant que tu chantes
    const startDrone = () => {
      if (q.tonic == null || !store.get('settings.singDrone')) return;
      audio.tone(q.tonic - 12, 0, { gain: 0.07, owner: 'drone' });
      audio.tone(q.tonic - 17, 0, { gain: 0.05, owner: 'drone' });
    };
    const diagnose = () => {
      const voiced = all.length;
      if (!voiced) return { kind: 'silence', msg: 'Je ne t’ai pas entendu.' };
      const tail = all.slice(-25).map(r => r.d);
      const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
      const sd = Math.sqrt(tail.reduce((a, b) => a + (b - mean) ** 2, 0) / tail.length);
      const n = Math.abs(mean);
      const where = mean < 0 ? 'trop bas' : 'trop haut';
      if (sd > 0.6 && n < 2) return { kind: 'unstable', msg: 'Pas encore : ta voix bougeait autour de la note.' };
      if (n <= tol) return { kind: 'ok', msg: 'Presque : c’était juste, mais pas assez longtemps.' };
      if (n <= 1) return { kind: 'close', msg: `Tout près : un peu ${where} (environ ${Math.round(n * 100)} cents).`, dir: Math.sign(mean) };
      if (n <= 2.5) return { kind: 'neighbour', msg: `Pas encore : tu chantais une note voisine, ${Math.round(n) === 1 ? 'un demi-ton' : 'un ton'} ${where}.`, dir: Math.sign(mean) };
      return { kind: 'far', msg: `Pas encore : tu étais environ ${Math.round(n)} demi-tons ${where}.`, dir: Math.sign(mean) };
    };
    let lastIn = 0, holdD = [];
    const need = q.holdMs || (q.targets.length > 1 ? 260 : 380);
    const startListening = () => {
      listening = true; hist = []; holdStart = null; recent = []; listenStart = performance.now(); lastVoiced = 0; lastCoach = 0; lastIn = 0; holdD = [];
      startDrone();
      holdBar.firstChild.style.width = '0%';
      trace.setTarget(q.targets[idx]); trace.start();
      read.innerHTML = q.targets.length > 1 ? `À toi : chante la note ${idx + 1}.` : 'À toi : chante.';
      coach.innerHTML = '';
      offPitch = pitch.on(ev => {
        level.firstChild.style.width = `${Math.min(100, ev.rms * 900)}%`;
        trace.push(ev);
        if (!listening) return;
        const now = ev.t;
        if (!ev.voiced) {
          // une courte coupure (respiration, consonne, mesure ratée) n'annule pas la tenue
          if (now - lastVoiced > 220) { holdStart = null; hist = []; holdD = []; holdBar.firstChild.style.width = '0%'; needle.classList.remove('on', 'ok'); }
        } else {
          lastVoiced = now;
          hist.push(ev.midi); if (hist.length > 3) hist.shift();
          const mm = median(hist);
          const target = q.targets[idx];
          const d = octaveDiff(mm, target);
          recent.push({ t: now, d }); while (recent.length && now - recent[0].t > 1500) recent.shift();
          all.push({ t: now, d });
          const cents = Math.round(d * 100);
          read.innerHTML = `Tu chantes : <b>${sungName(mm)}</b> · ${cents > 0 ? '+' : ''}${cents} cents${Math.abs(d) <= tol ? ' · <span class="ok">juste</span>' : d < 0 ? ' · monte ↑' : ' · descends ↓'}`;
          needle.style.left = `${50 + Math.max(-1, Math.min(1, d)) * 50}%`;
          needle.classList.add('on'); needle.classList.toggle('ok', Math.abs(d) <= tol);
          if (Math.abs(d) <= tol) {
            lastIn = now;
            if (holdStart == null) holdStart = now;
            holdD.push(d);
            if (q.holdMs > 1000) holdBar.firstChild.style.width = `${Math.min(100, (now - holdStart) / need * 100)}%`;
            if (now - holdStart >= need) {
              chipEls[idx]?.classList.add('ok');
              if (q.holdMs > 1000 && holdD.length) {
                const avg = holdD.reduce((a, b) => a + Math.abs(b), 0) / holdD.length;
                q.explain += ` Tenue de ${need / 1000} s, à ${Math.round(avg * 100)} cents en moyenne de la note${avg <= 0.15 ? ' : très stable' : ''}.`;
              }
              idx++; holdStart = null; hist = []; recent = []; all.length = 0; holdD = [];
              if (idx >= q.targets.length) { succeed(); return; }
              trace.setTarget(q.targets[idx]);
              read.innerHTML = `Bien. Note ${idx + 1} maintenant.`;
            }
          } else if (now - lastIn > 150) { holdStart = null; holdD = []; holdBar.firstChild.style.width = '0%'; } // un écart très bref (vibrato) ne compte pas
        }
        // un conseil qui suit ce que tu chantes (au plus toutes les 0,7 s)
        if (now - lastCoach > 700) {
          lastCoach = now;
          const c = coachLine(recent, tol, now - listenStart, lastVoiced ? now - lastVoiced : now - listenStart);
          coach.innerHTML = c ? c.html : '';
        }
      });
      const limit = 15000 + 4000 * (q.targets.length - 1) + (q.holdMs > 1000 ? q.holdMs : 0);
      timer = setTimeout(() => {
        const dg = diagnose();
        st.n++; if (dg.kind in st) st[dg.kind]++;
        if (dg.dir < 0) st.flat++; else if (dg.dir > 0) st.sharp++;
        store.push('stats.sing', { at: Date.now(), kind: dg.kind, dir: dg.dir || 0 }, 120); // tendance personnelle (parcours « Chanter juste »)
        fail(dg.msg, dg.kind);
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

    // joue (la question, ou l'indice), sans écouter pendant le son, puis écoute
    const playThenListen = async (player = q.play) => {
      stopListening(); stopAudio();
      read.innerHTML = 'Écoute…'; coach.innerHTML = '';
      let ms = 0;
      try { ms = await player(); } catch (e) { fb.textContent = 'Audio indisponible : ' + e.message; }
      if (singMode === 'mic') { const t = setTimeout(() => { if (!finished) startListening(); }, ms + 300); addCleanup(() => clearTimeout(t)); }
      else if (singMode === 'piano') { const t = setTimeout(pianoListen, Math.max(0, ms - 200)); addCleanup(() => clearTimeout(t)); }
      else { selfRow.hidden = false; }
    };
    again.addEventListener('click', () => { if (!finished) playThenListen(); else { stopAudio(); q.play(); } });
    hintBtn?.addEventListener('click', () => {
      hinted = true;
      if (!finished) playThenListen(q.hint.play); else { stopAudio(); q.hint.play(); }
      if (q.hint.note) { tipBox.hidden = false; tipBox.innerHTML = `<b>Indice.</b> ${q.hint.note}`; }
    });

    if (singMode === 'mic') { body.append(meter); trace.setTarget(q.targets[0]); requestAnimationFrame(() => trace.draw()); }
    if (singMode === 'piano') {
      const kbEl = midi.status !== 'ready' ? screenKeyboard([Math.min(...q.targets.map(m => 48 + pc(m))), Math.max(...q.targets.map(m => 60 + pc(m)))]) : null;
      body.append(h('p', { class: 'small' }, 'Chante intérieurement, puis joue au piano la ou les notes que tu chanterais.'));
      if (kbEl) body.append(kbEl);
    }
    if (singMode === 'self') body.append(h('p', { class: 'small' }, 'Chante à voix haute, puis écoute la réponse et juge honnêtement.'), selfRow);
    body.append(fb, tipBox, h('div', { class: 'btn-row' }, retry, nextBtn));
    addCleanup(stopListening);
    const t = setTimeout(() => playThenListen(), 250);
    addCleanup(() => clearTimeout(t));
  };

  /* ---------- rythme : écho ou lecture ---------- */
  const renderRhythm = (ctx) => {
    const { q, fb, nextBtn, row, tipBox } = ctx;
    const echo = q.task === 'echo';
    body.append(h('div', { class: 'quiz-q', html: echo ? 'Écoute le rythme (après le décompte), puis tape-le à ton tour dès la fin du second décompte.' : 'Lis ce rythme. Après le décompte, tape-le en suivant les clics.' }));
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
    const offMidi = midi.on('noteon', ev => onTap(ev.time - inputLatency(ev.source)));
    const padDown = e => { e.preventDefault(); onTap((e.timeStamp > 0 ? e.timeStamp : performance.now()) - inputLatency('touch')); };
    pad.addEventListener('pointerdown', padDown);
    const key = e => { if ((e.code === 'Space' || e.code === 'Enter') && running) { e.preventDefault(); onTap(performance.now() - inputLatency('key')); } };
    window.addEventListener('keydown', key);
    addCleanup(() => { offMidi(); window.removeEventListener('keydown', key); });
    const spb = 60 / q.bpm;

    // délais calés sur la sortie du son (latence comprise), comme le décompte commun (countin.js)
    const delayTo = tctx => Math.max(0, audio.ctxToPerf(tctx) - performance.now());
    const flashBeats = (t0ctx, nBeats) => {
      for (let k = 0; k < nBeats; k++) {
        const tm = setTimeout(() => {
          [...beatsBox.children].forEach((d, j) => d.classList.toggle('on', j === k % q.meter));
        }, delayTo(t0ctx + k * spb));
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
      const cin = scheduleCountIn({ beatsPerBar: q.meter, beatSec: spb });
      for (let k = 0; k < q.meter * q.bars; k++) audio.click(cin.end + k * spb, k % q.meter === 0 ? 'accent' : 'beat');
      playPattern(cin.end);
      flashBeats(cin.t0, cin.beats + q.meter * q.bars);
    });

    goBtn.addEventListener('click', async () => {
      if (running) return;
      running = true; goBtn.disabled = true;
      fb.className = 'quiz-feedback'; fb.textContent = '';
      audio.claim('quiz', () => audio.stopAll('quiz'));
      await audio.ensure();
      const barDur = q.meter * spb;
      // décompte (au moins quatre temps) ; en écho : le rythme entendu avec ses clics, puis un second décompte
      const first = scheduleCountIn({ beatsPerBar: q.meter, beatSec: spb });
      const t0 = first.t0;
      let answerStart;
      if (echo) {
        const listenStart = first.end;
        playPattern(listenStart);
        for (let k = 0; k < q.meter * q.bars; k++) audio.click(listenStart + k * spb, k % q.meter === 0 ? 'accent' : 'beat');
        const second = scheduleCountIn({ beatsPerBar: q.meter, beatSec: spb, start: listenStart + q.bars * barDur });
        answerStart = second.end;
        msg('Écoute…', listenStart - 0.05);
        msg('Prépare-toi…', second.t0);
      } else {
        answerStart = first.end;
        msg('Prépare-toi…', t0);
      }
      for (let k = 0; k < q.meter * q.bars; k++) audio.click(answerStart + k * spb, k % q.meter === 0 ? 'accent' : 'sub');
      flashBeats(t0, Math.round((answerStart - t0) / spb) + q.meter * q.bars);
      msg('<b>À toi !</b>', answerStart - 0.05);
      const startPerf = audio.ctxToPerf(answerStart);
      const tapOpen = setTimeout(() => { taps = []; }, Math.max(0, delayTo(answerStart) - spb * 400));
      addCleanup(() => clearTimeout(tapOpen));
      const endAt = answerStart + q.bars * barDur + spb * 0.5;
      const tm = setTimeout(() => {
        const got = (taps || []).slice();
        taps = null; running = false; goBtn.disabled = false;
        [...beatsBox.children].forEach(d => d.classList.remove('on'));
        evaluate(got, startPerf);
      }, delayTo(endAt) + 150);
      addCleanup(() => clearTimeout(tm));
    });
    function msg(txt, at) { const tm = setTimeout(() => { fb.className = 'quiz-feedback'; fb.innerHTML = txt; }, delayTo(at)); addCleanup(() => clearTimeout(tm)); }

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
    if (cfg.onFinish) { // série intégrée (révision « En cours de maîtrise ») : le résultat est rendu à l'appelant
      if (cfg.stat) store.push('stats.ear', { id: cfg.stat, at: Date.now(), pct, total });
      body.innerHTML = '';
      cfg.onFinish({ pct, ok: state.ok, solved: state.solved, total });
      return;
    }
    body.innerHTML = '';
    el.dispatchEvent(new CustomEvent('exo-done', { bubbles: true, detail: { ok: state.ok, n: total } })); // étape de leçon (V6)
    body.append(h('div', { class: 'big-score' },
      h('div', {}, h('div', { class: 'v' }, fmtPct(pct)), h('div', { class: 'l' }, 'réussite du premier coup')),
      h('div', {}, h('div', { class: 'v' }, `${state.solved}/${total}`), h('div', { class: 'l' }, 'réussies au total')),
      h('div', {}, h('div', { class: 'v' }, `${Math.round((Date.now() - state.startAt) / 1000)} s`), h('div', { class: 'l' }, 'durée'))));
    const goal = cfg.goal ?? 0.8;
    body.append(h('p', { class: 'small', html: pct >= goal ? `Objectif atteint (${fmtPct(goal)}). Refais une série demain pour confirmer, puis passe à l’étape suivante.` : `Objectif : ${fmtPct(goal)}. Refais une série demain : dix minutes chaque jour valent mieux qu’une heure le dimanche.` }));
    const sa = isSing ? seriesAdvice(persist.singStats) : null;
    if (sa) body.append(h('div', { class: 'quiz-tip', html: `<b>Ce que montre cette série.</b><ul>${sa.map(x => `<li>${x}</li>`).join('')}</ul>` }));
    else body.append(h('div', { class: 'quiz-tip', html: `<b>Conseil.</b> ${pick(TIPS[cfg.tipKind || cfg.kind] || TIPS.degree)}` }));
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
    const measured = voiceRangeLabel();
    const useMeasured = measured && store.get('settings.voiceMode') !== 'preset';
    const voice = useMeasured ? 'mesure' : (store.get('settings.voice') || 'grave');
    const vseg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Ta voix' });
    const vopts = [['grave', 'Voix grave'], ['aigue', 'Voix aiguë']];
    if (measured) vopts.unshift(['mesure', `Ma tessiture (${measured})`]);
    vopts.forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: v === voice ? 'on' : '' }, l);
      b.addEventListener('click', () => {
        if (v === 'mesure') store.set('settings.voiceMode', 'measured');
        else { store.set('settings.voiceMode', 'preset'); store.set('settings.voice', v); }
        vseg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      });
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
    // modèle à imiter : le piano, ou un son tenu (V7.2) ; bourdon de tonique pendant le chant
    const tseg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Modèle à imiter' });
    [['piano', 'Piano'], ['tone', 'Son tenu']].forEach(([v, l]) => {
      const b = h('button', { type: 'button', class: singModel() === v ? 'on' : '' }, l);
      b.addEventListener('click', () => { store.set('settings.singTarget', v); tseg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
      tseg.append(b);
    });
    const droneCb = h('input', { type: 'checkbox', checked: !!store.get('settings.singDrone') });
    droneCb.addEventListener('change', () => store.set('settings.singDrone', droneCb.checked));
    intro.append(h('div', { class: 'row mb-0', style: { marginBottom: '10px' } }, h('span', { class: 'small' }, 'Modèle :'), tseg,
      h('label', { class: 'check small', title: 'La tonique tenue pendant que tu chantes : un repère constant. Avec des écouteurs, il ne gêne pas le micro.' }, droneCb, 'Bourdon de tonique')));
    intro.append(h('p', { class: 'small', html: `Au micro, place la tablette à 30–50 cm, dans une pièce calme. Une <b>ligne</b> montre ta voix en direct ; la <b>bande verte</b> est la note à chanter.${measured ? '' : ' Pour des notes à ta mesure, mesure d’abord ta tessiture avec « Trouver ma voix » (outil Oreille).'} Sans micro : chante, puis rejoue la note au piano, ou écoute la réponse et juge toi-même.` }));
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
  if (cfg.autostart && !isSing) { audio.ensure().catch(() => {}); start(); } // pas d'écran d'accueil (révision)
  else body.append(intro);
  return () => { clearQuestion(); if (micOn) pitch.stop(); };
}

/* ================================================================== */
/* Séries prêtes à l'emploi (pages Outils)                             */
/* ================================================================== */
export const EAR_PRESETS = [
  { group: '1 · Hauteur et voix', id: 'hl', title: 'Plus grave ou plus aigu ?', kind: 'highlow', minSt: 1, maxSt: 12 },
  { group: '1 · Hauteur et voix', id: 'contour', title: 'Le dessin d’une mélodie', kind: 'contour', notes: 3 },
  { group: '1 · Hauteur et voix', id: 'contour4', title: 'Le dessin d’une mélodie (4 notes)', kind: 'contour', notes: 4 },
  { group: '1 · Hauteur et voix', id: 'voice-finder', title: 'Trouver ma voix (sirène et tessiture)', kind: 'voicefinder' },
  { group: '1 · Hauteur et voix', id: 'sing-match-a', title: 'Chanter une note, au milieu de ta voix', kind: 'sing', task: 'match', span: 4, count: 8 },
  { group: '1 · Hauteur et voix', id: 'sing-match', title: 'Chanter une note entendue', kind: 'sing', task: 'match', count: 8 },
  { group: '2 · Degrés', id: 'deg-1', title: 'La tonique ou pas ?', kind: 'degree', binary: true, degrees: [1, 2, 3, 4, 5, 6, 7] },
  { group: '2 · Degrés', id: 'deg-123', title: 'Degrés 1, 2, 3 (do majeur)', kind: 'degree', degrees: [1, 2, 3] },
  { group: '2 · Degrés', id: 'deg-15', title: 'Degrés 1 à 5 (do majeur)', kind: 'degree', degrees: [1, 2, 3, 4, 5] },
  { group: '2 · Degrés', id: 'deg-18', title: 'Toute la gamme (do majeur)', kind: 'degree', degrees: [1, 2, 3, 4, 5, 6, 7, 8] },
  { group: '2 · Degrés', id: 'deg-18r', title: 'Toute la gamme, toutes tonalités', kind: 'degree', degrees: [1, 2, 3, 4, 5, 6, 7, 8], key: 'random' },
  { group: '2 · Degrés', id: 'deg-min', title: 'Degrés en mineur', kind: 'degree', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7], key: 'random' },
  { group: '2 · Degrés', id: 'deg-min15', title: 'Degrés 1 à 5 en mineur (la mineur)', kind: 'degree', mode: 'min', degrees: [1, 2, 3, 4, 5] },
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
  { group: '3 · Mélodies', id: 'echo-op55', title: 'Les motifs de ta pièce (op. 55 n° 1)', kind: 'echo', motifs: ['op55-a', 'op55-b', 'op55-c'], count: 6 },
  { group: '3 · Mélodies', id: 'sing-op55', title: 'Chanter les motifs de ta pièce (op. 55 n° 1)', kind: 'sing', task: 'echo', motifs: ['op55-a', 'op55-b'], count: 6 },
  { group: '3 · Mélodies', id: 'echo-chopin', title: 'Motifs de Chopin (op. 15 n° 1, valse op. 70 n° 2)', kind: 'echo', motifs: ['op15-a', 'op15-b', 'op70-a', 'op55-c'], count: 6 },
  { group: '4 · Intervalles', id: 'iv-a', title: 'Tierce majeure, quarte, quinte, octave', kind: 'intervals', set: ['3M', '4J', '5J', '8ve'] },
  { group: '4 · Intervalles', id: 'iv-b', title: 'Secondes et tierces', kind: 'intervals', set: ['2m', '2M', '3m', '3M'] },
  { group: '4 · Intervalles', id: 'iv-n1', title: 'De la seconde à la quinte, et l’octave', kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', '5J', '8ve'] },
  { group: '4 · Intervalles', id: 'iv-c', title: 'Sixtes, septièmes, triton', kind: 'intervals', set: ['Triton', '6m', '6M', '7m', '7M', '8ve'] },
  { group: '4 · Intervalles', id: 'iv-n1-down', title: 'De la seconde à l’octave, en descendant', kind: 'intervals', set: ['2M', '3m', '3M', '4J', '5J', '8ve'], directions: ['down'] },
  { group: '4 · Intervalles', id: 'iv-harm', title: 'Intervalles harmoniques (notes ensemble)', kind: 'intervals', set: ['3m', '3M', '4J', '5J', '6m', '6M', '8ve'], directions: ['harm'] },
  { group: '4 · Intervalles', id: 'iv-all', title: 'Tous les intervalles (montants, descendants, harmoniques)', kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', 'Triton', '5J', '6m', '6M', '7m', '7M', '8ve'], directions: ['up', 'down', 'harm'] },
  { group: '4 · Intervalles', id: 'sing-iv', title: 'Chanter une tierce, une quinte, une octave', kind: 'sing', task: 'interval', set: ['3M', '5J', '8ve'], count: 8 },
  { group: '5 · Accords et cadences', id: 'ch-mm', title: 'Majeur ou mineur ?', kind: 'chords', set: ['M', 'm'] },
  { group: '5 · Accords et cadences', id: 'ch-n1', title: 'Majeur, mineur, diminué, augmenté', kind: 'chords', set: ['M', 'm', 'dim', 'aug'] },
  { group: '5 · Accords et cadences', id: 'sing-arp', title: 'Chanter l’arpège (majeur)', kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [1, 3, 5, 8]], count: 6 },
  { group: '5 · Accords et cadences', id: 'func2', title: 'Après le I : ii, IV, V ou vi ?', kind: 'chordfunc', set: ['ii', 'IV', 'V', 'vi'] },
  { group: '5 · Accords et cadences', id: 'cad-maj', title: 'Les quatre cadences (majeur)', kind: 'cadences', modes: ['maj'] },
  { group: '5 · Accords et cadences', id: 'cad-2', title: 'Fin ou suspension ?', kind: 'cadences', set: ['parfaite', 'demi'], labels: { parfaite: 'Fin (parfaite)', demi: 'Suspension (demi-cadence)' } },
  { group: '5 · Accords et cadences', id: 'cad', title: 'Les quatre cadences', kind: 'cadences' },
  { group: '5 · Accords et cadences', id: 'func', title: 'Après le I : IV, V ou vi ?', kind: 'chordfunc', set: ['IV', 'V', 'vi'] },
  { group: '5 · Accords et cadences', id: 'ch-n2', title: 'Accords de septième', kind: 'chords', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'] },
  { group: '5 · Accords et cadences', id: 'ch7-a', title: 'Septième de dominante ou septième majeure ?', kind: 'chords', set: ['7', 'maj7'] },
  { group: '5 · Accords et cadences', id: 'ch7-b', title: 'Trois septièmes', kind: 'chords', set: ['7', 'maj7', 'm7'] },
  { group: '5 · Accords et cadences', id: 'sc', title: 'Gammes majeures et mineures', kind: 'scales' },
];

export const THEORY_PRESETS = [
  { group: 'Le clavier', id: 'kname', title: 'Nommer les touches blanches', kind: 'keyname' },
  { group: 'Le clavier', id: 'kname-b', title: 'Nommer les touches noires', kind: 'keyname', black: 'only' },
  { group: 'Le clavier', id: 'findnote', title: 'Trouver une note au piano', kind: 'findnote', count: 10 },
  { group: 'Le clavier', id: 'pscale', title: 'Jouer une gamme majeure', kind: 'playscale', keys: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'], count: 6 },
  { group: 'Lire les notes', id: 'notes-t', title: 'Notes en clé de sol', kind: 'notes', clefs: ['treble'] },
  { group: 'Lire les notes', id: 'notes-b', title: 'Notes en clé de fa', kind: 'notes', clefs: ['bass'] },
  { group: 'Lire les notes', id: 'notes-play', title: 'Notes à jouer au piano (les deux clés)', kind: 'notes', mode: 'play' },
  { group: 'Gammes et tonalités', id: 'kdeg', title: 'Les degrés d’une gamme majeure', kind: 'keydegree' },
  { group: 'Gammes et tonalités', id: 'ks-maj', title: 'Armures : tonalités majeures', kind: 'keysig', keys: ['C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db'] },
  { group: 'Gammes et tonalités', id: 'ks-min', title: 'Armures : tonalités mineures', kind: 'keysig', minor: true, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'] },
  { group: 'Gammes et tonalités', id: 'sigc', title: 'Combien d’altérations à l’armure ?', kind: 'sigcount' },
  { group: 'Gammes et tonalités', id: 'rel', title: 'Relatives : majeur et mineur', kind: 'relative', keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Am', 'Em', 'Dm', 'Gm', 'Cm', 'Fm'] },
  { group: 'Intervalles et accords', id: 'ivf', title: 'Trouver la note à un intervalle donné', kind: 'ivfind' },
  { group: 'Intervalles et accords', id: 'ivs-q', title: 'Intervalles écrits : la quantité', kind: 'intervalsight', quality: false, set: ['2M', '3M', '4J', '5J', '6M', '7m', '8ve'] },
  { group: 'Intervalles et accords', id: 'ivs', title: 'Intervalles écrits : quantité et qualité', kind: 'intervalsight', set: ['2m', '2M', '3m', '3M', '4J', '5J', '6m', '6M', '7m', '7M', '8ve'] },
  { group: 'Intervalles et accords', id: 'chsp', title: 'Les notes d’un accord', kind: 'chordspell', set: ['M', 'm', 'dim'] },
  { group: 'Intervalles et accords', id: 'trk', title: 'Les accords d’une tonalité', kind: 'triadkey' },
  { group: 'Intervalles et accords', id: 'fnk', title: 'Fonctions : tonique, sous-dominante, dominante', kind: 'funckey' },
  { group: 'Intervalles et accords', id: 'chs', title: 'Accords écrits : nature et renversement', kind: 'chordsight', set: ['M', 'm'], inversions: [0, 1, 2] },
  { group: 'Intervalles et accords', id: 'chs4', title: 'Accords écrits : les quatre natures', kind: 'chordsight', set: ['M', 'm', 'dim', 'aug'], inversions: [0] },
  { group: 'Intervalles et accords', id: 'chs7', title: 'Accords de septième écrits : nature', kind: 'chordsight', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'], inversions: [0] },
  { group: 'Intervalles et accords', id: 'chs-v7', title: 'Septième de dominante écrite : quel renversement ?', kind: 'chordsight', set: ['7'], inversions: [0, 1, 2, 3] },
  { group: 'Intervalles et accords', id: 'play-fm', title: 'Jouer les fonctions en fa mineur', kind: 'playchord', mode: 'play' },
  { group: 'Intervalles et accords', id: 'chsp7', title: 'Les notes d’un accord de septième', kind: 'chordspell', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'] },
  { group: 'Intervalles et accords', id: 'trk7', title: 'Les septièmes d’une tonalité', kind: 'triadkey', seventh: true, keys: ['C', 'G', 'F', 'D', 'Bb', 'Am', 'Fm'] },
  { group: 'Intervalles et accords', id: 'sdom', title: 'Dominantes secondaires', kind: 'secdom' },
];

/** Compatibilité : toutes les séries. */
export const QUIZ_PRESETS = [...EAR_PRESETS, ...THEORY_PRESETS];

/** Accès pour les tests automatiques. */
export { GEN as _GEN, genRhythm as _genRhythm, rhythmAbc as _rhythmAbc };
