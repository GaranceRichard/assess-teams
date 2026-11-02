# MEP-047 — Clôture documentaire approuvée

**Réalisé le 2026-11-01**, selon la décision explicite de l’utilisateur « MEP-047 — Décision de clôture approuvée ».
La qualification fonctionnelle est acceptée **sans développement supplémentaire** pour le SHA
`2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd` ([commit audité](https://github.com/GaranceRichard/assess-teams/commit/2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd)).
La date est celle de la campagne et de la décision acceptées, pas celle d’un nouveau déploiement applicatif.
Le [registre canonique](../../backlog/tracking/mess-e02.md) porte ce statut et cette date.

## Périmètre accepté et traçabilité

[Contrat FEAT-054/MEP-047](../../backlog/source/mess/f06.md) et
[dossier de sortie historique](../../backlog/planning/audit-20261027/sortie-mep-047.md) rapprochés des
acquis RESULT-001/002, MEP-014 et MEP-046. Aucun calcul, filtre, droit, contrat ni critère fonctionnel ajouté.
La comparaison reste organisationnelle, sur version exacte et snapshots ; la continuité historique exige
une lignée explicite, sans garantie d’équivalence sémantique des scores.

Le [rapport initial](rapport-initial.md) est conservé comme instantané antérieur à l’approbation :
ses mentions de proposition, Ouvert/N/A et absence de commit décrivent cette première mission.
La présente clôture constitue un chantier documentaire distinct, explicitement autorisé à publier.
L’[inventaire des preuves](preuves.md) distingue pièces versionnées, extraits et originaux locaux non publiés.
Les 152 pièces originales et l’archive locale ont été vérifiées présentes et intègres avant clôture.
Aucune disponibilité distante des PNG/logs/ZIP n’est annoncée ; les textes utiles sont pérennisés dans Git.

## Sept verdicts acceptés

Campagne du 2026-11-01, Codex ; organisations, comptes et bases exclusivement fictifs et isolés.
Les [extraits des observations](observations.md) conservent requêtes, statuts, valeurs et phases de jeu.

| ID | Attendu canonique | Observé dans la qualification acceptée | Preuve | Verdict |
| --- | --- | --- | --- | --- |
| A1 | Choix conservés entre restitutions du même contexte | v1 archivée et deux équipes maintenues dans les quatre vues ; critère conservé ; compteur de comparatifs inchangé | Rapport initial A1 ; observations « Conservation » ; ResultsLongitudinal/Tabs et E2E retour | **Passé** |
| A2 | Compatibilité famille/version explicite et archives consultables | v1 archivée exacte, v2 courante ; v3 sans résultat non proposée ; changements volontaires famille/version/organisation réinitialisent les choix incompatibles | Tests archives/versions ; observations de bascule Superadmin | **Passé** |
| A3 | Historique par lignée explicite | A=2→0→6, B=8→7 avec dates/provenance v1/v2 ; homonyme à autre UUID séparé ; absence distincte de 0 | Tests longitudinal/lineage/history_missing ; extraits des points API | **Passé** |
| A4 | Comparaison dans le périmètre de chaque rôle | Admin/Viewer A : A1/A2 ; Coach A : A1 ; Coach B : A2 ; Coach sans assignation : vide ; Admin B : B1 ; Superadmin : choix explicite A ou B | API, parcours par rôle, tests de sécurité et E2E Viewer | **Passé** |
| R1 | Refus d’agrégation/révélation interorganisation | Organisation/famille/version/lignée étrangères et équipes mêlées refusées intégralement, HTTP 404 sans donnée B ; refus administratifs Viewer 403 | Extraits HTTP et tests de sécurité/Viewer | **Passé** |
| R2 | Refus de résultats incompatibles, sans repli ni rapprochement par texte | Dernières COMPLETED endommagées exclues, aucun ancien run repris ; v3 et équipe exclue 404 ; ancien score absent omis, vrai 0 conservé | Tests résultats/history_missing ; extraits R2 avant/après | **Passé** |
| R3 | Refus de perte indue de filtres et de réponses obsolètes | Réponses tardives succès/erreur ignorées ; v2 reste choisie sans alerte ancienne ; retours conservent les choix ; resets volontaires conformes | Tests React de courses et historique ; observations HTTP retardées | **Passé** |

## Exécutions réellement acquises

| Niveau | Résultat de la qualification | Portée |
| --- | --- | --- |
| Backend | **54 passants**, 11 fichiers | pytest/API/ORM/permissions et deux tests OpenAPI |
| React | **35 passants**, 10 fichiers | 27 puis 8 ; doubles API/canvas, distincts des observations réelles |
| E2E | **7 passants**, aucun skip/flaky dans les rapports finaux | Six parcours Chromium/Django réels, puis un UX-09 à 32 combinaisons |
| CI exhaustive du SHA audité | [Run 41315798380](https://github.com/GaranceRichard/assess-teams/actions/runs/41315798380), completed/success | Huit partitions backend, couvertures, frontend, deux partitions E2E et gate exhaustif |

Voir les [inventaires exécutés](executions.md) et les [empreintes vérifiées](preuves.md).
Ces 96 tests appartiennent à la qualification précédente ; aucune suite applicative n’est rejouée
pour ce changement Markdown seul. La CI documentaire du commit de clôture est une preuve distincte.

## Deux réserves non bloquantes conservées

- **O1 — message sans série éligible.** Après exclusion des snapshots, l’UI peut demander de choisir des
  équipes alors qu’aucune n’est disponible. Le refus R2 est satisfait, sans faux zéro ou ancien résultat.
  Reproduction et réponse avant/après conservées dans les observations. MEP-050 demeure indépendant :
  ni modification, ni clôture, ni nouveau ticket ou critère ajouté par cette livraison.
- **O2 — captures pendant la sortie de l’aide.** Les PNG UX-09 peuvent montrer la couche inerte
  `.dialog-exit` après disparition du dialogue accessible. Ils ne valent pas relecture de l’arrière-plan
  stable ; les captures stables séparées servent aux observations de sélection. Aucune persistance ou
  impossibilité de parcours démontrée, aucun correctif de transition ni clôture d’un autre PBI.

## Limites et passation MESS

Relecture Codex des 16 états archive bleus à 1280×720 et 390×844, clair/sombre ; quatre états Vert stables
explicitement relus. UX-09 automatique en Vert couvre aussi 1920×1080 et 1280×480 ; clavier exercé.
Zoom natif 200 %, tactile physique et acceptation sur cible MESS ne sont pas déclarés exécutés ici.
L’approbation présente porte sur la clôture fonctionnelle bornée MEP-047, pas sur une recette MESS générale.

**MEP-070 reste Ouvert/N/A**, et FON-14/15/16/18 sur candidat/environnement MESS identifiés restent
**Non exécutés** dans le [cahier cible](../functional-acceptance-results.md). Les variantes complètes de
révision, mutation refusée et retrait de droits ne sont pas déduites des seules sondes locales.
**MEP-035 reste Ouvert/N/A, sans GO rendu** ; aucun autre PBI ni arbitrage C08/C21 n’est clôturé.
Les preuves locales sont réutilisables uniquement lorsque scénario, entrées, candidat et environnement correspondent.

## Revue DoD et livraison documentaire

- Critères/refus : sept verdicts et réserves acceptés explicitement par l’utilisateur ; pas de code à corriger.
- Trace : rapport, inventaires, extraits et empreintes conservés ; aucun secret ou artefact volumineux ajouté.
- Registre puis vues dérivées : recalcul depuis les 34 PBI fonctionnels et 62 PBI MESS, pas depuis un ancien total.
- Revue README, AGENTS/règles, charte, DoD, stratégie, coûts de validation, fondamentaux et API :
  impact sur le suivi et la preuve seulement ; critères, architecture et contrats conservés.
- README préalable de développement, nouveau test rouge/vert, migration, nouveaux contrats, lint/build/coverage
  applicatifs : non applicables au diff documentaire ; qualité de la base étayée par la CI exhaustive du SHA audité.
- Contrôles applicables au lot : plan d’impact documentaire, 200 lignes, secrets, structure, intégrité des
  références et workflow agents ; pré-push bloquant et CI sélective du SHA publié, sans contournement.
- Publication par `npm run publish`, push direct depuis la branche/worktree documentaires vers main,
  synchronisation locale sûre puis confirmation de la CI ; résultats effectifs confirmés à la livraison.

Le rapport initial, sa qualification et la décision approuvée restent attribués au SHA `2d9b6c3`.
Le futur SHA documentaire de clôture ne prétend pas être un nouveau candidat applicatif qualifié MESS.
Prochaine observation recommandée : **MEP-015**, sans dépendance technique nouvelle ; MEP-048 reste un chantier distinct.
