import { expect, test, type Page } from "@playwright/test";
import { palettes } from "../src/palette";
import { contrast } from "./palette-contrast";
import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

async function auditControls(page: Page, selector: string, name: string) {
  const controls = page.locator(selector).and(page.locator(":not([inert] *)"));
  await expect(controls.first()).toBeVisible();
  for (const { value } of palettes) {
    await page.locator("html").evaluate((root, value) => {
      (root as HTMLElement).dataset.palette = value;
    }, value);
    await page
      .locator(":focus")
      .evaluateAll((elements) =>
        elements.forEach((element) => (element as HTMLElement).blur()),
      );
    const styles = await controls.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          text: style.color,
          background: style.backgroundColor,
          border: style.borderTopColor,
        };
      }),
    );
    await test.info().attach(`${name}-${value}-controls.json`, {
      body: JSON.stringify(
        styles.map((style) => ({
          ...style,
          textRatio: contrast(style.text, style.background),
          borderRatio: contrast(style.border, style.background),
        })),
      ),
      contentType: "application/json",
    });
    for (const style of styles) {
      expect
        .soft(contrast(style.text, style.background), `${name}/${value}: text`)
        .toBeGreaterThanOrEqual(4.5);
      expect
        .soft(
          contrast(style.border, style.background),
          `${name}/${value}: boundary`,
        )
        .toBeGreaterThanOrEqual(3);
    }
    await controls.first().focus();
    const focus = await controls.first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.outlineColor,
        width: style.outlineWidth,
        background: style.backgroundColor,
      };
    });
    expect
      .soft(parseFloat(focus.width), `${name}/${value}: focus`)
      .toBeGreaterThan(0);
    expect
      .soft(
        contrast(focus.color, focus.background),
        `${name}/${value}: focus contrast`,
      )
      .toBeGreaterThanOrEqual(3);
  }
  await page.screenshot({
    path: test.info().outputPath(`${name}-night.png`),
    animations: "disabled",
  });
}

test("dark controls remain legible across ten palettes with independent light control borders", async ({
  page,
}) => {
  test.setTimeout(90_000);
  seedResultsContext(true);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();

  await page.getByRole("link", { name: "Organisation", exact: true }).click();
  await page.getByRole("button", { name: "Renommer", exact: true }).click();
  await auditControls(page, ".organization-rename-form input", "organization");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();

  await page.getByRole("link", { name: "Équipes", exact: true }).click();
  await auditControls(page, ".organization-selector select", "team-selector");
  await page
    .getByRole("combobox", { name: "Organisation" })
    .selectOption({ label: "Results E2E" });
  await page.getByRole("button", { name: "Créer une équipe" }).click();
  await auditControls(
    page,
    ".team-dialog input:not([type=checkbox])",
    "team-dialog",
  );
  await page.getByRole("button", { name: "Annuler", exact: true }).click();

  await page
    .getByRole("link", { name: "Modèles d’évaluation", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Organisation" })
    .selectOption({ label: "Results E2E" });
  await page.getByRole("button", { name: /Radar E2E v3/ }).click();
  await page.getByRole("button", { name: "Ajouter une question" }).click();
  await auditControls(page, ".evaluation-dialog input", "question-dialog");
  const input = page.getByRole("dialog").locator(".evaluation-dialog input");
  await input.fill(" ");
  await expect(
    page.getByRole("button", { name: "Enregistrer", exact: true }),
  ).toBeDisabled();
  await input.fill("Contraste sombre");
  await expect(
    page.getByRole("button", { name: "Enregistrer", exact: true }),
  ).toBeEnabled();
  await page.locator("html").evaluate((root) => {
    (root as HTMLElement).dataset.theme = "day";
  });
  await page
    .locator(":focus")
    .evaluateAll((elements) =>
      elements.forEach((element) => (element as HTMLElement).blur()),
    );
  await expect(input).toHaveCSS("border-top-color", "rgb(115, 115, 115)");
  await page.locator("html").evaluate((root) => {
    (root as HTMLElement).dataset.theme = "night";
  });
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  const appreciation = page.locator(".question-appreciation").first();
  await appreciation.locator("summary").click();
  await appreciation.getByRole("button", { name: "Ajouter un repère" }).click();
  await auditControls(page, "textarea", "appreciation");

  await page.getByRole("link", { name: "Planification", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Organisation" })
    .selectOption({ label: "Results E2E" });
  await page.getByLabel("Planifier").selectOption("fixed");
  await auditControls(
    page,
    ".planning-page select, .planning-page input",
    "planning",
  );
});
