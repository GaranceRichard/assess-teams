# EVAL-002 — Sécuriser le cycle de vie des modèles locaux

- **Identifiant / Feature parente :** `EVAL-002` / `FEAT-013`, dans `EPIC-003`.
- **Nature :** évolution explicitement demandée avant la passation, dans le périmètre organisationnel local.
- **User story :** en tant qu’Admin de l’organisation ou Superadmin, je veux valider puis archiver explicitement
  un modèle pour contrôler son utilisation sans réécrire les références déjà planifiées.
- **Intention et valeur :** figer le contenu utilisé et empêcher une nouvelle planification d’un modèle retiré.
- **Description et critères livrés :**
  - création en `DRAFT` ; validation explicite vers `VALIDATED`, avec nom non vide et au moins une question ;
  - modèle et questions immuables après validation, y compris ajout, modification, ordre et suppression ;
  - archivage logique explicite `VALIDATED → ARCHIVED`, sans transition inverse ni suppression ;
  - validation et archivage enregistrés dans le Journal d’activité existant ;
  - création et modification de planification acceptent uniquement `VALIDATED` ;
  - planifications déjà créées et questions archivées restent lisibles ; modifier exige un modèle validé ;
  - scopes Admin/Superadmin et refus inter-organisations appliqués à toutes les requêtes API ;
  - états visibles, actions selon état et confirmations dans `/templates` ; filtrage dans `/planning`.
- **Refus :** nom vide, zéro question, mauvaise transition, mutations immuables, modèle brouillon/archivé
  planifié, Coach/Viewer, ressources hors organisation, y compris requêtes forgées.
- **Migration :** les modèles existants déjà planifiés deviennent `VALIDATED` pour préserver les engagements ;
  les autres deviennent `DRAFT`. Leur éventuelle préparation incomplète nécessite une validation explicite.
- **Dépendances / priorité :** `EVAL-001`, `PLAN-001`, `FEAT-004` / P0.
- **Preuves :** migrations Assessments/Journals, OpenAPI, tests API/React/Playwright et migration historique.
- **Hors périmètre :** partage, modalités, versionnement/duplication, passation, réponses, scoring, résultats,
  comparaison temporelle, réactivation/dévalidation et infrastructure nouvelle. `FEAT-013` reste partielle :
  retrait avec impact sur passations et échéances futures non implémenté. Notifications existantes inchangées.
