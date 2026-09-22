import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import type { SessionUser } from "./auth";

const viewer: SessionUser = {
  username: "lea",
  role: "Viewer",
  is_superuser: false,
};

function response(status: number, body?: object) {
  return Promise.resolve(
    new Response(body ? JSON.stringify(body) : null, { status }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  window.history.replaceState({}, "", "/");
});

describe("product authentication journey", () => {
  it("shows login then opens the role workspace with valid credentials", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => response(403))
      .mockImplementationOnce(() => response(200, viewer));
    render(<App />);

    fireEvent.change(await screen.findByLabelText("Identifiant"), {
      target: { value: "lea" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "correct-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByText("Tableau de bord — fonctionnalité à venir"),
    ).toBeVisible();
    expect(screen.getByText("lea")).toBeVisible();
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("refuses invalid credentials and keeps the login screen", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => response(403))
      .mockImplementationOnce(() => response(401, { detail: "Invalid" }));
    render(<App />);

    fireEvent.change(await screen.findByLabelText("Identifiant"), {
      target: { value: "lea" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiant ou mot de passe invalide.",
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("logs out and returns to login", async () => {
    document.cookie = "csrftoken=csrf-value";
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => response(200, viewer))
      .mockImplementationOnce(() => response(204));
    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Se déconnecter" }),
    );

    expect(
      await screen.findByRole("button", { name: "Se connecter" }),
    ).toBeVisible();
    expect(window.location.pathname).toBe("/");
  });

  it("refuses a direct route outside the connected role", async () => {
    window.history.replaceState({}, "", "/users");
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
      response(200, viewer),
    );
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Page non autorisée",
    );
    expect(
      screen.queryByRole("link", { name: "Utilisateurs" }),
    ).not.toBeInTheDocument();
  });

  it("reports an unavailable authentication service", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network unavailable"),
    );
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Le service est indisponible.",
    );
  });

  it("follows browser history navigation", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
      response(200, viewer),
    );
    render(<App />);
    await screen.findByRole("navigation");

    window.history.pushState({}, "", "/results");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() =>
      expect(
        screen.getByText("Résultats — fonctionnalité à venir"),
      ).toBeVisible(),
    );
  });

  it("restores and changes the day or night theme", async () => {
    localStorage.setItem("assess-teams-theme", "night");
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
      response(200, viewer),
    );
    render(<App />);

    const selector = await screen.findByLabelText("Thème");
    expect(selector).toHaveValue("night");
    expect(document.documentElement).toHaveAttribute("data-theme", "night");
    fireEvent.change(selector, { target: { value: "day" } });

    expect(document.documentElement).toHaveAttribute("data-theme", "day");
    expect(localStorage.getItem("assess-teams-theme")).toBe("day");
  });

  it("opens an invitation after initializing CSRF and returns to login", async () => {
    window.history.replaceState({}, "", "/invitation/uid/token");
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => response(403))
      .mockImplementationOnce(() => response(204));
    render(<App />);

    expect(screen.getByText("Chargement…")).toBeVisible();
    fireEvent.change(await screen.findByLabelText("Mot de passe"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));

    expect(
      await screen.findByRole("button", { name: "Se connecter" }),
    ).toBeVisible();
    expect(window.location.pathname).toBe("/");
  });
});
