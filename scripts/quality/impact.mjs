import { classify, fullScopes } from "./impact-classification.mjs";
export {
  classify,
  fullScopes,
  pureDocument,
} from "./impact-classification.mjs";

export function planImpact(changes, { exhaustive = false } = {}) {
  const classifications = changes.map((change) => ({
    path: typeof change === "string" ? change : change.path,
    ...classify(change),
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
    checks = [{ scope: "documentation" }];
    const backendContract = classifications.some(
      ({ kind }) => kind === "backend-contract",
    );
    const frontendContract =
      backendContract ||
      classifications.some(({ kind }) => kind === "frontend-contract");
    if (
      backendContract ||
      classifications.some(({ kind }) => kind === "backend")
    )
      checks.push({ scope: "backend" });
    else if (selected("backend-targeted").length)
      checks.push(
        { scope: "backend-static" },
        { scope: "backend-targeted", tests: selected("backend-targeted") },
      );
    const related = selected("frontend-related", "related");
    const tests = selected("frontend-targeted");
    if (frontendContract) checks.push({ scope: "frontend" });
    else if (related.length || tests.length || selected("e2e-targeted").length)
      checks.push({ scope: "frontend-static" });
    if (!frontendContract && (related.length || tests.length))
      checks.push({ scope: "frontend-targeted", tests, related });
    const e2e = [
      ...new Set([
        ...selected("frontend-related", "e2e"),
        ...selected("e2e-targeted"),
      ]),
    ].sort();
    if (frontendContract || e2e.includes("*")) checks.push({ scope: "e2e" });
    else if (e2e.length)
      checks.push({
        scope: "e2e-targeted",
        tests: e2e,
        demo: selected("frontend-related", "e2e").length > 0,
      });
  }
  const required = new Set(checks.map(({ scope }) => scope.split("-")[0]));
  const skipped = ["backend", "frontend", "e2e"].filter(
    (scope) => !required.has(scope),
  );
  return { version: 2, exhaustive: full, classifications, checks, skipped };
}
