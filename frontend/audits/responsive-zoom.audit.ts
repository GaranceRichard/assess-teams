import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { e2eCredential } from "../e2e/identity-fixture";
import { seedResponsiveContext } from "../e2e/responsive-fixture";
import {
  reachable,
  responsiveGeometry,
  setResponsiveTheme,
} from "../e2e/responsive-geometry";
import { nativeZoom } from "./native-zoom";

// Local full Chromium only, like the existing MEP-014 native zoom audit.
test("UX-05 collections and dialogs survive native zoom 100–200–100", async ({
  browserName,
}, info) => {
  expect(browserName).toBe("chromium");
  test.setTimeout(120_000);
  seedResponsiveContext();
  const probe = await nativeZoom(info);
  const { page, context } = probe;
  page.setDefaultTimeout(10_000);
  const measurements = [];
  try {
    await page.getByLabel("Identifiant").fill("shell-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByRole("button", { name: "Se déconnecter" }),
    ).toBeVisible();
    for (const theme of ["day", "night"]) {
      for (const [step, zoom] of [1, 2, 1].entries()) {
        await page.goto("/users");
        const metrics = await probe.zoom(zoom);
        await setResponsiveTheme(page, theme);
        const next = page.getByRole("button", { name: "Suivant", exact: true });
        const bounds = await reachable(next);
        await page.keyboard.press("Enter");
        await expect(page.locator(".pagination")).toContainText("Page 2 /");
        await expect(page.locator(".collection-frame")).toHaveAttribute(
          "aria-busy",
          "false",
        );
        await reachable(
          page.getByRole("button", { name: "Précédent", exact: true }),
        );
        await page.keyboard.press("Enter");
        await expect(page.locator(".pagination")).toContainText("Page 1 /");
        await expect(page.locator(".collection-frame")).toHaveAttribute(
          "aria-busy",
          "false",
        );
        measurements.push({
          theme,
          step,
          state: "collection",
          metrics,
          bounds,
          regions: await responsiveGeometry(page),
        });
        await probe.capture(`${theme}-${step}-${zoom}-collection`);
        const trigger = page.getByRole("button", {
          name: "Ajouter un utilisateur",
        });
        await reachable(trigger);
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog");
        await expect(dialog.getByLabel("Identifiant")).toBeFocused();
        await dialog.getByLabel("Identifiant").fill("zoom-responsive-e2e");
        await page.keyboard.press("Tab");
        await expect(dialog.getByLabel("Adresse mail")).toBeFocused();
        const submit = dialog.getByRole("button", {
          name: "Valider",
          exact: true,
        });
        const action = await reachable(submit);
        measurements.push({
          theme,
          step,
          state: "dialog",
          metrics,
          action,
          regions: await responsiveGeometry(page),
        });
        await probe.capture(`${theme}-${step}-${zoom}-dialog`);
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
      }
    }
  } finally {
    writeFileSync(
      info.outputPath("measurements.jsonl"),
      measurements.map((row) => JSON.stringify(row)).join("\n") + "\n",
    );
    await page.screenshot({ path: info.outputPath("last-state.png") });
    await context.close();
  }
});
