import assert from "node:assert/strict";
import test from "node:test";
import { planImpact, fullScopes } from "../impact.mjs";
import { dependencyContext } from "../dependency-context.mjs";
import { checkResults } from "../selective-ci.mjs";
import { dependencyFixture } from "./dependency-fixtures.mjs";

test("mixed components unite their tests and journeys; security and exhaustive override reduction", () =>
  dependencyFixture(({ root }) => {
    const paths = ["frontend/src/Widget.tsx", "frontend/src/SecondPage.tsx"];
    const plan = planImpact(paths, { root });
    assert.deepEqual(plan.checks.at(-1).tests, [
      "frontend/e2e/first.spec.ts",
      "frontend/e2e/second.spec.ts",
    ]);
    assert.deepEqual(plan.checks.at(-1).demoTests, [
      "frontend/demo-e2e/first.spec.ts",
      "frontend/demo-e2e/second.spec.ts",
    ]);
    for (const change of [
      "backend/config/settings.py",
      { path: paths[0], status: "D" },
      { path: paths[0], mode: "120000" },
      "unknown.data",
    ])
      assert.deepEqual(
        planImpact([...paths, change], { root }).checks.map((c) => c.scope),
        fullScopes,
      );
    assert.deepEqual(
      planImpact(paths, { root, exhaustive: true }).checks.map((c) => c.scope),
      fullScopes,
    );
    assert.deepEqual(
      planImpact(
        [
          {
            path: paths[0],
            patch: "+authorization = secret",
          },
        ],
        { root },
      ).checks.map((c) => c.scope),
      ["documentation", "frontend", "e2e"],
    );
  }));

test("the guarded SMTP callback removes UI impact, never backend persistence/worker integration", () =>
  dependencyFixture(({ root, put }) => {
    put("backend/notifications/__init__.py", "");
    put(
      "backend/notifications/transport.py",
      "def send_email():\n    return 'sent'\n",
    );
    put(
      "backend/notifications/delivery.py",
      "from notifications.transport import send_email\ndef deliver_email(pk):\n    return send_email()\n",
    );
    const queue = (robust) => `
def enqueue_email(transaction):
    from notifications.delivery import deliver_email
    transaction.on_commit(lambda: deliver_email(1), robust=${robust})
`;
    put("backend/notifications/queue.py", queue("True"));
    put(
      "backend/feature/api.py",
      "from notifications.queue import enqueue_email\nclass FeatureView:\n    pass\n",
    );
    put(
      "backend/tests/test_smtp.py",
      "from notifications.transport import send_email\ndef test_smtp():\n    send_email()\n",
    );
    put(
      "backend/tests/test_worker.py",
      "from notifications.delivery import deliver_email\ndef test_worker():\n    deliver_email(1)\n",
    );
    const path = "backend/notifications/transport.py";
    const plan = planImpact([path], { root });
    assert.deepEqual(
      plan.checks.map((c) => c.scope),
      ["documentation", "backend-static", "backend-targeted"],
    );
    for (const name of ["test_smtp.py", "test_worker.py", "test_api.py"])
      assert.ok(plan.checks.at(-1).tests.includes("backend/tests/" + name));
    for (const source of [
      queue("False"),
      queue("True") + "\n    return deliver_email(2)\n",
    ]) {
      put("backend/notifications/queue.py", source);
      assert.equal(dependencyContext(root).backend().detached.length, 0);
      assert.ok(
        planImpact([path], { root }).checks.some((c) =>
          c.scope.startsWith("frontend"),
        ),
      );
    }
  }));

test("real Radar keeps all Results integrations while excluding backend and unrelated evaluation journeys", () => {
  for (const path of [
    "frontend/src/ResultsRadar.tsx",
    "frontend/src/resultRadarConfig.ts",
  ]) {
    const plan = planImpact([path]);
    assert.equal(plan.exhaustive, false, path);
    assert.ok(plan.skipped.includes("backend"));
    const e2e = plan.checks.at(-1);
    assert.equal(e2e.scope, "e2e-targeted");
    for (const name of [
      "results",
      "results-longitudinal",
      "results-layout",
      "results-radar-presentation",
      "viewer-results",
    ])
      assert.ok(e2e.tests.includes(`frontend/e2e/${name}.spec.ts`), name);
    assert.ok(
      !e2e.tests.includes("frontend/e2e/evaluation-run-ordering.spec.ts"),
    );
    assert.ok(
      e2e.demoTests.includes(
        "frontend/demo-e2e/results-history-layout.spec.ts",
      ),
    );
  }
});

test("development and CI share the same plan and reject any missing selected domain", () =>
  dependencyFixture(({ root }) => {
    const paths = ["backend/feature/value.py", "frontend/src/Widget.tsx"];
    const local = planImpact(paths, { root });
    const ci = planImpact(
      paths.map((path) => ({ path, status: "M", mode: "100644", patch: "" })),
      { root },
    );
    assert.deepEqual(local, ci);
    const jobs = Object.fromEntries(
      ["plan", "repository", "backend", "frontend", "e2e", "full"].map(
        (name) => [name, { result: name === "full" ? "skipped" : "success" }],
      ),
    );
    assert.deepEqual(checkResults(ci, jobs), []);
    for (const name of ["backend", "frontend", "e2e"])
      assert.ok(
        checkResults(ci, { ...jobs, [name]: { result: "skipped" } }).includes(
          name,
        ),
      );
  }));
