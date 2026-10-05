import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest


@pytest.mark.integration
@pytest.mark.functional
def test_concurrent_copies_and_validation_serialize_on_real_sqlite():
    # File-backed SQLite exercises the production locking behavior; pytest's
    # shared in-memory database returns SQLITE_LOCKED without the busy timeout.
    script = """
import json
import threading
from concurrent.futures import ThreadPoolExecutor
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = __import__('os').environ['VERSION_TEST_DB']
django.setup()
from django.core.management import call_command
from django.db import connections
from rest_framework.test import APIClient
from assessments.application.versioning import create_next_version
from assessments.models import Evaluation, Question
from identities.models import Organization, User
call_command('migrate', verbosity=0)
org = Organization.objects.create(name='Concurrency')
actor = User.objects.create(username='admin', role='Admin', is_active=True)
org.users.add(actor)
source = Evaluation.objects.create(organization=org, index=1, name='Agile', status='VALIDATED')
Question.objects.create(evaluation=source, index=3, name='Criterion')
barrier = threading.Barrier(2)
def copy(_):
    try:
        user = User.objects.get(pk=actor.pk)
        barrier.wait(timeout=10)
        return create_next_version(source.pk, user).version
    finally:
        connections.close_all()
with ThreadPoolExecutor(max_workers=2) as workers:
    versions = sorted(workers.map(copy, range(2)))
assert versions == [2, 3], versions
assert Evaluation.objects.filter(family_id=source.family_id).count() == 3
assert list(source.questions.values_list('index', 'name')) == [(3, 'Criterion')]
barrier = threading.Barrier(2)
ids = list(Evaluation.objects.filter(version__in=[2, 3]).values_list('pk', flat=True))
def validate(pk):
    try:
        client = APIClient()
        client.force_authenticate(User.objects.get(pk=actor.pk))
        barrier.wait(timeout=10)
        return client.post(f'/api/admin/evaluations/{pk}/validate/').status_code
    finally:
        connections.close_all()
with ThreadPoolExecutor(max_workers=2) as workers:
    statuses = list(workers.map(validate, ids))
assert statuses == [200, 200], statuses
assert Evaluation.objects.filter(family_id=source.family_id, status='VALIDATED').count() == 1
assert Evaluation.objects.filter(family_id=source.family_id, status='ARCHIVED').count() == 2
print(json.dumps({'versions': versions, 'validation_statuses': statuses}))
"""
    cache = Path(__file__).resolve().parents[1] / ".cache"
    cache.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="version-concurrency-", dir=cache) as directory:
        assert Path(directory).resolve().parent == cache.resolve()
        environment = {
            **os.environ,
            "DJANGO_SETTINGS_MODULE": "config.settings_development",
            "VERSION_TEST_DB": str(Path(directory) / "versions.sqlite3"),
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
        assert '"versions": [2, 3]' in result.stdout
