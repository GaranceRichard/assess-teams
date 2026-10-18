import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SessionUser, UserRole } from "./auth";
import { routes } from "./navigation";
import { ProductShell } from "./ProductShell";

const allowedPaths: Record<UserRole, string[]> = {
  Admin: routes.map((route) => route.path),
  Coach: ["/dashboard", "/users", "/evaluations", "/results"],
  Viewer: ["/dashboard", "/results"],
};

function actor(role: UserRole, is_superuser = false): SessionUser {
  return {
    id: 1,
    username: "member",
    role,
    is_superuser,
    organization_name: "North",
    team_names: [],
    interface_palette: "green",
  };
}

function shell(user: SessionUser, path: string) {
  return (
    <ProductShell
      user={user}
      path={path}
      onNavigate={vi.fn()}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
      pageContent={<p>Action autorisée</p>}
    />
  );
}

describe.each(["Admin", "Coach", "Viewer"] as const)("%s routes", (role) => {
  it.each(routes)(
    "applies the canonical rule on direct access to $path",
    (route) => {
      const allowed = allowedPaths[role].includes(route.path);
      render(shell(actor(role), route.path));

      const menu = within(screen.getByRole("navigation"));
      expect(menu.queryByRole("link", { name: route.title }) !== null).toBe(
        allowed,
      );
      expect(screen.queryByText("Action autorisée") !== null).toBe(allowed);
      expect(screen.queryByRole("alert") !== null).toBe(!allowed);
    },
  );
});

it("preserves Superadmin access to every existing route", () => {
  const { rerender } = render(shell(actor("Admin", true), "/dashboard"));
  for (const route of routes) {
    rerender(shell(actor("Admin", true), route.path));
    expect(screen.getByText("Action autorisée")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  }
});

it("recomputes direct access and menus when the session role changes", () => {
  const { rerender } = render(shell(actor("Admin"), "/teams"));
  expect(screen.getByText("Action autorisée")).toBeVisible();

  for (const role of ["Coach", "Viewer"] as const) {
    rerender(shell(actor(role), "/teams"));
    expect(screen.getByRole("alert")).toHaveTextContent("Page non autorisée");
    expect(
      screen.queryByRole("link", { name: "Équipes" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Action autorisée")).not.toBeInTheDocument();
  }

  rerender(shell(actor("Admin"), "/teams"));
  expect(screen.getByRole("link", { name: "Équipes" })).toBeVisible();
  expect(screen.getByText("Action autorisée")).toBeVisible();
});
