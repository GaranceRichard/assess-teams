# MEP-048 — correction des écarts B01 et B02

Date : 2026-11-02 ; auteur : Codex. Base technique `009696341f401eb92235b3723a27290f8b2dfb29`.
[Retour au rapport consolidé](rapport.md) ; [constats avant correction](ecarts-residuels.md).
Le correctif applicatif se limite à **trois règles dans steering.css** ; aucun TSX, calcul,
modèle, endpoint, droit, sélection Results ou composant de collection partagé modifié.

## Causes établies

B01 : la règle partagée `.collection-scroll .steering-table { overflow: visible }`
laissait le tableau large déborder dans le scroll parent. Le parent contenait aussi la note.
L’accès clavier à A1 faisait défiler ce parent horizontalement de 570 px : note à x=−554.
La largeur globale du document restait 390 px : ce contrôle seul ne détectait pas le défaut.

B02 : la collection flex utilisait le seul espace restant après les définitions ouvertes.
À 1280×720, la région visible ne faisait plus que 72 px pour une ligne haute de 105 px
et un en-tête fixe de 91 px. Les textes existaient dans le DOM, mais étaient occultés.
Les tests de simple présence/visibilité ne prouvaient donc pas leur lecture réelle.

## Correction strictement locale

- Définitions ouvertes, la collection de Pilotage prend sa hauteur de contenu (`flex: none`).
- Dans cet état, son conteneur intérieur ne rétrécit plus le contenu et laisse le débordement visible.
- Le tableau de Pilotage retrouve son propre défilement horizontal.

Le scroll vertical est porté par la page existante, sans hauteur numérique ajoutée.
Définitions fermées, la collection reste bornée : la pagination reste dans le viewport desktop.
La note reste hors du mouvement horizontal ; le tableau et sa ligne sont accessibles par défilement
avec l’aide ouverte. Pagination serveur et navigation de pages sont conservées.
Les autres routes conservent intégralement les règles de CollectionFrame et du shell.

## Non-régressions rouge / vert

Fichier versionné : [steering-readability.spec.ts](../../../../frontend/e2e/steering-readability.spec.ts).
Backend réel et sessions réelles ; fixtures fictives ; aucun mock, aucun CSS injecté.
Ports 8158/5258 et bases séparées pendant le développement.
La fixture mobile reprend trois équipes actives de STEER-001 et renomme l'équipe source A1 ;
elle reproduit le même défaut de scroll sans prétendre être le jeu historique J1 à quatre équipes.

| Scénario | Rouge sur produit inchangé | Vert après correction |
| --- | --- | --- |
| Clavier mobile, clair | x de la note = −554, attendu ≥0 ; échec du test | x=16 ; note 358×120, intersection 358×120, hit-tests sans occultation |
| Clavier mobile, sombre | Même échec réel x=−554 | Mêmes mesures ; accès Results par Entrée toujours fonctionnel |
| Ligne sans résultat, clair | 72 px visibles pour 105 px ; hit-tests occultés | Huit cellules intégralement lisibles, hauteur visible 105/105 et hit-tests réussis |
| Ligne sans résultat, sombre | Même défaut de cadrage/occultation | Huit cellules intégralement lisibles ; absence de lien source conservée |

Les rouges de ligne sont dans red-final.log ; les rouges mobiles dans red-mobile.log.
La première navigation de fixture utilisait un nombre fixe de Tab inadéquat : elle ne constitue pas
la preuve rouge retenue. Le test final parcourt Tab jusqu’à A1, dans une borne de cinq étapes.
La présence d’un texte masqué est explicitement refusée par intersection avec les conteneurs
de débordement et hit-tests, sans tester le nom des classes corrigées.

`npm run test:e2e --prefix frontend -- steering-readability.spec.ts` :
**4 passés**, 35,4 s, sans retry dans la passe verte initiale.
Le mode clair et le mode sombre ont chacun leurs mesures et captures stabilisées.
Avant toute capture : polices prêtes, animations finies, aucun contenu de transition sortant.
Les PNG keyboard/note/resultless-row ont été ouverts et relus par Codex.

Une première campagne globale a détecté une régression de pagination introduite par le déploiement
inconditionnel de la collection : 115/116 E2E réels et 10/10 démo, donc gate en échec.
La correction finale limite le déploiement à `:has(.steering-definitions[open])`.
Le test partagé `product-shell.spec.ts` est conservé sans affaiblissement ; avec les quatre nouveaux
tests, la sélection finale réussit : **5 passés en 1,1 min**. Le gate complet est relancé sur cet état.

## Contrôles et portée

Le plan automatique demande documentation, statiques frontend, dépendants Vitest et tous les E2E,
sans pytest puisqu’aucune entrée backend n’est modifiée. Aucun scope n’a été retiré du plan.
Les 15 fichiers React dépendants, **88 assertions**, passent ; diagnostics jsdom de navigation
distincts des navigations connectées réellement testées.

Les campagnes complètes à seuils globaux de 90 % restent indépendantes ; une sélection partielle
n’en revendique pas le coverage. Aucun changement de modèle/API : migration et nouveau schéma non applicables.
README annoncé avant les tests ; revue documentaire : contrats Pilotage/Results/Dashboard,
architecture du shell, fondamentaux, API, règles, charte, DoD et stratégie de tests.
La description de scroll et la stratégie de non-régression ont été mises à jour.

Pre-push et CI du SHA exact sont les gates de livraison ; aucun contournement, aucune PR.
Le résultat final de campagne/publication sera consigné dans le rapport consolidé.
La clôture ne sera proposée qu’après conformité des critères ; aucun statut canonique modifié.


## Résultat final des validations locales

Le correctif final passe le plan automatique : documentation, lint/format/typecheck frontend,
15 fichiers React / 88 assertions, 116 E2E réels et 10 E2E de démo, zéro échec.
Le build de production réussit aussi. La première campagne échouée n'est pas présentée comme verte.
Les gates de publication et la CI du SHA publié restent vérifiés par npm run publish.
