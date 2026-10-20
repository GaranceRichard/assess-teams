# MEP-043 — Lectures distantes préparatoires

Collecte GET du 2026-10-20, après le recadrage utilisateur. Aucune mutation distante.
Les dates et Request-Id ci-dessous proviennent des réponses GitHub ; corps projetés sans secrets.
Ces constats de configuration ne modifient aucun statut MEP-012.

## Dépôt

`GET /repos/GaranceRichard/assess-teams`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:45 GMT
X-Github-Request-Id: CC48:3D7540:1F5BA6F:66FB56D:6AD762F1
{"full_name":"GaranceRichard/assess-teams","visibility":"public","default_branch":"main","permissions":{"admin":true,"maintain":true,"push":true,"triage":true,"pull":true},"allow_merge_commit":true,"allow_squash_merge":true,"allow_rebase_merge":true,"allow_auto_merge":false}
```

## Main

`GET /repos/GaranceRichard/assess-teams/branches/main`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:46 GMT
X-Github-Request-Id: CC49:2482AB:1DE1A1B:622465A:6AD762F1
{"name":"main","sha":"f123f77461ff43a80914864f249231dc9489d5b0","protected":false,"protection":{"enabled":false,"required_status_checks":{"enforcement_level":"off","contexts":[],"checks":[]}}}
```

## Rulesets hérités inclus

`GET /repos/GaranceRichard/assess-teams/rulesets?includes_parents=true&per_page=100`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:46 GMT
X-Github-Request-Id: CC4B:CDDD0:1E8D7F7:647406C:6AD762F2
[]
```

## Règles actives main

`GET /repos/GaranceRichard/assess-teams/rules/branches/main?per_page=100`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:46 GMT
X-Github-Request-Id: CC4C:2D2014:1F6BF10:6745C52:6AD762F2
[]
```

## Collaborateurs

`GET /repos/GaranceRichard/assess-teams/collaborators?per_page=100`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:47 GMT
X-Github-Request-Id: CC4D:209DB:1ED7E35:6536F93:6AD762F3
[{"login":"GaranceRichard","role_name":"admin","permissions":{"admin":true,"maintain":true,"push":true,"triage":true,"pull":true}}]
```

## Clés de déploiement

`GET /repos/GaranceRichard/assess-teams/keys?per_page=100`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:47 GMT
X-Github-Request-Id: CC4E:198A16:1F661F6:66F2D64:6AD762F3
[]
```

## Webhooks

`GET /repos/GaranceRichard/assess-teams/hooks?per_page=100`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:47 GMT
X-Github-Request-Id: CC4F:3B41E8:1FCDB09:680CB62:6AD762F3
[]
```

## Permissions Actions

`GET /repos/GaranceRichard/assess-teams/actions/permissions/workflow`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:48 GMT
X-Github-Request-Id: CC51:380738:1F50DF5:669782C:6AD762F4
{"default_workflow_permissions":"read","can_approve_pull_request_reviews":false}
```

## Inventaire Apps refusé

`GET /user/installations?per_page=100`

```text
HTTP/2.0 403 Forbidden
Date: Tue, 20 Oct 2026 12:47:48 GMT
X-Github-Request-Id: CC52:1732D0:1F4A855:6694DA0:6AD762F4
{"message":"You must authenticate with an access token authorized to a GitHub App in order to list installations","documentation_url":"https://docs.github.com/rest/apps/installations#list-app-installations-accessible-to-the-user-access-token","status":"403"}
```

## Producteur du check observé

`GET /repos/GaranceRichard/assess-teams/commits/f123f77461ff43a80914864f249231dc9489d5b0/check-runs?per_page=100`

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:47:49 GMT
X-Github-Request-Id: CC53:292A6B:1EC6EFF:651823B:6AD762F4
[{"name":"Required impact gate","status":"completed","conclusion":"success","head_sha":"f123f77461ff43a80914864f249231dc9489d5b0","html_url":"https://github.com/GaranceRichard/assess-teams/actions/runs/39423505833/job/118630361973","app":{"id":15368,"slug":"github-actions"}}]
```

Les listes GET réussies n’ont aucun en-tête Link : leur page de 100 éléments suffit ici.
Le 403 Apps ne constitue ni une liste vide ni une preuve d’absence.
Les credentials personnels/PAT/OAuth/SSH ne sont pas inventoriés par ces endpoints de dépôt.
Le check vert observé est une preuve CI historique, pas une règle obligatoire avant intégration.
Les essais de refus serveur et la preuve de conformité finale restent à produire après accord.
