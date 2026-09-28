import django.db.models.deletion
from django.db import migrations, models


def validate_evaluation_organizations(apps, schema_editor):
    evaluation = apps.get_model("assessments", "Evaluation")
    organization = apps.get_model("identities", "Organization")
    unresolved_ids = list(
        evaluation.objects.filter(organization__isnull=True).values_list("pk", flat=True)
    )
    if unresolved_ids:
        organization_ids = list(organization.objects.values_list("pk", flat=True)[:2])
        if len(organization_ids) == 1:
            evaluation.objects.filter(pk__in=unresolved_ids).update(
                organization_id=organization_ids[0]
            )
            return
        rendered_ids = ", ".join(str(identifier) for identifier in unresolved_ids)
        raise RuntimeError(
            "Migration interrompue : affectez explicitement une organisation aux "
            "évaluations existantes lorsqu'aucune organisation unique ne peut être "
            f"déduite. IDs : {rendered_ids}"
        )


class Migration(migrations.Migration):
    dependencies = [("assessments", "0002_evaluation_organization")]
    operations = [
        migrations.RunPython(
            validate_evaluation_organizations,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="evaluation",
            name="organization",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="evaluations",
                to="identities.organization",
            ),
        ),
    ]
