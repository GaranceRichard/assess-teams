import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { App } from "./App";

function response(status: number, body?: object) {
  return Promise.resolve(
    new Response(body ? JSON.stringify(body) : null, { status }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

it("returns a Coach to the evaluation link after login", async () => {
  window.history.replaceState({}, "", "/evaluations");
  vi.spyOn(globalThis, "fetch")
    .mockImplementationOnce(() => response(403))
    .mockImplementationOnce(() =>
      response(200, {
        username: "coach",
        role: "Coach",
        is_superuser: false,
        organization_name: "North",
        team_names: ["Alpha"],
      }),
    )
    .mockImplementationOnce(() => response(200, []));
  render(<App />);

  fireEvent.change(await screen.findByLabelText("Identifiant"), {
    target: { value: "coach" },
  });
  fireEvent.change(screen.getByLabelText("Mot de passe"), {
    target: { value: "credential" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

  expect(
    await screen.findByRole("heading", { name: "Évaluations à passer" }),
  ).toBeVisible();
  expect(window.location.pathname).toBe("/evaluations");
});
