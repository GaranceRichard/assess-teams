import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { App } from "./App";
import { PasswordRecoveryPage } from "./PasswordRecoveryPage";
import { PasswordResetPage } from "./PasswordResetPage";
import { requestPasswordRecovery, resetPassword } from "./passwords";

vi.mock("./passwords", () => ({
  requestPasswordRecovery: vi.fn(),
  resetPassword: vi.fn(),
}));
afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  window.history.replaceState({}, "", "/");
});

it("shows generic recovery success, clears the email and permits another request", async () => {
  let resolve!: () => void;
  vi.mocked(requestPasswordRecovery).mockReturnValue(
    new Promise((yes) => {
      resolve = yes;
    }),
  );
  const navigate = vi.fn();
  render(<PasswordRecoveryPage onNavigate={navigate} />);
  fireEvent.change(screen.getByLabelText("Adresse email"), {
    target: { value: "member@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Recevoir un lien" }));
  expect(
    screen.getByRole("button", { name: "Envoi de la demande…" }),
  ).toBeDisabled();
  await act(async () => resolve());
  expect(screen.getByRole("status")).toHaveTextContent(
    "Si un compte actif correspond",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Demander un nouveau lien" }),
  );
  expect(screen.getByLabelText("Adresse email")).toHaveValue("");
  fireEvent.click(
    screen.getByRole("button", { name: "Retour à la connexion" }),
  );
  expect(navigate).toHaveBeenCalledWith("/");
});

it.each([new Error("Trop de tentatives. Réessayez plus tard."), undefined])(
  "reports recovery refusal without claiming delivery",
  async (error) => {
    vi.mocked(requestPasswordRecovery).mockRejectedValue(error);
    render(<PasswordRecoveryPage onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "member@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Recevoir un lien" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      error?.message ?? "Le service est indisponible.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  },
);

it("removes the token from browser history, handles invalid links and offers renewal", async () => {
  window.history.replaceState({}, "", "/password/reset#uid/synthetic-token");
  vi.mocked(resetPassword).mockRejectedValue(
    new Error("Ce lien est invalide ou expiré."),
  );
  const navigate = vi.fn();
  render(<PasswordResetPage onNavigate={navigate} />);
  expect(window.location.hash).toBe("");
  fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
    target: { value: "Test-new-phrase!" },
  });
  fireEvent.change(screen.getByLabelText("Confirmer le nouveau mot de passe"), {
    target: { value: "Test-new-phrase!" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Modifier mon mot de passe" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "invalide ou expiré",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Demander un nouveau lien" }),
  );
  expect(navigate).toHaveBeenCalledWith("/password/forgot");
  fireEvent.click(
    screen.getByRole("button", { name: "Retour à la connexion" }),
  );
  expect(navigate).toHaveBeenCalledWith("/");
});

it("shows a missing link and a direct public recovery route", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 403 }),
  );
  window.history.replaceState({}, "", "/password/reset");
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "invalide ou expiré",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Demander un nouveau lien" }),
  );
  expect(await screen.findByLabelText("Adresse email")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Retour à la connexion" }),
  );
  expect(
    screen.getByRole("link", { name: "Mot de passe oublié ?" }),
  ).toHaveAttribute("href", "/password/forgot");
});

it("finishes reset, discards credentials and returns to login even from an old session", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({ id: 1, username: "member", role: "Viewer" }),
      { status: 200 },
    ),
  );
  vi.mocked(resetPassword).mockResolvedValue(undefined);
  window.history.replaceState({}, "", "/password/reset#uid/synthetic-token");
  render(<App />);
  fireEvent.change(await screen.findByLabelText("Nouveau mot de passe"), {
    target: { value: "Test-new-phrase!" },
  });
  fireEvent.change(screen.getByLabelText("Confirmer le nouveau mot de passe"), {
    target: { value: "Test-new-phrase!" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Modifier mon mot de passe" }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Reconnectez-vous",
  );
  expect(
    screen.queryByRole("button", { name: "Demander un nouveau lien" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Retour à la connexion" }),
  );
  expect(screen.getByRole("button", { name: "Se connecter" })).toBeVisible();
});

it("returns from public recovery to login even when a session already exists", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({ id: 1, username: "member", role: "Viewer" }),
      { status: 200 },
    ),
  );
  window.history.replaceState({}, "", "/password/forgot");
  render(<App />);
  await screen.findByLabelText("Adresse email");
  fireEvent.click(
    screen.getByRole("button", { name: "Retour à la connexion" }),
  );
  expect(screen.getByRole("button", { name: "Se connecter" })).toBeVisible();
  expect(screen.queryByText("Page non autorisée")).not.toBeInTheDocument();
});
