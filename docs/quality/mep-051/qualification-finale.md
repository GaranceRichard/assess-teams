# MEP-051 — Qualification finale et proposition de clôture

Examen indépendant du 2026-11-09 (America/Toronto), base `e2999b2` issue du dernier `origin/main`.
Branche `qual/mep-051-final`, worktree temporaire dédié ; aucun chantier voisin modifié.

**Verdict : critères démontrés dans le périmètre qualifié ; clôture fonctionnelle proposée.**
Aucun écart bloquant identifié après confrontation aux pièces brutes, au code et aux journaux CI.
L'approbation fonctionnelle explicite reste requise : **MEP-051 demeure Ouvert / N/A**.
Ce document ne constitue ni une décision de clôture ni une recette MESS.

## Référentiel et nature des preuves

Le [contrat canonique F08](../../backlog/source/mess/f08.md), la
[fiche raffinée](../../backlog/planning/audit-20261027/fiches/MEP-051.md), le
[rapport historique](README.md) et son [inventaire](preuves.md) sont rapprochés des pièces réelles.
Les huit scénarios ci-dessous reprennent la demande de qualification finale, sans modifier C10.

- **Réexécuté ici :** contrôle tailles/SHA-256 des 18 pièces inventoriées (18 conformes),
  des quatre entrées applicatives (4 conformes), inspection Git, lecture CI distante et chronologie locale.
- **Historique réutilisé :** exécutions rouge/vert du 6 novembre, captures et campagnes exactes ci-dessous.
  Aucun test applicatif ni aucune campagne exhaustive supplémentaire n'est lancé par ce lot documentaire.
- **Assertions seules :** les déclarations du rapport ne servent pas seules à établir la chronologie,
  les résultats de tests ou la livraison. Les limites manuelles non exécutées restent explicitement exclues.

Correctif : `5f2bb226b4f8f4865736e64060f247fe3fb67819` (abrégé `5f2bb22`).
Base initiale : `5f212e5642aef97ece27cce897e85f3851b44a80`.
Base exhaustive ultérieure : `550efa5e52648c3ae934421b29c10121eb091471`.

## Matrice critère, scénario, SHA, preuve, résultat et verdict

| Critère | Scénario | SHA | Preuve examinée | Résultat | Verdict |
| --- | --- | --- | --- | --- | --- |
| Erreur accessible et confidentielle | 1 — 500 et panne réseau utilisateurs | `5f2bb22` | `mep-051-unit-red.txt`, `mep-051-reproduction.txt`, vert ciblé ; `ManagedUserRecovery.test.ts`, `error-invitation-recovery.spec.ts` | Diagnostic fictif réellement affiché avant correction ; message fixe après, alerte du dialogue, aucun diagnostic brut ; réseau vérifié par mock fetch | Conforme au périmètre automatisé |
| Conservation et reprise | 2 — invitation Admin, modification Viewer par Coach | `5f2bb22` | E2E utilisateurs et journal vert, `DialogPending.test.tsx` | Identifiant/mail conservés, Valider disponible ; levée de l'interception puis vrais 201/200 et une ligne UI | Conforme ; pas de nouvelle permission |
| Planification | 3 — POST/PUT 400 réels puis correction | `5f2bb22` | `error-planning-recovery.spec.ts`, journaux et captures ; assertions ORM | Responsable sans mail refusé ; cinq champs conservés au PUT, équipe/modèle/responsable non vides au POST ; zéro objet après POST refusé, ancienne cadence/date après PUT refusé ; reprise et un seul ID final relu | Conforme, limites des assertions ci-dessous |
| Absence de faux succès | 4 — refus et résultat incertain | `5f2bb22` | Tests fetch, E2E planification/utilisateurs, `test_email_queue.py` | Un appel fetch avant reprise explicite ; pas de succès SMTP inventé ; aucune écriture partielle de planification ; état SMTP unknown non relancé automatiquement | Conforme ; aucune garantie universelle d'exécution unique réseau |
| Notifications SMTP | 5 — métier réussi, transport indisponible | `5f2bb22` | `mep-051-smtp.txt` (49 verts), `test_email_business.py`, file/admin | SMTP 451 simulé : 201 métier, état retry ; une occurrence et reprise du seul destinataire en échec ; acceptation requise pour sent | Conforme ; pas de remise réelle en production attestée |
| Non-régression UX/sécurité | 6 — acquis 017/018/045/049/050 | `5f2bb22`, `550efa5`, `e2999b2` | Clôtures liées ci-dessous, diff Git et exhaustive ultérieure | Contrats et décisions conservés ; changements de planification 018 couverts par la base ultérieure ; pas d'identité globale des entrées prétendue depuis le premier correctif | Conforme dans leurs portées respectives |
| DoD | 7 — toutes obligations applicables | Mêmes SHA | Revue ci-dessous et [chronologie probante](chronologie.md) | README écrit et commande réussie avant ajouts de tests/correction ; gates historiques verts, documentaire frais requis pour ce lot | Conforme sur l'acquis ; livraison du présent lot à confirmer |
| Refus de clôture | 8 — preuve ou décision manquante | `e2999b2` | Registre canonique et présente proposition | Aucun écart bloquant établi ; approbation fonctionnelle pas encore donnée | Ouvert / N/A maintenu jusqu'à décision |

