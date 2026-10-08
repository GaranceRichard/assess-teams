import { updateQuestion, type Question } from "./evaluations";
import type { ScoreGuide } from "./scoreGuides";
import type { Dispatch, SetStateAction } from "react";

export function saveQuestionGuides(
  setQuestions: Dispatch<SetStateAction<Question[]>>,
) {
  return async (question: Question, guides: ScoreGuide[]) => {
    const saved = await updateQuestion(question.id, {
      name: question.name,
      score_guides: guides,
    });
    setQuestions((current) =>
      current.map((item) => (item.id === saved.id ? saved : item)),
    );
  };
}
