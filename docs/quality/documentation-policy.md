# Préparation et revue documentaires

Toute évolution est préparée dans son domaine de responsabilité avant les travaux techniques.
Le README racine est la vitrine produit ; il ne constitue pas le journal systématique des modifications.
Cette politique s’applique prospectivement à partir de l’intégration du mandat de refonte de l’accueil.
Les livraisons acceptées, preuves, décisions et dérogations antérieures ne sont pas réévaluées rétroactivement.

## Choisir le document propriétaire

Utiliser en priorité le document existant qui porte le contrat, le risque ou la qualification concernée.
Créer un dossier seulement si une responsabilité nouvelle ou un ensemble de preuves le justifie.

| Responsabilité | Emplacement adapté |
| --- | --- |
| Contrat applicatif, données, droits, interface | `docs/architecture/`, source ou préparation dans `docs/backlog/source/` ou `docs/backlog/planning/` |
| Qualité, tests, qualification, hooks, CI ou scripts de validation | `docs/quality/` |
| Installation, configuration, exploitation, reprise | `docs/operations/` ; `docs/development-environments.md` pour le développement local |
| Finalité et principes produit | `docs/product/vision.md` |
| Informations publiques d’accueil | `README.md`, seulement si son contenu produit est réellement affecté |

Le registre `docs/backlog/tracking/`, un index, un fichier runtime nommé README ou un Markdown arbitraire
ne remplacent pas une préparation. Une liste de chemins admis ne suffit jamais : le gate exige aussi
un bloc ajouté complet qui référence chaque fichier technique concerné. Les scripts qualité, hooks et CI
exigent une trace dans `docs/quality/`. Pour les autres domaines, le choix exact reste soumis à revue de contenu.

## Préparation du changement

Dans le document propriétaire, ajouter une section de préparation propre au lot avant de coder.
Elle explique le périmètre, l’objectif, les effets attendus, les risques et leur vérification.
Chaque fichier technique finalement modifié est rattaché explicitement à cette préparation ; ajuster
la liste si le périmètre évolue, sans inventer a posteriori un préalable qui n’a pas eu lieu.

Exemple de structure observable (remplacer les textes et chemins par le contenu réel du chantier) :

```markdown
## Préparation du changement — sujet du lot

- Périmètre : décrire les contrats et les limites du travail envisagé.
- Objectif : expliquer le problème effectivement observé à résoudre.
- Effets attendus : décrire le comportement attendu après la livraison.
- Risques : identifier les régressions et dépendances à préserver.
- Vérification : préciser les preuves de succès et les vrais cas de refus.
- Fichier : `backend/chemin-du-fichier.py`
```

La section complète doit être ajoutée dans le diff du lot ; un ancien bloc inchangé ou un ajout cosmétique
à un document existant ne compte pas. Plusieurs documents peuvent couvrir un lot, chacun pour ses fichiers.
Les champs comportent une phrase explicative (au moins 25 caractères et quatre mots de deux lettres ou plus).
Vide, TODO, TBD, placeholder, « à compléter » et lorem ipsum sont refusés. Ces bornes détectent les
traces manifestement insuffisantes ; du texte artificiel plus élaboré reste un refus de revue.
Ne pas recopier un historique pour satisfaire ce format ; conserver le contrat dans son document canonique.

## Quand modifier le README

Modifier le README si l’évolution change la proposition de valeur, les fonctionnalités présentées,
les parcours de découverte, l’installation exposée, les liens d’entrée ou les informations publiques utilisateur.
Sinon, conserver la préparation et les détails dans le domaine concerné. Une édition artificielle du README
n’est jamais une preuve suffisante. Si le README porte lui-même une préparation justifiée, il respecte
les mêmes exigences de contenu ; un document spécialisé reste préférable pour les détails techniques.

## Contrôle automatique et revue de contenu

`check-documentation.ps1` compare les ajouts à la base Git du plan d’impact (`QUALITY_DIFF_BASE` en gate/CI).
En local, il inclut index, travail et fichiers non ignorés ; en publication le candidat est entièrement commité.
Une base explicite invalide provoque un échec. Un document supprimé, absent, inchangé ou un lien symbolique
ne compte pas. Le contrôle reconnaît les changements applicatifs/scripts et configurations de dépendances.
Il ne prétend certifier ni la pertinence sémantique, ni l’ordre temporel réel, ni l’exhaustivité des impacts métier.

Avant publication, le contributeur ou mainteneur consigne explicitement dans le document propriétaire :

- la préparation réellement effectuée avant les travaux et tout écart de procédure ;
- l’adéquation du document au contrat et aux fichiers concernés, avec refus du remplissage artificiel ;
- l’impact sur le README et les autres sources, les liens, les normes et les preuves à conserver ;
- les résultats, refus testés, limites et éventuels points nécessitant une décision humaine.

Cette revue de contenu demeure obligatoire même si le gate passe. Un agent peut la consigner, sans
présenter sa vérification comme une approbation humaine ; toute décision réservée au mainteneur reste explicite.
La revue humaine à l’acceptation porte explicitement sur la pertinence et le préalable réel que le diff
ne démontre pas ; le rapport de l’agent fournit les éléments et signale les réserves à cette revue.
Les commandes, sélections et gates de publication restent ceux de la [validation selon l’impact](validation-costs.md).

La régression PowerShell couvre présence pertinente sans README, absence, vide, placeholders, mauvais domaine,
fichier non couvert, historique inchangé, ajout cosmétique, suppression et traces locales/stagées/commitées.
La matrice d’impact conserve prose seule sans tests applicatifs, mais scripts de validation en exhaustif.
