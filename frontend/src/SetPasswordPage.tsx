import { type FormEvent, useState } from "react";

import { acceptInvitation } from "./managedUsers";

type Props = { uid: string; token: string; onComplete: () => void };

export function SetPasswordPage({ uid, token, onComplete }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await acceptInvitation(uid, token, password);
      onComplete();
    } catch {
      setError("Cette invitation est invalide ou expirée.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">Invitation</p>
        <h1>Choisir mon mot de passe</h1>
        <form onSubmit={submit}>
          <label htmlFor="new-password">Mot de passe</label>
          <input
            id="new-password"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit">Valider</button>
        </form>
      </section>
    </main>
  );
}
