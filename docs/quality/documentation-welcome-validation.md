# Validation et publication de la refonte documentaire

## Préparation du changement — restauration Git portable

- Périmètre : corriger uniquement la restauration de l’environnement Git du test de préparation documentaire sous PowerShell Linux et Windows.
- Objectif : préserver la distinction entre variable absente et variable présente vide, révélée par la CI indépendante du premier SHA publié.
- Effets attendus : retirer les variables de la fixture puis restaurer seulement celles qui existaient, sans fabriquer un GIT_DIR ou GIT_CONFIG vide.
- Risques : une restitution inexacte de l’environnement perturbe Git et invalide le contrôle de non-mutation ; les assertions et refus restent obligatoires.
- Vérification : scénarios documentaires, environnements Git absent/présent, contrôle de non-mutation, pré-push transverse complet et CI indépendante du nouveau SHA.
- Fichier : `scripts/quality/tests/documentation.tests.ps1`

Préparation du correctif le 13 novembre 2026, depuis le SHA publié `3a881f8`, avant modification du test.
Le [rapport d’audit et de conservation](documentation-welcome.md) reste inchangé dans ses constats historiques.

## Premier SHA publié : résultat local et refus distant

`npm run publish` a publié `3a881f8fc1cc80d2895df40c5e1c101c9477a0f9` et synchronisé le main local.
Les quatre domaines locaux ont réussi sur ce SHA : dépôt, 1 498 tests backend, 493 tests frontend,
150 E2E applicatifs et 10 E2E de démo. Lint, formatage, migrations, build et seuils de 90 % satisfaits.

La [CI indépendante 43437001974](https://github.com/GaranceRichard/assess-teams/actions/runs/43437001974)
est rouge sur `full / Repository constraints`. Les 24 scénarios documentaires passent, mais les commandes
Git de vérification après restauration échouent avec `not a git repository: ''` et `only one config file at a time`.
Les domaines applicatifs distants passent ; ce succès ne compense pas le gate dépôt rouge.

Cause : le test appelait `SetEnvironmentVariable` pour toutes les variables locales de Git, y compris
celles absentes avant la fixture. Sous le runtime Linux de CI, la restitution produit des entrées vides.
La correction sauvegarde la présence réelle, retire toutes les entrées temporaires et rétablit uniquement
les variables initialement présentes par les cmdlets de l’environnement. Le contrôle de non-mutation reste actif.

## Revue de contenu du correctif

Revue de l’agent : correction limitée à la fixture ajoutée dans ce mandat ; aucun fichier applicatif,
seuil, sélection, workflow, hook ou protection modifié. La préparation est consignée avant le correctif.
Le README produit ne change pas pour ce détail de validation. La CI rouge initiale reste une preuve de refus,
sans approbation humaine prétendue ni relance destinée à masquer un défaut inchangé.

## Vérifications ciblées avant nouvelle publication

Les 24 scénarios documentaires et le contrôle de non-mutation passent avec variables Git absentes,
puis avec `GIT_DIR`, `GIT_WORK_TREE` et `GIT_INDEX_FILE` du hook explicitement présents.
La présence et la valeur de chaque variable sont aussi comparées après restitution.
Le gate documentaire accepte ce vrai lot technique sans édition du README racine, avec la préparation ci-dessus.
Les liens sont revérifiés : 433 documents, 4 663 références internes, aucun chemin ni ancre manquant.
Le périmètre total compte les 20 fichiers de l’inventaire initial et ce complément de validation.
Les preuves locales du premier SHA donnent 97,51 % backend ; frontend : statements 94,87 %,
branches 93,32 %, functions 96,35 %, lines 95,71 %. Elles ne dispensent pas du nouveau plan transverse
ni de la CI indépendante du correctif. Aucun échec n’est reclassé en succès.
