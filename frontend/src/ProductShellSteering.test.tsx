import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ProductShell } from "./ProductShell";
import { resultActor } from "./test/resultsFixture";

vi.mock("./SteeringPage", () => ({
  SteeringPage: () => <p>Couverture du dispositif</p>,
}));

it("opens functional steering for Admin and Superadmin and denies Coach and Viewer", () => {
  for (const actor of [resultActor, { ...resultActor, is_superuser: true }]) {
    const view = render(
      <ProductShell
        path="/steering"
        user={actor}
        onNavigate={vi.fn()}
        onLogout={vi.fn()}
        theme="day"
        onThemeChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Couverture du dispositif")).toBeVisible();
    view.unmount();
  }
  for (const role of ["Coach", "Viewer"] as const) {
    const view = render(
      <ProductShell
        path="/steering"
        user={{ ...resultActor, role }}
        onNavigate={vi.fn()}
        onLogout={vi.fn()}
        theme="night"
        onThemeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Page non autorisée");
    expect(
      screen.queryByText("Couverture du dispositif"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Pilotage" }),
    ).not.toBeInTheDocument();
    view.unmount();
  }
});
