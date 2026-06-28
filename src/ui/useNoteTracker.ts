// Shared per-note tracking loop used by both the solo drill and versus turns.
// Listens to the live pitch, measures deviation from a single target note,
// requires a sustained in-tune hold, and fires `onCleared(score)` exactly once.

import { useEffect, useRef, useState } from "react";
import { centsFromTarget } from "../engine/music";
import { isOnTarget, scoreHold } from "../engine/scoring";
import { toneGuardActive } from "../audio/tone";
import { usePitch } from "./usePitch";

/** Time (ms) the singer must stay on the note to clear it. */
export const HOLD_TARGET_MS = 1100;

/** Celebration beat (ms) callers should pause after a clear before advancing. */
export const CLEAR_PAUSE_MS = 900;

/** One processed frame of detection, for diagnostics/recording. */
export interface NoteFrame {
  target: number;
  hz: number | null;
  clarity: number | null;
  cents: number | null;
  onTarget: boolean;
}

export interface NoteTrackerArgs {
  /** Target MIDI note, or null when there's nothing to sing. */
  target: number | null;
  /** Whether the mic should be live. */
  active: boolean;
  /** When true, freeze processing (e.g. during a celebration beat). */
  frozen: boolean;
  onCleared: (score: number) => void;
  /** Optional per-frame hook for diagnostics/recording. */
  onFrame?: (frame: NoteFrame) => void;
}

export interface NoteTrackerState {
  cents: number | null;
  holdProgress: number;
  error: string | null;
  listening: boolean;
}

export function useNoteTracker({
  target,
  active,
  frozen,
  onCleared,
  onFrame,
}: NoteTrackerArgs): NoteTrackerState {
  const { pitch, error, listening } = usePitch(active, { clarityThreshold: 0.9 });

  const [cents, setCents] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  const holdMs = useRef(0);
  const lastTs = useRef<number | null>(null);
  const samples = useRef<number[]>([]);
  const clearedRef = useRef(false);
  const onClearedRef = useRef(onCleared);
  onClearedRef.current = onCleared;
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  // reset accumulators whenever the target changes
  useEffect(() => {
    holdMs.current = 0;
    samples.current = [];
    lastTs.current = null;
    clearedRef.current = false;
    setHoldProgress(0);
    setCents(null);
  }, [target]);

  // process each live-pitch update
  useEffect(() => {
    if (!active || frozen || target == null || clearedRef.current) return;

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    // Ignore input while the reference tone is sounding — the mic may be
    // hearing the speaker, not the singer. Keep the clock fresh so the first
    // real frame afterwards doesn't carry a huge dt.
    if (toneGuardActive()) {
      lastTs.current = now;
      return;
    }

    const dt = lastTs.current == null ? 0 : now - lastTs.current;
    lastTs.current = now;

    if (!pitch) {
      setCents(null);
      holdMs.current = Math.max(0, holdMs.current - dt);
      setHoldProgress(holdMs.current / HOLD_TARGET_MS);
      onFrameRef.current?.({
        target,
        hz: null,
        clarity: null,
        cents: null,
        onTarget: false,
      });
      return;
    }

    const c = centsFromTarget(pitch.hz, target);
    setCents(c);

    const on = isOnTarget(pitch.hz, target);
    if (on) {
      holdMs.current += dt;
      samples.current.push(c);
    } else {
      holdMs.current = Math.max(0, holdMs.current - dt * 0.7);
    }
    setHoldProgress(Math.min(1, holdMs.current / HOLD_TARGET_MS));
    onFrameRef.current?.({
      target,
      hz: pitch.hz,
      clarity: pitch.clarity,
      cents: c,
      onTarget: on,
    });

    if (holdMs.current >= HOLD_TARGET_MS) {
      clearedRef.current = true;
      setHoldProgress(1);
      onClearedRef.current(scoreHold(samples.current));
    }
  }, [pitch, active, frozen, target]);

  return { cents, holdProgress, error, listening };
}
