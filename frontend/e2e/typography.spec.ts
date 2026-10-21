import { expect, test } from "@playwright/test";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedSteeringContext } from "./steering-fixture";
import {
  typographyEvidence,
  noDocumentOverflow,
  readableControls,
  alignedQuestions,
  openTypographyRoute,
  reachableControl,
} from "./typography-evidence";

const routes = [
  "dashboard",
  "users",
  "organization",
  "teams",
  "templates",
  "planning",
  "evaluations",
  "results",
  "steering",
  "activity-journal",
  "logs",
];

test.beforeAll(() => {
  seedSteeringContext();
  runDjangoShell([
    "from identities.models import User",
    "User.objects.filter(username='results-admin-e2e').update(interface_palette='green')",
    "from journals.models import ActivityEntry",
    "ActivityEntry.objects.filter(organization__name='Results E2E').update(created_at='2026-10-08T12:00:00Z')",
  ]);
});

for (const theme of ["day", "night"]) {
  test(`shared typography and hierarchy across journeys in ${theme}`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await page.getByLabel("Identifiant").fill("results-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator(".dashboard")).toBeVisible();
    if (theme === "night")
      await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    const headings: string[] = [];
    for (const route of routes) {
      await openTypographyRoute(page, route);
      const metrics = await typographyEvidence(page, info, `${route}-${theme}`);
      const title = metrics.find((row) => row.element === "H1")!;
      headings.push(`${title.size}/${title.weight}/${title.leading}`);
      await noDocumentOverflow(page);
      await readableControls(page);
      if (route === "templates") await alignedQuestions(page);
      if (route === "dashboard") {
        expect
          .soft(
            await page
              .locator(".dashboard-card h3")
              .first()
              .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
          )
          .toBeLessThan(
            await page
              .locator("#profile-title")
              .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
          );
        await expect(
          page.getByRole("region", { name: "Raccourcis utiles" }),
        ).toBeInViewport();
        expect(
          await page
            .getByRole("region", { name: "Raccourcis utiles" })
            .evaluate((e) => e.getBoundingClientRect().bottom),
        ).toBeLessThanOrEqual(720);
      }
      if (route === "users") {
        await page
          .getByRole("button", { name: "Ajouter un utilisateur" })
          .click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await typographyEvidence(page, info, `user-dialog-${theme}`);
        await readableControls(page);
        await page
          .getByRole("button", { name: "Annuler", exact: true })
          .click();
      }
    }
    expect(new Set(headings).size).toBe(1);
    for (const size of [
      { width: 1920, height: 1080 },
      { width: 1280, height: 480 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      const geometry = [];
      for (const route of routes) {
        await openTypographyRoute(page, route);
        geometry.push({ route, ...(await reachableControl(page)) });
        await page.screenshot({
          path: info.outputPath(
            `${route}-${theme}-${size.width}-${size.height}.png`,
          ),
          animations: "disabled",
        });
      }
      await info.attach(`geometry-${size.width}-${size.height}`, {
        body: JSON.stringify(geometry),
        contentType: "application/json",
      });
    }
  });
}
