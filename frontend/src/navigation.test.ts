import { describe, expect, it } from "vitest";

import { canAccess, menuFor, routeFor } from "./navigation";

describe("role capabilities", () => {
  it("lets Admin inherit Coach and Viewer routes", () => {
    expect(canAccess("Admin", routeFor("/my-teams")!)).toBe(true);
    expect(canAccess("Admin", routeFor("/teams")!)).toBe(true);
  });

  it("lets Coach access user management and inherit Viewer routes", () => {
    expect(canAccess("Coach", routeFor("/teams")!)).toBe(true);
    expect(canAccess("Coach", routeFor("/users")!)).toBe(true);
    expect(canAccess("Coach", routeFor("/organization")!)).toBe(false);
  });

  it("limits Viewer to consultation routes", () => {
    expect(canAccess("Viewer", routeFor("/results")!)).toBe(true);
    expect(canAccess("Viewer", routeFor("/evaluations")!)).toBe(false);
  });

  it("returns only configured menu items and resolves known paths", () => {
    expect(menuFor("Viewer").map((route) => route.title)).toEqual([
      "Tableau de bord",
      "Équipes",
      "Résultats",
    ]);
    expect(routeFor("/missing")).toBeUndefined();
  });
});
