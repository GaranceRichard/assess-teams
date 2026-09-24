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

const users = [
  {
    id: 1,
    identifier: "alice",
    email: "alice@example.com",
    user_type: "Admin",
    pending: false,
  },
  {
    id: 2,
    identifier: "bob",
    email: "bob@example.com",
    user_type: "Coach",
    pending: false,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.listManagedUsers.mockResolvedValue(users);
  api.listOrganizations.mockResolvedValue([]);
});

it("creates an organization with several selected users", async () => {
  api.createOrganization.mockResolvedValue({
    id: 3,
    name: "North",
    users: users.map(({ id, identifier, user_type }) => ({
      id,
      identifier,
      user_type,
    })),
  });
  render(<OrganizationPage />);

  expect(await screen.findByText("Aucune organisation.")).toBeVisible();
  fireEvent.change(screen.getByLabelText("Nom"), {
    target: { value: "North" },
  });
  fireEvent.click(screen.getByLabelText(/alice/));
  fireEvent.click(screen.getByLabelText(/bob/));
  fireEvent.click(screen.getByRole("button", { name: "Créer l’organisation" }));

  await waitFor(() =>
    expect(api.createOrganization).toHaveBeenCalledWith({
      name: "North",
      user_ids: [1, 2],
    }),
  );
  expect(await screen.findByText("North")).toBeVisible();
  expect(screen.getByText("alice, bob")).toBeVisible();
  expect(screen.getByLabelText("Nom")).toHaveValue("");
});

it("loads existing organizations and can unselect a user", async () => {
  api.listOrganizations.mockResolvedValue([
    { id: 1, name: "Existing", users: [{ id: 1, identifier: "alice" }] },
  ]);
  render(<OrganizationPage />);

  expect(await screen.findByText("Existing")).toBeVisible();
  const alice = screen.getByLabelText(/alice/);
  fireEvent.change(screen.getByLabelText("Nom"), {
    target: { value: "Another" },
  });
  fireEvent.click(alice);
  expect(
    screen.getByRole("button", { name: "Créer l’organisation" }),
  ).toBeEnabled();
  fireEvent.click(alice);
  expect(alice).not.toBeChecked();
  expect(
    screen.getByRole("button", { name: "Créer l’organisation" }),
  ).toBeDisabled();
});

it("adds and removes members from an existing organization", async () => {
  api.listOrganizations.mockResolvedValue([
    {
      id: 1,
      name: "Existing",
      users: [{ id: 1, identifier: "alice", user_type: "Admin" }],
    },
  ]);
  api.updateOrganizationMembers.mockResolvedValue({
    id: 1,
    name: "Existing",
    users: [{ id: 2, identifier: "bob", user_type: "Coach" }],
  });
  render(<OrganizationPage />);

  await screen.findByText("Existing");
  fireEvent.click(screen.getByRole("button", { name: "Gérer les membres" }));
  const dialog = screen.getByRole("dialog");
  const alice = within(dialog).getByLabelText(/alice/);
  const bob = within(dialog).getByLabelText(/bob/);
  expect(alice).toBeChecked();
  expect(bob).not.toBeChecked();
  fireEvent.click(alice);
  fireEvent.click(bob);
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Enregistrer les membres" }),
  );

  await waitFor(() =>
    expect(api.updateOrganizationMembers).toHaveBeenCalledWith(1, [2]),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const organizationEntry = screen.getByText("Existing").closest("li");
  expect(organizationEntry).not.toBeNull();
  expect(within(organizationEntry!).getByText("bob")).toBeVisible();
});

it("keeps the member dialog open after a rejected update", async () => {
  api.listOrganizations.mockResolvedValue([
    {
      id: 1,
      name: "Existing",
      users: [{ id: 1, identifier: "alice", user_type: "Admin" }],
    },
  ]);
  api.updateOrganizationMembers.mockRejectedValue(new Error("refused"));
  render(<OrganizationPage />);

  await screen.findByText("Existing");
  fireEvent.click(screen.getByRole("button", { name: "Gérer les membres" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByLabelText(/bob/));
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Enregistrer les membres" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "modification des membres a été refusée",
  );
  expect(screen.getByRole("dialog")).toBeVisible();
});

it("reports loading and creation failures", async () => {
  api.listOrganizations.mockRejectedValueOnce(new Error("offline"));
  const { unmount } = render(<OrganizationPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger",
  );

  unmount();
  api.listOrganizations.mockResolvedValue([]);
  api.createOrganization.mockRejectedValue(new Error("refused"));
  render(<OrganizationPage />);
  await screen.findByText("Aucune organisation.");
  fireEvent.change(screen.getByLabelText("Nom"), {
    target: { value: "Blocked" },
  });
  fireEvent.click(screen.getByLabelText(/alice/));
  fireEvent.click(screen.getByRole("button", { name: "Créer l’organisation" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "création de l’organisation a été refusée",
  );
});
