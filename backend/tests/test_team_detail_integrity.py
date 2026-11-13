import pytest
from django.apps import apps
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.urls import reverse

from identities.models import Organization
from journals.models import ActivityEntry, LogEntry
from teams.models import Team
from tests.managed_user_helpers import csrf_put
from tests.taking_helpers import client_for, complete, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def business_state():
    models = [
        Organization,
        Organization.users.through,
        Team,
        Team.coaches.through,
        ActivityEntry,
        *apps.get_app_config("assessments").get_models(),
    ]
    return {model._meta.label: list(model.objects.order_by("pk").values()) for model in models}


@pytest.mark.parametrize("active", [False, True])
def test_detail_preserves_business_data_and_writes_only_one_http_log(active):
    organization, coach, admin, run = taking_context()
    team = run.team
    team.coaches.add(coach)
    assert complete(client_for(coach), run).status_code == 200
    team.is_active = active
    team.save(update_fields=["is_active"])
    client = client_for(admin)
    before = business_state()
    previous_logs = list(LogEntry.objects.order_by("pk").values())

    with CaptureQueriesContext(connection) as queries:
        response = client.get(reverse("team-detail", kwargs={"team_id": team.pk}))

    assert response.status_code == 200
    assert business_state() == before
    assert list(LogEntry.objects.order_by("pk").values())[:-1] == previous_logs
    entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
    assert entry.organization == organization
    assert entry.team == team
    assert entry.method == "GET"
    assert entry.status_code == 200
    writes = [
        query["sql"]
        for query in queries.captured_queries
        if query["sql"].split()[0].upper() in {"INSERT", "UPDATE", "DELETE", "REPLACE"}
    ]
    assert len(writes) == 1
    assert writes[0].startswith('INSERT INTO "journals_logentry"')


def test_reading_an_archive_preserves_identity_and_does_not_make_it_mutable():
    organization, coach, admin, run = taking_context()
    team = run.team
    team.coaches.add(coach)
    client = client_for(admin)
    detail = reverse("team-detail", kwargs={"team_id": team.pk})
    active = client.get(detail)
    assert active.status_code == 200
    archived = client.delete(detail, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)
    assert archived.status_code == 204
    before = business_state()

    read = client.get(detail)
    renamed = csrf_put(client, detail, {"name": "Forbidden", "coach_ids": []})
    repeated = client.delete(detail, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)

    assert read.status_code == 200
    assert read.json() == {**active.json(), "is_active": False}
    assert renamed.status_code == 404
    assert repeated.status_code == 400
    assert repeated.json() == ["Équipe déjà archivée."]
    assert business_state() == before
    collection = reverse("team-list", kwargs={"organization_id": organization.pk})
    assert client.get(collection).json() == []
    assert client.get(collection, {"include_archived": "true"}).json()[0]["id"] == team.pk
