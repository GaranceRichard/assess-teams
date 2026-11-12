# MEP-031 — Notifications, services et journaux

[Index](technical-acceptance.md) · [P0, jeux G, R0 et PV](technical-acceptance-protocol.md).

## TEC-11

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-11 — Préserver le succès métier pendant panne SMTP et traiter chaque reprise sans faux succès de remise. |
| Références | [MEP-004 : états/reprises/admin](../architecture/email-notifications.md), [récupération](../architecture/password-management.md), [SMTP/configuration](../operations/configuration/email.md), [contention](../operations/sqlite/contention.md). |
| Préconditions | P0 ; G-N sur relais/boîtes de recette D08, exploitant messagerie/service et Superadmin de recette ; refus/pauses SMTP contrôlables et journaux du relais disponibles. API production avec remise uniquement en file, deux types de worker sur même SQLite. |
| Données | Une intention générale et une récupération séparées par variante, invitation et échéance éligibles ; états métier/planning/run/activité/queues relevés. Réinitialiser le clone entre variantes, pas le compteur d'une remise en cours. |
| Procédure | 1. Nominal : créer/inviter, générer une échéance et demander récupération ; exécuter les trois commandes du protocole, constater acceptation et invariants. 2. Rendre SMTP indisponible avant connexion ; refaire opérations et observer succès métier, intention persistée et reprise. 3. Rétablir le relais et attendre l'éligibilité avant nouvelle passe. 4. Rejouer séparément 4xx, 5xx, timeout avant soumission, coupure après début de soumission et interruption après acceptation avant confirmation SQLite. 5. Vérifier failed/unknown en admin et appliquer seulement l'action autorisée après rapprochement SMTP ; tester deux workers concurrents sur une même intention. |
| Injection | Relais de recette refuse temporairement/permanemment ou suspend la soumission ; arrêt du seul worker d'essai aux points approuvés. Instrumentation/barrières SMTP et protocole exact à finaliser avec messagerie/MEP-022 ; ne pas couper un relais partagé. |
| Attendu | 200/201 métier conserve objet/activité/intention, sans garantir réception ; échéance crée une seule passation/avance. Général : pending → retry pour 4xx/connexion, failed pour 5xx/plafond, sent seulement après acceptation SMTP ; après soumission incertaine : unknown, pas de reprise aveugle. Sending abandonné devient unknown selon contrat. Claim unique, jobs sent/en cours non renvoyés ; aucune transaction métier tenue pendant réseau. |
| Seuil | Général : cinq essais, délais 1/2/4/8 min ; sending abandonné : cinq minutes ; récupération : trois essais et fenêtre quinze minutes non renouvelée. Ces bornes MEP-004 ne sont pas un RTO. Délai opérationnel de résorption/escalade, âge maximal et objectifs de remise : `À définir — C11 / MEP-022`. |
| Refus | Aucun sent sans acceptation ; panne SMTP ne transforme pas succès métier en erreur HTTP ni ne recrée métier/planning/activité. Unknown exige vérification du relais : absence d'acceptation autorise reprise dédiée, acceptation confirmée clôt sans renvoi. Compte devenu inéligible : cancelled/ignoré sans réseau selon sa file. Double claim, token/adresse dans log ou 500 métier dû au SMTP = échec. |
| Preuves | Statuts API, IDs/états métier et queues avant-après, tentatives/éligibilité, Message-ID et acceptation/refus expurgés du relais, codes workers, décision opérateur pour unknown ; sent ne prouve pas livraison finale ni lecture. |
| Remise en état | R0 ; rétablir SMTP, traiter chaque failed/unknown par l'action adaptée de sa file, vérifier absence de workers doublés et de message incertain relancé automatiquement. |
| Consommateur / verdict | MEP-034 ; réutilisation explicite du nominal pour MEP-068 — **Non exécuté**. |

