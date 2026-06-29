// The Range & Warm-ups section: range test + the extension drills, tailored to
// the singer's measured range (falls back to the default until they test).

import { useState } from "react";
import { midiToNoteName } from "../engine/music";
import { DEFAULT_RANGE } from "../engine/exercises";
import {
  creepingScale,
  edgeStretch,
  spanSemitones,
  type VocalRange,
} from "../engine/range";
import { getStoredRange } from "../store/progress";
import { RangeTest } from "./RangeTest";
import { ExtensionDrill } from "./RangeDrills";
import { SirenDrill } from "./SirenDrill";
import { SovtWarmup } from "./SovtWarmup";
import { GoldenSpot } from "./GoldenSpot";

type Screen =
  | "menu"
  | "test"
  | "creep"
  | "edge-high"
  | "edge-low"
  | "siren"
  | "sovt"
  | "golden";

export function RangeHome({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("menu");
  const range: VocalRange = getStoredRange() ?? DEFAULT_RANGE;

  const back = () => setScreen("menu");

  if (screen === "test") return <RangeTest onExit={back} />;
  if (screen === "siren") return <SirenDrill range={range} onExit={back} />;
  if (screen === "sovt") return <SovtWarmup onExit={back} />;
  if (screen === "golden") return <GoldenSpot onExit={back} />;
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
        title="⬆ Edge stretch (top)"
        type="edge-stretch"
        color="#f59e0b"
        sequence={edgeStretch(range, "high", 3)}
        onExit={back}
      />
    );
  }
  if (screen === "edge-low") {
    return (
      <ExtensionDrill
        title="⬇ Edge stretch (bottom)"
        type="edge-stretch"
        color="#f59e0b"
        sequence={edgeStretch(range, "low", 3)}
        onExit={back}
      />
    );
  }

  const stored = getStoredRange();
  return (
    <div className="home">
      <p className="home__lead">Range &amp; Warm-ups</p>
      <p className="hint">
        {stored
          ? `Your range: ${midiToNoteName(stored.low)}–${midiToNoteName(stored.high)}`
          : "No range test yet — drills use a default range until you test."}
      </p>
      <div className="modes modes--grid">
        <DrillCard
          icon="🎚"
          title="Range Test"
          desc="Measure your low & high. Sets your personal range."
          onClick={() => setScreen("test")}
        />
        <DrillCard
          icon="🫧"
          title="SOVT Warm-up"
          desc="Lip-trills & straw phonation. Do this first."
          onClick={() => setScreen("sovt")}
        />
        <DrillCard
          icon="✨"
          title="Golden Spot"
          desc="Find your passaggio sweet spot — loud for little effort."
          onClick={() => setScreen("golden")}
        />
        <DrillCard
          icon="🌊"
          title="Siren Glides"
          desc="Smooth slides through your range — the safe extender."
          onClick={() => setScreen("siren")}
        />
        <DrillCard
          icon="🪜"
          title="Creeping Scale"
          desc="Laddering scales that nudge your range outward."
          onClick={() => setScreen("creep")}
        />
        <DrillCard
          icon="⬆"
          title="Stretch Top"
          desc="Gently push your ceiling, note by note."
          onClick={() => setScreen("edge-high")}
        />
        <DrillCard
          icon="⬇"
          title="Stretch Bottom"
          desc="Gently push your floor, note by note."
          onClick={() => setScreen("edge-low")}
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

function DrillCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button className="mode-card" onClick={onClick}>
      <div className="mode-card__icon">{icon}</div>
      <div className="mode-card__title">{title}</div>
      <div className="mode-card__desc">{desc}</div>
    </button>
  );
}
