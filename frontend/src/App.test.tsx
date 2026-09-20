import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("application shell", () => {
  it("renders the shell then reports the healthy API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", database: "ok" }), {
        status: 200,
      }),
    );

    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Assess teams" }),
    ).toBeVisible();
    expect(screen.getByText("Vérification en cours…")).toBeVisible();
    expect(
      await screen.findByText("API opérationnelle · SQLite ok"),
    ).toBeVisible();
  });

  it("reports an unavailable API without hiding the shell", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network unavailable"),
    );

    render(<App />);

    expect(await screen.findByText(/API indisponible/)).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 1, name: "Assess teams" }),
    ).toBeVisible();
  });
});
