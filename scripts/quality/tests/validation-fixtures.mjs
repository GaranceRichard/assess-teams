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
