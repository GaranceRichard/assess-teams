"""File-backed scenarios; no pytest database or timing-only synchronization."""

import multiprocessing
import sqlite3
import sys
from contextlib import closing
from pathlib import Path

from tests.organization_delete_process import child
from tests.sqlite_contention_harness import Peers, result
from tests.sqlite_contention_process import configure, receive


class DeletionPeers(Peers):
    def start(self, kind, data):
        context = multiprocessing.get_context("spawn")
        parent, remote = context.Pipe()
        process = context.Process(target=child, args=(remote, self.path, kind, data))
        process.start()
        remote.close()
        self.children.append((process, parent))
        receive(parent, "ready")
        return parent


def setup(path, kind):
    configure(str(path))
    from django.core.management import call_command
    from django.db import connections

    from identities.models import Organization, User
    from tests.taking_helpers import taking_context

    call_command("migrate", verbosity=0)
    root = User.objects.create(username="root", is_superuser=True)
    data = {"root": root.pk}
    if kind in {"plan", "start"}:
        organization, coach, _, run = taking_context("Concurrent")
        coach.email = "synthetic@example.com"
        coach.save()
        data.update(team=run.team_id, evaluation=run.evaluation_id, coach=coach.pk, run=run.pk)
        if kind == "plan":
            schedule = run.schedule
            run.delete()
            schedule.delete()
    else:
        organization = Organization.objects.create(name="Concurrent")
    data["organization"] = organization.pk
    connections.close_all()
    return data


def paired(path, first_kind, second_kind, data):
    with DeletionPeers(path) as peers:
        first = peers.start(first_kind, {**data, "hold": True})
        second = peers.start(second_kind, data)
        first.send("go")
        receive(first, "write_attempt")
        receive(first, "written")
        second.send("go")
        receive(second, "write_attempt")
        first.send("continue")
        return result(first), result(second)


def retry_start(path, data):
    with DeletionPeers(path) as peers:
        peer = peers.start("start", data)
        peer.send("go")
        receive(peer, "write_attempt")
        assert result(peer)[0] == 200


def run(kind, deletion_first, path):
    data = setup(path, kind)
    first_kind, second_kind = ("delete", kind) if deletion_first else (kind, "delete")
    first, second = paired(path, first_kind, second_kind, data)
    deletion, operation = (first, second) if deletion_first else (second, first)
    dependencies = kind in {"plan", "start"} or (
        not deletion_first and kind in {"team", "notification"}
    )
    assert deletion[0] == (400 if dependencies else 204), (kind, first, second)
    if kind == "delete":
        assert second[0] == 404, second
    elif kind == "start":
        assert operation[0] in ({200, 500} if deletion_first else {200}), operation
        if operation[0] == 500:
            with closing(sqlite3.connect(path)) as db:
                assert db.execute("SELECT state FROM assessments_evaluationrun").fetchone() == (
                    "not_started",
                )
                assert db.execute(
                    "SELECT count(*) FROM assessments_evaluationrunquestion"
                ).fetchone() == (0,)
            retry_start(path, data)
    else:
        expected = (
            201 if kind == "log" or dependencies else (409 if kind == "notification" else 404)
        )
        assert operation[0] == expected, (kind, first, second)
    with closing(sqlite3.connect(path)) as db:
        assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
        assert db.execute("PRAGMA foreign_key_check").fetchall() == []
        assert db.execute("SELECT count(*) FROM identities_organization").fetchone() == (
            int(dependencies),
        )
        assert db.execute(
            "SELECT count(*) FROM journals_activityentry WHERE action='organization_deleted'"
        ).fetchone() == (int(not dependencies),)
        if kind == "log":
            trace = db.execute(
                "SELECT organization_id, organization_origin_id, organization_name "
                "FROM journals_logentry WHERE message='Late trace'"
            ).fetchone()
            assert trace == (None, data["organization"], "Concurrent"), trace
        if kind == "notification":
            assert db.execute(
                "SELECT count(*) FROM notifications_emailnotification"
            ).fetchone() == (int(dependencies),)
        if kind == "start":
            assert db.execute("SELECT state FROM assessments_evaluationrun").fetchone() == (
                "in_progress",
            )
            assert db.execute(
                "SELECT count(*) FROM assessments_evaluationrunquestion"
            ).fetchone() == (2,)
        if kind == "plan":
            assert db.execute("SELECT count(*) FROM assessments_evaluationschedule").fetchone() == (
                1,
            )
    print(f"qualified organization deletion: {kind}, deletion_first={deletion_first}", flush=True)


if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2] == "first", Path(sys.argv[3]))
