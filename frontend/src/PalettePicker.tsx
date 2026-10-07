import type { SessionUser } from "./auth";
import { palettes } from "./palette";
import {
  usePalettePreference,
  type PalettePreference,
} from "./usePalettePreference";
import "./palette-picker.css";

export function PalettePicker({
  user,
  preference,
}: {
  user: SessionUser;
  preference?: PalettePreference;
}) {
  return preference ? (
    <PaletteOptions preference={preference} />
  ) : (
    <PersonalPalette user={user} />
  );
}

function PersonalPalette({ user }: { user: SessionUser }) {
  const preference = usePalettePreference(user);
  return <PaletteOptions preference={preference} />;
}

function PaletteOptions({ preference }: { preference: PalettePreference }) {
  const { palette, saving, message, error, choose } = preference;
  return (
    <details className="palette-picker">
      <summary>Couleurs</summary>
      <div className="palette-panel">
        <fieldset disabled={saving} aria-busy={saving}>
          <legend>Couleur de l’interface</legend>
          <div className="palette-options">
            {palettes.map(({ value, label }) => (
              <label key={value}>
                <input
                  type="radio"
                  name="interface-palette"
                  value={value}
                  checked={palette === value}
                  onChange={() => void choose(value)}
                />
                <span
                  className="palette-swatch"
                  data-palette={value}
                  aria-hidden="true"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <p
          className={error ? "form-error" : "palette-status"}
          role={error ? "alert" : "status"}
        >
          {saving ? "Enregistrement…" : message}
        </p>
      </div>
    </details>
  );
}
