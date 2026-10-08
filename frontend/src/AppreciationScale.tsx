import { useId, useLayoutEffect, useRef, useState } from "react";
import type { AppreciationMarker } from "./evaluations";
import "./appreciation-markers.css";

type Props = {
  markers: AppreciationMarker[];
  score: number | null;
  disabled: boolean;
  onSelect: (score: number) => void;
};

export function AppreciationScale({
  markers,
  score,
  disabled,
  onSelect,
}: Props) {
  const id = useId();
  const tooltip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{
    marker: AppreciationMarker;
    anchor: HTMLButtonElement;
  } | null>(null);
  const selected = markers.find((marker) => marker.score === score);

  useLayoutEffect(() => {
    const element = tooltip.current;
    if (!active || !element) return;
    const position = () => {
      const rect = active.anchor.getBoundingClientRect();
      element.style.maxHeight = Math.max(24, rect.top - 16) + "px";
      const bounds = element.getBoundingClientRect();
      element.style.left =
        Math.max(
          8,
          Math.min(
            rect.left + rect.width / 2 - bounds.width / 2,
            window.innerWidth - bounds.width - 8,
          ),
        ) + "px";
      element.style.top = Math.max(8, rect.top - bounds.height - 8) + "px";
    };
    element.showPopover?.();
    position();
    const dismiss = () => {
      if (document.activeElement === active.anchor) position();
      else setActive(null);
    };
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      element.hidePopover?.();
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [active]);

  return (
    <>
      <div
        className="appreciation-scale"
        role="group"
        aria-label="Niveaux de notation de 0 à 10"
      >
        {Array.from({ length: 11 }, (_, level) => {
          const marker = markers.find((item) => item.score === level);
          return (
            <button
              key={level}
              type="button"
              className="secondary"
              data-configured={Boolean(marker)}
              aria-pressed={score === level}
              data-readonly={disabled}
              aria-label={
                level + " sur 10" + (marker ? " : " + marker.text : "")
              }
              aria-describedby={active?.marker.score === level ? id : undefined}
              onMouseEnter={(event) =>
                marker && setActive({ marker, anchor: event.currentTarget })
              }
              onMouseLeave={(event) => {
                if (document.activeElement !== event.currentTarget)
                  setActive(null);
              }}
              onFocus={(event) =>
                setActive(
                  marker ? { marker, anchor: event.currentTarget } : null,
                )
              }
              onBlur={() => setActive(null)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && active) {
                  event.preventDefault();
                  event.stopPropagation();
                  setActive(null);
                }
              }}
              onClick={(event) => {
                if (marker) setActive({ marker, anchor: event.currentTarget });
                if (!disabled) onSelect(level);
              }}
            >
              {level}
              {marker && <span className="marker-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {active && (
        <div
          ref={tooltip}
          popover="manual"
          className="appreciation-tooltip"
          id={id}
          role="tooltip"
        >
          <strong>{active.marker.score} / 10</strong> · {active.marker.text}
        </div>
      )}
      {selected && (
        <p className="selected-appreciation" aria-live="polite">
          <strong>Repère pour {score} / 10 :</strong> {selected.text}
        </p>
      )}
    </>
  );
}
