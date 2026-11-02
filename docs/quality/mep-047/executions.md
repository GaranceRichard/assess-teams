# Exécutions locales MEP-047 — extraits vérifiés

Extraits des sorties originales identifiées dans [l’inventaire](preuves.md), campagne du 2026-11-01, Codex.
SHA : `2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`. Aucune nouvelle exécution applicative lors de la clôture.

## Backend

Commande : Python du venv, `-m pytest -v --junitxml=../.cache/mep-047/backend.xml`.
Sélection des onze fichiers donnée par chaque identifiant ci-dessous.
54 tests, 0 échec ; résumé original : `54 passed in 51.52s`.

| Test collecté et exécuté | Résultat |
| --- | --- |
| `tests.test_results::test_only_versions_with_accessible_completed_runs_are_listed` | Passé |
| `tests.test_results::test_snapshot_order_extremes_and_archive_survive_live_model_changes` | Passé |
| `tests.test_results::test_latest_completion_per_team_ignores_due_creation_revision_and_unfinished_runs` | Passé |
| `tests.test_results::test_equal_completion_dates_choose_greatest_run_id` | Passé |
| `tests.test_results::test_query_count_is_constant_with_multiple_teams` | Passé |
| `tests.test_results::test_no_completed_run_is_not_a_comparison_and_unknown_version_is_not_found` | Passé |
| `tests.test_results::test_incompatible_or_incomplete_latest_snapshot_never_falls_back_to_old_run` | Passé |
| `tests.test_results::test_empty_snapshot_and_empty_scope_have_no_usable_result` | Passé |
| `tests.test_results_security::test_admin_isolation_and_forged_version_team_run_question_ids` | Passé |
| `tests.test_results_security::test_superadmin_sees_global_results_and_separate_versions` | Passé |
| `tests.test_results_security::test_coach_uses_existing_assignment_scope_before_choosing_latest_run` | Passé |
| `tests.test_results_security::test_viewer_consults_results_but_anonymous_and_inactive_are_denied` | Passé |
| `tests.test_result_longitudinal::test_organization_family_selects_highest_version_with_results_not_latest_completion` | Passé |
| `tests.test_result_longitudinal::test_history_has_every_completed_observation_in_chronological_order_and_snapshot_values` | Passé |
| `tests.test_result_longitudinal::test_copied_criterion_keeps_continuity_but_same_text_new_question_does_not` | Passé |
| `tests.test_result_longitudinal::test_history_has_distinct_series_and_rejects_a_team_with_only_older_version_results` | Passé |
| `tests.test_result_longitudinal_security::test_admin_isolation_rejects_forged_organization_family_team_and_lineage` | Passé |
| `tests.test_result_longitudinal_security::test_coach_scope_applies_before_latest_version_and_history_selection` | Passé |
| `tests.test_result_longitudinal_security::test_superadmin_selects_organization_and_viewer_consults_own_results` | Passé |
| `tests.test_result_longitudinal_security::test_family_query_requires_a_valid_organization[query0]` | Passé |
| `tests.test_result_longitudinal_security::test_family_query_requires_a_valid_organization[query1]` | Passé |
| `tests.test_result_longitudinal_security::test_family_query_requires_a_valid_organization[query2]` | Passé |
| `tests.test_result_longitudinal_security::test_history_refuses_malformed_team_ids[ids0]` | Passé |
| `tests.test_result_longitudinal_security::test_history_refuses_malformed_team_ids[ids1]` | Passé |
| `tests.test_result_longitudinal_security::test_history_refuses_malformed_team_ids[ids2]` | Passé |
| `tests.test_result_version_selection_security::test_explicit_versions_preserve_role_scope_and_reject_wrong_family[superadmin]` | Passé |
| `tests.test_result_version_selection_security::test_explicit_versions_preserve_role_scope_and_reject_wrong_family[admin]` | Passé |
| `tests.test_result_version_selection_security::test_explicit_versions_preserve_role_scope_and_reject_wrong_family[coach]` | Passé |
| `tests.test_result_version_selection_security::test_explicit_versions_preserve_role_scope_and_reject_wrong_family[viewer]` | Passé |
| `tests.test_result_version_selection_security::test_malformed_version_is_rejected_instead_of_falling_back[oops]` | Passé |
| `tests.test_result_version_selection_security::test_malformed_version_is_rejected_instead_of_falling_back[]` | Passé |
| `tests.test_result_version_selection_security::test_malformed_version_is_rejected_instead_of_falling_back[0]` | Passé |
| `tests.test_result_version_selection_security::test_malformed_version_is_rejected_instead_of_falling_back[-1]` | Passé |
| `tests.test_result_version_selection_security::test_history_rejects_version_without_completed_results` | Passé |
| `tests.test_result_archived_versions::test_available_versions_include_archives_but_exclude_versions_without_completed_results` | Passé |
| `tests.test_result_archived_versions::test_exact_archived_radar_uses_own_snapshots_teams_scores_and_preserves_all_records` | Passé |
| `tests.test_result_archived_versions::test_archived_history_accepts_its_own_teams_and_removed_criteria_only_by_explicit_lineage` | Passé |
| `tests.test_result_history_missing::test_history_omits_missing_scores_and_unrelated_lineages_without_padding_teams` | Passé |
| `tests.test_result_history_missing::test_history_omits_old_missing_scores_and_preserves_the_measured_current_zero` | Passé |
| `tests.test_question_lineage::test_copy_and_draft_edits_preserve_lineage_and_new_question_gets_its_own` | Passé |
| `tests.test_question_lineage::test_source_and_lineage_are_snapshotted_and_not_read_from_the_current_question` | Passé |
| `tests.test_question_lineage::test_a_version_cannot_contain_the_same_lineage_twice` | Passé |
| `tests.test_viewer_results::test_viewer_reads_completed_versions_and_teams_without_assignment` | Passé |
| `tests.test_viewer_results::test_viewer_longitudinal_is_completed_only_and_rejects_foreign_ids` | Passé |
| `tests.test_viewer_results::test_viewer_loses_results_when_membership_or_active_status_is_removed` | Passé |
| `tests.test_viewer_results::test_viewer_cannot_mutate_results_or_administration[post]` | Passé |
| `tests.test_viewer_results::test_viewer_cannot_mutate_results_or_administration[put]` | Passé |
| `tests.test_viewer_results::test_viewer_cannot_mutate_results_or_administration[patch]` | Passé |
| `tests.test_viewer_results::test_viewer_cannot_mutate_results_or_administration[delete]` | Passé |
| `tests.test_viewer_results::test_viewer_cannot_read_administration_even_in_own_organization` | Passé |
| `tests.test_viewer_results::test_viewer_rejects_inconsistent_cross_organization_run_references[evaluation_id]` | Passé |
| `tests.test_viewer_results::test_viewer_rejects_inconsistent_cross_organization_run_references[team_id]` | Passé |
| `tests.test_results_openapi::test_results_schema_is_read_only_scoped_and_documents_scores` | Passé |
| `tests.test_result_longitudinal_openapi::test_openapi_documents_organization_family_and_explicit_criterion_history` | Passé |

