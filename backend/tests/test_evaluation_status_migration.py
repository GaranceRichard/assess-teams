from datetime import date

import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


@pytest.mark.django_db(transaction=True)
def test_migration_preserves_planned_models_and_keeps_other_models_drafts():
    before = [("assessments", "0006_evaluationschedule_assignee")]
    after = [("assessments", "0007_evaluation_status")]
    executor = MigrationExecutor(connection)
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        organization = apps.get_model("identities", "Organization").objects.create(name="Legacy")
        evaluation = apps.get_model("assessments", "Evaluation")
        scheduled = evaluation.objects.create(organization_id=organization.pk, index=1, name="Used")
        draft = evaluation.objects.create(
            organization_id=organization.pk, index=2, name="Incomplete"
        )
        team = apps.get_model("teams", "Team").objects.create(
            organization_id=organization.pk, name="Team"
        )
        schedule = apps.get_model("assessments", "EvaluationSchedule").objects.create(
            team_id=team.pk,
            evaluation_id=scheduled.pk,
            mode="fixed",
            first_due_date=date(2026, 1, 1),
        )
        MigrationExecutor(connection).migrate(after)
        migrated = MigrationExecutor(connection).loader.project_state(after).apps
        evaluation = migrated.get_model("assessments", "Evaluation")
        assert evaluation.objects.get(pk=scheduled.pk).status == "VALIDATED"
        assert evaluation.objects.get(pk=draft.pk).status == "DRAFT"
        assert (
            migrated.get_model("assessments", "EvaluationSchedule")
            .objects.get(pk=schedule.pk)
            .evaluation_id
            == scheduled.pk
        )
        assert (
            evaluation.objects.create(organization_id=organization.pk, index=3, name="New").status
            == "DRAFT"
        )
    finally:
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
