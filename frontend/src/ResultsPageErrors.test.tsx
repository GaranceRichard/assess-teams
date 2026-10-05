import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { ResultsPage } from "./ResultsPage";
import type { ResultComparison, ResultVersion } from "./results";
import { resultComparison, resultVersions } from "./test/resultsFixture";

const api = vi.hoisted(() => ({
  listResultVersions: vi.fn(),
  getResultComparison: vi.fn(),
}));
vi.mock("./results", () => api);
vi.mock("react-chartjs-2", () => ({
  Radar: () => <canvas role="img" aria-label="Radar" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.listResultVersions.mockResolvedValue(resultVersions);
  api.getResultComparison.mockResolvedValue(resultComparison);
});

function deferred<T>() {
  let resolve!: (data: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

async function choose(value = "1") {
  await screen.findByRole("option", { name: "Maturité — v1 · North" });
  fireEvent.change(screen.getByLabelText("Modèle / version"), {
    target: { value },
  });
}

it("shows list failures and an empty accessible list", async () => {
  api.listResultVersions.mockRejectedValueOnce(new Error("offline"));
  const { unmount } = render(<ResultsPage theme="day" />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les modèles avec résultats.",
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  unmount();
  api.listResultVersions.mockResolvedValueOnce([]);
  render(<ResultsPage theme="day" />);
  expect(
    await screen.findByText("Aucune passation complétée accessible."),
  ).toBeVisible();
  expect(screen.getByLabelText("Modèle / version")).toBeDisabled();
});

it("shows comparison loading, failure and recovery on another selection", async () => {
  const pending = deferred<ResultComparison>();
  api.getResultComparison.mockReturnValueOnce(pending.promise);
  render(<ResultsPage theme="day" />);
  await choose();
  expect(screen.getByRole("status")).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  await act(async () => pending.reject(new Error("404")));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les résultats de cette version.",
  );
  await choose("2");
  expect(await screen.findByRole("img")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it.each([
  { axes: [], teams: [] },
  { ...resultComparison, teams: [] },
])("shows an unusable comparison without drawing scores", async (data) => {
  api.getResultComparison.mockResolvedValueOnce(data);
  render(<ResultsPage theme="day" />);
  await choose();
  expect(
    await screen.findByText("Aucun résultat exploitable pour cette version."),
  ).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

it.each(["success", "error"])(
  "ignores stale comparison %s after switching versions",
  async (outcome) => {
    const pending = deferred<ResultComparison>();
    api.getResultComparison.mockReturnValueOnce(pending.promise);
    render(<ResultsPage theme="day" />);
    await choose();
    await choose("2");
    await screen.findByRole("img");
    await act(async () => {
      if (outcome === "success") pending.resolve({ axes: [], teams: [] });
      else pending.reject(new Error("old request"));
    });
    expect(screen.getByRole("img")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);

it.each(["success", "error"])(
  "ignores a pending list %s after unmount",
  async (outcome) => {
    const pending = deferred<ResultVersion[]>();
    api.listResultVersions.mockReturnValueOnce(pending.promise);
    const { unmount } = render(<ResultsPage theme="day" />);
    unmount();
    await act(async () => {
      if (outcome === "success") pending.resolve(resultVersions);
      else pending.reject(new Error("old request"));
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
