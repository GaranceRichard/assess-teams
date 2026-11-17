# I01 — Protocole de qualification du prochain candidat

[Décision C3](runtime-i01-report.md) · [sources](runtime-i01-sources.md) ·
[refus extractibles](runtime-i01-checks.md) · [avis sécurité](runtime-i01-security.md).
Ce protocole ne vaut pas acceptation ; chaque étape produit une preuve ou un refus bloquant.

## 1. Admission avant exécution

1. Refaire la recherche officielle à la date réelle : dernière 3.13, release/changelog,
   index Windows, NuGet et toute la chaîne `next` du gestionnaire. Archiver URL, UTC, statut,
   taille et SHA-256 ; une erreur HTTP/TLS n’est jamais une preuve d’absence.
2. Exiger CPython standard Windows x64, GIL normal, série 3.13/ABI cp313 ; pas de simple
   archive source, cp313t, ARM64 ou interpréteur système découvert implicitement.
3. Qualifier les correctifs Python **et** les composants réellement incorporés avec les avis actuels.
   La seule comparaison `>=3.13.18` est insuffisante ; tout avis sans décision motivée bloque.
4. Télécharger uniquement les pièces référencées par les provenances officielles vérifiées.
   Comparer SHA-256 à la publication, vérifier Sigstore avec identité/issuer officiels et
   Authenticode des PE disponibles ; consigner certificat, horodatage et statut de chaîne.
   Signature absente/invalide ou pièce inattendue : arrêter, sans désactiver une protection.
5. Rapprocher le SBOM de chaque fichier effectif, y compris DLL chargées dynamiquement,
   stdlib, extensions et VC Runtime. Figer un manifeste chemin/taille/SHA-256 authentifié.
   Aucun composant inexpliqué ; distinguer Windows/UCRT hôte, outil de préparation et cible.
6. Conserver tous les textes originaux et obligations : PSF et licences historiques,
   tiers et clause Microsoft. Identifier séparément CA de confiance locale et données tzdata.
   Ne pas copier les droits du banc sur des octets nouveaux ; absence de notice = refus.

Une construction propre exige en plus sources/patchs/compilateur/SDK/outils de build exacts et hachés,
provenance et droits de chaque entrée, recette automatisée, journal et comparaison de deux builds isolés.
Inclure les téléchargements effectués par `get_externals.bat` et toute sortie précompilée.
Publier les écarts de reproductibilité et l’identité du fabricant ; ce serait une construction projet,
jamais un binaire officiel inchangé. Aucune telle chaîne n’est qualifiée par C3.

## 2. Installation isolée et fermeture

Utiliser une VM Windows jetable sans Python hérité, avec snapshot et répertoire privé neuf.
Préparer l’intégralité des composants d’installation hors ligne avant de déconnecter la sortie Internet.
Un MSI/EXE web bootstrap ou le Store ne prouve pas un installateur autonome ; relever les options
et journaux. Ne pas modifier PATH, protections, certificats système ou runtime du poste de contribution.
Exiger un compte d’exploitation non admin et un lancement par chemin explicite.

Relever `sys.version`, `sys.executable`, machine AMD64, pointeurs 64 bits, `SOABI`,
`Py_GIL_DISABLED`, préfixes et sys.path. Vérifier le mode standard et sa bibliothèque (`venv` compris),
les exécutables, `python313.dll`, natives SSL/SQLite/Expat, DLL VC et UCRT de l’hôte.
Reprendre la lecture PE de [MEP-057](native-evidence.md) pour les **nouveaux octets** et observer les DLL
réellement chargées. Tester le démarrage depuis un autre dossier et sans utilisateur interactif.
L’absence de banc Server reste I03 ; un succès desktop ne la lève pas.

## 3. Wheelhouse acquis, jamais résolu à nouveau

```powershell
backend/.venv/Scripts/python.exe scripts/distribution/python_wheelhouse.py verify
backend/.venv/Scripts/python.exe -m unittest discover -s scripts/distribution -p test_python_wheelhouse.py -v
backend/.venv/Scripts/python.exe scripts/distribution/python_wheelhouse.py qualify `
  --python <runtime-admis>/python.exe --destination <installation-neuve>
