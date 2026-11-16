import { createHash } from "node:crypto";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

export const reviewedLicenses = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "Unlicense",
  "(MPL-2.0 OR Apache-2.0)",
  "(MIT AND BSD-3-Clause)",
]);

// Explicit input parameter: these are the MEP-057 tables, not a fresh resolution.
export function inventory(directory) {
  const entries = new Map();
  for (const part of [1, 2]) {
    const text = readFileSync(
      join(directory, `swagger-components-${part}.md`),
      "utf8",
    );
    for (const line of text.split("\n")) {
      const cells = line.split("|").map((cell) => cell.trim());
      if (!/^[a-f0-9]{64}$/.test(cells[4])) continue;
      entries.set(`node_modules/${cells[1]}`, {
        version: cells[2],
        license: cells[3],
        sha256: cells[4],
        resolved: cells[5].match(/\((https:[^)]+)\)/)[1],
      });
    }
  }
  for (let part = 1; part <= 7; part++) {
    const text = readFileSync(
      join(directory, `swagger-build-${part}.md`),
      "utf8",
    );
    for (const line of text.split("\n")) {
      const cells = line.split("|").map((cell) => cell.trim());
      if (!cells[3]?.startsWith("sha")) continue;
      const name = cells[1].split("node_modules/").at(-1);
      const key = `node_modules/${cells[1]}`;
      entries.set(key, {
        ...entries.get(key),
        version: cells[2],
        integrity: cells[3],
        license: cells[4],
        resolved: `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-${cells[2]}.tgz`,
      });
    }
  }
  return entries;
}

export async function verifyArchive(component, source, cache, python) {
  mkdirSync(cache, { recursive: true });
  const file = join(cache, component.path.replaceAll("/", "_") + ".tgz");
  if (!existsSync(file)) {
    const response = await fetch(component.resolved);
    if (!response.ok)
      throw new Error(`Archive HTTP ${response.status}: ${component.resolved}`);
    writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  }
  const bytes = readFileSync(file);
  const digest = (algorithm, encoding) =>
    createHash(algorithm).update(bytes).digest(encoding);
  if (component.sha256 && digest("sha256", "hex") !== component.sha256)
    throw new Error(`Archive hash mismatch: ${component.path}`);
  if (component.integrity) {
    const [algorithm, expected] = component.integrity.split("-");
    if (digest(algorithm, "base64") !== expected)
      throw new Error(`Archive SRI mismatch: ${component.path}`);
  }
  if (!component.sha256 && !component.integrity)
    throw new Error(`Unpinned archive: ${component.path}`);
  // Verify installed package bytes, including source files and legal material.
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
            raise ValueError('Unsafe archive path')
        installed = root.joinpath(*parts)
        if installed.read_bytes() != archive.extractfile(member).read():
            raise ValueError('Installed bytes differ: ' + str(installed))
`,
      file,
      join(source, component.path),
    ],
    { stdio: "pipe" },
  );
  return digest("sha256", "hex");
}
