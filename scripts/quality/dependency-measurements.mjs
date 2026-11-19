// Reporting only: use real collected case inventories and Vitest's own resolver.
import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";

export async function dependencyMeasurements(root) {
  const read = (file) =>
    readFileSync(resolve(root, ".cache/quality", file), "utf8").replace(
      /^\uFEFF/,
      "",
    );
  const counts = Object.fromEntries(
    ["backend", "frontend", "e2e", "demo"].map((domain) => [domain, new Map()]),
  );
  const add = (domain, file, count = 1) =>
    counts[domain].set(file, (counts[domain].get(file) || 0) + count);
  for (const line of read("backend-collection.txt").split(/\r?\n/))
    if (line.startsWith("tests/") && line.includes("::"))
      add("backend", "backend/" + line.split("::")[0]);
  for (const item of JSON.parse(read("frontend-collection.json"))) {
    const path = relative(root, item.file).replaceAll("\\", "/");
    add("frontend", path);
  }
  for (const [domain, name, directory] of [
    ["e2e", "app", "frontend/e2e/"],
    ["demo", "demo", "frontend/demo-e2e/"],
  ]) {
    const visit = (suites) => {
      for (const suite of suites) {
        for (const spec of suite.specs || [])
          add(domain, directory + spec.file, spec.tests.length);
        visit(suite.suites || []);
      }
    };
    visit(JSON.parse(read(name + "-collection.json")).suites);
  }
  const { createVitest } = await import(
    pathToFileURL(resolve(root, "frontend/node_modules/vitest/dist/node.js"))
  );
  const ctx = await createVitest({
    root: resolve(root, "frontend"),
    watch: false,
    run: true,
    passWithNoTests: false,
  });
  return {
    totals: Object.fromEntries(
      Object.entries(counts).map(([domain, files]) => [
        domain,
        [...files.values()].reduce((sum, count) => sum + count, 0),
      ]),
    ),
    async resolve(selection) {
      const start = performance.now();
      if (selection.related.length) {
        ctx.config.related = [...selection.related, ...selection.frontend].map(
          (path) => resolve(root, path).replaceAll("\\", "/"),
        );
        selection.frontend = (await ctx.getRelevantTestSpecifications())
          .map((spec) => relative(root, spec.moduleId).replaceAll("\\", "/"))
          .sort();
        if (!selection.frontend.length)
          throw new Error("Selection Vitest vide pendant la mesure");
      }
      selection.counts.frontendFiles = selection.frontend.length;
      selection.caseCounts = Object.fromEntries(
        Object.entries(counts).map(([domain, files]) => [
          domain,
          selection[domain].reduce((sum, file) => {
            if (!files.has(file))
              throw new Error(`Inventaire de cas absent: ${file}`);
            return sum + files.get(file);
          }, 0),
        ]),
      );
      selection.resolutionMs = performance.now() - start;
      return selection;
    },
    close: () => ctx.close(),
  };
}
