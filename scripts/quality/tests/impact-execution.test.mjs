import assert from "node:assert/strict";
import test from "node:test";
import { planImpact } from "../impact.mjs";
import { executeCheck } from "../impact-runner.mjs";
import { validatePlan } from "../selective.mjs";
import { checkResults } from "../selective-ci.mjs";
import { conclusion } from "../wait-ci.mjs";
import { verifyQualification } from "../qualification.mjs";
import { fixture, boundedEnvironment } from "./validation-fixtures.mjs";

test("required failures stop execution; selected evidence is reused, then invalidated", () =>
  boundedEnvironment(() =>
    fixture((root) => {
      const range = { base: "base", candidate: "candidate" };
      const plan = planImpact(["backend/tests/test_health.py"]);
      const calls = [];
      let revision = "one";
      const options = {
        key: (scope) => revision + scope,
        run: (scope) => {
          calls.push(scope);
          return 0;
        },
      };
      assert.equal(validatePlan(root, range, plan, options), 0);
      calls.length = 0;
      assert.equal(validatePlan(root, range, plan, options), 0);
      assert.deepEqual(calls, ["documentation"]);
      revision = "two";
      assert.equal(
        validatePlan(root, range, plan, { ...options, run: () => 9 }),
        9,
      );
      assert.throws(
        () => validatePlan(root, range, plan, { ...options, only: "frontend" }),
        /non requis/,
      );
    }),
  ));

test("targeted execution uses real test commands and propagates failure without unrelated tools", () =>
  fixture((root) => {
    const calls = [];
    const invoke = (exe, args) => {
      calls.push([exe, ...args]);
      return 7;
    };
    assert.equal(
      executeCheck(
        root,
        {},
        { scope: "backend-targeted", tests: ["backend/tests/test_health.py"] },
        invoke,
      ),
      7,
    );
    assert.ok(calls[0].includes("--no-cov"));
    calls.length = 0;
    assert.equal(
      executeCheck(
        root,
        {},
        {
          scope: "frontend-targeted",
          related: ["frontend/src/dateInputValue.ts"],
        },
        invoke,
      ),
      7,
    );
    assert.ok(calls[0].includes("related"));
    assert.ok(!calls[0].includes("--passWithNoTests"));
  }));

test("CI permits only justified skips and refuses every required failed or missing result", () => {
  const plan = planImpact(["README.md"]);
  const jobs = Object.fromEntries(
    ["plan", "repository", "backend", "frontend", "e2e", "full"].map((job) => [
      job,
      { result: ["plan", "repository"].includes(job) ? "success" : "skipped" },
    ]),
  );
  assert.deepEqual(checkResults(plan, jobs), []);
  for (const state of ["failure", "skipped", "cancelled", undefined]) {
    assert.ok(
      checkResults(plan, { ...jobs, repository: { result: state } }).includes(
        "repository",
      ),
    );
  }
  assert.ok(checkResults(planImpact(["scripts/x.mjs"]), jobs).includes("full"));
  assert.deepEqual(
    checkResults(plan, { ...jobs, plan: { result: "failure" } }),
    ["plan"],
  );
});

test("delivery status must belong to the exact pushed SHA and a successful push run", () => {
  const run = {
    headSha: "one",
    event: "push",
    status: "completed",
    conclusion: "success",
  };
  assert.equal(conclusion([run], "one"), "success");
  assert.equal(conclusion([run], "two"), "pending");
  for (const result of ["failure", "cancelled", "skipped"])
    assert.equal(
      conclusion([{ ...run, conclusion: result }], "one"),
      "failure",
    );
});

test("MESS promotion refuses another SHA, partial/local proofs, failed or unrelated workflows", () => {
  const sha = "a".repeat(40);
  const run = {
    id: 42,
    status: "completed",
    conclusion: "success",
    path: ".github/workflows/exhaustive.yml",
    event: "schedule",
  };
  const proof = {
    sha,
    success: true,
    exhaustive: true,
    runId: "42",
    provenance: "github-actions",
  };
  assert.equal(verifyQualification(proof, run, sha, 42), true);
  for (const invalid of [
    { ...proof, sha: "b".repeat(40) },
    { ...proof, exhaustive: false },
    { ...proof, success: false },
    { ...proof, provenance: "local" },
    { ...proof, runId: 43 },
  ])
    assert.throws(
      () => verifyQualification(invalid, run, sha, 42),
      /Promotion refusee/,
    );
  for (const invalid of [
    { ...run, conclusion: "failure" },
    { ...run, status: "in_progress" },
    { ...run, path: ".github/workflows/quality.yml" },
    { ...run, event: "push" },
  ])
    assert.throws(
      () => verifyQualification(proof, invalid, sha, 42),
      /Promotion refusee/,
    );
});

test("mixed frontend source/test changes execute a single union of affected tests", () =>
  fixture((root) => {
    const calls = [];
    const status = executeCheck(
      root,
      {},
      {
        scope: "frontend-targeted",
        related: ["frontend/src/dateInputValue.ts"],
        tests: ["frontend/src/DateInput.test.tsx"],
      },
      (exe, args) => {
        calls.push(args);
        return 0;
      },
    );
    assert.equal(status, 0);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].includes("related"));
    assert.equal(calls[0].length, 5);
  }));
