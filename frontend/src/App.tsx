import { useEffect, useState } from "react";

import { fetchHealth, type Health } from "./health";
import "./styles.css";

type HealthState =
  { kind: "loading" } | { kind: "ready"; health: Health } | { kind: "error" };

export function App() {
  const [healthState, setHealthState] = useState<HealthState>({
    kind: "loading",
  });

  useEffect(() => {
    fetchHealth()
      .then((health) => setHealthState({ kind: "ready", health }))
      .catch(() => setHealthState({ kind: "error" }));
  }, []);

  return (
    <main>
      <p className="eyebrow">Socle technique</p>
      <h1>Assess teams</h1>
      <p className="intro">L’environnement de développement est prêt.</p>
      <section
        aria-live="polite"
        className={`status status--${healthState.kind}`}
      >
        <h2>État des services</h2>
        {healthState.kind === "loading" && <p>Vérification en cours…</p>}
        {healthState.kind === "ready" && (
          <p>API opérationnelle · SQLite {healthState.health.database}</p>
        )}
        {healthState.kind === "error" && (
          <p>
            API indisponible. Vérifiez que le backend est démarré sur le port
            8000.
          </p>
        )}
      </section>
    </main>
  );
}
