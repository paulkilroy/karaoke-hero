// Built-in songs. Amazing Grace is public domain. Encoded in D major for a
// comfortable range (~B3–F#4); beats are in 3/4 feel. Tweak freely.

import { noteNameToMidi } from "./music";
import { type Song } from "./song";

const n = (name: string, beats: number, lyric?: string) => ({
  midi: noteNameToMidi(name),
  beats,
  lyric,
});

export const AMAZING_GRACE: Song = {
  id: "amazing-grace",
  title: "Amazing Grace",
  composer: "Trad. (John Newton)",
  bpm: 92,
  notes: [
    n("A3", 1, "A"),
    n("D4", 2, "ma"),
    n("F#4", 1, "zing"),
    n("D4", 2, "grace"),
    n("F#4", 1, "how"),
    n("E4", 1, "sweet"),
    n("D4", 1, "the"),
    n("B3", 3, "sound"),
    n("A3", 1, "that"),
    n("D4", 2, "saved"),
    n("F#4", 1, "a"),
    n("D4", 2, "wretch"),
    n("B3", 1, "like"),
    n("A3", 3, "me"),
  ],
};

export const SONGS: Song[] = [AMAZING_GRACE];
