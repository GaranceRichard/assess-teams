from django.db import migrations
from django.db.models import Count


def validate_admin_organization(apps, schema_editor):
    user = apps.get_model("identities", "User")
    conflicts = list(
        user.objects.filter(role="Admin")
        .annotate(organization_count=Count("organizations"))
        .filter(organization_count__gt=1)
        .values_list("pk", "username", "organization_count")
    )
    if conflicts:
        details = ", ".join(
            f"id={pk} ({username}): {count} organisations"
            for pk, username, count in conflicts
        )
        raise RuntimeError(
            "Migration interrompue : affectez explicitement chaque Admin à une seule "
            f"organisation sans supprimer silencieusement de rattachement. Conflits : {details}"
        )


class Migration(migrations.Migration):
    dependencies = [("identities", "0002_organization")]
    operations = [migrations.RunPython(validate_admin_organization, migrations.RunPython.noop)]
