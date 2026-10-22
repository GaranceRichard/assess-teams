# MEP-044 — Notes et échelle

Audit du 2026-10-22 par Codex, selon [F05](../../backlog/source/mess/f05.md),
[UX-07](../ux-acceptance.md) et la [DoD](../definition-of-done.md).
Référence : `f327f71` sur origin/main ; branche `codex/mep-044-notation`, worktree isolé.
Jeu fictif `taking-fixture.ts`, Coach ; `evaluation-versions` utilise son Admin fictif.
Chromium sur Windows, zoom 100 %, palette Vert pour les captures, dix palettes pour les mesures.

## Audit et décisions

| Point | Constat avant | Décision et comportement attendu |
| --- | --- | --- |
| Échelle entière | Min/max/step seulement sur l’input ; aucune borne visible sans note | Afficher « Échelle entière de 0 à 10 », incluse dans `aria-describedby` |
| Repère inférieur | Une note 6 affiche « Repère pour 6 » et le descriptif du repère 5 | Afficher « Repère 5 / 10 » ; note choisie toujours 6, texte exact du snapshot |
| Absence | « Aucune note sélectionnée », poignée masquée, `aria-valuetext` explicite ; focus sans écriture | Acquis conservé ; zéro sélectionné possède poignée et libellé « Note sélectionnée : 0 / 10 » |
| Note choisie | Valeur `/ 10`, sortie live et valeur accessible déjà présentes | Acquis conservé, aucun changement du contrôle ou de la sauvegarde |
| Référentiel absent | Aucun descriptif sans note, sans repères ou sous la première borne | Aucun texte inventé ; points passifs conservés |
| Version | Les données de passation proviennent du snapshot initial | Aucune lecture de la dernière version ; reprise/consultation/révision conservées |
| Géométrie | Copies intrinsèques et inertes stabilisent les actions | Même libellé d’échelle et de repère dans les copies ; aucun nouveau scroll |

Modifications applicatives : `EvaluationScoreInput`, `AppreciationScale`,
`TakingContentSizing` et six lignes dans `evaluation-rating.css`.
Aucun calcul, règle métier, contrat API, migration, mécanisme de notation ou persistance modifié.
Aucun composant/fichier de résultats, configuration Git, hook ou workflow modifié.

## Non-régression et vrais refus

Les assertions ajoutées à `AppreciationScale.test.tsx` et `EvaluationTakingNavigation.test.tsx`
échouent avant correction : repère 5 introuvable pour 6 ; échelle visible introuvable.
Après correction, les cinq suites React ciblées passent : 16 tests.
Les autres tests de repères sont adaptés au libellé exact ; pas de comportement recréé.

Les 15 E2E ciblés existants passent : `evaluation-explicit-rating` (quatre combinaisons
clair/sombre × souris/tactile), `appreciation-markers`, `evaluation-rating-focus`,
`evaluation-taking-layout` et `evaluation-versions`. Le test explicite vérifie maintenant aussi
l’échelle accessible, capture 0/5/10 et confirme 0/5 après rechargement.
Refus réel : finalisation incomplète désactivée et HTTP 400, notes inchangées ; sauvegarde 400
puis réessai dans le parcours de layout ; aucune réponse implicite après focus/navigation.
Le test de version vérifie l’ancien descriptif v1 après activation de v2, puis le nouveau pour v2.

## Preuves UX et validation

Les mesures/captures de `evaluation-rating-scale.spec.ts` complètent les suites existantes :
1280×720, 390×844 et 320×568 ; clair/sombre ; sans réponse, 5, 0, 10 et 9 avec repère 7.
Les paires réelles sont composées avec canvas sRGB, transparences incluses, puis mesurées au seuil 4,5:1.
Les états restent distingués par leur texte et les attributs du contrôle, indépendamment des couleurs.
Le focus clavier et les petits écrans 568×320, 375×667 et 1920×1080 restent couverts par les tests existants.
Les éléments essentiels doivent rester accessibles par l’unique scroll du corps de la modale.

Le plan exhaustif local passe : 1 434 tests backend (97,48 %), 428 frontend (quatre seuils >90 %),
82 E2E application et 10 démo ; lint, formatage, typecheck, build et 200 lignes conformes.
Les trois contrôles de lisibilité passent ; 840 mesures, minimum 5.646:1.
Les [exécutions et captures](executions.md) permettent la revue des six combinaisons thème/viewport.
Les [commandes et résultats](validations.md), [mesures](mesures.md) et
[entrées exactes](sources.md) complètent ce rapport. Publication et CI restent à confirmer.

## Revue documentaire et DoD

README annoncé avant développement. Règles agents, charte qualité, DoD, stratégie de tests,
fondamentaux, contrats API, architecture passation/repères et cahier UX relus.
Les descriptions de passation et de repères sont ajustées ; les autres contrats restent exacts.
Sécurité, permissions et règles de finalisation inchangées ; vrais refus couverts par les E2E.
Nouveaux tests backend/API et migrations non applicables à ce correctif de présentation.
Les contraintes de 200 lignes, lint, formatage, typecheck, build, couverture et gates calculés restent bloquants.
MEP-013/045, la recette cible MEP-069 et le GO MESS restent distincts de ce correctif.
Le registre reste ouvert jusqu’à validation de la CI du SHA publié.

## Coordination avec MEP-014

Lecture seule du chantier `feat/mep-014-resultats` : aucun fichier applicatif commun.
Les fichiers communs sont documentaires : README et registre canonique. MEP-044 complète
le paragraphe de passation et sa propre ligne de PBI ; les résultats conservent leurs fichiers dédiés.
Les mises à jour du registre et des vues dérivées seront limitées à MEP-044 et ses compteurs,
après resynchronisation sur origin/main, en conservant toutes les évolutions MEP-014.
`npm run publish` sérialise l’intégration par son verrou commun et resynchronise avant le push direct.
