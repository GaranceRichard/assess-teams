import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

it("shows and hides the entered password without changing it", () => {
  render(<LoginPage error={null} onLogin={vi.fn()} />);
  const password = screen.getByLabelText("Mot de passe");

  fireEvent.change(password, { target: { value: "secret-value" } });
  expect(password).toHaveAttribute("type", "password");

  fireEvent.click(
    screen.getByRole("button", { name: "Afficher le mot de passe" }),
  );
  expect(password).toHaveAttribute("type", "text");
  expect(password).toHaveValue("secret-value");
  expect(
    screen.getByRole("button", { name: "Masquer le mot de passe" }),
  ).toHaveAttribute("aria-pressed", "true");

  fireEvent.click(
    screen.getByRole("button", { name: "Masquer le mot de passe" }),
  );
  expect(password).toHaveAttribute("type", "password");
});

it("does not submit the login form when visibility is toggled", () => {
  const onLogin = vi.fn();
  render(<LoginPage error={null} onLogin={onLogin} />);

  fireEvent.click(
    screen.getByRole("button", { name: "Afficher le mot de passe" }),
  );

  expect(onLogin).not.toHaveBeenCalled();
});
