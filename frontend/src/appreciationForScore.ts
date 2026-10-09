import type { AppreciationMarker } from "./evaluations";

export function appreciationForScore(
  markers: AppreciationMarker[],
  score: number | null,
): AppreciationMarker | undefined {
  if (score === null) return undefined;
  let closest: AppreciationMarker | undefined;
  for (const marker of markers) {
    if (
      marker.text.trim() &&
      marker.score <= score &&
      (!closest || marker.score > closest.score)
    ) {
      closest = marker;
    }
  }
  return closest;
}
