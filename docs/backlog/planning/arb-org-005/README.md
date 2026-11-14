# ARB-ORG-005 — Proposition sur la suppression d’une organisation

Dossier de proposition historique du 2026-11-14, publié au commit `c82f4e4`.
**Suite : option A/R01–R09 approuvées par le responsable produit le 2026-11-14**, sous rétention existante
pour R03, sans validation externe MESS ni repli D. Voir le [registre canonique](../../source/00-arbitrages-organisations.md#arb-org-005--états-et-cycle-de-vie-dune-organisation)
et la [réalisation autorisée ORG-004](../realisation-org-004/README.md).
Les sections suivantes conservent l’analyse et les propositions telles que soumises avant cette décision.
Base contrôlée demandée : `353a0ff434ebfedd0aa12428cdac5853e5e96f1c`.
Analyse après récupération du dernier `origin/main` : `3802d77687f23b83b53c12926b48727d7eaf2341`.
La seule évolution entre ces bases concerne le dossier documentaire MEP-055 ; aucun code applicatif.

## Problème et valeur recherchée

Le Superadmin peut retirer physiquement une organisation, mais la politique des dépendances manque.
Sans run protecteur, l’opération peut détruire équipes, référentiels et engagements ; avec un run
commencé, elle peut être refusée. Cette différence dépend du graphe technique, pas d’un choix produit.
La valeur attendue est une administration prévisible, qui préserve le patrimoine et sa provenance,
avec des refus compréhensibles et vérifiables avant ORG-004 et la recette MESS.

Le [registre canonique](../../source/00-arbitrages-organisations.md#arb-org-005--états-et-cycle-de-vie-dune-organisation)
reste l’autorité. DELETE physique et Superadmin seul, comptes conservés, retrait des rattachements
courants, refus sans effet partiel et contexte historique non réécrit sont acquis.
L’archivage TEAM-005 conserve l’équipe. Transfert, purge et anonymisation restent distincts.
Aucun état d’organisation, droit, critère canonique, dépendance ou statut ne change dans ce dossier.

## Lecture du dossier

- [Diagnostic, sources et couverture réellement lue](diagnostic.md) : faits, déductions et tests distincts.
- [Matrice des dépendances](dependances.md) : relations, risques, recommandations et vérifications.
- [Scénarios S01–S11](scenarios.md) : actuel et proposé, observations DB/API/Journal, futurs tests.
- [Réalisation ultérieure et recettes](realisation-et-recette.md) : concurrence, coûts, PBI et limites.
- [Audit historique du 27 octobre](../audit-20261027/suppression-organisation.md) : conservé sans réécriture.

## Comparaison des politiques

Appréciation qualitative ordonnée, sans score numérique qui compenserait une perte de données par un gain de coût.
A désigne ici le refus conservateur avec les exceptions de traces conservées R03–R04, à approuver.
D désigne le refus de tout DELETE d’organisation pour le candidat MESS, et non un bouton masqué.

| Critère, par priorité | A — Refus sur dépendances | B — Archivage/désactivation | C — Suppression et traitement par donnée | D — Limitation MESS effective |
| --- | --- | --- | --- | --- |
| 1. Données et provenance | Fort : objets conservés, traces contextualisées exigées | Fort si conservation et accès spécifiés | Fragile si une cascade ou un snapshot manque | Fort dans ce parcours : aucune suppression permise |
| 2. Irréversible non approuvé | Limité au périmètre sans patrimoine protégé | Faible destruction, mais transitions inédites | Élevé ; autorisations détaillées nécessaires | Aucun effet destructif par cet endpoint |
| 3. Décisions acquises | Préserve DELETE physique là où admissible | Nouvelle capacité ; remplacer DELETE par archivage modifierait une décision | Compatible seulement si pertes explicitement approuvées | Restreint temporairement la capacité acquise ; accord produit/MESS indispensable |
| 4. Prévisibilité Superadmin | Règle simple, motifs explicites ; nettoyage manuel potentiellement impossible | Gestion des états et effets sur rôles/plans à définir | Nombreuses exceptions, aperçu et confirmation complexes | Refus simple, mais aucune suppression même vide |
| 5. Transaction/concurrence | Contrôle cohérent avant effet, preuve concurrente nécessaire | Courses activation/plans/passations à résoudre | Graphe, fichiers de preuve, workers et SMTP difficiles à coordonner | Barrière avant mutation, toutes variantes à tester |
| 6. Effort/maintenance | Modéré : inventaire, provenance des traces, refus, tests | Fort : état, écrans, scopes, planning et reprise | Très fort : traitement et accès pour chaque type/état | Faible à modéré, avec contrat/UI/tests et limitation tracée |
| 7. Recette MESS | Nominal vide et vrais refus directement préparables | Nouveau cycle complet à qualifier | Grande combinatoire, risque d’omission | Qualifiable comme périmètre limité approuvé ; ne réalise pas ORG-004 |

**Classement pour ce mandat : A, puis D comme repli MESS, puis B, puis C.**
D préserve davantage par interdiction totale, mais ne satisfait pas le nominal acquis ; il ne constitue
pas un substitut permanent à A. B conserve les objets mais engage un produit nouveau ; C est le moins
favorable aux deux premiers critères et le plus coûteux à rendre fiable.

## Recommandation principale

Retenir **A**, sans exception pour brouillon, archive ou attente non commencée : ces états ne prouvent
ni absence de valeur ni accord de destruction. Les membres seuls n’interdisent pas la suppression.
Les Journaux et Logs sont une exception de **conservation**, jamais d’effacement : leur identité
organisationnelle d’origine doit survivre à SET_NULL et rester consultable par le Superadmin.
Le nom seul est insuffisant puisque deux organisations peuvent porter le même nom.

Les notifications liées bloquent dans tous leurs états, y compris SENT/CANCELLED : retirer un lien
n’est pas annuler une intention, et conserver un corps ne conserve pas son contexte. Cette règle
évite d’introduire ici un sous-projet d’annulation, de purge ou de rétention des courriels.
Elle peut rendre durablement non supprimable une organisation utilisée ; c’est un coût produit explicite.
A n’est donc pas une procédure de « vidage préalable » ; elle n’autorise aucune suppression préalable
d’équipe archivée, de version ou de trace pour contourner le refus.

B serait pertinent si l’administration devait fermer un périmètre utilisé tout en le conservant,
mais exige un mandat et un cycle de vie distincts. C ne se justifie pas par le besoin actuel.
Si A ne peut être livré et prouvé à temps, soumettre séparément D : tous les DELETE refusés côté API
pour le candidat identifié, aucun succès destructif. L’exclusion d’un scénario de recette ne suffit pas.

## Règles exactes soumises à approbation

Toutes les lignes R01–R09 sont des **propositions**, y compris leurs exceptions et conséquences d’accès.
Les décisions déjà acquises rappelées plus haut ne sont pas remises au vote.

| Réf. | Proposition à approuver ou amender | Conséquence observable / réserve |
| --- | --- | --- |
| R01 | Admettre seulement l’organisation sans dépendance R02/R05 ; membres seuls admis, aucun minimum de membre à maintenir après disparition du périmètre | Suppression physique, comptes et liens vers d’autres organisations inchangés ; aucune nouvelle multi-appartenance autorisée |
| R02 | Toute équipe active/archivée, famille, version DRAFT/VALIDATED/ARCHIVED, question/repère, planification, run de tout état ou snapshot lié interdit DELETE | Refus même sans résultat, sans assigné ou sans échéance future ; aucune suppression automatique des NOT_STARTED |
| R03 | Conserver toutes les activités et tous les Logs ; leur présence seule ne bloque pas si leur provenance reste complète | Identifiant d’organisation d’origine immuable, noms au moment des faits, acteurs, dates, actions et corrélations conservés ; aucun nom historique remplacé par le nom courant |
| R04 | Après suppression admise, consultation de ces traces par le Superadmin global ; aucun droit hérité pour les anciens membres | Ancien Admin sans organisation refusé ; Admin d’une autre organisation, Coach, Viewer et anonyme ne gagnent aucun accès ; perte du scope antérieur explicitement acceptée |
| R05 | Toute EmailNotification reliée à l’organisation ou à ses objets bloque, quel que soit l’état | Aucun envoi, annulation, réaffectation ou effacement déclenché par DELETE ; une ligne liée seulement à un utilisateur conservé ne bloque pas de ce seul fait |
| R06 | Refus métier explicite avant mutation ; proposer HTTP 400 avec `detail` et motifs par catégorie destinés au seul Superadmin | 204 réservé au commit réussi ; 403 rôle/session/CSRF, 404 cible inconnue ; pas d’inventaire révélé aux autres rôles |
| R07 | Refus sans transition ni activité de succès ; succès atomique avec une activité ORGANIZATION_DELETED attribuable et contextualisée | Un Log technique de refus reste permis ; le Journal métier et les notifications ne sont pas modifiés par la tentative refusée |
| R08 | Contrôle et suppression cohérents sous concurrence avec créations, début de passation, production de traces et workers | Soit dépendance commise puis refus, soit suppression commise puis création refusée ; contention/erreur ne vaut jamais succès |
| R09 | Confirmation décrit l’irréversibilité, les comptes conservés, les dépendances bloquantes et l’accès résiduel aux traces | Aucun archivage ni moyen UI de forcer ; backend autoritaire même si la situation évolue après ouverture du dialogue |

La provenance R03 est un **prérequis de réalisation**, absent aujourd’hui pour l’identifiant historique
lorsque la FK devient NULL. Sans cette garantie, ne pas déclarer le cas vide qualifié par la seule
présence de snapshots de noms. Le [plan ultérieur](realisation-et-recette.md) borne ce delta.
Un amendement qui permettrait une destruction aujourd’hui refusée par R02/R05 doit nommer donnée,
état, effet, accès et preuve ; aucune exception implicite « technique » n’est déléguée au développeur.

## Autorité, impacts et risques résiduels

Le mainteneur rend l’arbitrage produit ; toute limitation du candidat et son acceptation au GO requièrent
l’autorité produit/MESS applicable. Consigner référence, date, auteur, texte retenu et amendements.
La publication de ce dossier ne vaut ni cette décision, ni approbation MESS, ni autorisation de développer.

ORG-004 reste **Bloqué / N/A**. MEP-033/034/035 gardent leurs statuts et dépendances canoniques.
Les conséquences et critères futurs sont détaillés dans le plan de recette ; aucun PV cible n’est produit.
TEAM-002/003/005 et C04 ne sont pas rouverts. TEAM-006/007, C05, MEP-055/057, rétention et purge restent hors mandat.

Risques résiduels : politique volontairement restrictive ; traces anciennes déjà détachées non
attribuables avec certitude ; provenance stable à réaliser ; accès ancien Admin perdu par décision
explicite ; concurrence non démontrée pour ce DELETE ; CI documentaire sans preuve applicative/MESS.
A n’annule pas les autres DELETE existants et ne protège pas contre un administrateur DB agissant hors API.
La conservation promise ici porte sur les effets de DELETE, sans durée nouvelle ni immunité à la purge existante.

## Formulation de décision proposée au mainteneur

> Je propose d’approuver R01–R09 : supprimer physiquement, par le seul Superadmin, uniquement une
> organisation sans équipe, référentiel, planification, passation, snapshot ni notification liée,
> quels que soient leurs états. Les membres seuls ne bloquent pas et leurs comptes sont conservés.
> Les Journaux et Logs sont conservés avec une provenance organisationnelle stable et un accès
> résiduel réservé au Superadmin ; cette garantie doit être réalisée avant toute suppression admise.
> Toute dépendance protégée entraîne un refus explicite et atomique, sans activité métier de succès.
> La concurrence et la confirmation doivent respecter ces règles. Aucun archivage, transfert, purge
> ou anonymisation n’est autorisé par cette décision. ORG-004 sera ensuite développé et qualifié
> selon cette politique ; les recettes MESS et leur GO demeurent des décisions distinctes.

**Réponse humaine attendue : approuver ce texte, ou identifier les références R à amender.**
À défaut, ARB-ORG-005 reste non arbitré ; le repli D doit faire l’objet d’une décision distincte.
