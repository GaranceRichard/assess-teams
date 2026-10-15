import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { contentKey, reusable } from "../validation-inputs.mjs";
import { runValidation } from "../validate.mjs";

import { fixture, options } from "./validation-fixtures.mjs";

test("complete success is reused; repository controls always rerun", () =>
  fixture((root) => {
    const calls = [];
    assert.equal(runValidation(options(root, calls)), 0);
    assert.equal(runValidation(options(root, calls)), 0);
    assert.deepEqual(calls, [
      "repository",
      "backend",
      "frontend",
      "e2e",
      "repository",
    ]);
    const metrics = readFileSync(
      join(root, ".cache/quality/metrics.jsonl"),
      "utf8",
    )
      .trim()
      .split("\n")
      .map(JSON.parse);
    assert.equal(metrics.filter((metric) => metric.reused).length, 3);
  }));

test("fresh CI runs every scope without consulting local fingerprints", () =>
  fixture((root) => {
    const calls = [];
    const input = options(root, calls, {
      fresh: true,
      key: () => {
        throw Error("unused");
      },
    });
    assert.equal(runValidation(input), 0);
    assert.equal(runValidation(input), 0);
    assert.equal(calls.length, 8);
  }));

test("failures and corrupt evidence never authorize reuse", () =>
  fixture((root) => {
    const calls = [];
    const input = options(root, calls, { scopes: ["backend"] });
    assert.equal(runValidation({ ...input, run: () => 7 }), 7);
    assert.equal(runValidation(input), 0);
    writeFileSync(join(root, ".cache/quality/backend.json"), "broken");
    assert.equal(runValidation(input), 0);
    assert.equal(calls.length, 2);
    assert.equal(
      runValidation({ ...input, key: () => "new", run: () => 7 }),
      7,
    );
    assert.equal(runValidation(input), 0);
    assert.equal(calls.length, 3);
  }));

test("inputs changed during validation invalidate success", () =>
  fixture((root) => {
    let key = "before";
    const input = options(root, [], { scopes: ["backend"], key: () => key });
    assert.equal(
      runValidation({
        ...input,
        run: () => {
          key = "after";
          return 0;
        },
      }),
      1,
    );
    const calls = [];
    assert.equal(
      runValidation({
        ...input,
        run: () => {
          calls.push(1);
          return 0;
        },
      }),
      0,
    );
    assert.equal(calls.length, 1);
  }));

test("age, future timestamps and unsuccessful evidence are rejected", () => {
  const proof = { key: "key", success: true, finished: 100 };
  assert.equal(reusable(proof, "key", 101), true);
  assert.equal(reusable(proof, "different", 101), false);
  assert.equal(reusable(proof, "key", 99), false);
  assert.equal(reusable(proof, "key", 100 + 8 * 3600000), false);
  assert.equal(reusable({ ...proof, success: false }, "key", 101), false);
});

test("content and runtime determine evidence, not commit identity or document text", () =>
  fixture((root) => {
    mkdirSync(join(root, "docs/quality"), { recursive: true });
    writeFileSync(join(root, "app.py"), "original");
    writeFileSync(join(root, "docs/quality/guide.md"), "before");
    const files = ["app.py", "docs/quality/guide.md"];
    const before = contentKey(root, files, { python: "3.12" });
    writeFileSync(join(root, "docs/quality/guide.md"), "after");
    assert.equal(contentKey(root, files, { python: "3.12" }), before);
    assert.notEqual(contentKey(root, files, { python: "3.13" }), before);
    writeFileSync(join(root, "app.py"), "modified");
    assert.notEqual(contentKey(root, files, { python: "3.12" }), before);
    rmSync(join(root, "app.py"));
    assert.notEqual(contentKey(root, files, { python: "3.12" }), before);
    writeFileSync(join(root, "new.txt"), "new");
    assert.notEqual(
      contentKey(root, [...files, "new.txt"], { python: "3.12" }),
      before,
    );
  }));

test("same worktree rejects overlapping gates", () =>
  fixture((root) => {
    mkdirSync(join(root, ".cache/quality"), { recursive: true });
    writeFileSync(join(root, ".cache/quality/running.lock"), "another-process");
    assert.throws(() => runValidation(options(root, [])), /EEXIST/);
  }));

test("a later control cannot invalidate an earlier successful proof unnoticed", () =>
  fixture((root) => {
    let backendRevision = "before";
    const input = options(root, [], {
      scopes: ["backend", "frontend"],
      key: (scope) => (scope === "backend" ? backendRevision : "frontend"),
      run: (scope) => {
        if (scope === "frontend") backendRevision = "after";
        return 0;
      },
    });
    assert.equal(runValidation(input), 1);
    assert.throws(() =>
      readFileSync(join(root, ".cache/quality/backend.json")),
    );
  }));
