import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { ActivityJournalPage } from "./ActivityJournalPage";
import type { SessionUser } from "./auth";

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

it("keeps activity organization filtering, pagination and reset separate from HTTP Logs", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input) => {
      const url = String(input);
      const body =
        url === "/api/admin/organizations/"
          ? [{ id: 4, name: "DEDN", users: [] }]
          : {
              count: 21,
              next: "?page=2",
              previous: url.includes("page=2") ? "?page=1" : null,
              results: [
                {
                  ...base,
                  action: "team_created",
                  description: "Business activity",
                },
              ],
            };
      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200 }),
      );
    });
  render(<ActivityJournalPage actor={{ ...actor, is_superuser: true }} />);
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
  expect(screen.queryByLabelText("Méthode")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  await waitFor(() =>
    expect(screen.getByText("Page 2 · 21 entrées")).toBeVisible(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  await waitFor(() =>
    expect(screen.getByText("Page 1 · 21 entrées")).toBeVisible(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
  expect(screen.getByLabelText("Organisation")).toHaveValue("");
});
