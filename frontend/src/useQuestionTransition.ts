import { useLayoutEffect, useRef } from "react";

// Only a committed question change starts motion; saving/error renders do not.
export function useQuestionTransition(
  position: number,
  questionId: number | undefined,
) {
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const questionContent = useRef<HTMLDivElement>(null);
  const previous = useRef({ position, questionId });

  useLayoutEffect(() => {
    if (previous.current.questionId !== questionId) {
      if (questionContent.current) {
        questionContent.current.dataset.direction =
          position < previous.current.position ? "previous" : "next";
      }
      questionTitle.current?.focus();
    }
    previous.current = { position, questionId };
  }, [position, questionId]);

  return { questionTitle, questionContent };
}
