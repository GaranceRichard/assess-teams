import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readlinkSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { resolve } from "node:path";
import { toolContext } from "./runtime-inputs.mjs";

export { pureDocument as documentationOnly } from "./impact.mjs";
import { pureDocument as documentationOnly } from "./impact.mjs";

export function gitFiles(root) {
  return [
    ...new Set(
      execFileSync(
        "git",
        ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        { cwd: root },
      )
        .toString()
        .split("\0")
        .filter(Boolean),
    ),
  ].sort();
}

export function contentKey(root, files, context) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(context));
  for (const file of files.filter((file) => !documentationOnly(file)).sort()) {
    const path = resolve(root, file);
    hash.update(JSON.stringify(file));
    const present = existsSync(path);
    hash.update(present ? "present\0" : "deleted\0");
    if (present) {
      const stat = lstatSync(path);
      hash.update(
        JSON.stringify({
          mode: stat.mode,
          link: stat.isSymbolicLink() ? readlinkSync(path) : null,
        }),
      );
      hash.update(readFileSync(path));
    }
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function pythonPath(root) {
  return resolve(
    root,
    process.platform === "win32"
      ? "backend/.venv/Scripts/python.exe"
      : "backend/.venv/bin/python",
  );
}

export function runtimeContext(root, env, scope = "e2e") {
  const context = {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    ...toolContext(root, env, pythonPath(root), scope),
    environment: runtimeEnvironment(env),
  };
  return {
    files: [...gitFiles(root), ...localInputFiles(root, scope)],
    context,
  };
}

export function localInputFiles(root, scope = "e2e") {
  const files = [];
  for (const directory of ["", "backend", "frontend"]) {
    for (const name of readdirSync(resolve(root, directory))) {
      if (name === ".env" || name.startsWith(".env."))
        files.push(`${directory ? directory + "/" : ""}${name}`);
    }
  }
  for (const directory of scope.startsWith("backend")
    ? [""]
    : ["", "frontend"]) {
    const file = `${directory ? directory + "/" : ""}node_modules/.package-lock.json`;
    if (!existsSync(resolve(root, file)))
      throw new Error(`Runtime npm absent: ${file}`);
    files.push(file);
  }
  return files;
}

export const proofVersion = 3;
export const proofProvenance = "assess-teams/local-validation";
export const fingerprintPolicy = 3;

export function reusable(proof, key, now = Date.now(), scope = proof?.scope) {
  return (
    proof?.version === proofVersion &&
    proof.provenance === proofProvenance &&
    typeof proof.key === "string" &&
    proof.key.length > 0 &&
    proof.key === key &&
    typeof proof.scope === "string" &&
    proof.scope === scope &&
    Number.isFinite(proof.started) &&
    proof.started >= 0 &&
    proof.started <= proof.finished &&
    proof.success === true &&
    Number.isFinite(proof.finished) &&
    now >= proof.finished
  );
}

export function runtimeEnvironment(env) {
  const metadata =
    /^(npm_(command|execpath|lifecycle_event|lifecycle_script|node_execpath|package_.*)|GIT_REFLOG_ACTION|GIT_PREFIX|QUALITY_DIFF_BASE)$/;
  return Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => !metadata.test(key))
      .sort(),
  );
}
