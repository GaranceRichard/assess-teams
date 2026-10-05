import { useEffect, useState } from "react";

import type { SessionUser } from "./auth";
import { listEvaluations, type Evaluation } from "./evaluations";
import { listOrganizations, type Organization } from "./organizations";
import { PlanningForm } from "./PlanningForm";
import {
  createSchedule,
  deleteSchedule,
  type EvaluationSchedule,
  listSchedules,
  type ScheduleInput,
  updateSchedule,
} from "./planning";
import { ScheduleEditDialog } from "./ScheduleDialogs";
import { ScheduleList } from "./ScheduleList";
import { listTeams, type Team } from "./teams";
import "./planning.css";

type Props = { actor: SessionUser };

export function PlanningPage({ actor }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [schedules, setSchedules] = useState<EvaluationSchedule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [editing, setEditing] = useState<EvaluationSchedule | null>(null);
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

  async function create(input: ScheduleInput) {
    try {
      const saved = await createSchedule(input);
      setSchedules((current) => [...current, saved]);
      setError(null);
    } catch (saveError) {
      setError("La planification de l’évaluation a été refusée.");
      throw saveError;
    }
  }

  async function update(input: ScheduleInput) {
    if (!editing) return;
    try {
      const saved = await updateSchedule(editing.id, input);
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === saved.id ? saved : schedule,
        ),
      );
      setEditing(null);
      setError(null);
    } catch (saveError) {
      setError("La modification de la planification a été refusée.");
      throw saveError;
    }
  }

  async function remove() {
    if (!editing) return;
    try {
      await deleteSchedule(editing.id);
      setSchedules((current) =>
        current.filter((schedule) => schedule.id !== editing.id),
      );
      setEditing(null);
      setError(null);
    } catch {
      setError("La suppression de la planification a été refusée.");
    }
  }

  const organizationEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.organization_id === organizationId &&
      evaluation.status === "VALIDATED",
  );
  const editingEvaluations = editing
    ? evaluations.filter(
        (evaluation) =>
          evaluation.organization_id === editing.organization_id &&
          (evaluation.status === "VALIDATED" ||
            evaluation.id === editing.evaluation_id),
      )
    : [];
  const organizationSchedules = schedules.filter(
    (schedule) => schedule.organization_id === organizationId,
  );
  const organizationMembers =
    organizations
      .find((organization) => organization.id === organizationId)
      ?.users.filter(
        (member) =>
          member.user_type === "Coach" || member.user_type === "Admin",
      ) ?? [];
  const organizationAssignees =
    actor.is_superuser && actor.id
      ? [
          {
            id: actor.id,
            identifier: actor.username,
            user_type: "Superadmin" as const,
          },
          ...organizationMembers.filter((member) => member.id !== actor.id),
        ]
      : organizationMembers;

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
            assignees={organizationAssignees}
            organizationId={organizationId}
            teams={teams}
            evaluations={organizationEvaluations}
            onSubmit={create}
          />
          <section aria-labelledby="planned-evaluations-title">
            <h2 id="planned-evaluations-title">Évaluations planifiées</h2>
            <ScheduleList
              onOpen={setEditing}
              schedules={organizationSchedules}
            />
          </section>
        </div>
      )}
      {editing && (
        <ScheduleEditDialog
          assignees={organizationAssignees}
          evaluations={editingEvaluations}
          onCancel={() => setEditing(null)}
          onDelete={remove}
          onSubmit={update}
          schedule={editing}
          teams={teams}
        />
      )}
    </section>
  );
}
