# Réutilisabilité consolidée — MEP-045, MEP-047 et MEP-048

Base de comparaison `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`, contrôle documentaire du 2026-10-28.
[Sortie 045](sortie-mep-045.md) · [Sortie 047](sortie-mep-047.md) · [Sortie 048](sortie-mep-048.md).
Contenus UTF-8 normalisés LF comparés par `git show` et lecture des fichiers du worktree propre de code.
Les sélections ci-dessous sont explicites ; elles ne prétendent pas identifier seules toute fermeture
transitive des entrées applicatives/runtime/données/navigateur d’une preuve de validation.
Une égalité de fichier autorise le rapprochement de son assertion, jamais la transposition automatique
 d’un rapport complet. Une différence impose l’analyse de l’impact ou une qualification ciblée.
Aucun test applicatif exécuté, aucun résultat CI actuel interrogé ou supposé dans ce contrôle.

## MEP-045

Appui historique MEP-013, pas une cl?ture de 045. Référence exacte : `ee50313b70896aa84462c50bf7be61ce80be7b9c`.
4/10 entrées de la sélection identiques ; les autres sont nouvelles ou modifiées.

| Entrée sélectionnée | Comparaison à la référence | SHA-256 du contenu courant normalisé LF |
| --- | --- | --- |
| [frontend/src/useEvaluationTaking.ts](../../../../frontend/src/useEvaluationTaking.ts) | Identique | `54eb229fdefa9ab6d3af38a29c3283f337d763a475d8577455d0bf0ac697ed4b` |
| [frontend/src/EvaluationTakingDialog.tsx](../../../../frontend/src/EvaluationTakingDialog.tsx) | Modifiée | `8225614a668f87d40d523d5a1265ebbe04511bff0937fe2ac7f9cd5811c799e2` |
| [frontend/src/evaluationRuns.ts](../../../../frontend/src/evaluationRuns.ts) | Identique | `12896fab9051bebdc304f0b772cea79a8bd1ec19486c9c863b879543186494c8` |
| [frontend/src/evaluation-taking.css](../../../../frontend/src/evaluation-taking.css) | Modifiée | `564c1b8fd57c448e7406ba9e06ca55b8267529460426a2a7699cef4bb778bfb8` |
| [frontend/src/transitions.css](../../../../frontend/src/transitions.css) | Absente à la référence | `b7746f9dd2dc7b97e8fc36be152cfd53ceacd56c279c51fc5f57603cf091b202` |
| [frontend/src/EvaluationTakingDialog.test.tsx](../../../../frontend/src/EvaluationTakingDialog.test.tsx) | Identique | `ac3ceaa7d5b6cb1fa3a98ce0e9b9dc94768bc626f44306a673e6fb8e968f3311` |
| [frontend/e2e/dialog-taking-accessibility.spec.ts](../../../../frontend/e2e/dialog-taking-accessibility.spec.ts) | Identique | `516fe64dfbd57ad7ef9c953ddb2c823fe0d5b06345487dd991146fad88118028` |
| [frontend/e2e/evaluation-taking-layout.spec.ts](../../../../frontend/e2e/evaluation-taking-layout.spec.ts) | Modifiée | `4575632a40fc5429641dc347127c6aa0a909d9a06afb2b77357ffe4bfc8b192d` |
| [frontend/e2e/evaluation-rating-refusal.spec.ts](../../../../frontend/e2e/evaluation-rating-refusal.spec.ts) | Modifiée | `3bbcd56ff182e05143489387ca289fa49fef7bf3081672597b523a9a6f466abd` |
| [frontend/src/ProductShell.tsx](../../../../frontend/src/ProductShell.tsx) | Modifiée | `ca3e10fc6fb94d5951a125f493c6e3e7f74958357ccbafd66b4439b7675ad44a` |

## MEP-047

Appui voisin MEP-046 et contrats Results, pas une cl?ture de 047. Référence exacte : `381a28978b14f9e9aae32add4fe0ed3a30ad46fa`.
2/12 entrées de la sélection identiques ; les autres sont nouvelles ou modifiées.

