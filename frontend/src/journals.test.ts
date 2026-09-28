import { afterEach, describe, expect, it, vi } from "vitest";

import { listActivityEntries, listErrorEntries } from "./journals";

const filters = {
  date: "2026-09-28",
  organizationId: "7",
  player: "Marie Martin",
  team: "Architecture",
};

afterEach(() => vi.restoreAllMocks());

describe("journal APIs", () => {
  it("queries activity with pagination and filters", async () => {
    const page = { count: 0, next: null, previous: null, results: [] };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(page), { status: 200 }));

    await expect(listActivityEntries(filters, 2)).resolves.toEqual(page);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/admin/activity-journal/?");
    expect(url).toContain("page=2");
    expect(url).toContain("date=2026-09-28");
    expect(url).toContain("organization_id=7");
    expect(url).toContain("player=Marie+Martin");
    expect(url).toContain("team=Architecture");
  });

  it("omits empty filters and rejects an error response", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 403 }));

    await expect(
      listErrorEntries(
        { date: "", organizationId: "", player: "", team: "" },
        1,
      ),
    ).rejects.toThrow("Journal request failed");
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/error-journal/?page=1", {
      credentials: "same-origin",
    });
  });
});
