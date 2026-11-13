# Incident B — Contention API et orchestration

> État de la phase d’audit initiale avant GO. Voir la [qualification du 12 novembre](qualification-20261112.md) et la [correction approuvée](correction.md) pour la suite.

[Job backend 4/8](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629326),
[extrait de pile](provenance.md), [chronologies expérimentales](chronologies.md).

## Faits du run historique

Seul `test_operational_contention[apis_release-development]` échoue dans la partition :
103 passés, 1 échoué, 1357 non sélectionnés. Le premier `result(first)[0] == 201` passe ;
l’assertion rouge est le statut 201 du second pair, ligne 29 de `sqlite_contention_cases.py`.
L’erreur native `SQLITE_BUSY` (code 5) remonte de la première écriture de sérialisation :
`TeamListCreateView.post` → `lock_identity_changes` → `Organization.objects.update(name=F("name"))`.
Elle est convertie en refus HTTP 500 par le handler existant, sans retry HTTP automatique.

`outcome=non_replayable elapsed_ms=0` ne mesure pas une attente nulle : à la frontière HTTP,
le logger appelle `diagnose` sans horloge de départ et imprime zéro par convention.
Les dates des piles sont celles de la restitution de stderr capturée par le test.
Aucune durée de verrou ni ordre temporel du commit et du BUSY n’est enregistré en CI.

## Protocole et transactions exacts

| Étape | Parent / pair | Garantie réelle |
| --- | --- | --- |
| Préparation | Migrations + contexte synthétique ; fermeture des connexions | Fichier neuf par test |
| Démarrage | Deux processus `spawn`, APIClient, login/session/CSRF réels avant `ready` | Connexions indépendantes |
| Configuration | DELETE/FULL, DEFERRED, ATOMIC_REQUESTS=False ; timeout configuré 5 s | Identique développement/production |
| Surcharge de test | Chaque pair exécute `PRAGMA busy_timeout=100` avant `ready` | Attente effective réduite à 100 ms pour tous les scénarios |
| Départ 1 | `go` → `write_attempt` → écriture équipe et Journal → `written` | Pair 1 suspendu dans son atomic, avant commit |
| Départ 2 | `go` → `write_attempt` | Signal envoyé avant l’appel SQL natif ; pas preuve d’entrée dans le busy handler |
| Vérification | Parent attend `not second.poll(0.03)` | Aucun message observé pendant 30 ms ; pas mesure de verrou |
| Reprise | Parent envoie `continue` au pair 1 | Autorisation de reprendre ; pas confirmation de commit |
| Conclusions | Attente des résultats 1 puis 2 | L’ordre de lecture des Pipes n’impose pas l’ordre de fin des opérations |
| Contrôles durables | Deux équipes et activités cohérentes, intégrité, FK, états de files | Exécutés après fermeture seulement si assertions précédentes vertes |

La vue prend le verrou d’écriture avant les lectures d’invariants de son bloc métier.
Authentification/permissions antérieures ne créent pas ici une transaction HTTP englobante.
La pile historique situe le refus dans cet UPDATE, pas dans une création partiellement validée.
Un défaut d’upgrade après lecture, un commit échoué ou un double Journal n’est pas démontré.
Les garde-fous sont : Pipes 15 s ; joins 15 s, ou 3 s après erreur puis kill/join ;
interpréteur scénario 60 s ; mesure `elapsed` exigée entre 0 et 5 s.
Ces bornes de test ne garantissent pas un commit du détenteur avant les 100 ms concurrentes.

La production ajoute validation HTTP, sécurité et configuration de messagerie ; le test force
HTTPS/testserver, valide les settings de production, désactive la remise immédiate et remplace
le transport mail. Il conserve les API, permissions, ORM et Journal réels.
Aucun timeout SQLite différent entre development/production n’est présent.

## Démonstration expérimentale et portée

Vingt invocations pytest inchangées : 10/10 vertes par environnement.
Deux témoins instrumentés : 201/201, intégrité et deux couples équipe/activité.
Quatre essais contrôlés : le pair 1 est suspendu 150 ms **après réception de continue** ;
le code métier, les requêtes et toutes les assertions restent identiques.
Le concurrent reçoit BUSY vers 102 ms ; le détenteur finit son commit vers 196–199 ms.
Résultats 201/500, même assertion rouge qu’en CI. Une seule équipe/activité est durable,
aucune corruption, aucun faux Journal du perdant dans les inspections externes.
La temporisation provoque le défaut pour l’audit ; elle ne corrige ni ne verdit un test.

**Défaut de l’orchestration démontré** : le succès est exigé sans contrôler sa précondition
temporelle. Les 30 ms, transports Pipe, réveil du détenteur, fin de réponse et commit doivent
tous tenir dans les 100 ms concurrents. Le parent ne contrôle ni scheduler ni latence disque.
Le contrat MEP-010 autorise justement un refus 500 après épuisement de l’attente, sans rejeu HTTP.
Le mécanisme mesuré correspond à ce contrat, pas à un défaut produit démontré.

**Cause du run du 11 : indéterminée.** Le mécanisme de test est une explication étayée,
mais les 20 succès spontanés et le retard injecté ne prouvent ni saturation historique,
ni durée réelle supérieure à 100 ms, ni identité du runtime SQLite natif.
Il faut conserver cette distinction dans toute décision de correction.

## Hypothèses départagées

| Hypothèse | Conclusion permise |
| --- | --- |
| Régression du code entre les trois campagnes | Rejetée : SHA et fichiers identiques |
| Changement observé des dépendances Python | Rejeté pour les listes installées des jobs comparés |
| Échec immédiat prouvé par `elapsed_ms=0` | Rejeté : valeur conventionnelle du logger HTTP |
| Défaut d’atomicité / perte de données produit | Non démontré ; expériences rouges conservent équipe et Journal cohérents |
| Ordonnancement défavorable / budget de test insuffisant | Mécanisme reproduit, cause historique plausible mais non prouvée |
| Saturation ou disque lent sur le runner historique | Indéterminé faute de métriques |
| Différence locale/CI | Partiellement caractérisée : Linux/Python et paquets concordants, Debian/SQLite/stockage différents |
| Spécificité development | Non démontrée : mécanisme reproduit aussi en production |

Références contractuelles : [MEP-010](../../operations/sqlite/contention.md),
[MEP-039](../../operations/sqlite/README.md), [MEP-040](../../operations/sqlite/critical-conflicts.md),
[transactions](../../architecture/sqlite-transactions.md).
Le [modèle de verrous SQLite](https://www.sqlite.org/lockingv3.html) explique l’exclusion des écrivains ;
il ne permet pas de reconstituer une durée absente des logs.
