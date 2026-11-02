import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useProductNavigation } from "./useProductNavigation";

let dialog: HTMLDialogElement;
beforeEach(() => {
  window.history.replaceState({}, "", "/evaluations");
  dialog = document.createElement("dialog");
  dialog.open = true;
  dialog.dataset.navigationProtected = "true";
  document.body.append(dialog);
});
afterEach(() => {
  dialog.remove();
  vi.restoreAllMocks();
});

it("blocks app navigation only while a dialog protects unsaved input", () => {
  const { result } = renderHook(useProductNavigation);
  act(() => result.current.navigate("/dashboard"));
  expect(result.current.path).toBe("/evaluations");
  expect(location.pathname).toBe("/evaluations");
  dialog.dataset.navigationProtected = "false";
  act(() => result.current.navigate("/dashboard"));
  expect(result.current.path).toBe("/dashboard");
});

it.each([-1, 1])(
  "reverses a protected history traversal (%s) without changing the rendered route",
  (destination) => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    const { result } = renderHook(useProductNavigation);
    act(() =>
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: { assessTeamsNavigationIndex: destination },
        }),
      ),
    );
    expect(go).toHaveBeenCalledWith(-destination);
    expect(result.current.path).toBe("/evaluations");
  },
);

it("restores an unindexed entry while protected and allows it after saving", () => {
  const { result } = renderHook(useProductNavigation);
  window.history.pushState({}, "", "/dashboard");
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  expect(location.pathname).toBe("/evaluations");
  expect(result.current.path).toBe("/evaluations");
  dialog.open = false;
  window.history.pushState({}, "", "/results");
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  expect(result.current.path).toBe("/results");
});

it("retains the current history position on remount and URL replacement", () => {
  window.history.replaceState(
    { assessTeamsNavigationIndex: 7, other: "retained" },
    "",
    "/evaluations",
  );
  const { result } = renderHook(useProductNavigation);
  act(() => result.current.replacePath("/dashboard"));
  expect(result.current.path).toBe("/dashboard");
  expect(window.history.state).toEqual({
    assessTeamsNavigationIndex: 7,
    other: "retained",
  });
});

it("requests unload confirmation only for protected input and removes listeners", () => {
  const { unmount } = renderHook(useProductNavigation);
  const attempt = () => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  };
  expect(attempt()).toBe(true);
  dialog.dataset.navigationProtected = "false";
  expect(attempt()).toBe(false);
  dialog.dataset.navigationProtected = "true";
  unmount();
  expect(attempt()).toBe(false);
});
