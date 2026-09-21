# Gouvernance du backlog

Ce document est la référence unique pour créer, rattacher, suivre et synthétiser les éléments du backlog. Il gouverne leur évolution sans modifier le périmètre fonctionnel. Les [concepts métier transverses](source/00-concepts-transverses.md) sont définis une seule fois puis référencés par les Epics, Features et PBIs qui les utilisent.

## Hiérarchie et responsabilités

La hiérarchie obligatoire est `Epic → Feature → PBI`.

- Une **Epic** regroupe un objectif métier large et cohérent. Elle fixe une frontière de capacité durable, contient une ou plusieurs Features et ne décrit pas une unité directement livrable.
- Une **Feature** décrit une capacité métier identifiable, porte une intention, des acteurs, des critères d’acceptation, des dépendances et une priorité explicites. Elle appartient à une seule Epic.
- Un **PBI raffiné** est une unité livrable rattachée à une seule Feature. Il possède un identifiant, un titre, une user story, une intention, une description, des critères d’acceptation vérifiables, de vrais cas de refus, des dépendances, une priorité, une valeur et, si utile, des notes non fonctionnelles.

Une Feature ne devient jamais implicitement un PBI. Le code, une branche, un commit ou une synthèse ne crée aucun élément de backlog.

## Sources faisant autorité

L’autorité dépend de la nature de l’information :

1. les [concepts métier transverses](source/00-concepts-transverses.md) font autorité pour les concepts globaux, les rôles, les rattachements et les périmètres organisationnels ;
2. le [registre des arbitrages Organisation](source/00-arbitrages-organisations.md) fait autorité pour les décisions prises, décisions produit ouvertes et éléments qu’elles bloquent ;
3. les autres [documents détaillés](source/) font autorité pour les Epics, Features, PBIs et leurs conséquences métier spécifiques ;
4. le [registre canonique des PBIs](tracking/pbis.md) fait autorité pour le statut et la date de réalisation ; il est le registre unique des recommandations de taille et de modèle Codex, qui ne sont pas des décisions ;
5. l’[ordonnancement](planning/ordonnancement.md) organise uniquement les priorités et dépendances déjà explicites ;
6. la [synthèse du backlog](synthese.md) est la vue dérivée humaine du suivi courant et ne fait jamais autorité.

En cas de divergence, la source transverse prévaut pour un concept global, la source d’Epic pour sa conséquence fonctionnelle et le registre canonique pour le suivi. La synthèse doit être corrigée ; elle ne justifie jamais de modifier une source sans décision explicite.

## Nature des données

- **Concept métier global :** organisation, rôle, hiérarchie de capacités, règle de rattachement et périmètre commun. Il vit dans la source transverse et n’est pas redéfini dans chaque Epic.
- **Donnée métier spécifique :** objectif, acteur, comportement, règle, critère d’acceptation, refus, rattachement et dépendance fonctionnelle propres à un Epic, une Feature ou un PBI. Elle vit dans sa source détaillée.
- **Donnée de planification :** priorité, ordre et, après décision explicite, taille ou modèle Codex retenu. La priorité et les dépendances vivent dans la source détaillée. À ce jour, les tailles et modèles du registre sont des recommandations et ne valent ni estimation décidée ni affectation de modèle.
- **Donnée de suivi :** statut et date de réalisation. Elle vit dans le registre canonique.

Une valeur de synthèse doit pointer vers une de ces sources ou résulter d’une formule documentée.

## Concepts, rôles et périmètres

- une source d’Epic référence les concepts transverses au lieu d’en proposer une variante locale ;
- toute lecture de donnée métier exige une identité authentifiée ; les acteurs métier sont exprimés avec les rôles canoniques `Admin`, `Coach` et `Viewer` ; le `Superadmin` peut être cité lorsqu’une opération lui est explicitement ouverte, mais désigne toujours le superuser Django global et jamais un quatrième rôle métier ;
- tout élément qui utilise une donnée organisationnelle précise son rattachement direct ou le chemin métier qui permet de déterminer son organisation ;
- une opération portant sur plusieurs données vérifie la cohérence de leurs organisations et refuse tout croisement implicite ;
- `À arbitrer` signale une décision produit manquante. Cette valeur ne peut être remplacée par une hypothèse dans une source, une synthèse ou une implémentation ; le registre des arbitrages rend explicites ses blocages.

## Recommandations de taille et de modèle Codex

Les colonnes `Taille recommandée` et `Modèle Codex recommandé` du registre contiennent des recommandations de préparation. Elles sont centralisées pour éviter des variantes dans la synthèse, mais ne deviennent des décisions qu’après arbitrage explicite. Une recommandation automatique ne peut donc pas être utilisée comme engagement, estimation officielle ou affectation implicite. Si une décision intervient, sa nature et sa date doivent être enregistrées explicitement avant que les libellés de gouvernance et de registre ne la présentent comme telle.

## Identifiants et rattachements

