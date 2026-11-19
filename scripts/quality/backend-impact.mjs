import { dependents, sorted, sameEndpoint } from "./dependency-graph.mjs";
import { journeySelection } from "./journey-dependencies.mjs";

export function backendImpact(path, context) {
  if (!context) return null;
  const backend = context.backend();
  if (backend.error || !backend.graph.has(path))
    return {
      kind: "full",
      reason: "Dependances Python absentes ou non analysables",
    };
  const reached = dependents(backend.graph, [path]);
  const proven = dependents(backend.graph, [path], false);
  const isTest = (item) =>
    /^backend\/tests\/(?:.*\/)?test_[^/]+\.py$/.test(item) &&
    backend.caseFiles.includes(item);
  if (backend.graph.get(path).has("*") || ![...proven].some(isTest))
    return {
      kind: "full",
      reason: "Aucun test composant prouve ou dependance Python dynamique",
    };
  if (backend.writes.includes(path))
    return {
      kind:
        [
          "backend/notifications/queue.py",
          "backend/notifications/delivery.py",
          "backend/notifications/management/commands/send_pending_notifications.py",
        ].includes(path) &&
        backend.detached.length > 0 &&
        !backend.routes.some((route) => route.file === path)
          ? "backend"
          : "backend-contract",
      reason:
        "Ecriture persistante: dependances lecteurs non bornees, validations renforcees",
    };
  const tests = sorted([...reached].filter(isTest));
  // Reviewed fire-and-forget SMTP callback: backend integrations remain selected.
  // A second call, a consumed result or robust=False removes this UI boundary.
  const uiGraph = new Map(
    [...backend.graph].map(([file, dependencies]) => [
      file,
      new Set(
        [...dependencies].filter(
          (dependency) =>
            !backend.detached.some(
              ([from, to]) => from === file && to === dependency,
            ),
        ),
      ),
    ]),
  );
  const uiReached = dependents(uiGraph, [path]);
  const endpoints = backend.routes.filter((route) => uiReached.has(route.file));
  const reason = `Graphe Python: ${tests.length} fichiers de tests, ${endpoints.length} routes impactees`;
  if (!endpoints.length) return { kind: "backend-related", tests, reason };
  const frontend = context.frontend();
  if (frontend.error)
    return { kind: "full", reason: "Consommateurs frontend non analysables" };
  const consumers = new Set(),
    unmatched = [];
  for (const endpoint of endpoints) {
    const matches = [...frontend.sources]
      .filter(
        ([file, source]) =>
          file.startsWith("frontend/src/") &&
          !/\.test\./.test(file) &&
          [...source.matchAll(/["'`](\/api\/[^"'`\s]*)/g)].some((match) =>
            sameEndpoint(endpoint.path, match[1]),
          ),
      )
      .map(([file]) => file);
    if (!matches.length) unmatched.push(endpoint.path);
    matches.forEach((file) => consumers.add(file));
  }
  if (unmatched.length)
    return {
      kind: "backend-contract",
      reason: `Contrat sans consommateur UI borne: ${sorted(unmatched).join(", ")}`,
    };
  const related = sorted(consumers);
  if (
    ![...dependents(frontend.graph, related, false)].some((file) =>
      frontend.caseFiles.has(file),
    )
  )
    return {
      kind: "backend-contract",
      reason: "Contrat API sans test frontend composant prouve",
    };
  return {
    kind: "backend-related",
    tests,
    related,
    frontendTests: sorted(
      [...dependents(frontend.graph, related)].filter((file) =>
        /\.test\.tsx?$/.test(file),
      ),
    ),
    ...journeySelection(
      frontend,
      related,
      endpoints.map((route) => route.path),
    ),
    reason,
  };
}
