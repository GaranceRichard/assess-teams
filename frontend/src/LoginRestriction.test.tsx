import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { App } from "./App";
import { login } from "./auth";

vi.mock("./dashboard", () => ({ getDashboard: () => new Promise(() => {}) }));

const credential = "test-only-credential";

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

it("shows the wait and allows login after the restriction expires", async () => {
  vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(null, { status: 403 }))
    .mockResolvedValueOnce(
      new Response(null, {
        status: 429,
        headers: { "Retry-After": "60" },
      }),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          username: "member",
          role: "Viewer",
          is_superuser: false,
          organization_name: null,
          team_names: [],
          interface_palette: "green",
        }),
      ),
    );
  render(<App />);
  fireEvent.change(await screen.findByLabelText("Identifiant"), {
    target: { value: "member" },
  });
  fireEvent.change(screen.getByLabelText("Mot de passe", { exact: true }), {
    target: { value: credential },
  });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Trop de tentatives de connexion. Réessayez dans 60 secondes.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
  expect(
    await screen.findByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
});

it.each([null, "invalid", "-1"])(
  "handles an unusable Retry-After: %s",
  async (wait) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 429,
        headers: wait === null ? {} : { "Retry-After": wait },
      }),
    );
    await expect(
      login({ username: "member", password: credential }),
    ).rejects.toThrow("Réessayez dans quelques minutes.");
  },
);
