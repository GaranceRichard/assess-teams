export type Theme = "day" | "night";

const storageKey = "assess-teams-theme";

export function readTheme(): Theme {
  return localStorage.getItem(storageKey) === "night" ? "night" : "day";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
}
