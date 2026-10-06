import { useLayoutEffect, useRef, useState } from "react";

import { savePalette, type SessionUser } from "./auth";
import {
  applyPalette,
  normalizePalette,
  type InterfacePalette,
} from "./palette";

export function usePalettePreference(user: SessionUser) {
  const [palette, setPalette] = useState(() =>
    normalizePalette(user.interface_palette),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

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
      if (!mounted.current) return;
      setPalette(normalizePalette(updated.interface_palette));
      setMessage("Couleur enregistrée.");
    } catch {
      if (!mounted.current) return;
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

  return { palette, saving, message, error, choose };
}

export type PalettePreference = ReturnType<typeof usePalettePreference>;
