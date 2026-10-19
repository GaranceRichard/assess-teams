from datetime import timedelta

import pytest

from identities.models import Organization, User
from journals.models import ActivityEntry, LogEntry
from journals.purge import advance_run, start_run
from journals.purge_models import JournalPurgeRun
from tests.journal_purge_helpers import (
    NOW,
    command,
    evidence,
    log_at,
    old_logs,
    purge_settings,  # noqa: F401
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional]


@pytest.mark.parametrize("execute", [False, True])
def test_exact_expiry_boundary_and_all_instance_scopes(purge_context, execute):
    proof = evidence()
    organizations = [Organization.objects.create(name=name) for name in ("First", "Second")]
    actor = User.objects.create(username="retained-actor", role="Admin")
    eligible = [
        log_at(NOW - timedelta(days=7, microseconds=1), organization=org, actor=actor)
        for org in [*organizations, None]
    ]
    removed = Organization.objects.create(name="Removed")
    detached = log_at(NOW - timedelta(days=8), organization=removed)
    removed.delete()
    eligible.append(detached)
    boundary = log_at(NOW - timedelta(days=7))
    young = log_at(NOW)
    args = ["--execute", "--authorization", "OPS-123"] if execute else []
    result = command(*args, "--batch-size", "2")[-1]
    assert result["status"] == "completed" and result["outcome"] == "window_exhausted"
    assert result["matched"] == 4 and result["deleted"] == (4 if execute else 0)
    assert LogEntry.objects.filter(pk__in=[boundary.pk, young.pk]).count() == 2
    assert LogEntry.objects.filter(pk__in=[row.pk for row in eligible]).count() == (
        0 if execute else 4
    )
    assert list(ActivityEntry.objects.values()) == proof
    assert User.objects.filter(pk=actor.pk).exists()
    assert Organization.objects.filter(pk__in=[org.pk for org in organizations]).count() == 2


def test_row_limit_is_explicit_and_receipt_is_idempotent(purge_context):
    old_logs(5)
    run = start_run(simulation=False, authorization="OPS-123", max_rows=3, batch_size=2)
    assert advance_run(run.pk).deleted_count == 2
    result = advance_run(run.pk)
    assert result.deleted_count == 3 and result.outcome == "limit_reached"
    assert result.status == "completed" and LogEntry.objects.count() == 2
    assert advance_run(run.pk).batches == 2
    assert JournalPurgeRun.objects.count() == 1


def test_snapshot_does_not_extend_to_new_entries_on_resume(purge_context):
    old_logs(2)
    run = start_run(simulation=False, authorization="OPS-123", batch_size=1)
    advance_run(run.pk)
    later = old_logs(1)[0]
    advance_run(run.pk)
    assert advance_run(run.pk).status == "completed"
    assert list(LogEntry.objects.values_list("pk", flat=True)) == [later.pk]


def test_maximum_valid_duration_has_no_representable_expired_rows(purge_context):
    purge_context.JOURNAL_RETENTION["technical"] = 999999999
    old_logs(1)
    assert command()[0]["simulation"] is True
    assert LogEntry.objects.count() == 1
    assert JournalPurgeRun.objects.get().matched_count == 0


def test_empty_run_completes_without_claiming_deletions(purge_context):
    result = command("--execute", "--authorization", "OPS-123")[-1]
    assert result["matched"] == result["deleted"] == result["batches"] == 0
    assert result["status"] == "completed"
