// Sing-Off entry: choose same-device (hot-seat) or online (play a friend).

import { useState } from "react";
import { LocalSingOff } from "./LocalSingOff";
import { OnlineSingOff } from "./OnlineSingOff";

type Choice = "choose" | "local" | "online";

export function VersusGame({ onExit }: { onExit: () => void }) {
  const [choice, setChoice] = useState<Choice>("choose");

  if (choice === "local") return <LocalSingOff onExit={() => setChoice("choose")} />;
  if (choice === "online")
    return <OnlineSingOff onExit={() => setChoice("choose")} />;

  return (
    <div className="home">
      <p className="home__lead">Sing-Off</p>
      <div className="modes">
        <button className="mode-card" onClick={() => setChoice("local")}>
          <div className="mode-card__icon">🎤</div>
          <div className="mode-card__title">Same device</div>
          <div className="mode-card__desc">
            Two singers share one mic and take turns.
          </div>
        </button>
        <button className="mode-card" onClick={() => setChoice("online")}>
          <div className="mode-card__icon">🌐</div>
          <div className="mode-card__title">Online</div>
          <div className="mode-card__desc">
            Play a friend on another device via a room code.
          </div>
        </button>
      </div>
      <div className="controls">
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}
