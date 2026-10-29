# Index des preuves — audit du 27 octobre 2026

Base examinée : `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6` (`origin/main` récupéré au démarrage).
Les chemins ci-dessous désignent des sources suivies à ce SHA. Les assertions décrivent ce que couvrent
les tests lus et les rapports référencés ; cet audit documentaire ne les réexécute pas et ne certifie pas une
nouvelle campagne verte. Les rapports datés conservent leurs résultats et leurs limites historiques.
Une preuve sur un ancien SHA ne devient preuve du candidat courant qu’après rapprochement des entrées
et de la sélection, selon la politique du dépôt ; aucune expiration temporelle n’est ajoutée.

[Rapprochement exécuté](preuves-reutilisation.md) : douze SHAs du registre intégrés ; 19/26 entrées MEP-013 identiques, sept modifiées.

## auth

**Accès et mots de passe.** Session valide/CSRF/logout ; réponse de récupération générique ; token expiré/consommé refusé ; changement personnel et sessions multiples.

- Code/contrat : [backend/identities/adapters/api/session_views.py](../../../../backend/identities/adapters/api/session_views.py), [backend/identities/application/passwords.py](../../../../backend/identities/application/passwords.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_product_session.py](../../../../backend/tests/test_product_session.py), [backend/tests/test_password_contract.py](../../../../backend/tests/test_password_contract.py), [backend/tests/test_password_concurrency.py](../../../../backend/tests/test_password_concurrency.py), [frontend/e2e/passwords.spec.ts](../../../../frontend/e2e/passwords.spec.ts).
- Rapports, décisions et limites : [docs/architecture/password-management.md](../../../../docs/architecture/password-management.md), [docs/architecture/login-security.md](../../../../docs/architecture/login-security.md).

## identites

**Identités et lifecycle.** Création technique sans mail/noms, invitation avec email ; liste/PUT et refus de rôle ; dernier Admin actif protégé ; pas de GET détail dans la classe, noms absents du serializer de gestion.

- Code/contrat : [backend/identities/adapters/api/admin_views.py](../../../../backend/identities/adapters/api/admin_views.py), [backend/identities/adapters/api/admin_serializers.py](../../../../backend/identities/adapters/api/admin_serializers.py), [backend/identities/application/lifecycle.py](../../../../backend/identities/application/lifecycle.py), [creation technique](../../../../backend/identities/adapters/api/views.py), [serializer technique](../../../../backend/identities/adapters/api/serializers.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_managed_users.py](../../../../backend/tests/test_managed_users.py), [backend/tests/test_managed_user_permissions.py](../../../../backend/tests/test_managed_user_permissions.py), [backend/tests/test_user_lifecycle.py](../../../../backend/tests/test_user_lifecycle.py), [backend/tests/test_user_lifecycle_concurrency.py](../../../../backend/tests/test_user_lifecycle_concurrency.py), [frontend/e2e/user-lifecycle.spec.ts](../../../../frontend/e2e/user-lifecycle.spec.ts), [creation et validation](../../../../backend/tests/test_user_creation_validation.py).
- Rapports, décisions et limites : [docs/architecture/user-lifecycle.md](../../../../docs/architecture/user-lifecycle.md).

## organisations

**Organisations et rattachements.** Création et liens atomiques, nom non unique, renommage ; suppression vide conserve les comptes ; refus des rôles et IDs étrangers. Pas de politique générale des dépendances démontrée.

- Code/contrat : [backend/identities/adapters/api/organization_views.py](../../../../backend/identities/adapters/api/organization_views.py), [backend/identities/adapters/api/organization_detail_views.py](../../../../backend/identities/adapters/api/organization_detail_views.py), [backend/identities/membership_invariants.py](../../../../backend/identities/membership_invariants.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_organizations.py](../../../../backend/tests/test_organizations.py), [backend/tests/test_organization_rename.py](../../../../backend/tests/test_organization_rename.py), [backend/tests/test_organization_delete.py](../../../../backend/tests/test_organization_delete.py), [backend/tests/test_admin_organization_scope.py](../../../../backend/tests/test_admin_organization_scope.py), [frontend/e2e/organizations.spec.ts](../../../../frontend/e2e/organizations.spec.ts).
- Rapports, décisions et limites : [docs/architecture/organization-isolation.md](../../../../docs/architecture/organization-isolation.md).