```

Les quinze pins/hashes restent ceux de `distribution/python/ref-win-01/requirements.txt`.
La commande contrôle graphe, marqueurs Windows/3.13, tags et 26 notices, puis pip local
sans index/cache/dépendances/compilation ; audit réseau bloquant et compteur zéro requis.
Elle injecte le pip du poste de préparation uniquement pendant l’installation de qualification.
Le probe final isole les imports, contrôle quinze METADATA et exerce PyYAML/rpds natifs,
JSON Schema et tzdata Toronto. Son message `runtime_distribution_accepted: false` reste exact :
MEP-059 ne déclare jamais l’admission sécurité du runtime, même quand ses wheels passent.
Une incompatibilité nouvelle bloque et remonte aux PBI consommateurs ; ne changer aucun pin ici.

## 4. Sonde standard complémentaire extractible

Extraire ce bloc dans un fichier temporaire, lancer `<runtime>/python.exe -I <sonde.py> <installation>`.
C’est un diagnostic fonctionnel ; sa sortie ne prononce aucune conformité de distribution.

```python
import importlib
import importlib.util
import json
import pathlib
import platform
import struct
import sys
import sysconfig

attempts = []
events = {"socket.connect", "socket.getaddrinfo", "socket.sendto",
          "socket.sendmsg", "urllib.Request", "socket.gethostbyname",
          "socket.gethostbyaddr", "socket.getnameinfo"}


def deny(event, arguments):
    if event in events:
        attempts.append(event)
        raise RuntimeError("Internet interdit: " + event)


sys.addaudithook(deny)
sys.path.insert(0, str(pathlib.Path(sys.argv[1]).resolve()))
for name in ["ssl", "_ssl", "_hashlib", "sqlite3", "_sqlite3", "pyexpat",
             "zlib", "bz2", "lzma", "ctypes", "decimal", "socket", "select",
             "asyncio", "multiprocessing", "subprocess", "email", "mimetypes",
             "tarfile", "tempfile", "http.cookiejar", "zoneinfo", "wsgiref",
             "django", "waitress"]:
    importlib.import_module(name)
import hashlib
import sqlite3
import ssl
import pyexpat
import zlib

context = ssl.create_default_context()
assert context.verify_mode == ssl.CERT_REQUIRED and context.check_hostname
with sqlite3.connect(":memory:") as database:
    database.execute("create table probe(value text)")
    database.execute("insert into probe values (?)", ("offline",))
    assert database.execute("select value from probe").fetchone() == ("offline",)
assert hashlib.sha256(b"abc").hexdigest() == (
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
)
assert zlib.decompress(zlib.compress(b"offline")) == b"offline"
assert not attempts
print(json.dumps(dict(
    version=list(sys.version_info[:3]), machine=platform.machine(),
    bits=struct.calcsize("P") * 8, soabi=sysconfig.get_config_var("SOABI"),
    free_threaded=bool(sysconfig.get_config_var("Py_GIL_DISABLED")),
    standard_venv_available=importlib.util.find_spec("venv") is not None,
    ssl=ssl.OPENSSL_VERSION, sqlite=sqlite3.sqlite_version,
    expat=pyexpat.EXPAT_VERSION, zlib=zlib.ZLIB_RUNTIME_VERSION,
    trusted_ca_count=len(context.get_ca_certs()), network_attempts=len(attempts),
    runtime_distribution_accepted=False), sort_keys=True))
```

La présence de CA n’établit pas leur fraîcheur. Après ce smoke, effectuer une vraie négociation TLS
locale avec chaîne privée de test fournie au banc : chaîne/nom/expiration valides acceptés,
inconnus/incorrects/expirés refusés, sans `CERT_NONE` ni désactivation de hostname.
Tester aussi le refus des CA compromises selon les fixtures officielles du correctif retenu.
Exercer Django ORM/SQLite sur base fictive et démarrer Waitress en loopback avec requête locale,
puis commandes workers existantes ; conserver compte, environnement et chemins utilisés.
Aucune donnée, clé ou configuration MESS privée ne va dans les preuves versionnées.

## 5. Refus et verdict

Sur clones exclusivement, rejouer les contrôles extractibles : archive altérée, DLL manquante,
interpréteur modifié, notice retirée, composant inconnu, source sans exécutable, version vulnérable,
interpréteur réellement incompatible ; utiliser le manifeste authentifié du candidat pour ses mutations.
Rejouer les dix tests MEP-059 et le rejet réel par pip d’une wheel cp313 sous Python 3.12.
Relever les codes d’échec, motifs et l’absence d’installation/connexion, pas seulement des assertions prévues.

Conserver une capture réseau/pare-feu de la VM sans Internet pendant installation, imports,
lancement API/workers et TLS local. L’audit Python seul ne couvre pas une DLL ou un sous-processus natif.
Refaire le lancement après redémarrage hors ligne et contrôler l’intégrité après essais.
Le verdict A exige toutes les preuves pour les octets et le mode retenus ; sinon verdict B, I01 ouverte,
étape manquante nommée et aucun package accepté. I02/I03 et les statuts canoniques restent distincts.
