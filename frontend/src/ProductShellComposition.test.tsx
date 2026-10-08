import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ProductShell } from "./ProductShell";
import { dashboardFixture } from "./test/dashboardFixture";

it("compose une page autorisée et conserve le refus sur une route interdite", () => {
  const sessionUser = dashboardFixture.profile;
  const props = {
    user: sessionUser,
    path: "/dashboard",
    theme: "day" as const,
    onThemeChange: () => {},
    onNavigate: () => {},
    onLogout: async () => {},
    headerAction: <button>Action de session</button>,
    pageContent: <p>Page composée</p>,
    pageNotice: <aside>Contexte local</aside>,
  };
  const view = render(<ProductShell {...props} />);
  expect(screen.getByText("Page composée")).toBeInTheDocument();
  expect(screen.getByText("Action de session")).toBeInTheDocument();
  view.rerender(
    <ProductShell
      {...props}
      path="/teams"
      user={{ ...sessionUser, role: "Viewer" }}
    />,
  );
  expect(screen.queryByText("Page composée")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent("Page non autorisée");
});
