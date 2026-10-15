// Fail closed: only reviewed locations qualify as prose or isolated changes.
export const fullScopes = ["repository", "backend", "frontend", "e2e"];
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

const sensitive =
  /(^|\/)(config|migrations|identities)\/|permission|auth|session|password|transaction|sqlite|models|services|views|serializ|contract/i;
const transverse =
  /^(scripts|\.github|\.githooks)\/|(^|\/)(package[^/]*\.json|.*lock[^/]*|requirements[^/]*|pyproject\.toml|.*config[^/]*|\.coveragerc)$/i;
// These leaves have no UI contract; unmapped Python changes use the whole backend.
const backendLeaves = {
  "backend/journals/adapters/api/filters.py": [
    "backend/tests/test_log_filters.py",
    "backend/tests/test_activity_journal.py",
    "backend/tests/test_logs_api.py",
    "backend/tests/test_openapi.py",
  ],
};
// An explicit journey map is deliberately small. Unknown UI uses all E2E.
const journeys = {
  DashboardPage: ["dashboard.spec.ts"],
  DashboardActivity: ["dashboard.spec.ts"],
  ProductSidebar: [
    "sidebar-layout.spec.ts",
    "brand-logo.spec.ts",
    "product-shell.spec.ts",
  ],
  SidebarLink: ["sidebar-layout.spec.ts"],
};

export function classify(change) {
  const {
    path,
    status = "M",
    mode = "100644",
    patch = "",
  } = typeof change === "string" ? { path: change } : change;
  if (!path || !["100644", "100755", "000000"].includes(mode))
    return {
      kind: "full",
      reason: "Type de fichier inconnu ou executable indirect",
    };
  if (pureDocument(path) && mode === "100755")
    return { kind: "full", reason: "Document executable" };
  if (pureDocument(path))
    return {
      kind: "documentation",
      reason: "Prose dans un emplacement audite",
    };
  if (
    transverse.test(path) ||
    sensitive.test(path) ||
    /authentication_classes|permission_classes|transaction\.atomic|BEGIN IMMEDIATE|csrf_exempt|authorization|password|fetch\(|localStorage|\.objects\.(create|update|delete)/i.test(
      patch,
    )
  )
    return {
      kind: "full",
      reason: "Configuration, contrat, securite ou integrite",
    };
  if (/^docs\/legal\//.test(path))
    return { kind: "full", reason: "Document incorpore a la distribution" };
  if (status === "D")
    return {
      kind: "full",
      reason: "Suppression: dependants potentiellement disparus",
    };
  if (/^backend\/tests\/test_[^/]+\.py$/.test(path))
    return {
      kind: "backend-targeted",
      tests: [path],
      reason: "Test backend isole",
    };
  if (backendLeaves[path])
    return {
      kind: "backend-targeted",
      tests: backendLeaves[path],
      reason: "Feuille backend cartographiee",
    };
  if (/^backend\/.*\.py$/.test(path))
    return {
      kind: "backend",
      reason: "Backend sans dependances ciblees prouvees",
    };
  if (/^frontend\/src\/.*\.test\.tsx?$/.test(path))
    return {
      kind: "frontend-targeted",
      tests: [path],
      reason: "Test frontend isole",
    };
  if (/^frontend\/src\/(test|demo)\//.test(path))
    return {
      kind: "full",
      reason: "Infrastructure de tests ou distribution demo",
    };
  if (/^frontend\/src\/.*\.(ts|tsx|css)$/.test(path)) {
    const component = path
      .split("/")
      .pop()
      .replace(/\.[^.]+$/, "");
    const ui = ![
      "frontend/src/dateInputValue.ts",
      "frontend/src/appreciationForScore.ts",
      "frontend/src/collectionPage.ts",
    ].includes(path);
    return {
      kind: "frontend-related",
      related: [path],
      e2e: ui
        ? journeys[component]?.map((name) => `frontend/e2e/${name}`) || ["*"]
        : [],
      reason: ui
        ? "Composant/parcours: dependants Vitest et navigateurs"
        : "Dependants transitifs Vitest",
    };
  }
  if (/^frontend\/e2e\/[^/]+\.spec\.ts$/.test(path))
    return {
      kind: "e2e-targeted",
      tests: [path],
      reason: "Parcours navigateur explicite",
    };
  return { kind: "full", reason: "Changement non classifiable" };
}

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
    if (classifications.some(({ kind }) => kind === "backend"))
      checks.push({ scope: "backend" });
    else if (selected("backend-targeted").length)
      checks.push(
        { scope: "backend-static" },
        { scope: "backend-targeted", tests: selected("backend-targeted") },
      );
    const related = selected("frontend-related", "related");
    const tests = selected("frontend-targeted");
    if (related.length || tests.length || selected("e2e-targeted").length)
      checks.push({ scope: "frontend-static" });
    if (related.length || tests.length)
      checks.push({ scope: "frontend-targeted", tests, related });
    const e2e = [
      ...new Set([
        ...selected("frontend-related", "e2e"),
        ...selected("e2e-targeted"),
      ]),
    ].sort();
    if (e2e.includes("*")) checks.push({ scope: "e2e" });
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
  return { version: 1, exhaustive: full, classifications, checks, skipped };
}
