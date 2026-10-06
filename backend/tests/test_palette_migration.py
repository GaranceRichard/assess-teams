import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_palette_migration_defaults_existing_identities_without_changing_memberships():
    executor = MigrationExecutor(connection)
    before = [("identities", "0003_validate_admin_organization")]
    latest = executor.loader.graph.leaf_nodes()
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        users = apps.get_model("identities", "User")
        member = users.objects.create(username="historical", role="Viewer")
        root = users.objects.create(username="historical-root", is_superuser=True)
        organization = apps.get_model("identities", "Organization").objects.create(name="Past")
        organization.users.add(member)

        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        migrated = executor.loader.project_state(latest).apps.get_model("identities", "User")

        assert migrated.objects.get(pk=member.pk).interface_palette == "green"
        assert migrated.objects.get(pk=root.pk).interface_palette == "green"
        assert migrated.objects.get(pk=member.pk).role == "Viewer"
        assert migrated.objects.get(pk=member.pk).organizations.get().pk == organization.pk
    finally:
        MigrationExecutor(connection).migrate(latest)


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
def test_accent_extension_preserves_all_historical_choices_and_memberships():
    executor = MigrationExecutor(connection)
    before = [("identities", "0004_user_interface_palette_and_more")]
    latest = executor.loader.graph.leaf_nodes()
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        users = apps.get_model("identities", "User")
        organization = apps.get_model("identities", "Organization").objects.create(name="Legacy")
        historical = [
            users.objects.create(username=palette, role="Viewer", interface_palette=palette)
            for palette in ("green", "blue", "pink", "red")
        ]
        organization.users.set(historical)
        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        migrated = executor.loader.project_state(latest).apps.get_model("identities", "User")
        for member in historical:
            restored = migrated.objects.get(pk=member.pk)
            assert restored.interface_palette == member.interface_palette
            assert restored.organizations.get().pk == organization.pk
        restored.interface_palette = "turquoise"
        restored.save(update_fields=["interface_palette"])
        assert migrated.objects.get(pk=restored.pk).interface_palette == "turquoise"
    finally:
        MigrationExecutor(connection).migrate(latest)
