import { expect, test } from "@playwright/test";
import { auditLightScreen } from "./light-contrast-audit";
import { e2eCredential, seedJournalEntries } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

test("light screens, states and control boundaries remain readable in ten palettes", async ({
  page,
}) => {
  test.setTimeout(180_000);
  seedResultsContext(true);
  seedJournalEntries("results-admin-e2e", "Results E2E");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  await auditLightScreen(page, "dashboard");
  await page.getByText("Couleurs", { exact: true }).click();
  await auditLightScreen(page, "appearance");
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("button", { name: "Replier le menu" }).click();
  await auditLightScreen(page, "navigation-collapsed");
  await page.getByRole("button", { name: "Déplier le menu" }).click();
  await page.getByRole("link", { name: "Utilisateurs", exact: true }).click();
  await expect(page.locator("tbody tr").first()).toBeVisible();
  await auditLightScreen(page, "users");
  await page.getByRole("button", { name: "Ajouter un utilisateur" }).click();
  await auditLightScreen(page, "user-dialog");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await page.getByRole("link", { name: "Organisation", exact: true }).click();
  await page.getByRole("button", { name: "Renommer", exact: true }).click();
  await auditLightScreen(page, "organization");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await page.getByRole("link", { name: "Équipes", exact: true }).click();
  await auditLightScreen(page, "team-selector");
  await page.getByLabel("Organisation").selectOption({ label: "Results E2E" });
  await page.getByRole("button", { name: "Créer une équipe" }).click();
  await auditLightScreen(page, "team-dialog");
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await page
    .getByRole("link", { name: "Modèles d’évaluation", exact: true })
    .click();
  await page.getByLabel("Organisation").selectOption({ label: "Results E2E" });
  const selectedModel = page.getByRole("button", { name: /Radar E2E v3/ });
  await selectedModel.click();
  await expect(selectedModel).toHaveAttribute("aria-pressed", "true");
  await expect(selectedModel.locator("[aria-hidden=true]")).toHaveText("✓");
  await page.getByRole("button", { name: "Ajouter une question" }).click();
  await auditLightScreen(page, "question-dialog");
  const input = page.locator(".evaluation-dialog input");
  await input.fill(" ");
  await expect(
    page.getByRole("button", { name: "Enregistrer", exact: true }),
  ).toBeDisabled();
  await input.fill("Contraste clair");
  await expect(
    page.getByRole("button", { name: "Enregistrer", exact: true }),
  ).toBeEnabled();
  await input.focus();
  await page.screenshot({ path: test.info().outputPath("question-focus.png") });
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  const appreciation = page.locator(".question-appreciation").first();
  await appreciation.locator("summary").click();
  await appreciation.getByRole("button", { name: "Ajouter un repère" }).click();
  await auditLightScreen(page, "appreciation");
  await page.getByRole("link", { name: "Planification", exact: true }).click();
  await page.getByLabel("Organisation").selectOption({ label: "Results E2E" });
  await page.getByLabel("Planifier").selectOption("fixed");
  await auditLightScreen(page, "planning");
  await page.getByRole("link", { name: "Pilotage", exact: true }).click();
  await expect(page.getByRole("rowheader", { name: "Équipe A" })).toBeVisible();
  await auditLightScreen(page, "steering");
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await auditLightScreen(page, "radar");
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await auditLightScreen(page, "results-table");
  await page.getByRole("button", { name: "1. Collaboration" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await auditLightScreen(page, "history");
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await auditLightScreen(page, "history-table");
  for (const path of ["/activity-journal", "/logs"]) {
    await page.locator(`nav a[href="${path}"]`).click();
    await expect(
      page
        .locator(path === "/logs" ? ".log-table tbody tr" : ".journal-day")
        .first(),
    ).toBeVisible();
    await auditLightScreen(page, path.slice(1));
  }
});
