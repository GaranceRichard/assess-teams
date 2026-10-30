# Relecture visuelle initiale MEP-045
Les observations ci-dessous datent de la qualification initiale du 2026-10-29.
Les cellules Échap et zoom ont été reprises le 2026-10-30 : [preuves après correction](correction/README.md).
La cellule sombre initialement non démontrée est maintenant exécutée.

Codex, 2026-10-29 ; SHA `029857a96b730aaf6357c123b429860f56e445a0`.
Windows / Chromium 153.0.8010.12, données fictives, palette Vert, zoom 100 % sauf mention.
Les planches assemblent sans retouche les captures actuelles des dialogues :
colonnes attente / refus / succès ; ligne supérieure clair, inférieure sombre.
Elles ne proviennent pas des preuves historiques MEP-013/044.

| Format CSS / interaction de la sonde intégrée | États relus | Observation / verdict visuel de ces états |
| --- | --- | --- |
| [1280×720](captures/1280x720.png), clavier | Trois × deux thèmes | Textes entiers et distincts, 7 visible, attente/erreur/réessai/succès lisibles ; actions présentes. Conforme |
| [1920×1080](captures/1920x1080.png), clavier | Trois × deux thèmes | Dialogue compact, mêmes messages/actions, pas de chevauchement. Conforme |
| [1280×480](captures/1280x480.png), clavier | Trois × deux thèmes | Texte et actions dans la faible hauteur. Conforme |
| [390×844](captures/390x844.png), tactile émulé | Trois × deux thèmes | Erreur sur deux lignes, action Fermer sur sa ligne, aucune information portée par couleur seule. Conforme |
| [320×568](captures/320x568.png), clavier | Trois × deux thèmes | Après défilement du corps jusqu’en bas : erreur entière au-dessus du réessai, pied accessible. Conforme après défilement |
| [568×320](captures/568x320.png), clavier | Trois × deux thèmes | Corps défilé : statut entier, réessai et pied lisibles ; contexte supérieur accessible par retour du scroll. Conforme après défilement |
| [Révision Admin](captures/revision-admin.png), sombre 390×844 | Note locale 5 | « Note à valider » et « La révision sera enregistrée à sa validation. » ; action Annuler, pas d’annonce de sauvegarde individuelle. Conforme |
| [Zoom natif 200 %](captures/zoom-200-refus.png), clair | Attente / refus / succès observés, capture limitée au refus | 640×360 CSS, DPR 2 ; erreur/réessai/pied atteignables, pas de débordement horizontal selon la sonde. Sous-parcours conforme ; **séquence globale échouée sur Échap** |
| Zoom natif 100/200/100 %, sombre | Non exécuté par la sonde interrompue | **Non démontré** ; cellule à reprendre après correction du défaut |
| [Échap avant](captures/echap-avant.png) / [après](captures/echap-apres.png), clair 1280×720 | 7 refusé puis disparition | **Non conforme**, critère 8 ; reproduction sombre confirmée par traces serveur et événements natifs |

## Défilement et précision des assertions

Lors de la première relecture aux formats 320×568 et 568×320, le bouton sticky pouvait
recouvrir une partie du statut à une position intermédiaire du scroll.
Une sonde supplémentaire limitée à ces quatre cellules a défilé le corps à son maximum,
mesuré les limites du **texte réel** par `Range.getBoundingClientRect()` et vérifié
`text.bottom <= action.top`. Les douze mesures (trois états × quatre cellules) passent.
Les planches correspondantes ont été recapturées après ce geste, à 13:08 sur le même SHA.
Il reste possible de lire intégralement le statut et d’atteindre le réessai : aucun défaut
supplémentaire n’est conclu sur la seule position intermédiaire du scroll.

La note et les erreurs restent explicites en texte ; les gardes d’attente/refus et le rôle
`status`/`alert` sont vérifiés dans les sondes. Une capture n’atteste pas une lecture par synthèse vocale.
Aucune certification d’accessibilité ou validation esthétique utilisateur n’est déduite du résultat.
La stabilité mesurée des actions ne suffit pas à attester leur lisibilité : les images ont été relues.
Aucun avant/après applicatif : aucun code de l’application n’a changé pendant la qualification.
