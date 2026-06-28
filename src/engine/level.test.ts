import { describe, it, expect } from "vitest";
import { currentLevel, nextLevel, levelProgress, LEVELS } from "./level";

describe("currentLevel", () => {
  it("starts at A1 with no data", () => {
    expect(currentLevel({ rangeSemitones: 0, accuracy: 0 }).cefr).toBe("A1");
  });

  it("requires BOTH range and accuracy gates", () => {
    // octave range but weak accuracy → still A1
    expect(currentLevel({ rangeSemitones: 12, accuracy: 40 }).cefr).toBe("A1");
    // both met → A2
    expect(currentLevel({ rangeSemitones: 12, accuracy: 60 }).cefr).toBe("A2");
  });

  it("climbs to the highest satisfied band", () => {
    expect(currentLevel({ rangeSemitones: 24, accuracy: 88 }).cefr).toBe("C1");
    expect(currentLevel({ rangeSemitones: 30, accuracy: 96 }).cefr).toBe("C2");
  });
});

describe("nextLevel", () => {
  it("points one rung up, null at the top", () => {
    expect(nextLevel({ rangeSemitones: 0, accuracy: 0 })?.cefr).toBe("A2");
    expect(nextLevel({ rangeSemitones: 30, accuracy: 96 })).toBeNull();
  });
});

describe("levelProgress", () => {
  it("is the min of the per-gate fractions", () => {
    // from A1(0,0) toward A2(12,60): range 6/12=0.5, accuracy 30/60=0.5
    const p = levelProgress({ rangeSemitones: 6, accuracy: 30 });
    expect(p.current.cefr).toBe("A1");
    expect(p.next?.cefr).toBe("A2");
    expect(p.rangeFraction).toBeCloseTo(0.5, 6);
    expect(p.accuracyFraction).toBeCloseTo(0.5, 6);
    expect(p.fraction).toBeCloseTo(0.5, 6);
  });

  it("bottlenecks on the weaker dimension", () => {
    // range way ahead, accuracy lagging → fraction tracks accuracy
    const p = levelProgress({ rangeSemitones: 12, accuracy: 30 });
    expect(p.fraction).toBeCloseTo(0.5, 6);
  });

  it("is full at the top band", () => {
    const p = levelProgress({ rangeSemitones: 40, accuracy: 100 });
    expect(p.current).toBe(LEVELS[LEVELS.length - 1]);
    expect(p.next).toBeNull();
    expect(p.fraction).toBe(1);
  });
});
