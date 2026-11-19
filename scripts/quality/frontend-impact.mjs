import { dependents, sorted } from "./dependency-graph.mjs";
import { journeySelection } from "./journey-dependencies.mjs";

export function frontendImpact(path, patch, security, securityCode, context) {
  if (
    /^frontend\/src\//.test(path) &&
    (security.test(path) ||
      path === "frontend/src/navigation.ts" ||
      securityCode.test(patch) ||
      /fetch\s*\(|localStorage|contract/i.test(path + patch))
  )
    return {
      kind: "frontend-contract",
      reason:
        "Securite ou contrat frontend: frontend complet et tous les parcours",
    };
  if (/^frontend\/src\/.*\.test\.tsx?$/.test(path))
    return {
      kind: "frontend-targeted",
      tests: [path],
      reason: "Test frontend isole",
    };
  if (!/^frontend\/src\/.*\.(ts|tsx|css)$/.test(path)) return null;
  const frontend = context?.frontend();
  if (!frontend || frontend.error || !frontend.graph.has(path))
    return {
      kind: "full",
      reason: "Dependances frontend absentes ou non analysables",
    };
  const reached = dependents(frontend.graph, [path]);
  const proven = dependents(frontend.graph, [path], false);
  const isTest = (item) => frontend.caseFiles.has(item);
  if (!Array.from(proven).some(isTest) || frontend.opaque.has(path))
    return {
      kind: "full",
      reason: "Aucun test composant prouve ou import dynamique",
    };
  const frontendTests = sorted([...reached].filter(isTest));
  const ui =
    path.endsWith(".css") ||
    [...reached].some(
      (file) => file.endsWith(".tsx") && !/\.test\./.test(file),
    );
  // Utility leaves with only test consumers have no browser behavior.
  const journeys = ui ? journeySelection(frontend, [path]) : {};
  if (frontend.globalStyles.has(path))
    return {
      kind: "frontend-related",
      related: [path],
      frontendTests,
      e2e: ["*"],
      demo: true,
      reason: "Style global ou frontiere CSS non demontree: tous les parcours",
    };
  return {
    kind: "frontend-related",
    related: [path],
    frontendTests,
    ...journeys,
    reason: ui
      ? "Importeurs transitifs Vitest et pages/parcours consommateurs recalcules"
      : "Dependants transitifs Vitest; aucune UI consommatrice",
  };
}
