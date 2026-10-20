# MEP-012 — Preuves CI réutilisées

Collecte GET le 2026-10-20 ; les dates HTTP ci-dessous sont celles de GitHub en UTC. Aucune campagne déclenchée.

## CI documentaire

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/runs/39325023007

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:31:14 GMT
X-Github-Request-Id: EA53:1D489:57E6C8:11D96E0:6AD75F11
{"actor":{"login":"GaranceRichard"},"conclusion":"success","created_at":"2026-10-19T21:07:45Z","event":"push","head_sha":"c81d131da0985e6665666a6cd6919edfbc95bdb5","html_url":"https://github.com/GaranceRichard/assess-teams/actions/runs/39325023007","id":39325023007,"path":".github/workflows/quality.yml","status":"completed","triggering_actor":{"login":"GaranceRichard"},"updated_at":"2026-10-19T21:08:26Z"}
gh exit: 0
```

## Jobs documentaires

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/runs/39325023007/jobs?per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:31:14 GMT
X-Github-Request-Id: EA54:2C7A5:5B3509:128AAA4:6AD75F12
{"completed_at":"2026-10-19T21:07:57Z","conclusion":"success","id":118308483357,"name":"plan"}
{"completed_at":"2026-10-19T21:08:17Z","conclusion":"success","id":118308571681,"name":"repository"}
{"completed_at":"2026-10-19T21:07:57Z","conclusion":"skipped","id":118308573712,"name":"backend"}
{"completed_at":"2026-10-19T21:07:57Z","conclusion":"skipped","id":118308573734,"name":"full"}
{"completed_at":"2026-10-19T21:07:57Z","conclusion":"skipped","id":118308573892,"name":"e2e"}
{"completed_at":"2026-10-19T21:07:57Z","conclusion":"skipped","id":118308574742,"name":"frontend"}
{"completed_at":"2026-10-19T21:08:25Z","conclusion":"success","id":118308733136,"name":"Required impact gate"}
gh exit: 0
```

## CI exhaustive intégrée

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/runs/39322649741

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:31:15 GMT
X-Github-Request-Id: EA55:16BDB8:5DC9CB:13026C6:6AD75F12
{"actor":{"login":"GaranceRichard"},"conclusion":"success","created_at":"2026-10-19T20:50:23Z","event":"push","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","html_url":"https://github.com/GaranceRichard/assess-teams/actions/runs/39322649741","id":39322649741,"path":".github/workflows/quality.yml","status":"completed","triggering_actor":{"login":"GaranceRichard"},"updated_at":"2026-10-19T20:55:46Z"}
gh exit: 0
```

## Jobs exhaustifs intégrés

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/runs/39322649741/jobs?per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:31:16 GMT
X-Github-Request-Id: EA56:3885AB:5EE73B:133F223:6AD75F13
{"completed_at":"2026-10-19T20:50:37Z","conclusion":"success","id":118300356873,"name":"plan"}
{"completed_at":"2026-10-19T20:50:45Z","conclusion":"success","id":118300458740,"name":"full / identity"}
{"completed_at":"2026-10-19T20:50:37Z","conclusion":"skipped","id":118300460578,"name":"backend"}
{"completed_at":"2026-10-19T20:50:37Z","conclusion":"skipped","id":118300460741,"name":"repository"}
{"completed_at":"2026-10-19T20:50:37Z","conclusion":"skipped","id":118300460986,"name":"e2e"}
{"completed_at":"2026-10-19T20:50:37Z","conclusion":"skipped","id":118300461757,"name":"frontend"}
{"completed_at":"2026-10-19T20:51:41Z","conclusion":"success","id":118300526652,"name":"full / Repository constraints"}
{"completed_at":"2026-10-19T20:52:22Z","conclusion":"success","id":118300526767,"name":"full / Frontend quality"}
{"completed_at":"2026-10-19T20:54:52Z","conclusion":"success","id":118300527150,"name":"full / e2e / Playwright E2E (2/2)"}
{"completed_at":"2026-10-19T20:53:30Z","conclusion":"success","id":118300527154,"name":"full / e2e / Playwright E2E (1/2)"}
{"completed_at":"2026-10-19T20:51:18Z","conclusion":"success","id":118300527169,"name":"full / backend / Backend static quality"}
{"completed_at":"2026-10-19T20:53:03Z","conclusion":"success","id":118300527365,"name":"full / backend / Backend tests (4/8)"}
{"completed_at":"2026-10-19T20:54:53Z","conclusion":"success","id":118300527377,"name":"full / backend / Backend tests (8/8)"}
{"completed_at":"2026-10-19T20:52:44Z","conclusion":"success","id":118300527386,"name":"full / backend / Backend tests (1/8)"}
{"completed_at":"2026-10-19T20:53:28Z","conclusion":"success","id":118300527397,"name":"full / backend / Backend tests (3/8)"}
{"completed_at":"2026-10-19T20:53:28Z","conclusion":"success","id":118300527452,"name":"full / backend / Backend tests (7/8)"}
{"completed_at":"2026-10-19T20:53:19Z","conclusion":"success","id":118300527544,"name":"full / backend / Backend tests (5/8)"}
{"completed_at":"2026-10-19T20:53:08Z","conclusion":"success","id":118300527552,"name":"full / backend / Backend tests (6/8)"}
{"completed_at":"2026-10-19T20:53:04Z","conclusion":"success","id":118300527618,"name":"full / backend / Backend tests (2/8)"}
{"completed_at":"2026-10-19T20:55:10Z","conclusion":"success","id":118302463625,"name":"full / backend / Backend global coverage"}
{"completed_at":"2026-10-19T20:55:33Z","conclusion":"success","id":118302598742,"name":"full / quality / Full quality gate"}
{"completed_at":"2026-10-19T20:55:46Z","conclusion":"success","id":118302776694,"name":"Required impact gate"}
gh exit: 0
```

