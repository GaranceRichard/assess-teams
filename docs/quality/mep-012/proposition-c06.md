# MEP-012 — Proposition d’arbitrage C06 et de clôture

**Soumise au responsable du dépôt/produit ; aucune approbation enregistrée.**
[Qualification](qualification.md) · [matrice et preuves](reconciliation.md).

## Décision proposée

Valider explicitement l’application à MEP-012 de la gouvernance approuvée le 21 octobre 2026 :

1. Conserver l’audit du 20 octobre, ses écarts et son refus de conformité historique.
2. Remplacer l’exigence de check distant obligatoire avant intégration par le circuit direct approuvé :
   `npm run publish`, branche/worktree dédiés, pré-push proportionné bloquant, protections main
   contre force-push/suppression sans bypass, CI indépendante verte du SHA publié, main synchronisé.
3. Conserver `Required impact gate` proportionné et `Full quality gate` exhaustif/MESS dans leurs rôles.
   Aucune PR, merge queue ou barrière CI serveur avant intégration n’est ajoutée.
4. Accepter les limites déjà décidées : client coopératif pour les hooks, main potentiellement rouge
   après intégration, pouvoirs de reconfiguration du propriétaire et G05 non vérifié non bloquant.
5. Prononcer ensuite MEP-012 **Réalisé selon critères révisés, avec réserve G05 acceptée**,
   sans revendiquer la conformité aux exigences historiques abandonnées.

Motif : les preuves de 043 établissent le circuit retenu et l’intégrité main ; refaire un chantier Git/CI
ne résoudrait pas la contradiction de suivi. C06 doit décider cette réconciliation, pas recréer les acquis.
Une CI rouge après push exige une correction par nouveau commit ; aucune réécriture distante.

## Date à décider explicitement

La date canonique reste **N/A**. Proposition : retenir la date réelle de votre approbation de clôture,
à confirmer explicitement, et distinguer cette date des acquis techniques du 21 octobre.
Aucune réalisation au 20 ou au 21 octobre, ni au 6 novembre, n’est déduite automatiquement.
Une autre date requiert votre choix motivé et une preuve correspondante.

## Effets proposés après approbation seulement

| Document / indicateur | Modification à réaliser dans un lot ultérieur approuvé |
| --- | --- |
| Source `docs/backlog/source/mess/f04.md` | Garder les critères initiaux identifiables, ajouter critères 012 révisés, décision datée/attribuée, motif, réserve et liens de preuve |
| Registre `docs/backlog/tracking/mess-e01.md` | Remplacer Bloqué/N/A par Réalisé et date approuvée ; lier décision C06 et dossier, garder G05 visible |
| Synthèse et vue `pre-mep-view.md` | Recalculer depuis le registre : F04 passerait de 1/2 (50 %) à 2/2 (100 %) |
| Totaux actifs | Delta conditionnel : +1 Réalisé, −1 Bloqué ; aucun changement de dénominateur (62). Sur la base examinée : 27→28 Réalisés, 2→1 Bloqués, 33 Ouverts ; 44 %→45 % après arrondi |
| Plans / contradiction C06 / fiche analytique | Enregistrer la décision et sa preuve, distinguer diagnostic historique et résolution ; aucune autre décision réputée approuvée |
| Jalon `mess-jalon.md` / dépendances | Lever seulement la contradiction F04/C06 ; ne pas retirer F04 du périmètre GO et ne pas prononcer GO |

Les totaux devront être recalculés sur le dernier main : les autres chantiers peuvent avoir avancé.
Les récits datés de MEP-012/043 restent conservés ; une note de résolution pourra les relier à C06.
Aucune dépendance de MEP-043 n’est supprimée par cette proposition ; son acquis reste Réalisé.
La clôture 012 ne qualifie pas les autres Features, les recettes cible ou le candidat MESS.

## Refus et maintien du suivi

- Absence d’approbation explicite de C06 : MEP-012 reste **Bloqué / N/A**, F04 à 1/2.
- Approbation partielle laissant un critère initial non satisfait et non révisé : même refus.
- Preuve requise absente ou gate applicable en échec : aucune clôture ni date inventée.
- G05 reste non vérifié et non bloquant selon décision existante ; son 403 n’est pas une preuve d’absence.
- L’approbation de publication de ce dossier ne vaut pas approbation de son contenu décisionnel.

## Formulation proposée pour votre validation

« J’approuve C06 selon cette proposition : critères MEP-012 révisés, historique conservé,
clôture Réalisé avec réserve G05 acceptée, date de réalisation [date explicitement choisie].
J’autorise la mise en cohérence documentaire de la source, du registre et des indicateurs dérivés.
Cette décision lève la contradiction F04 ; elle ne prononce ni GO ni qualification MESS. »

En attendant cette validation, aucun des changements canoniques ci-dessus n’est appliqué.
