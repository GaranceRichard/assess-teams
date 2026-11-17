import { createHash } from "node:crypto";
import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { reviewedLicenses } from "./swagger-inputs.mjs";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function verify(directory) {
  const root = resolve(directory);
  const manifest = JSON.parse(readFileSync(join(root, "manifest.json")));
  if (
    manifest.format !== 1 ||
    manifest.product !== "assess-teams" ||
    manifest.kind !== "normal" ||
    manifest.buildCommand !== "npm run build --prefix frontend"
  )
    throw new Error("Normal product build required; demo refused");
  if (manifest.swagger?.precompiledAccepted !== false)
    throw new Error("Precompiled Swagger refused (I02)");
  const attributed = (entries) =>
    Array.isArray(entries) &&
    entries.length > 0 &&
    new Set(entries.map((entry) => entry.path)).size === entries.length &&
    entries.every(
      (entry) =>
        typeof entry.path === "string" &&
        !/[\\:]/.test(entry.path) &&
        !entry.path
          .split("/")
          .some((part) => !part || part === "." || part === "..") &&
        /^[a-f0-9]{64}$/.test(entry.sha256),
    );
  if (
    !/^[a-f0-9]{40}$/.test(manifest.sourceCommit) ||
    !attributed(manifest.sourceInputs) ||
    !attributed(manifest.preparationInputs)
  )
    throw new Error("Untraceable artifact provenance");
  const actual = [];
  function walk(folder, prefix = "") {
    for (const name of readdirSync(folder)) {
      const path = prefix + name;
      const stat = lstatSync(join(folder, name));
      if (stat.isSymbolicLink()) throw new Error(`Symlink refused: ${path}`);
      if (stat.isDirectory()) walk(join(folder, name), `${path}/`);
      else if (path !== "manifest.json") actual.push(path);
    }
  }
  walk(root);
  if (
    new Set(manifest.files.map((file) => file.path)).size !==
    manifest.files.length
  )
    throw new Error("Duplicate manifest path");
  if (
    JSON.stringify(actual.sort()) !==
    JSON.stringify(manifest.files.map((file) => file.path).sort())
  )
    throw new Error("Missing or unexpected artifact file");
  for (const file of manifest.files) {
    if (file.path.startsWith("/") || file.path.split("/").includes(".."))
      throw new Error(`Unsafe manifest path: ${file.path}`);
    const bytes = readFileSync(join(root, file.path));
    if (file.size !== bytes.length || file.sha256 !== hash(bytes))
      throw new Error(`Altered artifact: ${file.path}`);
    if (
      /(^|\/)(node_modules|src)(\/|$)|(^|\/)package(-lock)?\.json$|\.tsx?$/.test(
        file.path,
      ) &&
      !file.path.includes("/legal/")
    )
      throw new Error(`Build on target refused: ${file.path}`);
  }
  if (hash(JSON.stringify(manifest.files)) !== manifest.payloadSha256)
    throw new Error("Payload manifest digest mismatch");
  const html = readFileSync(join(root, "frontend/index.html"), "utf8");
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(
    (match) => match[1],
  );
  for (const reference of references) {
    if (!reference.startsWith("/assets/"))
      throw new Error(`Non-local build asset: ${reference}`);
    readFileSync(join(root, "frontend", reference));
  }
  const scripts = manifest.files
    .filter((file) => /^frontend\/assets\/.*\.js$/.test(file.path))
    .map((file) => readFileSync(join(root, file.path), "utf8"))
    .join("\n");
  if (
    !scripts.includes("/api/session/login/") ||
    !scripts.includes("/api/session/logout/")
  )
    throw new Error("Real authentication adapters required; demo refused");
  for (const name of [
    "LICENSE.txt",
    "NOTICE.txt",
    "THIRD-PARTY.txt",
    "index.html",
  ])
    readFileSync(join(root, "frontend/legal", name));
  const swagger = join(root, "static/swagger-ui");
  if (
    hash(readFileSync(join(swagger, "swagger-ui-bundle.js"))) ===
    "e6a898692f2d768e807c3ba4626068a69a2c5dd960dd6c76f3e4d3a3de180af2"
  )
    throw new Error("Untraceable precompiled Swagger refused (I02)");
  for (const name of [
    "swagger-ui-bundle.js",
    "swagger-ui-standalone-preset.js",
    "swagger-ui.css",
    "favicon-32x32.png",
    "oauth2-redirect.html",
    "oauth2-redirect.js",
    "LICENSE",
    "NOTICE",
  ])
    if (!readFileSync(join(swagger, name)).length)
      throw new Error(`Empty Swagger resource: ${name}`);
  const components = JSON.parse(readFileSync(join(swagger, "components.json")));
  if (!components.length)
    throw new Error("Missing Swagger component provenance");
  for (const component of components) {
    if (
      !component.version ||
      !reviewedLicenses.has(component.license) ||
      !component.resolved ||
      !/^[a-f0-9]{64}$/.test(component.sha256) ||
      !component.notices?.length
    )
      throw new Error(`Untraceable Swagger component: ${component.path}`);
    for (const notice of component.notices) {
      const path = join(
        swagger,
        "legal",
        component.path.replaceAll("/", "_"),
        notice.file,
      );
      if (hash(readFileSync(path)) !== notice.sha256)
        throw new Error(`Altered license: ${component.path}/${notice.file}`);
    }
  }
  return manifest;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const manifest = verify(process.argv[2]);
  console.log(`PASS ${manifest.files.length} files; ${manifest.payloadSha256}`);
}
