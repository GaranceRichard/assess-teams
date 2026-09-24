import type { Organization } from "./organizations";

export function unavailableSingleOrganizationUserIds(
  organizations: Organization[],
  exceptOrganizationId?: number,
): Set<number> {
  const unavailableIds = new Set<number>();

  organizations
    .filter((organization) => organization.id !== exceptOrganizationId)
    .flatMap((organization) => organization.users)
    .filter((user) => user.user_type === "Coach" || user.user_type === "Viewer")
    .forEach((user) => unavailableIds.add(user.id));

  return unavailableIds;
}
