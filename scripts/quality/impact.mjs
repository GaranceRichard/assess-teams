import { dependencyContext } from "./dependency-context.mjs";
import { classify, fullScopes } from "./impact-classification.mjs";
export {
  classify,
  fullScopes,
  pureDocument,
} from "./impact-classification.mjs";

export function planImpact(changes, { exhaustive = false, root } = {}) {
  const context = exhaustive ? undefined : dependencyContext(root);
  const classifications = changes.map((change) => ({
    path: typeof change === "string" ? change : change.path,
    ...classify(change, context),
  }));
  const full =
    exhaustive || classifications.some(({ kind }) => kind === "full");
  let checks;
  if (full) checks = fullScopes.map((scope) => ({ scope }));
  else if (classifications.every(({ kind }) => kind === "documentation"))
    checks = [{ scope: "documentation" }];
  else {
    const selected = (kind, field = "tests") =>
      [
        ...new Set(
          classifications
            .filter((entry) => entry.kind === kind)
            .flatMap((entry) => entry[field] || []),
        ),
      ].sort();
    const tooling = classifications.some(({ kind }) =>
      kind.endsWith("-tooling"),
    );
    checks = [{ scope: tooling ? "repository" : "documentation" }];
    const backendContract = classifications.some(
      ({ kind }) => kind === "backend-contract",
    );
    const frontendContract =
      backendContract ||
      classifications.some(({ kind }) =>
        ["frontend-contract", "frontend-tooling"].includes(kind),
      );
    if (
      backendContract ||
      classifications.some(({ kind }) => kind === "backend")
    )
      checks.push({ scope: "backend" });
    else if (
      [...selected("backend-targeted"), ...selected("backend-related")].length
    )
      checks.push(
        { scope: "backend-static" },
        {
          scope: "backend-targeted",
          tests: [
            ...new Set([
              ...selected("backend-targeted"),
              ...selected("backend-related"),
            ]),
          ].sort(),
        },
      );
    const related = [
      ...new Set([
        ...selected("frontend-related", "related"),
        ...selected("backend-related", "related"),
      ]),
    ].sort();
    const tests = [
      ...new Set([
        ...selected("frontend-targeted"),
        ...selected("frontend-related", "frontendTests"),
        ...selected("backend-related", "frontendTests"),
        ...selected("e2e-tooling", "frontendTests"),
      ]),
    ].sort();
    if (frontendContract) checks.push({ scope: "frontend" });
    else if (
      related.length ||
      tests.length ||
      tooling ||
      selected("e2e-targeted").length ||
      selected("e2e-demo-targeted").length
    )
      checks.push({ scope: "frontend-static" });
    if (!frontendContract && (related.length || tests.length))
      checks.push({ scope: "frontend-targeted", tests, related });
    const e2e = [
      ...new Set([
        ...selected("frontend-related", "e2e"),
        ...selected("backend-related", "e2e"),
        ...selected("e2e-targeted"),
      ]),
    ].sort();
    const demoTests = [
      ...new Set([
        ...selected("e2e-demo-targeted"),
        ...selected("frontend-related", "demoTests"),
        ...selected("backend-related", "demoTests"),
      ]),
    ].sort();
    if (frontendContract || e2e.includes("*") || tooling)
      checks.push({ scope: "e2e" });
    else if (e2e.length || demoTests.length)
      checks.push({
        scope: "e2e-targeted",
        tests: e2e,
        ...(demoTests.length ? { demoTests } : {}),
        demo: classifications.some(
          (entry) =>
            ["frontend-related", "backend-related"].includes(entry.kind) &&
            entry.demo,
        ),
      });
  }
  const required = new Set(checks.map(({ scope }) => scope.split("-")[0]));
  const skipped = ["backend", "frontend", "e2e"].filter(
    (scope) => !required.has(scope),
  );
  return { version: 3, exhaustive: full, classifications, checks, skipped };
}
