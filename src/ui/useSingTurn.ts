// React hook: one singer's turn through a fixed note sequence (versus mode).
// Mount it for the duration of a turn; it resets on mount, scores each note,
// and calls `onDone(scores)` once the whole sequence is sung.

import { useCallback, useEffect, useRef, useState } from "react";
import { midiToHz } from "../engine/music";
import { totalScore } from "../engine/match";
import { playTone } from "../audio/tone";
import { CLEAR_PAUSE_MS, useNoteTracker } from "./useNoteTracker";

export function useSingTurn(
  sequence: number[],
  onDone: (scores: number[]) => void,
) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [done, setDone] = useState(false);

  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const target = done || index >= sequence.length ? null : sequence[index];

  // sound the target whenever it changes
  useEffect(() => {
    if (target != null) playTone(midiToHz(target), 900);
  }, [target]);

  // fire completion once we run off the end of the sequence
  useEffect(() => {
    if (!done && sequence.length > 0 && index >= sequence.length) {
      setDone(true);
      onDoneRef.current(scores);
    }
  }, [index, done, sequence.length, scores]);

  const handleCleared = useCallback((score: number) => {
    setScores((prev) => [...prev, score]);
    setLastScore(score);
    setFrozen(true);
    pauseTimer.current = setTimeout(() => {
      setFrozen(false);
      setLastScore(null);
      setIndex((i) => i + 1);
    }, CLEAR_PAUSE_MS);
  }, []);

  const { cents, holdProgress, error, listening } = useNoteTracker({
    target,
    active: true,
    frozen,
    onCleared: handleCleared,
  });

  // clean up a pending pause on unmount
  useEffect(() => {
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, []);

  return {
    index,
    count: sequence.length,
    target,
    cents,
    holdProgress,
    scores,
    lastScore,
    total: totalScore(scores),
    done,
    error,
    listening,
  };
}
