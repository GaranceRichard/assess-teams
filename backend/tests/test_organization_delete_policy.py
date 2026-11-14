import pytest
from django.utils import timezone

from assessments.models import (
    Evaluation,
    EvaluationFamily,
    EvaluationRunState,
    EvaluationSchedule,
    EvaluationStatus,
    Question,
    ScheduleMode,
)
from identities.models import Organization
from notifications.models import DeliveryState, EmailNotification
from teams.models import Team
from tests.managed_user_helpers import csrf_put
from tests.organization_delete_helpers import assert_refused
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("active", [True, False])
def test_team_without_any_evaluation_blocks_organization_deletion(active):
    organization = Organization.objects.create(name="Protected")
    Team.objects.create(organization=organization, name="Team", is_active=active)
    assert_refused(organization, "équipes")


@pytest.mark.parametrize("status", EvaluationStatus.values)
def test_every_reference_status_blocks_without_any_run(status):
    organization = Organization.objects.create(name="Protected")
    evaluation = Evaluation.objects.create(organization=organization, index=1, status=status)
    Question.objects.create(evaluation=evaluation, index=1, appreciation_markers=["Repère"])
    response = assert_refused(organization, "référentiels")
    assert "questions" in response.json()["detail"]


def test_family_without_versions_blocks_deletion():
    organization = Organization.objects.create(name="Protected")
    EvaluationFamily.objects.create(organization=organization, name="Empty family")
    assert_refused(organization, "référentiels")


@pytest.mark.parametrize("mode", ScheduleMode.values)
@pytest.mark.parametrize("assigned", [True, False])
def test_plan_without_run_blocks_with_or_without_assignment(mode, assigned):
    organization, coach, _, run = taking_context()
    schedule = run.schedule
    run.delete()
    schedule.mode = mode
    schedule.assignee = coach if assigned else None
    schedule.requires_reassignment = not assigned
    schedule.next_due_date = None
    schedule.save()
    assert_refused(organization, "planifications")


@pytest.mark.parametrize("state", EvaluationRunState.values)
def test_all_run_states_and_snapshots_survive_refusal(state):
    organization, coach, admin, run = taking_context()
    if state == EvaluationRunState.IN_PROGRESS:
        start(client_for(coach), run)
        run.questions.first().__class__.objects.filter(run=run).update(score=4)
    elif state == EvaluationRunState.COMPLETED:
        complete(client_for(coach), run)
        response = csrf_put(client_for(admin), route(run, "revision"), revision_answers(run))
        assert response.status_code == 200
    response = assert_refused(organization, "passations")
    if state != EvaluationRunState.NOT_STARTED:
        assert "observations" in response.json()["detail"]


@pytest.mark.parametrize("state", DeliveryState.values)
def test_every_linked_notification_state_blocks_without_business_objects(state):
    organization = Organization.objects.create(name="Protected")
    EmailNotification.objects.create(
        organization=organization, state=state, recipient="test@example.com", body="Kept"
    )
    assert_refused(organization, "notifications")


@pytest.mark.parametrize("relation", ["team", "evaluation", "schedule"])
def test_notification_without_direct_organization_link_is_detected(relation):
    organization, _, _, run = taking_context()
    related = {"team": run.team, "evaluation": run.evaluation, "schedule": run.schedule}[relation]
    EmailNotification.objects.create(recipient="test@example.com", **{relation: related})
    assert_refused(organization, "notifications")


def test_inconsistent_indirect_run_and_snapshot_references_are_not_ignored():
    organization, coach, _, run = taking_context()
    start(client_for(coach), run)
    other = Organization.objects.create(name="Other")
    run.organization = other
    run.save(update_fields=["organization"])
    response = assert_refused(organization, "passations")
    assert "observations" in response.json()["detail"]


def test_mixed_graph_refusal_preserves_waiting_runs_and_all_business_data():
    organization, coach, _, run = taking_context()
    complete(client_for(coach), run)
    EvaluationSchedule.objects.create(
        team=run.team,
        evaluation=run.evaluation,
        mode=ScheduleMode.MONTHLY,
        first_due_date=timezone.localdate(),
    ).runs.create(
        due_date=timezone.localdate(),
        organization=organization,
        team=run.team,
        evaluation=run.evaluation,
    )
    EmailNotification.objects.create(organization=organization, recipient="test@example.com")
    assert_refused(organization, "passations")
