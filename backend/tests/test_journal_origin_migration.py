import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.integration,
    pytest.mark.functional,
]


def test_migration_preserves_linked_origins_and_never_matches_detached_names():
    executor = MigrationExecutor(connection)
    latest = executor.loader.graph.leaf_nodes()
    before = [("journals", "0010_journalpurgerun")]
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        orgs = apps.get_model("identities", "Organization")
        first = orgs.objects.create(name="Same")
        second = orgs.objects.create(name="Same")
        stored = {}
        for name in ("ActivityEntry", "LogEntry"):
            model = apps.get_model("journals", name)
            extra = (
                {"action": "organization_created", "description": "Old"}
                if name == "ActivityEntry"
                else {"level": "INFO", "source": "organizations", "message": "Old"}
            )
            for org in (first, second, None):
                entry = model.objects.create(organization=org, organization_name="Same", **extra)
                stored[(name, entry.pk)] = (
                    org.pk if org else None,
                    model.objects.values().get(pk=entry.pk),
                )
        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        current = executor.loader.project_state(latest).apps
        for (name, pk), (origin, old_fields) in stored.items():
            row = current.get_model("journals", name).objects.values().get(pk=pk)
            assert row.pop("organization_origin_id") == origin
            assert row == old_fields
    finally:
        MigrationExecutor(connection).migrate(latest)
