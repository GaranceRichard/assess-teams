import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

it("keeps the confirmation open for an inside click and supports cancel", () => {
  const cancel = vi.fn();
  const { container } = render(
    <ConfirmDialog name="Alice" onCancel={cancel} onConfirm={vi.fn()} />,
  );

  fireEvent.mouseDown(screen.getByRole("dialog"));
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  expect(cancel).toHaveBeenCalledOnce();

  fireEvent.mouseDown(container.querySelector(".dialog-backdrop")!);
  expect(cancel).toHaveBeenCalledTimes(2);
});
