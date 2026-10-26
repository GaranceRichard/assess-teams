import { useRef } from "react";
import { AppreciationScale } from "./AppreciationScale";
import { appreciationForScore } from "./appreciationForScore";
import type { RunQuestion } from "./evaluationRuns";

type Props = {
  question: RunQuestion;
  disabled: boolean;
  onSelect: (score: number) => void;
};

export function EvaluationScoreInput({ question, disabled, onSelect }: Props) {
  const pointerStarted = useRef(false);
  const range = useRef<HTMLInputElement>(null);
  const { score, appreciation_markers: markers = [] } = question;
  const appreciation = appreciationForScore(markers, score)?.text;
  // A native range needs a numeric position; it is not an answer until selected.
  const position = score ?? 5;
  return (
    <>
      <div className="taking-score-caption">
        <label className="taking-label" htmlFor="evaluation-score">
          Note de la question
        </label>
        <span className="taking-scale" id="score-scale">
          Échelle entière de 0 à 10
        </span>
      </div>
      <div
        className="taking-score-values"
        role="group"
        aria-label="Notes de 0 à 10"
      >
        {Array.from({ length: 11 }, (_, value) => (
          <button
            key={value}
            type="button"
            className="taking-score-value"
            style={{ left: `${value * 10}%` }}
            aria-label={`Choisir la note ${value} sur 10`}
            aria-pressed={score === value}
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              onSelect(value);
              range.current?.focus();
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <input
        ref={range}
        className="taking-range"
        id="evaluation-score"
        type="range"
        min={0}
        max={10}
        step={1}
        value={position}
        data-unanswered={score === null}
        disabled={disabled}
        aria-describedby="question-text score-scale score-status"
        aria-valuetext={
          score === null
            ? "Aucune note sélectionnée"
            : `${score} sur 10${appreciation ? " : " + appreciation : ""}`
        }
        onChange={(event) => onSelect(Number(event.target.value))}
        onPointerDown={(event) => {
          pointerStarted.current = !disabled && event.button === 0;
        }}
        onPointerCancel={() => {
          pointerStarted.current = false;
        }}
        onPointerUp={(event) => {
          // Clicking the midpoint produces no native change event on a new range.
          if (pointerStarted.current && !disabled && score === null)
            onSelect(Number(event.currentTarget.value));
          pointerStarted.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            return;
          }
          if (disabled || score !== null) return;
          const initialScores: Record<string, number> = {
            Home: 0,
            End: 10,
            ArrowLeft: 4,
            ArrowDown: 4,
            ArrowRight: 6,
            ArrowUp: 6,
            PageDown: 4,
            PageUp: 6,
          };
          const selected = initialScores[event.key];
          if (selected === undefined) return;
          event.preventDefault();
          onSelect(selected);
        }}
      />
      <AppreciationScale markers={markers} score={score} />
      <output
        className="taking-output"
        htmlFor="evaluation-score"
        aria-live="polite"
      >
        {score === null
          ? "Aucune note sélectionnée"
          : `Note sélectionnée : ${score} / 10`}
      </output>
    </>
  );
}
