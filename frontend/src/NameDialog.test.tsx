import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { NameDialog } from "./NameDialog";

it.each(["question", "évaluation"] as const)(
  "announces the editing purpose for a %s",
  (kind) => {
    render(
      <NameDialog
        kind={kind}
        value={{ id: 1, name: "Nom conservé" }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const title =
      kind === "question" ? "Modifier la question" : "Modifier l’évaluation";
    expect(screen.getByRole("dialog")).toHaveAccessibleName(title);
    expect(screen.getByRole("textbox")).toHaveValue("Nom conservé");
  },
);
