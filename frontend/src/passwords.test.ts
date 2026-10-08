import { afterEach, expect, it, vi } from "vitest";

import {
  changePassword,
  requestPasswordRecovery,
  resetPassword,
} from "./passwords";

afterEach(() => vi.restoreAllMocks());
const currentPhrase = "Synthetic-current-phrase!";
const phrase = "Synthetic-new-phrase!";
const values = { password: phrase, password_confirmation: phrase };

it("sends strict JSON and CSRF without putting credentials in URLs", async () => {
  document.cookie = "csrftoken=synthetic-csrf";
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(null, { status: 204 }));
  await requestPasswordRecovery("member@example.com");
  await resetPassword("synthetic-uid", "synthetic-token", values);
  await changePassword("Synthetic-current-phrase!", values);
  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    "/api/password/recovery/",
    "/api/password/reset/",
    "/api/session/password/",
  ]);
  expect(fetch.mock.calls[1][1]).toMatchObject({
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": "synthetic-csrf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: "synthetic-uid",
      token: "synthetic-token",
      ...values,
    }),
  });
  expect(JSON.parse(fetch.mock.calls[2][1]!.body as string)).toEqual({
    current_password: currentPhrase,
    ...values,
  });
});

it.each([
  [429, { detail: "ignored" }, "Trop de tentatives"],
  [403, { detail: "ignored" }, "Votre accès a expiré"],
  [
    400,
    { current_password: ["Actuel incorrect."], unexpected: "do not echo" },
    "Actuel incorrect.",
  ],
  [400, { password: ["Mot de passe trop court."] }, "Mot de passe trop court."],
  [
    500,
    { detail: "sensitive backend exception" },
    "Le service est indisponible",
  ],
  [400, {}, "Le service est indisponible"],
])("maps %s to explicit safe messages", async (status, body, message) => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), { status }),
  );
  await expect(changePassword("synthetic", values)).rejects.toThrow(
    message as string,
  );
});

it("handles a non-JSON failure without exposing its contents", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("private-html", { status: 500 }),
  );
  await expect(requestPasswordRecovery("member@example.com")).rejects.toThrow(
    "Le service est indisponible",
  );
});
