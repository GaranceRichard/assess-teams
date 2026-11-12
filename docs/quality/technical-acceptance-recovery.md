# MEP-031 — Sauvegarde, restauration et retour arrière

[Index](technical-acceptance.md) · [P0, jeux G, R0 et PV](technical-acceptance-protocol.md).
Ces procédures sont conditionnelles aux outils [MEP-064/027/065](../backlog/source/mess/f15.md)
et à [MEP-026](../backlog/source/mess/f14.md), absents à la base de rédaction.
Ni copie brute d'une base ouverte, ni ancien code lancé sur schéma nouveau ne constitue une solution livrée.

## TEC-14

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-14 — Produire une sauvegarde cohérente avec écritures actives et contenu/provenance contrôlables. |
| Références | [MEP-064](../backlog/source/mess/f15.md), [contraintes SQLite MEP-039](../operations/sqlite/README.md), [C11 sauvegarde](../backlog/planning/audit-20261027/decisions-mess.md). |
| Préconditions | P0 ; outil/méthode MEP-064 livré et vérifié, chemins/ACL D06/D07, politique et responsables C11 ; exploitant backup et propriétaire données ; G-R sur instance isolée, destination séparée autorisée, espace mesuré. |
| Données | G-R : jalons métiers avant/pendant/après sauvegarde ; relevé des commits, schéma, fichiers nécessaires, empreintes du package et références protégées de configuration. Pas de secret dans manifeste public. |
| Procédure | 1. Valider contenu/version/schéma et destination de la méthode livrée. 2. Démarrer les écritures API/workers approuvées puis lancer la commande MEP-064 définitive en enregistrant début/fin et jalons de commit. 3. Contrôler empreintes/contenu, intégrité/FK sur copie isolée et cohérence métier/Journal/queues du point obtenu. 4. Restaurer par TEC-15 pour vérifier utilisabilité. 5. Répéter avec destination refusée/espace insuffisant et interruption pendant sauvegarde sur clones distincts. |
| Injection | ACL de destination non autorisée, capacité insuffisante mesurée et arrêt du processus de backup ; mécanisme OS, état intermédiaire et conditions d'arrêt approuvés avant essai. Ne pas saturer un disque partagé. |
| Attendu | Artefact complet et identifiable par version/schéma/empreinte, point cohérent sans mutation partielle ni perte de provenance ; API/workers d'origine restent intacts. Fichiers/configuration nécessaires récupérables depuis stockage protégé selon méthode. |
| Seuil | Fréquence, contenu exact, conservation, destination/capacité, charge pendant backup et vérification : `À définir — C11 / MEP-022`, D07. Intégrité quick_check(1)=ok/FK sans ligne et invariants exacts ; aucune durée/fenêtre de sauvegarde inventée. |
| Refus | Code non nul/diagnostic prévu par MEP-064 pour destination/écriture/interruption ; artefact incomplet explicitement non qualifié, jamais référencé comme restaurable. Aucune modification/écrasement des données d'origine, secret exposé ou faux reçu de succès. Codes finaux à confirmer avec l'outil réel. |
| Preuves | Commande/version/codes, jalons et point de backup, manifeste/empreintes et contrôles d'intégrité, ACL sans contenu secret, mesures et références de restauration ; inventaire des fichiers attendus/manquants. |
| Remise en état | R0 ; libérer la ressource simulée, isoler artefact incomplet, conserver preuve d'échec ; vérifier état source, espace et ordonnanceur sans écraser une sauvegarde valide. |
| Consommateur / verdict | MEP-072 — **Non exécuté**. |

