// Home: a daily practice journey — see progress → warm up → drill → sing.

import { type CSSProperties } from "react";
import { type StreakInfo } from "../engine/streak";
import { StreakCard } from "./StreakCard";
import { LevelCard } from "./LevelCard";

export type NavTarget = "progress" | "warmup" | "practice" | "sing";

export function Home({
  onNavigate,
  streak,
}: {
  onNavigate: (target: NavTarget) => void;
  streak: StreakInfo;
}) {
  return (
    <div className="home">
      <StreakCard streak={streak} />

      <LevelCard onOpen={() => onNavigate("progress")} />

      <JourneyCard
        icon="🫧"
        tint="#38bdf8"
        title="Warm Up"
        desc="SOVT & sirens to ready your voice"
        onClick={() => onNavigate("warmup")}
      />
      <JourneyCard
        icon="🎯"
        tint="#fbbf24"
        title="Daily Drills"
        desc="Pitch accuracy + range training"
        onClick={() => onNavigate("practice")}
      />
      <JourneyCard
        icon="🎤"
        tint="#a78bfa"
        title="Karaoke Hero"
        desc="Sing songs, or a Sing-Off vs a friend"
        onClick={() => onNavigate("sing")}
      />
    </div>
  );
}

function JourneyCard({
  icon,
  tint,
  title,
  desc,
  onClick,
}: {
  icon: string;
  tint: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      className="journey-card"
      style={{ "--tint": tint } as CSSProperties}
      onClick={onClick}
    >
      <span className="journey-card__icon">{icon}</span>
      <span className="journey-card__body">
        <span className="journey-card__title">{title}</span>
        <span className="journey-card__desc">{desc}</span>
      </span>
      <span className="journey-card__chev">›</span>
    </button>
  );
}
