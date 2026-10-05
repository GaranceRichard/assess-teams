import { versionLabel } from "./evaluationVersionLabel";
import { useState } from "react";

import type { Evaluation } from "./evaluations";
import type { OrganizationMember } from "./organizations";
import {
  type EvaluationSchedule,
  scheduleLabels,
  type ScheduleInput,
  type ScheduleMode,
} from "./planning";
import type { Team } from "./teams";

type Props = {
  organizationId: number;
  teams: Team[];
  evaluations: Evaluation[];
  assignees: OrganizationMember[];
  schedule?: EvaluationSchedule;
  onSubmit: (input: ScheduleInput) => Promise<void>;
};

export function PlanningForm({
  organizationId,
  teams,
  evaluations,
  assignees,
  schedule,
  onSubmit,
}: Props) {
  const [teamId, setTeamId] = useState(String(schedule?.team_id ?? ""));
  const [evaluationId, setEvaluationId] = useState(
    String(schedule?.evaluation_id ?? ""),
  );
  const [mode, setMode] = useState<ScheduleMode>(schedule?.mode ?? "immediate");
  const [firstDueDate, setFirstDueDate] = useState(
    schedule?.mode === "immediate" ? "" : (schedule?.first_due_date ?? ""),
  );
  const [assigneeId, setAssigneeId] = useState(
    String(schedule?.assignee_id ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const selectedTeam = teams.find((team) => team.id === Number(teamId));
  const selectedEvaluation = evaluations.find(
    (evaluation) => evaluation.id === Number(evaluationId),
  );
  const historicalEvaluation =
    selectedEvaluation !== undefined &&
    selectedEvaluation.status !== "VALIDATED";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        organization_id: organizationId,
        team_id: Number(teamId),
        evaluation_id: Number(evaluationId),
        assignee_id: Number(assigneeId),
        mode,
        ...(mode === "immediate" ? {} : { first_due_date: firstDueDate }),
      });
      setTeamId("");
      setEvaluationId("");
      setMode("immediate");
      setFirstDueDate("");
      setAssigneeId("");
    } catch {
      // The page owns and displays the API error.
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="planning-form" onSubmit={(event) => void submit(event)}>
      <label>
        Équipe
        <select
          value={teamId}
          onChange={(event) => {
            setTeamId(event.target.value);
          }}
          required
        >
          <option value="">Choisir une équipe</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>
      {selectedTeam && (
        <label>
          Responsable de l’évaluation
          <select
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            required
          >
            <option value="">Choisir un responsable</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.identifier} — {assignee.user_type}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Modèle d’évaluation
        <select
          value={evaluationId}
          onChange={(event) => setEvaluationId(event.target.value)}
          required
        >
          <option value="">Choisir un modèle</option>
          {evaluations.map((evaluation) => (
            <option
              disabled={evaluation.status !== "VALIDATED"}
              key={evaluation.id}
              value={evaluation.id}
            >
              {versionLabel(evaluation.family_name, evaluation.version)}
              {evaluation.status === "ARCHIVED"
                ? " — Archivé (historique)"
                : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        Planifier
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as ScheduleMode)}
        >
          {Object.entries(scheduleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {mode !== "immediate" && (
        <label>
          Première date
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={firstDueDate}
            onChange={(event) => setFirstDueDate(event.target.value)}
            required
          />
        </label>
      )}
      {historicalEvaluation && (
        <p>
          Référence historique : choisissez un modèle validé pour enregistrer
          des modifications.
        </p>
      )}
      <button disabled={saving || historicalEvaluation} type="submit">
        {saving
          ? "Enregistrement…"
          : schedule
            ? "Enregistrer les modifications"
            : "Planifier l’évaluation"}
      </button>
    </form>
  );
}
