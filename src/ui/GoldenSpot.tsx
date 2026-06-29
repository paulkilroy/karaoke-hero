// Golden Spot finder (Chris Liepe method). A guided 3-step wizard:
//  1) slide up on "Ah" and mark where the voice wants to flip → 7-note zone
//  2) crying/"Mew" closure cue (felt, not measured)
//  3) strike the spot on the middle note — we show pitch-lock + a resonance
//     (loudness) meter, since the tell is "suddenly louder for less effort".

import { useEffect, useRef, useState } from "react";
import {
  centsFromTarget,
  midiToHz,
  midiToNoteName,
  nearestMidi,
} from "../engine/music";
import {
  levelMeter,
  zoneFromFlip,
  zoneNoteNames,
  type GoldenZone,
} from "../engine/goldenspot";
import { playTone } from "../audio/tone";
import { recordGoldenSpot } from "../store/progress";
import { usePitch } from "./usePitch";

type Step = "intro" | "slide" | "closure" | "strike" | "done";

export function GoldenSpot({ onExit }: { onExit: () => void }) {
  const { pitch, error, listening } = usePitch(true, { clarityThreshold: 0.82 });
  const lastVoiced = useRef(pitch);
  if (pitch) lastVoiced.current = pitch;

  const [step, setStep] = useState<Step>("intro");
  const [zone, setZone] = useState<GoldenZone | null>(null);

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

  // ---- intro ----
  if (step === "intro") {
    return (
      <div className="start">
        <h2>✨ Find Your Golden Spot</h2>
        <p>
          The vocal “sweet spot” lives in your <strong>passaggio</strong> — the
          bridge where your voice wants to crack. We’ll find your flip point,
          map your 7-note zone, then strike the spot with a “crying” closure.
        </p>
        <p className="hint">🎧 Headphones help. Don’t push — this is small and easy.</p>
        <div className="controls">
          <button className="btn btn--primary" onClick={() => setStep("slide")}>
            Start
          </button>
          <button className="btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ---- step 1: slide to the flip ----
  if (step === "slide") {
    const note = pitch ? midiToNoteName(nearestMidi(pitch.hz)) : "—";
    return (
      <div className="game">
        <div className="turn-banner" style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}>
          1 · Find the flip
        </div>
        <p className="hint">
          Start on a comfortable low note on “Ah”, then <strong>slide up slowly</strong>.
          When your throat tightens or the voice wants to flip into a lighter,
          hollow head voice — tap the button.
        </p>
        <div className="versus__side">
          <div className="versus__label">You</div>
          <div className="versus__note">{listening ? note : "…"}</div>
        </div>
        <div className="controls">
          <button
            className="btn btn--primary"
            disabled={!pitch && !lastVoiced.current}
            onClick={() => {
              const v = pitch ?? lastVoiced.current;
              if (!v) return;
              setZone(zoneFromFlip(nearestMidi(v.hz)));
              setStep("closure");
            }}
          >
            ⚡ It wants to flip!
          </button>
          <button className="btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ---- step 2: crying closure ----
  if (step === "closure" && zone) {
    return (
      <div className="start">
        <h2>2 · Crying closure</h2>
        <p>
          Make a small, whiny “<strong>Mew</strong>” — like a puppy begging or a
          toddler saying “Woe!”. Feel a tiny squeeze just behind your Adam’s
          apple. It should feel <em>small, sharp and easy</em> — never a heavy
          shout.
        </p>
        <p className="hint">
          Your zone: {zoneNoteNames(zone).join(" · ")} — golden spot near{" "}
          <strong>{midiToNoteName(zone.middle)}</strong>.
        </p>
        <div className="controls">
          <button className="btn btn--primary" onClick={() => setStep("strike")}>
            Got the “Mew” →
          </button>
          <button className="btn" onClick={() => setStep("slide")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ---- step 3: strike the spot ----
  if (step === "strike" && zone) {
    return (
      <StrikeStep
        zone={zone}
        pitch={pitch}
        listening={listening}
        onSaved={() => setStep("done")}
        onBack={() => setStep("closure")}
      />
    );
  }

  // ---- done ----
  if (step === "done" && zone) {
    return (
      <div className="results">
        <h2>✨ Golden spot found</h2>
        <div className="range-big">{midiToNoteName(zone.middle)}</div>
        <div className="range-sub">in your passaggio</div>
        <p className="hint">
          Zone: {zoneNoteNames(zone).join(" · ")}. Saved! Return here to drill it
          — start on “Mew”, open to “Ah”, keep the tiny inner whine, and let it
          float behind your eyes.
        </p>
        <div className="controls">
          <button className="btn btn--primary" onClick={onExit}>
            Done
          </button>
          <button className="btn" onClick={() => setStep("slide")}>
            Find again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function StrikeStep({
  zone,
  pitch,
  listening,
  onSaved,
  onBack,
}: {
  zone: GoldenZone;
  pitch: { hz: number; clarity: number; level: number } | null;
  listening: boolean;
  onSaved: () => void;
  onBack: () => void;
}) {
  const target = zone.middle;

  useEffect(() => {
    playTone(midiToHz(target), 900);
  }, [target]);

  const cents = pitch ? centsFromTarget(pitch.hz, target) : null;
  const locked = cents != null && Math.abs(cents) <= 45;
  const resonance = pitch ? levelMeter(pitch.level) : 0;
  const golden = locked && resonance > 0.45;

  return (
    <div className="game">
      <div className="turn-banner" style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
        3 · Strike the spot
      </div>
      <p className="hint">
        On <strong>{midiToNoteName(target)}</strong>: start the tiny “Mew”, then
        slowly open to “Ah” — keep the inner whine. Feed a little air from your
        core. Aim to make it <em>buzzy and loud for little effort</em>.
      </p>

      <div className="versus">
        <div className="versus__side">
          <div className="versus__label">Spot</div>
          <div className="versus__note versus__note--target">
            {midiToNoteName(target)}
          </div>
        </div>
        <div className="versus__arrow">→</div>
        <div className="versus__side">
          <div className="versus__label">You</div>
          <div className="versus__note">
            {cents != null ? (locked ? "🔒" : `${cents > 0 ? "+" : ""}${cents.toFixed(0)}¢`) : "—"}
          </div>
        </div>
      </div>

      <div className="resonance">
        <div className="resonance__label">Resonance</div>
        <div className="resonance__track">
          <div
            className="resonance__bar"
            style={{
              width: `${Math.round(resonance * 100)}%`,
              background: golden ? "#f59e0b" : "#8b5cf6",
            }}
          />
        </div>
      </div>

      <div className={`golden-hint${golden ? " golden-hint--on" : ""}`}>
        {golden ? "✨ That’s it — floaty & loud!" : locked ? "on pitch — now find the buzz" : "match the note"}
      </div>

      {!listening && <div className="hint">starting mic…</div>}

      <div className="controls">
        <button className="btn" onClick={() => playTone(midiToHz(target), 900)}>
          🔁 Replay note
        </button>
        <button
          className="btn btn--primary"
          disabled={!locked}
          onClick={() => {
            recordGoldenSpot(zone.flip, target);
            onSaved();
          }}
        >
          ✨ Found it — save
        </button>
        <button className="btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
