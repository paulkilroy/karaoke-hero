// Shared tinted card used across the bucket menus.

import { type CSSProperties } from "react";

export function DrillCard({
  icon,
  title,
  desc,
  tint,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  tint?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="mode-card"
      style={tint ? ({ "--tint": tint } as CSSProperties) : undefined}
      onClick={onClick}
    >
      <span className="mode-card__icon">{icon}</span>
      <span className="mode-card__title">{title}</span>
      <span className="mode-card__desc">{desc}</span>
    </button>
  );
}