## equipes

**Équipes et Coachs courants.** Créer/renommer/archiver avec Coachs locaux ; unicité incluant archives ; Coach/Viewer gestion refusée ; GET détail/réactivation absents, second DELETE filtré en 404.

- Code/contrat : [backend/teams/adapters/api/views.py](../../../../backend/teams/adapters/api/views.py), [backend/teams/adapters/api/scope.py](../../../../backend/teams/adapters/api/scope.py), [backend/teams/adapters/api/serializers.py](../../../../backend/teams/adapters/api/serializers.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_teams.py](../../../../backend/tests/test_teams.py), [backend/tests/test_isolation_regressions.py](../../../../backend/tests/test_isolation_regressions.py), [frontend/e2e/teams.spec.ts](../../../../frontend/e2e/teams.spec.ts), [frontend/src/TeamPage.test.tsx](../../../../frontend/src/TeamPage.test.tsx).
- Rapports, décisions et limites : [docs/architecture/backend-api.md](../../../../docs/architecture/backend-api.md).

## modeles

**Modèles, versions et repères.** DRAFT complet validable, transitions/immutabilité et refus ; versions concurrentes distinctes ; copie/lignée/snapshots ; repère inférieur sans texte inventé.

- Code/contrat : [backend/assessments/adapters/api/lifecycle_views.py](../../../../backend/assessments/adapters/api/lifecycle_views.py), [backend/assessments/application/versioning.py](../../../../backend/assessments/application/versioning.py), [backend/assessments/adapters/api/marker_serializers.py](../../../../backend/assessments/adapters/api/marker_serializers.py), [CRUD modeles](../../../../backend/assessments/adapters/api/views.py), [questions](../../../../backend/assessments/adapters/api/question_views.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_evaluation_lifecycle.py](../../../../backend/tests/test_evaluation_lifecycle.py), [backend/tests/test_evaluation_version_concurrency.py](../../../../backend/tests/test_evaluation_version_concurrency.py), [backend/tests/test_appreciation_marker_history.py](../../../../backend/tests/test_appreciation_marker_history.py), [frontend/e2e/evaluation-versions.spec.ts](../../../../frontend/e2e/evaluation-versions.spec.ts), [frontend/e2e/appreciation-markers.spec.ts](../../../../frontend/e2e/appreciation-markers.spec.ts), [CRUD](../../../../backend/tests/test_evaluations.py), [reperes](../../../../backend/tests/test_appreciation_markers.py).
- Rapports, décisions et limites : [docs/architecture/evaluation-versioning.md](../../../../docs/architecture/evaluation-versioning.md), [docs/architecture/appreciation-markers.md](../../../../docs/architecture/appreciation-markers.md).

## planning

**Planification.** Modes immédiat/fixe/mensuel/trimestriel, scope et responsable éligible ; replanification ponctuelle ; calendrier avancé par mise en file, pas par complétion.

- Code/contrat : [backend/assessments/adapters/api/schedule_views.py](../../../../backend/assessments/adapters/api/schedule_views.py), [backend/assessments/adapters/api/schedule_serializers.py](../../../../backend/assessments/adapters/api/schedule_serializers.py), [backend/assessments/application/schedule_notifications.py](../../../../backend/assessments/application/schedule_notifications.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_evaluation_schedules.py](../../../../backend/tests/test_evaluation_schedules.py), [backend/tests/test_evaluation_replanning.py](../../../../backend/tests/test_evaluation_replanning.py), [backend/tests/test_evaluation_schedule_openapi.py](../../../../backend/tests/test_evaluation_schedule_openapi.py), [frontend/e2e/planning.spec.ts](../../../../frontend/e2e/planning.spec.ts).
- Rapports, décisions et limites : [docs/architecture/evaluations-api.md](../../../../docs/architecture/evaluations-api.md), [docs/architecture/email-notifications.md](../../../../docs/architecture/email-notifications.md).

