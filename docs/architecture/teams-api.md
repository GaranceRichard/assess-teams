# Contrat API des équipes

Ces routes exigent une session active de Superadmin Django ou d'Admin (`cookieAuth`).
Le Superadmin agit dans toute organisation ; l'Admin uniquement dans une organisation dont il est membre.
Le scope est relu à chaque requête. Coach et Viewer reçoivent `403`, même affectés à l'équipe.
Le découpage TEAM-003 Admin/Superadmin est approuvé ; C04 reste ouvert pour le périmètre Coach.

## Consultation minimale — TEAM-003

`GET /api/admin/teams/{team_id}/` consulte une seule équipe active ou archivée, sans body.
Le paramètre de chemin `team_id` est un entier obligatoire ; aucun filtre d'état n'est nécessaire.
La réponse `200` est exactement :

```json
{"id": 42, "name": "Alpha", "organization_id": 7, "is_active": true}
```

Les quatre champs sont obligatoires et en lecture seule : deux entiers, une chaîne, un booléen.
`is_active=false` distingue une archive, avec les mêmes ID, nom et organisation après archivage.
Aucun Coach, membre, historique, modèle ou contenu d'organisation n'est exposé.

| Condition | Réponse |
| --- | --- |
| Acteur autorisé et équipe accessible, active ou archivée | 200 JSON minimal. |
| Équipe inexistante ou hors périmètre | Même 404 JSON : `{"detail":"Équipe introuvable."}`. |
| Coach, Viewer, session absente ou compte inactif | 403 JSON avec `detail`, avant recherche d'équipe. |
| ID 0, inexistant ou entier hors plage de stockage | 404 JSON sans erreur serveur. |
| ID absent, texte, négatif ou décimal | 404 du routeur, éventuellement non JSON ; aucune donnée d'équipe. |
| Erreur interne | 500 sûr du gestionnaire partagé, sans traceback ni donnée métier. |

La lecture `readable_team` filtre l'organisation avant recherche et inclut les archives.
Elle ne sauvegarde aucune donnée métier et ne crée aucune `ActivityEntry`.
Le [middleware HTTP](journals-api.md) conserve un seul Log technique avec corrélation et contexte autorisé.
Un refus hors périmètre ne charge aucun contexte de l'équipe étrangère.

## Liste et création existantes

`GET /api/admin/organizations/{organization_id}/teams/` liste les équipes actives de l'organisation.
`include_archived=true` inclut aussi les archives pour les sélecteurs des Logs ; valeur invalide : `400`.
La collection conserve sa projection avec Coachs et sa pagination optionnelle.
Le menu Équipes impose le choix d'une organisation accessible.

`POST` sur la même route accepte `name` et `coach_ids`, rattache l'équipe à cette seule organisation
et peut lui affecter plusieurs Coachs. Le nom nettoyé est obligatoire et unique sans tenir compte
de la casse dans l'organisation, archives comprises ; une autre organisation peut réutiliser ce nom.
Chaque Coach doit être membre courant ; seul un inactif local déjà affecté peut être conservé (`400` sinon).
Les [réponses MEP-011](organization-isolation.md) filtrent les données courantes hors organisation.

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
Le parcours Playwright `teams.spec.ts` relit l'équipe active puis archivée et vérifie le refus Coach.
Schéma strictement généré/validé, `/api/schema/` et `/api/docs/` restent contrôlés.
[Preuves et limites du découpage](../backlog/planning/qualification-team-003/preuves.md).

`test_team_archive` vérifie transition unique, snapshots ORM historiques, activité unique,
absence d'écriture métier au second DELETE, scopes, rôles, sessions, CSRF et ID absents/hors plage.
`test_team_archive_openapi` protège le 400 et son schéma liste de chaînes avec exemple exact.
Le parcours `teams.spec.ts` couvre archivage→relecture→second refus→relecture inchangée.
[Qualification et preuves TEAM-005](../backlog/planning/qualification-team-005/preuves.md).
