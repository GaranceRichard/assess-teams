import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { ActivityJournalPage } from "./ActivityJournalPage";
import type { SessionUser } from "./auth";
import { LogsPage } from "./LogsPage";

const actor: SessionUser = {
  username: "admin",
  role: "Admin",
  is_superuser: false,
  organization_name: null,
  team_names: [],
};

const base = {
  id: 1,
  created_at: "2026-09-28T13:42:00Z",
  organization_id: 4,
  organization_name: "DEDN",
  actor_name: "Jean Dupont",
  team_name: "Architecture",
};

afterEach(() => vi.restoreAllMocks());

it("renders and filters the distinct activity journal", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            ...base,
            action: "team_created",
            description: "Création de l’équipe",
          },
        ],
      }),
      { status: 200 },
    ),
  );
  render(<ActivityJournalPage actor={actor} />);

  expect(await screen.findByText("Création de l’équipe")).toBeVisible();
  expect(screen.getByText("DEDN")).toBeVisible();
  fireEvent.change(screen.getByLabelText("Joueur"), {
    target: { value: "Jean" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Filtrer" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(String(fetchMock.mock.calls[1][0])).toContain("player=Jean");
});

it("renders INFO, WARNING and a red ERROR row with sanitized details", async () => {
  const entries = [
    {
      ...base,
      level: "INFO",
      source: "notifications",
      operation: "Envoi",
      category: "",
      message: "Notification envoyée",
      correlation_id: "info-id",
    },
    {
      ...base,
      id: 2,
      level: "WARNING",
      source: "teams",
      operation: "Contrôle",
      category: "",
      message: "Équipe sans coach",
      correlation_id: "warning-id",
    },
    {
      ...base,
      id: 3,
      organization_name: "",
      actor_name: "",
      team_name: "",
      level: "ERROR",
      source: "assessments",
      operation: "Enregistrement",
      category: "ValidationError",
      message: "Échec lors de l’enregistrement",
      correlation_id: "error-id",
    },
  ];
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          count: 21,
          next: "/api/admin/logs/?page=2",
          previous: null,
          results: entries,
        }),
        { status: 200 },
      ),
    ),
  );
  render(<LogsPage actor={actor} />);

  await screen.findAllByText("INFO");
  const info = screen
    .getAllByText("INFO")
    .find((node) => node.matches("strong"))!;
  const warning = screen
    .getAllByText("WARNING")
    .find((node) => node.matches("strong"))!;
  const error = screen
    .getAllByText("ERROR")
    .find((node) => node.matches("strong"))!;
  expect(info.closest("tr")).toHaveClass("log-row--info");
  expect(warning.closest("tr")).toHaveClass("log-row--warning");
  expect(error.closest("tr")).toHaveClass("log-row--error");
  expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
  fireEvent.click(screen.getAllByText("Détails")[2]);
  expect(screen.getByText("ValidationError")).toBeVisible();
  expect(screen.getByText("error-id")).toBeVisible();

  fireEvent.change(screen.getByLabelText("Niveau"), {
    target: { value: "ERROR" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Filtrer" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(String(fetchMock.mock.calls[1][0])).toContain("level=ERROR");
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(String(fetchMock.mock.calls[2][0])).toContain("page=2");
});

it("shows loading failures and clears filters", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 500 }),
  );
  render(<ActivityJournalPage actor={actor} />);

  expect(
    await screen.findByText("Impossible de charger le journal."),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
  expect(screen.getByLabelText("Joueur")).toHaveValue("");
});

it("offers organization filtering only to a Superadmin", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input) => {
      const body = String(input).includes("/organizations/")
        ? [{ id: 4, name: "DEDN", users: [] }]
        : { count: 0, next: null, previous: null, results: [] };
      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200 }),
      );
    });
  const { unmount } = render(<LogsPage actor={actor} />);
  expect(screen.queryByLabelText("Organisation")).not.toBeInTheDocument();
  unmount();

  render(<LogsPage actor={{ ...actor, is_superuser: true }} />);
  await screen.findByRole("option", { name: "DEDN" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "4" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Filtrer" }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("organization_id=4"),
      ),
    ).toBe(true),
  );
});
