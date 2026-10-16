import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from config.sqlite_contention import CONTENTION_FAILED
from journals.exceptions import OPERATION_FAILED

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_schema_describes_safe_errors_for_all_product_operations():
    client = APIClient()
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    for path, item in schema["paths"].items():
        if path in {"/api/health/", "/api/schema/", "/api/docs/"}:
            continue
        for operation in item.values():
            assert CONTENTION_FAILED in operation["responses"]["500"]["description"]
            error = operation["responses"]["500"]["content"]["application/json"]
            assert error["schema"]["required"] == ["detail"]
            assert error["schema"]["properties"]["detail"] == {"type": "string"}
            assert error["example"] == {"detail": OPERATION_FAILED}
    assert client.get(reverse("swagger-ui")).status_code == 200
