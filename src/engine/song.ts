// Song model + timeline maths for the scrolling note highway. Pure & testable.

import { scoreHold } from "./scoring";
import { centsFromTarget } from "./music";

export interface SongNote {
  midi: number;
  beats: number;
  lyric?: string;
}

export interface Song {
  id: string;
  title: string;
  composer?: string;
  bpm: number;
  notes: SongNote[];
}

/** A note placed on an absolute millisecond timeline. */
export interface TimedNote {
  index: number;
  midi: number;
  start: number; // ms
  end: number; // ms
  lyric?: string;
}

/** Convert a song's beat-based notes into an absolute ms timeline. */
export function buildTimeline(song: Song): TimedNote[] {
  const beatMs = 60000 / song.bpm;
  let t = 0;
  return song.notes.map((n, index) => {
    const start = t;
    const end = t + n.beats * beatMs;
    t = end;
    return { index, midi: n.midi, start, end, lyric: n.lyric };
  });
}

export function songDurationMs(notes: TimedNote[]): number {
  return notes.length ? notes[notes.length - 1].end : 0;
}

/** The note sounding at time t (ms), or null in a gap/at the ends. */
export function activeNoteAt(notes: TimedNote[], t: number): TimedNote | null {
  for (const n of notes) {
    if (t >= n.start && t < n.end) return n;
  }
  return null;
}

/** Min/max MIDI across the song, for the highway's vertical scale. */
export function songPitchRange(song: Song): { min: number; max: number } {
  if (song.notes.length === 0) return { min: 57, max: 69 };
  let min = Infinity;
  let max = -Infinity;
  for (const n of song.notes) {
    if (n.midi < min) min = n.midi;
    if (n.midi > max) max = n.midi;
  }
  return { min, max };
}

/** Score one note from the cents deviations sampled while it was active. */
export function scoreNote(centsSamples: readonly number[]): number {
  return scoreHold(centsSamples);
}

/** Cents the sung frequency sits from a note (re-exported convenience). */
export function centsForNote(hz: number, midi: number): number {
  return centsFromTarget(hz, midi);
}

/** Overall song score (0..100) as the mean of per-note scores. */
export function songScore(noteScores: readonly number[]): number {
  if (noteScores.length === 0) return 0;
  return Math.round(
    noteScores.reduce((s, x) => s + x, 0) / noteScores.length,
  );
}