## Contrôle des résultats et portée exacte

Les cinq journaux initiaux relus attestent quatre échecs techniques / un succès métier avant correction,
20 tests React après, quatre E2E après et 49 backend ciblés. Le rouge navigateur retenu est l'Admin
avec `DIAGNOSTIC_CONFIDENTIEL_FICTIF` ; le timeout Coach non autorisé n'est pas un défaut produit.
Les tentatives avec sélecteur strict, conflit de port/base sont exclues du verdict produit.

Le 500 est **intercepté avant le serveur** : il ne prouve pas un rollback après 500 serveur réel.
Le réessai désintercepté traverse le vrai backend ; l'unicité utilisateur observée est une ligne UI,
non une assertion ORM dans cette spec. La panne réseau est simulée dans les tests de la couche API,
non une coupure physique. Le nombre d'appels vérifié borne l'absence de relance automatique à ces appels.
Les vrais 400 de planification utilisent la validation serveur et la base Django ; le POST ne compare
pas explicitement les trois identifiants à leurs valeurs antérieures, contrairement au PUT qui compare
les cinq valeurs. Captures historiques et reprise complètent cette observation sans élargir l'assertion.
Aucune preuve de tous les types possibles de mutations ou d'absence de doublon après toute coupure réseau.

[CI exacte 42270139865, tentative 1](https://github.com/GaranceRichard/assess-teams/actions/runs/42270139865)
relue : push de `5f2bb22`, completed/success ; plan, repository, frontend, E2E et Required impact gate verts.
Backend/full ignorés conformément au plan frontend : aucun coverage backend global déduit des 49 tests.
Job frontend `128072363098` : 478 tests / 116 fichiers ; couvertures statements 94,57 %, branches 93,06 %,
fonctions 95,97 %, lignes 95,45 % ; lint, formatage, typecheck/build verts.
Job E2E `128072363362` : **138 applicatifs + 10 démo**. La campagne locale initiale de l'inventaire
compte **134 + 10** : ce sont des campagnes distinctes, pas un résultat CI de 134.

[Exhaustive ultérieure 42489438995, tentative 1](https://github.com/GaranceRichard/assess-teams/actions/runs/42489438995)
relue : schedule de `550efa5`, completed/success, tous les 16 jobs verts, huit partitions backend,
deux E2E et consolidation finale. Backend global : 1 461 tests, 97,50 % ; frontend : 493 tests,
94,87 / 93,32 / 96,35 / 95,71 %. Le diff `550efa5..e2999b2` contient uniquement du Markdown.
Cette preuve ultérieure couvre la base applicative courante ; elle ne remplace pas la CI du correctif
et ne qualifie pas un futur candidat MESS par anticipation.

## Revue DoD et impact documentaire

| Obligation applicable | Preuve / conclusion |
| --- | --- |
| Fonction, conception, Clean Code | Diff borné à request dans managedUsers.ts : capture d'échec fetch, traitement 5xx, validations métier conservées ; aucun nouveau domaine ou contrat. Matrice et vrais refus examinés. |
| 200 lignes, lisibilité, absence de secrets | Huit fichiers historiques sous la limite ; gate repository historique vert. Données fictives, aucun diagnostic réel utilisé ; contrôles documentaires frais pour ce lot. |
| Tests positifs/négatifs et non-régression rouge/vert | Logs avant/après intègres, tests et assertions inspectés ; distinction harnais/produit maintenue. |
| Intégration, API, permissions et E2E | Reprises avec backend réel ; 400 et ORM planification ; SMTP simulé avec vrais modèles/transactions ; aucune permission nouvelle. |
| Couvertures, lint, formatage, typage/build | CI exacte et exhaustive ultérieure ci-dessus ; aucun seuil global attribué à la sélection de 49 tests. |
| README préalable | [Trace chronologique](chronologie.md) indépendante du commit final et du seul rapport ; aucune dérogation nécessaire ni héritée de MEP-018. |
| Revue documentaire | README, règles agents, charte, DoD, stratégie/coûts de validation, UX, fondamentaux/API, rapports et registres examinés ; seuls dossier de qualification et liens associés affectés. |
| API/OpenAPI, migration, dépendances, architecture | Aucun endpoint, modèle, migration ou contrat modifié par le correctif ; pas de nouvelle génération de schéma nécessaire pour la prose actuelle. Sécurité npm ultérieure qualifiée dans le dossier transversal, réserve minimatch conservée. |
| Livraison historique | Journal persistant resynchronisation/publication et CI exacte réussis ; gates jamais substitués par une simple assertion de README. |
| Livraison documentaire actuelle | Branche/worktree isolés, quality:targeted documentaire, commit, publish, pre-push, CI exacte, synchronisation principale et nettoyage requis ; résultats à confirmer au compte rendu de livraison. |

Acquis conservés : [017](../mep-017/cloture.md), [018 et sa D01 strictement locale](../mep-018/cloture.md),
[045](../../backlog/planning/qualification-mep-045/cloture.md), [049](../mep-049/cloture.md),
[050](../mep-050/cloture.md). Leurs dates et réserves ne sont pas réécrites.
La [qualification npm transversale](../ci-npm-20261106/README.md) reste attribuée à son propre correctif.

## Décision sollicitée et limites conservées

Proposition : approuver la clôture fonctionnelle de MEP-051 sur ce dossier, les preuves historiques
intègres et le correctif `5f2bb22`, avec les limites explicitement décrites ci-dessus.
Aucune dérogation demandée. Après approbation seulement : inscrire Réalisé à la date réelle de décision,
synchroniser les documents de suivi et recalculer leurs indicateurs depuis les registres à jour.

Recomptage au `e2999b2` : socle `tracking/pbis.md` 25/34 ; registres `mess-e01` à `mess-e04` 29/62 ;
EPIC-012 16/17 ; FEAT-056 4/5 ; global 54/96. Aucun historique parallèle n'est recompté comme PBI actif.
À périmètre inchangé, une clôture approuvée donnerait respectivement MESS 30/62, Epic 17/17,
Feature 5/5 et global 55/96 ; ces nombres restent conditionnels, sans mise à jour canonique anticipée.

Téléphone physique, écoute de lecteur d'écran/accessibilité manuelle complémentaire, nouvelle vidéo
clavier/tactile, nouveau zoom natif de ces erreurs et recette MESS : **non exécutés ici**.
Les trois captures relues historiquement restent attribuées à leur campagne ; aucune nouvelle revue
visuelle exhaustive n'est déclarée. UX-06/08 conserve les limites de ses acquis et de la recette cible.
Aucune certification d'accessibilité, acceptation C21, décision C04/C06/C10, clôture TEAM-003,
MEP-012/055, recette MEP-069/070 ou GO MESS n'est déduit de cette proposition.