## passation

**Passation et provenance.** Snapshot au démarrage ; sauvegarde/reprise ; complétion incomplète refusée ; révision remplace notes, auteur initial et dernier réviseur conservés, pas historique exhaustif.

- Code/contrat : [backend/assessments/application/taking.py](../../../../backend/assessments/application/taking.py), [backend/assessments/application/taking_scope.py](../../../../backend/assessments/application/taking_scope.py), [frontend/src/useEvaluationTaking.ts](../../../../frontend/src/useEvaluationTaking.ts).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_evaluation_taking.py](../../../../backend/tests/test_evaluation_taking.py), [backend/tests/test_evaluation_revision.py](../../../../backend/tests/test_evaluation_revision.py), [backend/tests/test_evaluation_taking_access_changes.py](../../../../backend/tests/test_evaluation_taking_access_changes.py), [frontend/e2e/evaluation-taking.spec.ts](../../../../frontend/e2e/evaluation-taking.spec.ts).
- Rapports, décisions et limites : [docs/architecture/evaluation-taking.md](../../../../docs/architecture/evaluation-taking.md).

## resultats

**Résultats et comparaisons.** Version exacte, dernière completed_at/ID ; archives, null/0, lignée explicite ; sélection conservée entre vues et réinitialisée au changement ; tableau et styles de séries distincts.

- Code/contrat : [backend/assessments/application/results.py](../../../../backend/assessments/application/results.py), [backend/assessments/application/result_history.py](../../../../backend/assessments/application/result_history.py), [frontend/src/useResultSelection.ts](../../../../frontend/src/useResultSelection.ts), [frontend/src/ResultsRadar.tsx](../../../../frontend/src/ResultsRadar.tsx), [frontend/src/resultRadarConfig.ts](../../../../frontend/src/resultRadarConfig.ts).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_results_security.py](../../../../backend/tests/test_results_security.py), [backend/tests/test_result_longitudinal_security.py](../../../../backend/tests/test_result_longitudinal_security.py), [backend/tests/test_result_archived_versions.py](../../../../backend/tests/test_result_archived_versions.py), [frontend/src/ResultsArchivedVersions.test.tsx](../../../../frontend/src/ResultsArchivedVersions.test.tsx), [frontend/e2e/results-layout.spec.ts](../../../../frontend/e2e/results-layout.spec.ts), [frontend/e2e/results-archived-versions.spec.ts](../../../../frontend/e2e/results-archived-versions.spec.ts).
- Rapports, décisions et limites : [docs/architecture/results-api.md](../../../../docs/architecture/results-api.md), [docs/quality/results-hierarchy.md](../../../../docs/quality/results-hierarchy.md), [docs/quality/mep-046/README.md](../../../../docs/quality/mep-046/README.md).

## pilotage

**Pilotage.** Cinq cartes définies et date de référence ; équipes actives et attentes persistées ; drill-down autorisé, absences explicites ; aucun KPI individuel ou score global.

- Code/contrat : [backend/assessments/application/steering.py](../../../../backend/assessments/application/steering.py), [frontend/src/SteeringSummary.tsx](../../../../frontend/src/SteeringSummary.tsx), [frontend/src/SteeringTeams.tsx](../../../../frontend/src/SteeringTeams.tsx).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_steering.py](../../../../backend/tests/test_steering.py), [backend/tests/test_steering_security.py](../../../../backend/tests/test_steering_security.py), [frontend/src/SteeringPage.test.tsx](../../../../frontend/src/SteeringPage.test.tsx), [frontend/src/ResultsIntent.test.tsx](../../../../frontend/src/ResultsIntent.test.tsx), [frontend/e2e/steering.spec.ts](../../../../frontend/e2e/steering.spec.ts).
- Rapports, décisions et limites : [docs/architecture/steering-api.md](../../../../docs/architecture/steering-api.md).

## dashboard

