import { afterEach, expect, it, vi } from "vitest";

import { getResultComparison, listResultVersions } from "./results";
import { resultComparison, resultVersions } from "./test/resultsFixture";

afterEach(() => vi.unstubAllGlobals());

it("uses the dedicated read-only session API and exact version identity", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => resultVersions })
    .mockResolvedValueOnce({ ok: true, json: async () => resultComparison });
  vi.stubGlobal("fetch", fetch);
  expect(await listResultVersions()).toEqual(resultVersions);
  expect(await getResultComparison(2)).toEqual(resultComparison);
  expect(fetch).toHaveBeenNthCalledWith(1, "/api/results/versions/", {
    credentials: "same-origin",
  });
  expect(fetch).toHaveBeenNthCalledWith(2, "/api/results/versions/2/", {
    credentials: "same-origin",
  });
});

it("rejects inaccessible versions and backend failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
  await expect(getResultComparison(999)).rejects.toThrow(
    "Results request failed",
  );
  await expect(listResultVersions()).rejects.toThrow("Results request failed");
});
