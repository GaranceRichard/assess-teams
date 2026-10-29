# MEP-047 — dossier de sortie, sélection et comparabilité existantes

[Source F06](../../source/mess/f06.md) · [Fiche](fiches/MEP-047.md) · [Ordre motivé](ordonnancement-ux.md).
Base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`. Statut Ouvert inchangé ;
RESULT-001/002 réalisés. Nature A. Aucun nouveau filtre, calcul, partage ou comparaison globale de versions.

| Chaque critère / refus canonique | Comportement implémenté | Tests et appuis disponibles | Preuve restant à attribuer au SHA/périmètre |
| --- | --- | --- | --- |
| Filtres et équipes conservés | useResultSelection garde contexte/équipes entre restitutions ; ResultsViews garde le critère ; changement de contexte réinitialise conformément à RESULT-001/002 | ResultsLongitudinal : « loads history only on criterion opening and returns with model and team selections intact » ; ResultsTabs ; results-layout/longitudinal | Parcours exact actuel avec version archivée et contrôles de sélection ; pas d’exigence de conservation après changement d’organisation ou reconnexion. |
| Compatibilité famille/version explicite | sélection d’une famille et d’une version exacte, archive possible ; aide MEP-046 ; snapshots exacts et refus incompatibles | test_results : snapshot_order/archive, latest_completion, incompatible_or_incomplete ; ResultsArchivedVersions ; results-archived-versions | Changements b112c72 et 3e6fb70 : observer sélection d’archive et aide sans perte de contexte, avec données actuelles. |
| Longitudinal par lignée | result_history utilise lineage_id explicite, copies versionnées, colonnes/observations sans rapprochement par texte | test_result_longitudinal, test_question_lineage, test_result_history_missing ; ResultsLongitudinal | Relier résultat d’une même lignée v1/v2 et refus d’une autre lignée ; ne pas confondre lignée et garantie de sens identique des notes. |
| Comparaison dans le scope autorisé | completed_results_for distingue Viewer organisationnel et Coach assigné ; API valide familles/équipes/versions | test_results_security, test_result_longitudinal_security, test_result_version_selection_security, viewer-results | Attendus/résultats par Admin, Coach et Viewer sur deux organisations ; Superadmin choisit une seule organisation à la fois. |
| Refus agrégation interorganisation | listes et requêtes filtrées/vérifiées ; aucun agrégat interorganisation ajouté | Tests IDs étrangers et liste mêlant autorisé/étranger ; indirect-access | Conserver réponse sans donnée étrangère, pas seulement un menu masqué. |
| Refus comparaison incompatible | backend exclut snapshot incompatible sans prendre un ancien résultat en secours ; lignées sans lien séparées | test_results : incompatible_or_incomplete_latest_snapshot_never_falls_back_to_old_run ; test_result_history_missing | Observer le refus/absence selon contrat avec données incompatibles, sans zéro/continuité fabriqués. |
| Refus perte de filtre | sélections communes aux quatre restitutions ; réponses obsolètes ignorées ; remise à zéro volontaire au changement de contexte | ResultsSelectionRace/ResultsIntent/ResultsArchivedVersions et E2E results-layout | Distinguer perte indue sur aller/retour de réinitialisation attendue à changement de famille/version/organisation. |

Code : [sélection](../../../../frontend/src/useResultSelection.ts),
[vues](../../../../frontend/src/ResultsViews.tsx),
[scope/snapshots](../../../../backend/assessments/application/results.py),
[histoire](../../../../backend/assessments/application/result_history.py).
Tests : [retour](../../../../frontend/src/ResultsLongitudinal.test.tsx),
[archives](../../../../frontend/src/ResultsArchivedVersions.test.tsx),
[API incompatibilité](../../../../backend/tests/test_results.py),
[API sécurité](../../../../backend/tests/test_result_longitudinal_security.py),
[E2E archives](../../../../frontend/e2e/results-archived-versions.spec.ts).

## Réutilisabilité des appuis

Les preuves MEP-014/046 et RESULT-001/002 sont des appuis voisins, pas une clôture historique de 047.
Comparaison 381a289→base : sélection, vues, histoire frontend/backend et test d’archives ont changé ;
results.py et E2E longitudinal figurent parmi les entrées inchangées de la sélection déclarée.
Cela permet de cibler l’analyse, pas de déclarer l’ensemble de la campagne compatible : styles partagés,
données, navigateur, dépendances effectives et sélection doivent aussi correspondre.
Le [relevé exact](reutilisation-consolidee.md) documente les fichiers comparés ; aucun run courant
ni archive externe non disponible n’est inventé.

## Recette limitée et critères de refus

1. Admin organisation A, famille avec v1 archivée et v2, équipes A1/A2 et complétions datées :
   sélectionner v1 et A1/A2 ; radar→données→critère→historique→retour. Relever même organisation,
   famille/version et équipes ; sélectionner une équipe seule ne doit pas changer de contexte.
2. Changer volontairement de version/famille puis d’organisation avec Superadmin : choix réinitialisés,
   ancienne réponse tardive ignorée. Le maintien de choix étrangers serait un échec, pas une amélioration.
3. Même lignée en v1/v2 : observations autorisées datées ; critère de même libellé mais autre lignée :
   aucun lien inventé. Exposer la limite sémantique déjà expliquée par MEP-046, sans créer une règle.
4. Coach assigné, autre Coach et Viewer : contrôler les listes/observations selon leurs scopes.
   Forger version/critère/équipe étrangers puis mélange autorisé/étranger ; aucune donnée étrangère.
5. Snapshot incomplet/incompatible : ne pas revenir à une ancienne complétion comme si c’était la
   dernière valide ; absence explicitée, pas de zéro fabriqué.
6. Lire à l’écran contexte/version/équipe dans les formats UX-09 et deux thèmes pertinents ; conserver
   les preuves exactes déjà acquises et ne produire que les cellules manquantes. Si label illisible,
   nommer le défaut de présentation consommé par 015, sans annoncer 047 conforme sur ce critère.

Sortie : sept lignes critère/refus avec exemples d’IDs fictifs et observations ; consommateur MEP-070.
L’ordre 047 avant 015 réduit la reprise du jeu de preuve, sans être une dépendance technique ni
autoriser à ignorer un défaut de lisibilité déjà reproduit.

## Issue bornée et conditions de clôture proposée

| Observation après la sélection ci-dessus | Issue à consigner | Passage autorisé |
| --- | --- | --- |
| Tous critères et vrais refus satisfaits ; preuves exactes et DoD démontrées | **Clôture proposée**, sans développement | Soumettre verdict, preuves et date justifiée à la validation de suivi ; aucune clôture pendant cet audit. |
| Comportement conforme, mais une cellule/entrée/preuve manque | **Qualification ciblée A** | Exécuter seulement la cellule nommée ; ne pas relancer une amélioration indéfinie ni reconstruire la capacité. |
| Un attendu canonique échoue avec reproduction | **Correction minimale B à préparer** | Nommer cas, attendu/observé, propriétaire et test de non-régression ; aucun correctif développé ici. |
| Une attente dépasse le contrat limité | **Arbitrage distinct D** | Isoler l’exigence et son effet de périmètre ; ne pas l’imputer implicitement au PBI. |

La clôture proposée exige une ligne par critère/refus avec code/entrée, assertion, résultat réel,
preuve visuelle pertinente, auteur/date de recette et verdict ; aucun « Non exécuté » nécessaire
ne peut être transformé en Passé. Les points DoD applicables et les gates du changement de clôture
doivent être satisfaits, avec trace d’intégration du comportement livré et date fondée sur preuves.
Si aucun code ne change : contrôle documentaire adapté pour la clôture, sans inventer un nouveau
déploiement applicatif. Aucun nombre de jours d’attente ou intitulé « améliorer » ne maintient à lui seul
le PBI ouvert. Le défaut global de transitions reste suivi séparément : il ne clôt ni ne bloque
automatiquement un critère indépendant ; une gêne réelle lors d’un scénario est consignée.

Cette consolidation ne produit aucun run métier/API/E2E nouveau ni acceptation visuelle du candidat.
**Verdict actuel : comportement principal couvert, qualification ciblée restante ; aucune clôture proposée
comme déjà validée et aucun développement identifié.**
