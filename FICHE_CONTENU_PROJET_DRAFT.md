# Brouillon contenu fiche - Chess 3D Ultimate

## Resume
Jeu d'échecs 3D interactif dans le navigateur avec gestion des règles via chess.js, thèmes visuels dynamiques et options de jeu contre une IA locale ou externe.

## A quoi sert le projet
Fournir une expérience visuelle et interactive de jeu d'échecs en 3D, accessible directement depuis un navigateur, avec des fonctionnalités avancées comme le jeu contre une IA locale ou un adversaire externe (Gemini), des thèmes visuels variés et une gestion dynamique des coups.

## Fonctionnement
L'application repose sur une architecture modulaire où la logique du jeu (gestion des coups, vérification des règles) est séparée de la scène 3D (affichage, interactions, animations). Lorsque l'utilisateur sélectionne une pièce, un raycast est utilisé pour détecter la case cliquée. Si le coup est valide selon chess.js, la pièce est déplacée et la scène est mise à jour. Après le tour du joueur, l'IA locale ou externe génère un coup, qui est validé avant d'être exécuté. Les thèmes visuels sont appliqués dynamiquement, et les effets (comme les messages de capture) sont affichés en overlay. La caméra est contrôlable via la souris pour une exploration libre de la scène.

## Construction
Le projet a été conçu avec une séparation claire des responsabilités : chess.js gère la logique des échecs, tandis que Three.js s'occupe du rendu 3D et des interactions. L'architecture suit une approche modulaire avec des composants React pour l'interface utilisateur (HUD, paramètres) et une scène Three.js encapsulée dans un composant dédié. Les choix de design incluent : l'utilisation de pièces procédurales pour une génération dynamique, des thèmes visuels variés pour personnaliser l'expérience, et une gestion centralisée des paramètres de jeu. L'application est responsive et optimisée pour une utilisation fluide sur desktop et mobile. La sécurité a été prise en compte en évitant l'exposition de données sensibles (comme les clés API) dans le code public.

## Installation
[object Object]

## Utilisation
Après installation, lancer l'application avec `npm run dev`. Une fois le serveur de développement démarré, ouvrir l'URL fournie (généralement `http://localhost:5173`) dans un navigateur. Utiliser la souris pour : sélectionner une pièce (clic gauche), déplacer une pièce (clic gauche sur la case cible), et contrôler la caméra (clic droit pour tourner, molette pour zoomer). Les paramètres de jeu (thème, difficulté, type d'IA) sont accessibles via la barre supérieure. Pour jouer contre une IA externe (Gemini), entrer une clé API valide dans le champ dédié. La partie peut être réinitialisée à tout moment avec le bouton 'Nouvelle Partie'.

## Fonctions
- Affichage 3D interactif du plateau et des pièces d'échecs
- Gestion des règles et des coups via chess.js
- Jeu contre une IA locale (niveaux facile, moyen, difficile)
- Option d'utilisation d'une IA externe (Gemini) comme adversaire
- Changement dynamique de thèmes visuels (Classic, Disney, LEGO)
- Affichage des effets visuels (sélection, captures, animations)
- Réinitialisation instantanée de la partie
- Contrôle de la caméra pour explorer la scène 3D
- Interface responsive adaptée aux écrans desktop et mobile
