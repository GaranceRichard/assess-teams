import pytest
from django.db import IntegrityError, connection, transaction
from django.db.migrations.executor import MigrationExecutor

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import EvaluationRun, EvaluationSchedule
from tests.taking_helpers import client_for, complete, taking_context


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_replanning_migration_preserves_completed_runs_and_removes_only_schedule_uniqueness():
    before = [("assessments", "0011_evaluation_version_evaluationfamily_and_more")]
    after = [("assessments", "0012_remove_evaluationschedule_schedule_unique_per_team_evaluation")]
    executor = MigrationExecutor(connection)
    executor.migrate(before)
    try:
        _, _, admin, run = taking_context()
        assert complete(client_for(admin), run).status_code == 200
        history = EvaluationRun.objects.values().get(pk=run.pk)
        questions = list(run.questions.values())
        schedule_fields = {
            "team": run.team,
            "evaluation": run.evaluation,
            "assignee": run.assignee,
            "mode": run.schedule.mode,
            "first_due_date": run.due_date,
        }
        with pytest.raises(IntegrityError), transaction.atomic():
            EvaluationSchedule.objects.create(**schedule_fields)

        MigrationExecutor(connection).migrate(after)

        assert EvaluationRun.objects.values().get(pk=run.pk) == history
        assert list(run.questions.values()) == questions
        new_schedule = EvaluationSchedule.objects.create(**schedule_fields)
        new_run = ensure_expected_evaluation(new_schedule)
        assert new_run.pk != run.pk
        assert EvaluationSchedule.objects.count() == 2
        assert EvaluationRun.objects.count() == 2
        assert ensure_expected_evaluation(new_schedule).pk == new_run.pk
        duplicate = EvaluationRun.objects.values().get(pk=new_run.pk)
        duplicate.pop("id")
        with pytest.raises(IntegrityError), transaction.atomic():
            EvaluationRun.objects.create(**duplicate)
    finally:
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
