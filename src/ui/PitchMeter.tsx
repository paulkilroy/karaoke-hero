// Note-ladder pitch meter. A window of an octave above & below a reference
// note, one labelled tick per semitone, the reference highlighted (purple
// line), and a live marker at the detected pitch. Two modes:
//   • target mode  — pass {cents, targetMidi}: marker = cents off the target.
//   • free mode    — pass {centerMidi, liveMidi}: marker = where you're singing
//                    on the ladder (for warm-ups/sirens with no fixed target).

import { gradeCents, type Grade } from "../engine/scoring";
import { midiToNoteName } from "../engine/music";

const GRADE_COLOR: Record<Grade, string> = {
  perfect: "#22c55e",
  good: "#84cc16",
  close: "#f59e0b",
  off: "#ef4444",
};

/** Semitones shown above and below the reference (one octave each way). */
const WINDOW = 12;

function topPct(semis: number): number {
  return ((WINDOW - semis) / (2 * WINDOW)) * 100;
}

export function PitchMeter({
  cents = null,
  targetMidi = null,
  centerMidi = null,
  liveMidi = null,
}: {
  cents?: number | null;
  targetMidi?: number | null;
  centerMidi?: number | null;
  liveMidi?: number | null;
}) {
  const targetMode = targetMidi != null;
  const center = targetMode ? targetMidi : centerMidi;

  let active = false;
  let semis = 0;
  let color = "#475569";
  let readout = "—";

  if (targetMode && cents != null) {
    active = true;
    semis = Math.max(-WINDOW, Math.min(WINDOW, cents / 100));
    color = GRADE_COLOR[gradeCents(cents)];
    readout = `${cents > 0 ? "+" : ""}${cents.toFixed(0)}¢`;
  } else if (!targetMode && center != null && liveMidi != null) {
    active = true;
    semis = Math.max(-WINDOW, Math.min(WINDOW, liveMidi - center));
    const nearCents = (liveMidi - Math.round(liveMidi)) * 100;
    color = GRADE_COLOR[gradeCents(nearCents)];
    readout = midiToNoteName(Math.round(liveMidi));
  }

  const ticks: { midi: number; top: number; isRef: boolean }[] = [];
  if (center != null) {
    for (let s = WINDOW; s >= -WINDOW; s--) {
      ticks.push({ midi: center + s, top: topPct(s), isRef: s === 0 });
    }
  }

  return (
    <div className="meter">
      <div className="meter__track">
        {ticks.map((t) => (
          <div
            key={t.midi}
            className={`meter__tick${t.isRef ? " meter__tick--target" : ""}`}
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
        {readout}
      </div>
    </div>
  );
}
