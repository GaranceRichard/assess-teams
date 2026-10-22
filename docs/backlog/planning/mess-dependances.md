# Revue des dépendances MESS — 2026-10-21

Compagnon du [chemin de lancement](pre-mep.md). Les [fiches F01–F20](../source/07-pre-mep.md)
font autorité pour les dépendances ; le [registre](../tracking/pbis.md) pour statuts/dates/preuves.
Le [détail des 62 PBI](../tracking/pre-mep-view.md) conserve chaque identifiant, parent et prérequis.
L’audit du 2026-10-14 et ses archives restent historiques, sans réécriture des constats datés.

## Dépendances techniques et choix d’ordre

| Relation examinée | Nature / décision de cette refonte | Conséquence de pilotage |
| --- | --- | --- |
| Job 1 → Job 7 ou F01 entière avant UX | Ordre historique, aucune dépendance active | Ne pas attendre F04 pour lancer l’UX ou préparer MESS ; ne pas relancer les dix réalisés F01–F03 |
| MEP-067 → MEP-019/053 | Entrée réelle : mesures de contraste/zoom/hiérarchie | Dépendances conservées et satisfaites par le [cahier livré](../../quality/ux-acceptance.md) ; démarrage immédiat de U1 |
| MEP-067 avant les 15 autres PBI UX prêts | Choix de cohérence des corrections | Même cahier de référence ; aucun nouvel arc technique ajouté à leurs fiches |
| Typographie/thèmes avant notation/résultats/dashboard | Ordre pour réduire les reprises visuelles | Paralléliser les composants distincts ; ne pas sérialiser toute l’UX par Feature |
| MEP-055 → MEP-054/057 | Profil cible indispensable, pas simple convention | Conserver ; préparer schéma/inventaire, sans figer OS, ABI, serveur ou valeurs non approuvés |
| MEP-054 → MEP-021/022/057 | Contrat consommé par chargement, exploitation et inventaire | Trois branches possibles, sans attendre l’achèvement de toute F11 |
| MEP-057 → MEP-058/059 → MEP-024 | Composants/compatibilité et manifeste réels | Frontend et Python en parallèle ; prototype possible, candidat final après convergence UX |
| MEP-024 → MEP-060 → MEP-061 → MEP-062 → MEP-025 | Données d’entrée de l’installation | Conserver ; une copie de sources ou le bootstrap développeur ne les réalise pas |
| MEP-025 → MEP-063/064 ; MEP-063/064 → MEP-026/027 → MEP-065 | Services, sauvegarde, upgrade et restauration réels | Deux paires parallèles ; rollback du couple version/schéma après les deux branches |
| Services dans MEP-024 alors que MEP-063 suit l’installation | Assemblages successifs, pas une exigence de développer les services avant le premier package | Réassembler le candidat final avec tous les outils ; ne pas créer de cycle ni oublier un composant |
| Guides/cahiers après tout le produit | Attente artificielle de préparation | Trames et scénarios anticipés ; clôture seulement avec commandes et seuils réels, guide avant son usage en recette |
| MEP-012 → MEP-043, alors que conformité 012 attend les corrections 043 | Verrou logique historique, pas cycle formel du graphe | MEP-043 est désormais livré selon critères révisés ; conserver décision/preuves et signaler le suivi MEP-012 encore Bloqué, sans nouvel audit |
| MEP-043 → MEP-034 | Attente de gouvernance sans entrée technique pour les essais applicatifs listés en F20 | Retirée explicitement de la source F20 et de sa vue dérivée ; F04 reste exigée au GO, aucun critère sécurité ou CI retiré |
| F04 → MEP-035 | Exigence actuelle de conformité, distincte du runtime | Conservée selon les critères/décisions applicables ; MEP-043 réalisé avec réserve acceptée, MEP-012 canonique encore Bloqué |
| Ensemble UX/exploitation avant MEP-032 | Convergence recommandée pour une seule campagne de candidat | Aucun arc technique ajouté ; installation de développement possible avant, sans PV final revendiqué |
| Migration du dépôt vers Azure DevOps Server → package/installation | Aucune dépendance de ce type dans les fiches actives | Ne pas transformer un transfert d’hébergement en chantier CI ni en gate de construction/installation |

Modification de dépendance décidée ici : **MEP-034 n’attend plus MEP-043 pour sa livraison applicative**.
Avant : la qualification TLS, secrets, scopes, SMTP et purge attendait aussi un PBI de protections Git.
Après : ses prérequis applicatifs restent inchangés ; l’examen de conformité F04 demeure obligatoire
pour GO dans MEP-035. Le critère F20 porte sur la sécurité du candidat installé, indépendante du dépôt.
Aucune autre dépendance source n’est supprimée, aucun statut/date/parent/critère de refus n’est modifié.

## Activités anticipables et travaux hors chaîne technique

