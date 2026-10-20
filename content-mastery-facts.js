// Notions clés des cours de théorie, en questions à choix (exercices de l’onglet « En cours de maîtrise »). Depuis la V6,
// les leçons du niveau 1 ont leurs propres questions (notions) : seules celles du niveau 2 servent encore ici.
// Chaque carte : leçon, question, réponses (la bonne en premier : l'ordre est mélangé à l'affichage), explication.
// Rédigées d'après les encadrés « À retenir » et « Erreurs fréquentes » de chaque leçon.
export const FACTS = {
  'n1-th-notes': [
    ['Entre quelles touches blanches n’y a-t-il pas de touche noire ?', ['mi–fa et si–do', 'do–ré et fa–sol', 'sol–la et la–si', 'ré–mi et la–si'], 'Mi–fa et si–do ne sont qu’à un demi-ton : pas de touche noire entre elles.'],
    ['Comment s’appelle le do central, en France ?', ['do3', 'do4', 'do2', 'do1'], 'Do3 en France ; les ouvrages anglophones disent C4.'],
    ['Sur quelle touche se joue mi♯ ?', ['la touche blanche fa', 'la touche noire entre mi et fa', 'la touche fa♯', 'la touche ré♯'], 'Un dièse n’est pas toujours une touche noire : mi♯ = fa.'],
    ['Do♯ et ré♭ sont…', ['enharmoniques : même touche, nom différent', 'à un demi-ton l’un de l’autre', 'à un ton l’un de l’autre', 'deux touches différentes'], 'Une touche noire porte deux noms ; le nom dépend de la tonalité.'],
  ],
  'n1-th-portee': [
    ['En clé de fa, quelle note est sur la 4e ligne ?', ['fa2', 'sol3', 'ré3', 'la2'], 'Les deux points de la clé de fa encadrent la 4e ligne : fa2.'],
    ['En clé de sol, sur quelle ligne est sol3 ?', ['la 2e ligne', 'la 1re ligne', 'la 3e ligne', 'la 4e ligne'], 'La clé de sol s’enroule autour de la 2e ligne.'],
    ['Jusqu’où vaut une altération accidentelle ?', ['jusqu’à la barre de mesure, pour cette note à cette hauteur', 'jusqu’à la fin de la pièce', 'pour une seule note', 'jusqu’à la fin de la ligne, à toutes les octaves'], 'L’armure vaut pour toute la pièce ; l’altération accidentelle, jusqu’à la barre de mesure.'],
    ['En clé de fa, quelle note est sur la 2e ligne ?', ['si', 'sol', 'ré', 'la'], 'Piège classique : lue comme en clé de sol, on dirait sol ; en clé de fa, c’est si.'],
  ],
  'n1-th-rythme': [
    ['Combien de temps (de noire) dure une blanche pointée ?', ['3', '2', '2 ½', '4'], 'Le point ajoute la moitié de la valeur : 2 + 1 = 3.'],
    ['Combien vaut une croche pointée ?', ['¾ de temps', '½ temps', '1 temps ½', '1 temps'], '½ + ¼ = ¾ de temps : la double croche qui suit est très courte.'],
    ['Que signifie une liaison entre deux notes de même hauteur ?', ['on joue la première et on tient, sans rejouer', 'on joue les deux notes legato', 'on rejoue la note plus doucement', 'on raccourcit la première note'], 'C’est la liaison de prolongation ; entre notes différentes, c’est une liaison d’expression (legato).'],
    ['Un triolet de croches, c’est…', ['trois croches dans le temps de deux', 'trois croches accentuées', 'trois notes dans un demi-temps', 'trois croches dans le temps de quatre'], 'Trois notes égales à la place de deux : un temps de noire divisé en trois.'],
  ],
  'n1-th-mesure': [
    ['Combien de temps dans une mesure à 6/8 ?', ['2 temps, à la noire pointée', '6 temps, à la croche', '3 temps, à la noire', '4 temps'], 'Mesure composée : deux temps, chacun divisé en trois croches.'],
    ['Dans 3/4, que dit le chiffre du bas ?', ['que le temps est une noire', 'qu’il y a quatre temps', 'le tempo', 'le nombre de mesures de la phrase'], 'Chiffre du haut : nombre de temps ; chiffre du bas : figure d’un temps (4 = noire).'],
    ['Où sont les appuis dans une mesure à 4/4 ?', ['fort – faible – mi-fort – faible', 'fort – fort – faible – faible', 'faible – fort – faible – fort', 'quatre temps égaux'], 'Seul le premier temps est un vrai appui ; le troisième est mi-fort.'],
    ['Qu’est-ce qu’une syncope ?', ['une note attaquée sur une partie faible et tenue par-dessus le temps fort', 'une note accentuée sur le temps fort', 'un silence sur le premier temps', 'une note plus courte que prévu'], 'L’appui est déplacé : la note doit traverser le temps fort, sans être raccourcie.'],
    ['Qu’est-ce qu’une levée ?', ['une ou plusieurs notes avant la première barre de mesure', 'la dernière note d’une phrase', 'un signe de reprise', 'une note répétée'], 'Comme le do qui ouvre l’op. 55 n° 1, avant la première barre.'],
  ],
  'n1-th-gamme': [
    ['Quel est le modèle de la gamme majeure ?', ['T – T – ½ – T – T – T – ½', 'T – ½ – T – T – ½ – T – T', 'T – T – T – ½ – T – T – ½', '½ – T – T – T – ½ – T – T'], 'Les demi-tons sont entre les degrés 3–4 et 7–8.'],
    ['Comment s’appelle le 5e degré ?', ['la dominante', 'la sous-dominante', 'la sus-dominante', 'la médiante'], 'Tonique, sus-tonique, médiante, sous-dominante, dominante, sus-dominante, sensible.'],
    ['Comment s’appelle le 7e degré, à un demi-ton de la tonique ?', ['la sensible', 'la sus-tonique', 'la sous-dominante', 'la médiante'], 'À un ton de la tonique, ce n’est plus une sensible (on parle de sous-tonique).'],
    ['Comment s’appelle le 4e degré ?', ['la sous-dominante', 'la dominante', 'la médiante', 'la sus-tonique'], 'La sous-dominante est une quinte sous la tonique, comme la dominante une quinte au-dessus.'],
  ],
  'n1-th-armures': [
    ['Dans quel ordre s’écrivent les dièses ?', ['fa do sol ré la mi si', 'si mi la ré sol do fa', 'do sol ré la mi si fa', 'fa sol la si do ré mi'], 'L’ordre des bémols est l’inverse : si mi la ré sol do fa.'],
    ['Dans quel ordre s’écrivent les bémols ?', ['si mi la ré sol do fa', 'fa do sol ré la mi si', 'si la sol fa mi ré do', 'mi la ré sol do fa si'], 'L’inverse de l’ordre des dièses.'],
    ['Quatre bémols à l’armure : quelle tonalité ?', ['la♭ majeur ou fa mineur', 'mi♭ majeur ou do mineur', 'ré♭ majeur ou si♭ mineur', 'fa majeur ou ré mineur'], 'Bémols : la tonique majeure est l’avant-dernier bémol (la♭). La basse finale et les altérations tranchent entre majeur et relatif mineur.'],
    ['Trois dièses à l’armure : quelle tonalité ?', ['la majeur ou fa♯ mineur', 'mi majeur ou do♯ mineur', 'ré majeur ou si mineur', 'sol majeur ou mi mineur'], 'Dièses : la tonique majeure est un demi-ton au-dessus du dernier dièse (sol♯ → la).'],
    ['Où se trouve la relative mineure d’une tonalité majeure ?', ['une tierce mineure sous la tonique majeure', 'une quinte au-dessus', 'un ton au-dessus', 'une quarte au-dessous'], 'Do majeur → la mineur ; la♭ majeur → fa mineur : même armure.'],
  ],
  'n1-th-mineur': [
    ['Qu’est-ce qui distingue la gamme mineure harmonique ?', ['son 7e degré est haussé', 'ses 6e et 7e degrés sont haussés', 'elle suit l’armure seule', 'son 3e degré est haussé'], 'Le 7e degré haussé devient la sensible.'],
    ['La gamme mineure mélodique, en montant :', ['6e et 7e degrés haussés', '7e degré seul haussé', 'aucune altération', '2e degré abaissé'], 'En descendant, elle redevient naturelle.'],
    ['Quelle est la sensible de fa mineur ?', ['mi♮', 'mi♭', 'ré♭', 'sol'], 'Un demi-ton sous la tonique : mi♮, écrit en altération accidentelle.'],
    ['Où s’écrit la sensible d’une tonalité mineure ?', ['en altération accidentelle', 'à l’armure', 'nulle part : on ne l’écrit pas', 'seulement dans la gamme mélodique'], 'Elle ne figure jamais à l’armure : c’est même un indice pour reconnaître le mineur.'],
    ['Quelle est la sensible de do mineur ?', ['si♮', 'si♭', 'la♭', 'ré'], 'Trois bémols à l’armure (si♭, mi♭, la♭) : la sensible si♮ porte un bécarre.'],
  ],
  'n1-th-intervalles': [
    ['do – mi, quel intervalle ?', ['une tierce', 'une seconde', 'une quarte', 'une quinte'], 'On compte les noms de notes, extrémités comprises : do, ré, mi = 3.'],
    ['Combien de demi-tons dans une quinte juste ?', ['7', '5', '6', '8'], 'Quarte juste 5, quinte juste 7, octave 12.'],
    ['Que devient une tierce majeure renversée ?', ['une sixte mineure', 'une sixte majeure', 'une quinte juste', 'une tierce mineure'], 'Renversement : 9 moins la quantité (3 → 6), et majeur devient mineur.'],
    ['Combien de demi-tons dans une sixte majeure et une septième mineure ?', ['9 et 10', '8 et 10', '9 et 11', '10 et 11'], 'Deux intervalles faciles à confondre : un demi-ton d’écart.'],
    ['En fa mineur, que vaut la – do (avec l’armure) ?', ['une tierce majeure (la♭ – do)', 'une tierce mineure', 'une quarte', 'une seconde augmentée'], 'L’armure change le la en la♭ : 4 demi-tons.'],
  ],
  'n1-th-accords': [
    ['Comment est construit un accord majeur ?', ['tierce majeure, puis tierce mineure', 'tierce mineure, puis tierce majeure', 'deux tierces mineures', 'deux tierces majeures'], 'Mineur : l’inverse ; diminué : deux tierces mineures ; augmenté : deux tierces majeures.'],
    ['Comment est construit un accord diminué ?', ['deux tierces mineures', 'deux tierces majeures', 'une tierce majeure et une quarte', 'tierce mineure, puis tierce majeure'], 'C’est l’accord du 7e degré en majeur (vii°).'],
    ['En majeur, quels degrés portent un accord mineur ?', ['ii, iii et vi', 'I, IV et V', 'ii, V et vii', 'iii, IV et vii'], 'I IV V majeurs, ii iii vi mineurs, vii° diminué.'],
    ['En fa mineur, quelle est la nature de la♭ – do – mi♭ ?', ['majeur (III)', 'mineur', 'diminué', 'augmenté'], 'Juge la nature avec l’armure : la♭ – do est une tierce majeure.'],
  ],
  'n1-th-renv': [
    ['Accord avec la tierce à la basse : quel chiffrage ?', ['6 (premier renversement)', '5 (état fondamental)', '6/4', '7'], 'Fondamentale à la basse : 5 ; tierce : 6 ; quinte : 6/4.'],
    ['Accord avec la quinte à la basse : quel chiffrage ?', ['6/4 (deuxième renversement)', '6', '5', '4/3'], 'Le 6/4 le plus célèbre est le 6/4 de cadence.'],
    ['mi – sol – do est un accord de…', ['do, au premier renversement', 'mi mineur', 'sol majeur', 'la mineur'], 'Range les notes en tierces : do – mi – sol. La basse n’est pas toujours la fondamentale.'],
    ['Septième de dominante avec la quinte à la basse : quel chiffrage ?', ['4/3', '6/5', '4/2', '7'], 'V7 : 7 (fondamental), 6/5 (tierce à la basse), 4/3 (quinte), 4/2 (septième).'],
    ['Comment trouver la fondamentale d’un accord renversé ?', ['ranger ses notes en tierces superposées', 'prendre la note de la basse', 'prendre la note la plus aiguë', 'prendre la note la plus longue'], 'Une fois rangé en tierces, la note du bas est la fondamentale.'],
  ],
  'n1-th-fonctions': [
    ['Quelle est la fonction de l’accord ii ?', ['sous-dominante', 'tonique', 'dominante', 'aucune'], 'SD : IV, ii et la sixte napolitaine.'],
    ['Quel est le mouvement de base de la musique tonale ?', ['T – SD – D – T', 'T – D – SD – T', 'D – T – SD – D', 'SD – T – D – SD'], 'Repos, éloignement, tension, retour.'],
    ['Dans V7, que fait la septième ?', ['elle descend', 'elle monte', 'elle reste en place', 'elle saute à l’octave'], 'La sensible monte, la septième descend.'],
    ['Quelle est la fonction du 6/4 de cadence (i6/4) ?', ['dominante : il prépare V', 'tonique', 'sous-dominante', 'aucune : c’est un passage'], 'Il a les notes de la tonique mais la basse de la dominante : une dominante déguisée.'],
    ['Quels accords ont une fonction de dominante ?', ['V, V7 et vii°', 'IV et ii', 'I, vi et III', 'N6 et IV'], 'T : I (vi, III) ; SD : IV, ii, N6 ; D : V, V7, vii°.'],
  ],
  'n1-th-cadences': [
    ['V – I, les deux accords à l’état fondamental :', ['cadence parfaite', 'demi-cadence', 'cadence plagale', 'cadence rompue'], 'Avec un accord renversé, la cadence V – I est dite imparfaite.'],
    ['Une phrase qui s’arrête sur V :', ['demi-cadence', 'cadence parfaite', 'cadence rompue', 'cadence plagale'], 'Une suspension : la phrase appelle une suite.'],
    ['V – vi :', ['cadence rompue', 'cadence plagale', 'demi-cadence', 'cadence parfaite'], 'On attend I, on entend vi : la surprise.'],
    ['IV – I :', ['cadence plagale', 'cadence rompue', 'demi-cadence', 'cadence parfaite'], 'La cadence de l’« amen ».'],
  ],
  'n1-th-etrangeres': [
    ['Où se place une appoggiature ?', ['sur le temps, puis elle se résout', 'toujours entre deux temps', 'à la basse, tenue', 'après la note de l’accord'], 'Plus d’appui sur l’appoggiature, une résolution plus douce.'],
    ['Comment jouer une broderie ?', ['plus légère que la note principale qu’elle orne', 'accentuée', 'plus longue que la note principale', 'détachée'], 'Seule la note principale compte.'],
    ['Qu’est-ce qu’un retard ?', ['une note de l’accord précédent, tenue, qui se résout ensuite', 'une note jouée en retard', 'une note répétée', 'une note de passage descendante'], 'Laisse entendre la dissonance tenue, puis résous en douceur.'],
    ['Qu’est-ce qu’une pédale (harmonique) ?', ['une note tenue, souvent à la basse, sous des accords qui changent', 'la pédale forte du piano', 'une note répétée à l’aigu', 'une cadence'], 'La basse tenue porte tout : ne la laisse pas s’éteindre trop tôt.'],
  ],
  'n1-th-synthese': [
    ['Où se trouve le sommet de l’op. 55 n° 1 ?', ['dans le Più mosso (mesures 61 à 72)', 'au début (mesures 1 à 8)', 'dans la coda', 'au retour du thème (mesures 73 à 76)'], 'Le thème reste intime à chacun de ses retours : l’énergie se garde pour le Più mosso.'],
    ['Sur quel accord s’arrête le Più mosso, mesure 72 ?', ['do 7, avec un point d’orgue', 'fa mineur', 'la♭ majeur', 'si♭ mineur'], 'La dominante de fa, suspendue : le thème peut revenir (mesure 73).'],
    ['Comment finit l’op. 55 n° 1 ?', ['en fa majeur : tierce picarde dans la coda', 'sur une demi-cadence', 'en la♭ majeur', 'par le retour complet de la section A'], 'La coda (mesures 77 à 101) passe de fa mineur à fa majeur, sur une pédale de tonique.'],
  ],
  'n2-th1': [
    ['Comment est construit l’accord de septième de dominante ?', ['accord majeur + septième mineure', 'accord majeur + septième majeure', 'accord mineur + septième mineure', 'accord diminué + septième diminuée'], 'Une seule par tonalité : V7 (en mineur, avec la sensible).'],
    ['Quelle est la cadence la plus courante en majeur ?', ['ii7 – V7 – I', 'IV – vi – I', 'iii – vi – V', 'I – vii – iii'], 'En mineur : iiø7 – V7 – i.'],
    ['Comment est construit un accord demi-diminué (ø7) ?', ['triade diminuée + septième mineure', 'triade diminuée + septième diminuée', 'triade mineure + septième majeure', 'triade majeure + septième mineure'], 'Regarde la septième : mineure (demi-diminué) ou diminuée (diminué).'],
    ['La septième diminuée divise l’octave en…', ['tierces mineures', 'tierces majeures', 'quartes', 'tons entiers'], 'D’où trois accords de septième diminuée seulement.'],
    ['En fa majeur, sol – si♭ – ré – fa est…', ['sol m7 (ii7)', 'sol 7 (V7/V)', 'si♭ maj7', 'ré m7'], 'Avec l’armure, le si est bémol : un accord mineur avec septième mineure, sur le 2e degré.'],
  ],
  'n2-th-voix': [
    ['Dans V7 – I, que fait la sensible ?', ['elle monte vers la tonique', 'elle descend', 'elle reste en place', 'elle saute d’une quinte'], 'Sensible ↑, septième ↓ : sinon la conclusion perd sa force.'],
    ['Quels mouvements éviter entre deux voix ?', ['les quintes et octaves parallèles', 'les tierces parallèles', 'les sixtes parallèles', 'les mouvements contraires'], 'Elles naissent quand on déplace tout l’accord en bloc (sauf chez Debussy, par choix de couleur).'],
    ['Quelle note ne double-t-on jamais ?', ['la sensible', 'la fondamentale', 'la quinte', 'la tonique'], 'Doubler la fondamentale, jamais la sensible.'],
    ['Qu’est-ce qu’une bonne conduite des voix ?', ['garder les notes communes, faire des mouvements courts', 'déplacer l’accord en bloc', 'sauter le plus possible', 'toujours doubler la tierce'], 'Un enchaînement d’accords, ce sont plusieurs mélodies simultanées.'],
  ],
  'n2-th2': [
    ['Quelle est la dominante de ré (V/ré) ?', ['la (ou la 7)', 'sol', 'ré 7', 'mi'], 'La dominante se bâtit une quinte au-dessus de l’accord visé, pas au-dessous.'],
    ['L’altération d’une dominante secondaire est…', ['la sensible de l’accord visé', 'sa fondamentale', 'sa septième', 'une note de passage'], 'Ex. : do♯ dans la 7 → ré.'],
    ['Une altération passagère, sans cadence dans le nouveau ton, c’est…', ['une tonicisation', 'une modulation', 'un changement de mode', 'une enharmonie'], 'La tonalité ne change pas : l’accord visé est mis en valeur un instant.'],
    ['Ré majeur et ré mineur ont…', ['la même dominante (la 7)', 'des dominantes différentes', 'pas de dominante commune possible', 'la même médiante'], 'La dominante ne dépend pas du mode de l’accord visé.'],
  ],
  'n2-th3': [
    ['Qu’est-ce qui confirme une modulation ?', ['une cadence dans la nouvelle tonalité', 'la première altération', 'un changement de nuance', 'un silence'], 'Sans cadence, ce n’est qu’une tonicisation.'],
    ['Fa majeur et ré mineur sont…', ['relatifs (même armure)', 'homonymes (même tonique)', 'voisins par la dominante', 'sans lien'], 'Relatifs : même armure. Homonymes : même tonique.'],
    ['Fa majeur et fa mineur sont…', ['homonymes (même tonique)', 'relatifs', 'enharmoniques', 'voisins par la sous-dominante'], 'Même tonique, même dominante, armures différentes.'],
    ['Quels sont les tons voisins de do majeur ?', ['la mineur, sol majeur, mi mineur, fa majeur, ré mineur', 'do mineur, mi♭ majeur, la♭ majeur', 'ré majeur et si mineur', 'fa♯ majeur et ré♯ mineur'], 'Le relatif, la dominante, la sous-dominante et leurs relatifs : une altération d’écart au plus.'],
    ['Où se trouve l’accord pivot d’une modulation ?', ['juste avant la première note étrangère à l’ancienne tonalité', 'après la cadence', 'à la fin de la pièce', 'toujours sur un premier temps'], 'C’est un accord commun aux deux tonalités.'],
  ],
  'n2-th4': [
    ['Qu’est-ce qu’une marche harmonique ?', ['un modèle repris à d’autres hauteurs', 'une simple répétition à la même hauteur', 'une gamme à la basse', 'une cadence répétée'], 'Modèle + reprises, souvent par quintes descendantes.'],
    ['Dans une marche tonale, les intervalles…', ['s’adaptent à la gamme (seconde majeure ici, mineure là)', 'sont reproduits exactement', 'sont toujours des quintes', 'changent de sens à chaque reprise'], 'Seule une marche modulante reproduit exactement les intervalles.'],
    ['Comment sort-on d’une marche ?', ['par une cadence', 'par un silence', 'en répétant le modèle', 'par un changement de mesure'], 'La cadence arrête le mouvement.'],
    ['Dans une marche par quintes descendantes…', ['chaque accord prépare le suivant comme une dominante', 'les accords montent par quintes', 'la basse reste fixe', 'il n’y a pas de dominante'], 'C’est la marche la plus courante, et la plus naturelle à l’oreille.'],
  ],
  'n2-th5': [
    ['Qu’est-ce que la sixte napolitaine (N6) ?', ['un accord majeur sur le 2e degré abaissé, tierce à la basse', 'un accord mineur sur le 6e degré', 'un accord diminué sur le 7e degré', 'un accord majeur sur le 4e degré, quinte à la basse'], 'En fa mineur : sol♭ – si♭ – ré♭, avec si♭ à la basse (op. 55 n° 1, mesure 6).'],
    ['Vers quoi mène la sixte napolitaine ?', ['vers V, souvent par le 6/4 de cadence', 'directement vers I', 'vers IV', 'vers vi'], 'C’est une sous-dominante colorée.'],
    ['Que réunit l’accord de sixte augmentée ?', ['le 6e degré abaissé (basse) et le 4e degré haussé', 'le 2e degré abaissé et le 7e degré', 'le 5e degré et la sensible', 'le 3e degré haussé et le 6e degré'], 'Les deux notes s’écartent vers l’octave de la dominante.'],
    ['La sixte augmentée allemande sonne comme…', ['une septième de dominante', 'un accord parfait mineur', 'une septième diminuée', 'un accord augmenté'], 'Seule sa résolution la distingue (Chopin écrit do♭ dans l’op. 55).'],
  ],
  'n2-th-debussy': [
    ['Dans quelle tonalité est Clair de lune ?', ['ré♭ majeur', 'do♯ mineur', 'la♭ majeur', 'fa majeur'], 'La pièce reste tonale ; les accords sont choisis pour leur couleur.'],
    ['Les accords parallèles chez Debussy, c’est…', ['un bloc qui glisse en entier : un choix de couleur', 'une faute de conduite des voix', 'une marche harmonique', 'une cadence'], 'À jouer comme un seul timbre, fondu avec la pédale.'],
    ['Les septièmes et neuvièmes, chez Debussy…', ['n’ont pas de résolution obligée', 'se résolvent toujours vers le bas', 'sont évitées', 'n’apparaissent qu’aux cadences'], 'Beaucoup de phrases finissent par un glissement, pas par V – I.'],
    ['Le passage en do♯ mineur de Clair de lune, c’est…', ['ré♭ mineur écrit en dièses : le mode mineur emprunté', 'la tonalité de la dominante', 'la relative mineure', 'une tonalité éloignée sans lien'], 'Do♯ mineur = ré♭ mineur, l’homonyme de ré♭ majeur.'],
  ],
  'n2-th6': [
    ['Qu’est-ce qui caractérise la forme ternaire (ABA) ?', ['un contraste, puis un retour', 'un refrain entre des couplets', 'exposition, développement, réexposition', 'des variations sur un thème'], 'C’est la forme des nocturnes.'],
    ['Qu’est-ce qu’un rondo ?', ['un refrain qui revient entre des couplets', 'deux thèmes dans deux tonalités', 'une seule section répétée', 'une fugue'], 'Comme la Valse B. 150 : A – B – A′ – C – A″.'],
    ['Quelles sont les trois parties d’une forme sonate ?', ['exposition, développement, réexposition', 'A, B, A', 'refrain et couplets', 'thème et variations'], 'L’exposition présente deux thèmes dans deux tonalités.'],
    ['Comment repère-t-on les limites des sections ?', ['aux cadences et aux changements de tonalité, de tempo, de texture', 'à la mise en page de la partition', 'aux numéros de mesure', 'aux nuances seules'], 'Découpe d’après la musique, pas d’après la page.'],
  ],
};

/** Séries d'exercices des leçons utilisables en révision (sans piano ni oreille). */
export const QUIZ_KINDS = new Set(['keysig', 'keydegree', 'intervalsight', 'chordsight', 'measurefill', 'keyname', 'notes']);
