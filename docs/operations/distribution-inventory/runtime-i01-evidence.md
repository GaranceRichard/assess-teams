# I01 — Preuves d’exécution C3

[Rapport](runtime-i01-report.md) · [protocole](runtime-i01-protocol.md) · [contrôles](runtime-i01-checks.md).
Date effective : 2026-11-17. Préparation : Python 3.12.10, pip 25.0.1 ; banc Windows 10.0.26200.
Les sorties ci-dessous sont transcrites des journaux réels ; aucun PASS ne prononce une admission du runtime.

## Signature de la source et authenticité du banc refusé

Sigstore 4.5.1, identité `thomas@python.org` / issuer `https://accounts.google.com` : code 0,
`OK: .cache\c3-i01\Python-3.13.18.tar.xz`.
Authenticode de python.exe : Valid (Signature vérifiée), éditeur Python Software Foundation,
certificat `BC3C0F36FC89EE2CAB2F6A91C724C8C0DB625032`, horodatage Microsoft.
Le LICENSE source a été lu et haché ; la source ne contient aucun python.exe.

## Contrôles source/runtime : huit refus et intégrité originale

`backend/.venv/Scripts/python.exe .cache/c3-i01/refusals.py .cache/c3-i01` : code 0.
Les mutations portent sur des clones des vraies pièces, jamais sur les originaux.
Le composant ajouté est une sentinelle non exécutée ; le refus vulnérable contrôle la version,
sans prétendre exploiter une CVE.

```text
PASS REFUS source sans executable Windows: Aucun python.exe Windows
PASS REFUS archive runtime alteree: SHA-256 archive invalide
PASS integrite originale uniquement; runtime refuse
PASS REFUS DLL SSL manquante: Composant absent ou non attribue
PASS REFUS interpreteur altere: Octets alteres: python.exe
PASS REFUS notice retiree: Composant absent ou non attribue
PASS REFUS composant non attribue: Composant absent ou non attribue
QUALIFICATION ONLY; runtime final non qualifie; I01 reste ouverte
{"bits": 64, "compiler": "MSC v.1944 64 bit (AMD64)", "free_threaded": false, "implementation": "cpython", "machine": "AMD64", "platform": "win32", "python_exe_sha256": "7c2fc2b303a4ee3cc14cc17b47bc6e8bca98c78792edd123b846a560da44b203", "runtime_distribution_accepted": false, "version": [3, 13, 17], "windows": "10.0.26200"}
PASS REFUS banc 3.13.17 non corrige: Runtime vulnerable: correctifs 3.13.18 absents
PASS REFUS veritable Python de preparation incompatible: Interpreter incompatible with REF-WIN-01 cp313-win_amd64
{"runtime_distribution_accepted": false, "decision": "I01 ouverte"}
```

## Wheelhouse et installation effective sur le banc refusé

`python_wheelhouse.py verify` : code 0 ; 15 wheels exactes, hashes/tags/transitives et 26 notices.
Les dix tests de `test_python_wheelhouse.py` passent, code 0, dont altération Waitress,
absence PyYAML/notice, tag cp312 substitué, verrou/transitives divergents et réseau implicite interdit.
`qualify --python .cache/c3-i01/bench-31317/python.exe --destination .cache/c3-i01/bench-install` : code 0.

```text
Successfully installed Django-5.2.19 PyYAML-6.0.3 asgiref-3.13.0 attrs-26.1.0 djangorestframework-3.16.1 drf-spectacular-0.28.0 inflection-0.5.1 jsonschema-4.26.0 jsonschema-specifications-2025.9.1 referencing-0.37.0 rpds-py-2026.9.1 sqlparse-0.6.1 tzdata-2026.6 uritemplate-4.2.0 waitress-3.0.2
NETWORK_ATTEMPTS=0
{"Django": "5.2.19", "PyYAML": "6.0.3", "asgiref": "3.13.0", "attrs": "26.1.0", "djangorestframework": "3.16.1", "drf-spectacular": "0.28.0", "inflection": "0.5.1", "jsonschema": "4.26.0", "jsonschema-specifications": "2025.9.1", "referencing": "0.37.0", "rpds-py": "2026.9.1", "sqlparse": "0.6.1", "tzdata": "2026.6", "uritemplate": "4.2.0", "waitress": "3.0.2"}
PASS installed imports, native YAML/rpds, JSON schema and Toronto timezone
PASS offline wheel qualification; final corrected runtime still required (I01)
```

Graphe vérifié avant `--no-deps`, archives locales avec `--no-index --only-binary=:all: --require-hashes`,
cache et contrôle de mise à jour pip désactivés. Modules et quinze METADATA viennent de l’installation isolée.
PyYAML/rpds sont les extensions natives livrées ; aucun résultat ne requalifie la sécurité du banc.

## Refus ABI réel et sonde standard

Wheel originale cp313 donnée à pip sous le vrai Python 3.12.10 avec offline_pip.py : code 1.
Aucune archive native alternative téléchargée ou renommée pour ce test.

```text
ERROR: pyyaml-6.0.3-cp313-cp313-win_amd64.whl is not a supported wheel on this platform.
NETWORK_ATTEMPTS=0
```

Sonde standard du protocole extraite sans modification, exécutée sous 3.13.17 : code 0.
Imports standard et Django/Waitress, SQL paramétré, SHA-256 et zlib exercés.
SSL conserve CERT_REQUIRED et check_hostname ; aucune négociation TLS n’est prétendue.

```json
{"bits": 64, "expat": "expat_2.8.5", "free_threaded": false, "machine": "AMD64", "network_attempts": 0, "runtime_distribution_accepted": false, "soabi": "cp313-win_amd64", "sqlite": "3.50.4", "ssl": "OpenSSL 3.5.9 29 Sep 2026", "standard_venv_available": false, "trusted_ca_count": 43, "version": [3, 13, 17], "zlib": "1.3.1"}
```

Les 43 CA visibles ne prouvent ni fraîcheur ni conformité MESS. L’absence de venv confirme
la limite embarquable. L’audit borne les processus Python sondés, pas tout le réseau Windows.
Aucune installation avec runtime corrigé, recette TLS/Waitress/ORM/workers du mode final,
Windows Server ou site MESS n’est revendiquée faute de candidat admis/environnement.

## Conservation et gates

Git conserve rapports, transcriptions, hashes/provenances et protocoles extractibles ;
aucun runtime, outil Sigstore, cache, secret ou certificat privé n’est ajouté au dépôt.
Les pièces temporaires sont reproductibles depuis leurs provenances ; le seul C3 sera nettoyé.
Les quinze archives et le verrou MEP-059 sont inchangés ; aucun statut canonique modifié.
`npm run quality:targeted` : PASS, plan documentation seul, zéro échec ; lignes, secrets,
cohérence, preuves visuelles et workflow documentaire conformes. Aucun test applicatif requis.
Le pré-push et la CI du SHA publié sont confirmés séparément par la livraison finale.
