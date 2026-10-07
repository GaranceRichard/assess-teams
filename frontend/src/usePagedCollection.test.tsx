import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { usePagedCollection } from "./usePagedCollection";
import type { CollectionPage } from "./collectionPage";

const response = (items: number[], count = 41): CollectionPage<number> => ({
  results: items,
  count,
  next: "?page=2",
  previous: null,
});

it("loads server pages and resets page selection on filter changes", async () => {
  const load = vi.fn().mockResolvedValue(response([1, 2]));
  const { result, rerender } = renderHook(
    ({ scope }) => usePagedCollection<number>(load, scope),
    { initialProps: { scope: "north" } },
  );
  await waitFor(() => expect(result.current.items).toEqual([1, 2]));
  act(() => result.current.changePage(2));
  await waitFor(() => expect(load).toHaveBeenLastCalledWith(2));
  await waitFor(() => expect(result.current.loading).toBe(false));
  rerender({ scope: "south" });
  await waitFor(() => expect(load).toHaveBeenLastCalledWith(1));
  expect(result.current.page).toBe(1);
  act(() => result.current.setItems((items) => [...items, 3]));
  expect(result.current.count).toBe(42);
  act(() => result.current.setItems([7]));
  expect(result.current.items).toEqual([7]);
});

it("preserves a mutation when an obsolete pending read completes", async () => {
  let finish!: (data: number[]) => void;
  const load = vi.fn(
    () =>
      new Promise<number[]>((resolve) => {
        finish = resolve;
      }),
  );
  const { result } = renderHook(() => usePagedCollection(load));
  act(() => result.current.setItems([9]));
  await act(async () => finish([]));
  expect(result.current.items).toEqual([9]);
  expect(result.current.count).toBe(1);
});

it("ignores obsolete scope responses and retries a real network failure", async () => {
  let finish!: (data: number[]) => void;
  const load = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<number[]>((resolve) => {
          finish = resolve;
        }),
    )
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue([7]);
  const { result, rerender } = renderHook(
    ({ scope }) => usePagedCollection<number>(load, scope),
    { initialProps: { scope: "north" } },
  );
  rerender({ scope: "south" });
  await waitFor(() => expect(result.current.failed).toBe(true));
  await act(async () => finish([1]));
  expect(result.current.items).toEqual([]);
  act(() => result.current.reload());
  await waitFor(() => expect(result.current.items).toEqual([7]));
  expect(result.current.failed).toBe(false);
});

it("waits for a filter before loading and returns to the remaining page after deletion", async () => {
  const load = vi.fn().mockResolvedValue(response([1], 21));
  const { result, rerender } = renderHook(
    ({ enabled }) => usePagedCollection<number>(load, "org", enabled),
    { initialProps: { enabled: false } },
  );
  expect(load).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await waitFor(() => expect(result.current.count).toBe(21));
  act(() => result.current.changePage(2));
  await waitFor(() => expect(load).toHaveBeenLastCalledWith(2));
  act(() => result.current.setItems([]));
  await waitFor(() => expect(load).toHaveBeenLastCalledWith(1));
});

it("keeps the new filter when a mutation from the previous filter completes", async () => {
  let finish!: (data: number[]) => void;
  const load = vi
    .fn()
    .mockResolvedValueOnce([1])
    .mockImplementationOnce(
      () =>
        new Promise<number[]>((resolve) => {
          finish = resolve;
        }),
    );
  const { result, rerender } = renderHook(
    ({ scope }) => usePagedCollection<number>(load, scope),
    { initialProps: { scope: "north" } },
  );
  await waitFor(() => expect(result.current.items).toEqual([1]));
  const completeMutation = result.current.setItems;
  rerender({ scope: "south" });
  act(() => completeMutation([1, 2]));
  await act(async () => finish([7]));
  expect(result.current.items).toEqual([7]);
  expect(result.current.loading).toBe(false);
});
