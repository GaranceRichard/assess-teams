# MEP-022 — Sauvegarde, reprise et mesures

[Contrat et habilitations](operations.md) · [cycle O01–O06](operations-lifecycle.md).
Méthode de référence à implémenter par MEP-064/027/065 ; aucun outil nouveau livré ici.
Le contenu exact d'une campagne est inventorié avant essai depuis le package/configuration effectifs.

## O07 — Sauvegarde cohérente

- **Déclencheur :** exercice de référence, avant purge/maintenance destructive/upgrade, ou départ
  d'une planification explicitement configurée. Aucun intervalle MESS par défaut.
- **Rôle requis :** exploitant habilité en lecture source et écriture dans la destination protégée ;
  compte de service seulement si ces droits lui ont été explicitement attribués.
- **Entrées :** même SQLite locale que l'API, version/package et schéma/migrations, inventaire des
  fichiers persistants nécessaires, références de configuration privée/secrets, cible distincte et
  capacité libre contrôlée. Les fichiers privés restent protégés hors dépôt et hors manifeste public.
- **Geste :** utiliser l'API de sauvegarde SQLite (`sqlite3.Connection.backup` du Python local) vers
  un nouveau fichier temporaire exclusif ; jamais une copie brute du fichier actif.
  Pendant la copie en présence d'écritures, figer les changements de package/configuration et les
  migrations ; les écritures métier peuvent continuer. État et progression restent observables.
  Capturer la configuration compatible et les fichiers requis dans un lot privé protégé ; vérifier
  leur restitution. Une simple référence à un fichier devenu indisponible ne suffit pas.
  À froid, un arrêt O02 vérifié permet une copie du jeu fermé ; il ne remplace pas l'essai en écriture.
- **Sortie observable :** copie fermée, empreinte SHA-256 de l'artefact fermé, manifeste non secret
  indiquant identifiant, version, schéma, contenu, UTC début/fin, méthode et point vérifié.
  Sur copie isolée : `quick_check(1)=ok`, `foreign_key_check` sans ligne, état métier/Journal/files
  cohérent et fichiers requis présents ; qualification seulement après une restauration O08 réussie.
- **Diagnostic et échec :** destination refusée, espace insuffisant, interruption, intégrité KO,
  fichier/configuration manquant ou provenance incompatible → pas de copie qualifiée, diagnostic
  sûr et code d'échec de l'outil à livrer. Garder l'original et les copies valides intacts ; isoler
  l'incomplet, ne jamais remplacer un backup valide par celui-ci. En cas de contention/progression
  interrompue, arrêter l'essai et réessayer dans un créneau moins chargé après diagnostic.

Le stockage de sauvegarde doit être séparé du remplacement des releases et protégé par ACL.
Une copie sur le même disque ne protège pas sa perte ; une copie séparée protégée est nécessaire pour
couvrir ce risque, avec vérification après transfert. Chiffrement/protection et restitution des secrets
se règlent dans l'environnement privé ; aucun secret ni empreinte de secret dans les preuves publiques.
Copier les fichiers auxiliaires d'une base ouverte n'est pas une alternative à la méthode cohérente.
La cohérence SQLite ne garantit pas seule la cohérence avec des fichiers externes : s'il en existe,
les inventorier et figer leurs mutations ou mettre au repos leurs producteurs pendant la capture.

## O08 — Restauration et retour au service

- **Déclencheur :** exercice isolé, incident ou retour autorisé au couple sauvegardé.
- **Rôle requis :** exploitant habilité et autorité autorisant explicitement destination et point ;
  installateur si pose du runtime/package. Aucune perte réelle n'est autorisée par un essai fictif.
- **Entrées :** copie cohérente vérifiée, manifeste/empreintes et provenance, package/runtime/configuration
  compatibles avec ce schéma, fichiers nécessaires, accès privés et décision du point à restaurer.
- **Geste :** arrêter/isoler la destination O02 ; préserver son état avant toute substitution.
  Vérifier copie et compatibilité avant écriture ; restaurer d'abord dans une destination de recette
  distincte, sans écraser la source ni un autre chantier. Contrôler intégrité/FK, migrations,
  configuration et invariants ; démarrer par O01 avec les départs SMTP suspendus.
  Vérifier les acceptations du relais avant reprise des files : un backup peut contenir une intention
  devenue `sent` sur la source après sa capture. Ne pas réémettre cette intention aveuglément.
- **Sortie observable :** origine HTTPS et service contrôlés, état métier/provenance identique au
  point choisi, comparaison des jalons et files, point récupéré et durée mesurés ci-dessous ;
  reprise des tâches uniquement après contrôles et traitement explicite des incertitudes SMTP.
