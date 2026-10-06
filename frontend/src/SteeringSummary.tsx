import { completionDate } from "./evaluationRuns";
import type { SteeringProjection } from "./steering";

export function SteeringSummary({ data }: { data: SteeringProjection }) {
  const { summary } = data;
  const cards = [
    [
      "Équipes actives",
      summary.active_teams,
      "Équipes actuellement actives dans cette organisation.",
    ],
    [
      "Avec un résultat",
      summary.teams_with_results,
      "Équipes actives avec au moins une passation complétée accessible.",
    ],
    [
      "Sans résultat",
      summary.teams_without_results,
      "Équipes actives sans aucune passation complétée accessible.",
    ],
    [
      "Évaluations en retard",
      summary.overdue_evaluations,
      "Passations attendues non complétées des équipes actives, dont l’échéance précède strictement la date de référence.",
    ],
    [
      "Dernière complétion",
      summary.last_completed_at
        ? completionDate(summary.last_completed_at)
        : "Aucune complétion",
      "Dernière date de complétion connue pour les équipes actives ; une révision ne change pas cette date.",
    ],
  ];
  return (
    <>
      <p>
        Date de référence :{" "}
        <time dateTime={data.as_of_date}>{data.as_of_date}</time>
      </p>
      <dl className="steering-summary" aria-label="Synthèse du dispositif">
        {cards.map(([label, value, definition]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <strong>{value}</strong>
              <small>{definition}</small>
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
