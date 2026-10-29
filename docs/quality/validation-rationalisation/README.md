# Rationalisation des validations — revue du 2026-10-29

Base auditée : `029857a96b730aaf6357c123b429860f56e445a0`.
Travaux et campagnes applicatives du 29 octobre ; revue finale reprise le 30 octobre 2026.
Branche `quality/validation-proportionality`, worktree isolé ; aucune publication autorisée à ce stade.

## Diagnostic vérifiable

- [Escalades, dépendances et invalidations](diagnostic.md).
- [Campagnes UX : observations, coûts et limites](campagnes-ux.md).
- [Plans avant/après et matrice de risque](comparaison.md).
- [Tests, revue documentaire et validation du candidat](validation.md).
- [Observations expurgées des journaux locaux](ux-observations.md).

Le circuit reste `npm run publish` → pré-push bloquant → push direct sur main → CI indépendante du SHA.
La revue demandée par l'utilisateur est préalable à toute publication de ce changement de gouvernance.
Aucune PR, aucun changement du checkout principal, aucun nettoyage d'un autre chantier.

## Corrections retenues

1. Configurations frontend et navigateur explicitement auditées, sans pytest automatique.
   Les changements navigateur imposent neuf contrats Vitest chargeant les vraies configs, leurs shards et diagnostics.
2. Tests de démo sélectionnés comme consommateurs ; compilation démo et véritable scénario conservés.
3. Cinq fichiers de preuve UX inventoriés, réguliers, non exécutables et non distribués :
   gate documentaire frais, signatures de conteneur et liens ; aucune invalidation applicative.
4. Seul le `debug.log` régulier, non exécutable, directement à la racine d'un navigateur installé
   est exclu de ses octets. Binaires, bibliothèques, ressources, autres journaux et liens restent contrôlés.
5. Cartographie des composants par chemin exact : un homonyme dans un autre dossier reste conservateur.
6. Identifiants d'appel/session de l'agent exclus de l'environnement applicatif ;
   `CODEX_THREAD_ID` consommé par Vite/std-env, capacités, `PATH` et variables inconnues restent contrôlés.

Les scripts communs, hooks, CI/livraison, dépendances, migrations, configuration backend,
contrats sensibles et inconnus conservent leur politique renforcée. Les seuils globaux restent à 90 %.
Les primitives de transition partagées conservent tous les E2E : une sélection plus courte n'est pas démontrée.

## Lecture des gains

Les journaux des deux chantiers UX contiennent sept résultats pytest complets directement lisibles,
totalisant 8 710,78 s de temps pytest observé. Deux autres passages backend réussis sont déduits de
la poursuite du plan vers le frontend/E2E ; leur durée n'est pas disponible.
Ces neuf demandes de backend sont retirées par la frontière de domaine démontrée pour ces diffs UX.
Cela ne prouve ni neuf hits de cache historiques ni un gain de délai de livraison de 145 minutes :
les environnements historiques complets, interruptions et attentes ne sont pas reconstruisibles.
Voir le [bilan campagne par campagne](campagnes-ux.md) avant toute utilisation de ces nombres.
