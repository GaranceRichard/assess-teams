"""Executable MEP-040 scenarios; no pytest database or timing-only synchronization."""

import sys
from pathlib import Path

from tests.sqlite_contention_harness import Peers, result
from tests.sqlite_contention_process import receive
from tests.sqlite_critical_assertions import completion_journal, inspect, journal, versions
from tests.sqlite_critical_harness import CriticalPeers, paired, setup, single


def taking(case, path, data):
    if case == "stale_score":
        assert single(path, "finalize", data)[0] == 200
        refused = single(path, "score", {**data, "actor": data["other_actor"]})
        assert refused[0] == 400 and "en cours" in str(refused[1]), refused
    else:
        first_kind = "score" if case == "score_finalize" else "finalize"
        second_kind = "score" if case == "finalize_score" else "finalize"
        accepted, refused = paired(path, first_kind, second_kind, data, refuses=True)
        assert accepted[0] == (204 if first_kind == "score" else 200), accepted
        if first_kind == "score":
            assert single(path, "finalize", data)[0] == 200
    before = single(path, "finalize", data)
    after = single(path, "finalize", {**data, "actor": data["other_actor"]})
    assert before[0] == after[0] == 200
    assert before[1] == after[1], (before, after)
    inspect(
        path,
        data,
        lambda db: journal(db, data, completion_journal(data)),
        completed=True,
        changed_score=case == "score_finalize",
    )


def copies(case, path, data):
    kinds = {
        "double_copy": ("copy", "copy"),
        "copy_finalize": ("finalize", "copy"),
        "copy_validate": ("validate", "copy"),
        "validate_copy_archived": ("validate", "copy"),
        "validate_edit": ("validate", "edit"),
        "double_validate": ("validate", "validate"),
        "copy_edit": ("edit", "copy"),
        "writer_timeout": ("copy", "copy"),
    }
    first_kind, second_kind = kinds[case]
    first, second = paired(
        path,
        first_kind,
        second_kind,
        data,
        {"short_timeout": True}
        if case == "writer_timeout"
        else ({"evaluation": data["original"]} if case == "validate_copy_archived" else None),
        refuses=case == "writer_timeout",
    )
    assert first[0] == (201 if first_kind == "copy" else 200), first
    expected = (
        500
        if case == "writer_timeout"
        else (400 if case in {"validate_edit", "double_validate"} else 201)
    )
    assert second[0] == expected, second

    def check(db):
        count = data["initial_version"] + int(first_kind == "copy") + int(second[0] == 201)
        versions(db, data, count, active_version=2 if first_kind == "validate" else 1)
        entries = []
        if first_kind == "validate":
            entries.extend(
                (action, data["actor"], None)
                for action in ("evaluation_archived", "evaluation_validated")
            )
        elif first_kind == "finalize":
            entries.extend(completion_journal(data))
        else:
            entries.append(
                (
                    "evaluation_renamed" if first_kind == "edit" else "evaluation_version_created",
                    data["actor"],
                    None,
                )
            )
        if second[0] == 201:
            entries.append(("evaluation_version_created", data["other_actor"], None))
            copied_name = db.execute(
                "SELECT name FROM assessments_evaluation ORDER BY version DESC LIMIT 1"
            ).fetchone()[0]
            assert copied_name == ("Changed" if case == "copy_edit" else "Coopération")
        journal(db, data, entries)

    inspect(path, data, check, completed=case == "copy_finalize")


def stale_copy(path, data):
    with CriticalPeers(path) as peers:
        copy = peers.start("copy", {**data, "hold": "source"})
        copy.send("go")
        receive(copy, "source_read")
        assert single(path, "remove_source", {**data, "actor": data["other_actor"]})[0] == 204
        copy.send("continue")
        receive(copy, "write_attempt")
        refused = result(copy)
        assert refused[0] == 404, refused

    def check(db):
        assert db.execute("SELECT count(*) FROM assessments_evaluation").fetchone() == (1,)
        # Explicit deletion consumed v2; the failed copy must not consume v3.
        assert db.execute("SELECT next_version FROM assessments_evaluationfamily").fetchone() == (
            3,
        )
        journal(db, data, [("evaluation_deleted", data["other_actor"], None)])

    inspect(path, data, check)


def commit_rollback(path, data):
    with Peers(path) as locks, CriticalPeers(path) as peers:
        reader = locks.start("reader", data)
        copy = peers.start("copy", {**data, "hold": "journal", "short_timeout": True})
        reader.send("go")
        receive(reader, "held")
        copy.send("go")
        receive(copy, "write_attempt")
        receive(copy, "written")
        copy.send("continue")
        refused = result(copy)
        assert refused[0] == 500 and "base est occupée" in refused[1]["detail"], refused
        reader.send("continue")
        assert result(reader) == "released"

    def check(db):
        versions(db, data, 1)
        journal(db, data, [])

    inspect(path, data, check)


def run(case, path):
    data = setup(path, case)
    if case in {"double_finalize", "finalize_score", "score_finalize", "stale_score"}:
        taking(case, path, data)
    elif case == "stale_copy":
        stale_copy(path, data)
    elif case == "commit_rollback":
        commit_rollback(path, data)
    elif case.endswith(("deactivate", "demote", "admins")):
        from tests.sqlite_critical_admins import run_admins

        run_admins(case, path, data)
    else:
        copies(case, path, data)
    print("qualified " + case, flush=True)


if __name__ == "__main__":
    run(sys.argv[1], Path(sys.argv[2]))
