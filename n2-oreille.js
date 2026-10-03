// Niveau 2 — Oreille : le mode mineur, les intervalles, les accords, les fonctions, les cadences, les dictées.
// Même principe qu'au niveau 1 : chanter d'abord, situer chaque son par rapport à la tonique, dix minutes par jour.
import { OP15, CLAIR } from './content-excerpts.js';

const ROUTINE = (items) => `<div class="callout exo"><div class="c-title">Ta routine de la semaine (10 minutes par jour)</div><ol>${items.map(i => `<li>${i}</li>`).join('')}</ol></div>`;

export default [
  {
    id: 'n2-or1', minutes: 10,
    title: 'Les degrés en mineur',
    summary: 'Ta pièce oppose fa majeur et fa mineur sur la même tonique. Trois degrés changent de couleur : 3, 6 et 7.',
    goals: ['Reconnaître les degrés 1 à 7 en mineur, après une cadence.', 'Chanter la gamme mineure en numéros.', 'Entendre la différence entre fa majeur et fa mineur dans ta pièce.'],
    body: W => `
<p>Au niveau 1, tu as appris à situer chaque note de la gamme majeure par rapport à la tonique. Le mode mineur garde la même tonique et les mêmes degrés 1, 2, 4 et 5 ; seuls <b>3 et 6</b> sont abaissés. Le 7e degré, lui, est le plus souvent haussé (mineur harmonique) pour garder une <b>sensible</b> : c’est ainsi qu’il sonne dans la cadence des exercices.</p>
<table>
<thead><tr><th class="num">Degré</th><th>En la mineur</th><th>Ce qu’on entend</th></tr></thead>
<tbody>
<tr><td class="num">3</td><td>do</td><td>stable mais sombre : c’est elle qui fait le mode mineur</td></tr>
<tr><td class="num">6</td><td>fa</td><td>pesant, attiré par 5, un demi-ton plus bas</td></tr>
<tr><td class="num">7</td><td>sol♯</td><td>la sensible : un demi-ton sous la tonique, elle veut monter</td></tr>
</tbody></table>
${W.kbd({ from: 57, to: 69, title: 'La mineur harmonique : 3, 6 et 7 mis en valeur', marks: [57, 59, 60, 62, 64, 65, 68, 69].map((m, i) => ({ m, label: String(i + 1), color: [2, 5, 6].includes(i) ? '#f2d9a8' : null })), names: 'none', play: 'seq', seq: [57, 59, 60, 62, 64, 65, 68, 69], step: 0.38, caption: 'Entre 6 (fa) et 7 (sol♯), une seconde augmentée : l’« accent oriental » du mineur harmonique.' })}

${ROUTINE([
  'Deux minutes : joue la cadence i – iv – V7 – i en la mineur, puis chante 1-2-3-2-1, puis 5-6-5 et 7-8.',
  'Cinq minutes : série « Degrés 1 à 5 en mineur », puis « Toute la gamme mineure » quand tu atteins 80 %.',
  'Trois minutes : série « Chanter en mineur ».',
])}
${W.quiz({ kind: 'degree', mode: 'min', degrees: [1, 2, 3, 4, 5], names: true, title: 'Degrés 1 à 5 en mineur (la mineur)', count: 12, stat: 'deg-min15' })}
${W.tip('La tierce', '<p>En mineur, 3 est aussi stable qu’en majeur, mais voilé. Si la note semble reposante et sombre à la fois, c’est 3.</p>')}
${W.quiz({ kind: 'degree', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7], key: 'random', title: 'Toute la gamme mineure (toutes tonalités)', count: 12, stat: 'deg-min', goal: 0.7 })}
${W.tip('6 et 7', '<p>6 retombe d’un demi-ton sur 5 ; 7 monte d’un demi-ton vers 8. Écoute la résolution après chaque réponse : la direction te dit lequel tu as entendu.</p>')}
${W.quiz({ kind: 'sing', mode: 'min', task: 'seq', seqs: [[1, 2, 3], [3, 2, 1], [5, 6, 5], [7, 8], [1, 3, 5]], title: 'Chanter en mineur', count: 8, stat: 'sing-min' })}
${W.quiz({ kind: 'echo', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 4, maxStep: 2, title: 'Rejouer 4 notes en mineur', count: 8, stat: 'echo-min4' })}

<h2>Dans ta pièce</h2>
<p>Joue la gamme de fa majeur, puis celle de fa mineur, en chantant les numéros : la – ré deviennent la♭ – ré♭, et mi reste mi♮ (la sensible). Puis écoute la mesure 1 (fa majeur, la mélodie part de do et monte vers fa) et la mesure 25 (fa mineur, <i>con fuoco</i>) : même tonique, deux mondes. C’est la tierce, la → la♭, qui fait basculer.</p>
${W.score({ abc: OP15.e3, title: 'Mesures 25 à 28 : fa mineur', bpm: 84, startBpm: 56, practice: false })}

${W.warn('Si 3 et 2 se confondent en mineur', '<p>En mineur, 2 et 3 ne sont séparés que d’un demi-ton. Chante 1, puis monte : 1 – 2 est un ton, 2 – 3 un demi-ton. Le chemin depuis la tonique reste la méthode la plus sûre.</p>')}
`,
  },

  {
    id: 'n2-or2', minutes: 10,
    title: 'Les intervalles (1) : de la seconde à la quinte',
    summary: 'Mesurer la distance entre deux notes, avec un début de chanson pour chaque intervalle. La levée de ta pièce est une quarte.',
    goals: ['Reconnaître secondes, tierces, quarte, quinte et octave, en montant.', 'Puis en descendant.', 'Chanter une tierce, une quarte, une quinte au-dessus d’une note donnée.'],
    body: W => `
<p>Un <b>intervalle</b> est la distance entre deux notes. Tu en connais déjà beaucoup sans le savoir : de 1 à 3, c’est une tierce ; de 1 à 5, une quinte. Pour les reconnaître hors tonalité, on associe chacun au <b>début d’une chanson</b> connue : l’oreille retrouve la chanson, et la chanson donne l’intervalle.</p>
<table>
<thead><tr><th>Intervalle</th><th class="num">Demi-tons</th><th>Dans la gamme</th><th>Repère</th></tr></thead>
<tbody>
<tr><td>2de mineure</td><td class="num">1</td><td>7 → 8, 3 → 4</td><td>« Les Dents de la mer »</td></tr>
<tr><td>2de majeure</td><td class="num">2</td><td>1 → 2</td><td>« Frère Jacques » (frè-re)</td></tr>
<tr><td>3ce mineure</td><td class="num">3</td><td>1 → 3 en mineur</td><td>« Smoke on the Water » ; en descendant, l’appel « cou-cou » (sol – mi)</td></tr>
<tr><td>3ce majeure</td><td class="num">4</td><td>1 → 3 en majeur</td><td>« Le Beau Danube bleu »</td></tr>
<tr><td>4te juste</td><td class="num">5</td><td>1 → 4, 5 → 8</td><td>« La Marseillaise » (Allons en-fants : en → fants)</td></tr>
<tr><td>5te juste</td><td class="num">7</td><td>1 → 5</td><td>« Ah ! vous dirai-je, maman » (do-do-sol)</td></tr>
<tr><td>octave</td><td class="num">12</td><td>1 → 8</td><td>« Over the Rainbow » (Some-where)</td></tr>
</tbody></table>
<p>Trois façons d’entendre un intervalle : <b>mélodique montant</b>, <b>mélodique descendant</b>, <b>harmonique</b> (les deux notes ensemble). On commence par le premier.</p>

${ROUTINE([
  'Deux minutes : chante chaque repère du tableau en partant de do, puis vérifie au piano.',
  'Cinq minutes : séries « Secondes et tierces », puis « De la seconde à la quinte ».',
  'Trois minutes : série « Chanter un intervalle ».',
])}
${W.quiz({ kind: 'intervals', set: ['2m', '2M', '3m', '3M'], title: 'Secondes et tierces (montantes)', count: 12, stat: 'iv-b' })}
${W.tip('Remplir l’espace', '<p>Chante les deux notes, puis remplis l’espace pas à pas : do-ré-mi, c’est trois noms de notes, donc une tierce. Majeure ou mineure ? Compare avec le début du « Beau Danube bleu » (majeure) ou de « Smoke on the Water » (mineure).</p>')}
${W.quiz({ kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', '5J', '8ve'], title: 'De la seconde à la quinte, et l’octave', count: 12, stat: 'iv-n1' })}
${W.quiz({ kind: 'intervals', set: ['2M', '3m', '3M', '4J', '5J', '8ve'], directions: ['down'], title: 'Les mêmes, en descendant', count: 12, stat: 'iv-n1-down', goal: 0.7 })}
${W.tip('En descendant', '<p>Un intervalle descendant se chante souvent mieux à l’envers : chante la seconde note, puis la première en montant, et cherche la chanson. La quinte descendante, c’est le début de « Ah ! vous dirai-je » (do-do-sol) à l’envers (sol → do).</p>')}
${W.quiz({ kind: 'sing', task: 'interval', set: ['2M', '3M', '4J', '5J', '8ve'], title: 'Chanter un intervalle au-dessus d’une note', count: 8, stat: 'sing-iv2' })}

<h2>Dans ta pièce</h2>
<p>La levée de l’op. 15 n° 1 fait <b>do → fa</b> : une <b>quarte juste</b>, comme « Allons en-fants » de la Marseillaise (en → fants), ou 5 → 8 dans la gamme de fa. Puis la mélodie descend par secondes (fa – mi – ré), remonte (mi), saute une <b>tierce</b> (mi → do), et monte pas à pas jusqu’au la de la mesure 4. Chante tout le début en nommant chaque intervalle.</p>
${W.score({ abc: OP15.e1, title: 'Mesures 1 à 8 : nomme les intervalles de la mélodie', bpm: 66, startBpm: 56, practice: false })}

${W.warn('Quarte ou quinte ?', '<p>La quarte (« Allons en-fants ») monte vers une note d’arrivée ; la quinte (« do-do-sol ») sonne vide et ouverte. En cas de doute, chante 1 – 4 puis 1 – 5 : la quinte est un ton plus loin.</p>')}
`,
  },

  {
    id: 'n2-or3', minutes: 10,
    title: 'Les intervalles (2) : sixtes, septièmes, triton',
    summary: 'Les grands intervalles, les intervalles harmoniques, et le triton. Les doubles notes du Con fuoco sont des sixtes, des quintes et des quartes.',
    goals: ['Reconnaître sixtes, septièmes et triton.', 'Reconnaître un intervalle harmonique (notes ensemble).', 'Nommer les intervalles des doubles notes du Con fuoco.'],
    body: W => `
<table>
<thead><tr><th>Intervalle</th><th class="num">Demi-tons</th><th>Repère</th><th>Couleur harmonique</th></tr></thead>
<tbody>
<tr><td>triton (4te augmentée)</td><td class="num">6</td><td>« Maria » (West Side Story)</td><td>instable, il veut bouger</td></tr>
<tr><td>6te mineure</td><td class="num">8</td><td>« The Entertainer » (mi → do)</td><td>douce, un peu sombre</td></tr>
<tr><td>6te majeure</td><td class="num">9</td><td>Nocturne op. 9 n° 2 (si♭ → sol) ; « My Bonnie »</td><td>douce, chaleureuse</td></tr>
<tr><td>7e mineure</td><td class="num">10</td><td>« Star Trek » (série originale) ; « Somewhere »</td><td>dissonance souple</td></tr>
<tr><td>7e majeure</td><td class="num">11</td><td>l’octave moins un demi-ton</td><td>dissonance tendue</td></tr>
</tbody></table>
<p>Une astuce pour les grands intervalles : les comparer à l’octave. La 7e majeure est à un demi-ton de l’octave, la 7e mineure à un ton. De même, une sixte est une tierce « renversée » : do – la (6te majeure) est le complément de la – do (3ce mineure).</p>
<p>Joués ensemble (<b>harmoniques</b>), les intervalles se classent par couleur : <b>vides</b> (quarte, quinte, octave), <b>doux</b> (tierces, sixtes), <b>frottants</b> (secondes, septièmes, triton).</p>

${ROUTINE([
  'Deux minutes : joue chaque intervalle du tableau en montant puis ensemble, et chante son repère.',
  'Cinq minutes : série « Sixtes, septièmes, triton », puis la grande série mélangée.',
  'Trois minutes : série « Intervalles harmoniques ».',
])}
${W.quiz({ kind: 'intervals', set: ['Triton', '6m', '6M', '7m', '7M', '8ve'], title: 'Sixtes, septièmes, triton', count: 12, stat: 'iv-c' })}
${W.tip('La sixte majeure', '<p>Le début du Nocturne op. 9 n° 2 (si♭ → sol) est le repère idéal pour un pianiste : chante-le, tu as la sixte majeure.</p>')}
${W.quiz({ kind: 'intervals', set: ['3m', '3M', '4J', '5J', '6m', '6M', '8ve'], directions: ['harm'], title: 'Intervalles harmoniques (notes ensemble)', count: 12, stat: 'iv-harm', goal: 0.7 })}
${W.tip('Entendre deux notes ensemble', '<p>Chante d’abord la note grave, puis la note aiguë : tu transformes l’intervalle harmonique en intervalle mélodique, que tu sais reconnaître.</p>')}
${W.quiz({ kind: 'intervals', set: ['2m', '2M', '3m', '3M', '4J', 'Triton', '5J', '6m', '6M', '7m', '7M', '8ve'], directions: ['up', 'down', 'harm'], title: 'Tous les intervalles (montants, descendants, harmoniques)', count: 15, stat: 'iv-all', goal: 0.7 })}

<h2>Dans ta pièce</h2>
<p>Les doubles notes de la main droite du Con fuoco sont des intervalles harmoniques. Mesure 25 : la♭ – fa et do – la♭ alternent, deux <b>sixtes</b> (majeure, puis mineure). Mesure 26 : si♭ – fa et ré♭ – la♭, deux <b>quintes</b>. Mesure 27 : si♭ – sol (sixte majeure) et fa – si♭ (quarte). Joue-les très lentement en nommant chaque intervalle : les sixtes sonnent pleines, les quintes plus creuses ; adapte ton poids à chacune.</p>
${W.score({ abc: OP15.e3, title: 'Mesures 25 à 28 : les doubles notes', bpm: 84, startBpm: 46, practice: false })}

${W.warn('Sixte mineure ou majeure ?', '<p>Pense « tierce renversée » : chante la note aiguë puis l’octave au-dessus de la grave. Si l’espace restant est une tierce majeure, la sixte était mineure, et inversement.</p>')}
`,
  },

  {
    id: 'n2-or4', minutes: 10,
    title: 'Les accords : quatre couleurs, et la basse',
    summary: 'Majeur, mineur, diminué, augmenté à l’oreille ; chanter un arpège ; suivre la basse sous des accords qui changent.',
    goals: ['Reconnaître les quatre sortes d’accords de trois sons.', 'Chanter l’arpège d’un accord majeur et mineur.', 'Suivre une basse qui tient pendant que les accords changent.'],
    body: W => `
<table>
<thead><tr><th>Accord</th><th>Tierces</th><th>Couleur</th></tr></thead>
<tbody>
<tr><td>majeur</td><td>majeure + mineure</td><td>clair, stable</td></tr>
<tr><td>mineur</td><td>mineure + majeure</td><td>plus sombre, stable</td></tr>
<tr><td>diminué</td><td>mineure + mineure</td><td>serré, inquiet</td></tr>
<tr><td>augmenté</td><td>majeure + majeure</td><td>flottant, sans repos</td></tr>
</tbody></table>
<p>Méthode : écoute l’arpège, chante 1 – 3 – 5, puis juge la couleur de l’accord plaqué. La tierce décide entre majeur et mineur ; la quinte, entre « normal » (juste), diminué (trop courte) et augmenté (trop longue).</p>
<p>Dans la musique, il faut aussi entendre <b>la basse</b> : c’est elle qui donne la position de l’accord et qui porte l’harmonie. Prends l’habitude de chanter la note la plus grave de chaque accord.</p>

${ROUTINE([
  'Deux minutes : joue do majeur, do mineur, do diminué, do augmenté, en arpège puis plaqués ; chante chaque arpège.',
  'Cinq minutes : série « Quatre couleurs d’accords ».',
  'Trois minutes : série « Chanter l’arpège », en majeur puis en mineur.',
])}
${W.quiz({ kind: 'chords', set: ['M', 'm'], arpeggiate: false, title: 'Échauffement : majeur ou mineur (accords plaqués)', count: 10, stat: 'ch-mm-bloc' })}
${W.quiz({ kind: 'chords', set: ['M', 'm', 'dim', 'aug'], title: 'Quatre couleurs d’accords', count: 12, stat: 'ch-n1' })}
${W.tip('Diminué ou augmenté', '<p>Les deux sont instables. Le diminué se resserre (on a envie qu’il se referme), l’augmenté s’ouvre et flotte (on ne sait pas où il va). Chante la quinte : trop basse, diminué ; trop haute, augmenté.</p>')}
${W.quiz({ kind: 'sing', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [1, 3, 5, 8]], title: 'Chanter l’arpège (majeur)', count: 6, stat: 'sing-arp' })}
${W.quiz({ kind: 'sing', mode: 'min', task: 'seq', seqs: [[1, 3, 5], [5, 3, 1], [1, 3, 5, 8]], title: 'Chanter l’arpège (mineur)', count: 6, stat: 'sing-arp-min' })}

<h2>Dans ta pièce</h2>
<p>Mesures 29 à 32 : la basse tient <b>ré♭</b> (sauf à la mesure 31, où sol♭ passe à la basse) pendant que les accords changent au-dessus (fa majeur, si♭ mineur, ré♭ 7, sol♭…). Écoute en chantant la basse tenue, puis chante la note la plus aiguë de chaque accord. Fa majeur (mesure 29) est un accord <b>majeur</b>, si♭ mineur un accord <b>mineur</b> : reconnais-les à l’oreille avant de vérifier dans le panneau d’analyse.</p>
${W.score({ abc: OP15.e4, title: 'Mesures 29 à 32 : des accords sur une basse tenue', bpm: 84, startBpm: 50, practice: false })}

${W.warn('Si majeur et mineur se confondent encore', '<p>Joue l’accord, puis la même chose avec la tierce changée : la comparaison directe est le plus efficace des entraînements. Quelques jours suffisent en général.</p>')}
`,
  },

  {
    id: 'n2-or5', minutes: 10,
    title: 'Les fonctions : I, IV, V, vi, ii',
    summary: 'Reconnaître un accord par sa place dans la tonalité, en écoutant la basse. Clair de lune commence par une couleur empruntée.',
    goals: ['Reconnaître IV, V, vi et ii après l’accord de tonique.', 'Suivre et chanter une ligne de basse.', 'Entendre l’ombre de la mesure 2 de Clair de lune.'],
    body: W => `
<p>Comme pour les degrés, on n’entend pas un accord « dans l’absolu » : on l’entend <b>par rapport à la tonique</b>. Et c’est la <b>basse</b> qui le révèle le plus vite :</p>
<table>
<thead><tr><th>Après I</th><th>La basse…</th><th>L’accord</th></tr></thead>
<tbody>
<tr><td>IV</td><td>monte d’une quarte (1 → 4)</td><td>majeur, ouvert, chaleureux</td></tr>
<tr><td>V</td><td>descend d’une quarte ou monte d’une quinte (1 → 5)</td><td>majeur, tendu : on attend le retour</td></tr>
<tr><td>vi</td><td>descend d’une tierce (1 → 6)</td><td>mineur, plus sombre</td></tr>
<tr><td>ii</td><td>monte d’un ton (1 → 2)</td><td>mineur, il prépare souvent V</td></tr>
</tbody></table>

${ROUTINE([
  'Deux minutes : joue I – IV – I – V – I – vi – I – ii – V – I en do, en chantant la basse.',
  'Cinq minutes : séries « IV, V ou vi ? », puis « ii, IV, V ou vi ? ».',
  'Trois minutes : série « Rejouer une basse ».',
])}
${W.quiz({ kind: 'chordfunc', set: ['IV', 'V', 'vi'], title: 'Après le I : IV, V ou vi ?', count: 12, stat: 'func' })}
${W.tip('Chante la basse', '<p>Chante la basse des deux accords : un saut vers le haut de quatre notes (IV), vers le bas de quatre notes (V), une petite descente (vi), un pas vers le haut (ii).</p>')}
${W.quiz({ kind: 'chordfunc', set: ['ii', 'IV', 'V', 'vi'], title: 'Après le I : ii, IV, V ou vi ?', count: 12, stat: 'func2', goal: 0.7 })}
${W.quiz({ kind: 'echo', degrees: [1, 4, 5, 6, 8], length: 4, maxStep: 3, title: 'Rejouer une basse (degrés 1, 4, 5, 6)', count: 8, stat: 'echo-bass' })}

<h2>Dans ta pièce</h2>
<p>Clair de lune commence sans basse, mais l’harmonie s’entend : ré♭ majeur (mesure 1, tonique) ; à la mesure 2, sous les tierces do – mi♭, la main gauche descend sur sol♭ – si𝄫 : une septième diminuée (dominante), assombrie par le si𝄫 du mineur ; mesure 3, si♭ m7 (vi7), mineur et doux ; mesure 4, la♭ 7 (la dominante), avec mi♭ à la basse. Écoute en chantant la note la plus grave de la main gauche (fa, sol♭, fa, mi♭) : la ligne descend doucement, et la tension monte et retombe à chaque mesure.</p>
${W.score({ abc: CLAIR.e1, title: 'Clair de lune, mesures 1 à 4', bpm: 40, startBpm: 36, practice: false })}

${W.warn('Si IV et V se confondent', '<p>IV donne envie de revenir doucement à I (« amen ») ; V donne envie d’y revenir avec force. Écoute aussi la basse : vers le haut de quatre notes, IV ; vers le bas, V.</p>')}
`,
  },

  {
    id: 'n2-or6', minutes: 10,
    title: 'Les cadences et les changements de mode',
    summary: 'Les quatre ponctuations de la musique tonale, en majeur et en mineur, et le passage d’un mode à l’autre sur la même tonique.',
    goals: ['Reconnaître les cadences parfaite, demi, plagale et rompue.', 'Les reconnaître aussi en mineur.', 'Entendre un changement de mode dans tes pièces.'],
    body: W => `
<table>
<thead><tr><th>Cadence</th><th>Enchaînement</th><th>Effet</th></tr></thead>
<tbody>
<tr><td>parfaite</td><td>V → I</td><td>un point final</td></tr>
<tr><td>demi-cadence</td><td>… → V</td><td>une virgule, une question</td></tr>
<tr><td>plagale</td><td>IV → I</td><td>un « amen », plus doux</td></tr>
<tr><td>rompue</td><td>V → vi</td><td>une surprise : on attendait I</td></tr>
</tbody></table>
<p>En mineur, les mêmes cadences existent (V → i, … → V, iv → i, V → VI). Concentre-toi sur la <b>fin</b> : repos complet, suspension, repos adouci, ou détour ?</p>

${ROUTINE([
  'Deux minutes : joue les quatre cadences en do majeur, puis en la mineur.',
  'Cinq minutes : série « Les quatre cadences », en majeur puis en mineur.',
  'Trois minutes : série « Gammes majeures et mineures ».',
])}
${W.quiz({ kind: 'cadences', modes: ['maj'], title: 'Les quatre cadences (majeur)', count: 10, stat: 'cad-maj' })}
${W.tip('La rompue', '<p>Elle commence exactement comme une parfaite (V7) ; seul le dernier accord trompe : mineur au lieu de majeur, basse qui monte d’un ton au lieu de descendre. Si la fin te surprend, c’est elle.</p>')}
${W.quiz({ kind: 'cadences', title: 'Les quatre cadences (majeur et mineur)', count: 12, stat: 'cad', goal: 0.7 })}
${W.quiz({ kind: 'scales', title: 'Gammes majeures et mineures', count: 10, stat: 'sc' })}

<h2>Dans tes pièces</h2>
<ul>
<li><b>Op. 15, mesures 21-22</b> : do 7 → fa, une cadence parfaite (la basse va de do à fa).</li>
<li><b>Mesures 22 à 25</b> : le thème revient et s’arrête sur do 7, au-dessus de la basse fa : un effet de demi-cadence ; un silence… puis fa mineur : même tonique, autre mode.</li>
<li><b>Mesures 72 à 74</b> : la fin, do 7 sur la pédale de fa, puis fa : une conclusion adoucie par la pédale.</li>
<li><b>Clair de lune, mesures 42-43</b> : de do♯ mineur à ré♭ majeur (la même tonique écrite autrement) : l’armure change, et la dominante la♭ prépare le retour de la lumière.</li>
</ul>
${W.score({ abc: OP15.e2, title: 'Op. 15, mesures 17 à 24 : jusqu’à la demi-cadence', bpm: 66, startBpm: 50, practice: false })}

${W.warn('Plagale ou parfaite ?', '<p>Les deux finissent sur I. La parfaite y arrive avec une tension (la sensible qui monte) ; la plagale, sans sensible, glisse doucement. Chante la note qui précède la tonique dans la voix du haut : si (sensible) pour la parfaite, la ou do pour la plagale.</p>')}
`,
  },

  {
    id: 'n2-or7', minutes: 10,
    title: 'Dictées : mélodies et rythmes',
    summary: 'Retrouver une mélodie entendue et la rejouer ; retaper des rythmes avec syncopes et triolets.',
    goals: ['Rejouer une mélodie de cinq ou six notes, en majeur et en mineur.', 'Retaper des rythmes pointés, syncopés, en triolets.', 'Entendre les duolets de Clair de lune et les triolets de l’op. 15.'],
    body: W => `
<p>Une dictée rassemble tout ce que tu as travaillé : la tonique, les degrés, les intervalles, le rythme. La méthode compte plus que le talent :</p>
<ol>
<li><b>Écoute sans rien faire</b> : la mélodie entière, pour en avoir la forme.</li>
<li><b>Chante-la</b> : si tu peux la chanter, tu peux la retrouver.</li>
<li><b>Repère la structure</b> : la note de départ, la note la plus haute, la dernière note (souvent 1).</li>
<li><b>Pense en degrés</b>, puis joue.</li>
</ol>
<p>Pour le rythme : compte les temps pendant l’écoute, et rapporte chaque note à la pulsation. Les <b>syncopes</b> (une note qui commence entre deux temps et dure par-dessus le temps suivant) se sentent mieux en battant le temps du pied.</p>

${ROUTINE([
  'Quatre minutes : séries « Rejouer 5 notes » (toutes tonalités), puis en mineur.',
  'Quatre minutes : séries rythmiques « Pointés et syncopes », puis « Triolets ».',
  'Deux minutes : série « À trois temps ».',
])}
${W.quiz({ kind: 'echo', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 5, maxStep: 2, key: 'random', title: 'Rejouer 5 notes (toutes tonalités)', count: 8, stat: 'echo-8r', goal: 0.7 })}
${W.quiz({ kind: 'echo', mode: 'min', degrees: [1, 2, 3, 4, 5, 6, 7, 8], length: 5, maxStep: 2, key: 'random', title: 'Rejouer 5 notes en mineur', count: 8, stat: 'echo-min', goal: 0.7 })}
${W.tip('La note perdue', '<p>Si une note t’échappe, garde les autres : rejoue le début et la fin, puis cherche le milieu par élimination. Une dictée se reconstruit, elle ne se devine pas d’un coup.</p>')}
${W.quiz({ kind: 'rhythm', cells: ['q', 'ee', 'qd_e', 'e_q_e', 'h'], bpm: 66, title: 'Pointés et syncopes', count: 8, stat: 'ry-3' })}
${W.quiz({ kind: 'rhythm', cells: ['q', 'ee', 'ssss', 'trip'], bpm: 60, title: 'Triolets et doubles croches', count: 8, stat: 'ry-4' })}
${W.quiz({ kind: 'rhythm', meter: 3, cells: ['q', 'h', 'ee', 'qd_e', 'trip'], bpm: 66, title: 'À trois temps', count: 8, stat: 'ry-34' })}

<h2>Dans tes pièces</h2>
<p>Dans l’Andante de l’op. 15, la main gauche joue des <b>triolets</b> (trois croches par temps) sous une mélodie souvent pointée : tape la pulsation, puis le rythme de la mélodie des mesures 5 et 6, où un triolet apparaît aussi à la main droite. Dans Clair de lune (9/8), chaque temps se divise en trois croches ; un <b>duolet</b> met deux valeurs égales dans le temps de trois : compte « 1-2-3 » et place-les sur « 1 » et sur le milieu du « 2 ». Aux mesures 15 et 17, le premier temps est un duolet (un silence, puis un accord) ; aux mesures 16 et 18, le deuxième temps fait entendre deux accords en duolet.</p>
${W.score({ abc: CLAIR.e2, title: 'Clair de lune, mesures 15 à 18 : les duolets', bpm: 40, startBpm: 34, click: true, practice: false })}

${W.warn('Si les triolets se brouillent', '<p>Dis « tri-o-let » sur chaque temps, régulièrement, puis tape en parlant. Les trois notes sont égales : ne les compresse pas vers la fin du temps.</p>')}
`,
  },

  {
    id: 'n2-or8', minutes: 10,
    title: 'Les accords de septième, et bilan',
    summary: 'Cinq couleurs de septième à l’oreille, du plus contrasté au plus fin. L’Andante de l’op. 15 en est rempli.',
    goals: ['Distinguer septième de dominante et septième majeure.', 'Ajouter la septième mineure, puis les accords diminués.', 'Faire le bilan de ton oreille sur les deux niveaux.'],
    body: W => `
<table>
<thead><tr><th>Septième</th><th>Ce qu’on entend</th></tr></thead>
<tbody>
<tr><td>de dominante</td><td>tendue, elle veut avancer (V7)</td></tr>
<tr><td>majeure</td><td>douce, rêveuse, un peu suspendue</td></tr>
<tr><td>mineure</td><td>souple, mélancolique sans tension</td></tr>
<tr><td>demi-diminuée</td><td>sombre et instable, elle prépare la dominante</td></tr>
<tr><td>diminuée</td><td>dramatique, comme suspendue au-dessus du vide</td></tr>
</tbody></table>
<p>Méthode : d’abord la base (majeur ou mineur ? diminué ?), puis la septième, tout en haut de l’arpège : à un demi-ton de l’octave (7e majeure) ou à un ton (7e mineure) ?</p>

${ROUTINE([
  'Deux minutes : joue les cinq septièmes sur do, en arpège puis plaquées, en les nommant.',
  'Cinq minutes : séries « Dominante ou majeure ? », puis « Trois septièmes ».',
  'Trois minutes : série « Les cinq septièmes ».',
])}
${W.quiz({ kind: 'chords', set: ['7', 'maj7'], title: 'Septième de dominante ou septième majeure ?', count: 10, stat: 'ch7-a' })}
${W.tip('L’octave', '<p>Chante l’arpège 1-3-5-7, puis 8 : si 7 et 8 se frôlent (un demi-ton), la septième est majeure ; s’il reste un ton, elle est mineure.</p>')}
${W.quiz({ kind: 'chords', set: ['7', 'maj7', 'm7'], title: 'Trois septièmes', count: 12, stat: 'ch7-b' })}
${W.quiz({ kind: 'chords', set: ['7', 'maj7', 'm7', 'hdim7', 'dim7'], title: 'Les cinq septièmes', count: 12, stat: 'ch-n2', goal: 0.7 })}

<h2>Dans ta pièce</h2>
<p>Dans les mesures 1 à 8 de l’op. 15, presque chaque temps porte une septième : do 7, sol m7, la 7, sol ø7, si ø7, mi 7… Joue-les en blocs grâce au panneau d’analyse, en devinant leur couleur avant de lire le nom. Au sommet de l’Andante (mesure 20), écoute la septième diminuée si – ré – fa – la♭, la plus dramatique.</p>
${W.score({ abc: OP15.e1, title: 'Op. 15, mesures 1 à 8 : des septièmes partout', bpm: 66, startBpm: 56, practice: false })}

${W.key('Bilan des deux niveaux', '<p>Tu sais maintenant situer toute note par rapport à la tonique, en majeur et en mineur ; reconnaître les intervalles, les accords de trois et quatre sons, les fonctions et les cadences ; rejouer une mélodie et retaper un rythme. Garde dix minutes d’oreille par jour : c’est l’entraînement qui, à long terme, change le plus la façon d’écouter et de jouer.</p>')}
`,
  },
];
