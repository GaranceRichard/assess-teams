import pytest
from django.db import IntegrityError, connection, transaction
from django.db.migrations.executor import MigrationExecutor

from tests.migration_results_helpers import historic_result


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_replanning_migration_preserves_completed_runs_and_removes_only_schedule_uniqueness():
    before = [("assessments", "0011_evaluation_version_evaluationfamily_and_more")]
    after = [("assessments", "0012_remove_evaluationschedule_schedule_unique_per_team_evaluation")]
    executor = MigrationExecutor(connection)
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        _, run, snapshot = historic_result(apps)
        history = apps.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
        snapshot_history = (
            apps.get_model("assessments", "EvaluationRunQuestion")
            .objects.values()
            .get(pk=snapshot.pk)
        )
        schedule_fields = {
            "team_id": run.team_id,
            "evaluation_id": run.evaluation_id,
            "mode": run.schedule.mode,
            "first_due_date": run.due_date,
        }
        schedule_model = apps.get_model("assessments", "EvaluationSchedule")
        with pytest.raises(IntegrityError), transaction.atomic():
            schedule_model.objects.create(**schedule_fields)
        MigrationExecutor(connection).migrate(after)
        migrated = MigrationExecutor(connection).loader.project_state(after).apps
        run_model = migrated.get_model("assessments", "EvaluationRun")
        assert run_model.objects.values().get(pk=run.pk) == history
        assert (
            migrated.get_model("assessments", "EvaluationRunQuestion")
            .objects.values()
            .get(pk=snapshot.pk)
            == snapshot_history
        )
        new_schedule = migrated.get_model("assessments", "EvaluationSchedule").objects.create(
            **schedule_fields
        )
        duplicate = dict(history)
        duplicate.pop("id")
        duplicate["schedule_id"] = new_schedule.pk
        new_run = run_model.objects.create(**duplicate)
        assert new_run.pk != run.pk
        with pytest.raises(IntegrityError), transaction.atomic():
            run_model.objects.create(**duplicate)
    finally:
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