**Accueil personnel.** Identité réelle, dix événements maximum, rôles/scopes et auteurs masqués Viewer ; préférence de palette restaurée ; ce n’est pas la supervision de tout le dispositif.

- Code/contrat : [backend/assessments/application/dashboard.py](../../../../backend/assessments/application/dashboard.py), [frontend/src/DashboardPage.tsx](../../../../frontend/src/DashboardPage.tsx), [frontend/src/DashboardActivity.tsx](../../../../frontend/src/DashboardActivity.tsx).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_dashboard_security.py](../../../../backend/tests/test_dashboard_security.py), [frontend/src/DashboardPage.test.tsx](../../../../frontend/src/DashboardPage.test.tsx), [frontend/e2e/dashboard.spec.ts](../../../../frontend/e2e/dashboard.spec.ts), [frontend/e2e/palettes.spec.ts](../../../../frontend/e2e/palettes.spec.ts).
- Rapports, décisions et limites : [docs/architecture/dashboard-api.md](../../../../docs/architecture/dashboard-api.md).

## notifications

**Notifications durables.** Intention persistée, clé d’événement et remise séparée ; échec SMTP sans annuler succès métier ; reprises bornées. Pas de préférences multicanal ni fenêtre de rappel livrées.

- Code/contrat : [backend/notifications/queue.py](../../../../backend/notifications/queue.py), [backend/notifications/delivery.py](../../../../backend/notifications/delivery.py), [backend/assessments/application/schedule_notifications.py](../../../../backend/assessments/application/schedule_notifications.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_schedule_notifications.py](../../../../backend/tests/test_schedule_notifications.py), [backend/tests/test_email_queue.py](../../../../backend/tests/test_email_queue.py), [backend/tests/test_email_smtp.py](../../../../backend/tests/test_email_smtp.py), [backend/tests/test_email_concurrency.py](../../../../backend/tests/test_email_concurrency.py).
- Rapports, décisions et limites : [docs/architecture/email-notifications.md](../../../../docs/architecture/email-notifications.md).

## journaux

**Journaux, conservation et purge.** HTTP nettoyé distinct du métier ; filtres/scopes ; purge technique bornée et autorisée, reçus atomiques ; preuves métier non purgées sans politique.

- Code/contrat : [backend/journals/middleware.py](../../../../backend/journals/middleware.py), [backend/journals/adapters/api/views.py](../../../../backend/journals/adapters/api/views.py), [backend/journals/purge.py](../../../../backend/journals/purge.py), [backend/config/journal_retention.py](../../../../backend/config/journal_retention.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_http_logs.py](../../../../backend/tests/test_http_logs.py), [backend/tests/test_log_filters.py](../../../../backend/tests/test_log_filters.py), [backend/tests/test_journal_purge_refusals.py](../../../../backend/tests/test_journal_purge_refusals.py), [backend/tests/test_journal_purge_processes.py](../../../../backend/tests/test_journal_purge_processes.py), [frontend/e2e/http-logs.spec.ts](../../../../frontend/e2e/http-logs.spec.ts), [Journal metier](../../../../backend/tests/test_activity_journal.py), [E2E journaux](../../../../frontend/e2e/journals.spec.ts).
- Rapports, décisions et limites : [docs/architecture/journals-api.md](../../../../docs/architecture/journals-api.md), [docs/operations/configuration/journal-retention-validation.md](../../../../docs/operations/configuration/journal-retention-validation.md), [docs/operations/journal-purge-validation.md](../../../../docs/operations/journal-purge-validation.md).

## configuration

**Configuration production.** Secrets/HTTP/SMTP validés au démarrage ; diagnostics confidentiels ; inventaire MEP-036. Environnement/constantes ne valent pas contrat et chargeur unique MESS.

