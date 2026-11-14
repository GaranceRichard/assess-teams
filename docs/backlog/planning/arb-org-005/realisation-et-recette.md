# Conséquences de réalisation, concurrence et recettes

[Retour au dossier](README.md). **Plan conditionnel, sans autorisation d’implémentation.**
Aucun modèle, API, migration, permission, interface, hook, workflow ou mécanisme de publication modifié.

## Ordre après arbitrage humain

1. Le mainteneur rend une décision datée, attribuée, avec références R01–R09 retenues/amendées.
   L’autorité produit/MESS traite explicitement toute limitation du candidat et ses effets de recette.
2. Dans un travail ultérieur autorisé, reporter exactement cette décision dans le registre canonique,
   puis réconcilier ORG-004 et ses critères sans modifier silencieusement les dépendances/statuts.
3. Préparer ORG-004 dans son document propriétaire, réinventorier le graphe du nouveau SHA, développer
   uniquement la politique approuvée et ses garanties de provenance/refus/concurrence.
4. Qualifier le nominal et chaque vrai refus, vérifier API/UI/OpenAPI, documentation et gates applicables.
   La décision seule ne vaut ni réalisation ni recette ; la clôture demeure selon la gouvernance en vigueur.
5. Préparer puis exécuter les recettes sur le candidat MESS identifié, avec leurs prérequis propres,
   preuves attendues/observées et autorité de GO. Ce dossier n’ajoute aucun arc canonique de dépendance.

## Delta technique borné pour l’option A recommandée

Ce plan rend l’option estimable et transformable en développement, sans imposer une refonte.
Le détail d’implémentation restera soumis à la préparation et à la revue normales du dépôt.

| Lot futur | Résultat concret requis | Surfaces concernées / coût relatif |
| --- | --- | --- |
| Admissibilité | Recherche complète des équipes, familles/versions/questions, plans/runs/snapshots et notifications ; aucun filtre permettant d’ignorer les archives, brouillons ou NOT_STARTED | Vue/service Organisation, ORM et tests API ; modéré. Les modèles métier actuels peuvent garder leurs CASCADE/PROTECT comme protections secondaires |
| Refus et atomicité | Contrôle avant effet, suppression explicite des NOT_STARTED retirée de ce parcours, motifs sûrs, aucune activité de succès sur refus | DELETE et contrat d’erreur ; modéré, tests mixtes/rollback indispensables |
| Provenance des traces | Identité organisationnelle d’origine durable pour ActivityEntry/LogEntry malgré SET_NULL ; noms au moment des faits et consultation Superadmin conservés | Modèles/services/serializers Journal et contexte HTTP ; migration ciblée probablement nécessaire **dans ORG-004 futur**, jamais dans ce mandat |
| Concurrence | Ordre cohérent entre admissibilité et suppressions/créations ; refus propre en cas de perte de cible/contention ; aucun succès partiel | Transactions/écritures concernées et tests SQLite fichier/processus ; effort significatif mais borné, sans modification du mécanisme général de publication |
| Confirmation | Explication R09, messages de refus, liste seulement retirée après succès ; droits inchangés | Dialogue/API React, tests frontend et E2E ; limité à modéré |
| Qualification et documentation | S01–S11, contrats API/OpenAPI/Swagger, provenance et vrais refus, guides/recette alignés sur le choix rendu | Backend/frontend/E2E selon matrice du dépôt ; modéré, aucun chiffre de délai inventé |

### Provenance : voie de réalisation minimale proposée

Prévoir, par exemple, un identifiant d’origine scalaire immuable indépendant de la FK nullable dans
les deux tables héritant de JournalEntryFields. Initialiser depuis l’organisation autorisée lors de
l’écriture ; compléter les anciennes lignes **encore reliées** depuis leur FK, sans modifier leurs
noms historiques, acteurs, dates ou descriptions. Contrôler la cohérence avant d’autoriser DELETE.
Une valeur déjà détachée n’est pas reconstituée par son nom. Aucun nouveau référentiel d’organisations
archivées ni export général n’est nécessaire à cette voie.

Le contexte de Log HTTP doit retenir cet identifiant avant la disparition de l’instance et le
réutiliser à l’écriture après réponse ; le Log de succès est post-transactionnel aujourd’hui.
Le succès métier doit donc reposer sur l’activité de suppression atomique, qui porte aussi origine,
acteur et date, sans dépendre d’un Log middleware pouvant échouer. Conserver les traces antérieures
et permettre au Superadmin de lire/distinguer leur origine via les API existantes adaptées ; ne pas
remplacer la FK nullable exposée par un faux lien vivant. Documenter le champ d’origine séparément.

