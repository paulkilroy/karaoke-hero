// Siren glide drill: follow a smooth slide up and back down through your range.
// The safest range-extender (SOVT-friendly). Scored by how much of the glide
// you tracked within range; recorded as warm-up volume (not an accuracy grade).

import { useEffect, useRef, useState } from "react";
import { centsFromTarget, midiToHz, midiToNoteName } from "../engine/music";
import { type VocalRange } from "../engine/range";
import { playGlide } from "../audio/tone";
import { recordSession } from "../store/progress";
import { usePitch } from "./usePitch";
import { PitchMeter } from "./PitchMeter";
import { ScreenTop } from "./BackButton";

const DURATION_MS = 6000; // up then down

export function SirenDrill({
  range,
  onExit,
}: {
  range: VocalRange;
  onExit: () => void;
}) {
  const { pitch, error, listening } = usePitch(true);
  const pitchRef = useRef(pitch);
  pitchRef.current = pitch;

  const [running, setRunning] = useState(false);
  const [expected, setExpected] = useState<number | null>(null);
  const [cents, setCents] = useState<number | null>(null);
  const [coverage, setCoverage] = useState<number | null>(null);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function start() {
    const lo = range.low;
    const hi = range.high;
    playGlide(midiToHz(lo), midiToHz(hi), DURATION_MS / 2);
    window.setTimeout(
      () => playGlide(midiToHz(hi), midiToHz(lo), DURATION_MS / 2),
      DURATION_MS / 2,
    );

    const t0 = performance.now();
    let frames = 0;
    let covered = 0;
    setRunning(true);
    setCoverage(null);

    const loop = () => {
      const el = performance.now() - t0;
      const tn = el / DURATION_MS;
      const m =
        tn < 0.5
          ? lo + (hi - lo) * (tn / 0.5)
          : hi - (hi - lo) * ((tn - 0.5) / 0.5);
      setExpected(m);

      const p = pitchRef.current;
      if (p) {
        const c = centsFromTarget(p.hz, m);
        setCents(c);
        frames++;
        if (Math.abs(c) <= 200) covered++;
      } else {
        setCents(null);
      }

      if (el >= DURATION_MS) {
        setRunning(false);
        setExpected(null);
        setCents(null);
        const cov = frames ? Math.round((100 * covered) / frames) : 0;
        setCoverage(cov);
        recordSession("siren", cov, 1, Date.now());
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }

  if (error) {
    return (
      <div className="game">
        <ScreenTop onBack={onExit} title="Siren Glide" />
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="game">
      <ScreenTop onBack={onExit} title="Siren Glide" />
      <div
        className="turn-banner"
        style={{ borderColor: "#22c55e", color: "#22c55e" }}
      >
        🌊 Siren glide
      </div>
      <p className="hint">
        Lip-trill or “wee/woo” and slide smoothly with the tone — up to your top,
        back to your bottom. Don’t push; let it float.
      </p>

      <div className="versus">
        <div className="versus__side">
          <div className="versus__label">Glide</div>
          <div className="versus__note versus__note--target">
            {expected != null ? midiToNoteName(Math.round(expected)) : "—"}
          </div>
        </div>
        <div className="versus__arrow">→</div>
        <div className="versus__side">
          <div className="versus__label">You</div>
          <div className="versus__note">
            {cents != null && expected != null
              ? midiToNoteName(Math.round(expected + cents / 100))
              : "—"}
          </div>
        </div>
      </div>

      <PitchMeter
        cents={cents}
        targetMidi={expected != null ? Math.round(expected) : null}
      />

      {!listening && <div className="hint">starting mic…</div>}
      {coverage != null && (
        <div className="range-sub">Tracked {coverage}% of the glide 🌊</div>
      )}

      <div className="controls">
        <button className="btn btn--primary" disabled={running} onClick={start}>
          {running ? "Sliding…" : coverage != null ? "🔁 Again" : "▶ Start glide"}
        </button>
      </div>
    </div>
  );
}
