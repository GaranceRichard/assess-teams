export const palettes = [
  { value: "green", label: "Vert" },
  { value: "blue", label: "Bleu" },
  { value: "pink", label: "Rose" },
  { value: "red", label: "Rouge" },
] as const;

export type InterfacePalette = (typeof palettes)[number]["value"];

export function applyPalette(palette: InterfacePalette): void {
  document.documentElement.dataset.palette = palette;
}
