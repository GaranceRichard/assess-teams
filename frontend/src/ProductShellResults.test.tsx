import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ProductShell } from "./ProductShell";

vi.mock("./ResultsPage", () => ({
  ResultsPage: () => <div>Comparaison radar</div>,
}));

it("opens the functional Results page, navigates and exposes the connected superadmin", () => {
  const onNavigate = vi.fn();
  render(
    <ProductShell
      path="/results"
      user={{
        username: "root",
        role: "Admin",
        is_superuser: true,
        organization_name: null,
        team_names: [],
      }}
      onNavigate={onNavigate}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("link", { name: "Résultats" }));
  expect(onNavigate).toHaveBeenCalledWith("/results");
  expect(screen.getByText("Superadmin · Admin")).toBeVisible();
  expect(screen.getByText("Comparaison radar")).toBeVisible();
});
