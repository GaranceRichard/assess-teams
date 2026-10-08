import { productHref } from "./productHref";
import type { UserRole } from "./auth";
import { SidebarLink } from "./SidebarLink";
import { menuFor } from "./navigation";

type Props = {
  path: string;
  role: UserRole;
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onCollapsedChange: (collapsed: boolean) => void;
};

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
          href={productHref("/dashboard")}
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/dashboard");
          }}
        >
          <span aria-hidden="true" className="product-mark" />
          <span className="brand-label">Assess teams</span>
        </a>
      </div>
      <nav aria-label="Navigation principale" id="product-navigation">
        {menuFor(role).map((item) => (
          <SidebarLink
            key={item.path}
            item={item}
            active={path === item.path}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
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
    </aside>
  );
}