## TEC-12

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-12 — Démarrer, arrêter et reprendre l'ensemble des consommateurs avec une seule topologie approuvée. |
| Références | [MEP-063/026](../backlog/source/mess/f14.md), [workers MEP-004](../architecture/email-notifications.md), [connexions MEP-039](../operations/sqlite/README.md), [ordonnanceur purge](../operations/journal-purge.md#planification-os). |
| Préconditions | P0 ; services MEP-063 et diagnostic MEP-025 livrés, D03/D06/D07/D09 et responsabilités C11 approuvés ; exploitant OS/service, messagerie et recette ; clone redémarrable et G-N/G-S. Commandes de service OS encore absentes. |
| Données | Un job général pending, un job récupération éligible, une échéance, une passation commencée et une tâche de purge désactivée tant que non autorisée ; inventaire initial PID, tâches et configuration. |
| Procédure | 1. Utiliser le démarrage MEP-063 définitif puis le répéter ; inventorier serveur, workers et ordonnanceur. 2. Vérifier même settings/base/identité et génération quotidienne des échéances. 3. Arrêter proprement en repos puis pendant transaction et SMTP sur variantes distinctes ; relever fermeture des connexions, rollback et état sending/unknown. 4. Redémarrer service puis hôte selon D09 ; vérifier reprise et absence de tâches en rafale. 5. Déclencher les tâches aux créneaux retenus et vérifier codes non nuls, supervision et destinataire d'alerte. |
| Injection | Second démarrage, terminaison contrôlée puis arrêt brutal du processus d'essai ; worker absent, code worker non nul/BUSY, horaire manqué. Mécanismes/signaux OS et points d'arrêt à fixer dans MEP-063/022, pas de commande système présumée. |
| Attendu | Topologie et nombre de processus conformes, une instance de chaque worker existant suivant MEP-039 ; aucun worker orphelin ou doublé au restart. Services sous compte habilité ; connexions libérées avant/après passe, pas de transaction pendant SMTP. Arrêt/restart préserve notes/provenance/queues, supervision rend l'échec visible. |
| Seuil | Nombre/topologie : contrats MEP-039/063 et D03/D09 ; fuseau/créneaux/rattrapage à approuver. Durée d'arrêt/démarrage, détection/escalade et disponibilité : `À définir — C11 / MEP-022`. Les 5 s de sommeil --watch ne sont pas une garantie de délai de remise. |
| Refus | Second démarrage refusé ou rendu idempotent selon le contrat MEP-063 final, sans processus supplémentaire ; absence de succès après code non nul, tâche purge non autorisée jamais activée. Perte de donnée, reprise SMTP incertaine aveugle ou exécution en rafale = échec ; pas d'invention du code OS de refus. |
| Preuves | Commandes finales et codes, inventaires PID/tâches avant/après, configuration expurgée, journaux système/services et alertes, horodatages, états métier/queues, intégrité après arrêt brutal. |
| Remise en état | R0 ; arrêter les seuls processus de test, restaurer l'ordonnancement approuvé et vérifier chaque worker unique ; traiter unknown selon TEC-11, garder purge suspendue si décision manque. |
| Consommateur / verdict | MEP-068 ; arrêt/restart et stabilité MEP-071 — **Non exécuté**. |

## TEC-13

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-13 — Conserver les preuves métier et purger seulement les Logs techniques autorisés, avec simulation/reprise traçables. |
| Références | [JOURNAL-001/002](../architecture/journals-api.md), [MEP-042](../operations/configuration/journal-retention.md), [MEP-020 : commande/options/reçus](../operations/journal-purge.md), [preuves acquises](../operations/journal-purge-validation.md). |
| Préconditions | P0 ; G-J historique préparé sur clone par MEP-034 ; exploitant habilité OS, responsable conservation/recette ; sauvegarde/restauration vérifiées avant suppression ; durée technique et référence d'autorisation réellement approuvées, sinon destruction bloquée. |
| Données | Activités anciennes et snapshots, Logs techniques avant/à/après borne UTC, globaux et Beta, nouveaux IDs après début de fenêtre ; refus HTTP corrélé sans secret. Relever IDs/comptes et instant de référence du reçu, pas une date supposée. |
| Procédure | 1. Créer succès/refus via API et vérifier corrélation, scope Admin/Superadmin et absence de données sensibles. 2. Avec keep, tenter `purge_journals` : refus. 3. Injecter durée technique approuvée, simuler par la commande sans option : zéro suppression et reçu. 4. Après accord réel, exécuter avec --execute, --authorization et bornes approuvées ; aucune valeur illustrative OPS-123/1000 n'est un accord. 5. Interrompre entre lots, relever UUID et reprendre avec --resume selon le contrat ; comparer le reçu en base aux sorties. 6. Variantes : scope activité, reprise sous politique changée/keep, verrou et défaut d'intégrité sur copies jetables. |
| Injection | Ctrl+C/SIGTERM selon OS approuvé ; reprise concurrente du même UUID ; keep/changement de durée ; fichier d'essai invalide. Ne pas supprimer les reçus ni modifier les dates réelles de l'hôte. Constitution des bornes historiques/injection intégrité à finaliser dans MEP-034 ; pas de script de seed cible fourni. |
| Attendu | Simulation deleted=0 ; exécution limitée aux LogEntry strictement antérieures à la borne et IDs de la fenêtre ; égalité conservée. ActivityEntry/relations/snapshots/notifications et reçus intacts. Suppression et compteurs atomiques, reprise sans double compte ; quick_check(1)/FK valides, exports de reçus sûrs. |
| Seuil | Politique activity=keep obligatoire ; durée technique, bornes de lots/plafonds et créneaux réels : `À définir — C11 / MEP-022` avec autorité conservation. Bornes syntaxiques MEP-020/042 conservées ; elles ne fixent ni durée légale ni délai garanti. Logs OS/frontal/stdout/backups exigent leur propre politique. |
| Refus | Keep, scope activité, absence d'autorisation d'exécution, politique de reprise différente ou intégrité invalide : non nul et aucune destruction interdite. Refus final annule dernier lot seulement, précédents attestés ; reçu paused tant que non achevé. Budget épuisé/arrêt/contention = non nul, jamais completed fictif ; limite atteinte n'affirme pas purge exhaustive. |
| Preuves | Décision conservation, politique expurgée, commandes/options finales/codes, UUID/JSON/reçus en base, échéance UTC/IDs/compteurs avant-après, intégrité et comparaison des activités/relations ; inventaire et politiques séparées des traces externes. |
| Remise en état | R0 ; désactiver tâche de test, reprendre le seul reçu autorisé ou le laisser suspendu dans le suivi ; keep si gel requis. Restaurer/recréer uniquement clone, sans effacer les reçus pour simuler un succès. |
| Consommateur / verdict | MEP-034 — **Non exécuté**. |
