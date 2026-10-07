import { useEffect, useState } from "react";

import type { SessionUser } from "./auth";
import { DashboardActivity } from "./DashboardActivity";
import { getDashboard, type DashboardData } from "./dashboard";
import { PalettePicker } from "./PalettePicker";
import type { PalettePreference } from "./usePalettePreference";
import "./dashboard.css";

type Props = {
  user: SessionUser;
  onNavigate: (path: string) => void;
  preference: PalettePreference;
};

export function DashboardPage({ user, onNavigate, preference }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getDashboard().then(
      (result) => {
        if (active) setData(result);
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const profile = data?.profile ?? user;
  const name = data
    ? [data.profile.first_name, data.profile.last_name]
        .filter(Boolean)
        .join(" ")
    : "";
  const shortcuts = [
    ...(!user.is_superuser && (user.role === "Admin" || user.role === "Coach")
      ? [{ path: "/evaluations", label: "Mes évaluations" }]
      : []),
    { path: "/results", label: "Voir les résultats" },
    ...(user.role === "Admin"
      ? [{ path: "/steering", label: "Pilotage" }]
      : []),
  ];
  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <p className="eyebrow">Votre espace</p>
      <h1 id="dashboard-title">Tableau de bord</h1>
      <div className="dashboard-grid">
        <section className="dashboard-card" aria-labelledby="profile-title">
          <h2 id="profile-title">Mon profil</h2>
          <p className="dashboard-identity">{name || user.username}</p>
          <p>{user.is_superuser ? "Superadmin" : user.role}</p>
          {!user.is_superuser && (
            <p>
              Organisation :{" "}
              <strong>
                {profile.organization_name ?? "Aucune organisation"}
              </strong>
            </p>
          )}
          {user.role === "Coach" && profile.team_names.length > 0 && (
            <p>
              Équipes : <strong>{profile.team_names.join(", ")}</strong>
            </p>
          )}
          <h3>Apparence</h3>
          <p>
            <span className="appearance-day">
              Votre couleur personnalise les accents et reste conservée pour vos
              prochaines connexions.
            </span>
            <span className="appearance-night">
              Votre couleur habille les fonds en clair ou en sombre et reste
              conservée pour vos prochaines connexions.
            </span>
          </p>
          <PalettePicker user={user} preference={preference} />
        </section>
        <section
          className="dashboard-card"
          aria-labelledby="activity-title"
          aria-busy={!data && !error}
        >
          <h2 id="activity-title">Activité récente</h2>
          <p>
            {user.is_superuser
              ? "Activité globale · organisation indiquée pour chaque événement."
              : "Évaluations terminées et révisées dans votre périmètre."}
          </p>
          {!data && !error && <p>Chargement de votre activité…</p>}
          {error && (
            <>
              <p role="alert">Impossible de charger votre tableau de bord.</p>
              <button
                className="secondary"
                onClick={() => {
                  setError(false);
                  setAttempt(attempt + 1);
                }}
              >
                Réessayer
              </button>
            </>
          )}
          {data && (
            <DashboardActivity
              events={data.recent_activity}
              global={data.activity_scope === "global"}
            />
          )}
        </section>
        <section
          className="dashboard-card dashboard-shortcuts"
          aria-labelledby="shortcuts-title"
        >
          <h2 id="shortcuts-title">Raccourcis utiles</h2>
          {data?.pending_assignments != null && (
            <p>
              {data.pending_assignments === 0
                ? "Aucune évaluation assignée à réaliser."
                : `${data.pending_assignments} ${data.pending_assignments === 1 ? "évaluation assignée" : "évaluations assignées"} à réaliser.`}
            </p>
          )}
          <ul>
            {shortcuts.map(({ path, label }) => (
              <li key={path}>
                <a
                  href={path}
                  onClick={(event) => {
                    if (
                      !event.ctrlKey &&
                      !event.metaKey &&
                      !event.shiftKey &&
                      !event.altKey
                    ) {
                      event.preventDefault();
                      onNavigate(path);
                    }
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
