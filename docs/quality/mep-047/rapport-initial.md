# Rapport initial MEP-047 — instantané historique

Le rapport ci-dessous précède la validation explicite de clôture. Ses mentions « Ouvert / N/A »,
« sans commit/push » et DoD de clôture manquante décrivent exclusivement la mission de qualification.
La décision ultérieure et la livraison documentaire sont décrites dans la [clôture](README.md).
Les liens locaux sont normalisés vers l’[inventaire](preuves.md), le chemin personnel est neutralisé.
Original UTF-8 vérifié, SHA-256 : `0e7259fe22670fbd35d8c3727f0bec631ca4b735813784b67c5b052bc983f67c`.
Cette transcription n’embarque pas les logs, images ou autres pièces brutes.

---

MEP-047 : Clôture proposée

Rapport de qualification contradictoire de l’existant — aucune nouvelle fonctionnalité.

## Identité et décision

- SHA audité : `2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`, dernier `origin/main` récupéré et tête GitHub revérifiée pendant la campagne.
- Date/exécutant de toutes les lignes : **2026-11-01, Codex** ; exécutions locales entre environ 18:29 et 18:42 America/Toronto. Horodatages UTC dans les rapports JSON/XML.
- Branche : `audit/mep-047-20261101` ; worktree physique : `<worktree-audit-local>`.
- Checkout principal initialement et finalement propre ; `main...origin/main = 0/0` au SHA ci-dessus. Aucun travail d’un autre chantier touché.
- **Issue unique : clôture proposée sans code.** Les quatre acceptations et trois refus sont démontrés dans le périmètre canonique. Aucune correction produit MEP-047 identifiée.
- Cette proposition n’est ni une validation humaine, ni une clôture publiée, ni une recette du candidat MESS. MEP-047 reste **Ouvert / N/A**.

## Autorité, périmètre et rapprochement

Le dossier opérationnel fourni est utilisé comme guide de campagne ; les critères sont tirés de la source du dépôt, et les contraintes explicites de la demande priment. Aucun ordre de publication n’est exécuté.

| Source consultée | Apport à la qualification |
| --- | --- |
| `docs/backlog/governance.md`, `source/00-concepts-transverses.md` | Priorité des sources, rôles, rattachements et refus sans révélation étrangère. |
| `docs/backlog/source/mess/f06.md:58-68` | Contrat MEP-047 : conservation, versions compatibles, lignée et scope ; trois familles de refus. |
| `docs/backlog/tracking/mess-e02.md:15-18`, `tracking/pbis.md:37-38` | 014 et 046 réalisés ; RESULT-001/002 réalisés ; 047 ouvert, date N/A. |
| `planning/audit-20261027/sortie-mep-047.md`, `fiches/MEP-047.md` | Sept lignes, qualification seule, C08 limité à une éventuelle exigence sémantique nouvelle. |
| `planning/pre-mep.md`, `audit-20261027/ordonnancement-ux.md` | 047 avant 015 par économie de preuve ; aucune nouvelle dépendance technique. |
| `docs/architecture/results-api.md` | Version exacte ; dernières COMPLETED accessibles ; exclusion des snapshots inutilisables ; aucun repli ; scope avant sélection. |
| `docs/quality/ux-acceptance.md`, `functional-acceptance-results.md` | UX-09 ; FON-14/15/16/18 restent des recettes cible à exécuter sous MEP-070. |

