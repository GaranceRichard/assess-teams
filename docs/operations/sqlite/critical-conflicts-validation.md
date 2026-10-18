# MEP-040 — Scénarios et preuves de qualification

[Matrice des conflits](critical-conflicts-matrix.md) ; [diagnostic et garanties](critical-conflicts.md).

## Protocole reproductible

Depuis la racine du worktree préparé :

```powershell
npm run quality:targeted -- backend tests/test_sqlite_critical_conflicts.py
```

Le fichier contient 21 scénarios paramétrés en développement et production : **42 cas**.
Chaque cas lance un interpréteur isolé, applique les migrations sur son propre fichier jetable,
puis démarre les pairs Django par `multiprocessing.spawn`. Chaque pair ouvre sa connexion,
sa session réelle et son jeton CSRF avant le rendez-vous de départ. Les permissions, vues,
serializers, ORM, contraintes, Journal et file de notifications sont les composants réels.
Les données et domaines de courriel sont exclusivement synthétiques.

La configuration de production est validée au démarrage avant remplacement du seul transport
SMTP par le backend mémoire et désactivation de la remise immédiate. Aucune requête SMTP externe.
Les tests vérifient le timeout réel de 5000 ms ; les seuls refus d'attente prolongée et au commit
réduisent localement `busy_timeout` à 100 ms pour atteindre ces branches sans attente inutile.
DELETE/FULL et DEFERRED restent ceux du produit, sans WAL ni réglage applicatif modifié.

Les Pipes signalent première tentative SQL d'écriture, Journal déjà écrit, note déjà écrite
ou source déjà lue avant le service. Le parent libère chaque opération explicitement.
Le scénario de source obsolète suspend exactement la lecture HTTP hors transaction puis supprime
la source dans un autre processus avant l'entrée du service. Aucune synchronisation par sommeil.
Les acquisitions concurrentes bloquantes ont lieu sur le fichier partagé, sans verrou de test local.

Attentes Pipe 15 s, joins 15 s (3 s après erreur), arrêt/join forcés des enfants résiduels ;
chaque requête instrumentée doit terminer en moins de 15 s et le scénario isolé en moins de 90 s.
Ces limites sont des gardes de test, pas un SLA produit. Les processus sont joints et leurs
connexions fermées avant inspection par une nouvelle connexion SQLite elle-même fermée.
L'interpréteur intermédiaire capture stdout/stderr et attend ses auxiliaires avant consolidation
pytest-cov, conformément au protocole MEP-010 et aux protections des fragments tardifs.

## Matrice des observations exigées par les tests

| Scénario | Résultats API et état durable vérifiés |
| --- | --- |
| `double_finalize` | 200/500 BUSY, une complétion ; deux répétitions 200 de deux acteurs avec représentation identique, auteur/date initiaux et une activité |
| `finalize_score` | Complétion 200, note concurrente 500 BUSY, notes 4/4 conservées et aucune activité du perdant |
| `score_finalize` | Note 204, complétion concurrente 500 BUSY ; finalisation manuelle ensuite 200 sur notes 9/4, sans perte de la note validée |
| `stale_score` | État initial connu en cours, complétion 200 puis note tardive 400 ; provenance et notes inchangées |
| `double_copy` | 201/201, v2/v3 uniques, next_version=4, copies exactes et deux activités des acteurs respectifs |
| `copy_finalize` | Finalisation 200 et copie 201 après attente, ancien run toujours lié à v1, snapshots/notes/provenance intacts |
| `copy_validate` | Validation de v2 200 puis copie de v2 201 ; v1 archivée, v2 seule active, v3 brouillon |
| `validate_copy_archived` | Validation v2 200 puis copie de v1 devenue archivée 201 ; même compteur global, aucune réécriture historique |
| `validate_edit` | Validation 200, renommage concurrent 400 immuable ; nom, active et activités cohérents |
| `double_validate` | Première validation 200, seconde 400 ; un archivage et une validation, aucune seconde transition |
| `stale_copy` | Source brouillon lue en HTTP puis supprimée dans l'autre processus ; copie 404, aucun numéro consommé par le refus ni activité de copie |
| `copy_edit` | Renommage 200 puis copie 201 ; nouveau nom relu, questions/lignées/repères cohérents |
| `double_deactivate` | Deux Admins actifs initialement, 200/400, un restant, une activité et une intention de mail |
| `double_demote` | Deux Admins actifs initialement, rétrogradations 200/400, un Admin restant, une activité de rôle et un mail |
| `deactivate_demote` | Désactivation 200, rétrogradation 400, même invariant et aucun effet du refus |
| `detach_deactivate` | Retrait 200, désactivation 400 ; un Admin actif membre, un événement de retrait, aucun mail |
| `delete_demote` | Alias DELETE 204, rétrogradation 400 ; identité conservée inactive, une activité de désactivation |
| `put_deactivate_demote` | Désactivation par PUT 200, rétrogradation 400 ; mêmes garanties que POST, sans nouvelle règle |
| `compatible_admins` | Trois Admins actifs initialement ; deux désactivations 200, un restant, deux activités et deux intentions distinctes |
| `writer_timeout` | Copie 201, copie bloquée 500 explicite ; une copie/numéro/activité, aucun retry HTTP |
| `commit_rollback` | Lecteur maintenu pendant copie/questions/compteur/Journal déjà écrits ; commit 500 BUSY et rollback intégral, source/passation antérieures intactes |

