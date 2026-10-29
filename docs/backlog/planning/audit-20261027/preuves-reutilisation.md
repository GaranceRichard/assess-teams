# Rapprochement des preuves et de l’historique Git

Contrôle documentaire exécuté le 2026-10-28 sur `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour index](preuves.md). Ce contrôle ne lance ni test métier ni lecture de CI distante.

## SHAs explicitement cités dans le registre actif

Les douze références Git de livraison présentes en backticks dans les registres ont été résolues et
vérifiées ancêtres du SHA audité. Cela démontre leur intégration, **pas à soi seul leur conformité**
ni une CI courante verte. Les résultats de CI restent ceux des rapports/liens datés ; aucun nouveau run
n’est revendiqué. Les autres réalisations conservent les preuves sources et leur date canonique.

| Référence citée | SHA complet résolu | Intégré dans la base auditée |
| --- | --- | --- |
| `1e22be2` | `1e22be2aacc6c63d64c5b27a915eb0c91c6ed673` | Oui |
| `28a78ac` | `28a78ac0d38dd488c260547cb31494185fb9b789` | Oui |
| `2bd6eff` | `2bd6eff36ca806a591e822f151d5b09c86e0ce78` | Oui |
| `2fbfb9e` | `2fbfb9eeba4852e1fd39647cb6b3a7a6226ef502` | Oui |
| `381a289` | `381a28978b14f9e9aae32add4fe0ed3a30ad46fa` | Oui |
| `5fadccb` | `5fadccb9b762efa70f6b54d50bc24de0397d6f2e` | Oui |
| `6383e45` | `6383e450619501c6272eb4c7cb51e227627c1523` | Oui |
| `72477e4` | `72477e4ede17e1657f56f2f59253f3140eb18568` | Oui |
| `a623caf` | `a623caf2381e056c29cf4c5de0c6673b58adf90a` | Oui |
| `b7e3242` | `b7e3242de674d31a752d703c79a203a7e7c9b2b2` | Oui |
| `d782cbd` | `d782cbd5f77faa5ef93edfe6dd76d0d6a5d7196e` | Oui |
| `ee50313` | `ee50313b70896aa84462c50bf7be61ce80be7b9c` | Oui |

## Entrées identifiées de MEP-013 : réutilisation pour MEP-045

Comparaison SHA-256 de contenu UTF-8 normalisé LF, selon le protocole du
[manifeste historique](../../../../docs/quality/mep-013/sources.md).
**26 entrées : 19 identiques, 7 modifiées.** Le hook de sauvegarde est inchangé ; le dialogue,
sa feuille de style et plusieurs tests ont évolué. La conformité actuelle ne peut donc pas être
cochée intégralement à partir de la seule campagne historique MEP-013.
Les preuves de refus déjà inspectées expliquent l’acquis et les cas de contrôle ; la clôture de
MEP-045 doit rapprocher les changements et la sélection exacte, puis qualifier les preuves nécessaires.
Aucune péremption temporelle n’est appliquée : c’est le changement d’entrée qui compte.

| Entrée | Correspondance au manifeste MEP-013 |
| --- | --- |
| [frontend/src/EvaluationTakingDialog.tsx](../../../../frontend/src/EvaluationTakingDialog.tsx) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/src/EvaluationScoreInput.tsx](../../../../frontend/src/EvaluationScoreInput.tsx) | Identique |
| [frontend/src/TakingContentSizing.tsx](../../../../frontend/src/TakingContentSizing.tsx) | Identique |
| [frontend/src/TakingStatusSizing.tsx](../../../../frontend/src/TakingStatusSizing.tsx) | Identique |
| [frontend/src/useEvaluationTaking.ts](../../../../frontend/src/useEvaluationTaking.ts) | Identique |
| [frontend/src/evaluation-taking.css](../../../../frontend/src/evaluation-taking.css) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/src/evaluation-rating.css](../../../../frontend/src/evaluation-rating.css) | Identique |
| [frontend/src/AppreciationScale.tsx](../../../../frontend/src/AppreciationScale.tsx) | Identique |
| [frontend/src/appreciationForScore.ts](../../../../frontend/src/appreciationForScore.ts) | Identique |
| [frontend/src/evaluationRuns.ts](../../../../frontend/src/evaluationRuns.ts) | Identique |
| [frontend/src/TakingFocus.test.tsx](../../../../frontend/src/TakingFocus.test.tsx) | Identique |
| [frontend/src/EvaluationScoreInput.test.tsx](../../../../frontend/src/EvaluationScoreInput.test.tsx) | Identique |
| [frontend/src/EvaluationTakingNavigation.test.tsx](../../../../frontend/src/EvaluationTakingNavigation.test.tsx) | Identique |
| [frontend/e2e/evaluation-explicit-rating.spec.ts](../../../../frontend/e2e/evaluation-explicit-rating.spec.ts) | Identique |
| [frontend/e2e/rating-values.ts](../../../../frontend/e2e/rating-values.ts) | Identique |
| [frontend/e2e/rating-revision.ts](../../../../frontend/e2e/rating-revision.ts) | Identique |
| [frontend/e2e/evaluation-rating-refusal.spec.ts](../../../../frontend/e2e/evaluation-rating-refusal.spec.ts) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/e2e/evaluation-rating-focus.spec.ts](../../../../frontend/e2e/evaluation-rating-focus.spec.ts) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/e2e/evaluation-rating-scale.spec.ts](../../../../frontend/e2e/evaluation-rating-scale.spec.ts) | Identique |
| [frontend/e2e/evaluation-taking-layout.spec.ts](../../../../frontend/e2e/evaluation-taking-layout.spec.ts) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/e2e/dialog-taking-accessibility.spec.ts](../../../../frontend/e2e/dialog-taking-accessibility.spec.ts) | Identique |
| [frontend/e2e/taking-typography.spec.ts](../../../../frontend/e2e/taking-typography.spec.ts) | Identique |
| [frontend/e2e/appreciation-markers.spec.ts](../../../../frontend/e2e/appreciation-markers.spec.ts) | Identique |
| [frontend/e2e/evaluation-versions.spec.ts](../../../../frontend/e2e/evaluation-versions.spec.ts) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/demo-e2e/appreciation-markers.spec.ts](../../../../frontend/demo-e2e/appreciation-markers.spec.ts) | Modifiée — résultat historique non transposable sans analyse |
| [frontend/audits/taking-zoom.audit.ts](../../../../frontend/audits/taking-zoom.audit.ts) | Identique |

Les empreintes attendues demeurent dans le manifeste historique, sans réécriture. Les empreintes
actuelles sont recalculables depuis le SHA complet de la base ci-dessus. Les changements de dialogue
et transitions ne démontrent pas en eux-mêmes une régression de sauvegarde ; ils empêchent seulement
de présenter une campagne ancienne comme validation exacte de toutes les entrées courantes.
