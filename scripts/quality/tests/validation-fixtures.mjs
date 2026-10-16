import { requiresFreshRuntime } from "../runtime-inputs.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function fixture(action) {
  const root = mkdtempSync(join(tmpdir(), "assess-validation-test-"));
  try {
    action(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

export function options(root, calls, extra = {}) {
  return {
    root,
    scopes: ["repository", "backend", "frontend", "e2e"],
    fresh: false,
    env: {},
    key: (scope) => scope,
    run: (scope) => {
      calls.push(scope);
      return 0;
    },
    ...extra,
  };
}

// A simulated local cache must not inherit external loaders from the CI host.
// Preserve and restore only these variables; never weaken the production guard.
export function boundedEnvironment(action) {
  const loaders = () =>
    Object.keys(process.env).filter((name) =>
      requiresFreshRuntime({ [name]: "present" }),
    );
  const saved = Object.fromEntries(
    loaders().map((name) => [name, process.env[name]]),
  );
  for (const name of loaders()) delete process.env[name];
  try {
    return action();
  } finally {
    for (const name of loaders()) delete process.env[name];
    Object.assign(process.env, saved);
  }
}
