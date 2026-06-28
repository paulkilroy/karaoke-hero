// Guided range test. Call-and-response: play a target, the singer matches it,
// and we step a semitone further out each time they clear it — first down to
// find the floor, then up to find the ceiling. "Can't reach" ends a direction.
// The measured range is saved to local progress on completion.

import { useCallback, useEffect, useRef, useState } from "react";
import { midiToHz } from "../engine/music";
import { playTone } from "../audio/tone";
import { recordRange } from "../store/progress";
import { CLEAR_PAUSE_MS, useNoteTracker } from "./useNoteTracker";

const START = 57; // A3 — a comfortable middle starting note
const FLOOR = 33; // don't chase below ~A1
const CEIL = 84; // ...or above C6

export type RangePhase = "down" | "up" | "done";

export function useRangeTest() {
  const [phase, setPhase] = useState<RangePhase>("down");
  const [target, setTarget] = useState<number | null>(START);
  const [frozen, setFrozen] = useState(false);
  const [low, setLow] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);

  const lowReached = useRef<number | null>(null);
  const highReached = useRef<number | null>(null);
  const targetRef = useRef<number>(START);
  const phaseRef = useRef<RangePhase>("down");
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (target != null) playTone(midiToHz(target), 800);
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

    setFrozen(true);
    pauseTimer.current = setTimeout(() => {
      setFrozen(false);
      if (phaseRef.current === "down") {
        const next = t - 1;
        if (next < FLOOR) finishDown();
        else advance(next);
      } else {
        const next = t + 1;
        if (next > CEIL) finishUp();
        else advance(next);
      }
    }, CLEAR_PAUSE_MS);
  }, [advance, finishDown, finishUp]);

  const cantReach = useCallback(() => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    setFrozen(false);
    if (phaseRef.current === "down") finishDown();
    else if (phaseRef.current === "up") finishUp();
  }, [finishDown, finishUp]);

  const { cents, holdProgress, error, listening } = useNoteTracker({
    target,
    active: phase !== "done",
    frozen,
    onCleared: handleCleared,
  });

  const replayTone = useCallback(() => {
    if (target != null) playTone(midiToHz(target), 800);
  }, [target]);

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
    low,
    high,
    error,
    listening,
    cantReach,
    replayTone,
  };
}
