import pytest

from identities.domain.users import Role
from journals.models import ActivityAction, ActivityEntry
from tests.identity_helpers import create_user
from tests.managed_user_helpers import csrf_put
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


def test_admin_revision_preserves_initial_completion_and_tracks_latest_reviewer():
    organization, coach, admin, run = taking_context()
    complete(client_for(coach), run)
    run.refresh_from_db()
    original_date = run.completed_at
    revised = csrf_put(client_for(admin), route(run, "revision"), revision_answers(run))
    assert revised.status_code == 200
    run.refresh_from_db()
    first_revision = run.revised_at
    assert run.completed_by == coach
    assert run.completed_at == original_date
    assert run.revised_by == admin
    assert run.revised_at >= original_date
    assert [question.score for question in run.questions.all()] == [5, 5]
    second_admin = create_user("second-admin", Role.ADMIN)
    organization.users.add(second_admin)
    result = csrf_put(client_for(second_admin), route(run, "revision"), revision_answers(run, 10))
    run.refresh_from_db()
    assert result.json()["filled_by"] == coach.username
    assert result.json()["revised_by"] == second_admin.username
    assert run.revised_at >= first_revision
    assert run.completed_at == original_date
    assert run.completed_by == coach
    assert run.revised_by == second_admin
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_REVISED).count() == 2
    assert (
        save(client_for(admin), run, run.questions.first().source_question_id, 1).status_code == 400
    )


@pytest.mark.parametrize("case", ["missing", "extra", "duplicate", "invalid", "empty"])
def test_revision_is_atomic_and_rejects_incomplete_or_invalid_payload(case):
    _, coach, admin, run = taking_context()
    complete(client_for(coach), run)
    payload = revision_answers(run)
    if case == "missing":
        payload["answers"].pop()
    elif case == "extra":
        payload["answers"].append({"question_id": 999999, "score": 5})
    elif case == "duplicate":
        payload["answers"].append(payload["answers"][0])
    elif case == "invalid":
        payload["answers"][0]["score"] = 11
    else:
        payload["answers"] = []
    assert csrf_put(client_for(admin), route(run, "revision"), payload).status_code == 400
    run.refresh_from_db()
    assert run.revised_at is None
    assert list(run.questions.values_list("score", flat=True)) == [0, 10]
    assert ActivityEntry.objects.count() == 1


def test_in_progress_evaluation_cannot_be_revised_and_coach_cannot_revise_completed_one():
    _, coach, admin, run = taking_context()
    start(client_for(coach), run)
    assert (
        csrf_put(client_for(admin), route(run, "revision"), revision_answers(run)).status_code
        == 400
    )
    complete(client_for(coach), run)
    assert (
        csrf_put(client_for(coach), route(run, "revision"), revision_answers(run)).status_code
        == 403
    )
