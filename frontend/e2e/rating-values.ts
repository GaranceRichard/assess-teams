import { writeFileSync } from "node:fs";
import {
  expect,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";

export async function expectRatingValues(dialog: Locator) {
  await dialog.evaluate(async (element) => {
    await Promise.allSettled(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished),
    );
  });
  const values = dialog.getByRole("group", { name: "Notes de 0 à 10" });
  await expect(values.getByRole("button")).toHaveCount(11);
  const slider = dialog.getByRole("slider");
  const track = (await slider.boundingBox())!;
  const thumb = await slider.evaluate(
    (element) =>
      parseFloat(
        getComputedStyle(element).getPropertyValue("--rating-thumb-size"),
      ) * parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  for (let score = 0; score <= 10; score++) {
    const value = values.getByRole("button", {
      name: `Choisir la note ${score} sur 10`,
    });
    await expect(value).toBeVisible();
    await expect(value).toHaveText(String(score));
    const bounds = (await value.boundingBox())!;
    expect(bounds.x + bounds.width / 2).toBeCloseTo(
      track.x + thumb / 2 + ((track.width - thumb) * score) / 10,
      0,
    );
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(track.y);
    const text = await value.evaluate((element) => {
      const text = document.createRange();
      text.selectNodeContents(element);
      const rect = text.getBoundingClientRect();
      const body = element.closest(".taking-content")!.getBoundingClientRect();
      return {
        center: rect.left + rect.width / 2,
        width: rect.width,
        readable: rect.left >= body.left && rect.right <= body.right,
      };
    });
    expect(text.readable).toBe(true);
    expect(text.width).toBeLessThanOrEqual(bounds.width);
    expect(text.center).toBeCloseTo(bounds.x + bounds.width / 2, 0);
  }
}

export async function chooseRating(
  dialog: Locator,
  score: number,
  touch: boolean,
) {
  const value = dialog.getByRole("button", {
    name: `Choisir la note ${score} sur 10`,
  });
  if (touch) await value.tap();
  else await value.click();
  await expect(value).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("slider")).toHaveValue(String(score));
  await expect(dialog.getByRole("slider")).toBeFocused();
  await expect(dialog.locator(".transition-live output")).toHaveText(
    `Note sélectionnée : ${score} / 10`,
  );
}

export async function recordIncompleteRatingRefusal(
  page: Page,
  runId: number,
  info: TestInfo,
) {
  const csrf = (await page.context().cookies()).find(
    (cookie) => cookie.name === "csrftoken",
  )!.value;
  const response = await page.request.post(
    `/api/evaluations/${runId}/finalize/`,
    {
      data: {},
      headers: { "X-CSRFToken": csrf },
    },
  );
  expect(response.status()).toBe(400);
  const refusal = { status: response.status(), body: await response.json() };
  writeFileSync(
    info.outputPath("incomplete-finalization.json"),
    JSON.stringify(refusal, null, 2),
  );
  await info.attach("incomplete-finalization.json", {
    body: JSON.stringify(refusal),
    contentType: "application/json",
  });
}
