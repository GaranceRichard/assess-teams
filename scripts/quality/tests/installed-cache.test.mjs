import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { installedKey } from "../runtime-inputs.mjs";
import { runValidation } from "../validate.mjs";
import { fixture, options } from "./validation-fixtures.mjs";

test("TypeScript build metadata generated during validation does not invalidate stable sources", () =>
  fixture((root) => {
    const runtime = join(root, "node_modules");
    mkdirSync(runtime);
    writeFileSync(join(runtime, "package.json"), '{"version":"1"}');
    const calls = [];
    const input = options(root, calls, {
      scopes: ["frontend"],
      key: () => installedKey(runtime),
      run: () => {
        calls.push("compile");
        mkdirSync(join(runtime, ".tmp"), { recursive: true });
        writeFileSync(
          join(runtime, ".tmp/tsconfig.app.tsbuildinfo"),
          "generated app",
        );
        writeFileSync(
          join(runtime, ".tmp/tsconfig.node.tsbuildinfo"),
          "generated tools",
        );
        return 0;
      },
    });
    assert.equal(runValidation(input), 0);
    writeFileSync(
      join(runtime, ".tmp/tsconfig.app.tsbuildinfo"),
      "regenerated",
    );
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["compile"]);
    const key = installedKey(runtime);
    writeFileSync(
      join(runtime, ".tmp/unknown.js"),
      "potential runtime dependency",
    );
    assert.notEqual(installedKey(runtime), key);
    assert.equal(runValidation(input), 1);
    assert.deepEqual(calls, ["compile", "compile"]);
    assert.equal(existsSync(join(root, ".cache/quality/frontend.json")), false);
  }));

test("Vite cache exclusions apply only to direct npm roots; unknown nested data remains covered", () =>
  fixture((root) => {
    const runtime = join(root, "node_modules");
    mkdirSync(runtime);
    const before = installedKey(runtime);
    mkdirSync(join(runtime, ".vite"));
    writeFileSync(join(runtime, ".vite/metadata.json"), "generated");
    assert.equal(installedKey(runtime), before);
    mkdirSync(join(runtime, "package/.tmp"), { recursive: true });
    writeFileSync(
      join(runtime, "package/.tmp/tsconfig.app.tsbuildinfo"),
      "unmapped",
    );
    assert.notEqual(installedKey(runtime), before);
    const nested = installedKey(runtime);
    writeFileSync(
      join(runtime, "package/.tmp/tsconfig.app.tsbuildinfo"),
      "changed",
    );
    assert.notEqual(installedKey(runtime), nested);
  }));
