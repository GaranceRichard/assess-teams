import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppreciationScale } from "./AppreciationScale";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
const markers = [
  { score: 0, text: "À construire" },
  { score: 10, text: "Partagé" },
];
const level = (score: number) =>
  screen.getByRole("button", { name: new RegExp(`^${score} sur 10`) });
const tooltip = () => screen.getByRole("tooltip", { hidden: true });
const absent = () =>
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
const setup = () =>
  render(
    <AppreciationScale
      markers={markers}
      score={null}
      disabled
      onSelect={vi.fn()}
    />,
  );

it("maintient le repère sous le pointeur et permet son défilement", () => {
  setup();
  fireEvent.mouseEnter(level(0));
  fireEvent.mouseLeave(level(0));
  fireEvent.mouseEnter(tooltip());
  act(() => vi.advanceTimersByTime(120));
  fireEvent.scroll(tooltip());
  expect(tooltip()).toHaveTextContent("À construire");
  fireEvent.mouseLeave(tooltip());
  act(() => vi.advanceTimersByTime(120));
  absent();
});

it("un ancien départ du pointeur ne ferme pas le nouveau niveau survolé", () => {
  setup();
  fireEvent.mouseEnter(level(0));
  fireEvent.mouseEnter(level(10));
  fireEvent.mouseLeave(level(0));
  act(() => vi.advanceTimersByTime(120));
  expect(tooltip()).toHaveTextContent("Partagé");
  fireEvent.mouseEnter(level(5));
  absent();
});

it("Échap ferme un repère survolé depuis tout contrôle sans fermer la modale", () => {
  const key = vi.fn();
  render(
    <div onKeyDown={key}>
      <input aria-label="Autre contrôle" />
      <AppreciationScale
        markers={markers}
        score={null}
        disabled
        onSelect={vi.fn()}
      />
    </div>,
  );
  fireEvent.mouseEnter(level(10));
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
  absent();
  expect(key).not.toHaveBeenCalled();
});

it("annule la fermeture différée et les listeners au démontage", () => {
  const { unmount } = setup();
  fireEvent.mouseEnter(level(0));
  fireEvent.mouseLeave(level(0));
  unmount();
  act(() => vi.advanceTimersByTime(120));
  const key = vi.fn();
  document.addEventListener("keydown", key);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(key).toHaveBeenCalledOnce();
  document.removeEventListener("keydown", key);
});
