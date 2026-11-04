# Qualification initiale MEP-049 — avant contrôle de l'historique

Exécution Codex du 2026-11-02 sur Windows, Chromium **153.0.8010.12**, Playwright **1.63.0**.
Base applicative `d7f67499825264194730598c2fc0bee247853f3b`, nouvelles suites identifiées ci-dessous.
Cette campagne précède le [défaut reproduit et corrigé sur Retour navigateur](history.md).
Ses composants applicatifs sont identiques à cette base ; ses succès ne couvrent pas ce défaut.
[Périmètre et limites](README.md).

## Attendu / observé

| Cas | Variantes | Résultat observé | Verdict local |
| --- | --- | --- | --- |
| Navigation tactile | Admin/Coach/Viewer × clair/sombre × menu ouvert/replié, 390×844 | 68 destinations activées sans survol ; aucun centre de cible recouvert ; 68 contrôles de largeur du document conformes | Passé |
| Cibles mesurées | Liens de navigation uniquement | Minimum observé 36×44 px ; aucune norme de taille nouvelle déduite de cette mesure ; boutons de repli et actions de formulaire activés réellement | Passé |
| Repli et sélection | Chaque destination autorisée des six variantes | Repli conservé, destination courante indiquée par `aria-current` ; `aria-expanded` cohérent | Passé |
| Clavier et focus | Six variantes ; mobile, 1280×720, 1920×1080, 1280×480 ; zoom 100 % | Entrée/Espace changent le repli ; focus conservé sur le bouton et sur le lien activé ; bouton accessible en faible hauteur | Passé |
| Formulaire tactile/clavier | Admin Taking E2E, clair, 390×844 | Date conservée sur refus PUT 400 et tentative vers le fond ; Tab/Shift+Tab confinés, réessai persistant, Échap/retour de focus conformes | Passé |
| Saisie protégée | Coach Taking E2E, clair, 390×844 | Note 5 conservée sur refus 400, fond et Échap ; fermeture bloquée jusqu'au réessai réussi ; réouverture avec note 5 | Passé |
| Refus de droits | Coach/Viewer × clair/sombre ; suites de permissions existantes | Aucun lien Équipes ; accès direct refusé ; API organisations 403 ; droits et sessions changées restent couverts | Passé |
| Géométrie / dialogues existants | Sidebar Admin/Viewer 1280×900/480 ; dialogues identité, organisation, équipe, planning et passation | Confinement, retour de focus, sauvegarde en attente/refusée et repli conformes aux assertions existantes | Passé |
| Tactile physique / vidéo manuelle | Téléphone réel, clavier virtuel système, recette MESS | Non exécutés ; les vidéos livrées sont des interactions émulées automatisées | Non exécuté |

## Contrôles exécutés

- E2E : sélection explicite des six suites du [protocole](README.md), **16/16 passent**, 1,8 minute.
- React : `ProductSidebar.test.tsx SidebarLink.test.tsx navigation.test.ts DialogAccessibility.test.tsx DialogPending.test.tsx`, **6 fichiers / 41 tests passent** ; Vitest sélectionne aussi le fichier partageant le suffixe DialogAccessibility.
- `npm.cmd run build --prefix frontend` : typecheck et build passent ; avertissement existant de chunk >500 kB, sans échec.
- Campagne initiale mobile : 5/5 passent ; elle a motivé l'élargissement des preuves, sans correction applicative.
- Le plan `quality:targeted` et le pré-push imposent leurs contrôles indépendamment de ces commandes explicites.
- Aucun endpoint, modèle, migration ou calcul ne change ; coverage global backend/frontend non recalculé par ces sélections partielles.

La limite des 200 lignes a conduit à intégrer l'annonce dans le paragraphe shell du README,
sans retirer de contenu documentaire. Les essais de préparation non concluants (politique du
runtime PowerShell, formatage de test pendant édition) ne sont pas des écarts produit et ne valent pas preuve finale.

## Relecture et conservation

Relecture visuelle des captures : menus lisibles et dépliables, liens atteignables, focus de Résultats
visible en sombre et faible hauteur ; actions de planification et de réessai visibles à 390×844.
Les captures ne remplacent pas la recette manuelle physique ; aucune certification globale UX revendiquée.

Archive conservée hors worktree : `MEP-049-preuves-20261102.zip`, dans le dossier temporaire utilisateur.
Elle contient **34 PNG**, **8 vidéos WebM**, six relevés originaux `touch-targets.json`, les deux nouvelles
suites, trois rapports d'exécution et un manifeste avec empreintes de chaque artefact.
SHA-256 archive : `1b577ea7a25d0f290ac52818fa1fd2f937845270279e8f49405eda12cd40c7d4`.

SHA-256 des tests exécutés :

- `mobile-navigation.spec.ts` : `aca0939fed0d5a22002228df081049027241d33cb1377ea2e6904a7758bdf896`.
- `mobile-dialogs.spec.ts` : `834d3b99e019f07fa4b2015b9c83855d13353d3d7ba91d7fe728d031b288b76e`.

Le registre était ouvert à l'issue de cette qualification locale. La [clôture fonctionnelle approuvée le 2026-11-03](cloture.md)
réutilise les résultats acquis ; le téléphone physique reste un complément de recette MESS non exécuté.
