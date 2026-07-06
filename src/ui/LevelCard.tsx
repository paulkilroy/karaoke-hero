// Home level summary — the proficiency card, moved up from the Progress page.
// Shows a mini level ring; clicking opens the full Progress detail.

import { loadProgress, summarize } from "../store/progress";
import { levelProgress } from "../engine/level";
import { ProgressRing } from "./charts";

export function LevelCard({ onOpen }: { onOpen: () => void }) {
  const stats = summarize(loadProgress());
  const lp = levelProgress({
    rangeSemitones: stats.rangeSemitones,
    accuracy: stats.bestAccuracy,
  });

  const sub = lp.next
    ? `${Math.round(lp.fraction * 100)}% to ${lp.next.name}`
    : "Top band reached 🏆";

  return (
    <button className="journey-card journey-card--level" onClick={onOpen}>
      <div className="journey-card__ring">
        <ProgressRing
          fraction={lp.fraction}
          top={lp.current.cefr}
          bottom={lp.next ? `${Math.round(lp.fraction * 100)}%` : "MAX"}
        />
      </div>
      <span className="journey-card__body">
        <span className="journey-card__eyebrow">Your level</span>
        <span className="journey-card__title">{lp.current.name}</span>
        <span className="journey-card__desc">{sub}</span>
      </span>
      <span className="journey-card__chev">›</span>
    </button>
  );
}
