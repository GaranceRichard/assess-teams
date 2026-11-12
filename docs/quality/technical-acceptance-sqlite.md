# MEP-031 — SQLite, concurrence et stabilité

[Index](technical-acceptance.md) · [P0, jeux G, R0 et PV](technical-acceptance-protocol.md).
Les [mesures MEP-039](../operations/sqlite/measurements.md) et les suites multiprocessus sont des preuves
de développement sur fichiers jetables. Elles ne mesurent ni capacité ni disponibilité de la cible MESS.
L'incident CI du 11 novembre 2026 est en investigation indépendante ; aucune origine ni flaky test présumé.

## TEC-08

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-08 — Vérifier la configuration réelle et un refus de contention sans effet partiel ni rejeu dangereux. |
| Références | [MEP-039](../operations/sqlite/README.md), [MEP-010](../operations/sqlite/contention.md), [preuves MEP-010](../operations/sqlite/contention-validation.md), [atomicité MEP-003](../architecture/sqlite-transactions.md). |
| Préconditions | P0 ; exploitant SQLite et recette ; fichier local partagé par API/workers, aucun SMB/NFS/dossier synchronisé ; services MEP-063 ; G-S/G-N sur clone. Instrumentation cible et synchronisation des processus validées par MEP-071/C11 avant injection. |
| Données | Une création d'équipe, un archivage admissible, jobs de récupération et échéance distincts ; état des objets, activités, files et compteurs avant chaque variante. |
| Procédure | 1. Lire via connexion Django au fichier cible les PRAGMA du protocole à l'ouverture puis à une seconde ouverture ; vérifier les settings effectifs. 2. Faire la mutation nominale. 3. Rejouer avec écrivain indépendant tenant le verrou, puis lecteur tenant une transaction qui empêche le commit ; libérer selon le protocole approuvé. 4. Couvrir API sans retry et les deux opt-in `claim_password_email`/`deliver_due_schedule`, y compris après rollback au commit. 5. Suspendre SMTP après acceptation puis provoquer le refus d'écriture de fin ; constater absence de nouvel envoi. 6. Fermer tous les pairs et vérifier objets/Journal/files et intégrité depuis une nouvelle connexion. |
| Injection | Barrières explicites avant lecture, écriture, commit et SMTP, reprises des méthodes des suites existantes ; pas de simple sommeil supposant un ordre. Outil/harness cible, durée du verrou et condition d'arrêt : à finaliser par MEP-071/C11 ; ne pas lancer pytest sur la base cible ni réduire son timeout à celui des fixtures. |
| Attendu | DELETE/FULL (`synchronous=2`), busy_timeout=5000, FK=1 ; DEFERRED, ATOMIC_REQUESTS=False, CONN_MAX_AGE=0. Attente libérée : succès unique ; BUSY non résolu : rollback intégral, API 500 avec message MEP-010 et corrélation, worker en CommandError non nul. Trois tentatives maximum seulement pour les deux opt-in, rollback avant reprise, aucun rejeu après commit/SMTP. |
| Seuil | Valeurs techniques MEP-039/010 fixes ; 5 s de timeout et fenêtre de reprise 6 s ne sont pas des deadlines HTTP. Durées d'injection, latence et budget d'échecs : `À définir — C11 / MEP-022`. |
| Refus | Accepter uniquement le BUSY natif identifié et traduit par le contrat, jamais un 500 inattendu. Perdant sans équipe/activité/intention partielle ; après acceptation SMTP : sending puis traitement unknown, aucun renvoi aveugle. LOCKED, panne disque ou texte ressemblant à un verrou ne justifient pas un retry. quick_check(1)=ok et foreign_key_check sans ligne. |
| Preuves | PRAGMA/settings et chemin non secret, PID/barrières/horodatages, réponses/codes, logger sûr `config.sqlite_contention`, comptes de tentatives, états avant/après et résultats d'intégrité ; acceptation SMTP corrélée. |
| Remise en état | R0 ; rollback/fermeture du détenteur, arrêt et jonction des processus d'injection ; traiter unknown par TEC-11. Aucune suppression de fichier auxiliaire ou hausse arbitraire du timeout. |
| Consommateur / verdict | MEP-071 — **Non exécuté**. |