- **Diagnostic et échec :** backup altéré/incomplet, schéma incompatible, mauvais point, autorisation
  absente ou perte non explicitée → refus avant remplacement, destination témoin préservée et code
  non nul de l'outil futur. Si échec après copie sur clone, le garder isolé, conserver les preuves
  et la source intacte ; aucun démarrage sur état partiel ni réparation de table improvisée.

Le retour après upgrade restaure le **couple application/configuration/schéma/données** compatible.
L'ancien code sur un nouveau schéma n'est pas un retour démontré. Ne pas réintroduire un secret révoqué :
rétablir une configuration compatible avec des secrets actuellement valides et consigner cette adaptation.
Une bascule sur instance réelle exige une décision référencée tenant compte de tous les changements
postérieurs au backup, de leurs effets externes et des preuves requises ; aucune perte n'est implicite.

## Protocole de référence REP-REF-01

Le vérificateur utilise le jeu [G-R](../quality/technical-acceptance-protocol.md), exclusivement fictif,
sur clone autorisé. Identités, version/schéma, notes, lignées, auteurs/dates, activités et files sont
inventoriés ; les IDs réellement créés et les commandes finales des outils sont consignés avant essai.

1. Créer et relire un jalon métier A validé ; capturer l'état attendu et les heures de commit observées.
2. Lancer O07 pendant les écritures du [profil de charge](operations-load-protocol.md), en journalisant
   les commits fictifs par référence et ordre. Ne modifier ni version ni configuration pendant la copie.
3. Fermer et vérifier la sauvegarde ; sur la source, créer ensuite un jalon B distinct et validé.
   Pour un retour de version, ajouter le jalon U après l'upgrade réel selon MEP-065.
4. Déclencher l'incident simulé, relever le début ; l'autorité de recette choisit explicitement cette
   sauvegarde et accepte seulement l'absence de B/U sur le clone, jamais une perte de données réelles.
   Les commits concurrents absents sont également recensés avant autorisation du remplacement.
5. Restaurer sur un clone distinct par O08 ; comparer A/B/U et chaque commit concurrent inventorié.
   Un commit est entièrement présent avec son activité/intention, ou entièrement absent ; aucune
   écriture partielle, note inventée ou provenance perdue n'est conforme.
6. Relever la fin après contrôles de service et de données, puis répéter depuis l'état initial :
   trois répétitions nominales indépendantes, sans réutiliser un clone contaminé.
7. Sur copies séparées, parcourir les refus : empreinte altérée, fichier requis absent, schéma
   incompatible, point non autorisé, destination non inscriptible et interruption de sauvegarde.
   Comparer état témoin avant/après refus ; aucun faux succès ni écrasement de la source.
8. Appliquer la remise en état R0 du [protocole TEC](../quality/technical-acceptance-protocol.md) :
   fermer les connexions, libérer l'injection, vérifier les tâches/files et isoler tout clone invalide.

Les commandes finales et injections sont livrées par leurs consommateurs avant ces essais.
Ce protocole ne prétend pas que leur exécution est acquise dans MEP-022.

## Mesures et bornes

| Mesure | Instrument, calcul et preuve |
| --- | --- |
| Durée de sauvegarde | Horloge monotone : fin de fermeture de copie − début d'appel backup ; relever séparément durée de contrôle et transfert |
| Durée de reprise observée | Horloge monotone : contrôles de service/données réussis − déclenchement de l'incident ; inclure décision, arrêt, copie, démarrage et contrôles ; détailler ces phases |
| Point récupéré | Inventaire exact des jalons/commits retrouvés et absents, avec leur version/schéma et UTC de commit observée ; pas l'heure de copie du fichier |
| Écart temporel observé | UTC incident − UTC du dernier jalon validé retrouvé ; publier précision des horloges et intervalle de capture, sans prétendre identifier l'instant exact du snapshot |
| Données non récupérées | Liste protégée des commits postérieurs absents (dont B/U), nombre/type et effets externes ; confrontation à la décision de recette |
| Interruption de service | O03 : bornes UTC des probes et durée monotone si arrêt instrumenté ; publier pas d'échantillonnage et fenêtres inconnues |

Une mesure interrompue n'a pas de durée de succès ; publier durée écoulée, phase et cause d'arrêt.
Un jalon échantillonné ne prouve pas que tout le reste des données est récupéré : comparer l'inventaire.
Ces valeurs décrivent la référence observée ; aucun objectif contractuel RPO/RTO MESS n'est fixé.
Fréquence, conservation et retrait des copies réelles restent à configurer/autoriser ; aucun nettoyage
automatique n'est activé. Leur absence ne bloque pas l'exercice déclenché manuellement sur clone.
