"""Inspect durable business state, provenance, Journal and side effects after peers close."""

import sqlite3
from contextlib import closing


def history(db, data, *, completed=False, changed_score=False):
    row = db.execute(
        "SELECT state, evaluation_id, assignee_id, completed_by_id, completed_by_name, "
        "completed_at, revised_at FROM assessments_evaluationrun WHERE id=?",
        (data["run"],),
    ).fetchone()
    assert row[:3] == (
        "completed" if completed else "in_progress",
        data["original"],
        data["coach"],
    ), row
    if completed:
        assert row[3:5] == (data["actor"], "root") and row[5], row
    else:
        assert row[3:6] == (None, "", None), row
    assert row[6] is None
    snapshots = db.execute(
        'SELECT source_question_id, "index", text, lineage_id, appreciation_markers, score '
        'FROM assessments_evaluationrunquestion WHERE run_id=? ORDER BY "index"',
        (data["run"],),
    ).fetchall()
    source = db.execute(
        'SELECT id, "index", name, lineage_id, appreciation_markers FROM assessments_question '
        'WHERE evaluation_id=? ORDER BY "index"',
        (data["original"],),
    ).fetchall()
    assert [row[:5] for row in snapshots] == source
    assert [row[5] for row in snapshots] == ([9, 4] if changed_score else [4, 4])
    return row


def versions(db, data, count, *, active_version=1):
    rows = db.execute(
        "SELECT id, version, status, name FROM assessments_evaluation "
        "WHERE family_id=? ORDER BY version",
        (data["family"],),
    ).fetchall()
    assert [row[1] for row in rows] == list(range(1, count + 1)), rows
    assert sum(row[2] == "VALIDATED" for row in rows) == 1, rows
    assert [row[2] for row in rows] == [
        "ARCHIVED"
        if number < active_version
        else ("VALIDATED" if number == active_version else "DRAFT")
        for number in range(1, count + 1)
    ], rows
    assert db.execute(
        "SELECT next_version FROM assessments_evaluationfamily WHERE id=?", (data["family"],)
    ).fetchone() == (count + 1,)
    source = db.execute(
        'SELECT "index", name, lineage_id, appreciation_markers FROM assessments_question '
        'WHERE evaluation_id=? ORDER BY "index"',
        (data["original"],),
    ).fetchall()
    for pk, *_ in rows:
        assert (
            db.execute(
                'SELECT "index", name, lineage_id, appreciation_markers FROM assessments_question '
                'WHERE evaluation_id=? ORDER BY "index"',
                (pk,),
            ).fetchall()
            == source
        )
    descriptions = db.execute(
        "SELECT description FROM journals_activityentry "
        "WHERE action='evaluation_version_created' ORDER BY id"
    ).fetchall()
    created = [row for row in rows if row[1] > data["initial_version"]]
    assert len(descriptions) == len(created)
    for (_, version, _, _), (description,) in zip(created, descriptions, strict=True):
        assert f" v{version} (famille #{data['family']})" in description, description


def journal(db, data, actions):
    rows = db.execute(
        "SELECT action, actor_id, actor_name, organization_id, target_user_id "
        "FROM journals_activityentry ORDER BY id"
    ).fetchall()
    assert len(rows) == len(actions), rows
    for row, (action, actor, target) in zip(rows, actions, strict=True):
        assert row == (action, actor, "Superadmin", data["organization"], target), row
    for org_name, target, name, team, description in db.execute(
        "SELECT organization_name, target_user_id, target_user_name, team_id, description "
        "FROM journals_activityentry ORDER BY id"
    ):
        assert org_name == "Critical" and description
        expected_name = data["identifier"] if target == data["admin"] else data["other_identifier"]
        assert name == (expected_name if target else ""), name
        assert team in {None, data["team"]}


def inspect(path, data, check, *, completed=False, changed_score=False):
    with closing(sqlite3.connect(path)) as db:
        assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
        assert db.execute("PRAGMA foreign_key_check").fetchall() == []
        history(db, data, completed=completed, changed_score=changed_score)
        check(db)
        assert db.execute(
            "SELECT count(*) FROM notifications_emailnotification WHERE state != 'pending'"
        ).fetchone() == (0,)


def completion_journal(data):
    return [("evaluation_completed_by_admin", data["actor"], None)]
