# MEP-051 — Inventaire des preuves

Stockage local persistant : `C:/Users/garan/Desktop/Projets/Assess-teams-preuves-mep-051`.
Données fictives, campagne du 2026-11-06, Windows / Chromium. Les PNG et journaux bruts
ne sont pas publiés dans Git ; les empreintes permettent leur contrôle sur le poste.
Ils ne constituent pas des pièces disponibles à distance ni une recette MESS.

## Commandes et sélections exécutées

- `npm run test:quick --prefix frontend -- ManagedUserRecovery.test.ts` avant correction :
  quatre échecs techniques, une validation métier réussie.
- `npm run quality:targeted -- e2e e2e/error-planning-recovery.spec.ts e2e/error-invitation-recovery.spec.ts`
  avant correction : deux planifications vertes ; assertion Admin rouge (diagnostic affiché).
  Le timeout Coach du premier harnais n’est pas une anomalie produit ; son cas final est une modification autorisée de Viewer.
- `npm run test:quick --prefix frontend -- ManagedUserRecovery.test.ts managedUsers.test.ts DialogPending.test.tsx PlanningPage.test.tsx ScheduleManagement.test.tsx`
  après correction : cinq fichiers / 20 tests verts.
- Même commande E2E ciblée après correction : quatre parcours verts, 39,9 s.
- Depuis `backend`, `.venv/Scripts/python.exe -m pytest tests/test_email_business.py tests/test_email_queue.py tests/test_email_admin.py tests/test_evaluation_schedule_management.py tests/test_evaluation_schedules.py --no-cov` :
  49 tests verts, 27,79 s. Backend inchangé ; aucun seuil global déduit de cette sélection.
- `npm run quality:targeted` calcule et exécute le plan obligatoire ; pré-push et CI indépendants
  portent ensuite exactement le candidat publié. Résultats finaux consignés dans le compte rendu de livraison.

Les journaux rouges utilisent uniquement des marqueurs fictifs de diagnostic. Les toutes premières
tentatives invalides de harnais ne sont pas utilisées comme preuves de non-conformité produit.

## Relecture visuelle

Captures effectivement relues : `16539/invitation-refused`, `665c6/update-refused`,
`809f9/update-refused` (suffixes des répertoires ci-dessous). Message entier, champs conservés,
focus visible et action d’enregistrement identifiable. Les cinq autres PNG sont automatisés.
Les captures plein document attestent le rendu observé ; elles ne sont pas une qualification
supplémentaire de toutes les géométries ni du zoom natif. Les reprises sont aussi vérifiées par ORM et reload.

## Empreintes des pièces conservées

| Pièce relative au stockage | Octets | SHA-256 |
| --- | ---: | --- |
| `mep-051-e2e-green.txt` | 15604 | `87d9f19f6c58ee49c8ebbef09fcc0513dd918a29ad214e389d31a5f92d53d604` |
| `mep-051-reproduction.txt` | 21852 | `ab416eec06050ecdb078cf530a97a8d77f481b617ffaaa96add35f54b08f2088` |
| `mep-051-smtp.txt` | 1724 | `8450f176b13fcf5950f432cfa424c7dd9c96fd939858be1199c53ba5d0abf262` |
| `mep-051-unit-green.txt` | 1462 | `36c280b0a4e19d6e49a421688ce15a3691a6b62b8e3c6567d1f12482415d1e4f` |
| `mep-051-unit-red.txt` | 6134 | `f05d0cf2a81a6a44455e8b7f794708b0884117248beff86e75033a73b7492015` |
| `qualification/error-invitation-recovery--16539-d-preserves-input-for-retry-chromium/invitation-refused.png` | 59324 | `9d4e87cdc49070cb93e3c5f22d341c5f631657a186597aa9a17f1371714c0cbf` |
| `qualification/error-invitation-recovery--f81fc-d-preserves-input-for-retry-chromium/invitation-refused.png` | 50591 | `22fed59ce02dbc0cfe681bc3c52441ed3d07b5a6beb9c528f21e5ae3ef386cae` |
| `qualification/error-planning-recovery-pl-665c6-oices-and-retries-once-day--chromium/create-refused.png` | 59568 | `39982e981b0a1e305b0fdaa4e141372d57920b41d4baeded1504e68cd132d399` |
| `qualification/error-planning-recovery-pl-665c6-oices-and-retries-once-day--chromium/update-recovered.png` | 88614 | `f0abbb41d6067805a2a46caee74fc59b1598eeda9a6c748c6770e37625336db4` |
| `qualification/error-planning-recovery-pl-665c6-oices-and-retries-once-day--chromium/update-refused.png` | 64502 | `2bc6ac4bd931aed1096e838f34f4b740435472a3a3bd815942bb8631b079ae44` |
| `qualification/error-planning-recovery-pl-809f9-ces-and-retries-once-night--chromium/create-refused.png` | 58540 | `92392851e9eb6cf76fe207d0c1e1a169445f628c3933bdda856ec7739322fc65` |
| `qualification/error-planning-recovery-pl-809f9-ces-and-retries-once-night--chromium/update-recovered.png` | 78063 | `fcc53da700bf79f7ac9733a1723f06c2fa95fab637a55160224b3cdb9c643362` |
| `qualification/error-planning-recovery-pl-809f9-ces-and-retries-once-night--chromium/update-refused.png` | 54967 | `fdf688703e8cc5e8329141cfbbec6cbb728d03c5e833629510708eeb94ce339f` |

