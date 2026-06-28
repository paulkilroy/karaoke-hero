// One singer's live turn in a versus match. Mounted only while it's their
// turn so it resets cleanly; reports the per-note scores back when finished.

import { midiToNoteName } from "../engine/music";
import { useSingTurn } from "./useSingTurn";
import { PitchMeter } from "./PitchMeter";

export function SingTurn({
  name,
  color,
  sequence,
  onDone,
}: {
  name: string;
  color: string;
  sequence: number[];
  onDone: (scores: number[]) => void;
}) {
  const turn = useSingTurn(sequence, onDone);

  if (turn.error) {
    return <div className="error">Microphone error: {turn.error}</div>;
  }

  const detected =
    turn.cents != null && turn.target != null
      ? midiToNoteName(Math.round(turn.target + turn.cents / 100))
      : "—";

  return (
    <div className="game">
      <div className="turn-banner" style={{ borderColor: color, color }}>
        🎤 {name}’s turn
      </div>

      <div className="turn-progress">
        Note {Math.min(turn.index + 1, turn.count)} / {turn.count} ·{" "}
        <strong>{turn.total}</strong> pts
      </div>

      <div className="versus">
        <div className="versus__side">
          <div className="versus__label">Target</div>
          <div className="versus__note versus__note--target">
            {turn.target != null ? midiToNoteName(turn.target) : "✓"}
          </div>
        </div>
        <div className="versus__arrow">→</div>
        <div className="versus__side">
          <div className="versus__label">You</div>
          <div className="versus__note">{detected}</div>
        </div>
      </div>

      {!turn.listening && <div className="hint">starting mic…</div>}

      <PitchMeter cents={turn.cents} targetMidi={turn.target} />

      <div className={`hold${turn.lastScore != null ? " hold--cleared" : ""}`}>
        <div
          className="hold__bar"
          style={{ width: `${Math.round(turn.holdProgress * 100)}%` }}
        />
        <span className="hold__text">
          {turn.lastScore != null
            ? `✓ +${turn.lastScore}`
            : turn.holdProgress > 0
              ? "hold…"
              : "sing the note"}
        </span>
      </div>
    </div>
  );
}
