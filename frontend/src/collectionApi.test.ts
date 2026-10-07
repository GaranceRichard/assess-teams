import { afterEach, expect, it, vi } from "vitest";
import { listManagedUsers } from "./managedUsers";
import { listTeams } from "./teams";
import { listEvaluations } from "./evaluations";
import { listSchedules } from "./planning";
import { listEvaluationRuns } from "./evaluationRuns";
import { getSteering } from "./steering";

afterEach(() => vi.unstubAllGlobals());
it("requests bounded server pages while retaining organization filters", async () => {
  const body = { count: 21, results: [], next: null, previous: "?page=1" };
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", fetch);
  for (const [load, url] of [
    [() => listManagedUsers(2), "/api/admin/users/?page=2"],
    [
      () => listManagedUsers(2, "alice +"),
      "/api/admin/users/?page=2&search=alice%20%2B",
    ],
    [
      () => listTeams(3, false, 2),
      "/api/admin/organizations/3/teams/?page=2&include_archived=false",
    ],
    [
      () => listEvaluations(2, 3),
      "/api/admin/evaluations/?page=2&organization_id=3",
    ],
    [
      () => listSchedules(2, 3),
      "/api/admin/planning/?page=2&organization_id=3",
    ],
    [() => listEvaluationRuns(2), "/api/evaluations/?page=2"],
    [() => getSteering(3, 2), "/api/steering/?organization_id=3&page=2"],
  ] as const) {
    expect(await load()).toEqual(body);
    expect(fetch).toHaveBeenLastCalledWith(
      url,
      expect.objectContaining({ credentials: "same-origin" }),
    );
  }
});
