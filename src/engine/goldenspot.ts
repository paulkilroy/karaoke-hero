// "Golden spot" (vocal sweet spot, per Chris Liepe) helpers. The spot lives in
// the passaggio: from the note where the voice wants to flip, the zone is the 3
// notes below, the flip, and the 3 above (7 notes), centred on the flip.

import { midiToNoteName } from "./music";
import { type Song } from "./song";

export interface GoldenZone {
  /** The note where the voice flips into head voice. */
  flip: number;
  /** The 7-note transitional zone (flip-3 .. flip+3). */
  notes: number[];
  /** The middle of the zone — where you strike the spot. */
  middle: number;
}

export function zoneFromFlip(flip: number): GoldenZone {
  const notes = [-3, -2, -1, 0, 1, 2, 3].map((d) => flip + d);
  return { flip, notes, middle: flip };
}

export function zoneNoteNames(zone: GoldenZone): string[] {
  return zone.notes.map(midiToNoteName);
}

/** Normalise raw RMS loudness to a 0..1 meter value for display. */
export function levelMeter(rms: number): number {
  return Math.max(0, Math.min(1, rms * 4));
}

const FLOOR = 36;
const CEIL = 84;

/**
 * A sweep through the passaggio centred on `spot`: ascend from spot-span to
 * spot+span, then descend back. Clamped to a sane singing window so it stays
 * contiguous. This is the "below → above → back" bridge drill.
 */
export function sweepNotes(spot: number, span: number): number[] {
  const lo = Math.max(FLOOR, spot - span);
  const hi = Math.min(CEIL, spot + span);
  const up: number[] = [];
  for (let n = lo; n <= hi; n++) up.push(n);
  const down: number[] = [];
  for (let n = hi - 1; n >= lo; n--) down.push(n);
  return [...up, ...down];
}

/** Build the sweep as a playable Song (one beat per note) for the highway. */
export function sweepSong(spot: number, span: number, vowel: string, bpm = 88): Song {
  return {
    id: "golden-sweep",
    title: `Golden Sweep · ${vowel}`,
    bpm,
    notes: sweepNotes(spot, span).map((midi) => ({ midi, beats: 1 })),
  };
}
