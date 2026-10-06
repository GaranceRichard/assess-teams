import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { SessionUser } from "./auth";
import { ProductShell } from "./ProductShell";

vi.mock("./ActivityJournalPage", () => ({
  ActivityJournalPage: () => <div>Activités journalisées</div>,
}));
vi.mock("./LogsPage", () => ({
  LogsPage: () => <div>Logs applicatifs</div>,
}));

const admin: SessionUser = {
  username: "admin",
  role: "Admin",
  is_superuser: false,
  organization_name: null,
  team_names: [],
  interface_palette: "green" as const,
};

function renderRoute(path: string) {
  return render(
    <ProductShell
      path={path}
      user={admin}
      onNavigate={vi.fn()}
      onLogout={vi.fn()}
      theme="day"
      onThemeChange={vi.fn()}
    />,
  );
}

it("routes each journal to its distinct page", () => {
  const { unmount } = renderRoute("/activity-journal");
  expect(screen.getByText("Activités journalisées")).toBeVisible();
  unmount();

  renderRoute("/logs");
  expect(screen.getByText("Logs applicatifs")).toBeVisible();
});
