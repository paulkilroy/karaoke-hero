// Pure vocal-range logic: span maths, rough voice-type classification, and
// generators for the range-extension drills. No DOM/audio — fully testable.

import { noteNameToMidi } from "./music";

export interface VocalRange {
  low: number; // MIDI
  high: number; // MIDI
}

export function spanSemitones(r: VocalRange): number {
  return Math.max(0, r.high - r.low);
}

export function spanOctaves(r: VocalRange): number {
  return spanSemitones(r) / 12;
}

/**
 * The comfortable inner range — inset from each extreme, since the very edges
 * are rarely usable for actual singing. This is what should drive song choice.
 */
export function tessitura(r: VocalRange): VocalRange {
  const inset = Math.min(3, Math.floor(spanSemitones(r) / 4));
  return { low: r.low + inset, high: r.high - inset };
}

export type VoiceType =
  | "Bass"
  | "Baritone"
  | "Tenor"
  | "Alto"
  | "Mezzo-Soprano"
  | "Soprano"
  | "Unknown";

// Canonical reference ranges (MIDI) for nearest-match classification.
const REFERENCES: { type: VoiceType; low: number; high: number }[] = [
  { type: "Bass", low: noteNameToMidi("E2"), high: noteNameToMidi("E4") },
  { type: "Baritone", low: noteNameToMidi("A2"), high: noteNameToMidi("A4") },
  { type: "Tenor", low: noteNameToMidi("C3"), high: noteNameToMidi("C5") },
  { type: "Alto", low: noteNameToMidi("F3"), high: noteNameToMidi("F5") },
  { type: "Mezzo-Soprano", low: noteNameToMidi("A3"), high: noteNameToMidi("A5") },
  { type: "Soprano", low: noteNameToMidi("C4"), high: noteNameToMidi("C6") },
];

/**
 * A rough voice-type hint from a measured range (nearest reference by combined
 * low+high distance). Returns "Unknown" until the range is wide enough to mean
 * anything. This is a hint, not a classification — true voice type needs timbre.
 */
export function classifyVoice(r: VocalRange): VoiceType {
  if (spanSemitones(r) < 7) return "Unknown";
  let best: VoiceType = "Unknown";
  let bestDist = Infinity;
  for (const ref of REFERENCES) {
    const dist = Math.abs(r.low - ref.low) + Math.abs(r.high - ref.high);
    if (dist < bestDist) {
      bestDist = dist;
      best = ref.type;
    }
  }
  return best;
}

/** Clamp a generated note list to a sane singing window. */
function clampNotes(notes: number[], floor = 36, ceil = 84): number[] {
  return notes.filter((n) => n >= floor && n <= ceil);
}

/**
 * Creeping scale: repeat a short relative pattern, shifting its root by a
 * semitone each rep, laddering toward an edge. Classic vocalise for extension.
 */
export function creepingScale(
  pattern: number[],
  startRoot: number,
  steps: number,
  dir: 1 | -1,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    const root = startRoot + dir * i;
    for (const p of pattern) out.push(root + p);
  }
  return clampNotes(out);
}

/**
 * Edge-stretch targets: a short ramp ending just past the current edge, to
 * gently push the boundary. `dir` 'high' pushes the ceiling, 'low' the floor.
 */
export function edgeStretch(
  r: VocalRange,
  dir: "low" | "high",
  beyond = 3,
): number[] {
  const out: number[] = [];
  if (dir === "high") {
    for (let n = r.high - 2; n <= r.high + beyond; n++) out.push(n);
  } else {
    for (let n = r.low + 2; n >= r.low - beyond; n--) out.push(n);
  }
  return clampNotes(out);
}

/** A glide contour (MIDI points) from one note to another, for siren drills. */
export function sirenContour(from: number, to: number, points = 32): number[] {
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = points === 1 ? 0 : i / (points - 1);
    out.push(from + (to - from) * t);
  }
  return out;
}
