import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { e2eCredential } from "./identity-fixture";
import { seedResponsiveContext } from "./responsive-fixture";
import {
  reachable,
  responsiveGeometry,
  setResponsiveTheme,
} from "./responsive-geometry";
import {
  assertFocusContained,
  openByKeyboard,
  cancelByKeyboard,
} from "./dialog-assertions";

for (const theme of ["day", "night"]) {
  test(`dialogs keep long content and keyboard commands reachable (${theme})`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    page.setDefaultTimeout(10_000);
    seedResponsiveContext();
    await page.goto("/users");
    await page.getByLabel("Identifiant").fill("shell-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByRole("button", { name: "Se déconnecter" }),
    ).toBeVisible();
    const measurements = [];
    for (const size of [
      { width: 1280, height: 480 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      for (const route of [
        "users",
        "organization",
        "teams",
        "templates",
        "planning",
      ]) {
        await page.goto(`/${route}`);
        await setResponsiveTheme(page, theme);
        if (["teams", "templates"].includes(route))
          await page
            .getByRole("combobox", { name: "Organisation" })
            .selectOption({ label: "Shell viewport E2E" });
        const triggers = {
          users: page.getByRole("button", { name: "Ajouter un utilisateur" }),
          organization: page.getByRole("button", { name: "Gérer les membres" }),
          teams: page
            .getByRole("button", { name: "Supprimer", exact: true })
            .first(),
          templates: page.getByRole("button", {
            name: "Créer une évaluation",
            exact: true,
          }),
          planning: page
            .getByRole("button", { name: /^Shell viewport E2E -/ })
            .first(),
        };
        const trigger = triggers[route as keyof typeof triggers];
        const dialog = await openByKeyboard(page, trigger);
        await assertFocusContained(page, dialog);
        const actions = [];
        for (const button of await dialog
          .locator("button:not(:disabled)")
          .all())
          actions.push({
            text: await button.innerText(),
            bounds: await reachable(button),
          });
        const content = dialog.locator(
          ".dialog, .organization-dialog, .team-dialog, .evaluation-dialog, .planning-dialog",
        );
        const contentBounds = await content.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
          };
        });
        expect.soft(contentBounds.x).toBeGreaterThanOrEqual(0);
        expect.soft(contentBounds.y).toBeGreaterThanOrEqual(0);
        expect
          .soft(contentBounds.y + contentBounds.height)
          .toBeLessThanOrEqual(size.height);
        expect
          .soft(contentBounds.scrollWidth)
          .toBeLessThanOrEqual(contentBounds.clientWidth);
        measurements.push({
          theme,
          route,
          size,
          contentBounds,
          actions,
          regions: await responsiveGeometry(page),
        });
        await page.screenshot({
          path: info.outputPath(
            `${theme}-${size.width}-${size.height}-${route}.png`,
          ),
        });
        await cancelByKeyboard(page, trigger);
      }
    }
    writeFileSync(
      info.outputPath("measurements.jsonl"),
      measurements.map((row) => JSON.stringify(row)).join("\n") + "\n",
    );
  });
}
