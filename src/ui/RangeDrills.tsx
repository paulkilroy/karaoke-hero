// Pitch-matched extension drills (creeping scale, edge-stretch). Reuses the
// versus turn engine to run a fixed note sequence solo, scores it, and records
// the session so it feeds Progress and the proficiency level.

import { useState } from "react";
import { midiToNoteName } from "../engine/music";
import { totalScore } from "../engine/match";
import { recordSession } from "../store/progress";
import { useSingTurn } from "./useSingTurn";
import { PitchMeter } from "./PitchMeter";
import { ScreenTop } from "./BackButton";

export function ExtensionDrill({
  title,
  type,
  color,
  sequence,
  onExit,
}: {
  title: string;
  type: string;
  color: string;
  sequence: number[];
  onExit: () => void;
}) {
  const [done, setDone] = useState<number[] | null>(null);

  if (sequence.length === 0) {
    return (
      <div className="game">
        <ScreenTop onBack={onExit} title={title} />
        <p className="hint">Take a range test first so I can tailor this to your voice.</p>
      </div>
    );
  }

  if (done) {
    const total = totalScore(done);
    const avg = done.length ? Math.round(total / done.length) : 0;
    return (
      <div className="results">
        <ScreenTop onBack={onExit} title={title} />
        <div className="scorecard__total">{total}</div>
        <p className="hint">
          Avg accuracy {avg} · {done.length} notes
        </p>
        <div className="controls">
          <button className="btn btn--primary" onClick={() => setDone(null)}>
            🔁 Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <RunDrill
      title={title}
      color={color}
      sequence={sequence}
      onExit={onExit}
      onDone={(scores) => {
        const avg = scores.length
          ? Math.round(totalScore(scores) / scores.length)
          : 0;
        recordSession(type, avg, scores.length, Date.now());
        setDone(scores);
      }}
    />
  );
}

function RunDrill({
  title,
  color,
  sequence,
  onExit,
  onDone,
}: {
  title: string;
  color: string;
  sequence: number[];
  onExit: () => void;
  onDone: (scores: number[]) => void;
}) {
  const turn = useSingTurn(sequence, onDone);

  if (turn.error) {
    return (
      <div className="game">
        <ScreenTop onBack={onExit} title={title} />
        <p className="error">Microphone error: {turn.error}</p>
      </div>
    );
  }

  const detected =
    turn.cents != null && turn.target != null
      ? midiToNoteName(Math.round(turn.target + turn.cents / 100))
      : "—";

  return (
    <div className="game">
      <ScreenTop onBack={onExit} title={title} />
      <div className="turn-banner" style={{ borderColor: color, color }}>
        {title}
      </div>
      <div className="turn-progress">
        Note {Math.min(turn.index + 1, turn.count)} / {turn.count} ·{" "}
        <strong>{turn.total}</strong> pts
      </div>

      <div className="versus">
        <div className="versus__side">
          <div className="versus__label">Sing</div>
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

      <div className="controls">
        <button
          className="btn"
          onClick={turn.replayTone}
          disabled={turn.target == null}
        >
          🔁 Replay note
        </button>
      </div>
    </div>
  );
}
