import { type FormEvent, useState } from "react";

import { requestPasswordRecovery } from "./passwords";

export function PasswordRecoveryPage({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await requestPasswordRecovery(email);
      setEmail("");
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Le service est indisponible.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">Récupération</p>
        <h1>Mot de passe oublié</h1>
        {success ? (
          <>
            <p role="status">
              Si un compte actif correspond à cette adresse, un lien vous sera
              envoyé. Consultez aussi vos courriers indésirables.
            </p>
            <button className="secondary" onClick={() => setSuccess(false)}>
              Demander un nouveau lien
            </button>
          </>
        ) : (
          <form onSubmit={submit} aria-busy={pending}>
            <label htmlFor="recovery-email">Adresse email</label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={pending}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button disabled={pending} type="submit">
              {pending ? "Envoi de la demande…" : "Recevoir un lien"}
            </button>
          </form>
        )}
        <button className="secondary" onClick={() => onNavigate("/")}>
          Retour à la connexion
        </button>
      </section>
    </main>
  );
}
