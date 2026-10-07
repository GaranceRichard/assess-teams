from django.db import migrations


def remove_superadmin_memberships(apps, schema_editor):
    organization = apps.get_model("identities", "Organization")
    # Only join rows are removed. Accounts, audit entries and historical FK remain intact.
    organization.users.through.objects.using(schema_editor.connection.alias).filter(
        user__is_superuser=True
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("identities", "0005_remove_user_identity_interface_palette_allowed_and_more"),
    ]
    operations = [
        migrations.RunPython(remove_superadmin_memberships, migrations.RunPython.noop),
    ]
