from django.db import migrations, models


def preserve_scheduled_evaluations(apps, schema_editor):
    evaluation = apps.get_model("assessments", "Evaluation")
    schedule = apps.get_model("assessments", "EvaluationSchedule")
    database = schema_editor.connection.alias
    scheduled_ids = schedule.objects.using(database).values("evaluation_id")
    evaluation.objects.using(database).filter(pk__in=scheduled_ids).update(status="VALIDATED")


class Migration(migrations.Migration):
    dependencies = [("assessments", "0006_evaluationschedule_assignee")]

    operations = [
        migrations.AddField(
            model_name="evaluation",
            name="status",
            field=models.CharField(
                choices=[
                    ("DRAFT", "Brouillon"),
                    ("VALIDATED", "Validée"),
                    ("ARCHIVED", "Archivée"),
                ],
                default="DRAFT",
                max_length=10,
            ),
            preserve_default=False,
        ),
        migrations.RunPython(preserve_scheduled_evaluations, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="evaluation",
            name="status",
            field=models.CharField(
                choices=[
                    ("DRAFT", "Brouillon"),
                    ("VALIDATED", "Validée"),
                    ("ARCHIVED", "Archivée"),
                ],
                default="DRAFT",
                max_length=10,
            ),
        ),
    ]
