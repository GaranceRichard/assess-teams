# Résultats — premier incrément de comparaison

Cette extension appartient à `EPIC-006 — Suivi longitudinal`, défini dans
[la source du domaine](04-suivi-et-pilotage.md), et applique les [concepts transverses](00-concepts-transverses.md).

### FEAT-041 — Comparer les dernières passations de plusieurs équipes

- **Intention métier :** comparer les profils actuels d’équipes sur un référentiel identique.
- **Acteurs :** Superadmin global, Admin dans son organisation, Coach sur ses passations assignées.
  Le menu Viewer ne confère aucun droit sur les passations ; `ARB-ORG-012` reste ouvert.
- **Description :** afficher les scores snapshotés des dernières passations complétées de plusieurs équipes,
  pour une seule version exacte. Ce comparatif interéquipes est distinct de la comparaison temporelle `FEAT-025`.
- **Critères principaux :** aucun brouillon, aucune agrégation, aucune comparaison automatique entre versions ;
  contrôle backend du périmètre, dates explicites et radar accessible.
- **Dépendances :** `FEAT-014`, `FEAT-023`.
- **Priorité :** P0.
- **Domaine métier :** Résultats / suivi longitudinal.

#### RESULT-001 — Comparer les dernières passations des équipes sur un radar

- **Identifiant :** `RESULT-001`.
- **Feature parente :** `FEAT-041 — Comparer les dernières passations de plusieurs équipes`.
- **User story :** en tant qu’acteur autorisé, je veux superposer les dernières passations complétées
  des équipes pour une même version afin de comparer leurs scores par critère.
- **Intention / valeur :** rendre les profils comparables et leurs sources explicables sans inventer un score global.
- **Description :** `/results` propose famille + version + organisation, les équipes éligibles et un radar 0–10.
  Aucun choix d’équipe initial ; sélectionner ou désélectionner ne déclenche ni navigation ni requête.
- **Critères d’acceptation :**
  - seules les versions avec une passation `COMPLETED` accessible sont proposées, y compris après archivage ;
  - chaque équipe utilise uniquement sa dernière `COMPLETED` accessible : `completed_at DESC`, puis `id DESC` ;
  - échéance, création et révision ne déterminent pas la récence ; aucune moyenne de plusieurs passations ;
  - axes, ordre, libellés et scores 0–10 proviennent des snapshots de la version exacte ;
  - 0 équipe conserve axes/échelle, 1 équipe affiche une série, N équipes superposent leurs séries ;
  - légende, tracés et marqueurs différenciés, dates de complétion, libellés complets et tableau accessible ;
  - changement de version réinitialise les sélections ; chargement, erreur et absence de données explicites ;
  - Superadmin global, Admin organisationnel, Coach limité à ses assignations, Viewer sans données.
- **Refus / cas négatifs :** version forgée hors scope ou sans complétion : `404` ; anonyme : `403` ;
  snapshots incompatibles/incomplets exclus sans utiliser une ancienne passation en remplacement.
- **Hors périmètre :** comparaison temporelle, comparaison v1/v2, historique, agrégation, moyenne d’organisation,
  score global, pondération, tendances, objectifs, export, dashboard, classement et modification des résultats.
- **Dépendances :** `EVAL-003`, `PASS-001`.
- **Priorité :** P0.
- **Notes techniques / preuves :** [contrat Results](../../architecture/results-api.md), tests backend
  `test_results*`, tests React `ResultsPage*` et `results.test.ts`, E2E `results.spec.ts`.
- **Suivi :** [registre canonique](../tracking/pbis.md) ; ce PBI ne réalise pas `FEAT-024` à `FEAT-027`.
