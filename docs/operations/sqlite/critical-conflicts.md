# MEP-040 — Conflits des opérations critiques

Qualification du socle `b6be4c8`, Feature FEAT-050, repère 02.03.
SQLite reste le moteur permanent. [Matrice métier](critical-conflicts-matrix.md),
[scénarios et preuves](critical-conflicts-validation.md).

## Référentiel et prérequis vérifiés

Les contrats communs [MESS](../../backlog/source/07-pre-mep.md), la fiche
[MEP-040](../../backlog/source/mess/f02.md) et les règles de contribution s'appliquent.
Les registres attestent MEP-003 (2026-10-12), MEP-039 (2026-10-15), MEP-010 (2026-10-16),
EVAL-003 (2026-10-05), USER-004 (2026-10-06) et AUTH-002 (2026-10-08) réalisés.
Leurs implémentations, contraintes, contrats et tests sont présents ; la campagne backend les réexerce.
Les preuves historiques ne sont ni réécrites ni remplacées par cette qualification.

## Diagnostic avant modification

| Domaine | Protection existante réellement utilisée |
| --- | --- |
| Passation | Bloc `atomic` de la vue et du service ; relecture du run et du scope, vérification de l'état et de la complétude ; état, provenance et Journal dans la même transaction |
| Modèle/version | UPDATE neutre de l'organisation avant lecture, compteur de famille incrémenté dans la transaction, source relue ; mêmes écritures préalables pour édition/questions/lifecycle |
| Contraintes de versions | Numéro positif, unicité famille/numéro, unicité organisation/index, une seule version VALIDATED par famille, lignées des questions et FK historiques |
| Dernier Admin | `lock_identity_changes` effectue un UPDATE neutre des organisations avant lecture du User, des membres et du compte d'Admins actifs ; activation, rôle et membres partagent cette frontière |
| Journal et notifications | Écritures dépendantes dans le bloc métier ; rollback du Journal et des intentions de mail ; SMTP après commit, sans reprise HTTP globale |

`select_for_update` reste sans verrou de ligne sous SQLite. Les garanties ci-dessus viennent des
écritures préalables ou de la transaction contenant **ensemble** lecture et écriture, pas de cette clause.
Avec DELETE et DEFERRED, un lecteur empêche un écrivain concurrent de valider tant que sa lecture
reste ouverte. Une tentative d'upgrade incompatible peut être refusée immédiatement par BUSY.
Le refus sort de tous les blocs `atomic` avant traduction HTTP ; aucune écriture partielle ne subsiste.
Une transaction ne protège pas une lecture faite auparavant : la copie relit précisément sa source
dans le service après l'écriture préalable, même si la vue l'avait déjà chargée.

Aucun défaut d'intégrité démontré ne requiert de correction applicative dans les scénarios qualifiés.
MEP-040 ajoute les preuves multiprocessus manquantes et explicite les garanties et limites acquises.
Aucun verrou local de processus, migration, statut, retry ou politique de fusion n'est ajouté.

## Invariants de finalisation

Les états `not_started`, `in_progress`, `completed` et les transitions existantes sont conservés.
Toutes les questions doivent être notées ; une note de brouillon exige encore `in_progress`.
La première complétion fixe auteur réel, nom et instant ensemble ; un seul événement de complétion
est validé. Une tentative sur un snapshot concurrent incompatible échoue sans prendre la provenance.

La répétition après commit est **idempotente** : deux réponses 200 peuvent désigner la même
complétion durable, avec auteur/date et Journal inchangés. Ce contrat n'est pas un double effet.
Une note tardive est refusée 400 sur l'état courant, ou 500 BUSY si elle tente l'upgrade d'une
lecture concurrente ; elle ne modifie jamais une complétion. Si la note est validée avant, une
finalisation manuelle ultérieure lit cette note. Il n'existe aucun retry HTTP automatique.
La révision Admin demeure le seul parcours de rectification d'une complétion, avec son Journal
et sa provenance propres ; ses validations/rollbacks existants restent couverts par le backend.

## Invariants de versionnement

