import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve, relative } from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { verify } from "./verify.mjs";

const root = resolve(import.meta.dirname, "../..");
const [swaggerArgument, outputArgument] = process.argv.slice(2);
if (!swaggerArgument || !outputArgument)
  throw new Error("Expected Swagger build and output");
const swagger = resolve(swaggerArgument);
const output = resolve(outputArgument);
if (existsSync(output))
  throw new Error("Output must be absent; stale outputs are refused");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const sourcePaths = [
  "frontend",
  "scripts/legal",
  "docs/legal",
  "LICENSE",
  "NOTICE",
  "backend/config",
  "backend/requirements.txt",
  "docs/operations/distribution-inventory",
];
const preparationPaths = [
  "frontend-artifact.mjs",
  "offline-test.mjs",
  "swagger-build.cjs",
  "swagger-inputs.mjs",
  "swagger-notices.mjs",
  "verify.mjs",
  "verify.test.mjs",
].map((name) => `scripts/distribution/${name}`);
if (
  git(
    "status",
    "--porcelain",
    "--untracked-files=all",
    "--",
    ...sourcePaths,
    ...preparationPaths,
  )
)
  throw new Error("Uncommitted artifact input; source attribution refused");
if (Object.keys(process.env).some((name) => name.startsWith("VITE_")))
  throw new Error("Unrecorded VITE environment override");
if (readdirSync(join(root, "frontend")).some((name) => name.startsWith(".env")))
  throw new Error("Unrecorded Vite environment file");
execSync("npm run build --prefix frontend", { cwd: root, stdio: "inherit" });
mkdirSync(output, { recursive: true });
cpSync(join(root, "frontend/dist"), join(output, "frontend"), {
  recursive: true,
});
const staticRoot = join(output, "static/swagger-ui");
mkdirSync(staticRoot, { recursive: true });
const swaggerFiles = [
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
  "swagger-ui.css",
  "favicon-32x32.png",
  "oauth2-redirect.html",
  "oauth2-redirect.js",
  "swagger-ui-bundle.js.LICENSE.txt",
  "swagger-ui-standalone-preset.js.LICENSE.txt",
  "LICENSE",
  "NOTICE",
  "components.json",
];
for (const file of swaggerFiles)
  cpSync(join(swagger, file), join(staticRoot, file));
for (const name of ["bundle", "standalone", "stylesheets"]) {
  const stats = JSON.parse(readFileSync(join(swagger, `${name}-stats.json`)));
  for (const asset of stats.assets) {
    if (asset.size && !swaggerFiles.includes(asset.name))
      throw new Error(`Unselected Swagger resource: ${asset.name}`);
  }
}
// CSS maps are preparation evidence, not a browser dependency of the delivered CSS.
const css = join(staticRoot, "swagger-ui.css");
writeFileSync(
  css,
  readFileSync(css, "utf8").replace(/\/\*# sourceMappingURL=.*?\*\//g, ""),
);
cpSync(join(swagger, "legal"), join(staticRoot, "legal"), { recursive: true });
mkdirSync(join(output, "provenance"));
for (const name of ["bundle", "standalone", "stylesheets"]) {
  const text = readFileSync(join(swagger, `${name}-stats.json`), "utf8");
  // Keep module paths portable; preserve every module and compilation diagnostic.
  const match = text.match(/([A-Z]:\\\\[^"\n]+?swagger-ui-5\.35\.0)/);
  const portable = match ? text.split(match[1]).join("<swagger-source>") : text;
  writeFileSync(join(output, "provenance", `${name}-stats.json`), portable);
}
const inputPaths = git("ls-files", ...sourcePaths)
  .split("\n")
  .filter(Boolean);
const attribute = (path) => ({
  path,
  sha256: hash(readFileSync(join(root, path))),
});
const sourceInputs = inputPaths.map(attribute);
const preparationInputs = preparationPaths.map(attribute);
function files(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink refused: ${path}`);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const payload = files(output)
  .map((path) => ({
    path: relative(output, path).replaceAll("\\", "/"),
    size: readFileSync(path).length,
    sha256: hash(readFileSync(path)),
  }))
  .sort((a, b) => a.path.localeCompare(b.path, "en"));
const routes = [
  ...readFileSync(join(root, "frontend/src/navigation.ts"), "utf8").matchAll(
    /path: "([^"]+)"/g,
  ),
].map((match) => match[1]);
const manifest = {
  format: 1,
  product: "assess-teams",
  kind: "normal",
  version: "0.0.0",
  sourceCommit: git("rev-parse", "HEAD"),
  buildCommand: "npm run build --prefix frontend",
  preparation: {
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    python: execFileSync(
      join(
        root,
        "backend/.venv",
        process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
      ),
      ["--version"],
      { encoding: "utf8" },
    ).trim(),
    npm: execSync("npm --version", { encoding: "utf8" }).trim(),
  },
  sourceInputs,
  preparationInputs,
  swagger: {
    version: "5.35.0",
    sourceSha256:
      "d03263e1c65ad147f35c0deeadc937c42f387accef31455d744906b43b6b8a59",
    lockSha256:
      "7c2b062a17b882712ea3a6ed32904a7a283ca777fd94144346b545ef0e942f46",
    metadataBuildTime: "1970-01-01T00:00:00.000Z",
    precompiledAccepted: false,
  },
  routes: [
    "/",
    ...routes,
    "/password/forgot",
    "/password/reset",
    "/invitation/:uid/:token",
  ],
  integration: {
    frontendRoot: "frontend",
    staticRoot: "static",
    apiPrefix: "/api/",
    adminPrefix: "/admin/",
    spaFallback: "frontend/index.html",
    swaggerSettings: {
      SWAGGER_UI_DIST: "/static/swagger-ui",
      SWAGGER_UI_FAVICON_HREF: "/static/swagger-ui/favicon-32x32.png",
      SWAGGER_UI_SETTINGS: {
        deepLinking: true,
        validatorUrl: null,
        queryConfigEnabled: false,
      },
    },
  },
  files: payload,
  payloadSha256: hash(JSON.stringify(payload)),
};
writeFileSync(
  join(output, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
verify(output);
console.log(
  `PASS artifact ${payload.length} files; payload ${manifest.payloadSha256}`,
);
