import { readFileSync, readdirSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function cases(report) {
  const tests = [];
  function visit(suite) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests) tests.push({ ...test, id: `${spec.id}:${test.projectName}` });
    }
    for (const child of suite.suites || []) visit(child);
  }
  for (const suite of report.suites) visit(suite);
  return tests;
}

function uniqueIds(tests) {
  const ids = tests.map((test) => test.id).sort();
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error("Empty or duplicate E2E collection");
  return ids;
}

export function validateReports(collections, reports) {
  if (collections.length !== 2 || reports.length !== 2) throw new Error("Two E2E shards required");
  const collected = uniqueIds(cases(collections[0]));
  const executed = [];
  for (let index = 0; index < 2; index++) {
    if (JSON.stringify(uniqueIds(cases(collections[index]))) !== JSON.stringify(collected)) {
      throw new Error("E2E collections differ between shards");
    }
    const report = reports[index];
    if (report.config.shard?.current !== index + 1 || report.config.shard?.total !== 2) {
      throw new Error("Invalid E2E shard identity");
    }
    if (report.errors?.length) throw new Error("E2E runner errors");
    const selected = cases(report);
    uniqueIds(selected);
    for (const test of selected) {
      if (!["expected", "flaky"].includes(test.status) || !test.results?.length) {
        throw new Error(`E2E test did not complete successfully: ${test.id}`);
      }
      executed.push(test.id);
    }
  }
  if (JSON.stringify(uniqueIds(executed.map((id) => ({ id })))) !== JSON.stringify(collected)) {
    throw new Error("E2E shards must execute exactly the complete collection once");
  }
  return executed.length;
}

export function consolidate(directory) {
  const expected = ["app-1", "app-2", "demo-1", "demo-2"];
  if (JSON.stringify(readdirSync(resolve(directory, "blobs")).sort()) !== JSON.stringify(expected)) {
    throw new Error("Missing or unexpected E2E blob report");
  }
  const read = (suite, kind, index) => JSON.parse(readFileSync(resolve(directory, `${suite}-${kind}-${index}.json`)));
  for (const suite of ["app", "demo"]) {
    const count = validateReports([1, 2].map((i) => read(suite, "collection", i)), [1, 2].map((i) => read(suite, "results", i)));
    console.log(`${suite}: ${count} E2E tests executed exactly once across two shards`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = resolve(process.argv[2]);
  if (process.argv[3] === "--prepare") {
    const output = resolve(directory, "merged-blobs");
    mkdirSync(output, { recursive: true });
    for (const name of readdirSync(resolve(directory, "blobs"))) {
      copyFileSync(resolve(directory, "blobs", name, "report.zip"), resolve(output, `${name}.zip`));
    }
  } else consolidate(directory);
}
