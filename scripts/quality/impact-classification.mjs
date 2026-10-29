import {
  pureDocument,
  evidenceAsset,
  toolingImpact,
} from "./impact-locations.mjs";
import { frontendImpact } from "./frontend-impact.mjs";
export { pureDocument } from "./impact-locations.mjs";
// Fail closed: only reviewed locations qualify as prose or isolated changes.
export const fullScopes = ["repository", "backend", "frontend", "e2e"];

const security = /permission|auth|session|password|security/i;
const integrity =
  /transaction|sqlite|worker|transaction\.atomic|BEGIN IMMEDIATE/i;
const securityCode =
  /authentication_classes|permission_classes|csrf_exempt|authorization|password/i;
const contract = /\/(adapters\/api|domain)\/|models|serializ|views|contract/i;
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
  if ((pureDocument(path) || evidenceAsset(path)) && mode === "100755")
    return { kind: "full", reason: "Document executable" };
  if (pureDocument(path))
    return {
      kind: "documentation",
      reason: "Prose dans un emplacement audite",
    };
  if (evidenceAsset(path))
    return {
      kind: "documentation",
      reason: "Preuve visuelle inventoriee, non executable et non distribuee",
    };
  if (status === "D")
    return {
      kind: "full",
      reason: "Suppression: dependants potentiellement disparus",
    };
  // A spec is a consumer, not a validation engine or backend implementation.
  if (/^frontend\/(e2e|demo-e2e)\/[^/]+\.spec\.ts$/.test(path))
    return {
      kind: path.startsWith("frontend/demo-e2e/")
        ? "e2e-demo-targeted"
        : "e2e-targeted",
      tests: [path],
      reason:
        "Parcours navigateur explicite; ne qualifie pas a lui seul le comportement metier",
    };
  const tooling = toolingImpact(path);
  if (tooling) return tooling;
  // Narrow audited exception: the retry helper is DB-only; settings remain transverse.
  const sqliteHelper = path === "backend/config/sqlite_contention.py";
  if (
    (transverse.test(path) || /^backend\/.*(config|migrations)\//.test(path)) &&
    !sqliteHelper
  )
    return {
      kind: "full",
      reason: "Infrastructure de validation ou dependance transverse",
    };
  if (/^docs\/legal\//.test(path))
    return { kind: "full", reason: "Document incorpore a la distribution" };
  if (/^backend\/.*\.py$/.test(path)) {
    const test = /^backend\/tests\//.test(path);
    const worker = /\/management\/commands\//.test(path);
    const secured =
      security.test(path) ||
      securityCode.test(patch) ||
      (!test && !worker && /^backend\/identities\//.test(path));
    const transactional = sqliteHelper || integrity.test(path + "\n" + patch);
    // /api/users/ is a technical endpoint with no React/Playwright consumer.
    const technicalPermission =
      path === "backend/identities/adapters/api/permissions.py";
    const contractCode =
      /CONTENTION_FAILED\s*=|rest_framework|Response\(|JsonResponse\(|urlpatterns|class.*Serializer/;
    const uiContract =
      !test &&
      !technicalPermission &&
      !worker &&
      ((sqliteHelper && contractCode.test(patch)) ||
        (!sqliteHelper &&
          ((contract.test(path) && !backendLeaves[path]) || secured)));
    if (uiContract)
      return {
        kind: "backend-contract",
        reason:
          "Contrat ou securite produit: backend complet, frontend et parcours conservateurs",
      };
    if (secured || transactional)
      return {
        kind: "backend",
        reason: secured
          ? "Securite backend: suite complete, autorisations, refus, roles et sessions"
          : "SQLite/transactions/workers: backend complet, rollback, Journal et multiprocessus",
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
    return {
      kind: "backend",
      reason: "Backend sans dependances ciblees prouvees: suite complete",
    };
  }
  return (
    frontendImpact(path, patch, security, securityCode) || {
      kind: "full",
      reason:
        "Changement non classifiable: dependances non prouvees, quatre domaines requis",
    }
  );
}
