# MEP-022 — Cycle, surveillance et interventions

[Contrat, rôles et trace commune](operations.md) ; [continuité](operations-continuity.md).
Les séquences de service ci-dessous sont définies pour REF-WIN-01, leur automatisation reste MEP-063.
Aucun nom de service Windows déjà installé n'est supposé.

## O01 — Démarrage

- **Déclencheur :** mise en service d'un candidat installé, redémarrage autorisé ou fin de maintenance.
- **Rôle requis :** exploitant habilité ; installateur si configuration, migrations ou services changent.
- **Entrées :** package/version et configuration privée compatibles, base identifiée, migrations attendues,
  ACL, espace libre, certificats locaux valides, ports, services/tâches et état d'arrêt connus.
- **Geste :** vérifier les prérequis, puis démarrer API WSGI locale, frontal TLS et tâches/workers.
  Sur le banc, une passe de chaque worker par minute ; ne pas combiner cette tâche avec un daemon `--watch`.
  La génération des échéances est distincte des deux remises SMTP.
- **Sortie observable :** processus attendus uniques, origine HTTPS et assets accessibles, migrations
  conformes, `GET /api/health/` = 200 avec `{"status":"ok","database":"ok"}` ; une lecture et une
  écriture fictives autorisées persistées puis relues en recette, files et prochaines tâches contrôlées.
- **Diagnostic et échec :** relever état/code et diagnostic sûr ; contrôler settings, chemin SQLite,
  migrations, ACL, port/TLS/proxy. Si refus de configuration ou contrôle KO, ne pas ouvrir le service
  aux utilisateurs, arrêter les composants partiellement lancés, corriger ou revenir au couple connu.
  Ne pas démarrer avec les settings de développement ni un serveur Vite/runserver sur la cible.

Le health actuel effectue `SELECT 1` ; il ne prouve ni accès aux tables, ni écriture, ni intégrité,
ni exécution des workers, ni SMTP. Les contrôles complémentaires ci-dessus sont donc nécessaires.

## O02 — Arrêt

- **Déclencheur :** maintenance, sauvegarde à froid ou incident nécessitant une mise au repos.
- **Rôle requis :** exploitant habilité, avec référence de l'intervention et du périmètre d'arrêt.
- **Entrées :** liste des producteurs (API, échéances, purge et autres tâches), workers et PID ;
  transactions/remises en cours, état des files et créneau consignés.
- **Geste :** fermer l'entrée des nouvelles requêtes, suspendre les tâches sans rattrapage automatique,
  laisser terminer les requêtes et passes en cours, puis arrêter workers/API et frontal.
  Observer leur fin ; aucune borne d'attente garantie n'est inventée.
- **Sortie observable :** aucun processus applicatif/tâche résiduel ou connexion utilisateur de la base ;
  ports libérés selon le périmètre, dernier état/code des tâches et état des files conservés.
- **Diagnostic et échec :** si transaction ou processus persiste, identifier son propriétaire et garder
  l'instance indisponible ; ne pas annoncer l'arrêt propre ni copier la base à froid.
  En arrêt forcé motivé, conserver l'incident, laisser SQLite récupérer le journal au redémarrage,
  contrôler l'intégrité et les remises `sending/unknown` ; ne jamais supprimer les fichiers auxiliaires.

## O03 — Supervision

- **Déclencheur :** chaque démarrage et chaque minute du banc, après incident et après intervention.
- **Rôle requis :** exploitant habilité ; Superadmin technique pour l'observation des files globales.
- **Entrées :** état des processus/tâches, codes de dernière passe et date du prochain départ, health
  via HTTPS, métriques système locales, journaux expurgés et files.
- **Geste :** observer disponibilité, latences/5xx/BUSY, âge du plus ancien `pending/retry`,
  volumes `failed/unknown`, état `sending`, génération des échéances, espace disque/ACL et expiration TLS.
  La capture de chaque minute est un pas de mesure de banc, sans astreinte ou seuil de service MESS.
- **Sortie observable :** série UTC des observations, compteurs/âges et incident sur contrôle échoué ;
  intervalles d'indisponibilité bornés par dernière réussite/premier échec et dernier échec/première réussite.
- **Diagnostic et échec :** health absent ou différent, tâche non exécutée, code non nul, file vieillissante,
  `failed/unknown` nouveau, disque insuffisant ou TLS invalide déclenchent investigation.
  Isoler API/base, tâche, SMTP ou frontal ; réduire les chevauchements en cas de contention,
  suspendre les tâches en défaut et reprendre après contrôle. Ne pas augmenter le timeout seul ni
  assimiler processus vivant à service complet. Conserver les trous de mesure comme inconnus.

Les instruments sont locaux : état des services/tâches Windows, compteurs OS, client HTTPS vérifiant
le certificat et pages d'administration autorisées. Aucun agent cloud ou endpoint nouveau n'est exigé.

## O04 — SMTP et échéances

