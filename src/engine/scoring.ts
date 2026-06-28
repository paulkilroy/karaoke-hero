// Pitch-accuracy scoring. Pure functions over cents deviations.

import { centsFromTarget } from "./music";

export type Grade = "perfect" | "good" | "close" | "off";

/** Tolerance bands (absolute cents) used for grading a single instant. */
export const GRADE_BANDS = {
  perfect: 15,
  good: 35,
  close: 70,
} as const;

/** Grade a single cents deviation. */
export function gradeCents(cents: number): Grade {
  const a = Math.abs(cents);
  if (a <= GRADE_BANDS.perfect) return "perfect";
  if (a <= GRADE_BANDS.good) return "good";
  if (a <= GRADE_BANDS.close) return "close";
  return "off";
}

/** Continuous 0..1 accuracy for one instant — 1 in tune, fading to 0 at 100c. */
export function instantAccuracy(cents: number): number {
  const a = Math.abs(cents);
  if (a >= 100) return 0;
  return 1 - a / 100;
}

/** Whether a sung frequency counts as "on the note" for hold purposes. */
export function isOnTarget(hz: number, targetMidi: number): boolean {
  return Math.abs(centsFromTarget(hz, targetMidi)) <= GRADE_BANDS.good;
}

/**
 * Score a completed attempt at holding a target note.
 * `centsSamples` are the per-frame deviations captured while the note was held.
 * Returns 0..100 — average instant accuracy, lightly rewarded for steadiness.
 */
export function scoreHold(centsSamples: readonly number[]): number {
  if (centsSamples.length === 0) return 0;
  const accs = centsSamples.map(instantAccuracy);
  const mean = accs.reduce((s, a) => s + a, 0) / accs.length;

  // Steadiness bonus: less variance in pitch -> up to +10%.
  const variance =
    accs.reduce((s, a) => s + (a - mean) ** 2, 0) / accs.length;
  const steadiness = 1 - Math.min(1, Math.sqrt(variance) * 2);

  return Math.round(Math.min(100, mean * 100 * (1 + 0.1 * steadiness)));
}

/** Streak multiplier for gamification (caps at 4x). */
export function streakMultiplier(streak: number): number {
  return Math.min(4, 1 + Math.floor(streak / 3) * 0.5);
}