- Dès maintenant : MEP-067 réalisé ; MEP-019/030/052/053/067 réalisés ; MEP-044 prêt ; collecte D01–D09, réservation des cibles et données fictives.
- Préparation seule : MEP-054/057/031, MEP-028/066/029 ; confronter l’existant, marquer les inconnues, finaliser après les entrées canoniques.
- MEP-023/056 avancent après le contrat sans attendre le package. Cette réorganisation du backlog n’est pas leur livraison contractuelle.
- MEP-029 ne bloque pas les essais d’installation, mais sa documentation de reprise reste exigée avant GO. Apache 2.0/NOTICE déjà acquis, aucun travail de licence recréé.
- MEP-066 peut être rédigé pendant les services/reprises ; sa clôture attend MEP-065. Ne pas attendre ce guide pour rédiger MEP-030/067/031.
- Les fonctions générales encore ouvertes (utilisateurs, équipes, partage, évolutions) ne sont pas ajoutées en bloc à la MEP. Le cahier et la décision de périmètre doivent distinguer acquis, limites acceptées et lacunes indispensables.

« Hors chaîne technique » ne signifie pas facultatif au GO. Aucun des 62 PBI n’est placé arbitrairement
après MEP-035. Tout retrait demanderait décision produit/MESS explicite avec conséquences sur les scénarios.
Les correctifs applicatifs nécessaires seront traités dans les PBI existants, avec leurs tests et leur DoD.

## MEP-043 livré : publication libérée

Lors de la préparation initiale sur `d24fb35`, MEP-043 avait deux commits locaux non intégrés ;
la conservation locale était donc appliquée. À la reprise du chantier le 2026-10-21 :

- `origin/main` et main principal propre sont à `7f456fdbb4fc3ba03e77955630ccad08537a3e5b`.
- Les commits `dffd979`/`7c00603`, le nettoyage `2b3723d` et la clôture révisée `7f456fd` sont intégrés.
- Le worktree et la branche MEP-043 ont été nettoyés ; seules les archives conservées et les preuves versionnées font référence.
- [Livraison et CI exactes](../../quality/mep-043/delivery.md), [clôture avec réserve G05 acceptée](../../quality/mep-043/closure.md) : MEP-043 est Réalisé le 2026-10-21 ; aucune conformité initiale rétroactive ni inventaire Apps complet revendiqué.
- Le [ruleset main](https://github.com/GaranceRichard/assess-teams/rules/25544011) conserve suppression/force-push interdits, bypass vide et push direct ; CI après intégration expressément acceptée.

La condition de conservation locale est levée : resynchroniser cette refonte, conserver les critères
révisés et la clôture de MEP-043, valider la documentation puis publier avec `npm run publish`.
Aucun script, workflow ou réglage GitHub n’est modifié par le chantier documentaire.

**Écart de suivi restant MEP-012 :** les documents de clôture MEP-043 disent MEP-012 déjà clôturée,
mais sa source F04 et la ligne canonique intégrée la conservent Bloqué/N/A. Le registre faisant autorité,
cette refonte conserve ce statut et signale la divergence avant GO, sans inventer une réalisation/date,
sans rouvrir MEP-043, sans nouvel audit Git/Apps ni remettre G05 en blocage de publication.
L’audit daté du 2026-10-20 reste historique ; le recadrage explicite MEP-043 est conservé.

## Arbitrages nécessaires avant GO, sans nouveau chantier

| Décision attendue | Interlocuteur attendu / preuve de résolution | Effet tant qu’absente |
| --- | --- | --- |
| D01–D09 | Habilités MESS selon la matrice de MEP-055 ; choix, date, approbateurs et référence accessibles | MEP-055 reste Bloqué ; aucune cible approuvée ni artefact final compatible présumé |
| Seuils/responsabilités MEP-022 | Exploitation MESS et responsable produit ; disponibilité, sauvegarde et reprise mesurables | Contrat et cahier technique non clôturables ; aucune estimation RPO/RTO inventée |
| Suivi F04 / MEP-012 | Responsable du dépôt/produit ; aligner le statut/critères de MEP-012 sur la décision explicite déjà évoquée dans la clôture MEP-043 | MEP-043 reste clos ; divergence MEP-012 visible avant GO, aucun nouveau chantier technique |
| Inventaire des acteurs G05 | Réserve expressément acceptée dans la clôture MEP-043 ; preuves historiques conservées | Non vérifié, non bloquant ; aucun nouvel audit exigé ni inventaire fictif |
| ARB-ORG-005 et limites fonctionnelles | Responsable produit/MESS ; traitement sûr des dépendances ou limitation effective approuvée, scénarios et refus vérifiables | Refus de recette administration et de GO si une opération destructive non arbitrée reste exposée |
| Transfert effectif du dépôt Azure DevOps Server | Repreneur MESS ; destination/droits et reprise à convenir si exigés au transfert | MEP-029 documente le fork ; ne prouve aucune migration réalisée ni nouvelle CI on-premise |

La décision de clôture MEP-043 accepte explicitement les limites du circuit direct et la réserve G05.
Cette refonte la reprend sans exiger une nouvelle barrière CI. Les gates actuels, la qualification
exhaustive du SHA exact et toutes les recettes de production restent obligatoires ; le suivi MEP-012
encore contradictoire est distingué de cette livraison technique réussie.
