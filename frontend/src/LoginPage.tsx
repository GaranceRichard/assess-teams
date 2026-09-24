import { type FormEvent, useState } from "react";

import "./login.css";

type Props = {
  error: string | null;
  onLogin: (username: string, password: string) => Promise<void>;
};

export function LoginPage({ error, onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    await onLogin(username, password);
    setSubmitting(false);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">Espace sécurisé</p>
        <h1>Assess teams</h1>
        <p className="intro">Connectez-vous pour accéder à votre espace.</p>
        <form onSubmit={submit}>
          <label htmlFor="username">Identifiant</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <label htmlFor="password">Mot de passe</label>
          <div className="password-field">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              aria-label={
                passwordVisible
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              aria-pressed={passwordVisible}
              className="password-visibility"
              onClick={() => setPasswordVisible((visible) => !visible)}
              type="button"
            >
              {passwordVisible ? "Masquer" : "Afficher"}
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={submitting} type="submit">
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
