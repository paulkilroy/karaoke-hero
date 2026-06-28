import { describe, it, expect } from "vitest";
import {
  makeRng,
  matchSequence,
  totalScore,
  decideWinner,
  starsFor,
} from "./match";

describe("makeRng", () => {
  it("is deterministic for a seed", () => {
    const a = makeRng(123);
    const b = makeRng(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs across seeds", () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });
});

describe("matchSequence", () => {
  it("gives both singers the identical sequence for one seed", () => {
    const cfg = { noteCount: 8, seed: 999 };
    expect(matchSequence(cfg)).toEqual(matchSequence(cfg));
  });

  it("honours the requested length", () => {
    expect(matchSequence({ noteCount: 6, seed: 1 })).toHaveLength(6);
  });
});

describe("totalScore", () => {
  it("sums per-note scores", () => {
    expect(totalScore([10, 20, 30])).toBe(60);
    expect(totalScore([])).toBe(0);
  });
});

describe("decideWinner", () => {
  it("picks the higher total, or a tie", () => {
    expect(decideWinner(300, 200)).toBe("a");
    expect(decideWinner(100, 250)).toBe("b");
    expect(decideWinner(150, 150)).toBe("tie");
  });
});

describe("starsFor", () => {
  it("bands by average accuracy", () => {
    expect(starsFor([])).toBe(0);
    expect(starsFor([90, 88, 92])).toBe(3);
    expect(starsFor([70, 66, 68])).toBe(2);
    expect(starsFor([45, 41, 50])).toBe(1);
    expect(starsFor([10, 20, 5])).toBe(0);
  });
});
