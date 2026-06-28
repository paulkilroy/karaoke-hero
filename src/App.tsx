import { useState } from "react";
import { Home, type Mode } from "./ui/Home";
import { PitchMatchGame } from "./ui/PitchMatchGame";
import { RangeHome } from "./ui/RangeHome";
import { ProgressScreen } from "./ui/ProgressScreen";
import { VersusGame } from "./ui/VersusGame";

type Screen = "home" | Mode;

const TAGS: Record<Screen, string> = {
  home: "Karaoke Hero",
  practice: "Practice",
  range: "Range & Warm-ups",
  progress: "Progress",
  versus: "Sing-Off",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="app">
      <header className="app__header">
        <h1
          className="app__title"
          onClick={() => setScreen("home")}
          role="button"
          tabIndex={0}
        >
          🎤 Karaoke Hero
        </h1>
        <span className="app__tag">{TAGS[screen]}</span>
      </header>

      <main className="app__main">
        {screen === "home" && <Home onPick={setScreen} />}
        {screen === "practice" && <PitchMatchGame />}
        {screen === "range" && <RangeHome onExit={() => setScreen("home")} />}
        {screen === "progress" && (
          <ProgressScreen onExit={() => setScreen("home")} />
        )}
        {screen === "versus" && <VersusGame onExit={() => setScreen("home")} />}
      </main>

      <footer className="app__footer">
        Sing better, song by song. · Roadmap: warm-ups → song mode (MIDI) →
        harmony → import your own tracks
      </footer>
    </div>
  );
}
