import type { SessionUser } from "./auth";
import { canAccess, menuFor, routeFor } from "./navigation";
import { SuperadminDashboard } from "./SuperadminDashboard";
import type { Theme } from "./theme";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  path: string;
  user: SessionUser;
  onNavigate: (path: string) => void;
  onLogout: () => Promise<void>;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function ProductShell({
  path,
  user,
  onNavigate,
  onLogout,
  theme,
  onThemeChange,
}: Props) {
  const route = routeFor(path);
  const authorized = route && canAccess(user.role, route);

  return (
    <div className="app-shell">
      <aside>
        <a
          className="brand"
          href="/dashboard"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/dashboard");
          }}
        >
          Assess teams
        </a>
        <nav aria-label="Navigation principale">
          {menuFor(user.role).map((item) => (
            <a
              key={item.path}
              aria-current={path === item.path ? "page" : undefined}
              href={item.path}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.path);
              }}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </aside>
      <main className="workspace">
        <header>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <div>
            <strong>{user.username}</strong>
            <span>{user.is_superuser ? "Superadmin · Admin" : user.role}</span>
          </div>
          <button className="secondary" onClick={() => void onLogout()}>
            Se déconnecter
          </button>
        </header>
        {authorized && path === "/users" ? (
          <SuperadminDashboard actor={user} />
        ) : authorized ? (
          <section className="placeholder">
            <p className="eyebrow">Votre espace</p>
            <h1>{route.title}</h1>
            <p>{route.title} — fonctionnalité à venir</p>
          </section>
        ) : (
          <section className="placeholder denied" role="alert">
            <p className="eyebrow">Accès refusé</p>
            <h1>Page non autorisée</h1>
            <p>Votre fonction ne permet pas d’accéder à cette page.</p>
          </section>
        )}
      </main>
    </div>
  );
}
