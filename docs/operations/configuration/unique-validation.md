# MEP-054 — Vérification et revue de livraison

[Contrat](unique-contract.md) · [exemples](unique-examples.md) · [PBI](../../backlog/source/mess/f10.md).
La vérification porte sur le contrat documentaire ; aucun chargement API/workers/scripts ajouté.
Le statut canonique reste Ouvert ; clôture fonctionnelle proposée seulement après approbation explicite.

## Reproduction du contrôle du contrat

Depuis la racine, extraire ce bloc Python dans un temporaire et l'exécuter avec
`backend/.venv/Scripts/python.exe`. Django/jsonschema/ZoneInfo sont déjà disponibles dans
l'environnement backend ; aucun ajout de dépendance ni réseau n'est nécessaire.
Le test ne lit aucun secret et n'effectue aucun accès SMTP, base ou service.

```python
import copy
import json
import re
import sys
from pathlib import Path, PureWindowsPath
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

sys.path.insert(0, str(Path("backend").resolve()))
from jsonschema import Draft202012Validator
from django.core.exceptions import ImproperlyConfigured
from config.http_security import production_http_settings
from config.startup_security import validate_proxy_consistency
from config.email_security import validate_email_settings
from config.journal_retention import journal_retention_settings

folder = Path("docs/operations/configuration")

def block(name):
    text = (folder / name).read_text(encoding="utf-8-sig")
    return json.loads(re.search(r"```json\n(.*?)\n```", text, re.S)[1])

schema = block("unique-contract.md")
valid = block("unique-examples.md")
Draft202012Validator.check_schema(schema)
validator = Draft202012Validator(schema)
validator.validate(valid)
structural = [
    ("version", None), ("version", 2), ("secrets.django_key_file", None),
    ("smtp.port", "587"), ("smtp.port", 0), ("services.delivery_seconds", 0),
    ("services.due_time", "24:00"), ("backups.retention_days", 0),
    ("journals.activity", 30), ("journals.technical", 0),
    ("secrets.django_key", "valeur-interdite"), ("organisation", {}),
]
for dotted, value in structural:
    candidate = copy.deepcopy(valid)
    keys = dotted.split(".")
    target = candidate
    for key in keys[:-1]:
        target = target[key]
    if value is None:
        del target[keys[-1]]
    else:
        target[keys[-1]] = value
    assert list(validator.iter_errors(candidate)), dotted

def semantic(candidate):
    http, smtp = candidate["http"], candidate["smtp"]
    env = {"APP_BASE_URL": http["origin"]}
    for field, name in (
        ("hosts", "DJANGO_ALLOWED_HOSTS"),
        ("csrf_origins", "DJANGO_CSRF_TRUSTED_ORIGINS"),
        ("proxies", "DJANGO_TRUSTED_PROXIES"),
    ):
        if field in http:
            env[name] = ",".join(http[field])
    production_http_settings(env)
    validate_proxy_consistency(http.get("proxies", []), http.get("login_proxies", []))
    validate_email_settings({
        "EMAIL_HOST": smtp["host"], "EMAIL_PORT": smtp["port"],
        "EMAIL_USE_TLS": smtp["starttls"], "EMAIL_USE_SSL": smtp["ssl"],
        "EMAIL_HOST_USER": smtp.get("user", ""), "EMAIL_HOST_PASSWORD": "",
        "DEFAULT_FROM_EMAIL": smtp["sender"],
    })
    journal_retention_settings({
        "JOURNAL_ACTIVITY_RETENTION_DAYS": str(candidate["journals"]["activity"]),
        "JOURNAL_TECHNICAL_RETENTION_DAYS": str(candidate["journals"]["technical"]),
    })
    ZoneInfo(candidate["services"]["timezone"])

semantic(valid)
mutations = [
    ("http", "origin", "http://assess-teams.test"),
    ("http", "hosts", ["*"]), ("http", "proxies", ["0.0.0.0/0"]),
    ("http", "login_proxies", []), ("smtp", "ssl", True),
    ("smtp", "user", "fictif"), ("services", "timezone", "Invalid/Zone"),
]
for section, key, value in mutations:
    candidate = copy.deepcopy(valid)
    candidate[section][key] = value
    try:
        semantic(candidate)
    except (ImproperlyConfigured, ZoneInfoNotFoundError):
        pass
    else:
        raise AssertionError((section, key))

source = PureWindowsPath("C:/ProgramData/AssessTeams/config/instance.json")
import ntpath
for cwd in ("C:/ailleurs", "D:/workers"):
    resolved = ntpath.normpath(str(source.parent / valid["sqlite"]["file"]))
    assert resolved == r"C:\ProgramData\AssessTeams\data\assess.sqlite3"
assert not PureWindowsPath("C:relative.sqlite3").is_absolute()
assert PureWindowsPath("C:relative.sqlite3").drive
print("PASS: schema, exemple valide, 12 refus structurels, 7 refus semantiques, chemins")
```

