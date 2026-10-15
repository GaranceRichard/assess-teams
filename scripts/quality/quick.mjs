import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { changesBetween } from "./changes.mjs";
import { planImpact } from "./impact.mjs";

export function quickScopes(plan) {
  if (plan.exhaustive) return ["all"];
  const scopes = ["documentation"];
  for (const domain of ["backend", "frontend"])
    if (plan.checks.some(({ scope }) => scope.startsWith(domain)))
      scopes.push(domain === "backend" ? "backend-static" : domain);
  return scopes;
}

export function main() {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  try {
    const { changes } = changesBetween(root, "origin/main", "HEAD", {
      working: true,
    });
    for (const scope of quickScopes(planImpact(changes))) {
      const result = spawnSync(
        process.execPath,
        [
          resolve(root, "scripts/run-powershell.mjs"),
          resolve(root, "scripts/quality.ps1"),
          "quick",
          "-Scope",
          scope,
        ],
        { cwd: root, env: process.env, stdio: "inherit" },
      );
      if (result.status !== 0)
        console.warn(`[WARNING] Gate informatif ${scope} indisponible`);
    }
  } catch (error) {
    console.warn(`[WARNING] Gate informatif: ${error.message}`);
  }
  return 0;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exitCode = main();
