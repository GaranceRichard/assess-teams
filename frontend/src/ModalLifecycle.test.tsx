import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useState } from "react";
import { expect, it, vi } from "vitest";

import { Modal } from "./Modal";
import { dialogControls, restoreDialogFocus } from "./dialogFocus";

function Harness({ removeOpener = false }: { removeOpener?: boolean }) {
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  return (
    <section>
      <h1>Collection</h1>
      {!removed && <button onClick={() => setOpen(true)}>Ouvrir</button>}
      {open && (
        <Modal
          backdropClassName="backdrop"
          labelledBy="title"
          onClose={() => setOpen(false)}
        >
          <h2 id="title">Dialogue</h2>
          <button
            onClick={() => {
              setOpen(false);
              if (removeOpener) setRemoved(true);
            }}
          >
            Fermer
          </button>
        </Modal>
      )}
    </section>
  );
}

it("returns focus to the opener after repeated openings under StrictMode", async () => {
  render(
    <StrictMode>
      <Harness />
    </StrictMode>,
  );
  const opener = screen.getByRole("button", { name: "Ouvrir" });
  for (let i = 0; i < 2; i++) {
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("button", { name: "Fermer" })).toHaveFocus();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Fermer" })),
    );
    expect(opener).toHaveFocus();
  }
});

it("returns to the collection title when a successful action removes the opener", async () => {
  render(<Harness removeOpener />);
  screen.getByRole("button", { name: "Ouvrir" }).focus();
  fireEvent.click(screen.getByRole("button", { name: "Ouvrir" }));
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Fermer" })),
  );
  const title = screen.getByRole("heading", { name: "Collection" });
  expect(title).toHaveFocus();
  title.blur();
  expect(title).not.toHaveAttribute("tabindex");
});

it("does not steal focus from a replacement dialog", async () => {
  function Replacement() {
    const [second, setSecond] = useState(false);
    return (
      <Modal
        key={String(second)}
        backdropClassName="backdrop"
        labelledBy={second ? "second" : "first"}
        onClose={vi.fn()}
      >
        <h2 id={second ? "second" : "first"}>
          {second ? "Second" : "Premier"}
        </h2>
        <button onClick={() => setSecond(true)}>
          {second ? "Terminer" : "Continuer"}
        </button>
      </Modal>
    );
  }
  render(<Replacement />);
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Continuer" })),
  );
  expect(screen.getByRole("button", { name: "Terminer" })).toHaveFocus();
});

it("retains focus at the title while all actions are disabled, then recovers when content changes", async () => {
  const { rerender } = render(
    <Modal backdropClassName="backdrop" labelledBy="title" onClose={vi.fn()}>
      <h2 id="title">Attente</h2>
      <button disabled>Enregistrement</button>
    </Modal>,
  );
  const title = screen.getByRole("heading");
  expect(title).toHaveFocus();
  fireEvent.keyDown(title, { key: "Enter" });
  fireEvent.keyDown(title, { key: "Tab" });
  expect(title).toHaveFocus();
  rerender(
    <Modal backdropClassName="backdrop" labelledBy="title" onClose={vi.fn()}>
      <h2 id="title">Attente</h2>
      <button>Question suivante</button>
    </Modal>,
  );
  const next = screen.getByRole("button");
  next.focus();
  await act(async () =>
    rerender(
      <Modal backdropClassName="backdrop" labelledBy="title" onClose={vi.fn()}>
        <h2 id="title">Attente</h2>
        <input aria-label="Nouvelle question" />
      </Modal>,
    ),
  );
  expect(screen.getByRole("textbox")).toHaveFocus();
});

it("preserves the previous tabindex and supports a replacement page without a heading", () => {
  const { container } = render(
    <main>
      <h1 tabIndex={0}>Titre</h1>
      <button>Cr?er</button>
    </main>,
  );
  const opener = document.createElement("button");
  restoreDialogFocus(opener, null);
  const title = screen.getByRole("heading");
  expect(title).toHaveFocus();
  title.blur();
  expect(title).toHaveAttribute("tabindex", "0");
  title.remove();
  restoreDialogFocus(opener, null);
  expect(screen.getByRole("button")).toHaveFocus();
  container.remove();
  restoreDialogFocus(opener, null);
});

it("ignores disabled, hidden, inert, negative-tabindex and invisible controls", () => {
  const { container } = render(
    <div>
      <button disabled>Disabled</button>
      <input type="hidden" />
      <div hidden>
        <button>Hidden</button>
      </div>
      <div inert>
        <button>Inert</button>
      </div>
      <button tabIndex={-1}>Negative</button>
      <button style={{ display: "none" }}>None</button>
      <button style={{ visibility: "hidden" }}>Invisible</button>
      <div style={{ display: "none" }}>
        <button>Hidden parent</button>
      </div>
      <button>Available</button>
    </div>,
  );
  expect(dialogControls(container)).toEqual([
    screen.getByRole("button", { name: "Available" }),
  ]);
});
