import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { OrganizationPage } from "./OrganizationPage";

const api = vi.hoisted(() => ({
  createOrganization: vi.fn(),
  listManagedUsers: vi.fn(),
  listOrganizations: vi.fn(),
}));

vi.mock("./managedUsers", () => ({ listManagedUsers: api.listManagedUsers }));
vi.mock("./organizations", () => ({
  createOrganization: api.createOrganization,
  listOrganizations: api.listOrganizations,
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
