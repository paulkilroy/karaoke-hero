// Note-ladder pitch meter. Shows a window of an octave above & below the
// target, with a labelled tick per semitone, the target highlighted, and a
// live marker at the actual detected pitch — so octave errors are visible
// instead of being clamped flat.

import { gradeCents, type Grade } from "../engine/scoring";
import { midiToNoteName } from "../engine/music";

const GRADE_COLOR: Record<Grade, string> = {
  perfect: "#22c55e",
  good: "#84cc16",
  close: "#f59e0b",
  off: "#ef4444",
};

/** Semitones shown above and below the target (one octave each way). */
const WINDOW = 12;

function topPct(semisFromTarget: number): number {
  return ((WINDOW - semisFromTarget) / (2 * WINDOW)) * 100;
}

export function PitchMeter({
  cents,
  targetMidi,
}: {
  cents: number | null;
  targetMidi: number | null;
}) {
  const active = cents != null && targetMidi != null;

  const semis = active ? Math.max(-WINDOW, Math.min(WINDOW, cents / 100)) : 0;
  const grade: Grade = active ? gradeCents(cents) : "off";
  const color = active ? GRADE_COLOR[grade] : "#475569";

  const ticks: { midi: number; top: number; isTarget: boolean }[] = [];
  if (targetMidi != null) {
    for (let s = WINDOW; s >= -WINDOW; s--) {
      ticks.push({
        midi: targetMidi + s,
        top: topPct(s),
        isTarget: s === 0,
      });
    }
  }

  return (
    <div className="meter">
      <div className="meter__track">
        {ticks.map((t) => (
          <div
            key={t.midi}
            className={`meter__tick${t.isTarget ? " meter__tick--target" : ""}`}
            style={{ top: `${t.top}%` }}
          >
            <span className="meter__tick-label">{midiToNoteName(t.midi)}</span>
          </div>
        ))}
        {active && (
          <div
            className="meter__marker"
            style={{ top: `${topPct(semis)}%`, background: color, color }}
          />
        )}
      </div>
      <div className="meter__readout" style={{ color }}>
        {active ? `${cents > 0 ? "+" : ""}${cents.toFixed(0)}¢` : "—"}
      </div>
    </div>
  );
}
