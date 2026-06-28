# Chess 3D Ultimate

## Rapport complet

Ce depot public presente le concept, les fonctions, les choix de conception, les outils utilises, les commandes locales et les captures d'ecran de l'application. Il est genere par l'orchestrateur uniquement apres validation de publication publique.

## Concept

Jeu d'échecs 3D interactif dans le navigateur avec gestion des règles via chess.js, thèmes visuels dynamiques et options de jeu contre une IA locale ou externe.

Fournir une expérience visuelle et interactive de jeu d'échecs en 3D, accessible directement depuis un navigateur, avec des fonctionnalités avancées comme le jeu contre une IA locale ou un adversaire externe (Gemini), des thèmes visuels variés et une gestion dynamique des coups.

Public vise: Développeurs, joueurs d'échecs, passionnés de 3D et de WebGL, ainsi que toute personne souhaitant expérimenter une application interactive en temps réel dans un navigateur.


## Fonctionnement de l'application

L'application repose sur une architecture modulaire où la logique du jeu (gestion des coups, vérification des règles) est séparée de la scène 3D (affichage, interactions, animations). Lorsque l'utilisateur sélectionne une pièce, un raycast est utilisé pour détecter la case cliquée. Si le coup est valide selon chess.js, la pièce est déplacée et la scène est mise à jour. Après le tour du joueur, l'IA locale ou externe génère un coup, qui est validé avant d'être exécuté. Les thèmes visuels sont appliqués dynamiquement, et les effets (comme les messages de capture) sont affichés en overlay. La caméra est contrôlable via la souris pour une exploration libre de la scène.

## Fonctions de l'application

- Affichage 3D interactif du plateau et des pièces d'échecs
- Gestion des règles et des coups via chess.js
- Jeu contre une IA locale (niveaux facile, moyen, difficile)
- Option d'utilisation d'une IA externe (Gemini) comme adversaire
- Changement dynamique de thèmes visuels (Classic, Disney, LEGO)
- Affichage des effets visuels (sélection, captures, animations)
- Réinitialisation instantanée de la partie
- Contrôle de la caméra pour explorer la scène 3D
- Génération procédurale du plateau et des pièces d'échecs
- Détection des coups légaux via raycasting
- Affichage dynamique des thèmes visuels (Classic, Disney, LEGO)
- Gestion des animations (captures, effets de sélection)
- Jeu contre une IA locale avec trois niveaux de difficulté
- Option d'utilisation d'une IA externe (Gemini) avec validation des coups
- Affichage du statut de la partie (tour, échec, mat, match nul)
- Interface responsive adaptée aux écrans desktop et mobile

## Actualisations et evolution

- Version 1.9.6 : Correction de bugs mineurs et optimisation des performances de rendu
- Ajout du thème LEGO par défaut pour une expérience visuelle plus ludique
- Amélioration de la validation des coups en mode IA externe (Gemini)
- Optimisation de la génération procédurale des pièces et du plateau
- Mise à jour des dépendances pour garantir la compatibilité avec React 18 et Three.js 0.160.0
- Statut courant: PUBLIC_READY.
- Securite: OK_PUBLIC.
- Fonctionnement: FONCTIONNEL.
- Correction de bugs mineurs dans la validation des coups en mode IA externe
- Optimisation de la génération procédurale des pièces pour réduire la latence
- Amélioration de la gestion des thèmes visuels avec préchargement des assets
- Ajout d'un fallback pour les coups invalides en mode IA externe (Gemini)
- Optimisation des performances de rendu pour les scènes complexes

## Comment le projet a ete reflechi et construit

Le projet a été conçu avec une séparation claire des responsabilités : chess.js gère la logique des échecs, tandis que Three.js s'occupe du rendu 3D et des interactions. L'architecture suit une approche modulaire avec des composants React pour l'interface utilisateur (HUD, paramètres) et une scène Three.js encapsulée dans un composant dédié. Les choix de design incluent : l'utilisation de pièces procédurales pour une génération dynamique, des thèmes visuels variés pour personnaliser l'expérience, et une gestion centralisée des paramètres de jeu. L'application est responsive et optimisée pour une utilisation fluide sur desktop et mobile. La sécurité a été prise en compte en évitant l'exposition de données sensibles (comme les clés API) dans le code public.

