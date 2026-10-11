"""Accept the original scheme only from the transport peer we trust."""

from ipaddress import ip_address

from django.conf import settings
from django.http import HttpResponseBadRequest
from django.utils.cache import patch_cache_control

from config.http_security import trusted_proxy_networks


class HttpSecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.networks = trusted_proxy_networks(settings.TRUSTED_PROXIES)

    def __call__(self, request):
        request.get_host()  # Validate even endpoints that never consult the Host header.
        response = self.check_transport(request) or self.get_response(request)
        if request.path.startswith("/api/"):
            patch_cache_control(response, private=True, no_store=True)
        session_cookie = response.cookies.get(settings.SESSION_COOKIE_NAME)
        if session_cookie is not None and session_cookie["max-age"] == 0:
            # Django's delete_cookie omits these flags for ordinary cookie names.
            session_cookie["secure"] = settings.SESSION_COOKIE_SECURE
            session_cookie["httponly"] = settings.SESSION_COOKIE_HTTPONLY
        return response

    def check_transport(self, request):
        try:
            peer = ip_address(request.META.get("REMOTE_ADDR", ""))
        except ValueError:
            peer = None
        trusted = peer is not None and any(peer in network for network in self.networks)
        protocol = request.META.pop("HTTP_X_FORWARDED_PROTO", None)
        for header in ("HTTP_FORWARDED", "HTTP_X_FORWARDED_HOST", "HTTP_X_FORWARDED_PORT"):
            request.META.pop(header, None)
        if protocol is not None:
            if not trusted or protocol not in {"http", "https"}:
                return HttpResponseBadRequest("Protocole proxy non fiable ou invalide.")
            request.META["HTTP_X_FORWARDED_PROTO"] = protocol
        elif trusted and not request.is_secure():
            return HttpResponseBadRequest("Le proxy doit transmettre le protocole d'origine.")
        if not request.is_secure() and request.method not in {"GET", "HEAD", "OPTIONS", "TRACE"}:
            return HttpResponseBadRequest("HTTPS est requis pour cette opération.")
        return None
