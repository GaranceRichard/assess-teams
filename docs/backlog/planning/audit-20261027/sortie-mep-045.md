# MEP-045 — dossier de sortie, sans développement artificiel

[Source F05](../../source/mess/f05.md) · [Fiche](fiches/MEP-045.md) · [Trajectoire](trajectoire.md).
SHA cible de cette revue : `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
Statut canonique Ouvert, inchangé ; dépendances PASS-001 et MEP-007 réalisées.
Nature A ; aucun nouveau toast, délai de sauvegarde ou autosave de révision demandé.

## Chaque critère canonique confronté

Les critères F05 sont décomposés sans extension ; leurs refus sont de vraies sorties négatives.

| Critère / refus de F05 | Implémentation retrouvée | Assertions / preuves disponibles | Réutilisabilité et manque exact |
| --- | --- | --- | --- |
| Sauvegarde en cours annoncée | useEvaluationTaking.saving ; statut Enregistrement… et actions protégées dans EvaluationTakingDialog | EvaluationTakingDialog.test.tsx : « serializes rapid slider changes and blocks closing until the last save completes » ; dialog-taking-accessibility retarde la réponse | Hook inchangé depuis ee50313 ; dialogue/styles modifiés. Manque résultat attribué au SHA courant et vidéo du statut pendant la réponse retardée. |
| Sauvegarde confirmée annoncée | unsaved n’est retiré que pour la dernière séquence réussie ; texte Note enregistrée | evaluation-taking-layout constate texte après réessai puis reload et note 6 | Test/layout et dialogue évolués : campagne historique non transposable globalement ; capture après dernier succès à fournir. |
| Sauvegarde échouée annoncée | catch de dernière séquence, role alert, note locale conservée et bouton Réessayer | EvaluationTakingDialog : « resumes…reports save failure with a working retry » ; rating-refusal/captures historiques | Captures refus relues, mais entrées courantes différentes ; résultat courant 400→réessai à joindre. |
| Confirmation liée à réponse serveur | file Promise, sequence.current, saving/unsaved ; aucune confirmation d’une requête encore pendante | Test React du dernier save et E2E route retardée ; gardes Fermer/Échap | Manque observation liée à la dernière réponse réelle sur le candidat retenu ; test mock ne suffit pas à prouver persistance. |
| Reprise conserve dernière note enregistrée | saveEvaluationScore puis lecture du run ; ordre de file ; révision locale jusqu’à submit distincte | evaluation-taking-layout : fermer/reload/reprendre ; backend test_evaluation_taking ; E2E passation | Joindre relecture API/serveur après deux valeurs choisies puis dernière réponse ; conserver cas 0 distinct de null. |
| Refus : faux succès | erreur ne devient pas succès ; action protégée en attente/échec | dialog-taking-accessibility et EvaluationTakingDialog | Vérifier absence de Note enregistrée pendant attente/refus ; capture du statut et résultat persistant. |
| Refus : double mutation | intention de finalisation protégée et API idempotente ; file de notes séquentielle | tests de finalisation et de changements rapides ; PASS-001 provenance | Décompter gestes/requêtes/effets sur sélection bornée ; ne pas exiger une seule requête pour plusieurs gestes délibérés ni inventer de debounce. |
| Refus : navigation perdant note | next attend la sauvegarde/reprise ; close/Échap interdits tant que saving/unsaved | dialog-taking-accessibility, taking-layout, test « retries only a deliberately selected score when advancing after a save refusal » | Produire séquence en cours→refus→réessai→Suivant/reload avec dernière valeur relue. |

Chemins exacts : [hook](../../../../frontend/src/useEvaluationTaking.ts),
[dialogue](../../../../frontend/src/EvaluationTakingDialog.tsx),
[tests React](../../../../frontend/src/EvaluationTakingDialog.test.tsx),
[E2E refus clavier](../../../../frontend/e2e/dialog-taking-accessibility.spec.ts),
[E2E layout/reload](../../../../frontend/e2e/evaluation-taking-layout.spec.ts),
[E2E géométrie refus](../../../../frontend/e2e/evaluation-rating-refusal.spec.ts).
Les contrats de score et les [tests API](../../../../backend/tests/test_evaluation_taking.py) restent ceux de PASS-001.

## Preuves : portée et sélection

Le [rapprochement MEP-013](preuves-reutilisation.md) trouve 19/26 entrées identiques, sept modifiées.
Comparaison Git ee50313→base sur sélection : hook et test clavier ci-dessus inchangés ; dialogue,
taking CSS, layout/refusal et transitions changés. `EvaluationTakingDialog.test.tsx` apporte des assertions
spécifiques ; leur présence n’est pas une nouvelle exécution ni une preuve complète de l’environnement.
Le [relevé consolidé](reutilisation-consolidee.md) distingue ces entrées de la validation effective.

## Recette discriminante limitée — à exécuter après cet audit

1. Coach fictif, deux questions dont première vierge : constater null ; choisir 0 puis 7 explicitement
   en retardant la réponse. Tant que la dernière réponse n’est pas arrivée : attente annoncée,
   Fermer/Échap protégés, aucune confirmation trompeuse.
2. Retourner un vrai refus 400 à la sauvegarde de 7 : note locale 7 et erreur annoncée ; pas de
   navigation perdant la valeur. Lever le refus, réessayer une fois, attendre le succès puis Suivant.
3. Fermer, recharger, reprendre et relire par API la valeur 7 ; conserver un exemple de note 0 réellement
   persistée, sans la confondre avec null. Relever gestes, requêtes et effets, sans double finalisation.
4. Admin en révision : changement local visible comme Note à valider, aucun PUT de score instantané ;
   validation explicite seulement. Ne pas exiger de faux état « enregistré » avant sa validation.
5. Relire les trois statuts et actions dans les deux thèmes, formats notation UX-07/08 concernés ;
   réutiliser les cellules exactes déjà prouvées seulement si entrées/sélection identiques. Capture/lecture
   humaine du message et de l’action ; la seule mesure d’animation ne valide pas le visuel.

Sortie de la session : tableau des huit lignes ci-dessus, traces expurgées de réponse/relecture, captures
comparables, verdict et liste fermée des cellules restantes. Consommateur : MEP-069, qui conserve sa recette cible.

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
