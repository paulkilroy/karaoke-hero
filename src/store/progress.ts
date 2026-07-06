// Local persistence (localStorage). Stores the singer's measured range over
// time and per-session accuracy so the Progress screen can chart improvement
// and the level engine can grade it. Browser side-effect layer — kept thin and
// defensive so the app still runs if storage is unavailable.

export interface RangeEntry {
  at: number; // epoch ms
  low: number; // MIDI
  high: number; // MIDI
}

export interface SessionEntry {
  at: number;
  type: string; // 'practice' | 'creeping-scale' | 'edge-stretch' | 'siren' | ...
  avgScore: number; // 0..100 average note accuracy
  notes: number; // notes cleared this session
}

export interface Progress {
  /** Current personalised range (from the latest range test). */
  range: { low: number; high: number } | null;
  rangeHistory: RangeEntry[];
  sessions: SessionEntry[];
  /** Saved vocal "golden spot": the flip note and the struck spot (MIDI). */
  goldenSpot: { flip: number; spot: number } | null;
}

export interface ProgressStats {
  range: { low: number; high: number } | null;
  rangeSemitones: number;
  /** Best average accuracy across sessions (0..100). */
  bestAccuracy: number;
  /** Recent average accuracy (last 5 sessions). */
  recentAccuracy: number;
  totalSessions: number;
  totalNotes: number;
}

const KEY = "karaoke-hero.progress.v1";

// Only pitch-matched drills feed the accuracy grade; warm-ups (siren/SOVT) count
// as practice volume but shouldn't inflate proficiency.
const ACCURACY_TYPES = new Set(["practice", "creeping-scale", "edge-stretch"]);

const EMPTY: Progress = {
  range: null,
  rangeHistory: [],
  sessions: [],
  goldenSpot: null,
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      range: parsed.range ?? null,
      rangeHistory: parsed.rangeHistory ?? [],
      sessions: parsed.sessions ?? [],
      goldenSpot: parsed.goldenSpot ?? null,
    };
  } catch {
    return { ...EMPTY };
  }
}

function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore (private mode / quota)
  }
}

/** Record a range-test result; updates the current range and appends history. */
export function recordRange(low: number, high: number, at: number): Progress {
  const p = loadProgress();
  const next: Progress = {
    ...p,
    range: { low, high },
    rangeHistory: [...p.rangeHistory, { at, low, high }].slice(-100),
  };
  save(next);
  return next;
}

/** Record a finished practice/drill session. */
export function recordSession(
  type: string,
  avgScore: number,
  notes: number,
  at: number,
): Progress {
  const p = loadProgress();
  const next: Progress = {
    ...p,
    sessions: [...p.sessions, { type, avgScore, notes, at }].slice(-300),
  };
  save(next);
  return next;
}

export function resetProgress(): void {
  save({ ...EMPTY });
}

export function recordGoldenSpot(flip: number, spot: number): Progress {
  const p = loadProgress();
  const next: Progress = { ...p, goldenSpot: { flip, spot } };
  save(next);
  return next;
}

export function getGoldenSpot(): { flip: number; spot: number } | null {
  return loadProgress().goldenSpot;
}

/** The current personalised range, if a test has been taken. */
export function getStoredRange(): { low: number; high: number } | null {
  return loadProgress().range;
}

/** All activity timestamps (sessions + range tests) for streak calculation. */
export function activityTimestamps(p: Progress): number[] {
  return [...p.sessions.map((s) => s.at), ...p.rangeHistory.map((r) => r.at)];
}

export function summarize(p: Progress): ProgressStats {
  const accuracyScores = p.sessions
    .filter((s) => ACCURACY_TYPES.has(s.type))
    .map((s) => s.avgScore);
  const recent = accuracyScores.slice(-5);
  const mean = (xs: number[]) =>
    xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
  return {
    range: p.range,
    rangeSemitones: p.range ? p.range.high - p.range.low : 0,
    bestAccuracy: accuracyScores.length ? Math.max(...accuracyScores) : 0,
    recentAccuracy: Math.round(mean(recent)),
    totalSessions: p.sessions.length,
    totalNotes: p.sessions.reduce((s, x) => s + x.notes, 0),
  };
}
