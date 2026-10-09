import { formatDateTime } from "./dateTime";
import type { ResultHistory } from "./results";

export function ResultsHistoryTable({ history }: { history: ResultHistory }) {
  const teams = history.teams.map((team) => ({
    ...team,
    points: [...team.points].sort(
      (a, b) =>
        new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime() || a.run_id - b.run_id,
    ),
  }));
  const rowCount = Math.max(0, ...teams.map((team) => team.points.length));
  return (
    <div
      className="table-wrap results-table-scroll"
      role="region"
      aria-label="Observations historiques"
      tabIndex={0}
    >
      <table>
        <caption>Observations historiques du critère sélectionné</caption>
        <thead>
          <tr>
            {teams.map((team) => (
              <th key={team.team_id} scope="col">
                {team.team_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => (
            <tr key={index}>
              {teams.map((team) => {
                const point = team.points[index];
                return (
                  <td key={team.team_id}>
                    {point && (
                      <span
                        title={`${point.team_name} · v${point.version} · ${point.criterion_text}`}
                      >
                        {point.score}/10 (
                        <time dateTime={point.completed_at}>
                          {formatDateTime(point.completed_at)}
                        </time>
                        )
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
