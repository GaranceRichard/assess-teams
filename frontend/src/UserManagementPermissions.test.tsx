import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import type { SessionUser } from "./auth";
import { SuperadminDashboard } from "./SuperadminDashboard";

const api = vi.hoisted(() => ({
  deleteManagedUser: vi.fn(),
  inviteManagedUser: vi.fn(),
  listManagedUsers: vi.fn(),
  updateManagedUser: vi.fn(),
}));

vi.mock("./managedUsers", () => api);

const users = [
  {
    id: 1,
    identifier: "root",
    email: "root@example.com",
    user_type: "Superadmin",
    pending: false,
  },
  {
    id: 2,
    identifier: "admin",
    email: "admin@example.com",
    user_type: "Admin",
    pending: false,
  },
  {
    id: 3,
    identifier: "coach",
    email: "coach@example.com",
    user_type: "Coach",
    pending: false,
  },
  {
    id: 4,
    identifier: "viewer",
    email: "viewer@example.com",
    user_type: "Viewer",
    pending: false,
  },
] as const;

function rowFor(identifier: string) {
  return screen.getByText(identifier).closest("tr")!;
}

function renderFor(actor: SessionUser) {
  return render(<SuperadminDashboard actor={actor} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  api.listManagedUsers.mockResolvedValue(users);
});

it("hides every action on the connected superadmin row", async () => {
  renderFor({ username: "root", role: "Admin", is_superuser: true });

  await screen.findByText("root@example.com");
  expect(within(rowFor("root")).queryByRole("button")).not.toBeInTheDocument();
  expect(within(rowFor("admin")).getByText("Modifier")).toBeVisible();
});

it("lets an admin act only on coaches and viewers with subordinate roles", async () => {
  renderFor({ username: "admin", role: "Admin", is_superuser: false });

  await screen.findByText("root@example.com");
  expect(within(rowFor("root")).queryByRole("button")).not.toBeInTheDocument();
  expect(within(rowFor("admin")).queryByRole("button")).not.toBeInTheDocument();
  expect(within(rowFor("coach")).getByText("Modifier")).toBeVisible();
  expect(within(rowFor("viewer")).getByText("Supprimer")).toBeVisible();

  fireEvent.click(
    screen.getByRole("button", { name: "Ajouter un utilisateur" }),
  );
  const selector = screen.getByLabelText("Type utilisateur");
  expect(within(selector).queryByRole("option", { name: "Admin" })).toBeNull();
  expect(within(selector).getAllByRole("option")).toHaveLength(2);
});

it("lets a coach edit only viewers without exposing a role selector", async () => {
  renderFor({ username: "coach", role: "Coach", is_superuser: false });

  await screen.findByText("root@example.com");
  expect(
    screen.queryByRole("button", { name: "Ajouter un utilisateur" }),
  ).not.toBeInTheDocument();
  expect(within(rowFor("coach")).queryByRole("button")).not.toBeInTheDocument();
  expect(within(rowFor("viewer")).getByText("Modifier")).toBeVisible();

  fireEvent.click(within(rowFor("viewer")).getByText("Modifier"));
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.queryByLabelText("Type utilisateur")).not.toBeInTheDocument();
});
