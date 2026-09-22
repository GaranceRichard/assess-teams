import type { UserRole } from "./auth";

export type ProductRoute = {
  path: string;
  title: string;
  menuRoles: UserRole[];
  minimumRole: UserRole;
};

export const routes: ProductRoute[] = [
  {
    path: "/dashboard",
    title: "Tableau de bord",
    menuRoles: ["Admin", "Coach", "Viewer"],
    minimumRole: "Viewer",
  },
  {
    path: "/users",
    title: "Utilisateurs",
    menuRoles: ["Admin"],
    minimumRole: "Admin",
  },
  {
    path: "/organization",
    title: "Organisation",
    menuRoles: ["Admin"],
    minimumRole: "Admin",
  },
  {
    path: "/teams",
    title: "Équipes",
    menuRoles: ["Admin", "Viewer"],
    minimumRole: "Viewer",
  },
  {
    path: "/my-teams",
    title: "Mes équipes",
    menuRoles: ["Coach"],
    minimumRole: "Coach",
  },
  {
    path: "/templates",
    title: "Modèles d’évaluation",
    menuRoles: ["Admin"],
    minimumRole: "Admin",
  },
  {
    path: "/planning",
    title: "Planification",
    menuRoles: ["Admin"],
    minimumRole: "Admin",
  },
  {
    path: "/evaluations",
    title: "Évaluations",
    menuRoles: ["Admin", "Coach"],
    minimumRole: "Coach",
  },
  {
    path: "/results",
    title: "Résultats",
    menuRoles: ["Admin", "Coach", "Viewer"],
    minimumRole: "Viewer",
  },
  {
    path: "/steering",
    title: "Pilotage",
    menuRoles: ["Admin"],
    minimumRole: "Admin",
  },
];

const rank: Record<UserRole, number> = { Viewer: 1, Coach: 2, Admin: 3 };

export function menuFor(role: UserRole): ProductRoute[] {
  return routes.filter((route) => route.menuRoles.includes(role));
}

export function canAccess(role: UserRole, route: ProductRoute): boolean {
  return rank[role] >= rank[route.minimumRole];
}

export function routeFor(path: string): ProductRoute | undefined {
  return routes.find((route) => route.path === path);
}
