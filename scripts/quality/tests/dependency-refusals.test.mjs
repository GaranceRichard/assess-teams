import assert from "node:assert/strict";
import test from "node:test";
import { planImpact } from "../impact.mjs";
import { dependencyFixture } from "./dependency-fixtures.mjs";

for (const [name, source] of [
  ["fixture factory", "import pytest\ncontext = pytest.fixture(lambda: 1)\n"],
  ["external plugin", "pytest_plugins = ['unknown_plugin']\n"],
  ["pytest hook", "def pytest_configure(config):\n    pass\n"],
  [
    "dynamic fixture name",
    "import pytest\n@pytest.fixture(name=unknown)\ndef context():\n    return 1\n",
  ],
  [
    "dynamic autouse",
    "import pytest\n@pytest.fixture(autouse=unknown)\ndef context():\n    return 1\n",
  ],
]) {
  test(`${name} cannot hide global fixture dependencies`, () =>
    dependencyFixture(({ root, put }) => {
      put("backend/tests/conftest.py", source);
      assert.equal(
        planImpact(["backend/feature/value.py"], { root }).exhaustive,
        true,
      );
    }));
}

test("aliased dynamic imports refuse a falsely local Python plan", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "backend/feature/value.py",
      "from importlib import import_module as load\ndef value(name):\n    return load(name)\n",
    );
    assert.equal(
      planImpact(["backend/feature/value.py"], { root }).exhaustive,
      true,
    );
  }));

test("unbounded Django route registration refuses reduction", () =>
  dependencyFixture(({ root, put }) => {
    for (const registration of [
      'urlpatterns = [path("api/", include("feature.urls"))]',
      'urlpatterns = [path("api/first/", lambda request: response)]',
      'urlpatterns = [re_path(r"api/.+", FeatureView.as_view())]',
    ]) {
      put("backend/config/urls.py", registration);
      assert.equal(
        planImpact(["backend/feature/value.py"], { root }).exhaustive,
        true,
      );
    }
  }));

test("new role and CSRF declarations keep the reinforced frontend checks", () =>
  dependencyFixture(({ root }) => {
    for (const patch of [
      "+return user.role === 'Admin'",
      "+headers = {'X-CSRFToken': ''}",
      "+fetch (url)",
    ]) {
      assert.deepEqual(
        planImpact([{ path: "frontend/src/Widget.tsx", patch }], {
          root,
        }).checks.map((check) => check.scope),
        ["documentation", "frontend", "e2e"],
      );
    }
  }));

test("new notification writers cannot inherit the audited internal persistence exception", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/notifications/__init__.py", "");
    put(
      "backend/notifications/producer.py",
      "def mutate(model):\n    model.save()\n",
    );
    put(
      "backend/tests/test_notification_writer.py",
      "from notifications.producer import mutate\ndef test_writer():\n    pass\n",
    );
    const plan = planImpact(["backend/notifications/producer.py"], { root });
    assert.deepEqual(
      plan.checks.map((c) => c.scope),
      ["documentation", "backend", "frontend", "e2e"],
    );
  }));

test("an API exposed from an audited notification filename still retains product contracts", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/notifications/__init__.py", "");
    put(
      "backend/notifications/delivery.py",
      "def deliver_email(pk):\n    return 'sent'\nclass NotificationView:\n    def post(self):\n        self.model.save()\n",
    );
    put(
      "backend/notifications/queue.py",
      "def enqueue(transaction):\n    from notifications.delivery import deliver_email\n    transaction.on_commit(lambda: deliver_email(1), robust=True)\n",
    );
    put(
      "backend/config/urls.py",
      "from notifications.delivery import NotificationView\nurlpatterns=[path('api/first/',NotificationView.as_view(),name='first')]\n",
    );
    const plan = planImpact(["backend/notifications/delivery.py"], { root });
    assert.deepEqual(
      plan.checks.map((c) => c.scope),
      ["documentation", "backend", "frontend", "e2e"],
    );
  }));

test("an audited internal queue retains its exception only with the robust ignored callback", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/notifications/__init__.py", "");
    put(
      "backend/notifications/delivery.py",
      "def deliver_email(pk):\n    return 'sent'\n",
    );
    put(
      "backend/tests/test_internal_queue.py",
      "from notifications.queue import mutate\ndef test_queue():\n    pass\n",
    );
    for (const [robust, expected] of [
      ["True", ["documentation", "backend"]],
      ["False", ["documentation", "backend", "frontend", "e2e"]],
    ]) {
      put(
        "backend/notifications/queue.py",
        "def mutate(model, transaction):\n    model.save()\n    from notifications.delivery import deliver_email\n    transaction.on_commit(lambda: deliver_email(1), robust=" +
          robust +
          ")\n",
      );
      const plan = planImpact(["backend/notifications/queue.py"], { root });
      assert.deepEqual(
        plan.checks.map((c) => c.scope),
        expected,
      );
    }
  }));
