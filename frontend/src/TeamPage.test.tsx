import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { TeamPage } from "./TeamPage";

const api = vi.hoisted(() => ({
  createTeam: vi.fn(),
  deleteTeam: vi.fn(),
  listOrganizations: vi.fn(),
  listTeams: vi.fn(),
  updateTeam: vi.fn(),
}));

vi.mock("./organizations", () => ({
  listOrganizations: api.listOrganizations,
}));
vi.mock("./teams", () => ({
  createTeam: api.createTeam,
  deleteTeam: api.deleteTeam,
  listTeams: api.listTeams,
  updateTeam: api.updateTeam,
}));

const organizations = [
  {
    id: 1,
    name: "North",
    users: [
      { id: 1, identifier: "admin", user_type: "Admin" },
      { id: 2, identifier: "coach-one", user_type: "Coach" },
      { id: 3, identifier: "coach-two", user_type: "Coach" },
    ],
  },
  {
    id: 2,
    name: "South",
    users: [{ id: 4, identifier: "other-admin", user_type: "Admin" }],
  },
];
const team = {
  id: 8,
  name: "Alpha",
  organization_id: 1,
  is_active: true,
  coaches: [
    { id: 2, identifier: "coach-one" },
    { id: 3, identifier: "coach-two" },
  ],
};
const admin = {
  username: "admin",
  role: "Admin" as const,
  is_superuser: false,
  organization_name: null,
  team_names: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listOrganizations.mockResolvedValue(organizations);
  api.listTeams.mockResolvedValue([team]);
});

async function selectNorth() {
  const selector = await screen.findByLabelText("Organisation");
  fireEvent.change(selector, { target: { value: "1" } });
  await screen.findByText("Alpha");
}

it("selects an accessible organization and creates a team with coaches", async () => {
  api.createTeam.mockResolvedValue({ ...team, id: 9, name: "Beta" });
  render(<TeamPage actor={admin} />);

  expect(await screen.findByRole("option", { name: "North" })).toBeVisible();
  expect(screen.queryByRole("option", { name: "South" })).toBeNull();
  expect(screen.getByText("Sélectionnez une organisation.")).toBeVisible();
  await selectNorth();
  expect(screen.getByText("coach-one, coach-two")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Créer une équipe" }));
  fireEvent.change(screen.getByLabelText("Nom de l’équipe"), {
    target: { value: "Beta" },
  });
  fireEvent.click(screen.getByLabelText("coach-one"));
  fireEvent.click(screen.getByLabelText("coach-two"));
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

  await waitFor(() =>
    expect(api.createTeam).toHaveBeenCalledWith(1, {
      name: "Beta",
      coach_ids: [2, 3],
    }),
  );
  expect(await screen.findByText("Beta")).toBeVisible();
});

it("updates and archives a team", async () => {
  api.updateTeam.mockResolvedValue({
    ...team,
    name: "Renamed",
    coaches: [{ id: 3, identifier: "coach-two" }],
  });
  api.deleteTeam.mockResolvedValue(undefined);
  render(<TeamPage actor={admin} />);
  await selectNorth();

  const alpha = screen.getByText("Alpha").closest("li")!;
  fireEvent.click(within(alpha).getByRole("button", { name: "Modifier" }));
  fireEvent.change(screen.getByLabelText("Nom de l’équipe"), {
    target: { value: "Renamed" },
  });
  fireEvent.click(screen.getByLabelText("coach-one"));
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
  expect(await screen.findByText("Renamed")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Valider la suppression" }),
  );

  await waitFor(() => expect(api.deleteTeam).toHaveBeenCalledWith(8));
  expect(
    screen.getByText("Aucune équipe active pour cette organisation."),
  ).toBeVisible();
});

it("lets a Superadmin select any organization and reports loading failures", async () => {
  const root = { ...admin, username: "root", is_superuser: true };
  const { unmount } = render(<TeamPage actor={root} />);
  expect(await screen.findByRole("option", { name: "South" })).toBeVisible();
  unmount();

  api.listOrganizations.mockRejectedValue(new Error("offline"));
  render(<TeamPage actor={admin} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les organisations",
  );
});
