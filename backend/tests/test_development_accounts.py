import importlib
import os
import subprocess
import sys
from pathlib import Path

import pytest
from django.contrib.auth import authenticate
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import override_settings

from development_data.management.commands.seed_development_users import (
    DEVELOPMENT_CREDENTIAL,
    DEVELOPMENT_IDENTITIES,
)
from identities.domain.users import Role
from identities.models import User
from tests.identity_helpers import TEST_CREDENTIAL, create_user


@pytest.mark.django_db
@pytest.mark.functional
def test_bootstrap_creates_active_authenticatable_development_identities() -> None:
    call_command("seed_development_users", verbosity=0)

    assert User.objects.count() == 3
    for username, email, role in DEVELOPMENT_IDENTITIES:
        user = User.objects.get(username=username)
        assert user.email == email
        assert user.role == role.value
        assert user.is_active
        assert not user.is_superuser
        assert user.check_password(DEVELOPMENT_CREDENTIAL)
        assert authenticate(username=username, password=DEVELOPMENT_CREDENTIAL) == user


@pytest.mark.django_db
@pytest.mark.functional
def test_bootstrap_is_idempotent() -> None:
    call_command("seed_development_users", verbosity=0)
    original_ids = set(User.objects.values_list("id", flat=True))
    original_passwords = set(User.objects.values_list("password", flat=True))

    call_command("seed_development_users", verbosity=0)

    assert User.objects.count() == 3
    assert set(User.objects.values_list("id", flat=True)) == original_ids
    assert set(User.objects.values_list("password", flat=True)) == original_passwords


@pytest.mark.django_db
@pytest.mark.functional
def test_bootstrap_reconciles_legacy_and_duplicate_development_identities() -> None:
    legacy = User.objects.create_user(
        username="admin.dev@assess-teams.local",
        email="admin.dev@assess-teams.local",
        password=DEVELOPMENT_CREDENTIAL,
        role=Role.ADMIN.value,
    )
    User.objects.create_user(
        username="Admin",
        email="changed@example.com",
        password=TEST_CREDENTIAL,
        role=Role.ADMIN.value,
        is_active=False,
    )

    call_command("seed_development_users", verbosity=0)

    admin = User.objects.get(username="Admin")
    assert admin.email == "admin.dev@assess-teams.local"
    assert admin.is_active
    assert admin.check_password(DEVELOPMENT_CREDENTIAL)
    assert not User.objects.filter(id=legacy.id).exists()
    assert User.objects.count() == 3


@pytest.mark.django_db
def test_bootstrap_preserves_existing_manual_accounts() -> None:
    manual = create_user("manual-user", Role.VIEWER)

    call_command("seed_development_users", verbosity=0)

    manual.refresh_from_db()
    assert manual.role == Role.VIEWER.value
    assert manual.check_password(TEST_CREDENTIAL)
    assert User.objects.count() == 4


@pytest.mark.django_db
def test_bootstrap_rejects_a_conflict_without_modifying_the_identity() -> None:
    username = DEVELOPMENT_IDENTITIES[0][0]
    existing = create_user(username, Role.VIEWER, is_active=False)

    with pytest.raises(CommandError, match="Reserved development identity conflicts"):
        call_command("seed_development_users", verbosity=0)

    existing.refresh_from_db()
    assert existing.role == Role.VIEWER.value
    assert not existing.is_active
    assert existing.check_password(TEST_CREDENTIAL)
    assert User.objects.count() == 1


@pytest.mark.django_db
@override_settings(ENVIRONMENT="production")
def test_bootstrap_is_blocked_in_production() -> None:
    with pytest.raises(CommandError, match="disabled outside development"):
        call_command("seed_development_users", verbosity=0)

    assert User.objects.count() == 0


def test_production_settings_do_not_load_development_mechanism(monkeypatch) -> None:
    monkeypatch.setenv("DJANGO_SECRET_KEY", "production-test-key")
    monkeypatch.setenv("APP_BASE_URL", "https://assess-teams.example")
    production = importlib.import_module("config.settings_production")

    assert production.ENVIRONMENT == "production"
    assert production.DEBUG is False
    assert "development_data" not in production.INSTALLED_APPS


def test_manage_py_defaults_to_production_without_seed_command() -> None:
    backend = Path(__file__).resolve().parents[1]
    environment = os.environ.copy()
    environment.pop("DJANGO_SETTINGS_MODULE", None)
    environment["DJANGO_SECRET_KEY"] = "production-test-key"
    environment["APP_BASE_URL"] = "https://assess-teams.example"

    environment_result = subprocess.run(
        [
            sys.executable,
            "manage.py",
            "shell",
            "-c",
            "from django.conf import settings; print(settings.ENVIRONMENT)",
        ],
        cwd=backend,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    seed_result = subprocess.run(
        [sys.executable, "manage.py", "seed_development_users"],
        cwd=backend,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )

    assert environment_result.returncode == 0
    assert "production" in environment_result.stdout
    assert seed_result.returncode != 0
    assert "Unknown command" in seed_result.stderr
