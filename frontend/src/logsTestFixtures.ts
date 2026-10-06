import { vi } from "vitest";
import type { SessionUser } from "./auth";

export const logAdmin: SessionUser = {
  username: "admin",
  role: "Admin",
  is_superuser: false,
  organization_name: "North",
  team_names: [],
  interface_palette: "green",
};
export const logOrganizations = [
  {
    id: 1,
    name: "North",
    users: [{ id: 10, identifier: "Alice", user_type: "Admin" }],
  },
  {
    id: 2,
    name: "South",
    users: [{ id: 20, identifier: "Bob", user_type: "Admin" }],
  },
];
export const logEntries = ["INFO", "WARNING", "ERROR"].map((level, index) => ({
  id: index + 1,
  created_at: "2026-10-05T12:30:00Z",
  organization_id: 1,
  organization_name: "North",
  actor_id: 10,
  actor_name: "Alice",
  team_id: 11,
  team_name: "Alpha",
  evaluation_id: 12,
  evaluation_name: "Model North",
  method: "POST",
  status_code: [201, 400, 500][index],
  level,
  source: "teams",
  operation: "team-create",
  category: "http",
  message: `HTTP POST ${[201, 400, 500][index]}`,
  correlation_id: `id-${index}`,
}));

export function mockLogs(isSuperadmin = false) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);
    const body =
      url === "/api/admin/organizations/"
        ? isSuperadmin
          ? logOrganizations
          : [logOrganizations[0]]
        : url.includes("/teams/")
          ? [
              {
                id: url.includes("/2/") ? 21 : 11,
                name: url.includes("/2/") ? "Beta" : "Alpha",
              },
            ]
          : url === "/api/admin/evaluations/"
            ? [
                {
                  id: 12,
                  name: "Model North",
                  family_id: 1,
                  family_name: "Model North",
                  version: 1,
                  status: "DRAFT",
                  organization_id: 1,
                },
                {
                  id: 22,
                  name: "Model South",
                  family_id: 2,
                  family_name: "Model South",
                  version: 1,
                  status: "DRAFT",
                  organization_id: 2,
                },
              ]
            : {
                count: 21,
                next: "?page=2",
                previous: url.includes("page=2") ? "?page=1" : null,
                results: logEntries,
              };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  });
}
