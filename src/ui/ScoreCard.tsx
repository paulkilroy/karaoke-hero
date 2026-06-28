// Shared results card used by both local and online sing-offs.

export function ScoreCard({
  name,
  total,
  stars,
  color,
  win,
}: {
  name: string;
  total: number;
  stars: number;
  color: string;
  win: boolean;
}) {
  return (
    <div className={`scorecard${win ? " scorecard--win" : ""}`}>
      <div className="scorecard__name" style={{ color }}>
        {name}
      </div>
      <div className="scorecard__total">{total}</div>
      <div className="scorecard__stars">
        {"★".repeat(stars)}
        <span className="scorecard__stars-dim">{"★".repeat(3 - stars)}</span>
      </div>
    </div>
  );
}

export const P1_COLOR = "#8b5cf6";
export const P2_COLOR = "#f59e0b";
