// Read-only replay: plans, not synthetic test timings. The baseline is immutable.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { planImpact } from "./impact.mjs";
import { changesBetween } from "./changes.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baseline = "029857a96b730aaf6357c123b429860f56e445a0";
const read = (file) =>
  execFileSync("git", ["show", `${baseline}:${file}`], {
    cwd: root,
    encoding: "utf8",
  });
const moduleURL = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const classification = moduleURL(
  read("scripts/quality/impact-classification.mjs"),
);
const previous = await import(
  moduleURL(
    read("scripts/quality/impact.mjs").replaceAll(
      "./impact-classification.mjs",
      classification,
    ),
  )
);
const scopes = (plan) => plan.checks.map(({ scope }) => scope);

for (const [name, changes, exhaustive = false] of [
  ["css", ["frontend/src/transitions.css"]],
  ["navigation", ["frontend/src/ProductSidebar.tsx"]],
  ["e2e", ["frontend/e2e/transitions.spec.ts"]],
  ["demo-selector", ["frontend/demo-e2e/date-presentation.spec.ts"]],
  ["playwright", ["frontend/playwright.config.ts"]],
  ["evidence", ["docs/quality/ux-transitions/question-milieu.png"]],
  ["business", ["backend/notifications/errors.py"]],
  ["api", ["backend/assessments/adapters/api/views.py"]],
  ["permissions", ["backend/identities/adapters/api/admin_permissions.py"]],
  ["sqlite", ["backend/config/sqlite_contention.py"]],
  ["migration", ["backend/assessments/migrations/0001_initial.py"]],
  ["transverse", ["scripts/quality/impact.mjs"]],
  ["MESS", [], true],
]) {
  const before = previous.planImpact(changes, { exhaustive });
  const after = planImpact(changes, { exhaustive });
  console.log(
    JSON.stringify({
      scenario: name,
      baseline,
      changes,
      before: scopes(before),
      after: scopes(after),
      retained: scopes(before).filter((scope) => scopes(after).includes(scope)),
      removed: scopes(before).filter((scope) => !scopes(after).includes(scope)),
      checks: after.checks,
    }),
  );
}

for (const sha of [
  "37ea6d7",
  "09c8c09",
  "6c3a608",
  "483c962",
  "c7efd22",
  "618e9a8",
  "0544f1e",
  "eede631",
  "029857a",
]) {
  const { changes, candidate } = changesBetween(root, `${sha}^`, sha);
  const before = previous.planImpact(changes);
  const after = planImpact(changes);
  console.log(
    JSON.stringify({
      commit: candidate,
      baseline,
      before: scopes(before),
      after: scopes(after),
      previousEscalations: before.classifications.filter(
        ({ kind }) => kind === "full",
      ),
      currentEscalations: after.classifications.filter(
        ({ kind }) => kind === "full",
      ),
    }),
  );
}
