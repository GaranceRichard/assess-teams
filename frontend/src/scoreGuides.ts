export type ScoreGuide = { score: number; text: string };

export function validScoreGuides(guides: ScoreGuide[]): boolean {
  return (
    guides.every(
      (guide) =>
        Number.isInteger(guide.score) &&
        guide.score >= 0 &&
        guide.score <= 10 &&
        guide.text.trim().length > 0,
    ) && new Set(guides.map((guide) => guide.score)).size === guides.length
  );
}
