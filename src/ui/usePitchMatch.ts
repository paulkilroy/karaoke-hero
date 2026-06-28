// React hook: the solo pitch-matching drill. Streams targets, scores each
// sustained hold (via the shared note tracker), tracks streak/XP, and inserts
// a short celebration beat between notes.

import { useCallback, useEffect, useRef, useState } from "react";
import { instantAccuracy, streakMultiplier } from "../engine/scoring";
import { DEFAULT_RANGE, pitchMatchSequence } from "../engine/exercises";
import { midiToHz } from "../engine/music";
import { playTone } from "../audio/tone";
import { getStoredRange, recordSession } from "../store/progress";
import { CLEAR_PAUSE_MS, useNoteTracker } from "./useNoteTracker";

export function usePitchMatch(active: boolean) {
  const [target, setTarget] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [cleared, setCleared] = useState(0);
  /** Score of the just-cleared note while the celebration beat plays. */
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [frozen, setFrozen] = useState(false);

  const queue = useRef<number[]>([]);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionScores = useRef<number[]>([]);
  // Tailor targets to the singer's measured range (falls back to default).
  const range = useRef(getStoredRange() ?? DEFAULT_RANGE);

  const nextTarget = useCallback(() => {
    if (queue.current.length === 0) {
      queue.current = pitchMatchSequence(12, range.current);
    }
    const next = queue.current.shift()!;
    setTarget(next);
    playTone(midiToHz(next), 900);
  }, []);

  const handleCleared = useCallback(
    (score: number) => {
      sessionScores.current.push(score);
      setStreak((s) => {
        const ns = s + 1;
        setXp((x) => x + Math.round(score * streakMultiplier(s)));
        setBest((b) => Math.max(b, score));
        return ns;
      });
      setCleared((n) => n + 1);
      setLastScore(score);
      setFrozen(true);
      pauseTimer.current = setTimeout(() => {
        setFrozen(false);
        setLastScore(null);
        nextTarget();
      }, CLEAR_PAUSE_MS);
    },
    [nextTarget],
  );

  const { cents, holdProgress, error, listening } = useNoteTracker({
    target,
    active,
    frozen,
    onCleared: handleCleared,
  });

  // (re)start the drill whenever it becomes active
  useEffect(() => {
    if (!active) return;
    range.current = getStoredRange() ?? DEFAULT_RANGE;
    queue.current = pitchMatchSequence(12, range.current);
    sessionScores.current = [];
    setStreak(0);
    setXp(0);
    setCleared(0);
    setLastScore(null);
    setFrozen(false);
    nextTarget();
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      // record the session on stop/unmount so it feeds Progress
      const s = sessionScores.current;
      if (s.length) {
        const avg = Math.round(s.reduce((a, b) => a + b, 0) / s.length);
        recordSession("practice", avg, s.length, Date.now());
      }
    };
  }, [active, nextTarget]);

  const skip = useCallback(() => {
    setStreak(0);
    nextTarget();
  }, [nextTarget]);

  const replayTone = useCallback(() => {
    if (target != null) playTone(midiToHz(target), 900);
  }, [target]);

  const accuracy = cents == null ? 0 : instantAccuracy(cents);

  return {
    target,
    cents,
    holdProgress,
    streak,
    best,
    xp,
    cleared,
    lastScore,
    accuracy,
    error,
    listening,
    skip,
    replayTone,
  };
}
