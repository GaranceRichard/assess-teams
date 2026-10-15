import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { main as selective } from "./selective.mjs";
import { planImpact } from "./impact.mjs";
import { pythonPath } from "./validation-inputs.mjs";
import { isolatedEnvironment, prepareE2E } from "./isolation.mjs";

export const requiresFull = (files) =>
  planImpact(files.filter(Boolean)).exhaustive;

export function selectedFiles(root, domain, selectors) {
  const base = resolve(root, domain === "backend" ? "backend" : "frontend");
  if (!selectors.length)
    throw new Error("Fichiers de tests explicites obligatoires.");
  return selectors.map((selector) => {
    const path = resolve(base, selector);
    const local = relative(base, path);
    const validTest =
      domain === "backend"
        ? /^tests[\\/].*\.py$/
        : domain === "frontend"
          ? /\.(test|spec)\.tsx?$/
          : /^e2e[\\/].*\.spec\.ts$/;
    if (
      local.startsWith("..") ||
      isAbsolute(local) ||
      !validTest.test(local) ||
      !existsSync(path)
    ) {
      throw new Error(`Selection de test invalide: ${selector}`);
    }
    return path;
  });
}

export function main(args = process.argv.slice(2)) {
  if (!args.length || args[0].startsWith("--")) return selective(args);
  const [domain, ...selectors] = args;
  if (!["backend", "frontend", "e2e"].includes(domain))
    throw new Error("Domaine: backend, frontend ou e2e.");
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const tests = selectedFiles(root, domain, selectors);
  // Explicit development tests stay narrow; publication recomputes the mandatory plan.
  console.log(
    "[DEV] Tests explicites; le pre-push verifiera tous les controles requis par le diff.",
  );
  const env = isolatedEnvironment(root);
  const run = (executable, argv, cwd = root) =>
    spawnSync(executable, argv, { cwd, env, stdio: "inherit" }).status ?? 1;
  if (domain === "backend") {
    const status = run(process.execPath, [
      resolve(root, "scripts/run-powershell.mjs"),
      resolve(root, "scripts/quality.ps1"),
      "full",
      "-Scope",
      "backend-static",
    ]);
    return (
      status ||
      run(
        pythonPath(root),
        ["-m", "pytest", ...tests, "--no-cov"],
        resolve(root, "backend"),
      )
    );
  }
  const frontend = resolve(root, "frontend");
  if (domain === "frontend") {
    for (const [cli, argv] of [
      ["eslint/bin/eslint.js", ["."]],
      ["prettier/bin/prettier.cjs", ["--check", "."]],
      ["typescript/bin/tsc", ["-b"]],
    ]) {
      const status = run(
        process.execPath,
        [resolve(frontend, "node_modules", cli), ...argv],
        frontend,
      );
      if (status) return status;
    }
    return run(
      process.execPath,
      [resolve(frontend, "node_modules/vitest/vitest.mjs"), "run", ...tests],
      frontend,
    );
  }
  prepareE2E(root, env);
  return run(
    process.execPath,
    [
      resolve(frontend, "node_modules/@playwright/test/cli.js"),
      "test",
      ...tests.map((path) => relative(frontend, path).replaceAll("\\", "/")),
    ],
    frontend,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`[FAIL] ${error.message}`);
    process.exitCode = 1;
  }
}
