import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppreciationScale } from "./AppreciationScale";

it("offers eleven unnumbered targets and reveals scores even without descriptions", () => {
  const onSelect = vi.fn();
  const { container, rerender } = render(
    <AppreciationScale
      markers={[]}
      score={null}
      disabled={false}
      onSelect={onSelect}
    />,
  );
  const buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(11);
  for (const [level, button] of buttons.entries()) {
    expect(button).toHaveAccessibleName(`${level} sur 10`);
    expect(button.textContent).toBe("");
    fireEvent.focus(button);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
      `${level} / 10`,
    );
    fireEvent.click(button);
    expect(onSelect).toHaveBeenLastCalledWith(level);
  }
  rerender(
    <AppreciationScale
      markers={[]}
      score={6}
      disabled={false}
      onSelect={onSelect}
    />,
  );
  expect(buttons[6]).toHaveAttribute("aria-pressed", "true");
  expect(buttons[5]).toHaveAttribute("aria-pressed", "false");
  expect(
    container.querySelector(".appreciation-description"),
  ).toBeEmptyDOMElement();
  fireEvent.blur(buttons[10]);
  fireEvent.mouseEnter(buttons[0]);
  expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
    "0 / 10",
  );
});
