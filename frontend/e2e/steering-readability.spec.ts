import { expect, test, type Locator, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";
import { seedSteeringContext } from "./steering-fixture";

async function openSteering(page: Page, username: string, night: boolean) {
  await page.goto("/steering");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  if (night)
    await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await page.getByText("Comprendre les indicateurs", { exact: true }).click();
  await stable(page);
}

async function stable(page: Page) {
  await expect(page.locator(".transition-outgoing")).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      document
        .getAnimations()
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
}

async function readable(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    let left = Math.max(0, rect.left);
    let top = Math.max(0, rect.top);
    let right = Math.min(innerWidth, rect.right);
    let bottom = Math.min(innerHeight, rect.bottom);
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      const style = getComputedStyle(parent);
      const box = parent.getBoundingClientRect();
      if (style.overflowX !== "visible") {
        left = Math.max(left, box.left);
        right = Math.min(right, box.right);
      }
      if (style.overflowY !== "visible") {
        top = Math.max(top, box.top);
        bottom = Math.min(bottom, box.bottom);
      }
    }
    const points = [0.2, 0.5, 0.8].map((ratio) => {
      const hit = document.elementFromPoint(
        rect.left + rect.width * ratio,
        rect.top + rect.height / 2,
      );
      return hit === element || (hit !== null && element.contains(hit));
    });
    return {
      x: rect.x,
      width: rect.width,
      visibleWidth: right - left,
      height: rect.height,
      visibleHeight: bottom - top,
      unobscured: points.every(Boolean),
    };
  });
}

for (const night of [false, true]) {
  const theme = night ? "night" : "day";

  test(`mobile keyboard keeps state explanations readable — ${theme}`, async ({
    page,
  }) => {
    seedSteeringContext();
    runDjangoShell([
      "from teams.models import Team",
      "Team.objects.filter(organization__name='Results E2E', name='Équipe A').update(name='A1')",
    ]);
    await page.setViewportSize({ width: 390, height: 844 });
    await openSteering(page, "results-admin-e2e", night);
    await page.getByRole("region", { name: "Équipes suivies" }).focus();
    await page.keyboard.press("ArrowRight");
    const link = page.getByRole("link", {
      name: "Voir les résultats de A1",
      exact: true,
    });
    for (let step = 0; step < 5; step++) {
      if (await link.evaluate((element) => element === document.activeElement))
        break;
      await page.keyboard.press("Tab");
    }
    await expect(link).toBeFocused();
    await stable(page);
    await page.screenshot({
      path: test.info().outputPath("keyboard.png"),
      fullPage: true,
    });
    const note = page.locator(".steering-note");
    const beforeScroll = await note.boundingBox();
    expect.soft(beforeScroll?.x).toBeGreaterThanOrEqual(0);
    const geometry = await readable(note);
    writeFileSync(
      test.info().outputPath("geometry.json"),
      JSON.stringify({ beforeScroll, geometry }),
    );
    await page.screenshot({
      path: test.info().outputPath("note.png"),
      fullPage: true,
    });
    expect
      .soft(geometry.visibleWidth)
      .toBeGreaterThanOrEqual(geometry.width - 1);
    expect
      .soft(geometry.visibleHeight)
      .toBeGreaterThanOrEqual(geometry.height - 1);
    expect(geometry.unobscured).toBe(true);
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("checkbox", { name: /^Équipe A/ }),
    ).toBeChecked();
  });

  test(`open definitions keep the resultless row accessible — ${theme}`, async ({
    page,
  }) => {
    seedIdentity("readability-admin-e2e", "Admin");
    assignOrganization(["readability-admin-e2e"], "Readability E2E");
    runDjangoShell([
      "from identities.models import Organization",
      "from teams.models import Team",
      "Team.objects.create(organization=Organization.objects.get(name='Readability E2E'), name='Sans résultat')",
    ]);
    await page.setViewportSize({ width: 1280, height: 720 });
    await openSteering(page, "readability-admin-e2e", night);
    const row = page.getByRole("row").filter({
      has: page.getByRole("rowheader", { name: "Sans résultat", exact: true }),
    });
    const geometry = [];
    for (const cell of await row.locator("th, td").all())
      geometry.push(await readable(cell));
    await stable(page);
    writeFileSync(
      test.info().outputPath("geometry.json"),
      JSON.stringify(geometry),
    );
    await page.screenshot({
      path: test.info().outputPath("resultless-row.png"),
      fullPage: true,
    });
    for (const cell of geometry) {
      expect.soft(cell.visibleHeight).toBeGreaterThanOrEqual(cell.height - 1);
      expect.soft(cell.visibleWidth).toBeGreaterThanOrEqual(cell.width - 1);
      expect.soft(cell.unobscured).toBe(true);
    }
    await expect(row).toContainText("Aucune complétion");
    await expect(row).toContainText("Jamais évaluée");
    await expect(row.getByRole("link")).toHaveCount(0);
  });
}
