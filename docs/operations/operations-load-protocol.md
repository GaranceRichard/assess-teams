# MEP-022 — Protocole de charge de référence CHG-REF-01

[Contrat](operations.md) · [mesures de reprise](operations-continuity.md).
Le projet fixe ici un profil d'essai reproductible ; ces nombres ne dimensionnent pas MESS et
n'ajoutent aucun SLA. Les invariants restent ceux des contrats acquis et des scénarios TEC-08/09/10.

## Banc et données

- REF-WIN-01 : Windows Server 2022 x64, 2 vCPU, 4 Gio RAM, disque local de 40 Gio ; relever espace
  libre, stockage/build et versions exactes réellement testés. Toute différence donne une variante nommée.
  Python 3.13 x64, WSGI/frontal du profil, SQLite DELETE/FULL, timeout 5 s, DEFERRED et FK actives.
- Runtime, package, assets, certificats et outils de mesure préparés ailleurs puis disponibles localement.
  Accès Internet bloqué, clients HTTPS et relais SMTP de recette sur réseau interne autorisé ;
  aucun envoi réel, aucun seed développeur, aucun Node/npm/Docker sur cible.
- Reprendre [G-A/G-S/G-N](../quality/technical-acceptance-protocol.md) et
  [G0–G3 FON](../quality/functional-acceptance-data.md), avec Alpha/Beta, rôles distincts,
  modèle à deux questions et témoins hors scope. Garder les jeux fonctionnels originaux inchangés.
- Dans la seule extension de charge, préparer quatre Coachs Alpha distincts, quatre équipes actives
  et quatre passations IN_PROGRESS indépendantes, chacune assignée à son Coach et au modèle à deux
  questions. Notes initiales [5, non noté], version exacte figée ; aucune finalisation dans la boucle.
  Préparer une invitation et une récupération fictives ainsi qu'une échéance réellement due pour G-N.
- Avant chaque répétition, recréer le clone initial autorisé ; relever IDs, comptes privés, relations,
  versions, activités/files, nombre de lignes et taille de base. Aucune cardinalité MESS extrapolée.
  La répétition fournit une nouvelle identité de campagne ; aucun partage de base entre campagnes.

## Charge applicative définie

| Paramètre | Valeur du profil |
| --- | --- |
| Clients simultanés | Paliers successifs 1, 2, 4 ; un Coach/session/passation distinct par client |
| Cycle par client | Cinq appels séquentiels : lire dashboard, liste des passations, détail de sa passation, résultats autorisés, puis enregistrer la première note de sa passation |
| Écriture | Valeurs explicites 0, 5, 10 en rotation par cycle ; deuxième question non notée ; relire la valeur finale au contrôle |
| Cadence | Au plus un cycle par seconde/client ; si cycle > 1 s, repartir après sa fin sans rafale de rattrapage |
| Préparation | Connexion/CSRF hors mesure ; session conservée, aucun test de force brute mêlé à la charge |
| Bornes instrumentales | Client : 30 s par appel, sans rejeu automatique ; drainage : 60 s puis arrêt de campagne et diagnostic des effets indécidables |
| Durées | Échauffement 60 s puis fenêtre mesurée 300 s par palier ; arrêt de la production puis drainage observé |
| Répétitions | Trois répétitions par palier, chacune depuis clone initial ; ordre 1, 2, 4 pour chaque série |
| API et workers | Configuration serveur consignée, une instance de chaque worker ; une passe par minute sans chevauchement ; échéance au début de la fenêtre mesurée |
| Mix | Quatre lectures pour une écriture sollicitée ; inclure écritures de Logs HTTP, files, échéances et workers dans l'analyse SQLite |

Les endpoints, corps CSRF et droits proviennent des contrats
[dashboard](../architecture/dashboard-api.md), [passation](../architecture/evaluation-taking.md)
et [résultats](../architecture/results-api.md). Avant essai, figer dans la fiche de campagne leurs
requêtes exactes et IDs à partir du candidat ; aucun endpoint de charge nouveau n'est créé.
Le générateur cible et son enregistrement des temps seront finalisés par MEP-071 ; ce contrat
définit la séquence et les paramètres sans livrer cet outil. Aucun pytest contre la base de l'instance.

## Instruments et déroulement

1. Relever SHA complet, manifeste/version, configuration expurgée, OS/CPU/RAM/disque, runtime/SQLite,
   versions WSGI/frontal/client/instrument et état initial selon P0 du protocole TEC.
2. Utiliser un client local préparé hors ligne, avec horloge monotone pour chaque requête et UTC
   pour la corrélation. Relever départ, fin, statut, type d'appel, succès/refus/erreur et corrélation sûre.
   Ne conserver ni cookie, ni token, ni corps sensible. Les temps incluent réseau et attente serveur.
