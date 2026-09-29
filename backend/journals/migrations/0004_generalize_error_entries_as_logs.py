from django.db import migrations, models


def mark_existing_entries_as_errors(apps, schema_editor):
    log_entry = apps.get_model("journals", "LogEntry")
    log_entry.objects.update(level="ERROR")


class Migration(migrations.Migration):
    dependencies = [("journals", "0003_alter_activityentry_action")]

    operations = [
        migrations.RenameModel(old_name="ErrorEntry", new_name="LogEntry"),
        migrations.AddField(
            model_name="logentry",
            name="level",
            field=models.CharField(
                choices=[
                    ("INFO", "Info"),
                    ("WARNING", "Avertissement"),
                    ("ERROR", "Erreur"),
                ],
                default="ERROR",
                max_length=7,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="logentry",
            name="source",
            field=models.CharField(
                choices=[
                    ("teams", "Équipes"),
                    ("assessments", "Évaluations"),
                    ("planning", "Planification"),
                    ("notifications", "Notifications"),
                    ("identities", "Identités"),
                    ("organizations", "Organisations"),
                    ("system", "Système"),
                ],
                default="system",
                max_length=40,
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="logentry",
            name="category",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AlterField(
            model_name="logentry",
            name="operation",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.RunPython(mark_existing_entries_as_errors, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="logentry",
            constraint=models.CheckConstraint(
                condition=models.Q(("level__in", ["INFO", "WARNING", "ERROR"])),
                name="journals_log_level_valid",
            ),
        ),
    ]
