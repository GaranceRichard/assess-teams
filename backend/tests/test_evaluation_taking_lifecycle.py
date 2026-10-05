import pytest
from django.urls import reverse

from assessments.models import EvaluationRunState, EvaluationStatus
from journals.models import ActivityAction, ActivityEntry
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    save,
    start,
    taking_context,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("status", [EvaluationStatus.DRAFT, EvaluationStatus.ARCHIVED])
def test_new_taking_requires_a_validated_model_even_for_an_admin(status):
    _, coach, admin, run = taking_context()
    run.evaluation.status = status
    run.evaluation.save(update_fields=["status"])
    for actor in (coach, admin):
        assert start(client_for(actor), run).status_code == 400
    run.refresh_from_db()
    assert run.state == EvaluationRunState.NOT_STARTED
    assert not run.questions.exists()
    assert not ActivityEntry.objects.exists()


def test_archiving_preserves_started_answers_completion_and_administrative_revision():
    _, coach, admin, run = taking_context()
    client = client_for(coach)
    question_id = start(client, run).json()["questions"][0]["question_id"]
    assert save(client, run, question_id, 0).status_code == 204
    admin_client = client_for(admin)
    archive_url = reverse("evaluation-archive", kwargs={"evaluation_id": run.evaluation_id})
    assert csrf_post(admin_client, archive_url, {}).status_code == 200
    resumed = start(client_for(coach), run)
    assert resumed.status_code == 200
    assert resumed.json()["questions"][0]["score"] == 0
    completed = complete(client, run)
    assert completed.status_code == 200
    original = (completed.json()["completed_by_id"], completed.json()["completed_at"])
    revised = csrf_put(admin_client, route(run, "revision"), revision_answers(run, 10))
    assert revised.status_code == 200
    assert (revised.json()["completed_by_id"], revised.json()["completed_at"]) == original
    assert [question["score"] for question in client.get(route(run)).json()["questions"]] == [
        10,
        10,
    ]
    listed = client.get(reverse("evaluation-run-list")).json()[0]
    assert listed["filled_by"] == coach.username
    assert listed["revised_by"] == admin.username
    assert listed["revised_at"]
    assert listed["state"] == EvaluationRunState.COMPLETED
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_COMPLETED).count() == 1
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_REVISED).count() == 1


def test_start_refuses_a_team_from_another_organization_even_with_a_local_model():
    _, _, admin, run = taking_context()
    _, _, _, foreign = taking_context("South")
    run.team = foreign.team
    run.save(update_fields=["team"])
    assert start(client_for(admin), run).status_code == 400
    run.refresh_from_db()
    assert run.state == EvaluationRunState.NOT_STARTED
    assert not run.questions.exists()
