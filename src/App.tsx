import { useState } from "react";
import { Home, type Mode } from "./ui/Home";
import { PitchMatchGame } from "./ui/PitchMatchGame";
import { SongMode } from "./ui/SongMode";
import { RangeHome } from "./ui/RangeHome";
import { ProgressScreen } from "./ui/ProgressScreen";
import { VersusGame } from "./ui/VersusGame";
import { activityTimestamps, loadProgress } from "./store/progress";
import { computeStreak } from "./engine/streak";

type Screen = "home" | Mode;

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  // recomputed on every navigation, so returning home reflects new sessions
  const streak = computeStreak(activityTimestamps(loadProgress()), Date.now());

  return (
    <div className="app">
      <header className="app__header">
        <div
          className="brand"
          onClick={() => setScreen("home")}
          role="button"
          tabIndex={0}
        >
          <span className="brand__logo">🎤</span>
          <span className="brand__name">Karaoke Hero</span>
        </div>
        <button
          className={`streak-chip${streak.current === 0 ? " streak-chip--cold" : ""}`}
          onClick={() => setScreen("progress")}
          title="Your streak & progress"
        >
          <span>{streak.current > 0 ? "🔥" : "✨"}</span>
          {streak.current}
        </button>
      </header>

      <main className="app__main">
        {screen === "home" && <Home onPick={setScreen} streak={streak} />}
        {screen === "practice" && <PitchMatchGame />}
        {screen === "songs" && <SongMode onExit={() => setScreen("home")} />}
        {screen === "range" && <RangeHome onExit={() => setScreen("home")} />}
        {screen === "progress" && (
          <ProgressScreen onExit={() => setScreen("home")} />
        )}
        {screen === "versus" && <VersusGame onExit={() => setScreen("home")} />}
      </main>
    </div>
  );
}
