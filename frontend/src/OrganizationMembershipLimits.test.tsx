import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { OrganizationPage } from "./OrganizationPage";

const api = vi.hoisted(() => ({
  createOrganization: vi.fn(),
  deleteOrganization: vi.fn(),
  listManagedUsers: vi.fn(),
  listOrganizations: vi.fn(),
  renameOrganization: vi.fn(),
  updateOrganizationMembers: vi.fn(),
}));

vi.mock("./managedUsers", () => ({ listManagedUsers: api.listManagedUsers }));
vi.mock("./organizations", () => ({
  createOrganization: api.createOrganization,
  deleteOrganization: api.deleteOrganization,
  listOrganizations: api.listOrganizations,
  renameOrganization: api.renameOrganization,
  updateOrganizationMembers: api.updateOrganizationMembers,
}));

const users = [
  {
    id: 1,
    identifier: "admin-one",
    email: "admin@example.com",
    user_type: "Admin",
    pending: false,
  },
  {
    id: 2,
    identifier: "coach-one",
    email: "coach@example.com",
    user_type: "Coach",
    pending: false,
  },
  {
    id: 3,
    identifier: "viewer-one",
    email: "viewer@example.com",
    user_type: "Viewer",
    pending: false,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.listManagedUsers.mockResolvedValue(users);
  api.listOrganizations.mockResolvedValue([
    {
      id: 1,
      name: "Existing",
      users: [
        { id: 1, identifier: "admin-one", user_type: "Admin" },
        { id: 2, identifier: "coach-one", user_type: "Coach" },
      ],
    },
    {
      id: 2,
      name: "Target",
      users: [{ id: 3, identifier: "viewer-one", user_type: "Viewer" }],
    },
  ]);
});

it("keeps Admins reusable and blocks Coachs or Viewers attached elsewhere", async () => {
  render(<OrganizationPage />);

  const creationForm = await screen.findByRole("form", {
    name: "Créer une organisation",
  });
  expect(within(creationForm).getByLabelText(/admin-one/)).toBeEnabled();
  expect(within(creationForm).getByLabelText(/coach-one/)).toBeDisabled();
  expect(within(creationForm).getByLabelText(/viewer-one/)).toBeDisabled();

  const target = screen.getByText("Target").closest("li");
  expect(target).not.toBeNull();
  fireEvent.click(
    within(target!).getByRole("button", { name: "Gérer les membres" }),
  );
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByLabelText(/admin-one/)).toBeEnabled();
  expect(within(dialog).getByLabelText(/coach-one/)).toBeDisabled();
  expect(within(dialog).getByLabelText(/viewer-one/)).toBeEnabled();
  expect(within(dialog).getByLabelText(/viewer-one/)).toBeChecked();
});
