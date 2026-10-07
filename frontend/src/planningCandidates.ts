import type { SessionUser } from "./auth";
import type { Evaluation } from "./evaluations";
import type { Organization } from "./organizations";
import type { EvaluationSchedule } from "./planning";

export function planningCandidates(
  actor: SessionUser,
  organizations: Organization[],
  evaluations: Evaluation[],
  organizationId: number | null,
  editing: EvaluationSchedule | null,
) {
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
  const organizationMembers =
    organizations
      .find((organization) => organization.id === organizationId)
      ?.users.filter(
        (member) =>
          member.is_active !== false &&
          (member.user_type === "Coach" || member.user_type === "Admin"),
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

  return { organizationEvaluations, editingEvaluations, organizationAssignees };
}
