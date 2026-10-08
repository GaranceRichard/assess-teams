import { criteria, initialRuns, user } from "./fixtures";
import type { AppreciationMarker, Question } from "../evaluations";

export const state = {
  runs: initialRuns(),
  questions: structuredClone(criteria),
  palette: user.interface_palette,
};
export function resetDemo() {
  state.runs = initialRuns();
  state.questions = structuredClone(criteria);
  state.palette = user.interface_palette;
}
export const copy = <T>(value: T): T => structuredClone(value);
export function saveQuestion(question: Question | null, name: string) {
  if (!name.trim() || name.length > 255)
    throw new Error("Nom requis, 255 caractères maximum.");
  if (question) {
    const target = state.questions.find((q) => q.id === question.id);
    if (!target) throw new Error("Question inconnue.");
    target.name = name.trim();
  } else {
    state.questions.push({
      id: Math.max(0, ...state.questions.map((q) => q.id)) + 1,
      index: state.questions.length + 1,
      name: name.trim(),
    });
  }
}
export function deleteQuestion(id: number) {
  if (!state.questions.some((q) => q.id === id))
    throw new Error("Question inconnue.");
  state.questions = state.questions
    .filter((q) => q.id !== id)
    .map((q, i) => ({ ...q, index: i + 1 }));
}
export function moveQuestion(id: number, direction: number) {
  const index = state.questions.findIndex((q) => q.id === id);
  const target = index + direction;
  if (
    index < 0 ||
    target < 0 ||
    target >= state.questions.length ||
    Math.abs(direction) !== 1
  )
    throw new Error("Déplacement impossible.");
  [state.questions[index], state.questions[target]] = [
    state.questions[target],
    state.questions[index],
  ];
  state.questions = state.questions.map((q, i) => ({ ...q, index: i + 1 }));
}

export function saveMarkers(id: number, markers: AppreciationMarker[]) {
  const question = state.questions.find((q) => q.id === id);
  if (
    !question ||
    new Set(markers.map((m) => m.score)).size !== markers.length ||
    markers.some(
      (m) =>
        !Number.isInteger(m.score) ||
        m.score < 0 ||
        m.score > 10 ||
        !m.text.trim(),
    )
  )
    throw new Error("Repères invalides.");
  question.appreciation_markers = copy(markers);
}
