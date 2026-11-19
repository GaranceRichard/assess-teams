"""Shared local-only package inventory and confidentiality checks."""

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROFILE = "REF-WIN-01"
BLOCKERS = ["I01: corrected standard Windows x64 cp313 runtime not qualified"]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path, value):
    Path(path).write_text(
        json.dumps(value, indent=2, ensure_ascii=True) + "\n", encoding="utf-8"
    )


def safe_path(name):
    require(isinstance(name, str), "Non-string path")
    require(not re.search(r"[\\:\x00-\x1f]", name), "Unsafe package path")
    require(
        all(p not in ("", ".", "..") for p in name.split("/")),
        "Unsafe package traversal",
    )
    return name


def files(directory):
    root = Path(directory)
    require(root.is_dir() and not root.is_symlink(), "Invalid package directory")
    result = []
    for path in sorted(root.rglob("*")):
        require(not path.is_symlink(), "Package symlink refused")
        if path.is_file():
            require(path.stat().st_nlink == 1, "Package hardlink refused")
            result.append(path)
    return result


def inventory(directory):
    return [
        {
            "path": p.relative_to(directory).as_posix(),
            "size": p.stat().st_size,
            "sha256": digest(p.read_bytes()),
        }
        for p in files(directory)
        if p.relative_to(directory).as_posix() != "manifest.json"
    ]


def scan(path, relative):
    """Conservative detectable secrets; source allowlisting remains mandatory."""
    safe_path(relative)
    forbidden = (
        r"(^|/)(\.env[^/]*|node_modules|__pycache__|\.git|private|secrets|"
        r"data|uploads|backups|logs|runtime|pip|development_data|tests)(/|$)|"
        r"\.(sqlite3?|db|pem|key|pfx|p12|pyc)$|"
        r"(^|/)(Dockerfile|package(-lock)?\.json)$"
    )
    require(
        not re.search(forbidden, relative, re.IGNORECASE), "Private/build file refused"
    )
    require(
        not re.search(r"\.(exe|dll|msi|msix)$", relative, re.IGNORECASE)
        or relative == "hosting/caddy/caddy.exe",
        "Unqualified executable refused",
    )
    data = Path(path).read_bytes()
    if b"\0" in data[:8192]:
        return
    text = data.decode("utf-8", errors="replace")
    patterns = [
        r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        r"AKIA[0-9A-Z]{16}",
        r"gh[pousr]_[A-Za-z0-9_]{30,}",
        r"xox[aboprs]-[A-Za-z0-9-]{10,}",
        r"""(?i)(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*["'][^"']{8,}["']""",
    ]
    require(not any(re.search(p, text) for p in patterns), "Potential secret refused")
