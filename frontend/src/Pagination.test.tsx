import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";
import { CollectionFrame } from "./CollectionFrame";

it("keeps small collections whole and exposes totals and navigation for larger ones", () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <CollectionFrame page={1} count={20} onChange={onChange}>
      Content
    </CollectionFrame>,
  );
  expect(screen.queryByRole("navigation")).toBeNull();
  rerender(
    <CollectionFrame page={1} count={41} onChange={onChange}>
      Content
    </CollectionFrame>,
  );
  expect(screen.getByText("Page 1 / 3 · 41 éléments")).toBeVisible();
  expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(onChange).toHaveBeenCalledWith(2);
  rerender(<Pagination page={3} count={41} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  expect(onChange).toHaveBeenCalledWith(2);
});

it("refuses navigation while the server page is loading", () => {
  render(<Pagination page={2} count={60} busy onChange={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
});