## React

Commandes : `npm.cmd run test:quick --prefix frontend -- <sélection> --reporter=verbose`.
Dix fichiers, 35 tests : 27 dans `react.log`, puis 8 dans `react-complement.log`.
Les API et graphiques sont doublés dans ces tests ; aucune preuve HTTP/visuelle n’en est déduite.

| Test exécuté, fichier et libellé de sortie | Résultat |
| --- | --- |
| `src/ResultsPageErrors.test.tsx > shows organizations loading failures` | Passé |
| `src/ResultsPageErrors.test.tsx > shows families loading failures` | Passé |
| `src/ResultsPageErrors.test.tsx > shows empty accessible organizations and families` | Passé |
| `src/ResultsPageErrors.test.tsx > shows comparison loading, failure and recovery on another selection` | Passé |
| `src/ResultsPageErrors.test.tsx > shows a damaged empty snapshot without drawing scores` | Passé |
| `src/ResultsTabs.test.tsx > separates radar from scores and preserves shared selections when switching views` | Passé |
| `src/ResultsPageErrors.test.tsx > keeps axes even if no latest team snapshot is usable` | Passé |
| `src/ResultsTabs.test.tsx > supports arrow, Home and End keys with roving focus and does not invent scores with no team selected` | Passé |
| `src/ResultsTabs.test.tsx > never offers tabs or stale scores when the comparison is refused` | Passé |
| `src/ResultsArchivedVersions.test.tsx > defaults to latest results, then shows archived snapshots and resets incompatible selections on return` | Passé |
| `src/ResultsLongitudinal.test.tsx > loads history only on criterion opening and returns with model and team selections intact` | Passé |
| `src/ResultsPageErrors.test.tsx > ignores stale comparison success` | Passé |
| `src/ResultsPageErrors.test.tsx > ignores stale comparison error` | Passé |
| `src/ResultsPageErrors.test.tsx > ignores a pending organization list success after unmount` | Passé |
| `src/ResultsPageErrors.test.tsx > ignores a pending organization list error after unmount` | Passé |
| `src/ResultsArchivedVersions.test.tsx > keeps a failed explicit archive selected without falling back to recent results` | Passé |
| `src/ResultsArchivedVersions.test.tsx > ignores an obsolete archived-version success after selecting v2` | Passé |
| `src/ResultsLongitudinal.test.tsx > shows zero selected teams without inventing any observation` | Passé |
| `src/ResultsArchivedVersions.test.tsx > ignores an obsolete archived-version error after selecting v2` | Passé |
| `src/ResultsLongitudinal.test.tsx > shows history failures and lets the user return to the radar` | Passé |
| `src/ResultsLongitudinal.test.tsx > ignores obsolete history success after changing team selection` | Passé |
| `src/ResultsLongitudinal.test.tsx > ignores obsolete history error after changing team selection` | Passé |
| `src/ResultsIntent.test.tsx > preselects accessible organization, family and eligible team without changing Results calculations` | Passé |
| `src/ResultsIntent.test.tsx > explains when the source team has no usable result on the current family radar` | Passé |
| `src/ResultsIntent.test.tsx > does not preselect an inaccessible organization or family` | Passé |
| `src/ResultsSelectionRace.test.tsx > ignores obsolete family list success on organization switch` | Passé |
| `src/ResultsSelectionRace.test.tsx > ignores obsolete family list error on organization switch` | Passé |
| `src/ResultsViewsTransitions.test.tsx > controls analysis selection and keeps restitution independent` | Passé |
| `src/ResultsTemporalCorrection.test.tsx > changes the displayed analysis through a controlled, labelled selector in all four combinations` | Passé |
| `src/ResultsTemporalCorrection.test.tsx > renders chronological, independent team columns with blank missing cells and real zero scores` | Passé |
| `src/ResultsTemporalCorrection.test.tsx > keeps empty historical series empty without inventing a zero observation` | Passé |
| `src/ResultsScoreReading.test.tsx > explains scores, real zero, missing observations and business recency in every restitution` | Passé |
| `src/ResultsViewsTransitions.test.tsx > never offers longitudinal continuity for a criterion without an explicit lineage` | Passé |
| `src/ResultsViewsTransitions.test.tsx > keeps a refused history visible across restitutions without presenting stale data` | Passé |
| `src/ResultsOrganizations.test.tsx > Superadmin explicitly chooses organization; changing it clears model, teams and longitudinal` | Passé |

