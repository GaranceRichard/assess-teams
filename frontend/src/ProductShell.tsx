import { useEffect, useState } from "react";

import type { SessionUser } from "./auth";
import { ActivityJournalPage } from "./ActivityJournalPage";
import { LogsPage } from "./LogsPage";
import { EvaluationPage } from "./EvaluationPage";
import { EvaluationTakingPage } from "./EvaluationTakingPage";
import { canAccess, routeFor } from "./navigation";
import { OrganizationPage } from "./OrganizationPage";
import { DashboardPage } from "./DashboardPage";
import { usePalettePreference } from "./usePalettePreference";
import { PlanningPage } from "./PlanningPage";
import { ProductSidebar } from "./ProductSidebar";
import { ResultsPage } from "./ResultsPage";
import { SteeringPage } from "./SteeringPage";
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
  const preference = usePalettePreference(user);
  const route = routeFor(path);
  const authorized = route && canAccess(user.role, route);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("product-active");
    return () => document.documentElement.classList.remove("product-active");
  }, []);

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
        <div className="page-viewport" key={path}>
          {authorized && path === "/dashboard" ? (
            <DashboardPage
              user={user}
              onNavigate={onNavigate}
              preference={preference}
            />
          ) : authorized && path === "/users" ? (
            <SuperadminDashboard actor={user} />
          ) : authorized && path === "/organization" ? (
            <OrganizationPage isSuperadmin={user.is_superuser} />
          ) : authorized && path === "/teams" && user.role === "Admin" ? (
            <TeamPage actor={user} />
          ) : authorized && path === "/templates" && user.role === "Admin" ? (
            <EvaluationPage />
          ) : authorized && path === "/planning" && user.role === "Admin" ? (
            <PlanningPage actor={user} />
          ) : authorized && path === "/evaluations" ? (
            <EvaluationTakingPage actor={user} />
          ) : authorized && path === "/results" ? (
            <ResultsPage theme={theme} actor={user} />
          ) : authorized && path === "/steering" ? (
            <SteeringPage actor={user} onNavigate={onNavigate} />
          ) : authorized && path === "/activity-journal" ? (
            <ActivityJournalPage actor={user} />
          ) : authorized && path === "/logs" ? (
            <LogsPage actor={user} />
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
        </div>
      </main>
    </div>
  );
}
