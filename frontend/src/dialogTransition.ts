import {
  motionAllowed,
  restoreSnapshotScroll,
  transitionSnapshot,
} from "./transitionSnapshot";

// The business close has already succeeded. Retain only paint, never a modal trap.
export function retainDialogExit(dialog: HTMLDialogElement) {
  if (!motionAllowed() || !dialog.isConnected) return;
  const copy = transitionSnapshot(dialog, "div");
  const rect = dialog.getBoundingClientRect();
  const host = document.createElement("div");
  host.className = "dialog-exit";
  host.inert = true;
  host.setAttribute("aria-hidden", "true");
  Object.assign(copy.style, {
    position: "fixed",
    margin: "0",
    boxSizing: "border-box",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    maxWidth: "none",
    maxHeight: "none",
  });
  const surface = dialog.matches(".taking-dialog")
    ? dialog
    : dialog.querySelector<HTMLElement>(":scope > div > section");
  if (surface) {
    const style = getComputedStyle(surface);
    copy.style.setProperty("--exit-opacity", style.opacity);
    copy.style.setProperty("--exit-transform", style.transform);
    if (surface === dialog && style.transform && style.transform !== "none") {
      // The measured rect already includes an unfinished opening translation.
      const transform = new DOMMatrixReadOnly(style.transform);
      copy.style.top = `${rect.top - transform.m42}px`;
      copy.style.left = `${rect.left - transform.m41}px`;
    }
  }
  host.append(copy);
  if (dialog.matches(".taking-dialog")) {
    host.style.backgroundColor = getComputedStyle(
      dialog,
      "::backdrop",
    ).backgroundColor;
  } else if (copy.firstElementChild && dialog.firstElementChild) {
    (copy.firstElementChild as HTMLElement).style.backgroundColor =
      getComputedStyle(dialog.firstElementChild).backgroundColor;
  }
  // StrictMode may close and reopen the same native dialog between frames.
  // Only a real removal/close gets a visual exit; effect replay gets no ghost.
  queueMicrotask(() => {
    if (!motionAllowed() || (dialog.isConnected && dialog.open)) return;
    document.body.append(host);
    restoreSnapshotScroll(copy);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const remove = () => {
      host.remove();
      media.removeEventListener("change", remove);
      clearTimeout(timeout);
    };
    const timeout = setTimeout(remove, 280);
    host.addEventListener("animationend", (event) => {
      if (event.target === host) remove();
    });
    media.addEventListener("change", remove, { once: true });
  });
}
