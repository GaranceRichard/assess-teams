import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { ReporterDescription } from "@playwright/test";

export function shardReports(suite: "app" | "demo") {
  const shard = process.env.ASSESS_E2E_SHARD;
  if (!shard) return { reporter: "list" as const };
  if (!/^[12]\/2$/.test(shard)) throw new Error("Invalid E2E shard");
  const index = shard.split("/")[0];
  const directory = resolve(import.meta.dirname, "../.cache/e2e");
  const reporter: ReporterDescription[] = [
    ["list"],
    [
      "blob",
      { outputFile: resolve(directory, `blobs/${suite}-${index}/report.zip`) },
    ],
    [
      "json",
      { outputFile: resolve(directory, `${suite}-results-${index}.json`) },
    ],
  ];
  return {
    reporter,
    outputDir: resolve(directory, `test-results/${suite}-${index}`),
  };
}

// Chromium on Windows otherwise writes debug.log beside its installed executable.
// Keep runtime diagnostics with reports so binary fingerprints remain immutable.
export function browserLogArgs(suite: "app" | "demo") {
  const directory = resolve(import.meta.dirname, "../.cache/e2e");
  mkdirSync(directory, { recursive: true });
  return [`--log-file=${resolve(directory, `${suite}-chromium.log`)}`];
}
