import type { UserRole } from "./auth";
import { NavigationIcon } from "./NavigationIcon";
import { menuFor } from "./navigation";

type Props = {
  path: string;
  role: UserRole;
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onCollapsedChange: (collapsed: boolean) => void;
};

function ProductMark() {
  return (
    <svg aria-hidden="true" className="product-mark" viewBox="0 0 32 32">
      <path d="M16 3 29 27h-7l-2.2-4H12l-2.2 4H3L16 3Zm0 8.8L14 17h4l-2-5.2Z" />
    </svg>
  );
}

function ToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={collapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
    </svg>
  );
}

export function ProductSidebar({
  path,
  role,
  collapsed,
  onNavigate,
  onCollapsedChange,
}: Props) {
  const toggleLabel = collapsed ? "Déplier le menu" : "Replier le menu";

  return (
    <aside
      className={`product-sidebar${collapsed ? " product-sidebar--collapsed" : ""}`}
    >
      <div className="sidebar-heading">
        <a
          aria-label="Assess teams"
          className="brand"
          href="/dashboard"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/dashboard");
          }}
        >
          <ProductMark />
          <span className="brand-label">Assess teams</span>
        </a>
        <button
          aria-controls="product-navigation"
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          className="sidebar-toggle"
          onClick={() => onCollapsedChange(!collapsed)}
          title={toggleLabel}
          type="button"
        >
          <ToggleIcon collapsed={collapsed} />
        </button>
      </div>
      <nav aria-label="Navigation principale" id="product-navigation">
        {menuFor(role).map((item) => (
          <a
            key={item.path}
            aria-current={path === item.path ? "page" : undefined}
            aria-label={collapsed ? item.title : undefined}
            data-tooltip={collapsed ? item.title : undefined}
            href={item.path}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.path);
            }}
          >
            <NavigationIcon path={item.path} />
            <span className="sidebar-label">{item.title}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
