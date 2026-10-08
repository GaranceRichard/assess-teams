import { useCallback, useState } from "react";
import type { RunQuestion } from "./evaluationRuns";
import { ScoreGuideLevel } from "./ScoreGuideLevel";
import "./score-guides.css";

type Props = {
  question: RunQuestion;
  readonly: boolean;
  disabled: boolean;
  onSelect: (score: number) => void;
};

export function EvaluationScoreScale({
  question,
  readonly,
  disabled,
  onSelect,
}: Props) {
  const [openScore, setOpenScore] = useState<number | null>(null);
  const setOpen = useCallback((score: number, open: boolean) => {
    setOpenScore((current) =>
      open ? score : current === score ? null : current,
    );
  }, []);
  const guides = question.score_guides ?? [];
  const selectedGuide = guides.find((guide) => guide.score === question.score);
  const displayedGuide = guides.find(
    (guide) => guide.score === (question.score ?? 5),
  );
  return (
    <div
      className="evaluation-score-scale"
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          guides.some((guide) => guide.score === openScore)
        ) {
          event.preventDefault();
          event.stopPropagation();
          setOpenScore(null);
        }
      }}
    >
      <label htmlFor="evaluation-score">Note de la question</label>
      <div
        className="score-levels"
        role="group"
        aria-label="Niveaux de notation"
      >
        {Array.from({ length: 11 }, (_, score) => (
          <ScoreGuideLevel
            key={score}
            score={score}
            guide={guides.find((guide) => guide.score === score)}
            selected={question.score === score}
            disabled={disabled}
            open={openScore === score}
            setOpen={setOpen}
            onSelect={readonly ? undefined : onSelect}
          />
        ))}
      </div>
      <input
        id="evaluation-score"
        type="range"
        min={0}
        max={10}
        step={1}
        value={question.score ?? 5}
        disabled={readonly || disabled}
        aria-describedby={`question-text score-status${selectedGuide ? " selected-score-guide" : ""}`}
        aria-valuetext={`${question.score ?? 5} sur 10${displayedGuide ? ` : ${displayedGuide.text}` : ""}`}
        onChange={(event) => onSelect(Number(event.target.value))}
      />
      <output htmlFor="evaluation-score" aria-live="polite">
        Note sélectionnée : {question.score ?? 5} / 10
      </output>
      <div aria-live="polite" className="selected-score-guide">
        {selectedGuide && <p id="selected-score-guide">{selectedGuide.text}</p>}
      </div>
    </div>
  );
}
