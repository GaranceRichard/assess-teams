import { productHref } from "./productHref";
import { formatDate } from "./dateTime";
import { completionDate } from "./evaluationRuns";
import { steeringResultsPath } from "./steering";
import type { SteeringProjection, SteeringTeam } from "./steering";

const labels: Record<SteeringTeam["status"], string> = {
  overdue: "En retard",
  never_evaluated: "Jamais évaluée",
  up_to_date: "À jour",
};

export function SteeringTeams({
  data,
  onNavigate,
}: {
  data: SteeringProjection;
  onNavigate: (path: string) => void;
}) {
  if (data.teams.length === 0)
    return <p>Aucune équipe active dans cette organisation.</p>;
  return (
    <>
      <div
        className="steering-table"
        role="region"
        aria-label="Équipes suivies"
        tabIndex={0}
      >
        <table>
          <caption>
            Équipes actives — retards, puis jamais évaluées, puis à jour
          </caption>
          <thead>
            <tr>
              {[
                "Équipe",
                "Coachs affectés",
                "Dernier modèle évalué",
                "Version exacte",
                "Dernière complétion",
                "Prochaine échéance",
                "État",
                "Détail",
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.teams.map((team) => (
              <tr key={team.team_id}>
                <th scope="row">{team.team_name}</th>
                <td>
                  {team.coaches.map((coach) => coach.name).join(", ") ||
                    "Aucun Coach affecté"}
                </td>
                <td>{team.last_result?.model_name ?? "Aucun modèle évalué"}</td>
                <td>
                  {team.last_result
                    ? `v${team.last_result.version}`
                    : "Non disponible"}
                </td>
                <td>
                  {team.last_result ? (
                    <time dateTime={team.last_result.completed_at}>
                      {completionDate(team.last_result.completed_at)}
                    </time>
                  ) : (
                    "Aucune complétion"
                  )}
                </td>
                <td>
                  {team.next_due_date ? (
                    <time dateTime={team.next_due_date}>
                      {formatDate(team.next_due_date)}
                    </time>
                  ) : (
                    "Aucune échéance connue"
                  )}
                </td>
                <td>
                  <span
                    className={`steering-state steering-state--${team.status}`}
                  >
                    {labels[team.status]}
                  </span>
                </td>
                <td>
                  {team.last_result ? (
                    <a
                      aria-label={`Voir les résultats de ${team.team_name}`}
                      href={productHref(
                        steeringResultsPath(data.organization.id, team),
                      )}
                      onClick={(event) => {
                        if (
                          event.button !== 0 ||
                          event.ctrlKey ||
                          event.metaKey ||
                          event.shiftKey ||
                          event.altKey
                        )
                          return;
                        event.preventDefault();
                        onNavigate(
                          steeringResultsPath(data.organization.id, team),
                        );
                      }}
                    >
                      Voir les résultats
                    </a>
                  ) : (
                    "Aucun résultat"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="steering-note">
        Jamais évaluée : aucune complétion. Sinon, En retard : au moins une
        passation attendue non complétée avant aujourd’hui. À jour : aucun
        retard connu, sans présumer de la qualité de l’équipe. La prochaine
        échéance peut être déjà en retard.
      </p>
    </>
  );
}
