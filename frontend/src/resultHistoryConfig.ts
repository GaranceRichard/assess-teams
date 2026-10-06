import type { ChartData, ChartOptions } from "chart.js";

import { completionDate } from "./evaluationRuns";
import { seriesStyle } from "./resultRadarConfig";
import type { ResultHistory, ResultObservation, ResultTeam } from "./results";
import type { Theme } from "./theme";

type ObservationPoint = {
  x: number;
  y: number;
  observation: ResultObservation;
};

export function historyData(
  history: ResultHistory,
  teams: ResultTeam[],
): ChartData<"line", ObservationPoint[]> {
  return {
    datasets: history.teams.map((team) => {
      const index = teams.findIndex((item) => item.team_id === team.team_id);
      const style = seriesStyle(index);
      return {
        label: `${index + 1}. ${team.team_name}`,
        data: team.points.map((point) => ({
          x: new Date(point.completed_at).getTime(),
          y: point.score,
          observation: point,
        })),
        borderColor: style.color,
        backgroundColor: style.color,
        borderDash: style.dash,
        pointStyle: style.point,
        pointRadius: 5,
        borderWidth: 2,
        fill: false,
        tension: 0,
        spanGaps: false,
      };
    }),
  };
}

export function historyOptions(theme: Theme): ChartOptions<"line"> {
  const text = theme === "night" ? "#f5f5f5" : "#171717";
  const grid = theme === "night" ? "#a3a3a3" : "#737373";
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        type: "linear",
        bounds: "data",
        title: { display: true, text: "Date de complétion", color: text },
        grid: { color: grid },
        ticks: {
          color: text,
          maxTicksLimit: 6,
          callback: (value) =>
            new Date(Number(value)).toLocaleDateString("fr-CA"),
        },
      },
      y: {
        min: 0,
        max: 10,
        grid: { color: grid },
        ticks: { stepSize: 2, color: text },
        title: { display: true, text: "Score 0–10", color: text },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = (context.raw as ObservationPoint).observation;
            return `${point.team_name} · ${completionDate(point.completed_at)} · ${point.score} / 10 · v${point.version}`;
          },
        },
      },
    },
  };
}
