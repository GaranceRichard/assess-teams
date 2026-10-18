"""Dedicated fixtures and bounded peers; each scenario owns its SQLite file."""

import multiprocessing

from tests.sqlite_contention_harness import Peers
from tests.sqlite_contention_process import configure, receive
from tests.sqlite_critical_process import child


class CriticalPeers(Peers):
    def start(self, kind, data):
        context = multiprocessing.get_context("spawn")
        parent, remote = context.Pipe()
        process = context.Process(target=child, args=(remote, self.path, kind, data))
        process.start()
        remote.close()
        self.children.append((process, parent))
        receive(parent, "ready")
        return parent


def setup(path, case):
    configure(str(path))
    from django.core.management import call_command
    from django.db import connections

    from assessments.application.taking import start_evaluation
    from assessments.application.versioning import create_next_version
    from identities.models import User
    from journals.models import ActivityEntry
    from tests.taking_helpers import taking_context

    call_command("migrate", verbosity=0)
    organization, coach, admin, run = taking_context("Critical")
    root = User.objects.create(username="root", is_superuser=True)
    other_root = User.objects.create(username="other-root", is_superuser=True)
    other_admin = User.objects.create(username="second-admin", role="Admin")
    organization.users.add(other_admin)
    start_evaluation(run, coach)
    run.questions.update(score=4)
    if case.endswith(("deactivate", "demote", "admins")):
        run.schedule.assignee = admin
        run.schedule.save(update_fields=["assignee"])
    source = run.evaluation
    if case in {
        "copy_validate",
        "validate_copy_archived",
        "validate_edit",
        "double_validate",
        "stale_copy",
        "copy_edit",
    }:
        source = create_next_version(source.pk, admin)
    for user in (admin, other_admin):
        user.email = f"{user.username.lower()}@example.com"
        user.save(update_fields=["email"])
    ActivityEntry.objects.all().delete()
    data = dict(
        actor=root.pk,
        other_actor=other_root.pk,
        coach=coach.pk,
        admin=admin.pk,
        other_admin=other_admin.pk,
        organization=organization.pk,
        run=run.pk,
        team=run.team_id,
        evaluation=source.pk,
        family=source.family_id,
        original=run.evaluation_id,
        question=run.questions.order_by("index").first().source_question_id,
        target=admin.pk,
        identifier=admin.username,
        email=admin.email,
        other_identifier=other_admin.username,
        other_email=other_admin.email,
        members=[coach.pk, other_admin.pk],
        initial_version=source.version,
    )
    connections.close_all()
    return data


def paired(path, first_kind, second_kind, data, second_data=None, *, refuses=False):
    from tests.sqlite_contention_harness import result

    first_data = {**data, "hold": "score" if first_kind == "score" else "journal"}
    second_data = {**data, "actor": data["other_actor"], **(second_data or {})}
    with CriticalPeers(path) as peers:
        first = peers.start(first_kind, first_data)
        second = peers.start(second_kind, second_data)
        first.send("go")
        receive(first, "write_attempt")
        receive(first, "written")
        second.send("go")
        receive(second, "write_attempt")
        if refuses:
            rejected = result(second)
            assert rejected[0] == 500 and "base est occupée" in rejected[1]["detail"], rejected
        first.send("continue")
        accepted = result(first)
        if not refuses:
            rejected = result(second)
    return accepted, rejected


def single(path, kind, data):
    from tests.sqlite_contention_harness import result

    with CriticalPeers(path) as peers:
        peer = peers.start(kind, data)
        peer.send("go")
        event = receive(peer)
        if event == "write_attempt":
            return result(peer)
        assert event[0] == "result", event
        return event[1]
