import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppreciationScale } from "./AppreciationScale";

const markers = [
  { score: 0, text: "À construire" },
  { score: 8, text: "Partagé" },
];

it("reveals markers on hover/focus and uses the nearest lower description in gaps", async () => {
  const onSelect = vi.fn();
  const { rerender } = render(
    <AppreciationScale
      markers={markers}
      score={null}
      disabled={false}
      onSelect={onSelect}
    />,
  );
  expect(screen.queryByText(/Repère pour/)).toBeNull();
  const configured = screen.getByRole("button", { name: "8 sur 10 : Partagé" });
  fireEvent.mouseEnter(configured);
  expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
    "Partagé",
  );
  fireEvent.mouseLeave(configured);
  await waitFor(() =>
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull(),
  );
  act(() => configured.focus());
  fireEvent.mouseLeave(configured);
  fireEvent.scroll(window);
  expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
    "Partagé",
  );
  fireEvent.keyDown(configured, { key: "Escape" });
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  fireEvent.keyDown(configured, { key: "ArrowRight" });
  fireEvent.click(configured);
  expect(onSelect).toHaveBeenCalledWith(8);
  rerender(
    <AppreciationScale
      markers={markers}
      score={8}
      disabled={false}
      onSelect={onSelect}
    />,
  );
  expect(screen.getByText(/Repère pour 8/).parentElement).toHaveTextContent(
    "Partagé",
  );
  act(() => configured.blur());
  fireEvent.mouseEnter(configured);
  fireEvent.scroll(window);
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  fireEvent.mouseEnter(configured);
  fireEvent.resize(window);
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  const gap = screen.getByRole("button", { name: "7 sur 10 : À construire" });
  fireEvent.focus(gap);
  fireEvent.mouseEnter(gap);
  expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
    "7 / 10 · À construire",
  );
  expect(gap).toHaveAttribute(
    "aria-describedby",
    screen.getByRole("tooltip", { hidden: true }).id,
  );
  rerender(
    <AppreciationScale
      markers={markers}
      score={7}
      disabled={false}
      onSelect={onSelect}
    />,
  );
  expect(screen.getByText(/Repère pour 7/).parentElement).toHaveTextContent(
    "À construire",
  );
});

it("keeps readonly markers available without modifying any score", () => {
  const onSelect = vi.fn();
  render(
    <AppreciationScale
      markers={markers}
      score={0}
      disabled
      onSelect={onSelect}
    />,
  );
  const button = screen.getByRole("button", {
    name: "0 sur 10 : À construire",
  });
  expect(button).toHaveAttribute("aria-pressed", "true");
  fireEvent.focus(button);
  expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
    "À construire",
  );
  fireEvent.click(button);
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.blur(button);
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  expect(screen.getByText(/Repère pour 0/).parentElement).toHaveTextContent(
    "À construire",
  );
});
