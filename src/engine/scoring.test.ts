import { describe, it, expect } from "vitest";
import {
  gradeCents,
  instantAccuracy,
  isOnTarget,
  scoreHold,
  streakMultiplier,
} from "./scoring";
import { midiToHz } from "./music";

describe("gradeCents", () => {
  it("bands by absolute deviation", () => {
    expect(gradeCents(0)).toBe("perfect");
    expect(gradeCents(-12)).toBe("perfect");
    expect(gradeCents(30)).toBe("good");
    expect(gradeCents(-60)).toBe("close");
    expect(gradeCents(90)).toBe("off");
  });
});

describe("instantAccuracy", () => {
  it("is 1 in tune and 0 beyond a semitone", () => {
    expect(instantAccuracy(0)).toBe(1);
    expect(instantAccuracy(100)).toBe(0);
    expect(instantAccuracy(150)).toBe(0);
    expect(instantAccuracy(50)).toBeCloseTo(0.5, 6);
  });
});

describe("isOnTarget", () => {
  it("accepts pitch within the good band of the target note", () => {
    expect(isOnTarget(midiToHz(69), 69)).toBe(true);
    expect(isOnTarget(midiToHz(69.2), 69)).toBe(true); // ~20c
    expect(isOnTarget(midiToHz(69.5), 69)).toBe(false); // ~50c
  });
});

describe("scoreHold", () => {
  it("is 0 for an empty attempt", () => {
    expect(scoreHold([])).toBe(0);
  });

  it("rewards a steady in-tune hold near 100", () => {
    const score = scoreHold([2, -3, 1, 0, -1]);
    expect(score).toBeGreaterThan(90);
  });

  it("penalises a wandering attempt", () => {
    const score = scoreHold([80, -90, 40, -70, 95]);
    expect(score).toBeLessThan(40);
  });
});

describe("streakMultiplier", () => {
  it("ramps every 3 and caps at 4x", () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(3)).toBe(1.5);
    expect(streakMultiplier(6)).toBe(2);
    expect(streakMultiplier(99)).toBe(4);
  });
});
