// Pure music-theory helpers: frequency <-> MIDI <-> note name <-> cents.
// No DOM, no audio — fully unit-testable.

export const A4_HZ = 440;
export const A4_MIDI = 69;

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

/** Continuous MIDI number for a frequency (e.g. 440Hz -> 69.0). */
export function hzToMidi(hz: number): number {
  return A4_MIDI + 12 * Math.log2(hz / A4_HZ);
}

/** Frequency in Hz for a (possibly fractional) MIDI number. */
export function midiToHz(midi: number): number {
  return A4_HZ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/** Nearest integer MIDI note for a frequency. */
export function nearestMidi(hz: number): number {
  return Math.round(hzToMidi(hz));
}

/** Scientific-pitch note name for an integer MIDI number (60 -> "C4"). */
export function midiToNoteName(midi: number): string {
  const m = Math.round(midi);
  const name = NOTE_NAMES[((m % 12) + 12) % 12];
  const octave = Math.floor(m / 12) - 1;
  return `${name}${octave}`;
}

/** Parse a note name like "A4" / "C#3" into an integer MIDI number. */
export function noteNameToMidi(note: string): number {
  const match = /^([A-G])(#|b)?(-?\d+)$/.exec(note.trim());
  if (!match) throw new Error(`Invalid note name: ${note}`);
  const [, letter, accidental, octaveStr] = match;
  let semitone = NOTE_NAMES.indexOf(letter as (typeof NOTE_NAMES)[number]);
  if (accidental === "#") semitone += 1;
  if (accidental === "b") semitone -= 1;
  const octave = parseInt(octaveStr, 10);
  return (octave + 1) * 12 + semitone;
}

/** Signed cents the frequency sits away from its nearest semitone (-50..+50). */
export function centsOff(hz: number): number {
  const midi = hzToMidi(hz);
  return (midi - Math.round(midi)) * 100;
}

/** Signed cents the frequency sits away from a specific target MIDI note. */
export function centsFromTarget(hz: number, targetMidi: number): number {
  return 1200 * Math.log2(hz / midiToHz(targetMidi));
}
