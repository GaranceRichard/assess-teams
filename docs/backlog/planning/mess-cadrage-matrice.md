# Matrice exhaustive du cadrage MESS et de la refonte

Transcription de la liste détaillée du premier prompt de refonte, fournie dans cet échange.
Son en-tête annonçait **61 PBI**, mais ses lignes NN.NN étaient déjà au nombre de **63**.
Aucun inventaire distinct de 61 intitulés n’est disponible dans l’échange ou les sources versionnées consultées.
Il serait infondé de désigner deux lignes comme « ajouts » en se fondant uniquement sur la soustraction 63 − 61.
L’état de refonte comparé est le commit `a406801` ; les tailles initiales sont des recommandations.
Cette matrice rend chaque ligne initiale traçable et ne crée ni PBI ni nouveau besoin.

## Totaux comparables

| Périmètre | E01 | E02 | E03 | E04 | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Lignes détaillées initiales et fiches à a406801 | 13 | 17 | 19 | 14 | 63 |
| PBI MESS actifs après audit | 12 | 17 | 19 | 14 | 62 |
| Points initiaux couverts par des acquis référencés | 1 | 0 | 0 | 0 | 1 |

62 PBI actifs + l’acquis 03.01 couvrent les 63 points. Ce calcul n’ajoute pas JOURNAL-001/002 au
comptage MESS : ils ont déjà leurs parents uniques dans le backlog fonctionnel et y sont comptés une fois.
Les huit PBI du Job 1 et le jalon MEP-035 restent hors de ce dénominateur.

## E01 — rapprochement des lignes détaillées

| Point initial et intitulé | Taille initiale | Fiche à a406801 / origine ancienne | Traitement après audit / justification fonctionnelle |
| --- | --- | --- | --- |
| 01.01 — Inventorier les paramètres sensibles et les valeurs par défaut | XS | [MEP-036 — Inventorier les paramètres sensibles et les valeurs par défaut](../source/mess/f01.md) ; origine MEP-009 | Retenu 1:1, même intitulé et taille. Inventaire des paramètres, distinct de leur validation au démarrage. |
| 01.02 — Sécuriser les secrets et vérifier la configuration au démarrage | S | [MEP-009 — Sécuriser les secrets et vérifier la configuration au démarrage](../source/mess/f01.md) ; origine MEP-009 | Retenu 1:1, même intitulé et taille. Approvisionnement des secrets et refus de configuration dangereuse. |
| 01.03 — Contrôler l’isolation des accès entre organisations | S | [MEP-011 — Contrôler l’isolation des accès entre organisations](../source/mess/f01.md) ; origine MEP-011 | Retenu 1:1, même intitulé et taille. Frontière organisationnelle, distincte de la matrice des rôles. |
| 01.04 — Renforcer les permissions selon les rôles | S | [MEP-037 — Renforcer les permissions selon les rôles](../source/mess/f01.md) ; origine MEP-011 | Retenu 1:1, même intitulé et taille. Droits par rôle, distincts des rattachements organisationnels. |
| 01.05 — Sécuriser les accès indirects et les exports | S | [MEP-038 — Sécuriser les accès indirects et les exports](../source/mess/f01.md) ; origine MEP-011 | Retenu 1:1, même intitulé et taille. Voies indirectes et exports existants, sans créer d’export nouveau. |
| 02.01 — Définir les paramètres de concurrence SQLite | XS | [MEP-039 — Définir les paramètres de concurrence SQLite](../source/mess/f02.md) ; origine MEP-010 | Retenu 1:1, même intitulé et taille. Contrat des paramètres de concurrence, avant les mécanismes de reprise. |
| 02.02 — Gérer les verrous et les transactions concurrentes | S | [MEP-010 — Gérer les verrous et les transactions concurrentes](../source/mess/f02.md) ; origine MEP-010 | Retenu 1:1, même intitulé et taille. Verrous et transactions concurrentes, distincts des conflits métier. |
| 02.03 — Gérer les conflits sur les opérations critiques | S | [MEP-040 — Gérer les conflits sur les opérations critiques](../source/mess/f02.md) ; origine MEP-010 | Retenu 1:1, même intitulé et taille. Invariants des opérations critiques malgré deux mutations incompatibles. |
| 03.01 — Séparer les journaux HTTP des événements métier | S | [MEP-041 — Séparer les journaux HTTP des événements métier](../source/mess/mep-041-historique.md) ; origine 2.4 / JOURNAL-001 / JOURNAL-002 | Acquis consolidé, hors PBI actif. Même capacité, preuves et date que JOURNAL-001/002 ; alias sans livrable distinct. |
| 03.02 — Configurer les durées de conservation des journaux | XS | [MEP-042 — Configurer les durées de conservation des journaux](../source/mess/f03.md) ; origine MEP-020 | Retenu 1:1, même intitulé et taille. Politique et valeurs de conservation, distinctes du moteur de purge. |
| 03.03 — Automatiser la purge des journaux | S | [MEP-020 — Automatiser la purge des journaux](../source/mess/f03.md) ; origine MEP-020 | Retenu 1:1, même intitulé et taille. Exécution automatique de la politique, sans reconstruire les journaux. |
| 04.01 — Vérifier les protections de branche et les contrôles CI | XS | [MEP-012 — Vérifier les protections de branche et les contrôles CI](../source/mess/f04.md) ; origine MEP-012 | Retenu 1:1, même intitulé et taille. Audit des protections distantes ; CI et optimisations restent des acquis. |
| 04.02 — Mettre en place les protections manquantes | S | [MEP-043 — Mettre en place les protections manquantes](../source/mess/f04.md) ; origine MEP-012 | Retenu 1:1, même intitulé et taille. Correction conditionnelle des écarts, sans changement artificiel si aucun écart. |