| Entrée sélectionnée | Comparaison à la référence | SHA-256 du contenu courant normalisé LF |
| --- | --- | --- |
| [frontend/src/useResultSelection.ts](../../../../frontend/src/useResultSelection.ts) | Modifiée | `d1fd6dc8c0360186596db160ad229f4778998828c8eab5207a1be36126661bfc` |
| [frontend/src/ResultsViews.tsx](../../../../frontend/src/ResultsViews.tsx) | Modifiée | `6705bb9c77fcbee308eabf553181a180b5bb69cdad56fc7db22b88ccd48212eb` |
| [frontend/src/ResultsHistory.tsx](../../../../frontend/src/ResultsHistory.tsx) | Modifiée | `4a952a87d72ae10378485ca6b3bdce0962ecc6c8e6146cf13bba4d230df4e6d7` |
| [frontend/src/results.ts](../../../../frontend/src/results.ts) | Modifiée | `fbde8b104baaf86d278d2b7024d1cc8a7a7b80599c618af1987bdb0d84b2d977` |
| [frontend/src/ResultsScoreGuide.tsx](../../../../frontend/src/ResultsScoreGuide.tsx) | Modifiée | `f52a5da0cbd0596bec9095f1fe9414235a341d6e8442a4da39de71246dc4c906` |
| [backend/assessments/application/results.py](../../../../backend/assessments/application/results.py) | Identique | `ee5feab7fa4767642aa4fa9eabb91dcb5c5a176e49d83bba7e4b9fe459ca949b` |
| [backend/assessments/application/result_history.py](../../../../backend/assessments/application/result_history.py) | Modifiée | `1e31fed17b07d51a9b69123ad1f7ab013966efc023a0345c491911c136da9fe2` |
| [frontend/src/ResultsLongitudinal.test.tsx](../../../../frontend/src/ResultsLongitudinal.test.tsx) | Modifiée | `2c55dff97a0990d95d05c423e9ed36c13b82b3ef5b43c56ac6481def91c1bf40` |
| [frontend/src/ResultsArchivedVersions.test.tsx](../../../../frontend/src/ResultsArchivedVersions.test.tsx) | Absente à la référence | `580f280af7aae5c9d8a48f4477a95e747799fa3e43e15f568ad4c3a3b4a02c70` |
| [frontend/e2e/results-longitudinal.spec.ts](../../../../frontend/e2e/results-longitudinal.spec.ts) | Identique | `e2033611f426001aafcd97c4c7ba68d1b4f255361c5e87dfb5b15c30d41b24d8` |
| [frontend/e2e/results-archived-versions.spec.ts](../../../../frontend/e2e/results-archived-versions.spec.ts) | Absente à la référence | `9310b933d20604db4b66f9ab11a63e19a04f91b72fbc354e206710dda90229fa` |
| [frontend/src/ProductShell.tsx](../../../../frontend/src/ProductShell.tsx) | Modifiée | `ca3e10fc6fb94d5951a125f493c6e3e7f74958357ccbafd66b4439b7675ad44a` |

## MEP-048

Code initial STEER-001 ; r?f?rence de contenu, pas preuve de cl?ture 048. Référence exacte : `51574e0d43db13be0377ceb31eb0ac6de4f21d1d`.
3/12 entrées de la sélection identiques ; les autres sont nouvelles ou modifiées.

| Entrée sélectionnée | Comparaison à la référence | SHA-256 du contenu courant normalisé LF |
| --- | --- | --- |
| [backend/assessments/application/steering.py](../../../../backend/assessments/application/steering.py) | Identique | `e9b2f5d0dd31e9bcdddd6ab82bd4663ee1776d12dc3ef37f479b4024229bafa7` |
| [frontend/src/SteeringSummary.tsx](../../../../frontend/src/SteeringSummary.tsx) | Modifiée | `dd63eef31a94cfb16354162a0bf9cc0258e02df4b50f9a31f54fd22d80bc9a04` |
| [frontend/src/SteeringTeams.tsx](../../../../frontend/src/SteeringTeams.tsx) | Modifiée | `f69e0c1d47d5fe9c6e86b3a01644fc19a0b867d3c0425802fe349835d7d5b9f1` |
| [frontend/src/SteeringPage.tsx](../../../../frontend/src/SteeringPage.tsx) | Modifiée | `7fee075cf43ea42062651d28bec6d67fa7f362fc0131b1d3550a30949783df61` |
| [frontend/src/ResultsIntent.test.tsx](../../../../frontend/src/ResultsIntent.test.tsx) | Identique | `7e4d459e47f7727f4fbfc0ffb64f1be28950902e31a9c84e5d7f887f2b6beace` |
| [frontend/src/useResultSelection.ts](../../../../frontend/src/useResultSelection.ts) | Modifiée | `d1fd6dc8c0360186596db160ad229f4778998828c8eab5207a1be36126661bfc` |
| [frontend/src/dateTime.ts](../../../../frontend/src/dateTime.ts) | Absente à la référence | `a5808c99f77047503d16fcb31ac321bb34ea97debb29c8c39d9f0a6d7be7abdd` |
| [frontend/src/ProductShell.tsx](../../../../frontend/src/ProductShell.tsx) | Modifiée | `ca3e10fc6fb94d5951a125f493c6e3e7f74958357ccbafd66b4439b7675ad44a` |
| [frontend/src/DashboardActivity.tsx](../../../../frontend/src/DashboardActivity.tsx) | Absente à la référence | `f6811ad81fa6024cf42ff73f1b87c316c8bc149b4d71f1e284f776f1dea5b78a` |
| [backend/tests/test_steering.py](../../../../backend/tests/test_steering.py) | Identique | `9274c00219a35b899df0fbc1e5c74e72425fbaee274e13df1f59b88278d5abf4` |
| [frontend/src/SteeringPage.test.tsx](../../../../frontend/src/SteeringPage.test.tsx) | Modifiée | `9dc73f22f69af71d8c353f50317e90b4727ad497a1add635e47a1e568f1caef8` |
| [frontend/e2e/steering.spec.ts](../../../../frontend/e2e/steering.spec.ts) | Modifiée | `7d0befd4629fcc5201dccdf363f734545771c0f39d892ae6d61cf926bebca2e3` |

Les trois dossiers de sortie nomment les cellules réellement manquantes : résultats attribués au SHA,
refus et observations serveur/visuelles. Les campagnes historiques restent intégrées ; elles ne sont
ni annulées par le temps ni transformées en recette esthétique/cible. Si une preuve exacte du même
scénario et des mêmes entrées est retrouvée, la référencer au lieu de la rejouer sans raison.
