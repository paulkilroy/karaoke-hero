// Exercise/drill definitions. Pure: given inputs (and an injected RNG where
// randomness is needed) they produce target-note sequences to sing.

import { noteNameToMidi } from "./music";

/**
 * A comfortable default singing range (A2–E4) — centred lower so targets sit
 * in a typical untrained range rather than up in the high register. The proper
 * per-singer range comes from the Phase-3 range test.
 */
export const DEFAULT_RANGE = {
  low: noteNameToMidi("A2"), // 45
  high: noteNameToMidi("E4"), // 64
};

/** Major-scale semitone offsets from the root. */
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];

/** Ascending major scale (one octave) from a root MIDI note. */
export function majorScale(rootMidi: number): number[] {
  return MAJOR_STEPS.map((s) => rootMidi + s);
}

/**
 * A randomised pitch-matching sequence within [low, high].
 * `rng` defaults to Math.random but can be injected for deterministic tests.
 */
export function pitchMatchSequence(
  count: number,
  range: { low: number; high: number } = DEFAULT_RANGE,
  rng: () => number = Math.random,
): number[] {
  const span = range.high - range.low;
  const out: number[] = [];
  let prev = -1;
  for (let i = 0; i < count; i++) {
    let note = range.low + Math.round(rng() * span);
    // avoid immediate repeats so the drill keeps moving
    if (note === prev && span > 0) {
      note = note === range.high ? note - 1 : note + 1;
    }
    out.push(note);
    prev = note;
  }
  return out;
}
