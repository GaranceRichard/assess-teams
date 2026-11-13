# Provenance des preuves

Archives complètes et réponses API conservées localement dans
`.cache/ci-incident-20261111/`.
Les archives ne sont pas proposées au commit ; les extraits ci-dessous sont documentaires.
Les URLs et les empreintes permettent de contrôler la provenance.

| Run | Fichier obtenu via `gh api` | SHA-256 des octets locaux |
| --- | --- | --- |
| 42622603260 | `run.json` | `3e8066fcfd1fd16d35a343e5dd02b92ad366d2b01f0bb4180d6d40971b2ffe02` |
| 42622603260 | `jobs.json` | `fd9e93150a313c06e8d4ecc5d64534cd076935157f756ca56f150d6312dcbcbb` |
| 42622603260 | `artifacts.json` | `b817ddf1c563871db6ae556ef76b5c932594992369a03091eba781c8f9857885` |
| 42622603260 | `logs.zip` | `40d0e102041682d76afe934f7d3556d423e9f953a3167916eceb854fa019598a` |
| 42666770555 | `run.json` | `28f44a2305044f846947faa18d12f5c35f1840af63702a09fa8605d9a4a34a24` |
| 42666770555 | `jobs.json` | `974b3f9ea115d4c32fde684c888c4f1cdb4bea521e112fd8f3505c3d0068d350` |
| 42666770555 | `artifacts.json` | `81134c5f0925468e1c5c750e12b4c133003b099f544be91e3ebd8745761c172c` |
| 42666770555 | `logs.zip` | `445e9b2a5169660c6eeb5fa5f586b66c8acd7bb8cb070e2af05f4ee8e3fdb218` |
| 42846627165 | `run.json` | `2edba18c4d8ff4b68c772909fa5fd118f689a5f6c53927c47a07a94e135e3b9d` |
| 42846627165 | `jobs.json` | `c74b50e762e6cf311fe1024aac83ee2c637ae966ee71cc20d8ea35f8f12f7651` |
| 42846627165 | `artifacts.json` | `e3c992f8b02c0fb0c491836f4410b492e1edb078e88232881be6a6ba23325c35` |
| 42846627165 | `logs.zip` | `82f4978185a9d4c3e036d6c98830aaae03ef56281f23bb1a432baf5fcd0c05db` |
| 43048132030 | `run.json` | `4a2c06488debe14e52aac3f147667ac15c2ed72f5dd5f70b1f6b39b368e985eb` |
| 43048132030 | `jobs.json` | `4df9985194f8ce9080926026148c16dcc540fb11495a32ae5fb81a619ac2831a` |
| 43048132030 | `artifacts.json` | `fa54b7f91fc1cca3ba913d51e468e958076bbf5d71d6000606a502c38623217e` |
| 43048132030 | `logs.zip` | `8255cdee9b78a0e175dc9285f26715d6ce434023e868ad7cd798c44554c3454f` |

Endpoints lus : `repos/GaranceRichard/assess-teams/actions/runs/{run}` ;
`/jobs?per_page=100`, `/artifacts?per_page=100`, `/logs`.
Les jobs/étapes ont aussi été lus via le connecteur GitHub.
Les archives et métadonnées complètes ont été obtenues par CLI pour leur conservation locale.

## Extraits du 11 novembre

Chaque ligne conserve son horodatage original ; les sorties pytest sont capturées puis
réémises en fin de test/partition. Elles ne datent pas les signaux interprocessus.

### `0_quality _ Full quality gate.txt`

```text
206: 2026-11-11T15:37:28.9851284Z Error: ENOENT: no such file or directory, scandir '/home/runner/work/assess-teams/assess-teams/frontend/.cache/e2e/blobs'
232: 2026-11-11T15:37:29.1693546Z ##[error]No files were found with the provided path: frontend/playwright-report/. No artifacts will be uploaded.
256: 2026-11-11T15:37:29.2304172Z Full quality gate failed: backend, e2e
```

### `10_backend _ Backend tests (4_8).txt`

