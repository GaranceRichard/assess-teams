# MEP-064 — Preuves et revue documentaire

[Procédure et préparation préalable](sqlite-backup.md) · [Référence O07/O08](operations-continuity.md).

## Scénarios permanents

| Critère | Preuve automatisée |
| --- | --- |
| CA01 | `test_sqlite_backup_concurrency.py` : trois répétitions indépendantes DELETE et WAL, deux processus, 24 transactions organisation/journal, écriture suspendue entre les deux INSERT à l'entrée de la sauvegarde ; transactions entièrement présentes ou absentes |
| CA02 | `test_sqlite_backup.py` : configuration, références privées, application, assets, runtime et fichier supplémentaire conservés ; vérification après suppression des originaux et capture depuis un backend au format MEP-024 |
| CA03 | Fermeture avant empreinte, version par contenu, migrations/schéma relus, origine SQLite privée ; refus d'empreinte de manifeste ou de provenance altérée |
| CA04 | Copie isolée, quick/full integrity, FK et invariants métier ; jalon initial présent, jalon postérieur absent, 24 commits conservés sur la source |
| CR01 | Méthode de copie brute rejetée, fichier actif exclu des fichiers supplémentaires, répertoire brut sans manifeste et lot incomplet refusés |
| CR02 | Octets SQLite/privés/inventaire altérés, SQLite illisible, FK et provenance métier incohérentes ou migration manquante refusés, même après recalcul d'empreinte pour atteindre les contrôles profonds ; source témoin préservée |
| CR03 | Manifeste à champs autorisés seulement, champ secret ajouté refusé sans écho, configuration invalide et diagnostics sans contenu ni chemin privé |
| Échecs opératoires | Espace insuffisant, source verrouillée avec expiration, interruption, fichier requis absent, configuration modifiée en cours de capture ; anciens lots valides préservés |

Les essais WAL vérifient la méthode de copie ; ils ne changent pas le profil DELETE/FULL de production.
Les octets privés restent dans les temporaires de tests ; aucun artefact de sauvegarde n'est versionné.

## Revue documentaire et DoD

Préparation réellement écrite avant les fichiers techniques dans `sqlite-backup.md`, puis liste
ajustée avant séparation des fichiers d'inventaire et d'échecs pour respecter les 200 lignes.
Le gate a d’abord refusé le regroupement des références sur des lignes « Fichiers » ;
ces références déjà préparées ont été reformattées en entrées « Fichier » unitaires.
Le document propriétaire couvre le contrat opératoire et tous les fichiers techniques du lot ;
aucun remplissage du README ne remplace cette préparation. La version par contenu est explicite.
Relecture des règles, charte, DoD, stratégie, architecture et contrat API effectuée : aucun changement
HTTP, modèle, migration, interface, permission produit ou parcours E2E. README produit inchangé :
les usages et l'installation publique ne changent pas ; l'index documentaire expose la procédure.
Les références historiques et preuves MEP-022 restent conservées ; son entrée O07 est reliée à l'outil.
La description SQLite et l'architecture sont actualisées sans annoncer une installation MESS qualifiée.

Restent distincts : ACL et compte réellement habilités, inventaire exhaustif propre au site,
package/runtime approuvé, stockage séparé, restauration et traitement des effets SMTP (MEP-027),
fréquence/rétention, qualification I01 et recette MEP-072. Aucun RPO/RTO ni GO MESS n'est déduit.
Le registre de statut n'est pas clôturé automatiquement par une preuve de code.

## Résultats de validation

Le dernier passage ciblé sur Windows a réussi 37 cas fonctionnels et d’intégration. Le contrôle
des permissions du parent de vérification est réservé à POSIX et s’exécute en CI Linux. Ruff,
formatage et cohérence des migrations sont passés.
La première campagne backend complète a été interrompue pour rendre explicites les permissions
privées du répertoire brut dans le test de refus POSIX ; aucun succès de campagne interrompue
n’est réutilisé. Le pré-push exécute le backend complet sur le candidat final commité.
Le plan calculé sélectionne documentation + backend complet ; frontend/E2E exclus comme prévu.
Les validations finales et la CI du SHA publié sont consignées dans le compte rendu de livraison.
