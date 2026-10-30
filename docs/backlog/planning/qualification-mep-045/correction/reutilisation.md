# Réutilisation des sept critères conformes

Base `029857a96b730aaf6357c123b429860f56e445a0`, 2026-10-30, Codex.
`git diff` ne modifie aucune des entrées ci-dessous : contenu identique à la base.
Le seul delta applicatif est le gestionnaire keydown de cinq lignes du dialogue.
Il ne modifie ni rendu, messages, styles, données, file de requêtes, contrat, révision ou finalisation.

| Entrée conservée | SHA-256 UTF-8 / LF |
| --- | --- |
| frontend/src/useEvaluationTaking.ts | 54eb229fdefa9ab6d3af38a29c3283f337d763a475d8577455d0bf0ac697ed4b |
| frontend/src/evaluationRuns.ts | 12896fab9051bebdc304f0b772cea79a8bd1ec19486c9c863b879543186494c8 |
| frontend/src/evaluation-taking.css | c8d6ce4e3cd4fdee749617b12c3bee4c548e8736f4011e885d2dcb38377d88f1 |
| frontend/src/EvaluationScoreInput.tsx | a57d914b69b1c199dcd6f6de30b87bfae094c33f35a291fe4bda60dbaed66224 |
| frontend/src/TakingStatusSizing.tsx | de44045d4736690d945b3c1d9e16cf2d10f3e4419292d63e3c917f7ba27b5548 |
| frontend/src/useModalFocus.ts | 139fcea7e6644312dcf244d9724b4d631d1b31598ade837e11f5714a71af3b99 |
| frontend/src/dialogTransition.ts | d4825e7cd9d7d87dbb6a0f8e0886ce9539f0e8f077100483130deb81977ac99f |

Les [preuves initiales](../qualification-initiale.md) des critères 1–7 sont conservées avec leur date et SHA.
Elles ne sont pas revendiquées comme une nouvelle exécution globale sur un dialogue inchangé :
la différence Échap est isolée, reproduite puis retestée avec état React, réseau, serveur et focus.
Les gates obligatoires restent indépendants de cette justification de réutilisation de recette.
