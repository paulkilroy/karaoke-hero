// Local hot-seat versus: two singers take turns on the same note sequence on
// one device, highest total wins.

import { useMemo, useState } from "react";
import {
  decideWinner,
  matchSequence,
  starsFor,
  totalScore,
  type MatchConfig,
} from "../engine/match";
import { SingTurn } from "./SingTurn";
import { ScoreCard, P1_COLOR, P2_COLOR } from "./ScoreCard";
import { ScreenTop } from "./BackButton";

const NOTE_COUNT = 6;

type Phase = "setup" | "p1" | "handoff" | "p2" | "results";

export function LocalSingOff({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [names, setNames] = useState({ a: "Player 1", b: "Player 2" });
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [scoresA, setScoresA] = useState<number[]>([]);
  const [scoresB, setScoresB] = useState<number[]>([]);

  const config: MatchConfig = useMemo(
    () => ({ noteCount: NOTE_COUNT, seed }),
    [seed],
  );
  const sequence = useMemo(() => matchSequence(config), [config]);

  function startMatch() {
    setScoresA([]);
    setScoresB([]);
    setPhase("p1");
  }

  function rematch() {
    setSeed(Math.floor(Math.random() * 1e9));
    setScoresA([]);
    setScoresB([]);
    setPhase("p1");
  }

  if (phase === "setup") {
    return (
      <div className="start">
        <ScreenTop onBack={onExit} title="Sing-Off" />
        <h2>⚔️ Same-device Sing-Off</h2>
        <p>
          Two singers, the same {NOTE_COUNT} notes, one mic. Take turns and the
          highest score wins. Pass the mic when prompted.
        </p>
        <div className="name-row">
          <input
            className="input"
            value={names.a}
            onChange={(e) => setNames({ ...names, a: e.target.value })}
            aria-label="Player 1 name"
          />
          <span className="vs-pill">VS</span>
          <input
            className="input"
            value={names.b}
            onChange={(e) => setNames({ ...names, b: e.target.value })}
            aria-label="Player 2 name"
          />
        </div>
        <div className="controls">
          <button className="btn btn--primary" onClick={startMatch}>
            🎤 Start sing-off
          </button>
        </div>
      </div>
    );
  }

  if (phase === "p1") {
    return (
      <SingTurn
        name={names.a}
        color={P1_COLOR}
        sequence={sequence}
        onExit={onExit}
        onDone={(s) => {
          setScoresA(s);
          setPhase("handoff");
        }}
      />
    );
  }

  if (phase === "handoff") {
    return (
      <div className="start">
        <ScreenTop onBack={onExit} title="Sing-Off" />
        <h2>🔁 Pass the mic</h2>
        <p>
          {names.a} scored <strong>{totalScore(scoresA)}</strong>. Hand the mic
          to <strong style={{ color: P2_COLOR }}>{names.b}</strong>.
        </p>
        <button className="btn btn--primary" onClick={() => setPhase("p2")}>
          {names.b} is ready →
        </button>
      </div>
    );
  }

  if (phase === "p2") {
    return (
      <SingTurn
        name={names.b}
        color={P2_COLOR}
        sequence={sequence}
        onExit={onExit}
        onDone={(s) => {
          setScoresB(s);
          setPhase("results");
        }}
      />
    );
  }

  // results
  const aTotal = totalScore(scoresA);
  const bTotal = totalScore(scoresB);
  const winner = decideWinner(aTotal, bTotal);
  const winnerName =
    winner === "tie"
      ? "It's a tie!"
      : `${winner === "a" ? names.a : names.b} wins!`;

  return (
    <div className="results">
      <ScreenTop onBack={onExit} title="Sing-Off" />
      <h2>🏆 {winnerName}</h2>
      <div className="scoreboard">
        <ScoreCard
          name={names.a}
          total={aTotal}
          stars={starsFor(scoresA)}
          color={P1_COLOR}
          win={winner === "a"}
        />
        <ScoreCard
          name={names.b}
          total={bTotal}
          stars={starsFor(scoresB)}
          color={P2_COLOR}
          win={winner === "b"}
        />
      </div>
      <div className="controls">
        <button className="btn btn--primary" onClick={rematch}>
          ⚔️ Rematch
        </button>
      </div>
    </div>
  );
}
