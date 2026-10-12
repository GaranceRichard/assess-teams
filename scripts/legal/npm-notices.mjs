import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

export const permissiveLicenses = new Set([
  "MIT",
  "MIT-0",
  "ISC",
  "0BSD",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "CC0-1.0",
  "BlueOak-1.0.0",
]);

export function collectNpm(root, { includeDev = false } = {}) {
  const lock = JSON.parse(
    readFileSync(join(root, "package-lock.json"), "utf8"),
  );
  const components = [];
  for (const [path, pkg] of Object.entries(lock.packages)) {
    if (!path || (!includeDev && pkg.dev)) continue;
    const directory = join(root, path);
    if (!existsSync(directory) && pkg.optional) continue;
    if (!existsSync(directory)) throw new Error(`Missing component : ${path}`);
    const installed = JSON.parse(
      readFileSync(join(directory, "package.json"), "utf8"),
    );
    if (installed.version !== pkg.version)
      throw new Error(`Installed version mismatch : ${path}`);
    if (!pkg.license) throw new Error(`Unknown license : ${path}`);
    if (!includeDev && !permissiveLicenses.has(pkg.license)) {
      throw new Error(`License review required : ${path} (${pkg.license})`);
    }
    const notices = readdirSync(directory)
      .filter((name) =>
        /^(licen[sc]e|copying|notice|authors)([.-]|$)/i.test(name),
      )
      .map((name) => ({
        name,
        text: readFileSync(join(directory, name), "utf8"),
      }));
    if (!notices.some(({ name }) => /^(licen[sc]e|copying)/i.test(name))) {
      throw new Error(`Missing license text : ${path}`);
    }
    components.push({
      name: path.split("node_modules/").at(-1),
      version: pkg.version,
      license: pkg.license,
      path,
      notices,
    });
  }
  return components.sort((a, b) => a.path.localeCompare(b.path));
}

export function renderNotices(components) {
  return components
    .map(
      ({ name, version, license, notices }) =>
        `${name} ${version} - ${license}\n` +
        notices
          .map(({ name: file, text }) => `--- ${basename(file)} ---\n${text}`)
          .join("\n"),
    )
    .join("\n\n");
}
