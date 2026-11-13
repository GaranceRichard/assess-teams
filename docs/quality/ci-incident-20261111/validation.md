# Contrôles de l’audit puis du correctif

## Audit initial, avant GO

Le plan documentaire seul et `npm run quality:targeted` sont passés avec zéro échec :
200 lignes, secrets, cohérence du dépôt, preuves visuelles et workflow documentaire.
Le README technique préalable était alors non applicable. Ces résultats ne qualifiaient
que le rapport ; les quatre échecs expérimentaux contrôlés restaient des preuves rouges.
Les 401 sources de l’archive étaient inchangées : [preuve historique](sources.md).
Le premier conteneur exploratoire a été arrêté et supprimé après récupération des preuves.

## Correctif approuvé

Le README racine a été mis à jour avant la première modification technique.
La nouvelle non-régression échoue avant correction puis passe après correction sous Windows
et Linux dans les deux environnements : [résultats et protocole](correction.md).
Cinq répétitions Linux sont bornées à `apis_release`, `apis_release_handoff`, `apis_timeout`,
toujours dans development et production : **30 cas passés**, dont dix refus attendus.
Les [résultats individuels et empreintes](preuves-correction.md) sont conservés.

Le plan d’impact classe les quatre fichiers de test en backend interne : documentation et
backend complet requis ; frontend/E2E non requis pour ce diff. Aucun workflow n’est modifié.
La campagne exhaustive verte du 12 est [vérifiée séparément](qualification-20261112.md).

`npm run quality:targeted` réussit sur le diff final :

- documentation : zéro échec, limite de 200 lignes, secrets et cohérence conformes ;
- backend : Ruff lint/format conformes, migrations cohérentes ;
- **1 498 tests passés en 1 417,32 s**, y compris les 24 cas opérationnels et les conflits critiques ;
- couverture globale lignes/branches **97,51 %**, seuil de 90 % conservé.

La première vérification documentaire avait signalé le README à 202 lignes : l’annonce a été
intégrée au paragraphe SQLite existant, à contenu antérieur conservé, puis le contrôle est passé
à 200 lignes. Aucun gate n’a été contourné.
La revue couvre README, règles agents, charte, DoD, stratégie, CI, fondamentaux/API et SQLite.
Seuls le README, le protocole de contention et ce dossier nécessitent une mise à jour.
Aucune route, modèle, migration, permission, dépendance ni décision MESS n’est changée.

Publication du correctif confirmée via `npm run publish` : pre-push fraîchement réexécuté
avec code 0, push direct du SHA `f400a8e98b0b363f1b10ccca6d4381781390234e`, puis
[CI indépendante verte `43346012639`](publication.md), avec 1 498 tests backend passés.
Le principal est propre et synchronisé par fast-forward au même SHA.
La clôture documentaire suit le même circuit, sans nouvelle campagne applicative requise.

Aucun statut PBI ni décision MESS n’est modifié. Le verdict SQLite historique reste indéterminé.
