import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { LegalLink } from "./LegalLink";
import { LoginPage } from "./LoginPage";

it.each([false, true])(
  "offers an accessible local notice link (collapsed=%s)",
  (collapsed) => {
    render(<LegalLink collapsed={collapsed} />);
    expect(
      screen.getByRole("link", { name: "Mentions légales et licence" }),
    ).toHaveAttribute("href", `${import.meta.env.BASE_URL}legal/index.html`);
  },
);

it("offers the notices before authentication, including when login is refused", () => {
  render(
    <LoginPage
      error="Identifiant ou mot de passe invalide."
      onLogin={vi.fn()}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("invalide");
  expect(
    screen.getByRole("link", { name: "Mentions légales et licence" }),
  ).toBeVisible();
});
