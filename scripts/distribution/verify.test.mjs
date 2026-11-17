import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cpSync,
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { verify } from "./verify.mjs";

const artifact = resolve(
  process.env.ASSESS_FRONTEND_ARTIFACT || "build/mep-058/artifact",
);
const demo = resolve(process.env.ASSESS_FRONTEND_DEMO || "build/demo");
function reseal(root, path) {
  const file = join(root, "manifest.json");
  const manifest = JSON.parse(readFileSync(file));
  const bytes = readFileSync(join(root, path));
  const entry = manifest.files.find((item) => item.path === path);
  entry.size = bytes.length;
  entry.sha256 = createHash("sha256").update(bytes).digest("hex");
  manifest.payloadSha256 = createHash("sha256")
    .update(JSON.stringify(manifest.files))
    .digest("hex");
  writeFileSync(file, JSON.stringify(manifest));
}
function changed(action, expected) {
  const temporary = mkdtempSync(join(tmpdir(), "assess-mep-058-refusal-"));
  try {
    cpSync(artifact, temporary, { recursive: true });
    action(temporary);
    assert.throws(() => verify(temporary), expected);
  } finally {
    const target = resolve(temporary);
    assert(target.startsWith(resolve(tmpdir()) + sep));
    rmSync(target, { recursive: true, force: true });
  }
}
test("accepts the real prepared product and complete local resources", () => {
  assert.equal(verify(artifact).kind, "normal");
});
test("refuses a missing application asset", () =>
  changed((root) => {
    const manifest = verify(root);
    const asset = manifest.files.find((file) =>
      /^frontend\/assets\/.*\.js$/.test(file.path),
    );
    rmSync(join(root, asset.path));
  }, /Missing/));
test("refuses altered Swagger bytes", () =>
  changed((root) => {
    writeFileSync(
      join(root, "static/swagger-ui/swagger-ui-bundle.js"),
      "altered",
    );
  }, /Altered artifact/));
test("refuses a missing redistribution notice", () =>
  changed((root) => {
    rmSync(join(root, "static/swagger-ui/NOTICE"));
  }, /Missing/));
test("refuses the actual GitHub Pages demo substituted for the application", () =>
  changed((root) => {
    const target = resolve(root, "frontend");
    assert(
      target.startsWith(resolve(root) + "/") ||
        target.startsWith(resolve(root) + "\\"),
    );
    rmSync(target, { recursive: true });
    cpSync(demo, target, { recursive: true });
  }, /Missing|Altered/));
test("refuses a candidate requiring compilation on target", () =>
  changed((root) => {
    const manifest = verify(root);
    const asset = manifest.files.find((file) =>
      /^frontend\/assets\/.*\.js$/.test(file.path),
    );
    rmSync(join(root, asset.path));
    cpSync(resolve("frontend/src/main.tsx"), join(root, "frontend/main.tsx"));
  }, /Missing or unexpected/));
test("refuses a mandatory remote script even with recalculated file hashes", () =>
  changed((root) => {
    const path = "frontend/index.html";
    const html =
      readFileSync(join(root, path), "utf8") +
      '<script src="https://cdn.example.test/app.js"></script>';
    writeFileSync(join(root, path), html);
    reseal(root, path);
  }, /Non-local build asset/));

test("refuses the actual precompiled Swagger that MEP-057 rejected", () =>
  changed((root) => {
    const path = "static/swagger-ui/swagger-ui-bundle.js";
    cpSync(
      resolve(".cache/mep-058/swagger-ui-5.35.0/dist/swagger-ui-bundle.js"),
      join(root, path),
    );
    reseal(root, path);
  }, /precompiled Swagger refused/));
test("refuses a missing Swagger subresource", () =>
  changed((root) => {
    rmSync(join(root, "static/swagger-ui/oauth2-redirect.js"));
  }, /Missing/));
test("refuses an unidentified component license", () =>
  changed((root) => {
    const path = "static/swagger-ui/components.json";
    const components = JSON.parse(readFileSync(join(root, path)));
    delete components[0].license;
    writeFileSync(join(root, path), JSON.stringify(components));
    reseal(root, path);
  }, /Untraceable Swagger component/));

for (const field of ["sourceCommit", "sourceInputs", "preparationInputs"]) {
  test(`refuses absent ${field} attribution`, () =>
    changed((root) => {
      const file = join(root, "manifest.json");
      const manifest = JSON.parse(readFileSync(file));
      delete manifest[field];
      writeFileSync(file, JSON.stringify(manifest));
    }, /Untraceable artifact provenance/));
}
test("refuses input attribution with an invalid digest", () =>
  changed((root) => {
    const file = join(root, "manifest.json");
    const manifest = JSON.parse(readFileSync(file));
    manifest.sourceInputs[0].sha256 = "unrecorded";
    writeFileSync(file, JSON.stringify(manifest));
  }, /Untraceable artifact provenance/));

for (const dirty of [
  "scripts/distribution/swagger-inputs.mjs",
  "docs/operations/distribution-inventory/components.md",
  "frontend/untracked.ts",
]) {
  test(`refuses generation before compilation with uncommitted ${dirty}`, () => {
    const fixture = mkdtempSync(join(tmpdir(), "assess-mep-058-inputs-"));
    try {
      mkdirSync(join(fixture, "scripts/distribution"), { recursive: true });
      mkdirSync(join(fixture, "docs/operations/distribution-inventory"), {
        recursive: true,
      });
      mkdirSync(join(fixture, "frontend"));
      writeFileSync(
        join(fixture, "docs/operations/distribution-inventory/components.md"),
        "Inventoried",
      );
      for (const name of [
        "frontend-artifact.mjs",
        "verify.mjs",
        "swagger-inputs.mjs",
      ])
        cpSync(
          resolve("scripts/distribution", name),
          join(fixture, "scripts/distribution", name),
        );
      writeFileSync(
        join(fixture, "frontend/package.json"),
        JSON.stringify({
          scripts: {
            build: `node -e "require('fs').writeFileSync('build-started','yes')"`,
          },
        }),
      );
      const git = (...args) =>
        execFileSync("git", args, { cwd: fixture, stdio: "pipe" });
      git("init");
      git("add", ".");
      git("config", "user.name", "Fixture");
      git("config", "user.email", "fixture@example.test");
      git("config", "commit.gpgsign", "false");
      git("commit", "-m", "Fixture inputs");
      writeFileSync(join(fixture, dirty), "// uncommitted input\n", {
        flag: "a",
      });
      const result = spawnSync(
        process.execPath,
        [
          join(fixture, "scripts/distribution/frontend-artifact.mjs"),
          "swagger",
          "artifact",
        ],
        { cwd: fixture, encoding: "utf8" },
      );
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Uncommitted artifact input/);
      assert.equal(existsSync(join(fixture, "frontend/build-started")), false);
    } finally {
      assert(resolve(fixture).startsWith(resolve(tmpdir()) + sep));
      rmSync(fixture, { recursive: true, force: true });
    }
  });
}
