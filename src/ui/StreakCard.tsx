// Home streak hero: flame + current streak, a 7-day activity strip, and best.

import { type StreakInfo } from "../engine/streak";

const DAY = 86400000;
const WD = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakCard({ streak }: { streak: StreakInfo }) {
  const now = Date.now();
  const days = streak.last7.map((active, i) => {
    const d = new Date(now - (6 - i) * DAY);
    return { active, letter: WD[d.getDay()], today: i === 6 };
  });

  const nudge = streak.practicedToday
    ? "Nice — you sang today! 🎉"
    : streak.current > 0
      ? `Sing today to keep your ${streak.current}-day streak alive`
      : "Sing today to start a streak";

  return (
    <div className="streak">
      <div className="streak__flame">{streak.current > 0 ? "🔥" : "✨"}</div>
      <div className="streak__main">
        <div className="streak__count">
          {streak.current}
          <small> day{streak.current === 1 ? "" : "s"}</small>
        </div>
        <div className="streak__nudge">{nudge}</div>
        <div className="streak__week">
          {days.map((d, i) => (
            <div className="streak__day" key={i}>
              <span
                className={`streak__dot${d.active ? " streak__dot--on" : ""}${
                  d.today ? " streak__dot--today" : ""
                }`}
              />
              <span>{d.letter}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="streak__best">
        <span className="streak__best-num">{streak.longest}</span>
        <span className="streak__best-label">best</span>
      </div>
    </div>
  );
}
