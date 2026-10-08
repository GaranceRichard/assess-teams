import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest


@pytest.mark.integration
@pytest.mark.functional
def test_simultaneous_reset_redemptions_and_rate_limits_serialize_on_sqlite():
    script = """
import threading
from concurrent.futures import ThreadPoolExecutor
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = __import__('os').environ['PASSWORD_TEST_DB']
django.setup()
from django.core.management import call_command
from django.core.exceptions import ValidationError
from django.db import connections
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from identities.application.passwords import recovery_tokens, reset_password
from identities.application.password_limits import allow_password_attempt
from identities.models import User
call_command('migrate', verbosity=0)
initial_credential = 'Concurrency-test-initial!'
user = User.objects.create_user(
    username='member', role='Viewer', password=initial_credential
)
uid = urlsafe_base64_encode(force_bytes(user.pk))
token = recovery_tokens.make_token(user)
barrier = threading.Barrier(2)
def redeem(index):
    try:
        barrier.wait(timeout=10)
        phrase = f'Concurrency-test-renewed-{index}!'
        reset_password(uid, token, phrase, phrase)
        return 'changed'
    except ValidationError:
        return 'refused'
    finally:
        connections.close_all()
with ThreadPoolExecutor(max_workers=2) as pool:
    assert sorted(pool.map(redeem, range(2))) == ['changed', 'refused']
barrier = threading.Barrier(2)
def rate(index):
    try:
        barrier.wait(timeout=10)
        return allow_password_attempt('concurrency', 'synthetic', 1, 60)
    finally:
        connections.close_all()
with ThreadPoolExecutor(max_workers=2) as pool:
    assert sorted(pool.map(rate, range(2))) == [False, True]
print('password concurrency preserved')
"""
    cache = Path(__file__).resolve().parents[1] / ".cache"
    cache.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="password-concurrency-", dir=cache) as directory:
        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=cache.parent,
            env={
                **os.environ,
                "DJANGO_SETTINGS_MODULE": "config.settings_development",
                "PASSWORD_TEST_DB": str(Path(directory) / "password.sqlite3"),
            },
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        assert "password concurrency preserved" in result.stdout
