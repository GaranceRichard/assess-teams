import { expect, type Page, type TestInfo } from "@playwright/test";

export async function typographyEvidence(
  page: Page,
  info: TestInfo,
  name: string,
) {
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page
    .locator(
      ".product-page h1, .product-page h2, .product-page h3, .product-page .eyebrow, .product-page label, .product-page input, .product-page select, .product-page > p, .product-page button, dialog h2, dialog h3, dialog label, dialog input, dialog button",
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const s = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            element: element.tagName,
            text: element.textContent?.trim().slice(0, 70),
            family: s.fontFamily,
            size: s.fontSize,
            weight: s.fontWeight,
            leading: s.lineHeight,
            margin: s.margin,
            padding: s.padding,
            gap: s.gap,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        }),
    );
  await info.attach(`${name}-styles`, {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
  await page.screenshot({
    path: info.outputPath(`${name}.png`),
    fullPage: !(await page.getByRole("dialog").isVisible()),
    animations: "disabled",
  });
  return metrics;
}

export async function noDocumentOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
}

export async function readableControls(page: Page) {
  const fields = await page
    .locator(".product-page select, .modal-layer input, .modal-layer select")
    .evaluateAll((elements) =>
      elements.map((e) => ({
        size: getComputedStyle(e).fontSize,
        weight: getComputedStyle(e).fontWeight,
      })),
    );
  for (const field of fields)
    expect.soft(field).toEqual({ size: "16px", weight: "400" });
}

export async function alignedQuestions(page: Page) {
  const row = page.locator(".question-row").first();
  const title = row.locator("strong");
  const number = row.locator(":scope > span");
  const t = await title.boundingBox();
  const n = await number.boundingBox();
  expect.soft(t!.x - (n!.x + n!.width)).toBeLessThanOrEqual(16);
  const longTitle =
    "Une question longue pour vérifier la lecture et les actions ".repeat(12);
  await title.evaluate((element, text) => {
    element.textContent = text;
  }, longTitle);
  expect(await title.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
    true,
  );
  await noDocumentOverflow(page);
}

export async function openTypographyRoute(page: Page, route: string) {
  await page.goto(`/${route}`);
  await expect(page.locator(".product-page h1")).toBeVisible();
  const gap = await page.locator(".product-page h1").evaluate((h) => {
    const previous = h.previousElementSibling;
    return previous?.classList.contains("eyebrow")
      ? h.getBoundingClientRect().top - previous.getBoundingClientRect().bottom
      : 0;
  });
  expect(
    gap,
    "The page heading must not overlap its eyebrow",
  ).toBeGreaterThanOrEqual(0);
  await expect(
    page.locator(
      ".collection-frame[aria-busy=true], .dashboard-activity-card[aria-busy=true]",
    ),
  ).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: /^Chargement/ }),
  ).toHaveCount(0);
  if (route === "templates") {
    await page
      .getByLabel("Organisation")
      .selectOption({ label: "Results E2E" });
    await page.locator(".evaluation-select").first().click();
    await expect(page.locator(".question-panel h2")).toBeVisible();
    await expect(page.locator(".question-row").first()).toBeVisible();
  }
  if (route === "results") {
    await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
    await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
    await expect(page.getByRole("img", { name: /Radar/ })).toBeVisible();
  }
}

export async function reachableControl(page: Page) {
  const control = page
    .locator(
      ".product-page button:enabled:visible, .product-page a:visible, .product-page summary:visible, .product-page select:enabled:visible",
    )
    .last();
  if (await control.count()) {
    await control.scrollIntoViewIfNeeded();
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).toBeInViewport();
  }
  await noDocumentOverflow(page);
  return page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
    action: document.activeElement?.textContent?.trim().slice(0, 80),
  }));
}
