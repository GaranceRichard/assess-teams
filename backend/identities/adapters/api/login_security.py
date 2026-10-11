from ipaddress import ip_address, ip_network

from django import forms
from django.conf import settings
from django.contrib.admin.forms import AdminAuthenticationForm
from drf_spectacular.authentication import BasicScheme
from drf_spectacular.utils import OpenApiParameter
from rest_framework.authentication import BasicAuthentication
from rest_framework.exceptions import AuthenticationFailed, Throttled

from identities.application.login_limits import authenticate_limited

LOGIN_RESTRICTED = "Trop de tentatives de connexion. Réessayez après le délai indiqué."
RETRY_AFTER = OpenApiParameter(
    "Retry-After",
    int,
    OpenApiParameter.HEADER,
    response=[429],
    description="Secondes restantes avant une nouvelle tentative.",
)


def client_origin(request):
    """Walk the forwarded chain from the trusted peer, never trust arbitrary headers."""
    try:
        peer = ip_address(request.META.get("REMOTE_ADDR", ""))
    except ValueError:
        return "unknown"
    networks = [ip_network(value) for value in settings.LOGIN_TRUSTED_PROXIES]
    if not any(peer in network for network in networks):
        return str(peer)
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if not forwarded or len(forwarded) > 4096:
        return str(peer)
    try:
        chain = [ip_address(value.strip()) for value in forwarded.split(",")]
    except ValueError:
        return str(peer)
    for address in reversed(chain):
        if not any(peer in network for network in networks):
            break
        peer = address
    return str(peer)


def authenticate_login(request, username, password):
    user, wait = authenticate_limited(request, username, password, client_origin(request))
    if wait:
        raise Throttled(wait=wait, detail=LOGIN_RESTRICTED)
    return user


class LimitedBasicAuthentication(BasicAuthentication):
    def authenticate_credentials(self, userid, password, request=None):
        user = authenticate_login(request, userid, password)
        if user is None:
            raise AuthenticationFailed("Identifiant ou mot de passe invalide.")
        return user, None


class LimitedBasicScheme(BasicScheme):
    target_class = LimitedBasicAuthentication
    priority = 0


class LimitedAdminAuthenticationForm(AdminAuthenticationForm):
    def clean(self):
        username = self.cleaned_data.get("username")
        password = self.cleaned_data.get("password")
        if username and password:
            try:
                self.user_cache = authenticate_login(self.request, username, password)
            except Throttled as error:
                raise forms.ValidationError(
                    f"{LOGIN_RESTRICTED} Attendez {error.wait} secondes.", code="restricted"
                ) from error
            if self.user_cache is None:
                raise self.get_invalid_login_error()
            self.confirm_login_allowed(self.user_cache)
        return self.cleaned_data
