import assert from "node:assert/strict";
import test from "node:test";
import { closure, dependents, sameEndpoint } from "../dependency-graph.mjs";

test("direction, transitive consumers and cycles are preserved without unrelated neighbors", () => {
  const graph = new Map([
    ["leaf", new Set()],
    ["consumer", new Set(["leaf", "cycle"])],
    ["cycle", new Set(["consumer"])],
    ["test", new Set(["consumer"])],
    ["unrelated", new Set()],
    ["opaque-test", new Set(["*"])],
  ]);
  assert.deepEqual([...closure(graph, ["leaf"])], ["leaf"]);
  const reached = dependents(graph, ["leaf"]);
  for (const path of ["leaf", "consumer", "cycle", "test", "opaque-test"])
    assert.ok(reached.has(path), path);
  assert.ok(!reached.has("unrelated"));
  assert.ok(!dependents(graph, ["leaf"], false).has("opaque-test"));
});

test("endpoint templates preserve namespace, query boundaries and variable client prefixes", () => {
  assert.ok(
    sameEndpoint("/api/admin/teams/<int:id>/", "/api/admin/teams/${id}/"),
  );
  assert.ok(
    sameEndpoint("/api/results/families/<int:id>/", "/api/results/${path}"),
  );
  assert.ok(sameEndpoint("/api/steering/", "/api/steering/${path}"));
  assert.ok(
    !sameEndpoint("/api/admin/teams/<int:id>/", "/api/results/${path}"),
  );
  assert.ok(!sameEndpoint("/api/admin/users/", "/api/admin/organizations/"));
  assert.ok(!sameEndpoint("/api/results/families/<int:id>/", "/api/session/"));
  assert.ok(!sameEndpoint("/api/results/families/<int:id>/", "/api/health/"));
});
