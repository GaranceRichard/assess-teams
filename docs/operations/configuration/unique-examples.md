# MEP-054 — Exemples fictifs du contrat v1

[Contrat normatif](unique-contract.md) · [vérification](unique-validation.md).
Ces documents ne sont pas une configuration de production ni des fichiers privés utilisables.

## Exemple structurel valide REF-WIN-01

Aucun secret ni certificat n'est fourni : seules leurs références fictives figurent ici.
Le fichier sélectionné est supposé être `C:\ProgramData\AssessTeams\config\instance.json`.
Les racines du profil sont remplaçables ; aucune valeur réelle de site n'est nécessaire.
Les champs facultatifs omis suivent exclusivement les défauts du contrat.

```json
{
  "version": 1,
  "paths": {
    "releases": "C:\\AssessTeams\\releases",
    "runtime": "C:\\AssessTeams\\runtime",
    "data": "../data",
    "logs": "../logs",
    "tmp": "../tmp",
    "backups": "../backups",
    "frontend": "C:\\AssessTeams\\releases\\reference\\frontend",
    "static": "C:\\AssessTeams\\releases\\reference\\static"
  },
  "sqlite": {"file": "../data/assess.sqlite3"},
  "http": {
    "origin": "https://assess-teams.test:8443",
    "proxies": ["127.0.0.1"],
    "login_proxies": ["127.0.0.1"],
    "certificate_file": "tls/reference.crt",
    "private_key_file": "tls/reference.key"
  },
  "smtp": {
    "host": "smtp.example.test",
    "port": 587,
    "starttls": true,
    "ssl": false,
    "sender": "Assess teams <noreply@example.test>"
  },
  "secrets": {"django_key_file": "private/django.key"},
  "services": {
    "account": "EXAMPLE\\svc_assess",
    "api_host": "127.0.0.1",
    "api_port": 8000,
    "delivery_seconds": 60,
    "due_time": "02:00",
    "timezone": "America/Toronto"
  },
  "backups": {"interval_hours": null, "retention_days": null},
  "journals": {"activity": "keep", "technical": "keep"}
}
```

SQLite se résout en `C:\ProgramData\AssessTeams\data\assess.sqlite3`, les secrets en
`C:\ProgramData\AssessTeams\config\private\django.key`, indépendamment du cwd.
Un relais authentifié peut ajouter smtp.user et secrets.smtp_credential_file ensemble.
Un SMTP local sans TLS et sans authentification reste permis par MEP-009.
null pour les backups ne vaut ni sauvegarde active ni politique de conservation validée.

## Exemple invalide complet par substitutions reproductibles

Le tableau est un jeu de mutations indépendantes de l'exemple valide. Chaque ligne définit
un exemple invalide précis ; les tests structurels/sémantiques ci-dessous sont automatisés
dans la preuve. Les autres refus concernent la lecture/recette de MEP-021, pas un chargeur livré.

| Modification | Refus attendu et règle |
| --- | --- |
| Supprimer version | Champ obligatoire absent, JSON Schema |
| version=2 | Version inconnue, JSON Schema |
| Supprimer secrets.django_key_file | Référence requise absente, JSON Schema |
| smtp.port="587" | Type erroné, JSON Schema |
| smtp.port=0 | Port hors plage, JSON Schema |
| services.delivery_seconds=0 | Fréquence non positive, JSON Schema |
| services.due_time="24:00" | Heure impossible, JSON Schema |
| backups.retention_days=0 | Conservation invalide, JSON Schema |
| journals.activity=30 | Protection des preuves métier, JSON Schema/MEP-042 |
| journals.technical=0 | Durée technique invalide, JSON Schema/MEP-042 |
| secrets.django_key="valeur-interdite" | Secret incorporé / clé inconnue, JSON Schema |
| organisation={} | Configuration métier hors contrat, JSON Schema |
| http.origin="http://assess-teams.test" | Origine non HTTPS, validateur MEP-002 |
| http.hosts=["*"] | Hôte non exact, validateur MEP-002 |
| http.proxies=["0.0.0.0/0"] | Confiance universelle, validateur MEP-002 |
| http.login_proxies=[] avec proxy HTTP | Incohérence des pairs, MEP-009 |
| smtp.starttls=true et smtp.ssl=true | Deux modes TLS, validateur MEP-009 |
| smtp.user="fictif" sans référence privée | Paire d'authentification incomplète, MEP-009 |
| services.timezone="Invalid/Zone" | Zone IANA inconnue, ZoneInfo |
| sqlite.file="C:relative.sqlite3" | Lecteur relatif ambigu ; refus de résolution |
| Déplacer le fichier sélectionné sans adapter ../data | Change la base de résolution ; revalidation obligatoire |
| Fournir APP_BASE_URL en environnement avec le fichier | Source concurrente explicitement refusée par le contrat |

Une valeur de site inconnue se remplace par une valeur fictive valide pour préparer le contrat ;
elle n'est pas une erreur du schéma. La recette réelle ne peut toutefois pas affirmer son accès,
ses ACL, sa confiance TLS ou la disponibilité SMTP sans les vérifier sur cible.
Aucun secret réel n'est nécessaire pour éprouver le schéma : les références privées suffisent.
La détection d'une valeur réelle arbitraire n'est pas prouvable par une regex ; revue de contenu,
scanner et interdiction structurelle des valeurs de secrets se complètent.
