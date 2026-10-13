import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  contentKey,
  localInputFiles,
  runtimeEnvironment,
} from "../validation-inputs.mjs";
import { fixture } from "./validation-fixtures.mjs";

test("ignored root env files and installed npm manifests invalidate proofs", () =>
  fixture((root) => {
    for (const directory of [
      "backend",
      "frontend/node_modules",
      "node_modules",
    ])
      mkdirSync(join(root, directory), { recursive: true });
    writeFileSync(
      join(root, "node_modules/.package-lock.json"),
      "root-runtime",
    );
    const frontendLock = join(root, "frontend/node_modules/.package-lock.json");
    writeFileSync(frontendLock, "frontend-runtime");
    writeFileSync(join(root, ".env"), "before");
    const files = localInputFiles(root);
    assert.ok(files.includes(".env"));
    const key = contentKey(root, files, {});
    writeFileSync(join(root, ".env"), "after");
    assert.notEqual(contentKey(root, localInputFiles(root), {}), key);
    const updated = contentKey(root, localInputFiles(root), {});
    writeFileSync(frontendLock, "changed-runtime");
    assert.notEqual(contentKey(root, localInputFiles(root), {}), updated);
  }));

test("bundled legal documents and deletion of a literal sentinel invalidate proofs", () =>
  fixture((root) => {
    mkdirSync(join(root, "docs/legal"), { recursive: true });
    const legal = "docs/legal/redistribution.md";
    writeFileSync(join(root, legal), "terms before");
    writeFileSync(join(root, "data.txt"), "<deleted>");
    const files = [legal, "data.txt"];
    const before = contentKey(root, files, {});
    writeFileSync(join(root, legal), "terms after");
    assert.notEqual(contentKey(root, files, {}), before);
    const updated = contentKey(root, files, {});
    rmSync(join(root, "data.txt"));
    assert.notEqual(contentKey(root, files, {}), updated);
  }));

test("npm configuration affects proof identity; lifecycle metadata does not", () =>
  fixture((root) => {
    const before = {
      npm_config_script_shell: "shell-before",
      NODE_OPTIONS: "--trace-warnings",
    };
    const key = contentKey(root, [], runtimeEnvironment(before));
    assert.equal(
      contentKey(
        root,
        [],
        runtimeEnvironment({
          ...before,
          npm_lifecycle_event: "quality:full",
          GIT_REFLOG_ACTION: "rebase",
          GIT_PREFIX: "",
        }),
      ),
      key,
    );
    assert.notEqual(
      contentKey(
        root,
        [],
        runtimeEnvironment({
          ...before,
          npm_config_script_shell: "shell-after",
        }),
      ),
      key,
    );
    assert.notEqual(
      contentKey(
        root,
        [],
        runtimeEnvironment({ ...before, NPM_CONFIG_IGNORE_SCRIPTS: "true" }),
      ),
      key,
    );
  }));
