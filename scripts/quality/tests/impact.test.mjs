import assert from "node:assert/strict";
import test from "node:test";
import { quickScopes } from "../quick.mjs";
import { classify, fullScopes, planImpact } from "../impact.mjs";

const scopes = (paths) => planImpact(paths).checks.map(({ scope }) => scope);
for (const path of [
  "README.md",
  "AGENTS.md",
  "docs/backlog/source/07-pre-mep.md",
  "docs/architecture/backend-api.md",
]) {
  test(`pure prose ${path} launches no application tests`, () =>
    assert.deepEqual(scopes([path]), ["documentation"]));
}
for (const path of [
  "frontend/src/README.md",
  "docs/legal/redistribution.md",
  "docs/new-input.md",
  "unknown.txt",
  "backend/a/migrations/0001.py",
  "backend/config/x.py",
  "scripts/quality/impact.mjs",
  ".github/workflows/quality.yml",
  "frontend/package-lock.json",
]) {
  test(`unknown or critical ${path} fails closed`, () =>
    assert.deepEqual(scopes([path]), fullScopes));
}

test("type changes, deletions and critical code escalate independently of suffix", () => {
  for (const change of [
    { path: "docs/backlog/x.md", mode: "120000" },
    { path: "docs/backlog/x.md", mode: "160000" },
    { path: "frontend/src/helper.ts", status: "D" },
  ])
    assert.equal(planImpact([change]).exhaustive, true);
});

test("isolated backend tests have no frontend or E2E campaign", () => {
  const plan = planImpact(["backend/tests/test_health.py", "README.md"]);
  assert.deepEqual(plan.checks, [
    { scope: "documentation" },
    { scope: "backend-static" },
    { scope: "backend-targeted", tests: ["backend/tests/test_health.py"] },
  ]);
  assert.deepEqual(plan.skipped, ["frontend", "e2e"]);
  assert.deepEqual(scopes(["backend/notifications/errors.py"]), [
    "documentation",
    "backend",
  ]);
});

test("frontend dependency graph and known journeys select deterministic controls", () => {
  const plan = planImpact([
    "frontend/src/DashboardPage.tsx",
    "frontend/src/dateInputValue.ts",
  ]);
  assert.deepEqual(
    plan.checks.map(({ scope }) => scope),
    ["documentation", "frontend-static", "frontend-targeted", "e2e-targeted"],
  );
  assert.deepEqual(plan.checks.at(-1).tests, [
    "frontend/e2e/dashboard.spec.ts",
  ]);
  assert.deepEqual(scopes(["frontend/src/new-widget.tsx"]), [
    "documentation",
    "frontend-static",
    "frontend-targeted",
    "e2e",
  ]);
  assert.deepEqual(scopes(["frontend/src/dateInputValue.ts"]), [
    "documentation",
    "frontend-static",
    "frontend-targeted",
  ]);
});

test("mixed critical changes override a documentary selection; full is always exhaustive", () => {
  assert.deepEqual(scopes(["README.md", "scripts/x.mjs"]), fullScopes);
  assert.deepEqual(
    planImpact([], { exhaustive: true }).checks.map(({ scope }) => scope),
    fullScopes,
  );
  assert.equal(classify("frontend/src/example.md").kind, "full");
});

test("quick remains static and follows the same impact decisions", () => {
  assert.deepEqual(quickScopes(planImpact(["docs/backlog/entry.md"])), [
    "documentation",
  ]);
  assert.deepEqual(quickScopes(planImpact(["backend/tests/test_health.py"])), [
    "documentation",
    "backend-static",
  ]);
  assert.deepEqual(
    quickScopes(planImpact(["frontend/src/dateInputValue.ts"])),
    ["documentation", "frontend"],
  );
  assert.deepEqual(quickScopes(planImpact(["scripts/quality/impact.mjs"])), [
    "all",
  ]);
  assert.deepEqual(scopes(["frontend/e2e/dashboard.spec.ts"]), [
    "documentation",
    "frontend-static",
    "e2e-targeted",
  ]);
});

test("security introduced in an innocuous filename retains every affected application domain", () => {
  assert.deepEqual(
    scopes([
      { path: "backend/helper.py", patch: "permission_classes = [AllowAny]" },
    ]),
    ["documentation", "backend", "frontend", "e2e"],
  );
  assert.deepEqual(scopes(["frontend/src/auth.ts"]), [
    "documentation",
    "frontend",
    "e2e",
  ]);
});
