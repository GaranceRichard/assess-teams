import type { SessionUser, UserRole } from "./auth";
import type { ManagedUser } from "./managedUsers";

const allRoles: UserRole[] = ["Admin", "Coach", "Viewer"];
const subordinateRoles: UserRole[] = ["Coach", "Viewer"];

export function creationRoles(actor: SessionUser): UserRole[] {
  if (actor.is_superuser) return allRoles;
  return actor.role === "Admin" ? subordinateRoles : [];
}

export function canManageTarget(
  actor: SessionUser,
  target: ManagedUser,
): boolean {
  if (target.identifier === actor.username) return false;
  if (actor.is_superuser) return true;
  if (actor.role === "Admin") {
    return target.user_type === "Coach" || target.user_type === "Viewer";
  }
  return actor.role === "Coach" && target.user_type === "Viewer";
}

export function editableRoles(
  actor: SessionUser,
  target: ManagedUser,
): UserRole[] {
  if (!canManageTarget(actor, target)) return [];
  if (actor.is_superuser && target.user_type !== "Superadmin") return allRoles;
  return actor.role === "Admin" ? subordinateRoles : [];
}
