// Daily practice streak from activity timestamps. Pure & testable. A "day" is a
// local calendar day; the streak counts consecutive days with any activity,
// still alive if you practised today or yesterday.

const DAY = 86400000;

/** Local-calendar day index (days since epoch at local midnight). */
export function dayIndex(ms: number): number {
  const d = new Date(ms);
  return Math.round(
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY,
  );
}

export interface StreakInfo {
  /** Consecutive active days ending today (or yesterday). */
  current: number;
  /** Best consecutive run ever. */
  longest: number;
  practicedToday: boolean;
  /** Activity for the last 7 days, oldest→today (length 7). */
  last7: boolean[];
  /** Distinct active days total. */
  activeDays: number;
}

export function computeStreak(
  timestamps: readonly number[],
  nowMs: number,
): StreakInfo {
  const days = new Set(timestamps.map(dayIndex));
  const today = dayIndex(nowMs);
  const practicedToday = days.has(today);

  // current streak: start from today if active, else yesterday
  let current = 0;
  let cursor = practicedToday ? today : days.has(today - 1) ? today - 1 : null;
  if (cursor !== null) {
    while (days.has(cursor)) {
      current++;
      cursor--;
    }
  }

  // longest run across all active days
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of [...days].sort((a, b) => a - b)) {
    run = prev !== null && d === prev + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }

  const last7: boolean[] = [];
  for (let i = 6; i >= 0; i--) last7.push(days.has(today - i));

  return { current, longest, practicedToday, last7, activeDays: days.size };
}
