# Validation des permissions par rôle — MEP-037

La [matrice API et navigation](role-permissions.md) distingue rôle, organisation,
invariants métier et exceptions publiques, depuis la base b6be4c8.

## Preuves exécutables

| Suite | Ce qu'elle démontre |
| --- | --- |
| test_api_role_matrix.py + role_matrix_helpers.py | Inventaire comparé au résolveur Django : toute méthode métier privée doit être classifiée ; appels réels pour chaque rôle interdit, 403 et état métier inchangé ; lectures Dashboard/Results des quatre acteurs ; méthodes publiques non prévues : 405. |
| test_role_escalation.py | Champs superuser/staff/groups/user_permissions/role_id/organizations refusés en invitation et PUT ; auto-promotion et promotion d'un autre compte ; Admin pair actif/inactif sur PUT/DELETE/deactivate/reactivate/members ; changement légitime appliqué dans une session existante, révision Coach refusée. |
| test_public_role_boundaries.py | Palette personnelle ne peut modifier privilèges/cible ; invitation valide publique conserve le rôle/cible, ne connecte pas et n'est pas rejouable ; token invalide sans effet ; descriptions et réponses OpenAPI. |
| ProductShellRolePermissions.test.tsx | Menus et accès directs des onze routes pour Admin/Coach/Viewer ; Superadmin autorisé ; changement de rôle au rendu, sans exposition du contenu interdit. |
| navigation.test.ts | Héritage des capacités et refus Coach sur Équipes. |
| permissions.spec.ts | Navigation/Admin/Coach/Viewer, actions par cible, API directe refusée ; Coach refusé sur /teams ; session rechargée après rétrogradation puis restauration du rôle. |

Les nouvelles suites API utilisent les utilisateurs réels de la fixture MEP-011
(deux organisations, Superadmin et trois rôles). Login réel et CSRF sont exercés ;
aucune classe de permission n'est simulée. Les refus comparent toutes les lignes persistées
des applications identities, teams, assessments, notifications et du Journal métier,
y compris relations M2M automatiques. Les Logs HTTP d'audit sont volontairement exclus :
enregistrer un refus est légitime, aucune absence de journalisation n'est exigée.
Les notifications persistées font partie de la comparaison : aucun mail métier n'est planifié.

Les succès et conditions déjà couverts sont réutilisés :

- USER-001 et test_managed_user_permissions, test_managed_users,
  test_managed_user_invitations : création/invitation/édition autorisées et hiérarchie.
- test_user_lifecycle* : Superadmin sur Admin, activation, idempotence, dernier Admin actif,
  sessions inactives, invariants et conservation historique.
- test_organization*, test_team*, test_evaluation* : CRUD autorisés,
  références/scopes, lifecycle, versions, questions, planning, passation et révision Admin.
- test_results*, test_result_longitudinal*, test_steering*, test_journal*,
  test_log*, test_dashboard* : lectures, rôles, scopes et contrats.
- test_api_permission_inventory, test_default_api_permissions, suites session,
  mots de passe, health et OpenAPI : MEP-008, accès publics, sessions, CSRF et refus.
- [Preuves MEP-011](organization-isolation-validation.md) : aucune isolation réimplémentée.
- UserManagementPermissions, UserLifecycle, OrganizationMembershipLimits,
  EvaluationTakingPage, DashboardPage, tests App/PasswordPages : actions et routes
  autorisées/interdites, session, callbacks et accès publics existants.

## Reproduction des défauts avant correction

Sur la base de départ, le test de champs forgés retourne 201 au lieu de 400 pour
une invitation avec is_superuser ; l'édition ignore aussi ces champs avant d'appliquer
les attributs valides. La demande forgée n'était pas rejetée dans son ensemble,
sans élévation effective constatée.
Deux assertions React échouent avant correction : accès Coach direct /teams et
rétrogradation Admin vers Coach sur cette route. Elles passent après minimumRole Admin.
Les autres mécanismes conformes sont conservés.

## Validation et livraison

npm run quality:targeted calcule le plan automatiquement. Les serializers/API et la
navigation affectent un contrat de sécurité produit : backend complet renforcé, frontend
complet et E2E sont requis, avec statiques, migrations et seuils >= 90 %.
Les preuves locales restent réutilisables uniquement selon les empreintes/sélections du pipeline.
Le pre-push demeure bloquant et la CI du SHA intégré est une preuve indépendante.

Validation locale du 2026-10-17 : npm run quality:targeted entièrement vert.

| Contrôle | Résultat |
| --- | --- |
| API ciblée explicite | 157 tests réussis ; comparaison persistante après refus. |
| Backend complet | 1 258 tests réussis ; couverture 97,37 %, dont SQLite multiprocessus et sécurité. |
| Frontend complet | 428 tests / 103 fichiers réussis ; statements 96,42 %, branches 94,78 %, fonctions 96,63 %, lignes 97,30 %. |
| E2E application | 65 parcours Chromium réussis, dont les deux scénarios permissions. |
| E2E démo | Build et 9 parcours sans backend réussis. |
| Statiques et contrats | Lignes <= 200, secrets, cohérence, Ruff, Prettier, ESLint, migrations, typage/build et OpenAPI verts. |

Publication applicative par npm run publish : commit 11e3a4180e8ccb48fc28b7d909f30258e542cc01.
Le pré-push a revérifié backend, frontend et les 74 parcours E2E avec succès.
Le checkout principal propre a été avancé exclusivement en fast-forward.

[CI indépendante du SHA intégré](https://github.com/GaranceRichard/assess-teams/actions/runs/39083777674) :
succès confirmé le 2026-10-18, avec backend, frontend, documentation, parcours et
Required impact gate verts. Le job full non requis est explicitement ignoré par le plan ;
cette CI sélective n'est pas présentée comme une qualification MESS exhaustive.

La clôture canonique du 2026-10-18 intervient après cette confirmation ; les vues dérivées
et la liste des PBI prêts sont recalculées. MEP-038 est désormais prêt selon ses dépendances.

## Revue documentaire et risques résiduels

README annoncé avant développement ; api-permissions, backend-api, stratégie de tests et
source MEP-037 relient matrice et preuves. Agent-rules, charte, DoD et fondamentaux relus :
responsabilités/architecture et exigences conservées, aucune réécriture nécessaire.
Pas de modèle, migration, dépendance, nouveau rôle, écran ni modification du pipeline.
La limite 200 lignes s'applique à chaque fichier maintenu.
Les risques et arbitrages restants sont ceux de la matrice ; MEP-038 et MEP-040 restent ouverts.
Le menu d'une session déjà chargée se rafraîchit au rechargement ; le serveur applique
immédiatement les changements légitimes de rôle.
