import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SessionUser, UserRole } from "./auth";
import { ProductShell } from "./ProductShell";

vi.mock("./SuperadminDashboard", () => ({
  SuperadminDashboard: () => <div>Gestion Superadmin</div>,
}));
vi.mock("./OrganizationPage", () => ({
  OrganizationPage: ({ isSuperadmin }: { isSuperadmin: boolean }) => (
    <div data-superadmin={isSuperadmin}>Gestion des organisations</div>
  ),
}));
vi.mock("./TeamPage", () => ({
  TeamPage: () => <div>Gestion des équipes</div>,
}));

const expectedMenus: Record<UserRole, string[]> = {
  Admin: [
    "Tableau de bord",
    "Utilisateurs",
    "Organisation",
    "Équipes",
    "Modèles d’évaluation",
    "Planification",
    "Évaluations",
    "Résultats",
    "Pilotage",
  ],
  Coach: ["Tableau de bord", "Utilisateurs", "Évaluations", "Résultats"],
  Viewer: ["Tableau de bord", "Utilisateurs", "Équipes", "Résultats"],
};

function sessionUser(
  role: UserRole,
  overrides: Partial<SessionUser> = {},
): SessionUser {
  return {
    username: "member",
    role,
    is_superuser: false,
    organization_name: null,
    team_names: [],
    ...overrides,
  };
}

describe.each(Object.entries(expectedMenus) as [UserRole, string[]][])(
  "%s workspace",
  (role, labels) => {
    it("shows only the role menu", () => {
      render(
        <ProductShell
          path="/dashboard"
          user={sessionUser(role)}
          onNavigate={vi.fn()}
          onLogout={vi.fn()}
          theme="day"
          onThemeChange={vi.fn()}
        />,
      );

      const links = screen.getByRole("navigation").querySelectorAll("a");
      expect(Array.from(links, (link) => link.textContent)).toEqual(labels);
    });
  },
);

it("navigates with product links and exposes the connected superadmin", () => {
  const onNavigate = vi.fn();
  render(
    <ProductShell
      path="/results"
      user={sessionUser("Admin", { username: "root", is_superuser: true })}
      onNavigate={onNavigate}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("link", { name: "Résultats" }));
  expect(onNavigate).toHaveBeenCalledWith("/results");
  expect(screen.getByText("Superadmin · Admin")).toBeVisible();
});

it("calls logout from the connected-user header", () => {
  const onLogout = vi.fn().mockResolvedValue(undefined);
  render(
    <ProductShell
      path="/dashboard"
      user={sessionUser("Viewer", { username: "lea" })}
      onNavigate={vi.fn()}
      onLogout={onLogout}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));
  expect(onLogout).toHaveBeenCalledOnce();
});

it("shows user management on Users only and changes theme", () => {
  const onThemeChange = vi.fn();
  const props = {
    user: sessionUser("Admin", { username: "root", is_superuser: true }),
    onNavigate: vi.fn(),
    onLogout: vi.fn(),
    theme: "day" as const,
    onThemeChange,
  };
  const { rerender } = render(<ProductShell {...props} path="/dashboard" />);

  expect(screen.queryByText("Gestion Superadmin")).not.toBeInTheDocument();
  expect(
    screen.getByText("Tableau de bord — fonctionnalité à venir"),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Activer le mode nuit" }));
  expect(onThemeChange).toHaveBeenCalledWith("night");

  rerender(<ProductShell {...props} path="/users" />);
  expect(screen.getByText("Gestion Superadmin")).toBeVisible();

  rerender(<ProductShell {...props} path="/organization" />);
  expect(screen.getByText("Gestion des organisations")).toHaveAttribute(
    "data-superadmin",
    "true",
  );

  rerender(<ProductShell {...props} path="/teams" />);
  expect(screen.getByText("Gestion des équipes")).toBeVisible();
});

it.each(["Coach", "Viewer"] as const)(
  "shows the assigned organization on the %s dashboard",
  (role) => {
    render(
      <ProductShell
        path="/dashboard"
        user={sessionUser(role, { organization_name: "North" })}
        onNavigate={vi.fn()}
        onLogout={vi.fn()}
        theme="day"
        onThemeChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Vous êtes affecté à/)).toHaveTextContent(
      "Vous êtes affecté à : North",
    );
  },
);

it("shows every assigned team on the Coach dashboard", () => {
  render(
    <ProductShell
      path="/dashboard"
      user={sessionUser("Coach", {
        organization_name: "North",
        team_names: ["Équipe A", "Équipe B", "Équipe C"],
      })}
      onNavigate={vi.fn()}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );

  expect(screen.getByText(/^Équipes :/)).toHaveTextContent(
    "Équipes : Équipe A, Équipe B, Équipe C",
  );
});

it("does not show an organization when the Viewer is not assigned", () => {
  render(
    <ProductShell
      path="/dashboard"
      user={sessionUser("Viewer")}
      onNavigate={vi.fn()}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );

  expect(screen.queryByText(/Vous êtes affecté à/)).not.toBeInTheDocument();
});
