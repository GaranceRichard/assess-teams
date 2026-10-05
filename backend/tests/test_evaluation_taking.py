import pytest
from django.urls import reverse

from assessments.models import EvaluationRun, EvaluationRunState, Question
from journals.models import ActivityAction, ActivityEntry, LogEntry
from tests.managed_user_helpers import csrf_post
from tests.taking_helpers import client_for, complete, route, save, start, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_assigned_evaluation_is_visible_and_resume_preserves_order_and_scores():
    _, coach, _, run = taking_context()
    client = client_for(coach)
    listed = client.get(reverse("evaluation-run-list")).json()
    assert listed[0]["id"] == run.pk
    assert listed[0]["state"] == "not_started"
    assert listed[0]["is_assignee"] is True
    assert listed[0]["assigned_to"] == coach.username
    assert listed[0]["filled_by"] == ""
    first = start(client, run)
    assert first.status_code == 200
    questions = first.json()["questions"]
    assert [question["text"] for question in questions] == [
        "Première question",
        "Deuxième question",
    ]
    assert save(client, run, questions[0]["question_id"], 0).status_code == 204
    assert save(client, run, questions[1]["question_id"], 10).status_code == 204
    Question.objects.filter(pk=questions[0]["question_id"]).update(name="Texte futur")
    resumed = start(client_for(coach), run).json()
    assert resumed["questions"][0]["text"] == "Première question"
    assert [question["score"] for question in resumed["questions"]] == [0, 10]
    assert EvaluationRun.objects.count() == 1
    assert run.questions.count() == 2
    assert not ActivityEntry.objects.exists()


@pytest.mark.parametrize("invalid", [-1, 11, 1.5, None, True, "4", {}, [], 5.0])
def test_backend_rejects_invalid_scores_without_losing_the_previous_answer(invalid):
    _, coach, _, run = taking_context()
    client = client_for(coach)
    question_id = start(client, run).json()["questions"][0]["question_id"]
    assert save(client, run, question_id, 7).status_code == 204
    assert save(client, run, question_id, invalid).status_code == 400
    assert run.questions.get(source_question_id=question_id).score == 7
    assert not ActivityEntry.objects.exists()
    assert LogEntry.objects.filter(status_code=400).count() == 1
    assert LogEntry.objects.get(status_code=400).organization_id == run.organization_id


def test_completion_requires_every_answer_and_records_immutable_initial_provenance():
    _, coach, _, run = taking_context()
    client = client_for(coach)
    assert csrf_post(client, route(run, "finalize"), {}).status_code == 400
    questions = start(client, run).json()["questions"]
    save(client, run, questions[0]["question_id"], 0)
    assert csrf_post(client, route(run, "finalize"), {}).status_code == 400
    run.refresh_from_db()
    assert run.completed_at is None
    assert not ActivityEntry.objects.exists()
    save(client, run, questions[1]["question_id"], 10)
    result = csrf_post(client, route(run, "finalize"), {})
    assert result.status_code == 200
    assert result.json()["filled_by"] == coach.username
    assert result.json()["state"] == EvaluationRunState.COMPLETED
    run.refresh_from_db()
    initial_date = run.completed_at
    assert run.completed_by == coach
    assert save(client, run, questions[0]["question_id"], 5).status_code == 400
    assert csrf_post(client, route(run, "finalize"), {}).status_code == 200
    run.refresh_from_db()
    assert run.completed_at == initial_date
    assert run.questions.first().score == 0
    entry = ActivityEntry.objects.get()
    assert entry.action == ActivityAction.EVALUATION_COMPLETED
    assert entry.actor == coach
    assert entry.team == run.team
    assert client.get(route(run)).json()["completed_at"] == result.json()["completed_at"]


def test_admin_completes_instead_of_assignee_and_table_keeps_both_names():
    _, coach, admin, run = taking_context()
    client = client_for(admin)
    result = complete(client, run)
    assert result.status_code == 200
    assert result.json()["assigned_to"] == coach.username
    assert result.json()["filled_by"] == admin.username
    run.refresh_from_db()
    assert run.assignee == coach
    assert run.completed_by == admin
    row = client.get(reverse("evaluation-run-list")).json()[0]
    assert row["assigned_to"] != row["filled_by"]
    assert row["completed_at"]
    assert row["can_revise"] is True
    assert row["evaluation_name"] == run.evaluation_name
    assert row["team_name"] == run.team.name
    assert ActivityEntry.objects.get().action == ActivityAction.EVALUATION_COMPLETED_BY_ADMIN


def test_start_refuses_empty_model_or_archived_team_and_unknown_question():
    _, coach, _, run = taking_context()
    client = client_for(coach)
    run.team.is_active = False
    run.team.save()
    assert start(client, run).status_code == 400
    run.team.is_active = True
    run.team.save()
    run.evaluation.questions.all().delete()
    assert start(client, run).status_code == 400
    run.refresh_from_db()
    assert run.state == EvaluationRunState.NOT_STARTED
    Question.objects.create(evaluation=run.evaluation, index=1, name="Question valide")
    assert start(client, run).status_code == 200
    assert save(client, run, 999999, 3).status_code == 400
