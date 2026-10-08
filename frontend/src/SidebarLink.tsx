import {
  useEffect,
  useId,
  useState,
  type FocusEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

import { NavigationIcon } from "./NavigationIcon";
import { productHref } from "./productHref";

type Props = {
  item: { path: string; title: string };
  active: boolean;
  collapsed: boolean;
  onNavigate: (path: string) => void;
};

export function SidebarLink({ item, active, collapsed, onNavigate }: Props) {
  const id = useId();
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const showTooltip = (
    event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>,
  ) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      left: Math.min(rect.right + 10, Math.max(8, window.innerWidth - 248)),
      top: rect.top + rect.height / 2,
    });
  };

  useEffect(() => {
    if (!position) return;
    const dismiss = () => setPosition(null);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [position]);

  return (
    <>
      <a
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.title : undefined}
        aria-describedby={collapsed && position ? id : undefined}
        data-tooltip={collapsed ? item.title : undefined}
        href={productHref(item.path)}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setPosition(null)}
        onClick={(event) => {
          event.preventDefault();
          setPosition(null);
          onNavigate(item.path);
        }}
      >
        <NavigationIcon path={item.path} />
        <span className="sidebar-label">{item.title}</span>
      </a>
      {collapsed &&
        position &&
        createPortal(
          <span
            className="sidebar-tooltip"
            id={id}
            role="tooltip"
            style={position}
          >
            {item.title}
          </span>,
          document.body,
        )}
    </>
  );
}
