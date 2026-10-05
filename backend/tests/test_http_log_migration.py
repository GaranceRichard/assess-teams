import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


@pytest.mark.django_db(transaction=True)
def test_http_log_migration_preserves_historical_entries():
    executor = MigrationExecutor(connection)
    target = [("journals", "0006_alter_activityentry_action")]
    latest = executor.loader.graph.leaf_nodes()
    executor.migrate(target)
    try:
        old = executor.loader.project_state(target).apps.get_model("journals", "LogEntry")
        entry = old.objects.create(
            level="ERROR", source="system", message="Historical", organization_name="Past"
        )
        correlation = entry.correlation_id
        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        current = executor.loader.project_state(latest).apps.get_model("journals", "LogEntry")
        migrated = current.objects.get(pk=entry.pk)
        assert migrated.message == "Historical"
        assert migrated.organization_name == "Past"
        assert migrated.correlation_id == correlation
        assert migrated.level == "ERROR"
        assert migrated.method == ""
        assert migrated.status_code is None
        assert migrated.evaluation_id is None
        assert migrated.evaluation_name == ""
    finally:
        MigrationExecutor(connection).migrate(latest)
