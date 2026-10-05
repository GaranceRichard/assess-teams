from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from journals.models import LogLevel, LogSource
from journals.services import record_log
from tests.identity_helpers import create_superuser
from tests.taking_helpers import taking_context
from tests.test_logs_api import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.api]


@pytest.fixture
def log_context():
    organization, _, admin, run = taking_context("Own")
    foreign, _, foreign_admin, foreign_run = taking_context("Other")
    entry = record_log(
        level=LogLevel.WARNING,
        source=LogSource.ASSESSMENTS,
        message="Chosen",
        actor=admin,
        organization=organization,
        team=run.team,
        evaluation=run.evaluation,
        evaluation_name=run.evaluation.name,
        method="PUT",
        status_code=400,
    )
    record_log(
        level=LogLevel.ERROR,
        source=LogSource.TEAMS,
        message="Other",
        actor=foreign_admin,
        organization=foreign,
        team=foreign_run.team,
        evaluation=foreign_run.evaluation,
        method="DELETE",
        status_code=500,
    )
    return entry, admin, foreign_run


def params_for(entry):
    return {
        "organization": entry.organization_id,
        "actor": entry.actor_id,
        "team": entry.team_id,
        "evaluation": entry.evaluation_id,
        "from": (entry.created_at - timedelta(seconds=1)).isoformat(),
        "to": (entry.created_at + timedelta(seconds=1)).isoformat(),
        "method": entry.method,
        "status_code": entry.status_code,
        "level": entry.level,
        "source": entry.source,
    }


@pytest.mark.parametrize(
    "key",
    [
        "organization",
        "actor",
        "team",
        "evaluation",
        "from",
        "to",
        "method",
        "status_code",
        "level",
        "source",
    ],
)
def test_individual_filters_and_authorized_scope(log_context, key):
    entry, admin, _ = log_context
    result = client_for(admin).get(reverse("logs"), {key: params_for(entry)[key]}).json()
    assert entry.pk in [item["id"] for item in result["results"]]
    assert all(item["organization_id"] == entry.organization_id for item in result["results"])


def test_combined_filters_datetime_boundaries_and_pagination(log_context):
    entry, _, _ = log_context
    client = client_for(create_superuser())
    params = params_for(entry)
    assert client.get(reverse("logs"), params).json()["count"] == 1
    for key in params:
        without = {name: value for name, value in params.items() if name != key}
        assert client.get(reverse("logs"), without).json()["count"] == 1
    params["from"] = entry.created_at.isoformat()
    params["to"] = entry.created_at.isoformat()
    assert client.get(reverse("logs"), params).json()["count"] == 1
    params["from"] = (entry.created_at + timedelta(seconds=1)).isoformat()
    assert client.get(reverse("logs"), params).status_code == 400
    params["to"] = (timezone.now() + timedelta(seconds=2)).isoformat()
    assert client.get(reverse("logs"), params).json()["count"] == 0
    assert client.get(reverse("logs"), {"page": 999}).status_code == 404


@pytest.mark.parametrize("key", ["organization", "organization_id", "actor", "team", "evaluation"])
def test_forged_foreign_filters_never_escape_admin_scope(log_context, key):
    _, admin, foreign_run = log_context
    values = {
        "organization": foreign_run.organization_id,
        "organization_id": foreign_run.organization_id,
        "actor": foreign_run.assignee_id,
        "team": foreign_run.team_id,
        "evaluation": foreign_run.evaluation_id,
    }
    response = client_for(admin).get(reverse("logs"), {key: values[key]})
    assert response.status_code == 200
    assert response.json()["count"] == 0


@pytest.mark.parametrize(
    "params",
    [
        {"organization": -1},
        {"actor": "name"},
        {"team": "text"},
        {"evaluation": 0},
        {"from": "bad"},
        {"to": "bad"},
        {"method": "OPTIONS"},
        {"status_code": 600},
        {"source": "unknown"},
        {"level": "DEBUG"},
        {"page": 0},
    ],
)
def test_invalid_structured_filters_are_refused(log_context, params):
    _, admin, _ = log_context
    assert client_for(admin).get(reverse("logs"), params).status_code == 400
