# Parcours piano

Application web installable (PWA) pour apprendre le piano classique sur tablette, avec un piano numérique relié en MIDI (Kawai ES110 en Bluetooth MIDI ; un piano avec prise USB TO HOST se branche aussi par câble USB-C ↔ USB-B).

- **Fil rouge** : six niveaux, une pièce phare par niveau. Niveaux 1 et 2 rédigés : Nocturne op. 55 n° 1, puis Nocturne op. 15 n° 1 et Clair de lune.
- **Six modules** : technique, interprétation, théorie (cours complets, chaque chapitre ancré sur un passage de la pièce, avec des écoutes comparées), oreille (« Trouve la note » et les mélodies d’oreille, voir plus bas), lecture à vue, improvisation (méthode guidée : motif, question et réponse, notes de l’accord, main gauche en quatre formules, une mélodie connue harmonisée et variée ; styles romance, nocturne, élégie, prélude ; cadences, règle de l’octave, schémas, formes ; chaque leçon en exercices progressifs vérifiés au piano, validés quand ils sont réussis deux jours différents ; à deux mains, l’accompagnateur s’effaçant par étapes et chaque main vérifiée ; notes d’appui en or affichées au premier exercice d’une grille, puis jouées de mémoire).
- **Panneau d’analyse** sous chaque extrait de pièce : accords, chiffrages, fonctions, remarques ; les accords se jouent en blocs.
- **Outils** : partitions jouables (mode attente, mode en rythme), analyse d’une prise contre la partition (justesse, rythme, rubato, équilibre, pédale), analyseurs de jeu MIDI, lecture à vue et lecture de notes chronométrée, rythme, exercices d’indépendance des mains (retour main par main), exercices d’oreille (dont chant facultatif avec détection de hauteur au micro) et de théorie, accompagnateur d’improvisation, atelier de composition (huit mesures notées et vérifiées, export MIDI), métronome.
- **Nouvelle séance** : on coche ce qu’on travaille (pièce phare, technique, improvisation, lecture à vue, oreille, autres pièces) et une durée ; l’appli propose l’étape suivante de chaque case, répartit le temps et coche d’avance ce qui est délaissé depuis trop longtemps (fréquences cibles). Bilan des 7 derniers jours.
- **Carte de la pièce** : chaque section avec ce qui s’y passe, ce que ça change au jeu, les leçons et exercices qu’elle demande, la façon de la travailler et son critère « au tempo » ; état de chaque section, section du jour, objectif de date, exercices sur le plan (points de départ, situer un extrait, comparer un retour) et filage enregistré.
- **Ton temps de piano** : séances par semaine (2 à 7), durée (10 à 75 min) et minutes loin du piano. La séance conseillée s’y règle : la pièce phare à chaque séance, les autres domaines en rotation selon leur fréquence (rien n’est retiré du parcours) ; séances courtes avec le domaine d’abord et la pièce pour finir ; temps restant de chaque étape dans la barre de séance ; bilan de la semaine face à ce qui est prévu ; objectif de date calculé à ce rythme. **Pause** (DS, concours blanc, vacances) : rien ne compte comme délaissé, l’objectif est décalé d’autant.
- **Loin du piano** : 5 à 15 minutes sans clavier — la pièce de tête (pratique mentale de la section du jour : écouter, lire en entendant, jouer dans sa tête, de mémoire, une note pour le piano), l’oreille (« Trouve la note » sur le clavier de l’écran, avec des écouteurs), le rythme et les notes sur l’écran, la théorie. La séance suivante au piano commence par rejouer de mémoire la section travaillée de tête.
- **Un domaine, une page** : le menu se range en trois groupes (Jouer : tes pièces, technique, interprétation, lecture à vue, improvisation ; Entendre et comprendre : oreille, théorie ; Ton parcours). Chaque page de domaine réunit ce que tu fais maintenant, ses outils et toutes ses leçons, niveau par niveau. Sur téléphone, une barre en bas (Accueil, Pièces, Sans piano, Théorie, Menu).
- **Théorie ludique** : cartes du jour à mémoire espacée, façon Anki (de tête ou avec les choix ; À revoir, Difficile, Bien, Facile), tirées des leçons faites, commencées ou cochées ; défi éclair d’une minute (armures, relatives, intervalles, accords, degrés, quintes) avec records, médailles et défi du jour.
- **L’oreille (V8.4)** : un exercice central, **Trouve la note**. Une tonalité par séance ; une cadence installe la tonique, une note sonne, on la cherche au clavier (piano ou écran), essais comptés sans pénalité, aide après une erreur (plus haut ou plus bas, deux touches possibles, la touche), puis résolution vers la tonique (méthode fonctionnelle de Benbassat). Difficulté qui s’ajuste seule (moteur `earfind-engine.js`) : trois notes au départ (1, 5, 3), les notes sans demi-ton avant fa et si (Kodály), une note de plus à 90 % du premier coup, la dernière retirée sous 60 % ; puis des formules de deux à cinq notes (Gordon). Chant facultatif mais toujours proposé (micro, sans nom de note). **Mélodies d’oreille** : chercher les notes une à une (première note donnée, touches repérées, boucle), puis d’un trait, puis en rythme (Lucy Green). Le parcours en seize étapes et les seize leçons d’oreille sont retirés.
- **Le son (V8.3)** : piano échantillonné refait (trois couches de nuance, accord corrigé, attaques calées, sans la compression MP3 qui coupait tout au-dessus de 8 kHz), réverbération de salle réglable, pédale de Chopin sur les extraits de l’op. 55 n° 1, notes piquées détachées.
- **Lisibilité (V8.2)** : contenu des niveaux 1 et 2 relu pour la clarté et l’exactitude ; signes ♩ ♭ ♯ ♮ 𝄪 𝄫 dessinés par une police dédiée (Noto Music réduite à ces signes, `music-symbols.woff2`, SIL OFL).
- **Grille de validation** pour chaque niveau.

