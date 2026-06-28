// Versus-match logic. Pure & deterministic so the same note sequence can be
// reproduced for both singers (and, later, across two networked clients).
// This is the headless model an online layer (Supabase, à la Tongits) can drive.

import { pitchMatchSequence, DEFAULT_RANGE } from "./exercises";

export type PlayerId = "a" | "b";
export type Winner = PlayerId | "tie";

export interface MatchConfig {
  noteCount: number;
  /** Shared seed — both singers get the identical note sequence. */
  seed: number;
  range?: { low: number; high: number };
}

/** Deterministic PRNG (mulberry32) — same seed ⇒ same stream. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The shared target-note sequence both singers will attempt. */
export function matchSequence(config: MatchConfig): number[] {
  return pitchMatchSequence(
    config.noteCount,
    config.range ?? DEFAULT_RANGE,
    makeRng(config.seed),
  );
}

/** Sum of per-note scores. */
export function totalScore(scores: readonly number[]): number {
  return scores.reduce((sum, s) => sum + s, 0);
}

/** Decide the winner from two totals. */
export function decideWinner(aTotal: number, bTotal: number): Winner {
  if (aTotal > bTotal) return "a";
  if (bTotal > aTotal) return "b";
  return "tie";
}

/** 0–3 stars from a singer's average per-note accuracy. */
export function starsFor(scores: readonly number[]): number {
  if (scores.length === 0) return 0;
  const avg = totalScore(scores) / scores.length;
  if (avg >= 85) return 3;
  if (avg >= 65) return 2;
  if (avg >= 40) return 1;
  return 0;
}
