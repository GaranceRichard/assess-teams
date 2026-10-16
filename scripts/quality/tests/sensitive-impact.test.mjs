import assert from "node:assert/strict";
import test from "node:test";
import { planImpact, fullScopes } from "../impact.mjs";
import { validatePlan } from "../selective.mjs";
import { checkResults } from "../selective-ci.mjs";
import { fixture } from "./validation-fixtures.mjs";

const scopes = (changes) =>
  planImpact(changes).checks.map(({ scope }) => scope);

test("CU06: database-only transactions, workers and sensitive tests require the entire backend", () => {
  for (const path of [
    "backend/config/sqlite_contention.py",
    "backend/tests/test_sqlite_contention_operational.py",
    "backend/tests/test_transaction_taking.py",
    "backend/notifications/management/commands/send_pending_notifications.py",
    "backend/assessments/application/taking.py",
  ]) {
    const plan = planImpact([{ path, patch: "+with transaction.atomic():" }]);
    assert.deepEqual(
      plan.checks,
      [{ scope: "documentation" }, { scope: "backend" }],
      path,
    );
    assert.match(plan.classifications[0].reason, /transaction|SQLite|worker/i);
  }
});

test("CU07: technical API permissions run full security coverage; product contracts add UI and E2E", () => {
  assert.deepEqual(scopes(["backend/identities/adapters/api/permissions.py"]), [
    "documentation",
    "backend",
  ]);
  for (const path of [
    "backend/identities/adapters/api/admin_permissions.py",
    "backend/identities/adapters/api/session_views.py",
    "backend/assessments/domain/permissions.py",
  ])
    assert.deepEqual(scopes([path]), [
      "documentation",
      "backend",
      "frontend",
      "e2e",
    ]);
  assert.deepEqual(scopes(["backend/tests/test_managed_user_permissions.py"]), [
    "documentation",
    "backend",
  ]);
});

test("CU08: unknown, configuration, publication and dependency changes remain conservative", () => {
  for (const path of [
    "backend/config/settings.py",
    "scripts/quality/impact.mjs",
    "package-lock.json",
    "unknown.txt",
  ])
    assert.deepEqual(scopes([path]), fullScopes);
  assert.deepEqual(
    scopes([{ path: "backend/config/sqlite_contention.py", status: "D" }]),
    fullScopes,
  );
  assert.deepEqual(
    scopes([{ path: "backend/config/sqlite_contention.py", mode: "120000" }]),
    fullScopes,
  );
});

test("CU09: backlog pre-push plan runs only fresh repository documentation controls", () =>
  fixture((root) => {
    const calls = [];
    assert.equal(
      validatePlan(
        root,
        { base: "base", candidate: "candidate" },
        planImpact(["docs/backlog/source/07-pre-mep.md"]),
        {
          key: () => {
            throw Error("no application fingerprints");
          },
          run: (scope) => {
            calls.push(scope);
            return 0;
          },
        },
      ),
      0,
    );
    assert.deepEqual(calls, ["documentation"]);
  }));

test("CU10/12: exhaustive ignores selection, local/CI require identical domains and reject unjustified skips", () => {
  for (const paths of [
    ["docs/backlog/source/07-pre-mep.md"],
    ["backend/config/sqlite_contention.py"],
    ["backend/identities/adapters/api/admin_permissions.py"],
    ["frontend/src/DashboardPage.tsx"],
    ["scripts/quality/impact.mjs"],
  ]) {
    assert.deepEqual(
      planImpact(paths, { exhaustive: true }).checks.map(({ scope }) => scope),
      fullScopes,
    );
    const local = planImpact(paths);
    const ci = planImpact(
      paths.map((path) => ({ path, status: "M", mode: "100644", patch: "" })),
    );
    assert.deepEqual(ci.checks, local.checks);
    const required = local.exhaustive
      ? ["full"]
      : [
          "repository",
          ...["backend", "frontend", "e2e"].filter((domain) =>
            local.checks.some(({ scope }) => scope.startsWith(domain)),
          ),
        ];
    const jobs = Object.fromEntries(
      ["plan", "full", "repository", "backend", "frontend", "e2e"].map(
        (name) => [
          name,
          {
            result:
              name === "plan" || required.includes(name)
                ? "success"
                : "skipped",
          },
        ],
      ),
    );
    assert.deepEqual(checkResults(ci, jobs), []);
    for (const name of required)
      assert.ok(
        checkResults(ci, { ...jobs, [name]: { result: "skipped" } }).includes(
          name,
        ),
      );
  }
});

test("SQLite API error contract and mixed UI/security changes retain frontend and E2E", () => {
  assert.deepEqual(
    scopes([
      {
        path: "backend/config/sqlite_contention.py",
        patch: '+CONTENTION_FAILED = "new error"',
      },
    ]),
    ["documentation", "backend", "frontend", "e2e"],
  );
  assert.deepEqual(
    scopes([
      "backend/identities/adapters/api/permissions.py",
      "frontend/src/auth.ts",
    ]),
    ["documentation", "backend", "frontend", "e2e"],
  );
  assert.deepEqual(scopes(["frontend/src/test/authHelpers.ts"]), fullScopes);
});

test("identity dependencies remain conservative while password-email workers stay backend-only", () => {
  assert.deepEqual(
    scopes(["backend/identities/application/managed_users.py"]),
    ["documentation", "backend", "frontend", "e2e"],
  );
  assert.deepEqual(
    scopes([
      "backend/identities/management/commands/send_password_reset_emails.py",
    ]),
    ["documentation", "backend"],
  );
});
