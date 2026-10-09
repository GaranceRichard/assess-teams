import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const jobs = ["repository", "backend-static", "backend-tests", "backend-coverage", "frontend", "e2e"];
const success = () => Object.fromEntries(jobs.map((job) => [job, { result: "success" }]));

function aggregate(results) {
  const script = fileURLToPath(new URL("../complete-ci.mjs", import.meta.url));
  return spawnSync(process.execPath, [script], {
    env: { ...process.env, QUALITY_JOB_RESULTS: results },
    encoding: "utf8",
  });
}

test("all required jobs passing produces a successful required check", () => {
  const result = aggregate(JSON.stringify(success()));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /every required job succeeded/);
});

for (const job of jobs) {
  for (const status of ["failure", "cancelled", "skipped", "pending"]) {
    test(`${job} ${status} blocks publication`, () => {
      const results = success();
      results[job].result = status;
      const result = aggregate(JSON.stringify(results));
      assert.equal(result.status, 1);
      assert.match(result.stderr, new RegExp(job));
    });
  }

  test(`missing ${job} blocks publication`, () => {
    const results = success();
    delete results[job];
    assert.equal(aggregate(JSON.stringify(results)).status, 1);
  });
}

test("malformed job results cannot pass the required check", () => {
  assert.equal(aggregate("invalid json").status, 1);
});
