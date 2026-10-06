import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest


@pytest.mark.integration
@pytest.mark.functional
def test_two_last_admin_operations_serialize_on_file_backed_sqlite():
    script = """
import threading
from concurrent.futures import ThreadPoolExecutor
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = __import__('os').environ['LIFECYCLE_TEST_DB']
settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
django.setup()
from django.core.management import call_command
from django.db import connections
from rest_framework.test import APIClient
from identities.models import Organization, User
call_command('migrate', verbosity=0)
root = User.objects.create(username='root', is_superuser=True)
org = Organization.objects.create(name='Concurrency')
admins = [User.objects.create(username=f'admin{i}', role='Admin') for i in range(2)]
org.users.add(*admins)
barrier = threading.Barrier(2)
def operate(item):
    pk, action = item
    try:
        client = APIClient()
        client.force_authenticate(User.objects.get(pk=root.pk))
        barrier.wait(timeout=10)
        if action == 'demote':
            return client.put(f'/api/admin/users/{pk}/', {
                'identifier': f'updated{pk}', 'email': f'a{pk}@example.com', 'role': 'Coach'
            }, format='json').status_code
        if action == 'detach':
            return client.put(f'/api/admin/organizations/{org.pk}/members/', {
                'user_ids': [other.pk for other in admins if other.pk != pk]
            }, format='json').status_code
        return client.post(f'/api/admin/users/{pk}/deactivate/').status_code
    finally:
        connections.close_all()
for actions in [('deactivate', 'deactivate'), ('demote', 'deactivate'), ('detach', 'deactivate')]:
    User.objects.filter(pk__in=[user.pk for user in admins]).update(is_active=True, role='Admin')
    org.users.set(admins)
    barrier = threading.Barrier(2)
    with ThreadPoolExecutor(max_workers=2) as pool:
        statuses = sorted(pool.map(operate, zip([u.pk for u in admins], actions)))
    assert statuses == [200, 400], (actions, statuses)
    assert org.users.filter(role='Admin', is_active=True).count() == 1
print('concurrency invariant preserved')
"""
    cache = Path(__file__).resolve().parents[1] / ".cache"
    cache.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="lifecycle-concurrency-", dir=cache) as directory:
        environment = {
            **os.environ,
            "DJANGO_SETTINGS_MODULE": "config.settings_development",
            "LIFECYCLE_TEST_DB": str(Path(directory) / "lifecycle.sqlite3"),
        }
        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=cache.parent,
            env=environment,
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        assert "concurrency invariant preserved" in result.stdout