## E02 — rapprochement des lignes détaillées

| Point initial et intitulé | Taille initiale | Fiche à a406801 / origine ancienne | Traitement après audit / justification fonctionnelle |
| --- | --- | --- | --- |
| 05.01 — Clarifier l’affichage des notes et de leur échelle | XS | [MEP-044 — Clarifier l’affichage des notes et de leur échelle](../source/mess/f05.md) ; origine MEP-013 | Retenu 1:1, même intitulé et taille. Sens de l’échelle et de l’absence, sans refaire la notation explicite livrée. |
| 05.02 — Améliorer l’ergonomie du curseur et de la sélection | S | [MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md) ; origine MEP-013 | Retenu 1:1, même intitulé et taille. Manipulation du curseur existant, distincte du libellé de la note. |
| 05.03 — Confirmer visuellement l’enregistrement de la notation | XS | [MEP-045 — Confirmer visuellement l’enregistrement de la notation](../source/mess/f05.md) ; origine MEP-013 | Retenu 1:1, même intitulé et taille. Accusé d’enregistrement réel, distinct des erreurs transverses de 08.05. |
| 06.01 — Améliorer la hiérarchie visuelle des résultats | S | [MEP-014 — Améliorer la hiérarchie visuelle des résultats](../source/mess/f06.md) ; origine MEP-014 | Retenu 1:1, même intitulé et taille. Contexte et hiérarchie des résultats, distincts de la typographie globale. |
| 06.02 — Clarifier les scores et les indicateurs | XS | [MEP-046 — Clarifier les scores et les indicateurs](../source/mess/f06.md) ; origine MEP-014 | Retenu 1:1, même intitulé et taille. Sens des scores existants, sans nouvelle formule métier. |
| 06.03 — Améliorer la présentation des graphiques radar | S | [MEP-015 — Améliorer la présentation des graphiques radar](../source/mess/f06.md) ; origine MEP-015 | Retenu 1:1, même intitulé et taille. Labels, légende et alternative du radar existant. |
| 06.04 — Améliorer les comparaisons entre équipes et évaluations | S | [MEP-047 — Améliorer les comparaisons entre équipes et évaluations](../source/mess/f06.md) ; origine MEP-015 | Retenu 1:1, même intitulé et taille. Compatibilité et filtres des comparaisons, sans nouvelle agrégation. |
| 07.01 — Harmoniser le vocabulaire du tableau de bord | XS | [MEP-016 — Harmoniser le vocabulaire du tableau de bord](../source/mess/f07.md) ; origine MEP-016 | Retenu 1:1, même intitulé et taille. Terminologie des écrans, distincte du sens des indicateurs. |
| 07.02 — Clarifier les indicateurs et leur interprétation | S | [MEP-048 — Clarifier les indicateurs et leur interprétation](../source/mess/f07.md) ; origine MEP-016 | Retenu 1:1, même intitulé et taille. Interprétation des faits existants, sans KPI individuel nouveau. |
| 08.01 — Adapter les tableaux et contenus aux petits écrans | S | [MEP-017 — Adapter les tableaux et contenus aux petits écrans](../source/mess/f08.md) ; origine MEP-017 | Retenu 1:1, même intitulé et taille. Contenus et tableaux sur petits écrans, distincts de la navigation. |
| 08.02 — Améliorer la navigation mobile et les interactions tactiles | S | [MEP-049 — Améliorer la navigation mobile et les interactions tactiles](../source/mess/f08.md) ; origine MEP-017 | Retenu 1:1, même intitulé et taille. Navigation et cibles tactiles, distinctes de la mise en page des contenus. |
| 08.03 — Améliorer les états de chargement | XS | [MEP-018 — Améliorer les états de chargement](../source/mess/f08.md) ; origine MEP-018 | Retenu 1:1, même intitulé et taille. Attente et réponses obsolètes, distinctes des états vides. |
| 08.04 — Améliorer les états vides | XS | [MEP-050 — Améliorer les états vides](../source/mess/f08.md) ; origine MEP-018 | Retenu 1:1, même intitulé et taille. Absence de données et absence de droits, distinctes d’un échec réseau. |
| 08.05 — Améliorer la présentation des erreurs | S | [MEP-051 — Améliorer la présentation des erreurs](../source/mess/f08.md) ; origine MEP-018 | Retenu 1:1, même intitulé et taille. Erreur et reprise transverses ; 05.03 reste le retour de sauvegarde des notes. |
| 09.01 — Corriger les contrastes et la lisibilité du thème clair | S | [MEP-019 — Corriger les contrastes et la lisibilité du thème clair](../source/mess/f09.md) ; origine MEP-019 | Retenu 1:1, même intitulé et taille. Lisibilité du clair ; norme AA non sourcée retirée, mesures choisies dans 17.02. |
| 09.02 — Harmoniser le thème sombre | XS | [MEP-052 — Harmoniser le thème sombre](../source/mess/f09.md) ; origine MEP-019 | Retenu 1:1, même intitulé et taille. Cohérence du sombre, en conservant le rendu et les palettes livrés. |
| 09.03 — Harmoniser la typographie et la hiérarchie visuelle | S | [MEP-053 — Harmoniser la typographie et la hiérarchie visuelle](../source/mess/f09.md) ; origine MEP-019 | Retenu 1:1, même intitulé et taille. Typographie transversale ; zoom 200 % non sourcé retiré, scénarios issus de 17.02. |

