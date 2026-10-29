import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceAssets } from "./impact-locations.mjs";
import { gitFiles } from "./validation-inputs.mjs";

// Container signatures and documentary links are integrity checks, not a visual
// acceptance or an assertion that a video proves the current product behavior.
export function checkEvidence(root, files = gitFiles(root)) {
  const errors = [];
  for (const asset of evidenceAssets) {
    const path = resolve(root, asset);
    const directory = dirname(path);
    const prose = existsSync(directory)
      ? readdirSync(directory)
          .filter((name) => name.endsWith(".md"))
          .map((name) => readFileSync(resolve(directory, name), "utf8"))
          .join("\n")
      : "";
    const referenced = prose.includes(`](${basename(asset)})`);
    if (!existsSync(path)) {
      if (referenced) errors.push(`Preuve referencee absente: ${asset}`);
      continue;
    }
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.mode & 0o111) {
      errors.push(`Preuve non reguliere ou executable: ${asset}`);
      continue;
    }
    const bytes = readFileSync(path);
    const signature = asset.endsWith(".png") ? "89504e470d0a1a0a" : "1a45dfa3";
    if (
      !bytes
        .subarray(0, signature.length / 2)
        .equals(Buffer.from(signature, "hex")) ||
      (asset.endsWith(".png") &&
        !bytes
          .subarray(-12)
          .equals(Buffer.from("0000000049454e44ae426082", "hex")))
    )
      errors.push(`Conteneur de preuve invalide: ${asset}`);
    if (!referenced) errors.push(`Preuve sans lecture documentaire: ${asset}`);
  }
  // Protect the audited output-only boundary. Any new consumer requires review
  // of this inventory and its application fingerprint policy in the same change.
  for (const file of files.filter(
    (name) =>
      /^(backend|frontend|scripts\/legal)\//.test(name) &&
      /\.(py|ts|tsx|js|mjs|json|html|css)$/.test(name),
  )) {
    const path = resolve(root, file);
    if (existsSync(path) && /ux-transitions/.test(readFileSync(path, "utf8")))
      errors.push(`Consommateur de preuves non audite: ${file}`);
  }
  return errors;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkEvidence(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  for (const error of errors) console.error(`[FAIL] ${error}`);
  process.exitCode = errors.length ? 1 : 0;
}
