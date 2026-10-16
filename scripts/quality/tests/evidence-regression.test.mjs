import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { runValidation } from "../validate.mjs";
import { fingerprint } from "../impact-runner.mjs";
import { fixture, options } from "./validation-fixtures.mjs";

test("CU01: identical successful inputs survive a seven-day session break", () =>
  fixture((root) => {
    const calls = [];
    const input = options(root, calls, { scopes: ["backend"] });
    assert.equal(
      runValidation({ ...input, now: () => Date.now() - 7 * 86400000 }),
      0,
    );
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["backend"]);
    assert.equal(runValidation({ ...input, fresh: true }), 0);
    assert.deepEqual(calls, ["backend", "backend"]);
  }));

test("CU02/03/04: code, installed dependencies, runtime, policy and selection invalidate", () =>
  fixture((root) => {
    mkdirSync(join(root, "backend"));
    mkdirSync(join(root, "scripts/quality"), { recursive: true });
    const files = ["backend/code.py", "scripts/quality/impact.mjs"];
    for (const file of files) writeFileSync(join(root, file), "before");
    const inputs = {
      files,
      context: { python: "3.12", packages: "django==5.2" },
    };
    const check = { scope: "backend" };
    const key = () => fingerprint(root, {}, check, inputs);
    const calls = [];
    const input = options(root, calls, { scopes: ["backend"], key });
    assert.equal(runValidation(input), 0);
    for (const file of files) {
      writeFileSync(join(root, file), "changed");
      assert.equal(runValidation(input), 0);
    }
    inputs.context.python = "3.13";
    assert.equal(runValidation(input), 0);
    inputs.context.packages = "django==5.3";
    assert.equal(runValidation(input), 0);
    check.tests = ["backend/tests/test_permissions.py"];
    assert.equal(runValidation(input), 0);
    assert.equal(calls.length, 6);
  }));

test("CU05: incomplete, failed, incoherent or foreign evidence cannot authorize a required gate", () =>
  fixture((root) => {
    const path = join(root, ".cache/quality/backend.json");
    const input = options(root, [], { scopes: ["backend"] });
    assert.equal(runValidation(input), 0);
    const valid = JSON.parse(readFileSync(path));
    for (const invalid of [
      { ...valid, success: false },
      { ...valid, finished: null },
      { ...valid, version: -1 },
      { ...valid, provenance: "github-actions" },
      { ...valid, scope: "frontend" },
      { ...valid, started: valid.finished + 1 },
      { ...valid, key: null },
      {},
      null,
    ]) {
      writeFileSync(path, JSON.stringify(invalid));
      assert.equal(runValidation({ ...input, run: () => 7 }), 7);
      assert.equal(existsSync(path), false);
    }
  }));

test("CU11: changing reused inputs during verification removes the old proof", () =>
  fixture((root) => {
    const input = options(root, [], {
      scopes: ["backend"],
      key: () => "before",
    });
    assert.equal(runValidation(input), 0);
    let reads = 0;
    assert.equal(
      runValidation({
        ...input,
        key: () => (++reads === 1 ? "before" : "after"),
      }),
      1,
    );
    assert.equal(existsSync(join(root, ".cache/quality/backend.json")), false);
  }));

test("unbounded runtime forces execution every time and never stores evidence", () =>
  fixture((root) => {
    const calls = [];
    const input = options(root, calls, {
      scopes: ["backend"],
      key: () => null,
    });
    assert.equal(runValidation(input), 0);
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["backend", "backend"]);
    assert.equal(existsSync(join(root, ".cache/quality/backend.json")), false);
  }));

test("CU11: a real source edit during execution cannot be recorded as success", () =>
  fixture((root) => {
    const path = "code.py";
    writeFileSync(join(root, path), "before");
    const input = options(root, [], {
      scopes: ["backend"],
      key: () =>
        fingerprint(
          root,
          {},
          { scope: "backend" },
          { files: [path], context: {} },
        ),
      run: () => {
        writeFileSync(join(root, path), "after");
        return 0;
      },
    });
    assert.equal(runValidation(input), 1);
    assert.equal(existsSync(join(root, ".cache/quality/backend.json")), false);
  }));
