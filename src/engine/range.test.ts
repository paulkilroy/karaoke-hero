import { describe, it, expect } from "vitest";
import {
  spanSemitones,
  spanOctaves,
  tessitura,
  classifyVoice,
  creepingScale,
  edgeStretch,
  sirenContour,
} from "./range";
import { noteNameToMidi } from "./music";

const R = (lo: string, hi: string) => ({
  low: noteNameToMidi(lo),
  high: noteNameToMidi(hi),
});

describe("span", () => {
  it("measures semitones and octaves", () => {
    expect(spanSemitones(R("C3", "C5"))).toBe(24);
    expect(spanOctaves(R("C3", "C5"))).toBe(2);
    expect(spanSemitones({ low: 60, high: 50 })).toBe(0); // never negative
  });
});

describe("tessitura", () => {
  it("insets from the extremes", () => {
    const t = tessitura(R("C3", "C5")); // 24 semis → inset 3
    expect(t.low).toBe(noteNameToMidi("C3") + 3);
    expect(t.high).toBe(noteNameToMidi("C5") - 3);
  });
});

describe("classifyVoice", () => {
  it("returns Unknown for a too-narrow range", () => {
    expect(classifyVoice(R("C4", "E4"))).toBe("Unknown");
  });
  it("matches canonical ranges", () => {
    expect(classifyVoice(R("E2", "E4"))).toBe("Bass");
    expect(classifyVoice(R("C3", "C5"))).toBe("Tenor");
    expect(classifyVoice(R("C4", "C6"))).toBe("Soprano");
  });
});

describe("creepingScale", () => {
  it("ladders the pattern root by a semitone each rep", () => {
    const notes = creepingScale([0, 2, 4], 60, 3, 1);
    expect(notes).toEqual([60, 62, 64, 61, 63, 65, 62, 64, 66]);
  });
  it("descends with dir -1", () => {
    const notes = creepingScale([0, 2], 60, 2, -1);
    expect(notes).toEqual([60, 62, 59, 61]);
  });
});

describe("edgeStretch", () => {
  it("ramps just past the high edge", () => {
    const notes = edgeStretch({ low: 48, high: 64 }, "high", 2);
    expect(notes[0]).toBe(62);
    expect(notes[notes.length - 1]).toBe(66);
  });
  it("ramps just past the low edge (descending)", () => {
    const notes = edgeStretch({ low: 48, high: 64 }, "low", 2);
    expect(notes[0]).toBe(50);
    expect(notes[notes.length - 1]).toBe(46);
  });
});

describe("sirenContour", () => {
  it("interpolates endpoints inclusively", () => {
    const c = sirenContour(48, 60, 13);
    expect(c[0]).toBe(48);
    expect(c[c.length - 1]).toBe(60);
    expect(c[6]).toBeCloseTo(54, 6);
  });
});
