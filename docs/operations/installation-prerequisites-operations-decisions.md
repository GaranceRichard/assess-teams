# MEP-055 — Fiches D07–D09 : persistance, SMTP et exécution

> **Analyse historique conservée.** Le mandat du 2026-11-14 retire les neuf approbations externes
> comme prérequis de développement. Le [profil courant et ses contrôles](installation-prerequisites.md)
> prévalent ; recommandations, questions d’atelier et statuts datés ci-dessous ne sont ni des décisions
> produit approuvées ni des blocages actuels. Aucun environnement MESS réel n’est déclaré qualifié.


Fiches d’atelier du 2026-11-14. [Synthèse et validation](installation-prerequisites-arbitration.md).
Toutes les recommandations sont **proposées, non approuvées**. Le
[contrat initial](installation-prerequisites.md) conserve les exigences détaillées.

## D07 — Chemins, SQLite, logs, temporaires et sauvegardes

- **Besoin opérationnel :** conserver données/configuration lors des installations et mises à jour, avec
  espaces suffisants et droits adaptés aux processus et aux exploitants.
- **Obligatoire :** même fichier SQLite local pour API/workers ; SMB/NFS, dossier synchronisé et accès
  direct multi-hôtes exclus ; droits de création/suppression des auxiliaires dans le répertoire de base.
  DELETE/FULL, DEFERRED, timeout 5 s et CONN_MAX_AGE=0 conservés ; aucune bascule WAL ni autre moteur.
- **Proposition du contrat :** séparer application/runtime et configuration/data/logs/tmp/backups ; exemples
  Windows `C:\AssessTeams\releases`, `C:\AssessTeams\runtime`, `C:\ProgramData\AssessTeams` et ses
  sous-répertoires. Aucun de ces chemins n’est configuré ni approuvé ; base actuelle sous `backend`.
- **Options pertinentes :** volumes locaux distincts ou répertoires séparés sur un volume local approuvé ;
  destination de sauvegarde protégée distincte à décider. Aucune alternative réseau pour la base active.
- **Avantages, limites et risques :** des volumes distincts isolent la saturation, avec plus d’administration ;
  un volume unique simplifie la pose mais partage capacité et panne. Des dossiers séparés sur le même disque
  n’isolent pas une panne physique. Une copie locale dans `backups` ne constitue pas seule un plan de reprise.
- **Recommandation motivée :** chemins absolus approuvés, code/runtime en lecture service, données et
  journaux hors remplacement de release ; inventorier capacité libre/réservée et destination de sauvegarde
  avec C11. Le contrat unique MEP-054/021 doit permettre cette séparation avant de la déclarer livrée.
- **Incompatibilités à vérifier :** D01/D06/D09, répertoire SQLite inscriptible et verrouillage fiable,
  collecteurs/logs externes, temporaires Python/serveur, antivirus et sauvegardes. Inclure taille base,
  journal rollback, migrations/temp, releases et copies ; faire dimensionner avec volumétrie/conservation
  C11, sans inventer quota, SLA, RPO/RTO ni fréquence de backup.
- **Responsable attendu :** exploitation/infrastructure MESS ; sécurité et propriétaire des données pour
  protection/conservation ; produit/exploitation pour les hypothèses de capacité C11.
- **Décision précise :** quels chemins absolus/volumes, propriétaires/ACL, capacité et seuils de surveillance
  à convenir sont retenus pour chaque classe ? Quelle destination protégée conserve les sauvegardes hors
  cycle applicatif et qui la provisionne ? Ne pas approuver une méthode de sauvegarde non livrée.
- **Preuve attendue :** plan de chemins/volumes et ACL approuvé daté, référence/approbateurs, relevé de
  capacité et réserves C11 explicites ; preuves de persistance/backup ultérieures dans leurs PBI.
- **Entrées aval après approbation :** MEP-054/021/060/026/064 ; MEP-027/065 consomment ensuite les
  sauvegardes cohérentes et couples version/schéma, aucune restauration réalisée ici.

## D08 — Relais SMTP interne, authentification et confiance

- **Besoin opérationnel :** remettre invitations, notifications et récupération de compte via le réseau
  interne ; distinguer persistance métier, acceptation SMTP et réception finale.
- **Obligatoire :** relais interne sans fournisseur Internet indispensable ; TLS hors loopback ou avec
  authentification, STARTTLS et TLS implicite exclusifs, expéditeur autorisé ; credentials forts complets
  ou aucun credential si relais sans authentification effectivement approuvé. Confiance TLS vérifiée.
- **Proposition du contrat :** port 587 STARTTLS ou 465 TLS implicite à discuter, sans choix approuvé ;
  valeurs réelles de relais, port, expéditeur, accès/quotas et responsables à fournir par MESS.
- **Options pertinentes :** STARTTLS ou TLS implicite selon le relais existant ; authentification par
  credentials protégés ou autorisation du compte/hôte sans credentials si la politique le permet.
  Un relais distant en clair, même interne, est incompatible avec le contrôle de production actuel.
