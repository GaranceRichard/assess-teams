"""A real API passation overlaps a claimed SMTP job and a second worker process."""

import os
import subprocess
import sys
from pathlib import Path

import pytest

SETUP = """
import os, django
from django.conf import settings
settings.DATABASES['default']['NAME'] = os.environ['SQLITE_PROCESS_DB']
settings.EMAIL_DELIVER_ON_COMMIT = False
django.setup()
"""

WORKER = (
    SETUP
    + """
import sys
from unittest.mock import patch
from django.db import connection, connections
from notifications.delivery import deliver_email
def transport(message):
    assert not connection.in_atomic_block
    print('transport ready', flush=True)
    assert input() == 'continue'
    return 1
try:
    with patch('notifications.transport.EmailMessage.send', transport):
        print(deliver_email(sys.argv[1]), flush=True)
finally:
    connections.close_all()
"""
)

PARENT = (
    SETUP
    + r"""
import subprocess, sys
from django.core.management import call_command
from django.db import connections
from journals.models import ActivityEntry
from notifications.models import EmailNotification
from notifications.queue import enqueue_email
from tests.taking_helpers import taking_context, complete, client_for
call_command('migrate', verbosity=0)
_, coach, _, run = taking_context('Processes')
notification = enqueue_email(recipient='synthetic@example.com', subject='Probe', body='Probe')
command = [sys.executable, '-c', os.environ['SQLITE_WORKER_SCRIPT'], str(notification.pk)]
with subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                      stderr=subprocess.PIPE, text=True) as worker:
    try:
        ready = worker.stdout.readline().strip()
        assert ready == 'transport ready', ready + worker.stderr.read()
        # A separate process cannot claim the same job while SMTP is outstanding.
        contender = subprocess.run(command, input='', capture_output=True, text=True, timeout=15)
        assert contender.returncode == 0, contender.stderr
        assert contender.stdout.strip() == 'skipped'
        client = client_for(coach)
        assert complete(client, run).status_code == 200
        run.refresh_from_db()
        assert run.state == 'completed'
        assert list(run.questions.order_by('index').values_list('score', flat=True)) == [0, 10]
        assert ActivityEntry.objects.count() == 1
        assert EmailNotification.objects.get(pk=notification.pk).state == 'sending'
        output, error = worker.communicate('continue\n', timeout=15)
        assert worker.returncode == 0, error
        assert output.strip() == 'sent'
    finally:
        if worker.poll() is None:
            worker.kill()
            worker.communicate(timeout=5)
assert EmailNotification.objects.get(pk=notification.pk).state == 'sent'
assert ActivityEntry.objects.count() == 1
connections.close_all()
print('API and workers preserved business data and Journal')
"""
)


@pytest.mark.integration
@pytest.mark.functional
def test_api_and_two_workers_use_same_file_without_holding_writer_during_smtp(tmp_path):
    result = subprocess.run(
        [sys.executable, "-c", PARENT],
        cwd=Path(__file__).resolve().parents[1],
        env={
            **os.environ,
            "DJANGO_SETTINGS_MODULE": "config.settings_development",
            "SQLITE_PROCESS_DB": str(tmp_path / "business.sqlite3"),
            "SQLITE_WORKER_SCRIPT": WORKER,
        },
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "API and workers preserved business data and Journal" in result.stdout
