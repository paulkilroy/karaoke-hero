// Daily Drills bucket — pitch accuracy + range training + passaggio work.

import { useState } from "react";
import { DEFAULT_RANGE } from "../engine/exercises";
import {
  creepingScale,
  edgeStretch,
  spanSemitones,
  type VocalRange,
} from "../engine/range";
import { getStoredRange } from "../store/progress";
import { PitchMatchGame } from "./PitchMatchGame";
import { RangeTest } from "./RangeTest";
import { ExtensionDrill } from "./RangeDrills";
import { GoldenSpot } from "./GoldenSpot";
import { GoldenSpotTrainer } from "./GoldenSpotTrainer";
import { DrillCard } from "./DrillCard";

type Screen =
  | "menu"
  | "pitch"
  | "test"
  | "creep"
  | "edge-high"
  | "edge-low"
  | "golden"
  | "golden-train";

export function Practice({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("menu");
  const range: VocalRange = getStoredRange() ?? DEFAULT_RANGE;
  const back = () => setScreen("menu");

  if (screen === "pitch") return <PitchMatchGame onExit={back} />;
  if (screen === "test") return <RangeTest onExit={back} />;
  if (screen === "golden") return <GoldenSpot onExit={back} />;
  if (screen === "golden-train") return <GoldenSpotTrainer onExit={back} />;
  if (screen === "creep") {
    const steps = Math.max(5, Math.min(10, spanSemitones(range) - 7));
    return (
      <ExtensionDrill
        title="🪜 Creeping scale"
        type="creeping-scale"
        color="#8b5cf6"
        sequence={creepingScale([0, 2, 4, 5, 7], range.low, steps, 1)}
        onExit={back}
      />
    );
  }
  if (screen === "edge-high") {
    return (
      <ExtensionDrill
        title="⬆ Stretch top"
        type="edge-stretch"
        color="#fbbf24"
        sequence={edgeStretch(range, "high", 3)}
        onExit={back}
      />
    );
  }
  if (screen === "edge-low") {
    return (
      <ExtensionDrill
        title="⬇ Stretch bottom"
        type="edge-stretch"
        color="#fbbf24"
        sequence={edgeStretch(range, "low", 3)}
        onExit={back}
      />
    );
  }

  return (
    <div className="home">
      <p className="home__lead">Daily Drills</p>
      <p className="hint">Build pitch accuracy and extend your range.</p>
      <div className="modes modes--grid">
        <DrillCard
          icon="🎯"
          tint="#38bdf8"
          title="Pitch Match"
          desc="Hit & hold notes in tune. Core accuracy."
          onClick={() => setScreen("pitch")}
        />
        <DrillCard
          icon="🎚"
          tint="#a78bfa"
          title="Range Test"
          desc="Measure your low & high; sets your range."
          onClick={() => setScreen("test")}
        />
        <DrillCard
          icon="🪜"
          tint="#8b5cf6"
          title="Creeping Scale"
          desc="Laddering scales that nudge your range."
          onClick={() => setScreen("creep")}
        />
        <DrillCard
          icon="⬆"
          tint="#fbbf24"
          title="Stretch Top"
          desc="Gently push your ceiling, note by note."
          onClick={() => setScreen("edge-high")}
        />
        <DrillCard
          icon="⬇"
          tint="#f59e0b"
          title="Stretch Bottom"
          desc="Gently push your floor, note by note."
          onClick={() => setScreen("edge-low")}
        />
        <DrillCard
          icon="✨"
          tint="#f472b6"
          title="Find Golden Spot"
          desc="Locate your passaggio sweet spot."
          onClick={() => setScreen("golden")}
        />
        <DrillCard
          icon="😺"
          tint="#fb7185"
          title="Golden Spot Drills"
          desc="Sweep the spot on Ah & crying Mew."
          onClick={() => setScreen("golden-train")}
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
