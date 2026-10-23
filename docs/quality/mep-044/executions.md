# Exécutions UX-07 — MEP-044

2026-10-23, Codex ; Chromium/Windows, Coach fictif `taking-fixture`, zoom 100 %, Vert.
Candidat : [empreintes exactes](sources.md), comparé à `f327f71`. Aucun identifiant réel ni secret.

| Scénario | Viewport | Thème | Actions et mesures | Preuve | Résultat |
| --- | --- | --- | --- | --- | --- |
| UX-07 / UX-03 | 1280×720 | day | Échelle visible et accessible ; null distinct de 0/5 ; Entrée/Home/End/flèche ; repère réel ; texte ≥4,5 ; aucun débordement horizontal | [Vide](captures/1280/day-unanswered.png) · [0](captures/1280/day-0.png) · [5](captures/1280/day-5.png) · [10](captures/1280/day-10.png) · [9/repère 7](captures/1280/day-9.png) | Passé |
| UX-07 / UX-03 | 1280×720 | night | Échelle visible et accessible ; null distinct de 0/5 ; Entrée/Home/End/flèche ; repère réel ; texte ≥4,5 ; aucun débordement horizontal | [Vide](captures/1280/night-unanswered.png) · [0](captures/1280/night-0.png) · [5](captures/1280/night-5.png) · [10](captures/1280/night-10.png) · [9/repère 7](captures/1280/night-9.png) | Passé |
| UX-07 / UX-03 | 390×844 | day | Échelle visible et accessible ; null distinct de 0/5 ; Entrée/Home/End/flèche ; repère réel ; texte ≥4,5 ; aucun débordement horizontal | [Vide](captures/390/day-unanswered.png) · [0](captures/390/day-0.png) · [5](captures/390/day-5.png) · [10](captures/390/day-10.png) · [9/repère 7](captures/390/day-9.png) | Passé |
| UX-07 / UX-03 | 390×844 | night | Échelle visible et accessible ; null distinct de 0/5 ; Entrée/Home/End/flèche ; repère réel ; texte ≥4,5 ; aucun débordement horizontal | [Vide](captures/390/night-unanswered.png) · [0](captures/390/night-0.png) · [5](captures/390/night-5.png) · [10](captures/390/night-10.png) · [9/repère 7](captures/390/night-9.png) | Passé |
| UX-07 / UX-03 | 320×568 | day | Échelle visible et accessible ; null distinct de 0/5 ; Entrée/Home/End/flèche ; repère réel ; texte ≥4,5 ; aucun débordement horizontal | [Vide](captures/320/day-unanswered.png) · [0](captures/320/day-0.png) · [5](captures/320/day-5.png) · [10](captures/320/day-10.png) · [9/repère 7](captures/320/day-9.png) | Passé |
| UX-07 / UX-03 | 320×568 | night | Échelle visible et accessible ; null distinct de 0/5 ; Entrée/Home/End/flèche ; repère réel ; texte ≥4,5 ; aucun débordement horizontal | [Vide](captures/320/night-unanswered.png) · [0](captures/320/night-0.png) · [5](captures/320/night-5.png) · [10](captures/320/night-10.png) · [9/repère 7](captures/320/night-9.png) | Passé |

Le contrôle du focus et des actions est complété par `evaluation-rating-focus` aux tailles
1366×768, 1920×1080 et 375×667, deux thèmes ; `evaluation-taking-layout` passe aussi
en 320×568 et 568×320 avec texte long, sauvegarde refusée et reprise.
Le parcours souris/tactile émulé, backend réel, en contexte mobile 390×844 est dans `evaluation-explicit-rating`
en clair et sombre : aucune écriture au focus/navigation, reprise 0/5 inchangée et refus finalisation 400.

Les captures sont celles du contenu de la modale ; les petites hauteurs conservent un scroll du corps.
La revue visuelle constate texte entier de l’échelle et de la note, focus rond visible, actions distinctes.
À 320×568, l’enregistrement reste accessible par scroll et le footer demeure visible.
La preuve de zoom navigateur 200 % MEP-053 reste distincte ; elle n’est pas revendiquée ici.
Recette cible MESS et certification normative : non exécutées, hors périmètre de MEP-044.
