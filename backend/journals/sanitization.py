import re

SENSITIVE_ASSIGNMENT = re.compile(
    r"(?i)\b(?:password|passphrase|token|cookie|session|secret|credential|api[ _-]?key)"
    r"\b\s*[:=]\s*(?:\"[^\"]*\"|'[^']*'|[^;,\s]+)"
)
ENVIRONMENT_ASSIGNMENT = re.compile(r"\b[A-Z][A-Z0-9_]{2,}\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^;,\s]+)")
TECHNICAL_DETAIL = re.compile(r"(?i)(traceback\s*\(|(?:^|\s)file\s+\"[^\"]+\",\s+line\s+\d+)")


def sanitize_log_text(value: str, max_length: int, fallback: str = "") -> str:
    normalized = " ".join(str(value).split())
    if TECHNICAL_DETAIL.search(normalized):
        return fallback[:max_length]
    redacted = SENSITIVE_ASSIGNMENT.sub("[DONNÉE SENSIBLE MASQUÉE]", normalized)
    redacted = ENVIRONMENT_ASSIGNMENT.sub("[VARIABLE D’ENVIRONNEMENT MASQUÉE]", redacted)
    return redacted[:max_length]
