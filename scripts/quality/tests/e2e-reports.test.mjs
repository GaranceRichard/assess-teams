import assert from "node:assert/strict";
import { test } from "node:test";
import { validateReports } from "../combine_e2e_reports.mjs";

function report(ids, shard = null) {
  return {
    config: { shard },
    errors: [],
    suites: [{ suites: [{ specs: ids.map((id) => ({
      id, tests: [{ projectName: "chromium", status: "expected", results: [{ status: "passed" }] }],
    })) }] }],
  };
}
function fixture() {
  return {
    collections: [report(["a", "b", "c"]), report(["a", "b", "c"])],
    reports: [report(["a", "b"], { current: 1, total: 2 }), report(["c"], { current: 2, total: 2 })],
  };
}

test("two shards consolidate the entire nested collection once, including retries", () => {
  const { collections, reports } = fixture();
  reports[0].suites[0].suites[0].specs[0].tests[0].status = "flaky";
  assert.equal(validateReports(collections, reports), 3);
});

for (const defect of ["missing", "overlap", "omission", "collection", "identity", "failed", "skipped", "not-run", "runner-error", "empty"]) {
  test(`${defect} blocks E2E consolidation`, () => {
    const { collections, reports } = fixture();
    const tests = reports[1].suites[0].suites[0].specs;
    if (defect === "missing") reports.pop();
    if (defect === "overlap") tests[0].id = "a";
    if (defect === "omission") collections.forEach((c) => c.suites[0].suites[0].specs.push(...report(["d"]).suites[0].suites[0].specs));
    if (defect === "collection") collections[1] = report(["c"]);
    if (defect === "identity") reports[1].config.shard.current = 1;
    if (defect === "failed") tests[0].tests[0].status = "unexpected";
    if (defect === "skipped") tests[0].tests[0].status = "skipped";
    if (defect === "not-run") tests[0].tests[0].results = [];
    if (defect === "runner-error") reports[1].errors.push({ message: "Server failed" });
    if (defect === "empty") reports[1].suites = [];
    assert.throws(() => validateReports(collections, reports));
  });
}
