from urllib.parse import urlsplit

import pytest
from django.urls import reverse

from identities.domain.users import Role
from identities.models import Organization
from teams.models import Team
from tests.identity_helpers import create_user
from tests.managed_user_helpers import csrf_post
from tests.taking_helpers import client_for, taking_context
from tests.test_team_detail_integrity import business_state

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_coach_pagination_filters_before_count_and_every_page_without_mutating_data():
    organization, coach, _, _ = taking_context()
    assigned = []
    for index in range(25):
        team = Team.objects.create(organization=organization, name=f"Assigned {index:02}")
        team.coaches.add(coach)
        assigned.append(team.pk)
        Team.objects.create(organization=organization, name=f"Hidden {index:02}")
    client = client_for(coach)
    url = reverse("team-list", kwargs={"organization_id": organization.pk}) + "?page=1"
    before = business_state()
    seen = []
    while url:
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == len(assigned)
        assert all(
            set(row) == {"id", "name", "organization_id", "is_active"} for row in data["results"]
        )
        seen.extend(row["id"] for row in data["results"])
        url = data["next"]
        if url:
            assert urlsplit(url).path == response.wsgi_request.path
    assert seen == assigned
    assert business_state() == before


def test_next_coach_read_includes_newly_created_assigned_team_and_stays_empty_otherwise():
    organization = Organization.objects.create(name="Own")
    coach = create_user("coach", Role.COACH)
    admin = create_user("admin", Role.ADMIN)
    organization.users.add(coach, admin)
    client = client_for(coach)
    collection = reverse("team-list", kwargs={"organization_id": organization.pk})
    assert client.get(collection).json() == []
    assert client.get(collection, {"page": 1}).json()["results"] == []
    created = csrf_post(client_for(admin), collection, {"name": "New", "coach_ids": [coach.pk]})
    assert created.status_code == 201
    assert [team["id"] for team in client.get(collection).json()] == [created.json()["id"]]
    assert not Team.objects.exclude(organization=organization).exists()
