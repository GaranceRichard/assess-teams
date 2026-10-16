import { requiresFreshRuntime } from "./runtime-inputs.mjs";
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
import {
  reusable,
  proofVersion,
  proofProvenance,
} from "./validation-inputs.mjs";
import { fingerprint } from "./impact-runner.mjs";

export function runValidation({
  root,
  scopes,
  fresh,
  env,
  key,
  run,
  now = Date.now,
  freshScopes = [],
  metadata = {},
}) {
  const directory = resolve(root, ".cache/quality");
  mkdirSync(directory, { recursive: true });
  const lock = resolve(directory, "running.lock");
  const descriptor = openSync(lock, "wx");
  try {
    const fingerprints = new Map();
    writeFileSync(descriptor, String(process.pid));
    for (const scope of scopes) {
      const started = now();
      const requestedCache =
        !fresh &&
        !freshScopes.includes(scope) &&
        !["repository", "documentation"].includes(scope);
      const fingerprint = requestedCache ? key(scope) : null;
      const cacheable = requestedCache && fingerprint !== null;
      if (cacheable) fingerprints.set(scope, fingerprint);
      const path = resolve(directory, `${scope}.json`);
      let proof;
      try {
        proof = JSON.parse(readFileSync(path));
      } catch {
        /* Missing/invalid: rerun. */
      }
      const hit = cacheable && reusable(proof, fingerprint, started, scope);
      const reason = hit
        ? "empreinte et selection identiques, preuve valide"
        : cacheable
          ? "preuve absente, incompatible ou entrees modifiees"
          : "controle frais obligatoire";
      console.log(`[${hit ? "REUSE" : "RUN"}] ${scope} - ${reason}`);
      if (!hit && existsSync(path)) unlinkSync(path);
      let status = hit ? 0 : run(scope, env);
      if (cacheable && fingerprint !== key(scope)) {
        console.error(
          `[FAIL] Entrees modifiees pendant ${scope} ; validation a recommencer.`,
        );
        if (existsSync(path)) unlinkSync(path);
        status = 1;
      }
      if (!hit && cacheable && status === 0) {
        const temporary = `${path}.tmp`;
        writeFileSync(
          temporary,
          JSON.stringify({
            version: proofVersion,
            provenance: proofProvenance,
            scope,
            key: fingerprint,
            success: true,
            started,
            finished: now(),
          }),
        );
        renameSync(temporary, path);
      }
      appendFileSync(
        resolve(directory, "metrics.jsonl"),
        JSON.stringify({
          ...metadata,
          scope,
          reused: hit,
          status,
          durationMs: now() - started,
          timestamp: new Date(now()).toISOString(),
        }) + "\n",
      );
      if (status !== 0) return status;
    }
    for (const [scope, fingerprint] of fingerprints) {
      if (fingerprint !== key(scope)) {
        unlinkSync(resolve(directory, `${scope}.json`));
        console.error(
          `[FAIL] Entrees de ${scope} modifiees apres son controle`,
        );
        appendFileSync(
          resolve(directory, "metrics.jsonl"),
          JSON.stringify({
            ...metadata,
            scope: "plan",
            status: 1,
            invalidated: scope,
            timestamp: new Date(now()).toISOString(),
          }) + "\n",
        );
        return 1;
      }
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
    "documentation",
    "backend",
    "backend-static",
    "frontend",
    "e2e",
  ];
  if (!allowed.includes(scope)) throw new Error(`Scope inconnu: ${scope}`);
  if (process.env.ASSESS_E2E_SHARD && (!process.env.CI || scope !== "e2e")) {
    throw new Error(
      "E2E shards require the isolated CI e2e scope; a full local proof must be exhaustive.",
    );
  }
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const env = isolatedEnvironment(root);
  const scopes =
    scope === "all" ? ["repository", "backend", "frontend", "e2e"] : [scope];
  const key = (name) => fingerprint(root, env, { scope: name });
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
  return runValidation({
    root,
    scopes,
    fresh: fresh || requiresFreshRuntime(env),
    env,
    key,
    run,
    freshScopes,
  });
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