## Entrées applicatives qualifiées

Base Git complète dans le rapport. Ces empreintes relient les sélections explicites au correctif
et aux tests, indépendamment des modifications documentaires ultérieures.

| Entrée | SHA-256 |
| --- | --- |
| `frontend/src/managedUsers.ts` | `90576f2adc117eae17f18c7588c3751578dc41a2dd486d43833672babae651f6` |
| `frontend/src/ManagedUserRecovery.test.ts` | `4ea24360ba1fb171e50f3c0909122d63c22a2796afbb3a721787a8f245e0890e` |
| `frontend/e2e/error-invitation-recovery.spec.ts` | `5eb5309d99c825fdc64eb5960e1f4b11e6d66700b847234aa8609e671e14883e` |
| `frontend/e2e/error-planning-recovery.spec.ts` | `f8a159be96d683f6d83476c71b628e8e52dfd8893f56e32dd84202cada79e036` |

## Résultats du plan obligatoire

Frontend complet : 116 fichiers, 478 tests réussis ; couverture statements 94,57 %,
branches 93,06 %, fonctions 95,97 %, lignes 95,45 %. Lint, formatage, typage et build conformes.
Ces valeurs proviennent du scope frontend complet, distinct des 20 tests de développement ciblés.
E2E complets : 134 parcours applicatifs et 10 parcours de démo réussis ; builds et gate applicables conformes. Pré-push et CI du candidat sont confirmés au compte rendu de livraison.

## Pièces du plan de validation acquis

| Pièce relative au stockage | Octets | SHA-256 |
| --- | ---: | --- |
| `mep-051-quality.txt` | 713654 | `362754d92f31919467e30446ee3879464f5587225ee5d666ea741476e0d2e1a3` |
| `validation-e2e.json` | 209 | `329658203c439aa824992e630ff8b7b4a6224f8c2957f5d252a0f8b9978666ef` |
| `validation-frontend.json` | 214 | `2bf3d373f6906c36d6404bb55a66a5b739755fe557757fcb6b3023ebdb7e21b3` |
| `validation-metrics.jsonl` | 1144 | `7b311159cd697c425cdf49042bbeb54eb67833e03a3a5561efa072dbf3c5a688` |
| `validation-plan.json` | 1447 | `4445e9202c8362b6fc1dff879d96ef7e9300927ea9dbd8d378064447d1705f67` |

## Rapprochement final du 2026-11-09

Les 18 pièces ci-dessus et les quatre empreintes d'entrées ont été vérifiées conformes.
La [qualification finale](qualification-finale.md) distingue la campagne locale initiale
(134 E2E applicatifs + 10 démo) de la CI du SHA exact publié (138 + 10), relue dans son journal.
Aucun nouveau test applicatif n'est exécuté pour ce rapprochement documentaire.

Pièces de publication et resynchronisation également relues dans le sous-dossier local
`resynchronisation` ; empreintes relevées lors du présent examen, distinctes de l'inventaire initial :

| Pièce | Octets | SHA-256 |
| --- | ---: | --- |
| `resynchronisation/publication.txt` | 830684 | `629d2a9a08eb5767ac712bdf3e30b07e564f748c0d0f3f35373267e9e4c1fa70` |
| `resynchronisation/ci.json` | 9957 | `03daff6a34d0ae78eef39f73fe451eabb0605d974eb1c8ae6e83a4556f3bcc8e` |
| `resynchronisation/relecture.txt` | 1723 | `2197868467b4810a2d8717946d11f7da5e43ae302366c7ae6a63464378d44d93` |
