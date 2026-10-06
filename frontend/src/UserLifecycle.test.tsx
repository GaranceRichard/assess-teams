import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { SuperadminDashboard } from "./SuperadminDashboard";
import { setManagedUserActivation } from "./managedUsers";

const api = vi.hoisted(() => ({
  setManagedUserActivation: vi.fn(),
  listManagedUsers: vi.fn(),
  inviteManagedUser: vi.fn(),
  updateManagedUser: vi.fn(),
}));
vi.mock("./managedUsers", () => api);
const actor = {
  username: "root",
  role: "Admin" as const,
  is_superuser: true,
  organization_name: null,
  team_names: [],
  interface_palette: "green" as const,
};
const target = {
  id: 2,
  identifier: "admin",
  email: "admin@example.com",
  user_type: "Admin",
  is_active: false,
  pending: false,
  organizations: ["North"],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listManagedUsers.mockResolvedValue([target]);
});

it("reactivates an identity while keeping it visible", async () => {
  api.setManagedUserActivation.mockResolvedValue({
    ...target,
    is_active: true,
  });
  render(<SuperadminDashboard actor={actor} />);
  expect(await screen.findByText("Désactivé")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Réactiver" }));
  await waitFor(() =>
    expect(setManagedUserActivation).toHaveBeenCalledWith(2, true),
  );
  expect(await screen.findByText("Actif")).toBeVisible();
  expect(screen.getByText(target.email)).toBeVisible();
});

it("shows the backend last Admin refusal and retains confirmation and identity", async () => {
  api.listManagedUsers.mockResolvedValue([{ ...target, is_active: true }]);
  api.setManagedUserActivation.mockRejectedValue(
    new Error("Affectez ou activez d’abord un autre Admin."),
  );
  render(<SuperadminDashboard actor={actor} />);
  fireEvent.click(await screen.findByRole("button", { name: "Désactiver" }));
  expect(
    screen.getByText(/Son identité et son historique seront conservés/),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la désactivation" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("un autre Admin");
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByText("Actif")).toBeVisible();
});

it("preserves the inactive state when reactivation is refused", async () => {
  api.setManagedUserActivation.mockRejectedValue(
    new Error("Conflit d’identité"),
  );
  render(<SuperadminDashboard actor={actor} />);
  fireEvent.click(await screen.findByRole("button", { name: "Réactiver" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Conflit d’identité",
  );
  expect(screen.getByText("Désactivé")).toBeVisible();
});
