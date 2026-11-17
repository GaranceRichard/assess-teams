# I01 — Contrôles de refus reproductibles

[Rapport](runtime-i01-report.md) · [pièces et SHA-256](runtime-i01-sources.md).
Ce bloc est un protocole manuel, sans installation produit ni consommation par le build.
L’extraire tel quel dans `.cache/c3-i01/refusals.py`, puis lancer depuis la racine :
`backend/.venv/Scripts/python.exe .cache/c3-i01/refusals.py .cache/c3-i01`.
Les deux archives officielles doivent avoir été téléchargées selon les sources liées.
Le manifeste de test est dérivé du ZIP authentifié du **banc refusé**, pas d’un candidat accepté.
Un succès signifie seulement que les contrôles détectent les mutations et les incompatibilités.

```python
import hashlib
import json
import shutil
import sys
import tarfile
import tempfile
import zipfile
from pathlib import Path

cache = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(Path.cwd() / "scripts/distribution"))
from python_wheelhouse import runtime_profile


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def integrity(root, expected):
    files = [p for p in root.rglob("*") if p.is_file()]
    require(not any(p.is_symlink() for p in root.rglob("*")), "Lien refuse")
    actual = {p.relative_to(root).as_posix() for p in files}
    require(actual == set(expected), "Composant absent ou non attribue")
    require("LICENSE.txt" in actual, "Notice absente")
    for name, expected_hash in expected.items():
        require(digest((root / name).read_bytes()) == expected_hash,
                "Octets alteres: " + name)


def corrected_floor(profile):
    require(tuple(profile["version"]) >= (3, 13, 18),
            "Runtime vulnerable: correctifs 3.13.18 absents")
    # Ce plancher ne certifie ni les composants ni les avis ulterieurs.


def refusal(label, action, reason):
    try:
        action()
    except ValueError as error:
        require(reason in str(error), "Mauvais motif: " + str(error))
        print("PASS REFUS " + label + ": " + str(error))
    else:
        raise ValueError("Refus non observe: " + label)


source = cache / "Python-3.13.18.tar.xz"
require(digest(source.read_bytes()) ==
        "abb0102e6d4ae027509bcb82327d9dd85515b44a3ba8ad538cfc5e9847029f68",
        "Source alteree")
with tarfile.open(source) as archive:
    refusal("source sans executable Windows",
            lambda: require(any(n.lower().endswith("/python.exe")
                                for n in archive.getnames()),
                            "Aucun python.exe Windows"), "Aucun python.exe")

bench_zip = cache / "python-3.13.17-embed-amd64.zip"
require(digest(bench_zip.read_bytes()) ==
        "9e35319bffedab8b36ad44d8f377cb4f1733bcec257a0b6d04d94f01486ddb38",
        "Archive banc alteree")
with tempfile.TemporaryDirectory(prefix="c3-refus-", dir=cache) as temporary:
    altered = Path(temporary) / "altered.zip"
    altered.write_bytes(bench_zip.read_bytes() + b"altered")
    refusal("archive runtime alteree",
            lambda: require(digest(altered.read_bytes()) ==
                            digest(bench_zip.read_bytes()), "SHA-256 archive invalide"),
            "SHA-256 archive invalide")
    original = Path(temporary) / "original"
    with zipfile.ZipFile(bench_zip) as archive:
        require(all(Path(n).name == n for n in archive.namelist()),
                "Chemin archive inattendu")
        expected = {n: digest(archive.read(n)) for n in archive.namelist()}
        archive.extractall(original)
    integrity(original, expected)
    print("PASS integrite originale uniquement; runtime refuse")
    for label, filename, operation, reason in [
        ("DLL SSL manquante", "_ssl.pyd", "remove", "absent"),
        ("interpreteur altere", "python.exe", "alter", "alteres"),
        ("notice retiree", "LICENSE.txt", "remove", "absent"),
        ("composant non attribue", "unattributed.dll", "add", "non attribue"),
    ]:
        clone = Path(temporary) / operation / filename
        root = clone.parent
        shutil.copytree(original, root)
        if operation == "remove":
            clone.unlink()
        elif operation == "alter":
            data = bytearray(clone.read_bytes())
            data[-1] ^= 1
            clone.write_bytes(data)
        else:
            clone.write_bytes(b"unattributed native component")
        refusal(label, lambda: integrity(root, expected), reason)
        shutil.rmtree(root)

    # On n'execute jamais les clones incomplets ou alteres.
    profile = runtime_profile(original / "python.exe")
    refusal("banc 3.13.17 non corrige", lambda: corrected_floor(profile),
            "Runtime vulnerable")

refusal("veritable Python de preparation incompatible",
        lambda: runtime_profile(Path(sys.executable)), "Interpreter incompatible")
print(json.dumps({"runtime_distribution_accepted": False,
                  "decision": "I01 ouverte"}))
```

Ce contrôle d’intégrité ne remplace pas la provenance/signature, les droits, la revue sécurité,
la vérification des jonctions Windows ou la fermeture PE du futur candidat.
Un manifeste calculé depuis un dossier non authentifié n’est pas une racine de confiance.
Le test d’interpréteur incompatible requiert le Python 3.12 de préparation, distinct du banc 3.13.
Le retrait de notice est détecté par la liste exacte avant sa lecture ; aucune notice vide n’est acceptée.
Les refus wheels et réseau complémentaires restent ceux du [protocole MEP-059](../python-wheelhouse/protocol.md).