## TEC-09

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-09 — Exclure les doubles effets incompatibles en préservant opérations compatibles et provenance. |
| Références | [MEP-040 : invariants](../operations/sqlite/critical-conflicts.md), [matrice exhaustive des combinaisons](../operations/sqlite/critical-conflicts-matrix.md), [méthode et preuves](../operations/sqlite/critical-conflicts-validation.md). |
| Préconditions | P0 ; TEC-08 nominal, G-S avec clone par combinaison ; Superadmin pour dernier Admin, Admin/Coach selon droit ; harness cible à barrières MEP-071 approuvé, aucun `select_for_update` considéré comme verrou de ligne SQLite. |
| Données | Run complétable, run commencé et note initiale, modèle source/copies/brouillon/active, organisations avec deux puis trois Admins ; relevé complet provenance, compteurs, questions/lignées, activités et intentions. |
| Procédure | 1. Rejouer chaque ligne de la matrice MEP-040 en fixant l'ordre lecture/verrou/commit par barrières et en notant cet ordre. 2. Couvrir deux finalisations, finalisation/note, finalisation/copie ; deux copies, validation/copie source courante ou archivée, deux validations, validation/édition, renommage/copie, suppression source/copie. 3. Couvrir désactivation/rétrogradation/retrait/DELETE avec deux Admins, puis cas compatible avec trois. 4. Après fermeture des pairs, relire par connexion neuve les invariants de chaque ligne ; répéter la finalisation après commit pour distinguer idempotence et double effet. |
| Injection | Chevauchements contrôlés et précondition modifiée avant engagement du service ; écrivain prolongé et lecteur empêchant commit selon TEC-08. Aucun changement de tests pour reproduire un résultat supposé de l'incident CI. |
| Attendu | Résultats exacts par ligne : finalisation durable unique et répétition 200 sans nouvelle activité ; note tardive 400 ou BUSY documenté ; deux copies compatibles 201 avec numéros successifs, une active ; deux validations : 200 puis 400 ; source disparue : 404 sans numéro consommé ; dernier Admin protégé, un seul succès sur deux pertes incompatibles. |
| Seuil | Invariants exacts MEP-040, aucune tolérance de double effet/corruption ; charge, répétitions et durées de campagne : `À définir — C11 / MEP-022`. Les nombres de répétitions des essais locaux ne sont pas un objectif MESS. |
| Refus | Perdant conserve note/identité/liens et ne produit ni copie partielle, numéro consommé, Journal ou notification de faux succès ; auteur/date/snapshots conservés. Deux 200 idempotents ne sont pas deux premières finalisations. Un refus artificiel de copie d'ancienne version est aussi un échec. |
| Preuves | Tableau combinaison/ordre réel/statuts, barrières et corrélations, inventaire avant/après de tous les invariants de la matrice, intégrité finale. Refus métier distingué du BUSY technique. |
| Remise en état | R0 ; conserver le clone de preuve de chaque combinaison, puis recréer un état initial identifié ; aucune édition manuelle de provenance ni réactivation cachée d'Admin. |
| Consommateur / verdict | MEP-071 — **Non exécuté**. |

## TEC-10

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-10 — Mesurer les limites du candidat sous charge réelle API/workers et après interruption, sans déduire un SLA des tests. |
| Références | [limites MEP-039](../operations/sqlite/README.md), [C11](../backlog/planning/audit-20261027/decisions-mess.md), [MEP-071](../backlog/source/mess/f20.md), [services MEP-063](../backlog/source/mess/f14.md). |
| Préconditions | P0 ; C11 charge/disponibilité/méthode approuvées, services et instruments disponibles ; recette, exploitation et propriétaire d'usage ; clone représentatif identifié sans données réelles ni campagne voisine. |
| Données | G-S/G-N/G-J complétés aux volumes approuvés (questions/runs/journaux/files/utilisateurs) ; répartition lectures/écritures/connexions/SMTP et concurrence fixées avant exécution ; inclure les écritures des Logs HTTP. |
| Procédure | 1. Vérifier état/repos et oracles métier. 2. Appliquer montée, palier et durée de stabilité du protocole C11 signé via l'outil de charge retenu par MEP-071. 3. Exécuter API et workers sur le même fichier ; collecter latence, taux d'erreurs, BUSY, ressources, âge des files et intégrité. 4. Injecter arrêt/restart de TEC-12 puis mesurer retour au service et résorption. 5. Confronter chaque mesure aux seuils et conserver la limite observée sans l'extrapoler. |
| Injection | Saturation jusqu'à la limite approuvée et interruption service contrôlée ; conditions de sécurité/arrêt, fenêtre et cadence à décider. Aucun générateur de charge MESS ni commande cible n'est livré dans le dépôt : propriétaire MEP-071, protocole MEP-022. |
| Attendu | Pendant nominal, invariants intacts et mesures dans contrat ; pendant dépassement, diagnostic et refus sans faux succès/effet partiel ; après restart, intégrité et queues cohérentes, service rétabli selon C11. |
| Seuil | Volumes, concurrence API/workers, débit/mix, durée/paliers/répétitions, latence/percentiles, erreurs admissibles, ressources, délai de file, disponibilité et reprise : **`À définir — C11 / MEP-022`**. Voir valeurs, décideurs, usages et blocages dans la matrice. |
| Refus | Dépassement du seuil approuvé, perte/corruption, double effet, worker concurrent indésirable ou verrou sans diagnostic = échec. Seuil/instrument/fenêtre manquant = Bloqué, pas « stable » par absence de crash ; un gate rouge ne valide aucune mesure. |
| Preuves | Décisions et profil exact, outil/version/paramètres, mesures brutes horodatées par phase, formules et agrégats, événements d'interruption, PID, ressources/queues/invariants avant-après, anomalies et intégrité. Disponibilité = temps disponible / fenêtre contractuelle, exclusions seulement si approuvées. |
| Remise en état | R0 ; arrêter le générateur et tous ses processus, attendre/contrôler les files suivant contrat, rétablir les services uniques et isoler toute base suspecte. |
| Consommateur / verdict | MEP-071 — **Non exécuté**. |
