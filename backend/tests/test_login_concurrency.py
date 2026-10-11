import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest


@pytest.mark.integration
@pytest.mark.functional
def test_parallel_login_failures_are_serialized_across_database_connections():
    script = """
import threading
from concurrent.futures import ThreadPoolExecutor
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = __import__('os').environ['LOGIN_TEST_DB']
settings.LOGIN_ACCOUNT_LIMIT = 2
settings.LOGIN_ORIGIN_LIMIT = 2
django.setup()
from django.core.management import call_command
from django.db import connections
from identities.application.login_limits import authenticate_limited
from identities.password_models import PasswordRateLimit
call_command('migrate', verbosity=0)
for mode in ['account', 'origin']:
    PasswordRateLimit.objects.all().delete()
    barrier = threading.Barrier(4)
    def attempt(index):
        try:
            barrier.wait(timeout=10)
            username = 'absent' if mode == 'account' else f'absent-{index}'
            origin = f'192.0.2.{index}' if mode == 'account' else '192.0.2.1'
            user, wait = authenticate_limited(None, username, 'synthetic-wrong', origin)
            assert user is None
            return bool(wait)
        finally:
            connections.close_all()
    with ThreadPoolExecutor(max_workers=4) as pool:
        assert sorted(pool.map(attempt, range(4))) == [False, True, True, True]
    assert max(PasswordRateLimit.objects.values_list('count', flat=True)) == 2
print('login concurrency preserved')
"""
    cache = Path(__file__).resolve().parents[1] / ".cache"
    cache.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="login-concurrency-", dir=cache) as directory:
        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=cache.parent,
            env={
                **os.environ,
                "DJANGO_SETTINGS_MODULE": "config.settings_development",
                "LOGIN_TEST_DB": str(Path(directory) / "login.sqlite3"),
            },
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        assert "login concurrency preserved" in result.stdout
