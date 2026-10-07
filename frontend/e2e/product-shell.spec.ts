import { expect, test, type Page } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedShellContext } from "./shell-fixture";

async function viewportInvariant(page: Page) {
  const geometry = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
    shell: document.querySelector(".app-shell")!.getBoundingClientRect().height,
  }));
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.height).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.shell).toBe(geometry.viewportHeight);
  const header = page.locator(".workspace > header");
  const sidebar = page.locator(".product-sidebar");
  const before = [await header.boundingBox(), await sidebar.boundingBox()];
  const scrollers = page.locator(
    ".collection-scroll, .results-chart, .results-teams, .planning-form, .dashboard-card",
  );
  await scrollers.evaluateAll((elements) => {
    elements.forEach((element) => {
      element.scrollTop = element.scrollHeight;
      element.scrollLeft = element.scrollWidth;
    });
  });
  await page.mouse.wheel(0, 700);
  expect([await header.boundingBox(), await sidebar.boundingBox()]).toEqual(
    before,
  );
  expect(await page.evaluate(() => scrollY)).toBe(0);
  for (const pager of await page.locator(".pagination").all()) {
    const rect = await pager.boundingBox();
    expect(rect!.y).toBeGreaterThanOrEqual(before[0]!.height);
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(geometry.viewportHeight);
    await expect(pager.getByRole("button", { name: "Suivant" })).toBeVisible();
  }
  await scrollers.evaluateAll((elements) => {
    elements.forEach((element) => element.scrollTo(0, 0));
  });
}

const routes = [
  ["/dashboard", "Tableau de bord"],
  ["/users", "Utilisateurs"],
  ["/teams", "Équipes"],
  ["/templates", "Modèles d’évaluation"],
  ["/planning", "Planification"],
  ["/evaluations", "Évaluations"],
  ["/results", "Résultats"],
  ["/steering", "Pilotage"],
  ["/activity-journal", "Journal d’activité"],
  ["/logs", "Logs"],
] as const;

test("desktop shell bounds every collection, keeps chrome still and preserves mobile access", async ({
  page,
}) => {
  test.setTimeout(120_000);
  page.setDefaultTimeout(10_000);
  seedShellContext();
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("shell-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  for (const size of [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(size);
    for (const [route, title] of routes) {
      await page.goto(route);
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
      if (route === "/teams" || route === "/templates")
        await page
          .getByLabel("Organisation")
          .selectOption({ label: "Shell viewport E2E" });
      if (route === "/results") {
        await page
          .getByLabel("Modèle")
          .selectOption({ label: "Viewport model 00" });
        await page.getByRole("checkbox", { name: /^Viewport team 00/ }).check();
        await expect(page.getByRole("img", { name: /Radar/ })).toBeVisible();
      }
      if (
        [
          "/users",
          "/teams",
          "/templates",
          "/planning",
          "/evaluations",
          "/steering",
          "/activity-journal",
          "/logs",
        ].includes(route)
      ) {
        await expect(
          page.getByRole("navigation", { name: "Pagination", exact: true }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: "Suivant", exact: true })
          .click();
        await expect(page.locator(".pagination")).toContainText("Page 2 /");
        await expect(
          page.getByRole("button", { name: "Précédent", exact: true }),
        ).toBeEnabled();
        await page
          .getByRole("button", { name: "Précédent", exact: true })
          .click();
        await expect(page.locator(".pagination")).toContainText("Page 1 /");
      }
      await viewportInvariant(page);
      await page.screenshot({
        path: test.info().outputPath(`${route.slice(1)}-${size.width}.png`),
      });
    }
  }
  await page.goto("/users");
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await viewportInvariant(page);
  await page.screenshot({ path: test.info().outputPath("users-night.png") });
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto("/logs");
  await expect(
    page.getByRole("navigation", { name: "Pagination", exact: true }),
  ).toBeVisible();
  await page.locator(".pagination").scrollIntoViewIfNeeded();
  expect(
    await page
      .locator(".collection-scroll")
      .evaluate((element) => element.clientHeight),
  ).toBeGreaterThan(0);
  await viewportInvariant(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, title] of routes) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await expect(page.locator(".collection-frame[aria-busy=true]")).toHaveCount(
      0,
    );
    await page.screenshot({
      path: test.info().outputPath(`${route.slice(1)}-mobile.png`),
      fullPage: true,
    });
  }
});
