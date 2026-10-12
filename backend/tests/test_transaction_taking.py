from unittest.mock import patch

import pytest
from django.db import IntegrityError

from assessments.application.taking import start_evaluation
from assessments.models import EvaluationRunQuestion, EvaluationRunState
from journals.models import ActivityEntry, LogEntry
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

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.functional,
    pytest.mark.integration,
]


@pytest.mark.parametrize(
    "exception", [IntegrityError("private-sql-detail"), RuntimeError("private")]
)
def test_snapshot_failure_rolls_back_state_and_partial_questions_with_safe_response(exception):
    _, coach, _, run = taking_context()
    client = client_for(coach)
    client.raise_request_exception = False
    original = EvaluationRunQuestion.objects.bulk_create

    def partial(questions):
        original(questions[:1])
        raise exception

    with patch("assessments.application.taking.EvaluationRunQuestion.objects.bulk_create", partial):
        response = start(client, run)
    assert response.status_code == 500
    assert response.json() == {
        "detail": "L’opération n’a pas pu être réalisée. Veuillez réessayer."
    }
    assert response["X-Correlation-ID"]
    run.refresh_from_db()
    assert run.state == EvaluationRunState.NOT_STARTED
    assert not run.questions.exists()
    assert not ActivityEntry.objects.exists()
    assert LogEntry.objects.get(status_code=500).evaluation_id == run.evaluation_id
    assert start(client, run).status_code == 200
    assert run.questions.count() == 2


def test_interruption_rolls_back_partial_snapshot():
    _, coach, _, run = taking_context()
    original = EvaluationRunQuestion.objects.bulk_create

    def interrupted(questions):
        original(questions[:1])
        raise KeyboardInterrupt()

    with patch(
        "assessments.application.taking.EvaluationRunQuestion.objects.bulk_create", interrupted
    ):
        with pytest.raises(KeyboardInterrupt):
            start_evaluation(run, coach)
    run.refresh_from_db()
    assert run.state == EvaluationRunState.NOT_STARTED
    assert not run.questions.exists()


def test_failed_completion_keeps_committed_draft_and_retry_completes():
    _, coach, _, run = taking_context()
    client = client_for(coach)
    assert start(client, run).status_code == 200
    for question in run.questions.all():
        assert save(client, run, question.source_question_id, 7).status_code == 204
    with patch(
        "assessments.application.taking.evaluation_run_activity", side_effect=IntegrityError()
    ):
        response = csrf_post(client, route(run, "finalize"), {})
    assert response.status_code == 500
    run.refresh_from_db()
    assert run.state == EvaluationRunState.IN_PROGRESS
    assert run.completed_at is None
    assert run.completed_by_id is None
    assert list(run.questions.values_list("score", flat=True)) == [7, 7]
    assert not ActivityEntry.objects.exists()
    assert csrf_post(client, route(run, "finalize"), {}).status_code == 200
    assert ActivityEntry.objects.count() == 1


def test_failed_revision_preserves_initial_result_provenance_and_independent_completion():
    _, coach, admin, run = taking_context()
    assert complete(client_for(coach), run).status_code == 200
    run.refresh_from_db()
    provenance = (run.completed_at, run.completed_by_id, run.completed_by_name)
    initial_scores = list(run.questions.values_list("score", flat=True))
    other = taking_context("Independent")[3]
    assert complete(client_for(other.assignee), other).status_code == 200
    with patch(
        "assessments.application.taking.evaluation_run_activity", side_effect=IntegrityError()
    ):
        response = csrf_put(client_for(admin), route(run, "revision"), revision_answers(run))
    assert response.status_code == 500
    run.refresh_from_db()
    other.refresh_from_db()
    assert list(run.questions.values_list("score", flat=True)) == initial_scores
    assert (run.completed_at, run.completed_by_id, run.completed_by_name) == provenance
    assert run.revised_at is None
    assert other.state == EvaluationRunState.COMPLETED
    assert ActivityEntry.objects.count() == 2


def test_response_preparation_failure_rolls_back_the_started_run():
    _, coach, _, run = taking_context()
    with patch(
        "assessments.adapters.api.taking_views.EvaluationRunSerializer.to_representation",
        side_effect=RuntimeError("serialization-failed"),
    ):
        response = start(client_for(coach), run)
    assert response.status_code == 500
    run.refresh_from_db()
    assert run.state == EvaluationRunState.NOT_STARTED
    assert not run.questions.exists()
