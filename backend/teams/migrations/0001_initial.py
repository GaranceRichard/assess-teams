from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.db.models.functions.text


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("identities", "0002_organization"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Team",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "coaches",
                    models.ManyToManyField(
                        blank=True,
                        related_name="coached_teams",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="teams",
                        to="identities.organization",
                    ),
                ),
            ],
            options={
                "ordering": ("name", "pk"),
                "constraints": [
                    models.UniqueConstraint(
                        "organization",
                        django.db.models.functions.text.Lower("name"),
                        name="team_name_unique_per_organization",
                    )
                ],
            },
        )
    ]