Chaque cas inspecte `integrity_check=ok`, `foreign_key_check` vide, état du run et FK historique,
assigné, provenance initiale/révision, questions/index/textes/lignées/repères et notes exactes.
Les copies vérifient aussi compteur, numéros, une seule version active et descriptions famille/version.
Le Journal vérifie le nombre exact, action, acteur FK, libellé canonique Superadmin, organisation,
cible et snapshots ; un refus n'ajoute pas d'activité de succès. Les comptes vérifient aussi le
rôle/activation/identité du perdant, les responsabilités suspendues et le nombre d'intentions de mail.
Tous les jobs restent pending : aucun réseau ni double envoi provoqué par ces opérations.
Les scénarios BUSY vérifient le diagnostic `non_replayable` et tous refusent un retry HTTP ajouté.

## Validation et intégration

La campagne initiale confirme les protections existantes ; aucune correction applicative nécessaire.
Les nouveaux tests vérifient également le statut exact de chaque version, au-delà de la seule unicité
de la version active. Aucun mécanisme métier, permission ou preuve historique n'est modifié.

Le plan automatique `quality:plan` exige documentation et **backend complet renforcé** avec couverture.
Frontend et E2E sont exclus par le pipeline actuel : aucun contrat UI/API ou fichier applicatif modifié.
Nightly et qualification MESS demeurent exhaustives ; cette livraison n'est pas une promotion MESS.
Les résultats du candidat final et la CI du SHA publié sont à consigner après exécution.
Le registre MEP-040 reste ouvert jusqu'à satisfaction des contrôles et confirmation de la CI.

## Correspondance des cas d'usage

| Attendu | Preuve |
| --- | --- |
| CU01 — Double finalisation | `double_finalize`, une mutation et une provenance ; répétition idempotente |
| CU02 — Finalisation/modification | `finalize_score`, `score_finalize`, `stale_score` |
| CU03 — Finalisation/versionnement | `copy_finalize`, relation historique inchangée ; combinaison compatible du workflow livré |
| CU04 — Double versionnement | `double_copy`, numéros/compteur et activités distincts |
| CU05 — Source obsolète | `stale_copy`, refus 404 ; `copy_edit` relit ; `validate_copy_archived` préserve la copie historique légitime |
| CU06 — Désactivations d'Admins | `double_deactivate`, `put_deactivate_demote`, `delete_demote` |
| CU07 — Rôles concurrents | `double_demote`, un Admin actif restant |
| CU08 — Activation/rôle | `deactivate_demote`, `detach_deactivate` |
| CU09 — Contention technique | `writer_timeout`, `commit_rollback`, suites MEP-010 `test_sqlite_contention_operational` et `test_sqlite_replay_safety` |
| CU10 — Refus atomique | Tous les refus inspectent mutations/Journal ; `commit_rollback` après copie et Journal déjà écrits |
| CU11 — Provenance | Acteurs distincts, FK/noms/organisation/cible/description et auteur/date initiaux inspectés |
| CU12 — Compatibilité | `double_copy`, `copy_finalize`, `copy_validate`, `copy_edit`, `compatible_admins` |
| CU13 — Acquis | Backend complet, suites transactions, versions, lifecycle, mots de passe, contrats et permissions existantes |
