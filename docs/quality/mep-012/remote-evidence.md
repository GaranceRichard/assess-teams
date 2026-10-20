# MEP-012 — Preuves distantes des règles et acteurs

Collecte en lecture seule le 2026-10-20 ; heures Date fournies par GitHub en UTC (Toronto = UTC−4).
Projections JSON explicites ; seuls HTTP, Date, Request-Id et Link sont conservés des en-têtes. Aucun credential collecté.

## Identité

GET https://api.github.com/user

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:29 GMT
X-Github-Request-Id: EEF0:3F9829:2C5B0E8:912BFD9:6AD75EE4
{"id":29459554,"login":"GaranceRichard","type":"User"}
gh exit: 0
```

## Dépôt et droits

GET https://api.github.com/repos/GaranceRichard/assess-teams

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:29 GMT
X-Github-Request-Id: EEF2:F2464:2BD6479:8DDF507:6AD75EE5
{"default_branch":"main","full_name":"GaranceRichard/assess-teams","owner":{"login":"GaranceRichard","type":"User"},"permissions":{"admin":true,"maintain":true,"pull":true,"push":true,"triage":true},"visibility":"public"}
gh exit: 0
```

## Branche main

GET https://api.github.com/repos/GaranceRichard/assess-teams/branches/main

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:29 GMT
X-Github-Request-Id: EEF3:2D24D8:29CD98F:87D6836:6AD75EE5
{"commit":{"sha":"c81d131da0985e6665666a6cd6919edfbc95bdb5"},"name":"main","protected":false,"protection":{"enabled":false,"required_status_checks":{"checks":[],"contexts":[],"enforcement_level":"off"}}}
gh exit: 0
```

## Protection classique

GET https://api.github.com/repos/GaranceRichard/assess-teams/branches/main/protection

```text
HTTP/2.0 404 Not Found
Date: Tue, 20 Oct 2026 12:30:30 GMT
X-Github-Request-Id: EEF4:35437D:59DF62:124953F:6AD75EE6
{"message":"Branch not protected","documentation_url":"https://docs.github.com/rest/branches/branch-protection#get-branch-protection","status":"404"}
gh exit: 1
```

## Rulesets avec parents

GET https://api.github.com/repos/GaranceRichard/assess-teams/rulesets?includes_parents=true&per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:30 GMT
X-Github-Request-Id: EEF5:31831B:5A7397:1267AF8:6AD75EE6
[]
gh exit: 0
```

## Règles actives main

GET https://api.github.com/repos/GaranceRichard/assess-teams/rules/branches/main

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:31 GMT
X-Github-Request-Id: EEF6:2367:5A415E:125BAD0:6AD75EE6
[]
gh exit: 0
```

## Collaborateurs tous types

GET https://api.github.com/repos/GaranceRichard/assess-teams/collaborators?affiliation=all&per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:31 GMT
X-Github-Request-Id: EEF7:394002:599F09:123AF33:6AD75EE7
[{"login":"GaranceRichard","permissions":{"admin":true,"maintain":true,"pull":true,"push":true,"triage":true},"role_name":"admin","type":"User"}]
gh exit: 0
```

## Permission de publication

GET https://api.github.com/repos/GaranceRichard/assess-teams/collaborators/GaranceRichard/permission

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:31 GMT
X-Github-Request-Id: EEF8:3AAF40:5A125C:125630D:6AD75EE7
{"permission":"admin","role_name":"admin","user":{"login":"GaranceRichard","permissions":{"admin":true,"maintain":true,"pull":true,"push":true,"triage":true}}}
gh exit: 0
```

## Clés de déploiement

GET https://api.github.com/repos/GaranceRichard/assess-teams/keys?per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:32 GMT
X-Github-Request-Id: EEF9:2CB9E5:5B8424:129A144:6AD75EE7
[]
gh exit: 0
```

## Permissions Actions par défaut

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/permissions/workflow

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:30:32 GMT
X-Github-Request-Id: EEFA:247AA5:59D0BD:1239567:6AD75EE8
{"can_approve_pull_request_reviews":false,"default_workflow_permissions":"read"}
gh exit: 0
```

## Installations accessibles au jeton utilisateur

GET https://api.github.com/user/installations?per_page=100

```text
HTTP/2.0 403 Forbidden
Date: Tue, 20 Oct 2026 12:30:32 GMT
X-Github-Request-Id: EEFB:24DC18:5C62D4:12BBA2E:6AD75EE8
{"message":"You must authenticate with an access token authorized to a GitHub App in order to list installations","documentation_url":"https://docs.github.com/rest/apps/installations#list-app-installations-accessible-to-the-user-access-token","status":"403"}
gh exit: 1
```

Les listes 200 ne présentent aucun Link de pagination. Le refus installations ne démontre aucune absence d'application.