- Code/contrat : [backend/config/settings_base.py](../../../../backend/config/settings_base.py), [backend/config/settings_production.py](../../../../backend/config/settings_production.py), [backend/config/startup_security.py](../../../../backend/config/startup_security.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_startup_security.py](../../../../backend/tests/test_startup_security.py), [backend/tests/test_startup_secrets.py](../../../../backend/tests/test_startup_secrets.py), [backend/tests/test_startup_email.py](../../../../backend/tests/test_startup_email.py).
- Rapports, décisions et limites : [docs/operations/configuration/README.md](../../../../docs/operations/configuration/README.md), [docs/operations/configuration/startup-validation.md](../../../../docs/operations/configuration/startup-validation.md).

## isolation

**Isolation, rôles et accès indirects.** IDs forgés, rattachement changé et historique ; refus sans effet et sans donnée étrangère ; navigation et API distinctes. Aucun export métier à inventer.

- Code/contrat : [backend/identities/adapters/api/managed_user_scope.py](../../../../backend/identities/adapters/api/managed_user_scope.py), [backend/assessments/application/taking_scope.py](../../../../backend/assessments/application/taking_scope.py), [backend/assessments/application/results.py](../../../../backend/assessments/application/results.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_api_role_matrix.py](../../../../backend/tests/test_api_role_matrix.py), [backend/tests/test_isolation_reads.py](../../../../backend/tests/test_isolation_reads.py), [backend/tests/test_isolation_mutations.py](../../../../backend/tests/test_isolation_mutations.py), [backend/tests/test_indirect_access_history.py](../../../../backend/tests/test_indirect_access_history.py), [frontend/e2e/indirect-access.spec.ts](../../../../frontend/e2e/indirect-access.spec.ts).
- Rapports, décisions et limites : [docs/architecture/organization-isolation-validation.md](../../../../docs/architecture/organization-isolation-validation.md), [docs/architecture/role-permissions-validation.md](../../../../docs/architecture/role-permissions-validation.md), [docs/architecture/indirect-access-validation.md](../../../../docs/architecture/indirect-access-validation.md).

## sqlite

**SQLite et conflits.** Fichiers SQLite/processus distincts ; DELETE/FULL/5 s ; reprises bornées et conflits métier ; preuve locale ne fixe pas la capacité MESS.

- Code/contrat : [backend/config/sqlite_contention.py](../../../../backend/config/sqlite_contention.py), [backend/identities/application/lifecycle.py](../../../../backend/identities/application/lifecycle.py), [backend/tools/sqlite_load.py](../../../../backend/tools/sqlite_load.py).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_sqlite_contention.py](../../../../backend/tests/test_sqlite_contention.py), [backend/tests/test_sqlite_critical_conflicts.py](../../../../backend/tests/test_sqlite_critical_conflicts.py), [backend/tests/test_sqlite_replay_safety.py](../../../../backend/tests/test_sqlite_replay_safety.py).
- Rapports, décisions et limites : [docs/operations/sqlite/README.md](../../../../docs/operations/sqlite/README.md), [docs/operations/sqlite/contention-validation.md](../../../../docs/operations/sqlite/contention-validation.md), [docs/operations/sqlite/critical-conflicts-validation.md](../../../../docs/operations/sqlite/critical-conflicts-validation.md).

## publication

**Publication et historique F04.** Circuit dédié→main direct et CI exacte après intégration ; critères révisés 043 et réserve G05 acceptée ; contradiction de suivi 012 conservée, pas de nouvelle lecture distante revendiquée.

- Code/contrat : [scripts/publish.ps1](../../../../scripts/publish.ps1), [scripts/quality/main-protection.mjs](../../../../scripts/quality/main-protection.mjs), [scripts/quality/wait-ci.mjs](../../../../scripts/quality/wait-ci.mjs).
- Tests nommés (nominal et refus à lire séparément) : [scripts/quality/tests/direct-publication.test.mjs](../../../../scripts/quality/tests/direct-publication.test.mjs), [scripts/quality/tests/validation-publish.test.mjs](../../../../scripts/quality/tests/validation-publish.test.mjs).
- Rapports, décisions et limites : [docs/quality/mep-012/README.md](../../../../docs/quality/mep-012/README.md), [docs/quality/mep-043/closure.md](../../../../docs/quality/mep-043/closure.md), [docs/quality/mep-043/delivery.md](../../../../docs/quality/mep-043/delivery.md), [docs/quality/ci.md](../../../../docs/quality/ci.md).

