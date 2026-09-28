import pytest

from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role


@pytest.mark.parametrize("role", [Role.ADMIN, Role.COACH, Role.VIEWER])
def test_business_roles_require_a_single_organization(role: Role) -> None:
    assert requires_single_organization(role)


def test_superadmin_does_not_require_an_assigned_organization() -> None:
    assert not requires_single_organization(None)
