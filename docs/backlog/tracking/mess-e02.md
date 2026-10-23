# Registre canonique MESS — EPIC-012 — Expérience utilisateur

Section du [registre canonique unique](pbis.md), selon la [gouvernance](../governance.md).
Les repères E/F et NN.NN sont des alias de navigation, pas de nouveaux identifiants.
Les tailles sont des recommandations XS/S ; aucun modèle n’est affecté.
Ouvert ne signifie pas prêt : consulter les dépendances de la source et le [plan](../planning/pre-mep.md).
Ordres U/I/C : recommandations du plan, sans statut ni dépendance technique supplémentaire ; dates et preuves conservées.
Aucun blocage supplémentaire constaté ; les arbitrages métier existants restent dans leur registre.

| Repère | PBI et source | Feature parente | Taille recommandée | Modèle Codex recommandé | Statut | Blocage ou preuve | Date de réalisation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 05.01 | [MEP-044 — Clarifier l’affichage des notes et de leur échelle](../source/mess/f05.md) | FEAT-053 — Expérience de notation | XS | À définir | Réalisé | [Audit UX-07 et preuves](../../quality/mep-044/README.md) ; pre-push exhaustif et [CI du SHA `1e22be2`](https://github.com/GaranceRichard/assess-teams/actions/runs/39967554796) verts | 2026-10-23 |
| 05.02 | [MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md) | FEAT-053 — Expérience de notation | S | À définir | Ouvert | U2 : curseur après MEP-044 par choix d’ordre ; prérequis acquis | N/A |
| 05.03 | [MEP-045 — Confirmer visuellement l’enregistrement de la notation](../source/mess/f05.md) | FEAT-053 — Expérience de notation | XS | À définir | Ouvert | U2 : sauvegarde après curseur par choix d’ordre ; prérequis acquis | N/A |
| 06.01 | [MEP-014 — Améliorer la hiérarchie visuelle des résultats](../source/mess/f06.md) | FEAT-054 — Résultats et comparaisons | S | À définir | Réalisé | [Audit et preuves avant/après](../../quality/results-hierarchy.md) ; contexte et provenance autorisée, vingt apparences et formats UX ; pre-push et [CI du SHA `2fbfb9e`](https://github.com/GaranceRichard/assess-teams/actions/runs/40031289203) verts | 2026-10-23 |
| 06.02 | [MEP-046 — Clarifier les scores et les indicateurs](../source/mess/f06.md) | FEAT-054 — Résultats et comparaisons | XS | À définir | Ouvert | U3a : expliquer les scores, puis radar ; prérequis acquis | N/A |
| 06.03 | [MEP-015 — Améliorer la présentation des graphiques radar](../source/mess/f06.md) | FEAT-054 — Résultats et comparaisons | S | À définir | Ouvert | U3a : labels/légende/alternative du radar ; prérequis acquis | N/A |
| 06.04 | [MEP-047 — Améliorer les comparaisons entre équipes et évaluations](../source/mess/f06.md) | FEAT-054 — Résultats et comparaisons | S | À définir | Ouvert | U3a : comparaison et filtres après lisibilité ; prérequis acquis | N/A |
| 07.01 | [MEP-016 — Harmoniser le vocabulaire du tableau de bord](../source/mess/f07.md) | FEAT-055 — Pilotage et tableau de bord | XS | À définir | Ouvert | U3b : vocabulaire ; parallèle aux résultats ; prérequis acquis | N/A |
| 07.02 | [MEP-048 — Clarifier les indicateurs et leur interprétation](../source/mess/f07.md) | FEAT-055 — Pilotage et tableau de bord | S | À définir | Ouvert | U3b : interprétation après vocabulaire par choix d’ordre ; prérequis acquis | N/A |
| 08.01 | [MEP-017 — Adapter les tableaux et contenus aux petits écrans](../source/mess/f08.md) | FEAT-056 — Responsive et états d’interaction | S | À définir | Ouvert | U4 : responsive anticipable après cadrage UX ; prérequis acquis | N/A |
| 08.02 | [MEP-049 — Améliorer la navigation mobile et les interactions tactiles](../source/mess/f08.md) | FEAT-056 — Responsive et états d’interaction | S | À définir | Ouvert | U4 : navigation et tactile ; prérequis acquis | N/A |
| 08.03 | [MEP-018 — Améliorer les états de chargement](../source/mess/f08.md) | FEAT-056 — Responsive et états d’interaction | XS | À définir | Ouvert | U4 : attente et réponses obsolètes ; prérequis acquis | N/A |
| 08.04 | [MEP-050 — Améliorer les états vides](../source/mess/f08.md) | FEAT-056 — Responsive et états d’interaction | XS | À définir | Ouvert | U4 : vides distincts des erreurs ; prérequis acquis | N/A |
| 08.05 | [MEP-051 — Améliorer la présentation des erreurs](../source/mess/f08.md) | FEAT-056 — Responsive et états d’interaction | S | À définir | Ouvert | U4 : erreurs et reprise sans perte ; prérequis acquis | N/A |
| 09.01 | [MEP-019 — Corriger les contrastes et la lisibilité du thème clair](../source/mess/f09.md) | FEAT-057 — Cohérence visuelle et thèmes | S | À définir | Réalisé | [Audit UX-02/03/04 et preuves](../../quality/light-theme.md) ; dix palettes ; pre-push et [CI du SHA `6383e45`](https://github.com/GaranceRichard/assess-teams/actions/runs/39778904027) verts | 2026-10-22 |
| 09.02 | [MEP-052 — Harmoniser le thème sombre](../source/mess/f09.md) | FEAT-057 — Cohérence visuelle et thèmes | XS | À définir | Réalisé | [Audit et preuves](../../quality/dark-theme.md) ; dix palettes, clair et préférences préservés ; pre-push et CI verte du SHA `d782cbd` | 2026-10-21 |
| 09.03 | [MEP-053 — Harmoniser la typographie et la hiérarchie visuelle](../source/mess/f09.md) | FEAT-057 — Cohérence visuelle et thèmes | S | À définir | Réalisé | [Audit et preuves UX-01/05](../../quality/typography.md) ; pre-push exhaustif et [CI du SHA `a623caf`](https://github.com/GaranceRichard/assess-teams/actions/runs/39706576513) verts | 2026-10-21 |
