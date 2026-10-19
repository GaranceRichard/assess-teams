from unittest.mock import MagicMock

import pytest
from django.core.management.base import CommandError

from journals.purge_models import JournalPurgeRun
from journals.purge_policy import PurgeRefused, check_integrity
from tests.journal_purge_helpers import command, purge_settings  # noqa: F401


@pytest.mark.parametrize("results", [[("corrupt-private-data",)], [("ok",), ("private-fk",)]])
def test_sqlite_integrity_failures_are_confidential(monkeypatch, results):
    cursor = MagicMock()
    cursor.__enter__.return_value = cursor
    cursor.fetchone.side_effect = results
    connection = MagicMock(vendor="sqlite")
    connection.cursor.return_value = cursor
    monkeypatch.setattr("journals.purge_policy.connection", connection)
    with pytest.raises(PurgeRefused, match="^integrity_failed$"):
        check_integrity()


def test_other_database_engine_requires_explicit_review(monkeypatch):
    monkeypatch.setattr("journals.purge_policy.connection", MagicMock(vendor="unknown"))
    with pytest.raises(PurgeRefused, match="unsupported_database"):
        check_integrity()


@pytest.mark.django_db
def test_initial_integrity_refusal_creates_no_receipt(purge_context, monkeypatch):
    def refused():
        raise PurgeRefused("integrity_failed")

    monkeypatch.setattr("journals.purge.check_integrity", refused)
    with pytest.raises(CommandError, match="integrity_failed"):
        command()
    assert not JournalPurgeRun.objects.exists()
