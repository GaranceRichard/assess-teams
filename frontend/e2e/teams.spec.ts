import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  seedCoachTeams,
  seedIdentity,
} from "./identity-fixture";

test("an Admin manages an organization's team and its coaches", async ({
  page,
}) => {
  seedIdentity("team-admin-e2e", "Admin");
  seedIdentity("team-coach-one-e2e", "Coach");
  seedIdentity("team-coach-two-e2e", "Coach");
  assignOrganization(
    ["team-admin-e2e", "team-coach-one-e2e", "team-coach-two-e2e"],
    "Teams E2E",
  );
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("team-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Équipes" }).click();

  await page.getByLabel("Organisation").selectOption({ label: "Teams E2E" });
  await expect(
    page.getByText("Aucune équipe active pour cette organisation."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Créer une équipe" }).click();
  await page.getByLabel("Nom de l’équipe").fill("Delivery");
  await page.getByLabel("team-coach-one-e2e").check();
  await page.getByLabel("team-coach-two-e2e").check();
  await page.getByRole("button", { name: "Enregistrer" }).click();

  const teamRow = page.getByRole("listitem").filter({ hasText: "Delivery" });
  await expect(teamRow).toContainText("team-coach-one-e2e, team-coach-two-e2e");
  await teamRow.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Nom de l’équipe").fill("Delivery updated");
  await page.getByLabel("team-coach-one-e2e").uncheck();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(teamRow).toContainText("Delivery updated");
  await expect(teamRow).toContainText("team-coach-two-e2e");

  await teamRow.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Valider la suppression" }).click();
  await expect(
    page.getByText("Aucune équipe active pour cette organisation."),
  ).toBeVisible();
});

test("a Coach sees assigned teams on the dashboard without a teams menu", async ({
  page,
}) => {
  seedIdentity("dashboard-coach-e2e", "Coach");
  assignOrganization(["dashboard-coach-e2e"], "Coach dashboard E2E");
  seedCoachTeams("dashboard-coach-e2e", "Coach dashboard E2E", [
    "Équipe A",
    "Équipe B",
    "Équipe C",
  ]);

  await page.goto("/");
  await page.getByLabel("Identifiant").fill("dashboard-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByText(/Organisation :/)).toContainText(
    "Organisation : Coach dashboard E2E",
  );
  await expect(page.getByText(/^Équipes :/)).toContainText(
    "Équipes : Équipe A, Équipe B, Équipe C",
  );
  await expect(page.getByRole("navigation").getByRole("link")).toHaveText([
    "Tableau de bord",
    "Utilisateurs",
    "Évaluations",
    "Résultats",
  ]);
});
