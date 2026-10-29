// Shared animation/layout primitives remain broad: focus, overlays and geometry
// affect every route. Only previously audited component boundaries are narrow.
const journeys = {
  "frontend/src/DashboardPage.tsx": ["dashboard.spec.ts"],
  "frontend/src/DashboardActivity.tsx": ["dashboard.spec.ts"],
  "frontend/src/ProductSidebar.tsx": [
    "sidebar-layout.spec.ts",
    "brand-logo.spec.ts",
    "product-shell.spec.ts",
  ],
  "frontend/src/SidebarLink.tsx": ["sidebar-layout.spec.ts"],
};

export function frontendImpact(path, patch, security, securityCode) {
  if (
    /^frontend\/src\//.test(path) &&
    (security.test(path) ||
      securityCode.test(patch) ||
      /fetch\(|localStorage|contract/i.test(path + patch))
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
  if (/^frontend\/src\/.*\.(ts|tsx|css)$/.test(path)) {
    const ui = ![
      "frontend/src/dateInputValue.ts",
      "frontend/src/appreciationForScore.ts",
      "frontend/src/collectionPage.ts",
    ].includes(path);
    return {
      kind: "frontend-related",
      related: [path],
      e2e: ui
        ? journeys[path]?.map((name) => `frontend/e2e/${name}`) || ["*"]
        : [],
      reason: !ui
        ? "Dependants transitifs Vitest"
        : journeys[path]
          ? "Composant audite: dependants Vitest, parcours cartographies et demo"
          : "UI sans frontiere prouvee: dependants Vitest et tous les E2E; aucun impact pytest",
    };
  }
  return null;
}
