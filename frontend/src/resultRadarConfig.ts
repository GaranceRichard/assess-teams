import type {
  ChartData,
  ChartOptions,
  PointStyle,
  RadialLinearScale,
} from "chart.js";

import type { ResultAxis, ResultTeam } from "./results";
import type { Theme } from "./theme";

const colors = ["#008c82", "#aa70eb", "#df7435", "#448feb", "#d35888"];
const points: PointStyle[] = [
  "circle",
  "rect",
  "triangle",
  "rectRot",
  "crossRot",
];

export function seriesStyle(index: number) {
  return {
    color: colors[index % colors.length],
    dash: index === 0 ? [] : [2 + index * 2, 3],
    point: points[index % points.length],
  };
}

export function radarData(
  axes: ResultAxis[],
  teams: ResultTeam[],
  selected: number[],
): ChartData<"radar"> {
  return {
    labels: axes.map((axis, index) => {
      const text = axis.text;
      return `${index + 1}. ${text.length > 34 ? `${text.slice(0, 31)}…` : text}`;
    }),
    datasets: teams.flatMap((team, index) => {
      if (!selected.includes(team.team_id)) return [];
      const style = seriesStyle(index);
      return [
        {
          label: `${index + 1}. ${team.team_name}`,
          data: team.scores,
          borderColor: style.color,
          backgroundColor: `${style.color}20`,
          borderDash: style.dash,
          pointStyle: style.point,
          pointBackgroundColor: style.color,
          pointRadius: 4,
          borderWidth: 2,
          fill: true,
        },
      ];
    }),
  };
}

export function radarOptions(
  theme: Theme,
  onCriterion?: (index: number) => void,
): ChartOptions<"radar"> {
  const text = theme === "night" ? "#e5efec" : "#18252c";
  const grid = theme === "night" ? "#50645e" : "#aebdb8";
  return {
    onClick: (event, elements, chart) => {
      if (!onCriterion || event.x === null || event.y === null) return;
      const radial = chart.scales.r as RadialLinearScale;
      const labels = chart.data.labels ?? [];
      const index = labels.findIndex((_, i) => {
        const bounds = radial.getPointLabelPosition(i);
        return (
          event.x! >= bounds.left &&
          event.x! <= bounds.right &&
          event.y! >= bounds.top &&
          event.y! <= bounds.bottom
        );
      });
      const clicked = index >= 0 ? index : elements[0]?.index;
      if (clicked !== undefined) onCriterion(clicked);
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: text, showLabelBackdrop: false },
        grid: { color: grid },
        angleLines: { color: grid },
        pointLabels: { color: text, font: { size: 12 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };
}
