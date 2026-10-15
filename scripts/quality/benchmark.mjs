// Scenario paths simulate an impact class; every selected command runs on real code.
// No application source is edited to benchmark the validation machinery.
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { planImpact } from "./impact.mjs";
import { git } from "./changes.mjs";
import { validatePlan } from "./selective.mjs";
import { contentKey, gitFiles } from "./validation-inputs.mjs";

export const scenarios = {
  backlog: ["docs/backlog/source/07-pre-mep.md"],
  documentation: ["docs/architecture/fundamentals.md"],
  backend: ["backend/journals/adapters/api/filters.py"],
  frontend: ["frontend/src/dateInputValue.ts"],
  sensitive: ["backend/identities/adapters/api/login_security.py"],
  transverse: ["scripts/quality/impact.mjs"],
};

const root = fileURLToPath(new URL("../../", import.meta.url));
const directory = resolve(root, ".cache/quality");
mkdirSync(directory, { recursive: true });
const mode = process.argv[2] || "plans";
if (mode === "plans") {
  for (const [name, files] of Object.entries(scenarios))
    console.log(JSON.stringify({ scenario: name, ...planImpact(files) }));
  for (const scenario of ["nightly", "MESS"])
    console.log(
      JSON.stringify({ scenario, ...planImpact([], { exhaustive: true }) }),
    );
} else {
  const files = scenarios[mode];
  if (!files || ["sensitive", "transverse"].includes(mode))
    throw new Error(
      "Mesures simples: backlog, documentation, backend ou frontend; plans pour tous les scenarios",
    );
  const started = Date.now();
  const range = {
    base: git(root, "rev-parse", "origin/main").trim(),
    candidate: git(root, "rev-parse", "HEAD").trim(),
    working: true,
  };
  const plan = planImpact(files);
  const status = validatePlan(root, range, plan);
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(resolve(directory, "baseline.json")));
  } catch {
    /* Optional historical reference. */
  }
  const measurement = {
    scenario: mode,
    simulatedPaths: files,
    actualControls: true,
    workingTree: true,
    sourceFingerprint: contentKey(root, gitFiles(root), { benchmark: 1 }),
    candidate: range.candidate,
    status,
    durationMs: Date.now() - started,
    baselineMs: baseline?.durationMs,
    checks: plan.checks,
    timestamp: new Date().toISOString(),
  };
  appendFileSync(
    resolve(directory, "scenarios.jsonl"),
    JSON.stringify(measurement) + "\n",
  );
  console.log(JSON.stringify(measurement, null, 2));
  process.exitCode = status;
}
