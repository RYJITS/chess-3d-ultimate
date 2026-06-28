# Chess 3D Ultimate

## Liens vers l'application
- Lien public: [https://chess.c2rdesign.com/](https://chess.c2rdesign.com/)
- GitHub: [https://github.com/RYJITS/chess-3d-ultimate](https://github.com/RYJITS/chess-3d-ultimate)

## A quoi sert le projet
Chess 3D Ultimate est une application web interactive permettant de jouer aux échecs en 3D directement dans un navigateur. Le projet combine une logique de jeu robuste (via chess.js) avec un rendu 3D immersif (via Three.js) pour offrir une expérience visuelle et tactile unique. Les utilisateurs peuvent affronter une IA locale paramétrable (niveaux de difficulté) ou une IA externe (Gemini) en fournissant une clé API valide. L'application propose également plusieurs thèmes visuels (Classic, Disney, LEGO) pour personnaliser l'apparence du plateau et des pièces. La caméra est contrôlable via la souris pour une exploration libre de la scène, et les animations (captures, sélections) renforcent l'immersion.

## Fonctionnement de l'application ou du projet
L'application repose sur une architecture modulaire où la logique du jeu (gestion des coups, vérification des règles) est séparée de la scène 3D (affichage, interactions, animations). Lorsque l'utilisateur sélectionne une pièce, un raycast est utilisé pour détecter la case cliquée. Si le coup est valide selon chess.js, la pièce est déplacée et la scène est mise à jour. Après le tour du joueur, l'IA locale ou externe génère un coup, qui est validé avant d'être exécuté. Les thèmes visuels sont appliqués dynamiquement, et les effets (comme les messages de capture) sont affichés en overlay. La caméra est contrôlable via la souris pour une exploration libre de la scène.

## Comment le projet a ete construit
Le projet a été conçu avec une séparation claire des responsabilités : chess.js gère la logique des échecs, tandis que Three.js s'occupe du rendu 3D et des interactions. L'architecture suit une approche modulaire avec des composants React pour l'interface utilisateur (HUD, paramètres) et une scène Three.js encapsulée dans un composant dédié. Les choix de design incluent : l'utilisation de pièces procédurales pour une génération dynamique, des thèmes visuels variés pour personnaliser l'expérience, et une gestion centralisée des paramètres de jeu. L'application est responsive et optimisée pour une utilisation fluide sur desktop et mobile. La sécurité a été prise en compte en évitant l'exposition de données sensibles (comme les clés API) dans le code public.

## Installation et utilisation
### Installation
[object Object]

### Utilisation
Après installation, lancer l'application avec `npm run dev`. Une fois le serveur de développement démarré, ouvrir l'URL fournie (généralement `http://localhost:5173`) dans un navigateur. Utiliser la souris pour : sélectionner une pièce (clic gauche), déplacer une pièce (clic gauche sur la case cible), et contrôler la caméra (clic droit pour tourner, molette pour zoomer). Les paramètres de jeu (thème, difficulté, type d'IA) sont accessibles via la barre supérieure. Pour jouer contre une IA externe (Gemini), entrer une clé API valide dans le champ dédié. La partie peut être réinitialisée à tout moment avec le bouton 'Nouvelle Partie'.

## Fonctions disponibles dans l'application
- Génération procédurale du plateau et des pièces d'échecs
- Détection des coups légaux via raycasting
- Affichage dynamique des thèmes visuels (Classic, Disney, LEGO)
- Gestion des animations (captures, effets de sélection)
- Jeu contre une IA locale avec trois niveaux de difficulté
- Option d'utilisation d'une IA externe (Gemini) avec validation des coups
- Affichage du statut de la partie (tour, échec, mat, match nul)
- Contrôle de la caméra pour explorer la scène 3D
- Réinitialisation instantanée de la partie
- Interface responsive adaptée aux écrans desktop et mobile

## Outils, IA et moteurs en arriere-plan
- Vite : Serveur de développement et outil de build
- React : Bibliothèque pour la construction de l'interface utilisateur
- Three.js : Moteur 3D pour le rendu WebGL
- chess.js : Bibliothèque pour la gestion des règles et de la logique des échecs
- OrbitControls : Contrôle de la caméra pour la navigation 3D
- Raycaster : Détection des interactions souris avec la scène 3D
- Tailwind CSS : Framework pour le style et la mise en page de l'interface

## Automatisations integrees
- Build automatique via Vite lors de l'exécution de `npm run build`
- Prévisualisation de la version construite avec `npm run preview`
- Génération des fichiers statiques optimisés pour la production
- Validation des coups en temps réel avec feedback visuel
- Changement dynamique des paramètres de jeu sans rechargement
- Affichage automatique des effets visuels (captures, animations)

## Captures d'ecran
![Capture 1 - chess-3d-ultimate](docs/captures/20-chess-3d-ultimate-2026-06-27_23-58-17-desktop.png)

![Capture 2 - chess-3d-ultimate](docs/captures/20-chess-3d-ultimate-2026-06-27_23-58-17-mobile.png)

## Mises a jour
- Correction de bugs mineurs dans la validation des coups en mode IA externe
- Optimisation de la génération procédurale des pièces pour réduire la latence
- Amélioration de la gestion des thèmes visuels avec préchargement des assets
- Mise à jour des dépendances pour garantir la compatibilité avec React 18 et Three.js 0.160.0
- Ajout d'un fallback pour les coups invalides en mode IA externe (Gemini)
- Optimisation des performances de rendu pour les scènes complexes
- Version 1.9.6 : Correction de bugs mineurs et optimisation des performances de rendu
- Ajout du thème LEGO par défaut pour une expérience visuelle plus ludique
- Amélioration de la validation des coups en mode IA externe (Gemini)
- Optimisation de la génération procédurale des pièces et du plateau
- Mise à jour des dépendances pour garantir la compatibilité avec React 18 et Three.js 0.160.0

> Fichier genere par l'orchestrateur pour le hub Site Ma Methode.
