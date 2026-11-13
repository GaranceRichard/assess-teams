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
