import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectNpm, renderNotices } from "./npm-notices.mjs";
import { legalAssets, legalNotices } from "./vite-legal.mjs";

function fixture(
  run,
  license = "MIT",
  text = "Copyright Original author\nMIT terms\n",
) {
  const root = mkdtempSync(join(tmpdir(), "assess-legal-"));
  try {
    mkdirSync(join(root, "node_modules/example"), { recursive: true });
    writeFileSync(
      join(root, "package-lock.json"),
      JSON.stringify({
        packages: {
          "": {},
          "node_modules/example": { version: "1.0.0", license },
        },
      }),
    );
    writeFileSync(
      join(root, "node_modules/example/package.json"),
      JSON.stringify({ version: "1.0.0" }),
    );
    if (text !== null)
      writeFileSync(join(root, "node_modules/example/LICENSE"), text);
    run(root, text);
  } finally {
    rmSync(root, { recursive: true });
  }
}

test("retains exact third-party copyright and terms without relicensing", () => {
  fixture((root, original) => {
    const components = collectNpm(root);
    assert.equal(components[0].license, "MIT");
    assert.equal(components[0].notices[0].text, original);
    assert.ok(renderNotices(components).includes(original));
  });
});

test("refuses a missing license text even if SPDX metadata is present", () => {
  fixture(
    (root) => assert.throws(() => collectNpm(root), /Missing license text/),
    "MIT",
    null,
  );
});

test("refuses a production dependency requiring a new license review", () => {
  fixture(
    (root) => assert.throws(() => collectNpm(root), /License review required/),
    "GPL-2.0-only",
  );
});

test("refuses unknown license metadata and missing nonoptional package", () => {
  fixture(
    (root) => assert.throws(() => collectNpm(root), /Unknown license/),
    null,
  );
  fixture((root) => {
    rmSync(join(root, "node_modules/example"), { recursive: true });
    assert.throws(() => collectNpm(root), /Missing component/);
  });
});

test("build assets carry canonical license and runtime attributions without a CI install", () => {
  fixture((root, original) => {
    const assets = legalAssets(root);
    assert.equal(
      assets.get("LICENSE.txt"),
      readFileSync(new URL("../../LICENSE", import.meta.url), "utf8"),
    );
    assert.ok(assets.get("THIRD-PARTY.txt").includes(original));
    const emitted = [];
    legalNotices(root).generateBundle.call({
      emitFile(asset) {
        emitted.push(asset);
      },
    });
    assert.equal(emitted.length, assets.size);
    assert.ok(emitted.every((asset) => asset.fileName.startsWith("legal/")));
  });
});

test("refuses attribution based on a stale lockfile", () => {
  fixture((root) => {
    writeFileSync(
      join(root, "node_modules/example/package.json"),
      JSON.stringify({ version: "2.0.0" }),
    );
    assert.throws(() => collectNpm(root), /Installed version mismatch/);
  });
});
