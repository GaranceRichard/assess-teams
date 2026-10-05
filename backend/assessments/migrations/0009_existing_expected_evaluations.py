from django.db import migrations


def preserve_existing_assignments(apps, schema_editor):
    schedule_model = apps.get_model("assessments", "EvaluationSchedule")
    run_model = apps.get_model("assessments", "EvaluationRun")
    schedules = schedule_model.objects.using(schema_editor.connection.alias).select_related(
        "team__organization", "evaluation", "assignee"
    )
    for schedule in schedules.exclude(assignee=None):
        run_model.objects.using(schema_editor.connection.alias).get_or_create(
            schedule=schedule,
            due_date=schedule.first_due_date,
            defaults={
                "organization_id": schedule.team.organization_id,
                "organization_name": schedule.team.organization.name,
                "team_id": schedule.team_id,
                "team_name": schedule.team.name,
                "evaluation_id": schedule.evaluation_id,
                "evaluation_name": schedule.evaluation.name,
                "assignee_id": schedule.assignee_id,
                "assignee_name": schedule.assignee.username,
            },
        )


class Migration(migrations.Migration):
    dependencies = [("assessments", "0008_evaluationrun_evaluationrunquestion_and_more")]
    operations = [migrations.RunPython(preserve_existing_assignments, migrations.RunPython.noop)]
