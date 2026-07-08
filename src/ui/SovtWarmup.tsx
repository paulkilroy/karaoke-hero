// SOVT (semi-occluded vocal tract) warm-up — now a guided, timed sequence.
// Each step has a clear cue, a countdown, and the live note-ladder so you can
// see your pitch as you hum/trill. Evidence-based way to warm up safely.

import { useEffect, useRef, useState } from "react";
import { hzToMidi } from "../engine/music";
import { DEFAULT_RANGE } from "../engine/exercises";
import { getStoredRange, recordSession } from "../store/progress";
import { usePitch } from "./usePitch";
import { PitchMeter } from "./PitchMeter";
import { ScreenTop } from "./BackButton";

interface Step {
  icon: string;
  name: string;
  cue: string;
  secs: number;
}

const STEPS: Step[] = [
  { icon: "🎵", name: "Humming", cue: "Gentle “mmm” hums — easy, breathy, no push.", secs: 30 },
  { icon: "👄", name: "Lip trills", cue: "“Brrr” lip-trills on a comfortable note.", secs: 30 },
  { icon: "🥤", name: "Straw phonation", cue: "Hum through a straw (into a glass of water is ideal).", secs: 30 },
  { icon: "🌊", name: "Mini sirens", cue: "Slide up & down a little on the trill — small and easy.", secs: 30 },
];

export function SovtWarmup({ onExit }: { onExit: () => void }) {
  const { pitch, error, listening } = usePitch(true, { clarityThreshold: 0.82 });
  const range = getStoredRange() ?? DEFAULT_RANGE;
  const center = Math.round((range.low + range.high) / 2);

  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(STEPS[0].secs);
  const startedRef = useRef(false);

  const done = idx >= STEPS.length;

  // per-step countdown; auto-advances
  useEffect(() => {
    if (done) return;
    setRemaining(STEPS[idx].secs);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setIdx((i) => i + 1);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [idx, done]);

  // record one warm-up session when finished
  useEffect(() => {
    if (done && !startedRef.current) {
      startedRef.current = true;
      recordSession("sovt", 0, 1, Date.now());
    }
  }, [done]);

  if (error) {
    return (
      <div className="game">
        <ScreenTop onBack={onExit} title="SOVT Warm-up" />
        <p className="error">{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="results">
        <ScreenTop onBack={onExit} title="SOVT Warm-up" />
        <h2>✓ Warmed up!</h2>
        <p className="hint">
          Nice — your voice is ready. Head to Daily Drills or sing a song.
        </p>
        <div className="controls">
          <button
            className="btn btn--primary"
            onClick={() => {
              startedRef.current = false;
              setIdx(0);
            }}
          >
            🔁 Again
          </button>
          <button className="btn" onClick={onExit}>
            Done
          </button>
        </div>
      </div>
    );
  }

  const step = STEPS[idx];
  const liveMidi = pitch ? hzToMidi(pitch.hz) : null;
  const pct = Math.round(((step.secs - remaining) / step.secs) * 100);

  return (
    <div className="game">
      <ScreenTop onBack={onExit} title="SOVT Warm-up" />

      <div className="turn-banner" style={{ borderColor: "#38bdf8", color: "#38bdf8" }}>
        {step.icon} Step {idx + 1}/{STEPS.length} · {step.name}
      </div>
      <p className="hint">{step.cue}</p>

      <PitchMeter centerMidi={center} liveMidi={liveMidi} />
      {!listening && <div className="hint">starting mic…</div>}

      <div className="countdown">{remaining}s</div>
      <div className="hold">
        <div className="hold__bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="controls">
        <button className="btn" onClick={() => setIdx((i) => i + 1)}>
          ⏭ Next step
        </button>
      </div>
    </div>
  );
}
