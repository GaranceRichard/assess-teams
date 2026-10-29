import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

type Interruption = {
  before: number;
  after: number;
  shift: number;
  copies: number;
};
type InterruptionWindow = Window & { modalInterruption?: Interruption };

test.use({ reducedMotion: "no-preference" });

test("closing during the first painted opening frames preserves dialog position and native focus", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.evaluate(() => {
    function opening(event: AnimationEvent) {
      const dialog = event.target;
      if (
        event.animationName !== "dialog-enter" ||
        !(dialog instanceof HTMLDialogElement)
      )
        return;
      document.removeEventListener("animationstart", opening);
      requestAnimationFrame(() => {
        const before = dialog.getBoundingClientRect().y;
        const shift = new DOMMatrixReadOnly(getComputedStyle(dialog).transform)
          .m42;
        // Exercise the existing accepted cancel while real CSS motion is in flight.
        dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
        requestAnimationFrame(() => {
          const copy = document.querySelector<HTMLElement>(
            ".dialog-exit > .taking-dialog",
          )!;
          (window as InterruptionWindow).modalInterruption = {
            before,
            shift,
            after: copy.getBoundingClientRect().y,
            copies: document.querySelectorAll(".dialog-exit").length,
          };
        });
      });
    }
    document.addEventListener("animationstart", opening);
  });
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
  await row.getByRole("button", { name: /Passer|Reprendre/ }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as InterruptionWindow).modalInterruption),
    )
    .toBeTruthy();
  const result = (await page.evaluate(
    () => (window as InterruptionWindow).modalInterruption,
  ))!;
  expect(result.shift).toBeGreaterThan(1);
  expect(result.copies).toBe(1);
  expect(Math.abs(result.after - result.before)).toBeLessThan(2);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    row.getByRole("button", { name: "Reprendre l’évaluation" }),
  ).toBeFocused();
  await expect(page.locator(".dialog-exit")).toHaveCount(0);
});
