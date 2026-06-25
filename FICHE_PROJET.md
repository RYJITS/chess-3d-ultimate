# Chess 3D Ultimate

## Liens vers l'application
- Lien public: https://chess.c2rdesign.com/
- GitHub: https://github.com/RYJITS/chess-3d-ultimate

## A quoi sert le projet
Chess 3D Ultimate est un jeu d'echecs 3D jouable dans le navigateur. Il propose un plateau interactif, des pieces procedurales, plusieurs themes visuels et une IA adverse.

## Fonctionnement de l'application ou du projet
La partie est geree par chess.js: selection d'une piece, affichage des coups valides, execution du coup, mise a jour du FEN et tour de l'IA noire. La scene Three.js reconstruit le plateau, les pieces, les effets de selection et les animations. L'IA peut jouer en local avec evaluation/minimax ou utiliser Gemini, avec validation du coup repondu et fallback si la reponse n'est pas jouable.

## Comment le projet a ete construit
Le projet a ete concu en separant la logique d'echecs de la scene 3D. Les regles restent fiables grace a chess.js, tandis que Three.js gere le rendu, les themes, les effets et l'interaction souris/raycast.

## Fonctions disponibles dans l'application
- Jouer une partie d'echecs 3D
- Selectionner une piece et voir les coups legaux
- Changer de theme visuel
- Jouer contre une IA locale
- Tester une IA Gemini
- Regler la difficulte
- Reinitialiser la partie
- Voir captures, animations et effets de selection

## Outils, IA et moteurs en arriere-plan
- Moteur de regles chess.js
- IA locale random/evaluation/minimax
- Gemini comme adversaire optionnel
- Evaluation de position
- Validation des coups Gemini
- Fallback si coup invalide
- Raycast de selection
- Plateau et pieces proceduraux
- Themes classic/disney/LEGO

## Automatisations integrees
- Generation procedurale du plateau et des pieces
- Detection des cases par raycast
- Affichage automatique des coups legaux
- Execution du tour IA apres le joueur
- IA locale random/evaluation/minimax selon difficulte
- Validation et fallback des coups Gemini
- Effets de capture et environnement anime
- Resize automatique de la scene

## Captures d'ecran
- Aucune capture validee pour cette fiche.

## Mises a jour
- Fiche actualisee depuis le registre orchestrateur et le catalogue projet.
- Derniere mise a jour registre connue: 2026-06-25T00:55:43.971Z.

## Derniere mise a jour
2026-06-25T00:55:43.975Z

> Fichier genere par l'orchestrateur pour le hub Site Ma Methode.
