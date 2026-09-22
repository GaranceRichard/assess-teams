import type { ChangeEvent } from "react";

import type { Theme } from "./theme";

type Props = { theme: Theme; onChange: (theme: Theme) => void };

export function ThemeSelector({ theme, onChange }: Props) {
  function change(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value as Theme);
  }

  return (
    <label className="theme-selector">
      <span>Thème</span>
      <select aria-label="Thème" onChange={change} value={theme}>
        <option value="day">Jour</option>
        <option value="night">Nuit</option>
      </select>
    </label>
  );
}
