from datetime import datetime, timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from assessments.application.results import comparison_results, result_versions_for
from assessments.models import EvaluationRunState, EvaluationStatus, Question
from teams.models import Team
from tests.results_helpers import another_run, comparison_url, results_context
from tests.taking_helpers import client_for, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_only_versions_with_accessible_completed_runs_are_listed():
    _, _, admin, run = results_context()
    taking_context("Without results")
    client = client_for(admin)
    versions = client.get(reverse("result-versions")).json()
    assert versions == [
        {
            "id": run.evaluation_id,
            "family_id": run.evaluation.family_id,
            "family_name": "Coopération",
            "version": 1,
            "organization_name": "North",
        }
    ]


def test_snapshot_order_extremes_and_archive_survive_live_model_changes():
    _, _, admin, run = results_context()
    Question.objects.filter(evaluation=run.evaluation).update(name="Mutable model damaged")
    run.evaluation.status = EvaluationStatus.ARCHIVED
    run.evaluation.save()
    client = client_for(admin)
    assert client.get(reverse("result-versions")).json()[0]["id"] == run.evaluation_id
    data = client.get(comparison_url(run)).json()
    assert [axis["index"] for axis in data["axes"]] == [1, 2]
    assert [axis["text"] for axis in data["axes"]] == ["Première question", "Deuxième question"]
    assert data["teams"][0]["scores"] == [0, 10]
    assert data["teams"][0]["run_id"] == run.pk
    assert data["teams"][0]["completed_at"] is not None


def test_latest_completion_per_team_ignores_due_creation_revision_and_unfinished_runs():
    organization, _, admin, run = results_context()
    latest = another_run(run, days=1, scores=(10, 0))
    older_created_later = another_run(run, days=2)
    older_created_later.completed_at = run.completed_at - timedelta(days=1)
    older_created_later.revised_at = timezone.now() + timedelta(days=10)
    older_created_later.revised_by_name = admin.username
    older_created_later.save()
    another_run(run, days=3, state=EvaluationRunState.IN_PROGRESS)
    another_run(run, days=4, state=EvaluationRunState.NOT_STARTED)
    second_team = Team.objects.create(
        organization=organization, name="Second team", is_active=False
    )
    second = another_run(run, team=second_team, days=5, scores=(4, 8))
    unfinished_team = Team.objects.create(organization=organization, name="Unfinished")
    another_run(run, team=unfinished_team, days=6, state=EvaluationRunState.IN_PROGRESS)
    data = client_for(admin).get(comparison_url(run)).json()
    assert [(t["team_id"], t["run_id"], t["scores"]) for t in data["teams"]] == [
        (run.team_id, latest.pk, [10, 0]),
        (second_team.pk, second.pk, [4, 8]),
    ]
    assert datetime.fromisoformat(data["teams"][0]["completed_at"]) == latest.completed_at


def test_equal_completion_dates_choose_greatest_run_id():
    _, _, admin, run = results_context()
    tied = another_run(run)
    tied.completed_at = run.completed_at
    tied.save()
    assert client_for(admin).get(comparison_url(run)).json()["teams"][0]["run_id"] == tied.pk


def test_query_count_is_constant_with_multiple_teams(django_assert_num_queries):
    organization, _, admin, run = results_context()
    admin.is_superuser = True
    for number in range(6):
        team = Team.objects.create(organization=organization, name=f"Team {number}")
        another_run(run, team=team, days=number + 1)
    with django_assert_num_queries(1):
        assert len(list(result_versions_for(admin))) == 1
    with django_assert_num_queries(2):
        assert len(comparison_results(admin, run.evaluation_id)["teams"]) == 7


def test_no_completed_run_is_not_a_comparison_and_unknown_version_is_not_found():
    _, _, admin, run = taking_context()
    client = client_for(admin)
    assert client.get(reverse("result-versions")).json() == []
    assert client.get(comparison_url(run)).status_code == 404
    assert client.get("/api/results/versions/999999/").status_code == 404


def test_incompatible_or_incomplete_latest_snapshot_never_falls_back_to_old_run():
    organization, _, admin, run = results_context()
    team = Team.objects.create(organization=organization, name="Z incompatible")
    damaged = another_run(run, team=team)
    damaged.questions.update(text="Incompatible")
    latest = another_run(run, days=2)
    latest.questions.filter(index=1).update(score=None)
    data = client_for(admin).get(comparison_url(run)).json()
    assert data["teams"] == []
    assert len(data["axes"]) == 2


def test_empty_snapshot_and_empty_scope_have_no_usable_result():
    _, _, admin, run = results_context()
    run.questions.all().delete()
    assert client_for(admin).get(comparison_url(run)).json() == {"axes": [], "teams": []}
    assert comparison_results(admin, 99999) == {"axes": [], "teams": []}
