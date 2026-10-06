import { afterEach, expect, it, vi } from "vitest";
import { getSteering, listSteeringOrganizations } from "./steering";
import { readResultIntent } from "./resultIntent";

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

it("uses one read-only scoped projection and the dedicated organization list", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ teams: [] }) });
  vi.stubGlobal("fetch", fetchMock);
  await listSteeringOrganizations();
  await getSteering(3);
  expect(fetchMock.mock.calls).toEqual([
    ["/api/steering/organizations/", { credentials: "same-origin" }],
    ["/api/steering/?organization_id=3", { credentials: "same-origin" }],
  ]);
  fetchMock.mockResolvedValue({ ok: false });
  await expect(getSteering(99)).rejects.toThrow("Steering request failed");
});

it("accepts complete positive safe IDs and ignores forged or ambiguous URL intents", () => {
  window.history.replaceState(
    {},
    "",
    "/results?organization_id=1&family_id=4&team_id=10",
  );
  expect(readResultIntent()).toEqual({
    organizationId: "1",
    familyId: "4",
    teamId: 10,
  });
  for (const query of [
    "",
    "organization_id=1",
    "organization_id=1&family_id=4&team_id=0",
    "organization_id=1&family_id=4&team_id=9007199254740992",
    "organization_id=1&family_id=4&team_id=1&team_id=2",
  ]) {
    window.history.replaceState({}, "", `/results?${query}`);
    expect(readResultIntent()).toBeNull();
  }
});
