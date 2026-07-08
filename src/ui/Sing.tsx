// Karaoke Hero bucket — sing songs (vs your own best) or a Sing-Off (vs others).

import { useState } from "react";
import { SongMode } from "./SongMode";
import { VersusGame } from "./VersusGame";
import { DrillCard } from "./DrillCard";
import { ScreenTop } from "./BackButton";

type Screen = "menu" | "songs" | "versus";

export function Sing({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("menu");
  const back = () => setScreen("menu");

  if (screen === "songs") return <SongMode onExit={back} />;
  if (screen === "versus") return <VersusGame onExit={back} />;

  return (
    <div className="home">
      <ScreenTop onBack={onExit} title="Karaoke Hero" />
      <p className="hint">Put it together — sing for real.</p>
      <div className="modes modes--grid">
        <DrillCard
          icon="🎵"
          tint="#a78bfa"
          title="Songs"
          desc="Sing along, Guitar-Hero style — beat your own best."
          onClick={() => setScreen("songs")}
        />
        <DrillCard
          icon="⚔️"
          tint="#fb7185"
          title="Sing-Off"
          desc="Battle a friend — same device or online."
          onClick={() => setScreen("versus")}
        />
      </div>
    </div>
  );
}
