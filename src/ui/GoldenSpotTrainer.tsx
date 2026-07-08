// Golden Spot drills: sweep through your passaggio (below → above → back),
// centred on your saved golden spot. Glide (siren) and stepped versions, each
// on an open "Ah" or the crying "Mew". Reuses the siren + highway visuals.

import { useState } from "react";
import { midiToNoteName } from "../engine/music";
import { sweepSong } from "../engine/goldenspot";
import { getGoldenSpot } from "../store/progress";
import { SongHighway } from "./SongHighway";
import { SirenDrill } from "./SirenDrill";
import { ScreenTop } from "./BackButton";

type Mode = "menu" | "glide" | "step-ah" | "step-mew";

const SPANS = [
  { label: "±4", value: 4 },
  { label: "±7", value: 7 },
  { label: "±12", value: 12 },
];

export function GoldenSpotTrainer({ onExit }: { onExit: () => void }) {
  const spot = getGoldenSpot();
  const [span, setSpan] = useState(7);
  const [mode, setMode] = useState<Mode>("menu");

  if (!spot) {
    return (
      <div className="start">
        <ScreenTop onBack={onExit} title="Golden Spot Drills" />
        <h2>✨ Golden Spot Drills</h2>
        <p>
          First find your spot in <strong>Daily Drills → Find Golden Spot</strong>.
          Then come back here to drill it.
        </p>
      </div>
    );
  }

  const center = spot.spot;
  const range = {
    low: Math.max(36, center - span),
    high: Math.min(84, center + span),
  };
  const back = () => setMode("menu");

  if (mode === "glide") return <SirenDrill range={range} onExit={back} />;
  if (mode === "step-ah")
    return <SongHighway song={sweepSong(center, span, "Ah")} onExit={back} />;
  if (mode === "step-mew")
    return <SongHighway song={sweepSong(center, span, "Mew")} onExit={back} />;

  return (
    <div className="home">
      <ScreenTop onBack={onExit} title="Golden Spot Drills" />
      <p className="home__lead">Golden Spot Drills</p>
      <p className="hint">
        Spot <strong>{midiToNoteName(center)}</strong> · sweeping{" "}
        {midiToNoteName(range.low)}–{midiToNoteName(range.high)}. Keep it soft and
        even; let the vowel relax toward “aw/oo” up top.
      </p>

      <div className="span-row">
        <span className="span-row__label">Span</span>
        {SPANS.map((s) => (
          <button
            key={s.value}
            className={`btn${span === s.value ? " btn--primary" : ""}`}
            onClick={() => setSpan(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="modes modes--grid">
        <button className="mode-card" onClick={() => setMode("glide")}>
          <div className="mode-card__icon">🌊</div>
          <div className="mode-card__title">Glide through</div>
          <div className="mode-card__desc">
            Siren up &amp; back through the spot on a vowel.
          </div>
        </button>
        <button className="mode-card" onClick={() => setMode("step-ah")}>
          <div className="mode-card__icon">🪜</div>
          <div className="mode-card__title">Step sweep · Ah</div>
          <div className="mode-card__desc">
            Note-by-note up &amp; back, open “Ah”.
          </div>
        </button>
        <button className="mode-card" onClick={() => setMode("step-mew")}>
          <div className="mode-card__icon">😺</div>
          <div className="mode-card__title">Step sweep · Mew</div>
          <div className="mode-card__desc">
            Same sweep on the crying “Mew” — keep the buzz.
          </div>
        </button>
      </div>

      <p className="hint">🎧 Headphones recommended. Don’t push through the break.</p>
    </div>
  );
}
