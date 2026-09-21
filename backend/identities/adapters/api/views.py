from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import serializers, status
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.permissions import CanCreateUser
from identities.adapters.api.serializers import CreateUserSerializer, UserCreatedSerializer
from identities.adapters.repository import DjangoUserRepository
from identities.application.create_user import CreateUserCommand, create_user
from identities.domain.users import Actor, Role, UserCreationForbidden
from identities.ports.users import IdentityAlreadyExists


class UserCreateView(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication]
    permission_classes = [CanCreateUser]

    @extend_schema(
        operation_id="users_create",
        description=(
            "Crée une identité active avec une fonction métier unique. Un Superadmin peut "
            "créer Admin, Coach ou Viewer ; un Admin peut créer Coach ou Viewer. "
            "Aucun superuser ni rattachement organisationnel n'est créé."
        ),
        request=CreateUserSerializer,
        responses={
            201: UserCreatedSerializer,
            400: OpenApiResponse(OpenApiTypes.OBJECT, "Données invalides ou identité existante."),
            401: OpenApiResponse(description="Authentification absente, invalide ou inactive."),
            403: OpenApiResponse(
                description="Fonction de l'appelant ou fonction demandée interdite."
            ),
        },
    )
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        command = self._build_command(request.user, serializer.validated_data)
        try:
            identity = create_user(command, DjangoUserRepository())
        except UserCreationForbidden as error:
            raise PermissionDenied("La fonction demandée est interdite.") from error
        except IdentityAlreadyExists as error:
            raise serializers.ValidationError(
                {"username": ["Une identité utilise déjà cet identifiant."]}
            ) from error
        response = UserCreatedSerializer(identity)
        return Response(response.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _build_command(user, data) -> CreateUserCommand:
        actor_role = Role(user.role) if user.role else None
        return CreateUserCommand(
            actor=Actor(user.is_active, user.is_superuser, actor_role),
            username=data["username"],
            password=data["password"],
            role=Role(data["role"]),
        )
