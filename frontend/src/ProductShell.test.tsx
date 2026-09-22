import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { UserRole } from "./auth";
import { ProductShell } from "./ProductShell";

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
  Coach: ["Tableau de bord", "Mes équipes", "Évaluations", "Résultats"],
  Viewer: ["Tableau de bord", "Équipes", "Résultats"],
};

describe.each(Object.entries(expectedMenus) as [UserRole, string[]][])(
  "%s workspace",
  (role, labels) => {
    it("shows only the role menu", () => {
      render(
        <ProductShell
          path="/dashboard"
          user={{ username: "member", role, is_superuser: false }}
          onNavigate={vi.fn()}
          onLogout={vi.fn()}
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
      user={{ username: "root", role: "Admin", is_superuser: true }}
      onNavigate={onNavigate}
      onLogout={vi.fn()}
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
      user={{ username: "lea", role: "Viewer", is_superuser: false }}
      onNavigate={vi.fn()}
      onLogout={onLogout}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));
  expect(onLogout).toHaveBeenCalledOnce();
});
