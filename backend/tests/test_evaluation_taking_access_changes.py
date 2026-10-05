import pytest

from assessments.adapters.api import taking_views
from assessments.models import EvaluationRun
from journals.models import ActivityEntry
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


@pytest.mark.parametrize(
    ("operation", "access_change"),
    [
        (operation, change)
        for operation in ("start", "score", "finalize", "revision")
        for change in ("assignment", "organization", "membership")
        if (operation, change) != ("revision", "assignment")
    ],
)
def test_mutations_recheck_access_when_context_changes_after_initial_lookup(
    monkeypatch, operation, access_change
):
    organization, coach, admin, run = taking_context()
    foreign_organization, _, _, _ = taking_context("South")
    if operation != "start":
        start(client_for(coach), run)
    if operation in ("finalize", "revision"):
        for question in run.questions.all():
            run.questions.filter(pk=question.pk).update(score=5)
    if operation == "revision":
        complete(client_for(coach), run)
    actor = admin if operation == "revision" else coach
    original_lookup = taking_views.scoped_run

    def lookup_then_change_context(request, run_id):
        found = original_lookup(request, run_id)
        if access_change == "assignment":
            EvaluationRun.objects.filter(pk=run_id).update(assignee=admin)
        elif access_change == "organization":
            EvaluationRun.objects.filter(pk=run_id).update(organization=foreign_organization)
        else:
            organization.users.remove(actor)
        return found

    monkeypatch.setattr(taking_views, "scoped_run", lookup_then_change_context)
    activity_count = ActivityEntry.objects.count()
    previous_scores = list(run.questions.values_list("score", flat=True))
    client = client_for(actor)
    if operation == "start":
        response = start(client, run)
    elif operation == "score":
        response = csrf_put(
            client, route(run, "score", run.questions.first().source_question_id), {"score": 10}
        )
    elif operation == "finalize":
        response = csrf_post(client, route(run, "finalize"), {})
    else:
        response = csrf_put(client, route(run, "revision"), revision_answers(run, 10))
    assert response.status_code == 404
    run.refresh_from_db()
    assert list(run.questions.values_list("score", flat=True)) == previous_scores
    assert run.revised_at is None
    if operation != "revision":
        assert run.completed_at is None
    assert ActivityEntry.objects.count() == activity_count


def test_admin_can_still_complete_and_revise_after_assignment_changes(monkeypatch):
    _, coach, admin, run = taking_context()
    original_lookup = taking_views.scoped_run

    def lookup_then_change_assignee(request, run_id):
        found = original_lookup(request, run_id)
        EvaluationRun.objects.filter(pk=run_id).update(assignee=admin)
        return found

    monkeypatch.setattr(taking_views, "scoped_run", lookup_then_change_assignee)
    client = client_for(admin)
    assert complete(client, run).status_code == 200
    assert csrf_put(client, route(run, "revision"), revision_answers(run, 0)).status_code == 200
    run.refresh_from_db()
    assert run.completed_by == admin
    assert run.revised_by == admin
    assert run.assignee_name == coach.username
