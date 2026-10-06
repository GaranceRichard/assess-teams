import uuid

from django.db import migrations, models


def seed_explicit_lineages(apps, schema_editor):
    questions = apps.get_model("assessments", "Question")
    snapshots = apps.get_model("assessments", "EvaluationRunQuestion")
    alias = schema_editor.connection.alias
    # The source FK proves continuity within one question only. Historical copies
    # contain no per-question lineage evidence, so every existing question is distinct.
    for question in questions.objects.using(alias).all().iterator():
        lineage = uuid.uuid4()
        questions.objects.using(alias).filter(pk=question.pk).update(lineage_id=lineage)
        snapshots.objects.using(alias).filter(source_question_id=question.pk).update(
            lineage_id=lineage
        )


class Migration(migrations.Migration):
    dependencies = [("assessments", "0012_remove_evaluationschedule_schedule_unique_per_team_evaluation")]
    operations = [
        migrations.AddField(
            model_name="question", name="lineage_id",
            field=models.UUIDField(null=True, editable=False, db_index=True),
        ),
        migrations.AddField(
            model_name="evaluationrunquestion", name="lineage_id",
            field=models.UUIDField(null=True, editable=False, db_index=True),
        ),
        migrations.RunPython(seed_explicit_lineages, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="question", name="lineage_id",
            field=models.UUIDField(default=uuid.uuid4, editable=False, db_index=True),
        ),
        migrations.AlterField(
            model_name="evaluationrunquestion", name="lineage_id",
            field=models.UUIDField(editable=False, db_index=True),
        ),
        migrations.AddConstraint(
            model_name="question",
            constraint=models.UniqueConstraint(fields=("evaluation", "lineage_id"), name="question_lineage_unique_per_version"),
        ),
        migrations.AddConstraint(
            model_name="evaluationrunquestion",
            constraint=models.UniqueConstraint(fields=("run", "lineage_id"), name="run_lineage_unique"),
        ),
    ]
