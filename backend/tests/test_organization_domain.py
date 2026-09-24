import pytest

from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role


@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_coach_and_viewer_require_a_single_organization(role: Role) -> None:
    assert requires_single_organization(role)


def test_admin_and_superadmin_scope_can_span_organizations() -> None:
    assert not requires_single_organization(Role.ADMIN)
    assert not requires_single_organization(None)
