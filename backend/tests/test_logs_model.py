import pytest
from django.db import IntegrityError, transaction

from journals.models import LogEntry, LogLevel, LogSource
from journals.services import record_log


@pytest.mark.django_db
@pytest.mark.parametrize("level", list(LogLevel.values))
def test_log_levels_are_accepted(level: str) -> None:
    entry = record_log(
        level=level,
        source=LogSource.SYSTEM,
        message=f"Événement {level}",
    )

    assert entry.level == level


@pytest.mark.django_db
def test_invalid_log_level_is_refused() -> None:
    with pytest.raises(ValueError, match="Niveau"):
        record_log(level="DEBUG", source=LogSource.SYSTEM, message="Diagnostic")

    with pytest.raises(IntegrityError), transaction.atomic():
        LogEntry.objects.create(level="DEBUG", source=LogSource.SYSTEM, message="Diagnostic")


@pytest.mark.django_db
def test_log_service_redacts_sensitive_and_technical_details() -> None:
    sensitive = record_log(
        level=LogLevel.ERROR,
        source=LogSource.SYSTEM,
        message="password=private-token; cookie=session-secret; credential=hidden",
    )
    technical = record_log(
        level=LogLevel.ERROR,
        source=LogSource.SYSTEM,
        message='Traceback (most recent call last): File "internal.py", line 12',
    )
    environment = record_log(
        level=LogLevel.WARNING,
        source=LogSource.SYSTEM,
        message="DJANGO_SETTINGS_MODULE=config.settings; INTERNAL_PATH=C:\\private",
    )

    exposed = f"{sensitive.message} {technical.message} {environment.message}".lower()
    assert "private-token" not in exposed
    assert "session-secret" not in exposed
    assert "traceback" not in exposed
    assert "password" not in exposed
    assert "cookie" not in exposed
    assert "credential" not in exposed
    assert "config.settings" not in exposed
    assert "c:\\private" not in exposed
    assert technical.message == "Détail applicatif indisponible."
