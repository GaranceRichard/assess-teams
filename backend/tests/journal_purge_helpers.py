import io
import json
from datetime import UTC, datetime, timedelta

import pytest
from django.core.management import call_command

from journals.models import ActivityEntry, LogEntry

NOW = datetime(2026, 10, 19, 16, tzinfo=UTC)


@pytest.fixture(name="purge_context")
def purge_settings(settings, monkeypatch):
    settings.JOURNAL_RETENTION = {"activity": None, "technical": 7}
    monkeypatch.setattr("journals.purge.timezone.now", lambda: NOW)
    return settings


def log_at(date, **values):
    entry = LogEntry.objects.create(
        level="INFO", source="system", message="private-content", **values
    )
    LogEntry.objects.filter(pk=entry.pk).update(created_at=date)
    return entry


def old_logs(count):
    return [log_at(NOW - timedelta(days=8)) for _ in range(count)]


def evidence():
    entry = ActivityEntry.objects.create(action="evaluation_completed", description="private-proof")
    ActivityEntry.objects.filter(pk=entry.pk).update(created_at=NOW - timedelta(days=300))
    return list(ActivityEntry.objects.values())


def command(*args, **kwargs):
    output, errors = io.StringIO(), io.StringIO()
    call_command("purge_journals", *args, stdout=output, stderr=errors, **kwargs)
    return [json.loads(line) for line in output.getvalue().splitlines()]
