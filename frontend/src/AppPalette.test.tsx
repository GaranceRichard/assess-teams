import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { App } from "./App";

const user = {
  username: "lea",
  role: "Viewer",
  is_superuser: false,
  organization_name: null,
  team_names: [],
  interface_palette: "blue",
};
const response = (body: object) => new Response(JSON.stringify(body));

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

it("restores from the session despite a browser preference and preserves night mode", async () => {
  localStorage.setItem("assess-teams-palette", "red");
  localStorage.setItem("assess-teams-theme", "night");
  vi.spyOn(globalThis, "fetch").mockResolvedValue(response(user));
  render(<App />);
  await screen.findByText("lea");
  expect(document.documentElement).toHaveAttribute("data-palette", "blue");
  expect(document.documentElement).toHaveAttribute("data-theme", "night");
  fireEvent.click(screen.getByText("Couleurs"));
  expect(screen.getByLabelText("Bleu")).toBeChecked();
});

it("applies a login preference, resets at logout and isolates the next account", async () => {
  vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(null, { status: 403 }))
    .mockResolvedValueOnce(response({ ...user, interface_palette: "pink" }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(
      response({ ...user, username: "other", interface_palette: "green" }),
    );
  render(<App />);
  await screen.findByLabelText("Identifiant");
  const enter = (name: string) => {
    fireEvent.change(screen.getByLabelText("Identifiant"), {
      target: { value: name },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "test-credential" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
  };
  enter("lea");
  await screen.findByText("lea");
  expect(document.documentElement.dataset.palette).toBe("pink");
  fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));
  await screen.findByLabelText("Identifiant");
  expect(document.documentElement.dataset.palette).toBe("green");
  enter("other");
  await screen.findByText("other");
  expect(document.documentElement.dataset.palette).toBe("green");
});
