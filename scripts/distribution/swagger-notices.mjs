import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { resolve, join, dirname, relative } from "node:path";
import {
  inventory,
  verifyArchive,
  reviewedLicenses,
} from "./swagger-inputs.mjs";

const [sourceArgument, buildArgument] = process.argv.slice(2);
const source = resolve(sourceArgument);
const build = resolve(buildArgument);
const lock = JSON.parse(readFileSync(join(source, "package-lock.json")));
const repository = resolve(import.meta.dirname, "../..");
const inputs = inventory(
  join(repository, "docs/operations/distribution-inventory"),
);
const python = join(
  repository,
  "backend/.venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const roots = new Set();
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

function addResource(resource) {
  if (!resource?.includes("node_modules")) return;
  let folder = dirname(resource.split("?")[0]);
  while (folder.startsWith(source) && folder !== source) {
    const key = relative(source, folder).replaceAll("\\", "/");
    if (lock.packages[key]) {
      roots.add(key);
      return;
    }
    folder = dirname(folder);
  }
  throw new Error(`Untraceable module: ${resource}`);
}

function visit(modules = []) {
  for (const module of modules) {
    addResource(module.nameForCondition);
    visit(module.modules);
    visit(module.children);
  }
}
for (const name of ["bundle", "standalone", "stylesheets"])
  visit(JSON.parse(readFileSync(join(build, `${name}-stats.json`))).modules);
const cssMap = JSON.parse(readFileSync(join(build, "swagger-ui.css.map")));
for (const name of cssMap.sources) {
  const index = name.indexOf("node_modules/");
  if (index >= 0) addResource(join(source, name.slice(index)));
}

const components = [];
const failures = [];
const references = new Map([
  ["format@0.2.2", "MIT"],
  ["toggle-selection@1.0.6", "MIT"],
  ["short-unique-id@5.3.2", "Apache-2.0"],
]);
mkdirSync(join(build, "legal"), { recursive: true });
for (const key of [...roots].sort()) {
  const folder = join(source, key);
  const pkg = JSON.parse(readFileSync(join(folder, "package.json")));
  const entry = { ...inputs.get(key), ...lock.packages[key] };
  if (
    pkg.version !== entry.version ||
    !entry.resolved ||
    !(entry.integrity || entry.sha256)
  )
    failures.push(`Version/provenance incomplete: ${key}`);
  const license = entry.license || pkg.license;
  if (!reviewedLicenses.has(license))
    failures.push(`License not reviewed: ${key} (${license})`);
  const files = readdirSync(folder).filter((name) =>
    /^(licen[sc]e|copying|notice|authors)([.-]|$)/i.test(name),
  );
  if (existsSync(join(folder, "LICENSES")))
    files.push(
      ...readdirSync(join(folder, "LICENSES")).map(
        (name) => `LICENSES/${name}`,
      ),
    );
  const reference = references.get(`${pkg.name}@${pkg.version}`);
  // Some published archives embed their complete MIT terms in their README.
  if (!files.some((name) => /^(licen[sc]e|copying)/i.test(name)) || reference) {
    const readme = readdirSync(folder).find((name) =>
      /^readme(\.md)?$/i.test(name),
    );
    if (
      readme &&
      (reference ||
        /Permission is hereby granted[\s\S]*THE SOFTWARE IS PROVIDED/i.test(
          readFileSync(join(folder, readme), "utf8"),
        ))
    )
      files.push(readme);
    else failures.push(`License text missing: ${key} (${license})`);
  }
  const directory = key.replaceAll("/", "_");
  mkdirSync(join(build, "legal", directory), { recursive: true });
  const notices = [];
  if (reference) {
    const origin = `node_modules/@swagger-api/apidom-core/LICENSES/${reference}.txt`;
    const bytes = readFileSync(join(source, origin));
    const name = `${reference}-terms.txt`;
    copyFileSync(join(source, origin), join(build, "legal", directory, name));
    files.push("package.json");
    notices.push({ file: name, sha256: hash(bytes), reference: origin });
  }
  for (const file of files) {
    const path = join(folder, file);
    if (!existsSync(path)) continue;
    try {
      const bytes = readFileSync(path);
      mkdirSync(dirname(join(build, "legal", directory, file)), {
        recursive: true,
      });
      copyFileSync(path, join(build, "legal", directory, file));
      notices.push({ file, sha256: hash(bytes) });
    } catch (error) {
      failures.push(`Unreadable notice ${path}: ${error.message}`);
    }
  }
  const component = {
    path: key,
    name: pkg.name,
    version: pkg.version,
    license,
    resolved: entry.resolved,
    integrity: entry.integrity,
    sha256: entry.sha256,
    notices,
  };
  component.sha256 = await verifyArchive(
    component,
    source,
    join(build, "../archives"),
    python,
  );
  components.push(component);
}
writeFileSync(
  join(build, "components.json"),
  JSON.stringify(components, null, 2) + "\n",
);
if (failures.length) throw new Error(failures.join("\n"));
console.log(
  `PASS ${components.length} traced Swagger components and local notices`,
);
