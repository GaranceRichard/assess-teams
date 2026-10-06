# Résultats — radar courant et observations longitudinales

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
- **Description :** `/results` propose organisation + famille, choisit automatiquement la dernière version avec résultats,
  puis propose les équipes éligibles et un radar 0–10.
  Aucun choix d’équipe initial ; sélectionner ou désélectionner ne déclenche ni navigation ni requête.
- **Critères d’acceptation :**
  - seules les familles avec une `COMPLETED` accessible sont proposées ; la dernière version ayant
    des résultats accessibles est utilisée automatiquement, y compris après archivage ;
  - chaque équipe utilise uniquement sa dernière `COMPLETED` accessible : `completed_at DESC`, puis `id DESC` ;
  - échéance, création et révision ne déterminent pas la récence ; aucune moyenne de plusieurs passations ;
  - axes, ordre, libellés et scores 0–10 proviennent des snapshots de la version exacte ;
  - 0 équipe conserve axes/échelle, 1 équipe affiche une série, N équipes superposent leurs séries ;
  - légende, tracés et marqueurs différenciés, dates de complétion, libellés complets et tableau accessible ;
  - changement d’organisation/de famille réinitialise les sélections ; chargement, erreur et absence de données explicites ;
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

## Observations longitudinales — déclinaison de FEAT-025

La Feature [FEAT-025 — Comparer des évaluations compatibles](04-suivi-et-pilotage.md) reste plus large
que cet incrément. Chaque équipe conserve ici sa propre trajectoire ; aucun écart calculé, comparaison
paire à paire d’équipes ni comparaison globale de versions n’est introduit.

#### RESULT-002 — Suivre les observations historiques d’un critère

- **Identifiant / Feature parente :** `RESULT-002` / `FEAT-025 — Comparer des évaluations compatibles`.
- **Epic :** `EPIC-006 — Suivi longitudinal`.
- **User story :** en tant qu’acteur autorisé, je veux ouvrir un critère du radar pour consulter ses
  observations historiques compatibles par équipe, puis revenir au radar avec mes choix conservés.
- **Intention / valeur :** rendre les observations datées explicables sans inventer de filiation ni de tendance.
- **Description :** Organisation → Modèle → Équipe(s) → Radar → Critère → Évolution → Retour au radar.
- **Critères d’acceptation :**
  - Superadmin : choisit l’organisation ; Admin : organisation imposée ; autres rôles : droits inchangés ;
  - familles avec `COMPLETED` accessibles, dernière version ayant des résultats automatiquement retenue ;
  - seules les équipes de cette version sont sélectionnables ; aucune sélection d’équipe par défaut ;
  - radar = dernière position : une `COMPLETED` par équipe, `completed_at DESC`, puis `pk DESC` ;
  - zéro équipe conserve axes/échelle ; 1/N équipes conservent séries, légende et dates ;
  - clic sur le libellé/point du critère ou activation clavier du bouton accessible ouvre le longitudinal ;
  - historique chargé à cette ouverture uniquement, pour les équipes sélectionnées ;
  - X = date de complétion, Y = score 0–10, une courbe par équipe, un point par `COMPLETED` compatible ;
  - chaque série suit `completed_at ASC, pk ASC` et restitue équipe, date, score, version et texte observé ;
  - valeurs issues des snapshots, aucune moyenne, interpolation de valeurs ni tendance calculée ;
  - continuité inter-version uniquement par lignée UUID explicitement conservée à la copie ;
  - nouvelle question : nouvelle lignée ; modification d’un brouillon copié : même lignée ;
  - suppression d’un critère : historique conservé, sans reconstitution du critère sur les versions suivantes ;
  - migration conservatrice : questions historiques distinctes, snapshots rattachés uniquement par FK source ;
  - retour au radar conserve organisation, modèle et équipes ; changement de contexte réinitialise les choix ;
  - tableau sémantique complet, thèmes jour/nuit et erreurs/absence de données explicites.
- **Refus :** organisation/famille/critère/équipe forgés ou hors scope : `404` ; query invalide : `400` ;
  anonyme/inactif : `403` ; Viewer : aucune donnée. Une liste mêlant équipes autorisées et forgées est refusée.
- **Hors périmètre :** moyennes, score global, classement, tendances calculées, objectifs, rapprochement
  automatique de critères, comparaison globale de versions, Steering, exports et édition depuis Results.
- **Dépendances / priorité :** `RESULT-001`, `EVAL-003`, `PASS-001` / P0.
- **Notes techniques / preuves :** [contrat Results](../../architecture/results-api.md), migration `0013`,
  tests `test_question_lineage*`/`test_result_longitudinal*`, React `ResultsLongitudinal*` et sélections,
  E2E `results-longitudinal.spec.ts`. `FEAT-024` à `FEAT-027` ne sont pas déclarées réalisées intégralement.
- **Suivi :** [registre canonique](../tracking/pbis.md).
