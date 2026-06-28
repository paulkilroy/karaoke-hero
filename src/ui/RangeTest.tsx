// Guided range-test screen. Descend to find the floor, ascend to find the
// ceiling, then show a result card (range, span, voice-type hint, tessitura).

import { useState } from "react";
import { midiToNoteName } from "../engine/music";
import {
  classifyVoice,
  spanOctaves,
  tessitura,
  type VocalRange,
} from "../engine/range";
import { useRangeTest } from "./useRangeTest";
import { PitchMeter } from "./PitchMeter";

export function RangeTest({ onExit }: { onExit: () => void }) {
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <div className="start">
        <h2>🎚 Range Test</h2>
        <p>
          <strong>Warm up first</strong> (hum or lip-trill for a minute) — a cold
          voice tests narrow. Then I’ll play a note; match it and hold it. I’ll
          step further out each time until you tap <em>“can’t reach”</em>.
        </p>
        <p className="hint">First we go down to your lowest, then up to your top.</p>
        <button className="btn btn--primary" onClick={() => setStarted(true)}>
          🎤 Start test
        </button>
        <div className="controls">
          <button className="btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }
  return <RunningTest onExit={onExit} />;
}

function RunningTest({ onExit }: { onExit: () => void }) {
  const t = useRangeTest();

  if (t.error) {
    return (
      <div className="start">
        <h2>Microphone unavailable</h2>
        <p className="error">{t.error}</p>
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  if (t.phase === "done" && t.low != null && t.high != null) {
    return <ResultCard range={{ low: t.low, high: t.high }} onExit={onExit} />;
  }

  const goingDown = t.phase === "down";
  const detected =
    t.cents != null && t.target != null
      ? midiToNoteName(Math.round(t.target + t.cents / 100))
      : "—";

  return (
    <div className="game">
      <div
        className="turn-banner"
        style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}
      >
        {goingDown ? "⬇ Find your lowest" : "⬆ Find your highest"}
      </div>

      <div className="versus">
        <div className="versus__side">
          <div className="versus__label">Match</div>
          <div className="versus__note versus__note--target">
            {t.target != null ? midiToNoteName(t.target) : "…"}
          </div>
        </div>
        <div className="versus__arrow">→</div>
        <div className="versus__side">
          <div className="versus__label">You</div>
          <div className="versus__note">{detected}</div>
        </div>
      </div>

      {!t.listening && <div className="hint">starting mic…</div>}

      <PitchMeter cents={t.cents} targetMidi={t.target} />

      <div className="hold">
        <div
          className="hold__bar"
          style={{ width: `${Math.round(t.holdProgress * 100)}%` }}
        />
        <span className="hold__text">
          {t.holdProgress > 0 ? "hold…" : "match the note"}
        </span>
      </div>

      <div className="controls">
        <button className="btn" onClick={t.replayTone}>
          🔁 Replay note
        </button>
        <button className="btn btn--primary" onClick={t.cantReach}>
          {goingDown ? "⬇ Can’t go lower" : "⬆ Can’t go higher"}
        </button>
      </div>
    </div>
  );
}

function ResultCard({
  range,
  onExit,
}: {
  range: VocalRange;
  onExit: () => void;
}) {
  const voice = classifyVoice(range);
  const tess = tessitura(range);
  const octaves = spanOctaves(range);

  return (
    <div className="results">
      <h2>🎉 Your range</h2>
      <div className="range-big">
        {midiToNoteName(range.low)} – {midiToNoteName(range.high)}
      </div>
      <div className="range-sub">
        {octaves.toFixed(1)} octaves
        {voice !== "Unknown" && (
          <>
            {" · "}
            <span className="range-voice">{voice}</span> (hint)
          </>
        )}
      </div>
      <p className="hint">
        Comfortable range (tessitura): {midiToNoteName(tess.low)} –{" "}
        {midiToNoteName(tess.high)}. Saved — Practice now uses your range, and
        Progress tracks it over time.
      </p>
      <div className="controls">
        <button className="btn btn--primary" onClick={onExit}>
          Done
        </button>
      </div>
    </div>
  );
}
