import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AppreciationScale } from "./AppreciationScale";

const markers = [
  { score: 7, text: "Autonome" },
  { score: 5, text: "Accompagné" },
];

it("uses the closest explicit lower bound without changing the selected score", () => {
  const { rerender } = render(
    <AppreciationScale markers={markers} score={6} />,
  );
  expect(screen.getByText(/Repère pour 6/).parentElement).toHaveTextContent(
    "Accompagné",
  );
  rerender(<AppreciationScale markers={markers} score={7} />);
  expect(screen.getByText(/Repère pour 7/).parentElement).toHaveTextContent(
    "Autonome",
  );
  rerender(<AppreciationScale markers={markers} score={4} />);
  expect(screen.queryByText(/Repère pour/)).toBeNull();
  rerender(<AppreciationScale markers={markers} score={null} />);
  expect(screen.queryByText(/Repère pour/)).toBeNull();
});
