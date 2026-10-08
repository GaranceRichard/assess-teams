import { PasswordForm } from "./PasswordForm";
import "./passwords.css";

export function ProfilePassword() {
  return (
    <details className="profile-password">
      <summary>Modifier mon mot de passe</summary>
      <PasswordForm />
    </details>
  );
}
