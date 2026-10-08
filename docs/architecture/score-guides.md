# Repères d’appréciation configurables — EVAL-004

## Règles métier

Un repère associe un texte libre non vide à un score entier 0–10 d’une question de version exacte.
La liste peut être vide ; tous les niveaux sont facultatifs, sans série prédéfinie ni interpolation.
Un seul texte existe par score/question. L’éditeur peut appliquer le même texte à plusieurs niveaux.
Ces repères guident le Coach sans modifier une note, un radar ou les calculs longitudinaux.
Seuls Admin de l’organisation et Superadmin éditent les DRAFT ; VALIDATED/ARCHIVED sont immuables.
L’organisation est héritée de question → version → organisation, avec les scopes/verrous existants.

## Persistance et conservation

`QuestionScoreGuide(question, score, text)` réutilise SQLite et les questions versionnées existantes.
Contraintes DB : unicité question/score, entier borné 0–10 et texte non vide ; l’API refuse aussi
espaces seuls, mauvais types, objets incomplets et doublons avant toute mutation.
Le remplacement de liste est atomique avec le nom et le Journal d’activité. Les mutations et copies
prennent le même verrou d’organisation que le lifecycle pour préserver une source cohérente.
Une nouvelle version copie les lignes de repères vers ses nouvelles questions, avec de nouveaux IDs.
Supprimer un brouillon ou sa question supprime ses repères par cascade ; les références historiques
restent protégées par les FK de passation et l’immutabilité API existantes.

Au premier démarrage, `EvaluationRunQuestion.score_guides` reçoit une liste JSON `{score, text}`
triée, indépendante de la source. La FK source et la FK exacte de version restent présentes.
Reprise/finalisation/consultation/révision utilisent uniquement ce snapshot ; aucune reconstruction,
lecture de v2 ou recalcul de résultat historique n’intervient. Une nouvelle passation fige sa propre liste.
La migration `assessments.0015` initialise les anciens snapshots avec `[]` : les appréciations
n’existaient pas lors de ces passations, donc aucun texte n’est inventé ni rétroactivement ajouté.
IDs, scores, états, provenance et journaux sont conservés.

## Contrats et interface

[API des modèles](evaluations-api.md#repères-facultatifs--eval-004) : champ `score_guides` facultatif
dans POST/PUT avec `name` ; omission conserve, `[]` efface, liste fournie remplace ; réponse triée.
[Passation](evaluation-taking.md#appréciations-applicables) : même contrat read-only dans ses questions.
`drf-spectacular` partage `ScoreGuide` (score integer min 0/max 10, texte string min 1).

`QuestionPanel` compose `QuestionGuides`, un details par question, liste et formulaire multi-niveaux.
`EvaluationPage` utilise l’adapter PUT existant ; le brouillon de démo utilise son store local.
`EvaluationTakingDialog` compose `EvaluationScoreScale` : range existant, onze niveaux cliquables,
marque visible des niveaux configurés au-dessus du range, aria-valuetext et texte sélectionné dans une région live.
Cette disposition laisse le curseur accessible quand une infobulle est ouverte.
Les boutons reçoivent le focus et s’activent avec Entrée/Espace ; le mobile affiche le texte par tap.
La consultation immuable conserve l’accès aux textes tout en refusant les changements de notes.

`ScoreGuideLevel` affiche un popover manuel natif dans la top layer de la modale : le scroll interne
ne le coupe pas. Sa position fixe est calculée au-dessus du niveau, bornée au viewport ; les longs textes
se replient et leur hauteur est bornée à l’espace disponible. Blur, Escape, scroll et resize le ferment.
Le texte persistant demeure lisible sans hover. Les tokens existants suivent les dix palettes et deux thèmes.

## Preuves et revue documentaire

Backend : `test_score_guides`, `test_score_guide_history`, `test_score_guide_migration`,
`test_score_guide_openapi` couvrent CRUD/refus, DB, scopes, audit, copie, historique et contrat.
React : `QuestionGuides.test`, `EvaluationScoreScale.test`, `ScoreGuideTooltip.test` et
`demo/scoreGuides.test` couvrent
API/composants, erreurs, niveaux manquants, focus/survol/tap, lecture seule et snapshot fictif.
Playwright : `evaluation-versions.spec.ts` protège v1 après v2 et réutilise `score-guide-assertions`
avec le build Pages ; géométrie, popover top layer, clavier et mobile sont vérifiés en navigateur réel.
Les suites Results/radar/longitudinal existantes restent les preuves des calculs inchangés.

README, règles agents, charte qualité, DoD, stratégie, inventaire, fondamentaux, contrat API,
modèles, versionnement, passation, démo et backlog ont été revus. Les règles qualité, gates et
l’architecture React/Django/SQLite restent applicables sans nouvelle dépendance.
