from datetime import datetime, timedelta

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone

from assessments.application.dashboard import dashboard_projection
from assessments.models import Evaluation, EvaluationRun, EvaluationRunState, EvaluationStatus
from tests.identity_helpers import create_superuser
from tests.managed_user_helpers import csrf_put
from tests.results_helpers import another_run, results_context
from tests.taking_helpers import client_for, revision_answers

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_completion_and_latest_revision_are_separate_snapshot_events():
    org, coach, admin, run = results_context()
    initial_date = run.completed_at
    for score in (4, 6):
        response = csrf_put(
            client_for(admin),
            reverse("evaluation-run-revision", kwargs={"run_id": run.pk}),
            revision_answers(run, score),
        )
        assert response.status_code == 200
    run.refresh_from_db()
    org.name = "Renamed organization"
    org.save()
    run.team.name = "Renamed team"
    run.team.save()
    run.evaluation.status = EvaluationStatus.ARCHIVED
    run.evaluation.save()
    Evaluation.objects.create(
        organization=org, family=run.evaluation.family, version=2, index=2, name="New version"
    )
    admin.first_name, admin.last_name = "Léa", "Martin"
    admin.save()
    payload = client_for(admin).get(reverse("dashboard")).json()
    assert payload["profile"]["first_name"] == "Léa"
    assert payload["profile"]["last_name"] == "Martin"
    assert payload["profile"]["organization_name"] == "Renamed organization"
    revised, completed = payload["recent_activity"]
    assert [revised["type"], completed["type"]] == ["revised", "completed"]
    assert datetime.fromisoformat(completed["occurred_at"]) == initial_date
    assert datetime.fromisoformat(revised["occurred_at"]) == run.revised_at
    assert completed["author_name"] == coach.username
    assert revised["author_name"] == admin.username
    for event in payload["recent_activity"]:
        assert event["team_name"] == "North Team"
        assert event["organization_name"] == "North"
        assert event["model_name"] == "Coopération"
        assert event["version"] == 1
        assert set(event) == {
            "run_id",
            "type",
            "organization_id",
            "organization_name",
            "team_name",
            "model_name",
            "version",
            "occurred_at",
            "author_name",
        }


def test_activity_is_bounded_and_sorted_by_event_date_with_deterministic_ties():
    _, _, admin, run = results_context()
    date = timezone.now()
    for day in range(1, 13):
        copy = another_run(run, days=day)
        EvaluationRun.objects.filter(pk=copy.pk).update(completed_at=date)
    latest = copy
    EvaluationRun.objects.filter(pk=run.pk).update(
        revised_at=date + timedelta(seconds=1), revised_by_name=admin.username
    )
    events = dashboard_projection(admin)["recent_activity"]
    assert len(events) == 10
    assert events[0]["type"] == "revised"
    assert events[0]["run_id"] == run.pk
    assert events[1]["run_id"] == latest.pk
    assert [e["run_id"] for e in events[1:]] == sorted(
        [e["run_id"] for e in events[1:]], reverse=True
    )


def test_counts_only_personal_realizable_persisted_assignments_without_mutating():
    _, coach, admin, run = results_context()
    pending = another_run(run, days=1, state=EvaluationRunState.NOT_STARTED)
    progress = another_run(run, days=2, state=EvaluationRunState.IN_PROGRESS)
    other = another_run(run, days=3, state=EvaluationRunState.NOT_STARTED)
    other.assignee = admin
    other.save()
    assert dashboard_projection(coach)["pending_assignments"] == 2
    assert dashboard_projection(admin)["pending_assignments"] == 1
    run.evaluation.status = EvaluationStatus.ARCHIVED
    run.evaluation.save()
    assert dashboard_projection(coach)["pending_assignments"] == 1
    progress.team.is_active = False
    progress.team.save()
    assert dashboard_projection(coach)["pending_assignments"] == 0
    pending.refresh_from_db()
    assert pending.state == EvaluationRunState.NOT_STARTED
    assert not pending.questions.exists()


def test_global_scope_is_explicit_and_every_event_has_its_organization():
    first_org, _, _, first = results_context()
    second_org, _, _, second = results_context("South")
    root = create_superuser()
    payload = client_for(root).get(reverse("dashboard")).json()
    assert payload["profile"]["is_superuser"]
    assert payload["profile"]["organization_name"] is None
    assert payload["activity_scope"] == "global"
    assert payload["pending_assignments"] is None
    assert {e["organization_id"] for e in payload["recent_activity"]} == {
        first_org.pk,
        second_org.pk,
    }
    assert {e["run_id"] for e in payload["recent_activity"]} == {first.pk, second.pk}


def test_projection_uses_bounded_queries_without_loading_answers():
    _, _, admin, run = results_context()
    for day in range(1, 12):
        another_run(run, days=day)
    from assessments.adapters.api.dashboard_serializers import DashboardSerializer

    with CaptureQueriesContext(connection) as queries:
        payload = DashboardSerializer(dashboard_projection(admin)).data
    assert len(payload["recent_activity"]) == 10
    assert len(queries) <= 4
    assert not any("assessments_evaluationrunquestion" in q["sql"] for q in queries)
