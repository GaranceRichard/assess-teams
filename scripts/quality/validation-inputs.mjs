import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export const documentationOnly = (path) =>
  path === "README.md" ||
  path === "AGENTS.md" ||
  (/^docs\/.*\.md$/.test(path) && !path.startsWith("docs/legal/"));

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
    if (present) hash.update(readFileSync(path));
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

export function runtimeContext(root, env) {
  const python = pythonPath(root);
  const context = {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    python: execFileSync(python, ["--version"], { env }).toString().trim(),
    packages: execFileSync(python, ["-m", "pip", "freeze", "--all"], {
      env,
    }).toString(),
    environment: runtimeEnvironment(env),
  };
  return { files: [...gitFiles(root), ...localInputFiles(root)], context };
}

export function localInputFiles(root) {
  const files = [];
  for (const directory of ["", "backend", "frontend"]) {
    for (const name of readdirSync(resolve(root, directory))) {
      if (name === ".env" || name.startsWith(".env."))
        files.push(`${directory ? directory + "/" : ""}${name}`);
    }
  }
  for (const directory of ["", "frontend"]) {
    const file = `${directory ? directory + "/" : ""}node_modules/.package-lock.json`;
    if (!existsSync(resolve(root, file)))
      throw new Error(`Runtime npm absent: ${file}`);
    files.push(file);
  }
  return files;
}

export function reusable(proof, key, now = Date.now()) {
  return (
    proof?.key === key &&
    proof.success === true &&
    Number.isFinite(proof.finished) &&
    now >= proof.finished &&
    now - proof.finished < 8 * 60 * 60 * 1000
  );
}

export function runtimeEnvironment(env) {
  const metadata =
    /^(npm_(command|execpath|lifecycle_event|lifecycle_script|node_execpath|package_.*)|GIT_REFLOG_ACTION|GIT_PREFIX)$/;
  return Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => !metadata.test(key))
      .sort(),
  );
}
