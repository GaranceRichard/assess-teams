# MEP-030 — Résultats et pilotage : FON-14 à FON-18

Retour au [cahier et aux verdicts](functional-acceptance.md) ; [jeux G4/G5 et oracles chiffrés](functional-acceptance-data.md).
État de chaque nominal/refus : **Non exécuté**. MEP-070 consomme FON-14/15/16/18 ; MEP-033 consomme FON-17.
Les scénarios s'appuient sur les contrats [Résultats](../architecture/results-api.md) et [Pilotage P0](../architecture/steering-api.md).
Les améliorations MEP-014/046/015/047/016/048 restent distinctes de ces acquis ; MEP-067 porte leurs mesures UX.

## FON-14 — Radar courant, dernières complétions et sélections

- **PBI / préconditions :** RESULT-001, PASS-001, EVAL-003 ; G4 variante false, Admin de l'organisation du jeu ; pas de sélection préalable.
- **Actions :** Résultats → organisation imposée → famille Radar E2E → sélectionner A puis B ; ouvrir Données détaillées,
  revenir au Graphique, désélectionner A puis B ; recharger et refaire sous Superadmin après choix explicite d'organisation.
- **Attendu vérifiable :** v1 même archivée reste lisible ; A=[0,10,7] du 02/10, B=[8,3,5] du 03/10 UTC convertis au fuseau navigateur.
  A ancienne=[2,2,2] n'est pas utilisée. Tableau/radar/legend correspondent aux mêmes run IDs et axes snapshotés.
  Zéro série conserve axes/échelle 0–10 ; 1/N équipes superposables, sélections conservées entre restitutions,
  sans nouvelle requête de projection lors du seul choix d'équipe. Aucune moyenne, note globale ou classement.
- **Vrais refus :** `GET /api/results/families/<famille-Beta>/` sous Admin Alpha = 404, même corps de refus qu'un ID inconnu,
  aucune donnée Beta. Coach sans assignation de ces runs : famille non proposée et accès direct 404.
- **Preuves :** captures 0/1/2 sélections, tableau notes/dates/run IDs attendus/observés et réponse expurgée ;
  [results](../../frontend/e2e/results.spec.ts), backend `test_results.py`, `test_results_security.py`.
  Le critère de récence est completed_at puis ID décroissant, jamais échéance ou date de révision.

## FON-15 — Historique par lignée et quatre restitutions

- **PBI / préconditions :** RESULT-002, EVAL-003, PASS-001 ; G4 variante true, mêmes deux équipes sélectionnées.
- **Actions :** vérifier radar v2 malgré brouillon v3 ; passer Analyse=Dans le temps sans choisir de critère,
  choisir Collaboration v2 puis alterner Graphique/Données détaillées ; revenir au Radar et au temporel.
  Refaire après révision Admin d'un run v1 sur clone, en relevant sa date de complétion initiale.
- **Attendu vérifiable :** pas de requête d'historique avant choix de critère ; A=2→0→6, B=8→7, provenance v1/v2 et textes exacts.
  Dates triées par équipe, cellules restantes de B vides ; 0 mesuré affiché 0/10, absence jamais convertie en zéro.
  Les quatre combinaisons affichent une seule restitution ; équipes/famille/critère et restitution conservés aux transitions.
  Révision change le score de l'observation sans changer sa position/date initiale ni créer un nouveau point.
- **Vrais refus :** ajouter un `team_ids=<équipe-Beta>` à la liste de l'historique autorisé = 404 pour toute la requête, aucune série partielle.
  Un `team_ids=invalid` = 400. Critère avec lignée étrangère = 404. Aucun alignement par texte seul ne doit fusionner des critères distincts.
- **Preuves :** tableau de toutes les observations score/date/version/lignée, captures quatre vues et codes de refus ;
  [results-longitudinal](../../frontend/e2e/results-longitudinal.spec.ts), backend `test_result_longitudinal.py`,
  `test_result_longitudinal_security.py`, `test_result_history_missing.py`.
  L'absence de lignée commune historique est une discontinuité explicite, pas une tendance à reconstruire.

## FON-16 — Consultation Coach/Viewer et refus d'administration

- **PBI / préconditions :** RESULT-001/002, MEP-011/037/038 ; G0/G4 avec scope Coach=A seulement, autre Coach=B,
  Viewer rattaché à l'organisation ; au moins un run NOT_STARTED/IN_PROGRESS pour vérifier son exclusion.
- **Actions :** connecter Coach puis Viewer dans deux contextes ; consulter radar et Collaboration dans le temps ;
  tenter les routes Utilisateurs/Équipes/Évaluations/Pilotage avec Viewer, puis les API correspondantes.
  Comparer les résultats Admin, Coach et Viewer sur le même candidat et les mêmes IDs.
