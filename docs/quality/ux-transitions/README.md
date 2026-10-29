# Transitions continues — correctif du chantier initial

Le [diagnostic avant modification](diagnostic.md) explique le défaut de `37ea6d7` :
React supprimait le contenu précédent ; seules les entrées étaient animées.
Les anciennes [mesures](mesures.md) attestent cette première implémentation,
pas la continuité visuelle désormais requise.

## Rendu corrigé

| Surface | Raccord | Durée | Déplacement |
| --- | --- | --- | --- |
| Rubriques | Ancien contenu sortant + nouveau contenu entrant | 320 ms | ±12 px verticalement |
| Questions | Fondu croisé, sens inverse au retour | 320 ms | ±20 px horizontalement |
| Ouverture des dialogues | Fond progressif, fondu et translation | 240 ms | 12 px verticalement |
| Fermeture acceptée | Fondu et mouvement inverse, fond progressif | 220 ms | 12 px verticalement |

`TransitionSurface` capture le DOM avant sa mutation React (`getSnapshotBeforeUpdate`).
La copie sortante est uniquement visuelle : inerte, masquée aux technologies d’assistance,
sans identifiants dupliqués, événements React, effets, requêtes ou sauvegardes.
Les canvas et positions de scroll sont conservés pour éviter les scintillements.
Le nouveau contenu est immédiatement interactif ; aucune attente artificielle n’est ajoutée.

Le conteneur vivant reste monté pendant le raccord. Des navigations rapprochées remplacent
sa destination sans redémarrer l’animation ni empiler les copies : la dernière intention gagne
pendant la même fenêtre de 320 ms. Une fois le raccord terminé, la copie est supprimée.
Les mises à jour de données, sélections, sauvegardes et refus ne déclenchent pas de mouvement.
Le viewport découpe horizontalement la copie lors des redimensionnements mobile.
Les pages gardent leurs états existants de chargement et leurs titres ; aucun délai réseau
n’est introduit pour les animations et aucun montage React précédent n’est prolongé.

La sidebar et le header restent hors des couches animées. En passation, seuls le numéro,
le texte, la notation et le statut de question bougent ; métadonnées, titre général,
action de sauvegarde, cadre et pied restent fixes. L’action de sauvegarde reste ancrée dans la zone de corps même en faible hauteur.
La copie de dimensionnement reproduit la structure des métadonnées et de la question
pour réserver aussi les marges exactes des repères. Le dimensionnement intrinsèque MEP-013/044, les notes explicites 0–10 et toutes les gardes métier restent inchangés.

## Dialogue natif et accessibilité

`useModalFocus` conserve `showModal()` / `close()`, Échap, le confinement et le retour du focus.
Une fermeture réellement acceptée peut laisser pendant 220 ms une copie de peinture
non modale dans un `div` inerte. Le vrai dialogue est fermé et le focus est rendu immédiatement.
Cette copie ne bloque ni le déclencheur ni une modale suivante. StrictMode ne laisse pas
une fausse sortie avant le premier affichage. Un refus de fermeture ne démonte rien,
ne déplace pas le focus et ne produit aucune animation de sortie.

Les courbes n’ont ni rebond ni dépassement. Aucun zoom ni dimension n’est animé.
`prefers-reduced-motion: reduce` supprime mouvements, fondus et copies ; les changements
restent immédiats, y compris lorsque la préférence change pendant une transition.
Aucune dépendance, API, donnée, permission, règle métier ou infrastructure de recette ajoutée.

## Recette et preuves

Les tests existants `transitions`, `transition-dialogs` et `transition-zoom` sont renforcés :
préférence effective, ancienne et nouvelle opacité simultanées, textes distincts,
géométrie fixe à chaque frame, fermeture réelle, clavier, refus et navigation rapide.
Le sampler suit les frames effectivement rendues, sans ralentissement ni horloge simulée.
La matrice couvre desktop/mobile, deux thèmes et dix palettes ; le zoom natif reste à 200 %.
Le test React de passation exige aussi l’ancien rendu inerte et un seul curseur accessible.
Les sélecteurs fonctionnels ciblent les contrôles accessibles ou la question vivante,
sans confondre les copies visuelles avec le formulaire courant. Les mesures statiques
de notation attendent seulement la fin naturelle du mouvement ; le sampler de continuité
continue de mesurer pendant celui-ci, à chaque frame.

Les preuves finales et leur lecture visuelle sont décrites dans [la recette du correctif](recette-correctif.md).
La vidéo historique `zoom-200.webm` ne vaut pas preuve du correctif.

## Revue documentaire et livraison

README annoncé avant modification applicative. README, règles agents, charte, DoD,
stratégie, fondamentaux, contrat API et contrats de layout/passation/dialogues relus.
Les trois contrats frontend décrivent le nouveau raccord ; backend, migrations et OpenAPI
restent inchangés. Git, workflows CI et scripts de publication ne sont pas modifiés.
Au démarrage, seul ce worktree de chantier est présent à côté du checkout principal.
Publication via `npm run publish`, sans PR, CI du SHA exact puis main local synchronisé.
