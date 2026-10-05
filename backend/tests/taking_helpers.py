from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import (
    Evaluation,
    EvaluationSchedule,
    EvaluationStatus,
    Question,
    ScheduleMode,
)
from identities.domain.users import Role
from identities.models import Organization
from teams.models import Team
from tests.identity_helpers import create_user
from tests.managed_user_helpers import csrf_post, csrf_put


def taking_context(name="North"):
    organization = Organization.objects.create(name=name)
    coach = create_user(f"{name}-coach", Role.COACH)
    admin = create_user(f"{name}-admin", Role.ADMIN)
    organization.users.add(coach, admin)
    team = Team.objects.create(organization=organization, name=f"{name} Team")
    evaluation = Evaluation.objects.create(
        organization=organization, name="Coopération", index=1, status=EvaluationStatus.VALIDATED
    )
    Question.objects.create(evaluation=evaluation, index=2, name="Deuxième question")
    Question.objects.create(evaluation=evaluation, index=1, name="Première question")
    schedule = EvaluationSchedule.objects.create(
        team=team,
        evaluation=evaluation,
        assignee=coach,
        mode=ScheduleMode.IMMEDIATE,
        first_due_date=timezone.localdate(),
    )
    run = ensure_expected_evaluation(schedule)
    return organization, coach, admin, run


def client_for(user):
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def route(run, action="detail", question_id=None):
    kwargs = {"run_id": run.pk}
    if question_id is not None:
        kwargs["question_id"] = question_id
    return reverse(f"evaluation-run-{action}", kwargs=kwargs)


def start(client, run):
    return csrf_post(client, route(run), {})


def save(client, run, question_id, score):
    return csrf_put(client, route(run, "score", question_id), {"score": score})


def complete(client, run):
    start(client, run)
    for index, question in enumerate(run.questions.all()):
        assert save(client, run, question.source_question_id, index * 10).status_code == 204
    return csrf_post(client, route(run, "finalize"), {})


def revision_answers(run, score=5):
    return {
        "answers": [
            {"question_id": question.source_question_id, "score": score}
            for question in run.questions.all()
        ]
    }
