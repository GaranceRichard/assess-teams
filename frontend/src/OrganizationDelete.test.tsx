import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

const organization = {
  id: 1,
  name: "North",
  users: [{ id: 1, identifier: "alice", user_type: "Admin" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listManagedUsers.mockResolvedValue([]);
  api.listOrganizations.mockResolvedValue([organization]);
});

it("shows deletion only to a Superadmin and removes the organization", async () => {
  api.deleteOrganization.mockResolvedValue(undefined);
  const { rerender } = render(<OrganizationPage />);
  await screen.findByText("North");
  expect(
    screen.queryByRole("button", { name: "Supprimer" }),
  ).not.toBeInTheDocument();

  rerender(<OrganizationPage isSuperadmin />);
  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveTextContent("utilisateurs conserveront leurs comptes");
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Supprimer l’organisation" }),
  );

  await waitFor(() => expect(api.deleteOrganization).toHaveBeenCalledWith(1));
  expect(screen.queryByText("North")).not.toBeInTheDocument();
  expect(screen.getByText("Aucune organisation.")).toBeVisible();
});

it("keeps the confirmation open when deletion is refused", async () => {
  api.deleteOrganization.mockRejectedValue(new Error("refused"));
  render(<OrganizationPage isSuperadmin />);

  await screen.findByText("North");
  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Supprimer l’organisation",
    }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "suppression de l’organisation a été refusée",
  );
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByText("North")).toBeVisible();
});
