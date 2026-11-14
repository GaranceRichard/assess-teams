# C04 — Validations et publication

## Campagne complète acquise

Commande : `npm run quality:full`, sur le candidat propre
`eb533d880ff375a52699b3ca09e7e354d4d80c0d`, avant la resynchronisation documentaire.
Le checkout est resté propre et le SHA est resté identique pendant cette campagne.
Les preuves de scopes sont produites par le moteur officiel dans le cache du worktree.

| Domaine | Résultat |
| --- | --- |
| Dépôt | Lignes, secrets, cohérence, documentation, tests des gates et du bootstrap : vert. |
| Backend | 1 519 tests réussis en 1 446,16 s ; couverture totale 97,53 %, seuil 90 % atteint. |
| Frontend | 494 tests dans 119 fichiers ; lint, formatage, typage et build verts. |
| Couverture frontend | Statements 94,87 %, branches 93,33 %, fonctions 96,35 %, lignes 95,71 %. |
| E2E application | 151 parcours réussis en 23,0 min, dont le parcours C04 complet. |
| E2E démo | 10 parcours réussis en 39,7 s, build statique et absence d’API contrôlés. |
| API | OpenAPI strict, Swagger, projections minimales et refus vérifiés dans la suite backend. |
| Données | Aucune modification de modèle ; migration nouvelle non applicable, contrôle de cohérence vert. |

## Resynchronisation et publication

Le chantier a ensuite intégré `3a881f8`, qui recentre le README et change la politique
documentaire. Les fichiers backend/frontend C04 sont identiques à ceux de la campagne
complète ; le conflit de README est résolu en conservant la nouvelle vitrine produit.
Le contrat propriétaire et la [chronologie réelle](../../architecture/teams-api.md#préparation-du-changement--application-de-c04-aux-lectures)
sont explicités sans prétendre qu’un nouveau format existait avant le développement.

Le pré-push applique les règles et entrées courantes. La réutilisation d’une preuve est
laissée au moteur officiel ; aucun cache n’est réécrit pour forcer une réutilisation.
La première tentative `npm run publish` a rencontré le verrou d’une autre intégration
active avant fetch, test ou push C04. Aucun verrou ni processus d’autre chantier modifié.

Publication et CI du SHA exact encore attendues à cette rédaction. Aucun succès de
livraison ou clôture canonique n’est déduit de la seule campagne locale complète.
Les dossiers TEAM-002 et TEAM-003 restent des projets distincts jusqu’à ces preuves.

## Intégration du contrat TEAM-005 publié

Nouvelle base `4c29aca`, incluant `8f89855` (refus explicite du second archivage).
Les conflits C04/TEAM-005 sont résolus en conservant le DELETE Admin à 400 sur une
archive accessible et les lectures Coach C04 ; aucun statut canonique n’est modifié.
Le déplacement préparé de la seule annotation GET vers le module de schéma remet
les vues sous 200 lignes. Les corps de POST, PUT et DELETE sont identiques à ceux
de `origin/main`, vérifiés par comparaison de leurs arbres syntaxiques Python.

Après résolution : **89 tests backend ciblés** réussis en 34,43 s, couvrant lectures,
archivage, intégrité, pagination, OpenAPI strict et Swagger ; **3 E2E** réussis en
29,8 s, dont second archivage à 400 et parcours Coach. Lint, formatage, migrations,
limite de lignes et préparation documentaire passent. Le pré-push complet reste
bloquant pour les entrées finales après cette resynchronisation.
