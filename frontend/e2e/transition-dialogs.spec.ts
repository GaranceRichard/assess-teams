import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import {
  attachMotion,
  moving,
  noNewMotion,
  observeMotion,
} from "./motion-evidence";

test.use({ reducedMotion: "no-preference", video: "on" });

test("saving, server refusal, revision and administrative dialogs preserve motion boundaries", async ({
  page,
}, info) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
  await expect(row).toBeVisible();
  await observeMotion(page);
  await moving(page, "dialog-enter", () =>
    row.getByRole("button", { name: "Passer l’évaluation" }).click(),
  );
  const dialog = page.getByRole("dialog");
  await page.route("**/api/evaluations/*/responses/*/", async (route) => {
    await route.fulfill({ status: 400, json: { detail: "Note refusée." } });
  });
  await noNewMotion(page, async () => {
    await dialog.getByRole("slider").press("Home");
    await expect(dialog.getByRole("alert")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Fermer", exact: true }),
    ).toBeDisabled();
    await expect(dialog.getByRole("slider")).toHaveValue("0");
  });
  await page.unroute("**/api/evaluations/*/responses/*/");
  await noNewMotion(page, async () => {
    await dialog
      .getByRole("button", { name: "Réessayer la sauvegarde" })
      .click();
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
  });
  await moving(page, "question-enter", () =>
    dialog.getByRole("button", { name: "Suivant" }).press("Enter"),
  );
  await noNewMotion(page, async () => {
    await dialog.getByRole("slider").press("End");
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
  });
  await moving(page, "dialog-exit", () =>
    dialog.getByRole("button", { name: "Valider l’évaluation" }).click(),
  );
  await expect(dialog).toHaveCount(0);
  await moving(page, "dialog-enter", () =>
    row.getByRole("button", { name: "Réviser les notes" }).click(),
  );
  await expect(dialog.getByRole("slider")).toHaveValue("0");
  await noNewMotion(page, () => dialog.getByRole("slider").press("ArrowRight"));
  await moving(page, "question-enter", () =>
    dialog.getByRole("button", { name: "Suivant" }).press("Enter"),
  );
  const previous = await moving(page, "question-enter", () =>
    dialog.getByRole("button", { name: "Précédent" }).press("Enter"),
  );
  expect(previous.frames[0].x).toBeLessThan(0);
  await expect(dialog.locator("#question-text")).toBeFocused();
  await expect(dialog.getByRole("slider")).toHaveValue("1");
  const rapid = await dialog.evaluate(async (element) => {
    const press = (name: string) =>
      [...element.querySelectorAll<HTMLButtonElement>(".taking-footer button")]
        .find((button) => button.textContent === name)!
        .click();
    press("Suivant");
    await new Promise(requestAnimationFrame);
    const live = element.querySelector(
      '[data-axis="question"] > .transition-live',
    )!;
    const animation = live.getAnimations()[0];
    await new Promise((resolve) => setTimeout(resolve, 80));
    press("Précédent");
    await new Promise((resolve) => setTimeout(resolve, 80));
    press("Suivant");
    await new Promise(requestAnimationFrame);
    return {
      sameAnimation: live.getAnimations()[0] === animation,
      elapsed: Number(animation.currentTime),
      copies: element.querySelectorAll(".transition-outgoing").length,
      duplicateIds: element.querySelectorAll(".transition-outgoing [id]")
        .length,
    };
  });
  expect(rapid.sameAnimation).toBe(true);
  expect(rapid.elapsed).toBeGreaterThanOrEqual(120);
  expect(rapid.elapsed).toBeLessThan(320);
  expect(rapid.copies).toBe(1);
  expect(rapid.duplicateIds).toBe(0);
  await expect(dialog.locator(".transition-outgoing")).toHaveCount(0);
  await expect(dialog.locator("#question-text")).toBeFocused();
  await expect(dialog.getByRole("slider")).toHaveValue("10");
  await dialog.getByRole("button", { name: "Précédent" }).press("Enter");
  await expect(dialog.locator(".transition-outgoing")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(dialog.locator(".transition-outgoing")).toHaveCount(0);
  await expect(dialog.locator("#question-text")).toBeFocused();
  await expect(dialog.getByRole("slider")).toHaveValue("1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await moving(page, "dialog-exit", () => page.keyboard.press("Escape"));
  await expect(
    row.getByRole("button", { name: "Réviser les notes" }),
  ).toBeFocused();
  await moving(page, "page-enter", () =>
    page.getByRole("link", { name: "Équipes", exact: true }).click(),
  );
  await page
    .getByRole("combobox", { name: "Organisation" })
    .selectOption({ label: "Taking E2E" });
  await expect(
    page.getByRole("button", { name: "Créer une équipe" }),
  ).toBeVisible();
  const create = page.getByRole("button", { name: "Créer une équipe" });
  const evidence = [];
  for (const theme of ["day", "night"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    await create.focus();
    evidence.push(
      await moving(page, "dialog-enter", () => create.press("Enter")),
    );
    await expect(dialog.getByLabel("Nom de l’équipe")).toBeFocused();
    await page.route("**/api/admin/organizations/*/teams/", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 400, json: { name: ["Nom refusé."] } })
        : route.continue(),
    );
    await noNewMotion(page, async () => {
      await dialog.getByLabel("Nom de l’équipe").fill("Mouvement fictif");
      await dialog.getByRole("button", { name: "Enregistrer" }).click();
      await expect(dialog.getByRole("alert")).toBeVisible();
      await expect(dialog.getByLabel("Nom de l’équipe")).toHaveValue(
        "Mouvement fictif",
      );
    });
    await page.unroute("**/api/admin/organizations/*/teams/");
    await moving(page, "dialog-exit", () => page.keyboard.press("Escape"));
    await expect(create).toBeFocused();
  }
  // Collection data changes in the same route must never restart page entry.
  await moving(page, "dialog-enter", () => create.click());
  await dialog.getByLabel("Nom de l’équipe").fill("Équipe transition fictive");
  await moving(page, "dialog-exit", async () => {
    await dialog.getByRole("button", { name: "Enregistrer" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByText("Équipe transition fictive", { exact: true }),
    ).toBeVisible();
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await noNewMotion(page, async () => {
    await create.click();
    await expect(dialog.getByLabel("Nom de l’équipe")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(create).toBeFocused();
  });
  await attachMotion(info, "administrative-dialog-motion", evidence);
});