- Une Epic utilise `EPIC-NNN`, une Feature `FEAT-NNN` et un PBI `<DOMAINE>-NNN`, avec un préfixe métier stable en majuscules.
- Les nouveaux numéros sont séquentiels dans leur espace, uniques et jamais réutilisés, y compris après retrait. Les éléments existants ne sont jamais renumérotés.
- `EPIC-002A` est un identifiant historique conservé ; aucun nouveau suffixe alphabétique ne doit être créé.
- L’identifiant figure dans le titre de l’élément. Celui d’un PBI figure aussi dans son champ `Identifiant`.
- Une Feature est placée sous son unique Epic. Un PBI est placé sous sa Feature et son champ `Feature parente` doit confirmer ce rattachement.
- Un changement de rattachement est une décision explicite dans la source détaillée, jamais une correction silencieuse de synthèse.

## Dépendances

Une dépendance référence un identifiant existant et précise, si nécessaire, la portée de la relation. Elle est orientée du dépendant vers le prérequis.

- aucune auto-dépendance ni dépendance circulaire n’est admise ;
- une dépendance supprimée ou renommée doit être corrigée chez tous ses consommateurs ;
- `aucune` est une valeur explicite ; une absence de champ signifie `À définir` ;
- une synthèse peut restituer une dépendance, jamais la déduire d’un ordre, du code ou d’une proximité documentaire.

## États

L’état de raffinement d’une Feature est calculé :

- `Non raffinée` si aucun PBI détaillé ne lui est rattaché ;
- `Raffinée` dès qu’au moins un PBI détaillé lui est rattaché.

Les statuts permis d’un PBI sont `Ouvert`, `En cours`, `Bloqué` et `Réalisé`. Tout changement est écrit dans le registre canonique avant la mise à jour des synthèses. Une Feature n’a pas de statut de livraison autonome : son avancement est calculé depuis ses PBIs raffinés.

Un PBI dépendant d’un arbitrage produit indispensable non résolu porte le statut `Bloqué` dans le registre et ne peut être présenté comme prêt à implémenter. Ce statut ne change ni son rattachement ni l’état calculé `Raffinée` de sa Feature. Une Feature non raffinée reste une Feature : son blocage est visible sans créer artificiellement de PBI.

Un PBI est `Réalisé` uniquement lorsque ses critères d’acceptation et refus sont satisfaits, les tests et contrôles applicables passent, la Definition of Done est respectée, le changement est intégré selon la procédure de livraison et une date de réalisation explicite est inscrite. L’existence de code ne suffit jamais.

## Valeurs absentes

Une information non définie n’est ni laissée vide ni inventée :

- `À définir` lorsqu’elle est attendue mais inconnue ;
- `Non raffiné` lorsqu’une vue porte sur une Feature sans PBI ;
- `N/A` lorsqu’une valeur ou un calcul ne s’applique pas.

Une date de réalisation vaut `N/A` tant que le PBI n’est pas `Réalisé`. Un PBI réalisé doit avoir une date ISO `AAAA-MM-JJ`.

## Calcul des indicateurs

- `Nombre d’Epics` = nombre d’identifiants Epic uniques déclarés dans la source détaillée.
- `Nombre de Features` = nombre d’identifiants Feature uniques déclarés dans cette source.
- `Features raffinées` = nombre de Features ayant au moins un PBI détaillé rattaché ; `Features non raffinées` = Features moins Features raffinées.
- `Nombre total de PBIs raffinés` = nombre d’identifiants PBI uniques détaillés.
- `PBIs ouverts` = PBIs au statut `Ouvert`, `En cours` ou `Bloqué`.
- `PBIs réalisés` = PBIs au statut `Réalisé`.
- `Avancement` = `PBIs réalisés / PBIs raffinés × 100`, arrondi à l’entier le plus proche. Si le dénominateur vaut zéro, le résultat est `N/A`.

Les mêmes règles s’appliquent aux agrégats par Feature, par Epic et au scoring global.

## Mise à jour des synthèses

Toute évolution suit cet ordre : source détaillée, registre canonique si nécessaire, contrôle de cohérence, puis [synthèse du backlog](synthese.md). Cette page reste l’unique vue complète du suivi courant et le point d’entrée humain. Elle :

- restitue seulement des valeurs explicites ou calculables par les formules ci-dessus ;
- accompagne toujours un identifiant d’Epic, de Feature ou de PBI de son libellé métier dans les tableaux ; le registre canonique applique aussi cette règle à ses colonnes `PBI` et `Feature parente` ;
- affiche `À définir`, `Non raffiné` ou `N/A` au lieu de compléter implicitement une donnée ;
- ne transforme pas une Feature en PBI et n’invente ni statut, recommandation de taille, recommandation de modèle, date, priorité ou dépendance ;
- rend visibles les arbitrages bloquants des Features et reprend pour les PBIs le statut canonique `Bloqué`, sans confondre blocage, raffinement et avancement ;
- ne déduit jamais une réalisation de l’existence de code ;
- est mise à jour dans le même changement que sa source.

La synthèse principale reste limitée à 200 lignes. Si la croissance des PBIs menace cette limite, elle conserve la vue globale, le scoring et les liens de navigation à son emplacement actuel. Seuls les détails nécessaires peuvent être déportés dans des fichiers secondaires explicitement liés ; ces fichiers ne deviennent jamais une synthèse concurrente ni une nouvelle source de vérité.

Le contrôle de cohérence recherche les identifiants absents ou dupliqués, rattachements manquants, dépendances inconnues ou circulaires, doublons fonctionnels évidents, divergences avec la synthèse et données de suivi présentes seulement dans cette vue dérivée.
