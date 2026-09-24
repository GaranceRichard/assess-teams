import { expect, it } from "vitest";

import { unavailableSingleOrganizationUserIds } from "./organizationMemberships";

it("marks only Coachs and Viewers attached to another organization", () => {
  const organizations = [
    {
      id: 1,
      name: "First",
      users: [
        { id: 1, identifier: "admin", user_type: "Admin" as const },
        { id: 2, identifier: "coach", user_type: "Coach" as const },
      ],
    },
    {
      id: 2,
      name: "Second",
      users: [{ id: 3, identifier: "viewer", user_type: "Viewer" as const }],
    },
  ];

  expect([...unavailableSingleOrganizationUserIds(organizations)]).toEqual([
    2, 3,
  ]);
  expect([...unavailableSingleOrganizationUserIds(organizations, 2)]).toEqual([
    2,
  ]);
});
