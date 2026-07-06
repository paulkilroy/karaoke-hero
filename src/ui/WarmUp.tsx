// Warm Up bucket — do these first to gently ready the voice.

import { useState } from "react";
import { DEFAULT_RANGE } from "../engine/exercises";
import { getStoredRange } from "../store/progress";
import { SovtWarmup } from "./SovtWarmup";
import { SirenDrill } from "./SirenDrill";
import { DrillCard } from "./DrillCard";

type Screen = "menu" | "sovt" | "siren";

export function WarmUp({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("menu");
  const range = getStoredRange() ?? DEFAULT_RANGE;
  const back = () => setScreen("menu");

  if (screen === "sovt") return <SovtWarmup onExit={back} />;
  if (screen === "siren") return <SirenDrill range={range} onExit={back} />;

  return (
    <div className="home">
      <p className="home__lead">Warm Up</p>
      <p className="hint">Ease in — gently wake the voice before you drill or sing.</p>
      <div className="modes modes--grid">
        <DrillCard
          icon="🫧"
          tint="#38bdf8"
          title="SOVT Warm-up"
          desc="Lip-trills & straw phonation. Start here."
          onClick={() => setScreen("sovt")}
        />
        <DrillCard
          icon="🌊"
          tint="#22d3ee"
          title="Siren Glides"
          desc="Smooth slides through your whole range."
          onClick={() => setScreen("siren")}
        />
      </div>
      <div className="controls">
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}
