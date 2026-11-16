import importlib

import pytest
from django.core.management import call_command

pytestmark = pytest.mark.functional


@pytest.mark.parametrize("mode,expected", [("production", 73), ("development", 5), ("test", 5)])
@pytest.mark.parametrize(
    "module,command,delivery",
    [
        (
            "notifications.management.commands.send_pending_notifications",
            "send_pending_notifications",
            "deliver_pending_emails",
        ),
        (
            "identities.management.commands.send_password_reset_emails",
            "send_password_reset_emails",
            "deliver_pending_password_emails",
        ),
    ],
)
def test_watch_consumes_production_frequency_and_preserves_local_modes(
    settings,
    monkeypatch,
    mode,
    expected,
    module,
    command,
    delivery,
):
    settings.ENVIRONMENT = mode
    settings.INSTALLATION = {"services": {"delivery_seconds": 73}}
    worker = importlib.import_module(module)
    monkeypatch.setattr(worker, delivery, lambda: {})
    monkeypatch.setattr(worker, "close_old_connections", lambda: None)
    pauses = []

    def stop(seconds):
        pauses.append(seconds)
        raise StopIteration

    monkeypatch.setattr(worker.time, "sleep", stop)
    with pytest.raises(StopIteration):
        call_command(command, watch=True)
    assert pauses == [expected]