## notation

**Notation et sauvegarde.** Choix explicite, attente/erreur/succès, réessai et reload ; fermeture protégée ; géométrie de refus mesurée. Captures historiques de refus 390×844 clair inspectées dans cet audit ; pas de nouvelle exécution.

- Code/contrat : [frontend/src/useEvaluationTaking.ts](../../../../frontend/src/useEvaluationTaking.ts), [frontend/src/EvaluationTakingDialog.tsx](../../../../frontend/src/EvaluationTakingDialog.tsx), [frontend/src/TakingStatusSizing.tsx](../../../../frontend/src/TakingStatusSizing.tsx).
- Tests nommés (nominal et refus à lire séparément) : [frontend/src/EvaluationTakingNavigation.test.tsx](../../../../frontend/src/EvaluationTakingNavigation.test.tsx), [frontend/e2e/dialog-taking-accessibility.spec.ts](../../../../frontend/e2e/dialog-taking-accessibility.spec.ts), [frontend/e2e/evaluation-taking-layout.spec.ts](../../../../frontend/e2e/evaluation-taking-layout.spec.ts), [frontend/e2e/evaluation-rating-refusal.spec.ts](../../../../frontend/e2e/evaluation-rating-refusal.spec.ts).
- Rapports, décisions et limites : [docs/quality/mep-044/README.md](../../../../docs/quality/mep-044/README.md), [docs/quality/mep-013/README.md](../../../../docs/quality/mep-013/README.md), [docs/quality/mep-013/executions.md](../../../../docs/quality/mep-013/executions.md), [docs/quality/mep-013/sources.md](../../../../docs/quality/mep-013/sources.md).

## themes

**Thèmes et typographie.** Dix palettes/deux thèmes, contrastes et préférences ; zoom réel documenté. Rendu humain et mesures distincts d’une assertion automatisée.

- Code/contrat : [frontend/src/light-appearance.css](../../../../frontend/src/light-appearance.css), [frontend/src/dark-appearance.css](../../../../frontend/src/dark-appearance.css), [frontend/src/product-typography.css](../../../../frontend/src/product-typography.css).
- Tests nommés (nominal et refus à lire séparément) : [frontend/e2e/light-theme.spec.ts](../../../../frontend/e2e/light-theme.spec.ts), [frontend/e2e/dark-theme.spec.ts](../../../../frontend/e2e/dark-theme.spec.ts), [frontend/e2e/typography.spec.ts](../../../../frontend/e2e/typography.spec.ts).
- Rapports, décisions et limites : [docs/quality/light-theme.md](../../../../docs/quality/light-theme.md), [docs/quality/dark-theme.md](../../../../docs/quality/dark-theme.md), [docs/quality/typography.md](../../../../docs/quality/typography.md).

## shell

**Responsive et états.** États attente/vide/erreur, pagination et scopes tardifs ; scrolls/focus ; transitions déjà livrées le 27 octobre. Couverture partielle à compléter par cellules précises, sans présumer défaut.

- Code/contrat : [frontend/src/CollectionFrame.tsx](../../../../frontend/src/CollectionFrame.tsx), [frontend/src/usePagedCollection.ts](../../../../frontend/src/usePagedCollection.ts), [frontend/src/ProductSidebar.tsx](../../../../frontend/src/ProductSidebar.tsx), [frontend/src/Modal.tsx](../../../../frontend/src/Modal.tsx).
- Tests nommés (nominal et refus à lire séparément) : [frontend/src/usePagedCollection.test.tsx](../../../../frontend/src/usePagedCollection.test.tsx), [frontend/src/ResultsSelectionRace.test.tsx](../../../../frontend/src/ResultsSelectionRace.test.tsx), [frontend/e2e/shell-states.spec.ts](../../../../frontend/e2e/shell-states.spec.ts), [frontend/e2e/sidebar-layout.spec.ts](../../../../frontend/e2e/sidebar-layout.spec.ts), [frontend/e2e/product-shell.spec.ts](../../../../frontend/e2e/product-shell.spec.ts).
- Rapports, décisions et limites : [docs/architecture/product-layout.md](../../../../docs/architecture/product-layout.md), [docs/architecture/dialog-accessibility.md](../../../../docs/architecture/dialog-accessibility.md), [docs/quality/ux-acceptance.md](../../../../docs/quality/ux-acceptance.md), [docs/quality/ux-transitions/mesures.md](../../../../docs/quality/ux-transitions/mesures.md).

