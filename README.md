# Parcours piano

Application web installable (PWA) pour apprendre le piano classique sur tablette, avec un piano numérique relié en MIDI (Kawai ES110 en Bluetooth MIDI ; un piano avec prise USB TO HOST se branche aussi par câble USB-C ↔ USB-B).

- **Fil rouge** : six niveaux, une pièce phare par niveau. Niveaux 1 et 2 rédigés : Nocturne op. 55 n° 1, puis Nocturne op. 15 n° 1 et Clair de lune.
- **Six modules** : technique, interprétation, théorie (cours complets, chaque chapitre ancré sur un passage de la pièce, avec des écoutes comparées), oreille (de zéro, avec chant au micro, tracé de la voix et conseils), lecture à vue, improvisation (méthode guidée : motif, question et réponse, notes de l’accord, main gauche en quatre formules, une mélodie connue harmonisée et variée ; styles romance, nocturne, élégie, prélude ; cadences, règle de l’octave, schémas, formes ; chaque leçon en exercices progressifs vérifiés au piano, validés quand ils sont réussis deux jours différents ; à deux mains, l’accompagnateur s’effaçant par étapes et chaque main vérifiée ; notes d’appui en or affichées au premier exercice d’une grille, puis jouées de mémoire).
- **Panneau d’analyse** sous chaque extrait de pièce : accords, chiffrages, fonctions, remarques ; les accords se jouent en blocs.
- **Outils** : partitions jouables (mode attente, mode en rythme), analyse d’une prise contre la partition (justesse, rythme, rubato, équilibre, pédale), analyseurs de jeu MIDI, lecture à vue et lecture de notes chronométrée, rythme, exercices d’indépendance des mains (retour main par main), exercices d’oreille (dont chant avec détection de hauteur au micro) et de théorie, accompagnateur d’improvisation, atelier de composition (huit mesures notées et vérifiées, export MIDI), métronome.
- **Nouvelle séance** : on coche ce qu’on travaille (pièce phare, technique, improvisation, lecture à vue, oreille, autres pièces) et une durée ; l’appli propose l’étape suivante de chaque case, répartit le temps et coche d’avance ce qui est délaissé depuis trop longtemps (fréquences cibles). Bilan des 7 derniers jours.
- **Carte de la pièce** : chaque section avec ce qui s’y passe, ce que ça change au jeu, les leçons et exercices qu’elle demande, la façon de la travailler et son critère « au tempo » ; état de chaque section, section du jour, objectif de date, exercices sur le plan (points de départ, situer un extrait, comparer un retour) et filage enregistré.
- **Grille de validation** pour chaque niveau.

La progression est enregistrée localement dans le navigateur (Réglages → Exporter pour la sauvegarder).

## Installer sur la tablette

1. Ouvrir l’adresse du site dans Chrome.
2. Menu ⋮ → « Ajouter à l’écran d’accueil » (ou « Installer l’application »).
3. Relier le piano (Kawai ES110 : appairer d’abord le piano en Bluetooth MIDI, par exemple avec l’appli « MIDI BLE Connect »), puis toucher « Connecter le piano » et autoriser l’accès MIDI.

Une fois installée, l’application fonctionne hors connexion.

## Structure

Version « à plat » : tous les fichiers sont à la racine du dépôt, pour pouvoir être déposés en une fois par le site de GitHub.

- `index.html`, `app.css`, `app.js` et les autres modules `.js` : l’application.
- `content-*.js`, `n1-*.js`, `n2-*.js` : le contenu pédagogique.
- `piano-*.mp3` : échantillons de piano. Polices `.woff2`, `abcjs-basic-min.js` : rendu.
- `sw.js` : cache hors connexion.

## Crédits et licences

- Extraits de Chopin d’après les éditions LilyPond de Knute Snortum (CC BY-SA 4.0) ; Debussy d’après le Mutopia Project (domaine public).
- Échantillons : Salamander Grand Piano, Alexander Holm (CC BY 3.0).
- Rendu des partitions : abcjs (licence MIT). Polices Inter et Literata (SIL Open Font License).
- Les liens vers l’Online Academy d’Informance et vers des enregistrements renvoient à des contenus externes, non reproduits ici.
