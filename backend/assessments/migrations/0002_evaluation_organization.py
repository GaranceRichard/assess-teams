import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("assessments", "0001_initial"),
        ("identities", "0003_validate_admin_organization"),
    ]
    operations = [
        migrations.AddField(
            model_name="evaluation",
            name="organization",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="evaluations",
                to="identities.organization",
            ),
        ),
        migrations.AlterField(
            model_name="evaluation",
            name="index",
            field=models.PositiveIntegerField(),
        ),
        migrations.AddConstraint(
            model_name="evaluation",
            constraint=models.UniqueConstraint(
                fields=("organization", "index"),
                name="evaluation_index_unique_per_organization",
            ),
        ),
    ]
