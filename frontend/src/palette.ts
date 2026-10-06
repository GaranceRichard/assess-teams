export const palettes = [
  { value: "blue", label: "Bleu" },
  { value: "indigo", label: "Indigo" },
  { value: "violet", label: "Violet" },
  { value: "pink", label: "Rose" },
  { value: "red", label: "Rouge" },
  { value: "orange", label: "Orange" },
  { value: "amber", label: "Ambre" },
  { value: "green", label: "Vert" },
  { value: "emerald", label: "Émeraude" },
  { value: "turquoise", label: "Turquoise" },
] as const;

export type InterfacePalette = (typeof palettes)[number]["value"];

export function normalizePalette(value: unknown): InterfacePalette {
  return palettes.find((palette) => palette.value === value)?.value ?? "green";
}

export function applyPalette(palette: unknown): void {
  document.documentElement.dataset.palette = normalizePalette(palette);
}
