import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { ScoreGuide } from "./scoreGuides";

type Props = {
  score: number;
  guide?: ScoreGuide;
  selected: boolean;
  disabled: boolean;
  open: boolean;
  setOpen: (score: number, open: boolean) => void;
  onSelect?: (score: number) => void;
};

export function ScoreGuideLevel({
  score,
  guide,
  selected,
  disabled,
  open,
  setOpen,
  onSelect,
}: Props) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const dismissal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (dismissal.current) clearTimeout(dismissal.current);
    setOpen(score, true);
  };
  const hide = () => {
    if (document.activeElement === anchor.current) return;
    dismissal.current = setTimeout(() => setOpen(score, false), 120);
  };
  useEffect(
    () => () => {
      if (dismissal.current) clearTimeout(dismissal.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (!open || !guide) return;
    const element = tooltip.current!;
    const rect = anchor.current!.getBoundingClientRect();
    element.style.maxHeight = `${Math.max(24, rect.top - 18)}px`;
    element.showPopover?.();
    const bounds = element.getBoundingClientRect();
    element.style.left = `${Math.max(
      8,
      Math.min(
        rect.left + rect.width / 2 - bounds.width / 2,
        window.innerWidth - bounds.width - 8,
      ),
    )}px`;
    element.style.top = `${Math.max(8, rect.top - bounds.height - 10)}px`;
    const close = (event: Event) => {
      if (event.target instanceof Node && element.contains(event.target))
        return;
      setOpen(score, false);
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      element.hidePopover?.();
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, guide, score, selected, setOpen]);

  return (
    <>
      <button
        type="button"
        ref={anchor}
        disabled={disabled}
        className={`score-level secondary${guide ? " configured" : ""}`}
        aria-label={`${score} sur 10${guide ? ", repère disponible" : ""}`}
        aria-pressed={selected}
        aria-describedby={open && guide ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={() => setOpen(score, false)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open && guide) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(score, false);
          }
        }}
        onClick={() => {
          show();
          onSelect?.(score);
        }}
      >
        {score}
      </button>
      {open && guide && (
        <span
          ref={tooltip}
          id={id}
          onMouseEnter={show}
          onMouseLeave={hide}
          role="tooltip"
          popover="manual"
          className="score-guide-tooltip"
        >
          {guide.text}
        </span>
      )}
    </>
  );
}
