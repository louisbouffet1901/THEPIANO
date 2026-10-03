# Parcours piano

Application web installable (PWA) pour apprendre le piano classique sur tablette, avec un piano numérique branché en MIDI (Yamaha P-145, câble USB-C ↔ USB-B).

- **Fil rouge** : six niveaux, une pièce phare par niveau. Niveaux 1 et 2 rédigés : Nocturne op. 55 n° 1, puis Nocturne op. 15 n° 1 et Clair de lune.
- **Six modules** : technique, interprétation, théorie (cours complets, chaque chapitre ancré sur le passage travaillé la même semaine), oreille (de zéro, avec chant au micro), lecture à vue, improvisation (méthode progressive : ostinato et pentatonique, harmonie, style du nocturne, puis cadences, règle de l’octave et schémas galants).
- **Panneau d’analyse** sous chaque extrait de pièce : accords, chiffrages, fonctions, remarques ; les accords se jouent en blocs.
- **Outils** : partitions jouables (mode attente, mode en rythme), analyseurs de jeu MIDI (régularité, legato, pédale, équilibre, voix supérieure, nuances), lecture à vue générée, exercices d’oreille (dont chant avec détection de hauteur au micro) et de théorie, accompagnateur d’improvisation, métronome.
- **Plan hebdomadaire** (environ 1 h 15 par jour) et **grille de validation** pour chaque niveau.

La progression est enregistrée localement dans le navigateur (Réglages → Exporter pour la sauvegarder).

## Installer sur la tablette

1. Ouvrir l’adresse du site dans Chrome.
2. Menu ⋮ → « Ajouter à l’écran d’accueil » (ou « Installer l’application »).
3. Brancher le piano, puis toucher « Connecter le piano » et autoriser l’accès MIDI.

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