Cette section doit expliquer les choix qui ont guide le projet: besoin de depart, structure retenue, modules principaux, compromis techniques, interface ou logique metier, et raisons des outils utilises.

### Outils, IA et moteurs utilises

- Vite : Serveur de développement et outil de build
- React : Bibliothèque pour la construction de l'interface utilisateur
- Three.js : Moteur 3D pour le rendu WebGL
- chess.js : Bibliothèque pour la gestion des règles et de la logique des échecs
- OrbitControls : Contrôle de la caméra pour la navigation 3D
- Raycaster : Détection des interactions souris avec la scène 3D
- Tailwind CSS : Framework pour le style et la mise en page de l'interface
- Architecture modulaire (séparation logique 3D / règles du jeu)
- Génération procédurale des pièces et du plateau
- Gestion d'état centralisée avec React (useState, useEffect)
- Rendu 3D temps réel avec Three.js et WebGL
- Validation des coups via chess.js
- Communication avec une IA externe (Gemini) via API
- Optimisation des performances (lazy loading, gestion des animations)
- Responsive design pour une expérience multi-appareils
- Gestion des thèmes visuels dynamiques

### Options techniques detectees

- Type de projet: node
- Gestionnaire: npm
- Nom package: chess-3d-ultimate
- Version: 1.9.6
- Lien public: https://chess.c2rdesign.com/
- Statut securite: OK_PUBLIC

### Stack et dependances principales

- Vite/Dev server
- React
- Three.js/WebGL
- Node.js
- Architecture modulaire (séparation logique 3D / règles du jeu)
- Génération procédurale des pièces et du plateau
- Gestion d'état centralisée avec React (useState, useEffect)
- Rendu 3D temps réel avec Three.js et WebGL
- Validation des coups via chess.js
- Communication avec une IA externe (Gemini) via API
- Optimisation des performances (lazy loading, gestion des animations)
- Responsive design pour une expérience multi-appareils
- Gestion des thèmes visuels dynamiques

### Scripts disponibles

- build: tsc && vite build
- dev: vite
- preview: vite preview

### Dependances applicatives

- @google/genai *
- chess.js ^1.0.0
- react ^18.2.0
- react-dom ^18.2.0
- three ^0.160.0

### Dependances de developpement

- @types/react ^18.2.43
- @types/react-dom ^18.2.17
- @types/three ^0.160.0
- @vitejs/plugin-react ^4.2.1
- typescript ^5.2.2
- vite ^5.0.8

## Automatisations et comportements internes

- Build automatique via Vite lors de l'exécution de `npm run build`
- Prévisualisation de la version construite avec `npm run preview`
- Génération des fichiers statiques optimisés pour la production
- Validation des coups en temps réel avec feedback visuel
- Changement dynamique des paramètres de jeu sans rechargement
- Affichage automatique des effets visuels (captures, animations)

## Installation locale

[object Object]

### Pre-requis
- Node.js installe localement.
- Gestionnaire detecte: npm.

### Commandes
```powershell
npm install
npm run build
npm run dev
```

### Scripts utiles
- build: tsc && vite build
- dev: vite
- preview: vite preview

## Lancement

```powershell
npm run dev
npm run build
```

## Utilisation

Après installation, lancer l'application avec `npm run dev`. Une fois le serveur de développement démarré, ouvrir l'URL fournie (généralement `http://localhost:5173`) dans un navigateur. Utiliser la souris pour : sélectionner une pièce (clic gauche), déplacer une pièce (clic gauche sur la case cible), et contrôler la caméra (clic droit pour tourner, molette pour zoomer). Les paramètres de jeu (thème, difficulté, type d'IA) sont accessibles via la barre supérieure. Pour jouer contre une IA externe (Gemini), entrer une clé API valide dans le champ dédié. La partie peut être réinitialisée à tout moment avec le bouton 'Nouvelle Partie'.

## Captures d'ecran

![Capture desktop](docs/github-captures/20-chess-3d-ultimate-2026-06-28_03-38-35-desktop.png)

![Capture mobile](docs/github-captures/20-chess-3d-ultimate-2026-06-28_03-38-35-mobile.png)

## Variables d'environnement

Aucune variable d'environnement n'a ete detectee par l'orchestrateur.

## Securite

Ne jamais publier `.env`, tokens, sessions, logs sensibles, cles privees ou donnees personnelles.
