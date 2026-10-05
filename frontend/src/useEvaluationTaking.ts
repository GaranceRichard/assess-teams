import { useRef, useState } from "react";

import {
  type EvaluationRun,
  finalizeEvaluationRun,
  reviseEvaluationRun,
  saveEvaluationScore,
} from "./evaluationRuns";

export function useEvaluationTaking(
  run: EvaluationRun,
  revision: boolean,
  onClose: (run: EvaluationRun) => void,
) {
  const [current, setCurrent] = useState(run);
  const [position, setPosition] = useState(() => {
    const unanswered = run.questions.findIndex(
      (question) => question.score === null,
    );
    return unanswered < 0 ? 0 : unanswered;
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saves = useRef(Promise.resolve(true));
  const sequence = useRef(0);
  const question = current.questions[position];
  const readonly = current.state === "completed" && !revision;
  const complete =
    current.questions.length > 0 &&
    current.questions.every(
      ({ score }) =>
        score !== null && Number.isInteger(score) && score >= 0 && score <= 10,
    );

  async function selectScore(score: number): Promise<boolean> {
    const updated = {
      ...current,
      questions: current.questions.map((item, index) =>
        index === position ? { ...item, score } : item,
      ),
    };
    setCurrent(updated);
    setError(null);
    if (revision) return true;
    const requestNumber = ++sequence.current;
    setSaving(true);
    setUnsaved(true);
    const pending = saves.current.then(async () => {
      try {
        await saveEvaluationScore(current.id, question.question_id, score);
        if (requestNumber === sequence.current) setUnsaved(false);
        return true;
      } catch {
        if (requestNumber === sequence.current) {
          setError(
            "La note n’a pas été enregistrée. Réessayez avant de continuer.",
          );
        }
        return false;
      } finally {
        if (requestNumber === sequence.current) setSaving(false);
      }
    });
    saves.current = pending;
    return pending;
  }

  async function next() {
    if (!readonly && (question.score === null || unsaved)) {
      if (!(await selectScore(question.score ?? 5))) return;
    }
    setPosition(position + 1);
  }

  async function submit() {
    setSubmitting(true);
    setSaving(true);
    setError(null);
    try {
      const saved = revision
        ? await reviseEvaluationRun(current.id, current.questions)
        : await finalizeEvaluationRun(current.id);
      onClose(saved);
    } catch {
      setError(
        "La validation a été refusée. Vos notes restent disponibles ; réessayez.",
      );
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  return {
    current,
    position,
    setPosition,
    saving,
    submitting,
    unsaved,
    error,
    question,
    readonly,
    complete,
    selectScore,
    next,
    submit,
  };
}
