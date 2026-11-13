import pytest
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_archive_schema_documents_approved_explicit_refusal():
    schema = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    operation = schema["paths"]["/api/admin/teams/{team_id}/"]["delete"]
    assert {"cookieAuth": []} in operation["security"]
    assert "requestBody" not in operation
    assert set(operation["responses"]) == {"204", "400", "403", "404", "500"}
    assert "content" not in operation["responses"]["204"]
    error = operation["responses"]["400"]["content"]["application/json"]["schema"]
    assert error == {
        "type": "array",
        "items": {"type": "string"},
        "example": ["Équipe déjà archivée."],
    }