Cette garantie ne requiert pas de changer la rétention : les purges existantes gardent leur contrat.
Si le mainteneur refuse ce delta de provenance tout en maintenant la règle de contexte historique,
il faut amender l’admissibilité ou retenir D ; les seuls snapshots de noms ne satisfont pas R03.
Le coût d’A n’est donc pas celui d’un simple `exists()` ajouté au DELETE.

## Sécurité transactionnelle et concurrence à démontrer

La [vue actuelle](../../../../backend/identities/adapters/api/organization_detail_views.py) possède
`atomic`, mais ne sérialise pas explicitement le contrôle avec les producteurs de dépendances.
Atomicité du rollback et admissibilité sous concurrence sont deux propriétés différentes.
Sous SQLite, `select_for_update` seul ne fournit pas de verrou de ligne ; le dépôt dispose déjà du
[verrou d’écriture avant lecture](../../../../backend/identities/application/lifecycle.py) et de
[contrôles de contention](../../../../backend/config/sqlite_contention.py). Les examiner pour le futur
parcours plutôt que supposer que des lectures `exists()` ou les contraintes FK suffisent.

Une voie raisonnable est d’acquérir le verrou d’écriture SQLite avant la première lecture des
invariants, relire cible/dépendances, puis supprimer dans la même transaction ; sur un autre moteur,
une simple ligne Organisation verrouillée ne suffit que si les écritures dépendantes suivent un
protocole compatible. Cette qualification porte sur SQLite actuel et ne choisit aucun autre moteur.
La [création d’équipe](../../../../backend/teams/adapters/api/views.py) utilise déjà le verrou identité ;
la [planification](../../../../backend/assessments/adapters/api/schedule_serializers.py), le
[démarrage](../../../../backend/assessments/application/taking.py), les workers et le Log après réponse
ont des frontières différentes : leur compatibilité doit être vérifiée, pas présumée.

| Course à rejouer, dans les deux ordres | Invariant / verdict attendu après approbation |
| --- | --- |
| DELETE / création équipe sur O initialement admissible | Si équipe commit d’abord, DELETE refuse et conserve l’équipe ; si DELETE commit d’abord, création refuse sans activité de création commise |
| DELETE / planification ou démarrage | Équipe/modèle/plan ou run préexistent nécessairement : A refuse déjà DELETE ; début/planification autorisé peut continuer selon ses règles propres, sans suppression de son support |
| DELETE / copie ou création de référentiel, attente/récurrence | Nouvelle dépendance commise ne peut être absorbée par une cascade après un contrôle devenu périmé ; résultat conservé ou écriture refusée |
| DELETE / ajout de notification et worker de livraison | Intention liée préexistante bloque DELETE ; intention concurrente ne doit pas devenir orpheline après succès ; aucune reprise de transaction ne double un effet SMTP |
| DELETE / activité ou Log lié, dont écriture après réponse | Trace commise avant DELETE garde origine stable ; écriture après disparition conserve un contexte autorisé durable ou échoue sans altérer le succès métier ; jamais de rattachement par homonymie |
| Deux DELETE | Au plus un succès et une activité de suppression ; seconde cible absente ou refus technique explicite, jamais deuxième succès destructif |

Les tests doivent utiliser SQLite fichier, connexions/processus distincts et barrières de synchronisation,
pas seulement deux appels séquentiels ou une base en mémoire. Comparer les deux réponses et la DB après
fin des transactions. Verrou occupé, timeout ou exception d’intégrité ne constituent pas un refus métier
qualifié ; pas de faux 204, ni de 500 présenté comme succès. Les erreurs opérationnelles restent selon
le contrat du dépôt ; ne promettre ici ni nouveau code de contention ni reprise automatique générale.
[Conflits SQLite existants](../../../../backend/tests/test_sqlite_critical_conflicts.py) : méthode utile,
aucune preuve spécifique nouvelle de S10. Une intention SENDING peut déjà correspondre à un SMTP parti :
A bloque donc la suppression au lieu de prétendre l’annuler rétroactivement.

## Impacts précis sur ORG-004 et la MESS

