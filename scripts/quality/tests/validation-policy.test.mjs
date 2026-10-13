import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { requiresFull, selectedFiles } from "../targeted.mjs";
import { isolatedEnvironment, prepareE2E } from "../isolation.mjs";
import { main, runValidation } from "../validate.mjs";
import { fixture, options } from "./validation-fixtures.mjs";

test("sensitive and transverse changes escalate; isolated UI stays targeted", () => {
  for (const path of [
    "backend/identities/views.py",
    "backend/a/models.py",
    "backend/a/services.py",
    "backend/a/migrations/1.py",
    "frontend/src/api/contracts.ts",
    "scripts/check.ps1",
    ".github/workflows/quality.yml",
    "frontend/package-lock.json",
    "docs/legal/redistribution.md",
  ]) {
    assert.equal(requiresFull([path]), true, path);
  }
  assert.equal(
    requiresFull(["frontend/src/Button.tsx", "docs/guide.md"]),
    false,
  );
});

test("targeted selection rejects empty, missing, escaping and non-test paths", () =>
  fixture((root) => {
    mkdirSync(join(root, "backend/tests"), { recursive: true });
    writeFileSync(join(root, "backend/tests/test_sample.py"), "");
    assert.equal(
      selectedFiles(root, "backend", ["tests/test_sample.py"]).length,
      1,
    );
    for (const files of [
      [],
      ["../outside.py"],
      ["tests/missing.py"],
      ["manage.py"],
    ]) {
      assert.throws(() => selectedFiles(root, "backend", files));
    }
  }));

test("worktree ports are stable and explicit overrides persist; DB stays local", () =>
  fixture((root) => {
    const first = isolatedEnvironment(root, {});
    assert.deepEqual(isolatedEnvironment(root, {}), first);
    assert.equal(first.TMP, first.TEMP);
    assert.equal(first.TMPDIR, join(root, ".cache/tmp"));
    const other = isolatedEnvironment(join(root, "another"), {});
    assert.notEqual(first.ASSESS_E2E_DB, other.ASSESS_E2E_DB);
    assert.equal(
      new Set([
        first.ASSESS_E2E_BACKEND_PORT,
        first.ASSESS_E2E_FRONTEND_PORT,
        first.ASSESS_E2E_DEMO_PORT,
      ]).size,
      3,
    );
    assert.equal(
      isolatedEnvironment(root, { ASSESS_E2E_BACKEND_PORT: "8194" })
        .ASSESS_E2E_BACKEND_PORT,
      "8194",
    );
  }));

test("only disposable E2E databases are reset; explicit paths remain untouched", () =>
  fixture((root) => {
    const env = isolatedEnvironment(root, {});
    writeFileSync(env.ASSESS_E2E_DB, "old fixture data");
    prepareE2E(root, env, {});
    assert.throws(() => readFileSync(env.ASSESS_E2E_DB));
    writeFileSync(env.ASSESS_E2E_DB, "user database");
    prepareE2E(root, env, { ASSESS_E2E_DB: env.ASSESS_E2E_DB });
    assert.equal(readFileSync(env.ASSESS_E2E_DB, "utf8"), "user database");
    assert.throws(() =>
      prepareE2E(root, { ASSESS_E2E_DB: join(root, "outside") }, {}),
    );
  }));

test("an explicitly supplied E2E database forces fresh E2E tests", () =>
  fixture((root) => {
    const calls = [];
    const input = options(root, calls, { freshScopes: ["e2e"] });
    assert.equal(runValidation(input), 0);
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, [
      "repository",
      "backend",
      "frontend",
      "e2e",
      "repository",
      "e2e",
    ]);
  }));


test("CI shards have independent temporary resources and preserve their own SQLite path", () =>
  fixture((root) => {
    const first = isolatedEnvironment(root, { ASSESS_E2E_SHARD: "1/2", ASSESS_E2E_DB: join(root, "first.sqlite3") });
    const second = isolatedEnvironment(root, { ASSESS_E2E_SHARD: "2/2", ASSESS_E2E_DB: join(root, "second.sqlite3") });
    assert.notEqual(first.TMP, second.TMP);
    assert.notEqual(first.ASSESS_E2E_DB, second.ASSESS_E2E_DB);
  }));


test("partial E2E cannot become a full or cached local validation proof", () => {
  const saved = { shard: process.env.ASSESS_E2E_SHARD, ci: process.env.CI };
  try {
    process.env.ASSESS_E2E_SHARD = "1/2";
    delete process.env.CI;
    assert.throws(() => main(["-Scope", "e2e"]), /full local proof must be exhaustive/);
    process.env.CI = "true";
    assert.throws(() => main([]), /full local proof must be exhaustive/);
  } finally {
    for (const [name, value] of [["ASSESS_E2E_SHARD", saved.shard], ["CI", saved.ci]]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
