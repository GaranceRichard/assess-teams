import { writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import { cancelByKeyboard, openByKeyboard } from "./dialog-assertions";

for (const theme of ["day", "night"]) {
  test(`repeated Escape protects pending and refused scores (${theme})`, async ({
    page,
    browser,
  }, info) => {
    seedTakingContext();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript((value) => {
      localStorage.setItem("assess-teams-theme", value);
    }, theme);
    await page.goto("/evaluations");
    await page.getByLabel("Identifiant").fill("taking-coach-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    const row = page.getByRole("row").filter({
      has: page.getByText("Passation E2E v1", { exact: true }),
    });
    const trigger = row.getByRole("button", { name: /Passer|Reprendre/ });
    const dialog = await openByKeyboard(page, trigger);
    const slider = dialog.getByRole("slider");
    const status = dialog.locator(".transition-live #score-status");
    const choose = (score: number) =>
      dialog.getByRole("button", {
        name: `Choisir la note ${score} sur 10`,
        exact: true,
      });
    const runs = await (await page.request.get("/api/evaluations/")).json();
    const runId = runs.find(
      (run: { evaluation_name: string }) =>
        run.evaluation_name === "Passation E2E",
    ).id;
    const reads: object[] = [];
    const scores = async (phase: string) => {
      const response = await page.request.get(`/api/evaluations/${runId}/`);
      expect(response.status()).toBe(200);
      const values = (await response.json()).questions.map(
        (question: { score: number | null }) => question.score,
      );
      reads.push({ phase, http: response.status(), scores: values });
      return values;
    };
    await choose(0).click();
    await expect(status).toHaveText("Note enregistrée");
    expect(await scores("stored-zero")).toEqual([0, null]);
    await dialog.evaluate((element) => {
      const events: object[] = [];
      Object.assign(window, { takingEscapeEvents: events });
      for (const type of ["keydown", "cancel", "close"]) {
        element.addEventListener(type, (event) => {
          if (event instanceof KeyboardEvent && event.key !== "Escape") return;
          setTimeout(() => {
            events.push({
              type,
              cancelable: event.cancelable,
              prevented: event.defaultPrevented,
              connected: element.isConnected,
              open: (element as HTMLDialogElement).open,
            });
          }, 0);
        });
      }
    });
    let rejectSave!: () => void;
    const delayed = new Promise<void>((resolve) => {
      rejectSave = resolve;
    });
    let refuse = true;
    const writes: object[] = [];
    await page.route("**/api/evaluations/*/responses/*/", async (route) => {
      await delayed;
      const intended = route.request().postDataJSON().score;
      const sent = refuse ? 11 : intended;
      const response = await route.fetch({
        postData: JSON.stringify({ score: sent }),
      });
      writes.push({ intended, sent, http: response.status() });
      await route.fulfill({ response });
    });
    await choose(7).click();
    await expect(status).toHaveText("Enregistrement…");
    const pressFiveTimes = async (phase: string) => {
      for (let attempt = 1; attempt <= 5; attempt++) {
        await page.keyboard.press("Escape");
        const state = await page
          .locator("dialog.taking-dialog")
          .evaluate((element) => ({
            open: (element as HTMLDialogElement).open,
            connected: element.isConnected,
            score: (
              element.querySelector('input[type="range"]') as HTMLInputElement
            ).value,
          }));
        reads.push({ phase, attempt, ...state });
        // This fails on the third Escape before the fix, with the React node still mounted.
        expect(state).toEqual({ open: true, connected: true, score: "7" });
        await expect(
          dialog.getByRole("button", { name: "Fermer", exact: true }),
        ).toBeDisabled();
      }
      expect(await scores(phase)).toEqual([0, null]);
      await dialog.screenshot({ path: info.outputPath(`${phase}.png`) });
    };
    try {
      await pressFiveTimes("pending");
      rejectSave();
      await expect(status).toHaveAttribute("role", "alert");
      await expect(status).toContainText("n’a pas été enregistrée");
      await pressFiveTimes("refused");
      refuse = false;
      await dialog
        .getByRole("button", { name: "Réessayer la sauvegarde" })
        .click();
      await expect(status).toHaveText("Note enregistrée");
      await expect(slider).toHaveValue("7");
      expect(await scores("retried")).toEqual([7, null]);
      expect(writes).toEqual([
        { intended: 7, sent: 11, http: 400 },
        { intended: 7, sent: 7, http: 204 },
      ]);
      await dialog.screenshot({ path: info.outputPath("saved.png") });
      await cancelByKeyboard(page, trigger);
      await expect(page.locator(".dialog-exit")).toBeVisible();
      await expect(page.locator(".dialog-exit")).toHaveCount(0);
      await openByKeyboard(page, trigger);
      await dialog.getByRole("button", { name: "Fermer", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await scores("closed")).toEqual([7, null]);
    } finally {
      rejectSave();
      await page.unrouteAll({ behavior: "wait" });
      const events = await page.evaluate(
        () =>
          (window as unknown as { takingEscapeEvents: object[] })
            .takingEscapeEvents,
      );
      writeFileSync(
        info.outputPath("evidence.json"),
        JSON.stringify(
          {
            time: new Date().toISOString(),
            browser: browser.version(),
            theme,
            reads,
            writes,
            events,
          },
          null,
          2,
        ),
      );
    }
  });
}
