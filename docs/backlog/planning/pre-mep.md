# Chemin vers la MEP MESS — ordre de lancement et conditions de passage

**Prochain PBI recommandé : [MEP-053 — Typographie et hiérarchie](../source/mess/f09.md).**
MEP-067 est réalisé : le [cahier UX](../../quality/ux-acceptance.md) fournit les mesures de référence
et débloque MEP-053 et MEP-019. MEP-052 est réalisé ; ne pas attendre l’installation pour corriger l’esthétique.
En parallèle, faire obtenir les décisions D01–D09 de **MEP-055 — Prérequis d’installation**, toujours Bloqué.

Refonte intégrée à `942bd2f`, puis clôture documentaire MEP-067 le 2026-10-21. Les [62 lignes détaillées](../tracking/pre-mep-view.md)
et le [registre canonique](../tracking/pbis.md) comptent 13 Réalisés, 47 Ouverts, 2 Bloqués, 0 En cours.
Les dix acquis F01–F03, MEP-043 livré et le Job 1 ne sont pas relancés ; aucun PV cible n’est anticipé.
[Revue des dépendances et arbitrages](mess-dependances.md) ; [contrôles de cohérence et DoD](mess-revue-ordonnancement.md).

## Règle de pilotage

Les étapes U/I/C ci-dessous sont des repères de planification, jamais de nouveaux PBI ou des statuts.
Les flèches indiquent un ordre recommandé ; seuls les champs Dépendances des sources imposent une attente
technique de livraison. P1 reste la priorité canonique ; l’ordre départage concrètement ces PBI P1.
Un PBI Ouvert est livrable quand ses prérequis sont Réalisés, ses entrées disponibles et sa DoD satisfaite.
Préparer un cahier, un inventaire ou un guide en avance ne vaut ni livraison ni PV de recette.

À chaque disponibilité : prendre le premier PBI prêt du chantier UX ; maintenir en parallèle le chantier
installation dès que ses décisions sont obtenues. Si un PBI attend une entrée, avancer l’indépendant suivant.
Limiter les retouches concurrentes des mêmes composants/styles et intégrer chaque PBI prêt sans attendre le lot.
Chaque clôture actualise d’abord le registre, puis la synthèse ; aucune date de fin n’est inventée.

## Chantier UX prioritaire — cahier puis 17 PBI UX avant le candidat final

| Ordre recommandé | PBI et capacité | Condition objective pour poursuivre |
| --- | --- | --- |
| U0 — réalisé | [MEP-067 — Cahier UX](../source/mess/f17.md) | [UX-01 à UX-09](../../quality/ux-acceptance.md) : parcours/écrans, viewports, clavier/tactile, zoom, deux thèmes/dix palettes, mesures et vrais refus définis ; pas de PV anticipé |
| U1 — cohérence transversale | [MEP-053 — Typographie et hiérarchie](../source/mess/f09.md), puis [MEP-019 — Contrastes du clair](../source/mess/f09.md) ; [MEP-052 — Thème sombre](../source/mess/f09.md) réalisé | Mesures du cahier satisfaites, titres/libellés/densité cohérents, texte/action/focus lisibles, préférences conservées ; captures comparables |
| U2 — notation | [MEP-044 — Notes et échelle](../source/mess/f05.md), puis [MEP-013 — Curseur et sélection](../source/mess/f05.md), puis [MEP-045 — Confirmation de sauvegarde](../source/mess/f05.md) | 0 distingué de non répondu, repères exacts, clavier/tactile/focus utilisables, succès lié au serveur et reprise sans perte |
| U3a — résultats | [MEP-014 — Hiérarchie des résultats](../source/mess/f06.md), [MEP-046 — Sens des scores](../source/mess/f06.md), [MEP-015 — Radar](../source/mess/f06.md), [MEP-047 — Comparaisons](../source/mess/f06.md), dans cet ordre si une seule capacité | Contexte/provenance et limites explicites ; labels/légendes/tableaux lisibles, filtres conservés, aucune comparaison hors scope ou incompatible |
| U3b — dashboard, parallélisable avec U3a | [MEP-016 — Vocabulaire](../source/mess/f07.md), puis [MEP-048 — Interprétation des indicateurs](../source/mess/f07.md) | Dashboard/Pilotage cohérents, indicateurs reliés aux faits, sans score ou classement individuel |
| U4 — responsive et interactions, préparables dès U0 | [MEP-017 — Petits écrans](../source/mess/f08.md), [MEP-049 — Navigation tactile](../source/mess/f08.md), [MEP-018 — Chargement](../source/mess/f08.md), [MEP-050 — États vides](../source/mess/f08.md), [MEP-051 — Erreurs](../source/mess/f08.md) | Actions accessibles aux viewports convenus ; attente/vide/erreur distincts, réponses obsolètes ignorées, reprise sans perte ni faux succès |

