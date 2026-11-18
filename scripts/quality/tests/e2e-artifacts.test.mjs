import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { consolidate, prepareBlobs } from "../combine_e2e_reports.mjs";
import { isolatedEnvironment } from "../isolation.mjs";
import { fixture } from "./validation-fixtures.mjs";

function artifacts(root) {
  const ids = ["first", "second", "third", "fourth", "future"];
  const report = (tests, shard = null) => ({
    config: { shard }, errors: [],
    suites: [{ specs: tests.map((id) => ({
      id, tests: [{ projectName: "chromium", status: "expected", results: [{ status: "passed" }] }],
    })) }],
  });
  for (const suite of ["app", "demo"]) {
    for (let i = 1; i <= 5; i++) {
      writeFileSync(join(root, `${suite}-collection-${i}.json`), JSON.stringify(report(ids)));
      writeFileSync(join(root, `${suite}-results-${i}.json`), JSON.stringify(report([ids[i - 1]], { current: i, total: 5 })));
      const blob = join(root, "blobs", `${suite}-${i}`);
      mkdirSync(blob, { recursive: true });
      // Stand-in bytes test transport completeness; Playwright validates ZIP contents.
      writeFileSync(join(blob, "report.zip"), `${suite}/${i}`);
    }
  }
}

test("all five app/demo JSON pairs and blob sets are required before passive merge", () => fixture((root) => {
  artifacts(root);
  prepareBlobs(root);
  assert.equal(readdirSync(join(root, "merged-blobs")).length, 10);
  assert.equal(readFileSync(join(root, "merged-blobs/demo-5.zip"), "utf8"), "demo/5");
  assert.throws(() => prepareBlobs(root), /must be empty/);
}));

for (const defect of ["missing-shard", "missing-collection", "missing-report", "missing-blob", "empty-blob", "extra-blob", "corrupt-json"]) {
  test(`${defect} blocks artifact consolidation and merge preparation`, () => fixture((root) => {
    artifacts(root);
    if (defect === "missing-shard") rmSync(join(root, "blobs/app-5"), { recursive: true });
    if (defect === "missing-collection") rmSync(join(root, "demo-collection-5.json"));
    if (defect === "missing-report") rmSync(join(root, "app-results-5.json"));
    if (defect === "missing-blob") rmSync(join(root, "blobs/demo-5/report.zip"));
    if (defect === "empty-blob") writeFileSync(join(root, "blobs/demo-5/report.zip"), "");
    if (defect === "extra-blob") mkdirSync(join(root, "blobs/app-6"));
    if (defect === "corrupt-json") writeFileSync(join(root, "app-results-3.json"), "{broken");
    assert.throws(() => consolidate(root));
    assert.throws(() => prepareBlobs(root));
  }));
}

test("all five CI instances preserve distinct databases, services, temporaries and report identities", () => fixture((root) => {
  const environments = Array.from({ length: 5 }, (_, i) => isolatedEnvironment(root, {
    ASSESS_E2E_SHARD: `${i + 1}/5`,
    ASSESS_E2E_DB: join(root, `backend/.cache/e2e-${i + 1}.sqlite3`),
    ASSESS_E2E_BACKEND_PORT: `810${i + 1}`,
    ASSESS_E2E_FRONTEND_PORT: `518${i + 1}`,
    ASSESS_E2E_DEMO_PORT: `417${i + 1}`,
  }));
  for (const key of ["ASSESS_E2E_DB", "TMP", "ASSESS_E2E_SHARD"]) {
    assert.equal(new Set(environments.map((env) => env[key])).size, 5);
  }
  const ports = environments.flatMap((env) => ["BACKEND", "FRONTEND", "DEMO"].map((kind) => env[`ASSESS_E2E_${kind}_PORT`]));
  assert.equal(new Set(ports).size, 15);
}));

for (const shard of ["", "0/5", "6/5", "1/2", "2/2", "01/5", "1/10"]) {
  test(`collection rejects invalid shard identity ${shard}`, () => {
    const script = fileURLToPath(new URL("../e2e_collection.mjs", import.meta.url));
    const result = spawnSync(process.execPath, [script], { env: { ...process.env, ASSESS_E2E_SHARD: shard }, encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Invalid E2E shard/);
  });
}
