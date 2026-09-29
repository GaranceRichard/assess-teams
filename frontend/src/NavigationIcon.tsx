import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  "/dashboard": (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  "/users": (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  "/organization": (
    <>
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4" />
    </>
  ),
  "/teams": (
    <>
      <circle cx="12" cy="7" r="3" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="19" cy="10" r="2" />
      <path d="M7 21v-2a5 5 0 0 1 10 0v2M1 21v-1a4 4 0 0 1 4-4M23 21v-1a4 4 0 0 0-4-4" />
    </>
  ),
  "/templates": (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  "/planning": (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 18h2" />
    </>
  ),
  "/evaluations": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  "/results": (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  "/steering": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" />
    </>
  ),
  "/activity-journal": (
    <>
      <path d="M4 5h16v16H4zM8 3v4M16 3v4M4 9h16" />
      <path d="M8 13h3M8 17h6" />
    </>
  ),
  "/logs": (
    <>
      <path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
};

export function NavigationIcon({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" className="navigation-icon" viewBox="0 0 24 24">
      {icons[path] ?? icons["/dashboard"]}
    </svg>
  );
}