U1 précède les retouches locales pour réduire les reprises de styles ; ce n’est pas une dépendance ajoutée.
U2, U3a, U3b et U4 peuvent avancer en parallèle sur composants distincts après cadrage commun.
L’ordre interne de U4 est celui du tableau si une seule capacité est disponible ; traiter plus tôt un refus
critique démontré. Les critères/refus complets des fiches et les tests requis restent obligatoires.
MEP-067 sert aussi de référence aux 15 PBI UX déjà prêts sans devenir une nouvelle dépendance technique.

## Chantier installation et exploitation — parallèle à l’UX

| Étape | Ordre et parallélisation | Sortie exigée / prochain lancement |
| --- | --- | --- |
| I0 — décision externe immédiate | [MEP-055 — Prérequis MESS](../source/mess/f11.md) | D01–D09 approuvées, datées, attribuées et incompatibilités résolues ; ensuite seulement clôturer et lancer I1 |
| I1 — configuration | [MEP-054 — Contrat unique](../source/mess/f10.md) | Schéma, précédence, chemins, secrets référencés, proxy/TLS, SMTP, services, sauvegardes et journaux définis sans sources concurrentes |
| I2 — trois PBI indépendants après I1 | [MEP-021 — Chargement/validation](../source/mess/f10.md) ; [MEP-022 — Opérations](../source/mess/f11.md) ; [MEP-057 — Inventaire de distribution](../source/mess/f12.md) | Même configuration API/workers/scripts et refus avant effet ; responsables/seuils MESS convenus ; versions/empreintes/licences de tous composants identifiées |
| I3a — distribution après MEP-057 | [MEP-058 — Frontend compilé](../source/mess/f12.md) et [MEP-059 — Python hors ligne](../source/mess/f12.md), en parallèle | Build normal et statiques locaux ; wheelhouse complet compatible OS/ABI, installation sans résolution réseau |
| I3b — cahier et entrées, en parallèle d’I3a | [MEP-031 — Cahier technique](../source/mess/f17.md) après MEP-022 ; [MEP-023 — README/architecture](../source/mess/f11.md) et [MEP-056 — Backlog contractuel](../source/mess/f11.md) après MEP-021/022 | Seuils/reprises/refus mesurables et documentation alignée sur le contrat réel ; la présente refonte ne réalise pas MEP-056 |
| I4 — package | [MEP-024 — Package autonome](../source/mess/f12.md) après MEP-058/059/021/022 | Manifeste, empreintes, migrations, statiques, dépendances et notices ; aucun secret ni besoin Internet, Node/npm ou Docker sur cible |
| I5 — installation séquentielle | [MEP-060 — Préflight/répertoires](../source/mess/f13.md) → [MEP-061 — Composants](../source/mess/f13.md) → [MEP-062 — SQLite/bootstrap](../source/mess/f13.md) → [MEP-025 — Diagnostic](../source/mess/f13.md) | Refus avant effet destructif, relance sans perte/doublon ; health, schéma, statiques, compte initial et workers vérifiés, rapport expurgé |
| I6 — branches parallèles après MEP-025 | [MEP-063 — Services/arrêt](../source/mess/f14.md) et [MEP-064 — Sauvegarde cohérente](../source/mess/f15.md) | Services supervisés sans résidu/double worker ; sauvegarde en écritures, empreinte/version/schéma et intégrité prouvés ; MEP-022 requis pour MEP-064 |
| I7 — branches parallèles après MEP-063/064 | [MEP-026 — Mise à jour](../source/mess/f14.md) et [MEP-027 — Restauration](../source/mess/f15.md) | Upgrade sûr conservant configuration/données ; restauration isolée avec provenance et seuil de reprise mesuré |
| I8 — réversibilité | [MEP-065 — Retour à la version précédente](../source/mess/f15.md), après les deux branches I7 | Couple application/configuration/schéma/données rétabli, historique et seuils conservés |

