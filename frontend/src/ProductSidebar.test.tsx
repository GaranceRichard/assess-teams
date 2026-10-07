import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductSidebar } from "./ProductSidebar";

const adminLabels = [
  "Tableau de bord",
  "Utilisateurs",
  "Organisation",
  "Équipes",
  "Modèles d’évaluation",
  "Planification",
  "Évaluations",
  "Résultats",
  "Pilotage",
  "Journal d’activité",
  "Logs",
];

function renderSidebar(collapsed = false) {
  const onCollapsedChange = vi.fn();
  const onNavigate = vi.fn();
  render(
    <ProductSidebar
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      onNavigate={onNavigate}
      path="/dashboard"
      role="Admin"
    />,
  );
  return { onCollapsedChange, onNavigate };
}

describe("ProductSidebar", () => {
  it.each([false, true])(
    "keeps a decorative mark and an accessible brand (collapsed=%s)",
    (collapsed) => {
      renderSidebar(collapsed);

      const brand = screen.getByRole("link", { name: "Assess teams" });
      expect(brand).toHaveAttribute("href", "/dashboard");
      expect(brand.querySelector(".product-mark")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(brand.querySelector(".brand-label")).toHaveTextContent(
        "Assess teams",
      );
      expect(brand.querySelector("svg")).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    },
  );

  it("associates an icon with every visible menu item", () => {
    renderSidebar();

    const links = screen.getByRole("navigation").querySelectorAll("a");
    expect(links).toHaveLength(adminLabels.length);
    links.forEach((link) => {
      expect(link.querySelector(".navigation-icon")).toBeInTheDocument();
    });
  });

  it("requests the compact view from the collapse button", () => {
    const { onCollapsedChange } = renderSidebar();

    const button = screen.getByRole("button", { name: "Replier le menu" });
    const navigation = screen.getByRole("navigation");
    expect(button.previousElementSibling).toBe(navigation);
    expect(button).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(button);

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("offers expansion and exposes every icon label when collapsed", () => {
    const { onCollapsedChange } = renderSidebar(true);

    const button = screen.getByRole("button", { name: "Déplier le menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(onCollapsedChange).toHaveBeenCalledWith(false);

    adminLabels.forEach((label) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("data-tooltip", label);
    });
  });

  it("does not add hover tooltips while the labels are already visible", () => {
    renderSidebar();

    const link = screen.getByRole("link", { name: "Tableau de bord" });
    expect(link).not.toHaveAttribute("data-tooltip");
  });

  it("keeps navigation working from an icon entry", () => {
    const { onNavigate } = renderSidebar(true);

    fireEvent.click(screen.getByRole("link", { name: "Résultats" }));
    expect(onNavigate).toHaveBeenCalledWith("/results");
  });

  it("returns to the dashboard from the product mark", () => {
    const { onNavigate } = renderSidebar(true);

    fireEvent.click(screen.getByRole("link", { name: "Assess teams" }));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
