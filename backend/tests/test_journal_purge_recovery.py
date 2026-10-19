import io
import signal

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import OperationalError
from django.db.models.signals import post_delete

from journals.models import LogEntry
from journals.purge import advance_run, start_run
from journals.purge_models import JournalPurgeRun
from journals.purge_policy import PurgeRefused
from tests.journal_purge_helpers import command, old_logs, purge_settings  # noqa: F401

pytestmark = [pytest.mark.django_db(transaction=True), pytest.mark.integration]


@pytest.mark.parametrize("stop", ["keyboard", "terminate"])
def test_interruption_inside_delete_rolls_back_then_resume_is_exact(purge_context, stop):
    old_logs(3)
    run = start_run(simulation=False, authorization="OPS-123", batch_size=1)
    assert advance_run(run.pk).deleted_count == 1

    def interrupted(**kwargs):
        if stop == "terminate":
            signal.raise_signal(signal.SIGTERM)
        raise KeyboardInterrupt

    previous_handler = signal.getsignal(signal.SIGTERM)
    post_delete.connect(interrupted, sender=LogEntry)
    try:
        with pytest.raises(CommandError, match="execution_stopped"):
            command("--execute", "--resume", str(run.pk))
    finally:
        post_delete.disconnect(interrupted, sender=LogEntry)
    assert signal.getsignal(signal.SIGTERM) == previous_handler
    run.refresh_from_db()
    assert run.deleted_count == 1 and run.batches == 1
    assert LogEntry.objects.count() == 2
    result = command("--execute", "--resume", str(run.pk))[-1]
    assert result["deleted"] == 3 and result["status"] == "completed"
    assert not LogEntry.objects.exists()


def test_budget_pause_reports_durable_cursor_and_can_resume(purge_context):
    old_logs(3)
    output = io.StringIO()
    with pytest.raises(CommandError, match="batch_budget_reached"):
        call_command(
            "purge_journals",
            "--execute",
            "--authorization",
            "OPS-123",
            "--batch-size",
            "1",
            "--max-batches",
            "1",
            stdout=output,
            stderr=io.StringIO(),
        )
    run = JournalPurgeRun.objects.get()
    assert run.status == "paused" and run.deleted_count == 1
    assert str(run.pk) in output.getvalue() and '"completed"' not in output.getvalue()
    assert command("--execute", "--resume", str(run.pk))[-1]["deleted"] == 3


@pytest.mark.parametrize(
    "args",
    [
        [],
        ["--execute", "--max-rows", "10"],
        ["--execute", "--batch-size", "1"],
        ["--execute", "--authorization", "OPS-456"],
    ],
)
def test_resume_cannot_change_execution_mode_or_bounds(purge_context, args):
    old_logs(1)
    run = start_run(simulation=False, authorization="OPS-123")
    with pytest.raises(CommandError, match="mode_changed|resume_options_forbidden"):
        command("--resume", str(run.pk), *args)
    assert LogEntry.objects.count() == 1


def test_simulation_cannot_be_promoted_into_execution(purge_context):
    old_logs(1)
    run = start_run()
    with pytest.raises(CommandError, match="mode_changed"):
        command("--execute", "--resume", str(run.pk))
    assert LogEntry.objects.count() == 1


def test_completed_receipt_does_not_announce_success_before_policy_revalidation(purge_context):
    run = advance_run(start_run().pk)
    assert run.status == "completed"
    purge_context.JOURNAL_RETENTION["technical"] = 8
    output = io.StringIO()
    with pytest.raises(CommandError, match="policy_changed"):
        call_command("purge_journals", "--resume", str(run.pk), stdout=output, stderr=io.StringIO())
    assert '"completed"' not in output.getvalue()
    assert '"event": "started"' in output.getvalue()


@pytest.mark.parametrize("exception", [OperationalError("private-secret"), RuntimeError("private")])
def test_database_and_unexpected_failures_never_leak_or_claim_success(
    purge_context, monkeypatch, exception
):
    old_logs(1)

    def fail(*args):
        raise exception

    monkeypatch.setattr("journals.management.commands.purge_journals.advance_run", fail)
    output, errors = io.StringIO(), io.StringIO()
    with pytest.raises(CommandError, match="execution_stopped") as error:
        call_command("purge_journals", stdout=output, stderr=errors)
    assert "private" not in output.getvalue() + errors.getvalue() + str(error.value)
    assert '"completed"' not in output.getvalue()
    assert JournalPurgeRun.objects.get().status == "paused"
    assert LogEntry.objects.count() == 1


def test_failed_final_integrity_check_rolls_back_entire_final_batch(purge_context, monkeypatch):
    old_logs(1)
    run = start_run(simulation=False, authorization="OPS-123", max_rows=1)

    def corrupt():
        raise PurgeRefused("integrity_failed")

    monkeypatch.setattr("journals.purge.check_integrity", corrupt)
    with pytest.raises(PurgeRefused, match="integrity_failed"):
        advance_run(run.pk)
    run.refresh_from_db()
    assert LogEntry.objects.count() == 1 and run.deleted_count == run.cursor == 0
    assert run.status == "paused"
