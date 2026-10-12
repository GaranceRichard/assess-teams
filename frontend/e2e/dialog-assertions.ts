import { expect, type Locator, type Page } from "@playwright/test";

export async function openByKeyboard(page: Page, trigger: Locator) {
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName(/.+/);
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(
    true,
  );
  return dialog;
}

export async function assertFocusContained(page: Page, dialog: Locator) {
  // Exercise both ends and the browser's native sequential focus navigation.
  for (const direction of ["Tab", "Shift+Tab"]) {
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press(direction);
      expect(
        await dialog.evaluate((element) =>
          element.contains(document.activeElement),
        ),
      ).toBe(true);
    }
  }
  await page
    .locator("nav a")
    .first()
    .evaluate((element) => (element as HTMLElement).focus());
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
}

export async function cancelByKeyboard(page: Page, trigger: Locator) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
}
