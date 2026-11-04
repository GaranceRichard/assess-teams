import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ActivityJournalPage } from "./ActivityJournalPage";
import { CollectionFrame } from "./CollectionFrame";
import { LogsPage } from "./LogsPage";
import { logAdmin, logEntries } from "./logsTestFixtures";

const cases = [
  {
    name: "Journal",
    view: <ActivityJournalPage actor={logAdmin} />,
    path: "/activity-journal/",
    field: "Joueur",
    value: "Absent",
    empty: "Aucune entr\u00e9e accessible.",
    filtered: "Aucune entr\u00e9e ne correspond aux filtres.",
    entry: {
      ...logEntries[0],
      action: "team_created",
      description: "Activit\u00e9 accessible",
    },
    text: "Activit\u00e9 accessible",
  },
  {
    name: "Logs",
    view: <LogsPage actor={logAdmin} />,
    path: "/logs/",
    field: "Niveau",
    value: "ERROR",
    empty: "Aucun log accessible.",
    filtered: "Aucun log ne correspond aux filtres.",
    entry: logEntries[0],
    text: logEntries[0].message,
  },
];
afterEach(() => vi.restoreAllMocks());
function response(results: unknown[]) {
  return new Response(
    JSON.stringify({
      count: results.length,
      results,
      next: null,
      previous: null,
    }),
  );
}

it.each(cases)(
  "$name distinguishes absence, applied filters and recovery without showing stale emptiness",
  async (item) => {
    let results: unknown[] = [];
    let release!: (value: Response) => void;
    let pending = false;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (!String(input).includes(item.path))
        return Promise.resolve(new Response("[]"));
      return pending
        ? new Promise<Response>((resolve) => {
            release = resolve;
          })
        : Promise.resolve(response(results));
    });
    render(item.view);
    expect(await screen.findByText(item.empty)).toBeVisible();
    results = [item.entry];
    fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
    expect((await screen.findAllByText(item.text))[0]).toBeVisible();
    pending = true;
    fireEvent.change(screen.getByLabelText(item.field), {
      target: { value: item.value },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Chargement");
    expect(screen.queryByText(item.empty)).not.toBeInTheDocument();
    expect(screen.queryByText(item.filtered)).not.toBeInTheDocument();
    await act(async () => release(response([])));
    expect(await screen.findByText(item.filtered)).toBeVisible();
    pending = true;
    fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
    expect(screen.queryByText(item.filtered)).not.toBeInTheDocument();
    await act(async () => release(response(results)));
    expect((await screen.findAllByText(item.text))[0]).toBeVisible();
    expect(screen.getByLabelText(item.field)).toHaveValue("");
  },
);

it.each(
  cases.flatMap((item) => [403, 500].map((status) => ({ ...item, status }))),
)("$name never treats HTTP $status as valid emptiness", async (item) => {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
    Promise.resolve(
      String(input).includes(item.path)
        ? new Response(null, { status: item.status })
        : new Response("[]"),
    ),
  );
  render(item.view);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger",
  );
  expect(screen.queryByText(item.empty)).not.toBeInTheDocument();
  expect(screen.queryByText(item.filtered)).not.toBeInTheDocument();
});

it("collection frame hides empty content and synthetic counts during loading and refusal", () => {
  const props = {
    page: 1,
    count: 0,
    onChange: vi.fn(),
    errorMessage: "Lecture refus\u00e9e",
  };
  const view = render(
    <CollectionFrame {...props} loading>
      <p>Aucune donnée</p>
    </CollectionFrame>,
  );
  expect(screen.getByRole("status")).toBeVisible();
  expect(screen.queryByText("Aucune donnée")).not.toBeInTheDocument();
  view.rerender(
    <CollectionFrame {...props} failed>
      <p>Aucune donnée</p>
    </CollectionFrame>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Lecture refus\u00e9e");
  expect(screen.queryByText("Aucune donnée")).not.toBeInTheDocument();
  expect(screen.queryByText("0 \u00e9l\u00e9ment")).not.toBeInTheDocument();
  view.rerender(
    <CollectionFrame {...props}>
      <p>Aucune donnée</p>
    </CollectionFrame>,
  );
  expect(screen.getByText("Aucune donnée")).toBeVisible();
});
