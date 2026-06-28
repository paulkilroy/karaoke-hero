// Mode picker.

export type Mode = "practice" | "songs" | "range" | "progress" | "versus";

export function Home({ onPick }: { onPick: (mode: Mode) => void }) {
  return (
    <div className="home">
      <p className="home__lead">Pick a mode</p>
      <div className="modes modes--grid">
        <button className="mode-card" onClick={() => onPick("songs")}>
          <div className="mode-card__icon">🎵</div>
          <div className="mode-card__title">Songs</div>
          <div className="mode-card__desc">
            Sing along, Guitar-Hero style. Scored with stars.
          </div>
        </button>
        <button className="mode-card" onClick={() => onPick("practice")}>
          <div className="mode-card__icon">🎯</div>
          <div className="mode-card__title">Practice</div>
          <div className="mode-card__desc">
            Solo pitch-match drill, tuned to your range.
          </div>
        </button>
        <button className="mode-card" onClick={() => onPick("range")}>
          <div className="mode-card__icon">🎚</div>
          <div className="mode-card__title">Range &amp; Warm-ups</div>
          <div className="mode-card__desc">
            Test your range, then drills to extend it.
          </div>
        </button>
        <button className="mode-card" onClick={() => onPick("progress")}>
          <div className="mode-card__icon">📈</div>
          <div className="mode-card__title">Progress</div>
          <div className="mode-card__desc">
            Your level, range growth &amp; accuracy over time.
          </div>
        </button>
        <button className="mode-card" onClick={() => onPick("versus")}>
          <div className="mode-card__icon">⚔️</div>
          <div className="mode-card__title">Sing-Off</div>
          <div className="mode-card__desc">
            Battle a friend — same device or online.
          </div>
        </button>
      </div>
    </div>
  );
}
