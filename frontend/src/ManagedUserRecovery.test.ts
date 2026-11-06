import { afterEach, expect, it, vi } from "vitest";
import { inviteManagedUser } from "./managedUsers";

const input = {
  identifier: "recovery",
  email: "recovery@example.com",
  role: "Coach" as const,
};
const unavailable =
  "Le service est indisponible. Votre saisie est conservée ; réessayez plus tard.";
afterEach(() => vi.restoreAllMocks());

it.each([500, 502, 503])(
  "hides technical diagnostics on HTTP %i and permits explicit retry",
  async (status) => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ detail: "DIAGNOSTIC_CONFIDENTIEL_FICTIF" }),
          { status },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 42, ...input }), { status: 201 }),
      );
    await expect(inviteManagedUser(input)).rejects.toThrow(unavailable);
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(inviteManagedUser(input)).resolves.toMatchObject({ id: 42 });
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);

it("explains a network failure without exposing its diagnostic or retrying automatically", async () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(new TypeError("DIAGNOSTIC_RESEAU_FICTIF"));
  await expect(inviteManagedUser(input)).rejects.toThrow(
    "La connexion au serveur a échoué. Votre saisie est conservée ; vérifiez votre connexion avant de réessayer.",
  );
  expect(fetch).toHaveBeenCalledOnce();
});

it("preserves useful business validation messages", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({ identifier: ["Cet identifiant est déjà utilisé."] }),
      { status: 400 },
    ),
  );
  await expect(inviteManagedUser(input)).rejects.toThrow(
    "Cet identifiant est déjà utilisé.",
  );
});
