"""Spawned Django peers; signals bracket real SQL and transaction boundaries."""

import logging
import time
from contextlib import ExitStack
from unittest.mock import patch


def configure(path):
    import django
    from django.conf import settings

    settings.DATABASES["default"]["NAME"] = path
    settings.EMAIL_DELIVER_ON_COMMIT = False
    django.setup()
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


def receive(pipe, expected=None):
    assert pipe.poll(15), "Peer did not signal before deadline"
    value = pipe.recv()
    if expected is not None:
        assert value == expected, value
    return value


def pause(pipe, event):
    pipe.send(event)
    receive(pipe, "continue")


class RetrySignals(logging.Handler):
    def __init__(self, pipe):
        super().__init__()
        self.pipe = pipe

    def emit(self, record):
        if "retry_after_rollback" in record.getMessage():
            from django.db import connection

            assert not connection.in_atomic_block
            assert connection.get_autocommit()
            pause(self.pipe, "retry")


def child(pipe, path, kind, data):
    from tests.sqlite_contention_api import api_operation

    configure(path)
    from django.db import OperationalError, connection, connections, transaction

    from config.sqlite_contention import is_sqlite_busy, worker_contention
    from identities.application.password_delivery import deliver_password_email
    from identities.password_models import PasswordResetDelivery
    from notifications.delivery import deliver_email
    from teams.models import Team

    logging.getLogger("config.sqlite_contention").addHandler(RetrySignals(pipe))
    logging.getLogger("config.sqlite_contention").addHandler(logging.StreamHandler())
    try:
        with ExitStack() as stack:
            if kind.startswith("api"):
                invoke = api_operation(pipe, kind, data, stack)
            elif kind.startswith("password"):
                if kind == "password_hold":
                    original = PasswordResetDelivery.save

                    def save(delivery, *args, **kwargs):
                        original(delivery, *args, **kwargs)
                        pause(pipe, "written")

                    stack.enter_context(patch.object(PasswordResetDelivery, "save", save))

                def invoke():
                    return deliver_password_email(data["password"])
            elif kind.startswith("due"):
                from django.utils import timezone

                from assessments.application import schedule_notifications as schedules
                from assessments.models import EvaluationSchedule

                if kind == "due_hold":
                    original = schedules.send_due_notification

                    def enqueue(schedule):
                        count = original(schedule)
                        pause(pipe, "written")
                        return count

                    stack.enter_context(patch.object(schedules, "send_due_notification", enqueue))

                def invoke():
                    return schedules.deliver_due_schedule(
                        EvaluationSchedule.objects.get(pk=data["schedule"]), timezone.localdate()
                    )
            elif kind == "email":

                def invoke():
                    return deliver_email(data["email"])
            else:
                invoke = None

            def transport(message):
                assert not connection.in_atomic_block
                pause(pipe, "smtp")
                return 1

            stack.enter_context(patch("notifications.transport.EmailMessage.send", transport))
            connection.ensure_connection()
            connection.cursor().execute("PRAGMA busy_timeout=100")
            pipe.send("ready")
            receive(pipe, "go")
            if kind in {"writer", "reader"}:
                with transaction.atomic():
                    if kind == "writer":
                        Team.objects.filter(pk=data["team"]).update(name="Writer")
                        if data.get("invalidate"):
                            PasswordResetDelivery.objects.update(state="failed")
                    else:
                        Team.objects.get(pk=data["team"])
                    pause(pipe, "held")
                result = "released"
            else:
                announced = False

                def sql(execute, query, params, many, context):
                    nonlocal announced
                    if not announced and query.startswith(("UPDATE", "INSERT")):
                        announced = True
                        pipe.send("write_attempt")
                    return execute(query, params, many, context)

                started = time.monotonic()
                try:
                    with connection.execute_wrapper(sql):
                        result = invoke()
                except OperationalError as error:
                    assert is_sqlite_busy(error)
                    result = str(worker_contention(error, kind))
                pipe.send(["elapsed", time.monotonic() - started])
            pipe.send(["result", result])
    finally:
        connections.close_all()
        pipe.close()
