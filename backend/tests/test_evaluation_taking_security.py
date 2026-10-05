import pytest

from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_forged_context_or_completion_provenance_is_refused():
    _, coach, admin, run = taking_context()
    _, _, _, foreign = taking_context("South")
    client = client_for(coach)
    forged = {"organization_id": foreign.organization_id, "assignee_id": admin.pk}
    assert csrf_post(client, route(run), forged).status_code == 400
    start(client, run)
    question_id = run.questions.first().source_question_id
    assert (
        csrf_put(client, route(run, "score", question_id), {"score": 5, **forged}).status_code
        == 400
    )
    assert (
        csrf_post(client, route(run, "finalize"), {"completed_by_id": admin.pk}).status_code == 400
    )
    run.refresh_from_db()
    assert run.completed_at is None
    assert run.questions.first().score is None
    assert run.assignee == coach


def test_foreign_question_cannot_be_injected_in_score_or_admin_revision():
    _, coach, admin, run = taking_context()
    _, foreign_coach, _, foreign = taking_context("South")
    start(client_for(coach), run)
    start(client_for(foreign_coach), foreign)
    foreign_question = foreign.questions.first().source_question_id
    client = client_for(admin)
    assert csrf_put(client, route(run, "score", foreign_question), {"score": 5}).status_code == 400
    complete(client, run)
    answers = revision_answers(run)
    answers["answers"][0]["question_id"] = foreign_question
    assert csrf_put(client, route(run, "revision"), answers).status_code == 400
    run.refresh_from_db()
    assert run.revised_at is None
    assert foreign.questions.first().score is None


def test_revision_rejects_replacement_of_initial_author_or_unexpected_answer_fields():
    _, coach, admin, run = taking_context()
    complete(client_for(coach), run)
    payload = {**revision_answers(run), "completed_by_id": admin.pk}
    assert csrf_put(client_for(admin), route(run, "revision"), payload).status_code == 400
    payload = revision_answers(run)
    payload["answers"][0]["organization_id"] = run.organization_id
    assert csrf_put(client_for(admin), route(run, "revision"), payload).status_code == 400
    run.refresh_from_db()
    assert run.completed_by == coach
    assert run.revised_at is None


def test_start_rejects_inconsistent_model_organization_and_preserves_pending_state():
    _, _, admin, run = taking_context()
    _, _, _, foreign = taking_context("South")
    run.evaluation = foreign.evaluation
    run.save(update_fields=["evaluation"])
    assert start(client_for(admin), run).status_code == 400
    run.refresh_from_db()
    assert run.state == "not_started"
    assert not run.questions.exists()


def test_missing_assignee_blocks_start_and_unstarted_response_writes_are_refused():
    _, coach, admin, run = taking_context()
    client = client_for(admin)
    question_id = run.evaluation.questions.first().pk
    assert csrf_put(client, route(run, "score", question_id), {"score": 5}).status_code == 400
    coach.delete()
    assert start(client, run).status_code == 400
