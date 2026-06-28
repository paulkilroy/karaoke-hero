// CEFR-style vocal proficiency ladder. There's no universal "CEFR for singing",
// so this is a 6-band ladder with objective, measurable gates (range span +
// pitch accuracy), loosely mapped to graded music-exam levels (ABRSM/RCM) for
// familiarity. Pure logic over the stats we actually capture.

export interface SkillStats {
  /** Measured range width in semitones (0 if never tested). */
  rangeSemitones: number;
  /** Best average note accuracy achieved, 0..100. */
  accuracy: number;
}

export interface Level {
  index: number; // 0..5
  cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  name: string;
  blurb: string;
  grade: string; // approx graded-exam equivalent
  /** Gates required to *reach* this band. */
  gate: { rangeSemitones: number; accuracy: number };
}

export const LEVELS: Level[] = [
  {
    index: 0,
    cefr: "A1",
    name: "Finding Your Voice",
    blurb: "Matching single notes and holding them briefly.",
    grade: "pre-Grade 1",
    gate: { rangeSemitones: 0, accuracy: 0 },
  },
  {
    index: 1,
    cefr: "A2",
    name: "On Pitch",
    blurb: "Hitting notes within a quarter-tone across an octave.",
    grade: "Grade 1–2",
    gate: { rangeSemitones: 12, accuracy: 60 },
  },
  {
    index: 2,
    cefr: "B1",
    name: "Steady Singer",
    blurb: "Accurate, stable sustains over a comfortable range.",
    grade: "Grade 3–4",
    gate: { rangeSemitones: 16, accuracy: 72 },
  },
  {
    index: 3,
    cefr: "B2",
    name: "Confident",
    blurb: "Tight pitch and a 1.6-octave range; smooth across the break.",
    grade: "Grade 5–6",
    gate: { rangeSemitones: 19, accuracy: 80 },
  },
  {
    index: 4,
    cefr: "C1",
    name: "Performer",
    blurb: "Two-octave range with controlled, expressive accuracy.",
    grade: "Grade 7–8",
    gate: { rangeSemitones: 24, accuracy: 88 },
  },
  {
    index: 5,
    cefr: "C2",
    name: "Virtuoso",
    blurb: "Pinpoint pitch across a wide, even range.",
    grade: "diploma",
    gate: { rangeSemitones: 28, accuracy: 94 },
  },
];

function meetsGate(stats: SkillStats, gate: Level["gate"]): boolean {
  return (
    stats.rangeSemitones >= gate.rangeSemitones && stats.accuracy >= gate.accuracy
  );
}

/** The highest band whose gate is satisfied. */
export function currentLevel(stats: SkillStats): Level {
  let level = LEVELS[0];
  for (const l of LEVELS) if (meetsGate(stats, l.gate)) level = l;
  return level;
}

export function nextLevel(stats: SkillStats): Level | null {
  const cur = currentLevel(stats);
  return LEVELS[cur.index + 1] ?? null;
}

export interface LevelProgress {
  current: Level;
  next: Level | null;
  /** 0..1 overall progress to the next band (min of the per-gate fractions). */
  fraction: number;
  /** Per-dimension progress toward the next gate, 0..1. */
  rangeFraction: number;
  accuracyFraction: number;
}

/** Progress from the current band toward the next, for the level ring. */
export function levelProgress(stats: SkillStats): LevelProgress {
  const current = currentLevel(stats);
  const next = nextLevel(stats);
  if (!next) {
    return {
      current,
      next: null,
      fraction: 1,
      rangeFraction: 1,
      accuracyFraction: 1,
    };
  }
  const span = (from: number, to: number, val: number) =>
    to <= from ? 1 : Math.max(0, Math.min(1, (val - from) / (to - from)));

  const rangeFraction = span(
    current.gate.rangeSemitones,
    next.gate.rangeSemitones,
    stats.rangeSemitones,
  );
  const accuracyFraction = span(
    current.gate.accuracy,
    next.gate.accuracy,
    stats.accuracy,
  );
  return {
    current,
    next,
    fraction: Math.min(rangeFraction, accuracyFraction),
    rangeFraction,
    accuracyFraction,
  };
}
