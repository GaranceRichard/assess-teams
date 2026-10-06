from django.utils import timezone


def historic_result(apps):
    org = apps.get_model("identities", "Organization").objects.create(name="Legacy")
    team = apps.get_model("teams", "Team").objects.create(organization=org, name="Legacy team")
    family = apps.get_model("assessments", "EvaluationFamily").objects.create(
        organization=org, name="Legacy family"
    )
    evaluation = apps.get_model("assessments", "Evaluation").objects.create(
        organization=org, family=family, index=1, version=1, name="Legacy", status="ARCHIVED"
    )
    question = apps.get_model("assessments", "Question").objects.create(
        evaluation=evaluation, index=1, name="Same text"
    )
    schedule = apps.get_model("assessments", "EvaluationSchedule").objects.create(
        team=team, evaluation=evaluation, mode="fixed", first_due_date="2026-01-01"
    )
    run = apps.get_model("assessments", "EvaluationRun").objects.create(
        schedule=schedule,
        organization=org,
        organization_name=org.name,
        team=team,
        team_name=team.name,
        evaluation=evaluation,
        evaluation_name="Historical name",
        assignee_name="Historical coach",
        due_date="2026-01-01",
        state="completed",
        completed_at=timezone.now(),
        completed_by_name="Historical author",
    )
    lineage = {"lineage_id": question.lineage_id} if hasattr(question, "lineage_id") else {}
    snapshot = apps.get_model("assessments", "EvaluationRunQuestion").objects.create(
        run=run, source_question=question, index=1, text="Historical text", score=8, **lineage
    )
    return question, run, snapshot
