import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { EvaluationPage } from "./EvaluationPage";

const api = vi.hoisted(() => ({
  listEvaluations: vi.fn(),
  listQuestions: vi.fn(),
  listOrganizations: vi.fn(),
}));
vi.mock("./organizations", () => ({
  listOrganizations: api.listOrganizations,
}));
vi.mock("./evaluations", async (original) => ({
  ...(await original<typeof import("./evaluations")>()),
  ...api,
}));

it("preserves the selected model and its questions when consulting another server page", async () => {
  const model = {
    id: 1,
    organization_id: 1,
    name: "First",
    family_id: 1,
    family_name: "First",
    version: 1,
    status: "DRAFT",
  };
  api.listOrganizations.mockResolvedValue([
    { id: 1, name: "North", users: [] },
  ]);
  api.listEvaluations.mockImplementation((page: number) =>
    Promise.resolve({
      count: 21,
      next: page === 1 ? "?page=2" : null,
      previous: page === 2 ? "?page=1" : null,
      results:
        page === 1
          ? [model]
          : [{ ...model, id: 21, name: "Last", family_name: "Last" }],
    }),
  );
  api.listQuestions.mockResolvedValue([
    { id: 1, index: 1, name: "Keep this question" },
  ]);
  render(<EvaluationPage />);
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  fireEvent.click(await screen.findByRole("button", { name: /First/ }));
  expect(await screen.findByText("Keep this question")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(await screen.findByRole("button", { name: /Last/ })).toBeVisible();
  expect(screen.getByRole("heading", { name: "First v1" })).toBeVisible();
  expect(screen.getByText("Keep this question")).toBeVisible();
  expect(api.listEvaluations).toHaveBeenLastCalledWith(2, 1);
});
