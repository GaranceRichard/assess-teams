import { useState } from "react";

import type { SessionUser } from "./auth";
import { ActivityJournalPage } from "./ActivityJournalPage";
import { ErrorJournalPage } from "./ErrorJournalPage";
import { EvaluationPage } from "./EvaluationPage";
import { canAccess, routeFor } from "./navigation";
import { OrganizationPage } from "./OrganizationPage";
import { PlanningPage } from "./PlanningPage";
import { ProductSidebar } from "./ProductSidebar";
import { SuperadminDashboard } from "./SuperadminDashboard";
import { TeamPage } from "./TeamPage";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`app-shell${sidebarCollapsed ? " app-shell--sidebar-collapsed" : ""}`}
    >
      <ProductSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onNavigate={onNavigate}
        path={path}
        role={user.role}
      />
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
        ) : authorized && path === "/organization" ? (
          <OrganizationPage isSuperadmin={user.is_superuser} />
        ) : authorized && path === "/teams" && user.role === "Admin" ? (
          <TeamPage actor={user} />
        ) : authorized && path === "/templates" && user.role === "Admin" ? (
          <EvaluationPage />
        ) : authorized && path === "/planning" && user.role === "Admin" ? (
          <PlanningPage actor={user} />
        ) : authorized && path === "/activity-journal" ? (
          <ActivityJournalPage actor={user} />
        ) : authorized && path === "/error-journal" ? (
          <ErrorJournalPage actor={user} />
        ) : authorized ? (
          <section className="placeholder">
            <p className="eyebrow">Votre espace</p>
            <h1>{route.title}</h1>
            {path === "/dashboard" &&
              user.role !== "Admin" &&
              user.organization_name && (
                <p>
                  Vous êtes affecté à :{" "}
                  <strong>{user.organization_name}</strong>
                </p>
              )}
            {path === "/dashboard" &&
              user.role === "Coach" &&
              user.team_names.length > 0 && (
                <p>
                  Équipes : <strong>{user.team_names.join(", ")}</strong>
                </p>
              )}
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
