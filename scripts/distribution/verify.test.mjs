import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cpSync,
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
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
    assert(
      target.startsWith(resolve(tmpdir()) + "\\") ||
        target.startsWith(resolve(tmpdir()) + "/"),
    );
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
