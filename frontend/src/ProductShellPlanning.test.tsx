import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { SessionUser } from "./auth";
import { ProductShell } from "./ProductShell";

vi.mock("./PlanningPage", () => ({
  PlanningPage: () => <div>Gestion de la planification</div>,
}));

const admin: SessionUser = {
  username: "admin",
  role: "Admin",
  is_superuser: false,
  organization_name: null,
  team_names: [],
};

it("opens planning for an Admin", () => {
  render(
    <ProductShell
      path="/planning"
      user={admin}
      onNavigate={vi.fn()}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );

  expect(screen.getByText("Gestion de la planification")).toBeVisible();
});
