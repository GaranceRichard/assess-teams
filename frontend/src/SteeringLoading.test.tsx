import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { SteeringPage } from "./SteeringPage";
import { resultActor, resultOrganizations } from "./test/resultsFixture";
import { steeringFixture } from "./test/steeringFixture";

const api = vi.hoisted(() => ({
  listSteeringOrganizations: vi.fn(),
  getSteering: vi.fn(),
}));
vi.mock("./steering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./steering")>()),
  ...api,
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.listSteeringOrganizations.mockResolvedValue([resultOrganizations[0]]);
  api.getSteering.mockResolvedValue(steeringFixture);
});

it.each([
  ["success", "success"],
  ["error", "success"],
  ["success", "error"],
  ["error", "error"],
])("ignores obsolete projection %s after current %s", async (old, current) => {
  let resolve!: (value: typeof steeringFixture) => void;
  let reject!: (error: Error) => void;
  api.listSteeringOrganizations.mockResolvedValue(resultOrganizations);
  api.getSteering
    .mockReturnValueOnce(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    )
    .mockImplementationOnce(() =>
      current === "success"
        ? Promise.resolve({ ...steeringFixture, teams: [] })
        : Promise.reject(new Error("B failed")),
    );
  render(
    <SteeringPage
      actor={{ ...resultActor, is_superuser: true }}
      onNavigate={vi.fn()}
    />,
  );
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("Chargement");
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "2" },
  });
  if (current === "success")
    await screen.findByText("Aucune équipe active dans cette organisation.");
  else await screen.findByRole("alert");
  await act(async () => {
    if (old === "success") resolve(steeringFixture);
    else reject(new Error("A failed"));
  });
  expect(screen.getByLabelText("Organisation")).toHaveValue("2");
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  if (current === "success")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  else
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Impossible de charger le pilotage",
    );
});

it("does not present previous page teams as current after a page failure", async () => {
  let reject!: (error: Error) => void;
  api.getSteering
    .mockResolvedValueOnce({
      ...steeringFixture,
      pagination: { count: 21, page: 1, pages: 2 },
    })
    .mockReturnValueOnce(
      new Promise((_, no) => {
        reject = no;
      }),
    );
  render(<SteeringPage actor={resultActor} onNavigate={vi.fn()} />);
  await screen.findByText("Alpha");
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  await act(async () => reject(new Error("page 2 failed")));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Impossible de charger le pilotage",
  );
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
});