## E03 — rapprochement des lignes détaillées

| Point initial et intitulé | Taille initiale | Fiche à a406801 / origine ancienne | Traitement après audit / justification fonctionnelle |
| --- | --- | --- | --- |
| 10.01 — Définir le contrat de configuration unique | S | [MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md) ; origine MEP-021 | Retenu 1:1, même intitulé et taille. Schéma de configuration, distinct du chargement effectif. |
| 10.02 — Charger et valider la configuration unique | S | [MEP-021 — Charger et valider la configuration unique](../source/mess/f10.md) ; origine MEP-021 | Retenu 1:1, même intitulé et taille. Consommation et validation commune par les processus existants. |
| 11.01 — Définir les prérequis d’installation | XS | [MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md) ; origine MEP-022 | Retenu 1:1, même intitulé et taille. Conditions d’hébergement, distinctes des paramètres et de l’installateur. |
| 11.02 — Définir les opérations d’exploitation | S | [MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md) ; origine MEP-022 | Retenu 1:1, même intitulé et taille. Responsabilités et seuils d’exploitation, distincts de leurs automatisations. |
| 11.03 — Actualiser le README et l’architecture | XS | [MEP-023 — Actualiser le README et l’architecture](../source/mess/f11.md) ; origine MEP-023 | Retenu 1:1, même intitulé et taille. Entrées README/architecture après le contrat, distinctes des guides opérateur. |
| 11.04 — Actualiser le backlog | XS | [MEP-056 — Actualiser le backlog](../source/mess/f11.md) ; origine MEP-023 | Retenu 1:1, même intitulé et taille. Suivi canonique après le contrat ; cet audit ne réalise pas le futur MEP-056. |
| 12.01 — Inventorier les dépendances nécessaires à la distribution | S | [MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md) ; origine MEP-024 | Retenu 1:1, même intitulé et taille. Dépendances et licences du package, distinctes des paramètres sensibles de 01.01. |
| 12.02 — Préparer le frontend compilé pour la distribution | S | [MEP-058 — Préparer le frontend compilé pour la distribution](../source/mess/f12.md) ; origine MEP-024 | Retenu 1:1, même intitulé et taille. Artefact React compilé sur poste de préparation. |
| 12.03 — Préparer les dépendances Python hors ligne | S | [MEP-059 — Préparer les dépendances Python hors ligne](../source/mess/f12.md) ; origine MEP-024 | Retenu 1:1, même intitulé et taille. Dépendances Python locales compatibles avec la cible. |
| 12.04 — Assembler le package autonome | S | [MEP-024 — Assembler le package autonome](../source/mess/f12.md) ; origine MEP-024 | Retenu 1:1, même intitulé et taille. Assemblage et manifeste des composants, distincts de leur préparation. |
| 13.01 — Préparer les répertoires et les paramètres d’installation | S | [MEP-060 — Préparer les répertoires et les paramètres d’installation](../source/mess/f13.md) ; origine MEP-025 | Retenu 1:1, même intitulé et taille. Préflight, droits et chemins physiques, distincts du contrat de configuration. |
| 13.02 — Installer les composants et dépendances | S | [MEP-061 — Installer les composants et dépendances](../source/mess/f13.md) ; origine MEP-025 | Retenu 1:1, même intitulé et taille. Pose des composants, distincte de l’initialisation des données. |
| 13.03 — Initialiser SQLite et les données nécessaires | S | [MEP-062 — Initialiser SQLite et les données nécessaires](../source/mess/f13.md) ; origine MEP-025 | Retenu 1:1, même intitulé et taille. Migrations et bootstrap SQLite sans perte ni doublon. |
| 13.04 — Vérifier l’installation et diagnostiquer les échecs | S | [MEP-025 — Vérifier l’installation et diagnostiquer les échecs](../source/mess/f13.md) ; origine MEP-025 | Retenu 1:1, même intitulé et taille. Diagnostic de l’installateur, distinct du PV sur environnement vierge de 18.01. |
| 14.01 — Automatiser le démarrage et l’arrêt de l’application | S | [MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md) ; origine MEP-026 | Retenu 1:1, même intitulé et taille. Services et workers, sans reconstruire la file SMTP déjà livrée. |
| 14.02 — Automatiser la mise à jour de l’application | S | [MEP-026 — Automatiser la mise à jour de l’application](../source/mess/f14.md) ; origine MEP-026 | Retenu 1:1, même intitulé et taille. Upgrade contrôlé, distinct du retour à la version antérieure. |
| 15.01 — Réaliser une sauvegarde cohérente de SQLite | S | [MEP-064 — Réaliser une sauvegarde cohérente de SQLite](../source/mess/f15.md) ; origine MEP-027 | Retenu 1:1, même intitulé et taille. Sauvegarde cohérente, distincte de sa restauration. |
| 15.02 — Restaurer les données SQLite | S | [MEP-027 — Restaurer les données SQLite](../source/mess/f15.md) ; origine MEP-027 | Retenu 1:1, même intitulé et taille. Restauration des données, distincte du rollback applicatif complet. |
| 15.03 — Revenir à la version précédente après une mise à jour | S | [MEP-065 — Revenir à la version précédente après une mise à jour](../source/mess/f15.md) ; origine MEP-027 | Retenu 1:1, même intitulé et taille. Retour du couple application/schéma après upgrade. |

