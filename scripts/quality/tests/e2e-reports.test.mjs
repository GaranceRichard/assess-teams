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
  const ids = ["a", "b", "c", "d", "e", "future-test"];
  return {
    collections: Array.from({ length: 5 }, () => report(ids)),
    reports: Array.from({ length: 5 }, (_, i) => report(i === 0 ? [ids[i], ids[5]] : [ids[i]], { current: i + 1, total: 5 })),
  };
}

test("five shards consolidate the entire nested collection once, including retries and future tests", () => {
  const { collections, reports } = fixture();
  reports[0].suites[0].suites[0].specs[0].tests[0].status = "flaky";
  assert.equal(validateReports(collections, reports), 6);
});

for (const defect of ["missing", "duplicate-shard", "overlap", "repeated-test", "omission", "collection", "partial-collection", "identity", "total", "failed", "false-success", "skipped", "not-run", "runner-error", "empty", "corrupt"]) {
  test(`${defect} blocks E2E consolidation`, () => {
    const { collections, reports } = fixture();
    const tests = reports[1].suites[0].suites[0].specs;
    if (defect === "missing") reports.pop();
    if (defect === "duplicate-shard") reports[1] = structuredClone(reports[0]);
    if (defect === "overlap") tests[0].id = "a";
    if (defect === "repeated-test") tests.push(structuredClone(tests[0]));
    if (defect === "omission") collections.forEach((c) => c.suites[0].suites[0].specs.push(...report(["omitted"]).suites[0].suites[0].specs));
    if (defect === "collection") collections[1] = report(["c"]);
    if (defect === "partial-collection") collections[1].config.shard = { current: 2, total: 5 };
    if (defect === "identity") reports[1].config.shard.current = 1;
    if (defect === "total") reports[1].config.shard.total = 2;
    if (defect === "failed") tests[0].tests[0].status = "unexpected";
    if (defect === "false-success") tests[0].tests[0].results[0].status = "failed";
    if (defect === "skipped") tests[0].tests[0].status = "skipped";
    if (defect === "not-run") tests[0].tests[0].results = [];
    if (defect === "runner-error") reports[1].errors.push({ message: "Server failed" });
    if (defect === "empty") reports[1].suites = [];
    if (defect === "corrupt") delete reports[1].suites;
    assert.throws(() => validateReports(collections, reports));
  });
}
