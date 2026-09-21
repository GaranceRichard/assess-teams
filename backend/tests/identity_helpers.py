from base64 import b64encode

from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import User

TEST_CREDENTIAL = "test-only-credential"


def create_user(
    username: str,
    role: Role,
    *,
    is_active: bool = True,
) -> User:
    return User.objects.create_user(
        username=username,
        password=TEST_CREDENTIAL,
        role=role.value,
        is_active=is_active,
    )


def create_superuser(username: str = "root") -> User:
    return User.objects.create_superuser(username=username, password=TEST_CREDENTIAL)


def authenticate(client: APIClient, username: str, password: str = TEST_CREDENTIAL) -> None:
    credentials = b64encode(f"{username}:{password}".encode()).decode()
    client.credentials(HTTP_AUTHORIZATION=f"Basic {credentials}")


def valid_payload(username: str = "new-user", role: str = Role.VIEWER.value) -> dict:
    return {"username": username, "password": TEST_CREDENTIAL, "role": role}
