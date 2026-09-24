import { useEffect, useState } from "react";

import { getCurrentUser, login, logout, type SessionUser } from "./auth";
import { LoginPage } from "./LoginPage";
import { ProductShell } from "./ProductShell";
import { SetPasswordPage } from "./SetPasswordPage";
import { applyTheme, readTheme } from "./theme";
import "./styles.css";
import "./theme.css";

type AuthState =
  | { kind: "loading" }
  | { kind: "anonymous"; error: string | null }
  | { kind: "authenticated"; user: SessionUser };

export function App() {
  const [auth, setAuth] = useState<AuthState>({ kind: "loading" });
  const [path, setPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user && window.location.pathname === "/") {
          window.history.replaceState({}, "", "/dashboard");
          setPath("/dashboard");
        }
        setAuth(
          user
            ? { kind: "authenticated", user }
            : { kind: "anonymous", error: null },
        );
      })
      .catch(() =>
        setAuth({ kind: "anonymous", error: "Le service est indisponible." }),
      );
  }, []);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  async function handleLogin(username: string, password: string) {
    try {
      const user = await login({ username, password });
      setAuth({ kind: "authenticated", user });
      navigate("/dashboard");
    } catch {
      setAuth({
        kind: "anonymous",
        error: "Identifiant ou mot de passe invalide.",
      });
    }
  }

  async function handleLogout() {
    await logout();
    setAuth({ kind: "anonymous", error: null });
    navigate("/");
  }

  const invitation = path.match(/^\/invitation\/([^/]+)\/([^/]+)$/);
  if (invitation) {
    if (auth.kind === "loading")
      return <main className="loading">Chargement…</main>;
    return (
      <SetPasswordPage
        uid={invitation[1]}
        token={invitation[2]}
        onComplete={() => navigate("/")}
      />
    );
  }

  if (auth.kind === "loading")
    return <main className="loading">Chargement…</main>;
  if (auth.kind === "anonymous")
    return <LoginPage error={auth.error} onLogin={handleLogin} />;
  return (
    <ProductShell
      path={path}
      user={auth.user}
      onNavigate={navigate}
      onLogout={handleLogout}
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