Les versions intermédiaires permettent de développer I5–I8 pendant les corrections UX. Elles ne sont pas
le candidat de recette finale. Le package final reprend ensuite tous les changements utiles, notamment
les services/outils livrés après le premier assemblage ; son manifeste est régénéré et vérifié à C0.
Cette convergence évite une dépendance circulaire MEP-024 ↔ MEP-063, sans retirer les services du package.

## Documentation et scénarios au bon moment

| Travail | Préparer dès maintenant | Clôturer avec les entrées réelles |
| --- | --- | --- |
| [MEP-030 — Cahier fonctionnel](../source/mess/f17.md) | Après U0 ou en parallèle : rôles, données fictives, attentes et refus des parcours livrés | Dépendances déjà réalisées ; ne pas attendre le package ; pas de fonctions ouvertes supposées livrées |
| MEP-031 — Cahier technique | Trame et cas de panne sur acquis SQLite/sécurité | Après MEP-022 (et MEP-039 acquis), seuils MESS effectivement convenus |
| [MEP-028 — Guide installation](../source/mess/f16.md) | Trame pendant I0–I5, commandes au fil de leur livraison | Après MEP-025/023 ; guide reproductible disponible avant MEP-032 |
| [MEP-066 — Guide exploitation](../source/mess/f16.md) | Responsabilités à I2, commandes pendant I6–I8 | Après MEP-020/026/065/023 ; commandes exercées, reprise et diagnostics documentés |
| [MEP-029 — Transfert/fork Apache 2.0](../source/mess/f16.md) | Sources, historique, licence/notices et modalités de reprise | Après MEP-024 et MEP-006 acquis ; exemple de fork constructible, package réel documenté |

Le transfert du dépôt vers **Azure DevOps Server on-premise** traite hébergement des sources, historique,
droits et reprise. La construction du package se fait sur poste de préparation ; l’installation consomme
ce package sur la cible applicative MESS. Ces trois opérations sont distinctes. Aucun changement d’hébergeur,
de CI ou de circuit Git n’est un prérequis technique ajouté au package ou à l’installation.
Le transfert effectif du dépôt n’est pas déclaré livré par MEP-029 ; voir les [frontières et arbitrages](mess-dependances.md).

## Convergence du candidat et séquence complète jusqu’à MEP-035

Le chemin structurel d’installation est I0 → I1 → I2 → I3a → I4 → I5 → I6 → I7 → I8.
La branche UX U0 → U1 → U2/U3/U4 et les guides convergent à C0. MEP-055 est aujourd’hui le verrou
externe de cette chaîne ; la conformité F04 reste un verrou de GO séparé. Sans durées/capacités décidées,
ce chemin critique est conditionnel, sans promesse de date ni durée mathématique inventée.

| Passage | Ordre recommandé / travaux parallèles | Conditions de passage vérifiables |
| --- | --- | --- |
| C0 — candidat réel | Converger UX U1–U4, I8 et guides ; réassembler le package final MEP-024 avec le build MEP-058 actualisé | SHA/version, manifeste/empreintes, OS/runtime, configuration expurgée, services/outils, guides et jeux fictifs identifiés ; critères F05–F15 satisfaits, aucune anomalie bloquante connue |
| C1 — installation vierge | [MEP-032 — Installation sur environnement vierge](../source/mess/f18.md) | MEP-025/028/031 réalisés ; PV du package final posé sans téléchargement/compilation cible, migrations et vérifications réussies |
| C2 — autonomie | [MEP-068 — Fonctionnement sans Internet](../source/mess/f18.md) | MEP-032/063/030 réalisés ; parcours/assets/services locaux éprouvés, flux externes observés absents, SMTP interne distingué |
| C3a — recettes métier/UX parallèles | [MEP-033 — Administration](../source/mess/f19.md), [MEP-069 — Évaluation/notation](../source/mess/f19.md), [MEP-070 — Résultats](../source/mess/f19.md) | MEP-068 et cahiers réalisés, correctifs UX requis par chaque fiche intégrés ; PV par rôle avec preuves visuelles/mesures et vrais refus |
| C3b — recettes techniques parallèles à C3a | [MEP-034 — Sécurité/isolation](../source/mess/f20.md), [MEP-071 — Charge SQLite](../source/mess/f20.md), [MEP-072 — Exercice de reprise](../source/mess/f20.md) | MEP-068/031 et capacités requises réalisées ; instance/snapshot isolé pour incidents, charge et reprise ; intégrité, provenance et seuils prouvés |
| C4 — décision explicite | [MEP-035 — GO/NO-GO](../tracking/mess-jalon.md) | Tous les PV F18–F20, guides/transfert F16, cahiers F17, capacités F01–F20 et arbitrages applicables satisfaits ; qualification exhaustive du SHA exact, CI/pre-push conformes ; décision attribuée, motivée, datée |