## Nightly indépendante

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/runs/39271887078

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:31:16 GMT
X-Github-Request-Id: C2AC:2B2311:5BA822:12A9A36:6AD75F14
{"conclusion":"success","created_at":"2026-10-19T14:45:47Z","event":"schedule","head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","html_url":"https://github.com/GaranceRichard/assess-teams/actions/runs/39271887078","id":39271887078,"path":".github/workflows/exhaustive.yml","status":"completed","updated_at":"2026-10-19T14:50:06Z"}
gh exit: 0
```

## Artefacts nightly

GET https://api.github.com/repos/GaranceRichard/assess-teams/actions/runs/39271887078/artifacts?per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:31:16 GMT
X-Github-Request-Id: C2AD:E770E:5999C5:123C870:6AD75F14
{"created_at":"2026-10-19T14:48:03Z","expired":false,"expires_at":"2026-10-26T14:48:02Z","id":12196360141,"name":"backend-coverage-7","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:48:30Z","expired":false,"expires_at":"2026-10-26T14:48:29Z","id":12196355130,"name":"backend-coverage-3","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:49:40Z","expired":false,"expires_at":"2026-10-26T14:49:39Z","id":12196255480,"name":"playwright-shard-1","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:50:02Z","expired":false,"expires_at":"2026-11-18T14:50:01Z","id":12196240528,"name":"qualification","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:48:27Z","expired":false,"expires_at":"2026-10-26T14:48:26Z","id":12196175291,"name":"backend-coverage-8","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:48:30Z","expired":false,"expires_at":"2026-10-26T14:48:30Z","id":12195942559,"name":"backend-coverage-4","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:47:14Z","expired":false,"expires_at":"2026-10-26T14:47:14Z","id":12195887376,"name":"backend-coverage-2","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:47:47Z","expired":false,"expires_at":"2026-10-26T14:47:46Z","id":12195882545,"name":"backend-coverage-5","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:48:00Z","expired":false,"expires_at":"2026-11-02T14:47:59Z","id":12195667788,"name":"frontend-coverage-and-metrics","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:48:56Z","expired":false,"expires_at":"2026-10-26T14:48:54Z","id":12195378522,"name":"playwright-shard-2","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:48:54Z","expired":false,"expires_at":"2026-10-26T14:48:54Z","id":12194819422,"name":"backend-coverage-6","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:50:00Z","expired":false,"expires_at":"2026-11-02T14:49:59Z","id":12194789507,"name":"playwright-global-report","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:49:07Z","expired":false,"expires_at":"2026-10-26T14:49:06Z","id":12194544476,"name":"backend-global-coverage","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
{"created_at":"2026-10-19T14:47:07Z","expired":false,"expires_at":"2026-10-26T14:47:06Z","id":12194434361,"name":"backend-coverage-1","workflow_run":{"head_branch":"main","head_repository_id":1378534369,"head_sha":"e81e85fb80d4ab187be326cbdae5e38ec1d876a4","id":39271887078,"repository_id":1378534369}}
gh exit: 0
```

## Tests positifs et refus existants

Source : job Repository constraints 118300526652 du run 39322649741, journal relu le 2026-10-20.
```text
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5202150Z ok 1 - all required jobs passing produces a successful required check
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5208443Z ok 2 - repository failure blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5246683Z ok 6 - missing repository blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5248656Z ok 7 - backend failure blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5256648Z ok 11 - missing backend blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5258690Z ok 12 - frontend failure blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5267004Z ok 16 - missing frontend blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5273238Z ok 17 - e2e failure blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5281647Z ok 21 - missing e2e blocks publication
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:35.5340948Z ok 24 - missing blocks E2E consolidation
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:37.3883476Z ok 27 - publication pushes the candidate then fast-forwards only main
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:37.3886313Z ok 28 - dirty primary and divergent main block publication without overwriting data
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:38.4714180Z ok 29 - shared integration lock rejects a second publisher before fetching
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:38.4720435Z ok 30 - a rejecting pre-push prevents publication and main catch-up
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:38.6018276Z ok 1 - required failures stop execution; selected evidence is reused, then invalidated
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:38.6042107Z ok 3 - CI permits only justified skips and refuses every required failed or missing result
full / Repository constraints	UNKNOWN STEP	2026-10-19T20:51:38.6045919Z ok 4 - delivery status must belong to the exact pushed SHA and a successful push run
```

## Identité des checks

GET https://api.github.com/repos/GaranceRichard/assess-teams/commits/28a78ac0d38dd488c260547cb31494185fb9b789/check-runs?per_page=100

```text
HTTP/2.0 200 OK
Date: Tue, 20 Oct 2026 12:33:20 GMT
X-Github-Request-Id: F566:11EE30:295E04D:86545D9:6AD75F90
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"deploy","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"build","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"Required impact gate","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / quality / Full quality gate","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend global coverage","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (2/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (6/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (5/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (7/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (3/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (1/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (8/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend tests (4/8)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / backend / Backend static quality","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / e2e / Playwright E2E (1/2)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / e2e / Playwright E2E (2/2)","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / Frontend quality","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / Repository constraints","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"skipped","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"frontend","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"skipped","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"e2e","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"skipped","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"repository","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"skipped","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"backend","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"full / identity","status":"completed"}
{"app":{"id":15368,"slug":"github-actions"},"conclusion":"success","head_sha":"28a78ac0d38dd488c260547cb31494185fb9b789","name":"plan","status":"completed"}
```
