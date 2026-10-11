import { expect, test } from "@playwright/test";

import {
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

test("login reports repeated failures and recovers after expiry", async ({
  page,
}) => {
  const username = "login-restriction-e2e";
  seedIdentity(username, "Viewer");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill(username);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("synthetic-wrong");
  for (let index = 0; index < 5; index += 1) {
    const response = page.waitForResponse(
      (value) =>
        value.url().endsWith("/api/session/login/") &&
        value.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Se connecter" }).click();
    expect((await response).status()).toBe(index < 4 ? 401 : 429);
    await expect(
      page.getByRole("button", { name: "Se connecter" }),
    ).toBeEnabled();
  }
  await expect(page.getByRole("alert")).toContainText(
    "Trop de tentatives de connexion.",
  );
  await expect(page.getByRole("alert")).toContainText("secondes.");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Trop de tentatives de connexion.",
  );
  // Advance only this synthetic account's expiry; preserve every other bucket.
  runDjangoShell([
    "from django.utils import timezone",
    "from django.utils.crypto import salted_hmac",
    "from identities.password_models import PasswordRateLimit",
    `key = salted_hmac('identities.login-limits', 'account:${username}', algorithm='sha256').hexdigest()`,
    "PasswordRateLimit.objects.filter(key=key).update(expires_at=timezone.now())",
  ]);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
});
