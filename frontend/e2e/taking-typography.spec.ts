import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import { typographyEvidence, noDocumentOverflow } from "./typography-evidence";

for (const theme of ["day", "night"]) {
  test(`readable taking hierarchy and reachable actions in ${theme}`, async ({
    page,
  }, info) => {
    seedTakingContext();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/evaluations");
    await page.getByLabel("Identifiant").fill("taking-coach-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    if (theme === "night")
      await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    await page
      .getByRole("row")
      .filter({ has: page.getByText("Passation E2E v1", { exact: true }) })
      .getByRole("button", { name: "Passer l’évaluation" })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("slider").press("Home");
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    for (const size of [
      { width: 1280, height: 720 },
      { width: 1280, height: 480 },
      { width: 390, height: 844 },
      { width: 320, height: 568 },
      { width: 568, height: 320 },
    ]) {
      await page.setViewportSize(size);
      const metrics = await typographyEvidence(
        page,
        info,
        `taking-${theme}-${size.width}-${size.height}`,
      );
      const heading = metrics.find(
        (row) => row.element === "H2" && row.text?.startsWith("Passer"),
      )!;
      expect.soft(heading.size).toBe("20px");
      expect.soft(heading.leading).toBe("26px");
      await noDocumentOverflow(page);
      for (const name of ["Fermer", "Suivant"]) {
        const action = dialog.getByRole("button", { name, exact: true });
        await expect(action).toBeInViewport();
        await action.focus();
        await expect(action).toBeFocused();
      }
      expect(
        await dialog.evaluate((e) => e.scrollHeight <= e.clientHeight),
      ).toBe(true);
    }
  });
}
