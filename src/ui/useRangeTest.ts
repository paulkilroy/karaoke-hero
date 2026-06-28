// Guided range test (hands-free auto-advance). Call-and-response: play a
// target, the singer matches it, and we step a semitone further out each time
// it's cleared — first down to the floor, then up to the ceiling. Between notes
// a short "Got it!" beat makes the hand-off obvious. The whole session is
// recorded frame-by-frame so a result can be downloaded for analysis.

import { useCallback, useEffect, useRef, useState } from "react";
import { midiToHz, midiToNoteName, nearestMidi } from "../engine/music";
import { playTone } from "../audio/tone";
import { recordRange } from "../store/progress";
import { useNoteTracker, type NoteFrame } from "./useNoteTracker";

const START = 57; // A3 — a comfortable middle starting note
const FLOOR = 33; // ~A1
const CEIL = 84; // ~C6
const PAUSE_MS = 1400; // celebration/hand-off beat between notes

export type RangePhase = "down" | "up" | "done";

interface Frame extends NoteFrame {
  t: number;
  phase: string;
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function useRangeTest() {
  const [phase, setPhase] = useState<RangePhase>("down");
  const [target, setTarget] = useState<number | null>(START);
  const [frozen, setFrozen] = useState(false);
  const [cleared, setCleared] = useState<number | null>(null); // note just cleared
  const [gated, setGated] = useState(false); // reference tone sounding → "listen"
  const [low, setLow] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);

  const lowReached = useRef<number | null>(null);
  const highReached = useRef<number | null>(null);
  const targetRef = useRef<number>(START);
  const phaseRef = useRef<RangePhase>("down");
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frames = useRef<Frame[]>([]);
  const t0 = useRef<number>(now());

  useEffect(() => {
    if (target == null) return;
    playTone(midiToHz(target), 800);
    setGated(true);
    const id = setTimeout(() => setGated(false), 980);
    return () => clearTimeout(id);
  }, [target]);

  const advance = useCallback((next: number) => {
    targetRef.current = next;
    setTarget(next);
  }, []);

  const finishDown = useCallback(() => {
    setLow(lowReached.current ?? START);
    phaseRef.current = "up";
    setPhase("up");
    highReached.current = null;
    advance(START + 1);
  }, [advance]);

  const finishUp = useCallback(() => {
    const lo = Math.min(lowReached.current ?? START, START);
    const hi = Math.max(highReached.current ?? START, START);
    setHigh(hi);
    setLow(lo);
    phaseRef.current = "done";
    setPhase("done");
    setTarget(null);
    recordRange(lo, hi, Date.now());
  }, []);

  const handleCleared = useCallback(() => {
    const t = targetRef.current;
    if (phaseRef.current === "down") lowReached.current = t;
    else if (phaseRef.current === "up") highReached.current = t;

    setCleared(t);
    setFrozen(true);
    pauseTimer.current = setTimeout(() => {
      setFrozen(false);
      setCleared(null);
      if (phaseRef.current === "down") {
        const next = t - 1;
        if (next < FLOOR) finishDown();
        else advance(next);
      } else {
        const next = t + 1;
        if (next > CEIL) finishUp();
        else advance(next);
      }
    }, PAUSE_MS);
  }, [advance, finishDown, finishUp]);

  const onFrame = useCallback((f: NoteFrame) => {
    if (frames.current.length > 12000) return; // safety cap
    frames.current.push({
      ...f,
      t: Math.round(now() - t0.current),
      phase: phaseRef.current,
    });
  }, []);

  const { cents, holdProgress, error, listening } = useNoteTracker({
    target,
    active: phase !== "done",
    frozen,
    onCleared: handleCleared,
    onFrame,
  });

  const cantReach = useCallback(() => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    setFrozen(false);
    setCleared(null);
    if (phaseRef.current === "down") finishDown();
    else if (phaseRef.current === "up") finishUp();
  }, [finishDown, finishUp]);

  const replayTone = useCallback(() => {
    if (target == null) return;
    playTone(midiToHz(target), 800);
    setGated(true);
    setTimeout(() => setGated(false), 980);
  }, [target]);

  /** Download the full session (target vs detected, per frame) as JSON. */
  const downloadAnalysis = useCallback(() => {
    const data = {
      app: "Karaoke Hero — range test analysis",
      exportedAt: new Date(Date.now()).toISOString(),
      result: {
        low,
        high,
        lowNote: low != null ? midiToNoteName(low) : null,
        highNote: high != null ? midiToNoteName(high) : null,
      },
      frameCount: frames.current.length,
      frames: frames.current.map((fr) => ({
        t: fr.t,
        phase: fr.phase,
        target: fr.target,
        targetNote: midiToNoteName(fr.target),
        hz: fr.hz != null ? Math.round(fr.hz * 100) / 100 : null,
        detectedNote: fr.hz != null ? midiToNoteName(nearestMidi(fr.hz)) : null,
        clarity: fr.clarity != null ? Math.round(fr.clarity * 1000) / 1000 : null,
        cents: fr.cents != null ? Math.round(fr.cents) : null,
        onTarget: fr.onTarget,
      })),
    };
    // eslint-disable-next-line no-console
    console.log("[range analysis]", data);
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "karaoke-range-analysis.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // console log above is the fallback
    }
  }, [low, high]);

  useEffect(
    () => () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    },
    [],
  );

  return {
    phase,
    target,
    cents,
    holdProgress,
    cleared,
    low,
    high,
    error,
    listening,
    gated,
    cantReach,
    replayTone,
    downloadAnalysis,
  };
}
