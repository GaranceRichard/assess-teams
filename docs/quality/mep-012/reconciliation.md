# MEP-012 — Matrice de réconciliation des exigences

Annexe du [dossier du 6 novembre 2026](qualification.md). **Traitements proposés, non approuvés.**
Les verdicts du 20 octobre restent historiques. La décision du 21 porte les critères révisés de 043 ;
leur application à la clôture et au suivi de 012 nécessite C06.

## Pièces réutilisées

- **H** : [audit et matrice du 20 octobre](README.md),
  [lectures distantes](remote-evidence.md), [preuves CI](ci-evidence.md).
- **D** : [clôture révisée et décision du 21 octobre](../mep-043/closure.md),
  commit `7f456fdbb4fc3ba03e77955630ccad08537a3e5b`.
- **P** : [livraison directe du 21 octobre](../mep-043/delivery.md), notamment
  « Ruleset conservé sur main », « Validations », « Première publication directe » et « Inventaire G05 ».
- **R** : [refus serveur historiques sur cibles jetables](../mep-043/server-refusals.md).
  Ces essais concernaient le ruleset PR retiré ; ils ne prouvent pas une barrière CI sur main aujourd’hui.
- **S** : [source F04](../../backlog/source/mess/f04.md),
  [contradiction C06](../../backlog/planning/audit-20261027/contradictions.md),
  [registre](../../backlog/tracking/mess-e01.md).

## Matrice critère initial → décision du 21 octobre → preuve → traitement proposé

| Critère initial / écart du 20 octobre | Décision du 21 octobre et justification | Preuve datée et limite | Traitement proposé pour C06 |
| --- | --- | --- | --- |
| Preuve datée des règles main ; G01 : aucune protection | Conserver l’audit ; protéger l’intégrité main dans le circuit direct | H : 404 corroboré, règles vides ; P : ruleset actif `25544011`, cible `refs/heads/main`, `deletion` et `non_fast_forward` | Accepter la correction ultérieure d’intégrité ; ne pas déclarer l’état du 20 conforme |
| `Full quality gate` requis avant intégration ; G02 | Abandon explicite de la barrière CI serveur préalable dans 043 ; conserver le direct approuvé | D/P et [CI](../ci.md) : CI après push ; `Required impact gate` agrégateur proportionné, Full réservé à l’exhaustif/MESS | Réviser explicitement ce critère pour 012 ; aucune conformité à l’obligation historique, aucun check préalable réintroduit |
| Une CI présente ou un check facultatif ne vaut pas protection | Distinction conservée ; CI indépendante obligatoire pour réussir la livraison après intégration | H : run documentaire avec Full sauté ; P : CI exacte verte, pas de required check serveur | Conserver le refus de confondre CI et protection ; remplacer l’attente historique par la règle de livraison révisée |
| Force-push interdit ; G03 | Interdiction serveur conservée, compatible avec le fast-forward | P : `non_fast_forward`, bypass vide ; R : refus 422 sur cible jetable, aucun essai sur main | Satisfait selon preuve de configuration du 21 ; ne pas attribuer les essais PR à main |
| Suppression interdite ; G03 | Règle dédiée conservée indépendamment du rôle de branche par défaut | P : `deletion` actif ; R : refus 422 sur cible jetable | Satisfait selon configuration datée ; aucun DELETE de main nécessaire |
| Contournements/admins ; G04 | Bypass vide ; pouvoirs de reconfiguration du propriétaire connus et acceptés | D/P : aucun acteur de bypass ; H : propriétaire admin ; G05 distinct | Accepter la limite résiduelle ; ne pas affirmer une impossibilité absolue de reconfiguration |
| Inventaire Apps et credentials ; G05 non vérifié | Réserve explicitement acceptée, non bloquante ; aucun nouvel audit imposé | H : 403 ; P : nouveau 403 du 21, pas de liste vide ; collaborateurs/Actions ne couvrent pas tous PAT/OAuth/SSH | Conserver « non vérifié », sans inventaire complet ni blocage de clôture révisée |
| Circuit publish testé compatible ; refus si incompatible | `npm run publish`, worktree/branche dédiés, verrou, rebase, pré-push bloquant, push direct, synchronisation sûre | P : 8 tests ciblés et livraison `7c00603ec67419f0b4aafd7142fc714e46e3b8bc` ; CI [39601964143](https://github.com/GaranceRichard/assess-teams/actions/runs/39601964143) | Réutiliser nominal et refus existants, aucun nouveau circuit ni PR |
| Acquis CI référencés | Indépendance après intégration, nightly/exhaustif et qualification au SHA exact conservés | H : runs sélectif/exhaustif ; D : CI documentaire de `2b3723d` ; P : run exact de `7c00603` | Conserver la traçabilité par SHA ; aucun run historique ne remplace la CI du présent dossier |
| Verdict d’audit / statut et date de 012 | D dit 012 clôturée mais ne modifie pas le suivi ; S maintient C06 et Bloqué/N/A | S : registre, source et contradiction C06 du 27 octobre ; F04 à 1/2 | Soumettre critères, verdict, date et effet au GO au responsable ; aucune clôture automatique |

## Contrôles par moment et frontière de confiance

| Moment | Contrôle et preuve versionnée | Garantie et refus |
| --- | --- | --- |
| Avant push | [publish](../../../scripts/publish.ps1) : verrou, propreté, fetch/rebase ; [lecture des règles](../../../scripts/quality/main-protection.mjs) | Refuse règles incompatibles ou intégrité/bypass non démontrés, sans les modifier |
| Pré-push | [hook](../../../.githooks/pre-push), garde puis plan du diff Git réel | Bloquant pour le client coopératif ; un autre client peut ignorer les hooks |
| Push direct | Branche dédiée → main, sans force ; ruleset d’intégrité | Intégration déjà effective avant sa nouvelle CI ; aucune obligation PR/merge queue/check préalable |
| Après push | main principal propre/non divergent, ascendance, fast-forward sûr | Aucun écrasement ni rollback automatique ; refus si rattrapage sûr impossible |
| Livraison | [attente CI](../../../scripts/quality/wait-ci.mjs), `quality.yml`, push et SHA exact | Succès seul accepté ; rouge/annulé/skipped/absent ne clôt pas la livraison |
| Qualification MESS | [règles CI](../ci.md), exhaustif indépendant et artefact du SHA exact | Aucune promotion déduite de cette qualification de prose |

Les lectures et essais réutilisés sont datés. La lecture fraîche de publication vérifie seulement
la compatibilité du circuit avant le push ; elle ne complète pas l’inventaire G05.