## Matrice d'acceptation et vrais refus

| Critère canonique | Preuve |
| --- | --- |
| Schéma versionné, types et obligations | Bloc JSON Schema v1, required/additionalProperties, contrôle ci-dessus |
| Valeurs techniques de référence | Exemple REF-WIN-01 ; invariants SQLite et sécurité dans la correspondance |
| Précédence, résolution des chemins | Ordre exclusif explicite et base unique ; calcul Windows indépendant du cwd ci-dessus |
| Exemples valide/invalide | Un JSON complet et mutations indépendantes ; 12 refus structurels et 7 sémantiques |
| Références de secrets privées | Champs *_file uniquement ; aucune valeur ni lecture privée ; MEP-009 réutilisé |
| API/workers/scripts | Table de correspondance, même sélecteur/source ; adaptation effective réservée à MEP-021 |
| SQLite, origine/TLS, SMTP, services, sauvegardes, journaux | Sections dédiées typées et sémantique croisée ; null backups sans politique inventée |
| Aucune configuration métier ajoutée | Objet fermé, refus organisation et activity numérique ; FEAT-031/Organisation préservés |
| Deux sources sans précédence | Contrat interdit la concurrence des variables historiques ; aucun choix implicite |
| Requis sans règle de validation | Chaque required a type/borne ou règle sémantique et consommateur ; revue du schéma |
| Chemin relatif ambigu | Base absolue du fichier ; C:relative explicitement refusé ; exemple de résolution calculé |
| Secret réel dans un exemple | Références fictives seules, champs en clair refusés ; scanner canonique et revue |
| Valeur de site inconnue | Racines, origine, relais, identité et références paramétrables ; aucune donnée de site exigée |

Les refus de double source et de chemins ambigus sont des exigences du contrat vérifiées par
revue et calcul, pas des tests d'un chargeur existant. MEP-021 doit les rendre effectifs avant
effet et ajouter ses tests d'intégration communs ; MEP-054 ne prétend pas les exécuter en production.

## Revue documentaire et DoD

Préparation écrite dans le document propriétaire avant création des exemples et preuves.
Document adapté au contrat d'exploitation ; aucun fichier technique ni consommateur applicatif
modifié. Revue du README, règles agents, charte qualité, DoD, stratégie de tests, architecture,
API/OpenAPI et profil d'installation : pas de capacité publique, d'installation exposée,
d'endpoint, de modèle ou de règle qualité changé ; ces sources restent valides.
L'inventaire historique MEP-036 est préservé ; un lien vers le contrat courant est ajouté à son index.
Le backlog canonique et ses statuts ne sont pas modifiés.

Tests applicatifs, coverage, migrations, build/typecheck et E2E non applicables à ce lot documentaire :
aucune entrée applicative modifiée. Le plan qualité du dépôt demeure l'autorité et le pré-push reste
bloquant. Lignes, secrets, conflits et revue documentaire sont requis. La CI indépendante du SHA
publié doit être verte avant livraison ; ses identifiants sont fournis dans le rapport de publication.

Aucun écart de périmètre ; aucune qualification d'un site MESS ou approbation humaine revendiquée.
MEP-021 dispose du schéma extractible, des références privées, du sélecteur, de la précédence,
des règles de résolution, des valeurs REF-WIN-01, des correspondances et des exemples/refus.
Services, installation, sauvegarde et recette restent à leurs PBI consommateurs.

## Résultats locaux du 2026-11-15

Contrôle Python ci-dessus : PASS, schéma valide, exemple accepté, 12 refus structurels,
7 refus sémantiques et calcul des chemins conformes. Exécuté avec CPython 3.12,
Django 5.2.19 et jsonschema 4.26.0 ; ce contrôle documentaire ne qualifie pas REF-WIN-01.
`npm.cmd run quality:targeted` : scope documentation, zéro échec ; lignes, scanner de secrets,
cohérence, intégrité et workflow documentaire conformes. Relecture des quatre fichiers :
uniquement des références fictives, aucun secret réel, aucune modification de statut canonique.
