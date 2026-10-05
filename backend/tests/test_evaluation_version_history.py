import pytest
from django.urls import reverse

from assessments.models import Evaluation, EvaluationRun, EvaluationRunState
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for, complete, route, taking_context
from tests.test_evaluation_lifecycle import transition
from tests.test_evaluation_versions import new_version

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("completed", [False, True])
def test_new_validation_preserves_planning_run_and_question_snapshots(completed):
    _, coach, admin, run = taking_context()
    coach.email = "coach@example.test"
    coach.save(update_fields=["email"])
    client = client_for(admin)
    first = run.evaluation
    if completed:
        assert complete(client_for(coach), run).status_code == 200
    else:
        assert csrf_post(client_for(coach), route(run), {}).status_code == 200
    snapshots = list(
        run.questions.values_list("pk", "source_question_id", "index", "text", "score")
    )
    second = Evaluation.objects.get(pk=new_version(client, first).json()["id"])
    second.questions.update(name="New criterion")
    assert transition(client, second, "validate").status_code == 200
    run.refresh_from_db()
    run.schedule.refresh_from_db()
    assert run.evaluation_id == run.schedule.evaluation_id == first.pk
    assert run.state == (
        EvaluationRunState.COMPLETED if completed else EvaluationRunState.IN_PROGRESS
    )
    assert (
        list(run.questions.values_list("pk", "source_question_id", "index", "text", "score"))
        == snapshots
    )
    historic = client.get(route(run)).json()
    assert (historic["evaluation_id"], historic["evaluation_version"], historic["family_id"]) == (
        first.pk,
        1,
        first.family_id,
    )
    assert historic["questions"][0]["text"] == "Première question"
    listed = client.get(reverse("evaluation-schedule-list")).json()[0]
    assert (listed["evaluation_id"], listed["evaluation_version"]) == (first.pk, 1)
    input_data = {
        "organization_id": run.organization_id,
        "team_id": run.team_id,
        "evaluation_id": first.pk,
        "assignee_id": coach.pk,
        "mode": "immediate",
    }
    planning = reverse("evaluation-schedule-list")
    assert csrf_post(client, planning, input_data).status_code == 404
    detail = reverse("evaluation-schedule-detail", kwargs={"schedule_id": run.schedule_id})
    assert csrf_put(client, detail, input_data).status_code == 404
    response = csrf_post(client, planning, {**input_data, "evaluation_id": second.pk})
    assert response.status_code == 201
    assert response.json()["evaluation_version"] == 2
    assert EvaluationRun.objects.get(schedule_id=response.json()["id"]).evaluation_id == second.pk
    if not completed:
        assert complete(client_for(coach), run).status_code == 200
        run.refresh_from_db()
        assert run.evaluation_id == first.pk


def test_planning_refuses_new_draft_and_forged_tenant_version():
    _, coach, admin, run = taking_context()
    client = client_for(admin)
    draft = new_version(client, run.evaluation).json()
    base = {
        "organization_id": run.organization_id,
        "team_id": run.team_id,
        "evaluation_id": draft["id"],
        "assignee_id": coach.pk,
        "mode": "immediate",
    }
    assert csrf_post(client, reverse("evaluation-schedule-list"), base).status_code == 404
    _, _, _, other = taking_context("Other")
    assert (
        csrf_post(
            client,
            reverse("evaluation-schedule-list"),
            {
                **base,
                "evaluation_id": other.evaluation_id,
            },
        ).status_code
        == 404
    )
    assert (
        client.get(
            reverse("question-list", kwargs={"evaluation_id": other.evaluation_id})
        ).status_code
        == 404
    )
