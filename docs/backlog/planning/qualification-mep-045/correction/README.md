# MEP-045 — Correction minimale d’Échap répété

2026-10-30, Codex ; branche `fix/mep-045-escape` ; base main `029857a96b730aaf6357c123b429860f56e445a0`.
Worktree : `C:/Users/garan/AppData/Local/Temp/Assess-teams-mep-045-fix`.
Windows, Chromium 153.0.8010.12 ; Python 3.12.10, Node 24.20.0 ; Django/SQLite locaux.
Données fictives de `taking-fixture`, services 29220/29221 pour la recette ciblée.

## Cause établie

La protection initiale intercepte `cancel`, appelle `preventDefault()` et n’appelle `onClose`
que si `!saving && !unsaved`. Chromium peut produire un `cancel` **non annulable** après
plusieurs demandes de fermeture : le troisième appui dans les deux reproductions du dossier,
le quatrième en attente dans les deux tests permanents renforcés, selon les activations précédentes.
L’appel à `preventDefault()` sur ce `cancel` n’empêche plus son action native.

Les traces avant correction montrent :

- `keydown` est annulable, `defaultPrevented=false` ;
- les premiers `cancel` sont empêchés ; le dernier est `cancelable=false`, non empêché ;
- un `close` natif survient ; le dialogue a `open=false`, **reste connecté au DOM** et porte encore 7 ;
- le serveur conserve correctement 0 ; aucun succès de sauvegarde n’est inventé.

La fermeture précède un démontage React : la garde métier est contournée par la fermeture native,
pas par une mutation du hook ou une transition de question. Le nombre trois n’est pas un seuil métier.

## Diff applicatif complet

Fichier unique : `frontend/src/EvaluationTakingDialog.tsx`, ajout entre `aria-modal` et `onCancel` :

```tsx
onKeyDown={(event) => {
  // Repeated Escape can make the native cancel event non-cancelable.
  if (event.key === "Escape" && (saving || unsaved))
    event.preventDefault();
}}
```

Cinq lignes ; aucun nouveau hook, composant, temporisateur ou état.
Le comportement clavier est empêché avant le chemin de fermeture native pendant l’attente/refus.
Après sauvegarde, cette garde n’empêche plus Échap : le `onCancel` existant ferme via React,
conserve le snapshot de sortie et rend le focus à son déclencheur.
Aucun changement de persistance, API, messages, styles ou mécanisme de transition.

## Preuves ciblées

| Sélection | Avant correction | Après correction |
| --- | --- | --- |
| Les deux tests exacts du dossier, `mep045-escape.spec.ts` extrait temporairement | 2 failed sur main, fermeture malgré refus | 2 passed, même protocole ; sources archivées dans le dossier initial |
| Tests permanents `evaluation-taking-escape.spec.ts` | 2 failed : attendu open=true, observé false, connected=true, score=7 | 2 passed : cinq Échap en attente et cinq après 400 ; 7 conservé ; réessai 204, GET=7 ; Échap autorisé et Fermer volontaire avec focus restauré |
| Sonde native 100/200/100 %, deux thèmes | Séquence initiale interrompue, sombre non démontré | 1 passed, 18 cellules état/thème/zoom ; cinq Échap protégés par état attente/refus ; fermeture autorisée après succès à chaque zoom |

Les tests exacts initiaux ont été retirés de l’arbre applicatif après comparaison ;
les deux tests permanents sont conservés et étendent leur protection à l’attente et à la fermeture autorisée.
Les traces de régression sont expurgées et accompagnées des empreintes des sources : [traces](traces.md).
Les commandes, codes de sortie et gates sont résumés dans [la revue de validation](../validations.md).

## Relecture visuelle des états réels

- [Attente, cinq Échap, clair](captures/day-pending.png) : 7 visible, Enregistrement…, Fermer indisponible.
- [Refus, cinq Échap, clair](captures/day-refused.png) et [sombre](captures/night-refused.png) :
  erreur entière et Réessayer disponibles ; aucune fermeture silencieuse.
- [Réessai réussi, clair](captures/day-saved.png) : Note enregistrée, Fermer réactivé ; GET=7.
- Zoom natif 200 % : [clair](captures/zoom-day-refused.png), [sombre](captures/zoom-night-refused.png).
  `innerWidth/innerHeight=640/360`, DPR=2, fenêtre 1280×720 à 100 %, zoom réel via extension locale.
  Textes et actions atteignables après défilement ; pas de débordement horizontal.

Les images ont été produites dans cette recette et relues, sans retoucher l’application.
Les styles et les sept capacités déjà conformes restent ceux de la qualification initiale.
L’assertion de sortie vérifie aussi le snapshot visuel `.dialog-exit`, puis sa disparition,
sans modifier ni requalifier le système général de transitions.

## Limite de livraison

Huit critères conformes et [gates locaux verts](gates.md) ; clôture proposée, soumise à validation du verdict.
Aucun statut canonique modifié. Aucun push, PR ou déploiement ; CI distante non exécutée avant publication.
