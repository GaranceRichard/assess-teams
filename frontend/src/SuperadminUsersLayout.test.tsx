import { render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { SuperadminDashboard } from "./SuperadminDashboard";

vi.mock("./managedUsers", () => ({
  listManagedUsers: vi.fn().mockResolvedValue([
    {
      id: 1,
      identifier: "root",
      email: "root@example.com",
      user_type: "Superadmin",
      organizations: ["Legacy"],
      is_active: true,
      pending: false,
    },
    {
      id: 2,
      identifier: "coach",
      email: "coach@example.com",
      user_type: "Coach",
      organizations: ["North"],
      is_active: false,
      pending: false,
    },
  ]),
}));

it("keeps all cells on the self row without inventing actions or membership", async () => {
  render(
    <SuperadminDashboard
      actor={{
        username: "root",
        role: "Admin",
        is_superuser: true,
        organization_name: null,
        team_names: [],
        interface_palette: "green",
      }}
    />,
  );
  const rootRow = (await screen.findByText("root")).closest("tr")!;
  const coachRow = screen.getByText("coach").closest("tr")!;
  expect(within(rootRow).getAllByRole("cell")).toHaveLength(5);
  expect(within(coachRow).getAllByRole("cell")).toHaveLength(5);
  expect(within(rootRow).getByText("—")).toBeVisible();
  expect(screen.queryByText("Legacy")).not.toBeInTheDocument();
  expect(within(rootRow).queryByRole("button")).not.toBeInTheDocument();
  expect(
    within(coachRow).getByRole("button", { name: "Modifier" }),
  ).toBeVisible();
  expect(within(rootRow).getByText("Actif")).toHaveClass("status-badge");
  expect(within(coachRow).getByText("Désactivé")).toHaveClass("status-badge");
});