- **Attendu vérifiable :** Coach reçoit ses seules COMPLETED assignées, pas B ; Viewer voit les COMPLETED A/B de son organisation,
  radar et longitudinal, sans accès aux passations inachevées ni mutation ; organisation imposée, menus Dashboard/Résultats uniquement.
  Aucun changement de notes/auteur/date provoqué par la consultation. Dashboard Viewer masque les auteurs (FON-03).
- **Vrais refus :** Viewer `GET /api/admin/users/`, `/api/admin/organizations/`, `/api/evaluations/`, `/api/steering/` = 403 ;
  POST `/api/evaluations/<run>/finalize/` avec CSRF valide = 403 sans effet. Coach lit famille étrangère = 404 ;
  aucun ID organisation/équipe/famille forgé n'élargit son scope. Vérifier les données côté Admin après la mutation refusée.
- **Preuves :** captures par rôle, inventaire runs inclus/exclus, relecture autorisée et codes expurgés ;
  [viewer-results](../../frontend/e2e/viewer-results.spec.ts), `permissions`, backend `test_viewer_results.py`, `test_results_security.py`.
  Le droit Viewer sur Results ne donne pas une lecture administrative Organisation/Équipes.

## FON-17 — Couverture, échéances et drill-down Pilotage

- **PBI / préconditions :** STEER-001, RESULT-001 ; G5, date D backend consignée ; Admin Alpha et Superadmin, Coach/Viewer pour refus.
- **Actions :** ouvrir Pilotage sous Admin puis Superadmin ; comparer synthèse/lignes aux runs persistés ;
  suivre Voir les résultats de A, recharger l'URL et ouvrir dans un nouveau contexte autorisé.
  Superadmin bascule Alpha → Beta et contrôle les lignes ; variante sur clone : A n'a que v1 tandis que B possède v2 de la famille.
- **Attendu vérifiable :** 3 actives, 2 avec résultat, 1 sans, 1 évaluation en retard ; A=En retard, B=À jour,
  C=Jamais évaluée même avec attente à D ; archive exclue, aucune donnée Beta dans Alpha.
  Prochaine date = minimum pertinent ; dernière complétion = date initiale la plus récente, pas révision ; pas de score d'équipe/Coach.
  Drill-down présélectionne organisation/famille/A autorisées. Variante v1/v2 : message d'absence d'A du radar courant,
  aucune sélection de remplacement ni forçage de version historique ; les indicateurs ne sont pas recalculés dans Results.
- **Vrais refus :** Coach/Viewer sur route et API Steering = 403 ; Admin Alpha `GET /api/steering/?organization_id=<Beta>` = 404 ;
  Superadmin sans organization_id = 400. GET ne crée pas d'attente ni n'avance de calendrier ; comparaison avant/après par exploitant.
- **Preuves :** décompte des sources avec due_date/completed_at/D, synthèse/lignes, URL expurgée et sélection après reload ;
  [steering](../../frontend/e2e/steering.spec.ts), backend `test_steering.py`, `test_steering_security.py`.
  L'échéance D−1 compte, D/futur ne comptent pas ; une échéance non matérialisée n'invente pas une attente en retard.

## FON-18 — Pertes de droits, états vides et erreurs de consultation

- **PBI / préconditions :** RESULT-001/002, DASH-001, MEP-011/038 ; G0/G4, lien profond autorisé Alpha conservé,
  compte Viewer de test retirable sans violer l'invariant Admin, organisation sans résultat ; clones séparés pour chaque variante.
- **Actions :** ouvrir le lien Alpha et charger radar/historique ; Superadmin retire l'appartenance du Viewer,
  puis avec la même session relire l'API et recharger le lien. Ouvrir une organisation autorisée sans résultat sous Admin.
  Variante de service sur clone : réponse de chargement Results retardée puis 500 contrôlé, restauration et réessai.
- **Attendu vérifiable :** après retrait, anciens objets non accessibles au prochain appel et après reload, aucune série historique
  récupérable via le lien conservé ; pas de nouveau droit par URL. Sans résultat : état vide explicite sans chiffre ni date fictifs.
  Chargement/erreur distingués ; aucune donnée d'une ancienne sélection présentée comme courante ; réessai réussi recharge le scope autorisé.
- **Vrais refus :** anciennes familles/radar/critère Alpha = 404 après retrait, corps limité à detail et identique à ressource inconnue ;
  ni identité ni provenance étrangère révélées. Une erreur 500 est un incident de service simulé, pas un refus métier conforme,
  et ne peut être utilisée comme preuve du 404 ; consigner les variantes séparément.
- **Preuves :** identité/appartenance avant/après, requêtes de la session conservée, captures vide/loading/erreur/réessai ;
  [indirect-access](../../frontend/e2e/indirect-access.spec.ts), backend `test_isolation_sessions.py`,
  React `ResultsPageErrors.test.tsx` et `ResultsViewsTransitions.test.tsx` (dans `frontend/src/`).
  La simulation ne qualifie pas une panne SQLite/réseau MESS ; MEP-018/050/051 restent ouverts, mesures UX-09 distinctes.
