from types import SimpleNamespace

import pytest
from django.apps import apps
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import Evaluation, EvaluationRunState, Question
from identities.domain.users import Role
from tests.identity_helpers import TEST_CREDENTIAL, create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.results_helpers import another_run
from tests.taking_helpers import complete, taking_context


def session(user):
    client = APIClient(enforce_csrf_checks=True)
    client.get(reverse("session-current"))
    response = csrf_post(
        client,
        reverse("session-login"),
        {"username": user.username, "password": TEST_CREDENTIAL},
    )
    assert response.status_code == 200
    return client


def side(name):
    organization, coach, admin, run = taking_context(name)
    coach.email = f"{name}@example.com"
    coach.save(update_fields=["email"])
    viewer = create_user(f"{name}-viewer", Role.VIEWER)
    organization.users.add(viewer)
    run.team.coaches.add(coach)
    assert complete(session(coach), run).status_code == 200
    run.refresh_from_db()
    waiting = another_run(run, state=EvaluationRunState.NOT_STARTED)
    draft = Evaluation.objects.create(organization=organization, name=f"{name} draft", index=2)
    question = Question.objects.create(evaluation=draft, name=f"{name} question", index=1)
    return SimpleNamespace(
        organization=organization,
        coach=coach,
        admin=admin,
        viewer=viewer,
        run=run,
        waiting=waiting,
        team=run.team,
        evaluation=run.evaluation,
        schedule=run.schedule,
        draft=draft,
        question=question,
    )


@pytest.fixture
def isolation(settings):
    # Real password/session/CSRF checks; cheaper test-only password encoding.
    settings.PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
    root = create_superuser()
    root.email = "root@example.com"
    root.save(update_fields=["email"])
    return SimpleNamespace(a=side("A"), b=side("B"), root=root)


def business_snapshot():
    labels = {"identities", "teams", "assessments", "notifications", "journals"}
    return {
        model._meta.label: list(model.objects.order_by("pk").values())
        for model in apps.get_models(include_auto_created=True)
        if model._meta.app_label in labels and model._meta.model_name != "logentry"
    }


def request(client, method, url, data=None):
    return getattr(client, method)(
        url, data or {}, format="json", HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value
    )


def members(client, organization, users):
    response = csrf_put(
        client,
        f"/api/admin/organizations/{organization.pk}/members/",
        {"user_ids": [user.pk for user in users]},
    )
    assert response.status_code == 200


def planning(side):
    return {
        "organization_id": side.organization.pk,
        "team_id": side.team.pk,
        "evaluation_id": side.evaluation.pk,
        "assignee_id": side.coach.pk,
        "mode": "immediate",
    }
