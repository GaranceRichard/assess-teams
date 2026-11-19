// Reproducible read-only plans. Planning durations are not test-campaign gains.
import { execFileSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { planImpact } from "./impact.mjs";
import { dependencyMeasurements } from "./dependency-measurements.mjs";
import { dependencyContext, repositoryRoot } from "./dependency-context.mjs";

const baseline = "c14e60cf26885e10f7acaf699d4bd521657f2e96";
const modules = new Map();
function previousModule(path) {
  if (modules.has(path)) return modules.get(path);
  const source = execFileSync("git", ["show", `${baseline}:${path}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).replace(/["'](\.\/[^"']+\.mjs)["']/g, (_, dependency) =>
    JSON.stringify(previousModule("scripts/quality/" + dependency.slice(2))),
  );
  const url =
    "data:text/javascript;base64," + Buffer.from(source).toString("base64");
  modules.set(path, url);
  return url;
}

export const scenarios = [
  ["identites-backend", "backend/identities/domain/palettes.py"],
  ["identites-ui", "frontend/src/SuperadminDashboard.tsx"],
  [
    "organisations-backend",
    "backend/identities/application/organization_deletion.py",
  ],
  ["organisations-ui", "frontend/src/OrganizationCreateForm.tsx"],
  ["teams-api", "backend/teams/adapters/api/schema.py"],
  ["teams-ui", "frontend/src/TeamPage.tsx"],
  ["modeles-api", "backend/assessments/adapters/api/score_fields.py"],
  ["modeles-ui", "frontend/src/EvaluationPage.tsx"],
  [
    "planification-backend",
    "backend/assessments/application/schedule_notifications.py",
  ],
  ["planification-ui", "frontend/src/PlanningForm.tsx"],
  ["passations-backend", "backend/assessments/application/taking.py"],
  ["passations-ui", "frontend/src/EvaluationScoreInput.tsx"],
  ["results-backend", "backend/assessments/application/results.py"],
  ["results-radar", "frontend/src/ResultsRadar.tsx"],
  ["results-config", "frontend/src/resultRadarConfig.ts"],
  ["pilotage-backend", "backend/assessments/application/steering.py"],
  ["pilotage-ui", "frontend/src/SteeringPage.tsx"],
  ["journaux-backend", "backend/journals/sanitization.py"],
  ["journaux-ui", "frontend/src/LogEntries.tsx"],
  ["notifications-smtp", "backend/notifications/transport.py"],
  ["infrastructure", "backend/config/settings.py"],
  ["permissions", "backend/teams/adapters/api/permissions.py"],
  ["sessions", "backend/identities/adapters/api/session_views.py"],
  ["styles-partages", "frontend/src/product-layout.css"],
  ["inconnu", "unknown.data"],
  ["nightly", null],
];

export async function compare({ collect = false } = {}) {
  const measurements = collect
    ? await dependencyMeasurements(repositoryRoot)
    : null;
  const previous = await import(previousModule("scripts/quality/impact.mjs"));
  const context = dependencyContext();
  const backend = context.backend(),
    frontend = context.frontend();
  if (backend.error || frontend.error)
    throw new Error(backend.error || frontend.error);
  const inventory = {
    backend: [...backend.graph.keys()].filter((path) =>
      /^backend\/tests\/(?:.*\/)?test_[^/]+\.py$/.test(path),
    ),
    frontend: [...frontend.sources.keys()].filter((path) =>
      /\.test\.tsx?$/.test(path),
    ),
    e2e: [...frontend.sources.keys()].filter(
      (path) => path.startsWith("frontend/e2e/") && path.endsWith(".spec.ts"),
    ),
    demo: [...frontend.sources.keys()].filter(
      (path) =>
        path.startsWith("frontend/demo-e2e/") && path.endsWith(".spec.ts"),
    ),
  };
  const selection = (plan) => {
    const checks = new Map(plan.checks.map((check) => [check.scope, check]));
    const backend = checks.has("backend")
      ? inventory.backend
      : checks.get("backend-targeted")?.tests || [];
    const frontend = checks.has("frontend")
      ? inventory.frontend
      : checks.get("frontend-targeted")?.tests || [];
    const browser = checks.get("e2e-targeted");
    const e2e = checks.has("e2e") ? inventory.e2e : browser?.tests || [];
    const demo =
      checks.has("e2e") || browser?.demo
        ? inventory.demo
        : browser?.demoTests || [];
    return {
      backend,
      frontend,
      e2e,
      demo,
      related: checks.get("frontend-targeted")?.related || [],
      controls: plan.checks.map((check) => check.scope),
      reasons: plan.classifications.map((item) => item.reason),
      counts: {
        backendFiles: backend.length,
        frontendFiles: checks.get("frontend-targeted")?.related?.length
          ? null
          : frontend.length,
        appSpecs: e2e.length,
        demoSpecs: demo.length,
      },
    };
  };
  try {
    for (const [scenario, path] of scenarios) {
      const paths = path ? [path] : [];
      const exhaustive = scenario === "nightly";
      const start = performance.now();
      const after = planImpact(paths, { exhaustive });
      const durationMs = performance.now() - start;
      const before = previous.planImpact(paths, { exhaustive });
      yieldRecord({
        type: "simulated-plan",
        scenario,
        baseline,
        paths,
        durationMs,
        before: measurements
          ? await measurements.resolve(selection(before))
          : selection(before),
        after: measurements
          ? await measurements.resolve(selection(after))
          : selection(after),
        note: "Durees du calcul seulement; fichiers/specs, pas nombre de cas executes. Baseline related resolu par Vitest lors des collections.",
      });
    }
  } finally {
    await measurements?.close();
  }
}
const yieldRecord = (record) => console.log(JSON.stringify(record));
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  await compare({ collect: process.argv.includes("--collections") });
