import json
import subprocess
import sys
from pathlib import Path

import pytest

from tests.startup_helpers import production_environment

SCRIPT = """
import json, os, sqlite3, subprocess, sys
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = os.environ['SQLITE_PROBE_DB']
django.setup()
from django.db import connection, transaction
from identities.models import User
options = settings.DATABASES['default']
assert options['CONN_MAX_AGE'] == 0
assert options['ATOMIC_REQUESTS'] is False
assert options['OPTIONS']['timeout'] == 5
assert options['OPTIONS']['transaction_mode'] == 'DEFERRED'
for _ in range(2):
    with connection.cursor() as cursor:
        for pragma, expected in [('journal_mode', 'delete'), ('synchronous', 2),
                                 ('busy_timeout', 5000), ('foreign_keys', 1),
                                 ('locking_mode', 'normal'), ('read_uncommitted', 0)]:
            assert cursor.execute('PRAGMA ' + pragma).fetchone()[0] == expected
    connection.close()
with connection.cursor() as cursor:
    cursor.execute('CREATE TABLE identities_user (id INTEGER PRIMARY KEY, username TEXT)')
    cursor.execute("INSERT INTO identities_user VALUES (1, 'Before')")
sql = str(User.objects.select_for_update().only('id', 'username').query)
assert 'FOR UPDATE' not in sql
assert not connection.features.has_select_for_update
peer = '''
import sqlite3, sys
c = sqlite3.connect(sys.argv[1], timeout=0.1, isolation_level=None)
c.execute('BEGIN IMMEDIATE')
c.execute("UPDATE identities_user SET username='Peer' WHERE id=1")
c.execute(sys.argv[2])
c.close()
'''
for journal in ['DELETE', 'WAL']:
    with connection.cursor() as cursor:
        cursor.execute('PRAGMA journal_mode=' + journal)
    with transaction.atomic():
        selected = User.objects.select_for_update().only('id', 'username').get(pk=1)
        assert selected.username == 'Before'
        result = subprocess.run([sys.executable, '-c', peer, str(connection.settings_dict['NAME']),
                                 'COMMIT' if journal == 'WAL' else 'ROLLBACK'],
                                capture_output=True, text=True, timeout=10)
        # The other process acquired a writer lock and updated the selected row.
        assert result.returncode == 0, result.stderr
        if journal == 'WAL':
            try:
                User.objects.filter(pk=1).update(username='Stale')
            except django.db.OperationalError as error:
                assert error.__cause__.sqlite_errorname == 'SQLITE_BUSY_SNAPSHOT'
            else:
                raise AssertionError('Stale read unexpectedly upgraded to writer')
connection.close()
print(json.dumps({'select_for_update': False, 'wal_upgrade': 'SQLITE_BUSY_SNAPSHOT'}))
"""


@pytest.mark.integration
@pytest.mark.functional
@pytest.mark.parametrize("environment", ["development", "production"])
def test_real_django_connections_and_ineffective_row_lock(tmp_path, environment):
    result = subprocess.run(
        [sys.executable, "-c", SCRIPT],
        cwd=Path(__file__).resolve().parents[1],
        env={
            **production_environment(),
            "DJANGO_SETTINGS_MODULE": f"config.settings_{environment}",
            "APP_BASE_URL": f"{'https' if environment == 'production' else 'http'}://testserver",
            "SQLITE_PROBE_DB": str(tmp_path / "django.sqlite3"),
        },
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert json.loads(result.stdout) == {
        "select_for_update": False,
        "wal_upgrade": "SQLITE_BUSY_SNAPSHOT",
    }
