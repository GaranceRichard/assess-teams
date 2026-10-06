import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

from tests.migration_results_helpers import historic_result


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_lineage_migration_never_infers_historical_copies_from_equal_text_or_position():
    before = [("assessments", "0012_remove_evaluationschedule_schedule_unique_per_team_evaluation")]
    after = [("assessments", "0013_question_lineage")]
    executor = MigrationExecutor(connection)
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        question, run, snapshot = historic_result(apps)
        evaluation = question.evaluation
        copy = apps.get_model("assessments", "Evaluation").objects.create(
            organization=evaluation.organization,
            family=evaluation.family,
            index=2,
            version=2,
            name=evaluation.name,
            status="VALIDATED",
        )
        same_text = apps.get_model("assessments", "Question").objects.create(
            evaluation=copy, index=question.index, name=question.name
        )
        run_before = apps.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
        snapshot_before = (
            apps.get_model("assessments", "EvaluationRunQuestion")
            .objects.values()
            .get(pk=snapshot.pk)
        )
        MigrationExecutor(connection).migrate(after)
        migrated = MigrationExecutor(connection).loader.project_state(after).apps
        qmodel = migrated.get_model("assessments", "Question")
        original = qmodel.objects.get(pk=question.pk)
        copied = qmodel.objects.get(pk=same_text.pk)
        assert original.lineage_id != copied.lineage_id
        assert original.name == copied.name and original.index == copied.index
        current_run = (
            migrated.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
        )
        assert current_run == run_before
        current_snapshot = (
            migrated.get_model("assessments", "EvaluationRunQuestion")
            .objects.values()
            .get(pk=snapshot.pk)
        )
        assert current_snapshot.pop("lineage_id") == original.lineage_id
        assert current_snapshot == snapshot_before
        # Re-running the migration after rollback does not modify historical values.
        MigrationExecutor(connection).migrate(before)
        MigrationExecutor(connection).migrate(after)
        assert (
            migrated.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
            == run_before
        )
    finally:
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
