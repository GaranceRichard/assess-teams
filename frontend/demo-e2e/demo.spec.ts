import { expect, test } from "@playwright/test";

test("découverte, brouillon, passation et projections sans aucune API", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", (route) => {
    apiCalls.push(route.request().url());
    return route.abort();
  });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Tableau de bord", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Mesurer pour accompagner/)).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Dernières activités" })
      .getByRole("listitem"),
  ).toHaveCount(3);
  await page.screenshot({ path: test.info().outputPath("dashboard-day.png") });
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("radio", { name: "Violet", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "violet");
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await page.screenshot({
    path: test.info().outputPath("dashboard-night.png"),
  });
  await page.getByRole("button", { name: "Activer le mode jour" }).click();
  await page.getByRole("link", { name: "Équipes", exact: true }).click();
  await expect(page.getByText(/Produit · 7 personnes/)).toBeVisible();
  await page
    .getByRole("link", { name: "Modèles d’évaluation", exact: true })
    .click();
  await page.screenshot({ path: test.info().outputPath("templates-day.png") });
  const questions = page.getByRole("list", { name: "Questions", exact: true });
  await questions
    .getByRole("button", { name: "Modifier", exact: true })
    .first()
    .click();
  await page.getByLabel("Nom de la question").fill("Objectifs partagés");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    questions.getByText("Objectifs partagés", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ajouter une question" }).click();
  await expect(
    page.getByRole("button", { name: "Enregistrer", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Nom de la question").fill("Écoute");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(questions.getByRole("listitem")).toHaveCount(6);
  await page.getByText(/Réordonner le brouillon/).click();
  await page
    .getByRole("button", { name: "Descendre Objectifs partagés", exact: true })
    .click();
  await expect(questions.getByRole("listitem").nth(1)).toContainText(
    "Objectifs partagés",
  );
  await questions
    .getByRole("listitem")
    .last()
    .getByRole("button", { name: "Supprimer", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(questions.getByRole("listitem")).toHaveCount(5);
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  const aurore = page.getByRole("row").filter({ hasText: "Aurore" });
  await aurore
    .getByRole("button", { name: "Passer l’évaluation", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Clarté des objectifs" }),
  ).toBeVisible();
  const answers = [0, 10, 3, 7, 8];
  for (let i = 0; i < answers.length; i++) {
    await dialog.getByLabel("Note de la question").fill(String(answers[i]));
    await dialog
      .getByRole("button", { name: "Enregistrer la note", exact: true })
      .click();
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    if (i < 4) await dialog.getByRole("button", { name: "Suivant" }).click();
  }
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  const radar = page.getByRole("img", { name: /Radar des résultats/ });
  await expect(radar).toHaveAttribute("aria-label", /3 équipe/);
  await page.screenshot({ path: test.info().outputPath("results-day.png") });
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "1. Clarté des objectifs" }),
  ).toContainText("0 / 10");
  await expect(
    page.getByRole("columnheader", { name: /^Aurore · votre passation/ }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Graphique" }).click();
  await page.getByRole("checkbox", { name: /^Boréal/ }).uncheck();
  await expect(radar).toHaveAttribute("aria-label", /2 équipe/);
  await page.getByText("Historique par critère", { exact: true }).click();
  await page.getByRole("button", { name: "1. Clarté des objectifs" }).click();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  const observations = page.getByRole("table");
  await expect(
    observations.locator('[title^="Aurore · votre passation"]'),
  ).toContainText("0/10 (");
  await expect(
    observations.locator('[title^="Aurore · simulation"]'),
  ).toHaveCount(3);
  await expect(observations.getByRole("columnheader")).toHaveText([
    "Aurore",
    "Canopée",
  ]);
  await expect(
    observations.locator("tbody tr").last().getByRole("cell").nth(1),
  ).toBeEmpty();
  await page.getByLabel("Analyse", { exact: true }).selectOption("radar");
  await page.getByRole("link", { name: "Pilotage", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Aurore · votre passation" }),
  ).toContainText("Aucune échéance connue");
  await page
    .getByRole("link", {
      name: "Voir les résultats de Aurore · votre passation",
    })
    .click();
  await expect(radar).toHaveAttribute("aria-label", /1 équipe/);
  await page.getByRole("button", { name: "Réinitialiser la démo" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "green");
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(
    page.getByRole("columnheader", { name: /^Aurore · simulation/ }),
  ).toBeVisible();
  expect(apiCalls).toEqual([]);
  expect(errors).toEqual([]);
});