## E2E Chromium, Django et base dédiés

Configuration temporaire hors suivi : mêmes specs/assertions que le dépôt, serveurs directs isolés,
fuseau America/Toronto et sorties locales ; aucun bootstrap/hook partagé appelé par le lanceur final.

| Campagne | Début UTC | Passés | Ignorés / inattendus / flaky |
| --- | --- | ---: | --- |
| `e2e-direct.json` | 2026-11-01T23:35:54.339Z | 6 | 0 / 0 / 0 |
| `ux09.json` | 2026-11-01T23:38:38.735Z | 1 | 0 / 0 / 0 |

Sélection : `results-archived-versions.spec.ts` (2), `results-longitudinal.spec.ts` (1),
`results-layout.spec.ts` (1), `results-history-layout.spec.ts` (1), `viewer-results.spec.ts` (1),
puis `results-score-reading.spec.ts` (1) : sept E2E en tout.
UX-09 : 32 mesures, palette Vert, clair/sombre, 1280×720, 1920×1080, 1280×480, 390×844,
navigation clavier de l’aide et sélection conservée ; zoom déclaré 100 %.

Les captures UX-09 après aide peuvent saisir la fermeture transitoire : réserve O2 de la [clôture](README.md).
Les sorties initiales d’orchestration incomplète ne sont pas utilisées comme gate réussi.
Aucune de ces exécutions n’est un PV MESS ; CI et DoD documentaire sont distinctes.
