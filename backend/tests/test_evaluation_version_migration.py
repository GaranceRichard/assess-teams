from datetime import date

import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.utils import timezone


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_existing_models_keep_ids_status_questions_planning_runs_and_journal():
    before = [
        ("assessments", "0010_integer_scores"),
        ("journals", "0007_alter_activityentry_action"),
    ]
    after = [
        ("assessments", "0011_evaluation_version_evaluationfamily_and_more"),
        ("journals", "0007_alter_activityentry_action"),
    ]
    executor = MigrationExecutor(connection)
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        org = apps.get_model("identities", "Organization").objects.create(name="Legacy")
        team = apps.get_model("teams", "Team").objects.create(organization=org, name="Legacy Team")
        models = apps.get_model("assessments", "Evaluation")
        legacy = [
            models.objects.create(organization=org, index=index, name="Same name", status=state)
            for index, state in enumerate(["ARCHIVED", "VALIDATED", "DRAFT"], 1)
        ]
        first = legacy[0]
        question = apps.get_model("assessments", "Question").objects.create(
            evaluation=first, index=3, name="Historic criterion"
        )
        schedule = apps.get_model("assessments", "EvaluationSchedule").objects.create(
            team=team, evaluation=first, mode="fixed", first_due_date=date(2026, 1, 1)
        )
        run = apps.get_model("assessments", "EvaluationRun").objects.create(
            schedule=schedule,
            due_date=date(2026, 1, 1),
            organization=org,
            organization_name="Legacy",
            team=team,
            team_name="Legacy Team",
            evaluation=first,
            evaluation_name="Historic name",
            assignee_name="Legacy coach",
            state="completed",
            completed_by_name="Legacy coach",
            completed_at=timezone.now(),
        )
        snapshot = apps.get_model("assessments", "EvaluationRunQuestion").objects.create(
            run=run, source_question=question, index=3, text="Original snapshot", score=8
        )
        entry = apps.get_model("journals", "ActivityEntry").objects.create(
            organization=org,
            organization_name="Legacy",
            actor_name="Legacy Admin",
            action="evaluation_validated",
            description="Original journal",
        )
        MigrationExecutor(connection).migrate(after)
        migrated = MigrationExecutor(connection).loader.project_state(after).apps
        model = migrated.get_model("assessments", "Evaluation")
        for original in legacy:
            current = model.objects.get(pk=original.pk)
            assert current.status == original.status
            assert current.version == 1
            assert current.family.organization_id == org.pk
            assert (current.family.name, current.family.next_version) == ("Same name", 2)
        assert migrated.get_model("assessments", "EvaluationFamily").objects.count() == 3
        assert (
            migrated.get_model("assessments", "EvaluationSchedule")
            .objects.get(pk=schedule.pk)
            .evaluation_id
            == first.pk
        )
        current_run = migrated.get_model("assessments", "EvaluationRun").objects.get(pk=run.pk)
        assert (current_run.evaluation_id, current_run.evaluation_name) == (
            first.pk,
            "Historic name",
        )
        current = migrated.get_model("assessments", "EvaluationRunQuestion").objects.get(
            pk=snapshot.pk
        )
        assert (current.source_question_id, current.index, current.text, current.score) == (
            question.pk,
            3,
            "Original snapshot",
            8,
        )
        assert (
            migrated.get_model("journals", "ActivityEntry").objects.get(pk=entry.pk).description
            == "Original journal"
        )
    finally:
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
