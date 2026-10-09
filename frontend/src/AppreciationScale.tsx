import type { AppreciationMarker } from "./evaluations";
import { appreciationForScore } from "./appreciationForScore";
import "./appreciation-markers.css";

type Props = {
  markers: AppreciationMarker[];
  score: number | null;
};

export function AppreciationScale({ markers, score }: Props) {
  const selected = appreciationForScore(markers, score);
  return (
    <>
      <div className="appreciation-scale" aria-hidden="true">
        {markers
          .filter((marker) => marker.text.trim())
          .map((marker) => (
            <span
              key={marker.score}
              className="marker-dot"
              data-score={marker.score}
              style={{ left: `${marker.score * 10}%` }}
            />
          ))}
      </div>
      {selected && (
        <p className="selected-appreciation" aria-live="polite">
          <strong>Repère pour {score} / 10 :</strong> {selected.text}
        </p>
      )}
    </>
  );
}
