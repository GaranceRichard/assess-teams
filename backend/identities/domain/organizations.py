from identities.domain.users import Actor, Role


def can_manage_organizations(actor: Actor) -> bool:
    return actor.is_active and (actor.is_superuser or actor.role is Role.ADMIN)
