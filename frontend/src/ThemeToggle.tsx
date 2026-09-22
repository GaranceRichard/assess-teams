import type { Theme } from "./theme";

type Props = { theme: Theme; onChange: (theme: Theme) => void };

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
    </svg>
  );
}

export function ThemeToggle({ theme, onChange }: Props) {
  const night = theme === "night";
  return (
    <button
      aria-label={night ? "Activer le mode jour" : "Activer le mode nuit"}
      aria-pressed={night}
      className="theme-toggle"
      onClick={() => onChange(night ? "day" : "night")}
      type="button"
    >
      <span className="theme-toggle-icon sun">
        <SunIcon />
      </span>
      <span className="theme-toggle-icon moon">
        <MoonIcon />
      </span>
      <span aria-hidden="true" className="theme-toggle-thumb" />
    </button>
  );
}
