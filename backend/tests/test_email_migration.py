import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor

from tests.migration_results_helpers import historic_result


@pytest.mark.django_db(transaction=True)
@pytest.mark.functional
@pytest.mark.integration
def test_email_migrations_preserve_business_history_and_existing_password_queue():
    executor = MigrationExecutor(connection)
    latest = executor.loader.graph.leaf_nodes()
    before = [node for node in latest if node[0] not in {"notifications", "identities"}]
    before.append(("identities", "0007_passwordratelimit_passwordresetdelivery"))
    executor.migrate([*before, ("notifications", None)])
    try:
        apps = MigrationExecutor(connection).loader.project_state(before).apps
        _, run, _ = historic_result(apps)
        runs = apps.get_model("assessments", "EvaluationRun")
        snapshot = runs.objects.values().get(pk=run.pk)
        resets = apps.get_model("identities", "PasswordResetDelivery")
        job = resets.objects.create(email="member@example.com", attempts=1)
        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        current = executor.loader.project_state(latest).apps
        reset = current.get_model("identities", "PasswordResetDelivery").objects.get(pk=job.pk)
        assert (reset.email, reset.attempts, reset.created_at, reset.next_attempt_at) == (
            job.email,
            job.attempts,
            job.created_at,
            job.next_attempt_at,
        )
        assert reset.state == "pending" and reset.error_code == ""
        assert not current.get_model("notifications", "EmailNotification").objects.exists()
        assert (
            current.get_model("assessments", "EvaluationRun").objects.values().get(pk=run.pk)
            == snapshot
        )
    finally:
        MigrationExecutor(connection).migrate(latest)
