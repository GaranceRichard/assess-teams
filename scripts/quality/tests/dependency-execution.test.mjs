import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { executeCheck } from "../impact-runner.mjs";
import { planImpact } from "../impact.mjs";
import { dependencyFixture } from "./dependency-fixtures.mjs";

test("selected backend files, transitive Vitest inputs and both browser builds reach existing commands", () =>
  dependencyFixture(({ root }) => {
    const plan = planImpact(["backend/feature/value.py"], { root });
    const calls = [];
    const env = { ASSESS_E2E_DB: resolve(root, "backend/.cache/e2e.sqlite3") };
    const invoke = (exe, args) => {
      calls.push(args);
      return 0;
    };
    for (const scope of [
      "backend-targeted",
      "frontend-targeted",
      "e2e-targeted",
    ])
      assert.equal(
        executeCheck(
          root,
          env,
          plan.checks.find((c) => c.scope === scope),
          invoke,
        ),
        0,
      );
    const pytest = calls.find((args) => args.includes("pytest"));
    assert.ok(pytest.some((arg) => arg.endsWith("test_value.py")));
    assert.ok(pytest.some((arg) => arg.endsWith("test_api.py")));
    assert.ok(!pytest.some((arg) => arg.endsWith("test_other.py")));
    const vitest = calls.find((args) => args.includes("related"));
    assert.ok(
      vitest.some((arg) => arg.replaceAll("\\", "/") === "src/firstApi.ts"),
    );
    assert.ok(!vitest.includes("--passWithNoTests"));
    assert.ok(vitest.includes("--no-passWithNoTests"));
    const browsers = calls.filter((args) => args.includes("test"));
    assert.equal(browsers.length, 2);
    assert.ok(browsers[0].includes("e2e/first.spec.ts"));
    assert.ok(browsers[1].includes("demo-e2e/first.spec.ts"));
    assert.ok(!browsers.flat().includes("e2e/second.spec.ts"));
    assert.ok(calls.some((args) => args.includes("vite.demo.config.ts")));
  }));

test("empty or failed targeted selections cannot produce a passing gate", () =>
  dependencyFixture(({ root }) => {
    const env = { ASSESS_E2E_DB: resolve(root, "backend/.cache/e2e.sqlite3") };
    const plan = planImpact(["frontend/src/Widget.tsx"], { root });
    const check = plan.checks.at(-1);
    let calls = 0;
    assert.equal(
      executeCheck(root, env, check, () => {
        calls++;
        return 9;
      }),
      9,
    );
    assert.equal(calls, 1);
    for (const scope of [
      "backend-targeted",
      "frontend-targeted",
      "e2e-targeted",
    ])
      assert.equal(
        executeCheck(root, env, { scope, tests: [] }, () => {
          throw Error("empty selection must not execute");
        }),
        1,
      );
  }));
