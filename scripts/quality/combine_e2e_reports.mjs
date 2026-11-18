import { readFileSync, readdirSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const shards = [1, 2, 3, 4, 5];

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
  if (collections.length !== shards.length || reports.length !== shards.length) throw new Error("Five E2E shards required");
  const collected = uniqueIds(cases(collections[0]));
  const executed = [];
  for (let index = 0; index < shards.length; index++) {
    if (collections[index].config.shard || !Array.isArray(collections[index].errors) || collections[index].errors.length) {
      throw new Error("Invalid complete E2E collection");
    }
    if (JSON.stringify(uniqueIds(cases(collections[index]))) !== JSON.stringify(collected)) {
      throw new Error("E2E collections differ between shards");
    }
    const report = reports[index];
    if (report.config.shard?.current !== index + 1 || report.config.shard?.total !== shards.length) {
      throw new Error("Invalid E2E shard identity");
    }
    if (!Array.isArray(report.errors) || report.errors.length) throw new Error("E2E runner errors");
    const selected = cases(report);
    uniqueIds(selected);
    for (const test of selected) {
      if (!["expected", "flaky"].includes(test.status) || test.results?.at(-1)?.status !== "passed") {
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
  const expected = ["app", "demo"].flatMap((suite) => shards.map((index) => `${suite}-${index}`));
  if (JSON.stringify(readdirSync(resolve(directory, "blobs")).sort()) !== JSON.stringify(expected)) {
    throw new Error("Missing or unexpected E2E blob report");
  }
  for (const name of expected) {
    const blob = resolve(directory, "blobs", name, "report.zip");
    if (!statSync(blob).isFile() || statSync(blob).size === 0) throw new Error("Incomplete E2E blob report");
  }
  const read = (suite, kind, index) => JSON.parse(readFileSync(resolve(directory, `${suite}-${kind}-${index}.json`)));
  for (const suite of ["app", "demo"]) {
    const count = validateReports(shards.map((i) => read(suite, "collection", i)), shards.map((i) => read(suite, "results", i)));
    console.log(`${suite}: ${count} E2E tests executed exactly once across five shards`);
  }
}

export function prepareBlobs(directory) {
  consolidate(directory);
  const output = resolve(directory, "merged-blobs");
  mkdirSync(output, { recursive: true });
  if (readdirSync(output).length) throw new Error("E2E merge destination must be empty");
  for (const name of readdirSync(resolve(directory, "blobs"))) {
    copyFileSync(resolve(directory, "blobs", name, "report.zip"), resolve(output, `${name}.zip`));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = resolve(process.argv[2]);
  if (process.argv[3] === "--prepare") {
    prepareBlobs(directory);
  } else consolidate(directory);
}
