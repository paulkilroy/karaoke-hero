// Mode picker: solo practice or a versus sing-off.

export type Mode = "practice" | "versus";

export function Home({ onPick }: { onPick: (mode: Mode) => void }) {
  return (
    <div className="home">
      <p className="home__lead">Pick a mode</p>
      <div className="modes">
        <button className="mode-card" onClick={() => onPick("practice")}>
          <div className="mode-card__icon">🎯</div>
          <div className="mode-card__title">Practice</div>
          <div className="mode-card__desc">
            Solo pitch-match drill. Build accuracy, streaks &amp; XP.
          </div>
        </button>
        <button className="mode-card" onClick={() => onPick("versus")}>
          <div className="mode-card__icon">⚔️</div>
          <div className="mode-card__title">Sing-Off</div>
          <div className="mode-card__desc">
            Two singers, one mic, same notes — highest score wins.
          </div>
        </button>
      </div>
    </div>
  );
}
