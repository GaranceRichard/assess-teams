import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AppreciationScale } from "./AppreciationScale";

it("draws only explicitly described levels at their proportional slider positions", () => {
  const { container } = render(
    <AppreciationScale
      markers={[
        { score: 0, text: "Initial" },
        { score: 5, text: "Accompagné" },
        { score: 7, text: "Autonome" },
        { score: 10, text: "Partagé" },
        { score: 3, text: "  " },
      ]}
      score={6}
    />,
  );
  const dots = container.querySelectorAll<HTMLElement>(".marker-dot");
  expect([...dots].map((dot) => dot.dataset.score)).toEqual([
    "0",
    "5",
    "7",
    "10",
  ]);
  expect([...dots].map((dot) => dot.style.left)).toEqual([
    "0%",
    "50%",
    "70%",
    "100%",
  ]);
  expect(screen.queryByRole("button")).toBeNull();
});

it("adds no points or description when no markers are defined", () => {
  const { container } = render(<AppreciationScale markers={[]} score={6} />);
  expect(container.querySelector(".marker-dot")).toBeNull();
  expect(screen.queryByText(/Repère pour/)).toBeNull();
});
