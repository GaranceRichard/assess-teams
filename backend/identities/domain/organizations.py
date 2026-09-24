from identities.domain.users import Actor, Role


def can_manage_organizations(actor: Actor) -> bool:
    return actor.is_active and (actor.is_superuser or actor.role is Role.ADMIN)


def requires_single_organization(role: Role | None) -> bool:
    return role in {Role.COACH, Role.VIEWER}
