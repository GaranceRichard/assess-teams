import { type FormEvent, useState } from "react";

import { changePassword, resetPassword } from "./passwords";

type Props = {
  recovery?: { uid: string; token: string };
  onSuccess?: () => void;
};

export function PasswordForm({ recovery, onSuccess }: Props) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmation) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    try {
      const data = { password, password_confirmation: confirmation };
      if (recovery) await resetPassword(recovery.uid, recovery.token, data);
      else await changePassword(current, data);
      setCurrent("");
      setPassword("");
      setConfirmation("");
      setSuccess(true);
      onSuccess?.();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Le service est indisponible.",
      );
    } finally {
      setPending(false);
    }
  }

  if (success)
    return (
      <p role="status">
        Votre mot de passe a été modifié.{" "}
        {recovery
          ? "Reconnectez-vous avec votre nouveau mot de passe."
          : "Votre session reste ouverte ; les autres sessions sont invalidées."}
      </p>
    );

  return (
    <form onSubmit={submit} aria-busy={pending}>
      <p id="password-policy">
        Au moins 8 caractères, sans mot de passe courant, entièrement numérique
        ou trop proche de votre identité. Choisissez un mot de passe différent
        de l’actuel.
      </p>
      <p>
        {recovery
          ? "Toutes vos sessions seront invalidées."
          : "Seule votre session courante sera conservée."}
      </p>
      {!recovery && (
        <>
          <label htmlFor="current-password">Mot de passe actuel</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            required
            disabled={pending}
          />
        </>
      )}
      <label htmlFor="new-password">Nouveau mot de passe</label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        aria-describedby="password-policy"
        minLength={8}
        maxLength={128}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        disabled={pending}
      />
      <label htmlFor="password-confirmation">
        Confirmer le nouveau mot de passe
      </label>
      <input
        id="password-confirmation"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        required
        disabled={pending}
      />
      {message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Modifier mon mot de passe"}
      </button>
    </form>
  );
}
