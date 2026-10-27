import { expect, test } from "@playwright/test";
import { palettes } from "../src/palette";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import {
  attachMotion,
  moving,
  noNewMotion,
  observeMotion,
  type Motion,
} from "./motion-evidence";

test.use({ video: "on" });

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 375, height: 667 },
]) {
  test(`real transitions across themes and palettes at ${viewport.width}`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    seedTakingContext();
    await page.setViewportSize(viewport);
    await page.goto("/evaluations");
    await page.getByLabel("Identifiant").fill("taking-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    const row = page
      .getByRole("row")
      .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
    await expect(row).toBeVisible();
    await observeMotion(page);
    const evidence: { theme: string; palette: string; motions: Motion[] }[] =
      [];
    const dialog = page.getByRole("dialog");
    for (const theme of ["day", "night"]) {
      for (const { value: palette } of palettes) {
        await page.evaluate(
          ({ theme, palette }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dataset.palette = palette;
          },
          { theme, palette },
        );
        const motions: Motion[] = [];
        motions.push(
          await moving(page, "dialog-enter", () =>
            row.getByRole("button", { name: /Passer|Reprendre/ }).click(),
          ),
        );
        await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
        if (await dialog.getByText("Question 2 / 2").count()) {
          motions.push(
            await moving(page, "question-enter", () =>
              dialog.getByRole("button", { name: "Précédent" }).click(),
            ),
          );
        } else {
          await expect(
            dialog.getByRole("button", { name: "Suivant" }),
          ).toBeDisabled();
        }
        await noNewMotion(page, async () => {
          await dialog.getByRole("slider").press("Home");
          await expect(
            dialog.getByText("Note enregistrée", { exact: true }),
          ).toBeVisible();
        });
        const next = await moving(page, "question-enter", () =>
          dialog.getByRole("button", { name: "Suivant" }).click(),
        );
        expect(next.frames[0].x).toBeGreaterThan(0);
        motions.push(next);
        await expect(dialog.locator("#question-text")).toBeFocused();
        const previous = await moving(page, "question-enter", () =>
          dialog.getByRole("button", { name: "Précédent" }).click(),
        );
        expect(previous.frames[0].x).toBeLessThan(0);
        motions.push(previous);
        await expect(dialog.getByRole("slider")).toHaveValue("0");
        await dialog
          .getByRole("button", { name: "Fermer", exact: true })
          .click();
        await expect(
          row.getByRole("button", { name: "Reprendre l’évaluation" }),
        ).toBeFocused();
        // Return to the second, unanswered question on the next opening.
        motions.push(
          await moving(page, "page-enter", () =>
            page
              .getByRole("link", { name: "Tableau de bord", exact: true })
              .click(),
          ),
        );
        expect(motions.at(-1)!.frames[0].y).toBeGreaterThan(0);
        motions.push(await moving(page, "page-enter", () => page.goBack()));
        await expect(row).toBeVisible();
        evidence.push({ theme, palette, motions });
      }
    }
    await attachMotion(info, "rendered-motion-frames", evidence);
  });
}

test("reduced motion keeps navigation and dialogs immediate, including browser history", async ({
  page,
}) => {
  seedTakingContext();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
  await expect(row).toBeVisible();
  await observeMotion(page);
  await noNewMotion(page, async () => {
    await row.getByRole("button", { name: "Passer l’évaluation" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
    await dialog.getByRole("slider").press("End");
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.locator("#question-text")).toBeFocused();
    await dialog.getByRole("button", { name: "Précédent" }).click();
    await expect(dialog.getByRole("slider")).toHaveValue("10");
    await page.keyboard.press("Escape");
    await page
      .getByRole("link", { name: "Tableau de bord", exact: true })
      .click();
    await page.goBack();
    await expect(row).toBeVisible();
    await page.goForward();
    await expect(page.locator(".dashboard")).toBeVisible();
    expect(
      await page
        .locator(".page-viewport")
        .evaluate((e) => getComputedStyle(e).transform),
    ).toBe("none");
  });
});
