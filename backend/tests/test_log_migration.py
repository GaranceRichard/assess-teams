from importlib import import_module

import pytest
from django.apps import apps
from django.db import migrations

from journals.models import LogEntry, LogLevel, LogSource


@pytest.mark.django_db
def test_existing_errors_are_preserved_as_error_logs() -> None:
    entry = LogEntry.objects.create(
        level=LogLevel.INFO,
        source=LogSource.SYSTEM,
        operation="Échec historique",
        category="ValidationError",
        message="Message sûr",
        organization_name="Ancienne organisation",
    )
    migration = import_module("journals.migrations.0004_generalize_error_entries_as_logs")

    migration.mark_existing_entries_as_errors(apps, None)
    entry.refresh_from_db()

    assert entry.level == LogLevel.ERROR
    assert entry.operation == "Échec historique"
    assert entry.organization_name == "Ancienne organisation"
    assert any(
        isinstance(operation, migrations.RenameModel)
        and operation.old_name == "ErrorEntry"
        and operation.new_name == "LogEntry"
        for operation in migration.Migration.operations
    )
