# Contrôles documentaires de consolidation

Base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`, 2026-10-28.
[Revue de décision](consolidation-revue.md). Cette validation porte sur la prose et la cohérence des livrables,
pas sur l’acceptation esthétique, les scénarios métier ou une recette MESS.

## Périmètre des vérifications

- Comparer la matrice au dossier initial sauvegardé : mêmes 96 IDs, mêmes parents/statuts/classifications.
- Comparer les registres/source et les fiches : identifiants, suivi et historique préservés.
- Vérifier les 52 fiches A–G, nature, action, passage, consommateur et scénarios spécifiques.
- Vérifier la couverture de ces 52 dans actions/index/trajectoire ; aucun ajout d’ID canonique.
- Vérifier les 19 frontières de Features et l’anomalie transitions hors du dénominateur.
- Vérifier liens/ancres, Markdown, UTF-8, espaces et limite de 200 lignes.
- Contrôler qu’aucun fichier suivi n’est modifié et que les ajouts restent dans le dossier de proposition.
- Exécuter `npm run quality:targeted` documentaire ; aucun test métier/API/E2E demandé par ce diff.
- Vérifier le checkout principal en lecture seule ; aucune publication, clôture ou modification canonique.

## Résultats exécutés

- Matrice : 96 IDs uniques identiques à l’instantané initial ; zéro changement de classification,
  de parent ou de statut. Catégories conservées 47/20/22/2/5/0 et statuts canoniques 45/48/3/0.
- 52 fiches modifiées, exactement les 51 non réalisés + USER-001 ; 44 autres dossiers réalisés inchangés.
  Sections A–G, trois scénarios avec vrai refus et prochaine action/condition/consommateur vérifiés.
- 19 scénarios d’exploitation génériques remplacés ; cas UX 018/051 et édition USER-003 précisés.
- Actions, index de raffinement et trajectoire : mêmes 52 IDs sans omission ; natures A–F identiques
  à celles de chaque fiche. Anomalie transitions hors de ces tableaux de PBI, sans nouvel ID canonique.
- 19 Features non raffinées examinées, sans parent modifié ni livraison entière déduite d’un acquis voisin.
- 116 documents Markdown, maximum 188 lignes ; 1 385 liens locaux/ancres valides ;
  tableaux avec nombre de cellules cohérent, UTF-8 sans caractère de remplacement et espaces contrôlés.
- Comparaison au dossier initial sauvegardé : aucun agrégat de classification recalculé pour changer
  artificiellement le résultat ; ajout C21 explicite, vingt contradictions initiales conservées.
- Aucun fichier suivi modifié ; ajouts confinés au dossier d’audit. Aucun script/test/workflow ajouté.
  Contrôle git diff --check conforme ; espaces des nouveaux fichiers contrôlés séparément.
- npm run quality:targeted : documentation seule, zéro échec ; lignes, secrets, structure et workflow
  documentaire passent. Backend/frontend/E2E non sélectionnés ; aucune campagne métier nouvelle.
- Checkout principal propre, main et origin/main à la base auditée, comparaison 0/0 ; aucune mutation.

Les anciennes mesures de revue.md restent celles de la première phase ; elles ne sont pas réutilisées
comme preuve de ce dossier modifié. Aucune clôture canonique, PR, publication ou intégration effectuée.
