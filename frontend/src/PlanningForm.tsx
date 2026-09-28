import { useState } from "react";

import type { Evaluation } from "./evaluations";
import type { OrganizationMember } from "./organizations";
import {
  scheduleLabels,
  type ScheduleInput,
  type ScheduleMode,
} from "./planning";
import type { Team } from "./teams";

type Props = {
  organizationId: number;
  teams: Team[];
  evaluations: Evaluation[];
  coaches: OrganizationMember[];
  onSubmit: (input: ScheduleInput) => Promise<void>;
};

export function PlanningForm({
  organizationId,
  teams,
  evaluations,
  coaches,
  onSubmit,
}: Props) {
  const [teamId, setTeamId] = useState("");
  const [evaluationId, setEvaluationId] = useState("");
  const [mode, setMode] = useState<ScheduleMode>("immediate");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [coachId, setCoachId] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedTeam = teams.find((team) => team.id === Number(teamId));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        organization_id: organizationId,
        team_id: Number(teamId),
        evaluation_id: Number(evaluationId),
        mode,
        ...(coachId ? { coach_id: Number(coachId) } : {}),
        ...(mode === "immediate" ? {} : { first_due_date: firstDueDate }),
      });
      setTeamId("");
      setEvaluationId("");
      setMode("immediate");
      setFirstDueDate("");
      setCoachId("");
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
            setCoachId("");
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
          {selectedTeam.coaches.length === 0
            ? "Coach à rattacher"
            : "Ajouter un Coach (facultatif)"}
          <select
            value={coachId}
            onChange={(event) => setCoachId(event.target.value)}
            required={selectedTeam.coaches.length === 0}
          >
            <option value="">Choisir un Coach</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.identifier}
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
            <option key={evaluation.id} value={evaluation.id}>
              {evaluation.name}
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
      <button disabled={saving} type="submit">
        {saving ? "Planification…" : "Planifier l’évaluation"}
      </button>
    </form>
  );
}
