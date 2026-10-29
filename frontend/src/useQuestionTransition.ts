import { useLayoutEffect, useRef } from "react";

// Focus follows the committed question; TransitionSurface owns the visual lifetime.
export function useQuestionTransition(questionId: number | undefined) {
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const previous = useRef(questionId);
  useLayoutEffect(() => {
    if (previous.current !== questionId) questionTitle.current?.focus();
    previous.current = questionId;
  }, [questionId]);
  return { questionTitle };
}
