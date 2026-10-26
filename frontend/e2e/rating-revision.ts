import {
  expect,
  type Page,
  type Locator,
  type TestInfo,
} from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { chooseRating, expectRatingValues } from "./rating-values";

export async function verifyRatingRevision(
  page: Page,
  row: Locator,
  touch: boolean,
  info: TestInfo,
  scores: () => Promise<Array<number | null>>,
  markers: boolean,
) {
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await row.getByRole("button", { name: "Réviser les notes" }).click();
  const dialog = page.getByRole("dialog");
  const stored = await scores();
  await expect(dialog.getByRole("slider")).toHaveValue(String(stored[0]));
  await expectRatingValues(dialog);
  await expect(dialog.locator(".taking-content .marker-dot")).toHaveCount(
    markers ? 4 : 0,
  );
  for (const score of [0, 5, 7, 10]) {
    await chooseRating(dialog, score, touch);
    if (markers)
      await expect(dialog.locator(".selected-appreciation strong")).toHaveText(
        `Repère ${score} / 10 :`,
      );
    else await expect(dialog.locator(".selected-appreciation")).toHaveCount(0);
    await dialog.getByRole("slider").press("Enter");
    expect(await scores()).toEqual(stored);
    await dialog.screenshot({ path: info.outputPath(`revision-${score}.png`) });
  }
  await chooseRating(dialog, 7, touch);
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await expect(dialog.getByRole("heading", { level: 3 })).toBeFocused();
  await expect(dialog.getByRole("slider")).toHaveValue(String(stored[1]));
  await chooseRating(dialog, 5, touch);
  await dialog.getByRole("button", { name: "Précédent" }).click();
  await expect(dialog.getByRole("slider")).toHaveValue("7");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
  await dialog.getByRole("button", { name: "Valider la révision" }).click();
  await expect(row).toContainText("Révisé par taking-admin-e2e");
  expect(await scores()).toEqual([7, 5]);
}
