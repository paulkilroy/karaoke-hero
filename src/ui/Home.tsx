// Home: streak hero + mode picker.

import { type CSSProperties } from "react";
import { type StreakInfo } from "../engine/streak";
import { StreakCard } from "./StreakCard";

export type Mode = "practice" | "songs" | "range" | "progress" | "versus";

interface Tile {
  mode: Mode;
  icon: string;
  title: string;
  desc: string;
  tint: string;
}

const TILES: Tile[] = [
  {
    mode: "songs",
    icon: "🎵",
    title: "Songs",
    desc: "Sing along, Guitar-Hero style.",
    tint: "#a78bfa",
  },
  {
    mode: "practice",
    icon: "🎯",
    title: "Practice",
    desc: "Pitch-match drill, tuned to you.",
    tint: "#38bdf8",
  },
  {
    mode: "range",
    icon: "🎚",
    title: "Range & Warm-ups",
    desc: "Test & extend your range.",
    tint: "#fbbf24",
  },
  {
    mode: "progress",
    icon: "📈",
    title: "Progress",
    desc: "Level, range & accuracy.",
    tint: "#34d399",
  },
  {
    mode: "versus",
    icon: "⚔️",
    title: "Sing-Off",
    desc: "Battle a friend, live or online.",
    tint: "#fb7185",
  },
];

export function Home({
  onPick,
  streak,
}: {
  onPick: (mode: Mode) => void;
  streak: StreakInfo;
}) {
  return (
    <div className="home">
      <StreakCard streak={streak} />
      <p className="home__lead">Pick a mode</p>
      <div className="modes modes--grid">
        {TILES.map((t) => (
          <button
            key={t.mode}
            className="mode-card"
            style={{ "--tint": t.tint } as CSSProperties}
            onClick={() => onPick(t.mode)}
          >
            <span className="mode-card__icon">{t.icon}</span>
            <span className="mode-card__title">{t.title}</span>
            <span className="mode-card__desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
