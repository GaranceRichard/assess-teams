"""Safety guards complement the real multiprocess qualification."""

import sqlite3
from importlib import import_module

import pytest
from django.core.management.base import CommandError
from django.db import OperationalError, transaction

from config.sqlite_contention import CONTENTION_FAILED, is_sqlite_busy, retryable_sqlite_atomic
from identities.models import Organization

pytestmark = [pytest.mark.django_db(transaction=True), pytest.mark.functional]


def busy():
    native = sqlite3.OperationalError("synthetic busy without data")
    native.sqlite_errorcode = sqlite3.SQLITE_BUSY
    error = OperationalError("synthetic busy without data")
    error.__cause__ = native
    return error


@pytest.mark.parametrize("nested", [True, False])
def test_nested_or_committed_callback_is_never_replayed(nested, caplog):
    calls = []

    def fail():
        raise busy()

    @retryable_sqlite_atomic
    def mutation():
        calls.append(1)
        Organization.objects.create(name="Committed" if not nested else "Rolled back")
        if nested:
            fail()
        transaction.on_commit(fail)

    if nested:
        with transaction.atomic():
            Organization.objects.create(name="Outer")
            with pytest.raises(OperationalError):
                mutation()
            assert list(Organization.objects.values_list("name", flat=True)) == ["Outer"]
    else:
        with pytest.raises(OperationalError):
            mutation()
        assert list(Organization.objects.values_list("name", flat=True)) == ["Committed"]
    assert calls == [1]
    assert "outcome=non_replayable attempt=1" in caplog.text


def test_unclassified_database_failure_is_never_replayed():
    calls = []

    @retryable_sqlite_atomic
    def mutation():
        calls.append(1)
        Organization.objects.create(name="Rolled back")
        raise OperationalError("disk unavailable")

    with pytest.raises(OperationalError, match="disk unavailable"):
        mutation()
    assert calls == [1]
    assert not Organization.objects.exists()
    assert not is_sqlite_busy(OperationalError("database is locked"))


@pytest.mark.parametrize("code", [sqlite3.SQLITE_LOCKED, sqlite3.SQLITE_IOERR])
def test_only_native_busy_is_eligible(code):
    error = busy()
    error.__cause__.sqlite_errorcode = code
    assert not is_sqlite_busy(error)
    error.__cause__.sqlite_errorcode = sqlite3.SQLITE_BUSY | (2 << 8)
    assert is_sqlite_busy(error)


@pytest.mark.parametrize(
    "module,poll",
    [
        ("notifications.management.commands.send_pending_notifications", "deliver_pending_emails"),
        (
            "identities.management.commands.send_password_reset_emails",
            "deliver_pending_password_emails",
        ),
        (
            "assessments.management.commands.send_due_evaluation_notifications",
            "deliver_due_schedules",
        ),
    ],
)
def test_commands_refuse_busy_pass_without_replaying(module, poll, monkeypatch, caplog):
    command = import_module(module)
    calls = []

    def failure():
        calls.append(1)
        raise busy()

    monkeypatch.setattr(command, poll, failure)
    with pytest.raises(CommandError, match=CONTENTION_FAILED):
        command.Command().handle(watch=False)
    assert calls == [1]
    assert "outcome=stopped_without_replay" in caplog.text


def test_elapsed_window_refuses_another_attempt(monkeypatch, caplog):
    from unittest.mock import Mock

    from config import sqlite_contention

    monkeypatch.setattr(sqlite_contention, "time", Mock(monotonic=Mock(side_effect=[0, 7, 7])))

    @retryable_sqlite_atomic
    def mutation():
        raise busy()

    with pytest.raises(OperationalError):
        mutation()
    assert "outcome=wait_budget_exhausted attempt=1" in caplog.text


def test_manually_disabled_autocommit_cannot_replay_a_savepoint(caplog):
    calls = []

    @retryable_sqlite_atomic
    def mutation():
        calls.append(1)
        raise busy()

    transaction.set_autocommit(False)
    try:
        with pytest.raises(OperationalError):
            mutation()
    finally:
        transaction.rollback()
        transaction.set_autocommit(True)
    assert calls == [1]
    assert "outcome=non_replayable" in caplog.text
