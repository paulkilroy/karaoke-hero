import { useState } from "react";
import { Home, type NavTarget } from "./ui/Home";
import { WarmUp } from "./ui/WarmUp";
import { Practice } from "./ui/Practice";
import { Sing } from "./ui/Sing";
import { ProgressScreen } from "./ui/ProgressScreen";
import { activityTimestamps, loadProgress } from "./store/progress";
import { computeStreak } from "./engine/streak";

type Screen = "home" | NavTarget;

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
        {screen === "home" && <Home onNavigate={setScreen} streak={streak} />}
        {screen === "warmup" && <WarmUp onExit={() => setScreen("home")} />}
        {screen === "practice" && <Practice onExit={() => setScreen("home")} />}
        {screen === "sing" && <Sing onExit={() => setScreen("home")} />}
        {screen === "progress" && (
          <ProgressScreen onExit={() => setScreen("home")} />
        )}
      </main>
    </div>
  );
}
