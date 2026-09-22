import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { SuperadminDashboard } from "./SuperadminDashboard";

const api = vi.hoisted(() => ({
  deleteManagedUser: vi.fn(),
  inviteManagedUser: vi.fn(),
  listManagedUsers: vi.fn(),
  updateManagedUser: vi.fn(),
}));

vi.mock("./managedUsers", () => api);

const pending = {
  id: 2,
  identifier: "alice",
  email: "alice@example.com",
  user_type: "Coach",
  pending: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listManagedUsers.mockResolvedValue([pending]);
});

it("lists every field and cancels creation by clicking outside", async () => {
  const { container } = render(<SuperadminDashboard />);

  expect(await screen.findByText("alice")).toBeVisible();
  expect(screen.getByText("alice@example.com")).toBeVisible();
  expect(screen.getByText("Coach")).toBeVisible();
  expect(screen.getByText("En attente")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Ajouter un utilisateur" }),
  );
  expect(
    screen.getByRole("heading", { name: "Ajouter un utilisateur" }),
  ).toBeVisible();
  fireEvent.mouseDown(container.querySelector(".dialog-backdrop")!);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("creates a user with the selected business role", async () => {
  api.inviteManagedUser.mockResolvedValue({
    ...pending,
    id: 3,
    identifier: "bob",
    email: "bob@example.com",
  });
  render(<SuperadminDashboard />);
  await screen.findByText("alice");

  fireEvent.click(
    screen.getByRole("button", { name: "Ajouter un utilisateur" }),
  );
  fireEvent.change(screen.getByLabelText("Identifiant"), {
    target: { value: "bob" },
  });
  fireEvent.change(screen.getByLabelText("Adresse mail"), {
    target: { value: "bob@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Type utilisateur"), {
    target: { value: "Admin" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));

  await waitFor(() =>
    expect(api.inviteManagedUser).toHaveBeenCalledWith({
      identifier: "bob",
      email: "bob@example.com",
      role: "Admin",
    }),
  );
  expect(await screen.findByText("bob")).toBeVisible();
});

it("updates then confirms deletion", async () => {
  const updated = { ...pending, identifier: "alice-updated", pending: false };
  api.updateManagedUser.mockResolvedValue(updated);
  api.deleteManagedUser.mockResolvedValue(undefined);
  render(<SuperadminDashboard />);
  await screen.findByText("alice");

  fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
  fireEvent.change(screen.getByLabelText("Identifiant"), {
    target: { value: "alice-updated" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));
  expect(await screen.findByText("alice-updated")).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Valider la suppression" }),
  );
  await waitFor(() => expect(api.deleteManagedUser).toHaveBeenCalledWith(2));
  expect(screen.queryByText("alice-updated")).not.toBeInTheDocument();
});

it("cancels or reports a refused deletion", async () => {
  const { container } = render(<SuperadminDashboard />);
  await screen.findByText("alice");
  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  fireEvent.mouseDown(container.querySelector(".dialog-backdrop")!);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  api.deleteManagedUser.mockRejectedValue(new Error("refused"));
  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Valider la suppression" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "suppression a été refusée",
  );
});

it("shows loading and mutation failures while preserving the dialog", async () => {
  api.listManagedUsers.mockRejectedValue(new Error("offline"));
  render(<SuperadminDashboard />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger",
  );

  api.inviteManagedUser.mockRejectedValue(new Error("refused"));
  fireEvent.click(
    screen.getByRole("button", { name: "Ajouter un utilisateur" }),
  );
  fireEvent.change(screen.getByLabelText("Identifiant"), {
    target: { value: "bob" },
  });
  fireEvent.change(screen.getByLabelText("Adresse mail"), {
    target: { value: "bob@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "opération a été refusée",
  );
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
});
