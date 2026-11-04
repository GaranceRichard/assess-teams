# MEP-049 — Navigation mobile et interactions tactiles

**Réalisé le 2026-11-03 : [clôture fonctionnelle approuvée](cloture.md), sans développement supplémentaire.**
L'essai sur téléphone physique reste un contrôle complémentaire MESS explicitement non exécuté.

Qualification locale du 2026-11-02 par Codex, sur la base applicative
`d7f67499825264194730598c2fc0bee247853f3b`, avec les deux nouvelles suites de ce lot.
[Contrat canonique](../../backlog/source/mess/f08.md) ·
[Fiche de qualification](../../backlog/planning/audit-20261027/fiches/MEP-049.md) ·
[Cahier UX-05/06/08](../ux-acceptance.md).
[Qualification initiale](results.md) · [Correctif Retour navigateur](history.md).

## Périmètre et décision

La qualification initiale des commandes visibles ne reproduisait aucun défaut. Son élargissement
au Retour navigateur démontre une perte de note après refus de sauvegarde : ce seul défaut est corrigé.
Le shell conserve le dialogue et sa note pendant les traversées Retour/Avance tant que la sauvegarde
est en attente ou refusée ; rechargement/sortie demandent la confirmation native du navigateur.
Après sauvegarde, les traversées sont de nouveau autorisées. Aucun nouveau menu, seuil tactile ou droit ajouté.
La préférence existante est le repli conservé entre destinations pendant la session du shell ;
elle ne promet pas une persistance après rechargement ou reconnexion.
Les composants Dashboard/Pilotage/Résultats et les preuves MEP-048 ne sont pas modifiés.
Le correctif touche App, un hook de navigation isolé et un attribut de la modale de passation.
Les routes sont consommées telles quelles ; aucune interprétation de leurs indicateurs n'est ajoutée.

## Recette reproductible

Windows, Chromium Playwright installé, zoom 100 %, palette Vert par défaut.
Mobile : 390×844, contexte `hasTouch`, `hover: none`, actions `tap` sans survol préalable.
Admin, Coach et Viewer fictifs, chacun rattaché à son organisation `Mobile <rôle>`.
Chaque rôle parcourt toutes ses destinations dans les deux états du menu, en clair et sombre.
Les dimensions des liens et l'atteignabilité de leur centre sont consignées dans `touch-targets.json`.
Il s'agit de mesures observées, sans seuil tactile supplémentaire imposé.
Les liens, le repli, Entrée/Espace, `aria-current`, `aria-expanded` et le focus sont vérifiés.
Le repli subsiste à chaque navigation ; le document ne déborde pas horizontalement.
Le clavier est aussi exercé en 1280×720, 1920×1080 et 1280×480, dans les deux thèmes et par rôle.
Les captures mobiles attendent la fin de la transition de page ; les vidéos conservent les transitions.

| Scénario | Attendu et observations couvertes | Preuve |
| --- | --- | --- |
| 1 — Menus Admin/Coach/Viewer | Toutes les destinations autorisées activées au tactile, menu ouvert/replié ; préférence et focus des commandes conservés | `mobile-navigation.spec.ts`, six variantes rôle/thème, mesures et captures |
| 2 — Formulaire Admin | Date 05/11/2099 conservée après tentative de navigation vers le fond et refus PUT 400 ; réessai réussi, réouverture avec date persistée, Échap et retour au déclencheur | `mobile-dialogs.spec.ts`, planning, capture `planning-refused.png` |
| 2 — Saisie protégée Coach | Note 5 non enregistrée conservée après refus 400, toucher le fond et Échap ; Fermer désactivé, réessai puis réouverture avec note 5 | `mobile-dialogs.spec.ts`, passation, capture `score-protected.png` |
| 3 — Refus de droits | Équipes absent des menus Coach/Viewer ; accès direct refusé et API organisations 403, sans nouvelle donnée accessible | `mobile-navigation.spec.ts` et `permissions.spec.ts` |
| Non-régression | Géométrie sidebar à hauteur 900/480, confinement Tab/Shift+Tab, retour de focus et sauvegarde en attente/refusée | Suites existantes `sidebar-layout`, `dialog-accessibility`, `dialog-taking-accessibility` |

Le formulaire de planification utilise le jeu `Taking E2E` Admin/Coach, équipe et modèle à deux questions.
Les refus sont injectés sur la requête de sauvegarde, puis retirés pour vérifier la persistance réelle.
Le test de passation réutilise les protections existantes sans modifier le curseur déjà qualifié.
Une annulation explicite autorisée reste autorisée : ce PBI n'introduit pas de protection générale des brouillons.

## Commandes et preuves

Depuis la racine du worktree isolé :

```powershell
npm.cmd run quality:targeted
npm.cmd run quality:targeted -- e2e e2e/mobile-history.spec.ts e2e/mobile-navigation.spec.ts e2e/mobile-dialogs.spec.ts e2e/sidebar-layout.spec.ts e2e/permissions.spec.ts e2e/dialog-accessibility.spec.ts e2e/dialog-taking-accessibility.spec.ts
```

Les vidéos `video.webm`, captures PNG et mesures sont générées dans `frontend/test-results`.
Le rapport final et le manifeste d'archive identifient les entrées et les sélections exécutées.
Les artefacts sont conservés hors worktree avant son nettoyage ; aucune trace de session/cookie livrée.
Les vidéos représentent une interaction tactile émulée automatisée et une navigation clavier.
La relecture visuelle des captures est distincte des assertions ; elle ne constitue pas une vidéo
manuelle sur téléphone physique. La recette MESS cible, le tactile physique et le GO restent distincts.
Aucun scénario non exécuté sur un appareil physique n'est déclaré passé sur cet appareil.

## Revue documentaire et DoD

README annoncé avant les tests ; architecture du shell et inventaire de validation mis à jour.
Règles agents, charte qualité, DoD, stratégie de tests, fondamentaux et contrat backend relus :
aucune règle ni contrat API ne change. Backend et migrations non applicables au correctif frontend.
Le plan obligatoire recalcule les tests React dépendants, statiques frontend et parcours E2E complets
du shell partagé ; les seuils exhaustifs restent inchangés. Les preuves initiales ne qualifient pas le correctif.
La publication conserve `npm run publish`, pré-push bloquant et CI du SHA exact, sans PR.
La [décision explicite du 2026-11-03](cloture.md) clôture le registre sur ces preuves acquises ;
la recette physique/cible reste distincte et non exécutée, complémentaire à la clôture fonctionnelle.