3. Contrôler O01/O03 ; lancer chaque répétition selon le tableau. Échantillonner chaque minute :
   health, processus, CPU/mémoire, espace, files et tâches ; relever aussi début/fin et dernier état.
4. Après drainage, comparer notes, provenance, activités et intentions avec les succès effectivement
   validés ; vérifier absence d'effet partiel/doublon, lecture Beta inchangée et isolation.
   Contrôler `quick_check(1)=ok` et `foreign_key_check` sans ligne depuis une nouvelle connexion.
5. Pour l'essai de backup en écriture REP-REF-01, utiliser le palier de deux clients, déclencher la
   sauvegarde 60 s après le début de la fenêtre mesurée. Noter tout décalage réel ; une sauvegarde
   encore active en fin de fenêtre fait l'objet d'un diagnostic, jamais d'un résultat inventé.
6. Arrêter, remettre en état par R0, publier les résultats séparés par variante/palier/répétition.
   Un écart au matériel, aux requêtes, aux données ou à la cadence constitue une variante explicite.

Conserver les latences brutes ; publier n, P50, P95 et maximum par type et par issue.
Convention : trier les n durées, percentile p = rang `ceil(p × n)` (indexation à 1) ; n=0 → non mesuré.
Débit utile = mutations réussies / secondes de fenêtre mesurée ; publier séparément appels/s,
refus attendus, erreurs inattendues et temps de drainage. Ne pas fusionner refus rapides et succès
dans un P95 qui masquerait l'indisponibilité. Aucune limite de latence ou débit cible n'est inventée. Les bornes instrumentales interrompent
un essai bloqué ; elles ne constituent ni SLA ni garantie de terminaison serveur. Après timeout
client, vérifier la mutation en base avant toute action, sans présumer qu'elle a été annulée.

## Refus et conditions d'arrêt

La campagne nominale n'attend aucun refus métier ni erreur technique ; leur présence est un résultat
à diagnostiquer et interdit de déclarer le palier nominal concluant. Les latences élevées restent
des mesures publiées ; elles ne deviennent pas un SLA ajouté au backlog.

Sur variantes séparées, reprendre les barrières des [preuves MEP-010](sqlite/contention-validation.md)
et des [conflits MEP-040](sqlite/critical-conflicts-matrix.md) ; MEP-071 finalise l'injecteur avant essai :

- Verrou d'écriture libéré après 200 ms : vérifier attente et succès unique ; verrou conservé jusqu'au
  refus : vérifier diagnostic BUSY, rollback et absence de rejeu non autorisé. Le garde-fou de
  l'injecteur expire après 30 s : fermer/libérer le verrou et déclarer l'essai interrompu si le résultat manque.
- Lecteur bloquant le commit et écritures métier incompatibles : contrôler les invariants exacts ;
  aucune erreur serveur inattendue n'est un refus conforme. Le timeout 5 s n'est pas une deadline HTTP.
- SMTP indisponible : succès métier persistant, reprise bornée ; incertitude après soumission sans
  renvoi aveugle, selon O04. Les autres injections TEC restent dans leurs fiches.

Arrêter immédiatement le palier en cas de corruption, incohérence métier, fuite de données,
processus d'injection bloqué ou absence d'espace nécessaire au journal/backup ; isoler le clone et
conserver les preuves. Sur erreur inattendue, arrêter la production, diagnostiquer puis reprendre
depuis l'état initial ; ne pas masquer l'échec en ajustant après coup un budget de tolérance.
La limite matérielle de sécurité est vérifiée avant essai depuis la taille des fichiers et la capacité
du volume isolé ; ne jamais saturer un volume partagé ni modifier le timeout pour fabriquer un succès.

## Acquis réutilisables et limites

Les [126 observations MEP-039](sqlite/measurements.md) restent les mesures acquises, avec leur
runtime Windows 11/Python 3.12.10/SQLite 3.49.1 ; elles ne sont pas des résultats REF-WIN-01.
Leur commande `python -m tools.sqlite_concurrency --output report.jsonl --repeats 3`, depuis `backend`,
crée uniquement des bases jetables, compare 1/2/4 écrivains et inclut WAL expérimental.
Elle est un diagnostic synthétique distinct ; ne pas activer WAL sur l'instance pour la reproduire.
Les tests API/workers existants prouvent leurs invariants de développement, pas ce profil de charge.
Une fenêtre courte et quatre clients ne prouvent ni capacité maximale ni stabilité prolongée :
MEP-071 étend la campagne selon son périmètre et publie les limites du candidat réellement testé.
