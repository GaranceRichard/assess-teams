import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

from tests.migration_results_helpers import historic_result


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_guides_migration_preserves_history_without_inventing_old_appreciations():
    before = [("assessments", "0014_evaluationschedule_requires_reassignment")]
    after = [("assessments", "0015_evaluationrunquestion_score_guides_and_more")]
    executor = MigrationExecutor(connection)
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        _, run, snapshot = historic_result(apps)
        snapshot_model = apps.get_model("assessments", "EvaluationRunQuestion")
        previous = snapshot_model.objects.values().get(pk=snapshot.pk)
        previous_run = (
            apps.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
        )
        MigrationExecutor(connection).migrate(after)
        current_apps = MigrationExecutor(connection).loader.project_state(after).apps
        current = (
            current_apps.get_model("assessments", "EvaluationRunQuestion")
            .objects.values()
            .get(pk=snapshot.pk)
        )
        assert current.pop("score_guides") == []
        assert current == previous
        assert (
            current_apps.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
            == previous_run
        )
        assert not current_apps.get_model("assessments", "QuestionScoreGuide").objects.exists()
    finally:
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