## installation

**Installation et distribution.** Base sous backend, requirements par intervalles, bootstrap pip réseau ; endpoints/migrations acquis ; aucun installateur/package/wheelhouse/service/backup/restore/rollback MESS qualifié identifié dans l’arbre suivi.

- Code/contrat : [backend/config/settings_base.py](../../../../backend/config/settings_base.py), [backend/config/settings_production.py](../../../../backend/config/settings_production.py), [scripts/bootstrap/backend.ps1](../../../../scripts/bootstrap/backend.ps1), [frontend/package.json](../../../../frontend/package.json), [backend/requirements.txt](../../../../backend/requirements.txt).
- Tests nommés (nominal et refus à lire séparément) : [backend/tests/test_health.py](../../../../backend/tests/test_health.py), [backend/tests/test_openapi.py](../../../../backend/tests/test_openapi.py), [backend/tests/test_development_accounts.py](../../../../backend/tests/test_development_accounts.py).
- Rapports, décisions et limites : [docs/operations/installation-prerequisites.md](../../../../docs/operations/installation-prerequisites.md), [docs/operations/installation-prerequisites-validation.md](../../../../docs/operations/installation-prerequisites-validation.md).

## guides

**Guides et transfert.** Licence/notices/inventaire acquis ; guide du package à compléter après sa livraison. Aucun transfert de dépôt ni nouvelle CI déduit de la documentation de fork.

- Code/contrat : [README.md](../../../../README.md), [LICENSE](../../../../LICENSE), [NOTICE](../../../../NOTICE), [scripts/legal/npm-notices.mjs](../../../../scripts/legal/npm-notices.mjs).
- Tests nommés (nominal et refus à lire séparément) : [scripts/legal/npm-notices.test.mjs](../../../../scripts/legal/npm-notices.test.mjs), [backend/tests/test_legal_inventory.py](../../../../backend/tests/test_legal_inventory.py).
- Rapports, décisions et limites : [docs/legal/redistribution.md](../../../../docs/legal/redistribution.md), [docs/operations/installation-prerequisites-validation.md](../../../../docs/operations/installation-prerequisites-validation.md).

## recettes

**Cahiers et PV cible.** Cahiers FON/UX livrés, scénarios cible Non exécutés ; tests locaux nommés appuis, pas PV d’installation, sécurité, reprise ou GO.

- Code/contrat : [frontend/e2e/bootstrap.spec.ts](../../../../frontend/e2e/bootstrap.spec.ts), [frontend/e2e/evaluation-taking.spec.ts](../../../../frontend/e2e/evaluation-taking.spec.ts), [frontend/e2e/results.spec.ts](../../../../frontend/e2e/results.spec.ts).
- Tests nommés (nominal et refus à lire séparément) : [frontend/e2e/viewer-results.spec.ts](../../../../frontend/e2e/viewer-results.spec.ts), [frontend/e2e/steering.spec.ts](../../../../frontend/e2e/steering.spec.ts), [backend/tests/test_sqlite_critical_conflicts.py](../../../../backend/tests/test_sqlite_critical_conflicts.py).
- Rapports, décisions et limites : [docs/quality/functional-acceptance.md](../../../../docs/quality/functional-acceptance.md), [docs/quality/ux-acceptance.md](../../../../docs/quality/ux-acceptance.md), [docs/quality/functional-acceptance-review.md](../../../../docs/quality/functional-acceptance-review.md), [docs/backlog/tracking/mess-jalon.md](../../../../docs/backlog/tracking/mess-jalon.md).
