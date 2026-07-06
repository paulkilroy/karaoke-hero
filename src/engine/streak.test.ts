import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";

// Build a local-midnight timestamp for a day offset from a fixed anchor.
const anchor = new Date(2026, 5, 15, 12, 0, 0).getTime(); // noon, local
const day = (offset: number, hour = 10) => {
  const d = new Date(2026, 5, 15 + offset, hour, 0, 0);
  return d.getTime();
};

describe("computeStreak", () => {
  it("is empty with no activity", () => {
    const s = computeStreak([], anchor);
    expect(s).toMatchObject({ current: 0, longest: 0, practicedToday: false });
    expect(s.last7).toEqual([false, false, false, false, false, false, false]);
  });

  it("counts consecutive days including today", () => {
    const ts = [day(0), day(-1), day(-2)];
    const s = computeStreak(ts, anchor);
    expect(s.current).toBe(3);
    expect(s.practicedToday).toBe(true);
    expect(s.last7[6]).toBe(true); // today
  });

  it("stays alive if you practised yesterday but not yet today", () => {
    const ts = [day(-1), day(-2)];
    const s = computeStreak(ts, anchor);
    expect(s.current).toBe(2);
    expect(s.practicedToday).toBe(false);
  });

  it("breaks when a day is missed", () => {
    const ts = [day(0), day(-1), day(-3), day(-4)]; // gap at -2
    const s = computeStreak(ts, anchor);
    expect(s.current).toBe(2);
    expect(s.longest).toBe(2);
  });

  it("dedupes multiple sessions on one day", () => {
    const ts = [day(0, 9), day(0, 14), day(0, 20)];
    const s = computeStreak(ts, anchor);
    expect(s.current).toBe(1);
    expect(s.activeDays).toBe(1);
  });

  it("tracks the longest run separately from current", () => {
    // a 4-day run last week, then a 1-day today
    const ts = [day(-8), day(-7), day(-6), day(-5), day(0)];
    const s = computeStreak(ts, anchor);
    expect(s.longest).toBe(4);
    expect(s.current).toBe(1);
  });
});