| Consommateur | Ce qui change après décision puis réalisation | Preuve / condition de conclusion |
| --- | --- | --- |
| [ORG-004 source](../../source/05-organisations.md) et [fiche analytique](../audit-20261027/fiches/ORG-004.md) | Finaliser critères/refus avec R retenues, développer admissibilité/provenance/confirmation/concurrence ; préserver droits, comptes, identité historique | S01–S11 automatisés et observations complètes, gates du SHA réalisé ; aucune transition de statut dans la présente analyse |
| [MEP-033 — administration](../../source/mess/f19.md) | Compléter le lot FON-05 autorisé/refusé, confirmation et FON-07 Journal/Logs ; inclure équipe archivée, modèle sans run, plans/attentes | PV MESS sur candidat installé : S01–S07/S09/S11, accès résiduels et données après opération ; pas seulement capture d’un 204 |
| [MEP-034 — sécurité/isolation](../../source/mess/f20.md) | Droits, appels API directs, refus sans effet, provenance et isolement après suppression ; coordonner preuve concurrente avec le périmètre MEP-071 existant | S08/S09 et contrôles S07/S10, rôles/IDs étrangers/anonyme/CSRF, graphe complet ; tests locaux ne remplacent pas le PV cible |
| [MEP-035 — GO/NO-GO](../../tracking/mess-jalon.md) | Conserver la condition : politique décidée et protégée, ou limitation explicite réellement appliquée | Décision humaine + comportement prouvé sur même candidat ; pas de GO si cascade non arbitrée reste exposée ; NO-GO motivé ne réalise pas ORG-004 |

Les [dépendances MESS](../mess-dependances.md), [statuts PBI](../../tracking/pbis.md), cahiers
[fonctionnel](../../../quality/functional-acceptance.md) et [administration](../../../quality/functional-acceptance-admin.md)
gardent leur autorité et leurs observations historiques. Après approbation seulement, y reporter
les deltas nécessaires et leur décision source ; aucune omission de scénario ne vaut protection API.
Ne pas conditionner cet arbitrage à l’avancement des chantiers MEP-055/057 ; ne pas les modifier.

### Repli D, uniquement si approuvé séparément

Décrire le candidat concerné et l’absence temporaire de toute suppression d’organisation, y compris vide.
Une barrière serveur commune au DELETE doit refuser avant toute mutation, sans exception pour le
Superadmin, tout en conservant l’authentification et les refus de rôle. Alignement contrat/UI/documentation,
tests d’appels directs et graphe inchangé obligatoires. Toute autre surface exposant cette opération
dans le candidat doit être inventoriée et protégée, y compris une éventuelle administration Django.
Pas de changement de statut ORG-004 ni de prétention qu’A est réalisée ; lever D exigera décision,
réalisation et qualification de la politique cible. Rien de cela n’est implémenté par ce dossier.

## Revue documentaire du présent chantier

Préparation : mandat relu, autorités et code examinés avant la rédaction ; périmètre exclusivement
documentaire, donc aucun préalable technique ajouté artificiellement. Propriétaire : ce dossier planning,
avec un lien depuis l’audit historique. Aucun écart de préparation technique : aucun travail technique.

Revue de contenu agent, distincte d’une approbation humaine : acquis/propositions séparés, sources
locales vérifiées, tests présents distingués de résultats exécutés, chronologie de l’audit conservée.
README racine, AGENTS/règles/charte/DoD/stratégie, fondamentaux et contrat API examinés : aucune capacité
publique, installation, norme qualité ou API ne change ; aucune modification de ces documents nécessaire.
Le registre canonique et les statuts demeurent inchangés. Le seul ajout au diagnostic historique est
un renvoi daté vers cette proposition ; ses constats et sa base sont conservés.

Vérification de ce lot : plan documentaire `npm run quality:targeted`, contrôle du diff, taille <= 200
lignes par fichier, liens locaux/ancres et références ; aucune campagne backend/frontend/E2E requise.
Les résultats de livraison et le SHA/CI exacts sont rapportés avec la publication, sans transformer
ces contrôles documentaires en qualification de la politique proposée.

Résultats locaux : plan limité au scope documentation, terminé avec zéro échec ; 111 liens locaux
et ancres contrôlés sur les six documents, toutes cibles présentes ; diff sans erreur d’espacement.
Backend, frontend et E2E explicitement non requis pour cette publication documentaire.
