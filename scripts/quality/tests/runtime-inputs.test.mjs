import { planImpact } from "../impact.mjs";
import { validatePlan } from "../selective.mjs";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, utimesSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  installedKey,
  requiresFreshRuntime,
  unboundedPython,
} from "../runtime-inputs.mjs";
import { fingerprint } from "../impact-runner.mjs";
import { fixture, boundedEnvironment } from "./validation-fixtures.mjs";

test("CU03: installed bytes invalidate even when version and file timestamps stay identical", () =>
  fixture((root) => {
    writeFileSync(join(root, "package.json"), '{"version":"1.0.0"}');
    writeFileSync(join(root, "code.js"), "before");
    const before = installedKey(root);
    utimesSync(join(root, "code.js"), 0, 0);
    assert.equal(installedKey(root), before);
    writeFileSync(join(root, "code.js"), "after!");
    utimesSync(join(root, "code.js"), 0, 0);
    assert.notEqual(installedKey(root), before);
    const after = installedKey(root);
    writeFileSync(join(root, "added.js"), "dependency");
    assert.notEqual(installedKey(root), after);
    rmSync(join(root, "added.js"));
    assert.equal(installedKey(root), after);
  }));

test("generated tool caches do not invalidate; arbitrary caches and sourceless bytecode do", () =>
  fixture((root) => {
    writeFileSync(join(root, "code.py"), "before");
    const before = installedKey(root);
    mkdirSync(join(root, "__pycache__"));
    writeFileSync(join(root, "__pycache__/code.pyc"), "generated");
    assert.equal(installedKey(root), before);
    mkdirSync(join(root, ".cache"));
    writeFileSync(join(root, ".cache/runtime.js"), "not proven generated");
    assert.notEqual(installedKey(root), before);
    const after = installedKey(root);
    writeFileSync(join(root, "standalone.pyc"), "executable");
    assert.notEqual(installedKey(root), after);
    assert.throws(() => installedKey(join(root, "missing")));
  }));

test("external code loaders force fresh validation; ordinary settings remain fingerprintable", () => {
  for (const name of [
    "NODE_OPTIONS",
    "NODE_PATH",
    "PYTHONPATH",
    "PYTHONHOME",
    "LD_PRELOAD",
  ])
    assert.equal(requiresFreshRuntime({ [name]: "external" }), true);
  assert.equal(requiresFreshRuntime({ TZ: "UTC", NODE_OPTIONS: "" }), false);
});

test("CU04: policy/config changes invalidate every applicable domain, E2E covers both application trees", () =>
  fixture((root) => {
    for (const directory of ["backend", "frontend", "scripts/quality"])
      mkdirSync(join(root, directory), { recursive: true });
    const files = [
      "backend/code.py",
      "frontend/code.ts",
      "scripts/quality/impact.mjs",
    ];
    for (const file of files) writeFileSync(join(root, file), "before");
    const inputs = { files, context: {} };
    const key = (scope) => fingerprint(root, {}, { scope }, inputs);
    const before = Object.fromEntries(
      ["backend", "frontend", "e2e"].map((scope) => [scope, key(scope)]),
    );
    writeFileSync(join(root, files[2]), "new policy");
    for (const scope of Object.keys(before))
      assert.notEqual(key(scope), before[scope]);
    const e2e = key("e2e");
    writeFileSync(join(root, files[0]), "backend changed");
    assert.notEqual(key("e2e"), e2e);
    const updated = key("e2e");
    writeFileSync(join(root, files[1]), "frontend changed");
    assert.notEqual(key("e2e"), updated);
  }));

test("unbounded installed Python inputs cannot produce a reusable fingerprint", () =>
  fixture((root) => {
    assert.equal(
      fingerprint(
        root,
        {},
        { scope: "backend" },
        { files: [], context: { unbounded: true } },
      ),
      null,
    );
  }));

test("audited wheel loaders are bounded; editable packages or unknown .pth require fresh validation", () =>
  fixture((root) => {
    writeFileSync(join(root, "a1_coverage.pth"), "coverage startup");
    writeFileSync(join(root, "pytest-cov.pth"), "pytest-cov startup");
    assert.equal(unboundedPython([root], "coverage==7"), false);
    assert.equal(unboundedPython([root], "-e /external/source"), true);
    writeFileSync(join(root, "custom.pth"), "/external/source");
    assert.equal(unboundedPython([root], "coverage==7"), true);
    assert.equal(
      requiresFreshRuntime({ COVERAGE_PROCESS_START: "/external/config" }),
      true,
    );
  }));

test("external runtime loaders force fresh selected checks and cannot reuse local evidence", () =>
  boundedEnvironment(() =>
    fixture((root) => {
      process.env.NODE_PATH = "/unbounded/external/modules";
      const plan = planImpact(["backend/tests/test_health.py"]);
      const calls = [];
      const options = {
        key: () => {
          throw Error("unbounded inputs cannot use a cached fingerprint");
        },
        run: (scope) => {
          calls.push(scope);
          return 0;
        },
      };
      const range = { base: "base", candidate: "candidate" };
      assert.equal(validatePlan(root, range, plan, options), 0);
      assert.equal(validatePlan(root, range, plan, options), 0);
      assert.deepEqual(calls, [
        "documentation",
        "backend-static",
        "backend-targeted",
        "documentation",
        "backend-static",
        "backend-targeted",
      ]);
    }),
  ));
