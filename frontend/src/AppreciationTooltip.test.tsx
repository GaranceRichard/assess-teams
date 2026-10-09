import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AppreciationScale } from "./AppreciationScale";

it("never adds hover, focus or click content and keeps points out of keyboard navigation", () => {
  const { container } = render(
    <AppreciationScale
      markers={[{ score: 5, text: "Accompagné" }]}
      score={6}
    />,
  );
  const point = container.querySelector<HTMLElement>(".marker-dot")!;
  const original = container.innerHTML;
  fireEvent.mouseEnter(point);
  fireEvent.focus(point);
  fireEvent.click(point);
  expect(container.innerHTML).toBe(original);
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  expect(point).not.toHaveAttribute("title");
  expect(point).not.toHaveAttribute("tabindex");
  expect(point.parentElement).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByText(/Repère pour 6/).parentElement).toHaveTextContent(
    "Accompagné",
  );
});
