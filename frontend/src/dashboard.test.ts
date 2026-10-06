import { afterEach, expect, it, vi } from "vitest";
import { getDashboard } from "./dashboard";
import { dashboardFixture } from "./test/dashboardFixture";

afterEach(() => vi.restoreAllMocks());

it("fetches the single read-only dashboard projection with session credentials", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(dashboardFixture)));
  expect(await getDashboard()).toEqual(dashboardFixture);
  expect(fetchMock).toHaveBeenCalledWith("/api/dashboard/", {
    credentials: "same-origin",
  });
});

it.each([403, 500])(
  "rejects unavailable or unauthorized projections (%s)",
  async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status }),
    );
    await expect(getDashboard()).rejects.toThrow("Dashboard request failed");
  },
);

it("rejects an invalid projection", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}"));
  await expect(getDashboard()).rejects.toThrow("Invalid dashboard response");
});