- **Avantages, limites et risques :** STARTTLS convient à un relais de soumission compatible mais doit
  être exigé et validé ; TLS implicite chiffre dès la connexion, avec son propre port/service. Les deux
  exigent chaîne reconnue. L’authentification apporte traçabilité et rotation des secrets ; l’autorisation
  par source évite un secret SMTP mais exige restrictions réseau et accord de messagerie explicites.
- **Recommandation motivée :** retenir le mode TLS du relais MESS homologué sans imposer un nouveau
  service ; obtenir ensemble port, mécanisme d’autorisation et expéditeur. Coordonner D04/D05/D06
  et prévoir l’observation des files ; aucune bascule automatique vers un fournisseur externe.
- **Incompatibilités à vérifier :** confiance réelle Python, DNS/connectivité interne, politique de relais,
  mécanisme d’authentification supporté par le backend SMTP Django retenu, débit/quotas et timeout actuel
  10 s. Un besoin OAuth, certificat client ou mécanisme non démontré doit être instruit avant sélection,
  sans développer l’adaptation ici. SMTP accepté ne signifie pas reçu ; un état incertain exige investigation.
- **Responsable attendu :** messagerie/sécurité MESS ; exploitation pour exécution et traitement des incidents.
- **Décision précise :** quels relais/FQDN/port, mode TLS, chaîne, expéditeur, authentification/autorisation,
  limites de remise et responsables techniques/remise/incidents sont retenus ?
- **Preuve attendue :** fiche de raccordement approuvée datée avec référence/approbateurs, réserves et
  référence protégée des secrets ; recette de remise, indisponibilité et confiance dans MEP-034/068.
- **Entrées aval après approbation :** MEP-054/021/063 et essais MEP-025/034/068 ; C11/MEP-022 précise
  le dispositif humain de suivi. Aucune promesse de récupération de compte sans relais opérationnel.

## D09 — Ordonnanceur, supervision, fréquences et échecs

- **Besoin opérationnel :** assurer remise des deux files, génération des échéances et observation des échecs
  avec la même configuration/base que l’API, sans processus doublés ni suppression non autorisée.
- **Obligatoire :** commandes existantes conservées, Python absolu, répertoire `backend`, settings production
  explicites, configuration/identité/droits cohérents D06/D07 ; sorties protégées et responsables d’alerte.
- **Proposition du contrat :** ordonnanceur natif de l’OS ; Planificateur Windows pour le candidat Windows.
  Deux workers `--watch` surveillés ou invocation chaque minute sans chevauchement ; génération quotidienne
  des échéances ; `purge_journals` non activée sans décision de conservation et autorisation réelle.
- **Options pertinentes :** invocations unitaires des deux workers par ordonnanceur, ou deux processus
  `--watch` par superviseur approuvé. La génération quotidienne reste séparée de la remise dans les deux cas.
- **Avantages, limites et risques :** invocation à la minute réduit le besoin de processus permanents mais
  ajoute attente et risques de chevauchement/rattrapage. `--watch` traite toutes les cinq secondes dans le
  code actuel, mais exige redémarrage contrôlé et détection d’un processus vivant qui ne remet plus rien.
  Une tâche planifiée n’est pas un service Windows ; aucun wrapper/service n’est fourni ni homologué.
- **Recommandation motivée :** pour le candidat Windows, étudier d’abord les invocations à la minute sans
  chevauchement si MESS accepte ce délai ; sinon `--watch` supervisé avec mécanisme homologué à nommer.
  Une instance par worker au départ, génération quotidienne à heure/fuseau explicites ; purge désactivée
  jusqu’à politique/autorisation et procédures requises. Ce sont des recommandations, pas des SLA.
- **Incompatibilités à vérifier :** D01/D02/D06/D07, droits de lancement sans session interactive, injection
  identique API/commandes, redémarrage après panne, fuseau/heure d’été et interdiction du rattrapage en rafale.
  La file de récupération expire après quinze minutes avant remise ; le lien généré reste valable une heure :
  ne pas confondre ces délais ([contrat mots de passe](../architecture/password-management.md)).
  Superviser codes non nuls, âge/progression des files et états failed/unknown ; code 0 seul ne prouve pas
  la remise. Horaires, seuils d’alerte et escalade humaine restent à convenir dans C11/MEP-022.
- **Responsable attendu :** exploitation MESS pour tâches/supervision, sécurité pour droits ; messagerie
  associée aux incidents de remise. Ces rôles attendus ne sont pas des responsables déjà mandatés.
- **Décision précise :** quel mécanisme approuvé par commande, fréquence/heure/fuseau, politique de
  non-chevauchement/reprise et sorties/alertes ? Qui surveille et intervient, avec quelles réserves C11 ?
- **Preuve attendue :** plan d’exécution/supervision approuvé daté, référence/approbateurs, composants et
  droits, réserves et rôles d’incident ; essais arrêt/reprise et échecs dans MEP-025/063 et recettes ultérieures.
- **Entrées aval après approbation :** MEP-022/063/025 ; les autres dépendances demeurent et aucun
  ordonnanceur, service, seuil métier ou mécanisme de reprise n’est développé ici.
