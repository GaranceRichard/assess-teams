import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import Evaluation, EvaluationRun, EvaluationSchedule, Question
from identities.domain.users import Role
from tests.identity_helpers import create_user
from tests.results_helpers import another_run, comparison_url, results_context
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_admin_isolation_and_forged_version_team_run_question_ids():
    _, _, admin, own = results_context("Own")
    _, _, _, foreign = results_context("Foreign")
    client = client_for(admin)
    assert [v["id"] for v in client.get(reverse("result-versions")).json()] == [own.evaluation_id]
    assert client.get(comparison_url(foreign)).status_code == 404
    data = client.get(
        comparison_url(own),
        {
            "team_id": foreign.team_id,
            "run_id": foreign.pk,
            "question_id": foreign.questions.first().pk,
            "evaluation_id": foreign.evaluation_id,
        },
    ).json()
    assert [team["team_id"] for team in data["teams"]] == [own.team_id]
    assert [team["run_id"] for team in data["teams"]] == [own.pk]
    assert {axis["question_id"] for axis in data["axes"]}.isdisjoint(
        foreign.questions.values_list("source_question_id", flat=True)
    )


def test_superadmin_sees_global_results_and_separate_versions():
    _, _, admin, first = results_context("One")
    _, _, _, second = results_context("Two")
    admin.is_superuser = True
    admin.role = None
    admin.save()
    client = client_for(admin)
    assert {v["id"] for v in client.get(reverse("result-versions")).json()} == {
        first.evaluation_id,
        second.evaluation_id,
    }
    version2 = Evaluation.objects.create(
        organization=first.organization,
        family=first.evaluation.family,
        version=2,
        index=2,
        name="Other criteria",
    )
    q = Question.objects.create(evaluation=version2, index=1, name="New axis")
    other = another_run(first, days=1)
    schedule = EvaluationSchedule.objects.create(
        team=first.team,
        evaluation=version2,
        assignee=admin,
        mode="fixed",
        first_due_date=other.due_date,
    )
    EvaluationRun.objects.filter(pk=other.pk).update(evaluation=version2, schedule=schedule)
    other.questions.all().delete()
    other.questions.create(source_question=q, index=1, text=q.name, score=5)
    assert client.get(comparison_url(first)).json()["teams"][0]["run_id"] == first.pk
    data = client.get(f"/api/results/versions/{version2.pk}/").json()
    assert [axis["text"] for axis in data["axes"]] == ["New axis"]
    assert data["teams"][0]["scores"] == [5]


def test_coach_uses_existing_assignment_scope_before_choosing_latest_run():
    organization, coach, admin, run = results_context()
    inaccessible = another_run(run)
    inaccessible.assignee = admin
    inaccessible.save()
    other_coach = create_user("other-coach", Role.COACH)
    organization.users.add(other_coach)
    other_client = client_for(other_coach)
    assert other_client.get(reverse("result-versions")).json() == []
    assert other_client.get(comparison_url(run)).status_code == 404
    assert client_for(coach).get(comparison_url(run)).json()["teams"][0]["run_id"] == run.pk
    organization.users.remove(coach)
    assert client_for(coach).get(reverse("result-versions")).json() == []


def test_viewer_consults_results_but_anonymous_and_inactive_are_denied():
    organization, _, _, run = results_context()
    viewer = create_user("viewer", Role.VIEWER)
    organization.users.add(viewer)
    client = client_for(viewer)
    assert [v["id"] for v in client.get(reverse("result-versions")).json()] == [run.evaluation_id]
    assert client.get(comparison_url(run)).status_code == 200
    assert APIClient().get(reverse("result-versions")).status_code == 403
    assert APIClient().get(comparison_url(run)).status_code == 403
    viewer.is_active = False
    viewer.save()
    assert client.get(reverse("result-versions")).status_code == 403