`EvaluationFamily` conserve son identité et son organisation. Une copie réserve le prochain numéro
global et copie nom/questions/ordre/lignées/repères dans une seule transaction, avec le Journal.
Deux créations depuis la même source sont **compatibles** : elles obtiennent v2 puis v3, sans
écrasement, conformément à EVAL-003. Il n'existe aucun jeton de « dernière version attendue ».
Copier une ancienne version archivée reste autorisé ; son ancien numéro n'est pas une précondition
obsolète. Une source supprimée entre lecture HTTP et service est en revanche refusée 404 sans
consommer de numéro. Une source renommée avant le verrou est recopiée dans son état courant cohérent.

La validation d'un brouillon et l'archivage de l'ancienne version active sont atomiques.
Une seconde validation du même brouillon ou son édition après validation est refusée 400.
La copie et la validation peuvent réussir successivement ; les contraintes empêchent plusieurs
versions actives. Les runs, snapshots, notes et relations historiques ne changent jamais de version.
Une finalisation de passation commencée et une copie du modèle sont compatibles : aucun conflit
métier n'est inventé entre ces ressources historiques et la nouvelle version brouillon.

## Invariant du dernier Admin

Chaque organisation concernée conserve au moins un **Admin métier actif** ; un Superadmin technique
ne le remplace pas. Les organisations historiques déjà sans Admin ne reçoivent aucun compte inventé.
La désactivation POST, son alias DELETE, `PUT` avec `is_active=False`, la rétrogradation par `PUT`
et le retrait des membres sont les parcours susceptibles de réduire ce nombre.
Le contrôle est réalisé après acquisition du verrou d'écriture, avec relecture des comptes/membres.
Deux pertes individuellement valides avec deux Admins donnent un succès puis un refus 400 explicite.
Avec trois Admins, deux désactivations compatibles réussissent et laissent un Admin actif.
Un refus conserve identité, rôle, appartenance, responsabilités et intentions de notification.
L'autorisation d'administrer un Admin reste celle du Superadmin, inchangée par MEP-040.

## Refus et exploitation

| Nature | Résultat existant et conduite |
| --- | --- |
| Conflit métier | 400, précondition devenue fausse : relire l'état ; ne pas boucler ni fusionner automatiquement |
| Ressource disparue/hors scope | 404, aucune copie ni mutation ; la lecture antérieure n'autorise pas une écriture |
| Validation | 400 pour donnée/complétude invalide ; corriger la demande, pas le timeout |
| Autorisation | 403 session/CSRF/rôle selon le contrat ; aucun droit supplémentaire lié à la concurrence |
| Contention SQLite | 500 et `detail` MEP-010 « La base est occupée… » ; rollback, diagnostic corrélé, nouvelle tentative explicite seulement |

Les paramètres MEP-039 restent DELETE/FULL, DEFERRED, timeout cinq secondes, connexions séparées.
Les trois tentatives et les pauses 50/100 ms de MEP-010 restent réservées aux deux fonctions déjà
qualifiées rejouables. Aucune opération critique HTTP n'y est ajoutée. Aucun résultat incertain
après commit n'est rejoué. Les durées SQL, commit, logs et callbacks s'ajoutent ; le timeout SQLite
n'est pas une deadline HTTP. Un BUSY n'établit pas, à lui seul, un conflit métier.

Un seul écrivain, aucun SLA ni nombre garanti d'utilisateurs : matériel, volume et charge MESS
restent à qualifier par MEP-071. Les écritures SQL/bulk de maintenance ne sont pas des parcours
produit protégés par cette campagne. Conserver disque local fiable, transactions courtes et
surveillance des latences/refus/files ; ne pas augmenter le timeout pour résoudre un invariant.

## Coexistence et revue documentaire

MEP-037 modifie les permissions Utilisateurs et la navigation dans un autre worktree.
MEP-040 ne modifie aucun fichier applicatif, permission, serializer, vue ou navigation.
Les tests utilisent les parcours Superadmin existants, sans affaiblir les refus de rôle.
Le seul chevauchement documentaire identifié au diagnostic est README ; conserver les deux annonces
au rebase après publication MEP-037, puis vérifier à nouveau le candidat final et sa CI.

Revue : README, AGENTS/règles, charte, DoD, stratégie/inventaire, fondamentaux, transactions,
passation, versionnement, lifecycle, provenance/Journal, API/OpenAPI et exploitation SQLite.
Aucun endpoint, schéma, permission ni contrat de réponse modifié ; les contrôles backend existants
continuent de vérifier OpenAPI/Swagger. Nightly exhaustive et promotion MESS du SHA exact sont inchangées.
