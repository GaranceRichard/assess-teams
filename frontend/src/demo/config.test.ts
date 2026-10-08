import { expect, it } from "vitest";
import demo from "../../vite.demo.config";
import app from "../../vite.config";

it("isole entrée, adaptateurs, assets, sortie et proxy sans modifier le build normal", () => {
  expect(demo.base).toBe("/assess-teams/");
  expect(demo.build?.outDir).toBe("../build/demo");
  expect(demo.server?.proxy).toBeUndefined();
  expect(app.server?.proxy).toEqual({
    "/api": process.env.ASSESS_BACKEND_URL ?? "http://127.0.0.1:8000",
  });
  expect(app.build?.outDir).toBeUndefined();
  const aliases = demo.resolve?.alias;
  expect(Array.isArray(aliases)).toBe(true);
  if (!Array.isArray(aliases)) throw new Error("Adaptateurs absents");
  expect(aliases).toHaveLength(6);
  expect(
    aliases.every((alias) =>
      alias.replacement.replaceAll("\\", "/").includes("/src/demo/"),
    ),
  ).toBe(true);
  expect(aliases[0].find).toEqual(/^\.\/auth$/);
  expect(aliases[0].find).not.toEqual(/^\.\.\/auth$/);
});
