import { useLayoutEffect, useRef } from "react";

import {
  dialogControls,
  focusDialogTitle,
  restoreDialogFocus,
} from "./dialogFocus";

export function useModalFocus(
  labelledBy: string,
  initialFocus: "first" | "title" = "first",
  returnFocus?: HTMLElement,
) {
  const ref = useRef<HTMLDialogElement>(null);

  const openerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const dialog = ref.current!;
    const opener =
      openerRef.current ??
      returnFocus ??
      (document.activeElement as HTMLElement);
    openerRef.current = opener;
    const scope = opener.closest<HTMLElement>(".product-page, main, section");
    function focusInitial() {
      const control =
        initialFocus === "first" ? dialogControls(dialog)[0] : undefined;
      if (control) control.focus();
      else focusDialogTitle(dialog, labelledBy);
    }
    dialog.showModal();
    focusInitial();

    function containTab(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const controls = dialogControls(dialog);
      const active = document.activeElement;
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) {
        event.preventDefault();
        focusDialogTitle(dialog, labelledBy);
      } else if (
        event.shiftKey &&
        (active === first || !controls.includes(active as HTMLElement))
      ) {
        event.preventDefault();
        last!.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !controls.includes(active as HTMLElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    dialog.addEventListener("keydown", containTab);
    // Dynamic question/actions can remove or disable the currently focused control.
    const observer = new MutationObserver(() => {
      if (
        dialog.open &&
        (!dialog.contains(document.activeElement) ||
          document.activeElement?.matches(":disabled"))
      )
        focusInitial();
    });
    observer.observe(dialog, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
    return () => {
      observer.disconnect();
      dialog.removeEventListener("keydown", containTab);
      dialog.close();
      queueMicrotask(() => restoreDialogFocus(opener, scope));
    };
  }, [labelledBy, initialFocus, returnFocus]);

  return ref;
}
