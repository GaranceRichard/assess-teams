import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { AppreciationMarker } from "./evaluations";
import { appreciationForScore } from "./appreciationForScore";
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
  const dismissal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState<{
    level: number;
    text?: string;
    anchor: HTMLButtonElement;
  } | null>(null);
  const selected = appreciationForScore(markers, score);
  const retain = () => {
    if (dismissal.current) clearTimeout(dismissal.current);
  };
  const leave = (anchor?: HTMLButtonElement) => {
    if (anchor && document.activeElement === anchor) return;
    dismissal.current = setTimeout(() => {
      setActive((current) =>
        !anchor || current?.anchor === anchor ? null : current,
      );
    }, 120);
  };
  useEffect(
    () => () => {
      if (dismissal.current) clearTimeout(dismissal.current);
    },
    [],
  );

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
    const dismiss = (event: Event) => {
      if (event.target instanceof Node && element.contains(event.target))
        return;
      if (document.activeElement === active.anchor) position();
      else setActive(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setActive(null);
    };
    document.addEventListener("keydown", escape, true);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      element.hidePopover?.();
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      document.removeEventListener("keydown", escape, true);
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
          const marker = appreciationForScore(markers, level);
          return (
            <button
              key={level}
              type="button"
              className="secondary"
              aria-pressed={score === level}
              aria-disabled={disabled}
              data-readonly={disabled}
              aria-label={
                level + " sur 10" + (marker ? " : " + marker.text : "")
              }
              aria-describedby={active?.level === level ? id : undefined}
              onMouseEnter={(event) => {
                retain();
                setActive({
                  level,
                  text: marker?.text,
                  anchor: event.currentTarget,
                });
              }}
              onMouseLeave={(event) => leave(event.currentTarget)}
              onFocus={(event) =>
                setActive({
                  level,
                  text: marker?.text,
                  anchor: event.currentTarget,
                })
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
                setActive({
                  level,
                  text: marker?.text,
                  anchor: event.currentTarget,
                });
                if (!disabled) onSelect(level);
              }}
            >
              <span className="marker-dot" aria-hidden="true" />
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
          onMouseEnter={retain}
          onMouseLeave={() => leave()}
        >
          <strong>{active.level} / 10</strong>
          {active.text && <> · {active.text}</>}
        </div>
      )}
      <div className="appreciation-description">
        {selected && (
          <p className="selected-appreciation" aria-live="polite" tabIndex={0}>
            <strong>Repère pour {score} / 10 :</strong> {selected.text}
          </p>
        )}
      </div>
    </>
  );
}
