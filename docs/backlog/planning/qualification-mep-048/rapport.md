# MEP-048 — rapport consolidé et clôture approuvée

2026-11-02, Codex. Qualification initiale, complémentaire et correction rapprochées.
**Les trois scénarios de correction sont conformes ; clôture approuvée par l’utilisateur le 2026-11-03.**
Le correctif `79efb0d` et sa CI sont verts ; [décision, registre et bilan de clôture](cloture.md).
L’acceptation MESS et le GO/NO-GO restent des décisions distinctes.

## Périmètre et traçabilité

- [Source canonique FEAT-055 / MEP-048](../../source/mess/f07.md).
- [Rapport initial](rapport-initial.md), [rapport complémentaire avant correction](rapport-complementaire.md),
  [écarts B01/B02](ecarts-residuels.md), [causes, correction et rouge/vert](correction.md).
- [Rapprochement des worktrees](rapprochement.md), [preuves conservées](preuves-correction.md).
- Base de correction : `009696341f401eb92235b3723a27290f8b2dfb29`, issue d’origin/main.
  L’intégration utilise le circuit `npm run publish` ; son journal identifie le SHA exact publié.
- Diff applicatif : uniquement `frontend/src/steering.css`, trois règles propres à Pilotage.
  Nouveau test : `frontend/e2e/steering-readability.spec.ts`.
- Aucun nouveau calcul, dépendance, endpoint, droit, filtre ou score ; backend, Dashboard,
  composants Results et composant partagé CollectionFrame inchangés.

## Scénarios de correction

| Scénario | Attendu | Observé rouge | Observé vert | Preuve / verdict |
| --- | --- | --- | --- | --- |
| 1 — clavier mobile jusqu’à A1 | Note des états accessible et lisible | Note à x=−554 px dans les deux thèmes | x=16 px ; note 358×120 entièrement accessible par scroll vertical, sans mouvement horizontal ; lien A1 et navigation Results conservés | red-mobile.log, green.log, géométries et captures B01 ; conforme |
| 2 — 1280×720, définitions ouvertes | Ligne sans résultat visible ou accessible par défilement | Seulement 72/105 px et cellules occultées par l’en-tête | Huit cellules cadrées, 105/105 px, hit-tests sans occultation ; « Jamais évaluée », nulls et absence de lien conservés | red-final.log, green.log, géométries et captures B02 ; conforme |
| 3 — information essentielle masquée | Refuser le scénario si aucun accès exploitable | Les tests échouent sur cadrage/intersection/occultation malgré la présence des textes dans le DOM | Les mêmes assertions passent après correction ; les deux thèmes sont vérifiés | Tests rouge/vert versionnés ; refus de non-conformité effectivement discriminant |

Définitions ouvertes, la page gère la hauteur de contenu ; seul le tableau défile horizontalement.
Définitions fermées, la collection reste bornée avec sa pagination visible. Aucune hauteur arbitraire ajoutée. Les autres collections conservent leurs règles partagées.
Les captures stabilisées ont été relues ; la superposition ancienne de transition n’est pas utilisée comme preuve verte.

## Matrice canonique consolidée attendu / observé / preuve / verdict

Les acquis ne sont pas renommés en exécutions du nouveau candidat. Leur portée/SHA est conservée ;
le correctif de présentation et ses impacts sont validés séparément.

| Critère ou refus canonique | Attendu | Observé consolidé | Preuve | Verdict proposé |
| --- | --- | --- | --- | --- |
| Couverture reliée aux faits | Actives du scope ; résultats accessibles ; archives exclues ; absence distincte de 0 | J1 historique 4/2/2 ; J2 vide 0/0/0 ; J3 1/0/1. La ligne sans résultat est désormais lisible avec l’aide ouverte | jeu-fixe.md, complement.md, B02 rouge/vert | Conforme dans le périmètre qualifié |
| Complétions reliées aux sources | Date initiale/version/run ; révision séparée ; activité bornée accessible | Sources A1/A2 exactes et notes zéro réelles ; révision distincte ; lien réel conservé après correction ; aucun code de date/calcul changé | Q2 acquis, validations initiales, nouveau test mobile et E2E requis | Conforme |
| Retards reliés aux échéances | due_date strictement avant D ; jamais évaluée prioritaire ; À jour sans jugement de qualité | Faits et bornes déjà qualifiés ; note expliquant les états reste cadrée après Tab vers A1 dans les deux thèmes | J1/B1 acquis, B01 rouge/vert, captures | Conforme |
| Explications actionnables vers Results, sans nouveau calcul | Définitions lisibles ; source exacte ou absence explicite sans substitution | Cinq cartes/définitions présentes ; navigation et refus Q2 acquis ; note et ligne désormais accessibles ; aucun filtre ou calcul ajouté | complement.md Q1/Q2, correction.md, E2E requis | Conforme |
| Refus classement individuel | Aucun classement de performance utilisateur/Coach | Textes et projections inchangés ; rôles Dashboard et refus Pilotage qualifiés ; seulement une correction de scroll | Acquis B1/B2/R1/Q3, diff CSS et tests requis | Refus respecté |
| Refus score global Pilotage | Aucune moyenne ou note globale | Quatre comptes et une date ; aucune évolution de projection ni calcul Results | Acquis projection/contrat, diff borné | Refus respecté |
| Refus indicateur sans provenance | Organisation/date/faits accessibles ; absences explicites ; aucun droit élargi | Contexte et sources acquis ; 403/404 réels déjà observés ; textes d’absence désormais accessibles ; droits inchangés | Q2/Q3 acquis, B02 et parcours requis | Refus respecté |

## Réutilisation et validations

- Audit initial : 46 tests backend, 27 assertions React et 9 E2E réussis sur le SHA 2d9b6c3.
- Complément : parcours connectés Q1–Q3 sur 826cc51, avec les deux écarts documentés avant correction.
- Correction : les deux rouges mobiles portent sur x=−554 ; les deux rouges de ligne sur 72/105 px
  et l’occultation. La passe verte initiale : **4 tests passés en 35,4 s**.
- Dépendants React du CSS : **15 fichiers / 88 assertions passés**.
- Statiques frontend : lint, Prettier et typecheck requis par le plan.
- Gate local final réussi : **116 E2E réels (18,3 min), 10 E2E démo (40 s)**, statiques et 88 assertions React ; build de production réussi. Aucun pytest ajouté sans impact backend.
- Le pré-push et la CI du SHA exact restent bloquants ; aucun `--no-verify`, aucune PR.
- Les résultats définitifs de campagne sont conservés dans le journal du lot et la preuve de publication.

Revue documentaire réalisée : README annoncé avant le travail, règles, charte, DoD, stratégie,
fondamentaux, API et contrats Dashboard/Pilotage/Results ; documentation du scroll et tests mise à jour.
Pas de migration ni d’API nouvelle/modifiée ; seuils globaux de couverture inchangés.
Une sélection partielle ne vaut ni coverage exhaustif ni qualification MESS.

## Décision motivée

Les manques de navigation/rôles avaient été levés par la qualification complémentaire.
B01/B02 sont maintenant corrigés par une évolution de présentation bornée, couverte en rouge/vert
et relue dans les deux thèmes. Aucun nouvel indicateur ou arbitrage métier n’a été introduit.

**Clôture approuvée le 2026-11-03 sur ce rapport et le correctif `79efb0d` publié avec CI verte.**
Le registre canonique porte « Réalisé » à cette date ; les vues dérivées sont synchronisées dans le lot documentaire.
La consolidation ne transforme pas la conformité technique en acceptation métier MESS.
