import { useEffect, useState } from "react";

import { listEvaluations, type Evaluation } from "./evaluations";
import { listOrganizations, type Organization } from "./organizations";
import { PlanningForm } from "./PlanningForm";
import {
  createSchedule,
  type EvaluationSchedule,
  listSchedules,
  type ScheduleInput,
} from "./planning";
import { ScheduleList } from "./ScheduleList";
import { listTeams, type Team } from "./teams";
import "./planning.css";

export function PlanningPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [schedules, setSchedules] = useState<EvaluationSchedule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listOrganizations(), listEvaluations(), listSchedules()])
      .then(([loadedOrganizations, loadedEvaluations, loadedSchedules]) => {
        setOrganizations(loadedOrganizations);
        setEvaluations(loadedEvaluations);
        setSchedules(loadedSchedules);
        if (loadedOrganizations.length === 1)
          setOrganizationId(loadedOrganizations[0].id);
      })
      .catch(() => setError("Impossible de charger la planification."));
  }, []);

  useEffect(() => {
    if (organizationId === null) return;
    listTeams(organizationId)
      .then(setTeams)
      .catch(() => setError("Impossible de charger les équipes."));
  }, [organizationId]);

  async function save(input: ScheduleInput) {
    try {
      const saved = await createSchedule(input);
      setSchedules((current) => [...current, saved]);
      if (input.coach_id) {
        const coach = organizations
          .find((organization) => organization.id === input.organization_id)
          ?.users.find((member) => member.id === input.coach_id);
        if (coach) {
          setTeams((current) =>
            current.map((team) =>
              team.id === input.team_id
                ? {
                    ...team,
                    coaches: [
                      ...team.coaches,
                      { id: coach.id, identifier: coach.identifier },
                    ],
                  }
                : team,
            ),
          );
        }
      }
      setError(null);
    } catch (saveError) {
      setError("La planification de l’évaluation a été refusée.");
      throw saveError;
    }
  }

  const organizationEvaluations = evaluations.filter(
    (evaluation) => evaluation.organization_id === organizationId,
  );
  const organizationSchedules = schedules.filter(
    (schedule) => schedule.organization_id === organizationId,
  );
  const organizationCoaches =
    organizations
      .find((organization) => organization.id === organizationId)
      ?.users.filter((member) => member.user_type === "Coach") ?? [];

  return (
    <section className="planning-page">
      <div>
        <p className="eyebrow">Administration</p>
        <h1>Planification</h1>
      </div>
      {error && <p role="alert">{error}</p>}
      <label className="planning-organization" htmlFor="planning-organization">
        Organisation
        <select
          id="planning-organization"
          value={organizationId ?? ""}
          onChange={(event) => {
            setTeams([]);
            setOrganizationId(
              event.target.value ? Number(event.target.value) : null,
            );
          }}
        >
          <option value="">Choisir une organisation</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      {organizationId === null ? (
        <p className="planning-empty">Sélectionnez une organisation.</p>
      ) : (
        <div className="planning-workspace">
          <PlanningForm
            organizationId={organizationId}
            teams={teams}
            evaluations={organizationEvaluations}
            coaches={organizationCoaches}
            onSubmit={save}
          />
          <section aria-labelledby="planned-evaluations-title">
            <h2 id="planned-evaluations-title">Évaluations planifiées</h2>
            <ScheduleList schedules={organizationSchedules} />
          </section>
        </div>
      )}
    </section>
  );
}
