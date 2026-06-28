// Online versus: two singers, two devices, one Supabase room. Both attempt the
// same seeded sequence simultaneously; only scores are synced. Falls back to a
// setup notice when Supabase isn't configured.

import { useMemo, useState } from "react";
import {
  decideWinner,
  matchSequence,
  starsFor,
  totalScore,
} from "../engine/match";
import {
  createSingOff,
  joinSingOff,
  onlineConfigured,
} from "../online/room";
import { useOnlineSingOff, type Role } from "./useOnlineSingOff";
import { SingTurn } from "./SingTurn";
import { ScoreCard, P1_COLOR, P2_COLOR } from "./ScoreCard";

const NOTE_COUNT = 6;

export function OnlineSingOff({ onExit }: { onExit: () => void }) {
  const [session, setSession] = useState<{ code: string; role: Role } | null>(
    null,
  );

  if (!onlineConfigured) {
    return (
      <div className="start">
        <h2>🌐 Online not set up yet</h2>
        <p>
          Online sing-off needs a free Supabase project (one-time, ~5 min). See{" "}
          <strong>SETUP-ONLINE.md</strong> in the repo, add your keys to{" "}
          <code>.env.local</code>, and restart the dev server.
        </p>
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  if (session) {
    return (
      <OnlineMatch
        code={session.code}
        role={session.role}
        onExit={() => setSession(null)}
      />
    );
  }

  return <Lobby onStart={setSession} onExit={onExit} />;
}

function Lobby({
  onStart,
  onExit,
}: {
  onStart: (s: { code: string; role: Role }) => void;
  onExit: () => void;
}) {
  const [name, setName] = useState("Player");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function host() {
    setBusy(true);
    setError(null);
    try {
      const newCode = await createSingOff(name, NOTE_COUNT);
      onStart({ code: newCode, role: "a" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const room = await joinSingOff(code.trim().toUpperCase(), name);
      if (!room) {
        setError("No sing-off found for that code.");
        setBusy(false);
        return;
      }
      onStart({ code: code.trim().toUpperCase(), role: "b" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div className="start">
      <h2>🌐 Online Sing-Off</h2>
      <p>Play a friend on another device. Same notes, highest score wins.</p>
      <input
        className="input input--wide"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        aria-label="Your name"
      />
      <div className="controls">
        <button className="btn btn--primary" disabled={busy} onClick={host}>
          🎤 Host a game
        </button>
      </div>
      <div className="or">— or join —</div>
      <div className="name-row">
        <input
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CODE"
          aria-label="Room code"
          maxLength={5}
        />
        <button className="btn" disabled={busy || !code.trim()} onClick={join}>
          Join
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="controls">
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}

function OnlineMatch({
  code,
  role,
  onExit,
}: {
  code: string;
  role: Role;
  onExit: () => void;
}) {
  const { room, submitScores, rematch } = useOnlineSingOff(code, role);

  const sequence = useMemo(
    () =>
      room ? matchSequence({ noteCount: room.noteCount, seed: room.seed }) : [],
    [room?.seed, room?.noteCount],
  );

  if (!room) {
    return (
      <div className="start">
        <h2>Connecting…</h2>
        <CodeChip code={code} />
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const opp: Role = role === "a" ? "b" : "a";
  const myColor = role === "a" ? P1_COLOR : P2_COLOR;
  const myName = room.names[role] || (role === "a" ? "Player 1" : "Player 2");
  const oppName = room.names[opp] || "Opponent";
  const isHost = role === "a";

  // ---- waiting for the opponent to join ----
  if (room.status === "waiting") {
    return (
      <div className="start">
        <h2>Waiting for opponent…</h2>
        <p>Share this code so a friend can join:</p>
        <CodeChip code={code} />
        <button className="btn" onClick={onExit}>
          Cancel
        </button>
      </div>
    );
  }

  const mySubmitted = room.scores[role] != null;

  // ---- singing (or waiting for the other to finish) ----
  if (room.status === "singing") {
    if (!mySubmitted) {
      return (
        <SingTurn
          key={room.seed}
          name={myName}
          color={myColor}
          sequence={sequence}
          onDone={(s) => void submitScores(s)}
        />
      );
    }
    return (
      <div className="start">
        <h2>✓ {totalScore(room.scores[role]!)} pts</h2>
        <p>
          Nice singing! Waiting for <strong>{oppName}</strong> to finish…
        </p>
      </div>
    );
  }

  // ---- results ----
  const aTotal = totalScore(room.scores.a ?? []);
  const bTotal = totalScore(room.scores.b ?? []);
  const winner = decideWinner(aTotal, bTotal);
  const winnerName =
    winner === "tie"
      ? "It's a tie!"
      : `${winner === "a" ? room.names.a : room.names.b} wins!`;

  return (
    <div className="results">
      <h2>🏆 {winnerName}</h2>
      <div className="scoreboard">
        <ScoreCard
          name={room.names.a || "Player 1"}
          total={aTotal}
          stars={starsFor(room.scores.a ?? [])}
          color={P1_COLOR}
          win={winner === "a"}
        />
        <ScoreCard
          name={room.names.b || "Player 2"}
          total={bTotal}
          stars={starsFor(room.scores.b ?? [])}
          color={P2_COLOR}
          win={winner === "b"}
        />
      </div>
      <div className="controls">
        {isHost ? (
          <button className="btn btn--primary" onClick={() => void rematch()}>
            ⚔️ Rematch
          </button>
        ) : (
          <span className="hint">Waiting for host to start a rematch…</span>
        )}
        <button className="btn" onClick={onExit}>
          Leave
        </button>
      </div>
    </div>
  );
}

function CodeChip({ code }: { code: string }) {
  return <div className="code-chip">{code}</div>;
}
