import { useEffect, useState } from "react";

import { PasswordForm } from "./PasswordForm";

export function PasswordResetPage({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const [link, setLink] = useState(() => {
    const match = window.location.hash.match(
      /^#([A-Za-z0-9_-]{1,64})\/([a-z0-9-]{1,128})$/,
    );
    return match ? { uid: match[1], token: match[2] } : null;
  });
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    // Fragments never reach HTTP/access logs; remove them from browser history as well.
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">Récupération</p>
        <h1>Réinitialiser mon mot de passe</h1>
        {completed ? (
          <p role="status">
            Votre mot de passe a été modifié. Reconnectez-vous avec votre
            nouveau mot de passe.
          </p>
        ) : link ? (
          <PasswordForm
            recovery={link}
            onSuccess={() => {
              setCompleted(true);
              setLink(null);
            }}
          />
        ) : (
          <p className="form-error" role="alert">
            Ce lien est invalide ou expiré. Demandez un nouveau lien.
          </p>
        )}
        {!completed && (
          <button
            className="secondary"
            onClick={() => onNavigate("/password/forgot")}
          >
            Demander un nouveau lien
          </button>
        )}
        <button
          className="secondary"
          onClick={() => {
            onNavigate("/");
          }}
        >
          Retour à la connexion
        </button>
      </section>
    </main>
  );
}
