import pytest
from django.urls import reverse

from tests.isolation_helpers import business_snapshot, request, session
from tests.role_matrix_helpers import ACTIONS, ALL, action_request
from tests.test_api_permission_inventory import PUBLIC_ROUTES, ROUTES

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]

FORBIDDEN = [
    pytest.param(name, method, role, id=f"{name}-{method}-{role}")
    for name, methods, allowed in ACTIONS
    for method in methods.split()
    for role in sorted(ALL - allowed)
]


def test_matrix_covers_every_registered_business_operation():
    actual = {
        (name, method)
        for name, _, view in ROUTES
        if name not in PUBLIC_ROUTES
        for method in view.http_method_names
        if method not in {"head", "options"} and hasattr(view, method)
    }
    assert {(name, method) for name, methods, _ in ACTIONS for method in methods.split()} == actual


@pytest.mark.parametrize("name,method,role", FORBIDDEN)
def test_forbidden_role_cannot_read_or_mutate_any_business_operation(isolation, name, method, role):
    actor = getattr(isolation.a, role)
    client = session(actor)
    url, payload = action_request(isolation.a, name)
    before = business_snapshot()

    response = request(client, method, url, payload)

    assert response.status_code == 403
    assert set(response.json()) == {"detail"}
    assert business_snapshot() == before


@pytest.mark.parametrize("role", sorted(ALL))
def test_legitimate_dashboard_and_results_reads_are_preserved(isolation, role):
    side = isolation.a
    client = session(isolation.root if role == "root" else getattr(side, role))
    assert client.get(reverse("dashboard")).status_code == 200
    assert client.get(reverse("result-versions")).status_code == 200
    response = client.get(
        reverse("result-comparison", kwargs={"evaluation_id": side.evaluation.pk})
    )
    assert response.status_code == 200
    before = business_snapshot()
    assert request(client, "post", "/api/results/versions/").status_code == 405
    assert business_snapshot() == before


@pytest.mark.parametrize("name,url,view", [row for row in ROUTES if row[0] in PUBLIC_ROUTES])
def test_public_exceptions_do_not_enable_unimplemented_http_methods(isolation, name, url, view):
    client = session(isolation.a.viewer)
    # Use the CSRF-initialized browser without its authenticated session.
    client.cookies.pop("sessionid")
    declared = {method for method in view.http_method_names if hasattr(view, method)}
    if "get" in declared:
        declared.add("head")
    for method in {"get", "post", "put", "patch", "delete"} - declared:
        before = business_snapshot()
        response = request(client, method, url, {"is_superuser": True, "role": "Admin"})
        assert response.status_code == 405, (name, method)
        assert business_snapshot() == before
