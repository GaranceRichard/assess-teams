import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isolatedEnvironment, prepareE2E } from "./isolation.mjs";
import { contentKey, reusable, runtimeContext } from "./validation-inputs.mjs";

export function runValidation({
  root,
  scopes,
  fresh,
  env,
  key,
  run,
  now = Date.now,
  freshScopes = [],
}) {
  const directory = resolve(root, ".cache/quality");
  mkdirSync(directory, { recursive: true });
  const lock = resolve(directory, "running.lock");
  const descriptor = openSync(lock, "wx");
  try {
    writeFileSync(descriptor, String(process.pid));
    for (const scope of scopes) {
      const started = now();
      const cacheable =
        !fresh && !freshScopes.includes(scope) && scope !== "repository";
      const fingerprint = cacheable ? key(scope) : null;
      const path = resolve(directory, `${scope}.json`);
      let proof;
      try {
        proof = JSON.parse(readFileSync(path));
      } catch {
        /* Missing/invalid: rerun. */
      }
      const hit = cacheable && reusable(proof, fingerprint, started);
      console.log(`[${hit ? "REUSE" : "RUN"}] ${scope}`);
      if (!hit && existsSync(path)) unlinkSync(path);
      let status = hit ? 0 : run(scope, env);
      if (cacheable && fingerprint !== key(scope)) {
        console.error(
          `[FAIL] Entrees modifiees pendant ${scope} ; validation a recommencer.`,
        );
        status = 1;
      }
      if (!hit && cacheable && status === 0) {
        const temporary = `${path}.tmp`;
        writeFileSync(
          temporary,
          JSON.stringify({ key: fingerprint, success: true, finished: now() }),
        );
        renameSync(temporary, path);
      }
      appendFileSync(
        resolve(directory, "metrics.jsonl"),
        JSON.stringify({
          scope,
          reused: hit,
          status,
          durationMs: now() - started,
          timestamp: new Date(now()).toISOString(),
        }) + "\n",
      );
      if (status !== 0) return status;
    }
    return 0;
  } finally {
    closeSync(descriptor);
    unlinkSync(lock);
  }
}

export function main(args = process.argv.slice(2)) {
  let scope = "all";
  let fresh = Boolean(process.env.CI);
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--fresh") fresh = true;
    else if (args[index] === "-Scope") scope = args[++index];
    else throw new Error(`Argument inconnu: ${args[index]}`);
  }
  const allowed = [
    "all",
    "repository",
    "backend",
    "backend-static",
    "frontend",
    "e2e",
  ];
  if (!allowed.includes(scope)) throw new Error(`Scope inconnu: ${scope}`);
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const env = isolatedEnvironment(root);
  const scopes =
    scope === "all" ? ["repository", "backend", "frontend", "e2e"] : [scope];
  const key = (name) => {
    const inputs = runtimeContext(root, env);
    return contentKey(root, inputs.files, { ...inputs.context, scope: name });
  };
  const run = (name) => {
    if (name === "e2e") prepareE2E(root, env);
    return (
      spawnSync(
        process.execPath,
        [
          resolve(root, "scripts/run-powershell.mjs"),
          resolve(root, "scripts/quality.ps1"),
          "full",
          "-Scope",
          name,
        ],
        { cwd: root, env, stdio: "inherit" },
      ).status ?? 1
    );
  };
  const freshScopes = process.env.ASSESS_E2E_DB ? ["e2e"] : [];
  return runValidation({ root, scopes, fresh, env, key, run, freshScopes });
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
