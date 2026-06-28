import { describe, it, expect } from "vitest";
import {
  hzToMidi,
  midiToHz,
  nearestMidi,
  midiToNoteName,
  noteNameToMidi,
  centsOff,
  centsFromTarget,
} from "./music";

describe("hz <-> midi", () => {
  it("anchors A4 at 440Hz / MIDI 69", () => {
    expect(hzToMidi(440)).toBeCloseTo(69, 6);
    expect(midiToHz(69)).toBeCloseTo(440, 6);
  });

  it("middle C is MIDI 60 ~261.63Hz", () => {
    expect(midiToHz(60)).toBeCloseTo(261.6256, 3);
    expect(nearestMidi(261.6256)).toBe(60);
  });

  it("round-trips arbitrary notes", () => {
    for (const m of [40, 55, 69, 72, 84]) {
      expect(hzToMidi(midiToHz(m))).toBeCloseTo(m, 6);
    }
  });
});

describe("note names", () => {
  it("formats scientific pitch notation", () => {
    expect(midiToNoteName(60)).toBe("C4");
    expect(midiToNoteName(69)).toBe("A4");
    expect(midiToNoteName(61)).toBe("C#4");
    expect(midiToNoteName(21)).toBe("A0");
  });

  it("parses note names back to MIDI", () => {
    expect(noteNameToMidi("C4")).toBe(60);
    expect(noteNameToMidi("A4")).toBe(69);
    expect(noteNameToMidi("C#4")).toBe(61);
    expect(noteNameToMidi("Db4")).toBe(61);
  });

  it("rejects garbage", () => {
    expect(() => noteNameToMidi("H9")).toThrow();
  });
});

describe("cents", () => {
  it("is zero exactly in tune", () => {
    expect(centsOff(440)).toBeCloseTo(0, 6);
    expect(centsFromTarget(440, 69)).toBeCloseTo(0, 6);
  });

  it("measures distance from a target note", () => {
    // a quarter-tone (~50 cents) sharp of A4
    const quarterToneSharp = midiToHz(69.5);
    expect(centsFromTarget(quarterToneSharp, 69)).toBeCloseTo(50, 3);
  });

  it("is negative when flat", () => {
    expect(centsFromTarget(midiToHz(68.8), 69)).toBeLessThan(0);
  });
});
