# MEP-043 — Push direct, protections et nettoyage

Décision définitive utilisateur du **2026-10-21** : retrait de l’accord PR.
Aucune PR sauf demande explicite de l’utilisateur ; aucune création automatique, approbation
ou fusion GitHub dans le circuit de publication directe.
Chantier finalisé depuis `codex/mep-043-protections` ; nettoyage après publication documentaire et CI verte.
MEP-012 reste clôturée selon le cadrage utilisateur ; son dossier d’audit et ses lignes de suivi
ne sont pas modifiés. Seules les données de suivi MEP-043 évoluent.

## Travaux utiles retenus de la PR #5

- Preuves datées de configuration, acteurs visibles et refus serveur conservées comme historique.
- Vérification en lecture seule des règles main avant le push direct ; aucun changement automatique.
- Tests passants/refus : protections manquantes, bypass, règles PR/check incompatibles et ancien mode retiré.
- Publication directe d’origine conservée : verrou, pré-push bloquant, diff réel, CI du SHA publié,
  fast-forward sûr du principal. Aucun module de création/fusion de PR intégré.

La PR #5 n’est pas fusionnée ; son historique technique PR n’entre pas dans main.
Ses commits sont préservés par le tag local `archive/mep-043-pr-withdrawn-20261021`,
les références `refs/archive/mep-043-proof/*` et un bundle vérifié à historique complet
initialement dans `.cache/mep-043/withdrawn-work-20261021.bundle`, puis copiés et vérifiés hors worktree
dans `C:\Users\garan\Desktop\Projets\Assess-teams-archives\mep-043-20261021\proofs`.
Le manifeste SHA-256 et le ZIP local sont vérifiés ; aucun commit perdu ou force-push.
Les ressources locales de conservation sont internes au chantier ; aucun nouveau chantier créé.

## Nettoyage GitHub

Les PR [#2](https://github.com/GaranceRichard/assess-teams/pull/2),
[#4](https://github.com/GaranceRichard/assess-teams/pull/4) et
[#5](https://github.com/GaranceRichard/assess-teams/pull/5) sont fermées, non fusionnées.
Le ruleset jetable `25482365` est supprimé après conservation de ses preuves.
Les cinq branches `mep-043-proof/*` sont supprimées après vérification de leur SHA archivé :
base, red, missing, advance et stale, suffixe `20261020-143946`.
La branche distante de #5 est supprimée après intégration directe des travaux utiles et CI verte ;
la branche locale et le worktree sont à supprimer après conservation extérieure et livraison finale validée.

## Protections et limites

[Ruleset main `25544011`](https://github.com/GaranceRichard/assess-teams/rules/25544011) actif :
`refs/heads/main`, exclusion vide, bypass vide, `deletion` et `non_fast_forward` uniquement.
Aucune PR, approbation, merge queue, restriction des mises à jour normales ou check préalable.
Le [circuit CI](../ci.md) reste indépendant et proportionné ; Full exhaustif et qualification MESS conservés.
La CI intervient **après intégration** : un rouge refuse la livraison mais n’annule pas le push.
Le pré-push dépend d’un client coopératif, pas d’une barrière CI serveur.

| Écart | État après décision |
| --- | --- |
| G01 | Ruleset main actif ; absence de barrière serveur imposant le parcours local acceptée |
| G02 | CI après push ; absence de check serveur préalable explicitement acceptée, sans conformité initiale supposée |
| G03 | Force-push et suppression interdits côté serveur, y compris admin sans bypass |
| G04 | Bypass vide pour ces règles ; push direct et pouvoirs de reconfiguration du propriétaire acceptés |
| G05 | Inventaire Apps/PAT/OAuth/SSH non vérifié (403) ; réserve documentée acceptée, non bloquante |

`GET /user/installations` reste refusé en 403 ; aucune session navigateur autorisée accessible
lors de l’audit. Aucun credential collecté, créé, élargi ou révoqué.
**MEP-043 : Réalisé le 2026-10-21 selon les critères explicitement révisés**, avec réserve G05
non bloquante. [Décision et revue DoD](closure.md). Les exigences initiales restent traçables ;
aucune conformité rétroactive ni inventaire complet n’est affirmé. MEP-012 reste inchangée.
Aucun nouvel audit, changement applicatif, refonte CI ou test exhaustif n’est lancé.
MEP-043 ne bloque plus la publication du backlog ni les autres chantiers.

## Preuves et validation

- [Réponses API préparatoires datées](remote-evidence.md), explicitement historiques.
- [Refus et chemins verts jetables](server-refusals.md), issus du circuit PR désormais retiré.
- Preuves du nettoyage, configuration courante et livraison directe consignées dans [le relevé de livraison](delivery.md).
- Aucun essai de force-push/suppression sur main et aucune nouvelle PR après le retrait d’accord.
- Revue README, AGENTS/règles, charte, DoD, stratégie, architecture et API effectuée ;
  aucun modèle, endpoint, migration, contrat ou parcours applicatif modifié.
- Outillage transverse : validation exhaustive locale et CI indépendante vertes pour `7c00603` ;
  [preuves de livraison](delivery.md). Le suivi documentaire utilise ensuite le plan proportionné.
