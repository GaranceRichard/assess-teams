import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const frontend = resolve(root, "frontend");
const shard = process.env.ASSESS_E2E_SHARD;
if (!/^[12]\/2$/.test(shard || "")) throw new Error("Invalid E2E shard");
const directory = resolve(frontend, ".cache/e2e");
mkdirSync(directory, { recursive: true });
for (const suite of ["app", "demo"]) {
  const config = suite === "app" ? "playwright.config.ts" : "playwright.demo.config.ts";
  const result = spawnSync(process.execPath, [
    resolve(frontend, "node_modules/@playwright/test/cli.js"),
    "test", "--config", config, "--list", "--reporter=json",
  ], { cwd: frontend, env: process.env, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  const collection = JSON.parse(result.stdout);
  if (collection.config.shard) throw new Error("Collection must include the complete suite");
  writeFileSync(resolve(directory, `${suite}-collection-${shard[0]}.json`), result.stdout);
}
