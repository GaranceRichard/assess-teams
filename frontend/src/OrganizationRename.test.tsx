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
  listManagedUsers: vi.fn(),
  listOrganizations: vi.fn(),
  renameOrganization: vi.fn(),
  updateOrganizationMembers: vi.fn(),
}));

vi.mock("./managedUsers", () => ({ listManagedUsers: api.listManagedUsers }));
vi.mock("./organizations", () => ({
  createOrganization: api.createOrganization,
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

it("renames an organization from its list action", async () => {
  api.renameOrganization.mockResolvedValue({ ...organization, name: "East" });
  render(<OrganizationPage />);

  await screen.findByText("North");
  fireEvent.click(screen.getByRole("button", { name: "Renommer" }));
  const dialog = screen.getByRole("dialog");
  const name = within(dialog).getByLabelText("Nom");
  expect(name).toHaveValue("North");
  fireEvent.change(name, { target: { value: "East" } });
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Enregistrer le nom" }),
  );

  await waitFor(() =>
    expect(api.renameOrganization).toHaveBeenCalledWith(1, "East"),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("East")).toBeVisible();
});

it("keeps the rename dialog open when the API refuses", async () => {
  api.renameOrganization.mockRejectedValue(new Error("refused"));
  render(<OrganizationPage />);

  await screen.findByText("North");
  fireEvent.click(screen.getByRole("button", { name: "Renommer" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Nom"), {
    target: { value: "Blocked" },
  });
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Enregistrer le nom" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "renommage de l’organisation a été refusé",
  );
  expect(screen.getByRole("dialog")).toBeVisible();
});
