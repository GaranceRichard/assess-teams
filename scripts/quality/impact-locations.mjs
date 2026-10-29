// Audited outputs, never globbed by a build or consumed as test fixtures.
// A new location/asset requires a dependency review here, not just a suffix match.
const evidence = new Set([
  "docs/quality/ux-transitions/continuite-desktop.webm",
  "docs/quality/ux-transitions/zoom-200.webm",
  "docs/quality/ux-transitions/question-debut.png",
  "docs/quality/ux-transitions/question-milieu.png",
  "docs/quality/ux-transitions/question-fin.png",
]);
export const evidenceAsset = (path) => evidence.has(path);
export const evidenceAssets = [...evidence];

export const pureDocument = (path) =>
  [
    "README.md",
    "AGENTS.md",
    "docs/README.md",
    "docs/development-environments.md",
  ].includes(path) ||
  /^docs\/(backlog|quality|architecture|product|operations)\/.*\.md$/.test(
    path,
  );

const browserConfigs = new Set([
  "frontend/playwright.config.ts",
  "frontend/playwright.demo.config.ts",
  "frontend/playwright.merge.config.ts",
]);
const frontendConfigs = new Set([
  "frontend/vite.config.ts",
  "frontend/vite.demo.config.ts",
  "frontend/eslint.config.js",
  "frontend/tsconfig.json",
  "frontend/tsconfig.app.json",
  "frontend/tsconfig.node.json",
]);

export function toolingImpact(path) {
  if (
    browserConfigs.has(path) ||
    /^frontend\/(e2e|demo-e2e)\/[^/]+\.ts$/.test(path)
  )
    return {
      kind: "e2e-tooling",
      frontendTests: ["frontend/src/browserGates.test.ts"],
      reason:
        "Outillage navigateur: gates, configurations reelles/shards, statiques frontend et E2E complets; aucun chargeur pytest",
    };
  if (frontendConfigs.has(path) || /^frontend\/src\/(test|demo)\//.test(path))
    return {
      kind: "frontend-tooling",
      reason:
        "Outillage frontend/demo: tests des gates, frontend complet et E2E; aucun consommateur backend",
    };
  return null;
}
