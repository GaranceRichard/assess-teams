import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from teams.models import Team
from tests.taking_helpers import taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.api]


def test_logs_can_select_archived_teams_without_changing_active_team_listing():
    own, _, admin, _ = taking_context("Own")
    foreign, _, _, _ = taking_context("Other")
    archived = Team.objects.create(name="Archived", organization=own, is_active=False)
    Team.objects.create(name="Foreign archive", organization=foreign, is_active=False)
    client = APIClient()
    client.force_login(admin)
    route = reverse("team-list", kwargs={"organization_id": own.pk})
    assert archived.pk not in [item["id"] for item in client.get(route).json()]
    included = client.get(route, {"include_archived": "true"})
    assert included.status_code == 200
    assert archived.pk in [item["id"] for item in included.json()]
    assert all(item["organization_id"] == own.pk for item in included.json())
    assert client.get(route, {"include_archived": "unknown"}).status_code == 400
    assert (
        client.get(
            reverse("team-list", kwargs={"organization_id": foreign.pk}),
            {"include_archived": "true"},
        ).status_code
        == 404
    )
