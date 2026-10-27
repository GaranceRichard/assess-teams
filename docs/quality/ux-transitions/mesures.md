# Mesures de mouvement Chromium

Recette du 2026-10-27 sur `37ea6d7`, resynchronisé sur `e957c09`.
Windows, Chromium Playwright ; animations à vitesse réelle, sans horloge simulée.

Les JSON sont produits par `motion-evidence.ts` et joints aux résultats Playwright.
Chaque première mesure provient de l’animation effectivement démarrée ; les suivantes
proviennent de `requestAnimationFrame`, jusqu’à sa fin naturelle.

| Largeur | Mouvement | Transitions | Durée ms | Échantillons | Première translation px | Opacité initiale | Écart fixe max px |
| --- | --- | ---: | ---: | --- | --- | --- | ---: |
| 375 | Rubrique | 40 | 180 | 11–11 | 5.100 à 5.106 | 0.149 à 0.150 | 0 |
| 375 | Dialogue | 20 | 180 | 11–12 | 5.100 à 5.105 | 0.149 à 0.150 | — |
| 375 | Suivant | 20 | 230 | 14–14 | 10.580 à 10.586 | 0.118 à 0.118 | 0 |
| 375 | Précédent | 39 | 230 | 14–14 | -10.588 à -10.579 | 0.118 à 0.118 | 0 |
| 1366 | Rubrique | 40 | 180 | 11–11 | 5.100 à 5.106 | 0.149 à 0.150 | 0 |
| 1366 | Dialogue | 20 | 180 | 11–12 | 5.101 à 5.104 | 0.149 à 0.150 | — |
| 1366 | Suivant | 20 | 230 | 14–14 | 10.579 à 10.587 | 0.118 à 0.118 | 0 |
| 1366 | Précédent | 39 | 230 | 14–14 | -10.587 à -10.579 | 0.118 à 0.118 | 0 |

238 transitions mesurées sur les deux matrices. Toutes finissent à opacité 1 et
translation nulle ; amplitude décroissante sans dépassement. Les valeurs fixes comparent
cadre/titre/pied/action de sauvegarde pour les questions, sidebar/header pour les pages.
L’ouverture du dialogue anime volontairement sa surface ; elle n’est pas comptée fixe.

Le parcours de réduction des animations n’observe aucun `animationstart` de ces transitions.
Aucune animation supplémentaire sur sélection, sauvegarde, refus, réessai ou actualisation de collection.

Zoom natif : DPR 2, viewport CSS 712 × 452, zoom CSS 1, pincement 1.
Les actions restent dans le viewport et le focus rejoint le titre de question.

La [vidéo de référence](zoom-200.webm), capturée avant le correctif de curseur,
montre les mêmes transitions à 200 % dans les deux thèmes. Les mesures ci-dessus sont
reprises après intégration de ce correctif ; les vidéos fraîches sont jointes aux runs Playwright.

Les cinq scénarios ciblés passent en 2,5 min ; les huit refus de géométrie passent en 1,1 min.
La validation exhaustive finale relève du pré-push canonique et de la CI du SHA publié.
La [CI du dépôt](https://github.com/GaranceRichard/assess-teams/actions/workflows/quality.yml)
conserve les rapports de l’état publié.
