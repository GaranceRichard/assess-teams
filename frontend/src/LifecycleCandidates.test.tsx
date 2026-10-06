import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { TeamPage } from "./TeamPage";
import { PlanningPage } from "./PlanningPage";
import { OrganizationCreateForm } from "./OrganizationCreateForm";
import { evaluation, existing, team } from "./test/planningFixture";

const api = vi.hoisted(() => ({
  listOrganizations: vi.fn(),
  listTeams: vi.fn(),
  listEvaluations: vi.fn(),
  listSchedules: vi.fn(),
}));
vi.mock("./organizations", () => ({
  listOrganizations: api.listOrganizations,
}));
vi.mock("./teams", () => ({ listTeams: api.listTeams }));
vi.mock("./evaluations", () => ({ listEvaluations: api.listEvaluations }));
vi.mock("./planning", () => ({
  listSchedules: api.listSchedules,
  scheduleLabels: { immediate: "Tout de suite" },
}));
const actor = {
  username: "admin",
  role: "Admin" as const,
  is_superuser: false,
  organization_name: null,
  team_names: [],
  interface_palette: "green" as const,
};
const users = [
  { id: 10, identifier: "admin", user_type: "Admin", is_active: true },
  { id: 9, identifier: "inactive", user_type: "Coach", is_active: false },
];
beforeEach(() => {
  api.listOrganizations.mockResolvedValue([{ id: 1, name: "North", users }]);
  api.listTeams.mockResolvedValue([
    { ...team, coaches: [{ id: 9, identifier: "inactive", is_active: false }] },
  ]);
  api.listEvaluations.mockResolvedValue([evaluation]);
  api.listSchedules.mockResolvedValue([
    { ...existing, requires_reassignment: true },
  ]);
});

it("excludes inactive Coachs from new teams while retaining their existing reference", async () => {
  render(<TeamPage actor={actor} />);
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  expect(await screen.findByText("inactive · Désactivé")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Créer une équipe" }));
  expect(within(screen.getByRole("dialog")).queryByRole("checkbox")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
  const retained = within(screen.getByRole("dialog")).getByRole("checkbox");
  expect(retained).toBeChecked();
  fireEvent.click(retained);
  expect(retained).toBeDisabled();
});

it("excludes inactive assignees from planning and displays the review requirement", async () => {
  render(<PlanningPage actor={actor} />);
  await screen.findByRole("option", { name: "Alpha" });
  fireEvent.change(screen.getByLabelText("Équipe"), { target: { value: "3" } });
  const selector = await screen.findByLabelText("Responsable de l’évaluation");
  expect(
    within(selector).queryByRole("option", { name: /inactive/ }),
  ).toBeNull();
  expect(within(selector).getByRole("option", { name: /admin/ })).toBeVisible();
  expect(await screen.findByText(/Réaffectation requise/)).toBeVisible();
});

it("excludes inactive identities from organization creation", () => {
  render(
    <OrganizationCreateForm
      users={[
        {
          id: 9,
          identifier: "inactive",
          email: "inactive@example.com",
          user_type: "Coach",
          is_active: false,
          pending: false,
          organizations: [],
        },
      ]}
      unavailableUserIds={new Set()}
      onSubmit={vi.fn()}
    />,
  );
  expect(screen.queryByRole("checkbox")).toBeNull();
});
