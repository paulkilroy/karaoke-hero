import { useState } from "react";
import { Home, type Mode } from "./ui/Home";
import { PitchMatchGame } from "./ui/PitchMatchGame";
import { VersusGame } from "./ui/VersusGame";

type Screen = "home" | Mode;

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
        <span className="app__tag">
          {screen === "home"
            ? "Phase 1"
            : screen === "practice"
              ? "Practice"
              : "Sing-Off"}
        </span>
      </header>

      <main className="app__main">
        {screen === "home" && <Home onPick={setScreen} />}
        {screen === "practice" && <PitchMatchGame />}
        {screen === "versus" && <VersusGame onExit={() => setScreen("home")} />}
      </main>

      <footer className="app__footer">
        Sing better, song by song. · Roadmap: warm-ups → song mode (MIDI) →
        range &amp; progress → harmony → online sing-off → import your own tracks
      </footer>
    </div>
  );
}
