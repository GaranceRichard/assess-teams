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
`TakingContentSizing` et les styles de l’en-tête dans `evaluation-rating.css`.
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

## Correction de hauteur détectée par la CI

Le 2026-10-23, la [CI du premier SHA `fd85621`](https://github.com/GaranceRichard/assess-teams/actions/runs/39959414795)
refuse deux cas desktop : hauteur Linux 612,296875 px, au lieu de `<600` dans
`evaluation-taking-layout`, malgré les campagnes Windows vertes. Cette tentative n’a pas clôturé MEP-044.
L’en-tête regroupe maintenant le libellé et l’échelle sur une ligne lorsque la largeur suffit,
avec retour à la ligne naturel sinon. Les copies de dimensionnement suivent le même contenu.
Le seuil de 600 px, la typographie, les actions et les règles de scroll restent inchangés.
Le contrôle de ligne desktop ajouté à `evaluation-rating-scale` échoue avant la correction
(307,125 attendu strictement inférieur à 307,125), puis passe après.
Le style local `taking-score-caption` évite les espacements génériques des titres sans modifier
les styles partagés. Le texte de la note est vérifié intégralement lisible dans le corps visible,
après le défilement prévu sur petit écran si nécessaire. Les 12 E2E ciblés échelle/layout/focus
passent ; le contrôle final d’accès à la note et des contrastes passe sur les trois viewports.
Les captures du 23 octobre montrent ce correctif.
La [CI du SHA corrigé `1e22be2`](https://github.com/GaranceRichard/assess-teams/actions/runs/39967554796) confirme les deux hauteurs Linux `<600` et tous les gates exhaustifs.

## Preuves UX et validation

Les mesures/captures de `evaluation-rating-scale.spec.ts` complètent les suites existantes :
1280×720, 390×844 et 320×568 ; clair/sombre ; sans réponse, 5, 0, 10 et 9 avec repère 7.
Les paires réelles sont composées avec canvas sRGB, transparences incluses, puis mesurées au seuil 4,5:1.
Les états restent distingués par leur texte et les attributs du contrôle, indépendamment des couleurs.
Le focus clavier et les petits écrans 568×320, 375×667 et 1920×1080 restent couverts par les tests existants.
Les éléments essentiels doivent rester accessibles par l’unique scroll du corps de la modale.

Les campagnes locales initiales passent : 1 434 tests backend (97,48 %), 428 frontend
(quatre seuils >90 %), 82 E2E application et 10 démo ; leur limite Linux est décrite plus haut.
Les trois contrôles de lisibilité passent ; 840 mesures, minimum 5.646:1.
Les [exécutions et captures](executions.md) permettent la revue des six combinaisons thème/viewport.
Les [commandes et résultats](validations.md), [mesures](mesures.md) et
[entrées exactes](sources.md) complètent ce rapport. Publication directe `1e22be2` et [CI exacte](https://github.com/GaranceRichard/assess-teams/actions/runs/39967554796) confirmées.

## Revue documentaire et DoD

README annoncé avant développement. Règles agents, charte qualité, DoD, stratégie de tests,
fondamentaux, contrats API, architecture passation/repères et cahier UX relus.
Les descriptions de passation et de repères sont ajustées ; les autres contrats restent exacts.
Sécurité, permissions et règles de finalisation inchangées ; vrais refus couverts par les E2E.
Nouveaux tests backend/API et migrations non applicables à ce correctif de présentation.
Les contraintes de 200 lignes, lint, formatage, typecheck, build, couverture et gates calculés restent bloquants.
MEP-013/045, la recette cible MEP-069 et le GO MESS restent distincts de ce correctif.
MEP-044 est réalisé le 2026-10-23 après pre-push exhaustif et CI verte du SHA `1e22be2aacc6c63d64c5b27a915eb0c91c6ed673`.

## Coordination avec MEP-014

Lecture seule du chantier `feat/mep-014-resultats` : aucun fichier applicatif commun.
Les fichiers communs sont documentaires : README et registre canonique. MEP-044 complète
le paragraphe de passation et sa propre ligne de PBI ; les résultats conservent leurs fichiers dédiés.
Après le push MEP-014 `2fbfb9e`, la clôture est resynchronisée sur origin/main sans conflit.
Sa ligne « En cours » et son README sont conservés ; les compteurs dérivent du registre canonique.
`npm run publish` sérialise l’intégration par son verrou commun et resynchronise avant le push direct.
