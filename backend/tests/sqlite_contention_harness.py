"""Parent owns synchronization, bounded joins and post-close integrity checks."""

import multiprocessing
import sqlite3
from contextlib import AbstractContextManager, closing

from tests.sqlite_contention_process import child, configure, receive


class Peers(AbstractContextManager):
    def __init__(self, path):
        self.path = str(path)
        self.children = []

    def start(self, kind, data):
        context = multiprocessing.get_context("spawn")
        parent, remote = context.Pipe()
        process = context.Process(target=child, args=(remote, self.path, kind, data))
        process.start()
        remote.close()
        self.children.append((process, parent))
        receive(parent, "ready")
        return parent

    def __exit__(self, *error):
        for process, pipe in self.children:
            process.join(timeout=3 if error[0] else 15)
            if process.is_alive():
                process.kill()
                process.join(timeout=5)
            pipe.close()
            if not error[0]:
                assert process.exitcode == 0, process.exitcode


def result(pipe):
    event = receive(pipe)
    if event[0] == "elapsed":
        assert 0 <= event[1] < 5, event
        event = receive(pipe)
    assert event[0] == "result", event
    return event[1]


def setup(path):
    configure(str(path))
    from django.core.management import call_command
    from django.db import connections

    from identities.password_models import PasswordResetDelivery
    from notifications.queue import enqueue_email
    from tests.taking_helpers import taking_context

    call_command("migrate", verbosity=0)
    organization, coach, admin, run = taking_context("Contention")
    coach.email = "synthetic@example.com"
    coach.save(update_fields=["email"])
    schedule = run.schedule
    schedule.next_due_date = schedule.first_due_date
    schedule.save(update_fields=["next_due_date"])
    password = PasswordResetDelivery.objects.create(email=coach.email)
    email = enqueue_email(recipient=coach.email, subject="Synthetic", body="Synthetic")
    data = dict(
        organization=organization.pk,
        admin=admin.pk,
        team=run.team_id,
        schedule=run.schedule_id,
        password=password.pk,
        email=str(email.pk),
        name="Created",
    )
    connections.close_all()
    return data


def verify(path, *, teams=0, activities=0, password="pending", email="pending"):
    # No Django connection or child remains when these invariants are inspected.
    with closing(sqlite3.connect(path)) as db:
        assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
        assert db.execute("PRAGMA foreign_key_check").fetchall() == []
        assert db.execute(
            "SELECT count(*) FROM teams_team WHERE name LIKE 'Created%'"
        ).fetchone() == (teams,)
        assert db.execute("SELECT count(*) FROM journals_activityentry").fetchone() == (activities,)
        entries = db.execute("SELECT team_id, team_name FROM journals_activityentry").fetchall()
        created = db.execute(
            "SELECT id, name FROM teams_team WHERE name LIKE 'Created%'"
        ).fetchall()
        assert sorted(entries) == sorted(created)
        rows = db.execute("SELECT state, attempts FROM identities_passwordresetdelivery").fetchall()
        assert rows == ([] if password == "sent" else [(password, 0)]), rows
        assert db.execute("SELECT state FROM notifications_emailnotification").fetchone() == (
            email,
        )
        assert db.execute(
            "SELECT attempts FROM notifications_emailnotification ORDER BY created_at"
        ).fetchone() == (1 if email == "sending" else 0,)
