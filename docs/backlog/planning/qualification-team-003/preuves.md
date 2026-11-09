# TEAM-003 — Preuves du découpage Admin/Superadmin

Découpage approuvé explicitement le 2026-11-06 après le [rapport de qualification](rapport.md).
Base : `550efa5e52648c3ae934421b29c10121eb091471` ; branche `qual/team-003-consultation`.
Ce document porte la réalisation technique du découpage ; TEAM-003 reste ouvert pour C04.

## Périmètre réalisé

- GET sur la route existante, quatre champs exacts : `id`, `name`, `organization_id`, `is_active`.
- Lecture `readable_team` distincte de `manageable_team` ; équipe active ou archivée accessible.
- Permission Session Admin/Superadmin conservée ; Coach, Viewer, anonyme et inactif refusés.
- Même 404 JSON `{"detail":"Équipe introuvable."}` pour absence et hors périmètre.
- Aucun événement métier ; un Log HTTP technique conservé, enrichi seulement après autorisation.
- PUT/DELETE et `manageable_team` inchangés ; archives toujours non modifiables.
- Aucun modèle, migration, nouvel écran, historique ou dépendance ajouté.

## Preuve avant implémentation

Sur la base publiée, les trois nouveaux fichiers de tests ont été exécutés avant ajout du handler :
**15 échecs, 15 succès en 10,99 s**. Les échecs reproduisent GET à 405 au lieu de 200/404 et GET absent
d'OpenAPI ; les refus de rôle et de routage étaient déjà présents.
Après implémentation, nouvelle sélection avec les suites existantes : **48 succès en 16,44 s**.
Une preuve additionnelle de retrait du rattachement Admin a ensuite été ajoutée.
La campagne complète a révélé l'inventaire central des opérations à actualiser :
`role_matrix_helpers.ACTIONS` inclut désormais GET détail avec les seuls rôles Admin/Superadmin.

## Matrice des preuves versionnées

| Attente | Preuve |
| --- | --- |
| Deux rôles autorisés × actif/archivé ; projection exacte sans Coach | `test_team_detail.test_detail_returns_only_identity_and_state` |
| Admin avec/sans organisation ; équipe étrangère active/archivée = ID absent | `test_foreign_and_missing_teams_have_identical_safe_refusals` |
| Coach affecté ou non, Viewer, inactif, anonyme ; existence non révélée | `test_detail_refuses_unauthorized_actors_without_disclosing_existence` |
| ID inexistant, zéro, entier hors plage ; refus contrôlé | `test_unknown_integer_ids_are_controlled_not_found` |
| ID absent ou mal formé ; 404 de routage préservé | `test_missing_or_malformed_ids_remain_router_not_found` |
| Retrait d'organisation sur session existante | `test_detail_rechecks_admin_membership_on_an_existing_session` |
| Équipe, liens, organisation, planifications, passations complétées et activités inchangés | `test_team_detail_integrity.test_detail_preserves_business_data_and_writes_only_one_http_log` |
| Identité après archivage ; PUT/DELETE refusés ; liste et filtre Logs conservés | `test_reading_an_archive_preserves_identity_and_does_not_make_it_mutable` |
| Quatre champs requis en lecture seule, cookieAuth, codes, mutations enrichies inchangées | `test_team_detail_openapi` |
| Génération stricte/Swagger ; création, gestion et journaux existants | `test_openapi`, `test_teams`, `test_log_team_options`, `test_http_logs` |
| Navigateur réel : GET actif puis archivé, refus Coach, parcours de gestion | `frontend/e2e/teams.spec.ts` |

## DoD et revue d'impact

README modifié avant développement. Contrat extrait dans [teams-api](../../../architecture/teams-api.md)
pour conserver la limite de 200 lignes de `backend-api.md`, avec renvoi depuis ce dernier.
Matrices de permissions/isolation et descriptions factuelles du backlog actualisées ; aucun statut,
indicateur, date canonique ni arbitrage changé. Les justifications du GET et de sa dépendance TEAM-005
sont actualisées dans le registre, avec statuts Ouvert et dates N/A conservés. La fiche d'audit garde
sa base du 2026-10-27 ; aucun développement TEAM-005 n'est ajouté.
Règles agents, charte, DoD, stratégie de tests, fondamentaux et contrat des journaux relus :
aucun changement de politique, architecture ou journalisation transverse nécessaire.
Nouvel écran, preuve visuelle UX, migration et dépendance : non applicables, aucun changement correspondant.
Le moteur d'impact impose documentation, backend complet, frontend complet et E2E pour ce contrat API.
Reprise du 2026-11-09 : backend complet, **1 496 succès**, couverture **97,51 %** ;
frontend complet, **493 succès / 119 fichiers**, statements **94,87 %**, branches **93,32 %**,
fonctions **96,35 %**, lignes **95,71 %**. Lint, formatage, migrations, typecheck et build passent.
Une première tentative E2E a refusé l'écriture des dispatchers Git dans le bac à sable ;
relance du scope E2E complet avec les permissions requises, sans modification des hooks ni
contournement d'un quality gate : **150 parcours réels réussis en 21,6 min**, puis
**10 parcours démo réussis en 39,3 s**. Le gate E2E complet termine avec code 0.
Commandes : `npm.cmd run quality:targeted`, puis `npm.cmd run quality:targeted -- --only e2e`
pour la relance du seul domaine qui avait rencontré le refus d'accès.
Publication et CI du SHA exact à consigner après leur exécution.

## Limites et décision de clôture

Clôture technique du seul découpage à proposer après gates, publication et CI du SHA exact.
TEAM-003 reste ouvert : C04 doit décider le périmètre Coach, puis l'extension sera spécifiée et validée.
Le refus actuel du Coach ne satisfait pas son critère canonique de consultation.
TEAM-005 conserve le second refus explicite à traiter séparément ; TEAM-006/007 restent hors périmètre.
Aucune clôture du PBI, modification de décision produit ou promotion MESS n'est déduite de ce lot.
