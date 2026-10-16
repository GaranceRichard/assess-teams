"""Opt-in replay for database-only transactions, never whole HTTP/SMTP operations."""

import logging
import sqlite3
import time
from functools import wraps

from django.core.management.base import CommandError
from django.db import OperationalError, connection, transaction

logger = logging.getLogger(__name__)
ATTEMPTS = 3
RETRY_WINDOW_SECONDS = 6.0
BACKOFF_SECONDS = (0.05, 0.1)
CONTENTION_FAILED = "La base est occupée. Veuillez réessayer dans quelques instants."


def is_sqlite_busy(error):
    cause = error.__cause__
    return (
        connection.vendor == "sqlite"
        and isinstance(error, OperationalError)
        and isinstance(cause, sqlite3.OperationalError)
        and getattr(cause, "sqlite_errorcode", 0) & 0xFF == sqlite3.SQLITE_BUSY
    )


def diagnose(operation, outcome, attempt=1, started=None, *, error=None, correlation_id="-"):
    logger.warning(
        "sqlite_contention operation=%s outcome=%s attempt=%s elapsed_ms=%s "
        "sqlite_code=%s correlation_id=%s",
        operation,
        outcome,
        attempt,
        round((time.monotonic() - started) * 1000) if started is not None else 0,
        getattr(getattr(error, "__cause__", None), "sqlite_errorcode", "-"),
        correlation_id,
    )


def retryable_sqlite_atomic(function):
    """Only annotate operations whose complete body is safe after a full rollback.

    A surrounding atomic block prevents replay. The first on_commit callback marks
    durability before any callback registered by the body can fail.
    """

    @wraps(function)
    def execute(*args, **kwargs):
        nested = connection.in_atomic_block or not connection.get_autocommit()
        started = time.monotonic()
        for attempt in range(1, ATTEMPTS + 1):
            committed = False

            def mark_committed():
                nonlocal committed
                committed = True

            try:
                with transaction.atomic():
                    transaction.on_commit(mark_committed)
                    result = function(*args, **kwargs)
            except OperationalError as error:
                if not is_sqlite_busy(error):
                    raise
                if nested or committed or connection.in_atomic_block:
                    diagnose(function.__name__, "non_replayable", attempt, started, error=error)
                    raise
                if attempt == ATTEMPTS:
                    diagnose(function.__name__, "exhausted", attempt, started, error=error)
                    raise
                if time.monotonic() - started >= RETRY_WINDOW_SECONDS:
                    diagnose(
                        function.__name__, "wait_budget_exhausted", attempt, started, error=error
                    )
                    raise
                diagnose(function.__name__, "retry_after_rollback", attempt, started, error=error)
                time.sleep(BACKOFF_SECONDS[attempt - 1])
                if time.monotonic() - started >= RETRY_WINDOW_SECONDS:
                    diagnose(
                        function.__name__, "wait_budget_exhausted", attempt, started, error=error
                    )
                    raise
            else:
                if attempt > 1:
                    diagnose(function.__name__, "resolved", attempt, started)
                return result

    return execute


def worker_contention(error, operation):
    """Fail the pass explicitly; a possibly accepted SMTP delivery is never replayed."""
    if not is_sqlite_busy(error):
        raise error
    diagnose(operation, "stopped_without_replay", error=error)
    return CommandError(CONTENTION_FAILED + " Passe arrêtée ; consulter les diagnostics.")
