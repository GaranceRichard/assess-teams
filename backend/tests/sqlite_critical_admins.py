"""Last active business Admin, including historical DELETE and membership removal."""

from tests.sqlite_critical_assertions import inspect, journal
from tests.sqlite_critical_harness import paired


def run_admins(case, path, data):
    kinds = {
        "double_deactivate": ("deactivate", "deactivate"),
        "double_demote": ("demote", "demote"),
        "deactivate_demote": ("deactivate", "demote"),
        "detach_deactivate": ("detach", "deactivate"),
        "delete_demote": ("delete", "demote"),
        "put_deactivate_demote": ("put_deactivate", "demote"),
        "compatible_admins": ("deactivate", "deactivate"),
    }
    first_kind, second_kind = kinds[case]
    if case == "compatible_admins":
        from django.db import connections

        from identities.models import User
        from tests.sqlite_contention_process import configure

        configure(str(path))
        from identities.models import Organization

        spare = User.objects.create(username="spare", role="Admin")
        Organization.objects.get(pk=data["organization"]).users.add(spare)
        connections.close_all()
    first, second = paired(
        path,
        first_kind,
        second_kind,
        data,
        {
            "target": data["other_admin"],
            "identifier": data["other_identifier"],
            "email": data["other_email"],
        },
    )
    assert first[0] == (204 if first_kind == "delete" else 200), first
    assert second[0] == (200 if case == "compatible_admins" else 400), second
    if second[0] == 400:
        assert "autre Admin" in str(second[1]), second

    def check(db):
        assert db.execute(
            "SELECT count(*) FROM identities_user u JOIN identities_organization_users m "
            "ON m.user_id=u.id WHERE m.organization_id=? AND u.role='Admin' AND u.is_active=1",
            (data["organization"],),
        ).fetchone() == (1,)
        action = {
            "deactivate": "user_deactivated",
            "delete": "user_deactivated",
            "put_deactivate": "user_deactivated",
            "demote": "user_role_changed",
            "detach": "member_removed",
        }[first_kind]
        entries = [(action, data["actor"], None if first_kind == "detach" else data["admin"])]
        if case == "compatible_admins":
            entries.append(("user_deactivated", data["other_actor"], data["other_admin"]))
        journal(db, data, entries)
        second_state = db.execute(
            "SELECT role, is_active, username, email FROM identities_user WHERE id=?",
            (data["other_admin"],),
        ).fetchone()
        assert second_state == (
            "Admin",
            0 if case == "compatible_admins" else 1,
            data["other_identifier"],
            data["other_email"],
        ), second_state
        notices = 0 if first_kind == "detach" else (2 if case == "compatible_admins" else 1)
        assert db.execute("SELECT count(*) FROM notifications_emailnotification").fetchone() == (
            notices,
        )
        assert db.execute(
            "SELECT requires_reassignment FROM assessments_evaluationschedule"
        ).fetchone() == (int(first_kind in {"delete", "deactivate", "put_deactivate"}),)

    inspect(path, data, check)
