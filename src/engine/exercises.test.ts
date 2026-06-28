import { describe, it, expect } from "vitest";
import { majorScale, pitchMatchSequence, DEFAULT_RANGE } from "./exercises";
import { midiToNoteName, noteNameToMidi } from "./music";

describe("majorScale", () => {
  it("builds a C major octave", () => {
    const scale = majorScale(noteNameToMidi("C4")).map(midiToNoteName);
    expect(scale).toEqual(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]);
  });
});

describe("pitchMatchSequence", () => {
  it("returns the requested count within range", () => {
    const seq = pitchMatchSequence(20, DEFAULT_RANGE, () => 0.5);
    expect(seq).toHaveLength(20);
    for (const n of seq) {
      expect(n).toBeGreaterThanOrEqual(DEFAULT_RANGE.low);
      expect(n).toBeLessThanOrEqual(DEFAULT_RANGE.high);
    }
  });

  it("avoids immediate repeats", () => {
    // constant rng would repeat the same note; generator must nudge it
    const seq = pitchMatchSequence(5, DEFAULT_RANGE, () => 0.3);
    for (let i = 1; i < seq.length; i++) {
      expect(seq[i]).not.toBe(seq[i - 1]);
    }
  });

  it("is deterministic for a given rng", () => {
    const rng = mulberry32(42);
    const rng2 = mulberry32(42);
    expect(pitchMatchSequence(10, DEFAULT_RANGE, rng)).toEqual(
      pitchMatchSequence(10, DEFAULT_RANGE, rng2),
    );
  });
});

// tiny seeded PRNG for deterministic tests
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
