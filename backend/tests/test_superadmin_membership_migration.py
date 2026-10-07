import importlib

import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

from tests.migration_results_helpers import historic_result


@pytest.mark.django_db(transaction=True)
@pytest.mark.integration
@pytest.mark.functional
def test_migration_only_removes_superadmin_join_rows_and_preserves_history():
    executor = MigrationExecutor(connection)
    latest = executor.loader.graph.leaf_nodes()
    before = [node for node in latest if node[0] != "identities"] + [
        ("identities", "0005_remove_user_identity_interface_palette_allowed_and_more")
    ]
    executor.migrate(before)
    try:
        apps = executor.loader.project_state(before).apps
        _, run, _ = historic_result(apps)
        users = apps.get_model("identities", "User")
        root = users.objects.create(username="legacy-root", is_superuser=True)
        inactive = users.objects.create(
            username="inactive-root", is_superuser=True, is_active=False
        )
        members = [
            users.objects.create(username=role, role=role) for role in ("Admin", "Coach", "Viewer")
        ]
        orgs = apps.get_model("identities", "Organization")
        org = orgs.objects.get(pk=run.organization_id)
        other = orgs.objects.create(name="Other")
        org.users.add(root, inactive, *members)
        other.users.add(root)
        run.assignee_id = run.completed_by_id = run.revised_by_id = root.pk
        run.revised_at = run.completed_at
        run.revised_by_name = root.username
        run.save()
        schedule = apps.get_model("assessments", "EvaluationSchedule").objects.get(
            pk=run.schedule_id
        )
        schedule.assignee_id = root.pk
        schedule.save()
        apps.get_model("journals", "ActivityEntry").objects.create(
            actor_id=root.pk,
            target_user_id=root.pk,
            organization_id=org.pk,
            action="member_assigned",
            description="Historical assignment",
        )
        apps.get_model("journals", "LogEntry").objects.create(
            actor_id=root.pk,
            organization_id=org.pk,
            level="INFO",
            source="organizations",
            message="Historical log",
        )
        preserved = [
            ("identities", "User"),
            ("identities", "Organization"),
            ("teams", "Team"),
            ("assessments", "EvaluationSchedule"),
            ("assessments", "EvaluationRun"),
            ("assessments", "EvaluationRunQuestion"),
            ("journals", "ActivityEntry"),
            ("journals", "LogEntry"),
        ]
        snapshots = {
            key: list(apps.get_model(*key).objects.order_by("pk").values()) for key in preserved
        }
        kept_links = list(
            orgs.users.through.objects.filter(user_id__in=[u.pk for u in members]).values()
        )
        MigrationExecutor(connection).migrate(latest)
        migrated = MigrationExecutor(connection).loader.project_state(latest).apps
        through = migrated.get_model("identities", "Organization").users.through
        assert not through.objects.filter(user_id__in=[root.pk, inactive.pk]).exists()
        assert list(through.objects.order_by("pk").values()) == kept_links
        for key, rows in snapshots.items():
            assert list(migrated.get_model(*key).objects.order_by("pk").values()) == rows
        migration = importlib.import_module(
            "identities.migrations.0006_remove_superadmin_memberships"
        )
        with connection.schema_editor() as editor:
            migration.remove_superadmin_memberships(migrated, editor)
        assert list(through.objects.order_by("pk").values()) == kept_links
        # A rollback never recreates invalid memberships.
        MigrationExecutor(connection).migrate(before)
        assert list(through.objects.order_by("pk").values()) == kept_links
    finally:
        MigrationExecutor(connection).migrate(latest)
