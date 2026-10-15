from importlib import import_module
from unittest.mock import Mock

import pytest
from django.db import OperationalError


@pytest.mark.parametrize(
    "module, poll",
    [
        ("notifications.management.commands.send_pending_notifications", "deliver_pending_emails"),
        (
            "identities.management.commands.send_password_reset_emails",
            "deliver_pending_password_emails",
        ),
    ],
)
@pytest.mark.parametrize("failure", [False, True])
def test_worker_releases_connections_after_success_or_lock_refusal(
    monkeypatch, module, poll, failure
):
    command = import_module(module)
    calls = []
    monkeypatch.setattr(command, "close_old_connections", lambda: calls.append("close"))

    def process():
        calls.append("poll")
        if failure:
            raise OperationalError("database is locked")
        return {}

    monkeypatch.setattr(command, poll, process)
    instance = command.Command(stdout=Mock())
    if failure:
        with pytest.raises(OperationalError, match="locked"):
            instance.handle(watch=False)
    else:
        instance.handle(watch=False)
    assert calls == ["close", "poll", "close"]
