from datetime import date

import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.utils import timezone


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_marker_migration_preserves_started_and_completed_history_without_backfill():
    executor = MigrationExecutor(connection)
    latest = executor.loader.graph.leaf_nodes()
    before = [("assessments", "0014_evaluationschedule_requires_reassignment")]
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        org = apps.get_model("identities", "Organization").objects.create(name="Legacy")
        team = apps.get_model("teams", "Team").objects.create(organization=org, name="Team")
        family = apps.get_model("assessments", "EvaluationFamily").objects.create(
            organization=org, name="Family"
        )
        model = apps.get_model("assessments", "Evaluation").objects.create(
            organization=org, family=family, index=1, name="Model", status="ARCHIVED"
        )
        question = apps.get_model("assessments", "Question").objects.create(
            evaluation=model, index=1, name="Criterion"
        )
        schedule = apps.get_model("assessments", "EvaluationSchedule").objects.create(
            team=team, evaluation=model, mode="fixed", first_due_date=date(2026, 1, 1)
        )
        rows = []
        for day, state in [(1, "in_progress"), (2, "completed")]:
            run = apps.get_model("assessments", "EvaluationRun").objects.create(
                schedule=schedule,
                due_date=date(2026, 1, day),
                organization=org,
                organization_name="Legacy",
                team=team,
                team_name="Team",
                evaluation=model,
                evaluation_name="Snapshot",
                assignee_name="Coach",
                state=state,
                completed_at=timezone.now() if state == "completed" else None,
                completed_by_name="Coach" if state == "completed" else "",
            )
            snapshot = apps.get_model("assessments", "EvaluationRunQuestion").objects.create(
                run=run,
                source_question=question,
                lineage_id=question.lineage_id,
                index=1,
                text="Historic text",
                score=8,
            )
            rows.append((run.pk, snapshot.pk, run.completed_at))
        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        apps = executor.loader.project_state(latest).apps
        assert (
            apps.get_model("assessments", "Question")
            .objects.get(pk=question.pk)
            .appreciation_markers
            == []
        )
        for run_id, snapshot_id, completed_at in rows:
            run = apps.get_model("assessments", "EvaluationRun").objects.get(pk=run_id)
            snapshot = apps.get_model("assessments", "EvaluationRunQuestion").objects.get(
                pk=snapshot_id
            )
            assert (snapshot.text, snapshot.score, snapshot.appreciation_markers) == (
                "Historic text",
                8,
                [],
            )
            assert (run.evaluation_id, run.completed_at) == (model.pk, completed_at)
    finally:
        MigrationExecutor(connection).migrate(latest)
