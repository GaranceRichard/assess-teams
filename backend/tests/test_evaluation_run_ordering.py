from datetime import timedelta

import pytest
from django.db import IntegrityError, transaction
from django.utils import timezone

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import EvaluationRun
from tests.managed_user_helpers import csrf_post
from tests.taking_helpers import client_for, complete, route, start, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]
PATH = "/api/evaluations/"


def add_run(source, offset, *, created, completed=None, state="not_started"):
    run = ensure_expected_evaluation(source.schedule, source.due_date + timedelta(days=offset))
    values = {"created_at": created, "state": state}
    if completed is not None:
        values.update(state="completed", completed_at=completed, completed_by_name="coach")
    EvaluationRun.objects.filter(pk=run.pk).update(**values)
    run.refresh_from_db()
    return run


def ids(response):
    assert response.status_code == 200
    data = response.json()
    return (
        [row["id"] for row in data.get("results", [])]
        if isinstance(data, dict)
        else [row["id"] for row in data]
    )


@pytest.mark.parametrize("role", ["coach", "admin"])
def test_actionable_runs_use_creation_then_completed_use_completion_before_pagination(role):
    _, coach, admin, source = taking_context()
    now = timezone.now()
    # Deliberately oppose due date, insertion order, creation and completion chronology.
    old_completed = add_run(source, -30, created=now, completed=now - timedelta(days=4))
    latest = add_run(source, -29, created=now - timedelta(days=9), completed=now)
    older_active = add_run(source, 3, created=now - timedelta(days=3), state="in_progress")
    newer_active = add_run(source, -28, created=now - timedelta(days=2))
    EvaluationRun.objects.filter(pk=source.pk).update(created_at=now - timedelta(days=1))
    rest = [add_run(source, i + 4, created=now) for i in range(19)]
    taking_context("Outside")
    client = client_for(coach if role == "coach" else admin)
    expected = [older_active.pk, newer_active.pk, source.pk, *[r.pk for r in rest]]
    expected += [latest.pk, old_completed.pk]
    before = list(EvaluationRun.objects.order_by("pk").values())
    assert ids(client.get(PATH)) == expected
    first = client.get(PATH, {"page": 1})
    assert first.json()["count"] == len(expected)
    assert ids(first) == expected[:20]
    assert ids(client.get(PATH, {"page": 2})) == expected[20:]
    assert ids(client.get(PATH, {"page": 1})) == expected[:20]
    assert list(EvaluationRun.objects.order_by("pk").values()) == before


def test_equal_dates_missing_optional_dates_and_new_records_have_stable_order():
    _, coach, _, source = taking_context()
    now = timezone.now()
    EvaluationRun.objects.filter(pk=source.pk).update(created_at=now)
    tied_active = add_run(source, -2, created=now, state="in_progress")
    first_done = add_run(source, -4, created=now, completed=now)
    second_done = add_run(source, -3, created=now, completed=now)
    client = client_for(coach)
    expected = [source.pk, tied_active.pk, first_done.pk, second_done.pk]
    for _ in range(2):
        assert ids(client.get(PATH)) == expected
    new_run = add_run(source, -5, created=now + timedelta(days=1))
    assert ids(client.get(PATH)) == [*expected[:2], new_run.pk, *expected[2:]]
    for row in client.get(PATH).json()[:3]:
        assert row["completed_at"] is None
        assert row["revised_at"] is None


@pytest.mark.parametrize("changes", [{"created_at": None}, {"state": "completed"}])
def test_model_rejects_missing_required_creation_or_completion_dates(changes):
    _, _, _, run = taking_context()
    with transaction.atomic(), pytest.raises(IntegrityError):
        EvaluationRun.objects.filter(pk=run.pk).update(**changes)


def test_completion_moves_run_after_pending_and_before_older_history_without_reload():
    _, coach, _, source = taking_context()
    now = timezone.now()
    EvaluationRun.objects.filter(pk=source.pk).update(created_at=now - timedelta(days=2))
    pending = add_run(source, -2, created=now)
    old_done = add_run(source, -3, created=now, completed=now - timedelta(days=1))
    client = client_for(coach)
    expected = [source.pk, pending.pk, old_done.pk]
    assert ids(client.get(PATH)) == expected
    assert start(client, source).status_code == 200
    # Incomplete answers are a real refusal: no status/date/order mutation.
    assert csrf_post(client, route(source, "finalize"), {}).status_code == 400
    assert ids(client.get(PATH)) == expected
    assert complete(client, source).status_code == 200
    assert ids(client.get(PATH)) == [pending.pk, source.pk, old_done.pk]
    EvaluationRun.objects.filter(pk=old_done.pk).update(
        revised_at=timezone.now(), revised_by_name="admin"
    )
    assert ids(client.get(PATH)) == [pending.pk, source.pk, old_done.pk]
