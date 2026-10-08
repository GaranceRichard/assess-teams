import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

from tests.migration_results_helpers import historic_result


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
@pytest.mark.functional
def test_migration_flags_legacy_unavailable_responsibilities_without_changing_history():
    executor = MigrationExecutor(connection)
    latest = executor.loader.graph.leaf_nodes()
    before = [node for node in latest if node[0] != "assessments"] + [
        ("assessments", "0013_question_lineage")
    ]
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        _, run, question = historic_result(apps)
        users = apps.get_model("identities", "User")
        inactive = users.objects.create(username="inactive", role="Coach", is_active=False)
        active = users.objects.create(username="active", role="Coach")
        schedules = apps.get_model("assessments", "EvaluationSchedule")
        kwargs = {
            "team_id": run.team_id,
            "evaluation_id": run.evaluation_id,
            "first_due_date": "2026-02-01",
            "next_due_date": "2026-02-01",
        }
        pending = schedules.objects.create(**kwargs, mode="fixed", assignee=inactive)
        recurring = schedules.objects.create(**kwargs, mode="monthly", assignee=inactive)
        absent = schedules.objects.create(**kwargs, mode="fixed")
        eligible = schedules.objects.create(**kwargs, mode="monthly", assignee=active)
        history = apps.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
        answers = (
            apps.get_model("assessments", "EvaluationRunQuestion")
            .objects.values()
            .get(pk=question.pk)
        )
        MigrationExecutor(connection).migrate(latest)
        migrated = MigrationExecutor(connection).loader.project_state(latest).apps
        actual = migrated.get_model("assessments", "EvaluationSchedule")
        for schedule in (pending, recurring, absent):
            row = actual.objects.get(pk=schedule.pk)
            assert row.requires_reassignment
            assert row.assignee_id == schedule.assignee_id
            assert str(row.next_due_date) == "2026-02-01"
        assert not actual.objects.get(pk=eligible.pk).requires_reassignment
        assert not actual.objects.get(pk=run.schedule_id).requires_reassignment
        assert (
            migrated.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
            == history
        )
        assert migrated.get_model("assessments", "EvaluationRunQuestion").objects.values().get(
            pk=question.pk
        ) == {**answers, "appreciation_markers": []}
    finally:
        MigrationExecutor(connection).migrate(latest)
