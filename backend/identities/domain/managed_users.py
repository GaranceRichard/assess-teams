from identities.domain.users import Actor, Role


def can_view_managed_users(actor: Actor) -> bool:
    return actor.is_active and (actor.is_superuser or actor.role in {Role.ADMIN, Role.COACH})


def can_invite_managed_user(actor: Actor, requested_role: Role) -> bool:
    if not actor.is_active:
        return False
    if actor.is_superuser:
        return True
    return actor.role is Role.ADMIN and requested_role in {Role.COACH, Role.VIEWER}


def can_manage_user(
    actor: Actor,
    *,
    target_is_self: bool,
    target_is_superuser: bool,
    target_role: Role | None,
    requested_role: Role | None = None,
) -> bool:
    if not actor.is_active or target_is_self:
        return False
    if actor.is_superuser:
        return True
    if target_is_superuser or target_role is None:
        return False
    if actor.role is Role.ADMIN:
        allowed = {Role.COACH, Role.VIEWER}
        return target_role in allowed and (requested_role is None or requested_role in allowed)
    if actor.role is Role.COACH:
        return target_role is Role.VIEWER and requested_role in {None, Role.VIEWER}
    return False