## TEC-15

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-15 — Restaurer le bon point avec intégrité et provenance, et refuser une sauvegarde invalide avant écrasement. |
| Références | [MEP-027 et refus](../backlog/source/mess/f15.md), [C11 RPO/RTO](../backlog/planning/audit-20261027/decisions-mess.md), [MEP-003](../architecture/sqlite-transactions.md). |
| Préconditions | P0 ; TEC-14 valide, outil MEP-027 et services MEP-063 livrés, autorité restauration désignée ; instance de destination isolée distincte de la source et des autres PV, état initial connu avec données témoins. |
| Données | G-R et sauvegarde qualifiée ; copies indépendantes altérée, fichier nécessaire manquant, manifeste/empreinte erroné et couple version/schéma incompatible. Jalons validés avant et après point de sauvegarde. |
| Procédure | 1. Identifier incident simulé et point de reprise autorisé ; enregistrer début de RTO suivant C11. 2. Arrêter la destination par procédure livrée, contrôler provenance/empreintes/contenu/compatibilité avant remplacement. 3. Restaurer par commande MEP-027 définitive, contrôler intégrité/FK/migrations et redémarrer. 4. Vérifier connexion, passation/relecture des notes, auteurs/dates/lignées/activités, état des files et absence de renvoi incertain. 5. Relever retour au service accepté, dernier jalon récupéré et pertes après point ; mesurer selon C11. 6. Rejouer chaque variante invalide depuis la destination témoin initiale. |
| Injection | Indisponibilité de l'instance de recette puis altération/incomplétude/incompatibilité sur copies jetables de sauvegarde ; ne jamais corrompre l'original ni les données d'une autre recette. |
| Attendu | Couple version/schéma cohérent, point réellement restauré expliqué ; état métier et provenance identiques au point, fichiers requis présents. RPO = écart de données/temps au point de référence approuvé ; RTO = durée entre bornes C11. Les données post-backup non récupérées sont explicitement recensées et confrontées à la perte admissible. |
| Seuil | RPO, RTO, incidents couverts, points de début/fin, critères de service rétabli et traitement des files : **`À définir — C11 / MEP-022`**. quick_check(1)=ok, FK sans ligne et invariants sans perte non autorisée. |
| Refus | Outil refuse altération/incomplet/schéma incompatible avec diagnostic et code non nul, sans écraser données témoins ni démarrer sur base partielle. Intégrité/provenance absente ou RPO/RTO dépassé = échec, pas restauration « réussie avec réserve » ; inconnue = Bloqué. |
| Preuves | Provenance/empreintes, commandes/codes, comparaison témoin avant/après refus, schéma/intégrité, jalons perdus/récupérés, mesures brutes avec bornes, vérification des services et files, décision d'acceptation. |
| Remise en état | R0 ; garder source et sauvegarde qualifiée intactes ; arrêter/isoler destination invalide, puis recréer le clone autorisé. Vérifier SMTP avant toute remise après restauration. |
| Consommateur / verdict | MEP-072 — **Non exécuté**. |

## TEC-16

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-16 — Revenir à un couple code/schéma/données cohérent après upgrade sans perte acceptée implicitement. |
| Références | [MEP-026](../backlog/source/mess/f14.md), [MEP-065/027/064](../backlog/source/mess/f15.md), [C11](../backlog/planning/audit-20261027/decisions-mess.md). |
| Préconditions | P0 ; outils MEP-026/065 livrés, TEC-14/15 vérifiés ; deux versions réellement compatibles selon matrice approuvée et sauvegarde pré-upgrade ; exploitant et autorité rollback nommés. Un seul candidat disponible = variante Bloquée. |
| Données | G-R avant upgrade, jalon après upgrade, package précédent et nouveau avec empreintes ; configuration privée courante, version des migrations et files. Traitement des données post-upgrade explicitement approuvé avant essai. |
| Procédure | 1. Vérifier intégrité/compatibilité/package et sauvegarde ; relever point initial. 2. Exécuter mise à jour MEP-026 réelle puis vérifier persistance/configuration/services et produire jalon post-upgrade. 3. Déclencher incident convenu et décision de retour, relever début/fin C11. 4. Exécuter MEP-065 pour restaurer le couple approuvé ; vérifier notes/snapshots/auteurs/Journal/files et données conservées/perdues. 5. Rejouer avec package altéré, backup manquant et ancien code sur schéma incompatible pour vérifier refus avant effet. |
| Injection | Échec de migration ou service post-upgrade selon le mécanisme livré et approuvé, sur clone isolé ; paire code/schéma volontairement incompatible comme témoin, jamais démarrée manuellement pour contourner l'outil. |
| Attendu | Upgrade contrôlé puis retour reproductible au couple sauvegardé ; configuration/données gérées par contrat et provenance conservée. Toute conséquence sur jalon post-upgrade explicitée, autorisée et mesurée ; aucun secret révoqué restauré. |
| Seuil | Couples compatibles, perte admissible des données post-upgrade, durée/points RTO/RPO, critères de retour et responsables : **`À définir — C11 / MEP-022`**. Identité des packages et intégrité exactes. |
| Refus | Package/backup invalide ou couple incompatible : diagnostic non nul avant migration/écrasement/démarrage ; données et configuration témoins inchangées. Ancien code sur nouveau schéma, perte de provenance, renvoi SMTP aveugle, dépassement C11 ou commande ad hoc = échec. |
| Preuves | Empreintes des deux versions/backup, migrations avant-après, commandes/codes et décision rollback, mesures et jalons, comparaisons métier/queues/provenance, refus sans effet et contrôles d'intégrité. |
| Remise en état | R0 ; ne conserver en service que le couple approuvé et vérifié ; isoler clone incompatible, restaurer ordonnanceur/flux validés et traiter les files par TEC-11. |
| Consommateur / verdict | MEP-072 — **Non exécuté**. |
