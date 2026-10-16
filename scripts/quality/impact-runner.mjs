import { spawnSync } from "node:child_process";
import { resolve, relative } from "node:path";
import {
  pythonPath,
  runtimeContext,
  contentKey,
  fingerprintPolicy,
} from "./validation-inputs.mjs";
import { prepareE2E } from "./isolation.mjs";

export function fingerprint(
  root,
  env,
  check,
  inputs = runtimeContext(root, env, check.scope),
) {
  if (inputs.context.unbounded) return null;
  // Preserve shared scripts/configuration, but avoid invalidating an unrelated domain.
  const excluded = check.scope.startsWith("frontend")
    ? "backend/"
    : check.scope.startsWith("backend")
      ? "frontend/"
      : null;
  const files = inputs.files.filter(
    (path) => !excluded || !path.startsWith(excluded),
  );
  return contentKey(root, files, {
    ...inputs.context,
    policy: fingerprintPolicy,
    check,
  });
}

export function executeCheck(root, env, check, invoke) {
  const frontend = resolve(root, "frontend");
  const run =
    invoke ||
    ((exe, args, cwd = root) =>
      spawnSync(exe, args, { cwd, env, stdio: "inherit" }).status ?? 1);
  const node = (args, cwd = root) => run(process.execPath, args, cwd);
  const full = (scope) =>
    node([
      resolve(root, "scripts/run-powershell.mjs"),
      resolve(root, "scripts/quality.ps1"),
      "full",
      "-Scope",
      scope,
    ]);
  const tests = (check.tests || []).map((path) => resolve(root, path));
  if (check.scope === "backend-targeted")
    return run(
      pythonPath(root),
      ["-m", "pytest", ...tests, "--no-cov"],
      resolve(root, "backend"),
    );
  if (check.scope === "frontend-static") {
    for (const [cli, args] of [
      ["eslint/bin/eslint.js", ["."]],
      ["prettier/bin/prettier.cjs", ["--check", "."]],
      ["typescript/bin/tsc", ["-b"]],
    ]) {
      const status = node(
        [resolve(frontend, "node_modules", cli), ...args],
        frontend,
      );
      if (status) return status;
    }
    return 0;
  }
  if (check.scope === "frontend-targeted") {
    const vitest = resolve(frontend, "node_modules/vitest/vitest.mjs");
    if (check.related?.length) {
      const paths = [
        ...new Set([
          ...check.related.map((path) => resolve(root, path)),
          ...tests,
        ]),
      ].map((path) => relative(frontend, path));
      // Related includes a changed test itself and its importers: one union, no duplicate run.
      // No --passWithNoTests: an empty affected graph must block.
      return node([vitest, "related", "--run", ...paths], frontend);
    }
    return tests.length ? node([vitest, "run", ...tests], frontend) : 1;
  }

  if (check.scope === "e2e-targeted") {
    prepareE2E(root, env);
    const paths = tests.map((path) =>
      relative(frontend, path).replaceAll("\\", "/"),
    );
    const status = node(
      [
        resolve(frontend, "node_modules/@playwright/test/cli.js"),
        "test",
        ...paths,
      ],
      frontend,
    );
    if (status || !check.demo) return status;
    for (const [cli, args] of [
      ["typescript/bin/tsc", ["-b"]],
      ["vite/bin/vite.js", ["build", "--config", "vite.demo.config.ts"]],
      [
        "@playwright/test/cli.js",
        ["test", "--config", "playwright.demo.config.ts"],
      ],
    ]) {
      const code = node(
        [resolve(frontend, "node_modules", cli), ...args],
        frontend,
      );
      if (code) return code;
    }
    return 0;
  }
  if (check.scope === "e2e") prepareE2E(root, env);
  return full(check.scope);
}
