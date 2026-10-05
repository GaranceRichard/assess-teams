from importlib import import_module
from types import SimpleNamespace

import pytest
from django.apps import apps
from django.db import connection

from assessments.models import EvaluationRun, EvaluationRunState
from tests.taking_helpers import taking_context


@pytest.mark.django_db
@pytest.mark.integration
def test_migration_backfills_existing_assignment_once_without_inventing_completion():
    _, coach, _, run = taking_context()
    schedule = run.schedule
    run.delete()
    migration = import_module("assessments.migrations.0009_existing_expected_evaluations")
    editor = SimpleNamespace(connection=connection)
    migration.preserve_existing_assignments(apps, editor)
    migration.preserve_existing_assignments(apps, editor)
    expected = EvaluationRun.objects.get()
    assert expected.schedule_id == schedule.pk
    assert expected.assignee == coach
    assert expected.assignee_name == coach.username
    assert expected.organization_id == schedule.team.organization_id
    assert expected.evaluation_id == schedule.evaluation_id
    assert expected.due_date == schedule.first_due_date
    assert expected.state == EvaluationRunState.NOT_STARTED
    assert expected.completed_at is None
    assert not expected.questions.exists()
