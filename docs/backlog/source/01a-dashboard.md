# DASH-001 — Accueillir l’utilisateur sur son tableau de bord personnel

- **Epic / Feature parente :** EPIC-001 / FEAT-001 — Accéder de manière authentifiée au produit.
- **User story :** en tant qu’utilisateur connecté, je veux retrouver mon identité, mon contexte,
  mon apparence et les dernières actions d’évaluation accessibles pour reprendre mon activité.
- **Acteurs :** Admin, Coach, Viewer et capacité technique Superadmin, selon les scopes réels existants.
- **Dépendances :** AUTH-001, PASS-001, EVAL-003 et scopes Results existants.
- **Priorité :** P0 pour l’accueil personnel demandé ; aucun pilotage analytique supplémentaire.
- **Périmètre livré :** `/dashboard`, projection read-only `GET /api/dashboard/`, profil sans édition,
  palettes personnelles déplacées depuis le header, complétion initiale/dernière révision distinctes,
  dix événements maximum et raccourcis par rôle avec compteur personnel Admin/Coach.
- **Critères d’acceptation :** identité persistée sans donnée inventée ; Superadmin sans organisation
  personnelle et activité globale contextualisée ; aucune activité hors scope ; dates/version historiques
  exactes ; Viewer limité aux COMPLETED organisationnels, auteurs masqués et aucune donnée admin.
  Palette immédiate, persistée après reconnexion et conservée en navigation ; clair/sombre dans le header.
- **Refus :** session absente/inactive, toute mutation, contexte interorganisation incohérent ; Viewer
  ne reçoit ni assignations ni accès administration/passation via l’accueil.
- **Limites :** dernière révision uniquement, pas d’historique exhaustif ni de récurrences prédites,
  pas de scores, statistiques ou édition de compte ; la complétion peut sortir des dix événements.
- **Preuves :** tests API/ORM/OpenAPI, React et Playwright du dashboard et des palettes.
- **Contrat et audit :** [Dashboard personnel](../../architecture/dashboard-api.md).

Ce PBI n’étend ni Results, ni Pilotage, ni les permissions du Journal. Son statut et sa date sont dans
le [registre canonique](../tracking/pbis.md).
