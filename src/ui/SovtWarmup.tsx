// SOVT (semi-occluded vocal tract) warm-up: straw phonation / lip trills /
// humming — the evidence-based way to warm up and gently extend range. Untimed
// guided drill with a live pitch read-out. Logs warm-up volume, not a grade.

import { nearestMidi, midiToNoteName } from "../engine/music";
import { recordSession } from "../store/progress";
import { usePitch } from "./usePitch";

const STEPS = [
  "Gentle hums on “mmm” — easy, breathy, no push.",
  "Lip trills (“brrr”) on a comfortable note.",
  "Straw phonation: hum through a straw into a glass of water.",
  "Slide up and down a little on the trill — like a small siren.",
];

export function SovtWarmup({ onExit }: { onExit: () => void }) {
  const { pitch, error, listening } = usePitch(true, { clarityThreshold: 0.85 });

  if (error) {
    return (
      <div className="start">
        <h2>Microphone unavailable</h2>
        <p className="error">{error}</p>
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const note = pitch ? midiToNoteName(nearestMidi(pitch.hz)) : "—";

  function finish() {
    recordSession("sovt", 0, 1, Date.now());
    onExit();
  }

  return (
    <div className="game">
      <div
        className="turn-banner"
        style={{ borderColor: "#38bdf8", color: "#38bdf8" }}
      >
        🫧 SOVT warm-up
      </div>
      <p className="hint">
        Semi-occluded sounds balance your voice so you warm up and stretch
        safely. Do each for ~30s. No straining.
      </p>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <div className="versus__side">
        <div className="versus__label">Detected</div>
        <div className="versus__note">{listening ? note : "…"}</div>
      </div>

      <div className="controls">
        <button className="btn btn--primary" onClick={finish}>
          ✓ Done warming up
        </button>
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}