```text
323: 2026-11-11T15:28:08.8366893Z E       AssertionError: sqlite_contention operation=http outcome=non_replayable attempt=1 elapsed_ms=0 sqlite_code=5 correlation_id=f71bb01c-0145-4357-9c8a-e381e58afa89
341: 2026-11-11T15:28:08.8374224Z E           File "/home/runner/work/assess-teams/assess-teams/backend/teams/adapters/api/views.py", line 68, in post
344: 2026-11-11T15:28:08.8375301Z E           File "/home/runner/work/assess-teams/assess-teams/backend/identities/application/lifecycle.py", line 15, in lock_identity_changes
345: 2026-11-11T15:28:08.8375802Z E             Organization.objects.update(name=F("name"))
393: 2026-11-11T15:28:08.8395339Z E           File "/home/runner/work/assess-teams/assess-teams/backend/tests/sqlite_contention_cases.py", line 29, in apis
394: 2026-11-11T15:28:08.8395742Z E             assert result(second)[0] == 201
399: 2026-11-11T15:28:08.8397201Z E        +  where 1 = CompletedProcess(args=['/home/runner/work/assess-teams/assess-teams/backend/.venv/bin/python', '-m', 'tests.sqlite_con...ses.py", line 29, in apis\n    assert result(second)[0] == 201\n           ^^^^^^^^^^^^^^^^^^^^^^^^\nAssertionError\n').returncode
425: 2026-11-11T15:28:09.1650916Z FAILED tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release-development] - AssertionError: sqlite_contention operation=http outcome=non_replayable attempt=1 elapsed_ms=0 sqlite_code=5 correlation_id=f71bb01c-0145-4357-9c8a-e381e58afa89
443: 2026-11-11T15:28:09.1662898Z     File "/home/runner/work/assess-teams/assess-teams/backend/teams/adapters/api/views.py", line 68, in post
446: 2026-11-11T15:28:09.1663942Z     File "/home/runner/work/assess-teams/assess-teams/backend/identities/application/lifecycle.py", line 15, in lock_identity_changes
447: 2026-11-11T15:28:09.1664451Z       Organization.objects.update(name=F("name"))
495: 2026-11-11T15:28:09.1700666Z     File "/home/runner/work/assess-teams/assess-teams/backend/tests/sqlite_contention_cases.py", line 29, in apis
496: 2026-11-11T15:28:09.1701063Z       assert result(second)[0] == 201
501: 2026-11-11T15:28:09.1702452Z  +  where 1 = CompletedProcess(args=['/home/runner/work/assess-teams/assess-teams/backend/.venv/bin/python', '-m', 'tests.sqlite_con...ses.py", line 29, in apis\n    assert result(second)[0] == 201\n           ^^^^^^^^^^^^^^^^^^^^^^^^\nAssertionError\n').returncode
502: 2026-11-11T15:28:09.1703193Z ========== 1 failed, 103 passed, 1357 deselected in 153.10s (0:02:33) ==========
```

### `12_e2e _ Playwright E2E (2_2).txt`

```text
328: 2026-11-11T15:26:14.2372234Z ##[group]Run npx playwright install --with-deps --only-shell chromium
373: 2026-11-11T15:29:38.7923569Z W: Failed to fetch mirror+file:/etc/apt/apt-mirrors.txt/dists/noble/InRelease  Temporary failure resolving 'azure.archive.ubuntu.com'
488: 2026-11-11T15:36:19.7742034Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/f/fonts-ipafont/fonts-ipafont-gothic_00303-21ubuntu1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
489: 2026-11-11T15:36:19.7744353Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/f/fonts-freefont/fonts-freefont-ttf_20211204%2bsvn4273-2_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
490: 2026-11-11T15:36:19.7745977Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/f/fonts-tlwg/fonts-tlwg-loma-otf_0.7.3-1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
491: 2026-11-11T15:36:19.7747493Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/u/unifont/fonts-unifont_15.1.01-1build1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
492: 2026-11-11T15:36:19.7749536Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/f/fonts-wqy-zenhei/fonts-wqy-zenhei_0.9.45-8_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
493: 2026-11-11T15:36:19.7751994Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
494: 2026-11-11T15:36:19.7753536Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
495: 2026-11-11T15:36:19.7755387Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/x/xfonts-cyrillic/xfonts-cyrillic_1.0.5%2bnmu1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
496: 2026-11-11T15:36:19.7757461Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/x/xfonts-scalable/xfonts-scalable_1.0.3-1.3_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
499: 2026-11-11T15:36:19.7767187Z Error: Installation process exited with code: 100
500: 2026-11-11T15:36:19.7930581Z ##[error]Process completed with exit code 1.
525: 2026-11-11T15:36:19.9697014Z ##[error]No files were found with the provided path: frontend/.cache/e2e/. No artifacts will be uploaded.
```

### `14_e2e _ Playwright E2E (1_2).txt`

```text
326: 2026-11-11T15:26:21.4570753Z ##[group]Run npx playwright install --with-deps --only-shell chromium
371: 2026-11-11T15:29:54.7318126Z W: Failed to fetch mirror+file:/etc/apt/apt-mirrors.txt/dists/noble/InRelease  Temporary failure resolving 'azure.archive.ubuntu.com'
486: 2026-11-11T15:36:34.8974051Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/f/fonts-ipafont/fonts-ipafont-gothic_00303-21ubuntu1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
487: 2026-11-11T15:36:34.8976118Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/f/fonts-freefont/fonts-freefont-ttf_20211204%2bsvn4273-2_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
488: 2026-11-11T15:36:34.8977833Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/f/fonts-tlwg/fonts-tlwg-loma-otf_0.7.3-1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
489: 2026-11-11T15:36:34.8979229Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/u/unifont/fonts-unifont_15.1.01-1build1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
490: 2026-11-11T15:36:34.8980735Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/f/fonts-wqy-zenhei/fonts-wqy-zenhei_0.9.45-8_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
491: 2026-11-11T15:36:34.8982991Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/x/xfonts-encodings/xfonts-encodings_1.0.5-0ubuntu2_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
492: 2026-11-11T15:36:34.8984823Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/x/xfonts-utils/xfonts-utils_7.7%2b6build3_amd64.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
493: 2026-11-11T15:36:34.8986864Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/universe/x/xfonts-cyrillic/xfonts-cyrillic_1.0.5%2bnmu1_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
494: 2026-11-11T15:36:34.8988561Z E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/x/xfonts-scalable/xfonts-scalable_1.0.3-1.3_all.deb  Temporary failure resolving 'azure.archive.ubuntu.com'
497: 2026-11-11T15:36:34.8999852Z Error: Installation process exited with code: 100
498: 2026-11-11T15:36:34.9178999Z ##[error]Process completed with exit code 1.
523: 2026-11-11T15:36:35.1067333Z ##[error]No files were found with the provided path: frontend/.cache/e2e/. No artifacts will be uploaded.
```
