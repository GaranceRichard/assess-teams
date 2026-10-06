import { useLayoutEffect, useRef, useState } from "react";

import { savePalette, type SessionUser } from "./auth";
import { applyPalette, palettes, type InterfacePalette } from "./palette";
import "./palette-picker.css";

export function PalettePicker({ user }: { user: SessionUser }) {
  const [palette, setPalette] = useState(user.interface_palette);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const pending = useRef(false);

  useLayoutEffect(() => {
    applyPalette(palette);
    return () => applyPalette("green");
  }, [palette]);

  async function choose(next: InterfacePalette) {
    if (pending.current || next === palette) return;
    const previous = palette;
    pending.current = true;
    setPalette(next);
    setSaving(true);
    setMessage("");
    setError(false);
    try {
      const updated = await savePalette(next);
      setPalette(updated.interface_palette);
      setMessage("Couleur enregistrée.");
    } catch {
      setPalette(previous);
      setError(true);
      setMessage(
        "Enregistrement impossible. Votre couleur précédente est rétablie.",
      );
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return (
    <details className="palette-picker">
      <summary>Couleurs</summary>
      <div className="palette-panel">
        <fieldset disabled={saving} aria-busy={saving}>
          <legend>Couleur d’interface</legend>
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
