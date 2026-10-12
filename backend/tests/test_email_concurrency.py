import os
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest


@pytest.mark.integration
@pytest.mark.functional
def test_two_workers_claim_each_email_once_on_file_sqlite_without_network_writer_lock():
    script = """
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = __import__('os').environ['EMAIL_TEST_DB']
settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
settings.EMAIL_DELIVER_ON_COMMIT = False
django.setup()
from django.core.management import call_command
from django.db import connections, connection, transaction
from identities.models import User
from identities.password_models import PasswordResetDelivery
from identities.application.password_delivery import (
    deliver_password_email, deliver_pending_password_emails
)
from notifications.queue import enqueue_email
from notifications.delivery import deliver_email, deliver_pending_emails
from notifications.models import EmailNotification
call_command('migrate', verbosity=0)
notification = enqueue_email(recipient='member@example.com', subject='Test', body='Message')
credential = 'Synthetic-' + __import__('uuid').uuid4().hex
user = User.objects.create_user(username='member', email='member@example.com',
                                role='Coach', password=credential)
password_job = PasswordResetDelivery.objects.create(email=user.email)
sent = []
def transport(message):
    assert not connection.in_atomic_block
    # Another write can complete while the network send is in progress.
    with ThreadPoolExecutor(max_workers=1) as writer:
        def write():
            try:
                User.objects.filter(pk=user.pk).update(first_name='Concurrent')
            finally:
                connections.close_all()
        writer.submit(write).result(timeout=5)
    sent.append(message.extra_headers['Message-ID'])
    time.sleep(0.1)
    return 1
for deliver, pk, expected in [(deliver_email, notification.pk, 'sent'),
                              (deliver_password_email, password_job.pk, 'sent')]:
    barrier = threading.Barrier(2)
    def work(index):
        try:
            barrier.wait(timeout=5)
            return deliver(pk)
        finally:
            connections.close_all()
    with patch('notifications.transport.EmailMessage.send', transport):
        with ThreadPoolExecutor(max_workers=2) as pool:
            assert sorted(pool.map(work, range(2))) == [expected, 'skipped']
assert len(sent) == 2 and len(set(sent)) == 2
assert EmailNotification.objects.get().state == 'sent'
# Idle pollers must not compete for a writer lock with a business transaction.
with transaction.atomic():
    User.objects.get(pk=user.pk)
    def poll():
        try:
            assert deliver_pending_emails() == {}
            assert not any(deliver_pending_password_emails().values())
        finally:
            connections.close_all()
    with ThreadPoolExecutor(max_workers=1) as pool:
        pool.submit(poll).result(timeout=15)
    User.objects.filter(pk=user.pk).update(last_name='Business completed')
print('email concurrency preserved')
"""
    cache = Path(__file__).resolve().parents[1] / ".cache"
    cache.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="email-concurrency-", dir=cache) as directory:
        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=cache.parent,
            env={
                **os.environ,
                "DJANGO_SETTINGS_MODULE": "config.settings_development",
                "EMAIL_TEST_DB": str(Path(directory) / "email.sqlite3"),
            },
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        assert "email concurrency preserved" in result.stdout
