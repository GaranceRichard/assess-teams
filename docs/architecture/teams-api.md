# Contrat API des équipes

Ces routes exigent une session active (`cookieAuth`). Le Superadmin Django agit dans toute
organisation et l’Admin uniquement dans son organisation. [C04 du 2026-11-12](../backlog/source/00-arbitrage-c04-equipes-coach.md)
autorise le Coach actif à lire uniquement ses équipes actuellement affectées dans son organisation
actuelle. Appartenance et affectation sont revérifiées à chaque requête. Un ancien lien, une ancienne
appartenance ou une assignation de passation ne donne aucun droit de lecture d’équipe.
Viewer reste refusé (403) ; ses consultations existantes dans Results sont conservées.

`CanReadTeams` s’applique aux lectures seulement, combinée avec la permission existante pour
les Admins. `CanManageOrganizations` reste inchangée : aucune mutation ni consultation
organisationnelle Coach supplémentaire. Les menus et écrans administratifs restent inchangés.

## Consultation minimale — TEAM-003

`GET /api/admin/teams/{team_id}/` consulte une seule équipe active ou archivée, sans body.
Le paramètre de chemin `team_id` est un entier obligatoire ; aucun filtre d’état n’est nécessaire.
La réponse `200` est exclusivement :

```json
{"id": 42, "name": "Alpha", "organization_id": 7, "is_active": true}
```

Les quatre champs sont obligatoires et en lecture seule : deux entiers, une chaîne, un booléen.
`is_active=false` distingue une archive ; le Coach y accède tant que son affectation courante
et son appartenance sont conservées. Aucun Coach, membre, historique, modèle ou contenu
d’organisation n’est exposé.

| Condition | Réponse |
| --- | --- |
| Superadmin/Admin autorisé ou Coach actif actuellement affecté et membre courant | 200 JSON minimal, actif ou archivé. |
| Équipe inexistante, étrangère ou non affectée au Coach | Même 404 JSON : `{"detail":"Équipe introuvable."}`. |
| Viewer, session absente ou compte inactif | 403 JSON avec `detail`, avant recherche d’équipe. |
| ID 0, inexistant ou entier hors plage de stockage | 404 JSON sans erreur serveur. |
| ID absent, texte, négatif ou décimal | 404 du routeur, éventuellement non JSON ; aucune donnée d’équipe. |
| Erreur interne | 500 sûr du gestionnaire partagé, sans traceback ni donnée métier. |

`readable_teams` filtre organisation et affectation avant recherche par identifiant dans `readable_team`.
La lecture ne sauvegarde aucune donnée métier et ne crée aucune `ActivityEntry`.
Le [middleware HTTP](journals-api.md) conserve un seul Log technique avec contexte autorisé.
Un refus ne charge aucun contexte de l’équipe inaccessible.

## Liste active — TEAM-002

`GET /api/admin/organizations/{organization_id}/teams/` liste les actifs accessibles une seule fois.
Coach : mêmes quatre champs minimaux, uniquement ses affectations courantes dans son organisation.
Superadmin/Admin : projection existante enrichie de `coaches`, membres courants de l’organisation.
Une collection hors organisation et une organisation inexistante donnent le même 404 sans divulgation.
Sans équipe accessible : `[]`, ou `count=0` et `results=[]` si `page=1` est demandé.
Le contexte Coach existant du Dashboard présente explicitement l’absence d’équipe active affectée.

`include_archived=true` conserve le filtre Admin/Superadmin des sélecteurs Logs. Pour le Coach,
la liste reste limitée aux **actifs**, même avec ce paramètre ; ce filtre ne réalise pas TEAM-006.
Valeur invalide : 400. La pagination optionnelle conserve le filtrage avant comptage et sélection.
OpenAPI décrit les deux projections et leurs variantes liste simple/enveloppe paginée.
Aucune nouvelle lecture d’organisation n’est ouverte : C03 reste distinct.

## Création, modification et archivage préservés

Ces écritures restent réservées aux Admins/Superadmins via `CanManageOrganizations`.
`POST` sur la collection accepte `name` et `coach_ids`, rattache l’équipe à cette organisation
et peut lui affecter plusieurs Coachs. Le nom nettoyé est obligatoire et unique sans tenir compte
de la casse dans l’organisation, archives comprises ; une autre organisation peut réutiliser ce nom.
Chaque Coach doit être membre courant ; seul un inactif local déjà affecté peut être conservé.

## Modification et archivage — TEAM-005

`PUT /api/admin/teams/{team_id}/` remplace nom et Coachs sans changer l'organisation.
Il conserve `manageable_team`, limité aux actifs : archive, absence et hors périmètre donnent `404`.
Un GET d'archive réussi n'autorise aucune mutation de cette archive.

`DELETE` archive une équipe active et retourne `204` sans corps ; elle disparaît de la liste active
sans suppression physique ni modification de son identité, ses liens et ses données historiques.
Une seule activité métier `team_archived` est créée avec la transition.
Le contrat TEAM-005 approuvé le 2026-11-12 refuse explicitement une archive accessible :

