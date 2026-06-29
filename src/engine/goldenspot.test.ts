import { describe, it, expect } from "vitest";
import {
  zoneFromFlip,
  zoneNoteNames,
  levelMeter,
  sweepNotes,
  sweepSong,
} from "./goldenspot";
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

describe("sweepNotes", () => {
  it("ascends then descends through the centre", () => {
    expect(sweepNotes(64, 2)).toEqual([62, 63, 64, 65, 66, 65, 64, 63, 62]);
  });
  it("clamps to the singing window", () => {
    const s = sweepNotes(38, 7); // would go below floor 36
    expect(Math.min(...s)).toBe(36);
  });
});

describe("sweepSong", () => {
  it("wraps the sweep as a one-beat-per-note song", () => {
    const song = sweepSong(64, 2, "Ah");
    expect(song.notes).toHaveLength(9);
    expect(song.notes.every((n) => n.beats === 1)).toBe(true);
    expect(song.title).toContain("Ah");
  });
});
