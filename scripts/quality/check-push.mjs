import { readFileSync } from "node:fs";
import { pushRange } from "./changes.mjs";

try {
  pushRange(process.argv[2], readFileSync(0, "utf8"));
  console.log(
    "[PASS] HEAD, branche distante dediee, main de base et absence de reecriture conformes",
  );
} catch (error) {
  console.error(`[FAIL] ${error.message}`);
  process.exitCode = 1;
}
