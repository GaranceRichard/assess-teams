import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const [script, ...scriptArguments] = process.argv.slice(2);
if (!script) {
  console.error("A PowerShell script path is required.");
  process.exit(1);
}

const executable = process.platform === "win32" ? "powershell.exe" : "pwsh";
const policyArguments = process.platform === "win32" ? ["-ExecutionPolicy", "Bypass"] : [];
const result = spawnSync(
  executable,
  ["-NoProfile", ...policyArguments, "-File", resolve(script), ...scriptArguments],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
