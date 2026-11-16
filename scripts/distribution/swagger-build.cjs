// Preparation only: rebuild the inventoried source; never copy its JS dist.
const { createHash } = require("node:crypto");
const {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} = require("node:fs");
const { resolve, join } = require("node:path");
const { createRequire } = require("node:module");
const { execFileSync } = require("node:child_process");

const [sourceArgument, outputArgument] = process.argv.slice(2);
if (!sourceArgument || !outputArgument)
  throw new Error("Expected source and output");
const source = resolve(sourceArgument);
const output = resolve(outputArgument);
const hash = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const sourceHash =
  "d03263e1c65ad147f35c0deeadc937c42f387accef31455d744906b43b6b8a59";
if (hash(join(source, "../swagger-ui-v5.35.0-source.tar.gz")) !== sourceHash)
  throw new Error("Swagger source archive mismatch");
if (
  hash(join(source, "package-lock.json")) !==
  "7c2b062a17b882712ea3a6ed32904a7a283ca777fd94144346b545ef0e942f46"
)
  throw new Error("Swagger lock mismatch");
const python = resolve(
  __dirname,
  "../../backend/.venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
execFileSync(
  python,
  [
    "-c",
    `
import pathlib, sys, tarfile
root = pathlib.Path(sys.argv[2])
with tarfile.open(sys.argv[1]) as archive:
    for member in archive.getmembers():
        if not member.isfile():
            continue
        parts = pathlib.PurePosixPath(member.name).parts[1:]
        if '..' in parts or not parts:
            raise ValueError('Unsafe source archive path')
        if root.joinpath(*parts).read_bytes() != archive.extractfile(member).read():
            raise ValueError('Swagger source differs: ' + member.name)
`,
    join(source, "../swagger-ui-v5.35.0-source.tar.gz"),
    source,
  ],
  { stdio: "pipe" },
);
const upstream = createRequire(join(source, "package.json"));
const webpack = upstream("webpack");
const helpers = upstream("./webpack/_helpers.js");
helpers.getRepoInfo = () => ({
  hash: `source-sha256:${sourceHash}`,
  dirty: false,
});
process.chdir(source);
process.env.NODE_ENV = "production";
process.env.BABEL_ENV = "production";
mkdirSync(output, { recursive: true });

async function compile(name, browsers) {
  process.env.BROWSERSLIST_ENV = browsers;
  const config = upstream(`./webpack/${name}.js`);
  config.context = source;
  config.output.path = output;
  // Upstream includes wall-clock build time. Fix only that metadata for reproducibility.
  for (const plugin of config.plugins) {
    if (plugin.definitions?.buildInfo) {
      const info = JSON.parse(plugin.definitions.buildInfo);
      info.BUILD_TIME = new Date(0).toUTCString();
      plugin.definitions.buildInfo = JSON.stringify(info);
    }
  }
  const compiler = webpack(config);
  await new Promise((done, reject) =>
    compiler.run((error, stats) => {
      if (error) return reject(error);
      const report = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
        modules: true,
        nestedModules: true,
        assets: true,
      });
      writeFileSync(
        join(output, `${name}-stats.json`),
        JSON.stringify(report, null, 2),
      );
      compiler.close((closeError) => {
        if (closeError || stats.hasErrors())
          reject(closeError || new Error(JSON.stringify(report.errors)));
        else done();
      });
    }),
  );
  console.log(`PASS Swagger ${name}`);
}

(async () => {
  await compile("stylesheets", "browser-production");
  const css = join(output, "swagger-ui.css");
  writeFileSync(css, readFileSync(css, "utf8").replace(/\*zoom/g, "zoom"));
  await compile("bundle", "isomorphic-production");
  await compile("standalone", "browser-production");
  copyFileSync(
    join(source, "dist/favicon-32x32.png"),
    join(output, "favicon-32x32.png"),
  );
  for (const file of ["LICENSE", "NOTICE"])
    copyFileSync(join(source, file), join(output, file));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