- **Déclencheur :** départ périodique du banc, accumulation de file ou rétablissement du relais.
- **Rôle requis :** compte de service pour les commandes ; exploitant pour relais/configuration ;
  Superadmin technique pour les actions de reprise administrative.
- **Entrées :** même SQLite/settings que l'API, relais interne et confiance TLS, expéditeur autorisé,
  état/tentatives des deux files et preuves SMTP nécessaires aux remises incertaines.
- **Geste :** depuis `backend`, utiliser le Python absolu du service et les commandes existantes :

```powershell
python manage.py send_pending_notifications --settings=config.settings_production
python manage.py send_password_reset_emails --settings=config.settings_production
python manage.py send_due_evaluation_notifications --settings=config.settings_production
```

Ici `python` désigne le runtime privé déjà installé ; ne pas résoudre arbitrairement le Python du PATH.
Les deux premières commandes font une passe ; la dernière génère les échéances quotidiennes.
Ne jamais programmer `--watch` chaque minute. Les limites, états et droits restent ceux du
[contrat SMTP](../architecture/email-notifications.md) et de l'[inventaire](configuration/email.md).

- **Sortie observable :** code, compteurs et transitions en base ; `sent` signifie acceptation SMTP,
  sans preuve de livraison finale. La sortie « planification notifiée » signifie mise en file.
  La récupération acceptée/inéligible disparaît de sa file conformément à son contrat.
- **Diagnostic et échec :** code nul avec `failed/retry/unknown` n'est pas un succès de remise.
  Rétablir relais/TLS/authentification sans désactiver leurs protections ; laisser les reprises
  temporaires bornées, traiter les permanents via l'admin, sans rejouer l'action métier.
  Pour `unknown`, vérifier les traces du relais : acceptation confirmée → clôturer sans renvoi ;
  absence d'acceptation vérifiée → action dédiée de reprise ; preuve indécidable → garder l'incertitude.
  Ne pas réinitialiser la fenêtre de récupération de quinze minutes ni renvoyer aveuglément.

## O05 — Purge technique

- **Déclencheur :** simulation de préparation, puis passage explicitement autorisé ou reprise d'un reçu.
- **Rôle requis :** exploitant habilité ; autorité compétente pour la conservation et l'exécution.
- **Entrées :** [MEP-042](configuration/journal-retention.md), durée technique approuvée, sauvegarde
  cohérente restaurable, référence réelle d'autorisation, périmètre et bornes du reçu.
- **Geste :** suivre exclusivement la [procédure MEP-020](journal-purge.md) : simuler par défaut,
  examiner le reçu puis exécuter avec `--execute --authorization` et lots bornés ; planifier sans
  chevauchement seulement après autorisation. Une référence syntaxiquement valide ne prouve pas l'accord.
- **Sortie observable :** JSON expurgé, UUID et reçu persistant ; code 0 et `completed` requis ;
  `limit_reached` n'implique pas que tout le reliquat est supprimé, simulation implique `deleted=0`.
- **Diagnostic et échec :** sans décision, avec `keep`, gel de preuve, durée invalide, intégrité KO,
  périmètre métier ou politique changée, refuser/suspendre. Après interruption/code non nul,
  inspecter le reçu et reprendre son UUID selon MEP-020, sans modifier le reçu pour forcer le succès.
  Les lots validés restent acquis ; ni activité métier ni sauvegarde ni fichier serveur ne sont purgés.
  Une suppression SQLite ne garantit pas un effacement physique.

## O06 — Maintenance

- **Déclencheur :** incident diagnostiqué, évolution autorisée de configuration/certificat/package,
  vérification préventive ou besoin d'espace.
- **Rôle requis :** exploitant habilité ; installateur pour migrations/package/ACL ;
  autorité requise avant tout remplacement destructif.
- **Entrées :** diagnostic, changement précisément autorisé, couple version/configuration/schéma,
  sauvegarde vérifiée, point de retour et contrôles de sortie identifiés.
- **Geste :** consigner l'état initial, arrêter selon O02 si nécessaire, préserver configuration/données,
  appliquer uniquement la procédure du changement, puis O01/O03. Pour un upgrade, suivre MEP-026
  lorsqu'il sera livré ; aucune commande de downgrade ou de modification de schéma improvisée.
- **Sortie observable :** version/configuration attendues, migrations compatibles, contrôles métier
  et intégrité satisfaits, pas de processus résiduel/double effet, durée d'interruption mesurée.
- **Diagnostic et échec :** arrêter si incompatibilité, migration échouée, sauvegarde absente ou
  perte non autorisée ; conserver les fichiers en place et les preuves. Revenir uniquement à un
  couple compatible selon la [reprise](operations-continuity.md), sans lancer un ancien code sur
  le schéma modifié. Ne pas supprimer base/journal/sauvegardes pour libérer de l'espace, ni imposer
  WAL, VACUUM ou une purge métier sous couvert de maintenance.
