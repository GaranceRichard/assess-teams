const focusableSelector =
  'button, input:not([type="hidden"]), select, textarea, a[href], [tabindex]';

function isVisible(element: HTMLElement): boolean {
  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    const style = getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return false;
  }
  return true;
}

export function dialogControls(dialog: HTMLElement): HTMLElement[] {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
      isVisible(element),
  );
}

export function focusDialogTitle(dialog: HTMLElement, labelledBy: string) {
  const title = dialog.querySelector<HTMLElement>(`[id="${labelledBy}"]`)!;
  title.tabIndex = -1;
  title.focus();
}

export function restoreDialogFocus(
  opener: HTMLElement,
  scope: HTMLElement | null,
) {
  // A replacement or nested modal owns focus until it closes.
  if (document.querySelector("dialog[open]")) return;
  if (
    opener.isConnected &&
    !opener.matches(":disabled") &&
    !opener.closest("[inert]")
  ) {
    opener.focus();
    if (document.activeElement === opener) return;
  }
  const region = scope?.isConnected ? scope : document.querySelector("main");
  const target =
    region?.querySelector<HTMLElement>("h1, h2") ??
    (region ? dialogControls(region)[0] : undefined);
  if (target) {
    const previous = target.getAttribute("tabindex");
    target.tabIndex = -1;
    target.focus();
    target.addEventListener(
      "blur",
      () => {
        if (previous === null) target.removeAttribute("tabindex");
        else target.setAttribute("tabindex", previous);
      },
      { once: true },
    );
  }
}
