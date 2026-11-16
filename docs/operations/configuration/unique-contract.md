# MEP-054 — Contrat de configuration unique, version 1

[Source canonique](../../backlog/source/mess/f10.md) · [exemples](unique-examples.md) ·
[preuves reproductibles et revue DoD](unique-validation.md).
Contrat d'installation acquis ; chargement effectif livré par [MEP-021](unique-loading.md).

## Préparation du changement — MEP-054

- Périmètre : décrire le schéma, les références privées, la précédence et les consommateurs sans modifier leur exécution.
- Objectif : fournir une source contractuelle unique à MEP-021 en réutilisant les acquis MEP-036/009/039/042.
- Effets attendus : permettre la préparation de configurations fictives typées et leur contrôle reproductible hors service.
- Risques : éviter une double source, un chemin dépendant du processus, une fuite de secret ou une règle métier implicite.
- Vérification : confronter schéma et exemples aux validateurs existants, tester les vrais refus et revoir les correspondances.
- Fichiers : uniquement ce document, les exemples et les preuves liés ci-dessus ; aucun fichier technique modifié.

## Source, précédence et version

Le format retenu est un objet JSON UTF-8, sans clés dupliquées, nommé librement par l'exploitant.
Le schéma ci-dessous et les règles sémantiques de ce document forment ensemble le contrat v1.
Les blocs JSON sont extractibles ; aucun téléchargement de schéma n'est nécessaire.
Une version inconnue ou une clé inconnue est refusée, sans conversion ni repli silencieux.

Pour MEP-021, API, workers et scripts recevront le même chemin absolu via
`ASSESS_CONFIG_FILE` (sélecteur, pas source de valeurs). Aucun emplacement implicite,
fichier .env automatique, recherche depuis le répertoire courant ou fusion de fichiers.
Priorité décroissante : constantes de sécurité applicatives conservées → valeurs explicites du fichier →
défauts documentés pour les seuls champs facultatifs. Une valeur explicite vide/invalide ne
déclenche jamais un défaut. Les variables historiques correspondant à un champ du fichier ne
le surchargent pas : leur présence concurrente doit être refusée, même si leurs valeurs concordent.
Les valeurs secrètes sont exclusivement résolues depuis les références privées du fichier ;
elles ne constituent pas une seconde source de paramètres. Leur injection interne dans les
validateurs existants devra rester privée. Les paramètres de commande d'une opération
(simulation, bornage, décision de purge) restent des arguments de cette opération.

À la livraison documentaire MEP-054, les variables historiques restaient consommées comme avant.
MEP-021 applique maintenant ce contrat en production, avec injection privée dans les contrôles
MEP-009. Les modes développement/test et leurs scripts ne migrent pas implicitement.

## Schéma structurel versionné

