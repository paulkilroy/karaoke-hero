import { describe, it, expect } from "vitest";
import { zoneFromFlip, zoneNoteNames, levelMeter } from "./goldenspot";
import { noteNameToMidi } from "./music";

describe("zoneFromFlip", () => {
  it("builds a 7-note zone centred on the flip", () => {
    const z = zoneFromFlip(noteNameToMidi("E4")); // 64
    expect(z.notes).toEqual([61, 62, 63, 64, 65, 66, 67]);
    expect(z.middle).toBe(64);
  });

  it("names the zone notes", () => {
    const z = zoneFromFlip(noteNameToMidi("E4"));
    expect(zoneNoteNames(z)).toEqual([
      "C#4",
      "D4",
      "D#4",
      "E4",
      "F4",
      "F#4",
      "G4",
    ]);
  });
});

describe("levelMeter", () => {
  it("clamps RMS to 0..1", () => {
    expect(levelMeter(0)).toBe(0);
    expect(levelMeter(0.25)).toBe(1);
    expect(levelMeter(1)).toBe(1);
    expect(levelMeter(0.1)).toBeCloseTo(0.4, 6);
  });
});