| Condition DELETE | Réponse | Effet et journalisation |
| --- | --- | --- |
| Équipe active accessible, Admin/Superadmin | 204 sans corps | is_active=false ; une activité d'archivage et un Log HTTP. |
| Équipe déjà archivée accessible, Admin/Superadmin | 400 : `["Équipe déjà archivée."]` | Aucune sauvegarde métier ni activité ; un Log HTTP 400 avec contexte autorisé. |
| Équipe inexistante ou hors organisation, active ou archivée | Même 404 : `{"detail":"No Team matches the given query."}` | Aucun effet métier ni contexte d'équipe étrangère. |
| Coach/Viewer, session absente/inactive ou CSRF invalide | 403 existant | Refus avant recherche, aucun effet métier. |

Le DELETE conserve d’abord `manageable_team` pour les actifs. Après son 404, le helper dédié
`archivable_team` filtre à nouveau l’organisation avant recherche par ID et avant contrôle d’état.
Il ne modifie ni `readable_team` ni `manageable_team` ; les erreurs DELETE 404 existantes sont conservées.
Le refus 400 utilise `ValidationError`, comme les autres invariants de lifecycle backend.
Aucun verrou ou mécanisme de concurrence nouveau, modèle, migration ou capacité annexe n'est introduit.
Aucune liste dédiée TEAM-006 ni réactivation TEAM-007 n'est ajoutée.

## Validation

`test_team_detail`, `test_team_detail_integrity` et `test_team_detail_openapi` couvrent projection,
deux états, rôles, ID, isolation, session après retrait, données historiques et capture HTTP unique.
`test_teams`, `test_log_team_options`, `test_http_logs` et `test_openapi` protègent les acquis.
Le parcours Playwright `teams.spec.ts` relit l’équipe active puis archivée ; les lectures Coach suivent désormais C04.
Schéma strictement généré/validé, `/api/schema/` et `/api/docs/` restent contrôlés.
[Preuves et limites du découpage](../backlog/planning/qualification-team-003/preuves.md).

`test_team_archive` vérifie transition unique, snapshots ORM historiques, activité unique,
absence d'écriture métier au second DELETE, scopes, rôles, sessions, CSRF et ID absents/hors plage.
`test_team_archive_openapi` protège le 400 et son schéma liste de chaînes avec exemple exact.
Le parcours `teams.spec.ts` couvre archivage→relecture→second refus→relecture inchangée.
[Qualification et preuves TEAM-005](../backlog/planning/qualification-team-005/preuves.md).

`test_coach_team_reads` vérifie actifs/archives, projections, vrais refus, anciens liens,
assignations de passation, sessions après retrait/désactivation et mutations toujours interdites.
`test_team_detail_integrity` compare données métier et liens avant/après lecture, y compris Coach.
`test_team_detail_openapi` couvre détail et projections de collection. Les tests équipes, rôles,
isolation, Logs et Swagger protègent les acquis. `coach-team-reads.spec.ts` vérifie la session réelle,
les GET, les refus, les retraits courants et l’état vide ; la navigation Admin reste protégée.
[Qualification et soumissions séparées des clôtures](../quality/c04/README.md).

## Préparation du changement — application de C04 aux lectures

- Périmètre : limiter les lectures TEAM-002 et TEAM-003 aux affectations courantes du Coach actif dans son organisation, sans nouvelle mutation ni écran administratif.
- Objectif : appliquer la décision produit du 12 novembre après le GET Admin déjà livré, en supprimant le refus de rôle global pour ces seules lectures autorisées.
- Effets attendus : une liste active minimale, un détail actif ou archivé à quatre champs, un état vide explicite et des refus identiques sans divulgation hors périmètre.
- Risques : préserver les mutations Admin et Superadmin, les droits Viewer dans Results, le filtre Logs, les sessions après retrait et la séparation entre équipe et passation.
- Vérification : confronter API et base de données, contrats OpenAPI, vrais refus, absence de mutation métier, tests React et parcours navigateur puis gates complets et CI du SHA publié.
- Fichier : `backend/teams/adapters/api/permissions.py`
- Fichier : `backend/teams/adapters/api/schema.py`
- Fichier : `backend/teams/adapters/api/scope.py`
- Fichier : `backend/teams/adapters/api/views.py`
- Fichier : `backend/tests/role_matrix_helpers.py`
- Fichier : `backend/tests/test_coach_team_list.py`
- Fichier : `backend/tests/test_coach_team_reads.py`
- Fichier : `backend/tests/test_collection_pagination.py`
- Fichier : `backend/tests/test_isolation_reads.py`
- Fichier : `backend/tests/test_team_detail.py`
- Fichier : `backend/tests/test_team_detail_integrity.py`
- Fichier : `backend/tests/test_team_detail_openapi.py`
- Fichier : `backend/tests/test_teams.py`
- Fichier : `frontend/e2e/coach-team-reads.spec.ts`
- Fichier : `frontend/e2e/teams.spec.ts`
- Fichier : `frontend/src/DashboardPage.test.tsx`
- Fichier : `frontend/src/DashboardPage.tsx`

Cette section normalise le 2026-11-13 la préparation existante lors de l’adoption de la
nouvelle politique documentaire. La décision C04 et l’annonce README ont été rédigées
avant le développement selon la règle alors applicable ; les scénarios API ont ensuite
échoué avant adaptation. La forme actuelle du bloc et son inventaire explicite sont
postérieurs au développement : ils ne sont pas présentés comme une preuve d’antériorité
de ce format. La resynchronisation ne modifie aucun fichier applicatif C04.

La revue de contenu est consignée dans le [dossier de qualification](../quality/c04/README.md).
