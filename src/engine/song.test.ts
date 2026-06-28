import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  songDurationMs,
  activeNoteAt,
  songPitchRange,
  songScore,
  type Song,
} from "./song";

const SONG: Song = {
  id: "t",
  title: "Test",
  bpm: 120, // 1 beat = 500ms
  notes: [
    { midi: 60, beats: 1 },
    { midi: 62, beats: 2 },
    { midi: 64, beats: 1 },
  ],
};

describe("buildTimeline", () => {
  it("lays notes on an absolute ms timeline", () => {
    const tl = buildTimeline(SONG);
    expect(tl[0]).toMatchObject({ start: 0, end: 500, midi: 60 });
    expect(tl[1]).toMatchObject({ start: 500, end: 1500, midi: 62 });
    expect(tl[2]).toMatchObject({ start: 1500, end: 2000, midi: 64 });
  });

  it("reports total duration", () => {
    expect(songDurationMs(buildTimeline(SONG))).toBe(2000);
  });
});

describe("activeNoteAt", () => {
  const tl = buildTimeline(SONG);
  it("finds the note sounding at a time", () => {
    expect(activeNoteAt(tl, 0)?.midi).toBe(60);
    expect(activeNoteAt(tl, 700)?.midi).toBe(62);
    expect(activeNoteAt(tl, 1500)?.midi).toBe(64);
  });
  it("is null past the end", () => {
    expect(activeNoteAt(tl, 5000)).toBeNull();
  });
});

describe("songPitchRange", () => {
  it("spans min..max midi", () => {
    expect(songPitchRange(SONG)).toEqual({ min: 60, max: 64 });
  });
});

describe("songScore", () => {
  it("averages per-note scores", () => {
    expect(songScore([100, 80, 90])).toBe(90);
    expect(songScore([])).toBe(0);
  });
});
