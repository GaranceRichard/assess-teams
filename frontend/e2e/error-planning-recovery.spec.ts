import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
  seedPlanningContext,
} from "./identity-fixture";

for (const theme of ["day", "night"]) {
  test(`planning retains refused POST and PUT choices and retries once (${theme})`, async ({
    page,
  }) => {
    const admin = `errors-admin-${theme}`;
    const coach = `errors-coach-${theme}`;
    const organization = `Errors ${theme}`;
    seedIdentity(admin, "Admin");
    seedIdentity(coach, "Coach");
    assignOrganization([admin, coach], organization);
    seedPlanningContext(organization, "Recovery team", "Recovery model", coach);
    await page.setViewportSize({
      width: theme === "day" ? 1280 : 390,
      height: 844,
    });
    await page.addInitScript(
      (value) => localStorage.setItem("assess-teams-theme", value),
      theme,
    );
    await page.goto("/");
    await page.getByLabel("Identifiant").fill(admin);
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
    await page.goto("/planning");
    await page.getByLabel("Équipe").selectOption({ label: "Recovery team" });
    await page
      .getByLabel("Responsable de l’évaluation")
      .selectOption({ label: `${coach} — Coach` });
    await page
      .getByLabel("Modèle d’évaluation")
      .selectOption({ label: "Recovery model v1" });
    await page.getByLabel("Planifier").selectOption("monthly");
    await page.getByLabel("Première date").fill("05/10/2099");
    // A real server validation: the selected assignee loses their email after loading.
    runDjangoShell([
      "from identities.models import User",
      `User.objects.filter(username='${coach}').update(email='')`,
    ]);
    const postRefusal = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().includes("/api/admin/planning/"),
    );
    await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
    expect((await postRefusal).status()).toBe(400);
    await expect(page.getByRole("alert")).toHaveText(
      "La planification de l’évaluation a été refusée.",
    );
    const fields = [
      "Équipe",
      "Responsable de l’évaluation",
      "Modèle d’évaluation",
      "Planifier",
      "Première date",
    ];
    const values = await Promise.all(
      fields.map((name) => page.getByLabel(name).inputValue()),
    );
    expect(values.slice(0, 3).every(Boolean)).toBe(true);
    expect(values.slice(3)).toEqual(["monthly", "05/10/2099"]);
    runDjangoShell([
      "from assessments.models import EvaluationSchedule",
      `assert EvaluationSchedule.objects.filter(team__organization__name='${organization}').count() == 0`,
    ]);
    await page.screenshot({
      path: test.info().outputPath("create-refused.png"),
      fullPage: true,
    });
    await page
      .getByLabel("Responsable de l’évaluation")
      .selectOption({ label: `${admin} — Admin` });
    const postSuccess = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().includes("/api/admin/planning/"),
    );
    await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
    const created = await postSuccess;
    expect(created.status()).toBe(201);
    const saved = await created.json();
    const row = page.getByRole("button", {
      name: `${organization} - Recovery model v1 - Recovery team - ${admin}`,
    });
    await row.click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("Responsable de l’évaluation")
      .selectOption({ label: `${coach} — Coach` });
    await dialog.getByLabel("Planifier").selectOption("fixed");
    await dialog.getByLabel("Première date").fill("05/11/2099");
    const editValues = await Promise.all(
      fields.map((name) => dialog.getByLabel(name).inputValue()),
    );
    const putRefusal = page.waitForResponse(
      (r) =>
        r.request().method() === "PUT" &&
        r.url().endsWith(`/planning/${saved.id}/`),
    );
    await dialog
      .getByRole("button", { name: "Enregistrer les modifications" })
      .click();
    expect((await putRefusal).status()).toBe(400);
    await expect(dialog.getByRole("alert")).toHaveText(
      "La modification de la planification a été refusée.",
    );
    for (const [index, name] of fields.entries()) {
      await expect(dialog.getByLabel(name)).toHaveValue(editValues[index]);
    }
    await expect(
      dialog.getByRole("button", { name: "Enregistrer les modifications" }),
    ).toBeEnabled();
    await page.screenshot({
      path: test.info().outputPath("update-refused.png"),
      fullPage: true,
    });
    // Correct the cause, then retry the existing PUT rather than creating another object.
    runDjangoShell([
      "from identities.models import User",
      `User.objects.filter(username='${coach}').update(email='${coach}@example.com')`,
      "from assessments.models import EvaluationSchedule",
      `schedule = EvaluationSchedule.objects.get(pk=${saved.id})`,
      "assert schedule.mode == 'monthly' and schedule.first_due_date.isoformat() == '2099-10-05'",
    ]);
    const putSuccess = page.waitForResponse(
      (r) =>
        r.request().method() === "PUT" &&
        r.url().endsWith(`/planning/${saved.id}/`),
    );
    await dialog
      .getByRole("button", { name: "Enregistrer les modifications" })
      .click();
    expect((await putSuccess).status()).toBe(200);
    await expect(dialog).toHaveCount(0);
    runDjangoShell([
      "from assessments.models import EvaluationSchedule",
      `schedules = EvaluationSchedule.objects.filter(team__organization__name='${organization}')`,
      "assert schedules.count() == 1",
      `schedule = schedules.get(pk=${saved.id})`,
      "assert schedule.mode == 'fixed' and schedule.first_due_date.isoformat() == '2099-11-05'",
      `assert schedule.assignee.username == '${coach}'`,
    ]);
    await page.reload();
    await page
      .getByRole("button", {
        name: `${organization} - Recovery model v1 - Recovery team - ${coach}`,
      })
      .click();
    await expect(
      page.getByRole("dialog").getByLabel("Première date"),
    ).toHaveValue("05/11/2099");
    await page.screenshot({
      path: test.info().outputPath("update-recovered.png"),
      fullPage: true,
    });
  });
}