La convergence avant C1 est un choix pour éviter des recettes obsolètes, pas une nouvelle dépendance
technique de MEP-032 à toute l’exploitation ou à toute l’UX. Les développements et essais ciblés continuent
au fil de l’eau. En C3, séparer les données mutées ; garder le même candidat et des clones identifiés.

Un même résultat peut alimenter plusieurs PV s’il couvre exactement scénario, candidat, environnement
et configuration attendus ; le référencer plutôt que rejouer sans raison. Les preuves de développement
ne remplacent pas les essais cible. Un changement de candidat exige analyse d’impact, nouvelle qualification
exhaustive du SHA destiné à MESS et retest des scénarios affectés ; chaque maintien de preuve cible est justifié.
La CI sélective reste indépendante ; aucune autre nightly ou version n’est substituée au SHA qualifié.

## Blocages, décisions et GO/NO-GO

- **MEP-055 :** D01–D09 absentes ; exploitation/sécurité/réseau/PKI/messagerie MESS selon la [matrice existante](../../operations/installation-prerequisites-validation.md). Aucun OS ni accord supposé acquis.
- **MEP-022 :** responsables, disponibilité et seuils de reprise à convenir ; aucune valeur inventée. La réservation des environnements vierge et incident est anticipable, leur conformité reste à prouver.
- **F04 :** MEP-043 est Réalisé selon les critères révisés et la réserve G05 acceptée ; il ne bloque plus la publication. MEP-012 reste Bloqué dans le registre intégré ; [écart de suivi explicite](mess-dependances.md), sans nouvel audit ni chantier PR/CI. La recette applicative avance indépendamment.
- **ARB-ORG-005 :** résoudre le traitement des dépendances ou faire approuver une limitation effective et vérifiable avant recette administration/GO ; masquer une action dangereuse dans un cahier ne suffit pas.
- Les autres capacités métier ouvertes restent hors du candidat seulement si le périmètre accepté l’explicite ; les 62 PBI MESS sont conservés. Aucun retrait de recette, sécurité, esthétique, intégrité ou reprise n’est décidé ici.

GO reste interdit tant qu’un critère nécessaire ou arbitrage applicable manque. NO-GO peut être rendu
immédiatement sur blocage démontré ; consigner une décision ne réalise aucun PBI manquant.
Le détail des exigences est au [jalon canonique](../tracking/mess-jalon.md).

## PBI prêts au regard des dépendances connues du registre

17 PBI restent prêts : 14 PBI UX de F05–F08, MEP-019/053 et MEP-030.
MEP-067 réalisé lève l’attente de MEP-019/053.
« Prêt » est une éligibilité, pas un ordre : lancer U1 avec MEP-053, et préparer MEP-055 en parallèle.
Les fiches/source et la vue détaillée donnent les dépendances exhaustives ; un accès ou une donnée manquante
constatée au lancement est inscrit au registre, sans transformer toute attente PBI en statut Bloqué.

## Publication de cette refonte

MEP-043 livré dans `7f456fd`, circuit direct rétabli et worktree nettoyé : la condition de conservation locale
est levée. Aucune PR. Depuis la branche/worktree dédiés : resynchronisation, `quality:targeted`,
`npm run publish`, pre-push, CI du SHA exact, fast-forward sûr du main principal, puis nettoyage du seul
chantier terminé. Aucun script/protection/workflow modifié par la refonte.
