// The Phase-1 pitch-matching drill screen.

import { useState } from "react";
import { midiToNoteName } from "../engine/music";
import { streakMultiplier } from "../engine/scoring";
import { usePitchMatch } from "./usePitchMatch";
import { PitchMeter } from "./PitchMeter";

export function PitchMatchGame({ onExit }: { onExit?: () => void }) {
  const [active, setActive] = useState(false);
  const game = usePitchMatch(active);

  if (!active) {
    return (
      <div className="start">
        <h2>Pitch Match</h2>
        <p>
          I’ll play a note — sing it back and hold it steady until the ring
          fills. Stay in tune to build a streak.
        </p>
        <div className="controls">
          <button className="btn btn--primary" onClick={() => setActive(true)}>
            🎤 Start
          </button>
          {onExit && (
            <button className="btn" onClick={onExit}>
              Back
            </button>
          )}
        </div>
        <p className="hint">You’ll be asked to allow microphone access.</p>
      </div>
    );
  }

  if (game.error) {
    return (
      <div className="start">
        <h2>Microphone unavailable</h2>
        <p className="error">{game.error}</p>
        <button className="btn" onClick={() => setActive(false)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="game">
      <div className="hud">
        <Stat label="Streak" value={`${game.streak}× `} />
        <Stat label="Multiplier" value={`${streakMultiplier(game.streak)}×`} />
        <Stat label="XP" value={game.xp} />
        <Stat label="Cleared" value={game.cleared} />
      </div>

      <div className="versus">
        <div className="versus__side">
          <div className="versus__label">Target</div>
          <div className="versus__note versus__note--target">
            {game.target != null ? midiToNoteName(game.target) : "…"}
          </div>
        </div>
        <div className="versus__arrow">→</div>
        <div className="versus__side">
          <div className="versus__label">You</div>
          <div className="versus__note">
            {game.cents != null && game.target != null
              ? midiToNoteName(Math.round(game.target + game.cents / 100))
              : "—"}
          </div>
        </div>
      </div>
      {!game.listening && <div className="hint">starting mic…</div>}

      <PitchMeter cents={game.cents} targetMidi={game.target} />

      <HoldRing progress={game.holdProgress} lastScore={game.lastScore} />

      <div className="controls">
        <button className="btn" onClick={game.replayTone}>
          🔁 Replay note
        </button>
        <button className="btn" onClick={game.skip}>
          ⏭ Skip
        </button>
        <button className="btn" onClick={() => setActive(false)}>
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

function HoldRing({
  progress,
  lastScore,
}: {
  progress: number;
  lastScore: number | null;
}) {
  const pct = Math.round(progress * 100);
  const cleared = lastScore != null;
  return (
    <div className={`hold${cleared ? " hold--cleared" : ""}`}>
      <div className="hold__bar" style={{ width: `${pct}%` }} />
      <span className="hold__text">
        {cleared ? `✓ Nice! +${lastScore}` : pct > 0 ? "hold…" : "sing the note"}
      </span>
    </div>
  );
}
