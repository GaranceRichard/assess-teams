import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { planImpact, fullScopes } from "../impact.mjs";
import { fingerprint, executeCheck } from "../impact-runner.mjs";
import { installedKey } from "../runtime-inputs.mjs";
import { fixture } from "./validation-fixtures.mjs";

const scopes = (changes) =>
  planImpact(changes).checks.map(({ scope }) => scope);

test("isolated CSS and E2E selectors never require the backend campaign", () => {
  for (const path of [
    "frontend/src/transitions.css",
    "frontend/e2e/transitions.spec.ts",
    "frontend/demo-e2e/date-presentation.spec.ts",
  ]) {
    const selected = scopes([path]);
    assert.ok(!selected.includes("backend"), path);
    assert.ok(
      selected.some((scope) => scope.startsWith("e2e")),
      path,
    );
  }
});

test("Playwright and browser helpers retain policy tests, statics and all browser journeys", () => {
  for (const path of [
    "frontend/playwright.config.ts",
    "frontend/playwright.demo.config.ts",
    "frontend/e2e/reports.ts",
    "frontend/e2e/motion-evidence.ts",
  ])
    assert.deepEqual(scopes([path]), [
      "repository",
      "frontend-static",
      "frontend-targeted",
      "e2e",
    ]);
  assert.deepEqual(
    planImpact(["frontend/playwright.config.ts"]).checks.find(
      ({ scope }) => scope === "frontend-targeted",
    ).tests,
    ["frontend/src/browserGates.test.ts"],
  );
});

test("audited non-executable evidence is documentary; distributed and unknown assets fail closed", () => {
  const path = "docs/quality/ux-transitions/question-milieu.png";
  assert.deepEqual(scopes([path]), ["documentation"]);
  assert.deepEqual(scopes([{ path, status: "D" }]), ["documentation"]);
  for (const change of [
    { path, mode: "100755" },
    { path, mode: "120000" },
    "docs/quality/arbitrary.png",
    "docs/quality/ux-transitions/runtime.svg",
    "frontend/public/question-milieu.png",
    "docs/legal/proof.png",
  ])
    assert.deepEqual(scopes([change]), fullScopes);
});

test("evidence changes preserve application proofs; policy, resource and runtime changes invalidate", () =>
  fixture((root) => {
    const files = [
      "docs/quality/ux-transitions/question-milieu.png",
      "frontend/public/image.png",
      "scripts/quality/impact.mjs",
    ];
    for (const path of files) {
      mkdirSync(join(root, path, ".."), { recursive: true });
      writeFileSync(join(root, path), "before");
    }
    const inputs = { files, context: { platform: "one" } };
    const key = (scope) => fingerprint(root, {}, { scope }, inputs);
    const before = Object.fromEntries(
      ["backend", "frontend", "e2e"].map((scope) => [scope, key(scope)]),
    );
    writeFileSync(join(root, files[0]), "new screenshot");
    for (const scope of Object.keys(before))
      assert.equal(key(scope), before[scope]);
    writeFileSync(join(root, files[1]), "new runtime image");
    assert.notEqual(key("frontend"), before.frontend);
    assert.notEqual(key("e2e"), before.e2e);
    writeFileSync(join(root, files[2]), "new policy");
    for (const scope of Object.keys(before))
      assert.notEqual(key(scope), before[scope]);
    const backend = key("backend");
    inputs.context.platform = "incompatible";
    assert.notEqual(key("backend"), backend);
  }));

test("only the regular Chromium diagnostic at its binary root is ignored", () =>
  fixture((root) => {
    const key = () => installedKey(root, { browser: true });
    writeFileSync(join(root, "chrome.exe"), "binary");
    const before = key();
    writeFileSync(join(root, "debug.log"), "GPU diagnostics");
    assert.equal(key(), before);
    const ordinary = installedKey(root);
    writeFileSync(join(root, "debug.log"), "more diagnostics");
    assert.equal(key(), before);
    assert.notEqual(installedKey(root), ordinary);
    writeFileSync(join(root, "chrome.exe"), "modified binary");
    assert.notEqual(key(), before);
    const binary = key();
    writeFileSync(join(root, "library.dll"), "loaded library");
    assert.notEqual(key(), binary);
    const library = key();
    mkdirSync(join(root, "resources"));
    writeFileSync(join(root, "resources/debug.log"), "not audited");
    assert.notEqual(key(), library);
  }));

test("demo selector runs the demo build and selected spec, without backend setup", () =>
  fixture((root) => {
    const check = planImpact([
      "frontend/demo-e2e/date-presentation.spec.ts",
    ]).checks.at(-1);
    const calls = [];
    assert.equal(
      executeCheck(root, {}, check, (exe, args) => {
        calls.push(args);
        return 0;
      }),
      0,
    );
    assert.equal(calls.length, 3);
    assert.ok(calls.at(-1).includes("playwright.demo.config.ts"));
    assert.ok(calls.at(-1).includes("demo-e2e/date-presentation.spec.ts"));
  }));

test("demo selection cannot convert a build/browser failure or an empty selection into success", () =>
  fixture((root) => {
    const check = planImpact([
      "frontend/demo-e2e/date-presentation.spec.ts",
    ]).checks.at(-1);
    for (const failedStep of [1, 2, 3]) {
      let calls = 0;
      assert.equal(
        executeCheck(root, {}, check, () => (++calls === failedStep ? 9 : 0)),
        9,
      );
      assert.equal(calls, failedStep);
    }
    assert.equal(
      executeCheck(root, {}, { scope: "e2e-targeted", tests: [] }, () => {
        throw Error("an empty selection must not execute tools");
      }),
      1,
    );
  }));
