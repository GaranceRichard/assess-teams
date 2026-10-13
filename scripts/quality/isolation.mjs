import { createHash } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

export function isolatedEnvironment(root, original = process.env) {
  const env = { ...original };
  const slot = createHash("sha256").update(root).digest().readUInt16BE() % 3000;
  for (const [name, offset] of [
    ["BACKEND", 0],
    ["FRONTEND", 1],
    ["DEMO", 2],
  ]) {
    env[`ASSESS_E2E_${name}_PORT`] ||= String(20000 + slot * 3 + offset);
  }
  const temporary = resolve(root, ".cache/tmp", env.ASSESS_E2E_SHARD?.replace("/", "-") || ".");
  mkdirSync(temporary, { recursive: true });
  for (const name of ["TMPDIR", "TMP", "TEMP"]) env[name] = temporary;
  const directory = resolve(root, "backend/.cache");
  mkdirSync(directory, { recursive: true });
  env.ASSESS_E2E_DB ||= resolve(directory, "e2e.sqlite3");
  return env;
}

// Only the canonical disposable database is reset; explicit user paths are preserved.
export function prepareE2E(root, env, original = process.env) {
  if (original.ASSESS_E2E_DB) return;
  const database = resolve(root, "backend/.cache/e2e.sqlite3");
  if (env.ASSESS_E2E_DB !== database)
    throw new Error("Base E2E hors du chemin jetable.");
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    rmSync(database + suffix, { force: true });
  }
}
