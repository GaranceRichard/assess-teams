import { expect, it } from "vitest";
import { productHref } from "./productHref";
import { productHref as demoHref } from "./demo/productHref";
it("conserve les liens applicatifs et rend les liens démo rechargeables sans serveur", () => {
  expect(productHref("/results?team_id=1")).toBe("/results?team_id=1");
  expect(demoHref("/results?team_id=1")).toBe("#/results?team_id=1");
});
