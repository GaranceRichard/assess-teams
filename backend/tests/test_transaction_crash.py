import os
import sqlite3
import subprocess
import sys
from contextlib import closing
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest

SCRIPT = """
import os
import django
from django.conf import settings
settings.DATABASES['default']['NAME'] = os.environ['TRANSACTION_TEST_DB']
django.setup()
from django.core.management import call_command
from unittest.mock import patch
from assessments.application.taking import (
    start_evaluation, complete_evaluation, save_evaluation_score,
)
from assessments.models import EvaluationRunQuestion
from tests.taking_helpers import taking_context
call_command('migrate', verbosity=0)
_, coach, _, previous = taking_context('Committed')
start_evaluation(previous, coach)
for question in previous.questions.all():
    save_evaluation_score(previous, coach, question.source_question_id, 7)
complete_evaluation(previous, coach)
_, coach, _, pending = taking_context('Interrupted')
original = EvaluationRunQuestion.objects.bulk_create
def crash(questions):
    original(questions[:1])
    os._exit(23)
with patch('assessments.application.taking.EvaluationRunQuestion.objects.bulk_create', crash):
    start_evaluation(pending, coach)
"""


def assert_recovered(database):
    with closing(sqlite3.connect(database)) as connection:
        assert connection.execute("PRAGMA integrity_check").fetchall() == [("ok",)]
        assert connection.execute("PRAGMA foreign_key_check").fetchall() == []
        rows = connection.execute(
            "SELECT id, state, completed_by_id, completed_at FROM assessments_evaluationrun "
            "ORDER BY id"
        ).fetchall()
        assert len(rows) == 2
        committed, interrupted = rows
        assert committed[1] == "completed"
        assert committed[2] is not None and committed[3] is not None
        assert interrupted[1:] == ("not_started", None, None)
        assert connection.execute(
            "SELECT score FROM assessments_evaluationrunquestion WHERE run_id = ?",
            (committed[0],),
        ).fetchall() == [(7,), (7,)]
        assert connection.execute(
            "SELECT COUNT(*) FROM assessments_evaluationrunquestion WHERE run_id = ?",
            (interrupted[0],),
        ).fetchone() == (0,)
        assert connection.execute("SELECT COUNT(*) FROM journals_activityentry").fetchone() == (1,)


@pytest.mark.integration
@pytest.mark.functional
@pytest.mark.parametrize("environment", ["development", "production"])
def test_abrupt_process_exit_recovers_sqlite_without_partial_business_data(environment):
    backend = Path(__file__).resolve().parents[1]
    cache = backend / ".cache"
    cache.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="transaction-crash-", dir=cache) as directory:
        database = Path(directory) / "transactions.sqlite3"
        result = subprocess.run(
            [sys.executable, "-c", SCRIPT],
            cwd=backend,
            env={
                **os.environ,
                "DJANGO_SETTINGS_MODULE": f"config.settings_{environment}",
                "DJANGO_SECRET_KEY": "transaction-test-" + "only",
                "APP_BASE_URL": "http://testserver",
                "TRANSACTION_TEST_DB": str(database),
            },
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 23, result.stdout + result.stderr
        assert_recovered(database)
