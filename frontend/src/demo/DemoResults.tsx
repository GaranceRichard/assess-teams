import { useState } from "react";
import { ResultsViews } from "../ResultsViews";
import { ResultTeamSelection } from "../ResultTeamSelection";
import type { Theme } from "../theme";
import { comparison } from "./results";
import "../results.css";
import "../results-views.css";
export function DemoResults({ theme }: { theme: Theme }) {
  const data = comparison();
  const requestedId = Number(
    new URLSearchParams(window.location.hash.split("?")[1]).get("team_id"),
  );
  const requested = data.teams.some((team) => team.team_id === requestedId)
    ? requestedId
    : null;
  const [selected, setSelected] = useState(
    requested ? [requested] : data.teams.map((t) => t.team_id),
  );
  return (
    <section className="results-page product-page">
      <h1>Résultats</h1>
      <p>Atelier Horizon · Coopération d’équipe · v1</p>
      <p className="results-note">
        Les observations « simulation » sont fictives. « Votre passation »
        reprend vos scores de cette session. Cliquez sur un critère pour
        explorer son historique, sans classement des équipes.
      </p>
      <div className="results-layout page-content">
        <ResultTeamSelection
          teams={data.teams}
          selected={selected}
          onToggle={(id) =>
            setSelected((current) =>
              current.includes(id)
                ? current.filter((t) => t !== id)
                : [...current, id],
            )
          }
        />
        <ResultsViews
          comparison={data}
          familyId={1}
          selected={selected}
          theme={theme}
        />
      </div>
    </section>
  );
}