RESULT-001 apporte la comparaison des dernières complétions, snapshots et sélections locales ; RESULT-002 apporte les observations datées par lignée explicite. Les tests de ces capacités ont été relus puis réexécutés dans cette campagne.
MEP-014 apporte le contexte et la provenance autorisée (`docs/quality/results-hierarchy.md`, SHA publié `2fbfb9eeba4852e1fd39647cb6b3a7a6226ef502`). MEP-046 apporte l’échelle, zéro/absence, récence et limite sémantique (`docs/quality/mep-046/README.md`, SHA `381a28978b14f9e9aae32add4fe0ed3a30ad46fa`).
Ces acquis voisins ne valent pas clôture historique de 047. La sélection de neuf fichiers Results déclarée au dossier de sortie est inchangée entre sa base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6` et le SHA audité. Le shell et les transitions ont évolué ailleurs ; les observations actuelles sont donc produites à nouveau. Aucune archive externe de 014/046 n’est supposée disponible ni transposée en PV actuel.
La lignée démontre une filiation explicite, jamais une équivalence sémantique des notes. Aucune comparaison multi-organisation ou persistance après reconnexion ajoutée.

## Environnement et jeu réellement utilisés

Windows 10.0.26200 ; PowerShell 5.1 ; Node 24.20.0 ; npm 11.19.0 ; Python 3.12.10 ; Django 5.2.17 ; SQLite 3.49.1 ; Chromium Playwright **153.0.8010.12**. Voir [environment.json](preuves.md).
Base SQLite dédiée sous ce dossier, aucun accès MESS ; ports de campagne 8277/5277 puis serveurs directs 8278/5278. Dépendances frontend/backend déjà préparées copiées physiquement dans le worktree, sans installation applicative supplémentaire.
Fixtures suivies réutilisées : `frontend/e2e/results-fixture.ts`, `identity-fixture.ts` et helpers backend. Ajouts de données fictives seulement : organisations A/B, sept comptes, homonyme de lignée distincte, snapshots incomplets/incompatibles et seconde famille.
Les phases de fixtures réinitialisent A : les IDs ne sont pas interchangeables entre rapports. Phase observations : A=8, B=9, équipes A=13/14, B=15 ; v1/v2/v3 et lignées exactes dans [observations.json](preuves.md) et [fixture-ids.json](preuves.md). Phase ultérieure de bascule : A=15, B=9 ; voir [context-switch.json](preuves.md). Les réponses capturées font autorité sur les IDs et valeurs de chaque phase.
Chaque rôle dispose d’un contexte navigateur séparé. Les notes et dates de la fixture Results sont fixes : v1 A=[0,10,7], B=[8,3,5] ; historique A=2→0→6, B=8→7 ; v1 archivée, v2 validée, v3 sans résultat.

## Exécutions et nature des preuves

| Preuve | Exécution réelle et résultat | Limite |
| --- | --- | --- |
| P1 — [backend.log](preuves.md), [backend.xml](preuves.md) | **54/54** tests, 11 fichiers ; pytest, API Django et base de test ; 51,52 s. | Sélection ciblée, aucun coverage global local déduit. |
| P2 — [react.log](preuves.md), [react-complement.log](preuves.md) | **35/35** tests, 10 fichiers ; 27 puis 8. | React/jsdom avec doubles API/graphiques : pas une observation HTTP ou un rendu canvas réel. |
| P3 — [e2e-direct.log](preuves.md), [e2e-direct.json](preuves.md) | **6/6 E2E**, 5 fichiers, 46 s ; Django/Vite/SQLite réels, Chromium ; 0 skip, 0 flaky. | Lanceurs temporaires isolés ; aucun test suivi modifié. |
| P4 — [observations.json](preuves.md), [r2-observations.json](preuves.md), [context-switch.json](preuves.md) | Sondes temporaires : 74, 9 et 2 enregistrements ; réponses HTTP, corps, sélection et observations par rôle. Toutes leurs assertions finales passent. | Ces enregistrements ne sont pas présentés comme autant de tests canoniques ou de PV MESS. |
| P5 — [ux09.log](preuves.md), [ux09.json](preuves.md), [mesures](preuves.md) | **1/1 E2E UX-09**, 24 s ; 32 combinaisons, Vert, deux thèmes, 1280×720/1920×1080/1280×480/390×844, clavier de l’aide, contraste et sélection. | Captures après aide parfois pendant sa fermeture : leur rendu sous-jacent n’est pas déclaré relu comme état stable. |
| P6 — PNG `day-*`, `night-*`, `green-stable-*` et [green-stable-observations.json](preuves.md) | Parcours archive dans les quatre restitutions ; 1280×720 et 390×844, clair/sombre ; compteur de comparatifs inchangé, 2 avant/après. | Relecture visuelle Codex distincte des assertions et de l’acceptation produit. |
| P7 — [CI du SHA exact](https://github.com/GaranceRichard/assess-teams/actions/runs/41315798380), [copie API](preuves.md) | Succès vérifié ; huit shards backend, fusion couverture, frontend, deux shards E2E, repository, gate exhaustif. Frontend S/B/F/L=94,38/92,90/95,81/95,26 % ; backend global affiché 97 %. | CI indépendante de cette campagne ; aucun scénario manuel/MESS déduit de sa couleur. |

Les **96 tests exécutés** ci-dessus sont 54 backend + 35 React + 7 E2E. Aucun échec fonctionnel dans les exécutions finales. Les incidents de préparation sont consignés dans [execution.md](preuves.md).

## Matrice attendu / observé / preuve / verdict

Toutes les lignes : exécutant Codex, 2026-11-01 ; préconditions fictives et SHA ci-dessus. « Passé » signifie qualification locale de la ligne, sans approbation de clôture.

| ID et précondition/action | Attendu | Observé | Code et tests existants effectivement exécutés | Preuve localisable | Verdict |
| --- | --- | --- | --- | --- | --- |
| **A1** Admin A, F/v1 archivée, A1/A2 ; radar→données→critère par Entrée→historique graphique/tabulaire→retour ; répéter deux thèmes/formats. | Même organisation/famille/version/équipes ; critère conservé entre restitutions ; aucun nouveau comparatif lors du seul choix de vue/équipe. | Deux équipes restent cochées, v1 reste choisie ; observations et critère cohérents ; compteur comparatif=2 avant et après toute la boucle. Réouverture du critère conservée en React. | `useResultSelection.ts`, `ResultsViews.tsx` ; ResultsLongitudinal « loads history only… », ResultsTabs ; E2E longitudinal/layout et archives. | P2/P3 ; P4 événements `visual-sequence` ; P6 [radar](preuves.md), [historique mobile](preuves.md). | **Passé** |
| **A2** A, F v1/v2/v3 ; choisir archive puis courante, seconde famille ; Superadmin A→B. | Version exacte visible et envoyée à l’API ; archive disponible ; v3 sans COMPLETED absente ; resets volontaires au changement de contexte. | v1 archivée consultable, scores/snapshots v1 ; requêtes `evaluation_id` exactes ; v2 et v3 distinguées ; familles/équipes/critère remis à zéro lors des bascules. Superadmin B ne reçoit que B. | `ResultsPage.tsx`, `result_history.py:15-28` ; ResultsArchivedVersions/Organizations ; test_result_archived_versions et test_result_version_selection_security. | P1/P2/P3 ; P4 `context-switch.json` ; [Superadmin B](preuves.md). | **Passé** |
| **A3** F v1/v2, lignée partagée ; nouveau critère homonyme d’une autre lignée ; consulter API + historique. | Observations par UUID explicite, dates/versions/snapshots exacts ; aucun rapprochement par texte ; zéro différent de manque. | Lignée stable : A=2→0→6 et B=8→7, provenance v1/v2 ; homonyme : points v2 seulement, UUID distinct ; cellules restantes vides. Phase R2 : ancien score absent omis, score courant 0 conservé. | `result_history.py:31-85`, ResultsHistory/Table ; test_result_longitudinal « copied_criterion… », test_question_lineage, test_result_history_missing ; ResultsTemporalCorrection. | P1/P2/P3 ; P4 labels `homonym separate`, `lineage-separation`, `missing old scores are omitted` ; [zéro/absence](preuves.md). | **Passé** |
| **A4** Admin A/B, Coach A, autre Coach B, Coach sans assignation, Viewer A, Superadmin ; listes→comparatif→observations dans sessions distinctes. | Admin/Viewer : COMPLETED de leur organisation ; Coach : ses assignations ; Superadmin : organisation explicitement choisie ; UI et API concordantes. | Admin A et Viewer : A1/A2 ; Coach A : A1 ; Coach B : A2 ; Coach sans assignation : liste vide et message explicite ; Admin B : B1 ; Superadmin commence sans organisation, puis A ou B séparément. | `results.py:8-26`, `taking_scope.py`, adapters Results ; tests_results_security, longitudinal_security, version_selection_security, viewer_results ; E2E viewer-results. | P1/P3/P4 ; captures `role-*.png` ; [Coach vide](preuves.md), [Superadmin B](preuves.md). | **Passé** |
| **R1** Depuis A, forger organisation/famille/version/lignée B, équipe B puis liste mêlée A+B. | Refus intégral selon contrat, aucune série ou métadonnée B ; pas de réponse partielle ; inconnu et étranger non révélateurs. | Requêtes étrangères/mêlées=404, corps `detail` ; famille étrangère identique à inconnue. Tests API vérifient aussi collision volontaire UUID et références incohérentes. API admin Viewer=403 dans E2E ; aucun 500 assimilé à un refus métier. | adapters `result_history_views.py`, scope puis éligibilité ; test_result_longitudinal_security:14, test_result_version_selection_security:15, test_viewer_results. | P1/P3 ; P4 labels par rôle `foreign…`, `mixed teams`, `unknown`, corps expurgés. | **Passé** |
| **R2** Sur clone fictif, dernière COMPLETED A à score absent et B à snapshot incompatible ; v3 sans résultat ; consulter comparatif et historique puis exemple 0/absence. | Aucune ancienne complétion de secours, fusion d’axes, faux zéro ou tendance inventée ; version/critère/équipe non éligibles refusés. | Avant=2 équipes ; après `200 {axes:3, teams:[]}` ; vieux run A non repris ; UI sans série ni checkbox ; v3=404, historique équipe exclue=404. Scores anciens absents omis ; vrai 0 affiché. Une passation non terminée est distincte d’une COMPLETED endommagée et ne redéfinit pas la récence. | `results.py:29-78`, `result_history.py:31` ; test_results « incompatible_or_incomplete_latest_snapshot_never_falls_back_to_old_run » et « latest_completion… », history_missing ; ResultsPageErrors. | P1/P2 ; P4 `r2-observations.json` avant/après ; [sans série](preuves.md), [0/vide](preuves.md). | **Passé** |
| **R3** Navigations répétées ; requêtes anciennes de versions, familles, organisations et équipes ; retarder successivement succès et erreur. | Aucun résultat/erreur obsolète ne remplace le nouveau contexte ; pas de perte involontaire ; resets intentionnels permis. | HTTP v1 retardé puis v2 choisi : succès ancien ignoré, puis 500 ancien ignoré ; v2 maintenue sans alerte. React couvre listes organisations/familles, comparatifs, archive et historique sur changement d’équipe ; retours de vues conservent les choix. | `useResultSelection.ts` gardes `current`, `ResultsHistory.tsx:51-81` ; ResultsSelectionRace/ArchivedVersions/PageErrors/Longitudinal/Intent ; E2E retour. | P2/P3 ; P4 événements `delayed-http-ignored` success/error et `visual-sequence` ; `context-switch.json`. | **Passé** |

## Registre des écarts et réserves

**Aucune anomalie canonique MEP-047 reproduite, aucune fuite interorganisation observée, aucun correctif produit proposé.**
Observation ergonomique bornée O1, non bloquante pour le refus R2 : après exclusion de toutes les séries, l’UI conserve les axes v1 et affiche « Sélectionnez une ou plusieurs équipes pour les comparer » alors qu’aucune équipe n’est proposée. Reproduction : les deux mutations fictives de P4/R2, puis choix v1. Attendu contractuel de 047 satisfait : aucune série incompatible ni ancien run substitué. Le message ne donne pas la cause de l’exclusion ; propriétaire proposé **MEP-050 (états vides)** pour appréciation, sans ticket créé ni exigence nouvelle imposée à 047. Scope observé Admin A ; aucune donnée B. Fichiers : `ResultsPage.tsx:127-156`, `ResultsRadar.tsx`, `results.py:55-78` ; preuve `r2-incompatible-empty.png` et texte dans `r2-observations.json`.
Observation de preuve O2 : la suite UX-09 capture parfois la couche inerte `.dialog-exit` après retrait du dialogue accessible. Ce rendu transitoire est expliqué par `dialogTransition.ts` (retrait borné à 280 ms) ; aucune persistance ni blocage de parcours démontré ici. Les PNG de cette suite sont gardés comme sorties brutes, sans les transformer en approbation visuelle de l’arrière-plan. Les captures `green-stable-*` sont prises sans ouverture de l’aide et servent aux observations de sélection. Pas de correction de transition développée ni de clôture d’un autre PBI.
Labels très étroits sur mobile peuvent revenir à la ligne à l’intérieur d’un mot ; les textes restent complets et les boutons de critères opérables. Cette campagne n’est pas une qualification générale du dessin radar MEP-015.

## Relecture visuelle et limites

Les **16** captures archive bleues `day/night × 1280/390 × radar/radar-details/history/history-details` ont été examinées visuellement par Codex. Contexte v1, noms, cases, légendes, dates, provenance et retour cohérents ; mobile en flux vertical, document mesuré 390 px ; tableaux avec cellules vides distinctes des notes 0.
En Vert, la sonde stable reprend les mêmes 16 états. Relecture explicite au minimum : `green-stable-day-1280-radar.png`, `green-stable-night-1280-history-details.png`, `green-stable-day-390-history-details.png`, `green-stable-night-390-radar-details.png`. Les huit vues brutes UX-09 examinées en complément montrent le transitoire O2 ; elles ne sont pas des observations stables des résultats.
Le clavier est effectivement exercé : Entrée sur critère, contrôles Analyse, navigation des onglets, End dans les régions de tableau (E2E layout/history-layout), ouverture/fermeture de l’aide et restitution du focus (UX-09).
Zoom natif 200 %, tactile physique et acceptation par un représentant MESS : **Non exécutés ici**. Ils ne sont pas requis pour démontrer la logique de comparaison dans cette qualification bornée ; les contrôles UX transverses et la recette cible conservent leurs exigences. Aucun redimensionnement n’est présenté comme un zoom.

## Revue DoD

| Exigence | Applicabilité | État et preuve / manque |
| --- | --- | --- |
| Quatre acceptations et trois refus | Oui | Prouvés localement ligne par ligne ci-dessus ; proposition de clôture, pas décision humaine. |
| Architecture/Clean Code | Revue ciblée de l’existant ; aucun changement | Sélection UI, projection, historique, scope et adapters séparés ; pas de nouvelle dette/abstraction introduite. Aucun audit exhaustif de conception prétendu. |
| Limite de 200 lignes, secrets, conflits | Oui pour le SHA de base | Gate Repository constraints vert P7 ; aucun fichier suivi créé/modifié. Rapport et sondes non versionnés. |
| Nominal et véritables refus fonctionnels | Oui | P1/P2/P3/P4 ; refus métier et incidents 500 distingués. |
| Intégration Django+ORM, API+permissions, React+API, E2E | Oui | 54 tests backend, 35 React, 7 E2E ; corps et scopes observés P4. |
| Coverage ≥90 % | Oui comme assurance du candidat, pas seuil d’une sélection | CI exhaustive du SHA exact : backend 97 % affiché, quatre seuils frontend >90 %. Aucun coverage complet relancé localement. |
| Lint/format/typecheck/build | Oui sur la base | P7 vert ; non réexécutés localement, aucune source modifiée. |
| Migrations et nouveau contrat/OpenAPI | Pas de changement | Aucune migration à produire ; les deux tests OpenAPI existants passent P1 et CI statique verte. |
| Test rouge/vert de correction | N/A | Aucun bug corrigé, aucun test changé ; aucune preuve rouge inventée. |
| Revue documentaire | Oui, sans édition autorisée | README, AGENTS/règles, charte, DoD, stratégie, coûts/commandes, fondamentaux, API Results/OpenAPI, UX et recettes rapprochés. Projet de clôture ci-dessous seulement. |
| README préalable de développement | N/A | Aucun développement ni changement technique livré ; ne pas fabriquer une édition du README. |
| Contrôle visuel pertinent | Oui | Relecture P6 et limites explicites ; aucune approbation produit/MESS inventée. |
| Commit, pre-push, push, CI d’une clôture | Non exécutés par mandat | Exception explicite de l’utilisateur. La CI P7 concerne la base, pas un nouveau changement documentaire. |
| Validation humaine, statut/date, intégration de clôture | Manquant intentionnellement | Requis avant « Réalisé ». La DoD de clôture n’est donc **pas déclarée totalement achevée** dans cette mission. |

## Projet de clôture et prochaine action unique

**Prochaine action : soumettre cette clôture sans code à la validation explicite du responsable produit/suivi.** Aucune qualification fonctionnelle résiduelle MEP-047 identifiée dans le périmètre borné ; aucune autorisation de publication déduite.
Projet non appliqué : dans `docs/backlog/tracking/mess-e02.md`, remplacer la justification de 047 par « Qualification des quatre critères et trois refus sur 2d9b6c3 ; 54 backend, 35 React et 7 E2E passants ; archives/sélection/lignée/scopes et refus observés, rapport daté du 2026-11-01 ; aucun code ajouté ». Le passage éventuel à Réalisé, la date et les mises à jour dérivées restent à valider et à intégrer dans un mandat distinct avec gates documentaires adaptés. En l’état conserver **Ouvert / N/A**.

## Passation MEP-070

Réutilisables sous réserve des entrées exactes : rapports P1/P2/P3/P5, requêtes et réponses fictives P4, captures P6, manifeste et SHA. La preuve CI P7 peut appuyer la qualité technique du même candidat exact ; elle n’est pas un PV fonctionnel MESS.
FON-14/15/16/18 sur environnement et candidat MESS identifiés restent **Non exécutés** : identité de candidat/déploiement, rôles/jeux cibles, nominal/refus, retrait de droits et reprises, observations/acceptation du responsable de recette. Les variantes complètes de FON-15 (révision), FON-16 (mutation refusée sur candidat) et FON-18 ne sont pas prétendues rejouées par les seules sondes locales.
Aucune clôture de MEP-070, aucun GO MEP-035, aucune décision C07/C08 inventée, aucune nouvelle exigence sémantique.

## Intégrité de fin

Aucun fichier suivi modifié, aucun commit, aucun push, aucun changement de statut. Aucun code, test, contrat ou backlog canonique édité. Worktree conservé uniquement pour le rapport et ses preuves non versionnées ; il ne constitue pas un chantier de développement publié. Les serveurs lancés pour cet audit sont arrêtés en fin de campagne.