Tous les champs listés dans `required` sont obligatoires ; aucun `default` n'est injecté par
JSON Schema. Les règles croisées et le système de fichiers sont décrits après le schéma.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Assess teams installation configuration v1",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "paths", "sqlite", "http", "smtp", "secrets", "services", "backups", "journals"],
  "properties": {
    "version": {"const": 1},
    "paths": {
      "type": "object",
      "additionalProperties": false,
      "required": ["releases", "runtime", "data", "logs", "tmp", "backups", "frontend", "static"],
      "properties": {
        "releases": {"$ref": "#/$defs/path"},
        "runtime": {"$ref": "#/$defs/path"},
        "data": {"$ref": "#/$defs/path"},
        "logs": {"$ref": "#/$defs/path"},
        "tmp": {"$ref": "#/$defs/path"},
        "backups": {"$ref": "#/$defs/path"},
        "frontend": {"$ref": "#/$defs/path"},
        "static": {"$ref": "#/$defs/path"}
      }
    },
    "sqlite": {
      "type": "object",
      "additionalProperties": false,
      "required": ["file"],
      "properties": {"file": {"$ref": "#/$defs/path"}}
    },
    "http": {
      "type": "object",
      "additionalProperties": false,
      "required": ["origin", "certificate_file", "private_key_file"],
      "properties": {
        "origin": {"type": "string", "minLength": 1},
        "account_limit": {"type": "integer", "minimum": 1},
        "origin_limit": {"type": "integer", "minimum": 1},
        "limit_seconds": {"type": "integer", "minimum": 1},
        "hosts": {"$ref": "#/$defs/list"},
        "csrf_origins": {"$ref": "#/$defs/list"},
        "proxies": {"$ref": "#/$defs/list"},
        "login_proxies": {"$ref": "#/$defs/list"},
        "certificate_file": {"$ref": "#/$defs/path"},
        "private_key_file": {"$ref": "#/$defs/path"}
      }
    },
    "smtp": {
      "type": "object",
      "additionalProperties": false,
      "required": ["host", "port", "starttls", "ssl", "sender"],
      "properties": {
        "host": {"type": "string", "minLength": 1},
        "port": {"type": "integer", "minimum": 1, "maximum": 65535},
        "starttls": {"type": "boolean"},
        "ssl": {"type": "boolean"},
        "sender": {"type": "string", "minLength": 1},
        "user": {"type": "string"}
      }
    },
    "secrets": {
      "type": "object",
      "additionalProperties": false,
      "required": ["django_key_file"],
      "properties": {
        "django_key_file": {"$ref": "#/$defs/path"},
        "smtp_credential_file": {"$ref": "#/$defs/path"}
      }
    },
    "services": {
      "type": "object",
      "additionalProperties": false,
      "required": ["account", "api_host", "api_port", "delivery_seconds", "due_time", "timezone"],
      "properties": {
        "account": {"type": "string", "pattern": "\\S"},
        "api_host": {"enum": ["127.0.0.1", "::1"]},
        "api_port": {"type": "integer", "minimum": 1, "maximum": 65535},
        "delivery_seconds": {"type": "integer", "minimum": 1},
        "due_time": {"type": "string", "pattern": "^([01][0-9]|2[0-3]):[0-5][0-9]$"},
        "timezone": {"type": "string", "minLength": 1}
      }
    },
    "backups": {
      "type": "object",
      "additionalProperties": false,
      "required": ["interval_hours", "retention_days"],
      "properties": {
        "interval_hours": {"$ref": "#/$defs/optionalDuration"},
        "retention_days": {"$ref": "#/$defs/optionalDuration"}
      }
    },
    "journals": {
      "type": "object",
      "additionalProperties": false,
      "required": ["activity", "technical"],
      "properties": {
        "activity": {"const": "keep"},
        "technical": {"oneOf": [{"const": "keep"}, {"type": "integer", "minimum": 1, "maximum": 999999999}]}
      }
    }
  },
  "$defs": {
    "path": {"type": "string", "minLength": 1, "pattern": "\\S"},
    "list": {"type": "array", "items": {"type": "string", "minLength": 1}, "uniqueItems": true},
    "optionalDuration": {"type": ["integer", "null"], "minimum": 1}
  }
}
```

## Résolution des chemins et références privées

La base de tout chemin relatif est le parent absolu du fichier sélectionné, y compris SQLite,
certificat et secrets ; jamais le cwd, backend, data ou runtime. Normaliser les séparateurs Windows,
puis résoudre les segments . et .. avant comparaison. Refuser chemins vides/blancs, NUL,
variables `%VAR%`/`$VAR`, `~`, URI, lecteurs relatifs `C:foo` et racines sans lecteur `\foo`.
Les chemins absolus Windows avec lecteur restent absolus. Les chemins UNC et volumes réseau ou
synchronisés sont exclus pour SQLite (acquis MEP-039) ; les ACL et la nature réelle du disque
se vérifient sur cible. Les liens ne doivent pas déplacer la base vers un volume interdit.

SQLite doit désigner un fichier sous `paths.data` résolu, hors code/runtime ; backups, logs, tmp,
secrets et certificats ne sont pas des données de release à remplacer. Les répertoires persistants
et privés doivent rester hors releases/runtime/frontend/static. Refuser les collisions fichier/
répertoire et entre destinations. Ne créer ni déplacer quoi que ce soit pendant la validation.
Existence, ACL et accès effectifs sont vérifiés par les consommateurs/installateurs concernés.

Les fichiers de secrets référencés sont privés, hors sources et package ; une clé/un credential
est une chaîne UTF-8 sans espaces ni saut de ligne, conforme à `require_secret` (50/16 caractères
minimum et autres gardes MEP-009). Le fichier TLS privé reste au format du frontal, jamais incorporé
dans le JSON. La chaîne de confiance TLS/SMTP relève du magasin système local, sans désactivation
de vérification. Rotation et ACL : [MEP-009](startup-security.md). Le frontal lit sa clé TLS,
pas les secrets Django/SMTP ni SQLite ; API/workers lisent leurs seuls secrets nécessaires.
Aucune valeur privée ni contenu de fichier ne doit apparaître dans exemples, erreurs ou preuves.

## Sémantique et correspondance des consommateurs

| Champs du schéma | Type/règle complémentaire, défaut si facultatif | Consommateurs et acquis |
| --- | --- | --- |
| paths.* | Chemins selon la résolution ci-dessus ; valeurs REF-WIN-01 dans l'exemple | Installateur/scripts ; frontal frontend/static ; API STATIC_ROOT=static ; tmp partagé explicitement |
| sqlite.file | Même fichier local pour tous ; moteur SQLite, timeout 5 s, DELETE/FULL, DEFERRED, CONN_MAX_AGE=0, FK ON fixes | API et toutes commandes : DATABASES.default.NAME ; [MEP-039](../sqlite/README.md) |
| http.origin | Origine HTTPS exacte, port valide, sans credentials/query/fragment/chemin applicatif | APP_BASE_URL → FRONTEND_URL/liens/serveur OpenAPI ; frontal écoute l'hôte/port de l'origine |
| http.hosts / csrf_origins | Défauts hôte/origine publique ; listes exactes incluant l'origine publique, sans joker ; production_http_settings fait autorité | DJANGO_ALLOWED_HOSTS / DJANGO_CSRF_TRUSTED_ORIGINS ; API/workers/scripts Django |
| http.proxies / login_proxies | Défaut []/[] ; IP/CIDR stricts sans /0, pairs HTTP couverts par LOGIN, LOGIN vide si HTTP vide | DJANGO_TRUSTED_PROXIES / LOGIN_TRUSTED_PROXIES ; validate_proxy_consistency réutilisé |
| http.certificate_file / private_key_file | Chemins privés/publics locaux provisionnés ; nom/chaîne/expiration vérifiés sur cible | Frontal TLS, pas de demande ACME Internet ; [profil](../installation-prerequisites.md) |
| smtp.* | validate_email_settings fait autorité : modes exclusifs, TLS distant/auth, expéditeur valide hors .local ; user défaut "" | EMAIL_HOST/PORT/USE_TLS/USE_SSL/DEFAULT_FROM_EMAIL/HOST_USER ; API et deux workers |
| secrets.django_key_file | Référence requise, aucun défaut ni valeur embarquée | DJANGO_SECRET_KEY → SECRET_KEY ; API, workers et commandes Django |
| secrets.smtp_credential_file | Absente si user vide ; obligatoire si user renseigné ; aucun credential en clair accepté | EMAIL_HOST_PASSWORD, même injection privée pour API/workers ; require_secret minimum 16 |
| services.* | Compte non admin ; loopback ; fréquence positive ; timezone IANA valide (ZoneInfo), heure locale HH:mm | WSGI ; send_pending_notifications et send_password_reset_emails chaque minute sans chevauchement ; send_due_evaluation_notifications quotidien ; MEP-063 supervise |
| backups.* | Entiers positifs ou null explicite : non décidé, aucune planification/destruction autorisée ; cible paths.backups | MEP-064/027/022 ; sauvegarde cohérente, copie séparée protégée ; aucune promesse RPO/RTO |
| journals.* | activity=keep ; technical=keep ou jours positifs bornés ; aucun droit de purge conféré | JOURNAL_ACTIVITY_RETENTION_DAYS / JOURNAL_TECHNICAL_RETENTION_DAYS → JOURNAL_RETENTION ; MEP-042/020 ; logs externes dans paths.logs |

http.account_limit/origin_limit/limit_seconds correspondent aux variables existantes
LOGIN_ACCOUNT_LIMIT/LOGIN_ORIGIN_LIMIT/LOGIN_LIMIT_SECONDS (défauts 5/30/900), entiers positifs.
DEBUG=False, production, SMTP Django, EMAIL_TIMEOUT=10, files durables et protections HTTP restent
fixes. Aucun paramètre d'évaluation, d'organisation, de rôle ou FEAT-031 n'entre dans ce schéma.
Les journaux externes n'héritent pas des durées LogEntry ; leur conservation reste à définir
par l'exploitation. Ce contrat n'autorise ni purge métier ni changement d'arbitrage Organisation.
