import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarLink } from "./SidebarLink";

const item = { path: "/results", title: "Résultats" };
function setup(collapsed = true) {
  const onNavigate = vi.fn();
  const view = render(
    <SidebarLink
      item={item}
      active={false}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />,
  );
  return { ...view, onNavigate, link: screen.getByRole("link") };
}

describe("SidebarLink tooltips", () => {
  it("creates a tooltip outside navigation only while hovered or focused", () => {
    const { link, container } = setup();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.mouseEnter(link);
    expect(screen.getByRole("tooltip")).toHaveTextContent(item.title);
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    expect(link).toHaveAttribute(
      "aria-describedby",
      screen.getByRole("tooltip").id,
    );
    fireEvent.mouseLeave(link);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.focus(link);
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.blur(link);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it.each(["scroll", "resize"])("dismisses a stale tooltip on %s", (event) => {
    const { link } = setup();
    fireEvent.focus(link);
    fireEvent(window, new Event(event));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not create hidden tooltip boxes in the expanded state", () => {
    const { link } = setup(false);
    fireEvent.focus(link);
    fireEvent.mouseEnter(link);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("dismisses the tooltip when navigating and expanding", () => {
    const { link, onNavigate, rerender } = setup();
    fireEvent.focus(link);
    fireEvent.click(link);
    expect(onNavigate).toHaveBeenCalledWith(item.path);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.focus(link);
    rerender(
      <SidebarLink
        item={item}
        active
        collapsed={false}
        onNavigate={onNavigate}
      />,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
