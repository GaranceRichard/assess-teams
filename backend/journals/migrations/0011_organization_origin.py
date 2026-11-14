from django.db import migrations, models


def preserve_linked_origins(apps, schema_editor):
    for name in ("ActivityEntry", "LogEntry"):
        model = apps.get_model("journals", name)
        model.objects.using(schema_editor.connection.alias).filter(
            organization_id__isnull=False, organization_origin_id__isnull=True
        ).update(organization_origin_id=models.F("organization_id"))


class Migration(migrations.Migration):
    dependencies = [("journals", "0010_journalpurgerun")]

    operations = [
        migrations.AddField(
            model_name="activityentry", name="organization_origin_id",
            field=models.PositiveBigIntegerField(
                blank=True, db_index=True, editable=False, null=True
            ),
        ),
        migrations.AddField(
            model_name="logentry", name="organization_origin_id",
            field=models.PositiveBigIntegerField(
                blank=True, db_index=True, editable=False, null=True
            ),
        ),
        migrations.RunPython(preserve_linked_origins, migrations.RunPython.noop),
    ]
