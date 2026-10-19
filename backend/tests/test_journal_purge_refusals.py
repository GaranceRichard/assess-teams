import io
import uuid
from datetime import timedelta
from unittest.mock import Mock

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db.models.query import QuerySet

from journals.models import ActivityEntry, LogEntry
from journals.purge import advance_run, start_run
from journals.purge_models import JournalPurgeRun
from journals.purge_policy import PurgeRefused
from tests.journal_purge_helpers import (
    NOW,
    command,
    evidence,
    old_logs,
    purge_settings,  # noqa: F401
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional]


@pytest.mark.parametrize(
    "args,code",
    [
        (["--scope", "activity"], "scope_forbidden"),
        (["--scope", "private-secret"], "scope_forbidden"),
        (["--max-rows", "0"], "invalid_bound"),
        (["--max-rows", "100001"], "invalid_bound"),
        (["--batch-size", "1001"], "invalid_bound"),
        (["--max-batches", "1001"], "invalid_bound"),
        (["--max-batches", "private-secret"], "invalid_bound"),
        (["--execute"], "authorization_required"),
        (["--execute", "--authorization", "private-secret"], "authorization_required"),
        (["--resume", "private-secret"], "invalid_run_id"),
        (["--resume", str(uuid.uuid4())], "unknown_run"),
    ],
)
def test_refusals_are_confidential_and_have_no_effect(purge_context, args, code):
    old_logs(1)
    proof = evidence()
    output, errors = io.StringIO(), io.StringIO()
    with pytest.raises(CommandError, match=code) as error:
        call_command("purge_journals", *args, stdout=output, stderr=errors)
    combined = str(error.value) + output.getvalue() + errors.getvalue()
    assert "private" not in combined
    assert LogEntry.objects.count() == 1 and not JournalPurgeRun.objects.exists()
    assert list(ActivityEntry.objects.values()) == proof


@pytest.mark.parametrize(
    "policy",
    [
        {"activity": None, "technical": None},
        {"activity": 1, "technical": 7},
        {"activity": None, "technical": True},
    ],
)
def test_policy_cannot_authorize_business_destruction_or_keep_override(purge_context, policy):
    purge_context.JOURNAL_RETENTION = policy
    old_logs(1)
    proof = evidence()
    with pytest.raises(CommandError, match="retention_keep|invalid_policy"):
        command("--execute", "--authorization", "OPS-123")
    assert LogEntry.objects.count() == 1
    assert list(ActivityEntry.objects.values()) == proof


@pytest.mark.parametrize("change", ["policy", "keep", "clock", "cutoff", "cursor", "counts"])
def test_resume_revalidates_policy_clock_and_checkpoint(purge_context, monkeypatch, change):
    old_logs(1)
    run = start_run(simulation=False, authorization="OPS-123")
    if change == "policy":
        purge_context.JOURNAL_RETENTION["technical"] = 8
    elif change == "keep":
        purge_context.JOURNAL_RETENTION["technical"] = None
    elif change == "clock":
        monkeypatch.setattr("journals.purge.timezone.now", lambda: NOW - timedelta(seconds=1))
    else:
        field, value = {
            "cutoff": ("cutoff", NOW),
            "cursor": ("cursor", run.upper_pk + 1),
            "counts": ("deleted_count", 1),
        }[change]
        JournalPurgeRun.objects.filter(pk=run.pk).update(**{field: value})
    with pytest.raises(PurgeRefused):
        advance_run(run.pk)
    assert LogEntry.objects.count() == 1


def test_deletion_breakdown_mismatch_rolls_back_rows_and_checkpoint(purge_context, monkeypatch):
    old_logs(1)
    run = start_run(simulation=False, authorization="OPS-123")
    original = QuerySet.delete

    def unexpected_cascade(queryset):
        original(queryset)
        return 2, {"journals.LogEntry": 1, "journals.ActivityEntry": 1}

    monkeypatch.setattr(QuerySet, "delete", unexpected_cascade)
    with pytest.raises(PurgeRefused, match="deletion_mismatch"):
        advance_run(run.pk)
    run.refresh_from_db()
    assert LogEntry.objects.count() == 1
    assert run.deleted_count == run.cursor == 0


def test_future_reverse_relation_is_refused_before_deletion(purge_context, monkeypatch):
    old_logs(1)
    run = start_run(simulation=False, authorization="OPS-123")
    hidden_relation = Mock(is_relation=True, auto_created=True, concrete=False)
    monkeypatch.setattr(LogEntry._meta, "get_fields", lambda **kwargs: (hidden_relation,))
    with pytest.raises(PurgeRefused, match="unsafe_relations"):
        advance_run(run.pk)
    assert LogEntry.objects.count() == 1