La progression est enregistrée localement dans le navigateur (Réglages → Exporter pour la sauvegarder). Avant chaque mise à jour, l’appli en garde une copie, qu’on peut rétablir depuis les Réglages.

## Installer sur la tablette

1. Ouvrir l’adresse du site dans Chrome.
2. Menu ⋮ → « Ajouter à l’écran d’accueil » (ou « Installer l’application »).
3. Relier le piano (Kawai ES110 : appairer d’abord le piano en Bluetooth MIDI, par exemple avec l’appli « MIDI BLE Connect »), puis toucher « Connecter le piano » et autoriser l’accès MIDI.

Une fois installée, l’application fonctionne hors connexion.

## Structure

Version « à plat » : tous les fichiers sont à la racine du dépôt, pour pouvoir être déposés en une fois par le site de GitHub.

- `index.html`, `app.css`, `app.js` et les autres modules `.js` : l’application.
- `content-*.js`, `n1-*.js`, `n2-*.js` : le contenu pédagogique.
- `piano-p|mf|f-*.ogg` : échantillons de piano (Opus) ; `piano-*.mp3` : ancienne série, en repli. Polices `.woff2`, `abcjs-basic-min.js` : rendu.
- `sw.js` : cache hors connexion.

## Crédits et licences

- Extraits de Chopin d’après les éditions LilyPond de Knute Snortum (CC BY-SA 4.0) ; Debussy d’après le Mutopia Project (domaine public).
- Échantillons : Salamander Grand Piano V3, Alexander Holm (CC BY 3.0) — trois couches de nuance (p, mf, f), accord retouché (Markus Fiedler), Opus mono 56 kbit/s (`piano-p|mf|f-*.ogg`) ; l’ancienne série MP3 (`piano-*.mp3`) sert de repli aux navigateurs qui ne lisent pas l’Opus.
- Rendu des partitions : abcjs (licence MIT). Polices Inter et Literata (SIL Open Font License).
- Les liens vers l’Online Academy d’Informance et vers des enregistrements renvoient à des contenus externes, non reproduits ici.
