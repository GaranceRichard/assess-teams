import json

import pytest

from tests.startup_helpers import production_environment, startup


def documentation(method, path="/api/docs/"):
    result = startup(
        production_environment(),
        f"""
import django, json
django.setup()
from django.test import Client
response = Client().{method}({path!r}, secure=True, HTTP_HOST='assess.example')
print(json.dumps({{'status': response.status_code, 'html': response.content.decode()}}))
""",
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


@pytest.mark.functional
def test_production_swagger_uses_only_local_assets():
    response = documentation("get")
    assert response["status"] == 200
    html = response["html"]
    for name in [
        "swagger-ui.css",
        "swagger-ui-bundle.js",
        "swagger-ui-standalone-preset.js",
        "favicon-32x32.png",
    ]:
        assert f'"/static/swagger-ui/{name}"' in html
    assert '"validatorUrl": null' in html
    assert '"queryConfigEnabled": false' in html
    assert "cdn.jsdelivr.net" not in html
    assert "https://validator.swagger.io" not in html
    assert 'url: "/api/schema/"' in html


@pytest.mark.functional
def test_local_documentation_still_refuses_mutations():
    assert documentation("post")["status"] == 405


@pytest.mark.contract
def test_generated_schema_has_no_external_reference_or_prototype_control_key():
    response = documentation("get", "/api/schema/?format=json")
    assert response["status"] == 200
    schema = json.loads(response["html"])

    def check(value):
        if isinstance(value, dict):
            assert not {"__proto__", "prototype", "constructor"}.intersection(value)
            if "$ref" in value:
                assert value["$ref"].startswith("#/")
            for child in value.values():
                check(child)
        elif isinstance(value, list):
            for child in value:
                check(child)

    check(schema)
