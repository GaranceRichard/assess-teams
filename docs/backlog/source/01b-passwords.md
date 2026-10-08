# FEAT-001 — Parcours de gestion du mot de passe

Ces PBIs répondent à la demande du 2026-10-08, sous [FEAT-001](01-identites.md).
Ils appliquent les rôles des [concepts transverses](00-concepts-transverses.md).
Ils n’ajoutent aucune administration du mot de passe d’un autre utilisateur.
Le [contrat fonctionnel et technique](../../architecture/password-management.md) précise la sécurité.

## AUTH-002 — Récupérer son accès après oubli du mot de passe

- **Identifiant / Feature parente :** `AUTH-002` / `FEAT-001 — Accéder de manière authentifiée au produit`.
- **User story :** en tant que titulaire d’un compte, je veux demander un lien de récupération afin de retrouver mon accès après un oubli.
- **Intention :** rétablir un accès existant sans révéler les comptes ni changer les habilitations.
- **Description :** lien depuis la connexion, email, accusé générique et remise différée aux comptes actifs éligibles ; nouveau mot de passe confirmé puis retour à la connexion.
- **Critères :** parcours public ; réponse identique pour email existant ou absent ; token dédié valable une heure ; un seul changement réussi même en concurrence ; validateurs Django ; toutes les sessions invalidées ; chargement, succès, lien invalide/expiré et renouvellement accessibles.
- **Refus :** données/CSRF invalides, abus, token expiré/consommé/modifié, compte inactif ou en attente ; aucun mot de passe écrit et aucun secret journalisé.
- **Dépendances / priorité :** `AUTH-001` / P0.
- **Valeur :** autonomie du titulaire avec protection des accès et des comptes.
- **Limites :** remise effective exige SMTP et worker ; adresse ambiguë non traitée ; nouvelle demande seule sans révocation des anciens liens ; aucun historique complet de mots de passe.
- **Preuves :** API/ORM/OpenAPI, React et Playwright `passwords.spec.ts`, concurrence SQLite et contrôles des logs.

## AUTH-003 — Modifier son mot de passe depuis Mon profil

- **Identifiant / Feature parente :** `AUTH-003` / `FEAT-001 — Accéder de manière authentifiée au produit`.
- **User story :** en tant qu’utilisateur connecté, je veux changer mon mot de passe depuis Mon profil afin de garder la maîtrise de mon accès.
- **Intention :** permettre une modification personnelle sans élargir les droits d’administration.
- **Description :** formulaire dans Mon profil, mot de passe actuel vérifié côté backend, nouveau mot de passe et confirmation.
- **Critères :** tout rôle modifie seulement son compte ; CSRF et validateurs Django ; session courante conservée et renouvelée ; autres sessions et anciens liens invalidés ; messages explicites sans secrets ; shell/thèmes/palettes/clavier/mobile conservés.
- **Refus :** session absente/inactive, CSRF absent, ancien mot de passe incorrect, confirmation/politique invalide, champs cible/privilèges ou fréquence excessive ; aucun effet partiel.
- **Dépendances / priorité :** `AUTH-001`, `DASH-001` / P0.
- **Valeur :** contrôle personnel du mot de passe sans intervention d’un administrateur.
- **Limites :** aucune modification tierce, aucun nouveau menu ; démo statique sans cette mutation.
- **Preuves :** API par rôle, sessions multiples, React, OpenAPI et Playwright `passwords.spec.ts`.
