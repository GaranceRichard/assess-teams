# MEP-045 — Confirmation de sauvegarde et protection d’Échap

**Qualification locale après correction : huit critères conformes.**
**Clôture proposée, soumise à validation du verdict et à l’étape de publication autorisée.**
Les gates locaux applicables sont verts ; intégration et CI distante attendent la publication.
Aucun statut canonique modifié ; aucune publication effectuée.

Base : dernier `origin/main` récupéré le 2026-10-30,
`029857a96b730aaf6357c123b429860f56e445a0`.
Le défaut initial et ses preuves du 2026-10-29 sont conservés dans
[la qualification initiale](qualification-initiale.md) et [la reproduction](defaut-echap.md).
Le correctif ajoute uniquement la protection `keydown` d’Échap pendant `saving || unsaved`.
[Diff, cause et preuves après correction](correction/README.md).

## Huit verdicts

| Critère | Attendu | Observé | Test / preuve | Verdict |
| --- | --- | --- | --- | --- |
| 1. En cours | Enregistrement… pendant l’attente serveur | Message et rôle status inchangés ; après cinq Échap le dialogue reste ouvert, note 7, serveur 0 | [Qualification initiale](qualification-initiale.md), deux tests permanents et [traces après correction](correction/traces.md) | Conforme |
| 2. Confirmation | Note enregistrée seulement après succès | Réessai 7 → 204, GET=7 ; aucun succès pendant attente ou 400 | Preuves initiales conservées, tests permanents clair/sombre | Conforme |
| 3. Échec | Erreur explicite et accessible | Rôle alert et texte inchangés ; note 7 disponible après cinq Échap sur refus | [Visuel initial](visuel.md), captures et traces après correction | Conforme |
| 4. Pas de faux succès | Aucune confirmation prématurée | Après le 400, GET reste 0 et l’UI conserve l’erreur ; confirmation seulement après 204 | Preuves initiales et vérification réseau des tests permanents | Conforme |
| 5. Réessai | Valeur refusée conservée et enregistrable | Réessai de 7 sans ressaisie, 204 puis GET [7,null] | Deux tests permanents et zoom natif | Conforme |
| 6. Persistance | Reprendre la dernière valeur réellement sauvée | Preuve initiale navigation/reload [7,0] conservée ; après correction fermer/réouvrir conserve GET=7 | [Traces initiales](traces.md), nouvelles lectures serveur | Conforme |
| 7. Sélections rapides | Ordre cohérent, pas de mutation indue ou double finalisation | File, API, boutons et finalisation inchangés ; comptage initial 5 PUT justifiés, un POST de finalisation | [Exécutions initiales](executions.md), périmètre du diff limité à Échap | Conforme |
| 8. Navigation protégée | Aucune fermeture silencieuse en attente/refus | Cinq Échap en attente + cinq après 400 : ouvert, 7 sélectionné, Fermer désactivé ; après 204 Échap ferme et rend le focus ; fermeture volontaire conservée | Deux régressions initiales rouges puis vertes ; deux tests permanents rouges puis verts ; zoom 100/200/100 clair/sombre | Conforme |

## Réutilisation bornée

Les sept critères initiaux sont conservés avec leur date/SHA d’origine, sans les présenter comme
une nouvelle campagne. La file de sauvegarde, les contrats API, les styles, les messages,
la révision Admin et la finalisation n’ont pas changé. Le diff du dialogue ajoute seulement
une garde clavier conditionnelle ; les gardes `onCancel` et le cycle de fermeture autorisée demeurent.
Les tests de régression complètent ces preuves sur le seul chemin corrigé.
Les gates imposés par le dépôt restent indépendants de cette réutilisation de recette.

La distinction null / 0 et la révision Admin « Note à valider » restent celles de la qualification
initiale : aucune écriture individuelle avant validation explicite de la révision.

## Conditions de sortie

[Contrôles et DoD](validations.md) ; [correction et limites](correction/README.md).
Le zoom sombre précédemment non démontré est désormais exécuté, ainsi que le retour à 100 %.
Les captures courantes ont été relues par Codex ; aucune acceptation visuelle utilisateur,
certification d’accessibilité ou recette MESS cible n’est revendiquée.
Les contrôles de publication/CI et l’approbation du verdict restent à leur étape autorisée.

Références : [F05](../../source/mess/f05.md),
[dossier canonique](../audit-20261027/sortie-mep-045.md),
[fiche](../audit-20261027/fiches/MEP-045.md),
[UX-07/08](../../../quality/ux-acceptance.md),
[DoD](../../../quality/definition-of-done.md).
