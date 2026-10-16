import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
} from "node:fs";
import { resolve } from "node:path";

// Hash installed bytes, not timestamps or just declared versions. Never persist raw inputs.
// Only interpreter bytecode and tool caches are generated from already covered sources.
export function installedKey(directory) {
  const hash = createHash("sha256");
  const stack = new Set();
  function visit(path, name) {
    const stat = lstatSync(path);
    hash.update(JSON.stringify([name, stat.mode]));
    if (stat.isSymbolicLink()) {
      hash.update(readlinkSync(path));
      visit(realpathSync(path), name + "->");
    } else if (stat.isDirectory()) {
      const physical = realpathSync(path);
      if (stack.has(physical))
        throw new Error("Cycle dans les dependances installees");
      stack.add(physical);
      for (const entry of readdirSync(path).sort()) {
        if (
          entry === "__pycache__" ||
          (name === "." && [".vite", ".vite-temp"].includes(entry))
        )
          continue;
        visit(resolve(path, entry), name + "/" + entry);
      }
      stack.delete(physical);
    } else if (stat.isFile()) hash.update(readFileSync(path));
    else throw new Error("Type de dependance installee non verifiable");
    hash.update("\0");
  }
  visit(directory, ".");
  return hash.digest("hex");
}

export function toolContext(root, env, python, scope) {
  const frontend = scope.startsWith("frontend");
  const backend = scope.startsWith("backend");
  const context = {};
  const query = (exe, args, cwd = root) => {
    try {
      return execFileSync(exe, args, {
        cwd,
        env,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    } catch {
      throw new Error("Runtime de validation absent ou non verifiable");
    }
  };
  const shell = process.platform === "win32" ? "powershell.exe" : "pwsh";
  context.tools = query(shell, [
    "-NoProfile",
    "-Command",
    "$PSVersionTable.PSVersion.ToString(); & npm --version; if ($LASTEXITCODE) { exit $LASTEXITCODE }",
  ]);
  context.rootPackages = installedKey(resolve(root, "node_modules"));
  if (!backend)
    context.frontendPackages = installedKey(
      resolve(root, "frontend/node_modules"),
    );
  if (!frontend) {
    const info = JSON.parse(
      query(python, [
        "-c",
        "import json,sys,sqlite3,sysconfig; print(json.dumps(dict(version=sys.version, sqlite=sqlite3.sqlite_version, paths=sorted(set([sysconfig.get_path('purelib'),sysconfig.get_path('platlib')])))))",
      ]),
    );
    context.python = info.version;
    context.sqlite = info.sqlite;
    context.packages = query(python, ["-m", "pip", "freeze", "--all"]);
    context.installedPython = info.paths.map(installedKey);
    context.unbounded = unboundedPython(info.paths, context.packages);
  }
  if (scope.startsWith("e2e")) {
    // Both headed Chromium and Playwright's headless shell can be selected by configuration.
    const paths = JSON.parse(
      query(process.execPath, [
        "--input-type=module",
        "-e",
        "import core from './frontend/node_modules/playwright-core/lib/coreBundle.js'; const registry = core.registry.registry; console.log(JSON.stringify(['chromium','chromium-headless-shell'].map(name=>registry.findExecutable(name).executablePath())))",
      ]),
    );
    context.browsers = paths.map((path) => installedKey(resolve(path, "..")));
  }
  return context;
}

// External code loaders can change bytes outside the identified dependency trees.
// Keep validation available, but require fresh execution for these unbounded inputs.
export function requiresFreshRuntime(env) {
  return Object.entries(env).some(
    ([name, value]) =>
      value &&
      /^(NODE_OPTIONS|NODE_PATH|PYTHONPATH|PYTHONHOME|COVERAGE_PROCESS_START|COVERAGE_PROCESS_CONFIG|COV_CORE_.*|LD_PRELOAD|LD_LIBRARY_PATH|DYLD_INSERT_LIBRARIES|DYLD_LIBRARY_PATH)$/i.test(
        name,
      ),
  );
}

export function unboundedPython(paths, packages) {
  // Audited wheel loaders only import covered coverage/pytest-cov/setuptools code.
  const audited = [
    "distutils-precedence.pth",
    "a1_coverage.pth",
    "pytest-cov.pth",
  ];
  return (
    /^-e /m.test(packages) ||
    paths.some((path) =>
      readdirSync(path).some(
        (name) => name.endsWith(".pth") && !audited.includes(name),
      ),
    )
  );
}
