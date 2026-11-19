import assert from "node:assert/strict";
import test from "node:test";
import { dependencyContext } from "../dependency-context.mjs";
import { dependents } from "../dependency-graph.mjs";
import { planImpact } from "../impact.mjs";
import { dependencyFixture } from "./dependency-fixtures.mjs";

test("Python imports and Django reverse select unit, integration and API consumers only", () =>
  dependencyFixture(({ root }) => {
    const plan = planImpact(["backend/feature/value.py"], { root });
    assert.equal(plan.exhaustive, false);
    assert.deepEqual(
      plan.checks.find((check) => check.scope === "backend-targeted").tests,
      ["backend/tests/test_api.py", "backend/tests/test_value.py"],
    );
    assert.deepEqual(
      plan.checks.find((check) => check.scope === "frontend-targeted").related,
      ["frontend/src/firstApi.ts"],
    );
    assert.deepEqual(plan.checks.at(-1).tests, ["frontend/e2e/first.spec.ts"]);
    assert.deepEqual(plan.checks.at(-1).demoTests, [
      "frontend/demo-e2e/first.spec.ts",
    ]);
  }));

test("new API tests and indirect module strings are discovered without a maintained test list", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/tests/test_new.py", "def test_new():\n    reverse('first')\n");
    put(
      "backend/tests/test_patch.py",
      "def test_patch():\n    patch('feature.value.value')\n",
    );
    const backend = dependencyContext(root).backend();
    assert.ok(!backend.error, backend.error);
    const reached = dependents(backend.graph, ["backend/feature/value.py"]);
    for (const path of [
      "backend/tests/test_new.py",
      "backend/tests/test_patch.py",
    ])
      assert.ok(reached.has(path), path);
    assert.ok(!reached.has("backend/tests/test_other.py"));
  }));

test("local autouse fixtures do not become global; imported global fixtures keep actual users", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "backend/tests/helpers.py",
      `
import pytest
from feature.value import value
@pytest.fixture
def shared_value():
    return value()
`,
    );
    put(
      "backend/tests/conftest.py",
      "from tests.helpers import shared_value\n",
    );
    put(
      "backend/tests/test_fixture.py",
      "def test_fixture(shared_value):\n    assert shared_value\n",
    );
    put(
      "backend/tests/test_local.py",
      `
import pytest
from feature.value import value
@pytest.fixture(autouse=True)
def local():
    value()
def test_local():
    pass
`,
    );
    const graph = dependencyContext(root).backend().graph;
    const reached = dependents(graph, ["backend/feature/value.py"]);
    assert.ok(reached.has("backend/tests/test_fixture.py"));
    assert.ok(reached.has("backend/tests/test_local.py"));
    assert.ok(!reached.has("backend/tests/test_other.py"));
  }));

test("management commands, relative imports and nested Python imports remain connected", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "backend/feature/management/commands/send_due.py",
      `
def work():
    from ...value import value
    return value()
`,
    );
    put(
      "backend/tests/test_worker.py",
      "def test_worker():\n    call_command('send_due')\n",
    );
    const graph = dependencyContext(root).backend().graph;
    assert.ok(
      dependents(graph, ["backend/feature/value.py"]).has(
        "backend/tests/test_worker.py",
      ),
    );
  }));

test("unknown dynamic Python, missing component tests and malformed sources fail closed", () =>
  dependencyFixture(({ root, put }) => {
    for (const source of [
      "def value(name):\n    return __import__(name)\n",
      "def invalid(:\n",
    ]) {
      put("backend/feature/value.py", source);
      assert.equal(
        planImpact(["backend/feature/value.py"], { root }).exhaustive,
        true,
      );
    }
    put("backend/feature/unproven.py", "def value():\n    return 1\n");
    assert.equal(
      planImpact(["backend/feature/unproven.py"], { root }).exhaustive,
      true,
    );
  }));

test("persistent mutations retain broad validation rather than assuming import-only data dependencies", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/feature/value.py", "def value(model):\n    model.save()\n");
    const plan = planImpact(["backend/feature/value.py"], { root });
    assert.deepEqual(
      plan.checks.map((check) => check.scope),
      ["documentation", "backend", "frontend", "e2e"],
    );
  }));

test("an import-only test file cannot justify a component reduction", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/feature/uncovered.py", "def value():\n    return 1\n");
    put("backend/tests/test_empty.py", "from feature.uncovered import value\n");
    assert.equal(
      planImpact(["backend/feature/uncovered.py"], { root }).exhaustive,
      true,
    );
  }));

test("named helper imports retain only called routes; namespaces, stars and whole-helper edits stay broad", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "backend/tests/route_helpers.py",
      "def first():\n    return reverse('first')\ndef other():\n    return 1\n",
    );
    put(
      "backend/tests/test_first_helper.py",
      "from tests.route_helpers import first\ndef test_first():\n    first()\n",
    );
    put(
      "backend/tests/test_other_helper.py",
      "from tests.route_helpers import other\ndef test_other():\n    other()\n",
    );
    let graph = dependencyContext(root).backend().graph;
    let reached = dependents(graph, ["backend/feature/value.py"]);
    assert.ok(reached.has("backend/tests/test_first_helper.py"));
    assert.ok(!reached.has("backend/tests/test_other_helper.py"));
    for (const declaration of [
      "import tests.route_helpers as helper",
      "from tests.route_helpers import *",
    ]) {
      put(
        "backend/tests/test_namespace.py",
        declaration + "\ndef test_namespace():\n    pass\n",
      );
      graph = dependencyContext(root).backend().graph;
      assert.ok(
        dependents(graph, ["backend/feature/value.py"]).has(
          "backend/tests/test_namespace.py",
        ),
      );
    }
    const plan = planImpact(["backend/tests/route_helpers.py"], { root });
    for (const name of ["test_first_helper.py", "test_other_helper.py"])
      assert.ok(plan.checks.at(-1).tests.includes("backend/tests/" + name));
  }));
