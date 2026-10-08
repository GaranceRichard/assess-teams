import pytest
from django.urls import reverse

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import Evaluation, EvaluationSchedule, QuestionScoreGuide
from tests.managed_user_helpers import csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)
from tests.test_evaluation_lifecycle import transition
from tests.test_evaluation_versions import new_version

pytestmark = [pytest.mark.django_db, pytest.mark.integration, pytest.mark.api]


@pytest.mark.parametrize("completed", [False, True])
def test_copied_guides_are_independent_and_runs_keep_exact_start_snapshot(completed):
    _, coach, admin, run = taking_context()
    old = [{"score": 5, "text": "Repère historique"}]
    original = run.evaluation.questions.first()
    QuestionScoreGuide.objects.create(question=original, **old[0])
    client = client_for(admin)
    response = complete(client_for(coach), run) if completed else start(client_for(coach), run)
    assert response.status_code == 200
    assert response.json()["questions"][0]["score_guides"] == old
    before = list(run.questions.values("pk", "text", "score", "score_guides"))
    copied = Evaluation.objects.get(pk=new_version(client, run.evaluation).json()["id"])
    question = copied.questions.first()
    assert question.pk != original.pk
    assert list(question.score_guides.values("score", "text")) == old
    url = reverse("question-detail", kwargs={"question_id": question.pk})
    new = [{"score": 5, "text": "Repère v2"}, {"score": 7, "text": "Niveau v2"}]
    assert csrf_put(client, url, {"name": question.name, "score_guides": new}).status_code == 200
    assert transition(client, copied, "validate").status_code == 200
    assert list(original.score_guides.values("score", "text")) == old
    # Even a direct maintenance write must not affect an already started run.
    original.score_guides.update(text="Maintenance ultérieure")
    assert start(client_for(coach), run).json()["questions"][0]["score_guides"] == old
    assert list(run.questions.values("pk", "text", "score", "score_guides")) == before
    if not completed:
        assert complete(client_for(coach), run).status_code == 200
    assert csrf_put(client, route(run, "revision"), revision_answers(run)).status_code == 200
    assert client.get(route(run)).json()["questions"][0]["score_guides"] == old
    schedule = EvaluationSchedule.objects.create(
        team=run.team,
        evaluation=copied,
        assignee=coach,
        mode="immediate",
        first_due_date=run.due_date,
    )
    next_run = ensure_expected_evaluation(schedule)
    assert start(client_for(coach), next_run).json()["questions"][0]["score_guides"] == new
    assert next_run.questions.first().score is None


def test_run_input_cannot_replace_snapshot_guides():
    _, coach, _, run = taking_context()
    client = client_for(coach)
    start(client, run)
    question = run.questions.first()
    payload = {"score": 8, "score_guides": [{"score": 8, "text": "Injecté"}]}
    assert (
        csrf_put(client, route(run, "score", question.source_question_id), payload).status_code
        == 400
    )
    question.refresh_from_db()
    assert question.score is None
    assert question.score_guides == []