## E04 — rapprochement des lignes détaillées

| Point initial et intitulé | Taille initiale | Fiche à a406801 / origine ancienne | Traitement après audit / justification fonctionnelle |
| --- | --- | --- | --- |
| 16.01 — Rédiger le guide d’installation | XS | [MEP-028 — Rédiger le guide d’installation](../source/mess/f16.md) ; origine MEP-028 | Retenu 1:1, même intitulé et taille. Guide détaillé des commandes d’installation réelles. |
| 16.02 — Rédiger le guide d’exploitation | XS | [MEP-066 — Rédiger le guide d’exploitation](../source/mess/f16.md) ; origine MEP-028 | Retenu 1:1, même intitulé et taille. Guide détaillé des opérations réelles, distinct des entrées README de 11.03. |
| 16.03 — Documenter le transfert, le fork et la licence Apache 2.0 | XS | [MEP-029 — Documenter le transfert, le fork et la licence Apache 2.0](../source/mess/f16.md) ; origine MEP-029 | Retenu 1:1, même intitulé et taille. Transfert et fork du package ; Apache 2.0 et notices restent acquis. |
| 17.01 — Définir les scénarios de recette fonctionnelle | S | [MEP-030 — Définir les scénarios de recette fonctionnelle](../source/mess/f17.md) ; origine MEP-030 | Retenu 1:1, même intitulé et taille. Cahier métier avec résultats attendus, distinct de l’exécution en F19. |
| 17.02 — Définir les scénarios de recette UX | XS | [MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md) ; origine MEP-030 | Retenu 1:1, même intitulé et taille. Cahier UX avec mesures à choisir ; distinct de la réalisation des correctifs. |
| 17.03 — Définir les scénarios de recette technique | S | [MEP-031 — Définir les scénarios de recette technique](../source/mess/f17.md) ; origine MEP-031 | Retenu 1:1, même intitulé et taille. Cahier technique lié au contrat, distinct de l’exécution en F18/F20. |
| 18.01 — Installer Assess Teams sur un environnement vierge | S | [MEP-032 — Installer Assess Teams sur un environnement vierge](../source/mess/f18.md) ; origine MEP-032 | Retenu 1:1, même intitulé et taille. PV sur une cible vierge, distinct du développement de l’installateur. |
| 18.02 — Vérifier le fonctionnement sans connexion Internet | S | [MEP-068 — Vérifier le fonctionnement sans connexion Internet](../source/mess/f18.md) ; origine MEP-032 | Retenu 1:1, même intitulé et taille. Qualification runtime hors Internet, distincte de la seule pose hors ligne. |
| 19.01 — Vérifier les parcours d’administration | S | [MEP-033 — Vérifier les parcours d’administration](../source/mess/f19.md) ; origine MEP-033 | Retenu 1:1, même intitulé et taille. Parcours administratifs du candidat et vrais refus par rôle. |
| 19.02 — Vérifier les parcours d’évaluation et de notation | S | [MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md) ; origine MEP-033 | Retenu 1:1, même intitulé et taille. Passation, notes et provenance du candidat, sans réimplémenter leurs acquis. |
| 19.03 — Vérifier les parcours de consultation des résultats | S | [MEP-070 — Vérifier les parcours de consultation des résultats](../source/mess/f19.md) ; origine MEP-033 | Retenu 1:1, même intitulé et taille. Consultation et comparaison du candidat selon les droits existants. |
| 20.01 — Vérifier la sécurité et l’isolation des organisations | S | [MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) ; origine MEP-034 | Retenu 1:1, même intitulé et taille. Qualification sécurité ; SMTP/purge hérités de MEP-034, pas de nouveau besoin. |
| 20.02 — Vérifier la concurrence et la stabilité SQLite | S | [MEP-071 — Vérifier la concurrence et la stabilité SQLite](../source/mess/f20.md) ; origine MEP-034 | Retenu 1:1, même intitulé et taille. Qualification contention et intégrité du SQLite de production. |
| 20.03 — Exercer la sauvegarde, la restauration et le rollback | S | [MEP-072 — Exercer la sauvegarde, la restauration et le rollback](../source/mess/f20.md) ; origine MEP-034 | Retenu 1:1, même intitulé et taille. Exercice de reprise sur instance isolée, distinct des scripts F15. |

## Lecture des écarts

Toutes les lignes initiales ont une destination. Aucun ajout, omission ni découpage supplémentaire de
ligne n’est constaté entre cette liste détaillée et les 63 fiches de refonte. Les changements d’acceptation
sur 09.01/09.03 sont identifiés dans l’[audit](mess-audit.md), sans supprimer leurs intentions.
Les décompositions des 36 travaux plus anciens ne sont pas une preuve de « +2 » : elles sont rapprochées
séparément dans la [correspondance historique exhaustive](pre-mep-rapprochements.md).
La liste de 61 intitulés, si elle existe dans une source non fournie, reste une pièce à obtenir et comparer
par identifiant/intention ; aucun rapprochement fictif avec une telle liste n’est déclaré accompli.
