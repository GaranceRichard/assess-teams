import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { collectNpm, renderNotices } from "./npm-notices.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const includeDev = process.argv.includes("--include-dev");
const components = [
  ...collectNpm(resolve(root, "frontend"), { includeDev }),
  ...(includeDev ? collectNpm(root, { includeDev }) : []),
];
const destination = resolve(root, "build/legal/npm");
mkdirSync(destination, { recursive: true });
writeFileSync(
  resolve(destination, "THIRD-PARTY.txt"),
  renderNotices(components),
);
writeFileSync(
  resolve(destination, "inventory.json"),
  JSON.stringify(
    components.map(({ name, version, license, path, notices }) => ({
      name,
      version,
      license,
      path,
      notices: notices.map(({ name: file, text }) => ({
        file,
        sha256: createHash("sha256").update(text).digest("hex"),
      })),
    })),
    null,
    2,
  ) + "\n",
);
console.log(
  `Notices npm : ${components.length} composants dans ${destination}`,
);
